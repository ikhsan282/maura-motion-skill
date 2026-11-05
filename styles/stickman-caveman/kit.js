// 71 · STICKMAN CAVEMAN — Kit: "Si Uga Manusia Gua" (Tulang di Rambut Gondrong, Jubah Kulit Macan Tutul & Pentungan Kayu)
import { clamp } from '/engine/lib/core.js';

export const PAL = {
  caveBg0: '#17100b',
  caveBg1: '#261a12',
  caveStage: '#332217',
  stoneCard: '#241810',
  ink: '#f6e7cb',
  ochre: '#e68a2e',
  amber: '#f5b841',
  fire: '#ff5722',
  teal: '#2ec4b6',
  bone: '#f4efe6',
  pelt: '#d9822b',
  peltSpot: '#4a250d',
  wood: '#8c5327',
  rock: '#7c7267',
  rockDark: '#4f473f',
  muted: '#b59e84',
};

export function cavemanBg(ctx, t, {
  floorY = 1240,
  stageTag = 'GUA EVOLUSI • OTAK PURBA DI ERA MODERN',
  col = PAL.ochre,
} = {}) {
  ctx.save();
  // Deep cave background
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, PAL.caveBg0);
  g.addColorStop(0.55, PAL.caveBg1);
  g.addColorStop(1, '#120c08');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle prehistoric rock strata lines
  ctx.strokeStyle = 'rgba(246, 231, 203, 0.04)';
  ctx.lineWidth = 2;
  for (let y = 120; y < 1850; y += 95) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(360, y + 18, 720, y - 18, 1080, y + 6);
    ctx.stroke();
  }

  // Main Cave Stage Panel (Full-Screen height!)
  const sx = 46, sy = 225, sw = 988, sh = floorY - sy + 150;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.roundRect(sx + 10, sy + 12, sw, sh, 28);
  ctx.fill();

  const sg = ctx.createLinearGradient(0, sy, 0, sy + sh);
  sg.addColorStop(0, '#23170f');
  sg.addColorStop(0.7, PAL.caveStage);
  sg.addColorStop(1, '#1f140d');
  ctx.fillStyle = sg;
  ctx.strokeStyle = col;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 28);
  ctx.fill();
  ctx.stroke();

  // Warm campfire radial glow inside the cave stage
  const flicker = 0.88 + 0.12 * Math.sin(t * 9.5);
  const fg = ctx.createRadialGradient(540, floorY - 80, 20, 540, floorY - 80, 520);
  fg.addColorStop(0, `rgba(255, 130, 40, ${0.24 * flicker})`);
  fg.addColorStop(0.6, `rgba(230, 138, 46, ${0.08 * flicker})`);
  fg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 28);
  ctx.fill();

  // Hanging cave stalactites along the top right of the stage
  ctx.fillStyle = '#3d2a1d';
  ctx.strokeStyle = 'rgba(246,231,203,0.18)';
  ctx.lineWidth = 2;
  const stalactites = [
    [680, 56, 30], [745, 92, 38], [810, 50, 26], [885, 110, 42], [955, 65, 30], [1000, 80, 32],
  ];
  for (const [cx, h, w] of stalactites) {
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, sy + 2);
    ctx.lineTo(cx, sy + h);
    ctx.lineTo(cx + w / 2, sy + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Rocky cave floor line
  ctx.strokeStyle = PAL.muted;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(70, floorY);
  ctx.lineTo(1010, floorY);
  ctx.stroke();

  // Stage Tag
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(74, 248, 410, 42, 12);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#17100b';
  ctx.font = '800 16px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stageTag, 279, 269, 390);

  ctx.restore();
}

/**
 * Camera helper for dynamic zoom & focus in stickman-caveman
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
 * Prehistoric Floating Callout Card on the lower area (y: 1485, h: 165)
 */
