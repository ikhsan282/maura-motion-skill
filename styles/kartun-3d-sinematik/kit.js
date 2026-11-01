// AniMasters style kit: KARTUN 3D SINEMATIK (stylised 3D animated-film look, three.js).
// Soft toon shading (4-band ramp with soft edges) + warm/cool rim light + thin ink outlines that keep the
// same pixel width at any distance, round chunky characters with big glossy eyes, painted sky domes,
// fog for depth, blob contact shadows, and a 2D overlay for titles / nameplates / grain.
// Everything is a pure function of t: build in setup(), pose in render().
import * as THREE from 'three';
import { clamp, lerp, ease, hrand, noise, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export { THREE };
export const PAL = {
  ink: '#2a1a14', skin: '#f2b98f', skinDark: '#c98a5e', hair: '#2b1b16', gold: '#ffc94a', cream: '#fff4dc',
  sky: ['#1d2b5c', '#f49a5b', '#ffd58a'], grass: '#6fae4a', grassDark: '#3f7a35', dirt: '#a8754a', wood: '#a0643a',
  water: '#4fa6c9', night: '#18204a', red: '#d8432e', jin: '#5fe3ff',
};

// ------------------------------------------------------------------ stage
/** Create renderer + scene camera + 2D overlay. Returns S = { R, cam, ui, scenes:{}, render(scene) }. */
export function stage(AM, { pr = 0.75, aa = true, exposure = 1.0 } = {}) {
  const canvas = AM.layer('3d', { type: 'webgl' });
  const R = new THREE.WebGLRenderer({ canvas, antialias: aa, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  R.setPixelRatio(pr); R.setSize(AM.W, AM.H, false);
  R.toneMapping = THREE.NoToneMapping;
  R.outputColorSpace = THREE.SRGBColorSpace;
  const cam = new THREE.PerspectiveCamera(40, AM.W / AM.H, 0.1, 600);
  const ui = AM.layer('ui');
  return { R, cam, ui, AM, render(scene) { R.render(scene, cam); } };
}

/** Point the camera: pos [x,y,z], look [x,y,z], fov, roll (radians). */
export function shootCam(cam, pos, look, fov = 40, roll = 0) {
  cam.position.set(pos[0], pos[1], pos[2]);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(look[0], look[1], look[2]);
  if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}
/** Hand-held drift: small noise offset to add to camera pos/look so no shot is ever static. */
export function drift(t, amp = 0.05, seed = 1) {
  return [noise.n2(t * 0.35, seed) * amp, noise.n2(t * 0.31, seed + 7) * amp * 0.6, noise.n2(t * 0.27, seed + 13) * amp];
}
/** World -> screen pixels (1080x1920). */
export function toScreen(cam, x, y, z, W = 1080, H = 1920) {
  const v = new THREE.Vector3(x, y, z).project(cam);
  return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z];
}

// ------------------------------------------------------------------ materials
const RIM = { color: { value: new THREE.Color('#ffe2b0') }, k: { value: 0.45 } };
/** Global rim light (shared by every toon material): colour + strength. */
export function setRim(color, k = 0.45) { RIM.color.value.set(color); RIM.k.value = k; }

let RAMP = null;
function ramp() {
  if (RAMP) return RAMP;
  // 4 soft bands: shadow core, shadow, light, highlight (soft edges keep it "film" not "cel")
  const n = 64, d = new Uint8Array(n);
  const bands = [[0, 70], [0.28, 128], [0.52, 205], [0.86, 255]];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1); let v = bands[0][1];
    for (let b = 1; b < bands.length; b++) { const s = clamp((u - bands[b][0] + 0.035) / 0.07); v = lerp(v, bands[b][1], s * s * (3 - 2 * s)); }
    d[i] = v;
  }
  RAMP = new THREE.DataTexture(d, n, 1, THREE.RedFormat);
  RAMP.minFilter = RAMP.magFilter = THREE.LinearFilter; RAMP.needsUpdate = true;
  return RAMP;
}
const MATS = new Map();
/** Soft-toon material with rim light. Cached by colour+opts. */
export function toon(color, { map = null, emissive = null, ei = 1, rim = true, vc = false, side = THREE.FrontSide, flat = false, key = '' } = {}) {
  const id = `${color}|${map ? map.uuid : ''}|${emissive}|${ei}|${rim}|${vc}|${side}|${flat}|${key}`;
  if (MATS.has(id)) return MATS.get(id);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: ramp(), map, vertexColors: vc, side });
  if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = ei; }
  if (flat) m.flatShading = true;
  if (rim) {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.rimC = RIM.color; sh.uniforms.rimK = RIM.k;
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform vec3 rimC; uniform float rimK;')
        .replace('#include <opaque_fragment>', 'float fres = 1.0 - max(dot(normalize(normal), normalize(vViewPosition)), 0.0);\n outgoingLight += rimC * rimK * smoothstep(0.55, 0.95, fres);\n#include <opaque_fragment>');
    };
    m.customProgramCacheKey = () => 'toonrim';
  }
  MATS.set(id, m);
  return m;
}
export function basic(color, opts = {}) { return new THREE.MeshBasicMaterial({ color, ...opts }); }

// Outline: inverted hull pushed along view-space normals, width roughly constant in pixels.
const OUTLINES = new Map();
export function outlineMat(color = PAL.ink, w = 0.0032) {
  const id = color + w;
  if (OUTLINES.has(id)) return OUTLINES.get(id);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { w: { value: w }, c: { value: new THREE.Color(color) } }]),
    vertexShader: `uniform float w;\n#include <fog_pars_vertex>\nvoid main(){ vec4 mvPosition = modelViewMatrix * vec4(position,1.0); vec3 n = normalize(normalMatrix * normal); mvPosition.xyz += n * w * clamp(-mvPosition.z, 1.5, 40.0); gl_Position = projectionMatrix * mvPosition;\n#include <fog_vertex>\n}`,
    fragmentShader: `uniform vec3 c;\n#include <fog_pars_fragment>\nvoid main(){ gl_FragColor = vec4(c,1.0);\n#include <colorspace_fragment>\n#include <fog_fragment>\n}`,
  });
  OUTLINES.set(id, m);
  return m;
}
/** Add an ink outline to a mesh (or to every mesh in a group). */
export function outline(obj, w = 0.0032, color = PAL.ink) {
  const add = (m) => { if (!m.isMesh || m.userData.noOutline || m.userData.isOutline) return; const o = new THREE.Mesh(m.geometry, outlineMat(color, w)); o.userData.isOutline = true; o.raycast = () => {}; m.add(o); };
  if (obj.isMesh) add(obj); else { const list = []; obj.traverse((m) => list.push(m)); list.forEach(add); }
  return obj;
}

// ------------------------------------------------------------------ textures (canvas, cached)
export function canvasTex(key, w, h, draw, { repeat = null, nearest = false } = {}) {
  return cached('k3d-tex-' + key, () => {
    const c = makeCanvas(w, h); draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
    if (nearest) t.magFilter = THREE.NearestFilter;
    t.anisotropy = 4;
    return t;
  });
}
/** Soft radial sprite (for blob shadows, glows, dust). */
export function radialTex(key = 'soft', inner = 'rgba(0,0,0,1)', outer = 'rgba(0,0,0,0)', mid = 0.0) {
  return canvasTex('rad-' + key, 128, 128, (g, w) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, inner); if (mid) gr.addColorStop(mid, inner); gr.addColorStop(1, outer);
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
}
/** Batik "parang" / kawung pattern for cloth. */
export function batikTex(base = '#7a4526', ink = '#2e1609', accent = '#e3b46b', kind = 'parang') {
  return canvasTex(`batik-${base}${ink}${accent}${kind}`, 256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    if (kind === 'parang') {
      g.lineCap = 'round';
      for (let i = -8; i < 16; i++) {
        const x0 = i * 32;
        g.strokeStyle = ink; g.lineWidth = 9; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 256, 256); g.stroke();
        for (let k = 0; k < 9; k++) { const u = k / 8; g.fillStyle = accent; g.beginPath(); g.ellipse(x0 + 14 + u * 256, u * 256 + 2, 7, 3.5, Math.PI / 4, 0, TAU); g.fill(); }
      }
    } else {
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        const cx = x * 64 + 32, cy = y * 64 + 32;
        g.fillStyle = ink; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.ellipse(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14, 14, 7, a, 0, TAU); g.fill(); }
        g.fillStyle = accent; g.beginPath(); g.arc(cx, cy, 4, 0, TAU); g.fill();
      }
    }
    g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 300; i++) g.fillRect(hrand(i, 1) * w, hrand(i, 2) * h, 2, 2);
  }, { repeat: [2, 2] });
}
/** Wood planks texture (horizontal boards with grain). */
export function plankTex(base = '#a8693d', rows = 8) {
  return canvasTex('plank' + base + rows, 256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const rh = h / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rh; const tone = hrand(r, 3) * 0.18 - 0.09;
      g.fillStyle = tone > 0 ? `rgba(255,220,170,${tone})` : `rgba(40,15,0,${-tone})`; g.fillRect(0, y, w, rh);
      g.strokeStyle = 'rgba(60,25,8,0.35)'; g.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) { g.beginPath(); const yy = y + 4 + hrand(r, k) * (rh - 8); g.moveTo(0, yy); for (let x = 0; x <= w; x += 16) g.lineTo(x, yy + Math.sin(x * 0.05 + r + k) * 1.5); g.stroke(); }
      g.fillStyle = 'rgba(45,18,6,0.85)'; g.fillRect(0, y, w, 2.5);
      const jx = hrand(r, 9) * w; g.fillRect(jx, y, 2.5, rh);
      g.beginPath(); g.arc(hrand(r, 5) * w, y + rh / 2, 2.2, 0, TAU); g.fill();
    }
  });
}
/** Woven bamboo wall (bilik). */
export function bilikTex(base = '#d9b47a') {
  return canvasTex('bilik' + base, 128, 128, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const hor = (x + y) % 2 === 0;
      g.fillStyle = hor ? 'rgba(255,240,200,0.25)' : 'rgba(90,55,20,0.22)';
      g.fillRect(x * 16 + 1, y * 16 + 1, 14, 14);
      g.strokeStyle = 'rgba(80,50,20,0.4)'; g.lineWidth = 1;
      for (let k = 1; k < 4; k++) { g.beginPath(); if (hor) { g.moveTo(x * 16, y * 16 + k * 4); g.lineTo(x * 16 + 16, y * 16 + k * 4); } else { g.moveTo(x * 16 + k * 4, y * 16); g.lineTo(x * 16 + k * 4, y * 16 + 16); } g.stroke(); }
    }
  }, { repeat: [3, 2] });
}

