// Maura Motion style kit: VAS YUNANI BLACK-FIGURE (Attic Black-Figure Pottery, ~530 BCE).
// Terracotta amphora frieze with cylindrical shading, pottery crackle, scrolling meander (Greek key) and palmette
// bands, lustrous black-slip silhouettes, crimson/chalk-white slip accents, and bright incised terracotta linework.
import { clamp, lerp, ease, hrand, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  clay: '#D46834',
  clayBright: '#E98952',
  clayDeep: '#9E3E18',
  clayRim: '#5C200C',
  slip: '#14100E',
  slipSoft: '#241C18',
  incise: '#EB8F58',
  crimson: '#7F2321',
  chalk: '#F4E8D1',
  gold: '#F6B94D',
};

export const FONT = {
  serif: 'Playfair Display',
  body: 'Inter',
  mono: 'JetBrains Mono',
};

// ---------------------------------------------------------------- ornamental borders
/** Classic Greek Key (Meander) frieze band that scrolls horizontally with `scroll`. */
export function meander(ctx, x, y, w, size = 34, scroll = 0, { fg = PAL.slip, bg = PAL.clayBright } = {}) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, size); ctx.clip();
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, size);
  ctx.strokeStyle = fg; ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x, y + 2); ctx.lineTo(x + w, y + 2);
  ctx.moveTo(x, y + size - 2); ctx.lineTo(x + w, y + size - 2);
  ctx.stroke();

  const unit = size * 1.15;
  const off = ((scroll % unit) + unit) % unit;
  const pad = 6;
  const s = size - pad * 2;
  ctx.lineWidth = Math.max(2.6, size * 0.095);
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  for (let gx = x - unit + off; gx < x + w + unit; gx += unit) {
    const x0 = gx, y0 = y + pad;
    ctx.moveTo(x0, y0 + s);
    ctx.lineTo(x0, y0);
    ctx.lineTo(x0 + s * 0.82, y0);
    ctx.lineTo(x0 + s * 0.82, y0 + s * 0.68);
    ctx.lineTo(x0 + s * 0.32, y0 + s * 0.68);
    ctx.lineTo(x0 + s * 0.32, y0 + s * 0.34);
    ctx.lineTo(x0 + s * 0.56, y0 + s * 0.34);
    ctx.moveTo(x0 + s * 0.82, y0 + s);
    ctx.lineTo(x0 + unit, y0 + s);
  }
  ctx.stroke();
  ctx.restore();
}

