// Maura Motion style kit: GARIS TUNGGAL (one continuous line).
// Warm white paper, lots of air, a single thin black line that never lifts: it travels across the page and draws
// every object in turn, flowing out of one picture into the next. A fine-liner leads the line, the camera follows
// the tip, small spaced capitals label things, and one red accent marks what matters.
//
// The line is a chain of segments; each has a time window and its points (static, or a function of t for parts
// that move, like a thumb scrolling). Each segment starts where the previous one ended, so it is one line.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = { paper: '#f7f4ee', ink: '#1c1c1e', soft: '#8b877f', red: '#d93a2b' };
export const WIDTH = 5;

// ---------------------------------------------------------------- geometry
export function lengths(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
/** Points of a polyline up to fraction u of its length (the last point interpolated). */
export function partial(pts, u, cum = lengths(pts)) {
  const L = u * cum[cum.length - 1]; if (u >= 1) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (cum[i] >= L) { const f = (L - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); return out; }
    out.push(pts[i]);
  }
  return out;
}
/** Smooth Catmull-Rom through control points (k samples per span). */
export function spline(pts, k = 12, closed = false) {
  const n = pts.length, out = [], P = (i) => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)], segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2); for (let j = 0; j < k; j++) { const t = j / k, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); } }
  out.push(closed ? [...pts[0]] : [...pts[n - 1]]); return out;
}
export const arc = (cx, cy, rx, ry, a0, a1, n = 0) => { n = n || Math.max(8, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) / 6)); const q = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); q.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return q; };
export const rrect = (x, y, w, h, r, start = 'tl') => { // clockwise from the top-left corner's end
  const p = [], c = (cx, cy, a0) => { for (let i = 0; i <= 5; i++) { const a = a0 + (i / 5) * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  c(x + w - r, y + r, -Math.PI / 2); c(x + w - r, y + h - r, 0); c(x + r, y + h - r, Math.PI / 2); c(x + r, y + r, Math.PI); p.push([x + w - r, y]); return p;
};
/** Join pieces into one path (each piece starts where the last ended; a gap is bridged with a straight run). */
export const join = (...parts) => parts.flat();

// ---------------------------------------------------------------- one-line icons (all return point lists)
/** Phone: enters at the top centre, left half of the body, up the home bar, the screen, down again, right half,
 *  and leaves along the top edge towards the right. */
export function phone(cx, cy, s = 1) {
  const w = 180 * s, h = 320 * s, x = cx - w / 2, y = cy - h / 2, r = 28 * s, sx = x + 16 * s, sy = y + 30 * s, sw = w - 32 * s, sh = h - 76 * s, sr = 8 * s;
  const left = [[cx, y], ...arc(x + r, y + r, r, r, -Math.PI / 2, -Math.PI, 6), ...arc(x + r, y + h - r, r, r, Math.PI, Math.PI / 2, 6), [cx, y + h]];
  const scr = [[cx, sy + sh], ...arc(sx + sr, sy + sh - sr, sr, sr, Math.PI / 2, Math.PI, 4), ...arc(sx + sr, sy + sr, sr, sr, Math.PI, Math.PI * 1.5, 4), ...arc(sx + sw - sr, sy + sr, sr, sr, -Math.PI / 2, 0, 4), ...arc(sx + sw - sr, sy + sh - sr, sr, sr, 0, Math.PI / 2, 4), [cx, sy + sh]];
  const right = [[cx, y + h], ...arc(x + w - r, y + h - r, r, r, Math.PI / 2, 0, 6), ...arc(x + w - r, y + r, r, r, 0, -Math.PI / 2, 6), [cx, y], [x + w - r, y]];
  return join(left, [[cx, y + h - 14 * s]], scr, [[cx, y + h - 14 * s]], right);
}
/** One finger reaching from (bx,by) to the tip (tx,ty): up one edge, round the tip, back down; a nail arc.
 *  Width w. Move the tip to animate (scrolling). */
export function finger(bx, by, tx, ty, w = 58) {
  const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, h = w / 2;
  const P = (a, b) => [bx + ux * a + nx * b, by + uy * a + ny * b];
  const tip = []; for (let i = 0; i <= 12; i++) { const ang = -Math.PI / 2 + (i / 12) * Math.PI; tip.push(P(L - h + Math.cos(ang) * h, Math.sin(ang) * h)); }
  const nail = []; for (let i = 0; i <= 8; i++) { const ang = Math.PI * 0.6 - (i / 8) * Math.PI * 1.2; nail.push(P(L - h * 1.6 + Math.cos(ang) * h * 0.55, Math.sin(ang) * h * 0.55)); }
  return join([P(0, -h - 4), P(L * 0.55, -h), P(L - h, -h)], tip, [P(L - h * 1.0, h)], nail.reverse(), [P(L - h * 1.0, h), P(L * 0.55, h + 1), P(L * 0.25, h + 4), P(0, h + 8)]);
}
/** Classic one-line smiley: the head, then into the smile and out (eyes are separate ink dots: faceEyes). */
export function face(cx, cy, r = 110) {
  return join(arc(cx, cy, r, r, -Math.PI / 2, Math.PI * 1.5), spline([[cx, cy - r], [cx - r * 0.25, cy - r * 0.3], [cx - r * 0.55, cy + r * 0.12]], 6), arc(cx, cy + r * 0.02, r * 0.56, r * 0.52, Math.PI * 0.94, Math.PI * 0.06, 18), [[cx + r * 0.85, cy + r * 0.25]]);
}
export function faceEyes(ctx, cx, cy, r = 110, k = 1) { ctx.fillStyle = PAL.ink; for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + sx * r * 0.32, cy - r * 0.22, r * 0.07 * k, r * 0.1 * k, 0, 0, TAU); ctx.fill(); } }
/** Heart (starts and ends at the top notch). */
export function heart(cx, cy, s = 1) {
  const q = []; for (let i = 0; i <= 60; i++) { const a = (i / 60) * TAU; const X = 16 * Math.pow(Math.sin(a), 3), Y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); q.push([cx + X * 4 * s, cy + Y * 4 * s]); } return q;
}
/** Open book: left page, down the spine, right page, then two short lines of text on the right page. */
export function book(cx, cy, s = 1) {
  const P = ([a, b]) => [cx + a * s, cy + b * s];
  return join(spline([[0, 70], [-70, 46], [-150, 48], [-200, 66]].map(P), 8), [P([-200, -66])], spline([[-200, -66], [-150, -86], [-70, -84], [0, -56]].map(P), 8),
    [P([0, 70])], spline([[0, 70], [70, 46], [150, 48], [200, 66]].map(P), 8), [P([200, -66])], spline([[200, -66], [150, -86], [70, -84], [0, -56]].map(P), 8),
    spline([[0, -56], [40, -30], [80, -42], [120, -28], [160, -40]].map(P), 8));
}
/** Arrowhead out and back (keeps the line unbroken). dir in radians. */
export function arrowTip(x, y, dir, L = 26) { return [[x, y], [x - Math.cos(dir - 0.5) * L, y - Math.sin(dir - 0.5) * L], [x, y], [x - Math.cos(dir + 0.5) * L, y - Math.sin(dir + 0.5) * L], [x, y]]; }

