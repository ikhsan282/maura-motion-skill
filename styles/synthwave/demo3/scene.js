// Synthwave demo 3: "Roland TR-808 — Mesin Drum Gagal 1980 yang Menjadi Detak Jantung Musik Modern"
import * as K from '/styles/synthwave/kit.js';
const { clamp, lerp, ease, hrand, noise, TAU } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, captions: { preset: 'neon', y: 1470, size: 60, maxWords: 4 } };

let g;
const C = {};
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// Draw iconic Roland TR-808 Rhythm Composer in Synthwave Neon + 16 Red/Orange/Yellow/White Step Pads
function drawTR808(g, x, y, s = 1, t = 0, { stepSpeed = 8, decayVal = 0.5, highlightDecay = false } = {}) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);

  // Dark angled chassis
  g.fillStyle = '#0c0318';
  g.beginPath(); g.roundRect(-430, -240, 860, 480, 20); g.fill();
  g.beginPath(); g.roundRect(-430, -240, 860, 480, 20);
  K.neon(g, P.cyan, 3.5, { halo: 0.7 });

  // Orange top stripe & header
  g.beginPath(); g.moveTo(-400, -175); g.lineTo(400, -175);
  K.neon(g, P.orange, 3, { halo: 0.5 });
  K.neonText(g, 'RHYTHM COMPOSER  TR-808', 0, -206, { size: 28, color: P.orange });

  // 11 Channel strips with rotary knobs (BD, SD, LT, MT, HT, RS, CP, CB, CY, OH, CH)
  const chNames = ['BD', 'SD', 'LT', 'MT', 'HT', 'RS', 'CP', 'CB', 'CY', 'OH', 'CH'];
  for (let i = 0; i < 11; i++) {
    const cx = -345 + i * 69;
    // Vertical channel divider
    g.beginPath();
    g.moveTo(cx, -155); g.lineTo(cx, 55);
    K.neon(g, P.violet, 1.5, { alpha: 0.45, halo: 0 });
    // Top rotary knob (Level) & second rotary knob (Tone/Decay)
    for (let r = 0; r < 2; r++) {
      const ky = -120 + r * 66;
      const isBDDecay = i === 0 && r === 1;
      const col = isBDDecay && highlightDecay ? P.red : r === 0 ? P.orange : P.cyan;
      if (isBDDecay && highlightDecay) K.glow(g, cx, ky, 55, P.red, 0.8);
      g.beginPath(); g.arc(cx, ky, 20, 0, TAU);
      K.neon(g, col, isBDDecay && highlightDecay ? 3.5 : 2.2, { halo: isBDDecay ? 0.8 : 0.2 });
      const ang = isBDDecay ? lerp(-2.2, 0.8, decayVal) : -0.8 + Math.sin(i + r) * 0.9;
      g.beginPath(); g.moveTo(cx, ky); g.lineTo(cx + Math.cos(ang) * 18, ky + Math.sin(ang) * 18);
      K.neon(g, P.white, 2, { halo: 0 });
    }
    // Channel badge
    g.fillStyle = i === 0 && highlightDecay ? P.red : P.yellow;
    g.font = "700 18px 'Orbitron', sans-serif";
    g.textAlign = 'center';
    g.fillText(chNames[i], cx, 42);
  }

  // Famous 16 Step Sequencer Buttons along the bottom (4 Red, 4 Orange, 4 Yellow, 4 White)
  const activeStep = Math.floor(t * stepSpeed) % 16;
  const padColors = [P.red, P.orange, P.yellow, P.white];
  for (let k = 0; k < 16; k++) {
    const px = -382 + k * 51, py = 145;
    const pCol = padColors[Math.floor(k / 4)];
    const isOn = k === activeStep;
    if (isOn) K.glow(g, px, py, 52, pCol, 0.95);
    g.fillStyle = isOn ? '#ffffff' : pCol;
    g.globalAlpha = isOn ? 1 : 0.72;
    g.beginPath(); g.roundRect(px - 19, py - 34, 38, 68, 6); g.fill();
    g.globalAlpha = 1;
    // Red LED dot above each pad
    g.fillStyle = isOn ? '#ff2bd6' : '#3a0a2e';
    g.beginPath(); g.arc(px, py - 48, isOn ? 7 : 4, 0, TAU); g.fill();
  }
  g.restore();
}

function world(t, o = {}) {
  K.sky(g, t);
  K.sun(g, t, o.sun || {});
  if (o.mtn !== false) K.mountains(g, t);
  K.grid(g, t, o.grid || {});
}

