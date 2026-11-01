#!/usr/bin/env python3
"""Word aligner for kinetic-type styles (Maura Motion).

tts.py estimates word times from syllable counts. Kinetic type needs the real ones, so this listens to
build/narration.wav with faster-whisper (offline, model 'small' or whatever is cached) line by line and
writes build/words.json: { key, lines: { <id>: [{w, start, end}, ...] } } with the SAME words as the
caption text. The kit loads it in setup (K.useAlignedWords) and falls back to the estimate if it is
missing or stale (key mismatch after the lines change).

  python3 styles/kinetic-type/align.py <demoDir> [--model small]
"""
import json, os, re, sys, difflib, argparse
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
SK = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(SK, 'audio'))
try:
    from tts import normalize_id, normalize_en  # same normalisation the narrator used
except Exception:  # pragma: no cover
    normalize_id = normalize_en = lambda s: s


def norm(s):
    return re.sub(r'[^0-9a-z]', '', s.lower().replace('é', 'e').replace('è', 'e'))


def resample16(a, sr):
    if sr == 16000:
        return a.astype(np.float32)
    from scipy.signal import resample_poly
    from math import gcd
    g = gcd(sr, 16000)
    return resample_poly(a, 16000 // g, sr // g).astype(np.float32)


def char_times(words):
    """whisper words -> (string, per-char time)"""
    s, ts = [], []
    for w in words:
        n = norm(w['w'])
        if not n:
            continue
        for k, ch in enumerate(n):
            s.append(ch)
            ts.append(w['start'] + (w['end'] - w['start']) * k / max(1, len(n)))
    return ''.join(s), ts


def align_tokens(tokens, wwords, t0, t1):
    """Return start time for each token (list of str) given whisper words with times."""
    ws, wt = char_times(wwords)
    ts_str = ''.join(norm(t) for t in tokens)
    # start index of each token in the token string
    idx, k = [], 0
    for t in tokens:
        idx.append(k)
        k += len(norm(t))
    m = [None] * len(ts_str)
    sm = difflib.SequenceMatcher(None, ts_str, ws, autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for j in range(n):
            m[a + j] = wt[b + j]
    starts = []
    for i, t in enumerate(tokens):
        n = len(norm(t))
        got = [m[idx[i] + j] for j in range(n) if m[idx[i] + j] is not None]
        if got:
            # first matched char, corrected back by the chars before it
            j0 = next(j for j in range(n) if m[idx[i] + j] is not None)
            starts.append(max(t0, got[0] - j0 * 0.055))
        else:
            starts.append(None)
    # interpolate gaps
    known = [(i, s) for i, s in enumerate(starts) if s is not None]
    if not known:
        return None
    for i in range(len(starts)):
        if starts[i] is None:
            prev = max([k for k in known if k[0] < i], default=None, key=lambda x: x[0])
            nxt = min([k for k in known if k[0] > i], default=None, key=lambda x: x[0])
            if prev and nxt:
                starts[i] = prev[1] + (nxt[1] - prev[1]) * (i - prev[0]) / (nxt[0] - prev[0])
            elif prev:
                starts[i] = min(t1, prev[1] + 0.3 * (i - prev[0]))
            else:
                starts[i] = max(t0, nxt[1] - 0.3 * (nxt[0] - i))
    # monotonic
    for i in range(1, len(starts)):
        starts[i] = max(starts[i], starts[i - 1] + 0.04)
    return starts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project')
    ap.add_argument('--model', default=os.environ.get('AM_WHISPER', 'small'))
    a = ap.parse_args()
    proj = os.path.abspath(a.project)
    story = json.load(open(os.path.join(proj, 'story.json'), encoding='utf-8'))
    tl = json.load(open(os.path.join(proj, 'build', 'timeline.json'), encoding='utf-8'))
    audio, sr = sf.read(os.path.join(proj, 'build', 'narration.wav'))
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    from faster_whisper import WhisperModel
    model = WhisperModel(a.model, device='cpu', compute_type='int8', cpu_threads=2)
    lang = story.get('lang', 'id')
    nz = normalize_id if lang == 'id' else normalize_en
    out = {'key': tl.get('key'), 'lines': {}}
    src = {l.get('id'): l for l in story['lines']}
    for line in tl['lines']:
        s0, s1 = max(0, line['start'] - 0.12), line['end'] + 0.12
        seg = resample16(audio[int(s0 * sr):int(s1 * sr)], sr)
        say = src.get(line['id'], {}).get('say', line['text'])
        spoken = nz(say).split()
        segs, _ = model.transcribe(seg, language=lang if lang in ('id', 'en') else None, word_timestamps=True,
                                   initial_prompt=nz(say), beam_size=5, condition_on_previous_text=False, vad_filter=False)
        ww = [{'w': w.word, 'start': s0 + w.start, 'end': s0 + w.end} for s in segs for w in (s.words or [])]
        st = align_tokens(spoken, ww, line['start'], line['end'])
        text_words = [w['w'] for w in line['words']]
        if st is None:
            out['lines'][line['id']] = line['words']
            print(f"  {line['id']}: no alignment, kept estimate")
            continue
        if len(spoken) == len(text_words):
            starts = st
        else:  # map by relative character position
            sc = np.cumsum([0] + [len(norm(x)) for x in spoken])
            tc = np.cumsum([0] + [len(norm(x)) for x in text_words])
            starts = []
            for i in range(len(text_words)):
                f = tc[i] / max(1, tc[-1]) * sc[-1]
                j = int(np.searchsorted(sc, f, side='right') - 1)
                j = max(0, min(len(spoken) - 1, j))
                starts.append(st[j])
        words = []
        for i, w in enumerate(text_words):
            e = starts[i + 1] if i + 1 < len(starts) else line['end']
            words.append({'w': w, 'start': round(float(starts[i]), 3), 'end': round(float(max(e, starts[i] + 0.05)), 3)})
        out['lines'][line['id']] = words
        drift = np.mean([abs(a['start'] - b['start']) for a, b in zip(words, line['words'])])
        print(f"  {line['id']:<10} {len(words):2d} words, mean shift vs estimate {drift * 1000:4.0f} ms  | heard: {' '.join(x['w'].strip() for x in ww)[:70]}")
    json.dump(out, open(os.path.join(proj, 'build', 'words.json'), 'w'), ensure_ascii=False, indent=1)
    print('aligned ->', os.path.join(proj, 'build', 'words.json'))


if __name__ == '__main__':
    main()
