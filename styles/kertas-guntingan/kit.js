// Maura Motion style kit: KERTAS GUNTINGAN (layered cut paper).
// A multi-plane paper diorama: every shape is a sheet of coloured paper with fibre texture, either cut with
// scissors (clean edge) or torn by hand (ragged edge with a white fibrous core). Sheets sit at different
// heights, so each one casts a real soft drop shadow on the sheets below. Characters are jointed paper
// puppets held together with brass split pins (paku keling) that pivot at shoulder, elbow, hip and knee.
// Signature moves: layers SLIDE IN from the edges and settle with a tiny overshoot, multi-plane parallax,
// stop-motion stepping (hold 2), paper flutter, torn-paper labels taped on with washi tape.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  board: '#d8c3a0', kraft: '#c49a6c', kraftDk: '#9c7349', cream: '#f4ecd8', white: '#fbf6ea',
  sky: '#a9d0dc', skyHi: '#d7ebe8', skyDk: '#7fb3c8', dusk: '#f0b27a', sun: '#f3b431', sunDk: '#e08a1e',
  cloud: '#fbf3e2', sage: '#a9bf83', grass: '#86a75c', moss: '#6a8d4a', forest: '#46683e', pine: '#2f5236',
  hill1: '#c7d3a4', hill2: '#9fb77d', hill3: '#7d9c5c', far1: '#9fb6c2', far2: '#7f9db0',
  earth: '#c69a63', earthDk: '#9b7146', mud: '#7a5a3a', field: '#d9b45f',
  terracotta: '#c8643c', red: '#b9322b', redDk: '#8c2222', black: '#2b2523', ink: '#26201d',
  water: '#4d8fb3', waterDk: '#2e638a', waterHi: '#8fc4d8', waterDeep: '#214a6b',
  gold: '#e9ad2c', goldHi: '#f8d368', goldDk: '#b97a17',
  skin: '#c88758', skinDk: '#a8673f', hair: '#2a211d', indigo: '#33476e', maroon: '#7c2a2a',
  storm: '#59627a', stormDk: '#3a4054', stormHi: '#7e889c', rain: '#c6dbe6', bolt: '#ffe27a',
  brass: '#d6a845', coral: '#d96552', teal: '#3b7a8c', foam: '#d9eef5', skyTop: '#a9d0dc', skyBot: '#d7ebe8',
};

// ---------------- camera ----------------
/** Multi-plane camera. C = {x, y, z, rot}; k = parallax factor of the plane (0 = infinitely far, 1 = stage, >1 = near). */
export function view(ctx, C, k = 1) {
  const z = 1 + (C.z - 1) * k, cx = 540 + (C.x - 540) * k, cy = 960 + (C.y - 960) * k;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540 + (C.sx || 0), 960 + (C.sy || 0));
  if (C.rot) ctx.rotate(C.rot * Math.min(1, k));
  ctx.scale(z, z); ctx.translate(-cx, -cy);
}
/** World rect visible through the current transform. */
export function viewRect(ctx, pad = 40) {
  const m = ctx.getTransform().inverse();
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const pts = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2];
}
/** Slide-in: 0..1 with a little paper settle (overshoot) — the signature entrance of every layer. */
export const slideIn = (t, a, dur = 0.7) => ease.outBack(clamp((t - a) / dur), 1.4);
/** Stop-motion boil: tiny frame-stable jitter that changes 12x per second. */
export const jig = (t, seed, amp = 1) => (hrand(Math.floor(t * 12), seed) - 0.5) * 2 * amp;

// ---------------- paper geometry ----------------
export function resample(pts, step = 8, closed = true) {
  const out = [], n = pts.length, segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / step));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
/** Push every point along its outward normal by `out` + noise (torn or cut edge). */
export function displace(pts, { amp = 2, seed = 1, freq = 0.06, out = 0, rough = 0.5 } = {}) {
  const n = pts.length;
  let S = 0; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; S += a[0] * b[1] - b[0] * a[1]; }
  const sg = S > 0 ? 1 : -1;
  let arc = 0;
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
    if (i) arc += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
    const nz = noise.fbm2(arc * freq + seed * 13.1, seed * 7.7, 3) + (hrand(i, seed) - 0.5) * rough;
    const d = out + nz * amp;
    return [p[0] + (ty / L) * sg * d, p[1] + (-tx / L) * sg * d];
  });
}
export const ellipsePts = (cx, cy, rx, ry, n = 40, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + (i / n) * TAU; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
export const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
/** Rounded "capsule" limb from (0,0) down to (0,len), width w0 -> w1. */
export function limbPts(len, w0, w1, n = 8) {
  const pts = [];
  for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI; pts.push([Math.cos(a) * w0 / 2, Math.sin(a) * w0 / 2]); }
  for (let i = 1; i <= n; i++) { const u = i / n; pts.push([lerp(w0, w1, u) / 2, u * len]); }
  for (let i = 1; i < 8; i++) { const a = (i / 8) * Math.PI; pts.push([Math.cos(a) * w1 / 2, len + Math.sin(a) * w1 / 2]); }
  for (let i = n; i >= 1; i--) { const u = i / n; pts.push([-lerp(w0, w1, u) / 2, u * len]); }
  return pts;
}
/** Ridge strip: a wavy hill silhouette from x0..x1 with its top at `top` and bottom at `bot`. */
export function ridgePts(x0, x1, top, bot, { amp = 60, freq = 0.004, seed = 1, peaks = 0 } = {}) {
  const pts = [];
  for (let x = x0; x <= x1; x += 16) {
    let y = top + noise.fbm2(x * freq + seed * 9.3, seed, 3) * amp;
    if (peaks) y -= Math.pow(Math.max(0, Math.sin((x - x0) / (x1 - x0) * Math.PI * peaks + seed)), 3) * amp * 1.4;
    pts.push([x, y]);
  }
  pts.push([x1, bot], [x0, bot]);
  return pts;
}
function tracePts(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); }

