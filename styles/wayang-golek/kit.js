// Maura Motion style kit: WAYANG GOLEK (3D Sundanese Carved Wooden Rod Puppets in Three.js).
// Signature look: glossy painted carved wood (lacquered faces in pearl white, crimson red, emerald, gold leaf prada),
// rotating 3D heads on a central wooden spindle (cempurit), articulated arms with bamboo/wood control rods (tuding),
// batik sarong skirts planted into a banana-stem stage log (gebog gedebog pisang), framed by a carved teak & gold
// proscenium arch under warm theatrical stage lights.
import * as THREE from 'three';
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  teak: 0x4a2812,
  teakDk: 0x2b1508,
  teakLt: 0x7c4722,
  gold: 0xe6b43c,
  goldHi: 0xfff0a8,
  crimson: 0xb8241c,
  crimsonDk: 0x6e120d,
  pearl: 0xf7f2e6,
  ivory: 0xf0d8b4,
  skin: 0xd49a68,
  emerald: 0x1d6b48,
  indigo: 0x1e3566,
  gebog: 0x5c7a34,
  gebogDk: 0x3d5420,
  fire: 0xff6a1a,
  fireHi: 0xffd84d,
  night: 0x121629,
};

// ---------------- procedural batik & carved wood textures ----------------
function makeBatikTex(kind = 'parang', baseHex = '#4a2a14', accentHex = '#e6b85c') {
  return cached(`wg-batik:${kind}:${baseHex}:${accentHex}`, () => {
    const c = makeCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = baseHex; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = accentHex; g.fillStyle = accentHex;
    if (kind === 'poleng') {
      const s = 32;
      for (let y = 0; y < 256; y += s) for (let x = 0; x < 256; x += s) {
        g.fillStyle = ((x / s + y / s) % 2 === 0) ? '#1a1817' : '#f4eee1';
        g.fillRect(x, y, s, s);
      }
      g.fillStyle = '#d9a438';
      g.fillRect(0, 0, 256, 18); g.fillRect(0, 238, 256, 18);
    } else if (kind === 'kawung') {
      g.lineWidth = 3;
      for (let y = 0; y <= 256; y += 64) for (let x = 0; x <= 256; x += 64) {
        for (let k = 0; k < 4; k++) {
          const a = Math.PI / 4 + k * Math.PI / 2;
          g.save(); g.translate(x + Math.cos(a) * 18, y + Math.sin(a) * 18); g.rotate(a);
          g.beginPath(); g.ellipse(0, 0, 16, 9, 0, 0, TAU); g.stroke();
          g.restore();
        }
      }
    } else {
      // diagonal parang / lereng stripes
      g.lineWidth = 5;
      for (let k = -256; k < 512; k += 36) {
        g.beginPath(); g.moveTo(k, 0); g.lineTo(k - 256, 256); g.stroke();
        g.fillStyle = '#f5e8c8';
        for (let j = 0; j < 256; j += 32) { g.beginPath(); g.arc(k - j + 14, j, 3, 0, TAU); g.fill(); }
      }
    }
    // gold prada hem border at bottom and top
    g.fillStyle = '#e6b43c';
    g.fillRect(0, 0, 256, 14); g.fillRect(0, 242, 256, 14);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  });
}

// ---------------- materials ----------------
export function woodMat(color, { roughness = 0.26, metalness = 0.08, emissive = 0x000000, emissiveIntensity = 0 } = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
}
export function goldMat({ emissiveIntensity = 0.08 } = {}) {
  return new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.25, metalness: 0.68, emissive: 0x5c3d08, emissiveIntensity });
}
export function clothMat(kind = 'parang', baseHex = '#4a2a14', accentHex = '#e6b85c') {
  return new THREE.MeshStandardMaterial({ map: makeBatikTex(kind, baseHex, accentHex), roughness: 0.55, metalness: 0.05 });
}

// ---------------- stage & lighting ----------------
/**
 * Build the 3D Wayang Golek theatrical stage:
 * - banana trunk log (gebog) across the front with carved teak frame
 * - warm stage lighting (key, fill, rim, footlight)
 * - painted backdrop cyclorama + carved golden arch
 */
