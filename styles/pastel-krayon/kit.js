// Maura Motion style kit: PASTEL & KRAYON (Soft Pastel / Wax Crayon on Textured Paper).
// Uses the Shorts Animator 'pastel' paint pass: chalky hatching, strong paper tooth, lively crayon boil.

import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { roundRect } from '/engine/lib/draw.js';

export const LOOK = {
  base: 'pastel',
  brush: 6,
  length: 4.4,
  layers: 3,
  swirl: 0.06,
  flow: 560,
  curve: 0.08,
  bristle: 0.95,
  impasto: 0.04,
  hueJitter: 0.08,
  valueJitter: 0.22,
  satJitter: 0.16,
  respect: 0.65,
  boil: 0.72,
  paper: 1.45,
  paperColor: '#f8f1e2',
  grain: 0.75,
  saturation: 0.95,
  contrast: 0.96,
  warmth: 0.28,
  vignette: 0.18,
  bloom: 0.1,
};

export const PAL = {
  paper: '#f8f1e2',
  nightTop: '#2b3558',
  nightLow: '#52628e',
  dawnTop: '#7ea8d8',
  dawnLow: '#f6d8ae',
  dayTop: '#8ec2e8',
  dayLow: '#f7ecd0',
  moon: '#fce89c',
  sun: '#f9c45a',
  coral: '#e87a68',
  yellow: '#f2c95c',
  mint: '#6eb88d',
  hillFar: '#6b7fa8',
  hillNear: '#4d6a58',
  hillDay: '#7eb36a',
  road: '#5c5868',
  carRed: '#d95b4f',
  ink: '#3a3042',
  cream: '#fff9ec',
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

export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));

export function sky(g, { mode = 'night' } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, 1400);
  if (mode === 'night') {
    gr.addColorStop(0, PAL.nightTop);
    gr.addColorStop(0.6, '#3d4c78');
    gr.addColorStop(1, '#7882a8');
  } else if (mode === 'rain') {
    gr.addColorStop(0, '#6a7c96');
    gr.addColorStop(0.55, '#9ab0c7');
    gr.addColorStop(1, '#e8dfc8');
  } else {
    gr.addColorStop(0, PAL.dayTop);
    gr.addColorStop(0.6, '#bfe0f2');
    gr.addColorStop(1, PAL.dayLow);
  }
  g.fillStyle = gr;
  g.fillRect(-300, -300, 1680, 2200);
}

export function stars(g, t, n = 28) {
  const r = mulberry32(42);
  g.save();
  for (let i = 0; i < n; i++) {
    const sx = 80 + r() * 920;
    const sy = 140 + r() * 680;
    const tw = 0.55 + 0.45 * Math.sin(t * 3 + i * 1.7);
    const sz = (5 + (i % 3) * 3) * tw;
    g.fillStyle = '#fce89c';
    g.beginPath();
    g.arc(sx, sy, sz, 0, TAU);
    g.fill();
  }
  g.restore();
}

export function moon(g, x, y, r = 95, { glow = 1 } = {}) {
  g.save();
  g.translate(x, y);
  if (glow > 0) {
    g.fillStyle = `rgba(252, 232, 156, ${0.28 * glow})`;
    g.beginPath();
    g.arc(0, 0, r * 1.65, 0, TAU);
    g.fill();
    g.fillStyle = `rgba(252, 232, 156, ${0.42 * glow})`;
    g.beginPath();
    g.arc(0, 0, r * 1.25, 0, TAU);
    g.fill();
  }
  g.fillStyle = PAL.moon;
  g.beginPath();
  g.arc(0, 0, r, 0, TAU);
  g.fill();

  // Gentle crayon craters & sleepy smile
  g.fillStyle = 'rgba(218, 182, 92, 0.45)';
  g.beginPath();
  g.arc(-r * 0.32, -r * 0.2, r * 0.16, 0, TAU);
  g.arc(r * 0.28, r * 0.22, r * 0.12, 0, TAU);
  g.fill();
  g.restore();
}

