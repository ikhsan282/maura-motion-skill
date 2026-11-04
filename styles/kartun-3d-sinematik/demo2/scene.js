// Kartun 3D Sinematik demo 2: "Malin Kundang & Kutukan Batu Pantai Air Manis" (legenda Sumatera Barat), 10 shots.
import * as K from '/styles/kartun-3d-sinematik/kit.js';
const THREE = K.THREE;
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'bold', y: 1450, size: 70 } };

let S, ui, C = {};
const W_ = (id, w) => AM.wordTime(id, w);

// Scene & lighting
let P; // Pantai Air Manis coastal village + bay
// Cast
let malinMuda, malinKaya, mande, istri, batuMalin;
// Props
let shipGrand, boatSmall, jetty, lightningBolt, waveWall, ropeDebris = [];
let dustSand, splashSea, stormSparks, magicSmoke, glowLightning, heartBroken;

// ------------------------------------------------------------------ coastal terrain height
function hBeach(x, z) {
  // z > 4 is ocean, z <= 4 rises into sandy beach and coastal hills in the back (z < -10)
  const sea = clamp((z - 3.5) / 8);
  const backHill = Math.max(0, -z - 12);
  const sideCliff = Math.max(0, -x - 16) * 0.45 + Math.max(0, x - 22) * 0.3;
  let h = lerp(0.35, -1.8, sea) + backHill * 0.34 + sideCliff;
  h += noise.fbm2(x * 0.04, z * 0.04, 3) * (0.25 + backHill * 0.08);
  // rocky outcrop on the right beach (x around 6..10, z around 1..3) where the stone curse happens
  h += 0.45 * Math.exp(-((x - 7.5) ** 2 + (z - 1.5) ** 2) / 9);
  return h;
}

// ------------------------------------------------------------------ custom 3D builders
function buildMerchantShip() {
  const G = new THREE.Group();
  const hull = K.boat({ len: 9.5, beam: 2.8, depth: 1.75, color: '#8c4f2b', prow: 1.15 });
  G.add(hull);
  // Golden trim along gunwale & stern cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.3, 2.1), K.toon('#703b1e'));
  cabin.position.set(-2.2, 0.85, 0); G.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.22, 2.45), K.toon('#d9a13b'));
  roof.position.set(-2.2, 1.55, 0); G.add(roof);
  // Two masts with billowing sails
  for (const [mx, mh, sw] of [[0.4, 5.2, 3.2], [2.8, 4.1, 2.4]]) {
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, mh, 8), K.toon('#5a351c'));
    mast.position.set(mx, mh / 2, 0); G.add(mast);
    const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, sw, 6), K.toon('#5a351c'));
    yard.rotation.x = Math.PI / 2; yard.position.set(mx, mh * 0.82, 0); G.add(yard);
    // curved sail
    const sg = new THREE.PlaneGeometry(sw * 0.92, mh * 0.56, 12, 12);
    const sp = sg.attributes.position;
    for (let i = 0; i < sp.count; i++) {
      const u = sp.getX(i) / (sw * 0.46), v = sp.getY(i) / (mh * 0.28);
      sp.setZ(i, (1 - u * u * 0.5) * (1 - v * v * 0.35) * 0.55);
    }
    sg.computeVertexNormals();
    const sail = new THREE.Mesh(sg, K.toon('#fff5df', { side: THREE.DoubleSide }));
    sail.rotation.y = Math.PI / 2;
    sail.position.set(mx + 0.1, mh * 0.54, 0);
    G.add(sail);
    // red-gold pennant flag on top
    const flag = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 4), K.toon('#d9382e'));
    flag.rotation.z = Math.PI / 2; flag.position.set(mx - 0.4, mh + 0.08, 0); G.add(flag);
  }
  K.outline(G, 0.0028);
  return G;
}

function buildJetty() {
  const G = new THREE.Group();
  const wood = K.toon('#7a4e2d'), plank = K.toon('#96633c');
  // wooden pier extending from z = 1.5 out to z = 11.5 at x = -3.5
  for (let i = 0; i < 6; i++) {
    const z = 2.0 + i * 1.85;
    for (const sx of [-1.1, 1.1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 2.6, 7), wood);
      post.position.set(sx, -0.1, z); G.add(post);
    }
  }
  for (let i = 0; i < 22; i++) {
    const bd = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 0.38), i % 2 ? plank : wood);
    bd.position.set(0, 0.85, 1.6 + i * 0.46); G.add(bd);
  }
  // mooring bollards with coiled rope
  for (const [bx, bz] of [[-0.95, 10.8], [0.95, 10.8], [-0.95, 6.2]]) {
    const bol = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.5, 8), wood);
    bol.position.set(bx, 1.15, bz); G.add(bol);
    const rp = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.045, 6, 14), K.toon('#c89d54'));
    rp.rotation.x = Math.PI / 2; rp.position.set(bx, 1.05, bz); G.add(rp);
  }
  K.outline(G, 0.0026);
  return G;
}

function buildLightning() {
  const G = new THREE.Group();
  const pts = [[0, 26, 0], [-1.4, 19, 0.5], [0.9, 14, -0.3], [-1.8, 8, 0.2], [0.4, 3.5, 0], [-0.5, 0, 0]].map((p) => new THREE.Vector3(...p));
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.28, 6, false);
  const mesh = new THREE.Mesh(geo, K.basic('#fffbe0'));
  mesh.userData.noOutline = true;
  G.add(mesh);
  const halo = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.72, 6, false), K.basic('#7fe8ff', { transparent: true, opacity: 0.45 }));
  halo.userData.noOutline = true;
  G.add(halo);
  return G;
}

