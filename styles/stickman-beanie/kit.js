// 70 · STICKMAN BEANIE — Cozy Sketchpad Studio & Red Knit Beanie Stickman Kit
// Unique Character ("Si Kupluk Merah & Hoodie Kuning"):
// - Chunky red knitted beanie with vertical ribbed fold-over cuff and bouncy round pom-pom on top
// - Mustard-yellow oversized hoodie with front kangaroo pocket and white drawstrings with aglet tips
// - Rolled-cuff denim pants & red canvas sneakers
// - Warm dot-grid sketchpad studio background, cozy desk/sofa props, comic bubbles & sticky cards

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export const PAL = {
  paper: '#f8f5ec',
  panel: '#ffffff',
  ink: '#1e1e24',
  beanie: '#e03e2d',
  beanieDark: '#a82619',
  hoodie: '#f6c438',
  hoodieShadow: '#d9a41c',
  denim: '#385a8c',
  teal: '#1b8a7a',
  blue: '#2563eb',
  purple: '#7c3aed',
  muted: '#5c5c66',
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
 * Draw warm dot-grid studio paper background (Full-Screen 1080x1920 Standard!).
 */
export function beanieBg(ctx, t = 0, {
  floorY = 1240, stageTag = 'CATATAN SELF-TALK HARIAN', col = PAL.beanie,
} = {}) {
  const W = 1080, H = 1920;
  ctx.save();
  ctx.fillStyle = PAL.paper;
  ctx.fillRect(0, 0, W, H);

  // Subtle dot-grid pattern across the entire page
  ctx.fillStyle = 'rgba(30, 30, 36, 0.14)';
  for (let y = 36; y < H; y += 48) {
    for (let x = 36; x < W; x += 48) {
      ctx.fillRect(x, y, 3, 3);
    }
  }

  // Framed Comic Stage Box expanding full vertical canvas (y = 225..1390)
  const sh = floorY - 225 + 150;
  ctx.fillStyle = 'rgba(30, 30, 36, 0.12)';
  roundRect(ctx, 54, 237, 984, sh, 24);
  ctx.fill();

  ctx.fillStyle = PAL.panel;
  roundRect(ctx, 42, 225, 984, sh, 24);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  roundRect(ctx, 42, 225, 984, sh, 24);
  ctx.stroke();

  // Subtle grid inside stage panel
  ctx.strokeStyle = 'rgba(30, 30, 36, 0.06)';
  ctx.lineWidth = 1.5;
  for (let gx = 100; gx < 1000; gx += 64) {
    ctx.beginPath(); ctx.moveTo(gx, 230); ctx.lineTo(gx, floorY); ctx.stroke();
  }
  for (let gy = 280; gy < floorY; gy += 64) {
    ctx.beginPath(); ctx.moveTo(46, gy); ctx.lineTo(1020, gy); ctx.stroke();
  }

  // Stage top tag pill
  ctx.fillStyle = col;
  roundRect(ctx, 74, 248, 380, 42, 12);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, 74, 248, 380, 42, 12);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 17px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stageTag, 264, 269, 360);

  // Studio floor line inside comic panel
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(68, floorY);
  ctx.lineTo(1000, floorY);
  ctx.stroke();

  ctx.restore();
}

/**
 * Camera helper for dynamic zoom & focus in stickman-beanie
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
 * Floating Callout Card on the lower area (y: 1485, h: 165)
 */