export function golekStage(AM, { theme = 'alengka', pr = 0.75 } = {}) {
  const canvas = AM.layer('3d', { type: 'webgl', z: 0 });
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(pr);
  renderer.setSize(AM.W, AM.H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAL.night);
  const camera = new THREE.PerspectiveCamera(46, AM.W / AM.H, 0.1, 160);

  const hemi = new THREE.HemisphereLight(0xffe6b8, 0x2a1810, 0.85);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff0d0, 2.1);
  key.position.set(8, 16, 14);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 2;
  key.shadow.camera.far = 45;
  const d = 14;
  key.shadow.camera.left = -d; key.shadow.camera.right = d;
  key.shadow.camera.top = d; key.shadow.camera.bottom = -d;
  key.shadow.bias = -0.001;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xff9d42, 1.15);
  rim.position.set(-10, 11, -8);
  scene.add(rim);

  const footLight = new THREE.PointLight(0xffa834, 1.6, 26);
  footLight.position.set(0, 1.5, 6.5);
  scene.add(footLight);

  // Stage root group
  const stage = new THREE.Group();
  scene.add(stage);

  // 1. Gebog (banana tree trunk where puppets are planted) at y = -2.2, z = 0
  const gebogGeo = new THREE.CylinderGeometry(0.95, 1.05, 18, 20);
  gebogGeo.rotateZ(Math.PI / 2);
  const gebog = new THREE.Mesh(gebogGeo, woodMat(PAL.gebog, { roughness: 0.65 }));
  gebog.position.set(0, -2.35, 0);
  gebog.receiveShadow = true;
  stage.add(gebog);

  // Gebog rings & wooden cradle supports
  for (let x = -7.5; x <= 7.5; x += 2.5) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.06, 8, 24), woodMat(PAL.gebogDk, { roughness: 0.7 }));
    ring.rotation.y = Math.PI / 2;
    ring.position.set(x, -2.35, 0);
    stage.add(ring);
  }
  const baseBeam = new THREE.Mesh(new THREE.BoxGeometry(19, 1.4, 2.8), woodMat(PAL.teakDk));
  baseBeam.position.set(0, -3.5, 0);
  stage.add(baseBeam);
  const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(18.6, 0.18, 2.9), goldMat());
  goldTrim.position.set(0, -2.85, 0);
  stage.add(goldTrim);

  // 2. Carved Proscenium Pillars (Left & Right) + Top Plengkung Arch
  for (const sd of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 18, 12), woodMat(PAL.teak));
    pillar.position.set(sd * 6.8, 5.5, 1.2);
    stage.add(pillar);
    for (let y = -1; y <= 11; y += 3) {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.35, 12), goldMat());
      band.position.set(sd * 6.8, y, 1.2);
      stage.add(band);
    }
  }
  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(15.2, 1.5, 1.4), woodMat(PAL.teakDk));
  topBeam.position.set(0, 13.5, 1.2);
  stage.add(topBeam);
  const topCrown = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.0, 5), goldMat());
  topCrown.position.set(0, 12.6, 1.6);
  topCrown.rotation.x = Math.PI;
  stage.add(topCrown);

  // 3. Backdrop Cyclorama Plane & Scenic Midground Props
  const bgGroup = new THREE.Group();
  bgGroup.position.set(0, 4.2, -5.5);
  stage.add(bgGroup);

  const cycMat = new THREE.MeshBasicMaterial({ color: 0x1c2342 });
  const cyc = new THREE.Mesh(new THREE.PlaneGeometry(36, 32), cycMat);
  cyc.position.set(0, 2, -4);
  bgGroup.add(cyc);

  // Halo / Moon / Sun disc on backdrop
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xffc857, transparent: true, opacity: 0.32 });
  const halo = new THREE.Mesh(new THREE.CircleGeometry(4.8, 32), haloMat);
  halo.position.set(0, 1.5, -2.5);
  bgGroup.add(halo);

  // Palace silhouette / Mountain / Crater props (toggled by setTheme)
  const props = {};

  // Alengka Palace Towers & Gate
  const alengkaGrp = new THREE.Group();
  for (const [x, h, w] of [[0, 7.5, 3.6], [-3.8, 5.4, 2.4], [3.8, 5.4, 2.4]]) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), woodMat(0x521d18));
    body.position.set(x, h / 2 - 4.5, 0);
    alengkaGrp.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, 2.6, 4), goldMat());
    roof.rotation.y = Math.PI / 4;
    roof.position.set(x, h - 4.5 + 1.3, 0);
    alengkaGrp.add(roof);
  }
  bgGroup.add(alengkaGrp);
  props.alengka = alengkaGrp;

  // Taman Argasoka ( flowering trees + pavilion )
  const tamanGrp = new THREE.Group();
  for (const [x, s] of [[-3.4, 1.15], [3.5, 1.05]]) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 5.5, 8), woodMat(PAL.teak));
    trunk.position.set(x, -2.2, 0.4);
    tamanGrp.add(trunk);
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1 * s, 1), woodMat(0x28663e, { roughness: 0.5 }));
    crown.position.set(x, 1.2, 0.4);
    tamanGrp.add(crown);
    for (let i = 0; i < 6; i++) {
      const fl = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), goldMat({ emissiveIntensity: 0.25 }));
      const a = (i / 6) * TAU;
      fl.position.set(x + Math.cos(a) * 1.6, 1.2 + Math.sin(a) * 1.1, 1.5);
      tamanGrp.add(fl);
    }
  }
  tamanGrp.visible = false;
  bgGroup.add(tamanGrp);
  props.taman = tamanGrp;

  // Pasundan Village / Pendopo (for Cepot demo)
  const sundaGrp = new THREE.Group();
  const pendopoRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.8, 4), woodMat(PAL.teakLt));
  pendopoRoof.rotation.y = Math.PI / 4;
  pendopoRoof.position.set(0, 2.2, 0);
  sundaGrp.add(pendopoRoof);
  for (const x of [-3.2, -1.2, 1.2, 3.2]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 5.4, 8), woodMat(PAL.teak));
    col.position.set(x, -1.6, 0);
    sundaGrp.add(col);
  }
  const mt = new THREE.Mesh(new THREE.ConeGeometry(7.5, 6.5, 6), woodMat(0x2d4f5c, { roughness: 0.7 }));
  mt.position.set(-2.5, -1.2, -1.8);
  sundaGrp.add(mt);
  sundaGrp.visible = false;
  bgGroup.add(sundaGrp);
  props.sunda = sundaGrp;

  // Kawah Candradimuka (Volcanic Crater & Cauldron for Gatotkaca demo)
  const kawahGrp = new THREE.Group();
  const rimCone = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 5.6, 3.6, 12, 1, true), woodMat(0x3a241e, { roughness: 0.7 }));
  rimCone.position.set(0, -2.6, 0.5);
  kawahGrp.add(rimCone);
  const lavaPool = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 16), woodMat(PAL.fire, { emissive: PAL.fire, emissiveIntensity: 0.85 }));
  lavaPool.position.set(0, -1.1, 0.5);
  kawahGrp.add(lavaPool);
  kawahGrp.visible = false;
  bgGroup.add(kawahGrp);
  props.kawah = kawahGrp;

  function setTheme(name) {
    Object.values(props).forEach((g) => { g.visible = false; });
    if (name === 'alengka') {
      props.alengka.visible = true;
      cycMat.color.setHex(0x28131a);
      haloMat.color.setHex(0xff9b42);
      footLight.color.setHex(0xff9b38);
    } else if (name === 'fire') {
      props.alengka.visible = true;
      cycMat.color.setHex(0x4a120a);
      haloMat.color.setHex(0xff4814);
      footLight.color.setHex(0xff5514);
    } else if (name === 'taman') {
      props.taman.visible = true;
      cycMat.color.setHex(0x162b38);
      haloMat.color.setHex(0xffe89e);
      footLight.color.setHex(0xffc966);
    } else if (name === 'sunda') {
      props.sunda.visible = true;
      cycMat.color.setHex(0x1e3545);
      haloMat.color.setHex(0xffd278);
      footLight.color.setHex(0xffb84d);
    } else if (name === 'kawah') {
      props.kawah.visible = true;
      cycMat.color.setHex(0x33120d);
      haloMat.color.setHex(0xff621a);
      footLight.color.setHex(0xff621a);
    } else {
      props.sunda.visible = true;
      cycMat.color.setHex(0x182238);
      haloMat.color.setHex(0xffd06b);
    }
  }
  setTheme(theme);

  return { scene, camera, renderer, stage, key, rim, footLight, setTheme, props, render: () => renderer.render(scene, camera) };
}

