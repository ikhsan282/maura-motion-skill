// Synthwave demo 1: "Suara Drum 80-an Lahir dari Kecelakaan — Rahasia Gated Reverb Phil Collins"
import * as K from '/styles/synthwave/kit.js';
const { clamp, lerp, ease, hrand, noise } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, captions: { preset: 'neon', y: 1470, size: 60, maxWords: 4 } };

let g;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
let HITS = [];
export async function setup(AM) {
  g = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  HITS = [
    0.12,
    W('hook', '80') - 0.05,
    W('hook', 'kecelakaan'),
    C.studio ? C.studio.start + 0.4 : 2.5,
    W('mic', 'menabuh'),
    W('mic', 'drum') + 0.25,
    W('ledak', 'meledak'),
    W('gate', 'memotong') - 0.6,
    C.ssl ? C.ssl.start + 0.35 : 8.0,
    C.in_the_air ? C.in_the_air.start + 0.25 : 10.0,
    C.in_the_air ? C.in_the_air.start + 0.65 : 10.4,
    C.in_the_air ? C.in_the_air.start + 1.05 : 10.8,
    W('akhir', 'gated'),
    W('akhir', 'seluruh'),
  ];
  AM.sfx('drum_hit', HITS[0], { gain: 0.55 });
  AM.sfx('drum_hit', HITS[2], { gain: 0.5, pitch: 0.9 });
  AM.sfx('drum_hit', HITS[4], { gain: 0.4, pitch: 1.15 });
  AM.sfx('boom', HITS[6], { gain: 0.6 });
  AM.sfx('drum_hit', HITS[7], { gain: 0.45 });
  AM.sfx('glitch', W('gate', 'memotong'), { gain: 0.4 });
  AM.sfx('drum_hit', HITS[8], { gain: 0.5 });
  AM.sfx('drum_hit', HITS[9], { gain: 0.55, pitch: 1.1 });
  AM.sfx('drum_hit', HITS[10], { gain: 0.55, pitch: 0.95 });
  AM.sfx('drum_hit', HITS[11], { gain: 0.6, pitch: 0.85 });
  AM.sfx('drum_hit', HITS[12], { gain: 0.5 });
  AM.sfx('drum_hit', HITS[13], { gain: 0.5, pitch: 1.1 });
}
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const hitAt = (t) => K.hitEnv(t, HITS, 0.18);
function hitsFor(t) {
  const order = ['kick', 'snare', 'tom1', 'tom2', 'floor'];
  const h = {};
  HITS.forEach((ht, i) => {
    const u = t - ht;
    if (u >= -0.05 && u < 0.6) {
      const d = order[i % order.length];
      h[d] = Math.max(h[d] || 0, u < 0 ? 1 + u * 10 : Math.exp(-u / 0.15));
      if (i % 2 === 0) h.kick = Math.max(h.kick || 0, Math.exp(-Math.max(0, u) / 0.12));
    }
  });
  return h;
}
function world(t, { sunY = K.HZ - 150, speed = 1.3, pulse = 0, mtn = true } = {}) {
  K.sky(g, t);
  K.sun(g, t, { y: sunY, pulse });
  if (mtn) K.mountains(g, t);
  K.grid(g, t, { speed, pulse });
}
function title(str, y, t, t0, opts = {}) {
  if (t < t0) return;
  const p = ease.outBack(clamp((t - t0) / 0.35), 1.6);
  K.chrome(g, str, 540, y, { scale: 0.6 + 0.4 * p, alpha: clamp((t - t0) / 0.15), ...opts });
}

// 1. The neon grid, the sun, a drummer: a hit, rings, a waveform with its tail chopped.
shot('hook', (t, a, b) => {
  const pulse = hitAt(t);
  const [sx, sy] = [noise.n2(t * 30, 1) * 10 * pulse, noise.n2(t * 30, 2) * 10 * pulse];
  g.save(); g.translate(sx, sy);
  world(t, { pulse });
  for (const ht of HITS.slice(0, 3)) K.rings(g, 540, 1240, t, ht, { max: 760 });
  K.drummer(g, 540, 1300, 0.95 + 0.03 * pulse, t, { hits: hitsFor(t) });
  g.restore();
  title('80-AN', 330, t, W('hook', '80') - 0.15, { size: 230 });
  K.neonText(g, 'SUARA DRUM PALING IKONIK', 540, 180, { size: 40, color: P.cyan, alpha: clamp(t / 0.3) });
  if (t > W('hook', 'kecelakaan') - 0.1) K.neonText(g, 'SEBUAH KECELAKAAN', 540, 500, { size: 58, color: P.pink, flicker: 0.25, t });
  K.vu(g, 60, 1060, 26, 280, Math.min(1, 0.25 + pulse * 0.9), { peak: Math.min(1, 0.3 + pulse) });
  K.vu(g, 994, 1060, 26, 280, Math.min(1, 0.2 + pulse * 0.85), { peak: Math.min(1, 0.25 + pulse) });
});

