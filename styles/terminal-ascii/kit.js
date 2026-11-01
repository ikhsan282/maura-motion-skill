// AniMasters style kit: TERMINAL ASCII (green-phosphor CRT).
// A character-grid terminal drawn into a half-resolution "phosphor" canvas, then shown through a CRT:
// cheap bloom (a 1/8-size copy stretched underneath the sharp text), barrel curvature (horizontal strips,
// each pinched by its distance from the centre), cached scanlines + bezel + vignette, flicker, a rolling
// refresh band, slice glitches on cuts and a power-off collapse. Pictures are ASCII art: hand-typed, or any
// canvas drawing converted to characters by luminance (asciiDraw), or big text (asciiText).
import { clamp, lerp, ease, hrand, noise } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const COLS = 36, ROWS = 40, CW = 15, CH = 24;            // grid on the 540x960 phosphor canvas
export const SW = COLS * CW, SH = ROWS * CH;                     // 540 x 960 (shown x2)
export const SAFE_ROWS = 28;                                     // rows 0..27 stay above the caption band
export const PAL = { bg: '#020904', g: '#46ff7e', hi: '#d6ffe2', dim: '#1f9a47', faint: '#0d4a22', amber: '#ffbf3a', red: '#ff5a4a' };
export const RAMP = ' .:-=+*#%@';

let S = null; // { c, g }
/** Create (once) the phosphor screen. Returns its 2D context. */
export function screen() {
  if (!S) { const c = makeCanvas(SW, SH); S = { c, g: c.getContext('2d') }; }
  return S.g;
}
/** Clear the phosphor screen for a new frame. */
export function clear() { const g = screen(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, SW, SH); }

const FONT = `${CH + 3}px 'VT323'`;
let _sp = null;
function spacing(g) { if (_sp === null) { g.font = FONT; _sp = CW - g.measureText('M').width; } return _sp; }
/** Print a string at grid (col,row). opts: color, inv (reverse video), alpha, chars (typewriter limit). */
export function put(col, row, str, { color = PAL.g, inv = false, alpha = 1, chars = Infinity, bg = null } = {}) {
  const g = screen();
  str = String(str);
  if (chars < str.length) str = str.slice(0, Math.max(0, Math.floor(chars)));
  if (!str.length) return 0;
  g.save(); g.globalAlpha = alpha;
  const x = col * CW, y = row * CH;
  if (inv || bg) { g.fillStyle = bg || color; g.fillRect(x - 1, y + 1, str.length * CW + 2, CH - 1); }
  g.font = FONT; g.letterSpacing = spacing(g) + 'px'; g.textBaseline = 'top';
  g.fillStyle = inv ? PAL.bg : color;
  g.fillText(str, x + spacing(g) / 2, y + 1);
  g.restore();
  return str.length;
}
/** Print several lines starting at (col,row). */
export function lines(col, row, arr, opts = {}) { arr.forEach((s, i) => put(col, row + i, s, opts)); }
/** Typewriter: how many characters of a string are visible at time t (cps chars per second). */
export const typed = (t, t0, cps = 30) => Math.max(0, (t - t0) * cps);
/** Blinking block cursor. */
export function cursor(col, row, t, { color = PAL.g, hz = 2.2 } = {}) {
  if (Math.floor(t * hz * 2) % 2) return;
  const g = screen(); g.fillStyle = color; g.fillRect(col * CW + 1, row * CH + 3, CW - 2, CH - 4);
}
/** Typed command line: prompt + command typed from t0, cursor while typing. Returns time typing ends. */
export function command(col, row, prompt, cmd, t, t0, { cps = 18, color = PAL.g } = {}) {
  put(col, row, prompt, { color: PAL.dim });
  const n = put(col + prompt.length, row, cmd, { color, chars: typed(t, t0, cps) });
  if (n < cmd.length || t < t0) cursor(col + prompt.length + n, row, t);
  return t0 + cmd.length / cps;
}
/** Box drawn with ASCII (+-|). */
export function box(col, row, w, h, { color = PAL.dim, title = null, double = false } = {}) {
  const hz = double ? '=' : '-';
  put(col, row, '+' + hz.repeat(w - 2) + '+', { color });
  for (let r = 1; r < h - 1; r++) { put(col, row + r, '|', { color }); put(col + w - 1, row + r, '|', { color }); }
  put(col, row + h - 1, '+' + hz.repeat(w - 2) + '+', { color });
  if (title) put(col + 2, row, ` ${title} `, { color: PAL.hi });
}
/** Character progress bar: [#####.....] 50% */
export function progress(col, row, w, frac, { color = PAL.g, label = true } = {}) {
  const n = Math.round(clamp(frac) * (w - 2));
  put(col, row, '[' + '#'.repeat(n) + '.'.repeat(w - 2 - n) + ']', { color });
  if (label) put(col + w + 1, row, String(Math.round(clamp(frac) * 100)).padStart(3) + '%', { color: PAL.hi });
}
/** Hex dump of a byte string: offset, `per` hex bytes, ascii column (per=6 fits 30 cols). hl: [[start,end,color]] byte ranges. */
export function hexDump(col, row, data, { offset = 0, rows = 10, start = 0, hl = [], color = PAL.dim, per = 6 } = {}) {
  for (let r = 0; r < rows; r++) {
    const base = start + r * per;
    if (base >= data.length) break;
    put(col, row + r, (offset + base).toString(16).toUpperCase().padStart(4, '0'), { color: PAL.faint });
    for (let k = 0; k < per; k++) {
      const i = base + k; if (i >= data.length) break;
      const ch = data.charCodeAt(i), h = hl.find(([a, b]) => i >= a && i < b);
      const hex = ch.toString(16).toUpperCase().padStart(2, '0');
      put(col + 5 + k * 3, row + r, hex, h ? { inv: true, color: h[2] || PAL.g } : { color });
      const asc = ch >= 32 && ch < 127 ? String.fromCharCode(ch) : '.';
      put(col + 6 + per * 3 + k, row + r, asc, h ? { inv: true, color: h[2] || PAL.g } : { color: PAL.g });
    }
  }
}
/** Word-wrap a long string into lines of width w (keeps words whole). */
export function wrap(str, w) {
  const out = []; let cur = '';
  for (const word of str.split(' ')) { if ((cur + ' ' + word).trim().length > w) { out.push(cur); cur = word; } else cur = (cur ? cur + ' ' : '') + word; }
  if (cur) out.push(cur); return out;
}

