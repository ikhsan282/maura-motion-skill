"""Maura Motion synth: small offline instrument kit in numpy for scores and sound effects.
Every instrument returns a mono float32 array for one note. Notes are cached, so repeated
patterns cost almost nothing to render.
"""
import numpy as np
from functools import lru_cache
from scipy.signal import lfilter, butter, sosfilt, fftconvolve

SR = 44100
_rng = np.random.default_rng(7)

def T(dur):
    return np.arange(int(max(0.001, dur) * SR)) / SR

def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)

def lp(x, fc, order=2):
    fc = min(fc, SR * 0.45)
    return sosfilt(butter(order, fc, 'low', fs=SR, output='sos'), x)

def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, 'high', fs=SR, output='sos'), x)

def bp(x, lo, hi, order=2):
    hi = min(hi, SR * 0.45)
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)

def env_adsr(n, a=0.01, d=0.1, s=0.7, r=0.2, hold=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    hold_n = n - r_n if hold is None else int(hold * SR)
    e = np.zeros(n, np.float32)
    i = 0
    seg = min(a_n, n); e[:seg] = np.linspace(0, 1, seg, endpoint=False); i = seg
    seg = max(0, min(d_n, hold_n - i)); e[i:i + seg] = np.linspace(1, s, seg, endpoint=False); i += seg
    if hold_n > i: e[i:hold_n] = s; i = hold_n
    rem = n - i
    if rem > 0: e[i:] = np.linspace(e[i - 1] if i > 0 else s, 0, rem)
    return e

def exp_decay(n, tau):
    return np.exp(-np.arange(n) / (tau * SR)).astype(np.float32)

def click_free(x, ms=4):
    k = min(len(x) // 2, int(ms / 1000 * SR))
    if k > 1:
        x[:k] *= np.linspace(0, 1, k); x[-k:] *= np.linspace(1, 0, k)
    return x

# ---------- wavetable oscillators (band-limited, fast) ----------
_tables = {}
def _table(kind, f):
    nh = int(min(60, max(1, (SR * 0.45) / max(f, 20))))
    key = (kind, nh)
    if key not in _tables:
        L = 2048; ph = np.arange(L) / L; w = np.zeros(L)
        for k in range(1, nh + 1):
            if kind == 'saw': w += np.sin(2 * np.pi * k * ph) / k
            elif kind == 'square' and k % 2: w += np.sin(2 * np.pi * k * ph) / k
            elif kind == 'tri' and k % 2: w += ((-1) ** ((k - 1) // 2)) * np.sin(2 * np.pi * k * ph) / (k * k)
            elif kind == 'pulse25': w += np.sin(np.pi * k * 0.25) * np.cos(2 * np.pi * k * ph) / k
        if kind == 'sine': w = np.sin(2 * np.pi * ph)
        w /= np.max(np.abs(w)) or 1
        _tables[key] = w.astype(np.float32)
    return _tables[key]

def osc(kind, f, n, vib=0.0, vib_rate=5.0, vib_delay=0.15, detune=0.0, phase0=0.0):
    t = np.arange(n) / SR
    freq = np.full(n, f * 2 ** (detune / 1200), np.float32)
    if vib:
        ramp = np.clip((t - vib_delay) / 0.3, 0, 1)
        freq = freq * (1 + vib * ramp * np.sin(2 * np.pi * vib_rate * t))
    ph = (np.cumsum(freq) / SR + phase0) % 1.0
    tab = _table(kind, f)
    return tab[(ph * len(tab)).astype(np.int64) % len(tab)]

# ---------- instruments (cached) ----------
def _q(v, step=0.05):
    return round(v / step) * step

@lru_cache(maxsize=4096)
def _pluck(f, dur, vel, bright, decay):
    n = int(dur * SR); N = max(2, int(round(SR / f)))
    exc = _rng.standard_normal(N).astype(np.float32)
    exc = lp(exc, 800 + bright * 9000, 1)
    x = np.zeros(n, np.float32); x[:N] = exc
    a = np.zeros(N + 2); a[0] = 1; a[N] = -decay * 0.5; a[N + 1] = -decay * 0.5
    y = lfilter([1.0], a, x).astype(np.float32)
    y /= (np.max(np.abs(y)) or 1)
    y *= env_adsr(n, 0.002, 0.05, 1.0, min(0.08, dur * 0.3))
    return y * vel

def pluck(f, dur, vel=0.8, bright=0.5, decay=0.996):
    """Karplus-Strong string: guitar, harp, koto, pizzicato."""
    return _pluck(round(f, 2), _q(dur), _q(vel), _q(bright, 0.1), round(decay, 4)).copy()

@lru_cache(maxsize=4096)
def _epiano(f, dur, vel, bright):
    n = int(dur * SR); t = np.arange(n) / SR
    idx = (1.2 + 2.5 * bright) * vel * np.exp(-t * 3.0)
    car = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    tine = 0.18 * vel * np.sin(2 * np.pi * f * 14.0 * t) * np.exp(-t * 18)
    e = np.exp(-t * (1.1 + f / 900)) * env_adsr(n, 0.003, 0.0, 1.0, min(0.12, dur * 0.3))
    return ((car + tine) * e * vel).astype(np.float32)

def epiano(f, dur, vel=0.7, bright=0.4):
    """FM electric piano (Rhodes-like): lo-fi, jazz, cozy."""
    return _epiano(round(f, 2), _q(dur), _q(vel), _q(bright, 0.1)).copy()

@lru_cache(maxsize=4096)
def _piano(f, dur, vel, detune):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for k, amp in enumerate([1, .55, .32, .22, .12, .08, .05, .03], start=1):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        d = np.exp(-t * (0.9 + 0.55 * k + f / 600))
        y += amp * np.sin(2 * np.pi * fk * t) * d
        if detune: y += amp * 0.6 * np.sin(2 * np.pi * fk * (1 + detune) * t) * d
    ham = lp(_rng.standard_normal(min(n, 800)), 3000) * np.exp(-np.arange(min(n, 800)) / 120)
    y[:len(ham)] += ham * 0.15
    y *= env_adsr(n, 0.002, 0, 1, min(0.15, dur * 0.3))
    return (y / 2.2 * vel).astype(np.float32)

def piano(f, dur, vel=0.7, detune=0.0):
    """Additive piano. detune>0 (e.g. 0.004) gives a honky-tonk/ragtime upright."""
    return _piano(round(f, 2), _q(dur), _q(vel), round(detune, 4)).copy()

@lru_cache(maxsize=2048)
def _bell(f, dur, vel, kind):
    n = int(dur * SR); t = np.arange(n) / SR
    spec = {
        'saron':   ([1, 2.76, 5.40, 8.93], [1, .45, .22, .1], [1.2, 2.5, 4, 6]),
        'bonang':  ([1, 1.51, 2.01, 3.02], [1, .35, .3, .12], [1.6, 2.4, 3.0, 5]),
        'celesta': ([1, 2, 3, 4.2], [1, .3, .08, .05], [1.8, 3.5, 6, 9]),
        'musicbox':([1, 2.0, 3.0, 5.9], [1, .25, .12, .18], [2.2, 4, 7, 11]),
        'glock':   ([1, 2.76, 5.4], [1, .4, .15], [1.0, 2.2, 4]),
        'marimba': ([1, 3.93, 9.2], [1, .28, .06], [3.5, 9, 20]),
        'chime':   ([1, 2.0, 2.92, 4.16, 5.4], [1, .6, .4, .25, .15], [0.5, 0.8, 1.2, 1.8, 2.5]),
    }[kind]
    y = np.zeros(n)
    for r, a, d in zip(*spec):
        y += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d)
        if kind in ('saron', 'bonang'):  # ombak: gamelan pairs tuned apart so they beat
            y += a * 0.8 * np.sin(2 * np.pi * (f * r + 4.5) * t) * np.exp(-t * d)
    y = click_free(y, 2)
    return (y / np.max(np.abs(y)) * vel).astype(np.float32)

def bell(f, dur, vel=0.7, kind='celesta'):
    """Struck tones: saron, bonang (gamelan), celesta, musicbox, glock, marimba, chime."""
    return _bell(round(f, 2), _q(dur), _q(vel), kind).copy()

@lru_cache(maxsize=64)
def _gong(f, dur, vel):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for r, a, d in [(1, 1, .35), (1.006, .9, .35), (2.04, .35, .7), (2.97, .25, 1.0), (4.1, .12, 1.6), (0.5, .4, .3)]:
        y += a * np.sin(2 * np.pi * f * r * t * (1 - 0.004 * np.exp(-t * 2))) * np.exp(-t * d)
    att = np.clip(t / 0.04, 0, 1)
    hum = 1 + 0.25 * np.sin(2 * np.pi * 1.3 * t)
    return (y * att * hum / 3.2 * vel).astype(np.float32)

def gong(f=62, dur=6, vel=0.9):
    return _gong(round(f, 2), _q(dur), _q(vel)).copy()

def pad(f, dur, vel=0.5, kind='saw', cutoff=1800, attack=0.6, release=0.8, voices=3, spread=9, vib=0.0):
    """Detuned wavetable pad (strings, synth pads, organ-ish with kind='square')."""
    n = int(dur * SR)
    y = np.zeros(n, np.float32)
    for v in range(voices):
        det = (v - (voices - 1) / 2) * spread
        y += osc(kind, f, n, detune=det, vib=vib, vib_rate=4.5 + v * 0.3, phase0=v * 0.37)
    y = lp(y / voices, cutoff, 2).astype(np.float32)
    return y * env_adsr(n, attack, 0.2, 0.85, release) * vel

def lead(f, dur, vel=0.6, kind='square', vib=0.004, cutoff=6000, a=0.005, r=0.08):
    n = int(dur * SR)
    y = osc(kind, f, n, vib=vib, vib_rate=5.5)
    if cutoff < 15000: y = lp(y, cutoff, 1)
    return (y * env_adsr(n, a, 0.08, 0.7, r) * vel).astype(np.float32)

def flute(f, dur, vel=0.6, breath=0.08):
    n = int(dur * SR); t = np.arange(n) / SR
    vib = 1 + 0.006 * np.clip((t - 0.25) / 0.3, 0, 1) * np.sin(2 * np.pi * 5.2 * t)
    ph = np.cumsum(f * vib) / SR
    y = np.sin(2 * np.pi * ph) + 0.22 * np.sin(4 * np.pi * ph) + 0.07 * np.sin(6 * np.pi * ph)
    noise = bp(_rng.standard_normal(n), f * 0.8, f * 3) * breath * 3
    return ((y + noise) * env_adsr(n, 0.07, 0.1, 0.85, 0.12) * vel * 0.7).astype(np.float32)

def bass(f, dur, vel=0.8, kind='sine', drive=1.5, a=0.005, r=0.06):
    n = int(dur * SR)
    y = osc(kind if kind != 'sine' else 'sine', f, n)
    if kind == 'sine': y = y + 0.25 * osc('tri', f * 2, n)
    y = np.tanh(y * drive) / np.tanh(drive)
    return (y * env_adsr(n, a, 0.15, 0.75, r) * vel).astype(np.float32)

def upright(f, dur, vel=0.8):
    """Plucked upright/acoustic bass."""
    y = pluck(f, dur, vel, bright=0.15, decay=0.993)
    t = np.arange(len(y)) / SR
    return lp(y + 0.4 * np.sin(2 * np.pi * f * t) * exp_decay(len(y), 0.6) * vel, 1200).astype(np.float32)

# ---------- drums ----------
@lru_cache(maxsize=128)
def _drum(kind, vel, tone):
    if kind == 'kick':
        n = int(0.5 * SR); t = np.arange(n) / SR
        f = 45 + 110 * np.exp(-t * 28) * tone
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
        y[:200] += _rng.standard_normal(200) * 0.3 * np.linspace(1, 0, 200)
    elif kind == 'snare':
        n = int(0.3 * SR); t = np.arange(n) / SR
        y = bp(_rng.standard_normal(n), 1500, 8000) * np.exp(-t * 18) * 0.9 + np.sin(2 * np.pi * 190 * tone * t) * np.exp(-t * 25) * 0.6
    elif kind == 'hat':
        n = int(0.08 * SR); t = np.arange(n) / SR
        y = hp(_rng.standard_normal(n), 7000) * np.exp(-t * 60)
    elif kind == 'openhat':
        n = int(0.35 * SR); t = np.arange(n) / SR
        y = hp(_rng.standard_normal(n), 6500) * np.exp(-t * 9)
    elif kind == 'clap':
        n = int(0.25 * SR); t = np.arange(n) / SR
        e = np.exp(-t * 30); e[:int(.01 * SR)] *= 1.2; e[int(.02 * SR):int(.03 * SR)] *= 1.4
        y = bp(_rng.standard_normal(n), 900, 5000) * e
    elif kind == 'shaker':
        n = int(0.09 * SR); t = np.arange(n) / SR
        y = bp(_rng.standard_normal(n), 4000, 12000) * np.sin(np.pi * np.clip(t / 0.09, 0, 1)) ** 2
    elif kind == 'brush':
        n = int(0.22 * SR); t = np.arange(n) / SR
        y = bp(_rng.standard_normal(n), 1800, 9000) * (np.clip(t / 0.03, 0, 1) * np.exp(-t * 14)) * 0.7
    elif kind == 'rim':
        n = int(0.06 * SR); t = np.arange(n) / SR
        y = (np.sin(2 * np.pi * 1700 * t) + 0.5 * bp(_rng.standard_normal(n), 2000, 6000)) * np.exp(-t * 80)
    elif kind == 'tom':
        n = int(0.5 * SR); t = np.arange(n) / SR
        f = 90 * tone + 60 * np.exp(-t * 18)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6)
    elif kind == 'taiko':
        n = int(1.4 * SR); t = np.arange(n) / SR
        f = 55 * tone + 50 * np.exp(-t * 14)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2) + lp(_rng.standard_normal(n), 400) * np.exp(-t * 12) * 0.8
    elif kind == 'kendang_lo':
        n = int(0.45 * SR); t = np.arange(n) / SR
        f = 85 * tone + 50 * np.exp(-t * 10) + 25 * np.exp(-t * 3)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    elif kind == 'kendang_hi':
        n = int(0.15 * SR); t = np.arange(n) / SR
        y = (np.sin(2 * np.pi * 420 * tone * t) * 0.6 + bp(_rng.standard_normal(n), 700, 3500)) * np.exp(-t * 35)
    elif kind == 'frame':
        n = int(0.6 * SR); t = np.arange(n) / SR
        y = np.sin(2 * np.pi * (70 * tone + 30 * np.exp(-t * 12)) * t) * np.exp(-t * 6) + lp(_rng.standard_normal(n), 900) * np.exp(-t * 20) * 0.5
    elif kind == 'chipnoise':
        n = int(0.12 * SR); t = np.arange(n) / SR
        y = np.sign(_rng.standard_normal(n // 8 + 1).repeat(8)[:n]) * np.exp(-t * 35) * 0.6
    elif kind == 'chipkick':
        n = int(0.15 * SR); t = np.arange(n) / SR
        f = 60 + 300 * np.exp(-t * 40)
        y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 22) * 0.7
    elif kind == 'heartbeat':
        n = int(0.7 * SR); t = np.arange(n) / SR
        b = lambda t0: np.sin(2 * np.pi * 50 * (t - t0)) * np.exp(-np.clip(t - t0, 0, None) * 18) * (t >= t0)
        y = b(0) + 0.7 * b(0.22)
    elif kind == 'timpani':
        n = int(2.0 * SR); t = np.arange(n) / SR
        y = sum(a * np.sin(2 * np.pi * 98 * tone * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 1.8), (1.5, .5, 2.5), (1.99, .3, 3.5)]) + lp(_rng.standard_normal(n), 300) * np.exp(-t * 30) * 0.6
    else:
        raise ValueError('unknown drum ' + kind)
    y = np.asarray(y, np.float32)
    return (y / (np.max(np.abs(y)) or 1) * vel).astype(np.float32)

def drum(kind, vel=0.8, tone=1.0):
    return _drum(kind, _q(vel), _q(tone, 0.02)).copy()

# ---------- textures ----------
def vinyl(dur, amt=0.5):
    n = int(dur * SR)
    y = lp(_rng.standard_normal(n) * 0.04, 2500)
    pops = _rng.random(n) < 6 / SR
    y[pops] += _rng.standard_normal(pops.sum()) * 0.8
    y += 0.012 * np.sin(2 * np.pi * 60 * np.arange(n) / SR)
    return (y * amt).astype(np.float32)

def noise_bed(dur, lo=200, hi=3000, amt=0.3, wobble=0.15):
    n = int(dur * SR); t = np.arange(n) / SR
    y = bp(_rng.standard_normal(n), lo, hi) * (1 + wobble * np.sin(2 * np.pi * 0.13 * t) + wobble * np.sin(2 * np.pi * 0.07 * t + 1))
    return (y * amt / 3).astype(np.float32)

# ---------- effects ----------
@lru_cache(maxsize=16)
def _ir(rt60, bright, pre):
    n = int(rt60 * SR); t = np.arange(n) / SR
    out = []
    for ch in range(2):
        r = np.random.default_rng(11 + ch).standard_normal(n)
        e = np.exp(-6.9 * t / rt60)
        early = np.zeros(n)
        for k in range(12):
            p = int((0.008 + 0.006 * k + 0.003 * ch) * SR)
            if p < n: early[p] += 0.6 * (0.8 ** k)
        x = r * e
        x = lp(x, 2000 + bright * 9000, 1)
        x = np.concatenate([np.zeros(int(pre * SR)), x + early])[:n]
        out.append((x / np.sqrt(np.sum(x ** 2))).astype(np.float32))
    return out

def reverb(st, mix=0.25, rt60=2.2, bright=0.5, pre=0.02):
    """Convolution reverb on a stereo (2, n) signal."""
    L, R = _ir(round(rt60, 2), round(bright, 2), round(pre, 3))
    wl = fftconvolve(st[0], L)[: st.shape[1]]
    wr = fftconvolve(st[1], R)[: st.shape[1]]
    return np.stack([st[0] * (1 - mix) + wl * mix * 2.2, st[1] * (1 - mix) + wr * mix * 2.2]).astype(np.float32)

def wobble(x, depth=0.0018, rate=0.6):
    """Tape wow: tiny pitch drift (lo-fi, vintage)."""
    n = x.shape[-1]; idx = np.arange(n) + depth * SR * np.sin(2 * np.pi * rate * np.arange(n) / SR)
    idx = np.clip(idx, 0, n - 1)
    if x.ndim == 1: return np.interp(idx, np.arange(n), x).astype(np.float32)
    return np.stack([np.interp(idx, np.arange(n), c) for c in x]).astype(np.float32)

def bitcrush(x, bits=6, down=3):
    q = 2 ** bits
    y = np.round(x * q) / q
    if down > 1: y = np.repeat(y[..., ::down], down, axis=-1)[..., : x.shape[-1]]
    return y.astype(np.float32)

def pan2(mono, p=0.0):
    """Equal-power pan, p in [-1, 1]."""
    a = (p + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)]).astype(np.float32)
