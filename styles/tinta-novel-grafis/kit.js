// Maura Motion style kit: TINTA NOVEL GRAFIS (Graphic Novel Ink & Wash).
// Uses the Shorts Animator 'ink' paint pass: bold boiling ink outlines, flat dramatic washes, parchment paper.

import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { roundRect } from '/engine/lib/draw.js';

export const LOOK = {
  base: 'ink',
  mode: 'wash',
  wash: 0.52,
  bleed: 0.28,
  outline: 0.96,
  ink: '#1b1712',
  paper: 0.75,
  paperColor: '#f4efe3',
  grain: 0.32,
  boil: 0.9,
  posterize: 0,
  saturation: 0.92,
  contrast: 1.08,
  warmth: 0.12,
  vignette: 0.18,
  bloom: 0.04,
};

export const PAL = {
  paper: '#f4efe3',
  paperDark: '#e2d6be',
  ink: '#1b1712',
  charcoal: '#332c24',
  crimson: '#b83228',
  crimsonDark: '#7d1e18',
  gold: '#c9963b',
  goldLight: '#e8c468',
  indigo: '#2d4a68',
  indigoLight: '#587b9c',
  sage: '#5c7052',
  ochre: '#bf7c3a',
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

export const pop = (t, t0, dur = 0.4) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));

export function parchmentBg(g, { mood = 'warm' } = {}) {
  const gr = g.createLinearGradient(0, 0, 0, 1920);
  if (mood === 'crimson') {
    gr.addColorStop(0, '#c86448');
    gr.addColorStop(0.55, '#e6b88a');
    gr.addColorStop(1, '#d8c29d');
  } else if (mood === 'night') {
    gr.addColorStop(0, '#364963');
    gr.addColorStop(0.6, '#627994');
    gr.addColorStop(1, '#c9bea6');
  } else {
    gr.addColorStop(0, '#e6d7b8');
    gr.addColorStop(0.5, '#f4efe3');
    gr.addColorStop(1, '#dfd0b2');
  }
  g.fillStyle = gr;
  g.fillRect(-300, -300, 1680, 2520);
}

export function panelFrame(g, x, y, w, h, { fill = null, thick = 10 } = {}) {
  g.save();
  if (fill) {
    g.fillStyle = fill;
    g.fillRect(x, y, w, h);
  }
  g.strokeStyle = PAL.ink;
  g.lineWidth = thick;
  g.strokeRect(x, y, w, h);
  g.restore();
}

export function speedLines(g, cx, cy, { n = 32, r0 = 180, r1 = 920, t = 0, col = PAL.ink } = {}) {
  const r = mulberry32(13);
  g.save();
  g.translate(cx, cy);
  g.strokeStyle = col;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + Math.sin(t * 6 + i) * 0.015;
    const inner = r0 * (0.8 + r() * 0.45);
    g.lineWidth = 3 + (i % 3) * 2.5;
    g.beginPath();
    g.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
    g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    g.stroke();
  }
  g.restore();
}

export function inkSun(g, x, y, r = 140, { col = PAL.crimson } = {}) {
  g.save();
  g.fillStyle = col;
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
  g.strokeStyle = PAL.ink;
  g.lineWidth = 6;
  g.stroke();
  g.restore();
}

export function candiBentar(g, x, y, s = 1) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  for (const dir of [-1, 1]) {
    g.save();
    g.scale(dir, 1);
    g.fillStyle = '#9e4732';
    g.strokeStyle = PAL.ink;
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(95, 0);
    g.lineTo(95, -360);
    g.lineTo(135, -360);
    g.lineTo(135, -290);
    g.lineTo(185, -290);
    g.lineTo(185, -210);
    g.lineTo(235, -210);
    g.lineTo(235, -110);
    g.lineTo(280, -110);
    g.lineTo(280, 0);
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();
  }
  g.restore();
}

export function pendopo(g, x, y, s = 1) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  // Base steps
  g.fillStyle = '#8c7258';
  g.strokeStyle = PAL.ink;
  g.lineWidth = 6;
  g.fillRect(-320, -45, 640, 45);
  g.strokeRect(-320, -45, 640, 45);

  // Pillars
  g.fillStyle = '#6e472b';
  for (const px of [-240, -120, 120, 240]) {
    g.fillRect(px - 14, -260, 28, 215);
    g.strokeRect(px - 14, -260, 28, 215);
  }

  // Joglo / Majapahit tiered roof
  g.fillStyle = PAL.crimson;
  g.beginPath();
  g.moveTo(-360, -260);
  g.lineTo(-180, -370);
  g.lineTo(180, -370);
  g.lineTo(360, -260);
  g.closePath();
  g.fill();
  g.stroke();

  g.beginPath();
  g.moveTo(-200, -360);
  g.lineTo(-60, -475);
  g.lineTo(60, -475);
  g.lineTo(200, -360);
  g.closePath();
  g.fill();
  g.stroke();
  g.restore();
}

