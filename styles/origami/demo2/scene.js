// Origami demo2: "Sains Lipatan Origami — Dari Kertas Washi ke Panel Surya Teleskop Antariksa"
import * as K from '/styles/origami/kit.js';
import * as THREE from 'three';
const { clamp, lerp, ease, prog, env, hrand, mulberry32 } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'elegant', y: 1440, size: 60 } };

let S, rig, ui, fx;
const C = {}, SET = {}, O = {};
const DESK = [0, 0, 0], SPACE = [300, 0, 0], ARCH = [-300, 0, 0];
const v3 = (a, b = [0, 0, 0]) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export async function setup(AM) {
  S = K.createStage(AM, { pr: 0.7, aa: true, fov: 50 });
  ui = AM.layer('ui', { z: 5 });
  fx = AM.layer('fx', { z: 6 });
  for (const l of AM.timeline.lines) C[l.id] = l;
  rig = K.lightRig(S.scene);
  O.sky = {
    studio: K.skyTexture({ top: '#e5d4b8', low: '#f9efe0', glow: '#fff7e8', gy: 0.55, seed: 2 }),
    cosmos: K.skyTexture({ top: '#141e33', low: '#2a3d5c', glow: '#53729e', gy: 0.35, seed: 11 }),
    dawn: K.skyTexture({ top: '#d8b798', low: '#faead4', glow: '#fff5e2', gy: 0.65, seed: 19 }),
  };
  S.scene.fog = new THREE.Fog('#f5e8d3', 35, 130);
  buildStudio();
  buildSpace();
  buildArch();
  O.flock = K.makeFlock(180, { seed: 22 }); S.scene.add(O.flock);

  AM.sfx('paper', 0.08, { gain: 0.5 });
  AM.sfx('paper', C.aturan.start + 0.2, { gain: 0.45, pitch: 1.15 });
  AM.sfx('magic', C.bangau.start + 0.3, { gain: 0.35 });
  AM.sfx('paper', C.miura.start + 0.25, { gain: 0.5, pitch: 0.9 });
  AM.sfx('swoosh_up', C.satelit.start + 0.2, { gain: 0.38 });
  AM.sfx('ding', C.medis.start + 0.3, { gain: 0.35 });
  AM.sfx('whoosh', C.arsitektur.start + 0.2, { gain: 0.32 });
  AM.sfx('bell_temple', C.moral.start + 0.4, { gain: 0.45 });
}

function group(at) { const g = new THREE.Group(); g.position.set(...at); S.scene.add(g); return g; }

function buildMiuraMesh(nx = 6, nz = 4, { tex, back, gold = false } = {}) {
  const g = new THREE.Group();
  const mat = gold ? K.goldMat() : K.paperMat(tex, { back });
  const cells = [];
  for (let ix = 0; ix < nx; ix++) {
    for (let iz = 0; iz < nz; iz++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), mat);
      m.castShadow = m.receiveShadow = true;
      g.add(m);
      cells.push({ m, ix, iz });
    }
  }
  g.deploy = (u) => {
    // u = 0: tightly accordion-folded; u = 1: flat expanded solar wing
    const open = clamp(u, 0.08, 1);
    const sx = 0.54 * open, sz = 0.54 * (0.35 + 0.65 * open);
    const tilt = (1 - open) * 1.18;
    for (const c of cells) {
      const signX = c.ix % 2 === 0 ? 1 : -1;
      const signZ = c.iz % 2 === 0 ? 1 : -1;
      const x = (c.ix - (nx - 1) / 2) * sx + signZ * (1 - open) * 0.08;
      const z = (c.iz - (nz - 1) / 2) * sz;
      const y = ((c.ix + c.iz) % 2) * (1 - open) * 0.22;
      c.m.position.set(x, y, z);
      c.m.rotation.set(signZ * tilt * 0.55, 0, signX * tilt);
    }
  };
  g.deploy(0.5);
  return g;
}

