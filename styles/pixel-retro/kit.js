// AniMasters style kit: PIXEL RETRO (16-bit side-scroller).
// Everything is drawn into a 135x240 buffer with integer coordinates and fillRect only (no anti-aliasing),
// then presented x8 with nearest-neighbour. Limited palette, Bayer dithering, rigged sprites with an
// automatic 1px outline, 2-4 frame cycles, parallax layers, HUD, bitmap text, mosaic/iris transitions.
import { clamp, lerp, hrand, noise } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const BW = 135, BH = 240, PX = 8;

// ---------------- palette (32 colours) ----------------
export const PAL = {
  ink: '#0d0a1c', night: '#15132f', navy: '#232a5c', dblue: '#2c4594', blue: '#3d6fd0', sky: '#63a2e8', sky2: '#9fd0f4', cloud: '#eef6fc',
  purple: '#4b2f6e', plum: '#7b3f7f', rose: '#c45f86', peach: '#f19a73', sun: '#ffd27a',
  dgreen: '#1e4b3c', green: '#2e7d4b', lgreen: '#5fbf4f', lime: '#b2e35b',
  dbrown: '#3f2620', brown: '#6e4129', tan: '#ad7748', sand: '#e2bb83',
  dred: '#6e1a2a', red: '#c3303b', orange: '#e86f2c', tile: '#a8432c',
  dgold: '#9c6a1a', gold: '#f0b030', yellow: '#ffe46a',
  dgrey: '#373a52', grey: '#727892', lgrey: '#b9bfd2', white: '#f7f4ea',
  skinD: '#8a5034', skin: '#c98a5b', skinL: '#ebb27f', pink: '#e9a48a',
  dteal: '#173f5c', teal: '#2a7fa3', lteal: '#6cc4d6',
  black: '#26243f', black2: '#3d3a60', wall: '#efe3c6', wallD: '#c9b48d',
};
const P = PAL;

// ---------------- screen ----------------
/** The low-res game screen. Draw into `g` (integer coords), then `present()` it. */
export function makeScreen() {
  const c = makeCanvas(BW, BH), g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  return { c, g };
}
const _tmp = () => cached('px-tmp', () => { const c = makeCanvas(BW, BH); c.getContext('2d').imageSmoothingEnabled = false; return c; });

/** Upscale the buffer to the 1080x1920 layer. dx,dy = shake in buffer pixels. */
export function present(ctx, c, { dx = 0, dy = 0, lines = 0.07 } = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
  if (dx || dy) { ctx.fillStyle = P.ink; ctx.fillRect(0, 0, BW * PX, BH * PX); }
  ctx.drawImage(c, 0, 0, BW, BH, Math.round(dx) * PX, Math.round(dy) * PX, BW * PX, BH * PX);
  if (lines > 0) {
    // faint pixel-row lines (like a TV showing a console), pre-baked
    const L = cached('px-lines:' + lines, () => {
      const o = makeCanvas(8, BH * PX), x = o.getContext('2d');
      x.fillStyle = `rgba(0,0,0,${lines})`;
      for (let y = PX - 1; y < BH * PX; y += PX) x.fillRect(0, y, 8, 1);
      return o;
    });
    ctx.drawImage(L, 0, 0, BW * PX, BH * PX);
  }
  ctx.restore();
}

/** SNES-style mosaic on the whole buffer (n = block size). */
export function mosaic(g, n) {
  n = Math.round(n); if (n <= 1) return;
  const t = _tmp(), x = t.getContext('2d');
  const w = Math.ceil(BW / n), h = Math.ceil(BH / n);
  x.clearRect(0, 0, BW, BH); x.drawImage(g.canvas, 0, 0, BW, BH, 0, 0, w, h);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
  g.drawImage(t, 0, 0, w, h, 0, 0, w * n, h * n); g.restore();
}

/** Per-pixel palette effect on the buffer (small, so cheap): gray 0..1, tint [r,g,b,a], dark 0..1. */
export function grade(g, { gray = 0, tint = null, dark = 0, posterize = 0 } = {}) {
  if (!gray && !tint && !dark) return;
  const id = g.getImageData(0, 0, BW, BH), d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], gg = d[i + 1], b = d[i + 2];
    if (gray) { const l = r * 0.3 + gg * 0.55 + b * 0.15; r = lerp(r, l, gray); gg = lerp(gg, l, gray); b = lerp(b, l, gray); }
    if (tint) { r = lerp(r, tint[0], tint[3]); gg = lerp(gg, tint[1], tint[3]); b = lerp(b, tint[2], tint[3]); }
    if (dark) { r *= 1 - dark; gg *= 1 - dark; b *= 1 - dark; }
    if (posterize) { const q = 255 / posterize; r = Math.round(r / q) * q; gg = Math.round(gg / q) * q; b = Math.round(b / q) * q; }
    d[i] = r; d[i + 1] = gg; d[i + 2] = b;
  }
  g.putImageData(id, 0, 0);
}

