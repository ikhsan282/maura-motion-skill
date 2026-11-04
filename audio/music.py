#!/usr/bin/env python3
"""Maura Motion score: composes a soft original soundtrack for each short, offline, in numpy.

  python music.py <projectDir> [--preset gamelan] [--seed 3]

The preset comes from story.json "music" (string or {"preset":..,"bpm":..,"key":..,"gain":..}).
Arrangement follows the narration: sparse under the hook, full band in the body, a closing
chord when the last line ends. Writes build/music.wav (44.1 kHz stereo).
"""
import json, os, sys, argparse
import numpy as np
import soundfile as sf
from synth import (SR, midi, pluck, epiano, piano, bell, gong, pad, lead, flute, bass, upright, drum,
                   vinyl, noise_bed, reverb, wobble, bitcrush, pan2, lp, hp)

# ---------- scales in cents ----------
SCALES = {
    'major': [0, 200, 400, 500, 700, 900, 1100], 'minor': [0, 200, 300, 500, 700, 800, 1000],
    'dorian': [0, 200, 300, 500, 700, 900, 1000], 'mixolydian': [0, 200, 400, 500, 700, 900, 1000],
    'lydian': [0, 200, 400, 600, 700, 900, 1100], 'harmonic': [0, 200, 300, 500, 700, 800, 1100],
    'phrygdom': [0, 100, 400, 500, 700, 800, 1000], 'penta': [0, 200, 400, 700, 900], 'mpenta': [0, 300, 500, 700, 1000],
    'hirajoshi': [0, 200, 300, 700, 800], 'insen': [0, 100, 500, 700, 1000], 'blues': [0, 300, 500, 600, 700, 1000],
    'slendro': [0, 240, 480, 720, 960], 'pelog': [0, 120, 270, 540, 670, 785, 950],
}
NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}

class Key:
    def __init__(self, root='C', scale='major', octave=4):
        self.root_midi = 12 * (octave + 1) + NOTE[root]
        self.cents = SCALES[scale]
    def hz(self, deg, oct=0):
        L = len(self.cents); o, d = divmod(deg, L)
        return midi(self.root_midi) * 2 ** ((self.cents[d] + 1200 * (o + oct)) / 1200)
    def chord(self, deg, size=3, oct=0):
        return [self.hz(deg + 2 * i, oct) for i in range(size)]

class Score:
    def __init__(self, dur, bpm, beats=4, swing=0.0):
        self.dur = dur; self.bpm = bpm; self.beats = beats; self.swing = swing
        self.beat = 60.0 / bpm; self.bar = self.beat * beats
        self.n = int((dur + 4) * SR)
        self.dry = np.zeros((2, self.n), np.float32); self.send = np.zeros((2, self.n), np.float32)
    def at(self, bar, beat=0.0):
        b = beat
        if self.swing and (b * 2) % 2 == 1:  # off-beat 8ths swing
            b += self.swing * 0.5
        return bar * self.bar + b * self.beat
    def add(self, t, mono, gain=1.0, pan=0.0, rev=0.2):
        if t >= self.dur + 3 or mono is None: return
        i = int(t * SR); m = mono[: max(0, self.n - i)]
        if i < 0 or len(m) == 0: return
        st = pan2(m * gain, pan)
        self.dry[:, i:i + len(m)] += st * (1 - rev * 0.5)
        self.send[:, i:i + len(m)] += st * rev
    def render(self, rt60=2.2, bright=0.5):
        wet = reverb(self.send, mix=1.0, rt60=rt60, bright=bright)
        out = self.dry + wet * 0.55
        return out[:, : int(self.dur * SR)]

def section_fn(cues, dur):
    lines = cues.get('lines', [])
    hook_end = lines[0]['end'] if lines else 3.0
    last_start = lines[-1]['start'] if lines else dur - 3
    narr_end = lines[-1]['end'] if lines else dur - 1.5
    def sec(t):
        if t < hook_end - 0.2: return 'intro'
        if t >= last_start: return 'outro'
        return 'main'
    return sec, hook_end, last_start, narr_end

