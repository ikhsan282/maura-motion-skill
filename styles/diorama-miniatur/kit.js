// AniMasters style kit: DIORAMA MINIATUR (tilt-shift miniature world, three.js).
// A toy-scale world built from primitives (vertex-coloured, baked into a few meshes), lit by one low golden
// sun with long soft shadows, golden haze and drifting mist, then photographed "with a tilt-shift lens":
// the top and bottom of the frame are blurred on a 2D layer from a downscaled copy of the 3D frame.
// Signature moves: slow drone camera (push, crane, top-down spin), time-lapse of the sun (shadows swing,
// shorten), toy people that act (paddle, turn heads, pass goods), soft labels with leader lines.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clamp, lerp, ease, hrand, noise, mulberry32, smoothstep } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  ink: '#3a2614', cream: '#fff7e8', paper: '#fbf1dc', gold: '#f2b14a', amber: '#e8893a', dusk: '#6d5a8e',
  water: '#3e5546', mud: '#7d6142', grass: '#7f9a46', grassDark: '#55703a', wood: '#7a4f2c', woodDark: '#4e321c',
  straw: '#dcb56a', skin: '#c88a5c', powder: '#efe2cf',
  baju: ['#7b4fa0', '#2f8f8a', '#d0485f', '#e3a82b', '#3f6fb5', '#c75a2a', '#5a9a4a', '#a8417e', '#e46f8e', '#2e5f8a'],
  wall: ['#9a6b43', '#b07c4c', '#7c9a8a', '#d7c39a', '#5e8fa0', '#c9a15e', '#a65b3f', '#8aa36a'],
  roof: ['#8a4a32', '#6e5a4e', '#a5643c', '#5d6b70', '#7a3b2e'],
};

// ---------------------------------------------------------------- geometry baking
const _col = new THREE.Color();
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
/** Prepare a primitive for baking: non-indexed, transformed, vertex-coloured (with optional per-face jitter). */
export function part(geo, hex, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], jitter = 0.04, seed = 1 } = {}) {
  let g = geo.index ? geo.toNonIndexed() : geo.clone();
  g.deleteAttribute('uv'); if (g.attributes.uv1) g.deleteAttribute('uv1');
  _e.set(r[0], r[1], r[2]); _q.setFromEuler(_e);
  _m.compose(_v.set(p[0], p[1], p[2]), _q, _s.set(s[0], s[1], s[2]));
  g.applyMatrix4(_m);
  const n = g.attributes.position.count, col = new Float32Array(n * 3);
  _col.set(hex);
  const base = [_col.r, _col.g, _col.b];
  for (let i = 0; i < n; i += 3) {
    const j = 1 + (hrand(i, seed) - 0.5) * 2 * jitter;
    for (let k = 0; k < 3; k++) { col[(i + k) * 3] = base[0] * j; col[(i + k) * 3 + 1] = base[1] * j; col[(i + k) * 3 + 2] = base[2] * j; }
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}
/** Merge baked parts into one geometry (one draw call). */
export function bake(parts) { return mergeGeometries(parts.filter(Boolean), false); }
/** Apply a transform to an already baked geometry list (for grouping before merge). */
export function moveAll(parts, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1] } = {}) {
  _e.set(r[0], r[1], r[2]); _q.setFromEuler(_e);
  _m.compose(_v.set(p[0], p[1], p[2]), _q, _s.set(s[0], s[1], s[2]));
  for (const g of parts) if (g) { g.applyMatrix4(_m); }
  return parts;
}

export const MAT = {};
function mats() {
  if (MAT.lambert) return MAT;
  MAT.lambert = new THREE.MeshLambertMaterial({ vertexColors: true });
  MAT.flat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  MAT.double = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  return MAT;
}

// ---------------------------------------------------------------- stage
/**
 * Create the 3D stage: renderer on a WebGL layer, camera, golden sun with one shadow map, hemisphere fill,
 * sky dome, fog. Returns S with S.clock(h) for time of day and S.render().
 */
export function stage(AM, { pr = 0.7, shadow = 1024, fov = 30, name = 'world3d', z = 0, shadowBox = 70 } = {}) {
  mats();
  const canvas = AM.layer(name, { type: 'webgl', z });
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  R.setPixelRatio(pr); R.setSize(AM.W, AM.H, false);
  R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.shadowMap.autoUpdate = true;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, AM.W / AM.H, 1, 2600);
  const sun = new THREE.DirectionalLight('#ffd29a', 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(shadow, shadow);
  const sc = sun.shadow.camera; sc.left = -shadowBox; sc.right = shadowBox; sc.top = shadowBox; sc.bottom = -shadowBox; sc.near = 1; sc.far = 700;
  sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04; sun.shadow.radius = 3;
  scene.add(sun); scene.add(sun.target);
  const hemi = new THREE.HemisphereLight('#bcd2ff', '#6b5536', 0.8);
  scene.add(hemi);
  scene.fog = new THREE.Fog('#f3c98f', 120, 900);
  const sky = skyDome();
  scene.add(sky);
  const S = { AM, R, scene, camera, sun, hemi, sky, canvas, focus: new THREE.Vector3(), sunDir: new THREE.Vector3(0, 0.2, -1), night: 0, h: 6.5, updaters: [] };
  S.clock = (h, o = {}) => setClock(S, h, o);
  S.look = (pos, target, f = null) => { camera.position.set(pos[0], pos[1], pos[2]); camera.lookAt(target[0], target[1], target[2]); if (f) { camera.fov = f; } camera.updateProjectionMatrix(); S.focus.set(target[0], target[1], target[2]); };
  S.render = (t) => {
    // keep the shadow frustum around what the camera looks at
    const f = S.focus;
    sun.target.position.copy(f);
    sun.position.copy(f).addScaledVector(S.sunDir, 300);
    for (const u of S.updaters) u(t, S);
    R.render(scene, camera);
  };
  /** project a world point to stage pixels (1080x1920) */
  S.project = (p) => { _v.set(p[0], p[1], p[2]).project(camera); return [(_v.x * 0.5 + 0.5) * AM.W, (-_v.y * 0.5 + 0.5) * AM.H, _v.z < 1]; };
  return S;
}

