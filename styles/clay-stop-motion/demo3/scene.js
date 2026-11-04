// Clay Stop Motion demo 3: "Bawang Putih & Labu Emas", 10 shots on a tabletop plasticine diorama, animated on twos.
import * as K from '/styles/clay-stop-motion/kit.js';
const THREE = K.THREE;
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'kids', y: 1440, size: 70 } };

let S, ui, C = {}, D, L;
const Wt = (id, w) => AM.wordTime(id, w);
let putih, merah, nenek, rooster, jins = [], cent;
let houseHome, houseHut, river, cloth, gourdSmall, gourdBig, goldCoins = [], goldBurst, smokeBurst, glowGold, back;
const AREA = { home: 0, river: 24, hut: 48 };

function makeGourd(scale = 1, col = '#e88a28') {
  const G = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU;
    const rib = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), K.toon(i % 2 ? col : '#d6781e'));
    rib.scale.set(0.75, 0.92, 0.75);
    rib.position.set(Math.cos(a) * 0.14, 0.3, Math.sin(a) * 0.14);
    G.add(rib);
  }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 0.2, 8), K.toon('#4f7a28'));
  stem.position.set(0, 0.62, 0); stem.rotation.z = 0.25; G.add(stem);
  K.lumpify(G, 0.015, 8, 12);
  G.scale.setScalar(scale);
  return G;
}

