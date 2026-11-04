// Maura Motion style kit: GOUACHE DONGENG (Storybook Gouache).
// Flat matte shapes, crisp edges, warm storybook palette, symmetric picture-book framing,
// rendered through the Shorts Animator 'gouache' paint pass (or direct 2D context).

import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const LOOK = {
  base: 'gouache',
  brush: 6,
  length: 2.2,
  layers: 2,
  swirl: 0.18,
  curve: 0.28,
  bristle: 0.35,
  impasto: 0.12,
  hueJitter: 0.04,
  valueJitter: 0.06,
  satJitter: 0.08,
  respect: 1,
  boil: 0.28,
  paper: 0.85,
  paperColor: '#f5e8cc',
  grain: 0.35,
  saturation: 1.06,
  contrast: 1.03,
  warmth: 0.12,
  vignette: 0.16,
  bloom: 0.06,
};

export const PAL = {
  paper: '#f3e6c8',
  paperWarm: '#ebdab4',
  ink: '#4a3220',
  red: '#c0392b',
  crimson: '#9e2a22',
  gold: '#d9a441',
  goldHi: '#f4ca64',
  leaf: '#5e8f4e',
  leafDark: '#3d6634',
  leafLight: '#8ab86e',
  sky: '#9fc3d8',
  skyDeep: '#5b84a8',
  sunset: '#e69568',
  river: '#4f8ca8',
  riverHi: '#8dc4d8',
  wood: '#8a5a33',
  woodDark: '#5e3a1e',
  cream: '#fbf3df',
  purple: '#6b4c7a',
};

export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };

export async function painter(AM, { scale = 0.55, overrides = {} } = {}) {
  return AM.painter({ ...LOOK, ...overrides }, { scale });
}

export function view(P, { x = 540, y = 960, z = 1, rot = 0 } = {}) {
  const s = P.W / 1080,
    g = P.g;
  g.setTransform(s, 0, 0, s, 0, 0);
  g.translate(540, 960);
  g.rotate(rot);
  g.scale(z, z);
  g.translate(-x, -y);
  return g;
}

export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, fy);
  ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-x, -y);
}

export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));

export function bg(ctx, t, { top = '#e8d7b4', mid = '#f3e6c8', low = '#dfc898' } = {}) {
  ctx.save();
  const gr = ctx.createLinearGradient(0, 0, 0, 1920);
  gr.addColorStop(0, top);
  gr.addColorStop(0.55, mid);
  gr.addColorStop(1, low);
  ctx.fillStyle = gr;
  ctx.fillRect(-400, -400, 1880, 2720);
  ctx.restore();
}

export function storybookArch(ctx, { color = '#4a3220', accent = '#d9a441' } = {}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  roundRect(ctx, 48, 80, 984, 1760, 42);
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  roundRect(ctx, 68, 100, 944, 1720, 32);
  ctx.stroke();

  // Corner floral stars
  for (const [cx, cy] of [
    [96, 128],
    [984, 128],
    [96, 1792],
    [984, 1792],
  ]) {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function title(ctx, str, x, y, { a = 1, size = 56, sub = '', color = '#4a3220' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a, 0, 1);

  // Warm storybook ribbon plaque
  const w = Math.max(460, Math.min(920, str.length * (size * 0.58) + 90));
  const h = sub ? size + 74 : size + 42;
  ctx.fillStyle = 'rgba(251, 243, 223, 0.92)';
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 22);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 5;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 22);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = `800 ${size}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, sub ? y - 14 : y);

  if (sub) {
    ctx.fillStyle = 'rgba(74,50,32,0.82)';
    ctx.font = `600 ${Math.round(size * 0.54)}px Georgia, serif`;
    ctx.fillText(sub, x, y + size * 0.52);
  }
  ctx.restore();
}

export function caption(ctx, str, x, y, { a = 1, size = 38 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a, 0, 1);
  ctx.fillStyle = 'rgba(74,50,32,0.85)';
  ctx.font = `700 ${size}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(str, x, y);
  ctx.restore();
}