function skyDome() {
  const geo = new THREE.SphereGeometry(2000, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#7fa7d8') }, mid: { value: new THREE.Color('#f4c9a0') }, hor: { value: new THREE.Color('#ffd79a') },
      sunDir: { value: new THREE.Vector3(0, 0.1, -1) }, sunCol: { value: new THREE.Color('#fff0c8') }, sunSize: { value: 1 }, stars: { value: 0 } },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform vec3 top, mid, hor, sunCol, sunDir; uniform float sunSize, stars; varying vec3 vDir;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
      void main(){ vec3 d = normalize(vDir); float y = d.y;
        vec3 c = mix(hor, mid, smoothstep(-0.02, 0.12, y)); c = mix(c, top, smoothstep(0.1, 0.55, y));
        float s = max(dot(d, normalize(sunDir)), 0.);
        c += sunCol * (pow(s, 600.0/sunSize) * 6. + pow(s, 40.) * .35 + pow(s, 6.) * .18);
        if (stars > 0.) { vec3 q = floor(d * 380.); float st = step(0.9965, h(q)); c += vec3(st) * stars * smoothstep(0.05, 0.3, y); }
        gl_FragColor = vec4(c, 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = -10;
  return m;
}

const KEYS = [
  // h, sky top, mid, horizon, sun color, sun intensity, hemi sky, hemi ground, hemi int, fog color, mist, elevation (deg), exposure
  [4.6, '#070c24', '#16224a', '#2a3a66', '#9fb4ff', 0.55, '#5a6aa0', '#24222e', 0.6, '#1e2a4e', 0.25, -12, 1.1],
  [5.5, '#1d2a55', '#5a5a8a', '#d98a7a', '#ff9a6a', 0.6, '#8a8ec0', '#4a3a3a', 0.55, '#a78090', 0.65, -1.5, 1.05],
  [6.0, '#4a6aa0', '#e0a090', '#ffb36a', '#ffa860', 1.6, '#c0b8d8', '#6b5040', 0.7, '#e6a985', 0.7, 2.5, 1.05],
  [6.6, '#6f9ad0', '#efc0a0', '#ffd08a', '#ffc27a', 2.5, '#c8d4f0', '#7a6045', 0.85, '#f0c294', 0.45, 9, 1.05],
  [7.6, '#78a8dc', '#d8e2ea', '#ffe6b8', '#ffdcaa', 2.9, '#cfe0f8', '#80683f', 0.95, '#f2d6b0', 0.2, 23, 1.0],
  [9.2, '#6fa6e0', '#cfe2f2', '#f6efdc', '#fff2de', 3.1, '#d8e8ff', '#8a7448', 1.05, '#e9e4d4', 0.02, 46, 0.98],
];
const _ca = new THREE.Color(), _cb = new THREE.Color();
function lerpCol(a, b, k) { return _ca.set(a).lerp(_cb.set(b), k).getHexString(); }
/** Time of day (hours, 4.6 night .. 9.2 mid-morning). Moves the sun, recolours sky, light, fog and mist. */
export function setClock(S, h, { azimuth = 0, fogNear = null, fogFar = null } = {}) {
  S.h = h;
  let i = 0; while (i < KEYS.length - 2 && h > KEYS[i + 1][0]) i++;
  const A = KEYS[i], B = KEYS[i + 1], k = clamp((h - A[0]) / (B[0] - A[0]));
  const c = (j) => '#' + lerpCol(A[j], B[j], k), f = (j) => lerp(A[j], B[j], k);
  const u = S.sky.material.uniforms;
  u.top.value.set(c(1)); u.mid.value.set(c(2)); u.hor.value.set(c(3)); u.sunCol.value.set(c(4));
  const el = THREE.MathUtils.degToRad(f(11)), az = azimuth;
  S.sunDir.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
  u.sunDir.value.copy(S.sunDir);
  u.stars.value = clamp((5.4 - h) / 0.8) * 0.9;
  S.night = clamp((5.6 - h) / 0.9);
  // the sun light never goes below the horizon (it becomes moonlight)
  const lightEl = Math.max(el, THREE.MathUtils.degToRad(5));
  const ld = new THREE.Vector3(Math.sin(az) * Math.cos(lightEl), Math.sin(lightEl), -Math.cos(az) * Math.cos(lightEl));
  if (S.night > 0) ld.set(-0.4, 0.75, 0.5).normalize().lerp(ld, 1 - S.night).normalize();
  S.sunDir.copy(ld);
  S.sun.color.set(c(4)); S.sun.intensity = f(5);
  S.hemi.color.set(c(6)); S.hemi.groundColor.set(c(7)); S.hemi.intensity = f(8);
  S.scene.fog.color.set(c(9));
  if (fogNear !== null) S.scene.fog.near = fogNear;
  if (fogFar !== null) S.scene.fog.far = fogFar;
  S.mist = f(10);
  S.R.toneMappingExposure = f(12);
  return S;
}

// ---------------------------------------------------------------- tilt-shift (2D)
/**
 * Tilt-shift depth of field: blurred copies of the 3D frame (made by downscaling) laid over the top and
 * bottom of the frame through soft vertical masks. `focus` = sharp band centre (0..1 of height),
 * `band` = half height of the sharp band, `soft` = transition, `max` = strength.
 */
export function tiltShift(ctx, S, { focus = 0.55, band = 0.12, soft = 0.22, max = 1, angle = 0 } = {}) {
  const src = S.canvas, W = ctx.canvas.width, H = ctx.canvas.height;
  const L = cached('ts-bufs', () => {
    const mk = (d) => { const c = makeCanvas(Math.round(1080 / d), Math.round(1920 / d)); const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; return [c, g]; };
    return { a: mk(4), b: mk(9), b2: mk(18), ma: mk(4), mb: mk(9) };
  });
  const [ca, ga] = L.a, [cb, gb] = L.b, [cb2, gb2] = L.b2;
  ga.drawImage(src, 0, 0, ca.width, ca.height);
  gb.drawImage(ca, 0, 0, cb.width, cb.height);
  gb2.drawImage(cb, 0, 0, cb2.width, cb2.height);
  gb.drawImage(cb2, 0, 0, cb.width, cb.height); // extra smoothing for the strong blur
  const mask = (g, c, srcC, inner, outer) => {
    g.globalCompositeOperation = 'copy'; g.drawImage(srcC, 0, 0, c.width, c.height);
    g.globalCompositeOperation = 'destination-in';
    const gr = g.createLinearGradient(0, 0, 0, c.height);
    const f0 = focus - band, f1 = focus + band;
    const stops = [[0, 1], [clamp(f0 - outer), 1], [clamp(f0 - inner), 0], [clamp(f1 + inner), 0], [clamp(f1 + outer), 1], [1, 1]];
    let last = -1;
    for (const [p, a] of stops) { const pp = Math.max(last + 1e-4, p); last = pp; if (pp <= 1) gr.addColorStop(Math.min(1, pp), `rgba(0,0,0,${a * max})`); }
    g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'source-over';
  };
  const [cma, gma] = L.ma, [cmb, gmb] = L.mb;
  mask(gma, cma, ca, 0.0, soft * 0.6);
  mask(gmb, cmb, cb, soft * 0.45, soft * 1.4);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true;
  if (angle) { ctx.translate(W / 2, H / 2); ctx.rotate(angle); ctx.scale(1.12, 1.12); ctx.translate(-W / 2, -H / 2); }
  ctx.drawImage(cma, 0, 0, W, H);
  ctx.drawImage(cmb, 0, 0, W, H);
  ctx.restore();
}

// ---------------------------------------------------------------- props
const G = {
  box: () => new THREE.BoxGeometry(1, 1, 1),
  cyl: (n = 8) => new THREE.CylinderGeometry(0.5, 0.5, 1, n),
  cone: (n = 8) => new THREE.ConeGeometry(0.5, 1, n),
  sph: (w = 10, h = 7) => new THREE.SphereGeometry(0.5, w, h),
  ico: (d = 0) => new THREE.IcosahedronGeometry(0.5, d),
};

/** Canoe hull (jukung): pointed, with raised ends; local +x is the bow. */
function hullGeo(L = 6, Wd = 1.1, D = 0.5, nu = 22, nv = 7) {
  const pos = [], idx = [];
  for (let i = 0; i <= nu; i++) {
    const u = (i / nu) * 2 - 1;
    const w = (Wd / 2) * Math.pow(Math.max(0, 1 - u * u), 0.55);
    const d = D * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 3.2)), 0.5);
    const sheer = 0.32 * Math.pow(Math.abs(u), 3) * D;
    for (let j = 0; j <= nv; j++) {
      const th = (j / nv) * Math.PI;
      pos.push(u * L / 2, -d * Math.sin(th) + sheer, w * Math.cos(th));
    }
  }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = i * (nv + 1) + j, b = a + nv + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