export function sun(g, x, y, r = 95, { t = 0 } = {}) {
  g.save();
  g.translate(x, y);
  g.fillStyle = 'rgba(249, 196, 90, 0.28)';
  g.beginPath();
  g.arc(0, 0, r * 1.55, 0, TAU);
  g.fill();

  g.strokeStyle = '#f4a83a';
  g.lineWidth = 10;
  g.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU + t * 0.35;
    g.beginPath();
    g.moveTo(Math.cos(a) * r * 1.15, Math.sin(a) * r * 1.15);
    g.lineTo(Math.cos(a) * r * 1.42, Math.sin(a) * r * 1.42);
    g.stroke();
  }

  g.fillStyle = PAL.sun;
  g.beginPath();
  g.arc(0, 0, r, 0, TAU);
  g.fill();
  g.restore();
}

export function clouds(g, t, { y = 460, n = 4, dark = false } = {}) {
  const col = dark ? '#8c99ad' : '#fcf6e8';
  for (let i = 0; i < n; i++) {
    const cx = ((i * 310 + t * 24) % 1300) - 110;
    const cy = y + (i % 2) * 65;
    g.save();
    g.translate(cx, cy);
    g.fillStyle = col;
    for (const [dx, dy, rad] of [
      [-65, 10, 42],
      [-20, -14, 54],
      [32, -8, 48],
      [75, 12, 38],
    ]) {
      g.beginPath();
      g.arc(dx, dy, rad, 0, TAU);
      g.fill();
    }
    g.restore();
  }
}

export function hills(g, { y = 1120, colFar = PAL.hillFar, colNear = PAL.hillNear } = {}) {
  g.save();
  g.fillStyle = colFar;
  g.beginPath();
  g.ellipse(280, y, 520, 220, 0, Math.PI, TAU);
  g.ellipse(820, y + 20, 560, 240, 0, Math.PI, TAU);
  g.fill();

  g.fillStyle = colNear;
  g.beginPath();
  g.ellipse(540, y + 140, 780, 240, 0, Math.PI, TAU);
  g.fill();
  g.fillRect(-200, y + 120, 1480, 700);
  g.restore();
}

export function road(g, { y = 1260, scroll = 0 } = {}) {
  g.save();
  g.fillStyle = PAL.road;
  g.fillRect(-200, y, 1480, 170);

  g.fillStyle = '#f2c95c';
  for (let i = -1; i < 8; i++) {
    const dx = ((i * 210 - (scroll % 210) + 210) % 1470) - 180;
    g.fillRect(dx, y + 76, 110, 18);
  }
  g.restore();
}

export function treeRow(g, { y = 1180, scroll = 0, n = 5, scale = 1 } = {}) {
  const span = 1500;
  for (let i = 0; i < n; i++) {
    const x = (((i * (span / n) - scroll) % span) + span) % span - 180;
    g.save();
    g.translate(x, y);
    g.scale(scale, scale);
    g.fillStyle = '#6e4c30';
    g.fillRect(-16, -90, 32, 95);
    g.fillStyle = '#527e56';
    g.beginPath();
    g.arc(0, -135, 65, 0, TAU);
    g.arc(-38, -105, 48, 0, TAU);
    g.arc(38, -105, 48, 0, TAU);
    g.fill();
    g.restore();
  }
}

export function houseRow(g, { y = 1160, scroll = 0, n = 3 } = {}) {
  const span = 1650;
  for (let i = 0; i < n; i++) {
    const x = (((i * (span / n) - scroll) % span) + span) % span - 220;
    g.save();
    g.translate(x, y);
    g.fillStyle = i % 2 === 0 ? '#e8d2a6' : '#d8c2a8';
    g.fillRect(-75, -95, 150, 95);
    g.fillStyle = '#c45b4a';
    g.beginPath();
    g.moveTo(-95, -95);
    g.lineTo(0, -165);
    g.lineTo(95, -95);
    g.closePath();
    g.fill();
    g.fillStyle = '#fce89c';
    g.fillRect(-45, -65, 34, 34);
    g.fillRect(12, -65, 34, 34);
    g.restore();
  }
}