/** Smooth camera positioning helper tuned for 9:16 vertical stage framing. */
export function lookStage(camera, { pos = [0, 2.2, 11.8], target = [0, 1.3, 0], fov = 50, sway = 0, t = 0 } = {}) {
  camera.fov = fov;
  camera.updateProjectionMatrix();
  const sx = Math.sin(t * 0.7) * sway, sy = Math.cos(t * 0.5) * sway * 0.5;
  camera.position.set(pos[0] + sx, pos[1] + sy, pos[2] + 1.2);
  camera.lookAt(target[0], target[1], target[2]);
}

// ---------------- 3D Gunungan / Kayon ----------------
export function makeGunungan() {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(-2.2, 1.4, -1.8, 3.8);
  shape.quadraticCurveTo(-1.1, 6.2, 0, 7.6);
  shape.quadraticCurveTo(1.1, 6.2, 1.8, 3.8);
  shape.quadraticCurveTo(2.2, 1.4, 0, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
  geo.center();
  const body = new THREE.Mesh(geo, goldMat({ emissiveIntensity: 0.12 }));
  body.position.y = 3.8;
  body.castShadow = true;
  g.add(body);

  // Red lacquer inner heart + central Tree of Life relief
  const inner = new THREE.Mesh(new THREE.ConeGeometry(1.15, 4.6, 6), woodMat(PAL.crimson));
  inner.position.set(0, 3.4, 0.02);
  inner.scale.set(1, 1, 0.22);
  g.add(inner);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.5, 8), woodMat(PAL.teakDk));
  stem.position.y = -0.8;
  g.add(stem);
  return g;
}