// ---------------- primitives ----------------
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** 4x4 ordered-dither pattern of colour b over a (level 0..1). */
export function dither(g, a, b, level) {
  const L = Math.round(clamp(level) * 16);
  if (L <= 0) return a; if (L >= 16) return b;
  return cached(`dith:${a}:${b}:${L}`, () => {
    const c = makeCanvas(4, 4), x = c.getContext('2d');
    for (let i = 0; i < 16; i++) { x.fillStyle = BAYER[i] < L ? b : a; x.fillRect(i % 4, i >> 2, 1, 1); }
    return g.createPattern(c, 'repeat');
  });
}
export const R = (g, x, y, w, h, c) => { if (c) g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/** Bresenham line stamped with w x w squares (crisp). */
export function pline(g, x0, y0, x1, y1, w = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, o = w >> 1;
  for (let k = 0; k < 400; k++) {
    g.fillRect(x0 - o, y0 - o, w, w);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
/** Filled pixel circle (rows of rects, no AA). */
export function pcircle(g, cx, cy, r, c) {
  if (c) g.fillStyle = c;
  cx = Math.round(cx); cy = Math.round(cy);
  for (let y = -r; y <= r; y++) { const hw = Math.round(Math.sqrt(Math.max(0, r * r - y * y + r * 0.6))); g.fillRect(cx - hw, cy + y, hw * 2 + 1, 1); }
}
/** Sprite from a string grid; map: char -> colour. '.' = transparent. Optional auto outline. */
export function sprite(key, rows, map, { outline = null } = {}) {
  return cached('spr:' + key, () => {
    const h = rows.length, w = Math.max(...rows.map((r) => r.length)), pad = outline ? 1 : 0;
    const c = makeCanvas(w + pad * 2, h + pad * 2), x = c.getContext('2d');
    rows.forEach((row, y) => { for (let i = 0; i < row.length; i++) { const col = map[row[i]]; if (col) { x.fillStyle = col; x.fillRect(i + pad, y + pad, 1, 1); } } });
    if (outline) addOutline(c, outline);
    return c;
  });
}
/** Add a 1px outline (4-neighbour) around opaque pixels, in place. */
export function addOutline(c, col) {
  const x = c.getContext('2d'), w = c.width, h = c.height;
  const id = x.getImageData(0, 0, w, h), d = id.data;
  const a = (i, j) => (i < 0 || j < 0 || i >= w || j >= h) ? 0 : d[(j * w + i) * 4 + 3];
  const out = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (!a(i, j) && (a(i - 1, j) || a(i + 1, j) || a(i, j - 1) || a(i, j + 1))) out.push(i, j);
  x.fillStyle = col;
  for (let k = 0; k < out.length; k += 2) x.fillRect(out[k], out[k + 1], 1, 1);
}
/** Draw a cached sprite canvas at integer position; anchor (ax, ay) inside the sprite; flip mirrors. */
export function blit(g, spr, x, y, { ax = 0, ay = 0, flip = false, alpha = 1 } = {}) {
  x = Math.round(x); y = Math.round(y);
  if (alpha < 1) { g.save(); g.globalAlpha = alpha; }
  if (flip) { g.save(); g.translate(x, 0); g.scale(-1, 1); g.drawImage(spr, -(spr.width - ax), y - ay); g.restore(); }
  else g.drawImage(spr, x - ax, y - ay);
  if (alpha < 1) g.restore();
}

// ---------------- bitmap text (Press Start 2P on its native 8px grid, thresholded) ----------------
function glyph(ch, col) {
  return cached(`gl:${ch}:${col}`, () => {
    const c = makeCanvas(8, 9), x = c.getContext('2d');
    x.font = "8px 'Press Start 2P'"; x.textBaseline = 'top'; x.fillStyle = col; x.fillText(ch, 0, 0);
    const id = x.getImageData(0, 0, 8, 9), d = id.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 100 ? 255 : 0;
    x.putImageData(id, 0, 0);
    return c;
  });
}
function textRaw(g, str, x, y, col, s, sp) {
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch !== ' ') g.drawImage(glyph(ch, col), 0, 0, 8, 9, x + i * (8 + sp) * s, y, 8 * s, 9 * s);
  }
}
/** Pixel text. scale = 1,2,3 (integer). align: left|center|right. outline/shadow colours optional. */
export function text(g, str, x, y, { color = P.white, scale = 1, align = 'left', outline = null, shadow = null, spacing = 0, chars = Infinity } = {}) {
  str = String(str).toUpperCase();
  const s = Math.max(1, Math.round(scale)), w = textW(str, s, spacing);
  if (chars < str.length) str = str.slice(0, Math.max(0, Math.floor(chars)));
  x = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x); y = Math.round(y);
  g.imageSmoothingEnabled = false;
  if (shadow) textRaw(g, str, x + s, y + s, shadow, s, spacing);
  if (outline) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) textRaw(g, str, x + ox * s, y + oy * s, outline, s, spacing);
  textRaw(g, str, x, y, color, s, spacing);
  return w;
}
export const textW = (str, s = 1, sp = 0) => String(str).length * (8 + sp) * s - sp * s;

// ---------------- tiny 3x5 font (small print on props, posters, HUD labels) ----------------
const TINY = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
  '.': '000000000000010', '!': '010010010000010', '?': '110001010000010', '-': '000000111000000', ':': '000010000010000', '+': '000010111010000',
  '/': '001001010100100', ',': '000000000010100', "'": '010010000000000', '%': '101001010100101', '&': '010101010101011',
};
/** Tiny 3x5 pixel text (4px advance). */
export function tiny(g, str, x, y, { color = P.white, align = 'left', scale = 1, outline = null } = {}) {
  str = String(str).toUpperCase();
  const s = Math.max(1, Math.round(scale)), w = str.length * 4 * s - s;
  x = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x); y = Math.round(y);
  const draw = (ox, oy, col) => {
    g.fillStyle = col;
    for (let i = 0; i < str.length; i++) {
      const gl = TINY[str[i]]; if (!gl) continue;
      for (let k = 0; k < 15; k++) if (gl[k] === '1') g.fillRect(x + ox + (i * 4 + (k % 3)) * s, y + oy + Math.floor(k / 3) * s, s, s);
    }
  };
  if (outline) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) draw(ox, oy, outline);
  draw(0, 0, color);
  return w;
}

// ---------------- sky, clouds, far land ----------------
/** Vertical dithered gradient through colour stops, cached. */
export function skyBands(g, stops, y0, y1, key = '') {
  const H = y1 - y0;
  const c = cached(`sky:${stops.join()}:${H}:${key}`, () => {
    const o = makeCanvas(BW, H), x = o.getContext('2d');
    const seg = H / (stops.length - 1);
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1], sy = Math.round(i * seg), ey = Math.round((i + 1) * seg);
      const steps = 5, bh = (ey - sy) / steps;
      for (let k = 0; k < steps; k++) { x.fillStyle = dither(x, a, b, k / (steps - 1) * 0.999 + (k === steps - 1 ? 0.001 : 0)); x.fillRect(0, Math.round(sy + k * bh), BW, Math.ceil(bh) + 1); }
    }
    return o;
  });
  g.drawImage(c, 0, y0);
}
const CLOUD = ['.....wwww.......', '...wwwwwwww.....', '..wwwwwwwwwww...', '.wwwwwwwwwwwwww.', 'wwwwwwwwwwwwwwww', 'bbbbwwwwwwbbbbbw', '..bbbbbbbbbbb...'];
export function cloud(g, x, y, { tone = 'day' } = {}) {
  const map = tone === 'day' ? { w: P.cloud, b: P.sky2 } : tone === 'dusk' ? { w: P.peach, b: P.rose } : { w: P.black2, b: P.navy };
  blit(g, sprite('cloud' + tone, CLOUD, map), x, y);
}
/** Stars that twinkle (palette-stepped). */
export function stars(g, t, { n = 40, y0 = 14, y1 = 150, seed = 3 } = {}) {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hrand(i, seed) * BW), y = Math.floor(y0 + hrand(i, seed + 1) * (y1 - y0));
    const tw = Math.floor(t * 6 + hrand(i, 9) * 10) % 9;
    g.fillStyle = tw === 0 ? P.white : tw < 3 ? P.lgrey : P.grey;
    g.fillRect(x, y, 1, 1);
    if (tw === 0 && i % 5 === 0) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
  }
}
/** A far, two-peaked volcano (Gunung Salak can be seen from Batavia on clear days). */
export function mountain(g, x, base, { col = '#7fa6d8', snow = '#a9c8ec', w = 150, h = 46 } = {}) {
  g.fillStyle = col;
  for (let i = 0; i < w; i++) {
    const u = i / w, p1 = Math.max(0, 1 - Math.abs(u - 0.38) * 3.1), p2 = Math.max(0, 1 - Math.abs(u - 0.62) * 3.6) * 0.86;
    const hh = Math.round(h * Math.max(p1, p2, 0.1 + 0.08 * Math.sin(u * 30)) + Math.floor(hrand(i, 4) * 1.6));
    g.fillRect(Math.round(x + i), base - hh, 1, hh);
    if (hh > h * 0.82) { g.fillStyle = snow; g.fillRect(Math.round(x + i), base - hh, 1, 2); g.fillStyle = col; }
  }
}

