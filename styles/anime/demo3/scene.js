// Anime demo 3: "Rantang Hangat di Peron Senja" — ~44 s, 10 shots timed to narration.
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
  AM.sfx('tick', C.rindu.start + 0.3, { gain: 0.28 });
  AM.sfx('ding', W('telepon', 'pesan'), { gain: 0.35, pitch: 1.2 });
  AM.sfx('chime', W('stasiun', 'berhijab'), { gain: 0.35 });
  AM.sfx('whoosh', W('lari', 'berlari'), { gain: 0.45, pitch: 1.15 });
  AM.sfx('tick', W('lari', 'detik'), { gain: 0.35 });
  AM.sfx('ding', W('bekal', 'rantang'), { gain: 0.32, pitch: 1.05 });
  AM.sfx('chime', W('ucapan', 'tersenyum'), { gain: 0.35 });
  AM.sfx('whoosh', W('berangkat', 'melaju'), { gain: 0.42, pitch: 0.9 });
  AM.sfx('sparkle', W('airmata', 'air'), { gain: 0.38 });
  AM.sfx('chime', C.akhir.start + 0.35, { gain: 0.4 });
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
const blinkAt = (t, seed = 0) => { const p = (t + seed) % 3.1; return p < 0.12 ? Math.sin(p / 0.12 * Math.PI) : 0; };
const W = (id, w) => (C[id] ? AM.wordTime(id, w) : 0);

// Helper: draw a warm traditional stacked lunchbox (rantang) held with a cloth wrap
function drawRantang(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 2.4) * 5); ctx.scale(s, s);
  K.glow(ctx, 0, -20, 220, '#ffd088', 0.55);
  ctx.strokeStyle = '#2a1a2e'; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  // handle frame
  ctx.strokeStyle = '#6a5864'; ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(-110, 80); ctx.lineTo(-110, -160); ctx.arc(0, -160, 110, Math.PI, 0); ctx.lineTo(110, 80); ctx.stroke();
  // 3 stacked enamel tiers
  const cols = ['#f6e6cf', '#e8a87c', '#7ab09a'];
  for (let i = 0; i < 3; i++) {
    const ty = 20 - i * 68;
    ctx.fillStyle = cols[i]; ctx.strokeStyle = '#2a1a2e'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(-102, ty, 204, 62, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3d5f9e'; ctx.fillRect(-100, ty + 8, 200, 10);
  }
  // rising warm steam wisps
  ctx.strokeStyle = 'rgba(255,248,230,0.55)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    const sx = i * 48, sy = -140 - ((t * 45 + i * 30) % 70);
    ctx.beginPath(); ctx.moveTo(sx, -120);
    ctx.quadraticCurveTo(sx + Math.sin(t * 3 + i) * 18, sy - 30, sx - Math.sin(t * 3 + i) * 14, sy - 70);
    ctx.stroke();
  }
  ctx.restore();
}

// 1. Hook: City station platform at late afternoon, Laras tired in her work jacket.
shot('hook', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.03 + 0.06 * ease.inOutSine(p), 540, 950);
  K.station(ctx, t, { cam: { z: lt * 2.5 }, preset: 'golden', sunX: 820, sunY: 660, clockAt: [2.2, 3.5, 12] });
  K.bust(ctx, 'laras', 540, 930, 1.68, {
    t, wind: 0.25 + Math.sin(t * 2) * 0.08, light: 1, rim: 0.9, rimCol: '#ffe2a8', shade: 0.18,
    ...K.expr('worry', { brow: -0.6, mouth: 0.04, look: [-0.2, 0.15] }), blink: blinkAt(t, 0.8),
  });
  K.motes(ctx, t, { n: 24, alpha: 0.55, size: 4 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.lensFlare(ctx, 820, 660, t, 0.7);
  K.nameCard(ctx, 'ANAK RANTAU', 'TAHUN PERTAMA DI KOTA', 80, 300, { alpha: env(t, a + 0.3, b, 0.35, 0.3), k: prog(t, a + 0.3, a + 1.1), size: 84 });
});