// ---------------- 3D Fire Bank (for Alengka / Kawah Candradimuka) ----------------
export function makeFireBank(count = 14) {
  const grp = new THREE.Group();
  const flames = [];
  for (let i = 0; i < count; i++) {
    const h = 1.2 + hrand(i, 1) * 1.8;
    const mat = woodMat(i % 2 ? PAL.fire : PAL.fireHi, { emissive: i % 2 ? PAL.fire : PAL.fireHi, emissiveIntensity: 0.85, roughness: 0.3 });
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.35 + hrand(i, 2) * 0.35, h, 7), mat);
    const x = (hrand(i, 3) - 0.5) * 9.5;
    const z = -1.5 - hrand(i, 4) * 3.2;
    m.position.set(x, -1.6 + h * 0.4, z);
    grp.add(m);
    flames.push({ m, baseH: h, phase: hrand(i, 5) * TAU, x, z });
  }
  grp.userData.update = (t, intensity = 1) => {
    grp.visible = intensity > 0.01;
    for (const f of flames) {
      const s = intensity * (0.75 + 0.35 * Math.sin(t * 9 + f.phase));
      f.m.scale.set(s, s, s);
      f.m.rotation.z = Math.sin(t * 6 + f.phase) * 0.14;
    }
  };
  grp.visible = false;
  return grp;
}

