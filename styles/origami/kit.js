// Maura Motion style kit: ORIGAMI (folded-paper 3D, three.js).
// A diorama where everything is folded washi: crisp creases, flat-shaded facets, fibre texture, two-tone
// paper (pattern outside, white inside), soft morning light with crisp paper shadows.
// Signature moves: a square sheet folding into a crane on screen, cranes flapping in flocks, garlands
// (senbazuru) filling a room, paper dolls that run and fold, colour draining to grey and coming back.
import * as THREE from 'three';
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, paperTexture, alphaTexture, roundRect, grain } from '/engine/lib/draw.js';

export const PAL = {
  paper: '#f6efe2', cream: '#efe4cf', ink: '#2a2420', inkSoft: '#5a4f45',
  vermilion: '#d8432c', sakura: '#f2a3b3', indigo: '#2e4a7d', teal: '#3b8f88', mustard: '#e3a52a',
  plum: '#7c3a6b', leaf: '#6e9c48', sky: '#9cc6e0', gold: '#d6a83e', white: '#f8f4ec', grey: '#b9b4ac',
  skyTop: '#f3d9bd', skyLow: '#fbefdf',
};
export const WASHI_COLORS = ['#d8432c', '#f2a3b3', '#2e4a7d', '#3b8f88', '#e3a52a', '#7c3a6b', '#6e9c48', '#f6efe2', '#e86f4f', '#5b8fc7', '#f0c75e', '#c25b7c'];

