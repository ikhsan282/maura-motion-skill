// 83 · KEBUN & LIFEHACKS SANTAI — Style Kit
// Reusable components for practical gardening, step-by-step home lifehacks, interactive quiz, and sprout mascot

import { clamp, lerp, ease } from '/engine/lib/core.js';

export const PAL = {
  skyTop: '#7dd3fc',
  skyBottom: '#38bdf8',
  sun: '#fde047',
  sunGlow: 'rgba(254, 240, 138, 0.45)',
  cloud: '#ffffff',
  hillDark: '#22c55e',
  hillLight: '#4ade80',
  soilLight: '#fb923c',
  soilMid: '#f97316',
  soilDark: '#ea580c',
  soilStepRim: '#fed7aa',
  darkCard: '#2d3627',
  darkCardBorder: '#3f4e37',
  frostedGlass: 'rgba(255, 255, 255, 0.92)',
  frostedGlassBorder: 'rgba(255, 255, 255, 0.65)',
  yellowPill: '#facc15',
  greenSuccess: '#10b981',
  redDanger: '#ef4444',
  mascotBody: '#fb923c',
  mascotLeaf: '#22c55e',
  ink: '#0f172a',
  inkMuted: '#64748b',
  white: '#ffffff',
};

/**
 * Camera utility for smooth zooms and pans
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
 * Sunny Blue Sky + Rolling Green Hills + Stepped Terracotta Loam Soil Background
 */
export function terraceBg(ctx, t, {
  sunScale = 1.0,
  horizonY = 560
} = {}) {
  // 1. Sky Gradient
  const sky = ctx.createLinearGradient(540, 0, 540, horizonY);
  sky.addColorStop(0, PAL.skyTop);
  sky.addColorStop(1, PAL.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1080, horizonY + 20);

  // 2. Sunny Sun with Soft Radial Glow
  const sunX = 850, sunY = 170;
  const sunR = 85 * sunScale;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.4, sunX, sunY, sunR * 1.8);
  sunGlow.addColorStop(0, 'rgba(253, 224, 71, 0.65)');
  sunGlow.addColorStop(0.5, 'rgba(254, 240, 138, 0.25)');
  sunGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = PAL.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // 3. Floating Soft Clouds
  const clouds = [
    { x: 180 + Math.sin(t * 0.4) * 20, y: 160, w: 190, h: 65 },
    { x: 620 + Math.cos(t * 0.3) * 25, y: 290, w: 160, h: 55 },
    { x: 920 + Math.sin(t * 0.35) * 15, y: 340, w: 140, h: 50 }
  ];

  clouds.forEach(c => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.roundRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h, c.h / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(c.x - c.w * 0.2, c.y - c.h * 0.25, c.h * 0.55, 0, Math.PI * 2);
    ctx.arc(c.x + c.w * 0.15, c.y - c.h * 0.2, c.h * 0.45, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Rolling Green Hills (Back and Front)
  // Back Hill (Deeper Green)
  ctx.fillStyle = PAL.hillDark;
  ctx.beginPath();
  ctx.moveTo(0, horizonY - 40);
  ctx.quadraticCurveTo(340, horizonY - 120, 680, horizonY - 50);
  ctx.quadraticCurveTo(900, horizonY - 10, 1080, horizonY - 30);
  ctx.lineTo(1080, horizonY + 60);
  ctx.lineTo(0, horizonY + 60);
  ctx.closePath();
  ctx.fill();

  // Front Hill (Lighter Fresh Green)
  ctx.fillStyle = PAL.hillLight;
  ctx.beginPath();
  ctx.moveTo(0, horizonY + 20);
  ctx.quadraticCurveTo(280, horizonY - 60, 620, horizonY);
  ctx.quadraticCurveTo(860, horizonY + 40, 1080, horizonY + 10);
  ctx.lineTo(1080, horizonY + 70);
  ctx.lineTo(0, horizonY + 70);
  ctx.closePath();
  ctx.fill();

  // 5. Stepped Terracotta / Clay Terrace Ground (Bottom 55% of canvas)
  const stepStart = horizonY + 50;
  const numSteps = 7;
  const stepH = (1920 - stepStart) / numSteps;

  for (let s = 0; s < numSteps; s++) {
    const sy = stepStart + s * stepH;
    ctx.fillStyle = s % 2 === 0 ? PAL.soilLight : PAL.soilMid;
    ctx.fillRect(0, sy, 1080, stepH);

    // Subtle highlighted step rim
    ctx.strokeStyle = PAL.soilStepRim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(1080, sy);
    ctx.stroke();

    // Darker drop shadow below rim
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, sy + 3, 1080, 8);
  }
}

