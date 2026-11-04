// Dunia Blok demo 3: "Monas: Rahasia Lidah Api Emas di Puncak Jakarta" (10 shots).
import * as K from '/styles/dunia-blok/kit.js';
const THREE = K.THREE;
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'pixel', y: 1470, size: 38 } };

let S, ui, C = {}, W;
const Wt = (id, w) => AM.wordTime(id, w);

let sky, key, hemi;
let B, glowFlame, liftBox, goldSparkle, workers = [], cityLights = [];

function buildWorld() {
  W = new THREE.Scene(); W.fog = new THREE.Fog('#cfe8ff', 75, 220);
  sky = K.skyDome(); W.add(sky);
  hemi = new THREE.HemisphereLight('#d8ecff', '#5a6a5a', 1.1); W.add(hemi);
  key = new THREE.DirectionalLight('#fff0d0', 2.0); key.position.set(35, 60, 28); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 10, far: 180 }); key.shadow.bias = -0.0008;
  W.add(key, key.target);

  // Medan Merdeka Park Ground & Pathways
  const lawn = K.vbox(180, 2, 180, 'grass', { cast: false }); lawn.position.set(0, -1, 0); W.add(lawn);
  const pathX = K.vbox(120, 0.25, 6, 'sand', { cast: false }); pathX.position.set(0, 0.12, 0); W.add(pathX);
  const pathZ = K.vbox(6, 0.25, 120, 'sand', { cast: false }); pathZ.position.set(0, 0.12, 0); W.add(pathZ);
  const plaza = K.vbox(28, 0.4, 28, 'andesit', { cast: false }); plaza.position.set(0, 0.2, 0); W.add(plaza);

  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU + 0.15;
    if (Math.abs(Math.cos(a)) > 0.94 || Math.abs(Math.sin(a)) > 0.94) continue;
    const r = 22 + (i % 3) * 5;
    const tr = K.voxTree(3, i, { palm: i % 3 === 0 });
    tr.position.set(Math.round(Math.cos(a) * r), 0, Math.round(Math.sin(a) * r));
    W.add(tr);
  }
  for (const [fx, fz] of [[-12, 12], [12, 12], [-12, -12], [12, -12]]) {
    W.add(K.voxFlag(fx, 0.4, fz, { h: 6, s: 1 }));
  }

  // Distant Jakarta skyline
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * TAU;
    const r = 42 + (i % 3) * 6;
    const bh = 6 + Math.round(hrand(i, 11) * 14);
    const bw = 3 + (i % 2) * 2;
    const bldg = K.vbox(bw, bh, bw, i % 3 === 0 ? 'andesitDark' : 'andesit');
    bldg.position.set(Math.cos(a) * r, bh / 2, Math.sin(a) * r);
    const crown = K.vbox(bw * 0.8, 0.8, bw * 0.8, 'gold', { cast: false });
    crown.material = K.mat('gold', 'side', { emissive: '#ffaa00' });
    crown.position.set(Math.cos(a) * r, bh + 0.4, Math.sin(a) * r);
    W.add(bldg, crown);
    cityLights.push(crown);
  }

  // Block-by-Block Monas Construction (Instanced Blocks)
  B = new K.Blocks({ drop: 7, dur: 0.42 });

  // 1. Base & Museum Sejarah platform (y = 0.5..2.5)
  const tB0 = C.medan.start;
  const dur02 = Math.max(2, C.pondasi.end - tB0);
  for (let y = 0; y < 3; y++) {
    const r = 8 - y;
    for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
      if (y > 0 && Math.abs(x) < r - 1 && Math.abs(z) < r - 1) continue;
      const type = y === 1 ? 'relief' : 'andesit';
      const u = (y * 9 + (x + r) * 0.4 + (z + r) * 0.3) / 38;
      B.add(x, y + 0.4, z, type, tB0 + clamp(u) * dur02 * 0.85, { drop: 6 });
    }
  }

  // 2. Cawan / Goblet (y = 3..7, flares outward from r=3 to r=6)
  const tB3 = C.cawan.start, dB3 = Math.max(1.5, C.cawan.end - tB3);
  const cawanRadii = [3, 4, 5, 6, 6];
  for (let ky = 0; ky < cawanRadii.length; ky++) {
    const y = 3 + ky;
    const r = cawanRadii[ky];
    for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
      if (ky < 4 && Math.abs(x) < r - 1 && Math.abs(z) < r - 1) continue;
      const type = ky === 4 ? 'andesit' : 'snow';
      const u = (ky + (x + r) / (2 * r + 1) * 0.6) / 5.2;
      B.add(x, y + 0.4, z, type, tB3 + u * dB3 * 0.82, { drop: 7 });
    }
  }

  // 3. Tugu Obelisk Shaft (y = 8..24)
  const tB4 = C.tugu.start, dB4 = Math.max(1.5, C.tugu.end - tB4);
  for (let y = 8; y <= 24; y++) {
    const u = (y - 8) / 17;
    const tDrop = tB4 + u * dB4 * 0.82;
    for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
      if (Math.abs(x) === 1 && Math.abs(z) === 1 && y > 15) continue;
      B.add(x, y + 0.4, z, 'snow', tDrop + (x + 1) * 0.03, { drop: 8 });
    }
  }

  // 4. Pelataran Puncak / Viewing Deck (y = 25..26)
  const tB5 = C.pelataran.start;
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) {
    B.add(x, 25.4, z, 'andesitDark', tB5 + 0.15 + (Math.abs(x) + Math.abs(z)) * 0.04, { drop: 6 });
    if (Math.abs(x) === 2 || Math.abs(z) === 2) {
      B.add(x, 26.2, z, 'snow', tB5 + 0.35 + (Math.abs(x) + Math.abs(z)) * 0.04, { s: 0.65, drop: 5 });
    }
  }

  // 5. Lidah Api Perunggu (Bronze Flame core, y = 26.6..31.4)
  const tB6 = C.perunggu.start, dB6 = Math.max(1.5, C.perunggu.end - tB6);
  const tB7 = C.emas.start, dB7 = Math.max(1.5, C.emas.end - tB7);
  const tB8 = C.lima_puluh.start, dB8 = Math.max(1.5, C.lima_puluh.end - tB8);
  const flameCoords = [
    [0, 26.6, 0, 1.2], [-0.8, 27.4, 0, 0.9], [0.8, 27.4, 0, 0.9], [0, 27.4, -0.8, 0.9], [0, 27.4, 0.8, 0.9],
    [0, 28.2, 0, 1.3], [-1.0, 28.5, 0.3, 0.85], [1.0, 28.5, -0.3, 0.85], [0.3, 28.5, 1.0, 0.85], [-0.3, 28.5, -1.0, 0.85],
    [0, 29.4, 0, 1.15], [-0.6, 29.8, 0, 0.8], [0.6, 29.8, 0, 0.8], [0, 29.8, 0.6, 0.8],
    [0, 30.6, 0, 0.9], [0.2, 31.4, 0, 0.65],
  ];
  flameCoords.forEach(([fx, fy, fz, fs], idx) => {
    const tDrop = tB6 + 0.25 + (idx / flameCoords.length) * dB6 * 0.65;
    B.add(fx, fy, fz, 'wood', tDrop, { s: fs, drop: 7, spin: 1.2, tout: tB7 + 0.8 + idx * 0.08 });
    const tGold = idx < 11
      ? tB7 + 0.35 + (idx / 11) * (dB7 * 0.65)
      : tB8 + 0.25 + ((idx - 11) / 5) * (dB8 * 0.55);
    B.add(fx, fy, fz, 'gold', tGold, { s: fs * 1.06, drop: 6, spin: 1.5 });
  });

  B.build(W);

  glowFlame = K.vbox(2.4, 4.6, 2.4, 'gold', { cast: false });
  glowFlame.material = K.mat('gold', 'side', { emissive: '#ffaa00' });
  glowFlame.position.set(0, 29.0, 0);
  W.add(glowFlame);

  liftBox = K.vbox(1.4, 1.6, 0.6, 'gold', { cast: false });
  liftBox.material = K.mat('gold', 'side', { emissive: '#ff9900' });
  W.add(liftBox);

  goldSparkle = K.cubeBurst({ n: 45, type: 'gold', size: 0.45, speed: 6, up: 10, grav: -12, life: 1.6, seed: 38, origin: [0, 29, 0] });
  W.add(goldSparkle);

  for (let i = 0; i < 4; i++) {
    const w = K.worker({ shirt: ['#ffffff', '#2e6ac8', '#c8452e', '#e0a020'][i], seed: i });
    W.add(w.root);
    workers.push(w);
  }
}

