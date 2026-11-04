// Kartun 3D Sinematik demo 3: "Roro Jonggrang & Seribu Candi Semalam" (legenda Candi Prambanan), 10 shots.
import * as K from '/styles/kartun-3d-sinematik/kit.js';
const THREE = K.THREE;
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'bold', y: 1450, size: 70 } };

let S, ui, C = {};
const W_ = (id, w) => AM.wordTime(id, w);

// Scene
let P; // Prambanan valley & temple courtyard
// Cast
let bandung, roro, arcaRoro, dayang1, dayang2, rooster, jins = [];
// Props
let candiHero, candiUnfinished, candiGrid = [], lesungProp, clothFire, icons = {};
let sparksBuild, dustStone, fireSparks, curseSmoke, glowMoon, moonCore, glowCurse, glowEast;

// ------------------------------------------------------------------ terrain height
function hValley(x, z) {
  const dist = Math.hypot(x, z);
  const flatCourt = clamp((dist - 14) / 12);
  let h = flatCourt * (Math.max(0, -z - 14) * 0.25 + Math.max(0, Math.abs(x) - 18) * 0.2 + noise.fbm2(x * 0.035, z * 0.035, 3) * 1.4);
  // hill on the east (+x = 18) for lighting straw and pounding lesung
  h += 2.6 * Math.exp(-((x - 16) ** 2 + (z + 2) ** 2) / 36);
  return h;
}

// ------------------------------------------------------------------ custom 3D builders
/** Stylized Javanese Hindu Candi (Prambanan silhouette: stepped base, body with niche, tiered ratna spires). */
function buildCandi({ s = 1, unfinished = false, color = '#76716b', trim = '#8e8880' } = {}) {
  const G = new THREE.Group();
  const mat = K.toon(color), mat2 = K.toon(trim), dark = K.toon('#2d2926');
  // 1. Stepped base (bhurloka)
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 2.6), mat2); b1.position.y = 0.225; G.add(b1);
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.45, 2.2), mat); b2.position.y = 0.675; G.add(b2);
  // Stairs in front (+z)
  for (let i = 0; i < 3; i++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.25, 0.35), mat2);
    st.position.set(0, 0.125 + i * 0.25, 1.35 - i * 0.18); G.add(st);
  }
  // 2. Main temple body (bhuwarloka)
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.65, 1.75), mat); body.position.y = 1.725; G.add(body);
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.22, 2.05), mat2); cornice.position.y = 2.62; G.add(cornice);
  // Portal niche on front face
  const niche = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.15, 0.12), dark); niche.position.set(0, 1.55, 0.85); G.add(niche);
  const kala = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.24, 0.18), mat2); kala.position.set(0, 2.22, 0.88); G.add(kala);

  // 3. Tiered roof crown (swarloka) — omitted/partial if unfinished!
  const tiers = unfinished ? 2 : 5;
  for (let i = 0; i < tiers; i++) {
    const w = 1.65 - i * 0.28, h = 0.36;
    const ty = 2.73 + i * 0.36 + h / 2;
    const tier = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), i % 2 ? mat : mat2);
    tier.position.y = ty; G.add(tier);
    // corner ratna mini-spires
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const sp = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 6), mat2);
      sp.position.set(sx * (w / 2 - 0.06), ty + h / 2 + 0.13, sz * (w / 2 - 0.06));
      G.add(sp);
    }
  }
  if (!unfinished) {
    const mainSpire = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.95, 8), mat2);
    mainSpire.position.y = 2.73 + 5 * 0.36 + 0.45;
    G.add(mainSpire);
  }
  G.scale.setScalar(s);
  K.outline(G, 0.0026);
  return G;
}

/** Traditional wooden rice mortar (lesung) + pestles (alu). */
function buildLesung() {
  const G = new THREE.Group();
  const wood = K.toon('#8a5630'), dark = K.toon('#4a2b14');
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.72), wood);
  body.position.y = 0.28; G.add(body);
  const trough = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 0.42), dark);
  trough.position.y = 0.52; G.add(trough);
  // golden grain heap inside trough
  const grain = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8), K.toon('#f0c248'));
  grain.scale.set(2.4, 0.35, 0.9); grain.position.y = 0.54; G.add(grain);
  K.outline(G, 0.0028);
  return G;
}

