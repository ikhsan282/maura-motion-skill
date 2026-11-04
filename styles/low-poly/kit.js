// Maura Motion style kit: LOW POLY (3D faceted flat-shaded world, Three.js).
// Signature: crisp triangle facets (`flatShading: true`), polygonal heaving ocean waves,
// faceted islands & volcanoes, low-poly ships (Phinisi & 17th-century Galleon), nutmeg/palm trees,
// clustered geometric clouds, and polygonal HUD badges.
import * as THREE from 'three';
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';

export const PAL = {
  skyTop: '#1b3b6f',
  skyMid: '#3a7ca5',
  skyHorizon: '#f4d58d',
  sea: '#197bbd',
  seaDeep: '#104f7a',
  foam: '#e8f7ff',
  sand: '#edd39c',
  grass: '#4d9b52',
  forest: '#2d6e3e',
  rock: '#6c757d',
  rockDark: '#495057',
  wood: '#7c4d2b',
  woodLight: '#a66c3e',
  sail: '#fbf6ec',
  red: '#d9412b',
  gold: '#f2b735',
  lava: '#ff5412',
  ink: '#161920',
};

// ============================================================ stage & camera
export function createStage(AM, { pr = 0.72, aa = true, shadows = true, exposure = 1.05, fov = 54, bg = '#88c4e8', fog = true } = {}) {
  const canvas = AM.layer('3d', { type: 'webgl', z: 0 });
  const R = new THREE.WebGLRenderer({ canvas, antialias: aa, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  R.setPixelRatio(pr);
  R.setSize(AM.W, AM.H, false);
  R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping;
  R.toneMappingExposure = exposure;
  R.shadowMap.enabled = shadows;
  R.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);
  if (fog) scene.fog = new THREE.FogExp2(bg, 0.014);

  const cam = new THREE.PerspectiveCamera(fov, AM.W / AM.H, 0.1, 400);
  return {
    R,
    scene,
    cam,
    canvas,
    setSky(col, fogDensity = 0.014) {
      scene.background.set(col);
      if (scene.fog) {
        scene.fog.color.set(col);
        scene.fog.density = fogDensity;
      }
    },
    render: () => R.render(scene, cam),
  };
}

export function lightRig(scene, { sun = '#fff0cc', sunI = 2.8, sky = '#bfe3ff', ground = '#8c7250', hemiI = 1.25, rim = '#ffd199', rimI = 0.9 } = {}) {
  const hemi = new THREE.HemisphereLight(sky, ground, hemiI);
  const key = new THREE.DirectionalLight(sun, sunI);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  const rimL = new THREE.DirectionalLight(rim, rimI);
  scene.add(hemi, key, key.target, rimL, rimL.target);

  return {
    hemi,
    key,
    rim: rimL,
    aim(c = [0, 0, 0], { dir = [0.65, 1.1, 0.55], r = 14, rimDir = [-0.7, 0.5, -0.8] } = {}) {
      const d = new THREE.Vector3(...dir).normalize();
      key.target.position.set(c[0], c[1], c[2]);
      key.position.set(c[0] + d.x * 36, c[1] + d.y * 36, c[2] + d.z * 36);
      const sc = key.shadow.camera;
      sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 1; sc.far = 90;
      sc.updateProjectionMatrix();
      const rd = new THREE.Vector3(...rimDir).normalize();
      rimL.target.position.set(c[0], c[1], c[2]);
      rimL.position.set(c[0] + rd.x * 26, c[1] + rd.y * 26, c[2] + rd.z * 26);
    },
    mood(m = {}) {
      if (m.sun) key.color.set(m.sun);
      if (m.sunI != null) key.intensity = m.sunI;
      if (m.sky) hemi.color.set(m.sky);
      if (m.ground) hemi.groundColor.set(m.ground);
      if (m.hemiI != null) hemi.intensity = m.hemiI;
      if (m.rim) rimL.color.set(m.rim);
      if (m.rimI != null) rimL.intensity = m.rimI;
    },
  };
}

export function look(cam, pos, target, { roll = 0, t = 0, drift = 0.04, fov = null, pull = 1.32 } = {}) {
  const dx = noise.n2(t * 0.35, 11) * drift;
  const dy = noise.n2(t * 0.3, 23) * drift;
  const px = target[0] + (pos[0] - target[0]) * pull + dx;
  const py = target[1] + (pos[1] - target[1]) * pull + dy;
  const pz = target[2] + (pos[2] - target[2]) * pull;
  cam.position.set(px, py, pz);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(target[0] + dx * 0.4, target[1] + dy * 0.4, target[2]);
  if (fov && cam.fov !== fov) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }
}

