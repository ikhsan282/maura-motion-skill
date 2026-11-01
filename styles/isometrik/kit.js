// AniMasters style kit: ISOMETRIK (2:1 isometric diorama).
// Tiny low-detail blocks on a dark navy base, three-tone shading (light top, mid left, dark right), floating
// numbered labels, things that travel along paths (parcels, trucks, couriers), day/night switch, a camera that
// glides over the grid and follows the hero object. Painter's order = sort by (gx + gy).
import { clamp, lerp, ease, hrand, TAU, mixHex } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  bg: '#0F1530', bg2: '#151D40', ground: '#1E2A55', floor: '#C9D2E8', asphalt: '#2B3358', line: '#F5F1E6',
  white: '#F4F1EA', cream: '#EFE6D2', blue: '#5B8CFF', sky: '#8FD3FF', mint: '#5FE0B5', lime: '#C6F432',
  orange: '#FF9F43', kraft: '#E0A86A', red: '#FF4D5E', pink: '#FF8FB1', yellow: '#FFD24D', violet: '#9B87FF', ink: '#0B1024', grass: '#3C8F6E',
};
export const U = { hw: 64, hh: 32, z: 56 }; // half tile width, half tile height, height unit (px)

// ---------------------------------------------------------------- math
export const iso = (gx, gy, gz = 0) => [(gx - gy) * U.hw, (gx + gy) * U.hh - gz * U.z];
export function spring(t, { z = 0.7, ts = 0.5 } = {}) {
  if (t <= 0) return 0;
  const w = 4 / (Math.max(0.05, z) * ts);
  if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
export function springKeys(t, keys, o) { let v = keys[0][1]; for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], o); return v; }
export const sp = (t, t0, ts = 0.45, z = 0.55) => spring(t - t0, { z, ts });
/** Keyframed path [[t, gx, gy, gz], ...] with eased segments. */
export function pathAt(t, keys, fn = ease.inOutCubic) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) { const a = keys[i - 1], b = keys[i], u = fn(clamp((t - a[0]) / (b[0] - a[0]))); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)]; }
  }
  return keys[keys.length - 1].slice(1);
}
const tones = (c) => cached('iso-t:' + c, () => [mixHex(c, '#ffffff', 0.18), c, mixHex(c, '#0b1024', 0.32)]);

