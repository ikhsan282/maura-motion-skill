// Maura Motion style kit: DUNIA BLOK (voxel world, three.js).
// Everything is cubes with 16x16 pixel textures (nearest filter, dark block borders = fake AO), warm sun with
// voxel shadows, fog to a sky gradient, and blocks that DROP IN and LOCK with a bounce. Big flat areas are single
// boxes whose UVs repeat once per world unit, so a 40x40 slab still looks like 1600 blocks but costs 12 triangles.
import * as THREE from 'three';
import { clamp, lerp, ease, hrand, noise, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export { THREE };

// ------------------------------------------------------------------ stage
export function stage(AM, { pr = 0.7, aa = false, shadows = true } = {}) {
  const canvas = AM.layer('3d', { type: 'webgl' });
  const R = new THREE.WebGLRenderer({ canvas, antialias: aa, preserveDrawingBuffer: true });
  R.setPixelRatio(pr); R.setSize(AM.W, AM.H, false);
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.NoToneMapping;
  R.shadowMap.enabled = shadows; R.shadowMap.type = THREE.PCFShadowMap;
  const cam = new THREE.PerspectiveCamera(40, AM.W / AM.H, 0.1, 500);
  const ui = AM.layer('ui');
  return { R, cam, ui, render(scene) { R.render(scene, cam); } };
}
export function shootCam(cam, pos, look, fov = 40) {
  cam.position.set(...pos); cam.lookAt(...look);
  if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}
/** Orbit position around a target: angle (rad), radius, height. */
export const orbit = (cx, cz, ang, r, y) => [cx + Math.sin(ang) * r, y, cz + Math.cos(ang) * r];
export function toScreen(cam, x, y, z) { const v = new THREE.Vector3(x, y, z).project(cam); return [(v.x + 1) / 2 * 1080, (1 - v.y) / 2 * 1920, v.z]; }

// ------------------------------------------------------------------ pixel textures
const PALS = {
  andesit: ['#8d8a85', '#7c7975', '#9b9892', '#6d6a66'],
  andesitDark: ['#6e6b67', '#5f5c58', '#7a7772', '#504d4a'],
  relief: ['#8d8a85', '#7c7975', '#a5a29b', '#5f5c58'],
  grass: ['#5fae3e', '#4f9a34', '#6fbe48', '#438a2c'],
  dirt: ['#8a5a36', '#7a4c2c', '#9a6a42', '#6a4024'],
  leaf: ['#3f8f2e', '#2f7a24', '#4fa23a', '#26661c'],
  wood: ['#8a5e34', '#7a502c', '#9a6e40', '#5e3c20'],
  sand: ['#e2cc8e', '#d6bd7c', '#ecd8a0', '#c8ae6c'],
  water: ['#3f8fd0', '#357fbe', '#5aa6e0', '#2f72ae'],
  sawah: ['#6fc0c0', '#5aa8b0', '#8ed0c8', '#4fa0a0'],
  lava: ['#ff7a1a', '#ff9a2a', '#ffcf4a', '#e0501a'],
  ash: ['#9a9590', '#8a8580', '#aaa59f', '#7a7570'],
  rock: ['#5a5560', '#4a4550', '#6a6570', '#3e3a44'],
  snow: ['#f4f6f8', '#e4e8ec', '#ffffff', '#d4d8dc'],
  gold: ['#ffd23a', '#f2b81e', '#ffe680', '#d89a10'],
};
/** 16x16 block texture for a type; `face` 'top'|'side' for grass. */
export function blockTex(type, face = 'side') {
  return cached(`vox-${type}-${face}`, () => {
    const c = makeCanvas(16, 16), g = c.getContext('2d');
    const P = PALS[type] || PALS.andesit;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const r = hrand(x, y, type.length * 7 + (face === 'top' ? 3 : 0));
      g.fillStyle = r < 0.45 ? P[0] : r < 0.75 ? P[1] : r < 0.9 ? P[2] : P[3]; g.fillRect(x, y, 1, 1);
    }
    if (type === 'grass' && face === 'side') { g.fillStyle = PALS.dirt[0]; for (let y = 4; y < 16; y++) for (let x = 0; x < 16; x++) { const r = hrand(x, y, 77); g.fillStyle = r < 0.5 ? PALS.dirt[0] : r < 0.8 ? PALS.dirt[1] : PALS.dirt[2]; if (y > 3 + (hrand(x, 5) * 3 | 0)) g.fillRect(x, y, 1, 1); } }
    if (type === 'andesit' || type === 'andesitDark' || type === 'relief') { // mortarless joints: stone courses
      g.fillStyle = 'rgba(40,36,34,0.55)'; g.fillRect(0, 7, 16, 1); g.fillRect(7, 0, 1, 7); g.fillRect(3, 8, 1, 8); g.fillRect(12, 8, 1, 8);
    }
    if (type === 'relief') { g.fillStyle = 'rgba(40,36,34,0.6)'; g.fillRect(2, 2, 3, 3); g.fillRect(9, 2, 4, 1); g.fillRect(10, 3, 2, 3); g.fillRect(5, 10, 6, 1); g.fillRect(6, 11, 1, 3); g.fillRect(9, 11, 1, 3); }
    if (type === 'wood') { g.fillStyle = 'rgba(50,30,10,0.4)'; for (let x = 2; x < 16; x += 4) g.fillRect(x, 0, 1, 16); }
    // dark rim = block edge / fake ambient occlusion
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, 15, 16, 1); g.fillRect(15, 0, 1, 16);
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(0, 0, 16, 1); g.fillRect(0, 0, 1, 16);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}
const MATS = new Map();
export function mat(type, face = 'side', { emissive = null } = {}) {
  const k = type + face + emissive;
  if (!MATS.has(k)) { const m = new THREE.MeshLambertMaterial({ map: blockTex(type, face) }); if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveMap = m.map; } MATS.set(k, m); }
  return MATS.get(k);
}
/** A box whose texture repeats once per world unit (looks like w*h*d blocks). Grass gets grass top. */
export function vbox(w, h, d, type = 'andesit', { cast = true, recv = true } = {}) {
  const g = new THREE.BoxGeometry(w, h, d); const uv = g.attributes.uv;
  // faces: +x,-x,+y,-y,+z,-z (4 verts each)
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]); }
  const side = mat(type, 'side'), top = type === 'grass' ? mat('grass', 'top') : side;
  const m = new THREE.Mesh(g, [side, side, top, side, side, side]);
  m.castShadow = cast; m.receiveShadow = recv;
  return m;
}

