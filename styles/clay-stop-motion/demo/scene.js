// Clay Stop Motion demo: "Timun Mas & Buto Ijo", 6 shots on a tabletop diorama, animated on twos.
import * as K from '/styles/clay-stop-motion/kit.js';
const THREE = K.THREE;
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'kids', y: 1440, size: 70 } };

let S, ui, C = {}, D, L;
const Wt = (id, w) => AM.wordTime(id, w);
let mbok, tm, buto, bag, house, cukes = [], bamboo = [], sea, mud, bubbles = [], seeds, salt, terasiB, hearts, back;
const AREA = { home: 0, field: 22, sea: 44, mud: 66 };

function buildSet() {
  D = new THREE.Scene(); D.background = new THREE.Color('#2a2420');
  L = K.studio(D);
  const ground = K.terrain({ w: 110, d: 22, seg: 110, height: (x, z) => noise.fbm2(x * 0.25, z * 0.25, 2) * 0.12 + Math.max(0, -z - 4) * 0.35, color: (x, z, y) => (Math.abs(z - 1.5 + Math.sin(x * 0.3) * 0.3) < 0.7 && x < 14 ? '#d9a86a' : noise.n2(x * 0.4, z * 0.4) > 0.25 ? '#7ab84a' : '#8cc85a') });
  ground.position.x = 30; D.add(ground);
  // table edge under the diorama
  const table = new THREE.Mesh(new THREE.BoxGeometry(112, 1.2, 24), K.toon('#8a5a36', { rough: 0.6 })); table.position.set(30, -0.75, 0); D.add(table);
  back = K.backdrop(120, 26); back.position.set(30, 0, -9); D.add(back);
  house = K.house({ w: 3.2, d: 2.4, h: 1.7 }); house.position.set(-2.6, 0, -2.8); house.rotation.y = 0.2; D.add(house);
  for (let i = 0; i < 16; i++) { const tr = K.tree(i % 3 ? 'round' : 'palm', { seed: i, s: 0.7 + hrand(i, 2) * 0.4, ol: false }); tr.position.set(-8 + i * 5.5 + hrand(i, 3) * 2, 0, -5.5 - hrand(i, 4) * 2.5); K.lumpify(tr, 0.04, 3, i); D.add(tr); }
  // cucumber field (pops up around the giant)
  for (let i = 0; i < 26; i++) {
    const g = new THREE.Group(); const gold = i === 7;
    const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 6, 12), K.toon(gold ? '#f2c230' : '#4f9a2a')); c.rotation.z = Math.PI / 2 + (hrand(i, 1) - 0.5) * 0.6; c.position.y = 0.17; g.add(c);
    for (let k = 0; k < 2; k++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), K.toon('#3f8a2a')); lf.scale.set(1, 0.25, 0.7); lf.position.set((k - 0.5) * 0.4, 0.42, 0.1); lf.rotation.z = (k - 0.5) * 0.8; g.add(lf); }
    const vine = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 6, 14, Math.PI * 1.4), K.toon('#3f8a2a')); vine.position.y = 0.55; g.add(vine);
    K.lumpify(g, 0.02, 8, i);
    const a = hrand(i, 2) * TAU, r = 0.8 + hrand(i, 3) * 3.2; g.position.set(AREA.field - 3 + Math.cos(a) * r, 0, Math.sin(a) * r * 0.6); g.userData.t = hrand(i, 4);
    D.add(g); cukes.push(g);
  }
  for (let i = 0; i < 22; i++) {
    const g = new THREE.Group(); const h = 2.6 + hrand(i, 1) * 2.2;
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, h, 10), K.toon(i % 2 ? '#8dbb4a' : '#6f9e3a')); st.position.y = h / 2; g.add(st);
    for (let k = 1; k < h / 0.6; k++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 6, 12), K.toon('#5f8a2a')); ring.rotation.x = Math.PI / 2; ring.position.y = k * 0.6; g.add(ring); }
    const lf = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), K.toon('#9fcf5a')); lf.scale.set(1.4, 0.3, 0.5); lf.position.set(0.25, h * 0.85, 0); lf.rotation.z = 0.6; g.add(lf);
    K.lumpify(g, 0.015, 6, i + 40);
    g.position.set(AREA.field + 0.2 + (i % 4) * 0.55 + hrand(i, 2) * 0.3, 0, -1.6 + Math.floor(i / 4) * 0.7 + hrand(i, 3) * 0.2); g.userData.t = hrand(i, 4); g.userData.h = h;
    D.add(g); bamboo.push(g);
  }
  // sea: clay water slab with lumpy waves (vertices moved per drawing)
  const sg = new THREE.PlaneGeometry(16, 14, 40, 30); sg.rotateX(-Math.PI / 2); sg.userData.base = sg.attributes.position.array.slice();
  sea = new THREE.Mesh(sg, K.toon('#3f9fd6', { rough: 0.35 })); sea.position.set(AREA.sea, 0, 0); D.add(sea);
  const mg = new THREE.CylinderGeometry(4.2, 4.4, 0.4, 40, 1); mud = new THREE.Mesh(mg, K.toon('#6a4426', { rough: 0.45 })); mud.position.set(AREA.mud, -0.1, 0.3); D.add(mud);
  for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), K.toon('#8a5a32', { rough: 0.3 })); b.userData.ph = hrand(i, 1); b.userData.p = [AREA.mud + (hrand(i, 2) - 0.5) * 6, 0.3 + (hrand(i, 3) - 0.5) * 4.5]; D.add(b); bubbles.push(b); }
  // characters
  mbok = K.character({ kind: 'woman', skin: '#d9a07a', top: '#8a5a9a', trim: '#e0b040', hair: 'bun', hairC: '#c9c2b8', hairHi: '#ffffff', eye: '#3a2210', skirtMap: K.batikTex('#5a3a22', '#2a1508', '#d9a050', 'kawung') });
  tm = K.character({ kind: 'kid', skin: '#f0c098', top: '#f2b630', bottom: '#f2b630', skirt: 'long', hair: 'bun', lashes: true, eye: '#5a3418', skirtMap: K.batikTex('#e8a020', '#a85a10', '#fff0b0', 'parang'), scarf: '#3fae5a' });
  buto = K.giant();
  for (const c of [mbok, tm, buto]) K.lumpify(c.root, 0.006, 14, 3);
  bag = new THREE.Group(); { const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), K.toon('#a0703a')); b.scale.set(1, 1.15, 0.9); b.position.y = -0.1; bag.add(b); const tie = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 6, 12), K.toon('#d93a2a')); tie.rotation.x = Math.PI / 2; tie.position.y = 0.0; bag.add(tie); K.lumpify(bag, 0.01, 10, 2); }
  tm.j.handR.add(bag);
  D.add(mbok.root, tm.root, buto.root);
  seeds = K.burst({ n: 18, color: '#f6e8a0', size: 0.12, speed: 2.5, up: 2.5, grav: -6, life: 0.7, seed: 4 }); D.add(seeds);
  salt = K.burst({ n: 40, color: '#ffffff', size: 0.16, speed: 3, up: 3, grav: -6, life: 0.8, seed: 5, additive: true }); D.add(salt);
  terasiB = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.16), K.toon('#5a2a1a')); D.add(terasiB);
}

