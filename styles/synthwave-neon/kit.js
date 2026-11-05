// 82 · CYBERPUNK RETRO SYNTHWAVE — Style Kit
// Reusable components for moving neon grid, wireframe 80s horizon, interactive HUD holograms

import { clamp, lerp, ease } from '/engine/lib/core.js';

export const PAL = {
  bg0: '#05010d',
  bg1: '#0d0221',
  bg2: '#1a0536',
  cyan: '#00f2fe',
  magenta: '#ff007f',
  hotPink: '#ff2bd6',
  violet: '#8b5cf6',
  yellow: '#ffe600',
  orange: '#ff5e00',
  white: '#ffffff',
  slateDark: '#0a0a1f',
  glowCyan: 'rgba(0, 242, 254, 0.4)',
  glowMagenta: 'rgba(255, 0, 127, 0.4)',
  gridLine: 'rgba(0, 242, 254, 0.35)',
};

/**
 * Dynamic Camera for Cyberpunk Scene Zoom & Shake
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
 * High-Speed 3D Moving Perspective Neon Grid Floor & Retro Sun
 */
export function synthwaveBg(ctx, t, { horizonY = 960, gridSpeed = 2.5, sunScale = 1.0 } = {}) {
  // Deep dark cyber gradient sky
  const skyGrad = ctx.createLinearGradient(540, 0, 540, horizonY);
  skyGrad.addColorStop(0, '#05010d');
  skyGrad.addColorStop(0.5, '#0d0221');
  skyGrad.addColorStop(0.85, '#260447');
  skyGrad.addColorStop(1, '#4a0868');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1080, horizonY);

  // Deep purple dark ground base
  ctx.fillStyle = '#060112';
  ctx.fillRect(0, horizonY, 1080, 1920 - horizonY);

  // 1. Giant Retro 80s Sun on Horizon
  ctx.save();
  const sunX = 540, sunY = horizonY - 40;
  const sunR = 150 * sunScale;

  // Sun glow halo
  const sunHalo = ctx.createRadialGradient(sunX, sunY, sunR * 0.4, sunX, sunY, sunR * 1.5);
  sunHalo.addColorStop(0, 'rgba(255, 43, 214, 0.45)');
  sunHalo.addColorStop(0.7, 'rgba(255, 0, 127, 0.15)');
  sunHalo.addColorStop(1, 'transparent');
  ctx.fillStyle = sunHalo;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Sun disc with horizontal blind slats
  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.clip();

  const sunGrad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + sunR);
  sunGrad.addColorStop(0, '#ffe600');
  sunGrad.addColorStop(0.45, '#ff5e00');
  sunGrad.addColorStop(0.85, '#ff007f');
  sunGrad.addColorStop(1, '#ff2bd6');
  ctx.fillStyle = sunGrad;
  ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);

  // Animated horizontal dark cuts moving upwards
  ctx.fillStyle = '#05010d';
  const numStripes = 8;
  for (let s = 0; s < numStripes; s++) {
    const slatProg = (s / numStripes + (t * 0.1)) % 1;
    const slatY = sunY + slatProg * sunR;
    const slatH = 4 + slatProg * 14;
    ctx.fillRect(sunX - sunR, slatY, sunR * 2, slatH);
  }
  ctx.restore();
  ctx.restore();

  // 2. Wireframe Low-Poly Cyber Mountains on Horizon
  ctx.save();
  ctx.strokeStyle = PAL.hotPink;
  ctx.lineWidth = 2;
  const mPeaks = [
    { x: -50, y: horizonY },
    { x: 140, y: horizonY - 140 },
    { x: 320, y: horizonY - 60 },
    { x: 420, y: horizonY - 180 },
    { x: 540, y: horizonY - 80 },
    { x: 680, y: horizonY - 200 },
    { x: 820, y: horizonY - 70 },
    { x: 960, y: horizonY - 160 },
    { x: 1130, y: horizonY }
  ];

  ctx.fillStyle = 'rgba(13, 2, 33, 0.85)';
  ctx.beginPath();
  ctx.moveTo(mPeaks[0].x, mPeaks[0].y);
  for (let p = 1; p < mPeaks.length; p++) ctx.lineTo(mPeaks[p].x, mPeaks[p].y);
  ctx.lineTo(1080, horizonY);
  ctx.lineTo(0, horizonY);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Vertical mountain wireframe ribs
  for (let p = 1; p < mPeaks.length - 1; p += 2) {
    ctx.beginPath();
    ctx.moveTo(mPeaks[p].x, mPeaks[p].y);
    ctx.lineTo(mPeaks[p].x - 60, horizonY);
    ctx.moveTo(mPeaks[p].x, mPeaks[p].y);
    ctx.lineTo(mPeaks[p].x + 60, horizonY);
    ctx.stroke();
  }
  ctx.restore();

  // 3. High-Speed 3D Perspective Moving Neon Grid Floor
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizonY, 1080, 1920 - horizonY);
  ctx.clip();

  // Longitudinal vanishing lines (radiating from horizon center)
  ctx.strokeStyle = PAL.cyan;
  ctx.lineWidth = 2;
  const numLong = 24;
  for (let l = -numLong; l <= numLong; l++) {
    const bottomX = 540 + l * 95;
    ctx.beginPath();
    ctx.moveTo(540, horizonY);
    ctx.lineTo(bottomX, 1920);
    ctx.stroke();
  }

  // Transverse horizontal grid lines with exponential perspective and forward motion
  const offset = (t * gridSpeed) % 1;
  const numHoriz = 16;
  for (let h = 0; h < numHoriz; h++) {
    const prog = Math.pow((h + offset) / numHoriz, 2.8);
    const hy = horizonY + prog * (1920 - horizonY);
    ctx.lineWidth = 1 + prog * 4;
    ctx.strokeStyle = `rgba(0, 242, 254, ${clamp(0.2 + prog * 0.8, 0.1, 1)})`;
    ctx.beginPath();
    ctx.moveTo(0, hy);
    ctx.lineTo(1080, hy);
    ctx.stroke();
  }

  // Horizon Glowing Laser Line
  ctx.strokeStyle = PAL.hotPink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, horizonY); ctx.lineTo(1080, horizonY);
  ctx.stroke();
  ctx.restore();

  // Scanlines Overlay (Subtle CRT television lines)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let y = 0; y < 1920; y += 4) {
    ctx.fillRect(0, y, 1080, 1.5);
  }
}