/**
 * Top Frosted Glassmorphism Educational Step Card (y: 60..780)
 */
export function stepCard(ctx, cx, cy, w, h, {
  stepBadge = 'LANGKAH 1/5',
  badgeCol = PAL.ink,
  subBadge = '',
  subBadgeCol = PAL.greenSuccess,
  fnContent = null
} = {}) {
  const x = cx - w / 2, y = cy - h / 2;

  ctx.save();
  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 10, w, h, 28);
  ctx.fill();

  // White Frosted Body
  ctx.fillStyle = PAL.frostedGlass;
  ctx.strokeStyle = PAL.frostedGlassBorder;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 28);
  ctx.fill();
  ctx.stroke();

  // Step Badge Pill (Top Left: e.g. LANGKAH 1/5 or KUIS)
  if (stepBadge) {
    ctx.font = '900 16px "JetBrains Mono", monospace';
    const bw = Math.max(160, ctx.measureText(stepBadge).width + 36);
    const bh = 38;
    const bx = x + 30, by = y + 25;

    ctx.fillStyle = badgeCol;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 12);
    ctx.fill();

    ctx.fillStyle = PAL.white;
    ctx.textAlign = 'center';
    ctx.fillText(stepBadge, bx + bw / 2, by + 25);
  }

  // Sub-badge pill (e.g. "✔ Tempat teduh, bukan terik")
  if (subBadge) {
    ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
    const sw = ctx.measureText(subBadge).width + 32;
    const sh = 34;
    const sx = x + 30, sy = y + 74;

    ctx.fillStyle = subBadgeCol;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 10);
    ctx.fill();

    ctx.fillStyle = PAL.white;
    ctx.textAlign = 'center';
    ctx.fillText(subBadge, sx + sw / 2, sy + 23);
  }

  // Inner Illustration Callback
  if (typeof fnContent === 'function') {
    ctx.save();
    fnContent(ctx, x, y, w, h);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Interactive Quiz Card (A, B, C Options with Timer Progress Bar)
 */
export function interactiveQuiz(ctx, cx, cy, w, h, {
  question = 'Tebak, satu pohon berbuah sampai kapan?',
  options = [
    { label: 'A', text: '3 bulan' },
    { label: 'B', text: '1 tahun' },
    { label: 'C', text: '±2 tahun' }
  ],
  selected = -1, // -1: none, 0: A, 1: B, 2: C
  progress = 0.8
} = {}) {
  const x = cx - w / 2, y = cy - h / 2;

  ctx.save();
  // Question Title
  ctx.fillStyle = PAL.ink;
  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(question, cx, y + 90, w - 60);

  // 3 Option Pills
  const optH = 62;
  const optGap = 16;
  const startY = y + 130;

  options.forEach((opt, idx) => {
    const oy = startY + idx * (optH + optGap);
    const isSel = selected === idx;

    // Option Background
    ctx.fillStyle = isSel ? PAL.yellowPill : PAL.white;
    ctx.strokeStyle = isSel ? '#eab308' : '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 240, oy, 480, optH, 16);
    ctx.fill(); ctx.stroke();

    // Circle Label (A, B, C)
    ctx.fillStyle = isSel ? '#b45309' : PAL.sun;
    ctx.beginPath();
    ctx.arc(cx - 200, oy + optH / 2, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isSel ? PAL.white : PAL.ink;
    ctx.font = '900 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(opt.label, cx - 200, oy + optH / 2 + 6);

    // Option Text
    ctx.fillStyle = PAL.ink;
    ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(opt.text, cx - 160, oy + optH / 2 + 7);
  });

  // Timer Progress Bar at Bottom
  const barY = startY + 3 * (optH + optGap) + 10;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.roundRect(cx - 240, barY, 480, 8, 4);
  ctx.fill();

  ctx.fillStyle = PAL.yellowPill;
  ctx.beginPath();
  ctx.roundRect(cx - 240, barY, 480 * clamp(progress, 0, 1), 8, 4);
  ctx.fill();

  ctx.restore();
}

/**
 * Split Comparison Columns (e.g. "✔ Pagi / sore" vs "✖ Siang bolong")
 */
export function splitComparison(ctx, cx, cy, w, h, {
  leftTitle = 'Pagi / sore',
  leftStatus = true,
  leftSub = 'Sejuk & akar menyerap air',
  rightTitle = 'Siang bolong',
  rightStatus = false,
  rightSub = 'Air menguap & daun layu!'
} = {}) {
  const x = cx - w / 2, y = cy - h / 2;
  const colW = (w - 70) / 2;

  // Left Column
  const lx = x + 25;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.strokeStyle = leftStatus ? PAL.greenSuccess : PAL.redDanger;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(lx, y + 20, colW, h - 40, 18);
  ctx.fill(); ctx.stroke();

  // Left Tag
  ctx.fillStyle = leftStatus ? PAL.greenSuccess : PAL.redDanger;
  ctx.beginPath();
  ctx.roundRect(lx + 15, y + 35, colW - 30, 36, 10);
  ctx.fill();

  ctx.fillStyle = PAL.white;
  ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${leftStatus ? '✔' : '✖'} ${leftTitle}`, lx + colW / 2, y + 59);

  // Left Sub
  ctx.fillStyle = PAL.ink;
  ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(leftSub, lx + colW / 2, y + 110, colW - 20);

  // Right Column
  const rx = x + 45 + colW;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.strokeStyle = rightStatus ? PAL.greenSuccess : PAL.redDanger;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(rx, y + 20, colW, h - 40, 18);
  ctx.fill(); ctx.stroke();

  // Right Tag
  ctx.fillStyle = rightStatus ? PAL.greenSuccess : PAL.redDanger;
  ctx.beginPath();
  ctx.roundRect(rx + 15, y + 35, colW - 30, 36, 10);
  ctx.fill();

  ctx.fillStyle = PAL.white;
  ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${rightStatus ? '✔' : '✖'} ${rightTitle}`, rx + colW / 2, y + 59);

  // Right Sub
  ctx.fillStyle = PAL.ink;
  ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(rightSub, rx + colW / 2, y + 110, colW - 20);
}

/**
 * Center Narrative Karaoke Subtitle Card (y: 980..1220)
 * Dark Olive-Slate Card with Yellow Pill Keyword Highlights
 */
export function karaokeCard(ctx, cx, cy, w, h, {
  lines = [], // array of strings or segments
  highlights = [] // words to highlight in yellow pill
} = {}) {
  const x = cx - w / 2, y = cy - h / 2;

  ctx.save();
  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 8, w, h, 24);
  ctx.fill();

  // Dark Olive-Slate Box
  ctx.fillStyle = PAL.darkCard;
  ctx.strokeStyle = PAL.darkCardBorder;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 24);
  ctx.fill(); ctx.stroke();

  // Draw Lines with Highlighting
  ctx.textAlign = 'center';
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';

  const lineCount = lines.length;
  const startY = cy - ((lineCount - 1) * 44) / 2 + 8;

  lines.forEach((lineText, idx) => {
    const ly = startY + idx * 44;

    // Check if line contains a highlighted term
    let isHighlighted = false;
    let hlWord = '';
    for (const hw of highlights) {
      if (lineText.includes(hw)) {
        isHighlighted = true;
        hlWord = hw;
        break;
      }
    }

    if (isHighlighted) {
      // Draw highlighted yellow pill behind the text
      const tw = ctx.measureText(lineText).width;
      const pw = tw + 28;
      const ph = 40;
      ctx.fillStyle = PAL.yellowPill;
      ctx.beginPath();
      ctx.roundRect(cx - pw / 2, ly - 30, pw, ph, 10);
      ctx.fill();

      // Black text inside yellow pill
      ctx.fillStyle = PAL.ink;
      ctx.fillText(lineText, cx, ly);
    } else {
      // Normal white text
      ctx.fillStyle = PAL.white;
      ctx.fillText(lineText, cx, ly);
    }
  });

  ctx.restore();
}

