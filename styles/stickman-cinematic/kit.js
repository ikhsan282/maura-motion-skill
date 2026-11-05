// 72 · STICKMAN CINEMATIC — Kit: "Si Pengelana Jas Panjang (Trenchcoat Rim-Light)" di Atap Kota Senja
import { clamp } from '/engine/lib/core.js';

export const PAL = {
  night0: '#0a0714',
  night1: '#18102b',
  duskPurple: '#431c53',
  duskMagenta: '#9e2a5b',
  sunsetOrange: '#ff8a3d',
  sunsetGold: '#ffd166',
  rimCyan: '#4deeea',
  silhouette: '#0f0a1c',
  cardBg: '#140e24',
  ink: '#f8f3ec',
  muted: '#b2a6c9',
};

export function cinematicBg(ctx, t, {
  floorY = 1230,
  sceneCode = 'SCENE 01 • TAKE 04 • ANAMORPHIC 2.39:1',
  col = PAL.sunsetOrange,
} = {}) {
  ctx.save();
  // Deep cinema dark background
  const bg = ctx.createLinearGradient(0, 0, 0, 1920);
  bg.addColorStop(0, PAL.night0);
  bg.addColorStop(0.5, PAL.night1);
  bg.addColorStop(1, '#07050f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1920);

  // Main Widescreen Cinema Viewport (Full-Screen height y: 225..1390)
  const sx = 46, sy = 225, sw = 988, sh = floorY - sy + 155;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(sx + 8, sy + 12, sw, sh, 26);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(sx, sy, sw, sh, 26);
  ctx.clip();

  // Sunset / Twilight gradient inside cinema frame
  const sg = ctx.createLinearGradient(0, sy, 0, floorY);
  sg.addColorStop(0, '#160d2e');
  sg.addColorStop(0.38, PAL.duskPurple);
  sg.addColorStop(0.72, PAL.duskMagenta);
  sg.addColorStop(1, PAL.sunsetOrange);
  ctx.fillStyle = sg;
  ctx.fillRect(sx, sy, sw, sh);

  // Giant glowing setting sun / golden orb near horizon
  const sunX = 680, sunY = floorY - 145;
  const rg = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 320);
  rg.addColorStop(0, 'rgba(255, 235, 165, 0.95)');
  rg.addColorStop(0.28, 'rgba(255, 154, 60, 0.65)');
  rg.addColorStop(0.65, 'rgba(158, 42, 91, 0.18)');
  rg.addColorStop(1, 'rgba(22, 13, 46, 0)');
  ctx.fillStyle = rg;
  ctx.fillRect(sx, sy, sw, sh);

  // Sun disc
  ctx.fillStyle = 'rgba(255, 236, 179, 0.88)';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 78, 0, Math.PI * 2);
  ctx.fill();

  // Anamorphic horizontal lens flare
  const fg = ctx.createLinearGradient(sunX - 420, 0, sunX + 380, 0);
  fg.addColorStop(0, 'rgba(77, 238, 234, 0)');
  fg.addColorStop(0.35, 'rgba(77, 238, 234, 0.38)');
  fg.addColorStop(0.5, 'rgba(255, 255, 255, 0.75)');
  fg.addColorStop(0.65, 'rgba(255, 138, 61, 0.38)');
  fg.addColorStop(1, 'rgba(255, 138, 61, 0)');
  ctx.fillStyle = fg;
  ctx.fillRect(sunX - 420, sunY - 4, 800, 8);

  // Distant sleeping city skyline silhouettes
  const buildings = [
    [50, 165, 75], [125, 230, 85], [210, 180, 70], [280, 270, 95],
    [375, 150, 80], [455, 210, 85], [540, 145, 75], [615, 195, 90],
    [705, 135, 80], [785, 225, 95], [880, 175, 80], [960, 260, 90],
  ];
  ctx.fillStyle = '#120a21';
  for (const [bx, bh, bw] of buildings) {
    ctx.fillRect(bx, floorY - bh, bw, bh);
    ctx.fillStyle = 'rgba(255, 209, 102, 0.42)';
    for (let wy = floorY - bh + 18; wy < floorY - 24; wy += 26) {
      for (let wx = bx + 12; wx < bx + bw - 16; wx += 20) {
        if ((wx * 7 + wy * 3) % 5 === 0) {
          ctx.fillRect(wx, wy, 8, 12);
        }
      }
    }
    ctx.fillStyle = '#120a21';
  }

  // Wet rooftop floor below floorY
  const flg = ctx.createLinearGradient(0, floorY, 0, sy + sh);
  flg.addColorStop(0, '#190f2e');
  flg.addColorStop(1, '#090612');
  ctx.fillStyle = flg;
  ctx.fillRect(sx, floorY, sw, sy + sh - floorY);

  // Glowing horizon rim line on the rooftop
  ctx.strokeStyle = col;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(sx, floorY);
  ctx.lineTo(sx + sw, floorY);
  ctx.stroke();

  // Top Cinema Viewfinder bar
  ctx.fillStyle = '#080510';
  ctx.fillRect(sx, sy, sw, 52);
  ctx.fillStyle = PAL.rimCyan;
  ctx.font = '800 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(sceneCode, sx + 24, sy + 26);

  ctx.restore();
}

