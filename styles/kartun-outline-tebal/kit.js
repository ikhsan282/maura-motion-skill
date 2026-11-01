// Maura Motion style kit: KARTUN OUTLINE TEBAL (thick-outline cartoon / sticker cartoon).
// Chunky near-black outlines, saturated flat fills with ONE hard cel shade, bean characters with huge eyes,
// white die-cut sticker borders, rotating sunbursts, squash & stretch with overshoot, smear lines and pop-in stickers.
// Characters are generic objects (battery, camera, chat bubble, game pad, map pin, music note, charger plug) — no logos.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  ink: '#1a1033', white: '#ffffff', cream: '#fff6df',
  yellow: '#ffd23f', orange: '#ff6a2a', red: '#ff3b3b', pink: '#ff5fa2', blue: '#2f5bff', sky: '#41c7ff', green: '#2fd96b', lime: '#b6f03c', purple: '#8b5cff', teal: '#1fc8b0',
};
const LW = 9;
const shadeOf = (hex, k = 0.22) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.round(v * (1 - k))); return `rgb(${f(n >> 16 & 255)},${f(n >> 8 & 255)},${f(n & 255)})`; };
export { shadeOf };

// The shade trick above needs an even-odd "rect minus shifted shape"; implement it explicitly:
function shadeInside(g, path, col, dx, dy) {
  g.save(); g.clip(path);
  const p = new Path2D(); p.rect(-5000, -5000, 10000, 10000);
  const m = new DOMMatrix().translate(-dx, -dy); p.addPath(path, m);
  g.fillStyle = col; g.fill(p, 'evenodd');
  g.restore();
}
/** Clean version used everywhere: border, outline, fill, shade on the lower-right. */
export function cel(g, path, col, { lw = LW, border = 14, shade = 1, dx = 16, dy = 12, shadeCol = null, hi = true } = {}) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (border > 0) { g.lineWidth = lw * 2 + border * 2; g.strokeStyle = PAL.white; g.stroke(path); }
  g.lineWidth = lw * 2; g.strokeStyle = PAL.ink; g.stroke(path);
  g.fillStyle = col; g.fill(path);
  if (shade) shadeInside(g, path, shadeCol || shadeOf(col), dx * shade, dy * shade);
}
const P = () => new Path2D();
const ell = (x, y, rx, ry, r = 0) => { const p = P(); p.ellipse(x, y, rx, ry, r, 0, TAU); return p; };
const rr = (x, y, w, h, r) => { const p = P(); p.roundRect(x, y, w, h, r); return p; };

