// Wayang Kulit Demo 3: "Gugurnya Gatotkaca — Senjata Konta di Langit Kurusetra" (10 shots).
import * as K from '/styles/wayang-kulit/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'serif', y: 1500 } };

let ctx, fx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('gong', 0.05, { gain: 0.55 });
  AM.sfx('keprak', 0.12, { gain: 0.5 });
  AM.sfx('drum_hit', C.malam.start + 0.1, { gain: 0.55 });
  AM.sfx('cempala', C.kresna.start + 0.1, { gain: 0.48 });
  AM.sfx('swoosh_up', C.terbang.start + 0.15, { gain: 0.45 });
  AM.sfx('keprak', C.karna.start + 0.15, { gain: 0.5 });
  AM.sfx('arrow', C.konta.start + 0.25, { gain: 0.5 });
  AM.sfx('magic', C.gugur.start + 0.2, { gain: 0.4 });
  AM.sfx('impact', C.runtuh.start + 0.4, { gain: 0.6 });
  AM.sfx('gong', C.moral.end + 0.15, { gain: 0.6 });
}

const u = (t, a, b) => clamp((t - a) / Math.max(0.001, b - a));

function camera(z = 1, cx = 540, cy = 960, rot = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, 960);
  ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}

function glowBehind(x, y, r, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,240,185,${a})`);
  g.addColorStop(0.45, `rgba(255,190,85,${a * 0.55})`);
  g.addColorStop(1, 'rgba(255,140,40,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** Carved Javanese mega mendung shadow clouds drifting across the top of the kelir. */
function shadowClouds(t, yBase = 540, alpha = 0.5) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = K.PAL.shadow;
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 380 + t * 45) % 1600) - 260;
    const cy = yBase + (i % 2) * 95;
    ctx.beginPath();
    ctx.arc(cx, cy, 78, 0, Math.PI * 2);
    ctx.arc(cx + 68, cy - 18, 62, 0, Math.PI * 2);
    ctx.arc(cx - 64, cy + 8, 54, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Sacred Konta Wijayandanu spear with golden halo and carved flame tip. */
function kontaSpear(t, x, y, ang, { s = 1, alpha = 0.95 } = {}) {
  glowBehind(x, y, 260 * s, 0.7 * alpha);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(s, s);
  ctx.fillStyle = K.PAL.shadow;
  ctx.fillRect(-260, -5, 260, 10);
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(95, 0);
  ctx.lineTo(0, 28);
  ctx.lineTo(18, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function render(t, AM) {
  // SHOT 1: hook — Gunungan opens on Gatotkaca soaring high in the night sky above Kurusetra
  if (t < C.malam.start) {
    const k = u(t, C.hook.start, C.malam.start);
    camera(1.0 + 0.06 * k, 540, 980);
    K.kelir(ctx, t, { flick: 1.6, warmth: 0.25 });
    shadowClouds(t, 620, 0.55);
    K.puppet(ctx, 'gatotkaca', {
      x: lerp(260, 560, ease.outCubic(k)),
      y: lerp(1380, 1080, ease.outCubic(k)) + Math.sin(t * 3) * 18,
      s: 0.95, face: 1, t, rods: false,
      armF: [1.75, 0.2], armB: [-0.7, 0.3],
    });
    const g = u(t, C.hook.start, C.hook.start + 1.15);
    if (g < 1) K.gunungan(ctx, 540 - ease.inCubic(g) * 1080, 1740, { s: 1.6, rot: -g * 0.85, depth: g * 0.3 });
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const ta = env(t, C.hook.start + 0.4, C.malam.start - 0.2, 0.4, 0.4);
    K.goldTitle(ctx, 'GATOTKACA GUGUR', 540, 250, { size: 70, alpha: ta });
    K.nameplate(ctx, 'KESATRIA PRINGGADANI', 540, 340, { alpha: ta * 0.9, size: 32 });
  }

  // SHOT 2: malam — Adipati Karna on his war chariot advancing with Kurawa troops at night
  else if (t < C.ancaman.start) {
    const k = u(t, C.malam.start, C.ancaman.start);
    camera(1.02 + 0.04 * k, 540, 1040);
    K.kelir(ctx, t, { flick: 1.8, warmth: 0.35 });
    const cx = lerp(880, 620, ease.outCubic(k)), cy = 1600;
    K.horse(ctx, cx - 390, cy, { s: 0.72, phase: (t * 1.6) % 1, face: -1 });
    K.chariot(ctx, cx, cy, { s: 0.84, wheel: -t * 5, face: -1, flag: t * 0.8 });
    K.puppet(ctx, 'karna', {
      x: cx + 40, y: cy - 210, s: 0.64, face: -1, t,
      armF: [1.3, 0.3], armB: [-0.3, 0.4],
    });
    for (let i = 0; i < 3; i++) {
      K.puppet(ctx, 'prajurit', {
        x: 220 + i * 160, y: 1790, s: 0.56, face: -1, t: t + i, depth: 0.25,
        armF: [1.1, 0.2], wobble: 2,
      });
    }
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    K.nameplate(ctx, 'ADIPATI KARNA', 540, 300, { alpha: env(t, C.malam.start + 0.3, C.ancaman.start, 0.35, 0.3) });
  }

  // SHOT 3: ancaman — Close-up on Karna holding the glowing Konta weapon meant for Arjuna
  else if (t < C.kresna.start) {
    const k = u(t, C.ancaman.start, C.kresna.start);
    camera(1.08 + 0.05 * k, 540, 1020);
    K.kelir(ctx, t, { flick: 1.5, warmth: 0.3 });
    const o = {
      x: 680, y: 1820, s: 1.1, face: -1, t,
      armF: [1.45 + Math.sin(t * 2.5) * 0.08, 0.25], armB: [-0.3, 0.4],
    };
    K.puppet(ctx, 'karna', o);
    const [hx, hy] = K.hand('karna', o, 'F');
    kontaSpear(t, hx - 40, hy - 20, Math.PI - 0.25, { s: 0.95 });
    K.puppet(ctx, 'arjuna', {
      x: 240, y: 1720, s: 0.72, face: 1, t, depth: 0.45, alpha: 0.5,
    });
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    K.nameplate(ctx, 'PUSAKA KONTA WIJAYANDANU', 540, 300, { alpha: env(t, C.ancaman.start + 0.3, C.kresna.start, 0.35, 0.3) });
  }

  // SHOT 4: kresna — Kresna blesses and dispatches Gatotkaca into the night battle
  else if (t < C.terbang.start) {
    const k = u(t, C.kresna.start, C.terbang.start);
    camera(1.02 + 0.04 * k, 540, 1020);
    K.kelir(ctx, t, { glow: 1.04 });
    K.puppet(ctx, 'kresna', {
      x: 310, y: 1810, s: 1.02, face: 1, t,
      armF: [1.55, 0.35], armB: [-0.25, 0.4],
    });
    K.puppet(ctx, 'gatotkaca', {
      x: 750, y: 1820, s: 1.08, face: -1, t,
      armF: [0.55, 0.85], armB: [-0.2, 0.45],
    });
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    K.nameplate(ctx, 'OTOT KAWAT TULANG BESI', 540, 300, { alpha: env(t, C.kresna.start + 0.3, C.terbang.start, 0.35, 0.3) });
  }

  // SHOT 5: terbang — Gatotkaca swoops down from the clouds scattering Kurawa soldiers below
  else if (t < C.karna.start) {
    const k = u(t, C.terbang.start, C.karna.start);
    camera(1.04, 540, 980);
    K.kelir(ctx, t, { flick: 2.0, warmth: 0.25 });
    shadowClouds(t * 1.4, 560, 0.6);
    const gx = lerp(220, 620, ease.inOutQuad(k));
    const gy = lerp(920, 1240, Math.sin(k * Math.PI));
    K.puppet(ctx, 'gatotkaca', {
      x: gx, y: gy, s: 1.02, face: 1, t, rods: false,
      armF: [1.8, 0.15], armB: [-0.8, 0.2],
    });
    for (let i = 0; i < 4; i++) {
      K.puppet(ctx, 'prajurit', {
        x: 320 + i * 190 + k * 90 * (i % 2 ? 1 : -1), y: 1810, s: 0.62, face: -1, t: t + i,
        armF: [1.2, 0.3], wobble: 3,
      });
    }
    K.gedebog(ctx, 1800);
  }

  // SHOT 6: karna — Cornered Karna aims the glowing Konta spear straight up into the sky
  else if (t < C.konta.start) {
    const k = u(t, C.karna.start, C.konta.start);
    camera(1.06 + 0.05 * k, 540, 1040);
    K.kelir(ctx, t, { flick: 2.2, warmth: 0.35 });
    const aim = ease.inOutCubic(u(k, 0.1, 0.8));
    const o = {
      x: 680, y: 1820, s: 1.12, face: -1, t,
      armF: [lerp(1.2, 2.25, aim), 0.15], armB: [-0.3, 0.45],
    };
    K.puppet(ctx, 'karna', o);
    const [hx, hy] = K.hand('karna', o, 'F');
    kontaSpear(t, hx - 20, hy - 30, lerp(-2.4, -2.1, aim), { s: 1.05 });
    K.gedebog(ctx, 1800);
  }

  // SHOT 7: konta — The glowing Konta streaks upward through the clouds toward Gatotkaca
  else if (t < C.gugur.start) {
    const k = u(t, C.konta.start, C.gugur.start);
    const sx = noise.n2(t * 20, 1) * 7, sy = noise.n2(t * 20, 5) * 7;
    camera(1.05, 540 + sx, 940 + sy);
    K.kelir(ctx, t, { flick: 2.4, glow: 1.06 });
    shadowClouds(t * 1.5, 680, 0.65);
    K.puppet(ctx, 'gatotkaca', {
      x: 420, y: 1060, s: 1.0, face: 1, t, rods: false,
      armF: [1.65, 0.25], armB: [-0.6, 0.3],
    });
    const kx = lerp(840, 460, ease.inQuad(k));
    const ky = lerp(1640, 860, ease.inQuad(k));
    kontaSpear(t, kx, ky, -2.35, { s: 1.15 });
  }

  // SHOT 8: gugur — Konta strikes Gatotkaca in the clouds; his silhouette fills with cosmic starlight
  else if (t < C.runtuh.start) {
    const k = u(t, C.gugur.start, C.runtuh.start);
    const d = ease.inOutCubic(k) * 0.68;
    camera(1.0 + 0.06 * k, 540, 960);
    K.kelir(ctx, t, { glow: 1.12, flick: 1.4 });
    glowBehind(540, 880, 780, 0.55);
    shadowClouds(t * 0.6, 740, 0.5);
    K.puppet(ctx, 'gatotkaca', {
      x: 520, y: 1320, s: 1.15, face: 1, t, depth: d, rods: false,
      fill: K.cosmosFill(t), armF: [1.9, 0.2], armB: [-0.9, 0.2],
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    K.nameplate(ctx, 'PENGORBANAN SANG KESATRIA', 540, 290, { alpha: env(t, C.gugur.start + 0.25, C.runtuh.start, 0.35, 0.3) });
  }

  // SHOT 9: runtuh — Giant soft shadow of Gatotkaca plunges down, crushing the Kurawa war chariot!
  else if (t < C.moral.start) {
    const k = u(t, C.runtuh.start, C.moral.start);
    const fall = ease.inQuad(clamp(k * 1.25));
    const impact = k > 0.72 ? noise.n2(t * 32, 3) * 18 : 0;
    camera(1.04, 540 + impact, 1020 + impact);
    K.kelir(ctx, t, { flick: 2.6, warmth: 0.4 });
    K.gunungan(ctx, 540, 1680, { s: 1.35, rot: Math.sin(t * 9) * 0.24, depth: 0.5, alpha: 0.65 });
    K.chariot(ctx, 620, 1660 + (k > 0.72 ? 80 : 0), { s: 0.85, wheel: 0.6, face: -1 });
    for (let i = 0; i < 3; i++) {
      K.puppet(ctx, 'prajurit', {
        x: 340 + i * 220, y: 1810, s: 0.62, face: -1, t: t + i, wobble: 3,
      });
    }
    K.puppet(ctx, 'gatotkaca', {
      x: 540, y: lerp(780, 1820, fall), s: 1.35, face: 1, t,
      depth: lerp(0.65, 0.25, fall), rods: false,
      armF: [1.8, 0.2], armB: [-0.8, 0.2],
    });
    K.gedebog(ctx, 1800);
  }

  // SHOT 10: moral — Tancep Kayon: Gunungan stands tall in tribute to Gatotkaca, saving Arjuna
  else {
    const end = C.moral.end + 0.2;
    const closeP = ease.inOutCubic(clamp((t - end + 0.4) / 0.8));
    camera(1.0 + 0.05 * u(t, C.moral.start, end), 540, 1040);
    K.kelir(ctx, t, { glow: lerp(1.08, 0.55, closeP), flick: 0.75 });
    glowBehind(540, 960, 640, 0.45 * (1 - closeP));
    K.puppet(ctx, 'gatotkaca', {
      x: 540, y: 1460, s: 1.05, face: 1, t, depth: 0.45, alpha: 0.55, rods: false,
    });
    K.puppet(ctx, 'arjuna', {
      x: 320, y: 1810, s: 0.95, face: 1, t, armF: [0.5, 0.85],
    });
    K.puppet(ctx, 'kresna', {
      x: 760, y: 1810, s: 0.96, face: -1, t, armF: [0.6, 0.8],
    });
    K.gunungan(ctx, lerp(1480, 540, closeP), 1760, { s: 1.55, rot: (1 - closeP) * 0.75 });
    K.gedebog(ctx, 1800);
  }
}