// ------------------------------------------------------------------ sky, light, fog
/** Gradient sky dome with a sun glow. Returns mesh; change colours with setSky(). */
export function skyDome(radius = 400) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#3b5fa8') }, mid: { value: new THREE.Color('#f3a46b') }, bot: { value: new THREE.Color('#ffe0a6') }, sun: { value: new THREE.Vector3(0, 0.2, -1).normalize() }, sunC: { value: new THREE.Color('#fff2c4') }, sunK: { value: 0.8 }, stars: { value: 0 }, t: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: `uniform vec3 top, mid, bot, sunC; uniform vec3 sun; uniform float sunK, stars, t; varying vec3 vD;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
      void main(){ float y = vD.y; vec3 c = y > 0.12 ? mix(mid, top, smoothstep(0.12, 0.75, y)) : mix(bot, mid, smoothstep(-0.05, 0.12, y));
        float d = max(dot(normalize(vD), normalize(sun)), 0.0);
        c += sunC * (pow(d, 220.0) * 1.6 + pow(d, 14.0) * 0.35 + pow(d, 3.0) * 0.12) * sunK;
        if (stars > 0.0) { vec3 q = floor(vD * 260.0); float s = step(0.9975, h(q)); float tw = 0.6 + 0.4 * sin(t * 3.0 + h(q + 1.0) * 30.0); c += vec3(s * tw * stars * smoothstep(0.05, 0.4, y)); }
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), mat);
  m.frustumCulled = false; m.renderOrder = -10;
  return m;
}
/** Set sky colours: {top, mid, bot, sun:[x,y,z], sunC, sunK, stars, t}. */
export function setSky(sky, o) {
  const u = sky.material.uniforms;
  for (const k of ['top', 'mid', 'bot', 'sunC']) if (o[k]) u[k].value.set(o[k]);
  if (o.sun) u.sun.value.set(o.sun[0], o.sun[1], o.sun[2]).normalize();
  if (o.sunK !== undefined) u.sunK.value = o.sunK;
  if (o.stars !== undefined) u.stars.value = o.stars;
  if (o.t !== undefined) u.t.value = o.t;
}
/** Interpolate two hex colours (for day/night/dawn transitions). */
export const mix = (a, b, u) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp(u)).getHexString();

/** Standard cinematic light rig: key (sun), hemisphere fill, back light. Returns {key, hemi, back, set()}. */
export function lights(scene) {
  const key = new THREE.DirectionalLight('#fff1d6', 1.5); key.position.set(6, 10, 7);
  const hemi = new THREE.HemisphereLight('#bcd8ff', '#6b5236', 0.85);
  const back = new THREE.DirectionalLight('#ffd7a0', 0.8); back.position.set(-4, 5, -8);
  scene.add(key, key.target, hemi, back);
  return {
    key, hemi, back,
    set({ keyC, keyI, keyPos, sky, ground, hemiI, backC, backI } = {}) {
      if (keyC) key.color.set(keyC); if (keyI !== undefined) key.intensity = keyI; if (keyPos) key.position.set(...keyPos);
      if (sky) hemi.color.set(sky); if (ground) hemi.groundColor.set(ground); if (hemiI !== undefined) hemi.intensity = hemiI;
      if (backC) back.color.set(backC); if (backI !== undefined) back.intensity = backI;
    },
  };
}

// ------------------------------------------------------------------ ground & nature
/** Rolling terrain: size, seg, height(x,z)->y, colour by height/slope via vertex colours. */
export function terrain({ w = 200, d = 200, seg = 90, height = () => 0, color = (x, z, y) => PAL.grass, cx = 0, cz = 0 } = {}) {
  const g = new THREE.PlaneGeometry(w, d, seg, seg); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + cx, z = p.getZ(i) + cz, y = height(x, z);
    p.setY(i, y); c.set(color(x, z, y)); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, toon('#ffffff', { vc: true, key: 'terrain' }));
  m.position.set(cx, 0, cz);
  return m;
}
/** Cartoon tree: 'round' (puffy canopy), 'palm' (coconut), 'pine', 'bamboo'. */
export function tree(kind = 'round', { s = 1, seed = 1, leaf = '#4f9a3a', leaf2 = '#76bd4a', trunk = '#7a4a2a', ol = true } = {}) {
  const G = new THREE.Group(); const r = (k) => hrand(seed, k);
  if (kind === 'round') {
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.4, 8), toon(trunk)); tr.position.y = 0.7; G.add(tr);
    const n = 4 + Math.floor(r(1) * 3);
    for (let i = 0; i < n; i++) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 + r(i + 2) * 0.35, 2), toon(i % 2 ? leaf : leaf2));
      const a = (i / n) * TAU + r(9);
      b.position.set(Math.cos(a) * 0.45 * (i ? 1 : 0), 1.7 + (i ? r(i + 5) * 0.5 : 0.55), Math.sin(a) * 0.45 * (i ? 1 : 0));
      G.add(b);
    }
  } else if (kind === 'palm') {
    const pts = []; const H = 3.4 + r(1);
    for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector3(Math.sin(i / 8 * 1.2) * 0.5 * (r(2) - 0.3), (i / 8) * H, 0));
    const tr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.12, 6), toon(trunk)); G.add(tr);
    const top = pts[8];
    for (let i = 0; i < 7; i++) {
      const fr = new THREE.Group(); fr.position.copy(top); fr.rotation.y = (i / 7) * TAU + r(3);
      const leafG = new THREE.Mesh(new THREE.ConeGeometry(0.28, 2.0, 4, 1), toon(i % 2 ? leaf : leaf2, { flat: true }));
      leafG.scale.set(1, 1, 0.25); leafG.rotation.z = -Math.PI / 2 + 0.5; leafG.position.set(0.9, -0.25, 0); fr.add(leafG); G.add(fr);
    }
    for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), toon('#6b4a1f')); c.position.set(top.x + Math.cos(i * 2) * 0.15, top.y - 0.15, Math.sin(i * 2) * 0.15); G.add(c); }
  } else if (kind === 'pine') {
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.8, 6), toon(trunk)); tr.position.y = 0.4; G.add(tr);
    for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.9 - i * 0.22, 1.2, 8), toon(i % 2 ? leaf : leaf2)); c.position.y = 1.1 + i * 0.6; G.add(c); }
  } else if (kind === 'bamboo') {
    for (let i = 0; i < 5; i++) {
      const h = 3 + r(i) * 2; const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, h, 6), toon(i % 2 ? '#8dbb4a' : '#6f9e3a'));
      st.position.set((r(i + 10) - 0.5) * 0.8, h / 2, (r(i + 20) - 0.5) * 0.8); st.rotation.z = (r(i + 30) - 0.5) * 0.15; G.add(st);
      const lf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), toon(leaf2)); lf.scale.set(1, 0.5, 1); lf.position.set(st.position.x, h, st.position.z); G.add(lf);
    }
  }
  G.scale.setScalar(s);
  if (ol) outline(G, 0.0026);
  return G;
}
/** Sway a tree/group in the wind (call each frame). */
export function sway(obj, t, amt = 0.03, seed = 0) { obj.rotation.z = Math.sin(t * 1.3 + seed) * amt; obj.rotation.x = Math.sin(t * 1.1 + seed * 2) * amt * 0.6; }

