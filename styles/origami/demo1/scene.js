// Origami demo: "Seribu Bangau Kertas" — the senbazuru legend and Sadako Sasaki, told in folded paper.
import * as K from '/styles/origami/kit.js';
import * as THREE from 'three';
const { clamp, lerp, ease, prog, env, noise, hrand, mulberry32 } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'elegant', y: 1440, size: 62 } };

let S, rig, ui, fx;
const C = {}, SET = {}, O = {};
const LAND = [0, 0, 0], CITY = [300, 0, 0], TRACK = [-300, 0, 0], ROOM = [0, 0, 300], MON = [0, 0, -300];
const W = (id, w) => AM.wordTime(id, w);
const v3 = (a, b = [0, 0, 0]) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export async function setup(AM) {
  S = K.createStage(AM, { pr: 0.7, aa: true, fov: 50 });
  ui = AM.layer('ui', { z: 5 });
  fx = AM.layer('fx', { z: 6 });
  for (const l of AM.timeline.lines) C[l.id] = l;
  rig = K.lightRig(S.scene);
  O.sky = {
    morning: K.skyTexture({ top: '#eac9a6', low: '#fbeedc', glow: '#fff3df', gy: 0.55 }),
    grey: K.skyTexture({ top: '#8f8d8b', low: '#c9c4bd', glow: '#e6e1da', gy: 0.4, seed: 5 }),
    dawn: K.skyTexture({ top: '#f0b48e', low: '#fde7cf', glow: '#fff1d0', gy: 0.7, seed: 7 }),
    day: K.skyTexture({ top: '#bcd7e6', low: '#f6efe0', glow: '#fffaf0', gy: 0.6, seed: 9 }),
  };
  S.scene.fog = new THREE.Fog('#f6e9d6', 30, 120);
  buildLand(); buildRoom(); buildMonument();
  O.flock = K.makeFlock(420, { seed: 12 }); S.scene.add(O.flock);
  O.hero = K.makeCrane({ tex: K.washi('asanoha', K.PAL.vermilion, '#f7c9a0', { repeat: [1.2, 1.2] }) }); S.scene.add(O.hero);
  O.sheet = K.makeFoldSheet({ tex: K.washi('asanoha', K.PAL.vermilion, '#f7c9a0'), back: K.washi('crease', K.PAL.white, 'rgba(150,120,90,0.35)'), h: 0.7 }); S.scene.add(O.sheet);
  O.gold = K.makeCrane({ tex: K.washi('plain', '#d9aa45', '#fff', { seed: 4 }), shine: 80 }); S.scene.add(O.gold);
  O.goldSheet = K.makeFoldSheet({ tex: K.washi('plain', '#dcae4a', '#fff', { seed: 4 }), back: K.washi('plain', '#f3e7cf', '#fff'), h: 0.16 }); S.scene.add(O.goldSheet);
  O.medSheet = K.makeFoldSheet({ tex: K.washi('medicine', '#f7f4ee', '#555', { seed: 2 }), back: K.washi('plain', '#fbfaf6', '#fff'), h: 0.16 }); S.scene.add(O.medSheet);
  O.medCrane = K.makeCrane({ tex: K.washi('medicine', '#f7f4ee', '#555', { seed: 2, repeat: [2, 2] }) }); S.scene.add(O.medCrane);

  // ---------- sound ----------
  AM.sfx('paper', 0.02, { gain: 0.5 });
  AM.sfx('paper', 0.5, { gain: 0.45, pitch: 1.15 });
  AM.sfx('magic', 1.22, { gain: 0.35 });
  AM.sfx('swoosh_up', 2.1, { gain: 0.3 });
  AM.sfx('bell_temple', W('hook', 'permohonan'), { gain: 0.3 });
  AM.sfx('paper', C.sadako.start + 1.2, { gain: 0.4, pitch: 1.2 });
  AM.sfx('ding', W('seribu', 'seribu') + 0.1, { gain: 0.35 });
  AM.sfx('wind', C.pergi.start, { gain: 0.18 });
  AM.sfx('whoosh', C.moral.start + 0.1, { gain: 0.3 });
  AM.sfx('bell_temple', W('moral', 'damai'), { gain: 0.45 });
}

// ============================================================ sets
function group(at) { const g = new THREE.Group(); g.position.set(...at); S.scene.add(g); return g; }
function place(g, obj, p, ry = 0, s = 1) { obj.position.set(...p); obj.rotation.y = ry; obj.scale.multiplyScalar(s); g.add(obj); return obj; }

