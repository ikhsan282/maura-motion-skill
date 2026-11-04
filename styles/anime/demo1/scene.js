// Anime demo: "Tiket Terakhir Mudik" — 20 s, 6 shots timed to the narration.
import * as K from '/styles/anime/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'bold', y: 1470, size: 70, strokeColor: '#2a1a2e' } };

let ctx, fx;
const C = {};
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const W = (id, w) => AM.wordTime(id, w);
  AM.sfx('whoosh', 0.05, { gain: 0.45 });
  AM.sfx('ding', W('hook', 'janji') - 0.05, { gain: 0.3, pitch: 1.2 });
  AM.sfx('whoosh', W('lompat', 'melompat') - 0.25, { gain: 0.5, pitch: 1.2 });
  AM.sfx('impact', W('lompat', 'melompat') + 0.47, { gain: 0.45 });
  AM.sfx('chime', W('janji', 'pulang'), { gain: 0.3 });
  AM.sfx('tick', C.tertahan.start + 0.2, { gain: 0.35 });
  AM.sfx('tick', C.tertahan.start + 1.2, { gain: 0.35 });
  AM.sfx('drum_hit', W('takbir', 'takbir'), { gain: 0.55, pitch: 0.7 });
  AM.sfx('drum_hit', W('takbir', 'takbir') + 0.45, { gain: 0.45, pitch: 0.7 });
  AM.sfx('sparkle', C.akhir.start + 0.3, { gain: 0.35 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
function camera(z = 1, cx = 540, cy = 960, rot = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, 960); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
const blinkAt = (t, seed = 0) => { const p = (t + seed) % 3.1; return p < 0.12 ? Math.sin(p / 0.12 * Math.PI) : 0; };
const W = (id, w) => AM.wordTime(id, w);

// 1. Hook: Laras sprints down the golden-hour platform toward camera, backlit, hair streaming, flare.
shot('hook', (t, a, b) => {
  const lt = t - a, p = (t - a) / (b - a);
  const ph = lt * 2.3;
  const bob = Math.abs(Math.sin(ph * Math.PI * 2)) * 16;
  camera(1.04 + 0.06 * p, 540, 960 + bob * 0.3);
  K.station(ctx, t, { cam: { z: lt * 7 }, sunX: 810, sunY: 670 });
  K.streaks(ctx, t, { n: 14, dir: 1, speed: 1400, y0: 300, y1: 1300, alpha: 0.35, len: 260 });
  K.bust(ctx, 'laras', 540, 900 - bob, 1.72, { t, wind: 0.55 + Math.sin(t * 2) * 0.15, light: 1, rim: 1, rimCol: '#ffe2a8', shade: 0.28, arms: 'run', runPhase: ph,
    ...K.expr('determined', { mouth: 0.4 + 0.15 * Math.sin(ph * 12.6) }), blink: blinkAt(t, 1.2), tilt: Math.sin(ph * Math.PI * 2) * 0.03 });
  K.motes(ctx, t, { n: 26, alpha: 0.6, size: 4 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.lensFlare(ctx, 810, 670, t, 0.85);
  K.nameCard(ctx, 'LARAS', 'KERETA TERAKHIR · 17.00', 80, 300, { alpha: env(t, a + 0.5, b, 0.4, 0.3), k: prog(t, a + 0.5, a + 1.3), size: 104 });
});

// 2. The doors slide shut — she leaps through the gap with a smear trail; then we push in to her relieved face in the door glass.
shot('lompat', (t, a, b) => {
  const lt = t - a, jt = W('lompat', 'melompat') - 0.35 - a;
  const leapK = clamp((lt - jt) / 0.72);
  // Doors narrow to ~55% open during approach/leap, then slam shut right as she clears the threshold
  const preClose = 0.45 * ease.inOutSine(clamp(lt / (jt + 0.55)));
  const finalSlam = 0.55 * ease.inCubic(clamp((lt - (jt + 0.52)) / 0.28));
  const close = clamp(preClose + finalSlam);
  const push = ease.inOutCubic(clamp((lt - jt - 0.8) / 0.8));
  const go = ease.inCubic(clamp((lt - jt - 1.0) / 1.6));
  const doorX = 470;
  // camera follows the leap, then pushes into the right door window
  camera(lerp(1.15, 2.3, push), lerp(lerp(760, 520, ease.inOutSine(leapK)), doorX + 75, push), lerp(980, 640, push));
  K.sky(ctx, 'golden');
  K.cloud(ctx, 760, 620, 1.1, { seed: 7, sunDir: [-0.4, 0.9] });
  K.sun(ctx, 160, 700, { r: 50, t, flare: 0 });
  const tx = -go * 260;
  K.trainSide(ctx, t, { x: tx, doorX, open: 1 - close, y: 1280, part: 'body' });
  const fx0 = lerp(960, doorX - 10, ease.outQuad(leapK)), fy = 1315 - Math.sin(leapK * Math.PI) * 85;
  const pose = leapK > 0 ? K.POSE.leap(Math.sin(Math.min(1, leapK) * Math.PI * 0.9)) : K.POSE.run(lt * 2.6);
  const drawHer = (x, alpha) => { ctx.save(); ctx.globalAlpha = alpha; K.figure(ctx, 'laras', x + tx, fy, 0.22, pose, { t, dir: -1, light: -1, rim: 0.9, wind: 0.9, ...K.expr('determined', { mouth: 0.5 }) }); ctx.restore(); };
  K.trainSide(ctx, t, { x: tx, doorX, open: 1 - close, y: 1280, part: 'doors' });
  if (leapK < 1) {
    if (leapK > 0) for (let k = 2; k >= 1; k--) drawHer(fx0 + k * 110 * (1 - leapK), 0.12 * (3 - k));
    drawHer(fx0, 1);
  }
  if (leapK >= 1) {
    // her face behind the door glass (right panel window), catching her breath
    const wx = doorX + tx + 22, wy = 1280 - 860 + 70 + 60;
    ctx.save(); ctx.beginPath(); ctx.roundRect(wx, wy, 106, 300, 14); ctx.clip();
    ctx.fillStyle = '#ffe2a6'; ctx.fillRect(wx, wy, 106, 300);
    K.bust(ctx, 'laras', wx + 58, wy + 120, 0.3, { t, light: -1, rim: 0.6, wind: 0.1, ...K.expr('soft', { mouth: 0.35 + 0.15 * Math.sin(t * 9) }), blink: blinkAt(t, 2) });
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.moveTo(wx, wy + 300); ctx.lineTo(wx + 60, wy); ctx.lineTo(wx + 90, wy); ctx.lineTo(wx + 30, wy + 300); ctx.fill();
    ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = '#2a1a2e'; ctx.beginPath(); ctx.roundRect(wx, wy, 106, 300, 14); ctx.stroke();
  }
  const fl = ctx.createLinearGradient(0, 1280, 0, 1920); fl.addColorStop(0, '#e8b48f'); fl.addColorStop(1, '#6f5a7a');
  ctx.fillStyle = fl; ctx.fillRect(-300, 1290, 1700, 700);
  ctx.fillStyle = '#f4c542'; ctx.fillRect(-300, 1330, 1700, 26);
  if (go > 0) K.streaks(ctx, t, { n: 24, dir: -1, speed: 2400 * go, y0: 300, y1: 1280, alpha: 0.5 * go });
  K.motes(ctx, t, { n: 20, alpha: 0.5, size: 4 });
  const slam = lt - jt - 0.72;
  if (slam > 0 && slam < 0.22) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,255,255,${0.45 * (1 - slam / 0.22)})`; ctx.fillRect(0, 0, 1080, 1920); }
});

// 3. Inside, by the window: the promise she broke three times. Light bands sweep her face; a tear falls.
shot('janji', (t, a, b) => {
  const lt = t - a, p = (t - a) / (b - a);
  camera(1.0 + 0.08 * ease.inOutSine(p), 540, 960);
  // window with the moving countryside
  ctx.fillStyle = '#efe4d8'; ctx.fillRect(-200, -200, 1500, 2400);
  ctx.save(); const win = new Path2D(); win.roundRect(60, 160, 960, 980, 70); ctx.clip(win);
  K.landscape(ctx, t, { x: 60, y: 160, w: 960, h: 980, speed: 700, horizon: 0.62 });
  ctx.restore();
  ctx.lineWidth = 14; ctx.strokeStyle = '#2a1a2e'; ctx.stroke(win); ctx.lineWidth = 6; ctx.strokeStyle = '#c9b8b0'; ctx.stroke(win);
  ctx.fillStyle = '#3d6f8a'; ctx.beginPath(); ctx.roundRect(640, 980, 520, 1100, 60); ctx.fill();
  const tearT = W('janji', 'pulang');
  K.bust(ctx, 'laras', 560, 1010, 1.85, { t, wind: 0.05, light: -1, rim: 0.9, rimCol: '#ffd9a0', turn: -0.45, look: [-0.7, -0.1], tilt: -0.04,
    ...K.expr('cry'), mouth: 0.05, tear: clamp((t - a - 0.4) / 1.2), tearFall: clamp((t - tearT) / 1.4), blink: blinkAt(t, 0.4) * (t < tearT ? 1 : 0) });
  // sun through the passing poles: warm bands sweep across
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const band = ((lt * 900) % 1400) - 300;
  const gr = ctx.createLinearGradient(band - 160, 0, band + 160, 0);
  gr.addColorStop(0, 'rgba(255,190,120,0)'); gr.addColorStop(0.5, 'rgba(255,190,120,0.22)'); gr.addColorStop(1, 'rgba(255,190,120,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.nameCard(ctx, '3 LEBARAN', 'TIDAK PULANG', 80, 300, { alpha: env(t, a + 0.15, W('janji', 'janji:') + 0.05, 0.25, 0.25), k: prog(t, a + 0.15, a + 0.8), size: 92 });
  K.quoteBox(ctx, '“Lebaran ini aku pulang, Bu.”', 540, 290, { alpha: env(t, W('janji', 'janji:') + 0.05, b, 0.25, 0.2), size: 54 });
});

// 4. The train stalls at a red signal while the giant sun sinks behind the cumulus.
shot('tertahan', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  camera(1.0 + 0.05 * p, 540, 960);
  K.sky(ctx, 'golden', { mix: 'dusk', k: p * 0.9 });
  K.cloud(ctx, 300, 1050, 1.3, { seed: 3, sunDir: [0.5, 0.85] });
  K.cloud(ctx, 880, 1000, 0.9, { seed: 11, sunDir: [-0.5, 0.85] });
  const sy = lerp(1000, 1130, p);
  K.sun(ctx, 560, sy, { r: 95, t, flare: 0.6 });
  // horizon, paddies with sun reflection
  ctx.fillStyle = '#6e5a98'; ctx.fillRect(-100, 1150, 1300, 40);
  const pg = ctx.createLinearGradient(0, 1180, 0, 1920); pg.addColorStop(0, '#d79a70'); pg.addColorStop(1, '#3c2f55');
  ctx.fillStyle = pg; ctx.fillRect(-100, 1180, 1300, 800);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,200,130,0.35)';
  for (let i = 0; i < 14; i++) { const y = 1200 + i * i * 4; ctx.fillRect(560 - 160 + Math.sin(t * 2 + i) * 20, y, 320 - i * 12, 5); }
  ctx.restore();
  // embankment + stopped train silhouette with lit windows
  ctx.fillStyle = '#2b1d3c'; ctx.beginPath(); ctx.moveTo(-100, 1400); ctx.lineTo(1200, 1330); ctx.lineTo(1200, 1440); ctx.lineTo(-100, 1520); ctx.fill();
  ctx.save(); ctx.translate(-60, 1395); ctx.rotate(-0.054);
  ctx.fillStyle = '#21162e'; ctx.beginPath(); ctx.roundRect(0, -170, 1000, 165, 20); ctx.fill();
  for (let i = 0; i < 11; i++) { ctx.fillStyle = '#ffcf8a'; ctx.fillRect(40 + i * 86, -140, 56, 50); }
  ctx.fillStyle = '#ffe9c0'; ctx.fillRect(40 + 6 * 86 + 20, -128, 16, 34); // a tiny figure at a window
  ctx.restore();
  // red signal in the foreground
  ctx.fillStyle = '#1a1226'; ctx.fillRect(890, 640, 26, 900); ctx.beginPath(); ctx.roundRect(850, 560, 106, 200, 30); ctx.fill();
  const blink = 0.6 + 0.4 * Math.sin(t * 6);
  K.glow(ctx, 903, 610, 140, '#ff4040', 0.7 * blink);
  ctx.fillStyle = `rgba(255,${60 + 60 * blink | 0},60,1)`; ctx.beginPath(); ctx.arc(903, 610, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a2a40'; ctx.beginPath(); ctx.arc(903, 700, 24, 0, Math.PI * 2); ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const hrs = Math.floor(lerp(17 * 60 + 52, 18 * 60 + 9, p));
  K.nameCard(ctx, `${Math.floor(hrs / 60)}.${String(hrs % 60).padStart(2, '0')}`, 'TERTAHAN SINYAL', 80, 300, { alpha: env(t, a + 0.1, b, 0.3, 0.2), k: prog(t, a + 0.1, a + 0.7), size: 110 });
});

// 5. Takbir: mother waits at the lit door; Laras runs into her arms.
shot('takbir', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  const hug = ease.inOutCubic(clamp((t - W('takbir', 'ibunya') + 0.3) / 0.9));
  camera(1.0 + 0.06 * p, 540, 960);
  K.sky(ctx, 'night');
  K.stars(ctx, t, { n: 90, y1: 700 });
  K.crescent(ctx, 860, 280, 46);
  K.house(ctx, 540, 1700, 1.25, { t, lit: 1 });
  K.glow(ctx, 540, 1100, 520, '#ffc070', 0.55);
  K.obor(ctx, 110, 1480, t, 1.3, 1); K.obor(ctx, 980, 1500, t, 1.3, 2);
  K.bust(ctx, 'ibu', 650 - hug * 20, 980, 1.25, { t, light: 0, rim: 1, rimCol: '#ffd690', wind: 0.1, ...(hug > 0.3 ? K.expr('happyCry') : K.expr('worry', { look: [-0.5, 0.1] })), blink: hug > 0.3 ? 0 : blinkAt(t) });
  const lx = lerp(-260, 300, ease.outCubic(clamp((lt - 0.1) / 1.0))) + hug * 60;
  K.bustBack(ctx, 'laras', lx, 1180 + hug * 20, 1.3, { t, wind: lerp(0.6, 0.15, hug), light: 1, rim: 0.9, rimCol: '#ffd690' });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tk = env(t, W('takbir', 'takbir') - 0.1, b, 0.4, 0.3);
  K.filmTitle(ctx, 'Allahu Akbar', 540, 470, { size: 74, alpha: tk * 0.95, font: 'Noto Serif', spacing: 2 });
});

// 6. Pull back over the village on the night of takbir; title card holds.
shot('akhir', (t, a, b) => {
  const lt = t - a, p = clamp(lt / 3);
  camera(1.18 - 0.16 * ease.outCubic(p), 540, 1060);
  K.sky(ctx, 'night');
  K.stars(ctx, t, { n: 160, y1: 1000 });
  K.crescent(ctx, 800, 360, 52);
  K.village(ctx, t, { y: 1380, col: '#1d1530', mosqueX: 760 });
  ctx.fillStyle = '#140e22'; ctx.fillRect(-200, 1378, 1500, 700);
  // torch parade (takbir keliling) along the road
  for (let i = 0; i < 9; i++) { const x = ((i * 120 + lt * 60) % 1300) - 100, y = 1480 + Math.sin(i) * 10; K.obor(ctx, x, y, t + i, 0.45, i); }
  K.house(ctx, 300, 1600, 0.42, { t, lit: 1 });
  K.figure(ctx, 'ibu', 290, 1610, 0.08, K.POSE.openArms(1), { t, sil: '#2a1d3a', light: 1, rim: 1, rimCol: '#ffcf80', dir: -1 });
  K.figure(ctx, 'laras', 250, 1610, 0.08, K.POSE.openArms(0.8), { t, sil: '#2a1d3a', light: 1, rim: 1, rimCol: '#ffcf80' });
  K.motes(ctx, t, { n: 30, col: '#ffe9a0', alpha: 0.7, size: 3, y0: 900, h: 700, drift: [6, -10] });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.filmTitle(ctx, 'Tiket Terakhir', 540, 560, { size: 112, alpha: env(t, a + 0.4, AM.duration + 2, 0.8, 0.3), sub: 'PULANGLAH' });
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
  if (since < 0.16 && s.id !== 'hook') { fx.fillStyle = `rgba(255,244,225,${0.5 * (1 - since / 0.16)})`; fx.fillRect(0, 0, AM.W, AM.H); }
  // soft close to black over the final ~0.8 s
  const endA = clamp((t - (AM.duration - 0.8)) / 0.8);
  if (endA > 0) { fx.fillStyle = `rgba(10,6,20,${endA})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.035, fps: 12 });
}
