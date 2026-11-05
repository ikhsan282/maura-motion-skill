// 76 · STICKMAN MINIMAL DARK — Kit: "Si Hening Jubah Geometri & Lentera Pikiran" (OLED Pitch-Black + Benang Kusut Merah vs Lingkaran Zen Biru)
import { clamp } from '/engine/lib/core.js';

export const PAL = {
  black: '#040407',
  stageBg: '#09090f',
  cardBg: '#0c0c14',
  white: '#ffffff',
  red: '#ff3b30',
  blue: '#38bdf8',
  amber: '#fbbf24',
  muted: '#94a3b8',
  dimLine: 'rgba(255, 255, 255, 0.12)',
};

export function minimalDarkBg(ctx, t, {
  floorY = 760,
  modeTag = 'MODE 01 • DETOKS OVERTHINKING MALAM HARI',
  col = PAL.red,
} = {}) {
  ctx.save();
  // Pure OLED pitch-black canvas
  ctx.fillStyle = PAL.black;
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle architectural crosshairs in background
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1.5;
  for (let x = 120; x <= 960; x += 210) {
    for (let y = 120; y <= 1800; y += 210) {
      ctx.beginPath();
      ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y);
      ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6);
      ctx.stroke();
    }
  }

  // Main Minimalist Dark Stage Frame (x: 60, y: 225, w: 960, h: 610)
  const sx = 60, sy = 225, sw = 960, sh = 610;
  ctx.fillStyle = PAL.stageBg;
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 24);
  ctx.fill();
  ctx.stroke();

  // Inner fine white hairline border
  ctx.strokeStyle = PAL.dimLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(sx + 12, sy + 12, sw - 24, sh - 24, 18);
  ctx.stroke();

  // Subtle radial glow from the single accent color
  const rg = ctx.createRadialGradient(360, floorY - 160, 10, 360, floorY - 160, 320);
  rg.addColorStop(0, col === PAL.red ? 'rgba(255, 59, 48, 0.14)' : 'rgba(56, 189, 248, 0.14)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 24);
  ctx.fill();

  // Stark White Monoline Floor Line
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(100, floorY);
  ctx.lineTo(980, floorY);
  ctx.stroke();

  // Top-left Minimalist Mode Pill
  ctx.font = '800 15.5px "JetBrains Mono", monospace';
  const tagW = Math.max(410, ctx.measureText(modeTag).width + 44);
  ctx.fillStyle = PAL.black;
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(92, sy + 26, tagW, 40, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = col;
  ctx.textAlign = 'left';
  ctx.fillText(modeTag, 112, sy + 52);
  ctx.restore();
}

export function minimalDarkHeader(ctx, badgeText, title, subtitle, {
  col = PAL.red,
} = {}) {
  ctx.save();
  const x = 60, y = 45, w = 960, h = 152;
  ctx.fillStyle = PAL.cardBg;
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 24);
  ctx.fill();
  ctx.stroke();

  // Left Accent Box
  const bx = x + 22, by = y + 20, bw = 175, bh = 112;
  ctx.fillStyle = PAL.black;
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.muted;
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MINIMAL DARK', bx + bw / 2, by + 34);

  ctx.fillStyle = col;
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(badgeText, bx + bw / 2, by + 82, bw - 16);

  // Title & Subtitle
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText('KEJERNIHAN MENTAL • STICKMAN MINIMAL DARK', bx + bw + 26, y + 40);

  ctx.fillStyle = PAL.white;
  ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, bx + bw + 26, y + 84, w - bw - 65);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, bx + bw + 26, y + 120, w - bw - 65);
  ctx.restore();
}

