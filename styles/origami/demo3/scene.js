// Origami demo3: "Empat Musim di Desa Kertas Washi — Perjalanan Bangau Origami Melintasi Pegunungan Jepang"
import * as K from '/styles/origami/kit.js';
import * as THREE from 'three';
const { clamp, lerp, ease, prog, env, hrand, mulberry32 } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'elegant', y: 1440, size: 60 } };

let S, rig, ui, fx;
const C = {}, SET = {}, O = {};
const VILLAGE = [0, 0, 0], AUTUMN = [300, 0, 0], WINTER = [-300, 0, 0];
const v3 = (a, b = [0, 0, 0]) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export async function setup(AM) {
  S = K.createStage(AM, { pr: 0.7, aa: true, fov: 50 });
  ui = AM.layer('ui', { z: 5 });
  fx = AM.layer('fx', { z: 6 });
  for (const l of AM.timeline.lines) C[l.id] = l;
  rig = K.lightRig(S.scene);
  O.sky = {
    spring: K.skyTexture({ top: '#dfbac7', low: '#fceee9', glow: '#fff8f2', gy: 0.6, seed: 3 }),
    summer: K.skyTexture({ top: '#8ab8d9', low: '#f3efe2', glow: '#fffdf5', gy: 0.6, seed: 6 }),
    autumn: K.skyTexture({ top: '#d98a5c', low: '#fbe0c2', glow: '#fff1d6', gy: 0.65, seed: 9 }),
    winter: K.skyTexture({ top: '#8c9eb5', low: '#e6ebf0', glow: '#f8fafc', gy: 0.5, seed: 12 }),
  };
  S.scene.fog = new THREE.Fog('#f8e8e2', 30, 120);
  buildVillage();
  buildAutumn();
  buildWinter();
  O.flock = K.makeFlock(260, { seed: 18 }); S.scene.add(O.flock);
  O.hero = K.makeCrane({ tex: K.washi('sakura', '#f2a8b8', '#fff4f5', { repeat: [1.3, 1.3] }) }); S.scene.add(O.hero);

  AM.sfx('paper', 0.08, { gain: 0.5 });
  AM.sfx('wind', C.semi.start + 0.2, { gain: 0.22 });
  AM.sfx('paper', C.desa.start + 0.2, { gain: 0.45 });
  AM.sfx('swoosh_up', C.panas.start + 0.25, { gain: 0.35 });
  AM.sfx('wind', C.gugur.start + 0.2, { gain: 0.25 });
  AM.sfx('bell_temple', C.salju.start + 0.3, { gain: 0.35 });
  AM.sfx('ding', C.festival.start + 0.25, { gain: 0.4 });
  AM.sfx('bell_temple', C.moral.start + 0.4, { gain: 0.48 });
}

function group(at) { const g = new THREE.Group(); g.position.set(...at); S.scene.add(g); return g; }
function place(g, obj, p, ry = 0, s = 1) { obj.position.set(...p); obj.rotation.y = ry; obj.scale.multiplyScalar(s); g.add(obj); return obj; }

