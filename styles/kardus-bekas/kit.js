// Maura Motion style kit: KARDUS BEKAS (Corrugated Cardboard Craft & Stop-Motion Diorama).
// Tactile kraft cardboard cutouts, visible wavy corrugated flute edges, masking tape, brass brad joints,
// black marker doodles, red rubber stamps, and layered drop shadows on a craft cutting mat.

const { clamp, lerp, ease, prog, env, hrand, mulberry32 } = AM.lib;
const TAU = Math.PI * 2;

export const PAL = {
  matDk: '#1e3329',
  mat: '#264034',
  matGrid: 'rgba(210,235,215,0.11)',
  kraftDk: '#6e4726',
  kraft: '#b3804c',
  kraftLt: '#cca06e',
  kraftPale: '#e3be91',
  fluteShadow: '#4a2e16',
  tape: '#ebdab5',
  packingTape: 'rgba(198,142,72,0.55)',
  marker: '#1c1612',
  chalkWhite: '#f7f2e7',
  stampRed: '#c43828',
  recycleGreen: '#3b8748',
  crayonBlue: '#3b7ea6',
  crayonYellow: '#ebad32',
  bradGold: '#d9a441',
};

/** Quantize time to 10 fps for tactile stop-motion craft feel. */
export const stepT = (t, fps = 10) => Math.floor(t * fps) / fps;

/** Set 2D camera centered on (cx, cy) with zoom z and optional rotation. */
export function cam(ctx, z = 1, cx = 540, cy = 960, rot = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, 960);
  if (rot) ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}

let MAT_CACHE = null;
/** Draw craft workbench background (green self-healing cutting mat + kraft desk vignette). */
export function cuttingMat(ctx, t = 0) {
  if (!MAT_CACHE) {
    const c = document.createElement('canvas');
    c.width = 1080; c.height = 1920;
    const g = c.getContext('2d');
    const bg = g.createRadialGradient(540, 960, 120, 540, 960, 1200);
    bg.addColorStop(0, '#2c4a3c');
    bg.addColorStop(0.7, '#20382d');
    bg.addColorStop(1, '#14241d');
    g.fillStyle = bg;
    g.fillRect(0, 0, 1080, 1920);

    // Cutting mat grid lines
    g.strokeStyle = PAL.matGrid;
    g.lineWidth = 1.5;
    for (let x = 60; x < 1080; x += 60) {
      g.beginPath(); g.moveTo(x, 60); g.lineTo(x, 1860); g.stroke();
    }
    for (let y = 60; y < 1920; y += 60) {
      g.beginPath(); g.moveTo(60, y); g.lineTo(1020, y); g.stroke();
    }
    // Bold 5-unit grid border
    g.strokeStyle = 'rgba(210,235,215,0.22)';
    g.lineWidth = 3;
    g.strokeRect(60, 60, 960, 1800);

    // Subtle paper/mat speckles
    const rng = mulberry32(19);
    for (let i = 0; i < 1200; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)';
      g.fillRect(rng() * 1080, rng() * 1920, 2, 2);
    }
    MAT_CACHE = c;
  }
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(MAT_CACHE, 0, 0);
  ctx.restore();
}