// ---------------- buildings & props (cached sprites) ----------------
/** Rumah kebaya Betawi: tile roof, gigi balang trim, plank walls, langkan railing. variant 0..3 */
export function betawiHouse(variant = 0, night = false) {
  // night: true (lit windows + navy shade) | 'dusk' (purple shade) | false
  return cached(`bhouse:${variant}:${night}`, () => {
    const W = 56, H = 42, c = makeCanvas(W, H), g = c.getContext('2d');
    const walls = [[P.lgreen, P.green], [P.sand, P.tan], [P.lteal, P.teal], [P.yellow, P.gold]][variant % 4];
    // roof (two slopes: steep top, gentle overhang)
    for (let y = 0; y < 15; y++) {
      const half = y < 9 ? 12 + y * 1.6 : 26.5 + (y - 9) * 0.6;
      const x0 = Math.round(28 - half), x1 = Math.round(28 + half);
      g.fillStyle = y === 0 ? P.orange : (y % 3 === 2 ? P.dred : P.tile);
      g.fillRect(x0, y, x1 - x0, 1);
      if (y % 3 !== 2) { g.fillStyle = P.dred; for (let x = x0 + ((y / 3 | 0) % 2) * 2; x < x1; x += 4) g.fillRect(x, y, 1, 1); }
    }
    // gigi balang (white sawtooth trim)
    g.fillStyle = P.white; g.fillRect(0, 15, W, 1);
    for (let x = 0; x < W; x++) { if (x % 4 !== 3) g.fillRect(x, 16, 1, 1); if (x % 4 === 1) g.fillRect(x, 17, 1, 1); }
    // walls (vertical planks)
    for (let x = 5; x < W - 5; x++) { g.fillStyle = x % 3 === 0 ? walls[1] : walls[0]; g.fillRect(x, 17, 1, 20); }
    g.fillStyle = walls[1]; g.fillRect(5, 17, W - 10, 1);
    // windows with jalousie
    for (const wx of [9, 40]) {
      g.fillStyle = P.white; g.fillRect(wx, 21, 8, 10);
      for (let k = 0; k < 4; k++) { g.fillStyle = night === true ? (k % 2 ? P.gold : P.yellow) : (k % 2 ? P.brown : P.tan); g.fillRect(wx + 1, 22 + k * 2, 6, 2); }
      g.fillStyle = P.white; g.fillRect(wx + 3, 22, 2, 8);
    }
    // door
    g.fillStyle = P.white; g.fillRect(23, 21, 10, 16);
    g.fillStyle = night === true ? P.gold : P.brown; g.fillRect(24, 22, 8, 15);
    g.fillStyle = night === true ? P.yellow : P.dbrown; g.fillRect(27, 22, 2, 15);
    // columns
    g.fillStyle = P.white; g.fillRect(2, 15, 2, 23); g.fillRect(W - 4, 15, 2, 23);
    // langkan railing
    g.fillStyle = P.white; g.fillRect(1, 31, 20, 1); g.fillRect(35, 31, 20, 1);
    for (let x = 2; x < 20; x += 3) g.fillRect(x, 32, 1, 5);
    for (let x = 36; x < 54; x += 3) g.fillRect(x, 32, 1, 5);
    // stone base + steps
    g.fillStyle = P.lgrey; g.fillRect(0, 37, W, 3); g.fillStyle = P.grey; g.fillRect(0, 39, W, 3);
    g.fillStyle = P.lgrey; g.fillRect(21, 37, 14, 2); g.fillRect(19, 39, 18, 3);
    if (night === true) addShade(c, 'rgba(20,18,60,0.45)');
    else if (night === 'dusk') addShade(c, 'rgba(70,35,90,0.42)');
    addOutline(c, P.ink);
    return c;
  });
}
function addShade(c, col) { const x = c.getContext('2d'); x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); x.restore(); }