export function beanieCallout(ctx, x, y, w, h, {
  tag = 'SELF-TALK',
  title = '',
  desc = '',
  stat = '',
  statSub = '',
  col = PAL.beanie,
  a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.92 + 0.08 * a, 0.92 + 0.08 * a);
  ctx.globalAlpha = clamp(a, 0, 1);

  // Hard comic drop shadow
  ctx.fillStyle = PAL.ink;
  roundRect(ctx, -w / 2 + 8, -h / 2 + 8, w, h, 20);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, -w / 2, -h / 2, w, h, 20);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  roundRect(ctx, -w / 2, -h / 2, w, h, 20);
  ctx.stroke();

  // Left color stripe
  ctx.fillStyle = col;
  roundRect(ctx, -w / 2 + 18, -h / 2 + 18, 10, h - 36, 5);
  ctx.fill();

  const textW = stat ? w - 260 : w - 64;
  const tx = -w / 2 + 42;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  if (tag) {
    ctx.fillStyle = col;
    ctx.font = '800 17px ui-monospace, monospace';
    ctx.fillText(tag, tx, -h / 2 + 34, textW);
  }
  if (title) {
    ctx.fillStyle = PAL.ink;
    ctx.font = '900 25px system-ui, sans-serif';
    ctx.fillText(title, tx, -h / 2 + 76, textW);
  }
  if (desc) {
    ctx.fillStyle = PAL.muted;
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillText(desc, tx, -h / 2 + 116, textW);
  }

  if (stat) {
    const bx = w / 2 - 200, by = -h / 2 + 18, bw = 180, bh = h - 36;
    ctx.fillStyle = PAL.hoodie;
    roundRect(ctx, bx, by, bw, bh, 14);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    roundRect(ctx, bx, by, bw, bh, 14);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.ink;
    ctx.font = '900 28px ui-monospace, monospace';
    ctx.fillText(stat, bx + bw / 2, by + bh * 0.44, bw - 16);
    if (statSub) {
      ctx.fillStyle = PAL.beanieDark;
      ctx.font = '800 13px ui-monospace, monospace';
      ctx.fillText(statSub, bx + bw / 2, by + bh * 0.77, bw - 16);
    }
  }

  ctx.restore();
}

/**
 * Top Comic Studio Header Banner.
 */
export function beanieHeader(ctx, badge, mainTitle, subTitle, {
  col = PAL.beanie, a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  // Hard comic shadow
  ctx.fillStyle = PAL.ink;
  roundRect(ctx, 50, 52, 996, 146, 20);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 42, 44, 996, 146, 20);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  roundRect(ctx, 42, 44, 996, 146, 20);
  ctx.stroke();

  // Left red beanie badge
  ctx.fillStyle = col;
  roundRect(ctx, 64, 66, 162, 102, 14);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  roundRect(ctx, 64, 66, 162, 102, 14);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 15px ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KUPLUK MERAH', 145, 92, 144);
  ctx.font = '900 28px system-ui, sans-serif';
  ctx.fillText(badge, 145, 134, 144);

  // Titles
  ctx.textAlign = 'left';
  ctx.fillStyle = col;
  ctx.font = '800 18px ui-monospace, monospace';
  ctx.fillText('MINDSET & PSIKOLOGI ANAK MUDA • STICKMAN BEANIE', 252, 80, 760);

  ctx.fillStyle = PAL.ink;
  ctx.font = '900 34px system-ui, sans-serif';
  ctx.fillText(mainTitle, 252, 120, 760);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText(subTitle, 252, 158, 760);

  ctx.restore();
}

/**
 * Draw cozy studio room props on the floor:
 * - theme: 'desk' (wooden study desk + laptop + steaming coffee mug + potted plant)
 * - theme: 'choices' (3 big floating option doors/cards on right)
 * - theme: 'spotlight' (stage spotlight cone + mirror/crowd silhouette)
 */
