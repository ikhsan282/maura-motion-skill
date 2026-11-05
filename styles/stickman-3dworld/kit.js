// 69 · STICKMAN 3D WORLD — Perspective 3D Grid & Ball-Joint Poser Mannequin Kit
// Unique Character ("Si Manekin Sendi Bola 3D"):
// - Shaded 3D sphere head with 3D orientation cross-contours & glowing cyan visor eyes
// - 3D beveled chest & pelvis blocks with specular lighting
// - Shaded 3D cylindrical limbs connected by glowing golden/copper Ball-and-Socket joints
// - Perspective ground shadow ellipse & 3D interactive blocks/stairs/pedestals

const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

export const PAL = {
  sky0: '#090d18',
  sky1: '#121f38',
  floor0: '#0f242c',
  floor1: '#071118',
  cyan: '#38e4ff',
  emerald: '#4ce0b3',
  gold: '#f6c453',
  coral: '#ff6b6b',
  purple: '#a371f7',
  wood0: '#f3d5a5',
  wood1: '#c88d52',
  wood2: '#7a4b24',
  muted: '#8b9bb4',
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
 * Draw 3D Perspective World background with horizon glow, vanishing-point floor grid,
 * and floating 3D depth particles.
 */
export function world3dBg(ctx, t = 0, {
  horizonY = 485, floorY = 770, accent = PAL.cyan,
} = {}) {
  const W = 1080, H = 1920;
  ctx.save();

  // Sky gradient above horizon
  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, PAL.sky0);
  sky.addColorStop(1, PAL.sky1);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizonY);

  // Perspective floor plane below horizon
  const fl = ctx.createLinearGradient(0, horizonY, 0, H);
  fl.addColorStop(0, PAL.floor0);
  fl.addColorStop(0.35, '#0b1822');
  fl.addColorStop(1, PAL.floor1);
  ctx.fillStyle = fl;
  ctx.fillRect(0, horizonY, W, H - horizonY);

  // Vanishing-point perspective rays from (540, horizonY)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizonY, W, 420);
  ctx.clip();

  ctx.strokeStyle = rgba(accent, 0.22);
  ctx.lineWidth = 2;
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(540 + i * 24, horizonY);
    ctx.lineTo(540 + i * 195, horizonY + 420);
    ctx.stroke();
  }

  // Horizontal perspective depth lines (closer together near horizon, wider near viewer)
  const drift = (t * 0.35) % 1;
  for (let j = 0; j < 9; j++) {
    const u = (j + drift) / 9;
    const py = horizonY + Math.pow(u, 2.1) * 410;
    ctx.strokeStyle = rgba(accent, 0.08 + u * 0.25);
    ctx.lineWidth = 1 + u * 2;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(W, py);
    ctx.stroke();
  }
  ctx.restore();

  // Glowing horizon beam
  const hg = ctx.createLinearGradient(0, horizonY - 18, 0, horizonY + 18);
  hg.addColorStop(0, rgba(accent, 0));
  hg.addColorStop(0.5, rgba(accent, 0.55));
  hg.addColorStop(1, rgba(accent, 0));
  ctx.fillStyle = hg;
  ctx.fillRect(0, horizonY - 18, W, 36);

  // Main stage platform rim at floorY
  ctx.strokeStyle = rgba(accent, 0.5);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(40, floorY);
  ctx.lineTo(1040, floorY);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw a 3D Isometric/Perspective Box with shaded Top, Front, and Right Side faces.
 */
export function draw3dBox(ctx, x, bottomY, w, h, depth = 36, {
  col = PAL.cyan, label = '', subLabel = '', a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  const left = x - w / 2;
  const top = bottomY - h;
  const dx = depth * 0.75;
  const dy = -depth * 0.52;

  // Top face (brightest)
  ctx.fillStyle = rgba(col, 0.42);
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + dx, top + dy);
  ctx.lineTo(left + w + dx, top + dy);
  ctx.lineTo(left + w, top);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right side face (darkest)
  ctx.fillStyle = rgba(col, 0.16);
  ctx.beginPath();
  ctx.moveTo(left + w, top);
  ctx.lineTo(left + w + dx, top + dy);
  ctx.lineTo(left + w + dx, bottomY + dy);
  ctx.lineTo(left + w, bottomY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Front face (medium)
  ctx.fillStyle = '#101d2e';
  ctx.fillRect(left, top, w, h);
  ctx.fillStyle = rgba(col, 0.26);
  ctx.fillRect(left, top, w, h);
  ctx.strokeRect(left, top, w, h);

  if (label) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, top + h * (subLabel ? 0.42 : 0.5), w - 14);
  }
  if (subLabel) {
    ctx.fillStyle = col;
    ctx.font = '700 15px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(subLabel, x, top + h * 0.74, w - 14);
  }

  ctx.restore();
}

/**
 * Top 3D HUD Header Banner.
 */
