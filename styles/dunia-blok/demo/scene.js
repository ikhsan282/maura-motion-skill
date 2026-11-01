// Dunia Blok demo: "Membangun Borobudur Blok demi Blok", 5 shots timed to the narration (≤ 20 s).
import * as K from '/styles/dunia-blok/kit.js';
const THREE = K.THREE;
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'pixel', y: 1470, size: 38 } };

let S, ui, C = {}, W;
const Wt = (id, w) => AM.wordTime(id, w);
let sky, key, hemi, slabs = [], stupas, main, plan, leaves, pile, rain, ash, lava, smoke, workers = [], lockA, lockB, sparkle;

function buildWorld() {
  W = new THREE.Scene(); W.fog = new THREE.Fog('#cfe8ff', 90, 280);
  sky = K.skyDome(); W.add(sky);
  hemi = new THREE.HemisphereLight('#d8ecff', '#6a5a3a', 1.1); W.add(hemi);
  key = new THREE.DirectionalLight('#fff0d0', 2.0); key.position.set(40, 60, 30); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 10, far: 180 }); key.shadow.bias = -0.0008;
  W.add(key, key.target);
  // Kedu plain: grass ground, sawah patches, paths, trees, two volcanoes
  const g = K.vbox(400, 2, 400, 'grass', { cast: false }); g.position.y = -1; W.add(g);
  for (let i = 0; i < 14; i++) { const x = (hrand(i, 1) - 0.5) * 220, z = (hrand(i, 2) - 0.5) * 220; if (Math.hypot(x, z) < 40) continue; const s = K.vbox(8 + (hrand(i, 3) * 10 | 0), 0.2, 6 + (hrand(i, 4) * 8 | 0), 'sawah', { cast: false }); s.position.set(Math.round(x), 0.05, Math.round(z)); W.add(s); }
  const path = K.vbox(5, 0.2, 60, 'sand', { cast: false }); path.position.set(0, 0.05, 50); W.add(path);
  for (let i = 0; i < 40; i++) { const a = hrand(i, 5) * TAU, r = 34 + hrand(i, 6) * 70; const t = K.voxTree(2 + (hrand(i, 7) * 3 | 0), i, { palm: i % 3 === 0 }); t.position.set(Math.round(Math.cos(a) * r), 0, Math.round(Math.sin(a) * r)); W.add(t); }
  const v1 = K.volcano({ r: 40, h: 30, steps: 12 }); v1.group.position.set(90, 0, -210); W.add(v1.group);
  const v2 = K.volcano({ r: 40, h: 32, steps: 12, top: 'rock' }); v2.group.position.set(-70, 0, -190); W.add(v2.group);
  lava = K.cubeBurst({ n: 50, type: 'lava', size: 2.2, speed: 14, up: 34, grav: -22, life: 2.2, seed: 4, origin: [90, 30, -210] }); W.add(lava);
  smoke = K.cubeBurst({ n: 26, type: 'ash', size: 4, speed: 4, area: 10, height: 40, rain: false, up: 16, grav: 2, life: 3, seed: 8, origin: [90, 31, -210] }); W.add(smoke);
  // Borobudur
  plan = K.borobudurPlan({ base: 20 });
  slabs = K.borobudurSlabs(plan); slabs.forEach((s) => W.add(s));
  stupas = K.stupaMesh(72); W.add(stupas);
  main = K.mainStupa(); main.position.y = plan.mainY; W.add(main);
  // jungle that swallows the temple, then flies off
  leaves = new K.Blocks({ drop: 3, dur: 0.3 });
  const T0 = 11.7;
  for (let i = 0; i < 520; i++) {
    const L = plan.levels[Math.floor(hrand(i, 1) * plan.levels.length)];
    let x, z; if (L.round) { const a = hrand(i, 2) * TAU, r = L.hs * Math.sqrt(hrand(i, 3)); x = Math.cos(a) * r; z = Math.sin(a) * r; } else { const e = Math.floor(hrand(i, 2) * 4), u = (hrand(i, 3) - 0.5) * 2 * L.hs; x = e < 2 ? (e ? 1 : -1) * L.hs : u; z = e < 2 ? u : (e === 2 ? 1 : -1) * L.hs; }
    const y = L.y + L.h + (hrand(i, 4) > 0.6 ? 1 : 0) + (L.round ? 1 : 0.6);
    const d = Math.hypot(x, z) / 22, ty = (y / 20);
    leaves.add(Math.round(x), Math.round(y), Math.round(z), hrand(i, 5) > 0.3 ? 'leaf' : 'grass', T0 + (1 - d) * 0.4 + ty * 1.2 + hrand(i, 6) * 0.5, { tout: 14.15 + ty * 0.5 + hrand(i, 7) * 0.5 });
  }
  leaves.build(W);
  // quarry pile + raining blocks
  pile = new K.Blocks({ drop: 14, dur: 0.5 });
  for (let i = 0; i < 160; i++) { const x = 30 + (i % 8) - 4, z = 26 + (Math.floor(i / 8) % 5) - 2, y = Math.floor(i / 40); pile.add(x, y, z, i % 5 ? 'andesit' : 'andesitDark', 4.0 + i * 0.012 + hrand(i, 1) * 0.3, { spin: 4 }); }
  pile.build(W);
  for (let i = 0; i < 5; i++) { const w = K.worker({ shirt: ['#c8452e', '#2e6ac8', '#e0a020', '#3a9a5a', '#8a3ac8'][i], seed: i }); const blk = K.vbox(0.7, 0.5, 0.7, 'andesit'); blk.position.y = 1.45; w.j.hips.add(blk); W.add(w.root); workers.push(w); }
  // interlocking blocks (close-up): A has a tab, B has a matching notch
  lockA = new THREE.Group(); { const a = K.vbox(3, 2, 2); a.position.set(0, 1, 0); lockA.add(a); const tab = K.vbox(1, 1, 1, 'andesitDark'); tab.position.set(0, -0.5, 0); lockA.add(tab); }
  lockB = new THREE.Group(); { for (const [w, h, d, x, y, z] of [[1, 2, 2, -1, 1, 0], [1, 2, 2, 1, 1, 0], [1, 1, 2, 0, 0.5, 0], [1, 1, 0.5, 0, 1.5, 0.75], [1, 1, 0.5, 0, 1.5, -0.75]]) { const b = K.vbox(w, h, d); b.position.set(x, y, z); lockB.add(b); } }
  lockA.position.set(140, 0, 0); lockB.position.set(140, 0, 0); W.add(lockA, lockB);
  sparkle = K.cubeBurst({ n: 24, type: 'gold', size: 0.18, speed: 3, up: 4, grav: -8, life: 0.8, seed: 3, origin: [140, 2.1, 0.8] }); W.add(sparkle);
  ash = K.cubeBurst({ n: 120, type: 'ash', size: 0.35, speed: 9, rain: true, area: 90, height: 40, seed: 5, origin: [0, 0, 0] }); W.add(ash);
}

