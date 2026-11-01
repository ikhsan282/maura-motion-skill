// Maura Motion style kit: MATH EXPLAINER GELAP (Manim-like math animation, original design).
// Near-black ground, a small strict palette (blue, yellow, teal, red), crisp 4px strokes over translucent
// fills, formulas that WRITE themselves on (outline first, then fill), shapes that physically rearrange.
// Signature move: a circle cut into sectors that splits, unrolls into two combs and interleaves into a
// near-rectangle; the count doubles (8 -> 16 -> 32 -> 64) and the edges straighten.
import { clamp, lerp, ease, hrand, TAU, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';
export { clamp, lerp, ease, TAU };

export const PAL = {
  bg: '#0e1116', grid: '#1f2a36', white: '#ece9e2', grey: '#8a9099',
  blue: '#58c4dd', blueD: '#236b8e', teal: '#5cd0b3', yellow: '#f9e15d', red: '#fc6255', green: '#83c167', purple: '#9a72ac',
};
export const pr = (t, a, b, fn = ease.inOutCubic) => fn(clamp((t - a) / Math.max(1e-6, b - a)));
/** Smooth "rate" curve Manim uses by default (smoothstep-ish). */
export const smooth = (x) => { x = clamp(x); return x * x * x * (10 - 15 * x + 6 * x * x); };

// ------------------------------------------------------------------ ground
/** Near-black background with an optional faint coordinate grid (cached). */
export function ground(ctx, { grid = 0.5 } = {}) {
  const c = cached('m3-bg:' + grid, () => {
    const cv = makeCanvas(1080, 1920), g = cv.getContext('2d');
    g.fillStyle = PAL.bg; g.fillRect(0, 0, 1080, 1920);
    if (grid > 0) {
      g.strokeStyle = rgba('#3a5068', 0.18 * grid); g.lineWidth = 1;
      for (let x = 0; x <= 1080; x += 60) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, 1920); g.stroke(); }
      for (let y = 0; y <= 1920; y += 60) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(1080, y + 0.5); g.stroke(); }
      g.strokeStyle = rgba('#3a5068', 0.32 * grid);
      for (let x = 0; x <= 1080; x += 180) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, 1920); g.stroke(); }
      for (let y = 0; y <= 1920; y += 180) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(1080, y + 0.5); g.stroke(); }
    }
    const v = g.createRadialGradient(540, 900, 300, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = v; g.fillRect(0, 0, 1080, 1920);
    return cv;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c, 0, 0); ctx.restore();
}
export function cam(ctx, z = 1, cx = 540, cy = 960, rot = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 960); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy);
}

// ------------------------------------------------------------------ circle -> rectangle (sector engine)
/**
 * Pose of sector i of N for arrangement stage s in [0,3]:
 *   0 circle, 1 split into top/bottom halves, 2 two combs facing each other, 3 interleaved near-rectangle.
 * geom: { cx, cy, R }. Returns { x, y (apex), phi (bisector angle), th (sector angle), top (group) }.
 * Sector i covers angles around a_i = -PI + (i + .5) * 2PI/N  (i < N/2: top half, arc on top).
 */
