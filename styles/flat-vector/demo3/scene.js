// Flat Vector Explainer — Demo 3: Cahaya di Wajahmu Lebih Tua dari Peradaban (170.000 Tahun Perjalanan Foton)
import * as K from '/styles/flat-vector/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;

export const meta = {
  fps: 24,
  captions: { preset: 'bold', y: 1480, size: 58, active: '#ffd65e', stroke: 9, strokeColor: '#0b1230', anim: 'rise', maxWords: 4 },
};

let ctx, fx;
const C = {};
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const reset = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// 1. Hook — Morning Sunlight Beam on Face vs Ancient Pyramids
shot('hook', (t, a, b) => {
  K.space(ctx, t, { top: '#0c183c', bottom: '#233b7a', px: t * 10 });
  K.beam(ctx, 1080, 100, 360, 1280, 120, 420, 0.9, '#ffd77a');
  K.person(ctx, 420, 1060, { s: 0.92, t, mood: 'joy', lit: 0.9, look: [0.4, -0.3] });
  K.photon(ctx, 720 + Math.sin(t * 4) * 20, 640 + Math.cos(t * 3) * 20, { r: 58, t, heat: 1, mood: 'happy', look: [-0.5, 0.3] });

  // Pyramid comparison badge
  K.icon(ctx, 'pyramid', 820, 1140, 1.35, t);
  reset();
  K.headline(ctx, 'CAHAYA PAGI INI', 540, 280, { size: 76, p: K.pop(t, a + 0.1, 0.45), accent: '#ffd65e' });
  K.badge(ctx, 'LEBIH TUA DARI PIRAMIDA (±4.500 THN)', 540, 395, { p: K.pop(t, a + 0.35, 0.45), size: 38, accent: '#ffa63f' });
});

// 2. Inti — Sun Surface to Earth (8 Minutes) vs Deep Interior
shot('inti', (t, a, b) => {
  K.space(ctx, t, { px: t * 14 });
  const p = prog(t, a, b);
  K.sun(ctx, 300, 860, 310, t, { cut: clamp((p - 0.25) * 1.6), a0: -0.3, open: 1.4 });
  K.earth(ctx, 900, 860, 110, t, { sunDir: Math.PI });
  K.speedLines(ctx, 640, 860, 0, t, { n: 5, len: 180, spread: 40 });
  K.photon(ctx, lerp(580, 760, (t * 0.6) % 1), 860, { r: 38, t, vx: 1800, heat: 1, mood: 'happy' });

  reset();
  K.headline(ctx, 'BUKAN CUMA 8 MENIT!', 540, 290, { size: 74, p: K.pop(t, a + 0.1, 0.45), accent: '#6cc8ff' });
  K.badge(ctx, 'PERMUKAAN → BUMI = 8 MENIT 20 DETIK', 540, 410, { p: K.pop(t, a + 0.3, 0.45), size: 38 });
});

// 3. Fusi — Born in the 15 Million °C Solar Core
shot('fusi', (t, a, b) => {
  K.space(ctx, t, { top: '#140826', bottom: '#3a1432' });
  K.sun(ctx, 540, 880, 440, t, { cut: 1, a0: -Math.PI * 0.5, open: Math.PI * 0.85 });
  K.burst(ctx, 540, 880, (t - a) % 1.2, { n: 12, r0: 40, r1: 210, color: '#ffffff', life: 1.1 });
  K.photon(ctx, 540, 880, { r: 64, t, heat: 0.1, mood: 'wow' });

  reset();
  K.headline(ctx, 'INTI MATAHARI', 540, 270, { size: 80, p: K.pop(t, a + 0.1, 0.45), accent: '#fff7d1' });
  K.badge(ctx, 'SUHU 15.000.000 °C · FUSI HIDROGEN', 540, 390, { p: K.pop(t, a + 0.3, 0.45), size: 40, accent: '#8f7bff' });
});