function buildVillage() {
  const g = SET.village = group(VILLAGE), r = mulberry32(14);
  g.add(K.paperGround({ size: 220, tex: K.washi('plain', '#efe3cc', '#fff', { seed: 11, repeat: [22, 22] }) }));
  // River ribbon winding through the village
  g.add(K.paperRibbon([[-50, -8], [-18, -5], [-2, -9], [14, -6], [45, -12]], { width: 2.8, y: 0.03 }));
  // Traditional paper houses
  place(g, K.paperHouse({ w: 2.6, d: 2.0, h: 1.5, wall: '#f6efe0', roof: '#5a493e', seed: 1 }), [-3.8, 0, -4.2], 0.35);
  place(g, K.paperHouse({ w: 2.2, d: 1.8, h: 1.4, wall: '#f2e8d5', roof: '#6b4c3b', seed: 2 }), [3.6, 0, -5.0], -0.4);
  place(g, K.paperHouse({ w: 2.8, d: 2.1, h: 1.6, wall: '#f8f2e4', roof: '#4d3f36', seed: 3 }), [0.2, 0, -11.5], 0.1);
  // Washi drying boards in the courtyard
  for (let i = 0; i < 4; i++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.55, 0.06), K.paperMat(K.washi('plain', '#fbf8f0', '#d8c3a5', { seed: 20 + i })));
    board.position.set(-1.5 + i * 1.0, 0.78, -2.5);
    board.rotation.x = -0.18; board.rotation.y = (i - 1.5) * 0.12;
    board.castShadow = board.receiveShadow = true;
    g.add(board);
  }
  // Sakura & green trees
  const cols = ['#f2a7b8', '#f6c2ce', '#629456', '#7ba865'];
  for (let i = 0; i < 34; i++) {
    const a = r() * Math.PI * 2, d = 6 + r() * 24;
    const x = Math.sin(a) * d, z = -Math.abs(Math.cos(a) * d) - 2;
    place(g, K.paperTree({ h: 1.3 + r() * 1.6, color: cols[i % 4], seed: 30 + i }), [x, 0, z], r() * 3);
  }
  for (let i = 0; i < 12; i++) {
    place(g, K.paperMountain({ h: 9 + r() * 12, r: 8 + r() * 4, seg: 6, color: ['#b9c7d3', '#c8c2d8', '#d7d0c6'][i % 3], snow: true, seed: 70 + i }), [-55 + i * 10, 0, -42 - r() * 20], r() * 3);
  }
  // Two village children dolls
  O.kid1 = K.makeDoll({ top: '#d94b38', skirt: '#2c3f6a', topTex: K.washi('asanoha', '#d94b38', '#f7c9a0'), s: 0.9 });
  O.kid2 = K.makeDoll({ top: '#4a7a96', skirt: '#3d5245', topTex: K.washi('seigaiha', '#4a7a96', '#e4eef5'), s: 0.85 });
  g.add(O.kid1, O.kid2);
  const sun = K.paperSun({ r: 4.5, color: '#f39a55', ray: '#f8c58c' }); sun.position.set(8, 18, -80);
  sun.traverse((o) => { if (o.material) o.material.fog = false; }); g.add(sun);
}

function buildAutumn() {
  const g = SET.autumn = group(AUTUMN), r = mulberry32(44);
  g.add(K.paperGround({ size: 220, tex: K.washi('plain', '#e8cfb0', '#fff', { seed: 51, repeat: [22, 22] }) }));
  g.add(K.paperRibbon([[-55, -14], [-20, -10], [5, -16], [30, -11], [60, -15]], { width: 3.2, y: 0.03 }));
  const acols = ['#d94b38', '#e5853c', '#dfa842', '#b83728'];
  for (let i = 0; i < 42; i++) {
    const x = (r() - 0.5) * 48, z = -3 - r() * 28;
    place(g, K.paperTree({ h: 1.2 + r() * 1.8, color: acols[i % 4], seed: 100 + i }), [x, 0, z], r() * 3);
  }
  for (let i = 0; i < 12; i++) {
    place(g, K.paperMountain({ h: 8 + r() * 12, r: 7 + r() * 4, seg: 6, color: ['#d69e72', '#c77b58', '#e0b787'][i % 3], snow: false, seed: 140 + i }), [-55 + i * 10, 0, -40 - r() * 20], r() * 3);
  }
}

function buildWinter() {
  const g = SET.winter = group(WINTER), r = mulberry32(88);
  g.add(K.paperGround({ size: 220, tex: K.washi('plain', '#f3f6f9', '#fff', { seed: 81, repeat: [22, 22] }) }));
  place(g, K.paperHouse({ w: 2.7, d: 2.1, h: 1.55, wall: '#f7f2e7', roof: '#e8eef4', seed: 11 }), [-3.2, 0, -3.8], 0.3);
  place(g, K.paperHouse({ w: 2.5, d: 2.0, h: 1.5, wall: '#f5efe2', roof: '#e8eef4', seed: 12 }), [3.2, 0, -4.2], -0.3);
  // Festival bunting & senbazuru garlands between houses
  const bunt = K.bunting([-3.0, 2.2, -3.2], [3.0, 2.2, -3.5], { n: 14, sag: 0.35, size: 0.24 });
  g.add(bunt);
  O.winGarlands = K.makeGarlands({ strings: 16, per: 22, w: 4.8, d: 1.8, len: 2.0, s: 0.075, seed: 19 });
  O.winGarlands.position.set(0, 2.6, -3.5);
  g.add(O.winGarlands);
  for (let i = 0; i < 30; i++) {
    const a = r() * Math.PI * 2, d = 6 + r() * 22;
    place(g, K.paperTree({ h: 1.3 + r() * 1.6, color: ['#dce6ef', '#7fa1b8', '#eef3f7'][i % 3], seed: 180 + i }), [Math.sin(a) * d, 0, -Math.abs(Math.cos(a) * d) - 3], r() * 3);
  }
  for (let i = 0; i < 12; i++) {
    place(g, K.paperMountain({ h: 10 + r() * 14, r: 8 + r() * 4, seg: 6, color: ['#d6e0ea', '#c2d0de', '#e5ecf2'][i % 3], snow: true, seed: 210 + i }), [-55 + i * 10, 0, -42 - r() * 20], r() * 3);
  }
}