export function camLerp(cam, A, B, u, t, o = {}) {
  const P = A.p.map((v, i) => lerp(v, B.p[i], u));
  const L = A.l.map((v, i) => lerp(v, B.l[i], u));
  look(cam, P, L, { t, ...o, roll: lerp(A.roll || 0, B.roll || 0, u) });
}

export function orbit(cam, c, ang, rad, h, t, o = {}) {
  look(cam, [c[0] + Math.sin(ang) * rad, c[1] + h, c[2] + Math.cos(ang) * rad], c, { t, ...o });
}

// ============================================================ low-poly geometry & material helpers
export function polyMat(color, { roughness = 0.72, metalness = 0.06, emissive = '#000000', emissiveIntensity = 0, transparent = false, opacity = 1 } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    emissive,
    emissiveIntensity,
    flatShading: true,
    transparent,
    opacity,
  });
}

/** Watertight vertex jitter that keeps shared vertices welded while giving a crisp faceted surface. */
export function jitterGeo(geo, amp = 0.12, seed = 1) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const pos = g.attributes.position;
  const map = new Map();
  const r = mulberry32(seed);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const key = `${Math.round(x * 1000)},${Math.round(y * 1000)},${Math.round(z * 1000)}`;
    let off = map.get(key);
    if (!off) {
      off = [(r() - 0.5) * 2 * amp, (r() - 0.5) * 2 * amp, (r() - 0.5) * 2 * amp];
      map.set(key, off);
    }
    pos.setXYZ(i, x + off[0], y + off[1], z + off[2]);
  }
  pos.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}

export function castShadowAll(root, cast = true, receive = true) {
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = cast;
      o.receiveShadow = receive;
    }
  });
  return root;
}

// ============================================================ low-poly ocean
export function polySea({ size = 110, segs = 40, color = PAL.sea, roughness = 0.38, metalness = 0.12 } = {}) {
  const base = new THREE.PlaneGeometry(size, size, segs, segs);
  base.rotateX(-Math.PI / 2);
  const geo = base.toNonIndexed();
  const pos = geo.attributes.position;
  const orig = new Float32Array(pos.array);
  const mat = polyMat(color, { roughness, metalness });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;

  mesh.tick = (t, amp = 0.28, speed = 1.7) => {
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;
      const x = orig[ix], z = orig[ix + 2];
      const y =
        Math.sin(x * 0.42 + t * speed) * amp * 0.65 +
        Math.cos(z * 0.36 - t * speed * 0.85) * amp * 0.55 +
        Math.sin((x + z) * 0.25 + t * speed * 1.2) * amp * 0.35;
      pos.array[ix + 1] = y;
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  };
  mesh.tick(0);
  return mesh;
}

// ============================================================ islands, mountains & volcanoes
export function polyIsland({ r = 5.5, h = 2.4, seed = 7, sandColor = PAL.sand, grassColor = PAL.grass, rockColor = PAL.rock } = {}) {
  const grp = new THREE.Group();
  const sandGeo = jitterGeo(new THREE.CylinderGeometry(r * 0.88, r * 1.12, h * 0.28, 11, 1), r * 0.06, seed);
  const sand = new THREE.Mesh(sandGeo, polyMat(sandColor, { roughness: 0.85 }));
  sand.position.y = h * 0.1;

  const rockGeo = jitterGeo(new THREE.CylinderGeometry(r * 0.68, r * 0.86, h * 0.48, 10, 2), r * 0.08, seed + 3);
  const rock = new THREE.Mesh(rockGeo, polyMat(rockColor, { roughness: 0.8 }));
  rock.position.y = h * 0.42;

  const grassGeo = jitterGeo(new THREE.CylinderGeometry(r * 0.52, r * 0.7, h * 0.38, 10, 1), r * 0.07, seed + 9);
  const grass = new THREE.Mesh(grassGeo, polyMat(grassColor, { roughness: 0.78 }));
  grass.position.y = h * 0.78;

  grp.add(sand, rock, grass);
  return castShadowAll(grp);
}

