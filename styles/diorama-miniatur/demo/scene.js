// Diorama Miniatur demo: "Pasar Terapung Lok Baintan" — a tilt-shift miniature of the floating market on the
// Martapura river at dawn: acil paddling jukung, barter, the sun climbing, the market dispersing, dawn again.
import * as K from '/styles/diorama-miniatur/kit.js';
import * as THREE from 'three';
const { clamp, lerp, ease, prog, env, noise, hrand, mulberry32 } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'bold', y: 1455, size: 68, active: '#ffd166', strokeColor: '#2a160a' } };

let S, W, ui, ts, fx, rip;
const C = {};
const BOATS = [];
const CL = { z: -40 };                       // market cluster centre (z); x follows the river
const cx = (z) => K.riverX(z);

// ---------------------------------------------------------------- fleet
function buildFleet() {
  const r = mulberry32(55);
  const kinds = ['pisang', 'jeruk', 'sayur', 'kue', 'kelapa', 'bakul'];
  // hand-placed heroes + a jittered crowd
  const spots = [
    { x: -3, z: -38, a: 0.35, kinds: ['pisang', 'kelapa', 'jeruk'], baju: '#7b4fa0', hero: 'acil' },
    { x: 5, z: -50, a: 2.6, kinds: ['pisang', 'jeruk', 'sayur', 'kue'], baju: '#2f8f8a', hero: 'dagang' },
    { x: -9, z: -60, a: 1.57, kinds: ['pisang', 'sayur'], baju: '#d0485f', hero: 'barterA' },
    { x: -6.6, z: -60.2, a: -1.57, kinds: ['jeruk', 'kue'], baju: '#e3a82b', hero: 'barterB' },
  ];
  for (let gx = -3; gx <= 3; gx++) for (let gz = -4; gz <= 3; gz++) {
    const x = gx * 5.4 + (r() - 0.5) * 2.2, z = CL.z + gz * 7.8 + (gx % 2 ? 3 : 0) + (r() - 0.5) * 3;
    if (spots.some((s) => Math.hypot((s.x - x) * 1.6, s.z - z) < 7.5)) continue;
    if (r() < 0.14 || Math.abs(x) > 18) continue;
    spots.push({ x, z, a: (r() < 0.5 ? 1.57 : -1.57) + (r() - 0.5) * 0.9, kinds: [kinds[Math.floor(r() * 6)], kinds[Math.floor(r() * 6)], kinds[Math.floor(r() * 6)]].slice(0, 2 + (r() < 0.5 ? 1 : 0)), baju: K.PAL.baju[Math.floor(r() * K.PAL.baju.length)] });
  }
  spots.forEach((sp, i) => {
    const len = 5.6 + hrand(i, 3) * 1.2;
    const g = new THREE.Group();
    const hull = new THREE.Mesh(K.jukungGeo({ len, cargoKinds: sp.kinds, seed: i + 1, wood: i % 3 ? K.PAL.wood : '#6a4426' }), K.MAT.double);
    hull.castShadow = true; hull.receiveShadow = true; g.add(hull);
    const a = K.acil({ baju: sp.baju, sarung: ['#5a3d6e', '#7a2f3a', '#2f4f6e', '#4f5a2a'][i % 4], powder: hrand(i, 9) < 0.4, seed: i });
    a.root.position.set(-len * 0.32, -0.22, 0); g.add(a.root);
    S.scene.add(g);
    BOATS.push({ ...sp, i, len, g, ac: a, sp: 0.05 + hrand(i, 4) * 0.08, ph: hrand(i, 5) * 6.28, side: K.riverX(sp.z) + sp.x > K.riverX(sp.z) ? 1 : -1, delay: hrand(i, 6) * 0.35 });
  });
  // a klotok of visitors drifting at the edge of the market
  const kl = new THREE.Mesh(K.klotokGeo({}), K.MAT.double); kl.castShadow = true; S.scene.add(kl);
  BOATS.klotok = kl;
  // the goods that change hands in the barter shot
  BOATS.gift1 = new THREE.Mesh(K.bake(K.cargo('pisang', 0, 0, 0, 3)), K.MAT.lambert);
  BOATS.gift2 = new THREE.Mesh(K.bake(K.cargo('jeruk', 0, 0, 0, 4)), K.MAT.lambert);
  BOATS.gift1.castShadow = BOATS.gift2.castShadow = true;
  S.scene.add(BOATS.gift1); S.scene.add(BOATS.gift2);
  const e = K.egret(); S.scene.add(e.root); BOATS.egret = e;
}