/**
 * Camera zoom & pan helper for stickman-cinematic
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
 * Cinematic Floating Callout Card on the lower area (y: 1485, h: 165)
 */
export function cinematicCallout(ctx, x, y, w, h, {
  tag = 'KOTA TIDUR',
  title = '',
  desc = '',
  stat = '',
  statSub = '',
  col = PAL.sunsetOrange,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.92 + 0.08 * a, 0.92 + 0.08 * a);
  ctx.globalAlpha = clamp(a, 0, 1);

  ctx.fillStyle = PAL.cardBg;
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
  ctx.fillStyle = '#0f0a1c';
  ctx.font = '900 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, -w / 2 + 34, -h / 2 + 33, 266);

  const textW = stat ? w - 240 : w - 56;
  ctx.fillStyle = PAL.ink;
  ctx.font = '900 25px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, -w / 2 + 22, -h / 2 + 76, textW);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(desc, -w / 2 + 22, -h / 2 + 116, textW);

  if (stat) {
    ctx.fillStyle = 'rgba(255, 138, 61, 0.16)';
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
      ctx.fillStyle = PAL.sunsetGold;
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillText(statSub, w / 2 - 107, 26, 150);
    }
  }

  ctx.restore();
}

export function cinematicHeader(ctx, badgeText, title, subtitle, {
  col = PAL.sunsetOrange,
} = {}) {
  ctx.save();
  const x = 60, y = 45, w = 960, h = 152;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
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

  // Left Clapperboard / Cinema Badge
  const bx = x + 22, by = y + 20, bw = 175, bh = 112;
  ctx.fillStyle = '#1f1436';
  ctx.strokeStyle = PAL.rimCyan;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.rimCyan;
  ctx.font = '800 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CINEMA REEL', bx + bw / 2, by + 34);

  ctx.fillStyle = PAL.sunsetGold;
  ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(badgeText, bx + bw / 2, by + 82, bw - 16);

  // Title & Subtitle
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText('MONOLOG SINEMATIK • STICKMAN CINEMATIC', bx + bw + 26, y + 40);

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(title, bx + bw + 26, y + 84, w - bw - 65);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, bx + bw + 26, y + 120, w - bw - 65);
  ctx.restore();
}

