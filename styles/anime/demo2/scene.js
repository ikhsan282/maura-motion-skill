// Anime demo 2: "Surat di Ujung Peron" — ~42 s, 10 shots timed to narration.
import * as K from '/styles/anime/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'bold', y: 1470, size: 68, strokeColor: '#2a1a2e' } };

let ctx, fx;
const C = {};
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const W = (id, w) => (C[id] ? AM.wordTime(id, w) : 0);
  AM.sfx('whoosh', 0.08, { gain: 0.4 });
  AM.sfx('chime', W('kenangan', 'sahabat'), { gain: 0.32 });
  AM.sfx('whoosh', W('pindah', 'pindah'), { gain: 0.42, pitch: 0.9 });
  AM.sfx('ding', W('kabar', 'surat'), { gain: 0.32, pitch: 1.15 });
  AM.sfx('tick', C.perjalanan.start + 0.4, { gain: 0.28 });
  AM.sfx('tick', C.perjalanan.start + 1.4, { gain: 0.28 });
  AM.sfx('chime', W('isi', 'senja'), { gain: 0.35, pitch: 1.1 });
  AM.sfx('impact', C.senja.start + 0.15, { gain: 0.35, pitch: 0.85 });
  AM.sfx('ding', W('temu', 'berdiri'), { gain: 0.35 });
  AM.sfx('sparkle', W('tangis', 'senyumnya'), { gain: 0.4 });
  AM.sfx('chime', C.akhir.start + 0.4, { gain: 0.38 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};
function camera(z = 1, cx = 540, cy = 960, rot = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, 960); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
const blinkAt = (t, seed = 0) => { const p = (t + seed) % 3.2; return p < 0.12 ? Math.sin(p / 0.12 * Math.PI) : 0; };
const W = (id, w) => (C[id] ? AM.wordTime(id, w) : 0);

// 1. Hook: Daylight-to-golden station platform, Laras arrives after 10 years.
shot('hook', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.02 + 0.06 * ease.inOutSine(p), 540, 950);
  K.station(ctx, t, { cam: { z: lt * 2.2 }, preset: 'day', sunX: 820, sunY: 640, clockAt: [2.2, 3.5, 11] });
  K.bust(ctx, 'laras', 540, 930, 1.65, {
    t, wind: 0.3 + Math.sin(t * 1.8) * 0.1, light: 1, rim: 0.9, rimCol: '#fff4d2',
    ...K.expr('soft', { look: [0.25, -0.15], mouth: 0.05 }), blink: blinkAt(t, 0.5),
  });
  K.motes(ctx, t, { n: 24, alpha: 0.55, size: 4 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.lensFlare(ctx, 820, 640, t, 0.65);
  K.nameCard(ctx, 'STASIUN LAMA', '10 TAHUN KEMUDIAN', 80, 300, { alpha: env(t, a + 0.3, b, 0.35, 0.3), k: prog(t, a + 0.3, a + 1.1), size: 88 });
});

// 2. Kenangan: Childhood flashback (kecil waving on the golden platform inside a soft memory vignette).
shot('kenangan', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.05 + 0.07 * p, 540, 960);
  K.station(ctx, t, { cam: { z: 4 + lt * 1.5 }, preset: 'golden', sunX: 780, sunY: 660 });
  K.rays(ctx, 780, 660, t, { n: 8, alpha: 0.14, dir: 2.1 });
  K.bust(ctx, 'kecil', 540, 980, 1.78, {
    t, wind: 0.35, light: 1, rim: 1, rimCol: '#ffe6b0',
    ...K.expr('smile', { mouth: 0.45, blush: 0.7 }), blink: blinkAt(t, 1.7),
  });
  K.motes(ctx, t, { n: 34, alpha: 0.75, size: 5 });
  K.lightLeak(ctx, t, 0.45);
  K.memoryFrame(ctx, 0.85);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.nameCard(ctx, 'MASA SEKOLAH', 'KENANGAN 2016', 80, 300, { alpha: env(t, a + 0.25, b, 0.3, 0.25), k: prog(t, a + 0.25, a + 0.9), size: 84 });
});