/** Colonial building (Stadhuis-like with dome tower); `haze` = colour to fade toward for distance. */
export function dutchHall(haze = null, key = '') {
  return cached(`dhall:${haze}:${key}`, () => {
    const W = 72, H = 70, c = makeCanvas(W, H), g = c.getContext('2d');
    // tower
    g.fillStyle = P.white; g.fillRect(31, 14, 10, 14);
    g.fillStyle = P.dgrey; g.fillRect(34, 18, 4, 5);
    g.fillStyle = P.tile; for (let y = 0; y < 8; y++) { const hw = Math.round(1 + y * 0.7); g.fillRect(36 - hw, 6 + y, hw * 2, 1); }
    g.fillStyle = P.gold; g.fillRect(35, 2, 2, 4); g.fillRect(36, 0, 1, 2);
    // roof
    for (let y = 0; y < 8; y++) { g.fillStyle = y % 2 ? P.dred : P.tile; g.fillRect(4 - y + 4, 28 + y, W - 8 + y * 2 - 8, 1); }
    // body
    g.fillStyle = P.white; g.fillRect(2, 36, W - 4, 34);
    g.fillStyle = P.lgrey; g.fillRect(2, 52, W - 4, 1); g.fillRect(2, 36, W - 4, 1);
    for (let i = 0; i < 9; i++) {
      const x = 5 + i * 7.4 | 0;
      for (const y of [39, 55]) { g.fillStyle = P.dgreen; g.fillRect(x, y, 4, 10); g.fillStyle = P.green; g.fillRect(x + 1, y, 1, 10); g.fillStyle = P.white; g.fillRect(x, y + 4, 4, 1); }
    }
    // portico
    g.fillStyle = P.wall; g.fillRect(28, 50, 16, 20); g.fillStyle = P.dbrown; g.fillRect(32, 58, 8, 12);
    for (let i = 0; i < 4; i++) { g.fillStyle = P.white; g.fillRect(28 + i * 5, 50, 2, 20); }
    if (haze) addShade(c, haze);
    return c;
  });
}
/** Narrow Dutch canal house with a gable. */
export function canalHouse(variant = 0, haze = null) {
  return cached(`canal:${variant}:${haze}`, () => {
    const W = 22, H = 52, c = makeCanvas(W, H), g = c.getContext('2d');
    const body = [P.white, P.wall, P.sand, P.lgrey][variant % 4];
    g.fillStyle = body;
    for (let y = 0; y < 12; y++) { const hw = Math.min(11, 2 + Math.floor(y / 2) * 2); g.fillRect(11 - hw, y, hw * 2, 1); }
    g.fillRect(0, 12, W, H - 12);
    g.fillStyle = P.tile; g.fillRect(9, 2, 4, 2);
    for (let r = 0; r < 4; r++) for (const x of [3, 13]) { g.fillStyle = P.navy; g.fillRect(x, 15 + r * 9, 6, 6); g.fillStyle = P.white; g.fillRect(x + 2, 15 + r * 9, 1, 6); g.fillRect(x, 17 + r * 9, 6, 1); }
    g.fillStyle = P.dbrown; g.fillRect(8, H - 9, 6, 9);
    if (haze) addShade(c, haze);
    return c;
  });
}
/** Coconut palm; frame 0/1 for sway. */
export function palm(frame = 0, h = 46) {
  return cached(`palm:${frame}:${h}`, () => {
    const W = 34, c = makeCanvas(W, h + 8), g = c.getContext('2d');
    let x = 16;
    for (let y = h + 7; y > 9; y--) { x = 16 + Math.round(Math.sin((h + 7 - y) / h * 1.4) * 5); g.fillStyle = y % 4 === 0 ? P.dbrown : P.brown; g.fillRect(x, y, 3, 1); }
    const tx = x + 1, ty = 9, sw = frame ? 1 : 0;
    const fr = [[-14, 4], [-10, 9], [-5, 11], [5, 11], [11, 8], [15, 3], [-8, -3], [8, -3]];
    for (const [dx, dy] of fr) { g.fillStyle = P.green; pline(g, tx, ty, tx + dx + sw, ty + dy - (dy > 6 ? sw : 0), 2); g.fillStyle = P.lgreen; pline(g, tx, ty - 1, tx + Math.round(dx * 0.6) + sw, ty + Math.round(dy * 0.6) - 1, 1); }
    g.fillStyle = P.brown; g.fillRect(tx - 2, ty + 1, 2, 2); g.fillRect(tx + 1, ty + 2, 2, 2);
    addOutline(c, P.ink);
    return c;
  });
}
/** Gas street lamp (lit at night). */
export function lamp(lit = false) {
  return cached(`lamp:${lit}`, () => {
    const c = makeCanvas(9, 36), g = c.getContext('2d');
    g.fillStyle = P.dgrey; g.fillRect(4, 8, 1, 28); g.fillRect(2, 34, 5, 2); g.fillRect(3, 7, 3, 1);
    g.fillStyle = lit ? P.yellow : P.lgrey; g.fillRect(2, 2, 5, 5); g.fillStyle = P.dgrey; g.fillRect(1, 1, 7, 1); g.fillRect(4, 0, 1, 1);
    addOutline(c, P.ink); return c;
  });
}
/** Lamp halo (dithered circle) drawn under a lit lamp. */
export function lampGlow(g, x, y, r = 14) {
  for (let k = 3; k >= 1; k--) { g.fillStyle = dither(g, 'rgba(0,0,0,0)', 'rgba(255,228,106,0.9)', 0.12 * (4 - k)); pcircle(g, x, y, Math.round(r * k / 3)); }
}
/** Wooden fence segment. */
export function fence(w = 30) {
  return cached('fence:' + w, () => {
    const c = makeCanvas(w, 10), g = c.getContext('2d');
    g.fillStyle = P.tan; g.fillRect(0, 3, w, 2); g.fillRect(0, 7, w, 1);
    for (let x = 1; x < w; x += 5) { g.fillStyle = P.sand; g.fillRect(x, 1, 2, 9); g.fillStyle = P.tan; g.fillRect(x + 1, 1, 1, 9); }
    addOutline(c, P.ink); return c;
  });
}
/** Wooden crate / rice sack / money bag. */
export function crate() { return sprite('crate', ['bbbbbbbbbb', 'bttttttttb', 'btbttttbtb', 'bttbttbttb', 'btttbbtttb', 'btttbbtttb', 'bttbttbttb', 'btbttttbtb', 'bttttttttb', 'bbbbbbbbbb'], { b: P.brown, t: P.tan }, { outline: P.ink }); }
export function sack() { return sprite('sack', ['..bb..', '.bwwb.', 'swwwws', 'swwwws', 'swwwws', 'sswwss', '.ssss.'], { b: P.brown, w: P.sand, s: P.tan }, { outline: P.ink }); }
export function moneyBag() { return sprite('mbag', ['..yy...', '.bbbb..', '..bb...', '.bggbb.', 'bbgyyb.', 'bbgyybb', 'bbbggbb', '.bbbbb.'], { b: P.tan, g: P.dgold, y: P.yellow }, { outline: P.ink }); }

/** Spinning gulden coin, 4 frames. */
export function coin(g, x, y, t, { phase = 0 } = {}) {
  const f = Math.floor(t * 10 + phase * 4) % 4, w = [5, 3, 1, 3][f];
  x = Math.round(x); y = Math.round(y);
  g.fillStyle = P.ink; g.fillRect(x - (w >> 1) - 1, y - 2, w + 2, 6); g.fillRect(x - (w >> 1), y - 3, w, 8);
  g.fillStyle = P.gold; g.fillRect(x - (w >> 1), y - 2, w, 6);
  if (w > 1) { g.fillStyle = P.yellow; g.fillRect(x - (w >> 1), y - 2, 1, 4); g.fillStyle = P.dgold; g.fillRect(x + (w >> 1), y - 1, 1, 4); }
}
/** Golden sparkle (+) that pulses. */
export function sparkle(g, x, y, t, col = P.yellow) {
  const f = Math.floor(t * 12) % 4; g.fillStyle = col; x = Math.round(x); y = Math.round(y);
  if (f === 0) g.fillRect(x, y, 1, 1);
  else if (f === 1 || f === 3) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }
  else { g.fillRect(x - 2, y, 5, 1); g.fillRect(x, y - 2, 1, 5); g.fillStyle = P.white; g.fillRect(x, y, 1, 1); }
}
/** Dust puff (3 frames over life 0..1). */
export function puff(g, x, y, life) {
  if (life < 0 || life > 1) return;
  const r = 1 + Math.floor(life * 4);
  g.fillStyle = life < 0.5 ? P.white : P.lgrey;
  pcircle(g, x - r, y - r, r); pcircle(g, x + r, y - r * 0.6, Math.max(1, r - 1));
}
/** Heart icon for HP. */
export function heart(g, x, y, full = true) {
  blit(g, sprite('heart' + full, ['.rr.rr.', 'rwrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'], full ? { r: P.red, w: P.white } : { r: P.dgrey, w: P.grey }, { outline: P.ink }), x, y);
}

