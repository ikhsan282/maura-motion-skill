// Maura Motion style kit: LUKISAN MINYAK BERGERAK (moving oil painting).
// Every frame is drawn FLAT in design pixels (1080x1920) with modelled light (gradients that turn into tonal
// strokes), then repainted by the oil paint pass (AM.painter): swirling impasto strokes, deep colour, canvas
// weave, and a slow shimmer because a share of the strokes is laid again on every drawing.
// Signature moves: a living canvas in a gilded frame that the camera pushes into, a scene that is "painted in"
// stroke by stroke, chiaroscuro light, storm skies that churn, brass museum plaques for names and dates.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU, mixHex } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

/** The oil look: deeper and more dramatic than the shipped oil (bigger swirl, more impasto, darker corners). */
export const LOOK = {
  base: 'oil', brush: 14, length: 2.3, swirl: 0.45, curve: 0.55, bristle: 0.4, impasto: 0.8,
  hueJitter: 0.16, valueJitter: 0.2, satJitter: 0.3, respect: 0.9, boil: 0.45,
  paper: 0.75, grain: 0.45, saturation: 1.14, contrast: 1.1, warmth: 0.25, vignette: 0.42, bloom: 0.3,
};
export const PAL = {
  night: '#141826', umber: '#2a1a10', umberDeep: '#140c07', ochre: '#c98a3a', gold: '#e9b94f', goldDeep: '#8a5a1a',
  cream: '#efe4c8', white: '#f4eee0', sky: '#2c4a78', skyDeep: '#16233f', storm: '#3b3a4f', glow: '#f2a24a',
  crimson: '#7a1a18', wine: '#4a0f14', green: '#6f8a5a', navy: '#1a2440', skin: '#9a6440', skinEu: '#e2b08c',
  canvas: '#d8c9a8', wall: '#3a1416',
};

// ---------------- painter + camera ----------------
/** Create the painter for this look. Call in setup: const P = await K.painter(AM). */
export async function painter(AM, { scale = 0.55, overrides = {} } = {}) {
  let q = {}; try { const s = new URLSearchParams(location.search).get('lk'); if (s) q = JSON.parse(s); } catch (e) { /* none */ }
  return AM.painter({ ...LOOK, ...overrides, ...q }, { scale });
}
/** Set the flat canvas transform: design px (1080x1920) with a camera looking at world point (cx, cy) at zoom z. */
export function view(P, { x = 540, y = 960, z = 1, rot = 0 } = {}) {
  const s = P.W / 1080, g = P.g;
  g.setTransform(s, 0, 0, s, 0, 0);
  g.translate(540, 960); g.rotate(rot); g.scale(z, z); g.translate(-x, -y);
  return g;
}
/** Camera drift helper: interpolate two camera states by eased progress. */
export function drift(a, b, p, fn = ease.inOutSine) {
  const k = fn(clamp(p));
  const o = {}; for (const key of Object.keys(a)) o[key] = lerp(a[key], b[key] ?? a[key], k); return o;
}

// ---------------- colour helpers ----------------
export const mix = (a, b, t) => mixHex(a, b, t);
const lit = (c, k = 0.25) => mixHex(c, '#fff4dc', k);
const dark = (c, k = 0.45) => mixHex(c, '#120a06', k);
/** Horizontal light gradient across [x0,x1] (local coords). light: -1 from the left, +1 from the right. */
function shadeGrad(g, x0, x1, base, light, amt = 1) {
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  const a = lit(base, 0.22 * amt), b = base, c = dark(base, 0.42 * amt);
  if (light < 0) { gr.addColorStop(0, a); gr.addColorStop(0.45, b); gr.addColorStop(1, c); }
  else { gr.addColorStop(0, c); gr.addColorStop(0.55, b); gr.addColorStop(1, a); }
  return gr;
}
function vGrad(g, y0, y1, stops) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => gr.addColorStop(i / (stops.length - 1), c));
  return gr;
}
export function radial(g, x, y, r, col, a = 1) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgbaHex(col, a)); gr.addColorStop(1, rgbaHex(col, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}
export function rgbaHex(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
export function poly(g, pts, fill) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } }
export function smooth(g, pts, fill) {
  g.beginPath(); const n = pts.length;
  g.moveTo((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2);
  for (let i = 1; i <= n; i++) { const a = pts[i % n], b = pts[(i + 1) % n]; g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
  g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); }
}

