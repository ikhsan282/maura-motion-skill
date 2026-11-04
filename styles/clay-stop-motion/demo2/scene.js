// Clay Stop Motion demo 2: "Sangkuriang & Perahu Terbalik", 10 shots on a tabletop plasticine diorama, animated on twos.
import * as K from '/styles/clay-stop-motion/kit.js';
const THREE = K.THREE;
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'kids', y: 1440, size: 70 } };

let S, ui, C = {}, D, L;
const Wt = (id, w) => AM.wordTime(id, w);
let sumbi, kid, man, rooster, jins = [], cent, flower, bump;
let house, boatMain, mountM, cloth, icons = {}, lake, dust, sparks, steam, back;
const AREA = { home: 0, yard: 24, hill: 48, valley: 72 };

function buildMountGeo() {
  const g = new THREE.SphereGeometry(1, 36, 18, 0, TAU, 0, Math.PI / 2);
  const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const top = Math.pow(y, 0.58);
    const n = noise.fbm2(x * 3 + 2, z * 3, 2) * 0.1;
    p.setXYZ(i, x * 4.2, (top * 0.85 + y * 0.15) * 2.3 * (1 + n), z * 2.1 * (1 + n));
    c.set(y > 0.72 ? '#7ea852' : y > 0.35 ? '#5b943e' : '#4a8032');
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

function buildSet() {
  D = new THREE.Scene(); D.background = new THREE.Color('#2a2420');
  L = K.studio(D);
  const ground = K.terrain({
    w: 116, d: 24, seg: 116,
    height: (x, z) => {
      const hill = Math.exp(-((x - AREA.hill) ** 2) / 18) * 1.45 * clamp(1 - Math.abs(z) / 6);
      return noise.fbm2(x * 0.25, z * 0.25, 2) * 0.12 + Math.max(0, -z - 4.2) * 0.32 + hill;
    },
    color: (x, z, y) => (Math.abs(z - 1.4 + Math.sin(x * 0.28) * 0.3) < 0.75 && x < 34 ? '#d9a86a' : y > 0.85 ? '#6ba644' : noise.n2(x * 0.4, z * 0.4) > 0.25 ? '#7ab84a' : '#8cc85a'),
  });
  ground.position.x = 34; D.add(ground);

  const table = new THREE.Mesh(new THREE.BoxGeometry(118, 1.2, 26), K.toon('#8a5a36', { rough: 0.6 }));
  table.position.set(34, -0.75, 0); D.add(table);

  back = K.backdrop(124, 28); back.position.set(34, 0, -9.5); D.add(back);

  house = K.house({ w: 3.4, d: 2.5, h: 1.8 }); house.position.set(AREA.home - 2.4, 0, -2.6); house.rotation.y = 0.22;
  K.lumpify(house, 0.015, 6, 1); D.add(house);

  for (let i = 0; i < 18; i++) {
    const tr = K.tree(i % 3 === 0 ? 'palm' : i % 3 === 1 ? 'round' : 'bamboo', { seed: i + 3, s: 0.72 + hrand(i, 2) * 0.38, ol: false });
    tr.position.set(-8 + i * 5.2 + hrand(i, 3) * 1.8, 0, -5.6 - hrand(i, 4) * 2.4);
    K.lumpify(tr, 0.035, 3, i + 10); D.add(tr);
  }
  for (let i = 0; i < 10; i++) {
    const rk = K.rock(0.28 + hrand(i, 5) * 0.25, i + 20);
    rk.position.set(-4 + i * 8.5, 0.1, 2.2 + (hrand(i, 6) - 0.5) * 1.5);
    K.lumpify(rk, 0.02, 7, i + 30); D.add(rk);
  }

  // boatyard trestles + boat
  for (const dx of [-1.4, 0, 1.4]) {
    const tr = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 1.4), K.toon('#6b4426'));
    tr.position.set(AREA.yard + dx, 0.32, 0.2); K.lumpify(tr, 0.012, 8, 40); D.add(tr);
  }
  boatMain = K.boat({ len: 4.8, beam: 1.5, depth: 1.05 });
  K.lumpify(boatMain, 0.014, 6, 42); D.add(boatMain);

  // clay mountain + lake at valley area
  mountM = new THREE.Mesh(buildMountGeo(), K.toon('#ffffff', { vc: true, key: 'clayMount', rough: 0.82 }));
  K.lumpify(mountM, 0.035, 4, 50);
  mountM.position.set(AREA.valley, -0.05, -1.2); D.add(mountM);

  const lg = new THREE.CylinderGeometry(3.8, 4.0, 0.22, 36);
  lake = new THREE.Mesh(lg, K.toon('#4ba6d6', { rough: 0.35 }));
  lake.position.set(AREA.valley + 0.5, 0.02, 2.1); K.lumpify(lake, 0.015, 6, 55); D.add(lake);

  cloth = K.cloth(3.0, 1.4, { color: '#d82e2a', glow: '#ff9a3a' }); D.add(cloth);

  // characters
  sumbi = K.character({ kind: 'woman', skin: '#f2c098', top: '#f6e2c0', trim: '#e0a93a', hair: 'bun', lashes: true, scarf: '#d8476a', eye: '#5a3216', skirtMap: K.batikTex('#7a4526', '#2e1609', '#e3b46b', 'parang') });
  kid = K.character({ kind: 'kid', skin: '#efb88e', top: '#e98b2e', bottom: '#5a3b2a', hair: 'kid', eye: '#4a2a12' });
  man = K.character({ kind: 'man', skin: '#e3ab80', top: '#2e3552', bottom: '#2e3552', hair: 'short', iket: '#8a3f1d', sash: '#c8322a', scar: true, eye: '#3a2210' });
  rooster = K.rooster();
  for (const c of [sumbi.root, kid.root, man.root, rooster.root]) K.lumpify(c, 0.006, 14, 60);
  D.add(sumbi.root, kid.root, man.root, rooster.root);

  cent = K.centong(); cent.rotation.x = Math.PI; cent.position.y = -0.02; K.lumpify(cent, 0.008, 12, 65);
  sumbi.j.handR.add(cent);

  flower = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 6), K.toon('#3f8a3a')); stem.position.y = 0.14; flower.add(stem);
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), K.toon('#ff5c8a'));
    const a = (i / 5) * TAU; p.position.set(Math.cos(a) * 0.05, 0.29, Math.sin(a) * 0.05); p.scale.set(1, 0.55, 1); flower.add(p);
  }
  const ctr = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), K.toon('#ffd23a')); ctr.position.y = 0.3; flower.add(ctr);
  flower.rotation.x = Math.PI / 2; K.lumpify(flower, 0.005, 14, 66);
  man.j.handR.add(flower);

  bump = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), K.toon('#ff8080'));
  kid.j.hc.add(bump); bump.position.set(0.05, 0.36, 0.06);

  // 6 clay jin helpers with tiny hammers
  for (let i = 0; i < 6; i++) {
    const j = K.jin({ color: i % 2 ? '#5fd8ff' : '#7ff0c8', s: 0.72 + hrand(i, 1) * 0.18 });
    const hm = new THREE.Group();
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 6), K.toon('#8a5a32')); st.position.y = -0.14; hm.add(st);
    const hd = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.08), K.toon('#7d7d86')); hd.position.y = -0.28; hm.add(hd);
    j.userData['arm1'].add(hm); hm.position.y = -0.18;
    K.lumpify(j, 0.008, 10, 70 + i);
    D.add(j); jins.push(j);
  }

  // 3 condition icons
  const lakeI = new THREE.Group();
  lakeI.add(new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.08, 24), K.toon('#4fb3e0')));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.07, 8, 24), K.toon('#6fbf4a')); rim.rotation.x = Math.PI / 2; lakeI.add(rim);
  const boatI = K.boat({ len: 0.85, beam: 0.32, depth: 0.22 });
  const moonI = new THREE.Group();
  const cr = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.09, 10, 22, Math.PI * 1.3), K.toon('#ffe27a', { emissive: '#ffcf4a', ei: 0.4 }));
  cr.rotation.z = 0.85; moonI.add(cr);
  icons = { lake: lakeI, boat: boatI, moon: moonI };
  for (const k of Object.keys(icons)) { K.lumpify(icons[k], 0.01, 10, 80); D.add(icons[k]); }

  dust = K.burst({ n: 45, color: '#e8d2a8', size: 0.32, speed: 3.5, up: 2.5, grav: -5, life: 1.0, seed: 4 }); D.add(dust);
  sparks = K.burst({ n: 40, color: '#8ff0ff', size: 0.18, speed: 2.8, up: 3.2, grav: -2, life: 0.8, seed: 5, additive: true }); D.add(sparks);
  steam = K.burst({ n: 20, color: '#ffffff', size: 0.24, speed: 1.0, up: 2.4, grav: 0.5, life: 0.8, seed: 6 }); D.add(steam);
}

