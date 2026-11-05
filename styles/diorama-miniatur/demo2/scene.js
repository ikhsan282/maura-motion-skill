// Diorama Miniatur — Demo 2: Rumah Lanting & Tepian Sungai Banjar (64s)
import * as K from '/styles/diorama-miniatur/kit.js';
import * as THREE from 'three';
const { clamp, lerp, ease, prog, env, hrand } = AM.lib;

export const meta = {
  fps: 24,
  captions: { preset: 'bold', y: 1455, size: 66, active: '#ffd166', strokeColor: '#2a160a' },
};

let S, W, ui, ts, fx, rip;
const C = {};
const BOATS = [];
const cx = (z) => K.riverX(z);

function buildRiverLife() {
  const spots = [
    { x: -16, z: -28, a: 1.52, kinds: ['pisang', 'sayur'], baju: '#2f8f8a' },
    { x: 15, z: -42, a: -1.6, kinds: ['jeruk', 'kue'], baju: '#d0485f' },
    { x: -14, z: -56, a: 1.48, kinds: ['kelapa', 'bakul'], baju: '#e3a82b' },
    { x: 14, z: -68, a: -1.55, kinds: ['pisang', 'jeruk'], baju: '#7b4fa0' },
  ];
  spots.forEach((sp, i) => {
    const len = 5.8;
    const g = new THREE.Group();
    const hull = new THREE.Mesh(K.jukungGeo({ len, cargoKinds: sp.kinds, seed: i + 11 }), K.MAT.double);
    hull.castShadow = true;
    hull.receiveShadow = true;
    g.add(hull);
    const a = K.acil({ baju: sp.baju, sarung: '#5a3d6e', seed: i + 3 });
    a.root.position.set(-len * 0.32, -0.22, 0);
    g.add(a.root);
    S.scene.add(g);
    BOATS.push({ ...sp, i, len, g, ac: a, ph: i * 1.4 });
  });

  const kl = new THREE.Mesh(K.klotokGeo({ hull: '#2f6fa0', roof: '#b8483a', seed: 9 }), K.MAT.double);
  kl.castShadow = true;
  S.scene.add(kl);
  BOATS.klotok = kl;
}

function updateRiverLife(t) {
  const rl = [];
  BOATS.forEach((b) => {
    const x = cx(b.z) + b.x + Math.sin(t * 0.35 + b.ph) * 0.6;
    const z = b.z + Math.cos(t * 0.28 + b.ph) * 0.8;
    const a = b.a + Math.sin(t * 0.2 + b.ph) * 0.08;
    b.g.position.set(x, 0.08 + Math.sin(t * 1.8 + b.ph) * 0.04, z);
    b.g.rotation.set(0, a, Math.sin(t * 1.9 + b.ph) * 0.02);
    K.acilPose(b.ac, t * 2.0 + b.ph, { amt: 0.75, look: Math.sin(t * 0.4 + b.ph) * 0.3 });
    for (let k = 0; k < 2; k++) {
      const per = 2.0;
      const age = (((t + b.ph + (k * per) / 2) % per) + per) % per / per;
      rl.push({ x: x + (k - 0.5) * 1.2, z: z + 0.8, age, size: 0.85 });
    }
  });
  const kz = -15 - ((t * 1.6) % 75);
  const kx = cx(kz) + 2;
  BOATS.klotok.position.set(kx, 0.14 + Math.sin(t * 1.4) * 0.04, kz);
  BOATS.klotok.rotation.set(0, Math.PI / 2, Math.sin(t * 1.5) * 0.02);
  rip.set(rl);
}

export async function setup(AM) {
  for (const l of AM.timeline.lines) C[l.id] = l;
  S = K.stage(AM, { pr: 0.7, shadow: 1024, fov: 30, shadowBox: 65 });
  W = K.riverWorld(S, { seed: 12, houses: true });
  K.mist(S, { y: 1.2 });
  rip = K.ripples(S, 64);
  buildRiverLife();
  ts = AM.layer('tilt', { z: 1 });
  ui = AM.layer('ui', { z: 2 });
  fx = AM.layer('fx', { z: 3 });

  AM.sfx('bird', 0.2, { gain: 0.3 });
  AM.sfx('pop', C.panggung.start + 0.3, { gain: 0.35 });
  AM.sfx('click', C.ulin.start + 0.4, { gain: 0.38 });
  AM.sfx('bubble', C.batang.start + 0.4, { gain: 0.32 });
  AM.sfx('whoosh', C.kebun.start + 0.2, { gain: 0.28 });
  AM.sfx('chime', C.senja.start + 0.4, { gain: 0.38 });
  AM.sfx('chime', C.akhir.start + 0.4, { gain: 0.42 });
}