/** Soft contact shadow under a character / prop. */
export function blobShadow(r = 0.5, opacity = 0.35) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: radialTex('blob', 'rgba(20,10,30,1)', 'rgba(20,10,30,0)', 0.25), transparent: true, depthWrite: false, opacity, fog: true }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 1; m.userData.noOutline = true;
  return m;
}
/** Water surface with drifting ripple texture. Call water.userData.tick(t). */
export function water(w = 50, d = 50, { color = PAL.water, deep = '#2b6f9a' } = {}) {
  const tex = canvasTex('water' + color, 256, 256, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, color); gr.addColorStop(1, deep); g.fillStyle = color; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineCap = 'round';
    for (let i = 0; i < 46; i++) { const x = hrand(i, 1) * W, y = hrand(i, 2) * H, l = 10 + hrand(i, 3) * 26; g.lineWidth = 2 + hrand(i, 4) * 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); }
  }, { repeat: [w / 8, d / 8] });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon('#ffffff', { map: tex, rim: false, key: 'water' }));
  m.rotation.x = -Math.PI / 2;
  m.userData.tick = (t) => { tex.offset.set(t * 0.03, t * 0.017); };
  return m;
}

// ------------------------------------------------------------------ characters
// A round, chunky cartoon person with a simple rig. Faces +z. Feet at y=0.
//   spec: { kind:'woman'|'man'|'kid', skin, top, bottom, skirt:'long'|null, hair:'bun'|'short'|'kid', hairC,
//           iket: colour|null, sash: colour, eye, scale }
// pose(c, p) sets everything from a plain object (see POSE_KEYS in pose()).
const SPECS = {
  woman: { hip: 0.5, sh: 0.9, headR: 0.36, chest: 0.165, waist: 0.13, shW: 0.17, arm: [0.24, 0.22], leg: [0.26, 0.24], neck: 0.05, limb: 0.058 },
  man: { hip: 0.62, sh: 1.08, headR: 0.35, chest: 0.215, waist: 0.17, shW: 0.23, arm: [0.29, 0.27], leg: [0.32, 0.3], neck: 0.06, limb: 0.072 },
  kid: { hip: 0.3, sh: 0.6, headR: 0.34, chest: 0.15, waist: 0.15, shW: 0.15, arm: [0.18, 0.16], leg: [0.16, 0.15], neck: 0.03, limb: 0.05 },
};
function capsuleDown(r, len, mat, seg = 10) {
  const g = new THREE.CapsuleGeometry(r, Math.max(0.001, len), 4, seg); g.translate(0, -len / 2, 0);
  return new THREE.Mesh(g, mat);
}
/** Sphere deformed into a chubby cartoon head (wider cheeks, small chin). */
function headGeo(r) {
  const g = new THREE.SphereGeometry(r, 32, 22); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const v = y / r;
    const cheek = Math.exp(-Math.pow((v + 0.35) / 0.35, 2)) * 0.09;
    x *= 1 + cheek; z *= 0.95 + cheek * 0.6 + (z > 0 ? 0.02 : 0);
    if (v < -0.5) { y *= 0.97; }
    p.setXYZ(i, x, y * 0.95, z);
  }
  g.computeVertexNormals(); return g;
}
export function character(spec = {}) {
  const S = { ...SPECS[spec.kind || 'man'], ...spec };
  const skin = toon(S.skin || PAL.skin), top = toon(S.top || '#e9d3a8', { map: S.topMap || null }), bottom = toon(S.bottom || '#3b2a2a', { map: S.bottomMap || null });
  const hairM = toon(S.hairC || PAL.hair), trim = toon(S.trim || PAL.gold);
  const root = new THREE.Group(); const j = { root };
  const hips = new THREE.Group(); hips.position.y = S.hip; root.add(hips); j.hips = hips;
  const isMan = S.kind === 'man', isKid = S.kind === 'kid', long = S.skirt === 'long';
  // legs
  for (const side of [1, -1]) {
    const hp = new THREE.Group(); hp.position.set(side * S.waist * 0.55, 0, 0); hips.add(hp);
    const legMat = long || isKid ? skin : bottom;
    const thigh = capsuleDown(S.limb * (isMan ? 1.25 : 1.1), S.leg[0] - 0.06, isKid ? bottom : legMat); hp.add(thigh);
    if (isMan) { const flare = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.125, S.leg[0] + S.leg[1] * 0.55, 12, 1), bottom); flare.position.y = -(S.leg[0] + S.leg[1] * 0.55) / 2; hp.add(flare); }
    const knee = new THREE.Group(); knee.position.y = -S.leg[0]; hp.add(knee);
    const shin = capsuleDown(S.limb * (isMan ? 1.05 : 0.95), S.leg[1] - 0.05, isMan ? skin : (isKid ? skin : legMat)); knee.add(shin);
    if (isMan) { const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.1, 0.12, 12), bottom); cuff.position.y = -0.02; knee.add(cuff); }
    const foot = new THREE.Mesh(new THREE.SphereGeometry(S.limb * 1.25, 12, 8), skin); foot.scale.set(1, 0.55, 1.75); foot.position.set(0, -S.leg[1] + 0.02, 0.05); knee.add(foot);
    j[side > 0 ? 'hL' : 'hR'] = hp; j[side > 0 ? 'kL' : 'kR'] = knee;
  }
  // torso: a soft bean (lathe), wider at the chest for men, small waist + flared kebaya hem for women
  const torso = new THREE.Group(); hips.add(torso); j.torso = torso;
  const H = S.sh - S.hip;
  const prof = (long
    ? [[0.001, -0.04], [S.waist * 1.15, -0.03], [S.waist * 1.28, 0.06], [S.waist * 0.98, H * 0.32], [S.chest * 1.04, H * 0.66], [S.chest, H * 0.88], [S.chest * 0.62, H * 1.02], [0.001, H * 1.06]]
    : [[0.001, -0.07], [S.waist * 1.08, -0.06], [S.waist * 1.15, 0.02], [S.waist * 1.08, H * 0.3], [S.chest * 1.02, H * 0.68], [S.chest * 0.98, H * 0.88], [S.chest * 0.6, H * 1.02], [0.001, H * 1.06]]
  ).map(([x, y]) => new THREE.Vector2(x, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 22), top); body.scale.z = 0.86; torso.add(body);
  // collar / neckline trim
  const col = new THREE.Mesh(new THREE.TorusGeometry(S.chest * 0.58, 0.018, 6, 22), trim); col.rotation.x = Math.PI / 2 + 0.35; col.position.set(0, H * 0.99, 0.015); col.scale.set(1, 1.25, 1); torso.add(col);
  if (long) { // kebaya front opening (two gold lines + brooch)
    for (const s of [1, -1]) { const ln = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, H * 0.62, 2, 4), trim); ln.position.set(s * 0.03, H * 0.55, S.chest * 0.84); ln.rotation.z = s * 0.12; ln.rotation.x = -0.25; torso.add(ln); }
    for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), trim); b.position.set(0, H * (0.42 + i * 0.16), S.chest * (0.86 + i * 0.03)); torso.add(b); }
  }
  if (isMan) { const v = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 3), toon(S.inner || '#f1e6d0')); v.rotation.x = Math.PI; v.position.set(0, H * 0.92, S.chest * 0.83); v.scale.z = 0.3; torso.add(v); }
  if (isKid) { const shorts = new THREE.Mesh(new THREE.CylinderGeometry(S.waist * 1.12, S.waist * 1.3, 0.15, 16), bottom); shorts.position.y = -0.03; torso.add(shorts); }
  if (S.sash) {
    const sa = new THREE.Mesh(new THREE.TorusGeometry(S.waist * 1.12, 0.035, 8, 22), toon(S.sash)); sa.rotation.x = Math.PI / 2; sa.scale.y = 0.86; sa.position.y = 0.03; torso.add(sa);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), toon(S.sash)); knot.position.set(S.waist * 0.65, 0.02, S.waist * 0.78); torso.add(knot);
    const tail = new THREE.Group(); tail.position.copy(knot.position); torso.add(tail);
    const tm = capsuleDown(0.032, 0.2, toon(S.sash)); tm.scale.z = 0.5; tail.add(tm); j.sashTail = tail;
  }
  if (long) {
    const sp = [[0.001, 0.07], [S.waist * 1.25, 0.075], [S.waist * 1.38, -0.12], [S.waist * 1.62, -S.hip * 0.55], [S.waist * 1.78, -S.hip + 0.07], [S.waist * 1.7, -S.hip + 0.035], [0.001, -S.hip + 0.03]].map(([x, y]) => new THREE.Vector2(x, y));
    const skirt = new THREE.Mesh(new THREE.LatheGeometry(sp, 24), toon('#ffffff', { map: S.skirtMap || batikTex() })); skirt.scale.z = 0.86; hips.add(skirt); j.skirt = skirt;
    const hem = new THREE.Mesh(new THREE.TorusGeometry(S.waist * 1.74, 0.016, 5, 28), trim); hem.rotation.x = Math.PI / 2; hem.scale.y = 0.86; hem.position.y = -S.hip + 0.06; skirt.add(hem);
  }
  if (S.scarf) { // selendang: a soft ribbon over one shoulder, its end swinging behind
    const pts = [[S.chest * 0.75, H * 1.0, 0.0], [S.chest * 0.5, H * 0.95, S.chest * 0.7], [-S.chest * 0.3, H * 0.55, S.chest * 0.9], [-S.chest * 0.95, H * 0.15, S.chest * 0.55], [-S.chest * 1.05, -0.02, 0.05]].map((p) => new THREE.Vector3(...p));
    const sc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.045, 6), toon(S.scarf)); sc.scale.z = 1; torso.add(sc);
    const hang = new THREE.Group(); hang.position.set(S.chest * 0.75, H * 1.0, -S.chest * 0.25); torso.add(hang);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.62, 0.025, 1, 6, 1), toon(S.scarf)); tail.position.y = -0.31; hang.add(tail); j.scarf = hang;
  }
  // neck + head
  const neck = new THREE.Group(); neck.position.y = H; torso.add(neck); j.neck = neck;
  const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, S.neck + 0.1, 10), skin); nk.position.y = S.neck / 2; neck.add(nk);
  const head = new THREE.Group(); head.position.y = S.neck; head.rotation.order = 'YXZ'; neck.add(head); j.head = head;
  const r = S.headR; const hc = new THREE.Group(); hc.position.y = r * 0.88; head.add(hc); j.hc = hc;
  const skull = new THREE.Mesh(headGeo(r), skin); hc.add(skull);
  for (const s of [1, -1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(r * 0.16, 10, 8), skin); ear.scale.set(0.5, 1, 0.75); ear.position.set(s * r * 0.98, -r * 0.12, -r * 0.02); hc.add(ear); }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(r * 0.085, 10, 8), skin); nose.position.set(0, -r * 0.24, r * 0.97); nose.scale.set(1.15, 0.85, 0.9); hc.add(nose); nose.userData.noOutline = true;
  // eyes (big, glossy; iris/pupil/highlights layered in front of a flattened white)
  j.eyes = [];
  const eyeW = basic('#fffdf8'), iris = basic(S.eye || '#4a2a16'), irisD = basic(S.eyeD || '#2a160a'), pupil = basic('#120806'), hl = basic('#ffffff');
  const er = r * (isKid ? 0.24 : 0.205);
  for (const s of [1, -1]) {
    const eg = new THREE.Group(); eg.rotation.order = 'YXZ'; eg.rotation.y = s * 0.37; eg.rotation.x = 0.13; hc.add(eg);
    const ep = new THREE.Group(); ep.position.z = r * 0.935; eg.add(ep);
    const white = new THREE.Mesh(new THREE.SphereGeometry(er, 20, 14), eyeW); white.scale.set(0.88, 1.12, 0.5); ep.add(white); white.userData.noOutline = true;
    const ir = new THREE.Group(); ir.position.z = er * 0.5 + 0.003; ep.add(ir);
    const ring = new THREE.Mesh(new THREE.CircleGeometry(er * 0.66, 24), irisD); ring.scale.y = 1.08; ir.add(ring);
    const irm = new THREE.Mesh(new THREE.CircleGeometry(er * 0.56, 24), iris); irm.position.set(0, -er * 0.04, 0.001); irm.scale.y = 1.08; ir.add(irm);
    const pm = new THREE.Mesh(new THREE.CircleGeometry(er * 0.3, 18), pupil); pm.position.z = 0.002; pm.scale.y = 1.1; ir.add(pm);
    const h1 = new THREE.Mesh(new THREE.CircleGeometry(er * 0.2, 12), hl); h1.position.set(er * 0.22, er * 0.26, 0.003); ir.add(h1);
    const h2 = new THREE.Mesh(new THREE.CircleGeometry(er * 0.09, 8), hl); h2.position.set(-er * 0.2, -er * 0.22, 0.003); ir.add(h2);
    // upper lid line (thick lash for women, thin for others)
    const lid = new THREE.Mesh(new THREE.TorusGeometry(er * 0.9, er * (S.lashes ? 0.11 : 0.06), 4, 16, Math.PI * 0.86), basic(PAL.ink)); lid.position.z = er * 0.32; lid.rotation.z = Math.PI * 0.07; lid.scale.set(0.98, 1.12, 1); ep.add(lid); lid.userData.noOutline = true;
    if (S.lashes) { const flick = new THREE.Mesh(new THREE.ConeGeometry(er * 0.13, er * 0.55, 4), basic(PAL.ink)); flick.position.set(s * er * 0.86, er * 0.62, er * 0.3); flick.rotation.z = -s * 0.95; ep.add(flick); flick.userData.noOutline = true; }
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(er * (isMan ? 0.17 : 0.11), er * 1.0, 2, 6), basic(S.browC || S.hairC || PAL.hair)); brow.rotation.z = Math.PI / 2; brow.position.set(0, er * 1.6, er * 0.15); ep.add(brow); brow.userData.noOutline = true;
    j.eyes.push({ g: ep, white, ir, brow, s, er });
  }
  // blush
  j.blush = [];
  for (const s of [1, -1]) { const b = new THREE.Mesh(new THREE.CircleGeometry(r * 0.13, 16), basic('#ff8a7a', { transparent: true, opacity: 0.0, depthWrite: false })); const g = new THREE.Group(); g.rotation.order = 'YXZ'; g.rotation.y = s * 0.62; g.rotation.x = 0.33; b.position.z = r * 1.005; b.scale.y = 0.7; g.add(b); hc.add(g); j.blush.push(b); }
  // mouths
  const mouthG = new THREE.Group(); mouthG.position.set(0, -r * 0.47, r * 0.83); mouthG.rotation.x = -0.32; hc.add(mouthG);
  const lip = basic('#7a2a24');
  const smile = new THREE.Mesh(new THREE.TorusGeometry(r * 0.13, r * 0.026, 6, 16, Math.PI), lip); smile.rotation.z = Math.PI; mouthG.add(smile);
  const open = new THREE.Group(); mouthG.add(open);
  const om = new THREE.Mesh(new THREE.SphereGeometry(r * 0.15, 16, 10), basic('#5a1414')); om.scale.set(1, 0.75, 0.32); open.add(om);
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(r * 0.085, 10, 8), basic('#e86a6a')); tongue.position.set(0, -r * 0.06, r * 0.03); tongue.scale.set(1.2, 0.6, 0.5); open.add(tongue);
  const teeth = new THREE.Mesh(new THREE.BoxGeometry(r * 0.18, r * 0.045, r * 0.02), basic('#ffffff')); teeth.position.set(0, r * 0.075, r * 0.045); open.add(teeth);
  const frown = new THREE.Mesh(new THREE.TorusGeometry(r * 0.11, r * 0.025, 6, 16, Math.PI), lip); frown.position.y = -r * 0.07; mouthG.add(frown);
  [smile, om, tongue, teeth, frown].forEach((m) => (m.userData.noOutline = true));
  j.mouth = { g: mouthG, smile, open, frown };
  // hair
  const hairG = new THREE.Group(); hc.add(hairG); j.hair = hairG;
  const hlMat = basic(S.hairHi || '#6b4a3a', { transparent: true, opacity: 0.55, depthWrite: false });
  if (S.hair === 'bun' || S.hair === 'long') {
    const back = new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 26, 18), hairM); back.scale.set(1.02, 1.0, 0.92); back.position.set(0, r * 0.04, -r * 0.16); hairG.add(back);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 1.075, 28, 14, 0, TAU, 0, Math.PI * 0.5), hairM); cap.rotation.x = -0.62; cap.position.set(0, r * 0.06, -r * 0.02); hairG.add(cap);
    // side-swept bangs: three soft lobes along the hairline
    for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(r * 0.36, 16, 12), hairM); const a = -0.55 + i * 0.5; b.position.set(Math.sin(a) * r * 0.62, r * 0.6 - Math.abs(a) * r * 0.12, Math.cos(a) * r * 0.62); b.scale.set(1.25, 0.55, 0.7); b.rotation.set(-0.5, a * 0.8, -0.35 + i * 0.12); hairG.add(b); }
    for (const s of [1, -1]) { const side = new THREE.Mesh(new THREE.SphereGeometry(r * 0.28, 12, 10), hairM); side.scale.set(0.55, 1.7, 0.85); side.position.set(s * r * 0.9, -r * 0.3, r * 0.12); hairG.add(side); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 0.9, r * 0.035, 4, 30, Math.PI * 0.9), hlMat); ring.rotation.set(-1.0, 0, Math.PI * 0.05); ring.position.set(0, r * 0.32, r * 0.12); hairG.add(ring);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(r * 0.42, 18, 14), hairM); bun.position.set(0, r * 0.62, -r * 0.78); hairG.add(bun); j.bun = bun;
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, r * 1.4, 6), trim); pin.rotation.z = 1.2; pin.position.copy(bun.position); hairG.add(pin);
    for (let i = 0; i < 3; i++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(r * 0.1, 10, 8), toon(i === 1 ? '#fff2d8' : '#ff8fb0')); fl.position.set(r * (0.3 + i * 0.12), r * (0.78 - i * 0.08), -r * (0.52 + i * 0.07)); hairG.add(fl); }
    // long ponytail falling from the bun: chain of segments for secondary motion
    j.tail = []; let parent = hairG; let pos = new THREE.Vector3(0, r * 0.3, -r * 1.02);
    for (let i = 0; i < 5; i++) {
      const sg = new THREE.Group(); sg.position.copy(pos); parent.add(sg);
      const m = new THREE.Mesh(new THREE.SphereGeometry(r * (0.27 - i * 0.035), 12, 10), hairM); m.scale.set(1, 1.7, 0.75); m.position.y = -r * 0.26; sg.add(m);
      j.tail.push(sg); parent = sg; pos = new THREE.Vector3(0, -r * 0.44, 0);
    }
  } else if (S.hair === 'short' || S.hair === 'kid') {
    const back = new THREE.Mesh(new THREE.SphereGeometry(r * 1.04, 22, 14), hairM); back.scale.set(1.02, 0.92, 0.88); back.position.set(0, r * 0.06, -r * 0.18); hairG.add(back);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 1.065, 26, 14, 0, TAU, 0, Math.PI * 0.46), hairM); cap.rotation.x = -0.5; cap.position.y = r * 0.06; hairG.add(cap);
    for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(r * 0.17, r * 0.5, 6), hairM); const a = -0.75 + i * 0.3; sp.position.set(Math.sin(a) * r * 0.7, r * 0.66, Math.cos(a) * r * 0.5); sp.rotation.set(1.15, 0, -a * 0.9); hairG.add(sp); }
    for (const s of [1, -1]) { const sb = new THREE.Mesh(new THREE.SphereGeometry(r * 0.2, 10, 8), hairM); sb.scale.set(0.5, 1.2, 0.8); sb.position.set(s * r * 0.92, r * 0.05, r * 0.05); hairG.add(sb); }
    if (S.hair === 'kid') { const tuft = new THREE.Mesh(new THREE.ConeGeometry(r * 0.12, r * 0.6, 6), hairM); tuft.position.set(0, r * 1.12, 0); tuft.rotation.z = 0.5; hairG.add(tuft); j.tuft = tuft; }
  }
  if (S.iket) { // Sundanese iket: batik cloth wrapped round the head, knot and two pointed tails at the back
    const tex = batikTex(S.iket, '#2a1508', '#e8b860', 'kawung');
    const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.09, r * 1.11, r * 0.26, 28, 1, true), toon('#ffffff', { map: tex, side: THREE.DoubleSide, key: 'iket' })); band.position.set(0, r * 0.42, -r * 0.03); band.rotation.x = -0.32; hairG.add(band);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(r * 1.085, 24, 10, 0, TAU, 0, Math.PI * 0.27), toon('#ffffff', { map: tex, key: 'iket' })); crown.position.set(0, r * 0.2, -r * 0.03); crown.rotation.x = -0.32; hairG.add(crown);
    const knot = new THREE.Group(); knot.position.set(0, r * 0.62, -r * 0.98); hairG.add(knot);
    const km = new THREE.Mesh(new THREE.SphereGeometry(r * 0.13, 10, 8), toon(S.iket)); knot.add(km);
    for (const s of [1, -1]) { const tl = new THREE.Mesh(new THREE.ConeGeometry(r * 0.11, r * 0.62, 4), toon(S.iket)); tl.rotation.set(-0.9, 0, s * 0.85); tl.position.set(s * r * 0.17, r * 0.14, -r * 0.08); knot.add(tl); }
    j.iket = knot;
  }
  if (S.scar) { const sc = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.035, r * 0.32, 2, 6), basic('#e0607a')); const sg = new THREE.Group(); sg.rotation.order = 'YXZ'; sg.rotation.x = -1.05; sg.rotation.y = 0.35; sc.position.z = r * 1.13; sc.rotation.z = 0.6; sg.add(sc); hc.add(sg); j.scar = sc; sc.visible = false; sc.userData.noOutline = true; }
  // arms
  for (const side of [1, -1]) {
    const shG = new THREE.Group(); shG.position.set(side * S.shW, H * 0.88, 0); torso.add(shG);
    const sleeve = new THREE.Mesh(new THREE.SphereGeometry(S.limb * 1.5, 14, 10), top); sleeve.scale.set(1, 1.1, 1); sleeve.position.y = -0.02; shG.add(sleeve);
    const ua = capsuleDown(S.limb * 1.1, S.arm[0] - 0.04, isKid ? skin : top); shG.add(ua);
    const el = new THREE.Group(); el.position.y = -S.arm[0]; shG.add(el);
    if (!isKid) { const cuff = new THREE.Mesh(new THREE.CylinderGeometry(S.limb * 1.25, S.limb * 1.15, 0.07, 12), long ? trim : top); cuff.position.y = 0.0; el.add(cuff); }
    const fa = capsuleDown(S.limb * 0.92, S.arm[1] - 0.05, skin); el.add(fa);
    const hand = new THREE.Group(); hand.position.y = -S.arm[1]; el.add(hand);
    const palm = new THREE.Mesh(new THREE.SphereGeometry(S.limb * 1.15, 12, 10), skin); palm.scale.set(0.95, 1.1, 0.75); hand.add(palm);
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(S.limb * 0.38, S.limb * 0.8, 2, 6), skin); thumb.position.set(-side * S.limb * 0.5, S.limb * 0.1, S.limb * 0.75); thumb.rotation.x = 0.6; hand.add(thumb);
    shG.rotation.order = 'XZY';
    j[side > 0 ? 'sL' : 'sR'] = shG; j[side > 0 ? 'eL' : 'eR'] = el; j[side > 0 ? 'handL' : 'handR'] = hand;
  }
  // contact shadow
  const sh = blobShadow(isKid ? 0.42 : 0.55, 0.4); sh.position.y = 0.012; root.add(sh); j.shadow = sh;
  outline(root, S.olW || 0.003);
  const c = { root, j, S, H };
  pose(c, {});
  return c;
}