function buildLand() {
  const g = SET.land = group(LAND), r = mulberry32(21);
  g.add(K.paperGround({ size: 220, tex: K.washi('plain', '#efe4cd', '#fff', { seed: 3, repeat: [22, 22] }) }));
  const greens = ['#9cb87a', '#b5c98e', '#87a96b', '#c9d3a0'];
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = 7 + r() * 45;
    const x = Math.sin(a) * d, z = -Math.abs(Math.cos(a) * d) - 3;
    const m = new THREE.Mesh(new THREE.CircleGeometry(2.5 + r() * 5, 7), K.paperMat(K.washi('plain', greens[i % 4], '#fff', { seed: 30 + i, repeat: [2, 2] })));
    m.rotation.x = -Math.PI / 2; m.rotation.z = r() * 3; m.position.set(x, 0.01 + i * 0.002, z); m.receiveShadow = true; g.add(m);
  }
  const mcol = ['#b9c7d3', '#c8c2d8', '#d7d0c6', '#a9bccb', '#cdd7d9'];
  for (let i = 0; i < 16; i++) {
    const x = -70 + i * 9.5 + r() * 4, z = -45 - r() * 30, h = 10 + r() * 16;
    place(g, K.paperMountain({ h, r: h * (0.65 + r() * 0.3), seg: 5 + (i % 3), color: mcol[i % 5], seed: i + 1, snow: h > 17 }), [x, 0, z], r() * 3);
  }
  for (let i = 0; i < 9; i++) place(g, K.paperMountain({ h: 3 + r() * 3, r: 5 + r() * 4, seg: 7, color: greens[i % 4], snow: false, seed: 40 + i }), [-30 + i * 8 + r() * 3, 0, -22 - r() * 8], r() * 3);
  for (let i = 0; i < 46; i++) {
    const x = (r() - 0.5) * 50, z = -4 - r() * 26;
    if (Math.abs(x) < 2.2 && z > -7) continue;
    place(g, K.paperTree({ h: 0.9 + r() * 1.3, color: ['#4f7f4a', '#6a9a52', '#3f6f4e', '#7aa35c'][i % 4], seed: i }), [x, 0, z], r() * 3);
  }
  g.add(K.paperRibbon([[-60, -16], [-25, -12], [-8, -18], [12, -13], [35, -20], [70, -15]], { width: 3.2, y: 0.03 }));
  const sun = K.paperSun({ r: 5, color: '#f39a55', ray: '#f8c58c' }); sun.position.set(9, 21, -95);
  sun.traverse((o) => { if (o.material) o.material.fog = false; }); g.add(sun); O.sun = sun;
  for (let i = 0; i < 9; i++) { const c = K.paperCloud({ w: 6 + r() * 7, seed: i + 3 }); c.position.set(-40 + i * 10 + r() * 6, 9 + r() * 12, -60 - r() * 20); c.traverse((o) => { if (o.material) o.material.fog = false; }); g.add(c); }
}

