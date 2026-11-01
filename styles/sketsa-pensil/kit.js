// Maura Motion style kit: SKETSA PENSIL (graphite pencil on paper).
// Lines draw themselves with pressure (thin ends, dark middle), under a real pencil that follows the stroke;
// blue construction lines come first, then graphite; hatching and cross-hatching sweep in; handwritten notes;
// a clear ruler slides in for straight lines; an eraser rubs things out leaving a smudge and crumbs.
// One accent: a red pencil (for the thing that matters).
//
// The core is a timed "Sketch": you push strokes/hatches/texts/erasures; each gets a start/end time; draw(ctx,t)
// draws only what is visible at t (geometry is precomputed once, per frame we only trace the visible part).
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, paperTexture, alphaTexture } from '/engine/lib/draw.js';

export const PAL = {
  paper: '#f5f1e8', paperDeep: '#e4dccb', lead: '#232428', mid: '#55575c', light: '#8a8c90',
  blue: '#7fa6d6', red: '#c4402b', redDeep: '#9a2a1b', pink: '#e7a29c', eraser: '#f4f1ea',
};

// ---------------------------------------------------------------- geometry
/** Resample a polyline [[x,y],...] to even spacing; returns a track {xy, cum, n, len, bb}. */
export function track(pts, step = 5) {
  const out = [pts[0][0], pts[0][1]];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const ax = pts[i - 1][0], ay = pts[i - 1][1], bx = pts[i][0], by = pts[i][1];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    if (L < 1e-6) continue;
    let d = step - carry;
    while (d <= L) { out.push(ax + (dx * d) / L, ay + (dy * d) / L); d += step; }
    carry = L - (d - step);
  }
  const l = pts[pts.length - 1];
  if (carry > 0.5) out.push(l[0], l[1]);
  const n = out.length / 2, xy = new Float32Array(out), cum = new Float32Array(n);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < n; i++) {
    if (i) cum[i] = cum[i - 1] + Math.hypot(xy[2 * i] - xy[2 * i - 2], xy[2 * i + 1] - xy[2 * i - 1]);
    x0 = Math.min(x0, xy[2 * i]); x1 = Math.max(x1, xy[2 * i]); y0 = Math.min(y0, xy[2 * i + 1]); y1 = Math.max(y1, xy[2 * i + 1]);
  }
  return { xy, cum, n, len: cum[n - 1] || 0.001, bb: [x0, y0, x1, y1] };
}
/** Point (and index) at arc length L along a track. */
export function pointAt(tr, L) {
  const { xy, cum, n } = tr;
  if (L <= 0) return [xy[0], xy[1], 0];
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] < L) lo = m; else hi = m; }
  const f = clamp((L - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]));
  return [lerp(xy[2 * lo], xy[2 * hi], f), lerp(xy[2 * lo + 1], xy[2 * hi + 1], f), hi];
}
/** Add the visible part [L0, L1] of a track to the current path. */
export function tracePart(ctx, tr, L0, L1, jit = null) {
  const { xy, cum, n } = tr;
  if (L1 <= L0) return;
  const [sx, sy, si] = pointAt(tr, L0);
  ctx.moveTo(sx, sy);
  for (let i = si; i < n; i++) {
    if (cum[i] >= L1) { const [ex, ey] = pointAt(tr, L1); ctx.lineTo(ex, ey); return; }
    if (jit) { const [jx, jy] = jit(i); ctx.lineTo(xy[2 * i] + jx, xy[2 * i + 1] + jy); } else ctx.lineTo(xy[2 * i], xy[2 * i + 1]);
  }
}

/** Pencil-look partial stroke along any track (e.g. a growing crack). */
export function strokeTrack(ctx, tr, L0, L1, { w = 3, col = PAL.lead, alpha = 1 } = {}) {
  if (L1 <= L0) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = leadPattern(ctx, col);
  ctx.globalAlpha = alpha * 0.65; ctx.lineWidth = w * 0.75; ctx.beginPath(); tracePart(ctx, tr, L0, L1); ctx.stroke();
  ctx.globalAlpha = alpha * 0.7; ctx.lineWidth = w; ctx.beginPath(); tracePart(ctx, tr, L0 + (L1 - L0) * 0.08, L1); ctx.stroke();
  ctx.restore();
}
/** Jagged crack path from (x,y) heading `ang`: short straight bits with random turns (seeded). */
export function jagged(x, y, len, ang, { seed = 1, step = 9, wander = 0.55, pull = 0.25 } = {}) {
  const r = mulberry32(seed), pts = [[x, y]]; let a = ang, d = 0;
  while (d < len) { a += (r() - 0.5) * wander * 2; a += (ang - a) * pull; const st = step * (0.6 + r() * 0.9); x += Math.cos(a) * st; y += Math.sin(a) * st; d += st; pts.push([x, y]); }
  return pts;
}

/** Shape builders. All return point arrays in world coords. */
export const G = {
  line: (x1, y1, x2, y2) => [[x1, y1], [x2, y2]],
  arc: (cx, cy, rx, ry, a0, a1, n = 0) => {
    n = n || Math.max(8, Math.ceil((Math.abs(a1 - a0) * Math.max(rx, ry)) / 8));
    const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p;
  },
  circle: (cx, cy, r, a0 = -2.2, over = 0.25) => G.arc(cx, cy, r, r, a0, a0 + TAU + over),
  ellipse: (cx, cy, rx, ry, a0 = -2.2, over = 0.2) => G.arc(cx, cy, rx, ry, a0, a0 + TAU + over),
  rect: (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y - 2]],
  rrect: (x, y, w, h, r) => {
    const p = [];
    const c = (cx, cy, a0) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    c(x + w - r, y + r, -Math.PI / 2); c(x + w - r, y + h - r, 0); c(x + r, y + h - r, Math.PI / 2); c(x + r, y + r, Math.PI); p.push([x + w - r, y]);
    return p;
  },
  /** Catmull-Rom through points (k samples per segment). */
  spline: (pts, k = 10, closed = false) => {
    const n = pts.length, out = [];
    const P = (i) => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let j = 0; j < k; j++) {
        const t = j / k, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
      }
    }
    out.push(closed ? [...pts[0]] : [...pts[n - 1]]);
    return out;
  },
  bez: (p0, p1, p2, p3, n = 24) => {
    const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([0, 1].map((d) => u * u * u * p0[d] + 3 * u * u * t * p1[d] + 3 * u * t * t * p2[d] + t * t * t * p3[d])); } return o;
  },
  /** map points through translate/scale/rotate (for building a drawing in local units) */
  xf: (pts, x = 0, y = 0, s = 1, r = 0, sx = 1) => pts.map(([px, py]) => { const X = px * s * sx, Y = py * s; return [x + X * Math.cos(r) - Y * Math.sin(r), y + X * Math.sin(r) + Y * Math.cos(r)]; }),
};