/** Big cartoon eyes. look [-1..1], blink 0..1, mood: 'normal'|'tired'|'angry'|'x'|'happy'|'star'|'worried' */
export function eyes(g, x, y, s = 1, { look = [0, 0], blink = 0, mood = 'normal', gap = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  for (const sd of [-1, 1]) {
    const ex = sd * 34 * gap;
    if (mood === 'x') { g.strokeStyle = PAL.ink; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - 16, -16); g.lineTo(ex + 16, 16); g.moveTo(ex + 16, -16); g.lineTo(ex - 16, 16); g.stroke(); continue; }
    if (mood === 'happy' || blink > 0.85) { g.strokeStyle = PAL.ink; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); if (mood === 'happy') g.arc(ex, 6, 18, Math.PI * 1.1, Math.PI * 1.9); else { g.moveTo(ex - 18, 2); g.lineTo(ex + 18, 2); } g.stroke(); continue; }
    const open = clamp(1 - blink) * (mood === 'tired' ? 0.55 : 1);
    const e = ell(ex, 0, 27, 34 * open);
    g.lineWidth = 7; g.strokeStyle = PAL.ink; g.fillStyle = PAL.white; g.fill(e); g.stroke(e);
    g.save(); g.clip(e);
    const px = ex + look[0] * 10, py = look[1] * 10 + (mood === 'tired' ? 8 : 4);
    g.fillStyle = PAL.ink; g.beginPath(); g.ellipse(px, py, 15, 19, 0, 0, TAU); g.fill();
    if (mood === 'star') { g.fillStyle = PAL.yellow; star(g, px, py, 13, 6); }
    g.fillStyle = PAL.white; g.beginPath(); g.arc(px - 5, py - 8, 6, 0, TAU); g.fill(); g.beginPath(); g.arc(px + 6, py + 7, 3, 0, TAU); g.fill();
    if (mood === 'tired') { g.fillStyle = 'rgba(26,16,51,0.25)'; g.fillRect(ex - 30, -40, 60, 30); }
    g.restore();
    if (mood === 'tired') { g.strokeStyle = PAL.ink; g.lineWidth = 8; g.beginPath(); g.moveTo(ex - 28, -14 * open - 2); g.lineTo(ex + 28, -14 * open - 2); g.stroke(); }
    if (mood === 'angry') { g.strokeStyle = PAL.ink; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - sd * 26, -46); g.lineTo(ex + sd * 20, -30); g.stroke(); }
    if (mood === 'worried') { g.strokeStyle = PAL.ink; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - sd * 22, -42); g.lineTo(ex + sd * 22, -52); g.stroke(); }
  }
  g.restore();
}
export function star(g, x, y, r, n = 5, rot = -Math.PI / 2) {
  g.beginPath(); for (let i = 0; i <= n * 2; i++) { const a = rot + i / (n * 2) * TAU, R = i % 2 ? r * 0.45 : r; i ? g.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R) : g.moveTo(x + Math.cos(a) * R, y + Math.sin(a) * R); } g.closePath(); g.fill();
}
/** Mouth: open 0..1, smile -1..1, teeth/tongue. */
export function mouth(g, x, y, s = 1, { open = 0, smile = 0.5, wobble = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = PAL.ink; g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round';
  if (open > 0.08) {
    const w = 30 + open * 6, h = 10 + open * 40;
    const m = P(); m.moveTo(-w, -smile * 6); m.quadraticCurveTo(0, smile * 10 - 4, w, -smile * 6);
    m.quadraticCurveTo(w * 0.8, h, 0, h + wobble); m.quadraticCurveTo(-w * 0.8, h, -w, -smile * 6); m.closePath();
    g.fillStyle = '#5a1030'; g.fill(m);
    g.save(); g.clip(m); g.fillStyle = '#ff6f8e'; g.beginPath(); g.ellipse(0, h + 6, w * 0.6, h * 0.45, 0, 0, TAU); g.fill(); g.fillStyle = PAL.white; g.fillRect(-w * 0.6, -14, w * 1.2, 12); g.restore();
    g.stroke(m);
  } else { g.beginPath(); g.moveTo(-26, -smile * 10); g.quadraticCurveTo(0, smile * 22, 26, -smile * 10); g.stroke(); }
  g.restore();
}
/** Thick noodle limb with a mitten hand. */
export function limb(g, x0, y0, x1, y1, { bow = 0, w = 16, hand = true, col = PAL.ink, handCol = PAL.white, foot = false } = {}) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0) || 1;
  const nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
  g.lineCap = 'round'; g.strokeStyle = PAL.ink; g.lineWidth = w;
  g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx + nx * bow, my + ny * bow, x1, y1); g.stroke();
  if (hand) {
    const a = Math.atan2(y1 - (my + ny * bow), x1 - (mx + nx * bow));
    const h = foot ? ell(x1 + 12, y1 + 4, 30, 16) : ell(x1 + Math.cos(a) * 10, y1 + Math.sin(a) * 10, 22, 22);
    g.lineWidth = 7; g.fillStyle = handCol; g.fill(h); g.stroke(h);
  }
}

// ---------------------------------------------------------------- characters
// All characters: local origin at feet centre, ~520 tall at s=1, face drawn on the body ("bean" objects).
/**
 * Generic character. kind: 'baterai'|'kamera'|'chat'|'game'|'peta'|'musik'|'charger'.
 * o: { t, look, blink, mood, open (mouth), smile, sq (squash +flat/-tall), lean, hop (px up), armL:[x,y], armR:[x,y], walk, level (battery 0..1), flash, cape, badge }
 */