export function polyVolcano({ r = 6.5, h = 5.2, seed = 13, lava = true } = {}) {
  const grp = new THREE.Group();
  const coneGeo = jitterGeo(new THREE.CylinderGeometry(r * 0.26, r, h, 12, 4, false), r * 0.08, seed);
  const cone = new THREE.Mesh(coneGeo, polyMat('#4a4e58', { roughness: 0.85 }));
  cone.position.y = h * 0.5;
  grp.add(cone);

  const rimGeo = jitterGeo(new THREE.TorusGeometry(r * 0.24, r * 0.06, 6, 10), r * 0.02, seed + 2);
  rimGeo.rotateX(Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, polyMat('#2f323a', { roughness: 0.9 }));
  rim.position.y = h * 0.98;
  grp.add(rim);

  const craterMat = polyMat(lava ? PAL.lava : '#2b2d34', {
    emissive: lava ? '#ff3b00' : '#000000',
    emissiveIntensity: lava ? 1.4 : 0,
  });
  const crater = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.2, r * 0.16, 0.2, 10), craterMat);
  crater.position.y = h * 0.96;
  grp.add(crater);

  // Smoke & ember puffs for eruption
  const puffs = [];
  const puffGrp = new THREE.Group();
  for (let i = 0; i < 14; i++) {
    const isLava = i < 5;
    const m = new THREE.Mesh(
      jitterGeo(new THREE.IcosahedronGeometry(isLava ? 0.26 : 0.55, 0), 0.05, seed + 20 + i),
      polyMat(isLava ? '#ff6a1a' : '#585b66', {
        emissive: isLava ? '#ff3d00' : '#000000',
        emissiveIntensity: isLava ? 1.2 : 0,
      })
    );
    puffs.push({ m, i, isLava });
    puffGrp.add(m);
  }
  grp.add(puffGrp);

  grp.tick = (t, erupt = 0) => {
    puffGrp.visible = erupt > 0.02;
    craterMat.emissiveIntensity = lava ? 0.8 + erupt * 1.8 + Math.sin(t * 8) * 0.25 : 0;
    for (const p of puffs) {
      const ph = (t * (p.isLava ? 1.1 : 0.55) + p.i * 0.21) % 1;
      const spread = (0.3 + ph * 2.2) * erupt;
      const ang = p.i * 2.399;
      p.m.position.set(
        Math.cos(ang) * spread,
        h + ph * (p.isLava ? 3.4 : 5.2) * erupt,
        Math.sin(ang) * spread
      );
      const sc = Math.sin(ph * Math.PI) * erupt * (p.isLava ? 1.0 : 1.5);
      p.m.scale.setScalar(Math.max(0.001, sc));
      p.m.rotation.set(t * 2 + p.i, t * 1.5, 0);
    }
  };
  grp.tick(0, lava ? 0.35 : 0);
  return castShadowAll(grp);
}

