// Maura Motion style kit: KOLASE DAUN & BUNGA (Pressed Leaf, Petal, Twig & Seed Herbarium Collage).
// Tactile dried leaves with veins, pressed flower petals, twigs, seeds, and botanical specimen cards
// arranged on warm cotton herbarium paper.

import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  paper: '#efe6d2',
  paperDk: '#dccfae',
  leafDk: '#355828',
  leaf: '#4e7d3a',
  leafLt: '#7aa14f',
  leafGold: '#c99738',
  leafRust: '#b5532f',
  petalRed: '#a83a32',
  petalPink: '#d97583',
  petalGold: '#e5a93c',
  petalPurple: '#6e3b5c',
  cream: '#e8d9b0',
  twig: '#593e25',
  ink: '#3a2e1e',
  tape: 'rgba(238,226,198,0.85)',
};

export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };

export const stepT = (t, fps = 12) => Math.floor(t * fps) / fps;

export function cam(ctx, x = 540, y = 960, z = 1, rot = 0, fy = 960) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, fy);
  if (rot) ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-x, -y);
}

export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));

/** Draw warm cotton herbarium sheet background with botanical border & pressed fiber flecks. */
export function bg(ctx, t = 0) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const c = cached('kolase-herbarium-bg', () => {
    const m = makeCanvas(1080, 1920), g = m.getContext('2d');
    const gr = g.createRadialGradient(540, 960, 100, 540, 960, 1200);
    gr.addColorStop(0, '#f4ecda');
    gr.addColorStop(0.7, '#e8dcc2');
    gr.addColorStop(1, '#d6c5a3');
    g.fillStyle = gr;
    g.fillRect(0, 0, 1080, 1920);

    // Botanical double-ruled frame border
    g.strokeStyle = 'rgba(75,58,38,0.38)';
    g.lineWidth = 3;
    g.strokeRect(48, 48, 984, 1824);
    g.lineWidth = 1.2;
    g.strokeRect(60, 60, 960, 1800);

    // Pressed plant fiber flecks on the cotton paper
    const rng = mulberry32(29);
    for (let i = 0; i < 1400; i++) {
      const x = rng() * 1080, y = rng() * 1920;
      g.fillStyle = rng() > 0.4 ? 'rgba(95,75,45,0.06)' : 'rgba(255,250,240,0.08)';
      g.fillRect(x, y, 2 + rng() * 4, 1.5);
    }
    return m;
  });
  ctx.drawImage(c, 0, 0);
  ctx.restore();
}

/** Small paper mounting strip (`pita perekat herbarium`) holding stems/leaves to the sheet. */
export function herbariumTape(ctx, x, y, w = 78, h = 22, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(-w / 2 + 2, -h / 2 + 3, w, h);
  ctx.fillStyle = PAL.tape;
  ctx.strokeStyle = 'rgba(90,70,45,0.28)';
  ctx.lineWidth = 1.2;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

/** Draw a dried wooden twig / vine branch along control points. */
export function twig(ctx, pts, { width = 9, col = PAL.twig, tape = false } = {}) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Shadow
  ctx.strokeStyle = 'rgba(40,28,15,0.22)';
  ctx.lineWidth = width;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px + 5, py + 7) : ctx.lineTo(px + 5, py + 7)));
  ctx.stroke();
  // Main bark
  ctx.strokeStyle = col;
  ctx.lineWidth = width;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.stroke();
  if (tape && pts.length >= 2) {
    const mid = pts[Math.floor(pts.length / 2)];
    herbariumTape(ctx, mid[0], mid[1], 72, 20, 0.35);
  }
  ctx.restore();
}

/**
 * Draw a pressed botanical leaf with midrib, lateral veins, and drop shadow.
 */