export async function setup(AM) {
  S = K.stage(AM, { pr: 0.7 }); ui = S.ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  buildWorld();
  AM.sfx('drum_hit', 0.35, { gain: 0.45 });
  AM.sfx('stamp', Wt('hook', 'semen'), { gain: 0.5 });
  AM.sfx('coin', Wt('batu', 'sejuta') + 0.3, { gain: 0.35 });
  AM.sfx('click', Wt('batu', 'mengunci') + 0.05, { gain: 0.6 });
  AM.sfx('powerup', Wt('lapis', 'tujuh'), { gain: 0.35 });
  AM.sfx('boom', Wt('hutan', 'ditinggalkan'), { gain: 0.45 });
  AM.sfx('swoosh_up', C.akhir.start + 0.05, { gain: 0.4 });
  AM.sfx('chime', Wt('akhir', 'Borobudur'), { gain: 0.45 });
}

// ------------------------------------------------------------------ world state helpers
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
function cam(pos, look, fov, t, amp = 0.15) { const d = [noise.n2(t * 0.4, 1) * amp, noise.n2(t * 0.37, 2) * amp * 0.6, noise.n2(t * 0.33, 3) * amp]; K.shootCam(S.cam, [pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]], look, fov); sky.position.copy(S.cam.position); }
function daySky(warm = 0, dark = 0) {
  K.setSky(sky, { top: K.mix(K.mix('#4a8fe8', '#5a5fb0', warm), '#4a4a58', dark), bot: K.mix(K.mix('#cfe8ff', '#ffc890', warm), '#8a8580', dark), sun: [0.5, 0.25 - warm * 0.15, -1], sunC: K.mix('#fff2c0', '#ffd27a', warm), stars: 0 });
  W.fog.color.set(K.mix(K.mix('#cfe8ff', '#ffd0a0', warm), '#8a8580', dark));
  key.color.set(K.mix(K.mix('#fff0d0', '#ffc080', warm), '#bdb8b0', dark)); key.intensity = lerp(2.0, 1.2, dark);
  hemi.intensity = lerp(1.1, 0.8, dark);
}
/** Temple state: build = 0..1 over levels (+ stupas + main stupa). Each level rises out of the ground into place. */
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), Sv = new THREE.Vector3();
function temple(t, { levelsT = null, stupaT = null, mainT = null } = {}) {
  slabs.forEach((s, i) => {
    const tt = levelsT ? levelsT[i] : -1; const u = tt < 0 ? 1 : clamp((t - tt) / 0.22);
    s.visible = u > 0; s.position.y = (1 - ease.outBack(u, 1.6)) * -2.5 + (u < 1 ? 0 : 0);
    s.scale.set(1, Math.max(0.01, u), 1);
  });
  let n = 0;
  plan.stupas.forEach((p, i) => {
    const tt = stupaT ? stupaT(i) : -1; const u = tt < 0 ? 1 : clamp((t - tt) / 0.25); if (u <= 0) return;
    V.set(p.x, p.y + (1 - ease.inQuad(u)) * 5, p.z); Sv.setScalar(lerp(0.4, 1, u) * 0.95); Q.identity(); M4.compose(V, Q, Sv); stupas.setMatrixAt(n++, M4);
  });
  stupas.count = n; stupas.instanceMatrix.needsUpdate = true;
  main.children.forEach((b, i) => { const tt = mainT === null ? -1 : mainT + i * 0.12; const u = tt < 0 ? 1 : clamp((t - tt) / 0.3); b.visible = u > 0; b.position.y = [0, 1, 2, 3, 4, 4.8, 5.6][i] + [1, 1, 1, 1, 0.8, 0.8, 1.2][i] / 2 + (1 - ease.inQuad(u)) * 8 + (u >= 1 ? Math.exp(-(t - tt - 0.3) * 12) * Math.sin((t - tt - 0.3) * 40) * 0.1 : 0); });
  return n;
}
function reset() {
  leaves.update(-100); pile.update(-100); ash.userData.tick(-1); lava.userData.tick(-1); smoke.userData.tick(-1); sparkle.userData.tick(-1);
  workers.forEach((w) => (w.root.visible = false)); lockA.visible = lockB.visible = false;
}
const scr = (x, y, z) => K.toScreen(S.cam, x, y, z);