// ============================================================ trees & nutmeg
export function polyTree(kind = 'palm', { s = 1, seed = 1 } = {}) {
  const grp = new THREE.Group();
  const r = mulberry32(seed);

  if (kind === 'palm') {
    const segs = 5;
    let y = 0, x = 0;
    for (let i = 0; i < segs; i++) {
      const seg = new THREE.Mesh(
        jitterGeo(new THREE.CylinderGeometry(0.11 * (1 - i * 0.08), 0.14 * (1 - i * 0.08), 0.55, 6), 0.015, seed + i),
        polyMat(PAL.wood)
      );
      seg.position.set(x, y + 0.26, 0);
      seg.rotation.z = -i * 0.07;
      grp.add(seg);
      x += Math.sin(i * 0.07) * 0.28;
      y += 0.5;
    }
    const crown = new THREE.Group();
    crown.position.set(x, y, 0);
    for (let i = 0; i < 6; i++) {
      const frond = new THREE.Mesh(
        jitterGeo(new THREE.BoxGeometry(1.15, 0.08, 0.32, 3, 1, 1), 0.03, seed + 10 + i),
        polyMat(PAL.grass)
      );
      const holder = new THREE.Group();
      holder.rotation.y = (i / 6) * TAU + r() * 0.2;
      frond.position.set(0.55, -0.1, 0);
      frond.rotation.z = -0.38;
      holder.add(frond);
      crown.add(holder);
    }
    grp.add(crown);
  } else if (kind === 'nutmeg') {
    // Pohon Pala: lush dark-green faceted canopy + golden nutmeg fruits with red mace
    const trunk = new THREE.Mesh(
      jitterGeo(new THREE.CylinderGeometry(0.14, 0.22, 1.5, 7), 0.02, seed),
      polyMat(PAL.wood)
    );
    trunk.position.y = 0.75;
    grp.add(trunk);

    const puffs = [
      [0, 1.85, 0, 0.95],
      [-0.55, 1.55, 0.35, 0.68],
      [0.58, 1.6, -0.25, 0.72],
      [0.15, 2.25, 0.2, 0.65],
    ];
    puffs.forEach(([px, py, pz, pr], idx) => {
      const leaf = new THREE.Mesh(
        jitterGeo(new THREE.IcosahedronGeometry(pr, 1), 0.06, seed + 20 + idx),
        polyMat(idx % 2 ? PAL.forest : PAL.grass)
      );
      leaf.position.set(px, py, pz);
      grp.add(leaf);
    });

    // Hanging golden nutmeg fruits
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU + 0.4;
      const fruit = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.14, 0),
        polyMat(PAL.gold, { roughness: 0.5 })
      );
      fruit.position.set(Math.cos(a) * 0.78, 1.32 + (i % 2) * 0.18, Math.sin(a) * 0.78);
      grp.add(fruit);
    }
  } else {
    // Pine
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6), polyMat(PAL.wood));
    trunk.position.y = 0.45;
    grp.add(trunk);
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(
        jitterGeo(new THREE.ConeGeometry(0.85 - i * 0.2, 1.1 - i * 0.15, 7), 0.04, seed + i),
        polyMat(i % 2 ? PAL.forest : PAL.grass)
      );
      cone.position.y = 1.1 + i * 0.62;
      grp.add(cone);
    }
  }

  grp.scale.setScalar(s);
  return castShadowAll(grp);
}

/** Hero 3D low-poly Nutmeg fruit (Buah Pala) that splits open to show the red fuli (mace) and brown seed. */
export function polyNutmegProp({ s = 1 } = {}) {
  const grp = new THREE.Group();
  const shellMat = polyMat('#e6aa38', { roughness: 0.55 });
  const innerMat = polyMat('#f7dca1', { roughness: 0.65 });
  const seedMat = polyMat('#4a2816', { roughness: 0.5 });
  const fuliMat = polyMat('#d92b2b', { roughness: 0.4, emissive: '#550808', emissiveIntensity: 0.35 });

  const leftHalf = new THREE.Group();
  const rightHalf = new THREE.Group();

  const halfGeo = jitterGeo(new THREE.SphereGeometry(1.0, 8, 6, 0, Math.PI), 0.05, 77);
  halfGeo.scale(0.85, 1.15, 0.85);
  const shL = new THREE.Mesh(halfGeo, shellMat);
  shL.rotation.y = Math.PI / 2;
  const shR = new THREE.Mesh(halfGeo, shellMat);
  shR.rotation.y = -Math.PI / 2;
  leftHalf.add(shL);
  rightHalf.add(shR);

  // Core seed + crimson fuli cage
  const core = new THREE.Group();
  const nut = new THREE.Mesh(jitterGeo(new THREE.IcosahedronGeometry(0.52, 1), 0.03, 81), seedMat);
  nut.scale.set(0.85, 1.2, 0.85);
  core.add(nut);

  for (let i = 0; i < 5; i++) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.065, 5, 10), fuliMat);
    band.scale.set(0.88, 1.22, 0.88);
    band.rotation.y = (i / 5) * Math.PI;
    band.rotation.x = 0.25 * (i % 2 ? 1 : -1);
    core.add(band);
  }

  grp.add(leftHalf, rightHalf, core);
  grp.scale.setScalar(s);

  grp.setOpen = (open = 0.5) => {
    leftHalf.position.x = -open * 0.45;
    leftHalf.rotation.z = open * 0.38;
    rightHalf.position.x = open * 0.45;
    rightHalf.rotation.z = -open * 0.38;
  };
  grp.setOpen(0.55);
  return castShadowAll(grp);
}