function buildWaveWall() {
  const G = new THREE.Group();
  const g = new THREE.CylinderGeometry(3.2, 4.2, 22, 24, 1, false, 0, Math.PI * 1.15);
  g.rotateZ(Math.PI / 2);
  const m = new THREE.Mesh(g, K.toon('#2b6f9a', { emissive: '#1a4a6e', ei: 0.35, side: THREE.DoubleSide }));
  G.add(m);
  // white foam crest
  for (let i = -5; i <= 5; i++) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85 + (i % 2) * 0.25, 1), K.toon('#e8f7ff'));
    f.position.set(i * 1.8, 2.8 + Math.cos(i) * 0.25, 1.4);
    G.add(f);
  }
  K.outline(G, 0.0026);
  return G;
}

function buildCoastalScene() {
  P = new THREE.Scene();
  P.fog = new THREE.Fog('#ffe6c0', 30, 190);
  P.userData.sky = K.skyDome(380); P.add(P.userData.sky);
  P.userData.L = K.lights(P);

  const terr = K.terrain({
    w: 240, d: 240, seg: 100, height: hBeach,
    color: (x, z, y) => {
      if (y < -0.15) return '#c89e64';
      if (z > -2.5 && y < 0.9) return noise.n2(x * 0.25, z * 0.25) > 0.2 ? '#e6c387' : '#d8b274'; // warm sand
      if (Math.abs(x + 3.5) < 1.3 && z > -9 && z <= 2) return '#b88652'; // path to jetty
      return noise.n2(x * 0.2, z * 0.2) > 0.25 ? '#6fae4a' : '#82c258';
    },
  });
  P.add(terr);

  // ocean surface
  const sea = K.water(240, 160, { color: '#45a2cc', deep: '#1e5b82' });
  sea.position.set(0, -0.18, 82);
  P.add(sea); P.userData.sea = sea;

  // Minang / coastal stilt house in the village background
  const house1 = K.house({ w: 4.2, d: 3.1, h: 2.2 });
  house1.position.set(-7.5, hBeach(-7.5, -9.5) - 0.05, -9.5); house1.rotation.y = 0.28;
  P.add(house1);
  const house2 = K.house({ w: 3.4, d: 2.6, h: 1.9 });
  house2.position.set(11.5, hBeach(11.5, -11) - 0.05, -11); house2.rotation.y = -0.25;
  P.add(house2);

  // Coconut palms along the beach
  const palms = [
    ['palm', -11, -3.5], ['palm', -8.5, -1.2], ['palm', 10.5, -1.5], ['palm', 14, -4.5],
    ['palm', 4.5, -8.5], ['round', -14, -9], ['round', 16, -9.5], ['bamboo', -2, -12.5], ['palm', -16, 1.0],
  ];
  P.userData.trees = palms.map(([k, x, z], i) => {
    const t = K.tree(k, { seed: i + 11, s: 1.15 + hrand(i, 3) * 0.3 });
    t.position.set(x, hBeach(x, z) - 0.08, z);
    P.add(t);
    return t;
  });

  // Coastal rocks around the stone curse site (x=7.5, z=1.5) & shoreline
  const rockSpots = [[5.4, 2.2, 0.75], [9.4, 1.8, 0.9], [8.6, 0.1, 0.65], [6.2, 0.2, 0.55], [-9.5, 2.6, 0.8], [13.5, 2.5, 1.1]];
  rockSpots.forEach(([rx, rz, rs], i) => {
    const r = K.rock(rs, i + 30, i % 2 ? '#7c756c' : '#8f877c');
    r.position.set(rx, hBeach(rx, rz) + 0.1, rz);
    P.add(r);
  });

  // Scattered shipwrecks / planks & coiled ropes near the stone site for the hook & finale
  for (let i = 0; i < 6; i++) {
    const pl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.28), K.toon('#7d6e5d'));
    const a = (i / 6) * TAU;
    pl.position.set(7.5 + Math.cos(a) * 1.9, hBeach(7.5, 1.5) + 0.08, 1.5 + Math.sin(a) * 1.4);
    pl.rotation.set(0.12, a + 0.4, (i % 2 ? 1 : -1) * 0.15);
    K.outline(pl, 0.0026);
    P.add(pl);
    ropeDebris.push(pl);
  }
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 8, 16), K.toon('#75695b'));
  wheel.position.set(6.3, hBeach(6.3, 1.9) + 0.25, 1.9); wheel.rotation.set(0.9, 0.3, 0.2);
  K.outline(wheel, 0.0026); P.add(wheel); ropeDebris.push(wheel);

  // Distant islands & mountains across the bay
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(26 + i * 5, 18 + (i % 3) * 7, 9), K.toon(i % 2 ? '#6d8ea6' : '#7f9eb2', { flat: true }));
    m.position.set(-130 + i * 65, 5, 165 + (i % 2) * 20);
    P.add(m);
  }

  jetty = buildJetty(); jetty.position.set(-3.5, 0, 0); P.add(jetty);
  shipGrand = buildMerchantShip(); P.add(shipGrand);
  boatSmall = K.boat({ len: 4.2, beam: 1.35, depth: 0.85, color: '#9c6239' }); P.add(boatSmall);
  lightningBolt = buildLightning(); P.add(lightningBolt);
  waveWall = buildWaveWall(); P.add(waveWall);

  dustSand = K.burst({ n: 55, color: '#e6c994', size: 0.55, speed: 3.6, up: 2.2, grav: -4, life: 1.1, seed: 5 }); P.add(dustSand);
  splashSea = K.burst({ n: 85, color: '#d8f4ff', size: 1.1, speed: 8.5, up: 6.5, grav: -6, life: 1.4, seed: 11 }); P.add(splashSea);
  stormSparks = K.burst({ n: 65, color: '#9fe8ff', size: 0.45, speed: 6, up: 5, grav: -2, life: 0.9, seed: 19, additive: true }); P.add(stormSparks);
  magicSmoke = K.burst({ n: 50, color: '#b5afa6', size: 0.85, speed: 2.5, up: 2.8, grav: -0.5, life: 1.4, seed: 23 }); P.add(magicSmoke);
  glowLightning = K.glow('#9fe8ff', 14, 0.9); P.add(glowLightning);
  heartBroken = K.heart('#ff4d6d'); P.add(heartBroken);
}