function show(...names) {
  for (const k in SET) SET[k].visible = names.includes(k);
  O.flock.visible = names.includes('flock');
  O.hero.visible = names.includes('hero');
}

const MOOD = {
  spring: { sun: '#ffe9d6', sunI: 2.4, sky: '#fce8ef', ground: '#ebd8c4', hemiI: 1.35, rim: '#ffd4c4', rimI: 1.1 },
  summer: { sun: '#fff2cf', sunI: 2.7, sky: '#d8ecff', ground: '#e2d6b5', hemiI: 1.35, rim: '#ffe0a3', rimI: 1.1 },
  autumn: { sun: '#ffc88a', sunI: 2.5, sky: '#f5d5b8', ground: '#d9b28c', hemiI: 1.25, rim: '#ffad66', rimI: 1.5 },
  winter: { sun: '#e8f1fc', sunI: 1.9, sky: '#d8e4f2', ground: '#cfd8e3', hemiI: 1.35, rim: '#ffdca8', rimI: 1.2 },
};

const SHOTS = []; const shot = (id, next, fn) => SHOTS.push({ id, next, fn });
const span = (id, next) => [C[id].start - 0.12, next ? C[next].start - 0.12 : AM.duration + 1];

// 1. Hook: Washi village in the mountain valley with the sakura crane hovering
shot('hook', 'semi', (t, a, b) => {
  show('village', 'hero'); S.scene.background = O.sky.spring; S.scene.fog.color.set('#f8e8e2'); rig.mood(MOOD.spring);
  rig.aim(VILLAGE, { r: 8, dir: [0.5, 0.9, 0.7] });
  O.kid1.visible = O.kid2.visible = false;
  const p = prog(t, a, b, ease.inOutSine);
  const fl = { ...K.CRANE_POSE.flying, wing: K.flap(t, 1.5, 0, 0.85, 0.22) };
  O.hero.pose(fl); O.hero.scale.setScalar(0.45);
  O.hero.position.set(lerp(-1.2, 0.8, p), lerp(2.2, 1.8, p) + Math.sin(t * 2.5) * 0.08, lerp(1.5, -0.5, p));
  O.hero.rotation.set(0, -0.4 + p * 0.3, Math.sin(t * 1.5) * 0.12);
  K.look(S.cam, [lerp(-2.5, 1.8, p), lerp(2.6, 2.1, p), lerp(5.2, 3.8, p)], [0, 1.4, -3], { t, drift: 0.015, fov: 50 });
  K.title(ui, 'DESA KERTAS WASHI', 540, 340, { size: 78, alpha: env(t, a + 0.1, b, 0.35, 0.25), kanji: '和紙の里', sub: 'empat musim dalam lipatan origami' });
});

// 2. Semi: Springtime river & sakura petals drifting
shot('semi', 'desa', (t, a, b) => {
  show('village', 'hero'); S.scene.background = O.sky.spring; rig.mood(MOOD.spring);
  const p = prog(t, a, b, ease.inOutSine);
  O.hero.pose({ ...K.CRANE_POSE.flying, wing: K.flap(t, 1.4, 0.2, 0.85, 0.2) });
  O.hero.position.set(lerp(-3.5, 3.5, p), 1.4 + Math.sin(t * 2) * 0.1, -5.5);
  O.hero.rotation.set(0, Math.PI / 2, 0.15);
  K.look(S.cam, [lerp(-4.5, 2.5, p), 1.6, -1.8], [lerp(-2, 2, p), 1.0, -6.5], { t, drift: 0.014, fov: 48 });
  K.tag(ui, 'MUSIM SEMI · HARU', 540, 300, { size: 50, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'serat kulit murbei di sungai sakura', kanji: '春' });
});

