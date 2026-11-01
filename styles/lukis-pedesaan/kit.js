// AniMasters style kit: LUKIS PEDESAAN (impressionist countryside, moving).
// Bright plein-air painting: short broken dabs of pure colour (no swirl), airy morning light, green-gold rice
// terraces, mist between the hills. Drawn FLAT with soft light gradients in design px (1080x1920), then painted by
// a custom paint pass (base oil, short dabs). Signature moves: morning mist drifting through the terraces, rice
// that sways and ripens from green to gold, plants that grow up out of the ground in time-lapse, sun flare.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU, mixHex } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

/** Impressionist look: short broken dabs, high-key colour, almost no swirl, light canvas. Clearly not #22's dark impasto. */
export const LOOK = {
  base: 'oil', brush: 12, length: 1.5, layers: 3, swirl: 0.12, flow: 220, curve: 0.25, bristle: 0.3, impasto: 0.35,
  hueJitter: 0.3, valueJitter: 0.22, satJitter: 0.3, respect: 0.55, boil: 0.5,
  paper: 0.5, grain: 0.25, saturation: 1.28, contrast: 1.04, warmth: 0.1, vignette: 0.1, bloom: 0.15,
};
export const PAL = {
  skyTop: '#5f9ad6', skyMid: '#a6c8e6', dawn: '#f6d49a', sun: '#fff4d2', mist: '#eef1e4', hill: '#8fae9a', hillFar: '#b3c7c4',
  green: '#6fae3f', greenDeep: '#3f7a32', young: '#a8d05a', gold: '#e9c45a', goldDeep: '#c4952e', water: '#bcd8e8',
  earth: '#8a6a44', bund: '#5e7a34', cream: '#fbf3df', ink: '#2e3a22', rose: '#e8a0a0',
};

// ---------------- painter + camera ----------------
export async function painter(AM, { scale = 0.55, overrides = {} } = {}) {
  let q = {}; try { const s = new URLSearchParams(location.search).get('lk'); if (s) q = JSON.parse(s); } catch (e) { /* none */ }
  return AM.painter({ ...LOOK, ...overrides, ...q }, { scale });
}
/** Flat canvas transform: design px (1080x1920), camera on world point (x, y) at zoom z. */
export function view(P, { x = 540, y = 960, z = 1, rot = 0 } = {}) {
  const s = P.W / 1080, g = P.g;
  g.setTransform(s, 0, 0, s, 0, 0);
  g.translate(540, 960); g.rotate(rot); g.scale(z, z); g.translate(-x, -y);
  return g;
}

// ---------------- colour helpers ----------------
export const mix = (a, b, t) => mixHex(a, b, t);
const lit = (c, k = 0.25) => mixHex(c, '#fffbe8', k);
const dark = (c, k = 0.45) => mixHex(c, '#33335c', k); // impressionist shadows are violet, not black
function shadeGrad(g, x0, x1, base, light, amt = 1) {
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  const a = lit(base, 0.22 * amt), b = base, c = dark(base, 0.36 * amt);
  if (light < 0) { gr.addColorStop(0, a); gr.addColorStop(0.45, b); gr.addColorStop(1, c); }
  else { gr.addColorStop(0, c); gr.addColorStop(0.55, b); gr.addColorStop(1, a); }
  return gr;
}
function vGrad(g, y0, y1, stops) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
  return gr;
}
export function rgbaHex(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
export function radial(g, x, y, r, col, a = 1) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgbaHex(col, a)); gr.addColorStop(1, rgbaHex(col, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
export function poly(g, pts, fill) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } }

// ---------------- sky, light, mist ----------------
/** One soft cumulus mass with lit top and a flat base. */
export function cloudMass(g, x, y, w, h, { lit: lc = '#ffffff', mid = '#f2ece4', shade = '#c9d2dc', light = -1, seed = 1, t = 0 } = {}) {
  const r = mulberry32(seed), n = 8 + (r() * 5 | 0), B = [];
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1), dome = Math.sin(f * Math.PI);
    B.push([x + (f - 0.5) * w * 0.9 + (r() - 0.5) * w * 0.12 + Math.sin(t * 0.4 + i) * 3, y - dome * h * 0.35 - r() * h * 0.15, h * (0.32 + 0.38 * dome) * (0.8 + r() * 0.4)]);
  }
  const blob = (dx, dy, k, col) => { g.fillStyle = col; g.beginPath(); for (const [bx, by, br] of B) { g.moveTo(bx + dx + br * k, by + dy); g.arc(bx + dx, by + dy, br * k, 0, TAU); } g.fill(); };
  g.save(); g.beginPath(); g.rect(x - w, y - h * 3, w * 2, h * 3.28); g.clip();
  blob(0, 0, 1, shade); blob(light * h * 0.08, -h * 0.12, 0.88, mid); blob(light * h * 0.2, -h * 0.26, 0.62, lc);
  g.restore();
}
/** Morning sky: blue to a warm dawn horizon, a low sun with a big soft glow, drifting clouds. */
export function morningSky(g, t, { x0 = -400, x1 = 1480, y0 = -300, y1 = 1000, sun = [760, 760], top = PAL.skyTop, mid = PAL.skyMid, dawn = PAL.dawn, clouds = 5, seed = 4, glow = 1 } = {}) {
  g.fillStyle = vGrad(g, y0, y1, [top, mid, dawn, lit(dawn, 0.4)]); g.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (sun) { radial(g, sun[0], sun[1], 460, '#ffe7b0', 0.45 * glow); radial(g, sun[0], sun[1], 220, '#fff8e0', 0.9 * glow); g.fillStyle = PAL.sun; g.beginPath(); g.arc(sun[0], sun[1], 62, 0, TAU); g.fill(); }
  const r = mulberry32(seed);
  for (let i = 0; i < clouds; i++) {
    const fy = 0.1 + r() * 0.45, w = 300 + r() * 380;
    const cx = x0 + ((r() * (x1 - x0) + t * 12 * (0.5 + r())) % (x1 - x0 + 400)) - 200;
    cloudMass(g, cx, y0 + fy * (y1 - y0), w, w * 0.3, { lit: '#fffaf0', mid: mixHex('#f4e8dc', dawn, fy), shade: mixHex('#c9d4e2', top, 0.3), light: sun && sun[0] > 540 ? 1 : -1, seed: (r() * 1e6) | 0, t });
  }
}
/** Rolling hills (far, misty). */
export function hills(g, { x0 = -400, x1 = 1480, y = 900, amp = 80, color = PAL.hill, seed = 1, to = 2600, freq = 0.004 } = {}) {
  g.fillStyle = color; g.beginPath(); g.moveTo(x0, to);
  for (let x = x0; x <= x1; x += 24) g.lineTo(x, y - amp * (0.55 + 0.45 * noise.n2(x * freq, seed)));
  g.lineTo(x1, to); g.closePath(); g.fill();
}
/** Volcano cone (far): a Javanese mountain with a lit flank. */
export function volcano(g, x, y, { w = 520, h = 420, color = '#9fb6c4', light = 1 } = {}) {
  g.fillStyle = color; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x - w * 0.3, y - h * 0.6, x - w * 0.1, y - h); g.lineTo(x + w * 0.1, y - h); g.quadraticCurveTo(x + w * 0.3, y - h * 0.6, x + w, y); g.closePath(); g.fill();
  g.fillStyle = lit(color, 0.25); const s = light;
  g.beginPath(); g.moveTo(x + s * w * 0.1, y - h); g.quadraticCurveTo(x + s * w * 0.3, y - h * 0.6, x + s * w, y); g.lineTo(x + s * w * 0.35, y); g.quadraticCurveTo(x + s * w * 0.2, y - h * 0.5, x + s * w * 0.1, y - h); g.fill();
}
/** Bands of mist that drift slowly sideways (layered, translucent). */
export function mist(g, t, { y = 1000, h = 160, a = 0.55, color = PAL.mist, x0 = -400, x1 = 1480, speed = 1, seed = 2 } = {}) {
  const r = mulberry32(seed);
  for (let i = 0; i < 6; i++) {
    const cx = x0 + ((r() * (x1 - x0) + t * 14 * speed * (0.5 + r())) % (x1 - x0 + 600)) - 300, cy = y + (r() - 0.5) * h, w = 380 + r() * 420;
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, w);
    gr.addColorStop(0, rgbaHex(color, a)); gr.addColorStop(1, rgbaHex(color, 0));
    g.save(); g.translate(cx, cy); g.scale(1, 0.22); g.translate(-cx, -cy); g.fillStyle = gr; g.fillRect(cx - w, cy - w, w * 2, w * 2); g.restore();
  }
}

// ---------------- rice terraces ----------------
/** Terraced paddies descending toward the viewer. rows: number of steps between y0 (far) and y1 (near).
 *  ripe 0 green .. 1 gold; water 0..1 (flooded young paddies reflect the sky); t sways the light. */