// 1. Hook: the finished temple, the last stones of the main stupa dropping into place. "TANPA SEMEN".
shot('hook', (t, a, b) => {
  daySky(0.15);
  temple(t, { mainT: 0.15 });
  const p = (t - a) / (b - a);
  cam(K.orbit(0, 0, lerp(0.75, 1.1, ease.inOutSine(p)), lerp(80, 72, p), lerp(34, 28, p)), [0, 13, 0], 40, t);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'CANDI BUDDHA', 540, 230, { size: 50, alpha: env(t, Wt('hook', 'Candi') - 0.1, b, 0.15, 0.2), pop: (t - 0.2) / 0.3 });
  K.pixTitle(ui, 'TERBESAR', 540, 320, { size: 70, alpha: env(t, Wt('hook', 'terbesar') - 0.1, b, 0.15, 0.2), pop: (t - Wt('hook', 'terbesar') + 0.1) / 0.3, color: '#ffffff' });
  const sx = Wt('hook', 'tanpa') - 0.05;
  if (t > sx) {
    const u = clamp((t - sx) / 0.25), al = env(t, sx, b, 0.05, 0.2);
    ui.save(); ui.globalAlpha = al; ui.translate(540, 560); ui.scale(ease.outBack(u, 2), ease.outBack(u, 2));
    // pixel cement sack, crossed out
    const px = 12; const sack = ['..XXXXXXXX..', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', 'XXXXXXXXXXXX', '.XXXXXXXXXX.'];
    sack.forEach((row, r) => [...row].forEach((c, k) => { if (c === 'X') { ui.fillStyle = r < 2 ? '#c9c4bb' : '#b0aa9e'; ui.fillRect((k - 6) * px, (r - 4) * px, px, px); } }));
    ui.fillStyle = '#3a3634'; ui.font = "400 18px 'Press Start 2P'"; ui.textAlign = 'center'; ui.fillText('SEMEN', 0, 6);
    const st = clamp((t - sx - 0.25) / 0.15); ui.strokeStyle = '#e8241a'; ui.lineWidth = 18; ui.lineCap = 'square';
    if (st > 0) { ui.beginPath(); ui.moveTo(-90, -70); ui.lineTo(-90 + 180 * st, -70 + 140 * st); ui.moveTo(90, -70); ui.lineTo(90 - 180 * st, -70 + 140 * st); ui.stroke(); }
    ui.restore();
    K.pixPanel(ui, 'TANPA SEMEN!', 540, 720, { size: 34, alpha: al, pop: (t - sx - 0.2) / 0.3, color: '#ffe14a' });
  }
});