function buildStudio() {
  const g = SET.studio = group(DESK), r = mulberry32(15);
  g.add(K.paperGround({ size: 180, tex: K.washi('wood', '#dec7a2', 'rgba(130,90,50,0.3)', { repeat: [14, 14] }) }));
  // Crease-pattern mat on the table
  const matPlane = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6.5), K.paperMat(K.washi('crease', '#f9f4e8', 'rgba(165,120,75,0.45)', { repeat: [3, 3] })));
  matPlane.rotation.x = -Math.PI / 2; matPlane.position.y = 0.015; matPlane.receiveShadow = true; g.add(matPlane);

  O.sheet = K.makeFoldSheet({ tex: K.washi('asanoha', K.PAL.vermilion, '#f7c9a0'), back: K.washi('crease', K.PAL.white, 'rgba(150,120,90,0.45)'), h: 0.85 });
  g.add(O.sheet);
  O.crane = K.makeCrane({ tex: K.washi('asanoha', K.PAL.vermilion, '#f7c9a0', { repeat: [1.3, 1.3] }) });
  g.add(O.crane);
  O.miura = buildMiuraMesh(8, 5, { tex: K.washi('seigaiha', K.PAL.indigo, '#d9e4f0', { repeat: [1, 1] }), back: K.washi('plain', '#f5f0e5', '#fff') });
  O.miura.position.set(0, 0.65, 0);
  g.add(O.miura);

  // Surrounding paper mountains & trees in distance
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const m = K.paperMountain({ h: 5 + r() * 6, r: 5 + r() * 3, seg: 6, color: ['#cbbba0', '#b7c4cf', '#d5c7b2'][i % 3], snow: i % 3 === 0, seed: 50 + i });
    m.position.set(Math.sin(a) * 36, 0, Math.cos(a) * 36 - 10);
    g.add(m);
  }
}

function buildSpace() {
  const g = SET.space = group(SPACE), r = mulberry32(77);
  // Paper stars & planets in cosmos
  for (let i = 0; i < 65; i++) {
    const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.18 + r() * 0.25, 0), K.goldMat());
    st.position.set((r() - 0.5) * 70, -10 + r() * 35, -15 - r() * 45);
    g.add(st);
  }
  // Origami Telescope with hexagonal folded gold mirror + Miura solar wings
  const sat = new THREE.Group(); sat.position.set(0, 2.2, 0); g.add(sat); O.sat = sat;
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 1.6, 6), K.paperMat(K.washi('plain', '#d8dde6', '#fff', { seed: 61 })));
  bus.rotation.x = Math.PI / 2; sat.add(bus);
  // 19-segment folded hexagonal primary mirror (JWST style)
  const mirror = new THREE.Group(); mirror.position.set(0, 0.3, 0.85); sat.add(mirror); O.mirror = mirror;
  const hexCoords = [[0, 0], [1, 0], [-1, 0], [0.5, 0.86], [-0.5, 0.86], [0.5, -0.86], [-0.5, -0.86], [1.5, 0.86], [-1.5, 0.86], [1.5, -0.86], [-1.5, -0.86], [0, 1.72], [0, -1.72]];
  mirror.cells = hexCoords.map(([hx, hy], idx) => {
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.06, 6), K.goldMat());
    h.rotation.x = Math.PI / 2;
    h.userData = { hx: hx * 0.66, hy: hy * 0.66, idx };
    mirror.add(h);
    return h;
  });
  // Left & Right Miura solar arrays
  O.wingL = buildMiuraMesh(6, 3, { tex: K.washi('kikko', '#233b6e', '#d6b15c', { repeat: [1, 1] }) });
  O.wingR = buildMiuraMesh(6, 3, { tex: K.washi('kikko', '#233b6e', '#d6b15c', { repeat: [1, 1] }) });
  O.wingL.position.set(-2.5, 0, 0); O.wingR.position.set(2.5, 0, 0);
  sat.add(O.wingL, O.wingR);

  // Origami Stent (cylindrical folded mesh for medical shot)
  const stent = new THREE.Group(); stent.position.set(0, -12, 0); g.add(stent); O.stent = stent;
  stent.rings = [];
  for (let rIdx = 0; rIdx < 6; rIdx++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.07, 6, 12), K.goldMat());
    ring.position.z = (rIdx - 2.5) * 0.42;
    stent.add(ring);
    stent.rings.push(ring);
  }
}