// ============================================================ stage
/** Renderer + scene + camera tuned for a CPU (SwiftShader) machine. */
export function createStage(AM, { pr = 0.7, aa = true, shadows = true, exposure = 1.0, fov = 32 } = {}) {
  const canvas = AM.layer('3d', { type: 'webgl', z: 0 });
  const R = new THREE.WebGLRenderer({ canvas, antialias: aa, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  R.setPixelRatio(pr); R.setSize(AM.W, AM.H, false);
  R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = exposure;
  R.shadowMap.enabled = shadows; R.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(fov, AM.W / AM.H, 0.05, 400);
  return { R, scene, cam, canvas, render: () => R.render(scene, cam) };
}

/** Key (warm sun, the only shadow caster), hemisphere fill, rim from behind. `aim()` fits the shadow box. */
export function lightRig(scene, { sun = '#ffeccc', sunI = 2.5, sky = '#e4ecff', ground = '#ead6b6', hemiI = 1.3, rim = '#ffd9b0', rimI = 1.0 } = {}) {
  const hemi = new THREE.HemisphereLight(sky, ground, hemiI);
  const key = new THREE.DirectionalLight(sun, sunI);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.015; key.shadow.radius = 2.5;
  const rimL = new THREE.DirectionalLight(rim, rimI);
  scene.add(hemi, key, key.target, rimL, rimL.target);
  const rig = {
    hemi, key, rim: rimL,
    /** point the sun at `c` from direction `dir`, shadow box of half-size `r` */
    aim(c, { dir = [0.55, 1, 0.65], r = 6, rimDir = [-0.6, 0.5, -1] } = {}) {
      const d = new THREE.Vector3(...dir).normalize();
      key.target.position.set(c[0], c[1], c[2]);
      key.position.set(c[0] + d.x * 30, c[1] + d.y * 30, c[2] + d.z * 30);
      const sc = key.shadow.camera;
      sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 1; sc.far = 70; sc.updateProjectionMatrix();
      const rd = new THREE.Vector3(...rimDir).normalize();
      rimL.target.position.set(c[0], c[1], c[2]);
      rimL.position.set(c[0] + rd.x * 20, c[1] + rd.y * 20, c[2] + rd.z * 20);
    },
    /** blend the mood: { sun, sunI, sky, ground, hemiI, rim, rimI } */
    mood(m) {
      if (m.sun) key.color.set(m.sun); if (m.sunI != null) key.intensity = m.sunI;
      if (m.sky) hemi.color.set(m.sky); if (m.ground) hemi.groundColor.set(m.ground); if (m.hemiI != null) hemi.intensity = m.hemiI;
      if (m.rim) rimL.color.set(m.rim); if (m.rimI != null) rimL.intensity = m.rimI;
    },
  };
  return rig;
}

/** Camera: position + look target (+ roll), with a tiny hand-held drift. */
export function look(cam, pos, target, { roll = 0, t = 0, drift = 0.02, fov = null } = {}) {
  const dx = noise.n2(t * 0.35, 11) * drift, dy = noise.n2(t * 0.3, 23) * drift;
  cam.position.set(pos[0] + dx, pos[1] + dy, pos[2]);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(target[0] + dx * 0.5, target[1] + dy * 0.5, target[2]);
  if (fov && cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}
/** Interpolate two camera keys {p:[x,y,z], l:[x,y,z]} with progress u (already eased). */
export function camLerp(cam, A, B, u, t, o = {}) {
  const P = A.p.map((v, i) => lerp(v, B.p[i], u)), L = A.l.map((v, i) => lerp(v, B.l[i], u));
  look(cam, P, L, { t, ...o, roll: lerp(A.roll || 0, B.roll || 0, u) });
}
/** Orbit around c: angle (rad), radius, height. */
export function orbit(cam, c, ang, rad, h, t, o = {}) {
  look(cam, [c[0] + Math.sin(ang) * rad, c[1] + h, c[2] + Math.cos(ang) * rad], c, { t, ...o });
}

// ============================================================ washi textures
function wrapDraw(w, h, x, y, fn) { for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) fn(x + ox, y + oy); }
function fibres(g, w, h, seed, { n = 240, light = 0.22, dark = 0.07 } = {}) {
  const r = mulberry32(seed);
  for (let i = 0; i < 26; i++) {
    const x = r() * w, y = r() * h, rad = 30 + r() * 120, dk = r() < 0.5;
    wrapDraw(w, h, x, y, (X, Y) => {
      const gr = g.createRadialGradient(X, Y, 0, X, Y, rad);
      gr.addColorStop(0, dk ? 'rgba(80,60,40,0.05)' : 'rgba(255,255,255,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(X - rad, Y - rad, rad * 2, rad * 2);
    });
  }
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, len = 18 + r() * 80, a = r() * TAU, isDark = r() < 0.25;
    const lw = 0.5 + r() * 1.3, bx = (r() - 0.5) * 30, by = (r() - 0.5) * 30;
    g.strokeStyle = isDark ? `rgba(70,55,35,${dark * (0.4 + r())})` : `rgba(255,255,255,${light * (0.4 + r())})`; g.lineWidth = lw;
    wrapDraw(w, h, x, y, (X, Y) => {
      g.beginPath(); g.moveTo(X, Y);
      g.bezierCurveTo(X + Math.cos(a) * len * 0.33 + bx, Y + Math.sin(a) * len * 0.33 + by, X + Math.cos(a) * len * 0.66 - bx, Y + Math.sin(a) * len * 0.66 - by, X + Math.cos(a) * len, Y + Math.sin(a) * len);
      g.stroke();
    });
  }
}
const PATTERNS = {
  plain() {},
  asanoha(g, w, h, c2) {
    const s = w / 6, hh = s * Math.sqrt(3) / 2;
    g.strokeStyle = c2; g.lineWidth = 2.2;
    const rows = Math.round(h / hh);
    for (let j = -1; j <= rows + 1; j++) for (let i = -1; i <= 7; i++) {
      const x0 = i * s + (j & 1 ? s / 2 : 0), y0 = j * hh;
      const tris = [[[x0, y0], [x0 + s, y0], [x0 + s / 2, y0 + hh]], [[x0 + s / 2, y0 + hh], [x0 + s, y0], [x0 + s * 1.5, y0 + hh]]];
      for (const T of tris) {
        const cx = (T[0][0] + T[1][0] + T[2][0]) / 3, cy = (T[0][1] + T[1][1] + T[2][1]) / 3;
        g.beginPath(); g.moveTo(T[0][0], T[0][1]); g.lineTo(T[1][0], T[1][1]); g.lineTo(T[2][0], T[2][1]); g.closePath();
        for (const P of T) { g.moveTo(P[0], P[1]); g.lineTo(cx, cy); }
        g.stroke();
      }
    }
  },
  seigaiha(g, w, h, c2, c1) {
    const R = w / 8;
    for (let j = -2; j <= Math.ceil(h / (R * 0.5)) + 2; j++) for (let i = -1; i <= 9; i++) {
      const x = i * R * 2 * 0.5 * 2 + (j & 1 ? R : 0), y = j * R * 0.5;
      for (let k = 0; k < 4; k++) {
        g.beginPath(); g.arc(x, y, R * (1 - k * 0.22), Math.PI, TAU); g.closePath();
        g.fillStyle = k % 2 ? c1 : c2; g.fill();
      }
    }
  },
  sakura(g, w, h, c2, c1, seed) {
    const r = mulberry32(seed + 5);
    for (let i = 0; i < 26; i++) {
      const x = r() * w, y = r() * h, s = 14 + r() * 16, rot = r() * TAU;
      wrapDraw(w, h, x, y, (X, Y) => {
        g.save(); g.translate(X, Y); g.rotate(rot); g.fillStyle = c2;
        for (let p = 0; p < 5; p++) {
          g.rotate(TAU / 5); g.beginPath(); g.moveTo(0, 0);
          g.bezierCurveTo(s * 0.5, -s * 0.35, s * 1.05, -s * 0.2, s, 0.08 * s); g.lineTo(s * 0.86, 0); g.lineTo(s, -0.08 * s);
          g.bezierCurveTo(s * 1.05, s * 0.2, s * 0.5, s * 0.35, 0, 0); g.fill();
        }
        g.fillStyle = 'rgba(255,240,200,0.9)'; g.beginPath(); g.arc(0, 0, s * 0.16, 0, TAU); g.fill(); g.restore();
      });
    }
  },
  kikko(g, w, h, c2) {
    const s = w / 8, hh = s * Math.sqrt(3);
    g.strokeStyle = c2; g.lineWidth = 3;
    for (let j = -1; j <= h / hh + 1; j++) for (let i = -1; i <= 6; i++) {
      const cx = i * s * 1.5 * 2 + (0), cy = j * hh;
      for (const [ox, oy] of [[0, 0], [s * 1.5, hh / 2]]) {
        g.beginPath();
        for (let k = 0; k <= 6; k++) { const a = k * TAU / 6; g.lineTo(cx + ox + Math.cos(a) * s * 0.92, cy + oy + Math.sin(a) * s * 0.92); }
        g.stroke();
      }
    }
  },
  ichimatsu(g, w, h, c2) { const s = w / 8; g.fillStyle = c2; for (let j = 0; j < h / s; j++) for (let i = 0; i < 8; i++) if ((i + j) & 1) g.fillRect(i * s, j * s, s, s); },
  dots(g, w, h, c2) { const s = w / 6; g.fillStyle = c2; for (let j = 0; j < h / s; j++) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(i * s + (j & 1 ? s / 2 : 0), j * s + s / 2, s * 0.2, 0, TAU); g.fill(); } },
  stripes(g, w, h, c2) { const s = w / 8; g.fillStyle = c2; for (let i = 0; i < 8; i += 2) g.fillRect(i * s, 0, s, h); },
  yagasuri(g, w, h, c2) {
    const s = w / 4; g.fillStyle = c2;
    for (let i = 0; i < 4; i++) for (let j = -1; j < h / s + 1; j++) if ((i + j) & 1) {
      g.beginPath(); g.moveTo(i * s, j * s); g.lineTo(i * s + s / 2, j * s + s * 0.35); g.lineTo(i * s + s, j * s); g.lineTo(i * s + s, j * s + s * 0.65); g.lineTo(i * s + s / 2, j * s + s); g.lineTo(i * s, j * s + s * 0.65); g.fill();
    }
  },
  medicine(g, w, h, c2, c1, seed) {
    // a printed medicine wrapper: rows of tiny "text", a red stamp, a fold line
    const r = mulberry32(seed + 9);
    g.fillStyle = 'rgba(60,70,90,0.55)';
    for (let y = 40; y < h - 30; y += 22) { let x = 40; while (x < w - 60) { const ww = 6 + r() * 26; g.fillRect(x, y, ww, 5); x += ww + 6; } if (r() < 0.3) y += 14; }
    g.strokeStyle = 'rgba(200,40,40,0.75)'; g.lineWidth = 6; g.beginPath(); g.arc(w * 0.72, h * 0.3, 46, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(200,40,40,0.75)'; g.fillRect(w * 0.72 - 22, h * 0.3 - 6, 44, 12); g.fillRect(w * 0.72 - 6, h * 0.3 - 22, 12, 44);
  },
  crease(g, w, h, c2) {
    // the faint creases of a crane base on a square sheet
    g.strokeStyle = c2; g.lineWidth = 2;
    const L = [[0, 0, w, h], [w, 0, 0, h], [w / 2, 0, w / 2, h], [0, h / 2, w, h / 2]];
    for (const [a, b, c, d] of L) { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); }
  },
  track(g, w, h, c2) { g.fillStyle = c2; for (let i = 0; i < 4; i++) g.fillRect(0, (i / 4) * h, w, 5); },
  wood(g, w, h, c2, c1, seed) {
    const r = mulberry32(seed + 3); g.strokeStyle = c2; g.lineWidth = 2;
    for (let i = 0; i < 18; i++) { const y = r() * h; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 6); g.stroke(); }
    g.fillStyle = c2; for (let i = 0; i < 4; i++) g.fillRect(0, (i / 4) * h, w, 3);
  },
  windowpane(g, w, h, c2) { g.strokeStyle = c2; g.lineWidth = 10; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo((i / 4) * w, 0); g.lineTo((i / 4) * w, h); g.stroke(); } for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(0, (i / 3) * h); g.lineTo(w, (i / 3) * h); g.stroke(); } },
};

