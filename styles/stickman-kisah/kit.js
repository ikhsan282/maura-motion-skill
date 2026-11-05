// 68 · STICKMAN KISAH — Theatrical Social Moral Story Kit (Garis Hidup Edition)
// Unique Characters (Capsule-Torso & Conscience Attire):
// - "Si Suara Hati" (role: 'hero'): Tapered capsule torso with glowing heart emblem on chest,
//   flowing golden-emerald conscience scarf, and warm radial-gradient head glow.
// - "Si Pelanggar Etika" (role: 'rival'): Tapered capsule torso with popped-collar crimson vest,
//   angled dark sunglasses, and expressive postures ('beg', 'evade', 'cut-line', 'run-away', 'ashamed').
// - "Warga / Saksi" (role: 'citizen'): Neat slate capsule vest with ID lanyard.

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export const PAL = {
  bg0: '#0a0e14',
  bg1: '#121924',
  floor: '#1a2332',
  gold: '#f6c453',
  emerald: '#4ce0b3',
  coral: '#ff6b6b',
  cyan: '#58a6ff',
  amber: '#ffa657',
  text: '#f0f6fc',
  muted: '#8b949e',
};

export function rgba(hex, a = 1) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function roundRect(ctx, x, y, w, h, r = 14) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * Draw dark theatrical stage background with hanging chain sign, spotlight cones, and floor line.
 */
export function kisahBg(ctx, t = 0, {
  floorY = 760, signText = 'KISAH UTANG & JANJI', signCol = PAL.gold,
} = {}) {
  const W = 1080, H = 1920;
  ctx.save();
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, PAL.bg0);
  bg.addColorStop(0.5, PAL.bg1);
  bg.addColorStop(1, '#070a0f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Soft dramatic stage spotlight cone in center
  const spot = ctx.createLinearGradient(540, 210, 540, floorY);
  spot.addColorStop(0, rgba(signCol, 0.16));
  spot.addColorStop(0.7, rgba(signCol, 0.05));
  spot.addColorStop(1, rgba(signCol, 0));
  ctx.fillStyle = spot;
  ctx.beginPath();
  ctx.moveTo(360, 210);
  ctx.lineTo(720, 210);
  ctx.lineTo(960, floorY);
  ctx.lineTo(120, floorY);
  ctx.closePath();
  ctx.fill();

  // Hanging stage sign with twin chains
  const sx = 540, sy = 258, sw = 390, sh = 56;
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sx - 130, 194); ctx.lineTo(sx - 130, sy - sh / 2);
  ctx.moveTo(sx + 130, 194); ctx.lineTo(sx + 130, sy - sh / 2);
  ctx.stroke();

  ctx.fillStyle = '#151d2a';
  roundRect(ctx, sx - sw / 2, sy - sh / 2, sw, sh, 12);
  ctx.fill();
  ctx.strokeStyle = signCol;
  ctx.lineWidth = 2.5;
  roundRect(ctx, sx - sw / 2, sy - sh / 2, sw, sh, 12);
  ctx.stroke();

  ctx.fillStyle = signCol;
  ctx.font = '800 20px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(signText, sx, sy, sw - 28);

  // Stage floor line
  ctx.strokeStyle = 'rgba(255,255,255,0.32)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(35, floorY);
  ctx.lineTo(1045, floorY);
  ctx.stroke();

  ctx.restore();
}

/**
 * Top Episode Header Banner for Stickman Kisah.
 */
