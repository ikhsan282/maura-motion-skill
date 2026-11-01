// AniMasters style kit: ONE-SHAPE UI MORPH.
// Warm light-grey stage, ONE black rounded shape that never cuts: it morphs (size, radius, position, colour) on
// closed-form springs into every UI state, content swaps roll in/out, a macOS-like pointer drives it, and the soft
// layered shadow grows with elevation. No gradients on chrome, no glows, no particles: precision is the look.
import { clamp, lerp, ease, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = { bg: '#ECEAE6', bg2: '#E3E1DC', ink: '#0E0E10', ink2: '#6B6A66', ink3: '#A3A19C', white: '#FFFFFF', accent: '#FF5A1F', soft: '#F6F5F2' };
export const FONT = { sans: 'Inter', mono: 'JetBrains Mono' };

// ---------------------------------------------------------------- springs
export function spring(t, { z = 0.72, ts = 0.35 } = {}) {
  if (t <= 0) return 0;
  const w = 4 / (Math.max(0.05, z) * ts);
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
/** Value that springs through targets: keys = [[t, v], ...] (sum of step responses: no carried state). */
export function springKeys(t, keys, o) {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], o);
  return v;
}
export const sp = (t, t0, ts = 0.35, z = 0.72) => spring(t - t0, { z, ts });
export const mix = (a, b, u) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), k = clamp(u);
  const r = lerp((A >> 16) & 255, (B >> 16) & 255, k), g = lerp((A >> 8) & 255, (B >> 8) & 255, k), bl = lerp(A & 255, B & 255, k);
  return `rgb(${r | 0},${g | 0},${bl | 0})`;
};

// ---------------------------------------------------------------- the shape
/** Shape at time t from keyed states: states = [[t, {x, y, w, h, r, elev, color}], ...].
 *  Left and right edges ride different springs (the leading edge moves first: liquid stretch). */
export function shapeAt(t, states, { z = 0.72, ts = 0.35, lag = 1.35 } = {}) {
  const K = (f) => states.map(([tt, s]) => [tt, f(s)]);
  const dirX = (i) => Math.sign(states[i][1].x - states[i - 1][1].x);
  // leading edge = fast spring, trailing edge = slower spring, per transition
  let L = states[0][1].x - states[0][1].w / 2, R = states[0][1].x + states[0][1].w / 2;
  for (let i = 1; i < states.length; i++) {
    const a = states[i - 1][1], b = states[i][1], d = t - states[i][0], dir = dirX(i) || Math.sign(b.w - a.w);
    const fast = spring(d, { z, ts }), slow = spring(d, { z, ts: ts * lag });
    L += ((b.x - b.w / 2) - (a.x - a.w / 2)) * (dir < 0 ? fast : slow);
    R += ((b.x + b.w / 2) - (a.x + a.w / 2)) * (dir > 0 ? fast : slow);
  }
  const y = springKeys(t, K((s) => s.y), { z, ts }), h = springKeys(t, K((s) => s.h), { z, ts: ts * 1.1 });
  const r = springKeys(t, K((s) => s.r ?? Math.min(s.w, s.h) / 2), { z: 0.9, ts });
  const elev = springKeys(t, K((s) => s.elev ?? 1), { z: 1, ts: ts * 1.4 });
  let color = states[0][1].color || PAL.ink;
  for (let i = 1; i < states.length; i++) { const c = states[i][1].color || PAL.ink; if (c !== (states[i - 1][1].color || PAL.ink)) color = mix(color.startsWith('#') ? color : rgbToHex(color), c, spring(t - states[i][0], { z: 1, ts: 0.3 })); }
  const w = Math.max(2, R - L);
  return { x: (L + R) / 2, y, w, h: Math.max(2, h), r: Math.max(0, Math.min(r, w / 2, h / 2)), elev, color };
}
function rgbToHex(c) { const m = c.match(/\d+/g).map(Number); return '#' + m.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join(''); }
/** Index of the active state at t (last key whose time <= t). */
export const stateIndex = (t, states) => { let k = 0; states.forEach(([tt], i) => { if (t >= tt) k = i; }); return k; };