function buildRoom() {
  const g = SET.room = group(ROOM), r = mulberry32(4);
  const floor = K.paperGround({ size: 14, tex: K.washi('wood', '#d8c09a', 'rgba(140,100,60,0.35)', { repeat: [3, 3] }) }); g.add(floor);
  const wallT = K.washi('plain', '#dfe5d6', '#fff', { seed: 33, repeat: [4, 2] });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), K.paperMat(wallT)); back.position.set(0, 3, -3); back.receiveShadow = true; g.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), K.paperMat(K.washi('plain', '#d5ddcc', '#fff', { seed: 34, repeat: [3, 2] }))); left.rotation.y = Math.PI / 2; left.position.set(-4.5, 3, 2); left.receiveShadow = true; g.add(left);
  const skirting = new THREE.Mesh(new THREE.BoxGeometry(14, 0.25, 0.08), K.paperMat('#b59c7a')); skirting.position.set(0, 0.12, -2.95); g.add(skirting);
  // window with a shoji-like grid and morning light
  const win = new THREE.Group(); win.position.set(1.2, 2.2, -2.97); g.add(win);
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshBasicMaterial({ map: K.washi('windowpane', '#fff6e2', '#c9b79c', { seed: 3 }), color: '#ffffff' })); win.add(pane); O.pane = pane;
  for (const [w, h, x, y] of [[2.6, 0.1, 0, 0.85], [2.6, 0.12, 0, -0.85], [0.1, 1.8, -1.25, 0], [0.1, 1.8, 1.25, 0]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), K.paperMat('#9c8264')); f.position.set(x, y, 0.03); win.add(f); }
  const sill = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 0.35), K.paperMat('#a88c6c')); sill.position.set(1.2, 1.36, -2.82); sill.castShadow = true; g.add(sill);
  // light patch from the window on the floor (cheap fake)
  const lp = K.washi('windowpane', 'rgba(255,240,205,1)', 'rgba(0,0,0,0)', { seed: 6 });
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), new THREE.MeshBasicMaterial({ map: lp, transparent: true, opacity: 0.32, depthWrite: false }));
  patch.rotation.x = -Math.PI / 2; patch.rotation.z = 0.25; patch.position.set(0.6, 0.015, -0.6); g.add(patch); O.patch = patch;
  // bed
  const bed = new THREE.Group(); bed.position.set(-0.6, 0, -1.4); g.add(bed); O.bed = bed;
  const frameM = K.paperMat(K.washi('plain', '#eef0ec', '#fff', { seed: 35 }));
  const mk = (geo, mat, p, par = bed) => { const m = new THREE.Mesh(geo, mat); m.position.set(...p); m.castShadow = m.receiveShadow = true; par.add(m); return m; };
  mk(new THREE.BoxGeometry(2.2, 0.28, 1.1), frameM, [0, 0.52, 0]);
  for (const [x, z] of [[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]]) mk(new THREE.BoxGeometry(0.07, 0.5, 0.07), K.paperMat('#9aa3a6'), [x, 0.25, z]);
  mk(new THREE.BoxGeometry(0.08, 1.0, 1.1), K.paperMat('#9aa3a6'), [-1.1, 0.8, 0]);
  mk(K.crumple(new THREE.BoxGeometry(0.45, 0.16, 0.75, 2, 1, 2).toNonIndexed(), 0.04, 3), K.paperMat(K.washi('plain', '#fbfbf8', '#fff', { seed: 36 })), [-0.8, 0.76, 0]);
  O.blanket = mk(K.crumple(new THREE.BoxGeometry(1.5, 0.16, 1.16, 3, 1, 2).toNonIndexed(), 0.05, 5), K.paperMat(K.washi('asanoha', '#cfdcea', '#f5f8fb', { repeat: [2, 2] })), [0.35, 0.74, 0]);
  // side table with medicine packets and a paper stack
  const tab = new THREE.Group(); tab.position.set(1.15, 0, -1.9); g.add(tab);
  mk(new THREE.BoxGeometry(0.7, 0.62, 0.5), K.paperMat(K.washi('plain', '#c8ab84', '#fff', { seed: 37 })), [0, 0.31, 0], tab);
  for (let i = 0; i < 5; i++) { const p = mk(new THREE.BoxGeometry(0.16, 0.02, 0.12), K.paperMat(K.washi('medicine', '#f7f4ee', '#555', { seed: 2, repeat: [0.5, 0.5] })), [-0.18 + i * 0.03, 0.635 + i * 0.02, -0.05 + (i % 2) * 0.06], tab); p.rotation.y = i * 0.4; }
  for (let i = 0; i < 6; i++) { const p = mk(new THREE.BoxGeometry(0.2, 0.01, 0.2), K.paperMat(K.WASHI_COLORS[i]), [0.15, 0.63 + i * 0.012, 0.05], tab); p.rotation.y = i * 0.25; }
  // dolls: Sadako in bed (pajama kimono), the friend
  O.patient = K.makeDoll({ top: '#e4ecf4', topTex: K.washi('yagasuri', '#e7eef6', '#b8c9de', { repeat: [1, 1] }), skirt: '#e4ecf4', skin: '#f2dcc6' });
  O.patient.userData.legL.visible = O.patient.userData.legR.visible = false;
  O.patient.position.set(-0.75, 0.22, -1.4); O.patient.rotation.y = 0.35; g.add(O.patient);
  O.friend = K.makeDoll({ top: '#fbf8f1', skirt: '#2c3f6a', hair: '#2c2420', topTex: K.washi('plain', '#fbf8f1', '#fff', { seed: 38 }) });
  O.friend.position.set(1.3, 0, -0.5); g.add(O.friend);
  // garlands: 1000 cranes on 25 strings from the ceiling
  O.garlands = K.makeGarlands({ strings: 25, per: 40, w: 7.5, d: 3.4, len: 3.2, s: 0.085, seed: 7 });
  O.garlands.position.set(0, 3.9, -1.2); g.add(O.garlands);
  // a single crane on the windowsill
  const sillCrane = new THREE.Mesh(K.craneStaticGeom(K.CRANE_POSE.standing), K.paperMat(K.washi('sakura', '#f4b2bf', '#fff4f2', { repeat: [1.5, 1.5] })));
  sillCrane.scale.setScalar(0.17); sillCrane.position.set(1.5, 1.47, -2.82); sillCrane.rotation.y = -0.5; sillCrane.castShadow = true; g.add(sillCrane); O.sillCrane = sillCrane;
  // pile of finished cranes on the blanket (instanced, shown progressively)
  const pileN = 60, pile = new THREE.InstancedMesh(K.craneStaticGeom(K.CRANE_POSE.standing), K.paperMat(K.washi('plain', '#fff', '#fff', { seed: 39 })), pileN);
  const M = new THREE.Matrix4(), c = new THREE.Color();
  for (let i = 0; i < pileN; i++) {
    const x = 0.05 + r() * 1.0, z = -0.45 + r() * 0.9;
    M.compose(new THREE.Vector3(-0.6 + x, 0.86 + r() * 0.04, -1.4 + z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 6.28, 0)), new THREE.Vector3(0.075, 0.075, 0.075));
    pile.setMatrixAt(i, M); c.set(i % 4 === 0 ? '#f6f3ec' : K.WASHI_COLORS[Math.floor(r() * 12)]); pile.setColorAt(i, c);
  }
  pile.castShadow = true; g.add(pile); O.pile = pile;
}

