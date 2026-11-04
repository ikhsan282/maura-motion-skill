#!/usr/bin/env python3
"""Maura Motion mix: narration + music (ducked under the voice) + sound effects -> build/mix.wav at -14 LUFS.

  python mix.py <projectDir> [--music-db -16] [--lufs -14] [--no-music] [--keep]
"""
import json, os, sys, argparse, subprocess, re, shutil
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
from synth import SR, lp
import sfx as SFX

def load(path, mono=False):
    a, sr = sf.read(path, dtype='float32', always_2d=True)
    a = a.T
    if sr != SR:
        from math import gcd
        g = gcd(sr, SR); a = np.stack([resample_poly(c, SR // g, sr // g) for c in a]).astype(np.float32)
    if mono: return a.mean(0)
    if a.shape[0] == 1: a = np.vstack([a, a])
    return a

def env_follow(x, attack=0.03, release=0.35):
    a = np.abs(x)
    k = int(0.01 * SR); a = np.convolve(a, np.ones(k) / k, mode='same')  # 10 ms RMS-ish
    out = np.zeros_like(a); ga = np.exp(-1 / (attack * SR / k)); gr = np.exp(-1 / (release * SR / k))
    # run at 100 Hz control rate for speed
    ctl = a[::k]; o = np.zeros_like(ctl); v = 0.0
    for i, s in enumerate(ctl):
        g = ga if s > v else gr
        v = g * v + (1 - g) * s; o[i] = v
    return np.interp(np.arange(len(a)), np.arange(len(o)) * k, o).astype(np.float32)

def fallback_timeline(story):
    t = float(story.get('lead', 0.4))
    default_pause = float(story.get('pause', 0.35))
    lines = []
    for i, l in enumerate(story.get('lines', [])):
        words = l.get('text', '').split()
        dur = max(1.2, len(words) / 2.45)
        lines.append({'id': l.get('id', f'l{i}'), 'text': l.get('text', ''), 'start': round(t, 3), 'end': round(t + dur, 3)})
        t += dur + float(l.get('pause', default_pause))
    return {'duration': round(t + float(story.get('tail', 1.6)), 3), 'lines': lines}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project')
    ap.add_argument('--music-db', type=float)
    ap.add_argument('--lufs', type=float, default=-14.0)
    ap.add_argument('--no-music', action='store_true')
    ap.add_argument('--keep', action='store_true')
    a = ap.parse_args()
    proj = os.path.abspath(a.project); B = os.path.join(proj, 'build')
    os.makedirs(B, exist_ok=True)
    story = json.load(open(os.path.join(proj, 'story.json'), encoding='utf-8'))
    tl_path = os.path.join(B, 'timeline.json')
    tl = json.load(open(tl_path, encoding='utf-8')) if os.path.exists(tl_path) else fallback_timeline(story)
    dur = float(story.get('duration') or tl['duration']); n = int(dur * SR)
    out = np.zeros((2, n), np.float32)
    narr = None
    if os.path.exists(os.path.join(B, 'narration.wav')) and story.get('voice') != 'none':
        narr = load(os.path.join(B, 'narration.wav'), mono=True)[:n]
        narr = np.pad(narr, (0, n - len(narr)))
        # gentle voice EQ: trim mud, add presence
        from synth import hp, bp
        narr = hp(narr, 85) + 0.12 * bp(narr, 2500, 6000)
        out += np.stack([narr, narr])
    m = story.get('music', {}); m = {'preset': m} if isinstance(m, str) else m
    music_db = a.music_db if a.music_db is not None else m.get('db', -17.0)
    if not a.no_music and os.path.exists(os.path.join(B, 'music.wav')) and m.get('preset') != 'none':
        mus = load(os.path.join(B, 'music.wav'))[:, :n]
        mus = np.pad(mus, ((0, 0), (0, n - mus.shape[1])))
        g = 10 ** (music_db / 20)
        if narr is not None:
            e = env_follow(narr); e = e / (np.percentile(e, 98) or 1)
            duck = 1 - 0.55 * np.clip(e, 0, 1)  # about -7 dB under speech
            # lift music when nobody speaks (intro, gaps, outro)
            mus = mus * duck * g * 1.0
        else:
            mus = mus * g * 2.2
        out += mus
    fx_path = os.path.join(B, 'sfx.json')
    events = json.load(open(fx_path, encoding='utf-8')) if os.path.exists(fx_path) else []
    for ev in events:
        try:
            s = SFX.make(ev['type'], float(ev.get('pitch') or 1.0))
        except ValueError as e:
            print('!!', e); continue
        gain = float(ev.get('gain') if ev.get('gain') is not None else 0.5)
        i = int(float(ev['t']) * SR)
        if i >= n or i < 0: continue
        s = s[: n - i] * gain
        pan = float(ev.get('pan') or 0)
        out[0, i:i + len(s)] += s * np.cos((pan + 1) * np.pi / 4) * 1.41
        out[1, i:i + len(s)] += s * np.sin((pan + 1) * np.pi / 4) * 1.41
    # soft limit, then loudness-normalise with ffmpeg (two-pass loudnorm)
    peak = float(np.max(np.abs(out)))
    dst = os.path.join(B, 'mix.wav')
    if peak < 1e-6:
        sf.write(dst, out.T, SR)
        print(f'mix: {dur:.1f}s (silent)')
        return
    out = np.tanh(out / peak * 1.2) / np.tanh(1.2) * 0.9
    raw = os.path.join(B, 'mix_raw.wav'); sf.write(raw, out.T, SR)
    p1 = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', f'loudnorm=I={a.lufs}:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    matches = re.findall(r'\{[^{}]*\}', p1.stderr or '')
    js = json.loads(matches[-1]) if matches else None
    if js and js.get('input_i') not in (None, '-inf', 'inf'):
        af = (f"loudnorm=I={a.lufs}:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
              f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), dst], check=True)
    else:
        shutil.copyfile(raw, dst)
    if not a.keep and os.path.exists(raw):
        os.remove(raw)
    print(f'mix: {dur:.1f}s, {len(events)} sfx, music {"off" if a.no_music else f"{music_db} dB"}, -> {a.lufs} LUFS')

if __name__ == '__main__':
    main()
