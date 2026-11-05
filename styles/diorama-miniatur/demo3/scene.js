// Diorama Miniatur — Demo 3: Perjalanan Perahu Klotok Menembus Kabut Subuh (65s)
import * as K from '/styles/diorama-miniatur/kit.js';
import * as THREE from 'three';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = {
  fps: 24,
  captions: { preset: 'bold', y: 1455, size: 66, active: '#ffd166', strokeColor: '#2a160a' },
};

let S, W, ui, ts, fx, rip;
const C = {};
const ACTORS = { jukungs: [] };
const cx = (z) => K.riverX(z);

function buildKlotokVoyage() {
  const hero = new THREE.Mesh(
    K.klotokGeo({ len: 9.5, hull: '#2f6fa0', trim: '#f4ebd6', roof: '#b8483a', seed: 21 }),
    K.MAT.double
  );
  hero.castShadow = true;
  hero.receiveShadow = true;
  S.scene.add(hero);
  ACTORS.hero = hero;

  const kl2 = new THREE.Mesh(
    K.klotokGeo({ len: 8.5, hull: '#3d7a5a', trim: '#f4ebd6', roof: '#c97a2b', seed: 29 }),
    K.MAT.double
  );
  kl2.castShadow = true;
  S.scene.add(kl2);
  ACTORS.kl2 = kl2;

  const kinds = [
    ['pisang', 'jeruk'],
    ['sayur', 'kue'],
    ['kelapa', 'pisang'],
    ['jeruk', 'bakul'],
    ['kue', 'sayur'],
  ];
  for (let i = 0; i < 5; i++) {
    const len = 5.8;
    const g = new THREE.Group();
    const hull = new THREE.Mesh(K.jukungGeo({ len, cargoKinds: kinds[i], seed: i + 31 }), K.MAT.double);
    hull.castShadow = true;
    g.add(hull);
    const ac = K.acil({ baju: K.PAL.baju[(i * 2) % K.PAL.baju.length], seed: i + 10 });
    ac.root.position.set(-len * 0.32, -0.22, 0);
    g.add(ac.root);
    S.scene.add(g);
    ACTORS.jukungs.push({ g, ac, z0: -25 - i * 16, side: i % 2 ? 8.5 : -8.5, ph: i * 1.3 });
  }

  const eg = K.egret();
  eg.root.scale.setScalar(1.65);
  S.scene.add(eg.root);
  ACTORS.egret = eg;
}

function updateVoyage(t) {
  // Hero klotok cruises steadily along the river centreline from z = 10 toward z = -120
  const hz = 10 - (t * 1.75) % 120;
  const hx = cx(hz) - 1.5;
  const dx = cx(hz - 2) - cx(hz);
  const yaw = Math.PI / 2 + Math.atan2(dx, 2) * 0.6;
  ACTORS.hero.position.set(hx, 0.16 + Math.sin(t * 2.2) * 0.04, hz);
  ACTORS.hero.rotation.set(0, yaw, Math.sin(t * 2.6) * 0.025);
  ACTORS.heroPos = [hx, 0.8, hz];

  // Second klotok cruising opposite direction
  const k2z = -95 + (t * 1.35) % 110;
  const k2x = cx(k2z) + 7.5;
  ACTORS.kl2.position.set(k2x, 0.15 + Math.sin(t * 2.0 + 1) * 0.04, k2z);
  ACTORS.kl2.rotation.set(0, -Math.PI / 2, Math.sin(t * 2.1) * 0.02);

  const rl = [];
  // Wake ripples behind hero klotok
  for (let k = 0; k < 10; k++) {
    const age = ((t * 1.8 + k * 0.1) % 1);
    rl.push({ x: hx + (k % 2 - 0.5) * age * 2.4, z: hz + 4.5 + age * 7.5, age, size: 1.35 });
  }

  // Passing jukung boats
  ACTORS.jukungs.forEach((j, i) => {
    const jz = j.z0 + Math.sin(t * 0.25 + j.ph) * 2.5;
    const jx = cx(jz) + j.side;
    j.g.position.set(jx, 0.08 + Math.sin(t * 1.9 + j.ph) * 0.04, jz);
    j.g.rotation.set(0, -Math.PI / 2 + Math.sin(t * 0.2 + j.ph) * 0.1, 0);
    K.acilPose(j.ac, t * 2.3 + j.ph, { amt: 0.9, look: 0.2 });
    const age = (t * 0.8 + i * 0.2) % 1;
    rl.push({ x: jx, z: jz - 2.2, age, size: 0.9 });
  });

  // Egret flying alongside
  const E = ACTORS.egret;
  E.root.position.set(hx + 5.5 + Math.sin(t * 0.7) * 2.5, 4.6 + Math.sin(t * 1.5) * 0.6, hz - 4);
  E.root.rotation.set(0, Math.PI / 2, 0);
  const fl = Math.sin(t * 7.2) * 0.78;
  E.wings[0].rotation.x = fl;
  E.wings[1].rotation.x = -fl;

  rip.set(rl);
}