// ---------------- skies and land ----------------
/** One painted cumulus mass: billowing circles, lit tops toward the light, a flat shadowed base. */
export function cloudMass(g, x, y, w, h, { lit: lc = '#f2c28a', mid = '#9a7a8a', shade = '#4a4058', light = -1, seed = 1, t = 0 } = {}) {
  const r = mulberry32(seed), n = 9 + (r() * 5 | 0), B = [];
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1), bx = x + (f - 0.5) * w * 0.9 + (r() - 0.5) * w * 0.12;
    const dome = Math.sin(f * Math.PI);
    const br = h * (0.32 + 0.38 * dome) * (0.8 + r() * 0.4);
    B.push([bx + Math.sin(t * 0.4 + i) * 3, y - dome * h * 0.35 - r() * h * 0.15, br]);
  }
  const blob = (dx, dy, k, col) => { g.fillStyle = col; g.beginPath(); for (const [bx, by, br] of B) { g.moveTo(bx + dx + br * k, by + dy); g.arc(bx + dx, by + dy, br * k, 0, TAU); } g.fill(); };
  g.save(); g.beginPath(); g.rect(x - w, y - h * 3, w * 2, h * 3 + h * 0.28); g.clip(); // flat base
  blob(0, 0, 1, shade);
  blob(light * h * 0.08, -h * 0.12, 0.88, mid);
  blob(light * h * 0.2, -h * 0.26, 0.62, lc);
  g.restore();
}
/** A painted sky: gradient to a glowing horizon with cloud masses that drift (y0..y1 world rect, x0..x1). */
export function stormSky(g, t, { x0 = -400, x1 = 1480, y0 = -200, y1 = 1100, top = PAL.skyDeep, mid = PAL.sky, glow = PAL.glow, horizon = 0.78, clouds = 7, cloud = '#3c3e58', cloudLit = '#e8a86a', cloudMid = null, seed = 3, speed = 1, light = -1, size = 1 } = {}) {
  g.fillStyle = vGrad(g, y0, y1, [top, mid, mixHex(mid, glow, 0.55), glow, mixHex(glow, '#ffe2a8', 0.5)]);
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
  radial(g, x0 + (x1 - x0) * (light < 0 ? 0.25 : 0.75), y0 + (y1 - y0) * 0.85, (y1 - y0) * 0.7, glow, 0.35);
  const r = mulberry32(seed), W = x1 - x0, H = y1 - y0;
  const list = [];
  for (let i = 0; i < clouds; i++) {
    const fy = 0.08 + Math.pow(r(), 1.2) * horizon * 0.85, w = (380 + r() * 520) * (1.15 - fy * 0.6) * size;
    const cx = x0 - 300 + (((r() * 1.3) * W + t * 10 * speed * (0.6 + r())) % (W + 600));
    list.push([fy, cx, w, r()]);
  }
  list.sort((a, b) => a[0] - b[0]);
  for (const [fy, cx, w, rr] of list) {
    const k = fy / horizon; // lower clouds catch more of the glow
    cloudMass(g, cx, y0 + fy * H, w, w * 0.32, { lit: mixHex(cloudLit, '#fff0d0', 0.2 * k), mid: cloudMid || mixHex(cloud, cloudLit, 0.3 + 0.35 * k), shade: mixHex(cloud, top, 0.2), light, seed: (rr * 1e6) | 0, t });
  }
}
/** Volcano / mountain range silhouette with a lit flank. */
export function mountains(g, { x0 = -300, x1 = 1400, y = 900, peaks = [[300, 520, 380], [820, 600, 300]], color = '#3a3a55', light = -1, haze = null } = {}) {
  for (const [px, py, w] of peaks) {
    g.fillStyle = color;
    g.beginPath(); g.moveTo(px - w * 1.6, y + 40);
    g.quadraticCurveTo(px - w * 0.6, py + (y - py) * 0.35, px - w * 0.12, py + 6); g.lineTo(px + w * 0.12, py);
    g.quadraticCurveTo(px + w * 0.6, py + (y - py) * 0.35, px + w * 1.6, y + 40); g.closePath(); g.fill();
    // lit flank
    g.fillStyle = lit(color, 0.18);
    g.beginPath(); const s = light < 0 ? -1 : 1;
    g.moveTo(px + s * w * 0.1, py + 4); g.quadraticCurveTo(px + s * w * 0.55, py + (y - py) * 0.35, px + s * w * 1.5, y + 40); g.lineTo(px + s * w * 0.4, y + 40); g.quadraticCurveTo(px + s * w * 0.2, py + (y - py) * 0.5, px + s * w * 0.1, py + 4); g.fill();
  }
  if (haze) { g.fillStyle = vGrad(g, y - 160, y + 40, [rgbaHex(haze, 0), rgbaHex(haze, 0.7)]); g.fillRect(x0, y - 160, x1 - x0, 200); }
}
/** Rolling land / foliage band. */
export function hills(g, { x0 = -300, x1 = 1400, y = 1000, amp = 40, color = '#2e3b25', seed = 1, to = 2400 } = {}) {
  g.fillStyle = color; g.beginPath(); g.moveTo(x0, to);
  for (let x = x0; x <= x1; x += 30) g.lineTo(x, y - amp * (0.5 + 0.5 * noise.n2(x * 0.004, seed)) - amp * 0.3 * Math.abs(Math.sin(x * 0.03 + seed)));
  g.lineTo(x1, to); g.closePath(); g.fill();
}
/** Round tropical tree clumps (banyan / kenari). */
export function treeClump(g, x, y, s = 1, { color = '#2c3f26', lit: lc = '#56703a', light = -1, trunk = '#2a1c12' } = {}) {
  g.fillStyle = trunk; g.fillRect(x - 10 * s, y - 120 * s, 20 * s, 120 * s);
  const blobs = [[0, -200, 120], [-90, -160, 90], [90, -150, 95], [-40, -280, 85], [50, -270, 90]];
  g.fillStyle = color; g.beginPath(); for (const [bx, by, br] of blobs) { g.moveTo(x + bx * s + br * s, y + by * s); g.arc(x + bx * s, y + by * s, br * s, 0, TAU); } g.fill();
  g.fillStyle = lc; g.beginPath(); for (const [bx, by, br] of blobs) { const ox = light * 0.3 * br * s; g.moveTo(x + bx * s + ox + br * 0.6 * s, y + by * s - br * 0.25 * s); g.arc(x + bx * s + ox, y + by * s - br * 0.25 * s, br * 0.6 * s, 0, TAU); } g.fill();
}