/** Cargo pile parts in boat-local coordinates around (x, y, z). kinds: pisang, jeruk, sayur, kue, kelapa, bakul */
export function cargo(kind, x, y, z, seed = 1) {
  const r = mulberry32(seed * 977 + 13), P = [];
  if (kind === 'pisang') {
    for (let b = 0; b < 2; b++) {
      const bx = x + (b - 0.5) * 0.5, bz = z + (r() - 0.5) * 0.2;
      P.push(part(G.cyl(5), '#6d7a33', { p: [bx, y + 0.18, bz], s: [0.06, 0.4, 0.06], r: [0, 0, 0.3] }));
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2, rr = 0.13 + (k % 3) * 0.02;
        P.push(part(new THREE.CapsuleGeometry(0.045, 0.2, 2, 5), k % 4 ? '#f2d03b' : '#cfd04a', { p: [bx + Math.cos(a) * rr, y + 0.12 + (k % 3) * 0.06, bz + Math.sin(a) * rr], r: [Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9], seed: seed + k }));
      }
    }
  } else if (kind === 'jeruk') {
    P.push(part(G.cyl(10), '#8a6a3a', { p: [x, y + 0.08, z], s: [0.8, 0.16, 0.6] }));
    for (let k = 0; k < 13; k++) { const a = k * 2.4, rr = 0.1 + 0.2 * Math.sqrt(k / 13); P.push(part(G.ico(1), k % 5 ? '#f08a1c' : '#9fb43a', { p: [x + Math.cos(a) * rr * 1.3, y + 0.2 + (k < 4 ? 0.09 : 0), z + Math.sin(a) * rr], s: [0.17, 0.16, 0.17] })); }
  } else if (kind === 'sayur') {
    for (let k = 0; k < 5; k++) {
      const px = x + (k - 2) * 0.16, pz = z + (r() - 0.5) * 0.3;
      P.push(part(G.cone(6), k % 2 ? '#4f8f2f' : '#76b13a', { p: [px, y + 0.22, pz], s: [0.22, 0.5, 0.22], r: [Math.PI / 2 + (r() - 0.5) * 0.4, (r() - 0.5) * 0.6, 0] }));
    }
    P.push(part(G.cyl(6), '#c8e070', { p: [x, y + 0.1, z + 0.18], s: [0.7, 0.08, 0.12], r: [0, 0, Math.PI / 2] }));
  } else if (kind === 'kue') {
    P.push(part(G.cyl(14), '#c9a46a', { p: [x, y + 0.04, z], s: [0.85, 0.06, 0.85] }));
    const cols = ['#e8758f', '#7cc36a', '#f4e6c4', '#8a5a34', '#f2c14e', '#d04a6a'];
    for (let k = 0; k < 10; k++) { const a = k * 0.63, rr = k < 1 ? 0 : 0.24; P.push(part(G.box(), cols[k % cols.length], { p: [x + Math.cos(a) * rr, y + 0.11, z + Math.sin(a) * rr], s: [0.13, 0.08, 0.13], r: [0, a, 0] })); }
    P.push(part(G.box(), '#f7f1e4', { p: [x, y + 0.075, z], s: [0.1, 0.01, 0.6] }));
  } else if (kind === 'kelapa') {
    for (let k = 0; k < 5; k++) P.push(part(G.ico(1), k % 2 ? '#5f8a2c' : '#7a5a2a', { p: [x + (k % 3 - 1) * 0.24, y + 0.16 + (k > 2 ? 0.2 : 0), z + (k > 2 ? 0.05 : (k % 2 - 0.5) * 0.2)], s: [0.3, 0.26, 0.28] }));
  } else if (kind === 'bakul') {
    P.push(part(new THREE.CylinderGeometry(0.28, 0.2, 0.3, 10, 1, true), '#b78a4a', { p: [x, y + 0.15, z] }));
    P.push(part(G.sph(8, 5), '#e04a3a', { p: [x, y + 0.27, z], s: [0.5, 0.18, 0.5] }));
  }
  return P;
}

/** A jukung with its cargo (baked). Returns geometry; bow along +x. Length ~6. */
export function jukungGeo({ len = 6, wood = PAL.wood, cargoKinds = ['pisang', 'jeruk'], seed = 1 } = {}) {
  const P = [];
  P.push(part(hullGeo(len, 1.15, 0.5), wood, { jitter: 0.06, seed }));
  P.push(part(G.box(), PAL.woodDark, { p: [0, -0.22, 0], s: [len * 0.82, 0.04, 0.78] }));
  // ribs / seat planks
  for (const x of [-0.3, 0.25, 0.32]) P.push(part(G.box(), '#8b5e34', { p: [x * len, -0.02, 0], s: [0.14, 0.05, 0.98] }));
  // cargo spread over the middle and bow
  cargoKinds.forEach((k, i) => { const [sx, sz] = cargoSlot(i, len); P.push(...cargo(k, sx, -0.2, sz, seed * 7 + i)); });
  return bake(P);
}
/** Boat-local position of cargo slot i (for labels pointing at goods). */
export function cargoSlot(i, len = 6) { return [[-0.7, 0.05], [0.42, -0.06], [1.42, 0.05], [2.2, 0]][i % 4].map((v, k) => (k === 0 ? v * len / 6 : v)); }