/** Draw corrugated wavy flute edge along a horizontal or vertical strip. */
export function fluteStrip(ctx, x, y, w, h, { dir = 'h' } = {}) {
  ctx.save();
  ctx.fillStyle = PAL.fluteShadow;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PAL.kraftLt;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (dir === 'h') {
    const midY = y + h / 2, amp = h * 0.34;
    for (let px = x; px <= x + w; px += 4) {
      const py = midY + Math.sin((px - x) * 0.38) * amp;
      if (px === x) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
  } else {
    const midX = x + w / 2, amp = w * 0.34;
    for (let py = y; py <= y + h; py += 4) {
      const px = midX + Math.sin((py - y) * 0.38) * amp;
      if (py === y) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/** Draw a piece of masking tape (`selotip kertas`) with jagged torn ends. */
export function maskingTape(ctx, x, y, w = 130, h = 34, rot = 0, { col = PAL.tape } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(-w / 2 + 3, -h / 2 + 4, w, h);
  ctx.fillStyle = col;
  ctx.globalAlpha = 0.88;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  for (let i = 0; i <= 6; i++) {
    ctx.lineTo(w / 2 - (i % 2) * 5, -h / 2 + (i / 6) * h);
  }
  ctx.lineTo(-w / 2, h / 2);
  for (let i = 6; i >= 0; i--) {
    ctx.lineTo(-w / 2 + (i % 2) * 5, -h / 2 + (i / 6) * h);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Draw a brass brad / split-pin joint (`paku klip kuningan`) on cardboard limbs. */
export function bradPin(ctx, x, y, r = 9) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(x + 2, y + 3, r, 0, TAU); ctx.fill();
  ctx.fillStyle = PAL.bradGold;
  ctx.strokeStyle = PAL.marker;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - r * 0.5, y); ctx.lineTo(x + r * 0.5, y); ctx.stroke();
  ctx.restore();
}

/**
 * Draw a cut cardboard panel with corrugated thickness edge, kraft grain, and optional torn strip revealing flutes.
 */
export function cardPanel(ctx, x, y, w, h, {
  col = PAL.kraft, rot = 0, fluteBottom = true, tornCorner = false, tapeTop = false, seed = 1,
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.36)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 10, -h / 2 + 14, w, h, 6);
  ctx.fill();

  // Corrugated bottom thickness edge
  if (fluteBottom) {
    fluteStrip(ctx, -w / 2 + 2, h / 2 - 2, w - 4, 14, { dir: 'h' });
  }

  // Main kraft surface
  ctx.fillStyle = col;
  ctx.strokeStyle = PAL.marker;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 5);
  ctx.fill();
  ctx.stroke();

  // Subtle horizontal kraft ribs & fiber flecks
  const rng = mulberry32(seed * 41 + 3);
  ctx.strokeStyle = 'rgba(90,55,25,0.12)';
  ctx.lineWidth = 1.5;
  for (let py = -h / 2 + 12; py < h / 2 - 8; py += 14) {
    ctx.beginPath(); ctx.moveTo(-w / 2 + 8, py); ctx.lineTo(w / 2 - 8, py); ctx.stroke();
  }
  for (let i = 0; i < 35; i++) {
    ctx.fillStyle = rng() > 0.5 ? 'rgba(65,38,15,0.18)' : 'rgba(245,220,185,0.15)';
    ctx.fillRect((rng() - 0.5) * (w - 16), (rng() - 0.5) * (h - 16), 3 + rng() * 5, 2);
  }

  // Optional torn corner revealing inner corrugated ribs
  if (tornCorner) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(w / 2 - 95, -h / 2);
    ctx.lineTo(w / 2, -h / 2);
    ctx.lineTo(w / 2, -h / 2 + 85);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = PAL.kraftDk;
    ctx.fillRect(w / 2 - 100, -h / 2, 100, 90);
    ctx.strokeStyle = PAL.fluteShadow;
    ctx.lineWidth = 5;
    for (let rx = w / 2 - 95; rx <= w / 2; rx += 11) {
      ctx.beginPath(); ctx.moveTo(rx, -h / 2); ctx.lineTo(rx, -h / 2 + 90); ctx.stroke();
    }
    ctx.restore();
  }

  if (tapeTop) {
    maskingTape(ctx, 0, -h / 2, 140, 34, -0.04);
  }
  ctx.restore();
}

/**
 * Draw a 2.5D corrugated shipping box (`kardus paket`) with animated top flaps, barcode, and recycle symbol.
 */
export function shippingBox(ctx, x, y, s = 1, {
  open = 0, face = true, mood = 'happy', stamp = 'FRAGILE', recycleNum = 0, t = 0,
} = {}) {
  const st = stepT(t);
  const op = clamp(open);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  const bw = 260, bh = 210;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath();
  ctx.ellipse(10, bh / 2 + 18, bw * 0.62, 26, 0, 0, TAU);
  ctx.fill();

  // Back interior cavity when flaps open
  if (op > 0.02) {
    ctx.fillStyle = PAL.fluteShadow;
    ctx.fillRect(-bw / 2, -bh / 2 - 28 * op, bw, 36 * op + 10);
  }

  // Left & Right folding top flaps
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(side * (bw / 2), -bh / 2);
    ctx.rotate(side * (-0.15 - op * 1.95));
    ctx.fillStyle = PAL.kraftLt;
    ctx.strokeStyle = PAL.marker;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.rect(side < 0 ? 0 : -bw * 0.52, -48, bw * 0.52, 48);
    ctx.fill();
    ctx.stroke();
    fluteStrip(ctx, side < 0 ? 2 : -bw * 0.52 + 2, -48, bw * 0.52 - 4, 8, { dir: 'h' });
    ctx.restore();
  }

  // Main front box body
  cardPanel(ctx, 0, 0, bw, bh, { col: PAL.kraft, fluteBottom: true, tornCorner: true, seed: 7 });

  // Vertical seam & packing tape when closed
  if (op < 0.25) {
    maskingTape(ctx, 0, -bh / 2 + 6, 170, 28, 0, { col: PAL.packingTape });
  }

  // Shipping label & barcode on bottom-left
  ctx.save();
  ctx.translate(-bw * 0.27, bh * 0.25);
  ctx.fillStyle = PAL.chalkWhite;
  ctx.strokeStyle = PAL.marker;
  ctx.lineWidth = 2;
  ctx.fillRect(-46, -28, 92, 54);
  ctx.strokeRect(-46, -28, 92, 54);
  for (let bx = -38; bx < 38; bx += 6) {
    ctx.fillStyle = PAL.marker;
    ctx.fillRect(bx, -18, (bx % 12 === 0) ? 3.5 : 1.8, 26);
  }
  ctx.restore();

  // Red stamp or Recycle badge on bottom-right
  if (recycleNum > 0) {
    ctx.save();
    ctx.translate(bw * 0.26, bh * 0.24);
    ctx.strokeStyle = PAL.recycleGreen;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = PAL.recycleGreen;
    ctx.font = '800 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${recycleNum}×`, 0, 2);
    ctx.restore();
  } else if (stamp) {
    ctx.save();
    ctx.translate(bw * 0.24, bh * 0.25);
    ctx.rotate(-0.14);
    ctx.strokeStyle = PAL.stampRed;
    ctx.lineWidth = 3;
    ctx.strokeRect(-48, -16, 96, 32);
    ctx.fillStyle = PAL.stampRed;
    ctx.font = '800 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stamp, 0, 1);
    ctx.restore();
  }

  // Cute marker-drawn face in center-top
  if (face) {
    ctx.save();
    ctx.translate(0, -18);
    ctx.fillStyle = PAL.marker;
    ctx.strokeStyle = PAL.marker;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    const blink = (st % 2.8) < 0.12;
    for (const sx of [-42, 42]) {
      if (blink) {
        ctx.beginPath(); ctx.moveTo(sx - 12, 0); ctx.lineTo(sx + 12, 0); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(sx, 0, 10, 0, TAU); ctx.fill();
        ctx.fillStyle = PAL.chalkWhite;
        ctx.beginPath(); ctx.arc(sx - 3, -3, 3.5, 0, TAU); ctx.fill();
        ctx.fillStyle = PAL.marker;
      }
    }
    ctx.beginPath();
    if (mood === 'wow') {
      ctx.arc(0, 20, 12, 0, TAU); ctx.stroke();
    } else {
      ctx.arc(0, 12, 18, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draw cross-section of 3-layer corrugated cardboard (Top Liner + Wavy Flute Arch + Bottom Liner).
 */
export function fluteCrossSection(ctx, x, y, w = 780, h = 190, { t = 0, load = 0, arrows = false } = {}) {
  const st = stepT(t, 12);
  const press = clamp(load) * 18;
  const curH = h - press;

  ctx.save();
  ctx.translate(x, y + press * 0.5);

  // Dark cavity behind flutes
  ctx.fillStyle = PAL.fluteShadow;
  ctx.fillRect(-w / 2, -curH / 2 + 22, w, curH - 44);

  // Sinusoidal flute arches (the secret structural arch!)
  ctx.strokeStyle = PAL.kraftLt;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const waves = 7;
  for (let i = 0; i <= 140; i++) {
    const u = i / 140;
    const px = -w / 2 + u * w;
    const py = Math.cos(u * waves * TAU) * (curH / 2 - 30);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Top & Bottom flat linerboards
  for (const sy of [-1, 1]) {
    const ly = sy * (curH / 2 - 11);
    ctx.fillStyle = PAL.kraft;
    ctx.strokeStyle = PAL.marker;
    ctx.lineWidth = 3.5;
    ctx.fillRect(-w / 2, ly - 11, w, 22);
    ctx.strokeRect(-w / 2, ly - 11, w, 22);
  }

  // Force distribution arrows when load > 0 or arrows = true
  if (arrows) {
    ctx.strokeStyle = PAL.crayonYellow;
    ctx.fillStyle = PAL.crayonYellow;
    ctx.lineWidth = 5;
    for (let k = -2; k <= 2; k++) {
      const ax = k * (w / 6);
      const bob = Math.sin(st * 6 + k) * 6;
      ctx.beginPath();
      ctx.moveTo(ax, -curH / 2 - 65 + bob);
      ctx.lineTo(ax, -curH / 2 - 22 + bob);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax - 12, -curH / 2 - 34 + bob);
      ctx.lineTo(ax, -curH / 2 - 18 + bob);
      ctx.lineTo(ax + 12, -curH / 2 - 34 + bob);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Draw articulated cardboard cutout puppets & props:
 * kind: 'robot' | 'roket' | 'kastil' | 'pabrik' | 'truk' | 'anak'
 */
export function cardPuppet(ctx, kind, { x = 0, y = 0, s = 1, t = 0, walk = 0, wave = 0 } = {}) {
  const st = stepT(t, 10);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  if (kind === 'robot') {
    const bob = Math.abs(Math.sin(st * 6)) * 10 * walk;
    ctx.translate(0, -bob);
    // Legs
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 48, 85);
      ctx.rotate(Math.sin(st * 6) * 0.28 * side * walk);
      cardPanel(ctx, 0, 45, 44, 95, { col: PAL.kraftDk, fluteBottom: true });
      bradPin(ctx, 0, 0, 8);
      ctx.restore();
    }
    // Box Torso with painted gauge
    cardPanel(ctx, 0, 0, 175, 185, { col: PAL.kraft, tornCorner: true });
    ctx.fillStyle = PAL.crayonBlue;
    ctx.fillRect(-55, -25, 110, 65);
    ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3;
    ctx.strokeRect(-55, -25, 110, 65);
    // Arms with brass brads
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 96, -45);
      ctx.rotate(side * (0.35 + Math.sin(st * 5 + side) * (0.2 + wave * 0.6)));
      cardPanel(ctx, side * 45, 0, 95, 38, { col: PAL.kraftLt, fluteBottom: false });
      bradPin(ctx, 0, 0, 9);
      ctx.restore();
    }
    // Box Head with bottle-cap eyes & antenna
    ctx.save();
    ctx.translate(0, -145);
    ctx.rotate(Math.sin(st * 3) * 0.06);
    cardPanel(ctx, 0, 0, 135, 105, { col: PAL.kraftLt, tapeTop: true });
    for (const sx of [-32, 32]) {
      ctx.fillStyle = PAL.crayonYellow;
      ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx, -6, 18, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAL.marker;
      ctx.beginPath(); ctx.arc(sx, -6, 7, 0, TAU); ctx.fill();
    }
    // Drawn zig-zag mouth
    ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let mx = -36; mx <= 36; mx += 12) {
      ctx.lineTo(mx, 26 + ((mx / 12) % 2 === 0 ? -5 : 5));
    }
    ctx.stroke();
    ctx.restore();
  } else if (kind === 'roket') {
    const shake = Math.sin(st * 18) * 3 * wave;
    ctx.translate(shake, 0);
    // Cardboard flame cutouts at bottom
    if (wave > 0.05) {
      for (const [fx, fw, fh, col] of [[0, 95, 140, PAL.stampRed], [0, 62, 95, PAL.crayonYellow]]) {
        ctx.save();
        ctx.translate(fx, 155 + Math.sin(st * 16 + fw) * 12);
        ctx.fillStyle = col; ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-fw / 2, 0); ctx.lineTo(0, fh * wave); ctx.lineTo(fw / 2, 0); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
    }
    // Side fins
    for (const side of [-1, 1]) {
      ctx.fillStyle = PAL.stampRed; ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(side * 65, 35);
      ctx.lineTo(side * 145, 135);
      ctx.lineTo(side * 65, 145);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      bradPin(ctx, side * 78, 95, 8);
    }
    // Cylindrical cardboard tube body
    cardPanel(ctx, 0, 0, 140, 290, { col: PAL.kraft, tornCorner: true });
    // Nose cone
    ctx.fillStyle = PAL.stampRed; ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-76, -145); ctx.lineTo(0, -265); ctx.lineTo(76, -145); ctx.closePath();
    ctx.fill(); ctx.stroke();
    maskingTape(ctx, 0, -145, 120, 26, 0.03);
    // Porthole window
    ctx.fillStyle = PAL.crayonBlue; ctx.strokeStyle = PAL.kraftPale; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(0, -35, 38, 0, TAU); ctx.fill(); ctx.stroke();
  } else if (kind === 'kastil') {
    // Side towers
    for (const sx of [-175, 175]) {
      cardPanel(ctx, sx, -20, 95, 260, { col: PAL.kraftDk });
      // Crenellations
      for (let cx = -32; cx <= 32; cx += 32) {
        cardPanel(ctx, sx + cx, -165, 22, 32, { col: PAL.kraftDk, fluteBottom: false });
      }
      // Flag
      ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(sx, -180); ctx.lineTo(sx, -245); ctx.stroke();
      ctx.fillStyle = PAL.stampRed;
      ctx.beginPath(); ctx.moveTo(sx, -245); ctx.lineTo(sx + 48, -228); ctx.lineTo(sx, -210); ctx.fill();
    }
    // Main central keep
    cardPanel(ctx, 0, 15, 260, 210, { col: PAL.kraft, tapeTop: true });
    // Arched drawbridge gate
    ctx.fillStyle = PAL.fluteShadow; ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 65, 52, Math.PI, 0);
    ctx.lineTo(52, 120); ctx.lineTo(-52, 120); ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else if (kind === 'pabrik') {
    // Recycling pulper & roller machine made of cardboard cutouts
    cardPanel(ctx, 0, 10, 380, 220, { col: PAL.kraftDk, tornCorner: true });
    // Funnel hopper on top
    ctx.fillStyle = PAL.kraftLt; ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-120, -100); ctx.lineTo(-165, -195); ctx.lineTo(165, -195); ctx.lineTo(120, -100); ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Spinning cardboard gears/rollers
    for (const [gx, gy, dir] of [[-85, 10, 1], [85, 10, -1]]) {
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(st * 2.5 * dir);
      ctx.fillStyle = PAL.kraftPale; ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3;
      for (let k = 0; k < 8; k++) {
        ctx.rotate(TAU / 8);
        ctx.fillRect(-12, -62, 24, 124);
      }
      ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.fill(); ctx.stroke();
      bradPin(ctx, 0, 0, 12);
      ctx.restore();
    }
  } else if (kind === 'anak') {
    // Cardboard cutout child character with brad joints
    const bob = Math.abs(Math.sin(st * 6)) * 8 * walk;
    ctx.translate(0, -bob);
    cardPanel(ctx, 0, 20, 115, 145, { col: PAL.crayonBlue });
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(side * 65, -25);
      ctx.rotate(side * (0.4 + Math.sin(st * 5) * 0.4 * (wave + 0.3)));
      cardPanel(ctx, side * 34, 0, 74, 30, { col: PAL.kraftPale, fluteBottom: false });
      bradPin(ctx, 0, 0, 7);
      ctx.restore();
    }
    // Head
    ctx.save();
    ctx.translate(0, -105);
    cardPanel(ctx, 0, 0, 110, 98, { col: PAL.kraftPale, fluteBottom: false });
    ctx.fillStyle = PAL.marker;
    ctx.fillRect(-58, -52, 116, 26); // hair strip
    for (const sx of [-24, 24]) {
      ctx.beginPath(); ctx.arc(sx, -4, 7, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = PAL.marker; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(0, 12, 14, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draw a torn cardboard title banner taped to the screen with bold marker lettering.
 */
export function cardLabel(ctx, title, x, y, {
  sub = '', tag = '', size = 50, alpha = 1, rot = -0.015,
} = {}) {
  const a = clamp(alpha);
  if (a <= 0.01) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = a;
  ctx.font = `900 ${size}px sans-serif`;
  const tw = Math.max(ctx.measureText(title).width, sub ? ctx.measureText(sub).width * 0.65 : 0);
  const w = Math.max(480, tw + 110);
  const h = sub ? (tag ? 162 : 132) : 92;

  cardPanel(ctx, x, y, w, h, { col: PAL.kraftLt, rot, fluteBottom: true, tornCorner: true, seed: 3 });

  ctx.translate(x, y);
  ctx.rotate(rot);
  maskingTape(ctx, -w / 2 + 24, -h / 2 + 8, 95, 28, -0.35);
  maskingTape(ctx, w / 2 - 24, -h / 2 + 8, 95, 28, 0.35);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (tag) {
    ctx.fillStyle = PAL.stampRed;
    ctx.font = '800 22px sans-serif';
    ctx.fillText(tag.toUpperCase(), 0, -h / 2 + 28);
  }
  ctx.fillStyle = PAL.marker;
  ctx.font = `900 ${size}px sans-serif`;
  ctx.fillText(title, 0, tag ? 4 : (sub ? -16 : 2));
  if (sub) {
    ctx.fillStyle = '#3d2410';
    ctx.font = '700 26px sans-serif';
    ctx.fillText(sub, 0, tag ? 46 : 30);
  }
  ctx.restore();
}