export function char(ctx, kind, x, y, s, o = {}) {
  const { t = 0, sq = 0, lean = 0, hop = 0, face = 1, level = 0.02 } = o;
  const breathe = Math.sin(t * 3 + x * 0.01) * 0.025;
  const SX = 1 + sq + breathe, SY = 1 - sq - breathe;
  ctx.save(); ctx.translate(x, y - hop); ctx.scale(s * face, s);
  // shadow on the ground
  ctx.save(); ctx.translate(0, hop / s); ctx.fillStyle = 'rgba(26,16,51,0.22)'; ctx.beginPath(); ctx.ellipse(0, 0, 130 * (1 - Math.min(0.5, hop / 600)), 22, 0, 0, TAU); ctx.fill(); ctx.restore();
  // legs
  const walk = o.walk ?? -1;
  for (const sd of [-1, 1]) {
    const ph = walk >= 0 ? Math.sin(walk * TAU + (sd > 0 ? 0 : Math.PI)) : 0;
    limb(ctx, sd * 40, -110, sd * 48 + ph * 40, -14 - Math.max(0, ph) * 20, { bow: -sd * 8, w: 18, foot: true, handCol: PAL.ink });
  }
  ctx.save(); ctx.translate(0, -110); ctx.rotate(lean); ctx.scale(SX, SY);
  const body = BODIES[kind](ctx, o, t, level);
  // arms
  const [ax, ay] = body.arm;
  for (const [sd, key] of [[-1, 'armL'], [1, 'armR']]) {
    const tg = o[key] || [sd * (ax + 70), ay + 90 + Math.sin(t * 4 + sd) * 8];
    limb(ctx, sd * ax, ay, tg[0], tg[1], { bow: sd * 20, w: 16 });
  }
  // face
  const [fx, fy, fs] = body.face;
  eyes(ctx, fx, fy, fs, { look: o.look || [0, 0], blink: o.blink || 0, mood: o.mood || 'normal' });
  mouth(ctx, fx, fy + 70 * fs, fs * 0.9, { open: o.open || 0, smile: o.smile ?? 0.5 });
  if (o.sweat) for (let i = 0; i < 2; i++) { const k = (t * 1.5 + i * 0.5) % 1; ctx.fillStyle = PAL.sky; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; const d = P(); const sx = -body.w * 0.55 - i * 30, sy = fy - 60 + k * 90; d.moveTo(sx, sy - 22); d.quadraticCurveTo(sx + 16, sy + 4, sx, sy + 10); d.quadraticCurveTo(sx - 16, sy + 4, sx, sy - 22); ctx.globalAlpha = 1 - k; ctx.fill(d); ctx.stroke(d); ctx.globalAlpha = 1; }
  ctx.restore();
  ctx.restore();
}
const BODIES = {
  baterai(g, o, t, level) {
    const w = 230, h = 340;
    const nub = rr(-40, -h - 30, 80, 44, 12); cel(g, nub, '#c9c3d9', { border: 14 });
    const b = rr(-w / 2, -h, w, h, 46); cel(g, b, '#eeeaf6', { border: 16, dx: 18, dy: 0 });
    // level fill
    const inner = rr(-w / 2 + 22, -h + 22, w - 44, h - 44, 28);
    g.save(); g.clip(inner);
    g.fillStyle = 'rgba(26,16,51,0.12)'; g.fillRect(-w, -h, w * 2, h);
    const lv = clamp(level), col = lv < 0.15 ? PAL.red : lv < 0.4 ? PAL.yellow : PAL.green;
    const top = -22 - (h - 44) * Math.max(0.03, lv);
    g.fillStyle = col; g.beginPath(); g.moveTo(-w, 0);
    for (let x = -w / 2; x <= w / 2; x += 10) g.lineTo(x, top + Math.sin(x * 0.06 + t * 6) * 5 * (lv > 0.05 ? 1 : 0.3));
    g.lineTo(w, 0); g.fill();
    g.fillStyle = shadeOf(col, 0.2); g.fillRect(w / 2 - 50, top, 40, h);
    g.restore();
    g.lineWidth = 7; g.strokeStyle = PAL.ink; g.stroke(inner);
    return { arm: [w / 2 - 6, -h * 0.45], face: [0, -h * 0.62, 0.95], w };
  },
  kamera(g, o, t) {
    const w = 300, h = 320;
    const bump = rr(-70, -h - 40, 120, 60, 16); cel(g, bump, PAL.orange);
    const fl = rr(70, -h - 26, 56, 34, 8); cel(g, fl, o.flash ? '#fffbe0' : PAL.cream, { shade: 0 });
    const b = rr(-w / 2, -h, w, h, 44); cel(g, b, PAL.orange);
    g.fillStyle = shadeOf(PAL.orange, 0.35); g.fillRect(-w / 2 + 10, -126, w - 20, 26);
    const lens = ell(0, -110, 76, 76); cel(g, lens, '#3b3f63', { border: 0 });
    const glass = ell(0, -110, 50, 50); g.fillStyle = PAL.blue; g.fill(glass); g.lineWidth = 7; g.strokeStyle = PAL.ink; g.stroke(glass);
    g.fillStyle = PAL.white; g.beginPath(); g.arc(-18, -130, 12, 0, TAU); g.fill();
    if (o.flash) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,250,200,${o.flash})`; g.beginPath(); g.arc(98, -h - 10, 120 * o.flash, 0, TAU); g.fill(); g.restore(); }
    return { arm: [w / 2 - 8, -h * 0.4], face: [0, -258, 0.62], w };
  },
  chat(g, o, t) {
    const b = P(); b.roundRect(-150, -300, 300, 250, 110); b.moveTo(-90, -70); b.lineTo(-140, 0); b.lineTo(-30, -60);
    cel(g, b, PAL.green);
    for (let i = 0; i < 3; i++) { g.fillStyle = PAL.white; g.beginPath(); g.arc(-50 + i * 50, -110, 13 + Math.max(0, Math.sin(t * 8 - i)) * 4, 0, TAU); g.fill(); }
    if (o.badge) { const bd = ell(130, -300, 70, 56); cel(g, bd, PAL.red, { border: 10 }); g.save(); g.translate(130, -294); g.scale(o.face || 1, 1); g.fillStyle = PAL.white; g.font = "400 60px 'Luckiest Guy'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(o.badge), 0, 0); g.restore(); }
    return { arm: [140, -170], face: [0, -210, 0.85], w: 300 };
  },
  game(g, o, t) {
    const b = P(); b.moveTo(-170, -230); b.bezierCurveTo(-90, -270, 90, -270, 170, -230); b.bezierCurveTo(230, -200, 240, -40, 190, -20); b.bezierCurveTo(140, 0, 110, -80, 60, -90); b.lineTo(-60, -90); b.bezierCurveTo(-110, -80, -140, 0, -190, -20); b.bezierCurveTo(-240, -40, -230, -200, -170, -230); b.closePath();
    cel(g, b, PAL.purple);
    g.fillStyle = PAL.ink; g.fillRect(-170, -175, 70, 22); g.fillRect(-146, -199, 22, 70);
    const cols = [PAL.yellow, PAL.pink, PAL.sky, PAL.lime];
    [[130, -200], [160, -170], [130, -140], [100, -170]].forEach(([bx, by], i) => { const c = ell(bx, by, 15, 15); g.fillStyle = cols[i]; g.fill(c); g.lineWidth = 5; g.strokeStyle = PAL.ink; g.stroke(c); });
    return { arm: [190, -150], face: [0, -170, 0.75], w: 380 };
  },
  peta(g, o, t) {
    const b = P(); b.moveTo(0, -20); b.bezierCurveTo(-60, -110, -150, -190, -150, -290); b.arc(0, -290, 150, Math.PI, 0); b.bezierCurveTo(150, -190, 60, -110, 0, -20); b.closePath();
    cel(g, b, PAL.red);
    return { arm: [130, -230], face: [0, -300, 0.85], w: 300 };
  },
  musik(g, o, t) {
    const st = rr(40, -420, 34, 330, 12); cel(g, st, PAL.pink, { border: 12 });
    const fl = P(); fl.moveTo(60, -420); fl.bezierCurveTo(140, -400, 180, -340, 150, -280); fl.bezierCurveTo(150, -330, 110, -350, 60, -350); fl.closePath(); cel(g, fl, PAL.pink, { border: 12 });
    const hd = ell(-10, -110, 110, 90, -0.3); cel(g, hd, PAL.pink);
    return { arm: [90, -150], face: [-14, -130, 0.75], w: 220 };
  },
  charger(g, o, t) {
    // cape
    if (o.cape !== false) { const fl = Math.sin(t * 12) * 30; const c = P(); c.moveTo(-90, -320); c.quadraticCurveTo(-260, -200 + fl, -300 + fl, -20); c.lineTo(-120, -60 - fl * 0.5); c.quadraticCurveTo(-60, -200, -60, -300); c.closePath(); cel(g, c, PAL.red); }
    for (const sd of [-1, 1]) { const pr = rr(sd * 46 - 14, -400, 28, 80, 8); cel(g, pr, '#d8d2e8', { border: 10 }); }
    const b = rr(-120, -330, 240, 260, 60); cel(g, b, PAL.white, { shadeCol: '#cfc8e6' });
    const bolt = P(); bolt.moveTo(20, -300); bolt.lineTo(-40, -190); bolt.lineTo(4, -190); bolt.lineTo(-20, -100); bolt.lineTo(50, -220); bolt.lineTo(6, -220); bolt.closePath();
    g.fillStyle = PAL.yellow; g.fill(bolt); g.lineWidth = 6; g.strokeStyle = PAL.ink; g.stroke(bolt);
    // mask
    const m = rr(-104, -280, 208, 56, 28); g.fillStyle = PAL.blue; g.fill(m); g.stroke(m);
    return { arm: [116, -200], face: [0, -250, 0.75], w: 240 };
  },
};

// ---------------------------------------------------------------- backgrounds & fx
/** Rotating sunburst (two-tone wedges) filling the frame. */
export function sunburst(ctx, t, { x = 540, y = 900, c1 = PAL.yellow, c2 = PAL.orange, n = 18, speed = 0.15, rot = 0 } = {}) {
  ctx.save(); ctx.fillStyle = c1; ctx.fillRect(-500, -500, 2100, 2900);
  ctx.translate(x, y); ctx.rotate(t * speed + rot); ctx.fillStyle = c2;
  ctx.beginPath(); for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = a0 + TAU / n / 2; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a0) * 2600, Math.sin(a0) * 2600); ctx.lineTo(Math.cos(a1) * 2600, Math.sin(a1) * 2600); ctx.closePath(); } ctx.fill();
  ctx.restore();
}
/** Halftone dot field (cached tile) laid over a background. */
export function dots(ctx, { col = 'rgba(26,16,51,0.12)', step = 28, r = 6, y0 = 0, h = 1920 } = {}) {
  const tile = cached('ot-dots:' + col + step + r, () => { const c = makeCanvas(step * 8, step * 8), g = c.getContext('2d'); g.fillStyle = col; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.beginPath(); g.arc(i * step + (j % 2) * step / 2, j * step, r, 0, TAU); g.fill(); } return c; });
  ctx.save(); ctx.fillStyle = ctx.createPattern(tile, 'repeat'); ctx.fillRect(-400, y0 - 400, 1900, h + 800); ctx.restore();
}
/** The phone's desk/floor strip under the characters. */
export function floor(ctx, y = 1340, col = '#5b3fd6') {
  ctx.save(); ctx.fillStyle = col; ctx.fillRect(-500, y, 2100, 1200);
  ctx.fillStyle = shadeOf(col, 0.25); ctx.fillRect(-500, y, 2100, 22);
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-500, y); ctx.lineTo(1600, y); ctx.stroke();
  ctx.restore();
}
/** Die-cut text sticker: tilted, white border, drop shadow, slaps in with overshoot (k 0..1). */
export function textSticker(ctx, text, x, y, { size = 110, col = PAL.yellow, txt = PAL.ink, rot = -0.06, k = 1, font = 'Luckiest Guy', pad = 34, sway = 0, t = 0, sub = null, icon = null } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + Math.sin(t * 2) * 0.02 * sway);
  const sc = k < 1 ? ease.outBack(clamp(k), 2.4) * (1 + (1 - k) * 0.6) : 1; ctx.scale(sc, sc);
  ctx.font = `400 ${size}px '${font}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + pad * 2 + (icon ? size : 0), h = size * 1.15 + pad + (sub ? size * 0.45 : 0);
  const p = rr(-w / 2, -h / 2, w, h, 26);
  ctx.save(); ctx.translate(12, 14); ctx.fillStyle = 'rgba(26,16,51,0.35)'; ctx.fill(p); ctx.restore();
  cel(ctx, p, col, { lw: 7, border: 16, shade: 0 });
  const tx = icon ? size * 0.5 : 0;
  if (icon) icon(ctx, -w / 2 + pad + size * 0.45, sub ? -size * 0.2 : 0, size * 0.8);
  ctx.fillStyle = txt; ctx.fillText(text, tx, sub ? -size * 0.2 : 6);
  if (sub) { ctx.font = `400 ${size * 0.38}px '${font}'`; ctx.fillText(sub, tx, size * 0.5); }
  ctx.restore();
}
/** Comic burst behind a word (KLIK!, POW!). */
export function burst(ctx, text, x, y, { size = 120, k = 1, col = PAL.yellow, txt = PAL.red, rot = -0.12, t = 0 } = {}) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); const sc = ease.outBack(clamp(k), 3); ctx.scale(sc, sc);
  const f = Math.floor(t * 12);
  const b = P(); const n = 12;
  for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * TAU, r = (i % 2 ? 0.6 : 1) * size * 1.7 * (1 + (hrand(i, f) - 0.5) * 0.1); i ? b.lineTo(Math.cos(a) * r * 1.3, Math.sin(a) * r) : b.moveTo(Math.cos(a) * r * 1.3, Math.sin(a) * r); }
  b.closePath(); cel(ctx, b, col, { border: 16, shade: 0 });
  ctx.font = `400 ${size}px 'Luckiest Guy'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 12; ctx.strokeStyle = PAL.ink; ctx.strokeText(text, 0, 8); ctx.fillStyle = txt; ctx.fillText(text, 0, 8);
  ctx.restore();
}
/** Cartoon fight cloud with limbs and stars poking out. */
export function fightCloud(ctx, x, y, t, s = 1) {
  ctx.save(); ctx.translate(x + Math.sin(t * 30) * 8, y + Math.cos(t * 27) * 8); ctx.scale(s, s);
  const f = Math.floor(t * 12);
  for (let i = 0; i < 6; i++) { const a = hrand(i, f) * TAU; ctx.save(); ctx.rotate(a); limb(ctx, 0, 0, 260, 0, { w: 18 }); ctx.restore(); }
  const c = P(); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; c.ellipse(Math.cos(a) * 150, Math.sin(a) * 110, 100 + hrand(i, f) * 30, 90, 0, 0, TAU); }
  c.ellipse(0, 0, 170, 130, 0, 0, TAU);
  cel(ctx, c, PAL.white, { shadeCol: '#ddd6f0' });
  ctx.fillStyle = PAL.yellow; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5;
  for (let i = 0; i < 4; i++) { const a = hrand(i, f, 3) * TAU; ctx.save(); star(ctx, Math.cos(a) * 220, Math.sin(a) * 170, 30, 5, f * 0.3); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
/** Speed/smear lines. */
export function speed(ctx, x, y, len, { dir = -1, n = 6, h = 260, t = 0, col = PAL.ink } = {}) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) { const yy = y - h / 2 + (i + 0.5) * h / n, L = len * (0.5 + hrand(i, Math.floor(t * 12)) * 0.5); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x - dir * L, yy); ctx.stroke(); }
  ctx.restore();
}
/** Lightning bolt (charging arc) from a to b. */
export function zap(ctx, x0, y0, x1, y1, t, { w = 14, col = PAL.yellow } = {}) {
  const f = Math.floor(t * 24);
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([lerp(x0, x1, u) + (i % 8 ? (hrand(i, f) - 0.5) * 60 : 0), lerp(y0, y1, u) + (i % 8 ? (hrand(i, f, 2) - 0.5) * 60 : 0)]); }
  for (const [lw, c] of [[w + 12, PAL.ink], [w, col]]) { ctx.lineWidth = lw; ctx.strokeStyle = c; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
  ctx.restore();
}
/** Battery percentage readout (big outlined number). */
export function percent(ctx, value, x, y, { size = 220, col = PAL.red, k = 1, rot = -0.05, t = 0 } = {}) {
  textSticker(ctx, `${Math.round(value)}%`, x, y, { size, col: PAL.white, txt: col, k, rot, t, sway: 1 });
}
/** Simple icons for tip stickers. */
export const ICONS = {
  sun: (g, x, y, s) => { g.save(); g.translate(x, y); g.fillStyle = PAL.yellow; g.strokeStyle = PAL.ink; g.lineWidth = 6; for (let i = 0; i < 8; i++) { g.save(); g.rotate(i / 8 * TAU); g.fillRect(-5, -s * 0.5, 10, s * 0.18); g.restore(); } g.beginPath(); g.arc(0, 0, s * 0.26, 0, TAU); g.fill(); g.stroke(); g.restore(); },
  leaf: (g, x, y, s) => { g.save(); g.translate(x, y); g.rotate(-0.6); g.fillStyle = PAL.green; g.strokeStyle = PAL.ink; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, s * 0.42, s * 0.22, 0, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-s * 0.4, 0); g.lineTo(s * 0.4, 0); g.stroke(); g.restore(); },
};
export { clamp, lerp, ease, hrand, TAU };