function buildPrambananScene() {
  P = new THREE.Scene();
  P.fog = new THREE.Fog('#1f294f', 26, 185);
  P.userData.sky = K.skyDome(380); P.add(P.userData.sky);
  P.userData.L = K.lights(P);

  const terr = K.terrain({
    w: 240, d: 240, seg: 100, height: hValley,
    color: (x, z, y) => {
      if (Math.hypot(x, z) < 11.5) return noise.n2(x * 0.35, z * 0.35) > 0.2 ? '#8f8474' : '#7d7365'; // stone courtyard
      return noise.n2(x * 0.15, z * 0.15) > 0.2 ? '#4f8c44' : '#63a352';
    },
  });
  P.add(terr);

  // Hero central Candi & the 1000th unfinished Candi beside it
  candiHero = buildCandi({ s: 1.55, unfinished: false });
  candiHero.position.set(-2.4, 0, -4.2);
  P.add(candiHero);

  candiUnfinished = buildCandi({ s: 1.35, unfinished: true, color: '#827c74' });
  candiUnfinished.position.set(2.5, 0, -3.5);
  P.add(candiUnfinished);

  // Surrounding field of dozens of peripheral candi (Sewu / Prambanan complex)
  const ringSpots = [];
  for (let row = 0; row < 3; row++) {
    const rad = 11 + row * 6.5, count = 8 + row * 4;
    for (let i = 0; i < count; i++) {
      const ang = -Math.PI * 0.88 + (i / (count - 1)) * Math.PI * 0.76;
      const cx = Math.sin(ang) * rad, cz = Math.cos(ang) * rad - 4;
      if (cz > 4) continue;
      ringSpots.push([cx, cz, 0.68 + (2 - row) * 0.14]);
    }
  }
  candiGrid = ringSpots.map(([cx, cz, cs], i) => {
    const c = buildCandi({ s: cs, color: i % 2 ? '#736e68' : '#7f7972' });
    const by = hValley(cx, cz);
    c.position.set(cx, by, cz);
    c.userData = { baseY: by, idx: i };
    P.add(c);
    return c;
  });

  // Distant volcano Merapi & mountain ridge in background
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(28 + (i === 2 ? 12 : i * 3), 24 + (i === 2 ? 16 : (i % 3) * 6), 10),
      K.toon(i % 2 ? '#4d6580' : '#5e7691', { flat: true })
    );
    m.position.set(-125 + i * 50, 6, -155 - (i % 2) * 20);
    P.add(m);
  }

  // Trees & village house on the eastern hill (x around 16)
  const vHouse = K.house({ w: 3.2, d: 2.4, h: 1.8 });
  vHouse.position.set(18.5, hValley(18.5, -5.5), -5.5); vHouse.rotation.y = -0.5;
  P.add(vHouse);

  const treeSpots = [[-13, -6, 'palm'], [12, -8, 'palm'], [-16, 1, 'round'], [14, 3.5, 'bamboo'], [20, -1, 'palm'], [-10, -12, 'round']];
  P.userData.trees = treeSpots.map(([tx, tz, tk], i) => {
    const tr = K.tree(tk, { seed: i + 20, s: 1.1 });
    tr.position.set(tx, hValley(tx, tz) - 0.05, tz);
    P.add(tr);
    return tr;
  });

  // Lesung & straw fire on eastern hill (x = 15.5, z = -1.5)
  lesungProp = buildLesung();
  lesungProp.position.set(15.2, hValley(15.2, -1.2), -1.2);
  P.add(lesungProp);

  clothFire = K.cloth(3.4, 1.8, { color: '#ff3814', glow: '#ffc42e' });
  P.add(clothFire);
  glowEast = K.glow('#ff7b29', 16, 0.85);
  P.add(glowEast);

  // Full moon
  glowMoon = K.glow('#dfe8ff', 15, 0.85); P.add(glowMoon);
  moonCore = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), K.basic('#f6f8ff', { fog: false })); P.add(moonCore);
  glowMoon.position.set(-32, 36, -105); moonCore.position.set(-32, 36, -105);

  // 3D floating icons for Shot 3 ("1000 Candi", "1 Malam")
  const candiIcon = buildCandi({ s: 0.28 });
  const moonIcon = new THREE.Group();
  const cr = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.1, 10, 24, Math.PI * 1.25), K.toon('#ffe27a', { emissive: '#ffcf4a', ei: 0.5 }));
  cr.rotation.z = 0.9; moonIcon.add(cr); K.outline(moonIcon, 0.003);
  icons = { candi: candiIcon, moon: moonIcon };
  P.add(candiIcon, moonIcon);

  // Particles
  sparksBuild = K.burst({ n: 65, color: '#7ff0ff', size: 0.28, speed: 3.8, up: 4.5, grav: 0.5, life: 0.85, seed: 11, additive: true }); P.add(sparksBuild);
  dustStone = K.burst({ n: 55, color: '#d8ccb8', size: 0.75, speed: 4.2, up: 2.5, grav: -3, life: 1.2, seed: 15 }); P.add(dustStone);
  fireSparks = K.burst({ n: 50, color: '#ffae38', size: 0.32, speed: 2.5, up: 5.2, grav: 1.2, life: 1.0, seed: 21, additive: true }); P.add(fireSparks);
  curseSmoke = K.burst({ n: 60, color: '#ff6a48', size: 0.85, speed: 3.2, up: 3.4, grav: -0.5, life: 1.3, seed: 29 }); P.add(curseSmoke);
  glowCurse = K.glow('#ff5e3a', 6.5, 0.85); P.add(glowCurse);
}