// ---------------- 3D Wayang Golek Puppet Builder ----------------
const CHAR_SPEC = {
  hanoman: {
    face: PAL.pearl, torso: PAL.pearl, crown: 'supit', batik: ['poleng', '#1a1817', '#f4eee1'],
    eyes: 'bold', snout: true, tail: true, scale: 1.0,
  },
  rahwana: {
    face: PAL.crimson, torso: PAL.crimson, crown: 'tallGold', batik: ['parang', '#5c140e', '#f0b840'],
    eyes: 'bulge', fangs: true, moustache: true, scale: 1.18,
  },
  sinta: {
    face: PAL.ivory, torso: PAL.emerald, crown: 'siger', batik: ['parang', '#3b1f10', '#e8b858'],
    eyes: 'liyep', slender: true, selendang: PAL.crimson, scale: 0.94,
  },
  rama: {
    face: 0x56a87a, torso: PAL.indigo, crown: 'tallGold', batik: ['parang', '#241838', '#e8b858'],
    eyes: 'liyep', bow: true, scale: 1.02,
  },
  cepot: {
    face: 0xc83728, torso: 0x1e1d22, crown: 'iket', batik: ['kawung', '#5a2e16', '#e6b85c'],
    eyes: 'round', tooth: true, scale: 0.98,
  },
  dawala: {
    face: 0xd99b52, torso: 0x2c4230, crown: 'iket', batik: ['kawung', '#3b2414', '#d9a441'],
    eyes: 'round', longNose: true, scale: 0.98,
  },
  semar: {
    face: PAL.pearl, torso: 0x1c1a17, crown: 'kuncung', batik: ['poleng', '#1a1817', '#f4eee1'],
    eyes: 'round', roundBelly: true, scale: 1.04,
  },
  gatotkaca: {
    face: PAL.skin, torso: 0x1d294a, crown: 'wingedGold', batik: ['parang', '#4a2612', '#f0c24d'],
    eyes: 'bold', moustache: true, starChest: true, wings: true, scale: 1.08,
  },
  buto: {
    face: 0x3b6e38, torso: 0x2d542b, crown: 'wildHair', batik: ['parang', '#521814', '#d99b38'],
    eyes: 'bulge', fangs: true, scale: 1.15,
  },
};

/**
 * Create an articulated 3D Wayang Golek wooden puppet.
 * Returns a Group with sub-parts stored in `puppet.userData.parts` for animation via `posePuppet()`.
 */
