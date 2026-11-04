// Lukisan Gua Purba kit — Prehistoric cave art on rough karst limestone walls illuminated by flickering torchlight.
// Inspired by the 51,200-year-old Maros-Pangkep (Sulawesi) & Sangkulirang (Kalimantan) rock art.

const { clamp, lerp, ease, hrand, mulberry32 } = AM.lib;
const TAU = Math.PI * 2;

export const PAL = {
  rockDk: '#16110d',
  rock: '#2b2119',
  rockLt: '#473628',
  calcite: '#d8c5a3',
  ochreRed: '#a8321e',
  ochreBright: '#cb4827',
  ochreYellow: '#d48b35',
  ochreDark: '#5e1a10',
  charcoal: '#14100d',
  bone: '#ebd9bc',
  fireCore: '#fff0c4',
  fireWarm: '#ff9638',
};

/** Step time at ~8 fps so cave figures move like firelight stop-motion on stone. */
export const stepT = (t, fps = 8) => Math.floor(t * fps) / fps;

/** Flickering torchlight intensity in [0.82 .. 1.12]. */
export function torchFlicker(t) {
  return 0.96 + 0.08 * Math.sin(t * 7.3) + 0.06 * Math.sin(t * 13.7 + 2.1) + 0.04 * Math.cos(t * 23.1);
}

const WALL_CACHE = new Map();

/**
 * Build (or fetch cached) offscreen limestone cavern wall of width `W` and height `H = 1920`.
 * Includes rock strata, cracks, mineral speckles, and stalactite/stalagmite silhouettes.
 */
export function caveWall(key, W = 3600, H = 1920, seed = 1) {
  const k = `${key}:${W}x${H}`;
  if (WALL_CACHE.has(k)) return WALL_CACHE.get(k);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const rng = mulberry32(seed * 97 + 13);

  // Base warm limestone gradient
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1c1510');
  bg.addColorStop(0.25, '#35281e');
  bg.addColorStop(0.55, '#423225');
  bg.addColorStop(0.82, '#2f231a');
  bg.addColorStop(1, '#18120d');
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // Rock patches & calcite mineral mottling
  for (let i = 0; i < 420; i++) {
    const x = rng() * W, y = rng() * H;
    const rx = 40 + rng() * 160, ry = 25 + rng() * 110;
    const bright = rng() > 0.45;
    g.fillStyle = bright
      ? `rgba(185,148,108,${0.03 + rng() * 0.05})`
      : `rgba(18,12,8,${0.06 + rng() * 0.08})`;
    g.beginPath();
    g.ellipse(x, y, rx, ry, (rng() - 0.5) * 1.2, 0, TAU);
    g.fill();
  }

  // Fine stone grain speckles
  for (let i = 0; i < 3200; i++) {
    const x = rng() * W, y = rng() * H, r = 1 + rng() * 2.8;
    g.fillStyle = rng() > 0.5 ? 'rgba(230,200,160,0.06)' : 'rgba(12,8,5,0.10)';
    g.fillRect(x, y, r, r);
  }

  // Jagged rock crevices / fissures
  g.lineCap = 'round';
  for (let i = 0; i < 48; i++) {
    let cx = rng() * W, cy = 180 + rng() * (H - 360);
    g.strokeStyle = `rgba(15,10,7,${0.25 + rng() * 0.35})`;
    g.lineWidth = 1.5 + rng() * 3.5;
    g.beginPath();
    g.moveTo(cx, cy);
    const steps = 6 + Math.floor(rng() * 8);
    for (let s = 0; s < steps; s++) {
      cx += (rng() - 0.45) * 65;
      cy += (rng() - 0.3) * 55;
      g.lineTo(cx, cy);
    }
    g.stroke();
  }

  WALL_CACHE.set(k, c);
  return c;
}

