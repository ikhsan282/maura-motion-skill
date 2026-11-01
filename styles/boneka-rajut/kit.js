// Maura Motion style kit: BONEKA RAJUT (knitted amigurumi world on felt).
// Every surface is a material: knitted yarn (V stitches laid on ellipsoids and tubes, lit as 3D, fuzzy edges),
// felt (fibre texture, thick cut edges, drop shadows), embroidery (running stitch, backstitch, satin letters),
// buttons (glossy, two holes, cross thread). Everything is baked once into cached sprites; a frame only stamps them.
// Signature moves: toy wobble (puppets rock and hop as if held by a hand), button-eyed reactions, embroidered
// mouths that change, felt pieces that pop in like they were just placed, stitch lines that sew themselves.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU, hashStr } from '/engine/lib/core.js';
import { makeCanvas, cached, alphaTexture } from '/engine/lib/draw.js';

export const RES = 1.4; // bake resolution for knitted sprites (close-ups stay crisp)

export const PAL = {
  sky: '#bfe4ef', skyLow: '#e9f5ee', sunsetTop: '#f6b27c', sunsetLow: '#ffe2b0',
  hillFar: '#b9dc8e', hillNear: '#8fc767', meadow: '#7cb957', meadowDeep: '#5d9c45',
  river: '#5aa9d6', riverDeep: '#3d88bf', soil: '#9b6a45', soilDeep: '#6f4a2f',
  sun: '#ffd34f', cloud: '#fffaf2',
  monkey: '#8d5a3a', monkeyTan: '#f2cc9c', turtle: '#93cf63', shell: '#3f9150', shellLine: '#1d4f2b', shellRim: '#d6dd73',
  trunk: '#a9c95f', leaf: '#5fb04f', leafDry: '#b28b4a', banana: '#ffd84a', bananaTip: '#6b4a2b', heart: '#8e3b6e',
  thorn: '#4f6d34', red: '#e0524d', pink: '#f59fa6', cream: '#fff6e4', thread: '#3a2622', ink: '#3a2a6b', white: '#fffdf6',
};

// ---------------------------------------------------------------- colour helpers
const _rgb = new Map();
export function rgbOf(hex) {
  let v = _rgb.get(hex);
  if (!v) { const n = parseInt(hex.slice(1), 16); v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; _rgb.set(hex, v); }
  return v;
}
/** brightness b: 1 = base colour, <1 darker, >1 towards white */
export function lit(c, b, a = 1) {
  if (typeof c === 'string') c = rgbOf(c);
  let r, g, bl;
  if (b <= 1) { r = c[0] * b; g = c[1] * b; bl = c[2] * b; }
  else { const k = Math.min(1, b - 1); r = c[0] + (255 - c[0]) * k; g = c[1] + (255 - c[1]) * k; bl = c[2] + (255 - c[2]) * k; }
  return a >= 1 ? `rgb(${r | 0},${g | 0},${bl | 0})` : `rgba(${r | 0},${g | 0},${bl | 0},${a})`;
}
export function mix(a, b, t) { const A = rgbOf(a), B = rgbOf(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, '0')).join(''); }
const LIGHT = (() => { const v = [-0.45, -0.62, 0.64]; const l = Math.hypot(...v); return v.map((x) => x / l); })();
const shadeN = (nx, ny, nz) => 0.4 + 0.72 * Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]) + 0.1 * nz;

// ---------------------------------------------------------------- yarn: one knit V stitch
function vStitch(g, x, y, ang, w, h, c, b, r) {
  // one plump knit "V": two twisted yarn legs, each with a dark rim, a body and a soft highlight
  const j = 0.92 + r() * 0.16, ca = Math.cos(ang), sa = Math.sin(ang);
  for (let sd = -1; sd <= 1; sd += 2) {
    const lx = x + ca * sd * w * 0.22, ly = y + sa * sd * w * 0.22, rot = ang + sd * 0.56;
    const bb = b * j * (sd < 0 ? 1.03 : 0.93);
    const rx = Math.max(0.7, w * 0.27), ry = Math.max(0.9, h * 0.8);
    g.fillStyle = lit(c, bb * 0.66);
    g.beginPath(); g.ellipse(lx, ly, rx * 1.16, ry * 1.04, rot, 0, TAU); g.fill();
    g.fillStyle = lit(c, bb);
    g.beginPath(); g.ellipse(lx, ly, rx, ry * 0.96, rot, 0, TAU); g.fill();
    // highlight towards the light (upper left)
    const hx = lx - ca * w * 0.04 + sa * h * 0.12, hy = ly - sa * w * 0.04 - ca * h * 0.12;
    g.fillStyle = lit(c, bb * 1.14 + 0.05, 0.7);
    g.beginPath(); g.ellipse(hx, hy, Math.max(0.4, rx * 0.4), Math.max(0.5, ry * 0.5), rot, 0, TAU); g.fill();
    // ply twist: one fine diagonal groove across the leg
    if (w > 5) {
      g.strokeStyle = lit(c, bb * 0.72, 0.55); g.lineWidth = Math.max(0.6, w * 0.06);
      const k = ry * 0.35, dx = Math.cos(rot + 1.0) * rx * 0.9, dy = Math.sin(rot + 1.0) * rx * 0.9;
      g.beginPath(); g.moveTo(lx - dx + sa * k * 0.3, ly - dy - ca * k * 0.3); g.lineTo(lx + dx - sa * k * 0.3, ly + dy + ca * k * 0.3); g.stroke();
    }
  }
}
/** hairs sticking out of yarn along an edge point with outward normal (nx,ny) */
function hair(g, px, py, nx, ny, len, bend, col) {
  len *= 0.6; bend *= 0.7;
  g.strokeStyle = col;
  g.beginPath(); g.moveTo(px - nx * 2, py - ny * 2);
  g.quadraticCurveTo(px + nx * len * 0.5 - ny * bend, py + ny * len * 0.5 + nx * bend, px + nx * len - ny * bend * 1.6, py + ny * len + nx * bend * 1.6);
  g.stroke();
}

/**
 * Knitted ellipsoid sprite (heads, bodies, shells, bananas' ends...). Cached by key.
 * colorAt(theta, phi) -> hex lets you knit colourwork (shell plates, stripes). clip(g) cuts the shape (dome).
 */
export function knitEllipsoid(key, { rx, ry, color, sw = 15, colorAt = null, flat = 0, clip = null, fuzz = 1, seed = 1 }) {
  return cached('kn-e:' + key, () => {
    const pad = 16, W = rx * 2 + pad * 2, H = ry * 2 + pad * 2;
    const c = makeCanvas(Math.ceil(W * RES), Math.ceil(H * RES)), g = c.getContext('2d');
    g.scale(RES, RES); g.translate(rx + pad, ry + pad);
    const base = rgbOf(color), r = mulberry32(hashStr(key) + seed);
    g.save();
    if (clip) { clip(g); g.clip(); }
    g.beginPath(); g.ellipse(0, 0, rx * 1.015, ry * 1.015, 0, 0, TAU); g.clip();
    const gr = g.createRadialGradient(-rx * 0.3, -ry * 0.35, 0, 0, 0, Math.max(rx, ry) * 1.05);
    gr.addColorStop(0, lit(base, 0.55)); gr.addColorStop(1, lit(base, 0.3));
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU); g.fill();
    const sh = sw * 0.72, dphi = sh / ry, NCOL = Math.max(4, Math.round((Math.PI * rx) / sw));
    for (let phi = -Math.PI / 2 + dphi * 0.5; phi < Math.PI / 2; phi += dphi) {
      const cy = Math.sin(phi) * ry, hw = Math.cos(phi) * rx, rowH = Math.cos(phi) * ry * dphi;
      if (rowH < 1.1 || hw < 2) continue;
      const n = NCOL, dth = Math.PI / n;
      for (let k = 0; k < n; k++) {
        const th = -Math.PI / 2 + (k + 0.5) * dth;
        const x = Math.sin(th) * hw, w = Math.cos(th) * hw * dth;
        if (w < 1.1) continue;
        let b = shadeN(Math.sin(th) * Math.cos(phi), Math.sin(phi), Math.cos(th) * Math.cos(phi));
        b = lerp(b, 0.98, flat);
        const col = colorAt ? rgbOf(colorAt(th, phi, x, cy)) : base;
        vStitch(g, x, cy, 0, w * 1.04, rowH * 1.08, col, b, r);
      }
    }
    g.restore();
    if (fuzz) {
      g.lineWidth = 0.9;
      const n = Math.PI * (rx + ry) * 1.2 * fuzz;
      for (let i = 0; i < n; i++) {
        const a = r() * TAU, px = Math.cos(a) * rx * 0.985, py = Math.sin(a) * ry * 0.985;
        if (clip && clipTest(clip, px, py)) continue;
        let nx = Math.cos(a) / rx, ny = Math.sin(a) / ry; const l = Math.hypot(nx, ny); nx /= l; ny /= l;
        const b = 0.85 + r() * 0.45 + (nx * LIGHT[0] + ny * LIGHT[1]) * 0.3;
        hair(g, px, py, nx, ny, 3 + r() * 7, (r() - 0.5) * 6, lit(base, b + 0.1, 0.18 + r() * 0.25));
      }
      // halo hairs across the surface
      const m = (rx * ry) / 110 * fuzz;
      for (let i = 0; i < m; i++) {
        const a = r() * TAU, rr = Math.sqrt(r()) * 0.92, px = Math.cos(a) * rx * rr, py = Math.sin(a) * ry * rr;
        if (clip && clipTest(clip, px, py)) continue;
        const d = r() * TAU, len = 2 + r() * 5;
        g.strokeStyle = lit(base, 1.15 + r() * 0.2, 0.18 + r() * 0.15);
        g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + Math.cos(d) * len * 0.6 + 1, py + Math.sin(d) * len * 0.6, px + Math.cos(d) * len, py + Math.sin(d) * len); g.stroke();
      }
    }
    return { canvas: c, ox: rx + pad, oy: ry + pad, w: W, h: H };
  });
}
const _clipCtx = makeCanvas(4, 4).getContext('2d');
function clipTest(clip, x, y) { // true if (x,y) is OUTSIDE the clip path
  _clipCtx.setTransform(1, 0, 0, 1, 0, 0); _clipCtx.beginPath(); clip(_clipCtx); return !_clipCtx.isPointInPath(x, y);
}