// ---------------- ASCII art ----------------
const _ac = {};
/** Convert a drawing to ASCII: draw(g, w, h, t) paints white-on-black into a cols x rows*2 canvas; luminance -> RAMP.
 *  Returns an array of strings. Pass key + a quantised t to cache animated frames. */
export function asciiDraw(cols, rows, draw, { key = null, t = 0, ramp = RAMP, gamma = 1 } = {}) {
  const k = key ? `${key}:${cols}:${rows}:${t}` : null;
  if (k && _ac[k]) return _ac[k];
  const w = cols, h = rows * 2;
  const c = cached(`asc-c:${w}x${h}`, () => makeCanvas(w, h)), g = c.getContext('2d', { willReadFrequently: true });
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.strokeStyle = '#fff';
  draw(g, w, h, t);
  const d = g.getImageData(0, 0, w, h).data, out = [];
  for (let r = 0; r < rows; r++) {
    let s = '';
    for (let x = 0; x < w; x++) {
      const i1 = ((r * 2) * w + x) * 4, i2 = ((r * 2 + 1) * w + x) * 4;
      const l = Math.pow((d[i1] + d[i2]) / 510, gamma);
      s += ramp[Math.min(ramp.length - 1, Math.floor(l * ramp.length))];
    }
    out.push(s);
  }
  if (k) { _ac[k] = out; const ks = Object.keys(_ac); if (ks.length > 400) delete _ac[ks[0]]; }
  return out;
}
/** Big block letters made of characters (figlet-like). */
export function asciiText(str, cols, rows, { font = "bold 20px 'JetBrains Mono'", ramp = ' .:#@' } = {}) {
  return asciiDraw(cols, rows, (g, w, h) => {
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
    const m = g.measureText(str).width, s = Math.min((w * 0.96) / m, h / 16);
    g.translate(w / 2, h / 2 + 1); g.scale(s, s * 1.05); g.fillText(str, 0, 0);
  }, { key: 'txt:' + str + font, ramp });
}
const TINY = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
  M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101',
  S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110',
  4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
  '!': '010010010000010', '?': '110001010000010', '-': '000000111000000', '.': '000000000000010', ' ': '000000000000000',
};
/** Crisp block letters from a 3x5 bitmap font, each pixel = sx x sy characters of `ch`. Returns lines. */
export function bigText(str, { sx = 2, sy = 2, ch = '#', gap = 1, shade = null } = {}) {
  str = String(str).toUpperCase();
  const rows = [];
  for (let y = 0; y < 5 * sy; y++) {
    let line = '';
    for (let i = 0; i < str.length; i++) {
      const gl = TINY[str[i]] || TINY[' '];
      for (let x = 0; x < 3 * sx; x++) { const on = gl[Math.floor(y / sy) * 3 + Math.floor(x / sx)] === '1'; line += on ? ch : ' '; }
      if (i < str.length - 1) line += ' '.repeat(gap);
    }
    if (shade) line = line.replace(/ (?=#)/g, ' ');
    rows.push(line);
  }
  return rows;
}
/** Print ASCII lines with per-line colour function and optional reveal (rows visible). */
export function art(col, row, arr, { color = PAL.g, reveal = Infinity, skipSpaces = true, alpha = 1 } = {}) {
  arr.forEach((s, i) => { if (i < reveal) put(col, row + i, s, { color: typeof color === 'function' ? color(i) : color, alpha }); });
}

/** Hand-typed pictures. */
export const ART = {
  floppy: [
    ' ________________________ ',
    '|  ____________________  |',
    '| |                    | |',
    '| |   (c) BRAIN  1986  | |',
    '| |____________________| |',
    '|                        |',
    '|          .--.          |',
    '|         ( () )         |',
    '|          `--`          |',
    '|                        |',
    '|           []           |',
    '|          |  |          |',
    '|__________|__|__________|',
  ],
  phone: [
    '    __________    ',
    '   /  ______  \\   ',
    '  /__/      \\__\\  ',
    '   _|________|_   ',
    '  / o  o  o  o \\  ',
    ' |  o  o  o  o  | ',
    ' |  o  o  o  o  | ',
    ' |______________| ',
  ],
  pc: [
    ' ____________________ ',
    '|  ________________  |',
    '| |                | |',
    '| |  A:\\>_         | |',
    '| |                | |',
    '| |________________| |',
    '|____________________|',
    '  _|______________|_  ',
    ' |  ==   [____]  .  | ',
    ' |__________________| ',
  ],
};

/** Rough world map polygons (equirectangular 0..1) for asciiDraw. */
export const WORLD = [
  [[0.04, 0.16], [0.14, 0.1], [0.3, 0.09], [0.34, 0.2], [0.29, 0.3], [0.25, 0.4], [0.21, 0.49], [0.17, 0.44], [0.12, 0.34], [0.05, 0.3]],
  [[0.25, 0.52], [0.31, 0.53], [0.37, 0.61], [0.33, 0.74], [0.29, 0.88], [0.27, 0.86], [0.26, 0.68], [0.23, 0.58]],
  [[0.44, 0.14], [0.52, 0.1], [0.57, 0.16], [0.57, 0.3], [0.5, 0.33], [0.45, 0.29], [0.43, 0.22]],
  [[0.44, 0.37], [0.53, 0.35], [0.6, 0.42], [0.62, 0.5], [0.57, 0.68], [0.53, 0.78], [0.5, 0.7], [0.47, 0.56], [0.42, 0.47]],
  [[0.57, 0.12], [0.75, 0.06], [0.92, 0.1], [0.96, 0.2], [0.88, 0.3], [0.84, 0.42], [0.77, 0.47], [0.72, 0.42], [0.68, 0.48], [0.64, 0.38], [0.6, 0.36], [0.57, 0.28]],
  [[0.8, 0.62], [0.9, 0.6], [0.94, 0.7], [0.9, 0.78], [0.82, 0.76]],
  [[0.45, 0.17], [0.47, 0.15], [0.475, 0.21], [0.455, 0.22]],
];
export function drawWorld(g, w, h) {
  for (const poly of WORLD) { g.beginPath(); poly.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h))); g.closePath(); g.fill(); }
}