export async function setup(AM) {
  S = K.stage(AM, { pr: 0.66 }); ui = S.ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  buildSet();
  AM.sfx('thud', 0.45, { gain: 0.5, pitch: 0.7 });
  AM.sfx('impact', Wt('hook', 'janji'), { gain: 0.45, pitch: 0.8 });
  AM.sfx('whoosh', C.lari.start + 0.05, { gain: 0.35 });
  AM.sfx('pop', Wt('biji', 'ladang') - 0.1, { gain: 0.45 });
  AM.sfx('swoosh_up', Wt('biji', 'hutan') - 0.2, { gain: 0.4 });
  AM.sfx('bubble', Wt('garam', 'lautan') - 0.1, { gain: 0.45 });
  AM.sfx('bubble', Wt('terasi', 'tenggelam'), { gain: 0.5, pitch: 0.7 });
  AM.sfx('chime', Wt('akhir', 'selamat'), { gain: 0.4 });
}

// ------------------------------------------------------------------ helpers
const span = (id) => { const Ls = SHOTS.filter((x) => C[x.id]); const i = Ls.findIndex((x) => x.id === id); return [C[id].start - 0.12, Ls[i + 1] ? C[Ls[i + 1].id].start - 0.12 : AM.duration + 1]; };
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
function cam(pos, look, fov, t) { const j = (s) => K.jit(t, s, 0.012); K.shootCam(S.cam, [pos[0] + j(1), pos[1] + j(2), pos[2] + j(3)], look, fov); }
/** pose with stop-motion jitter on the root */
function P(c, p, t, seed) { K.pose(c, { ...p, x: (p.x || 0) + K.jit(t, seed, 0.008), z: (p.z || 0) + K.jit(t, seed + 1, 0.008), ry: (p.ry || 0) + K.jit(t, seed + 2, 0.015) }); }
function sky(warm) { const u = back.children[0].material; u.color.set(K.mix('#ffffff', '#ffb27a', warm)); L.key.color.set(K.mix('#fff1dc', '#ffb070', warm)); }
function reset() {
  cukes.forEach((g) => (g.visible = false)); bamboo.forEach((g) => (g.visible = false)); sea.visible = false; mud.visible = false; bubbles.forEach((b) => (b.visible = false));
  seeds.userData.tick(-1); salt.userData.tick(-1); terasiB.visible = false; bag.visible = true;
  for (const c of [mbok, tm, buto]) c.root.visible = true;
}
const scr = (x, y, z) => K.toScreen(S.cam, x, y, z);
function label(txt, x, y, t0, b, t, col = '#ffcf4a', size = 46) { K.nameplate(ui, txt, x, y, { size, alpha: env(t, t0, b, 0.12, 0.2), pop: (t - t0) / 0.3, color: col }); }
function throwPose(t, t0) { const u = clamp((t - t0 + 0.25) / 0.45); return [lerp(-0.4, 2.4, u < 0.5 ? 0 : ease.outCubic((u - 0.5) * 2)) + (u < 0.5 ? -ease.outQuad(u * 2) * 0.6 : 0), 0.3, 0.3]; }