// ------------------------------------------------------------------ instanced blocks that drop in
/** Blocks with appear times. add(x,y,z,type,t0) -> build(scene) -> update(t). Block (x,y,z) fills [x-.5,x+.5]x[y,y+1]. */
export class Blocks {
  constructor({ drop = 6, dur = 0.45 } = {}) { this.list = {}; this.drop = drop; this.dur = dur; this.meshes = {}; }
  add(x, y, z, type = 'andesit', t0 = -1, o = {}) { (this.list[type] ||= []).push({ x, y, z, t0, s: o.s || 1, drop: o.drop ?? this.drop, spin: o.spin || 0, tout: o.tout ?? Infinity }); }
  build(scene, { cast = true } = {}) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    for (const [type, L] of Object.entries(this.list)) {
      const top = type === 'grass' ? mat('grass', 'top') : mat(type);
      const m = new THREE.InstancedMesh(geo, [mat(type), mat(type), top, mat(type), mat(type), mat(type)], L.length);
      m.castShadow = cast; m.receiveShadow = true; m.frustumCulled = false;
      scene.add(m); this.meshes[type] = m;
    }
    return this;
  }
  /** Position all blocks for time t; returns how many have landed (for counters). */
  update(t, { hideAfter = Infinity } = {}) {
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(), E = new THREE.Euler();
    let landed = 0;
    for (const [type, L] of Object.entries(this.list)) {
      const m = this.meshes[type]; let n = 0;
      for (const b of L) {
        if (b.t0 > t || t > hideAfter) continue;
        const uo = clamp((t - b.tout) / 0.7);
        if (uo >= 1) continue;
        const u = b.t0 < 0 ? 1 : clamp((t - b.t0) / this.dur);
        const fall = ease.inQuad(u);
        const bounce = u >= 1 ? Math.exp(-(t - b.t0 - this.dur) * 14) * Math.sin((t - b.t0 - this.dur) * 40) * 0.08 : 0;
        P.set(b.x, b.y + 0.5 * b.s + (1 - fall) * b.drop + bounce, b.z);
        if (uo > 0) { const d = Math.hypot(b.x, b.z) || 1; P.x += (b.x / d) * uo * 14; P.z += (b.z / d) * uo * 14; P.y += uo * 10 - uo * uo * 4; }
        E.set(uo * 6, (1 - u) * b.spin + uo * 4, (1 - u) * b.spin * 0.5); Q.setFromEuler(E);
        const sq = u >= 1 ? 1 - bounce * 2 : 1;
        S.set(b.s * (2 - sq), b.s * sq, b.s * (2 - sq)).multiplyScalar(1 - uo);
        M.compose(P, Q, S); m.setMatrixAt(n++, M);
        if (u >= 1) landed++;
      }
      m.count = n; m.instanceMatrix.needsUpdate = true;
    }
    return landed;
  }
}