export function makePuppet(kind = 'hanoman', opts = {}) {
  const spec = CHAR_SPEC[kind] || CHAR_SPEC.hanoman;
  const root = new THREE.Group();
  const s = (opts.scale ?? 1) * spec.scale;
  root.scale.set(s, s, s);

  // 1. Cempurit (central vertical wooden spindle sticking into the gebog)
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 5.2, 10), woodMat(PAL.teakDk));
  spindle.position.y = 0.4;
  root.add(spindle);

  // 2. Kain Sarung (long pleated wooden/cloth skirt cylinder)
  const skirtGeo = new THREE.CylinderGeometry(0.56, 0.86, 2.65, 18);
  const skirt = new THREE.Mesh(skirtGeo, clothMat(...spec.batik));
  skirt.position.y = -0.35;
  skirt.castShadow = true;
  skirt.receiveShadow = true;
  root.add(skirt);

  // Gold belt (pending) at waist
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.6, 0.24, 18), goldMat());
  belt.position.y = 0.95;
  root.add(belt);

  // 3. Upper Body Group (twists left/right on the spindle)
  const body = new THREE.Group();
  body.position.y = 1.05;
  root.add(body);

  const torsoW = spec.roundBelly ? 0.92 : spec.slender ? 0.56 : 0.72;
  const torsoGeo = new THREE.CylinderGeometry(torsoW * 1.08, torsoW * 0.82, 1.55, 16);
  const torso = new THREE.Mesh(torsoGeo, woodMat(spec.torso));
  torso.position.y = 0.78;
  torso.castShadow = true;
  body.add(torso);

  // Carved golden chest collar (badong / sumping dada)
  const collar = new THREE.Mesh(new THREE.TorusGeometry(torsoW * 0.95, 0.11, 10, 24), goldMat());
  collar.rotation.x = Math.PI / 2 + 0.18;
  collar.position.y = 1.45;
  body.add(collar);

  // Gatotkaca's 8-pointed golden star (Kotang Antakusuma) on chest
  if (spec.starChest) {
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), goldMat({ emissiveIntensity: 0.25 }));
    star.scale.set(1.2, 1.2, 0.35);
    star.position.set(0, 0.88, torsoW * 0.92);
    body.add(star);
  }
  if (spec.wings) {
    const wingPlate = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.2, 0.12), goldMat());
    wingPlate.position.set(0, 0.95, -torsoW * 0.85);
    body.add(wingPlate);
  }

  // 4. Articulated Arms + Tuding Control Rods (Left & Right)
  const arms = {};
  for (const [key, sd] of [['L', -1], ['R', 1]]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(sd * (torsoW * 1.08 + 0.14), 1.42, 0);
    body.add(shoulder);

    // Golden shoulder cap (kelat bahu)
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), goldMat());
    shoulder.add(cap);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.95, 10), woodMat(spec.face));
    upperArm.position.y = -0.48;
    upperArm.castShadow = true;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.y = -0.95;
    shoulder.add(elbow);

    const wristBrace = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 10), goldMat());
    wristBrace.position.y = -0.82;
    elbow.add(wristBrace);

    const foreArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.9, 10), woodMat(spec.face));
    foreArm.position.y = -0.45;
    foreArm.castShadow = true;
    elbow.add(foreArm);

    const hand = new THREE.Group();
    hand.position.y = -0.92;
    elbow.add(hand);

    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), woodMat(spec.face));
    hand.add(palm);

    // Tuding (thin bamboo/wood control rod hinged at the hand, always hanging down toward the dalang)
    const tuding = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 3.4, 6), woodMat(PAL.teakLt));
    tuding.position.set(0, -1.7, 0.04);
    hand.add(tuding);

    arms[key] = { shoulder, elbow, hand };
  }

  // Optional weapon/prop in Right Hand (e.g. Rama's bow, Rahwana's gada)
  if (spec.bow) {
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 8, 20, Math.PI * 1.25), goldMat());
    bow.rotation.z = -Math.PI / 2;
    bow.position.set(0, -0.95, 0.25);
    arms.L.elbow.add(bow);
  }

  // Hanoman's curved monkey tail + ignitable fire tip!
  let tailGroup = null, tailFlame = null;
  if (spec.tail) {
    tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.1, -0.45);
    body.add(tailGroup);
    for (let i = 0; i < 6; i++) {
      const seg = new THREE.Mesh(new THREE.SphereGeometry(0.14 - i * 0.01, 10, 8), woodMat(PAL.pearl));
      const a = i * 0.35;
      seg.position.set(0, i * 0.36, -Math.sin(a) * 0.65 - i * 0.12);
      tailGroup.add(seg);
    }
    tailFlame = new THREE.Group();
    tailFlame.position.set(0, 2.05, -0.95);
    const f1 = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.95, 8), woodMat(PAL.fire, { emissive: PAL.fire, emissiveIntensity: 0.95 }));
    const f2 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.65, 8), woodMat(PAL.fireHi, { emissive: PAL.fireHi, emissiveIntensity: 1.0 }));
    f2.position.y = 0.1;
    tailFlame.add(f1, f2);
    tailFlame.visible = false;
    tailGroup.add(tailFlame);
  }

  // 5. Rotating Carved Wooden Head Group (the soul of Wayang Golek!)
  const head = new THREE.Group();
  head.position.y = 1.98;
  body.add(head);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.52, 18, 16), woodMat(spec.face, { roughness: 0.2 }));
  cranium.scale.set(0.92, 1.08, 0.96);
  cranium.castShadow = true;
  head.add(cranium);

  // Nose / Snout
  if (spec.snout) {
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), woodMat(PAL.pearl, { roughness: 0.22 }));
    snout.scale.set(1.0, 0.78, 1.15);
    snout.position.set(0, -0.1, 0.42);
    head.add(snout);
  } else if (spec.longNose) {
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.65, 10), woodMat(spec.face));
    nose.rotation.x = Math.PI / 2 - 0.15;
    nose.position.set(0, -0.02, 0.62);
    head.add(nose);
  } else {
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 8), woodMat(spec.face));
    nose.rotation.x = Math.PI / 2 - 0.2;
    nose.position.set(0, 0.0, 0.52);
    head.add(nose);
  }

  // Eyes
  for (const sd of [-1, 1]) {
    const eyeR = spec.eyes === 'bulge' ? 0.13 : spec.eyes === 'round' ? 0.11 : 0.085;
    const white = new THREE.Mesh(new THREE.SphereGeometry(eyeR, 10, 10), woodMat(0xfffaf0, { roughness: 0.15 }));
    white.position.set(sd * 0.2, 0.08, 0.43);
    head.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 0.55, 8, 8), woodMat(0x14100e, { roughness: 0.1 }));
    pupil.position.set(sd * 0.2, 0.08, 0.43 + eyeR * 0.65);
    head.add(pupil);
  }

  // Cepot's iconic single white bottom tooth!
  if (spec.tooth) {
    const smile = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.12), woodMat(0x3a120e));
    smile.position.set(0, -0.22, 0.44);
    head.add(smile);
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.12), woodMat(0xffffff, { roughness: 0.15 }));
    tooth.position.set(0.06, -0.22, 0.48);
    head.add(tooth);
  }

  // Fangs for Rahwana / Buto
  if (spec.fangs) {
    for (const sd of [-1, 1]) {
      const fang = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.22, 8), woodMat(0xfff8e6));
      fang.rotation.x = Math.PI;
      fang.position.set(sd * 0.18, -0.24, 0.48);
      head.add(fang);
    }
  }
  if (spec.moustache) {
    for (const sd of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 8), woodMat(0x181310));
      wing.rotation.z = sd * (Math.PI / 2 - 0.25);
      wing.position.set(sd * 0.14, -0.11, 0.49);
      head.add(wing);
    }
  }

  // Crown / Headgear (Makuta, Gelung Supit Urang, Siger, Iket Sunda, Kuncung)
  if (spec.crown === 'supit') {
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.48, 0.28, 16), goldMat());
    base.position.y = 0.42;
    head.add(base);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.11, 10, 20, Math.PI * 1.25), goldMat());
    arch.rotation.y = Math.PI / 2;
    arch.position.set(0, 0.68, -0.18);
    head.add(arch);
  } else if (spec.crown === 'tallGold' || spec.crown === 'wingedGold') {
    for (let i = 0; i < 3; i++) {
      const tier = new THREE.Mesh(new THREE.CylinderGeometry(0.46 - i * 0.1, 0.52 - i * 0.1, 0.34, 14), goldMat());
      tier.position.y = 0.42 + i * 0.3;
      head.add(tier);
    }
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 10), goldMat());
    finial.position.y = 1.42;
    head.add(finial);
    if (spec.crown === 'wingedGold') {
      for (const sd of [-1, 1]) {
        const sumping = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 6), goldMat());
        sumping.rotation.z = -sd * 0.55;
        sumping.position.set(sd * 0.55, 0.35, 0);
        head.add(sumping);
      }
    }
  } else if (spec.crown === 'siger') {
    const siger = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.46, 0.36, 12), goldMat());
    siger.position.y = 0.44;
    head.add(siger);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), woodMat(0x181310));
    bun.position.set(0, 0.25, -0.38);
    head.add(bun);
  } else if (spec.crown === 'iket') {
    const iket = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.5, 0.32, 16), clothMat('kawung', '#4a2812', '#e6b85c'));
    iket.position.y = 0.36;
    head.add(iket);
    const knot = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 6), clothMat('kawung', '#4a2812', '#e6b85c'));
    knot.rotation.z = -0.5;
    knot.position.set(0.46, 0.48, 0);
    head.add(knot);
  } else if (spec.crown === 'kuncung') {
    const kuncung = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), woodMat(PAL.pearl));
    kuncung.position.set(0, 0.62, 0.12);
    head.add(kuncung);
  } else {
    const hair = new THREE.Mesh(new THREE.DodecahedronGeometry(0.62, 1), woodMat(0x1c1614, { roughness: 0.7 }));
    hair.position.set(0, 0.35, -0.1);
    head.add(hair);
  }

  root.userData.parts = { body, head, arms, skirt, tailGroup, tailFlame };
  return root;
}