/** Washi paper texture: `kind` = plain | asanoha | seigaiha | sakura | kikko | ichimatsu | dots | stripes | yagasuri |
 *  medicine | crease | track | wood | windowpane. c1 = base colour, c2 = pattern colour. repeat = [u, v]. */
export function washi(kind = 'plain', c1 = PAL.paper, c2 = PAL.white, { repeat = [1, 1], seed = 1, size = 512 } = {}) {
  const key = `washi:${kind}:${c1}:${c2}:${repeat}:${seed}:${size}`;
  return cached(key, () => {
    const img = cached(`washiImg:${kind}:${c1}:${c2}:${seed}:${size}`, () => {
      const hgt = kind === 'asanoha' ? Math.round(size / 6 * Math.sqrt(3) / 2 * 8) : size;
      const c = makeCanvas(size, hgt), g = c.getContext('2d');
      g.fillStyle = c1; g.fillRect(0, 0, size, hgt);
      (PATTERNS[kind] || PATTERNS.plain)(g, size, hgt, c2, c1, seed);
      fibres(g, size, hgt, seed * 7 + 1);
      return c;
    });
    const tx = new THREE.CanvasTexture(img);
    tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(repeat[0], repeat[1]);
    return tx;
  });
}
/** Matte paper material (flat-shaded facets). opts: side, emissive, shine (phong sheen for gold/foil) */
export function paperMat(tex, { color = '#ffffff', side = THREE.DoubleSide, emissive = '#000000', emissiveI = 0, shine = 0, flat = true } = {}) {
  const map = typeof tex === 'string' ? null : tex;
  const col = typeof tex === 'string' ? tex : color;
  if (shine) return new THREE.MeshPhongMaterial({ map, color: col, side, flatShading: flat, shininess: shine, specular: '#fff1c4', emissive, emissiveIntensity: emissiveI });
  return new THREE.MeshLambertMaterial({ map, color: col, side, flatShading: flat, emissive, emissiveIntensity: emissiveI });
}
export const goldMat = () => paperMat(washi('plain', '#d9aa45', '#fff', { seed: 4 }), { shine: 70, emissive: '#5a3a08', emissiveI: 0.35 });

/** Paper-sky backdrop as a scene.background texture: vertical gradient with fibres and a soft sun glow. */
export function skyTexture({ top = PAL.skyTop, low = PAL.skyLow, glow = '#fff6e6', gx = 0.5, gy = 0.62, seed = 2 } = {}) {
  return cached(`sky:${top}:${low}:${glow}:${gx}:${gy}`, () => {
    const c = makeCanvas(270, 480), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 480); gr.addColorStop(0, top); gr.addColorStop(1, low);
    g.fillStyle = gr; g.fillRect(0, 0, 270, 480);
    const rg = g.createRadialGradient(270 * gx, 480 * gy, 0, 270 * gx, 480 * gy, 260);
    rg.addColorStop(0, glow); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.globalAlpha = 0.8; g.fillStyle = rg; g.fillRect(0, 0, 270, 480); g.globalAlpha = 1;
    fibres(g, 270, 480, seed, { n: 120, light: 0.18, dark: 0.04 });
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
  });
}

// ============================================================ geometry helpers
/** Non-indexed triangle geometry with planar UVs (good enough for paper patterns). */
export function triGeom(tris, uvs = 1) {
  const pos = [], uv = [];
  for (const T of tris) for (const p of T) { pos.push(p[0], p[1], p[2]); uv.push(p[0] * uvs + 0.5, (p[1] + p[2]) * uvs + 0.5); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
/** Merge geometries (each with position/uv, optional normal) after applying their matrices. */
export function mergeGeoms(list) {
  const pos = [], uv = [];
  for (const { geom, matrix } of list) {
    const g = geom.index ? geom.toNonIndexed() : geom;
    const p = g.attributes.position, u = g.attributes.uv, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); if (matrix) v.applyMatrix4(matrix);
      pos.push(v.x, v.y, v.z); uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
    }
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  out.computeVertexNormals();
  return out;
}
/** Make a geometry look hand-folded: jitter vertices a little (shared positions move together). */
export function crumple(geom, amt = 0.03, seed = 1) {
  const p = geom.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = hrand(Math.round(x * 97), Math.round(y * 97), Math.round(z * 97), seed) - 0.5;
    const k2 = hrand(Math.round(x * 89), Math.round(y * 89), Math.round(z * 89), seed + 3) - 0.5;
    p.setXYZ(i, x + k * amt, y + k2 * amt * 0.6, z + (k - k2) * amt);
  }
  geom.computeVertexNormals();
  return geom;
}
const M4 = new THREE.Matrix4();
const compose = (pos = [0, 0, 0], rot = [0, 0, 0], s = 1) => new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(s, s, s));

