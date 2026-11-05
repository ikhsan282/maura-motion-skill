// 73 · STICKMAN DUO — Kit: "Duo Sahabat Raka & Bima" (Si Topi Baseball Balik Vest Merah vs Si Kacamata Biru Jaket Kerah)
import { clamp } from '/engine/lib/core.js';

export function withCamera(ctx, { zoom = 1, panX = 0, panY = 0, fx = 540, fy = 880 } = {}, fn) {
  ctx.save();
  ctx.translate(fx + panX, fy + panY);
  ctx.scale(zoom, zoom);
  ctx.translate(-fx, -fy);
  fn();
  ctx.restore();
}

export const PAL = {
  bg: '#f4f6fa',
  stageLeft: '#fff8f6',
  stageRight: '#f2f7ff',
  cardBg: '#ffffff',
  ink: '#181c26',
  red: '#e63946',
  redSoft: '#ffe3e6',
  blue: '#2563eb',
  blueSoft: '#dbeafe',
  teal: '#0d9488',
  gold: '#f59e0b',
  muted: '#64748b',
  grid: 'rgba(24, 28, 38, 0.06)',
};

export function duoBg(ctx, t, {
  floorY = 1230,
  episodeTag = 'EPISODE 01 • DUO AKUNTABILITAS',
  col = PAL.blue,
} = {}) {
  ctx.save();
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle studio grid dots
  ctx.fillStyle = PAL.grid;
  for (let x = 40; x < 1060; x += 40) {
    for (let y = 40; y < 1900; y += 40) {
      ctx.fillRect(x, y, 3, 3);
    }
  }

  // Main Split-Studio Stage Card (x: 60, y: 225, w: 960, h: 1180)
  const sx = 60, sy = 225, sw = 960, sh = 1180;
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.roundRect(sx + 8, sy + 10, sw, sh, 28);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 28);
  ctx.clip();

  // Left half (Raka's warm zone) & Right half (Bima's cool zone)
  ctx.fillStyle = PAL.stageLeft;
  ctx.fillRect(sx, sy, sw / 2, sh);
  ctx.fillStyle = PAL.stageRight;
  ctx.fillRect(sx + sw / 2, sy, sw / 2, sh);

  // Center dashed VS / Co-Op divider line
  ctx.strokeStyle = 'rgba(24, 28, 38, 0.12)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(540, sy + 70);
  ctx.lineTo(540, floorY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Acoustic studio wall panels on left & right background
  ctx.fillStyle = 'rgba(230, 57, 70, 0.07)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.roundRect(95 + i * 52, sy + 95, 36, 260, 8);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(37, 99, 235, 0.07)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.roundRect(795 + i * 52, sy + 95, 36, 260, 8);
    ctx.fill();
  }

  // Studio floor line
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(95, floorY);
  ctx.lineTo(985, floorY);
  ctx.stroke();

  // Top Studio Episode Bar
  ctx.font = '800 16px "JetBrains Mono", monospace';
  const tagW = Math.max(390, ctx.measureText(episodeTag).width + 44);
  ctx.fillStyle = col;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(90, sy + 22, tagW, 40, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(episodeTag, 110, sy + 48);

  // Right "ON AIR" glowing podcast badge
  const pulse = 0.65 + 0.35 * Math.sin(t * 6);
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.roundRect(825, sy + 22, 165, 40, 12);
  ctx.fill();

  ctx.fillStyle = `rgba(230, 57, 70, ${pulse})`;
  ctx.beginPath();
  ctx.arc(850, sy + 42, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ON AIR • DUO', 868, sy + 47);

  ctx.restore();

  // Outer Stage Border
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 28);
  ctx.stroke();
  ctx.restore();
}

export function duoHeader(ctx, badgeText, title, subtitle, {
  col = PAL.blue,
} = {}) {
  ctx.save();
  const x = 60, y = 45, w = 960, h = 152;
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 24);
  ctx.fill();

  ctx.fillStyle = PAL.cardBg;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 24);
  ctx.fill();
  ctx.stroke();

  // Left Split-Color Duo Badge
  const bx = x + 22, by = y + 20, bw = 175, bh = 112;
  ctx.fillStyle = col;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RAKA & BIMA', bx + bw / 2, by + 34);
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(badgeText, bx + bw / 2, by + 82, bw - 16);

  // Title & Subtitle
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText('DIALOG DUA SAHABAT • STICKMAN DUO', bx + bw + 26, y + 40);

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, bx + bw + 26, y + 84, w - bw - 65);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, bx + bw + 26, y + 120, w - bw - 65);
  ctx.restore();
}