// ---------------- textures ----------------
/** Fibre tile (transparent, light and dark fibres + speckle) laid over every sheet at build time. */
export function fibreTile() {
  return cached('kg-fibre', () => {
    const S = 384, c = makeCanvas(S, S), g = c.getContext('2d'), r = mulberry32(77);
    const id = g.createImageData(S, S), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() + r()) / 2 - 0.5; const v = n > 0 ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.abs(n) * 110; }
    g.putImageData(id, 0, 0);
    g.lineWidth = 0.8;
    for (let i = 0; i < 900; i++) {
      const x = r() * S, y = r() * S, len = 4 + r() * 18, a = r() * TAU;
      g.strokeStyle = r() < 0.55 ? `rgba(255,255,255,${0.25 + r() * 0.35})` : `rgba(60,40,20,${0.12 + r() * 0.2})`;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * len * 0.5, y + Math.sin(a + 0.6) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
    // a few blotches (pulp density)
    for (let i = 0; i < 26; i++) {
      const x = r() * S, y = r() * S, rad = 20 + r() * 70, gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, r() < 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(70,50,30,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    return c;
  });
}
function texturise(g, w, h, amt = 1, light = true) {
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = 0.85 * amt;
  g.fillStyle = g.createPattern(fibreTile(), 'repeat');
  g.fillRect(0, 0, w, h);
  if (light) {
    g.globalAlpha = 1;
    const gr = g.createLinearGradient(0, 0, w * 0.6, h);
    gr.addColorStop(0, 'rgba(255,250,235,0.16)'); gr.addColorStop(1, 'rgba(40,20,0,0.10)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  g.restore();
}

// ---------------- paper pieces ----------------
/**
 * Build (and cache) a paper piece: a stack of sheets glued together, each with its own tiny shadow.
 *   sheets: [{ pts, fill, edge:'cut'|'torn', rim, rimW, amp, seed, tex, lift, detail(g), stroke }]
 *   pts are in the piece's own coordinates; (0,0) is the anchor/pivot.
 * Returns { c, sh, x0, y0, w, h } — c is the full piece, sh a 1/5-size silhouette used as a soft drop shadow.
 */
export function piece(key, sheets, { res = 1, shadowScale = 0.2 } = {}) {
  return cached('kg-piece:' + key, () => {
    if (typeof sheets === 'function') sheets = sheets(); // lazy: only built on a cache miss
    const prepped = sheets.map((s, i) => {
      const seed = s.seed ?? i + 1;
      const base = s.raw ? s.pts : resample(s.pts, s.step || 7);
      const edge = s.edge || 'cut';
      const amp = s.amp ?? (edge === 'torn' ? 3.2 : 0.7);
      const main = s.raw ? s.pts : displace(base, { amp, seed, freq: edge === 'torn' ? 0.09 : 0.03, rough: edge === 'torn' ? 0.9 : 0.25 });
      const rim = edge === 'torn' && s.rim !== false ? displace(base, { amp: amp * 1.2, seed: seed + 50, freq: 0.11, out: s.rimW ?? 3.2, rough: 1.2 }) : null;
      return { ...s, main, rimPts: rim };
    });
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const s of prepped) for (const [x, y] of s.rimPts || s.main) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const pad = 6; x0 = Math.floor(x0 - pad); y0 = Math.floor(y0 - pad); x1 = Math.ceil(x1 + pad); y1 = Math.ceil(y1 + pad);
    const w = x1 - x0, h = y1 - y0;
    const c = makeCanvas(Math.ceil(w * res), Math.ceil(h * res)), g = c.getContext('2d');
    g.scale(res, res); g.translate(-x0, -y0);
    const tmp = makeCanvas(c.width, c.height), tg = tmp.getContext('2d');
    for (const s of prepped) {
      // each sheet is rendered alone (texture + detail clipped to it), then glued on with a little shadow
      tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.globalAlpha = 1; tg.clearRect(0, 0, tmp.width, tmp.height);
      tg.scale(res, res); tg.translate(-x0, -y0);
      if (s.rimPts) { tg.fillStyle = s.rim || PAL.white; tracePts(tg, s.rimPts); tg.fill(); }
      tg.fillStyle = s.fill; tracePts(tg, s.main); tg.fill();
      if (s.detail) { tg.save(); tg.globalCompositeOperation = 'source-atop'; s.detail(tg); tg.restore(); }
      tg.setTransform(1, 0, 0, 1, 0, 0);
      texturise(tg, tmp.width, tmp.height, s.tex ?? 1, s.light !== false);
      const lift = s.lift ?? 1;
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
      if (lift > 0) { // sub-shadow falls only on paper already glued below
        g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.28;
        g.filter = `blur(${1.5 * lift * res}px) brightness(0)`;
        g.drawImage(tmp, 2.2 * lift * res, 3 * lift * res);
        g.filter = 'none';
      }
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      g.drawImage(tmp, 0, 0);
      g.restore();
    }
    // soft drop shadow silhouette, small (upscaling it is the blur)
    const sw = Math.max(2, Math.ceil(c.width * shadowScale)), shh = Math.max(2, Math.ceil(c.height * shadowScale));
    const sh = makeCanvas(sw + 4, shh + 4), sg = sh.getContext('2d');
    sg.drawImage(c, 2, 2, sw, shh); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#1b120a'; sg.fillRect(0, 0, sh.width, sh.height);
    return { c, sh, x0, y0, w, h, res, spad: 2 / shadowScale };
  });
}

export const LIGHT = { dx: 4.5, dy: 7, a: 0.36 };
/** Draw a piece at (x,y) (its anchor), with its drop shadow `lift` units below. */
/** Big unrotated sheets get their drop shadow baked in (one drawImage instead of two). */
function baked(P, lift) {
  const q = Math.round(lift * 4) / 4;
  return cached(`kg-baked:${P.__k || (P.__k = Math.random())}:${q}`, () => {
    const ox = Math.ceil(LIGHT.dx * q + P.spad), oy = Math.ceil(LIGHT.dy * q + P.spad);
    const c = makeCanvas(Math.ceil((P.w + ox + P.spad) * P.res), Math.ceil((P.h + oy + P.spad) * P.res)), g = c.getContext('2d');
    g.scale(P.res, P.res); g.translate(P.spad, P.spad);
    g.globalAlpha = LIGHT.a * Math.min(1, 0.55 + q * 0.15);
    g.drawImage(P.sh, LIGHT.dx * q - P.spad, LIGHT.dy * q - P.spad, P.w + 2 * P.spad, P.h + 2 * P.spad);
    g.globalAlpha = 1; g.drawImage(P.c, 0, 0, P.w, P.h);
    return { c, x0: P.x0 - P.spad, y0: P.y0 - P.spad, w: P.w + ox + P.spad, h: P.h + oy + P.spad };
  });
}
export function draw(ctx, P, x, y, { s = 1, sx = null, sy = null, rot = 0, lift = 1, alpha = 1, flip = 1, shadow = true } = {}) {
  if (alpha <= 0.002) return;
  const kx = (sx ?? s) * flip, ky = sy ?? s;
  const m0 = ctx.getTransform(), a0 = ctx.globalAlpha;
  if (shadow && lift > 0 && rot === 0 && kx > 0 && P.w * P.h > 120000 && Math.abs(m0.b) < 1e-6) {
    const B = baked(P, lift);
    ctx.translate(x, y); ctx.scale(kx, ky); ctx.globalAlpha = a0 * alpha;
    ctx.drawImage(B.c, B.x0, B.y0, B.w, B.h);
    ctx.setTransform(m0); ctx.globalAlpha = a0;
    return;
  }
  if (shadow && lift > 0) { // the light is fixed in screen space, whatever frame we are drawing in
    const z = Math.sqrt(Math.abs(m0.a * m0.d - m0.b * m0.c));
    ctx.setTransform(new DOMMatrix([1, 0, 0, 1, LIGHT.dx * lift * z, LIGHT.dy * lift * z]).multiply(m0));
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(kx, ky);
    ctx.globalAlpha = a0 * alpha * LIGHT.a * Math.min(1, 0.55 + lift * 0.15);
    const p = P.spad;
    ctx.drawImage(P.sh, P.x0 - p, P.y0 - p, P.w + 2 * p, P.h + 2 * p);
    ctx.setTransform(m0);
  }
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(kx, ky);
  ctx.globalAlpha = a0 * alpha;
  ctx.drawImage(P.c, P.x0, P.y0, P.w, P.h);
  ctx.setTransform(m0); ctx.globalAlpha = a0;
}
/** Draw a prop in a puppet's hand frame (m = res.handF / res.handB). Returns the prop's frame matrix. */
export function prop(ctx, m, P, { rot = 0, x = 0, y = 0, lift = 1.2, s = 1 } = {}) {
  const pm = m.translate(x, y).rotate((rot * 180) / Math.PI).scale(s, s);
  const m0 = ctx.getTransform();
  ctx.setTransform(pm); draw(ctx, P, 0, 0, { lift }); ctx.setTransform(m0);
  return pm;
}

// ---------------- backdrop & scenery ----------------
/** Full-bleed sheet (sky / storm / dusk) with a soft vertical gradient, drawn to the visible rect. */
export function sky(ctx, top = PAL.skyHi, bot = PAL.sky, key = 'sky') {
  const S = cached('kg-sky:' + key + top + bot, () => {
    const c = makeCanvas(540, 960), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 960); gr.addColorStop(0, top); gr.addColorStop(1, bot);
    g.fillStyle = gr; g.fillRect(0, 0, 540, 960); texturise(g, 540, 960, 0.9, false);
    return c;
  });
  const [x, y, w, h] = viewRect(ctx);
  ctx.drawImage(S, x, y, w, h);
}
export function sunPiece(r = 120, col = PAL.sun) {
  return piece('sun' + r + col, [
    ...Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * TAU; const c = Math.cos(a), s = Math.sin(a); return { pts: [[c * r * 1.05 - s * 22, s * r * 1.05 + c * 22], [c * r * 1.55, s * r * 1.55], [c * r * 1.05 + s * 22, s * r * 1.05 - c * 22]], fill: i % 2 ? PAL.goldHi : col, edge: 'cut', lift: 0, seed: i + 3 }; }),
    { pts: ellipsePts(0, 0, r, r, 48), fill: col, edge: 'torn', lift: 1.2, seed: 2 },
    { pts: ellipsePts(-r * 0.12, -r * 0.12, r * 0.66, r * 0.66, 40), fill: PAL.goldHi, edge: 'torn', lift: 0.8, seed: 5, amp: 2.2 },
  ]);
}
export function cloudPiece(seed = 1, w = 300, col = PAL.cloud) {
  const r = mulberry32(seed), pts = [];
  const bumps = 4 + Math.floor(r() * 3);
  for (let i = 0; i <= 40; i++) { const u = i / 40, x = lerp(-w / 2, w / 2, u); const b = Math.abs(Math.sin(u * Math.PI * bumps + r())); pts.push([x, -30 - b * 40 * (0.6 + 0.6 * Math.sin(u * Math.PI))]); }
  pts.push([w / 2, 18], [-w / 2, 18]);
  return piece(`cloud${seed}:${w}:${col}`, [{ pts, fill: col, edge: 'torn', seed, amp: 3.5 }]);
}
/** A layer of hills: torn top edge, `col`, spans x0..x1. */
export function hillPiece(seed, col, { x0 = -400, x1 = 1480, top = 0, bot = 700, amp = 70, freq = 0.0035, peaks = 0, deco = null } = {}) {
  return piece(`hill${seed}:${col}:${x0}:${x1}:${top}:${bot}:${amp}:${peaks}`, [
    { pts: ridgePts(x0, x1, top, bot, { amp, freq, seed, peaks }), fill: col, edge: 'torn', seed, amp: 3.6, step: 9, detail: deco },
  ]);
}
/** Paper water band: a strip with a wavy torn top; several of them bob out of phase. */
export function waterStrip(seed, col, w = 1900, h = 260, waves = 9) {
  const pts = [];
  for (let i = 0; i <= 120; i++) { const u = i / 120; pts.push([lerp(-w / 2, w / 2, u), -Math.abs(Math.sin(u * Math.PI * waves)) * 26]); }
  pts.push([w / 2, h], [-w / 2, h]);
  return piece(`water${seed}:${col}:${w}:${h}:${waves}`, [{ pts, fill: col, edge: 'torn', seed, amp: 2.4, rim: PAL.waterHi, rimW: 2.6 }]);
}
/** Draws n bobbing water strips from y (front last). */
export function water(ctx, t, x, y, { n = 4, gap = 46, cols = [PAL.waterHi, PAL.water, PAL.waterDk, PAL.waterDeep], w = 1900, h = 420, amp = 10, speed = 1, lift = 1.3 } = {}) {
  for (let i = 0; i < n; i++) {
    const P = waterStrip(31 + i, cols[i % cols.length], w, h, 7 + (i % 3) * 2);
    draw(ctx, P, x + Math.sin(t * 0.9 * speed + i * 1.7) * 30, y + i * gap + Math.sin(t * 1.6 * speed + i) * amp, { lift });
  }
}
export function pineTree(seed = 1, h = 260, col = PAL.pine) {
  const tiers = 4, sheets = [{ pts: rectPts(-9, -h * 0.25, 18, h * 0.25 + 4), fill: PAL.earthDk, edge: 'cut', lift: 0 }];
  for (let i = 0; i < tiers; i++) {
    const y = -h * 0.2 - i * h * 0.2, w = h * (0.38 - i * 0.07);
    sheets.push({ pts: [[-w, y], [0, y - h * 0.38], [w, y]], fill: i % 2 ? col : PAL.forest, edge: 'torn', seed: seed + i, amp: 2.5, lift: 1 });
  }
  return piece(`pine${seed}:${h}:${col}`, sheets);
}
export function roundTree(seed = 1, h = 300, col = PAL.moss) {
  const r = mulberry32(seed), sheets = [{ pts: [[-12, 0], [-8, -h * 0.55], [8, -h * 0.55], [14, 0]], fill: PAL.earthDk, edge: 'cut', lift: 0 }];
  const R = h * 0.32;
  for (let i = 0; i < 4; i++) sheets.push({ pts: ellipsePts((r() - 0.5) * R * 0.8, -h * 0.62 - (r() - 0.3) * R * 0.6, R * (0.7 + r() * 0.3), R * (0.62 + r() * 0.2), 30), fill: [col, PAL.grass, PAL.forest, PAL.sage][i], edge: 'torn', seed: seed * 7 + i, amp: 3, lift: 1 });
  return piece(`rtree${seed}:${h}:${col}`, sheets);
}
/** Sugar palm (bagot) — the Batak palm. */
export function palmTree(seed = 1, h = 380) {
  const sheets = [{ pts: [[-10, 0], [-6, -h], [6, -h], [12, 0]], fill: PAL.mud, edge: 'cut', lift: 0, detail: (g) => { g.strokeStyle = 'rgba(40,25,10,.4)'; g.lineWidth = 2; for (let y = -h; y < 0; y += 22) { g.beginPath(); g.moveTo(-12, y); g.lineTo(12, y + 6); g.stroke(); } } }];
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.42, L = h * 0.42, ex = Math.cos(a) * L, ey = -h + Math.sin(a) * L * 0.6 + Math.abs(i - 3) * 22;
    const pts = [[0, -h], [ex * 0.5 - Math.sin(a) * 18, -h + (ey + h) * 0.5 - 22], [ex, ey + 28], [ex * 0.5 + Math.sin(a) * 12, -h + (ey + h) * 0.5 + 8]];
    sheets.push({ pts, fill: i % 2 ? PAL.forest : PAL.moss, edge: 'torn', seed: seed + i * 3, amp: 2.2, lift: 0.8 });
  }
  return piece(`palm${seed}:${h}`, sheets);
}
/** Rumah bolon: the Batak Toba house with its saddle roof, gorga gable and stilts. Anchor: bottom centre. */
export function rumahBolon(scale = 1) {
  const k = scale;
  return piece('bolon' + k, [
    // stilts and beams
    ...[-130, -80, -30, 30, 80, 130].map((x, i) => ({ pts: rectPts((x - 9) * k, -118 * k, 18 * k, 118 * k), fill: PAL.mud, edge: 'cut', lift: 0, seed: 60 + i })),
    { pts: rectPts(-160 * k, -128 * k, 320 * k, 22 * k), fill: PAL.ink, edge: 'cut', lift: 0.6, seed: 70 },
    // walls flaring outward
    { pts: [[-150 * k, -128 * k], [150 * k, -128 * k], [178 * k, -222 * k], [-178 * k, -222 * k]], fill: '#5b3a24', edge: 'cut', lift: 0.8, seed: 71,
      detail: (g) => { // gorga band: red / white / black spirals
        g.fillStyle = PAL.red; g.fillRect(-180 * k, -206 * k, 360 * k, 40 * k);
        g.strokeStyle = PAL.white; g.lineWidth = 4 * k;
        for (let x = -160; x <= 160; x += 40) { g.beginPath(); g.arc(x * k, -186 * k, 12 * k, 0, TAU * 0.8); g.stroke(); }
        g.fillStyle = PAL.ink; for (let x = -180; x <= 180; x += 20) { g.beginPath(); g.moveTo(x * k, -166 * k); g.lineTo((x + 10) * k, -156 * k); g.lineTo((x + 20) * k, -166 * k); g.fill(); }
      } },
    // huge saddle roof of black ijuk thatch, both ends swept up
    { pts: (() => { const p = []; for (let i = 0; i <= 30; i++) { const u = i / 30, x = lerp(-260, 260, u); p.push([x * k, (-500 + Math.pow(Math.abs(u - 0.5) * 2, 2.2) * -60 + Math.sin(u * Math.PI) * 95) * k]); } p.push([200 * k, -214 * k], [-200 * k, -214 * k]); return p; })(),
      fill: '#3a302a', edge: 'torn', amp: 2.5, lift: 1.2, seed: 72,
      detail: (g) => { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let x = -260; x < 260; x += 9) { g.beginPath(); g.moveTo(x * k, -560 * k); g.lineTo((x * 0.8) * k, -214 * k); g.stroke(); } } },
    // decorated triangular gable (front end)
    { pts: [[120 * k, -230 * k], [236 * k, -230 * k], [250 * k, -520 * k]], fill: PAL.red, edge: 'cut', lift: 1, seed: 73,
      detail: (g) => {
        g.fillStyle = PAL.white; for (let i = 0; i < 5; i++) { const y = (-250 - i * 50) * k; g.beginPath(); g.moveTo((140 + i * 18) * k, y); g.lineTo((232 - i * 4) * k, y); g.lineTo((186 + i * 7) * k, y - 30 * k); g.fill(); }
        g.fillStyle = PAL.ink; g.beginPath(); g.arc(196 * k, -300 * k, 16 * k, 0, TAU); g.fill();
      } },
    // door
    { pts: rectPts(-24 * k, -206 * k, 48 * k, 70 * k), fill: PAL.ink, edge: 'cut', lift: 0.5, seed: 74 },
  ]);
}
/** Cracked dry field strip (for the drought) or green paddy. */
export function fieldPiece(dry = true, w = 1600, h = 520) {
  return piece('field' + dry + w + h, [
    { pts: ridgePts(-w / 2, w / 2, 0, h, { amp: 12, freq: 0.01, seed: dry ? 41 : 43 }), fill: dry ? PAL.earth : PAL.grass, edge: 'torn', seed: 41, amp: 3,
      detail: (g) => {
        const r = mulberry32(dry ? 9 : 10);
        if (dry) { g.strokeStyle = 'rgba(80,50,25,.55)'; g.lineWidth = 2.2; for (let i = 0; i < 70; i++) { let x = (r() - 0.5) * w, y = 30 + r() * (h - 40); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 60; y += (r() - 0.3) * 26; g.lineTo(x, y); } g.stroke(); } }
        else { g.strokeStyle = 'rgba(60,90,30,.6)'; g.lineWidth = 3; for (let y = 20; y < h; y += 26) { g.beginPath(); g.moveTo(-w / 2, y); g.lineTo(w / 2, y + 6); g.stroke(); } }
      } },
  ]);
}