// 3. Pindah: The day she moved away — train speeding off while little friend waves on the platform.
shot('pindah', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.0 + 0.12 * ease.inOutSine(p), 540 - p * 40, 980);
  K.sky(ctx, 'golden');
  K.cloud(ctx, 720, 640, 1.15, { seed: 5, sunDir: [-0.4, 0.9] });
  K.sun(ctx, 200, 680, { r: 54, t, flare: 0.5 });
  const tx = -ease.inQuad(p) * 520;
  K.trainSide(ctx, t, { x: tx, doorX: 520, open: 0, y: 1280, part: 'all' });
  const fl = ctx.createLinearGradient(0, 1280, 0, 1920); fl.addColorStop(0, '#e8b48f'); fl.addColorStop(1, '#6f5a7a');
  ctx.fillStyle = fl; ctx.fillRect(-300, 1285, 1700, 700);
  ctx.fillStyle = '#f4c542'; ctx.fillRect(-300, 1330, 1700, 24);
  K.figure(ctx, 'kecil', 720, 1340, 0.24, K.POSE.wave(t), {
    t, dir: -1, light: -1, rim: 0.95, wind: 0.75, ...K.expr('cry', { mouth: 0.35 }),
  });
  K.streaks(ctx, t, { n: 18, dir: -1, speed: 1800 * (0.3 + p), y0: 350, y1: 1260, alpha: 0.35 * p });
  K.memoryFrame(ctx, 0.65);
});

// 4. Kabar: Close-up of the letter/ticket held in Laras's hand, glinting in warm light.
shot('kabar', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.0 + 0.08 * ease.outCubic(p), 540, 960);
  K.sky(ctx, 'golden');
  K.cloud(ctx, 540, 960, 1.35, { seed: 9, sunDir: [-0.3, 0.9] });
  K.motes(ctx, t, { n: 28, alpha: 0.65, size: 4.5 });
  const glintU = clamp((t - W('kabar', 'surat') + 0.1) / 0.9);
  K.ticketHand(ctx, 560, 1050, 1.28, {
    t, rot: -0.06, light: -1, lines: ['SURAT LAMA', 'PERON UJUNG'], glintU: glintU > 0 && glintU < 1 ? glintU : -1,
  });
  K.glint(ctx, 360, 880, 42, env(t, W('kabar', 'surat'), W('kabar', 'surat') + 0.9, 0.2, 0.3), t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.quoteBox(ctx, '“Untuk Laras — Dari Bangku Ujung Peron”', 540, 340, { alpha: env(t, a + 0.25, b, 0.3, 0.25), size: 48 });
});

// 5. Perjalanan: Inside the moving train, Laras looking down thoughtfully as countryside passes.
shot('perjalanan', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.0 + 0.06 * ease.inOutSine(p), 540, 960);
  ctx.fillStyle = '#efe4d8'; ctx.fillRect(-200, -200, 1500, 2400);
  ctx.save(); const win = new Path2D(); win.roundRect(60, 160, 960, 980, 70); ctx.clip(win);
  K.landscape(ctx, t, { x: 60, y: 160, w: 960, h: 980, speed: 760, horizon: 0.6, preset: 'golden' });
  ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = '#2a1a2e'; ctx.stroke(win); ctx.lineWidth = 6; ctx.strokeStyle = '#c9b8b0'; ctx.stroke(win);
  ctx.fillStyle = '#3d6f8a'; ctx.beginPath(); ctx.roundRect(640, 980, 520, 1100, 60); ctx.fill();
  K.bust(ctx, 'laras', 550, 1010, 1.82, {
    t, wind: 0.08, light: -1, rim: 0.9, rimCol: '#ffd9a0', turn: -0.35, look: [-0.4, 0.25], tilt: -0.03,
    ...K.expr('soft', { brow: -0.4, mouth: 0.06 }), blink: blinkAt(t, 0.9),
  });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const band = ((lt * 880) % 1400) - 300;
  const gr = ctx.createLinearGradient(band - 160, 0, band + 160, 0);
  gr.addColorStop(0, 'rgba(255,190,120,0)'); gr.addColorStop(0.5, 'rgba(255,190,120,0.22)'); gr.addColorStop(1, 'rgba(255,190,120,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
});