// 1b. Townhouse Studio 2 ("Stone Room"), London 1979 — Peter Gabriel III ("Melt") session
shot('studio', (t, a, b) => {
  const lt = t - a;
  K.sky(g, t);
  K.grid(g, t, { speed: 0.5, color: P.cyan, color2: P.violet });
  const vx = 540, vy = 800;
  g.beginPath();
  g.rect(170, 400, 740, 580);
  for (const [x, y] of [[170, 400], [910, 400], [170, 980], [910, 980]]) {
    g.moveTo(x, y); g.lineTo(x + (x - vx) * 2, y + (y - vy) * 2);
  }
  for (let k = 1; k < 6; k++) { g.moveTo(170 + k * 123, 400); g.lineTo(170 + k * 123, 980); }
  for (let k = 1; k < 4; k++) { g.moveTo(170, 400 + k * 145); g.lineTo(910, 400 + k * 145); }
  K.neon(g, P.cyan, 2.2, { alpha: 0.65, halo: 0.4 });
  K.chrome(g, 'LONDON 1979', 540, 235, { size: 135, scale: 0.85 + 0.15 * ease.outBack(clamp(lt / 0.35)) });
  K.neonText(g, 'TOWNHOUSE STUDIO · STONE ROOM', 540, 355, { size: 34, color: P.pink });
  K.drummer(g, 540, 1290, 0.84, t, { hits: hitsFor(t), cymbals: 0, color: P.cyan });
  K.neonText(g, 'SESI REKAMAN PETER GABRIEL · TANPA SIMBAL', 540, 1365, { size: 30, color: P.yellow });
});

// 2. The hanging talkback microphone drops above Phil Collins' kit
shot('mic', (t, a, b) => {
  const lt = t - a, pulse = hitAt(t);
  K.sky(g, t); K.grid(g, t, { speed: 0.4, color: P.violet, color2: P.violet });
  const vx = 540, vy = 820;
  g.beginPath();
  g.rect(190, 420, 700, 560);
  for (const [x, y] of [[190, 420], [890, 420], [190, 980], [890, 980]]) { g.moveTo(x, y); g.lineTo(x + (x - vx) * 2, y + (y - vy) * 2); }
  for (let k = 1; k < 6; k++) { const y = 980 + k * k * 22; g.moveTo(190 - (y - 980) * 0.9, y); g.lineTo(890 + (y - 980) * 0.9, y); }
  for (let k = 1; k < 5; k++) { g.moveTo(190 + k * 140, 420); g.lineTo(190 + k * 140, 980); }
  for (let k = 1; k < 4; k++) { g.moveTo(190, 420 + k * 140); g.lineTo(890, 420 + k * 140); }
  K.neon(g, P.violet, 2, { alpha: 0.55, halo: 0.3 });
  K.drummer(g, 540, 1290, 0.82, t, { hits: hitsFor(t), cymbals: 0, color: P.cyan });
  const swing = Math.sin(lt * 1.8) * 0.05 + pulse * 0.04;
  const mt = W('mic', 'mikrofon') - 0.2;
  const drop = ease.outBack(clamp(lt / 0.6), 1.4);
  K.mic(g, 540, lerp(200, 640, drop), 1.1, { swing, color: P.pink, talk: t > mt ? 1 : 0, t });
  if (t > mt) {
    K.neonText(g, 'TALKBACK MIC', 760, 560, { size: 34, color: P.pink, align: 'left' });
    K.neonText(g, '"cek... cek..."', 760, 610, { size: 28, color: P.white, align: 'left', font: 'Space Mono', weight: 400 });
  }
  K.chrome(g, 'TALKBACK', 540, 235, { size: 140, scale: 0.85 + 0.15 * ease.outBack(clamp(lt / 0.35)) });
  if (t > W('mic', 'Collins') - 0.3) {
    K.neonText(g, 'PHIL COLLINS', 800, 1010, { size: 38, color: P.cyan });
    K.neonText(g, 'DRUMMER GENESIS', 800, 1058, { size: 24, color: P.white });
  }
});