export function render(t, AM) {
  updateRiverLife(t);

  // Determine active segment & camera choreography
  let TS = { focus: 0.54, band: 0.11, soft: 0.22, max: 1 };
  let overlay = null;

  if (t < C.panggung.start) {
    const p = prog(t, 0, C.panggung.start, ease.inOutSine);
    S.clock(6.7, { fogNear: 90, fogFar: 720 });
    S.look([cx(-10) + 12, lerp(28, 22, p), lerp(12, -4, p)], [cx(-42), 2, -42], 32);
    overlay = () => {
      const ta = env(t, 0.2, C.panggung.start, 0.4, 0.35);
      K.titleBlock(ui, 'Arsitektur Tepian Banjar', 'Beranda di Atas', 540, 300, { alpha: ta, size: 92, line2: 'Sungai.' });
    };
  } else if (t < C.ulin.start) {
    const p = prog(t, C.panggung.start, C.ulin.start, ease.inOutSine);
    S.clock(6.9, { fogNear: 80, fogFar: 680 });
    const z0 = lerp(-18, -36, p);
    S.look([cx(z0) + 6, 14, z0], [cx(z0 - 16) - 24, 3.2, z0 - 16], 30);
    overlay = () => {
      const al = env(t, C.panggung.start + 0.3, C.ulin.start, 0.35, 0.3);
      K.label(ui, S, [cx(-34) - 24, 4.5, -34], 'Rumah Panggung', { sub: 'Menghadap Aliran Sungai', at: [540, 520], alpha: al, t, size: 66 });
    };
  } else if (t < C.batang.start) {
    const p = prog(t, C.ulin.start, C.batang.start, ease.inOutSine);
    S.clock(7.2, { fogNear: 70, fogFar: 650 });
    S.look([cx(-30) - 8, lerp(8, 5.5, p), -26], [cx(-36) - 23, 1.5, -36], 28);
    TS = { focus: 0.52, band: 0.08, soft: 0.18, max: 1 };
    overlay = () => {
      const al = env(t, C.ulin.start + 0.3, C.batang.start, 0.35, 0.3);
      K.label(ui, S, [cx(-36) - 22, 1.2, -36], 'Tiang Kayu Ulin', { sub: 'Kayu Besi Tahan Air Ratusan Tahun', at: [540, 540], alpha: al, t, size: 64 });
    };
  } else if (t < C.aktivitas.start) {
    const p = prog(t, C.batang.start, C.aktivitas.start, ease.inOutSine);
    S.clock(7.4, { fogNear: 70, fogFar: 650 });
    S.look([cx(-28) - 6, 6.5, lerp(-24, -30, p)], [cx(-36) - 18.5, 0.4, -36], 28);
    TS = { focus: 0.52, band: 0.08, soft: 0.18, max: 1 };
    overlay = () => {
      const al = env(t, C.batang.start + 0.3, C.aktivitas.start, 0.35, 0.3);
      K.label(ui, S, [cx(-36) - 18.5, 0.4, -36], 'Batang Apung', { sub: 'Rakit Gelondongan Mengikuti Pasang Surut', at: [540, 540], alpha: al, t, size: 64 });
    };
  } else if (t < C.kebun.start) {
    const p = prog(t, C.aktivitas.start, C.kebun.start, ease.inOutSine);
    S.clock(7.6, { fogNear: 80, fogFar: 700 });
    S.look([cx(-22) + lerp(-8, 10, p), 11, -22], [cx(-38) - 14, 0.8, -38], 30);
    overlay = () => {
      const al = env(t, C.aktivitas.start + 0.3, C.kebun.start, 0.35, 0.3);
      K.label(ui, S, [cx(-28) - 16, 0.8, -28], 'Dermaga Jukung', { sub: 'Titik Temu Warga & Pedagang Sayur', at: [540, 540], alpha: al, t, size: 64 });
    };
  } else if (t < C.senja.start) {
    const p = prog(t, C.kebun.start, C.senja.start, ease.inOutSine);
    S.clock(7.9, { fogNear: 100, fogFar: 780 });
    S.look([cx(-10), lerp(36, 48, p), lerp(10, 26, p)], [cx(-45), 2, -45], 34);
    overlay = () => {
      const al = env(t, C.kebun.start + 0.3, C.senja.start, 0.35, 0.3);
      K.label(ui, S, [cx(-42) + 25, 4.0, -42], 'Rumpun Nipah & Kelapa', { sub: 'Penahan Abrasi Tepian Sungai', at: [540, 520], alpha: al, t, size: 62 });
    };
  } else if (t < C.akhir.start) {
    const p = prog(t, C.senja.start, C.akhir.start, ease.inOutSine);
    const h = lerp(6.4, 4.85, p);
    S.clock(h, { fogNear: 85, fogFar: 680 });
    S.look([cx(-16) + 8, 18, -12], [cx(-46), 2.5, -46], 32);
    overlay = () => {
      const al = env(t, C.senja.start + 0.3, C.akhir.start, 0.35, 0.3);
      K.clockChip(ui, 540, 300, lerp(17.5, 19.0, p), { alpha: al, scale: 1.15 });
    };
  } else {
    const p = prog(t, C.akhir.start, AM.duration, ease.inOutSine);
    const h = lerp(4.85, 6.65, p);
    S.clock(h, { fogNear: 95, fogFar: 740 });
    S.look([cx(24) + 8, lerp(38, 32, p), lerp(28, 14, p)], [cx(-48), 1.5, -48], 34);
    overlay = () => {
      const ta = env(t, C.akhir.start + 0.3, AM.duration + 1, 0.5, 0.2);
      K.titleBlock(ui, 'Kearifan Tepian Banjar', 'Hidup Bersama Air', 540, 320, { alpha: ta, size: 96 });
    };
  }

  S.render(t);
  K.tiltShift(ts, S, TS);
  if (overlay) overlay();
  AM.lib.vignette(fx, { strength: 0.32, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.035, fps: 12 });
}

