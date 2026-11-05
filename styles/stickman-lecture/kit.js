// 75 · STICKMAN LECTURE — Kit: "Si Profesor Kapur" (Topi Toga Rumbai Emas, Kacamata Bulat, Dasi Kupu-Kupu, Jas Akademik & Tongkat Penunjuk)
import { clamp } from '/engine/lib/core.js';

export const PAL = {
  roomBg0: '#0e241c',
  roomBg1: '#153529',
  boardGreen: '#1b4d3b',
  boardDark: '#13382b',
  woodFrame: '#b57c43',
  woodDark: '#784e25',
  chalkWhite: '#f8fafc',
  chalkYellow: '#fde047',
  chalkPink: '#f472b6',
  chalkBlue: '#38bdf8',
  bowTieRed: '#e11d48',
  muted: '#a7f3d0',
};

export function lectureBg(ctx, t, {
  floorY = 1240,
  courseTag = 'KULIAH 101 • PSIKOLOGI BELAJAR & MEMORI',
  col = PAL.chalkYellow,
} = {}) {
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, PAL.roomBg0);
  g.addColorStop(0.55, PAL.roomBg1);
  g.addColorStop(1, '#0a1913');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1920);

  // Faint math/science grid on background wall
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.04)';
  ctx.lineWidth = 1.5;
  for (let x = 60; x < 1040; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1920); ctx.stroke();
  }
  for (let y = 60; y < 1900; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke();
  }

  // Main Wooden-Framed Classroom Chalkboard (Full-Screen height y: 225..1390)
  const sx = 46, sy = 225, sw = 988, sh = floorY - sy + 155;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(sx + 8, sy + 12, sw, sh, 26);
  ctx.fill();

  // Outer Wooden Frame
  ctx.fillStyle = PAL.woodFrame;
  ctx.strokeStyle = PAL.woodDark;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 26);
  ctx.fill();
  ctx.stroke();

  // Inner Green Slate Chalkboard Surface
  const bx = sx + 18, by = sy + 18, bw = sw - 36, bh = sh - 36;
  const bg = ctx.createRadialGradient(540, sy + 400, 40, 540, sy + 400, 680);
  bg.addColorStop(0, '#225e49');
  bg.addColorStop(1, PAL.boardDark);
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 18);
  ctx.fill();

  // Chalk dust smudge texture on blackboard
  ctx.fillStyle = 'rgba(248, 250, 252, 0.04)';
  ctx.beginPath();
  ctx.ellipse(380, 560, 260, 120, -0.15, 0, Math.PI * 2);
  ctx.ellipse(740, 680, 220, 110, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Chalkboard Floor / Wooden Ledge at floorY
  ctx.fillStyle = PAL.woodDark;
  ctx.fillRect(bx + 20, floorY, bw - 40, 16);
  ctx.strokeStyle = PAL.chalkYellow;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(bx + 20, floorY);
  ctx.lineTo(bx + bw - 20, floorY);
  ctx.stroke();

  // Pieces of Colored Chalk & Felt Eraser sitting on the ledge
  ctx.fillStyle = PAL.chalkWhite;
  ctx.fillRect(150, floorY - 10, 38, 10);
  ctx.fillStyle = PAL.chalkYellow;
  ctx.fillRect(205, floorY - 10, 34, 10);
  ctx.fillStyle = PAL.chalkPink;
  ctx.fillRect(250, floorY - 10, 32, 10);
  // Chalkboard eraser on right ledge
  ctx.fillStyle = '#334155';
  ctx.fillRect(860, floorY - 22, 64, 22);
  ctx.fillStyle = PAL.woodFrame;
  ctx.fillRect(860, floorY - 22, 64, 8);

  // Top-left Course Syllabus Tag on Blackboard
  ctx.font = '800 16px "JetBrains Mono", monospace';
  const tagW = Math.max(420, ctx.measureText(courseTag).width + 44);
  ctx.fillStyle = 'rgba(19, 56, 43, 0.9)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(100, sy + 32, tagW, 40, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = col;
  ctx.textAlign = 'left';
  ctx.fillText(courseTag, 120, sy + 58);
  ctx.restore();
}

