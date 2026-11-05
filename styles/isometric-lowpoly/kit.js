// 81 · ISOMETRIC LOW-POLY 3D — Style Kit
// Reusable components for 3D isometric diorama, voxel cube worlds, and productivity machines

import { clamp, lerp, ease } from '/engine/lib/core.js';

export const PAL = {
  bg0: '#0b0f19',
  bg1: '#111827',
  bg2: '#030712',
  mint: '#10b981',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  coral: '#f43f5e',
  white: '#ffffff',
  slateDark: '#1e293b',
  slateMedium: '#334155',
  slateLight: '#64748b',
  border: 'rgba(255, 255, 255, 0.12)',
  glowCyan: 'rgba(6, 182, 212, 0.35)',
};

/**
 * True 2:1 Isometric Projection Math
 * gx: Grid X (right-down)
 * gy: Grid Y (left-down)
 * gz: Grid Z (upwards altitude)
 * cx, cy: Screen center offset
 */
export function toIso(gx, gy, gz, { cx = 540, cy = 820, scale = 40 } = {}) {
  const sx = cx + (gx - gy) * (scale * 0.866025); // cos(30 deg)
  const sy = cy + (gx + gy) * (scale * 0.5) - gz * scale;
  return { x: sx, y: sy };
}

/**
 * Dynamic Camera for Isometric Pan and Zoom
 */
export function withCamera(ctx, { zoom = 1, panX = 0, panY = 0, fx = 540, fy = 880 } = {}, fn) {
  ctx.save();
  ctx.translate(fx + panX, fy + panY);
  ctx.scale(zoom, zoom);
  ctx.translate(-fx, -fy);
  fn();
  ctx.restore();
}

/**
 * Isometric Low-Poly Background with Ambient Grid
 */
export function isoBackground(ctx, t, { accent = PAL.cyan } = {}) {
  // Deep navy vignette
  const bg = ctx.createRadialGradient(540, 800, 100, 540, 800, 1000);
  bg.addColorStop(0, '#111827');
  bg.addColorStop(0.7, '#0b0f19');
  bg.addColorStop(1, '#030712');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle isometric grid lines on ground
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1.5;

  const cx = 540, cy = 1100, step = 55;
  for (let i = -14; i <= 14; i++) {
    // Axis 1 (X)
    ctx.beginPath();
    ctx.moveTo(cx - 700, cy + i * step * 0.5 - 700 * 0.5);
    ctx.lineTo(cx + 700, cy + i * step * 0.5 + 700 * 0.5);
    ctx.stroke();

    // Axis 2 (Y)
    ctx.beginPath();
    ctx.moveTo(cx - 700, cy + i * step * 0.5 + 700 * 0.5);
    ctx.lineTo(cx + 700, cy + i * step * 0.5 - 700 * 0.5);
    ctx.stroke();
  }

  // Floating ambient dust motes
  for (let d = 0; d < 18; d++) {
    const dx = ((d * 187 + 30) % 960) + 60;
    const dy = ((d * 211 + 50) % 1500) + 200;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2 + d);
    ctx.fillStyle = d % 2 === 0 ? PAL.cyan : PAL.indigo;
    ctx.globalAlpha = clamp(0.2 + 0.5 * pulse, 0.1, 0.7);
    ctx.beginPath();
    ctx.arc(dx, dy, (d % 3 === 0 ? 3 : 1.8), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
  ctx.restore();
}

/**
 * Isometric Top Header Banner
 */
export function isoHeader(ctx, badge, title, subtitle, { col = PAL.cyan } = {}) {
  ctx.save();
  const x = 60, y = 50, w = 960, h = 145;

  // Frosted dark glass container with bevel
  ctx.fillStyle = 'rgba(17, 24, 39, 0.85)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fill();
  ctx.stroke();

  // Top Category Badge
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 28, y + 20, 240, 32, 8);
  ctx.fill();

  ctx.fillStyle = PAL.bg0;
  ctx.font = '900 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(badge, x + 148, y + 41);

  // Series Branding Right
  ctx.fillStyle = PAL.slateLight;
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('ISOMETRIC LOW-POLY 3D • NO. 81', x + w - 28, y + 41);

  // Main Title
  ctx.fillStyle = PAL.white;
  ctx.font = '900 29px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, x + 28, y + 88, w - 56);

  // Subtitle
  ctx.fillStyle = PAL.slateLight;
  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, x + 28, y + 122, w - 56);

  ctx.restore();
}