/** Archaic lotus-and-palmette neck/foot band. */
export function palmettes(ctx, x, y, w, h = 42, scroll = 0) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = PAL.slip;
  ctx.fillRect(x, y, w, h);
  const unit = 64;
  const off = ((scroll * 0.7 % unit) + unit) % unit;
  for (let gx = x - unit + off; gx < x + w + unit; gx += unit) {
    const cx = gx + unit / 2, by = y + h - 6;
    // Terracotta fan petals
    ctx.fillStyle = PAL.clay;
    for (let i = -3; i <= 3; i++) {
      ctx.save();
      ctx.translate(cx, by);
      ctx.rotate(i * 0.24);
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.36, 3.3, h * 0.28, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = PAL.crimson;
    ctx.beginPath(); ctx.arc(cx, by - 3, 5.5, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, by - 2, 10, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }
  ctx.restore();
}

/** Running wave scroll (archaic sea crest pattern). */
export function waves(ctx, y, w, t = 0, scroll = 0, { h = 46, fill = PAL.slip } = {}) {
  const unit = 76;
  const off = (((scroll + t * 38) % unit) + unit) % unit;
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, y + h);
  for (let gx = -unit * 2 + off; gx < w + unit * 2; gx += unit) {
    ctx.quadraticCurveTo(gx + unit * 0.35, y - h * 0.35, gx + unit * 0.72, y + h * 0.08);
    ctx.quadraticCurveTo(gx + unit * 0.48, y + h * 0.42, gx + unit, y + h * 0.38);
  }
  ctx.lineTo(w, y + h + 120);
  ctx.lineTo(0, y + h + 120);
  ctx.closePath();
  ctx.fill();
  // Incised wave curl line
  ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let gx = -unit * 2 + off; gx < w + unit * 2; gx += unit) {
    ctx.moveTo(gx + 10, y + h * 0.42);
    ctx.quadraticCurveTo(gx + unit * 0.38, y - h * 0.05, gx + unit * 0.62, y + h * 0.16);
  }
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- stage
/** Full-bleed cylindrical Attic vase stage with meander bands, crackle glaze, and museum header. */
export function stage(ctx, t, {
  scroll = 0,
  title = 'ATTIC BLACK-FIGURE',
  subtitle = 'AMPHORA · ATHENA ~530 SM',
  chapter = 'ADEGAN I',
  glow = 0.25,
} = {}) {
  const W = 1080, H = 1920;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Dark museum top & bottom neck/foot frame
  ctx.fillStyle = PAL.slip;
  ctx.fillRect(0, 0, W, H);

  // Cylindrical terracotta body (y: 165 .. 1680)
  const fy = 165, fh = 1515;
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, PAL.clayDeep);
  grad.addColorStop(0.18, PAL.clay);
  grad.addColorStop(0.5, PAL.clayBright);
  grad.addColorStop(0.82, PAL.clay);
  grad.addColorStop(1, PAL.clayDeep);
  ctx.fillStyle = grad;
  ctx.fillRect(0, fy, W, fh);

  // Warm firelight radial glow in the center
  if (glow > 0) {
    const flk = 1 + Math.sin(t * 7.3) * 0.06 + Math.cos(t * 11.7) * 0.04;
    const rg = ctx.createRadialGradient(W * 0.5, fy + fh * 0.44, 40, W * 0.5, fy + fh * 0.44, 540 * flk);
    rg.addColorStop(0, `rgba(255, 200, 110, ${0.24 * glow})`);
    rg.addColorStop(0.6, `rgba(235, 130, 65, ${0.1 * glow})`);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, fy, W, fh);
  }

  // Cached pottery wheel striations + fine crackle glaze
  const tex = cached('vas-crackle-v1', () => {
    const c = makeCanvas(540, 540), g = c.getContext('2d');
    g.strokeStyle = 'rgba(40, 14, 6, 0.09)';
    g.lineWidth = 1;
    for (let i = 0; i < 42; i++) {
      let cx = hrand(i, 1) * 540, cy = hrand(i, 2) * 540;
      g.beginPath(); g.moveTo(cx, cy);
      for (let s = 0; s < 5; s++) {
        cx += (hrand(i * 10 + s, 3) - 0.5) * 65;
        cy += (hrand(i * 10 + s, 4) - 0.5) * 65;
        g.lineTo(cx, cy);
      }
      g.stroke();
    }
    for (let y = 0; y < 540; y += 9) {
      g.fillStyle = (y % 18 === 0) ? 'rgba(20, 8, 4, 0.025)' : 'rgba(255, 210, 160, 0.02)';
      g.fillRect(0, y, 540, 2);
    }
    return c;
  });
  const ox = ((scroll * 0.5) % 540 + 540) % 540;
  for (let tx = -ox; tx < W; tx += 540) {
    for (let ty = fy; ty < fy + fh; ty += 540) {
      ctx.drawImage(tex, tx, ty);
    }
  }

  // Top & Bottom ornamental bands
  palmettes(ctx, 0, 122, W, 43, scroll);
  meander(ctx, 0, 165, W, 38, scroll);
  meander(ctx, 0, 1642, W, 38, -scroll);
  palmettes(ctx, 0, 1680, W, 43, -scroll);

  // Ground line inside the frieze
  ctx.fillStyle = PAL.slip;
  ctx.fillRect(0, 1285, W, 10);
  ctx.strokeStyle = PAL.incise;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 1290); ctx.lineTo(W, 1290); ctx.stroke();

  // Top Museum Inscription Bar
  ctx.fillStyle = PAL.chalk;
  ctx.font = `700 22px '${FONT.mono}'`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(subtitle, 56, 52);

  // Chapter pill on top right
  const cw = ctx.measureText(chapter).width + 36;
  roundRect(ctx, W - 56 - cw, 32, cw, 40, 8);
  ctx.fillStyle = PAL.crimson; ctx.fill();
  ctx.strokeStyle = PAL.clayBright; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = PAL.chalk;
  ctx.textAlign = 'center';
  ctx.fillText(chapter, W - 56 - cw / 2, 53);

  // Main Vase Title
  ctx.fillStyle = PAL.clayBright;
  ctx.font = `700 32px '${FONT.serif}'`;
  ctx.textAlign = 'left';
  ctx.fillText(title, 56, 94, W - 112);

  ctx.restore();
}