// ------------------------------------------------------------------ Borobudur in blocks
/** Build-order description of a voxel Borobudur at (cx,cz). Returns { levels:[{y, hs, kind}], stupas:[{x,y,z,r,big}], topY }.
 *  Square levels: 1 foot (kaki) + 5 terraces, 3 circular terraces with 32+24+16 = 72 stupas, 1 main stupa. */
export function borobudurPlan({ base = 20 } = {}) {
  const levels = [];
  const sq = [base, base - 2, base - 4, base - 6, base - 8, base - 10];
  sq.forEach((hs, i) => levels.push({ y: i * 2, hs, h: 2, kind: i === 0 ? 'kaki' : 'tubuh' }));
  const y0 = sq.length * 2;
  const circ = [{ r: 8.6, n: 32 }, { r: 6.4, n: 24 }, { r: 4.2, n: 16 }];
  circ.forEach((c, i) => levels.push({ y: y0 + i, hs: c.r + 1.2, h: 1, kind: 'kepala', round: true, r: c.r, n: c.n }));
  const stupas = [];
  circ.forEach((c, i) => { for (let k = 0; k < c.n; k++) { const a = (k / c.n) * TAU + i * 0.2; stupas.push({ x: Math.cos(a) * c.r, y: y0 + i + 1, z: Math.sin(a) * c.r, ring: i, k }); } });
  return { levels, stupas, mainY: y0 + 3, topY: y0 + 3 + 6 };
}
/** Slab meshes for each level (one cheap box each, plus balustrade rims). Returns array of groups (one per level). */
export function borobudurSlabs(plan) {
  return plan.levels.map((L, i) => {
    const G = new THREE.Group();
    if (L.round) {
      const g = new THREE.CylinderGeometry(L.hs, L.hs, L.h, 28, 1); const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * L.hs * 6, uv.getY(k) * L.h);
      const m = new THREE.Mesh(g, [mat('andesit'), mat('andesit'), mat('andesit')]); m.position.y = L.y + L.h / 2; m.castShadow = m.receiveShadow = true; G.add(m);
      // top as a disc with world-scaled uv
      const d = new THREE.CircleGeometry(L.hs, 28); d.rotateX(-Math.PI / 2); const du = d.attributes.uv, dp = d.attributes.position; for (let k = 0; k < du.count; k++) du.setXY(k, dp.getX(k), dp.getZ(k));
      const dm = new THREE.Mesh(d, mat('andesit')); dm.position.y = L.y + L.h + 0.002; dm.receiveShadow = true; G.add(dm);
    } else {
      const m = vbox(L.hs * 2 + 1, L.h, L.hs * 2 + 1, i === 0 ? 'andesitDark' : 'relief'); m.position.y = L.y + L.h / 2; G.add(m);
      if (i > 0) { // balustrade rim with little niche stupas on the corners and every 4 blocks
        for (const s of [1, -1]) for (const ax of [0, 1]) {
          const r = vbox(ax ? 1 : L.hs * 2 + 1, 0.6, ax ? L.hs * 2 + 1 : 1, 'andesit'); r.position.set(ax ? s * L.hs : 0, L.y + L.h + 0.3, ax ? 0 : s * L.hs); G.add(r);
        }
      }
    }
    G.userData.level = L;
    return G;
  });
}
/** Stupa geometry (bell made of stacked boxes, perforated look via texture) as InstancedMesh. */
export function stupaMesh(count, { big = false } = {}) {
  const parts = [[1.5, 0.3, 0], [1.3, 0.5, 0.3], [1.1, 0.4, 0.8], [0.8, 0.3, 1.2], [0.35, 0.5, 1.5]];
  const geos = parts.map(([w, h, y]) => { const g = new THREE.BoxGeometry(w, h, w); g.translate(0, y + h / 2, 0); const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * w * 2, uv.getY(k) * h * 2); return g; });
  const merged = mergeGeos(geos);
  const tex = cached('vox-stupa', () => { const c = makeCanvas(16, 16), g = c.getContext('2d'); g.fillStyle = '#8d8a85'; g.fillRect(0, 0, 16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (hrand(x, y, 5) > 0.7) { g.fillStyle = '#7c7975'; g.fillRect(x, y, 1, 1); } g.fillStyle = '#3a3634'; for (let y = 2; y < 16; y += 6) for (let x = (y / 6 | 0) % 2 ? 1 : 4; x < 16; x += 6) g.fillRect(x, y, 3, 3); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; });
  const m = new THREE.InstancedMesh(merged, new THREE.MeshLambertMaterial({ map: tex }), count);
  m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
  return m;
}
export function mergeGeos(geos) {
  const pos = [], nor = [], uv = [], idx = []; let off = 0;
  for (const g of geos) { const gi = g.index ? g.index.array : null, n = g.attributes.position.count; pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); uv.push(...g.attributes.uv.array); if (gi) for (const i of gi) idx.push(i + off); off += n; }
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); G.setIndex(idx);
  return G;
}
/** Main stupa: a stepped dome of boxes with a spire. */
export function mainStupa() {
  const G = new THREE.Group();
  [[5, 1, 0], [4.6, 1, 1], [4, 1, 2], [3, 1, 3], [1.6, 0.8, 4], [0.9, 0.8, 4.8], [0.5, 1.2, 5.6]].forEach(([w, h, y]) => { const b = vbox(w, h, w, 'andesit'); b.position.y = y + h / 2; G.add(b); });
  return G;
}