// ============================================================ the crane
// Facing +x, wings along ±z, about 2 units nose to tail. Parts hinge like real folds.
const CR = { neckP: [0.3, -0.03, 0], tailP: [-0.3, -0.03, 0], neckL: 0.72, headL: 0.22, tailL: 0.8, wingP: [0, 0.07, 0] };
function craneBodyTris() {
  const F = [0.42, 0, 0], K = [-0.42, 0, 0], D = [0, -0.3, 0], T = [0, 0.08, 0], Sp = [0, -0.07, 0.15], Sm = [0, -0.07, -0.15];
  return [[F, Sp, T], [T, Sp, K], [F, D, Sp], [Sp, D, K], [F, T, Sm], [T, K, Sm], [F, Sm, D], [Sm, K, D]];
}
function flapTris(len, w, th, sgn = 1) {
  const A = [0, 0, 0], Q = [len, 0, 0], Bp = [0.03, -w * sgn, th], Bm = [0.03, -w * sgn, -th];
  return [[A, Bp, Q], [A, Q, Bm]];
}
function wingTris(side = 1, span = 0.9) {
  const R1 = [0.2, 0, 0], R2 = [-0.27, 0, 0], Rm = [-0.03, 0.04, 0], W = [-0.14, 0.015, span * side];
  return [[R1, Rm, W], [Rm, R2, W]];
}
export const CRANE_POSE = {
  flying: { neck: 0.45, head: -0.55, tail: Math.PI - 0.35, wing: 0.15 },
  standing: { neck: 0.95, head: -1.75, tail: Math.PI - 0.85, wing: 0.55 },
  folded: { neck: -1.55, head: 0, tail: Math.PI + 1.55, wing: 1.48 },
};
/** One hero crane with hinged parts. tex = outside paper, back = inside paper (white). */
export function makeCrane({ tex, back = null, shine = 0, castShadow = true } = {}) {
  const mat = paperMat(tex || washi('asanoha', PAL.vermilion, '#f7d1a6', { repeat: [1.4, 1.4] }), { shine });
  const g = new THREE.Group();
  const add = (parent, tris, pos) => {
    const m = new THREE.Mesh(triGeom(tris, 1.2), mat); m.castShadow = castShadow; m.receiveShadow = true;
    if (pos) m.position.set(...pos); parent.add(m); return m;
  };
  add(g, craneBodyTris());
  const neck = new THREE.Group(); neck.position.set(...CR.neckP); g.add(neck); add(neck, flapTris(CR.neckL, 0.12, 0.028, 1));
  const head = new THREE.Group(); head.position.set(CR.neckL, 0, 0); neck.add(head); add(head, flapTris(CR.headL, 0.06, 0.02, 1));
  const tail = new THREE.Group(); tail.position.set(...CR.tailP); g.add(tail); add(tail, flapTris(CR.tailL, 0.13, 0.028, -1));
  const wL = new THREE.Group(); wL.position.set(...CR.wingP); g.add(wL); add(wL, wingTris(1));
  const wR = new THREE.Group(); wR.position.set(...CR.wingP); g.add(wR); add(wR, wingTris(-1));
  g.userData = { neck, head, tail, wL, wR, mat };
  g.pose = (p) => {
    neck.rotation.z = p.neck; head.rotation.z = p.head; tail.rotation.z = p.tail;
    wL.rotation.x = -p.wing; wR.rotation.x = p.wing;
    return g;
  };
  g.pose(CRANE_POSE.flying);
  return g;
}
/** Blend two crane poses. */
export function mixPose(A, B, u) { const o = {}; for (const k in A) o[k] = lerp(A[k], B[k], u); return o; }
/** Wing angle for flapping at time t (frequency hz, phase). Downstroke is a little faster. */
export function flap(t, hz = 1.6, ph = 0, amp = 0.7, base = 0.15) {
  const x = (t * hz + ph) % 1; const s = x < 0.42 ? Math.sin((x / 0.42) * Math.PI / 2) : Math.cos(((x - 0.42) / 0.58) * Math.PI / 2);
  return base + (s * 2 - 1) * amp * 0.5 + amp * 0.1;
}
/** Static crane geometry in a pose (for garlands, piles, flocks without flapping). */
export function craneStaticGeom(pose = CRANE_POSE.standing, { wings = true } = {}) {
  const list = [{ geom: triGeom(craneBodyTris(), 1.2) }];
  const neckM = compose(CR.neckP, [0, 0, pose.neck]);
  list.push({ geom: triGeom(flapTris(CR.neckL, 0.12, 0.028, 1), 1.2), matrix: neckM });
  list.push({ geom: triGeom(flapTris(CR.headL, 0.06, 0.02, 1), 1.2), matrix: neckM.clone().multiply(compose([CR.neckL, 0, 0], [0, 0, pose.head])) });
  list.push({ geom: triGeom(flapTris(CR.tailL, 0.13, 0.028, -1), 1.2), matrix: compose(CR.tailP, [0, 0, pose.tail]) });
  if (wings) {
    list.push({ geom: triGeom(wingTris(1), 1.2), matrix: compose(CR.wingP, [-pose.wing, 0, 0]) });
    list.push({ geom: triGeom(wingTris(-1), 1.2), matrix: compose(CR.wingP, [pose.wing, 0, 0]) });
  }
  return mergeGeoms(list);
}

/** A flock of flapping cranes (3 instanced meshes). update(t, fn) where fn(i, t, o) fills
 *  o = { x, y, z, yaw, pitch, bank, s, flap(angle), visible } */
export function makeFlock(n, { colors = WASHI_COLORS, seed = 3, gold = 0.04, castShadow = false, tex = null } = {}) {
  const fibre = tex || washi('plain', '#ffffff', '#ffffff', { seed: 8 });
  const mat = paperMat(fibre);
  const body = new THREE.InstancedMesh(craneStaticGeom(CRANE_POSE.flying, { wings: false }), mat, n);
  const wl = new THREE.InstancedMesh(triGeom(wingTris(1), 1.2), mat, n);
  const wr = new THREE.InstancedMesh(triGeom(wingTris(-1), 1.2), mat, n);
  const r = mulberry32(seed), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const isGold = r() < gold;
    c.set(isGold ? '#e2b54e' : colors[Math.floor(r() * colors.length)]);
    body.setColorAt(i, c); wl.setColorAt(i, c); wr.setColorAt(i, c);
  }
  for (const m of [body, wl, wr]) { m.castShadow = castShadow; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); }
  const g = new THREE.Group(); g.add(body, wl, wr);
  const o = {}, q = new THREE.Quaternion(), e = new THREE.Euler(0, 0, 0, 'YZX'), P = new THREE.Vector3(), S = new THREE.Vector3();
  const B = new THREE.Matrix4(), W = new THREE.Matrix4(), piv = new THREE.Matrix4().makeTranslation(...CR.wingP), rot = new THREE.Matrix4();
  g.update = (t, fn) => {
    for (let i = 0; i < n; i++) {
      o.visible = true; o.s = 1; o.bank = 0; o.pitch = 0;
      fn(i, t, o);
      if (!o.visible) { B.makeScale(0, 0, 0); body.setMatrixAt(i, B); wl.setMatrixAt(i, B); wr.setMatrixAt(i, B); continue; }
      e.set(o.bank, o.yaw, o.pitch); q.setFromEuler(e); P.set(o.x, o.y, o.z); S.set(o.s, o.s, o.s);
      B.compose(P, q, S); body.setMatrixAt(i, B);
      W.copy(B).multiply(piv).multiply(rot.makeRotationX(-o.flap)); wl.setMatrixAt(i, W);
      W.copy(B).multiply(piv).multiply(rot.makeRotationX(o.flap)); wr.setMatrixAt(i, W);
    }
    body.instanceMatrix.needsUpdate = wl.instanceMatrix.needsUpdate = wr.instanceMatrix.needsUpdate = true;
  };
  g.meshes = [body, wl, wr];
  return g;
}