/** Pose a character from a plain object. Keys: x,y,z, ry, lean, twist, side, bob, squash,
 *  head:[yaw,pitch,roll], armL/armR:[fwd,out,elbow], legL/legR:[fwd,knee], blink 0..1, mouth:'smile'|'open'|'frown'|'flat',
 *  open 0..1, brow (-1 angry .. +1 worried/surprised), look:[x,y], blush 0..1, t (for secondary motion) */
export function pose(c, p) {
  const j = c.j;
  j.root.position.set(p.x || 0, p.y || 0, p.z || 0);
  j.root.rotation.y = p.ry || 0;
  const sq = p.squash || 0; j.root.scale.set((c.S.scale || 1) * (1 - sq * 0.5), (c.S.scale || 1) * (1 + sq), (c.S.scale || 1) * (1 - sq * 0.5));
  j.hips.position.y = c.S.hip + (p.bob || 0);
  j.torso.rotation.set(p.lean || 0, p.twist || 0, p.side || 0);
  const hd = p.head || [0, 0, 0]; j.head.rotation.set(hd[1] || 0, hd[0] || 0, hd[2] || 0);
  const arm = (sh, el, a, s) => { sh.rotation.x = -(a[0] || 0); sh.rotation.z = s * (0.12 + (a[1] || 0)); sh.rotation.y = 0; el.rotation.x = -(a[2] || 0); };
  arm(j.sL, j.eL, p.armL || [0, 0, 0.15], 1); arm(j.sR, j.eR, p.armR || [0, 0, 0.15], -1);
  const leg = (h, k, a) => { h.rotation.x = -(a[0] || 0); k.rotation.x = Math.max(0, a[1] || 0); };
  leg(j.hL, j.kL, p.legL || [0, 0]); leg(j.hR, j.kR, p.legR || [0, 0]);
  // face
  const blink = clamp(p.blink || 0);
  const look = p.look || [0, 0];
  const brow = p.brow || 0;
  for (const e of j.eyes) {
    e.g.scale.y = 1 - blink * 0.92;
    e.ir.position.set(look[0] * e.er * 0.28, look[1] * e.er * 0.22, e.er * 0.5 + 0.003);
    const wide = p.wide || 0; e.g.scale.x = 1 + wide * 0.12; if (!blink) e.g.scale.y = 1 + wide * 0.18;
    e.ir.scale.setScalar(1 - wide * 0.3);
    e.brow.rotation.z = Math.PI / 2 + e.s * brow * 0.45;
    e.brow.position.y = e.er * (1.6 + Math.max(0, brow) * 0.25 + wide * 0.35);
  }
  const m = j.mouth, mo = p.mouth || 'smile';
  m.smile.visible = mo === 'smile' || mo === 'grin'; m.frown.visible = mo === 'frown'; m.open.visible = mo === 'open';
  m.smile.scale.set(mo === 'grin' ? 1.3 : 1, mo === 'grin' ? 1.2 : 0.8, 1);
  m.open.scale.set(1, 0.4 + (p.open ?? 1) * 0.9, 1);
  if (mo === 'flat') { m.smile.visible = true; m.smile.scale.set(0.9, 0.12, 1); }
  for (const b of j.blush) b.material.opacity = (p.blush || 0) * 0.55;
  // secondary motion: ponytail, scarf, sash follow the body with delay
  const t = p.t || 0, vel = p.vel || 0;
  if (j.tail) j.tail.forEach((sg, i) => { sg.rotation.x = 0.25 + vel * 0.25 + Math.sin(t * 2.6 - i * 0.7) * 0.07 * (1 + vel * 2) + (p.lean || 0) * -0.3; sg.rotation.z = Math.sin(t * 1.9 - i * 0.6) * 0.06; });
  if (j.scarf) { j.scarf.rotation.x = 0.1 + vel * 0.35 + Math.sin(t * 2.2) * 0.06; j.scarf.rotation.z = Math.sin(t * 1.7) * 0.05; }
  if (j.sashTail) j.sashTail.rotation.x = 0.2 + vel * 0.4 + Math.sin(t * 3) * 0.08;
  if (j.iket) j.iket.rotation.x = Math.sin(t * 3.1) * 0.08 + vel * 0.2;
  if (j.skirt) j.skirt.rotation.z = Math.sin(t * 2.4) * 0.02 * (1 + vel * 3);
  if (j.scar) j.scar.visible = !!p.scar;
  if (j.shadow) { j.shadow.position.y = 0.012 - (p.y || 0) / ((c.S.scale || 1)); j.shadow.material.opacity = 0.38 / (1 + Math.max(0, p.y || 0) * 1.5); }
  return c;
}
/** Walk cycle values for pose(): phase in cycles, amt 0..1. Returns partial pose to spread into pose(). */
export function walk(phase, amt = 1, { arm = 0.45, leg = 0.5, run = false } = {}) {
  const a = phase * TAU, k = run ? 1.6 : 1;
  return {
    legL: [Math.sin(a) * leg * amt * k, Math.max(0, -Math.cos(a)) * 0.7 * amt * k], legR: [-Math.sin(a) * leg * amt * k, Math.max(0, Math.cos(a)) * 0.7 * amt * k],
    armL: [-Math.sin(a) * arm * amt * k, 0.05, 0.25 + (run ? 0.9 : 0)], armR: [Math.sin(a) * arm * amt * k, 0.05, 0.25 + (run ? 0.9 : 0)],
    bob: -Math.abs(Math.cos(a)) * 0.035 * amt * k + 0.02 * amt, lean: (run ? 0.25 : 0.05) * amt, vel: amt * k,
  };
}
/** Natural blink: returns 0..1 at time t (blinks every ~3 s, frame-stable). */
export function blinkAt(t, seed = 0) {
  const period = 2.6 + hrand(seed, 1) * 1.6, ph = ((t + hrand(seed, 2) * 3) % period);
  return ph < 0.14 ? Math.sin((ph / 0.14) * Math.PI) : 0;
}
/** Idle breathing/sway, returns partial pose. */
export function idle(t, seed = 0, amt = 1) {
  return { bob: Math.sin(t * 2.1 + seed) * 0.008 * amt, side: Math.sin(t * 0.9 + seed) * 0.02 * amt, head: [Math.sin(t * 0.7 + seed) * 0.08 * amt, Math.sin(t * 1.1 + seed) * 0.03 * amt, Math.sin(t * 0.8 + seed) * 0.03 * amt], blink: blinkAt(t, seed) };
}
/** Talking mouth: returns { mouth:'open', open } while talking, using smooth noise. */
export function talk(t, on = 1, seed = 0) {
  const v = Math.max(0, noise.n2(t * 9, seed) * 0.6 + 0.45) * on;
  return v > 0.18 ? { mouth: 'open', open: clamp(v) } : { mouth: 'smile' };
}

