// Kartun 3D Sinematik demo: "Sangkuriang & Tangkuban Perahu" (legenda Sunda), 13 shots timed to the narration.
import * as K from '/styles/kartun-3d-sinematik/kit.js';
const THREE = K.THREE;
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'bold', y: 1450, size: 70 } };

let S, ui, C = {};
const W_ = (id, w) => AM.wordTime(id, w);
// scenes
let V, N, B; // village, night lakeshore, valley (mountain)
// cast
let sumbi, kid, man, modern, rooster, jins = [], cent, flower, bump;
// props
let boatSmall, boatBig, dome, domeTrees, icons = {}, cloth, river = {}, sap, dust1, dust2, steam, sparks, torches = [];

// ------------------------------------------------------------------ terrain heights (shared by builders and placement)
const sstep = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
function hV(x, z) {
  const back = Math.max(0, -z - 13); const side = Math.max(0, Math.abs(x) - 16);
  let h = back * 0.32 + side * 0.18 + noise.fbm2(x * 0.04, z * 0.04, 3) * 1.2 * clamp((back + side) / 6);
  if (back > 0) h = Math.floor(h / 1.1) * 1.1 + (h % 1.1) * 0.15; // sawah terraces
  return h + noise.n2(x * 0.15, z * 0.15) * 0.05;
}
function hB(x, z) {
  const d = Math.hypot(x, z + 40);
  let h = Math.max(0, d - 170) * 0.16 + noise.fbm2(x * 0.012, z * 0.012, 4) * 6 * clamp((d - 60) / 80) - 0.6;
  h += 6 * Math.exp(-((x - 8) ** 2 + (z - 34) ** 2) / 90); // viewpoint hill for the ending
  return Math.max(-1, h);
}
function hN(x, z) {
  const rx = -42 + Math.sin(z * 0.05) * 5, dr = Math.abs(x - rx);
  const channel = dr < 7 ? -2.2 * (1 - (dr / 7) ** 2) : 0;
  let hills = Math.max(0, -z - 18) * 0.25 + Math.max(0, x - 30) * 0.22 + noise.fbm2(x * 0.03, z * 0.03, 3) * 2.2;
  hills *= sstep(9, 22, Math.hypot(x, z)) * sstep(6, 14, dr);
  hills += 4.2 * Math.exp(-((x - 20) ** 2 + z * z) / 50); // the hill of the false dawn
  return channel + hills;
}