/** Klotok: small motor boat with a roof (tourists). Baked geometry. */
export function klotokGeo({ len = 9, hull = '#2f6fa0', trim = '#e8e0cc', roof = '#b8483a', seed = 3 } = {}) {
  const P = [];
  P.push(part(hullGeo(len, 1.9, 0.8), hull, { seed }));
  P.push(part(G.box(), trim, { p: [0, 0.08, 0], s: [len * 0.86, 0.12, 1.75] }));
  P.push(part(G.box(), '#d9cdb0', { p: [-0.3, -0.25, 0], s: [len * 0.75, 0.05, 1.5] }));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.push(part(G.cyl(5), '#e8e0cc', { p: [sx * len * 0.3 - 0.3, 0.75, sz * 0.75], s: [0.07, 1.4, 0.07] }));
  P.push(part(G.box(), roof, { p: [-0.3, 1.5, 0], s: [len * 0.7, 0.12, 2.0] }));
  P.push(part(G.box(), '#f0e6cc', { p: [-0.3, 1.58, 0], s: [len * 0.66, 0.06, 1.7] }));
  // passengers
  const rr = mulberry32(seed);
  for (let k = 0; k < 4; k++) {
    const x = -len * 0.25 + k * 1.1, z = (k % 2 ? 0.45 : -0.45);
    P.push(part(G.cyl(7), PAL.baju[(k * 3 + seed) % PAL.baju.length], { p: [x, 0.25, z], s: [0.42, 0.6, 0.42] }));
    P.push(part(G.sph(), rr() < 0.5 ? '#c08458' : '#e0b48a', { p: [x, 0.7, z], s: [0.36, 0.38, 0.36] }));
  }
  return bake(P);
}

/**
 * Acil (the market woman), seated, facing +x. Returns { root, body, rig } where `rig` (arms + paddle) pivots at
 * the shoulders. Animate with acilPose().
 */
export function acil({ baju = PAL.baju[0], sarung = '#5a3d6e', hat = PAL.straw, powder = false, seed = 1 } = {}) {
  const root = new THREE.Group();
  const B = [];
  B.push(part(G.box(), sarung, { p: [0.25, 0.12, 0], s: [0.75, 0.22, 0.6] }));
  B.push(part(new THREE.CylinderGeometry(0.26, 0.36, 0.72, 10), baju, { p: [0, 0.55, 0] }));
  B.push(part(G.sph(12, 9), powder ? PAL.powder : PAL.skin, { p: [0.02, 1.06, 0], s: [0.42, 0.44, 0.42] }));
  B.push(part(G.sph(6, 5), '#1c120c', { p: [0.2, 1.09, 0.085], s: [0.05, 0.07, 0.05] }));
  B.push(part(G.sph(6, 5), '#1c120c', { p: [0.2, 1.09, -0.085], s: [0.05, 0.07, 0.05] }));
  B.push(part(G.sph(6, 5), '#e88a7a', { p: [0.19, 1.02, 0.13], s: [0.05, 0.04, 0.06] }));
  B.push(part(G.sph(6, 5), '#e88a7a', { p: [0.19, 1.02, -0.13], s: [0.05, 0.04, 0.06] }));
  // hair bun peeking under the hat
  B.push(part(G.sph(8, 6), '#2a1a10', { p: [-0.16, 1.02, 0], s: [0.22, 0.2, 0.22] }));
  // tanggui: wide, shallow cone with a ridge and a dark rim band
  B.push(part(new THREE.ConeGeometry(0.82, 0.3, 22, 1, true), hat, { p: [0, 1.36, 0], jitter: 0.08, seed }));
  B.push(part(new THREE.CylinderGeometry(0.82, 0.83, 0.03, 22, 1, true), '#a8823e', { p: [0, 1.205, 0] }));
  B.push(part(new THREE.ConeGeometry(0.2, 0.12, 10), '#c79a4e', { p: [0, 1.55, 0] }));
  const body = new THREE.Mesh(bake(B), MAT.lambert);
  body.castShadow = true; body.receiveShadow = true;
  // arms + paddle rig, pivot at shoulders (0, 0.82, 0)
  const A = [];
  A.push(part(new THREE.CapsuleGeometry(0.06, 0.42, 2, 6), baju, { p: [0.18, -0.1, 0.18], r: [0.5, 0, -1.0] }));
  A.push(part(new THREE.CapsuleGeometry(0.06, 0.42, 2, 6), baju, { p: [0.18, -0.1, -0.08], r: [-0.3, 0, -1.0] }));
  A.push(part(G.sph(6, 5), PAL.skin, { p: [0.38, -0.2, 0.28], s: [0.12, 0.12, 0.12] }));
  A.push(part(G.cyl(5), '#8a5a30', { p: [0.38, -0.35, 0.36], s: [0.05, 1.9, 0.05], r: [0.35, 0, 0] }));
  A.push(part(G.sph(8, 6), '#9a6634', { p: [0.38, -1.2, 0.68], s: [0.07, 0.62, 0.24], r: [0.35, 0, 0] }));
  const rig = new THREE.Mesh(bake(A), MAT.lambert);
  rig.castShadow = true;
  rig.position.set(0, 0.82, 0);
  root.add(body); root.add(rig);
  return { root, body, rig };
}
/** Paddle stroke. `phase` in radians; `amt` 0..1 effort; `look` head/torso turn. */
export function acilPose(a, phase, { amt = 1, look = 0, lean = 0 } = {}) {
  const sw = Math.sin(phase), up = Math.max(0, Math.cos(phase));
  a.rig.rotation.set(-0.15 - up * 0.35 * amt, look * 0.6, (sw * 0.55 - 0.1) * amt);
  a.body.rotation.set(0, look, -sw * 0.08 * amt + lean);
}