export async function setup(AM) {
  S = K.stage(AM, { pr: 0.7 }); ui = S.ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  buildWorld();
  AM.sfx('drum_hit', 0.3, { gain: 0.4 });
  AM.sfx('stamp', Wt('pondasi', 'museum'), { gain: 0.42 });
  AM.sfx('click', Wt('cawan', 'cawan'), { gain: 0.45 });
  AM.sfx('swoosh_up', Wt('tugu', 'marmer'), { gain: 0.4 });
  AM.sfx('powerup', Wt('perunggu', 'perunggu'), { gain: 0.42 });
  AM.sfx('coin', Wt('emas', 'emas'), { gain: 0.45 });
  AM.sfx('coin', Wt('lima_puluh', 'ditambah'), { gain: 0.5, pitch: 1.2 });
  AM.sfx('chime', Wt('abadi', 'bersinar'), { gain: 0.45 });
}

const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const scr = (x, y, z) => K.toScreen(S.cam, x, y, z);

function reset(t) {
  B.update(t);
  glowFlame.visible = false;
  liftBox.visible = false;
  goldSparkle.userData.tick(-1);
  cityLights.forEach((c) => { c.visible = false; });
  workers.forEach((w, i) => {
    w.root.visible = false;
    const coords = [[-6, 0.4, 10, 0.4], [6, 0.4, 10, -0.4], [-4, 8.4, 4, 0.2], [4, 8.4, 4, -0.2]][i];
    K.workerPose(w, { x: coords[0], y: coords[1], z: coords[2], ry: coords[3], walk: t * 1.2 + i, t });
  });
  K.setSky(sky, { top: '#4a8fe8', bot: '#cfe8ff', sun: [0.4, 0.3, -1], sunC: '#fff2c0', stars: 0 });
  W.fog.color.set('#cfe8ff'); key.color.set('#fff0d0'); key.intensity = 2.0; hemi.intensity = 1.1;
}