// ------------------------------------------------------------------ setup
export async function setup(AM) {
  S = K.stage(AM, { pr: 0.66 }); ui = S.ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  buildPrambananScene();

  // Characters
  bandung = K.character({
    kind: 'man', skin: '#e0a579', top: '#242234', bottom: '#1b1a28',
    trim: '#ffd24a', hair: 'short', iket: '#8f241e', sash: '#d93226', eye: '#3a2210',
  });
  roro = K.character({
    kind: 'woman', skin: '#f5c6a0', top: '#287a58', trim: '#ffd24a',
    hair: 'bun', lashes: true, scarf: '#e84a72', eye: '#4a2612',
    skirtMap: K.batikTex('#6e4222', '#261206', '#ffd24a', 'parang'),
  });
  arcaRoro = K.character({
    kind: 'woman', skin: '#858079', top: '#75706a', trim: '#948e86',
    hair: 'bun', hairC: '#69645e', hairHi: '#8f8982', lashes: true, scarf: '#7d7871', eye: '#59544e',
    skirtMap: K.batikTex('#6e6963', '#47433f', '#96918a', 'parang'),
  });
  dayang1 = K.character({
    kind: 'woman', skin: '#eab48c', top: '#d97b2e', trim: '#f2c248',
    hair: 'bun', lashes: true, eye: '#3a2210',
    skirtMap: K.batikTex('#6b3f22', '#261306', '#e0b054', 'kawung'),
  });
  dayang2 = K.character({
    kind: 'woman', skin: '#e5ad84', top: '#4a7ab5', trim: '#f2c248',
    hair: 'bun', lashes: true, eye: '#3a2210',
    skirtMap: K.batikTex('#59351c', '#261306', '#e0b054', 'kawung'),
  });
  // Add wooden pestles (alu) to dayang1 and dayang2 right hands
  for (const d of [dayang1, dayang2]) {
    const alu = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.035, 1.25, 7), K.toon('#704220'));
    alu.position.set(0, -0.25, 0.15); alu.rotation.x = Math.PI / 2;
    K.outline(alu, 0.0028);
    d.j.handR.add(alu);
  }

  rooster = K.rooster();
  for (let i = 0; i < 8; i++) {
    const j = K.jin({ color: i % 3 === 0 ? '#7ff0c8' : i % 3 === 1 ? '#5fd8ff' : '#a89eff', s: 0.72 + hrand(i, 2) * 0.25 });
    const h = new THREE.Group();
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 5), K.toon('#8a5a32')); st.position.y = -0.16; h.add(st);
    const hd = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.08), K.toon('#7d7d86')); hd.position.y = -0.32; h.add(hd);
    j.userData['arm1'].add(h); h.position.y = -0.2;
    jins.push(j);
  }

  // Sound design (10 cues)
  AM.sfx('chime', W_('hook', 'Prambanan'), { gain: 0.4 });
  AM.sfx('pop', W_('lamar', 'melamar'), { gain: 0.45 });
  AM.sfx('magic', W_('syarat', 'seribu') - 0.05, { gain: 0.45 });
  AM.sfx('boom', W_('panggil', 'memanggil'), { gain: 0.5 });
  AM.sfx('impact', W_('bangun', 'memahat'), { gain: 0.45 });
  AM.sfx('drum_hit', W_('panik', 'panik') - 0.05, { gain: 0.5 });
  AM.sfx('impact', W_('lesung', 'lesung'), { gain: 0.45 });
  AM.sfx('bird', W_('ayam', 'berkokok') - 0.05, { gain: 0.5, pitch: 0.78 });
  AM.sfx('boom', W_('kabur', 'murka'), { gain: 0.55 });
  AM.sfx('magic', W_('arca', 'mengutuk'), { gain: 0.55 });
}

// ------------------------------------------------------------------ helpers
const span = (id, next) => [C[id].start - 0.12, next ? C[next].start - 0.12 : AM.duration + 1];
const SHOTS = []; const shot = (id, next, fn) => SHOTS.push({ id, next, fn });

function cam(pos, look, fov = 38, t = 0, amp = 0.04, roll = 0) {
  const d = K.drift(t, amp, 7);
  K.shootCam(S.cam, [pos[0] + d[0], pos[1] + d[1], pos[2] + d[2]], [look[0] + d[0] * 0.5, look[1] + d[1] * 0.5, look[2]], fov, roll);
}
const L3 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const scr = (x, y, z) => K.toScreen(S.cam, x, y, z);
function ui2(fn) { ui.setTransform(1, 0, 0, 1, 0, 0); fn(); }
function hide(...objs) { objs.forEach((o) => { if (o && o.parent) o.parent.remove(o); }); }
function rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

function setSkyMood(t, { night = 0, dawn = 0 } = {}) {
  const dayTop = '#3e74cf', dayMid = '#f2a668', dayBot = '#ffe5ad', dayFog = '#f2d5b0';
  const nTop = '#0c1333', nMid = '#1b2b62', nBot = '#2b3e78', nFog = '#1d2852';
  const dTop = '#382664', dMid = '#ff6232', dBot = '#ffbe68', dFog = '#d47254';

  const top = K.mix(K.mix(dayTop, nTop, night), dTop, dawn);
  const mid = K.mix(K.mix(dayMid, nMid, night), dMid, dawn);
  const bot = K.mix(K.mix(dayBot, nBot, night), dBot, dawn);
  const fog = K.mix(K.mix(dayFog, nFog, night), dFog, dawn);

  P.userData.sky.position.copy(S.cam.position);
  K.setSky(P.userData.sky, {
    top, mid, bot,
    sun: [0.65, lerp(0.18, 0.06, night), -0.8],
    sunC: K.mix('#fff0be', '#ffae52', dawn),
    sunK: (1 - night * 0.85) * 0.9 + dawn * 0.7,
    stars: clamp(night - dawn * 0.8),
    t,
  });
  P.fog.color.set(fog);
  P.userData.L.set({
    keyC: K.mix(K.mix('#fff0d2', '#8ab0ff', night), '#ff9a68', dawn),
    keyI: lerp(1.45, 0.85, night * (1 - dawn * 0.5)),
    keyPos: [10, 12, 8],
    sky: K.mix('#cce0ff', '#3a4f96', night),
    ground: K.mix('#6e583c', '#181224', night),
    hemiI: lerp(0.88, 0.65, night),
    backC: K.mix('#ffd699', '#7ad8ff', night * (1 - dawn)),
    backI: 1.0,
  });
  K.setRim(K.mix(K.mix('#ffefc2', '#82d8ff', night), '#ffb070', dawn), 0.52);
  glowMoon.visible = moonCore.visible = night > 0.35 && dawn < 0.65;
  moonCore.lookAt(S.cam.position);
  P.userData.trees.forEach((tr, i) => K.sway(tr, t, 0.03, i));
}