// ---------------------------------------------------------------- the line
/**
 * const L = new Line(); L.add(pts | (t)=>pts, a, b, {col}) ... ; L.draw(ctx, t) -> tip [x,y] (or null when done).
 * Segments with a function are re-evaluated every frame (parts that move). Colour switches give the red accent.
 */
export class Line {
  constructor() { this.segs = []; this._cum = new Map(); }
  add(pts, a, b, o = {}) { this.segs.push({ pts, a, b, col: o.col || PAL.ink, ease: o.ease || ease.inOutSine, fade: o.fade || null, w: o.w || 1 }); return this; }
  get end() { return Math.max(...this.segs.map((s) => s.b)); }
  points(s, t) { return typeof s.pts === 'function' ? s.pts(t) : s.pts; }
  draw(ctx, t, { width = WIDTH, alpha = 1 } = {}) {
    let tip = null;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    let curCol = null, open = false, curA = 1, curW = 1;
    const flush = () => { if (open) { ctx.strokeStyle = curCol; ctx.globalAlpha = alpha * curA; ctx.lineWidth = width * curW; ctx.stroke(); open = false; } };
    for (let i = 0; i < this.segs.length; i++) {
      const s = this.segs[i]; if (t < s.a) break;
      const u = s.ease(clamp((t - s.a) / Math.max(1e-6, s.b - s.a)));
      const pts = this.points(s, t);
      let cum = typeof s.pts === 'function' ? lengths(pts) : this._cum.get(s);
      if (!cum) { cum = lengths(pts); this._cum.set(s, cum); }
      const vis = partial(pts, u, cum), a = s.fade ? s.fade(t) : 1;
      if (s.col !== curCol || a !== curA || s.w !== curW || !open) { flush(); curCol = s.col; curA = a; curW = s.w; ctx.beginPath(); ctx.moveTo(vis[0][0], vis[0][1]); open = true; }
      for (let k = 1; k < vis.length; k++) ctx.lineTo(vis[k][0], vis[k][1]);
      if (u < 1) tip = vis[vis.length - 1];
    }
    flush(); ctx.restore();
    return tip;
  }
  /** Tip position at t without drawing. */
  tip(t) {
    let last = null;
    for (const s of this.segs) { if (t < s.a) break; const pts = this.points(s, t), u = s.ease(clamp((t - s.a) / Math.max(1e-6, s.b - s.a))); const v = partial(pts, u); last = v[v.length - 1]; if (u < 1) return { x: last[0], y: last[1], on: true }; }
    return last ? { x: last[0], y: last[1], on: false } : null;
  }
}