function buildSet() {
  D = new THREE.Scene(); D.background = new THREE.Color('#2a2420');
  L = K.studio(D);
  const ground = K.terrain({
    w: 96, d: 24, seg: 96,
    height: (x, z) => {
      const rDip = Math.exp(-((x - AREA.river) ** 2) / 10) * -0.32;
      return noise.fbm2(x * 0.25, z * 0.25, 2) * 0.12 + Math.max(0, -z - 4.2) * 0.32 + rDip;
    },
    color: (x, z, y) => (Math.abs(x - AREA.river) < 3.6 ? '#b88a58' : Math.abs(z - 1.4 + Math.sin(x * 0.28) * 0.3) < 0.75 ? '#d9a86a' : noise.n2(x * 0.4, z * 0.4) > 0.25 ? '#7ab84a' : '#8cc85a'),
  });
  ground.position.x = 24; D.add(ground);

  const table = new THREE.Mesh(new THREE.BoxGeometry(98, 1.2, 26), K.toon('#8a5a36', { rough: 0.6 }));
  table.position.set(24, -0.75, 0); D.add(table);

  back = K.backdrop(104, 28); back.position.set(24, 0, -9.5); D.add(back);

  houseHome = K.house({ w: 3.4, d: 2.5, h: 1.8 });
  houseHome.position.set(AREA.home - 2.3, 0, -2.6); houseHome.rotation.y = 0.2;
  K.lumpify(houseHome, 0.015, 6, 1); D.add(houseHome);

  houseHut = K.house({ w: 2.8, d: 2.2, h: 1.55 });
  houseHut.position.set(AREA.hut + 2.2, 0, -2.5); houseHut.rotation.y = -0.22;
  K.lumpify(houseHut, 0.018, 6, 2); D.add(houseHut);

  for (let i = 0; i < 15; i++) {
    const tr = K.tree(i % 3 === 0 ? 'palm' : i % 3 === 1 ? 'round' : 'bamboo', { seed: i + 5, s: 0.72 + hrand(i, 2) * 0.38, ol: false });
    tr.position.set(-8 + i * 4.8 + hrand(i, 3) * 1.5, 0, -5.5 - hrand(i, 4) * 2.4);
    K.lumpify(tr, 0.035, 3, i + 10); D.add(tr);
  }

  // river slab at AREA.river
  const rg = new THREE.PlaneGeometry(7.2, 16, 28, 28); rg.rotateX(-Math.PI / 2);
  rg.userData.base = rg.attributes.position.array.slice();
  river = new THREE.Mesh(rg, K.toon('#3fa2d8', { rough: 0.32 }));
  river.position.set(AREA.river, 0.02, 0); D.add(river);

  for (let i = 0; i < 8; i++) {
    const rk = K.rock(0.26 + hrand(i, 5) * 0.22, i + 20);
    rk.position.set(AREA.river + (i % 2 ? 3.5 : -3.5) + (hrand(i, 6) - 0.5) * 0.6, 0.08, -3 + i * 0.9);
    K.lumpify(rk, 0.02, 7, i + 30); D.add(rk);
  }

  cloth = K.cloth(1.3, 0.55, { color: '#e0352b', glow: '#ff8a5a' }); D.add(cloth);
  gourdSmall = makeGourd(0.75, '#f09a28'); D.add(gourdSmall);
  gourdBig = makeGourd(1.42, '#d96a18'); D.add(gourdBig);
  glowGold = K.glow('#ffd84a', 3.4, 0.85); D.add(glowGold);

  for (let i = 0; i < 20; i++) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 14), K.toon(i % 3 === 0 ? '#ff4a7a' : '#ffd230', { emissive: '#ffae00', ei: 0.35, rough: 0.35 }));
    const a = hrand(i, 1) * TAU, r = 0.25 + hrand(i, 2) * 1.1;
    coin.userData = { dx: Math.cos(a) * r, dz: Math.sin(a) * r * 0.7, t0: hrand(i, 3) * 0.25 };
    D.add(coin); goldCoins.push(coin);
  }

  // characters
  putih = K.character({
    kind: 'kid', skin: '#f4c6a0', top: '#fff4dc', bottom: '#e8b85a', skirt: 'long', hair: 'bun',
    lashes: true, eye: '#4a2a14', scarf: '#6ec4e8', skirtMap: K.batikTex('#8a5228', '#2e1609', '#f2c878', 'kawung'),
  });
  merah = K.character({
    kind: 'kid', skin: '#eab48c', top: '#d9382e', bottom: '#a8241c', skirt: 'long', hair: 'bun',
    lashes: true, eye: '#3a1a0e', scarf: '#f2b028', skirtMap: K.batikTex('#6a2218', '#2a0804', '#ffcf58', 'parang'),
  });
  nenek = K.character({
    kind: 'woman', skin: '#d89e76', top: '#7a5a8a', trim: '#d8a848', skirt: 'long', hair: 'bun',
    hairC: '#d6d0c8', hairHi: '#ffffff', eye: '#3a2210', skirtMap: K.batikTex('#5a3a22', '#2a1508', '#d9a050', 'kawung'),
  });
  rooster = K.rooster();
  for (const c of [putih.root, merah.root, nenek.root, rooster.root]) K.lumpify(c, 0.006, 14, 60);
  D.add(putih.root, merah.root, nenek.root, rooster.root);

  cent = K.centong(); cent.rotation.x = Math.PI; cent.position.y = -0.02; K.lumpify(cent, 0.008, 12, 65);
  putih.j.handR.add(cent);

  for (let i = 0; i < 4; i++) {
    const j = K.jin({ color: i % 2 ? '#a864ff' : '#64e890', s: 0.68 + hrand(i, 1) * 0.15 });
    K.lumpify(j, 0.008, 10, 70 + i);
    D.add(j); jins.push(j);
  }

  goldBurst = K.burst({ n: 50, color: '#ffe04a', size: 0.22, speed: 3.5, up: 3.8, grav: -5, life: 1.0, seed: 7, additive: true }); D.add(goldBurst);
  smokeBurst = K.burst({ n: 45, color: '#9a88a8', size: 0.36, speed: 3.0, up: 3.2, grav: -1, life: 1.1, seed: 8 }); D.add(smokeBurst);
}