// 3. Crushed by SSL 4000E Listen Mic Compressor -> the sound explodes.
shot('ledak', (t, a, b) => {
  const lt = t - a, bt = W('ledak', 'meledak'), boom = clamp(1 - (t - bt) / 1.2) * (t > bt ? 1 : 0);
  const [sx, sy] = [noise.n2(t * 40, 1) * 26 * boom, noise.n2(t * 40, 2) * 26 * boom];
  g.save(); g.translate(sx, sy);
  world(t, { pulse: boom, speed: 1.3 + boom * 4, sunY: K.HZ - 150 - boom * 60 });
  if (t > bt) {
    K.glow(g, 540, 1150, 900 * (0.6 + boom), P.orange, boom * 0.9);
    K.rings(g, 540, 1150, t, bt, { max: 1200, n: 5, dur: 1.0 });
    K.rings(g, 540, 1150, t, bt + 0.18, { max: 1000, n: 3 });
  }
  const ry = t > bt ? 330 : lerp(-300, 330, ease.outCubic(clamp(lt / 0.5)));
  K.needle(g, 270, ry, 540, 300, t > bt ? 0.98 + noise.n2(t * 20, 4) * 0.02 : lerp(0.1, 0.92, clamp((lt - 0.3) / 1.2)), { color: P.cyan });
  K.neonText(g, 'SSL LISTEN MIC COMPRESSOR', 540, ry - 50, { size: 40, color: P.cyan });
  K.neonText(g, 'RATIO  ∞ : 1', 540, ry + 345, { size: 30, color: P.white, font: 'Space Mono', weight: 700 });
  for (let i = 0; i < 6; i++) K.vu(g, 120 + i * 30 + (i > 2 ? 720 : 0), 1000, 22, 330, t > bt ? Math.min(1, 0.85 + boom * 0.2 + noise.n2(t * 25, i) * 0.1) : 0.35 + noise.n2(t * 8, i) * 0.15, {});
  g.restore();
  if (t > bt - 0.05) K.chrome(g, 'BOOM!', 540, 1180, { size: 260, scale: 0.7 + 0.5 * ease.outBack(clamp((t - bt) / 0.3), 2), rim: P.orange });
});

// 4. The noise gate chops the huge tail: before/after waveforms, the cut.
shot('gate', (t, a, b) => {
  const lt = t - a, cut = W('gate', 'memotong');
  K.sky(g, t); K.sun(g, t, { y: K.HZ + 120, alpha: 0.5 }); K.grid(g, t, { speed: 0.8 });
  const hits = [HITS[7], HITS[7] - 1.1];
  K.neonText(g, 'NOISE GATE', 540, 200, { size: 74, color: P.mag });
  K.neonText(g, 'ENGINEER: HUGH PADGHAM', 540, 285, { size: 30, color: P.cyan });
  K.scope(g, 90, 380, 900, 250, t, hits, { tail: 1.8, color: P.violet, label: 'TANPA GATE', span: 2.4 });
  const gated = t > cut;
  K.scope(g, 90, 700, 900, 250, t, hits, { tail: 1.8, gate: gated ? 0.22 : null, color: gated ? P.cyan : P.violet, label: gated ? 'DENGAN GATE' : '...', threshold: 0.18, span: 2.4 });
  if (t > cut - 0.15 && t < cut + 0.5) {
    const u = clamp((t - cut + 0.15) / 0.2);
    g.beginPath(); g.moveTo(560, lerp(620, 990, ease.inCubic(u)) - 360); g.lineTo(560, lerp(620, 990, ease.inCubic(u))); K.neon(g, P.red, 6);
    if (t > cut) { K.glow(g, 560, 825, 260, P.red, clamp(1 - (t - cut) / 0.5)); K.neonText(g, 'CUT!', 700, 640, { size: 64, color: P.red }); }
  }
  if (gated) for (let i = 0; i < 14; i++) { const u = t - cut - i * 0.02; if (u < 0 || u > 1.2) continue; g.fillStyle = i % 2 ? P.violet : P.cyan; g.globalAlpha = 1 - u / 1.2; g.fillRect(600 + i * 26, 825 + (hrand(i, 3) - 0.5) * 80 + u * u * 700, 14, 4); }
  g.globalAlpha = 1;
  K.drummer(g, 540, 1340, 0.42, t, { hits: hitsFor(t), alpha: 0.9 });
});