// Unique Character: "Si Pengelana Jas Panjang (Trenchcoat Silhouette + Dual Rim Light + Flowing Scarf + Fedora)"
export function cinematicStickman(ctx, x, floorY, pose = 'stand', {
  facing = 1,
  t = 0,
  scale = 1,
  reflection = true,
} = {}) {
  const drawBody = (isReflection = false) => {
    const bob = Math.sin(t * 3.2) * 3;
    const wind = Math.sin(t * 4.5) * 10;
    const hipY = -115 + bob;
    const shoulderY = -232 + bob;
    const headY = -288 + bob;
    const headR = 34;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Legs in dark silhouette with cyan & orange rim lights
    const stride = pose === 'walk' ? Math.sin(t * 5) * 18 : 0;
    const drawRimSegment = (x1, y1, x2, y2, w = 10) => {
      // Cyan back rim
      ctx.strokeStyle = PAL.rimCyan;
      ctx.lineWidth = w + 3;
      ctx.beginPath();
      ctx.moveTo(x1 - 3, y1);
      ctx.lineTo(x2 - 3, y2);
      ctx.stroke();

      // Golden front rim
      ctx.strokeStyle = PAL.sunsetOrange;
      ctx.lineWidth = w + 3;
      ctx.beginPath();
      ctx.moveTo(x1 + 3, y1);
      ctx.lineTo(x2 + 3, y2);
      ctx.stroke();

      // Core dark silhouette
      ctx.strokeStyle = PAL.silhouette;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    // Left & Right Legs
    drawRimSegment(-14, hipY, -18 - stride, -6, 10);
    drawRimSegment(14, hipY, 18 + stride, -6, 10);

    // Long Billowing Trenchcoat (Jas Panjang Sinematik) with Dual Rim Light!
    const coatTailX = -46 - wind * 0.8;
    const coatBottomY = -36 + bob;

    const traceCoat = (offsetX = 0) => {
      ctx.beginPath();
      // High dramatic trenchcoat collar
      ctx.moveTo(-26 + offsetX, shoulderY - 12);
      ctx.lineTo(24 + offsetX, shoulderY - 10);
      // Front lapel down to hem
      ctx.lineTo(32 + offsetX, coatBottomY);
      // Billowing bottom hem of long coat
      ctx.quadraticCurveTo(-8 + offsetX, coatBottomY - 12, coatTailX + offsetX, coatBottomY + 6);
      // Back edge of billowing trenchcoat
      ctx.quadraticCurveTo(-36 + offsetX, hipY - 15, -26 + offsetX, shoulderY - 12);
      ctx.closePath();
    };

    // Cyan back rim light on trenchcoat
    ctx.fillStyle = PAL.rimCyan;
    traceCoat(-4.5);
    ctx.fill();

    // Sunset orange front rim light on trenchcoat
    ctx.fillStyle = PAL.sunsetOrange;
    traceCoat(4.5);
    ctx.fill();

    // Deep midnight silhouette trenchcoat fill
    ctx.fillStyle = PAL.silhouette;
    traceCoat(0);
    ctx.fill();

    // Trenchcoat belt & lapel highlight line
    ctx.strokeStyle = PAL.sunsetGold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-24, hipY - 14);
    ctx.lineTo(26, hipY - 14);
    ctx.stroke();

    // Arms according to pose
    let rElbow = [34, shoulderY + 34], rHand = [52, shoulderY + 12];
    if (pose === 'lookUp') {
      rElbow = [36, shoulderY + 14]; rHand = [58, shoulderY - 22];
    } else if (pose === 'triumph') {
      rElbow = [42, shoulderY - 22]; rHand = [62, headY - 32];
    } else if (pose === 'focus') {
      rElbow = [36, shoulderY + 22]; rHand = [22, headY + 20];
    }
    drawRimSegment(18, shoulderY + 8, rElbow[0], rElbow[1], 9);
    drawRimSegment(rElbow[0], rElbow[1], rHand[0], rHand[1], 9);

    // Flowing Sunset-Gold Scarf trailing in the night wind!
    ctx.fillStyle = PAL.sunsetOrange;
    ctx.strokeStyle = PAL.sunsetGold;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-18, shoulderY - 6);
    ctx.quadraticCurveTo(-68 - wind, shoulderY - 24, -118 - wind * 1.3, shoulderY + 4 + wind * 0.5);
    ctx.lineTo(-108 - wind * 1.2, shoulderY + 24 + wind * 0.5);
    ctx.quadraticCurveTo(-60 - wind, shoulderY + 2, -14, shoulderY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head Silhouette with Dual Rim Lights
    ctx.fillStyle = PAL.rimCyan;
    ctx.beginPath();
    ctx.arc(-4, headY, headR + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PAL.sunsetOrange;
    ctx.beginPath();
    ctx.arc(4, headY, headR + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PAL.silhouette;
    ctx.beginPath();
    ctx.arc(0, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Wide-Brimmed Cinema Fedora Hat on Head!
    ctx.fillStyle = PAL.silhouette;
    ctx.strokeStyle = PAL.sunsetGold;
    ctx.lineWidth = 3;
    // Fedora crown
    ctx.beginPath();
    ctx.moveTo(-26, headY - 18);
    ctx.lineTo(-18, headY - 48);
    ctx.lineTo(2, headY - 42);
    ctx.lineTo(18, headY - 46);
    ctx.lineTo(26, headY - 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Fedora wide brim with cyan/gold rim
    ctx.beginPath();
    ctx.ellipse(2, headY - 18, 48, 8, -0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing Cyan Anime/Cinema Eyes inside silhouette face
    if (!isReflection) {
      ctx.fillStyle = PAL.rimCyan;
      ctx.beginPath();
      ctx.ellipse(14, headY - 3, 6, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 1. Wet Rooftop Mirror Reflection (clipped inside the wet floor strip above bottom letterbox)
  if (reflection) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(60, floorY, 960, 32);
    ctx.clip();
    ctx.translate(x, floorY);
    ctx.scale(facing * scale, -scale * 0.25);
    ctx.globalAlpha = 0.25;
    drawBody(true);
    ctx.restore();
  }

  // 2. Main Stickman Character
  ctx.save();
  ctx.translate(x, floorY);
  ctx.scale(facing * scale, scale);
  drawBody(false);
  ctx.restore();
}

export function cinematicProps(ctx, floorY, type = 'rooftop', { phase = 0, t = 0 } = {}) {
  ctx.save();
  // Sleek rooftop safety railing along the stage
  ctx.strokeStyle = 'rgba(178, 166, 201, 0.28)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(90, floorY - 68);
  ctx.lineTo(990, floorY - 68);
  for (let rx = 130; rx <= 950; rx += 110) {
    ctx.moveTo(rx, floorY - 68);
    ctx.lineTo(rx, floorY);
  }
  ctx.stroke();

  if (type === 'rooftop') {
    // Glowing Neon Rooftop Billboard / Clock Panel on the right
    const bx = 755, by = floorY - 235;
    const col = phase >= 2 ? PAL.rimCyan : PAL.sunsetOrange;
    ctx.fillStyle = 'rgba(15, 10, 28, 0.88)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(bx - 150, by, 300, 155, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = col;
    ctx.font = '800 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(phase >= 2 ? 'JAM FOKUS MALAM' : 'SAAT KOTA TERTIDUR', bx, by + 38, 275);

    ctx.fillStyle = PAL.sunsetGold;
    ctx.font = '900 32px "JetBrains Mono", monospace';
    ctx.fillText(phase >= 2 ? '1 LANGKAH' : '23 : 45', bx, by + 88, 275);

    ctx.fillStyle = PAL.ink;
    ctx.font = '600 15.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(phase >= 2 ? 'Membangun masa depanmu' : 'Hening tanpa gangguan luar', bx, by + 126, 275);
  } else if (type === 'spotlight') {
    // Milestone Pillar on the right
    const bx = 755, by = floorY - 235;
    const col = phase >= 2 ? PAL.sunsetGold : PAL.rimCyan;
    ctx.fillStyle = 'rgba(15, 10, 28, 0.88)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(bx - 150, by, 300, 155, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = col;
    ctx.font = '800 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INTEGRITAS TANPA PENONTON', bx, by + 38, 275);

    ctx.fillStyle = PAL.ink;
    ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(phase >= 2 ? 'DISIPLIN > MOOD' : 'LATIHAN SEPI', bx, by + 86, 275);

    ctx.fillStyle = PAL.muted;
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Juara ditempa saat lampu panggung mati', bx, by + 124, 275);
  } else if (type === 'horizon') {
    // Future Self Time-Capsule Panel on the right
    const bx = 755, by = floorY - 235;
    const col = phase >= 2 ? PAL.sunsetGold : PAL.sunsetOrange;
    ctx.fillStyle = 'rgba(15, 10, 28, 0.88)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(bx - 150, by, 300, 155, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PAL.rimCyan;
    ctx.font = '800 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SURAT DARI MASA DEPAN', bx, by + 38, 275);

    ctx.fillStyle = PAL.sunsetGold;
    ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(phase >= 2 ? '"TERIMA KASIH!"' : 'INVESTASI DIRI', bx, by + 86, 275);

    ctx.fillStyle = PAL.ink;
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Dirimu 1 tahun lagi bangga padamu', bx, by + 124, 275);
  }
  ctx.restore();
}

export function cinematicBubble(ctx, x, y, text, {
  tailX = x,
  tailY = y + 72,
  col = PAL.sunsetOrange,
} = {}) {
  ctx.save();
  ctx.font = '800 21px "Plus Jakarta Sans", sans-serif';
  const tw = Math.max(320, ctx.measureText(text).width + 54);
  const th = 64;
  const bx = clamp(x - tw / 2, 85, 995 - tw);
  const by = y - th / 2;

  ctx.fillStyle = 'rgba(16, 11, 28, 0.92)';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, tw, th, 16);
  ctx.fill();
  ctx.stroke();

  // Pointer tail
  ctx.beginPath();
  ctx.moveTo(clamp(tailX - 10, bx + 22, bx + tw - 36), by + th - 2);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(clamp(tailX + 10, bx + 36, bx + tw - 22), by + th - 2);
  ctx.fillStyle = 'rgba(16, 11, 28, 0.92)';
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.sunsetGold;
  ctx.textAlign = 'center';
  ctx.fillText(text, bx + tw / 2, by + 40);
  ctx.restore();
}

export function cinematicCard(ctx, cx, cy, w, h, {
  tag = 'CATATAN SUTRADARA',
  titleStr = '',
  subStr = '',
  stat = '',
  statSub = '',
  col = PAL.sunsetOrange,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(a, 0, 1);
  const x = cx - w / 2, y = cy - h / 2;

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.roundRect(x + 8, y + 10, w, h, 22);
  ctx.fill();

  ctx.fillStyle = PAL.cardBg;
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 22);
  ctx.fill();
  ctx.stroke();

  // Left glowing rim bar
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
    ctx.fillStyle = 'rgba(255, 138, 61, 0.1)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(sx, sy, sw, sh, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.sunsetGold;
    ctx.font = '900 25px "JetBrains Mono", monospace';
    ctx.fillText(stat, sx + sw / 2, sy + 64, sw - 16);

    ctx.fillStyle = PAL.rimCyan;
    ctx.font = '800 13.5px "JetBrains Mono", monospace';
    ctx.fillText(statSub, sx + sw / 2, sy + 98, sw - 16);
  }
  ctx.restore();
}