function buildMonument() {
  const g = SET.mon = group(MON), r = mulberry32(31);
  g.add(K.paperGround({ size: 240, tex: K.washi('plain', '#e3d9c6', '#fff', { seed: 41, repeat: [24, 24] }) }));
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(7, 12), K.paperMat(K.washi('kikko', '#d9d2c4', 'rgba(150,140,125,0.6)', { repeat: [3, 3] })));
  plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.02; plaza.receiveShadow = true; g.add(plaza);
  const stoneM = K.paperMat(K.washi('plain', '#efece4', '#fff', { seed: 42 }));
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.3, 0.6, 8), stoneM); plinth.position.y = 0.3; plinth.castShadow = plinth.receiveShadow = true; g.add(plinth);
  // three slender legs that rise and meet at the top (folded-paper tubes)
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.3;
    const pts = [[1.55, 0.5], [1.75, 2.2], [1.25, 4.6], [0.55, 6.4], [0.18, 7.2]].map(([rr, y]) => new THREE.Vector3(Math.sin(a) * rr, y, Math.cos(a) * rr));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.17, 5), stoneM);
    tube.castShadow = tube.receiveShadow = true; g.add(tube);
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.3, 0.35, 8), stoneM); cap.position.y = 7.3; cap.castShadow = true; g.add(cap);
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.45, 0.7, 8, 1, true), K.goldMat()); bell.position.y = 3.9; g.add(bell);
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 3.0, 3), K.paperMat('#7a6a55')); line.position.y = 5.7; g.add(line);
  // the girl on top, arms raised, holding the golden crane
  const girl = K.makeDoll({ top: '#e8e2d6', skirt: '#e1d9c9', skin: '#e9e2d4', hair: '#cfc7b8', topTex: K.washi('plain', '#ebe5d9', '#fff', { seed: 43 }), s: 1.25 });
  girl.position.y = 7.45; girl.pose({ armL: [-(Math.PI - 0.35), 0.35], armR: [-(Math.PI - 0.35), 0.35], head: [0, -0.35] });
  g.add(girl); O.statue = girl;
  const gc = new THREE.Mesh(K.craneStaticGeom({ neck: 0.6, head: -1.2, tail: Math.PI - 0.5, wing: 0.25 }), K.goldMat());
  gc.scale.setScalar(0.7); gc.position.set(0, 9.85, 0.2); gc.rotation.y = -0.3; gc.castShadow = true; g.add(gc); O.statueCrane = gc;
  // side figures and garland booths
  for (const sx of [-1, 1]) {
    const kid = K.makeDoll({ top: '#e8e2d6', skirt: '#e1d9c9', skin: '#e9e2d4', hair: '#cfc7b8', s: 0.8 });
    kid.position.set(sx * 2.4, 0.6, 0.6); kid.rotation.y = sx * 0.5; kid.pose({ armL: [-1.6, 0.3], armR: [-0.3, 0.2] }); g.add(kid);
    const booth = new THREE.Group(); booth.position.set(sx * 4.6, 0, -2.2); booth.rotation.y = -sx * 0.5; g.add(booth);
    const bx = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.9), K.paperMat(K.washi('plain', '#d9d1c2', '#fff', { seed: 44 }))); bx.position.y = 0.8; bx.castShadow = true; booth.add(bx);
    const gl = K.makeGarlands({ strings: 9, per: 9, w: 2.1, d: 0.3, len: 1.2, s: 0.06, seed: 10 + sx }); gl.position.set(0, 1.55, 0.5); booth.add(gl);
  }
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, d = 10 + r() * 22;
    place(g, K.paperTree({ h: 1.6 + r() * 2, color: ['#4f7f4a', '#6a9a52', '#3f6f4e'][i % 3], seed: i + 9 }), [Math.sin(a) * d, 0, Math.cos(a) * d], r() * 3);
  }
  for (let i = 0; i < 10; i++) place(g, K.paperMountain({ h: 6 + r() * 8, r: 7, seg: 6, color: ['#b9c7d3', '#c8c2d8', '#aebfca'][i % 3], snow: false, seed: 80 + i }), [-60 + i * 13, 0, -50 - r() * 20], r() * 3);
  const sun = K.paperSun({ r: 3.4, color: '#f39a55', ray: '#f8c58c' }); sun.position.set(-7, 14, -70); sun.traverse((o) => { if (o.material) o.material.fog = false; }); g.add(sun); O.monSun = sun;
  for (let i = 0; i < 6; i++) { const c = K.paperCloud({ w: 6 + r() * 6, seed: i + 30 }); c.position.set(-30 + i * 12, 10 + r() * 10, -55 - r() * 10); c.traverse((o) => { if (o.material) o.material.fog = false; }); g.add(c); }
}

