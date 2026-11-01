"""AniMasters sound effects, synthesised (no samples). Each returns a mono float32 array at 44.1 kHz.
Use from a scene with AM.sfx('whoosh', time) or from story.json "sfx": [{"at": "lineId", "type": "gong"}].
"""
import numpy as np
from synth import SR, lp, hp, bp, bell, gong as _gong, drum, pluck, midi

_r = np.random.default_rng(5)

def _t(d): return np.arange(int(d * SR)) / SR
def _n(d): return _r.standard_normal(int(d * SR))
def _norm(x, v=0.9): return (x / (np.max(np.abs(x)) or 1) * v).astype(np.float32)

def whoosh(pitch=1.0, dur=0.6):
    t = _t(dur); x = _n(dur)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    lo = lp(x, 400 * pitch); mid = bp(x, 600 * pitch, 3000 * pitch)
    sweep = np.clip(t / dur, 0, 1)
    return _norm((lo * (1 - sweep) + mid * sweep) * env, 0.8)

def swoosh_up(pitch=1.0): return whoosh(pitch * 1.4, 0.45)

def pop(pitch=1.0):
    t = _t(0.12); f = 600 * pitch + 900 * np.exp(-t * 60)
    return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40), 0.7)

def click(pitch=1.0):
    t = _t(0.03); return _norm(hp(_n(0.03), 2000) * np.exp(-t * 300) + np.sin(2 * np.pi * 2500 * pitch * t) * np.exp(-t * 400), 0.5)

def chime(pitch=1.0):
    return _norm(sum(bell(midi(84) * pitch * r, 2.0, 0.6, 'chime')[: int(2 * SR)] * a for r, a in [(1, 1), (1.5, 0.5)]), 0.6)

def ding(pitch=1.0): return _norm(bell(midi(88) * pitch, 1.5, 0.7, 'glock'), 0.55)

def sparkle(pitch=1.0):
    out = np.zeros(int(1.2 * SR), np.float32)
    for i, n in enumerate([84, 88, 91, 96, 100]):
        s = bell(midi(n) * pitch, 0.8, 0.5, 'celesta'); k = int(i * 0.06 * SR); out[k:k + len(s)] += s[: len(out) - k]
    return _norm(out, 0.5)

def gong(pitch=1.0): return _norm(_gong(62 * pitch, 5.0, 1.0), 0.9)

def boom(pitch=1.0):
    t = _t(2.0); f = 38 * pitch + 60 * np.exp(-t * 6)
    return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) + lp(_n(2.0), 300) * np.exp(-t * 4) * 0.6, 0.95)

def impact(pitch=1.0):
    return _norm(boom(pitch)[: int(1.2 * SR)] + np.pad(drum('snare', 0.9), (0, int(1.2 * SR) - len(drum('snare', 0.9))))[: int(1.2 * SR)] * 0.5, 0.95)

def thud(pitch=1.0): return _norm(drum('kick', 0.9, pitch), 0.8)

def drum_hit(pitch=1.0): return _norm(drum('taiko', 0.9, pitch), 0.9)

def riser(pitch=1.0, dur=1.5):
    t = _t(dur); x = bp(_n(dur), 300, 6000)
    f = 200 * pitch * (1 + 6 * (t / dur) ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    return _norm((x * 0.6 + tone) * (t / dur) ** 2, 0.7)

def paper(pitch=1.0):
    d = 0.35; t = _t(d); x = bp(_n(d), 1500 * pitch, 9000)
    bursts = (np.sin(2 * np.pi * 23 * t) > 0.2) * 0.7 + 0.3
    return _norm(x * bursts * np.exp(-t * 6), 0.5)

def page_flip(pitch=1.0):
    d = 0.5; t = _t(d); x = bp(_n(d), 800 * pitch, 7000)
    env = np.exp(-((t - 0.18) / 0.09) ** 2)
    return _norm(x * env, 0.55)

def typewriter(pitch=1.0):
    d = 0.09; t = _t(d)
    return _norm(bp(_n(d), 1200, 6000) * np.exp(-t * 90) + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60) * 0.4, 0.5)