/** where boat b is at time t, with dispersal d (0 = market, 1 = home at the bank) */
function boatAt(b, t, d = 0) {
  const drift = t * b.sp;
  let x = cx(b.z) + b.x + Math.cos(b.a) * drift * 0.6 + Math.sin(t * 0.21 + b.ph) * 0.8;
  let z = b.z - Math.sin(b.a) * drift * 0.6 + Math.cos(t * 0.17 + b.ph) * 0.6;
  let a = b.a + Math.sin(t * 0.13 + b.ph) * 0.12;
  if (b.hero === 'barterA' || b.hero === 'barterB') { x = cx(b.z) + b.x + Math.sin(t * 0.3) * 0.15; z = b.z + Math.sin(t * 0.25) * 0.2; a = b.a + Math.sin(t * 0.4) * 0.03; }
  const k = ease.inOutCubic(clamp(d * 1.35 - b.delay));
  if (k > 0) {
    const bz = z - 6 + hrand(b.i, 7) * 12, side = b.side;
    const bx = cx(bz) + side * (K.RIVER_W / 2 + 2);
    const nx = lerp(x, bx, k), nz = lerp(z, bz, k);
    const dir = Math.atan2(-(bz - z), bx - x);
    a = lerp(a, dir, clamp(k * 4)) ; x = nx; z = nz;
  }
  return { x, z, a, gone: k };
}

function placeFleet(t, d = 0, opts = {}) {
  const rl = [];
  for (const b of BOATS) {
    const p = boatAt(b, t, d);
    b.g.position.set(p.x, 0.08 + Math.sin(t * 1.7 + b.ph) * 0.04, p.z);
    b.g.rotation.set(Math.sin(t * 1.3 + b.ph) * 0.02, p.a, Math.sin(t * 1.9 + b.ph) * 0.025);
    b.g.visible = p.gone < 0.98;
    const speed = d > 0 && d < 1 ? 2.2 : 1;
    const look = opts.look && opts.look[b.hero] !== undefined ? opts.look[b.hero] : Math.sin(t * 0.35 + b.ph * 2) * 0.25;
    K.acilPose(b.ac, t * 2.1 * speed * (0.85 + hrand(b.i, 8) * 0.3) + b.ph, { amt: opts.rest && opts.rest[b.hero] ? 0.15 : 1, look });
    b.cur = p;
    // ripples from the paddle
    if (b.g.visible) for (let k = 0; k < 3; k++) {
      const per = 1.9, age = (((t + b.ph + k * per / 3) % per) + per) % per / per;
      const ca = Math.cos(p.a), sa = Math.sin(p.a);
      const lx = -b.len * 0.2 - age * 1.2, lz = 1.05;
      rl.push({ x: p.x + lx * ca + lz * sa, z: p.z - lx * sa + lz * ca, age, size: 0.9 });
    }
  }
  // the klotok
  const kz = -24 + Math.sin(t * 0.05) * 3 - t * 0.12, kx = cx(kz) + 15;
  BOATS.klotok.position.set(kx, 0.15 + Math.sin(t * 1.2) * 0.05, kz); BOATS.klotok.rotation.set(0, 1.9 + Math.sin(t * 0.1) * 0.1, Math.sin(t * 1.4) * 0.02);
  BOATS.klotok.visible = d < 0.3;
  rip.set(rl);
}
const boatByHero = (h) => BOATS.find((b) => b.hero === h);
/** world position of a point in boat-local coordinates */
function onBoat(b, lx, ly, lz) {
  const p = b.cur, ca = Math.cos(p.a), sa = Math.sin(p.a);
  return [p.x + lx * ca + lz * sa, ly + 0.1, p.z - lx * sa + lz * ca];
}

