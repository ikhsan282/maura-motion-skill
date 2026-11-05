// 78 · STICKMAN OVERSIMPLIFIED — Full-Screen Multi-Scene Educational Cartoon Kit
import { clamp, lerp } from '/engine/lib/core.js';

export const PAL = {
  ink: '#23120b',
  skin: '#fbead2',
  skinShade: '#e8cfa8',
  hairBrown: '#4e2708',
  hairGrey: '#b8bac6',
  coatBlue: '#0b488f',
  coatBrown: '#6b3e16',
  coatGreen: '#3b6e1c',
  coatTeal: '#0d5669',
  coatWhite: '#f4f5f7',
  gold: '#f7c625',
  amber: '#e88b1a',
  red: '#d93829',
  green: '#2b9348',
  tealJar: '#53cbb8',
  skyTop: '#2976d6',
  skyBot: '#6cb0f0',
  cobble: '#57586b',
  cobbleDark: '#3f4052',
  wallLight: '#f6e7b2',
  wallStripe: '#ebd58d',
  woodTop: '#d48322',
  woodFront: '#a3560d',
  white: '#ffffff',
};

/**
 * Camera helper: applies smooth zoom & pan around a focal point (fx, fy)
 */
export function withCamera(ctx, { zoom = 1, fx = 540, fy = 960, dx = 0, dy = 0 } = {}, fn) {
  ctx.save();
  ctx.translate(540 + dx, 960 + dy);
  ctx.scale(zoom, zoom);
  ctx.translate(-fx, -fy);
  fn();
  ctx.restore();
}

/**
 * Top Educational Floating Pill Banner (non-intrusive, keeps 100% full-screen cartoon world visible)
 */
export function drawEduBanner(ctx, badgeText, titleText, subText, { col = PAL.gold } = {}) {
  ctx.save();
  // Soft shadow
  ctx.fillStyle = 'rgba(15, 10, 8, 0.86)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(42, 42, 996, 128, 24);
  ctx.fill();
  ctx.stroke();

  // Year / Step Pill
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(62, 60, 176, 92, 16);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 32px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, 150, 106, 160);

  // Title & Subtitle
  ctx.textAlign = 'left';
  ctx.fillStyle = PAL.white;
  ctx.font = '900 30px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(titleText, 262, 88, 750);

  ctx.fillStyle = '#fde68a';
  ctx.font = '700 20px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(subText, 262, 130, 750);
  ctx.restore();
}

/**
 * Floating Educational Callout Card (placed contextually inside the scene without blocking the world)
 */
export function drawEduCallout(ctx, x, y, w, h, {
  tag = 'FAKTA SAINS',
  title = '',
  desc = '',
  stat = '',
  col = PAL.gold,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.9 + 0.1 * a, 0.9 + 0.1 * a);
  ctx.globalAlpha = clamp(a, 0, 1);

  ctx.fillStyle = 'rgba(20, 15, 12, 0.90)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 22);
  ctx.fill();
  ctx.stroke();

  // Tag pill
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 24, -h / 2 + 18, 290, 30, 8);
  ctx.fill();
  ctx.fillStyle = PAL.ink;
  ctx.font = '900 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, -w / 2 + 36, -h / 2 + 33, 266);

  const textW = stat ? w - 240 : w - 56;
  ctx.fillStyle = PAL.white;
  ctx.font = '800 25px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(title, -w / 2 + 24, -h / 2 + 78, textW);

  ctx.fillStyle = '#e7dfd5';
  ctx.font = '600 19px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(desc, -w / 2 + 24, -h / 2 + 116, textW);

  if (stat) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 196, -h / 2 + 22, 172, h - 44, 16);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = PAL.ink;
    ctx.font = '900 26px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stat, w / 2 - 110, 0, 156);
  }

  ctx.restore();
}

/**
 * Signature Character: Stickman OverSimplified (Full-body or Counter-body)
 * Supports multiple historical roles:
 * - 'edmond' / 'young': swept brown bowl-cut hair
 * - 'mentor' / 'dad': grey bowl-cut hair + spectacles
 * - 'einstein': wild spiky white hair + mustache
 * - 'tophat': tall Victorian top hat + skeptical/snooty face
 * - 'bowler': 19th-century brown hat (Charles Fritts / Inspector)
 */