/**
 * 3D Isometric Cube / Block with 3-tone lighting
 */
export function isoBlock(ctx, gx, gy, gz, dx, dy, dz, {
  cx = 540,
  cy = 820,
  scale = 40,
  topCol = '#38bdf8',
  leftCol = '#0284c7',
  rightCol = '#0369a1',
  edgeCol = 'rgba(255, 255, 255, 0.2)'
} = {}) {
  const p0 = toIso(gx, gy, gz, { cx, cy, scale });
  const p1 = toIso(gx + dx, gy, gz, { cx, cy, scale });
  const p2 = toIso(gx + dx, gy + dy, gz, { cx, cy, scale });
  const p3 = toIso(gx, gy + dy, gz, { cx, cy, scale });

  const p4 = toIso(gx, gy, gz + dz, { cx, cy, scale });
  const p5 = toIso(gx + dx, gy, gz + dz, { cx, cy, scale });
  const p6 = toIso(gx + dx, gy + dy, gz + dz, { cx, cy, scale });
  const p7 = toIso(gx, gy + dy, gz + dz, { cx, cy, scale });

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.2;

  // 1. Left Face (p0 -> p3 -> p7 -> p4)
  ctx.fillStyle = leftCol;
  ctx.strokeStyle = edgeCol;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p7.x, p7.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // 2. Right Face (p3 -> p2 -> p6 -> p7)
  ctx.fillStyle = rightCol;
  ctx.beginPath();
  ctx.moveTo(p3.x, p3.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p6.x, p6.y);
  ctx.lineTo(p7.x, p7.y);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // 3. Top Face (p4 -> p5 -> p6 -> p7) (Lit from above)
  ctx.fillStyle = topCol;
  ctx.beginPath();
  ctx.moveTo(p4.x, p4.y);
  ctx.lineTo(p5.x, p5.y);
  ctx.lineTo(p6.x, p6.y);
  ctx.lineTo(p7.x, p7.y);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.restore();
}

/**
 * Floating Isometric Island Base Slab
 */
