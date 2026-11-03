// HUD Showreel demo-hp: "HP Bar: Nyawa Terakhirmu" (game HUD).
// One hero object, never cut: a giant HP bar in the middle of the screen. It drops on damage,
// heals green, takes a critical hit that drains it, then hits zero -> KO. Numbers count down/up.
import * as K from '/styles/dark-glow-ui/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL, R = K.RGB;

export const meta = { fps: 24, hold: 1, captions: { preset: 'neon', y: 1482, size: 52 } };

let bg, world, ui, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

const HP = { max: 100, x: 540, y: 1080, w: 860, h: 96 };
let CAM = [], T = {};

export async function setup(AM) {
  world = AM.layer('world'); ui = AM.layer('ui'); bg = world; fx = ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  T.hit1 = W('hook', 'turun') - 0.1;        // damage lands
  T.heal = W('heal', 'naik') - 0.1;         // heal lands
  T.crit = W('crit', 'menghapus') - 0.1;    // crit lands
  T.ko = C.ko.start + 0.1;                  // HP hits 0
  CAM = [
    [0, 540, 1080, 1.0],
    [0.2, 540, 1080, 1.05],
    [T.heal - 0.2, 540, 1080, 1.12, 0.02],
    [T.crit - 0.2, 540, 1080, 1.2, 0.03],
    [T.ko - 0.2, 540, 1080, 1.28, 0.04],
    [C.akhir.start - 0.2, 540, 1080, 1.0, 0],
    [AM.duration, 540, 1080, 1.0],
  ];
  AM.sfx('impact', T.hit1, { gain: 0.5 });
  AM.sfx('magic', T.heal, { gain: 0.45, pitch: 1.2 });
  AM.sfx('impact', T.crit, { gain: 0.6, pitch: 0.7 });
  AM.sfx('glitch', T.ko, { gain: 0.5 });
  AM.sfx('chime', W('akhir', 'mulai'), { gain: 0.4 });
}
let cam = { x: 540, y: 960, z: 1 };

// HP value at time t: 100 -> 50 (hit1) -> 80 (heal) -> 0 (crit, drains over ~1.2s)
function hpVal(t) {
  if (t < T.hit1) return 100;
  if (t < T.heal) return lerp(100, 50, ease.outCubic(clamp((t - T.hit1) / 0.4)));
  if (t < T.crit) return lerp(50, 80, ease.outCubic(clamp((t - T.heal) / 0.4)));
  return lerp(80, 0, ease.inCubic(clamp((t - T.crit) / 1.1)));
}
function hpColor(v) {
  if (v > 60) return P.mint;
  if (v > 25) return '#FFD24D';
  return '#FF4D5E';
}

function hpBar(ctx, t) {
  const v = hpVal(t);
  const { x, y, w, h } = HP;
  const f = v / 100;
  ctx.save();
  // track
  K.glass(ctx, x - w / 2, y - h / 2, w, h, { r: h / 2, haloRgb: R.violet, haloA: 0.35 });
  // fill
  const col = hpColor(v);
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16, (h - 16) / 2); ctx.clip();
  const gr = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  gr.addColorStop(0, col); gr.addColorStop(1, col);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = gr; ctx.fillRect(x - w / 2 + 8, y - h / 2 + 8, (w - 16) * f, h - 16);
  // shine
  ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff';
  ctx.fillRect(x - w / 2 + 8, y - h / 2 + 8, (w - 16) * f, (h - 16) * 0.35);
  ctx.restore();
  // damage ghost (red trail behind current value)
  const ghost = t > T.hit1 && t < T.heal ? 1 : t > T.crit ? 1 : 0;
  if (ghost) {
    ctx.globalAlpha = 0.16; ctx.fillStyle = '#FF4D5E';
    ctx.fillRect(x - w / 2 + 8 + (w - 16) * f, y - h / 2 + 8, (w - 16) * (1 - f), h - 16);
  }
  ctx.globalAlpha = 1;
  // number
  const n = Math.round(v);
  const pop = t > T.hit1 && t < T.heal ? 1 : 0;
  ctx.save(); ctx.translate(x + 300, y); ctx.scale(1 + pop * 0.06, 1 + pop * 0.06);
  K.label(ctx, String(n), 0, 0, { size: 64, weight: 700, align: 'center', color: col, font: K.FONT.mono });
  ctx.restore();
  K.label(ctx, '/ 100', x + 300, y + 34, { size: 22, align: 'center', color: P.ink3, font: K.FONT.mono });
  // label
  K.micro(ctx, 'HP · HEALTH POINT', x, y - h / 2 - 46, { align: 'center', size: 20 });
  ctx.restore();
  // damage/heal burst
  if (t > T.hit1 && t < T.hit1 + 0.5) K.sparks(ctx, x + 200, y, t - T.hit1, { rgb: R.pink, n: 26, seed: 1 });
  if (t > T.heal && t < T.heal + 0.5) K.sparks(ctx, x + 200, y, t - T.heal, { rgb: R.mint, n: 26, seed: 7 });
  if (t > T.crit && t < T.crit + 0.6) K.sparks(ctx, x, y, t - T.crit, { rgb: R.white, n: 40, seed: 13 });
}