export function sectorPose(N, i, s, geom) {
  const { cx, cy, R } = geom, th = TAU / N, a = -Math.PI + (i + 0.5) * th, top = i < N / 2;
  const w = 2 * R * Math.sin(th / 2), half = N / 2;
  const total = half * w + w / 2, X0 = cx - total / 2, Ytop = cy - R / 2, Ybot = cy + R / 2;
  const j = top ? i : N - 1 - i;
  const P = [];
  P[0] = { x: cx, y: cy, phi: a };
  P[1] = { x: cx, y: cy + (top ? -0.16 : 0.16) * R, phi: a };
  P[2] = top ? { x: X0 + w / 2 + j * w, y: Ybot - 0.62 * R, phi: -Math.PI / 2 } : { x: X0 + w / 2 + j * w, y: Ytop + 0.62 * R, phi: Math.PI / 2 };
  P[3] = top ? { x: X0 + w / 2 + j * w, y: Ybot, phi: -Math.PI / 2 } : { x: X0 + w + j * w, y: Ytop, phi: Math.PI / 2 };
  const k = clamp(Math.floor(s), 0, 2), f = s >= 3 ? 1 : s - k;
  // per-sector stagger keeps the motion organic (left sectors lead)
  const stag = clamp(f * 1.35 - (j / Math.max(1, half - 1)) * 0.35);
  const e = smooth(stag);
  const A = P[k], B = P[Math.min(3, k + 1)];
  return { x: lerp(A.x, B.x, e), y: lerp(A.y, B.y, e), phi: A.phi + angDiff(A.phi, B.phi) * e, th, top, j };
}
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
/** Pose while re-cutting: N doubles (parent N/2 sector splits in two and each half slides to its own slot). k 0..1. */
export function splitPose(N, c, k, geom) {
  const p = Math.floor(c / 2), Np = N / 2;
  const P = sectorPose(Np, p, 3, geom), Q = sectorPose(N, c, 3, geom);
  const thc = TAU / N, ac = -Math.PI + (c + 0.5) * thc, ap = -Math.PI + (p + 0.5) * (TAU / Np);
  const startPhi = P.phi + (ac - ap); // same rotation as the parent
  const e = smooth(clamp(k * 1.3 - (Q.j / (N / 2)) * 0.3));
  return { x: lerp(P.x, Q.x, e), y: lerp(P.y, Q.y, e), phi: startPhi + angDiff(startPhi, Q.phi) * e, th: thc, top: Q.top, j: Q.j };
}
/**
 * Draw a set of sector poses. o: { R, fillA, colTop, colBot, arcHi (0..1 highlight the arcs: top arcs yellow),
 * edge (separator colour), lw }
 */
export function drawSectors(ctx, poses, o = {}) {
  const { R, fillA = 0.42, colTop = PAL.blue, colBot = PAL.teal, arcTop = 0, arcBot = 0, lw = 4, alpha = 1, edges = 1 } = o;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.lineJoin = 'round';
  for (const grp of [true, false]) {
    const col = grp ? colTop : colBot;
    ctx.beginPath();
    for (const q of poses) if (q.top === grp) { ctx.moveTo(q.x, q.y); ctx.arc(q.x, q.y, R, q.phi - q.th / 2, q.phi + q.th / 2); ctx.closePath(); }
    ctx.fillStyle = rgba(col, fillA); ctx.fill();
    if (edges <= 0) continue;
    ctx.save(); ctx.globalAlpha *= edges; ctx.strokeStyle = col; ctx.lineWidth = poses.length > 40 ? lw * 0.5 : lw * 0.75; ctx.stroke(); ctx.restore();
  }
  // outer arcs (the circumference), optionally highlighted
  for (const grp of [true, false]) {
    const hi = grp ? arcTop : arcBot;
    ctx.beginPath();
    for (const q of poses) if (q.top === grp) { ctx.moveTo(q.x + Math.cos(q.phi - q.th / 2) * R, q.y + Math.sin(q.phi - q.th / 2) * R); ctx.arc(q.x, q.y, R, q.phi - q.th / 2, q.phi + q.th / 2); }
    ctx.strokeStyle = hi > 0 ? mix(grp ? colTop : colBot, PAL.yellow, hi) : (grp ? colTop : colBot);
    ctx.lineWidth = lw + hi * 5; ctx.stroke();
  }
  ctx.restore();
}
function mix(a, b, t) { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const c = [16, 8, 0].map((s) => Math.round(lerp((A >> s) & 255, (B >> s) & 255, t))); return `rgb(${c[0]},${c[1]},${c[2]})`; }
/** Poses for all N sectors at stage s. */
export const posesAt = (N, s, geom) => Array.from({ length: N }, (_, i) => sectorPose(N, i, s, geom));
/** Poses while re-cutting from N/2 to N. */
export const posesSplit = (N, k, geom) => Array.from({ length: N }, (_, c) => splitPose(N, c, k, geom));
/** Bounding box of the finished near-rectangle for N sectors (x0, y0, w, h) -- the ideal rectangle is pi*R by R. */
export function rectBox(N, geom) {
  const { cx, cy, R } = geom, th = TAU / N, w = 2 * R * Math.sin(th / 2), total = (N / 2) * w + w / 2;
  return { x: cx - total / 2, y: cy - R / 2, w: total, h: R };
}