export function kisahHeader(ctx, epTag, mainTitle, subTitle, {
  badge = 'CERITA 1 MENIT', col = PAL.gold, a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  ctx.fillStyle = 'rgba(18, 25, 36, 0.94)';
  roundRect(ctx, 42, 46, 996, 146, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2.5;
  roundRect(ctx, 42, 46, 996, 146, 20);
  ctx.stroke();

  // Left episode badge
  ctx.fillStyle = rgba(col, 0.14);
  roundRect(ctx, 64, 68, 165, 102, 14);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  roundRect(ctx, 64, 68, 165, 102, 14);
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.font = '800 15px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GARIS HIDUP', 146, 94, 145);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px ui-monospace, monospace';
  ctx.fillText(badge, 146, 134, 145);

  // Titles
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 18px ui-monospace, monospace';
  ctx.fillText(epTag, 258, 82, 750);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 33px system-ui, sans-serif';
  ctx.fillText(mainTitle, 258, 122, 750);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText(subTitle, 258, 160, 750);

  ctx.restore();
}

/**
 * Draw episode-specific props on the stage floor:
 * - theme: 'utang' (table + brown envelope + calendar)
 * - theme: 'antrean' (service counter + queue floor strip + ticket number)
 * - theme: 'parkir' (parked sedan + parking lines + apology note / scratch star)
 */
export function kisahStageProps(ctx, floorY = 760, theme = 'utang', {
  phase = 0, t = 0,
} = {}) {
  ctx.save();
  if (theme === 'utang') {
    // Center table (x = 540)
    const tx = 540, tw = 190, th = 92;
    ctx.strokeStyle = '#c89b6e';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx - tw / 2, floorY - th); ctx.lineTo(tx + tw / 2, floorY - th);
    ctx.moveTo(tx - tw / 2 + 18, floorY - th); ctx.lineTo(tx - tw / 2 + 18, floorY);
    ctx.moveTo(tx + tw / 2 - 18, floorY - th); ctx.lineTo(tx + tw / 2 - 18, floorY);
    ctx.stroke();

    // Brown Money Envelope on the table
    const envX = phase === 1 ? tx + 24 : tx - 10;
    const envY = floorY - th - 28;
    ctx.fillStyle = '#d4a359';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    roundRect(ctx, envX - 38, envY, 76, 26, 4);
    ctx.fill();
    ctx.stroke();
    // Envelope flap
    ctx.beginPath();
    ctx.moveTo(envX - 36, envY + 2);
    ctx.lineTo(envX, envY + 15);
    ctx.lineTo(envX + 36, envY + 2);
    ctx.stroke();
  } else if (theme === 'antrean') {
    // Service Counter (Loket) on Left (x = 185)
    const lx = 185, lw = 155, lh = 165;
    ctx.fillStyle = '#1b2638';
    roundRect(ctx, lx - lw / 2, floorY - lh, lw, lh, 10);
    ctx.fill();
    ctx.strokeStyle = PAL.cyan;
    ctx.lineWidth = 3.5;
    roundRect(ctx, lx - lw / 2, floorY - lh, lw, lh, 10);
    ctx.stroke();
    // Counter window glass
    ctx.fillStyle = 'rgba(88, 166, 255, 0.15)';
    ctx.fillRect(lx - lw / 2 + 16, floorY - lh + 22, lw - 32, 58);
    ctx.fillStyle = PAL.gold;
    ctx.font = '800 18px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LOKET 01', lx, floorY - lh - 16);

    // Yellow-black queue strip on floor
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 === 0 ? PAL.gold : '#222a38';
      ctx.fillRect(285 + i * 54, floorY - 8, 54, 8);
    }
  } else if (theme === 'parkir') {
    // Parking bay lines on floor
    ctx.strokeStyle = 'rgba(246, 196, 83, 0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(120, floorY); ctx.lineTo(155, floorY - 45);
    ctx.moveTo(490, floorY); ctx.lineTo(525, floorY - 45);
    ctx.stroke();

    // Parked Sedan Car on Left (x = 305)
    const cx = 305, cy = floorY - 22;
    ctx.fillStyle = '#20304a';
    ctx.strokeStyle = PAL.cyan;
    ctx.lineWidth = 4;
    // Car body
    ctx.beginPath();
    ctx.moveTo(cx - 145, cy);
    ctx.lineTo(cx - 145, cy - 48);
    ctx.lineTo(cx - 95, cy - 56);
    ctx.lineTo(cx - 55, cy - 102);
    ctx.lineTo(cx + 55, cy - 102);
    ctx.lineTo(cx + 98, cy - 56);
    ctx.lineTo(cx + 145, cy - 48);
    ctx.lineTo(cx + 145, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wheels
    for (const wx of [cx - 88, cx + 88]) {
      ctx.fillStyle = '#0f141d';
      ctx.beginPath(); ctx.arc(wx, cy, 24, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    // Scratch mark on right bumper + Apology Note in phases 2-3
    if (phase >= 1) {
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 115, cy - 36); ctx.lineTo(cx + 138, cy - 22);
      ctx.moveTo(cx + 118, cy - 22); ctx.lineTo(cx + 136, cy - 36);
      ctx.stroke();
    }
    if (phase >= 2) {
      // Glowing golden apology note tucked on windshield
      ctx.fillStyle = PAL.gold;
      roundRect(ctx, cx + 62, cy - 82, 28, 34, 4);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Dialogue Speech Bubble above characters.
 */
export function kisahBubble(ctx, x, y, text, {
  col = PAL.gold, tailX = x, a = 1,
} = {}) {
  if (a <= 0.01 || !text) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = '700 20px system-ui, sans-serif';
  const tw = Math.min(380, Math.max(170, ctx.measureText(text).width + 44));
  const th = 54;
  const left = x - tw / 2, top = y - th / 2;

  ctx.fillStyle = '#172030';
  roundRect(ctx, left, top, tw, th, 14);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  roundRect(ctx, left, top, tw, th, 14);
  ctx.stroke();

  // Tail triangle
  const tx = clamp(tailX, left + 24, left + tw - 24);
  ctx.fillStyle = '#172030';
  ctx.beginPath();
  ctx.moveTo(tx - 10, top + th - 1);
  ctx.lineTo(tx, top + th + 14);
  ctx.lineTo(tx + 10, top + th - 1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.beginPath();
  ctx.moveTo(tx - 10, top + th);
  ctx.lineTo(tx, top + th + 14);
  ctx.lineTo(tx + 10, top + th);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y, tw - 28);
  ctx.restore();
}

/**
 * Unique Kisah Stickman Character (Garis Hidup Capsule-Torso Edition)!
 * - role: 'hero' (Protagonist / Suara Hati: Glowing capsule torso with golden heart emblem,
 *   flowing emerald-gold conscience scarf, warm halo around head)
 * - role: 'rival' (Antagonist / Pelanggar: Popped-collar crimson vest, dark angled sunglasses,
 *   expressive gestures)
 * - role: 'citizen' (Bystander / Queue member: Slate vest & lanyard badge)
 */
export function kisahStickman(ctx, x, floorY, pose = 'talk', {
  role = 'hero', facing = 1, t = 0, a = 1, label = '',
} = {}) {
  if (a <= 0.01) return;

  const drawChar = (ox, oy, alpha, isReflect = false) => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(ox, oy);
    ctx.scale(facing, 1);

    const isHero = role === 'hero';
    const isRival = role === 'rival';
    const accent = isHero ? PAL.emerald : isRival ? PAL.coral : PAL.cyan;
    const strokeCol = isReflect ? 'rgba(160, 180, 215, 0.3)' : '#ffffff';

    const bob = (pose === 'walk' || pose === 'run') ? Math.abs(Math.sin(t * 8)) * 8 : Math.sin(t * 2.5) * 2;
    const lean = pose === 'beg' ? 0.18 : pose === 'evade' ? -0.15 : pose === 'run' ? 0.24 : 0;

    ctx.rotate(lean);

    const hipX = 0, hipY = -104 + bob;
    const neckX = 0, neckY = -192 + bob;
    const headX = 2, headY = neckY - 32;

    // Conscience Halo Glow behind Hero
    if (isHero && !isReflect) {
      const hg = ctx.createRadialGradient(0, -145, 10, 0, -145, 115);
      hg.addColorStop(0, 'rgba(76, 224, 179, 0.24)');
      hg.addColorStop(0.6, 'rgba(246, 196, 83, 0.08)');
      hg.addColorStop(1, 'rgba(76, 224, 179, 0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(0, -145, 115, 0, TAU);
      ctx.fill();
    }

    // Legs
    const sw = (pose === 'walk' || pose === 'run') ? Math.sin(t * (pose === 'run' ? 12 : 6)) * 26 : 0;
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(hipX - 8, hipY); ctx.lineTo(-14 - sw, -50); ctx.lineTo(-16 - sw * 1.2, 0);
    ctx.moveTo(hipX + 8, hipY); ctx.lineTo(14 + sw, -50); ctx.lineTo(16 + sw * 1.2, 0);
    ctx.stroke();

    // Unique Capsule / Tunika Torso (Garis Hidup Signature!)
    ctx.fillStyle = isReflect ? 'rgba(160,180,215,0.2)' : isHero ? '#173330' : isRival ? '#381920' : '#1b2838';
    ctx.strokeStyle = isReflect ? strokeCol : accent;
    ctx.lineWidth = 4.5;
    roundRect(ctx, -18, neckY + 6, 36, hipY - neckY - 4, 16);
    ctx.fill();
    ctx.stroke();

    if (!isReflect) {
      if (isHero) {
        // Golden Heart / Conscience Emblem on Chest + Flowing Scarf
        ctx.fillStyle = PAL.gold;
        ctx.beginPath();
        ctx.arc(0, neckY + 38, 6.5, 0, TAU);
        ctx.fill();
        // Flowing Scarf trailing behind neck
        ctx.strokeStyle = PAL.gold;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-14, neckY + 8);
        ctx.lineTo(16, neckY + 8);
        ctx.moveTo(-10, neckY + 8);
        ctx.quadraticCurveTo(-34, neckY + 18, -42, neckY + 36 + Math.sin(t * 5) * 5);
        ctx.stroke();
      } else if (isRival) {
        // Popped collar V-neck vest for Rival
        ctx.strokeStyle = PAL.coral;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-16, neckY + 8); ctx.lineTo(-22, neckY - 6);
        ctx.moveTo(16, neckY + 8); ctx.lineTo(20, neckY - 6);
        ctx.moveTo(-10, neckY + 8); ctx.lineTo(0, neckY + 36); ctx.lineTo(10, neckY + 8);
        ctx.stroke();
      } else {
        // Lanyard ID card for Citizen
        ctx.strokeStyle = PAL.cyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, neckY + 8); ctx.lineTo(0, neckY + 34); ctx.lineTo(8, neckY + 8);
        ctx.stroke();
        ctx.fillStyle = PAL.cyan;
        ctx.fillRect(-6, neckY + 34, 12, 14);
      }
    }

    // Arms based on pose
    let lHand = [-28, neckY + 48];
    let rHand = [34, neckY + 32];
    if (pose === 'beg') {
      // Clasped hands pleading in front of chest
      lHand = [26, neckY + 18];
      rHand = [30, neckY + 14];
    } else if (pose === 'give' || pose === 'point') {
      lHand = [-22, neckY + 46];
      rHand = [54, neckY + 12];
    } else if (pose === 'evade') {
      // Shrugging / looking away
      lHand = [-34, neckY + 14];
      rHand = [36, neckY + 14];
    } else if (pose === 'talk') {
      lHand = [-24, neckY + 42];
      rHand = [38, neckY + 18 + Math.sin(t * 6) * 8];
    } else if (pose === 'happy') {
      lHand = [-34, neckY - 24];
      rHand = [38, neckY - 24];
    }

    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 7.5;
    ctx.beginPath();
    ctx.moveTo(-16, neckY + 14);
    ctx.lineTo(lHand[0], lHand[1]);
    ctx.moveTo(16, neckY + 14);
    ctx.lineTo(rHand[0], rHand[1]);
    ctx.stroke();

    // Head with Radial Gradient
    ctx.fillStyle = PAL.bg0;
    ctx.beginPath(); ctx.arc(headX, headY, 24, 0, TAU); ctx.fill();
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 6.5;
    ctx.beginPath(); ctx.arc(headX, headY, 24, 0, TAU); ctx.stroke();

    if (!isReflect) {
      if (isRival) {
        // Cool / Shifty Dark Angled Sunglasses on Rival
        ctx.fillStyle = PAL.coral;
        ctx.beginPath();
        ctx.moveTo(headX - 4, headY - 8);
        ctx.lineTo(headX + 20, headY - 10);
        ctx.lineTo(headX + 17, headY + 1);
        ctx.lineTo(headX - 1, headY + 1);
        ctx.closePath();
        ctx.fill();
        // Spiky slick hair
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(headX - 12, headY - 21); ctx.lineTo(headX - 22, headY - 32);
        ctx.moveTo(headX, headY - 24); ctx.lineTo(headX - 8, headY - 36);
        ctx.stroke();
      } else {
        // Warm expressive eyes & gentle hair wave for Hero / Citizen
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(headX + 8, headY - 3, 3.2, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = isHero ? PAL.gold : PAL.cyan;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(headX, headY - 22, 12, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }

      // Mouth
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (pose === 'beg' || pose === 'evade') {
        ctx.moveTo(headX + 3, headY + 11); ctx.lineTo(headX + 13, headY + 9);
      } else {
        ctx.arc(headX + 7, headY + 6, 6, 0.15, Math.PI - 0.15);
      }
      ctx.stroke();
    }

    ctx.restore();

    // Character Name Tag below feet
    if (!isReflect && label) {
      ctx.save();
      ctx.fillStyle = 'rgba(15, 22, 34, 0.9)';
      roundRect(ctx, ox - 68, oy + 12, 136, 30, 8);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      roundRect(ctx, ox - 68, oy + 12, 136, 30, 8);
      ctx.stroke();
      ctx.fillStyle = accent;
      ctx.font = '800 14px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, ox, oy + 27, 124);
      ctx.restore();
    }
  };

  // Floor reflection right below floorY
  ctx.save();
  ctx.translate(x, floorY);
  ctx.scale(1, -0.48);
  drawChar(0, 0, a * 0.15, true);
  ctx.restore();

  // Main character
  drawChar(x, floorY, a, false);
}

/**
 * Moral & Social Reflection Card in the lower half of the 1080x1920 frame.
 */
export function kisahCard(ctx, x, y, w, h, {
  tag = '', titleStr = '', subStr = '', stat = '', statSub = '', col = PAL.gold, a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const left = x - w / 2, top = y - h / 2;

  ctx.fillStyle = 'rgba(16, 22, 33, 0.95)';
  roundRect(ctx, left, top, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  roundRect(ctx, left, top, w, h, 16);
  ctx.stroke();

  ctx.fillStyle = col;
  roundRect(ctx, left + 14, top + 18, 8, h - 36, 4);
  ctx.fill();

  const textW = stat ? w - 255 : w - 60;
  const tx = left + 38;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  if (tag) {
    ctx.fillStyle = col;
    ctx.font = '800 18px ui-monospace, monospace';
    ctx.fillText(tag, tx, top + 34, textW);
  }
  if (titleStr) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 27px system-ui, sans-serif';
    ctx.fillText(titleStr, tx, top + 76, textW);
  }
  if (subStr) {
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.font = '500 21px system-ui, sans-serif';
    ctx.fillText(subStr, tx, top + h - 32, textW);
  }

  if (stat) {
    const bx = left + w - 200, by = top + 18, bw = 180, bh = h - 36;
    ctx.fillStyle = rgba(col, 0.14);
    roundRect(ctx, bx, by, bw, bh, 12);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    roundRect(ctx, bx, by, bw, bh, 12);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = col;
    ctx.font = '900 30px ui-monospace, monospace';
    ctx.fillText(stat, bx + bw / 2, by + bh * 0.43, bw - 16);
    if (statSub) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 15px ui-monospace, monospace';
      ctx.fillText(statSub, bx + bw / 2, by + bh * 0.77, bw - 16);
    }
  }

  ctx.restore();
}