// ------------------------------------------------------------------ set builders
function sceneBase(fogC, near, far) {
  const s = new THREE.Scene(); s.fog = new THREE.Fog(fogC, near, far);
  s.userData.sky = K.skyDome(380); s.add(s.userData.sky);
  s.userData.L = K.lights(s);
  return s;
}
function buildVillage() {
  V = sceneBase('#ffe6c0', 28, 170);
  const terr = K.terrain({
    w: 220, d: 220, seg: 90, height: hV,
    color: (x, z, y) => {
      const path = Math.abs(x + 2.6 + Math.sin(z * 0.2) * 0.6) < 1.1 && z > -6.5 && z < 14;
      if (path) return '#c9965e';
      if (y > 0.4) { const band = Math.floor(y / 1.1); return band % 3 === 0 ? '#8fd16a' : band % 3 === 1 ? '#6fbd4c' : '#a6d978'; }
      return noise.n2(x * 0.3, z * 0.3) > 0.3 ? '#78b84f' : '#86c45a';
    },
  });
  V.add(terr);
  const house = K.house(); house.position.set(-3.6, 0, -6.8); house.rotation.y = 0.18; V.add(house); V.userData.house = house;
  const trees = [['palm', 6, -9], ['palm', 9.5, -5], ['palm', -10, -3.5], ['round', -8, -11], ['round', 5.5, -14], ['bamboo', 11, -1.5], ['bamboo', -12, -7], ['round', 14, -9], ['palm', -15, -12], ['round', -4, -16]];
  V.userData.trees = trees.map(([k, x, z], i) => { const t = K.tree(k, { seed: i + 3, s: 1.1 + hrand(i, 4) * 0.3 }); t.position.set(x, hV(x, z) - 0.05, z); V.add(t); return t; });
  // bamboo fence with posts
  const fence = new THREE.Group();
  for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.15, 6), K.toon('#b58a4a')); p.position.set(3 + i * 0.9, 0.58, -2.5); fence.add(p); }
  for (const y of [0.45, 0.85]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 6.6, 6), K.toon('#c9a15a')); r.rotation.z = Math.PI / 2; r.position.set(6.15, y, -2.45); fence.add(r); }
  K.outline(fence, 0.0026); V.add(fence);
  // far mountains (soft blue in the fog)
  for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(30 + hrand(i, 1) * 25, 26 + hrand(i, 2) * 22, 9), K.toon(i % 2 ? '#7c9bb0' : '#8aa6b5', { flat: true })); m.position.set(-150 + i * 50, 8, -170 - hrand(i, 3) * 30); V.add(m); }
  // sapling that grows during the time-lapse
  sap = K.tree('round', { seed: 41, s: 1 }); sap.position.set(2.6, 0, -5.2); V.add(sap);
  // rocks + flowers dressing
  for (let i = 0; i < 6; i++) { const r = K.rock(0.25 + hrand(i, 2) * 0.3, i); r.position.set(-7 + hrand(i, 3) * 16, 0.08, 1 + hrand(i, 5) * 5); V.add(r); }
}
function domeGeo(L = 44, Wd = 15, Hh = 14) {
  const g = new THREE.SphereGeometry(1, 72, 24, 0, TAU, 0, Math.PI / 2); const p = g.attributes.position;
  const col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = noise.fbm2(x * 3 + 5, z * 3, 3);
    const top = Math.pow(y, 0.6); // flat-topped ridge like the real mountain
    const X = x * L / 2, Y = (top * 0.85 + y * 0.15) * Hh * (1 + n * 0.12), Z = z * Wd / 2 * (1 + n * 0.1);
    p.setXYZ(i, X, Y, Z);
    const crater = Math.exp(-((x + 0.15) ** 2 / 0.02 + z * z / 0.05)) * clamp(y * 1.4);
    c.set(y > 0.8 ? '#7f9c56' : y > 0.45 ? '#4f8a3f' : '#3f7d3a').lerp(new THREE.Color('#a8957a'), crater * 0.9).lerp(new THREE.Color('#2f6a34'), clamp(n + 0.2) * 0.4);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  return g;
}
function buildValley() {
  B = sceneBase('#f6c79a', 160, 620);
  const terr = K.terrain({
    w: 900, d: 900, seg: 120, height: hB,
    color: (x, z, y) => (y < 0.0 ? '#7fae5a' : noise.n2(x * 0.02, z * 0.02) > 0.2 ? '#5f9a44' : y > 12 ? '#58864a' : '#6fa84d'),
  });
  B.add(terr);
  const lake = K.water(260, 160, { color: '#6fb8d8', deep: '#3f86ad' }); lake.position.set(10, -0.35, 70); B.add(lake); B.userData.lake = lake;
  dome = new THREE.Mesh(domeGeo(), K.toon('#ffffff', { vc: true, key: 'dome' })); dome.position.set(0, -0.5, -120); B.add(dome);
  // forest on the mountain: instanced cone trees
  const tg = new THREE.ConeGeometry(0.9, 2.6, 6); tg.translate(0, 1.3, 0);
  domeTrees = new THREE.InstancedMesh(tg, K.toon('#2f6b33', { flat: true, key: 'domeTree' }), 160);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(); let k = 0;
  const ray = new THREE.Raycaster(); dome.updateMatrixWorld(true);
  for (let i = 0; i < 1200 && k < 160; i++) {
    const x = (hrand(i, 1) - 0.5) * 42, z = (hrand(i, 2) - 0.5) * 14;
    ray.set(new THREE.Vector3(x, 40, -120 + z), new THREE.Vector3(0, -1, 0));
    const hit = ray.intersectObject(dome, false)[0]; if (!hit || hit.point.y > 6.5) continue;
    const s = 0.5 + hrand(i, 3) * 0.5; sc.set(s, s * (0.9 + hrand(i, 4) * 0.5), s);
    m4.compose(new THREE.Vector3(hit.point.x, hit.point.y - 0.3, hit.point.z), q, sc); domeTrees.setMatrixAt(k++, m4);
  }
  domeTrees.count = k; B.add(domeTrees);
  K.outline(dome, 0.0016);
  // neighbouring peaks (Burangrang, Bukit Tunggul) and the ring around the basin
  const peaks = [[-75, -170, 30, 20], [75, -175, 26, 22], [-200, -90, 40, 30], [210, -60, 46, 26], [-240, 60, 50, 28], [250, 120, 50, 22]];
  peaks.forEach(([x, z, r, h], i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 10), K.toon(i < 2 ? '#4f7d4a' : '#6f8fa0', { flat: true })); m.position.set(x, h / 2 - 2, z); B.add(m); });
  boatBig = K.boat({ len: 6, beam: 1.8, depth: 1.25 }); boatBig.scale.setScalar(6.8); B.add(boatBig);
  dust1 = K.burst({ n: 90, color: '#cdb48c', size: 4.2, speed: 26, up: 7, grav: -2, life: 1.8, seed: 3, flat: true }); B.add(dust1);
  // a few birds (tiny chevrons)
  B.userData.birds = [];
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 3), K.basic('#3a2a2a')); b.rotation.z = Math.PI / 2; b.scale.set(1, 1, 0.15); B.add(b); B.userData.birds.push(b); }
}
function buildNight() {
  N = sceneBase('#22305e', 25, 170);
  const terr = K.terrain({
    w: 260, d: 260, seg: 110, height: hN,
    color: (x, z, y) => (y < -0.6 ? '#7a6a52' : Math.abs(x) < 6 && Math.abs(z) < 5 ? '#a07a50' : noise.n2(x * 0.1, z * 0.1) > 0.2 ? '#4f8a45' : '#5c9a4c'),
  });
  N.add(terr);
  // river water: upstream (north) rises when dammed, downstream falls
  river.up = K.water(16, 120, { color: '#5aa8d0', deep: '#2f6b96' }); river.up.position.set(-42, -1.4, -110); N.add(river.up);
  river.down = K.water(16, 120, { color: '#5aa8d0', deep: '#2f6b96' }); river.down.position.set(-42, -1.4, 10); N.add(river.down);
  river.rocks = [];
  for (let i = 0; i < 9; i++) { const r = K.rock(1.4 + hrand(i, 1) * 0.9, i + 20, i % 2 ? '#7f7a70' : '#938b7c'); N.add(r); river.rocks.push(r); }
  // boatyard: boat on trestles, torches
  boatSmall = K.boat({ len: 6, beam: 1.8, depth: 1.25 }); N.add(boatSmall);
  for (const x of [-1.8, 0, 1.8]) { const tr = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 1.6), K.toon('#6b4426')); tr.position.set(x, 0.45, 0); K.outline(tr, 0.0026); N.add(tr); }
  for (const [x, z] of [[-4.6, -1.8], [4.4, 1.8], [-1.2, -3.6]]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2, 6), K.toon('#5a3a20')); pole.position.set(x, 1, z); K.outline(pole, 0.0026); N.add(pole);
    const f = K.glow('#ffb347', 1.6, 0.95); f.position.set(x, 2.15, z); N.add(f);
    const core = K.glow('#fff1b0', 0.6, 1); core.position.set(x, 2.1, z); N.add(core);
    torches.push([f, core]);
  }
  N.userData.torchLight = new THREE.PointLight('#ffa040', 1.6, 14, 1.5); N.userData.torchLight.position.set(1, 4.5, 4.5); N.add(N.userData.torchLight);
  // planks lying around + lake
  for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.3), K.toon('#a8693d')); p.position.set(-3 + i * 0.25, 0.05 + i * 0.09, -2.4); p.rotation.y = 0.2; N.add(p); }
  const lake = K.water(140, 60, { color: '#3d6f9e', deep: '#1f3f6a' }); lake.position.set(0, -0.5, 40); N.add(lake); N.userData.lake = lake;
  // village silhouettes on the hill for the false-dawn shot
  for (let i = 0; i < 5; i++) { const h = K.house({ w: 2.5, d: 2, h: 1.4 }); { const hx = 38 + i * 6, hz = -12 + hrand(i, 1) * 18; h.position.set(hx, hN(hx, hz), hz); } h.scale.setScalar(0.9); N.add(h); }
  for (let i = 0; i < 8; i++) { const t = K.tree(i % 2 ? 'palm' : 'round', { seed: 60 + i }); { const tx = 28 + hrand(i, 4) * 40, tz = -20 + hrand(i, 5) * 40; t.position.set(tx, hN(tx, tz), tz); } N.add(t); }
  cloth = K.cloth(3.2, 1.5, { color: '#c81e2a', glow: '#ff8a2a' }); N.add(cloth);
  dust2 = K.burst({ n: 40, color: '#ffffff', size: 0.9, speed: 4, up: 3, life: 1.2, seed: 9 }); N.add(dust2);
  sparks = K.burst({ n: 50, color: '#8ff0ff', size: 0.22, speed: 3, up: 5, grav: 1, life: 0.8, seed: 12, additive: true }); N.add(sparks);
  steam = K.burst({ n: 18, color: '#ffffff', size: 0.5, speed: 0.6, up: 2.2, grav: 0.6, life: 0.9, seed: 13 }); N.add(steam);
  N.userData.moon = K.glow('#dfe8ff', 14, 0.9); N.add(N.userData.moon);
  N.userData.moonCore = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32), K.basic('#f4f6ff', { fog: false })); N.add(N.userData.moonCore);
  N.userData.moon.position.set(-45, 40, -110); N.userData.moonCore.position.set(-45, 40, -110); N.userData.moon.material.opacity = 0.55;
}
function buildProps() {
  cent = K.centong(); cent.rotation.x = Math.PI; cent.position.y = -0.02;
  flower = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 5), K.toon('#3f8a3a')); stem.position.y = 0.15; flower.add(stem);
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), K.toon('#ff5c8a')); const a = i / 6 * TAU; p.position.set(Math.cos(a) * 0.05, 0.32, Math.sin(a) * 0.05); p.scale.set(1, 0.5, 1); flower.add(p); }
  const ctr = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), K.toon('#ffd23a')); ctr.position.y = 0.33; flower.add(ctr);
  K.outline(flower, 0.0028); flower.rotation.x = Math.PI / 2;
  // icons for the conditions: mini lake, mini boat, crescent moon
  const lakeI = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 28), K.toon('#4fb3e0', { emissive: '#2a7fb0', ei: 0.3 })); lakeI.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.08, 8, 28), K.toon('#6fbf4a')); rim.rotation.x = Math.PI / 2; lakeI.add(rim);
  for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), K.toon('#3f8a3a')); t.position.set(Math.cos(i * 2.1) * 0.44, 0.12, Math.sin(i * 2.1) * 0.44); lakeI.add(t); }
  K.outline(lakeI, 0.003);
  const boatI = K.boat({ len: 0.9, beam: 0.32, depth: 0.22 });
  const moonI = new THREE.Group(); const cr = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 10, 24, Math.PI * 1.25), K.toon('#ffe27a', { emissive: '#ffcf4a', ei: 0.5 })); cr.rotation.z = 0.9; moonI.add(cr);
  for (let i = 0; i < 3; i++) { const st = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), K.basic('#fff4c0')); st.position.set(0.25 + i * 0.12, 0.3 - i * 0.18, 0); moonI.add(st); }
  K.outline(moonI, 0.003);
  icons = { lake: lakeI, boat: boatI, moon: moonI };
  bump = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), K.toon('#ff9f9f')); bump.userData.noOutline = true;
}