// ---------------------------------------------------------------- black-figure actors & props
/**
 * Attic black-figure character in profile with incised terracotta anatomical & drapery details.
 * Bottom of feet at (x, y). `dir` = 1 (facing right) or -1 (facing left).
 */
export function figure(ctx, x, y, s = 1, {
  t = 0,
  dir = 1,
  walk = 0,
  kneel = 0,
  chained = false,
  beard = true,
  helmet = false,
  laurel = false,
  robe = 'chiton', // 'chiton' | 'tunic' | 'heroic'
  crimsonCloak = true,
  armR = 0.3, // angle in rad (0 = down, positive = forward/up)
  armL = -0.2,
  prop = null, // 'torch' | 'bolt' | 'bow' | 'spear' | 'shield' | 'scroll'
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);

  const stride = Math.sin(t * 5.5) * 0.38 * walk;
  const bob = Math.abs(Math.cos(t * 5.5)) * 7 * walk;
  const ky = kneel * 42;
  ctx.translate(0, -bob + ky);

  // Helper for black-slip limb + incised inner line
  const limb = (x0, y0, a1, l1, a2, l2, w1, w2) => {
    const x1 = x0 + Math.sin(a1) * l1, y1 = y0 + Math.cos(a1) * l1;
    const x2 = x1 + Math.sin(a1 + a2) * l2, y2 = y1 + Math.cos(a1 + a2) * l2;
    ctx.strokeStyle = PAL.slip;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = w1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.lineWidth = w2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    // Incised muscle contour
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x0 + 2, y0 + 8);
    ctx.quadraticCurveTo(x1 + 5, (y0 + y1) / 2, x1, y1 - 4);
    ctx.stroke();
    return [x2, y2, a1 + a2];
  };

  // Back leg & Front leg
  const legA1 = -stride - kneel * 0.7, legK1 = kneel ? 1.2 : Math.max(0, stride * 0.5);
  const legA2 = stride + kneel * 0.5, legK2 = kneel ? 1.1 : Math.max(0, -stride * 0.5);
  limb(-10, -118, legA1, 60, -legK1, 56, 22, 16);
  limb(10, -118, legA2, 60, -legK2, 56, 22, 16);

  // Back arm
  const [lhx, lhy] = limb(-12, -218, armL, 52, 0.35, 48, 17, 13);

  // Torso (archaic triangular chest in profile/three-quarter + tunic/chiton)
  ctx.fillStyle = PAL.slip;
  ctx.beginPath();
  ctx.moveTo(-28, -234);
  ctx.lineTo(28, -234);
  ctx.lineTo(22, -162);
  ctx.lineTo(robe === 'chiton' ? 34 : 26, robe === 'chiton' ? -72 : -112);
  ctx.lineTo(robe === 'chiton' ? -34 : -26, robe === 'chiton' ? -72 : -112);
  ctx.lineTo(-22, -162);
  ctx.closePath();
  ctx.fill();

  // Crimson himation sash accent
  if (crimsonCloak) {
    ctx.fillStyle = PAL.crimson;
    ctx.beginPath();
    ctx.moveTo(-24, -228);
    ctx.lineTo(22, -198);
    ctx.lineTo(26, -135);
    ctx.lineTo(-20, -158);
    ctx.closePath();
    ctx.fill();
  }

  // Incised torso anatomy & drapery folds
  ctx.strokeStyle = PAL.incise;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  // Pectoral & belt
  ctx.moveTo(-18, -202); ctx.quadraticCurveTo(2, -194, 18, -204);
  ctx.moveTo(-21, -162); ctx.lineTo(21, -162);
  // Vertical drapery pleats
  const skirtBot = robe === 'chiton' ? -75 : -114;
  for (let px = -18; px <= 18; px += 9) {
    ctx.moveTo(px * 0.8, -160);
    ctx.lineTo(px * 1.25, skirtBot);
  }
  // Decorative hem border
  ctx.moveTo(-26, skirtBot + 6); ctx.lineTo(26, skirtBot + 6);
  ctx.stroke();

  // Head & Neck in strict Attic profile
  ctx.fillStyle = PAL.slip;
  ctx.fillRect(-10, -252, 20, 22);
  ctx.beginPath();
  ctx.arc(-2, -274, 24, 0, TAU);
  // Archaic nose & chin profile
  ctx.moveTo(16, -284);
  ctx.lineTo(31, -271);
  ctx.lineTo(20, -267);
  ctx.lineTo(22, -254);
  ctx.lineTo(2, -250);
  ctx.closePath();
  ctx.fill();

  // Pointed archaic beard
  if (beard) {
    ctx.fillStyle = PAL.slip;
    ctx.beginPath();
    ctx.moveTo(12, -264);
    ctx.lineTo(32, -246);
    ctx.lineTo(8, -244);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(10, -262); ctx.lineTo(25, -249);
    ctx.moveTo(6, -258); ctx.lineTo(19, -247);
    ctx.stroke();
  }

  // Corinthian helmet + horsehair crest
  if (helmet) {
    ctx.fillStyle = PAL.crimson;
    ctx.beginPath();
    ctx.arc(-4, -292, 34, Math.PI * 0.85, Math.PI * 0.1, false);
    ctx.quadraticCurveTo(18, -318, -18, -310);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  // Laurel wreath
  if (laurel) {
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-22, -280); ctx.quadraticCurveTo(2, -292, 20, -284); ctx.stroke();
  }

  // Archaic frontal eye drawn on profile face (signature Greek vase trait!)
  ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(9, -277, 6.5, 3.8, 0, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = PAL.incise;
  ctx.beginPath(); ctx.arc(10, -277, 2, 0, TAU); ctx.fill();
  // Hair curls
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.arc(-16 + i * 6, -288, 4, 0, Math.PI);
  }
  ctx.stroke();

  // Front arm
  const [rhx, rhy] = limb(12, -218, armR, 52, 0.45, 48, 18, 14);

  // Chains if bound (Prometheus)
  if (chained) {
    ctx.strokeStyle = PAL.chalk; ctx.lineWidth = 4;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(rhx, rhy); ctx.lineTo(rhx + 48, rhy - 55);
    ctx.moveTo(lhx, lhy); ctx.lineTo(lhx - 48, lhy - 55);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Held prop in front hand
  if (prop === 'torch') {
    torch(ctx, rhx, rhy, 0.9, t);
  } else if (prop === 'bolt') {
    thunderbolt(ctx, rhx, rhy, 0.9, t);
  } else if (prop === 'bow') {
    ctx.save(); ctx.translate(rhx, rhy);
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.arc(0, 0, 48, -1.2, 1.2); ctx.stroke();
    ctx.strokeStyle = PAL.chalk; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(-1.2) * 48, Math.sin(-1.2) * 48); ctx.lineTo(Math.cos(1.2) * 48, Math.sin(1.2) * 48); ctx.stroke();
    ctx.restore();
  } else if (prop === 'spear') {
    ctx.save(); ctx.translate(rhx, rhy); ctx.rotate(-0.4);
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-60, 40); ctx.lineTo(95, -90); ctx.stroke();
    ctx.fillStyle = PAL.chalk;
    ctx.beginPath(); ctx.moveTo(108, -102); ctx.lineTo(86, -92); ctx.lineTo(96, -80); ctx.closePath(); ctx.fill();
    ctx.restore();
  } else if (prop === 'shield') {
    ctx.save(); ctx.translate(lhx + 8, lhy);
    ctx.fillStyle = PAL.slip;
    ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = PAL.crimson;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.chalk; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/** Sacred Fennel-Stalk Torch (Narthex) with animated archaic flame tongues. */
export function torch(ctx, x, y, s = 1, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // Stalk
  ctx.strokeStyle = PAL.slip; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 32); ctx.lineTo(14, -44); ctx.stroke();
  ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(1, 28); ctx.lineTo(14, -40); ctx.stroke();
  // Outer crimson/gold flame
  const sway = Math.sin(t * 9) * 7;
  ctx.fillStyle = PAL.crimson;
  ctx.beginPath();
  ctx.moveTo(14, -42);
  ctx.quadraticCurveTo(-18, -75, 14 + sway, -122);
  ctx.quadraticCurveTo(44, -75, 14, -42);
  ctx.fill();
  // Inner chalk/gold core
  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.moveTo(14, -46);
  ctx.quadraticCurveTo(-4, -72, 14 + sway * 0.6, -102);
  ctx.quadraticCurveTo(30, -72, 14, -46);
  ctx.fill();
  ctx.fillStyle = PAL.chalk;
  ctx.beginPath(); ctx.arc(14, -64, 7, 0, TAU); ctx.fill();
  ctx.restore();
}