// ---------------------------------------------------------------- setup
export async function setup(AM) {
  for (const l of AM.timeline.lines) C[l.id] = l;
  S = K.stage(AM, { pr: 0.7, shadow: 1024, fov: 30, shadowBox: 60 });
  W = K.riverWorld(S, { seed: 7 });
  K.mist(S, { y: 1.2 });
  rip = K.ripples(S, 96);
  buildFleet();
  ts = AM.layer('tilt', { z: 1 });
  ui = AM.layer('ui', { z: 2 });
  fx = AM.layer('fx', { z: 3 });
  const Wd = (id, w) => AM.wordTime(id, w);
  AM.sfx('bird', 0.1, { gain: 0.3 });
  AM.sfx('bird', 1.6, { gain: 0.22, pitch: 1.2 });
  AM.sfx('swoosh_up', C.lokasi.start - 0.1, { gain: 0.3 });
  AM.sfx('pop', Wd('lokasi', 'Lok'), { gain: 0.35 });
  AM.sfx('wind', C.subuh.start, { gain: 0.18 });
  AM.sfx('chime', Wd('subuh', 'enam'), { gain: 0.3 });
  AM.sfx('pop', Wd('acil', 'acil'), { gain: 0.35, pitch: 1.1 });
  AM.sfx('bubble', Wd('jukung', 'mendayung'), { gain: 0.3 });
  AM.sfx('whoosh', C.tanggui.start - 0.1, { gain: 0.25, pitch: 0.8 });
  ['pisang', 'jeruk', 'sayur', 'kue'].forEach((w, i) => AM.sfx('pop', Wd('dagangan', w), { gain: 0.32, pitch: 0.9 + i * 0.12 }));
  AM.sfx('jump', Wd('barter', 'barter') + 0.05, { gain: 0.3 });
  AM.sfx('jump', Wd('barter', 'bapanduk') - 0.2, { gain: 0.3, pitch: 1.2 });
  AM.sfx('page_flip', C.sejarah.start, { gain: 0.35 });
  AM.sfx('tick', C.batas.start + 0.3, { gain: 0.35 });
  AM.sfx('tick', C.batas.start + 0.8, { gain: 0.35 });
  AM.sfx('tick', C.batas.start + 1.3, { gain: 0.35 });
  AM.sfx('whoosh', Wd('bubar', 'perahu') - 0.1, { gain: 0.35 });
  AM.sfx('bird', C.sepi.start + 0.6, { gain: 0.35, pitch: 0.8 });
  AM.sfx('chime', Wd('besok', 'pasar'), { gain: 0.35 });
}

// ---------------------------------------------------------------- shots
const SHOTS = []; const shot = (id, next, fn) => SHOTS.push({ id, next, fn });
const span = (id, next) => [C[id].start - 0.12, next ? C[next].start - 0.12 : AM.duration + 1];
let TS = { focus: 0.55, band: 0.1, soft: 0.22, max: 1 };
const sky = (h, o) => S.clock(h, o);

// 1. Hook: the whole market, from high above the river, sun low at the far end. Slow push in.
shot('hook', 'lokasi', (t, a, b) => {
  const p = (t - a) / (b - a);
  sky(6.7, { fogNear: 90, fogFar: 700 });
  placeFleet(t);
  const z0 = lerp(8, -2, ease.inOutSine(p)), y0 = lerp(23, 19, p);
  S.look([cx(z0) + 4, y0, z0], [cx(-46), 0, -46], 32);
  TS = { focus: 0.6, band: 0.15, soft: 0.26, max: 1 };
  return () => {
    const ta = env(t, a + 0.15, b + 0.3, 0.5, 0.4);
    K.titleBlock(ui, 'Kalimantan Selatan', 'Pasar di atas', 540, 300, { alpha: ta, size: 96, line2: 'sungai.' });
  };
});