function buildArch() {
  const g = SET.arch = group(ARCH), r = mulberry32(99);
  g.add(K.paperGround({ size: 200, tex: K.washi('plain', '#ede2cc', '#fff', { seed: 71, repeat: [20, 20] }) }));
  // Yoshimura / Miura folded architectural vault pavilion
  const dome = new THREE.Group(); dome.position.set(0, 0, -2); g.add(dome); O.dome = dome;
  const archN = 10;
  for (let i = 0; i < archN; i++) {
    const a = (i / (archN - 1) - 0.5) * Math.PI * 0.85;
    const rib = buildMiuraMesh(5, 2, { tex: K.washi('asanoha', K.PAL.cream, '#c9b493', { repeat: [1, 1] }) });
    rib.deploy(0.72);
    rib.position.set(Math.sin(a) * 3.8, Math.cos(a) * 2.8 + 0.4, 0);
    rib.rotation.z = -a;
    dome.add(rib);
  }
  for (let i = 0; i < 20; i++) {
    const a = r() * Math.PI * 2, d = 8 + r() * 20;
    const t = K.paperTree({ h: 1.4 + r() * 1.6, color: ['#527e4c', '#6c9956', '#d88b7c'][i % 3], seed: 90 + i });
    t.position.set(Math.sin(a) * d, 0, Math.cos(a) * d - 4);
    g.add(t);
  }
  const sun = K.paperSun({ r: 4.2, color: '#f39a55', ray: '#f8c58c' }); sun.position.set(0, 15, -65);
  sun.traverse((o) => { if (o.material) o.material.fog = false; }); g.add(sun);
}

function show(...names) {
  for (const k in SET) SET[k].visible = names.includes(k);
  O.flock.visible = names.includes('flock');
}

const MOOD = {
  studio: { sun: '#ffe9c9', sunI: 2.5, sky: '#e8eefc', ground: '#e6d2b0', hemiI: 1.35, rim: '#ffd4a6', rimI: 1.0 },
  cosmos: { sun: '#fff4df', sunI: 2.8, sky: '#5572a8', ground: '#1c2538', hemiI: 1.0, rim: '#8ab4ff', rimI: 1.5 },
  dawn: { sun: '#ffd09b', sunI: 2.5, sky: '#f3decb', ground: '#e2c39c', hemiI: 1.25, rim: '#ffc188', rimI: 1.4 },
};

const SHOTS = []; const shot = (id, next, fn) => SHOTS.push({ id, next, fn });
const span = (id, next) => [C[id].start - 0.12, next ? C[next].start - 0.12 : AM.duration + 1];

// 1. Hook: Flat washi sheet begins creasing on the studio table
shot('hook', 'aturan', (t, a, b) => {
  show('studio'); S.scene.background = O.sky.studio; S.scene.fog.color.set('#f5e8d3'); rig.mood(MOOD.studio);
  rig.aim(DESK, { r: 4, dir: [0.5, 1, 0.7] });
  O.sheet.visible = true; O.crane.visible = false; O.miura.visible = false;
  const p = prog(t, a, b, ease.inOutCubic);
  O.sheet.fold(lerp(0.1, 0.85, p), lerp(0, 0.35, p));
  O.sheet.position.set(0, 0.05 + Math.sin(t * 2) * 0.02, 0);
  O.sheet.rotation.set(0, t * 0.25, 0);
  K.look(S.cam, [lerp(0.2, 1.4, p), lerp(2.8, 1.9, p), lerp(2.2, 2.8, p)], [0, 0.15, 0], { t, drift: 0.015, fov: 48 });
  K.title(ui, 'ORIGAMI & ANTARIKSA', 540, 340, { size: 76, alpha: env(t, a + 0.1, b, 0.35, 0.25), kanji: '折り紙科学', sub: 'dari kertas washi ke teleskop bintang' });
});