/**
 * Cyberpunk HUD Top Banner
 */
export function synthwaveHeader(ctx, badge, title, subtitle, { col = PAL.cyan } = {}) {
  ctx.save();
  const x = 60, y = 50, w = 960, h = 145;

  // Dark Angular HUD Box with beveled corners
  ctx.fillStyle = 'rgba(13, 2, 33, 0.88)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 24, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - 24);
  ctx.lineTo(x + w - 24, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + 24);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Left neon glow brackets
  ctx.strokeStyle = PAL.magenta;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 20); ctx.lineTo(x + 12, y + h - 20);
  ctx.stroke();

  // Top Category Badge
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 28, y + 20, 240, 32, 6);
  ctx.fill();

  ctx.fillStyle = PAL.bg0;
  ctx.font = '900 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(badge, x + 148, y + 41);

  // Series Branding Right
  ctx.fillStyle = PAL.hotPink;
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('CYBERPUNK SYNTHWAVE • NO. 82', x + w - 28, y + 41);

  // Main Title
  ctx.fillStyle = PAL.white;
  ctx.font = '900 29px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, x + 28, y + 88, w - 56);

  // Subtitle
  ctx.fillStyle = PAL.cyan;
  ctx.font = '600 17px "JetBrains Mono", monospace';
  ctx.fillText(`> ${subtitle}`, x + 28, y + 122, w - 56);

  ctx.restore();
}

/**
 * Interactive Cyberpunk Hologram Circle / Reticle
 */
export function cyberReticle(ctx, cx, cy, r, {
  col = PAL.cyan,
  angle = 0,
  label = 'SYS_ACTV',
  t = 0
} = {}) {
  ctx.save();
  ctx.translate(cx, cy);

  // Outer segmented ring
  ctx.save();
  ctx.rotate(angle);
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI, Math.PI * 1.7);
  ctx.stroke();

  // Inner fast counter-rotating tick ring
  ctx.rotate(-angle * 2);
  ctx.strokeStyle = PAL.hotPink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.75, 0, Math.PI * 1.3);
  ctx.stroke();
  ctx.restore();

  // Target Crosshairs
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-r * 1.2, 0); ctx.lineTo(-r * 0.85, 0);
  ctx.moveTo(r * 0.85, 0); ctx.lineTo(r * 1.2, 0);
  ctx.moveTo(0, -r * 1.2); ctx.lineTo(0, -r * 0.85);
  ctx.moveTo(0, r * 0.85); ctx.lineTo(0, r * 1.2);
  ctx.stroke();

  // Center Hologram Badge
  if (label) {
    ctx.fillStyle = col;
    ctx.font = '900 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, 0, 5);
  }
  ctx.restore();
}

/**
 * Cyberpunk Stickman Avatar with Glowing Visor & Neon Wireframe Edge
 */