// ============================================================ per-frame helpers
function show(...names) {
  for (const k in SET) SET[k].visible = names.includes(k);
  for (const k of ['hero', 'sheet', 'gold', 'goldSheet', 'medSheet', 'medCrane', 'flock']) O[k].visible = names.includes(k);
}
function sky(name, fogCol, near = 30, far = 120) { S.scene.background = O.sky[name]; S.scene.fog.color.set(fogCol); S.scene.fog.near = near; S.scene.fog.far = far; }
const MOOD = {
  morning: { sun: '#ffe7c4', sunI: 2.6, sky: '#e6ecff', ground: '#ecd7b4', hemiI: 1.35, rim: '#ffd2a3', rimI: 1.1 },
  grey: { sun: '#e9e6e2', sunI: 0.9, sky: '#cfd2d6', ground: '#a7a39c', hemiI: 1.25, rim: '#d9d9d9', rimI: 0.4 },
  room: { sun: '#fff0d6', sunI: 2.1, sky: '#e7eef6', ground: '#d9c4a2', hemiI: 1.25, rim: '#ffe0b8', rimI: 0.8 },
  cool: { sun: '#e2ecf7', sunI: 1.6, sky: '#dbe6f2', ground: '#c7c0b3', hemiI: 1.2, rim: '#cfe0f2', rimI: 0.6 },
  dawn: { sun: '#ffc995', sunI: 2.5, sky: '#f1dccb', ground: '#e2c39c', hemiI: 1.2, rim: '#ffbf86', rimI: 1.6 },
};
const UP = new THREE.Vector3(0, 1, 0);
/** Flight path helper for the hero crane: position + heading from a curve at param u. */
function flyAlong(obj, pts, u, { s = 1, bank = 0 } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const p = curve.getPoint(clamp(u)), tg = curve.getTangent(clamp(u));
  obj.position.copy(p); obj.scale.setScalar(s);
  obj.rotation.set(0, Math.atan2(-tg.z, tg.x), 0, 'YZX'); obj.rotation.z = Math.asin(clamp(tg.y, -1, 1)) * 0.8; obj.rotation.x = bank;
  return p;
}

// ============================================================ shots
const SHOTS = []; const shot = (id, next, fn) => SHOTS.push({ id, next, fn });
const span = (id, next) => [C[id].start - 0.12, next ? C[next].start - 0.12 : AM.duration + 1];