// ------------------------------------------------------------------ setup
export async function setup(AM) {
  S = K.stage(AM, { pr: 0.66 }); ui = S.ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  buildCoastalScene();

  // Cast
  malinMuda = K.character({
    kind: 'man', skin: '#e5ad82', top: '#7a5234', bottom: '#3e2d21',
    hair: 'short', iket: '#6e3b1e', sash: '#c48a3f', eye: '#3a2210',
  });
  malinKaya = K.character({
    kind: 'man', skin: '#e5ad82', top: '#8c1d24', bottom: '#232842',
    trim: '#ffd24a', hair: 'short', iket: '#d49b2a', sash: '#ffd24a', eye: '#3a2210',
  });
  mande = K.character({
    kind: 'woman', skin: '#d89c72', top: '#6e523e', trim: '#b89462',
    hair: 'bun', hairC: '#9e9890', hairHi: '#d8d2c8', lashes: false,
    scarf: '#8c694a', eye: '#3a2210',
    skirtMap: K.batikTex('#523522', '#24140a', '#b88c52', 'kawung'),
  });
  istri = K.character({
    kind: 'woman', skin: '#f5c7a3', top: '#c92a6a', trim: '#ffd24a',
    hair: 'bun', lashes: true, scarf: '#ffbe3b', eye: '#4a2612',
    skirtMap: K.batikTex('#7a1c44', '#2e0819', '#ffd24a', 'parang'),
  });
  // Stone figure of Malin Kundang (all stone-grey toon materials)
  batuMalin = K.character({
    kind: 'man', skin: '#8a847c', top: '#78726a', bottom: '#6b655e',
    trim: '#969088', hair: 'short', hairC: '#6e6860', iket: '#827c74', sash: '#8c867e', eye: '#5c5750',
  });

  // Sound design synced to narration words
  AM.sfx('boom', W_('hook', 'batu') - 0.05, { gain: 0.45 });
  AM.sfx('wind', W_('pamit', 'merantau'), { gain: 0.35 });
  AM.sfx('chime', W_('doa', 'mendoakan'), { gain: 0.35 });
  AM.sfx('swoosh', W_('kapal', 'kapal'), { gain: 0.4 });
  AM.sfx('footstep', W_('sambut', 'berlari'), { gain: 0.4 });
  AM.sfx('drum_hit', W_('peluk', 'mundur') - 0.05, { gain: 0.5 });
  AM.sfx('impact', W_('tolak', 'mendorong') + 0.05, { gain: 0.6 });
  AM.sfx('magic', W_('langit', 'menengadah'), { gain: 0.45 });
  AM.sfx('thunder', W_('badai', 'petir') - 0.05, { gain: 0.65 });
  AM.sfx('boom', W_('badai', 'terbelah') - 0.05, { gain: 0.6 });
  AM.sfx('magic', W_('batu', 'membeku'), { gain: 0.5 });
}

// ------------------------------------------------------------------ helpers
const span = (id, next) => [C[id].start - 0.12, next ? C[next].start - 0.12 : AM.duration + 1];
const SHOTS = []; const shot = (id, next, fn) => SHOTS.push({ id, next, fn });

function cam(pos, look, fov = 38, t = 0, amp = 0.04, roll = 0) {
  const d = K.drift(t, amp, 5);
  K.shootCam(S.cam, [pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]], [look[0] + d[0] * 0.5, look[1] + d[1] * 0.5, look[2]], fov, roll);
}
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const scr = (x, y, z) => K.toScreen(S.cam, x, y, z);
function ui2(fn) { ui.setTransform(1, 0, 0, 1, 0, 0); fn(); }
function hide(...objs) { objs.forEach((o) => { if (o && o.parent) o.parent.remove(o); }); }

function setAtmosphere(t, { storm = 0, warm = 0.35 } = {}) {
  const top = K.mix(K.mix('#3b73cc', '#4c5eb0', warm), '#10162b', storm);
  const mid = K.mix(K.mix('#98ccf2', '#f59c62', warm), '#232e4d', storm);
  const bot = K.mix(K.mix('#fff2d6', '#ffd296', warm), '#384666', storm);
  const fog = K.mix(K.mix('#e6f0f5', '#ffe0ba', warm), '#222b44', storm);
  P.userData.sky.position.copy(S.cam.position);
  K.setSky(P.userData.sky, {
    top, mid, bot,
    sun: [0.55, lerp(0.28, 0.1, warm), 1],
    sunC: K.mix('#fff4cc', '#ffae60', warm),
    sunK: (1 - storm * 0.92) * 0.85,
    stars: storm * 0.35,
    t,
  });
  P.fog.color.set(fog);
  P.userData.L.set({
    keyC: K.mix(K.mix('#fff2d8', '#ffc488', warm), '#7898c8', storm),
    keyI: lerp(1.45, 0.72, storm),
    keyPos: [8, 12, -6],
    sky: K.mix('#cbe2ff', '#3b4e78', storm),
    ground: K.mix('#7a6242', '#1d2230', storm),
    hemiI: lerp(0.88, 0.55, storm),
    backC: K.mix('#ffd69c', '#6cd4ff', storm),
    backI: lerp(0.85, 1.15, storm),
  });
  K.setRim(K.mix('#ffefc2', '#7fd8ff', storm), lerp(0.42, 0.65, storm));
  P.userData.sea.userData.tick(t * (1 + storm * 2.5));
  P.userData.trees.forEach((tr, i) => K.sway(tr, t * (1 + storm * 2.2), 0.03 + storm * 0.09, i));
}