// 1. Hook: the green giant stomps up to the little house and roars for his promise.
shot('hook', (t, a, b) => {
  sky(0.1);
  const walkU = clamp((t - a) / 1.4);
  const roar = env(t, Wt('hook', 'menagih') - 0.1, b, 0.15, 0.2);
  const point = prog(t, Wt('hook', 'Timun') - 0.15, Wt('hook', 'Timun') + 0.15, ease.outBack);
  P(buto, { x: lerp(3.8, 2.3, ease.outQuad(walkU)), ry: -Math.PI / 2 + 0.45, ...(walkU < 1 ? K.walk(t * 1.1, 1) : K.idle(t, 3)), t, lean: walkU < 1 ? 0.1 : 0.15 + roar * 0.1, armR: [lerp(0.2, 1.6, point), 0.2, 0.1], armL: [0.3 + roar * 0.6, 0.6 * roar, 1.2], mouth: roar > 0.2 ? 'open' : 'grin', open: 0.7 + Math.sin(t * 20) * 0.2 * roar, brow: -1, head: [0, -0.15, 0], blink: 0 }, t, 10);
  const cower = clamp((t - a - 0.6) / 0.4);
  P(mbok, { x: -0.4, z: 0.6, ry: 0.9, ...K.idle(t, 4), t, armL: [1.4 * cower, 0.5, 0.6], armR: [0.8, 0.9 * cower, 0.5], wide: cower, brow: 0.8 * cower, mouth: 'open', open: 0.5 * cower, head: [0.2, -0.2, 0], blink: 0 }, t, 20);
  P(tm, { x: -1.15, z: 0.2, ry: 0.7, ...K.idle(t, 5), t, armR: [0.6, 0.2, 1.4], armL: [1.0 * cower, 0.4, 1.6], wide: cower, brow: 0.9 * cower, mouth: 'open', open: 0.4, head: [0.25, -0.25, 0.1], blink: 0 }, t, 30);
  bag.visible = false;
  const p = (t - a) / (b - a);
  cam([lerp(1.7, 1.3, p), lerp(0.9, 1.1, p), lerp(8.6, 7.8, p)], [1.1, 2.0, 0], 46, t);
  S.render(D);
  K.tiltShift(ui, S.canvas, { band: 0.28 });
  K.nameplate(ui, 'BUTO IJO', 540, 260, { size: 64, alpha: env(t, 0.15, b, 0.12, 0.2), pop: (t - 0.15) / 0.3, color: '#9fe86a' });
  if (roar > 0.1) K.title(ui, 'JANJI!', 540, 420, { size: 120, pop: (t - Wt('hook', 'janji')) / 0.3, alpha: roar, rot: Math.sin(t * 24) * 0.03, fill: ['#e8ffd0', '#6fd03a'], stroke: '#1e3a0a' });
});