// ---------------------------------------------------------------- primitives
/** Block at grid (gx,gy,gz) with footprint w x d and height h. Three-tone faces + thin dark edge. */
export function box(ctx, gx, gy, gz, w, d, h, color, { alpha = 1, edge = true, top = null } = {}) {
  const [L, M, D] = tones(color);
  const P = (x, y, z) => iso(x, y, z);
  ctx.save(); ctx.globalAlpha *= alpha;
  const poly = (pts, c) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); if (edge) ctx.stroke(); };
  ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(11,16,36,0.35)'; ctx.lineJoin = 'round';
  poly([P(gx, gy + d, gz), P(gx + w, gy + d, gz), P(gx + w, gy + d, gz + h), P(gx, gy + d, gz + h)], M);       // left face (+gy)
  poly([P(gx + w, gy, gz), P(gx + w, gy + d, gz), P(gx + w, gy + d, gz + h), P(gx + w, gy, gz + h)], D);       // right face (+gx)
  poly([P(gx, gy, gz + h), P(gx + w, gy, gz + h), P(gx + w, gy + d, gz + h), P(gx, gy + d, gz + h)], top || L); // top
  ctx.restore();
}
/** Flat slab (ground tiles, floors, roads). */
export function slab(ctx, gx, gy, w, d, color, { h = 0.12, alpha = 1 } = {}) { box(ctx, gx, gy, -h, w, d, h, color, { alpha, edge: false }); }
/** Draw on the top plane z=gz in grid coordinates (fn gets a ctx already transformed to grid units). */
export function onPlane(ctx, gz, fn) {
  ctx.save(); const [ox, oy] = iso(0, 0, gz);
  ctx.transform(U.hw, U.hh, -U.hw, U.hh, ox, oy); fn(ctx); ctx.restore();
}
/** Tiny person: body + head; facing dir (+1/-1), walk phase. */
export function person(ctx, gx, gy, gz, color, t, { walk = 0, scale = 1, carry = false } = {}) {
  const [x, y] = iso(gx, gy, gz), s = scale;
  const b = Math.abs(Math.sin(t * 12)) * 3 * walk;
  ctx.save(); ctx.translate(x, y - b);
  ctx.fillStyle = 'rgba(11,16,36,0.35)'; ctx.beginPath(); ctx.ellipse(0, b, 12 * s, 6 * s, 0, 0, TAU); ctx.fill();
  const [L, M, D] = tones(color);
  ctx.fillStyle = M; roundRect(ctx, -9 * s, -36 * s, 18 * s, 30 * s, 7 * s); ctx.fill();
  ctx.fillStyle = D; roundRect(ctx, 0, -36 * s, 9 * s, 30 * s, 5 * s); ctx.fill();
  const lg = Math.sin(t * 12) * 4 * walk;
  ctx.fillStyle = '#26304F'; ctx.fillRect(-7 * s + lg, -8 * s, 6 * s, 9 * s); ctx.fillRect(1 * s - lg, -8 * s, 6 * s, 9 * s);
  ctx.fillStyle = '#F2C9A0'; ctx.beginPath(); ctx.arc(0, -44 * s, 8.5 * s, 0, TAU); ctx.fill();
  ctx.fillStyle = L; ctx.beginPath(); ctx.arc(0, -47 * s, 8.5 * s, Math.PI, 0); ctx.fill();
  if (carry) { ctx.fillStyle = '#F2C9A0'; ctx.fillRect(-14 * s, -28 * s, 6 * s, 6 * s); }
  ctx.restore();
}
/** Parcel: kraft cube with tape and a label. s = size in grid units. */
export function parcel(ctx, gx, gy, gz, { s = 0.42, open = false, glow = 0, t = 0 } = {}) {
  if (glow > 0) { const [x, y] = iso(gx + s / 2, gy + s / 2, gz + s / 2); halo(ctx, x, y, 70, glow); }
  box(ctx, gx, gy, gz, s, s, s * 0.85, PAL.kraft, { top: '#F0C489' });
  if (open) return;
  onPlane(ctx, gz + s * 0.85, (g) => { g.fillStyle = 'rgba(120,70,30,0.45)'; g.fillRect(gx + s * 0.44, gy, s * 0.12, s); });
  // label on the +gy face
  const P = (x, y, z) => iso(x, y, z), q = [P(gx + s * 0.15, gy + s, gz + s * 0.2), P(gx + s * 0.6, gy + s, gz + s * 0.2), P(gx + s * 0.6, gy + s, gz + s * 0.6), P(gx + s * 0.15, gy + s, gz + s * 0.6)];
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1.1; ctx.beginPath();
  for (let i = 0; i < 6; i++) { const u = 0.2 + i * 0.065; const p1 = P(gx + s * u, gy + s, gz + s * 0.25), p2 = P(gx + s * u, gy + s, gz + s * 0.45); ctx.moveTo(...p1); ctx.lineTo(...p2); }
  ctx.stroke();
}
export function halo(ctx, x, y, r, a = 1, rgb = '255,210,77') {
  const spr = cached('iso-halo:' + rgb, () => { const c = makeCanvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, `rgba(${rgb},0.9)`); gr.addColorStop(0.5, `rgba(${rgb},0.25)`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; });
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(spr, x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
/** Conveyor belt along +gx from gx0 to gx1 at row gy (width 1). Stripes move with t. */
export function conveyor(ctx, gx0, gx1, gy, t, { h = 0.45, speed = 1.2, axis = 'x' } = {}) {
  if (axis === 'x') box(ctx, gx0, gy, 0, gx1 - gx0, 1, h, '#55607F');
  else box(ctx, gy, gx0, 0, 1, gx1 - gx0, h, '#55607F');
  onPlane(ctx, h, (g) => {
    g.fillStyle = '#2A3150'; if (axis === 'x') g.fillRect(gx0, gy + 0.12, gx1 - gx0, 0.76); else g.fillRect(gy + 0.12, gx0, 0.76, gx1 - gx0);
    g.fillStyle = 'rgba(255,255,255,0.18)';
    for (let k = gx0 + ((t * speed) % 0.5); k < gx1; k += 0.5) { if (axis === 'x') g.fillRect(k, gy + 0.12, 0.08, 0.76); else g.fillRect(gy + 0.12, k, 0.76, 0.08); }
  });
}
/** Box truck driving along +gx (cab at the front). Lights on at night. */
export function truck(ctx, gx, gy, t, { color = PAL.white, night = 0, moving = 0 } = {}) {
  const bob = moving ? Math.sin(t * 20) * 0.02 : 0;
  for (const wx of [0.4, 1.7, 2.6]) for (const wy of [0, 1]) { const [x, y] = iso(gx + wx, gy + wy, 0.15); ctx.fillStyle = '#141A30'; ctx.beginPath(); ctx.ellipse(x, y, 11, 8, 0, 0, TAU); ctx.fill(); }
  box(ctx, gx, gy, 0.25 + bob, 2.2, 1, 1.25, color);
  onPlane(ctx, 1.5 + bob, (g) => { g.fillStyle = PAL.orange; g.fillRect(gx + 0.2, gy + 0.3, 1.8, 0.4); });
  box(ctx, gx + 2.25, gy + 0.05, 0.25 + bob, 0.8, 0.9, 0.85, PAL.orange);
  box(ctx, gx + 2.75, gy + 0.12, 0.62 + bob, 0.3, 0.76, 0.38, '#9FD8FF');
  if (night > 0) { const [x, y] = iso(gx + 3.1, gy + 0.5, 0.45); halo(ctx, x + 60, y + 30, 120, night, '255,236,170'); }
}
/** Motorbike with rider along +gx (or +gy with axis). */
export function bike(ctx, gx, gy, t, { moving = 0, rider = PAL.mint, axis = 'x', box2 = true } = {}) {
  const ax = axis === 'x';
  const w1 = ax ? [gx + 0.1, gy + 0.3] : [gx + 0.3, gy + 0.1], w2 = ax ? [gx + 0.9, gy + 0.3] : [gx + 0.3, gy + 0.9];
  for (const [a, b] of [w1, w2]) { const [x, y] = iso(a, b, 0.12); ctx.fillStyle = '#141A30'; ctx.beginPath(); ctx.ellipse(x, y, 9, 7, 0, 0, TAU); ctx.fill(); }
  if (ax) box(ctx, gx + 0.1, gy + 0.2, 0.15, 0.8, 0.22, 0.25, PAL.red); else box(ctx, gx + 0.2, gy + 0.1, 0.15, 0.22, 0.8, 0.25, PAL.red);
  if (box2) { if (ax) box(ctx, gx, gy + 0.08, 0.4, 0.38, 0.46, 0.38, PAL.mint); else box(ctx, gx + 0.08, gy, 0.4, 0.46, 0.38, 0.38, PAL.mint); }
  if (rider) person(ctx, ax ? gx + 0.55 : gx + 0.31, ax ? gy + 0.31 : gy + 0.55, 0.32, rider, t, { walk: 0, scale: 0.9 });
}
export function tree(ctx, gx, gy, { s = 1, color = PAL.grass } = {}) {
  box(ctx, gx + 0.4, gy + 0.4, 0, 0.2, 0.2, 0.35 * s, '#7A5A3C');
  const [x, y] = iso(gx + 0.5, gy + 0.5, 0.35 * s + 0.35 * s);
  const [L, M, D] = tones(color);
  ctx.fillStyle = M; ctx.beginPath(); ctx.arc(x, y, 26 * s, 0, TAU); ctx.fill();
  ctx.fillStyle = L; ctx.beginPath(); ctx.arc(x - 7 * s, y - 7 * s, 15 * s, 0, TAU); ctx.fill();
}
export function lamp(ctx, gx, gy, night = 0) {
  box(ctx, gx, gy, 0, 0.1, 0.1, 1.6, '#8A93B5', { edge: false });
  const [x, y] = iso(gx + 0.05, gy + 0.05, 1.65);
  ctx.fillStyle = night > 0.2 ? '#FFE9A8' : '#C9D2E8'; ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fill();
  if (night > 0) { halo(ctx, x, y + 40, 90, night * 0.8, '255,226,150'); }
}
export function house(ctx, gx, gy, { color = PAL.cream, roof = PAL.red } = {}) {
  box(ctx, gx, gy, 0, 2, 2, 1.4, color);
  // pitched roof (two planes)
  const P = (x, y, z) => iso(x, y, z);
  const [L, M, D] = tones(roof);
  ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(11,16,36,0.35)';
  const poly = (pts, c) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.stroke(); };
  poly([P(gx - 0.1, gy + 2.1, 1.4), P(gx + 2.1, gy + 2.1, 1.4), P(gx + 2.1, gy + 1, 2.3), P(gx - 0.1, gy + 1, 2.3)], M);
  poly([P(gx + 2.1, gy - 0.1, 1.4), P(gx + 2.1, gy + 2.1, 1.4), P(gx + 2.1, gy + 1, 2.3)], tones(color)[2]);
  poly([P(gx - 0.1, gy - 0.1, 1.4), P(gx + 2.1, gy - 0.1, 1.4), P(gx + 2.1, gy + 1, 2.3), P(gx - 0.1, gy + 1, 2.3)], L);
  // door + window on the +gy face
  const door = [P(gx + 0.8, gy + 2, 0), P(gx + 1.2, gy + 2, 0), P(gx + 1.2, gy + 2, 0.8), P(gx + 0.8, gy + 2, 0.8)];
  poly(door, '#6B4A3A');
  poly([P(gx + 0.2, gy + 2, 0.6), P(gx + 0.55, gy + 2, 0.6), P(gx + 0.55, gy + 2, 1.0), P(gx + 0.2, gy + 2, 1.0)], '#9FD8FF');
}

// ---------------------------------------------------------------- labels & effects (screen space helpers take canvas coords)
/** Floating numbered label with a leader line to (x,y). p = pop progress. */
export function tag(ctx, x, y, n, str, { p = 1, lift = 110, fill = PAL.white, color = PAL.ink, badge = PAL.orange, size = 30, done = false } = {}) {
  if (p <= 0.01) return;
  const s = Math.max(0, p);
  ctx.save(); ctx.translate(x, y - lift); ctx.scale(s, s);
  ctx.font = `700 ${size}px 'Inter'`; ctx.letterSpacing = '0px';
  const w = ctx.measureText(str).width + size * 2.6, h = size * 1.75;
  ctx.strokeStyle = 'rgba(244,241,234,0.7)'; ctx.lineWidth = 2.5; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(0, lift); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(244,241,234,0.9)'; ctx.beginPath(); ctx.arc(0, lift, 5, 0, TAU); ctx.fill();
  roundRect(ctx, -w / 2 + 4, -h / 2 + 5, w, h, h / 2); ctx.fillStyle = 'rgba(5,8,20,0.45)'; ctx.fill();
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = fill; ctx.fill();
  ctx.fillStyle = done ? PAL.mint : badge; ctx.beginPath(); ctx.arc(-w / 2 + h / 2, 0, h / 2 - 5, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `800 ${size * 0.8}px 'Inter'`;
  ctx.fillText(done ? '✓' : String(n), -w / 2 + h / 2, 1);
  ctx.font = `700 ${size}px 'Inter'`; ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.fillText(str, -w / 2 + h + 6, 1);
  ctx.restore();
}
/** Laser scan fan from (x0,y0) to a target point, with a BEEP flash. age in s. */
export function scan(ctx, x0, y0, x1, y1, age, { dur = 0.6 } = {}) {
  if (age < 0 || age > dur) return;
  const a = Math.sin((age / dur) * Math.PI);
  ctx.save(); ctx.globalAlpha *= a;
  const sw = Math.sin(age * 30) * 14;
  ctx.fillStyle = 'rgba(255,77,94,0.35)'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - 26, y1 + sw); ctx.lineTo(x1 + 26, y1 - sw); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#FF4D5E'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x1 - 30, y1 + sw); ctx.lineTo(x1 + 30, y1 - sw); ctx.stroke();
  halo(ctx, x1, y1, 50, a, '255,77,94');
  ctx.restore();
}
/** "BEEP" pop text. */
export function beep(ctx, x, y, age) {
  if (age < 0 || age > 0.7) return;
  const p = ease.outBack(clamp(age / 0.25)), a = 1 - clamp((age - 0.45) / 0.25);
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y - 40 - age * 40); ctx.scale(p, p);
  ctx.font = "800 30px 'Inter'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 6; ctx.strokeStyle = PAL.ink; ctx.strokeText('BEEP', 0, 0); ctx.fillStyle = PAL.red; ctx.fillText('BEEP', 0, 0);
  ctx.restore();
}
/** Background: navy with a faint large dot grid (screen space). */
export function stage(ctx, t, night = 0) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = mixHex(PAL.bg, '#060918', night * 0.7); ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const pat = cached('iso-dots', () => { const c = makeCanvas(64, 32), g = c.getContext('2d'); g.fillStyle = 'rgba(160,180,255,0.10)'; g.fillRect(31, 15, 2, 2); return ctx.createPattern(c, 'repeat'); });
  ctx.fillStyle = pat; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (night > 0) { // stars
    ctx.fillStyle = `rgba(255,255,255,${0.7 * night})`;
    for (let i = 0; i < 60; i++) { const x = hrand(i, 1) * 1080, y = hrand(i, 2) * 900; const tw = 0.5 + 0.5 * Math.sin(t * 3 + i); ctx.fillRect(x, y, 2 + tw, 2 + tw); }
  }
  ctx.restore();
}
