// Kartun Outline Tebal — Demo 2: Drama Alarm Jam Enam Pagi vs Tombol Snooze (Inersia Tidur)
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
const hopAt = (t, at, h = 80, d = 0.45) => {
  const u = (t - at) / d;
  return u > 0 && u < 1 ? Math.sin(u * Math.PI) * h : 0;
};

// 1. Hook — 06:00 AM Alarm Squad Ready for Battle
shot('hook', (t, a, b) => {
  camera(1.08, 540, 980);
  K.sunburst(ctx, t, { c1: '#ffd23f', c2: '#ff6a2a', y: 920, speed: 0.25 });
  K.dots(ctx, { col: 'rgba(120,30,0,0.12)' });
  K.floor(ctx, 1340, '#2f5bff');

  K.char(ctx, 'musik', 320, 1350, 1.05, { t, mood: 'angry', open: 0.7, hop: Math.abs(Math.sin(t * 8)) * 45, armL: [-160, -280], armR: [160, -280] });
  K.char(ctx, 'baterai', 760, 1350, 0.95, { t, level: 0.25, mood: 'tired', sweat: true, open: 0.3, face: -1 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.burst(ctx, '06:00!', 540, 340, { size: 135, k: popIn(t, a + 0.05, 0.3), col: K.PAL.yellow, txt: K.PAL.red, t });
  K.textSticker(ctx, 'KRIIING!!', 540, 560, { size: 78, col: K.PAL.white, txt: K.PAL.ink, k: popIn(t, a + 0.4, 0.3), rot: 0.06, t, sway: 1 });
});

// 2. Snooze — "5 Menit Lagi!" Temptation
shot('snooze', (t, a, b) => {
  camera(1.12, 540, 1020);
  K.sunburst(ctx, t, { c1: '#8b5cff', c2: '#5b3fd6', y: 940, speed: 0.12 });
  K.dots(ctx, { col: 'rgba(20,0,60,0.14)' });
  K.floor(ctx, 1360, '#ff5fa2');

  K.char(ctx, 'game', 540, 1370, 1.1, { t, mood: 'happy', smile: 1, open: 0.4, sq: Math.sin(t * 4) * 0.04, armL: [-180, -220], armR: [180, -220] });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'TOMBOL SNOOZE', 540, 320, { size: 78, col: K.PAL.pink, txt: K.PAL.white, k: popIn(t, a + 0.1, 0.3), rot: -0.05, t });
  K.textSticker(ctx, '5 MENIT LAGI...', 540, 510, { size: 92, col: K.PAL.yellow, txt: K.PAL.ink, k: popIn(t, a + 0.45, 0.3), rot: 0.05, t, sway: 1 });
});

// 3. Mimpi — Brain Tricked Into Starting a New Deep Sleep Cycle
shot('mimpi', (t, a, b) => {
  camera(1.15, 540, 1020);
  K.sunburst(ctx, t, { c1: '#41c7ff', c2: '#2f5bff', y: 940, speed: 0.08 });
  K.dots(ctx, { col: 'rgba(0,30,90,0.12)' });
  K.floor(ctx, 1360, '#1fc8b0');

  K.char(ctx, 'baterai', 540, 1370, 1.15, { t, level: 0.15, mood: 'tired', open: 0.2, lean: -0.18, sq: 0.05 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'SIKLUS TIDUR BARU', 540, 330, { size: 74, col: K.PAL.white, txt: K.PAL.blue, k: popIn(t, a + 0.1, 0.3), rot: -0.04, t });
  K.textSticker(ctx, 'OTAK TERTIPU Zzz...', 540, 510, { size: 72, col: K.PAL.lime, txt: K.PAL.ink, k: popIn(t, a + 0.5, 0.3), rot: 0.06, t, sway: 1 });
});

// 4. Perang — 06:05, 06:10, 06:15 Fight Cloud & Sleep Inertia
shot('perang', (t, a, b) => {
  camera(1.1, 540, 980);
  K.sunburst(ctx, t, { c1: '#ff6a2a', c2: '#ff3b3b', y: 940, speed: 0.5 });
  K.dots(ctx, { col: 'rgba(100,0,0,0.15)' });
  K.floor(ctx, 1340, '#ffd23f');

  K.fightCloud(ctx, 540, 980, t, 1.12 + 0.08 * Math.sin(t * 18));

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'INERSIA TIDUR!', 540, 310, { size: 88, col: K.PAL.yellow, txt: K.PAL.ink, k: popIn(t, a + 0.1, 0.3), rot: -0.06, t, sway: 1 });
  K.textSticker(ctx, 'KEPALA PUSING & BERAT', 540, 490, { size: 64, col: K.PAL.white, txt: K.PAL.red, k: popIn(t, a + 0.45, 0.3), rot: 0.05, t });
});

// 5. Kesiangan — Suddenly 07:15 AM! Panic Sprint!
shot('kesiangan', (t, a, b) => {
  camera(1.18, 540, 1040);
  K.sunburst(ctx, t, { c1: '#ff3b3b', c2: '#ff8a1f', y: 920, speed: 0.7 });
  K.dots(ctx, { col: 'rgba(120,0,0,0.15)' });
  K.floor(ctx, 1380, '#5b3fd6');

  K.speed(ctx, 320, 1120, 380, { dir: 1, t, col: K.PAL.white });
  K.char(ctx, 'peta', 420, 1390, 1.0, { t, mood: 'worried', open: 0.85, sweat: true, walk: t * 3.5, hop: Math.abs(Math.sin(t * 12)) * 55 });
  K.char(ctx, 'chat', 820, 1390, 0.9, { t, face: -1, mood: 'angry', open: 0.8, badge: 99, hop: hopAt(t, a + 0.2, 90) });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.burst(ctx, '07:15!!', 540, 330, { size: 130, k: popIn(t, a + 0.05, 0.25), col: K.PAL.white, txt: K.PAL.red, t });
  K.textSticker(ctx, 'KESIANGAN!!', 540, 540, { size: 84, col: K.PAL.yellow, txt: K.PAL.ink, k: popIn(t, a + 0.35, 0.25), rot: 0.07, t, sway: 1 });
});

// 6. Akhir — Put Your Phone Across the Room!
shot('akhir', (t, a, b) => {
  camera(1.15, 540, 1060);
  K.sunburst(ctx, t, { c1: '#b6f03c', c2: '#2fd96b', y: 980, speed: 0.15 });
  K.dots(ctx, { col: 'rgba(0,80,20,0.12)' });
  K.floor(ctx, 1380, '#2f5bff');

  K.char(ctx, 'baterai', 350, 1390, 0.9, { t, level: 1, mood: 'happy', smile: 1, open: 0.4, hop: Math.abs(Math.sin(t * 5)) * 25 });
  K.char(ctx, 'charger', 760, 1390, 0.88, { t, face: -1, mood: 'happy', smile: 1, open: 0.3 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'TIPS BANGUN SEGAR', 540, 290, { size: 68, col: K.PAL.ink, txt: K.PAL.yellow, k: popIn(t, a + 0.05, 0.25), rot: -0.04, t });
  K.textSticker(ctx, 'PASANG 1 ALARM SAJA', 530, 470, { size: 70, col: K.PAL.white, k: popIn(t, a + 0.35, 0.25), rot: -0.06, t, sway: 1, icon: K.ICONS.sun });
  K.textSticker(ctx, 'TARUH HP JAUH DARI KASUR', 550, 650, { size: 62, col: K.PAL.yellow, k: popIn(t, a + 0.7, 0.25), rot: 0.05, t, sway: 1, icon: K.ICONS.leaf });
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