// ---------------- CRT presentation ----------------
function scanlines(W, H) {
  return cached(`crt-scan:${W}x${H}`, () => {
    const c = makeCanvas(4, H), g = c.getContext('2d');
    for (let y = 0; y < H; y += 4) { g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, y + 2, 4, 2); g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, y + 1, 4, 1); }
    return c;
  });
}
function bezel(W, H) {
  return cached(`crt-bezel:${W}x${H}`, () => {
    const c = makeCanvas(W, H), g = c.getContext('2d');
    // dark plastic frame with rounded glass opening
    g.fillStyle = '#050605'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'destination-out';
    const m = 26, r = 90;
    g.beginPath(); g.moveTo(m + r, m); g.arcTo(W - m, m, W - m, H - m, r); g.arcTo(W - m, H - m, m, H - m, r); g.arcTo(m, H - m, m, m, r); g.arcTo(m, m, W - m, m, r); g.closePath(); g.fill();
    g.globalCompositeOperation = 'source-over';
    // glass vignette + corner darkening
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.5)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    // faint glass reflection (top-left)
    const rf = g.createLinearGradient(0, 0, W * 0.6, H * 0.35);
    rf.addColorStop(0, 'rgba(200,255,220,0.06)'); rf.addColorStop(0.5, 'rgba(200,255,220,0.015)'); rf.addColorStop(1, 'rgba(200,255,220,0)');
    g.fillStyle = rf; g.beginPath(); g.ellipse(W * 0.3, H * 0.16, W * 0.42, H * 0.12, -0.25, 0, Math.PI * 2); g.fill();
    return c;
  });
}
function backGlow(W, H) {
  return cached(`crt-bg:${W}x${H}`, () => {
    const c = makeCanvas(W / 8, H / 8), g = c.getContext('2d');
    const r = g.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.height * 0.6);
    r.addColorStop(0, '#0a2312'); r.addColorStop(1, '#020604');
    g.fillStyle = r; g.fillRect(0, 0, c.width, c.height); return c;
  });
}
/**
 * Show the phosphor screen on the output layer as a CRT.
 * opts: curve (0..0.1), bloom (0..1), flicker amount, glitch (0..1, slice tearing), power (1 = on, 0 = off/collapsed),
 * band (rolling refresh band), jitter (px).
 */