// ------------------------------------------------------------------ nature
/** Voxel tree: trunk column + leaf cube cluster. Returns group. */
export function voxTree(h = 3, seed = 1, { palm = false } = {}) {
  const G = new THREE.Group();
  const tr = vbox(0.6, h, 0.6, 'wood'); tr.position.y = h / 2; G.add(tr);
  if (palm) { for (let i = 0; i < 4; i++) { const l = vbox(i % 2 ? 0.6 : 2.4, 0.3, i % 2 ? 2.4 : 0.6, 'leaf'); l.position.set(i === 0 ? 0.9 : i === 2 ? -0.9 : 0, h, i === 1 ? 0.9 : i === 3 ? -0.9 : 0); G.add(l); } const c = vbox(0.9, 0.5, 0.9, 'leaf'); c.position.y = h + 0.2; G.add(c); }
  else { const c = vbox(2.2, 1.6, 2.2, 'leaf'); c.position.y = h + 0.5; G.add(c); const c2 = vbox(1.2, 0.8, 1.2, 'leaf'); c2.position.y = h + 1.6; G.add(c2); if (hrand(seed, 1) > 0.5) { const c3 = vbox(1.0, 1.0, 1.0, 'leaf'); c3.position.set(1.0, h + 0.2, 0.4); G.add(c3); } }
  return G;
}
/** Stepped voxel volcano (Merapi-like) with a lava/ash crater. Returns {group, crater:[x,y,z]}. */
export function volcano({ r = 30, h = 26, steps = 13, top = 'rock' } = {}) {
  const G = new THREE.Group();
  for (let i = 0; i < steps; i++) {
    const u = i / steps, rr = r * (1 - u * 0.86), hh = h / steps;
    const type = u > 0.75 ? top : u > 0.35 ? 'rock' : 'grass';
    const b = vbox(Math.round(rr * 2), hh, Math.round(rr * 2), type, { cast: false });
    b.position.y = i * hh + hh / 2; b.rotation.y = (i % 2) * 0.0; G.add(b);
  }
  const crater = vbox(Math.round(r * 0.22), 0.4, Math.round(r * 0.22), 'lava', { cast: false }); crater.material = crater.material.map((m) => m); crater.position.y = h + 0.1; G.add(crater);
  return { group: G, crater: [0, h + 0.4, 0] };
}