// 2. Aturan: One uncut square sheet — no scissors, no glue
shot('aturan', 'bangau', (t, a, b) => {
  show('studio'); S.scene.background = O.sky.studio; rig.mood(MOOD.studio);
  O.sheet.visible = true; O.crane.visible = false; O.miura.visible = false;
  const p = prog(t, a, b, ease.inOutCubic);
  const f1 = Math.sin(p * Math.PI);
  O.sheet.fold(0.85 * f1 + 0.15, 0.85 * p);
  O.sheet.position.set(0, 0.12 + p * 0.25, 0);
  O.sheet.rotation.set(-0.2 * p, 0.4 + p * 0.8, 0);
  K.look(S.cam, [-1.5, 2.1, 2.5], [0, 0.2, 0], { t, drift: 0.012, fov: 46 });
  K.tag(ui, 'SATU LEMBAR PERSEGI UTUH', 540, 310, { size: 46, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'tanpa gunting · tanpa lem', kanji: '不切正方形一枚折り' });
});

// 3. Bangau: Mountain and valley folds pop into a 3D crane
shot('bangau', 'miura', (t, a, b) => {
  show('studio'); S.scene.background = O.sky.studio; rig.mood(MOOD.studio);
  O.sheet.visible = false; O.crane.visible = true; O.miura.visible = false;
  const p = prog(t, a, b, ease.inOutCubic);
  const pose = K.mixPose(K.CRANE_POSE.folded, K.CRANE_POSE.standing, clamp(p * 1.4));
  pose.wing = K.flap(t, 1.4, 0, 0.75, 0.2);
  O.crane.pose(pose);
  O.crane.scale.setScalar(0.65);
  O.crane.position.set(0, 0.85 + Math.sin(t * 2.5) * 0.06, 0);
  O.crane.rotation.set(0, t * 0.45, 0);
  K.look(S.cam, [lerp(1.4, 0.6, p), 1.35, 2.4], [0, 0.85, 0], { t, drift: 0.015, fov: 46 });
  K.tag(ui, 'LIPATAN GUNUNG & LEMBAH', 540, 310, { size: 46, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'bidang datar menjadi struktur 3D kokoh', accent: K.PAL.vermilion });
});

// 4. Miura-ori: Parallelogram tessellation expanding & contracting in one pull
shot('miura', 'satelit', (t, a, b) => {
  show('studio'); S.scene.background = O.sky.studio; rig.mood(MOOD.studio);
  O.sheet.visible = false; O.crane.visible = false; O.miura.visible = true;
  const p = prog(t, a, b);
  const open = 0.2 + 0.78 * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
  O.miura.deploy(open);
  O.miura.rotation.set(0.35, Math.sin(t * 0.6) * 0.35, 0);
  K.look(S.cam, [0, 2.8, 3.4], [0, 0.6, 0], { t, drift: 0.012, fov: 48 });
  K.tag(ui, 'POLA MIURA-ORI · 1970', 540, 300, { size: 50, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'Koryo Miura · membuka dengan satu tarikan sudut', kanji: '三浦折り' });
});

// 5. Satelit: Space telescope mirror & Miura solar panels unfurling in orbit
shot('satelit', 'medis', (t, a, b) => {
  show('space'); S.scene.background = O.sky.cosmos; S.scene.fog.color.set('#1b2942'); rig.mood(MOOD.cosmos);
  rig.aim(v3(SPACE, [0, 2, 0]), { r: 7, dir: [0.6, 0.8, 0.7] });
  O.sat.visible = true; O.stent.visible = false;
  const p = prog(t, a, b, ease.inOutCubic);
  O.wingL.deploy(lerp(0.15, 0.96, p));
  O.wingR.deploy(lerp(0.15, 0.96, p));
  O.wingL.position.x = -lerp(1.1, 2.7, p);
  O.wingR.position.x = lerp(1.1, 2.7, p);
  for (const h of O.mirror.cells) {
    const fold = Math.max(0, 1 - p * 1.3);
    h.position.set(h.userData.hx * (1 - fold * 0.45), h.userData.hy * (1 - fold * 0.45), -fold * 0.4);
    h.rotation.y = fold * (h.userData.hx > 0 ? 0.8 : -0.8);
  }
  O.sat.rotation.set(0.15, -0.35 + p * 0.55, 0.08);
  K.look(S.cam, v3(SPACE, [lerp(2.2, 3.6, p), 2.8, lerp(4.8, 6.2, p)]), v3(SPACE, [0, 2.2, 0]), { t, drift: 0.018, fov: 50 });
  K.tag(ui, 'TELESKOP & PANEL SURYA ANTARIKSA', 540, 300, { size: 42, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'dilipat ke dalam roket · mekar di orbit', accent: K.PAL.gold });
});