// ------------------------------------------------------------------ 10 SHOTS
// 1. HOOK: Grand golden-hour crane shot over Candi Prambanan & the unfinished 1000th temple.
shot('hook', 'lamar', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setSkyMood(t, { night: 0, dawn: 0.25 });
  candiGrid.forEach((c) => { c.visible = true; c.position.y = c.userData.baseY; });

  cam(L3([8.5, 4.8, 12.5], [-4.5, 3.6, 9.8], ease.inOutSine(p)), [0, 2.8, -4.0], 40, t, 0.04);
  S.render(P);

  ui2(() => {
    K.nameplate(ui, 'CANDI PRAMBANAN · YOGYAKARTA', 540, 220, { size: 40, alpha: env(t, a + 0.1, b, 0.2, 0.2), pop: (t - a) / 0.35, color: '#ffe082' });
    const tSeribu = W_('hook', 'Seribu');
    if (t >= tSeribu - 0.15) {
      K.title(ui, 'SERIBU CANDI', 540, 330, { size: 96, pop: (t - tSeribu + 0.15) / 0.3, alpha: env(t, tSeribu - 0.15, b, 0.15, 0.2) });
    }
    const tKurang = W_('hook', 'kurang');
    if (t >= tKurang - 0.1) {
      const [sx, sy] = scr(2.5, 3.2, -3.5);
      K.pointer(ui, 'KURANG SATU! (999)', 540, 470, sx, sy, { size: 44, alpha: env(t, tKurang - 0.1, b, 0.15, 0.2), color: '#ff9e68' });
    }
  });
});

// 2. LAMAR: Mighty warrior Bandung Bondowoso proposes to Princess Roro Jonggrang, who turns away reluctantly.
shot('lamar', 'syarat', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setSkyMood(t, { night: 0, dawn: 0.15 });
  K.use(P, bandung.root, roro.root);

  const tMelamar = W_('lamar', 'melamar');
  const bowU = prog(t, tMelamar - 0.2, tMelamar + 0.4, ease.inOutCubic);

  K.pose(bandung, {
    x: -1.1, y: 0, z: 1.5,
    ry: 1.25,
    ...K.idle(t, 3),
    lean: bowU * 0.18,
    armR: [lerp(0.5, 1.45, bowU), 0.2, 0.8],
    armL: [0.35, 0.35, 1.3],
    head: [-0.1, -0.08 * bowU, 0],
    mouth: 'grin',
    t,
  });

  const tRoro = W_('lamar', 'Roro') - 0.15;
  const turnAway = prog(t, tRoro, tRoro + 0.45, ease.outCubic);
  K.pose(roro, {
    x: 1.0, y: 0, z: 1.5,
    ry: lerp(-1.25, -0.45, turnAway),
    ...K.idle(t, 8),
    armL: [0.65, 0.2, 1.65],
    armR: [lerp(0.4, 1.35, turnAway), 0.25, 1.4],
    head: [lerp(0.15, -0.38, turnAway), 0.06, 0],
    brow: 0.45 * turnAway,
    mouth: turnAway > 0.3 ? 'frown' : 'flat',
    t,
  });

  cam(L3([0.0, 1.85, 6.8], [0.25, 1.65, 5.6], ease.inOutSine(p)), [0, 1.15, 1.5], 36, t, 0.035);
  S.render(P);

  ui2(() => {
    K.nameplate(ui, 'BANDUNG BONDOWOSO', 330, 310, { size: 40, alpha: env(t, W_('lamar', 'Bandung') - 0.15, b, 0.2, 0.2), pop: (t - W_('lamar', 'Bandung') + 0.15) / 0.3 });
    if (t >= tRoro) {
      K.nameplate(ui, 'RORO JONGGRANG', 740, 310, { size: 40, alpha: env(t, tRoro, b, 0.2, 0.2), pop: (t - tRoro) / 0.3, color: '#ff9ec4' });
    }
  });
});

