// Maura Motion style kit: CAT AIR (watercolour, moving).
// Soft transparent washes on cold-press paper: colour bleeds past the drawing, pools darker at the edge of each
// wash, granulates in the paper tooth, and leaves white paper for light. Drawn FLAT in light, mid values (dark
// only where it counts) in design px (1080x1920), then painted by the watercolor paint pass.
// Signature moves: mist and smoke that bloom and drift, washes that "wet in" when a shot starts (a soft bloom from
// paper white), sunrise glow behind volcanoes, a sepia pencil contour around figures.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU, mixHex } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const LOOK = {
  base: 'watercolor', wash: 0.95, bleed: 0.85, paper: 1.0, paperColor: '#f7f2e7', grain: 0.22, boil: 0.45,
  outline: 0.12, ink: '#5a4a48', saturation: 1.12, contrast: 1.0, warmth: 0.08, vignette: 0.1, bloom: 0.12,
};
export const PAL = {
  paper: '#f7f2e7', skyTop: '#9db9dc', skyLow: '#f6d7b8', dawn: '#f4b48a', rose: '#e8a3a6', sand: '#c9b49a', sandDark: '#9c8670',
  ash: '#8f8a90', ridge: '#6f7f9a', ridgeFar: '#a9b6cc', green: '#7fa07a', batok: '#7a8a6a', lava: '#e0603a', ember: '#f2a04a',
  ink: '#4a3e44', cream: '#fffaf0', indigo: '#3e4a72',
};

export async function painter(AM, { scale = 0.55, overrides = {} } = {}) {
  let q = {}; try { const s = new URLSearchParams(location.search).get('lk'); if (s) q = JSON.parse(s); } catch (e) { /* none */ }
  return AM.painter({ ...LOOK, ...overrides, ...q }, { scale });
}
export function view(P, { x = 540, y = 960, z = 1, rot = 0 } = {}) {
  const s = P.W / 1080, g = P.g;
  g.setTransform(s, 0, 0, s, 0, 0);
  g.translate(540, 960); g.rotate(rot); g.scale(z, z); g.translate(-x, -y);
  return g;
}
export const mix = (a, b, t) => mixHex(a, b, t);
const lit = (c, k = 0.25) => mixHex(c, '#fffdf6', k);
const dark = (c, k = 0.45) => mixHex(c, '#3a3450', k);
function shadeGrad(g, x0, x1, base, light, amt = 1) {
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  const a = lit(base, 0.25 * amt), b = base, c = dark(base, 0.3 * amt);
  if (light < 0) { gr.addColorStop(0, a); gr.addColorStop(0.45, b); gr.addColorStop(1, c); }
  else { gr.addColorStop(0, c); gr.addColorStop(0.55, b); gr.addColorStop(1, a); }
  return gr;
}
function vGrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c)); return gr; }
export function rgbaHex(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
export function radial(g, x, y, r, col, a = 1) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgbaHex(col, a)); gr.addColorStop(1, rgbaHex(col, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
export function poly(g, pts, fill) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } }

// ---------------- sky and light ----------------
/** Dawn sky wash: blue top melting into rose and peach, leaving paper white near the sun. */
export function dawnSky(g, { x0 = -500, x1 = 1580, y0 = -400, y1 = 1100, top = PAL.skyTop, low = PAL.skyLow, sun = [760, 900], glow = 1, night = 0 } = {}) {
  const t1 = mixHex(top, '#2e3a66', night), l1 = mixHex(low, '#8a6a8a', night);
  g.fillStyle = vGrad(g, y0, y1, [t1, mixHex(t1, l1, 0.55), l1, lit(l1, 0.5)]); g.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (sun) { radial(g, sun[0], sun[1], 520, '#fff6e0', 0.85 * glow); radial(g, sun[0], sun[1], 160, '#ffffff', 0.9 * glow); }
}
/** Streaky watercolour clouds: horizontal soft bands. */
export function streaks(g, t, { y = 300, n = 5, color = PAL.rose, a = 0.5, seed = 2, x0 = -500, x1 = 1580 } = {}) {
  const r = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const cy = y + (r() - 0.5) * 260, w = 300 + r() * 500, cx = x0 + ((r() * (x1 - x0) + t * 10 * (0.4 + r())) % (x1 - x0 + 400)) - 200;
    g.save(); g.translate(cx, cy); g.scale(1, 0.12 + r() * 0.08); radial(g, 0, 0, w, color, a); g.restore();
  }
}