export function warrior(
  g,
  x,
  y,
  s = 1,
  { t = 0, weapon = 'keris', capeCol = PAL.crimson, pose = 'oath', silhouette = false } = {}
) {
  const breathe = Math.sin(t * 2.5) * 4 * s;
  g.save();
  g.translate(x, y + breathe);
  g.scale(s, s);

  const fillMain = silhouette ? PAL.ink : '#cfa06e';
  const fillGarb = silhouette ? PAL.ink : capeCol;
  const fillGold = silhouette ? PAL.ink : PAL.gold;

  // Flowing sash / cape
  g.fillStyle = fillGarb;
  g.strokeStyle = PAL.ink;
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(-45, -135);
  g.quadraticCurveTo(-135 - Math.sin(t * 4) * 18, -40, -110, 95);
  g.lineTo(65, 95);
  g.lineTo(52, -135);
  g.closePath();
  g.fill();
  g.stroke();

  // Lower kain Dodot
  g.fillStyle = silhouette ? PAL.ink : '#4a3828';
  g.fillRect(-52, -10, 104, 130);
  g.strokeRect(-52, -10, 104, 130);

  // Chest & golden chestplate / upawita
  g.fillStyle = fillMain;
  g.beginPath();
  g.moveTo(-58, -145);
  g.lineTo(58, -145);
  g.lineTo(44, -10);
  g.lineTo(-44, -10);
  g.closePath();
  g.fill();
  g.stroke();

  g.fillStyle = fillGold;
  g.fillRect(-52, -32, 104, 24);
  g.strokeRect(-52, -32, 104, 24);

  // Head & Crown/Udeng
  g.fillStyle = fillMain;
  g.beginPath();
  g.arc(0, -195, 42, 0, TAU);
  g.fill();
  g.stroke();

  g.fillStyle = fillGold;
  g.beginPath();
  g.moveTo(-44, -210);
  g.lineTo(-22, -262);
  g.lineTo(0, -238);
  g.lineTo(22, -268);
  g.lineTo(44, -210);
  g.closePath();
  g.fill();
  g.stroke();

  if (!silhouette) {
    // Fierce graphic-novel eyes
    g.fillStyle = PAL.ink;
    g.fillRect(-22, -202, 14, 6);
    g.fillRect(8, -202, 14, 6);
  }

  // Raised right arm + Keris or Spear
  g.save();
  if (pose === 'oath') {
    g.translate(48, -135);
    g.rotate(-0.55 + Math.sin(t * 3) * 0.04);
    g.fillStyle = fillMain;
    g.fillRect(-14, -110, 28, 110);
    g.strokeRect(-14, -110, 28, 110);

    if (weapon === 'keris') {
      // Wavy Luk Keris held high
      g.strokeStyle = silhouette ? PAL.crimson : PAL.goldLight;
      g.lineWidth = 10;
      g.beginPath();
      g.moveTo(0, -115);
      for (let k = 1; k <= 6; k++) {
        g.lineTo((k % 2 ? 12 : -12), -115 - k * 24);
      }
      g.stroke();
    } else if (weapon === 'spear') {
      g.strokeStyle = PAL.ink;
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(0, 60);
      g.lineTo(0, -240);
      g.stroke();
      g.fillStyle = PAL.crimson;
      g.beginPath();
      g.moveTo(0, -280);
      g.lineTo(-16, -230);
      g.lineTo(16, -230);
      g.closePath();
      g.fill();
      g.stroke();
    }
  }
  g.restore();
  g.restore();
}

export function waves(g, { y0 = 1120, y1 = 1520, t = 0, col = PAL.indigo } = {}) {
  g.save();
  g.fillStyle = col;
  g.fillRect(-200, y0, 1480, y1 - y0);
  g.strokeStyle = PAL.ink;
  g.lineWidth = 6;
  for (let r = 0; r < 4; r++) {
    const wy = y0 + r * 85;
    g.beginPath();
    for (let x = -160; x <= 1240; x += 120) {
      const ox = x + Math.sin(t * 2.5 + r) * 25;
      g.moveTo(ox, wy);
      g.quadraticCurveTo(ox + 60, wy - 28, ox + 120, wy);
    }
    g.stroke();
  }
  g.restore();
}