export function familyCar(g, x, y, s = 1, { t = 0 } = {}) {
  const bounce = Math.sin(t * 9) * 4 * s;
  g.save();
  g.translate(x, y + bounce);
  g.scale(s, s);

  // Headlight warm beam
  g.fillStyle = 'rgba(252, 232, 156, 0.32)';
  g.beginPath();
  g.moveTo(175, -35);
  g.lineTo(440, -95);
  g.lineTo(440, 35);
  g.closePath();
  g.fill();

  // Car body
  g.fillStyle = PAL.carRed;
  roundRect(g, -185, -65, 370, 82, 26);
  g.fill();
  g.beginPath();
  g.moveTo(-125, -62);
  g.lineTo(-75, -135);
  g.lineTo(85, -135);
  g.lineTo(135, -62);
  g.closePath();
  g.fill();

  // Windows
  g.fillStyle = '#fce89c';
  g.beginPath();
  g.moveTo(-105, -66);
  g.lineTo(-65, -122);
  g.lineTo(-5, -122);
  g.lineTo(-5, -66);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(10, -66);
  g.lineTo(10, -122);
  g.lineTo(75, -122);
  g.lineTo(115, -66);
  g.closePath();
  g.fill();

  // Child silhouette in back window looking up at the moon
  g.fillStyle = '#3a3042';
  g.beginPath();
  g.arc(-52, -92, 20, 0, TAU);
  g.fill();

  // Wheels
  for (const wx of [-105, 105]) {
    g.fillStyle = '#2d2834';
    g.beginPath();
    g.arc(wx, 18, 38, 0, TAU);
    g.fill();
    g.fillStyle = '#d8d0c0';
    g.beginPath();
    g.arc(wx, 18, 16, 0, TAU);
    g.fill();
  }
  g.restore();
}

export function parallaxRays(g, { carX, carY, moonX, moonY, nearX, nearY }) {
  g.save();
  g.setLineDash([16, 14]);
  g.lineWidth = 6;
  // Sightline to Moon (almost parallel!)
  g.strokeStyle = '#fce89c';
  g.beginPath();
  g.moveTo(carX, carY - 90);
  g.lineTo(moonX, moonY);
  g.stroke();

  // Sightline to nearby tree/house (steep angle change!)
  if (nearX != null) {
    g.strokeStyle = '#e87a68';
    g.beginPath();
    g.moveTo(carX, carY - 90);
    g.lineTo(nearX, nearY);
    g.stroke();
  }
  g.restore();
}

export function rain(g, t, { n = 36 } = {}) {
  const r = mulberry32(99);
  g.save();
  g.strokeStyle = 'rgba(185, 215, 242, 0.78)';
  g.lineWidth = 5;
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const rx = (r() * 1160 - ((t * 140) % 1160) + 1160) % 1160 - 40;
    const ry = ((r() * 1300 + t * 520) % 1300) + 120;
    g.beginPath();
    g.moveTo(rx, ry);
    g.lineTo(rx - 18, ry + 52);
    g.stroke();
  }
  g.restore();
}

export function rainbow(g, x, y, r = 460, { prog = 1 } = {}) {
  const colors = ['#e85d56', '#f2994a', '#f5d056', '#6eb878', '#5fa4d8', '#6b6eb8', '#986bb8'];
  g.save();
  g.lineCap = 'round';
  const endAng = Math.PI + Math.PI * clamp(prog, 0, 1);
  colors.forEach((col, i) => {
    g.strokeStyle = col;
    g.lineWidth = 22;
    g.beginPath();
    g.arc(x, y, r - i * 22, Math.PI, endAng);
    g.stroke();
  });
  g.restore();
}