// ---------------- the Tengger caldera ----------------
/** Far ridge of the caldera wall (and Semeru smoking far behind if smoke). */
export function calderaWall(g, t, { y = 900, color = PAL.ridgeFar, x0 = -500, x1 = 1580, amp = 120, seed = 4 } = {}) {
  g.fillStyle = color; g.beginPath(); g.moveTo(x0, y + 600);
  for (let x = x0; x <= x1; x += 20) g.lineTo(x, y - amp * (0.5 + 0.5 * noise.n2(x * 0.004, seed)) - 30 * Math.abs(Math.sin(x * 0.02)));
  g.lineTo(x1, y + 600); g.closePath(); g.fill();
}
/** Mount Semeru: a tall far cone that puffs smoke. */
export function semeru(g, t, x, y, { s = 1, color = '#8ea0bc', smoke = 1 } = {}) {
  g.fillStyle = color; poly(g, [[x - 520 * s, y], [x - 40 * s, y - 520 * s], [x + 40 * s, y - 520 * s], [x + 520 * s, y]]); g.fill();
  g.fillStyle = lit(color, 0.3); poly(g, [[x - 40 * s, y - 520 * s], [x - 520 * s, y], [x - 240 * s, y]]); g.fill();
  if (smoke) plume(g, t, x, y - 530 * s, { s: 0.45 * s, color: '#d8d4d8', a: 0.75 * smoke, drift: 30 });
}
/** Gunung Batok: the ribbed, extinct cone (vertical grooves are its signature). */
export function batok(g, x, y, { s = 1, color = PAL.batok, light = 1 } = {}) {
  const W = 360 * s, H = 380 * s;
  g.fillStyle = vGrad(g, y - H, y, [lit(color, 0.15), color, mixHex(color, PAL.sand, 0.4)]);
  g.beginPath(); g.moveTo(x - W, y); g.bezierCurveTo(x - W * 0.6, y - H * 0.6, x - W * 0.25, y - H, x, y - H); g.bezierCurveTo(x + W * 0.25, y - H, x + W * 0.6, y - H * 0.6, x + W, y); g.closePath(); g.fill();
  g.save(); g.clip();
  for (let i = -9; i <= 9; i++) { // grooves
    const bx = x + i * W * 0.11;
    g.strokeStyle = rgbaHex(dark(color, 0.35), 0.55); g.lineWidth = 9 * s;
    g.beginPath(); g.moveTo(x + i * W * 0.02, y - H); g.quadraticCurveTo(bx * 0.9 + x * 0.1, y - H * 0.4, x + i * W * 0.13, y + 10); g.stroke();
  }
  g.fillStyle = rgbaHex(light > 0 ? '#fff4e0' : '#3a3450', 0.25); g.fillRect(light > 0 ? x : x - W, y - H, W, H);
  g.restore();
}
/** Gunung Bromo: a broad truncated cone with a crater rim, ash-grey, venting smoke. erupt 0..1 */
export function bromo(g, t, x, y, { s = 1, color = PAL.ash, smoke = 1, erupt = 0 } = {}) {
  const W = 520 * s, H = 300 * s, rimW = 260 * s;
  g.fillStyle = vGrad(g, y - H, y, [lit(color, 0.1), color, mixHex(color, PAL.sand, 0.5)]);
  poly(g, [[x - W, y], [x - rimW, y - H], [x + rimW, y - H * 0.94], [x + W, y]]); g.fill();
  g.strokeStyle = rgbaHex(dark(color, 0.3), 0.6); g.lineWidth = 7 * s;
  for (let i = -6; i <= 6; i++) { g.beginPath(); g.moveTo(x + i * rimW / 6, y - H); g.lineTo(x + i * W / 6, y); g.stroke(); }
  g.fillStyle = dark(color, 0.35); g.beginPath(); g.ellipse(x, y - H * 0.97, rimW * 0.95, 26 * s, 0, 0, TAU); g.fill();
  if (erupt > 0) { radial(g, x, y - H, 420 * s * (0.5 + erupt), PAL.ember, 0.7 * erupt); }
  if (smoke > 0 || erupt > 0) plume(g, t * (1 + erupt * 2), x, y - H, { s: s * (0.8 + erupt * 1.6), color: erupt > 0 ? mixHex('#d6ccc8', '#6a5a62', erupt) : '#ece8ea', a: 0.7 + 0.2 * erupt, drift: 40, glow: erupt, n: erupt > 0 ? 16 : 11 });
}
/** Billowing smoke plume of soft round washes rising from (x, y). glow tints the underside orange. */
export function plume(g, t, x, y, { s = 1, color = '#e8e4e6', a = 0.8, drift = 30, glow = 0, n = 11, height = 820 } = {}) {
  const r = mulberry32(7);
  for (let i = 0; i < n; i++) {
    const u = ((i / n) + t * 0.05) % 1, rr = (70 + u * 170) * s, k = Math.sin(Math.min(1, u * 4) * Math.PI / 2);
    const px = x + Math.sin(i * 1.7 + t * 0.4) * 30 * s * u + drift * u * u * 5 * s, py = y - u * height * s;
    const col = glow > 0 ? mixHex(color, PAL.lava, glow * Math.max(0, 1 - u * 1.6) * 0.9) : color;
    const al = a * k * (1 - u * 0.75);
    g.fillStyle = rgbaHex(col, al * 0.8);
    g.beginPath();
    for (let j = 0; j < 4; j++) { const ang = j * 1.6 + i, ox = Math.cos(ang) * rr * 0.55, oy = Math.sin(ang) * rr * 0.35, pr = rr * (0.55 + 0.25 * r()); g.moveTo(px + ox + pr, py + oy); g.arc(px + ox, py + oy, pr, 0, TAU); }
    g.fill();
    g.fillStyle = rgbaHex(lit(col, 0.45), al * 0.45); g.beginPath(); g.arc(px - rr * 0.25, py - rr * 0.3, rr * 0.45, 0, TAU); g.fill();
  }
}
/** The sea of sand (Segara Wedi): a pale floor with wind ripples. */
export function sandSea(g, t, { y = 1100, x0 = -500, x1 = 1580, to = 2600, color = PAL.sand } = {}) {
  g.fillStyle = vGrad(g, y, to, [lit(color, 0.35), color, dark(color, 0.12)]); g.fillRect(x0, y, x1 - x0, to - y);
  g.strokeStyle = rgbaHex(dark(color, 0.25), 0.35); g.lineWidth = 4;
  for (let i = 0; i < 16; i++) { const yy = y + Math.pow(i / 16, 1.6) * (to - y); g.beginPath(); for (let x = x0; x <= x1; x += 40) g.lineTo(x, yy + Math.sin(x * 0.01 + i) * (4 + i)); g.stroke(); }
}
/** Pura Luhur Poten's split gate (candi bentar) in the sand. */
export function gate(g, x, y, s = 1, { color = '#7a5a4a' } = {}) {
  for (const sd of [-1, 1]) {
    g.fillStyle = sd < 0 ? lit(color, 0.15) : color;
    poly(g, [[x + sd * 30 * s, y], [x + sd * 30 * s, y - 220 * s], [x + sd * 50 * s, y - 300 * s], [x + sd * 60 * s, y - 380 * s], [x + sd * 75 * s, y - 300 * s], [x + sd * 110 * s, y - 220 * s], [x + sd * 120 * s, y]]); g.fill();
  }
}
/** A torch (obor) flame. */
export function torch(g, t, x, y, s = 1) {
  g.fillStyle = '#5a4030'; g.fillRect(x - 4 * s, y, 8 * s, 120 * s);
  radial(g, x, y - 10 * s, 90 * s, PAL.ember, 0.6);
  g.fillStyle = '#ffd27a'; g.beginPath(); g.ellipse(x, y - 14 * s + Math.sin(t * 9 + x) * 3, 12 * s, 26 * s, 0, 0, TAU); g.fill();
}
/** An offering bundle (ongkek-style): vegetables, flowers, a little hen of colour. */
export function offering(g, x, y, s = 1, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = '#b48a4a'; g.beginPath(); g.ellipse(0, 10, 70, 26, 0, 0, TAU); g.fill();
  [['#6aa04a', -40, -20, 30], ['#e0603a', 0, -34, 26], ['#f2c84a', 36, -18, 24], ['#c84a6a', -10, -10, 22], ['#7ab0e0', 20, -44, 16]].forEach(([c, ox, oy, r]) => { g.fillStyle = c; g.beginPath(); g.arc(ox, oy, r, 0, TAU); g.fill(); });
  g.fillStyle = '#4a7a3a'; poly(g, [[-8, -50], [0, -110], [8, -50]]); g.fill();
  g.restore();
}

