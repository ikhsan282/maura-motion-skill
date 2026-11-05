// 80 · WHITEBOARD EXPLAINER PRO — Style Kit
// Reusable components for real-time hand-drawn whiteboard motion explainer

import { clamp, lerp, ease } from '/engine/lib/core.js';

export const PAL = {
  board: '#f8fafc',
  boardGrid: 'rgba(148, 163, 184, 0.15)',
  ink: '#0f172a',
  inkLight: '#334155',
  red: '#ef4444',
  blue: '#2563eb',
  amber: '#f59e0b',
  green: '#10b981',
  purple: '#8b5cf6',
  white: '#ffffff',
  stickyYellow: '#fef08a',
  stickyCyan: '#bae6fd',
  stickyPink: '#fbcfe8',
  shadow: 'rgba(15, 23, 42, 0.08)',
  markerHighlight: 'rgba(254, 240, 138, 0.45)',
};

/**
 * Dynamic Camera for Infinite Whiteboard Panning
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
 * Hand-drawn line with subtle natural wobble
 */
export function wobbleLine(ctx, x1, y1, x2, y2, { col = PAL.ink, width = 4, seed = 1 } = {}) {
  const mx = (x1 + x2) / 2 + Math.sin(seed * 4.3) * 3;
  const my = (y1 + y2) / 2 + Math.cos(seed * 5.7) * 3;
  ctx.strokeStyle = col;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.stroke();
}

/**
 * Whiteboard background with subtle dot grid and dry-erase wipe marks
 */
export function whiteboardBg(ctx, t, { showGrid = true } = {}) {
  // Porcelain white surface
  ctx.fillStyle = PAL.board;
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle dot matrix grid on whiteboard
  if (showGrid) {
    ctx.fillStyle = PAL.boardGrid;
    const step = 60;
    for (let x = 30; x < 1080; x += step) {
      for (let y = 30; y < 1920; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Faint dry-erase eraser marks in background
  ctx.strokeStyle = 'rgba(241, 245, 249, 0.8)';
  ctx.lineWidth = 40;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(100, 300); ctx.lineTo(980, 340);
  ctx.moveTo(80, 950); ctx.lineTo(1000, 920);
  ctx.moveTo(120, 1380); ctx.lineTo(960, 1420);
  ctx.stroke();
}

/**
 * Whiteboard Top Banner
 */
export function whiteboardHeader(ctx, badge, title, subtitle, { col = PAL.blue } = {}) {
  ctx.save();
  const x = 60, y = 50, w = 960, h = 145;

  // Whiteboard hanging title frame with tape
  ctx.fillStyle = PAL.white;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.stroke();

  // Tape on top corners
  ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
  ctx.beginPath();
  ctx.roundRect(x + 20, y - 10, 50, 22, 3);
  ctx.roundRect(x + w - 70, y - 10, 50, 22, 3);
  ctx.fill();

  // Badge
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 28, y + 20, 250, 32, 8);
  ctx.fill();

  ctx.fillStyle = PAL.white;
  ctx.font = '900 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(badge, x + 153, y + 41);

  // Series branding right
  ctx.fillStyle = PAL.inkLight;
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('WHITEBOARD EXPLAINER • NO. 80', x + w - 28, y + 41);

  // Main Title
  ctx.fillStyle = PAL.ink;
  ctx.font = '900 29px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, x + 28, y + 88, w - 56);

  // Subtitle
  ctx.fillStyle = PAL.inkLight;
  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, x + 28, y + 122, w - 56);

  ctx.restore();
}

/**
 * Realistic Dry-Erase Marker Pen drawing in real-time
 */
export function markerPen(ctx, x, y, {
  color = PAL.blue,
  angle = -0.45,
  isDrawing = true,
  t = 0
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Drawing contact spark
  if (isDrawing) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chisel Marker Nib (Black/Colored felt tip)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-6, -18);
  ctx.lineTo(6, -18);
  ctx.closePath();
  ctx.fill();

  // Marker Cone Collar
  ctx.fillStyle = '#cbd5e1';
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-7, -18);
  ctx.lineTo(-12, -45);
  ctx.lineTo(12, -45);
  ctx.lineTo(7, -18);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Marker Cylinder Barrel (White body with color band)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(-14, -180, 28, 135, [10, 10, 2, 2]);
  ctx.fill(); ctx.stroke();

  // Marker Brand Color Stripe
  ctx.fillStyle = color;
  ctx.fillRect(-14, -140, 28, 35);

  // Marker Cap posted on back
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-15, -230, 30, 50, [12, 12, 2, 2]);
  ctx.fill(); ctx.stroke();

  ctx.restore();
}