// ---------------- puppets ----------------
// Jointed paper puppets. Parts are pinned with brass split pins; (0,0) of each part is its pivot.
// Height ~560 (feet at y=0), facing right (+x). Pose angles in radians.
const deg = (r) => (r * 180) / Math.PI;
function headSheets(o, face) {
  const { skin, hair, band, bun, long, child } = o;
  const s = [];
  const hy = child ? -66 : -76, R = child ? 52 : 46;
  // neck
  s.push({ pts: rectPts(-14, -28, 28, 34), fill: o.skinDk || PAL.skinDk, edge: 'cut', lift: 0, seed: 11 });
  // back hair (women) is a separate part; here the skull + face in profile
  s.push({ pts: [...ellipsePts(0, hy, R, R * 1.12, 36, 0)].map(([x, y]) => [x, y]).concat([]), fill: skin, edge: 'cut', seed: 12, lift: 0.4 });
  s.push({ pts: [[R * 0.75, hy - 14], [R + 15, hy + 6], [R * 0.8, hy + 14]], fill: skin, edge: 'cut', seed: 13, lift: 0.2 }); // nose
  // hair cap
  s.push({ pts: [[-R - 4, hy + 18], [-R - 6, hy - 30], [-R * 0.4, hy - R * 1.2], [R * 0.5, hy - R * 1.12], [R * 0.95, hy - R * 0.55], [R * 0.2, hy - R * 0.62], [-R * 0.25, hy - 10], [-R * 0.55, hy + 26]], fill: hair, edge: 'torn', amp: 1.6, seed: 14, lift: 0.8 });
  if (bun) s.push({ pts: ellipsePts(-R * 0.9, hy - R * 0.6, R * 0.42, R * 0.38, 24), fill: hair, edge: 'torn', amp: 1.5, seed: 15, lift: 0.8 });
  if (band) s.push({ pts: [[-R - 8, hy - 20], [R * 0.7, hy - R * 0.78], [R * 0.82, hy - R * 0.5], [-R - 4, hy + 2]], fill: band, edge: 'cut', seed: 16, lift: 0.9,
    detail: (g) => { g.strokeStyle = PAL.white; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(-R - 6, R * 0.76, u), y = lerp(hy - 10, hy - R * 0.64, u) + (i % 2 ? -5 : 5); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } });
  if (o.ornament) s.push({ pts: ellipsePts(-R * 0.55, hy - R * 0.85, 9, 9, 12), fill: PAL.gold, edge: 'cut', seed: 17, lift: 0.8 });
  // ear
  s.push({ pts: ellipsePts(-6, hy + 4, 9, 13, 14), fill: o.skinDk || PAL.skinDk, edge: 'cut', seed: 18, lift: 0.5 });
  // cheek blush
  s.push({ pts: ellipsePts(R * 0.42, hy + 18, 11, 7, 14), fill: o.blush || '#d9775c', edge: 'cut', seed: 19, lift: 0, tex: 0.5 });
  // eye / brow / mouth by expression
  const ex = R * 0.55, ey = hy - 6;
  if (face.blink) s.push({ pts: [[ex - 9, ey + 1], [ex + 8, ey], [ex + 8, ey + 3], [ex - 9, ey + 4]], fill: PAL.ink, edge: 'cut', lift: 0, seed: 20 });
  else {
    s.push({ pts: ellipsePts(ex, ey, 8.5, 10, 16), fill: PAL.white, edge: 'cut', lift: 0.2, seed: 20 });
    s.push({ pts: ellipsePts(ex + 2.5, ey + 1, 5, 6.2, 14), fill: PAL.ink, edge: 'cut', lift: 0, seed: 21 });
  }
  const br = face.brow || 0; // + angry (inner end down), - sad
  s.push({ pts: [[ex - 12, ey - 15 - br * 4], [ex + 12, ey - 17 + br * 7], [ex + 12, ey - 12 + br * 7], [ex - 12, ey - 10 - br * 4]], fill: hair, edge: 'cut', lift: 0.2, seed: 22 });
  const mx = R * 0.68, my = hy + 26;
  if (face.mouth === 'open') s.push({ pts: ellipsePts(mx, my + 2, 9, 12, 18), fill: '#5a1e1e', edge: 'cut', lift: 0, seed: 23 });
  else if (face.mouth === 'shout') s.push({ pts: [[mx - 12, my - 8], [mx + 14, my - 10], [mx + 10, my + 16], [mx - 8, my + 12]], fill: '#5a1e1e', edge: 'cut', lift: 0, seed: 23 });
  else if (face.mouth === 'smile') s.push({ pts: [[mx - 12, my], [mx + 8, my - 4], [mx + 6, my + 6], [mx - 6, my + 7]], fill: '#7d2b28', edge: 'cut', lift: 0, seed: 23 });
  else if (face.mouth === 'chew') s.push({ pts: ellipsePts(mx, my + 2, 10, 5, 14), fill: '#7d2b28', edge: 'cut', lift: 0, seed: 23 });
  else if (face.mouth === 'sad') s.push({ pts: [[mx - 10, my + 4], [mx + 8, my], [mx + 8, my + 3], [mx - 10, my + 7]], fill: '#5a1e1e', edge: 'cut', lift: 0, seed: 23 });
  else s.push({ pts: [[mx - 9, my], [mx + 7, my - 1], [mx + 7, my + 2], [mx - 9, my + 3]], fill: '#7d2b28', edge: 'cut', lift: 0, seed: 23 });
  return s;
}
const ulosDetail = (base, stripe = PAL.white, dark = PAL.ink) => (g) => {
  g.fillStyle = dark; for (let y = -400; y < 400; y += 36) g.fillRect(-300, y, 600, 8);
  g.fillStyle = stripe; for (let y = -390; y < 400; y += 36) g.fillRect(-300, y + 12, 600, 3);
  g.fillStyle = PAL.gold; for (let y = -380; y < 400; y += 72) for (let x = -300; x < 300; x += 14) { g.beginPath(); g.moveTo(x, y + 20); g.lineTo(x + 5, y + 15); g.lineTo(x + 10, y + 20); g.lineTo(x + 5, y + 25); g.fill(); }
};
const RIGS = {
  toba: { skin: PAL.skin, hair: PAL.hair, band: PAL.red, shirt: PAL.indigo, sarong: PAL.maroon, ulos: PAL.red, scale: 1 },
  putri: { skin: '#d49a6c', skinDk: '#b77d52', hair: '#231a17', bun: true, ornament: true, long: true, top: PAL.gold, sarong: '#9b2f2b', ulos: PAL.goldDk, blush: '#e08a6c', scale: 0.96, woman: true },
  samosir: { skin: PAL.skin, hair: PAL.hair, child: true, shirt: null, sarong: PAL.red, ulos: PAL.indigo, scale: 0.8, belly: true },
  darmi: { skin: '#d49a6c', skinDk: '#b77d52', hair: '#231a17', bun: true, ornament: true, long: true, top: PAL.coral, sarong: PAL.gold, ulos: PAL.red, blush: '#e08a6c', scale: 0.94, woman: true },
  ibu: { skin: PAL.skin, skinDk: PAL.skinDk, hair: '#6b6560', bun: true, ornament: false, long: false, top: PAL.earthDk, sarong: PAL.mud, ulos: PAL.indigo, blush: '#b77d52', scale: 0.9, woman: true },
  sidapaksa: { skin: PAL.skin, hair: PAL.hair, band: PAL.gold, shirt: PAL.teal, sarong: PAL.indigo, ulos: PAL.goldDk, scale: 1.02 },
  sritanjung: { skin: '#d8a074', skinDk: '#b77d52', hair: '#231a17', bun: true, ornament: true, long: true, top: PAL.teal, sarong: PAL.gold, ulos: PAL.coral, blush: '#e08a6c', scale: 0.95, woman: true },
  raja: { skin: PAL.skin, hair: PAL.hair, band: PAL.goldHi, ornament: true, shirt: PAL.maroon, sarong: PAL.goldDk, ulos: PAL.red, scale: 1.06, belly: true },
};
function bodySheets(name) {
  // coordinates relative to the hip pivot (0,0); shoulders at y=-190 (adult) / -144 (child)
  const o = RIGS[name], s = [];
  if (o.woman) {
    s.push({ pts: [[-40, -70], [40, -70], [50, 100], [56, 238], [-52, 238], [-48, 100]], fill: o.sarong, edge: 'cut', seed: 31, lift: 0, detail: ulosDetail(o.sarong, PAL.goldHi, '#5e1d1b') });
    s.push({ pts: [[-36, -192], [28, -198], [44, -150], [40, -62], [-42, -62], [-46, -150]], fill: o.top, edge: 'cut', seed: 32, lift: 1,
      detail: (g) => { g.strokeStyle = PAL.goldDk; g.lineWidth = 2.5; for (let y = -186; y < -66; y += 16) for (let x = -56; x < 56; x += 22) { g.beginPath(); g.arc(x + (Math.round(y / 16) % 2) * 11, y, 10, 0.15, Math.PI - 0.15); g.stroke(); } } }); // fish-scale motif: a hint of where she came from
    s.push({ pts: [[26, -198], [44, -188], [-30, -56], [-48, -66]], fill: o.ulos, edge: 'cut', seed: 33, lift: 1.2, detail: ulosDetail(o.ulos, PAL.white, '#5e1d1b') });
    s.push({ pts: rectPts(-44, -74, 90, 14), fill: PAL.goldHi, edge: 'cut', seed: 34, lift: 0.8 });
    return s;
  }
  const C = o.child, top = C ? -144 : -190, bw = o.belly ? 56 : 44, sl = C ? 74 : 118;
  if (o.shirt) s.push({ pts: [[-34, top - 2], [28, top - 8], [bw, top + 40], [bw - 4, -24], [-bw + 4, -24], [-bw, top + 40]], fill: o.shirt, edge: 'cut', seed: 31, lift: 0 });
  else s.push({ pts: [[-30, top], [24, top - 4], [bw * 0.75, top + 34], [bw + 6, top + 84], [bw - 2, -16], [-bw + 12, -16], [-bw + 4, top + 40]], fill: o.skin, edge: 'cut', seed: 31, lift: 0,
    detail: (g) => { g.fillStyle = o.skinDk || PAL.skinDk; g.beginPath(); g.arc(bw * 0.62, top + 92, 4, 0, TAU); g.fill(); } });
  s.push({ pts: [[-bw + 2, -30], [bw - 2, -30], [bw + 10, sl], [-bw - 8, sl]], fill: o.sarong, edge: 'cut', seed: 35, lift: 1, detail: ulosDetail(o.sarong, PAL.white, PAL.ink) });
  s.push({ pts: rectPts(-bw - 2, -38, bw * 2 + 4, 16), fill: PAL.ink, edge: 'cut', seed: 36, lift: 0.8 });
  // ulos sash across the chest
  s.push({ pts: [[22, top - 8], [42, top + 4], [-bw + 4, -22], [-bw - 12, -36]], fill: o.ulos, edge: 'cut', seed: 37, lift: 1.3, detail: ulosDetail(o.ulos) });
  return s;
}
function rigParts(name) {
  return cached('kg-rig:' + name, () => {
    const o = RIGS[name], C = o.child, W = !!o.woman;
    const up = C ? 84 : 100, fo = C ? 80 : 96, th = C ? 100 : 128, sn = C ? 96 : 124;
    const limb = (key, len, w0, w1, fill, extra = []) => piece(`${name}:${key}`, [{ pts: limbPts(len, w0, w1), fill, edge: 'cut', seed: key.length, lift: 0 }, ...extra]);
    const sleeve = o.shirt || (W ? o.top : o.skin);
    const parts = {
      body: piece(name + ':body', bodySheets(name)),
      upperF: limb('upF', up, 30, 24, sleeve), upperB: limb('upB', up, 30, 24, sleeve),
      foreF: limb('foF', fo, 23, 18, o.skin, [{ pts: ellipsePts(0, fo + 8, 13, 15, 16), fill: o.skin, edge: 'cut', seed: 9, lift: 0.3 }]),
      foreB: limb('foB', fo, 23, 18, o.skinDk || PAL.skinDk, [{ pts: ellipsePts(0, fo + 8, 13, 15, 16), fill: o.skinDk || PAL.skinDk, edge: 'cut', seed: 9, lift: 0.3 }]),
      thighF: limb('thF', th, 34, 26, W ? o.sarong : o.skin), thighB: limb('thB', th, 34, 26, W ? o.sarong : (o.skinDk || PAL.skinDk)),
      shinF: limb('snF', sn, 25, 20, o.skin, [{ pts: [[-12, sn - 8], [36, sn - 4], [40, sn + 10], [-14, sn + 12]], fill: o.skin, edge: 'cut', seed: 4, lift: 0.3 }]),
      shinB: limb('snB', sn, 25, 20, o.skinDk || PAL.skinDk, [{ pts: [[-12, sn - 8], [36, sn - 4], [40, sn + 10], [-14, sn + 12]], fill: o.skinDk || PAL.skinDk, edge: 'cut', seed: 4, lift: 0.3 }]),
      hair: W ? piece(name + ':hair', [{ pts: [[-10, -10], [26, -4], [30, 120], [16, 230], [-6, 290], [-30, 220], [-36, 100]], fill: o.hair, edge: 'torn', amp: 2, seed: 5, detail: (g) => { g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; for (let x = -30; x < 30; x += 7) { g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x - 6, 140, x + 4, 280); g.stroke(); } } }]) : null,
    };
    const dims = { up, fo, th, sn, neck: C ? -346 : -444, shoulder: C ? [-4, -332] : [-4, -428], hip: C ? [0, -190] : [0, -246] };
    return { parts, dims };
  });
}
function headPiece(name, face) {
  const o = RIGS[name];
  const brow = Math.round((face.brow || 0) * 5) / 5;
  const k = `${face.mouth || 'n'}:${brow}:${face.blink ? 1 : 0}`;
  return piece(`${name}:head:${k}`, () => headSheets(o, { ...face, brow }), { res: 1.25 });
}
/** Default pose; override any field. a* angles in radians, 0 = hanging straight down. */
export function pose(over = {}) {
  return { lean: 0, head: 0, upF: 0.15, foF: 0.25, upB: -0.15, foB: 0.2, thF: 0, snF: 0, thB: 0, snB: 0, hair: 0, face: { mouth: 'n', brow: 0 }, bob: 0, ...over };
}
/** Walk cycle at phase p (cycles), amount a (0..1). */
export function walk(p, a = 1, over = {}) {
  const s = Math.sin(p * TAU), c = Math.cos(p * TAU);
  return pose({ thF: 0.45 * s * a, snF: Math.max(0, -c) * 0.7 * a, thB: -0.45 * s * a, snB: Math.max(0, c) * 0.7 * a, upF: -0.4 * s * a + 0.05, foF: 0.3 + 0.2 * a, upB: 0.4 * s * a - 0.05, foB: 0.3, bob: Math.abs(c) * -8 * a, lean: 0.05 * a, hair: 0.12 * s * a, ...over });
}
/**
 * Draw a jointed paper puppet. o = { x, y (feet), s, flip (1 right / -1 left), rot, lift, alpha, P: pose(...) }.
 * Brass split pins are drawn on the visible joints.
 */
