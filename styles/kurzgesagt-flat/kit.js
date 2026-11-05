// 79 · KURZGESAGT FLAT MOTION — Style Kit
// Reusable components for vibrant cosmic science flat motion explainer

import { clamp, lerp, ease } from '/engine/lib/core.js';

export const PAL = {
  bg0: '#0c0a24',
  bg1: '#16123d',
  bg2: '#080718',
  cyan: '#00f2fe',
  cyanSoft: 'rgba(0, 242, 254, 0.15)',
  teal: '#4facfe',
  yellow: '#ffe600',
  orange: '#ff9234',
  coral: '#ff4b72',
  purple: '#8b5cf6',
  white: '#ffffff',
  ink: '#0b0f19',
  muted: '#94a3b8',
  border: 'rgba(255, 255, 255, 0.12)',
};

export function withCamera(ctx, { zoom = 1, panX = 0, panY = 0, fx = 540, fy = 880 } = {}, fn) {
  ctx.save();
  ctx.translate(fx + panX, fy + panY);
  ctx.scale(zoom, zoom);
  ctx.translate(-fx, -fy);
  fn();
  ctx.restore();
}

export function kurzgesagtBg(ctx, t, { col = PAL.cyan } = {}) {
  // Rich deep cosmic radial gradient
  const bg = ctx.createRadialGradient(540, 780, 50, 540, 780, 950);
  bg.addColorStop(0, PAL.bg1);
  bg.addColorStop(0.7, PAL.bg0);
  bg.addColorStop(1, PAL.bg2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  // Floating geometric stars & stardust
  for (let i = 0; i < 28; i++) {
    const sx = ((i * 173 + 45) % 1020) + 30;
    const sy = ((i * 241 + 65) % 1840) + 40;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + i);
    const r = Math.max(0.8, (i % 3 === 0 ? 3.5 : 2) * pulse);

    ctx.fillStyle = i % 3 === 0 ? PAL.cyan : i % 2 === 0 ? PAL.yellow : PAL.white;
    ctx.globalAlpha = clamp(0.3 + 0.6 * pulse, 0.1, 1);
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();

    // Occasional 4-point sparkle star
    if (i % 7 === 0) {
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx - 8, sy); ctx.lineTo(sx + 8, sy);
      ctx.moveTo(sx, sy - 8); ctx.lineTo(sx, sy + 8);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1.0;

  // Subtle orbital curve rings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(540, 850, 480, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(540, 850, 680, 0, Math.PI * 2);
  ctx.stroke();
}

export function kurzgesagtHeader(ctx, badge, title, subtitle, { col = PAL.cyan } = {}) {
  ctx.save();
  const x = 60, y = 50, w = 960, h = 145;

  // Frosted dark pill container
  ctx.fillStyle = 'rgba(14, 13, 38, 0.75)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 24);
  ctx.fill();
  ctx.stroke();

  // Top Category Badge
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 28, y + 20, 240, 32, 10);
  ctx.fill();

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(badge, x + 148, y + 41);

  // Series Branding Right
  ctx.fillStyle = PAL.muted;
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('KURZGESAGT MOTION • NO. 79', x + w - 28, y + 41);

  // Main Title
  ctx.fillStyle = PAL.white;
  ctx.font = '900 29px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, x + 28, y + 88, w - 56);

  // Subtitle
  ctx.fillStyle = PAL.muted;
  ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, x + 28, y + 122, w - 56);

  ctx.restore();
}

