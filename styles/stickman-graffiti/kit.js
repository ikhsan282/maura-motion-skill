// 74 · STICKMAN GRAFFITI — Kit: "Si Zaki Street-Art Bomber" (Masker Respirator Filter Neon, Goggles Dahi, Rompi Splatter & Kaleng Pilox)
import { clamp } from '/engine/lib/core.js';

export const PAL = {
  wall0: '#0b0b12',
  wall1: '#151522',
  brick: '#1d1d2e',
  cardBg: '#141421',
  ink: '#f5f6fa',
  pink: '#ff2fb3',
  cyan: '#00f0ff',
  yellow: '#ffe14a',
  lime: '#39ff14',
  muted: '#9ca3af',
};

export function graffitiBg(ctx, t, {
  floorY = 760,
  wallTag = 'TEMBOK 01 • CORETAN PERTAMA',
  col = PAL.pink,
} = {}) {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, PAL.wall0);
  g.addColorStop(0.55, PAL.wall1);
  g.addColorStop(1, '#08080e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1920);

  // Main Urban Brick Wall Stage (x: 60, y: 225, w: 960, h: 610)
  const sx = 60, sy = 225, sw = 960, sh = 610;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.roundRect(sx + 8, sy + 12, sw, sh, 26);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 26);
  ctx.clip();

  ctx.fillStyle = '#12121d';
  ctx.fillRect(sx, sy, sw, sh);

  // Staggered Urban Brick Wall Texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
  ctx.lineWidth = 2;
  const bh = 42, bw = 96;
  for (let row = 0; row < 13; row++) {
    const by = sy + 60 + row * bh;
    if (by >= floorY) break;
    ctx.beginPath();
    ctx.moveTo(sx, by);
    ctx.lineTo(sx + sw, by);
    ctx.stroke();
    const offset = (row % 2) * (bw / 2);
    for (let bx = sx + offset; bx < sx + sw; bx += bw) {
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx, Math.min(floorY, by + bh));
      ctx.stroke();
    }
  }

  // Ambient Neon Spray Halo on Brick Wall
  const rg = ctx.createRadialGradient(580, floorY - 190, 20, 580, floorY - 190, 380);
  rg.addColorStop(0, col === PAL.cyan ? 'rgba(0, 240, 255, 0.16)' : 'rgba(255, 47, 179, 0.16)');
  rg.addColorStop(0.6, 'rgba(0, 240, 255, 0.05)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(sx, sy, sw, sh);

  // Decorative Street Crown Tag on Upper Left Brick Wall
  ctx.save();
  ctx.translate(155, sy + 115);
  ctx.rotate(-0.12);
  ctx.strokeStyle = 'rgba(255, 225, 74, 0.25)';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-28, 12);
  ctx.lineTo(-34, -18);
  ctx.lineTo(-12, -2);
  ctx.lineTo(0, -24);
  ctx.lineTo(12, -2);
  ctx.lineTo(34, -18);
  ctx.lineTo(28, 12);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // Concrete Alley Sidewalk Floor
  ctx.fillStyle = '#0c0c14';
  ctx.fillRect(sx, floorY, sw, sy + sh - floorY);

  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(sx + 20, floorY);
  ctx.lineTo(sx + sw - 20, floorY);
  ctx.stroke();

  // Top Street Stencil Tag Pill
  ctx.font = '800 16px "JetBrains Mono", monospace';
  const tagW = Math.max(420, ctx.measureText(wallTag).width + 44);
  ctx.fillStyle = col;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(90, sy + 22, tagW, 42, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0b0b12';
  ctx.textAlign = 'left';
  ctx.fillText(wallTag, 110, sy + 49);

  ctx.restore();

  // Neon Outer Border
  ctx.strokeStyle = col;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 26);
  ctx.stroke();
  ctx.restore();
}

export function graffitiHeader(ctx, badgeText, title, subtitle, {
  col = PAL.pink,
} = {}) {
  ctx.save();
  const x = 60, y = 45, w = 960, h = 152;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 24);
  ctx.fill();

  ctx.fillStyle = PAL.cardBg;
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 24);
  ctx.fill();
  ctx.stroke();

  // Left Spray Stencil Badge
  const bx = x + 22, by = y + 20, bw = 175, bh = 112;
  ctx.fillStyle = '#1d1830';
  ctx.strokeStyle = PAL.cyan;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.cyan;
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('STREET CREATOR', bx + bw / 2, by + 34);

  ctx.fillStyle = PAL.yellow;
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(badgeText, bx + bw / 2, by + 82, bw - 16);

  // Title & Subtitle
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText('MENTALITAS KREATOR • STICKMAN GRAFFITI', bx + bw + 26, y + 40);

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, bx + bw + 26, y + 84, w - bw - 65);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, bx + bw + 26, y + 120, w - bw - 65);
  ctx.restore();
}