// 4b. Acoustic anomaly: Stadium-sized snare hit followed by instant vacuum silence
shot('ssl', (t, a, b) => {
  const lt = t - a;
  world(t, { pulse: hitAt(t), speed: 1.1 });
  K.chrome(g, '0.2 DETIK', 540, 280, { size: 175, rim: P.cyan });
  K.neonText(g, 'LEDAKAN RAKSASA → HENING SEKETIKA', 540, 440, { size: 38, color: P.pink });
  const envHits = [a + 0.35, a + 1.65, a + 2.95, a + 4.25];
  K.scope(g, 90, 540, 900, 320, t, envHits, { tail: 2.0, gate: 0.24, color: P.cyan, label: 'ENVELOPE GATED REVERB (SSL 4000E)', threshold: 0.2, span: 2.6 });
  for (let i = 0; i < 8; i++) {
    const lv = hitAt(t) > 0.25 ? 0.95 : 0.05;
    K.vu(g, 190 + i * 92, 960, 56, 320, lv, { peak: 0.95 });
  }
});

// 4c. 1981: "In the Air Tonight" iconic drum fill & global phenomenon
shot('in_the_air', (t, a, b) => {
  const lt = t - a, pulse = hitAt(t);
  world(t, { pulse, speed: 1.8 });
  for (const ht of HITS.slice(9, 12)) K.rings(g, 540, 1220, t, ht, { max: 880, color: P.cyan });
  K.drummer(g, 540, 1300, 0.96 + 0.04 * pulse, t, { hits: hitsFor(t), color: P.cyan, kitColor: P.mag });
  K.chrome(g, '1981', 540, 280, { size: 210, rim: P.mag });
  K.neonText(g, 'IN THE AIR TONIGHT · PHIL COLLINS', 540, 455, { size: 38, color: P.yellow });
  K.neonText(g, 'DRUM FILL PALING LEGENDARIS ABAD KE-20', 540, 520, { size: 32, color: P.cyan });
});

// 5. "GATED REVERB": tapes from 1980..1989 race out of the horizon; final pose.
shot('akhir', (t, a, b) => {
  const lt = t - a, pulse = hitAt(t);
  world(t, { pulse, speed: 1.6 });
  for (let i = 0; i < 10; i++) {
    const u = ((lt * 0.55 + i * 0.1) % 1);
    if (lt * 0.55 + i * 0.1 < 0.1) continue;
    const s = 0.12 + u * u * 1.2, side = i % 2 ? 1 : -1;
    const x = 540 + side * u * u * 520, y = K.HZ + u * u * 520 - 80 * u;
    if (u > 0.85) continue;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, u * 3, (0.85 - u) * 8);
    g.beginPath(); g.roundRect(-160, -100, 320, 200, 16); K.neon(g, i % 3 ? P.cyan : P.mag, 4);
    g.beginPath(); g.arc(-70, 0, 34, 0, 7); g.moveTo(104, 0); g.arc(70, 0, 34, 0, 7); g.rect(-110, 60, 220, 40); K.neon(g, P.white, 3, { halo: 0 });
    K.neonText(g, String(1980 + (i % 10)), 0, -62, { size: 46, color: P.yellow });
    g.restore();
  }
  K.drummer(g, 540, 1320, 0.7 + 0.02 * pulse, t, { hits: hitsFor(t) });
  title('GATED', 300, t, W('akhir', 'gated') - 0.15, { size: 210 });
  title('REVERB', 500, t, W('akhir', 'reverb') - 0.1, { size: 210, rim: P.cyan });
  if (t > W('akhir', 'seluruh') - 0.1) K.neonText(g, 'SUARA DRUM SELURUH 80-AN', 540, 650, { size: 40, color: P.pink });
  if (t > C.akhir.end - 0.1) K.neonText(g, 'LAHIR DARI MIKROFON UNTUK NGOBROL', 540, 715, { size: 34, color: P.cyan, alpha: clamp((t - C.akhir.end + 0.1) / 0.3) });
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  g.save(); s.fn(t, Math.max(0, a), b); g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (s.id !== 'hook' && since < 0.16) {
    const k = 1 - since / 0.16;
    for (let i = 0; i < 6; i++) { const y = hrand(i, Math.floor(t * 48)) * 1920, h = 20 + hrand(i, 7) * 80; g.drawImage(g.canvas, 0, y, 1080, h, (hrand(i, 3) - 0.5) * 120 * k, y, 1080, h); }
    g.fillStyle = `rgba(255,43,214,${0.18 * k})`; g.fillRect(0, 0, 1080, 1920);
  }
  K.crtOverlay(g);
  AM.lib.vignette(g, { strength: 0.5, inner: 0.4 });
}