// ------------------------------------------------------------------ setup
export async function setup(AM) {
  S = K.stage(AM, { pr: 0.66 }); ui = S.ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  buildVillage(); buildValley(); buildNight(); buildProps();
  sumbi = K.character({ kind: 'woman', skin: '#f3c39c', top: '#f8e6c8', trim: '#e0a93a', hair: 'bun', lashes: true, scarf: '#d8476a', eye: '#6a3a18', skirtMap: K.batikTex('#7a4526', '#2e1609', '#e3b46b', 'parang') });
  kid = K.character({ kind: 'kid', skin: '#efb88e', top: '#e98b2e', bottom: '#5a3b2a', hair: 'kid', eye: '#4a2a12' });
  man = K.character({ kind: 'man', skin: '#e3ab80', top: '#2c3048', bottom: '#2c3048', hair: 'short', iket: '#8a3f1d', sash: '#c8322a', scar: true, eye: '#3a2210' });
  modern = K.character({ kind: 'kid', skin: '#eab48c', top: '#2fb3a5', bottom: '#2f4a7a', hair: 'short', eye: '#3a2210' });
  // the iket band + crown + knot (last three children added to the hair group)
  man.j.iketParts = man.j.hair.children.slice(-3);
  sumbi.j.handR.add(cent);
  man.j.handR.add(flower);
  kid.j.hc.add(bump); bump.position.set(0.05, 0.36, 0.05);
  rooster = K.rooster();
  for (let i = 0; i < 8; i++) jins.push(K.jin({ color: i % 3 === 0 ? '#7ff0c8' : i % 3 === 1 ? '#5fd8ff' : '#9fb8ff', s: 0.75 + hrand(i, 1) * 0.3 }));
  for (const j of jins) j.userData.hammer = (() => { const h = new THREE.Group(); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 5), K.toon('#8a5a32')); st.position.y = -0.16; h.add(st); const hd = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.08), K.toon('#7d7d86')); hd.position.y = -0.32; h.add(hd); j.userData['arm1'].add(h); h.position.y = -0.2; return h; })();

  // ---- sound design (8) ----
  AM.sfx('magic', T_POOF, { gain: 0.4 });
  AM.sfx('impact', W_('hook', 'ditendang') + 0.05, { gain: 0.5 });
  AM.sfx('boom', W_('hook', 'terbalik') + 0.03, { gain: 0.55 });
  AM.sfx('pop', W_('lamar', 'melamar') + 0.1, { gain: 0.45 });
  AM.sfx('drum_hit', W_('lamar', 'ibunya') - 0.1, { gain: 0.55 });
  AM.sfx('bird', W_('kain', 'Ayam') + 0.05, { gain: 0.45, pitch: 0.75 });
  AM.sfx('impact', W_('tendang', 'menendangnya') + 0.18, { gain: 0.6 });
  AM.sfx('boom', W_('tendang', 'Jadilah') + 0.0, { gain: 0.55 });
}