// ---------------------------------------------------------------- stage & shadows
export function stage(ctx, t) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const base = cached('um-bg', () => {
    const c = makeCanvas(108, 192), g = c.getContext('2d');
    g.fillStyle = PAL.bg; g.fillRect(0, 0, 108, 192);
    const gr = g.createRadialGradient(54, 80, 0, 54, 80, 130); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 108, 192); return c;
  });
  ctx.drawImage(base, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
}
function shSprite(r, blur, a) {
  return cached(`um-sh:${r}:${blur}:${a}`, () => {
    const pad = Math.ceil(blur * 1.6) + 2, inner = 2 * r + 2, S = inner + 2 * pad, c = makeCanvas(S, S), g = c.getContext('2d');
    g.shadowColor = `rgba(20,18,14,${a})`; g.shadowBlur = blur; g.shadowOffsetX = 4000; g.fillStyle = '#000';
    roundRect(g, pad - 4000, pad, inner, inner, r); g.fill(); c.pad = pad; c.r = r; return c;
  });
}
function nine(ctx, sp, x, y, w, h) {
  const c = sp.r + sp.pad, S = sp.width, mid = S - 2 * c;
  const X = [x - sp.pad, x - sp.pad + c, x + w + sp.pad - c], Y = [y - sp.pad, y - sp.pad + c, y + h + sp.pad - c];
  const WW = [c, Math.max(0, w + 2 * sp.pad - 2 * c), c], HH = [c, Math.max(0, h + 2 * sp.pad - 2 * c), c];
  const SX = [0, c, c + mid], SW = [c, mid, c];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) if (WW[i] > 0 && HH[j] > 0) ctx.drawImage(sp, SX[i], SX[j], SW[i], SW[j], X[i], Y[j], WW[i] + (i < 2 ? 0.5 : 0), HH[j] + (j < 2 ? 0.5 : 0));
}
const RB = [8, 14, 22, 32, 44, 60, 80, 110, 150];
const qr = (r) => RB.reduce((a, b) => (Math.abs(b - r) < Math.abs(a - r) ? b : a));
/** Two-layer soft shadow that grows with elevation (contact + ambient). */
export function shadow(ctx, x, y, w, h, r, elev = 1) {
  const R = qr(Math.min(r, w / 2, h / 2));
  ctx.save();
  ctx.globalAlpha = clamp(1.1 - elev * 0.35, 0.35, 1); nine(ctx, shSprite(R, 10, 0.22), x + 2, y + 3 + elev * 2, w - 4, h);
  ctx.globalAlpha = clamp(0.4 + elev * 0.45, 0, 1); const off = 10 + elev * 26; nine(ctx, shSprite(R, 56, 0.2), x + w * 0.04, y + off, w * 0.92, h);
  ctx.restore();
}
/** Draw the shape (shadow + body). Returns the shape for content placement. */
export function body(ctx, s, { press = 0 } = {}) {
  const k = 1 - 0.04 * press;
  const w = s.w * k, h = s.h * k, x = s.x - w / 2, y = s.y - h / 2, r = s.r * k;
  shadow(ctx, x, y, w, h, r, s.elev * (1 - press * 0.5));
  roundRect(ctx, x, y, w, h, r); ctx.fillStyle = s.color; ctx.fill();
  return { x, y, w, h, r };
}