// ---------------- architecture ----------------
/** Neoclassical colonial residence (white columns, steps). Local: ground of the porch at y, centred at x. */
export function residence(g, x, y, { w = 900, h = 420, light = -1, wall = '#e6dcc4', roof = '#6a3a2a', steps = 4, stepH = 22, flag = 0, cols = 6, t = 0 } = {}) {
  const L = x - w / 2, R = x + w / 2, top = y - h;
  // roof (hip roof)
  poly(g, [[L - 40, top + 40], [L + w * 0.18, top - h * 0.35], [R - w * 0.18, top - h * 0.35], [R + 40, top + 40]], roof);
  poly(g, [[L - 40, top + 40], [R + 40, top + 40], [R + 40, top + 62], [L - 40, top + 62]], dark(roof, 0.3));
  // back wall in shade (porch is deep)
  g.fillStyle = dark(wall, 0.38); g.fillRect(L, top + 62, w, h - 62);
  // door and windows (dark)
  g.fillStyle = dark(wall, 0.75);
  g.fillRect(x - 55, y - 230, 110, 230);
  for (const wx of [L + w * 0.18, R - w * 0.18]) g.fillRect(wx - 40, y - 210, 80, 140);
  // entablature
  g.fillStyle = shadeGrad(g, L, R, wall, light, 0.6); g.fillRect(L - 20, top + 50, w + 40, 46);
  // columns with modelled shading
  for (let i = 0; i < cols; i++) {
    const cx = L + 30 + (i * (w - 60)) / (cols - 1), cw = 44;
    g.fillStyle = shadeGrad(g, cx - cw / 2, cx + cw / 2, wall, light, 1.2); g.fillRect(cx - cw / 2, top + 96, cw, h - 96);
    g.fillStyle = lit(wall, 0.2); g.fillRect(cx - cw / 2 - 8, top + 92, cw + 16, 12); g.fillRect(cx - cw / 2 - 8, y - 14, cw + 16, 14);
  }
  // steps, each lit on the tread and dark on the riser
  for (let i = 0; i < steps; i++) {
    const sy = y + i * stepH, ext = 40 + i * 50;
    g.fillStyle = lit(wall, 0.05); g.fillRect(L - ext, sy, w + ext * 2, stepH * 0.35);
    g.fillStyle = dark(wall, 0.3); g.fillRect(L - ext, sy + stepH * 0.35, w + ext * 2, stepH * 0.65);
  }
  if (flag) { // flagpole on the roof, flag (plain tricolour bands, not a logo)
    const fx = x + w * 0.3, fy = top - h * 0.35;
    g.fillStyle = '#2a2220'; g.fillRect(fx - 3, fy - 220, 6, 220);
    const wv = (k) => Math.sin(t * 3 + k * 2) * 8;
    ['#a8262a', '#f0ece2', '#2a3f8a'].forEach((c, k) => { poly(g, [[fx + 3, fy - 215 + k * 26], [fx + 120, fy - 210 + k * 26 + wv(k)], [fx + 120, fy - 184 + k * 26 + wv(k + 1)], [fx + 3, fy - 189 + k * 26]], c); });
  }
}
/** Plain flight of stairs across a width (for compositions). */
export function stairs(g, x0, x1, y, { n = 5, h = 26, color = '#cbbfa6', light = -1, recede = 30 } = {}) {
  for (let i = 0; i < n; i++) {
    const sy = y + i * h;
    g.fillStyle = lit(color, 0.08); g.fillRect(x0 - i * recede, sy, x1 - x0 + i * recede * 2, h * 0.4);
    g.fillStyle = dark(color, 0.32); g.fillRect(x0 - i * recede, sy + h * 0.4, x1 - x0 + i * recede * 2, h * 0.6);
  }
}