// Unique Character Pair:
// role = 'raka' (Left: Backwards Red Baseball Cap + Red Sporty Vest "01" + Neck Headphones)
// role = 'bima' (Right: Cool Blue Aviator Shades + Royal Blue Collared Zip Jacket + Wavy Hair)
export function duoStickman(ctx, x, floorY, role = 'raka', pose = 'talk', {
  facing = 1,
  t = 0,
  scale = 1,
} = {}) {
  ctx.save();
  const isRaka = role === 'raka';
  const mainCol = isRaka ? PAL.red : PAL.blue;
  const softCol = isRaka ? PAL.redSoft : PAL.blueSoft;
  const bob = Math.sin(t * 4.5 + (isRaka ? 0 : 1.5)) * 3.5;

  ctx.translate(x, floorY);
  ctx.scale(facing * scale, scale);

  // Floor shadow
  ctx.fillStyle = 'rgba(24, 28, 38, 0.12)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 44, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  const hipY = -110 + bob;
  const shoulderY = -224 + bob;
  const headY = -280 + bob;
  const headR = 36;

  // Legs
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 7.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-14, hipY);
  ctx.lineTo(-18, -14);
  ctx.moveTo(14, hipY);
  ctx.lineTo(18, -14);
  ctx.stroke();

  // Sneakers matching character color
  for (const sx of [-18, 18]) {
    ctx.fillStyle = mainCol;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(sx - 10, -18, 28, 14, 6);
    ctx.fill();
    ctx.stroke();
  }

  // Arms based on pose
  let lElbow = [-38, shoulderY + 36], lHand = [-28, shoulderY + 74];
  let rElbow = [38, shoulderY + 26], rHand = [58, shoulderY + 4];
  if (pose === 'shock') {
    lElbow = [-48, shoulderY - 12]; lHand = [-38, headY - 8];
    rElbow = [48, shoulderY - 12]; rHand = [38, headY - 8];
  } else if (pose === 'point') {
    lElbow = [-34, shoulderY + 40]; lHand = [-24, hipY];
    rElbow = [42, shoulderY + 12]; rHand = [74, shoulderY - 14];
  } else if (pose === 'highfive') {
    lElbow = [-36, shoulderY + 30]; lHand = [-24, hipY];
    rElbow = [44, shoulderY - 18]; rHand = [72, headY - 10];
  }

  // Back Arm
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 7.5;
  ctx.beginPath();
  ctx.moveTo(-22, shoulderY + 8);
  ctx.lineTo(lElbow[0], lElbow[1]);
  ctx.lineTo(lHand[0], lHand[1]);
  ctx.stroke();

  // Torso Outfit
  if (isRaka) {
    // Raka: Red Sporty Varsity Vest with white side stripes & "01" badge
    ctx.fillStyle = PAL.red;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-26, shoulderY);
    ctx.lineTo(26, shoulderY);
    ctx.lineTo(32, hipY);
    ctx.lineTo(-32, hipY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White number "01" on chest
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('01', 2, shoulderY + 64);

    // Studio headphones around Raka's neck
    ctx.fillStyle = PAL.ink;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(-15, shoulderY + 8, 10, 7, 0.2, 0, Math.PI * 2);
    ctx.ellipse(15, shoulderY + 8, 10, 7, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Bima: Royal Blue Collared Zip Jacket with white center zipper & lapel collar
    ctx.fillStyle = PAL.blue;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-27, shoulderY);
    ctx.lineTo(27, shoulderY);
    ctx.lineTo(33, hipY);
    ctx.lineTo(-33, hipY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White center zipper line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, shoulderY + 12);
    ctx.lineTo(0, hipY - 4);
    ctx.stroke();

    // Crisp Jacket Collar Flaps
    ctx.fillStyle = softCol;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, shoulderY);
    ctx.lineTo(-6, shoulderY + 18);
    ctx.lineTo(0, shoulderY + 6);
    ctx.lineTo(6, shoulderY + 18);
    ctx.lineTo(20, shoulderY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Front Arm
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 7.5;
  ctx.beginPath();
  ctx.moveTo(22, shoulderY + 8);
  ctx.lineTo(rElbow[0], rElbow[1]);
  ctx.lineTo(rHand[0], rHand[1]);
  ctx.stroke();

  // Head Circle
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (isRaka) {
    // Raka's Expressive Eyes & Mouth
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.arc(-4, headY - 2, 4, 0, Math.PI * 2);
    ctx.arc(14, headY - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (pose === 'shock') {
      ctx.arc(6, headY + 12, 7, 0, Math.PI * 2);
    } else {
      ctx.arc(6, headY + 9, 9, 0.1, Math.PI - 0.1);
    }
    ctx.stroke();

    // Raka's Backwards Red Baseball Cap (Dome + White Front Patch + Rear Snapback Visor Bill)
    ctx.fillStyle = PAL.red;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, headY - 10, headR + 2, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rear snapback visor bill sticking out the back!
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.roundRect(-headR - 24, headY - 18, 28, 11, 5);
    ctx.fill();

    // Cap band
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-headR - 2, headY - 18, (headR + 2) * 2, 10, 4);
    ctx.fill();
    ctx.stroke();
  } else {
    // Bima's Cool Blue Aviator/Wayfarer Sunglasses!
    ctx.fillStyle = PAL.ink;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    // Left & Right sunglass lenses
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(-16, headY - 12, 18, 14, 4);
    ctx.roundRect(6, headY - 12, 18, 14, 4);
    ctx.fill();
    ctx.stroke();

    // Bridge & temple bar
    ctx.beginPath();
    ctx.moveTo(-34, headY - 6);
    ctx.lineTo(26, headY - 6);
    ctx.stroke();

    // White lens reflection slash
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, headY - 2); ctx.lineTo(-4, headY - 9);
    ctx.moveTo(10, headY - 2); ctx.lineTo(18, headY - 9);
    ctx.stroke();

    // Confident smile
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(4, headY + 11, 8, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // Bima's Stylish Blue-Black Wavy Quiff Hair
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-headR + 2, headY - 14);
    ctx.quadraticCurveTo(-20, headY - headR - 18, 8, headY - headR - 12);
    ctx.quadraticCurveTo(32, headY - headR - 16, headR - 2, headY - 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

export function duoCenterProp(ctx, floorY, badge, title, sub, {
  col = PAL.teal,
} = {}) {
  ctx.save();
  const cx = 540, by = floorY - 175, bw = 230, bh = 135;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(cx - bw / 2, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(cx - bw / 2 + 12, by + 12, bw - 24, 32, 9);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(badge, cx, by + 33, bw - 32);

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, cx, by + 80, bw - 24);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(sub, cx, by + 112, bw - 24);
  ctx.restore();
}

export function duoBubble(ctx, x, y, speaker, text, {
  tailX = x,
  tailY = y + 66,
  col = PAL.red,
} = {}) {
  ctx.save();
  ctx.font = '800 18.5px "Plus Jakarta Sans", sans-serif';
  const tw = Math.min(430, Math.max(260, ctx.measureText(`${speaker}: ${text}`).width + 44));
  const th = 62;
  const bx = clamp(x - tw / 2, 82, 998 - tw);
  const by = y - th / 2;

  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.roundRect(bx + 4, by + 5, tw, th, 16);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, 16);
  ctx.fill();
  ctx.stroke();

  // Pointer tail
  ctx.beginPath();
  ctx.moveTo(clamp(tailX - 10, bx + 20, bx + tw - 34), by + th - 2);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(clamp(tailX + 10, bx + 34, bx + tw - 20), by + th - 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = col;
  ctx.textAlign = 'center';
  ctx.fillText(`${speaker}: "${text}"`, bx + tw / 2, by + 38, tw - 26);
  ctx.restore();
}

export function duoCard(ctx, cx, cy, w, h, {
  tag = 'PRINSIP DUO',
  titleStr = '',
  subStr = '',
  stat = '',
  statSub = '',
  col = PAL.blue,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);
  const x = cx - w / 2, y = cy - h / 2;

  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 22);
  ctx.fill();

  ctx.fillStyle = PAL.cardBg;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 22);
  ctx.fill();
  ctx.stroke();

  // Left color bar
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
    ctx.fillStyle = col === PAL.red ? PAL.redSoft : col === PAL.blue ? PAL.blueSoft : '#ccfbf1';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.ink;
    ctx.font = '900 25px "JetBrains Mono", monospace';
    ctx.fillText(stat, sx + sw / 2, sy + 64, sw - 16);

    ctx.fillStyle = col;
    ctx.font = '800 13.5px "JetBrains Mono", monospace';
    ctx.fillText(statSub, sx + sw / 2, sy + 98, sw - 16);
  }
  ctx.restore();
}