/** Stilt house (rumah panggung / lanting). Baked parts list at (x, z), facing the river along +x or -x. */
export function houseParts({ x = 0, z = 0, y0 = 0, face = 1, w = 7, d = 5, h = 3, stilt = 2.2, wall = PAL.wall[0], roof = PAL.roof[0], seed = 1, steep = 1 } = {}) {
  const P = [], rot = face > 0 ? 0 : Math.PI;
  const loc = [];
  // stilts
  for (const sx of [-0.45, 0, 0.45]) for (const sz of [-0.42, 0.42]) loc.push(part(G.cyl(5), '#4b3826', { p: [sx * w, y0 + stilt / 2 - 0.6, sz * d], s: [0.22, stilt + 1.2, 0.22] }));
  // floor + porch (titian) toward the river
  loc.push(part(G.box(), '#6e4a2c', { p: [0, y0 + stilt, 0], s: [w + 0.4, 0.22, d + 0.4] }));
  loc.push(part(G.box(), '#86603a', { p: [w * 0.5 + 1.1, y0 + stilt, 0], s: [2.2, 0.16, d * 0.7] }));
  loc.push(part(G.box(), '#86603a', { p: [w * 0.5 + 2.5, y0 + stilt * 0.5, 0], s: [0.9, 0.1, 1.2], r: [0, 0, 0.9] }));
  // walls
  loc.push(part(G.box(), wall, { p: [0, y0 + stilt + h / 2, 0], s: [w, h, d], jitter: 0.03, seed }));
  // door + windows (dark), trims
  loc.push(part(G.box(), '#3a2616', { p: [w / 2 + 0.01, y0 + stilt + 0.95, 0], s: [0.05, 1.7, 0.9] }));
  for (const sz of [-1, 1]) loc.push(part(G.box(), '#2e2016', { p: [w / 2 + 0.01, y0 + stilt + 1.5, sz * d * 0.3], s: [0.05, 0.7, 0.7] }));
  loc.push(part(G.box(), '#f1e6cc', { p: [w / 2 + 0.03, y0 + stilt + h - 0.1, 0], s: [0.05, 0.14, d] }));
  // gable roof (bubungan): a triangular prism
  const rh = 2.2 * steep;
  const shape = new THREE.Shape(); shape.moveTo(-d / 2 - 0.6, 0); shape.lineTo(0, rh); shape.lineTo(d / 2 + 0.6, 0); shape.lineTo(-d / 2 - 0.6, 0);
  const rg = new THREE.ExtrudeGeometry(shape, { depth: w + 0.9, bevelEnabled: false });
  loc.push(part(rg, roof, { p: [-w / 2 - 0.45, y0 + stilt + h, 0], r: [0, Math.PI / 2, 0], jitter: 0.05, seed: seed + 3 }));
  // log platform (batang) on the water in front
  loc.push(part(G.cyl(7), '#5e4128', { p: [w * 0.5 + 3.6, 0.05, 0], s: [0.6, 3.2, 0.6], r: [Math.PI / 2, 0, 0] }));
  loc.push(part(G.cyl(7), '#5e4128', { p: [w * 0.5 + 4.2, 0.05, 0], s: [0.6, 3.2, 0.6], r: [Math.PI / 2, 0, 0] }));
  loc.push(part(G.box(), '#8a6a44', { p: [w * 0.5 + 3.9, 0.3, 0], s: [1.6, 0.1, 2.8] }));
  moveAll(loc, { p: [x, 0, z], r: [0, rot, 0] });
  P.push(...loc);
  return P;
}
/** Window glow quads for a house (for night), same placement args as houseParts. */
export function windowParts({ x = 0, z = 0, y0 = 0, face = 1, w = 7, d = 5, stilt = 2.2 } = {}) {
  const loc = [];
  for (const sz of [-1, 1]) loc.push(part(G.box(), '#ffffff', { p: [w / 2 + 0.04, y0 + stilt + 1.5, sz * d * 0.3], s: [0.04, 0.6, 0.6], jitter: 0 }));
  moveAll(loc, { p: [x, 0, z], r: [0, face > 0 ? 0 : Math.PI, 0] });
  return loc;
}

/** Coconut palm parts at (x, z). */
export function palmParts(x, z, { h = 9, lean = 0.2, dir = 0, seed = 1, y0 = 0.5 } = {}) {
  const P = [], r = mulberry32(seed);
  const seg = 5; let px = 0, py = y0, pz = 0;
  for (let i = 0; i < seg; i++) {
    const k = i / seg, ln = h / seg;
    const nx = px + Math.cos(dir) * Math.sin(lean * (k + 0.2)) * ln, ny = py + ln * Math.cos(lean * k), nz = pz + Math.sin(dir) * Math.sin(lean * (k + 0.2)) * ln;
    const mx = (px + nx) / 2, my = (py + ny) / 2, mz = (pz + nz) / 2;
    const tilt = Math.atan2(Math.hypot(nx - px, nz - pz), ny - py);
    P.push(part(new THREE.CylinderGeometry(0.2 - k * 0.06, 0.26 - k * 0.06, ln * 1.05, 6), '#7a6248', { p: [mx, my, mz], r: [Math.sin(dir) * tilt, 0, -Math.cos(dir) * tilt], seed: seed + i }));
    px = nx; py = ny; pz = nz;
  }
  for (let f = 0; f < 8; f++) {
    const a = (f / 8) * Math.PI * 2 + r() * 0.4, droop = 0.5 + r() * 0.5;
    P.push(part(G.cone(4), f % 2 ? '#5e8a32' : '#4a7a2a', { p: [px + Math.cos(a) * 1.6, py - 0.3 * droop, pz + Math.sin(a) * 1.6], s: [0.9, 3.6, 0.12], r: [Math.sin(a) * (1.2 + droop * 0.6), -a, -Math.cos(a) * (1.2 + droop * 0.6)], seed: seed + f }));
  }
  P.push(part(G.ico(0), '#6a5a2a', { p: [px, py - 0.3, pz], s: [0.7, 0.6, 0.7] }));
  return moveAll(P, { p: [x, 0, z] });
}
/** Nipah / rumbia clump at the water's edge. */
export function nipahParts(x, z, { s = 1, seed = 1 } = {}) {
  const P = [], r = mulberry32(seed);
  for (let f = 0; f < 7; f++) {
    const a = (f / 7) * Math.PI * 2 + r(), tilt = 0.45 + r() * 0.4, L = (3 + r() * 2) * s;
    P.push(part(G.cone(4), f % 2 ? '#6c9a3a' : '#88ad48', { p: [x + Math.cos(a) * L * 0.35 * Math.sin(tilt), L * 0.45, z + Math.sin(a) * L * 0.35 * Math.sin(tilt)], s: [0.7 * s, L, 0.1], r: [Math.sin(a) * tilt, -a, -Math.cos(a) * tilt], seed: seed + f }));
  }
  return P;
}
/** Round tree (bush / mango / rambutan) parts. */
export function treeParts(x, z, { s = 1, col = '#5d8a3a', seed = 1, y0 = 0.4 } = {}) {
  const r = mulberry32(seed), P = [];
  P.push(part(G.cyl(5), '#6a4a30', { p: [x, y0 + 1.2 * s, z], s: [0.35 * s, 2.4 * s, 0.35 * s] }));
  for (let k = 0; k < 3; k++) P.push(part(G.ico(1), col, { p: [x + (r() - 0.5) * 1.6 * s, y0 + (3 + r() * 1.2) * s, z + (r() - 0.5) * 1.6 * s], s: [(2.6 + r()) * s, (2.2 + r()) * s, (2.6 + r()) * s], jitter: 0.1, seed: seed + k }));
  return P;
}