export function cavemanCallout(ctx, x, y, w, h, {
  tag = 'EVOLUSI OTAK',
  title = '',
  desc = '',
  stat = '',
  statSub = '',
  col = PAL.ochre,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.92 + 0.08 * a, 0.92 + 0.08 * a);
  ctx.globalAlpha = clamp(a, 0, 1);

  ctx.fillStyle = PAL.stoneCard;
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 20);
  ctx.fill();
  ctx.stroke();

  // Tag pill
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 22, -h / 2 + 18, 280, 30, 8);
  ctx.fill();
  ctx.fillStyle = '#17100b';
  ctx.font = '900 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, -w / 2 + 34, -h / 2 + 33, 256);

  const textW = stat ? w - 240 : w - 56;
  ctx.fillStyle = PAL.ink;
  ctx.font = '900 25px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, -w / 2 + 22, -h / 2 + 76, textW);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(desc, -w / 2 + 22, -h / 2 + 116, textW);

  if (stat) {
    ctx.fillStyle = 'rgba(230, 138, 46, 0.18)';
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
      ctx.fillStyle = PAL.bone;
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillText(statSub, w / 2 - 107, 26, 150);
    }
  }

  ctx.restore();
}

export function cavemanHeader(ctx, badgeText, title, subtitle, {
  col = PAL.ochre,
} = {}) {
  ctx.save();
  const x = 60, y = 45, w = 960, h = 152;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 24);
  ctx.fill();

  ctx.fillStyle = PAL.stoneCard;
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 24);
  ctx.fill();
  ctx.stroke();

  // Left carved tablet badge
  const bx = x + 22, by = y + 20, bw = 175, bh = 112;
  ctx.fillStyle = col;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#17100b';
  ctx.font = '800 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SI UGA PURBA', bx + bw / 2, by + 34);
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(badgeText, bx + bw / 2, by + 82, bw - 16);

  // Title & Subtitle
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText('PSIKOLOGI EVOLUSIONER • STICKMAN CAVEMAN', bx + bw + 26, y + 40);

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, bx + bw + 26, y + 84, w - bw - 65);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, bx + bw + 26, y + 120, w - bw - 65);
  ctx.restore();
}

function drawBone(ctx, cx, cy, len, r = 7) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = PAL.bone;
  ctx.strokeStyle = '#1a110a';
  ctx.lineWidth = 3.5;

  // Bone shaft & 4 knobs
  ctx.beginPath();
  ctx.arc(-len / 2, -r * 0.65, r, 0, Math.PI * 2);
  ctx.arc(-len / 2, r * 0.65, r, 0, Math.PI * 2);
  ctx.arc(len / 2, -r * 0.65, r, 0, Math.PI * 2);
  ctx.arc(len / 2, r * 0.65, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillRect(-len / 2, -r * 0.55, len, r * 1.1);
  ctx.beginPath();
  ctx.moveTo(-len / 2, -r * 0.55); ctx.lineTo(len / 2, -r * 0.55);
  ctx.moveTo(-len / 2, r * 0.55); ctx.lineTo(len / 2, r * 0.55);
  ctx.stroke();
  ctx.restore();
}