/**
 * Camera zoom & pan helper for stickman-lecture
 */
export function withCamera(ctx, { zoom = 1, fx = 540, fy = 850, dx = 0, dy = 0 } = {}, fn) {
  ctx.save();
  ctx.translate(540 + dx, 850 + dy);
  ctx.scale(zoom, zoom);
  ctx.translate(-fx, -fy);
  fn();
  ctx.restore();
}

/**
 * Educational Floating Callout Card on the lower area (y: 1485, h: 165)
 */
export function lectureCallout(ctx, x, y, w, h, {
  tag = 'KULIAH UMUM',
  title = '',
  desc = '',
  stat = '',
  statSub = '',
  col = PAL.chalkYellow,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.92 + 0.08 * a, 0.92 + 0.08 * a);
  ctx.globalAlpha = clamp(a, 0, 1);

  ctx.fillStyle = 'rgba(19, 56, 43, 0.95)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 20);
  ctx.fill();
  ctx.stroke();

  // Tag pill
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 22, -h / 2 + 18, 290, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#0e241c';
  ctx.font = '900 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, -w / 2 + 34, -h / 2 + 33, 266);

  const textW = stat ? w - 240 : w - 56;
  ctx.fillStyle = PAL.chalkWhite;
  ctx.font = '900 25px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, -w / 2 + 22, -h / 2 + 76, textW);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(desc, -w / 2 + 22, -h / 2 + 116, textW);

  if (stat) {
    ctx.fillStyle = 'rgba(253, 224, 71, 0.18)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 192, -h / 2 + 20, 170, h - 40, 14);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = col;
    ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stat, w / 2 - 107, -4, 150);
    if (statSub) {
      ctx.fillStyle = PAL.chalkWhite;
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillText(statSub, w / 2 - 107, 26, 150);
    }
  }

  ctx.restore();
}

export function lectureHeader(ctx, badgeText, title, subtitle, {
  col = PAL.chalkYellow,
} = {}) {
  ctx.save();
  const x = 60, y = 45, w = 960, h = 152;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 24);
  ctx.fill();

  ctx.fillStyle = PAL.boardDark;
  ctx.strokeStyle = PAL.woodFrame;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 24);
  ctx.fill();
  ctx.stroke();

  // Left Chalk Badge
  const bx = x + 22, by = y + 20, bw = 175, bh = 112;
  ctx.fillStyle = '#1b4d3b';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.muted;
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PROF. KAPUR', bx + bw / 2, by + 34);

  ctx.fillStyle = col;
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(badgeText, bx + bw / 2, by + 82, bw - 16);

  // Title & Subtitle
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText('KELAS PAPAN TULIS • STICKMAN LECTURE', bx + bw + 26, y + 40);

  ctx.fillStyle = PAL.chalkWhite;
  ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, bx + bw + 26, y + 84, w - bw - 65);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, bx + bw + 26, y + 120, w - bw - 65);
  ctx.restore();
}