/** Draw a chalky/pigment stroke path with rough multi-pass texture. */
export function chalkStroke(g, pts, { col = PAL.ochreRed, width = 7, alpha = 0.9, seed = 1 } = {}) {
  if (pts.length < 2) return;
  g.save();
  g.strokeStyle = col;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (let pass = 0; pass < 3; pass++) {
    g.globalAlpha = alpha * (pass === 0 ? 0.85 : 0.42);
    g.lineWidth = width * (pass === 0 ? 1 : 0.65);
    g.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const jx = (hrand(i * 7 + pass, seed) - 0.5) * 3.5;
      const jy = (hrand(i * 11 + pass, seed + 5) - 0.5) * 3.5;
      if (i === 0) g.moveTo(pts[i][0] + jx, pts[i][1] + jy);
      else g.lineTo(pts[i][0] + jx, pts[i][1] + jy);
    }
    g.stroke();
  }
  g.restore();
}

/**
 * Iconic negative hand stencil (Cap Tangan Sembur Oker Merah):
 * Sprayed hematite pigment ring with splattered dots around a negative limestone palm & 5 fingers.
 */
export function handStencil(g, x, y, { s = 1, rot = 0, col = PAL.ochreRed, left = true, reveal = 1, seed = 1 } = {}) {
  const rev = clamp(reveal);
  if (rev <= 0.01) return;
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.scale((left ? 1 : -1) * s, s);

  // 1. Blown ochre halo cloud
  const rad = 125;
  const grad = g.createRadialGradient(0, -10, 18, 0, -10, rad);
  grad.addColorStop(0, col);
  grad.addColorStop(0.58, col);
  grad.addColorStop(1, 'rgba(168,50,30,0)');
  g.globalAlpha = 0.82 * rev;
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, -10, rad, 0, TAU);
  g.fill();

  // 2. Mouth-blown pigment splatter droplets around the stencil
  const rng = mulberry32(seed * 53 + 7);
  const nDots = Math.floor(140 * rev);
  g.fillStyle = col;
  for (let i = 0; i < nDots; i++) {
    const a = rng() * TAU;
    const d = 32 + rng() * 92;
    const dx = Math.cos(a) * d, dy = -10 + Math.sin(a) * d;
    const r = 1.4 + rng() * 4.2;
    g.globalAlpha = (0.35 + rng() * 0.55) * rev;
    g.beginPath();
    g.arc(dx, dy, r, 0, TAU);
    g.fill();
  }

  // 3. Negative hand silhouette (unpainted rock tone inside the spray)
  g.globalAlpha = 0.92 * rev;
  g.fillStyle = '#463527';
  g.strokeStyle = PAL.ochreDark;
  g.lineWidth = 2.5;
  g.beginPath();
  // Wrist & palm
  g.ellipse(0, 18, 30, 36, 0, 0, TAU);
  g.fill();
  g.fillRect(-22, 36, 44, 42);
  // 5 outstretched fingers (thumb + 4 fingers)
  const fingers = [
    { x: -28, y: 10, a: -0.68, len: 46, w: 9.5 },
    { x: -19, y: -14, a: -0.26, len: 64, w: 8.5 },
    { x: -5, y: -20, a: -0.04, len: 72, w: 8.8 },
    { x: 10, y: -17, a: 0.16, len: 66, w: 8.5 },
    { x: 23, y: -6, a: 0.42, len: 52, w: 7.8 },
  ];
  for (const f of fingers) {
    g.save();
    g.translate(f.x, f.y);
    g.rotate(f.a);
    g.beginPath();
    g.roundRect(-f.w, -f.len, f.w * 2, f.len + 10, f.w);
    g.fill();
    g.stroke();
    g.restore();
  }
  g.restore();
}

/**
 * Prehistoric cave animal painted in red ochre & charcoal with interior striping/stippling
 * (as seen in Leang Tedongnge & Leang Karampuang warty pigs and anoa).
 * kind: 'babi-rusa' | 'banteng' | 'rusa' | 'perahu'
 */