// ---------------- vehicles and animals ----------------
/** Horse, side view, facing right. Hooves at (x, y); h = height at withers ~ 0.62*s*... s=1 is ~ 330px tall. phase walks the legs. */
export function horse(g, x, y, { s = 1, face = 1, phase = 0, color = '#3a2418', mane = '#160d08', light = -1, gait = 'walk', headDown = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s * face, s);
  const L = light * face;
  const legs = [[95, 0], [70, 0.5], [-95, 0.25], [-120, 0.75]];
  const amp = gait === 'walk' ? 0.32 : 0.6;
  const leg = (lx, off, col) => {
    const p = (phase + off) % 1, a = Math.sin(p * TAU) * amp, bend = Math.max(0, Math.cos(p * TAU)) * (gait === 'walk' ? 0.5 : 1.0);
    const hx = lx, hy = -175, kx = hx + Math.sin(a) * 95, ky = hy + Math.cos(a) * 95;
    const fx = kx + Math.sin(a - bend * Math.sign(lx)) * 85, fy = Math.min(-6, ky + Math.cos(a - bend) * 85);
    g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = 26; g.beginPath(); g.moveTo(hx, hy); g.lineTo(kx, ky); g.stroke();
    g.lineWidth = 15; g.beginPath(); g.moveTo(kx, ky); g.lineTo(fx, fy); g.stroke();
    g.fillStyle = mane; g.beginPath(); g.ellipse(fx + 6, fy, 12, 8, 0, 0, TAU); g.fill();
  };
  // far legs darker
  leg(legs[1][0], legs[1][1], dark(color, 0.35)); leg(legs[3][0], legs[3][1], dark(color, 0.35));
  // body
  g.fillStyle = shadeGrad(g, -170, 190, color, -L * 0, 0.6);
  g.fillStyle = vGrad(g, -300, -150, [lit(color, 0.22), color, dark(color, 0.35)]);
  smooth(g, [[-160, -270], [-40, -290], [90, -285], [150, -300], [175, -250], [150, -175], [40, -165], [-90, -165], [-170, -190], [-185, -240]]);
  g.fill();
  // neck + head
  const hd = headDown * 60;
  g.fillStyle = vGrad(g, -420, -250, [lit(color, 0.25), color]);
  poly(g, [[110, -290], [150, -360 + hd * 0.4], [195, -410 + hd], [235, -395 + hd], [270, -330 + hd], [255, -315 + hd], [215, -350 + hd], [185, -270]]);
  g.fill();
  g.fillStyle = mane;
  poly(g, [[110, -290], [148, -365 + hd * 0.4], [190, -418 + hd], [180, -385 + hd * 0.6], [140, -320], [120, -285]]); g.fill();
  // tail
  g.strokeStyle = mane; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-180, -255); g.quadraticCurveTo(-230, -220 + Math.sin(phase * TAU) * 10, -215, -130); g.stroke();
  leg(legs[0][0], legs[0][1], color); leg(legs[2][0], legs[2][1], color);
  // ear and eye
  poly(g, [[200, -405 + hd], [205, -440 + hd], [215, -402 + hd]], mane);
  g.restore();
}
/** Closed carriage (kereta) with a big spoked wheel. Local ground y. */
export function carriage(g, x, y, { s = 1, face = 1, color = '#2a1a14', trim = PAL.gold, wheel = 0, light = -1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s * face, s);
  g.fillStyle = vGrad(g, -360, -130, [lit(color, 0.25), color, dark(color, 0.4)]);
  smooth(g, [[-170, -330], [130, -340], [170, -280], [160, -150], [-160, -140], [-190, -260]]); g.fill();
  g.fillStyle = dark(color, 0.6); g.fillRect(-100, -300, 90, 90); g.fillRect(20, -300, 90, 90);
  g.fillStyle = trim; g.fillRect(-175, -345, 350, 12); g.fillRect(-165, -160, 330, 8);
  for (const wx of [-120, 120]) {
    g.save(); g.translate(wx, -85); g.rotate(wheel);
    g.strokeStyle = '#1a100a'; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, 80, 0, TAU); g.stroke();
    g.lineWidth = 6; for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 78, Math.sin(a) * 78); g.stroke(); }
    g.restore();
  }
  g.restore();
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
  jubah: { robe: '#f1ebdc', sleeve: '#e6dcc6', sash: '#7f9d63', belt: '#e2b24a', head: 'turban', hat: '#a7bf8c', skin: '#8c5636', beard: '#1d130d', mustache: true, shoe: '#3a2a1a' },
  officer: { coat: '#1e2846', collar: '#7a1a1a', pants: '#ebe6d8', boots: '#110c0a', epaulette: '#e9b94f', belt: '#efe9da', head: 'bicorne', hat: '#141018', skin: '#e3ab86', hair: '#8a6440', sideburn: true, tails: 0.55, buttons: '#e9b94f' },
  soldier: { coat: '#26325a', collar: '#eadfc4', pants: '#ddd6c6', boots: '#110c0a', belt: '#efe9da', head: 'shako', hat: '#141018', skin: '#dda07c', hair: '#5a3a24', tails: 0.35, hold: 'musket', buttons: '#cfc6b0' },
  abdi: { kain: '#5c3c26', motif: '#2c1a10', skin: '#8c5636', head: 'blangkon', hat: '#2c1d18', bare: true, shoe: null },
  abdiBaju: { shirt: '#2f2a3a', kain: '#5c3c26', motif: '#2c1a10', skin: '#8c5636', head: 'blangkon', hat: '#2c1d18', shoe: null },
  putri: { kebaya: '#e0cfaa', kain: '#4a2a1e', motif: '#2a140c', skin: '#9a6440', head: 'konde', hair: '#120c08', long: true, shoe: null },
  pelukis: { coat: '#2b2723', pants: '#5f5244', boots: '#151010', vest: '#7a2a20', skin: '#e3b08c', hair: '#c9a46a', head: 'bare', tails: 0.5, cravat: '#efe9da' },
  saleh: { coat: '#1a2340', collar: '#e9b94f', pants: '#3e2a1e', boots: '#151010', skin: '#9a6440', head: 'destar', hat: '#3a2a1a', hair: '#120c08', tails: 0.4, braid: '#e9b94f', buttons: '#e9b94f', mustache: true },
  raja: { coat: '#1b2236', collar: '#7a1a1a', pants: '#e9e4d6', boots: '#120c0a', epaulette: '#e9b94f', sashCol: '#d8782a', skin: '#e3b08c', hair: '#6a4a30', head: 'bare', tails: 0.5, beard: '#6a4a30', buttons: '#e9b94f', star: true },
  modern: { shirt: '#3a5a7a', pants: '#2a2a32', boots: '#1a1414', skin: '#8c5636', hair: '#140c08', head: 'bare' },
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