// 3. SYARAT: Roro Jonggrang presents the impossible condition: 1,000 stone temples in a single night!
shot('syarat', 'panggil', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setSkyMood(t, { night: 0.2, dawn: 0.3 });
  K.use(P, bandung.root, roro.root, icons.candi, icons.moon);

  K.pose(roro, {
    x: 1.05, y: 0, z: 1.4, ry: -1.15,
    ...K.idle(t, 8),
    armL: [2.25, 0.25, 0.45 + Math.sin(t * 3) * 0.1],
    armR: [0.5, 0.2, 1.5],
    head: [0.2, -0.08, 0],
    ...K.talk(t, env(t, a, b - 0.2, 0.1, 0.1), 8),
    brow: -0.25,
    t,
  });
  K.pose(bandung, {
    x: -1.05, y: 0, z: 1.4, ry: 1.15,
    ...K.idle(t, 3),
    armL: [0.4, 0.35, 1.4], armR: [0.4, 0.35, 1.4],
    head: [-0.2, -0.05, 0],
    mouth: 'grin',
    t,
  });

  // Pop 3D icons between them
  const tCandi = W_('syarat', 'seribu'), tMalam = W_('syarat', 'malam');
  const uC = clamp((t - tCandi + 0.1) / 0.4), uM = clamp((t - tMalam + 0.1) / 0.4);
  icons.candi.visible = uC > 0;
  icons.candi.scale.setScalar(Math.max(0.001, ease.outBack(uC, 2.2)) * 0.28);
  icons.candi.position.set(-0.45, 2.25 + Math.sin(t * 2.2) * 0.06, 1.8);
  icons.candi.rotation.y = t * 0.9;

  icons.moon.visible = uM > 0;
  icons.moon.scale.setScalar(Math.max(0.001, ease.outBack(uM, 2.2)) * 0.85);
  icons.moon.position.set(0.45, 2.5 + Math.sin(t * 2.2 + 1) * 0.06, 1.8);
  icons.moon.rotation.y = t * 0.9;

  cam([0, 1.85, lerp(7.2, 6.2, p)], [0, 1.45, 1.4], 38, t, 0.035);
  S.render(P);

  ui2(() => {
    K.title(ui, 'SYARAT MUSTAHIL!', 540, 260, { size: 88, alpha: env(t, a + 0.1, b, 0.2, 0.2), pop: (t - a) / 0.35 });
    if (uC > 0) {
      const [cx, cy] = scr(-0.45, 2.0, 1.8);
      K.nameplate(ui, '1.000 CANDI', cx, cy + 40, { size: 40, alpha: env(t, tCandi - 0.1, b, 0.15, 0.2), pop: uC });
    }
    if (uM > 0) {
      const [mx, my] = scr(0.45, 2.0, 1.8);
      K.nameplate(ui, '1 MALAM', mx, my + 40, { size: 40, alpha: env(t, tMalam - 0.1, b, 0.15, 0.2), pop: uM, color: '#9fe0ff' });
    }
  });
});

// 4. PANGGIL: Night falls; Bandung Bondowoso summons a legion of glowing blue jins from the earth.
shot('panggil', 'bangun', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setSkyMood(t, { night: 1, dawn: 0 });
  K.use(P, bandung.root, ...jins, sparksBuild);

  const tCall = W_('panggil', 'memanggil') - 0.1;
  const sumU = prog(t, tCall, tCall + 0.6, ease.outCubic);

  K.pose(bandung, {
    x: 0, y: 0, z: 2.2, ry: 0,
    bob: -0.08 * sumU,
    armL: [lerp(0.4, 2.5, sumU), 0.45, 0.25],
    armR: [lerp(0.4, 2.5, sumU), 0.45, 0.25],
    head: [0, -0.25 * sumU, 0],
    brow: -0.8, mouth: 'open', open: 0.7,
    t,
  });

  const tJin = W_('panggil', 'jin') - 0.15;
  jins.forEach((J, i) => {
    const u = ease.outBack(clamp((t - tJin - i * 0.06) / 0.45), 1.8);
    J.visible = u > 0;
    const ang = (i / jins.length) * TAU + t * 0.8;
    const rad = lerp(0.8, 3.2, u);
    J.position.set(Math.cos(ang) * rad, lerp(-0.5, 1.6 + (i % 3) * 0.45, u) + Math.sin(t * 3 + i) * 0.12, 1.2 + Math.sin(ang) * rad * 0.6);
    J.rotation.y = -ang + Math.PI / 2;
    J.scale.setScalar(Math.max(0.01, u * 0.75));
    K.jinTick(J, t, i, 0);
  });

  sparksBuild.position.set(0, 1.0, 2.0);
  sparksBuild.userData.tick(t - tJin);

  cam(L3([0, 1.4, 8.2], [0, 2.2, 6.8], ease.inOutSine(p)), [0, 1.6, 1.5], 40, t, 0.045);
  S.render(P);

  ui2(() => {
    if (t >= tJin) {
      K.title(ui, 'PASUKAN JIN!', 540, 280, { size: 96, pop: (t - tJin) / 0.3, alpha: env(t, tJin, b, 0.15, 0.2), fill: ['#ffffff', '#7ff0ff'], stroke: '#0b2240' });
    }
  });
});