export function caveBeast(g, kind, { x = 0, y = 0, s = 1, face = 1, t = 0, run = 0, col = PAL.ochreRed, reveal = 1 } = {}) {
  const rev = clamp(reveal);
  if (rev <= 0.01) return;
  const st = stepT(t, 8);
  const stride = Math.sin(st * 9) * run;

  g.save();
  g.translate(x, y);
  g.scale(face * s, s);
  g.globalAlpha = rev;

  if (kind === 'perahu') {
    // Austronesian prehistoric cave spirit boat with rowers & sun motif
    g.strokeStyle = col;
    g.lineWidth = 8;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-150, -35);
    g.quadraticCurveTo(0, 35, 150, -35);
    g.stroke();
    g.beginPath();
    g.moveTo(-130, -15);
    g.quadraticCurveTo(0, 48, 130, -15);
    g.stroke();
    // High curved prows
    g.beginPath();
    g.moveTo(-150, -35); g.quadraticCurveTo(-175, -85, -140, -105);
    g.moveTo(150, -35); g.quadraticCurveTo(175, -85, 140, -105);
    g.stroke();
    // Standing rowers / ancestors
    for (let i = -3; i <= 3; i++) {
      const rx = i * 32;
      const sway = Math.sin(st * 5 + i) * 4 * run;
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(rx, -2);
      g.lineTo(rx + sway, -58);
      g.stroke();
      g.fillStyle = col;
      g.beginPath();
      g.arc(rx + sway, -70, 8, 0, TAU);
      g.fill();
      // Oar
      g.lineWidth = 3.5;
      g.beginPath();
      g.moveTo(rx + sway, -38);
      g.lineTo(rx - 14 - sway, 28);
      g.stroke();
    }
    g.restore();
    return;
  }

  const bob = Math.abs(Math.sin(st * 9)) * 8 * run;
  g.translate(0, -bob);

  // Legs (4 legs with running phase)
  const legPairs = [
    [-68, 25, stride * 0.55],
    [-46, 25, -stride * 0.55],
    [52, 22, -stride * 0.55],
    [72, 22, stride * 0.55],
  ];
  g.strokeStyle = PAL.ochreDark;
  g.lineWidth = 8;
  g.lineCap = 'round';
  for (const [lx, ly, ang] of legPairs) {
    g.save();
    g.translate(lx, ly);
    g.rotate(ang);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(-6, 42);
    g.lineTo(4, 82);
    g.stroke();
    g.restore();
  }

  // Heavy barrel body (Sulawesi cave pig / banteng style with striped mineral infill)
  g.fillStyle = col;
  g.strokeStyle = PAL.ochreDark;
  g.lineWidth = 7;
  g.beginPath();
  if (kind === 'babi-rusa') {
    g.moveTo(-105, 10);
    g.bezierCurveTo(-95, -75, 45, -82, 105, -22);
    g.lineTo(148, -8); // snout
    g.lineTo(142, 12);
    g.bezierCurveTo(75, 52, -75, 56, -105, 10);
  } else if (kind === 'banteng') {
    g.moveTo(-120, 8);
    g.bezierCurveTo(-105, -95, 25, -105, 95, -42); // high shoulder hump
    g.lineTo(140, -25);
    g.lineTo(132, 14);
    g.bezierCurveTo(60, 50, -85, 52, -120, 8);
  } else {
    // 'rusa' (slender deer)
    g.moveTo(-95, 8);
    g.bezierCurveTo(-85, -52, 45, -55, 88, -28);
    g.lineTo(118, -78); // long neck
    g.lineTo(145, -72);
    g.lineTo(110, -10);
    g.bezierCurveTo(55, 38, -75, 38, -95, 8);
  }
  g.closePath();
  g.globalAlpha = 0.55 * rev;
  g.fill();
  g.globalAlpha = 0.95 * rev;
  g.stroke();

  // Interior diagonal ochre hatching (authentic Maros-Pangkep infill pattern!)
  g.save();
  g.clip();
  g.strokeStyle = PAL.ochreBright;
  g.lineWidth = 4;
  for (let hx = -120; hx <= 140; hx += 16) {
    g.beginPath();
    g.moveTo(hx, -95);
    g.lineTo(hx - 28, 65);
    g.stroke();
  }
  // Facial warts / spots for babi-rusa
  if (kind === 'babi-rusa') {
    g.fillStyle = PAL.ochreDark;
    for (const [wx, wy, wr] of [[112, -12, 7], [126, -4, 6], [96, -20, 8]]) {
      g.beginPath(); g.arc(wx, wy, wr, 0, TAU); g.fill();
    }
  }
  g.restore();

  // Dorsal bristles / tusks / horns / antlers
  g.strokeStyle = PAL.ochreDark;
  g.lineWidth = 5;
  if (kind === 'babi-rusa') {
    // Bristled crest along spine
    for (let bx = -75; bx <= 65; bx += 14) {
      g.beginPath();
      g.moveTo(bx, -56);
      g.lineTo(bx - 5, -74);
      g.stroke();
    }
    // Curved tusks
    g.strokeStyle = PAL.bone;
    g.lineWidth = 4.5;
    g.beginPath();
    g.moveTo(136, -4);
    g.quadraticCurveTo(152, -32, 126, -42);
    g.stroke();
  } else if (kind === 'banteng') {
    // Sweeping crescent horns
    g.strokeStyle = PAL.bone;
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(115, -42);
    g.quadraticCurveTo(148, -92, 102, -108);
    g.moveTo(115, -42);
    g.quadraticCurveTo(85, -88, 65, -72);
    g.stroke();
  } else if (kind === 'rusa') {
    // Branching antlers
    g.lineWidth = 4.5;
    g.beginPath();
    g.moveTo(122, -78); g.lineTo(105, -135);
    g.moveTo(114, -102); g.lineTo(132, -118);
    g.moveTo(109, -118); g.lineTo(88, -126);
    g.stroke();
  }

  // Tail
  g.strokeStyle = PAL.ochreDark;
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(-102, 4);
  g.quadraticCurveTo(-132, -12 + Math.sin(st * 10) * 10, -138, 18);
  g.stroke();

  g.restore();
}