def keys(pitch=1.0):
    out = np.zeros(int(0.8 * SR), np.float32)
    for i in range(7):
        s = click(pitch * (0.8 + 0.4 * _r.random())); k = int((i * 0.1 + _r.random() * 0.03) * SR); out[k:k + len(s)] += s[: len(out) - k]
    return _norm(out, 0.45)

def glitch(pitch=1.0):
    d = 0.35; x = _n(d)
    x = np.sign(x) * (np.abs(x) > 1.2)
    x = np.repeat(x[::40], 40)[: int(d * SR)]
    sq = np.sign(np.sin(2 * np.pi * 220 * pitch * _t(d) * (1 + 3 * (_r.random(int(d * SR)) > 0.97))))
    return _norm((x * 0.5 + sq * 0.3) * (np.sin(2 * np.pi * 14 * _t(d)) > 0), 0.5)

def coin(pitch=1.0):
    a = np.sign(np.sin(2 * np.pi * 988 * pitch * _t(0.08))); b = np.sign(np.sin(2 * np.pi * 1319 * pitch * _t(0.3)))
    return _norm(np.concatenate([a, b * np.exp(-_t(0.3) * 8)]) * 0.5, 0.45)

def jump(pitch=1.0):
    t = _t(0.25); f = 300 * pitch + 600 * t / 0.25
    return _norm(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 6), 0.4)

def powerup(pitch=1.0):
    t = _t(0.6); f = 300 * pitch * 2 ** (np.floor(t * 20) / 6)
    return _norm(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (1 - t / 0.6), 0.4)

def heartbeat(pitch=1.0): return _norm(drum('heartbeat', 0.9, pitch), 0.8)

def camera(pitch=1.0):
    d = 0.25; t = _t(d)
    c = hp(_n(d), 3000) * (np.exp(-t * 80) + 0.6 * np.exp(-np.clip(t - 0.11, 0, None) * 90) * (t > 0.11))
    return _norm(c, 0.6)

def magic(pitch=1.0): return _norm(sparkle(pitch) + np.pad(riser(pitch * 1.5, 0.8), (0, int(1.2 * SR) - int(0.8 * SR))) * 0.4, 0.55)

def thunder(pitch=1.0):
    d = 3.0; t = _t(d); x = lp(_n(d), 500 * pitch)
    env = np.exp(-t * 1.2) * (1 + 0.8 * (np.abs(lp(_n(d), 6)) * 20))
    return _norm(x * env, 0.9)

def rain(pitch=1.0, dur=4.0):
    x = hp(_n(dur), 1500) * 0.4 + lp(_n(dur), 800) * 0.2
    return _norm(x, 0.35)

def wind(pitch=1.0, dur=3.0):
    t = _t(dur); x = bp(_n(dur), 300, 1200)
    return _norm(x * (0.5 + 0.5 * np.sin(2 * np.pi * 0.4 * t)) * np.sin(np.pi * t / dur), 0.4)

def fire(pitch=1.0, dur=3.0):
    x = lp(_n(dur), 900) * 0.4; cr = (_r.random(int(dur * SR)) < 30 / SR) * _r.standard_normal(int(dur * SR)) * 2
    return _norm(x + hp(cr, 2000), 0.4)

def sword(pitch=1.0):
    t = _t(0.9); s = sum(np.sin(2 * np.pi * 2400 * pitch * r * t) * np.exp(-t * (3 + 2 * r)) for r in (1, 1.37, 2.1))
    return _norm(s + hp(_n(0.9), 4000) * np.exp(-t * 30), 0.6)

def arrow(pitch=1.0):
    return _norm(bp(_n(0.5), 2000, 7000) * np.exp(-((_t(0.5) - 0.2) / 0.08) ** 2), 0.5)