// ------------------------------------------------------------------ creatures & props
/** Jin (friendly spirit): glowing teardrop body with big eyes and little arms. */
export function jin({ color = PAL.jin, s = 1 } = {}) {
  const G = new THREE.Group();
  const prof = []; for (let i = 0; i <= 16; i++) { const u = i / 16; const y = lerp(-0.9, 0.42, u); const rr = u < 0.75 ? Math.pow(u / 0.75, 0.9) * 0.38 : Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.75) / 0.25, 2))) * 0.38; prof.push(new THREE.Vector2(Math.max(0.002, rr), y)); }
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), toon(color, { emissive: color, ei: 0.55 })); G.add(body);
  const eyeW = basic('#ffffff'), pupil = basic('#0b1a3a');
  for (const sd of [1, -1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), eyeW); e.scale.set(0.85, 1.1, 0.5); e.position.set(sd * 0.13, 0.14, 0.33); G.add(e); e.userData.noOutline = true;
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.055, 12), pupil); p.position.set(sd * 0.13, 0.13, 0.39); G.add(p);
    const arm = capsuleDown(0.045, 0.18, toon(color, { emissive: color, ei: 0.5 })); arm.position.set(sd * 0.33, 0.0, 0.05); arm.rotation.z = sd * 0.7; G.add(arm); G.userData['arm' + sd] = arm;
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.013, 6, 12, Math.PI), basic('#0b1a3a')); mouth.rotation.z = Math.PI; mouth.position.set(0, 0.0, 0.37); G.add(mouth); G.userData.mouth = mouth;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('jin', 'rgba(140,240,255,0.9)', 'rgba(140,240,255,0)'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.set(1.5, 1.5, 1); glow.material.opacity = 0.45; G.add(glow);
  outline(body, 0.003, '#0d3550');
  G.scale.setScalar(s);
  return G;
}
/** Animate a jin: bob, tail wiggle, arms waving. */
export function jinTick(J, t, seed = 0, scared = 0) {
  J.children[0].rotation.z = Math.sin(t * 3 + seed) * 0.12;
  J.userData['arm1'].rotation.z = 0.7 + Math.sin(t * 6 + seed) * 0.4 + scared * 1.6;
  J.userData['arm-1'].rotation.z = -0.7 - Math.sin(t * 6 + seed + 1) * 0.4 - scared * 1.6;
  J.userData.mouth.rotation.z = scared > 0.3 ? 0 : Math.PI;
}
/** Rooster: returns {root, j:{head, beak, beakLow, wingL, wingR, tail}}. */
export function rooster() {
  const root = new THREE.Group(); const j = { root };
  const body = new THREE.Group(); body.position.y = 0.55; root.add(body); j.body = body;
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), toon('#b5492a')); torso.scale.set(0.9, 0.85, 1.2); body.add(torso);
  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), toon('#6a2a1a')); chest.position.set(0, -0.06, 0.18); body.add(chest);
  for (const s of [1, -1]) { const w = new THREE.Group(); w.position.set(s * 0.26, 0.05, 0); body.add(w); const wm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), toon('#d9772e')); wm.scale.set(0.35, 0.8, 1.3); wm.position.set(s * 0.03, -0.04, -0.06); w.add(wm); j[s > 0 ? 'wingL' : 'wingR'] = w; }
  const tail = new THREE.Group(); tail.position.set(0, 0.12, -0.32); body.add(tail); j.tail = tail;
  const tc = ['#1f5a46', '#22344f', '#1f5a46', '#2a2a40', '#1a6b4a'];
  for (let i = 0; i < 5; i++) { const pts = []; for (let k = 0; k <= 6; k++) { const u = k / 6; pts.push(new THREE.Vector3((i - 2) * 0.07 * u, Math.sin(u * 2.2) * (0.55 + i * 0.05), -u * 0.35 - Math.pow(u, 3) * 0.2)); } const f = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.05 - i * 0.004, 5), toon(tc[i])); tail.add(f); }
  const neck = new THREE.Group(); neck.position.set(0, 0.2, 0.24); body.add(neck); j.neck = neck;
  const nm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.32, 12), toon('#e48a2e')); nm.position.y = 0.12; nm.rotation.x = 0.3; neck.add(nm);
  const head = new THREE.Group(); head.position.set(0, 0.3, 0.06); neck.add(head); j.head = head;
  const hm = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), toon('#e8a33a')); head.add(hm);
  for (let i = 0; i < 4; i++) { const cm = new THREE.Mesh(new THREE.SphereGeometry(0.06 - i * 0.004, 10, 8), toon('#e02d2d')); cm.position.set(0, 0.13 + Math.sin(i * 0.9) * 0.04, 0.08 - i * 0.07); cm.scale.set(0.6, 1.3, 1); head.add(cm); }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 8), toon('#f2c03a')); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.0, 0.18); head.add(beak); j.beak = beak;
  const bl = new THREE.Group(); bl.position.set(0, -0.025, 0.12); head.add(bl); const blm = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 8), toon('#e0a52a')); blm.rotation.x = Math.PI / 2; blm.position.z = 0.05; bl.add(blm); j.beakLow = bl;
  const wat = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), toon('#e02d2d')); wat.position.set(0, -0.1, 0.11); wat.scale.set(0.6, 1.4, 0.8); head.add(wat);
  for (const s of [1, -1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), basic('#ffffff')); e.position.set(s * 0.1, 0.03, 0.08); head.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), basic('#111')); p.position.set(s * 0.125, 0.035, 0.095); head.add(p); }
  for (const s of [1, -1]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 6), toon('#e9b13a')); leg.position.set(s * 0.1, 0.2, 0.02); root.add(leg); const ft = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 3), toon('#e9b13a')); ft.rotation.x = Math.PI / 2; ft.scale.y = 0.5; ft.position.set(s * 0.1, 0.03, 0.07); root.add(ft); }
  outline(root, 0.003);
  return { root, j };
}
/** Pose the rooster: crow 0..1 (head back, beak open, wings out), peck, t. */
export function roosterPose(r, { crow = 0, t = 0, flap = 0 } = {}) {
  const j = r.j;
  j.neck.rotation.x = -crow * 0.8 + Math.sin(t * 2) * 0.04;
  j.head.rotation.x = -crow * 0.5;
  j.beakLow.rotation.x = crow * 0.7 + (crow > 0.5 ? Math.sin(t * 40) * 0.1 : 0);
  j.body.rotation.x = -crow * 0.25;
  j.body.scale.set(1, 1 + crow * 0.06, 1 + crow * 0.04);
  const f = flap * (0.6 + Math.sin(t * 22) * 0.4);
  j.wingL.rotation.z = f * 0.9; j.wingR.rotation.z = -f * 0.9;
  j.tail.rotation.x = -crow * 0.2 + Math.sin(t * 2.5) * 0.03;
}

