// Dunia Blok demo 2: "Letusan Gunung Krakatau 1883 & Lahirnya Anak Krakatau" (10 shots).
import * as K from '/styles/dunia-blok/kit.js';
const THREE = K.THREE;
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'pixel', y: 1470, size: 38 } };

let S, ui, C = {}, W;
const Wt = (id, w) => AM.wordTime(id, w);

let sky, key, hemi;
let bantenCoast, rakataGroup, northBlocks, anakBlocks;
let ship1, ship2, waveGroup, ringGroup, plumeGroup, plumeTiers = [];
let lavaBurst, ashRain, anakSparkle;

function buildWorld() {
  W = new THREE.Scene(); W.fog = new THREE.Fog('#cfe8ff', 70, 220);
  sky = K.skyDome(); W.add(sky);
  hemi = new THREE.HemisphereLight('#d8ecff', '#5a6a7a', 1.1); W.add(hemi);
  key = new THREE.DirectionalLight('#fff0d0', 2.0); key.position.set(35, 55, 28); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 10, far: 180 }); key.shadow.bias = -0.0008;
  W.add(key, key.target);

  // Sunda Strait Ocean
  const sea = K.vbox(240, 2, 240, 'water', { cast: false });
  sea.position.set(0, -1, 0);
  W.add(sea);

  // Coastal Banten strip (+x) for tsunami shot
  bantenCoast = new THREE.Group();
  const bSand = K.vbox(18, 1.2, 60, 'sand'); bSand.position.set(32, 0.4, 0);
  const bGrass = K.vbox(18, 2.2, 60, 'grass'); bGrass.position.set(38, 1.2, 0);
  bantenCoast.add(bSand, bGrass);
  for (let i = 0; i < 10; i++) {
    const tr = K.voxTree(3, i + 10, { palm: true });
    tr.position.set(31 + (i % 3) * 3, 2.2, -20 + i * 4.5);
    bantenCoast.add(tr);
  }
  W.add(bantenCoast);

  // Rakata peak (south peak, z=+7, survives 1883 eruption)
  rakataGroup = new THREE.Group();
  const rBeach = K.vbox(16, 1, 14, 'sand'); rBeach.position.set(0, 0.5, 7); rakataGroup.add(rBeach);
  for (let y = 0; y < 11; y++) {
    const w = Math.max(2, 13 - y * 1.05);
    const tier = K.vbox(w, 1, w, y < 3 ? 'grass' : y < 8 ? 'rock' : 'andesitDark');
    tier.position.set(0, 1 + y + 0.5, 7 + y * 0.15);
    rakataGroup.add(tier);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 1.2 - 0.6;
    const tr = K.voxTree(2, i, { palm: i % 2 === 0 });
    tr.position.set(Math.cos(a) * 6, 2, 7 + Math.sin(a) * 5);
    rakataGroup.add(tr);
  }
  W.add(rakataGroup);

  // Collapsing northern & central peaks (Perboewatan z=-7.5, Danan z=-0.5)
  northBlocks = new K.Blocks({ drop: 7, dur: 0.4 });
  const tBlast = Wt('puncak', 'empat');
  let bIdx = 0;
  for (let y = 0; y < 9; y++) {
    const rD = Math.max(1, Math.round(5.5 - y * 0.55));
    for (let x = -rD; x <= rD; x++) for (let z = -rD; z <= rD; z++) {
      if (x * x + z * z > (rD + 0.3) * (rD + 0.3)) continue;
      const type = y === 0 ? 'sand' : y < 3 ? 'grass' : y < 7 ? 'rock' : 'lava';
      northBlocks.add(x, y + 0.5, z - 0.5, type, -1, { tout: tBlast + (bIdx++ % 15) * 0.04 });
    }
  }
  for (let y = 0; y < 7; y++) {
    const rP = Math.max(1, Math.round(4.5 - y * 0.55));
    for (let x = -rP; x <= rP; x++) for (let z = -rP; z <= rP; z++) {
      if (x * x + z * z > (rP + 0.3) * (rP + 0.3)) continue;
      const type = y === 0 ? 'sand' : y < 2 ? 'grass' : y < 5 ? 'rock' : 'lava';
      northBlocks.add(x, y + 0.5, z - 7.5, type, -1, { tout: tBlast + (bIdx++ % 15) * 0.04 });
    }
  }
  northBlocks.build(W);

  // Plume cloud column (stacked ash/lava voxel slabs rising above crater)
  plumeGroup = new THREE.Group();
  for (let k = 0; k < 10; k++) {
    const w = 3 + k * 1.35;
    const p = K.vbox(w, 1.8, w, k < 2 ? 'lava' : 'ash', { cast: false });
    plumeGroup.add(p);
    plumeTiers.push({ m: p, k });
  }
  W.add(plumeGroup);

  // Voxel ships sailing through Sunda Strait
  ship1 = K.voxShip(-14, 0, -4, { s: 0.95 });
  ship2 = K.voxShip(13, 0, 5, { s: 0.8 });
  W.add(ship1, ship2);

  // Tsunami wave wall (tiered water & snow foam blocks)
  waveGroup = new THREE.Group();
  for (let z = -18; z <= 18; z += 3) {
    const wBase = K.vbox(3.2, 4.5, 2.8, 'water'); wBase.position.set(0, 2.2, z);
    const wMid = K.vbox(2.4, 3.5, 2.8, 'water'); wMid.position.set(-0.6, 5.5, z);
    const wCrest = K.vbox(2.0, 1.4, 2.8, 'snow'); wCrest.position.set(0.4, 7.6, z);
    waveGroup.add(wBase, wMid, wCrest);
  }
  W.add(waveGroup);

  // Shockwave voxel ring for Shot 'suara' (sound heard 4,800 km away)
  ringGroup = new THREE.Group();
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * TAU;
    const seg = K.vbox(2.2, 0.9, 1.2, i % 2 ? 'snow' : 'gold', { cast: false });
    seg.position.set(Math.cos(a) * 10, 1.2, Math.sin(a) * 10);
    seg.rotation.y = -a;
    ringGroup.add(seg);
  }
  W.add(ringGroup);

  // Anak Krakatau rising block-by-block in Shot 'anak'
  anakBlocks = new K.Blocks({ drop: 9, dur: 0.42 });
  const tAnak0 = C.anak.start + 0.25;
  const durAnak = Math.max(2.5, (C.anak.end - C.anak.start) * 0.65);
  let aIdx = 0;
  for (let y = 0; y < 8; y++) {
    const rA = Math.max(1, Math.round(5.0 - y * 0.55));
    for (let x = -rA; x <= rA; x++) for (let z = -rA; z <= rA; z++) {
      if (x * x + z * z > (rA + 0.25) * (rA + 0.25)) continue;
      const type = y === 0 ? 'sand' : y < 6 ? 'andesitDark' : 'lava';
      const tDrop = tAnak0 + (y / 8) * durAnak + ((aIdx++ % 7) * 0.04);
      anakBlocks.add(x, y + 0.5, z - 2.5, type, tDrop, { drop: 9, spin: 1.2 });
    }
  }
  anakBlocks.build(W);

  // Particle bursts
  lavaBurst = K.cubeBurst({ n: 80, type: 'lava', size: 0.9, speed: 14, up: 22, grav: -18, life: 3.5, seed: 11, origin: [0, 9, -3] });
  ashRain = K.cubeBurst({ n: 120, type: 'ash', size: 0.45, speed: 10, rain: true, area: 80, height: 38, seed: 22, origin: [0, 0, 0] });
  anakSparkle = K.cubeBurst({ n: 36, type: 'gold', size: 0.4, speed: 6, up: 10, grav: -12, life: 1.6, seed: 33, origin: [0, 7, -2.5] });
  W.add(lavaBurst, ashRain, anakSparkle);
}

