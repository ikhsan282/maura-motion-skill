#!/usr/bin/env python3
"""Maura Motion narration: story.json lines -> build/narration.wav + build/timeline.json.

Voices run offline:
  Kokoro-82M (Apache-2.0) via kokoro-onnx; Indonesian is spoken by feeding espeak-ng 'id' phonemes.
  Piper (MIT) id_ID-news_tts-medium as an alternative Indonesian voice.

  python tts.py <projectDir> [--voice id-m] [--speed 1.0] [--force]
"""
import json, os, sys, re, hashlib, argparse
import numpy as np
import soundfile as sf

MODELS = os.environ.get('AM_MODELS', os.path.join(os.path.expanduser('~'), '.cache', 'maura-motion', 'models'))
SR = 24000

# Default voice per language — ganti di sini kalau mau suara lain jadi standar.
# el-id-f = Alice (ElevenLabs, natural, butuh API key). Alternatif gratis offline: id-f.
DEFAULT_VOICE = {'id': 'el-id-m', 'en': 'en-m'}

VOICES = {
    # ElevenLabs (cloud, natural) — needs ELEVENLABS_API_KEY in ~/.hermes/elevenlabs.env
    'el-id-m': {'engine': 'elevenlabs', 'voice': 'JBFqnCBsd6RMkjVDRZzb', 'model': 'eleven_multilingual_v2', 'desc': 'George, pria hangat storyteller (ElevenLabs)'},
    'el-id-f': {'engine': 'elevenlabs', 'voice': 'Xb7hH8MSUJpSbSDYk0k2', 'model': 'eleven_multilingual_v2', 'desc': 'Wanita Indonesia, natural (ElevenLabs)'},
    # Indonesian (espeak 'id' phonemes into Kokoro voices that pronounce them most clearly)
    'id-m':  {'engine': 'kokoro', 'voice': 'hm_omega', 'phon': 'id', 'speed': 1.12,  'desc': 'Pria, hangat & jelas (default)'},
    'id-f':  {'engine': 'kokoro', 'voice': 'hf_beta',  'phon': 'id', 'speed': 1.1,  'desc': 'Wanita, jernih'},
    'id-m2': {'engine': 'kokoro', 'voice': 'em_alex',  'phon': 'id', 'speed': 1.08,  'desc': 'Pria, lebih berat'},
    'id-m3': {'engine': 'kokoro', 'voice': 'hm_psi',   'phon': 'id', 'speed': 1.1,  'desc': 'Pria, muda'},
    'id-f2': {'engine': 'kokoro', 'voice': 'hf_alpha', 'phon': 'id', 'speed': 1.08,  'desc': 'Wanita, lembut'},
    'id-news': {'engine': 'piper', 'model': 'id_ID-news_tts-medium', 'speed': 1.0, 'desc': 'Pria, gaya penyiar berita (Piper)'},
    # English
    'en-m':  {'engine': 'kokoro', 'voice': 'am_michael', 'lang': 'en-us', 'speed': 1.0, 'desc': 'US male'},
    'en-f':  {'engine': 'kokoro', 'voice': 'af_heart',   'lang': 'en-us', 'speed': 1.0, 'desc': 'US female'},
    'en-story': {'engine': 'kokoro', 'voice': 'bm_fable', 'lang': 'en-gb', 'speed': 1.0, 'desc': 'UK storyteller male'},
    'en-gb-m': {'engine': 'kokoro', 'voice': 'bm_george', 'lang': 'en-gb', 'speed': 1.0, 'desc': 'UK male, deep'},
    'en-gb-f': {'engine': 'kokoro', 'voice': 'bf_emma',  'lang': 'en-gb', 'speed': 1.0, 'desc': 'UK female'},
    'en-deep': {'engine': 'kokoro', 'voice': 'am_onyx',  'lang': 'en-us', 'speed': 0.95, 'desc': 'US male, deep trailer voice'},
}