/**
 * Animate a 3D Wayang Golek puppet with authentic wooden rod-puppet motion:
 * - subtle breathing & rhythmic bobbing along the cempurit rod
 * - expressive head turns (yaw & pitch) independent of torso twist
 * - articulated shoulder & elbow swings driven by the tuding rods
 */
export function posePuppet(puppet, t, {
  x = 0, y = 0, z = 0,
  face = 1, // 1 = angled right, -1 = angled left, 0 = front
  bob = 1,
  twist = 0,
  headYaw = 0,
  headNod = 0,
  armL = 0.3,
  elbowL = -0.6,
  armR = 0.5,
  elbowR = -0.8,
  wave = 0,
  tailFire = 0,
  visible = true,
} = {}) {
  puppet.visible = visible;
  if (!visible) return;
  const { body, head, arms, tailGroup, tailFlame } = puppet.userData.parts;
  const bobY = Math.sin(t * 4.2 + x) * 0.06 * bob;
  puppet.position.set(x, y + bobY, z);

  // Base facing angle (3/4 stage profile toward the center)
  const baseY = face === 1 ? 0.48 : face === -1 ? -0.48 : 0;
  puppet.rotation.y = baseY;

  body.rotation.y = twist + Math.sin(t * 2.6 + x) * 0.06 * bob;
  body.rotation.z = Math.sin(t * 3.1 + x) * 0.025 * bob;

  // Signature Wayang Golek head articulation!
  head.rotation.y = headYaw + Math.sin(t * 3.8 + x * 2) * 0.14 * bob;
  head.rotation.x = headNod + Math.cos(t * 4.5 + x) * 0.07 * bob;

  const wv = Math.sin(t * 7.5) * 0.35 * wave;
  const shL = -armL - wv * 0.5, elL = elbowL - Math.abs(wv) * 0.4;
  arms.L.shoulder.rotation.x = shL;
  arms.L.shoulder.rotation.z = -0.18;
  arms.L.elbow.rotation.x = elL;
  arms.L.hand.rotation.x = -(shL + elL);
  arms.L.hand.rotation.z = 0.12;

  const shR = -armR - wv, elR = elbowR - Math.abs(wv) * 0.6;
  arms.R.shoulder.rotation.x = shR;
  arms.R.shoulder.rotation.z = 0.18;
  arms.R.elbow.rotation.x = elR;
  arms.R.hand.rotation.x = -(shR + elR);
  arms.R.hand.rotation.z = -0.12;

  if (tailGroup) {
    tailGroup.rotation.x = Math.sin(t * 4.0) * 0.12;
    if (tailFlame) {
      tailFlame.visible = tailFire > 0.02;
      const fs = tailFire * (0.85 + 0.25 * Math.sin(t * 14));
      tailFlame.scale.set(fs, fs, fs);
    }
  }
}

