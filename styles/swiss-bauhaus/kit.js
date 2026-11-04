// Maura Motion style kit: SWISS / BAUHAUS GRID
// Cream paper (#F5F2EA), visible Swiss modular grid, registration marks, viewfinder timecode HUD,
// primary Bauhaus palette (Black #111111, Red #E30613, Blue #0066B3, Yellow #FFCC00),
// Kandinsky circle-triangle-square geometry, and left-aligned grotesque typography.
import { clamp, lerp, ease, hrand, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  paper: '#f5f2ea',
  paperDark: '#ebe6d8',
  ink: '#111111',
  red: '#e30613',
  blue: '#0066b3',
  yellow: '#ffcc00',
  grey: '#8c887f',
  grid: 'rgba(17,17,17,0.11)',
};

// Backwards-compatible exports
export function bg(ctx, t, c1 = PAL.paper, c2 = PAL.paperDark) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.restore();
}

export function title(ctx, text, x, y, { size = 84, color = PAL.ink, p = 1, align = 'center' } = {}) {
  ctx.save();
  ctx.globalAlpha = clamp(p);
  ctx.fillStyle = color;
  ctx.font = `800 ${size}px 'Inter', 'Poppins', sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function label(ctx, text, x, y, { size = 44, color = PAL.ink, p = 1, align = 'center', mono = false } = {}) {
  ctx.save();
  ctx.globalAlpha = clamp(p);
  ctx.fillStyle = color;
  ctx.font = `${mono ? 600 : 700} ${size}px ${mono ? "'JetBrains Mono', monospace" : "'Inter', 'Poppins', sans-serif"}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function blob(ctx, x, y, r, color, t, { seed = 1 } = {}) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const n = 10, rnd = mulberry32(seed);
  const off = Array.from({ length: n }, () => 0.75 + rnd() * 0.5);
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const rr = r * off[i % n] * (1 + 0.06 * Math.sin(t * 1.5 + i));
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.9;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function ring(ctx, x, y, r, color, w = 8) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

export function card(ctx, x, y, w, h, fill, { r = 0, stroke = null, lw = 4 } = {}) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  if (r > 0) ctx.roundRect(x - w / 2, y - h / 2, w, h, r);
  else ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  ctx.restore();
}

// ----------------------------------------------------------------Rich Swiss / Bauhaus Grid Helpers
function drawRegMark(ctx, x, y, r = 14) {
  ctx.save();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.moveTo(x - r * 1.6, y);
  ctx.lineTo(x + r * 1.6, y);
  ctx.moveTo(x, y - r * 1.6);
  ctx.lineTo(x, y + r * 1.6);
  ctx.stroke();
  ctx.restore();
}

/** Draw full Swiss Modular Grid background + registration marks + viewfinder HUD. */
export function drawSwissStage(ctx, t, { code = 'BAUHAUS · 1919–1933', step = 1, total = 8 } = {}) {
  bg(ctx, t, PAL.paper, PAL.paperDark);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // 6-column modular grid (margin 72px, width 936px -> 6 cols of 156px)
  const X0 = 72, W = 936, Y0 = 120, H = 1660;
  ctx.strokeStyle = PAL.grid;
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 6; i++) {
    const xx = X0 + (W * i) / 6;
    ctx.beginPath();
    ctx.moveTo(xx, Y0);
    ctx.lineTo(xx, Y0 + H);
    ctx.stroke();
  }
  for (let j = 0; j <= 10; j++) {
    const yy = Y0 + (H * j) / 10;
    ctx.beginPath();
    ctx.moveTo(X0, yy);
    ctx.lineTo(X0 + W, yy);
    ctx.stroke();
  }

  // Outer thick constructivist frame bar on top & bottom
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(X0, 116, W, 10);
  ctx.fillRect(X0, 1776, W, 8);

  // Registration marks in four corners
  drawRegMark(ctx, 42, 120, 11);
  drawRegMark(ctx, 1038, 120, 11);
  drawRegMark(ctx, 42, 1780, 11);
  drawRegMark(ctx, 1038, 1780, 11);

  // Top Swiss metadata header
  ctx.fillStyle = PAL.ink;
  ctx.font = "700 22px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(code, X0, 96);

  const sec = String(Math.floor(t)).padStart(2, '0');
  const fr = String(Math.floor((t % 1) * 24)).padStart(2, '0');
  ctx.textAlign = 'right';
  ctx.fillText(`MODUL ${String(step).padStart(2, '0')}/${String(total).padStart(2, '0')} · TC 00:${sec}:${fr}`, X0 + W, 96);

  // Primary color squares in top center
  const cols = [PAL.red, PAL.blue, PAL.yellow];
  cols.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(500 + i * 28, 76, 20, 20);
  });

  ctx.restore();
}

