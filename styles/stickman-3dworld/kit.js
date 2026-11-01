// Maura Motion style kit: STICKMAN DOODLE (black marker on a lined notebook page).
// Everything is drawn live with a felt-tip marker and keeps boiling (the line re-wobbles 12 times a second),
// expressive stick figures act with faces and poses, sweat drops fly, motion lines trail, speech bubbles pop,
// labels are handwritten. Two accents only: red and blue marker.
//
// Same timed-drawing core as the other hand-drawn kits (Sketch: strokes/texts/hatches with start/end times,
// draw(ctx,t) traces only what is visible; Pen moves one marker between sketches). Call setBoil(t) each frame.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  paper: '#0e1626', ink: '#f2f3ff', red: '#e0412f', blue: '#2f6fd6', grey: '#9a9aa2', pink: '#f29bb0', yellow: '#f6d24a',
  lead: '#f2f3ff', wood2: '#8a5a2c',
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
  constructor({ t0 = 0, speed = 1500, seed = 1, gap = 0.05, weight = 2 } = {}) {
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
    const size = o.size ?? 64, font = o.font || 'Patrick Hand', weight = o.weight ?? 400;
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


/**
 * Stick figure as marker lines. pose: {x, y (feet), s, lean, tilt, look (-1..1), arms:[[a1,a2],[a1,a2]], legs:[[a1,a2],[a1,a2]],
 *   face: 'smile'|'grin'|'open'|'shock'|'worried'|'skeptic'|'happy', mouth 0..1, hair: 'tuft'|'spiky'|'pony'|'cap'|'bun'|'none',
 *   glasses, pointer (length), blink, col}. Angles: 0 = hanging down, positive swings toward +x. Returns [[pts, w, col], ...].
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


// ---------------------------------------------------------------- marker rendering (everything boils)
let BOIL = { t: 0, amp: 1.6, fps: 12 };
/** Set the current time for line boil (call once per frame before drawing). */
export function setBoil(t, amp = 1.6, fps = 12) { BOIL = { t, amp, fps }; }
const boilJit = (seed) => { const f = Math.floor(BOIL.t * BOIL.fps); return (i) => [(hrand(i, seed, f) - 0.5) * 2 * BOIL.amp, (hrand(i, seed + 3, f) - 0.5) * 2 * BOIL.amp]; };
const leadPattern = (ctx, col) => col;
function paperPattern(ctx) { if (!ctx.__np) ctx.__np = ctx.createPattern(notebookTile(), 'repeat'); return ctx.__np; }
function drawLead(ctx, it, u, a) {
  const L = u * it.tr.len;
  ctx.beginPath(); tracePart(ctx, it.tr, 0, L, boilJit(it.seed));
  ctx.strokeStyle = it.col; ctx.globalAlpha = a * 0.95 * it.tone; ctx.lineWidth = it.w; ctx.stroke();
}
function drawHatch(ctx, it, t, a) {
  const n = it.trs.length, u = clamp((t - it.a) / (it.b - it.a)), done = Math.floor(u * n);
  ctx.strokeStyle = it.col; ctx.lineWidth = it.w; ctx.globalAlpha = a * it.tone;
  ctx.beginPath(); const j = boilJit(7);
  for (let i = 0; i < Math.min(n, done); i++) tracePart(ctx, it.trs[i], 0, it.trs[i].len, j);
  if (done < n) tracePart(ctx, it.trs[done], 0, clamp((u * n - done) * 1.25) * it.trs[done].len, j);
  ctx.stroke();
}
function drawWriting(ctx, it, u, a) {
  const n = it.str.length, k = Math.min(n, Math.floor(u * n)), f = u * n - k;
  const rx = it.x0 + (k >= n ? it.W + 20 : lerp(it.pre[k], it.pre[k + 1], f));
  const fb = Math.floor(BOIL.t * BOIL.fps), jx = (hrand(fb, it.x0) - 0.5) * BOIL.amp, jy = (hrand(fb, it.y) - 0.5) * BOIL.amp, jr = (hrand(fb, it.size) - 0.5) * 0.012;
  ctx.save();
  ctx.translate(it.x0 + jx, it.y + jy); ctx.rotate((it.rot || 0) + jr); ctx.translate(-it.x0, -it.y);
  ctx.beginPath(); ctx.rect(it.x0 - 20, it.y - it.size * 1.3, rx - it.x0 + 20, it.size * 2); ctx.clip();
  ctx.font = `${it.weight} ${it.size}px '${it.font}'`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = it.spacing + 'px';
  ctx.fillStyle = it.col; ctx.globalAlpha = a * it.tone; ctx.fillText(it.str, it.x0, it.y);
  ctx.restore();
}
function drawErase(ctx, it, u, a) {
  const L = eraseU(it, u) * it.tr.len; if (L <= 0 || u >= 1) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = paperPattern(ctx); ctx.globalAlpha = a; ctx.lineWidth = it.w; ctx.beginPath(); tracePart(ctx, it.tr, 0, L); ctx.stroke(); ctx.restore();
}
/** Marker line drawn immediately (with boil). */
export function mline(ctx, pts, { w = 6, col = PAL.ink, alpha = 1, seed = 1, u = 1 } = {}) {
  const tr = track(pts, 5);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); tracePart(ctx, tr, 0, u * tr.len, boilJit(seed));
  ctx.strokeStyle = col; ctx.globalAlpha = alpha; ctx.lineWidth = w; ctx.stroke(); ctx.restore();
}
/** Marker text drawn immediately (with boil). */
export function mtext(ctx, str, x, y, { size = 64, col = PAL.ink, align = 'center', alpha = 1, font = 'Patrick Hand', weight = 400, rot = 0 } = {}) {
  if (alpha <= 0) return;
  const fb = Math.floor(BOIL.t * BOIL.fps);
  ctx.save(); ctx.translate(x + (hrand(fb, x) - 0.5) * BOIL.amp, y + (hrand(fb, y) - 0.5) * BOIL.amp); ctx.rotate(rot + (hrand(fb, size) - 0.5) * 0.015); ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px '${font}'`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(str, 0, 0); ctx.restore();
}

// ---------------------------------------------------------------- notebook paper
export function notebookTile(S = 512) {
  return cached('sd-paper', () => {
    const c = makeCanvas(S, S), g = c.getContext('2d'), r = mulberry32(6);
    g.fillStyle = PAL.paper; g.fillRect(0, 0, S, S);
    const id = g.getImageData(0, 0, S, S), d = id.data; for (let i = 0; i < d.length; i += 4) { const k = (r() - 0.5) * 8; d[i] += k; d[i + 1] += k; d[i + 2] += k; } g.putImageData(id, 0, 0);
    g.fillStyle = 'rgba(80,130,200,0.32)'; for (let y = 0; y < S; y += 64) g.fillRect(0, y + 62, S, 2.5);
    return c;
  });
}
/** 3D-world stage: deep blue gradient sky + floor glow. */
export function notebook(ctx, { margin = 96 } = {}) {
  const [vx, vy, vw, vh] = viewRect(ctx, 4);
  const g = ctx.createLinearGradient(0, vy, 0, vy + vh);
  g.addColorStop(0, '#0e1626'); g.addColorStop(0.62, '#16283f'); g.addColorStop(0.621, '#1d3a2f'); g.addColorStop(1, '#0d1f1a');
  ctx.fillStyle = g; ctx.fillRect(vx, vy, vw, vh);
  ctx.fillStyle = 'rgba(64,224,255,0.10)'; ctx.fillRect(vx, vy + vh * 0.62, vw, 6);
}
export function viewRect(ctx, pad = 30) {
  const m = ctx.getTransform().inverse(), W = ctx.canvas.width, H = ctx.canvas.height;
  const pts = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2];
}
export function cam(ctx, x, y, z = 1, rot = 0, fy = 760) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y); }

// ---------------------------------------------------------------- stick figure in marker
/** Draw a stick figure (see stick()) in marker with boil; reveal 0..1 draws it on. Returns the marker tip. */
export function stickDraw(ctx, pose, t, { reveal = 1, alpha = 1, w = 1 } = {}) {
  const parts = stick({ col: PAL.ink, ...pose }); let budget = reveal * parts.length, tip = null;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  parts.forEach(([pts, lw, col], i) => {
    if (budget <= 0) return; const u = clamp(budget); budget -= 1;
    const tr = track(pts, 5);
    ctx.beginPath(); tracePart(ctx, tr, 0, u * tr.len, boilJit(i * 17 + 3));
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 10 * w;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.globalAlpha = alpha * 0.8; ctx.lineWidth = lw * w; ctx.stroke(); ctx.restore();
    ctx.save(); ctx.shadowColor = 'rgba(64,224,255,0.9)'; ctx.shadowBlur = 18;
    ctx.strokeStyle = col; ctx.globalAlpha = alpha; ctx.lineWidth = lw * w; ctx.stroke(); ctx.restore();
    if (u < 1) { const [x, y] = pointAt(tr, u * tr.len); tip = { x, y, on: true, kind: 'line', col }; }
  });
  ctx.restore();
  return tip;
}
export function stickTip(pose, reveal) {
  const parts = stick({ col: PAL.ink, ...pose }), b = Math.min(0.999, reveal) * parts.length, i = Math.floor(b);
  const tr = track(parts[i][0], 5), [x, y] = pointAt(tr, (b - i) * tr.len); return { x, y, on: true, kind: 'line', col: parts[i][2] };
}

// ---------------------------------------------------------------- doodle extras
/** Sweat drop(s) flying off a head at (x,y). */
export function sweat(ctx, x, y, t, { n = 2, col = PAL.blue, s = 1 } = {}) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 1.4 + i * 0.5) % 1, dx = (i ? -1 : 1) * (30 + ph * 40) * s, dy = (-20 + ph * ph * 90) * s;
    const cx = x + dx, cy = y + dy, r = 9 * s;
    mline(ctx, [[cx, cy - r * 2.2], [cx + r, cy], ...Array.from({ length: 9 }, (_, k) => { const a = (k / 8) * Math.PI; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }), [cx, cy - r * 2.2]], { w: 4 * s, col, seed: 40 + i, alpha: 1 - ph * 0.5 });
  }
}
/** Motion lines trailing behind (dir = direction of travel, radians). */
export function motion(ctx, x, y, dir, { n = 3, len = 70, gap = 26, col = PAL.ink, s = 1 } = {}) {
  const bx = -Math.cos(dir), by = -Math.sin(dir), nx = -by, ny = bx;
  for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * gap * s, sx = x + nx * o + bx * 20 * s, sy = y + ny * o + by * 20 * s; mline(ctx, [[sx, sy], [sx + bx * len * s * (1 - Math.abs(o) / 200), sy + by * len * s]], { w: 5 * s, col, seed: 60 + i }); }
}
/** Speech bubble with a tail pointing at (tx,ty); text inside. a = pop 0..1 */
export function bubble(ctx, x, y, w, h, tx, ty, str, { a = 1, size = 58, col = PAL.ink, fill = '#fffdf6', font = 'Patrick Hand', textCol = null, shout = false } = {}) {
  if (a <= 0) return;
  const k = ease.outBack(clamp(a), 2.2);
  ctx.save(); ctx.translate(tx + (x - tx) * k, ty + (y - ty) * k); ctx.scale(k, k);
  const pts = []; const N = shout ? 22 : 40;
  for (let i = 0; i <= N; i++) { const ang = (i / N) * TAU, r = shout && i % 2 ? 1.18 : 1; pts.push([Math.cos(ang) * w / 2 * r, Math.sin(ang) * h / 2 * r]); }
  const lx = (tx - x) / k, ly = (ty - y) / k, ang = Math.atan2(ly, lx);
  const base = [Math.cos(ang) * w * 0.42, Math.sin(ang) * h * 0.42];
  ctx.fillStyle = fill; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.fill();
  ctx.beginPath(); ctx.moveTo(base[0] - 22, base[1]); ctx.lineTo(lx * 0.7, ly * 0.7); ctx.lineTo(base[0] + 22, base[1]); ctx.fill();
  mline(ctx, pts, { w: 5, col, seed: 71 });
  mline(ctx, [[base[0] - 22, base[1]], [lx * 0.7, ly * 0.7], [base[0] + 22, base[1]]], { w: 5, col, seed: 72 });
  mtext(ctx, str, 0, 2, { size, col: textCol || col, font, weight: font === 'Permanent Marker' ? 400 : 400 });
  ctx.restore();
}
/** A grumpy rain cloud (grey marker) with a label; rain falls. */
export function cloud(ctx, x, y, t, { s = 1, label = '', rain = true, col = PAL.grey } = {}) {
  const pts = []; const bumps = [[-110, 10, 50], [-60, -30, 60], [10, -50, 70], [80, -24, 56], [120, 14, 44]];
  bumps.forEach(([bx, by, r], i) => { for (let k = 0; k <= 10; k++) { const a = Math.PI * (i ? 1.05 : 0.6) + (k / 10) * Math.PI * (i === 4 ? 1.35 : 0.95); pts.push([x + (bx + Math.cos(a) * r) * s, y + (by + Math.sin(a) * r) * s]); } });
  pts.push([x - 110 * s, y + 52 * s]); pts.push(pts[0]);
  ctx.save(); ctx.fillStyle = 'rgba(150,150,160,0.35)'; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.fill(); ctx.restore();
  mline(ctx, pts, { w: 6 * s, col: PAL.ink, seed: 81 });
  if (rain) for (let i = 0; i < 7; i++) { const ph = (t * 2.2 + i * 0.37) % 1, rx = x + (-110 + i * 36) * s, ry = y + (70 + ph * 120) * s; mline(ctx, [[rx, ry], [rx - 8 * s, ry + 26 * s]], { w: 5 * s, col: PAL.blue, seed: 90 + i, alpha: 1 - ph }); }
  if (label) mtext(ctx, label, x, y - 2 * s, { size: Math.min(44, 300 / Math.max(4, label.length) * 1.4) * s, col: PAL.ink });
}
export { clamp, lerp, ease, hrand, noise, TAU };

/** Felt-tip marker with its tip at (x,y); body colour follows the ink. */
export function marker(ctx, x, y, { ang = -0.95, lift = 0, col = PAL.ink, s = 1 } = {}) {
  ctx.save(); ctx.translate(x + (12 + lift * 30) * s, y + (16 + lift * 34) * s); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(60,40,20,0.2)'; ctx.beginPath(); ctx.roundRect(20, -17, 330, 34, 14); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x, y - lift * 16 * s); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(22, -9); ctx.lineTo(22, 9); ctx.lineTo(0, 5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d8d8d8'; ctx.fillRect(22, -12, 26, 24);
  const g = ctx.createLinearGradient(0, -17, 0, 17); g.addColorStop(0, '#fafafa'); g.addColorStop(0.5, '#e9e9e9'); g.addColorStop(1, '#bdbdbd');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(46, -17, 300, 34, 10); ctx.fill();
  ctx.fillStyle = col; ctx.fillRect(110, -17, 120, 34); ctx.fillRect(330, -17, 20, 34);
  ctx.fillStyle = '#fff'; ctx.font = "700 20px 'Inter'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('MARKER', 170, 1);
  ctx.restore();
}
/** Draw the marker for a Pen state; slides away when idle. */
export function markerFor(ctx, st, { s = 1, exit = 0.4 } = {}) {
  if (!st) return; let { x, y } = st, lift = st.on ? 0 : (st.lift ?? 1) * 0.9, off = 0;
  if (st.after !== undefined && st.after > exit) { off = ease.inCubic(clamp((st.after - exit) / 0.6)); if (off >= 1) return; }
  if (st.pre) off = 1 - ease.outCubic(1 - st.lift);
  marker(ctx, x + off * 650 * s, y + off * 500 * s, { lift, col: st.col || PAL.ink, s });
}
/** Little pink brain character with legs; run = running phase (0 = standing). */
export function brainGuy(ctx, x, y, t, { s = 1, run = 0, face = 'shock', look = 1 } = {}) {
  const P = (a, b) => [x + a * s, y + b * s];
  const pts = []; for (let i = 0; i <= 36; i++) { const a = (i / 36) * TAU, r = 1 + 0.08 * Math.sin(a * 7); pts.push(P(Math.cos(a) * 80 * r, -120 + Math.sin(a) * 58 * r)); }
  ctx.save(); ctx.fillStyle = PAL.pink; ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.fill(); ctx.restore();
  mline(ctx, pts, { w: 6 * s, seed: 301 });
  mline(ctx, [P(0, -176), P(-10, -140), P(8, -120), P(-6, -96)], { w: 4 * s, seed: 302 });
  mline(ctx, [P(-50, -150), P(-30, -130), P(-50, -110)], { w: 4 * s, seed: 303 }); mline(ctx, [P(50, -150), P(34, -126), P(52, -104)], { w: 4 * s, seed: 304 });
  const ex = look * 10;
  for (const sx of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + (sx * 22 + ex) * s, y - 124 * s, 13 * s, 0, TAU); ctx.fill(); mline(ctx, Array.from({ length: 13 }, (_, k) => P(sx * 22 + ex + Math.cos(k / 12 * TAU) * 13, -124 + Math.sin(k / 12 * TAU) * 13)), { w: 3.5 * s, seed: 305 + sx }); ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(x + (sx * 22 + ex * 1.5) * s, y - 122 * s, 5 * s, 0, TAU); ctx.fill(); }
  if (face === 'shock') mline(ctx, Array.from({ length: 11 }, (_, k) => P(ex + Math.cos(k / 10 * TAU) * 9, -88 + Math.sin(k / 10 * TAU) * 11)), { w: 4 * s, seed: 310 });
  else mline(ctx, Array.from({ length: 9 }, (_, k) => P(ex - 16 + k * 4, -92 + Math.sin(k / 8 * Math.PI) * 8)), { w: 4 * s, seed: 311 });
  const ph = run * TAU;
  for (const [o, side] of [[0, 1], [Math.PI, -1]]) { const sw = Math.sin(ph + o) * (run ? 0.8 : 0.1); const hip = P(side * 20, -66), knee = P(side * 20 + Math.sin(sw) * 34, -66 + Math.cos(sw) * 34), foot = P(side * 20 + Math.sin(sw) * 34 + Math.sin(sw - 0.6) * 32, -66 + Math.cos(sw) * 34 + Math.cos(sw - 0.6) * 32); mline(ctx, [hip, knee, foot, [foot[0] + 14 * s, foot[1]]], { w: 6 * s, seed: 320 + side }); }
}
