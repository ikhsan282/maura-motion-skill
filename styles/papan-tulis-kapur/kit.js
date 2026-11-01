// AniMasters style kit: PAPAN TULIS KAPUR (chalk on a green slate board).
// Chalk text and diagrams write themselves live (stroke-on, broken dry-chalk texture, a soft dust halo), a real
// stick of chalk follows the line and sheds dust, a felt duster wipes the board leaving cloudy ghosts, and chalk
// stick figures (teacher with a pointer, students) react with faces and poses. Yellow chalk is the accent.
//
// Same timed-drawing core as the other hand-drawn kits: a Sketch is a list of strokes/texts/hatches/wipes, each
// with a start and end time; draw(ctx, t) traces only what is visible at t. A Pen moves one hand between sketches.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  board: '#2c5643', wall: '#c9b99a', wood: '#8a5a2c', wood2: '#d9b27a',
  lead: '#f3f2ea', red: '#f5da62', yellow: '#f5da62', pink: '#f4a3b6', blue: '#9ed2f0',
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
  constructor({ t0 = 0, speed = 1500, seed = 1, gap = 0.05, weight = 2.2 } = {}) {
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
    return this._push(it, o.dur ?? Math.max(0.07, tr.len / (o.speed || this.speed)));
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
    const size = o.size ?? 64, font = o.font || 'Kalam', weight = o.weight ?? 700;
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


/**
 * One hand for the whole short: register every sketch; at(t) says where the tool is,
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



// ---------------------------------------------------------------- chalk rendering
/** Dry chalk on slate: colour with broken, streaky alpha (the board's tooth eats the stroke). World-anchored. */
export function chalkPattern(ctx, col = PAL.lead) {
  const tile = cached('ch-tile:' + col, () => {
    const S = 160, c = makeCanvas(S, S), g = c.getContext('2d');
    g.fillStyle = col; g.fillRect(0, 0, S, S);
    const id = g.getImageData(0, 0, S, S), d = id.data, r = mulberry32(23);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const n = noise.n2(x * 0.35, y * 0.12) * 0.45 + noise.n2(x * 0.9 + 7, y * 0.8) * 0.3;
      d[(y * S + x) * 4 + 3] = clamp(0.8 + n * 0.7 - r() * 0.45, 0.05, 1) * 255;
    }
    g.putImageData(id, 0, 0); return c;
  });
  const key = 'ch-pat:' + col;
  if (!ctx.__pats) ctx.__pats = {};
  if (!ctx.__pats[key]) ctx.__pats[key] = ctx.createPattern(tile, 'repeat');
  return ctx.__pats[key];
}
const leadPattern = chalkPattern;
/** Board surface pattern (world-anchored), also used to wipe things off. */
export function boardPattern(ctx) {
  if (ctx.__boardPat) return ctx.__boardPat;
  ctx.__boardPat = ctx.createPattern(boardTile(), 'repeat');
  return ctx.__boardPat;
}
const paperPattern = boardPattern;
/** Seamless slate tile: green with grain and the ghosts of old wiped-off chalk. */
export function boardTile(S = 640) {
  return cached('ch-board:' + S, () => {
    const c = makeCanvas(S, S), g = c.getContext('2d'), r = mulberry32(5);
    g.fillStyle = PAL.board; g.fillRect(0, 0, S, S);
    const wrap = (fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) fn(ox, oy); };
    for (let i = 0; i < 18; i++) {
      const x = r() * S, y = r() * S, rad = 90 + r() * 260, a = 0.035 * r(), dark = r() < 0.4;
      wrap((ox, oy) => { const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, dark ? `rgba(10,30,20,${a * 1.5})` : `rgba(230,240,230,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); });
    }
    // old eraser swipes: soft horizontal arcs
    g.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const x = r() * S, y = r() * S, w = 140 + r() * 260, th = 30 + r() * 50, a = 0.018 + r() * 0.025;
      wrap((ox, oy) => { g.strokeStyle = `rgba(235,245,235,${a})`; g.lineWidth = th; g.beginPath(); g.moveTo(x + ox, y + oy); g.quadraticCurveTo(x + ox + w / 2, y + oy - 18, x + ox + w, y + oy + 6); g.stroke(); });
    }
    const id = g.getImageData(0, 0, S, S), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    g.putImageData(id, 0, 0);
    return c;
  });
}
function drawLead(ctx, it, u, a) {
  const L = u * it.tr.len;
  ctx.beginPath(); tracePart(ctx, it.tr, 0, L);
  ctx.strokeStyle = it.col; ctx.globalAlpha = a * 0.07 * it.tone; ctx.lineWidth = it.w * 2.4; ctx.stroke(); // dust halo
  ctx.strokeStyle = chalkPattern(ctx, it.col); ctx.globalAlpha = a * 0.95 * it.tone; ctx.lineWidth = it.w; ctx.stroke();
  ctx.globalAlpha = a * 0.45 * it.tone; ctx.lineWidth = it.w * 0.45; ctx.stroke(); // denser core
}
function drawHatch(ctx, it, t, a) {
  const n = it.trs.length, u = clamp((t - it.a) / (it.b - it.a)), done = Math.floor(u * n);
  ctx.strokeStyle = chalkPattern(ctx, it.col); ctx.lineWidth = it.w; ctx.globalAlpha = a * it.tone;
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
  ctx.fillStyle = it.col; ctx.globalAlpha = a * 0.08; ctx.fillText(it.str, it.x0 + 2, it.y + 2);
  ctx.fillStyle = chalkPattern(ctx, it.col); ctx.globalAlpha = a * it.tone;
  ctx.fillText(it.str, it.x0, it.y);
  ctx.restore();
}
function drawErase(ctx, it, u, a) {
  const L = eraseU(it, u) * it.tr.len;
  if (L <= 0) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const Ld = u >= 1 ? it.tr.len : it.tr.len * clamp(u * 1.08);
  if (u < 1) { ctx.globalAlpha = a; ctx.strokeStyle = boardPattern(ctx); ctx.lineWidth = it.w; ctx.beginPath(); tracePart(ctx, it.tr, 0, Ld); ctx.stroke(); }
  // the wiped chalk leaves a cloudy smear (stays as a ghost)
  ctx.strokeStyle = '#e8efe6';
  ctx.globalAlpha = a * (u < 1 ? 0.07 : 0.045); ctx.lineWidth = it.w * 0.95; ctx.beginPath(); tracePart(ctx, it.tr, 0, Ld); ctx.stroke();
  ctx.globalAlpha = a * 0.05; ctx.lineWidth = it.w * 0.35;
  for (const off of [-0.3, 0.05, 0.32]) { ctx.beginPath(); const sh = (i) => [0, off * it.w + Math.sin(i * 0.2) * 3]; tracePart(ctx, it.tr, 0, Ld, sh); ctx.stroke(); }
  ctx.restore();
}

// ---------------------------------------------------------------- board, wall, tray
/** The classroom: wall, wooden frame, slate board (world rect), chalk tray with chalk pieces and a duster. */
export function board(ctx, [x, y, w, h], { tray = true } = {}) {
  const [vx, vy, vw, vh] = viewRect(ctx, 4);
  ctx.fillStyle = PAL.wall; ctx.fillRect(vx, vy, vw, vh);
  const F = 34;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x - F + 10, y - F + 16, w + F * 2, h + F * 2);
  const wg = ctx.createLinearGradient(0, y - F, 0, y + h + F); wg.addColorStop(0, '#9b6a38'); wg.addColorStop(0.5, PAL.wood); wg.addColorStop(1, '#6e4320');
  ctx.fillStyle = wg; ctx.fillRect(x - F, y - F, w + F * 2, h + F * 2);
  ctx.strokeStyle = 'rgba(60,35,15,0.35)'; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x - F, y - F + 6 + i * 3.6); ctx.lineTo(x + w + F, y - F + 8 + i * 3.6); ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = boardPattern(ctx); ctx.fillRect(Math.max(x, vx), Math.max(y, vy), Math.min(x + w, vx + vw) - Math.max(x, vx), Math.min(y + h, vy + vh) - Math.max(y, vy));
  const ig = ctx.createLinearGradient(0, y, 0, y + 40); ig.addColorStop(0, 'rgba(0,0,0,0.35)'); ig.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = ig; ctx.fillRect(x, y, w, 40);
  ctx.restore();
  if (tray) {
    const ty = y + h + F - 6;
    ctx.fillStyle = '#5a3818'; ctx.fillRect(x - F - 14, ty, w + F * 2 + 28, 26);
    ctx.fillStyle = '#7b4e25'; ctx.fillRect(x - F - 14, ty - 8, w + F * 2 + 28, 10);
    const pcs = [[x + 60, '#f2f1ea', 70], [x + 150, PAL.yellow, 56], [x + 220, PAL.pink, 48], [x + 290, PAL.blue, 40]];
    for (const [px, col, L] of pcs) { ctx.fillStyle = col; ctx.fillRect(px, ty - 20, L, 14); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(px, ty - 10, L, 4); }
    duster(ctx, x + w - 170, ty - 26, { rot: 0, s: 0.8 });
  }
}

// ---------------------------------------------------------------- props
/** A stick of chalk whose tip is at (x,y); ang = direction from the tip to the back end. */
export function chalkStick(ctx, x, y, { ang = -0.95, lift = 0, col = PAL.lead, s = 1 } = {}) {
  ctx.save();
  ctx.translate(x + (10 + lift * 26) * s, y + (14 + lift * 30) * s); ctx.rotate(ang); ctx.scale(s, s);
  ctx.globalAlpha = 0.28 - lift * 0.1; ctx.fillStyle = '#0d1f16'; roundBox(ctx, 0, -12, 130, 24, 10); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(x, y - lift * 14 * s); ctx.rotate(ang); ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, -13, 0, 13); g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, col); g.addColorStop(1, shadeHex(col, -0.28));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -6); ctx.quadraticCurveTo(-4, 0, 0, 6); ctx.lineTo(10, 12); ctx.lineTo(132, 12); ctx.quadraticCurveTo(140, 0, 132, -12); ctx.lineTo(10, -12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; for (let i = 0; i < 5; i++) ctx.fillRect(24 + i * 22, -12, 2, 24);
  ctx.restore();
}
/** Felt board duster (top view: wooden back, grey felt edge). */
export function duster(ctx, x, y, { rot = 0, s = 1, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; roundBox(ctx, -98, -32, 210, 76, 14); ctx.fill();
  ctx.fillStyle = '#c9c6bd'; roundBox(ctx, -105, -38, 210, 76, 14); ctx.fill();
  const g = ctx.createLinearGradient(0, -34, 0, 30); g.addColorStop(0, '#a8743f'); g.addColorStop(1, '#7a4c22');
  ctx.fillStyle = g; roundBox(ctx, -100, -38, 200, 62, 12); ctx.fill();
  ctx.strokeStyle = 'rgba(60,35,15,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-90, -28 + i * 11); ctx.quadraticCurveTo(0, -24 + i * 11 + (i % 2 ? 4 : -4), 90, -28 + i * 11); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-100, 24, 200, 6);
  ctx.restore();
}
function roundBox(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function shadeHex(hex, amt) { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(clamp(v * (1 + amt), 0, 255)); return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`; }

/** Draw the chalk (or the duster while wiping) for a Pen state. Leaves the frame when idle. */
export function handFor(ctx, st, t, { s = 1, exit = 0.5 } = {}) {
  if (!st) return;
  let { x, y } = st, lift = st.on ? 0 : (st.lift ?? 1) * 0.9;
  let off = 0;
  if (st.after !== undefined && st.after > exit) { off = ease.inCubic(clamp((st.after - exit) / 0.6)); if (off >= 1) return; }
  if (st.pre) off = 1 - ease.outCubic(1 - st.lift);
  x += off * 700 * s; y += off * 520 * s;
  if (st.kind === 'erase') { const it = st.it, u = clamp((t - it.a) / (it.b - it.a)); duster(ctx, x, y, { rot: -0.15 + Math.sin(u * 30) * 0.06, s }); return; }
  chalkStick(ctx, x, y, { ang: -0.95 + (st.on ? noise.n2(t * 6, 3) * 0.06 : 0), lift, col: st.col || PAL.lead, s });
}
/** Chalk dust falling from where the chalk touched the board in the last ~0.8 s (pure function of t). */
export function dust(ctx, pen, t, { n = 18, life = 0.8 } = {}) {
  ctx.save(); ctx.fillStyle = '#eef2ea';
  for (let k = 1; k <= n; k++) {
    const age = (k / n) * life, st = pen.at(t - age);
    if (!st || !st.on || st.kind === 'erase') continue;
    for (let j = 0; j < 2; j++) {
      const h = hrand(Math.floor((t - age) * 24), k, j);
      const px = st.x + (h - 0.5) * 14 + (hrand(k, j, 3) - 0.5) * 40 * age, py = st.y + 4 + 700 * age * age + h * 6;
      ctx.globalAlpha = (1 - age / life) * 0.7; const r = 1.5 + h * 2.5; ctx.fillRect(px, py, r, r);
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- stick figures
/**
 * Stick figure as chalk lines. pose: {x, y (feet), s, lean, tilt, look (-1..1), arms:[[a1,a2],[a1,a2]], legs:[[a1,a2],[a1,a2]],
 *   face: 'smile'|'grin'|'open'|'shock'|'worried'|'skeptic'|'happy', mouth 0..1 (talking), hair: 'tuft'|'spiky'|'pony'|'cap'|'bun'|'none',
 *   glasses, pointer (length), blink, col}
 * Angles: 0 = hanging straight down, positive swings toward +x. Returns [[pts, w, col], ...] in world coords.
 */
export function stick(p) {
  const { x, y, s = 1, lean = 0, tilt = 0, look = 0, face = 'smile', mouth = 0, hair = 'tuft', glasses = false, pointer = 0, blink = 0, col = PAL.lead } = p;
  const arms = p.arms || [[0.35, 0.2], [-0.35, -0.2]], legs = p.legs || [[0.18, 0], [-0.18, 0]];
  const out = []; const W0 = 6.5 * s;
  const R = (px, py, ox = 0, oy = 0) => { const X = px, Y = py; return [x + (ox + X * Math.cos(lean) - Y * Math.sin(lean)) * s, y + (oy + X * Math.sin(lean) + Y * Math.cos(lean)) * s]; };
  const hip = [0, -118], neck = [0, -246], hc = [0, -300], hr = 50;
  const L = (pts, w = W0, c = col) => out.push([pts, w, c]);
  // legs
  for (const [a1, a2] of legs) { const k = [hip[0] + Math.sin(a1) * 62, hip[1] + Math.cos(a1) * 62], f = [k[0] + Math.sin(a1 + a2) * 60, k[1] + Math.cos(a1 + a2) * 60]; L([R(...hip), R(...k), R(...f), R(f[0] + (a1 >= 0 ? 16 : -16), f[1])]); }
  L([R(...hip), R(...neck)]); // spine
  // arms
  const hands = [];
  arms.forEach(([a1, a2], i) => { const sh = [0, -232]; const e = [sh[0] + Math.sin(a1) * 58, sh[1] + Math.cos(a1) * 58], h = [e[0] + Math.sin(a1 + a2) * 56, e[1] + Math.cos(a1 + a2) * 56]; L([R(...sh), R(...e), R(...h)]); hands.push([h, a1 + a2]); });
  if (pointer) { const [h, a] = hands[0]; L([R(...h), R(h[0] + Math.sin(a) * pointer, h[1] + Math.cos(a) * pointer)], W0 * 0.7, PAL.wood2); }
  // head (rotates with tilt around the neck)
  const H = (px, py) => { const dx = px, dy = py - neck[1]; return R(neck[0] + dx * Math.cos(tilt) - dy * Math.sin(tilt), neck[1] + dx * Math.sin(tilt) + dy * Math.cos(tilt)); };
  const circ = (cx, cy, r, a0 = -1.8, ext = 0.25, n = 26) => { const q = []; for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (TAU + ext); q.push(H(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); } return q; };
  const arc = (cx, cy, rx, ry, a0, a1, n = 12) => { const q = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); q.push(H(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry)); } return q; };
  L(circ(hc[0], hc[1], hr));
  const ex = look * 10, ey = hc[1] - 6;
  const big = face === 'shock';
  if (blink > 0.5 || face === 'happy') { L(arc(hc[0] - 17 + ex, ey + 4, 8, 7, Math.PI * 1.1, Math.PI * 1.9, 6), W0 * 0.8); L(arc(hc[0] + 17 + ex, ey + 4, 8, 7, Math.PI * 1.1, Math.PI * 1.9, 6), W0 * 0.8); }
  else { L(circ(hc[0] - 17 + ex, ey, big ? 7 : 3.5, 0, 0.3, 8), big ? W0 * 0.7 : W0 * 1.1); L(circ(hc[0] + 17 + ex, ey, big ? 7 : 3.5, 0, 0.3, 8), big ? W0 * 0.7 : W0 * 1.1); }
  if (glasses) { L(circ(hc[0] - 18 + ex, ey, 14, 0, 0.2, 14), W0 * 0.6); L(circ(hc[0] + 18 + ex, ey, 14, 0, 0.2, 14), W0 * 0.6); }
  // brows
  if (face === 'worried') { L([H(-30 + ex, ey - 22), H(-8 + ex, ey - 28)], W0 * 0.7); L([H(8 + ex, ey - 28), H(30 + ex, ey - 22)], W0 * 0.7); }
  if (face === 'skeptic') { L([H(-30 + ex, ey - 18), H(-8 + ex, ey - 18)], W0 * 0.7); L([H(8 + ex, ey - 30), H(30 + ex, ey - 22)], W0 * 0.7); }
  if (big) { L(arc(-17 + ex, ey - 20, 10, 6, Math.PI * 1.15, Math.PI * 1.85, 5), W0 * 0.7); L(arc(17 + ex, ey - 20, 10, 6, Math.PI * 1.15, Math.PI * 1.85, 5), W0 * 0.7); }
  // mouth
  const mx = hc[0] + look * 8, my = hc[1] + 22;
  const m = mouth > 0.05 ? mouth : 0;
  if (face === 'shock') L(circ(mx, my + 2, 9 + m * 3, 0, 0.3, 12), W0 * 0.8);
  else if (face === 'open' || m) L(circ(mx, my, 10 + m * 2, 0, 0.3, 12), W0 * 0.75);
  else if (face === 'worried') L(arc(mx, my + 10, 12, 6, Math.PI * 1.15, Math.PI * 1.85, 8), W0 * 0.8);
  else if (face === 'skeptic') L([H(mx - 12, my + 2), H(mx + 12, my - 2)], W0 * 0.8);
  else if (face === 'grin' || face === 'happy') L(arc(mx, my - 4, 18, 13, 0.15, Math.PI - 0.15, 12), W0 * 0.8);
  else L(arc(mx, my - 6, 14, 10, 0.3, Math.PI - 0.3, 10), W0 * 0.8);
  // hair
  const top = hc[1] - hr;
  if (hair === 'tuft') { L([H(-6, top + 2), H(-14, top - 22)], W0 * 0.8); L([H(4, top), H(4, top - 26)], W0 * 0.8); L([H(12, top + 2), H(22, top - 20)], W0 * 0.8); }
  else if (hair === 'spiky') L([H(-40, top + 22), H(-30, top - 10), H(-16, top + 6), H(-4, top - 18), H(8, top + 4), H(22, top - 16), H(30, top + 8), H(44, top - 4), H(44, top + 22)], W0 * 0.8);
  else if (hair === 'pony') { L(arc(hc[0], hc[1], hr + 2, hr + 2, Math.PI * 1.05, Math.PI * 1.95, 14), W0 * 0.8); L([H(-hr, hc[1] - 10), H(-hr - 28, hc[1] + 10), H(-hr - 22, hc[1] + 44)], W0 * 0.8); }
  else if (hair === 'bun') { L(circ(hc[0], top - 14, 16, 0, 0.2, 14), W0 * 0.8); }
  else if (hair === 'cap') { L(arc(hc[0], hc[1] - 4, hr + 2, hr - 6, Math.PI, TAU, 12), W0 * 0.8); L([H(-hr, hc[1] - 6), H(hr + 34, hc[1] - 4)], W0 * 0.9); }
  return out;
}
/** Draw a stick figure (with optional draw-on reveal and line boil). Returns the chalk tip while revealing. */
export function stickDraw(ctx, pose, t, { reveal = 1, alpha = 1, boil = 1.2, fps = 12 } = {}) {
  const parts = stick(pose), fb = Math.floor(t * fps);
  const total = parts.length; let budget = reveal * total, tip = null;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < parts.length && budget > 0; i++) {
    const [pts, w, col] = parts[i]; const frac = clamp(budget); budget -= 1;
    const tr = track(pts, 5), Lx = frac * tr.len;
    const jit = (k) => [(hrand(k, fb, i) - 0.5) * boil, (hrand(k, fb + 7, i) - 0.5) * boil];
    ctx.beginPath(); tracePart(ctx, tr, 0, Lx, jit);
    ctx.strokeStyle = col; ctx.globalAlpha = alpha * 0.07; ctx.lineWidth = w * 2.3; ctx.stroke();
    ctx.strokeStyle = chalkPattern(ctx, col); ctx.globalAlpha = alpha * 0.95; ctx.lineWidth = w; ctx.stroke();
    if (frac < 1) { const [px, py] = pointAt(tr, Lx); tip = { x: px, y: py, on: true, kind: 'line', col }; }
  }
  ctx.restore();
  return tip;
}
/** Chalk tip of a figure being drawn on (no drawing). */
export function stickTip(pose, reveal) {
  const parts = stick(pose), total = parts.length, b = Math.min(0.999, reveal) * total, i = Math.floor(b);
  const tr = track(parts[i][0], 5), [x, y] = pointAt(tr, (b - i) * tr.len);
  return { x, y, on: true, kind: 'line', col: parts[i][2] };
}

/** Chalk text drawn immediately (no reveal). */
export function chalkText(ctx, str, x, y, { size = 64, col = PAL.lead, align = 'center', alpha = 1, font = 'Kalam', weight = 700, rot = 0 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px '${font}'`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillStyle = col; ctx.globalAlpha = alpha * 0.08; ctx.fillText(str, 2, 2);
  ctx.fillStyle = chalkPattern(ctx, col); ctx.globalAlpha = alpha; ctx.fillText(str, 0, 0);
  ctx.restore();
}
/** Chalk line drawn immediately (polyline, optional boil). */
export function chalkLine(ctx, pts, { w = 7, col = PAL.lead, alpha = 1, t = 0, boil = 0 } = {}) {
  const fb = Math.floor(t * 12);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  pts.forEach(([px, py], i) => { const jx = boil ? (hrand(i, fb) - 0.5) * boil : 0, jy = boil ? (hrand(i, fb, 2) - 0.5) * boil : 0; i ? ctx.lineTo(px + jx, py + jy) : ctx.moveTo(px + jx, py + jy); });
  ctx.strokeStyle = col; ctx.globalAlpha = alpha * 0.07; ctx.lineWidth = w * 2.3; ctx.stroke();
  ctx.strokeStyle = chalkPattern(ctx, col); ctx.globalAlpha = alpha * 0.95; ctx.lineWidth = w; ctx.stroke();
  ctx.restore();
}
/** Camera: world (x,y) at screen (540, fy), zoom z. */
export function cam(ctx, x, y, z = 1, rot = 0, fy = 760) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y);
}
/** World-space rectangle currently visible through ctx's transform. */
export function viewRect(ctx, pad = 30) {
  const m = ctx.getTransform().inverse(), W = ctx.canvas.width, H = ctx.canvas.height;
  const pts = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2];
}
export { clamp, lerp, ease, hrand, noise, TAU };