function poseKneelStone(char, x, z, ry = -0.5, scale = 1.15) {
  const y = hBeach(x, z);
  char.S.scale = scale;
  K.pose(char, {
    x, y: y - 0.18, z, ry,
    bob: -0.34, lean: 0.78,
    legL: [1.55, 1.85], legR: [1.5, 1.85],
    armL: [1.35, 0.25, 0.85], armR: [1.35, 0.25, 0.85],
    head: [0, 0.45, 0], brow: 0.9, mouth: 'open', open: 0.6, wide: 0.6, blink: 0,
  });
}

function drawBrokenHeart2D(x, y, s, split, alpha) {
  if (alpha <= 0) return;
  ui.save(); ui.globalAlpha = alpha; ui.translate(x, y);
  for (const side of [-1, 1]) {
    ui.save();
    ui.translate(side * split * 28, split * 12);
    ui.rotate(side * split * 0.22);
    ui.beginPath();
    if (side < 0) ui.rect(-s * 1.4, -s * 1.4, s * 1.45, s * 2.8);
    else ui.rect(-s * 0.05, -s * 1.4, s * 1.45, s * 2.8);
    ui.clip();
    ui.fillStyle = '#ff3b5c'; ui.strokeStyle = '#4a0816'; ui.lineWidth = s * 0.12;
    ui.beginPath();
    ui.moveTo(0, s * 0.45);
    ui.bezierCurveTo(-s * 1.1, -s * 0.25, -s * 0.5, -s * 1.05, 0, -s * 0.42);
    ui.bezierCurveTo(s * 0.5, -s * 1.05, s * 1.1, -s * 0.25, 0, s * 0.45);
    ui.closePath(); ui.fill(); ui.stroke();
    ui.restore();
  }
  ui.restore();
}

// ------------------------------------------------------------------ 10 SHOTS
// 1. HOOK: Dramatic crane + orbit reveal of the kneeling human-shaped stone on Pantai Air Manis.
shot('hook', 'pamit', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setAtmosphere(t, { warm: 0.45, storm: 0 });
  K.use(P, batuMalin.root);
  ropeDebris.forEach((r) => (r.visible = true));
  poseKneelStone(batuMalin, 7.5, 1.5, -0.55, 1.18);

  const tSub = W_('hook', 'bersujud');
  const punch = prog(t, tSub - 0.25, tSub + 0.35, ease.outCubic);
  const cPos = L3([11.5, 2.3, 6.2], [8.8, 1.25, 4.1], ease.inOutSine(p));
  cam([cPos[0] - punch * 0.4, cPos[1] - punch * 0.15, cPos[2] - punch * 0.5], [7.5, 0.65, 1.5], 38, t, 0.035);
  S.render(P);

  ui2(() => {
    K.nameplate(ui, 'PANTAI AIR MANIS · SUMBAR', 540, 220, { size: 42, alpha: env(t, a + 0.1, b, 0.2, 0.2), pop: (t - a) / 0.35, color: '#ffe082' });
    const tBatu = W_('hook', 'batu');
    if (t >= tBatu - 0.1) {
      K.title(ui, 'BATU BERSUJUD?!', 540, 340, { size: 96, pop: (t - tBatu + 0.1) / 0.3, alpha: env(t, tBatu - 0.1, b, 0.15, 0.2), fill: ['#fff6c8', '#ffb03a'] });
    }
    if (t >= tSub - 0.2) {
      const [sx, sy] = scr(7.5, 1.1, 1.5);
      K.pointer(ui, 'BATU MALIN KUNDANG', 540, 500, sx, sy, { size: 42, alpha: env(t, tSub - 0.2, b, 0.2, 0.2) });
    }
  });
});

// 2. PAMIT: Young Malin Kundang says goodbye to his mother Mande Rubayah by the village shore.
shot('pamit', 'doa', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setAtmosphere(t, { warm: 0.25, storm: 0 });
  K.use(P, mande.root, malinMuda.root, boatSmall);
  boatSmall.position.set(-1.4, -0.05 + Math.sin(t * 2.2) * 0.05, 5.2);
  boatSmall.rotation.set(0, 0.35, Math.sin(t * 1.8) * 0.04);

  const tWalk = W_('pamit', 'merantau');
  const walkU = prog(t, tWalk - 0.2, b, ease.inOutSine);
  const mx = lerp(-4.5, -3.5, walkU), mz = lerp(-1.2, 2.8, walkU);
  K.pose(malinMuda, {
    x: mx, y: hBeach(mx, mz), z: mz,
    ry: lerp(-1.2, -0.15, walkU),
    ...(walkU > 0.02 && walkU < 0.98 ? K.walk(t * 1.8, 0.85) : K.idle(t, 2)),
    armR: walkU < 0.4 ? [1.2, 0.2, 0.8] : [2.2, 0.35 + Math.sin(t * 6) * 0.25, 0.3],
    head: [walkU > 0.3 ? -0.45 : 0.1, 0, 0],
    ...K.talk(t, env(t, a, tWalk, 0.1, 0.1), 2),
    t,
  });
  K.pose(mande, {
    x: -5.8, y: hBeach(-5.8, -1.4), z: -1.4,
    ry: 1.35,
    ...K.idle(t, 5),
    armR: [1.55, 0.2, 0.65 + Math.sin(t * 4) * 0.15],
    armL: [0.4, 0.15, 1.1],
    brow: 0.45, mouth: 'smile',
    t,
  });

  cam(L3([-2.2, 1.9, 2.8], [-1.4, 2.1, 4.2], p), [-4.8, 1.1, 0.0], 38, t, 0.035);
  S.render(P);

  ui2(() => {
    const [mxS, myS] = scr(mx, hBeach(mx, mz) + 1.85, mz);
    K.nameplate(ui, 'MALIN KUNDANG', clamp(mxS, 240, 840), clamp(myS - 70, 220, 480), { size: 46, alpha: env(t, W_('pamit', 'Malin') - 0.2, tWalk + 0.3, 0.2, 0.2), pop: (t - W_('pamit', 'Malin') + 0.2) / 0.3 });
    const tMande = W_('pamit', 'Mande');
    if (t >= tMande - 0.2) {
      K.nameplate(ui, 'MANDE RUBAYAH', 540, 320, { size: 46, sub: 'Ibunda Malin', alpha: env(t, tMande - 0.2, b, 0.2, 0.2), pop: (t - tMande + 0.2) / 0.3, color: '#9fe0ff' });
    }
  });
});