// ------------------------------------------------------------------ helpers
const span = (id, next) => [C[id].start - 0.12, next ? C[next].start - 0.12 : AM.duration + 1];
const SHOTS = []; const shot = (id, next, fn) => SHOTS.push({ id, next, fn });
let cur = null;
function cam(pos, look, fov = 38, t = 0, amp = 0.04, roll = 0) {
  const d = K.drift(t, amp, 3);
  K.shootCam(S.cam, [pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]], [look[0] + d[0] * 0.5, look[1] + d[1] * 0.5, look[2]], fov, roll);
}
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
function sky(scene, o, t) { const s = scene.userData.sky; s.position.copy(S.cam.position); K.setSky(s, { ...o, t }); if (o.fog) scene.fog.color.set(o.fog); }
function dayVillage(t, warm = 0) {
  sky(V, { top: K.mix('#4f86d6', '#5a6fc0', warm), mid: K.mix('#a9d4f2', '#f5b07a', warm), bot: K.mix('#fff0d0', '#ffd49a', warm), sun: [0.6, 0.35, -1], sunC: '#fff2c8', sunK: 0.7, stars: 0, fog: K.mix('#e9f0e8', '#ffe2bc', warm) }, t);
  V.userData.L.set({ keyC: '#fff0d4', keyI: 1.45, keyPos: [7, 10, 6], sky: '#cfe4ff', ground: '#7a6040', hemiI: 0.9, backC: '#ffd59a', backI: 0.9 });
  K.setRim('#fff0c8', 0.4);
}
function nightSet(t, dawn = 0) {
  sky(N, { top: K.mix('#0d1438', '#3a2a6a', dawn), mid: K.mix('#1f2f6a', '#ff6a3a', dawn), bot: K.mix('#2c3f7a', '#ffc070', dawn), sun: [1, 0.06, 0.1], sunC: K.mix('#9fb8ff', '#ffd27a', dawn), sunK: dawn * 1.1, stars: 1 - dawn, fog: K.mix('#22305e', '#d9785a', dawn) }, t);
  N.userData.L.set({ keyC: K.mix('#8fb0ff', '#ff9a6a', dawn), keyI: lerp(0.75, 1.2, dawn), keyPos: dawn > 0.5 ? [20, 6, 2] : [-6, 10, -8], sky: K.mix('#3a4f9a', '#ff9070', dawn), ground: '#1a1020', hemiI: lerp(0.65, 0.85, dawn), backC: K.mix('#7fd8ff', '#ffb070', dawn), backI: 1.0 });
  K.setRim(K.mix('#8fd8ff', '#ffb27a', dawn), 0.6);
  const flick = (i) => 0.9 + noise.n2(t * 9, i) * 0.15;
  torches.forEach(([f, c], i) => { const k = flick(i); f.scale.set(1.6 * k, 1.9 * k, 1); c.scale.set(0.6 * k, 0.8 * k, 1); });
  N.userData.torchLight.intensity = 0.5 * flick(7) * (1 - dawn * 0.6);
  N.userData.moonCore.lookAt(S.cam.position); N.userData.moon.visible = N.userData.moonCore.visible = dawn < 0.5;
  N.userData.lake.userData.tick(t); river.up.userData.tick(t); river.down.userData.tick(t);
}
function valleySky(t, o = {}) {
  const warm = o.warm ?? 0.5;
  sky(B, { top: K.mix('#3f74d0', '#3a4fa0', warm), mid: K.mix('#9fd0f5', '#ffa66a', warm), bot: K.mix('#fff4dc', '#ffe0a0', warm), sun: o.sun || [0.3, 0.1, -1], sunC: '#fff0c0', sunK: 0.9, stars: 0, fog: K.mix('#dfeaf0', '#f8c08e', warm) }, t);
  B.userData.L.set({ keyC: K.mix('#fff4dc', '#ffc890', warm), keyI: 1.5, keyPos: [40, 30, 60], sky: '#cfe0ff', ground: '#6a5a3a', hemiI: 0.85, backC: '#ffd59a', backI: 1.0 });
  K.setRim(K.mix('#fff0c8', '#ffc27a', warm), 0.45);
  B.userData.lake.userData.tick(t);
  B.userData.birds.forEach((b, i) => { const u = (t * 0.06 + i * 0.13) % 1; b.position.set(lerp(-120, 120, u) + i * 8, 40 + Math.sin(t * 2 + i) * 2 + i * 3, -60 + i * 6); b.scale.set(1 + Math.sin(t * 12 + i) * 0.3, 1, 0.15); });
}
function hide(...objs) { objs.forEach((o) => { if (o.parent) o.parent.remove(o); }); }
function jinPose(J, x, y, z, t, i, { face = 0, scared = 0 } = {}) { J.position.set(x, y + Math.sin(t * 2.4 + i) * 0.12, z); J.rotation.y = face; K.jinTick(J, t, i, scared); }
function ui2(fn) { ui.setTransform(1, 0, 0, 1, 0, 0); fn(); }
const scr = (x, y, z) => K.toScreen(S.cam, x, y, z);

// ------------------------------------------------------------------ shots
const T_POOF = 0.95;
const def = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
function drawHeart(x, y, s, a) { if (a <= 0) return; ui.save(); ui.globalAlpha = a; ui.translate(x, y); ui.fillStyle = '#ff4d6d'; ui.strokeStyle = '#5a0a1a'; ui.lineWidth = s * 0.12; ui.beginPath(); ui.moveTo(0, s * 0.35); ui.bezierCurveTo(-s, -s * 0.3, -s * 0.4, -s, 0, -s * 0.45); ui.bezierCurveTo(s * 0.4, -s, s, -s * 0.3, 0, s * 0.35); ui.closePath(); ui.fill(); ui.stroke(); ui.fillStyle = 'rgba(255,255,255,.6)'; ui.beginPath(); ui.ellipse(-s * 0.35, -s * 0.45, s * 0.15, s * 0.1, -0.6, 0, TAU); ui.fill(); ui.restore(); }
function rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const JSPOTS = [[-2.2, 2.75, 1.3], [-0.7, 2.95, 1.4], [0.9, 2.9, 1.35], [2.3, 2.7, 1.25], [-1.5, 2.95, -1.3], [0.4, 3.05, -1.35], [1.9, 2.8, -1.2], [0, 3.9, 0]];
function draw(scene) { scene.userData.sky.position.copy(S.cam.position); S.render(scene); }