export async function setup(AM) {
  S = K.stage(AM, { pr: 0.66 }); ui = S.ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  buildSet();
  AM.sfx('magic', Wt('hook', 'kilau') - 0.1, { gain: 0.45 });
  AM.sfx('bubble', Wt('cucian', 'hanyut'), { gain: 0.45 });
  AM.sfx('chime', Wt('nenek', 'ramah'), { gain: 0.4 });
  AM.sfx('pop', Wt('bantu', 'centong'), { gain: 0.38 });
  AM.sfx('pop', Wt('hadiah', 'kecil') - 0.05, { gain: 0.45 });
  AM.sfx('magic', Wt('emas', 'emas') - 0.1, { gain: 0.55 });
  AM.sfx('thud', Wt('serakah', 'serakah'), { gain: 0.45, pitch: 0.85 });
  AM.sfx('whoosh', Wt('rebut', 'merebut'), { gain: 0.45 });
  AM.sfx('boom', Wt('kejutan', 'dibelah') + 0.05, { gain: 0.55 });
  AM.sfx('chime', Wt('akhir', 'berkah') - 0.1, { gain: 0.45 });
}

const span = (id) => {
  const Ls = SHOTS.filter((x) => C[x.id]);
  const i = Ls.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, Ls[i + 1] ? C[Ls[i + 1].id].start - 0.12 : AM.duration + 1];
};
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
function cam(pos, look, fov, t) {
  const j = (s) => K.jit(t, s, 0.012);
  K.shootCam(S.cam, [pos[0] + j(1), pos[1] + j(2), pos[2] + j(3)], look, fov);
}
function P(c, p, t, seed) {
  K.pose(c, { ...p, x: (p.x || 0) + K.jit(t, seed, 0.008), z: (p.z || 0) + K.jit(t, seed + 1, 0.008), ry: (p.ry || 0) + K.jit(t, seed + 2, 0.015) });
}
function sky(warm) {
  const u = back.children[0].material;
  u.color.set(K.mix('#ffffff', '#ffa86a', warm));
  L.key.color.set(K.mix('#fff1dc', '#ffb070', warm));
}
function tickRiver(t) {
  const g = river.geometry, pa = g.attributes.position, base = g.userData.base, tq = Math.floor(t * 12) / 12;
  for (let i = 0; i < pa.count; i++) {
    const x = base[i * 3], z = base[i * 3 + 2];
    pa.setY(i, Math.sin(x * 1.5 + tq * 3.2) * 0.06 + Math.sin(z * 1.4 - tq * 2.8) * 0.06);
  }
  pa.needsUpdate = true; g.computeVertexNormals();
}
function reset() {
  for (const c of [putih, merah, nenek, rooster]) c.root.visible = false;
  jins.forEach((j) => (j.visible = false));
  goldCoins.forEach((c) => (c.visible = false));
  cent.visible = false; cloth.visible = false;
  gourdSmall.visible = false; gourdSmall.scale.setScalar(0.75);
  gourdBig.visible = false; gourdBig.scale.setScalar(1.42);
  glowGold.visible = false;
  goldBurst.userData.tick(-1); smokeBurst.userData.tick(-1);
}
const scr = (x, y, z) => K.toScreen(S.cam, x, y, z);
function label(txt, x, y, t0, b, t, col = '#ffcf4a', size = 46) {
  K.nameplate(ui, txt, x, y, { size, alpha: env(t, t0, b, 0.12, 0.2), pop: (t - t0) / 0.3, color: col });
}
function drawHeart(x, y, s, a) {
  if (a <= 0) return;
  ui.save(); ui.globalAlpha = a; ui.translate(x, y);
  ui.fillStyle = '#ff5a7a'; ui.strokeStyle = '#6a1020'; ui.lineWidth = s * 0.12;
  ui.beginPath(); ui.moveTo(0, s * 0.35);
  ui.bezierCurveTo(-s, -s * 0.3, -s * 0.4, -s, 0, -s * 0.45);
  ui.bezierCurveTo(s * 0.4, -s, s, -s * 0.3, 0, s * 0.35);
  ui.closePath(); ui.fill(); ui.stroke(); ui.restore();
}