export function puppet(ctx, name, o) {
  const { x, y, s = 1, flip = 1, rot = 0, lift = 1.6, alpha = 1, P = pose() } = o;
  const { parts, dims } = rigParts(name);
  const sc = s * (RIGS[name].scale || 1);
  const base = ctx.getTransform().translate(x, y + P.bob * sc).rotate(deg(rot)).scale(sc * flip, sc);
  const hipM = base.translate(dims.hip[0], dims.hip[1]).rotate(deg(P.lean));
  const neckM = hipM.translate(0, dims.neck - dims.hip[1]);
  const shM = hipM.translate(dims.shoulder[0], dims.shoulder[1] - dims.hip[1]);
  const L = [];
  const add = (P_, m, pin) => P_ && L.push([P_, m, pin]);
  const legBase = base.translate(dims.hip[0], dims.hip[1]);
  const legM = (th, sn) => { const a = legBase.rotate(deg(-th)); return [a, a.translate(0, dims.th - 8).rotate(deg(sn))]; };
  const armM = (u, f) => { const a = shM.rotate(deg(-u)); return [a, a.translate(0, dims.up - 6).rotate(deg(-f))]; };
  const [tB, sB] = legM(P.thB, P.snB), [tF, sF] = legM(P.thF, P.snF);
  const [uB, fB] = armM(P.upB, P.foB), [uF, fF] = armM(P.upF, P.foF);
  const headM = neckM.rotate(deg(P.head));
  if (parts.hair) add(parts.hair, headM.translate(-30, -96).rotate(deg(P.hair + 0.05)), false);
  add(parts.upperB, uB, false); add(parts.foreB, fB, false);
  add(parts.thighB, tB, false); add(parts.shinB, sB, false);
  add(parts.thighF, tF, false); add(parts.shinF, sF, true);
  add(parts.body, hipM, false);
  add(headPiece(name, { blink: P.blink, ...P.face }), headM, false);
  add(parts.upperF, uF, true); add(parts.foreF, fF, true);
  const cm = ctx.getTransform(), cz = Math.hypot(cm.a, cm.b);
  ctx.save();
  // pass 1: one combined shadow (all parts), offset by the light
  const dx = LIGHT.dx * lift * cz, dy = LIGHT.dy * lift * cz;
  ctx.globalAlpha = alpha * LIGHT.a;
  for (const [Pc, m] of L) {
    const mm = new DOMMatrix([1, 0, 0, 1, dx, dy]).multiply(m);
    ctx.setTransform(mm); const p = Pc.spad; ctx.drawImage(Pc.sh, Pc.x0 - p, Pc.y0 - p, Pc.w + 2 * p, Pc.h + 2 * p);
  }
  // pass 2: the paper
  ctx.globalAlpha = alpha;
  for (const [Pc, m] of L) { ctx.setTransform(m); ctx.drawImage(Pc.c, Pc.x0, Pc.y0, Pc.w, Pc.h); }
  // pass 3: brass split pins on the front joints
  const pin = (m, px, py) => { ctx.setTransform(m); brad(ctx, px, py, 6.5); };
  pin(uF, 0, 0); pin(fF, 0, 0); pin(sF, 0, 0); pin(hipM, 0, 0);
  ctx.restore();
  return { headM, handF: fF.translate(0, dims.fo + 10), handB: fB.translate(0, dims.fo + 10), base };
}
/** A brass split pin (paku keling). */
export function brad(ctx, x, y, r = 6) {
  const S = cached('kg-brad', () => {
    const c = makeCanvas(40, 40), g = c.getContext('2d');
    g.fillStyle = 'rgba(30,20,5,.35)'; g.beginPath(); g.arc(22, 23, 14, 0, TAU); g.fill();
    const gr = g.createRadialGradient(15, 14, 2, 20, 20, 15); gr.addColorStop(0, '#fff2b8'); gr.addColorStop(0.35, PAL.brass); gr.addColorStop(1, '#7d5a17');
    g.fillStyle = gr; g.beginPath(); g.arc(20, 20, 13, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(70,45,5,.6)'; g.lineWidth = 1.5; g.stroke();
    return c;
  });
  ctx.drawImage(S, x - r * 1.55, y - r * 1.55, r * 3.1, r * 3.1);
}
/** Hand position helper: returns world point of a matrix returned by puppet() (e.g. res.handF). */
export const pt = (m, x = 0, y = 0, ctx = null) => {
  let p = m.transformPoint(new DOMPoint(x, y));
  if (ctx) p = ctx.getTransform().inverse().transformPoint(p); // into ctx's current (world) coordinates
  return [p.x, p.y];
};

// ---------------- the golden fish ----------------
export function fishParts() {
  return cached('kg-fish', () => {
    const body = piece('fish:body', [
      { pts: (() => { const p = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * TAU; p.push([Math.cos(a) * 120 + (Math.cos(a) > 0 ? Math.cos(a) * 12 : 0), Math.sin(a) * 62 * (1 - 0.25 * Math.cos(a))]); } return p; })(),
        fill: PAL.gold, edge: 'cut', seed: 3, lift: 0,
        detail: (g) => { g.strokeStyle = PAL.goldDk; g.lineWidth = 3; for (let x = -70; x < 90; x += 26) for (let y = -50; y < 60; y += 22) { g.beginPath(); g.arc(x + ((y + 50) / 22 % 2) * 13, y, 13, -1.2, 1.2); g.stroke(); } } },
      { pts: [[-20, -58], [30, -98], [70, -88], [80, -52]], fill: PAL.sunDk, edge: 'torn', seed: 4, lift: -0, amp: 1.5 },
      { pts: ellipsePts(80, -4, 46, 54, 30), fill: PAL.goldHi, edge: 'cut', seed: 5, lift: 0.8 },
      { pts: ellipsePts(92, -14, 13, 13, 16), fill: PAL.white, edge: 'cut', seed: 6, lift: 0.6 },
      { pts: ellipsePts(95, -13, 7, 7, 14), fill: PAL.ink, edge: 'cut', seed: 7, lift: 0 },
      { pts: [[118, 14], [134, 8], [132, 22]], fill: PAL.goldDk, edge: 'cut', seed: 8, lift: 0 },
      { pts: [[20, 30], [-10, 72], [40, 58]], fill: PAL.sunDk, edge: 'torn', seed: 9, lift: 0.6, amp: 1.2 },
    ], { res: 1.2 });
    const tail = piece('fish:tail', [{ pts: [[0, -14], [-90, -70], [-70, 0], [-90, 70], [0, 14]], fill: PAL.sunDk, edge: 'torn', seed: 11, amp: 2.5,
      detail: (g) => { g.strokeStyle = PAL.goldHi; g.lineWidth = 3; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(-80, i * 18); g.stroke(); } } }]);
    return { body, tail };
  });
}
/** The golden fish (ikan mas). Anchor at its centre, facing right. */
export function fish(ctx, x, y, { s = 1, rot = 0, flap = 0, flip = 1, lift = 1.4, alpha = 1 } = {}) {
  const F = fishParts();
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * flip, s);
  draw(ctx, F.tail, -110, 0, { rot: Math.sin(flap) * 0.45, lift, alpha });
  draw(ctx, F.body, 0, 0, { lift, alpha });
  ctx.restore();
}