// 2. Where: crane up and back to show the river bend, a pin drops on the market.
shot('lokasi', 'subuh', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  sky(6.75, { fogNear: 120, fogFar: 800 });
  placeFleet(t);
  const z0 = lerp(16, 52, p), y0 = lerp(28, 70, p);
  S.look([cx(z0) - 8 * p, y0, z0], [cx(-48), 0, -48], 34);
  TS = { focus: 0.55, band: 0.13, soft: 0.25, max: 1 };
  return () => {
    const la = env(t, AM.wordTime('lokasi', 'Lok') - 0.15, b + 0.2, 0.35, 0.3);
    K.label(ui, S, [cx(-42), 0, -42], 'Lok Baintan', { sub: 'Sungai Martapura · Kalsel', dy: -260, alpha: la, t, size: 66 });
  };
});

// 3. Dawn: low over the water looking at the sunrise, mist on the river, the clock ticks to six.
shot('subuh', 'acil', (t, a, b) => {
  const p = (t - a) / (b - a);
  const h = lerp(5.55, 6.35, ease.inOutSine(clamp(p * 1.1)));
  sky(h, { fogNear: 40, fogFar: 520 });
  placeFleet(t);
  const z0 = lerp(-12, -18, p);
  S.look([cx(z0) + 2, 7.5, z0], [cx(-160), 3, -160], 36);
  TS = { focus: 0.5, band: 0.07, soft: 0.2, max: 1 };
  return () => {
    const ca = env(t, a + 0.3, b + 0.2, 0.35, 0.3);
    K.clockChip(ui, 540, 300, lerp(5.75, 6.0, clamp((t - a - 0.2) / Math.max(0.1, AM.wordTime('subuh', 'enam') - a - 0.2))), { alpha: ca, scale: 1.15 });
  };
});

// 4. Acil: close on one seller paddling; she turns to look at us when named.
shot('acil', 'jukung', (t, a, b) => {
  const p = (t - a) / (b - a);
  sky(6.6, { fogNear: 60, fogFar: 600 });
  const nm = AM.wordTime('acil', 'acil');
  const look = lerp(-0.1, 0.8, ease.inOutCubic(clamp((t - nm + 0.9) / 0.6)));
  placeFleet(t, 0, { look: { acil: look } });
  const B = boatByHero('acil');
  const tg = onBoat(B, -B.len * 0.32, 0.9, 0);
  const ang = B.cur.a + 0.95 - p * 0.2, dist = lerp(8.5, 7.0, ease.inOutSine(p));
  S.look([tg[0] + Math.cos(ang) * dist, 2.5 - p * 0.2, tg[2] - Math.sin(ang) * dist], [tg[0], tg[1] + 0.35, tg[2]], 30);
  TS = { focus: 0.52, band: 0.07, soft: 0.16, max: 1 };
  return () => {
    K.label(ui, S, onBoat(B, -B.len * 0.32, 1.65, 0), 'Acil', { sub: 'bahasa Banjar: bibi', at: [540, 560], alpha: env(t, nm - 0.2, b + 0.2, 0.3, 0.3), t, size: 72 });
    K.titleBlock(ui, '', 'Kebanyakan perempuan', 540, 300, { alpha: env(t, AM.wordTime('acil', 'kebanyakan'), nm - 0.25, 0.3, 0.3), size: 64 });
  };
});