// 1. Hook: the mountain puffs into a boat, gets kicked, flips and slams down upside down -> mountain again.
shot('hook', 'lamar', (t, a, b) => {
  valleySky(t, { warm: 0.3, sun: [0.5, 0.12, -1] });
  K.use(B, boatBig, dome, domeTrees, dust1);
  const tKick = W_('hook', 'ditendang'), tLand = W_('hook', 'terbalik') + 0.03;
  const boatOn = t >= T_POOF && t < tLand + 0.3;
  dome.visible = domeTrees.visible = !boatOn; boatBig.visible = boatOn;
  const base = [0, -0.5, -120];
  if (boatOn) {
    if (t < tKick) { const u = t - T_POOF; boatBig.position.set(0, 5.5 + Math.sin(u * 3) * 0.3 + (1 - ease.outBack(clamp(u / 0.45))) * 8, base[2]); boatBig.rotation.set(Math.sin(u * 2.4) * 0.05, 0, Math.sin(u * 1.7) * 0.03); }
    else { const u = clamp((t - tKick) / (tLand - tKick)); boatBig.position.set(u * 3, Math.max(1.0, (5.5 + Math.sin(u * Math.PI) * 34) * (1 - u) + 1.2 * u), base[2]); boatBig.rotation.set(ease.inOutCubic(u) * Math.PI, 0, Math.sin(u * Math.PI) * 0.2); }
  }
  dust1.position.set(0, 2, base[2]);
  if (t < T_POOF + 0.7) dust1.userData.tick((t - T_POOF + 0.12) * 1.4); else dust1.userData.tick(t - tLand + 0.02);
  const p = (t - a) / (b - a);
  const up = t > tKick ? Math.sin(clamp((t - tKick) / (tLand - tKick)) * Math.PI) : 0;
  const shk = t > tLand ? Math.exp(-(t - tLand) * 5) * 3 : 0;
  cam([lerp(16, 6, p) + noise.n2(t * 20, 1) * shk, 5 + up * 6 + noise.n2(t * 20, 2) * shk, lerp(-38, -46, p)], [0, 7 + up * 16, -120], 44, t, 0.3);
  draw(B);
  ui2(() => {
    const f = Math.max(env(t, T_POOF - 0.08, T_POOF + 0.25, 0.04, 0.2), t > tLand ? Math.exp(-(t - tLand) * 6) * 0.9 : 0);
    if (f > 0) { ui.fillStyle = `rgba(255,244,220,${f * 0.75})`; ui.fillRect(0, 0, 1080, 1920); }
    K.title(ui, 'GUNUNG INI...', 540, 300, { size: 92, alpha: env(t, 0.15, T_POOF + 0.1, 0.15, 0.15), pop: (t - 0.1) / 0.3 });
    if (t > T_POOF && t < tKick) K.title(ui, 'PERAHU?!', 540, 300, { size: 110, pop: (t - T_POOF) / 0.3, fill: ['#ffffff', '#ffb12e'] });
    if (t > tKick && t < tKick + 0.6) K.title(ui, 'DUAKK!', 760, 520, { size: 120, pop: (t - tKick) / 0.25, rot: -0.15, fill: ['#ffffff', '#ffd23a'] });
    if (t > tLand) K.title(ui, 'BRUKK!', 540, 700, { size: 140, pop: (t - tLand) / 0.3, alpha: env(t, tLand, b, 0.05, 0.25) });
  });
});

// 2. The proposal: he kneels with a flower, hearts pop... then she realises: her own son.
shot('lamar', 'syarat', (t, a, b) => {
  dayVillage(t, 0.2);
  K.use(V, sumbi.root, man.root);
  const tShock = W_('lamar', 'ibunya') - 0.1;
  const shock = t >= tShock;
  const kneel = prog(t, a + 0.05, a + 0.45, ease.inOutCubic);
  K.pose(man, { x: 0.75, z: 0.4, ry: -Math.PI / 2 + 0.25, ...K.idle(t, 8, 0.5), t, bob: kneel * -0.3, legL: [kneel * 1.5, kneel * 1.55], legR: [-kneel * 0.35, kneel * 1.9], armR: [lerp(0.2, 1.45, kneel), 0.15, 0.2], head: [0, -0.1 * kneel, 0], mouth: 'grin', blink: K.blinkAt(t, 8), blush: kneel * 0.3, scar: true });
  flower.visible = true;
  const hearts = env(t, W_('lamar', 'melamar'), b + 0.2, 0.2, 0.2);
  K.pose(sumbi, { x: -0.65, z: 0.2, ry: Math.PI / 2 - 0.35, ...K.idle(t, 6), t, ...def(shock ? { armR: [2.3, 0.4, 2.2], armL: [2.3, 0.4, 2.2] } : { armL: [0.6 * hearts, 0.2, 1.9 * hearts], armR: [0.6 * hearts, 0.2, 1.9 * hearts] }), head: shock ? [-0.35, -0.05, 0] : [0.2, 0.1, -0.15 * hearts], blush: shock ? 0 : 0.2 + hearts * 0.7, mouth: shock ? 'open' : 'grin', open: 1, wide: shock ? 1 : hearts * 0.3, brow: shock ? 0.9 : 0, blink: shock ? 0 : K.blinkAt(t, 6), lean: shock ? -0.08 : 0 });
  if (!shock) {
    const p = (t - a) / (tShock - a);
    cam(L3([1.0, 2.0, 7.8], [0.6, 1.5, 6.6], ease.inOutSine(p)), [0.05, 0.9, 0], 38, t, 0.04);
  } else {
    const u = ease.outCubic(clamp((t - tShock) / 0.35));
    const hp = sumbi.j.hc.getWorldPosition(new THREE.Vector3()); const yaw = Math.PI / 2 - 0.35 - 0.35, d = lerp(2.4, 1.75, u);
    cam([hp.x + Math.sin(yaw) * d, hp.y + 0.04, hp.z + Math.cos(yaw) * d], [hp.x, hp.y - 0.06, hp.z], 36, t, 0.015 + (1 - u) * 0.05);
  }
  draw(V);
  ui2(() => {
    if (!shock) {
      K.nameplate(ui, 'SANGKURIANG', 540, 300, { size: 58, alpha: env(t, a + 0.05, tShock, 0.2, 0.1), pop: (t - a) / 0.35 });
      if (hearts > 0) { const [hx, hy] = scr(0.0, 1.7, 0.3); for (let i = 0; i < 4; i++) { const u = ((t - W_('lamar', 'melamar')) * 0.8 + i * 0.25) % 1; drawHeart(hx + Math.sin(u * 6 + i * 2) * 60 + (i - 1.5) * 50, hy - u * 380, 42 * (1 - u * 0.4) * hearts, (1 - u) * hearts); } }
    } else {
      const u = clamp((t - tShock) / 0.25);
      AM.lib.speedLines(ui, 540, 900, { count: 70, inner: 520, outer: 1500, color: 'rgba(255,255,255,0.55)', width: 10, t, seed: 4 });
      K.title(ui, 'IBUNYA', 540, 280, { size: 120, pop: u, fill: ['#ffffff', '#ff8a5a'], stroke: '#3a0a06' });
      K.title(ui, 'SENDIRI!', 540, 400, { size: 120, pop: clamp((t - tShock - 0.15) / 0.25), fill: ['#ffffff', '#ff8a5a'], stroke: '#3a0a06' });
      const n = W_('lamar', 'Dayang');
      K.nameplate(ui, 'DAYANG SUMBI', 540, 530, { size: 56, alpha: env(t, n - 0.15, b, 0.2, 0.2), pop: (t - n + 0.15) / 0.3 });
    }
  });
});