/** Smooth a list of control points into a dense polyline (Catmull-Rom). */
export function smooth(pts, per = 8) {
  if (pts.length < 3) return pts;
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/**
 * Knitted tube along a path (arms, legs, tails, trunks, bananas). Rounded caps. Cached by key.
 * pts in local coords; origin of the sprite = local (0,0). r0 -> r1 taper. colorAt(s01, theta) -> hex.
 */
export function knitTube(key, { pts, r0, r1 = r0, color, sw = 14, caps = [true, true], colorAt = null, fuzz = 1, seed = 2 }) {
  return cached('kn-t:' + key, () => {
    const P = pts.length > 2 ? pts : pts;
    const segL = []; let L = 0;
    for (let i = 0; i < P.length - 1; i++) { const l = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); segL.push(l); L += l; }
    const at = (s) => {
      if (s <= 0) { const [a, b] = [P[0], P[1]], l = segL[0] || 1, tx = (b[0] - a[0]) / l, ty = (b[1] - a[1]) / l; return [a[0] + tx * s, a[1] + ty * s, tx, ty]; }
      if (s >= L) { const a = P[P.length - 2], b = P[P.length - 1], l = segL[segL.length - 1] || 1, tx = (b[0] - a[0]) / l, ty = (b[1] - a[1]) / l; return [b[0] + tx * (s - L), b[1] + ty * (s - L), tx, ty]; }
      let acc = 0;
      for (let i = 0; i < segL.length; i++) {
        if (acc + segL[i] >= s) { const u = (s - acc) / (segL[i] || 1), a = P[i], b = P[i + 1], tx = (b[0] - a[0]) / (segL[i] || 1), ty = (b[1] - a[1]) / (segL[i] || 1); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), tx, ty]; }
        acc += segL[i];
      }
      return [P[P.length - 1][0], P[P.length - 1][1], 1, 0];
    };
    const rmax = Math.max(r0, r1), pad = rmax + 16;
    const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
    const minx = Math.min(...xs) - pad, miny = Math.min(...ys) - pad, W = Math.max(...xs) + pad - minx, H = Math.max(...ys) + pad - miny;
    const c = makeCanvas(Math.ceil(W * RES), Math.ceil(H * RES)), g = c.getContext('2d');
    g.scale(RES, RES); g.translate(-minx, -miny);
    const base = rgbOf(color), r = mulberry32(hashStr(key) + seed);
    const s0 = caps[0] ? -r0 : 0, s1 = caps[1] ? L + r1 : L;
    // dark core (the gaps between stitches)
    g.fillStyle = lit(base, 0.42);
    for (let s = s0; s <= s1; s += 2) {
      const [x, y] = at(s); let rr = lerp(r0, r1, clamp(s / L));
      if (s < 0) rr = r0 * Math.sqrt(Math.max(0, 1 - (s / r0) ** 2)); if (s > L) rr = r1 * Math.sqrt(Math.max(0, 1 - ((s - L) / r1) ** 2));
      g.beginPath(); g.arc(x, y, rr * 0.98, 0, TAU); g.fill();
    }
    const sh = sw * 0.72;
    for (let s = s0 + sh * 0.5; s < s1; s += sh) {
      const [x, y, tx, ty] = at(s), nx = -ty, ny = tx;
      let rr = lerp(r0, r1, clamp(s / L)), psi = 0;
      if (s < 0) { const d = Math.min(1, -s / r0); rr = r0 * Math.sqrt(1 - d * d); psi = -Math.asin(d); }
      else if (s > L) { const d = Math.min(1, (s - L) / r1); rr = r1 * Math.sqrt(1 - d * d); psi = Math.asin(d); }
      if (rr < 1.5) continue;
      const rowH = sh * Math.max(0.25, Math.cos(psi)), n = Math.max(3, Math.round((Math.PI * rr) / sw)), dth = Math.PI / n;
      const ang = Math.atan2(ty, tx) - Math.PI / 2;
      for (let k = 0; k < n; k++) {
        const th = -Math.PI / 2 + (k + 0.5) * dth, off = Math.sin(th) * rr, w = Math.cos(th) * rr * dth;
        if (w < 1.1) continue;
        const cp = Math.cos(psi), sp = Math.sin(psi);
        const n3x = nx * Math.sin(th) * cp + tx * sp, n3y = ny * Math.sin(th) * cp + ty * sp, n3z = Math.cos(th) * cp;
        const b = shadeN(n3x, n3y, n3z);
        const col = colorAt ? rgbOf(colorAt(clamp(s / L), th)) : base;
        vStitch(g, x + nx * off, y + ny * off, ang, w * 1.04, rowH * 1.08, col, b, r);
      }
    }
    // trim stitches that poke out of the tube silhouette
    g.globalCompositeOperation = 'destination-in'; g.beginPath();
    for (let s = s0; s <= s1; s += 2) {
      const [x, y] = at(s); let rr = lerp(r0, r1, clamp(s / L));
      if (s < 0) rr = r0 * Math.sqrt(Math.max(0, 1 - (s / r0) ** 2)); if (s > L) rr = r1 * Math.sqrt(Math.max(0, 1 - ((s - L) / r1) ** 2));
      g.moveTo(x + rr * 1.03, y); g.arc(x, y, rr * 1.03, 0, TAU);
    }
    g.fill(); g.globalCompositeOperation = 'source-over';
    if (fuzz) {
      g.lineWidth = 0.9;
      const n = (L + r0 + r1) * 1.1 * fuzz;
      for (let i = 0; i < n; i++) {
        const s = lerp(s0, s1, r()), [x, y, tx, ty] = at(clamp(s, 0, L)), sd = r() < 0.5 ? -1 : 1;
        let rr = lerp(r0, r1, clamp(s / L));
        let nx = -ty * sd, ny = tx * sd;
        if (s < 0 || s > L) { const a = r() * Math.PI - Math.PI / 2, dir = s < 0 ? -1 : 1; nx = tx * dir * Math.cos(a) - ty * Math.sin(a); ny = ty * dir * Math.cos(a) + tx * Math.sin(a); rr = s < 0 ? r0 : r1; }
        const b = 0.9 + r() * 0.4 + (nx * LIGHT[0] + ny * LIGHT[1]) * 0.3;
        hair(g, x + nx * rr * 0.97, y + ny * rr * 0.97, nx, ny, 3 + r() * 6, (r() - 0.5) * 5, lit(base, b + 0.1, 0.16 + r() * 0.25));
      }
    }
    return { canvas: c, ox: -minx, oy: -miny, w: W, h: H };
  });
}

/** Stamp a sprite (from knitEllipsoid/knitTube/felt*) with its origin at (x,y). */
export function stamp(ctx, spr, x, y, { rot = 0, sx = 1, sy = sx, alpha = 1 } = {}) {
  if (alpha <= 0.003) return;
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
  if (alpha < 1) ctx.globalAlpha *= alpha;
  ctx.drawImage(spr.canvas, -spr.ox, -spr.oy, spr.w, spr.h);
  ctx.restore();
}