// ---------------------------------------------------------------- content swaps
/** Content envelope: rolls in (from below) after `a`, rolls out (upwards) before `b`. Returns {a, dy}. */
export function swap(t, a, b, { inDur = 0.22, outDur = 0.16, roll = 26 } = {}) {
  const i = ease.outCubic(clamp((t - a) / inDur)), o = ease.inCubic(clamp((t - (b - outDur)) / outDur));
  return { a: Math.min(i, 1 - o), dy: (1 - i) * roll - o * roll };
}
export function label(ctx, str, x, y, { size = 40, weight = 700, color = PAL.white, align = 'center', font = FONT.sans, alpha = 1, spacing = null } = {}) {
  if (alpha <= 0) return 0;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${weight} ${size}px '${font}'`;
  ctx.letterSpacing = (spacing ?? -size * 0.025) + 'px'; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  ctx.fillText(str, x, y); const w = ctx.measureText(str).width; ctx.restore(); return w;
}
/** Rolling digits (odometer): value v (float) shown with `digits` places; each digit rolls vertically. */
export function odometer(ctx, v, x, y, { size = 120, color = PAL.white, digits = 2, font = FONT.sans, align = 'center' } = {}) {
  ctx.save(); ctx.font = `700 ${size}px '${font}'`; ctx.letterSpacing = '0px'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillStyle = color;
  const cw = ctx.measureText('0').width * 1.02, W = cw * digits; let x0 = align === 'center' ? x - W / 2 : x;
  ctx.beginPath(); ctx.rect(x0 - 4, y - size * 0.62, W + 8, size * 1.24); ctx.clip();
  for (let d = 0; d < digits; d++) {
    const p = Math.pow(10, digits - 1 - d), cur = Math.floor(v / p) % 10;
    const f = v - Math.floor(v), rolling = (v % p) >= p - 1 ? f : 0, e = ease.inOutCubic(clamp(rolling));
    const cx = x0 + cw * (d + 0.5), step = size * 1.1;
    ctx.fillText(String(cur), cx, y - e * step);
    if (e > 0) ctx.fillText(String((cur + 1) % 10), cx, y + step - e * step);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- glyphs (white line icons)
export const G = {
  spinner(ctx, x, y, r, t, color = PAL.white, lw = 8) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
    const a = t * 7, len = 1.2 + Math.sin(t * 5) * 0.8;
    ctx.beginPath(); ctx.arc(x, y, r, a, a + len + 0.6); ctx.stroke(); ctx.restore();
  },
  check(ctx, x, y, s, p = 1, color = PAL.white, lw = 10) {
    const L1 = Math.hypot(0.25, 0.25), L2 = Math.hypot(0.45, 0.55), L = (L1 + L2) * clamp(p);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = color; ctx.lineWidth = lw / s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-0.32, 0.02);
    if (L <= L1) ctx.lineTo(-0.32 + 0.25 * L / L1, 0.02 + 0.25 * L / L1);
    else { ctx.lineTo(-0.07, 0.27); const u = (L - L1) / L2; ctx.lineTo(-0.07 + 0.45 * u, 0.27 - 0.55 * u); }
    ctx.stroke(); ctx.restore();
  },
  bell(ctx, x, y, s, swing = 0, color = PAL.white) {
    ctx.save(); ctx.translate(x, y - s * 0.45); ctx.rotate(swing); ctx.translate(0, s * 0.45); ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(-s * 0.42, s * 0.28); ctx.quadraticCurveTo(-s * 0.36, s * 0.18, -s * 0.34, -s * 0.05);
    ctx.bezierCurveTo(-s * 0.32, -s * 0.42, s * 0.32, -s * 0.42, s * 0.34, -s * 0.05); ctx.quadraticCurveTo(s * 0.36, s * 0.18, s * 0.42, s * 0.28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -s * 0.38, s * 0.07, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(swing * s * 0.4, s * 0.38, s * 0.1, 0, TAU); ctx.fill(); ctx.restore();
  },
  star(ctx, x, y, r, fill = 1, color = PAL.accent, empty = 'rgba(255,255,255,0.22)') {
    const path = () => { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); };
    ctx.save(); path(); ctx.fillStyle = empty; ctx.fill();
    if (fill > 0) { const s = 0.4 + 0.6 * fill + 0.15 * Math.sin(clamp(fill) * Math.PI); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); path(); ctx.fillStyle = color; ctx.fill(); }
    ctx.restore();
  },
  pinHole(ctx, x, y, r, color = PAL.white) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); },
  bag(ctx, x, y, s, color = PAL.white) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.09; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    roundRect(ctx, x - s * 0.4, y - s * 0.2, s * 0.8, s * 0.65, s * 0.08); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.2, Math.PI, 0); ctx.stroke(); ctx.restore();
  },
};

// ---------------------------------------------------------------- pointer
function ptrSprite() {
  return cached('um-ptr', () => {
    const c = makeCanvas(120, 150), g = c.getContext('2d');
    const path = () => { g.beginPath(); g.moveTo(20, 14); g.lineTo(20, 104); g.lineTo(42, 84); g.lineTo(56, 116); g.lineTo(72, 109); g.lineTo(58, 78); g.lineTo(88, 78); g.closePath(); };
    g.shadowColor = 'rgba(0,0,0,0.25)'; g.shadowBlur = 12; g.shadowOffsetY = 5; path(); g.fillStyle = '#fff'; g.fill();
    g.shadowColor = 'transparent'; g.lineJoin = 'round'; g.lineWidth = 8; g.strokeStyle = '#fff'; path(); g.stroke();
    g.save(); g.translate(20, 14); g.scale(0.8, 0.8); g.translate(-20, -14); path(); g.fillStyle = PAL.ink; g.fill(); g.restore();
    return c;
  });
}
/** macOS-like pointer, tip at x,y. press 0..1. */
export function pointer(ctx, x, y, { press = 0, alpha = 1, scale = 1 } = {}) {
  if (alpha <= 0) return;
  const s = scale * (1 - 0.12 * press);
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s, s); ctx.drawImage(ptrSprite(), -20, -14); ctx.restore();
}
/** Pointer glide keyed [[t,x,y]] + clicks [t] -> {x,y,press}. */
export function pointerAt(t, keys, clicks = [], o = { z: 0.95, ts: 0.5 }) {
  const x = springKeys(t, keys.map((k) => [k[0], k[1]]), o), y = springKeys(t, keys.map((k) => [k[0], k[2]]), o);
  let press = 0;
  for (const c of clicks) { const d = t - c; if (d > -0.08 && d < 0.2) press = Math.max(press, d < 0 ? 1 + d / 0.08 : 1 - d / 0.2); }
  return { x, y, press: clamp(press) };
}
/** Click ring (thin, ink). */
export function ring(ctx, x, y, age, { r = 90, color = PAL.ink, dur = 0.5, lw = 3 } = {}) {
  if (age < 0 || age > dur) return;
  const p = ease.outCubic(age / dur);
  ctx.save(); ctx.globalAlpha *= (1 - p) * 0.6; ctx.strokeStyle = color; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.arc(x, y, r * (0.5 + p), 0, TAU); ctx.stroke(); ctx.restore();
}
/** Small grey step counter ("03 / 08  Kurir") that rolls when the step changes. */
export function stepper(ctx, t, steps, x, y) {
  let k = 0; steps.forEach(([tt], i) => { if (t >= tt) k = i; });
  const [t0, name] = steps[k], p = ease.outCubic(clamp((t - t0) / 0.25));
  label(ctx, String(k + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0'), x, y, { size: 26, weight: 400, color: PAL.ink3, font: FONT.mono, align: 'left', spacing: 1 });
  ctx.save(); ctx.beginPath(); ctx.rect(x + 150, y - 24, 500, 48); ctx.clip();
  label(ctx, name, x + 160, y + (1 - p) * 30, { size: 28, weight: 700, color: PAL.ink, align: 'left', alpha: p, spacing: 0 });
  ctx.restore();
}