// 5. Jukung: tracking alongside the boat at water level.
shot('jukung', 'tanggui', (t, a, b) => {
  const p = (t - a) / (b - a);
  sky(6.65, { fogNear: 60, fogFar: 600 });
  placeFleet(t);
  const B = boatByHero('acil');
  const c = onBoat(B, 0, 0, 0), side = B.cur.a + Math.PI / 2;
  const d = 14 - p * 1.5;
  S.look([c[0] + Math.cos(side) * d + Math.cos(B.cur.a) * lerp(-3, 1.5, p), 3.4, c[2] - Math.sin(side) * d - Math.sin(B.cur.a) * lerp(-3, 1.5, p)], [c[0], 0.9, c[2]], 30);
  TS = { focus: 0.53, band: 0.06, soft: 0.15, max: 1 };
  return () => {
    K.label(ui, S, onBoat(B, 1.5, 0.15, 0.55), 'Jukung', { sub: 'perahu kayu khas Banjar', at: [540, 620], alpha: env(t, AM.wordTime('jukung', 'jukung') - 0.15, b + 0.2, 0.3, 0.3), t, size: 72 });
  };
});

// 6. Tanggui: straight down onto the market, the hats are a pattern of discs; slow spin.
shot('tanggui', 'dagangan', (t, a, b) => {
  const p = (t - a) / (b - a);
  sky(6.9, { fogNear: 100, fogFar: 700 });
  placeFleet(t);
  const B = boatByHero('acil');
  const tg = onBoat(B, -B.len * 0.32, 1.4, 0);
  const rot = 0.6 + p * 0.5, h = lerp(46, 36, ease.inOutSine(p));
  S.camera.up.set(Math.cos(rot), 0, Math.sin(rot));
  S.look([tg[0] + 0.01, h, tg[2] + 0.01], tg, 34);
  S.camera.up.set(0, 1, 0);
  TS = { focus: 0.5, band: 0.12, soft: 0.25, max: 0.9 };
  return () => {
    K.label(ui, S, tg, 'Tanggui', { sub: 'anyaman daun rumbia', at: [540, 560], alpha: env(t, AM.wordTime('tanggui', 'tanggui') - 0.15, b + 0.2, 0.3, 0.3), t, size: 72 });
  };
});

// 7. Goods: close on the fruit boat; every item gets its tag as it is named.
shot('dagangan', 'barter', (t, a, b) => {
  const p = (t - a) / (b - a);
  sky(6.95, { fogNear: 60, fogFar: 600 });
  placeFleet(t);
  const B = boatByHero('dagang');
  const c = onBoat(B, 0.4, 0, 0), ang = B.cur.a + 1.25 + p * 0.25;
  S.look([c[0] + Math.cos(ang) * 9.5, 7.5 - p * 0.8, c[2] - Math.sin(ang) * 9.5], [c[0], 0.2, c[2]], 30);
  TS = { focus: 0.5, band: 0.08, soft: 0.18, max: 1 };
  return () => {
    const names = [['pisang', 'Pisang'], ['jeruk', 'Jeruk'], ['sayur', 'Sayur'], ['kue', 'Kue']];
    const pos = [[250, 430], [810, 430], [250, 650], [810, 650]];
    names.forEach(([w, T], i) => {
      const [sx, sz] = K.cargoSlot(i, B.len);
      const al = env(t, AM.wordTime('dagangan', w) - 0.1, b + 0.2, 0.25, 0.3);
      K.label(ui, S, onBoat(B, sx, 0.2, sz), T, { at: pos[i], alpha: al, t: t + i, size: 60 });
    });
  };
});