// ============================================================ ships (Phinisi & Galleon)
export function polyShip(kind = 'phinisi', { s = 1, flagColor = PAL.red } = {}) {
  const grp = new THREE.Group();
  const hullMat = polyMat(PAL.wood, { roughness: 0.75 });
  const trimMat = polyMat(PAL.woodLight, { roughness: 0.7 });
  const sailMat = polyMat(PAL.sail, { roughness: 0.6 });
  const flagMat = polyMat(flagColor, { roughness: 0.5 });

  // Faceted hull
  const hullGeo = new THREE.CylinderGeometry(0.65, 0.38, 3.6, 8, 1);
  hullGeo.rotateZ(Math.PI / 2);
  hullGeo.scale(1, 0.65, 0.62);
  const hull = new THREE.Mesh(jitterGeo(hullGeo, 0.03, 31), hullMat);
  hull.position.y = 0.25;
  grp.add(hull);

  // Raised stern & bow deck
  const stern = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.52, 0.72), trimMat);
  stern.position.set(-1.35, 0.55, 0);
  grp.add(stern);

  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 5), hullMat);
  bow.rotation.z = -Math.PI / 2;
  bow.position.set(2.05, 0.38, 0);
  grp.add(bow);

  // Bowsprit pole
  const sprit = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.4, 5), trimMat);
  sprit.rotation.z = -1.15;
  sprit.position.set(2.35, 0.68, 0);
  grp.add(sprit);

  if (kind === 'phinisi') {
    // Twin tripod masts + 7 Nusantara sails
    for (const [mx, mh, sw] of [[0.45, 2.8, 1.15], [-0.65, 2.5, 1.05]]) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, mh, 6), trimMat);
      mast.position.set(mx, 0.4 + mh / 2, 0);
      grp.add(mast);

      const sail1 = new THREE.Mesh(
        jitterGeo(new THREE.BoxGeometry(sw, mh * 0.52, 0.06, 2, 2, 1), 0.04, 41),
        sailMat
      );
      sail1.position.set(mx, 0.5 + mh * 0.58, 0);
      sail1.rotation.y = 0.18;
      grp.add(sail1);

      const topSail = new THREE.Mesh(new THREE.ConeGeometry(sw * 0.48, mh * 0.32, 4), sailMat);
      topSail.position.set(mx, 0.5 + mh * 0.92, 0);
      topSail.scale.set(1, 1, 0.15);
      grp.add(topSail);

      const flag = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 3), flagMat);
      flag.rotation.z = Math.PI / 2;
      flag.position.set(mx - 0.25, 0.55 + mh, 0);
      grp.add(flag);
    }
    // Fore stay-sails
    for (let i = 0; i < 2; i++) {
      const jib = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 3), sailMat);
      jib.scale.set(1, 1, 0.12);
      jib.rotation.z = -0.35;
      jib.position.set(1.55 + i * 0.55, 1.25 - i * 0.18, 0);
      grp.add(jib);
    }
  } else {
    // 17th-century Galleon (square-rigged tall ship)
    for (const [mx, mh, sw] of [[0.55, 2.7, 1.1], [-0.45, 2.9, 1.25], [-1.35, 2.1, 0.8]]) {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, mh, 6), trimMat);
      mast.position.set(mx, 0.4 + mh / 2, 0);
      grp.add(mast);

      for (const [sy, sh] of [[0.48, 0.42], [0.82, 0.3]]) {
        const sqSail = new THREE.Mesh(
          jitterGeo(new THREE.BoxGeometry(0.1, mh * sh, sw * (sy < 0.6 ? 1 : 0.78), 1, 2, 3), 0.04, 55),
          sailMat
        );
        sqSail.position.set(mx + 0.08, 0.4 + mh * sy, 0);
        grp.add(sqSail);
      }
      const flag = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 3), flagMat);
      flag.rotation.z = Math.PI / 2;
      flag.position.set(mx - 0.25, 0.45 + mh, 0);
      grp.add(flag);
    }
  }

  grp.scale.setScalar(s);
  grp.bob = (t, phase = 0, amp = 1) => {
    grp.position.y = Math.sin(t * 2.1 + phase) * 0.12 * amp;
    grp.rotation.z = Math.sin(t * 1.7 + phase) * 0.06 * amp;
    grp.rotation.x = Math.cos(t * 2.3 + phase) * 0.04 * amp;
  };
  return castShadowAll(grp);
}