// ---------------- props ----------------
export const PROPS = {
  hoe: () => piece('hoe', [{ pts: rectPts(-5, -10, 10, 230), fill: PAL.earthDk, edge: 'cut', seed: 1, lift: 0 }, { pts: [[-6, 210], [58, 200], [64, 246], [-4, 236]], fill: '#8d97a0', edge: 'cut', seed: 2, lift: 1 }]),
  rod: () => piece('rod', [{ pts: [[-4, 0], [4, 0], [2, -340], [-1, -340]], fill: '#b88f4c', edge: 'cut', seed: 3, lift: 0, raw: false }]),
  bekal: () => piece('bekal', [
    { pts: [[-46, -10], [46, -10], [36, 40], [-36, 40]], fill: '#b58a4e', edge: 'cut', seed: 1, lift: 0, detail: (g) => { g.strokeStyle = 'rgba(70,40,10,.6)'; g.lineWidth = 2; for (let x = -50; x < 50; x += 8) { g.beginPath(); g.moveTo(x, -12); g.lineTo(x + 10, 42); g.stroke(); } } },
    { pts: [[-52, -10], [-10, -50], [30, -46], [56, -10], [0, -2]], fill: PAL.moss, edge: 'cut', seed: 2, lift: 1, detail: (g) => { g.strokeStyle = PAL.sage; g.lineWidth = 2; g.beginPath(); g.moveTo(-40, -14); g.lineTo(40, -30); g.stroke(); } },
  ]),
  rice: () => piece('rice', [{ pts: [[-60, 0], [-40, -50], [0, -70], [40, -50], [60, 0]], fill: PAL.white, edge: 'torn', seed: 5, amp: 2.6 }, { pts: [[-70, 0], [70, 0], [50, 30], [-50, 30]], fill: PAL.terracotta, edge: 'cut', seed: 6, lift: 1.2 }]),
  mirror: () => piece('mirror', [
    { pts: rectPts(-7, 0, 14, 72), fill: PAL.goldDk, edge: 'cut', seed: 7, lift: 0.5 },
    { pts: ellipsePts(0, -48, 38, 48, 24), fill: PAL.gold, edge: 'cut', seed: 8, lift: 1 },
    { pts: ellipsePts(0, -48, 27, 36, 20), fill: PAL.skyTop, edge: 'cut', seed: 9, lift: 0.4, detail: (g) => { g.strokeStyle = PAL.white; g.lineWidth = 4; g.beginPath(); g.moveTo(-14, -66); g.lineTo(12, -32); g.stroke(); } },
  ]),
  basket: () => piece('basket', [
    { pts: [[-56, -8], [56, -8], [42, 62], [-42, 62]], fill: '#a97c42', edge: 'cut', seed: 10, lift: 0.8, detail: (g) => { g.strokeStyle = 'rgba(65,38,10,.55)'; g.lineWidth = 2.5; for (let x = -54; x <= 54; x += 12) { g.beginPath(); g.moveTo(x, -10); g.lineTo(x + 12, 64); g.stroke(); g.beginPath(); g.moveTo(x, 64); g.lineTo(x + 12, -10); g.stroke(); } } },
    { pts: [[-48, -8], [-22, -38], [22, -36], [48, -8]], fill: PAL.moss, edge: 'torn', seed: 11, amp: 2, lift: 0.4 },
  ]),
  keris: () => piece('keris', [
    { pts: rectPts(-10, -24, 20, 34), fill: PAL.goldDk, edge: 'cut', seed: 12, lift: 0.8 },
    { pts: [[-24, 6], [24, 6], [14, 22], [-14, 22]], fill: PAL.gold, edge: 'cut', seed: 13, lift: 1 },
    { pts: [[-9, 20], [9, 20], [12, 54], [-6, 86], [10, 118], [-4, 150], [0, 184], [-12, 150], [2, 118], [-14, 86], [4, 54]], fill: '#8d97a0', edge: 'cut', seed: 14, lift: 0.6 },
  ]),
  lotus: () => piece('lotus', [
    { pts: [[-36, 6], [-18, -32], [0, -10], [18, -32], [36, 6], [0, 20]], fill: PAL.coral, edge: 'torn', seed: 15, amp: 1.6, lift: 0.6 },
    { pts: [[-20, 8], [0, -40], [20, 8], [0, 18]], fill: PAL.white, edge: 'torn', seed: 16, amp: 1.4, lift: 1 },
    { pts: ellipsePts(0, 4, 10, 8, 12), fill: PAL.gold, edge: 'cut', seed: 17, lift: 1.2 },
  ]),
};