export async function setup(AM) {
  S = K.stage(AM, { pr: 0.7 }); ui = S.ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  buildWorld();
  AM.sfx('chime', 0.25, { gain: 0.35 });
  AM.sfx('boom', Wt('mei', 'Perboewatan'), { gain: 0.42 });
  AM.sfx('boom', Wt('agustus', 'pijar'), { gain: 0.45 });
  AM.sfx('boom', Wt('puncak', 'empat'), { gain: 0.6 });
  AM.sfx('stamp', Wt('suara', 'keras'), { gain: 0.45 });
  AM.sfx('swoosh_up', Wt('tsunami', 'tsunami'), { gain: 0.45 });
  AM.sfx('powerup', Wt('anak', 'Anak'), { gain: 0.45 });
}

const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const scr = (x, y, z) => K.toScreen(S.cam, x, y, z);

function setMood(top, bot, sunC = '#fff2c0', dark = 0, stars = 0) {
  K.setSky(sky, { top, bot, sun: [0.4, 0.3, -1], sunC, stars });
  W.fog.color.set(bot);
  key.color.set(sunC); key.intensity = lerp(2.0, 1.15, dark);
  hemi.intensity = lerp(1.1, 0.75, dark);
}

function reset(t) {
  northBlocks.update(t, { hideAfter: C.suara.start });
  anakBlocks.update(t);
  plumeGroup.visible = false;
  waveGroup.visible = false;
  ringGroup.visible = false;
  bantenCoast.visible = false;
  ship1.visible = false;
  ship2.visible = false;
  lavaBurst.userData.tick(-1);
  ashRain.userData.tick(-1);
  anakSparkle.userData.tick(-1);
}