/**
 * Prehistoric hunter / therianthrope figure painted in ochre & charcoal.
 */
export function caveHunter(g, {
  x = 0, y = 0, s = 1, face = 1, t = 0,
  run = 0, spear = false, bow = false, dance = 0, therianthrope = false,
  col = PAL.ochreDark, reveal = 1,
} = {}) {
  const rev = clamp(reveal);
  if (rev <= 0.01) return;
  const st = stepT(t, 8);
  const cyc = Math.sin(st * 9);

  g.save();
  g.translate(x, y);
  g.scale(face * s, s);
  g.globalAlpha = rev;

  const jump = Math.abs(cyc) * (run * 10 + dance * 16);
  g.translate(0, -jump);

  g.strokeStyle = col;
  g.fillStyle = col;
  g.lineCap = 'round';
  g.lineJoin = 'round';

  // Torso (elongated dynamic cave-art silhouette)
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(0, -95);
  g.quadraticCurveTo(8 * (run - dance * cyc), -48, 0, 0);
  g.stroke();

  // Head (with bird/horned therianthrope snout if therianthrope=true)
  g.beginPath();
  g.arc(4, -116, 14, 0, TAU);
  g.fill();
  if (therianthrope) {
    // Beak/muzzle &耳朵/feathers like Leang Bulu' Sipong 4 & Leang Karampuang
    g.beginPath();
    g.moveTo(12, -122);
    g.lineTo(38, -114);
    g.lineTo(12, -108);
    g.closePath();
    g.fill();
    g.lineWidth = 4.5;
    g.beginPath();
    g.moveTo(-2, -126); g.lineTo(-18, -148);
    g.moveTo(4, -128); g.lineTo(-6, -152);
    g.stroke();
    // Tail streamer
    g.beginPath();
    g.moveTo(-4, -4);
    g.quadraticCurveTo(-36, 12, -48, 34);
    g.stroke();
  }

  // Legs
  const lA = cyc * 0.65 * run + Math.sin(st * 7) * 0.45 * dance;
  const lB = -cyc * 0.65 * run - Math.sin(st * 7) * 0.45 * dance;
  g.lineWidth = 8;
  for (const [ang, knee] of [[lA, 1], [lB, -1]]) {
    g.save();
    g.rotate(ang);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(12 * knee, 38);
    g.lineTo(4 * knee, 78);
    g.stroke();
    g.restore();
  }

  // Arms & weapons
  g.lineWidth = 6.5;
  if (spear) {
    const thrust = Math.sin(st * 8) * 12;
    g.beginPath();
    g.moveTo(2, -82);
    g.lineTo(-22, -108);
    g.lineTo(16 + thrust, -96);
    g.stroke();
    // Front guide arm
    g.beginPath();
    g.moveTo(2, -82);
    g.lineTo(38, -72);
    g.stroke();
    // Long wooden spear
    g.strokeStyle = PAL.ochreBright;
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(-65 + thrust, -112);
    g.lineTo(115 + thrust, -68);
    g.stroke();
  } else if (bow) {
    g.beginPath();
    g.moveTo(2, -82); g.lineTo(46, -80);
    g.moveTo(2, -82); g.lineTo(-18, -84);
    g.stroke();
    // Curved bow & arrow
    g.lineWidth = 4;
    g.beginPath();
    g.arc(32, -80, 34, -1.1, 1.1);
    g.stroke();
    g.beginPath();
    g.moveTo(-16, -80); g.lineTo(68, -80);
    g.stroke();
  } else {
    // Dancing / reaching arms (e.g., touching the wall to make hand stencils)
    const wave = Math.sin(st * 8) * 0.35 * (dance + 0.3);
    g.beginPath();
    g.moveTo(0, -82);
    g.lineTo(-32, -115 + wave * 30);
    g.moveTo(0, -82);
    g.lineTo(36, -118 - wave * 30);
    g.stroke();
  }

  g.restore();
}