// ---------------- 2D HUD: Sundanese Carved Teak & Gold Plaque ----------------
export function golekPlaque(ctx, title, sub = '', { y = 148, alpha = 1 } = {}) {
  const a = clamp(alpha, 0, 1);
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = a * 0.96;
  ctx.font = "700 42px 'Cinzel', 'Playfair Display', serif";
  const tw = ctx.measureText(title).width;
  ctx.font = "600 26px 'Plus Jakarta Sans', sans-serif";
  const sw = sub ? ctx.measureText(sub).width : 0;
  const w = Math.max(tw, sw) + 120, h = sub ? 118 : 82;
  const x = 540 - w / 2, top = y - h / 2;

  // Carved dark teak wood board with golden prada double border
  ctx.fillStyle = '#2b1508';
  ctx.beginPath(); ctx.roundRect(x, top, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#e6b43c'; ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 240, 168, 0.45)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(x + 8, top + 8, w - 16, h - 16, 9); ctx.stroke();

  // Golden Sundanese diamond corner ornaments
  ctx.fillStyle = '#e6b43c';
  for (const sx of [x + 22, x + w - 22]) {
    ctx.beginPath();
    ctx.moveTo(sx, y - 10); ctx.lineTo(sx + 10, y); ctx.lineTo(sx, y + 10); ctx.lineTo(sx - 10, y);
    ctx.closePath(); ctx.fill();
  }

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff0c2';
  ctx.font = "700 40px 'Cinzel', 'Playfair Display', serif";
  ctx.fillText(title, 540, sub ? y - 18 : y + 2);
  if (sub) {
    ctx.fillStyle = '#e6b43c';
    ctx.font = "600 25px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(sub, 540, y + 26);
  }
  ctx.restore();
}

export { THREE, clamp, lerp, ease, hrand, noise, mulberry32, TAU };
