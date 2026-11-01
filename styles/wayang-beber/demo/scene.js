// Wayang Beber demo: "Panji & Dewi Sekartaji" — a painted scroll unrolled scene by scene under an oil lamp (19.8 s).
import * as K from '/styles/wayang-beber/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;
const P = K.PAL, SC = K.SCROLL.SCENE, TAU = Math.PI * 2;

export const meta = { fps: 24, hold: 2, captions: { preset: 'serif', y: 1520, size: 56, maxWords: 4 } };

let ctx, S;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const X0 = 70, X1 = 1010, Y0 = 560, H = K.SCROLL.H; // scroll window on screen

// ---------------- the painted scroll (static parts) ----------------
const ground = (g, x0, w, h) => { g.fillStyle = P.green; g.fillRect(x0, h - 92, w, 46); g.fillStyle = P.greenDk; for (let x = x0; x < x0 + w; x += 26) { g.beginPath(); g.moveTo(x, h - 92); g.lineTo(x + 8, h - 112); g.lineTo(x + 16, h - 92); g.fill(); } };
const sky = (g, x0, w, seed) => { for (let i = 0; i < 5; i++) K.vine(g, x0 + 110 + i * 200 + (i % 2) * 40, 120 + (i % 2) * 70, 0.8, seed + i); };
const SCENES = [
  (g, x0, w, h) => { sky(g, x0, w, 1); K.gate(g, x0 + 260, h - 92, 1.05); K.tree(g, x0 + 860, h - 92, 1.1, 3); K.tree(g, x0 + 640, h - 92, 0.7, 4); ground(g, x0, w, h); },
  (g, x0, w, h) => { sky(g, x0, w, 7); K.pendopo(g, x0 + 380, h - 92, 520, 520); K.tree(g, x0 + 880, h - 92, 0.9, 5); ground(g, x0, w, h); },
  (g, x0, w, h) => { sky(g, x0, w, 13); K.tree(g, x0 + 120, h - 92, 0.95, 6); for (const sx of [700, 900]) { K.shape(g, (q) => { q.moveTo(x0 + sx - 90, h - 300); q.lineTo(x0 + sx, h - 360); q.lineTo(x0 + sx + 90, h - 300); }, P.redDk); for (const px of [-70, 70]) K.shape(g, (q) => q.rect(x0 + sx + px - 6, h - 300, 12, 208), P.wood); K.shape(g, (q) => q.ellipse(x0 + sx, h - 150, 50, 22, 0, 0, TAU), P.ochre); } ground(g, x0, w, h); },
  (g, x0, w, h) => { sky(g, x0, w, 19); K.pendopo(g, x0 + 500, h - 92, 560, 560); for (const kx of [180, 820]) { K.shape(g, (q) => q.rect(x0 + kx - 10, h - 260, 20, 170), P.wood); for (let k = 0; k < 7; k++) K.shape(g, (q) => q.ellipse(x0 + kx + Math.cos(k) * 40, h - 300 - k * 22, 26, 12, k, 0, TAU), k % 2 ? P.green : P.ochreLt, 2); } ground(g, x0, w, h); },
];

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  S = K.scrollCanvas('panji', SCENES);
  AM.sfx('kentongan', 0.05, { gain: 0.4 });
  AM.sfx('paper', 0.3, { gain: 0.45 });
  AM.sfx('gong', W('hook', 'dibuka') - 0.05, { gain: 0.55 });
  AM.sfx('paper', C.sayembara.start - 0.2, { gain: 0.4 });
  AM.sfx('kentongan', W('sayembara', 'bersayembara'), { gain: 0.35, pitch: 1.2 });
  AM.sfx('paper', C.jaka.start - 0.2, { gain: 0.4 });
  AM.sfx('drum_hit', W('jaka', 'menyamar'), { gain: 0.35, pitch: 1.4 });
  AM.sfx('gong', W('akhir', 'ke-24'), { gain: 0.55 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;
function cam(z, cx, cy) { ctx.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z); }

/** Full stage at scroll offset u0; figs(g) draws the live figures in scroll coordinates. */
function stage(t, u0, Cm, figs, { tied = false, rightX = X1, roll = 0 } = {}) {
  const f = K.flicker(t);
  cam(Cm.z, Cm.x, Cm.y);
  // room: dark wall with the warm pool of the lamp
  const g = ctx.createRadialGradient(540, 700, 50, 540, 900, 1300); g.addColorStop(0, '#5a3a22'); g.addColorStop(0.5, '#2a1a10'); g.addColorStop(1, P.night);
  ctx.fillStyle = g; ctx.fillRect(-400, -400, 1900, 2800);
  const w = rightX - X0;
  K.scrollWindow(ctx, S, u0, X0, Y0, w);
  ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, w, H); ctx.clip(); ctx.translate(X0 - u0, Y0); figs && figs(ctx); ctx.restore();
  K.roller(ctx, X0, Y0, H, -u0 / 600, 24 + clamp(u0 / 4000) * 10);
  K.roller(ctx, rightX, Y0, H, -u0 / 600 + roll, 34 - clamp(u0 / 4000) * 8, { tied });
  // the lamp hangs above, its light breathes on the paper
  const fl = K.lamp(ctx, 540, 330, t, 0.9);
  K.lampLight(ctx, 657, 270, fl, 820);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(10,5,2,${clamp((0.96 - f) * 2.2)})`; ctx.fillRect(0, 0, 1080, 1920);
  return f;
}
const sx = (u) => u; // figures are positioned directly in scroll coordinates
const GY = H - 92;   // painted ground line

// 1. Hook: the scroll races open past all its scenes... and stops at the last one, still rolled and tied.
shot('hook', (t, a, b) => {
  const run = ease.inOutCubic(clamp(t / 2.3));
  const u0 = lerp(0, 3000 - 0, run);
  const push = ease.inOutCubic(clamp((t - W('hook', 'tak') + 0.3) / 0.8));
  const Cm = { z: lerp(1.0, 1.45, push), x: lerp(540, 860, push), y: lerp(960, 980, push) };
  stage(t, u0, Cm, (g) => figuresAt(g, t, u0), { tied: true });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, lerp(700, X1 - 40, push), lerp(1100, 960, push), 1250, 2000);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'WAYANG BEBER', 540, 170, { size: 54, sub: '6 gulungan · 24 adegan', alpha: prog(t, 0.05, 0.4) });
  K.cartouche(ctx, 'ADEGAN KE-24', 540, 1330, { size: 50, sub: 'tak boleh dibuka', alpha: prog(t, W('hook', 'tak') - 0.1, W('hook', 'tak') + 0.25) });
});
// everything painted on the scroll, alive (used by the fast unroll too)
function figuresScene(g, t, k) { figuresAt(g, t, k * SC + 500 - 300, k); }
function figuresAt(g, t, u0, only = null) {
  const vis = (x) => (only == null ? x > u0 - 300 && x < u0 + 1300 : Math.floor(x / SC) === only);
  if (vis(500)) { K.figure(g, 'emban', { x: 300, y: GY, s: 0.95, t }); K.figure(g, 'putri', { x: 520, y: GY, s: 1.05, t }); }
  if (vis(1500)) { K.figure(g, 'raja', { x: SC + 380, y: GY, s: 1.0, t }); K.figure(g, 'patih', { x: SC + 760, y: GY, s: 0.95, face: -1, t }); }
  if (vis(2500)) { K.figure(g, 'jaka', { x: 2 * SC + 420, y: GY, s: 1.0, t, mask: 0.5, dance: 0.5 }); K.figure(g, 'abdi', { x: 2 * SC + 180, y: GY, s: 1.0, t, drum: t }); K.figure(g, 'putri', { x: 2 * SC + 800, y: GY, s: 1.0, face: -1, t }); }
  if (vis(3500)) { K.figure(g, 'jaka', { x: 3 * SC + 400, y: GY, s: 1.0, t, armF: [1.0, 0.6] }); K.figure(g, 'putri', { x: 3 * SC + 620, y: GY, s: 1.0, face: -1, t, armF: [0.9, 0.6] }); }
}

// 2. Sekartaji slips out of the palace gate with her maid, glancing back.
shot('kabur', (t, a, b) => {
  const lt = t - a, p = lt / (b - a);
  const u0 = lerp(0, 40, p);
  const walkX = lerp(380, 640, ease.inOutSine(clamp(lt / 3.2)));
  const Cm = { z: 1.55, x: lerp(560, 640, p), y: 1010 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'emban', { x: walkX - 210, y: GY, s: 0.95, t, walk: lt * 1.3 + 0.4, armF: [0.5, 0.6] });
    const back = env(t, W('kabur', 'istana') - 0.2, W('kabur', 'menolak') + 0.4, 0.3, 0.3);
    K.figure(g, 'putri', { x: walkX, y: GY, s: 1.05, t, walk: lt * 1.3, look: -back * 0.25, armF: [0.3 + 1.2 * clamp((t - W('kabur', 'menolak')) / 0.4), 1.2] });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + walkX - u0 + 10, Y0 + GY - 520, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'DEWI SEKARTAJI', 540, 250, { size: 52, sub: 'putri Kediri', alpha: prog(t, W('kabur', 'Dewi') - 0.1, W('kabur', 'Dewi') + 0.3) });
});

// 3. The scroll rolls on (right to left): the king on his throne proclaims the contest; his patih spreads the word.
shot('sayembara', (t, a, b) => {
  const lt = t - a;
  const u0 = lerp(40, SC, ease.inOutCubic(clamp(lt / 0.8)));
  const Cm = { z: 1.4, x: 560, y: 990 };
  const decl = clamp((t - W('sayembara', 'bersayembara') + 0.2) / 0.4);
  stage(t, u0, Cm, (g) => {
    if (u0 < SC - 60) figuresScene(g, t, 0);
    K.figure(g, 'raja', { x: SC + 380, y: GY, s: 1.05, t, armF: [0.4 + 1.6 * decl, 0.2], mouth: decl * Math.abs(Math.sin(t * 9)) });
    K.figure(g, 'patih', { x: SC + 760, y: GY, s: 1.0, face: -1, t, armF: [0.3 + 0.6 * clamp((t - W('sayembara', 'penemunya')) / 0.4), 1.0 + Math.sin(t * 4) * 0.1], mouth: Math.abs(Math.sin(t * 8)) * clamp((t - W('sayembara', 'penemunya')) / 0.3) });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + SC + 380 - u0 + 30, Y0 + GY - 560, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'PRABU BRAWIJAYA', 540, 250, { size: 50, sub: 'raja Kediri', alpha: prog(t, a + 0.7, a + 1.0) });
  K.cartouche(ctx, 'SAYEMBARA', 540, 1320, { size: 46, sub: 'penemunya, suaminya', alpha: prog(t, W('sayembara', 'penemunya') - 0.1, W('sayembara', 'penemunya') + 0.25) });
});

// 4. The market: Jaka Kembang Kuning dances as a busker with the barong; his servant drums; the princess turns.
shot('jaka', (t, a, b) => {
  const lt = t - a;
  const u0 = lerp(SC, 2 * SC, ease.inOutCubic(clamp(lt / 0.8)));
  const Cm = { z: lerp(1.3, 1.45, clamp(lt / 3)), x: 560, y: 1000 };
  const beat = t * 2.2;
  const rec = clamp((t - W('jaka', 'menyamar') + 0.1) / 0.5);
  stage(t, u0, Cm, (g) => {
    if (u0 < 2 * SC - 60) figuresScene(g, t, 1);
    K.figure(g, 'abdi', { x: 2 * SC + 170, y: GY, s: 1.0, t, drum: beat });
    K.figure(g, 'jaka', { x: 2 * SC + 430, y: GY - Math.abs(Math.sin(beat * Math.PI)) * 14, s: 1.05, t, mask: Math.abs(Math.sin(beat * Math.PI)), dance: Math.sin(beat * Math.PI), armF: [2.4 + Math.sin(beat * Math.PI) * 0.2, 0.4], armB: [0.8, 0.8] });
    K.figure(g, 'putri', { x: 2 * SC + 790, y: GY, s: 1.0, face: -1, t, look: -rec * 0.12, armF: [0.3 + 1.4 * rec, 1.6 * rec + 0.2] });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 2 * SC + 430 - u0 + 20, Y0 + GY - 560, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'JAKA KEMBANG KUNING', 540, 250, { size: 46, sub: 'sang Panji yang menyamar', alpha: prog(t, W('jaka', 'Jaka') - 0.05, W('jaka', 'Jaka') + 0.3) });
});

// 5. The wedding... then the camera finds the last scene: still rolled, tied with red cord.
shot('akhir', (t, a, b) => {
  const lt = t - a, end = C.akhir.end;
  const u0 = lerp(2 * SC, 3 * SC, ease.inOutCubic(clamp(lt / 0.8)));
  const pull = ease.inOutCubic(clamp((t - W('akhir', 'Tapi') + 0.1) / 1.0));
  const Cm = { z: lerp(1.4, 1.5, pull), x: lerp(560, 850, pull), y: lerp(1000, 960, pull) };
  stage(t, u0, Cm, (g) => {
    if (u0 < 3 * SC - 60) figuresScene(g, t, 2);
    K.figure(g, 'jaka', { x: 3 * SC + 410, y: GY, s: 1.05, t, armF: [1.0 + 0.1 * Math.sin(t * 2), 0.7] });
    K.figure(g, 'putri', { x: 3 * SC + 610, y: GY, s: 1.0, face: -1, t, armF: [0.9, 0.7], look: 0.05 });
    // flower petals falling on the couple
    for (let i = 0; i < 14; i++) { const u = ((t * 0.25 + hrand(i, 1)) % 1); g.fillStyle = i % 2 ? P.red : P.ochreLt; g.beginPath(); g.ellipse(3 * SC + 300 + hrand(i, 2) * 420 + Math.sin(t * 2 + i) * 20, 120 + u * 560, 7, 4, t + i, 0, TAU); g.fill(); }
  }, { tied: true });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, lerp(X0 + 510, X1 - 30, pull), lerp(Y0 + GY - 560, 980, pull), 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'ADEGAN KE-24', 540, 250, { size: 52, sub: 'tetap tergulung, sampai kini', alpha: prog(t, W('akhir', 'ke-24') - 0.1, W('akhir', 'ke-24') + 0.3) });
  const close = clamp((t - (end + 0.75)) / 0.45);
  if (close > 0) { ctx.fillStyle = `rgba(8,4,2,${close * 0.6})`; ctx.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= at(sh.id)) s = sh;
  const i = SHOTS.indexOf(s);
  const a = Math.max(0, at(s.id)), b = SHOTS[i + 1] ? at(SHOTS[i + 1].id) : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - a;
  if (i > 0 && since < 0.16) { ctx.fillStyle = `rgba(255,214,150,${0.25 * (1 - since / 0.16)})`; ctx.fillRect(0, 0, 1080, 1920); }
  AM.lib.vignette(ctx, { strength: 0.6, inner: 0.4 });
}