// 2. A million andesite stones rain onto the quarry pile; workers haul them. Then the close-up: tab locks into notch.
shot('batu', (t, a, b) => {
  const tLock = Wt('batu', 'dipahat') - 0.15;
  daySky(0.1);
  temple(t, { levelsT: plan.levels.map(() => 99), stupaT: () => 99, mainT: 99 });
  if (t < tLock) {
    const landed = pile.update(t);
    workers.forEach((w, i) => { w.root.visible = true; const ph = (t * 0.25 + i * 0.2) % 1; const x = lerp(30, 10, ph), z = lerp(26, 6 + i * 2, ph); K.workerPose(w, { x, z, ry: Math.atan2(10 - 30, 6 - 26) + Math.PI * 0, walk: t * 1.6 + i * 0.3, carry: 1, t }); });
    const p = (t - a) / (tLock - a);
    cam([lerp(44, 40, p), lerp(9, 8, p), lerp(42, 38, p)], [24, 2, 20], 42, t, 0.1);
    S.render(W);
    // blocks carried on heads: draw small andesite cubes via projection? (kept in 3D: reuse pile for look) — counter in 2D
    ui.setTransform(1, 0, 0, 1, 0, 0);
    const c0 = Wt('batu', 'sejuta') - 0.2; const n = Math.floor(lerp(0, 1000000, ease.outCubic(clamp((t - c0) / 1.0))));
    K.pixTitle(ui, n.toLocaleString('id-ID') + (n >= 1000000 ? '+' : ''), 540, 260, { size: 70, alpha: env(t, c0, tLock, 0.1, 0.15), color: '#ffffff' });
    K.pixPanel(ui, 'BATU ANDESIT', 540, 400, { size: 32, alpha: env(t, Wt('batu', 'andesit') - 0.15, tLock, 0.15, 0.15), pop: (t - Wt('batu', 'andesit') + 0.15) / 0.3, color: '#cfe8ff' });
  } else {
    lockA.visible = lockB.visible = true;
    const lk = Wt('batu', 'mengunci') + 0.05;
    const u = ease.inCubic(clamp((t - tLock - 0.2) / (lk - tLock - 0.2)));
    const shk = t > lk ? Math.exp(-(t - lk) * 10) * 0.12 : 0;
    lockA.position.set(140, 2 + lerp(3.2, 0, u) + shk * Math.sin(t * 60), 0); lockA.rotation.y = (1 - u) * 0.6; lockB.position.set(140, 0, 0);
    sparkle.userData.tick(t - lk);
    const p = (t - tLock) / (b - tLock);
    cam([140 + lerp(2.8, 1.8, p), lerp(5.0, 4.4, p), lerp(11.5, 10.2, p)], [140, 2.4, 0], 40, t, 0.05);
    S.render(W);
    ui.setTransform(1, 0, 0, 1, 0, 0);
    const [ax, ay] = scr(140, lockA.position.y - 0.5, 0.5), [bx, by] = scr(140, 1.5, 0.75);
    if (t < lk) { K.pixPanel(ui, 'TONJOLAN', 280, ay, { size: 26, alpha: env(t, tLock + 0.1, lk, 0.15, 0.1), color: '#ffe14a' }); K.pixPanel(ui, 'LEKUKAN', 800, by, { size: 26, alpha: env(t, tLock + 0.3, lk, 0.15, 0.1), color: '#ffe14a' }); }
    else { K.pixTitle(ui, 'KLIK!', 540, 330, { size: 110, pop: (t - lk) / 0.25 }); K.pixPanel(ui, 'TERKUNCI', 540, 480, { size: 34, pop: (t - lk - 0.15) / 0.3, color: '#7fff7f' }); }
  }
});