// 3. DOA: Elderly mother stands at the end of the wooden jetty at sunset, praying and gazing out to sea.
shot('doa', 'kapal', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setAtmosphere(t, { warm: lerp(0.35, 0.85, p), storm: 0 });
  K.use(P, mande.root, boatSmall);
  // tiny distant boat disappearing on horizon
  boatSmall.position.set(lerp(4, 18, p), -0.1, lerp(28, 65, p));
  boatSmall.scale.setScalar(lerp(0.8, 0.35, p));

  const pray = prog(t, W_('doa', 'mendoakan') - 0.3, b, ease.inOutSine);
  K.pose(mande, {
    x: -3.5, y: 0.9, z: 9.8,
    ry: 0.08,
    ...K.idle(t, 7, 0.6),
    lean: 0.08,
    armL: [lerp(0.4, 1.45, pray), 0.15, lerp(1.1, 1.35, pray)],
    armR: [lerp(0.4, 1.45, pray), 0.15, lerp(1.1, 1.35, pray)],
    head: [0, -0.18 * pray, 0],
    brow: 0.55,
    t,
  });

  cam(L3([-1.2, 2.35, 6.4], [-1.8, 2.15, 7.2], ease.inOutSine(p)), [-3.5, 1.85, 11.5], 38, t, 0.03);
  S.render(P);

  ui2(() => {
    K.title(ui, 'DOA SEORANG IBU', 540, 280, { size: 84, alpha: env(t, a + 0.15, b, 0.25, 0.25), pop: (t - a - 0.1) / 0.35, fill: ['#fff4d2', '#ffad52'] });
  });
});

// 4. KAPAL: Years later, a magnificent merchant ship sails into the bay; wealthy Malin & his wife stand proudly on deck.
shot('kapal', 'sambut', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setAtmosphere(t, { warm: 0.2, storm: 0 });
  K.use(P, shipGrand, malinKaya.root, istri.root);

  const sx = lerp(6.5, 0.2, ease.outCubic(p)), sz = lerp(22, 12.2, ease.outCubic(p));
  const roll = Math.sin(t * 1.8) * 0.035;
  shipGrand.position.set(sx, -0.05 + Math.sin(t * 2.1) * 0.06, sz);
  shipGrand.rotation.set(roll * 0.5, -0.45, roll);

  // Place Malin Kaya and his wife near the ship's prow/rail
  K.pose(malinKaya, {
    x: sx - 0.6, y: 0.85, z: sz - 0.55,
    ry: -0.45,
    ...K.idle(t, 11),
    armL: [0.35, 0.45, 1.4], armR: [1.1, 0.25, 0.4],
    head: [-0.15, -0.08, 0], mouth: 'grin',
    t,
  });
  K.pose(istri, {
    x: sx + 0.35, y: 0.82, z: sz - 0.15,
    ry: -0.55,
    ...K.idle(t, 14),
    armL: [0.55, 0.2, 1.3], armR: [0.25, 0.2, 0.6],
    head: [0.15, -0.1, 0], mouth: 'smile',
    t,
  });

  cam(L3([-4.8, 2.5, 5.2], [-2.2, 2.1, 7.6], ease.inOutSine(p)), [sx - 0.2, 1.8, sz - 0.2], 38, t, 0.04);
  S.render(P);

  ui2(() => {
    K.title(ui, 'KAPAL SAUDAGAR', 540, 260, { size: 90, alpha: env(t, a + 0.1, b, 0.2, 0.2), pop: (t - a) / 0.35 });
    const tSau = W_('kapal', 'saudagar');
    if (t >= tSau - 0.15) {
      K.nameplate(ui, 'MALIN & ISTRI BANGSAWAN', 540, 390, { size: 42, alpha: env(t, tSau - 0.15, b, 0.2, 0.2), pop: (t - tSau + 0.15) / 0.3, color: '#ffd24a' });
    }
  });
});