// ---------------------------------------------------------------- paper, pen, labels, camera
export function paperTile(S = 512) {
  return cached('gt-paper', () => {
    const c = makeCanvas(S, S), g = c.getContext('2d'), r = mulberry32(2);
    g.fillStyle = PAL.paper; g.fillRect(0, 0, S, S);
    const id = g.getImageData(0, 0, S, S), d = id.data; for (let i = 0; i < d.length; i += 4) { const k = (r() - 0.5) * 7; d[i] += k; d[i + 1] += k; d[i + 2] += k; } g.putImageData(id, 0, 0);
    g.lineWidth = 1; for (let i = 0; i < 260; i++) { const x = r() * S, y = r() * S, a = r() * TAU, l = 4 + r() * 12; g.strokeStyle = `rgba(150,130,100,${0.05 * r()})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    return c;
  });
}
export function paper(ctx) {
  const m = ctx.getTransform().inverse(), W = ctx.canvas.width, H = ctx.canvas.height;
  const pts = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  if (!ctx.__pp) ctx.__pp = ctx.createPattern(paperTile(), 'repeat');
  ctx.fillStyle = ctx.__pp; ctx.fillRect(Math.min(...xs) - 4, Math.min(...ys) - 4, Math.max(...xs) - Math.min(...xs) + 8, Math.max(...ys) - Math.min(...ys) + 8);
}
/** Slim black fine-liner whose nib is at (x,y). */
export function fineliner(ctx, x, y, { ang = -1.0, lift = 0, s = 1, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.save(); ctx.translate(x + (14 + lift * 30) * s, y + (18 + lift * 34) * s); ctx.rotate(ang); ctx.scale(s, s); ctx.fillStyle = 'rgba(60,45,30,0.16)'; ctx.fillRect(14, -9, 360, 18); ctx.restore();
  ctx.translate(x, y - lift * 14 * s); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = '#9a9a9a'; ctx.fillRect(0, -2, 16, 4);
  ctx.fillStyle = '#2a2a2c'; ctx.beginPath(); ctx.moveTo(14, -4); ctx.lineTo(40, -9); ctx.lineTo(40, 9); ctx.lineTo(14, 4); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(0, -10, 0, 10); g.addColorStop(0, '#47474b'); g.addColorStop(0.5, '#222225'); g.addColorStop(1, '#0d0d0e'); ctx.fillStyle = g; ctx.fillRect(40, -10, 330, 20);
  ctx.fillStyle = PAL.red; ctx.fillRect(330, -10, 8, 20);
  ctx.restore();
}
/** Small spaced capitals (Inter), fading/rising in. */
export function label(ctx, str, x, y, { a = 1, size = 34, col = PAL.soft, spacing = 8, align = 'center', weight = 600 } = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `${weight} ${size}px 'Inter'`; ctx.letterSpacing = spacing + 'px'; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  ctx.fillText(str, x, y + (1 - a) * 12); ctx.restore();
}
export function cam(ctx, x, y, z = 1, rot = 0, fy = 760) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y); }
export { clamp, lerp, ease, hrand, noise, TAU };