// 1. Selat Sunda & 3 peaks of Krakatau
shot('selat', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setMood('#3b7de8', '#cfe8ff');
  ship1.visible = ship2.visible = true;
  ship1.position.set(-14, Math.sin(t * 2.5) * 0.15, -6 + p * 8);
  ship2.position.set(14, Math.cos(t * 2.3) * 0.15, 8 - p * 6);
  K.shootCam(S.cam, K.orbit(0, 0, lerp(-0.55, 0.15, p), lerp(36, 31, p), lerp(16, 13, p)), [0, 4, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'KRAKATAU 1883', 540, 230, { size: 48, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tTiga = Wt('selat', 'tiga');
  K.pixPanel(ui, 'SELAT SUNDA: 3 PUNCAK', 540, 340, { size: 24, alpha: env(t, tTiga - 0.1, b, 0.15, 0.2), pop: (t - tTiga) / 0.3 });
  const tRak = Wt('selat', 'Rakata');
  if (t > tRak - 0.1) {
    const [rx, ry] = scr(0, 13, 7.5);
    K.pixPanel(ui, 'PUNCAK RAKATA (813 M)', clamp(rx, 260, 820), clamp(ry - 45, 440, 1280), { size: 22, pop: (t - tRak) / 0.25, color: '#ffe14a' });
  }
});

// 2. Merchant ships sailing peacefully past the sleeping volcano
shot('pelayaran', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setMood('#3b7de8', '#cfe8ff');
  ship1.visible = ship2.visible = true;
  ship1.position.set(-11, Math.sin(t * 3) * 0.18, -8 + p * 14);
  ship2.position.set(11, Math.cos(t * 2.7) * 0.15, 6 - p * 10);
  K.shootCam(S.cam, [-19 + p * 3, 4.5, -10 + p * 11], [-1, 5.5, -1 + p * 3], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixPanel(ui, 'JALUR PELAYARAN SELAT SUNDA', 540, 240, { size: 24, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tAm = Wt('pelayaran', 'amarah') - 0.2;
  K.pixPanel(ui, 'MAGMA AKTIF DI BAWAH LAUT!', 540, 1310, { size: 24, alpha: env(t, tAm, b, 0.15, 0.2), pop: (t - tAm) / 0.3, bg: '#4a1208', border: '#ff7a1a', color: '#ffe14a' });
});

// 3. May 1883: Perboewatan begins coughing ash high into the sky
shot('mei', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setMood(K.mix('#3b7de8', '#524c58', p), K.mix('#cfe8ff', '#9c8b82', p), '#ffd2a0', p * 0.4);
  plumeGroup.visible = true;
  plumeTiers.forEach(({ m, k }) => {
    const pu = clamp((p * 1.5) - k * 0.08);
    m.visible = pu > 0;
    m.position.set(Math.sin(t * 2 + k) * 0.6, 7 + k * 1.6 * pu, -7.5);
    m.scale.setScalar(Math.max(0.01, pu));
  });
  ashRain.userData.tick(t - a);
  K.shootCam(S.cam, K.orbit(0, -5, lerp(-0.4, 0.25, p), lerp(28, 25, p), 11), [0, 8, -5], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'MEI 1883', 540, 230, { size: 52, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tAbu = Wt('mei', 'abu') - 0.1;
  K.pixPanel(ui, 'SEMBURAN ABU VULKANIK: 11 KM', 540, 350, { size: 24, alpha: env(t, tAbu, b, 0.15, 0.2), pop: (t - tAbu) / 0.3 });
});

// 4. Late August: constant earthquakes, glowing lava bombs & volcanic lightning
shot('agustus', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setMood('#221218', '#8f3018', '#ff6a2a', 0.6);
  plumeGroup.visible = true;
  plumeTiers.forEach(({ m, k }) => {
    m.visible = true;
    m.position.set(Math.sin(t * 4 + k) * 0.9, 8 + k * 1.8, -4 + Math.cos(t * 2 + k) * 2);
    m.scale.setScalar(1);
  });
  lavaBurst.userData.tick((t - a) % 2.4);
  ashRain.userData.tick(t - a);
  const shkX = Math.sin(t * 38) * 0.35, shkY = Math.cos(t * 44) * 0.35;
  K.shootCam(S.cam, K.orbit(0, -3, lerp(0.25, 0.85, p), 25, 10), [shkX, 7 + shkY, -3], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, '26 AGUSTUS 1883', 540, 230, { size: 44, color: '#ff9a2a', alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tPij = Wt('agustus', 'pijar') - 0.1;
  K.pixPanel(ui, 'HUJAN BATU PIJAR & PETIR VULKANIK', 540, 340, { size: 22, alpha: env(t, tPij, b, 0.15, 0.2), pop: (t - tPij) / 0.3, bg: '#3a0e08', border: '#ff7a1a' });
});

// 5. Aug 27 10:02 AM — 4 cataclysmic explosions tear the northern peaks apart!
shot('puncak', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setMood('#221014', '#b83818', '#ff9a2a', 0.4);
  const tEmp = Wt('puncak', 'empat');
  const bu = clamp((t - tEmp) / 1.5);
  plumeGroup.visible = true;
  plumeTiers.forEach(({ m, k }) => {
    m.visible = true;
    m.position.set(Math.sin(t * 5 + k) * 1.2, 8 + k * (2.1 + bu * 1.3), -3);
    m.scale.setScalar(1 + bu * 0.65);
  });
  lavaBurst.userData.tick(Math.max(0, t - tEmp + 0.2));
  ashRain.userData.tick(t - a);
  const shk = (1 - bu * 0.4) * 0.65;
  K.shootCam(S.cam, K.orbit(0, -2, lerp(-0.6, 0.2, p), lerp(30, 36, bu), 13), [Math.sin(t * 48) * shk, 8 + Math.cos(t * 52) * shk, -2], 42);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, '27 AGUSTUS 10:02', 540, 225, { size: 44, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  if (t > tEmp - 0.1) {
    K.pixPanel(ui, '4 LEDAKAN SUPER (200 MEGATON TNT!)', 540, 335, { size: 22, pop: (t - tEmp) / 0.25, bg: '#5a0808', border: '#ffe14a', color: '#ffe14a' });
  }
});

// 6. Loudest sound in history — shockwave rings expanding 4,800 km to Australia
shot('suara', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setMood('#283244', '#7a8a9c', '#ffd8b0', 0.3);
  ringGroup.visible = true;
  const rScale = 0.4 + ((p * 2.2) % 1) * 3.2;
  ringGroup.scale.set(rScale, 1, rScale);
  K.shootCam(S.cam, K.orbit(0, 2, lerp(0, 0.5, p), 46, 36), [0, 3, 2], 42);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'SUARA TERKERAS', 540, 230, { size: 46, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const dist = Math.round(ease.outCubic(clamp(p * 1.3)) * 4800);
  K.pixPanel(ui, `RADIUS DENTUMAN: ${dist.toLocaleString('id-ID')} KM`, 540, 340, { size: 24, color: '#ffe14a', alpha: env(t, a + 0.2, b, 0.15, 0.2) });
});

// 7. 30-meter tsunami wave surging toward Banten & Lampung coast
shot('tsunami', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setMood('#283244', '#7a8a9c', '#ffd8b0', 0.3);
  bantenCoast.visible = true;
  waveGroup.visible = true;
  ship1.visible = true;
  const wx = lerp(6, 25, ease.inOutSine(p));
  waveGroup.position.set(wx, 0, 0);
  ship1.position.set(wx - 4, 3.5 + Math.sin(t * 6) * 0.6, 2);
  ship1.rotation.z = -0.35 + Math.sin(t * 5) * 0.12;
  K.shootCam(S.cam, [wx + 15, 8.0, 18 - p * 8], [wx + 2, 4.0, 0], 42);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'TSUNAMI 30 METER', 540, 230, { size: 44, color: '#8fd0ff', alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tPes = Wt('tsunami', 'pesisir') - 0.1;
  K.pixPanel(ui, 'MENYAPU PESISIR BANTEN & LAMPUNG', 540, 340, { size: 22, alpha: env(t, tPes, b, 0.15, 0.2), pop: (t - tPes) / 0.3 });
});

// 8. Stratospheric volcanic ash & crimson twilight across the globe
shot('gelap', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setMood('#2a1028', '#d9531e', '#ff8833', 0.45);
  plumeGroup.visible = true;
  plumeTiers.forEach(({ m, k }) => {
    m.visible = true;
    m.position.set(Math.sin(t * 1.5 + k) * 2.2, 10 + k * 2.1, 2 + Math.cos(t * 1.2 + k) * 2);
    m.scale.set(1.5 + k * 0.15, 0.8, 1.5 + k * 0.15);
  });
  ashRain.userData.tick(t - a);
  K.shootCam(S.cam, K.orbit(0, 3, lerp(-0.3, 0.3, p), 36, 9), [0, 12, 3], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'SENJA MERAH DUNIA', 540, 230, { size: 42, color: '#ff9a2a', alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tStr = Wt('gelap', 'stratosfer') - 0.1;
  K.pixPanel(ui, 'DEBU STRATOSFER SETINGGI 80 KM', 540, 340, { size: 22, alpha: env(t, tStr, b, 0.15, 0.2), pop: (t - tStr) / 0.3 });
});

// 9. Smoke clears: two-thirds of Krakatau has vanished into the sea, leaving cleaved Rakata
shot('kaldera', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setMood('#3b7de8', '#cfe8ff');
  K.shootCam(S.cam, K.orbit(0, 4, lerp(-0.7, 0.3, p), lerp(30, 26, p), 13), [0, 4, 4], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'KALDERA KRAKATAU', 540, 230, { size: 44, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tRak = Wt('kaldera', 'Rakata') - 0.1;
  if (t > tRak) {
    const [rx, ry] = scr(0, 12.5, 7.5);
    K.pixArrow(ui, clamp(rx, 240, 840), clamp(ry - 50, 380, 1180), t);
    K.pixPanel(ui, '2/3 PULAU LENYAP, SISA TEBING RAKATA', 540, 340, { size: 22, pop: (t - tRak) / 0.3 });
  }
});

// 10. 1927: Block by block, Anak Krakatau rises from the submerged caldera!
shot('anak', (t, a, b) => {
  const p = clamp((t - a) / (AM.duration - a));
  setMood('#3b7de8', '#cfe8ff');
  const tAnk = Wt('anak', 'Anak');
  anakSparkle.userData.tick(t - tAnk);
  K.shootCam(S.cam, K.orbit(0, -1, lerp(0.15, 0.95, p), lerp(27, 23, p), 11), [0, 4.5, -1], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'TAHUN 1927', 540, 225, { size: 50, alpha: env(t, a + 0.1, AM.duration + 1, 0.15, 0.2), pop: (t - a) / 0.3 });
  if (t > tAnk - 0.15) {
    K.pixPanel(ui, 'LAHIRNYA GUNUNG ANAK KRAKATAU', 540, 335, { size: 24, pop: (t - tAnk) / 0.3, bg: '#3a1e00', border: '#ffe14a', color: '#ffe14a' });
  }
  const fade = clamp((t - (AM.duration - 0.4)) / 0.4); if (fade > 0) { ui.fillStyle = `rgba(0,0,0,${fade})`; ui.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  reset(t);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  sky.position.copy(S.cam.position);
  s.fn(t, Math.max(0, a), b);
  sky.position.copy(S.cam.position);
  const since = t - Math.max(0, a);
  K.finish(ui, AM, t, { flash: s.id !== 'selat' && since < 0.12 ? 0.32 * (1 - since / 0.12) : 0 });
}