export function jongShip(g, x, y, s = 1, { t = 0 } = {}) {
  const rock = Math.sin(t * 2.2 + x * 0.01) * 0.04;
  g.save();
  g.translate(x, y);
  g.rotate(rock);
  g.scale(s, s);

  // Multi-layered teak hull
  g.fillStyle = '#6e4427';
  g.strokeStyle = PAL.ink;
  g.lineWidth = 7;
  g.beginPath();
  g.moveTo(-220, -65);
  g.lineTo(-165, 45);
  g.lineTo(165, 45);
  g.lineTo(240, -85);
  g.lineTo(130, -55);
  g.lineTo(-140, -55);
  g.closePath();
  g.fill();
  g.stroke();

  // Planking lines
  g.beginPath();
  g.moveTo(-185, -20);
  g.lineTo(190, -20);
  g.moveTo(-172, 12);
  g.lineTo(175, 12);
  g.stroke();

  // Tanja tilted rectangular sails
  for (const [mx, mh, sw, col] of [
    [-65, 290, 155, PAL.crimson],
    [75, 250, 130, '#d9b372'],
  ]) {
    g.beginPath();
    g.moveTo(mx, -55);
    g.lineTo(mx, -mh);
    g.stroke();

    g.fillStyle = col;
    g.beginPath();
    g.moveTo(mx - sw * 0.5, -mh + 20);
    g.lineTo(mx + sw * 0.55, -mh - 15);
    g.lineTo(mx + sw * 0.45, -95);
    g.lineTo(mx - sw * 0.55, -75);
    g.closePath();
    g.fill();
    g.stroke();
  }
  g.restore();
}

export function archipelagoMap(g, x, y, s = 1, { prog = 1, t = 0 } = {}) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);

  // Simplified graphic-novel islands of Nusantara
  const islands = [
    [-320, -40, 130, 42, -0.45, 'SUMATRA'],
    [-80, 65, 145, 28, 0.08, 'JAWA'],
    [-40, -95, 95, 75, 0, 'TANJUNGPURA'],
    [125, -75, 65, 72, 0.2, 'SULAWESI'],
    [75, 72, 42, 22, 0, 'BALI & DOMPO'],
    [285, -35, 110, 55, 0.15, 'SERAN & GURUN'],
  ];

  islands.forEach(([ix, iy, rx, ry, rot, name], idx) => {
    const lit = clamp(prog * islands.length - idx, 0, 1);
    g.save();
    g.translate(ix, iy);
    g.rotate(rot);
    g.fillStyle = lit > 0.5 ? PAL.crimson : '#b89f78';
    g.strokeStyle = PAL.ink;
    g.lineWidth = 6;
    g.beginPath();
    g.ellipse(0, 0, rx, ry, 0, 0, TAU);
    g.fill();
    g.stroke();
    g.restore();
  });
  g.restore();
}

export function comicBorder(ctx) {
  ctx.save();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 14;
  ctx.strokeRect(36, 64, 1008, 1792);
  ctx.lineWidth = 4;
  ctx.strokeRect(52, 80, 976, 1760);
  ctx.restore();
}

export function captionBox(ctx, title, sub, x, y, { a = 1, tag = 'BABAK SEJARAH' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a, 0, 1);

  const w = 900;
  const h = sub ? 148 : 108;
  const bx = x - w / 2;
  const by = y - h / 2;

  // Hard offset graphic-novel drop shadow
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(bx + 10, by + 10, w, h);

  ctx.fillStyle = '#f4efe3';
  ctx.fillRect(bx, by, w, h);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 6;
  ctx.strokeRect(bx, by, w, h);

  // Red chapter tag
  ctx.fillStyle = PAL.crimson;
  ctx.fillRect(bx + 20, by - 22, 260, 36);
  ctx.strokeRect(bx + 20, by - 22, 260, 36);
  ctx.fillStyle = '#fff';
  ctx.font = '800 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, bx + 150, by - 4);

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 44px Georgia, serif';
  ctx.fillText(title, x, sub ? y - 16 : y + 4);

  if (sub) {
    ctx.fillStyle = '#4a3e32';
    ctx.font = '700 26px system-ui, sans-serif';
    ctx.fillText(sub, x, y + 36);
  }
  ctx.restore();
}