// 3. Desa: Sun-drying washi sheets in front of traditional houses
shot('desa', 'panas', (t, a, b) => {
  show('village'); S.scene.background = O.sky.summer; S.scene.fog.color.set('#f3efe2'); rig.mood(MOOD.summer);
  O.kid1.visible = true; O.kid2.visible = false;
  O.kid1.position.set(-2.2, 0, -1.8); O.kid1.rotation.y = 0.6;
  O.kid1.pose({ armL: [-0.9, 0.3], armR: [-1.1, -0.2], head: [0.1, 0.1] });
  const p = prog(t, a, b, ease.inOutSine);
  K.look(S.cam, [lerp(-3.2, 2.4, p), 1.45, lerp(1.2, 1.8, p)], [0, 0.9, -2.8], { t, drift: 0.012, fov: 46 });
  K.tag(ui, 'PENJEMURAN KERTAS WASHI', 540, 300, { size: 46, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'tipis, berserat alami, dan tahan ratusan tahun', kanji: '手漉き和紙' });
});

// 4. Panas: Summer children running with origami cranes in the green hills
shot('panas', 'gugur', (t, a, b) => {
  show('village', 'hero', 'flock'); S.scene.background = O.sky.summer; rig.mood(MOOD.summer);
  O.kid1.visible = O.kid2.visible = true;
  const p = prog(t, a, b);
  O.kid1.position.set(lerp(-2.5, 1.8, p), 0, -1.2); O.kid1.rotation.y = Math.PI / 2;
  O.kid2.position.set(lerp(-3.6, 0.6, p), 0, -0.6); O.kid2.rotation.y = Math.PI / 2;
  O.kid1.pose(K.runPose(t, 2.2)); O.kid2.pose(K.runPose(t + 0.3, 2.2));
  O.hero.pose({ ...K.CRANE_POSE.flying, wing: K.flap(t, 1.6) });
  O.hero.position.set(lerp(-1.8, 2.6, p), 1.75 + Math.sin(t * 3) * 0.1, -1.0);
  O.hero.rotation.y = Math.PI / 2;
  O.flock.update(t, (i, tt, o) => {
    if (i > 60) { o.visible = false; return; }
    o.x = -15 + ((tt * 4 + i * 1.3) % 35); o.y = 3.5 + (i % 6) * 0.8; o.z = -8 - (i % 10) * 2.2;
    o.yaw = 0; o.s = 0.4; o.flap = K.flap(tt, 1.5, hrand(i, 2));
  });
  K.look(S.cam, [lerp(-1.5, 1.5, p), 1.35, 2.8], [lerp(-1.5, 1.2, p), 1.1, -1.2], { t, drift: 0.015, fov: 50 });
  K.tag(ui, 'MUSIM PANAS · NATSU', 540, 300, { size: 50, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'motif asanoha & seigaiha di langit cerah', kanji: '夏' });
});

// 5. Gugur: Autumn crimson & gold forest with the crane flock
shot('gugur', 'salju', (t, a, b) => {
  show('autumn', 'flock'); S.scene.background = O.sky.autumn; S.scene.fog.color.set('#f6d8b8'); rig.mood(MOOD.autumn);
  rig.aim(AUTUMN, { r: 9, dir: [0.6, 0.7, 0.8] });
  const p = prog(t, a, b, ease.inOutSine);
  O.flock.update(t, (i, tt, o) => {
    if (i > 160) { o.visible = false; return; }
    const u = (tt * 0.25 + hrand(i, 1)) % 1;
    o.x = AUTUMN[0] + lerp(-22, 22, u);
    o.y = 2.8 + hrand(i, 2) * 5.5 + Math.sin(u * Math.PI * 2 + i) * 0.5;
    o.z = AUTUMN[2] - 5 - hrand(i, 3) * 22;
    o.yaw = 0.15; o.bank = Math.sin(tt + i) * 0.15; o.s = 0.45;
    o.flap = K.flap(tt, 1.5, hrand(i, 4));
  });
  K.look(S.cam, v3(AUTUMN, [lerp(-4, 4, p), lerp(2.2, 3.6, p), 6.5]), v3(AUTUMN, [0, 2.8, -12]), { t, drift: 0.018, fov: 52 });
  K.tag(ui, 'MUSIM GUGUR · AKI', 540, 300, { size: 50, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'lembah momiji merah dan keemasan', kanji: '秋', accent: K.PAL.vermilion });
});