// ---------------- ground ----------------
/** Ground strip from y to the bottom: grass/dirt ('grass'), cobbles ('cobble'), planks ('pier'), scrolled by sx. */
export function ground(g, sx, y, style = 'grass') {
  const tile = cached('gtile:' + style, () => {
    const c = makeCanvas(32, BH), x = c.getContext('2d');
    if (style === 'grass') {
      x.fillStyle = P.lgreen; x.fillRect(0, 0, 32, 2); x.fillStyle = P.lime; for (let i = 0; i < 32; i += 3) x.fillRect(i, 0, 1, 1);
      x.fillStyle = P.green; x.fillRect(0, 2, 32, 3); for (let i = 0; i < 32; i += 4) x.fillRect(i + 1, 5, 2, 1);
    } else if (style === 'cobble') {
      x.fillStyle = P.lgrey; x.fillRect(0, 0, 32, 5); x.fillStyle = P.grey;
      for (let i = 0; i < 32; i += 6) { x.fillRect(i, 0, 1, 2); x.fillRect(i + 3, 3, 1, 2); } x.fillRect(0, 2, 32, 1); x.fillRect(0, 5, 32, 1);
    } else {
      x.fillStyle = P.tan; x.fillRect(0, 0, 32, 4); x.fillStyle = P.brown; x.fillRect(0, 4, 32, 1); for (let i = 0; i < 32; i += 8) x.fillRect(i, 0, 1, 4);
      x.fillStyle = P.sand; x.fillRect(0, 0, 32, 1);
    }
    // dirt body with dithered strata and pebbles
    const top = 6;
    const bands = style === 'pier' ? [P.dteal, P.navy, P.night] : [P.tan, P.brown, P.dbrown];
    for (let yy = top; yy < BH; yy++) {
      const u = (yy - top) / 70;
      const i = Math.min(bands.length - 2, Math.floor(u)), f = u - i;
      x.fillStyle = dither(x, bands[i], bands[i + 1], clamp(f)); x.fillRect(0, yy, 32, 1);
    }
    if (style !== 'pier') for (let k = 0; k < 7; k++) { const px = Math.floor(hrand(k, 2) * 30), py = 10 + Math.floor(hrand(k, 3) * 120); x.fillStyle = P.grey; x.fillRect(px, py, 3, 2); x.fillStyle = P.lgrey; x.fillRect(px, py, 2, 1); }
    else for (let k = 0; k < 6; k++) { const px = Math.floor(hrand(k, 5) * 28), py = 14 + Math.floor(hrand(k, 6) * 80); x.fillStyle = P.teal; x.fillRect(px, py, 4, 1); }
    x.fillStyle = P.ink; x.fillRect(0, 0, 32, 0);
    return c;
  });
  const o = ((Math.round(sx) % 32) + 32) % 32;
  for (let x = -o; x < BW; x += 32) g.drawImage(tile, 0, 0, 32, BH - y, x, y, 32, BH - y);
  g.fillStyle = P.ink; g.fillRect(0, y - 1, BW, 1);
}
/** Sea band with palette-cycled waves. */
export function sea(g, y, h, t, { night = false } = {}) {
  const cols = night ? [P.navy, P.dteal, P.teal] : [P.teal, P.blue, P.lteal];
  g.fillStyle = cols[0]; g.fillRect(0, y, BW, h);
  for (let r = 0; r < h; r += 3) {
    const sh = Math.floor(t * (6 + r)) % 12;
    g.fillStyle = r % 2 ? cols[1] : cols[2];
    for (let x = -12 + sh; x < BW; x += 12 + (r % 5)) g.fillRect(x, y + r, 4 + (r % 3), 1);
  }
}
/** Pinisi-style sailing ship silhouette. */
export function ship(variant = 0, night = false) {
  return cached(`ship:${variant}:${night}`, () => {
    const c = makeCanvas(46, 44), g = c.getContext('2d');
    const hull = night ? P.black : P.brown, sail = night ? P.black2 : P.white;
    g.fillStyle = hull; for (let y = 0; y < 7; y++) g.fillRect(2 + y, 34 + y, 42 - y * 2 - (y > 3 ? 2 : 0), 1);
    g.fillStyle = night ? P.ink : P.dbrown; g.fillRect(14, 2, 1, 33); g.fillRect(28, 6, 1, 29);
    g.fillStyle = sail;
    for (let y = 0; y < 22; y++) { g.fillRect(15, 6 + y, Math.round(10 - Math.abs(y - 11) * 0.5), 1); g.fillRect(29, 10 + y, Math.round(9 - Math.abs(y - 11) * 0.5), 1); }
    g.fillRect(4, 26, 10, 1); g.fillRect(6, 24, 8, 2);
    g.fillStyle = P.red; g.fillRect(14, 0, 4, 2);
    addOutline(c, P.ink); return c;
  });
}