export function isoIsland(ctx, {
  cx = 540,
  cy = 820,
  scale = 40,
  w = 8,
  d = 8,
  h = 2,
  grassCol = '#059669',
  dirtCol = '#1e293b'
} = {}) {
  // Island Dirt Base (extending down)
  isoBlock(ctx, -w / 2, -d / 2, -h, w, d, h, {
    cx, cy, scale,
    topCol: grassCol,
    leftCol: '#0f172a',
    rightCol: dirtCol,
    edgeCol: 'rgba(255, 255, 255, 0.08)'
  });

  // Top Neon Trim Line
  const p0 = toIso(-w / 2, -d / 2, 0, { cx, cy, scale });
  const p1 = toIso(w / 2, -d / 2, 0, { cx, cy, scale });
  const p2 = toIso(w / 2, d / 2, 0, { cx, cy, scale });
  const p3 = toIso(-w / 2, d / 2, 0, { cx, cy, scale });

  ctx.save();
  ctx.strokeStyle = PAL.mint;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/**
 * Low-Poly Blocky Humanoid Character
 */
export function isoChar(ctx, gx, gy, gz, {
  cx = 540,
  cy = 820,
  scale = 40,
  pose = 'stand', // 'stand' | 'walk' | 'operate'
  suitCol = PAL.cyan,
  t = 0
} = {}) {
  const bob = Math.sin(t * 4) * 0.1;
  const z = gz + bob;

  // Legs (two slim vertical blocks)
  isoBlock(ctx, gx - 0.25, gy - 0.15, z, 0.2, 0.3, 0.6, {
    cx, cy, scale,
    topCol: '#334155', leftCol: '#1e293b', rightCol: '#0f172a'
  });
  isoBlock(ctx, gx + 0.05, gy - 0.15, z, 0.2, 0.3, 0.6, {
    cx, cy, scale,
    topCol: '#334155', leftCol: '#1e293b', rightCol: '#0f172a'
  });

  // Torso (crisp colorful cube)
  isoBlock(ctx, gx - 0.35, gy - 0.25, z + 0.6, 0.7, 0.5, 0.8, {
    cx, cy, scale,
    topCol: suitCol, leftCol: '#0284c7', rightCol: '#0369a1'
  });

  // Head (cute low-poly cubic head)
  isoBlock(ctx, gx - 0.3, gy - 0.3, z + 1.45, 0.6, 0.6, 0.6, {
    cx, cy, scale,
    topCol: '#fed7aa', leftCol: '#fdba74', rightCol: '#fb923c'
  });

  // Visor / Glasses on head
  const pFace = toIso(gx + 0.31, gy - 0.15, z + 1.7, { cx, cy, scale });
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(pFace.x - 4, pFace.y - 4, 8, 8);
}

/**
 * Floating 3D Holographic Label in Isometric Space
 */
export function isoTag(ctx, gx, gy, gz, text, {
  cx = 540,
  cy = 820,
  scale = 40,
  col = PAL.cyan
} = {}) {
  const pt = toIso(gx, gy, gz, { cx, cy, scale });
  ctx.save();
  ctx.font = '900 15px "JetBrains Mono", monospace';
  const tw = ctx.measureText(text).width + 32;
  const th = 34;

  // Floating stem down to anchor
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pt.x, pt.y);
  ctx.lineTo(pt.x, pt.y - 25);
  ctx.stroke();

  // Anchor dot
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
  ctx.fill();

  // Label Box
  const bx = pt.x - tw / 2, by = pt.y - 25 - th;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, 8);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = PAL.white;
  ctx.textAlign = 'center';
  ctx.fillText(text, pt.x, by + 22);
  ctx.restore();
}

/**
 * Floating Isometric Callout Card at y: 1485
 */
export function isoCallout(ctx, cx, cy, w, h, {
  tag = 'ARSITEKTUR PRODUKTIVITAS',
  title = '',
  desc = '',
  stat = '',
  statSub = '',
  col = PAL.cyan,
  a = 1
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);
  const x = cx - w / 2, y = cy - h / 2;

  // Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 20);
  ctx.fill();

  // Dark Futuristic Container
  ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fill(); ctx.stroke();

  // Neon Left Accent
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 18, y + 20, 8, h - 40, 4);
  ctx.fill();

  const maxTextW = stat ? w - 265 : w - 70;
  ctx.textAlign = 'left';

  // Tag
  ctx.fillStyle = col;
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.fillText(tag, x + 42, y + 42, maxTextW);

  // Title
  ctx.fillStyle = PAL.white;
  ctx.font = '800 23px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, x + 42, y + 84, maxTextW);

  // Desc
  ctx.fillStyle = PAL.slateLight;
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(desc, x + 42, y + 124, maxTextW);

  // Right Stat Box
  if (stat) {
    const sw = 185, sh = h - 34;
    const sx = x + w - sw - 20, sy = y + 17;

    ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 12);
    ctx.fill(); ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = col;
    ctx.font = '900 25px "JetBrains Mono", monospace';
    ctx.fillText(stat, sx + sw / 2, sy + 44, sw - 16);

    if (statSub) {
      ctx.fillStyle = PAL.white;
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillText(statSub, sx + sw / 2, sy + 76, sw - 16);
    }
  }
  ctx.restore();
}