// 2. Rindu: Inside the intercity train, gazing out at golden rice paddies and mountains.
shot('rindu', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.0 + 0.07 * ease.inOutSine(p), 540, 960);
  ctx.fillStyle = '#efe4d8'; ctx.fillRect(-200, -200, 1500, 2400);
  ctx.save(); const win = new Path2D(); win.roundRect(60, 160, 960, 980, 70); ctx.clip(win);
  K.landscape(ctx, t, { x: 60, y: 160, w: 960, h: 980, speed: 780, horizon: 0.62, preset: 'golden' });
  ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = '#2a1a2e'; ctx.stroke(win); ctx.lineWidth = 6; ctx.strokeStyle = '#c9b8b0'; ctx.stroke(win);
  ctx.fillStyle = '#3d6f8a'; ctx.beginPath(); ctx.roundRect(640, 980, 520, 1100, 60); ctx.fill();
  K.bust(ctx, 'laras', 555, 1010, 1.82, {
    t, wind: 0.05, light: -1, rim: 0.9, rimCol: '#ffd9a0', turn: -0.42, look: [-0.65, -0.05], tilt: -0.04,
    ...K.expr('soft', { brow: -0.5, smile: 0.1, mouth: 0.03 }), blink: blinkAt(t, 1.4),
  });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const band = ((lt * 860) % 1400) - 300;
  const gr = ctx.createLinearGradient(band - 160, 0, band + 160, 0);
  gr.addColorStop(0, 'rgba(255,190,120,0)'); gr.addColorStop(0.5, 'rgba(255,190,120,0.22)'); gr.addColorStop(1, 'rgba(255,190,120,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
});

// 3. Telepon: A message from Mother appears; Laras perks up in surprise.
shot('telepon', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.08 + 0.08 * ease.outCubic(p), 540, 950);
  ctx.fillStyle = '#efe4d8'; ctx.fillRect(-200, -200, 1500, 2400);
  ctx.save(); const win = new Path2D(); win.roundRect(60, 160, 960, 980, 70); ctx.clip(win);
  K.landscape(ctx, t, { x: 60, y: 160, w: 960, h: 980, speed: 580, horizon: 0.62, preset: 'golden' });
  ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = '#2a1a2e'; ctx.stroke(win);
  K.bust(ctx, 'laras', 550, 1000, 1.88, {
    t, wind: 0.06, light: -1, rim: 0.95, rimCol: '#ffe2a8', turn: -0.15, look: [0, 0.15],
    ...K.expr('surprise', { wide: 0.65, mouth: 0.25, brow: 0.8 }), blink: blinkAt(t, 0.3),
  });
  K.lightLeak(ctx, t, 0.3);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.quoteBox(ctx, '“Keretamu berhenti dua menit di stasiun desa, kan?” — Ibu', 540, 310, {
    alpha: env(t, a + 0.2, b, 0.3, 0.25), size: 48,
  });
});

// 4. Stasiun: Train slows at the village station; Ibu stands waiting in her warm cream hijab.
shot('stasiun', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.0 + 0.1 * ease.inOutSine(p), 540, 960);
  K.station(ctx, t, { cam: { z: lerp(0, 5, ease.outQuad(p)) }, preset: 'golden', sunX: 780, sunY: 670 });
  K.glow(ctx, 540, 1040, 460, '#ffc478', 0.45);
  K.bust(ctx, 'ibu', 540, 980, 1.58, {
    t, wind: 0.2, light: 1, rim: 1, rimCol: '#ffe2a8',
    ...K.expr('smile', { brow: -0.3, blush: 0.5, look: [-0.2, 0] }), blink: blinkAt(t, 1.1),
  });
  drawRantang(ctx, 540, 1340, 0.85, t);
  K.motes(ctx, t, { n: 28, alpha: 0.7, size: 4.5 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.nameCard(ctx, 'STASIUN DESA', 'BERHENTI 2 MENIT', 80, 290, { alpha: env(t, a + 0.2, b, 0.3, 0.25), k: prog(t, a + 0.2, a + 0.85), size: 88 });
});