export function cyberStickman(ctx, x, y, {
  pose = 'ready', // 'ready' | 'hack' | 'scan' | 'victory'
  scale = 1.45,
  facing = 1,
  color = PAL.cyan,
  t = 0
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);

  const bob = Math.sin(t * 4) * 3;
  ctx.translate(0, bob);

  // Neon shadow on grid floor
  ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 48, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Head (Cyber Helmet)
  const headY = -125;
  ctx.fillStyle = '#0a0a1f';
  ctx.beginPath();
  ctx.arc(0, headY, 28, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Glowing Neon Visor Stripe
  ctx.fillStyle = PAL.hotPink;
  ctx.beginPath();
  ctx.roundRect(-2, headY - 6, 26, 12, 4);
  ctx.fill();

  // Visor Scanline Spark
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(10 + Math.sin(t * 10) * 8, headY, 3, 0, Math.PI * 2);
  ctx.fill();

  // 2. Torso with cyber armor vest
  ctx.beginPath();
  ctx.moveTo(0, headY + 28);
  ctx.lineTo(0, -35);
  ctx.stroke();

  // Neon Core Reactor in Chest
  ctx.fillStyle = PAL.magenta;
  ctx.beginPath();
  ctx.arc(0, headY + 52, 7, 0, Math.PI * 2);
  ctx.fill();

  // 3. Legs
  ctx.beginPath();
  ctx.moveTo(0, -35); ctx.lineTo(-18, 0);
  ctx.moveTo(0, -35); ctx.lineTo(18, 0);
  ctx.stroke();

  // 4. Arms & Cyber Props
  if (pose === 'hack') {
    // Both hands raised tapping glowing holographic floating keyboards
    ctx.beginPath();
    ctx.moveTo(0, headY + 45); ctx.lineTo(24, headY + 30); ctx.lineTo(48, headY + 15);
    ctx.moveTo(0, headY + 45); ctx.lineTo(-24, headY + 30); ctx.lineTo(-48, headY + 15);
    ctx.stroke();

    // Floating Neon Keycode matrix in front of hands
    ctx.strokeStyle = PAL.cyan;
    ctx.lineWidth = 2;
    ctx.strokeRect(30, headY - 10, 55, 35);
    ctx.strokeRect(-85, headY - 10, 55, 35);

    ctx.fillStyle = PAL.cyan;
    ctx.font = '800 10px "JetBrains Mono", monospace';
    ctx.fillText('0101', 40, headY + 12);
    ctx.fillText('EXEC', -75, headY + 12);

  } else if (pose === 'victory') {
    // Both arms raised triumphantly
    ctx.beginPath();
    ctx.moveTo(0, headY + 45); ctx.lineTo(-30, headY + 10); ctx.lineTo(-45, headY - 25);
    ctx.moveTo(0, headY + 45); ctx.lineTo(30, headY + 10); ctx.lineTo(45, headY - 25);
    ctx.stroke();
  } else {
    // Standing ready
    ctx.beginPath();
    ctx.moveTo(0, headY + 45); ctx.lineTo(-20, headY + 65); ctx.lineTo(-14, headY + 80);
    ctx.moveTo(0, headY + 45); ctx.lineTo(22, headY + 55); ctx.lineTo(36, headY + 35);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Floating Cyberpunk Callout Card at y: 1485
 */
export function synthwaveCallout(ctx, cx, cy, w, h, {
  tag = 'CYBERNETIC ALGORITHM',
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

  // Dark Translucent HUD Surface with corner cuts
  ctx.fillStyle = 'rgba(8, 2, 22, 0.92)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 18, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - 18);
  ctx.lineTo(x + w - 18, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + 18);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Left Neon Magenta Accent Bar
  ctx.fillStyle = PAL.magenta;
  ctx.beginPath();
  ctx.roundRect(x + 16, y + 18, 8, h - 36, 4);
  ctx.fill();

  const maxTextW = stat ? w - 265 : w - 70;
  ctx.textAlign = 'left';

  // Tag
  ctx.fillStyle = col;
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.fillText(tag, x + 40, y + 42, maxTextW);

  // Title
  ctx.fillStyle = PAL.white;
  ctx.font = '800 23px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, x + 40, y + 84, maxTextW);

  // Desc
  ctx.fillStyle = PAL.cyan;
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.fillText(`// ${desc}`, x + 40, y + 124, maxTextW);

  // Right Stat Box
  if (stat) {
    const sw = 185, sh = h - 34;
    const sx = x + w - sw - 20, sy = y + 17;

    ctx.fillStyle = 'rgba(255, 0, 127, 0.12)';
    ctx.strokeStyle = PAL.magenta;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 10);
    ctx.fill(); ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.hotPink;
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