/** Left-aligned Swiss typographic header block with geometric index badge. */
export function drawSwissHeader(ctx, indexStr, titleLine1, titleLine2, sub, p = 1, accent = PAL.red) {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.globalAlpha = k;
  ctx.translate((1 - k) * -40, 0);

  // Accent index block
  ctx.fillStyle = accent;
  ctx.fillRect(72, 152, 130, 56);
  ctx.fillStyle = accent === PAL.yellow ? PAL.ink : '#ffffff';
  ctx.font = "800 28px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(indexStr, 137, 180);

  // Sub-tag next to badge
  ctx.fillStyle = PAL.ink;
  ctx.font = "700 24px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText(sub.toUpperCase(), 224, 182);

  // Main grotesque left-aligned title
  ctx.fillStyle = PAL.ink;
  ctx.font = "900 66px 'Inter', 'Poppins', sans-serif";
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(titleLine1, 72, 286);
  if (titleLine2) {
    ctx.fillText(titleLine2, 72, 362);
  }

  // Thick horizontal divider
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(72, 392, 936 * k, 8);
  ctx.restore();
}

/** Kandinsky's 1923 Bauhaus triad: Yellow Triangle, Red Square, Blue Circle. */
export function drawKandinskyTriad(ctx, cx, cy, s = 1, t = 0, p = 1) {
  const k = ease.outBack(clamp(p), 1.2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s * k, s * k);

  const shift = Math.sin(t * 1.6) * 14;

  // 1. Blue Circle (right/top)
  ctx.fillStyle = PAL.blue;
  ctx.beginPath();
  ctx.arc(170, -110 + shift, 145, 0, TAU);
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = PAL.ink;
  ctx.stroke();

  // 2. Red Square (left/bottom)
  ctx.fillStyle = PAL.red;
  ctx.fillRect(-310, -40 - shift, 260, 260);
  ctx.strokeRect(-310, -40 - shift, 260, 260);

  // 3. Yellow Triangle (center overlapping)
  ctx.fillStyle = PAL.yellow;
  ctx.beginPath();
  ctx.moveTo(10, -250);
  ctx.lineTo(240, 190);
  ctx.lineTo(-220, 190);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Intersecting Bauhaus crosshair lines
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-360, 90);
  ctx.lineTo(360, 90);
  ctx.moveTo(10, -300);
  ctx.lineTo(10, 290);
  ctx.stroke();

  ctx.restore();
}

