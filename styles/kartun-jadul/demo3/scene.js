// Kartun Jadul Demo 3: Si Kabayan dan Nangka Hanyut (9 shots, 1930s rubber-hose B/W slapstick).
import * as K from '/styles/kartun-jadul/kit.js';

export const meta = {
  fps: 24,
  hold: 2,
  captions: {
    preset: 'typewriter',
    anim: 'fade',
    y: 1500,
    size: 58,
    box: { fill: 'rgba(236,230,214,.95)', pad: 18, radius: 2, border: '#141210', borderW: 4 },
  },
};

let ctx, fx;
const C = {};
const u = (t, a, b) => K.clamp((t - a) / (b - a));

/** Spiky rubber-hose jackfruit (buah nangka) with pie-cut eyes! */
function nangka(ctx, x, y, s, { t = 0, rot = 0, face = true } = {}) {
  const bt = K.beat(t);
  const [sx, sy] = K.squash(t, 0.045);
  const [jx, jy] = K.boil(t, 43);
  ctx.save();
  ctx.translate(x + jx, y - bt.b * 12 + jy);
  ctx.rotate(rot + Math.sin(t * 3) * 0.06);
  ctx.scale(s * sx, s * sy);
  // stem
  ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -110); ctx.quadraticCurveTo(20, -145, 45, -140); ctx.stroke();
  // body oval
  ctx.fillStyle = K.PAL.g2; ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.ellipse(0, 0, 88, 112, 0, 0, K.TAU); ctx.fill(); ctx.stroke();
  // diamond grid texture
  ctx.strokeStyle = K.PAL.g4; ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    for (let j = -3; j <= 3; j++) {
      const px = i * 26 + (j % 2) * 13, py = j * 24;
      if ((px * px) / (70 * 70) + (py * py) / (94 * 94) < 1) {
        ctx.beginPath(); ctx.arc(px, py, 4, 0, K.TAU); ctx.stroke();
      }
    }
  }
  if (face) {
    K.pieEye(ctx, -22, -24, 14, 22, { look: [0.2, 0] });
    K.pieEye(ctx, 22, -24, 14, 22, { look: [0.2, 0] });
    ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-22, 18); ctx.quadraticCurveTo(0, 34, 22, 18); ctx.stroke();
  }
  ctx.restore();
}

export function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('chime', 0.25, { freq: 520, gain: 0.22 });
  AM.sfx('pop', C.pohon.start + 0.4, { gain: 0.25 });
  AM.sfx('boing', C.malas.start + 0.5, { gain: 0.28 });
  AM.sfx('impact', C.cebur.start + 0.3, { gain: 0.35 });
  AM.sfx('whoosh', C.marah.start + 0.4, { gain: 0.3 });
  AM.sfx('chime', C.moral.start + 0.3, { freq: 640, gain: 0.25 });
}