/** Simple white egret (kuntul) with flapping wings: returns { root, wings:[l,r] }. */
export function egret() {
  const root = new THREE.Group();
  const body = new THREE.Mesh(bake([
    part(G.sph(10, 7), '#f6f3ea', { s: [1.1, 0.42, 0.42] }),
    part(G.cyl(5), '#f6f3ea', { p: [0.62, 0.12, 0], s: [0.08, 0.5, 0.08], r: [0, 0, -1.2] }),
    part(G.sph(6, 5), '#f6f3ea', { p: [0.86, 0.22, 0], s: [0.2, 0.17, 0.17] }),
    part(G.cone(5), '#e6b030', { p: [1.08, 0.2, 0], s: [0.06, 0.3, 0.06], r: [0, 0, -Math.PI / 2] }),
    part(G.cyl(4), '#2a2a2a', { p: [-0.75, -0.05, 0], s: [0.04, 0.6, 0.04], r: [0, 0, 1.45] }),
  ]), MAT.lambert);
  body.castShadow = true; root.add(body);
  const wg = () => new THREE.Mesh(bake([part(G.box(), '#fbf9f2', { p: [0, 0, 0.6], s: [0.5, 0.04, 1.2] }), part(G.box(), '#fbf9f2', { p: [-0.05, 0, 1.25], s: [0.35, 0.04, 0.4] })]), MAT.double);
  const wl = wg(), wr = wg(); wr.scale.z = -1; wl.castShadow = wr.castShadow = true;
  root.add(wl); root.add(wr);
  return { root, wings: [wl, wr] };
}

// ---------------------------------------------------------------- world: a river with banks
/** river centreline x for a given z (gentle meander) */
export const riverX = (z) => 10 * Math.sin(z * 0.011) + 4 * Math.sin(z * 0.029 + 1.3);
export const RIVER_W = 46;

/**
 * Build the river world: water (animated normal map, sun glitter), sculpted banks, stilt houses, palms, nipah,
 * trees, window lights. Returns { water, windows, veg, update(t) }.
 */
export function riverWorld(S, { seed = 5, zMin = -520, zMax = 160, houses = true } = {}) {
  const r = mulberry32(seed);
  const scene = S.scene;
  // ground: sculpted height field around the river
  const GW = 520, GD = zMax - zMin, nx = 90, nz = 150;
  const gg = new THREE.PlaneGeometry(GW, GD, nx, nz); gg.rotateX(-Math.PI / 2); gg.translate(0, 0, (zMin + zMax) / 2);
  const gp = gg.attributes.position, gcol = new Float32Array(gp.count * 3), cc = new THREE.Color();
  const cMud = new THREE.Color(PAL.mud), cG = new THREE.Color(PAL.grass), cGd = new THREE.Color(PAL.grassDark), cBed = new THREE.Color('#4e4632');
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i);
    const d = Math.abs(x - riverX(z)) - RIVER_W / 2 + noise.n2(z * 0.05, 3) * 2.5;
    const y = d < 0 ? -1.5 : Math.min(1.2, 0.15 + d * 0.3) + noise.fbm2(x * 0.02, z * 0.02, 3) * 0.6 * smoothstep(4, 30, d);
    gp.setY(i, y);
    if (d < 0) cc.copy(cBed); else if (d < 2.5) cc.copy(cMud); else cc.copy(cG).lerp(cGd, clamp(0.5 + noise.fbm2(x * 0.03, z * 0.03, 2) * 1.2));
    gcol[i * 3] = cc.r; gcol[i * 3 + 1] = cc.g; gcol[i * 3 + 2] = cc.b;
  }
  gg.setAttribute('color', new THREE.BufferAttribute(gcol, 3)); gg.computeVertexNormals();
  const ground = new THREE.Mesh(gg, MAT.lambert); ground.receiveShadow = true; scene.add(ground);

  // water
  const nTex = waterNormals();
  const wmat = new THREE.MeshPhongMaterial({ color: PAL.water, specular: '#d9c49a', shininess: 220, normalMap: nTex, normalScale: new THREE.Vector2(0.16, 0.16), transparent: false });
  const wU = { uSkyLo: { value: new THREE.Color('#ffd08a') }, uSkyHi: { value: new THREE.Color('#efc0a0') }, uRefl: { value: 0.9 } };
  wmat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, wU);
    sh.fragmentShader = 'uniform vec3 uSkyLo, uSkyHi; uniform float uRefl;\n' + sh.fragmentShader.replace(
      'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;',
      `vec3 dif = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
       float fr = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.0);
       vec3 refl = mix(uSkyHi, uSkyLo, clamp(fr * 1.6, 0.0, 1.0)) * uRefl;
       dif = mix(dif, refl, 0.22 + 0.55 * fr);
       vec3 outgoingLight = dif + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;`);
  };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(GW, GD + 1400, 1, 1), wmat);
  water.rotation.x = -Math.PI / 2; water.position.set(0, 0, (zMin + zMax) / 2 - 500); water.receiveShadow = true; scene.add(water);

  // houses along both banks
  const HP = [], WP = [], VP = [];
  const edge = (z, side) => riverX(z) + side * (RIVER_W / 2 - 1.2);
  if (houses) for (const side of [-1, 1]) {
    for (let z = zMax - 20; z > zMin + 120; z -= 10 + r() * 7) {
      if (r() < 0.12) continue;
      const w = 5.5 + r() * 2.5, d = 4.5 + r() * 2, h = 2.6 + r() * 0.8, stilt = 1.8 + r() * 0.9;
      const x = edge(z, side) + side * (w / 2 + 1.2);
      const o = { x, z, face: -side, w, d, h, stilt, wall: PAL.wall[Math.floor(r() * PAL.wall.length)], roof: PAL.roof[Math.floor(r() * PAL.roof.length)], seed: Math.floor(r() * 999), steep: 0.8 + r() * 0.6 };
      HP.push(...houseParts(o)); WP.push(...windowParts(o));
      // garden behind
      if (r() < 0.7) VP.push(...palmParts(x + side * (w + 3 + r() * 6), z + (r() - 0.5) * 6, { h: 8 + r() * 5, lean: 0.15 + r() * 0.25, dir: r() * 6.28, seed: Math.floor(r() * 999) }));
      if (r() < 0.6) VP.push(...treeParts(x + side * (w + 8 + r() * 10), z + (r() - 0.5) * 8, { s: 1 + r() * 0.6, col: r() < 0.5 ? '#5d8a3a' : '#6f9a40', seed: Math.floor(r() * 999) }));
    }
  }
  // nipah along the edges and dense trees further away (also far down the river toward the horizon)
  for (const side of [-1, 1]) {
    for (let z = zMax; z > zMin; z -= 5 + r() * 6) {
      if (r() < 0.55) VP.push(...nipahParts(edge(z, side) + side * (r() * 2), z, { s: 0.8 + r() * 0.5, seed: Math.floor(r() * 999) }));
      if (z < zMin + 140 || r() < 0.35) {
        const dx = 14 + r() * 50;
        if (r() < 0.5) VP.push(...palmParts(edge(z, side) + side * dx, z, { h: 8 + r() * 6, lean: 0.2, dir: r() * 6.28, seed: Math.floor(r() * 999) }));
        else VP.push(...treeParts(edge(z, side) + side * dx, z, { s: 1.2 + r(), col: r() < 0.5 ? '#557f36' : '#6a9440', seed: Math.floor(r() * 999) }));
      }
    }
  }
  const hm = new THREE.Mesh(bake(HP), MAT.flat); hm.castShadow = true; hm.receiveShadow = true; scene.add(hm);
  const wmat2 = new THREE.MeshBasicMaterial({ vertexColors: true, color: '#2a2016', fog: true });
  const windows = new THREE.Mesh(bake(WP), wmat2); scene.add(windows);
  // vegetation with a gentle wind sway in the vertex shader
  const vmat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const sway = { value: 0 };
  vmat.onBeforeCompile = (sh) => {
    sh.uniforms.uSway = sway;
    sh.vertexShader = 'uniform float uSway;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      float hh = max(0., position.y - 1.5); transformed.x += sin(uSway * 1.3 + position.z * 0.07) * hh * hh * 0.004; transformed.z += cos(uSway * 1.1 + position.x * 0.05) * hh * hh * 0.003;`);
  };
  const veg = new THREE.Mesh(bake(VP), vmat); veg.castShadow = true; veg.receiveShadow = true; scene.add(veg);

  const W = { water, windows, veg, ground, houses: hm };
  W.update = (t) => {
    nTex.offset.set(t * 0.012, -t * 0.02);
    sway.value = t;
    const n = S.night;
    wmat2.color.set('#2a2016').lerp(new THREE.Color('#ffc46a'), clamp(n * 1.2));
    wmat.specular.set(n > 0.3 ? '#8aa0d0' : '#fff1cf');
    // the river takes some of the sky's colour
    wmat.color.set(PAL.water);
    const u = S.sky.material.uniforms; wU.uSkyLo.value.copy(u.hor.value); wU.uSkyHi.value.copy(u.mid.value).lerp(u.top.value, 0.3);
    wU.uRefl.value = lerp(0.85, 0.5, n);
  };
  S.updaters.push(W.update);
  return W;
}

