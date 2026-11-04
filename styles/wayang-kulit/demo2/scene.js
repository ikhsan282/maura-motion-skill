// Wayang Kulit Demo 2: "Bima & Dewa Ruci — Pencarian Tirta Pawitra" (10 shots).
import * as K from '/styles/wayang-kulit/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'serif', y: 1500 } };

let ctx, fx;
const C = {};
const W = (id, w) => (C[id] ? AM.wordTime(id, w) : 0);

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('gong', 0.05, { gain: 0.55 });
  AM.sfx('keprak', 0.12, { gain: 0.5 });
  AM.sfx('cempala', C.durna.start + 0.1, { gain: 0.45 });
  AM.sfx('drum_hit', C.samudra.start + 0.1, { gain: 0.55 });
  AM.sfx('keprak', C.naga.start + 0.15, { gain: 0.5 });
  AM.sfx('impact', C.naga.start + 2.0, { gain: 0.45 });
  AM.sfx('gong', C.hening.start + 0.1, { gain: 0.55 });
  AM.sfx('magic', C.masuk.start + 0.4, { gain: 0.35 });
  AM.sfx('chime', C.wejangan.start + 0.3, { gain: 0.35 });
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
  g.addColorStop(0, `rgba(255,238,180,${a})`);
  g.addColorStop(0.45, `rgba(255,195,95,${a * 0.5})`);
  g.addColorStop(1, 'rgba(255,160,60,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** Carved shadow ocean waves rolling across the kelir. */
function shadowWaves(t, yBase = 1600, amp = 55, layers = 3) {
  for (let l = 0; l < layers; l++) {
    const yy = yBase + l * 68;
    const speed = (l % 2 ? -1 : 1) * (90 + l * 35);
    ctx.save();
    ctx.globalAlpha = 0.52 + l * 0.16;
    ctx.fillStyle = K.PAL.shadow;
    ctx.beginPath();
    ctx.moveTo(-250, 2100);
    for (let x = -250; x <= 1350; x += 32) {
      const wy = yy + Math.sin((x + t * speed) * 0.015 + l) * amp + Math.cos((x - t * speed * 0.6) * 0.03) * (amp * 0.45);
      ctx.lineTo(x, wy);
    }
    ctx.lineTo(1350, 2100);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/** Giant sea serpent shadow (Naga Nemburnawa) coiling on the screen. */
function nagaShadow(t, x, y, s = 1, alpha = 0.92) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = K.PAL.shadow;
  ctx.fillStyle = K.PAL.shadow;
  ctx.lineCap = 'round';
  ctx.lineWidth = 64;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const k = i / 24;
    const px = lerp(420, -60, k);
    const py = lerp(320, -420, k) + Math.sin(k * 9 + t * 5) * 95;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  // Dragon head + open jaws + crown
  const hx = -60, hy = -420 + Math.sin(9 + t * 5) * 95;
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(Math.sin(t * 4) * 0.12);
  ctx.beginPath();
  ctx.moveTo(40, -50);
  ctx.lineTo(-140, -90);
  ctx.lineTo(-110, -25);
  ctx.lineTo(20, -10);
  ctx.lineTo(-125, 45);
  ctx.lineTo(-90, 80);
  ctx.lineTo(50, 35);
  ctx.closePath();
  ctx.fill();
  // Carved eye hole
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(-25, -42, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

export function render(t, AM) {
  // SHOT 1: hook — Gunungan opens on towering Bima standing before the surging ocean waves
  if (t < C.durna.start) {
    const k = u(t, C.hook.start, C.durna.start);
    camera(1.0 + 0.06 * k, 540, 1020);
    K.kelir(ctx, t, { flick: 1.5 });
    shadowWaves(t, 1520, 60, 3);
    K.puppet(ctx, 'bima', {
      x: 360, y: 1820, s: 1.15, t,
      armF: [1.35 + Math.sin(t * 2.5) * 0.12, 0.35], armB: [-0.3, 0.4],
    });
    const g = u(t, C.hook.start, C.hook.start + 1.2);
    if (g < 1) K.gunungan(ctx, 540 - ease.inCubic(g) * 1050, 1740, { s: 1.6, rot: -g * 0.85, depth: g * 0.3 });
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const ta = env(t, C.hook.start + 0.4, C.durna.start - 0.2, 0.4, 0.4);
    K.goldTitle(ctx, 'DEWA RUCI', 540, 250, { size: 84, alpha: ta });
    K.nameplate(ctx, 'TIRTA PAWITRA', 540, 340, { alpha: ta * 0.9, size: 34 });
  }

  // SHOT 2: durna — Pandita Durna instructing Bima to seek Tirta Pawitra in the ocean
  else if (t < C.berangkat.start) {
    const k = u(t, C.durna.start, C.berangkat.start);
    camera(1.02 + 0.04 * k, 540, 1000);
    K.kelir(ctx, t);
    K.puppet(ctx, 'durna', {
      x: 300, y: 1800, s: 1.05, face: 1, t,
      armF: [1.45 + Math.sin(t * 3) * 0.15, 0.3], armB: [-0.35, 0.5],
    });
    K.puppet(ctx, 'bima', {
      x: 780, y: 1820, s: 1.08, face: -1, t,
      armF: [0.45, 0.85], armB: [-0.2, 0.4],
    });
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    K.nameplate(ctx, 'PANDITA DURNA & BIMA', 540, 300, { alpha: env(t, C.durna.start + 0.3, C.berangkat.start, 0.35, 0.3) });
  }

  // SHOT 3: berangkat — Arjuna warns Bima, but Bima strides forward with unwavering devotion
  else if (t < C.samudra.start) {
    const k = u(t, C.berangkat.start, C.samudra.start);
    camera(1.0 + 0.05 * k, 540, 1020);
    K.kelir(ctx, t);
    K.puppet(ctx, 'arjuna', {
      x: 240, y: 1800, s: 0.92, face: 1, t, depth: 0.2,
      armF: [1.1, 0.4], armB: [-0.2, 0.4],
    });
    const bx = lerp(520, 760, ease.inOutQuad(k));
    K.puppet(ctx, 'bima', {
      x: bx, y: 1820, s: 1.12, face: 1, t,
      armF: [1.25, 0.25], armB: [-0.45, 0.5],
    });
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    K.nameplate(ctx, 'SANG BRATASENA', 540, 300, { alpha: env(t, C.berangkat.start + 0.3, C.samudra.start, 0.35, 0.3) });
  }

  // SHOT 4: samudra — Bima plunges into the roaring ocean waves as the Gunungan swirls like a tempest
  else if (t < C.naga.start) {
    const k = u(t, C.samudra.start, C.naga.start);
    const sx = noise.n2(t * 18, 1) * 8, sy = noise.n2(t * 18, 5) * 8;
    camera(1.05, 540 + sx, 1020 + sy);
    K.kelir(ctx, t, { flick: 2.2, glow: 0.96 });
    K.gunungan(ctx, 540, 1680, { s: 1.4, rot: Math.sin(t * 6) * 0.28, depth: 0.5, alpha: 0.65 });
    shadowWaves(t * 1.4, 1380, 85, 4);
    K.puppet(ctx, 'bima', {
      x: lerp(280, 520, k), y: lerp(1760, 1900, k), s: 1.15, face: 1, t,
      armF: [1.6 + Math.sin(t * 5) * 0.2, 0.2], armB: [-0.6, 0.4], wobble: 2.2,
    });
    K.gedebog(ctx, 1820);
  }

  // SHOT 5: naga — Giant Naga Nemburnawa rises from the deep; Bima strikes with his Pancanaka thumbnail!
  else if (t < C.hening.start) {
    const k = u(t, C.naga.start, C.hening.start);
    const sx = noise.n2(t * 22, 2) * 10, sy = noise.n2(t * 22, 7) * 10;
    camera(1.06, 540 + sx, 1000 + sy);
    K.kelir(ctx, t, { flick: 2.5, glow: 0.98 });
    shadowWaves(t * 1.5, 1480, 75, 3);
    const strike = u(k, 0.45, 0.78);
    K.puppet(ctx, 'bima', {
      x: 320 + strike * 90, y: 1820, s: 1.14, face: 1, t,
      armF: [lerp(1.1, 1.85, strike), lerp(0.5, 0.08, strike)], armB: [-0.5, 0.6], wobble: 2.5,
    });
    nagaShadow(t, 760 - strike * 50, 1460 + strike * 120, 1.0, 0.92 - strike * 0.25);
    if (strike > 0.3) glowBehind(540, 1120, 380 * strike, 0.55 * (1 - u(k, 0.75, 1.0)));
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    K.nameplate(ctx, 'NAGA NEMBURNAWA', 540, 300, { alpha: env(t, C.naga.start + 0.2, C.hening.start - 0.3, 0.3, 0.3) });
  }

  // SHOT 6: hening — Storm subsides into golden calm; tiny radiant Dewa Ruci appears facing giant Bima
  else if (t < C.masuk.start) {
    const k = u(t, C.hening.start, C.masuk.start);
    camera(1.08 + 0.05 * k, 540, 1120);
    K.kelir(ctx, t, { glow: 1.08, flick: 0.6 });
    shadowWaves(t * 0.4, 1660, 22, 2);
    glowBehind(680, 1340, 420, 0.65 * ease.outCubic(u(k, 0.05, 0.5)));
    K.puppet(ctx, 'bima', {
      x: 310, y: 1820, s: 1.12, face: 1, t,
      armF: [0.4, 0.85], armB: [0.1, 0.7],
    });
    K.puppet(ctx, 'dewaruci', {
      x: 680, y: 1560 - Math.sin(t * 2) * 14, s: 1.0, face: -1, t,
      armF: [1.3, 0.4], armB: [-0.2, 0.4], rods: false,
    });
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    K.nameplate(ctx, 'SANG HYANG DEWA RUCI', 540, 300, { alpha: env(t, C.hening.start + 0.4, C.masuk.start, 0.4, 0.3) });
  }

  // SHOT 7: masuk — Dewa Ruci grows toward the lamp revealing the infinite cosmos inside his silhouette
  else if (t < C.wejangan.start) {
    const k = u(t, C.masuk.start, C.wejangan.start);
    const d = ease.inOutCubic(k) * 0.75;
    camera(1.0 + 0.08 * k, 540, 1040);
    K.kelir(ctx, t, { glow: 1.1, flick: 1.1 });
    glowBehind(540, 960, 820, 0.45 * k);
    K.puppet(ctx, 'dewaruci', {
      x: lerp(640, 520, k), y: lerp(1620, 1820, k), s: lerp(1.1, 2.35, k), face: -1, t,
      depth: d, fill: k > 0.12 ? K.cosmosFill(t) : null, rods: false,
      armF: [1.5, 0.35], armB: [-0.4, 0.35],
    });
    K.puppet(ctx, 'bima', {
      x: lerp(310, 470, k), y: lerp(1820, 1520, k), s: lerp(1.05, 0.35, k), face: 1, t,
      alpha: 1 - u(k, 0.65, 0.95), armF: [0.8, 0.5],
    });
    K.gedebog(ctx, 1800);
  }

  // SHOT 8: wejangan — Cosmic inner realm: Sangkan Paraning Dumadi (Gunungan + Bima filled with starlight)
  else if (t < C.tirta.start) {
    const k = u(t, C.wejangan.start, C.tirta.start);
    camera(1.0 + 0.04 * k, 540, 1000);
    K.kelir(ctx, t, { glow: 1.12, flick: 0.7 });
    glowBehind(540, 950, 900, 0.5);
    K.gunungan(ctx, 540, 1660, { s: 1.25, depth: 0.45, alpha: 0.55 });
    K.puppet(ctx, 'bima', {
      x: 540, y: 1820, s: 1.12, face: 1, t, depth: 0.35,
      fill: K.cosmosFill(t), armF: [0.45, 0.9], armB: [0.2, 0.8],
    });
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const wa = env(t, C.wejangan.start + 0.3, C.tirta.start - 0.2, 0.4, 0.35);
    K.goldTitle(ctx, 'SANGKAN PARANING', 540, 290, { size: 64, alpha: wa });
    K.goldTitle(ctx, 'DUMADI', 540, 380, { size: 76, alpha: wa });
  }

  // SHOT 9: tirta — Bima emerges enlightened in serene golden light beside Dewa Ruci
  else if (t < C.moral.start) {
    const k = u(t, C.tirta.start, C.moral.start);
    camera(1.04, 540, 1040);
    K.kelir(ctx, t, { glow: 1.1, flick: 0.65 });
    glowBehind(540, 1080, 680, 0.55);
    K.puppet(ctx, 'bima', {
      x: 380, y: 1820, s: 1.12, face: 1, t,
      armF: [0.5, 0.85], armB: [-0.2, 0.5],
    });
    K.puppet(ctx, 'dewaruci', {
      x: 700, y: 1540, s: 1.05, face: -1, t, rods: false,
      armF: [1.45, 0.35], armB: [-0.25, 0.4],
    });
    K.gedebog(ctx, 1800);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    K.nameplate(ctx, 'TIRTA PAWITRA SEJATI', 540, 300, { alpha: env(t, C.tirta.start + 0.3, C.moral.start, 0.35, 0.3) });
  }

  // SHOT 10: moral — Tancep Kayon: Gunungan closes the play over enlightened Bima
  else {
    const end = C.moral.end + 0.2;
    const closeP = ease.inOutCubic(clamp((t - end + 0.4) / 0.8));
    camera(1.0 + 0.05 * u(t, C.moral.start, end), 540, 1040);
    K.kelir(ctx, t, { glow: lerp(1.08, 0.55, closeP), flick: 0.7 });
    K.puppet(ctx, 'bima', {
      x: 420, y: 1820, s: 1.12, face: 1, t,
      armF: [1.1, 0.45], armB: [-0.25, 0.4],
    });
    K.gunungan(ctx, lerp(1480, 540, closeP), 1760, { s: 1.55, rot: (1 - closeP) * 0.75 });
    K.gedebog(ctx, 1800);
  }
}

