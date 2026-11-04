// Kartun Jadul demo2: "Kancil dan Barisan Buaya" — rubber-hose B/W 1930s cartoon, on twos.
import * as K from '/styles/kartun-jadul/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'typewriter', anim: 'fade', y: 1500, size: 58, box: { fill: 'rgba(236,230,214,.95)', pad: 18, radius: 2, border: '#141210', borderW: 4 } } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('slide_whistle', 0.65, { gain: 0.35, pitch: 1.2 });
  AM.sfx('boing', W('hook', 'kancil'), { gain: 0.4 });
  AM.sfx('pop', W('hook', 'buaya'), { gain: 0.4 });
  AM.sfx('thud', W('muncul', 'muncul'), { gain: 0.5 });
  AM.sfx('boing', W('akal', 'melompat'), { gain: 0.4 });
  AM.sfx('slide_whistle', W('baris', 'berbaris'), { gain: 0.35, pitch: 1.3 });
  AM.sfx('boing', W('hitung', 'Satu'), { gain: 0.45, pitch: 1.0 });
  AM.sfx('boing', W('hitung', 'Dua'), { gain: 0.45, pitch: 1.15 });
  AM.sfx('boing', W('hitung', 'Tiga'), { gain: 0.45, pitch: 1.3 });
  AM.sfx('boing', W('hitung', 'Empat'), { gain: 0.45, pitch: 1.45 });
  AM.sfx('whoosh', W('ngamuk', 'kabur') - 0.05, { gain: 0.55, pitch: 1.3 });
  AM.sfx('bell_temple', C.pesan.end + 0.15, { gain: 0.3 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};
function camera(t, z = 1, cx = 540, cy = 960) {
  const [wx, wy] = K.weave(t, 3);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540 + wx, 960 + wy);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}
const blinkAt = (t, seed = 0) => ((t + seed) % 2.7 < 0.12 ? 1 : 0);
const pop = (t, at, d = 0.35) => ease.outBack(clamp((t - at) / d), 2.6);

// 1. HOOK — Art-deco title card -> iris opens on Kancil, fruit tree on far bank, and snapping crocodile
shot('hook', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(t, 1.18 + 0.05 * p, 540, 1080);
  K.sky(ctx, t, { night: false });
  K.sungai(ctx, t, { y: 1260, h: 320, night: false });
  K.pohon(ctx, 880, 1210, 0.9, { t, fruits: 3 });

  const kk = pop(t, W('hook', 'kancil') - 0.1);
  const bk = pop(t, W('hook', 'buaya') - 0.1);
  if (kk > 0) {
    K.critter(ctx, 'kancil', 210, 1230, 0.92 * kk, {
      t, armR: [100, -220 + Math.sin(t * 10) * 20, 'point'], armL: [-80, -40, 'open'],
      mouth: 0.35, look: [0.7, 0.1], blink: blinkAt(t),
    });
  }
  if (bk > 0) {
    K.buaya(ctx, 560, 1410, 1.05 * bk, { t, face: -1, mouth: 0.4 + 0.3 * Math.sin(t * 12), look: [-0.6, -0.2], angry: 0.6 });
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const card = 1 - clamp((t - 0.95) / 0.15);
  if (card > 0) K.titleCard(ctx, t, 'SI KANCIL', 'JEMBATAN BUAYA', { alpha: 1 });
  const ir = ease.inOutCubic(clamp((t - 1.0) / 0.6));
  if (ir < 1 && card <= 0) K.iris(ctx, 540, 1080, lerp(0, 1300, ir));
});

// 2. SEBERANG — Kancil gazes across the wide rushing river at the fruit tree
shot('seberang', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(t, lerp(1.16, 1.28, p), 540, 1080);
  K.sky(ctx, t, { night: false });
  K.sungai(ctx, t, { y: 1260, h: 340, night: false });
  K.pohon(ctx, 890, 1200, 0.95, { t, fruits: 3 });
  K.critter(ctx, 'kancil', 200, 1230, 0.95, {
    t, armR: [95, -260, 'point'], armL: [-75, -80, 'open'],
    mouth: 0.2, smile: -0.3, look: [0.8, -0.2], sweat: p > 0.5,
  });
  K.bubble(ctx, 'JEMBATANNYA\nMANA YA?!', 380, 620, { w: 560, h: 220, k: clamp((t - a - 0.25) / 0.35), tail: [-120, 230], size: 48 });
});