function waterNormals() {
  // tileable ripple normal map from noise (computed once)
  const N = 256, c = makeCanvas(N, N), g = c.getContext('2d'), id = g.createImageData(N, N);
  const hgt = (x, y) => {
    const u = x / N * Math.PI * 2, v = y / N * Math.PI * 2;
    return noise.n3(Math.cos(u) * 1.6, Math.sin(u) * 1.6, Math.cos(v) * 4 + Math.sin(v) * 4) * 0.6 + noise.n3(Math.cos(u) * 4, Math.sin(u) * 4, Math.cos(v) * 9 + 40) * 0.3 + Math.sin(v * 6 + noise.n2(x * 0.05, y * 0.05) * 2) * 0.25;
  };
  const H = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) H[y * N + x] = hgt(x, y);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = H[y * N + ((x + 1) % N)] - H[y * N + ((x - 1 + N) % N)], dy = H[((y + 1) % N) * N + x] - H[((y - 1 + N) % N) * N + x];
    const nx = -dx * 2.2, ny = -dy * 2.2, nz = 1, l = Math.hypot(nx, ny, nz), i = (y * N + x) * 4;
    id.data[i] = (nx / l * 0.5 + 0.5) * 255; id.data[i + 1] = (ny / l * 0.5 + 0.5) * 255; id.data[i + 2] = (nz / l * 0.5 + 0.5) * 255; id.data[i + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(30, 90); tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

// ---------------------------------------------------------------- living water: ripples and mist
/** Expanding ring ripples (additive). spawn(i) -> [x, z, period, phase] describes each emitter. */
export function ripples(S, n = 80) {
  const geo = new THREE.RingGeometry(0.86, 1.0, 28); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: true });
  const im = new THREE.InstancedMesh(geo, mat, n); im.frustumCulled = false; im.renderOrder = 2;
  const col = new THREE.Color();
  for (let i = 0; i < n; i++) im.setColorAt(i, col.set('#000000'));
  S.scene.add(im);
  /** list: [{x, z, age (0..1), size}] */
  im.set = (list) => {
    for (let i = 0; i < n; i++) {
      const it = list[i];
      if (!it || it.age <= 0 || it.age >= 1) { _m.makeScale(0, 0, 0); im.setMatrixAt(i, _m); continue; }
      const s = (0.25 + it.age * 1.3) * (it.size || 1);
      _m.compose(_v.set(it.x, 0.04, it.z), _q.identity(), _s.set(s, 1, s)); im.setMatrixAt(i, _m);
      const a = Math.pow(1 - it.age, 1.6) * (it.alpha ?? 0.11);
      im.setColorAt(i, col.setRGB(a * 1.0, a * 0.92, a * 0.75));
    }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  };
  return im;
}

/** Drifting low mist: two soft noise layers just above the water. Opacity follows S.mist. */
export function mist(S, { y = 1.4, size = 700, z = -200 } = {}) {
  const tex = cached('dm-mist', () => {
    const N = 256, c = makeCanvas(N, N), g = c.getContext('2d'), id = g.createImageData(N, N);
    for (let yy = 0; yy < N; yy++) for (let x = 0; x < N; x++) {
      const u = x / N * Math.PI * 2, v = yy / N * Math.PI * 2;
      const n = noise.n3(Math.cos(u) * 1.2, Math.sin(u) * 1.2, Math.cos(v) * 2.2 + Math.sin(v) * 1.7) * 0.6 + noise.n3(Math.cos(u) * 3, Math.sin(u) * 3, Math.cos(v) * 5 + 9) * 0.4;
      const a = clamp(n * 1.3 + 0.35);
      const i = (yy * N + x) * 4; id.data[i] = 255; id.data[i + 1] = 255; id.data[i + 2] = 255; id.data[i + 3] = a * a * 255;
    }
    g.putImageData(id, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  });
  const layers = [];
  for (let k = 0; k < 2; k++) {
    const tx = tex.clone(); tx.needsUpdate = true; tx.repeat.set(3 + k, 4 + k);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, opacity: 0.4, color: '#fff3e0', fog: true }));
    m.rotation.x = -Math.PI / 2; m.position.set(0, y + k * 1.6, z); m.renderOrder = 3; S.scene.add(m); layers.push(m);
  }
  S.updaters.push((t) => {
    layers.forEach((m, k) => {
      m.material.map.offset.set(t * (0.004 + k * 0.003), t * (0.002 - k * 0.001));
      m.material.opacity = (S.mist ?? 0.4) * (0.75 - k * 0.25);
      m.visible = m.material.opacity > 0.01;
      m.material.color.set(S.night > 0.3 ? '#9aa6c8' : '#fff1dc');
    });
  });
  return layers;
}