// 8. Barter: two boats rafted together; bananas hop across, oranges hop back.
shot('barter', 'sejarah', (t, a, b) => {
  const p = (t - a) / (b - a);
  sky(7.0, { fogNear: 60, fogFar: 600 });
  const A = boatByHero('barterA'), Bb = boatByHero('barterB');
  placeFleet(t, 0, { look: { barterA: -1.25, barterB: -1.25 }, rest: { barterA: 1, barterB: 1 } });
  const mid = [(A.cur.x + Bb.cur.x) / 2, 0, (A.cur.z + Bb.cur.z) / 2];
  const ang = -1.05 + p * 0.3;
  S.look([mid[0] + Math.cos(ang) * 13, 8.5 - p, mid[2] - Math.sin(ang) * 13], [mid[0], 0.6, mid[2]], 30);
  TS = { focus: 0.5, band: 0.08, soft: 0.17, max: 1 };
  // goods hop on an arc
  const hop = (mesh, from, to, t0) => {
    const k = ease.inOutSine(clamp((t - t0) / 0.7));
    const x = lerp(from[0], to[0], k), z = lerp(from[2], to[2], k), y = lerp(from[1], to[1], k) + Math.sin(k * Math.PI) * 2.2;
    mesh.position.set(x, y, z); mesh.rotation.set(0, k * 3, Math.sin(k * Math.PI) * 0.4); mesh.visible = true;
  };
  hop(BOATS.gift1, onBoat(A, 0.9, 0.05, 0), onBoat(Bb, 1.2, 0.05, 0.1), AM.wordTime('barter', 'barter'));
  hop(BOATS.gift2, onBoat(Bb, 0.4, 0.05, 0), onBoat(A, 0.2, 0.05, 0.1), AM.wordTime('barter', 'bapanduk') - 0.25);
  return () => {
    const al = env(t, AM.wordTime('barter', 'Namanya') - 0.1, b + 0.2, 0.3, 0.3);
    K.label(ui, S, mid, 'Bapanduk', { sub: 'barter antarpedagang', at: [540, 560], alpha: al, t, size: 76 });
    K.titleBlock(ui, '', '⇄ barter', 540, 300, { alpha: env(t, AM.wordTime('barter', 'barter') - 0.1, AM.wordTime('barter', 'Namanya') - 0.2, 0.25, 0.25), size: 76 });
  };
});

// 9. History: a high slow orbit, the frame warmed like an old photograph.
shot('sejarah', 'batas', (t, a, b) => {
  const p = (t - a) / (b - a);
  sky(6.8, { fogNear: 110, fogFar: 800 });
  placeFleet(t);
  const ang = -0.4 + p * 0.45, R = 58, cz = -45;
  S.look([cx(cz) + Math.sin(ang) * R, 42 - p * 5, cz + Math.cos(ang) * R], [cx(cz), 0, cz], 32);
  TS = { focus: 0.55, band: 0.14, soft: 0.25, max: 1 };
  return () => {
    K.oldPhoto(ui, env(t, a + 0.05, b + 0.1, 0.5, 0.35), t);
    const ta = env(t, AM.wordTime('sejarah', 'Kesultanan') - 0.2, b + 0.2, 0.4, 0.3);
    K.titleBlock(ui, 'Kesultanan Banjar', 'sejak abad ke-16', 540, 320, { alpha: ta, size: 88 });
  };
});

// 10. Time limit: time-lapse, the sun climbs, shadows swing and shorten, the clock spins.
shot('batas', 'bubar', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const h = lerp(7.1, 8.75, ease.inOutSine(p));
  sky(h, { fogNear: 110, fogFar: 800 });
  placeFleet(t);
  S.look([cx(-5) + 18, 44, -5], [cx(-50), 0, -50], 34);
  TS = { focus: 0.55, band: 0.14, soft: 0.25, max: 1 };
  return () => K.clockChip(ui, 540, 300, h, { alpha: env(t, a + 0.1, b + 0.5, 0.25, 0.2), scale: 1.25 });
});