/**
 * Cute Responsive Sprout Mascot ("Si Tunas / Si Benih")
 */
export function sproutMascot(ctx, x, y, {
  scale = 1.3,
  pose = 'happy', // 'shock' | 'think' | 'happy'
  t = 0
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const bob = Math.sin(t * 4) * 3;
  ctx.translate(0, bob);

  // Soft Mascot Drop Shadow on Ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 48, 55, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Sprout Leaf on Top of Head
  ctx.save();
  ctx.fillStyle = PAL.mascotLeaf;
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 3;

  // Stem
  ctx.beginPath();
  ctx.moveTo(0, -42);
  ctx.quadraticCurveTo(0, -62, -5, -70);
  ctx.stroke();

  // Left Leaf
  ctx.beginPath();
  ctx.moveTo(-5, -68);
  ctx.quadraticCurveTo(-28, -82, -22, -60);
  ctx.quadraticCurveTo(-10, -58, -5, -68);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Right Leaf
  ctx.beginPath();
  ctx.moveTo(-4, -68);
  ctx.quadraticCurveTo(18, -85, 24, -65);
  ctx.quadraticCurveTo(8, -60, -4, -68);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();

  // 2. Round Orange Mascot Body (Tangerine / Persimmon / Seed Shape)
  ctx.fillStyle = PAL.mascotBody;
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 52, 48, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Light highlight shine on top-left of body
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-18, -18, 16, 9, -0.6, 0, Math.PI * 2);
  ctx.fill();

  // 3. Rosy Pink Cheeks
  ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
  ctx.beginPath();
  ctx.ellipse(-30, 8, 8, 5, 0, 0, Math.PI * 2);
  ctx.ellipse(30, 8, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Expressive Kawaii Eyes & Mouth
  if (pose === 'shock') {
    // Wide round shocked eyes
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(-14, -2, 8, 0, Math.PI * 2);
    ctx.arc(14, -2, 8, 0, Math.PI * 2);
    ctx.fill();

    // White specular dots
    ctx.fillStyle = PAL.white;
    ctx.beginPath();
    ctx.arc(-16, -4, 3, 0, Math.PI * 2);
    ctx.arc(12, -4, 3, 0, Math.PI * 2);
    ctx.fill();

    // Open round mouth (:o)
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(0, 16, 6, 0, Math.PI * 2);
    ctx.fill();

  } else if (pose === 'think') {
    // Tilted curious eyes looking up
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(-14, -6, 7, 0, Math.PI * 2);
    ctx.arc(14, -6, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PAL.white;
    ctx.beginPath();
    ctx.arc(-15, -8, 2.5, 0, Math.PI * 2);
    ctx.arc(13, -8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Tilted eyebrow
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-22, -18); ctx.lineTo(-8, -15);
    ctx.stroke();

    // Flat thoughtful mouth
    ctx.beginPath();
    ctx.moveTo(-6, 16); ctx.lineTo(6, 16);
    ctx.stroke();

  } else {
    // Happy smiling face (^_^)
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Left curved eye
    ctx.beginPath();
    ctx.arc(-14, -2, 8, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // Right curved eye
    ctx.beginPath();
    ctx.arc(14, -2, 8, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    // Happy smiling mouth
    ctx.beginPath();
    ctx.arc(0, 10, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Educational Callout Card (Floating at y: 1485, h: 165)
 */
export function kebunCallout(ctx, cx, cy, w, h, {
  tag = 'PANDUAN PRAKTIS',
  title = '',
  desc = '',
  stat = '',
  statSub = '',
  col = PAL.greenSuccess,
  a = 1
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);
  const x = cx - w / 2, y = cy - h / 2;

  // Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 8, w, h, 22);
  ctx.fill();

  // White Clean Surface
  ctx.fillStyle = PAL.white;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 22);
  ctx.fill(); ctx.stroke();

  // Left Green / Coral Accent Bar
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
  ctx.fillStyle = PAL.ink;
  ctx.font = '800 23px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, x + 42, y + 84, maxTextW);

  // Desc
  ctx.fillStyle = PAL.inkMuted;
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(desc, x + 42, y + 124, maxTextW);

  // Right Stat Box
  if (stat) {
    const sw = 185, sh = h - 34;
    const sx = x + w - sw - 20, sy = y + 17;

    ctx.fillStyle = 'rgba(240, 253, 244, 0.95)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 14);
    ctx.fill(); ctx.stroke();

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