// ---------------- the two paintings (composition reused at every zoom) ----------------
// Painting coords: 1600 x 1000. Everyone stands on the Residency terrace at y ~ 800.
export const CANVAS = { W: 1600, H: 1000 };
/** Cast of Raden Saleh's version, so scenes can find heads and hands. [x, y, h, costume, face, pose] */
export const SALEH_CAST = {
  off1: [380, 800, 330, 'officer', 1, { armF: [0.1, 0.2], armB: [-0.05, 0.1], head: 0.04 }],
  off2: [480, 806, 345, 'officer', 1, { armF: [0.35, 1.2], armB: [-0.05, 0.1], head: -0.02 }],
  sold: [575, 796, 335, 'soldier', 1, { armF: [0.1, 0.25] }],
  dekock: [700, 802, 385, 'officer', -1, { armF: [1.5, 0.1], armB: [-0.05, 0.15], head: -0.03 }],
  dipo: [850, 804, 405, 'jubah', -1, { armF: [0.15, -0.2], armB: [-0.1, 0.3], lean: -0.04 }],
  putri: [960, 868, 300, 'putri', -1, { kneel: 1, bow: 0.5, armF: [1.75, 0.15], armB: [1.3, 0.4] }],
  son: [1040, 806, 370, 'abdiBaju', -1, { head: 0.3, armF: [0.25, 1.7], armB: [0.2, 1.4] }],
  f2: [1150, 800, 352, 'abdi', -1, { head: 0.22, armF: [0.1, 0.1] }],
  self: [1265, 838, 335, 'saleh', -1, { bow: 0.5, head: 0.15, armF: [0.55, 0.9], armB: [0.45, 0.7] }],
  f4: [1385, 806, 348, 'abdi', -1, { head: 0.42, armF: [1.0, 2.0], armB: [0.2, 0.3] }],
  f5: [1505, 815, 340, 'abdiBaju', -1, { head: 0.2, armF: [0.15, 0.3] }],
  kneel1: [1185, 965, 330, 'abdi', -1, { kneel: 1, bow: 0.85, armF: [1.5, 0.3], armB: [1.3, 0.4] }],
  guard: [520, 975, 330, 'soldier', 1, { armF: [0.1, 0.2] }],
};
export function castFig(id, extra = {}) {
  const [x, y, h, costume, face, pose] = SALEH_CAST[id];
  return { x, y, h, costume, face, ...extra, pose: { ...pose, ...(extra.pose || {}) } };
}
/** Raden Saleh's version (1857): storm sky with an orange horizon, Diponegoro upright and level with De Kock,
 *  followers grieving at his feet, the Dutch officers with heads a touch too large.
 *  o: { headBig, chin, react 0..1 (fist + anger), highlightSelf 0..1 } */
export function salehPainting(g, t, { headBig = 1.16, chin = -0.16, react = 0, highlightSelf = 0, light = -1 } = {}) {
  stormSky(g, t, { x0: 0, x1: 1600, y0: 0, y1: 780, horizon: 0.72, top: '#121829', mid: '#2b4064', glow: '#e88c40', cloud: '#22243a', cloudLit: '#e09a5a', seed: 7, clouds: 8, light, size: 0.9 });
  mountains(g, { y: 660, peaks: [[1260, 400, 300], [1520, 480, 200]], color: '#34365a', light, haze: '#d8935a' });
  hills(g, { x0: 0, x1: 1600, y: 700, amp: 40, color: '#1f281d', seed: 2 });
  treeClump(g, 1480, 700, 0.9, { color: '#1c2619', lit: '#3f5230' });
  residence(g, 300, 650, { w: 680, h: 400, light, steps: 0, wall: '#b8aa8c', roof: '#4a2a20' });
  g.fillStyle = vGrad(g, 650, 1000, ['#b7a684', '#8a7756', '#4a3a28']); g.fillRect(0, 650, 1600, 350);
  radial(g, 820, 820, 520, '#ffd9a0', 0.28);
  stairs(g, 0, 1600, 860, { n: 4, h: 38, color: '#9c8b6c', recede: 0 });
  carriage(g, 110, 790, { s: 0.72, face: 1 });
  horse(g, 290, 800, { s: 0.6, phase: 0.1, headDown: 0.3, color: '#2e1c12' });
  const F = (id, extra) => figure(g, { ...castFig(id, extra), light, t: t + id.length });
  F('off1', { headScale: headBig }); F('off2', { headScale: headBig }); F('sold', { headScale: headBig });
  F('dekock', { headScale: headBig * 1.03, pose: { armF: [1.5 + Math.sin(t * 0.8) * 0.05, 0.1] } });
  // Diponegoro: upright, chin raised, holding back his anger; a light falls on him
  radial(g, 850, 560, 300, '#fff0c8', 0.22);
  F('dipo', { mood: 0.6 + react * 0.4, pose: { head: chin, armF: [0.15 + react * 0.25, -0.2 - react * 0.5], fist: react } });
  F('putri', { pose: { armF: [1.75 + Math.sin(t * 1.3) * 0.08, 0.15] } });
  F('son', { mood: -0.8 }); F('f2', { mood: -0.6 });
  if (highlightSelf > 0) { const [hx, hy] = headPos(castFig('self')); radial(g, hx, hy + 40, 280, '#ffe2a0', 0.55 * highlightSelf); }
  F('self', { mood: -0.6 }); F('f4', { mood: -1 }); F('f5', { mood: -0.5 });
  F('kneel1'); F('guard', { headScale: headBig });
}
/** Nicolaas Pieneman's version (c. 1835): bright clear day, De Kock high on the porch steps pointing to the
 *  carriage, Diponegoro lower down, head bowed. o: { bowHead } */
