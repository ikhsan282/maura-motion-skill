// Flat Vector demo (20 s): "Cahaya di Wajahmu Lebih Tua dari Peradaban".
// A photon is born in the Sun's core, bonks into particles, random-walks for tens of thousands of years,
// escapes, crosses 150 million km in 8 min 20 s and lands on your cheek.
import * as K from '/styles/kardus-bekas/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'bold', y: 1470, size: 64, active: '#ffd65e', stroke: 9, strokeColor: '#0b1230', spacing: 1, anim: 'rise', maxWords: 3 } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
// beat clock: every beat is a [start, end) window in seconds, derived from word times
let B = {};
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const s = (id) => C[id].start - 0.12;
  B = {
    hook: [0, s('lahir')],
    inti: [s('lahir'), W('lahir', 'Matahari') + 0.45],
    lahir: [W('lahir', 'Matahari') + 0.45, s('acak')],
    acak: [s('acak'), W('acak', 'puluhan') - 0.15],
    lama: [W('acak', 'puluhan') - 0.15, s('bebas')],
    bebas: [s('bebas'), W('bebas', 'Bumi') - 0.15],
    delapan: [W('bebas', 'Bumi') - 0.15, s('moral')],
    moral: [s('moral'), AM.duration + 1],
  };
  AM.sfx('pop', 0.9, { gain: 0.5 });
  AM.sfx('swoosh_up', B.hook[1] - 0.4, { gain: 0.35 });
  AM.sfx('magic', B.lahir[0], { gain: 0.4 });
  AM.sfx('boing', W('lahir', 'menabrak') + 0.12, { gain: 0.5 });
  AM.sfx('riser', B.lama[0], { gain: 0.3 });
  AM.sfx('sparkle', W('bebas', 'lolos'), { gain: 0.5 });
  AM.sfx('ding', W('bebas', 'detik') + 0.05, { gain: 0.4, pitch: 1.2 });
  AM.sfx('chime', W('moral', 'wajahmu') + 0.1, { gain: 0.45 });
}
const sc = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });

// the bedroom at dawn (hook, wajah, moral share it: same place, same light)
const WIN = { x: 620, y: 210, w: 390, h: 430 };
const KID = { x: 430, y: 1060, s: 0.95 };
const CHEEK = [KID.x + 150 * KID.s, KID.y + 120 * KID.s];
const SUNWIN = [WIN.x + WIN.w * 0.52, WIN.y + WIN.h - 70];
function room(t, { lit = 1, mood = 'joy', kidAlpha = 1 } = {}) {
  const bg = AM.lib.cached('fv-room', () => {
    const c = AM.lib.makeCanvas(54, 96), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#121c48'); gr.addColorStop(0.6, '#231f5e'); gr.addColorStop(1, '#2e2266');
    g.fillStyle = gr; g.fillRect(0, 0, 54, 96); return c;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0, 1080, 1920); ctx.restore();
  // window with sunrise
  const { x, y, w, h } = WIN;
  K.glow(ctx, x + w / 2, y + h / 2, 520, '#ff9f5a', 0.35 * lit);
  ctx.save(); AM.lib.roundRect(ctx, x, y, w, h, 46); ctx.clip();
  const sky = ctx.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#5a4bc4'); sky.addColorStop(0.55, '#ff8f6b'); sky.addColorStop(1, '#ffd27a');
  ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
  K.glow(ctx, SUNWIN[0], SUNWIN[1], 210, '#fff2b0', 0.9);
  K.ball(ctx, SUNWIN[0], SUNWIN[1] - Math.sin(t * 0.2) * 4, 70, '#fffbe6', '#ffd25a');
  ctx.fillStyle = 'rgba(255,240,230,.55)';
  for (let i = 0; i < 3; i++) { const cx = x + ((i * 170 + t * 14) % (w + 200)) - 100, cy = y + 90 + i * 70; AM.lib.roundRect(ctx, cx, cy, 120 + i * 20, 26, 13); ctx.fill(); }
  ctx.fillStyle = '#7a5a8f'; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + h - 60); ctx.quadraticCurveTo(x + 120, y + h - 110, x + 230, y + h - 70); ctx.quadraticCurveTo(x + 330, y + h - 40, x + w, y + h - 80); ctx.lineTo(x + w, y + h); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#18215a'; ctx.fillRect(x + w / 2 - 8, y, 16, h); ctx.fillRect(x, y + h * 0.45 - 8, w, 16);
  ctx.lineWidth = 20; ctx.strokeStyle = '#18215a'; AM.lib.roundRect(ctx, x, y, w, h, 46); ctx.stroke();
  ctx.fillStyle = '#3b3a8a'; AM.lib.roundRect(ctx, x - 40, y + h + 4, w + 80, 26, 13); ctx.fill();
  // little plant on the sill
  ctx.fillStyle = '#e07a5f'; AM.lib.roundRect(ctx, x + 20, y + h - 46, 60, 52, 10); ctx.fill();
  ctx.fillStyle = '#3fd6a0'; for (let i = 0; i < 4; i++) { ctx.save(); ctx.translate(x + 50, y + h - 46); ctx.rotate(-0.9 + i * 0.6 + Math.sin(t * 1.3 + i) * 0.05); ctx.beginPath(); ctx.ellipse(0, -34, 13, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  // sunbeam onto the cheek + drifting dust
  K.beam(ctx, SUNWIN[0], SUNWIN[1] - 40, CHEEK[0] + 40, CHEEK[1] + 60, 110, 300, 0.75 * lit);
  ctx.fillStyle = 'rgba(255,240,200,.75)'; ctx.beginPath();
  for (let i = 0; i < 26; i++) { const u = (hrand(i, 1) + t * 0.04 * (0.5 + hrand(i, 2))) % 1, px = lerp(SUNWIN[0], CHEEK[0] + 40, u) + (hrand(i, 3) - 0.5) * lerp(160, 420, u) + Math.sin(t + i) * 10, py = lerp(SUNWIN[1], CHEEK[1] + 60, u) + (hrand(i, 4) - 0.5) * 120; const r = 2 + hrand(i, 5) * 3; ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, Math.PI * 2); }
  ctx.globalAlpha = lit; ctx.fill(); ctx.globalAlpha = 1;
  ctx.save(); ctx.globalAlpha = kidAlpha; K.person(ctx, KID.x, KID.y, { s: KID.s, t, mood, lit, look: [0.25, -0.1] }); ctx.restore();
}
// photon flying down the beam to the cheek, landing at time tl
function beamPhoton(t, t0, tl, { r = 30 } = {}) {
  const u = clamp((t - t0) / (tl - t0));
  const e = ease.inOutCubic(u);
  const sx = SUNWIN[0], sy = SUNWIN[1] - 30, ex = CHEEK[0] + 20, ey = CHEEK[1] - 6;
  r = u >= 1 ? 28 : r;
  let x = lerp(sx, ex, e) + Math.sin(u * Math.PI) * -60, y = lerp(sy, ey, e) + Math.sin(u * Math.PI * 2) * 30;
  const after = t - tl;
  let squash = 0, mood = 'happy', vx = (ex - sx) * 2, vy = (ey - sy) * 2;
  if (u >= 1) { vx = vy = 0; squash = Math.max(0, Math.exp(-after * 7) * Math.cos(after * 26)) * 0.9; mood = after > 0.25 ? 'joy' : 'wow'; y += Math.sin(t * 3) * 4; x += 4; }
  else if (u <= 0) { vx = vy = 0; }
  if (u < 1) K.speedLines(ctx, x, y, Math.atan2(vy, vx), t, { n: 5, len: 120, spread: 26, w: 4 });
  K.photon(ctx, x, y, { r, t, vx: u > 0 && u < 1 ? vx : 0, vy: u > 0 && u < 1 ? vy : 0, heat: 1, mood, squash, look: [-0.5, 0.4] });
  if (after >= 0) { K.ring(ctx, ex, ey, after, { r: 110, color: '#fff2b0', life: 0.45, w: 7 }); K.burst(ctx, ex, ey, after, { n: 9, r0: 40, r1: 150, life: 0.5, seed: 2 }); }
  return after;
}

// core background (inside the Sun)
function coreBG(t, ox = 0, oy = 0, warm = 0) {
  const bg = AM.lib.cached('fv-corebg', () => {
    const c = AM.lib.makeCanvas(90, 160), g = c.getContext('2d');
    const gr = g.createRadialGradient(45, 70, 4, 45, 80, 110); gr.addColorStop(0, '#fff6cf'); gr.addColorStop(0.5, '#ffd36a'); gr.addColorStop(1, '#ff9c40');
    g.fillStyle = gr; g.fillRect(0, 0, 90, 160); return c;
  });
  sc(); ctx.drawImage(bg, 0, 0, 1080, 1920);
  if (warm) { ctx.fillStyle = `rgba(255,120,60,${warm})`; ctx.fillRect(0, 0, 1080, 1920); }
  // far, soft plasma (parallax 0.3)
  K.plasma(ctx, t, { x: -ox * 0.3 - 200, y: -oy * 0.3 - 200, w: 1500, h: 2400, n: 26, seed: 9, cols: ['rgba(255,255,255,.35)', 'rgba(255,170,90,.35)'], rmin: 30, rmax: 70, speed: 0.6 });
}

// ---------------------------------------------------------------- shots
// 1. Hook: dawn. A photon slides down the sunbeam and boops the cheek. "Before the pyramids."
shot('hook', (t, a, b) => {
  const push = prog(t, b - 0.45, b, ease.inCubic);
  const z = lerp(1.0, 1.06, prog(t, a, b - 0.45, ease.inOutSine)) * (1 + push * 5);
  K.cam(ctx, z, lerp(540, SUNWIN[0], push), lerp(960, SUNWIN[1], push));
  const land = 0.9;
  room(t, { lit: lerp(0.35, 1, prog(t, land - 0.1, land + 0.6)), mood: t < land + 0.15 ? 'sleep' : 'joy' });
  beamPhoton(t, -0.2, land);
  sc();
  const fade = 1 - push;
  ctx.globalAlpha = fade;
  const dp = prog(t, W('hook', 'mulai') - 0.1, W('hook', 'piramida'), ease.inOutCubic);
  if (dp > 0) { // a dotted road from the cheek back into the past
    ctx.save(); ctx.strokeStyle = 'rgba(255,226,122,.8)'; ctx.lineWidth = 6; ctx.setLineDash([2, 16]); ctx.lineCap = 'round';
    const x0 = CHEEK[0], y0 = CHEEK[1] - 40, x1 = 330, y1 = 470, cx = 250, cy = 900;
    ctx.beginPath(); ctx.moveTo(x0, y0); const N = 30; for (let i = 1; i <= N * dp; i++) { const u = i / N; ctx.lineTo((1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1); } ctx.stroke(); ctx.restore();
  }
  const pt = W('hook', 'piramida') - 0.05, pp = K.pop(t, pt, 0.5);
  if (pp > 0) {
    K.glow(ctx, 270, 360, 200, '#ffc35a', 0.35 * pp);
    ctx.save(); ctx.translate(270, 340); ctx.scale(pp, pp); K.icon(ctx, 'pyramid', 0, 0, 1.6); ctx.restore();
    K.badge(ctx, '±4.500 tahun lalu', 270, 480, { p: K.pop(t, pt + 0.2, 0.45), size: 40, sub: 'piramida dibangun' });
  }
  ctx.globalAlpha = 1;
});

// 2. The Sun opens like a cake; a leader line drops into the core. Then the camera dives in.
shot('inti', (t, a, b) => {
  const land = prog(t, a, a + 0.6, ease.outCubic);
  const push = prog(t, b - 0.4, b, ease.inCubic);
  const SX = 540, SY = 1010, R = 350;
  const z = lerp(2.4, 1, land) * (1 + push * 7);
  K.space(ctx, t, { px: t * 8 });
  K.cam(ctx, z, SX, SY - (1 - land) * 80);
  K.sun(ctx, SX, SY, R, t, { cut: prog(t, a + 0.1, a + 0.7, ease.inOutCubic) });
  sc(); ctx.globalAlpha = 1 - push;
  const ti = W('lahir', 'inti');
  K.callout(ctx, 540, 960 + 80 * z * (1 - land) , 540, 560, prog(t, ti - 0.2, ti + 0.35));
  K.badge(ctx, 'INTI MATAHARI', 540, 530, { p: K.pop(t, ti), size: 48, accent: '#ffffff' });
  K.badge(ctx, '15 juta °C', 540, 380, { p: K.pop(t, ti + 0.25), size: 44, bg: 'rgba(255,214,94,.95)', fg: '#3a1c05' });
  ctx.globalAlpha = 1;
});

// 3. Inside the core: a fusion flash, a little gamma photon pops out, dashes off and bonks a particle.
shot('lahir', (t, a, b) => {
  const hit = W('lahir', 'menabrak') + 0.12, go = W('lahir', 'lalu') - 0.05;
  const z = lerp(1.3, 1, prog(t, a, a + 0.5, ease.outCubic));
  const u = clamp((t - go) / (hit - go));
  const hitX = 1250;
  const af = t - hit;
  let px = lerp(540, hitX - 70, ease.inQuad(u)), py = 840 - (1 - u) * 0 + Math.sin(u * 5) * 20;
  let squash = 0, mood = t < a + 0.35 ? 'wow' : 'happy', vx = u > 0 && u < 1 ? 3000 : 0;
  if (af >= 0) { const k = ease.outCubic(clamp(af / 0.6)); px = hitX - 70 - k * 200; py = 840 - k * 200; squash = Math.exp(-af * 6) * 1.1; mood = 'dizzy'; vx = 0; }
  const camX = lerp(540, hitX - 300, prog(t, go, hit, ease.inOutCubic));
  const [sx, sy] = af > 0 && af < 0.35 ? AM.lib.shakeOffset(t, 14 * (1 - af / 0.35), 3, 24) : [0, 0];
  coreBG(t, camX, 0);
  K.cam(ctx, z, camX + sx, 860 + sy);
  K.plasma(ctx, t, { x: -300, y: 100, w: 2400, h: 1400, n: 70, seed: 7, avoid: [hitX + 80, 840, 160] });
  // fusion flash at the birth spot
  const fa = t - a;
  K.glow(ctx, 540, 840, 520, '#ffffff', Math.max(0, 1 - fa * 2.5), false, 0.6);
  K.ring(ctx, 540, 840, fa, { r: 380, color: '#ffffff', life: 0.6, w: 12 });
  K.burst(ctx, 540, 840, fa, { n: 14, r0: 80, r1: 420, life: 0.6, w: 10, color: '#ffffff', seed: 4 });
  // the particle it hits
  const pb = af > 0 ? Math.exp(-af * 5) * Math.sin(af * 30) * 12 : 0;
  K.glow(ctx, hitX + 90, 840, 200, '#ff8a5a', 0.4 + (af > 0 ? Math.exp(-af * 4) * 0.5 : 0));
  K.ball(ctx, hitX + 90 + pb, 840, 100, '#ffb39a', '#ef5a3c');
  if (u > 0 && af < 0) K.speedLines(ctx, px, py, 0, t, { n: 9, len: 420, spread: 50, w: 7 });
  const bp = K.pop(t, a, 0.45, 2.6);
  K.photon(ctx, px, py, { r: 60 * bp, t, vx, vy: 0, heat: 0.05, mood, squash, look: [0.6, 0] });
  if (af >= 0) { K.burst(ctx, hitX + 10, 840, af, { n: 10, r0: 60, r1: 220, life: 0.45, color: '#ffffff', seed: 6 }); K.ring(ctx, hitX + 10, 840, af, { r: 200, life: 0.4 }); }
  sc();
  K.badge(ctx, 'FOTON', 540, 420, { p: K.pop(t, a + 0.15) * (1 - prog(t, hit - 0.25, hit)), size: 56, sub: 'lahir sebagai sinar gamma', bg: 'rgba(90,60,200,.85)' });
  K.badge(ctx, 'TABRAK!', 540, 420, { p: K.pop(t, hit, 0.35, 3), size: 64, bg: 'rgba(255,255,255,.95)', fg: '#d6402f' });
});

// 4. Absorbed, re-emitted in a random direction: a true random walk, faster and faster.
const RW = K.randomWalk(17, 90, 170, 540, 900);
shot('acak', (t, a, b) => {
  const t0 = a + 0.05, slow = W('acak', 'acak') - t0;
  const lt = t - t0;
  const u = lt < 0 ? 0 : lt < slow ? (lt / slow) * 2 : 2 + Math.pow((lt - slow) / Math.max(0.1, b - t0 - slow), 1.4) * 40;
  const zoom = lerp(1.15, 0.6, prog(t, W('acak', 'acak') - 0.2, b, ease.inOutCubic));
  const cur = K.along(RW, u);
  const k = prog(t, W('acak', 'acak'), b);
  const cx = lerp(cur.x, 540, k), cy = lerp(cur.y, 900, k);
  coreBG(t, cx * 0.5, cy * 0.5);
  K.cam(ctx, zoom, cx, cy);
  const ui = Math.floor(u);
  for (let i = Math.max(1, ui - 6); i < Math.min(RW.length, ui + 3); i++) {
    const lit = i <= ui ? 1 : 0, [x, y] = RW[i];
    const ox = x + Math.cos(i * 2.3) * 46, oy = y + Math.sin(i * 2.3) * 46;
    if (lit) K.glow(ctx, ox, oy, 70, '#fff3b0', 0.35);
    K.ball(ctx, ox, oy, 26, lit ? '#ffd0b8' : '#ffb39a', '#ef5a3c');
  }
  K.trail(ctx, RW, u, { color: '#ffffff', width: 10 / zoom, fade: 40, old: 0.45 });
  const f = u - Math.floor(u), slowPhase = u < 2;
  let pr = 54, squash = 0, mood = 'happy';
  if (slowPhase) { if (f > 0.75) pr = 54 * (1 - (f - 0.75) / 0.25 * 0.85); else if (f < 0.25) { pr = 54 * (0.15 + f / 0.25 * 0.85); squash = (0.25 - f) * 2; } }
  else mood = 'dizzy';
  K.photon(ctx, cur.x, cur.y, { r: pr / Math.max(0.7, zoom * 1.2), t, vx: cur.dx * 6, vy: cur.dy * 6, heat: lerp(0.1, 0.35, clamp(u / 40)), mood, squash, look: [cur.dx > 0 ? 0.5 : -0.5, 0] });
  sc();
  const fade = 1 - prog(t, W('acak', 'arah'), W('acak', 'arah') + 0.3);
  K.badge(ctx, 'diserap', 280, 560, { p: K.pop(t, W('acak', 'Diserap')) * fade, size: 42, bg: 'rgba(120,40,20,.55)' });
  K.badge(ctx, 'dilepas lagi', 790, 560, { p: K.pop(t, W('acak', 'dilepas')) * fade, size: 42, bg: 'rgba(120,40,20,.55)' });
  K.badge(ctx, 'ARAH ACAK', 540, 420, { p: K.pop(t, W('acak', 'acak') - 0.1, 0.4, 3), size: 56, bg: 'rgba(255,255,255,.95)', fg: '#5b44d6' });
});

// 5. Pull all the way out: the scribble fills the radiative zone while the years roll.
const LR = 400;
const inWedge = (x, y) => { const r = Math.hypot(x, y), a = Math.atan2(y, x); return r > LR * 0.27 && r < LR * 0.69 && a > -Math.PI * 0.73 && a < -Math.PI * 0.27; };
const RW2 = K.boundedWalk(23, 1500, 8, inWedge, 0, -LR * 0.3, [0, -0.1]);
shot('lama', (t, a, b) => {
  const SX = 540, SY = 1060, R = LR;
  const out = prog(t, a, a + 1.0, ease.inOutCubic);
  const z = lerp(3.4, 1, out);
  K.space(ctx, t, { px: t * 8 });
  K.cam(ctx, z, SX, lerp(SY - R * 0.3, SY - 40, out));
  K.sun(ctx, SX, SY, R, t, { cut: 1 });
  const grow = prog(t, a, b - 0.1, ease.inOutSine);
  const n = Math.floor(lerp(60, RW2.length - 1, grow));
  ctx.save(); ctx.translate(SX, SY); ctx.strokeStyle = 'rgba(255,255,240,.9)'; ctx.lineWidth = 2.2 / Math.max(1, z * 0.6); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(RW2[0][0], RW2[0][1]); for (let i = 1; i <= n; i++) ctx.lineTo(RW2[i][0], RW2[i][1]); ctx.stroke();
  const tip = RW2[n];
  K.photon(ctx, tip[0], tip[1], { r: 26 / Math.sqrt(z), t, heat: lerp(0.35, 0.7, grow), mood: 'calm', glowA: 0.8 });
  ctx.restore();
  sc();
  const c0 = W('acak', 'puluhan'), c1 = W('acak', 'tahun') + 0.15;
  const yrs = lerp(10000, 170000, ease.inOutCubic(clamp((t - W('acak', 'ratusan') + 0.1) / (c1 - W('acak', 'ratusan') + 0.1))));
  const cp = K.pop(t, c0 - 0.1, 0.4);
  K.counter(ctx, t < c0 ? 0 : yrs, 540, 300, { size: 124, p: cp, color: '#ffe27a' });
  K.badge(ctx, 'TAHUN', 540, 415, { p: cp, size: 36 });
  K.badge(ctx, 'perkiraan: ±10.000 – 170.000 tahun', 540, 520, { p: K.pop(t, W('acak', 'tahun')), size: 32, bg: 'rgba(255,255,255,.18)' });
});

// 6. Free! It pops out of the surface into space.
shot('bebas', (t, a, b) => {
  const go = W('bebas', 'lolos') - 0.05, af = t - go;
  const [sx, sy] = af > 0 && af < 0.5 ? AM.lib.shakeOffset(t, 10 * (1 - af / 0.5), 5, 24) : [0, 0];
  K.space(ctx, t, { px: 0, py: Math.max(0, af) * 400 });
  K.cam(ctx, lerp(1.05, 1, prog(t, a, b)), 540 + sx, 960 + sy - Math.max(0, af) * 120);
  const LY = 1260 + Math.max(0, af) * 260;
  K.glow(ctx, 540, LY + 200, 1000, '#ff9a3c', 0.7);
  K.glow(ctx, 540, LY + 60, 700, '#ffd36a', 0.5);
  K.ball(ctx, 540, LY + 1500, 1500, '#ffe08a', '#ff8a3a', { lx: 0, ly: -0.9 });
  let py, mood = 'happy', vy = 0;
  if (af < 0) { py = LY + 40 - prog(t, a, go, ease.outBack) * 70; mood = 'wow'; }
  else { py = LY - 30 - ease.outCubic(clamp(af / 0.6)) * 700 - af * 60; vy = af < 0.5 ? -2600 : -300; mood = 'joy'; }
  if (af > 0 && af < 0.7) K.speedLines(ctx, 540, py, -Math.PI / 2, t, { n: 9, len: 380, spread: 70, w: 8 });
  K.photon(ctx, 540, py, { r: 70, t, vy, heat: 1, mood, look: [0, -0.5] });
  if (af >= 0) { K.burst(ctx, 540, LY - 40, af, { n: 16, r0: 60, r1: 420, life: 0.7, w: 10, seed: 9 }); K.ring(ctx, 540, LY - 30, af, { r: 380, life: 0.6, w: 10, color: '#fff2b0' }); }
});

// 7. 150 million km in 8 minutes 20 seconds; then the camera dives into the Earth.
shot('delapan', (t, a, b) => {
  K.space(ctx, t, { px: t * 10 });
  const push = prog(t, b - 0.35, b, ease.inCubic);
  const EX = 790, EY = 1120, SX = 170, SY = 330;
  K.cam(ctx, lerp(1, 1.04, prog(t, a, b)) * (1 + push * 9), lerp(540, EX, push), lerp(960, EY, push));
  K.sun(ctx, SX, SY, 230, t, { glowA: 0.9 });
  K.earth(ctx, EX, EY, 92, t, { sunDir: Math.atan2(SY - EY, SX - EX) });
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 5; ctx.setLineDash([2, 18]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(SX + 170, SY + 170); ctx.quadraticCurveTo(700, 520, EX - 70, EY - 80); ctx.stroke(); ctx.restore();
  const s0 = a + 0.05, s1 = W('bebas', 'detik') + 0.05;
  const u = ease.inOutSine(clamp((t - s0) / (s1 - s0)));
  const q = (u) => { const x0 = SX + 170, y0 = SY + 170, cx = 700, cy = 520, x1 = EX - 70, y1 = EY - 80; return [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1]; };
  const [px, py] = q(u), [qx, qy] = q(Math.min(1, u + 0.01));
  if (u > 0 && u < 1) K.speedLines(ctx, px, py, Math.atan2(qy - py, qx - px), t, { n: 5, len: 160, spread: 24, w: 4 });
  K.photon(ctx, px, py, { r: 36, t, vx: (qx - px) * 60, vy: (qy - py) * 60, heat: 1, mood: u >= 1 ? 'joy' : 'happy', look: [0.6, 0.5] });
  sc();
  const secs = u * 500, mm = String(Math.floor(secs / 60)).padStart(2, '0'), ss = String(Math.floor(secs % 60)).padStart(2, '0');
  const tp = K.pop(t, a + 0.05, 0.4);
  ctx.globalAlpha = 1 - push;
  K.counter(ctx, `${mm}:${ss}`, 330, 900, { size: 150, p: tp, color: u >= 1 ? '#ffe27a' : '#ffffff' });
  K.badge(ctx, 'menit : detik', 330, 1010, { p: tp, size: 32 });
  K.badge(ctx, '±150 juta km', 720, 700, { p: K.pop(t, a + 0.3), size: 38, bg: 'rgba(255,255,255,.16)' });
  K.badge(ctx, 'BUMI', EX, EY + 150, { p: K.pop(t, a + 0.1), size: 36, accent: '#4aa0ff' });
  ctx.globalAlpha = 1;
});

// 8. Back in the bedroom: the photon lands on the cheek; pull back; the title lands.
shot('moral', (t, a, b) => {
  const land = W('moral', 'wajahmu') + 0.1;
  const out = prog(t, land + 0.25, land + 1.4, ease.inOutCubic);
  const zin = lerp(1.25, 1.08, prog(t, a, a + 0.6, ease.outCubic));
  K.cam(ctx, lerp(zin, 0.72, out), lerp(CHEEK[0] - 40, 600, out), lerp(CHEEK[1] - 120, 800, out));
  room(t, { lit: lerp(0.45, 1, prog(t, land - 0.1, land + 0.5)), mood: t < land + 0.1 ? 'calm' : 'joy' });
  beamPhoton(t, a + 0.05, land, { r: 30 });
  if (t > land) K.glow(ctx, CHEEK[0], CHEEK[1], 160, '#ffd77a', 0.45 * clamp((t - land) * 3));
  sc();
  const tt = W('moral', 'lebih') - 0.05;
  K.headline(ctx, 'LEBIH TUA', 540, 250, { size: 112, p: K.pop(t, tt, 0.5), accent: '#ffe27a' });
  K.headline(ctx, 'DARI PERADABAN', 540, 360, { size: 78, p: K.pop(t, W('moral', 'peradaban') - 0.1, 0.5) });
  [['cave', 400], ['wheat', 540], ['pyramid', 680]].forEach(([ic, x], k) => { const p = K.pop(t, W('moral', 'peradaban') + 0.15 + k * 0.12, 0.4); if (p > 0) K.icon(ctx, ic, x, 462, 0.55 * p, t); });
  const fo = prog(t, AM.duration - 0.45, AM.duration, ease.inOutSine);
  if (fo > 0) { ctx.fillStyle = `rgba(6,11,34,${fo * 0.6})`; ctx.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= B[sh.id][0]) s = sh;
  const [a, b] = B[s.id];
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  sc(); ctx.globalAlpha = 1;
  const since = t - Math.max(0, a);
  if (since < 0.14 && ['acak', 'bebas', 'moral'].includes(s.id)) { fx.fillStyle = `rgba(255,246,220,${0.25 * (1 - since / 0.14)})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5, color: '4,6,26' });
}