/** Hand-made wobble: low-frequency drift perpendicular to the line + a little overshoot at the ends. */
export function sketchy(pts, { amp = 1.6, seed = 1, over = 0, step = 6 } = {}) {
  const tr = track(pts, step), { xy, n, len } = tr, out = [];
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1);
    let dx = xy[2 * b] - xy[2 * a], dy = xy[2 * b + 1] - xy[2 * a + 1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = noise.n2(tr.cum[i] / 90 + seed * 7.3, seed * 1.9) * amp;
    out.push([xy[2 * i] - dy * w, xy[2 * i + 1] + dx * w]);
  }
  if (over && n > 2) {
    const e = (i0, i1, s) => { const dx = xy[2 * i1] - xy[2 * i0], dy = xy[2 * i1 + 1] - xy[2 * i0 + 1], l = Math.hypot(dx, dy) || 1; return [xy[2 * i1] + (dx / l) * over * s, xy[2 * i1 + 1] + (dy / l) * over * s]; };
    out.push(e(n - 2, n - 1, 0.6 + hrand(seed, 3) * 0.8));
    out.unshift(e(1, 0, 0.3 + hrand(seed, 4) * 0.6));
  }
  return out;
}

/** Parallel hatch lines clipped to a polygon. Returns [[p0,p1],...] segments (slightly flicked). */
export function hatchLines(poly, { ang = -0.9, gap = 11, seed = 1, jitter = 0.25, inset = 3 } = {}) {
  const c = Math.cos(-ang), s = Math.sin(-ang);
  const R = poly.map(([x, y]) => [x * c - y * s, x * s + y * c]);
  const ys = R.map((p) => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const out = []; const rng = mulberry32(seed);
  for (let y = y0 + gap * 0.5; y < y1; y += gap * (0.85 + rng() * 0.3)) {
    const xs = [];
    for (let i = 0; i < R.length; i++) {
      const a = R[i], b = R[(i + 1) % R.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      let xa = xs[k] + inset + rng() * gap * jitter * 2, xb = xs[k + 1] - inset - rng() * gap * jitter * 2;
      if (xb - xa < 4) continue;
      const yy = y + (rng() - 0.5) * gap * 0.3, tilt = (rng() - 0.5) * gap * 0.35;
      const back = (q) => [q[0] * c + q[1] * s, -q[0] * s + q[1] * c];
      out.push([back([xa, yy - tilt]), back([(xa + xb) / 2, yy + (rng() - 0.5) * 1.5]), back([xb, yy + tilt])]);
    }
  }
  return out;
}

// ---------------------------------------------------------------- textures
/** Graphite pattern: dark grey with paper-tooth grain (alpha speckle). World-anchored. */
export function leadPattern(ctx, col = PAL.lead, strength = 1) {
  const tile = cached('sp-lead:' + col + strength, () => {
    const S = 192, c = makeCanvas(S, S), g = c.getContext('2d');
    g.fillStyle = col; g.fillRect(0, 0, S, S);
    const id = g.getImageData(0, 0, S, S), d = id.data, r = mulberry32(17);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      // paper tooth: stretched noise + fine speckle
      const tooth = noise.n2(x * 0.09, y * 0.22) * 0.5 + noise.n2(x * 0.31 + 9, y * 0.37) * 0.35;
      const a = clamp(0.9 + tooth * 0.5 - r() * 0.32 * strength, 0.12, 1);
      d[(y * S + x) * 4 + 3] = a * 255;
    }
    g.putImageData(id, 0, 0);
    return c;
  });
  const key = 'sp-pat:' + col + strength;
  if (!ctx.__pats) ctx.__pats = {};
  if (!ctx.__pats[key]) ctx.__pats[key] = ctx.createPattern(tile, 'repeat');
  return ctx.__pats[key];
}
/** Paper pattern (world-anchored), for the background and for erasing. */
export function paperPattern(ctx) {
  if (ctx.__paperPat) return ctx.__paperPat;
  ctx.__paperPat = ctx.createPattern(paperTile(), 'repeat');
  return ctx.__paperPat;
}
/** Seamless drawing-paper tile: soft blotches and fibres wrap around the edges (no visible tile seams). */
export function paperTile(base = PAL.paper, S = 640) {
  return cached('sp-paper:' + base + S, () => {
    const c = makeCanvas(S, S), g = c.getContext('2d'), r = mulberry32(9);
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    const wrap = (fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) fn(ox, oy); };
    for (let i = 0; i < 22; i++) {
      const x = r() * S, y = r() * S, rad = 80 + r() * 220, dark = r() < 0.5, a = 0.025 * r();
      wrap((ox, oy) => { const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, dark ? `rgba(110,90,60,${a})` : `rgba(255,255,255,${a * 1.5})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); });
    }
    g.lineWidth = 1;
    for (let i = 0; i < 1400; i++) {
      const x = r() * S, y = r() * S, len = 5 + r() * 22, a = r() * TAU, col = r() < 0.55 ? `rgba(90,70,40,${0.05 * r()})` : `rgba(255,255,255,${0.1 * r()})`, b = (r() - 0.5) * 6;
      g.strokeStyle = col;
      wrap((ox, oy) => { if (x + ox < -30 || x + ox > S + 30 || y + oy < -30 || y + oy > S + 30) return; g.beginPath(); g.moveTo(x + ox, y + oy); g.quadraticCurveTo(x + ox + Math.cos(a) * len * 0.5 + b, y + oy + Math.sin(a) * len * 0.5, x + ox + Math.cos(a) * len, y + oy + Math.sin(a) * len); g.stroke(); });
    }
    const id = g.getImageData(0, 0, S, S), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    g.putImageData(id, 0, 0);
    return c;
  });
}
/** World-space rectangle currently visible through ctx's transform. */
export function viewRect(ctx, pad = 30) {
  const m = ctx.getTransform().inverse(), W = ctx.canvas.width, H = ctx.canvas.height;
  const pts = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2];
}
/** The sheet of paper (fills the visible world) + warm desk-lamp falloff in screen space. */
export function paper(ctx) {
  const [vx, vy, vw, vh] = viewRect(ctx, 4);
  ctx.save(); ctx.fillStyle = paperPattern(ctx); ctx.fillRect(vx, vy, vw, vh); ctx.restore();
}
/** A sheet of paper lying on a dark desk. rect = [x, y, w, h] in world coords. */
export function sheet(ctx, [x, y, w, h]) {
  const [vx, vy, vw, vh] = viewRect(ctx, 4);
  if (vx < x || vy < y || vx + vw > x + w || vy + vh > y + h) {
    ctx.fillStyle = '#3a332b'; ctx.fillRect(vx, vy, vw, vh);
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'; ctx.fillRect(x + 14, y + 22, w, h); ctx.globalAlpha = 0.2; ctx.fillRect(x + 6, y + 8, w + 10, h + 10); ctx.restore();
  }
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = paperPattern(ctx); ctx.fillRect(Math.max(x, vx), Math.max(y, vy), Math.min(x + w, vx + vw) - Math.max(x, vx), Math.min(y + h, vy + vh) - Math.max(y, vy));
  ctx.restore();
}
/** Desk-lamp light in screen space (warm top-left, gentle falloff). Draw it last, on a layer above the art. */
export function light(ctx, { strength = 1 } = {}) {
  const lamp = cached('sp-lamp', () => {
    const c = makeCanvas(270, 480), g = c.getContext('2d');
    const gr = g.createRadialGradient(70, 60, 20, 130, 210, 430);
    gr.addColorStop(0, 'rgba(255,250,235,0.22)'); gr.addColorStop(0.55, 'rgba(255,250,235,0)'); gr.addColorStop(1, 'rgba(90,70,40,0.16)');
    g.fillStyle = gr; g.fillRect(0, 0, 270, 480); return c;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = strength; ctx.drawImage(lamp, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
}

// ---------------------------------------------------------------- the timed sketch
let _font = null;
function measurer() { if (!_font) _font = makeCanvas(8, 8).getContext('2d'); return _font; }

/**
 * A drawing that draws itself over time.
 *   const d = new Sketch({ t0: 1.2, speed: 1500 });
 *   d.blue(G.circle(...)); d.line(pts, {w: 3}); d.hatch(poly, {ang, gap}); d.text('label', x, y, {size}); d.wait(0.2);
 *   d.draw(ctx, t)  -> tool {x, y, on, kind, col}  (where the pencil is)
 */
export class Sketch {
  constructor({ t0 = 0, speed = 1500, seed = 1, gap = 0.05, weight = 1.4 } = {}) {
    this.wk = weight; this.items = []; this.t = t0; this.t0 = t0; this.speed = speed; this.seed = seed; this.gapT = gap; this.k = 0;
  }
  _push(it, dur) {
    it.a = this.t; it.b = this.t + Math.max(0.02, dur); this.t = it.b + (it.gap ?? this.gapT); this.items.push(it);
    const pad = (it.w || 4) * 2;
    let bb = it.tr ? it.tr.bb : null;
    if (it.type === 'hatch') bb = it.trs.reduce((B, r) => [Math.min(B[0], r.bb[0]), Math.min(B[1], r.bb[1]), Math.max(B[2], r.bb[2]), Math.max(B[3], r.bb[3])], [Infinity, Infinity, -Infinity, -Infinity]);
    if (it.type === 'text') {
      const cs = Math.cos(it.rot), sn = Math.sin(it.rot);
      const cn = [[-10, -it.size * 1.1], [it.W + 10, -it.size * 1.1], [it.W + 10, it.size * 0.45], [-10, it.size * 0.45]].map(([dx, dy]) => [it.x0 + dx * cs - dy * sn, it.y + dx * sn + dy * cs]);
      bb = [Math.min(...cn.map((q) => q[0])), Math.min(...cn.map((q) => q[1])), Math.max(...cn.map((q) => q[0])), Math.max(...cn.map((q) => q[1]))];
    }
    if (bb) { it.bb = [bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad]; this.bb = this.bb ? [Math.min(this.bb[0], it.bb[0]), Math.min(this.bb[1], it.bb[1]), Math.max(this.bb[2], it.bb[2]), Math.max(this.bb[3], it.bb[3])] : [...it.bb]; }
    this._bake = null;
    return it;
  }
  /**
   * Like draw(), but once the sketch is finished (and the camera is not zoomed in past `maxZoom`) it is drawn
   * from a cached raster: wide shots of a page full of drawings stay cheap.
   */
  drawBaked(ctx, t, o = {}) {
    const m = ctx.getTransform(), zoom = Math.hypot(m.a, m.b) * (o.s || 1);
    if (t < this.end + 0.02 || zoom > (o.maxZoom ?? 1.15) || !this.bb || o.fade) return this.draw(ctx, t, o);
    if (!this._bake) {
      const R = 1.15, [x0, y0, x1, y1] = this.bb;
      const c = makeCanvas(Math.ceil((x1 - x0) * R), Math.ceil((y1 - y0) * R)), g = c.getContext('2d');
      g.scale(R, R); g.translate(-x0, -y0);
      this.draw(g, this.end + 1, { alpha: 1 });
      this._bake = { c, x0, y0, w: x1 - x0, h: y1 - y0 };
    }
    const { alpha = 1, tx = 0, ty = 0, rot = 0, s = 1, px = 0, py = 0 } = o;
    const [vx, vy, vw, vh] = viewRect(ctx, 40), B = this._bake;
    ctx.save();
    if (tx || ty || rot || s !== 1) { ctx.translate(px + tx, py + ty); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-px, -py); }
    else if (B.x0 > vx + vw || B.x0 + B.w < vx || B.y0 > vy + vh || B.y0 + B.h < vy) { ctx.restore(); return this.tool(t, o); }
    ctx.globalAlpha = alpha; ctx.drawImage(B.c, B.x0, B.y0, B.w, B.h);
    ctx.restore();
    return this.tool(t, o);
  }
  get end() { return this.items.length ? Math.max(...this.items.map((i) => i.b)) : this.t0; }
  wait(s) { this.t += s; return this; }
  /** continue the schedule at absolute time t (never earlier than the current end: items stay sequential) */
  at(t) { this.t = Math.max(this.t, t); return this; }
  /** graphite line. o: {w, tone, col, sketch (wobble amp), over, double, speed, dur, gap} */
  line(pts, o = {}) {
    const sd = this.seed * 100 + this.k++;
    const p = o.raw ? pts : sketchy(pts, { amp: o.sketch ?? 1.4, seed: sd, over: o.over ?? 5 });
    const tr = track(p, 4);
    const it = { type: 'line', tr, w: (o.w ?? 3.2) * (o.blue ? 1 : this.wk), tone: o.tone ?? 1, col: o.col || PAL.lead, double: o.double ?? 0, seed: sd, gap: o.gap };
    if (it.double) it.tr2 = track(sketchy(pts, { amp: (o.sketch ?? 1.4) + 1.2, seed: sd + 50, over: (o.over ?? 5) * 1.6 }), 4);
    return this._push(it, o.dur ?? Math.max(0.03, tr.len / (o.speed || this.speed)));
  }
  /** red pencil accent */
  red(pts, o = {}) { return this.line(pts, { col: PAL.red, w: 3.4, ...o }); }
  /** light-blue construction line (drawn fast and light, under everything) */
  blue(pts, o = {}) { return this.line(pts, { col: PAL.blue, w: 2, tone: 0.55, sketch: 2, over: 14, speed: (o.speed || this.speed * 1.6), ...o, blue: true }); }
  /** hatching (and cross-hatching with o.cross = second angle) */
  hatch(poly, o = {}) {
    const segs = hatchLines(poly, { seed: this.seed * 31 + this.k++, ...o });
    let all = segs;
    if (o.cross !== undefined) all = segs.concat(hatchLines(poly, { ...o, ang: o.cross, seed: this.seed * 57 + this.k++ }));
    const trs = all.map((s) => track(s, 5));
    const per = o.per ?? 0.028;
    return this._push({ type: 'hatch', trs, w: (o.w ?? 1.7) * Math.sqrt(this.wk), tone: o.tone ?? 0.75, col: o.col || PAL.lead, per, gap: o.gap2 }, o.dur ?? trs.length * per + 0.1);
  }
  /** handwriting. o: {size, font, col, align, cps (chars/s), tone} */
  text(str, x, y, o = {}) {
    const size = o.size ?? 56, font = o.font || 'Caveat', weight = o.weight ?? 700;
    const m = measurer(); m.font = `${weight} ${size}px '${font}'`; if (o.spacing) m.letterSpacing = o.spacing + 'px'; else m.letterSpacing = '0px';
    const pre = [0]; for (let i = 1; i <= str.length; i++) pre.push(m.measureText(str.slice(0, i)).width);
    const W = pre[str.length];
    const x0 = o.align === 'center' ? x - W / 2 : o.align === 'right' ? x - W : x;
    const it = { type: 'text', str, x0, y, size, font, weight, pre, W, col: o.col || PAL.lead, tone: o.tone ?? 0.95, spacing: o.spacing || 0, rot: o.rot || 0, gap: o.gap };
    return this._push(it, o.dur ?? str.length / (o.cps ?? 16));
  }
  /** rub out: the eraser travels along `path` (points) with width w; afterwards that area is clean paper */
  erase(path, o = {}) {
    const tr = track(path, 6);
    const it = this._push({ type: 'erase', tr, w: o.w ?? 60, rubs: o.rubs ?? 5, gap: o.gap }, o.dur ?? 1.2);
    for (const tg of o.targets || []) tg.erasedBy = it; // these items are gone once the rubbing is done
    return it;
  }

  /** Draw at time t. o: {alpha, tx, ty, rot, s, px, py (pivot), hide:[items]} Returns the tool state in world coords. */
  draw(ctx, t, o = {}) {
    const { alpha = 1, tx = 0, ty = 0, rot = 0, s = 1, px = 0, py = 0, fade = null } = o;
    if (t < this.t0 - 0.001) return this.tool(t, o);
    ctx.save();
    if (tx || ty || rot || s !== 1) { ctx.translate(px + tx, py + ty); ctx.rotate(rot); ctx.scale(s, s); ctx.translate(-px, -py); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const [vx, vy, vw, vh] = viewRect(ctx, 40);
    for (const it of this.items) {
      if (t < it.a) continue;
      if (it.erasedBy && t >= it.erasedBy.b) continue;
      const u = clamp((t - it.a) / (it.b - it.a));
      const a = alpha * (fade ? fade(it) : 1);
      if (a <= 0.003) continue;
      if (it.type === 'erase') { drawErase(ctx, it, u, a); continue; }
      if (it.bb && (it.bb[2] < vx || it.bb[0] > vx + vw || it.bb[3] < vy || it.bb[1] > vy + vh)) continue;
      if (it.type === 'line') drawLead(ctx, it, u, a);
      else if (it.type === 'hatch') drawHatch(ctx, it, t, a);
      else if (it.type === 'text') drawWriting(ctx, it, u, a);
    }
    ctx.restore();
    return this.tool(t, o);
  }
  /** Where the pencil tip is at t (world coords, after the draw transform). on = touching paper. */
  tool(t, o = {}) {
    const its = this.items;
    let st = null;
    if (!its.length || t < its[0].a - 0.5) st = null;
    else {
      for (let i = 0; i < its.length; i++) {
        const it = its[i];
        if (t >= it.a && t <= it.b) { st = { ...tipOf(it, (t - it.a) / (it.b - it.a), t), on: true, kind: it.type, col: it.col, it }; break; }
        const nx = its[i + 1];
        if (t > it.b && nx && t < nx.a) { // travelling between items: lifted
          const e = tipOf(it, 1, t), s = tipOf(nx, 0, t), f = ease.inOutSine(clamp((t - it.b) / (nx.a - it.b)));
          st = { x: lerp(e.x, s.x, f), y: lerp(e.y, s.y, f), on: false, lift: Math.sin(f * Math.PI), kind: 'move', col: nx.col }; break;
        }
        if (t < it.a && i === 0) { const s = tipOf(it, 0, t); st = { ...s, on: false, lift: clamp((it.a - t) / 0.5), kind: 'move', col: it.col, pre: true }; break; }
      }
      if (!st) { const l = its[its.length - 1], e = tipOf(l, 1, t); st = { ...e, on: false, lift: clamp((t - l.b) / 0.4), kind: 'done', col: l.col, after: t - l.b }; }
    }
    if (!st) return null;
    const { tx = 0, ty = 0, rot = 0, s = 1, px = 0, py = 0 } = o;
    if (tx || ty || rot || s !== 1) { const dx = (st.x - px) * s, dy = (st.y - py) * s; st.x = px + tx + dx * Math.cos(rot) - dy * Math.sin(rot); st.y = py + ty + dx * Math.sin(rot) + dy * Math.cos(rot); }
    return st;
  }
}
function tipOf(it, u, t) {
  u = clamp(u);
  if (it.type === 'line') { const [x, y] = pointAt(it.tr, u * it.tr.len); return { x, y }; }
  if (it.type === 'erase') { const [x, y] = pointAt(it.tr, eraseU(it, u) * it.tr.len); return { x, y }; }
  if (it.type === 'hatch') {
    const n = it.trs.length, k = Math.min(n - 1, Math.floor(u * n)), f = u * n - k, tr = it.trs[k];
    const [x, y] = pointAt(tr, clamp(f * 1.25) * tr.len); return { x, y };
  }
  if (it.type === 'text') {
    const n = it.str.length, k = Math.min(n - 1, Math.floor(u * n)), f = u * n - k;
    const dx = lerp(it.pre[k], it.pre[k + 1], f), dy = -it.size * 0.28 + Math.sin(u * n * Math.PI * 2) * it.size * 0.16;
    if (!it.rot) return { x: it.x0 + dx, y: it.y + dy };
    return { x: it.x0 + dx * Math.cos(it.rot) - dy * Math.sin(it.rot), y: it.y + dx * Math.sin(it.rot) + dy * Math.cos(it.rot) };
  }
  return { x: 0, y: 0 };
}
const eraseU = (it, u) => { const r = it.rubs; return clamp(u + Math.sin(u * r * TAU) * 0.08 * Math.sin(u * Math.PI)); };

function drawLead(ctx, it, u, a) {
  const L = u * it.tr.len;
  const pat = leadPattern(ctx, it.col);
  ctx.strokeStyle = pat;
  const len = it.tr.len, tone = it.tone;
  // pass 1: whole stroke, light and thinner
  ctx.globalAlpha = a * 0.78 * tone; ctx.lineWidth = it.w * 0.72;
  ctx.beginPath(); tracePart(ctx, it.tr, 0, L); ctx.stroke();
  // pass 2: the pressed middle: darker and wider (tapers at both ends)
  const m0 = len * 0.12, m1 = Math.min(L, len * 0.86);
  if (m1 > m0) { ctx.globalAlpha = a * 0.86 * tone; ctx.lineWidth = it.w; ctx.beginPath(); tracePart(ctx, it.tr, m0, m1); ctx.stroke(); }
  if (it.tr2) { const L2 = u * it.tr2.len; ctx.globalAlpha = a * 0.38 * tone; ctx.lineWidth = it.w * 0.55; ctx.beginPath(); tracePart(ctx, it.tr2, 0, L2); ctx.stroke(); }
}
function drawHatch(ctx, it, t, a) {
  const n = it.trs.length, u = clamp((t - it.a) / (it.b - it.a)), done = Math.floor(u * n);
  ctx.strokeStyle = leadPattern(ctx, it.col); ctx.lineWidth = it.w; ctx.globalAlpha = a * it.tone;
  ctx.beginPath();
  for (let i = 0; i < Math.min(n, done); i++) tracePart(ctx, it.trs[i], 0, it.trs[i].len);
  if (done < n) { const f = clamp((u * n - done) * 1.25); tracePart(ctx, it.trs[done], 0, f * it.trs[done].len); }
  ctx.stroke();
}
function drawWriting(ctx, it, u, a) {
  const n = it.str.length, k = Math.min(n, Math.floor(u * n)), f = u * n - k;
  const rx = it.x0 + (k >= n ? it.W + 20 : lerp(it.pre[k], it.pre[k + 1], f));
  ctx.save();
  if (it.rot) { ctx.translate(it.x0, it.y); ctx.rotate(it.rot); ctx.translate(-it.x0, -it.y); }
  ctx.beginPath(); ctx.rect(it.x0 - 20, it.y - it.size * 1.3, rx - it.x0 + 20, it.size * 2); ctx.clip();
  ctx.font = `${it.weight} ${it.size}px '${it.font}'`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = it.spacing + 'px';
  ctx.fillStyle = leadPattern(ctx, it.col); ctx.globalAlpha = a * it.tone;
  ctx.fillText(it.str, it.x0, it.y);
  ctx.restore();
}
function drawErase(ctx, it, u, a) {
  const L = eraseU(it, u) * it.tr.len;
  if (L <= 0) return;
  if (u >= 1) { // done: only a faint smudge and a few crumbs remain
    ctx.save(); ctx.globalAlpha = a * 0.07; ctx.strokeStyle = PAL.mid; ctx.lineWidth = it.w * 1.2;
    ctx.beginPath(); tracePart(ctx, it.tr, 0, it.tr.len); ctx.stroke();
    ctx.fillStyle = '#d6cfbf'; ctx.globalAlpha = a * 0.8;
    for (let i = 0; i < 9; i++) { const p = pointAt(it.tr, hrand(i, 7) * it.tr.len); ctx.beginPath(); ctx.ellipse(p[0] + (hrand(i, 3) - 0.5) * it.w * 2.2, p[1] + it.w * 0.7 + hrand(i, 4) * it.w, 3 + hrand(i, 5) * 4, 1.8, hrand(i, 8) * 3, 0, TAU); ctx.fill(); }
    ctx.restore(); return;
  }
  // smudge: a wider grey haze, then clean paper on top
  ctx.save();
  ctx.globalAlpha = a * 0.13; ctx.strokeStyle = PAL.mid; ctx.lineWidth = it.w * 1.35;
  ctx.beginPath(); tracePart(ctx, it.tr, 0, it.tr.len * clamp(u * 1.1)); ctx.stroke();
  ctx.globalAlpha = a; ctx.strokeStyle = paperPattern(ctx); ctx.lineWidth = it.w;
  ctx.beginPath(); tracePart(ctx, it.tr, 0, it.tr.len * clamp(u * 1.1)); ctx.stroke();
  ctx.globalAlpha = a * 0.07; ctx.strokeStyle = PAL.mid; ctx.lineWidth = it.w * 0.7;
  ctx.beginPath(); tracePart(ctx, it.tr, 0, it.tr.len * clamp(u * 1.1)); ctx.stroke();
  // crumbs along the path
  ctx.fillStyle = '#d9d2c3'; ctx.globalAlpha = a * 0.9;
  for (let i = 0; i < 26; i++) {
    const p = pointAt(it.tr, hrand(i, 7) * L);
    const ox = (hrand(i, 3) - 0.5) * it.w * 1.6, oy = (hrand(i, 4) - 0.5) * it.w * 1.6;
    ctx.beginPath(); ctx.ellipse(p[0] + ox, p[1] + oy, 3 + hrand(i, 5) * 5, 1.6 + hrand(i, 6) * 2, hrand(i, 8) * 3, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- props
/** A real pencil whose graphite point sits at (x, y). ang: direction from tip to the end (radians). */
export function pencil(ctx, x, y, { ang = -1.0, lift = 0, col = 'yellow', s = 1, alpha = 1 } = {}) {
  const spr = pencilSprite(col);
  const sh = pencilShadow(col);
  ctx.save(); ctx.globalAlpha = alpha;
  // shadow falls down-right; further away when lifted
  const d = 14 + lift * 30;
  ctx.save(); ctx.translate(x + d * 0.9 * s, y + d * 1.2 * s); ctx.rotate(ang); ctx.scale(s, s); ctx.globalAlpha = alpha * (0.32 - lift * 0.1);
  ctx.drawImage(sh, -30, -40, 640, 80); ctx.restore();
  ctx.translate(x, y - lift * 18 * s); ctx.rotate(ang); ctx.scale(s, s);
  ctx.drawImage(spr.c, -spr.ox, -spr.oy, spr.w, spr.h);
  ctx.restore();
}
function pencilSprite(col) {
  return cached('sp-pencil:' + col, () => {
    const R = 1.5, w = 600, h = 60, c = makeCanvas(w * R, h * R), g = c.getContext('2d');
    g.scale(R, R); g.translate(6, h / 2);
    const body = col === 'red' ? ['#e05a44', '#c4402b', '#8f2618'] : ['#f6cf4a', '#e6b52c', '#b98614'];
    const half = 15;
    // wood cone
    g.beginPath(); g.moveTo(0, 0); g.lineTo(62, -half); g.lineTo(62, half); g.closePath();
    const wg = g.createLinearGradient(0, -half, 0, half); wg.addColorStop(0, '#f2d9b3'); wg.addColorStop(0.5, '#e6c497'); wg.addColorStop(1, '#bf9562');
    g.fillStyle = wg; g.fill();
    // scalloped edge of the paint
    g.fillStyle = body[1];
    g.beginPath(); g.moveTo(70, -half);
    for (let i = 0; i <= 6; i++) { const yy = -half + (i / 6) * half * 2; g.lineTo(i % 2 ? 58 : 64, yy); }
    g.lineTo(70, half); g.closePath(); g.fill();
    // graphite point
    g.beginPath(); g.moveTo(0, 0); g.lineTo(20, -5); g.lineTo(20, 5); g.closePath();
    g.fillStyle = col === 'red' ? '#b8341f' : '#3b3c40'; g.fill();
    // hexagonal body: three facets
    const L0 = 64, L1 = 470;
    g.fillStyle = body[0]; g.fillRect(L0, -half, L1 - L0, half * 0.66);
    g.fillStyle = body[1]; g.fillRect(L0, -half * 0.34, L1 - L0, half * 0.68);
    g.fillStyle = body[2]; g.fillRect(L0, half * 0.34, L1 - L0, half * 0.66);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(L0, -half * 0.86, L1 - L0, 2.5);
    // ferrule
    const fg = g.createLinearGradient(0, -half, 0, half); fg.addColorStop(0, '#e9e9e4'); fg.addColorStop(0.45, '#b9bab6'); fg.addColorStop(1, '#77786f');
    g.fillStyle = fg; g.fillRect(L1, -half - 1, 46, half * 2 + 2);
    g.strokeStyle = 'rgba(60,60,55,0.55)'; g.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(L1 + 8 + i * 7, -half); g.lineTo(L1 + 8 + i * 7, half); g.stroke(); }
    // eraser
    g.fillStyle = '#e88f8a'; g.beginPath(); g.moveTo(L1 + 46, -half + 1); g.lineTo(L1 + 74, -half + 3); g.quadraticCurveTo(L1 + 82, 0, L1 + 74, half - 3); g.lineTo(L1 + 46, half - 1); g.closePath(); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(L1 + 46, half * 0.3, 30, half * 0.6);
    return { c, w, h, ox: 6, oy: h / 2 };
  });
}
function pencilShadow(col) {
  return cached('sp-pencil-sh', () => {
    const c = makeCanvas(80, 10), g = c.getContext('2d');
    g.fillStyle = '#2a2015'; g.filter = 'blur(1.5px)';
    g.beginPath(); g.moveTo(4, 5); g.lineTo(12, 2.8); g.lineTo(76, 2.8); g.lineTo(76, 7.2); g.lineTo(12, 7.2); g.closePath(); g.fill();
    return c;
  });
}

/** Clear plastic ruler. (x1,y1)->(x2,y2) is the drawing edge; the ruler lies on the left side of that direction. */
export function ruler(ctx, x1, y1, x2, y2, { alpha = 1, width = 86, ext = 60 } = {}) {
  if (alpha <= 0) return;
  const ang = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1) + ext * 2;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x1, y1); ctx.rotate(ang); ctx.translate(-ext, 0);
  ctx.fillStyle = 'rgba(40,40,30,0.10)'; ctx.fillRect(6, -width + 8, L, width); // shadow
  ctx.fillStyle = 'rgba(214,232,236,0.42)'; ctx.fillRect(0, -width, L, width);
  ctx.strokeStyle = 'rgba(90,110,120,0.55)'; ctx.lineWidth = 2; ctx.strokeRect(0, -width, L, width);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, -width + 4, L, 6);
  ctx.strokeStyle = 'rgba(40,50,60,0.75)'; ctx.lineWidth = 1.4;
  ctx.font = "600 15px 'Inter'"; ctx.fillStyle = 'rgba(40,50,60,0.75)'; ctx.textAlign = 'center';
  for (let i = 0, mm = 0; i < L - 10; i += 9, mm++) {
    const h = mm % 10 === 0 ? 24 : mm % 5 === 0 ? 16 : 9;
    ctx.beginPath(); ctx.moveTo(10 + i, 0); ctx.lineTo(10 + i, -h); ctx.stroke();
    if (mm % 10 === 0) ctx.fillText(String(mm / 10), 10 + i, -34);
  }
  ctx.restore();
}

/** Block eraser (white vinyl with a paper sleeve) at (x,y), rotated. */
export function eraser(ctx, x, y, { rot = -0.5, alpha = 1, lift = 0 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(40,30,20,0.18)'; roundBox(ctx, -44 + 10 + lift * 18, -26 + 14 + lift * 22, 140, 64, 10); ctx.fill();
  ctx.translate(0, -lift * 14);
  ctx.fillStyle = PAL.eraser; roundBox(ctx, -44, -30, 140, 60, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(70,60,50,0.35)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#3f6fae'; ctx.fillRect(4, -31, 92, 62);
  ctx.fillStyle = '#f7f3ea'; ctx.font = "800 22px 'Inter'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ERASER', 50, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(-44, 10, 48, 20);
  ctx.restore();
}
function roundBox(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

/** Draw the pencil for a tool state returned by Sketch.draw (null = no pencil). Leaves the frame when done. */
export function pencilFor(ctx, st, t, { s = 1, exit = 0.5, base = -1.0 } = {}) {
  if (!st) return;
  if (st.kind === 'erase') return;
  let { x, y } = st, lift = st.on ? 0 : (st.lift ?? 1) * 0.9;
  if (st.after !== undefined && st.after > exit) { const f = ease.inCubic(clamp((st.after - exit) / 0.7)); x += f * 700 * s; y += f * 500 * s; lift = 1; if (f >= 1) return; }
  if (st.pre) { const f = ease.outCubic(1 - st.lift); x += (1 - f) * 700 * s; y += (1 - f) * 500 * s; }
  const wob = st.on ? noise.n2(t * 6, 3) * 0.05 : 0;
  pencil(ctx, x, y, { ang: base + wob + (st.kind === 'hatch' ? 0.12 : 0), lift, col: st.col === PAL.red ? 'red' : 'yellow', s });
}

// ---------------------------------------------------------------- the sketch figure (cartoon engineer)
/**
 * Pencil-drawn figure in the cartoon-sketch manner (big round head, glasses, hatched hair, outlined limbs).
 * pose: {x, y (feet), s, lean, look (-1..1), arms:[[a1,a2],[a1,a2]] (0 = hanging down, + = forward/right),
 *        legs:[[a1,a2],[..]], sit (0..1), face: 'smile'|'open'|'focus'|'wow'|'worried', blink}
 * Returns point lists: {lines:[[pts,w],...], hatch:[poly...], blue:[pts...]} in world coords.
 */
export function figure(p) {
  const { x, y, s = 1, lean = 0, look = 0, face = 'smile', sit = 0, blink = 0, mouth = 0 } = p;
  const arms = p.arms || [[0.25, 0.3], [-0.2, -0.25]], legs = p.legs || [[0.08, 0], [-0.08, 0]];
  const T = (px, py) => { const X = px * s, Y = py * s; return [x + X * Math.cos(lean) - Y * Math.sin(lean), y + X * Math.sin(lean) + Y * Math.cos(lean)]; };
  const lines = [], hatch = [], blue = [];
  const hip = [0, -150 + sit * 60], neck = [0, -330 + sit * 60], head = [look * 6, -420 + sit * 60];
  const R = 88;
  blue.push(G.circle(...T(head[0], head[1]), R * s + 8, -0.5, 0.4));
  blue.push([T(0, -500 + sit * 60), T(0, 0)]);
  // legs (outlined tubes)
  legs.forEach(([a1, a2], i) => {
    const hx = hip[0] + (i ? -22 : 22), hy = hip[1];
    const k = [hx + Math.sin(a1) * 80, hy + Math.cos(a1) * 80], f = [k[0] + Math.sin(a1 + a2) * 76, k[1] + Math.cos(a1 + a2) * 76];
    lines.push([tube([[hx, hy], k, f], 17).map((q) => T(...q)), 2.6]);
    lines.push([G.ellipse(f[0] + 14, f[1] + 6, 30, 13, 3.2, 0.15).map((q) => T(...q)), 2.8]); // shoe
  });
  // torso: shirt
  lines.push([G.spline([[-58, -326 + sit * 60], [-74, -250 + sit * 60], [-70, -150 + sit * 60], [0, -142 + sit * 60], [70, -150 + sit * 60], [74, -250 + sit * 60], [58, -326 + sit * 60], [0, -334 + sit * 60], [-58, -326 + sit * 60]], 6).map((q) => T(...q)), 3]);
  lines.push([[T(-26, -330 + sit * 60), T(0, -296 + sit * 60), T(26, -330 + sit * 60)], 2.4]); // collar
  lines.push([[T(0, -296 + sit * 60), T(0, -170 + sit * 60)], 1.6]); // placket
  // shorts / trousers band
  lines.push([[T(-70, -170 + sit * 60), T(70, -170 + sit * 60)], 2]);
  // arms
  arms.forEach(([a1, a2], i) => {
    const sh = [i ? -58 : 58, -306 + sit * 60];
    const e = [sh[0] + Math.sin(a1) * 84, sh[1] + Math.cos(a1) * 84];
    const w = [e[0] + Math.sin(a1 + a2) * 78, e[1] + Math.cos(a1 + a2) * 78];
    lines.push([tube([sh, e, w], 15).map((q) => T(...q)), 2.6]);
    lines.push([G.circle(w[0] + Math.sin(a1 + a2) * 10, w[1] + Math.cos(a1 + a2) * 10, 17, 0, 0.2).map((q) => T(...q)), 2.6]); // hand
  });
  // head
  const [hx, hy] = head;
  lines.push([G.circle(hx, hy, R, -1.9, 0.3).map((q) => T(...q)), 3.2]);
  lines.push([G.arc(hx - R - 2, hy + 6, 14, 20, 1.6, 4.7).map((q) => T(...q)), 2.4]); // ear
  lines.push([G.arc(hx + R + 2, hy + 6, 14, 20, -1.5, 1.6).map((q) => T(...q)), 2.4]);
  // hair cap (hatched) + cowlick
  const cap = G.arc(hx, hy, R - 2, R - 2, Math.PI + 0.12, TAU - 0.12, 20).concat([[hx + R * 0.6, hy - R * 0.28], [hx + 10, hy - R * 0.5], [hx - R * 0.6, hy - R * 0.25]]);
  hatch.push(cap.map((q) => T(...q)));
  lines.push([G.bez([hx + 4, hy - R], [hx - 10, hy - R - 40], [hx + 26, hy - R - 52], [hx + 20, hy - R - 26]).map((q) => T(...q)), 2.4]);
  // glasses
  const gx = hx + look * 14, gy = hy + 8;
  lines.push([G.circle(gx - 34, gy, 27, -2, 0.3).map((q) => T(...q)), 2.6]);
  lines.push([G.circle(gx + 34, gy, 27, -2, 0.3).map((q) => T(...q)), 2.6]);
  lines.push([[T(gx - 7, gy - 2), T(gx + 7, gy - 2)], 2.2]);
  // eyes
  const ex = look * 8;
  if (blink > 0.5 || face === 'focus') {
    lines.push([[T(gx - 46 + ex, gy + 2), T(gx - 24 + ex, gy + 2)], 2.8]); lines.push([[T(gx + 24 + ex, gy + 2), T(gx + 46 + ex, gy + 2)], 2.8]);
  } else {
    const er = face === 'wow' ? 9 : 6.5;
    lines.push([G.circle(gx - 34 + ex, gy + 1, er, 0, 0.4).map((q) => T(...q)), 4]); lines.push([G.circle(gx + 34 + ex, gy + 1, er, 0, 0.4).map((q) => T(...q)), 4]);
  }
  // brows
  const bw = face === 'worried' ? 0.25 : face === 'focus' ? -0.2 : 0;
  lines.push([[T(gx - 50, gy - 40 + bw * 30), T(gx - 20, gy - 44 - bw * 20)], 2.4]);
  lines.push([[T(gx + 20, gy - 44 - bw * 20), T(gx + 50, gy - 40 + bw * 30)], 2.4]);
  // mouth
  const mx = hx + look * 10, my = hy + 52;
  if (face === 'wow' || mouth > 0.3) lines.push([G.ellipse(mx, my, 13, 10 + mouth * 8, -1.4, 0.1).map((q) => T(...q)), 2.6]);
  else if (face === 'worried') lines.push([G.arc(mx, my + 14, 18, 10, -2.6, -0.5).map((q) => T(...q)), 2.6]);
  else if (face === 'focus') lines.push([[T(mx - 12, my), T(mx + 10, my + 2)], 2.6]);
  else lines.push([G.arc(mx, my - 8, 20, 14, 0.4, 2.7).map((q) => T(...q)), 2.6]);
  // cheeks (light hatch)
  return { lines, hatch, blue };
}
/** Outline of a limb through 3 joints with radius r (closed loop with a round end). */
export function tube(j, r) {
  const L = [], Rr = [];
  for (let i = 0; i < j.length; i++) {
    const a = j[Math.max(0, i - 1)], b = j[Math.min(j.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const rr = r * (1 - i * 0.08);
    L.push([j[i][0] - dy * rr, j[i][1] + dx * rr]); Rr.push([j[i][0] + dy * rr, j[i][1] - dx * rr]);
  }
  const e = j[j.length - 1], p = j[j.length - 2], ang = Math.atan2(e[1] - p[1], e[0] - p[0]), re = r * (1 - (j.length - 1) * 0.08);
  const cap = []; for (let i = 0; i <= 6; i++) { const a = ang + Math.PI / 2 - (i / 6) * Math.PI; cap.push([e[0] + Math.cos(a) * re, e[1] + Math.sin(a) * re]); }
  return [...L.slice(0, -1), ...cap.reverse(), ...Rr.slice(0, -1).reverse()];
}
/**
 * Draw a figure for this frame. reveal 0..1 draws it on (construction -> lines -> hair hatch) and returns the
 * pencil tip; at reveal 1 it is fully drawn and can keep acting (pose changes) with a light boil.
 */
export function figureDraw(ctx, pose, t, { reveal = 1, alpha = 1, boil = 0.7 } = {}) {
  const f = figure(pose), S = pose.s || 1;
  const fb = Math.floor(t * 12);
  const units = [];
  f.blue.forEach((p) => units.push({ k: 'b', p, wt: 0.35 }));
  f.lines.forEach(([p, w]) => units.push({ k: 'l', p, w, wt: 1 }));
  f.hatch.forEach((p) => p.length > 2 && units.push({ k: 'h', p, wt: 1.6 }));
  const total = units.reduce((a, u) => a + u.wt, 0);
  let budget = reveal * total, tip = null;
  const dry = !ctx;
  if (dry) ctx = NULLCTX;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const u of units) {
    if (budget <= 0) break;
    const frac = clamp(budget / u.wt); budget -= u.wt;
    if (u.k === 'h') {
      const segs = hatchLines(u.p, { ang: -0.8, gap: 8 * S + 2, seed: 4 }), n = Math.ceil(segs.length * frac);
      if (!dry) { ctx.strokeStyle = leadPattern(ctx, PAL.lead); ctx.globalAlpha = alpha * 0.6; ctx.lineWidth = 1.6; }
      if (!dry) { ctx.beginPath(); for (let i = 0; i < n; i++) { const g = segs[i]; ctx.moveTo(g[0][0], g[0][1]); ctx.lineTo(g[1][0], g[1][1]); ctx.lineTo(g[2][0], g[2][1]); } ctx.stroke(); }
      if (frac < 1 && n) tip = { x: segs[n - 1][2][0], y: segs[n - 1][2][1] };
      continue;
    }
    const tr = track(u.p, 5), L = frac * tr.len;
    const jit = (i) => [(hrand(i, fb, u.wt * 7 + (u.w || 1)) - 0.5) * boil, (hrand(i, fb + 3, u.w || 1) - 0.5) * boil];
    if (!dry) {
      if (u.k === 'b') { ctx.strokeStyle = leadPattern(ctx, PAL.blue); ctx.globalAlpha = alpha * 0.35; ctx.lineWidth = 2; }
      else { ctx.strokeStyle = leadPattern(ctx, PAL.lead); ctx.globalAlpha = alpha * 0.92; ctx.lineWidth = u.w * S * 1.5; }
      ctx.beginPath(); tracePart(ctx, tr, 0, L, jit); ctx.stroke();
    }
    if (frac < 1) { const [x, y] = pointAt(tr, L); tip = { x, y }; }
  }
  ctx.restore();
  return tip ? { ...tip, on: true, kind: 'line', col: PAL.lead } : null;
}
const NULLCTX = { save() {}, restore() {}, set lineCap(v) {}, set lineJoin(v) {} };
/** Pencil tip while a figure draws itself on (no drawing). */
export const figureTip = (pose, reveal) => figureDraw(null, pose, 0, { reveal: Math.min(0.999, reveal) });

/**
 * One pencil for the whole short: register every sketch (and figure reveal); at(t) says where the pencil is,
 * travelling lifted between drawings, sliding in before the first and out after the last.
 */
export class Pen {
  constructor() { this.tr = []; }
  add(a, b, tool) { this.tr.push({ a, b, tool }); this.tr.sort((p, q) => p.a - q.a); return this; }
  sketch(d, opts = () => ({})) { if (d.items.length) this.add(d.items[0].a, d.end, (t) => d.tool(t, opts(t))); return this; }
  at(t, { enter = 0.6, exit = 1.4, travel = 1.8 } = {}) {
    const T = this.tr;
    // a drawing whose stroke is touching the paper right now wins; otherwise the latest one that is moving
    let best = null;
    for (const k of T) if (t >= k.a && t <= k.b) { const st = k.tool(t); if (!st || st.kind === 'done' || st.pre) continue; if (st.on || !best || !best.on) best = st; }
    if (best) return best;
    let prev = null, next = null;
    for (const k of T) { if (k.b < t && (!prev || k.b > prev.b)) prev = k; if (k.a > t && (!next || k.a < next.a)) next = k; }
    if (prev && next && next.a - prev.b < travel) {
      const e = prev.tool(prev.b), s = next.tool(next.a), f = ease.inOutSine(clamp((t - prev.b) / (next.a - prev.b)));
      if (e && s) return { x: lerp(e.x, s.x, f), y: lerp(e.y, s.y, f), on: false, lift: Math.sin(f * Math.PI) * 0.8 + 0.2, kind: 'move', col: s.col };
    }
    if (prev && t - prev.b < exit) { const e = prev.tool(prev.b); if (e) return { ...e, on: false, kind: 'done', after: t - prev.b, lift: clamp((t - prev.b) / 0.4) }; }
    if (next && next.a - t < enter) { const s = next.tool(next.a); if (s) return { ...s, on: false, pre: true, lift: clamp((next.a - t) / enter), kind: 'move' }; }
    return null;
  }
}

// ---------------------------------------------------------------- camera + marks
/** Camera that puts world (x,y) at screen (540, fy) with zoom z. */
export function cam(ctx, x, y, z = 1, rot = 0, fy = 760) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y);
}
/** Animator's sheet marks in screen space: scene label + circled frame number (top), timing scale (left). */
export function sheetMarks(ctx, t, { scene = 'SC 09', fps = 12, alpha = 0.55 } = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha;
  ctx.fillStyle = leadPattern(ctx, PAL.mid); ctx.strokeStyle = leadPattern(ctx, PAL.mid);
  ctx.font = "700 40px 'Caveat'"; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  const fr = String(Math.floor(t * fps) + 1).padStart(3, '0');
  ctx.fillText(scene, 868, 92);
  ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(924, 92, 46, 28, -0.05, 0, TAU); ctx.stroke();
  ctx.textAlign = 'center'; ctx.fillText(fr, 924, 94);
  // timing ticks
  ctx.lineWidth = 1.8; ctx.font = "700 22px 'Caveat'"; ctx.textAlign = 'left';
  ctx.beginPath(); ctx.moveTo(52, 70); ctx.lineTo(52, 300); ctx.stroke();
  for (let i = 0; i <= 11; i++) { const yy = 70 + i * 21; ctx.beginPath(); ctx.moveTo(52, yy); ctx.lineTo(i % 2 ? 64 : 74, yy); ctx.stroke(); if (i % 2 === 0) ctx.fillText(String(i + 1), 80, yy + 1); }
  ctx.restore();
}
/** Pencil-graphite handwriting drawn immediately (no reveal). */
export function note(ctx, str, x, y, { size = 52, col = PAL.lead, align = 'center', alpha = 1, font = 'Caveat', weight = 700, rot = 0 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px '${font}'`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillStyle = leadPattern(ctx, col); ctx.fillText(str, 0, 0);
  ctx.restore();
}
/** Soft smudge sprite (graphite rubbed with a finger). */
export function smudge(ctx, x, y, r, { alpha = 0.18, rot = 0, sx = 1.6 } = {}) {
  const spr = cached('sp-smudge', () => {
    const c = makeCanvas(64, 64), g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(60,60,64,0.9)'); gr.addColorStop(1, 'rgba(60,60,64,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c;
  });
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, 1); ctx.drawImage(spr, -r, -r, r * 2, r * 2); ctx.restore();
}

export { clamp, lerp, ease, hrand, noise, TAU };