// 4. Acak — Dense Radiative Zone Plasma & Pinball Collisions
shot('acak', (t, a, b) => {
  K.space(ctx, t, { top: '#260b1e', bottom: '#5e1c24' });
  K.plasma(ctx, t, { n: 65, cols: ['#ff7d5a', '#ffb347', '#8f7bff'], rmin: 14, rmax: 32 });
  const P = K.boundedWalk(7, 90, 85, (x, y) => Math.hypot(x - 540, y - 880) < 360, 540, 880);
  const u = clamp((t - a) / (b - a)) * 75;
  const cur = K.along(P, u);
  K.trail(ctx, P, u, { color: '#ffe86b', width: 8, fade: 35 });
  K.ring(ctx, cur.x, cur.y, (t * 3) % 0.35, { r: 75, color: '#ffffff' });
  K.photon(ctx, cur.x, cur.y, { r: 52, t, vx: cur.dx * 15, vy: cur.dy * 15, heat: 0.35, mood: 'dizzy' });

  reset();
  K.headline(ctx, 'ZONA RADIASI PADAT', 540, 270, { size: 72, p: K.pop(t, a + 0.1, 0.45), accent: '#ffa63f' });
  K.badge(ctx, 'MENABRAK PLASMA MILIARAN KALI', 540, 385, { p: K.pop(t, a + 0.3, 0.45), size: 40 });
});

// 5. Waktu — 170,000 Years Random Walk Counter
shot('waktu', (t, a, b) => {
  K.space(ctx, t, { px: t * 12 });
  K.sun(ctx, 540, 920, 410, t, { cut: 1, a0: -Math.PI * 0.5, open: Math.PI * 1.15 });
  const P = K.boundedWalk(19, 180, 48, (x, y) => Math.hypot(x - 540, y - 920) < 285, 540, 920);
  const p = clamp((t - a) / (b - a));
  const u = p * 170;
  const cur = K.along(P, u);
  K.trail(ctx, P, u, { color: '#fff7d1', width: 6, fade: 90, old: 0.35 });
  K.photon(ctx, cur.x, cur.y, { r: 42, t, heat: lerp(0.2, 0.9, p), mood: 'dizzy' });

  reset();
  const yrs = Math.round(lerp(10000, 170000, ease.outCubic(p)));
  K.counter(ctx, yrs, 540, 280, { size: 108, suffix: ' THN', color: '#ffd65e', p: K.pop(t, a + 0.1, 0.4) });
  K.badge(ctx, 'WAKTU UNTUK KELUAR DARI INTI MATAHARI', 540, 405, { p: K.pop(t, a + 0.25, 0.45), size: 36, accent: '#3fd6c6' });
});

// 6. Terbang — Escapes Photosphere & Reaches Earth in 8m 20s
shot('terbang', (t, a, b) => {
  K.space(ctx, t, { px: t * 40 });
  const p = clamp((t - a) / (b - a));
  K.sun(ctx, -120, 900, 340, t);
  K.earth(ctx, 880, 900, 150, t, { sunDir: Math.PI });
  const px = lerp(240, 710, ease.inOutCubic(p));
  K.speedLines(ctx, px, 900, 0, t, { n: 8, len: 260, spread: 80 });
  K.photon(ctx, px, 900, { r: 54, t, vx: 2600, heat: 1, mood: 'joy', look: [1, 0] });

  reset();
  K.headline(ctx, '08 MENIT 20 DETIK', 540, 280, { size: 78, p: K.pop(t, a + 0.1, 0.45), accent: '#7af0b0' });
  K.badge(ctx, 'KECEPATAN CAHAYA: 300.000 KM / DETIK', 540, 400, { p: K.pop(t, a + 0.3, 0.45), size: 38 });
});

// 7. Akhir — Ancient Cave Fire to Modern Morning Sunlight
shot('akhir', (t, a, b) => {
  K.space(ctx, t, { top: '#0c183c', bottom: '#233b7a', px: t * 8 });
  K.beam(ctx, 1080, 80, 380, 1280, 130, 440, 0.95, '#ffd77a');
  K.person(ctx, 430, 1060, { s: 0.92, t, mood: 'joy', lit: 1, look: [0.3, -0.2] });
  K.photon(ctx, 640, 780, { r: 56, t, heat: 1, mood: 'joy' });

  K.icon(ctx, 'cave', 220, 620, 1.35, t);
  K.icon(ctx, 'pyramid', 840, 620, 1.25, t);
  reset();
  K.headline(ctx, 'CAHAYA PURBA 170.000 TAHUN', 540, 280, { size: 62, p: K.pop(t, a + 0.1, 0.45), accent: '#ffd65e' });
  K.badge(ctx, 'LAHIR DI ZAMAN MANUSIA GUA · TIBA HARI INI', 540, 395, { p: K.pop(t, a + 0.3, 0.45), size: 36, accent: '#ff6f91' });
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  reset();
  ctx.globalAlpha = 1;
  AM.lib.vignette(fx, { strength: 0.3, inner: 0.5, color: '4,6,26' });
}