// ------------------------------------------------------------------ blocky people
/** Blocky worker: box head with pixel face, shirt, sarong, arms and legs on pivots. */
export function worker({ shirt = '#c8452e', sarong = '#6a3a1e', skin = '#c88a5a', band = '#e8c040', seed = 1 } = {}) {
  const face = cached('vox-face' + skin + band, () => {
    const c = makeCanvas(8, 8), g = c.getContext('2d'); g.fillStyle = skin; g.fillRect(0, 0, 8, 8);
    g.fillStyle = '#2a1a10'; g.fillRect(0, 0, 8, 2); g.fillStyle = band; g.fillRect(0, 2, 8, 1);
    g.fillStyle = '#ffffff'; g.fillRect(1, 4, 2, 1); g.fillRect(5, 4, 2, 1); g.fillStyle = '#2a1a10'; g.fillRect(2, 4, 1, 1); g.fillRect(5, 4, 1, 1);
    g.fillStyle = '#8a4a30'; g.fillRect(3, 6, 2, 1);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
  });
  const L = (c) => new THREE.MeshLambertMaterial({ color: c });
  const skinM = L(skin), hair = L('#2a1a10'), bandM = L(band);
  const root = new THREE.Group(); const j = { root };
  const hips = new THREE.Group(); hips.position.y = 0.75; root.add(hips); j.hips = hips;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), L(shirt)); body.position.y = 0.3; hips.add(body);
  const sar = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.4, 0.34), L(sarong)); sar.position.y = -0.1; hips.add(sar);
  const head = new THREE.Group(); head.position.y = 0.6; hips.add(head); j.head = head;
  const hm = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), [skinM, skinM, hair, skinM, new THREE.MeshLambertMaterial({ map: face }), skinM]); hm.position.y = 0.23; head.add(hm);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.48), bandM); hb.position.y = 0.32; head.add(hb);
  for (const s of [1, -1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.33, 0.55, 0); hips.add(sh);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.16), skinM); arm.position.y = -0.25; sh.add(arm);
    j[s > 0 ? 'aL' : 'aR'] = sh;
    const hp = new THREE.Group(); hp.position.set(s * 0.13, -0.28, 0); hips.add(hp);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.48, 0.2), skinM); leg.position.y = -0.22; hp.add(leg);
    j[s > 0 ? 'lL' : 'lR'] = hp;
  }
  root.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  return { root, j };
}
/** Pose a worker. walk = phase (cycles) or null; carry 0..1 lifts both arms overhead. */
export function workerPose(w, { x = 0, y = 0, z = 0, ry = 0, walk = null, carry = 0, bow = 0, cheer = 0, t = 0, look = 0 } = {}) {
  const j = w.j; j.root.position.set(x, y, z); j.root.rotation.y = ry;
  const a = walk === null ? 0 : Math.sin(walk * TAU);
  j.lL.rotation.x = a * 0.7; j.lR.rotation.x = -a * 0.7;
  const armSw = a * 0.6 * (1 - carry);
  j.aL.rotation.x = -armSw - carry * 2.9 - cheer * 2.6; j.aR.rotation.x = armSw - carry * 2.9 - cheer * 2.6 * (0.8 + 0.2 * Math.sin(t * 12));
  j.aL.rotation.z = cheer * 0.4; j.aR.rotation.z = -cheer * 0.4;
  j.hips.position.y = 0.75 + (walk === null ? Math.sin(t * 2) * 0.01 : Math.abs(Math.cos(walk * TAU)) * 0.05);
  j.hips.rotation.x = bow * 0.6; j.head.rotation.y = look;
}