/** Zeus's archaic double thunderbolt (keraunos). */
export function thunderbolt(ctx, x, y, s = 1, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(-0.35 + Math.sin(t * 12) * 0.05);
  ctx.fillStyle = PAL.gold;
  ctx.strokeStyle = PAL.slip;
  ctx.lineWidth = 3;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dir * 58, -16);
    ctx.lineTo(dir * 38, -4);
    ctx.lineTo(dir * 78, 0);
    ctx.lineTo(dir * 38, 4);
    ctx.lineTo(dir * 58, 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = PAL.chalk;
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
}

/** Black-figure heraldic Eagle with incised feather rows. */
export function eagle(ctx, x, y, s = 1, t = 0, { dir = -1 } = {}) {
  const flap = Math.sin(t * 7) * 0.35;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  // Wings
  for (const wy of [-1, 1]) {
    ctx.save();
    ctx.rotate(wy * 0.25 + flap * wy * 0.5);
    ctx.fillStyle = PAL.slip;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-50, -55, -110, -35);
    ctx.quadraticCurveTo(-75, 18, 0, 14);
    ctx.closePath();
    ctx.fill();
    // Incised feathers
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.2;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-14 * i, -12);
      ctx.lineTo(-18 * i - 12, 6);
      ctx.stroke();
    }
    ctx.restore();
  }
  // Body & Hooked beak
  ctx.fillStyle = PAL.slip;
  ctx.beginPath();
  ctx.ellipse(0, 6, 36, 18, -0.2, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(34, -4, 14, 0, TAU);
  ctx.moveTo(44, -8); ctx.quadraticCurveTo(60, -4, 52, 8); ctx.lineTo(42, 4);
  ctx.fill();
  // Eye
  ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(37, -5, 3.5, 0, TAU); ctx.stroke();
  ctx.restore();
}