export const PIENEMAN_CAST = {
  dekock: [1000, 600, 380, 'officer', -1, { armF: [1.55, 0.0], armB: [-0.05, 0.2], head: -0.06 }],
  dipo: [700, 846, 395, 'jubah', 1, { armF: [0.4, 0.3], armB: [0.25, 0.2], lean: 0.1 }],
};
export function pienemanPainting(g, t, { bowHead = 0.5, light = 1 } = {}) {
  g.fillStyle = vGrad(g, 0, 700, ['#5f8fc4', '#9fc0de', '#e9e4cf']); g.fillRect(0, 0, 1600, 700);
  for (const [cx, cy, w, s] of [[300, 170, 420, 3], [950, 120, 520, 4], [1400, 250, 360, 5]]) cloudMass(g, cx + t * 4, cy, w, w * 0.28, { lit: '#ffffff', mid: '#e8ecef', shade: '#b9c4d2', light, seed: s, t });
  mountains(g, { y: 600, peaks: [[400, 400, 260], [700, 450, 200]], color: '#7d8fa8', light, haze: '#dfe4e2' });
  hills(g, { x0: 0, x1: 1600, y: 640, amp: 30, color: '#5d7048', seed: 5 });
  residence(g, 1200, 560, { w: 760, h: 360, light, steps: 0, flag: 1, t, wall: '#f2ecdc', roof: '#7a4a32' });
  g.fillStyle = vGrad(g, 560, 1000, ['#ddd3ba', '#bfb193', '#948669']); g.fillRect(0, 560, 1600, 440);
  for (let i = 0; i < 7; i++) { const sy = 560 + i * 40, x0 = 780 - i * 40; g.fillStyle = '#ece5d2'; g.fillRect(x0, sy, 900, 15); g.fillStyle = '#b8ab8e'; g.fillRect(x0, sy + 15, 900, 25); }
  carriage(g, 240, 880, { s: 0.8, face: -1, color: '#3a2a20' });
  horse(g, 70, 890, { s: 0.6, face: -1, phase: 0.3, color: '#6a4a2e' });
  const F = (id, extra = {}) => { const [x, y, h, costume, face, pose] = PIENEMAN_CAST[id]; figure(g, { x, y, h, costume, face, light, t, ...extra, pose: { ...pose, ...(extra.pose || {}) } }); };
  F('dekock', { pose: { armF: [1.55 + Math.sin(t) * 0.05, 0.0] } });
  figure(g, { x: 1120, y: 590, h: 370, face: -1, costume: 'officer', light, t: t + 1, pose: { armF: [0.2, 0.3] } });
  figure(g, { x: 1240, y: 585, h: 370, face: -1, costume: 'soldier', light, t: t + 2, pose: { armF: [0.1, 0.2] } });
  F('dipo', { mood: -1, pose: { head: bowHead } });
  figure(g, { x: 590, y: 890, h: 330, face: 1, costume: 'abdi', light, t, pose: { kneel: 1, bow: 0.45, armF: [0.9, 0.6] } });
  figure(g, { x: 470, y: 868, h: 350, face: 1, costume: 'abdi', light, t: t + 3, mood: -1, pose: { head: 0.3 } });
}