// 2. Timun Mas runs with the magic pouch; the giant lumbers after her.
shot('lari', (t, a, b) => {
  sky(0.15);
  const u = (t - a) / (b - a);
  const x = lerp(1, 11, u);
  P(tm, { x, z: 1.4, ry: Math.PI / 2, ...K.walk(t * 2.6, 1, { run: true }), t, armR: [1.1, 0.2, 1.2], mouth: 'open', open: 0.5, brow: 0.6, wide: 0.3, head: [-0.3, 0, 0] }, t, 30);
  P(buto, { x: x - 3.2, z: 0.2, ry: Math.PI / 2, ...K.walk(t * 1.3, 1), t, armR: [1.4, 0.3, 0.2], armL: [1.2, 0.3, 0.3], mouth: 'open', open: 0.6, brow: -1, blink: 0 }, t, 10);
  mbok.root.visible = false;
  cam([x - 0.9, 1.9, 10.5], [x - 1.4, 1.5, 0.5], 42, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('TIMUN MAS', 540, 260, a + 0.05, b, t, '#ffd23a', 60);
  const hp = tm.j.handR.getWorldPosition(new THREE.Vector3()); const [hx, hy] = scr(hp.x, hp.y - 0.1, hp.z);
  if (t > Wt('lari', 'kantong') - 0.15) K.pointer(ui, 'KANTONG AJAIB', 540, 520, hx, hy, { size: 42, alpha: env(t, Wt('lari', 'kantong') - 0.15, b, 0.15, 0.2) });
});

// 3. Seeds become a cucumber field around the giant; needles shoot up a bamboo forest.
shot('biji', (t, a, b) => {
  sky(0.2);
  mbok.root.visible = false;
  const tS = Wt('biji', 'Biji'), tF = Wt('biji', 'ladang') - 0.25, tN = Wt('biji', 'Jarum'), tB = Wt('biji', 'hutan') - 0.2;
  const X = AREA.field;
  P(tm, { x: X + 2.5, z: 1.0, ry: -Math.PI / 2 + 0.5, ...K.idle(t, 6), t, armR: t < tN - 0.2 ? throwPose(t, tS + 0.1) : throwPose(t, tN + 0.1), mouth: 'open', open: 0.4, head: [0.2, 0, 0] }, t, 30);
  const tangled = clamp((t - tF) / 0.6);
  P(buto, { x: X - 2.3, z: 0.2, ry: Math.PI / 2 - 0.3, ...(tangled > 0 ? K.idle(t, 3) : K.walk(t * 1.3, 1)), t, armR: [1.2 + Math.sin(t * 9) * 0.3 * tangled, 0.6, 0.4], armL: [1.0 - Math.sin(t * 9) * 0.3 * tangled, 0.6, 0.4], mouth: 'open', open: 0.6, brow: tangled > 0 ? 0.6 : -1, wide: tangled * 0.6, head: [Math.sin(t * 7) * 0.3 * tangled, 0.2 * tangled, 0], blink: 0 }, t, 10);
  const hp = tm.j.handR.getWorldPosition(new THREE.Vector3());
  seeds.position.copy(hp); seeds.userData.tick(t - tS - 0.15);
  cukes.forEach((g) => { const u = clamp((t - tF - g.userData.t * 0.5) / 0.3); g.visible = u > 0; g.scale.setScalar(Math.max(0.01, ease.outBack(u, 3))); g.rotation.y = K.jit(t, g.id, 0.05); });
  bamboo.forEach((g) => { const u = clamp((t - tB - g.userData.t * 0.4) / 0.3); g.visible = u > 0; g.scale.set(1, Math.max(0.01, ease.outBack(u, 1.5)), 1); g.rotation.z = K.jit(t, g.id, 0.03); });
  const p = (t - a) / (b - a);
  cam([X + lerp(0.4, 0.1, p), lerp(2.4, 2.8, p), lerp(13, 12.2, p)], [X + 0.5, 1.5, 0], 44, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('BIJI TIMUN ➜ LADANG', 540, 250, tF, b, t, '#9fe86a', 42);
  label('JARUM ➜ HUTAN BAMBU', 540, 350, tN - 0.05, b, t, '#cfe86a', 42);
});

// 4. Salt becomes a sea; the giant swims after her anyway.
shot('garam', (t, a, b) => {
  sky(0.3);
  mbok.root.visible = false;
  const X = AREA.sea, tT = Wt('garam', 'Garam'), tSea = Wt('garam', 'lautan') - 0.3;
  const rise = ease.outCubic(clamp((t - tSea) / 0.5));
  sea.visible = rise > 0; sea.position.y = lerp(-0.6, 0.35, rise);
  const g = sea.geometry, pa = g.attributes.position, base = g.userData.base, tq = Math.floor(t * 12) / 12;
  for (let i = 0; i < pa.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; pa.setY(i, (Math.sin(x * 1.3 + tq * 3) * 0.12 + Math.sin(z * 1.7 - tq * 2.4) * 0.1 + noise.n2(x * 0.8, z * 0.8) * 0.08) * rise); }
  pa.needsUpdate = true; g.computeVertexNormals();
  P(tm, { x: X + 3.2, z: 1.8, ry: -Math.PI / 2 + 0.6, ...K.idle(t, 6), t, armR: throwPose(t, tT + 0.1), mouth: 'open', open: 0.4 }, t, 30);
  const hp = tm.j.handR.getWorldPosition(new THREE.Vector3()); salt.position.copy(hp); salt.userData.tick(t - tT - 0.15);
  const swim = clamp((t - tSea - 0.3) / (b - tSea));
  const stroke = Math.sin(t * 7);
  P(buto, { x: X - 2.6 + swim * 3, y: lerp(0, -1.55, rise), z: 0.2, ry: Math.PI / 2, t, armR: [2.6 + stroke * 0.6, 0.3, 0.3], armL: [2.6 - stroke * 0.6, 0.3, 0.3], mouth: 'open', open: 0.5 + stroke * 0.2, brow: -1, head: [0, -0.3, 0], blink: 0, lean: 0.4 * rise }, t, 10);
  const p = (t - a) / (b - a);
  cam([X + lerp(0.4, 0.8, p), lerp(3.4, 3.0, p), lerp(13.5, 12.5, p)], [X + 0.9, 1.0, 0], 44, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('GARAM ➜ LAUTAN', 540, 250, tSea, b, t, '#9fdcff', 46);
  if (t > Wt('garam', 'terus') - 0.1) K.title(ui, 'MASIH MENGEJAR!', 540, 400, { size: 72, pop: (t - Wt('garam', 'terus') + 0.1) / 0.3, alpha: env(t, Wt('garam', 'terus') - 0.1, b, 0.1, 0.2), fill: ['#e8ffd0', '#6fd03a'], stroke: '#1e3a0a' });
});

// 5. Shrimp paste becomes a boiling mud lake; the giant sinks, one last bubble.
shot('terasi', (t, a, b) => {
  sky(0.5);
  mbok.root.visible = false;
  const X = AREA.mud, tT = Wt('terasi', 'terasi'), tMud = Wt('terasi', 'lumpur') - 0.2, tSink = Wt('terasi', 'tenggelam');
  const hp0 = tm.j.handR.getWorldPosition(new THREE.Vector3());
  const fly = clamp((t - tT - 0.1) / 0.5);
  terasiB.visible = fly > 0 && fly < 1; terasiB.position.set(lerp(hp0.x, X, fly), hp0.y + Math.sin(fly * Math.PI) * 1.5 - fly * hp0.y, lerp(hp0.z, 0.3, fly)); terasiB.rotation.set(t * 8, t * 6, 0);
  const m = ease.outBack(clamp((t - tMud) / 0.4), 1.5); mud.visible = m > 0; mud.scale.set(Math.max(0.01, m), 1, Math.max(0.01, m));
  bubbles.forEach((bb, i) => { const ph = ((Math.floor(t * 12) / 12) * 0.9 + bb.userData.ph) % 1; bb.visible = m > 0.8; bb.position.set(bb.userData.p[0], 0.1, bb.userData.p[1]); bb.scale.setScalar(ph < 0.85 ? ph * 1.3 : 0.01); });
  P(tm, { x: X + 3.0, z: 1.9, ry: -Math.PI / 2 + 0.6, ...K.idle(t, 6), t, armR: throwPose(t, tT + 0.05), mouth: t > tSink ? 'grin' : 'open', open: 0.4, wide: t > tSink ? 0 : 0.4 }, t, 30);
  const sink = ease.inQuad(clamp((t - tMud - 0.3) / (tSink - tMud - 0.1)));
  P(buto, { x: X - 1.0, y: lerp(0, -5.4, sink), z: 0.2, ry: 0.5, t, armR: [2.9, 0.4 + Math.sin(t * 10) * 0.2, 0.2], armL: [2.5 + Math.sin(t * 8) * 0.3, 0.5, 0.3], mouth: 'open', open: 0.9, wide: 1, brow: 0.9, head: [0, -0.4, 0], blink: 0 }, t, 10);
  buto.j.shadow.visible = false;
  const p = (t - a) / (b - a);
  cam([X + lerp(1.0, 0.8, p), lerp(3.6, 3.2, p), lerp(13.5, 12.5, p)], [X + 1.2, 1.2, 0], 44, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  label('TERASI ➜ LUMPUR', 540, 250, tMud - 0.1, b, t, '#e8b07a', 50);
  if (t > tSink) K.title(ui, 'BLUP!', 540, 420, { size: 120, pop: (t - tSink) / 0.3, alpha: env(t, tSink, b, 0.05, 0.2), fill: ['#ffe8c8', '#a8693d'], stroke: '#3a1a08' });
});

// 6. Home at sunset: Timun Mas runs into Mbok Srini's arms.
shot('akhir', (t, a, b) => {
  sky(0.85); buto.root.visible = false; bag.visible = false;
  const run = clamp((t - a) / 0.9);
  const hug = prog(t, a + 0.75, a + 1.1, ease.outCubic);
  P(mbok, { x: -0.2, z: 0.6, ry: Math.PI / 2 - 0.3, ...K.idle(t, 4), t, armL: [1.4 * hug + 0.2, 0.4, 0.9 * hug], armR: [1.4 * hug + 0.2, 0.4, 0.9 * hug], mouth: 'grin', blush: 0.6, head: [0, 0.1, -0.1], blink: hug > 0.9 ? 0.9 : K.blinkAt(t, 4) }, t, 20);
  P(tm, { x: lerp(4, 0.75, ease.outQuad(run)), z: 0.65, ry: -Math.PI / 2 + 0.3, ...(run < 1 ? K.walk(t * 2.6, 1, { run: true }) : K.idle(t, 6)), t, armL: [1.5 * hug, 0.4, 0.8 * hug], armR: [1.5 * hug, 0.4, 0.8 * hug], mouth: 'grin', blush: 0.6, blink: hug > 0.9 ? 0.9 : 0 }, t, 30);
  const p = clamp((t - a) / (AM.duration - a));
  cam([lerp(1.6, 1.0, p), lerp(1.5, 1.4, p), lerp(6.4, 5.2, p)], [0.3, 1.0, 0], 42, t);
  S.render(D);
  K.tiltShift(ui, S.canvas);
  const ts = Wt('akhir', 'selamat') - 0.2;
  K.title(ui, 'TIMUN MAS', 540, 280, { size: 112, alpha: env(t, ts, AM.duration + 1, 0.15, 0.1), pop: (t - ts) / 0.35, fill: ['#fff6c0', '#f2b630'], stroke: '#5a2a00' });
  if (hug > 0.5) { for (let i = 0; i < 4; i++) { const u = ((t - a - 1.0) * 0.6 + i * 0.25) % 1; if (u < 0) continue; drawHeart(540 + Math.sin(u * 6 + i * 2) * 60 + (i - 1.5) * 60, 820 - u * 300, 40 * (1 - u * 0.4), 1 - u); } }
  const fade = clamp((t - (AM.duration - 0.4)) / 0.4); if (fade > 0) { ui.fillStyle = `rgba(20,10,0,${fade})`; ui.fillRect(0, 0, 1080, 1920); }
});
function drawHeart(x, y, s, a) { if (a <= 0) return; ui.save(); ui.globalAlpha = a; ui.translate(x, y); ui.fillStyle = '#ff5a7a'; ui.strokeStyle = '#6a1020'; ui.lineWidth = s * 0.12; ui.beginPath(); ui.moveTo(0, s * 0.35); ui.bezierCurveTo(-s, -s * 0.3, -s * 0.4, -s, 0, -s * 0.45); ui.bezierCurveTo(s * 0.4, -s, s, -s * 0.3, 0, s * 0.35); ui.closePath(); ui.fill(); ui.stroke(); ui.restore(); }

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