// ---------------- crisp text ----------------
/** Hand-lettered caption tag on torn paper: names and places. */
export function tag(ctx, text, x, y, { size = 44, alpha = 1, sub = null, subSize = 28, rot = -0.02 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${size}px 'Playfair Display'`; ctx.letterSpacing = '2px';
  const w = ctx.measureText(text).width; let w2 = 0;
  if (sub) { ctx.font = `700 ${subSize}px 'Caveat'`; ctx.letterSpacing = '1px'; w2 = ctx.measureText(sub).width; }
  const W = Math.max(w, w2) + 70, H = size * 1.25 + (sub ? subSize * 1.2 : 0) + 20;
  ctx.shadowColor = 'rgba(60,50,60,0.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5;
  ctx.fillStyle = 'rgba(252,248,238,0.95)'; ctx.beginPath();
  const r = mulberry32(text.length * 7 + 1);
  ctx.moveTo(-W / 2, -H / 2); for (let i = 1; i <= 10; i++) ctx.lineTo(-W / 2 + (W * i) / 10, -H / 2 + (r() - 0.5) * 6);
  for (let i = 1; i <= 4; i++) ctx.lineTo(W / 2 + (r() - 0.5) * 6, -H / 2 + (H * i) / 4);
  for (let i = 9; i >= 0; i--) ctx.lineTo(-W / 2 + (W * i) / 10, H / 2 + (r() - 0.5) * 6);
  ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.font = `700 ${size}px 'Playfair Display'`; ctx.letterSpacing = '2px'; ctx.fillStyle = '#3e3448';
  ctx.fillText(text, 0, sub ? -subSize * 0.55 : 2);
  if (sub) { ctx.font = `700 ${subSize}px 'Caveat'`; ctx.letterSpacing = '1px'; ctx.fillStyle = '#b4584a'; ctx.fillText(sub, 0, size * 0.55); }
  ctx.restore();
}
/** Big title in deep indigo with a paper halo. */
export function title(ctx, text, x, y, { size = 110, alpha = 1, color = '#3e4a72' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${size}px 'Playfair Display'`; ctx.letterSpacing = '6px';
  ctx.shadowColor = 'rgba(255,250,240,0.95)'; ctx.shadowBlur = size * 0.4;
  ctx.lineWidth = size * 0.08; ctx.strokeStyle = 'rgba(255,250,240,0.9)'; ctx.strokeText(text, x, y);
  ctx.shadowBlur = 0; ctx.fillStyle = color; ctx.fillText(text, x, y);
  ctx.restore();
}

// ---------------- the figure rig ----------------
// A painter's figure: smooth anatomical silhouettes with modelled light (lit side, core shadow), a head with a
// jaw, nose, brow and eye sockets that turns from 3/4 profile to frontal, hands with thumbs, costume layers.
// Local units: feet at (0,0), u = head height = h / 7.2. Faces right when face = 1 (values between -1..1 squeeze
// the figure for a turn). pose: {
//   lean (rad, + forward), head (rad, + nods down / - chin up), turn (0 frontal face .. 1 three-quarter, default 1),
//   armF / armB: [shoulder, elbow] (rad from hanging down; + swings forward/up), walk: phase 0..1 or null,
//   kneel 0..1, bow 0..1 (fold at the hips), sit 0..1, hold: 'brush'|'musket'|'sword'|'palette'|null, fist 0..1 }
export const COSTUMES = {
  anteng: { kebaya: '#a9c4de', kain: '#7a4e5e', motif: '#4a2e3a', skin: '#c99068', head: 'konde', hair: '#2a1e1e', long: true, shoe: null, sash: '#e8a3a6' },
  seger: { shirt: '#4e5e80', kain: '#6a5040', motif: '#3a2a20', skin: '#b07a52', head: 'blangkon', hat: '#3e3a4e', shoe: null, wrap: '#9a5a52' },
  tengger: { shirt: '#5a5a6a', pants: '#3e3a48', skin: '#b07a52', head: 'blangkon', hat: '#4a4058', shoe: '#3a2e2e', wrap: '#5a6aa0' },
  tenggerW: { kebaya: '#d98a7a', kain: '#4a3e5a', motif: '#2e2640', skin: '#c08860', head: 'konde', hair: '#2a1e1e', long: true, shoe: null, wrap: '#6a8a6a' },
  anak: { shirt: '#e8c46a', pants: '#6a7aa0', skin: '#c08860', hair: '#2a1e1e', head: 'bare', shoe: '#4a3a30' },
};
const SH = (g, base, light, x0, x1, amt = 1) => shadeGrad(g, x0, x1, base, light, amt);
/** Painted contour: the darker edge a painter leaves around a form (fraction of the head unit). */
export const RIG = { edge: 0.04 };
function fillEdge(g, fill, base, u) { g.fillStyle = fill; g.fill(); if (RIG.edge > 0) { g.strokeStyle = dark(base, 0.62); g.lineWidth = u * RIG.edge; g.stroke(); } }

/** Tapered limb as a filled shape through joints a→b→c with widths wa, wb, wc. */
function limbShape(g, a, b, c, wa, wb, wc) {
  const n = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
  const n1 = n(a, b), n2 = n(b, c), nb = [(n1[0] + n2[0]) / 2, (n1[1] + n2[1]) / 2];
  g.beginPath();
  g.moveTo(a[0] + n1[0] * wa / 2, a[1] + n1[1] * wa / 2);
  g.quadraticCurveTo(b[0] + nb[0] * wb / 2 * 1.05, b[1] + nb[1] * wb / 2 * 1.05, c[0] + n2[0] * wc / 2, c[1] + n2[1] * wc / 2);
  g.lineTo(c[0] - n2[0] * wc / 2, c[1] - n2[1] * wc / 2);
  g.quadraticCurveTo(b[0] - nb[0] * wb / 2 * 1.05, b[1] - nb[1] * wb / 2 * 1.05, a[0] - n1[0] * wa / 2, a[1] - n1[1] * wa / 2);
  g.closePath();
  g.moveTo(a[0] + wa / 2, a[1]); g.arc(a[0], a[1], wa / 2, 0, TAU);
}
/** A hand: palm + thumb, oriented along `ang` (radians, 0 = pointing down). fist 0..1 */
function handShape(g, x, y, ang, u, col, fist = 0, side = 1) {
  g.save(); g.translate(x, y); g.rotate(-ang);
  g.fillStyle = col;
  g.beginPath(); g.ellipse(0, u * 0.16, u * 0.14, u * (0.24 - fist * 0.07), 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(u * 0.11 * side, u * 0.06, u * 0.06, u * 0.13, -0.5 * side, 0, TAU); g.fill();
  g.restore();
}
/** The head, 3/4 (turn 1) to frontal (turn 0), facing +x. (hx, hy) = centre of the skull. */
function headShape(g, hx, hy, u, C, light, turn = 1, mood = 0) {
  const s = C.skin, tr = turn;
  const fx = (v) => hx + v * u; const fy = (v) => hy + v * u;
  // neck
  g.fillStyle = dark(s, 0.25); g.beginPath(); g.moveTo(fx(-0.2), fy(0.25)); g.lineTo(fx(0.18), fy(0.3)); g.lineTo(fx(0.2), fy(0.75)); g.lineTo(fx(-0.24), fy(0.75)); g.closePath(); g.fill();
  // long hair behind (konde style is a bun; long = hair down the back)
  if (C.long && C.hair) { g.fillStyle = C.hair; g.beginPath(); g.ellipse(fx(-0.25), fy(0.35), u * 0.36, u * 0.55, 0.2, 0, TAU); g.fill(); }
  // skull + jaw as one smooth form
  g.fillStyle = SH(g, s, light, fx(-0.5), fx(0.55), 1.2);
  g.beginPath();
  g.moveTo(fx(-0.42), fy(0.12));
  g.bezierCurveTo(fx(-0.58), fy(-0.35), fx(-0.25), fy(-0.62), fx(0.05), fy(-0.6));
  g.bezierCurveTo(fx(0.32 + 0.06 * tr), fy(-0.58), fx(0.44 + 0.04 * tr), fy(-0.35), fx(0.4 + 0.06 * tr), fy(-0.12)); // forehead to brow
  g.lineTo(fx(0.4 + 0.2 * tr), fy(0.1)); // nose tip
  g.lineTo(fx(0.38 + 0.08 * tr), fy(0.16));
  g.quadraticCurveTo(fx(0.42 + 0.04 * tr), fy(0.24), fx(0.36 + 0.04 * tr), fy(0.3)); // lips
  g.quadraticCurveTo(fx(0.36), fy(0.44), fx(0.22 + 0.06 * tr), fy(0.46)); // chin
  g.quadraticCurveTo(fx(-0.12), fy(0.42), fx(-0.3), fy(0.3)); // jaw
  g.closePath(); fillEdge(g, g.fillStyle, s, u);
  // ear (far side of the face)
  g.fillStyle = dark(s, 0.15); g.beginPath(); g.ellipse(fx(-0.12 + 0.12 * (1 - tr)), fy(0.0), u * 0.09, u * 0.14, 0, 0, TAU); g.fill();
  // eye sockets in shadow, eyes, brows (mood: -1 sad brows, +1 angry brows)
  const ex = 0.2 + 0.05 * tr, ex2 = -0.08 + 0.12 * (1 - tr);
  g.fillStyle = dark(s, 0.3);
  g.beginPath(); g.ellipse(fx(ex), fy(-0.08), u * 0.12, u * 0.07, 0, 0, TAU); g.fill();
  if (tr < 0.7) { g.beginPath(); g.ellipse(fx(ex2), fy(-0.08), u * 0.11, u * 0.07, 0, 0, TAU); g.fill(); }
  g.fillStyle = '#1a0f0a';
  g.beginPath(); g.ellipse(fx(ex + 0.02), fy(-0.07), u * 0.045, u * 0.035, 0, 0, TAU); g.fill();
  if (tr < 0.7) { g.beginPath(); g.ellipse(fx(ex2 + 0.01), fy(-0.07), u * 0.04, u * 0.035, 0, 0, TAU); g.fill(); }
  g.strokeStyle = dark(C.hair || C.beard || '#2a1a10', 0.2); g.lineCap = 'round'; g.lineWidth = u * 0.055;
  const bt = mood * 0.06;
  g.beginPath(); g.moveTo(fx(ex - 0.1), fy(-0.2 - bt)); g.lineTo(fx(ex + 0.1), fy(-0.2 + bt)); g.stroke();
  if (tr < 0.7) { g.beginPath(); g.moveTo(fx(ex2 + 0.08), fy(-0.2 - bt)); g.lineTo(fx(ex2 - 0.08), fy(-0.2 + bt)); g.stroke(); }
  // cheek light, nose shadow
  g.fillStyle = rgbaHex(lit(s, 0.4), 0.55); g.beginPath(); g.ellipse(fx(0.12 - 0.25 * Math.max(0, -light)), fy(0.1), u * 0.12, u * 0.09, 0, 0, TAU); g.fill();
  g.fillStyle = dark(s, 0.4); g.beginPath(); g.ellipse(fx(0.36 + 0.1 * tr), fy(0.18), u * 0.06, u * 0.025, 0, 0, TAU); g.fill();
  // mouth line
  g.strokeStyle = dark(s, 0.5); g.lineWidth = u * 0.035; g.beginPath(); g.moveTo(fx(0.24 + 0.06 * tr), fy(0.27 + mood * 0.01)); g.lineTo(fx(0.36 + 0.03 * tr), fy(0.26 - mood * 0.02)); g.stroke();
  if (C.beard) { g.fillStyle = C.beard; g.beginPath(); g.moveTo(fx(0.36), fy(0.24)); g.quadraticCurveTo(fx(0.38), fy(0.5), fx(0.2), fy(0.58)); g.quadraticCurveTo(fx(-0.1), fy(0.5), fx(-0.3), fy(0.25)); g.quadraticCurveTo(fx(0.0), fy(0.38), fx(0.3), fy(0.32)); g.closePath(); g.fill(); }
  if (C.mustache) { g.fillStyle = C.beard || C.hair || '#120c08'; g.beginPath(); g.ellipse(fx(0.3 + 0.04 * tr), fy(0.21), u * 0.12, u * 0.035, -0.15, 0, TAU); g.fill(); }
  if (C.sideburn) { g.fillStyle = C.hair; g.beginPath(); g.ellipse(fx(-0.12), fy(0.12), u * 0.06, u * 0.16, 0, 0, TAU); g.fill(); }
  // headgear / hair
  const hg = C.hat || C.hair;
  if (C.head === 'turban') {
    g.fillStyle = SH(g, C.hat, light, fx(-0.7), fx(0.6), 1.1);
    g.beginPath(); g.moveTo(fx(-0.55), fy(-0.12)); g.bezierCurveTo(fx(-0.75), fy(-0.75), fx(-0.2), fy(-1.02), fx(0.1), fy(-0.98));
    g.bezierCurveTo(fx(0.5), fy(-0.95), fx(0.62), fy(-0.55), fx(0.46), fy(-0.2)); g.quadraticCurveTo(fx(0.0), fy(-0.32), fx(-0.55), fy(-0.12)); g.fill();
    g.strokeStyle = dark(C.hat, 0.3); g.lineWidth = u * 0.06;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(fx(-0.55 + i * 0.05), fy(-0.3 - i * 0.18)); g.quadraticCurveTo(fx(0.0), fy(-0.5 - i * 0.2), fx(0.5 - i * 0.06), fy(-0.38 - i * 0.18)); g.stroke(); }
    g.fillStyle = lit(C.hat, 0.2); g.beginPath(); g.ellipse(fx(0.1), fy(-0.97), u * 0.13, u * 0.07, 0, 0, TAU); g.fill();
  } else if (C.head === 'bicorne') {
    g.fillStyle = C.hair; g.beginPath(); g.ellipse(fx(-0.12), fy(-0.3), u * 0.42, u * 0.3, 0, Math.PI * 0.9, TAU * 1.0); g.fill();
    g.fillStyle = C.hat; g.beginPath(); g.moveTo(fx(-0.85), fy(-0.42)); g.quadraticCurveTo(fx(-0.1), fy(-1.22), fx(0.75), fy(-0.4)); g.quadraticCurveTo(fx(-0.05), fy(-0.62), fx(-0.85), fy(-0.42)); g.fill();
    g.strokeStyle = '#e9b94f'; g.lineWidth = u * 0.05; g.beginPath(); g.moveTo(fx(-0.8), fy(-0.45)); g.quadraticCurveTo(fx(-0.1), fy(-1.15), fx(0.7), fy(-0.43)); g.stroke();
    g.fillStyle = '#e9b94f'; g.beginPath(); g.arc(fx(0.15), fy(-0.72), u * 0.07, 0, TAU); g.fill();
  } else if (C.head === 'shako') {
    g.fillStyle = SH(g, C.hat, light, fx(-0.45), fx(0.45));
    g.beginPath(); g.moveTo(fx(-0.42), fy(-0.35)); g.lineTo(fx(-0.36), fy(-1.25)); g.lineTo(fx(0.4), fy(-1.25)); g.lineTo(fx(0.44), fy(-0.35)); g.closePath(); g.fill();
    g.fillStyle = '#e9e1c8'; g.fillRect(fx(-0.4), fy(-1.25), u * 0.8, u * 0.1);
    g.fillStyle = dark(C.hat, 0.2); g.beginPath(); g.moveTo(fx(0.35), fy(-0.42)); g.lineTo(fx(0.75), fy(-0.3)); g.lineTo(fx(0.35), fy(-0.3)); g.fill();
  } else if (C.head === 'blangkon' || C.head === 'destar') {
    g.fillStyle = SH(g, C.hat, light, fx(-0.6), fx(0.45));
    g.beginPath(); g.moveTo(fx(-0.52), fy(0.02)); g.bezierCurveTo(fx(-0.62), fy(-0.55), fx(-0.15), fy(-0.72), fx(0.12), fy(-0.68));
    g.bezierCurveTo(fx(0.42), fy(-0.64), fx(0.48), fy(-0.38), fx(0.42), fy(-0.22)); g.quadraticCurveTo(fx(0.0), fy(-0.3), fx(-0.3), fy(-0.05)); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(fx(-0.52), fy(-0.02), u * 0.2, u * 0.17, 0, 0, TAU); g.fill(); // mondolan
    g.strokeStyle = C.head === 'destar' ? '#e9b94f' : lit(C.hat, 0.2); g.lineWidth = u * 0.04;
    g.beginPath(); g.moveTo(fx(-0.4), fy(-0.42)); g.quadraticCurveTo(fx(0.05), fy(-0.62), fx(0.4), fy(-0.38)); g.stroke();
  } else if (C.head === 'konde') {
    g.fillStyle = C.hair; g.beginPath(); g.moveTo(fx(-0.45), fy(0.1)); g.bezierCurveTo(fx(-0.62), fy(-0.5), fx(-0.1), fy(-0.7), fx(0.15), fy(-0.62));
    g.bezierCurveTo(fx(0.42), fy(-0.55), fx(0.44), fy(-0.3), fx(0.38), fy(-0.24)); g.quadraticCurveTo(fx(0.0), fy(-0.38), fx(-0.28), fy(-0.05)); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(fx(-0.55), fy(0.0), u * 0.24, u * 0.2, 0.3, 0, TAU); g.fill();
    g.fillStyle = '#e9b94f'; g.beginPath(); g.arc(fx(-0.45), fy(-0.18), u * 0.05, 0, TAU); g.fill();
  } else if (C.head === 'caping') { // conical farmer's hat
    g.fillStyle = C.hair || '#140c08'; g.beginPath(); g.ellipse(fx(-0.1), fy(-0.25), u * 0.45, u * 0.3, 0, Math.PI, TAU); g.fill();
    g.fillStyle = SH(g, C.hat, light, fx(-1.1), fx(1.1), 1.1);
    g.beginPath(); g.moveTo(fx(-1.05), fy(-0.22)); g.lineTo(fx(0.02), fy(-1.05)); g.lineTo(fx(1.1), fy(-0.2)); g.quadraticCurveTo(fx(0.0), fy(-0.08), fx(-1.05), fy(-0.22)); g.fill();
    g.strokeStyle = dark(C.hat, 0.3); g.lineWidth = u * 0.04; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(fx(0.02), fy(-1.05)); g.lineTo(fx(-1.05 + k * 0.53), fy(-0.2 + Math.abs(k - 2) * 0.01)); g.stroke(); }
  } else if (C.head === 'jamang') { // long hair and a golden crown
    g.fillStyle = C.hair; g.beginPath(); g.moveTo(fx(-0.45), fy(0.15)); g.bezierCurveTo(fx(-0.62), fy(-0.5), fx(-0.1), fy(-0.7), fx(0.15), fy(-0.62));
    g.bezierCurveTo(fx(0.42), fy(-0.55), fx(0.44), fy(-0.3), fx(0.38), fy(-0.24)); g.quadraticCurveTo(fx(0.0), fy(-0.38), fx(-0.28), fy(-0.05)); g.closePath(); g.fill();
    if (C.long) { g.beginPath(); g.moveTo(fx(-0.3), fy(0.0)); g.quadraticCurveTo(fx(-0.75), fy(0.8), fx(-0.55), fy(1.9)); g.lineTo(fx(-0.2), fy(1.6)); g.quadraticCurveTo(fx(-0.25), fy(0.7), fx(-0.05), fy(0.1)); g.fill(); }
    g.fillStyle = SH(g, C.hat, light, fx(-0.5), fx(0.5));
    g.beginPath(); g.moveTo(fx(-0.42), fy(-0.38)); g.lineTo(fx(-0.36), fy(-0.8)); g.lineTo(fx(-0.18), fy(-0.58)); g.lineTo(fx(0.0), fy(-0.98)); g.lineTo(fx(0.16), fy(-0.6)); g.lineTo(fx(0.34), fy(-0.82)); g.lineTo(fx(0.4), fy(-0.38)); g.quadraticCurveTo(fx(0.0), fy(-0.5), fx(-0.42), fy(-0.38)); g.fill();
    g.fillStyle = '#c0392b'; g.beginPath(); g.arc(fx(0.0), fy(-0.58), u * 0.06, 0, TAU); g.fill();
  } else if (C.head === 'bare' && hg) {
    g.fillStyle = hg; g.beginPath(); g.moveTo(fx(-0.45), fy(0.12)); g.bezierCurveTo(fx(-0.62), fy(-0.5), fx(-0.1), fy(-0.72), fx(0.15), fy(-0.64));
    g.bezierCurveTo(fx(0.4), fy(-0.58), fx(0.45), fy(-0.35), fx(0.36), fy(-0.3)); g.quadraticCurveTo(fx(0.05), fy(-0.42), fx(-0.2), fy(-0.05)); g.closePath(); g.fill();
  }
}

