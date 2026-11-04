// Origami demo-kucing: "Kucing Origami" — selembar kertas putih lipat jadi kucing kecil,
// telinga menegak, ekor tumbuh dari ujung, lalu melompat ke langit pagi.
// Pola demo bawaan: paperGround + fold sheet → creature + flock + camera follow, tapi ringkas.
import * as K from '/styles/origami/kit.js';
import * as THREE from 'three';
const { clamp, lerp, ease, prog, env, hrand, mulberry32 } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'elegant', y: 1440, size: 62 } };

let S, rig, ui, fx;
const C = {}, SET = {}, O = {};
const LAND = [0, 0, 0];
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
    day: K.skyTexture({ top: '#bcd7e6', low: '#f6efe0', glow: '#fffaf0', gy: 0.6, seed: 9 }),
  };
  S.scene.fog = new THREE.Fog('#f6e9d6', 30, 120);
  buildLand();
  O.flock = K.makeFlock(420, { seed: 12 }); S.scene.add(O.flock);
  O.hero = K.makeCrane({ tex: K.washi( 'plain', '#eae5d9', '#f7f3eb', { repeat: [1.2, 1.2] } ) }); S.scene.add(O.hero);
  O.sheet = K.makeFoldSheet({ tex: K.washi('plain', '#eae5d9', '#f7f3eb'), back: K.washi('crease', K.PAL.white, 'rgba(150,120,90,0.35)'), h: 0.7 }); S.scene.add(O.sheet);
  O.gold = K.makeCrane({ tex: K.washi('plain', '#d9aa45', '#fff', { seed: 4 }), shine: 80 }); S.scene.add(O.gold);

  // ---------- sound ----------
  AM.sfx('paper', 0.02, { gain: 0.5 });
  AM.sfx('paper', 0.5, { gain: 0.45, pitch: 1.15 });
  AM.sfx('magic', W('hook', 'telinga') + 0.2, { gain: 0.35 });
  AM.sfx('swoosh_up', W('akal', 'ekor') + 0.1, { gain: 0.3 });
  AM.sfx('whoosh', W('terbang', 'mencoba') + 0.1, { gain: 0.3 });
  AM.sfx('bell_temple', W('moral', 'kekuatan') + 0.1, { gain: 0.45 });
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
  g.add(K.paperRibbon([[-60, -16], [-25, -12], [-8, -18], [12, -13], [35, -20], [70, -15]], { width: 3.2, y: 0.03 }));
  const sun = K.paperSun({ r: 5, color: '#f39a55', ray: '#f8c58c' }); sun.position.set(9, 21, -95);
  sun.traverse((o) => { if (o.material) o.material.fog = false; }); g.add(sun); O.sun = sun;
  for (let i = 0; i < 9; i++) { const c = K.paperCloud({ w: 6 + r() * 7, seed: i + 3 }); c.position.set(-40 + i * 10 + r() * 6, 9 + r() * 12, -60 - r() * 20); c.traverse((o) => { if (o.material) o.material.fog = false; }); g.add(c); }
}

// ============================================================ per-frame helpers
function show(...names) {
  for (const k in SET) SET[k].visible = names.includes(k);
  for (const k of ['hero', 'sheet', 'gold', 'flock']) O[k].visible = names.includes(k);
}
function sky(name, fogCol, near = 30, far = 120) { S.scene.background = O.sky[name]; S.scene.fog.color.set(fogCol); S.scene.fog.near = near; S.scene.fog.far = far; }
const MOOD = {
  morning: { sun: '#ffe7c4', sunI: 2.6, sky: '#e6ecff', ground: '#ecd7b4', hemiI: 1.35, rim: '#ffd2a3', rimI: 1.1 },
  day: { sun: '#e2ecf7', sunI: 1.8, sky: '#dbe6f2', ground: '#c7c0b3', hemiI: 1.3, rim: '#cfe0f2', rimI: 0.8 },
  dawn: { sun: '#ffc995', sunI: 2.5, sky: '#f1dccb', ground: '#e2c39c', hemiI: 1.2, rim: '#ffbf86', rimI: 1.6 },
};
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

// 1. One white sheet. Top-down: it lies on the folded-paper ground.
shot('hook', 'lipat', (t, a, b) => {
  show('land', 'hero', 'sheet'); sky('morning', '#f6e6d0', 25, 110); rig.mood(MOOD.morning);
  rig.aim([0, 0, 0], { r: 3.5, dir: [0.5, 1, 0.7] });
  O.sheet.visible = t > a + 0.3;
  O.sheet.position.set(0, 0.005, -0.5); O.sheet.rotation.y = 0.3 * t;
  // the cat spins in as a faint paper wavering
  O.hero.visible = t > a + 0.8;
  O.hero.rotation.y = t * 0.9; O.hero.scale.setScalar(0.12); O.hero.position.set(0, 0.8, -0.7);
  const na = env(t, a + 0.15, b + 0.3, 0.35, 0.3);
  K.tag(ui, 'KUCING ORIGAMI', 540, 280, { size: 58, alpha: na, sub: 'lipatan yang terbang', kanji: '白猫' });
  const ta = env(t, W('hook', 'kertas') + 0.3, b + 0.3, 0.25, 0.3);
  K.counter(ui, 1, 540, 1200, { size: 90, alpha: ta, label: 'SELEMBAAR KERTAS PUTIH' });
});