// 1. A vermilion sheet folds itself into a crane, which flies off into a sky full of cranes.
shot('hook', 'sadako', (t, a, b) => {
  show('land', 'hero', 'sheet', 'flock'); sky('morning', '#f6e6d0', 25, 110); rig.mood(MOOD.morning);
  rig.aim([0, 0, 0], { r: 3.5, dir: [0.5, 1, 0.7] });
  const u1 = lerp(0.22, 1, prog(t, 0, 0.5, ease.inOutCubic)), u2 = prog(t, 0.5, 0.95, ease.inOutCubic);
  O.sheet.fold(u1, u2);
  const lift = prog(t, 0.95, 1.3, ease.inOutCubic), pop = prog(t, 1.24, 1.38, ease.inCubic);
  O.sheet.position.set(0, 0.002 + lift * 0.75, lift * -0.2); O.sheet.rotation.set(-lift * 1.35, lift * 0.6, 0); O.sheet.scale.setScalar(Math.max(0.001, (1 - lift * 0.25) * (1 - pop)));
  O.sheet.visible = pop < 1;
  // the crane: pops, unfolds (neck, tail, head, wings), hovers, then flies
  const appear = prog(t, 1.24, 1.55, (x) => ease.outBack(x, 2.2));
  const P = K.CRANE_POSE, f = K.CRANE_POSE.folded;
  const pose = {
    neck: lerp(f.neck, P.standing.neck, prog(t, 1.35, 1.72, ease.inOutCubic)),
    tail: lerp(f.tail, P.standing.tail, prog(t, 1.45, 1.82, ease.inOutCubic)),
    head: lerp(f.head, P.standing.head, prog(t, 1.68, 1.9, ease.outCubic)),
    wing: lerp(f.wing, P.standing.wing, prog(t, 1.75, 2.15, ease.outBack)),
  };
  const flyU = prog(t, 2.15, 5.6, (x) => x * x * (3 - 2 * x) * 0.6 + x * 0.4);
  const flying = prog(t, 2.05, 2.5);
  const fl = K.mixPose(pose, P.flying, flying);
  if (t > 2.05) fl.wing = lerp(pose.wing, K.flap(t, 1.5, 0.1, 0.9, 0.25), flying);
  O.hero.pose(fl);
  O.hero.visible = t > 1.24;
  const sc = 0.5 * Math.max(0.001, appear);
  if (t < 2.15) {
    O.hero.position.set(0, 0.78 + Math.sin(t * 3) * 0.02, -0.15); O.hero.rotation.set(0, 0.5 - prog(t, 1.3, 2.15) * 0.3, 0); O.hero.scale.setScalar(sc);
  } else {
    flyAlong(O.hero, [[0, 0.78, -0.15], [-0.4, 1.6, -1.6], [-1.8, 3.6, -6], [-5, 6.5, -15]], flyU, { s: 0.5, bank: Math.sin(t * 1.3) * 0.15 });
  }
  // camera: looking down at the sheet, then tilting up after the crane
  const hp = O.hero.position;
  const up = prog(t, 1.9, 4.6, ease.inOutCubic);
  const target = [lerp(0, hp.x * 0.75, up), lerp(lerp(0.05, 0.75, prog(t, 0.95, 1.6, ease.inOutCubic)), hp.y * 0.85, up), lerp(0.05, hp.z * 0.8, up)];
  K.look(S.cam, [lerp(0.25, 0.9, up), lerp(2.1, 1.15, up) - prog(t, 0.9, 1.7, ease.inOutSine) * 0.5 * (1 - up), lerp(2.7, 3.3, up)], target, { t, drift: 0.015, fov: lerp(48, 56, up) });
  // the flock streams across the sky
  O.flock.update(t, (i, tt, o) => {
    const st = 1.6 + hrand(i, 1) * 3.2, u = tt - st;
    if (u < 0 || i > 260) { o.visible = false; return; }
    const lane = hrand(i, 2), sp = 3.2 + hrand(i, 3) * 2;
    o.x = 26 - u * sp - hrand(i, 4) * 10; o.y = 4 + lane * 10 + Math.sin(u * 0.8 + i) * 0.4; o.z = -16 - hrand(i, 5) * 34;
    o.yaw = Math.PI + 0.25 * (hrand(i, 6) - 0.5); o.pitch = 0.05; o.bank = Math.sin(u + i) * 0.1; o.s = 0.55 + hrand(i, 7) * 0.35; o.flap = K.flap(tt, 1.4 + hrand(i, 8) * 0.6, hrand(i, 9), 0.9, 0.2);
  });
  // overlay: 1.000 counter, then the SENBAZURU title
  const n1 = W('hook', 'seribu'), n2 = W('hook', 'permohonan');
  const ca = env(t, n1 - 0.1, n2 - 0.1, 0.25, 0.3);
  K.counter(ui, Math.round(lerp(1, 1000, prog(t, n1 - 0.1, n1 + 0.6, ease.outCubic))), 540, 330, { size: 120, alpha: ca, label: 'BANGAU KERTAS' });
  const ta = env(t, n2 - 0.2, b + 0.2, 0.4, 0.3);
  K.title(ui, 'SENBAZURU', 540, 360, { size: 92, alpha: ta, kanji: '千羽鶴', sub: 'seribu bangau · satu permohonan' });
});

// --- room helpers
function roomBase(t, mood = MOOD.room) {
  show('room');
  S.scene.background = O.roomBg || (O.roomBg = new THREE.Color('#e3e5dc'));
  S.scene.fog.color.set('#e3e5dc'); S.scene.fog.near = 30; S.scene.fog.far = 90;
  rig.mood(mood);
  rig.aim(v3(ROOM, [0, 1, -1.2]), { r: 4.5, dir: [0.35, 0.7, -0.8], rimDir: [0.4, 0.6, 1] });
}
function patientPose(t, o = {}) {
  O.patient.pose({ armL: o.armL || [-0.5, 0.2], armR: o.armR || [-0.5, 0.2], head: o.head || [0.2, 0.15], lean: o.lean || -0.05, bob: Math.sin(t * 1.3) * 0.004 });
}
function counterFor(t) {
  const s = C.sadako.end - 0.3, k = W('seribu', 'seribu') + 0.15, e = C.seribu.end + 0.1;
  if (t < s) return 0;
  if (t < k) return Math.round(lerp(1, 1000, Math.pow(prog(t, s, k, (x) => x), 2.0)));
  return Math.round(lerp(1000, 1300, prog(t, k + 0.1, e, ease.outCubic)));
}
function glint(ctx, x, y, p) {
  const s = Math.sin(p * Math.PI) * 120;
  ctx.save(); ctx.translate(x, y); ctx.rotate(p * 0.8); ctx.fillStyle = 'rgba(255,248,220,0.95)';
  for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.08, 0); ctx.lineTo(0, s * 0.08); ctx.lineTo(-s * 0.08, 0); ctx.fill(); }
  ctx.restore();
}