// 5. BANGUN: Hundreds of jins hammer & raise the stone candi out of the misty ground!
shot('bangun', 'panik', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setSkyMood(t, { night: 1, dawn: 0 });
  K.use(P, ...jins, sparksBuild, dustStone);

  // Animate peripheral candi rising from underground
  candiGrid.forEach((c, i) => {
    const u = ease.outBack(clamp((p * 1.35 - (i / candiGrid.length) * 0.55) / 0.45), 1.4);
    c.position.y = c.userData.baseY - (1 - u) * 4.5;
  });
  candiUnfinished.position.y = lerp(-3.5, 0, ease.outCubic(p));

  jins.forEach((J, i) => {
    J.visible = true; J.scale.setScalar(0.72);
    const ang = (i / jins.length) * TAU + t * 0.4;
    const target = i < 4 ? [-2.4, 3.2, -4.2] : [2.5, 2.4, -3.5];
    J.position.set(
      target[0] + Math.cos(ang) * 1.9,
      target[1] + Math.sin(t * 3 + i) * 0.25 + (i % 2) * 0.6,
      target[2] + Math.sin(ang) * 1.9
    );
    J.rotation.y = -ang - Math.PI / 2;
    K.jinTick(J, t, i, 0);
    J.userData['arm1'].rotation.z = 0.4 + Math.max(0, Math.sin(t * 12 + i)) * 1.45;
  });

  sparksBuild.position.set(2.5, 2.6, -3.5);
  sparksBuild.userData.tick((t - a) % 0.85);
  dustStone.position.set(0, 0.5, -3.8);
  dustStone.userData.tick((t - a) % 1.15);

  const orbit = lerp(-0.55, 0.55, p);
  cam([Math.sin(orbit) * 13.5, lerp(5.2, 3.8, p), Math.cos(orbit) * 13.5 - 2], [0, 2.5, -4.0], 42, t, 0.05);
  S.render(P);

  ui2(() => {
    const count = Math.floor(lerp(120, 950, ease.inOutQuad(p)));
    K.title(ui, 'TOK! TOK! TOK!', 540, 260, { size: 92, pop: (t - a) / 0.3, rot: Math.sin(t * 24) * 0.03, fill: ['#ffffff', '#8ff0ff'], stroke: '#0c2240' });
    K.nameplate(ui, `CANDI TERBANGUN: ${count}`, 540, 390, { size: 46, color: '#7ff0c8' });
  });
});

// 6. PANIK: Roro Jonggrang gasps in panic as the temple counter hits 999 / 1000!
shot('panik', 'lesung', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setSkyMood(t, { night: 0.92, dawn: 0.08 });
  K.use(P, roro.root, ...jins);

  jins.forEach((J, i) => {
    J.visible = true; J.scale.setScalar(0.65);
    J.position.set(2.5 + Math.cos(i) * 1.7, 2.5 + (i % 3) * 0.4, -3.5 + Math.sin(i) * 1.7);
    K.jinTick(J, t, i, 0);
  });

  const tPanik = W_('panik', 'panik') - 0.15;
  const shock = t >= tPanik;
  K.pose(roro, {
    x: 0.2, y: 0, z: 3.4,
    ry: 0.15,
    ...K.idle(t, 8, 0.5),
    armL: shock ? [2.3, 0.38, 2.15] : [0.5, 0.2, 1.4],
    armR: shock ? [2.3, 0.38, 2.15] : [0.5, 0.2, 1.4],
    head: [Math.sin(t * 14) * (shock ? 0.04 : 0), -0.05, 0],
    wide: shock ? 1 : 0.2,
    brow: shock ? 0.95 : 0.3,
    mouth: shock ? 'open' : 'frown',
    open: 0.95,
    t,
  });

  cam(L3([0.65, 1.55, 6.2], [0.35, 1.45, 5.1], ease.outCubic(p)), [0.2, 1.25, 2.5], 36, t, 0.035);
  S.render(P);

  ui2(() => {
    const t999 = W_('panik', 'sembilan') - 0.2;
    const count = t >= t999 ? 999 : Math.floor(lerp(960, 999, clamp((t - a) / Math.max(0.2, t999 - a))));
    const bx = 190, by = 240, bw = 700, bh = 46;
    ui.fillStyle = 'rgba(10,14,40,0.88)'; rr(ui, bx - 10, by - 10, bw + 20, bh + 20, 28); ui.fill();
    ui.strokeStyle = '#ffcf4a'; ui.lineWidth = 4; rr(ui, bx - 10, by - 10, bw + 20, bh + 20, 28); ui.stroke();
    ui.fillStyle = count >= 999 ? '#ff5e3a' : '#5fd8ff'; rr(ui, bx, by, bw * (count / 1000), bh, 22); ui.fill();
    K.title(ui, `${count} / 1000 CANDI!`, 540, 380, { size: 92, pop: (t - a) / 0.3, fill: count >= 999 ? ['#fff2c0', '#ff5232'] : ['#ffffff', '#8ff0ff'] });
  });
});