/** Big wooden boat (perahu): half-ellipsoid hull with raised prow & stern, planks, gunwale, ribs.
 *  len along x. Returns group; group.userData.hull for recolouring. */
export function boat({ len = 6, beam = 1.6, depth = 1.1, color = '#a8693d', prow = 0.9 } = {}) {
  const G = new THREE.Group();
  const g = new THREE.SphereGeometry(1, 40, 16, 0, TAU, Math.PI / 2, Math.PI / 2); // lower half
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const X = x * len / 2, Z = z * beam / 2; let Y = y * depth;
    const e = Math.pow(Math.abs(x), 4) * prow; // ends rise
    Y += e * depth * 1.2;
    p.setXYZ(i, X, Y, Z * (1 - Math.pow(Math.abs(x), 6) * 0.6));
  }
  g.computeVertexNormals();
  const tex = plankTex(color, 7);
  const hullMat = toon('#ffffff', { map: tex, side: THREE.DoubleSide, key: 'hull' + color });
  const hull = new THREE.Mesh(g, hullMat); G.add(hull);
  // gunwale rim
  const rim = []; for (let i = 0; i <= 48; i++) { const a = (i / 48) * TAU, x = Math.cos(a), z = Math.sin(a); rim.push(new THREE.Vector3(x * len / 2, Math.pow(Math.abs(x), 4) * prow * depth * 1.2 + 0.02, z * beam / 2 * (1 - Math.pow(Math.abs(x), 6) * 0.6))); }
  const rm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim, true), 80, 0.07, 6, true), toon('#6e3f1f')); G.add(rm);
  // benches / ribs
  for (let i = -2; i <= 2; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, beam * 0.92), toon('#7d4826')); b.position.set(i * len * 0.14, -0.12, 0); G.add(b); }
  // prow carving (curl)
  for (const s of [1, -1]) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 6, 12, Math.PI * 1.4), toon('#6e3f1f')); c.position.set(s * (len / 2 + 0.05), prow * depth * 1.2 + 0.18, 0); c.rotation.y = s > 0 ? 0 : Math.PI; G.add(c); }
  outline(G, 0.0028);
  G.userData.hull = hull; G.userData.tex = tex;
  return G;
}
/** Simple Sundanese stilt house (rumah panggung) with flared "julang ngapak" thatched roof. */
export function house({ w = 4, d = 3, h = 2.2 } = {}) {
  const G = new THREE.Group();
  const wood = toon('#7a4a2a'), wall = toon('#ffffff', { map: bilikTex(), key: 'bilik' }), thatch = toon('#5a3b22'), thatch2 = toon('#6d4a2b');
  for (const x of [-1, 1]) for (const z of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.7, 6), wood); p.position.set(x * (w / 2 - 0.2), 0.35, z * (d / 2 - 0.2)); G.add(p); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.18, 6), toon('#9a9a8f')); st.position.set(p.position.x, 0.09, p.position.z); G.add(st); }
  const floor = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.14, d + 0.6), toon('#8a5a32')); floor.position.y = 0.75; G.add(floor);
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wall); body.position.y = 0.82 + h / 2; G.add(body);
  // door + window
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.5), toon('#4a2a16')); door.position.set(-w * 0.18, 0.82 + 0.75, d / 2 + 0.01); G.add(door);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), toon('#2a1a10', { emissive: '#ffb050', ei: 0.0, key: 'win' })); win.position.set(w * 0.22, 0.82 + 1.3, d / 2 + 0.01); G.add(win); G.userData.win = win;
  // roof: two slanted planes + flared wings
  const rh = 1.5, ov = 0.5;
  for (const s of [1, -1]) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.18, Math.hypot(d / 2 + ov, rh)), s > 0 ? thatch : thatch2);
    r.position.set(0, 0.82 + h + rh / 2, s * (d / 4 + ov / 2)); r.rotation.x = s * Math.atan2(rh, d / 2 + ov); G.add(r);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(w + 1.4, 0.12, 0.9), thatch2); fl.position.set(0, 0.82 + h - 0.08, s * (d / 2 + ov + 0.3)); fl.rotation.x = s * 0.2; G.add(fl);
  }
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, w + 1.4, 8), toon('#3e2614')); ridge.rotation.z = Math.PI / 2; ridge.position.y = 0.82 + h + rh; G.add(ridge);
  for (const s of [1, -1]) { const gable = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 4), toon('#3e2614')); gable.position.set(s * (w / 2 + 0.75), 0.82 + h + rh + 0.15, 0); gable.rotation.z = s * -0.5; G.add(gable); }
  // stairs
  for (let i = 0; i < 3; i++) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.3), wood); st.position.set(-w * 0.18, 0.18 + i * 0.22, d / 2 + 0.85 - i * 0.28); G.add(st); }
  outline(G, 0.0026);
  return G;
}
/** Rice paddle (centong). */
export function centong() {
  const G = new THREE.Group();
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.4, 8), toon('#c08a52')); h.position.y = 0.2; G.add(h);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 10), toon('#d9a066')); b.scale.set(1, 1.3, 0.25); b.position.y = 0.48; G.add(b);
  outline(G, 0.003);
  return G;
}
/** Heart (for love beats). */
export function heart(color = '#ff4d6d') {
  const s = new THREE.Shape(); s.moveTo(0, -0.5); s.bezierCurveTo(-0.6, -0.05, -0.55, 0.45, 0, 0.2); s.bezierCurveTo(0.55, 0.45, 0.6, -0.05, 0, -0.5);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3, curveSegments: 16 }); g.center();
  const m = new THREE.Mesh(g, toon(color, { emissive: color, ei: 0.25 }));
  outline(m, 0.004);
  return m;
}
/** Rock / boulder (lumpy icosahedron). */
export function rock(s = 1, seed = 1, color = '#8b8478') {
  const g = new THREE.IcosahedronGeometry(1, 1); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)); const k = 1 + (noise.n3(v.x * 1.7 + seed, v.y * 1.7, v.z * 1.7) * 0.22); p.setXYZ(i, v.x * k, v.y * k * 0.8, v.z * k); }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, toon(color, { flat: true, key: 'rock' })); m.scale.setScalar(s);
  outline(m, 0.0026);
  return m;
}
/** Waving magic cloth: plane w x h, call cloth.userData.tick(t, amp). */
export function cloth(w = 3, h = 1.6, { color = '#ff3b2f', glow = '#ffb347' } = {}) {
  const g = new THREE.PlaneGeometry(w, h, 28, 10);
  const base = g.attributes.position.array.slice();
  const tex = canvasTex('cloth' + color + glow, 256, 128, (c, W, H) => {
    const gr = c.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, color); gr.addColorStop(0.5, glow); gr.addColorStop(1, color); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,240,180,0.7)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 10 + i * 22); for (let x = 0; x <= W; x += 8) c.lineTo(x, 10 + i * 22 + Math.sin(x * 0.08 + i) * 5); c.stroke(); }
    c.fillStyle = '#ffe9a8'; for (let x = 6; x < W; x += 16) { c.beginPath(); c.arc(x, 4, 3, 0, TAU); c.arc(x, H - 4, 3, 0, TAU); c.fill(); }
  });
  const m = new THREE.Mesh(g, toon('#ffffff', { map: tex, emissive: glow, ei: 0.45, side: THREE.DoubleSide, rim: false, key: 'cloth' }));
  m.userData.tick = (t, amp = 1) => {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; const u = (x / w + 0.5); p.setZ(i, (Math.sin(x * 2.2 - t * 5) * 0.18 + Math.sin(y * 3 + x - t * 3.3) * 0.08) * amp * u); }
    p.needsUpdate = true; g.computeVertexNormals();
  };
  return m;
}