// ------------------------------------------------------------------ sky & particles
export function skyDome() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 12), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#4a8fe8') }, bot: { value: new THREE.Color('#cfe8ff') }, sun: { value: new THREE.Vector3(0.4, 0.3, -1).normalize() }, sunC: { value: new THREE.Color('#fff2c0') }, stars: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: `uniform vec3 top, bot, sunC, sun; uniform float stars; varying vec3 vD;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
      void main(){ vec3 d = normalize(vD); vec3 c = mix(bot, top, smoothstep(-0.02, 0.6, d.y));
        // pixel sun: a hard-edged square
        vec3 s = normalize(sun); vec3 rgt = normalize(cross(s, vec3(0.,1.,0.))); vec3 upv = cross(rgt, s);
        float px = dot(d, rgt), py = dot(d, upv); if (dot(d, s) > 0.9 && max(abs(px), abs(py)) < 0.055) c = sunC;
        c += sunC * pow(max(dot(d, s), 0.0), 12.0) * 0.25;
        if (stars > 0.0) { vec3 q = floor(d * 120.0); c += vec3(step(0.996, h(q)) * stars * smoothstep(0.0, 0.3, d.y)); }
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  }));
  m.frustumCulled = false; m.renderOrder = -10; return m;
}
export function setSky(sky, { top, bot, sun, sunC, stars }) { const u = sky.material.uniforms; if (top) u.top.value.set(top); if (bot) u.bot.value.set(bot); if (sun) u.sun.value.set(...sun).normalize(); if (sunC) u.sunC.value.set(sunC); if (stars !== undefined) u.stars.value = stars; }
export const mix = (a, b, u) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp(u)).getHexString();
/** Cube particles (dust, ash, sparks). tick(dt) positions them. */
export function cubeBurst({ n = 40, type = 'ash', size = 0.25, speed = 3, up = 4, grav = -9, life = 1.2, seed = 1, origin = [0, 0, 0], rain = false, area = 20, height = 20 } = {}) {
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(size, size, size), mat(type), n); m.frustumCulled = false;
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), E = new THREE.Euler();
  m.userData.tick = (dt) => {
    m.visible = dt >= 0 && (rain || dt <= life);
    if (!m.visible) return;
    for (let i = 0; i < n; i++) {
      if (rain) { const ph = (dt * speed / height + hrand(i, seed)) % 1; P.set(origin[0] + (hrand(i, seed + 1) - 0.5) * area, origin[1] + height * (1 - ph), origin[2] + (hrand(i, seed + 2) - 0.5) * area); }
      else { const a = hrand(i, seed) * TAU, v = speed * (0.4 + hrand(i, seed + 1)); P.set(origin[0] + Math.cos(a) * v * dt, origin[1] + up * (0.5 + hrand(i, seed + 2)) * dt + 0.5 * grav * dt * dt, origin[2] + Math.sin(a) * v * dt); }
      E.set(dt * 3 + i, dt * 2, 0); Q.setFromEuler(E); const s = rain ? 1 : clamp(1 - dt / life) + 0.1; S.set(s, s, s);
      M.compose(P, Q, S); m.setMatrixAt(i, M);
    }
    m.instanceMatrix.needsUpdate = true;
  };
  return m;
}