export function sunMoon(ctx, x, y, r, { color = '#f4ca64', rays = 12, t = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = rgba(color, 0.25);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.45, 0, TAU);
  ctx.fill();

  for (let i = 0; i < rays; i++) {
    const ang = (i / rays) * TAU + t * 0.25;
    ctx.save();
    ctx.rotate(ang);
    ctx.fillStyle = rgba(color, 0.55);
    ctx.beginPath();
    ctx.moveTo(r * 1.05, -8);
    ctx.lineTo(r * 1.38, 0);
    ctx.lineTo(r * 1.05, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function cloud(ctx, x, y, s = 1, { color = '#fbf3df' } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  for (const [dx, dy, r] of [
    [-70, 10, 42],
    [-25, -12, 54],
    [30, -8, 48],
    [75, 12, 38],
  ]) {
    ctx.beginPath();
    ctx.arc(dx, dy, r, 0, TAU);
    ctx.fill();
  }
  ctx.fillRect(-70, 10, 145, 38);
  ctx.restore();
}

export function hill(ctx, x, y, w, h, col) {
  ctx.save();
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.ellipse(x, y, w, h, 0, Math.PI, TAU);
  ctx.fill();
  ctx.restore();
}

export function river(ctx, { y0 = 1050, y1 = 1580, t = 0, col = '#4f8ca8', hi = '#8dc4d8' } = {}) {
  ctx.save();
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-200, y0);
  ctx.bezierCurveTo(320, y0 - 40, 740, y0 + 50, 1280, y0 - 15);
  ctx.lineTo(1280, y1);
  ctx.bezierCurveTo(760, y1 + 40, 320, y1 - 30, -200, y1 + 20);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = hi;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const ry = lerp(y0 + 45, y1 - 45, (i + 0.5) / 6);
    const rx = ((i * 210 + t * 55) % 1100) - 50;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.quadraticCurveTo(rx + 60, ry - 12, rx + 120, ry);
    ctx.stroke();
  }
  ctx.restore();
}

export function tree(ctx, x, y, s = 1, { crown = '#5e8f4e', trunk = '#6e4726', t = 0 } = {}) {
  const sway = Math.sin(t * 1.6 + x * 0.01) * 5 * s;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = trunk;
  ctx.beginPath();
  ctx.moveTo(-18 * s, 0);
  ctx.lineTo(-12 * s + sway * 0.3, -150 * s);
  ctx.lineTo(12 * s + sway * 0.3, -150 * s);
  ctx.lineTo(18 * s, 0);
  ctx.closePath();
  ctx.fill();

  for (const [dx, dy, r, c] of [
    [-46, -165, 62, mixHex(crown, '#2c4c24', 0.2)],
    [46, -165, 62, mixHex(crown, '#2c4c24', 0.15)],
    [0, -210, 74, crown],
    [0, -155, 64, mixHex(crown, '#e8d798', 0.18)],
  ]) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(dx * s + sway, dy * s, r * s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function hut(ctx, x, y, s = 1, { t = 0, royal = false } = {}) {
  ctx.save();
  ctx.translate(x, y);
  if (royal) {
    // Pendopo / Kerajaan Kediri
    ctx.fillStyle = '#c8963e';
    ctx.fillRect(-160 * s, -90 * s, 320 * s, 150 * s);
    ctx.fillStyle = '#8c2d22';
    ctx.beginPath();
    ctx.moveTo(-200 * s, -90 * s);
    ctx.lineTo(-90 * s, -185 * s);
    ctx.lineTo(90 * s, -185 * s);
    ctx.lineTo(200 * s, -90 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-110 * s, -175 * s);
    ctx.lineTo(0, -245 * s);
    ctx.lineTo(110 * s, -175 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4a3220';
    for (const px of [-110, -45, 45, 110]) {
      ctx.fillRect((px - 8) * s, -90 * s, 16 * s, 150 * s);
    }
    ctx.fillStyle = '#3a2412';
    ctx.fillRect(-32 * s, -30 * s, 64 * s, 90 * s);
  } else {
    ctx.fillStyle = '#cfa878';
    ctx.fillRect(-110 * s, -75 * s, 220 * s, 135 * s);
    ctx.fillStyle = '#7a4b26';
    ctx.beginPath();
    ctx.moveTo(-145 * s, -75 * s);
    ctx.lineTo(0, -180 * s);
    ctx.lineTo(145 * s, -75 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4a2e16';
    ctx.fillRect(-30 * s, -15 * s, 60 * s, 75 * s);
    ctx.fillStyle = '#f4ca64';
    ctx.fillRect(-85 * s, -45 * s, 36 * s, 36 * s);
    ctx.fillRect(49 * s, -45 * s, 36 * s, 36 * s);
  }
  ctx.restore();
}

export function figure(
  ctx,
  x,
  y,
  s = 1,
  col = '#c0392b',
  { t = 0, hair = 'bun', crown = false, old = false, happy = true, carry = null } = {}
) {
  const b = Math.sin(t * 2.4 + x * 0.01) * 6 * s;
  ctx.save();
  ctx.translate(x, y + b);

  // Skirt / sarong
  ctx.fillStyle = '#5e3a1e';
  ctx.beginPath();
  ctx.moveTo(-36 * s, 5 * s);
  ctx.lineTo(36 * s, 5 * s);
  ctx.lineTo(48 * s, 85 * s);
  ctx.lineTo(-48 * s, 85 * s);
  ctx.closePath();
  ctx.fill();

  // Tunic / kebaya
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-38 * s, -82 * s);
  ctx.lineTo(38 * s, -82 * s);
  ctx.lineTo(46 * s, 18 * s);
  ctx.lineTo(-46 * s, 18 * s);
  ctx.closePath();
  ctx.fill();

  // Collar / sash accent
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(-12 * s, -82 * s, 24 * s, 96 * s);

  // Head
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath();
  ctx.arc(0, -122 * s, 35 * s, 0, TAU);
  ctx.fill();

  // Hair
  ctx.fillStyle = old ? '#c9c2b8' : '#261a14';
  ctx.beginPath();
  ctx.arc(0, -132 * s, 37 * s, Math.PI, TAU);
  ctx.fill();
  if (hair === 'bun') {
    ctx.beginPath();
    ctx.arc(0, -168 * s, 18 * s, 0, TAU);
    ctx.fill();
  }

  if (crown) {
    ctx.fillStyle = '#f4ca64';
    ctx.beginPath();
    ctx.moveTo(-26 * s, -155 * s);
    ctx.lineTo(-14 * s, -182 * s);
    ctx.lineTo(0, -164 * s);
    ctx.lineTo(14 * s, -186 * s);
    ctx.lineTo(26 * s, -155 * s);
    ctx.closePath();
    ctx.fill();
  }

  // Eyes & expression
  ctx.fillStyle = '#241a10';
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(sx * 12 * s, -122 * s, 4 * s, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  if (happy) {
    ctx.arc(0, -112 * s, 10 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  } else {
    ctx.arc(0, -102 * s, 10 * s, 1.15 * Math.PI, 1.85 * Math.PI);
  }
  ctx.stroke();

  if (carry === 'cloth') {
    ctx.fillStyle = '#fbf3df';
    ctx.beginPath();
    ctx.ellipse(42 * s, -45 * s, 26 * s, 18 * s, 0.2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function pumpkin(ctx, x, y, r, col, { t = 0, glowA = 1, open = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha *= glowA;
  if (glowA > 0.5 && col === '#d9a441') {
    ctx.fillStyle = 'rgba(244, 202, 100, 0.28)';
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.25, 0, TAU);
    ctx.fill();
  }
  for (const dx of [-0.5, 0, 0.5]) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(dx * r, 0, r * 0.55, r * 0.8, 0, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(74, 42, 14, 0.5)';
  ctx.lineWidth = 4;
  for (const dx of [-0.25, 0.25]) {
    ctx.beginPath();
    ctx.ellipse(dx * r, 0, r * 0.3, r * 0.72, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = '#5e8f4e';
  ctx.fillRect(-8, -r * 0.8 - 26, 16, 30);

  if (open > 0) {
    ctx.fillStyle = '#2a180c';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.1, r * 0.65 * open, r * 0.32 * open, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function treasure(ctx, x, y, s = 1, { t = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(244, 202, 100, 0.35)';
  ctx.beginPath();
  ctx.arc(0, -20 * s, 140 * s, 0, TAU);
  ctx.fill();

  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * TAU;
    const rad = (35 + (i % 3) * 28) * s;
    const cx = Math.cos(ang) * rad;
    const cy = Math.sin(ang) * rad * 0.55;
    ctx.fillStyle = i % 2 === 0 ? '#f4ca64' : '#d9a441';
    ctx.beginPath();
    ctx.arc(cx, cy, 18 * s, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function snakes(ctx, x, y, s = 1, { t = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  for (let i = -1; i <= 1; i++) {
    ctx.strokeStyle = i === 0 ? '#3a4e28' : '#523428';
    ctx.lineWidth = 14 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(i * 45 * s, 40 * s);
    for (let k = 1; k <= 5; k++) {
      const wave = Math.sin(t * 5 + k * 1.4 + i) * 28 * s;
      ctx.lineTo(i * 45 * s + wave, (40 - k * 32) * s);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function goldenSnail(ctx, x, y, s = 1, { t = 0, glow = 1 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  if (glow > 0) {
    ctx.fillStyle = `rgba(244, 202, 100, ${0.32 * glow})`;
    ctx.beginPath();
    ctx.arc(0, -20 * s, 110 * s, 0, TAU);
    ctx.fill();
  }
  // Soft snail body
  ctx.fillStyle = '#e6c27a';
  ctx.beginPath();
  ctx.ellipse(10 * s, 22 * s, 68 * s, 22 * s, 0, 0, TAU);
  ctx.fill();
  // Feelers
  ctx.strokeStyle = '#b88938';
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  ctx.moveTo(58 * s, 12 * s);
  ctx.lineTo(78 * s, -18 * s);
  ctx.moveTo(48 * s, 12 * s);
  ctx.lineTo(62 * s, -22 * s);
  ctx.stroke();

  // Golden spiral shell
  ctx.fillStyle = '#f4ca64';
  ctx.beginPath();
  ctx.arc(-10 * s, -12 * s, 52 * s, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#9e6b18';
  ctx.lineWidth = 5 * s;
  ctx.beginPath();
  for (let a = 0; a < TAU * 2.5; a += 0.2) {
    const r = (a / (TAU * 2.5)) * 46 * s;
    const px = -10 * s + Math.cos(a) * r;
    const py = -12 * s + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

export function kancil(ctx, x, y, s = 1, { t = 0, run = 0, face = 1 } = {}) {
  const hop = run > 0 ? Math.abs(Math.sin(t * 8)) * 22 * s * run : Math.sin(t * 2.5) * 4 * s;
  const legSwing = run > 0 ? Math.sin(t * 8) * 26 * s * run : 0;
  ctx.save();
  ctx.translate(x, y - hop);
  ctx.scale(face, 1);

  // Legs
  ctx.strokeStyle = '#7a4b26';
  ctx.lineWidth = 10 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-35 * s, 0);
  ctx.lineTo(-42 * s - legSwing, 58 * s);
  ctx.moveTo(-15 * s, 0);
  ctx.lineTo(-10 * s + legSwing * 0.7, 58 * s);
  ctx.moveTo(25 * s, 0);
  ctx.lineTo(32 * s + legSwing, 58 * s);
  ctx.moveTo(42 * s, 0);
  ctx.lineTo(48 * s - legSwing * 0.7, 58 * s);
  ctx.stroke();

  // Body
  ctx.fillStyle = '#b87638';
  ctx.beginPath();
  ctx.ellipse(0, -10 * s, 58 * s, 32 * s, 0, 0, TAU);
  ctx.fill();

  // White belly stripe
  ctx.fillStyle = '#f5e8cc';
  ctx.beginPath();
  ctx.ellipse(4 * s, 6 * s, 42 * s, 12 * s, 0, 0, TAU);
  ctx.fill();

  // Neck & Head
  ctx.fillStyle = '#b87638';
  ctx.beginPath();
  ctx.moveTo(32 * s, -22 * s);
  ctx.lineTo(54 * s, -72 * s);
  ctx.lineTo(74 * s, -62 * s);
  ctx.lineTo(52 * s, -8 * s);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(68 * s, -72 * s, 28 * s, 20 * s, -0.15, 0, TAU);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.ellipse(50 * s, -98 * s, 10 * s, 22 * s, -0.4, 0, TAU);
  ctx.ellipse(64 * s, -98 * s, 9 * s, 20 * s, -0.15, 0, TAU);
  ctx.fill();

  // Eye & Nose
  ctx.fillStyle = '#241a10';
  ctx.beginPath();
  ctx.arc(74 * s, -75 * s, 4.5 * s, 0, TAU);
  ctx.arc(94 * s, -72 * s, 5 * s, 0, TAU);
  ctx.fill();

  ctx.restore();
}