export function terraces(g, t, { x0 = -400, x1 = 1480, y0 = 900, y1 = 2000, rows = 9, ripe = 0, water = 0, seed = 3, curve = 70, sky = PAL.water } = {}) {
  const r = mulberry32(seed);
  const edges = [];
  for (let i = 0; i <= rows; i++) {
    const f = i / rows, y = y0 + (y1 - y0) * Math.pow(f, 1.45);
    const ph = r() * 6, amp = curve * (0.35 + f * 0.9), fq = 0.0025 + r() * 0.002;
    edges.push((x) => y + Math.sin(x * fq + ph) * amp + noise.n2(x * 0.003, i + seed) * amp * 0.4);
  }
  for (let i = 0; i < rows; i++) {
    const top = edges[i], bot = edges[i + 1], f = (i + 0.5) / rows;
    const rr = r(), base = mixHex(mixHex(PAL.young, PAL.green, rr * 0.6), mixHex(PAL.gold, PAL.goldDeep, rr * 0.5), clamp(ripe + (rr - 0.5) * 0.25));
    g.beginPath(); g.moveTo(x0, top(x0));
    for (let x = x0; x <= x1; x += 30) g.lineTo(x, top(x));
    for (let x = x1; x >= x0; x -= 30) g.lineTo(x, bot(x));
    g.closePath();
    const yy = top(540);
    g.fillStyle = vGrad(g, yy, bot(540), [lit(base, 0.25 - f * 0.1), base, dark(base, 0.12)]); g.fill();
    if (water > 0) { g.fillStyle = rgbaHex(sky, water * (0.55 - f * 0.25)); g.fill(); }
    // the riser (the earth wall dropping to the next step) and the bund's lit lip
    const rise = 10 + f * 46;
    g.beginPath(); for (let x = x0; x <= x1; x += 30) (x === x0 ? g.moveTo(x, bot(x) - rise) : g.lineTo(x, bot(x) - rise));
    for (let x = x1; x >= x0; x -= 30) g.lineTo(x, bot(x)); g.closePath();
    g.fillStyle = vGrad(g, bot(540) - rise, bot(540), [dark(base, 0.25), dark(PAL.bund, 0.35)]); g.fill();
    g.strokeStyle = rgbaHex(lit(base, 0.55), 0.95); g.lineWidth = 3 + f * 7; g.beginPath();
    for (let x = x0; x <= x1; x += 30) (x === x0 ? g.moveTo(x, bot(x) - rise) : g.lineTo(x, bot(x) - rise)); g.stroke();
    // rows of plants catching the light (dabs)
    if (water < 0.9) {
      g.fillStyle = rgbaHex(lit(base, 0.35), 0.7);
      for (let k = 0; k < 26; k++) { const x = x0 + r() * (x1 - x0), v = r(); const y = lerp(top(x), bot(x), v); const s = (3 + f * 10); g.fillRect(x + Math.sin(t * 1.5 + k) * 2, y, s * 2.2, s * 0.8); }
    }
  }
  return edges;
}
/** Foreground rice stalks swaying (with drooping grain heads when ripe). Drawn back to front. */
export function riceStalks(g, t, { x0 = -100, x1 = 1180, y = 1920, h = 520, n = 70, ripe = 0.7, seed = 5, wind = 1 } = {}) {
  const r = mulberry32(seed);
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), hh = h * (0.6 + r() * 0.5), ph = r() * 6;
    const sway = (Math.sin(t * 1.6 * wind + x * 0.004 + ph) * 0.6 + noise.n2(t * 0.6, x * 0.01) * 0.4) * 50 * wind;
    const col = mixHex(mixHex(PAL.green, PAL.young, r()), PAL.gold, clamp(ripe + (r() - 0.5) * 0.3));
    const tx = x + sway, ty = y - hh;
    g.strokeStyle = col; g.lineWidth = 6 + r() * 4;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + sway * 0.2, y - hh * 0.6, tx, ty); g.stroke();
    // a leaf
    g.lineWidth = 5; g.strokeStyle = dark(col, 0.15); g.beginPath(); g.moveTo(x + sway * 0.1, y - hh * 0.35); g.quadraticCurveTo(x + (r() - 0.5) * 120, y - hh * 0.55, x + (r() - 0.5) * 200 + sway * 0.5, y - hh * 0.4); g.stroke();
    if (ripe > 0.3) { // drooping panicle of grains
      g.fillStyle = mixHex(PAL.gold, '#f6dc8a', r() * 0.5);
      const dir = sway > 0 ? 1 : -1;
      for (let k = 0; k < 7; k++) { const u = k / 6; g.beginPath(); g.ellipse(tx + dir * u * 40, ty + u * u * 90, 7, 11, dir * 0.5, 0, TAU); g.fill(); }
    }
  }
}