// 3. Time-lapse build: foot, body, head rise layer by layer; 72 stupas pop in with a counter; main stupa caps it.
shot('lapis', (t, a, b) => {
  const s0 = a + 0.1, s1 = Wt('lapis', 'tujuh') - 0.15;
  const levelsT = plan.levels.map((L, i) => s0 + i * ((s1 - s0) / plan.levels.length));
  const st0 = Wt('lapis', 'tujuh'), st1 = Wt('lapis', 'stupa') + 0.2;
  const stupaT = (i) => st0 + (i / 72) * (st1 - st0);
  const mainT = st1 + 0.05;
  const cyc = clamp((t - a) / (b - a)); const night = Math.max(0, Math.sin(cyc * TAU * 2.5)) * 0.6;
  daySky(0.2, 0); K.setSky(sky, { top: K.mix('#4a8fe8', '#141a40', night), bot: K.mix('#cfe8ff', '#3a4070', night), stars: night, sun: [Math.cos(cyc * TAU * 2.5), Math.sin(cyc * TAU * 2.5) * 0.6 + 0.2, -0.6] });
  key.intensity = lerp(2.0, 0.7, night); W.fog.color.set(K.mix('#cfe8ff', '#3a4070', night));
  const n = temple(t, { levelsT, stupaT, mainT });
  const p = (t - a) / (b - a);
  cam(K.orbit(0, 0, lerp(1.9, 2.6, p), 60, 26), [0, 6 + p * 3, 0], 40, t);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  const lab = (txt, i0, y, col) => { const tt = levelsT[i0]; const L = plan.levels[i0]; const [x, sy] = scr(L.hs + 1, L.y + 1, L.hs + 1); K.pixPanel(ui, txt, 540, y, { size: 30, alpha: env(t, tt, b, 0.12, 0.2), pop: (t - tt) / 0.25, color: col }); };
  lab('KAKI', 0, 250, '#cfe8ff'); lab('TUBUH', 1, 360, '#ffe14a'); lab('KEPALA', 6, 470, '#7fff7f');
  if (t > st0 - 0.1) { K.pixTitle(ui, `${Math.min(72, n)} STUPA`, 540, 640, { size: 56, pop: (t - st0 + 0.1) / 0.3, color: n >= 72 ? '#ffe14a' : '#ffffff' }); }
});