// 3. MUNCUL — The Crocodile King bursts up from the river with jaws wide open
shot('muncul', (t, a, b) => {
  const mnc = W('muncul', 'muncul');
  const popB = ease.outBack(clamp((t - (mnc - 0.2)) / 0.45), 2.2);
  camera(t, 1.32, 560, 1120);
  K.sky(ctx, t, { night: false });
  K.sungai(ctx, t, { y: 1250, h: 350, night: false });
  K.critter(ctx, 'kancil', 210, 1220, 0.95, {
    t, lean: -0.22 * popB, sq: -0.08 * popB,
    armL: [-110, -240, 'open'], armR: [110, -250, 'open'],
    mouth: 0.65 * popB, look: [0.7, 0.2], sweat: popB > 0.3,
  });
  if (popB > 0) {
    K.buaya(ctx, 690, lerp(1550, 1390, popB), 1.2 * popB, {
      t, face: -1, mouth: 0.55 + 0.25 * Math.sin(t * 16), angry: 0.85, look: [-0.7, -0.2],
    });
    K.burst(ctx, 'SNAP!', 730, 920, { size: 100, k: clamp((t - mnc) / 0.25), alpha: 1 - clamp((t - mnc - 1.1) / 0.3), t });
  }
});

// 4. AKAL — Kancil gets a bright idea and announces the King's Feast
shot('akal', (t, a, b) => {
  const p = (t - a) / (b - a);
  const pesta = W('akal', 'pesta');
  camera(t, 1.36, 480, 1100);
  K.sky(ctx, t, { night: false });
  K.sungai(ctx, t, { y: 1260, h: 330, night: false });
  K.critter(ctx, 'kancil', 250, 1220, 1.0, {
    t, armR: [115, -260 + Math.sin(t * 10) * 25, 'point'], armL: [-80, -140, 'open'],
    mouth: 0.3 + 0.35 * Math.abs(Math.sin(t * 10)), smile: 1, look: [0.7, 0.1],
  });
  K.buaya(ctx, 730, 1400, 1.1, { t, face: -1, mouth: 0.25, look: [-0.6, -0.2], angry: 0 });
  const bk = clamp((t - pesta + 0.25) / 0.35);
  if (bk > 0) {
    K.bubble(ctx, 'ADA PESTA DAGING\nRAJA HUTAN!', 480, 620, { w: 660, h: 230, k: bk, tail: [-160, 260], size: 50 });
  }
});

// 5. BARIS — Four crocodiles line up across the river from bank to bank
shot('baris', (t, a, b) => {
  const brs = W('baris', 'berbaris');
  camera(t, 1.15, 540, 1100);
  K.sky(ctx, t, { night: false });
  K.sungai(ctx, t, { y: 1240, h: 360, night: false });
  K.pohon(ctx, 940, 1190, 0.85, { t, fruits: 3 });
  K.critter(ctx, 'kancil', 130, 1210, 0.85, {
    t, armR: [110, -240, 'point'], mouth: 0.3, smile: 1, look: [0.8, 0.1],
  });
  for (let i = 0; i < 4; i++) {
    const k = ease.outBack(clamp((t - (brs - 0.3 + i * 0.18)) / 0.45), 1.8);
    if (k > 0) {
      K.buaya(ctx, 290 + i * 175, lerp(1560, 1395, k), 0.78 * k, {
        t: t + i * 0.2, face: -1, mouth: 0.15, look: [-0.4, -0.3],
      });
    }
  }
  K.bubble(ctx, 'BERBARIS RAPI!', 420, 630, { w: 560, h: 190, k: clamp((t - a - 0.2) / 0.35), tail: [-200, 250], size: 52 });
});

// 6. HITUNG — Kancil hops across the crocodile heads: SATU! DUA! TIGA! EMPAT!
shot('hitung', (t, a, b) => {
  camera(t, 1.15, 540, 1100);
  K.sky(ctx, t, { night: false });
  K.sungai(ctx, t, { y: 1240, h: 360, night: false });
  K.pohon(ctx, 940, 1190, 0.85, { t, fruits: 3 });

  const steps = [
    W('hitung', 'Satu'),
    W('hitung', 'Dua'),
    W('hitung', 'Tiga'),
    W('hitung', 'Empat'),
  ];
  let idx = -1;
  for (let i = 0; i < 4; i++) if (t >= steps[i] - 0.12) idx = i;

  for (let i = 0; i < 4; i++) {
    const squashed = idx === i ? clamp(1 - (t - (steps[i] - 0.1)) * 2.5) * 0.22 : 0;
    K.buaya(ctx, 290 + i * 175, 1395 + squashed * 40, 0.78, {
      t: t + i * 0.2, face: -1, mouth: 0.15, sq: squashed, num: idx >= i ? i + 1 : 0,
    });
  }

  // Kancil hopping arc from bank -> croc 0 -> 1 -> 2 -> 3
  const xs = [130, 290, 465, 640, 815];
  let kx = xs[0], ky = 1210;
  if (idx >= 0) {
    const t0 = steps[idx] - 0.12;
    const u = clamp((t - t0) / 0.42);
    kx = lerp(xs[idx], xs[idx + 1], u);
    ky = lerp(idx === 0 ? 1210 : 1295, 1295, u) - Math.sin(u * Math.PI) * 180;
  }
  K.critter(ctx, 'kancil', kx, ky, 0.82, {
    t, walk: t * 4, armR: [95, -220, 'point'], armL: [-85, -180, 'open'],
    mouth: 0.4, smile: 1,
  });
});