// 3. The impossible conditions pop up between them as tiny 3D icons.
shot('syarat', 'jin', (t, a, b) => {
  dayVillage(t, 0.35);
  K.use(V, sumbi.root, man.root, icons.lake, icons.boat, icons.moon);
  K.pose(sumbi, { x: -1.0, z: 0, ry: 0.55, ...K.idle(t, 6), t, armR: [2.5, 0.25, 0.5 + Math.sin(t * 3) * 0.1], armL: [0.2, 0.15, 1.6], head: [0.25, -0.05, 0.08], ...K.talk(t, env(t, a, C.syarat.end, 0.1, 0.1), 3), brow: -0.25, blink: K.blinkAt(t, 6) });
  K.pose(man, { x: 1.1, z: 0, ry: -0.6, ...K.idle(t, 9), t, armL: [0.3, 0.1, 0.4], armR: [0.6, 0.0, 1.9], head: [-0.3, -0.12, -0.08], mouth: t > W_('syarat', 'semalam') ? 'open' : 'smile', open: 0.5, wide: t > W_('syarat', 'semalam') ? 0.6 : 0, blink: K.blinkAt(t, 9) });
  const pops = [['lake', W_('syarat', 'danau'), -0.8], ['boat', W_('syarat', 'perahu'), 0.0], ['moon', W_('syarat', 'semalam'), 0.8]];
  for (const [k, tw, x] of pops) { const o = icons[k]; const u = clamp((t - tw + 0.05) / 0.4); o.visible = u > 0; o.scale.setScalar(Math.max(0.001, ease.outBack(u, 2.5)) * 0.75); o.position.set(x * 1.15, 2.75 + Math.sin(t * 2 + x) * 0.06, 0.4); o.rotation.set(k === 'lake' ? 0.5 : 0.15, t * 0.8 + x, 0); }
  const p = (t - a) / (b - a);
  cam([0.0, 1.9, lerp(8.6, 7.6, p)], [0, 1.6, 0], 40, t, 0.04);
  draw(V);
  ui2(() => {
    for (const [k, tw, x] of pops) { const [sx, sy] = scr(x * 1.15, 2.2, 0.4); K.nameplate(ui, { lake: 'DANAU', boat: 'PERAHU', moon: '1 MALAM' }[k], sx, sy, { size: 40, alpha: env(t, tw, b, 0.15, 0.25), pop: (t - tw) / 0.3, color: k === 'moon' ? '#ffe27a' : '#9fe0ff' }); }
    K.title(ui, 'SYARATNYA', 540, 260, { size: 96, alpha: env(t, a + 0.05, b, 0.2, 0.3), pop: (t - a) / 0.3 });
  });
});

// 4. Night: the jin swirl in and hammer the boat by torchlight; progress races to 99%.
shot('jin', 'kain', (t, a, b) => {
  nightSet(t, 0.08);
  K.use(N, boatSmall, ...jins, sparks);
  jins.forEach((J, i) => { const u = ease.outCubic(clamp((t - a - i * 0.05) / 0.5)); const [x, y, z] = JSPOTS[i]; const ang = (1 - u) * 4 + i; J.visible = true; J.scale.setScalar(0.62 * Math.max(0.05, u)); jinPose(J, lerp(Math.cos(ang) * 4, x, u), lerp(0.3, y, u), lerp(Math.sin(ang) * 4, z, u), t, i, { face: i % 2 ? Math.PI / 2 : -Math.PI / 2 }); J.userData['arm1'].rotation.z = 0.4 + Math.max(0, Math.sin(t * 10 + i * 1.3)) * 1.4; });
  sparks.position.set(0, 2.8, 0); sparks.userData.tick(t - a);
  const p = (t - a) / (b - a); const ang = lerp(0.95, 0.5, p);
  cam([Math.sin(ang) * 12, 4.2 - p * 0.6, Math.cos(ang) * 12], [0, 2.1, 0], 40, t, 0.05);
  draw(N);
  ui2(() => {
    const pct = Math.floor(lerp(80, 99, ease.outCubic(clamp((t - a - 0.1) / (b - a - 0.3)))));
    const x = 190, y = 430, w = 700, h = 50;
    ui.fillStyle = 'rgba(10,14,40,0.85)'; rr(ui, x - 10, y - 10, w + 20, h + 20, 30); ui.fill();
    ui.strokeStyle = '#8ff0ff'; ui.lineWidth = 4; rr(ui, x - 10, y - 10, w + 20, h + 20, 30); ui.stroke();
    const g = ui.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#5fd8ff'); g.addColorStop(1, '#7ff0c8'); ui.fillStyle = g; rr(ui, x, y, w * pct / 100, h, 24); ui.fill();
    K.title(ui, 'PARA JIN', 540, 270, { size: 96, pop: (t - a) / 0.3, fill: ['#ffffff', '#8ff0ff'], stroke: '#0d2240' });
    K.nameplate(ui, `PERAHU ${pct}%`, 540, 570, { size: 46, color: '#9fe0ff' });
  });
});