// 2. Fold in half, fold again — the creases stand.
shot('lipat', 'akal', (t, a, b) => {
  show('land', 'hero', 'sheet'); sky('morning', '#f6e6d0', 25, 110); rig.mood(MOOD.morning);
  rig.aim([0, 0, 0], { r: 3.5, dir: [0.5, 1, 0.7] });
  const fold1 = prog(t, a + 0.2, W('lipat', 'dua') + 0.3, ease.inOutCubic);
  const fold2 = prog(t, W('lipat', 'dua') + 0.4, W('lipat', 'sudut') + 0.3, ease.inOutCubic);
  O.sheet.fold(fold1, fold2);
  const rise = prog(t, W('lipat', 'sudut') + 0.2, b - 0.1, ease.inOutCubic);
  O.sheet.position.set(0, 0.005 + rise * 0.9, -0.5 + rise * -0.25);
  O.sheet.rotation.set(-rise * 1.35, 0.6 * rise, 0);
  O.sheet.scale.setScalar(Math.max(0.001, (1 - rise * 0.25)));
  O.sheet.visible = rise < 1;
  const appear = prog(t, W('lipat', 'sudut') + 0.3, b + 0.2, (x) => ease.outBack(x, 2.2));
  const P = K.CRANE_POSE, f = K.CRANE_POSE.folded;
  const flyU = prog(t, W('lipat', 'sudut') + 0.5, b, ease.inOutSine);
  O.hero.visible = t > W('lipat', 'sudut') + 0.4;
  const sc = 0.55 * Math.max(0.001, appear);
  if (t < W('lipat', 'sudut') + 0.8) {
    O.hero.pose({ neck: lerp(f.neck, P.standing.neck, flyU), tail: lerp(f.tail, P.standing.tail, flyU), wing: lerp(f.wing, P.standing.wing, flyU), head: lerp(f.head, P.standing.head, flyU) });
    O.hero.position.set(0, 1.2 + Math.sin(t * 3) * 0.02, -0.9); O.hero.scale.setScalar(sc);
  } else {
    flyAlong(O.hero, [[0, 1.2, -0.9], [0.2, 1.6, -1.6], [1.8, 2.6, -4]], flyU, { s: 0.55, bank: Math.sin(t * 1.3) * 0.15 });
  }
  const na = env(t, a + 0.15, b + 0.3, 0.35, 0.3);
  K.tag(ui, 'TUTUP DUA', 540, 280, { size: 50, alpha: na, sub: 'lipatan origami', kanji: '折鶴' });
  K.counter(ui, 2, 540, 1200, { size: 90, alpha: env(t, W('lipat', 'dua') - 0.1, b + 0.3, 0.25, 0.3), label: 'SUDUT TERBANGUN' });
});

// 3. Tail grows, ears rise: the kitty stands.
shot('akal', 'terbang', (t, a, b) => {
  show('land', 'hero'); sky('morning', '#f6e6d0', 25, 110); rig.mood(MOOD.morning);
  rig.aim([0, 0, 0], { r: 3.5, dir: [0.5, 1, 0.7] });
  O.sheet.visible = false; O.gold.visible = true; O.hero.visible = true;
  O.gold.position.set(0, 0, -1.8); O.gold.scale.setScalar(0.08);
  const wing = prog(t, a, W('akal', 'ekornya'), ease.outBack);
  const head = prog(t, W('akal', 'ekornya'), b - 0.2, ease.inOutCubic);
  O.hero.pose({ neck: lerp(K.CRANE_POSE.standing.neck, 0.3, head), tail: lerp(K.CRANE_POSE.standing.tail, Math.PI - 0.3, head), wing: lerp(K.CRANE_POSE.standing.wing, 1.8, wing), head: lerp(K.CRANE_POSE.standing.head, -0.9, head) });
  O.gold.pose(K.mixPose(K.CRANE_POSE.standing, K.CRANE_POSE.flying, wing * 0.25));
  const u = prog(t, a, b + 0.3, ease.inOutSine);
  K.look(S.cam, [-0.3 + u * 1.2, lerp(1.1, 2.2, u), -1.5 + u * 1.5], [0, lerp(0.8, 2.4, u), -2], { t, drift: 0.012, fov: lerp(48, 55, u) });
  const na = env(t, a + 0.15, b + 0.3, 0.35, 0.3);
  K.tag(ui, 'TULANG MILIK', 540, 280, { size: 50, alpha: na, sub: 'telinga & ekor', kanji: '立耳' });
  K.counter(ui, 3, 540, 1200, { size: 90, alpha: env(t, W('akal', 'ekornya') - 0.1, b + 0.3, 0.25, 0.3), label: 'TUMBUH DI UJUNG' });
});