// ------------------------------------------------------------------ particles
/** Particle burst (dust, sparkles, splash) as Points with a soft sprite. Call burst.userData.tick(t - t0). */
export function burst({ n = 60, color = '#e8d2a8', size = 0.6, speed = 4, up = 2, grav = -4, life = 1.6, seed = 1, spread = 1, additive = false, origin = [0, 0, 0], flat = false } = {}) {
  const g = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size, map: radialTex('pt' + color, 'rgba(255,255,255,1)', 'rgba(255,255,255,0)', 0.35), transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending, opacity: 1 });
  const P = new THREE.Points(g, mat); P.frustumCulled = false;
  const v = []; for (let i = 0; i < n; i++) { const a = hrand(seed, i) * TAU, e = hrand(seed, i + 99); v.push([Math.cos(a) * speed * (0.3 + e) * spread, up * (0.4 + hrand(seed, i + 7) * (flat ? 0.4 : 1)), Math.sin(a) * speed * (0.3 + e) * spread]); }
  P.userData.tick = (dt) => {
    P.visible = dt >= 0 && dt <= life;
    if (!P.visible) return;
    for (let i = 0; i < n; i++) { const k = 1 - Math.exp(-dt * 2.2); pos[i * 3] = origin[0] + v[i][0] * k * 0.6; pos[i * 3 + 1] = origin[1] + v[i][1] * dt + 0.5 * grav * dt * dt * 0.3; pos[i * 3 + 2] = origin[2] + v[i][2] * k * 0.6; }
    g.attributes.position.needsUpdate = true;
    mat.opacity = clamp(1 - dt / life) * 0.9; mat.size = size * (1 + dt * 0.8);
  };
  return P;
}
/** Glow sprite (sun flare, magic light). */
export function glow(color = '#ffd27a', s = 4, opacity = 0.8) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: radialTex('glow' + color, color, 'rgba(0,0,0,0)', 0.05), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity, fog: false }));
  sp.scale.set(s, s, 1); return sp;
}