// 1. Hook: A small clay gourd on the diorama table bursts open with golden coins and sparkles!
shot('hook', (t, a, b) => {
  sky(0.2);
  const X = AREA.home;
  const tOpen = Wt('hook', 'kilau') - 0.15;
  const openU = clamp((t - tOpen) / 0.4);
  gourdSmall.visible = true;
  gourdSmall.position.set(X, 0.05, 0.8);
  gourdSmall.rotation.y = K.jit(t, 2, 0.04);
  if (t >= tOpen) {
    glowGold.visible = true;
    glowGold.position.set(X, 0.75, 0.8);
    glowGold.scale.setScalar(2.2 + Math.sin(t * 8) * 0.3);
    goldBurst.position.set(X, 0.55, 0.8);
    goldBurst.userData.tick(t - tOpen);
    goldCoins.forEach((c, i) => {
      const u = clamp((t - tOpen - c.userData.t0) / 0.35);
      c.visible = u > 0;
      c.position.set(X + c.userData.dx * u, 0.06 + Math.sin(u * Math.PI) * 0.8, 0.8 + c.userData.dz * u);
      c.rotation.set(u * 4 + i, u * 3, 0);
    });
  }
  putih.root.visible = true;
  P(putih, {
    x: X - 1.15, z: 0.6, ry: Math.PI / 2 - 0.25, ...K.idle(t, 4), t,
    armL: [1.4 * openU, 0.3, 1.2 * openU], armR: [1.4 * openU, 0.3, 1.2 * openU],
    mouth: openU > 0.1 ? 'open' : 'grin', open: 0.6, wide: 0.6 * openU,
  }, t, 10);
  const p = (t - a) / (b - a);
  cam([X + lerp(0.8, 0.2, p), lerp(1.8, 1.5, p), lerp(6.8, 5.8, p)], [X - 0.2, 0.75, 0.6], 42, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('BAWANG PUTIH & LABU EMAS', 540, 250, a + 0.1, b, t, '#ffd23a', 46);
  if (t >= tOpen) {
    K.title(ui, 'KILAU EMAS!', 540, 400, {
      size: 96, pop: (t - tOpen) / 0.28, alpha: env(t, tOpen, b, 0.1, 0.2),
      fill: ['#fff8c0', '#ffae19'], stroke: '#4a2200',
    });
  }
});

// 2. At the clay river, Bawang Putih washes clothes when the red scarf drifts away downstream.
shot('cucian', (t, a, b) => {
  sky(0.15);
  tickRiver(t);
  const X = AREA.river;
  putih.root.visible = true; cloth.visible = true;
  const tDrift = Wt('cucian', 'hanyut') - 0.2;
  const driftU = clamp((t - tDrift) / (b - tDrift));
  P(putih, {
    x: X - 2.6, z: lerp(-0.5, 1.6, driftU), ry: Math.PI / 2 - 0.35,
    ...(driftU > 0.05 ? K.walk(t * 2.0, 1) : K.idle(t, 5)), t,
    armR: [1.6, 0.2, 0.3], armL: [1.2 * driftU, 0.3, 1.2],
    mouth: driftU > 0.1 ? 'open' : 'smile', open: 0.5, brow: 0.7 * driftU, wide: 0.5 * driftU,
  }, t, 10);
  cloth.position.set(X + Math.sin(t * 2.5) * 0.35, 0.12, lerp(-1.2, 3.2, driftU));
  cloth.rotation.set(-Math.PI / 2, 0, Math.sin(t * 2) * 0.2);
  cloth.userData.tick(t, 0.6);
  const p = (t - a) / (b - a);
  cam([X + lerp(-1.2, -0.4, p), 2.3, lerp(8.5, 7.8, p)], [X - 0.6, 0.6, lerp(-0.5, 1.2, driftU)], 42, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  const [cx, cy] = scr(cloth.position.x, cloth.position.y + 0.1, cloth.position.z);
  if (t >= tDrift) {
    K.pointer(ui, 'SELENDANG HANYUT!', 540, 270, cx, cy, { size: 42, alpha: env(t, tDrift, b, 0.15, 0.2) });
  }
});

// 3. By the riverside hut at dusk, kind Grandma returns the red scarf to Bawang Putih.
shot('nenek', (t, a, b) => {
  sky(0.35);
  const X = AREA.hut;
  putih.root.visible = true; nenek.root.visible = true; cloth.visible = true;
  P(nenek, {
    x: X + 0.85, z: 0.4, ry: -Math.PI / 2 + 0.3, ...K.idle(t, 6), t,
    armL: [1.2, 0.2, 0.5], mouth: 'grin', blush: 0.4,
  }, t, 20);
  P(putih, {
    x: X - 0.85, z: 0.45, ry: Math.PI / 2 - 0.3, ...K.idle(t, 4), t,
    armL: [0.9, 0.2, 1.1], armR: [0.9, 0.2, 1.1], mouth: 'grin', blush: 0.4,
  }, t, 10);
  cloth.position.set(X + 0.15, 0.95, 0.65);
  cloth.scale.setScalar(0.65);
  cloth.rotation.set(0.2, 0.3, 0);
  cloth.userData.tick(t, 0.4);
  const p = (t - a) / (b - a);
  cam([X + lerp(-0.3, 0.2, p), 1.65, lerp(7.4, 6.5, p)], [X, 1.0, 0.3], 40, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('NENEK PENJAGA SUNGAI', 540, 260, a + 0.1, b, t, '#ffcf4a', 48);
});

// 4. Bawang Putih sincerely helps Grandma cook with the wooden rice paddle and tidy the yard.
shot('bantu', (t, a, b) => {
  sky(0.25);
  const X = AREA.hut;
  putih.root.visible = true; nenek.root.visible = true; rooster.root.visible = true; cent.visible = true;
  const wave = Math.sin(t * 6) * 0.35;
  P(putih, {
    x: X - 0.5, z: 0.55, ry: 0.35, ...K.idle(t, 4), t,
    armR: [1.35 + wave, 0.25, 0.6], armL: [0.7, 0.2, 1.2],
    mouth: 'grin', blush: 0.5,
  }, t, 10);
  P(nenek, {
    x: X + 0.95, z: 0.35, ry: -0.5, ...K.idle(t, 6), t,
    armL: [0.6, 0.2, 1.4], armR: [0.6, 0.2, 1.4], mouth: 'grin',
  }, t, 20);
  rooster.root.position.set(X - 1.75, 0, 0.9);
  rooster.root.rotation.y = 0.8;
  K.roosterPose(rooster, { crow: Math.max(0, Math.sin(t * 4)) * 0.3, t, flap: 0.1 });
  const p = (t - a) / (b - a);
  cam([X + lerp(0.3, -0.2, p), 1.6, lerp(6.8, 6.0, p)], [X, 0.95, 0.4], 40, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('RAJIN & TULUS MEMBANTU', 540, 260, a + 0.1, b, t, '#9fe86a', 46);
});

// 5. Grandma offers two gourds (small & giant); Bawang Putih humbly chooses the small one.
shot('hadiah', (t, a, b) => {
  sky(0.38);
  const X = AREA.hut;
  putih.root.visible = true; nenek.root.visible = true;
  gourdSmall.visible = true; gourdBig.visible = true;
  gourdSmall.position.set(X - 0.25, 0.04, 0.95);
  gourdBig.position.set(X + 0.55, 0.04, 0.95);
  const tPick = Wt('hadiah', 'kecil') - 0.25;
  const pick = prog(t, tPick, tPick + 0.4, ease.outCubic);
  P(putih, {
    x: X - 1.15, z: 0.5, ry: Math.PI / 2 - 0.35, ...K.idle(t, 4), t,
    armR: [lerp(0.4, 1.55, pick), 0.2, 0.3], mouth: 'grin', blush: 0.4,
  }, t, 10);
  P(nenek, {
    x: X + 1.35, z: 0.45, ry: -Math.PI / 2 + 0.35, ...K.idle(t, 6), t,
    armL: [1.1, 0.25, 0.4], mouth: 'grin',
  }, t, 20);
  const p = (t - a) / (b - a);
  cam([X + 0.1, lerp(1.75, 1.5, p), lerp(7.4, 6.4, p)], [X + 0.1, 0.85, 0.6], 41, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  const [sx, sy] = scr(X - 0.25, 0.55, 0.95);
  const [bx, by] = scr(X + 0.55, 0.95, 0.95);
  K.nameplate(ui, 'LABU KECIL', sx - 70, sy - 90, { size: 36, alpha: env(t, a + 0.1, b, 0.15, 0.2), color: '#9fe86a' });
  K.nameplate(ui, 'LABU BESAR', bx + 70, by - 110, { size: 36, alpha: env(t, a + 0.1, b, 0.15, 0.2), color: '#ffb84a' });
  if (t >= tPick) {
    K.title(ui, 'PILIH YANG KECIL', 540, 260, {
      size: 76, pop: (t - tPick) / 0.3, alpha: env(t, tPick, b, 0.1, 0.2),
      fill: ['#fff6c0', '#9fe86a'], stroke: '#1e3a0a',
    });
  }
});

// 6. Back home, Bawang Putih opens the small gourd and golden coins & gems spill out everywhere!
shot('emas', (t, a, b) => {
  sky(0.3);
  const X = AREA.home;
  putih.root.visible = true; gourdSmall.visible = true;
  gourdSmall.position.set(X, 0.04, 0.85);
  const tGold = Wt('emas', 'dibuka') - 0.1;
  const joy = clamp((t - tGold) / 0.35);
  P(putih, {
    x: X - 0.95, z: 0.55, ry: Math.PI / 2 - 0.3, ...K.idle(t, 4), t,
    bob: Math.abs(Math.sin(t * 7)) * 0.08 * joy,
    armL: [1.7 * joy, 0.35, 0.8], armR: [1.7 * joy, 0.35, 0.8],
    mouth: 'grin', blush: 0.7 * joy, wide: 0.4 * joy,
  }, t, 10);
  if (t >= tGold) {
    glowGold.visible = true;
    glowGold.position.set(X, 0.7, 0.85);
    glowGold.scale.setScalar(2.6 + Math.sin(t * 9) * 0.35);
    goldBurst.position.set(X, 0.5, 0.85);
    goldBurst.userData.tick(t - tGold);
    goldCoins.forEach((c, i) => {
      const u = clamp((t - tGold - c.userData.t0) / 0.35);
      c.visible = u > 0;
      c.position.set(X + c.userData.dx * u * 1.2, 0.06 + Math.sin(u * Math.PI) * 0.7, 0.85 + c.userData.dz * u * 1.2);
      c.rotation.set(u * 4 + i, u * 3, 0);
    });
  }
  const p = (t - a) / (b - a);
  cam([X + lerp(0.5, 0.0, p), lerp(1.75, 1.45, p), lerp(6.8, 5.8, p)], [X - 0.2, 0.75, 0.6], 41, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  if (t >= tGold) {
    K.title(ui, 'PENUH EMAS!', 540, 270, {
      size: 98, pop: (t - tGold) / 0.28, alpha: env(t, tGold, b, 0.1, 0.2),
      fill: ['#fff8c0', '#ffae19'], stroke: '#4a2200',
    });
  }
});

// 7. Greedy Bawang Merah arrives at Grandma's hut and refuses to help at all.
shot('serakah', (t, a, b) => {
  sky(0.4);
  const X = AREA.hut;
  merah.root.visible = true; nenek.root.visible = true;
  P(merah, {
    x: X - 0.75, z: 0.55, ry: -0.35, ...K.idle(t, 7), t,
    armL: [0.3, 0.45, 1.5], armR: [0.3, 0.45, 1.5],
    mouth: 'frown', brow: -1, head: [-0.25, 0.12, 0],
  }, t, 30);
  P(nenek, {
    x: X + 0.9, z: 0.4, ry: -Math.PI / 2 + 0.3, ...K.idle(t, 6), t,
    armL: [0.9, 0.2, 0.6], mouth: 'frown', brow: 0.6,
  }, t, 20);
  const p = (t - a) / (b - a);
  cam([X + lerp(0.4, -0.1, p), 1.6, lerp(6.9, 6.0, p)], [X, 1.0, 0.4], 40, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('BAWANG MERAH', 540, 250, a + 0.1, b, t, '#ff6a5a', 52);
  K.title(ui, 'MALAS MEMBANTU!', 540, 380, {
    size: 74, pop: (t - a - 0.25) / 0.3, alpha: env(t, a + 0.25, b, 0.12, 0.2),
    fill: ['#ffe0d0', '#ff5238'], stroke: '#3a0a06',
  });
});

// 8. Without saying thank you, Bawang Merah grabs the giant gourd and runs off laughing.
shot('rebut', (t, a, b) => {
  sky(0.45);
  const X = AREA.hut;
  merah.root.visible = true; nenek.root.visible = true; gourdBig.visible = true;
  const u = clamp((t - a - 0.2) / (b - a - 0.3));
  const mx = lerp(X - 0.3, X - 5.2, ease.inOutQuad(u));
  P(merah, {
    x: mx, z: 0.7, ry: -Math.PI / 2,
    ...(u > 0.05 ? K.walk(t * 2.2, 1, { run: true }) : K.idle(t, 7)), t,
    armL: [1.3, 0.3, 0.7], armR: [1.3, 0.3, 0.7],
    mouth: 'grin', brow: -0.6,
  }, t, 30);
  gourdBig.position.set(mx - 0.48, 0.45 + Math.abs(Math.sin(t * 9)) * 0.06, 0.7);
  gourdBig.scale.setScalar(1.18);
  P(nenek, {
    x: X + 0.9, z: 0.4, ry: -Math.PI / 2 + 0.2, ...K.idle(t, 6), t,
    armL: [1.3, 0.2, 0.4], mouth: 'open', open: 0.4, brow: 0.8,
  }, t, 20);
  cam([lerp(X, X - 2.6, u), 1.75, 7.6], [lerp(X - 0.2, X - 3.0, u), 1.0, 0.5], 42, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('REBUT LABU RAKSASA!', 540, 260, a + 0.1, b, t, '#ffb84a', 48);
});

// 9. When Bawang Merah splits the giant gourd, smoke and mischievous spirits pop out and chase her!
shot('kejutan', (t, a, b) => {
  sky(0.55);
  const X = AREA.home;
  merah.root.visible = true; gourdBig.visible = true;
  gourdBig.position.set(X + 0.2, 0.04, 0.75);
  const tBoom = Wt('kejutan', 'dibelah') - 0.05;
  const scare = clamp((t - tBoom) / 0.35);
  const runX = lerp(X - 0.8, X - 3.2, clamp((t - tBoom - 0.2) / (b - tBoom)));
  P(merah, {
    x: runX, z: 0.65, ry: scare > 0.2 ? -Math.PI / 2 + 0.3 : Math.PI / 2 - 0.3,
    ...(scare > 0.2 ? K.walk(t * 2.6, 1, { run: true }) : K.idle(t, 7)), t,
    armL: [2.1 * scare, 0.5, 0.8], armR: [2.1 * scare, 0.5, 0.8],
    mouth: 'open', open: 0.9 * scare, wide: scare, brow: 0.9 * scare,
  }, t, 30);
  if (t >= tBoom) {
    smokeBurst.position.set(X + 0.2, 0.65, 0.75);
    smokeBurst.userData.tick(t - tBoom);
    jins.forEach((J, i) => {
      const u = ease.outBack(clamp((t - tBoom - i * 0.06) / 0.35));
      J.visible = u > 0;
      const a0 = (i / 4) * TAU + t * 2.2;
      J.position.set(X + 0.2 + Math.cos(a0) * 0.9 * u - scare * 0.8, 0.9 + u * (0.9 + (i % 2) * 0.4), 0.75 + Math.sin(a0) * 0.5 * u);
      J.rotation.y = -Math.PI / 2 + 0.4;
      K.jinTick(J, t, i, 0.5);
    });
  }
  const p = (t - a) / (b - a);
  cam([X + lerp(0.4, -0.8, p), 1.8, lerp(7.8, 7.0, p)], [X - 0.6, 1.05, 0.6], 43, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  if (t >= tBoom) {
    const hp = merah.j.hc.getWorldPosition(new THREE.Vector3());
    const [hx, hy] = scr(hp.x, hp.y + 0.45, hp.z);
    K.dizzy(ui, hx, hy, t, { r: 75, alpha: env(t, tBoom, b, 0.1, 0.2) });
    K.title(ui, 'KABUUR!', 540, 280, {
      size: 108, pop: (t - tBoom) / 0.25, alpha: env(t, tBoom, b, 0.08, 0.2),
      rot: -0.06, fill: ['#ffe8d0', '#ff5238'], stroke: '#3a0a06',
    });
  }
});

// 10. Warm sunset finale: Bawang Putih & Grandma wave happily with golden blessings and floating hearts.
shot('akhir', (t, a, b) => {
  sky(0.82);
  const X = AREA.home;
  putih.root.visible = true; nenek.root.visible = true; gourdSmall.visible = true;
  gourdSmall.position.set(X, 0.04, 0.95);
  glowGold.visible = true; glowGold.position.set(X, 0.55, 0.95); glowGold.scale.setScalar(2.0);
  goldCoins.slice(0, 12).forEach((c, i) => {
    c.visible = true;
    c.position.set(X + c.userData.dx * 0.8, 0.05, 0.95 + c.userData.dz * 0.8);
    c.rotation.set(0, i, 0);
  });
  P(putih, {
    x: X - 0.75, z: 0.55, ry: 0.35, ...K.idle(t, 4), t,
    armR: [1.5 + Math.sin(t * 5) * 0.25, 0.3, 0.4], armL: [0.6, 0.2, 1.2],
    mouth: 'grin', blush: 0.6,
  }, t, 10);
  P(nenek, {
    x: X + 0.75, z: 0.5, ry: -0.35, ...K.idle(t, 6), t,
    armL: [1.4 + Math.sin(t * 4.5) * 0.2, 0.25, 0.4], mouth: 'grin', blush: 0.5,
  }, t, 20);
  const p = clamp((t - a) / (AM.duration - a));
  cam([X + lerp(0.5, 0.0, p), lerp(1.65, 1.45, p), lerp(6.8, 5.6, p)], [X, 0.95, 0.5], 40, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  const tB = Wt('akhir', 'ketulusan') - 0.15;
  K.title(ui, 'BERKAH KETULUSAN', 540, 270, {
    size: 82, pop: (t - tB) / 0.35, alpha: env(t, tB, AM.duration + 1, 0.15, 0.1),
    fill: ['#fff6c0', '#f2b630'], stroke: '#5a2a00',
  });
  for (let i = 0; i < 4; i++) {
    const u = ((t - a) * 0.6 + i * 0.25) % 1;
    drawHeart(540 + Math.sin(u * 6 + i * 2) * 60 + (i - 1.5) * 60, 820 - u * 280, 38 * (1 - u * 0.35), 1 - u);
  }
  const fade = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (fade > 0) { ui.fillStyle = `rgba(20,10,0,${fade})`; ui.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  reset();
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  s.fn(t, Math.max(0, a), b);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  AM.lib.vignette(ui, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(ui, Math.floor(t * 12) / 12, { amount: 0.04, fps: 12 });
  if (s.id !== 'hook' && since < 0.1) { ui.fillStyle = 'rgba(255,245,225,0.25)'; ui.fillRect(0, 0, 1080, 1920); }
}