// 5. SAMBUT: Mande Rubayah runs joyfully along the beach calling Malin's name with open arms.
shot('sambut', 'peluk', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setAtmosphere(t, { warm: 0.25, storm: 0 });
  K.use(P, shipGrand, mande.root, malinKaya.root, istri.root);
  shipGrand.position.set(1.5, -0.05, 11.8); shipGrand.rotation.set(0, -0.5, 0);

  const mx = lerp(-6.2, -1.8, p), mz = lerp(-1.5, 1.2, p);
  K.pose(mande, {
    x: mx, y: hBeach(mx, mz), z: mz,
    ry: 1.15,
    ...K.walk(t * 2.2, 0.9, { run: true }),
    armL: [1.65, 0.45, 0.35], armR: [1.75, 0.45, 0.35],
    head: [0.05, -0.08, 0], mouth: 'open', open: 0.75, wide: 0.4, blush: 0.5,
    t,
  });
  K.pose(malinKaya, { x: 1.2, y: hBeach(1.2, 1.6), z: 1.6, ry: -1.4, ...K.idle(t, 11), t });
  K.pose(istri, { x: 2.1, y: hBeach(2.1, 1.9), z: 1.9, ry: -1.5, ...K.idle(t, 14), t });

  cam(L3([0.5, 1.85, 5.2], [0.2, 1.65, 4.4], p), [lerp(-3.5, -0.5, p), 1.15, 1.4], 38, t, 0.045);
  S.render(P);

  ui2(() => {
    const tCall = W_('sambut', 'memanggil');
    if (t >= tCall - 0.25) {
      K.title(ui, '"MALIN ANAKKU!"', 540, 290, { size: 94, pop: (t - tCall + 0.25) / 0.3, alpha: env(t, tCall - 0.25, b, 0.15, 0.2), fill: ['#ffffff', '#ffd24a'] });
    }
  });
});

// 6. PELUK: As Mande reaches out to hug him, Malin steps back in disgust and shame.
shot('peluk', 'tolak', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setAtmosphere(t, { warm: 0.3, storm: 0.08 });
  K.use(P, shipGrand, mande.root, malinKaya.root, istri.root);
  shipGrand.position.set(2.5, -0.05, 12.2); shipGrand.rotation.set(0, -0.5, 0);

  const tBack = W_('peluk', 'mundur') - 0.1;
  const recoil = prog(t, tBack, tBack + 0.45, ease.outCubic);

  K.pose(mande, {
    x: -0.9, y: hBeach(-0.9, 1.2), z: 1.2,
    ry: 1.35,
    ...K.idle(t, 6),
    lean: 0.18,
    armL: [1.65 - recoil * 0.4, 0.25, 0.45],
    armR: [1.65 - recoil * 0.4, 0.25, 0.45],
    head: [0.1, -0.05, 0],
    brow: recoil > 0.3 ? 0.85 : 0.2,
    mouth: recoil > 0.3 ? 'frown' : 'smile',
    wide: recoil * 0.5,
    t,
  });

  const kx = lerp(0.55, 1.25, recoil);
  K.pose(malinKaya, {
    x: kx, y: hBeach(kx, 1.3), z: 1.3,
    ry: -1.45,
    ...K.idle(t, 11, 0.5),
    lean: -0.18 * recoil,
    armL: [lerp(0.3, 1.5, recoil), 0.35, 1.2],
    armR: [lerp(0.3, 1.3, recoil), 0.3, 1.0],
    head: [recoil * -0.35, 0.08, 0],
    brow: -0.95 * recoil,
    mouth: recoil > 0.2 ? 'frown' : 'flat',
    t,
  });

  K.pose(istri, {
    x: 2.05, y: hBeach(2.05, 1.55), z: 1.55,
    ry: -1.6,
    ...K.idle(t, 14, 0.4),
    armL: [0.7, 0.15, 1.7], armR: [1.85, 0.15, 2.0],
    head: [-0.25, -0.12, 0.08],
    brow: -0.6, mouth: 'frown',
    t,
  });

  cam(L3([0.3, 1.85, 5.1], [0.55, 1.65, 4.3], ease.inOutSine(p)), [0.4, 1.25, 1.3], 36, t, 0.035);
  S.render(P);

  ui2(() => {
    const tMalu = W_('peluk', 'malu');
    if (t >= tBack) {
      K.nameplate(ui, 'MALU & ENGGAN MENGAKUI', 540, 300, { size: 44, alpha: env(t, tBack, b, 0.15, 0.2), pop: (t - tBack) / 0.3, color: '#ff8a6a' });
    }
    if (t >= tMalu - 0.15) {
      K.title(ui, '"SIAPA WANITA TUA INI?!"', 540, 420, { size: 68, pop: (t - tMalu + 0.15) / 0.28, alpha: env(t, tMalu - 0.15, b, 0.15, 0.2), fill: ['#fff0c0', '#ff6448'] });
    }
  });
});