// ============================================================ colonial fort & Manhattan skyline
export function polyFort({ s = 1 } = {}) {
  const grp = new THREE.Group();
  const wallMat = polyMat('#d9cfc1', { roughness: 0.82 });
  const roofMat = polyMat('#b84a32', { roughness: 0.7 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.85, 0.85, 5), wallMat);
  base.position.y = 0.42;
  grp.add(base);

  const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 1.35, 5), wallMat);
  inner.position.y = 0.68;
  grp.add(inner);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + Math.PI / 10;
    const tx = Math.cos(a) * 1.55, tz = Math.sin(a) * 1.55;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.15, 6), wallMat);
    tower.position.set(tx, 0.58, tz);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.42, 6), roofMat);
    roof.position.set(tx, 1.35, tz);
    grp.add(tower, roof);
  }
  grp.scale.setScalar(s);
  return castShadowAll(grp);
}

export function polyCitySkyline({ count = 22, radius = 4.2, seed = 91 } = {}) {
  const grp = new THREE.Group();
  const r = mulberry32(seed);
  const cols = ['#5c768d', '#3d5a80', '#98c1d9', '#778da9', '#e0fbfc', '#d4a373'];
  for (let i = 0; i < count; i++) {
    const a = r() * TAU, d = Math.pow(r(), 0.65) * radius;
    const w = 0.42 + r() * 0.48, depth = 0.42 + r() * 0.48;
    const h = 1.2 + (1 - d / (radius + 0.5)) * 4.2 + r() * 1.6;
    const bldg = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, depth),
      polyMat(cols[i % cols.length], { roughness: 0.45, metalness: 0.25 })
    );
    bldg.position.set(Math.cos(a) * d, h / 2, Math.sin(a) * d);
    grp.add(bldg);
    if (i % 4 === 0) {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(w * 0.35, 0.8, 4), polyMat('#e6be5a', { metalness: 0.4 }));
      spire.position.set(bldg.position.x, h + 0.4, bldg.position.z);
      grp.add(spire);
    }
  }
  return castShadowAll(grp);
}

// ============================================================ low-poly clouds & sky
export function polyCloud({ s = 1, seed = 5, color = '#ffffff' } = {}) {
  const grp = new THREE.Group();
  const mat = polyMat(color, { roughness: 0.9 });
  const parts = [
    [0, 0, 0, 0.75],
    [-0.65, -0.1, 0.1, 0.55],
    [0.68, -0.08, -0.08, 0.58],
    [0.2, 0.25, 0.15, 0.5],
  ];
  parts.forEach(([x, y, z, r], i) => {
    const m = new THREE.Mesh(jitterGeo(new THREE.IcosahedronGeometry(r, 0), 0.05, seed + i), mat);
    m.position.set(x, y, z);
    grp.add(m);
  });
  grp.scale.setScalar(s);
  return castShadowAll(grp, true, false);
}

// ============================================================ 2D HUD overlays
export function polyBadge(ctx, title, sub, x = 540, y = 250, { alpha = 1, accent = PAL.gold } = {}) {
  if (alpha <= 0.01) return;
  const a = clamp(alpha > 0.15 ? 0.96 : alpha * 6.4);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(x, y);

  // Faceted hexagonal plate
  const w = 410, h = sub ? 92 : 68;
  ctx.fillStyle = 'rgba(18, 25, 38, 0.88)';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.lineTo(-w + 36, -h);
  ctx.lineTo(w - 36, -h);
  ctx.lineTo(w, 0);
  ctx.lineTo(w - 36, h);
  ctx.lineTo(-w + 36, h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Geometric side facets
  ctx.fillStyle = accent;
  for (const sd of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(sd * (w - 18), 0);
    ctx.lineTo(sd * (w - 44), -18);
    ctx.lineTo(sd * (w - 44), 18);
    ctx.closePath();
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = "800 46px 'Plus Jakarta Sans', 'Cinzel', sans-serif";
  ctx.fillText(title, 0, sub ? -20 : 0);

  if (sub) {
    ctx.fillStyle = accent;
    ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(sub, 0, 34);
  }
  ctx.restore();
}

export function polyVignette(ctx, alpha = 0.28) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createRadialGradient(540, 960, 420, 540, 960, 1120);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(8,14,24,${alpha})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1920);
  ctx.restore();
}

export { THREE, clamp, lerp, ease, hrand, noise, mulberry32, TAU };