// Unique Character: "Si Profesor Kapur"
// (Academic Mortarboard Cap with Golden Tassel + Round Spectacles + Mustache + Academic Blazer + Red Bow-Tie + Pointer Stick)
export function lectureStickman(ctx, x, floorY, pose = 'teach', {
  facing = 1,
  t = 0,
  scale = 1,
} = {}) {
  ctx.save();
  const bob = Math.sin(t * 4) * 3;
  ctx.translate(x, floorY);
  ctx.scale(facing * scale, scale);

  // Chalk shadow on ledge
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 3, 44, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const hipY = -110 + bob;
  const shoulderY = -224 + bob;
  const headY = -282 + bob;
  const headR = 36;

  // Legs
  ctx.strokeStyle = PAL.chalkWhite;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-14, hipY);
  ctx.lineTo(-18, -12);
  ctx.moveTo(14, hipY);
  ctx.lineTo(18, -12);
  ctx.stroke();

  // Brown Oxford Professor Shoes
  for (const sx of [-18, 18]) {
    ctx.fillStyle = PAL.woodFrame;
    ctx.strokeStyle = PAL.chalkWhite;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(sx - 10, -16, 28, 13, 5);
    ctx.fill();
    ctx.stroke();
  }

  // Arms based on pose
  let lElbow = [-38, shoulderY + 36], lHand = [-26, hipY - 6];
  let rElbow = [40, shoulderY + 20], rHand = [68, shoulderY - 12];
  let pointerAngle = -0.35;

  if (pose === 'think') {
    lElbow = [-36, shoulderY + 40]; lHand = [-24, hipY];
    rElbow = [38, shoulderY + 24]; rHand = [22, headY + 22];
    pointerAngle = 0.25;
  } else if (pose === 'eureka') {
    lElbow = [-44, shoulderY - 16]; lHand = [-52, headY - 22];
    rElbow = [46, shoulderY - 20]; rHand = [66, headY - 28];
    pointerAngle = -0.55;
  }

  // Back Arm
  ctx.strokeStyle = PAL.chalkWhite;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-22, shoulderY + 8);
  ctx.lineTo(lElbow[0], lElbow[1]);
  ctx.lineTo(lHand[0], lHand[1]);
  ctx.stroke();

  // Professor Academic Tweed Blazer & White Shirt V-Neck
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = PAL.chalkWhite;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-26, shoulderY);
  ctx.lineTo(26, shoulderY);
  ctx.lineTo(32, hipY);
  ctx.lineTo(-32, hipY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White shirt V-neck triangle
  ctx.fillStyle = PAL.chalkWhite;
  ctx.beginPath();
  ctx.moveTo(-14, shoulderY + 2);
  ctx.lineTo(14, shoulderY + 2);
  ctx.lineTo(0, shoulderY + 42);
  ctx.closePath();
  ctx.fill();

  // Signature Red Bow-Tie (Dasi Kupu-Kupu Merah) at collar!
  ctx.fillStyle = PAL.bowTieRed;
  ctx.strokeStyle = PAL.chalkWhite;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, shoulderY + 10);
  ctx.lineTo(-16, shoulderY + 2);
  ctx.lineTo(-16, shoulderY + 18);
  ctx.closePath();
  ctx.moveTo(0, shoulderY + 10);
  ctx.lineTo(16, shoulderY + 2);
  ctx.lineTo(16, shoulderY + 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Front Arm + Telescopic Chalkboard Pointer Stick!
  ctx.strokeStyle = PAL.chalkWhite;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(22, shoulderY + 8);
  ctx.lineTo(rElbow[0], rElbow[1]);
  ctx.lineTo(rHand[0], rHand[1]);
  ctx.stroke();

  // Pointer Stick extending from right hand towards the chalkboard diagram
  ctx.save();
  ctx.translate(rHand[0], rHand[1]);
  ctx.rotate(pointerAngle + Math.sin(t * 4) * 0.05);
  ctx.strokeStyle = PAL.chalkYellow;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(115, 0);
  ctx.stroke();
  // Red rubber tip on pointer stick
  ctx.fillStyle = PAL.bowTieRed;
  ctx.beginPath();
  ctx.arc(115, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head Circle
  ctx.fillStyle = PAL.chalkWhite;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Round Professor Spectacles (Kacamata Bulat)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3.5;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.beginPath();
  ctx.arc(-6, headY - 3, 10, 0, Math.PI * 2);
  ctx.arc(16, headY - 3, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Spectacles bridge
  ctx.beginPath();
  ctx.moveTo(4, headY - 3);
  ctx.lineTo(6, headY - 3);
  ctx.moveTo(-16, headY - 3);
  ctx.lineTo(-32, headY - 5);
  ctx.stroke();

  // Pupils inside glasses
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-5, headY - 3, 3, 0, Math.PI * 2);
  ctx.arc(17, headY - 3, 3, 0, Math.PI * 2);
  ctx.fill();

  // Friendly Mustache above mouth
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-6, headY + 13);
  ctx.quadraticCurveTo(5, headY + 8, 18, headY + 13);
  ctx.stroke();

  // Academic Mortarboard Cap (Topi Toga Profesor) on top of head!
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = PAL.chalkYellow;
  ctx.lineWidth = 3;
  // Skull cap base
  ctx.beginPath();
  ctx.roundRect(-24, headY - headR - 6, 48, 16, 4);
  ctx.fill();
  ctx.stroke();

  // Flat Diamond Mortarboard Top
  ctx.beginPath();
  ctx.moveTo(0, headY - headR - 24);
  ctx.lineTo(52, headY - headR - 10);
  ctx.lineTo(0, headY - headR + 2);
  ctx.lineTo(-52, headY - headR - 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hanging Golden Tassel (Rumbai Emas) on left side of mortarboard
  ctx.strokeStyle = PAL.chalkYellow;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, headY - headR - 11);
  ctx.lineTo(-38, headY - headR - 8);
  ctx.lineTo(-42 + Math.sin(t * 5) * 3, headY - headR + 18);
  ctx.stroke();
  ctx.fillStyle = PAL.chalkYellow;
  ctx.beginPath();
  ctx.arc(-42 + Math.sin(t * 5) * 3, headY - headR + 20, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function lectureBoardDiagram(ctx, floorY, badge, formula, note, {
  col = PAL.chalkYellow,
} = {}) {
  ctx.save();
  const bx = 735, by = floorY - 245, bw = 340, bh = 175;

  ctx.fillStyle = 'rgba(15, 42, 32, 0.78)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.roundRect(bx - bw / 2, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = PAL.chalkBlue;
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(badge, bx, by + 40, bw - 28);

  ctx.fillStyle = col;
  ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(formula, bx, by + 92, bw - 28);

  ctx.fillStyle = PAL.chalkWhite;
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(note, bx, by + 134, bw - 28);
  ctx.restore();
}

export function lectureBubble(ctx, x, y, text, {
  tailX = x,
  tailY = y + 70,
  col = PAL.chalkYellow,
} = {}) {
  ctx.save();
  ctx.font = '800 20.5px "Plus Jakarta Sans", sans-serif';
  const tw = Math.max(320, ctx.measureText(text).width + 52);
  const th = 64;
  const bx = clamp(x - tw / 2, 85, 995 - tw);
  const by = y - th / 2;

  ctx.fillStyle = '#123327';
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
  ctx.fillStyle = '#123327';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.chalkWhite;
  ctx.textAlign = 'center';
  ctx.fillText(text, bx + tw / 2, by + 40, tw - 28);
  ctx.restore();
}

export function lectureCard(ctx, cx, cy, w, h, {
  tag = 'CATATAN KULIAH',
  titleStr = '',
  subStr = '',
  stat = '',
  statSub = '',
  col = PAL.chalkYellow,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);
  const x = cx - w / 2, y = cy - h / 2;

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 22);
  ctx.fill();

  ctx.fillStyle = PAL.boardDark;
  ctx.strokeStyle = PAL.woodFrame;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 22);
  ctx.fill();
  ctx.stroke();

  // Left chalk accent bar
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x + 18, y + 22, 10, h - 44, 5);
  ctx.fill();

  const maxTextW = stat ? w - 275 : w - 70;
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText(tag, x + 44, y + 46, maxTextW);

  ctx.fillStyle = PAL.chalkWhite;
  ctx.font = '800 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(titleStr, x + 44, y + 88, maxTextW);

  ctx.fillStyle = PAL.muted;
  ctx.font = '500 16.5px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subStr, x + 44, y + 128, maxTextW);

  if (stat) {
    const sw = 195, sh = h - 36;
    const sx = x + w - sw - 20, sy = y + 18;
    ctx.fillStyle = 'rgba(253, 224, 71, 0.1)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = col;
    ctx.font = '900 25px "JetBrains Mono", monospace';
    ctx.fillText(stat, sx + sw / 2, sy + 64, sw - 16);

    ctx.fillStyle = PAL.chalkWhite;
    ctx.font = '800 13.5px "JetBrains Mono", monospace';
    ctx.fillText(statSub, sx + sw / 2, sy + 98, sw - 16);
  }
  ctx.restore();
}