export async function setup(AM) {
  S = K.stage(AM, { pr: 0.66 }); ui = S.ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  buildSet();
  AM.sfx('pop', Wt('hook', 'perahu') - 0.1, { gain: 0.45 });
  AM.sfx('boom', Wt('hook', 'terbalik') + 0.05, { gain: 0.5 });
  AM.sfx('impact', Wt('luka', 'terluka'), { gain: 0.45, pitch: 1.1 });
  AM.sfx('chime', Wt('pulang', 'melamar'), { gain: 0.4 });
  AM.sfx('drum_hit', Wt('rahasia', 'anaknya') - 0.08, { gain: 0.55 });
  AM.sfx('pop', Wt('syarat', 'danau'), { gain: 0.4 });
  AM.sfx('magic', C.jin.start + 0.15, { gain: 0.45 });
  AM.sfx('swoosh_up', Wt('kain', 'membentangkan'), { gain: 0.4 });
  AM.sfx('bird', Wt('ayam', 'berkokok') - 0.05, { gain: 0.5, pitch: 0.8 });
  AM.sfx('impact', Wt('tendang', 'menendang') + 0.1, { gain: 0.6 });
  AM.sfx('boom', Wt('akhir', 'Gunung') - 0.1, { gain: 0.55 });
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
function sky(mode = 0) {
  // mode: 0 = day, 0.5 = warm sunset/dawn, 1 = night
  const u = back.children[0].material;
  if (mode <= 0.6) {
    const w = mode / 0.6;
    u.color.set(K.mix('#ffffff', '#ff9e68', w));
    L.key.color.set(K.mix('#fff1dc', '#ffa868', w));
    L.key.intensity = 1.6;
  } else {
    const n = (mode - 0.6) / 0.4;
    u.color.set(K.mix('#ff9e68', '#354880', n));
    L.key.color.set(K.mix('#ffa868', '#8fb5ff', n));
    L.key.intensity = lerp(1.5, 1.05, n);
  }
}
function reset() {
  for (const c of [sumbi, kid, man, rooster]) c.root.visible = false;
  jins.forEach((j) => (j.visible = false));
  for (const k of Object.keys(icons)) icons[k].visible = false;
  cent.visible = false; flower.visible = false; bump.visible = false;
  cloth.visible = false; mountM.visible = false; lake.visible = false;
  boatMain.visible = false; boatMain.scale.setScalar(1); boatMain.rotation.set(0, 0, 0);
  man.j.hc.children[0].material.color.set('#e3ab80');
  for (const p of [dust, sparks, steam]) p.userData.tick(-1);
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

// 1. Hook: Clay mountain pops into a giant wooden boat, flips upside down and slams back onto the diorama table.
shot('hook', (t, a, b) => {
  sky(0.2);
  const X = AREA.valley;
  const tBoat = Wt('hook', 'perahu') - 0.15;
  const tFlip = Wt('hook', 'terbalik') - 0.1;
  lake.visible = true;
  if (t < tBoat) {
    mountM.visible = true;
  } else {
    const uFlip = clamp((t - tFlip) / 0.55);
    boatMain.visible = true;
    boatMain.scale.setScalar(1.35);
    const popY = t < tFlip ? Math.sin(clamp((t - tBoat) / 0.4) * Math.PI) * 1.4 : Math.sin(uFlip * Math.PI) * 2.2;
    boatMain.position.set(X, 1.15 + popY, -1.0);
    boatMain.rotation.set(ease.inOutCubic(uFlip) * Math.PI, K.jit(t, 3, 0.02), Math.sin(t * 4) * 0.05 * (1 - uFlip));
  }
  dust.position.set(X, 0.4, -1.0);
  dust.userData.tick(t >= tFlip + 0.45 ? t - (tFlip + 0.45) : t - tBoat);
  const p = (t - a) / (b - a);
  cam([X + lerp(1.6, -0.8, p), lerp(2.8, 2.3, p), lerp(11.5, 10.2, p)], [X, 1.3, -0.5], 44, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('DIORAMA LEGENDA SUNDA', 540, 250, a + 0.1, b, t, '#ffd23a', 46);
  if (t >= tBoat) {
    K.title(ui, t >= tFlip ? 'PERAHU TERBALIK!' : 'GUNUNG PERAHU?', 540, 410, {
      size: 86, pop: (t - (t >= tFlip ? tFlip : tBoat)) / 0.3, alpha: env(t, tBoat, b, 0.1, 0.2),
      fill: ['#fff6c0', '#ffb12e'], stroke: '#3a1606',
    });
  }
});

// 2. Young Sangkuriang runs away after getting bonked by the rice paddle (centong).
shot('luka', (t, a, b) => {
  sky(0.1);
  sumbi.root.visible = true; kid.root.visible = true; cent.visible = true;
  const tHit = Wt('luka', 'terluka') - 0.1;
  const bonk = clamp((t - tHit) / 0.3);
  const runU = clamp((t - tHit - 0.2) / (b - tHit));
  bump.visible = t >= tHit;
  P(sumbi, {
    x: AREA.home - 0.8, z: 0.4, ry: Math.PI / 2 - 0.2, ...K.idle(t, 4), t,
    armR: [lerp(1.9, 0.8, bonk), 0.25, 0.4], armL: [0.6 * bonk, 0.3, 1.4],
    mouth: bonk > 0.2 ? 'open' : 'frown', open: 0.5, brow: bonk > 0.2 ? 0.8 : -0.7,
  }, t, 10);
  const kx = lerp(AREA.home + 0.5, AREA.home + 5.8, ease.inQuad(runU));
  P(kid, {
    x: kx, z: 0.65, ry: runU > 0.05 ? Math.PI / 2 : -Math.PI / 2 + 0.3,
    ...(runU > 0.05 ? K.walk(t * 2.5, 1, { run: true }) : K.idle(t, 5)), t,
    mouth: 'open', open: 0.6, brow: 0.9, wide: 0.6,
  }, t, 20);
  const p = (t - a) / (b - a);
  cam([AREA.home + lerp(0.5, 2.2, p), 1.7, 8.8], [AREA.home + lerp(0.2, 1.8, p), 1.1, 0], 42, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('SANGKURIANG KECIL', 540, 250, a + 0.1, b, t, '#ffb84a', 52);
  if (t >= tHit) {
    const hp = kid.j.hc.getWorldPosition(new THREE.Vector3());
    const [hx, hy] = scr(hp.x, hp.y + 0.45, hp.z);
    K.dizzy(ui, hx, hy, t, { r: 75, alpha: env(t, tHit, b, 0.1, 0.2) });
  }
});

// 3. Grown-up Sangkuriang returns and kneels with a clay flower to propose.
shot('pulang', (t, a, b) => {
  sky(0.25);
  sumbi.root.visible = true; man.root.visible = true; flower.visible = true;
  const kneel = prog(t, Wt('pulang', 'melamar') - 0.3, Wt('pulang', 'melamar') + 0.2, ease.outCubic);
  P(man, {
    x: AREA.home + 0.9, z: 0.5, ry: -Math.PI / 2 + 0.25, ...K.idle(t, 8, 0.5), t,
    bob: -0.28 * kneel, legL: [1.45 * kneel, 1.5 * kneel], legR: [-0.3 * kneel, 1.8 * kneel],
    armR: [lerp(0.3, 1.45, kneel), 0.15, 0.2], mouth: 'grin', blush: 0.4 * kneel, scar: true,
  }, t, 30);
  P(sumbi, {
    x: AREA.home - 0.6, z: 0.4, ry: Math.PI / 2 - 0.3, ...K.idle(t, 6), t,
    armL: [0.5 * kneel, 0.2, 1.8 * kneel], armR: [0.5 * kneel, 0.2, 1.8 * kneel],
    mouth: 'grin', blush: 0.6 * kneel,
  }, t, 10);
  const p = (t - a) / (b - a);
  cam([AREA.home + 0.15, lerp(1.7, 1.45, p), lerp(7.4, 6.2, p)], [AREA.home + 0.1, 1.0, 0.3], 40, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('PEMUDA GAGAH', 540, 260, a + 0.1, b, t, '#9fe86a', 52);
  if (kneel > 0.3) {
    for (let i = 0; i < 4; i++) {
      const u = ((t - a) * 0.7 + i * 0.25) % 1;
      drawHeart(540 + Math.sin(u * 6 + i * 2) * 55 + (i - 1.5) * 55, 820 - u * 280, 38 * (1 - u * 0.3), (1 - u) * kneel);
    }
  }
});

// 4. Dayang Sumbi spots the scar on his forehead and gasps in shock: her own son!
shot('rahasia', (t, a, b) => {
  sky(0.3);
  sumbi.root.visible = true; man.root.visible = true;
  const tShock = Wt('rahasia', 'tersentak') - 0.1;
  const shock = clamp((t - tShock) / 0.25);
  P(man, {
    x: AREA.home + 0.75, z: 0.45, ry: -Math.PI / 2 + 0.35, ...K.idle(t, 8, 0.4), t,
    mouth: 'smile', scar: true, head: [0.1, 0.08, 0],
  }, t, 30);
  P(sumbi, {
    x: AREA.home - 0.55, z: 0.4, ry: Math.PI / 2 - 0.35, ...K.idle(t, 6, 0.4), t,
    armL: [lerp(0.8, 2.2, shock), 0.35, lerp(1.2, 2.1, shock)],
    armR: [lerp(1.3, 2.2, shock), 0.35, lerp(0.5, 2.1, shock)],
    mouth: shock > 0.1 ? 'open' : 'smile', open: 0.9 * shock, wide: shock, brow: 0.9 * shock, lean: -0.1 * shock,
  }, t, 10);
  const p = (t - a) / (b - a);
  cam([AREA.home + lerp(0.2, -0.1, p), 1.45, lerp(5.8, 4.9, p)], [AREA.home + 0.05, 1.15, 0.3], 38, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  const hp = man.j.hc.getWorldPosition(new THREE.Vector3());
  const [sx, sy] = scr(hp.x - 0.05, hp.y + 0.22, hp.z + 0.2);
  K.pointer(ui, 'BEKAS LUKA CENTONG', 540, 260, sx, sy, { size: 40, alpha: env(t, a + 0.15, b, 0.15, 0.2) });
  if (shock > 0.1) {
    K.title(ui, 'ANAKNYA SENDIRI!', 540, 410, {
      size: 88, pop: (t - tShock) / 0.25, alpha: env(t, tShock, b, 0.08, 0.2),
      fill: ['#ffffff', '#ff7a52'], stroke: '#3a0a06',
    });
  }
});

// 5. Three impossible conditions pop up in clay miniature form between them.
shot('syarat', (t, a, b) => {
  sky(0.38);
  sumbi.root.visible = true; man.root.visible = true;
  P(sumbi, {
    x: AREA.home - 1.05, z: 0.3, ry: 0.55, ...K.idle(t, 6), t,
    armR: [2.3, 0.25, 0.5], armL: [0.3, 0.15, 1.5],
    ...K.talk(t, env(t, a, b, 0.1, 0.1), 3), brow: -0.2,
  }, t, 10);
  P(man, {
    x: AREA.home + 1.05, z: 0.3, ry: -0.55, ...K.idle(t, 9), t,
    armL: [0.4, 0.1, 0.4], armR: [0.7, 0.0, 1.8],
    mouth: 'grin', scar: true,
  }, t, 30);
  const pops = [
    ['lake', Wt('syarat', 'danau') - 0.1, -0.85, '1. DANAU'],
    ['boat', Wt('syarat', 'perahu') - 0.1, 0.0, '2. PERAHU'],
    ['moon', Wt('syarat', 'semalam') - 0.1, 0.85, '3. SEMALAM'],
  ];
  for (const [k, tw, dx] of pops) {
    const o = icons[k];
    const u = clamp((t - tw) / 0.35);
    o.visible = u > 0;
    o.scale.setScalar(Math.max(0.01, ease.outBack(u, 2.4)) * 0.72);
    o.position.set(AREA.home + dx, 2.25 + Math.sin(t * 2.2 + dx) * 0.06, 0.5);
    o.rotation.set(0.25, t * 0.9 + dx, K.jit(t, 40, 0.04));
  }
  const p = (t - a) / (b - a);
  cam([AREA.home, 1.75, lerp(8.0, 7.2, p)], [AREA.home, 1.45, 0.2], 42, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  K.title(ui, 'SYARAT MUSTAHIL', 540, 250, { size: 78, pop: (t - a) / 0.3, alpha: env(t, a + 0.05, b, 0.15, 0.2) });
  for (const [, tw, dx, txt] of pops) {
    const [ix, iy] = scr(AREA.home + dx, 1.75, 0.5);
    if (t >= tw) K.nameplate(ui, txt, ix, iy, { size: 36, alpha: env(t, tw, b, 0.12, 0.2), pop: (t - tw) / 0.25, color: '#9fe0ff' });
  }
});

// 6. Night at the boatyard: glowing blue clay Jins hammer the boat at high speed.
shot('jin', (t, a, b) => {
  sky(0.95);
  const X = AREA.yard;
  boatMain.visible = true; boatMain.position.set(X, 1.15, 0.2);
  man.root.visible = true;
  P(man, {
    x: X - 3.0, z: 1.0, ry: Math.PI / 2 - 0.2, ...K.idle(t, 9), t,
    armR: [1.6, 0.3, 0.4], armL: [1.4, 0.3, 0.5], mouth: 'grin', scar: true,
  }, t, 30);
  const spots = [[-1.7, 2.0, 1.1], [-0.5, 2.15, 1.2], [0.8, 2.1, 1.15], [1.8, 1.95, 1.05], [-0.9, 2.2, -0.8], [0.9, 2.2, -0.8]];
  jins.forEach((J, i) => {
    const u = ease.outBack(clamp((t - a - i * 0.07) / 0.4));
    J.visible = u > 0;
    const [dx, dy, dz] = spots[i];
    J.position.set(X + dx + K.jit(t, i, 0.015), dy + Math.sin(t * 3 + i) * 0.1, dz);
    J.rotation.y = i < 4 ? 0.2 : Math.PI - 0.2;
    K.jinTick(J, t, i, 0);
    J.userData['arm1'].rotation.z = 0.4 + Math.max(0, Math.sin(t * 11 + i * 1.4)) * 1.4;
  });
  sparks.position.set(X, 1.8, 0.4); sparks.userData.tick((t - a) % 0.75);
  const p = (t - a) / (b - a);
  cam([X + lerp(-1.2, 1.0, p), 2.3, lerp(9.8, 8.8, p)], [X - 0.2, 1.4, 0.2], 43, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  const pct = Math.floor(lerp(75, 98, clamp((t - a) / (b - a - 0.3))));
  K.title(ui, 'PASUKAN JIN BIRU', 540, 250, { size: 78, pop: (t - a) / 0.3, alpha: env(t, a, b, 0.12, 0.2), fill: ['#ffffff', '#7ff0c8'], stroke: '#0d2240' });
  label(`PERAHU ${pct}% SELESAI`, 540, 380, a + 0.2, b, t, '#8ff0ff', 48);
});

// 7. Dayang Sumbi spreads the glowing red cloth on the hill to fake the eastern dawn.
shot('kain', (t, a, b) => {
  const X = AREA.hill;
  const spread = prog(t, Wt('kain', 'membentangkan') - 0.2, Wt('kain', 'timur') + 0.1, ease.inOutCubic);
  sky(lerp(0.95, 0.45, spread));
  sumbi.root.visible = true; cloth.visible = true;
  P(sumbi, {
    x: X - 1.1, y: 1.35, z: 0.2, ry: Math.PI / 2 - 0.2, ...K.idle(t, 6), t,
    armL: [lerp(0.5, 2.2, spread), 0.7 * spread, 0.2],
    armR: [lerp(0.5, 2.2, spread), 0.7 * spread, 0.2],
    mouth: 'open', open: 0.4,
  }, t, 10);
  cloth.position.set(X + 1.2, 2.6 + spread * 0.5, -0.4);
  cloth.scale.setScalar(lerp(0.4, 1.55, spread));
  cloth.userData.tick(t, 0.9);
  const p = (t - a) / (b - a);
  cam([X + lerp(-0.6, 0.2, p), 2.7, lerp(9.4, 8.5, p)], [X + 0.3, 2.1, -0.2], 42, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('KAIN TENUN MERAH', 540, 250, a + 0.1, b, t, '#ffd27a', 48);
  if (spread > 0.35) {
    K.title(ui, 'FAJAR PALSU!', 540, 390, {
      size: 92, pop: (t - Wt('kain', 'cahaya')) / 0.3, alpha: env(t, Wt('kain', 'cahaya') - 0.1, b, 0.1, 0.2),
      fill: ['#fff1c0', '#ff6a3a'], stroke: '#3a0a06',
    });
  }
});

// 8. Rooster crows loudly at the false dawn while the jins panic.
shot('ayam', (t, a, b) => {
  sky(0.35);
  const X = AREA.home + 2.5;
  rooster.root.visible = true;
  rooster.root.position.set(X, 0.0, 0.8);
  rooster.root.rotation.y = 0.65 + K.jit(t, 15, 0.02);
  const tCrow = Wt('ayam', 'berkokok') - 0.15;
  const crow = env(t, tCrow, b, 0.15, 0.15);
  K.roosterPose(rooster, { crow, t, flap: crow });
  // panicked jins flying away in the background
  jins.slice(0, 3).forEach((J, i) => {
    J.visible = true;
    const u = clamp((t - a) / (b - a));
    J.position.set(X - 2.0 + i * 1.8 + u * 2.5, 1.8 + u * 2.2 + Math.sin(t * 8 + i) * 0.15, -1.5);
    K.jinTick(J, t, i, 1);
  });
  const p = (t - a) / (b - a);
  cam([X + lerp(0.6, 0.2, p), 1.25, lerp(5.4, 4.6, p)], [X, 0.9, 0.5], 40, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  const [rx, ry] = scr(X + 0.15, 1.1, 0.8);
  K.rings(ui, rx, ry - 30, t, { n: 3, r: 220, color: '255,240,190', alpha: crow });
  if (t >= tCrow) {
    K.title(ui, 'KUKURUYUUK!', 540, 300, {
      size: 98, pop: (t - tCrow) / 0.28, alpha: env(t, tCrow, b, 0.1, 0.2),
      rot: -0.05 + Math.sin(t * 28) * 0.02 * crow, fill: ['#fff7c0', '#ffb02e'], stroke: '#3a1606',
    });
  }
});

// 9. Furious that the jins fled, Sangkuriang kicks the unfinished boat into the sky!
shot('tendang', (t, a, b) => {
  sky(0.42);
  const X = AREA.yard;
  man.root.visible = true; boatMain.visible = true;
  const tKick = Wt('tendang', 'menendang') + 0.05;
  const wind = prog(t, tKick - 0.45, tKick - 0.05, ease.outCubic);
  const strike = prog(t, tKick - 0.05, tKick + 0.15, ease.outQuad);
  const fly = clamp((t - tKick) / 0.75);
  man.j.hc.children[0].material.color.set(K.mix('#e3ab80', '#ff6a50', 0.65));
  P(man, {
    x: X - 1.8, z: 0.6, ry: Math.PI / 2, t,
    legR: [lerp(lerp(0, -0.8, wind), 1.85, strike), lerp(lerp(0, 1.1, wind), 0.1, strike)],
    lean: lerp(lerp(0, -0.2, wind), 0.25, strike),
    armL: [1.2 * strike, 0.7, 0.5], armR: [-0.5 * strike, 0.7, 0.5],
    brow: -1, mouth: 'open', open: 0.8, scar: true,
  }, t, 30);
  steam.position.set(X - 1.8, 2.1, 0.6); steam.userData.tick((t - a) % 0.75);
  boatMain.position.set(X + fly * 6.5, 1.15 + ease.inQuad(fly) * 9.5, 0.2 - fly * 2.5);
  boatMain.rotation.set(-fly * 2.4, fly * 1.1, -fly * 4.2);
  dust.position.set(X - 0.8, 0.9, 0.4); dust.userData.tick(t - tKick);
  const p = (t - a) / (b - a);
  cam([X + lerp(-0.5, 0.8, p), 1.85 + fly * 0.8, 9.2], [X + fly * 2.2, 1.4 + fly * 2.5, 0.2], 44, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  if (t < tKick) {
    K.title(ui, 'MURKA!', 540, 280, {
      size: 108, pop: (t - a) / 0.28, alpha: env(t, a + 0.1, tKick, 0.1, 0.05),
      fill: ['#fff1c0', '#ff4a2a'], stroke: '#3a0606',
    });
  } else {
    K.title(ui, 'DUAKK!', 580, 380, {
      size: 132, pop: (t - tKick) / 0.22, alpha: env(t, tKick, b, 0.05, 0.2),
      rot: -0.1, fill: ['#ffffff', '#ffd23a'], stroke: '#3a1606',
    });
  }
});

// 10. Finale: The giant upturned boat lands in the valley and becomes Gunung Tangkuban Perahu.
shot('akhir', (t, a, b) => {
  sky(0.5);
  const X = AREA.valley;
  lake.visible = true;
  const fall = clamp((t - a) / 0.45);
  const morphed = t >= a + 0.65;
  boatMain.visible = !morphed;
  mountM.visible = morphed;
  if (!morphed) {
    boatMain.scale.setScalar(1.38);
    boatMain.position.set(X, lerp(7.5, 1.05, ease.inQuad(fall)), -1.2);
    boatMain.rotation.set(lerp(Math.PI * 0.55, Math.PI, ease.outCubic(fall)), 0, 0);
  }
  dust.position.set(X, 0.5, -1.0); dust.userData.tick(t - (a + 0.42));
  const p = clamp((t - a) / (AM.duration - a));
  cam([X + lerp(1.5, 0.4, p), lerp(2.8, 2.4, p), lerp(11.8, 10.4, p)], [X, 1.25, -0.5], 43, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  const tG = Wt('akhir', 'Gunung') - 0.15;
  if (t >= tG) {
    K.title(ui, 'TANGKUBAN PERAHU', 540, 270, {
      size: 82, pop: (t - tG) / 0.35, alpha: env(t, tG, AM.duration + 1, 0.15, 0.1),
      fill: ['#fff6c0', '#f2b630'], stroke: '#5a2a00',
    });
    label('GUNUNG PERAHU TERBALIK', 540, 390, tG + 0.2, AM.duration + 1, t, '#9fe86a', 44);
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