export function leaf(ctx, x, y, len = 180, wid = 65, ang = 0, col = PAL.leaf, {
  t = 0, veins = true, tape = false, serrate = false,
} = {}) {
  const st = stepT(t);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang + Math.sin(st * 1.5 + x * 0.02) * 0.025);

  // Soft pressed shadow
  ctx.fillStyle = 'rgba(35,25,12,0.18)';
  ctx.beginPath();
  ctx.moveTo(4, 6);
  ctx.quadraticCurveTo(len * 0.5 + 4, -wid + 6, len + 4, 6);
  ctx.quadraticCurveTo(len * 0.5 + 4, wid + 6, 4, 6);
  ctx.fill();

  // Petiole (leaf stem)
  ctx.strokeStyle = PAL.twig;
  ctx.lineWidth = Math.max(3, wid * 0.08);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-len * 0.12, 0);
  ctx.lineTo(8, 0);
  ctx.stroke();

  // Leaf blade
  ctx.fillStyle = col;
  ctx.strokeStyle = 'rgba(40,30,15,0.45)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.48, -wid, len, 0);
  ctx.quadraticCurveTo(len * 0.48, wid, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Midrib & lateral veins
  if (veins) {
    ctx.strokeStyle = 'rgba(245,235,205,0.38)';
    ctx.lineWidth = Math.max(2, wid * 0.045);
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(len - 8, 0);
    for (let k = 1; k <= 5; k++) {
      const vx = (k / 6) * len;
      const vw = Math.sin((k / 6) * Math.PI) * wid * 0.42;
      ctx.moveTo(vx, 0); ctx.lineTo(vx + len * 0.08, -vw);
      ctx.moveTo(vx, 0); ctx.lineTo(vx + len * 0.08, vw);
    }
    ctx.stroke();
  }

  if (tape) {
    herbariumTape(ctx, len * 0.25, 0, 56, 18, Math.PI / 2);
  }
  ctx.restore();
}

/**
 * Draw a pressed multi-petal flower with stamen ring and shadow.
 */