export function kurzgesagtPodPlatform(ctx, x, floorY, { col = PAL.cyan, rx = 440, ry = 95 } = {}) {
  ctx.save();
  ctx.fillStyle = 'rgba(22, 20, 60, 0.65)';
  ctx.strokeStyle = PAL.border;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, floorY, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing rim on platform
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(x, floorY, rx - 30, ry - 15, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();
}

/**
 * The Signature Kurzgesagt Duck Scientist / Explorer
 */
export function kurzgesagtDuck(ctx, x, y, {
  scale = 1.5,
  facing = 1,
  pose = 'curious', // 'curious' | 'drowsy' | 'pointing' | 'sleeping' | 'celebrate'
  coat = true,
  t = 0
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);

  const bob = Math.sin(t * 3.5) * 4;
  ctx.translate(0, bob);

  // Soft shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 10 - bob, 78, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Duck Feet (Bright Orange)
  ctx.fillStyle = PAL.orange;
  ctx.strokeStyle = '#c45a00';
  ctx.lineWidth = 3.5;

  // Left Foot
  ctx.beginPath();
  ctx.roundRect(-42, -12, 38, 17, 8);
  ctx.fill(); ctx.stroke();

  // Right Foot
  ctx.beginPath();
  ctx.roundRect(10, -12, 38, 17, 8);
  ctx.fill(); ctx.stroke();

  // 2. Duck Body (Plump Pear / Egg Shape, Sunny Duck Yellow)
  ctx.fillStyle = '#ffc837';
  ctx.strokeStyle = '#d48806';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-58, -90);
  ctx.bezierCurveTo(-80, -50, -65, -10, 0, -8);
  ctx.bezierCurveTo(65, -10, 80, -50, 58, -90);
  ctx.bezierCurveTo(48, -135, -48, -135, -58, -90);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Scientist Turquoise Lab Coat
  if (coat) {
    ctx.fillStyle = '#06b6d4';
    ctx.strokeStyle = '#0891b2';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(-55, -88);
    ctx.quadraticCurveTo(-65, -45, -44, -14);
    ctx.lineTo(44, -14);
    ctx.quadraticCurveTo(65, -45, 55, -88);
    ctx.quadraticCurveTo(0, -96, -55, -88);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White Lapel / Collar
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-26, -92);
    ctx.lineTo(0, -60);
    ctx.lineTo(26, -92);
    ctx.closePath();
    ctx.fill();

    // Pocket with tiny red pen
    ctx.fillStyle = '#0891b2';
    ctx.beginPath();
    ctx.roundRect(16, -58, 22, 20, 4);
    ctx.fill();

    ctx.fillStyle = PAL.coral;
    ctx.fillRect(22, -68, 5, 12);
  }

  // 4. Duck Head (Large round cute sphere)
  const headY = -145;
  ctx.fillStyle = '#ffc837';
  ctx.strokeStyle = '#d48806';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(0, headY, 56, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cute feather tuft at back of head
  ctx.beginPath();
  ctx.moveTo(-48, headY - 10);
  ctx.quadraticCurveTo(-72, headY - 28, -58, headY - 40);
  ctx.quadraticCurveTo(-44, headY - 30, -40, headY - 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sleeping Nightcap when pose === 'sleeping'
  if (pose === 'sleeping') {
    ctx.fillStyle = PAL.purple;
    ctx.strokeStyle = '#5b21b6';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-42, headY - 28);
    ctx.quadraticCurveTo(-20, headY - 95, 25, headY - 85);
    ctx.lineTo(38, headY - 22);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // Nightcap pom-pom
    ctx.fillStyle = PAL.yellow;
    ctx.beginPath();
    ctx.arc(28, headY - 88, 12, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

  // 5. Eye Animation (Curious / Drowsy / Sleeping)
  const eyeX = 20, eyeY = headY - 6;
  if (pose === 'sleeping') {
    // Sleeping happy curved eye
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY + 6, 16, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Floating sleep 'Zzz'
    ctx.fillStyle = PAL.cyan;
    ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('z', 60, headY - 50 + Math.sin(t * 3) * 6);
    ctx.font = '900 38px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Z', 85, headY - 80 + Math.sin(t * 3 + 1) * 8);
  } else if (pose === 'drowsy') {
    // Half closed tired eye with dizzy bags
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Droopy pupil
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(eyeX + 2, eyeY + 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // Heavy eyelid drooping down
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 20, Math.PI * 1.1, Math.PI * 1.9);
    ctx.lineTo(eyeX + 20, eyeY + 4);
    ctx.lineTo(eyeX - 20, eyeY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c45a00';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Sweat drop
    ctx.fillStyle = PAL.cyan;
    ctx.beginPath();
    ctx.arc(-25, headY - 25, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Wide curious glossy eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Large dark pupil
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(eyeX + 4, eyeY - 1, 13, 0, Math.PI * 2);
    ctx.fill();

    // Crisp white specular dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX + 2, eyeY - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeX + 8, eyeY + 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Orange Curved Beak
  ctx.fillStyle = PAL.orange;
  ctx.strokeStyle = '#c45a00';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(38, headY - 4);
  ctx.quadraticCurveTo(92, headY, 84, headY + 20);
  ctx.quadraticCurveTo(50, headY + 28, 35, headY + 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 7. Expressive Wing (Pointing / Holding / Resting)
  ctx.fillStyle = '#ffc837';
  ctx.strokeStyle = '#d48806';
  ctx.lineWidth = 4;

  if (pose === 'pointing') {
    // Wing pointing forward/up
    ctx.beginPath();
    ctx.moveTo(-15, -80);
    ctx.quadraticCurveTo(25, -115, 68, -128);
    ctx.quadraticCurveTo(50, -85, 10, -60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (pose === 'celebrate') {
    // Wings raised in victory
    ctx.beginPath();
    ctx.moveTo(25, -75);
    ctx.quadraticCurveTo(75, -135, 88, -148);
    ctx.quadraticCurveTo(65, -100, 32, -60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-35, -75);
    ctx.quadraticCurveTo(-85, -135, -98, -148);
    ctx.quadraticCurveTo(-75, -100, -42, -60);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Resting wing at side
    ctx.beginPath();
    ctx.moveTo(-28, -85);
    ctx.quadraticCurveTo(18, -80, 12, -30);
    ctx.quadraticCurveTo(-18, -40, -28, -85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Educational Callout Card (Floating at y: 1485, h: 165)
 */
export function kurzgesagtCallout(ctx, cx, cy, w, h, {
  tag = 'SAINS NEUROLOGI',
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
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 22);
  ctx.fill();

  // Dark Translucent Surface
  ctx.fillStyle = 'rgba(15, 14, 40, 0.88)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 22);
  ctx.fill();
  ctx.stroke();

  // Left Neon Accent Bar
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
  ctx.fillStyle = PAL.muted;
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(desc, x + 42, y + 124, maxTextW);

  // Right Stat Box
  if (stat) {
    const sw = 185, sh = h - 34;
    const sx = x + w - sw - 20, sy = y + 17;

    ctx.fillStyle = 'rgba(0, 242, 254, 0.12)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 14);
    ctx.fill();
    ctx.stroke();

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

/**
 * Speech or Thought Bubble
 */
export function kurzgesagtBubble(ctx, x, y, text, {
  tailX = x,
  tailY = y + 60,
  col = PAL.cyan
} = {}) {
  ctx.save();
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
  const tw = Math.max(260, ctx.measureText(text).width + 48);
  const th = 58;
  const bx = clamp(x - tw / 2, 80, 1000 - tw);
  const by = y - th / 2;

  // Background Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.roundRect(bx + 4, by + 5, tw, th, 16);
  ctx.fill();

  // Bubble Box
  ctx.fillStyle = '#141235';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, 16);
  ctx.fill();
  ctx.stroke();

  // Pointer Tail
  ctx.beginPath();
  ctx.moveTo(clamp(tailX - 10, bx + 20, bx + tw - 30), by + th - 2);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(clamp(tailX + 10, bx + 30, bx + tw - 20), by + th - 2);
  ctx.fillStyle = '#141235';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.white;
  ctx.textAlign = 'center';
  ctx.fillText(text, bx + tw / 2, by + 36, tw - 24);
  ctx.restore();
}

// Aliases for compatibility
export const drawKurzgesagtDuck = kurzgesagtDuck;
export const drawCallout = kurzgesagtCallout;
export const drawHeader = kurzgesagtHeader;
export const drawCosmicBackground = kurzgesagtBg;