// 11. Nine o'clock: the boats scatter home to the banks (time-lapse).
shot('bubar', 'sepi', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  sky(lerp(8.75, 9.1, p), { fogNear: 120, fogFar: 820 });
  const d = clamp((t - AM.wordTime('bubar', 'perahu') + 0.4) / 2.8);
  placeFleet(t, d);
  S.look([cx(-5) + 18 - p * 6, 44 + p * 8, -5 + p * 8], [cx(-50), 0, -50], 34);
  TS = { focus: 0.55, band: 0.14, soft: 0.25, max: 1 };
  return () => K.clockChip(ui, 540, 300, lerp(8.75, 9.0, clamp((t - a) / (AM.wordTime('bubar', 'sembilan') - a + 0.2))), { alpha: env(t, a - 0.2, b + 0.2, 0.01, 0.3), scale: 1.25 });
});

// 12. Quiet: the empty river, an egret glides low over the water.
shot('sepi', 'besok', (t, a, b) => {
  const p = (t - a) / (b - a);
  sky(9.15, { fogNear: 120, fogFar: 820 });
  placeFleet(t, 1);
  const E = BOATS.egret;
  const ez = lerp(-10, -75, p), ex = cx(ez) + Math.sin(p * 3) * 3;
  E.root.visible = true; E.root.position.set(ex, 5 + Math.sin(p * 4) * 0.6, ez); E.root.rotation.set(0, Math.PI / 2 + Math.cos(p * 3) * 0.2, 0);
  const fl = Math.sin(t * 7) * 0.8; E.wings[0].rotation.x = fl; E.wings[1].rotation.x = -fl;
  E.root.scale.setScalar(1.6);
  S.look([cx(-5) + 10, lerp(30, 22, p), lerp(20, 5, p)], [ex, 2, ez - 10], 34);
  TS = { focus: 0.55, band: 0.14, soft: 0.25, max: 1 };
  return null;
});

// 13. Tomorrow: night falls in a breath, windows glow, then dawn returns and the boats paddle back.
shot('besok', null, (t, a, b) => {
  const lt = t - a;
  const night = env(lt, 0, 2.2, 0.6, 1.2);
  const h = lt < 1.0 ? lerp(9.1, 4.8, ease.inOutSine(lt / 1.0)) : lerp(4.8, 6.6, ease.inOutSine(clamp((lt - 1.0) / 3.2)));
  sky(h, { fogNear: 90, fogFar: 700 });
  const back = 1 - ease.outCubic(clamp((lt - 1.2) / 3.4));
  placeFleet(t, back);
  BOATS.egret.root.visible = false;
  const p = clamp(lt / 6.5);
  const z0 = lerp(52, 40, ease.inOutSine(p));
  S.look([cx(z0) + 6, lerp(44, 38, p), z0], [cx(-58), 0, -58], 34);
  TS = { focus: 0.6, band: 0.15, soft: 0.26, max: 1 };
  return () => {
    const ta = env(t, AM.wordTime('besok', 'pasar') - 0.3, AM.duration + 2, 0.6, 0.1);
    K.titleBlock(ui, 'Pasar Terapung', 'Lok Baintan', 540, 330, { alpha: ta, size: 110 });
    if (ta > 0) {
      ui.save(); ui.globalAlpha = ta; ui.font = "700 30px 'Inter'"; ui.letterSpacing = '6px'; ui.textAlign = 'center'; ui.fillStyle = K.PAL.cream;
      ui.shadowColor = 'rgba(40,20,5,.6)'; ui.shadowBlur = 20; ui.fillText('SETIAP PAGI · 06.00–09.00 WITA', 540, 410); ui.restore();
    }
  };
});

// ---------------------------------------------------------------- frame
export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id, s.next);
  BOATS.gift1.visible = BOATS.gift2.visible = false;
  BOATS.egret.root.visible = false;
  const overlay = s.fn(t, Math.max(0, a), b);
  S.render(t);
  K.tiltShift(ts, S, TS);
  if (overlay) overlay();
  // a soft exposure "breath" on every cut
  const since = t - Math.max(0, a);
  if (since < 0.2 && s.id !== 'hook') { fx.fillStyle = `rgba(255,244,225,${0.18 * (1 - since / 0.2)})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(fx, { strength: 0.32, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.035, fps: 12 });
}