// ---------------- museum, frames, studio ----------------
/** Dark museum wall (damask-red) with a soft spotlight pool. Draws in world coords over a rect. */
export function museumWall(g, { x0 = -600, x1 = 1680, y0 = -600, y1 = 2600, col = PAL.wall, spot = [540, 900, 900], a = 0.5 } = {}) {
  g.fillStyle = col; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.fillStyle = dark(col, 0.12); for (let x = x0; x < x1; x += 140) g.fillRect(x, y0, 60, y1 - y0); // damask stripes
  radial(g, spot[0], spot[1], spot[2], '#ffcf8a', a);
}
/** Gilded frame around rect (x, y, w, h), with modelled ornament. */
export function goldFrame(g, x, y, w, h, { b = 60, light = -1 } = {}) {
  const ring = (inset, col) => { g.fillStyle = col; g.fillRect(x - b + inset, y - b + inset, w + (b - inset) * 2, h + (b - inset) * 2); };
  ring(0, PAL.goldDeep); ring(b * 0.12, '#c99a3e'); ring(b * 0.35, '#7a4e18'); ring(b * 0.5, '#e8c46a'); ring(b * 0.78, '#6a4212');
  // lit top-left edges, dark bottom-right
  g.fillStyle = 'rgba(255,240,190,0.45)'; g.fillRect(x - b, y - b, w + 2 * b, b * 0.18); g.fillRect(x - b, y - b, b * 0.18, h + 2 * b);
  g.fillStyle = 'rgba(30,15,5,0.45)'; g.fillRect(x - b, y + h + b * 0.82, w + 2 * b, b * 0.18); g.fillRect(x + w + b * 0.82, y - b, b * 0.18, h + 2 * b);
  // corner ornaments
  g.fillStyle = '#f2d27a'; for (const [cx, cy] of [[x - b * 0.5, y - b * 0.5], [x + w + b * 0.5, y - b * 0.5], [x - b * 0.5, y + h + b * 0.5], [x + w + b * 0.5, y + h + b * 0.5]]) { g.beginPath(); g.arc(cx, cy, b * 0.42, 0, TAU); g.fill(); }
  g.fillStyle = '#d9b358'; for (let i = 1; i < 6; i++) { g.beginPath(); g.ellipse(x + (w * i) / 6, y - b * 0.5, b * 0.3, b * 0.2, 0, 0, TAU); g.ellipse(x + (w * i) / 6, y + h + b * 0.5, b * 0.3, b * 0.2, 0, 0, TAU); g.fill(); }
}
/** Draw a painting composition fn(g) into the rect (x, y, w, h) of world space. */
export function hang(g, x, y, w, h, fn) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.translate(x, y); g.scale(w / CANVAS.W, h / CANVAS.H); fn(g); g.restore();
}
/** Painter's easel with a canvas on it; fn draws onto the canvas (in CANVAS coords). */
export function easel(g, x, y, { w = 520, h = 330, fn = null, wood = '#5a3a20', light = -1 } = {}) {
  g.strokeStyle = wood; g.lineWidth = 22; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - w * 0.42, y); g.lineTo(x - w * 0.05, y - h - 380); g.moveTo(x + w * 0.42, y); g.lineTo(x + w * 0.05, y - h - 380); g.moveTo(x, y - 40); g.lineTo(x, y - h - 400); g.stroke();
  g.lineWidth = 18; g.beginPath(); g.moveTo(x - w * 0.55, y - 330); g.lineTo(x + w * 0.55, y - 330); g.stroke();
  const cx = x - w / 2, cy = y - 330 - h;
  g.fillStyle = '#2a1a10'; g.fillRect(cx - 8, cy - 8, w + 16, h + 16);
  g.fillStyle = PAL.canvas; g.fillRect(cx, cy, w, h);
  if (fn) hang(g, cx, cy, w, h, fn);
  return [cx, cy, w, h];
}
/** "Being painted": shows what fn draws only where brush strokes have reached (p 0..1), over bare canvas. */
export function paintIn(P, g, p, fn, { seed = 3, n = 46, rect = [0, 0, 1080, 1920], base = PAL.canvas } = {}) {
  if (p >= 0.999) { fn(g); return; }
  const off = cached('lm-paintin-' + P.W, () => makeCanvas(P.W, P.H)), og = off.getContext('2d');
  og.setTransform(1, 0, 0, 1, 0, 0); og.globalCompositeOperation = 'source-over'; og.clearRect(0, 0, P.W, P.H);
  og.setTransform(g.getTransform());
  fn(og);
  // the mask: fat strokes laid in order
  og.globalCompositeOperation = 'destination-in';
  const [rx, ry, rw, rh] = rect, r = mulberry32(seed);
  og.fillStyle = '#000'; og.strokeStyle = '#000'; og.lineCap = 'round';
  og.beginPath();
  for (let i = 0; i < n; i++) {
    const k = clamp(p * n - i); if (k <= 0) { r(); r(); r(); r(); continue; }
    const sx = rx + r() * rw, sy = ry + r() * rh, ang = r() * 0.8 - 0.4, len = (0.25 + r() * 0.35) * rw;
    const ex = sx + Math.cos(ang) * len * k, ey = sy + Math.sin(ang) * len * k;
    og.moveTo(sx, sy); og.lineTo(ex, ey);
  }
  og.lineWidth = rw * 0.22; og.stroke();
  // and grow everything at the end so it fills completely
  if (p > 0.75) { const k = (p - 0.75) / 0.25; og.globalAlpha = k; og.fillRect(rx, ry, rw, rh); og.globalAlpha = 1; }
  og.globalCompositeOperation = 'source-over';
  g.save(); g.fillStyle = base; g.fillRect(rx, ry, rw, rh);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(off, 0, 0); g.restore();
}
/** Interior with a tall window (studio / hall). warm: 0 cool north light, 1 warm candle/sunset. */
export function studio(g, t, { warm = 0, window = [740, 380, 280, 620] } = {}) {
  const wall = warm ? '#3a2416' : '#3a3c44', floor = warm ? '#2a1a10' : '#2e2a28';
  g.fillStyle = vGrad(g, -200, 1500, [dark(wall, 0.3), wall, dark(wall, 0.2)]); g.fillRect(-400, -400, 1900, 1900);
  g.fillStyle = vGrad(g, 1400, 2300, [floor, dark(floor, 0.5)]); g.fillRect(-400, 1400, 1900, 1000);
  const [wx, wy, ww, wh] = window;
  const sky = warm ? ['#f6c27a', '#e0803a'] : ['#cfdbe6', '#9fb3c6'];
  g.fillStyle = vGrad(g, wy, wy + wh, sky); g.fillRect(wx, wy, ww, wh);
  g.fillStyle = dark(wall, 0.5); g.fillRect(wx + ww / 2 - 8, wy, 16, wh); g.fillRect(wx, wy + wh / 2 - 8, ww, 16);
  // light pool on the floor and a beam
  g.fillStyle = rgbaHex(warm ? '#ffcf8a' : '#dfe8f2', 0.16);
  poly(g, [[wx, wy], [wx + ww, wy], [wx + ww - 300, 1900], [wx - 700, 1900]]); g.fill();
  radial(g, wx + ww / 2, wy + wh / 2, 520, warm ? '#ffb060' : '#e8f0ff', 0.35);
}
/** Velvet drapes (palace hall). */
export function drapes(g, t, { x0 = -300, x1 = 1380, y0 = -200, h = 1500, col = '#6a0f16', folds = 9 } = {}) {
  for (let i = 0; i < folds; i++) {
    const fx = x0 + ((x1 - x0) * i) / folds, fw = (x1 - x0) / folds;
    const sw = Math.sin(t * 0.8 + i) * 6;
    const gr = g.createLinearGradient(fx, 0, fx + fw, 0);
    gr.addColorStop(0, dark(col, 0.5)); gr.addColorStop(0.45, lit(col, 0.15)); gr.addColorStop(1, dark(col, 0.45));
    g.fillStyle = gr; g.fillRect(fx + sw, y0, fw + 2, h);
  }
}