// 2. Hospital, Hiroshima 1955: Sadako folds a medicine wrapper into a crane.
shot('sadako', 'seribu', (t, a, b) => {
  roomBase(t, { ...MOOD.room, sunI: 1.9, sun: '#eef0f4' });
  O.friend.visible = false; O.sillCrane.visible = false; O.patient.visible = true;
  O.pile.visible = true; O.pile.count = 4; O.garlands.visible = false;
  O.patch.material.opacity = 0.28;
  const fold = prog(t, W('sadako', 'mulai') - 0.3, b - 0.1);
  const lt = t - a;
  patientPose(t, { head: [0.25, 0.42], armL: [-1.25 + Math.sin(lt * 7) * 0.06 * (fold > 0 && fold < 1), -0.15], armR: [-1.25 - Math.sin(lt * 7) * 0.06 * (fold > 0 && fold < 1), -0.15], lean: 0.12 });
  O.patient.updateMatrixWorld(true);
  const hand = O.patient.hand('L').add(O.patient.hand('R')).multiplyScalar(0.5);
  O.medSheet.visible = fold < 0.75; O.medCrane.visible = fold >= 0.7;
  O.medSheet.position.copy(hand).add(new THREE.Vector3(0.05, 0.03, 0.05)); O.medSheet.rotation.set(-0.5, 0.3, 0);
  O.medSheet.fold(prog(fold, 0, 0.35, ease.inOutCubic), prog(fold, 0.35, 0.7, ease.inOutCubic)); O.medSheet.scale.setScalar(Math.max(0.001, 1 - prog(fold, 0.66, 0.75)));
  const gp = prog(fold, 0.7, 1, ease.outBack);
  O.medCrane.position.copy(hand).add(new THREE.Vector3(0.05, 0.08 + gp * 0.1, 0.08)); O.medCrane.scale.setScalar(0.12 * gp + 0.001);
  O.medCrane.rotation.set(0, 0.8 + t * 0.6, 0); O.medCrane.pose(K.CRANE_POSE.standing);
  const u = prog(t, a, b, ease.inOutSine);
  K.look(S.cam, v3(ROOM, [lerp(1.9, 0.8, u), lerp(1.7, 1.35, u), lerp(2.4, 0.1, u)]), v3(ROOM, [-0.55, lerp(0.95, 0.85, u), -1.3]), { t, drift: 0.012, fov: lerp(50, 44, u) });
  const na = env(t, a + 0.15, b + 0.2, 0.35, 0.3);
  K.tag(ui, 'SADAKO SASAKI', 540, 300, { size: 56, alpha: na, sub: 'Hiroshima · umur 12 tahun', kanji: '禎子' });
  const la = env(t, W('sadako', 'melipat') - 0.1, b + 0.2, 0.3, 0.3);
  K.tag(ui, 'kertas: bungkus obat', 540, 470, { size: 36, alpha: la, rot: 0.02, accent: K.PAL.indigo });
});

// 3. One by one... more than a thousand. The camera pulls back: garlands fill the room.
shot('seribu', 'pergi', (t, a, b) => {
  roomBase(t);
  O.friend.visible = false; O.sillCrane.visible = false; O.patient.visible = true; O.pile.visible = true; O.garlands.visible = true;
  O.medSheet.visible = O.medCrane.visible = false;
  const n = counterFor(t);
  O.garlands.show(n); O.garlands.sway(t); O.pile.count = Math.min(60, 4 + Math.floor(n / 15));
  const lt = t - a, k = W('seribu', 'seribu') + 0.15;
  patientPose(t, { head: [0.3, lerp(0.4, -0.3, prog(t, k, k + 0.7))], armL: [-1.2 + Math.sin(lt * 8) * 0.08, -0.15], armR: [-1.2 - Math.sin(lt * 8) * 0.08, -0.15], lean: 0.05 });
  const u = prog(t, a, b + 0.3, ease.inOutCubic);
  K.look(S.cam, v3(ROOM, [lerp(0.8, 2.6, u), lerp(1.5, 1.3, u), lerp(-0.1, 4.6, u)]), v3(ROOM, [lerp(-0.6, -0.2, u), lerp(1.0, 2.0, u), -1.3]), { t, drift: 0.015, fov: lerp(44, 58, u) });
  const pulse = t > k ? 1 + 0.14 * Math.exp(-(t - k) * 5) : 1;
  K.counter(ui, n, 540, 310, { size: 104 * pulse, alpha: prog(t, a, a + 0.2), label: n >= 1000 ? 'LEBIH DARI SERIBU' : 'BANGAU', plus: n > 1000 });
  K.flecks(ui, t, { n: 50, seed: 8, x: 540, y: 310, spread: 520, life: 1.4, t0: k, size: 16, gravity: 260 });
});