export async function setup(AM) {
  for (const l of AM.timeline.lines) C[l.id] = l;
  S = K.stage(AM, { pr: 0.7, shadow: 1024, fov: 30, shadowBox: 65 });
  W = K.riverWorld(S, { seed: 19, houses: true });
  K.mist(S, { y: 1.25 });
  rip = K.ripples(S, 64);
  buildKlotokVoyage();
  ts = AM.layer('tilt', { z: 1 });
  ui = AM.layer('ui', { z: 2 });
  fx = AM.layer('fx', { z: 3 });

  AM.sfx('bird', 0.3, { gain: 0.28 });
  AM.sfx('pop', C.klotok.start + 0.3, { gain: 0.35 });
  AM.sfx('chime', C.subuh.start + 0.3, { gain: 0.35 });
  AM.sfx('wind', C.kabut.start + 0.2, { gain: 0.22 });
  AM.sfx('bubble', C.papasan.start + 0.3, { gain: 0.32 });
  AM.sfx('bird', C.kuntul.start + 0.3, { gain: 0.35, pitch: 1.15 });
  AM.sfx('chime', C.akhir.start + 0.4, { gain: 0.42 });
}

export function render(t, AM) {
  updateVoyage(t);
  const [hx, hy, hz] = ACTORS.heroPos;
  let TS = { focus: 0.54, band: 0.11, soft: 0.22, max: 1 };
  let overlay = null;

  if (t < C.klotok.start) {
    const p = prog(t, 0, C.klotok.start, ease.inOutSine);
    S.clock(6.4, { fogNear: 80, fogFar: 700 });
    S.look([hx + 16, lerp(28, 20, p), hz + 24], [hx, hy, hz - 6], 32);
    overlay = () => {
      const ta = env(t, 0.2, C.klotok.start, 0.4, 0.35);
      K.titleBlock(ui, 'Nadi Seribu Sungai', 'Perahu Klotok', 540, 300, { alpha: ta, size: 96 });
    };
  } else if (t < C.subuh.start) {
    const p = prog(t, C.klotok.start, C.subuh.start, ease.inOutSine);
    S.clock(6.5, { fogNear: 70, fogFar: 640 });
    S.look([hx + lerp(11, 8, p), 5.8, hz + 11], [hx, hy + 0.5, hz], 28);
    TS = { focus: 0.52, band: 0.08, soft: 0.18, max: 1 };
    overlay = () => {
      const al = env(t, C.klotok.start + 0.3, C.subuh.start, 0.35, 0.3);
      K.label(ui, S, [hx, hy + 1.4, hz], 'Perahu Klotok', { sub: 'Taksi Air Bermesin Diesel Khas Banjar', at: [540, 540], alpha: al, t, size: 64 });
    };
  } else if (t < C.kabut.start) {
    const p = prog(t, C.subuh.start, C.kabut.start, ease.inOutSine);
    S.clock(lerp(5.1, 5.75, p), { fogNear: 60, fogFar: 560 });
    S.look([hx - 14, 12, hz + 18], [hx, hy, hz - 8], 32);
    overlay = () => {
      const al = env(t, C.subuh.start + 0.3, C.kabut.start, 0.35, 0.3);
      K.clockChip(ui, 540, 300, lerp(5.0, 5.5, p), { alpha: al, scale: 1.15 });
    };
  } else if (t < C.papasan.start) {
    const p = prog(t, C.kabut.start, C.papasan.start, ease.inOutSine);
    S.clock(lerp(5.8, 6.3, p), { fogNear: 45, fogFar: 520 });
    S.look([hx + 4, 4.2, hz + 14], [hx, hy, hz - 25], 34);
    TS = { focus: 0.5, band: 0.08, soft: 0.2, max: 1 };
    overlay = () => {
      const al = env(t, C.kabut.start + 0.3, C.papasan.start, 0.35, 0.3);
      K.titleBlock(ui, 'Sungai Martapura', 'Membelah Kabut Pagi', 540, 300, { alpha: al, size: 78 });
    };
  } else if (t < C.kuntul.start) {
    const p = prog(t, C.papasan.start, C.kuntul.start, ease.inOutSine);
    S.clock(6.7, { fogNear: 75, fogFar: 660 });
    S.look([hx + lerp(-12, 12, p), 14, hz + 16], [hx, hy, hz - 4], 30);
    overlay = () => {
      const al = env(t, C.papasan.start + 0.3, C.kuntul.start, 0.35, 0.3);
      K.label(ui, S, [hx + 8.5, 0.8, hz - 3], 'Berpapasan Jukung', { sub: 'Jalur Niaga Pagi Menuju Pasar', at: [540, 540], alpha: al, t, size: 64 });
    };
  } else if (t < C.fajar.start) {
    const p = prog(t, C.kuntul.start, C.fajar.start, ease.inOutSine);
    S.clock(7.1, { fogNear: 85, fogFar: 720 });
    S.look([hx + 14, lerp(10, 14, p), hz + 10], [hx + 4, 3.5, hz - 4], 30);
    overlay = () => {
      const al = env(t, C.kuntul.start + 0.3, C.fajar.start, 0.35, 0.3);
      K.label(ui, S, [hx + 5.5, 4.6, hz - 4], 'Burung Kuntul', { sub: 'Satwa Rawa & Tepian Sungai', at: [540, 520], alpha: al, t, size: 64 });
    };
  } else if (t < C.akhir.start) {
    const p = prog(t, C.fajar.start, C.akhir.start, ease.inOutSine);
    S.clock(lerp(7.3, 8.8, p), { fogNear: 110, fogFar: 820 });
    S.look([hx - 16, lerp(26, 38, p), hz + 28], [hx, 0, hz - 12], 34);
    overlay = () => {
      const al = env(t, C.fajar.start + 0.3, C.akhir.start, 0.35, 0.3);
      K.clockChip(ui, 540, 300, lerp(7.3, 8.8, p), { alpha: al, scale: 1.15 });
    };
  } else {
    const p = prog(t, C.akhir.start, AM.duration, ease.inOutSine);
    S.clock(6.8, { fogNear: 95, fogFar: 760 });
    S.look([hx + 12, lerp(34, 26, p), hz + 26], [hx, 0.5, hz - 10], 32);
    overlay = () => {
      const ta = env(t, C.akhir.start + 0.3, AM.duration + 1, 0.5, 0.2);
      K.titleBlock(ui, 'Kota Seribu Sungai', 'Detak Jantung Banjar', 540, 320, { alpha: ta, size: 92 });
    };
  }

  S.render(t);
  K.tiltShift(ts, S, TS);
  if (overlay) overlay();
  AM.lib.vignette(fx, { strength: 0.32, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.035, fps: 12 });
}