export function prismDrop(g, x, y, r = 185, { prog = 1 } = {}) {
  g.save();
  g.translate(x, y);
  // Giant water droplet
  g.fillStyle = 'rgba(155, 206, 240, 0.72)';
  g.strokeStyle = '#4f86b5';
  g.lineWidth = 8;
  g.beginPath();
  g.arc(0, 20, r, 0, Math.PI);
  g.bezierCurveTo(-r, -r * 0.4, -r * 0.35, -r * 1.1, 0, -r * 1.45);
  g.bezierCurveTo(r * 0.35, -r * 1.1, r, -r * 0.4, r, 20);
  g.closePath();
  g.fill();
  g.stroke();

  // Incoming white sunbeam
  g.strokeStyle = '#fff9ec';
  g.lineWidth = 16;
  g.beginPath();
  g.moveTo(-420, -190);
  g.lineTo(-r * 0.65, -40);
  g.stroke();

  // Internal refraction + reflection + outgoing spectrum
  if (prog > 0.15) {
    const spec = ['#e85d56', '#f2994a', '#f5d056', '#6eb878', '#5fa4d8', '#8a6bb8'];
    spec.forEach((c, i) => {
      const spread = (i - 2.5) * 14 * clamp((prog - 0.15) / 0.6, 0, 1);
      g.strokeStyle = c;
      g.lineWidth = 9;
      g.beginPath();
      g.moveTo(-r * 0.65, -40);
      g.lineTo(r * 0.78, 10 + spread * 0.7);
      if (prog > 0.45) {
        g.lineTo(-380, 210 + spread * 2.4);
      }
      g.stroke();
    });
  }
  g.restore();
}

export function childWithShadow(
  g,
  x,
  y,
  s = 1,
  { t = 0, shadowLen = 220, shadowDir = 1, shirt = '#e87a68' } = {}
) {
  g.save();
  g.translate(x, y);

  // Ground shadow
  g.fillStyle = 'rgba(42, 36, 56, 0.42)';
  g.beginPath();
  g.ellipse(
    (shadowDir * shadowLen) / 2,
    78 * s,
    Math.max(42 * s, Math.abs(shadowLen) * 0.65),
    24 * s,
    0,
    0,
    TAU
  );
  g.fill();

  const b = Math.sin(t * 2.6) * 5 * s;
  g.translate(0, b);

  // Legs
  g.strokeStyle = '#3a3042';
  g.lineWidth = 12 * s;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-18 * s, 20 * s);
  g.lineTo(-22 * s, 75 * s);
  g.moveTo(18 * s, 20 * s);
  g.lineTo(22 * s, 75 * s);
  g.stroke();

  // Shirt / shorts
  g.fillStyle = '#4a6b96';
  roundRect(g, -34 * s, -5 * s, 68 * s, 42 * s, 12 * s);
  g.fill();
  g.fillStyle = shirt;
  roundRect(g, -38 * s, -78 * s, 76 * s, 82 * s, 18 * s);
  g.fill();

  // Head & hair
  g.fillStyle = '#f0c49a';
  g.beginPath();
  g.arc(0, -118 * s, 36 * s, 0, TAU);
  g.fill();
  g.fillStyle = '#362620';
  g.beginPath();
  g.arc(0, -126 * s, 38 * s, Math.PI, TAU);
  g.fill();

  // Eyes & smile
  g.fillStyle = '#241a18';
  g.beginPath();
  g.arc(-12 * s, -116 * s, 4 * s, 0, TAU);
  g.arc(12 * s, -116 * s, 4 * s, 0, TAU);
  g.fill();
  g.strokeStyle = '#362620';
  g.lineWidth = 3.5 * s;
  g.beginPath();
  g.arc(0, -106 * s, 10 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  g.stroke();
  g.restore();
}

export function crayonBorder(ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgba(74, 58, 44, 0.55)';
  ctx.lineWidth = 8;
  roundRect(ctx, 42, 72, 996, 1776, 36);
  ctx.stroke();
  ctx.restore();
}

export function title(ctx, str, x, y, { a = 1, size = 48, sub = '' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a, 0, 1);

  const w = Math.max(480, Math.min(940, str.length * (size * 0.58) + 90));
  const h = sub ? size + 76 : size + 44;
  ctx.fillStyle = 'rgba(255, 249, 236, 0.92)';
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 26);
  ctx.fill();
  ctx.strokeStyle = '#e87a68';
  ctx.lineWidth = 6;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 26);
  ctx.stroke();

  ctx.fillStyle = '#3a3042';
  ctx.font = `800 ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, sub ? y - 14 : y);

  if (sub) {
    ctx.fillStyle = 'rgba(58, 48, 66, 0.8)';
    ctx.font = `600 ${Math.round(size * 0.55)}px system-ui, sans-serif`;
    ctx.fillText(sub, x, y + size * 0.52);
  }
  ctx.restore();
}