// 7. LESUNG: Roro Jonggrang wakes village women to pound the wooden lesung and burn red straw in the east!
shot('lesung', 'ayam', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const tBurn = W_('lesung', 'membakar') - 0.15;
  const dawnU = prog(t, tBurn, b, ease.inOutSine);
  setSkyMood(t, { night: 1 - dawnU * 0.4, dawn: dawnU * 0.85 });

  K.use(P, roro.root, dayang1.root, dayang2.root, clothFire, glowEast, fireSparks);

  const hx = 15.2, hz = -1.2, hy = hValley(hx, hz);
  // Two village women rhythmically pounding the lesung with wooden pestles
  const pound1 = Math.sin(t * 10), pound2 = Math.sin(t * 10 + Math.PI);
  K.pose(dayang1, {
    x: hx - 0.65, y: hy, z: hz + 0.65, ry: Math.PI - 0.15,
    ...K.idle(t, 4, 0.4),
    lean: 0.15 + Math.max(0, pound1) * 0.12,
    armR: [1.35 - pound1 * 0.45, 0.1, 0.65],
    armL: [1.1, 0.15, 0.9],
    t,
  });
  K.pose(dayang2, {
    x: hx + 0.65, y: hy, z: hz + 0.65, ry: Math.PI + 0.15,
    ...K.idle(t, 5, 0.4),
    lean: 0.15 + Math.max(0, pound2) * 0.12,
    armR: [1.35 - pound2 * 0.45, 0.1, 0.65],
    armL: [1.1, 0.15, 0.9],
    t,
  });
  // Roro Jonggrang directing them & lighting the eastern straw fire
  K.pose(roro, {
    x: hx - 1.85, y: hValley(hx - 1.85, hz + 0.2), z: hz + 0.2, ry: 1.2,
    ...K.idle(t, 8),
    armR: [lerp(1.2, 2.2, dawnU), 0.35, 0.35],
    armL: [0.8, 0.2, 1.2],
    t,
  });

  clothFire.visible = dawnU > 0.02;
  clothFire.position.set(hx + 2.4, hy + 1.1 + dawnU * 0.8, hz - 1.2);
  clothFire.rotation.y = -0.6;
  clothFire.scale.setScalar(lerp(0.3, 1.35, dawnU));
  clothFire.userData.tick(t, 1.2);

  glowEast.visible = dawnU > 0.05;
  glowEast.position.set(hx + 3.2, hy + 2.5, hz - 2.0);
  glowEast.material.opacity = dawnU * 0.85;

  fireSparks.position.set(hx + 2.2, hy + 0.8, hz - 1.0);
  fireSparks.userData.tick(t - tBurn);

  cam(L3([hx - 0.5, hy + 1.9, hz + 5.2], [hx + 0.2, hy + 1.75, hz + 4.4], ease.inOutSine(p)), [hx + 0.2, hy + 1.1, hz - 0.2], 40, t, 0.04);
  S.render(P);

  ui2(() => {
    K.nameplate(ui, 'TUMBUK LESUNG & BAKAR JERAMI', 540, 250, { size: 40, alpha: env(t, a + 0.1, b, 0.2, 0.2), pop: (t - a) / 0.3, color: '#ffd27a' });
    if (dawnU > 0.2) {
      K.title(ui, 'CAHAYA FAJAR PALSU!', 540, 360, { size: 84, pop: dawnU, alpha: env(t, tBurn, b, 0.15, 0.2), fill: ['#fff3c0', '#ff6432'] });
    }
  });
});

// 8. AYAM: Fooled by the red glow and lesung rhythm, the rooster crows loudly!
shot('ayam', 'kabur', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setSkyMood(t, { night: 0.25, dawn: 1.0 });
  K.use(P, rooster.root);

  const rx = 13.5, rz = 1.5, ry = hValley(rx, rz);
  rooster.root.position.set(rx, ry, rz);
  rooster.root.rotation.y = -0.65;
  const tCrow = W_('ayam', 'berkokok') - 0.15;
  const crow = env(t, tCrow, b + 0.1, 0.15, 0.1);
  K.roosterPose(rooster, { crow, t, flap: crow });

  cam(L3([rx - 1.4, ry + 0.95, rz + 2.4], [rx - 1.1, ry + 0.85, rz + 1.95], ease.inOutSine(p)), [rx, ry + 0.65, rz], 38, t, 0.025);
  S.render(P);

  ui2(() => {
    if (crow > 0.05) {
      const [hx, hy] = scr(rx, ry + 0.9, rz);
      K.rings(ui, hx, hy - 30, t, { n: 3, r: 260, color: '255,240,190', alpha: crow });
      K.title(ui, 'KUKURUYUUK!', 540, 320, { size: 108, pop: (t - tCrow) / 0.28, rot: -0.05 + Math.sin(t * 28) * 0.015 * crow, fill: ['#fff7c0', '#ffad2e'] });
    }
  });
});

// 9. KABUR: The panicked jins flee in all directions leaving the 1000th candi unfinished; Bandung Bondowoso rages!
shot('kabur', 'arca', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  setSkyMood(t, { night: 0.15, dawn: 0.9 });
  K.use(P, bandung.root, ...jins);

  // Jins fleeing upwards and outwards in panic
  const fleeU = clamp((t - a) / 1.4);
  jins.forEach((J, i) => {
    J.visible = fleeU < 0.95;
    const ang = (i / jins.length) * TAU;
    J.position.set(
      2.5 + Math.cos(ang) * (1.5 + fleeU * 14),
      2.2 + fleeU * 9 + Math.sin(t * 8 + i) * 0.2,
      -3.5 + Math.sin(ang) * (1.5 + fleeU * 14)
    );
    J.rotation.y = ang + Math.PI / 2;
    J.scale.setScalar(Math.max(0.01, (1 - fleeU) * 0.72));
    K.jinTick(J, t, i, 1);
  });

  const tMurka = W_('kabur', 'murka') - 0.15;
  const angry = prog(t, tMurka, tMurka + 0.35, ease.outCubic);
  bandung.j.hc.children[0].material.color.set(K.mix('#e0a579', '#ff5e48', angry * 0.65));
  K.pose(bandung, {
    x: 0.6, y: 0, z: 0.8,
    ry: 0.15,
    bob: -angry * 0.08,
    lean: angry * 0.18,
    armL: [lerp(0.6, 2.1, angry), 0.55, 0.8],
    armR: [lerp(0.6, 2.1, angry), 0.55, 0.8],
    head: [0, -0.12 * angry, 0],
    brow: -1, mouth: 'open', open: 0.85,
    t,
  });

  const shk = t >= tMurka ? Math.exp(-(t - tMurka) * 5) * 0.25 : 0;
  cam([lerp(2.4, 1.2, p) + noise.n2(t * 25, 1) * shk, 1.85 + noise.n2(t * 25, 2) * shk, lerp(5.8, 4.4, p)], [1.1, 1.5, -1.0], 38, t, 0.045);
  S.render(P);

  ui2(() => {
    if (t < tMurka) {
      K.nameplate(ui, 'PASUKAN JIN KABUR!', 540, 280, { size: 46, alpha: env(t, a, tMurka, 0.15, 0.15), pop: (t - a) / 0.3, color: '#8ff0ff' });
    } else {
      AM.lib.speedLines(ui, 540, 960, { count: 60, inner: 480, outer: 1500, color: 'rgba(255,220,190,0.5)', width: 9, t, seed: 11 });
      K.title(ui, 'MURKA!', 540, 300, { size: 124, pop: (t - tMurka) / 0.25, rot: Math.sin(t * 35) * 0.02, fill: ['#fff2c0', '#ff4228'], stroke: '#360604' });
    }
  });
});