export function flower(ctx, x, y, r = 90, petal = PAL.petalRed, core = PAL.cream, {
  t = 0, open = 1, n = 5,
} = {}) {
  const st = stepT(t);
  const op = clamp(open);
  ctx.save();
  ctx.translate(x, y);

  // Drop shadow
  ctx.fillStyle = 'rgba(35,25,12,0.18)';
  ctx.beginPath();
  ctx.arc(6, 8, r * 1.15 * op, 0, TAU);
  ctx.fill();

  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + Math.sin(st * 0.8 + i) * 0.02;
    ctx.save();
    ctx.rotate(a);
    ctx.fillStyle = petal;
    ctx.strokeStyle = 'rgba(50,25,18,0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(r * 0.72 * op, 0, r * 0.72 * op, r * 0.44 * op, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Subtle petal veins
    ctx.strokeStyle = 'rgba(255,235,210,0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r * 0.2 * op, 0);
    ctx.lineTo(r * 1.25 * op, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Central disk
  ctx.fillStyle = core;
  ctx.strokeStyle = 'rgba(40,20,15,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.44 * Math.max(0.35, op), 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = 'rgba(30,15,10,0.35)';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.25 * op, Math.sin(a) * r * 0.25 * op, r * 0.055, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw Rafflesia arnoldii with 5 warty brick-red lobes, diaphragm ring, central cavity, and optional scent waves.
 */
export function rafflesia(ctx, x, y, r = 240, { t = 0, open = 1, scent = false } = {}) {
  const st = stepT(t);
  const op = clamp(open);
  flower(ctx, x, y, r, PAL.petalRed, '#4a1512', { t, open: op, n: 5 });

  // Raised cream warts (bintik-bintik kutil putih khas Rafflesia) on all 5 lobes
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(244,228,196,0.88)';
  const rng = mulberry32(11);
  for (let i = 0; i < 48; i++) {
    const lobe = i % 5;
    const baseA = (lobe / 5) * TAU + (rng() - 0.5) * 0.52;
    const d = (0.48 + rng() * 0.78) * r * op;
    const wx = Math.cos(baseA) * d, wy = Math.sin(baseA) * d;
    const wr = (4 + rng() * 8) * op;
    ctx.beginPath();
    ctx.ellipse(wx, wy, wr * 1.3, wr * 0.85, baseA, 0, TAU);
    ctx.fill();
  }
  // Diaphragm rim collar around center cavity
  ctx.strokeStyle = '#c85a48';
  ctx.lineWidth = r * 0.08 * op;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42 * op, 0, TAU);
  ctx.stroke();

  // Optional wafting carrion scent waves
  if (scent && op > 0.5) {
    ctx.strokeStyle = 'rgba(110,145,65,0.55)';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    for (let k = -2; k <= 2; k++) {
      const ox = k * 58;
      ctx.beginPath();
      for (let sy = 0; sy <= 180; sy += 15) {
        const sx = ox + Math.sin(st * 4 + sy * 0.045 + k) * 22;
        if (sy === 0) ctx.moveTo(sx, -r * 0.2 - sy);
        else ctx.lineTo(sx, -r * 0.2 - sy);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Draw a Nepenthes pitcher plant (`Kantong Semar`) assembled from pressed leaves, coiled tendril, and spotted pitcher.
 */
export function kantongSemar(ctx, x, y, s = 1, { t = 0, lidOpen = 1, inflate = 1 } = {}) {
  const st = stepT(t);
  const inf = clamp(inflate);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.rotate(Math.sin(st * 1.6) * 0.03);

  // Leaf blade & coiled tendril (`sulur`)
  leaf(ctx, -230, -90, 190, 52, 0.25, PAL.leaf, { t, tape: true });
  ctx.strokeStyle = PAL.leafDk;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-55, -42);
  ctx.bezierCurveTo(-10, -20, -25, 110, 0, 85);
  ctx.stroke();

  // Pitcher cup (`kantong`)
  ctx.save();
  ctx.scale(inf, inf);
  ctx.fillStyle = 'rgba(35,25,12,0.18)';
  ctx.beginPath();
  ctx.ellipse(8, 12, 78, 135, 0, 0, TAU);
  ctx.fill();

  const gr = ctx.createLinearGradient(0, -120, 0, 130);
  gr.addColorStop(0, '#9bb856');
  gr.addColorStop(0.55, '#7a9642');
  gr.addColorStop(1, '#8c3b2b');
  ctx.fillStyle = gr;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-58, -105);
  ctx.bezierCurveTo(-72, -10, -88, 115, 0, 135);
  ctx.bezierCurveTo(88, 115, 72, -10, 58, -105);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Red blotches on the pitcher
  ctx.fillStyle = 'rgba(145,42,32,0.65)';
  const rng = mulberry32(43);
  for (let i = 0; i < 16; i++) {
    const bx = (rng() - 0.5) * 95, by = -65 + rng() * 165;
    ctx.beginPath();
    ctx.ellipse(bx, by, 8 + rng() * 10, 5 + rng() * 7, rng() * 2, 0, TAU);
    ctx.fill();
  }

  // Ribbed slippery peristome collar (`bibir kantong licin`)
  ctx.fillStyle = PAL.petalRed;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -105, 68, 20, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // Operculum lid (`tutup kantong penghasil nektar`)
  ctx.save();
  ctx.translate(48, -118);
  ctx.rotate(-0.35 * lidOpen);
  leaf(ctx, -95, -25, 115, 38, 0.15, PAL.petalRed, { t, veins: true });
  ctx.restore();

  ctx.restore();
  ctx.restore();
}

/**
 * Draw creatures assembled entirely from pressed leaves, petals, seeds, and twigs!
 * kind: 'lalat' | 'kupu' | 'burung'
 */
export function leafCreature(ctx, kind, { x = 0, y = 0, s = 1, t = 0, flap = 1 } = {}) {
  const st = stepT(t, 12);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  if (kind === 'lalat') {
    const buzz = Math.sin(st * 22) * 0.35 * flap;
    // Translucent pressed-leaf wings
    leaf(ctx, -8, -6, 62, 22, -2.1 + buzz, 'rgba(215,225,195,0.78)', { t, veins: true });
    leaf(ctx, 8, -6, 62, 22, -1.0 - buzz, 'rgba(215,225,195,0.78)', { t, veins: true });
    // Seed body & berry head
    ctx.fillStyle = '#263829';
    ctx.beginPath(); ctx.ellipse(0, 6, 18, 26, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = PAL.petalRed;
    ctx.beginPath(); ctx.arc(-7, -18, 7, 0, TAU); ctx.arc(7, -18, 7, 0, TAU); ctx.fill();
  } else if (kind === 'kupu') {
    const wAng = Math.sin(st * 8) * 0.22 * flap;
    // 4 pressed flower-petal & leaf wings
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.scale(side, 1);
      leaf(ctx, 6, -10, 145, 58, -0.55 + wAng, PAL.petalGold, { t, veins: true });
      leaf(ctx, 6, 12, 110, 46, 0.45 - wAng * 0.7, PAL.leafRust, { t, veins: true });
      ctx.restore();
    }
    // Twig body & antennae
    twig(ctx, [[0, -52], [0, 58]], { width: 9 });
    twig(ctx, [[0, -48], [-28, -88]], { width: 3 });
    twig(ctx, [[0, -48], [28, -88]], { width: 3 });
  } else if (kind === 'burung') {
    // Bird collage made of autumn leaves, petals, and twig legs
    twig(ctx, [[-18, 55], [-24, 115]], { width: 5 });
    twig(ctx, [[18, 55], [12, 115]], { width: 5 });
    // Tail feathers (3 narrow lance leaves)
    leaf(ctx, -65, 10, 120, 24, 2.7, PAL.leafRust, { t });
    leaf(ctx, -65, 10, 125, 24, 2.95, PAL.petalGold, { t });
    // Plump leaf body
    leaf(ctx, -75, 10, 175, 68, -0.12, PAL.leaf, { t });
    // Flapping wing leaf
    leaf(ctx, -15, -5, 130, 48, 2.4 + Math.sin(st * 7) * 0.25 * flap, PAL.leafGold, { t });
    // Round head leaf & seed eye & thorn beak
    leaf(ctx, 55, -42, 75, 42, -0.3, PAL.petalRed, { t, veins: false });
    ctx.fillStyle = PAL.twig;
    ctx.beginPath(); ctx.moveTo(118, -56); ctx.lineTo(148, -48); ctx.lineTo(118, -38); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PAL.cream;
    ctx.beginPath(); ctx.arc(92, -52, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = PAL.ink;
    ctx.beginPath(); ctx.arc(93, -52, 4.5, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export function title(ctx, str, x, y, { a = 1, size = 72 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = PAL.ink;
  ctx.font = `800 ${size}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
  ctx.restore();
}

export function caption(ctx, str, x, y, { a = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(58,46,30,0.8)';
  ctx.font = 'italic 600 36px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(str, x, y);
  ctx.restore();
}

/**
 * Draw a classic botanical museum specimen card (`Kartu Spesimen Herbarium`) taped to the sheet.
 */
export function herbariumLabel(ctx, heading, x, y, {
  latin = '', sub = '', tag = 'HERBARIUM NUSANTARA', size = 48, alpha = 1,
} = {}) {
  const a = clamp(alpha);
  if (a <= 0.01) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = a;
  ctx.font = `800 ${size}px Georgia, "Times New Roman", serif`;
  const tw = Math.max(ctx.measureText(heading).width, sub ? ctx.measureText(sub).width * 0.65 : 0);
  const w = Math.max(520, tw + 110);
  const h = sub ? 168 : 124;

  ctx.translate(x, y);
  // Drop shadow
  ctx.fillStyle = 'rgba(40,28,15,0.18)';
  ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);

  // Cream specimen card with double ink border
  ctx.fillStyle = '#fbf6e8';
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);

  // Corner mounting tapes
  herbariumTape(ctx, -w / 2 + 18, -h / 2 + 6, 70, 20, -0.4);
  herbariumTape(ctx, w / 2 - 18, -h / 2 + 6, 70, 20, 0.4);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PAL.petalRed;
  ctx.font = '700 20px sans-serif';
  ctx.fillText(latin ? `${tag} · ${latin}` : tag, 0, -h / 2 + 30);

  ctx.fillStyle = PAL.ink;
  ctx.font = `800 ${size}px Georgia, "Times New Roman", serif`;
  ctx.fillText(heading, 0, sub ? 4 : 14);

  if (sub) {
    ctx.fillStyle = '#5c4932';
    ctx.font = 'italic 26px Georgia, "Times New Roman", serif';
    ctx.fillText(sub, 0, 48);
  }
  ctx.restore();
}