// ---------------- labels, titles, bubbles ----------------
/** Torn paper strip with handwritten text, stuck on with two pieces of washi tape. */
export function tag(ctx, text, x, y, { size = 54, rot = -0.03, alpha = 1, paper = PAL.white, ink = PAL.ink, font = 'Patrick Hand', tape = '#e7a2a2', s = 1 } = {}) {
  if (alpha <= 0.01) return;
  const P = cached(`kg-tag:${text}:${size}:${paper}:${ink}:${font}:${tape}`, () => {
    const mc = makeCanvas(10, 10).getContext('2d'); mc.font = `700 ${size}px '${font}'`;
    const tw = mc.measureText(text).width, w = tw + size * 1.2, h = size * 1.45;
    const strip = piece(`tagstrip:${text}:${size}:${paper}`, [{ pts: rectPts(-w / 2, -h / 2, w, h), fill: paper, edge: 'torn', seed: text.length + 3, amp: 2.8, rim: PAL.cream,
      detail: (g) => { g.fillStyle = ink; g.font = `700 ${size}px '${font}'`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, size * 0.06); } }], { res: 1.3 });
    const tp = piece(`tape:${tape}`, [{ pts: rectPts(-36, -15, 72, 30), fill: tape, edge: 'torn', amp: 1.2, seed: 9, rim: false, tex: 0.5, detail: (g) => { g.fillStyle = 'rgba(255,255,255,.45)'; for (let i = -40; i < 40; i += 14) g.fillRect(i, -16, 6, 32); } }]);
    return { strip, tp, w, h };
  });
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  draw(ctx, P.strip, 0, 0, { lift: 1.6 });
  ctx.globalAlpha *= 0.82;
  draw(ctx, P.tp, -P.w / 2 + 6, -P.h / 2 + 4, { rot: -0.6, lift: 0.4 });
  draw(ctx, P.tp, P.w / 2 - 6, -P.h / 2 + 4, { rot: 0.55, lift: 0.4 });
  ctx.restore();
}
/** One cut-out letter (coloured glyph on a cream paper margin). */
export function letterPiece(ch, size, col, font = 'Luckiest Guy') {
  return cached(`kg-letter:${ch}:${size}:${col}:${font}`, () => {
    const pad = size * 0.3, c = makeCanvas(Math.ceil(size * 1.3 + pad * 2), Math.ceil(size * 1.3 + pad * 2)), g = c.getContext('2d');
    g.font = `400 ${size}px '${font}'`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const cx = c.width / 2, cy = c.height / 2 + size * 0.05;
    g.lineJoin = 'round'; g.lineWidth = size * 0.2; g.strokeStyle = PAL.cream; g.strokeText(ch, cx, cy); g.fillStyle = PAL.cream; g.fillText(ch, cx, cy);
    texturise(g, c.width, c.height, 0.7);
    g.save(); g.globalCompositeOperation = 'source-atop'; g.filter = 'blur(1px) brightness(0)'; g.globalAlpha = 0.3; g.font = `400 ${size}px '${font}'`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, cx + 2, cy + 3); g.restore();
    const t2 = makeCanvas(c.width, c.height), g2 = t2.getContext('2d');
    g2.font = `400 ${size}px '${font}'`; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillStyle = col; g2.fillText(ch, cx, cy); texturise(g2, c.width, c.height, 1);
    g.drawImage(t2, 0, 0);
    const sw = Math.ceil(c.width / 5), sh = makeCanvas(sw + 4, sw + 4), sg = sh.getContext('2d');
    sg.drawImage(c, 2, 2, sw, sw); sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#1b120a'; sg.fillRect(0, 0, sh.width, sh.height);
    const w = c.width, h = c.height;
    return { c, sh, x0: -w / 2, y0: -h / 2, w, h, spad: 10, adv: g.measureText(ch).width };
  });
}
/** Title of cut-out letters dropping in one by one (each a little rotated). t0 = start time. */
export function cutTitle(ctx, text, x, y, t, t0, { size = 120, cols = [PAL.red, PAL.gold, PAL.water, PAL.moss], stagger = 0.06, spacing = 0.92, font = 'Luckiest Guy', alpha = 1 } = {}) {
  if (alpha <= 0) return;
  const chars = [...text];
  const L = chars.map((ch, i) => (ch === ' ' ? null : letterPiece(ch, size, cols[i % cols.length], font)));
  const adv = chars.map((ch, i) => (L[i] ? L[i].adv * spacing : size * 0.38));
  const total = adv.reduce((a, b) => a + b, 0);
  let cx = x - total / 2;
  chars.forEach((ch, i) => {
    const P = L[i];
    if (P) {
      const p = clamp((t - t0 - i * stagger) / 0.45);
      if (p > 0) {
        const e = ease.outBack(p, 2.2), rot = (hrand(i, 3) - 0.5) * 0.22 + (1 - e) * 0.8, dy = (1 - e) * -160;
        ctx.save(); ctx.globalAlpha *= alpha * Math.min(1, p * 3);
        draw(ctx, P, cx + adv[i] / 2, y + dy + (hrand(i, 5) - 0.5) * size * 0.12, { rot, lift: 1.4 + (1 - e) * 4 });
        ctx.restore();
      }
    }
    cx += adv[i];
  });
}
/** Torn-paper speech bubble with cut letters (used for shouted lines). */
export function shoutBubble(ctx, text, x, y, t, t0, { size = 92, col = PAL.red, w = 820, h = 300, tail = [-220, 210] } = {}) {
  const p = clamp((t - t0) / 0.35);
  if (p <= 0) return;
  const B = piece(`bubble:${w}:${h}:${col}`, [
    { pts: (() => { const pts = []; for (let i = 0; i < 26; i++) { const a = (i / 26) * TAU, rr = i % 2 ? 0.86 : 1.06; pts.push([Math.cos(a) * w / 2 * rr, Math.sin(a) * h / 2 * rr]); } return pts; })(), fill: col, edge: 'torn', seed: 4, amp: 4 },
    { pts: [[tail[0] + 60, h * 0.3], [tail[0], tail[1]], [tail[0] + 130, h * 0.3]], fill: col, edge: 'torn', seed: 5, amp: 3, lift: 0 },
  ]);
  const e = ease.outBack(p, 2.6), sh = (hrand(Math.floor(t * 12), 9) - 0.5) * 8;
  ctx.save(); ctx.translate(x + sh, y); ctx.scale(e, e); ctx.rotate(-0.04 + (hrand(Math.floor(t * 12), 7) - 0.5) * 0.04);
  draw(ctx, B, 0, 0, { lift: 2.4 });
  cutTitle(ctx, text, 0, 0, t, t0 + 0.05, { size, cols: [PAL.ink], stagger: 0.035 });
  ctx.restore();
}