// 4. She is gone at twelve: the bed is empty; the cranes stay; one on the windowsill.
shot('pergi', 'moral', (t, a, b) => {
  roomBase(t, { ...MOOD.room, sunI: 2.3, sun: '#ffe9c8' });
  O.friend.visible = false; O.patient.visible = false; O.pile.visible = true; O.pile.count = 60; O.garlands.visible = true; O.sillCrane.visible = true;
  O.medSheet.visible = O.medCrane.visible = false;
  O.garlands.show(1000); O.garlands.sway(t, 0.035);
  O.patch.material.opacity = 0.4;
  const u = prog(t, a, b + 0.3, ease.inOutSine);
  K.look(S.cam, v3(ROOM, [lerp(-0.3, 0.9, u), lerp(1.35, 1.5, u), lerp(2.9, 1.5, u)]), v3(ROOM, [lerp(0.2, 1.45, u), lerp(1.1, 1.45, u), -2.6]), { t, drift: 0.01, fov: 46 });
  const na = env(t, a + 0.2, b + 0.2, 0.5, 0.3);
  K.tag(ui, 'SADAKO SASAKI', 540, 300, { size: 54, alpha: na, sub: '1943 – 1955', kanji: '禎子' });
  ui.save(); ui.fillStyle = 'rgba(255,246,220,0.8)';
  for (let i = 0; i < 40; i++) { const x = 300 + ((hrand(i, 1) * 600 + t * 12 * (hrand(i, 2) - 0.3)) % 600), y = 500 + ((hrand(i, 3) * 700 + t * 8) % 700); ui.globalAlpha = 0.3 + 0.4 * Math.sin(t * 2 + i) ** 2; ui.fillRect(x, y, 3, 3); }
  ui.restore();
});
// 5. Millions of cranes stream to her monument; the camera rises to the golden crane: DAMAI.
shot('moral', null, (t, a, b) => {
  show('mon', 'flock'); sky('dawn', '#f8dcc0', 30, 120); rig.mood(MOOD.dawn);
  rig.aim(v3(MON, [0, 4, 0]), { r: 9, dir: [0.5, 0.8, 0.9], rimDir: [-0.5, 0.4, -1] });
  const u = prog(t, a, C.moral.end + 0.3, ease.inOutSine);
  K.look(S.cam, v3(MON, [lerp(4.5, 1.6, u), lerp(1.6, 8.4, u), lerp(11, 6.4, u)]), v3(MON, [0, lerp(3.8, 9.6, u), 0]), { t, drift: 0.02, fov: lerp(56, 50, u) });
  O.statueCrane.rotation.y = -0.3 + Math.sin(t * 0.8) * 0.08;
  const goal = new THREE.Vector3(MON[0], 8.5, MON[2]);
  O.flock.update(t, (i, tt, o) => {
    const lt = tt - a;
    if (i < 220) {
      const ang = (i % 7) / 7 * Math.PI * 2 + 0.4, dur = 3.2, uu = (lt / dur + hrand(i, 1)) % 1;
      const fx_ = MON[0] + Math.sin(ang) * 40, fz = MON[2] + Math.cos(ang) * 40, fy = 5 + hrand(i, 2) * 12;
      const side = (hrand(i, 3) - 0.5) * 7;
      o.x = lerp(fx_, goal.x, uu) + Math.cos(ang) * side * (1 - uu); o.z = lerp(fz, goal.z, uu) - Math.sin(ang) * side * (1 - uu);
      o.y = lerp(fy, goal.y, uu) + Math.sin(uu * Math.PI) * 3;
      o.yaw = Math.atan2(-(goal.z - fz), goal.x - fx_); o.s = 0.42 * (1 - uu * 0.4); o.flap = K.flap(tt, 1.6, hrand(i, 5));
      o.visible = uu < 0.93 && lt > hrand(i, 6) * 0.8;
    } else {
      const r0 = 2.2 + hrand(i, 1) * 3.6, ang = lt * (0.5 + hrand(i, 2) * 0.3) + hrand(i, 3) * 6.28;
      o.x = MON[0] + Math.sin(ang) * r0; o.z = MON[2] + Math.cos(ang) * r0; o.y = 7 + hrand(i, 4) * 6 + lt * 0.5;
      o.yaw = ang + Math.PI; o.bank = -0.3; o.pitch = 0.1; o.s = 0.38; o.flap = K.flap(tt, 1.5, hrand(i, 6));
    }
  });
  const ja = env(t, W('moral', 'jutaan') - 0.15, W('moral', 'damai') - 0.2, 0.3, 0.3);
  K.counter(ui, Math.round(lerp(0, 10000000, prog(t, W('moral', 'jutaan') - 0.15, W('moral', 'jutaan') + 0.8, ease.outCubic))), 540, 330, { size: 90, alpha: ja, label: '± BANGAU SETIAP TAHUN' });
  const gt = W('moral', 'membawa');
  if (t > gt && t < gt + 0.8) { const [sx, sy] = K.toScreen(S.cam, v3(MON, [0, 9.95, 0.2])); glint(ui, sx, sy, (t - gt) / 0.8); }
  const ta = env(t, W('moral', 'damai') - 0.15, AM.duration + 1, 0.5, 0.1);
  K.title(ui, 'DAMAI', 540, 400, { size: 130, alpha: ta, kanji: '平和', sub: 'untuk Sadako, dan semua anak' });
  K.tag(ui, 'MONUMEN PERDAMAIAN ANAK · HIROSHIMA', 540, 1250, { size: 30, alpha: env(t, a + 0.3, W('moral', 'damai') - 0.2, 0.3, 0.3), accent: K.PAL.gold });
});

// ============================================================ render
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