// 5. On the hill she spreads the magic cloth: the eastern sky turns red. The rooster crows.
shot('kain', 'tendang', (t, a, b) => {
  const tRoo = W_('kain', 'Ayam') - 0.12;
  if (t < tRoo) {
    const red = prog(t, W_('kain', 'memalsukan') - 0.1, W_('kain', 'fajar') + 0.3, ease.inOutSine);
    nightSet(t, red);
    K.use(N, sumbi.root, cloth);
    const hy = hN(20, 0);
    const spread = prog(t, a + 0.15, W_('kain', 'fajar'), ease.inOutCubic);
    K.pose(sumbi, { x: 20, y: hy, z: 0, ry: Math.PI / 2, t, vel: 0.6 + spread, armL: [lerp(0.3, 2.3, spread), lerp(0.2, 1.1, spread), 0.2], armR: [lerp(0.3, 2.3, spread), lerp(0.2, 1.1, spread), 0.2], head: [0, -0.3 * spread, 0], blink: 0, lean: -0.05 });
    const big = ease.inOutCubic(clamp((spread - 0.2) / 0.8));
    cloth.visible = spread > 0.02;
    cloth.position.set(lerp(21.0, 60, big), lerp(hy + 1.6, hy + 11, big), 0); cloth.rotation.set(0, -Math.PI / 2, 0); cloth.scale.setScalar(lerp(0.55, 9, big)); cloth.userData.tick(t, 0.8 + big * 0.6);
    const p = (t - a) / (tRoo - a);
    cam([lerp(15.6, 15.0, p), hy + 0.9, lerp(2.0, 2.6, p)], [26, lerp(hy + 1.6, hy + 3.4, big), -0.8], 44, t, 0.04);
    draw(N);
    ui2(() => {
      K.nameplate(ui, 'DAYANG SUMBI', 540, 300, { size: 52, alpha: env(t, a + 0.05, W_('kain', 'memalsukan') + 0.4, 0.2, 0.25), pop: (t - a) / 0.3 });
      K.nameplate(ui, 'KAIN AJAIB  ➜  TIMUR', 540, 420, { size: 42, alpha: env(t, a + 0.3, tRoo, 0.2, 0.2), color: '#ffd27a' });
      if (red > 0.2) K.title(ui, 'FAJAR PALSU', 540, 290, { size: 96, alpha: env(t, W_('kain', 'fajar') - 0.2, tRoo, 0.2, 0.1), pop: (t - W_('kain', 'fajar') + 0.2) / 0.35, fill: ['#fff1c0', '#ff6a3a'], stroke: '#3a0a06' });
    });
  } else {
    dayVillage(t, 1);
    sky(V, { top: '#3a2a6a', mid: '#ff6a3a', bot: '#ffc070', sun: [1, 0.05, -0.2], sunC: '#ffd27a', sunK: 1.0, stars: 0.3, fog: '#c77060' }, t);
    V.userData.L.set({ keyC: '#ff9a6a', keyI: 1.2, keyPos: [12, 4, -2], sky: '#ff9070', ground: '#2a1a20', hemiI: 0.7 });
    K.setRim('#ffb27a', 0.6);
    K.use(V, rooster.root);
    rooster.root.position.set(5.7, 1.15, -2.5); rooster.root.rotation.y = 1.25;
    const crow = env(t, tRoo + 0.08, b + 0.1, 0.18, 0.1);
    K.roosterPose(rooster, { crow, t, flap: crow });
    const p = (t - tRoo) / (b - tRoo);
    cam([4.7 - p * 0.15, 2.0, 0.5 - p * 0.3], [5.75, 1.8, -2.5], 40, t, 0.02);
    draw(V);
    ui2(() => {
      const [hx, hy] = scr(5.75, 2.2, -2.3);
      K.rings(ui, hx + 40, hy - 40, t, { n: 3, r: 260, color: '255,240,200', alpha: crow });
      K.title(ui, 'KUKURUYUUK!', 540, 330, { size: 100, pop: (t - tRoo - 0.05) / 0.3, rot: -0.06 + Math.sin(t * 30) * 0.01 * crow, fill: ['#fff7c0', '#ffb02e'] });
    });
  }
});