// ---------------- crisp text (2D layer above the paint) ----------------
/** Brass museum plaque: engraved dark text on a gilded plate. */
export function plaque(ctx, text, x, y, { size = 40, alpha = 1, sub = null, subSize = 26, font = 'Playfair Display' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px '${font}'`; ctx.letterSpacing = '4px';
  const w1 = ctx.measureText(text).width;
  let w2 = 0; if (sub) { ctx.font = `400 ${subSize}px '${font}'`; ctx.letterSpacing = '3px'; w2 = ctx.measureText(sub).width; }
  const w = Math.max(w1, w2) + 70, hh = size * 1.25 + (sub ? subSize * 1.4 : 0) + 30;
  const px = x - w / 2, py = y - size * 0.95;
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  const gr = ctx.createLinearGradient(0, py, 0, py + hh);
  gr.addColorStop(0, '#f7e2a0'); gr.addColorStop(0.45, '#d4a64a'); gr.addColorStop(1, '#8e6224');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(px, py, w, hh, 8); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#6a4515'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(px + 8, py + 8, w - 16, hh - 16, 5); ctx.stroke();
  for (const sx of [px + 18, px + w - 18]) { ctx.fillStyle = '#7a5520'; ctx.beginPath(); ctx.arc(sx, py + hh / 2, 5, 0, TAU); ctx.fill(); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${size}px '${font}'`; ctx.letterSpacing = '4px';
  ctx.fillStyle = 'rgba(255,245,210,0.6)'; ctx.fillText(text, x, py + 15 + size * 0.62 + 1.5);
  ctx.fillStyle = '#2a1806'; ctx.fillText(text, x, py + 15 + size * 0.62);
  if (sub) { ctx.font = `400 ${subSize}px '${font}'`; ctx.letterSpacing = '3px'; ctx.fillStyle = '#3a2408'; ctx.fillText(sub, x, py + 15 + size * 1.25 + subSize * 0.6); }
  ctx.restore();
}
/** Large title in painted-gold serif with a dark halo (reads over any paint). */
export function title(ctx, text, x, y, { size = 96, alpha = 1, color = '#f6e2a6', font = 'Playfair Display', weight = 700, spacing = 2, rot = 0 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `${weight} ${size}px '${font}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = spacing + 'px';
  ctx.shadowColor = 'rgba(10,5,0,0.85)'; ctx.shadowBlur = size * 0.35;
  ctx.lineWidth = size * 0.08; ctx.strokeStyle = 'rgba(20,10,4,0.9)'; ctx.strokeText(text, 0, 0);
  ctx.shadowBlur = 0;
  const gr = ctx.createLinearGradient(0, -size / 2, 0, size / 2);
  gr.addColorStop(0, '#fff6d6'); gr.addColorStop(0.55, color); gr.addColorStop(1, '#c08a3a');
  ctx.fillStyle = gr; ctx.fillText(text, 0, 0);
  ctx.restore();
}

export { ease, clamp, lerp, hrand, noise };