// 6. Isi: The message inside the letter — quoteBox over glowing window, Laras's eyes widen with emotion.
shot('isi', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.12 + 0.1 * ease.inOutSine(p), 550, 940);
  ctx.fillStyle = '#efe4d8'; ctx.fillRect(-200, -200, 1500, 2400);
  ctx.save(); const win = new Path2D(); win.roundRect(60, 160, 960, 980, 70); ctx.clip(win);
  K.landscape(ctx, t, { x: 60, y: 160, w: 960, h: 980, speed: 620, horizon: 0.62, preset: 'dusk' });
  ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = '#2a1a2e'; ctx.stroke(win);
  K.bust(ctx, 'laras', 550, 1000, 1.9, {
    t, wind: 0.06, light: -1, rim: 0.95, rimCol: '#ffd29a', turn: -0.2, look: [-0.2, -0.1],
    ...K.expr('surprise', { wide: 0.7, mouth: 0.15, tear: clamp((lt - 0.5) / 1.4), brow: -0.6 }), blink: blinkAt(t, 2.1),
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.quoteBox(ctx, '“Kalau kamu kembali saat senja, tengoklah bangku kayu di ujung peron.”', 540, 310, {
    alpha: env(t, a + 0.15, b, 0.3, 0.25), size: 48,
  });
});

// 7. Senja: Train stops and doors slide open into a breathtaking golden-dusk sky with cumulus & flare.
shot('senja', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  const open = ease.inOutCubic(clamp((lt - 0.25) / 1.1));
  camera(1.08 - 0.06 * p, 540, 960);
  K.sky(ctx, 'golden', { mix: 'dusk', k: 0.55 });
  K.cloud(ctx, 320, 760, 1.25, { seed: 3, preset: 'golden', sunDir: [0.4, 0.88] });
  K.cloud(ctx, 840, 720, 1.05, { seed: 11, preset: 'dusk', sunDir: [-0.4, 0.88] });
  K.sun(ctx, 540, 740, { r: 68, t, flare: 0.85 });
  K.trainSide(ctx, t, { x: 0, doorX: 540, open, y: 1280, interior: true, part: 'all' });
  const fl = ctx.createLinearGradient(0, 1280, 0, 1920); fl.addColorStop(0, '#e8b48f'); fl.addColorStop(1, '#5e496e');
  ctx.fillStyle = fl; ctx.fillRect(-300, 1285, 1700, 700);
  ctx.fillStyle = '#f4c542'; ctx.fillRect(-300, 1330, 1700, 24);
  if (open > 0.25) {
    K.figure(ctx, 'laras', 540, 1310, 0.22, K.POSE.stand(t), {
      t, dir: 1, light: 0, rim: 1, rimCol: '#ffe2a8', wind: 0.45, ...K.expr('determined', { mouth: 0.1 }),
    });
  }
  K.motes(ctx, t, { n: 30, alpha: 0.7, size: 4.5 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.nameCard(ctx, '17.55', 'SENJA DI PERON UJUNG', 80, 290, { alpha: env(t, a + 0.2, b, 0.3, 0.25), k: prog(t, a + 0.2, a + 0.85), size: 92 });
});

// 8. Temu: Down the quiet golden platform, a figure stands waiting by the sunset horizon.
shot('temu', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.0 + 0.14 * ease.inOutSine(p), 540, 920);
  K.station(ctx, t, { cam: { z: 6 + lt * 1.2 }, preset: 'dusk', sunX: 620, sunY: 780 });
  K.rays(ctx, 620, 780, t, { n: 10, alpha: 0.16, dir: 1.7 });
  // Bench and waiting friend silhouette rim-lit by sunset
  ctx.fillStyle = '#2d1e3e';
  ctx.fillRect(620, 1170, 180, 18); ctx.fillRect(635, 1130, 150, 42);
  ctx.fillRect(640, 1188, 16, 42); ctx.fillRect(764, 1188, 16, 42);
  K.figure(ctx, 'laras', 580, 1240, 0.16, K.POSE.wave(t * 0.7), {
    t, dir: -1, sil: '#2a1a36', light: -1, rim: 1, rimCol: '#ffd89a', wind: 0.5,
  });
  K.bustBack(ctx, 'laras', 280, 1280, 1.15, { t, wind: 0.45, light: 1, rim: 0.95, rimCol: '#ffd89a' });
  K.motes(ctx, t, { n: 32, alpha: 0.75, size: 4 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.lensFlare(ctx, 620, 780, t, 0.75);
});

// 9. Tangis: Close-up of Laras smiling through falling tears (happyCry) in golden rim light.
shot('tangis', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.04 + 0.08 * ease.outCubic(p), 540, 940);
  K.sky(ctx, 'dusk');
  K.cloud(ctx, 300, 880, 1.2, { seed: 4, preset: 'dusk', sunDir: [0.4, 0.85] });
  K.cloud(ctx, 840, 840, 1.0, { seed: 8, preset: 'dusk', sunDir: [-0.4, 0.85] });
  K.glow(ctx, 540, 880, 560, '#ffb878', 0.5);
  const tearFall = clamp((lt - 0.35) / 1.5);
  K.bust(ctx, 'laras', 540, 940, 1.85, {
    t, wind: 0.45, light: 1, rim: 1, rimCol: '#ffe2a8',
    ...K.expr('happyCry', { tear: 1, tearFall }),
  });
  K.motes(ctx, t, { n: 36, alpha: 0.8, size: 5 });
  K.lightLeak(ctx, t, 0.35);
});