export function render(t, AM) {
  const talk = AM.lib?.env ? AM.lib.env(t) * 0.85 : 0.35 + 0.35 * Math.abs(Math.sin(t * 9));
  const blink = (t % 3.4) < 0.11 ? 1 : 0;
  const [wx, wy] = K.weave(t, 3);

  ctx.save();
  ctx.translate(wx, wy);

  // SHOT 1: hook — Art-deco Title Card -> Iris open to village river & house
  if (t < C.berangkat.start) {
    const k = u(t, C.hook.start, C.berangkat.start);
    K.sky(ctx, t, { night: false });
    K.sungai(ctx, t, { y: 1380, h: 280, night: false });
    K.rumah(ctx, 260, 1220, 0.72, { t, night: false });
    K.pohon(ctx, 860, 1240, 0.85, { t, fruits: 2 });
    K.tani(ctx, 480, 1260, 0.74, {
      t, mouth: talk, blink, look: [0.3, 0],
      armL: [-150, -90, 'open'], armR: [175, -140, 'wave']
    });
    nangka(ctx, 730, 1180, 0.78, { t });
    if (t < 1.9) {
      K.titleCard(ctx, t, 'SI KABAYAN', 'NANGKA PULANG SENDIRI', { alpha: 1 - K.ease.inCubic(u(t, 1.4, 1.9)) });
    } else {
      const r = K.lerp(120, 1300, K.ease.outCubic(u(t, 1.9, 3.0)));
      if (r < 1250) K.iris(ctx, 540, 1080, r);
    }
    K.burst(ctx, 'PULANG SENDIRI?!', 540, 420, { size: 68, k: u(t, C.hook.start + 2.2, C.hook.start + 2.8), alpha: k > 0.35 ? 1 : 0, t });
  }

  // SHOT 2: berangkat — Kabayan & Belang strolling along the riverbank to the orchard
  else if (t < C.pohon.start) {
    const k = u(t, C.berangkat.start, C.pohon.start);
    K.sky(ctx, t, { night: false });
    K.sungai(ctx, t, { y: 1400, h: 300, night: false });
    K.pohon(ctx, 900, 1250, 0.9, { t, fruits: 3 });
    const kx = K.lerp(180, 560, k);
    K.critter(ctx, 'belang', kx - 220, 1280, 0.68, {
      t, walk: t * 2.2, mouth: 0.3, smile: 0.8, tongue: true,
      armL: [-60, 10, 'open'], armR: [75, -20, 'open']
    });
    K.tani(ctx, kx, 1270, 0.75, {
      t, walk: t * 1.6, mouth: talk, blink,
      armL: [-140, -60, 'open'], armR: [165, -110, 'point']
    });
  }

  // SHOT 3: pohon — Giant nangka under the tree, Kabayan tries lifting it and strains his back
  else if (t < C.malas.start) {
    const k = u(t, C.pohon.start, C.malas.start);
    K.sky(ctx, t, { night: false });
    K.sungai(ctx, t, { y: 1440, h: 280, night: false });
    K.pohon(ctx, 820, 1260, 1.05, { t, fruits: 2 });
    const strain = k > 0.45 ? Math.sin(t * 22) * 0.08 : 0;
    K.tani(ctx, 370, 1280, 0.82, {
      t, mouth: talk, blink, lean: 0.22 + strain, sq: k > 0.45 ? -0.08 : 0,
      armL: [-120, -120, 'fist'], armR: [175, -20, 'open']
    });
    nangka(ctx, 640, 1200, 1.05, { t, rot: strain });
    if (k > 0.45) {
      K.burst(ctx, 'BERAT!', 350, 520, { size: 88, k: u(k, 0.45, 0.65), alpha: 1, rot: -0.08, t });
    }
  }

  // SHOT 4: malas — Kabayan lectures the jackfruit with a big cartoon speech bubble
  else if (t < C.cebur.start) {
    const k = u(t, C.malas.start, C.cebur.start);
    K.sky(ctx, t, { night: false });
    K.sungai(ctx, t, { y: 1420, h: 300, night: false });
    K.pohon(ctx, 880, 1260, 0.95, { t, fruits: 1 });
    K.tani(ctx, 340, 1280, 0.84, {
      t, mouth: talk, blink, look: [0.5, 0.1],
      armL: [-140, -60, 'fist'], armR: [190, -140, 'point']
    });
    nangka(ctx, 680, 1200, 1.05, { t });
    K.bubble(ctx, 'KAMU KAN SUDAH TUA,\nPULANG SENDIRI YA!', 540, 470, {
      w: 760, h: 250, size: 50, tail: [-140, 230], k: u(k, 0.08, 0.3)
    });
  }

  // SHOT 5: cebur — BYUR! Nangka splashed into the river and bobbing downstream while Kabayan waves
  else if (t < C.pulang.start) {
    const k = u(t, C.cebur.start, C.pulang.start);
    K.sky(ctx, t, { night: false });
    K.sungai(ctx, t, { y: 1280, h: 420, night: false });
    K.tani(ctx, 260, 1210, 0.76, {
      t, mouth: talk, blink,
      armL: [-140, -70, 'open'], armR: [180, -210, 'wave']
    });
    const nx = K.lerp(480, 880, k);
    const ny = 1430 + Math.sin(t * 6) * 24;
    nangka(ctx, nx, ny, 0.92, { t, rot: t * 1.8 });
    K.dust(ctx, 500, 1380, u(k, 0.02, 0.45), 1.3);
    K.burst(ctx, 'BYUR!', 540, 500, { size: 105, k: u(k, 0.05, 0.25), alpha: k < 0.65 ? 1 : 0, rot: 0.08, t });
  }

  // SHOT 6: pulang — Kabayan whistling home empty-handed toward the house
  else if (t < C.alasan.start) {
    const k = u(t, C.pulang.start, C.alasan.start);
    K.sky(ctx, t, { night: false });
    K.kebun(ctx, t, { y: 1320, night: false });
    K.rumah(ctx, 820, 1280, 0.85, { t, night: false });
    const kx = K.lerp(180, 540, k);
    K.tani(ctx, kx, 1340, 0.78, {
      t, walk: t * 1.8, mouth: 0.25, blink,
      armL: [-150, -60, 'open'], armR: [160, -80, 'open']
    });
    K.critter(ctx, 'belang', 760, 1340, 0.65, {
      t, face: -1, mouth: 0.2, smile: 0.4,
      armL: [-50, 10, 'open'], armR: [65, -20, 'open']
    });
  }

  // SHOT 7: alasan — Kabayan shrugging innocently with a speech bubble explaining the floating nangka
  else if (t < C.marah.start) {
    const k = u(t, C.alasan.start, C.marah.start);
    K.sky(ctx, t, { night: false });
    K.kebun(ctx, t, { y: 1340, night: false });
    K.rumah(ctx, 860, 1300, 0.82, { t, night: false });
    K.tani(ctx, 380, 1360, 0.86, {
      t, mouth: talk, blink, look: [0.3, -0.2],
      armL: [-190, -140, 'open'], armR: [190, -140, 'open']
    });
    K.bubble(ctx, 'SUDAH KUSURUH PULang\nLEWAT SUNGAI!', 540, 460, {
      w: 740, h: 240, size: 50, tail: [-120, 230], k: u(k, 0.08, 0.3)
    });
  }

  // SHOT 8: marah — Steam from ears, slapstick chase with speed smear lines & AMPUN burst!
  else if (t < C.moral.start) {
    const k = u(t, C.marah.start, C.moral.start);
    K.sky(ctx, t, { night: false });
    K.kebun(ctx, t, { y: 1340, night: false });
    const runX = K.lerp(260, 820, (t * 0.9) % 1);
    K.smear(ctx, runX - 110, 1100, 260, { dir: 1, n: 8, h: 360, t });
    K.tani(ctx, runX, 1360, 0.78, {
      t, walk: t * 3.8, angry: 1, steam: 1, mouth: 0.75, lean: 0.2,
      armL: [-170, -160, 'fist'], armR: [190, -180, 'fist']
    });
    K.critter(ctx, 'belang', runX - 240, 1370, 0.68, {
      t, walk: t * 4.2, mouth: 0.6, tongue: true,
      armL: [-60, -20, 'open'], armR: [80, -40, 'open']
    });
    K.burst(ctx, 'AMPUN BAH!', 540, 470, { size: 92, k: u(k, 0.08, 0.28), alpha: 1, rot: -0.06, t });
  }

  // SHOT 9: moral — Iris-out on Kabayan finally carrying the giant nangka + TAMAT title card
  else {
    const k = u(t, C.moral.start, C.moral.end + 0.9);
    K.sky(ctx, t, { night: false });
    K.sungai(ctx, t, { y: 1380, h: 300, night: false });
    K.tani(ctx, 480, 1280, 0.84, {
      t, mouth: talk, blink, sweat: true,
      armL: [-140, -180, 'open'], armR: [170, -180, 'open']
    });
    nangka(ctx, 640, 1020, 0.88, { t });
    K.bubble(ctx, 'JANGAN MALAS,\nTUNTASKAN KERJAMU!', 540, 430, {
      w: 740, h: 240, size: 50, tail: [-60, 220], k: u(k, 0.05, 0.25), alpha: k < 0.72 ? 1 : 0
    });
    const ir = k < 0.68 ? 1300 : K.lerp(1300, 0, K.ease.inCubic(u(k, 0.68, 0.96)));
    if (ir < 1260) K.iris(ctx, 520, 1020, Math.max(0, ir));
    if (k > 0.9) {
      K.titleCard(ctx, t, 'TAMAT', 'TANGGUNG JAWAB HARUS TUNTAS', { alpha: u(k, 0.9, 0.98) });
    }
  }

  ctx.restore();
  K.film(fx, t, { amt: 1 });
}