/**
 * Draw cavern stalactites (top) and stalagmites (bottom) in screen space (1080x1920).
 */
export function stalactites(ctx, t, { seed = 1, torchX = 540, torchY = 960 } = {}) {
  const rng = mulberry32(seed * 31 + 5);
  ctx.save();
  ctx.fillStyle = '#0d0906';
  // Top ceiling stalactites
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let x = 0; x <= 1080; x += 45) {
    const spike = (x % 90 === 0) ? 75 + rng() * 110 : 28 + rng() * 35;
    ctx.lineTo(x, spike);
  }
  ctx.lineTo(1080, 0);
  ctx.closePath();
  ctx.fill();

  // Bottom floor rocks & stalagmites
  ctx.beginPath();
  ctx.moveTo(0, 1920);
  for (let x = 0; x <= 1080; x += 54) {
    const h = 55 + rng() * 85;
    ctx.lineTo(x, 1920 - h);
  }
  ctx.lineTo(1080, 1920);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Warm flickering torchlight illumination & dark cavern falloff in screen space.
 */
export function torchLight(ctx, x, y, t, { r = 820, dark = 0.78, showTorch = true } = {}) {
  const fl = torchFlicker(t);
  const rad = r * fl;

  ctx.save();
  // 1. Warm additive fire glow
  ctx.globalCompositeOperation = 'screen';
  const glow = ctx.createRadialGradient(x, y, 20, x, y, rad * 0.95);
  glow.addColorStop(0, 'rgba(255,195,110,0.34)');
  glow.addColorStop(0.45, 'rgba(235,120,45,0.16)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Dark cavern shadow outside the torch pool
  ctx.globalCompositeOperation = 'source-over';
  const shadow = ctx.createRadialGradient(x, y, rad * 0.28, x, y, rad * 1.15);
  shadow.addColorStop(0, 'rgba(12,8,5,0)');
  shadow.addColorStop(0.65, `rgba(12,8,5,${dark * 0.55})`);
  shadow.addColorStop(1, `rgba(8,5,3,${dark})`);
  ctx.fillStyle = shadow;
  ctx.fillRect(0, 0, 1080, 1920);

  // 3. Optional handheld flaming torch in foreground corner
  if (showTorch) {
    const tx = lerp(880, x + 220, 0.35), ty = 1580 + Math.sin(t * 3.2) * 10;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(-0.18 + Math.sin(t * 2.5) * 0.03);
    // Wooden handle wrapped in bark
    ctx.fillStyle = '#24160c';
    ctx.fillRect(-14, 0, 28, 380);
    ctx.fillStyle = '#3d2515';
    ctx.fillRect(-18, -18, 36, 34);
    // Multi-layered flickering flame
    for (let k = 0; k < 3; k++) {
      const sway = Math.sin(t * (11 + k * 4) + k) * (14 - k * 3);
      const fh = (125 - k * 28) * fl;
      const fw = 42 - k * 10;
      ctx.fillStyle = k === 0 ? 'rgba(235,90,25,0.85)' : k === 1 ? 'rgba(255,175,55,0.92)' : PAL.fireCore;
      ctx.beginPath();
      ctx.moveTo(-fw, -12);
      ctx.quadraticCurveTo(-fw * 0.8, -fh * 0.6, sway, -fh);
      ctx.quadraticCurveTo(fw * 0.8, -fh * 0.6, fw, -12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 4. Rising glowing fire embers
  for (let i = 0; i < 24; i++) {
    const u = (t * (0.18 + hrand(i, 1) * 0.16) + hrand(i, 2)) % 1;
    const ex = x + (hrand(i, 3) - 0.5) * 760 + Math.sin(t * 2.5 + i) * 28;
    const ey = 1750 - u * 1550;
    const er = (1 - u) * (2.5 + hrand(i, 4) * 3.5);
    ctx.fillStyle = i % 2 === 0 ? PAL.fireCore : PAL.fireWarm;
    ctx.globalAlpha = (1 - u) * 0.75;
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Chiseled stone/ochre title & archaeological caption plaque.
 */
export function stonePlaque(ctx, title, x, y, { sub = '', tag = '', size = 50, alpha = 1 } = {}) {
  const a = clamp(alpha);
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `800 ${size}px Georgia, "Times New Roman", serif`;
  const tw = Math.max(ctx.measureText(title).width, sub ? ctx.measureText(sub).width * 0.65 : 0);
  const w = Math.max(460, tw + 110);
  const h = sub ? (tag ? 156 : 126) : 88;

  ctx.translate(x, y);
  // Chiseled dark stone slab with ochre border
  ctx.fillStyle = 'rgba(22,15,10,0.88)';
  ctx.strokeStyle = PAL.ochreBright;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 12);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(235,217,188,0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 8);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (tag) {
    ctx.fillStyle = PAL.ochreYellow;
    ctx.font = `700 22px sans-serif`;
    ctx.fillText(tag.toUpperCase(), 0, -h / 2 + 28);
  }
  ctx.fillStyle = PAL.bone;
  ctx.font = `800 ${size}px Georgia, "Times New Roman", serif`;
  ctx.fillText(title, 0, tag ? 4 : (sub ? -16 : 2));
  if (sub) {
    ctx.fillStyle = '#d4b894';
    ctx.font = `italic 27px Georgia, "Times New Roman", serif`;
    ctx.fillText(sub, 0, tag ? 46 : 30);
  }
  ctx.restore();
}