// ---------------------------------------------------------------- felt
/** Grey fibre tile turned into light/dark alpha specks; laid over a felt colour with source-over. */
export function feltTile() {
  return cached('felt-tile', () => {
    const S = 320, c = makeCanvas(S, S), g = c.getContext('2d'), r = mulberry32(77);
    g.fillStyle = '#808080'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 70; i++) { // soft cloudy density
      const x = r() * S, y = r() * S, rad = 10 + r() * 40, gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const v = r() < 0.5 ? 0 : 255; gr.addColorStop(0, `rgba(${v},${v},${v},0.10)`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`);
      g.fillStyle = gr; for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { g.save(); g.translate(ox, oy); g.fillRect(x - rad, y - rad, rad * 2, rad * 2); g.restore(); }
    }
    g.lineCap = 'round';
    for (let i = 0; i < 5200; i++) { // tangled fibres
      const x = r() * S, y = r() * S, len = 3 + r() * 10, a = r() * TAU, bend = (r() - 0.5) * 6;
      const v = r() < 0.5 ? 30 : 230; g.strokeStyle = `rgba(${v},${v},${v},${0.1 + r() * 0.22})`; g.lineWidth = 0.6 + r() * 0.8;
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        if (x + ox < -20 || x + ox > S + 20 || y + oy < -20 || y + oy > S + 20) continue;
        g.beginPath(); g.moveTo(x + ox, y + oy); g.quadraticCurveTo(x + ox + Math.cos(a) * len * 0.5 - Math.sin(a) * bend, y + oy + Math.sin(a) * len * 0.5 + Math.cos(a) * bend, x + ox + Math.cos(a) * len, y + oy + Math.sin(a) * len); g.stroke();
      }
    }
    return alphaTexture(c, 1.25);
  });
}
function feltPattern(g) { return g.createPattern(feltTile(), 'repeat'); }

/** Fill a path (pathFn(g)) with felt of `color`: base, fibres, thick bevelled edge. */
export function feltFill(g, pathFn, color, { tex = 0.55, bevel = 1, edge = 9 } = {}) {
  g.save();
  pathFn(g); g.fillStyle = color; g.fill();
  pathFn(g); g.clip();
  g.globalAlpha = tex; g.fillStyle = feltPattern(g); pathFn(g); g.fill(); g.globalAlpha = 1;
  if (bevel) {
    // cut edge: darker rim inside, a lighter lip on the upper-left
    g.lineJoin = 'round';
    g.strokeStyle = lit(color, 0.72, 0.55 * bevel); g.lineWidth = edge; pathFn(g); g.stroke();
    g.translate(-1.5, -2); g.strokeStyle = lit(color, 1.18, 0.5 * bevel); g.lineWidth = edge * 0.45; pathFn(g); g.stroke();
  }
  g.restore();
}

/** Running stitch (dashes of thread) along the current path built by pathFn. */
export function runStitch(g, pathFn, { color = PAL.cream, len = 12, gap = 8, w = 3.4, offset = 0 } = {}) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.setLineDash([len, gap]); g.lineDashOffset = offset;
  g.strokeStyle = 'rgba(40,20,10,0.35)'; g.lineWidth = w + 1.4; g.translate(0.8, 1.2); pathFn(g); g.stroke(); g.translate(-0.8, -1.2);
  g.strokeStyle = color; g.lineWidth = w; pathFn(g); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = w * 0.35; g.translate(-0.5, -0.8); pathFn(g); g.stroke();
  g.restore();
}

/** Embroidered thread line (backstitch look) through points or a pathFn. Used live for mouths and brows. */
export function thread(ctx, pts, { color = PAL.thread, w = 4, closed = false, dash = true } = {}) {
  const path = typeof pts === 'function' ? pts : (g) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (closed) g.closePath(); };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash([w * 2.6, w * 0.45]);
  ctx.strokeStyle = color; ctx.lineWidth = w; path(ctx); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = w * 0.35; ctx.translate(-w * 0.15, -w * 0.2); path(ctx); ctx.stroke();
  ctx.restore();
}

/** Twisted yarn strand (roots, strings, whiskers). */
export function yarn(g, pts, { w = 6, color = PAL.cream } = {}) {
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = lit(color, 0.55); g.lineWidth = w + 1.5; path(); g.stroke();
  g.strokeStyle = color; g.lineWidth = w; path(); g.stroke();
  g.setLineDash([w * 0.5, w * 0.9]); g.strokeStyle = lit(color, 0.72); g.lineWidth = w * 0.8; path(); g.stroke();
  g.setLineDash([]); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = w * 0.25; g.translate(-w * 0.15, -w * 0.2); path(); g.stroke();
  g.restore();
}

/**
 * Generic felt sprite: pathFn(g, inset) draws the outline in local coords; origin (ox, oy) given in local coords.
 * Bakes drop shadow, felt, bevel and an optional running stitch `inset` px inside the edge.
 */
export function feltSprite(key, { w, h, path, color, stitch = PAL.cream, inset = 12, shadow = 1, ox = 0, oy = 0, extra = null, stitchLen = 12, stitchGap = 8 }) {
  return cached('felt:' + key, () => {
    const pad = 28, W = w + pad * 2, H = h + pad * 2;
    const c = makeCanvas(Math.ceil(W * RES), Math.ceil(H * RES)), g = c.getContext('2d');
    g.scale(RES, RES); g.translate(pad, pad);
    if (shadow) {
      const s = makeCanvas(Math.ceil(W / 3), Math.ceil(H / 3)), sg = s.getContext('2d');
      sg.scale(1 / 3, 1 / 3); sg.translate(pad + 5, pad + 8); sg.fillStyle = `rgba(50,30,15,${0.42 * shadow})`; path(sg, 0); sg.fill();
      g.save(); g.translate(-pad, -pad); g.imageSmoothingQuality = 'high'; g.drawImage(s, 0, 0, W, H); g.drawImage(s, 0, 0, W, H); g.restore();
    }
    feltFill(g, (gg) => path(gg, 0), color);
    if (extra) extra(g);
    if (stitch) runStitch(g, (gg) => path(gg, inset), { color: stitch, len: stitchLen, gap: stitchGap });
    return { canvas: c, ox: pad + ox, oy: pad + oy, w: W, h: H };
  });
}
const ellPath = (cx, cy, rx, ry) => (g, i) => { g.beginPath(); g.ellipse(cx, cy, Math.max(1, rx - i), Math.max(1, ry - i), 0, 0, TAU); };
const rrPath = (x, y, w, h, r) => (g, i) => { const R = Math.max(1, r - i * 0.5); g.beginPath(); g.roundRect(x + i, y + i, w - i * 2, h - i * 2, R); };

// ---------------------------------------------------------------- buttons & little felt things
export function buttonSprite(r = 16, color = '#1d1a1c', holes = 2, threadCol = '#f3ead8') {
  return cached(`btn:${r}:${color}:${holes}:${threadCol}`, () => {
    const pad = 6, S = r * 2 + pad * 2, c = makeCanvas(Math.ceil(S * RES), Math.ceil(S * RES)), g = c.getContext('2d');
    g.scale(RES, RES); g.translate(r + pad, r + pad);
    g.fillStyle = 'rgba(30,15,5,0.35)'; g.beginPath(); g.ellipse(1.5, 3, r, r * 0.96, 0, 0, TAU); g.fill();
    const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
    gr.addColorStop(0, lit(color, 1.6)); gr.addColorStop(0.45, color); gr.addColorStop(1, lit(color, 0.6));
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
    g.strokeStyle = lit(color, 0.5); g.lineWidth = r * 0.12; g.beginPath(); g.arc(0, 0, r * 0.74, 0, TAU); g.stroke();
    g.strokeStyle = lit(color, 1.5, 0.5); g.lineWidth = r * 0.06; g.beginPath(); g.arc(-0.5, -0.8, r * 0.78, Math.PI * 0.9, Math.PI * 1.6); g.stroke();
    const hs = holes === 4 ? [[-1, -1], [1, -1], [-1, 1], [1, 1]] : [[-1, 0], [1, 0]];
    g.fillStyle = lit(color, 0.35);
    for (const [hx, hy] of hs) { g.beginPath(); g.arc(hx * r * 0.26, hy * r * 0.26, r * 0.11, 0, TAU); g.fill(); }
    g.strokeStyle = threadCol; g.lineWidth = r * 0.13; g.lineCap = 'round';
    if (holes === 4) { g.beginPath(); g.moveTo(-r * 0.26, -r * 0.26); g.lineTo(r * 0.26, r * 0.26); g.moveTo(r * 0.26, -r * 0.26); g.lineTo(-r * 0.26, r * 0.26); g.stroke(); }
    else { g.beginPath(); g.moveTo(-r * 0.26, 0); g.lineTo(r * 0.26, 0); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(-r * 0.42, -r * 0.45, r * 0.2, r * 0.12, -0.6, 0, TAU); g.fill();
    return { canvas: c, ox: r + pad, oy: r + pad, w: S, h: S };
  });
}

/** Soft contact shadow on felt (cached radial sprite). */
export function contactShadow(ctx, x, y, w, alpha = 0.35) {
  const s = cached('cshadow2', () => {
    const c = makeCanvas(128, 48), g = c.getContext('2d');
    g.scale(1, 48 / 128);
    const gr = g.createRadialGradient(64, 64, 2, 64, 64, 63);
    gr.addColorStop(0, 'rgba(40,25,10,0.9)'); gr.addColorStop(0.55, 'rgba(40,25,10,0.4)'); gr.addColorStop(1, 'rgba(40,25,10,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    return c;
  });
  ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(s, x - w / 2, y - w * 0.19, w, w * 0.375); ctx.restore();
}
export function heart(ctx, x, y, s = 1, { rot = 0, alpha = 1, color = PAL.red } = {}) {
  const spr = feltSprite('heart:' + color, { w: 80, h: 72, color, inset: 9, stitchLen: 7, stitchGap: 5, ox: 40, oy: 36, path: (g, i) => {
    const k = 1 - i / 40; g.beginPath(); g.save(); g.translate(40, 38); g.scale(k, k);
    g.moveTo(0, 30); g.bezierCurveTo(-46, 2, -34, -40, 0, -18); g.bezierCurveTo(34, -40, 46, 2, 0, 30); g.closePath(); g.restore(); } });
  stamp(ctx, spr, x, y, { rot, sx: s, alpha });
}
export function star(ctx, x, y, s = 1, { rot = 0, alpha = 1, color = PAL.sun } = {}) {
  const spr = feltSprite('star:' + color, { w: 90, h: 90, color, inset: 10, stitch: '#c27a1c', stitchLen: 6, stitchGap: 5, ox: 45, oy: 47, path: (g, i) => {
    g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, R = (k % 2 ? 19 : 44) - i * (k % 2 ? 0.4 : 1); g.lineTo(45 + Math.cos(a) * R, 47 + Math.sin(a) * R); } g.closePath(); } });
  stamp(ctx, spr, x, y, { rot, sx: s, alpha });
}
export function drop(ctx, x, y, s = 1, { alpha = 1, rot = 0 } = {}) {
  const spr = feltSprite('drop', { w: 40, h: 58, color: '#8fd3f4', stitch: '#ffffff', inset: 7, stitchLen: 5, stitchGap: 4, ox: 20, oy: 36, path: (g, i) => {
    g.beginPath(); g.moveTo(20, 2 + i); g.bezierCurveTo(26, 18, 38 - i, 28, 38 - i, 38); g.arc(20, 38, 18 - i, 0, Math.PI); g.bezierCurveTo(2 + i, 28, 14, 18, 20, 2 + i); g.closePath(); } });
  stamp(ctx, spr, x, y, { sx: s, alpha, rot });
}

// ---------------------------------------------------------------- text on felt
/** Felt patch with satin-stitch letters and a running-stitch border. Cached per text+style. */
export function patch(ctx, text, x, y, { size = 64, fill = PAL.red, ink = PAL.white, stitch = PAL.cream, rot = 0, s = 1, alpha = 1, font = 'Fredoka', padX = 34, padY = 18, shape = 'round' } = {}) {
  const key = `patch:${text}:${size}:${fill}:${ink}:${stitch}:${font}:${shape}`;
  const spr = cached(key, () => {
    const m = makeCanvas(10, 10).getContext('2d'); m.font = `700 ${size}px '${font}'`;
    const tw = m.measureText(text).width, w = tw + padX * 2, h = size * 1.12 + padY * 2;
    const path = shape === 'burst'
      ? (g, i) => { g.beginPath(); const n = 18; for (let k = 0; k < n * 2; k++) { const a = (k / (n * 2)) * TAU, R = (k % 2 ? 0.78 : 1.0) - i / Math.max(w, h) * 1.6; g.lineTo(w / 2 + Math.cos(a) * w * 0.62 * R, h / 2 + Math.sin(a) * h * 0.85 * R); } g.closePath(); }
      : rrPath(0, 0, w, h, h * 0.32);
    const ink2 = cached(key + ':ink', () => {
      const tc = makeCanvas(Math.ceil(w * RES), Math.ceil(h * RES)), tg = tc.getContext('2d');
      tg.scale(RES, RES); tg.font = `700 ${size}px '${font}'`; tg.textAlign = 'center'; tg.textBaseline = 'middle';
      tg.fillStyle = ink; tg.fillText(text, w / 2, h / 2 + size * 0.04);
      // satin stitch: fine diagonal threads across the letters
      tg.globalCompositeOperation = 'source-atop'; tg.strokeStyle = lit(ink, 0.8, 0.5); tg.lineWidth = 1.1;
      for (let k = -h; k < w + h; k += 4.2) { tg.beginPath(); tg.moveTo(k, 0); tg.lineTo(k - h * 0.7, h); tg.stroke(); }
      tg.strokeStyle = 'rgba(255,255,255,0.35)'; tg.lineWidth = 0.8;
      for (let k = -h + 2; k < w + h; k += 8.4) { tg.beginPath(); tg.moveTo(k, 0); tg.lineTo(k - h * 0.7, h); tg.stroke(); }
      return tc;
    });
    return feltSprite(key, { w, h, path, color: fill, stitch, inset: 11, ox: w / 2, oy: h / 2, extra: (g) => {
      g.save(); g.globalAlpha = 0.45; g.filter = 'none'; g.drawImage(ink2, 1.5, 2.5, w, h); g.restore(); // thread thickness shadow
      g.drawImage(ink2, 0, 0, w, h);
    } });
  });
  if (alpha > 0.01 && s > 0.01) stamp(ctx, spr, x, y, { rot, sx: s, alpha });
  return spr;
}

/** Hanging felt label on a yarn string (name tags). Swings like a pendulum. */
export function tag(ctx, text, x, y, { t = 0, alpha = 1, s = 1, len = 70, fill = PAL.cream, ink = PAL.ink, size = 46, seed = 0 } = {}) {
  if (alpha <= 0.01) return;
  const sw = Math.sin(t * 2.4 + seed) * 0.08 * s;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(sw);
  yarn(ctx, [[0, 0], [2, len * s * 0.5], [0, len * s]], { w: 4 * s, color: PAL.red });
  patch(ctx, text, 0, len * s + size * 0.9 * s, { size, fill, ink, stitch: PAL.red, s });
  ctx.restore();
}

// ---------------------------------------------------------------- characters
// Local units: feet centre at (0,0), up is -y. s = 1 makes a monkey about 440 px tall.
function face(ctx, o, cx, cy, sc, look) {
  // shared face features: eyes, brows, mouth, cheeks. sc = feature scale, cx,cy = face centre.
  const { mood = 'smile', eyes = 'button', brows = null, talk = 0, t = 0, blush = 1, eyeGap = 38, eyeY = -14, mouthY = 44, eyeR = 17, mouthW = 1 } = o;
  const ex = eyeGap * sc, lx = look * 22 * sc;
  for (const sd of [-1, 1]) {
    const x = cx + sd * ex * (1 - sd * look * 0.12) + lx, y = cy + eyeY * sc;
    if (eyes === 'button' || eyes === 'wide') {
      const R = eyeR * (eyes === 'wide' ? 1.25 : 1);
      if (eyes === 'wide') { ctx.fillStyle = PAL.white; ctx.beginPath(); ctx.arc(x, y, R * sc * 1.45, 0, TAU); ctx.fill(); }
      stamp(ctx, buttonSprite(Math.round(R), '#1f1b1d', 2, '#efe4cf'), x, y, { sx: sc });
    } else if (eyes === 'happy') {
      thread(ctx, [[x - 13 * sc, y + 4 * sc], [x - 6 * sc, y - 6 * sc], [x, y - 8 * sc], [x + 6 * sc, y - 6 * sc], [x + 13 * sc, y + 4 * sc]], { w: 5 * sc, dash: false });
    } else if (eyes === 'x') {
      const k = 11 * sc;
      thread(ctx, [[x - sd * k, y - k], [x + sd * k * 0.6, y], [x - sd * k, y + k]], { w: 5 * sc, dash: false });
    } else if (eyes === 'closed') {
      thread(ctx, [[x - 13 * sc, y], [x, y + 6 * sc], [x + 13 * sc, y]], { w: 5 * sc, dash: false });
    }
    if (brows) {
      // brows: 'sad' (inner up), 'angry' (inner down), 'up', 'sly' (one up)
      let inner = 0, outer = 0;
      if (brows === 'sad') { inner = -10; outer = 4; } else if (brows === 'angry') { inner = 8; outer = -8; } else if (brows === 'up') { inner = -10; outer = -10; } else if (brows === 'sly') { inner = sd > 0 ? -12 : 4; outer = sd > 0 ? -16 : 2; }
      const by = y - 30 * sc;
      thread(ctx, [[x - sd * 14 * sc, by + inner * sc], [x + sd * 16 * sc, by + outer * sc]], { w: 4.5 * sc, dash: false });
    }
    if (blush > 0) { ctx.save(); ctx.globalAlpha *= 0.55 * blush; ctx.fillStyle = PAL.pink; ctx.beginPath(); ctx.ellipse(x + sd * 30 * sc, y + 34 * sc, 15 * sc, 10 * sc, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  }
  // mouth
  const mx = cx + lx * 1.1, my = cy + mouthY * sc, W = 22 * sc * mouthW;
  let m = mood, open = 0;
  if (talk > 0) open = talk * (0.5 + 0.5 * Math.sin(t * 19)) * (0.6 + 0.4 * Math.sin(t * 7.3));
  if (m === 'chew') { open = 0.35 + 0.35 * Math.sin(t * 16); m = 'smile'; }
  if (m === 'grin' || open > 0.15) {
    const o2 = m === 'grin' ? 1 : open;
    ctx.save(); ctx.fillStyle = '#7b2532';
    ctx.beginPath(); ctx.moveTo(mx - W * 1.1, my - 3 * sc); ctx.quadraticCurveTo(mx, my + (8 + 26 * o2) * sc, mx + W * 1.1, my - 3 * sc); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PAL.pink; ctx.beginPath(); ctx.ellipse(mx, my + (4 + 10 * o2) * sc, W * 0.55, 5 * sc * o2 + 1, 0, 0, Math.PI); ctx.fill();
    ctx.restore();
    thread(ctx, (g) => { g.beginPath(); g.moveTo(mx - W * 1.1, my - 3 * sc); g.quadraticCurveTo(mx, my + (8 + 26 * o2) * sc, mx + W * 1.1, my - 3 * sc); g.closePath(); }, { w: 3.5 * sc });
  } else if (m === 'o' || m === 'ouch') {
    const R = (m === 'ouch' ? 15 : 9) * sc;
    ctx.fillStyle = '#7b2532'; ctx.beginPath(); ctx.ellipse(mx, my + 4 * sc, R * 0.8, R, 0, 0, TAU); ctx.fill();
    thread(ctx, (g) => { g.beginPath(); g.ellipse(mx, my + 4 * sc, R * 0.8, R, 0, 0, TAU); }, { w: 3.5 * sc });
  } else if (m === 'frown') {
    thread(ctx, (g) => { g.beginPath(); g.moveTo(mx - W, my + 10 * sc); g.quadraticCurveTo(mx, my - 8 * sc, mx + W, my + 10 * sc); }, { w: 4.5 * sc });
  } else if (m === 'wavy') {
    thread(ctx, [[mx - W, my + 4 * sc], [mx - W * 0.5, my - 2 * sc], [mx, my + 4 * sc], [mx + W * 0.5, my - 2 * sc], [mx + W, my + 4 * sc]], { w: 4.5 * sc, dash: false });
  } else if (m === 'sly') {
    thread(ctx, (g) => { g.beginPath(); g.moveTo(mx - W, my + 2 * sc); g.quadraticCurveTo(mx + W * 0.2, my + 12 * sc, mx + W * 1.15, my - 9 * sc); }, { w: 4.5 * sc });
  } else if (m === 'flat') {
    thread(ctx, [[mx - W * 0.8, my + 3 * sc], [mx + W * 0.8, my + 3 * sc]], { w: 4.5 * sc });
  } else { // smile
    thread(ctx, (g) => { g.beginPath(); g.moveTo(mx - W, my - 3 * sc); g.quadraticCurveTo(mx, my + 16 * sc, mx + W, my - 3 * sc); }, { w: 4.5 * sc });
  }
}

const MK = () => ({
  head: knitEllipsoid('mk-head', { rx: 118, ry: 104, color: PAL.monkey, sw: 21 }),
  ear: knitEllipsoid('mk-ear', { rx: 42, ry: 40, color: PAL.monkey, sw: 16, flat: 0.25 }),
  earIn: knitEllipsoid('mk-earin', { rx: 25, ry: 24, color: PAL.monkeyTan, sw: 13, flat: 0.45, fuzz: 0.5 }),
  eyeMask: knitEllipsoid('mk-mask', { rx: 46, ry: 50, color: PAL.monkeyTan, sw: 16, flat: 0.4, fuzz: 0.4 }),
  muzzle: knitEllipsoid('mk-muzzle', { rx: 72, ry: 47, color: PAL.monkeyTan, sw: 16, fuzz: 0.5 }),
  body: knitEllipsoid('mk-body', { rx: 90, ry: 104, color: PAL.monkey, sw: 21 }),
  belly: knitEllipsoid('mk-belly', { rx: 58, ry: 68, color: PAL.monkeyTan, sw: 16, flat: 0.45, fuzz: 0.4 }),
  arm: knitTube('mk-arm', { pts: [[0, 0], [3, 50], [0, 110]], r0: 21, r1: 18, color: PAL.monkey, sw: 17 }),
  hand: knitEllipsoid('mk-hand', { rx: 25, ry: 24, color: PAL.monkeyTan, sw: 13 }),
  leg: knitTube('mk-leg', { pts: [[0, 0], [0, 62]], r0: 24, r1: 22, color: PAL.monkey, sw: 17 }),
  foot: knitEllipsoid('mk-foot', { rx: 33, ry: 21, color: PAL.monkeyTan, sw: 13 }),
  tail: knitTube('mk-tail', { pts: smooth([[0, 0], [60, 10], [110, -20], [130, -80], [110, -130], [75, -135], [62, -105], [82, -86]], 6), r0: 13, r1: 11, color: PAL.monkey, sw: 14 }),
});

/**
 * Knitted monkey. o: { x, y, s, t, look (-1..1 head turn), tilt, hop, squash, mood, eyes, brows, talk, blush,
 * armL, armR (0 = down, PI/2 = sideways, PI = up), legL, legR, belly (1..1.4 full tummy), bandage, wob }
 * Returns world positions { handL, handR, head, top } for props.
 */
export function monkey(ctx, o) {
  const P = cached('mk-parts', MK);
  const { x, y, s = 1, t = 0, look = 0, tilt = 0, hop = 0, squash = 0, armL = 0.25, armR = 0.25, legL = 0, legR = 0, belly = 1, wob = 1, headTilt = 0, bandage = 0, seed = 0, sit = 0 } = o;
  const rock = (Math.sin(t * 2.3 + seed) * 0.035 + noise.n2(t * 0.9, seed + 3) * 0.02) * wob + tilt;
  const bob = Math.abs(Math.sin(t * 2.3 + seed)) * 4 * wob;
  const out = {};
  const M0i = ctx.getTransform().invertSelf();
  ctx.save();
  ctx.translate(x, y - hop * s); ctx.rotate(rock); ctx.scale(s * (1 + squash * 0.12), s * (1 - squash * 0.12));
  ctx.translate(0, -bob);
  const W = (lx, ly) => { const p = M0i.transformPoint(ctx.getTransform().transformPoint(new DOMPoint(lx, ly))); return [p.x, p.y]; };
  // tail (behind)
  stamp(ctx, P.tail, 58, -96 + sit * 40, { rot: Math.sin(t * 2.1 + seed) * 0.12 });
  // legs
  const legY = -76 + sit * 30;
  for (const [sd, a] of [[-1, legL], [1, legR]]) {
    const ang = sit ? -sd * 1.25 : a;
    stamp(ctx, P.leg, sd * 42, legY, { rot: ang });
    const fx = sd * 42 - Math.sin(ang) * 66, fy = legY + Math.cos(ang) * 66;
    stamp(ctx, P.foot, fx + sd * 6, fy + 2, { rot: ang * 0.5 });
  }
  // body + belly
  const by = -160 + sit * 30;
  stamp(ctx, P.body, 0, by, { sx: belly, sy: 1 + (belly - 1) * 0.5 });
  stamp(ctx, P.belly, look * 10, by + 14, { sx: belly * (1 - Math.abs(look) * 0.1), sy: 1 + (belly - 1) * 0.6 });
  // arms (front)
  for (const [sd, a] of [[-1, armL], [1, armR]]) {
    const sx = sd * 76, sy = by - 52;
    const ang = sd * -a; // rotate outward
    stamp(ctx, P.arm, sx, sy, { rot: ang });
    const hx = sx - Math.sin(ang) * 118, hy = sy + Math.cos(ang) * 118;
    stamp(ctx, P.hand, hx, hy);
    out[sd < 0 ? 'handL' : 'handR'] = W(hx, hy);
  }
  // head
  const hy0 = by - 178;
  ctx.save(); ctx.translate(0, hy0); ctx.rotate(headTilt);
  for (const sd of [-1, 1]) {
    const ex = sd * (112 - sd * look * 18), sc = 1 - sd * look * 0.12;
    stamp(ctx, P.ear, ex, -6, { sx: sc });
    stamp(ctx, P.earIn, ex + sd * 2, -4, { sx: sc * 0.95 });
  }
  stamp(ctx, P.head, 0, 0);
  const fx = look * 30;
  stamp(ctx, P.eyeMask, -38 + fx * (1 + look * 0.2), -12, { sx: 1 + look * 0.12 });
  stamp(ctx, P.eyeMask, 38 + fx * (1 - look * 0.2), -12, { sx: 1 - look * 0.12 });
  stamp(ctx, P.muzzle, fx * 1.1, 40, { sx: 1 - Math.abs(look) * 0.08 });
  // nostrils
  ctx.fillStyle = PAL.thread;
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx * 1.15 + sd * 10, 20, 4, 3, 0, 0, TAU); ctx.fill(); }
  face(ctx, { ...o, eyeGap: 38, eyeY: -14, mouthY: 44 }, fx * 0.9, 0, 1, 0);
  if (bandage > 0) { ctx.save(); ctx.translate(-58 + fx * 0.5, -62); ctx.scale(0.55 * bandage, 0.55 * bandage); plaster(ctx, 0, 0, 1); ctx.restore(); }
  out.head = W(0, 0); out.top = W(0, -110); out.mouth = W(fx, 44);
  ctx.restore();
  ctx.restore();
  return out;
}

const TK = () => {
  // shell plates: a few cells laid over the dome; stitches near a cell border are knitted in the darker yarn
  const cells = [[0, -0.2], [-0.62, -0.25], [0.62, -0.25], [-0.32, 0.45], [0.32, 0.45], [-1.1, 0.4], [1.1, 0.4], [0, 1.1], [-0.8, 1.1], [0.8, 1.1]];
  const plateAt = (th, phi) => {
    let d1 = 9, d2 = 9;
    for (const [cx, cy] of cells) { const d = Math.hypot((th - cx) * 1.0, (phi + 0.9 - cy) * 1.25); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
    return d2 - d1 < 0.17 ? PAL.shellLine : PAL.shell;
  };
  return {
    shell: knitEllipsoid('tk-shell', { rx: 168, ry: 132, color: PAL.shell, sw: 21, colorAt: plateAt, clip: (g) => { g.beginPath(); g.rect(-200, -200, 400, 210); } }),
    rim: knitTube('tk-rim', { pts: smooth([[-170, -6], [-90, 10], [0, 14], [90, 10], [170, -6]], 6), r0: 17, r1: 17, color: PAL.shellRim, sw: 16 }),
    head: knitEllipsoid('tk-head', { rx: 74, ry: 66, color: PAL.turtle, sw: 17 }),
    neck: knitTube('tk-neck', { pts: [[0, 0], [40, -30], [70, -62]], r0: 30, r1: 26, color: PAL.turtle, sw: 16 }),
    leg: knitEllipsoid('tk-leg', { rx: 30, ry: 40, color: PAL.turtle, sw: 14 }),
    tail: knitTube('tk-tail', { pts: [[0, 0], [-30, 6], [-52, 2]], r0: 14, r1: 5, color: PAL.turtle, sw: 11, caps: [true, true] }),
  };
};

/**
 * Knitted turtle: body in profile (facing right; face=-1 mirrors), head turned to camera.
 * o: { x, y, s, t, face, look, tilt, hop, squash, mood, eyes, brows, talk, walk (phase speed), neck (0..1 reach), headTilt, flip (0..1 on its back) }
 */
export function turtle(ctx, o) {
  const P = cached('tk-parts', TK);
  const { x, y, s = 1, t = 0, face: fc = 1, look = 0, tilt = 0, hop = 0, squash = 0, walk = 0, neck = 0, headTilt = 0, wob = 1, seed = 1, flip = 0, legLift = 0 } = o;
  const rock = (Math.sin(t * 2.0 + seed) * 0.03 + noise.n2(t * 0.8, seed + 7) * 0.015) * wob + tilt;
  const step = walk ? Math.sin(t * walk) : 0;
  const bob = Math.abs(step) * 6 + Math.abs(Math.sin(t * 2 + seed)) * 3 * wob;
  const out = {};
  const M0i = ctx.getTransform().invertSelf();
  ctx.save();
  ctx.translate(x, y - hop * s); ctx.scale(s * fc, s); ctx.rotate(rock);
  if (flip) { ctx.translate(0, -100); ctx.rotate(flip * Math.PI); ctx.translate(0, 100); }
  ctx.scale(1 + squash * 0.12, 1 - squash * 0.12);
  ctx.translate(0, -bob);
  const W = (lx, ly) => { const p = M0i.transformPoint(ctx.getTransform().transformPoint(new DOMPoint(lx, ly))); return [p.x, p.y]; };
  // far legs, tail
  stamp(ctx, P.tail, -150, -56);
  for (const [lx, ph] of [[-70, 0.5], [120, 0]]) stamp(ctx, P.leg, lx, -34 - Math.max(0, Math.sin(t * walk + ph * Math.PI)) * 14 * (walk ? 1 : 0), { rot: (walk ? Math.sin(t * walk + ph * Math.PI) * 0.35 : 0) + legLift * 0.8, sx: 0.85, sy: 0.85, alpha: 1 });
  // neck + head
  const nr = neck * 40;
  stamp(ctx, P.neck, 128, -60 - nr * 0.2, { sx: 1 + neck * 0.4, sy: 1 + neck * 0.25 });
  stamp(ctx, P.shell, 0, -66);
  stamp(ctx, P.rim, 0, -66);
  // near legs
  for (const [lx, ph] of [[-108, 0], [84, 0.5]]) stamp(ctx, P.leg, lx, -28 - Math.max(0, Math.sin(t * walk + ph * Math.PI)) * 14 * (walk ? 1 : 0), { rot: (walk ? Math.sin(t * walk + ph * Math.PI) * 0.35 : 0) - legLift * 0.9 });
  out.handF = W(110, -10); out.handB = W(-100, -10);
  const hx = 208 + nr, hy = -142 - nr * 0.8;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(headTilt); if (fc < 0) ctx.scale(-1, 1);
  stamp(ctx, P.head, 0, 0);
  face(ctx, { ...o, eyeGap: 26, eyeY: -10, mouthY: 28, eyeR: 15, mouthW: 0.8 }, look * 20, 0, 0.92, 0);
  out.head = W(0, 0); out.mouth = W(0, 26);
  ctx.restore();
  out.top = W(0, -200);
  ctx.restore();
  return out;
}

// ---------------------------------------------------------------- props
function plaster(ctx, x, y, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  for (const r of [0.6, -0.6]) {
    const spr = feltSprite('plaster', { w: 120, h: 38, color: '#f1c9a0', stitch: '#c48b5c', inset: 6, stitchLen: 4, stitchGap: 4, ox: 60, oy: 19, path: rrPath(0, 0, 120, 38, 14),
      extra: (g) => { g.fillStyle = '#fbe3c8'; g.fillRect(40, 7, 40, 24); g.fillStyle = 'rgba(150,100,60,0.5)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(46 + (i % 3) * 14, 14 + Math.floor(i / 3) * 10, 1.6, 0, TAU); g.fill(); } } });
    stamp(ctx, spr, x, y, { rot: r });
  }
  ctx.restore();
}
export { plaster };

/** One knitted banana (local: stalk end at origin, curving to the right/up). bite 0..1 eats it from the tip. */
export function banana(ctx, x, y, { rot = 0, s = 1, bite = 0, alpha = 1, peeled = false } = {}) {
  const spr = knitTube(peeled ? 'banana-p' : 'banana', { pts: smooth([[0, 0], [40, 12], [86, 6], [118, -20]], 6), r0: 13, r1: 15, color: peeled ? '#fff0c4' : PAL.banana, sw: 13,
    colorAt: peeled ? null : (u) => (u < 0.06 || u > 0.97 ? PAL.bananaTip : PAL.banana) });
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  if (bite > 0) { ctx.beginPath(); ctx.rect(-40, -80, 40 + 150 * (1 - bite), 160); ctx.clip(); }
  stamp(ctx, spr, 0, 0);
  if (peeled) { // three floppy peel flaps hanging back from the base
    for (let k = -1; k <= 1; k++) {
      const fl = feltSprite('peelflap', { w: 30, h: 70, color: PAL.banana, stitch: '#b88a2a', inset: 6, stitchLen: 4, stitchGap: 4, ox: 15, oy: 4, path: (g, i) => { g.beginPath(); g.moveTo(3 + i, 0); g.quadraticCurveTo(28 - i, 20, 18 - i * 0.5, 68 - i); g.quadraticCurveTo(8, 60 - i, 3 + i, 0); g.closePath(); } });
      stamp(ctx, fl, 30, 4 + k * 4, { rot: 0.6 + k * 0.7 });
    }
  }
  ctx.restore();
}
/** Felt banana peel (floppy, three strips) for throwing. */
export function peel(ctx, x, y, { rot = 0, s = 1, alpha = 1 } = {}) {
  const spr = feltSprite('peel', { w: 120, h: 110, color: PAL.banana, stitch: '#b88a2a', inset: 8, stitchLen: 5, stitchGap: 4, ox: 60, oy: 26, path: (g, i) => {
    g.beginPath(); g.moveTo(52, 20 + i);
    g.bezierCurveTo(20, 30, 4 + i, 70, 14 + i, 104 - i); g.bezierCurveTo(30, 80, 40, 60, 50, 54);
    g.bezierCurveTo(56, 80, 58, 96, 62, 106 - i); g.bezierCurveTo(70, 90, 70, 70, 68, 54);
    g.bezierCurveTo(84, 66, 96, 84, 108 - i, 100 - i); g.bezierCurveTo(114 - i, 66, 96, 34, 70, 20 + i);
    g.bezierCurveTo(66, 4 + i, 56, 4 + i, 52, 20 + i); g.closePath(); },
    extra: (g) => { g.fillStyle = PAL.bananaTip; g.beginPath(); g.ellipse(61, 10, 8, 7, 0, 0, TAU); g.fill(); } });
  stamp(ctx, spr, x, y, { rot, sx: s, alpha });
}

/** Banana leaf in felt (origin at its stem, pointing +x). dry 0..1 crossfades to a wilted brown leaf. */
function leafSprite(dry) {
  return feltSprite('leaf:' + dry, { w: 360, h: 120, color: dry ? PAL.leafDry : PAL.leaf, stitch: dry ? '#6b4f26' : '#d7f0a6', inset: 0, ox: 0, oy: 60, shadow: 0.8,
    path: (g, i) => { g.beginPath(); g.moveTo(0, 60); g.bezierCurveTo(60, -4, 260, -10, 360, 50); g.bezierCurveTo(250, 120, 70, 126, 0, 60); g.closePath(); },
    extra: (g) => {
      // torn slits typical of banana leaves, and side veins as running stitch
      g.save(); g.globalCompositeOperation = 'destination-out';
      for (const [sx, top] of [[150, 1], [235, 0], [290, 1]]) { g.beginPath(); g.moveTo(sx, top ? 8 : 112); g.lineTo(sx - 18, 60); g.lineTo(sx - 12, 60); g.closePath(); g.fill(); }
      g.restore();
      runStitch(g, (gg) => { gg.beginPath(); gg.moveTo(6, 60); gg.quadraticCurveTo(180, 52, 352, 50); }, { color: dry ? '#6b4f26' : '#e8f7c4', len: 14, gap: 6, w: 4 });
      for (let k = 0; k < 9; k++) {
        const vx = 40 + k * 34;
        runStitch(g, (gg) => { gg.beginPath(); gg.moveTo(vx, 56); gg.lineTo(vx + 26, 18 + k * 2.5); }, { color: dry ? '#8a6a35' : '#bfe58c', len: 6, gap: 5, w: 2.4 });
        runStitch(g, (gg) => { gg.beginPath(); gg.moveTo(vx, 62); gg.lineTo(vx + 26, 100 - k * 2.8); }, { color: dry ? '#8a6a35' : '#bfe58c', len: 6, gap: 5, w: 2.4 });
      }
    } });
}
const TRUNK = (h) => knitTube('trunk:' + h, { pts: [[0, 0], [0, -h]], r0: 30, r1: 23, color: PAL.trunk, sw: 18, caps: [false, false],
  colorAt: (u, th) => (Math.abs(Math.sin(th * 3 + u * 9)) > 0.93 ? '#7f9d43' : PAL.trunk) });

function leafFan(ctx, x, y, { t = 0, wilt = 0, sway = 0, scale = 1, n = 5, seed = 0, front = null } = {}) {
  // leaves fan out from (x,y); wilt droops them and turns them brown
  const angs = [-2.5, -1.95, -1.25, -0.75, -0.25].slice(0, n);
  angs.forEach((a0, i) => {
    if (front !== null && (i % 2 === 0) !== front) return;
    const left = a0 < -Math.PI / 2;
    const w = Math.sin(t * 1.7 + i * 1.3 + seed) * 0.06 + sway;
    const droop = wilt * (left ? -1 : 1) * (0.9 + i * 0.1);
    const a = a0 + w + droop * 1.1;
    const sc = scale * (0.85 + (i % 3) * 0.1);
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    if (left) ctx.scale(1, -1);
    ctx.scale(sc, sc * (1 - wilt * 0.25));
    const g = leafSprite(0), d = leafSprite(1);
    if (wilt < 0.98) stamp(ctx, g, 0, 0);
    if (wilt > 0.02) stamp(ctx, d, 0, 0, { alpha: clamp(wilt * 1.4) });
    ctx.restore();
  });
}

/** Roots made of curly yarn (local: top at origin, hanging down). */
function rootsSprite() {
  return cached('roots', () => {
    const c = makeCanvas(Math.ceil(200 * RES), Math.ceil(150 * RES)), g = c.getContext('2d'); g.scale(RES, RES); g.translate(100, 10);
    const r = mulberry32(5);
    for (let k = 0; k < 9; k++) {
      const a = -0.9 + (k / 8) * 1.8, pts = [[Math.sin(a) * 14, 0]];
      let x = pts[0][0], y = 0;
      for (let i = 0; i < 6; i++) { x += Math.sin(a) * 14 + Math.sin(i * 1.7 + k) * 9; y += 18 + r() * 6; pts.push([x, y]); }
      yarn(g, smooth(pts, 5), { w: 5.5 - (k % 3), color: k % 2 ? '#e8d3ad' : '#c9a777' });
    }
    return { canvas: c, ox: 100, oy: 10, w: 200, h: 150 };
  });
}
/** Cut face of the trunk: cream felt disc with concentric stitched rings. */
function cutFace(ctx, x, y, rx, rot = 0) {
  const spr = feltSprite('cutface', { w: 64, h: 30, color: '#f2efc9', stitch: '#9ab95a', inset: 6, stitchLen: 4, stitchGap: 3, shadow: 0, ox: 32, oy: 15, path: ellPath(32, 15, 32, 15),
    extra: (g) => { runStitch(g, (gg) => { gg.beginPath(); gg.ellipse(32, 15, 15, 7, 0, 0, TAU); }, { color: '#b9cf7a', len: 3, gap: 3, w: 2 }); } });
  stamp(ctx, spr, x, y, { rot, sx: rx / 32 });
}

/**
 * A banana plant piece. which: 'top' (trunk up from the cut + leaves), 'bottom' (trunk down from the cut + roots), 'full'.
 * Local origin = the cut point; trunk is vertical (rot rotates the piece). h = full trunk height. cut = 0..1 from base.
 */
export function plantPiece(ctx, which, { x, y, rot = 0, s = 1, h = 520, cut = 0.5, t = 0, wilt = 0, sway = 0, leafScale = 1, roots = true, bunch = 0, seam = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const hb = h * cut, ht = h - hb;
  if (which === 'top' || which === 'full') {
    leafFan(ctx, 0, -ht, { t, wilt, sway, scale: leafScale, front: false, seed: x * 0.01 });
    stamp(ctx, TRUNK(Math.round(ht)), 0, 0, { sy: 1 - wilt * 0.08 });
    if (bunch > 0) bananaBunch(ctx, 18, -ht + 40, { n: bunch, t });
    leafFan(ctx, 0, -ht, { t, wilt, sway, scale: leafScale, front: true, seed: x * 0.01 });
    if (which === 'top') cutFace(ctx, 0, 0, 30, 0);
  }
  if (which === 'bottom' || which === 'full') {
    if (roots) stamp(ctx, rootsSprite(), 0, hb - 6);
    stamp(ctx, TRUNK(Math.round(hb)), 0, hb);
    if (which === 'bottom') cutFace(ctx, 0, 0, 30, 0);
  }
  if (seam > 0) { // the cut line being sewn on the trunk
    ctx.save(); ctx.beginPath(); ctx.rect(-50, -8, 100 * seam, 16); ctx.clip();
    thread(ctx, [[-38, 0], [38, 0]], { color: PAL.red, w: 5 });
    ctx.restore();
  }
  ctx.restore();
}
/** Planted banana tree (base on the ground at x,y). grow 0..1, bunch 0..1 (bananas appear one by one). */
export function bananaTree(ctx, x, y, { s = 1, grow = 1, t = 0, wilt = 0, sway = 0, bunch = 0 } = {}) {
  const h = 560;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = clamp(grow), H = Math.round(lerp(120, h, g) / 20) * 20;
  leafFan(ctx, 0, -H, { t, wilt, sway, scale: lerp(0.35, 1.1, g), front: false, seed: x * 0.01 });
  stamp(ctx, TRUNK(H), 0, 0);
  if (bunch > 0) bananaBunch(ctx, 24, -H + 40, { n: bunch, t, s: 1.45 });
  leafFan(ctx, 0, -H, { t, wilt, sway, scale: lerp(0.35, 1.1, g), front: true, seed: x * 0.01 });
  ctx.restore();
  return { top: [x, y - H * s], H: H * s };
}
/** Bunch of knitted bananas hanging from a stalk with a felt banana heart. n 0..1 */
export function bananaBunch(ctx, x, y, { n = 1, t = 0, s = 1 } = {}) {
  const total = 12, shown = n * total;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.5) * 0.04);
  yarn(ctx, [[0, -20], [10, 60], [14, 200]], { w: 10, color: '#7f9d43' });
  // banana heart
  if (n > 0.3) {
    const hs = feltSprite('bheart', { w: 60, h: 90, color: PAL.heart, stitch: '#e7a1c9', inset: 8, stitchLen: 6, stitchGap: 4, ox: 30, oy: 6, path: (g, i) => { g.beginPath(); g.moveTo(30, 4 + i); g.bezierCurveTo(60 - i, 20, 52 - i, 70, 30, 88 - i); g.bezierCurveTo(8 + i, 70, 0 + i, 20, 30, 4 + i); g.closePath(); } });
    stamp(ctx, hs, 14, 200, { sx: clamp((n - 0.3) * 3) });
  }
  for (let i = 0; i < total; i++) {
    const p = clamp(shown - i);
    if (p <= 0) continue;
    const row = Math.floor(i / 4), k = i % 4;
    const bx = 8 + row * 4, by = 40 + row * 52, a = -1.9 + k * 0.42 + row * 0.05;
    const sc = ease.outBack(p, 2.4) * 0.72;
    banana(ctx, bx + Math.cos(a) * 18, by + Math.sin(a) * 4, { rot: a + Math.PI * 0.5 + (k - 1.5) * 0.25 - 1.6, s: sc });
  }
  ctx.restore();
}

/** Tuft of felt thorns (duri). */
export function thorns(ctx, x, y, { s = 1, rot = 0, alpha = 1, seed = 0 } = {}) {
  const spr = feltSprite('thorns:' + (seed % 3), { w: 150, h: 96, color: PAL.thorn, stitch: '#c7d98d', inset: 0, ox: 75, oy: 90, stitchLen: 5, stitchGap: 4,
    path: (g, i) => {
      const r = mulberry32(31 + (seed % 3)); g.beginPath(); g.moveTo(4, 92);
      const n = 6;
      for (let k = 0; k < n; k++) { const x0 = 4 + (k / n) * 142, x1 = 4 + ((k + 0.5) / n) * 142, x2 = 4 + ((k + 1) / n) * 142; g.lineTo(x0 + 4, 70 - r() * 10); g.lineTo(x1 + (r() - 0.5) * 16, 6 + r() * 20); g.lineTo(x2 - 4, 70 - r() * 10); }
      g.lineTo(146, 92); g.closePath(); },
    extra: (g) => { g.fillStyle = '#e9e2b8'; const r = mulberry32(31 + (seed % 3)); for (let k = 0; k < 6; k++) { r(); const tx = 4 + ((k + 0.5) / 6) * 142 + (r() - 0.5) * 16, ty = 6 + r() * 20; r(); g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx - 5, ty + 16); g.lineTo(tx + 5, ty + 16); g.closePath(); g.fill(); } } });
  stamp(ctx, spr, x, y, { rot, sx: s, alpha });
}
/** Soil mound in brown felt. */
export function mound(ctx, x, y, { s = 1 } = {}) {
  const spr = feltSprite('mound', { w: 300, h: 90, color: PAL.soil, stitch: '#d9b48a', inset: 14, ox: 150, oy: 70, path: (g, i) => { g.beginPath(); g.moveTo(i, 88); g.bezierCurveTo(40, 10 + i, 260, 10 + i, 300 - i, 88); g.closePath(); },
    extra: (g) => { g.fillStyle = PAL.soilDeep; const r = mulberry32(8); for (let k = 0; k < 14; k++) { g.beginPath(); g.ellipse(40 + r() * 220, 50 + r() * 30, 4, 3, r(), 0, TAU); g.fill(); } } });
  stamp(ctx, spr, x, y, { sx: s });
}
/** Felt scissors (open 0..1). Origin at the pivot, blades point +x. */
export function scissors(ctx, x, y, { rot = 0, s = 1, open = 0 } = {}) {
  const blade = feltSprite('blade', { w: 130, h: 26, color: '#c9d2da', stitch: '#7a8794', inset: 6, stitchLen: 5, stitchGap: 4, ox: 10, oy: 13, path: (g, i) => { g.beginPath(); g.moveTo(i, 6 + i); g.lineTo(128 - i, 13); g.lineTo(i, 22 - i); g.closePath(); } });
  const loop = feltSprite('sloop', { w: 70, h: 54, color: PAL.red, stitch: PAL.cream, inset: 7, stitchLen: 5, stitchGap: 4, ox: 66, oy: 27, path: (g, i) => { g.beginPath(); g.ellipse(32, 27, 30 - i, 24 - i, 0, 0, TAU); g.moveTo(66, 27); g.ellipse(32, 27, 13 + i, 9 + i, 0, 0, TAU, true); } });
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const a = open * 0.35;
  for (const sd of [-1, 1]) { ctx.save(); ctx.rotate(sd * a); stamp(ctx, loop, -8, sd * 16); stamp(ctx, blade, 0, 0); ctx.restore(); }
  stamp(ctx, buttonSprite(7, '#b0b8c0', 2), 0, 0);
  ctx.restore();
}


/** Little felt sign on a knitted stick, popping up out of the ground (name labels in the diorama). */
export function signpost(ctx, text, x, y, { s = 1, pop = 1, t = 0, fill = PAL.cream, ink = PAL.ink, size = 46, h = 150 } = {}) {
  if (pop <= 0) return;
  const stick = knitTube('stick:' + h, { pts: [[0, 0], [0, -h]], r0: 9, r1: 8, color: '#a0703f', sw: 9 });
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 2.2 + x * 0.01) * 0.035 * pop); ctx.scale(s, s * ease.outBack(clamp(pop), 2.2));
  contactShadow(ctx, 0, 0, 60, 0.4);
  stamp(ctx, stick, 0, 0);
  patch(ctx, text, 0, -h, { size, fill, ink, stitch: PAL.red });
  ctx.restore();
}

/** Felt banner hanging on two yarn strings from the top of the frame (titles). */
export function banner(ctx, text, x, y, { t = 0, size = 72, fill = PAL.red, ink = PAL.white, alpha = 1, s = 1 } = {}) {
  if (alpha <= 0.01) return;
  const sw = Math.sin(t * 1.9) * 0.025;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(sw);
  const spr = patch(ctx, text, 0, 0, { size, fill, ink, s, alpha: 0 }) || { w: 600, h: 120 };
  const hw = (spr.w - 56) * s * 0.42;
  for (const sd of [-1, 1]) yarn(ctx, [[sd * hw, -40 * s], [sd * hw * 1.05, -y - 60]], { w: 5, color: PAL.cream });
  patch(ctx, text, 0, 0, { size, fill, ink, s });
  ctx.restore();
}

// ---------------------------------------------------------------- world (felt diorama)
/** Camera: depth 0 = fixed to screen, 1 = world. Parallax by scaling the move with depth. */
export function cam(ctx, c, depth = 1) {
  const z = 1 + (c.z - 1) * depth, x = 540 + (c.x - 540) * depth, y = 960 + (c.y - 960) * depth;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 960); ctx.rotate((c.rot || 0) * depth); ctx.scale(z, z); ctx.translate(-x, -y);
}
/** Felt sky backdrop (screen space): day or sunset (mix 0..1). */
export function sky(ctx, { sunset = 0 } = {}) {
  const mk = (top, low, key) => cached('sky:' + key, () => {
    const c = makeCanvas(1080, 1920), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, top); gr.addColorStop(1, low);
    g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
    g.globalAlpha = 0.5; g.fillStyle = feltPattern(g); g.fillRect(0, 0, 1080, 1920);
    return c;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (sunset < 1) ctx.drawImage(mk(PAL.sky, PAL.skyLow, 'day'), 0, 0, 1080, 1920);
  if (sunset > 0) { ctx.globalAlpha = sunset; ctx.drawImage(mk(PAL.sunsetTop, PAL.sunsetLow, 'dusk'), 0, 0, 1080, 1920); }
  ctx.restore();
}
/** Felt sun with blanket-stitched edge, embroidered rays and a sleepy face. */
export function sun(ctx, x, y, { s = 1, t = 0, faceOn = true, color = PAL.sun } = {}) {
  const spr = feltSprite('sun:' + color, { w: 200, h: 200, color, stitch: '#e39a2d', inset: 14, ox: 100, oy: 100, path: ellPath(100, 100, 100, 100) });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.rotate(t * 0.15);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; thread(ctx, [[Math.cos(a) * 118, Math.sin(a) * 118], [Math.cos(a) * 158, Math.sin(a) * 158]], { color: '#f0a53a', w: 7 }); }
  ctx.restore();
  stamp(ctx, spr, 0, 0);
  if (faceOn) {
    thread(ctx, [[-44, -10], [-30, 2], [-16, -10]], { w: 5, dash: false, color: '#8a4b16' });
    thread(ctx, [[16, -10], [30, 2], [44, -10]], { w: 5, dash: false, color: '#8a4b16' });
    thread(ctx, (g) => { g.beginPath(); g.moveTo(-24, 28); g.quadraticCurveTo(0, 46, 24, 28); }, { w: 5, color: '#8a4b16' });
    ctx.fillStyle = 'rgba(240,120,90,0.45)'; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 52, 22, 13, 8, 0, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}
export function cloud(ctx, x, y, { s = 1, seed = 0, alpha = 1 } = {}) {
  const k = seed % 2;
  const spr = feltSprite('cloud' + k, { w: 300, h: 130, color: PAL.cloud, stitch: '#b8d8e6', inset: 13, ox: 150, oy: 70, path: (g, i) => {
    g.beginPath();
    const bumps = k ? [[70, 80, 56], [140, 58, 64], [215, 74, 54], [250, 96, 34]] : [[60, 88, 46], [120, 64, 58], [195, 60, 54], [248, 90, 40]];
    g.moveTo(40, 126 - i); for (const [bx, by, br] of bumps) g.arc(bx, by, br - i, Math.PI * 0.95, Math.PI * 2.05); g.lineTo(270 - i, 126 - i); g.closePath(); } });
  stamp(ctx, spr, x, y, { sx: s, alpha });
}
/** A full-width felt hill layer (cached), top contour at y0 with amplitude amp. Width 2400 centred on x=540. */
export function hillLayer(key, { y0, amp, color, seed = 1, flowers = 0, stitch = '#e8f5c8', h = 1400, trees = 0 }) {
  return cached('hill:' + key, () => {
    const W = 2400, pad = trees ? 340 : 40, c = makeCanvas(W / 2, (h + pad) / 2), g = c.getContext('2d');
    g.scale(0.5, 0.5); g.translate(0, pad);
    const top = (x) => amp * (noise.n2(x * 0.0016 + seed, seed * 3) * 0.7 + Math.sin(x * 0.0042 + seed) * 0.3);
    const path = (gg, i) => { gg.beginPath(); gg.moveTo(0, h); for (let x = 0; x <= W; x += 20) gg.lineTo(x, top(x) + i); gg.lineTo(W, h); gg.closePath(); };
    // felt lollipop trees standing on the contour (drawn first, the hill overlaps their trunks)
    if (trees) {
      const r = mulberry32(seed * 13);
      for (let k = 0; k < trees; k++) {
        const tx = 120 + (k + r() * 0.6) * (W - 240) / trees, ty = top(tx) + 30, R = 60 + r() * 50, col = [PAL.leaf, '#4f9d48', '#78b85a'][k % 3];
        g.fillStyle = '#8b5e3c'; g.fillRect(tx - 9, ty - R - 60, 18, R + 70);
        const cy = ty - R * 1.6 - 50;
        g.save(); g.translate(5, 8); g.fillStyle = 'rgba(40,60,30,0.2)'; g.beginPath(); g.arc(tx, cy, R, 0, TAU); g.fill(); g.restore();
        feltFill(g, (gg) => { gg.beginPath(); gg.arc(tx, cy, R, 0, TAU); }, col, { edge: 10 });
        runStitch(g, (gg) => { gg.beginPath(); gg.arc(tx, cy, R - 13, 0, TAU); }, { color: '#dff3b8', len: 12, gap: 9, w: 4 });
      }
    }
    // soft shadow cast onto the layer behind
    g.save(); g.translate(0, -14); g.fillStyle = 'rgba(40,60,30,0.16)'; path(g, 0); g.fill(); g.translate(0, 6); path(g, 0); g.fill(); g.restore();
    feltFill(g, (gg) => path(gg, 0), color, { edge: 14 });
    const top2 = (gg) => { gg.beginPath(); for (let x = 0; x <= W; x += 20) gg.lineTo(x, top(x) + 22); };
    runStitch(g, top2, { color: stitch, len: 18, gap: 12, w: 4.5 });
    if (flowers) {
      const r = mulberry32(seed * 7);
      for (let k = 0; k < flowers; k++) {
        const fx = r() * W, fy = top(fx) + 60 + r() * 300, col = [PAL.red, '#ffffff', PAL.sun, '#c99be6'][k % 4];
        for (let p = 0; p < 5; p++) { const a = (p / 5) * TAU; g.fillStyle = col; g.beginPath(); g.ellipse(fx + Math.cos(a) * 9, fy + Math.sin(a) * 9, 8, 4.5, a, 0, TAU); g.fill(); }
        g.fillStyle = '#f2b833'; g.beginPath(); g.arc(fx, fy, 4.5, 0, TAU); g.fill();
      }
      // grass stitches
      g.strokeStyle = lit(color, 1.25, 0.8); g.lineWidth = 3; g.lineCap = 'round';
      for (let k = 0; k < flowers * 4; k++) { const gx = r() * W, gy = top(gx) + 50 + r() * 500; g.beginPath(); g.moveTo(gx - 6, gy - 10); g.lineTo(gx, gy); g.lineTo(gx + 6, gy - 10); g.stroke(); }
    }
    return { canvas: c, w: W, h: h + pad, ox: W / 2 - 540, oy: pad };
  });
}
export function drawLayer(ctx, L, y = 0) { ctx.drawImage(L.canvas, -L.ox, y - L.oy, L.w, L.h); }

/** River of blue felt with animated running-stitch waves. y = top of water, h = depth on screen. */
export function river(ctx, y, h, t, { x0 = -800, x1 = 1900 } = {}) {
  const L = cached('river:' + h, () => {
    const W = 2700, c = makeCanvas(W / 2, (h + 60) / 2), g = c.getContext('2d'); g.scale(0.5, 0.5); g.translate(0, 30);
    const path = (gg) => { gg.beginPath(); gg.moveTo(0, 0); for (let x = 0; x <= W; x += 30) gg.lineTo(x, Math.sin(x * 0.01) * 6); gg.lineTo(W, h); gg.lineTo(0, h); gg.closePath(); };
    g.save(); g.translate(0, -10); g.fillStyle = 'rgba(20,40,60,0.18)'; path(g); g.fill(); g.restore();
    feltFill(g, path, PAL.river, { edge: 12 });
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(20,50,90,0.25)');
    g.fillStyle = gr; path(g); g.fill();
    return { canvas: c, w: W, h: h + 60 };
  });
  ctx.drawImage(L.canvas, x0, y - 30, L.w, L.h);
  for (let k = 0; k < 4; k++) {
    const yy = y + 40 + k * (h - 60) / 4, sp = 40 + k * 12;
    runStitch(ctx, (g) => { g.beginPath(); for (let x = x0; x <= x1; x += 24) g.lineTo(x, yy + Math.sin(x * 0.03 + t * 2 + k) * 7); }, { color: k % 2 ? '#d8f0fb' : '#ffffff', len: 26, gap: 30, w: 4, offset: -t * sp });
  }
}

/** Shot-change flourish: a felt-tone flash plus a soft warm vignette. */
export function finish(ctx, t, { flash = 0 } = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (flash > 0) { ctx.fillStyle = `rgba(255,248,230,${flash})`; ctx.fillRect(0, 0, 1080, 1920); }
  ctx.restore();
}

export { ease, clamp, lerp, hrand };