// 4. One flap and the cat takes flight.
shot('terbang', 'moral', (t, a, b) => {
  show('land', 'hero', 'flock'); sky('day', '#f2e6c9', 30, 120); rig.mood(MOOD.day);
  const u = prog(t, a, b + 0.4, (x) => x * x * (3 - 2 * x) * 0.6 + x * 0.4);
  flyAlong(O.hero, [[0, 2.4, -2], [-0.4, 3.6, -5], [-2, 6, -15], [-6, 9.5, -30]], u, { s: 0.55, bank: Math.sin(t * 1.3) * 0.2 });
  O.flock.update(t, (i, tt, o) => {
    const st = 1.6 + hrand(i, 1) * 3.2, uu = tt - st;
    if (uu < 0 || i > 260) { o.visible = false; return; }
    const lane = hrand(i, 2), sp = 3.2 + hrand(i, 3) * 2;
    o.x = 26 - uu * sp - hrand(i, 4) * 10; o.y = 4 + lane * 10 + Math.sin(uu * 0.8 + i) * 0.4; o.z = -16 - hrand(i, 5) * 34;
    o.yaw = Math.PI + 0.25 * (hrand(i, 6) - 0.5); o.pitch = 0.05; o.bank = Math.sin(uu + i) * 0.1; o.s = 0.55 + hrand(i, 7) * 0.35; o.flap = K.flap(tt, 1.4 + hrand(i, 8) * 0.6, hrand(i, 9), 0.9, 0.2);
  });
  const na = env(t, a + 0.15, b + 0.3, 0.35, 0.3);
  K.tag(ui, 'MELONCAT', 540, 280, { size: 50, alpha: na, sub: 'ke langit pagi', kanji: '猫飛' });
  const ta = env(t, W('terbang', 'mencoba') + 0.2, b + 0.3, 0.3, 0.3);
  K.counter(ui, Math.round(lerp(1, 1000, prog(t, W('terbang', 'mencoba') + 0.2, b, ease.outCubic))), 540, 1200, { size: 90, alpha: ta, label: 'KUCING' });
});

// 5. Flocks stream to the monument: many cranes, one prayer.
shot('moral', null, (t, a, b) => {
  show('land', 'flock', 'gold'); sky('dawn', '#f8dcc0', 30, 120); rig.mood(MOOD.dawn);
  O.gold.position.set(0, 6, -10); O.gold.scale.setScalar(0.8); O.gold.rotation.y = -0.3; O.gold.visible = true;
  O.flock.update(t, (i, tt, o) => {
    if (i < 220) {
      const ang = (i % 7) / 7 * Math.PI * 2 + 0.4, dur = 3.2, uu = (t / dur + hrand(i, 1)) % 1;
      const fx_ = -30 + Math.sin(ang) * 40, fz = -10 + Math.cos(ang) * 40, fy = 5 + hrand(i, 2) * 12;
      const goal = [-30, 7, -10];
      o.x = lerp(fx_, goal[0], uu) + Math.cos(ang) * (hrand(i, 3) - 0.5) * 7 * (1 - uu);
      o.z = lerp(fz, goal[2], uu) - Math.sin(ang) * (hrand(i, 3) - 0.5) * 7 * (1 - uu);
      o.y = lerp(fy, goal[1], uu) + Math.sin(uu * Math.PI) * 3;
      o.yaw = Math.atan2(-(goal[2] - fz), goal[0] - fx_); o.s = 0.42 * (1 - uu * 0.4); o.flap = K.flap(tt, 1.6, hrand(i, 5));
      o.visible = uu < 0.93 && t > hrand(i, 6) * 0.8;
    } else {
      const r0 = 2.2 + hrand(i, 1) * 3.6, ang = t * (0.5 + hrand(i, 2) * 0.3) + hrand(i, 3) * 6.28;
      o.x = -30 + Math.sin(ang) * r0; o.z = -10 + Math.cos(ang) * r0; o.y = 7 + hrand(i, 4) * 6 + t * 0.5;
      o.yaw = ang + Math.PI; o.bank = -0.3; o.pitch = 0.1; o.s = 0.38; o.flap = K.flap(tt, 1.5, hrand(i, 6));
    }
  });
  const u = prog(t, a, b + 0.3, ease.inOutSine);
  K.look(S.cam, [-30 + u * 12, lerp(3.6, 9.4, u), -10 + u * 6.4], [-30, lerp(3.8, 9.6, u), 0], { t, drift: 0.02, fov: lerp(56, 50, u) });
  O.gold.rotation.y = -0.3 + Math.sin(t * 0.8) * 0.08;
  const ja = env(t, W('moral', 'kuat') - 0.15, W('moral', 'trus') - 0.2, 0.3, 0.3);
  K.counter(ui, Math.round(lerp(0, 10000000, prog(t, W('moral', 'kuat') - 0.15, W('moral', 'kuat') + 0.8, ease.outCubic))), 540, 1000, { size: 80, alpha: ja, label: 'KUTING SETIAP TAHUN' });
  const ta = env(t, W('moral', 'trus') - 0.15, AM.duration + 1, 0.5, 0.1);
  K.title(ui, 'DAMAI', 540, 400, { size: 130, alpha: ta, kanji: '平和', sub: 'untuk setiap lipatan kucing' });
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