// Unique Character: "Si Hening Jubah Geometri & Lentera Pikiran"
// (Geometric Zen Poncho Cloak + Glowing Chest Mind-Core + Floating Lantern Orb + Tangled Red Scribble vs Blue Zen Ring above head)
export function minimalDarkStickman(ctx, x, floorY, state = 'overthink', {
  facing = 1,
  t = 0,
  scale = 1,
} = {}) {
  ctx.save();
  const isCalm = state === 'clarity' || state === 'victory';
  const accent = isCalm ? PAL.blue : PAL.red;
  const bob = Math.sin(t * 3.8) * 3;

  ctx.translate(x, floorY);
  ctx.scale(facing * scale, scale);

  // Crisp glowing ring on floor
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 2, 48, 9, 0, 0, Math.PI * 2);
  ctx.stroke();

  const hipY = -112 + bob;
  const shoulderY = -228 + bob;
  const headY = -286 + bob;
  const headR = 35;

  // Stark White Monoline Legs
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-14, hipY);
  ctx.lineTo(-18, -4);
  ctx.moveTo(14, hipY);
  ctx.lineTo(18, -4);
  ctx.stroke();

  // Geometric High-Neck Minimalist Poncho / Cloak Torso!
  ctx.fillStyle = PAL.black;
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 4;
  ctx.beginPath();
  // High collar + angled geometric poncho silhouette
  ctx.moveTo(-18, shoulderY - 10);
  ctx.lineTo(18, shoulderY - 10);
  ctx.lineTo(44, hipY - 18);
  ctx.lineTo(28, hipY + 8);
  ctx.lineTo(-28, hipY + 8);
  ctx.lineTo(-44, hipY - 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner geometric diamond core inside the cloak chest
  ctx.fillStyle = accent;
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const coreY = shoulderY + 56;
  ctx.moveTo(0, coreY - 18);
  ctx.lineTo(16, coreY);
  ctx.lineTo(0, coreY + 18);
  ctx.lineTo(-16, coreY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Arm holding out a Floating Geometric Lantern Orb!
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 6.5;
  ctx.beginPath();
  ctx.moveTo(26, shoulderY + 18);
  ctx.lineTo(54, shoulderY + 34);
  ctx.lineTo(78, shoulderY + 12);
  ctx.stroke();

  // Floating Lantern Orb above right hand
  const orbX = 88, orbY = shoulderY - 8 + Math.sin(t * 5) * 4;
  ctx.fillStyle = accent;
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(orbX, orbY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Outer ring around lantern orb
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(orbX, orbY, 20, 0, Math.PI * 2);
  ctx.stroke();

  // Head Circle (Pitch-black fill with Stark White Monoline Rim)
  ctx.fillStyle = PAL.black;
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Minimalist Glowing Eyes inside dark head
  ctx.fillStyle = PAL.white;
  if (!isCalm) {
    // Wide stressed eyes
    ctx.beginPath();
    ctx.arc(-5, headY - 2, 5, 0, Math.PI * 2);
    ctx.arc(15, headY - 2, 5, 0, Math.PI * 2);
    ctx.fill();
    // Wavy stressed mouth
    ctx.strokeStyle = PAL.red;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, headY + 14);
    ctx.quadraticCurveTo(5, headY + 8, 16, headY + 14);
    ctx.stroke();
  } else {
    // Calm focused eyes & gentle smile
    ctx.beginPath();
    ctx.arc(-5, headY - 2, 4, 0, Math.PI * 2);
    ctx.arc(15, headY - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.blue;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(5, headY + 9, 9, 0.15, Math.PI - 0.15);
    ctx.stroke();
  }

  // Crown Visual Above Head:
  // State 'overthink': Tangled Red Scribble Knot (Benang Kusut Overthinking)
  // State 'clarity': Crisp Glowing Blue Zen Circle (Lingkaran Fokus Jernih)
  const crownY = headY - headR - 28;
  if (!isCalm) {
    ctx.strokeStyle = PAL.red;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 6 + t * 3;
      const rx = Math.cos(a * 1.3) * 34 + Math.sin(a * 2.1) * 12;
      const ry = Math.sin(a * 1.7) * 16;
      if (i === 0) ctx.moveTo(rx, crownY + ry);
      else ctx.lineTo(rx, crownY + ry);
    }
    ctx.stroke();
  } else {
    ctx.strokeStyle = PAL.blue;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, crownY + 6, 36, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PAL.white;
    ctx.beginPath();
    ctx.arc(36 * Math.cos(t * 3), crownY + 6 + 11 * Math.sin(t * 3), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function minimalDarkDiagram(ctx, floorY, badge, mainText, subText, {
  col = PAL.red,
} = {}) {
  ctx.save();
  const bx = 735, by = floorY - 245, bw = 340, bh = 175;

  ctx.fillStyle = PAL.black;
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(bx - bw / 2, by, bw, bh, 20);
  ctx.fill();
  ctx.stroke();

  // Inner corner brackets
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 2;
  const x0 = bx - bw / 2 + 12, y0 = by + 12, x1 = bx + bw / 2 - 12, y1 = by + bh - 12;
  ctx.beginPath();
  ctx.moveTo(x0, y0 + 14); ctx.lineTo(x0, y0); ctx.lineTo(x0 + 14, y0);
  ctx.moveTo(x1 - 14, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, y0 + 14);
  ctx.moveTo(x0, y1 - 14); ctx.lineTo(x0, y1); ctx.lineTo(x0 + 14, y1);
  ctx.moveTo(x1 - 14, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 - 14);
  ctx.stroke();

  ctx.fillStyle = col;
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(badge, bx, by + 42, bw - 32);

  ctx.fillStyle = PAL.white;
  ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(mainText, bx, by + 92, bw - 32);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subText, bx, by + 134, bw - 32);
  ctx.restore();
}

export function minimalDarkBubble(ctx, x, y, text, {
  tailX = x,
  tailY = y + 70,
  col = PAL.red,
} = {}) {
  ctx.save();
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  const tw = Math.max(320, ctx.measureText(text).width + 52);
  const th = 62;
  const bx = clamp(x - tw / 2, 85, 995 - tw);
  const by = y - th / 2;

  ctx.fillStyle = PAL.black;
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, 16);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(clamp(tailX - 10, bx + 22, bx + tw - 36), by + th - 2);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(clamp(tailX + 10, bx + 36, bx + tw - 22), by + th - 2);
  ctx.fillStyle = PAL.black;
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.white;
  ctx.textAlign = 'center';
  ctx.fillText(text, bx + tw / 2, by + 39, tw - 28);
  ctx.restore();
}

export function minimalDarkCard(ctx, cx, cy, w, h, {
  tag = 'PRINSIP MINIMALIS',
  titleStr = '',
  subStr = '',
  stat = '',
  statSub = '',
  col = PAL.red,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);
  const x = cx - w / 2, y = cy - h / 2;

  ctx.fillStyle = PAL.cardBg;
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 22);
  ctx.fill();
  ctx.stroke();

  // Left accent bar
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 18, y + 22, 10, h - 44, 5);
  ctx.fill();

  const maxTextW = stat ? w - 275 : w - 70;
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText(tag, x + 44, y + 46, maxTextW);

  ctx.fillStyle = PAL.white;
  ctx.font = '800 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(titleStr, x + 44, y + 88, maxTextW);

  ctx.fillStyle = PAL.muted;
  ctx.font = '500 16.5px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subStr, x + 44, y + 128, maxTextW);

  if (stat) {
    const sw = 195, sh = h - 36;
    const sx = x + w - sw - 20, sy = y + 18;
    ctx.fillStyle = PAL.black;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = col;
    ctx.font = '900 25px "JetBrains Mono", monospace';
    ctx.fillText(stat, sx + sw / 2, sy + 64, sw - 16);

    ctx.fillStyle = PAL.white;
    ctx.font = '800 13.5px "JetBrains Mono", monospace';
    ctx.fillText(statSub, sx + sw / 2, sy + 98, sw - 16);
  }
  ctx.restore();
}