# ---------- Indonesian text normalisation ----------
SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas']
def terbilang(n):
    n = int(n)
    if n < 0: return 'minus ' + terbilang(-n)
    if n < 12: return SATUAN[n] if n else 'nol'
    if n < 20: return SATUAN[n - 10] + ' belas'
    if n < 100: return (SATUAN[n // 10] + ' puluh ' + (SATUAN[n % 10] if n % 10 else '')).strip()
    if n < 200: return ('seratus ' + (terbilang(n - 100) if n > 100 else '')).strip()
    if n < 1000: return (SATUAN[n // 100] + ' ratus ' + (terbilang(n % 100) if n % 100 else '')).strip()
    if n < 2000: return ('seribu ' + (terbilang(n - 1000) if n > 1000 else '')).strip()
    for div, word in [(10**12, 'triliun'), (10**9, 'miliar'), (10**6, 'juta'), (1000, 'ribu')]:
        if n >= div:
            return (terbilang(n // div) + ' ' + word + ' ' + (terbilang(n % div) if n % div else '')).strip()
    return str(n)

def normalize_id(s):
    s = re.sub(r'(\d+)\s?%', lambda m: terbilang(m.group(1)) + ' persen', s)
    s = re.sub(r'(\d+)\.(\d{3})', r'\1\2', s)
    s = re.sub(r'\d+', lambda m: terbilang(m.group(0)), s)
    s = s.replace('&', ' dan ').replace('—', ', ').replace('–', ', ').replace('…', '...')
    return s

def normalize_en(s):
    return s.replace('—', ', ').replace('–', ', ')

# ---------- engines ----------
_kokoro = None
def kokoro():
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro
        _kokoro = Kokoro(os.path.join(MODELS, 'kokoro-v1.0.onnx'), os.path.join(MODELS, 'voices-v1.0.bin'))
    return _kokoro

_tok = None
def phonemize(text, lang):
    global _tok
    if _tok is None:
        from kokoro_onnx.tokenizer import Tokenizer
        _tok = Tokenizer()
    return _tok.phonemize(text, lang=lang)

def synth_kokoro(text, v, speed):
    k = kokoro()
    if v.get('phon'):
        ph = phonemize(text, v['phon'])
        audio, sr = k.create(ph, voice=v['voice'], speed=speed, is_phonemes=True)
    else:
        audio, sr = k.create(text, voice=v['voice'], speed=speed, lang=v.get('lang', 'en-us'))
    return np.asarray(audio, dtype=np.float32), sr

_piper = {}
def synth_piper(text, v, speed):
    from piper import PiperVoice
    from piper.config import SynthesisConfig
    name = v['model']
    if name not in _piper:
        _piper[name] = PiperVoice.load(os.path.join(MODELS, name + '.onnx'))
    pv = _piper[name]
    cfg = SynthesisConfig(length_scale=1.0 / speed)
    chunks = [np.asarray(c.audio_float_array, dtype=np.float32) for c in pv.synthesize(text, syn_config=cfg)]
    a = np.concatenate(chunks) if chunks else np.zeros(1000, np.float32)
    return a, pv.config.sample_rate

_eleven = None
def synth_elevenlabs(text, v, speed):
    import urllib.request
    key = None
    for p in [os.path.expanduser('~/.hermes/elevenlabs.env'), os.path.expanduser('~/.hermes/elevenlabs.env')]:
        if os.path.exists(p):
            for ln in open(p):
                if ln.strip().startswith('ELEVENLABS_API_KEY'):
                    key = ln.split('=', 1)[1].strip().strip('"').strip("'")
    key = key or os.environ.get('ELEVENLABS_API_KEY')
    if not key: sys.exit('ElevenLabs voice needs ELEVENLABS_API_KEY in ~/.hermes/elevenlabs.env')
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice']}"
    body = json.dumps({'text': text, 'model_id': v.get('model', 'eleven_multilingual_v2')}).encode()
    req = urllib.request.Request(url, data=body, headers={'xi-api-key': key, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
    except Exception as e:
        sys.exit(f'ElevenLabs error: {e}')
    import io
    try:
        a, sr = sf.read(io.BytesIO(data))
    except Exception:
        # ElevenLabs returns mp3 by default — decode via ffmpeg
        import subprocess, tempfile
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f: f.write(data); mp = f.name
        wp = mp + '.wav'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', mp, '-ar', str(SR), '-ac', '1', wp], check=True)
        a, sr = sf.read(wp)
        os.unlink(mp); os.unlink(wp)
    if getattr(a, 'ndim', 1) > 1: a = a.mean(axis=1)
    return np.asarray(a, dtype=np.float32), sr

def resample(a, sr, to=SR):
    if sr == to: return a
    from scipy.signal import resample_poly
    from math import gcd
    g = gcd(sr, to)
    return resample_poly(a, to // g, sr // g).astype(np.float32)

def trim(a, thr=0.012, pad=0.03):
    idx = np.where(np.abs(a) > thr)[0]
    if len(idx) == 0: return a
    s = max(0, idx[0] - int(pad * SR)); e = min(len(a), idx[-1] + int(pad * SR * 2))
    return a[s:e]

VOWELS = re.compile(r'[aiueoéèyAIUEOÉÈY]+')
def word_weights(words):
    w = []
    for wd in words:
        core = re.sub(r'[^\w]', '', wd)
        syl = max(1, len(VOWELS.findall(core)))
        extra = 0.9 if re.search(r'[.!?…]$', wd) else (0.5 if re.search(r'[,;:—]$', wd) else 0)
        w.append((syl + 0.35, extra))
    return w

def time_words(words, start, dur):
    ww = word_weights(words)
    total = sum(a + b for a, b in ww)
    t = start; out = []
    for wd, (a, b) in zip(words, ww):
        d = dur * a / total
        out.append({'w': wd, 'start': round(t, 3), 'end': round(t + d, 3)})
        t += d + dur * b / total
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project')
    ap.add_argument('--voice')
    ap.add_argument('--speed', type=float)
    ap.add_argument('--force', action='store_true')
    a = ap.parse_args()
    proj = os.path.abspath(a.project)
    story = json.load(open(os.path.join(proj, 'story.json'), encoding='utf-8'))
    vname = a.voice or story.get('voice') or DEFAULT_VOICE.get(story.get('lang', 'id'), 'id-m')
    if vname not in VOICES: sys.exit(f'unknown voice {vname}. choose: {", ".join(VOICES)}')
    v = VOICES[vname]
    speed = a.speed or story.get('speed') or v.get('speed', 1.0)
    lang = story.get('lang', 'id')
    lead = float(story.get('lead', 0.3)); tail = float(story.get('tail', 1.0))
    default_pause = float(story.get('pause', 0.2))
    max_dur = float(story.get('maxDuration', os.environ.get('AM_MAX_DURATION', 20)))
    build = os.path.join(proj, 'build'); os.makedirs(build, exist_ok=True)
    key = hashlib.sha1(json.dumps([story['lines'], vname, speed, lead, tail, default_pause], ensure_ascii=False).encode()).hexdigest()[:16]
    tl_path = os.path.join(build, 'timeline.json')
    if not a.force and os.path.exists(tl_path):
        try:
            old = json.load(open(tl_path))
            if old.get('key') == key and os.path.exists(os.path.join(build, 'narration.wav')):
                if old['duration'] > max_dur + 0.01: sys.exit(f"!! TOO LONG: {old['duration']:.1f}s > {max_dur:.0f}s limit.")
                print('narration up to date'); return
        except Exception: pass

    # one narrator at a time on this machine (the voice model is large)
    lockf = None
    try:
        import fcntl, tempfile
        lockf = open(os.path.join(tempfile.gettempdir(), 'maura-motion-tts.lock'), 'w'); fcntl.flock(lockf, fcntl.LOCK_EX)
    except Exception: pass
    pieces = [np.zeros(int(lead * SR), np.float32)]
    t = lead; lines = []
    for i, line in enumerate(story['lines']):
        text = line['text']
        say = line.get('say', text)
        say = normalize_id(say) if lang == 'id' else normalize_en(say)
        sp = speed * float(line.get('speed', 1.0))
        if v['engine'] == 'kokoro': audio, sr = synth_kokoro(say, v, sp)
        elif v['engine'] == 'elevenlabs': audio, sr = synth_elevenlabs(say, v, sp)
        else: audio, sr = synth_piper(say, v, sp)
        audio = trim(resample(audio, sr))
        dur = len(audio) / SR
        words = text.split()
        lines.append({'id': line.get('id', f'l{i}'), 'text': text, 'start': round(t, 3), 'end': round(t + dur, 3), 'words': time_words(words, t, dur)})
        pause = float(line.get('pause', default_pause))
        pieces += [audio, np.zeros(int(pause * SR), np.float32)]
        t += dur + pause
        print(f'  [{i+1}/{len(story["lines"])}] {dur:5.2f}s  {text[:70]}')
    narr = np.concatenate(pieces)
    narr = narr / max(1e-6, np.max(np.abs(narr))) * 0.89
    duration = round(t + tail, 3)
    narr = np.concatenate([narr, np.zeros(max(0, int(duration * SR) - len(narr)), np.float32)])
    sf.write(os.path.join(build, 'narration.wav'), narr, SR)
    json.dump({'key': key, 'voice': vname, 'duration': duration, 'lead': lead, 'lines': lines}, open(tl_path, 'w'), ensure_ascii=False, indent=1)
    print(f'narration: {duration:.1f}s, voice {vname} ({v["desc"]})')
    if duration > max_dur + 0.01:
        sys.exit(f'!! TOO LONG: {duration:.1f}s > {max_dur:.0f}s limit. Cut words/lines (or raise "speed" up to 1.2) and run again.')

if __name__ == '__main__':
    main()