// ---------------------------------------------------------------- 2D overlay: miniature UI
/** Small leader-line label for a 3D point: dot -> line -> cream pill with serif title and small subtitle. */
export function label(ctx, S, p3, title, { sub = '', dx = 0, dy = -170, at = null, alpha = 1, size = 54, align = 'center', t = 0 } = {}) {
  if (alpha <= 0) return;
  const [x, y, vis] = S.project(p3); if (!vis) return;
  ctx.save(); ctx.globalAlpha = alpha;
  const lx = at ? at[0] : x + dx, ly = at ? at[1] : y + dy;
  // dot with pulse
  const pr = 10 + 6 * Math.sin(t * 4);
  ctx.fillStyle = 'rgba(255,248,232,0.35)'; ctx.beginPath(); ctx.arc(x, y, pr + 8, 0, 7); ctx.fill();
  ctx.fillStyle = PAL.cream; ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 9, 0, 7); ctx.fill(); ctx.stroke();
  // leader
  const k = ease.outCubic(clamp(alpha * 1.4));
  ctx.strokeStyle = PAL.cream; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y - 10); ctx.lineTo(lerp(x, lx, k), lerp(y - 10, ly + 40, k)); ctx.stroke();
  // pill
  ctx.font = `400 ${size}px 'DM Serif Display'`;
  const tw = ctx.measureText(title).width;
  ctx.font = `700 ${Math.round(size * 0.42)}px 'Inter'`; ctx.letterSpacing = '3px';
  const sw = sub ? ctx.measureText(sub.toUpperCase()).width : 0; ctx.letterSpacing = '0px';
  const bw = Math.max(tw, sw) + 64, bh = sub ? size * 1.95 : size * 1.4;
  let bx = align === 'left' ? lx - 30 : align === 'right' ? lx - bw + 30 : lx - bw / 2;
  bx = clamp(bx, 40, 1080 - 130 - bw);
  const by = ly - bh + 40;
  ctx.shadowColor = 'rgba(60,30,10,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  ctx.fillStyle = PAL.cream; roundRect(ctx, bx, by, bw, bh, 22); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = PAL.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `400 ${size}px 'DM Serif Display'`; ctx.fillText(title, bx + bw / 2, by + (sub ? size * 0.72 : bh / 2 + 2));
  if (sub) { ctx.font = `700 ${Math.round(size * 0.42)}px 'Inter'`; ctx.letterSpacing = '3px'; ctx.fillStyle = '#9a6a3a'; ctx.fillText(sub.toUpperCase(), bx + bw / 2, by + size * 1.48); }
  ctx.restore();
}

/** Floating title block (serif, like a miniature-world poster): small caps kicker + big serif line. */
export function titleBlock(ctx, kicker, line, x, y, { alpha = 1, size = 92, color = PAL.cream, align = 'center', line2 = '' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(40,20,5,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 6;
  if (kicker) { ctx.font = `700 30px 'Inter'`; ctx.letterSpacing = '9px'; ctx.fillStyle = color; ctx.fillText(kicker.toUpperCase(), x, y - size * 0.95); ctx.letterSpacing = '0px'; }
  ctx.font = `400 ${size}px 'DM Serif Display'`; ctx.fillStyle = color; ctx.fillText(line, x, y);
  if (line2) ctx.fillText(line2, x, y + size * 1.08);
  ctx.restore();
}

/** Round clock chip "06.00 WITA" with a tiny analog face. h = hours (float). */
export function clockChip(ctx, x, y, h, { alpha = 1, scale = 1, zone = 'WITA' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(scale, scale);
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  const txt = `${String(hh).padStart(2, '0')}.${String(mm).padStart(2, '0')}`;
  ctx.font = `700 64px 'Inter'`; const tw = ctx.measureText(txt).width;
  const w = tw + 230, hgt = 116;
  ctx.shadowColor = 'rgba(60,30,10,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  ctx.fillStyle = PAL.cream; roundRect(ctx, -w / 2, -hgt / 2, w, hgt, hgt / 2); ctx.fill();
  ctx.shadowColor = 'transparent';
  // face
  const fx = -w / 2 + 62;
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(fx, 0, 36, 0, 7); ctx.stroke();
  ctx.lineCap = 'round';
  const ah = (h % 12) / 12 * Math.PI * 2 - Math.PI / 2, am = (h % 1) * Math.PI * 2 - Math.PI / 2;
  ctx.beginPath(); ctx.moveTo(fx, 0); ctx.lineTo(fx + Math.cos(ah) * 19, Math.sin(ah) * 19); ctx.stroke();
  ctx.strokeStyle = PAL.amber; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(fx, 0); ctx.lineTo(fx + Math.cos(am) * 28, Math.sin(am) * 28); ctx.stroke();
  ctx.fillStyle = PAL.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(txt, fx + 58, 4);
  ctx.font = `700 26px 'Inter'`; ctx.letterSpacing = '4px'; ctx.fillStyle = '#9a6a3a'; ctx.fillText(zone, fx + 70 + tw, 6);
  ctx.restore();
}

/** Old-photograph treatment over the whole frame: sepia wash, paper border, corner mounts. */
export function oldPhoto(ctx, alpha = 1, t = 0) {
  if (alpha <= 0) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(122,79,34,0.32)'; ctx.fillRect(0, 0, 1080, 1920);
  const b = 46;
  ctx.fillStyle = '#efe2c4';
  ctx.fillRect(0, 0, 1080, b); ctx.fillRect(0, 1920 - b * 2.2, 1080, b * 2.2); ctx.fillRect(0, 0, b, 1920); ctx.fillRect(1080 - b, 0, b, 1920);
  ctx.strokeStyle = 'rgba(90,60,30,.55)'; ctx.lineWidth = 3; ctx.strokeRect(b, b, 1080 - 2 * b, 1920 - b * 3.2);
  ctx.fillStyle = '#5a3d22';
  for (const [x, y, r] of [[b, b, 0], [1080 - b, b, 1], [1080 - b, 1920 - b * 2.2, 2], [b, 1920 - b * 2.2, 3]]) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(r * Math.PI / 2); ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(56, -8); ctx.lineTo(-8, 56); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