// ---------------- plants and things ----------------
/** Coconut palm that can grow (grow 0..1). */
export function palm(g, x, y, h, { grow = 1, t = 0, lean = 0.15, trunk = '#8a6a48', frond = '#4f8a3a' } = {}) {
  if (grow <= 0) return;
  const H = h * ease.outCubic(clamp(grow)), tx = x + lean * H, ty = y - H;
  g.strokeStyle = shadeGrad(g, x - 30, x + 30, trunk, 1); g.lineCap = 'round'; g.lineWidth = 26 * (0.5 + 0.5 * grow);
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + lean * H * 0.2, y - H * 0.5, tx, ty); g.stroke();
  const fr = clamp((grow - 0.4) / 0.6);
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i - 3.5) * 0.42 + Math.sin(t * 1.2 + i) * 0.05, L = h * 0.42 * fr;
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.6 + L * 0.35;
    g.strokeStyle = i % 2 ? frond : lit(frond, 0.15); g.lineWidth = 14;
    g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * L * 0.6, ty + Math.sin(a) * L * 0.6 - 30, ex, ey); g.stroke();
  }
  if (fr > 0.5) { g.fillStyle = '#6a8a2a'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(tx - 14 + k * 14, ty + 18, 13, 0, TAU); g.fill(); } }
}
/** A clump of bamboo culms that can grow. */
export function bamboo(g, x, y, h, { grow = 1, t = 0, n = 5, col = '#8fb04a' } = {}) {
  if (grow <= 0) return;
  for (let i = 0; i < n; i++) {
    const H = h * (0.75 + 0.25 * Math.sin(i * 2.3)) * ease.outCubic(clamp(grow * 1.2 - i * 0.05));
    const bx = x + (i - n / 2) * 26, bend = Math.sin(t * 1.1 + i) * 18 + (i - n / 2) * 30;
    g.strokeStyle = i % 2 ? col : dark(col, 0.2); g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(bx, y); g.quadraticCurveTo(bx + bend * 0.2, y - H * 0.5, bx + bend, y - H); g.stroke();
    g.fillStyle = dark(col, 0.35); for (let k = 1; k < 6; k++) { const u = k / 6; if (u * h > H) break; g.fillRect(bx + bend * u * u - 9, y - H * u, 18, 4); }
    g.fillStyle = '#6a9a3a'; for (let k = 0; k < 4; k++) { const u = 0.55 + k * 0.12; if (u * h > H) break; const lx = bx + bend * u * u, ly = y - H * u; g.beginPath(); g.ellipse(lx + 24, ly, 30, 7, 0.4, 0, TAU); g.ellipse(lx - 24, ly + 6, 30, 7, -0.4, 0, TAU); g.fill(); }
  }
}
/** A field hut (dangau) on stilts with a thatched roof. */
export function hut(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#5a4030'; for (const px of [-70, 70]) g.fillRect(px - 6, -120, 12, 120);
  g.fillStyle = '#b08a5a'; g.fillRect(-90, -125, 180, 16);
  g.fillStyle = '#c9a56a'; poly(g, [[-120, -120], [0, -230], [120, -120]]); g.fill();
  g.fillStyle = '#a07e4a'; poly(g, [[0, -230], [120, -120], [60, -120]]); g.fill();
  g.restore();
}
/** The serpent god Antaboga: a crowned naga coiled in a mountain pool. */
export function naga(g, x, y, s, t, { color = '#3f7a6a', belly = '#d8c27a', crown = '#e9c45a', light = -1, sorrow = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const sw = Math.sin(t * 1.2) * 12;
  // body: a thick S-curve rising out of the water
  const pts = [[-420, 140], [-260, 60 + sw], [-60, 120], [120, 40 - sw], [180, -140], [120, -320], [60, -420]];
  g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } g.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); };
  g.strokeStyle = dark(color, 0.25); g.lineWidth = 120; path(); g.stroke();
  g.strokeStyle = color; g.lineWidth = 100; path(); g.stroke();
  g.strokeStyle = lit(color, 0.25); g.lineWidth = 34; g.save(); g.translate(light * 22, -18); path(); g.stroke(); g.restore();
  g.strokeStyle = belly; g.lineWidth = 26; g.save(); g.translate(-light * 30, 20); path(); g.stroke(); g.restore();
  // head bowed in sorrow, facing left
  g.save(); g.translate(60, -440); g.rotate(-0.5 + 0.35 * sorrow);
  g.fillStyle = color; g.beginPath(); g.ellipse(-60, 0, 120, 64, 0, 0, TAU); g.fill();
  g.fillStyle = lit(color, 0.2); g.beginPath(); g.ellipse(-70, -20, 90, 30, 0, 0, TAU); g.fill();
  g.fillStyle = belly; g.beginPath(); g.ellipse(-120, 30, 70, 22, 0.1, 0, TAU); g.fill();
  g.fillStyle = '#1a2018'; g.beginPath(); g.ellipse(-90, -18, 13, 9, 0, 0, TAU); g.fill();
  // crown (jamang) and mane
  g.fillStyle = crown; poly(g, [[-40, -50], [-20, -150], [10, -70], [40, -170], [60, -60], [90, -130], [90, -40]]); g.fill();
  g.fillStyle = dark(crown, 0.3); g.fillRect(-40, -60, 130, 18);
  g.restore();
  g.restore();
}
/** A glowing egg that cracks open (crack 0..1) releasing light. */
export function egg(g, x, y, r, { crack = 0, glow = 1, t = 0 } = {}) {
  radial(g, x, y, r * 5, '#fff3c0', 0.6 * glow);
  g.fillStyle = vGrad(g, y - r * 1.3, y + r, ['#fffdf4', '#f6e4a8', '#d9b25a']);
  if (crack < 0.5) { g.beginPath(); g.ellipse(x, y, r, r * 1.3, 0, 0, TAU); g.fill(); }
  else { // two halves part
    const o = (crack - 0.5) * 2 * r * 0.8;
    g.beginPath(); g.ellipse(x - o, y + o * 0.2, r, r * 1.3, -0.3 * crack, 0, Math.PI); g.fill();
    g.beginPath(); g.ellipse(x + o * 0.6, y - o * 1.2, r, r * 1.3, 0.4 * crack, Math.PI, TAU); g.fill();
    radial(g, x, y, r * 3, '#ffffff', crack);
  }
  if (crack > 0.1 && crack < 0.6) { g.strokeStyle = '#9a7a3a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - r, y); for (let k = 0; k < 6; k++) g.lineTo(x - r + (k + 1) * r / 3, y + (k % 2 ? -14 : 12)); g.stroke(); }
}
/** A grave mound with a headstone pair and frangipani blossoms. */
export function grave(g, x, y, s = 1, { t = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = vGrad(g, -120, 20, ['#a0805a', '#6a4e34']); g.beginPath(); g.ellipse(0, 0, 260, 110, 0, Math.PI, TAU); g.fill();
  g.fillStyle = '#d8d0bc'; for (const px of [-200, 200]) { poly(g, [[px - 24, 0], [px - 24, -120], [px, -150], [px + 24, -120], [px + 24, 0]]); g.fill(); }
  const r = mulberry32(3);
  for (let i = 0; i < 16; i++) { const fx = (r() - 0.5) * 380, fy = -r() * 90; g.fillStyle = r() > 0.5 ? '#fff6e6' : '#f3d27a'; g.beginPath(); g.arc(fx, fy, 12, 0, TAU); g.fill(); }
  g.restore();
}
/** A bowl of steaming white rice. */
export function riceBowl(g, x, y, s, t, { grains = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(40,30,20,0.25)'; g.beginPath(); g.ellipse(0, 150, 330, 50, 0, 0, TAU); g.fill();
  // rice dome
  g.fillStyle = vGrad(g, -150, 40, ['#ffffff', '#f4efe2', '#d8d0bc']);
  g.beginPath(); g.ellipse(0, 0, 270 * (0.4 + 0.6 * grains), 140 * grains + 20, 0, Math.PI, TAU); g.fill();
  g.fillStyle = '#fffefa'; const r = mulberry32(2); for (let i = 0; i < 40 * grains; i++) { const a = r() * Math.PI, d = r(); g.beginPath(); g.ellipse(Math.cos(a) * 250 * d * (0.4 + 0.6 * grains), -Math.sin(a) * 120 * d * grains, 9, 5, r() * 3, 0, TAU); g.fill(); }
  // bowl
  g.fillStyle = shadeGrad(g, -300, 300, '#6a9ab8', -1, 1.2);
  g.beginPath(); g.moveTo(-300, 0); g.quadraticCurveTo(-280, 150, -110, 165); g.lineTo(110, 165); g.quadraticCurveTo(280, 150, 300, 0); g.closePath(); g.fill();
  g.fillStyle = '#eef4f6'; g.fillRect(-300, -6, 600, 16);
  g.strokeStyle = '#2f5a7a'; g.lineWidth = 8; g.beginPath(); g.moveTo(-250, 70); g.quadraticCurveTo(0, 110, 250, 70); g.stroke();
  // steam
  g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 22; g.lineCap = 'round';
  for (let k = 0; k < 3; k++) { const sx = -90 + k * 90, ph = t * 1.4 + k * 2; g.beginPath(); g.moveTo(sx, -160); g.bezierCurveTo(sx + Math.sin(ph) * 50, -260, sx - Math.sin(ph) * 50, -340, sx + Math.sin(ph + 1) * 40, -440 - (t * 30 % 40)); g.stroke(); }
  g.restore();
}

// ---------------- crisp text (2D layer above the paint) ----------------
/** Soft cream label with a thin green rule: names and places. */
export function label(ctx, text, x, y, { size = 40, alpha = 1, sub = null, subSize = 26 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `400 ${size}px 'DM Serif Display'`; ctx.letterSpacing = '3px';
  const w = ctx.measureText(text).width;
  let w2 = 0; if (sub) { ctx.font = `700 ${subSize}px 'Playfair Display'`; w2 = ctx.measureText(sub).width; }
  const W = Math.max(w, w2) + 80, H = size * 1.3 + (sub ? subSize * 1.5 : 0) + 18;
  ctx.shadowColor = 'rgba(40,50,20,0.35)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6;
  ctx.fillStyle = 'rgba(251,246,230,0.94)'; ctx.beginPath(); ctx.roundRect(x - W / 2, y - size * 0.85, W, H, H / 2.2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#7a9a4a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x - W / 2 + 7, y - size * 0.85 + 7, W - 14, H - 14, H / 2.6); ctx.stroke();
  ctx.font = `400 ${size}px 'DM Serif Display'`; ctx.letterSpacing = '3px'; ctx.fillStyle = '#2e3a22'; ctx.fillText(text, x, y + size * 0.05);
  if (sub) { ctx.font = `700 ${subSize}px 'Playfair Display'`; ctx.letterSpacing = '2px'; ctx.fillStyle = '#7a5a24'; ctx.fillText(sub, x, y + size * 0.62 + subSize * 0.55); }
  ctx.restore();
}
/** Big title in cream with a soft green-brown halo. */
export function title(ctx, text, x, y, { size = 110, alpha = 1, color = '#fffaf0' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `400 ${size}px 'DM Serif Display'`; ctx.letterSpacing = '4px';
  ctx.shadowColor = 'rgba(46,58,34,0.8)'; ctx.shadowBlur = size * 0.3;
  ctx.lineWidth = size * 0.07; ctx.strokeStyle = 'rgba(46,58,34,0.75)'; ctx.strokeText(text, x, y);
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
  dewi: { kebaya: '#4f8a3a', kain: '#e2b84a', motif: '#a8781a', skin: '#c48c5c', head: 'jamang', hat: '#f2cc5a', hair: '#1a120c', long: true, shoe: null, sash: '#f0a0a0' },
  dewa: { robe: '#efe2c4', sleeve: '#e6d6b2', belt: '#e9c45a', skin: '#b07a50', head: 'jamang', hat: '#e9c45a', hair: '#1a120c', beard: '#2a1a10', shoe: '#5a3a1a' },
  petani: { shirt: '#4a6a8a', kain: '#6a4a2e', motif: '#3a2818', skin: '#9a6440', head: 'caping', hat: '#dcbc7c', shoe: null },
  petaniW: { kebaya: '#d0583e', kain: '#4a2e1e', motif: '#2a180e', skin: '#a06a44', head: 'caping', hat: '#e2c486', hair: '#140c08', long: true, shoe: null },
  anak: { shirt: '#f2d04a', pants: '#3a5a8a', skin: '#a06a44', hair: '#140c08', head: 'bare', shoe: '#3a2a1a' },
};
const SH = (g, base, light, x0, x1, amt = 1) => shadeGrad(g, x0, x1, base, light, amt);
/** Painted contour: the darker edge a painter leaves around a form (fraction of the head unit). */
export const RIG = { edge: 0.05 };
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
