// Kartun Outline Tebal — Demo 3: Rapat Tengah Malam Penghuni HP-mu (Memori Penuh 99%!)
import * as K from '/styles/kartun-outline-tebal/kit.js';
const { clamp, lerp, ease } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'comic', y: 1490, size: 70 } };

let ctx, fx;
const C = {};
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};
function camera(z = 1, cx = 540, cy = 960, rot = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, 960);
  ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}
const popIn = (t, at, d = 0.3) => clamp((t - at) / d);

// 1. Hook — 02:00 AM Midnight Emergency Meeting (Storage 99% Full!)
shot('hook', (t, a, b) => {
  camera(1.06, 540, 960);
  K.sunburst(ctx, t, { c1: '#5b3fd6', c2: '#3a249c', y: 940, speed: 0.15 });
  K.dots(ctx, { col: 'rgba(10,0,40,0.18)' });
  K.floor(ctx, 1340, '#1fc8b0');

  K.char(ctx, 'kamera', 220, 1350, 0.78, { t, mood: 'worried', open: 0.4, look: [0.6, 0] });
  K.char(ctx, 'baterai', 540, 1350, 1.05, { t, level: 0.99, mood: 'angry', sweat: true, open: 0.65 });
  K.char(ctx, 'chat', 860, 1350, 0.78, { t, face: -1, mood: 'worried', open: 0.4, badge: 999 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.percent(ctx, 99, 540, 310, { size: 195, col: K.PAL.red, k: popIn(t, a + 0.05, 0.3), t });
  K.textSticker(ctx, 'MEMORI PENUH!', 540, 520, { size: 82, col: K.PAL.yellow, txt: K.PAL.ink, k: popIn(t, a + 0.35, 0.3), rot: -0.05, t, sway: 1 });
});

// 2. Kamera — 4,000 Blurry Photos Hoarder
shot('kamera', (t, a, b) => {
  camera(1.15, 540, 1040);
  K.sunburst(ctx, t, { c1: '#ff8a1f', c2: '#ffd23f', y: 920, speed: 0.22 });
  K.dots(ctx, { col: 'rgba(100,30,0,0.12)' });
  K.floor(ctx, 1380, '#5b3fd6');

  const flash = (t * 2) % 1 < 0.2 ? 0.8 : 0;
  K.char(ctx, 'kamera', 540, 1390, 1.1, { t, flash, mood: 'happy', smile: 1, open: 0.5, hop: Math.abs(Math.sin(t * 6)) * 35 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'TERSANGKA #1: KAMERA', 540, 320, { size: 68, col: K.PAL.white, txt: K.PAL.ink, k: popIn(t, a + 0.1, 0.3), rot: -0.04, t });
  K.textSticker(ctx, '4.000 FOTO BURAM!', 540, 500, { size: 84, col: K.PAL.orange, txt: K.PAL.white, k: popIn(t, a + 0.4, 0.3), rot: 0.06, t, sway: 1 });
});

// 3. Chat — Auto-Downloading Family Group Videos
shot('chat', (t, a, b) => {
  camera(1.15, 540, 1040);
  K.sunburst(ctx, t, { c1: '#2fd96b', c2: '#1fc8b0', y: 920, speed: 0.22 });
  K.dots(ctx, { col: 'rgba(0,70,30,0.12)' });
  K.floor(ctx, 1380, '#ff5fa2');

  K.char(ctx, 'chat', 540, 1390, 1.1, { t, mood: 'normal', open: 0.6, sweat: true, badge: Math.round(lerp(100, 999, clamp((t - a) / 2.5))) });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'AUTO-DOWNLOAD AKTIF', 540, 320, { size: 68, col: K.PAL.white, txt: K.PAL.ink, k: popIn(t, a + 0.1, 0.3), rot: 0.04, t });
  K.textSticker(ctx, 'VIDEO GRUP KELUARGA!', 540, 500, { size: 74, col: K.PAL.yellow, txt: K.PAL.ink, k: popIn(t, a + 0.4, 0.3), rot: -0.06, t, sway: 1 });
});

// 4. Peta & Game — Background 5 GB Updates
shot('peta', (t, a, b) => {
  camera(1.14, 540, 1040);
  K.sunburst(ctx, t, { c1: '#b28cff', c2: '#8b5cff', y: 940, speed: 0.25 });
  K.dots(ctx, { col: 'rgba(40,0,90,0.14)' });
  K.floor(ctx, 1380, '#ffd23f');

  K.char(ctx, 'game', 340, 1390, 0.9, { t, mood: 'star', open: 0.5, smile: 0.8 });
  K.char(ctx, 'peta', 760, 1390, 0.9, { t, face: -1, mood: 'normal', open: 0.4 });
  K.zap(ctx, 360, 1120, 740, 1120, t, { col: K.PAL.sky });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.burst(ctx, '5 GB!', 540, 330, { size: 125, k: popIn(t, a + 0.1, 0.25), col: K.PAL.yellow, txt: K.PAL.red, t });
  K.textSticker(ctx, 'UPDATE DI BALIK LAYAR', 540, 530, { size: 72, col: K.PAL.white, txt: K.PAL.purple, k: popIn(t, a + 0.4, 0.3), rot: 0.05, t });
});

// 5. Musik — Storage Suffocating & Phone Freezing
shot('musik', (t, a, b) => {
  camera(1.12, 540, 980);
  K.sunburst(ctx, t, { c1: '#ff3b3b', c2: '#ff6a2a', y: 940, speed: 0.45 });
  K.dots(ctx, { col: 'rgba(100,0,0,0.15)' });
  K.floor(ctx, 1340, '#2f5bff');

  K.fightCloud(ctx, 540, 980, t, 1.1);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'SISTEM MACET / LAG!', 540, 320, { size: 82, col: K.PAL.yellow, txt: K.PAL.ink, k: popIn(t, a + 0.1, 0.3), rot: -0.05, t, sway: 1 });
  K.textSticker(ctx, 'GAGAL SCAN QRIS!', 540, 500, { size: 78, col: K.PAL.white, txt: K.PAL.red, k: popIn(t, a + 0.45, 0.3), rot: 0.06, t });
});

// 6. Akhir — Clean Cache & Turn Off Auto-Download
shot('akhir', (t, a, b) => {
  camera(1.15, 540, 1060);
  K.sunburst(ctx, t, { c1: '#41c7ff', c2: '#2f5bff', y: 980, speed: 0.14 });
  K.dots(ctx, { col: 'rgba(0,40,90,0.12)' });
  K.floor(ctx, 1380, '#2fd96b');

  K.char(ctx, 'baterai', 340, 1390, 0.9, { t, level: 0.45, mood: 'happy', smile: 1, open: 0.4, hop: Math.abs(Math.sin(t * 5)) * 22 });
  K.char(ctx, 'musik', 760, 1390, 0.85, { t, face: -1, mood: 'happy', smile: 1, open: 0.35 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'SOLUSI HP NGEBUT', 540, 290, { size: 70, col: K.PAL.ink, txt: K.PAL.yellow, k: popIn(t, a + 0.05, 0.25), rot: -0.04, t });
  K.textSticker(ctx, 'BERSIHKAN CACHE MINGGUAN', 530, 470, { size: 62, col: K.PAL.white, k: popIn(t, a + 0.35, 0.25), rot: -0.06, t, sway: 1, icon: K.ICONS.sun });
  K.textSticker(ctx, 'MATIKAN AUTO-DOWNLOAD', 550, 650, { size: 64, col: K.PAL.lime, k: popIn(t, a + 0.7, 0.25), rot: 0.05, t, sway: 1, icon: K.ICONS.leaf });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (since < 0.12 && s.id !== 'hook') {
    fx.fillStyle = `rgba(255,255,255,${0.6 * (1 - since / 0.12)})`;
    fx.fillRect(0, 0, AM.W, AM.H);
  }
  AM.lib.vignette(fx, { strength: 0.22, inner: 0.6 });
}