export function figure(g, o) {
  const { x, y, h = 600, face = 1, costume = 'jubah', pose = {}, light = -1, headScale = 1, alpha = 1, shadow = true, t = 0, cos: over = {}, mood = 0 } = o;
  const C = { ...COSTUMES[costume], ...over };
  const u = h / 7.2;
  const { lean = 0, head = 0, turn = 1, armF = [0.12, 0.15], armB = [-0.08, 0.15], walk = null, kneel = 0, bow = 0, sit = 0, hold = C.hold || null, fist = 0, breathe = 1 } = pose;
  const L = light * Math.sign(face || 1);
  g.save(); g.globalAlpha *= alpha;
  if (shadow) { g.fillStyle = 'rgba(12,7,4,0.42)'; g.beginPath(); g.ellipse(x - light * h * 0.1, y + h * 0.005, h * 0.22, h * 0.03, 0, 0, TAU); g.fill(); }
  g.translate(x, y); g.scale(face, 1);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const br = Math.sin(t * 2.1 + x * 0.013) * u * 0.035 * breathe;
  const drop = kneel * u * 1.75 + sit * u * 1.6;
  const hipY = -u * 3.55 + drop, waistY = -u * 4.25 + drop + br * 0.5, shY = -u * 5.85 + drop + br, neckY = -u * 6.05 + drop + br;
  const robe = !!C.robe, longKain = !!C.long;
  const legCol = C.pants || C.skin, bootCol = C.boots || C.shoe || dark(C.skin, 0.25);

  // ---- legs ----
  const legJoints = (side) => {
    const hx = side * u * 0.14 - u * 0.02, hy = hipY + u * 0.1;
    if (kneel > 0.01) {
      if (side > 0) { const kx = hx + u * 1.35, ky = -u * 1.75 * (1 - kneel) - u * 0.35 * kneel; return [[hx, hy], [lerp(hx, kx, kneel), Math.max(hy + u * 0.5, ky)], [lerp(hx, kx, kneel) + u * 0.05, 0]]; }
      return [[hx, hy], [hx + u * 0.15, -u * 0.25], [hx - u * 1.45, -u * 0.18]];
    }
    if (sit > 0.01) { return [[hx, hy], [hx + u * 1.55, hy + u * 0.05], [hx + u * 1.6, 0]]; }
    let a = 0, b = 0;
    if (walk != null) { const ph = (walk + (side > 0 ? 0 : 0.5)) * TAU; a = Math.sin(ph) * 0.4; b = Math.max(0, -Math.cos(ph)) * 0.75; }
    const th = u * 1.75, sh = u * 1.7;
    const kx = hx + Math.sin(a) * th, ky = hy + Math.cos(a) * th;
    const fx = kx + Math.sin(a - b) * sh, fy = Math.min(-u * 0.12, ky + Math.cos(a - b) * sh);
    return [[hx, hy], [kx, ky], [fx, fy]];
  };
  const drawLeg = (side) => {
    const [hp, kp, fp] = legJoints(side), back = side < 0;
    const col = back ? dark(legCol, 0.25) : legCol;
    limbShape(g, hp, kp, fp, u * 0.62, u * 0.46, u * 0.34); fillEdge(g, SH(g, col, L, -u * 0.5, u * 0.5), col, u);
    if (C.boots) { g.fillStyle = back ? dark(C.boots, 0.2) : C.boots; limbShape(g, [lerp(kp[0], fp[0], 0.15), lerp(kp[1], fp[1], 0.15)], [lerp(kp[0], fp[0], 0.6), lerp(kp[1], fp[1], 0.6)], fp, u * 0.44, u * 0.38, u * 0.34); g.fill(); }
    g.fillStyle = back ? dark(bootCol, 0.2) : bootCol;
    g.beginPath(); g.moveTo(fp[0] - u * 0.18, fp[1] - u * 0.12); g.quadraticCurveTo(fp[0] + u * 0.55, fp[1] - u * 0.18, fp[0] + u * 0.62, fp[1] + u * 0.08); g.lineTo(fp[0] - u * 0.2, fp[1] + u * 0.1); g.closePath(); g.fill();
  };
  // ---- arms ----
  const armJoints = (side, [a1, a2]) => {
    const sx = side > 0 ? u * 0.08 : -u * 0.28, sy = shY + u * 0.22;
    const up = u * 1.42, fo = u * 1.28;
    const ex = sx + Math.sin(a1) * up, ey = sy + Math.cos(a1) * up;
    const wx = ex + Math.sin(a1 + a2) * fo, wy = ey + Math.cos(a1 + a2) * fo;
    return [[sx, sy], [ex, ey], [wx, wy], a1 + a2];
  };
  const sleeveCol = C.sleeve || C.coat || C.shirt || C.kebaya || null;
  const drawArm = (side, ang) => {
    const [s, e, w, aa] = armJoints(side, ang), back = side < 0;
    const col = sleeveCol || C.skin;
    const c2 = back ? dark(col, 0.3) : col;
    if (C.robe) limbShape(g, s, e, w, u * 0.6, u * 0.62, u * 0.7); // wide flaring sleeve
    else limbShape(g, s, e, w, u * 0.52, u * 0.4, u * 0.32);
    fillEdge(g, SH(g, c2, L, -u * 0.6, u * 0.6), c2, u);
    if (C.braid && !back) { g.strokeStyle = C.braid; g.lineWidth = u * 0.07; g.beginPath(); g.moveTo(lerp(e[0], w[0], 0.85) - u * 0.15, lerp(e[1], w[1], 0.85)); g.lineTo(lerp(e[0], w[0], 0.85) + u * 0.15, lerp(e[1], w[1], 0.85)); g.stroke(); }
    if (C.coat && !back) { g.fillStyle = C.collar && costume !== 'pelukis' ? C.collar : lit(C.coat, 0.2); g.beginPath(); g.ellipse(w[0], w[1], u * 0.17, u * 0.1, -aa, 0, TAU); g.fill(); }
    handShape(g, w[0], w[1], aa, u, back ? dark(C.skin, 0.25) : C.skin, fist, 1);
    return [w[0] + Math.sin(aa) * u * 0.2, w[1] + Math.cos(aa) * u * 0.2, aa];
  };
  const upper = (fn) => { g.save(); g.translate(0, hipY); g.rotate(lean + bow * 1.15); g.translate(0, -hipY); fn(); g.restore(); };

  // back leg, back arm
  const legsVisible = !robe && !longKain || walk != null || kneel > 0 || sit > 0;
  if (legsVisible && !(longKain && kneel > 0)) drawLeg(-1);
  upper(() => drawArm(-1, armB));
  if (legsVisible && !(longKain && kneel > 0)) drawLeg(1);
  // kain wrap (abdi, putri) from waist to shin / ankle
  if (C.kain) {
    const hem = longKain ? -u * 0.2 : -u * 1.25;
    const kk = kneel > 0.01 || sit > 0.01;
    const sw = walk != null ? Math.sin(walk * TAU) * u * 0.15 : 0;
    g.fillStyle = SH(g, C.kain, L, -u * 0.8, u * 0.8);
    g.beginPath();
    if (kk) { g.moveTo(-u * 0.62, waistY); g.lineTo(u * 0.55, waistY); g.quadraticCurveTo(u * 1.4, hipY + u * 0.2, u * 1.6, -u * 0.05); g.lineTo(-u * 1.5, -u * 0.05); g.quadraticCurveTo(-u * 0.8, hipY + u * 0.6, -u * 0.62, waistY); }
    else { g.moveTo(-u * 0.6, waistY); g.lineTo(u * 0.55, waistY); g.quadraticCurveTo(u * 0.68, hipY, u * 0.62 + sw, hem); g.lineTo(-u * 0.6 + sw, hem + u * 0.05); g.quadraticCurveTo(-u * 0.72, hipY, -u * 0.6, waistY); }
    g.closePath(); fillEdge(g, g.fillStyle, C.kain, u);
    g.save(); g.clip();
    g.strokeStyle = C.motif || dark(C.kain, 0.45); g.lineWidth = u * 0.07;
    for (let i = -6; i < 8; i++) { g.beginPath(); g.moveTo(-u * 2 + i * u * 0.35, waistY); g.lineTo(-u * 1 + i * u * 0.35, 0); g.stroke(); }
    g.restore();
    if (longKain && !kk) { g.fillStyle = bootCol === C.shoe ? dark(C.skin, 0.2) : bootCol; g.beginPath(); g.ellipse(u * 0.35 + sw, -u * 0.12, u * 0.3, u * 0.12, 0, 0, TAU); g.fill(); }
  }
  // robe (jubah) from shoulders to ankles
  if (robe) {
    const kk = kneel > 0.01;
    const sw = walk != null ? Math.sin(walk * TAU) * u * 0.22 : Math.sin(t * 1.3) * u * 0.04;
    const hem = kk ? -u * 0.1 : -u * 0.3;
    upper(() => {});
    g.fillStyle = SH(g, C.robe, L, -u * 1.0, u * 1.0, 1.15);
    g.beginPath();
    g.moveTo(-u * 0.5, waistY - u * 0.2);
    g.lineTo(u * 0.45, waistY - u * 0.2);
    g.quadraticCurveTo(u * 0.62, waistY, u * 0.62, hipY);
    g.quadraticCurveTo(u * 0.85 + sw * 0.5 + (kk ? u * 0.9 : 0), -u * 1.6, u * 0.95 + sw + (kk ? u * 1.0 : 0), hem);
    g.quadraticCurveTo(u * 0.05 + sw, hem + u * 0.12, -u * 0.85 + sw, hem);
    g.quadraticCurveTo(-u * 0.8, -u * 1.8, -u * 0.62, hipY);
    g.quadraticCurveTo(-u * 0.62, waistY, -u * 0.5, waistY - u * 0.2);
    g.closePath(); fillEdge(g, g.fillStyle, C.robe, u);
    // soft folds
    g.save(); g.clip();
    for (const [fx0, k] of [[-0.35, 0.18], [0.12, 0.14], [0.5, 0.2]]) {
      const gr = g.createLinearGradient(u * (fx0 - 0.18), 0, u * (fx0 + 0.18), 0);
      gr.addColorStop(0, rgbaHex(dark(C.robe, 0.5), 0)); gr.addColorStop(0.5, rgbaHex(dark(C.robe, 0.5), k * 1.6)); gr.addColorStop(1, rgbaHex(dark(C.robe, 0.5), 0));
      g.fillStyle = gr; g.beginPath(); g.moveTo(u * fx0, waistY); g.lineTo(u * (fx0 - 0.2) + sw, 0); g.lineTo(u * (fx0 + 0.25) + sw, 0); g.closePath(); g.fill();
    }
    g.restore();
    if (!kk) { g.fillStyle = C.shoe || '#3a2a1a'; g.beginPath(); g.ellipse(u * 0.5 + sw, -u * 0.1, u * 0.34, u * 0.12, 0, 0, TAU); g.fill(); }
  }

  upper(() => {
    // ---- torso ----
    const top = C.coat || C.shirt || C.kebaya || (robe ? C.robe : null) || C.skin;
    g.fillStyle = SH(g, top, L, -u * 0.8, u * 0.7, 1.15);
    g.beginPath();
    g.moveTo(-u * 0.12, neckY + u * 0.05);
    g.quadraticCurveTo(-u * 0.7, shY - u * 0.08, -u * 0.74, shY + u * 0.38); // back shoulder
    g.quadraticCurveTo(-u * 0.68, shY + u * 1.2, -u * 0.5, waistY);
    g.quadraticCurveTo(-u * 0.58, hipY - u * 0.25, -u * 0.55, hipY + u * 0.25);
    g.lineTo(u * 0.55, hipY + u * 0.25);
    g.quadraticCurveTo(u * 0.5, hipY - u * 0.3, u * 0.42, waistY);
    g.quadraticCurveTo(u * 0.7, shY + u * 0.9, u * 0.6, shY + u * 0.3); // chest
    g.quadraticCurveTo(u * 0.5, shY - u * 0.08, u * 0.15, neckY + u * 0.05);
    g.closePath(); fillEdge(g, g.fillStyle, top, u);
    if (C.bare) { // bare chest: pectoral and belly shading
      g.fillStyle = dark(C.skin, 0.2); g.beginPath(); g.ellipse(u * 0.25, shY + u * 0.75, u * 0.25, u * 0.1, 0.3, 0, TAU); g.fill();
    }
    if (C.coat && C.tails) { // coat skirt / tails
      const tl = hipY + u * 1.9 * C.tails;
      g.fillStyle = SH(g, C.coat, L, -u * 0.8, u * 0.6);
      g.beginPath(); g.moveTo(-u * 0.55, waistY); g.lineTo(u * 0.35, waistY); g.lineTo(u * 0.1, tl - u * 0.4); g.lineTo(-u * 0.68, tl); g.closePath(); g.fill();
    }
    if (C.vest) { g.fillStyle = C.vest; g.beginPath(); g.moveTo(u * 0.1, neckY + u * 0.25); g.lineTo(u * 0.48, shY + u * 0.5); g.lineTo(u * 0.4, waistY); g.lineTo(u * 0.08, waistY + u * 0.1); g.closePath(); g.fill(); }
    if (C.cravat) { g.fillStyle = C.cravat; g.beginPath(); g.ellipse(u * 0.22, neckY + u * 0.2, u * 0.16, u * 0.2, 0, 0, TAU); g.fill(); }
    if (C.collar && C.coat) { g.fillStyle = C.collar; g.beginPath(); g.moveTo(-u * 0.15, neckY - u * 0.05); g.lineTo(u * 0.25, neckY - u * 0.02); g.lineTo(u * 0.28, neckY + u * 0.2); g.lineTo(-u * 0.18, neckY + u * 0.18); g.closePath(); g.fill(); }
    if (C.buttons) { g.fillStyle = C.buttons; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(u * 0.38 - i * u * 0.02, shY + u * (0.4 + i * 0.32), u * 0.045, 0, TAU); g.fill(); } }
    if (C.belt && C.coat) { g.strokeStyle = C.belt; g.lineWidth = u * 0.13; g.beginPath(); g.moveTo(-u * 0.5, shY + u * 0.15); g.lineTo(u * 0.45, waistY - u * 0.05); g.stroke(); }
    if (C.sashCol) { g.strokeStyle = C.sashCol; g.lineWidth = u * 0.24; g.beginPath(); g.moveTo(u * 0.45, shY + u * 0.2); g.lineTo(-u * 0.5, waistY); g.stroke(); }
    if (C.star) { g.fillStyle = '#f2e2a0'; g.beginPath(); g.arc(-u * 0.1, shY + u * 0.85, u * 0.1, 0, TAU); g.fill(); }
    if (C.epaulette) { g.fillStyle = C.epaulette; g.beginPath(); g.ellipse(-u * 0.05, shY + u * 0.08, u * 0.42, u * 0.15, 0.08, 0, TAU); g.fill(); g.fillStyle = dark(C.epaulette, 0.3); for (let i = 0; i < 5; i++) g.fillRect(-u * 0.38 + i * u * 0.16, shY + u * 0.18, u * 0.06, u * 0.18); }
    if (costume === 'jubah') {
      g.strokeStyle = C.sash; g.lineWidth = u * 0.34; g.beginPath(); g.moveTo(-u * 0.45, shY + u * 0.05); g.quadraticCurveTo(u * 0.1, shY + u * 1.0, u * 0.5, waistY + u * 0.2); g.stroke();
      g.fillStyle = C.belt; g.fillRect(-u * 0.62, waistY - u * 0.1, u * 1.22, u * 0.2);
      g.fillStyle = '#5a3418'; g.beginPath(); g.ellipse(-u * 0.55, waistY - u * 0.25, u * 0.1, u * 0.28, -0.4, 0, TAU); g.fill(); // keris hilt
    }
    if (C.sash && costume !== 'jubah') { g.strokeStyle = C.sash; g.lineWidth = u * 0.22; g.beginPath(); g.moveTo(-u * 0.5, shY + u * 0.2); g.quadraticCurveTo(u * 0.3, shY + u * 0.9, u * 0.45, waistY); g.quadraticCurveTo(u * 0.7, hipY + u * 0.8 + Math.sin(t * 2) * u * 0.1, u * 0.95, hipY + u * 1.6); g.stroke(); }
    if (C.wrap) { // sarung wrapped over the shoulders, Tengger style
      g.beginPath(); g.moveTo(-u * 0.85, shY + u * 0.05); g.quadraticCurveTo(0, shY - u * 0.3, u * 0.7, shY + u * 0.1);
      g.quadraticCurveTo(u * 0.85, shY + u * 1.2, u * 0.6, waistY + u * 0.25); g.lineTo(-u * 0.75, waistY + u * 0.35); g.quadraticCurveTo(-u * 0.95, shY + u * 1.0, -u * 0.85, shY + u * 0.05); g.closePath();
      fillEdge(g, SH(g, C.wrap, L, -u, u), C.wrap, u);
      g.save(); g.clip(); g.strokeStyle = rgbaHex(lit(C.wrap, 0.45), 0.7); g.lineWidth = u * 0.07;
      for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(k * u * 0.3, shY - u * 0.4); g.lineTo(k * u * 0.3 - u * 0.2, waistY + u * 0.5); g.stroke(); }
      for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-u, shY + k * u * 0.4); g.lineTo(u, shY + k * u * 0.4 + u * 0.1); g.stroke(); }
      g.restore();
    }
    if (C.kebaya) { g.fillStyle = dark(C.kebaya, 0.15); g.beginPath(); g.moveTo(u * 0.1, neckY + u * 0.2); g.lineTo(u * 0.4, waistY); g.lineTo(u * 0.25, waistY); g.closePath(); g.fill(); }
    // ---- head ----
    const hx = u * 0.06, hy = neckY - u * 0.62;
    g.save(); g.translate(hx, neckY); g.rotate(head); g.scale(headScale, headScale); g.translate(-hx, -neckY);
    headShape(g, hx, hy, u, C, L, turn, mood);
    g.restore();
    // ---- front arm ----
    const hand = drawArm(1, armF);
    if (hold) holdProp(g, hold, hand, u);
  });
  g.restore();
}
function holdProp(g, kind, [hx, hy, ang], u) {
  g.save(); g.translate(hx, hy);
  if (kind === 'musket') {
    g.rotate(-0.12); g.fillStyle = '#3a2416'; g.fillRect(-u * 0.1, -u * 3.3, u * 0.2, u * 4.0);
    g.fillStyle = '#8a8f98'; g.fillRect(-u * 0.04, -u * 4.3, u * 0.08, u * 1.05);
  } else if (kind === 'brush') {
    g.rotate(-ang + Math.PI * 0.85); g.fillStyle = '#6a4220'; g.fillRect(-u * 0.04, 0, u * 0.08, u * 1.1);
    g.fillStyle = '#c0392b'; g.beginPath(); g.ellipse(0, u * 1.15, u * 0.06, u * 0.14, 0, 0, TAU); g.fill();
  } else if (kind === 'palette') {
    g.fillStyle = '#b48a5a'; g.beginPath(); g.ellipse(0, -u * 0.1, u * 0.7, u * 0.45, -0.3, 0, TAU); g.fill();
    ['#c0392b', '#e9b94f', '#2f5a8a', '#f4eee0', '#2c4a2a'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(-u * 0.42 + i * u * 0.2, -u * 0.2 + (i % 2) * u * 0.18, u * 0.09, 0, TAU); g.fill(); });
  } else if (kind === 'sword') {
    g.rotate(-ang); g.fillStyle = '#c9ccd2'; g.fillRect(-u * 0.04, 0, u * 0.08, u * 2.2); g.fillStyle = '#e9b94f'; g.fillRect(-u * 0.18, -u * 0.04, u * 0.36, u * 0.08);
  }
  g.restore();
}
/** World position of the front hand (for props or gestures in world coords). Same params as figure(). */
export function handPos(o) {
  const { x, y, h = 600, face = 1, pose = {} } = o; const u = h / 7.2;
  const { armF = [0.12, 0.15], kneel = 0, sit = 0, lean = 0, bow = 0 } = pose;
  const drop = kneel * u * 1.75 + sit * u * 1.6, shY = -u * 5.85 + drop, hipY = -u * 3.55 + drop;
  const sx = u * 0.08, sy = shY + u * 0.22;
  const ex = sx + Math.sin(armF[0]) * u * 1.42, ey = sy + Math.cos(armF[0]) * u * 1.42;
  const hx = ex + Math.sin(armF[0] + armF[1]) * u * 1.48, hy = ey + Math.cos(armF[0] + armF[1]) * u * 1.48;
  const r = lean + bow * 1.15, dy = hy - hipY; const rx = hx * Math.cos(r) - dy * Math.sin(r), ry = hx * Math.sin(r) + dy * Math.cos(r) + hipY;
  return [x + rx * face, y + ry];
}
/** World position of the head centre (for halos, rings, labels). */
export function headPos(o) {
  const { x, y, h = 600, face = 1, pose = {} } = o; const u = h / 7.2;
  const { kneel = 0, sit = 0, lean = 0, bow = 0 } = pose;
  const drop = kneel * u * 1.75 + sit * u * 1.6, neckY = -u * 6.05 + drop, hipY = -u * 3.55 + drop;
  const hx = u * 0.06, hy = neckY - u * 0.62, r = lean + bow * 1.15, dy = hy - hipY;
  return [x + (hx * Math.cos(r) - dy * Math.sin(r)) * face, y + hx * Math.sin(r) + dy * Math.cos(r) + hipY];
}


export { ease, clamp, lerp, hrand, noise };