export function present(ctx, t, { curve = 0.04, bloom = 0.6, flicker = 1, glitch = 0, power = 1, band = true, seed = 0 } = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height, src = S.c;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(backGlow(W, H), 0, 0, W, H);
  const fl = 1 - flicker * (0.035 + 0.035 * noise.n2(t * 9, 3) + (hrand(Math.floor(t * 24), 7) < 0.04 ? 0.08 : 0));
  // power-off: collapse vertically then horizontally
  let sy = 1, sx = 1;
  if (power < 1) { sy = Math.max(0.004, clamp((power - 0.25) / 0.75)); sx = power < 0.25 ? Math.max(0.01, power / 0.25) : 1; }
  ctx.translate(W / 2, H / 2); ctx.scale(sx, sy); ctx.translate(-W / 2, -H / 2);
  // bloom: tiny copy stretched (the upscale is the blur)
  const sm = cached('crt-small', () => makeCanvas(SW / 6, SH / 6)), sg = sm.getContext('2d');
  sg.clearRect(0, 0, sm.width, sm.height); sg.drawImage(src, 0, 0, sm.width, sm.height);
  ctx.globalAlpha = bloom * fl; ctx.imageSmoothingEnabled = true;
  ctx.drawImage(sm, -4, -4, W + 8, H + 8);
  ctx.globalAlpha = bloom * 0.3 * fl; ctx.drawImage(sm, -24, -18, W + 48, H + 36);
  // sharp layer through barrel curvature (strips)
  ctx.globalAlpha = fl;
  const N = 48, sh = SH / N;
  for (let i = 0; i < N; i++) {
    const v = (i + 0.5) / N * 2 - 1;
    const pinch = 1 - curve * v * v, w = W * pinch;
    let off = 0;
    if (glitch > 0 && hrand(i, Math.floor(t * 30), seed) < glitch * 0.5) off = (hrand(i, Math.floor(t * 30), 9) - 0.5) * 140 * glitch;
    off += noise.n2(i * 0.3, t * 4) * 1.2;
    const y0 = (H / 2) + (v - 1 / N) * (H / 2) * (1 - curve * 0.35 * v * v), y1 = (H / 2) + (v + 1 / N) * (H / 2) * (1 - curve * 0.35 * (v + 2 / N) * (v + 2 / N));
    ctx.drawImage(src, 0, i * sh, SW, sh, (W - w) / 2 + off, y0, w, Math.max(1, y1 - y0) + 0.6);
  }
  ctx.globalAlpha = 1;
  // rolling refresh band
  if (band) { const by = ((t * 0.35) % 1.3 - 0.15) * H; const gr = ctx.createLinearGradient(0, by - 90, 0, by + 90); gr.addColorStop(0, 'rgba(120,255,160,0)'); gr.addColorStop(0.5, 'rgba(120,255,160,0.045)'); gr.addColorStop(1, 'rgba(120,255,160,0)'); ctx.fillStyle = gr; ctx.fillRect(0, by - 90, W, 180); }
  if (power < 0.3) { ctx.fillStyle = `rgba(220,255,230,${clamp(1 - power / 0.3) * 0.9})`; ctx.fillRect(0, H / 2 - 6, W, 12); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(scanlines(W, H), 0, 0, W, H);
  ctx.drawImage(bezel(W, H), 0, 0);
  if (power < 0.25) { const d = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 60); d.addColorStop(0, `rgba(230,255,235,${power * 3})`); d.addColorStop(1, 'rgba(230,255,235,0)'); ctx.fillStyle = d; ctx.fillRect(W / 2 - 60, H / 2 - 60, 120, 120); }
  ctx.restore();
}