// ------------------------------------------------------------------ pixel UI (2D overlay)
/** Pixel title: Press Start 2P with a hard offset shadow and outline. */
export function pixTitle(ctx, str, x, y, { size = 64, color = '#ffe14a', shadow = '#3a1e00', alpha = 1, pop = 1, font = 'Press Start 2P' } = {}) {
  if (alpha <= 0) return;
  const s = pop < 1 ? Math.max(0.01, ease.outBack(clamp(pop), 2)) : 1;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(s, s); ctx.imageSmoothingEnabled = false;
  ctx.font = `400 ${size}px '${font}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const o = Math.max(4, size / 10);
  ctx.fillStyle = shadow; for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [o, o], [-o, -o], [o, -o], [-o, o]]) ctx.fillText(str, dx, dy);
  ctx.fillText(str, o * 1.6, o * 1.6);
  ctx.fillStyle = color; ctx.fillText(str, 0, 0);
  ctx.restore();
}
/** Pixel panel with border (like a game dialog box). */
export function pixPanel(ctx, str, x, y, { size = 30, alpha = 1, pop = 1, color = '#ffffff', bg = '#0b0b2a', border = '#ffffff', icon = null } = {}) {
  if (alpha <= 0) return;
  const s = pop < 1 ? Math.max(0.01, ease.outBack(clamp(pop), 2)) : 1;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `400 ${size}px 'Press Start 2P'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(str).width + size * 1.6, h = size * 2.2;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-w / 2 + 8, -h / 2 + 8, w, h);
  ctx.fillStyle = border; ctx.fillRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12);
  ctx.fillStyle = bg; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = color; ctx.fillText(str, 0, size * 0.08);
  ctx.restore();
}
/** Pixel pointer arrow (bouncing down-arrow) at screen pos. */
export function pixArrow(ctx, x, y, t, { color = '#ffe14a', alpha = 1, s = 8 } = {}) {
  if (alpha <= 0) return;
  const b = Math.abs(Math.sin(t * 6)) * 14; ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#3a1e00';
  const rows = [[0, 7], [1, 5], [2, 3], [3, 1]];
  for (const [r, w] of rows) ctx.fillRect(x - (w * s) / 2 - s * 0.5, y + b + r * s - s * 0.5, w * s + s, s * 2);
  ctx.fillStyle = color; for (const [r, w] of rows) ctx.fillRect(x - (w * s) / 2, y + b + r * s, w * s, s);
  ctx.restore();
}
/** Chunky pixel vignette + scanline-free grain finish. */
export function finish(ctx, AM, t, { flash = 0 } = {}) {
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(ctx, { strength: 0.32, inner: 0.55 });
}

/** Voxel sailing/steam ship for maritime scenes (Krakatau, Nusantara). */
export function voxShip(x = 0, y = 0, z = 0, { s = 1 } = {}) {
  const g = new THREE.Group();
  const hull = vbox(3, 1.2, 7, 'wood'); hull.position.set(0, 0.6, 0);
  const prow = vbox(2, 1.0, 2, 'wood'); prow.position.set(0, 0.7, 4);
  const deck = vbox(2.6, 0.4, 5.6, 'sand'); deck.position.set(0, 1.3, 0);
  const cabin = vbox(2, 1.2, 2.2, 'wood'); cabin.position.set(0, 1.9, -1.2);
  const mast = vbox(0.4, 5.2, 0.4, 'wood'); mast.position.set(0, 3.8, 0.6);
  const sail1 = vbox(3.2, 2.2, 0.3, 'snow'); sail1.position.set(0, 4.4, 0.9);
  const sail2 = vbox(2.6, 1.6, 0.3, 'snow'); sail2.position.set(0, 2.5, 0.9);
  const stack = vbox(0.7, 2.2, 0.7, 'andesitDark'); stack.position.set(0, 2.6, -0.4);
  g.add(hull, prow, deck, cabin, mast, sail1, sail2, stack);
  g.position.set(x, y, z); g.scale.setScalar(s);
  return g;
}

/** Voxel Red-and-White Indonesian flag on a pole. */
export function voxFlag(x = 0, y = 0, z = 0, { h = 6, s = 1 } = {}) {
  const g = new THREE.Group();
  const pole = vbox(0.25, h, 0.25, 'snow'); pole.position.set(0, h / 2, 0);
  const red = vbox(2.2, 0.7, 0.2, 'lava'); red.position.set(1.2, h - 0.5, 0);
  const white = vbox(2.2, 0.7, 0.2, 'snow'); white.position.set(1.2, h - 1.2, 0);
  g.add(pole, red, white);
  g.position.set(x, y, z); g.scale.setScalar(s);
  return g;
}