/** Senbazuru garlands: `strings` hanging threads of `per` cranes. Returns group with .show(k) (how many cranes are visible),
 *  .sway(t). Origin at the top of the first string; strings spread over [w x d]. */
export function makeGarlands({ strings = 25, per = 40, w = 6, d = 3, len = 4, colors = WASHI_COLORS, seed = 5, s = 0.16 } = {}) {
  const n = strings * per;
  const mat = paperMat(washi('plain', '#ffffff', '#ffffff', { seed: 9 }));
  const geom = craneStaticGeom({ neck: 0.85, head: -1.6, tail: Math.PI - 0.8, wing: 0.95 });
  const mesh = new THREE.InstancedMesh(geom, mat, n);
  const r = mulberry32(seed), c = new THREE.Color();
  const tops = [];
  for (let k = 0; k < strings; k++) tops.push([(r() - 0.5) * w, 0, (r() - 0.5) * d, r() * TAU, colors[Math.floor(r() * colors.length)], colors[Math.floor(r() * colors.length)]]);
  // order: fill string by string, bottom-up feels like "adding" — we fill round-robin so all strings grow together
  const slots = [];
  for (let j = 0; j < per; j++) for (let k = 0; k < strings; k++) slots.push([k, j]);
  slots.forEach(([k, j], i) => { c.set(j % 2 ? tops[k][4] : tops[k][5]); if (hrand(i, 3) < 0.05) c.set('#e2b54e'); mesh.setColorAt(i, c); });
  const lineGeom = new THREE.BufferGeometry();
  const lp = []; for (const T of tops) lp.push(T[0], 0.3, T[2], T[0], -len, T[2]);
  lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  const threads = new THREE.LineSegments(lineGeom, new THREE.LineBasicMaterial({ color: '#8a7c6a', transparent: true, opacity: 0.6 }));
  const g = new THREE.Group(); g.add(mesh, threads);
  mesh.frustumCulled = false; mesh.castShadow = true;
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3(s, s, s);
  let shown = n;
  g.show = (k) => { shown = Math.max(0, Math.min(n, Math.floor(k))); mesh.count = shown; };
  g.sway = (t, amp = 0.06) => {
    for (let i = 0; i < shown; i++) {
      const [k, j] = slots[i], T = tops[k];
      const sw = Math.sin(t * 0.9 + k * 1.7) * amp * (j / per);
      e.set(0, T[3] + j * 0.5 + Math.sin(t * 0.7 + i) * 0.15, sw); q.setFromEuler(e);
      P.set(T[0] + Math.sin(sw) * j * 0.1, -0.15 - j * (len / per), T[2]);
      M.compose(P, q, S); mesh.setMatrixAt(i, M);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
  g.count = n; g.mesh = mesh;
  g.sway(0);
  return g;
}

// ============================================================ the folding sheet (hook signature)
/** A square sheet (side 2*h) that folds in half twice on hinges. fold(u1, u2): 0..1 progress of the two folds.
 *  Front = pattern, back = white (two-tone paper). */
export function makeFoldSheet({ tex, back, h = 1 } = {}) {
  const C = [[-h, 0, -h], [h, 0, -h], [h, 0, h], [-h, 0, h]], O = [0, 0, 0];
  const tris = [[C[0], C[1], O], [C[1], C[2], O], [C[2], C[3], O], [C[3], C[0], O]];
  const geom = triGeom(tris, 0.5 / h);
  // uv = position mapped to the square
  const uv = geom.attributes.uv; const p0 = geom.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, p0.getX(i) / (2 * h) + 0.5, p0.getZ(i) / (2 * h) + 0.5);
  const base = Float32Array.from(p0.array);
  const front = new THREE.Mesh(geom, paperMat(tex || washi('asanoha', PAL.vermilion, '#f7d1a6'), { side: THREE.FrontSide }));
  const backM = new THREE.Mesh(geom, paperMat(back || washi('crease', PAL.white, 'rgba(120,100,80,0.25)'), { side: THREE.BackSide }));
  front.castShadow = backM.castShadow = true; front.receiveShadow = backM.receiveShadow = true;
  const g = new THREE.Group(); g.add(front, backM);
  const v = new THREE.Vector3(), ax1 = new THREE.Vector3(1, 0, -1).normalize(), ax2 = new THREE.Vector3(1, 0, 1).normalize();
  const eps = 0.006 * h;
  // which triangles fold: T0 & T3 on fold 1 (about the C1-C3 diagonal), T0 & T1 on fold 2 (about O-C2)
  const F1 = [1, 0, 0, 1], F2 = [1, 1, 0, 0];
  g.fold = (u1, u2) => {
    const P = geom.attributes.position;
    for (let i = 0; i < P.count; i++) {
      const tri = Math.floor(i / 3);
      v.set(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]);
      if (F1[tri]) { v.y -= eps * 0.5; v.applyAxisAngle(ax1, u1 * Math.PI); v.y += eps * 0.5; }
      if (F2[tri]) { v.y -= eps * 1.5; v.applyAxisAngle(ax2, u2 * Math.PI); v.y += eps * 1.5; }
      P.setXYZ(i, v.x, v.y, v.z);
    }
    P.needsUpdate = true; geom.computeVertexNormals();
  };
  g.fold(0, 0);
  return g;
}

// ============================================================ paper dolls
/** A folded-paper figure (about 1.5 tall at s=1), facing +z. Joints: head, armL/armR (shoulder pivots),
 *  legL/legR (hip pivots). pose({ armL:[pitch,roll], armR, legL, legR, head:[yaw,pitch], lean, bob }) */
