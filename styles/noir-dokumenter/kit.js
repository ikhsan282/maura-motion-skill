// Maura Motion style kit: NOIR DOKUMENTER (redacted case file).
// Sepia/black-and-white archive: typewritten paper, black redaction bars that slide off to reveal facts,
// distressed red rubber stamps, engraving-style illustrations (line hatching, waterlined maps), a map with
// pins and red string, heavy grain, gate weave, flicker and a hard vignette.
import { clamp, lerp, ease, hrand, mulberry32, noise, TAU, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';
export { clamp, lerp, ease, TAU };

export const PAL = {
  paper: '#d8c9a8', paper2: '#cdb994', ink: '#1d1915', inkSoft: 'rgba(29,25,21,.55)', red: '#9b1d1a', redInk: '#b0221c',
  black: '#0b0a09', film: '#14110d', sepiaHi: '#efe2c4',
};
export const pr = (t, a, b, fn = ease.inOutCubic) => fn(clamp((t - a) / Math.max(1e-6, b - a)));

// ------------------------------------------------------------------ film furniture
/** Gate weave offset (px) for frame-accurate jitter, changes every frame at 24 fps. */
export function weave(t, amp = 2.2) { const f = Math.floor(t * 24); return [(hrand(f, 11) - 0.5) * amp * 2 + noise.n2(t * 0.7, 3) * amp, (hrand(f, 12) - 0.5) * amp * 1.4]; }
/** Projector flicker + vignette + scratches + grain. Call last, on a top layer. */
export function filmLook(ctx, t, AM, { grain = 0.13, flick = 1, scratches = 1 } = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const f = Math.floor(t * 24);
  const fl = (hrand(f, 5) * 0.06 + Math.max(0, Math.sin(t * 1.3) * 0.02)) * flick;
  ctx.fillStyle = `rgba(10,8,6,${fl})`; ctx.fillRect(0, 0, 1080, 1920);
  if (scratches) {
    ctx.strokeStyle = 'rgba(240,230,210,.25)'; ctx.lineWidth = 1.5;
    for (let k = 0; k < 2; k++) if (hrand(f, 20 + k) < 0.35) { const x = hrand(f, 30 + k) * 1080; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (hrand(f, 40 + k) - 0.5) * 20, 1920); ctx.stroke(); }
    if (hrand(f, 50) < 0.25) { ctx.fillStyle = 'rgba(20,16,12,.5)'; ctx.beginPath(); ctx.arc(hrand(f, 51) * 1080, hrand(f, 52) * 1920, 2 + hrand(f, 53) * 5, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
  AM.lib.vignette(ctx, { strength: 0.75, inner: 0.25, outer: 0.9, color: '8,6,4' });
  AM.lib.grain(ctx, t, { amount: grain, fps: 24 });
}

// ------------------------------------------------------------------ paper
/** Aged paper sheet (cached) with stains, fold line and punched holes. */
export function paperSheet(w, h, seed = 1) {
  return cached(`nd-paper:${w}:${h}:${seed}`, () => {
    const c = makeCanvas(w, h), g = c.getContext('2d'), r = mulberry32(seed);
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#ddd0b0'); gr.addColorStop(1, '#c9b48d');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, rad = 40 + r() * 220; const s = g.createRadialGradient(x, y, 0, x, y, rad); s.addColorStop(0, `rgba(110,80,40,${0.04 + r() * 0.08})`); s.addColorStop(1, 'rgba(110,80,40,0)'); g.fillStyle = s; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    // coffee ring
    g.strokeStyle = 'rgba(110,70,30,.18)'; g.lineWidth = 6; g.beginPath(); g.arc(w * 0.78, h * 0.86, 90, 0.3, 5.6); g.stroke();
    for (let i = 0; i < 7000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,40,20,.07)' : 'rgba(255,250,235,.1)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
    g.strokeStyle = 'rgba(80,60,30,.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(w, h * 0.5 + 6); g.stroke();
    const edge = g.createLinearGradient(0, 0, 0, h); edge.addColorStop(0, 'rgba(90,60,30,.25)'); edge.addColorStop(0.06, 'rgba(90,60,30,0)'); edge.addColorStop(0.94, 'rgba(90,60,30,0)'); edge.addColorStop(1, 'rgba(90,60,30,.25)'); g.fillStyle = edge; g.fillRect(0, 0, w, h);
    return c;
  });
}
/** Draw a sheet of paper with a drop shadow at (x,y) rotated rot. */
export function paper(ctx, x, y, w, h, { rot = 0, seed = 1 } = {}) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(-w / 2 + 14, -h / 2 + 18, w, h);
  ctx.drawImage(paperSheet(w, h, seed), -w / 2, -h / 2); ctx.restore();
}
/** Dark desk background (cached). */
export function desk(ctx) {
  const c = cached('nd-desk', () => { const cv = makeCanvas(270, 480), g = cv.getContext('2d'); const gr = g.createRadialGradient(135, 200, 20, 135, 240, 320); gr.addColorStop(0, '#3a3128'); gr.addColorStop(1, '#0e0c0a'); g.fillStyle = gr; g.fillRect(0, 0, 270, 480); return cv; });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c, 0, 0, 1080, 1920); ctx.restore();
}

// ------------------------------------------------------------------ typewriter, redaction, stamps
/** Typewritten text revealed character by character (p 0..1). Slight per-character jitter and ink density. */
export function type(ctx, text, x, y, p, { size = 40, color = PAL.ink, align = 'left', font = 'Special Elite', caret = true } = {}) {
  if (p <= 0) return 0;
  const n = Math.floor(text.length * clamp(p) + 0.0001);
  ctx.save(); ctx.font = `400 ${size}px '${font}'`; ctx.textBaseline = 'alphabetic';
  let cx = x; if (align === 'center') cx = x - ctx.measureText(text).width / 2;
  for (let i = 0; i < n; i++) {
    const ch = text[i];
    ctx.fillStyle = color; ctx.globalAlpha = 0.78 + hrand(i, 7) * 0.22;
    ctx.fillText(ch, cx + (hrand(i, 1) - 0.5) * 1.2, y + (hrand(i, 2) - 0.5) * 2);
    cx += ctx.measureText(ch).width;
  }
  if (caret && p < 1) { ctx.globalAlpha = 0.8; ctx.fillRect(cx + 2, y - size * 0.75, size * 0.5, size * 0.9); }
  ctx.restore();
  return cx;
}
/** Measure typewriter text width. */
export function textW(ctx, text, size = 40, font = 'Special Elite') { ctx.save(); ctx.font = `400 ${size}px '${font}'`; const w = ctx.measureText(text).width; ctx.restore(); return w; }
/** Black redaction bar over [x, y-h*0.8, w, h]; `off` 0..1 slides it off to the right revealing what's beneath. */
export function redact(ctx, x, y, w, h, off = 0, { rot = 0 } = {}) {
  if (off >= 1) return;
  const e = ease.inCubic(clamp(off));
  ctx.save(); ctx.translate(x + e * (w + 120), y - h * 0.8); ctx.rotate(rot + e * 0.08);
  ctx.globalAlpha = 1 - e * 0.6; ctx.fillStyle = '#0f0d0b';
  ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(w, 0); ctx.lineTo(w + 3, h); ctx.lineTo(-2, h - 1); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/** Distressed rubber stamp (cached art), slams in with scale + shake when p goes 0->1. */
export function stamp(ctx, text, x, y, p, { size = 90, rot = -0.14, color = PAL.redInk, sub = '' } = {}) {
  if (p <= 0) return;
  const art = cached(`nd-stamp:${text}:${size}:${sub}`, () => {
    const c0 = makeCanvas(10, 10).getContext('2d'); c0.font = `400 ${size}px 'Bebas Neue'`; c0.letterSpacing = '6px';
    const tw = c0.measureText(text).width, W = Math.ceil(tw + size * 1.0), H = Math.ceil(size * (sub ? 1.75 : 1.35));
    const c = makeCanvas(W + 20, H + 20), g = c.getContext('2d'); g.translate(10, 10);
    g.strokeStyle = color; g.fillStyle = color; g.lineWidth = size * 0.07; g.strokeRect(4, 4, W - 8, H - 8); g.lineWidth = size * 0.025; g.strokeRect(size * 0.12, size * 0.12, W - size * 0.24, H - size * 0.24);
    g.font = `400 ${size}px 'Bebas Neue'`; g.letterSpacing = '6px'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, sub ? H * 0.4 : H / 2 + size * 0.04);
    if (sub) { g.font = `400 ${size * 0.32}px 'Special Elite'`; g.letterSpacing = '2px'; g.fillText(sub, W / 2, H * 0.78); }
    g.globalCompositeOperation = 'destination-out'; const r = mulberry32(text.length * 7 + size);
    for (let i = 0; i < 900; i++) { g.globalAlpha = 0.4 + r() * 0.6; g.beginPath(); g.arc(r() * W, r() * H, 0.6 + r() * r() * 4, 0, TAU); g.fill(); }
    for (let i = 0; i < 6; i++) { g.globalAlpha = 0.5; g.fillRect(r() * W, r() * H, 20 + r() * 60, 2 + r() * 3); }
    return c;
  });
  const e = clamp(p), s = lerp(1.7, 1, ease.outCubic(clamp(e * 1.4))), shake = e < 0.8 ? 0 : Math.exp(-(e - 0.8) * 20) * 4;
  ctx.save(); ctx.translate(x + shake, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= clamp(e * 2) * 0.9;
  ctx.drawImage(art, -art.width / 2, -art.height / 2); ctx.restore();
}
/** Hand-drawn red-ink circle around a box (draws on). */
export function circleMark(ctx, cx, cy, rx, ry, p, { color = PAL.redInk, w = 5 } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath();
  const N = 50, end = Math.floor(N * 1.15 * clamp(p));
  for (let i = 0; i <= end; i++) { const a = -2.2 + (i / N) * TAU, wob = 1 + Math.sin(i * 0.7) * 0.03 + (i / N) * 0.06; const x = cx + Math.cos(a) * rx * wob, y = cy + Math.sin(a) * ry * wob; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke(); ctx.restore();
}
/** Paperclip. */
export function clip(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#8a8378'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(0, -40); ctx.arc(14, -40, 14, Math.PI, 0); ctx.lineTo(28, 50); ctx.arc(18, 50, 10, 0, Math.PI); ctx.lineTo(8, -20); ctx.stroke(); ctx.restore();
}

// ------------------------------------------------------------------ engravings (cached line art)
function hatchPoly(g, poly, gap, ang, lw = 1.3, color = PAL.ink) {
  g.save(); g.beginPath(); poly.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const D = Math.hypot(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, ca = Math.cos(ang), sa = Math.sin(ang);
  g.strokeStyle = color; g.lineWidth = lw; g.beginPath();
  for (let o = -D; o < D; o += gap) { const px = cx - sa * o, py = cy + ca * o; g.moveTo(px - ca * D, py - sa * D); g.lineTo(px + ca * D, py + sa * D); }
  g.stroke(); g.restore();
}
/** Engraved erupting volcano (island in the sea). Returns cached canvas 900x900. */
export function volcanoArt(kind = 'big') {
  return cached('nd-volc:' + kind, () => {
    const W = 900, H = 900, c = makeCanvas(W, H), g = c.getContext('2d'), r = mulberry32(kind === 'big' ? 3 : 9);
    g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
    const sea = kind === 'big' ? 640 : 700;
    // sky hatching (light)
    hatchPoly(g, [[0, 0], [W, 0], [W, sea], [0, sea]], 9, 0, 1, 'rgba(29,25,21,.35)');
    // plume: billows outlined + cross-hatched on the shaded side
    const top = kind === 'big' ? 40 : 330, base = kind === 'big' ? 390 : 560, px = W / 2;
    for (let i = 0; i < (kind === 'big' ? 26 : 9); i++) {
      const u = r(), y = lerp(base, top, Math.pow(u, 0.8)), spread = lerp(60, kind === 'big' ? 330 : 120, Math.pow(1 - (y - top) / (base - top), 0.4) * (kind === 'big' ? 1 : 0.6)), x = px + (r() - 0.5) * spread * 1.6, rad = lerp(40, kind === 'big' ? 120 : 55, r());
      g.fillStyle = PAL.paper; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill();
      g.save(); g.beginPath(); g.arc(x, y, rad, 0, TAU); g.clip(); hatchPoly(g, [[x, y - rad], [x + rad, y - rad], [x + rad, y + rad], [x - rad, y + rad]], 6, 0.5, 1.1); if (r() < 0.6) hatchPoly(g, [[x + rad * 0.2, y - rad], [x + rad, y - rad], [x + rad, y + rad], [x + rad * 0.2, y + rad]], 6, -0.6, 1.1); g.restore();
      g.strokeStyle = PAL.ink; g.lineWidth = 2.2; g.beginPath(); g.arc(x, y, rad, Math.PI * 0.9, Math.PI * 2.3); g.stroke();
    }
    // cone
    const cone = kind === 'big' ? [[150, sea], [380, 400], [520, 400], [760, sea]] : [[330, sea], [430, 560], [470, 560], [580, sea]];
    g.fillStyle = PAL.paper; g.beginPath(); cone.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.fill();
    hatchPoly(g, cone, 7, 1.2, 1.3); hatchPoly(g, [cone[2], cone[3], [cone[2][0], sea]], 5, -0.5, 1.3);
    g.strokeStyle = PAL.ink; g.lineWidth = 3; g.beginPath(); cone.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    // lava streaks
    if (kind === 'big') { g.strokeStyle = PAL.ink; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(400 + i * 20, 405); g.quadraticCurveTo(380 + i * 30, 500, 300 + i * 60, sea - 5); g.stroke(); } }
    // sea: horizontal engraved lines, denser towards the bottom
    g.strokeStyle = PAL.ink; for (let y = sea + 4, k = 0; y < H; y += lerp(14, 5, (y - sea) / (H - sea)), k++) { g.lineWidth = 1.2; g.beginPath(); for (let x = 0; x <= W; x += 30) g.lineTo(x, y + Math.sin(x * 0.05 + k) * 2); g.stroke(); }
    g.lineWidth = 4; g.strokeRect(10, 10, W - 20, H - 20);
    return c;
  });
}
/** Engraved tsunami wave over a coastal village (cached 900x700). */
export function waveArt() {
  return cached('nd-wave', () => {
    const W = 900, H = 700, c = makeCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
    hatchPoly(g, [[0, 0], [W, 0], [W, H], [0, H]], 10, 0, 1, 'rgba(29,25,21,.3)');
    // the wave: a big curl from the left
    const curl = [[0, 120], [180, 70], [380, 110], [520, 220], [560, 330], [500, 360], [470, 300], [420, 280], [440, 360], [520, 470], [700, 560], [W, 600], [W, H], [0, H]];
    g.fillStyle = PAL.paper; g.beginPath(); curl.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
    hatchPoly(g, curl, 6, 0.9, 1.3); hatchPoly(g, [[0, 120], [180, 70], [380, 110], [420, 280], [440, 360], [300, 420], [0, 400]], 5, -0.4, 1.2);
    g.strokeStyle = PAL.ink; g.lineWidth = 3.5; g.beginPath(); curl.slice(0, 11).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    // foam crest: small loops
    g.lineWidth = 2; for (let i = 0; i < 26; i++) { const u = i / 25, x = lerp(20, 540, u), y = lerp(110, 240, u * u) - Math.sin(u * 3) * 40; g.beginPath(); g.arc(x, y, 8 + (i % 3) * 4, 0, TAU); g.stroke(); }
    // shore, huts and palms on the right
    g.fillStyle = PAL.paper; g.beginPath(); g.moveTo(560, 560); g.lineTo(W, 520); g.lineTo(W, 600); g.lineTo(560, 600); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 2.5; g.beginPath(); g.moveTo(560, 560); g.lineTo(W, 520); g.stroke();
    for (const [hx, hy] of [[640, 548], [730, 538], [810, 528]]) { g.fillStyle = PAL.paper; g.beginPath(); g.moveTo(hx - 34, hy); g.lineTo(hx, hy - 40); g.lineTo(hx + 34, hy); g.closePath(); g.fill(); g.stroke(); hatchPoly(g, [[hx - 34, hy], [hx, hy - 40], [hx + 34, hy]], 5, 0.8, 1); g.strokeRect(hx - 22, hy, 44, 26); }
    for (const [tx, ty, s] of [[600, 556, 1], [860, 524, 1.2]]) { g.lineWidth = 3; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + 10 * s, ty - 80 * s, tx + 4 * s, ty - 130 * s); g.stroke(); for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.5; g.beginPath(); g.moveTo(tx + 4 * s, ty - 130 * s); g.quadraticCurveTo(tx + 4 * s + Math.cos(a) * 40 * s, ty - 150 * s + Math.sin(a) * 10 * s, tx + 4 * s + Math.cos(a) * 70 * s, ty - 110 * s + Math.sin(a) * 30 * s); g.stroke(); } }
    g.lineWidth = 4; g.strokeRect(10, 10, W - 20, H - 20);
    return c;
  });
}
/** Antique map of the Indian Ocean (cached 1000x900), waterlined coasts. proj(lon,lat) -> [x,y] in map px. */
export const MAP = { W: 1000, H: 900, proj: (lon, lat) => [40 + (lon - 30) * 10.6, 520 - lat * 10.6] };
const LANDS = {
  africa: [[30, 31], [33, 31], [35, 27], [39, 21], [43, 12], [51, 11.5], [51, 10], [47, 5], [42, -1], [39.5, -5], [40.5, -10.5], [40.5, -15], [35, -22], [33, -26], [30, -31], [30, 31]],
  arabia: [[35, 30], [39, 21], [43, 13], [45, 12.8], [52, 15.5], [56, 18], [59.5, 22.5], [56.5, 26], [51, 24], [48, 29.5], [44, 32], [35, 32]],
  india: [[62, 25], [67, 24.5], [69, 22], [72.5, 21], [73, 16], [75, 12], [77.5, 8], [80, 13], [80.3, 16], [84, 18.5], [87, 21.5], [90, 22], [92, 22.5], [92, 26], [62, 26]],
  lanka: [[80, 9.8], [81.8, 7.6], [81.2, 6.2], [80.1, 6.4], [79.8, 8]],
  indochina: [[92, 22.5], [94.5, 19], [94.3, 16], [97.6, 16.5], [98.4, 12], [98.3, 8.5], [100.3, 6], [101, 2.8], [103, 1.4], [104.2, 1.4], [103.4, 4], [102, 6.5], [100.4, 8], [100.4, 13.6], [103, 10.5], [105, 8.8], [107, 10.5], [109, 12], [109, 26], [92, 26]],
  sumatra: [[95.3, 5.6], [97.5, 5.2], [100.4, 2.5], [103.8, -1], [106, -3], [106, -5.9], [104.6, -5.9], [102, -4], [100.3, -1.5], [98.6, 1.7], [97, 3.5]],
  java: [[105.2, -6], [106.6, -6], [108.3, -6.3], [110.9, -6.4], [114.5, -7.7], [114.5, -8.7], [111, -8.3], [108, -7.8], [106.4, -7.4], [105.3, -6.8]],
  borneo: [[109, 1.8], [109.6, -1], [110.2, -2.9], [113, -3.4], [116.4, -4], [116.6, -1.5], [118, 1], [119, 5], [117, 7], [115.5, 5], [113, 3.2], [111.5, 2.7]],
  madagascar: [[49.3, -12], [50.4, -15.4], [49.5, -17.5], [47.2, -24.8], [45.2, -25.5], [43.7, -23], [43.5, -21], [44.4, -16.4], [46.4, -15.7], [47.9, -13.6]],
  australia: [[113.5, -22], [114.2, -26.5], [115, -33.5], [117, -35], [118, -35.2], [121, -33.8], [124, -33], [129, -31.6], [132, -32], [135, -34.5], [140, -38], [140, -20], [136, -12], [130, -11.5], [127, -14], [124, -16.4], [121, -19.5], [116.5, -20.7]],
};
export function mapArt() {
  return cached('nd-map', () => {
    const { W, H, proj } = MAP, c = makeCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = PAL.paper; g.fillRect(0, 0, W, H);
    const r = mulberry32(2); for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(60,40,20,.06)'; g.fillRect(r() * W, r() * H, 1.5, 1.5); }
    // graticule
    g.strokeStyle = 'rgba(29,25,21,.22)'; g.lineWidth = 1; g.setLineDash([3, 6]);
    for (let lon = 30; lon <= 120; lon += 15) { const [x] = proj(lon, 0); g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let lat = -30; lat <= 45; lat += 15) { const [, y] = proj(0, lat); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.setLineDash([]);
    const pathOf = (pts) => { g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = proj(lo, la); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
    // waterlining: concentric strokes outside the coast
    for (const [w, col] of [[30, 'rgba(29,25,21,.16)'], [24, PAL.paper], [18, 'rgba(29,25,21,.22)'], [12, PAL.paper], [7, 'rgba(29,25,21,.3)'], [3, PAL.paper]]) { g.lineJoin = 'round'; g.lineWidth = w; g.strokeStyle = col; for (const k in LANDS) { pathOf(LANDS[k]); g.stroke(); } }
    for (const k in LANDS) { pathOf(LANDS[k]); g.fillStyle = '#cfbd98'; g.fill(); g.save(); g.clip(); g.strokeStyle = 'rgba(29,25,21,.28)'; g.lineWidth = 1; g.beginPath(); for (let o = -W; o < W * 2; o += 7) { g.moveTo(o, 0); g.lineTo(o - H, H); } g.stroke(); g.restore(); g.strokeStyle = PAL.ink; g.lineWidth = 2.2; pathOf(LANDS[k]); g.stroke(); }
    g.fillStyle = PAL.ink; g.font = "400 30px 'Special Elite'"; g.textAlign = 'center'; g.letterSpacing = '8px';
    const [ox, oy] = proj(78, -12); g.fillText('SAMUDRA HINDIA', ox, oy); g.letterSpacing = '0px';
    // compass rose
    const [rx, ry] = proj(105, -30); g.strokeStyle = PAL.ink; g.lineWidth = 2; g.beginPath(); g.arc(rx, ry, 46, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(rx, ry - 70); g.lineTo(rx + 10, ry); g.lineTo(rx, ry + 70); g.lineTo(rx - 10, ry); g.closePath(); g.fill(); g.font = "400 26px 'Special Elite'"; g.fillText('U', rx, ry - 78);
    g.lineWidth = 5; g.strokeRect(8, 8, W - 16, H - 16); g.lineWidth = 1.5; g.strokeRect(20, 20, W - 40, H - 40);
    return c;
  });
}
/** Red push pin. */
export function pin(ctx, x, y, p = 1) {
  if (p <= 0) return;
  const d = (1 - ease.outBack(clamp(p), 2)) * -60;
  ctx.save(); ctx.translate(x, y + d); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(8, 10 - d, 12, 5, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -26); ctx.stroke();
  const g = ctx.createRadialGradient(-4, -32, 2, 0, -28, 14); g.addColorStop(0, '#e85a4a'); g.addColorStop(1, '#7a1410');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -30, 13, 0, TAU); ctx.fill(); ctx.restore();
}
/** Red string between two points with sag, drawing on (p). */
export function string(ctx, x0, y0, x1, y1, p, { sag = 40 } = {}) {
  if (p <= 0) return;
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag;
  ctx.save(); ctx.strokeStyle = '#b3201a'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0);
  const N = 40; for (let i = 1; i <= N * clamp(p); i++) { const u = i / N; ctx.lineTo((1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1); }
  ctx.stroke(); ctx.restore();
}
/** Engraved globe with meridians; a pressure ring spreading from (lon0,lat0) with angular radius th (0..PI). */
export function globe(ctx, cx, cy, R, rot, rings = [], { lon0 = 105, lat0 = -6 } = {}) {
  ctx.save();
  ctx.fillStyle = PAL.paper; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  ctx.strokeStyle = 'rgba(29,25,21,.5)'; ctx.lineWidth = 1.2; ctx.beginPath();
  for (let k = 0; k < 18; k++) { const a = ((k / 18) * Math.PI + rot) % Math.PI; ctx.ellipse(cx, cy, Math.abs(Math.cos(a)) * R, R, 0, 0, TAU); }
  for (let k = 1; k < 9; k++) { const y = cy - R + (k / 9) * 2 * R, w = Math.sqrt(Math.max(0, R * R - (y - cy) ** 2)); ctx.moveTo(cx - w, y); ctx.lineTo(cx + w, y); }
  ctx.stroke();
  // shading: hatch the night side
  ctx.strokeStyle = 'rgba(29,25,21,.55)'; ctx.lineWidth = 1.3; ctx.beginPath();
  for (let o = -R; o < R * 2; o += 7) { ctx.moveTo(cx + R * 0.25 + o * 0.3, cy - R); ctx.lineTo(cx + R * 0.25 + o * 0.3 + R * 0.6, cy + R); }
  ctx.save(); ctx.beginPath(); ctx.arc(cx + R * 0.55, cy, R, 0, TAU); ctx.clip(); ctx.stroke(); ctx.restore();
  // rings on the sphere (orthographic, centre view lon = rot)
  const toV = (lon, lat) => [Math.cos(lat) * Math.sin(lon), -Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
  const c0 = toV((lon0 * Math.PI) / 180 - rot, (lat0 * Math.PI) / 180);
  // basis around c0
  const up = Math.abs(c0[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const nrm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
  const e1 = nrm(cross(c0, up)), e2 = cross(c0, e1);
  for (const { th, a } of rings) {
    ctx.strokeStyle = `rgba(155,29,26,${a})`; ctx.lineWidth = 5; ctx.beginPath(); let pen = false;
    for (let i = 0; i <= 120; i++) { const ph = (i / 120) * TAU; const v = [0, 1, 2].map((k) => c0[k] * Math.cos(th) + (e1[k] * Math.cos(ph) + e2[k] * Math.sin(ph)) * Math.sin(th)); if (v[2] < 0) { pen = false; continue; } const x = cx + v[0] * R, y = cy + v[1] * R; if (!pen) { ctx.moveTo(x, y); pen = true; } else ctx.lineTo(x, y); }
    ctx.stroke();
  }
  ctx.restore();
  if (c0[2] > 0) { ctx.fillStyle = PAL.redInk; ctx.beginPath(); ctx.arc(cx + c0[0] * R, cy + c0[1] * R, 9, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.restore();
}
/** Barograph strip: a pen trace with pressure spikes at given positions (0..1), drawn on to p. */
export function barograph(ctx, x, y, w, h, p, spikes = []) {
  ctx.save(); ctx.fillStyle = '#e6dcc4'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(155,29,26,.35)'; ctx.lineWidth = 1;
  for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x, y + (k * h) / 6); ctx.lineTo(x + w, y + (k * h) / 6); ctx.stroke(); }
  for (let k = 1; k < 12; k++) { ctx.beginPath(); ctx.moveTo(x + (k * w) / 12, y); ctx.lineTo(x + (k * w) / 12, y + h); ctx.stroke(); }
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2.5; ctx.beginPath();
  const N = 300, end = Math.floor(N * clamp(p));
  for (let i = 0; i <= end; i++) { const u = i / N; let v = Math.sin(u * 40) * 0.04 + noise.n2(u * 30, 1) * 0.05; for (const s of spikes) { const d = (u - s.at) / 0.008; v += Math.exp(-d * d) * s.amp * Math.sin(d * 2.5); } const X = x + u * w, Y = y + h / 2 - v * h; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
  ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#333'; ctx.strokeRect(x, y, w, h); ctx.restore();
}