// 6. He kicks the boat into the sky; it lands upside down in the valley: Gunung Tangkuban Perahu.
shot('tendang', null, (t, a, b) => {
  const tKick = W_('tendang', 'menendangnya') + 0.18, tCut = W_('tendang', 'Jadilah') - 0.3;
  if (t < tCut) {
    nightSet(t, 1);
    K.use(N, man.root, boatSmall, steam, dust2);
    const wind = prog(t, tKick - 0.5, tKick - 0.05, ease.outCubic), strike = prog(t, tKick - 0.05, tKick + 0.12, ease.outQuad);
    const angry = env(t, W_('tendang', 'murka') - 0.25, b, 0.2, 0.3);
    man.j.hc.children[0].material.color.set(K.mix('#e3ab80', '#ff6a50', angry * 0.7));
    K.pose(man, { x: -0.5, z: 2.3, ry: Math.PI - 0.15, t, vel: 1, ...K.idle(t, 9, 0.3), legR: [lerp(lerp(0, -0.9, wind), 1.9, strike), lerp(lerp(0, 1.2, wind), 0.1, strike)], legL: [-0.15 * strike, 0.2 * wind], lean: lerp(lerp(0, -0.25, wind), 0.25, strike), armL: [lerp(0.4, 1.2, strike), 0.9, 0.6], armR: [lerp(1.0, -0.6, strike), 0.9, 0.6], brow: -1, mouth: 'open', open: 0.6 + 0.3 * Math.sin(t * 12), head: [0.1, -0.1, 0], blink: 0, bob: -wind * 0.08 });
    steam.position.set(-0.5, 2.25, 2.3); steam.userData.tick((t - a) % 0.9); steam.visible = steam.visible && angry > 0.3 && t < tKick;
    const fly = clamp((t - tKick) / 0.8);
    boatSmall.position.set(lerp(0, 5, fly), 1.9 + ease.inQuad(fly) * 26, lerp(0, -14, fly)); boatSmall.rotation.set(-fly * 2, fly * 1.2, -fly * 5);
    dust2.position.set(-0.3, 1.4, 1.4); dust2.userData.tick(t - tKick);
    const shk = t > tKick ? Math.exp(-(t - tKick) * 6) * 0.25 : 0;
    cam([-7.0 + noise.n2(t * 25, 1) * shk, 1.4 + noise.n2(t * 25, 3) * shk + fly * 0.6, -0.8], [lerp(-0.3, 2.5, fly), 1.3 + fly * 6, lerp(1.6, -6, fly)], 40, t, 0.04);
    draw(N);
    ui2(() => {
      if (t < tKick) K.title(ui, 'MURKA!', 540, 300, { size: 110, alpha: env(t, W_('tendang', 'murka') - 0.25, tKick, 0.15, 0.05), pop: (t - W_('tendang', 'murka') + 0.25) / 0.3, rot: Math.sin(t * 40) * 0.02, fill: ['#fff1c0', '#ff4a2a'], stroke: '#3a0606' });
      else { AM.lib.speedLines(ui, 540, 960, { count: 60, inner: 480, outer: 1500, color: 'rgba(255,240,220,0.5)', width: 9, t, seed: 7 }); K.title(ui, 'DUAKK!', 600, 420, { size: 140, pop: (t - tKick) / 0.25, rot: -0.12, fill: ['#ffffff', '#ffd23a'] }); }
    });
    return;
  }
  // the valley: the boat falls upside down and becomes the mountain
  valleySky(t, { warm: 0.6, sun: [0.6, 0.08, -1] });
  K.use(B, boatBig, dome, domeTrees, dust1);
  const tLand = tCut + 0.3;
  const fall = clamp((t - tCut) / 0.3);
  const isBoat = t < tLand + 0.25;
  boatBig.visible = isBoat; dome.visible = domeTrees.visible = !isBoat;
  boatBig.position.set(lerp(-15, 0, fall), lerp(40, 1.0, ease.inQuad(fall)), -120);
  boatBig.rotation.set(lerp(Math.PI * 0.55, Math.PI, ease.outCubic(fall)), 0, lerp(0.3, 0, fall));
  dust1.position.set(0, 2, -120); dust1.userData.tick(t - tLand);
  const p = clamp((t - tCut) / (AM.duration - tCut));
  const shk = t > tLand ? Math.exp(-(t - tLand) * 4) * 2.2 : 0;
  cam([lerp(22, 14, p) + noise.n2(t * 20, 1) * shk, lerp(6, 5, p) + noise.n2(t * 20, 2) * shk, lerp(-46, -40, p)], [0, 8, -120], 42, t, 0.25);
  draw(B);
  ui2(() => {
    const f = t > tLand ? Math.exp(-(t - tLand) * 5) : 0; if (f > 0.01) { ui.fillStyle = `rgba(255,244,220,${f * 0.8})`; ui.fillRect(0, 0, 1080, 1920); }
    const tw = W_('tendang', 'Tangkuban');
    K.title(ui, 'GUNUNG', 540, 230, { size: 70, alpha: env(t, tw - 0.35, AM.duration + 1, 0.2, 0.1), pop: (t - tw + 0.35) / 0.3 });
    K.title(ui, 'TANGKUBAN PERAHU', 540, 330, { size: 92, alpha: env(t, tw - 0.1, AM.duration + 1, 0.2, 0.1), pop: (t - tw + 0.1) / 0.35 });
    // dotted outline of the upturned boat over the ridge
    const dr = prog(t, W_('tendang', 'Perahu') - 0.1, W_('tendang', 'Perahu') + 0.8, ease.inOutCubic);
    if (dr > 0) {
      const pts = []; for (let i = 0; i <= 40; i++) { const x = lerp(-1, 1, i / 40); pts.push(scr(x * 22, (1 - Math.pow(Math.abs(x), 2.2)) * 13.5 - Math.pow(Math.abs(x), 4) * 5 - 0.3, -112)); }
      const n = Math.floor(pts.length * dr);
      ui.save(); ui.strokeStyle = '#fff1b0'; ui.lineWidth = 8; ui.setLineDash([4, 16]); ui.lineCap = 'round';
      ui.beginPath(); for (let i = 0; i <= n && i < pts.length; i++) (i ? ui.lineTo(pts[i][0], pts[i][1]) : ui.moveTo(pts[i][0], pts[i][1])); ui.stroke(); ui.restore();
      K.nameplate(ui, '= PERAHU TERBALIK', 540, 450, { size: 44, alpha: dr });
    }
    const fade = clamp((t - (AM.duration - 0.4)) / 0.4); if (fade > 0) { ui.fillStyle = `rgba(10,5,0,${fade})`; ui.fillRect(0, 0, 1080, 1920); }
  });
});

// ------------------------------------------------------------------ render
export function render(t, AM) {
  // reset every movable piece so any frame renders on its own
  hide(sumbi.root, kid.root, man.root, modern.root, rooster.root, ...jins, cloth, icons.lake, icons.boat, icons.moon, cent);
  flower.visible = false; bump.visible = false; man.j.iketParts.forEach((m) => (m.visible = true));
  man.j.hc.children[0].material.color.set('#e3ab80');
  boatSmall.position.set(0, 1.9, 0); boatSmall.rotation.set(0, 0, 0); boatSmall.visible = true;
  river.rocks.forEach((r) => (r.visible = false));
  for (const P of [dust1, dust2, sparks, steam]) P.userData.tick(-1);
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id, s.next);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  s.fn(t, Math.max(0, a), b);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  K.finish(ui, AM, t, { flash: s.id !== 'hook' && since < 0.16 ? 0.28 * (1 - since / 0.16) : 0 });
}