/** Walter Gropius's Dessau Bauhaus Building (glass curtain wall + vertical BAUHAUS sign). */
export function drawBauhausBuilding(ctx, cx, cy, s = 1, t = 0, p = 1) {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.translate(cx, cy + (1 - k) * 60);
  ctx.scale(s, s);
  ctx.globalAlpha = k;

  // Red & Yellow constructivist backdrop planes
  ctx.fillStyle = PAL.yellow;
  ctx.fillRect(-370, -280, 280, 420);
  ctx.fillStyle = PAL.red;
  ctx.fillRect(120, -230, 260, 190);

  // Main white modernist concrete block
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8;
  ctx.fillRect(-330, -200, 660, 430);
  ctx.strokeRect(-330, -200, 660, 430);

  // Famous glass curtain wall grid (left wing)
  ctx.fillStyle = PAL.blue;
  ctx.fillRect(-290, -160, 390, 290);
  ctx.strokeRect(-290, -160, 390, 290);

  // Steel window mullions
  ctx.strokeStyle = PAL.paper;
  ctx.lineWidth = 4;
  for (let i = 1; i < 6; i++) {
    const xx = -290 + (390 * i) / 6;
    ctx.beginPath();
    ctx.moveTo(xx, -160);
    ctx.lineTo(xx, 130);
    ctx.stroke();
  }
  for (let j = 1; j < 4; j++) {
    const yy = -160 + (290 * j) / 4;
    ctx.beginPath();
    ctx.moveTo(-290, yy);
    ctx.lineTo(100, yy);
    ctx.stroke();
  }

  // Vertical BAUHAUS sign pillar on right wing
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(140, -170, 68, 370);
  const letters = 'BAUHAUS'.split('');
  ctx.fillStyle = PAL.paper;
  ctx.font = "900 34px 'Inter', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  letters.forEach((ch, i) => {
    ctx.fillText(ch, 174, -132 + i * 48);
  });

  // Balcony & base bar
  ctx.fillStyle = PAL.red;
  ctx.fillRect(230, -60, 80, 24);
  ctx.fillRect(230, 30, 80, 24);

  ctx.restore();
}

/** Marcel Breuer's Wassily Chair + Wilhelm Wagenfeld's WG24 Bauhaus Lamp. */
export function drawBauhausProducts(ctx, cx, cy, s = 1, t = 0, p = 1) {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s * k, s * k);

  // Left card: Wagenfeld Lamp WG24
  ctx.fillStyle = PAL.blue;
  ctx.fillRect(-380, -240, 340, 460);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8;
  ctx.strokeRect(-380, -240, 340, 460);

  // Lamp glow
  ctx.fillStyle = PAL.yellow;
  ctx.beginPath();
  ctx.arc(-210, -70, 115 + Math.sin(t * 3) * 6, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Lamp stem & base
  ctx.fillStyle = PAL.paper;
  ctx.fillRect(-224, -70, 28, 170);
  ctx.strokeRect(-224, -70, 28, 170);
  ctx.fillRect(-290, 100, 160, 26);
  ctx.strokeRect(-290, 100, 160, 26);
  label(ctx, 'LAMPU WAGENFELD 1924', -210, 175, { size: 22, color: PAL.paper, mono: true });

  // Right card: Breuer Tubular Steel Chair
  ctx.fillStyle = PAL.red;
  ctx.fillRect(40, -240, 340, 460);
  ctx.strokeRect(40, -240, 340, 460);

  // Tubular steel frame
  ctx.strokeStyle = PAL.paper;
  ctx.lineWidth = 12;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(110, 110);
  ctx.lineTo(110, -140);
  ctx.lineTo(310, -140);
  ctx.lineTo(310, 110);
  ctx.lineTo(110, 110);
  ctx.stroke();
  // Black leather straps
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(102, -105, 216, 48);
  ctx.fillRect(102, -10, 216, 44);
  label(ctx, 'KURSI PIPA BAJA B3', 210, 175, { size: 22, color: PAL.paper, mono: true });

  ctx.restore();
}

/** Josef Müller-Brockmann style Swiss Constructivist arcs & modular grid layout. */
export function drawSwissArcs(ctx, cx, cy, s = 1, t = 0, p = 1) {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.globalAlpha = k;

  const rings = [
    { r: 290, c: PAL.ink, w: 38, a0: -0.3, a1: 2.4 },
    { r: 225, c: PAL.red, w: 38, a0: 0.4, a1: 3.5 },
    { r: 160, c: PAL.blue, w: 38, a0: -1.1, a1: 1.9 },
    { r: 95, c: PAL.yellow, w: 38, a0: 0, a1: TAU },
  ];
  rings.forEach((rg, i) => {
    ctx.strokeStyle = rg.c;
    ctx.lineWidth = rg.w;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    const rot = t * (i % 2 ? -0.35 : 0.45);
    ctx.arc(0, 0, rg.r, rg.a0 + rot, rg.a0 + (rg.a1 - rg.a0) * k + rot);
    ctx.stroke();
  });

  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, TAU);
  ctx.fill();
  ctx.restore();
}