// ---------------- weather ----------------
/** Paper rain: thin cut slivers in a few depth planes, falling and slanted. */
export function rain(ctx, t, { amt = 1, slant = 0.18, cols = [PAL.rain, '#9fbfcf'] } = {}) {
  if (amt <= 0) return;
  const [vx, vy, vw, vh] = viewRect(ctx, 0);
  ctx.save();
  for (let L = 0; L < 2; L++) {
    ctx.fillStyle = cols[L]; ctx.globalAlpha = (0.55 + L * 0.3) * amt;
    ctx.beginPath();
    const n = Math.floor(70 * amt), sp = 1500 + L * 700, len = 46 + L * 30;
    for (let i = 0; i < n; i++) {
      const x0 = vx + hrand(i, L, 1) * (vw + 300), y0 = ((hrand(i, L, 2) * (vh + 400) + (Math.floor(t * 12) / 12) * sp) % (vh + 400)) + vy - 200;
      const xx = x0 - (y0 - vy) * slant;
      ctx.moveTo(xx, y0); ctx.lineTo(xx + 3 + L, y0); ctx.lineTo(xx + 3 + L - len * slant, y0 + len); ctx.lineTo(xx - len * slant, y0 + len);
    }
    ctx.fill();
  }
  ctx.restore();
}
/** Big billowing storm cloud: two torn layers (dark body, lighter crown). */
export function stormCloud(seed = 1, w = 560) {
  const r = mulberry32(seed + 90), body = [], crown = [];
  for (let i = 0; i <= 48; i++) {
    const u = i / 48, x = lerp(-w / 2, w / 2, u), env = Math.sin(u * Math.PI);
    const b = Math.abs(Math.sin(u * Math.PI * (4 + (seed % 3)) + seed));
    body.push([x, -env * (70 + b * 60)]);
    crown.push([x * 0.8, -env * (90 + b * 70) - 10]);
  }
  for (let i = 48; i >= 0; i--) { const u = i / 48, x = lerp(-w / 2, w / 2, u), env = Math.sin(u * Math.PI); body.push([x, env * (30 + Math.abs(Math.sin(u * 9 + seed)) * 26)]); crown.push([x * 0.8, -env * 20]); }
  return piece(`storm${seed}:${w}`, [
    { pts: crown, fill: PAL.stormHi, edge: 'torn', seed, amp: 3.5, lift: 0 },
    { pts: body, fill: seed % 2 ? PAL.storm : PAL.stormDk, edge: 'torn', seed: seed + 3, amp: 4, lift: 1.4, rim: '#c9cfda' },
  ]);
}
/** A tuft of paper grass / fern for the near foreground (sways). Anchor: bottom centre. */
export function fern(seed = 1, h = 160, col = PAL.forest) {
  const r = mulberry32(seed), sheets = [];
  for (let i = 0; i < 6; i++) {
    const a = -0.9 + i * 0.36 + (r() - 0.5) * 0.2, L = h * (0.6 + r() * 0.5), bx = (r() - 0.5) * 30;
    const tx = bx + Math.sin(a) * L, ty = -Math.cos(a) * L;
    sheets.push({ pts: [[bx - 8, 0], [bx + (tx - bx) * 0.5 - 12, ty * 0.5], [tx, ty], [bx + (tx - bx) * 0.5 + 10, ty * 0.5 + 6], [bx + 8, 0]], fill: i % 2 ? col : PAL.moss, edge: 'cut', seed: seed * 10 + i, lift: 0.8 });
  }
  return piece(`fern${seed}:${h}:${col}`, sheets);
}
export function bolt(ctx, x, y, s = 1, alpha = 1) {
  const P = piece('bolt', [{ pts: [[0, 0], [60, 0], [20, 120], [70, 120], [-30, 330], [5, 170], [-40, 170]], fill: PAL.bolt, edge: 'cut', seed: 3 }]);
  draw(ctx, P, x, y, { s, alpha, lift: 2 });
}

