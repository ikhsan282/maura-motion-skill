import { clamp, lerp } from '/engine/lib/core.js';

export const PAL = {
  bgTop: '#fcf0d2',
  bgBot: '#f3d9a4',
  paper: '#fff9ea',
  paperWarm: '#faecc8',
  ink: '#2d2318',
  inkMuted: '#6f5b44',
  crimson: '#d9483b',
  gold: '#e89d22',
  emerald: '#2d8a61',
  sky: '#3c7eb8',
  violet: '#7c52a5',
};

export function picturebookBg(ctx, W, H, t = 0) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PAL.bgTop);
  g.addColorStop(1, PAL.bgBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  // Outer storybook page border with stitched binding
  ctx.fillStyle = PAL.paper;
  ctx.beginPath();
  ctx.roundRect(24, 24, W - 48, H - 48, 28);
  ctx.fill();
  ctx.strokeStyle = '#c8a972';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Stitched inner border
  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = 'rgba(148, 113, 62, 0.45)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(38, 38, W - 76, H - 76, 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // Red bookmark ribbon at top right
  ctx.fillStyle = PAL.crimson;
  ctx.beginPath();
  ctx.moveTo(W - 115, 24);
  ctx.lineTo(W - 75, 24);
  ctx.lineTo(W - 75, 115);
  ctx.lineTo(W - 95, 96);
  ctx.lineTo(W - 115, 115);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Subtle floating golden storybook stars
  for (let i = 0; i < 16; i++) {
    const sx = (i * 179 + 65) % (W - 120) + 60;
    const sy = (i * 251 + 90) % (H - 180) + 90;
    const pulse = 0.35 + 0.35 * Math.sin(t * 2.2 + i);
    ctx.fillStyle = i % 2 === 0 ? `rgba(232,157,34,${pulse})` : `rgba(217,72,59,${pulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(sx, sy, (i % 3) + 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPicturebookHeader(ctx, W, chapterTag, title, subtitle, accent = PAL.crimson) {
  ctx.save();
  // Chapter ribbon pill
  ctx.fillStyle = PAL.paperWarm;
  ctx.beginPath();
  ctx.roundRect(58, 56, 360, 40, 20);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = '800 17px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(chapterTag.toUpperCase(), 76, 82, 325);

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 37px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(title, 58, 142, W - 130);

  ctx.fillStyle = PAL.inkMuted;
  ctx.font = '600 20px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(subtitle, 58, 176, W - 130);

  // Ornamental divider line
  ctx.strokeStyle = '#d3b683';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(58, 196);
  ctx.lineTo(W - 58, 196);
  ctx.stroke();
  ctx.restore();
}

export function drawStorybookStage(ctx, x, y, w, h, t = 0, accent = PAL.gold, meadowLabel = 'HALAMAN DONGENG ILUSTRASI') {
  ctx.save();
  // Illustrated frame card
  ctx.fillStyle = '#fffdf6';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 26);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Warm sky gradient inside storybook frame
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 6, w - 12, h - 12, 20);
  ctx.clip();

  const skyG = ctx.createLinearGradient(x, y, x, y + h);
  skyG.addColorStop(0, '#fff4d6');
  skyG.addColorStop(0.7, '#fde4b4');
  skyG.addColorStop(1, '#e8cfa0');
  ctx.fillStyle = skyG;
  ctx.fillRect(x, y, w, h);

  // Hanging paper sun & clouds
  const sunX = x + w - 115;
  const sunY = y + 95 + Math.sin(t * 1.5) * 5;
  ctx.strokeStyle = '#b9935a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(sunX, y);
  ctx.lineTo(sunX, sunY);
  ctx.stroke();

  ctx.fillStyle = '#f6b93b';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Gentle rolling storybook hills at bottom
  const groundY = y + h - 88;
  ctx.fillStyle = '#d7e8ba';
  ctx.beginPath();
  ctx.moveTo(x, groundY + 18);
  ctx.quadraticCurveTo(x + w * 0.3, groundY - 26, x + w * 0.62, groundY + 10);
  ctx.quadraticCurveTo(x + w * 0.85, groundY + 30, x + w, groundY - 6);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Winding cobble path
  ctx.fillStyle = '#f2dcb3';
  ctx.beginPath();
  ctx.fillRect(x, groundY + 18, w, h - (groundY - y) - 18);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, groundY + 18);
  ctx.lineTo(x + w, groundY + 18);
  ctx.stroke();

  ctx.restore();

  // Top storybook caption plaque
  ctx.fillStyle = PAL.paperWarm;
  ctx.beginPath();
  ctx.roundRect(x + 24, y + 18, 390, 38, 12);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = PAL.ink;
  ctx.font = '800 15px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(meadowLabel, x + 40, y + 42, 360);

  ctx.restore();
  return groundY + 26;
}

/**
 * Unique Character #77: Si Pangeran Kecil Buku Cerita (Picturebook Stickman)
 * Features:
 * - Golden three-peak storybook paper crown perched on head
 * - Expressive round cream face with warm rosy cheeks and gentle eyes
 * - Fluttering crimson storybook cape + golden scarf around neck
 * - Storybook emerald tunic with a golden star button on chest
 * - Carries either a glowing feather quill, a lantern, or a watering can
 */
export function picturebookStickman(ctx, x, y, t = 0, opts = {}) {
  const {
    scale = 1,
    pose = 'idle', // 'idle' | 'walk' | 'write' | 'wonder' | 'celebrate'
    facing = 1,
    capeColor = PAL.crimson,
    tunicColor = PAL.emerald,
    prop = 'quill', // 'quill' | 'lantern' | 'watering' | 'none'
    speech = '',
  } = opts;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);

  const walkCycle = pose === 'walk' ? Math.sin(t * 6.5) : Math.sin(t * 2.2) * 0.18;
  const bob = Math.abs(Math.sin(t * (pose === 'walk' ? 6.5 : 2.2))) * (pose === 'walk' ? 7 : 3);
  ctx.translate(0, -bob);

  // Soft storybook shadow on ground
  ctx.fillStyle = 'rgba(45, 35, 24, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 2 + bob, 44, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  const hipY = -88;
  const shoulderY = -178;
  const headY = -226;

  // 1. FLUTTERING STORYBOOK CAPE (behind body)
  const capeWave = Math.sin(t * 4.2) * 12;
  ctx.fillStyle = capeColor;
  ctx.beginPath();
  ctx.moveTo(-10, shoulderY + 4);
  ctx.quadraticCurveTo(-62, shoulderY + 38 + capeWave * 0.4, -76, hipY + 22 + capeWave);
  ctx.quadraticCurveTo(-42, hipY + 32, -8, hipY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // 2. LEGS & STORYBOOK BOOTS
  const lLegX = -16 + walkCycle * 20;
  const rLegX = 16 - walkCycle * 20;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 6.5;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-10, hipY);
  ctx.lineTo(lLegX, -14);
  ctx.moveTo(10, hipY);
  ctx.lineTo(rLegX, -14);
  ctx.stroke();

  // Warm brown storybook boots
  [lLegX, rLegX].forEach((lx) => {
    ctx.fillStyle = '#7a4928';
    ctx.beginPath();
    ctx.roundRect(lx - 11, -18, 28, 18, 8);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.stroke();
  });

  // 3. STORYBOOK TUNIC & STAR BUTTON
  ctx.fillStyle = tunicColor;
  ctx.beginPath();
  ctx.moveTo(-22, shoulderY + 6);
  ctx.lineTo(22, shoulderY + 6);
  ctx.lineTo(28, hipY + 6);
  ctx.lineTo(-28, hipY + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Brown belt with gold buckle
  ctx.fillStyle = '#5c381e';
  ctx.fillRect(-25, hipY - 18, 50, 11);
  ctx.strokeRect(-25, hipY - 18, 50, 11);
  ctx.fillStyle = PAL.gold;
  ctx.fillRect(-7, hipY - 19, 14, 13);
  ctx.strokeRect(-7, hipY - 19, 14, 13);

  // Golden circle badge on chest
  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.arc(0, shoulderY + 34, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Golden scarf collar around neck
  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.roundRect(-24, shoulderY - 4, 48, 16, 8);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // 4. ARMS & PROPS
  let rHandX = 48;
  let rHandY = shoulderY + 24;
  let lHandX = -42;
  let lHandY = shoulderY + 36;

  if (pose === 'celebrate') {
    rHandX = 48;
    rHandY = shoulderY - 42 + Math.sin(t * 6) * 8;
    lHandX = -48;
    lHandY = shoulderY - 42 - Math.sin(t * 6) * 8;
  } else if (pose === 'write') {
    rHandX = 54 + Math.sin(t * 8) * 6;
    rHandY = shoulderY + 8 + Math.cos(t * 8) * 5;
  } else if (pose === 'wonder') {
    rHandX = 28;
    rHandY = headY + 12;
  }

  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-20, shoulderY + 10);
  ctx.lineTo(lHandX, lHandY);
  ctx.moveTo(20, shoulderY + 10);
  ctx.lineTo(rHandX, rHandY);
  ctx.stroke();

  // Prop in right hand
  if (prop === 'quill') {
    ctx.save();
    ctx.translate(rHandX, rHandY);
    ctx.rotate(-0.45 + Math.sin(t * 4) * 0.08);
    // Feather plume
    ctx.fillStyle = PAL.gold;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(18, -28, 42, -38);
    ctx.quadraticCurveTo(28, -8, 0, 0);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  } else if (prop === 'lantern') {
    ctx.save();
    ctx.translate(rHandX, rHandY);
    // Glowing storybook lantern
    const glow = ctx.createRadialGradient(0, 22, 4, 0, 22, 48);
    glow.addColorStop(0, 'rgba(246, 185, 59, 0.75)');
    glow.addColorStop(1, 'rgba(246, 185, 59, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 22, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PAL.gold;
    ctx.beginPath();
    ctx.roundRect(-12, 8, 24, 28, 6);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  } else if (prop === 'watering') {
    ctx.save();
    ctx.translate(rHandX, rHandY);
    ctx.fillStyle = PAL.sky;
    ctx.beginPath();
    ctx.roundRect(-8, -6, 28, 22, 6);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // 5. HEAD & GOLDEN STORYBOOK CROWN
  ctx.fillStyle = '#fff6df';
  ctx.beginPath();
  ctx.arc(0, headY, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Rosy storybook cheeks
  ctx.fillStyle = 'rgba(217, 72, 59, 0.35)';
  ctx.beginPath();
  ctx.arc(-14, headY + 6, 7, 0, Math.PI * 2);
  ctx.arc(16, headY + 6, 7, 0, Math.PI * 2);
  ctx.fill();

  // Friendly eyes & warm smile
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(-9, headY - 4, 3.8, 0, Math.PI * 2);
  ctx.arc(12, headY - 4, 3.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(2, headY + 6, 9, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Golden 3-peak storybook paper crown
  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.moveTo(-24, headY - 26);
  ctx.lineTo(-28, headY - 56);
  ctx.lineTo(-10, headY - 40);
  ctx.lineTo(0, headY - 62);
  ctx.lineTo(10, headY - 40);
  ctx.lineTo(28, headY - 56);
  ctx.lineTo(24, headY - 26);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Red gem in middle of crown
  ctx.fillStyle = PAL.crimson;
  ctx.beginPath();
  ctx.arc(0, headY - 38, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Speech scroll bubble if provided
  if (speech) {
    ctx.save();
    const bx = clamp(x - 190, 56, 620);
    const by = y - 340 * scale;
    ctx.fillStyle = '#fffdf7';
    ctx.beginPath();
    ctx.roundRect(bx, by, 380, 52, 16);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = PAL.ink;
    ctx.font = '700 17px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(speech, bx + 190, by + 32, 355);
    ctx.restore();
  }
}

export function drawStoryCard(ctx, x, y, w, h, opts = {}) {
  const {
    badge = 'BAB I',
    title = '',
    desc = '',
    stat = '',
    accent = PAL.crimson,
    progress = 1,
    active = false,
  } = opts;

  const p = clamp(progress, 0, 1);
  if (p <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = p;
  const slideY = (1 - p) * 24;
  ctx.translate(0, slideY);

  ctx.fillStyle = active ? '#fffdf5' : PAL.paper;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fill();
  ctx.strokeStyle = active ? accent : '#c8a972';
  ctx.lineWidth = active ? 4 : 2.5;
  ctx.stroke();

  // Left accent bookmark strip
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.roundRect(x + 14, y + 14, 10, h - 28, 5);
  ctx.fill();

  // Badge pill
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.roundRect(x + 38, y + 16, 128, 28, 8);
  ctx.fill();
  ctx.fillStyle = '#fffdf5';
  ctx.font = '800 13px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(badge, x + 102, y + 35, 116);

  if (stat) {
    ctx.fillStyle = PAL.paperWarm;
    ctx.beginPath();
    ctx.roundRect(x + w - 168, y + 14, 150, 32, 10);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = '800 15px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stat, x + w - 93, y + 35, 136);
  }

  ctx.fillStyle = PAL.ink;
  ctx.font = '800 22px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, x + 38, y + 72, w - 65);

  ctx.fillStyle = PAL.inkMuted;
  ctx.font = '600 17px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.fillText(desc, x + 38, y + 102, w - 65);

  ctx.restore();
}

export function drawPicturebookFooter(ctx, W, H, moralText, accent = PAL.crimson) {
  ctx.save();
  const y = H - 118;
  ctx.fillStyle = PAL.paperWarm;
  ctx.beginPath();
  ctx.roundRect(56, y, W - 112, 66, 18);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(92, y + 33, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '900 16px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', 92, y + 39);

  ctx.fillStyle = PAL.ink;
  ctx.font = '800 19px "Plus Jakarta Sans", "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(moralText, 122, y + 40, W - 196);
  ctx.restore();
}