// ---------------- characters (rigged sprites) ----------------
// Each character: head grid + torso grid + 2px limbs posed by angles (deg from straight down; + = forward).
// Poses are discrete keys, so every (character, pose) is rendered and outlined once, then cached.
const HEADS = {
  pitung: ['..hhhhhh..', '.hhhhhhhh.', '.hhhhhhhh.', '.Hsssssss.', '.Hsssswkss', '.Sssssskss', '.Sssssssss', '..sskkkks.', '..sssssss.', '...SSSSs..'],
  opas: ['..cccccc..', '.cccccccc.', '.rrrrrrrr.', '.cccccccccc', '.Hsssssss.', '.Hssswkss.', '.Sssssskss', '..sskkkks.', '..sssssss.', '...SSSS...'],
  hinne: ['....wwwwww....', '..wwwwwwwwww..', '.wwwwwwwwwwww.', 'llllllllllllll', '..Hpppppppp...', '..Hppppwkppp..', '..Pppppppkpp..', '..Pppppppppp..', '..ppyyyyyyyy..', '...pyy..pyy...', '...pppppppp...', '....PPPPPP....'],
  naipin: ['...wwwww..', '.wwwwwwww.', '.wwwwwwwg.', '.Hsssssss.', '.Hsssswks.', '.Sssssskss', '.Sssssssss', '..wwwwwws.', '..wwwwwww.', '...wwwww..'],
  tuan: ['...hhhhh...', '...hhhhh...', '.hhhhhhhhh.', '..Hsssssss.', '..Hssswkss.', '..Sssssskss', '..Sssssssss', '..sskkkkkss', '..ssssssss.', '...SSSSS...'],
  rakyat: ['....tt....', '..tttttt..', 'tttttttttt', '.Hsssssss.', '.Hsssswks.', '.Sssssskss', '.Sssssssss', '..ssssss..', '..sssssss.', '...SSSS...'],
  ibu: ['..wwwwww..', '.wwwwwwww.', 'wwssssssw.', 'wHsssswks.', 'wSsssskss.', 'wSsssssss.', 'w.ssssss..', '..sssss...', '...SSS....'],
  anak: ['..hhhhh..', '.hhhhhhh.', '.Hssssss.', '.Hssswks.', '.Sssssks.', '..sssss..', '...SSS...'],
  kakek: ['..hhhhhh..', '.hhhhhhhh.', '.Hsssssss.', '.Hsssswks.', '.Sssssskss', '.Sssssssss', '..wwwwwws.', '..wwwwww..', '...wwww...'],
};
const TORSOS = {
  pitung: ['.bbbbbbb.', 'bbbwrbbbb', 'bbbbwrbbb', 'bbbbbwrbb', '.bbbbbbr.', '.rrrrrrr.', '.RrRrRrR.', '.bbbbbbb.'],
  opas: ['.uuuuuuu.', 'uuuuyuuuu', 'uuuuuuuuu', 'uuuuyuuuu', '.uuuuuuu.', '.kkkkkkk.', '.uuuuuuu.'],
  hinne: ['..wwwwwwwww..', '.wwwwwwwwwwww.', 'wwwwwywwwwwww', 'wwwwwwwwwwwww', 'wwwwwywwwwwww', '.wwwwwwwwwww.', '.kkkkkykkkkk.', '.wwwwwwwwwww.', '.wwwwwwwwwww.'],
  naipin: ['.wwwwwww.', 'wwwwwwwww', 'wwwwgwwww', 'wwwwwwwww', 'wwwwwwwww', '.wwwwwww.', '.wwwwwww.', '.wwwwwww.', '.wwwwwww.'],
  tuan: ['..bbbbbbb..', '.bbbbwbbbbb.', 'bbbbbwbbbbbb', 'bbbbbwbyybbb', 'bbbbbbbbbybb', 'bbbbbbbbbbbb', '.bbbbbbbbbb.', '..bbbbbbbb..'],
  rakyat: ['.wwwwwww.', 'wgwgwgwgw', 'wwwwwwwww', 'wgwgwgwgw', '.wwwwwww.', '.rrrrrrr.', '.RrRrRrR.'],
  ibu: ['.ppppppp.', 'pppwppppp', 'pppwppppp', 'ppppppppp', '.ppppppp.', '.rRrRrRr.', '.RrRrRrR.', '.rRrRrRr.'],
  anak: ['.lllll.', 'lllllll', 'lLlLlLl', '.lllll.', '.rrrrr.'],
  kakek: ['.wwwwwww.', 'wwwwwwwww', 'wwwwwwwww', 'wwwwwwwww', '.wwwwwww.', '.rRrRrRr.', '.RrRrRrR.'],
};
const MAPS = {
  base: { h: P.black, H: P.black2, s: P.skin, S: P.skinD, k: P.ink, w: P.white, r: P.red, R: P.dred, b: P.black, y: P.gold, g: P.lgrey, t: P.sand, l: P.tan, L: P.brown, p: P.rose, u: P.dblue, c: P.ink, P: '#c07862' },
  hinne: { w: P.white, l: P.sand, p: P.pink, P: '#c07862', H: P.sand, y: P.yellow, k: P.ink, g: P.lgrey },
  opas: { c: P.navy, r: P.red, u: P.dblue, y: P.gold },
  naipin: { w: P.white, g: P.lgrey, s: P.skin },
  ibu: { w: P.white, p: P.rose },
};
export const RIG = {
  pitung: { head: 'pitung', torso: 'pitung', hx: -5, legL: [4, 4], armL: [3, 3], leg: P.black, legFar: P.ink, foot: P.skin, arm: P.black, armFar: P.ink, hand: P.skin, neck: 0 },
  opas: { head: 'opas', torso: 'opas', hx: -5, legL: [4, 4], armL: [3, 3], leg: P.dblue, legFar: P.navy, foot: P.ink, arm: P.dblue, armFar: P.navy, hand: P.skin, map: 'opas' },
  hinne: { head: 'hinne', torso: 'hinne', hx: -7, legL: [5, 5], armL: [4, 4], leg: P.white, legFar: P.lgrey, foot: P.ink, arm: P.white, armFar: P.lgrey, hand: P.pink, map: 'hinne', w: 3 },
  naipin: { head: 'naipin', torso: 'naipin', hx: -5, legL: [3, 3], armL: [3, 3], leg: P.white, legFar: P.lgrey, foot: P.skin, arm: P.white, armFar: P.lgrey, hand: P.skin, map: 'naipin' },
  tuan: { head: 'tuan', torso: 'tuan', hx: -6, legL: [3, 3], armL: [3, 3], leg: P.black, legFar: P.ink, foot: P.ink, arm: P.black, armFar: P.ink, hand: P.skin },
  rakyat: { head: 'rakyat', torso: 'rakyat', hx: -5, legL: [3, 3], armL: [3, 3], leg: P.skin, legFar: P.skinD, foot: P.skin, arm: P.skin, armFar: P.skinD, hand: P.skin },
  ibu: { head: 'ibu', torso: 'ibu', hx: -5, legL: [2, 2], armL: [3, 3], leg: P.skin, legFar: P.skinD, foot: P.skin, arm: P.rose, armFar: P.plum, hand: P.skin, map: 'ibu' },
  anak: { head: 'anak', torso: 'anak', hx: -4, legL: [2, 2], armL: [2, 2], leg: P.skin, legFar: P.skinD, foot: P.skin, arm: P.skin, armFar: P.skinD, hand: P.skin, w: 1 },
  kakek: { head: 'kakek', torso: 'kakek', hx: -5, legL: [3, 3], armL: [3, 3], leg: P.red, legFar: P.dred, foot: P.skin, arm: P.white, armFar: P.lgrey, hand: P.skin },
};
// pose: legs [[thigh, bend], [thigh, bend]] (near, far), arms [[upper, bend], ...], dy body offset, air (don't ground)
export const POSES = {
  idle0: { legs: [[6, 0], [-6, 0]], arms: [[12, 18], [-10, 10]] },
  idle1: { legs: [[6, 0], [-6, 0]], arms: [[14, 22], [-8, 12]], dy: 1 },
  run0: { legs: [[42, -10], [-38, -58]], arms: [[-50, 40], [55, 70]] },
  run1: { legs: [[16, -40], [-12, -76]], arms: [[-20, 50], [25, 60]], dy: -1 },
  run2: { legs: [[-38, -58], [42, -10]], arms: [[55, 70], [-50, 40]] },
  run3: { legs: [[-12, -76], [16, -40]], arms: [[25, 60], [-20, 50]], dy: -1 },
  walk0: { legs: [[22, 0], [-20, -10]], arms: [[-15, 15], [15, 20]] },
  walk1: { legs: [[4, -20], [-4, -10]], arms: [[0, 15], [0, 15]], dy: -1 },
  walk2: { legs: [[-20, -10], [22, 0]], arms: [[15, 20], [-15, 15]] },
  walk3: { legs: [[-4, -10], [4, -20]], arms: [[0, 15], [0, 15]], dy: -1 },
  jump: { legs: [[60, -95], [-15, -60]], arms: [[150, 20], [120, 30]], air: true },
  fall: { legs: [[20, -30], [-25, -20]], arms: [[160, 0], [140, 0]], air: true },
  windup: { legs: [[30, 0], [-30, 0]], arms: [[-150, 40], [40, 60]] },
  slash: { legs: [[45, -10], [-40, 0]], arms: [[85, 5], [-40, 30]] },
  punch: { legs: [[35, 0], [-35, 0]], arms: [[90, 0], [-30, 80]] },
  kick: { legs: [[95, 0], [-10, 0]], arms: [[40, 90], [-60, 60]] },
  guard: { legs: [[30, -15], [-30, 0]], arms: [[60, 100], [30, 110]] },
  cheer: { legs: [[10, 0], [-10, 0]], arms: [[165, 0], [-165, 0]] },
  cheerJ: { legs: [[30, -60], [-25, -60]], arms: [[160, 10], [-160, 10]], air: true },
  point: { legs: [[8, 0], [-8, 0]], arms: [[100, 0], [-10, 20]] },
  raise: { legs: [[18, 0], [-18, 0]], arms: [[170, 0], [-20, 30]] },
  hurt: { legs: [[-20, -10], [10, -20]], arms: [[-120, 30], [-80, 40]] },
  aim: { legs: [[18, 0], [-18, 0]], arms: [[88, 0], [70, 15]] },
  bow: { legs: [[10, 0], [-10, 0]], arms: [[30, 40], [20, 40]], dy: 1 },
  sit: { legs: [[85, -85], [80, -85]], arms: [[30, 50], [20, 60]], sit: true },
  tell0: { legs: [[85, -85], [80, -85]], arms: [[110, -20], [20, 60]], sit: true },
  tell1: { legs: [[85, -85], [80, -85]], arms: [[140, -40], [30, 50]], sit: true },
};
const rad = (d) => (d * Math.PI) / 180;
function limb(g, x, y, a1, bend, [l1, l2], w, col, end) {
  const ex = x + Math.sin(rad(a1)) * l1, ey = y + Math.cos(rad(a1)) * l1;
  const a2 = a1 + bend, fx = ex + Math.sin(rad(a2)) * l2, fy = ey + Math.cos(rad(a2)) * l2;
  g.fillStyle = col; pline(g, x, y, ex, ey, w); pline(g, ex, ey, fx, fy, w);
  if (end) { g.fillStyle = end; g.fillRect(Math.round(fx) - (w >> 1), Math.round(fy) - (w >> 1), w, w); }
  return [Math.round(fx), Math.round(fy), a2];
}
function propDraw(g, prop, hx, hy, ang) {
  if (!prop) return;
  const dx = Math.sin(rad(ang)), dy = Math.cos(rad(ang));
  if (prop === 'golok') {
    g.fillStyle = P.brown; pline(g, hx, hy, hx + dx * 2, hy + dy * 2, 1);
    g.fillStyle = P.lgrey; pline(g, hx + dx * 2, hy + dy * 2, hx + dx * 8, hy + dy * 8, 2);
    g.fillStyle = P.white; pline(g, hx + dx * 3, hy + dy * 3, hx + dx * 7, hy + dy * 7, 1);
  } else if (prop === 'rifle') {
    g.fillStyle = P.brown; pline(g, hx - dx * 3, hy - dy * 3, hx + dx * 3, hy + dy * 3, 2);
    g.fillStyle = P.dgrey; pline(g, hx + dx * 3, hy + dy * 3, hx + dx * 11, hy + dy * 11, 1);
  } else if (prop === 'pistol') {
    g.fillStyle = P.dgrey; pline(g, hx, hy, hx + dx * 5, hy + dy * 5, 2); g.fillStyle = P.brown; g.fillRect(hx - 1, hy, 2, 2);
  } else if (prop === 'stick') {
    g.fillStyle = P.tan; pline(g, hx - dx * 4, hy - dy * 4, hx + dx * 10, hy + dy * 10, 1);
  } else if (prop === 'cane') {
    g.fillStyle = P.dbrown; pline(g, hx, hy, hx, hy + 10, 1); g.fillStyle = P.gold; g.fillRect(hx - 1, hy - 1, 2, 1);
  } else if (prop === 'lantern') {
    g.fillStyle = P.dgrey; g.fillRect(hx - 1, hy, 1, 2); g.fillStyle = P.yellow; g.fillRect(hx - 2, hy + 2, 3, 3);
  }
}
/** Build (cached) the outlined canvas of a character in a pose. Returns {c, ax, ay}. */
export function charSprite(name, pose, prop = null) {
  return cached(`ch:${name}:${pose}:${prop}`, () => {
    const r = RIG[name], po = POSES[pose] || POSES.idle0;
    const map = { ...MAPS.base, ...(r.map ? MAPS[r.map] : {}) };
    const head = HEADS[r.head], torso = TORSOS[r.torso];
    const W = 48, H = 52, ax = 24, ay = 46, w = r.w || 2;
    const c = makeCanvas(W, H), g = c.getContext('2d');
    const legLen = r.legL[0] + r.legL[1], tw = Math.max(...torso.map((s) => s.length)), th = torso.length;
    let dy = po.dy || 0;
    if (po.sit) dy += legLen - 2;
    const hipY = ay - legLen + dy, hipX = ax;
    const torsoTop = hipY - th + 2, tx = ax - Math.floor(tw / 2);
    const shY = torsoTop + 1, shX = ax;
    // far limbs first
    const fl = po.legs[1], fa = po.arms[1];
    limb(g, hipX - 1, hipY, fl[0], fl[1], r.legL, w, r.legFar, r.foot);
    limb(g, shX - 1, shY, fa[0], fa[1], r.armL, w, r.armFar, r.hand);
    // torso + head
    torso.forEach((row, y) => { for (let i = 0; i < row.length; i++) { const col = map[row[i]]; if (col) { g.fillStyle = col; g.fillRect(tx + i, torsoTop + y, 1, 1); } } });
    const hw = Math.max(...head.map((s) => s.length));
    const hx = ax + (r.hx ?? -Math.floor(hw / 2)), hy = torsoTop - head.length + 1;
    head.forEach((row, y) => { for (let i = 0; i < row.length; i++) { const col = map[row[i]]; if (col) { g.fillStyle = col; g.fillRect(hx + i, hy + y, 1, 1); } } });
    // near limbs
    const nl = po.legs[0], na = po.arms[0];
    limb(g, hipX + 1, hipY, nl[0], nl[1], r.legL, w, r.leg, r.foot);
    const [hx2, hy2, ang] = limb(g, shX + 1, shY, na[0], na[1], r.armL, w, r.arm, r.hand);
    propDraw(g, prop, hx2, hy2, ang);
    addOutline(c, P.ink);
    // ground the sprite: lowest opaque row sits on ay
    let shift = 0;
    if (!po.air && !po.sit) {
      const d = g.getImageData(0, 0, W, H).data; let low = 0;
      for (let y = H - 1; y >= 0 && !low; y--) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) { low = y; break; }
      shift = ay - low;
    }
    const hand = [hx2 - ax + 1, hy2 - ay + shift, ang];
    if (!shift) return { c, ax, ay, hand };
    const c2 = makeCanvas(W, H); c2.getContext('2d').drawImage(c, 0, shift);
    return { c: c2, ax, ay, hand };
  });
}
/** Draw character `name` in `pose` with feet at (x, y). face 1 = right, -1 = left. flash = white silhouette. */
export function drawChar(g, name, pose, x, y, { face = 1, prop = null, flash = false, alpha = 1 } = {}) {
  const s = charSprite(name, pose, prop);
  let img = s.c;
  if (flash) img = cached(`chW:${name}:${pose}:${prop}`, () => { const c = makeCanvas(s.c.width, s.c.height), x2 = c.getContext('2d'); x2.drawImage(s.c, 0, 0); x2.globalCompositeOperation = 'source-in'; x2.fillStyle = P.white; x2.fillRect(0, 0, c.width, c.height); return c; });
  blit(g, img, x, y, { ax: s.ax, ay: s.ay, flip: face < 0, alpha });
  return [Math.round(x + s.hand[0] * face), Math.round(y + s.hand[1])];
}
/** Character drawn at an integer zoom (menus, close-ups). */
export function drawCharScaled(g, name, pose, x, y, s = 3, { face = 1, prop = null } = {}) {
  const sp = charSprite(name, pose, prop);
  g.save(); g.imageSmoothingEnabled = false; g.translate(Math.round(x), Math.round(y)); g.scale(face * s, s);
  g.drawImage(sp.c, -sp.ax, -sp.ay); g.restore();
}
/** Lying-down (KO) version of a character: the standing sprite rotated 90 degrees. */
export function drawDown(g, name, x, y, { face = 1 } = {}) {
  const s = charSprite(name, 'hurt');
  const c = cached(`down:${name}`, () => { const o = makeCanvas(s.c.height, s.c.width), x2 = o.getContext('2d'); x2.translate(o.width, 0); x2.rotate(Math.PI / 2); x2.drawImage(s.c, 0, 0); return o; });
  blit(g, c, x, y, { ax: c.width - s.ay + 2, ay: s.ax + 6, flip: face < 0 });
}
/** Pose name for a cycle at time t: cycle('run', t, 10) -> run0..run3. */
export const cycle = (base, t, fps = 10, n = 4) => base + (Math.floor(t * fps) % n);