// 6. Salju: Winter snow blanketing the paper roofs and mountains
shot('salju', 'festival', (t, a, b) => {
  show('winter'); S.scene.background = O.sky.winter; S.scene.fog.color.set('#e2e8f0'); rig.mood(MOOD.winter);
  rig.aim(WINTER, { r: 8, dir: [0.4, 0.8, 0.7] });
  O.winGarlands.visible = false;
  const p = prog(t, a, b, ease.inOutSine);
  K.look(S.cam, v3(WINTER, [lerp(-3.5, 2.5, p), 2.1, 4.8]), v3(WINTER, [0, 1.3, -4]), { t, drift: 0.012, fov: 48 });
  // Falling paper snow flecks on 2D UI layer
  ui.save(); ui.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 55; i++) {
    const x = (hrand(i, 1) * 1080 + Math.sin(t + i) * 35) % 1080;
    const y = (hrand(i, 2) * 1920 + t * (95 + hrand(i, 3) * 60)) % 1920;
    ui.fillRect(x, y, 5, 5);
  }
  ui.restore();
  K.tag(ui, 'MUSIM DINGIN · FUYU', 540, 300, { size: 50, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'salju putih di atap kertas washi', kanji: '冬', accent: K.PAL.indigo });
});

// 7. Festival: Garlands of 1000 cranes & paper bunting in the village square
shot('festival', 'moral', (t, a, b) => {
  show('winter'); S.scene.background = O.sky.winter; rig.mood({ ...MOOD.winter, sun: '#ffe4b5', sunI: 2.4 });
  O.winGarlands.visible = true;
  O.winGarlands.show(1000);
  O.winGarlands.sway(t, 0.045);
  const p = prog(t, a, b, ease.inOutSine);
  K.look(S.cam, v3(WINTER, [lerp(-1.8, 1.8, p), lerp(1.3, 1.9, p), lerp(1.5, 0.5, p)]), v3(WINTER, [0, 1.8, -3.5]), { t, drift: 0.014, fov: 48 });
  K.tag(ui, 'FESTIVAL SERIBU BANGAU', 540, 300, { size: 48, alpha: env(t, a + 0.15, b, 0.3, 0.25), sub: 'lambang ketekunan, umur panjang, dan harapan', kanji: '千羽鶴祭', accent: K.PAL.gold });
});

// 8. Moral: Grand crane flock rising above the four-season valley
shot('moral', null, (t, a, b) => {
  show('village', 'flock', 'hero'); S.scene.background = O.sky.spring; S.scene.fog.color.set('#f8e8e2'); rig.mood(MOOD.spring);
  const p = prog(t, a, b, ease.inOutSine);
  O.hero.pose({ ...K.CRANE_POSE.flying, wing: K.flap(t, 1.5) });
  O.hero.scale.setScalar(0.5);
  O.hero.position.set(0, 2.8 + p * 1.8, -1.5);
  O.hero.rotation.set(0, Math.sin(t * 0.8) * 0.2, 0);
  O.flock.update(t, (i, tt, o) => {
    if (i > 150) { o.visible = false; return; }
    const ang = tt * 0.4 + (i / 150) * Math.PI * 2;
    const rad = 2.8 + (i % 10) * 1.1;
    o.x = Math.cos(ang) * rad; o.z = -3 + Math.sin(ang) * rad;
    o.y = 2.2 + (i % 8) * 0.7 + p * 2.2;
    o.yaw = -ang; o.bank = -0.2; o.s = 0.4;
    o.flap = K.flap(tt, 1.5, hrand(i, 5));
  });
  K.look(S.cam, [lerp(2.2, 0, p), lerp(2.0, 3.8, p), lerp(4.5, 7.2, p)], [0, lerp(1.8, 3.6, p), -2.5], { t, drift: 0.018, fov: 52 });
  K.title(ui, 'HARMONI ALAM & KERTAS', 540, 360, { size: 72, alpha: env(t, a + 0.2, b + 0.5, 0.4, 0.2), kanji: '自然と和紙', sub: 'warisan abadi tangan perajin Jepang' });
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