// 7. TOLAK: Malin shouts and pushes his mother down onto the beach sand!
shot('tolak', 'langit', (t, a, b) => {
  setAtmosphere(t, { warm: 0.4, storm: 0.2 });
  K.use(P, shipGrand, mande.root, malinKaya.root, istri.root, dustSand);
  shipGrand.position.set(2.5, -0.05, 12.2); shipGrand.rotation.set(0, -0.5, 0);

  const tPush = W_('tolak', 'mendorong'), tFall = W_('tolak', 'terjatuh');
  const pushU = prog(t, tPush - 0.15, tPush + 0.2, ease.outCubic);
  const fallU = prog(t, tPush + 0.05, tFall + 0.25, ease.outCubic);

  // Malin lunging & shoving forward
  K.pose(malinKaya, {
    x: lerp(0.9, 0.35, pushU), y: hBeach(0.5, 1.3), z: 1.3,
    ry: -1.5,
    lean: lerp(-0.1, 0.32, pushU),
    armL: [lerp(0.6, 1.65, pushU), 0.2, lerp(1.1, 0.15, pushU)],
    armR: [lerp(0.8, 1.75, pushU), 0.2, lerp(1.1, 0.15, pushU)],
    legL: [pushU * 0.45, pushU * 0.3],
    head: [0, -0.1, 0],
    brow: -1, mouth: 'open', open: 0.85,
    t,
  });

  // Mande falling onto the sand
  const mx = lerp(-0.7, -1.75, fallU), mz = 1.2;
  K.pose(mande, {
    x: mx, y: hBeach(mx, mz) - fallU * 0.22, z: mz,
    ry: 1.35,
    bob: -fallU * 0.32,
    lean: lerp(0.1, 0.55, fallU),
    legL: [fallU * 1.45, fallU * 1.75],
    legR: [fallU * 1.2, fallU * 1.85],
    armL: [lerp(1.2, 1.4, fallU), 0.35, 0.5],
    armR: [lerp(1.2, 1.1, fallU), 0.25, 0.8],
    head: [0, fallU * 0.35, 0],
    brow: 0.9, mouth: 'open', open: 0.7, wide: 0.8,
    t,
  });

  K.pose(istri, {
    x: 1.85, y: hBeach(1.85, 1.55), z: 1.55, ry: -1.6,
    ...K.idle(t, 14, 0.3), armL: [0.6, 0.2, 1.6], armR: [0.6, 0.2, 1.6], brow: -0.5, mouth: 'frown', t,
  });

  dustSand.position.set(-1.6, hBeach(-1.6, 1.2) + 0.15, 1.2);
  dustSand.userData.tick(t - (tFall - 0.05));

  const shk = t > tPush ? Math.exp(-(t - tPush) * 6) * 0.22 : 0;
  cam([-0.2 + noise.n2(t * 25, 1) * shk, 1.65 + noise.n2(t * 25, 2) * shk, 4.5], [-0.4, 0.95, 1.25], 38, t, 0.04);
  S.render(P);

  ui2(() => {
    if (t >= tPush) {
      AM.lib.speedLines(ui, 540, 960, { count: 55, inner: 480, outer: 1500, color: 'rgba(255,235,210,0.45)', width: 8, t, seed: 9 });
      K.title(ui, 'BRUKK!', 540, 320, { size: 126, pop: (t - tPush) / 0.25, rot: -0.08, alpha: env(t, tPush, b, 0.05, 0.2), fill: ['#ffffff', '#ff7b3a'] });
    }
  });
});

// 8. LANGIT: Heartbroken on the sand, Mande Rubayah raises her hands to the darkening sky in prayer.
shot('langit', 'badai', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const darkU = prog(t, W_('langit', 'langit') - 0.3, b, ease.inOutSine);
  setAtmosphere(t, { warm: 0.5, storm: lerp(0.25, 0.78, darkU) });
  K.use(P, mande.root);

  const raise = prog(t, W_('langit', 'menengadah') - 0.2, b, ease.inOutCubic);
  const mx = -1.75, mz = 1.2;
  K.pose(mande, {
    x: mx, y: hBeach(mx, mz) - 0.2, z: mz,
    ry: 0.35,
    bob: -0.3,
    lean: lerp(0.45, -0.18, raise),
    legL: [1.45, 1.75], legR: [1.3, 1.8],
    armL: [lerp(1.1, 2.45, raise), lerp(0.2, 0.45, raise), lerp(0.8, 0.25, raise)],
    armR: [lerp(1.1, 2.45, raise), lerp(0.2, 0.45, raise), lerp(0.8, 0.25, raise)],
    head: [0, lerp(0.3, -0.55, raise), 0],
    brow: 0.95,
    ...K.talk(t, env(t, a + 0.2, b, 0.1, 0.1), 6),
    t,
  });

  cam(L3([-0.9, 1.25, 3.3], [-1.2, 0.95, 2.9], ease.inOutSine(p)), [mx, 1.05 + raise * 0.35, mz], 36, t, 0.03);
  S.render(P);

  ui2(() => {
    const tHancur = W_('langit', 'hancur');
    const hAlpha = env(t, tHancur - 0.1, W_('langit', 'menengadah') + 0.4, 0.15, 0.25);
    if (hAlpha > 0) {
      const split = prog(t, tHancur, tHancur + 0.5, ease.outCubic);
      drawBrokenHeart2D(540, 340, 68, split, hAlpha);
    }
    if (raise > 0.2) {
      K.title(ui, 'DOA IBU TERLUKA', 540, 290, { size: 86, alpha: env(t, W_('langit', 'menengadah'), b, 0.2, 0.2), pop: raise, fill: ['#dfefff', '#7fc8ff'], stroke: '#0d1b38' });
    }
  });
});