def motif(rng, key, n_beats=8, density=0.55, lo=0, hi=9, start=4):
    """Stepwise melodic phrase: list of (beat, deg, len_beats)."""
    notes = []; b = 0.0; deg = start
    while b < n_beats - 0.01:
        L = rng.choice([0.5, 0.5, 1, 1, 1, 1.5, 2]) if rng.random() < density else rng.choice([1, 2])
        L = min(L, n_beats - b)
        if rng.random() < 0.82:
            step = rng.choice([-2, -1, -1, 1, 1, 2, 0])
            deg = int(np.clip(deg + step, lo, hi))
            notes.append((b, deg, L))
        b += L
    return notes

def end_hit(S, t, chord_hz, inst, gain=0.5, rev=0.5):
    for i, f in enumerate(chord_hz):
        S.add(t + i * 0.015, inst(f, 4.0, 0.6), gain, (i - 1) * 0.3, rev)

# ---------- presets ----------
def p_gamelan(S, key, cues, rng, a):
    sec, hook_end, last, nend = section_fn(cues, S.dur)
    beats_total = int(S.dur / S.beat) + 2
    bal = [2, 1, 2, 3, 2, 1, 0, 4, 3, 2, 3, 4, 3, 2, 1, 0]  # balungan contour (scale degrees)
    for k in range(beats_total):
        t = k * S.beat; s = sec(t)
        d = bal[k % 16] + (5 if (k // 16) % 2 else 0) * 0
        S.add(t, bell(key.hz(d, 0), 2.2, 0.55 if s == 'intro' else 0.7, 'saron'), 0.42, -0.2, 0.3)
        if s != 'intro':  # bonang elaborates at double speed (imbal)
            for h in range(2):
                dd = d + [0, 2][h] if rng.random() < 0.7 else d + rng.integers(-1, 3)
                S.add(t + h * S.beat / 2, bell(key.hz(int(dd), 1), 1.0, 0.45, 'bonang'), 0.22, 0.3, 0.3)
        if k % 4 == 2: S.add(t, bell(key.hz(d, -1), 2.5, 0.6, 'bonang'), 0.3, 0.1, 0.35)  # kenong
        if k % 16 == 0: S.add(t, gong(key.hz(0, -3), 6, 0.9), 0.75, 0, 0.35)
        if s == 'main':  # kendang
            if k % 2 == 0: S.add(t, drum('kendang_lo', 0.8), 0.45, -0.1, 0.12)
            if rng.random() < 0.6: S.add(t + S.beat * 0.5, drum('kendang_hi', 0.6), 0.25, 0.15, 0.12)
            if k % 8 == 7: S.add(t + S.beat * 0.75, drum('kendang_hi', 0.7), 0.25, 0.15, 0.12)
    S.add(nend + 0.15, gong(key.hz(0, -3), 6, 1.0), 0.9, 0, 0.45)
    S.add(nend + 0.15, bell(key.hz(0, 0), 3, 0.7, 'saron'), 0.4, 0, 0.4)
    return dict(rt60=2.6, bright=0.45)

CHORDS = {
    'pop': [0, 4, 5, 3], 'sad': [5, 3, 0, 4], 'epic': [0, 5, 2, 6], 'minor_epic': [0, 5, 2, 6], 'jazz': [1, 4, 0, 5],
    'dream': [0, 1, 3, 0], 'loop2': [0, 3], 'mystery': [0, 5, 0, 6],
}

def bars_iter(S):
    nb = int(np.ceil(S.dur / S.bar)) + 1
    for i in range(nb): yield i, i * S.bar

def p_band(S, key, cues, rng, a, kind):
    """Chord-based arrangements: lofi, cinematic, synthwave, musicbox, folk, ambient, ragtime, anime,
    tech, playful, noir, darksynth, hype, dreamy, tribal, japanese, chiptune."""
    sec, hook_end, last, nend = section_fn(cues, S.dur)
    prog = CHORDS[a.get('prog', {'lofi': 'jazz', 'cinematic': 'minor_epic', 'synthwave': 'sad', 'musicbox': 'pop', 'folk': 'pop',
                                  'ambient': 'dream', 'ragtime': 'pop', 'anime': 'sad', 'tech': 'loop2', 'playful': 'pop',
                                  'noir': 'mystery', 'darksynth': 'mystery', 'hype': 'mystery', 'dreamy': 'dream', 'tribal': 'loop2',
                                  'japanese': 'mystery', 'chiptune': 'pop'}[kind])]
    mot_a = motif(rng, key, 8, 0.6, 2, 11, 7); mot_b = motif(rng, key, 8, 0.6, 2, 11, 9)
    for i, t0 in bars_iter(S):
        if t0 > nend + 0.1: break
        s = sec(t0); full = s == 'main'; ch = prog[i % len(prog)]
        chord3 = key.chord(ch, 3, -1); chord4 = key.chord(ch, 4, -1)
        root = key.hz(ch, -2)
        mot = (mot_a if (i // 2) % 2 == 0 else mot_b) if full else []
        half = (i % 2) * 4  # which half of the 8-beat motif

        if kind == 'lofi':
            for j, f in enumerate(chord4): S.add(S.at(i, 0) + j * 0.02, epiano(f, S.bar * 0.95, 0.55), 0.32, (j - 1.5) * 0.25, 0.25)
            if rng.random() < 0.5: S.add(S.at(i, 2.5), epiano(chord4[-1] * 2, 1.0, 0.4), 0.2, 0.3, 0.3)
            S.add(S.at(i, 0), upright(root, S.beat * 1.8), 0.5, 0, 0.05); S.add(S.at(i, 2.5), upright(key.hz(ch + 4, -2), S.beat), 0.4, 0, 0.05)
            if s != 'intro':
                for b in range(4):
                    if b in (0,) or (b == 2 and rng.random() < 0.3): S.add(S.at(i, b), drum('kick', 0.7), 0.42, 0, 0.02)
                    if b in (1, 3): S.add(S.at(i, b), drum('snare', 0.45), 0.2, 0.05, 0.15)
                    S.add(S.at(i, b), drum('hat', 0.4), 0.12, 0.3, 0.05); S.add(S.at(i, b + 0.5), drum('hat', 0.28), 0.09, 0.3, 0.05)
            for (bb, dg, L) in mot:
                if half <= bb < half + 4: S.add(S.at(i, bb - half), epiano(key.hz(dg, 0), L * S.beat, 0.5, 0.6), 0.2, 0.2, 0.35)
        elif kind in ('cinematic', 'anime', 'dreamy', 'ambient'):
            cut = {'cinematic': 1400, 'anime': 2600, 'dreamy': 2200, 'ambient': 1200}[kind]
            for j, f in enumerate(chord3 + [chord3[0] / 2]):
                S.add(t0, pad(f, S.bar * 1.05, 0.5, 'saw', cut, attack=0.5 if kind != 'ambient' else 1.2, release=1.0, vib=0.003), 0.22, (j - 1.5) * 0.4, 0.5)
            if kind == 'cinematic':
                for b in range(8):  # low piano ostinato in 8ths
                    S.add(S.at(i, b * 0.5), piano(chord3[b % 3] * (1 if b % 4 else 0.5), S.beat * 0.6, 0.45), 0.25 if s != 'intro' else 0.18, -0.2, 0.3)
                if full:
                    S.add(S.at(i, 0), drum('taiko', 0.9), 0.55, 0, 0.3)
                    if i % 2: S.add(S.at(i, 2.5), drum('taiko', 0.7, 1.3), 0.4, 0.2, 0.3); S.add(S.at(i, 3), drum('taiko', 0.75, 1.15), 0.4, -0.2, 0.3)
                    S.add(S.at(i, 0), bass(root, S.bar * 0.9, 0.7, 'saw', 1.2, 0.05, 0.4), 0.22, 0, 0.1)
            elif kind == 'anime':
                for b in range(4): S.add(S.at(i, b), piano(chord3[(b + 1) % 3] * 2, S.beat * 0.9, 0.5), 0.26, 0.2, 0.3)
                S.add(S.at(i, 0), piano(root * 2, S.bar, 0.55), 0.3, -0.2, 0.2)
                if full:
                    for b in range(4):
                        S.add(S.at(i, b), drum('kick' if b in (0, 2) else 'snare', 0.55), 0.3 if b in (0, 2) else 0.18, 0, 0.1)
                        S.add(S.at(i, b + 0.5), drum('hat', 0.35), 0.1, 0.3, 0.05)
                    S.add(S.at(i, 0), bass(root, S.bar * 0.9, 0.7), 0.3, 0, 0.05)
                    for (bb, dg, L) in mot:
                        if half <= bb < half + 4: S.add(S.at(i, bb - half), pad(key.hz(dg, 1), L * S.beat, 0.5, 'saw', 3500, 0.06, 0.2, 2, 6, 0.006), 0.13, 0.1, 0.4)
            elif kind in ('dreamy', 'ambient'):
                arp = chord3 + [chord3[1] * 2, chord3[2] * 2, chord3[0] * 4]
                step = 0.5 if kind == 'dreamy' else 1.0
                for b in np.arange(0, 4, step):
                    if kind == 'ambient' and rng.random() < 0.45: continue
                    f = arp[int(b / step) % len(arp)] * (2 if kind == 'dreamy' else 4)
                    S.add(S.at(i, b), bell(f, 2.5, 0.4, 'celesta') if kind == 'dreamy' else bell(f, 3.5, 0.35, 'chime'), 0.15, rng.uniform(-0.6, 0.6), 0.6)
                if kind == 'dreamy': S.add(S.at(i, 0), pluck(root * 2, S.bar, 0.5, 0.3, 0.998), 0.25, -0.2, 0.4)
        elif kind == 'synthwave' or kind == 'darksynth':
            for j, f in enumerate(chord3): S.add(t0, pad(f, S.bar, 0.5, 'saw', 1600 if kind == 'synthwave' else 900, 0.2, 0.3), 0.2, (j - 1) * 0.5, 0.45)
            arp = chord3 + [chord3[0] * 2]
            for b in range(16):
                if s == 'intro' and b % 2: continue
                f = arp[(b if kind == 'synthwave' else b * 3) % len(arp)] * 2
                S.add(S.at(i, b * 0.25), lead(f, S.beat * 0.22, 0.4, 'saw' if kind == 'synthwave' else 'square', 0, 2400, 0.003, 0.05), 0.12, 0.35 if b % 2 else -0.35, 0.35)
            for b in range(8): S.add(S.at(i, b * 0.5), bass(root, S.beat * 0.45, 0.8, 'saw', 1.6), 0.3, 0, 0.02)
            if s != 'intro':
                for b in range(4):
                    S.add(S.at(i, b), drum('kick', 0.9), 0.5, 0, 0.02)
                    if b in (1, 3): S.add(S.at(i, b), drum('snare' if kind == 'synthwave' else 'clap', 0.7), 0.3, 0, 0.4)
                    S.add(S.at(i, b + 0.5), drum('hat', 0.5), 0.12, 0.25, 0.05)
        elif kind == 'musicbox':
            for b in range(4):
                S.add(S.at(i, b), bell(chord3[b % 3] * 4, 1.6, 0.4, 'musicbox'), 0.18, 0.3, 0.45)
            S.add(t0, pad(chord3[0], S.bar, 0.4, 'tri', 1500, 0.4, 0.6), 0.18, -0.2, 0.4)
            S.add(t0, pluck(root * 2, S.bar * 0.8, 0.5, 0.2, 0.995), 0.3, 0, 0.2)
            for (bb, dg, L) in (mot if s != 'intro' else []):
                if half <= bb < half + 4: S.add(S.at(i, bb - half), bell(key.hz(dg, 1), 1.8, 0.55, 'musicbox'), 0.3, -0.15, 0.45)
            if full:
                for b in range(4): S.add(S.at(i, b + 0.5), drum('shaker', 0.4), 0.08, 0.4, 0.1)
        elif kind == 'folk':
            pat = [0, 2, 1, 2, 0, 2, 1, 2]
            voicing = [root * 2, chord3[1] * 2, chord3[2] * 2]
            for b in range(8):
                S.add(S.at(i, b * 0.5), pluck(voicing[pat[b] % 3] * (2 if pat[b] == 1 else 1), S.beat * 1.5, 0.55, 0.45, 0.997), 0.32, 0.25, 0.25)
            S.add(t0, bass(root, S.beat * 1.8, 0.6), 0.28, 0, 0.05); S.add(S.at(i, 2), bass(key.hz(ch + 4, -2), S.beat * 1.8, 0.5), 0.24, 0, 0.05)
            if full:
                for b in range(8): S.add(S.at(i, b * 0.5), drum('shaker', 0.5 if b % 2 else 0.3), 0.08, -0.4, 0.1)
                for (bb, dg, L) in mot:
                    if half <= bb < half + 4: S.add(S.at(i, bb - half), bell(key.hz(dg, 1), 1.6, 0.45, 'glock'), 0.13, 0.1, 0.4)
        elif kind == 'ragtime':
            for b in range(4):
                if b % 2 == 0: S.add(S.at(i, b), piano(root * (1 if b == 0 else 1.5), S.beat * 0.8, 0.6, 0.004), 0.32, -0.1, 0.15)
                else:
                    for j, f in enumerate(chord3): S.add(S.at(i, b) + j * 0.008, piano(f * 2, S.beat * 0.6, 0.45, 0.004), 0.2, 0.1, 0.15)
            for (bb, dg, L) in (mot if s != 'intro' else mot_a[:3]):
                if half <= bb < half + 4: S.add(S.at(i, bb - half), piano(key.hz(dg, 1), L * S.beat, 0.55, 0.005), 0.28, 0.1, 0.2)
            if s != 'intro':
                for b in range(4): S.add(S.at(i, b), drum('brush', 0.5), 0.12, 0.2, 0.1); S.add(S.at(i, b + 0.5), drum('rim', 0.3), 0.05, -0.3, 0.1)
        elif kind == 'tech':
            for b in range(8):
                f = (chord3 + [chord3[0] * 2])[(b * 2 + i) % 4] * 2
                S.add(S.at(i, b * 0.5), pluck(f, S.beat * 0.5, 0.45, 0.85, 0.99), 0.2, 0.35 if b % 2 else -0.35, 0.35)
            S.add(t0, pad(chord3[0], S.bar, 0.35, 'saw', 900, 0.4, 0.5), 0.15, 0, 0.5)
            if s != 'intro':
                for b in range(4):
                    S.add(S.at(i, b), drum('kick', 0.6), 0.32, 0, 0.02)
                    S.add(S.at(i, b + 0.5), drum('hat', 0.4), 0.09, 0.3, 0.05)
                    if b in (1, 3): S.add(S.at(i, b), drum('rim', 0.5), 0.1, -0.2, 0.2)
                S.add(t0, bass(root, S.bar * 0.95, 0.6, 'sine', 1.2, 0.02, 0.2), 0.3, 0, 0)
        elif kind == 'playful':
            for b in range(4):
                S.add(S.at(i, b), bass(root if b % 2 == 0 else key.hz(ch + 4, -2), S.beat * 0.4, 0.75, 'tri', 1.3), 0.3, 0, 0.05)
                for j, f in enumerate(chord3): S.add(S.at(i, b + 0.5), pluck(f * 2, 0.25, 0.4, 0.3, 0.98), 0.12, (j - 1) * 0.3, 0.15)
            for (bb, dg, L) in (mot if s != 'intro' else []):
                if half <= bb < half + 4: S.add(S.at(i, bb - half), bell(key.hz(dg, 1), 1.0, 0.6, 'marimba'), 0.32, 0.15, 0.25)
            if full:
                for b in range(4):
                    S.add(S.at(i, b), drum('kick', 0.6), 0.28, 0, 0.02)
                    if b in (1, 3): S.add(S.at(i, b), drum('clap', 0.55), 0.17, 0.1, 0.25)
                    S.add(S.at(i, b + 0.5), drum('shaker', 0.4), 0.07, 0.4, 0.1)
        elif kind == 'noir':
            walk = [0, 2, 4, 5]
            for b in range(4): S.add(S.at(i, b), upright(key.hz(ch + walk[b], -2), S.beat * 0.95, 0.7), 0.42, 0, 0.1)
            S.add(t0, pad(chord3[0], S.bar, 0.3, 'tri', 900, 0.8, 0.8), 0.14, 0, 0.5)
            if rng.random() < 0.7: S.add(S.at(i, rng.choice([0.5, 1.5, 2.5])), piano(chord4[rng.integers(1, 4)] * 2, 2.0, 0.45), 0.2, 0.2, 0.45)
            if s != 'intro':
                for b in range(4): S.add(S.at(i, b), drum('brush', 0.45), 0.1, 0.25, 0.2)
                if i % 2 == 0: S.add(S.at(i, 0), drum('heartbeat', 0.5), 0.15, 0, 0.1)
        elif kind == 'hype':
            S.add(t0, bass(root, S.bar * 0.9, 0.9, 'sine', 2.2, 0.005, 0.3), 0.45, 0, 0)
            for b in range(4):
                S.add(S.at(i, b), drum('kick', 0.9), 0.5 if b in (0,) or (b == 2 and i % 2) else 0.0, 0, 0.02)
                if b == 2: S.add(S.at(i, b), drum('clap', 0.8), 0.32, 0, 0.3)
                for h in range(2 if rng.random() < 0.7 else 4): S.add(S.at(i, b + h / (2 if h < 2 else 4)), drum('hat', 0.45), 0.1, 0.3, 0.02)
            for b in range(8):
                if rng.random() < 0.5: S.add(S.at(i, b * 0.5), pluck(chord3[b % 3] * 4, 0.25, 0.45, 0.9, 0.99), 0.12, -0.3, 0.3)
        elif kind == 'tribal':
            S.add(t0, pad(root, S.bar * 1.05, 0.5, 'saw', 500, 1.0, 1.0, 2, 4), 0.25, 0, 0.4)
            pat = [1, 0, 0, 1, 0, 1, 0, 0]
            for b in range(8):
                if pat[b] or (full and rng.random() < 0.25): S.add(S.at(i, b * 0.5), drum('frame', 0.8 if pat[b] else 0.5, 1.0 if pat[b] else 1.4), 0.4, rng.uniform(-0.3, 0.3), 0.3)
                if full and b % 2: S.add(S.at(i, b * 0.5), drum('shaker', 0.5), 0.08, 0.4, 0.2)
            for (bb, dg, L) in (mot if full else []):
                if half <= bb < half + 4: S.add(S.at(i, bb - half), flute(key.hz(dg, 0), L * S.beat * 1.1, 0.5), 0.22, -0.1, 0.5)
        elif kind == 'japanese':
            for b in (0, 1.5, 2, 3):
                S.add(S.at(i, b), pluck(chord3[int(b) % 3] * 2, 1.5, 0.55, 0.85, 0.996), 0.25, 0.3, 0.35)
            S.add(t0, pad(root, S.bar, 0.35, 'tri', 700, 1.0, 1.0, 2), 0.15, 0, 0.5)
            for (bb, dg, L) in (mot if full else []):
                if half <= bb < half + 4: S.add(S.at(i, bb - half), flute(key.hz(dg, 0), L * S.beat * 1.2, 0.5, 0.18), 0.22, -0.15, 0.5)
            if full and i % 2 == 0: S.add(t0, drum('taiko', 0.7), 0.35, 0, 0.35)
        elif kind == 'chiptune':
            for b in range(16):
                S.add(S.at(i, b * 0.25), lead((chord3 + [chord3[1]])[b % 4] * 4, S.beat * 0.22, 0.35, 'pulse25', 0, 16000, 0.001, 0.02), 0.09, 0.3, 0.05)
            for b in range(8): S.add(S.at(i, b * 0.5), lead(root * (2 if b % 2 else 1), S.beat * 0.45, 0.6, 'tri', 0, 16000, 0.001, 0.02), 0.3, 0, 0.02)
            for (bb, dg, L) in (mot if s != 'intro' else []):
                if half <= bb < half + 4: S.add(S.at(i, bb - half), lead(key.hz(dg, 1), L * S.beat * 0.9, 0.5, 'square', 0.006, 16000, 0.002, 0.04), 0.17, -0.1, 0.1)
            if s != 'intro':
                for b in range(4):
                    S.add(S.at(i, b), drum('chipkick' if b % 2 == 0 else 'chipnoise', 0.7), 0.3, 0, 0.02)
    # closing chord when the last line ends
    final = key.chord(prog[0], 3, 0)
    inst = {'lofi': lambda f, d, v: epiano(f, d, v), 'cinematic': lambda f, d, v: pad(f, d, v, 'saw', 1500, 0.05, 2.5),
            'synthwave': lambda f, d, v: pad(f, d, v, 'saw', 2000, 0.02, 2.5), 'darksynth': lambda f, d, v: pad(f, d, v, 'square', 1200, 0.02, 2.5),
            'musicbox': lambda f, d, v: bell(f * 2, d, v, 'musicbox'), 'folk': lambda f, d, v: pluck(f, d, v, 0.5, 0.998),
            'ambient': lambda f, d, v: bell(f * 2, d, v, 'chime'), 'ragtime': lambda f, d, v: piano(f, d, v, 0.004),
            'anime': lambda f, d, v: piano(f, d, v), 'tech': lambda f, d, v: pluck(f * 2, d, v, 0.8, 0.997),
            'playful': lambda f, d, v: bell(f * 2, d, v, 'marimba'), 'noir': lambda f, d, v: piano(f, d, v),
            'hype': lambda f, d, v: pluck(f * 2, d, v, 0.9, 0.995), 'dreamy': lambda f, d, v: bell(f * 2, d, v, 'celesta'),
            'tribal': lambda f, d, v: flute(f, d, v), 'japanese': lambda f, d, v: pluck(f * 2, d, v, 0.85, 0.998),
            'chiptune': lambda f, d, v: lead(f * 2, d * 0.5, v, 'square', 0.006, 16000, 0.002, 0.6)}[kind]
    end_hit(S, nend + 0.12, final, inst, 0.35, 0.5)
    if kind == 'cinematic': S.add(nend + 0.12, drum('timpani', 0.9), 0.5, 0, 0.4)
    if kind in ('tribal', 'japanese'): S.add(nend + 0.12, drum('taiko', 0.9), 0.5, 0, 0.4)
    return dict(rt60={'ambient': 4.0, 'dreamy': 3.2, 'cinematic': 3.0, 'anime': 2.4, 'japanese': 3.0, 'tribal': 2.6}.get(kind, 1.8), bright=0.5)

PRESETS = {
    'gamelan':   dict(fn='gamelan', bpm=66, key=('D', 'slendro', 4), desc='Gamelan Jawa: saron, bonang, kendang, gong (wayang, batik, legenda Nusantara)'),
    'gamelan-pelog': dict(fn='gamelan', bpm=60, key=('E', 'pelog', 4), desc='Gamelan pelog, lebih sendu/sakral'),
    'lofi':      dict(fn='lofi', bpm=76, key=('F', 'major', 4), swing=0.33, desc='Lo-fi hip hop: Rhodes, upright bass, brush beat, vinyl (kapur, sketsa, cozy)'),
    'cinematic': dict(fn='cinematic', bpm=84, key=('D', 'minor', 4), desc='Orkestra sinematik: string pad, ostinato piano, taiko (epik, 3D, lukisan minyak)'),
    'synthwave': dict(fn='synthwave', bpm=100, key=('A', 'minor', 4), desc='Synthwave 80an: saw pad, arpeggio, gated drum (neon, retro-futur)'),
    'darksynth': dict(fn='darksynth', bpm=112, key=('E', 'minor', 4), desc='Darksynth/hacker: bass gelap, arp minor (terminal, cyber)'),
    'musicbox':  dict(fn='musicbox', bpm=92, key=('C', 'major', 5), desc='Kotak musik & celesta (pop-up book, origami, dongeng anak)'),
    'folk':      dict(fn='folk', bpm=96, key=('G', 'major', 4), desc='Akustik folk: petikan gitar, shaker, glockenspiel (cat air, pedesaan, kolase daun)'),
    'ambient':   dict(fn='ambient', bpm=60, key=('Eb', 'lydian', 4), desc='Ambient luas: pad pelan, lonceng (luar angkasa, misteri, tinta)'),
    'dreamy':    dict(fn='dreamy', bpm=72, key=('F', 'lydian', 4), desc='Dreamy: pad lydian, celesta, harpa (pastel, kotak cahaya, kenangan)'),
    'ragtime':   dict(fn='ragtime', bpm=126, key=('C', 'major', 4), desc='Ragtime 1920an: piano honky-tonk, brush (kartun jadul, rubber hose)'),
    'anime':     dict(fn='anime', bpm=86, key=('A', 'major', 4), desc='Anime emosional: piano, string, drum ringan'),
    'tech':      dict(fn='tech', bpm=108, key=('C', 'minor', 4), desc='Tech minimal: pluck, sub bass, klik (UI, infografis, explainer)'),
    'playful':   dict(fn='playful', bpm=112, key=('F', 'major', 4), desc='Ceria: marimba, pizzicato, clap (clay, rajut, kartun 3D)'),
    'noir':      dict(fn='noir', bpm=70, key=('C', 'minor', 4), desc='Jazz noir: walking bass, brush, piano gelap (dokumenter, misteri)'),
    'hype':      dict(fn='hype', bpm=140, key=('F', 'minor', 4), desc='Hype/trap: 808, hi-hat, clap (kinetic type, manga action)'),
    'tribal':    dict(fn='tribal', bpm=88, key=('D', 'mpenta', 4), desc='Tribal kuno: frame drum, drone, seruling (lukisan gua, peradaban kuno)'),
    'japanese':  dict(fn='japanese', bpm=72, key=('D', 'insen', 4), desc='Jepang: koto, shakuhachi, taiko (sumi-e, samurai, legenda timur)'),
    'chiptune':  dict(fn='chiptune', bpm=140, key=('C', 'major', 4), desc='Chiptune 8-bit: square lead, triangle bass, noise drum (pixel art)'),
}

def compose(preset, dur, cues, seed=3, bpm=None, key=None):
    P = PRESETS[preset]
    rng = np.random.default_rng(seed)
    S = Score(dur, bpm or P['bpm'], 4, P.get('swing', 0.0))
    k = Key(*(key or P['key']))
    if P['fn'] == 'gamelan': fx = p_gamelan(S, k, cues, rng, P)
    else: fx = p_band(S, k, cues, rng, P, P['fn'])
    out = S.render(**fx)
    fn = P['fn']
    if fn == 'lofi': out = wobble(out, 0.0015, 0.5) + np.stack([vinyl(dur, 0.6)] * 2)[:, : out.shape[1]]
    if fn == 'ragtime':
        out = wobble(out, 0.0012, 0.7)
        out = np.stack([lp(hp(c, 250), 4500) for c in out]) * 1.6 + np.stack([vinyl(dur, 0.9)] * 2)[:, : out.shape[1]]
    if fn == 'chiptune': out = bitcrush(out, 7, 2)
    if fn in ('ambient', 'cinematic'): out = out + np.stack([noise_bed(dur, 100, 900, 0.05)] * 2)[:, : out.shape[1]]
    # fades
    n = out.shape[1]; fi = int(0.4 * SR); fo = int(1.4 * SR)
    out[:, :fi] *= np.linspace(0, 1, fi); out[:, n - fo:] *= np.linspace(1, 0, fo) ** 1.5
    # loudness-match every preset (RMS of the busy part), then a soft clip so transients never spike
    m = out.mean(0); w = int(0.4 * SR)
    c = np.concatenate([[0.0], np.cumsum(m.astype(np.float64) ** 2)])
    seg = np.sqrt(np.maximum(0, (c[w:] - c[:-w]) / w))
    ref = np.percentile(seg, 75) or 1e-3
    out = out * (0.12 / ref)
    out = np.tanh(out * 1.4) / 1.4
    return out.astype(np.float32)

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
    ap.add_argument('project'); ap.add_argument('--preset'); ap.add_argument('--seed', type=int); ap.add_argument('--list', action='store_true')
    a = ap.parse_args()
    if a.list:
        for k, v in PRESETS.items(): print(f'{k:14s} {v["desc"]}')
        return
    proj = os.path.abspath(a.project)
    story = json.load(open(os.path.join(proj, 'story.json'), encoding='utf-8'))
    tl_path = os.path.join(proj, 'build', 'timeline.json')
    tl = json.load(open(tl_path, encoding='utf-8')) if os.path.exists(tl_path) else fallback_timeline(story)
    m = story.get('music', 'cinematic')
    if isinstance(m, str): m = {'preset': m}
    preset = a.preset or m.get('preset', 'cinematic')
    if preset == 'none': return
    dur = float(story.get('duration') or tl['duration'])
    key = tuple(m['key']) if m.get('key') else None
    audio = compose(preset, dur, tl, seed=a.seed or m.get('seed', 3), bpm=m.get('bpm'), key=key)
    os.makedirs(os.path.join(proj, 'build'), exist_ok=True)
    sf.write(os.path.join(proj, 'build', 'music.wav'), audio.T, SR)
    print(f'music: {preset} {dur:.1f}s')

if __name__ == '__main__':
    main()