export function drawStickman(ctx, x, y, {
  pose = 'happy', // 'happy' | 'excited' | 'focused' | 'shocked' | 'skeptical' | 'sad'
  hairStyle = 'bowl', // 'bowl' | 'einstein' | 'tophat' | 'bowler'
  coatColor = PAL.coatBlue,
  hairColor = PAL.hairBrown,
  prop = 'none', // 'solar_jar' | 'wire_up' | 'medal' | 'cell_disc' | 'wash_basin' | 'petri' | 'chocolate'
  scale = 1,
  t = 0,
  showLegs = true,
  walkSpeed = 0,
  glasses = false,
  mustache = false,
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const bob = walkSpeed > 0 ? Math.abs(Math.sin(t * walkSpeed)) * 6 : Math.sin(t * 3.2) * 3;
  const stride = walkSpeed > 0 ? Math.sin(t * walkSpeed) * 24 : 0;

  if (showLegs) {
    // Ground shadow
    ctx.fillStyle = 'rgba(10, 10, 22, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 72, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Long thin stick legs
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-26, -185 + bob);
    ctx.lineTo(-28 - stride * 0.5, -90);
    ctx.lineTo(-30 - stride, 0);
    ctx.moveTo(26, -185 + bob);
    ctx.lineTo(28 + stride * 0.5, -90);
    ctx.lineTo(30 + stride, 0);
    ctx.stroke();

    // Shoes
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.roundRect(-54 - stride, -12, 38, 13, 6);
    ctx.roundRect(16 + stride, -12, 38, 13, 6);
    ctx.fill();
  }

  ctx.translate(0, bob);
  const torsoY = showLegs ? -275 : -98;
  const headY = torsoY - 140;

  // Left Arm
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-60, torsoY - 48);
  ctx.quadraticCurveTo(-92, torsoY + 10, -84, torsoY + 66);
  ctx.stroke();
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(-84, torsoY + 68, 10, 0, Math.PI * 2);
  ctx.fill();

  // Right Arm (gesturing up if holding wire/medal/disc, else in front)
  if (prop === 'wire_up' || prop === 'medal' || prop === 'cell_disc') {
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(58, torsoY - 42);
    ctx.quadraticCurveTo(105, torsoY - 68, 128, torsoY - 118);
    ctx.stroke();
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(128, torsoY - 120, 10, 0, Math.PI * 2);
    ctx.fill();

    if (prop === 'wire_up') {
      // Glowing orange copper wire in hand
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(45, torsoY + 35);
      ctx.bezierCurveTo(155, torsoY - 15, 165, torsoY - 95, 128, torsoY - 120);
      ctx.stroke();
    } else if (prop === 'medal') {
      // Golden Nobel Medal
      ctx.fillStyle = PAL.gold;
      ctx.beginPath();
      ctx.arc(132, torsoY - 134, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(132, torsoY - 134, 20, 0, Math.PI * 2);
      ctx.stroke();
    } else if (prop === 'cell_disc') {
      // White circle disc with dark square solar wafer
      ctx.fillStyle = PAL.white;
      ctx.beginPath();
      ctx.arc(132, torsoY - 134, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4.5;
      ctx.stroke();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(121, torsoY - 145, 22, 22);
    }
  }

  // BEAN / PILL TORSO
  ctx.fillStyle = coatColor;
  ctx.beginPath();
  ctx.ellipse(0, torsoY, 68, 94, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 7.5;
  ctx.stroke();

  // 4 Vertical Coat Buttons
  for (let i = 0; i < 4; i++) {
    const by = torsoY - 46 + i * 30;
    ctx.fillStyle = coatColor === PAL.coatWhite ? '#94a3b8' : PAL.gold;
    ctx.beginPath();
    ctx.arc(-4, by, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Chest Props (solar_jar, wash_basin, petri, chocolate)
  if (prop === 'solar_jar') {
    const jx = 38;
    const jy = torsoY - 12;
    const glow = ctx.createRadialGradient(jx + 8, jy - 54, 4, jx + 8, jy - 54, 72);
    glow.addColorStop(0, 'rgba(255, 245, 158, 0.9)');
    glow.addColorStop(1, 'rgba(255, 245, 158, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(jx + 8, jy - 54, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d8edf7';
    ctx.beginPath();
    ctx.roundRect(jx - 32, jy - 44, 64, 88, 10);
    ctx.fill();
    ctx.fillStyle = '#ffca18';
    ctx.beginPath();
    ctx.roundRect(jx - 28, jy - 12, 56, 52, 6);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4.5;
    ctx.strokeRect(jx - 32, jy - 44, 64, 88);

    // Electrodes
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(jx - 16, jy - 56, 10, 70);
    ctx.strokeRect(jx - 16, jy - 56, 10, 70);
    ctx.fillRect(jx + 8, jy - 60, 10, 74);
    ctx.strokeRect(jx + 8, jy - 60, 10, 74);

    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(jx, jy + 32, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (prop === 'wash_basin') {
    const bx = 42;
    const by = torsoY + 10;
    ctx.fillStyle = '#74c0fc';
    ctx.beginPath();
    ctx.roundRect(bx - 42, by - 20, 84, 42, 14);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4.5;
    ctx.stroke();
    // Bubbles
    ctx.fillStyle = PAL.white;
    ctx.beginPath();
    ctx.arc(bx - 16, by - 22, 10, 0, Math.PI * 2);
    ctx.arc(bx + 4, by - 26, 13, 0, Math.PI * 2);
    ctx.arc(bx + 22, by - 20, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (prop === 'petri') {
    const px = 44;
    const py = torsoY + 8;
    ctx.fillStyle = '#d8f3dc';
    ctx.beginPath();
    ctx.ellipse(px, py, 40, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(px - 10, py - 2, 11, 0, Math.PI * 2);
    ctx.fill();
  }

  // EINSTEIN SPIKY WHITE HAIR HALO (drawn behind head)
  if (hairStyle === 'einstein') {
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    const spikes = 18;
    for (let i = 0; i <= spikes; i++) {
      const a = Math.PI * 0.85 + (i / spikes) * Math.PI * 1.3;
      const rOut = i % 2 === 0 ? 124 : 86;
      const sx = Math.cos(a) * rOut;
      const sy = headY - 6 + Math.sin(a) * (rOut * 0.88);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // HEAD (Wide Oval Cream Head)
  ctx.fillStyle = PAL.skin;
  ctx.beginPath();
  ctx.ellipse(0, headY, 88, 74, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 7.5;
  ctx.stroke();

  // HAIR / HAT STYLES
  if (hairStyle === 'bowl') {
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(0, headY - 4, 88, Math.PI * 0.96, Math.PI * 2.04);
    ctx.lineTo(86, headY - 12);
    ctx.lineTo(44, headY - 6);
    ctx.lineTo(0, headY - 16);
    ctx.lineTo(-44, headY - 6);
    ctx.lineTo(-86, headY - 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Hair part lines
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(8, headY - 54);
    ctx.lineTo(-4, headY - 24);
    ctx.moveTo(-38, headY - 30);
    ctx.lineTo(-8, headY - 28);
    ctx.moveTo(8, headY - 28);
    ctx.lineTo(38, headY - 30);
    ctx.stroke();
  } else if (hairStyle === 'tophat') {
    // Tall Victorian Top Hat
    ctx.fillStyle = '#18181f';
    ctx.beginPath();
    ctx.roundRect(-58, headY - 158, 116, 104, 6);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 6;
    ctx.stroke();
    // Ribbon
    ctx.fillStyle = coatColor === PAL.coatGreen ? '#3b8c2a' : '#991b1b';
    ctx.fillRect(-56, headY - 76, 112, 16);
    // Brim
    ctx.fillStyle = '#18181f';
    ctx.beginPath();
    ctx.ellipse(0, headY - 54, 98, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hairStyle === 'bowler') {
    // Wide-brimmed 1880s inventor hat
    ctx.fillStyle = '#432818';
    ctx.beginPath();
    ctx.arc(0, headY - 48, 68, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, headY - 48, 108, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hairStyle === 'einstein') {
    // Forehead wrinkles
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-26, headY - 38);
    ctx.lineTo(26, headY - 38);
    ctx.moveTo(-18, headY - 26);
    ctx.lineTo(22, headY - 26);
    ctx.stroke();
  }

  if (glasses) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(-24, headY + 4, 17, 0, Math.PI * 2);
    ctx.arc(24, headY + 4, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-7, headY + 4);
    ctx.lineTo(7, headY + 4);
    ctx.stroke();
  }

  // EYES
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  if (pose === 'happy') {
    ctx.beginPath();
    ctx.arc(-24, headY + 6, 13, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(24, headY + 6, 13, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (pose === 'excited') {
    ctx.beginPath();
    ctx.moveTo(-36, headY - 4);
    ctx.lineTo(-14, headY + 6);
    ctx.lineTo(-36, headY + 14);
    ctx.moveTo(36, headY - 4);
    ctx.lineTo(14, headY + 6);
    ctx.lineTo(36, headY + 14);
    ctx.stroke();
  } else if (pose === 'skeptical') {
    // Angry / skeptical furrowed brows & half-lidded eyes
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(-24, headY + 6, 6, 0, Math.PI * 2);
    ctx.arc(24, headY + 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-38, headY - 10);
    ctx.lineTo(-10, headY - 2);
    ctx.moveTo(38, headY - 10);
    ctx.lineTo(10, headY - 2);
    ctx.stroke();
  } else if (pose === 'focused') {
    ctx.beginPath();
    ctx.moveTo(-34, headY + 4);
    ctx.lineTo(-12, headY + 4);
    ctx.moveTo(12, headY + 4);
    ctx.lineTo(34, headY + 4);
    ctx.stroke();
  } else {
    // Shocked / confused round dot eyes
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(-22, headY + 4, 6.5, 0, Math.PI * 2);
    ctx.arc(22, headY + 4, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // MOUTH
  if (pose === 'happy' || pose === 'excited') {
    const mw = pose === 'excited' ? 32 : 24;
    const mh = pose === 'excited' ? 22 : 16;
    ctx.fillStyle = '#4a1c12';
    ctx.beginPath();
    ctx.moveTo(-mw, headY + 24);
    ctx.lineTo(mw, headY + 24);
    ctx.quadraticCurveTo(mw, headY + 24 + mh, 0, headY + 24 + mh);
    ctx.quadraticCurveTo(-mw, headY + 24 + mh, -mw, headY + 24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = PAL.white;
    ctx.fillRect(-mw + 3, headY + 25, (mw - 3) * 2, 5);
    ctx.fillStyle = '#e87a64';
    ctx.beginPath();
    ctx.ellipse(0, headY + 24 + mh - 5, mw * 0.45, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (pose === 'shocked') {
    // Wavy confused squiggle mouth ~
    ctx.beginPath();
    ctx.moveTo(-18, headY + 28);
    ctx.quadraticCurveTo(-9, headY + 20, 0, headY + 28);
    ctx.quadraticCurveTo(9, headY + 36, 18, headY + 28);
    ctx.stroke();
  } else if (pose === 'skeptical' || pose === 'sad') {
    // Frown
    ctx.beginPath();
    ctx.arc(0, headY + 38, 16, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(0, headY + 22, 14, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }

  if (mustache) {
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.ellipse(0, headY + 20, 28, 9, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * SCENE A: Full-Screen 19th-Century European Cobblestone Street (y: 0..1920)
 */
export function drawStreetWorld(ctx, t) {
  ctx.save();
  // Sky
  const skyG = ctx.createLinearGradient(0, 0, 0, 1080);
  skyG.addColorStop(0, PAL.skyTop);
  skyG.addColorStop(1, PAL.skyBot);
  ctx.fillStyle = skyG;
  ctx.fillRect(0, 0, 1080, 1080);

  // Fluffy Clouds
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  const cx = 760 + Math.sin(t * 0.35) * 24;
  ctx.beginPath();
  ctx.arc(cx, 250, 72, 0, Math.PI * 2);
  ctx.arc(cx + 68, 236, 86, 0, Math.PI * 2);
  ctx.arc(cx + 145, 256, 62, 0, Math.PI * 2);
  ctx.arc(cx - 58, 264, 54, 0, Math.PI * 2);
  ctx.fill();

  // Perspective 19th-Century Townhouses receding from left to right
  const buildings = [
    { x: 0, w: 220, topY: 160, botY: 1020, col: '#e29f38', shutter: '#1d6ec2', rows: 4, cols: 2 },
    { x: 220, w: 300, topY: 260, botY: 995, col: '#cc6733', shutter: '#227834', rows: 4, cols: 3 },
    { x: 520, w: 240, topY: 380, botY: 970, col: '#ebbc4c', shutter: '#3b73b5', rows: 3, cols: 3 },
    { x: 760, w: 190, topY: 470, botY: 952, col: '#d99a36', shutter: '#227834', rows: 3, cols: 2 },
    { x: 950, w: 130, topY: 540, botY: 940, col: '#c97c3a', shutter: '#3b73b5', rows: 2, cols: 2 },
  ];

  buildings.forEach((b) => {
    ctx.fillStyle = b.col;
    ctx.beginPath();
    ctx.moveTo(b.x, b.topY);
    ctx.lineTo(b.x + b.w, b.topY + 65);
    ctx.lineTo(b.x + b.w, b.botY - 14);
    ctx.lineTo(b.x, b.botY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,18,10,0.4)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Roof cornice
    ctx.strokeStyle = '#4a2a14';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(b.x, b.topY);
    ctx.lineTo(b.x + b.w, b.topY + 65);
    ctx.stroke();

    const winW = Math.max(22, (b.w / (b.cols + 1)) * 0.48);
    const winH = Math.max(46, ((b.botY - b.topY - 120) / (b.rows + 0.6)) * 0.56);
    for (let r = 0; r < b.rows; r++) {
      for (let c = 0; c < b.cols; c++) {
        const fracX = (c + 0.7) / (b.cols + 0.4);
        const wx = b.x + fracX * b.w;
        const slopeY = b.topY + fracX * 65;
        const wy = slopeY + 42 + r * (winH + 34);
        if (wy + winH > b.botY - 36) continue;

        ctx.fillStyle = b.shutter;
        ctx.fillRect(wx - winW * 0.85, wy, winW * 0.35, winH);
        ctx.fillRect(wx + winW * 0.5, wy, winW * 0.35, winH);

        ctx.fillStyle = '#d8e6f5';
        ctx.fillRect(wx - winW * 0.5, wy, winW, winH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(wx - winW * 0.5, wy, winW, winH);
      }
    }
  });

  // Full Cobblestone Street Floor (y: 940..1920)
  const stG = ctx.createLinearGradient(0, 940, 0, 1920);
  stG.addColorStop(0, '#c9b79c');
  stG.addColorStop(0.08, PAL.cobble);
  stG.addColorStop(1, PAL.cobbleDark);
  ctx.fillStyle = stG;
  ctx.fillRect(0, 940, 1080, 980);

  // Diagonal street shadow
  ctx.fillStyle = 'rgba(20, 20, 34, 0.34)';
  ctx.beginPath();
  ctx.moveTo(0, 1140);
  ctx.lineTo(940, 975);
  ctx.lineTo(1080, 1020);
  ctx.lineTo(1080, 1920);
  ctx.lineTo(0, 1920);
  ctx.closePath();
  ctx.fill();

  // Cobblestone tiles
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  for (let row = 0; row < 18; row++) {
    const ry = 990 + row * 52;
    const tileW = 54 + row * 5;
    const tileH = 22 + row * 1.4;
    const offset = (row % 2) * (tileW * 0.5);
    for (let colI = -1; colI < 20; colI++) {
      const rx = colI * (tileW + 12) + offset;
      ctx.beginPath();
      ctx.roundRect(rx, ry, tileW, tileH, 8);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * SCENE B: Full-Screen 19th-Century Laboratory Interior (y: 0..1920)
 */
export function drawLabWorld(ctx, t) {
  ctx.save();
  // Striped wallpaper (y: 0..1040)
  ctx.fillStyle = PAL.wallLight;
  ctx.fillRect(0, 0, 1080, 1040);
  ctx.fillStyle = PAL.wallStripe;
  for (let x = 0; x < 1080; x += 76) {
    ctx.fillRect(x, 0, 38, 1040);
  }

  // Tall Window on Left (y: 190..660)
  ctx.fillStyle = '#87b9eb';
  ctx.fillRect(42, 195, 430, 440);
  ctx.fillStyle = '#5f7696';
  ctx.beginPath();
  ctx.moveTo(42, 635);
  ctx.lineTo(42, 480);
  ctx.lineTo(135, 410);
  ctx.lineTo(225, 480);
  ctx.lineTo(225, 430);
  ctx.lineTo(335, 360);
  ctx.lineTo(430, 445);
  ctx.lineTo(472, 445);
  ctx.lineTo(472, 635);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#fcfaf2';
  ctx.lineWidth = 16;
  ctx.strokeRect(42, 195, 430, 440);
  ctx.beginPath();
  ctx.moveTo(257, 195);
  ctx.lineTo(257, 635);
  ctx.moveTo(42, 415);
  ctx.lineTo(472, 415);
  ctx.stroke();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.strokeRect(34, 188, 446, 454);

  // Two Shelves of Chemical Bottles on Right
  [380, 580].forEach((sy, sIdx) => {
    ctx.fillStyle = PAL.woodTop;
    ctx.fillRect(640, sy, 410, 20);
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(640, sy, 410, 20);

    const bottles = [
      { dx: 675, w: 54, h: 108, c: '#39a878' },
      { dx: 765, w: 58, h: 128, c: '#e06d1f' },
      { dx: 860, w: 56, h: 118, c: '#1877d9' },
      { dx: 955, w: 52, h: 98, c: '#e6c629' },
    ];
    bottles.forEach((bt) => {
      ctx.fillStyle = bt.c;
      ctx.beginPath();
      ctx.moveTo(bt.dx, sy);
      ctx.lineTo(bt.dx + 5, sy - bt.h * 0.68);
      ctx.lineTo(bt.dx + 16, sy - bt.h * 0.72);
      ctx.lineTo(bt.dx + 18, sy - bt.h);
      ctx.lineTo(bt.dx + bt.w - 18, sy - bt.h);
      ctx.lineTo(bt.dx + bt.w - 16, sy - bt.h * 0.72);
      ctx.lineTo(bt.dx + bt.w - 5, sy - bt.h * 0.68);
      ctx.lineTo(bt.dx + bt.w, sy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.stroke();
    });
  });

  // Warm sunbeam diagonal from window onto table
  const beamG = ctx.createLinearGradient(140, 240, 720, 1180);
  beamG.addColorStop(0, 'rgba(255, 244, 165, 0.35)');
  beamG.addColorStop(1, 'rgba(255, 244, 165, 0.0)');
  ctx.fillStyle = beamG;
  ctx.beginPath();
  ctx.moveTo(120, 210);
  ctx.lineTo(460, 210);
  ctx.lineTo(880, 1180);
  ctx.lineTo(380, 1180);
  ctx.closePath();
  ctx.fill();

  // Wainscoting Dado Wall (y: 860..1080)
  ctx.fillStyle = '#995314';
  ctx.fillRect(0, 860, 1080, 220);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 860);
  ctx.lineTo(1080, 860);
  ctx.stroke();

  // Full Wooden Laboratory Workbench Counter (y: 1050..1920)
  ctx.fillStyle = PAL.woodTop;
  ctx.fillRect(0, 1050, 1080, 110);
  ctx.fillStyle = PAL.woodFront;
  ctx.fillRect(0, 1160, 1080, 760);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 1050);
  ctx.lineTo(1080, 1050);
  ctx.moveTo(0, 1160);
  ctx.lineTo(1080, 1160);
  ctx.stroke();

  ctx.restore();
}

/**
 * Lab Galvanometer + Chemical Jar Apparatus (scalable for close-up zoom!)
 */
export function drawGalvanometerRig(ctx, x, y, t, {
  needleAngle = 0.45,
  jarColor = PAL.tealJar,
  scale = 1,
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 1. Chemical Jar on Left
  ctx.fillStyle = '#d4f1f9';
  ctx.beginPath();
  ctx.roundRect(-175, -135, 114, 135, 12);
  ctx.fill();
  ctx.fillStyle = jarColor;
  ctx.fillRect(-171, -92, 106, 74);
  ctx.fillStyle = PAL.gold;
  ctx.fillRect(-175, -18, 114, 18);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.strokeRect(-175, -135, 114, 135);

  // Two electrodes
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-152, -155, 20, 20);
  ctx.strokeRect(-152, -155, 20, 20);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-106, -155, 20, 20);
  ctx.strokeRect(-106, -155, 20, 20);

  // Arching copper wires
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-142, -155);
  ctx.quadraticCurveTo(-90, -200, -35, -165);
  ctx.moveTo(-96, -155);
  ctx.quadraticCurveTo(-65, -185, -24, -165);
  ctx.stroke();

  // 2. Wooden Galvanometer Box on Right
  ctx.fillStyle = '#9c470b';
  ctx.beginPath();
  ctx.roundRect(-42, -168, 265, 168, 10);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.stroke();

  // White dial face
  ctx.fillStyle = '#f8f6f0';
  ctx.fillRect(-20, -146, 221, 122);

  const dialCx = 90;
  const dialCy = -40;
  // Red deflection zone
  ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.beginPath();
  ctx.moveTo(dialCx, dialCy);
  ctx.arc(dialCx, dialCy, 84, -Math.PI * 0.36, -Math.PI * 0.08);
  ctx.closePath();
  ctx.fill();

  // Scale arc & ticks
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(dialCx, dialCy, 84, -Math.PI * 0.88, -Math.PI * 0.12);
  ctx.stroke();
  for (let i = -4; i <= 4; i++) {
    const ta = (i / 4) * 0.68;
    ctx.beginPath();
    ctx.moveTo(dialCx + Math.sin(ta) * 72, dialCy - Math.cos(ta) * 72);
    ctx.lineTo(dialCx + Math.sin(ta) * 84, dialCy - Math.cos(ta) * 84);
    ctx.stroke();
  }

  // Animated Red Needle
  const ang = needleAngle + Math.sin(t * 7) * 0.05;
  ctx.strokeStyle = PAL.red;
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(dialCx, dialCy);
  ctx.lineTo(dialCx + Math.sin(ang) * 78, dialCy - Math.cos(ang) * 78);
  ctx.stroke();

  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.arc(dialCx, dialCy, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

/**
 * SCENE C: 1884 Rooftop with Golden Selenium Solar Panels & Coal Smokestack
 */
export function drawRooftopWorld(ctx, t) {
  ctx.save();
  const skyG = ctx.createLinearGradient(0, 0, 0, 1020);
  skyG.addColorStop(0, '#3a86db');
  skyG.addColorStop(1, '#90c2f5');
  ctx.fillStyle = skyG;
  ctx.fillRect(0, 0, 1080, 1020);

  // Distant buildings & smoking coal chimney
  ctx.fillStyle = '#d49b72';
  ctx.fillRect(40, 480, 220, 520);
  ctx.fillStyle = '#c48356';
  ctx.fillRect(780, 560, 240, 440);

  // Coal Smokestack puffing grey smoke
  ctx.fillStyle = '#cbd5e1';
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.fillRect(465, 520, 58, 460);
  ctx.strokeRect(465, 520, 58, 460);
  for (let i = 0; i < 6; i++) {
    const sy = 480 - i * 58 - ((t * 40) % 58);
    const sx = 490 - i * 24 + Math.sin(t * 2 + i) * 14;
    ctx.fillStyle = `rgba(210, 215, 225, ${0.75 - i * 0.1})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 28 + i * 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Brick rooftop parapet & grey roof floor (y: 940..1920)
  ctx.fillStyle = '#a84a24';
  ctx.fillRect(0, 910, 1080, 85);
  ctx.fillStyle = '#6c6f5e';
  ctx.fillRect(0, 995, 1080, 925);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 910);
  ctx.lineTo(1080, 910);
  ctx.moveTo(0, 995);
  ctx.lineTo(1080, 995);
  ctx.stroke();

  // Golden Selenium Solar Arrays on Stands
  const drawGoldPanel = (px, py) => {
    ctx.save();
    ctx.translate(px, py);
    // Stand legs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-95, 60);
    ctx.lineTo(-95, 165);
    ctx.moveTo(95, 60);
    ctx.lineTo(95, 165);
    ctx.stroke();

    // Tilted gold grid
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-125, -90);
    ctx.lineTo(125, -90);
    ctx.lineTo(110, 75);
    ctx.lineTo(-140, 75);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Grid cells
    ctx.lineWidth = 2.5;
    for (let r = 1; r < 5; r++) {
      const ly = -90 + (r / 5) * 165;
      ctx.beginPath();
      ctx.moveTo(-125 - (r / 5) * 15, ly);
      ctx.lineTo(125 - (r / 5) * 15, ly);
      ctx.stroke();
    }
    for (let c = 1; c < 4; c++) {
      const lx = -125 + (c / 4) * 250;
      ctx.beginPath();
      ctx.moveTo(lx, -90);
      ctx.lineTo(lx - 15, 75);
      ctx.stroke();
    }
    ctx.restore();
  };

  drawGoldPanel(210, 1020);
  drawGoldPanel(530, 1020);
  ctx.restore();
}

/**
 * SCENE D: Chalkboard Classroom (customizable formula & topic!)
 */
export function drawChalkboardWorld(ctx, t, { formula = 'E = h · ν (FOTON)' } = {}) {
  ctx.save();
  // Dark green chalkboard (y: 0..1040)
  ctx.fillStyle = '#092e1a';
  ctx.fillRect(0, 0, 1080, 1040);

  // Chalk squiggles, wave equations & yellow photon dots
  ctx.strokeStyle = 'rgba(235, 245, 238, 0.8)';
  ctx.lineWidth = 5;
  for (let row = 0; row < 5; row++) {
    const wy = 240 + row * 115;
    ctx.beginPath();
    for (let x = 60; x < 540; x += 20) {
      const yOff = Math.sin((x + t * 90) * 0.06 + row) * 14;
      if (x === 60) ctx.moveTo(x, wy + yOff);
      else ctx.lineTo(x, wy + yOff);
    }
    ctx.stroke();
  }

  // Chalk formula
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '900 48px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(formula, 80, 820, 920);

  // Glowing yellow photon particles flying right
  ctx.fillStyle = PAL.gold;
  for (let i = 0; i < 8; i++) {
    const px = 620 + ((i * 67 + t * 80) % 380);
    const py = 260 + (i % 4) * 130 + Math.sin(t * 4 + i) * 18;
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wooden wainscoting & classroom desk/floor (y: 960..1920)
  ctx.fillStyle = '#5c2d0c';
  ctx.fillRect(0, 940, 1080, 260);
  ctx.fillStyle = '#c87d20';
  ctx.fillRect(0, 1200, 1080, 720);

  // Teacher Desk on Left
  ctx.fillStyle = '#b46212';
  ctx.fillRect(0, 1080, 620, 440);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 1080, 620, 440);

  // Stack of physics books on desk
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(36, 985, 145, 95);
  ctx.strokeRect(36, 985, 145, 95);
  ctx.restore();
}

/**
 * SCENE E: Microscopic Silicon Atom Lattice & Cute Electron Knock-Out Analogy!
 */
export function drawAtomLatticeWorld(ctx, t) {
  ctx.save();
  // Deep dark navy atomic space
  ctx.fillStyle = '#070b19';
  ctx.fillRect(0, 0, 1080, 1920);

  // Grid of blue Silicon Atoms with covalent bonds
  const cols = 5;
  const rows = 8;
  const startX = 130;
  const startY = 250;
  const gapX = 205;
  const gapY = 205;

  // Bonds
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 10;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ax = startX + c * gapX;
      const ay = startY + r * gapY;
      if (c < cols - 1) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + gapX, ay);
        ctx.stroke();
      }
      if (r < rows - 1) {
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax, ay + gapY);
        ctx.stroke();
      }
    }
  }

  // Silicon Atom Spheres
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ax = startX + c * gapX + Math.sin(t * 3 + r + c) * 4;
      const ay = startY + r * gapY + Math.cos(t * 3 + r - c) * 4;
      const g = ctx.createRadialGradient(ax - 18, ay - 18, 8, ax, ay, 66);
      g.addColorStop(0, '#3b82f6');
      g.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ax, ay, 64, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }

  // Curved Copper Wire Highway across the middle
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 28;
  ctx.beginPath();
  ctx.moveTo(0, 860);
  ctx.quadraticCurveTo(540, 680, 1080, 890);
  ctx.stroke();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 14;
  ctx.stroke();

  // Golden Photon Ray striking from top-left!
  const beamX = 420 + Math.sin(t * 4) * 60;
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 8;
  ctx.setLineDash([18, 12]);
  ctx.beginPath();
  ctx.moveTo(120, 180);
  ctx.lineTo(beamX, 580);
  ctx.stroke();
  ctx.setLineDash([]);

  // Cute Glowing Cyan Electron Character (with eyes & surprised mouth!) traveling along the wire
  const u = (t * 0.38) % 1;
  const ex = lerp(160, 920, u);
  const ey = 760 - Math.sin(u * Math.PI) * 140 + Math.sin(t * 10) * 10;

  // Outer glow
  const eGlow = ctx.createRadialGradient(ex, ey, 10, ex, ey, 95);
  eGlow.addColorStop(0, 'rgba(103, 232, 249, 0.8)');
  eGlow.addColorStop(1, 'rgba(103, 232, 249, 0)');
  ctx.fillStyle = eGlow;
  ctx.beginPath();
  ctx.arc(ex, ey, 95, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#67e8f9';
  ctx.beginPath();
  ctx.arc(ex, ey, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Cute eyes & O-mouth on Electron
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(ex - 16, ey - 8, 6, 0, Math.PI * 2);
  ctx.arc(ex + 16, ey - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(ex, ey + 14, 8, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * SCENE F: Outdoor Academy / Bell Labs Lawn (supports 'ferris' for solar or 'medical' for Pasteur/Fleming!)
 */
export function drawBellLabsWorld(ctx, t, { propMode = 'ferris' } = {}) {
  ctx.save();
  // Sky & Brick University Building
  ctx.fillStyle = '#4ea1f5';
  ctx.fillRect(0, 0, 1080, 980);

  // Brick building background
  ctx.fillStyle = '#e5a93c';
  ctx.fillRect(0, 320, 1080, 660);
  ctx.fillStyle = '#7c2d12';
  ctx.beginPath();
  ctx.moveTo(0, 320);
  ctx.lineTo(180, 210);
  ctx.lineTo(1080, 240);
  ctx.lineTo(1080, 320);
  ctx.closePath();
  ctx.fill();

  // Green Lawn (y: 960..1920)
  const lawnG = ctx.createLinearGradient(0, 960, 0, 1920);
  lawnG.addColorStop(0, '#65d628');
  lawnG.addColorStop(1, '#2b8a12');
  ctx.fillStyle = lawnG;
  ctx.fillRect(0, 960, 1080, 960);

  // Three Scientists in White Lab Coats standing behind outdoor table
  drawStickman(ctx, 180, 1340, { pose: 'happy', coatColor: PAL.coatWhite, hairColor: PAL.hairBrown, glasses: true, scale: 0.9, t });
  drawStickman(ctx, 560, 1340, { pose: 'focused', coatColor: PAL.coatWhite, hairColor: PAL.hairGrey, glasses: true, scale: 0.88, t: t + 1 });
  drawStickman(ctx, 890, 1340, { pose: 'happy', coatColor: PAL.coatWhite, hairColor: PAL.hairBrown, scale: 0.9, t: t + 2 });

  // White Demonstration Table (y: 1120..1210)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 1120, 1080, 82);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 1120, 1080, 82);

  if (propMode === 'ferris') {
    // Blue Silicon Solar Panel on Right of Table
    ctx.fillStyle = '#1e3a8a';
    ctx.strokeStyle = PAL.white;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(720, 940);
    ctx.lineTo(980, 940);
    ctx.lineTo(955, 1120);
    ctx.lineTo(695, 1120);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Spinning Toy Ferris Wheel on Center-Left of Table!
    const wheelCx = 390;
    const wheelCy = 860;
    const wheelR = 195;

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(wheelCx - 140, 1120);
    ctx.lineTo(wheelCx, wheelCy);
    ctx.lineTo(wheelCx + 140, 1120);
    ctx.stroke();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(wheelCx - 175, 1095, 350, 28);
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(wheelCx - 175, 1095, 350, 28);

    ctx.save();
    ctx.translate(wheelCx, wheelCy);
    ctx.rotate(t * 1.4);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * wheelR, Math.sin(a) * wheelR);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    // Medical / Pasteur Flasks & Brass Microscope on Demonstration Table!
    // Giant Glowing Erlenmeyer Flask on Left
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(320, 910);
    ctx.lineTo(370, 910);
    ctx.lineTo(370, 970);
    ctx.lineTo(445, 1120);
    ctx.lineTo(245, 1120);
    ctx.lineTo(320, 970);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Giant Antiseptic Chlorine Basin on Right
    ctx.fillStyle = '#74c0fc';
    ctx.beginPath();
    ctx.roundRect(650, 1020, 260, 100, 28);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * SCENE G: Vanguard 1 Satellite in Orbit + Modern Solar Farm Horizon
 */
export function drawSpaceAndSolarWorld(ctx, t, { mode = 'space' } = {}) {
  ctx.save();
  if (mode === 'space') {
    // Deep space background with stars
    ctx.fillStyle = '#041026';
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = PAL.white;
    for (let i = 0; i < 30; i++) {
      const sx = (i * 173) % 1080;
      const sy = (i * 293) % 1400;
      ctx.fillRect(sx, sy, 4, 4);
    }

    // Curved Blue Earth Horizon at bottom
    const earthG = ctx.createLinearGradient(0, 1280, 0, 1920);
    earthG.addColorStop(0, '#38bdf8');
    earthG.addColorStop(0.2, '#0284c7');
    earthG.addColorStop(1, '#0369a1');
    ctx.fillStyle = earthG;
    ctx.beginPath();
    ctx.arc(540, 2350, 1120, Math.PI * 1.15, Math.PI * 1.85);
    ctx.fill();

    // Floating Vanguard 1 Spherical Satellite with Solar Cells & 6 Antennas!
    const satX = 560 + Math.sin(t * 1.5) * 28;
    const satY = 920 + Math.cos(t * 1.2) * 24;
    ctx.save();
    ctx.translate(satX, satY);
    ctx.rotate(Math.sin(t * 0.5) * 0.12);

    // Long thin antennas
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 5;
    [[-320, -280], [340, -210], [-360, 140], [310, 260], [-140, 380], [180, -360]].forEach(([ax, ay]) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ax, ay);
      ctx.stroke();
    });

    // Metallic sphere body
    const sphG = ctx.createRadialGradient(-45, -45, 20, 0, 0, 165);
    sphG.addColorStop(0, '#f8fafc');
    sphG.addColorStop(1, '#64748b');
    ctx.fillStyle = sphG;
    ctx.beginPath();
    ctx.arc(0, 0, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Rectangular Solar Cell Windows on Satellite Sphere
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.fillRect(-48, -148, 96, 46);
    ctx.strokeRect(-48, -148, 96, 46);
    ctx.fillRect(88, 12, 54, 72);
    ctx.strokeRect(88, 12, 54, 72);
    ctx.restore();
  } else {
    // Sunrise Sky over Vast Blue Solar Panel Farm
    const sunG = ctx.createLinearGradient(0, 0, 0, 980);
    sunG.addColorStop(0, '#d97706');
    sunG.addColorStop(0.6, '#fde68a');
    sunG.addColorStop(1, '#fffbeb');
    ctx.fillStyle = sunG;
    ctx.fillRect(0, 0, 1080, 980);

    // Glowing Sun
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(680, 560, 58, 0, Math.PI * 2);
    ctx.fill();

    // Endless rows of blue solar panels (y: 920..1920)
    const farmG = ctx.createLinearGradient(0, 920, 0, 1920);
    farmG.addColorStop(0, '#3b82f6');
    farmG.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = farmG;
    ctx.fillRect(0, 920, 1080, 1000);

    // Perspective grid lines on solar farm
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.lineWidth = 4;
    for (let r = 0; r < 14; r++) {
      const ry = 940 + r * r * 5.2;
      ctx.beginPath();
      ctx.moveTo(0, ry);
      ctx.lineTo(1080, ry);
      ctx.stroke();
    }
    for (let c = -6; c <= 16; c++) {
      ctx.beginPath();
      ctx.moveTo(540 + (c - 5) * 65, 920);
      ctx.lineTo(540 + (c - 5) * 260, 1920);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * SCENE H: Microscopic Bacteria / Germs on Hand vs Chlorine Wash (for Demo 2 & Demo 3!)
 */
export function drawMicrobeZoomWorld(ctx, t, { cleansed = false } = {}) {
  ctx.save();
  ctx.fillStyle = cleansed ? '#082f49' : '#1f0910';
  ctx.fillRect(0, 0, 1080, 1920);

  // Giant Magnifying Glass Lens Frame in Center (y: 340..1240)
  const cx = 540;
  const cy = 790;
  const r = 410;

  ctx.fillStyle = cleansed ? '#e0f2fe' : '#fef2f2';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = cleansed ? '#38bdf8' : PAL.gold;
  ctx.lineWidth = 22;
  ctx.stroke();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Stylized Hand Outline inside Magnifying Glass
  ctx.fillStyle = PAL.skin;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.roundRect(cx - 150, cy - 80, 300, 320, 70);
  ctx.fill();
  ctx.stroke();
  // Fingers
  [-115, -45, 25, 95].forEach((fx, idx) => {
    const fh = idx === 1 || idx === 2 ? 210 : 175;
    ctx.beginPath();
    ctx.roundRect(cx + fx - 28, cy - 60 - fh, 56, fh + 30, 28);
    ctx.fill();
    ctx.stroke();
  });

  if (!cleansed) {
    // Spiky Green/Purple Cartoon Germs with Evil Eyes on the Hand!
    const germs = [
      { gx: cx - 85, gy: cy - 120, col: '#65a30d', s: 1.0 },
      { gx: cx + 55, gy: cy - 150, col: '#9333ea', s: 1.15 },
      { gx: cx - 30, gy: cy + 30, col: '#dc2626', s: 1.2 },
      { gx: cx + 90, gy: cy + 75, col: '#65a30d', s: 0.95 },
      { gx: cx - 95, gy: cy + 125, col: '#9333ea', s: 1.05 },
    ];
    germs.forEach((g, i) => {
      const jx = g.gx + Math.sin(t * 5 + i) * 10;
      const jy = g.gy + Math.cos(t * 4 + i) * 10;
      ctx.save();
      ctx.translate(jx, jy);
      ctx.scale(g.s, g.s);
      ctx.fillStyle = g.col;
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        const rad = k % 2 === 0 ? 44 : 28;
        if (k === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
        else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Evil eyes
      ctx.fillStyle = PAL.white;
      ctx.beginPath();
      ctx.arc(-10, -4, 7, 0, Math.PI * 2);
      ctx.arc(10, -4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAL.ink;
      ctx.beginPath();
      ctx.arc(-10, -4, 3, 0, Math.PI * 2);
      ctx.arc(10, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  } else {
    // Sparkling Chlorine Bubbles & Clean Stars!
    for (let i = 0; i < 9; i++) {
      const bx = cx - 220 + ((i * 89) % 440);
      const by = cy - 220 + (((i * 123) - t * 60) % 440);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(bx, by, 26 + (i % 3) * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}