export function makeDoll({ top = PAL.white, topTex = null, skirt = PAL.indigo, skirtTex = null, skin = '#f3dcc4', hair = '#26211e', s = 1, kimono = false, child = false } = {}) {
  const g = new THREE.Group(), root = new THREE.Group(); g.add(root);
  const M = (c, tx) => paperMat(tx || washi('plain', c, c, { seed: 11 }));
  const mk = (geo, mat, pos, par = root) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; par.add(m); return m; };
  const k = child ? 0.8 : 1;
  const legH = kimono ? 0.36 * k : 0.5 * k, hipY = legH + 0.02;
  // legs
  const legL = new THREE.Group(), legR = new THREE.Group();
  legL.position.set(0.075, hipY, 0); legR.position.set(-0.075, hipY, 0); root.add(legL, legR);
  const legGeo = new THREE.CylinderGeometry(0.05, 0.042, legH, 4); legGeo.translate(0, -legH / 2, 0);
  const shoeGeo = new THREE.BoxGeometry(0.1, 0.06, 0.16); shoeGeo.translate(0, -legH, 0.03);
  for (const L of [legL, legR]) { mk(legGeo, M(kimono ? '#f2ede4' : skin), [0, 0, 0], L); mk(shoeGeo, M('#3a2f2a'), [0, 0, 0], L); }
  // skirt / kimono body
  const body = new THREE.Group(); body.position.set(0, hipY, 0); root.add(body);
  const skH = kimono ? 0.62 * k : 0.34 * k;
  const skGeo = new THREE.CylinderGeometry(0.15, kimono ? 0.26 : 0.3, skH, 8, 1, true); skGeo.translate(0, kimono ? skH / 2 - 0.3 * k : -skH / 2 + 0.12, 0);
  mk(skGeo, M(skirt, skirtTex), [0, 0, 0], body);
  const toH = 0.36 * k;
  const toGeo = new THREE.CylinderGeometry(0.11, 0.15, toH, 6); toGeo.translate(0, toH / 2 + 0.1 * k, 0);
  mk(toGeo, M(top, topTex), [0, 0, 0], body);
  if (kimono) { const ob = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 8); mk(ob, M(PAL.mustard), [0, 0.12 * k, 0], body); }
  // collar fold
  const col = new THREE.ConeGeometry(0.13, 0.12, 6, 1, true); col.rotateX(Math.PI); mk(col, M(kimono ? '#f6efe2' : '#fefcf6'), [0, toH + 0.08 * k, 0.005], body);
  // arms
  const shY = toH + 0.06 * k;
  const armL = new THREE.Group(), armR = new THREE.Group();
  armL.position.set(0.16, shY, 0); armR.position.set(-0.16, shY, 0); body.add(armL, armR);
  const armH = 0.42 * k;
  const armGeo = new THREE.CylinderGeometry(0.045, 0.04, armH, 4); armGeo.translate(0, -armH / 2, 0);
  const handGeo = new THREE.IcosahedronGeometry(0.045, 0); handGeo.translate(0, -armH - 0.02, 0);
  for (const A of [armL, armR]) { mk(armGeo, M(kimono ? skirt : top, kimono ? skirtTex : topTex), [0, 0, 0], A); mk(handGeo, M(skin), [0, 0, 0], A); }
  // head
  const head = new THREE.Group(); head.position.set(0, toH + 0.2 * k, 0); body.add(head);
  const hr = child ? 0.19 : 0.17;
  mk(new THREE.IcosahedronGeometry(hr, 1), M(skin), [0, 0.1, 0], head);
  const hairM = M(hair);
  const cap = new THREE.SphereGeometry(hr * 1.09, 8, 5, 0, TAU, 0, Math.PI * 0.52); mk(cap, hairM, [0, 0.11, -0.01], head);
  const bob = new THREE.CylinderGeometry(hr * 1.1, hr * 1.18, hr * 1.1, 9, 1, true, Math.PI * 0.32, Math.PI * 1.36); mk(bob, hairM, [0, 0.06, -0.01], head);
  const bang = new THREE.BoxGeometry(hr * 1.5, hr * 0.42, 0.05); const bm = mk(bang, hairM, [0, 0.2, hr * 0.82], head); bm.rotation.x = -0.35;
  // face: two ink eyes and blush (tiny paper cut-outs)
  const eyeM = new THREE.MeshBasicMaterial({ color: '#2a211c' });
  const eyeG = new THREE.CircleGeometry(0.018, 6);
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(eyeG, eyeM); e.position.set(sx * 0.06, 0.1, hr * 0.98); e.scale.set(1, 0.7, 1); head.add(e);
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.026, 6), new THREE.MeshBasicMaterial({ color: '#f0a5a0', transparent: true, opacity: 0.75 }));
    b.position.set(sx * 0.1, 0.05, hr * 0.94); b.rotation.y = sx * 0.35; head.add(b);
  }
  g.scale.setScalar(s);
  g.userData = { root, body, head, armL, armR, legL, legR, hipY };
  g.hand = (side = 'L') => { const A = side === 'L' ? armL : armR; const v = new THREE.Vector3(0, -armH - 0.02, 0); A.updateWorldMatrix(true, false); return v.applyMatrix4(A.matrixWorld); };
  g.pose = (p = {}) => {
    const a = p.armL || [0, 0.15], b = p.armR || [0, 0.15];
    armL.rotation.set(a[0], 0, a[1]); armR.rotation.set(b[0], 0, -b[1]);
    legL.rotation.x = p.legL || 0; legR.rotation.x = p.legR || 0;
    const hd = p.head || [0, 0]; head.rotation.set(hd[1], hd[0], hd[2] || 0);
    body.rotation.x = p.lean || 0; root.position.y = p.bob || 0;
    body.rotation.z = p.tilt || 0;
    return g;
  };
  g.pose();
  return g;
}
/** Running cycle pose at phase ph (radians). */
export function runPose(ph, amt = 1) {
  const s = Math.sin(ph);
  return { legL: s * 0.8 * amt, legR: -s * 0.8 * amt, armL: [-s * 0.9 * amt, 0.2], armR: [s * 0.9 * amt, 0.2], lean: 0.18 * amt, bob: Math.abs(Math.cos(ph)) * 0.05 * amt, head: [0, -0.1] };
}