// 7. SAMPAI — Kancil lands on the far bank and waves goodbye!
shot('sampai', (t, a, b) => {
  camera(t, 1.3, 660, 1100);
  K.sky(ctx, t, { night: false });
  K.sungai(ctx, t, { y: 1240, h: 360, night: false });
  K.pohon(ctx, 920, 1200, 0.92, { t, fruits: 3 });
  K.buaya(ctx, 430, 1400, 0.85, { t, face: 1, mouth: 0.2, look: [0.7, -0.3] });
  K.critter(ctx, 'kancil', 800, 1210, 0.95, {
    t, face: -1, wink: 1, smile: 1, mouth: 0.35, tongue: true,
    armR: [110, -260 + Math.sin(t * 16) * 35, 'open'], armL: [-70, -100, 'open'],
  });
  const trm = W('sampai', 'Terima');
  K.bubble(ctx, 'TERIMA KASIH\nJEMBATANNYA!', 620, 620, { w: 620, h: 220, k: clamp((t - trm + 0.15) / 0.35), tail: [140, 240], size: 50 });
});

// 8. NGAMUK — Furious crocodiles snap while Kancil zooms away in a smear + dust cloud
shot('ngamuk', (t, a, b) => {
  const kab = W('ngamuk', 'kabur');
  const run = clamp((t - kab + 0.1) / 0.55);
  camera(t, 1.25, 620, 1100);
  K.sky(ctx, t, { night: false });
  K.sungai(ctx, t, { y: 1240, h: 360, night: false });
  for (let i = 0; i < 3; i++) {
    K.buaya(ctx, 320 + i * 170, 1400, 0.82, {
      t: t + i * 0.3, face: 1, mouth: 0.5 + 0.3 * Math.sin(t * 20 + i), angry: 1,
    });
  }
  if (run <= 0) {
    K.critter(ctx, 'kancil', 820, 1210, 0.9, { t, face: -1, wink: 1, smile: 1, armR: [90, -240, 'open'] });
  } else {
    const x = lerp(820, 1480, ease.inQuad(run));
    if (run < 0.65) K.critter(ctx, 'kancil', x, 1210, 0.9, { t, sq: 0.28, lean: 0.38, walk: t * 8 });
    K.smear(ctx, x - 40, 1100, 560 * run, { dir: 1, t, h: 250 });
    K.dust(ctx, 820, 1200, run, 1.1);
    K.burst(ctx, 'ZOOM!', 880, 780, { size: 105, k: clamp(run * 3), alpha: 1 - clamp((t - kab - 1.1) / 0.3), t });
  }
});

// 9. PESAN — Kancil winks with a sweet fruit, iris-out to TAMAT
shot('pesan', (t, a, b) => {
  camera(t, 1.38, 540, 1120);
  K.sky(ctx, t, { night: false });
  K.kebun(ctx, t, { y: 1320, night: false });
  K.pohon(ctx, 820, 1300, 0.9, { t, fruits: 2 });
  K.critter(ctx, 'kancil', 520, 1350, 1.08, {
    t, armR: [105, -230, 'point'], armL: [-100, -150, 'open'],
    wink: t > W('pesan', 'cerdik') ? 1 : 0, mouth: 0.2, smile: 1, look: [0, 0],
  });
  const end = C.pesan.end + 0.1;
  const ir = ease.inOutCubic(clamp((t - end) / 0.8));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (ir > 0) K.iris(ctx, 560, 880, lerp(1300, 150, ir));
  if (ir >= 1) {
    const k = clamp((t - end - 0.8) / 0.4);
    K.iris(ctx, 560, 880, lerp(150, 0, k));
    ctx.save();
    ctx.globalAlpha = k;
    ctx.font = "400 150px 'Abril Fatface'";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ece6d6';
    ctx.letterSpacing = '10px';
    ctx.fillText('TAMAT', 540, 920);
    ctx.restore();
  }
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (since < 0.1 && s.id !== 'hook') {
    fx.fillStyle = 'rgba(250,246,235,0.35)';
    fx.fillRect(0, 0, AM.W, AM.H);
  }
  K.film(fx, t);
  AM.lib.vignette(fx, { strength: 0.75, inner: 0.35, color: '12,10,8' });
  AM.lib.grain(fx, t, { amount: 0.11, fps: 24 });
}