// ------------------------------------------------------------------ 2D overlay (titles, nameplates)
/** Film title: chunky cartoon letters with dark stroke, warm gradient fill and drop shadow. pop 0..1 scales in. */
export function title(ctx, str, x, y, { size = 110, alpha = 1, pop = 1, fill = ['#fff3b0', '#ffb12e'], stroke = '#3a1606', font = 'Luckiest Guy', rot = 0, spacing = 2 } = {}) {
  if (alpha <= 0) return;
  const s = pop < 1 ? ease.outBack(clamp(pop), 2.2) : 1;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.font = `400 ${size}px '${font}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = spacing + 'px';
  ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(30,10,0,0.45)'; ctx.fillText(str, 0, size * 0.09);
  ctx.lineWidth = size * 0.16; ctx.strokeStyle = stroke; ctx.strokeText(str, 0, 0);
  const g = ctx.createLinearGradient(0, -size * 0.45, 0, size * 0.45); g.addColorStop(0, fill[0]); g.addColorStop(1, fill[1]);
  ctx.fillStyle = g; ctx.fillText(str, 0, 0);
  ctx.globalAlpha = alpha * 0.55; ctx.fillStyle = '#ffffff'; ctx.save(); ctx.beginPath(); ctx.rect(-2000, -size * 0.5, 4000, size * 0.32); ctx.clip(); ctx.fillText(str, 0, 0); ctx.restore();
  ctx.restore();
}
/** Nameplate: rounded pill with a coloured tab, slides/pops in. */
export function nameplate(ctx, str, x, y, { size = 50, alpha = 1, pop = 1, sub = null, color = '#ffcf4a', bg = 'rgba(28,14,8,0.86)' } = {}) {
  if (alpha <= 0) return;
  const s = pop < 1 ? ease.outBack(clamp(pop), 1.8) : 1;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = `400 ${size}px 'Luckiest Guy'`; ctx.letterSpacing = '2px';
  const w = ctx.measureText(str).width + size * 1.1, h = size * 1.45;
  let sw = 0; if (sub) { ctx.font = `700 ${size * 0.5}px 'Fredoka'`; sw = ctx.measureText(sub).width + size; }
  const W = Math.max(w, sw);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; rr(ctx, -W / 2 + 6, -h / 2 + 10, W, h + (sub ? size * 0.75 : 0), h / 2); ctx.fill();
  ctx.fillStyle = bg; rr(ctx, -W / 2, -h / 2, W, h + (sub ? size * 0.75 : 0), h / 2); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 5; rr(ctx, -W / 2, -h / 2, W, h + (sub ? size * 0.75 : 0), h / 2); ctx.stroke();
  ctx.font = `400 ${size}px 'Luckiest Guy'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(str, 0, size * 0.06);
  if (sub) { ctx.font = `700 ${size * 0.5}px 'Fredoka'`; ctx.letterSpacing = '1px'; ctx.fillStyle = '#fff4dc'; ctx.fillText(sub, 0, h * 0.5 + size * 0.12); }
  ctx.restore();
}
/** Label with a pointer line to a screen point (for things named in the narration). */
export function pointer(ctx, str, x, y, tx, ty, { size = 40, alpha = 1, color = '#fff4dc' } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.setLineDash([2, 10]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(tx, ty, 9, 0, TAU); ctx.fill();
  ctx.restore();
  nameplate(ctx, str, x, y, { size, alpha });
}
function rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
/** Cinematic finishing on the 2D layer: letterbox-free vignette + grain + optional warm flash. */
export function finish(ctx, AM, t, { flash = 0, flashC = '255,236,200', vig = 0.3, grainAmt = 0.04 } = {}) {
  if (flash > 0) { ctx.fillStyle = `rgba(${flashC},${flash})`; ctx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(ctx, { strength: vig, inner: 0.5 });
  AM.lib.grain(ctx, t, { amount: grainAmt, fps: 24 });
}
/** Stars swirl around a head (cartoon "bonk"). Draws on 2D at screen pos. */
export function dizzy(ctx, x, y, t, { r = 90, alpha = 1, n = 5 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const a = t * 5 + (i / n) * TAU, px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.32, s = 16 + 8 * (Math.sin(a) + 1);
    ctx.fillStyle = '#ffe14a'; ctx.strokeStyle = '#5a3200'; ctx.lineWidth = 4;
    ctx.beginPath(); for (let k = 0; k < 10; k++) { const rr2 = k % 2 ? s * 0.45 : s, aa = k * Math.PI / 5 - Math.PI / 2 + t * 3; ctx.lineTo(px + Math.cos(aa) * rr2, py + Math.sin(aa) * rr2); } ctx.closePath(); ctx.stroke(); ctx.fill();
  }
  ctx.restore();
}
/** Expanding ring waves (sound, crowing, magic). */
export function rings(ctx, x, y, t, { n = 3, r = 220, color = '255,255,255', alpha = 1, w = 8 } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  for (let i = 0; i < n; i++) { const u = ((t * 1.6 + i / n) % 1); ctx.strokeStyle = `rgba(${color},${(1 - u) * alpha})`; ctx.lineWidth = w * (1 - u * 0.5); ctx.beginPath(); ctx.arc(x, y, 30 + u * r, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke(); }
  ctx.restore();
}
/** Track that 3D object is in the given scene (moves characters between sets). */
export function use(scene, ...objs) { for (const o of objs) if (o && o.parent !== scene) scene.add(o); }