function title(str, y, t, t0, opts = {}) {
  if (t < t0) return;
  const p = ease.outBack(clamp((t - t0) / 0.35), 1.6);
  K.chrome(g, str, 540, y, { scale: 0.6 + 0.4 * p, alpha: clamp((t - t0) / 0.15), ...opts });
}

export async function setup(AM) {
  g = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('drum_hit', 0.12, { gain: 0.55 });
  AM.sfx('whoosh', C.linn.start + 0.15, { gain: 0.4 });
  AM.sfx('glitch', C.transistor.start + 0.2, { gain: 0.4 });
  AM.sfx('drum_hit', C.gagal.start + 0.2, { gain: 0.45, pitch: 0.85 });
  AM.sfx('chime', C.pegadaian.start + 0.2, { gain: 0.4 });
  AM.sfx('boom', C.subbass.start + 0.25, { gain: 0.65 });
  AM.sfx('drum_hit', C.planet.start + 0.2, { gain: 0.55 });
  AM.sfx('boom', C.akhir.start + 0.2, { gain: 0.55 });
}

// 1. Hook: 1980 Roland TR-808 Rhythm Composer debuts
shot('hook', (t, a, b) => {
  world(t, { grid: { speed: 1.5 } });
  drawTR808(g, 540, 880, 1.02, t, { stepSpeed: 8 });
  title('TR-808', 270, t, a, { size: 215, rim: P.orange });
  K.neonText(g, 'JEPANG 1980 · DIEJEK KARENA TAK MIRIP DRUM ASLI', 540, 445, { size: 32, color: P.cyan });
});

// 2. $5,000 Digital Linn LM-1 vs Analog Oscillator Circuit TR-808
shot('linn', (t, a, b) => {
  const lt = t - a;
  K.sky(g, t);
  K.grid(g, t, { speed: 0.9, color: P.violet, color2: P.cyan });
  title('DIGITAL VS ANALOG', 240, t, a, { size: 130, rim: P.cyan });

  // Left card: Linn LM-1 ($5,000 Digital Sample)
  g.save(); g.translate(290, 740);
  g.beginPath(); g.roundRect(-210, -220, 420, 440, 18); K.neon(g, P.violet, 3.5);
  K.neonText(g, 'LINN LM-1', 0, -145, { size: 42, color: P.violet });
  K.neonText(g, '$5.000 USD', 0, -65, { size: 52, color: P.yellow });
  K.neonText(g, 'REKAMAN SAMPEL', 0, 35, { size: 30, color: P.white });
  K.neonText(g, 'DRUM AKUSTIK ASLI', 0, 85, { size: 28, color: P.cyan });
  g.restore();

  // Right card: Roland TR-808 ($1,195 Pure Analog Oscillators)
  g.save(); g.translate(790, 740);
  g.beginPath(); g.roundRect(-210, -220, 420, 440, 18); K.neon(g, P.orange, 3.5);
  K.neonText(g, 'ROLAND TR-808', 0, -145, { size: 40, color: P.orange });
  K.neonText(g, 'MURNI ANALOG', 0, -65, { size: 44, color: P.pink });
  K.neonText(g, 'OSILATOR SIRKUIT', 0, 35, { size: 30, color: P.white });
  K.neonText(g, ' SINTESIS GELOMBANG', 0, 85, { size: 28, color: P.cyan });
  g.restore();
});

// 3. Ikutaro Kakehashi & the defective 2SC828-R noisy transistor
shot('transistor', (t, a, b) => {
  const lt = t - a;
  K.sky(g, t);
  K.grid(g, t, { speed: 1.1 });
  title('2SC828-R', 260, t, a, { size: 175, rim: P.pink });
  K.neonText(g, 'RAHASIA TRANSISTOR CACAT IKUTARO KAKEHASHI', 540, 425, { size: 32, color: P.cyan });

  // Neon schematic of the 3-legged transistor + white noise oscilloscope
  g.save(); g.translate(540, 690);
  K.glow(g, 0, -30, 180, P.pink, 0.55);
  g.beginPath();
  g.roundRect(-85, -135, 170, 140, 18);
  g.moveTo(-50, 5); g.lineTo(-70, 130);
  g.moveTo(0, 5); g.lineTo(0, 130);
  g.moveTo(50, 5); g.lineTo(70, 130);
  K.neon(g, P.cyan, 4, { halo: 0.8 });
  K.neonText(g, 'NOISE', 0, -65, { size: 36, color: P.yellow });
  g.restore();

  const hits = [a + 0.2, a + 0.9, a + 1.6, a + 2.3, a + 3.0];
  K.scope(g, 90, 910, 900, 220, t, hits, { tail: 0.9, color: P.pink, label: 'WHITE NOISE → SNARE & SIZZLING HI-HAT', span: 2.0 });
});