function drawWoodenClub(ctx, x, y, angle = -0.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineJoin = 'round';

  // Tapered knobby wooden club (pentungan kayu)
  ctx.fillStyle = PAL.wood;
  ctx.strokeStyle = '#1a110a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, 12);
  ctx.lineTo(-18, -88);
  ctx.quadraticCurveTo(-22, -118, 0, -122);
  ctx.quadraticCurveTo(22, -118, 18, -88);
  ctx.lineTo(6, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wood highlight & knots
  ctx.strokeStyle = 'rgba(246, 231, 203, 0.3)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, -15);
  ctx.lineTo(-10, -95);
  ctx.stroke();

  // Protruding stone spikes on the club head
  ctx.fillStyle = PAL.bone;
  ctx.strokeStyle = '#1a110a';
  ctx.lineWidth = 3;
  for (const [sx, sy, dir] of [[-17, -75, -1], [17, -85, 1], [-16, -98, -1]]) {
    ctx.beginPath();
    ctx.moveTo(sx, sy - 7);
    ctx.lineTo(sx + dir * 13, sy);
    ctx.lineTo(sx, sy + 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

// Unique Character: "Si Uga Manusia Gua" (Shaggy Mane + Topknot Bone + Leopard Pelt Tunic + Knobby Club)
export function cavemanStickman(ctx, x, floorY, pose = 'hunt', {
  facing = 1,
  t = 0,
  scale = 1,
  hasClub = true,
} = {}) {
  ctx.save();
  const bob = Math.sin(t * 4.5) * 3.5;
  ctx.translate(x, floorY);
  ctx.scale(facing * scale, scale);

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 48, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  const hipY = -108 + bob;
  const shoulderY = -225 + bob;
  const headY = -282 + bob;
  const headR = 38;

  // Bare Caveman Legs & Feet
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const stride = pose === 'hunt' ? Math.sin(t * 6) * 14 : 0;
  // Left leg
  ctx.beginPath();
  ctx.moveTo(-15, hipY);
  ctx.lineTo(-22 - stride * 0.5, -52);
  ctx.lineTo(-20 - stride, -6);
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(15, hipY);
  ctx.lineTo(24 + stride * 0.5, -52);
  ctx.lineTo(22 + stride, -6);
  ctx.stroke();

  // Prehistoric bare feet ovals
  ctx.fillStyle = PAL.ink;
  ctx.strokeStyle = '#1a110a';
  ctx.lineWidth = 3.5;
  for (const fx of [-20 - stride, 22 + stride]) {
    ctx.beginPath();
    ctx.ellipse(fx + 8, -5, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Back Arm
  let lElbow = [-42, shoulderY + 34], lHand = [-34, shoulderY + 75];
  let rElbow = [44, shoulderY + 26], rHand = [64, shoulderY - 8], clubAngle = 0.45;

  if (pose === 'panic') {
    lElbow = [-52, shoulderY - 18]; lHand = [-44, headY - 12];
    rElbow = [52, shoulderY - 18]; rHand = [48, headY - 12];
    clubAngle = 0.85;
  } else if (pose === 'think') {
    lElbow = [-38, shoulderY + 42]; lHand = [-26, hipY + 5];
    rElbow = [40, shoulderY + 18]; rHand = [20, headY + 26];
    clubAngle = 1.1;
  } else if (pose === 'push') {
    lElbow = [34, shoulderY + 18]; lHand = [68, shoulderY + 8];
    rElbow = [42, shoulderY + 38]; rHand = [72, shoulderY + 28];
    clubAngle = 1.4;
  } else if (pose === 'victory') {
    lElbow = [-48, shoulderY - 22]; lHand = [-62, headY - 28];
    rElbow = [48, shoulderY - 26]; rHand = [64, headY - 36];
    clubAngle = -0.25;
  }

  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8.5;
  ctx.beginPath();
  ctx.moveTo(-22, shoulderY + 8);
  ctx.lineTo(lElbow[0], lElbow[1]);
  ctx.lineTo(lHand[0], lHand[1]);
  ctx.stroke();

  // Leopard-Spotted Hide Tunic (Jubah Kulit Macan Tutul Satu Bahu)
  ctx.fillStyle = PAL.pelt;
  ctx.strokeStyle = '#1a110a';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  // One-shoulder diagonal strap on left shoulder (-28, shoulderY) down to right armpit (28, shoulderY + 26)
  ctx.moveTo(-28, shoulderY);
  ctx.lineTo(-4, shoulderY);
  ctx.lineTo(30, shoulderY + 28);
  ctx.lineTo(38, hipY + 8);
  // Jagged prehistoric fur hem at the bottom
  ctx.lineTo(24, hipY - 2);
  ctx.lineTo(12, hipY + 12);
  ctx.lineTo(0, hipY - 2);
  ctx.lineTo(-14, hipY + 12);
  ctx.lineTo(-26, hipY - 2);
  ctx.lineTo(-38, hipY + 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Leopard spots on tunic
  ctx.fillStyle = PAL.peltSpot;
  for (const [sx, sy, sr] of [[-12, shoulderY + 34, 6], [10, shoulderY + 48, 7], [-16, shoulderY + 72, 6.5], [14, shoulderY + 82, 5.5], [0, shoulderY + 62, 5]]) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Prehistoric Rope Belt + Fang Necklace
  ctx.strokeStyle = PAL.bone;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-34, hipY - 18);
  ctx.lineTo(34, hipY - 18);
  ctx.stroke();

  // Front Arm + Wooden Club
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8.5;
  ctx.beginPath();
  ctx.moveTo(24, shoulderY + 8);
  ctx.lineTo(rElbow[0], rElbow[1]);
  ctx.lineTo(rHand[0], rHand[1]);
  ctx.stroke();

  if (hasClub) {
    drawWoodenClub(ctx, rHand[0], rHand[1], clubAngle + Math.sin(t * 5) * 0.06);
  }

  // Wild Shaggy Back Hair Mane
  ctx.fillStyle = '#331d0e';
  ctx.strokeStyle = '#140b05';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, headY + 2, headR + 12, Math.PI * 0.75, Math.PI * 2.25);
  ctx.lineTo(headR + 16, headY + 24);
  ctx.lineTo(headR - 2, headY + 18);
  ctx.lineTo(-headR + 2, headY + 18);
  ctx.lineTo(-headR - 16, headY + 24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head Circle
  ctx.fillStyle = PAL.ink;
  ctx.strokeStyle = '#1a110a';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(0, headY, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Caveman Jaw Stubble Dots
  ctx.fillStyle = 'rgba(51, 29, 14, 0.35)';
  for (const [dx, dy] of [[-12, 22], [-4, 25], [6, 25], [14, 22], [18, 16]]) {
    ctx.beginPath();
    ctx.arc(dx, headY + dy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Thick Prehistoric Unibrow & Eyes
  ctx.strokeStyle = '#1a110a';
  ctx.lineWidth = 5.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (pose === 'panic') {
    ctx.moveTo(-16, headY - 12);
    ctx.quadraticCurveTo(4, headY - 20, 24, headY - 12);
  } else {
    ctx.moveTo(-16, headY - 14);
    ctx.lineTo(4, headY - 9);
    ctx.lineTo(24, headY - 15);
  }
  ctx.stroke();

  ctx.fillStyle = '#1a110a';
  ctx.beginPath();
  ctx.arc(-4, headY - 2, 4, 0, Math.PI * 2);
  ctx.arc(15, headY - 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // Expressive Mouth
  ctx.beginPath();
  ctx.lineWidth = 3.5;
  if (pose === 'panic') {
    ctx.arc(7, headY + 13, 8, 0, Math.PI * 2);
    ctx.stroke();
  } else if (pose === 'victory') {
    ctx.arc(7, headY + 9, 10, 0.1, Math.PI - 0.1);
    ctx.stroke();
  } else {
    ctx.moveTo(-1, headY + 13);
    ctx.lineTo(15, headY + 11);
    ctx.stroke();
  }

  // Shaggy Front Bangs + Topknot Hair Bun + White Bone (🦴)
  ctx.fillStyle = '#331d0e';
  ctx.strokeStyle = '#140b05';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, headY - 6, headR + 4, Math.PI * 1.05, Math.PI * 1.95);
  // Jagged bangs
  ctx.lineTo(26, headY - 12);
  ctx.lineTo(14, headY - 20);
  ctx.lineTo(4, headY - 11);
  ctx.lineTo(-8, headY - 21);
  ctx.lineTo(-18, headY - 11);
  ctx.lineTo(-32, headY - 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Topknot bun & Bone
  drawBone(ctx, 0, headY - headR - 14, 52, 7.5);
  ctx.fillStyle = '#331d0e';
  ctx.strokeStyle = '#140b05';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, headY - headR - 10, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function cavemanProps(ctx, floorY, type = 'boulder', { phase = 0, t = 0 } = {}) {
  ctx.save();
  // Always draw a warm flickering prehistoric campfire on the left side of the cave
  const fx = 185;
  const flicker = Math.sin(t * 11) * 5;
  // Fire logs
  ctx.fillStyle = PAL.wood;
  ctx.strokeStyle = '#1a110a';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(fx - 38, floorY - 16, 76, 16, 6);
  ctx.fill();
  ctx.stroke();

  // Outer flame
  ctx.fillStyle = PAL.fire;
  ctx.beginPath();
  ctx.moveTo(fx - 28, floorY - 14);
  ctx.quadraticCurveTo(fx - 32, floorY - 65, fx + flicker * 0.5, floorY - 92 - flicker);
  ctx.quadraticCurveTo(fx + 32, floorY - 65, fx + 28, floorY - 14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner golden flame
  ctx.fillStyle = PAL.amber;
  ctx.beginPath();
  ctx.moveTo(fx - 14, floorY - 14);
  ctx.quadraticCurveTo(fx - 16, floorY - 48, fx - flicker * 0.4, floorY - 64);
  ctx.quadraticCurveTo(fx + 16, floorY - 48, fx + 14, floorY - 14);
  ctx.closePath();
  ctx.fill();

  if (type === 'boulder') {
    // Giant "BATU TUGAS" boulder on the right that shrinks or splits into small pebbles in phase 2–3!
    const bx = 770;
    if (phase <= 1) {
      const r = phase === 0 ? 115 : 95;
      ctx.fillStyle = PAL.rock;
      ctx.strokeStyle = '#1a110a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(bx, floorY - r + 6, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PAL.ink;
      ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BATU TUGAS', bx, floorY - r);
      ctx.fillStyle = PAL.amber;
      ctx.font = '800 18px "JetBrains Mono", monospace';
      ctx.fillText('TERASA BERAT!', bx, floorY - r + 30);
    } else {
      // Cracked into 3 small friendly pebbles ("KERIKIL 5 MENIT")
      const pebbles = [
        [690, 42, '5 MNT #1'],
        [790, 46, '5 MNT #2'],
        [890, 38, 'SELESAI!'],
      ];
      for (const [px, pr, lbl] of pebbles) {
        ctx.fillStyle = PAL.teal;
        ctx.strokeStyle = '#1a110a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px, floorY - pr + 4, pr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#17100b';
        ctx.font = '900 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, px, floorY - pr + 8);
      }
    }
  } else if (type === 'tiger') {
    // Sabertooth / Notification Monster Box on right
    const bx = 755, by = floorY - 210;
    const calm = phase >= 2;
    ctx.fillStyle = calm ? '#1c3b36' : '#4a1c17';
    ctx.strokeStyle = calm ? PAL.teal : PAL.fire;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(bx - 155, by, 310, 175, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = calm ? PAL.teal : PAL.fire;
    ctx.font = '800 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(calm ? 'SINYAL AMAN (4-7-8)' : 'ALARM AMIGDALA PURBA:', bx, by + 42, 285);

    ctx.fillStyle = PAL.ink;
    ctx.font = '900 23px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(calm ? 'BUKAN HARIMAU!' : 'HARIMAU SABERTOOTH!', bx, by + 92, 285);

    ctx.fillStyle = PAL.muted;
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(calm ? 'Hanya email & revisi biasa' : 'Detak jantung naik • Tangan dingin', bx, by + 132, 285);
  } else if (type === 'berry') {
    // Dopamine Berry Trap vs High-Value Mammoth Target
    const bx = 755, by = floorY - 210;
    const focused = phase >= 2;
    ctx.fillStyle = focused ? '#1c3b36' : '#3d2214';
    ctx.strokeStyle = focused ? PAL.teal : PAL.amber;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.roundRect(bx - 155, by, 310, 175, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = focused ? PAL.teal : PAL.amber;
    ctx.font = '800 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(focused ? 'PUASA DOPAMIN PAGI:' : 'JEBAKAN BUAH BERI DIGITAL:', bx, by + 42, 285);

    ctx.fillStyle = PAL.ink;
    ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(focused ? 'BURU TARGET UTAMA!' : 'SCROLL & DOPAMIN INSTAN', bx, by + 92, 285);

    ctx.fillStyle = PAL.muted;
    ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(focused ? 'Kerja berat dulu, hadiah belakangan' : 'Kalori murah perhatian tanpa hasil', bx, by + 132, 285);
  }
  ctx.restore();
}

export function cavemanBubble(ctx, x, y, text, {
  tailX = x - 20,
  tailY = y + 75,
  col = PAL.ochre,
} = {}) {
  ctx.save();
  ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
  const tw = Math.max(320, ctx.measureText(text).width + 56);
  const th = 68;
  const bx = clamp(x - tw / 2, 85, 995 - tw);
  const by = y - th / 2;

  ctx.fillStyle = '#2d1e14';
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, 18);
  ctx.fill();
  ctx.stroke();

  // Pointer tail
  ctx.beginPath();
  ctx.moveTo(clamp(tailX - 12, bx + 24, bx + tw - 40), by + th - 2);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(clamp(tailX + 12, bx + 40, bx + tw - 24), by + th - 2);
  ctx.fillStyle = '#2d1e14';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.ink;
  ctx.textAlign = 'center';
  ctx.fillText(text, bx + tw / 2, by + 42);
  ctx.restore();
}

export function cavemanCard(ctx, cx, cy, w, h, {
  tag = 'FAKTA EVOLUSI',
  titleStr = '',
  subStr = '',
  stat = '',
  statSub = '',
  col = PAL.ochre,
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

  ctx.fillStyle = PAL.stoneCard;
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 22);
  ctx.fill();
  ctx.stroke();

  // Left ochre bar
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
    ctx.fillStyle = 'rgba(230, 138, 46, 0.12)';
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

    ctx.fillStyle = PAL.ink;
    ctx.font = '800 13.5px "JetBrains Mono", monospace';
    ctx.fillText(statSub, sx + sw / 2, sy + 98, sw - 16);
  }
  ctx.restore();
}