// ------------------------------------------------------------------ strokes that draw themselves
/** Stroke the current path partially (p 0..1) using a dash; L = approximate path length. */
export function strokeOn(ctx, p, L = 3000) {
  if (p <= 0) return;
  if (p >= 1) { ctx.stroke(); return; }
  ctx.save(); ctx.setLineDash([L * p, L * 2]); ctx.stroke(); ctx.restore();
}
/** Line that draws on from (x0,y0) to (x1,y1). */
export function line(ctx, x0, y0, x1, y1, p, { color = PAL.white, w = 4, dash = null } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, p), lerp(y0, y1, p)); ctx.stroke(); ctx.restore();
}
/** Curly brace along (x0,y0)->(x1,y1), bulging to the left of the direction of travel by `depth`. p = draw-on. */
export function brace(ctx, x0, y0, x1, y1, p, { color = PAL.white, depth = 30, w = 4 } = {}) {
  if (p <= 0) return;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = uy, ny = -ux;
  const P = (u, d) => [x0 + ux * u * L + nx * d, y0 + uy * u * L + ny * d];
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // draw from the centre outward on both sides (Manim GrowFromCenter feel)
  for (const sd of [-1, 1]) {
    const pts = [[0.5, depth], [0.5 - sd * 0.04, depth * 0.55], [0.5 - sd * 0.1, depth * 0.5], [0.5 - sd * 0.42, depth * 0.5], [0.5 - sd * 0.48, depth * 0.35], [0.5 - sd * 0.5, 0]];
    ctx.beginPath(); const a = P(...pts[0]); ctx.moveTo(a[0], a[1]);
    const b = P(...pts[1]), c = P(...pts[2]); ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]);
    const d = P(...pts[3]); ctx.lineTo(d[0], d[1]);
    const e = P(...pts[4]), f = P(...pts[5]); ctx.quadraticCurveTo(e[0], e[1], f[0], f[1]);
    strokeOn(ctx, p, L * 0.6 + depth * 2);
  }
  ctx.restore();
  const [lx, ly] = P(0.5, depth + 18);
  return [lx, ly, nx, ny];
}
/** Highlight rectangle that draws around a box (SurroundingRectangle). */
export function surround(ctx, x, y, w, h, p, { color = PAL.yellow, lw = 5, pad = 18, r = 10 } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.roundRect(x - pad, y - pad, w + pad * 2, h + pad * 2, r);
  strokeOn(ctx, p, 2 * (w + h + pad * 4)); ctx.restore();
}
/** Dashed outline of an ideal shape (used for "almost a rectangle"). */
export function dashedRect(ctx, x, y, w, h, p, { color = PAL.yellow, lw = 4 } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -p * 60;
  ctx.globalAlpha *= clamp(p * 2);
  const L = 2 * (w + h) * p;
  // draw the perimeter progressively
  ctx.beginPath(); let rem = L; const segs = [[x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]];
  ctx.moveTo(x, y);
  for (const [a, b, c, d] of segs) { const sl = Math.hypot(c - a, d - b); const u = clamp(rem / sl); ctx.lineTo(lerp(a, c, u), lerp(b, d, u)); rem -= sl; if (rem <= 0) break; }
  ctx.stroke(); ctx.restore();
}