/** A head scaled up (portrait for select screens / wanted posters). */
export function portrait(g, name, x, y, scale = 4) {
  const r = RIG[name], map = { ...MAPS.base, ...(r.map ? MAPS[r.map] : {}) };
  const spr = sprite('head:' + name, HEADS[r.head], map, { outline: P.ink });
  g.imageSmoothingEnabled = false;
  g.drawImage(spr, Math.round(x - spr.width * scale / 2), Math.round(y - spr.height * scale / 2), spr.width * scale, spr.height * scale);
}

// ---------------- UI ----------------
/** Top HUD bar: hearts, score, level. `msg` replaces the bar content (e.g. PRESS START). */
export function hud(g, { hp = 3, max = 3, score = 0, level = '1-1', label = 'SKOR', msg = null } = {}) {
  g.fillStyle = P.ink; g.fillRect(0, 0, BW, 16); g.fillStyle = P.navy; g.fillRect(0, 15, BW, 1);
  if (msg) { text(g, msg, BW / 2, 4, { color: P.lime, align: 'center' }); return; }
  for (let i = 0; i < max; i++) heart(g, 2 + i * 9, 5, i < hp);
  tiny(g, label, 69, 2, { color: P.lgrey, align: 'center' });
  text(g, String(Math.floor(score)).padStart(6, '0'), 69, 8, { color: P.white, align: 'center' });
  tiny(g, 'LEVEL', 132, 2, { color: P.lgrey, align: 'right' });
  text(g, level, 133, 8, { color: P.yellow, align: 'right' });
}
/** Double-bordered RPG window. */
export function panel(g, x, y, w, h, { fill = P.navy, border = P.white, inner = P.blue } = {}) {
  R(g, x, y, w, h, P.ink); R(g, x + 1, y + 1, w - 2, h - 2, border); R(g, x + 2, y + 2, w - 4, h - 4, inner); R(g, x + 3, y + 3, w - 6, h - 6, fill);
}
/** Boss health bar with name. */
export function bossBar(g, name, frac, y = 20, { sub = null } = {}) {
  panel(g, 6, y, BW - 12, sub ? 30 : 22, { fill: P.night, inner: P.dred, border: P.red });
  text(g, name, BW / 2, y + 4, { color: P.yellow, align: 'center' });
  R(g, 12, y + 14, BW - 24, 5, P.ink); R(g, 13, y + 15, Math.round((BW - 26) * clamp(frac)), 3, P.red); R(g, 13, y + 15, Math.round((BW - 26) * clamp(frac)), 1, P.peach);
  if (sub) text(g, sub, BW / 2, y + 21, { color: P.lgrey, align: 'center' });
}
/** Iris wipe: black outside a circle of radius r (pixel exact). */
export function iris(g, cx, cy, r) {
  g.fillStyle = P.ink;
  for (let y = 0; y < BH; y++) {
    const d = y - cy;
    if (Math.abs(d) >= r) { g.fillRect(0, y, BW, 1); continue; }
    const hw = Math.round(Math.sqrt(r * r - d * d));
    g.fillRect(0, y, Math.max(0, cx - hw), 1); g.fillRect(cx + hw, y, BW, 1);
  }
}
/** Horizontal speed streaks (for slow-motion / dash). */
export function streaks(g, t, { n = 26, col = P.navy, speed = 220, y0 = 18, y1 = 230, seed = 5 } = {}) {
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const y = Math.floor(y0 + hrand(i, seed) * (y1 - y0)), len = 8 + Math.floor(hrand(i, seed + 1) * 26);
    const x = ((-t * speed * (0.6 + hrand(i, 7))) % (BW + len) + BW + len) % (BW + len) - len;
    g.fillRect(Math.floor(x), y, len, 1);
  }
}
/** Small "!" alert bubble. */
export function alert(g, x, y) {
  blit(g, sprite('alert', ['.www.', 'wwrww', 'wwrww', 'wwrww', 'wwwww', 'wwrww', '.www.', '..w..'], { w: P.white, r: P.red }, { outline: P.ink }), x - 3, y - 9);
}
/** Floating score popup ("+100") rising over life 0..1. */
export function popup(g, str, x, y, life, col = P.yellow) {
  if (life < 0 || life > 1) return;
  text(g, str, x, y - Math.floor(life * 12), { color: col, align: 'center', outline: P.ink });
}