// 10. ARCA: Bandung Bondowoso curses Roro Jonggrang into the stone statue completing the 1,000th temple!
shot('arca', null, (t, a, b) => {
  const p = clamp((t - a) / (AM.duration - a));
  setSkyMood(t, { night: 0, dawn: lerp(0.75, 0.3, p) });

  const tCurse = W_('arca', 'arca') - 0.2;
  const stoneU = prog(t, tCurse, tCurse + 0.85, ease.inOutCubic);

  K.use(P, bandung.root, curseSmoke, glowCurse);
  K.pose(bandung, {
    x: -1.4, y: 0, z: 0.4, ry: 1.25,
    ...K.idle(t, 3, 0.4),
    armR: [1.75, 0.2, 0.15],
    armL: [0.5, 0.3, 1.2],
    brow: -0.9, mouth: 'frown',
    t,
  });

  const rx = 2.5, rz = -1.6;
  if (stoneU < 0.5) {
    K.use(P, roro.root);
    K.pose(roro, {
      x: rx, y: 0.35, z: rz, ry: 0,
      armL: [1.3, 0.15, 1.4], armR: [1.3, 0.15, 1.4],
      head: [0, 0.05, 0], wide: 0.6, brow: 0.7, mouth: 'open', open: 0.5,
      t,
    });
  } else {
    K.use(P, arcaRoro.root);
    K.pose(arcaRoro, {
      x: rx, y: 0.35, z: rz, ry: 0,
      armL: [1.35, 0.1, 1.55], armR: [1.35, 0.1, 1.55],
      head: [0, 0.04, 0], brow: 0, mouth: 'flat', blink: 0,
    });
  }

  curseSmoke.position.set(rx, 1.2, rz);
  curseSmoke.userData.tick(t - (tCurse - 0.1));
  glowCurse.visible = stoneU > 0.05 && stoneU < 0.95;
  glowCurse.position.set(rx, 1.4, rz);
  glowCurse.material.opacity = Math.sin(stoneU * Math.PI) * 0.85;

  cam(L3([0.6, 1.75, 3.8], [1.4, 2.2, 5.2], ease.inOutSine(p)), [1.2, 1.45, -1.2], 38, t, 0.03);
  S.render(P);

  ui2(() => {
    const f = env(t, tCurse - 0.05, tCurse + 0.45, 0.08, 0.25);
    if (f > 0) {
      ui.fillStyle = `rgba(255,235,210,${f * 0.65})`;
      ui.fillRect(0, 0, 1080, 1920);
    }
    if (t >= tCurse) {
      K.title(ui, 'ARCA RORO JONGGRANG', 540, 260, { size: 78, alpha: env(t, tCurse, AM.duration + 1, 0.2, 0.15), pop: (t - tCurse) / 0.3 });
    }
    const t1000 = W_('arca', 'keseribu');
    if (t >= t1000 - 0.2) {
      K.nameplate(ui, 'PENGGENAP CANDI KE-1000', 540, 380, { size: 44, alpha: env(t, t1000 - 0.2, AM.duration + 1, 0.2, 0.15), pop: (t - t1000 + 0.2) / 0.3, color: '#ffd24a' });
    }
    const fade = clamp((t - (AM.duration - 0.45)) / 0.45);
    if (fade > 0) { ui.fillStyle = `rgba(10,5,0,${fade})`; ui.fillRect(0, 0, 1080, 1920); }
  });
});

// ------------------------------------------------------------------ render
export function render(t, AM) {
  hide(
    bandung.root, roro.root, arcaRoro.root, dayang1.root, dayang2.root,
    rooster.root, ...jins, clothFire, glowEast, glowCurse,
    icons.candi, icons.moon, sparksBuild, dustStone, fireSparks, curseSmoke
  );
  bandung.j.hc.children[0].material.color.set('#e0a579');
  candiUnfinished.position.y = 0;
  candiGrid.forEach((c) => { c.position.y = c.userData.baseY; });
  for (const pt of [sparksBuild, dustStone, fireSparks, curseSmoke]) pt.userData.tick(-1);

  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id, s.next);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  s.fn(t, Math.max(0, a), b);
  ui.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  K.finish(ui, AM, t, { flash: s.id !== 'hook' && since < 0.16 ? 0.26 * (1 - since / 0.16) : 0 });
}