export function duoCallout(ctx, cx, cy, w, h, {
  tag = 'DUO AKUNTABILITAS',
  title = '',
  desc = '',
  stat = '',
  col = PAL.blue,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);
  const x = cx - w / 2, y = cy - h / 2;

  // Background Drop Shadow
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.roundRect(x + 7, y + 8, w, h, 20);
  ctx.fill();

  // White Card Surface
  ctx.fillStyle = PAL.cardBg;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fill();
  ctx.stroke();

  // Color Accent Bar on Left
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 18, y + 20, 10, h - 40, 5);
  ctx.fill();

  const maxTextW = stat ? w - 260 : w - 70;
  ctx.textAlign = 'left';

  // Tag
  ctx.fillStyle = col;
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.fillText(tag, x + 44, y + 42, maxTextW);

  // Title
  ctx.fillStyle = PAL.ink;
  ctx.font = '800 23px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, x + 44, y + 84, maxTextW);

  // Desc
  ctx.fillStyle = PAL.muted;
  ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(desc, x + 44, y + 124, maxTextW);

  // Right Stat Box
  if (stat) {
    const sw = 185, sh = h - 34;
    const sx = x + w - sw - 20, sy = y + 17;
    ctx.fillStyle = col === PAL.red ? PAL.redSoft : col === PAL.blue ? PAL.blueSoft : '#ccfbf1';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 14);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.ink;
    ctx.font = '900 26px "JetBrains Mono", monospace';
    ctx.fillText(stat, sx + sw / 2, sy + sh / 2 + 9, sw - 16);
  }
  ctx.restore();
}