// 9. BADAI: Pitch-black storm, lightning strikes, and a giant wave smashes Malin's grand ship!
shot('badai', 'batu', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setAtmosphere(t, { warm: 0.5, storm: 1.0 });
  K.use(P, shipGrand, waveWall, lightningBolt, glowLightning, splashSea, stormSparks);

  const tPetir = W_('badai', 'petir') - 0.05;
  const tWave = W_('badai', 'gelombang') - 0.15;
  const tCrack = W_('badai', 'terbelah') - 0.1;

  const strike = env(t, tPetir, tPetir + 0.45, 0.03, 0.25);
  const strike2 = env(t, tCrack - 0.05, tCrack + 0.35, 0.03, 0.2);
  const flash = Math.max(strike, strike2);

  lightningBolt.visible = flash > 0.15;
  lightningBolt.position.set(1.5, 0.5, 13.5);
  glowLightning.visible = flash > 0.05;
  glowLightning.position.set(1.5, 5.5, 13.5);
  glowLightning.material.opacity = flash * 0.9;

  // Giant wave sweeping into the ship
  const waveU = prog(t, tWave - 0.2, tCrack + 0.2, ease.inQuad);
  waveWall.visible = waveU > 0;
  waveWall.position.set(1.5, lerp(-2.5, 2.2, Math.sin(waveU * Math.PI)), lerp(22, 11.5, waveU));
  waveWall.rotation.x = waveU * 0.6;

  // Ship tossing VIOLENTLY and capsizing on 'terbelah'
  const wreckU = prog(t, tCrack, b, ease.inOutCubic);
  shipGrand.position.set(1.5 + Math.sin(t * 9) * 0.25, lerp(0.1, -1.2, wreckU) + Math.sin(t * 6) * 0.3, 13.5);
  shipGrand.rotation.set(
    Math.sin(t * 5) * 0.22 + wreckU * 0.85,
    -0.45 + wreckU * 0.4,
    Math.sin(t * 6.5) * 0.28 + wreckU * 1.35
  );

  splashSea.position.set(1.5, 1.2, 12.5);
  splashSea.userData.tick(t - tCrack + 0.1);
  stormSparks.position.set(1.5, 3.0, 13.5);
  stormSparks.userData.tick(t - tPetir);

  const shk = flash * 0.45 + (t > tCrack ? Math.exp(-(t - tCrack) * 4) * 0.5 : 0);
  cam(
    [lerp(-5.5, -3.5, p) + noise.n2(t * 28, 1) * shk, lerp(3.2, 2.4, p) + noise.n2(t * 28, 2) * shk, lerp(4.5, 6.2, p)],
    [1.5, 1.8, 13.5], 42, t, 0.08, Math.sin(t * 3) * 0.04
  );
  S.render(P);

  ui2(() => {
    if (flash > 0.05) {
      ui.fillStyle = `rgba(210,240,255,${flash * 0.65})`;
      ui.fillRect(0, 0, 1080, 1920);
    }
    if (t >= tPetir && t < tCrack) {
      K.title(ui, 'JDERRR!', 540, 300, { size: 124, pop: (t - tPetir) / 0.22, rot: -0.08, fill: ['#ffffff', '#7fe8ff'], stroke: '#091a36' });
    }
    if (t >= tCrack) {
      AM.lib.speedLines(ui, 540, 960, { count: 65, inner: 460, outer: 1500, color: 'rgba(200,240,255,0.5)', width: 9, t, seed: 15 });
      K.title(ui, 'KAPAL HANCUR!', 540, 320, { size: 102, pop: (t - tCrack) / 0.28, fill: ['#fff2c4', '#ff5e3a'], stroke: '#2e0804' });
    }
  });
});

// 10. BATU: Malin Kundang kneels on the rocky shore begging forgiveness and petrifies into stone forever.
shot('batu', null, (t, a, b) => {
  const p = clamp((t - a) / (AM.duration - a));
  const tFreeze = W_('batu', 'membeku') - 0.15;
  const stoneU = prog(t, tFreeze, tFreeze + 0.9, ease.inOutCubic);
  const calmU = prog(t, tFreeze + 0.3, AM.duration, ease.inOutSine);

  setAtmosphere(t, { warm: 0.45, storm: lerp(0.85, 0.0, calmU) });
  ropeDebris.forEach((r) => (r.visible = stoneU > 0.3));

  const x = 7.5, z = 1.5;
  if (stoneU < 0.55) {
    K.use(P, malinKaya.root, magicSmoke);
    poseKneelStone(malinKaya, x, z, -0.55, lerp(1.0, 1.18, stoneU));
  } else {
    K.use(P, batuMalin.root, magicSmoke);
    poseKneelStone(batuMalin, x, z, -0.55, 1.18);
  }
  magicSmoke.position.set(x, hBeach(x, z) + 0.5, z);
  magicSmoke.userData.tick(t - tFreeze);

  cam(L3([9.6, 1.55, 4.6], [10.8, 2.1, 5.8], ease.inOutSine(p)), [x, 0.7, z], 38, t, 0.03);
  S.render(P);

  ui2(() => {
    const f = env(t, tFreeze, tFreeze + 0.5, 0.1, 0.3);
    if (f > 0) {
      ui.fillStyle = `rgba(235,230,220,${f * 0.55})`;
      ui.fillRect(0, 0, 1080, 1920);
    }
    const tBatu = W_('batu', 'batu');
    if (t >= tBatu - 0.2) {
      K.title(ui, 'KUTUKAN BATU', 540, 250, { size: 84, alpha: env(t, tBatu - 0.2, AM.duration + 1, 0.2, 0.15), pop: (t - tBatu + 0.2) / 0.3 });
      K.title(ui, 'MALIN KUNDANG', 540, 355, { size: 96, alpha: env(t, tBatu, AM.duration + 1, 0.2, 0.15), pop: (t - tBatu) / 0.35, fill: ['#ffffff', '#ffc94a'] });
    }
    const tBakti = W_('batu', 'bakti');
    if (t >= tBakti - 0.25) {
      K.nameplate(ui, 'HORMATI & SAYANGI IBUMU', 540, 475, { size: 42, alpha: env(t, tBakti - 0.25, AM.duration + 1, 0.2, 0.15), pop: (t - tBakti + 0.25) / 0.3, color: '#ffe082' });
    }
    const fade = clamp((t - (AM.duration - 0.45)) / 0.45);
    if (fade > 0) { ui.fillStyle = `rgba(10,6,2,${fade})`; ui.fillRect(0, 0, 1080, 1920); }
  });
});

// ------------------------------------------------------------------ render
export function render(t, AM) {
  hide(
    malinMuda.root, malinKaya.root, mande.root, istri.root, batuMalin.root,
    shipGrand, boatSmall, lightningBolt, waveWall, glowLightning, heartBroken,
    dustSand, splashSea, stormSparks, magicSmoke
  );
  ropeDebris.forEach((r) => (r.visible = false));
  boatSmall.scale.setScalar(1);
  malinKaya.S.scale = 1;
  for (const pt of [dustSand, splashSea, stormSparks, magicSmoke]) pt.userData.tick(-1);

  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id, s.next);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  s.fn(t, Math.max(0, a), b);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  K.finish(ui, AM, t, { flash: s.id !== 'hook' && since < 0.16 ? 0.26 * (1 - since / 0.16) : 0 });
}