/** Wax-and-feather wings for Icarus & Daedalus, with optional melting feathers & wax drops. */
export function wings(ctx, x, y, s = 1, t = 0, { melt = 0 } = {}) {
  const flap = Math.sin(t * 6) * 0.28;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.scale(side, 1);
    ctx.rotate(-0.2 + flap);
    // Upper wax shoulder frame
    ctx.fillStyle = PAL.crimson;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.quadraticCurveTo(65, -55, 135, -30);
    ctx.lineTo(125, -8);
    ctx.quadraticCurveTo(60, -24, 0, 12);
    ctx.closePath();
    ctx.fill();
    // Black-slip primary feathers with chalk tips
    const nFeathers = 8;
    for (let i = 0; i < nFeathers; i++) {
      const drop = melt > 0 && (i % 2 === 1) ? melt * (35 + i * 18) : 0;
      const rot = melt > 0 && (i % 2 === 1) ? melt * 0.5 : 0;
      ctx.save();
      ctx.translate(18 + i * 14, -14 + i * 2 + drop);
      ctx.rotate(rot);
      ctx.fillStyle = PAL.slip;
      ctx.beginPath();
      ctx.ellipse(0, 26, 7.5, 34 - i * 1.8, -0.15, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = PAL.incise; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(4, 52 - i * 2); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}

/** Monumental Trojan Horse on wheels in black-figure silhouette with incised timber & warrior window. */
export function trojanHorse(ctx, x, y, s = 1, t = 0, { showInside = 0, roll = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Wooden base platform
  ctx.fillStyle = PAL.crimson;
  roundRect(ctx, -155, -28, 310, 18, 4);
  ctx.fill();
  ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.5; ctx.stroke();

  // Four spoked wheels
  for (const wx of [-105, 105]) {
    ctx.save();
    ctx.translate(wx, -16);
    ctx.rotate(roll);
    ctx.fillStyle = PAL.slip;
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke();
    for (let a = 0; a < 4; a++) {
      const ang = (a * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * -22, Math.sin(ang) * -22);
      ctx.lineTo(Math.cos(ang) * 22, Math.sin(ang) * 22);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Legs
  ctx.fillStyle = PAL.slip;
  for (const lx of [-105, -72, 68, 102]) {
    ctx.fillRect(lx - 11, -135, 22, 108);
  }
  // Body barrel + arched neck + head
  ctx.beginPath();
  ctx.roundRect(-125, -235, 240, 110, 38);
  ctx.moveTo(70, -220);
  ctx.quadraticCurveTo(118, -325, 92, -375);
  ctx.lineTo(152, -345);
  ctx.lineTo(144, -315);
  ctx.lineTo(115, -312);
  ctx.quadraticCurveTo(132, -245, 110, -165);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(-122, -215);
  ctx.quadraticCurveTo(-168, -195, -155, -110);
  ctx.quadraticCurveTo(-132, -135, -122, -185);
  ctx.fill();

  // Incised timber planks & geometric mane
  ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let py = -215; py <= -145; py += 22) {
    ctx.moveTo(-115, py); ctx.lineTo(105, py);
  }
  // Eye & bridle
  ctx.arc(114, -348, 5, 0, TAU);
  ctx.moveTo(92, -372); ctx.lineTo(148, -322);
  ctx.stroke();

  // Cutaway hatch showing Greek warriors hidden inside
  if (showInside > 0.02) {
    ctx.save();
    ctx.globalAlpha = clamp(showInside, 0, 1);
    roundRect(ctx, -82, -218, 156, 76, 14);
    ctx.fillStyle = PAL.clayBright; ctx.fill();
    ctx.strokeStyle = PAL.gold; ctx.lineWidth = 3; ctx.stroke();
    // Three helmeted warrior silhouettes inside
    for (let i = 0; i < 3; i++) {
      const kx = -48 + i * 48, ky = -152;
      ctx.fillStyle = PAL.slip;
      ctx.beginPath(); ctx.arc(kx, ky - 30, 13, 0, TAU); ctx.fill();
      ctx.fillRect(kx - 14, ky - 16, 28, 16);
      ctx.fillStyle = PAL.crimson;
      ctx.beginPath(); ctx.arc(kx, ky - 36, 16, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(kx + 10, ky - 45); ctx.lineTo(kx + 18, ky - 10); ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

/** Doric colonnade / temple backdrop. */
export function columns(ctx, x, y, w, h, { count = 4 } = {}) {
  ctx.save();
  // Pediment roof
  ctx.fillStyle = PAL.slip;
  ctx.beginPath();
  ctx.moveTo(x - 24, y - h);
  ctx.lineTo(x + w / 2, y - h - 78);
  ctx.lineTo(x + w + 24, y - h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.incise; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillRect(x - 16, y - h, w + 32, 22);

  // Columns
  const step = count > 1 ? (w - 36) / (count - 1) : 0;
  for (let i = 0; i < count; i++) {
    const cx = x + 18 + i * step;
    ctx.fillStyle = PAL.slip;
    ctx.fillRect(cx - 16, y - h + 22, 32, h - 22);
    // Capital
    ctx.fillRect(cx - 24, y - h + 22, 48, 12);
    // Incised vertical flutes
    ctx.strokeStyle = PAL.incise; ctx.lineWidth = 1.8;
    for (const fx of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.moveTo(cx + fx, y - h + 36);
      ctx.lineTo(cx + fx, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Inscribed Greek pottery tablet / callout plaque. */
export function plaque(ctx, x, y, w, h, {
  tag = 'INSKRIPSI',
  title = '',
  sub = '',
  alpha = 1,
} = {}) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  roundRect(ctx, x + 6, y + 6, w, h, 14);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();

  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = PAL.slip; ctx.fill();
  ctx.strokeStyle = PAL.incise; ctx.lineWidth = 3; ctx.stroke();

  roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 10);
  ctx.strokeStyle = PAL.crimson; ctx.lineWidth = 2; ctx.stroke();

  // Tag
  ctx.fillStyle = PAL.clayBright;
  ctx.font = `700 20px '${FONT.mono}'`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(tag, x + 26, y + 36, w - 52);

  // Main title
  ctx.fillStyle = PAL.chalk;
  ctx.font = `700 38px '${FONT.serif}'`;
  ctx.fillText(title, x + 26, y + h * 0.54, w - 52);

  if (sub) {
    ctx.fillStyle = PAL.incise;
    ctx.font = `600 22px '${FONT.body}'`;
    ctx.fillText(sub, x + 26, y + h - 30, w - 52);
  }
  ctx.restore();
}