// ------------------------------------------------------------------ math typesetting with write-on
const FONT = "'Noto Serif'";
/** Tokenise: letters are italic variables, digits/operators upright, 'π' custom glyph, '²' superscript 2. */
function tokens(str) { return [...str].map((ch) => ({ ch, kind: ch === 'π' ? 'pi' : ch === '²' ? 'sup' : /[a-zA-Z]/.test(ch) ? 'var' : ch === ' ' ? 'sp' : 'op' })); }
function fontFor(tk, size) { return tk.kind === 'var' ? `italic 400 ${size}px ${FONT}` : tk.kind === 'sup' ? `400 ${size * 0.62}px ${FONT}` : `400 ${size}px ${FONT}`; }
/** Layout: returns [{tk, x, w}] and total width. */
export function layoutMath(ctx, str, size) {
  const T = tokens(str); let x = 0; const out = [];
  ctx.save();
  for (const tk of T) {
    let w;
    if (tk.kind === 'pi') w = size * 0.66;
    else if (tk.kind === 'sp') w = size * 0.22;
    else { ctx.font = fontFor(tk, size); w = ctx.measureText(tk.ch).width + (tk.kind === 'op' && /[=×+−·]/.test(tk.ch) ? size * 0.28 : tk.kind === 'var' ? size * 0.04 : 0); }
    const pad = tk.kind === 'op' && /[=×+−·]/.test(tk.ch) ? size * 0.14 : 0;
    out.push({ tk, x: x + pad, w: w - pad * 2 }); x += w;
  }
  ctx.restore();
  return { items: out, width: x };
}
/** The pi glyph (stroked), local box: x 0..0.66*size, baseline 0. */
export function piGlyph(ctx, x, y, size, p = 1, color = PAL.white) {
  const s = size, lw = s * 0.075;
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(s * 0.04, -s * 0.42); ctx.quadraticCurveTo(s * 0.1, -s * 0.52, s * 0.22, -s * 0.5); ctx.lineTo(s * 0.62, -s * 0.5); // bar
  ctx.moveTo(s * 0.24, -s * 0.5); ctx.quadraticCurveTo(s * 0.22, -s * 0.18, s * 0.1, -s * 0.0); // left leg
  ctx.moveTo(s * 0.46, -s * 0.5); ctx.quadraticCurveTo(s * 0.42, -s * 0.12, s * 0.48, -s * 0.02); ctx.quadraticCurveTo(s * 0.54, s * 0.04, s * 0.6, -s * 0.06); // right leg with hook
  strokeOn(ctx, p, s * 2.2); ctx.restore();
}
/**
 * Write math text. str like 'L = πr²'. p 0..1 = write progress (outline draws, then fill floods in).
 * o: { size, color, colors: { 'r': PAL.yellow, 'π': PAL.blue }, align: 'center'|'left', alpha, only:[i0,i1) }
 * Returns layout (with absolute x) so scenes can point at terms.
 */
export function math(ctx, str, x, y, o = {}) {
  const { size = 90, color = PAL.white, colors = {}, align = 'center', alpha = 1, p = 1, hide = [] } = o;
  const L = layoutMath(ctx, str, size);
  const x0 = align === 'center' ? x - L.width / 2 : x;
  const n = L.items.length;
  ctx.save(); ctx.globalAlpha *= alpha; const base = ctx.globalAlpha; ctx.textBaseline = 'alphabetic';
  L.items.forEach((it, i) => {
    it.ax = x0 + it.x; it.ay = y;
    if (it.tk.kind === 'sp' || hide.includes(i)) return;
    const q = clamp((p * (n + 1.5) - i) / 2.5);
    if (q <= 0) return;
    const col = colors[it.tk.ch] || color;
    if (it.tk.kind === 'pi') { piGlyph(ctx, it.ax, y, size, Math.min(1, q * 1.25), col); return; }
    ctx.font = fontFor(it.tk, size);
    const yy = it.tk.kind === 'sup' ? y - size * 0.42 : y;
    if (q < 1) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, size * 0.022); ctx.setLineDash([size * 3 * q, size * 6]); ctx.strokeText(it.tk.ch, it.ax, yy); ctx.restore(); }
    ctx.globalAlpha = base * clamp((q - 0.45) / 0.55); ctx.fillStyle = col; ctx.fillText(it.tk.ch, it.ax, yy); ctx.globalAlpha = base;
  });
  ctx.restore();
  return { items: L.items, x0, width: L.width, size };
}
/** Small-caps style label (Inter, letter-spaced), like a Manim Text label. */
export function label(ctx, text, x, y, { size = 34, color = PAL.grey, alpha = 1, align = 'center', weight = 700, spacing = 4 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${weight} ${size}px 'Inter'`; ctx.letterSpacing = spacing + 'px';
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore();
}
/** Fading glow dot (cached sprite). */
export function dot(ctx, x, y, r = 8, color = PAL.yellow, a = 1) {
  const spr = cached('m3-dot:' + color, () => { const c = makeCanvas(64, 64), g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, rgba(color, 0.9)); gr.addColorStop(0.3, rgba(color, 0.35)); gr.addColorStop(1, rgba(color, 0)); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; });
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(spr, x - r * 4, y - r * 4, r * 8, r * 8); ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore();
}