/**
 * Sticky Note pinned to the whiteboard
 */
export function stickyNote(ctx, x, y, w, h, {
  color = PAL.stickyYellow,
  angle = -0.04,
  title = '',
  lines = []
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Soft Paper Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.roundRect(4, 6, w, h, 6);
  ctx.fill();

  // Sticky Paper Base
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 6);
  ctx.fill(); ctx.stroke();

  // Translucent tape on top
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.roundRect(w / 2 - 25, -8, 50, 16, 2);
  ctx.fill();

  // Title
  if (title) {
    ctx.fillStyle = PAL.ink;
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, 18, 34, w - 36);

    // Marker underline
    ctx.strokeStyle = PAL.amber;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(18, 42); ctx.lineTo(18 + Math.min(w - 36, ctx.measureText(title).width), 42);
    ctx.stroke();
  }

  // Text Lines
  ctx.fillStyle = PAL.inkLight;
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, 18, 72 + i * 26, w - 36);
  });

  ctx.restore();
}

/**
 * Hand-Drawn Doodle Stick Character
 */
export function whiteboardStickman(ctx, x, y, {
  pose = 'think', // 'think' | 'point' | 'eureka' | 'confused'
  scale = 1.4,
  facing = 1,
  accent = PAL.blue,
  t = 0
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);

  const bob = Math.sin(t * 3) * 2;
  ctx.translate(0, bob);

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 42, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Head (Hand-drawn circle)
  const headY = -120;
  ctx.fillStyle = PAL.white;
  ctx.beginPath();
  ctx.arc(0, headY, 28, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Face expressions
  if (pose === 'eureka') {
    // Excited eyes
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(-8, headY - 4, 3.5, 0, Math.PI * 2);
    ctx.arc(8, headY - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Big happy smile
    ctx.beginPath();
    ctx.arc(0, headY + 4, 12, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Glowing Eureka Lightbulb above head
    const bulbY = headY - 60;
    ctx.fillStyle = PAL.amber;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, bulbY, 18, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Base screw
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-6, bulbY + 16, 12, 8);

    // Light rays
    ctx.strokeStyle = PAL.amber;
    ctx.lineWidth = 3;
    for (let r = 0; r < 5; r++) {
      const ang = -Math.PI + (r * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 26, bulbY + Math.sin(ang) * 26);
      ctx.lineTo(Math.cos(ang) * 38, bulbY + Math.sin(ang) * 38);
      ctx.stroke();
    }
  } else if (pose === 'confused') {
    // Swirl eyes
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-8, headY - 2, 5, 0, Math.PI * 2);
    ctx.arc(8, headY - 2, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Wobbly confused mouth
    ctx.beginPath();
    ctx.moveTo(-10, headY + 12);
    ctx.quadraticCurveTo(-4, headY + 6, 2, headY + 14);
    ctx.quadraticCurveTo(8, headY + 8, 12, headY + 12);
    ctx.stroke();

    // Floating question mark
    ctx.fillStyle = PAL.red;
    ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('?', 28, headY - 20 + Math.sin(t * 4) * 6);
  } else {
    // Normal / thinking face
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(-8, headY - 3, 3.5, 0, Math.PI * 2);
    ctx.arc(8, headY - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Thoughtful curved smile
    ctx.beginPath();
    ctx.arc(0, headY + 4, 9, 0.2, Math.PI - 0.4);
    ctx.stroke();
  }

  // 2. Torso with colored marker necktie/scarf
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(0, headY + 28);
  ctx.lineTo(0, -40);
  ctx.stroke();

  // Accent Marker Tie
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-4, headY + 30);
  ctx.lineTo(4, headY + 30);
  ctx.lineTo(7, headY + 68);
  ctx.lineTo(0, headY + 80);
  ctx.lineTo(-7, headY + 68);
  ctx.closePath();
  ctx.fill();

  // 3. Legs
  ctx.beginPath();
  ctx.moveTo(0, -40); ctx.lineTo(-18, 0);
  ctx.moveTo(0, -40); ctx.lineTo(18, 0);
  ctx.stroke();

  // 4. Arms
  if (pose === 'point') {
    // Right arm pointing up/right
    ctx.beginPath();
    ctx.moveTo(0, headY + 45); ctx.lineTo(28, headY + 30); ctx.lineTo(55, headY + 10);
    // Left arm on hip
    ctx.moveTo(0, headY + 45); ctx.lineTo(-24, headY + 60); ctx.lineTo(-12, headY + 75);
    ctx.stroke();
  } else if (pose === 'eureka') {
    // Both arms raised high
    ctx.beginPath();
    ctx.moveTo(0, headY + 45); ctx.lineTo(-32, headY + 10); ctx.lineTo(-45, headY - 25);
    ctx.moveTo(0, headY + 45); ctx.lineTo(32, headY + 10); ctx.lineTo(45, headY - 25);
    ctx.stroke();
  } else if (pose === 'confused') {
    // Shrugging arms
    ctx.beginPath();
    ctx.moveTo(0, headY + 45); ctx.lineTo(-30, headY + 35); ctx.lineTo(-38, headY + 15);
    ctx.moveTo(0, headY + 45); ctx.lineTo(30, headY + 35); ctx.lineTo(38, headY + 15);
    ctx.stroke();
  } else {
    // Hand on chin thinking
    ctx.beginPath();
    ctx.moveTo(0, headY + 45); ctx.lineTo(-18, headY + 65); ctx.lineTo(-14, headY + 80);
    ctx.moveTo(0, headY + 45); ctx.lineTo(22, headY + 55); ctx.lineTo(12, headY + 22);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Hand-Drawn Whiteboard Callout Card (Floating at y: 1485, h: 165)
 */
export function whiteboardCallout(ctx, cx, cy, w, h, {
  tag = 'METODE PEMIKIRAN',
  title = '',
  desc = '',
  stat = '',
  statSub = '',
  col = PAL.blue,
  a = 1
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);
  const x = cx - w / 2, y = cy - h / 2;

  // Paper Drop Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.07)';
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 8, w, h, 18);
  ctx.fill();

  // Clean White Paper Card Surface
  ctx.fillStyle = PAL.white;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.stroke();

  // Wobbly Left Accent Marker Bar
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 16, y + 18, 8, h - 36, 4);
  ctx.fill();

  // Adhesive Tape in Corner
  ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
  ctx.beginPath();
  ctx.roundRect(x + w / 2 - 40, y - 8, 80, 18, 3);
  ctx.fill();

  const maxTextW = stat ? w - 265 : w - 70;
  ctx.textAlign = 'left';

  // Tag
  ctx.fillStyle = col;
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.fillText(tag, x + 40, y + 42, maxTextW);

  // Title
  ctx.fillStyle = PAL.ink;
  ctx.font = '800 23px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, x + 40, y + 84, maxTextW);

  // Desc
  ctx.fillStyle = PAL.inkLight;
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(desc, x + 40, y + 124, maxTextW);

  // Right Stat Box (Hand drawn badge)
  if (stat) {
    const sw = 185, sh = h - 34;
    const sx = x + w - sw - 20, sy = y + 17;

    ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = col;
    ctx.font = '900 25px "JetBrains Mono", monospace';
    ctx.fillText(stat, sx + sw / 2, sy + 44, sw - 16);

    if (statSub) {
      ctx.fillStyle = PAL.ink;
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillText(statSub, sx + sw / 2, sy + 76, sw - 16);
    }
  }
  ctx.restore();
}