// ---------------- frame & finishing ----------------
/** Whole-frame finish: paper grain + vignette pre-baked into ONE small overlay (one drawImage per frame). */
export function finish(ctx, { grain = 0.22, vig = 0.35 } = {}) {
  const T = cached(`kg-finish:${grain}:${vig}`, () => {
    const c = makeCanvas(540, 960), g = c.getContext('2d');
    g.globalAlpha = grain; g.fillStyle = g.createPattern(fibreTile(), 'repeat'); g.fillRect(0, 0, 540, 960);
    g.globalAlpha = 1;
    const gr = g.createRadialGradient(270, 480, 120, 270, 480, 620); gr.addColorStop(0, 'rgba(20,10,0,0)'); gr.addColorStop(1, `rgba(20,10,0,${vig})`);
    g.fillStyle = gr; g.fillRect(0, 0, 540, 960);
    return c;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(T, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
}
export const paperGrain = (ctx, a = 0.22) => finish(ctx, { grain: a, vig: 0 });
/** Torn-paper wipe used on big cuts: a sheet sweeps across (p 0..1). */
export function tornWipe(ctx, p, col = PAL.kraft, dir = 1) {
  if (p <= 0 || p >= 1) return;
  const P = piece('wipe' + col, [{ pts: (() => {
    const pts = [];
    for (let y = -120; y <= 2040; y += 20) pts.push([noise.fbm2(y * 0.006, 3) * 60, y]);
    for (let y = 2040; y >= -120; y -= 20) pts.push([-1400 + noise.fbm2(y * 0.006, 7) * 60, y]);
    return pts;
  })(), fill: col, edge: 'torn', seed: 8, amp: 5, step: 12 }], { shadowScale: 0.1 });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const x = lerp(-60, 1080 + 1460, ease.inOutSine(p));
  if (dir > 0) draw(ctx, P, x, 0, { lift: 4 });
  else { ctx.translate(1080, 0); ctx.scale(-1, 1); draw(ctx, P, x, 0, { lift: 4 }); }
  ctx.restore();
}

export { ease, clamp, lerp, hrand };