// ============================================================ landscape pieces
/** Faceted paper mountain (cone with jittered vertices), optional snow cap. */
export function paperMountain({ h = 4, r = 3, seg = 6, color = '#c9d6dc', tex = null, snow = true, seed = 1 } = {}) {
  const g = new THREE.Group();
  const geo = crumple(new THREE.ConeGeometry(r, h, seg, 2).toNonIndexed(), r * 0.12, seed); geo.translate(0, h / 2, 0);
  const m = new THREE.Mesh(geo, paperMat(tex || washi('plain', color, color, { seed: seed + 20 }))); m.castShadow = m.receiveShadow = true; g.add(m);
  if (snow) {
    const sg = crumple(new THREE.ConeGeometry(r * 0.32, h * 0.32, seg, 1).toNonIndexed(), r * 0.03, seed + 1); sg.translate(0, h - h * 0.16 + 0.02, 0);
    const sm = new THREE.Mesh(sg, paperMat(washi('plain', '#fbf8f1', '#fff', { seed: 31 }))); sm.scale.setScalar(1.02); g.add(sm);
  }
  return g;
}
/** Paper pine (three stacked folded cones). */
export function paperTree({ h = 1.4, color = '#5f8f4a', seed = 1 } = {}) {
  const g = new THREE.Group(); const mat = paperMat(washi('plain', color, color, { seed: 40 + seed }));
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.ConeGeometry(h * (0.42 - i * 0.1), h * 0.45, 5), mat);
    c.position.y = h * (0.35 + i * 0.22); c.rotation.y = i * 0.6 + seed; c.castShadow = true; g.add(c);
  }
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.05, h * 0.06, h * 0.3, 4), paperMat('#7a5a3e')); tr.position.y = h * 0.15; g.add(tr);
  return g;
}
/** Paper house: box + folded roof prism. */
export function paperHouse({ w = 1, d = 0.8, h = 0.6, wall = '#efe3cf', roof = '#4a4d57', seed = 1 } = {}) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), paperMat(washi('plain', wall, wall, { seed: 50 + seed })));
  b.position.y = h / 2; b.castShadow = b.receiveShadow = true; g.add(b);
  const rr = d * 0.66, rg = new THREE.CylinderGeometry(rr, rr, w * 1.12, 3, 1); rg.rotateZ(Math.PI / 2); rg.rotateX(-Math.PI / 2);
  const r = new THREE.Mesh(rg, paperMat(washi('plain', roof, roof, { seed: 60 + seed })));
  r.scale.set(1, 0.7, 1); r.position.y = h + rr * 0.5 * 0.7; r.castShadow = true; g.add(r);
  g.userData.roof = r;
  return g;
}
/** Flat paper cut-out cloud (thin extruded shape). */
export function paperCloud({ w = 2.4, color = '#fffaf2', seed = 1 } = {}) {
  const r = mulberry32(seed), sh = new THREE.Shape();
  const n = 4 + Math.floor(r() * 2), pts = [];
  sh.moveTo(-w / 2, 0);
  for (let i = 0; i < n; i++) {
    const x0 = -w / 2 + (i / n) * w, x1 = -w / 2 + ((i + 1) / n) * w, hh = w * (0.18 + r() * 0.22) * Math.sin(((i + 0.5) / n) * Math.PI) + w * 0.06;
    sh.bezierCurveTo(x0, hh, x1, hh, x1, 0.02);
  }
  sh.lineTo(-w / 2, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false, curveSegments: 6 });
  const m = new THREE.Mesh(geo, paperMat(washi('plain', color, '#fff', { seed: 70 + seed }), { emissive: color, emissiveI: 0.15 }));
  return m;
}
/** Paper sun disc (slightly emissive) with a ring of folded rays. */
export function paperSun({ r = 1.2, color = '#f4a25a', ray = '#f7c88a' } = {}) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 18), paperMat(washi('plain', color, color, { seed: 80 }), { emissive: color, emissiveI: 0.6 }));
  g.add(disc);
  const rays = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    rays.push([[Math.cos(a - 0.12) * r * 1.12, Math.sin(a - 0.12) * r * 1.12, -0.01], [Math.cos(a) * r * 1.55, Math.sin(a) * r * 1.55, -0.01], [Math.cos(a + 0.12) * r * 1.12, Math.sin(a + 0.12) * r * 1.12, -0.01]]);
  }
  g.add(new THREE.Mesh(triGeom(rays), paperMat(ray, { emissive: ray, emissiveI: 0.5 })));
  return g;
}
/** Flat paper ribbon (river, road, track) along points [[x,z],...] at height y. */
export function paperRibbon(pts, { width = 1, y = 0.01, tex = null, color = '#7fb0cf' } = {}) {
  const curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, y, z)));
  const N = 60, pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, p = curve.getPoint(u), tg = curve.getTangent(u); const nx = -tg.z, nz = tg.x; const l = Math.hypot(nx, nz) || 1;
    pos.push(p.x + nx / l * width / 2, y, p.z + nz / l * width / 2, p.x - nx / l * width / 2, y, p.z - nz / l * width / 2);
    uv.push(0, u * 8, 1, u * 8);
    if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, paperMat(tex || washi('seigaiha', color, '#a8cfe4', { repeat: [1, 1] }))); m.receiveShadow = true;
  return m;
}
/** Large ground sheet. */
export function paperGround({ size = 60, tex = null, color = PAL.cream, repeat = 8 } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), paperMat(tex || washi('plain', color, color, { seed: 90, repeat: [repeat, repeat] })));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m;
}
/** Bunting line of paper triangle flags between two points. */
export function bunting(a, b, { n = 12, sag = 0.4, colors = WASHI_COLORS, size = 0.22 } = {}) {
  const tris = [], cols = [];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, x = lerp(a[0], b[0], u), z = lerp(a[2], b[2], u), y = lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * sag;
    tris.push([[x - size / 2, y, z], [x + size / 2, y, z], [x, y - size * 1.2, z]]);
  }
  const g = new THREE.Group();
  tris.forEach((T, i) => { const m = new THREE.Mesh(triGeom([T]), paperMat(colors[i % colors.length])); g.add(m); });
  return g;
}