export function world3dHeader(ctx, badge, mainTitle, subTitle, {
  rightStat = '3D SIMULASI', col = PAL.cyan, a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  ctx.fillStyle = 'rgba(12, 20, 34, 0.94)';
  roundRect(ctx, 42, 46, 996, 146, 20);
  ctx.fill();
  ctx.strokeStyle = rgba(col, 0.45);
  ctx.lineWidth = 2.5;
  roundRect(ctx, 42, 46, 996, 146, 20);
  ctx.stroke();

  // 3D Cube Icon Badge on Left
  draw3dBox(ctx, 132, 162, 108, 72, 22, { col, label: badge });

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = col;
  ctx.font = '800 18px ui-monospace, monospace';
  ctx.fillText('DIMENSI PRODUKTIVITAS • STICKMAN 3D WORLD', 540, 82, 580);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 33px system-ui, sans-serif';
  ctx.fillText(mainTitle, 540, 122, 590);

  ctx.fillStyle = PAL.muted;
  ctx.font = '600 21px system-ui, sans-serif';
  ctx.fillText(subTitle, 540, 160, 590);

  // Right status box
  ctx.fillStyle = rgba(PAL.gold, 0.14);
  roundRect(ctx, 848, 68, 168, 102, 14);
  ctx.fill();
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 2;
  roundRect(ctx, 848, 68, 168, 102, 14);
  ctx.stroke();
  ctx.fillStyle = PAL.gold;
  ctx.font = '900 24px ui-monospace, monospace';
  ctx.fillText(rightStat, 932, 119, 150);

  ctx.restore();
}

/**
 * Helper to draw a 3D shaded cylinder limb between two points (x1, y1) and (x2, y2).
 */
function draw3dLimb(ctx, x1, y1, x2, y2, radius = 9, cLight = PAL.wood0, cMid = PAL.wood1, cDark = PAL.wood2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ang = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(ang);

  const grad = ctx.createLinearGradient(0, -radius, 0, radius);
  grad.addColorStop(0, cLight);
  grad.addColorStop(0.45, cMid);
  grad.addColorStop(1, cDark);

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#2a180a';
  ctx.lineWidth = 2;
  roundRect(ctx, -radius * 0.4, -radius, len + radius * 0.8, radius * 2, radius);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Helper to draw a 3D metallic Ball-and-Socket joint sphere at (x, y).
 */
function draw3dJointBall(ctx, x, y, r = 8.5, col = PAL.cyan) {
  ctx.save();
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.45, col);
  g.addColorStop(1, '#092230');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#091520';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Unique 3D Wooden/Cyber Poser Mannequin Stickman ("Si Manekin Sendi Bola 3D")!
 * Features 3D shaded limbs, glowing ball-and-socket joints, 3D torso block,
 * and 3D contoured sphere head with glowing visor eyes!
 */
export function mannequin3DStickman(ctx, x, floorY, pose = 'climb', {
  facing = 1, col = PAL.cyan, t = 0, a = 1, label = '',
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;

  // Perspective 3D ground contact shadow ellipse
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.beginPath();
  ctx.ellipse(x, floorY + 4, 46, 13, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(col, 0.45);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.translate(x, floorY);
  ctx.scale(facing, 1);

  const bob = Math.sin(t * 4) * 4;
  const hip = [0, -108 + bob];
  const neck = [4, -196 + bob];
  const head = [8, -236 + bob];

  let lKnee = [-18, -54], lFoot = [-22, -4];
  let rKnee = [22, -54], rFoot = [24, -4];
  let lElbow = [-28, -148 + bob], lHand = [-14, -118 + bob];
  let rElbow = [30, -152 + bob], rHand = [54, -138 + bob];

  if (pose === 'climb') {
    const sw = Math.sin(t * 5) * 14;
    lKnee = [-16, -54 - sw * 0.5]; lFoot = [-20, -4 - Math.max(0, sw)];
    rKnee = [26, -68 + sw * 0.5]; rFoot = [30, -22 + Math.max(0, -sw)];
    lElbow = [-24, -155 + sw]; lHand = [12, -172 + sw];
    rElbow = [32, -162 - sw]; rHand = [58, -184 - sw];
  } else if (pose === 'push-cube') {
    const push = Math.sin(t * 6) * 4;
    neck[0] = 18 + push;
    head[0] = 24 + push;
    lKnee = [-26, -52]; lFoot = [-44, -4];
    rKnee = [24, -56]; rFoot = [16, -4];
    lElbow = [36, -152 + bob]; lHand = [66 + push, -148 + bob];
    rElbow = [42, -168 + bob]; rHand = [68 + push, -168 + bob];
  } else if (pose === 'victory') {
    lElbow = [-36, -198 + bob]; lHand = [-44, -242 + bob];
    rElbow = [40, -198 + bob]; rHand = [48, -242 + bob];
  } else if (pose === 'juggle') {
    const jg = Math.sin(t * 8) * 18;
    lElbow = [-34, -152]; lHand = [-42, -185 + jg];
    rElbow = [36, -152]; rHand = [46, -185 - jg];
  }

  // 1. Back Arm & Back Leg (for true 3D depth ordering)
  draw3dLimb(ctx, hip[0] - 8, hip[1], lKnee[0], lKnee[1], 8.5, '#d9b382', '#a67342', '#5c3b1e');
  draw3dLimb(ctx, lKnee[0], lKnee[1], lFoot[0], lFoot[1], 7.5, '#d9b382', '#a67342', '#5c3b1e');
  draw3dJointBall(ctx, lKnee[0], lKnee[1], 8, col);
  draw3dJointBall(ctx, lFoot[0], lFoot[1], 7.5, col);

  draw3dLimb(ctx, neck[0] - 10, neck[1] + 10, lElbow[0], lElbow[1], 7.5, '#d9b382', '#a67342', '#5c3b1e');
  draw3dLimb(ctx, lElbow[0], lElbow[1], lHand[0], lHand[1], 7, '#d9b382', '#a67342', '#5c3b1e');
  draw3dJointBall(ctx, lElbow[0], lElbow[1], 7.5, col);
  draw3dJointBall(ctx, lHand[0], lHand[1], 7, col);

  // 2. 3D Poser Mannequin Pelvis & Ribcage Blocks
  draw3dLimb(ctx, hip[0], hip[1], neck[0], neck[1], 14, PAL.wood0, PAL.wood1, PAL.wood2);
  // Glowing 3D Core Chest Plate
  ctx.fillStyle = '#122236';
  ctx.strokeStyle = col;
  ctx.lineWidth = 3;
  roundRect(ctx, neck[0] - 18, neck[1] + 8, 36, 46, 10);
  ctx.fill();
  ctx.stroke();
  // 3D Core Sphere inside chest
  draw3dJointBall(ctx, neck[0], neck[1] + 31, 8, PAL.gold);
  // Pelvis Ball Joint
  draw3dJointBall(ctx, hip[0], hip[1], 11, col);

  // 3. Front Leg & Front Arm
  draw3dLimb(ctx, hip[0] + 8, hip[1], rKnee[0], rKnee[1], 9, PAL.wood0, PAL.wood1, PAL.wood2);
  draw3dLimb(ctx, rKnee[0], rKnee[1], rFoot[0], rFoot[1], 8, PAL.wood0, PAL.wood1, PAL.wood2);
  draw3dJointBall(ctx, rKnee[0], rKnee[1], 8.5, col);
  draw3dJointBall(ctx, rFoot[0], rFoot[1], 8, col);

  draw3dJointBall(ctx, neck[0] + 6, neck[1] + 12, 9, col);
  draw3dLimb(ctx, neck[0] + 6, neck[1] + 12, rElbow[0], rElbow[1], 8, PAL.wood0, PAL.wood1, PAL.wood2);
  draw3dLimb(ctx, rElbow[0], rElbow[1], rHand[0], rHand[1], 7.5, PAL.wood0, PAL.wood1, PAL.wood2);
  draw3dJointBall(ctx, rElbow[0], rElbow[1], 8, col);
  draw3dJointBall(ctx, rHand[0], rHand[1], 7.5, PAL.gold);

  // 4. 3D Shaded Sphere Head with 3D Equator/Meridian Cross-Lines & Cyber Visor!
  const hr = 28;
  const hg = ctx.createRadialGradient(head[0] - 10, head[1] - 10, 4, head[0], head[1], hr);
  hg.addColorStop(0, '#fff2d6');
  hg.addColorStop(0.55, PAL.wood1);
  hg.addColorStop(1, '#4a2c12');
  ctx.fillStyle = hg;
  ctx.strokeStyle = '#241408';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(head[0], head[1], hr, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // 3D Mannequin Construction Cross-Contours on Head Sphere
  ctx.strokeStyle = 'rgba(40, 22, 8, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(head[0], head[1], hr, 8, -0.1, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(head[0] + 6, head[1], 10, hr, 0, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();

  // Glowing 3D Visor Band on Face
  ctx.fillStyle = '#0b1624';
  ctx.strokeStyle = col;
  ctx.lineWidth = 2.5;
  roundRect(ctx, head[0] - 4, head[1] - 10, 28, 14, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(head[0] + 12, head[1] - 3, 3.5, 0, TAU);
  ctx.fill();

  ctx.restore();

  if (label) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 18, 30, 0.92)';
    roundRect(ctx, x - 78, floorY + 20, 156, 30, 8);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    roundRect(ctx, x - 78, floorY + 20, 156, 30, 8);
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.font = '800 14px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, floorY + 35, 142);
    ctx.restore();
  }
}

/**
 * 3D World Insight Card in the lower half of the 1080x1920 frame.
 */
export function world3dCard(ctx, x, y, w, h, {
  tag = '', titleStr = '', subStr = '', stat = '', statSub = '', col = PAL.cyan, a = 1,
} = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const left = x - w / 2, top = y - h / 2;

  ctx.fillStyle = 'rgba(11, 19, 32, 0.95)';
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