// 6. Medis: Origami medical stent expanding cleanly
shot('medis', 'arsitektur', (t, a, b) => {
  show('space'); S.scene.background = O.sky.cosmos; rig.mood(MOOD.cosmos);
  O.sat.visible = false; O.stent.visible = true;
  O.stent.position.set(0, 2.2, 0);
  const p = prog(t, a, b, ease.inOutCubic);
  const exp = lerp(0.38, 1.15, p);
  O.stent.rings.forEach((r, idx) => {
    r.scale.set(exp, exp, 1);
    r.position.z = (idx - 2.5) * lerp(0.22, 0.48, p);
    r.rotation.z = idx * 0.3 + t * 0.6;
  });
  O.stent.rotation.set(0.35, t * 0.4, 0.15);
  K.look(S.cam, v3(SPACE, [1.8, 2.6, 3.8]), v3(SPACE, [0, 2.2, 0]), { t, drift: 0.015, fov: 46 });
  K.tag(ui, 'STENT JANTUNG MIKRO', 540, 300, { size: 48, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'masuk menyempit · mengembang di pembuluh darah', accent: K.PAL.vermilion });
});

// 7. Arsitektur: Folded-plate pavilion dome in the landscape
shot('arsitektur', 'moral', (t, a, b) => {
  show('arch'); S.scene.background = O.sky.dawn; S.scene.fog.color.set('#f4dfc8'); rig.mood(MOOD.dawn);
  rig.aim(v3(ARCH, [0, 2, -2]), { r: 9, dir: [0.5, 0.8, 0.8] });
  const p = prog(t, a, b, ease.inOutSine);
  K.look(S.cam, v3(ARCH, [lerp(-4.5, 3.5, p), lerp(2.0, 2.8, p), 7.8]), v3(ARCH, [0, 1.8, -2]), { t, drift: 0.015, fov: 52 });
  K.tag(ui, 'ARSITEKTUR LIPAT & KANTUNG UDARA', 540, 300, { size: 42, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'geometri kubah tahan gempa & rekayasa modern', accent: K.PAL.indigo });
});

// 8. Moral: Flock of paper cranes soaring above the folded pavilion into the dawn sky
shot('moral', null, (t, a, b) => {
  show('arch', 'flock'); S.scene.background = O.sky.dawn; S.scene.fog.color.set('#f4dfc8'); rig.mood(MOOD.dawn);
  const p = prog(t, a, b, ease.inOutSine);
  O.flock.update(t, (i, tt, o) => {
    if (i > 120) { o.visible = false; return; }
    const ang = tt * 0.45 + (i / 120) * Math.PI * 2;
    const rad = 3.5 + (i % 9) * 1.1;
    o.x = ARCH[0] + Math.cos(ang) * rad;
    o.z = ARCH[2] - 2 + Math.sin(ang) * rad;
    o.y = 2.5 + (i % 7) * 0.85 + p * 2.5;
    o.yaw = -ang; o.bank = -0.22; o.s = 0.42;
    o.flap = K.flap(tt, 1.5, hrand(i, 3));
  });
  K.look(S.cam, v3(ARCH, [lerp(2.5, 0, p), lerp(2.2, 4.2, p), lerp(8.5, 11.5, p)]), v3(ARCH, [0, lerp(2.2, 5.2, p), -2]), { t, drift: 0.02, fov: 52 });
  K.title(ui, 'MELIPAT MASA DEPAN', 540, 360, { size: 78, alpha: env(t, a + 0.2, b + 0.5, 0.4, 0.2), kanji: '未来を折る', sub: 'seni tradisional · sains tanpa batas' });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id, s.next);
  s.fn(t, Math.max(0, a), b);
  S.render();
  const since = t - Math.max(0, a);
  if (since < 0.16 && s.id !== 'hook') { fx.fillStyle = `rgba(255,250,238,${0.28 * (1 - since / 0.16)})`; fx.fillRect(0, 0, AM.W, AM.H); }
  K.paperFinish(fx, t, { tex: 0.16, vig: 0.32, grainAmt: 0.035 });
}