// 5. Lari: Doors slide open; Laras steps out to meet Ibu as the station clock ticks.
shot('lari', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  const open = ease.outCubic(clamp(lt / 0.8));
  camera(1.04 + 0.06 * p, 540, 960);
  K.sky(ctx, 'golden');
  K.cloud(ctx, 760, 640, 1.15, { seed: 7, sunDir: [-0.4, 0.9] });
  K.trainSide(ctx, t, { x: 0, doorX: 380, open, y: 1280, interior: true, part: 'all' });
  const fl = ctx.createLinearGradient(0, 1280, 0, 1920); fl.addColorStop(0, '#e8b48f'); fl.addColorStop(1, '#6f5a7a');
  ctx.fillStyle = fl; ctx.fillRect(-300, 1285, 1700, 700);
  ctx.fillStyle = '#f4c542'; ctx.fillRect(-300, 1330, 1700, 24);
  const lx = lerp(380, 560, ease.outCubic(clamp((lt - 0.3) / 1.1)));
  K.figure(ctx, 'laras', lx, 1320, 0.22, lt < 1.3 ? K.POSE.run(lt * 2.2) : K.POSE.openArms(0.8), {
    t, dir: 1, light: -1, rim: 0.95, wind: 0.5, ...K.expr('determined', { mouth: 0.3 }),
  });
  K.figure(ctx, 'ibu', 740, 1320, 0.22, K.POSE.openArms(0.85), {
    t, dir: -1, light: -1, rim: 0.95, wind: 0.25, ...K.expr('smile'),
  });
  K.clock(ctx, 880, 360, 95, 17, 48 + p * 2, { t, light: -1, glintA: 0.6 });
});

// 6. Bekal: Close-up of the warm stacked rantang being handed over between their hands.
shot('bekal', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.0 + 0.08 * ease.inOutSine(p), 540, 960);
  K.sky(ctx, 'golden', { mix: 'dusk', k: 0.4 });
  K.cloud(ctx, 540, 860, 1.3, { seed: 6, preset: 'golden', sunDir: [0, 0.9] });
  K.rays(ctx, 540, 700, t, { n: 9, alpha: 0.15, dir: Math.PI / 2 });
  K.bust(ctx, 'ibu', 660, 940, 1.35, {
    t, wind: 0.15, light: -1, rim: 1, rimCol: '#ffe2a8',
    ...K.expr('soft', { smile: 0.75, blush: 0.6, brow: -0.4 }), blink: blinkAt(t, 0.5),
  });
  K.bustBack(ctx, 'laras', 250, 1160, 1.3, { t, wind: 0.2, light: 1, rim: 0.9, rimCol: '#ffd89a' });
  drawRantang(ctx, 470, 1180, 1.15, t);
  K.motes(ctx, t, { n: 34, alpha: 0.8, size: 5 });
});

// 7. Ucapan: Close-up on Ibu's loving face with happyCry expression and quoteBox.
shot('ucapan', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.04 + 0.07 * ease.inOutSine(p), 540, 950);
  K.sky(ctx, 'dusk');
  K.cloud(ctx, 320, 860, 1.2, { seed: 3, preset: 'dusk', sunDir: [0.4, 0.85] });
  K.cloud(ctx, 840, 820, 1.0, { seed: 10, preset: 'dusk', sunDir: [-0.4, 0.85] });
  K.glow(ctx, 540, 920, 540, '#ffc078', 0.5);
  K.bust(ctx, 'ibu', 540, 960, 1.78, {
    t, wind: 0.18, light: 0, rim: 1, rimCol: '#ffe2a8',
    ...K.expr('happyCry', { mouth: 0.25 + 0.12 * Math.sin(t * 8) }),
  });
  K.motes(ctx, t, { n: 30, alpha: 0.75, size: 4.5 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.quoteBox(ctx, '“Makanlah yang kenyang, Nak. Jangan pernah merasa sendirian di kota.”', 540, 310, {
    alpha: env(t, a + 0.15, b, 0.3, 0.25), size: 46,
  });
});