// 4. Commercial Flop — Discontinued in 1983 after only ~12,000 units
shot('gagal', (t, a, b) => {
  const lt = t - a;
  world(t, { sun: { y: K.HZ - 100, alpha: 0.45 }, grid: { speed: 0.6 } });
  drawTR808(g, 540, 880, 0.96, t, { stepSpeed: 2 });
  title('STOP 1983', 270, t, a, { size: 185, rim: P.red });
  K.neonText(g, 'DIANGGAP GAGAL · HANYA 12.000 UNIT DIPRODUKSI', 540, 440, { size: 32, color: P.yellow });
  // Big neon X stamp
  const k = clamp((lt - 0.35) / 0.3);
  if (k > 0) {
    g.beginPath();
    g.moveTo(220, 660); g.lineTo(lerp(220, 860, k), lerp(660, 1100, k));
    g.moveTo(860, 660); g.lineTo(lerp(860, 220, k), lerp(660, 1100, k));
    K.neon(g, P.red, 8, { halo: 1 });
  }
});

// 5. Pawn Shop Miracle — $100 bargain bin rescues the TR-808
shot('pegadaian', (t, a, b) => {
  const lt = t - a;
  world(t, { grid: { speed: 1.4, color: P.green, color2: P.cyan } });
  drawTR808(g, 540, 900, 1.0, t, { stepSpeed: 10 });
  title('$100 SAJA!', 270, t, a, { size: 195, rim: P.yellow });
  K.neonText(g, 'OBRAL TOKO PEGADAIAN → DIBORONG PRODUSER MUDA', 540, 445, { size: 32, color: P.cyan });
});

// 6. Cranking the Bass Drum DECAY knob -> Sub-bass sine wave shakes the club!
shot('subbass', (t, a, b) => {
  const lt = t - a;
  const dec = clamp(lt / 1.2);
  const boom = Math.abs(Math.sin(t * 6)) * dec;
  const [sx, sy] = [noise.n2(t * 35, 1) * 18 * boom, noise.n2(t * 35, 2) * 18 * boom];
  g.save(); g.translate(sx, sy);
  world(t, { pulse: boom, speed: 1.5 + boom * 2.5 });
  K.rings(g, 540, 880, t, a + 0.3, { max: 1100, n: 5, dur: 1.2, color: P.red });
  K.rings(g, 540, 880, t, a + 1.5, { max: 1100, n: 5, dur: 1.2, color: P.orange });
  drawTR808(g, 540, 880, 1.04, t, { stepSpeed: 12, decayVal: dec, highlightDecay: true });
  g.restore();
  title('SUB-BASS 808', 260, t, a, { size: 165, rim: P.red });
  K.neonText(g, 'KENOP DECAY MENTOK KANAN → DENTUMAN FREKUENSI RENDAH', 540, 430, { size: 30, color: P.yellow });
});

// 7. Planet Rock (Afrika Bambaataa) & Sexual Healing (Marvin Gaye)
shot('planet', (t, a, b) => {
  const lt = t - a;
  world(t, { pulse: 0.4, speed: 1.8 });
  for (let i = 0; i < 10; i++) {
    const lv = 0.3 + 0.65 * Math.abs(Math.sin(t * 7 + i * 0.7));
    K.vu(g, 135 + i * 84, 620, 52, 420, lv, { peak: Math.min(1, lv + 0.12) });
  }
  title('1982 HITS', 270, t, a, { size: 195, rim: P.mag });
  K.neonText(g, 'PLANET ROCK · SEXUAL HEALING', 540, 445, { size: 42, color: P.cyan });
  K.neonText(g, '16 TOMBOL WARNA-WARNI PENGUBAH SEJARAH MUSIK', 540, 515, { size: 30, color: P.yellow });
});

// 8. Finale: Failed at copying the past, invented the sound of the future
shot('akhir', (t, a, b) => {
  world(t, { sun: { pulse: 0.5 }, grid: { speed: 2.0, pulse: 0.4 } });
  drawTR808(g, 540, 920, 1.05, t, { stepSpeed: 14, decayVal: 1, highlightDecay: true });
  title('DETAK JANTUNG', 260, t, a, { size: 155, rim: P.cyan });
  title('MUSIK MODERN', 435, t, a + 0.3, { size: 155, rim: P.mag });
  K.neonText(g, 'GAGAL MENIRU MASA LALU · MELAHIRKAN SUARA MASA DEPAN', 540, 580, { size: 30, color: P.yellow });
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  g.save(); s.fn(t, Math.max(0, a), b); g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0);
  K.crtOverlay(g);
  AM.lib.vignette(g, { strength: 0.5, inner: 0.4 });
}