// 1. Medan Merdeka park overview
shot('medan', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  workers[0].root.visible = workers[1].root.visible = true;
  K.shootCam(S.cam, K.orbit(0, 0, lerp(-0.55, 0.15, p), lerp(36, 30, p), lerp(16, 13, p)), [0, 3, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'MONUMEN NASIONAL', 540, 225, { size: 42, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tAg = Wt('medan', 'tujuh') - 0.1;
  K.pixPanel(ui, 'MULAI DIBANGUN: 17 AGUSTUS 1961', 540, 335, { size: 22, color: '#ffe14a', alpha: env(t, tAg, b, 0.15, 0.2), pop: (t - tAg) / 0.3 });
});

// 2. Architects Silaban & Soedarsono — Lingga & Yoni philosophy
shot('filosofi', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  workers[0].root.visible = workers[1].root.visible = true;
  K.shootCam(S.cam, [Math.sin(p * 2) * 3, 4.5, lerp(22, 18, p)], [0, 3.5, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixPanel(ui, 'ARSITEK: SILABAN & SOEDARSONO', 540, 230, { size: 22, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tLing = Wt('filosofi', 'Lingga') - 0.1;
  K.pixTitle(ui, 'LINGGA & YONI', 540, 340, { size: 46, alpha: env(t, tLing, b, 0.15, 0.2), pop: (t - tLing) / 0.3 });
});

// 3. Foundation & Museum Sejarah Nasional
shot('pondasi', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  workers[0].root.visible = workers[1].root.visible = true;
  K.shootCam(S.cam, K.orbit(0, 0, lerp(0.2, 0.85, p), 22, 8.5), [0, 2.5, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'MUSEUM SEJARAH', 540, 230, { size: 42, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tMus = Wt('pondasi', 'museum') - 0.1;
  K.pixPanel(ui, 'RUANG MUSEUM DI DASAR MONUMEN', 540, 340, { size: 22, alpha: env(t, tMus, b, 0.15, 0.2), pop: (t - tMus) / 0.3 });
});

// 4. Cawan (Goblet, 17m high x 45m wide)
shot('cawan', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  workers.forEach((w) => { w.root.visible = true; });
  K.shootCam(S.cam, K.orbit(0, 0, lerp(-0.5, 0.35, p), 25, 11), [0, 5.5, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'PELATARAN CAWAN', 540, 225, { size: 44, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tTuj = Wt('cawan', 'tujuh') - 0.1;
  K.pixPanel(ui, 'TINGGI 17 M | LEBAR 45 M (ANGKA 17-8-45)', 540, 335, { size: 20, color: '#ffe14a', alpha: env(t, tTuj, b, 0.15, 0.2), pop: (t - tTuj) / 0.3 });
});

// 5. 117m White Marble Obelisk rising into the Jakarta sky
shot('tugu', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const lookY = lerp(7, 23, ease.inOutSine(p));
  K.shootCam(S.cam, K.orbit(0, 0, lerp(0.25, 0.85, p), 28, lookY + 4), [0, lookY, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'OBELISK MARMER', 540, 225, { size: 44, color: '#ffffff', alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const curH = Math.round(ease.outCubic(p) * 117);
  K.pixPanel(ui, `TINGGI TUGU: ${curH} / 117 METER`, 540, 335, { size: 24, color: '#ffe14a', alpha: env(t, a + 0.2, b, 0.15, 0.2) });
});

// 6. Elevator to Pelataran Puncak viewing deck
shot('pelataran', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  liftBox.visible = true;
  const ly = lerp(9.0, 25.2, ease.inOutSine(clamp(p * 1.25)));
  liftBox.position.set(0, ly, 1.6);
  K.shootCam(S.cam, [12 - p * 3, ly + 2.5, 16 - p * 2], [0, ly, 0], 42);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'PELATARAN PUNCAK', 540, 225, { size: 42, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const [lx, lyScr] = scr(0, ly + 1.5, 1.6);
  K.pixArrow(ui, clamp(lx, 240, 840), clamp(lyScr - 40, 380, 1180), t);
  const tJkt = Wt('pelataran', 'Jakarta') - 0.1;
  K.pixPanel(ui, 'PANORAMA JAKARTA DARI TINGGI 115 M', 540, 335, { size: 22, alpha: env(t, tJkt, b, 0.15, 0.2), pop: (t - tJkt) / 0.3 });
});

// 7. 14.5-ton Bronze Lidah Api crowning the summit
shot('perunggu', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  K.shootCam(S.cam, K.orbit(0, 0, lerp(-0.4, 0.4, p), 15, 31), [0, 28.5, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'LIDAH API PERUNGGU', 540, 225, { size: 38, color: '#ff9a2a', alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tEmp = Wt('perunggu', 'empat') - 0.1;
  K.pixPanel(ui, 'TINGGI 14 M | BERAT 14,5 TON', 540, 335, { size: 24, color: '#ffe14a', alpha: env(t, tEmp, b, 0.15, 0.2), pop: (t - tEmp) / 0.3 });
});

// 8. 38 kg of pure gold blocks donated by Teuku Markam & Indonesian people
shot('emas', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const tTiga = Wt('emas', 'tiga');
  goldSparkle.userData.tick(t - tTiga);
  K.shootCam(S.cam, K.orbit(0, 0, lerp(0.4, 1.2, p), 14.5, 31.2), [0, 28.8, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, '38 KG EMAS MURNI', 540, 225, { size: 42, color: '#ffe14a', alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tMar = Wt('emas', 'Markam') - 0.15;
  K.pixPanel(ui, 'SUMBANGAN TEUKU MARKAM & RAKYAT', 540, 335, { size: 22, alpha: env(t, tMar, b, 0.15, 0.2), pop: (t - tMar) / 0.3, bg: '#3a1e00', border: '#ffe14a', color: '#ffe14a' });
});

// 9. 1995 (50th Independence): Gold coating increased to 50 kg!
shot('lima_puluh', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const tDit = Wt('lima_puluh', 'ditambah');
  goldSparkle.userData.tick(t - tDit);
  K.shootCam(S.cam, K.orbit(0, 0, lerp(-0.6, 0.3, p), lerp(15, 18, p), 31.5), [0, 28.8, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'HUT RI KE-50 (1995)', 540, 225, { size: 40, alpha: env(t, a + 0.1, b, 0.15, 0.2), pop: (t - a) / 0.3 });
  const kgCount = Math.round(lerp(38, 50, ease.outCubic(clamp((t - tDit + 0.2) / 1.0))));
  K.pixPanel(ui, `TOTAL EMAS: ${kgCount} KILOGRAM!`, 540, 335, { size: 26, bg: '#3a1e00', border: '#ffe14a', color: '#ffe14a', alpha: env(t, a + 0.2, b, 0.15, 0.2) });
});

// 10. Day to Sparkling Night over Jakarta: Monas shines eternally
shot('abadi', (t, a, b) => {
  const p = clamp((t - a) / (AM.duration - a));
  const nMix = clamp((p - 0.25) / 0.45);
  K.setSky(sky, { top: K.mix('#4a8fe8', '#0b1026', nMix), bot: K.mix('#cfe8ff', '#1b264e', nMix), sun: [0.4, 0.2 - nMix * 0.25, -1], sunC: K.mix('#fff2c0', '#ff8833', nMix), stars: nMix });
  W.fog.color.set(K.mix('#cfe8ff', '#1b264e', nMix));
  key.intensity = lerp(2.0, 0.9, nMix); hemi.intensity = lerp(1.1, 0.65, nMix);
  if (nMix > 0.35) {
    glowFlame.visible = true;
    glowFlame.rotation.y = t * 1.2;
    const pulse = 0.85 + Math.sin(t * 6) * 0.15;
    glowFlame.scale.set(pulse, 1, pulse);
    cityLights.forEach((c) => { c.visible = true; });
  }
  K.shootCam(S.cam, K.orbit(0, 0, lerp(0.2, 1.1, p), lerp(38, 46, p), 22), [0, 16, 0], 40);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'MONAS JAKARTA', 540, 225, { size: 48, color: '#ffe14a', alpha: env(t, a + 0.1, AM.duration + 1, 0.15, 0.2), pop: (t - a) / 0.3 });
  const tPad = Wt('abadi', 'padam') - 0.3;
  K.pixPanel(ui, 'API SEMANGAT YANG TAK PERNAH PADAM', 540, 335, { size: 22, bg: '#3a1e00', border: '#ffe14a', color: '#ffe14a', alpha: env(t, tPad, AM.duration + 1, 0.15, 0.2), pop: (t - tPad) / 0.3 });
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
  K.finish(ui, AM, t, { flash: s.id !== 'medan' && since < 0.12 ? 0.32 * (1 - since / 0.12) : 0 });
}