// 8. Berangkat: The train departs into the dusk horizon while Ibu waves from the platform.
shot('berangkat', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.08 - 0.08 * ease.inOutSine(p), 540, 960);
  K.sky(ctx, 'dusk');
  K.cloud(ctx, 340, 740, 1.25, { seed: 4, preset: 'dusk', sunDir: [0.4, 0.85] });
  K.cloud(ctx, 860, 700, 1.05, { seed: 12, preset: 'dusk', sunDir: [-0.4, 0.85] });
  K.sun(ctx, 540, lerp(780, 920, p), { r: 74, t, flare: 0.65 });
  const tx = -ease.inCubic(p) * 640;
  K.trainSide(ctx, t, { x: tx, doorX: 460, open: 0, y: 1280, part: 'all' });
  const fl = ctx.createLinearGradient(0, 1280, 0, 1920); fl.addColorStop(0, '#d89a7c'); fl.addColorStop(1, '#4a3860');
  ctx.fillStyle = fl; ctx.fillRect(-300, 1285, 1700, 700);
  ctx.fillStyle = '#f4c542'; ctx.fillRect(-300, 1330, 1700, 24);
  K.figure(ctx, 'ibu', 740, 1330, 0.23, K.POSE.wave(t), {
    t, dir: -1, light: -1, rim: 1, rimCol: '#ffd89a', wind: 0.45, ...K.expr('smile'),
  });
  K.streaks(ctx, t, { n: 20, dir: -1, speed: 2000 * (0.2 + p), y0: 360, y1: 1260, alpha: 0.4 * p });
});

// 9. Airmata: Inside the carriage at dusk, Laras cries happy tears over the warm rantang.
shot('airmata', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  camera(1.02 + 0.08 * ease.outCubic(p), 540, 960);
  ctx.fillStyle = '#2d223b'; ctx.fillRect(-200, -200, 1500, 2400);
  ctx.save(); const win = new Path2D(); win.roundRect(60, 160, 960, 980, 70); ctx.clip(win);
  K.landscape(ctx, t, { x: 60, y: 160, w: 960, h: 980, speed: 720, horizon: 0.62, preset: 'dusk' });
  ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = '#1c1226'; ctx.stroke(win);
  const tearFall = clamp((lt - 0.3) / 1.4);
  K.bust(ctx, 'laras', 540, 960, 1.78, {
    t, wind: 0.05, light: -1, rim: 0.95, rimCol: '#ffd89a',
    ...K.expr('cry', { smile: 0.55, blush: 0.65, tear: 1, tearFall, mouth: 0.12 }),
  });
  drawRantang(ctx, 540, 1390, 0.92, t);
  K.motes(ctx, t, { n: 28, alpha: 0.75, size: 4.5 });
});

// 10. Akhir: Starry night over the village, lit house and torches, filmTitle holds.
shot('akhir', (t, a, b) => {
  const lt = t - a, p = clamp(lt / 3.2);
  camera(1.16 - 0.14 * ease.outCubic(p), 540, 1040);
  K.sky(ctx, 'night');
  K.stars(ctx, t, { n: 160, y1: 1000 });
  K.crescent(ctx, 800, 350, 52);
  K.village(ctx, t, { y: 1380, col: '#1d1530', mosqueX: 750 });
  ctx.fillStyle = '#140e22'; ctx.fillRect(-200, 1378, 1500, 700);
  for (let i = 0; i < 8; i++) {
    const x = ((i * 135 + lt * 55) % 1300) - 100, y = 1480 + Math.sin(i) * 10;
    K.obor(ctx, x, y, t + i, 0.45, i);
  }
  K.house(ctx, 310, 1600, 0.42, { t, lit: 1 });
  K.figure(ctx, 'ibu', 310, 1610, 0.08, K.POSE.stand(t), { t, sil: '#2a1d3a', light: 1, rim: 1, rimCol: '#ffcf80', dir: -1 });
  K.motes(ctx, t, { n: 32, col: '#ffe9a0', alpha: 0.75, size: 3.5, y0: 880, h: 720, drift: [6, -10] });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.filmTitle(ctx, 'Rantang di Peron Senja', 540, 560, {
    size: 90, alpha: env(t, a + 0.35, AM.duration + 2, 0.75, 0.3), sub: 'DOA SEORANG IBU',
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

