// 67 · STICKMAN PELUKIS — Atelier Studio Stickman Kit
// Unique Characters:
// - "Si Maestro Berbaret" (role: 'prolific'): Tilted artist beret with stem, flowing neck scarf,
//   paint-splattered apron, wooden kidney palette with 4 paint dabs in left hand, paintbrush in right hand.
// - "Si Perfeksionis Loupe" (role: 'perfectionist'): Monocle/loupe glasses, stiff bow-tie, neat beret,
//   tiny 1-hair detail brush, hesitant posture & sweat drops.

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

export const PAL = {
  bg0: '#100f14',
  bg1: '#181620',
  floor: '#1f1c28',
  wood: '#8c5832',
  woodLight: '#b87a4b',
  gold: '#f6c453',
  coral: '#ff6b6b',
  emerald: '#4ce0b3',
  cyan: '#58a6ff',
  purple: '#b388ff',
  cream: '#fdf8ee',
  ink: '#1a1822',
  muted: '#948fa6',
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
 * Draw dark atelier studio background with two overhead pendant lamps,
 * warm volumetric light cones, studio floor line, and floating dust motes.
 */
export function pelukisBg(ctx, t = 0, {
  floorY = 760, leftHighlight = 0.5, rightHighlight = 0.85,
} = {}) {
  const W = 1080, H = 1920;
  ctx.save();
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, PAL.bg0);
  bg.addColorStop(0.5, PAL.bg1);
  bg.addColorStop(1, '#0b0a0e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Two hanging studio lamps at x = 270 and x = 810
  const lamps = [
    { x: 270, col: PAL.cyan, intensity: leftHighlight },
    { x: 810, col: PAL.gold, intensity: rightHighlight },
  ];

  for (const L of lamps) {
    // Volumetric light cone
    const cone = ctx.createLinearGradient(L.x, 225, L.x, floorY);
    cone.addColorStop(0, rgba(L.col, 0.22 * L.intensity));
    cone.addColorStop(0.6, rgba(L.col, 0.08 * L.intensity));
    cone.addColorStop(1, rgba(L.col, 0));
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(L.x - 36, 232);
    ctx.lineTo(L.x + 36, 232);
    ctx.lineTo(L.x + 250, floorY);
    ctx.lineTo(L.x - 250, floorY);
    ctx.closePath();
    ctx.fill();

    // Cord & Shade
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(L.x, 175);
    ctx.lineTo(L.x, 215);
    ctx.stroke();

    ctx.fillStyle = '#252230';
    ctx.strokeStyle = L.col;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(L.x - 42, 234);
    ctx.lineTo(L.x - 18, 212);
    ctx.lineTo(L.x + 18, 212);
    ctx.lineTo(L.x + 42, 234);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing bulb
    ctx.fillStyle = L.col;
    ctx.beginPath();
    ctx.arc(L.x, 236, 8, 0, TAU);
    ctx.fill();
  }

  // Center studio divider dashed line
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(540, 240);
  ctx.lineTo(540, floorY + 80);
  ctx.stroke();
  ctx.setLineDash([]);

  // Wooden atelier floor line
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(35, floorY);
  ctx.lineTo(1045, floorY);
  ctx.stroke();

  ctx.restore();
}

/**
 * Top studio scoreboard header with Left & Right Canvas Counters.
 */
export function pelukisHeader(ctx, leftScore, rightScore, mainTitle, subTitle, {
  leftLabel = 'PERFEKSIONIS', rightLabel = 'GERAK CEPAT', a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  ctx.fillStyle = 'rgba(22, 20, 30, 0.94)';
  roundRect(ctx, 42, 48, 996, 146, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2.5;
  roundRect(ctx, 42, 48, 996, 146, 20);
  ctx.stroke();

  // Left counter box
  ctx.fillStyle = '#182235';
  roundRect(ctx, 64, 68, 156, 106, 14);
  ctx.fill();
  ctx.strokeStyle = PAL.cyan;
  ctx.lineWidth = 2.5;
  roundRect(ctx, 64, 68, 156, 106, 14);
  ctx.stroke();
  ctx.fillStyle = PAL.cyan;
  ctx.font = '800 15px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(leftLabel, 142, 88, 140);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px ui-monospace, monospace';
  ctx.fillText(leftScore, 142, 132, 140);

  // Center titles
  ctx.fillStyle = PAL.gold;
  ctx.font = '800 18px ui-monospace, monospace';
  ctx.fillText('STUDIO EKSPERIMEN KARYA • KUALITAS VS KUANTITAS', 540, 82, 580);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 34px system-ui, sans-serif';
  ctx.fillText(mainTitle, 540, 122, 590);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText(subTitle, 540, 160, 590);

  // Right counter box
  ctx.fillStyle = '#261d18';
  roundRect(ctx, 860, 68, 156, 106, 14);
  ctx.fill();
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 2.5;
  roundRect(ctx, 860, 68, 156, 106, 14);
  ctx.stroke();
  ctx.fillStyle = PAL.gold;
  ctx.font = '800 15px ui-monospace, monospace';
  ctx.fillText(rightLabel, 938, 88, 140);
  ctx.fillStyle = PAL.emerald;
  ctx.font = '900 36px ui-monospace, monospace';
  ctx.fillText(rightScore, 938, 132, 140);

  ctx.restore();
}

/**
 * Draw progressive artwork inside a canvas rectangle (cx, cy, cw, ch)
 * tier 0: faint grid & hesitant dot
 * tier 1: rough sketch lines
 * tier 2: mountain & lake landscape
 * tier 3: glowing sunset volcano masterpiece
 */
export function drawCanvasArt(ctx, cx, cy, cw, ch, { tier = 0, progress = 1 } = {}) {
  ctx.save();
  ctx.fillStyle = PAL.cream;
  roundRect(ctx, cx, cy, cw, ch, 6);
  ctx.fill();

  ctx.save();
  roundRect(ctx, cx, cy, cw, ch, 6);
  ctx.clip();

  const p = clamp(progress, 0, 1);
  if (tier === 0) {
    // Hesitant rule-of-thirds grid & tiny center mark
    ctx.strokeStyle = 'rgba(90, 110, 140, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + cw / 3, cy); ctx.lineTo(cx + cw / 3, cy + ch);
    ctx.moveTo(cx + (cw * 2) / 3, cy); ctx.lineTo(cx + (cw * 2) / 3, cy + ch);
    ctx.moveTo(cx, cy + ch / 2); ctx.lineTo(cx + cw, cy + ch / 2);
    ctx.stroke();
    if (p > 0.1) {
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx + cw * 0.5, cy + ch * 0.5, 12 * p, 0, TAU * p);
      ctx.stroke();
    }
  } else if (tier === 1) {
    // Simple sky & rough mountain outline
    ctx.fillStyle = `rgba(165, 210, 255, ${0.45 * p})`;
    ctx.fillRect(cx, cy, cw, ch * 0.65);
    ctx.strokeStyle = '#3a4a66';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy + ch * 0.72);
    ctx.lineTo(cx + cw * 0.42, cy + ch * 0.28);
    ctx.lineTo(cx + cw * 0.75, cy + ch * 0.62);
    ctx.lineTo(cx + cw - 8, cy + ch * 0.40);
    ctx.stroke();
  } else if (tier === 2) {
    // Vivid blue sky, snow-capped peak & emerald hills
    ctx.fillStyle = '#7ec8ff';
    ctx.fillRect(cx, cy, cw, ch);
    ctx.fillStyle = '#3b5998';
    ctx.beginPath();
    ctx.moveTo(cx, cy + ch * 0.75);
    ctx.lineTo(cx + cw * 0.45, cy + ch * 0.22);
    ctx.lineTo(cx + cw * 0.9, cy + ch * 0.75);
    ctx.closePath();
    ctx.fill();
    // Snow cap
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx + cw * 0.45, cy + ch * 0.22);
    ctx.lineTo(cx + cw * 0.33, cy + ch * 0.38);
    ctx.lineTo(cx + cw * 0.45, cy + ch * 0.34);
    ctx.lineTo(cx + cw * 0.57, cy + ch * 0.38);
    ctx.closePath();
    ctx.fill();
    // Foreground meadow
    ctx.fillStyle = PAL.emerald;
    ctx.fillRect(cx, cy + ch * 0.72, cw, ch * 0.28);
  } else {
    // Tier 3 Masterpiece: Golden-violet sunset, glowing sun, twin peaks & reflection
    const sky = ctx.createLinearGradient(cx, cy, cx, cy + ch);
    sky.addColorStop(0, '#4a1c6d');
    sky.addColorStop(0.5, '#d94e67');
    sky.addColorStop(0.8, '#f6c453');
    sky.addColorStop(1, '#261a38');
    ctx.fillStyle = sky;
    ctx.fillRect(cx, cy, cw, ch);

    // Golden Sun
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(cx + cw * 0.62, cy + ch * 0.38, 22 * p, 0, TAU);
    ctx.fill();

    // Majestic Mountain Silhouette
    ctx.fillStyle = '#231436';
    ctx.beginPath();
    ctx.moveTo(cx, cy + ch * 0.76);
    ctx.lineTo(cx + cw * 0.36, cy + ch * 0.24);
    ctx.lineTo(cx + cw * 0.65, cy + ch * 0.62);
    ctx.lineTo(cx + cw * 0.84, cy + ch * 0.36);
    ctx.lineTo(cx + cw, cy + ch * 0.76);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Canvas border
  ctx.strokeStyle = tier >= 3 ? PAL.gold : '#3d2b1f';
  ctx.lineWidth = tier >= 3 ? 4 : 3;
  roundRect(ctx, cx, cy, cw, ch, 6);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw Wooden Artist Easel + Canvas Pile + Center Paint Cabinet.
 */
export function studioStage(ctx, floorY = 760, {
  leftTier = 0, leftProg = 0.3, leftLabel = 'KANVAS #1 (2 MINGGU)',
  rightTier = 2, rightProg = 0.9, rightLabel = 'KANVAS #12 ( PROGRES )',
  pileCount = 8, splatter = 0.6, t = 0,
} = {}) {
  ctx.save();

  // Center supply cabinet (x = 540)
  const cabW = 126, cabH = 125, cabX = 540 - cabW / 2, cabY = floorY - cabH;
  ctx.fillStyle = '#241e29';
  roundRect(ctx, cabX, cabY, cabW, cabH, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  roundRect(ctx, cabX, cabY, cabW, cabH, 8);
  ctx.stroke();
  // Drawer line
  ctx.beginPath();
  ctx.moveTo(cabX + 10, cabY + 52); ctx.lineTo(cabX + cabW - 10, cabY + 52);
  ctx.stroke();
  // Brush cup on top of cabinet
  ctx.fillStyle = PAL.coral;
  ctx.fillRect(540 - 16, cabY - 26, 32, 26);
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(532, cabY - 26); ctx.lineTo(524, cabY - 46);
  ctx.moveTo(540, cabY - 26); ctx.lineTo(542, cabY - 50);
  ctx.moveTo(548, cabY - 26); ctx.lineTo(558, cabY - 44);
  ctx.stroke();

  // Paint splatters around right half of cabinet & floor
  if (splatter > 0) {
    const cols = [PAL.coral, PAL.gold, PAL.emerald, PAL.cyan, PAL.purple];
    const n = Math.floor(splatter * 14);
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = cols[i % cols.length];
      const sx = 560 + ((i * 53) % 390);
      const sy = floorY - 6 - ((i * 19) % 24);
      ctx.beginPath();
      ctx.arc(sx, sy, 4 + (i % 4) * 2, 0, TAU);
      ctx.fill();
    }
  }

  // Left & Right Easels
  const easels = [
    { x: 145, tier: leftTier, prog: leftProg, label: leftLabel, col: PAL.cyan },
    { x: 925, tier: rightTier, prog: rightProg, label: rightLabel, col: PAL.gold },
  ];

  for (const E of easels) {
    // Label pill above easel
    ctx.fillStyle = 'rgba(22, 20, 32, 0.92)';
    roundRect(ctx, E.x - 120, 262, 240, 44, 10);
    ctx.fill();
    ctx.strokeStyle = E.col;
    ctx.lineWidth = 2;
    roundRect(ctx, E.x - 120, 262, 240, 44, 10);
    ctx.stroke();
    ctx.fillStyle = E.col;
    ctx.font = '800 16px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(E.label, E.x, 284, 224);

    // Wooden tripod legs
    ctx.strokeStyle = PAL.woodLight;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(E.x, floorY - 260); ctx.lineTo(E.x - 54, floorY);
    ctx.moveTo(E.x, floorY - 260); ctx.lineTo(E.x + 54, floorY);
    ctx.moveTo(E.x, floorY - 260); ctx.lineTo(E.x, floorY);
    ctx.stroke();

    // Canvas on easel
    const cw = 148, ch = 112;
    drawCanvasArt(ctx, E.x - cw / 2, floorY - 238, cw, ch, { tier: E.tier, progress: E.prog });

    // Wooden shelf bar under canvas
    ctx.strokeStyle = PAL.wood;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(E.x - 84, floorY - 124);
    ctx.lineTo(E.x + 84, floorY - 124);
    ctx.stroke();

    // Sparkles around masterpiece (tier >= 3)
    if (E.tier >= 3) {
      for (let k = 0; k < 4; k++) {
        const ang = t * 2 + (k * TAU) / 4;
        const sx = E.x + Math.cos(ang) * 92;
        const sy = floorY - 182 + Math.sin(ang) * 68;
        ctx.fillStyle = PAL.gold;
        ctx.beginPath();
        ctx.arc(sx, sy, 4 + Math.sin(t * 6 + k) * 2, 0, TAU);
        ctx.fill();
      }
    }
  }

  // Stack of completed canvases on the right floor (x = 665)
  const pileX = 655;
  const count = clamp(pileCount, 0, 16);
  for (let i = 0; i < count; i++) {
    const py = floorY - 10 - i * 9;
    const offX = ((i * 7) % 11) - 5;
    ctx.fillStyle = PAL.cream;
    ctx.strokeStyle = i === count - 1 ? PAL.gold : '#4a3b2c';
    ctx.lineWidth = 2;
    roundRect(ctx, pileX - 48 + offX, py, 96, 8, 3);
    ctx.fill();
    ctx.stroke();
  }
  if (count > 0) {
    ctx.fillStyle = PAL.gold;
    ctx.font = '800 18px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`TUMPUKAN #${count}`, pileX, floorY - 22 - count * 9);
  }

  ctx.restore();
}

/**
 * Unique Pelukis Stickman Character!
 * - role: 'prolific' (Si Maestro Berbaret: tilted crimson/gold beret with stem, neck scarf,
 *   paint-splattered apron, kidney palette with 4 colorful paint dabs in left hand, brush in right hand)
 * - role: 'perfectionist' (Si Perfeksionis Loupe: monocle/magnifying glass over eye, stiff bow-tie,
 *   neat blue beret, tiny detail brush, sweat drops when overthinking)
 */
export function pelukisStickman(ctx, x, floorY, pose = 'paint-fast', {
  role = 'prolific', facing = 1, t = 0, a = 1, holdTier = 3,
} = {}) {
  if (a <= 0.01) return;

  const drawChar = (ox, oy, alpha, isReflect = false) => {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(ox, oy);
    ctx.scale(facing, 1);

    const isPro = role === 'prolific';
    const accent = isPro ? PAL.coral : PAL.cyan;
    const strokeCol = isReflect ? 'rgba(180, 175, 210, 0.32)' : '#ffffff';

    const bounce = pose === 'paint-fast' ? Math.abs(Math.sin(t * 9)) * 10
      : pose === 'hold-proud' ? Math.abs(Math.sin(t * 4)) * 5 : 0;

    const hipX = 0, hipY = -102 + bounce;
    const neckX = pose === 'paint-careful' ? 14 : 4;
    const neckY = -182 + bounce;
    const headX = neckX + (pose === 'paint-careful' ? 8 : 2);
    const headY = neckY - 30;

    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Legs
    const kneeBend = pose === 'paint-fast' ? Math.sin(t * 9) * 10 : 0;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY); ctx.lineTo(-16 + kneeBend, -50); ctx.lineTo(-20, 0);
    ctx.moveTo(hipX, hipY); ctx.lineTo(18 - kneeBend, -50); ctx.lineTo(22, 0);
    // Torso spine
    ctx.moveTo(hipX, hipY); ctx.lineTo(neckX, neckY);
    ctx.stroke();

    // Unique Artist Smock / Apron on Torso
    if (!isReflect) {
      ctx.fillStyle = isPro ? '#2d2338' : '#1b2838';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(neckX - 13, neckY + 12);
      ctx.lineTo(neckX + 15, neckY + 12);
      ctx.lineTo(hipX + 18, hipY + 8);
      ctx.lineTo(hipX - 16, hipY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (isPro) {
        // Colorful paint dabs on smock + flowing scarf at neck
        ctx.fillStyle = PAL.gold;
        ctx.beginPath(); ctx.arc(neckX + 4, neckY + 34, 4, 0, TAU); ctx.fill();
        ctx.fillStyle = PAL.emerald;
        ctx.beginPath(); ctx.arc(neckX - 5, neckY + 52, 3.5, 0, TAU); ctx.fill();
        // Flowing artist scarf
        ctx.strokeStyle = PAL.coral;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(neckX - 10, neckY + 6);
        ctx.lineTo(neckX + 14, neckY + 6);
        ctx.moveTo(neckX - 6, neckY + 6);
        ctx.lineTo(neckX - 24, neckY + 24 + Math.sin(t * 6) * 4);
        ctx.stroke();
      } else {
        // Stiff bow-tie for perfectionist
        ctx.fillStyle = PAL.cyan;
        ctx.beginPath();
        ctx.moveTo(neckX, neckY + 8);
        ctx.lineTo(neckX - 10, neckY + 2);
        ctx.lineTo(neckX - 10, neckY + 14);
        ctx.closePath();
        ctx.moveTo(neckX, neckY + 8);
        ctx.lineTo(neckX + 10, neckY + 2);
        ctx.lineTo(neckX + 10, neckY + 14);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Left Arm (holding wooden kidney palette for prolific, or rubbing chin for perfectionist)
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 7.5;
    let lHandX = -28, lHandY = neckY + 38;
    let rHandX = 48, rHandY = neckY + 10;

    if (pose === 'hold-proud') {
      lHandX = -32; lHandY = headY - 46;
      rHandX = 36; rHandY = headY - 46;
    } else if (pose === 'paint-careful') {
      // Left hand on chin/forehead overthinking, right hand barely moving
      lHandX = headX - 8; lHandY = headY + 6;
      rHandX = 52; rHandY = neckY - 4 + Math.sin(t * 2) * 3;
    } else if (pose === 'paint-fast') {
      lHandX = -34; lHandY = neckY + 32;
      rHandX = 58 + Math.cos(t * 14) * 12;
      rHandY = neckY - 12 + Math.sin(t * 14) * 26;
    } else if (pose === 'inspect') {
      lHandX = -24; lHandY = neckY + 38;
      rHandX = headX + 18; rHandY = headY + 8;
    }

    ctx.beginPath();
    ctx.moveTo(neckX, neckY + 8);
    ctx.lineTo((neckX + lHandX) * 0.5 - 12, (neckY + lHandY) * 0.5 + 10);
    ctx.lineTo(lHandX, lHandY);
    ctx.moveTo(neckX, neckY + 8);
    ctx.lineTo((neckX + rHandX) * 0.5 + 10, (neckY + rHandY) * 0.5 + 10);
    ctx.lineTo(rHandX, rHandY);
    ctx.stroke();

    // Wooden Kidney Palette in Left Hand
    if (!isReflect && pose !== 'hold-proud') {
      ctx.save();
      ctx.translate(lHandX - 8, lHandY);
      ctx.fillStyle = PAL.woodLight;
      ctx.strokeStyle = '#3d2514';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 14, -0.3, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Paint dabs on palette
      const dabs = [[-10, -4, PAL.coral], [-2, -6, PAL.gold], [7, -3, PAL.emerald], [6, 5, PAL.cyan]];
      for (const [dx, dy, dc] of dabs) {
        ctx.fillStyle = dc;
        ctx.beginPath(); ctx.arc(dx, dy, 3.5, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }

    // Paintbrush in Right Hand (or Held-Up Masterpiece Canvas)
    if (!isReflect) {
      if (pose === 'hold-proud') {
        drawCanvasArt(ctx, -66, headY - 142, 136, 98, { tier: holdTier, progress: 1 });
      } else {
        ctx.save();
        ctx.translate(rHandX, rHandY);
        ctx.rotate(pose === 'paint-fast' ? Math.sin(t * 14) * 0.45 - 0.3 : -0.25);
        // Brush handle
        ctx.strokeStyle = PAL.woodLight;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-14, 6); ctx.lineTo(22, -10);
        ctx.stroke();
        // Brush bristles dipped in vibrant paint
        ctx.fillStyle = isPro ? PAL.gold : PAL.cyan;
        ctx.beginPath();
        ctx.moveTo(22, -10);
        ctx.lineTo(34, -18);
        ctx.lineTo(30, -6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // Head Circle
    ctx.fillStyle = PAL.bg0;
    ctx.beginPath(); ctx.arc(headX, headY, 24, 0, TAU); ctx.fill();
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = 6.5;
    ctx.beginPath(); ctx.arc(headX, headY, 24, 0, TAU); ctx.stroke();

    if (!isReflect) {
      // Facial Expression + Monocle/Loupe for Perfectionist
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX + 8, headY - 3, 3.2, 0, TAU);
      ctx.fill();

      if (!isPro) {
        // Loupe / Monocle ring over eye + sweat drop
        ctx.strokeStyle = PAL.cyan;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(headX + 8, headY - 3, 9, 0, TAU);
        ctx.stroke();
        // Worried mouth
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(headX + 2, headY + 11); ctx.lineTo(headX + 14, headY + 10);
        ctx.stroke();
        // Sweat drop
        const swY = (t * 22) % 16;
        ctx.fillStyle = PAL.cyan;
        ctx.beginPath();
        ctx.arc(headX - 16, headY - 6 + swY, 3.5, 0, TAU);
        ctx.fill();
      } else {
        // Confident smile
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(headX + 7, headY + 5, 7, 0.15, Math.PI - 0.15);
        ctx.stroke();
      }

      // Iconic Slanted Artist Beret (Topi Baret Pelukis) with Stem!
      ctx.save();
      ctx.translate(headX, headY - 18);
      ctx.rotate(isPro ? -0.22 : -0.08);
      ctx.fillStyle = isPro ? PAL.coral : '#2b4c7e';
      ctx.strokeStyle = isPro ? PAL.gold : PAL.cyan;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(-2, -4, 28, 11, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // Beret headband
      ctx.fillStyle = '#181520';
      ctx.fillRect(-20, 1, 40, 5);
      // Beret stem (tangkai baret) on top
      ctx.strokeStyle = isPro ? PAL.gold : PAL.cyan;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-2, -14);
      ctx.lineTo(-6, -22);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  };

  // Floor reflection right below floorY
  ctx.save();
  ctx.translate(x, floorY);
  ctx.scale(1, -0.5);
  drawChar(0, 0, a * 0.16, true);
  ctx.restore();

  // Main character
  drawChar(x, floorY, a, false);
}

/**
 * Studio Insight Card in the lower half of the 1080x1920 frame.
 */
export function pelukisCard(ctx, x, y, w, h, {
  tag = '', titleStr = '', subStr = '', stat = '', statSub = '', col = PAL.gold, a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const left = x - w / 2, top = y - h / 2;

  ctx.fillStyle = 'rgba(20, 18, 28, 0.95)';
  roundRect(ctx, left, top, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  roundRect(ctx, left, top, w, h, 16);
  ctx.stroke();

  // Left accent bar
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
    ctx.font = '900 32px ui-monospace, monospace';
    ctx.fillText(stat, bx + bw / 2, by + bh * 0.43, bw - 16);
    if (statSub) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 15px ui-monospace, monospace';
      ctx.fillText(statSub, bx + bw / 2, by + bh * 0.77, bw - 16);
    }
  }

  ctx.restore();
}