export function beanieProps(ctx, floorY = 755, theme = 'desk', {
  phase = 0, t = 0,
} = {}) {
  ctx.save();
  // Potted Monstera / Leafy Plant on far left (x = 135)
  const px = 135;
  ctx.fillStyle = '#d96b43';
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(px - 28, floorY - 58);
  ctx.lineTo(px + 28, floorY - 58);
  ctx.lineTo(px + 20, floorY);
  ctx.lineTo(px - 20, floorY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Green leaves
  ctx.fillStyle = PAL.teal;
  for (const [ang, len] of [[-0.5, 48], [0, 58], [0.55, 46]]) {
    ctx.save();
    ctx.translate(px, floorY - 58);
    ctx.rotate(ang + Math.sin(t * 2 + ang) * 0.04);
    ctx.beginPath();
    ctx.ellipse(0, -len * 0.55, 14, len * 0.5, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  if (theme === 'desk') {
    // Study Desk on Right (x = 760)
    const dx = 760, dw = 320, dh = 150;
    ctx.fillStyle = '#e6b87d';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 4;
    roundRect(ctx, dx - dw / 2, floorY - dh, dw, 22, 8);
    ctx.fill();
    ctx.stroke();
    // Desk legs
    ctx.beginPath();
    ctx.moveTo(dx - dw / 2 + 28, floorY - dh + 22); ctx.lineTo(dx - dw / 2 + 28, floorY);
    ctx.moveTo(dx + dw / 2 - 28, floorY - dh + 22); ctx.lineTo(dx + dw / 2 - 28, floorY);
    ctx.stroke();

    // Open Laptop on desk
    ctx.fillStyle = '#384252';
    ctx.beginPath();
    ctx.moveTo(dx - 85, floorY - dh);
    ctx.lineTo(dx - 105, floorY - dh - 75);
    ctx.lineTo(dx + 12, floorY - dh - 75);
    ctx.lineTo(dx + 30, floorY - dh);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Coffee Mug + Steam
    ctx.fillStyle = PAL.beanie;
    roundRect(ctx, dx + 65, floorY - dh - 42, 38, 42, 6);
    ctx.fill();
    ctx.stroke();
  } else if (theme === 'choices') {
    // Option Cards on Right (x = 760)
    const count = phase <= 1 ? 6 : 3;
    for (let i = 0; i < count; i++) {
      const colIdx = i % 3;
      const cx = 640 + (i % 2) * 145;
      const cy = 360 + Math.floor(i / 2) * 110;
      ctx.fillStyle = colIdx === 0 ? '#ffe8e5' : colIdx === 1 ? '#fef6d8' : '#e0f2fe';
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 3.5;
      roundRect(ctx, cx, cy, 125, 86, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = PAL.ink;
      ctx.font = '900 20px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`OPSI #${i + 1}`, cx + 62, cy + 43);
    }
  } else if (theme === 'spotlight') {
    // Exaggerated yellow spotlight cone over character in phases 0-1, warm normal studio in phases 2-3
    if (phase <= 1) {
      ctx.fillStyle = 'rgba(246, 196, 56, 0.25)';
      ctx.beginPath();
      ctx.moveTo(360, 228);
      ctx.lineTo(440, 228);
      ctx.lineTo(540, floorY);
      ctx.lineTo(260, floorY);
      ctx.closePath();
      ctx.fill();
    }
    // Bystander sketch board on right showing what people actually think ("MIKIRIN DIRI SENDIRI 90%")
    const bx = 775, by = 460;
    ctx.fillStyle = '#fff9db';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    roundRect(ctx, bx - 145, by - 95, 290, 190, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PAL.beanie;
    ctx.font = '800 17px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ISI KEPALA ORANG LAIN:', bx, by - 55, 260);
    ctx.fillStyle = PAL.ink;
    ctx.font = '900 32px system-ui, sans-serif';
    ctx.fillText(phase <= 1 ? 'SIBUK SENDIRI!' : '90% CUEK!', bx, by, 260);
    ctx.fillStyle = PAL.muted;
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillText('Fokus pada urusan masing-masing', bx, by + 48, 260);
  }
  ctx.restore();
}

/**
 * Unique Stickman Beanie Character ("Si Kupluk Merah & Hoodie Kuning")!
 * - Chunky knitted red beanie with ribbed cuff and bouncy round pom-pom on top
 * - Mustard-yellow oversized hoodie with front kangaroo pocket & white drawstrings
 * - Rolled denim cuffs & red sneakers
 */
export function beanieStickman(ctx, x, floorY, pose = 'confident', {
  facing = 1, t = 0, a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  // Soft floor shadow
  ctx.fillStyle = 'rgba(30, 30, 36, 0.14)';
  ctx.beginPath();
  ctx.ellipse(x, floorY + 4, 48, 11, 0, 0, TAU);
  ctx.fill();

  ctx.translate(x, floorY);
  ctx.scale(facing, 1);

  const bounce = Math.sin(t * 4.5) * 4;
  const hipY = -108 + bounce;
  const neckY = -208 + bounce;
  const headX = 0, headY = -256 + bounce;

  // 1. Legs with Denim Cuffs & Red Sneakers
  const walkSw = pose === 'action' ? Math.sin(t * 8) * 18 : 0;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [side, sw] of [[-1, -walkSw], [1, walkSw]]) {
    const fx = side * 22 + sw, fy = 0;
    ctx.beginPath();
    ctx.moveTo(side * 12, hipY);
    ctx.lineTo(side * 18 + sw * 0.5, -52);
    ctx.lineTo(fx, fy - 8);
    ctx.stroke();

    // Red canvas sneaker with white rubber toe & sole
    ctx.fillStyle = PAL.beanie;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    roundRect(ctx, fx - 8, fy - 16, 30, 16, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx - 6, fy - 5, 26, 4);
  }

  // 2. Oversized Mustard-Yellow Hoodie Torso!
  ctx.fillStyle = PAL.hoodie;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(-26, neckY + 6);
  ctx.lineTo(26, neckY + 6);
  ctx.lineTo(34, hipY + 4);
  ctx.lineTo(-34, hipY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hoodie Front Kangaroo Pocket (trapezoid at lower belly)
  ctx.fillStyle = PAL.hoodieShadow;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-20, hipY - 32);
  ctx.lineTo(20, hipY - 32);
  ctx.lineTo(26, hipY - 4);
  ctx.lineTo(-26, hipY - 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White Hoodie Drawstrings with Aglet Tips on Chest!
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-9, neckY + 10); ctx.lineTo(-11, neckY + 42 + Math.sin(t * 5) * 2);
  ctx.moveTo(9, neckY + 10); ctx.lineTo(11, neckY + 40 - Math.sin(t * 5) * 2);
  ctx.stroke();

  // 3. Arms in Yellow Hoodie Sleeves
  let lHand = [-44, neckY + 52];
  let rHand = [48, neckY + 36];
  if (pose === 'shock') {
    lHand = [-48, headY + 6];
    rHand = [48, headY + 6];
  } else if (pose === 'think') {
    lHand = [-32, neckY + 56];
    rHand = [18, headY + 26];
  } else if (pose === 'action' || pose === 'celebrate') {
    lHand = [-46, neckY - 22];
    rHand = [52, neckY - 28];
  }

  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-24, neckY + 14);
  ctx.lineTo(lHand[0], lHand[1]);
  ctx.moveTo(24, neckY + 14);
  ctx.lineTo(rHand[0], rHand[1]);
  ctx.stroke();

  // 4. Head Circle (Warm White Paper Fill + Bold Ink Outline)
  const hr = 42;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(headX, headY, hr, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Expressive Eyes & Mouth
  const ex = 6;
  ctx.fillStyle = PAL.ink;
  if (pose === 'shock') {
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(-12 + ex, headY + 2, 6.5, 0, TAU);
    ctx.arc(14 + ex, headY + 2, 6.5, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(2 + ex, headY + 22, 8, 0, TAU);
    ctx.stroke();
  } else if (pose === 'think') {
    ctx.beginPath();
    ctx.arc(-12 + ex, headY + 2, 4.2, 0, TAU);
    ctx.arc(14 + ex, headY + 2, 4.2, 0, TAU);
    ctx.fill();
    // Skeptical brow & flat mouth
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-20 + ex, headY - 10); ctx.lineTo(-4 + ex, headY - 10);
    ctx.moveTo(6 + ex, headY - 14); ctx.lineTo(22 + ex, headY - 9);
    ctx.moveTo(-6 + ex, headY + 20); ctx.lineTo(12 + ex, headY + 18);
    ctx.stroke();
  } else {
    // Happy / Confident smile
    ctx.beginPath();
    ctx.arc(-12 + ex, headY + 2, 4.5, 0, TAU);
    ctx.arc(14 + ex, headY + 2, 4.5, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(2 + ex, headY + 12, 13, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // 5. Iconic Chunky Red Knitted Beanie (Kupluk Rajut Merah) with Ribbed Cuff & Pom-Pom!
  const by = headY - 14;
  // Beanie Dome
  ctx.fillStyle = PAL.beanie;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(headX, by, hr + 3, Math.PI, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Folded Ribbed Knit Cuff (Lipatan Kupluk Rajut)
  ctx.fillStyle = PAL.beanie;
  roundRect(ctx, -hr - 6, by - 12, (hr + 6) * 2, 22, 9);
  ctx.fill();
  ctx.stroke();

  // Vertical Knit Rib Stitch Lines on the Cuff
  ctx.lineWidth = 2.5;
  for (let rx = -hr + 6; rx <= hr - 6; rx += 12) {
    ctx.beginPath();
    ctx.moveTo(rx, by - 10);
    ctx.lineTo(rx, by + 8);
    ctx.stroke();
  }

  // Bouncy Fluffy Pom-Pom on Top of Beanie!
  const pomY = by - hr - 10 + Math.sin(t * 7) * 2.5;
  ctx.fillStyle = PAL.beanie;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(headX - 2, pomY, 14, 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Comic Marker Speech Bubble for Stickman Beanie.
 */
export function beanieBubble(ctx, x, y, text, {
  tailX = 360, tailY = 480, col = PAL.beanie, a = 1,
} = {}) {
  if (a <= 0.01 || !text) return;
  ctx.save();
  ctx.globalAlpha *= a;

  ctx.font = '900 24px system-ui, sans-serif';
  const tw = Math.min(480, Math.max(220, ctx.measureText(text).width + 52));
  const th = 68;
  const left = x - tw / 2, top = y - th / 2;

  // Hard comic shadow
  ctx.fillStyle = PAL.ink;
  roundRect(ctx, left + 6, top + 6, tw, th, 18);
  ctx.fill();

  ctx.fillStyle = '#fffdf7';
  roundRect(ctx, left, top, tw, th, 18);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  roundRect(ctx, left, top, tw, th, 18);
  ctx.stroke();

  // Pointer tail
  const bx = clamp(tailX, left + 30, left + tw - 30);
  ctx.fillStyle = '#fffdf7';
  ctx.beginPath();
  ctx.moveTo(bx - 14, top + th - 2);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(bx + 14, top + th - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.beginPath();
  ctx.moveTo(bx - 14, top + th);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(bx + 14, top + th);
  ctx.stroke();

  ctx.fillStyle = col;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y, tw - 32);

  ctx.restore();
}

/**
 * Sketchpad Sticky Insight Card in the lower half of the 1080x1920 frame.
 */
export function beanieCard(ctx, x, y, w, h, {
  tag = '', titleStr = '', subStr = '', stat = '', statSub = '', col = PAL.beanie, a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const left = x - w / 2, top = y - h / 2;

  // Hard comic drop shadow
  ctx.fillStyle = PAL.ink;
  roundRect(ctx, left + 8, top + 8, w, h, 18);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, left, top, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  roundRect(ctx, left, top, w, h, 18);
  ctx.stroke();

  // Left color stripe
  ctx.fillStyle = col;
  roundRect(ctx, left + 16, top + 18, 10, h - 36, 5);
  ctx.fill();

  const textW = stat ? w - 260 : w - 64;
  const tx = left + 42;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  if (tag) {
    ctx.fillStyle = col;
    ctx.font = '800 18px ui-monospace, monospace';
    ctx.fillText(tag, tx, top + 34, textW);
  }
  if (titleStr) {
    ctx.fillStyle = PAL.ink;
    ctx.font = '900 27px system-ui, sans-serif';
    ctx.fillText(titleStr, tx, top + 76, textW);
  }
  if (subStr) {
    ctx.fillStyle = PAL.muted;
    ctx.font = '600 21px system-ui, sans-serif';
    ctx.fillText(subStr, tx, top + h - 32, textW);
  }

  if (stat) {
    const bx = left + w - 204, by = top + 18, bw = 184, bh = h - 36;
    ctx.fillStyle = PAL.hoodie;
    roundRect(ctx, bx, by, bw, bh, 12);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    roundRect(ctx, bx, by, bw, bh, 12);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.ink;
    ctx.font = '900 30px ui-monospace, monospace';
    ctx.fillText(stat, bx + bw / 2, by + bh * 0.43, bw - 16);
    if (statSub) {
      ctx.fillStyle = PAL.beanieDark;
      ctx.font = '800 15px ui-monospace, monospace';
      ctx.fillText(statSub, bx + bw / 2, by + bh * 0.77, bw - 16);
    }
  }

  ctx.restore();
}