// 4. Abandoned: the volcano erupts, ash rains, the jungle swallows the temple block by block.
shot('hutan', (t, a, b) => {
  const dark = prog(t, a, a + 0.8, ease.inOutSine);
  daySky(0.1, dark * 0.8);
  temple(t);
  leaves.update(t);
  lava.userData.tick(t - Wt('hutan', 'ditinggalkan') + 0.1); smoke.userData.tick((t - a) * 0.8);
  ash.userData.tick(t - a);
  const p = (t - a) / (b - a);
  cam([lerp(-30, -24, p), lerp(30, 24, p), lerp(52, 46, p)], [6, 6, -10], 42, t, 0.2);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  K.pixTitle(ui, 'DITINGGALKAN...', 540, 260, { size: 48, alpha: env(t, Wt('hutan', 'ditinggalkan') - 0.1, b, 0.15, 0.2), pop: (t - Wt('hutan', 'ditinggalkan') + 0.1) / 0.3, color: '#cfcfcf' });
  K.pixPanel(ui, 'TERTELAN HUTAN', 540, 400, { size: 30, alpha: env(t, Wt('hutan', 'tertelan') - 0.1, b, 0.15, 0.2), pop: (t - Wt('hutan', 'tertelan') + 0.1) / 0.3, color: '#7fff7f', bg: '#0a2a0a' });
});

// 5. The jungle blocks burst away: every stone still locked. Sunrise, BOROBUDUR. Hold.
shot('akhir', (t, a, b) => {
  const warm = 0.55;
  daySky(warm, clamp(1 - (t - a) / 0.8) * 0.6);
  temple(t);
  leaves.update(t);
  const p = clamp((t - a) / (AM.duration - a));
  cam([lerp(-40, -34, p), lerp(8, 10, p), lerp(66, 58, p)], [0, lerp(11, 12, p), 0], 40, t, 0.08);
  S.render(W);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  const tb = Wt('akhir', 'terkunci') - 0.1;
  K.pixPanel(ui, 'MASIH TERKUNCI', 540, 470, { size: 30, alpha: env(t, tb, Wt('akhir', 'Borobudur') - 0.05, 0.12, 0.15), pop: (t - tb) / 0.3, color: '#7fff7f' });
  const tB = Wt('akhir', 'Borobudur') - 0.1;
  K.pixTitle(ui, 'BOROBUDUR', 540, 280, { size: 84, alpha: env(t, tB, AM.duration + 1, 0.12, 0.1), pop: (t - tB) / 0.35 });
  K.pixPanel(ui, '±1.200 TAHUN', 540, 430, { size: 30, alpha: env(t, Wt('akhir', 'berdiri') - 0.1, AM.duration + 1, 0.15, 0.1), pop: (t - Wt('akhir', 'berdiri') + 0.1) / 0.3, color: '#ffe14a' });
  const fade = clamp((t - (AM.duration - 0.4)) / 0.4); if (fade > 0) { ui.fillStyle = `rgba(0,0,0,${fade})`; ui.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  reset();
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  sky.position.copy(S.cam.position);
  s.fn(t, Math.max(0, a), b);
  sky.position.copy(S.cam.position);
  const since = t - Math.max(0, a);
  K.finish(ui, AM, t, { flash: s.id !== 'hook' && since < 0.12 ? 0.35 * (1 - since / 0.12) : 0 });
}