// 10. Akhir: Pull back as dusk turns to starry night over the town and station; film title holds.
shot('akhir', (t, a, b) => {
  const lt = t - a, p = clamp(lt / 3.2);
  camera(1.16 - 0.14 * ease.outCubic(p), 540, 1040);
  K.sky(ctx, 'dusk', { mix: 'night', k: clamp(p * 1.1) });
  K.stars(ctx, t, { n: 150, y1: 960, alpha: clamp(p * 1.2) });
  K.crescent(ctx, 810, 340, 50, { alpha: clamp(p * 1.2) });
  K.village(ctx, t, { y: 1380, col: '#1d1530', mosqueX: 740 });
  ctx.fillStyle = '#140e22'; ctx.fillRect(-200, 1378, 1500, 700);
  K.house(ctx, 320, 1600, 0.42, { t, lit: 1 });
  K.figure(ctx, 'laras', 280, 1610, 0.08, K.POSE.openArms(0.9), { t, sil: '#2a1d3a', light: 1, rim: 1, rimCol: '#ffcf80' });
  K.figure(ctx, 'kecil', 320, 1610, 0.08, K.POSE.openArms(0.9), { t, sil: '#2a1d3a', light: -1, rim: 1, rimCol: '#ffcf80', dir: -1 });
  K.motes(ctx, t, { n: 32, col: '#ffe9a0', alpha: 0.75, size: 3.5, y0: 850, h: 750, drift: [6, -12] });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.filmTitle(ctx, 'Surat di Ujung Peron', 540, 560, {
    size: 92, alpha: env(t, a + 0.35, AM.duration + 2, 0.7, 0.3), sub: 'JANJI YANG PULANG',
  });
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
  if (since < 0.16 && s.id !== 'hook') {
    fx.fillStyle = `rgba(255,244,225,${0.48 * (1 - since / 0.16)})`;
    fx.fillRect(0, 0, AM.W, AM.H);
  }
  const endA = clamp((t - (AM.duration - 0.85)) / 0.85);
  if (endA > 0) { fx.fillStyle = `rgba(10,6,20,${endA})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.035, fps: 12 });
}