// floating combat text
function floatText(ctx, t) {
  const items = [
    { at: T.hit1, txt: '-50', col: '#FF4D5E', seed: 2 },
    { at: T.heal, txt: '+30', col: P.mint, seed: 3 },
    { at: T.crit, txt: 'KRITIS!', col: '#FFD24D', seed: 5 },
  ];
  for (const it of items) {
    const d = t - it.at;
    if (d < 0 || d > 1.1) continue;
    const p = ease.outCubic(clamp(d / 0.5));
    const a = 1 - clamp((d - 0.5) / 0.6);
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(HP.x + 60, HP.y - 150 - p * 90);
    ctx.scale(1 + (it.txt === 'KRITIS!' ? 0.15 : 0.05) * clamp(d / 0.3), 1);
    K.label(ctx, it.txt, 0, 0, { size: it.txt === 'KRITIS!' ? 92 : 76, weight: 800, align: 'center', color: it.col, font: K.FONT.mono });
    ctx.restore();
  }
}

// KO overlay
function koOverlay(ctx, t) {
  if (t < T.ko) return;
  const a = clamp((t - T.ko) / 0.5);
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = '#06070C'; ctx.fillRect(0, 0, 1080, 1920);
  ctx.globalAlpha = a;
  K.glow(ctx, 540, 960, 700, R.pink, 0.5 * a);
  ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.04); ctx.scale(1 + (1 - clamp((t - T.ko) / 1.5)) * 0.1, 1);
  K.label(ctx, 'K.O.', 0, -40, { size: 220, weight: 800, align: 'center', color: '#FF4D5E', font: K.FONT.mono });
  K.label(ctx, 'HP 0 · GAME OVER', 0, 90, { size: 34, align: 'center', color: P.ink2, font: K.FONT.mono, spacing: 4 });
  ctx.restore();
  ctx.restore();
}

function overlays(t) {
  const H = (lines, at, out, o = {}) => K.headline(ui, t, at, lines, 540, o.y || 236, { size: 80, out, ...o });
  if (t < C.heal.start) H(['Satu tebasan,', 'HP-mu *turun setengah*.'], 0.05, C.heal.start - 0.1, { y: 210, size: 66 });
  if (t > C.heal.start - 0.1 && t < C.crit.start) H(['Satu ramuan,', 'bar *hijau naik* lagi.'], C.heal.start + 0.05, C.crit.start - 0.1, { y: 210, size: 66 });
  if (t > C.crit.start - 0.1 && t < C.ko.start) H(['Serangan *kritis*', 'menghapus semuanya.'], C.crit.start + 0.05, C.ko.start - 0.1, { y: 210, size: 66 });
  if (t > C.ko.start - 0.1 && t < C.akhir.start) H(['*HP nol*,'], C.ko.start + 0.35, C.akhir.start - 0.1, { y: 290, size: 96 });
  if (t > C.akhir.start) H(['Jaga *HP-mu*,', 'atau mulai dari awal.'], W('akhir', 'mulai') - 0.1, 999, { y: 210, size: 66 });
  K.micro(ui, 'HUD · GAME UI', 60, 70, { size: 18 });
  const sec = Math.floor(t), fr = Math.floor((t % 1) * 24);
  K.micro(ui, `00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, 940, 70, { size: 18, align: 'right' });
}

export function render(t) {
  cam = K.camAt(t, CAM, { z: 1, ts: 0.8 });
  K.stage(bg, t, { px: (cam.x - 540) * 0.06, py: (cam.y - 960) * 0.06, intensity: 1 });
  world.setTransform(1, 0, 0, 1, 0, 0);
  K.applyCam(world, cam);
  hpBar(world, t);
  floatText(world, t);
  overlays(t);
  fx.setTransform(1, 0, 0, 1, 0, 0);
  koOverlay(fx, t);
  K.finish(fx, t, AM);
  const f = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (f > 0) { fx.fillStyle = `rgba(6,7,12,${f * 0.9})`; fx.fillRect(0, 0, 1080, 1920); }
  for (const c of [world, ui]) c.setTransform(1, 0, 0, 1, 0, 0);
}