function drawSprayCan(ctx, x, y, sprayCol = PAL.pink, spraying = true, t = 0) {
  ctx.save();
  ctx.translate(x, y);

  // Aerosol spray mist cone!
  if (spraying) {
    const pulse = 0.75 + 0.25 * Math.sin(t * 14);
    ctx.fillStyle = sprayCol === PAL.cyan ? `rgba(0, 240, 255, ${0.32 * pulse})` : `rgba(255, 47, 179, ${0.32 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(14, -22);
    ctx.lineTo(78, -52);
    ctx.lineTo(78, 8);
    ctx.closePath();
    ctx.fill();

    // Neon spray droplets
    ctx.fillStyle = sprayCol;
    for (const [dx, dy, dr] of [[42, -26, 3], [58, -14, 2.5], [66, -34, 3.5], [52, -38, 2]]) {
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Metal Spray Can Cylinder
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = '#0b0b12';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-11, -18, 22, 38, 5);
  ctx.fill();
  ctx.stroke();

  // Colored label band on spray can
  ctx.fillStyle = sprayCol;
  ctx.fillRect(-9, -8, 18, 18);

  // White nozzle cap on top
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0b0b12';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-6, -26, 12, 8, 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

// Unique Character: "Si Zaki Street-Art Bomber"
// (Neon Respirator Mask + Forehead Street Goggles + Spiky Neon Hair + Splatter Bomber Vest + Spray Can)
export function graffitiStickman(ctx, x, floorY, pose = 'spray', {
  facing = 1,
  t = 0,
  scale = 1,
  sprayCol = PAL.pink,
} = {}) {
  ctx.save();
  const bob = Math.sin(t * 5) * 3.5;
  ctx.translate(x, floorY);
  ctx.scale(facing * scale, scale);

  // Neon floor glow shadow
  ctx.fillStyle = sprayCol === PAL.cyan ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 47, 179, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 48, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  const hipY = -110 + bob;
  const shoulderY = -224 + bob;
  const headY = -282 + bob;
  const headR = 37;

  // Legs
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-15, hipY);
  ctx.lineTo(-20, -16);
  ctx.moveTo(15, hipY);
  ctx.lineTo(20, -16);
  ctx.stroke();

  // Chunky Street High-Top Sneakers with Neon Soles
  for (const sx of [-20, 20]) {
    ctx.fillStyle = '#1f2937';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(sx - 10, -22, 30, 18, 6);
    ctx.fill();
    ctx.stroke();

    // Neon sole stripe
    ctx.fillStyle = sprayCol;
    ctx.fillRect(sx - 9, -8, 28, 5);
  }

  // Arms based on pose
  let lElbow = [-40, shoulderY + 36], lHand = [-30, hipY - 4];
  let rElbow = [38, shoulderY + 18], rHand = [68, shoulderY - 8];
  let isSpraying = true;

  if (pose === 'hesitate') {
    lElbow = [-44, shoulderY + 20]; lHand = [-32, shoulderY + 55];
    rElbow = [32, shoulderY + 38]; rHand = [48, shoulderY + 24];
    isSpraying = false;
  } else if (pose === 'victory') {
    lElbow = [-46, shoulderY - 18]; lHand = [-58, headY - 24];
    rElbow = [46, shoulderY - 22]; rHand = [64, headY - 32];
    isSpraying = true;
  }

  // Back Arm
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-22, shoulderY + 8);
  ctx.lineTo(lElbow[0], lElbow[1]);
  ctx.lineTo(lHand[0], lHand[1]);
  ctx.stroke();

  // Streetwear Bomber Vest with Paint Splatters & Diagonal Utility Strap
  ctx.fillStyle = '#1e1e30';
  ctx.strokeStyle = PAL.cyan;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-27, shoulderY);
  ctx.lineTo(27, shoulderY);
  ctx.lineTo(34, hipY);
  ctx.lineTo(-34, hipY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Diagonal Neon Pink Utility Belt across Chest
  ctx.strokeStyle = PAL.pink;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-24, shoulderY + 4);
  ctx.lineTo(28, hipY - 6);
  ctx.stroke();

  // Neon Paint Splatters on Vest
  ctx.fillStyle = PAL.yellow;
  ctx.beginPath();
  ctx.arc(-12, shoulderY + 58, 6, 0, Math.PI * 2);
  ctx.arc(14, shoulderY + 36, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.cyan;
  ctx.beginPath();
  ctx.arc(10, shoulderY + 76, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Front Arm + Spray Can
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(22, shoulderY + 8);
  ctx.lineTo(rElbow[0], rElbow[1]);
  ctx.lineTo(rHand[0], rHand[1]);
  ctx.stroke();

  drawSprayCan(ctx, rHand[0] + 6, rHand[1], sprayCol, isSpraying, t);

  // Head Circle
  ctx.fillStyle = PAL.ink;
  ctx.strokeStyle = '#0b0b12';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Expressive Eyes Above the Respirator Mask
  ctx.fillStyle = '#0b0b12';
  ctx.beginPath();
  ctx.arc(-4, headY - 6, 4, 0, Math.PI * 2);
  ctx.arc(14, headY - 6, 4, 0, Math.PI * 2);
  ctx.fill();

  // Street-Art Half-Face Respirator Mask (Unique Feature!)
  ctx.fillStyle = '#1f2937';
  ctx.strokeStyle = PAL.cyan;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-22, headY + 2, 46, 26, 10);
  ctx.fill();
  ctx.stroke();

  // Left & Right Neon Pink Respirator Filter Cartridges on cheeks!
  ctx.fillStyle = PAL.pink;
  ctx.strokeStyle = '#0b0b12';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(-22, headY + 16, 9, 0, Math.PI * 2);
  ctx.arc(24, headY + 16, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Respirator center vent grill
  ctx.fillStyle = PAL.yellow;
  ctx.beginPath();
  ctx.arc(2, headY + 15, 5, 0, Math.PI * 2);
  ctx.fill();

  // Spiky Street Hair + Big Neon Goggles on Forehead!
  ctx.fillStyle = '#181826';
  ctx.strokeStyle = PAL.pink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-34, headY - 16);
  ctx.lineTo(-24, headY - 48);
  ctx.lineTo(-6, headY - 34);
  ctx.lineTo(8, headY - 52);
  ctx.lineTo(20, headY - 34);
  ctx.lineTo(36, headY - 44);
  ctx.lineTo(32, headY - 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Street Goggles resting on forehead
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.fillStyle = PAL.cyan;
  ctx.beginPath();
  ctx.arc(-11, headY - 22, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.pink;
  ctx.beginPath();
  ctx.arc(13, headY - 22, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function graffitiWallArt(ctx, floorY, badge, mainText, subText, {
  col = PAL.pink,
  accent = PAL.cyan,
} = {}) {
  ctx.save();
  const bx = 740, by = floorY - 245, bw = 330, bh = 175;

  // Neon spray-painted mural frame on the brick wall
  ctx.fillStyle = 'rgba(11, 11, 18, 0.85)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(bx - bw / 2, by, bw, bh, 22);
  ctx.fill();
  ctx.stroke();

  // Spray paint drips under the mural frame
  ctx.fillStyle = col;
  for (const [dx, dh] of [[-110, 26], [-75, 16], [85, 32], [115, 18]]) {
    ctx.beginPath();
    ctx.roundRect(bx + dx, by + bh - 2, 7, dh, 3.5);
    ctx.fill();
  }

  ctx.fillStyle = accent;
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(badge, bx, by + 40, bw - 28);

  ctx.fillStyle = PAL.yellow;
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(mainText, bx, by + 92, bw - 28);

  ctx.fillStyle = PAL.ink;
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subText, bx, by + 134, bw - 28);
  ctx.restore();
}

export function graffitiBubble(ctx, x, y, text, {
  tailX = x,
  tailY = y + 70,
  col = PAL.pink,
} = {}) {
  ctx.save();
  ctx.font = '800 20.5px "Plus Jakarta Sans", sans-serif';
  const tw = Math.max(320, ctx.measureText(text).width + 52);
  const th = 64;
  const bx = clamp(x - tw / 2, 85, 995 - tw);
  const by = y - th / 2;

  ctx.fillStyle = '#161625';
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, 16);
  ctx.fill();
  ctx.stroke();

  // Pointer tail
  ctx.beginPath();
  ctx.moveTo(clamp(tailX - 10, bx + 22, bx + tw - 36), by + th - 2);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(clamp(tailX + 10, bx + 36, bx + tw - 22), by + th - 2);
  ctx.fillStyle = '#161625';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.ink;
  ctx.textAlign = 'center';
  ctx.fillText(text, bx + tw / 2, by + 40, tw - 28);
  ctx.restore();
}

export function graffitiCard(ctx, cx, cy, w, h, {
  tag = 'STREET MANIFESTO',
  titleStr = '',
  subStr = '',
  stat = '',
  statSub = '',
  col = PAL.pink,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);
  const x = cx - w / 2, y = cy - h / 2;

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 22);
  ctx.fill();

  ctx.fillStyle = PAL.cardBg;
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 22);
  ctx.fill();
  ctx.stroke();

  // Left neon bar
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 18, y + 22, 10, h - 44, 5);
  ctx.fill();

  const maxTextW = stat ? w - 275 : w - 70;
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText(tag, x + 44, y + 46, maxTextW);

  ctx.fillStyle = PAL.ink;
  ctx.font = '800 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(titleStr, x + 44, y + 88, maxTextW);

  ctx.fillStyle = PAL.muted;
  ctx.font = '500 16.5px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subStr, x + 44, y + 128, maxTextW);

  if (stat) {
    const sw = 195, sh = h - 36;
    const sx = x + w - sw - 20, sy = y + 18;
    ctx.fillStyle = 'rgba(255, 47, 179, 0.1)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.yellow;
    ctx.font = '900 25px "JetBrains Mono", monospace';
    ctx.fillText(stat, sx + sw / 2, sy + 64, sw - 16);

    ctx.fillStyle = PAL.cyan;
    ctx.font = '800 13.5px "JetBrains Mono", monospace';
    ctx.fillText(statSub, sx + sw / 2, sy + 98, sw - 16);
  }
  ctx.restore();
}