def bubble(pitch=1.0):
    t = _t(0.15); f = 400 * pitch * (1 + 3 * t / 0.15)
    return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25), 0.5)

def squish(pitch=1.0):
    t = _t(0.25); f = 180 * pitch * (1 - 0.5 * t / 0.25)
    return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR + 3 * np.sin(2 * np.pi * 30 * t)) * np.exp(-t * 12), 0.6)

def boing(pitch=1.0):
    t = _t(0.6); f = 220 * pitch * (1 + 0.5 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4))
    return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4), 0.6)

def slide_whistle(pitch=1.0, up=True):
    t = _t(0.7); f = 500 * pitch * 2 ** ((t / 0.7) * (1.5 if up else -1.5))
    return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.7), 0.45)

def scratch(pitch=1.0):
    return _norm(bp(_n(0.4), 2500 * pitch, 8000) * (np.sin(2 * np.pi * 11 * _t(0.4)) > 0) * 0.7, 0.45)

def chalk(pitch=1.0):
    d = 0.5; t = _t(d); x = bp(_n(d), 2500, 9000) * (0.6 + 0.4 * (np.sin(2 * np.pi * 35 * t) > -0.3))
    return _norm(x * np.sin(np.pi * t / d), 0.35)

def pencil(pitch=1.0):
    d = 0.6; t = _t(d); return _norm(bp(_n(d), 3000, 10000) * np.sin(np.pi * t / d) * (0.7 + 0.3 * np.sin(2 * np.pi * 8 * t)), 0.3)

def stamp(pitch=1.0):
    return _norm(np.concatenate([drum('kick', 0.8, 1.6 * pitch)[: int(0.15 * SR)], np.zeros(100)]) + 0, 0.7)

def shutter(pitch=1.0): return camera(pitch)

def tick(pitch=1.0):
    t = _t(0.04); return _norm(np.sin(2 * np.pi * 3000 * pitch * t) * np.exp(-t * 200), 0.4)

def crowd(pitch=1.0, dur=2.5):
    t = _t(dur); return _norm(bp(_n(dur), 300, 3000) * np.sin(np.pi * t / dur) ** 0.5, 0.4)

def bird(pitch=1.0):
    out = []
    for i in range(3):
        t = _t(0.09); f = 3000 * pitch * (1 + 0.4 * np.sin(2 * np.pi * 30 * t))
        out += [np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.09), np.zeros(int(0.05 * SR))]
    return _norm(np.concatenate(out), 0.35)

def bell_temple(pitch=1.0): return _norm(bell(midi(67) * pitch, 4.0, 0.9, 'chime'), 0.7)

def kentongan(pitch=1.0):
    t = _t(0.25); return _norm((np.sin(2 * np.pi * 520 * pitch * t) + 0.5 * np.sin(2 * np.pi * 1350 * pitch * t)) * np.exp(-t * 22), 0.7)

def keprak(pitch=1.0):
    """The dalang's wooden knock on the puppet chest (wayang)."""
    t = _t(0.12); return _norm((bp(_n(0.12), 800, 4000) + np.sin(2 * np.pi * 900 * pitch * t)) * np.exp(-t * 45), 0.8)

def cempala(pitch=1.0):
    t = _t(0.3); return _norm((np.sin(2 * np.pi * 180 * pitch * t) + bp(_n(0.3), 300, 2000) * 0.6) * np.exp(-t * 18), 0.8)

SFX = {k: v for k, v in globals().items() if callable(v) and not k.startswith('_') and k not in ('lp', 'hp', 'bp', 'bell', 'drum', 'pluck', 'midi')}

def make(kind, pitch=1.0):
    if kind not in SFX: raise ValueError(f'unknown sfx {kind}; choose from {", ".join(sorted(SFX))}')
    return SFX[kind](pitch)