// ============================================================ 2D overlay (titles, tags, counters)
const SERIF = 'Playfair Display', CJK = "'Noto Serif CJK JP', 'Noto Serif JP', serif";
/** Paper tag label: washi strip with ink text and a small vermilion hanko. */
export function tag(ctx, text, x, y, { size = 40, alpha = 1, sub = null, color = PAL.ink, paper = '#fbf6ec', accent = PAL.vermilion, rot = -0.015, kanji = null } = {}) {
  if (alpha <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `700 ${size}px '${SERIF}'`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${size * 0.06}px`;
  const tw = ctx.measureText(text).width;
  let sw = 0; if (sub) { ctx.font = `400 ${size * 0.5}px '${SERIF}'`; sw = ctx.measureText(sub).width; }
  const kw = kanji ? size * 1.25 : 0;
  const w = Math.max(tw, sw) + size * 1.3 + kw + (kanji ? size * 0.25 : 0), h = size * (sub ? 2.1 : 1.55);
  // shadow + strip with torn ends
  ctx.fillStyle = 'rgba(60,40,20,0.22)'; tornRect(ctx, -w / 2 + 6, -h / 2 + 8, w, h, 1); ctx.fill();
  ctx.fillStyle = paper; tornRect(ctx, -w / 2, -h / 2, w, h, 2); ctx.fill();
  ctx.fillStyle = accent; ctx.fillRect(-w / 2, -h / 2, size * 0.18, h);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  const cx = (-w / 2 + size * 0.18 + kw + w / 2) / 2;
  ctx.font = `700 ${size}px '${SERIF}'`;
  ctx.fillText(text, cx, sub ? -size * 0.33 : 2);
  if (sub) { ctx.font = `400 ${size * 0.5}px '${SERIF}'`; ctx.fillStyle = PAL.inkSoft; ctx.fillText(sub, cx, size * 0.52); }
  if (kanji) {
    const kx = -w / 2 + size * 0.18 + kw / 2 + size * 0.12, ky = 0;
    ctx.fillStyle = accent; ctx.fillRect(kx - size * 0.55, ky - size * 0.55, size * 1.1, size * 1.1);
    ctx.fillStyle = '#fff6ea'; ctx.font = `700 ${size * (kanji.length > 1 ? 0.48 : 0.8)}px ${CJK}`;
    if (kanji.length > 1) { ctx.fillText(kanji[0], kx, ky - size * 0.24); ctx.fillText(kanji[1], kx, ky + size * 0.26); } else ctx.fillText(kanji, kx, ky + 2);
  }
  ctx.restore();
}
function tornRect(ctx, x, y, w, h, seed) {
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y);
  for (let i = 0; i <= 8; i++) ctx.lineTo(x + w + (hrand(seed, i) - 0.5) * 8, y + (i / 8) * h);
  ctx.lineTo(x, y + h);
  for (let i = 8; i >= 0; i--) ctx.lineTo(x + (hrand(seed + 5, i) - 0.5) * 8, y + (i / 8) * h);
  ctx.closePath();
}
/** Big title: ink serif with optional kanji above, on a soft paper glow (readable over any frame). */
export function title(ctx, text, x, y, { size = 96, alpha = 1, kanji = null, sub = null, color = PAL.ink, glow = 'rgba(255,250,240,0.85)', spacing = 0.08 } = {}) {
  if (alpha <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const gl = glowSprite(glow);
  const gw = Math.max(560, text.length * size * 0.62), gh = size * (kanji ? 3.2 : 2) + (sub ? size * 0.7 : 0);
  ctx.drawImage(gl, x - gw / 2 - 120, y - gh / 2 - (kanji ? size * 0.55 : 0) - 40, gw + 240, gh + 80);
  if (kanji) { ctx.font = `700 ${size * 0.82}px ${CJK}`; ctx.fillStyle = PAL.vermilion; ctx.fillText(kanji, x, y - size * 1.0); }
  ctx.font = `700 ${size}px '${SERIF}'`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${size * spacing}px`;
  ctx.fillStyle = color; ctx.fillText(text, x, y + (kanji ? size * 0.12 : 0));
  if (sub) { ctx.font = `400 ${size * 0.34}px '${SERIF}'`; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${size * 0.05}px`; ctx.fillStyle = PAL.inkSoft; ctx.fillText(sub, x, y + size * (kanji ? 0.95 : 0.85)); }
  ctx.restore();
}
function glowSprite(col) {
  return cached('glow:' + col, () => {
    const c = makeCanvas(128, 64), g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 32, 0, 64, 32, 64); gr.addColorStop(0, col); gr.addColorStop(0.55, col.replace(/[\d.]+\)$/, '0.45)')); gr.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    g.setTransform(1, 0, 0, 0.5, 0, 16); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
  });
}
/** Counter: big number with thousand dots (Indonesian), ink on a round paper badge. */
export function counter(ctx, n, x, y, { size = 120, alpha = 1, label = null, plus = false } = {}) {
  if (alpha <= 0.001) return;
  const s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (plus ? '+' : '');
  ctx.save(); ctx.globalAlpha *= alpha; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${size}px '${SERIF}'`;
  const w = ctx.measureText(s).width + size * 0.9, h = size * (label ? 1.75 : 1.35);
  ctx.fillStyle = 'rgba(60,40,20,0.2)'; roundRect(ctx, x - w / 2 + 6, y - h / 2 + 8, w, h, h * 0.2); ctx.fill();
  ctx.fillStyle = '#fbf6ec'; roundRect(ctx, x - w / 2, y - h / 2, w, h, h * 0.2); ctx.fill();
  ctx.strokeStyle = PAL.vermilion; ctx.lineWidth = 4; roundRect(ctx, x - w / 2 + 10, y - h / 2 + 10, w - 20, h - 20, h * 0.16); ctx.stroke();
  ctx.fillStyle = PAL.ink; ctx.fillText(s, x, y - (label ? size * 0.16 : 0) + size * 0.04);
  if (label) { ctx.font = `400 ${size * 0.26}px '${SERIF}'`; ctx.fillStyle = PAL.inkSoft; if (ctx.letterSpacing !== undefined) ctx.letterSpacing = `${size * 0.03}px`; ctx.fillText(label, x, y + size * 0.52); }
  ctx.restore();
}
/** Final paper texture + warm vignette + grain over the whole frame (cheap: prebaked). */
export function paperFinish(ctx, t, { tex = 0.2, vig = 0.38, grainAmt = 0.04 } = {}) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const tx = alphaTexture(paperTexture(540, 960, { base: '#808080', fiber: 0.1, blotch: 0.06, seed: 44, grainAmt: 20 }), 1);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = tex; ctx.drawImage(tx, 0, 0, W, H); ctx.restore();
  vignetteWarm(ctx, vig);
  if (grainAmt) grain(ctx, t, { amount: grainAmt, fps: 12 });
}
function vignetteWarm(ctx, s) {
  const v = cached('ovig:' + s, () => {
    const c = makeCanvas(270, 480), g = c.getContext('2d');
    const gr = g.createRadialGradient(135, 230, 90, 135, 240, 330); gr.addColorStop(0, 'rgba(70,40,20,0)'); gr.addColorStop(1, `rgba(70,40,20,${s})`);
    g.fillStyle = gr; g.fillRect(0, 0, 270, 480); return c;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(v, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore();
}
/** Project a world point to overlay pixels (1080x1920). */
export function toScreen(cam, p, W = 1080, H = 1920) {
  const v = new THREE.Vector3(...p).project(cam);
  return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H, v.z];
}
/** Paper confetti/flecks drawn in 2D (cheap): little rotating paper squares. */
export function flecks(ctx, t, { n = 40, seed = 1, x = 540, y = 960, spread = 500, life = 1.2, t0 = 0, colors = WASHI_COLORS, size = 14, gravity = 300 } = {}) {
  const u = t - t0; if (u < 0 || u > life) return;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const a = hrand(i, seed) * TAU, sp = (0.3 + hrand(i, seed + 1)) * spread;
    const px = x + Math.cos(a) * sp * ease.outCubic(u / life), py = y + Math.sin(a) * sp * 0.6 * ease.outCubic(u / life) + gravity * u * u;
    ctx.globalAlpha = 1 - u / life; ctx.fillStyle = colors[i % colors.length];
    ctx.save(); ctx.translate(px, py); ctx.rotate(u * 6 + i); ctx.scale(1, Math.cos(u * 9 + i)); ctx.fillRect(-size / 2, -size / 2, size, size); ctx.restore();
  }
  ctx.restore();
}
export { THREE };
