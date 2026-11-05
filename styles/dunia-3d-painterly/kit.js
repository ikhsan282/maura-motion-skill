// Maura Motion style kit: DUNIA 3D PAINTERLY (Ghibli / BotW Inspired Cel-Shaded 3D Highland World).
// Signature: Soft cel-shaded / painterly 3D valleys, terraced emerald hills, multi-colored crater lakes,
// wind-swaying grass & rounded canopy trees, volumetric cumulus clouds, floating jewel/mist particles,
// golden-hour sunrays, and an elegant serif storybook HUD.
import * as THREE from 'three';
import { clamp, lerp, ease, mulberry32, TAU } from '/engine/lib/core.js';

export { clamp, lerp, ease, TAU };

export const PAL = {
  skyDawn: '#1e355e',
  skyGold: '#355c7d',
  skyMist: '#6c8ebf',
  grass1: '#4d9e56',
  grass2: '#7bc462',
  hillFar: '#32636b',
  waterBlue: '#2ec4b6',
  waterEmerald: '#10b981',
  waterGold: '#fbbf24',
  waterRose: '#f43f5e',
  waterViolet: '#a855f7',
  wood: '#8b5a2b',
  roof: '#d97706',
  gold: '#fde047',
  text: '#fffbeb',
  dim: '#cbd5e1',
};

export const pr = (t, a, b, fn = ease.inOutCubic) => fn(clamp((t - a) / Math.max(1e-6, b - a)));

// ============================================================ 1. 3D Painterly World Stage
export function createPainterlyStage(AM, { skyColor = 0x243b61, fogDensity = 0.018 } = {}) {
  const canvas = AM.layer('3d', { type: 'webgl', z: 0 });
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  R.setPixelRatio(0.8);
  R.setSize(AM.W, AM.H, false);
  R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping;
  R.toneMappingExposure = 1.18;
  R.shadowMap.enabled = true;
  R.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(skyColor);
  scene.fog = new THREE.FogExp2(skyColor, fogDensity);

  const cam = new THREE.PerspectiveCamera(44, AM.W / AM.H, 0.1, 240);

  // Warm Golden-Hour Sun + Soft Sky Hemisphere + Rim Light
  const hemi = new THREE.HemisphereLight(0xffefc2, 0x284b63, 1.55);
  const sun = new THREE.DirectionalLight(0xffd285, 3.1);
  sun.position.set(14, 18, -12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);

  const fill = new THREE.DirectionalLight(0x7dd3fc, 1.35);
  fill.position.set(-14, 8, 12);

  scene.add(hemi, sun, fill);

  return {
    R,
    scene,
    cam,
    lights: { hemi, sun, fill },
    setMood(hexSky, sunCol = 0xffd285, exposure = 1.18) {
      scene.background.setHex(hexSky);
      scene.fog.color.setHex(hexSky);
      sun.color.setHex(sunCol);
      R.toneMappingExposure = exposure;
    },
    render: () => R.render(scene, cam),
  };
}

// ============================================================ 2. Lush Valley, Multi-Hued Lake, Trees, Clouds & Jewels
export function buildHighlandWorld(scene, { mode = 'telaga' } = {}) {
  const root = new THREE.Group();
  scene.add(root);

  const matGrass = new THREE.MeshToonMaterial({ color: 0x4ea854 });
  const matHill = new THREE.MeshToonMaterial({ color: 0x3b7d56 });
  const matPeak = new THREE.MeshToonMaterial({ color: 0x335c67 });
  const matStone = new THREE.MeshToonMaterial({ color: 0x94a3b8 });
  const matCliff = new THREE.MeshToonMaterial({ color: 0xb4845c });
  const matTrunk = new THREE.MeshToonMaterial({ color: 0x6b4423 });
  const matLeaf1 = new THREE.MeshToonMaterial({ color: 0x5bbd5a });
  const matLeaf2 = new THREE.MeshToonMaterial({ color: 0x84cc16 });
  const matCloud = new THREE.MeshToonMaterial({ color: 0xfff8eb, transparent: true, opacity: 0.92 });

  // 1. Valley Basin Floor
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 1.2, 48), matGrass);
  floor.position.y = -1.2;
  floor.receiveShadow = true;
  root.add(floor);

  // 2. Surrounding Terraced Hills & Distant Peaks (or Harau Granite Cliffs)
  const rnd = mulberry32(17);
  const hillsGroup = new THREE.Group();
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * TAU;
    const dist = 12.5 + (i % 3) * 3.8;
    const h = mode === 'harau' ? 7.5 + (i % 4) * 2.2 : 4.2 + (i % 4) * 1.8;
    const rBot = mode === 'harau' ? 3.4 : 4.8 + rnd() * 2.5;
    const rTop = mode === 'harau' ? 2.6 : 0.8 + rnd() * 1.2;
    const m = mode === 'harau' ? matCliff : i % 2 === 0 ? matHill : matPeak;
    const hill = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 16), m);
    hill.position.set(Math.cos(a) * dist, h / 2 - 0.8, Math.sin(a) * dist);
    hillsGroup.add(hill);
  }
  root.add(hillsGroup);

  // 3. Multi-Colored Shimmering Lake(s)
  const lakeGroup = new THREE.Group();
  const lakeRings = [];
  const jewelColors = [0x2ec4b6, 0x10b981, 0xfbbf24, 0xf43f5e, 0xa855f7];

  if (mode === 'kelimutu') {
    // Three distinct volcanic crater lakes side by side!
    const craters = [
      { x: -3.8, z: 0.6, r: 2.9, col: 0x2ec4b6 }, // Turquoise
      { x: 2.6, z: 1.4, r: 3.1, col: 0x10b981 }, // Emerald
      { x: 0.2, z: -3.6, r: 2.7, col: 0xbe123c }, // Dark Red/Brown
    ];
    craters.forEach((c) => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(c.r + 0.35, 0.55, 12, 32), matStone);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(c.x, -0.2, c.z);
      const discMat = new THREE.MeshStandardMaterial({
        color: c.col,
        emissive: c.col,
        emissiveIntensity: 0.32,
        roughness: 0.15,
        metalness: 0.25,
      });
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(c.r, c.r, 0.18, 36), discMat);
      disc.position.set(c.x, -0.15, c.z);
      lakeGroup.add(rim, disc);
      lakeRings.push({ mesh: disc, mat: discMat, baseCol: c.col });
    });
  } else {
    // Concentric multi-hued Telaga Warna / Valley Lake
    for (let i = 0; i < 5; i++) {
      const r = 7.4 - i * 1.25;
      const col = jewelColors[i];
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.28,
        roughness: 0.14,
        metalness: 0.3,
        transparent: true,
        opacity: 0.9,
      });
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.12, 42), mat);
      disc.position.y = -0.45 + i * 0.03;
      lakeGroup.add(disc);
      lakeRings.push({ mesh: disc, mat, baseCol: col });
    }
  }
  root.add(lakeGroup);

  // 4. Royal Pendopo Pavilion & Stone Altar (center-front)
  const pavilion = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.4, 0.45, 8), matStone);
  base.position.y = -0.25;
  pavilion.add(base);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.6, 10), matTrunk);
    col.position.set(Math.cos(a) * 1.3, 0.65, Math.sin(a) * 1.3);
    pavilion.add(col);
  }
  const roof1 = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.1, 4), new THREE.MeshToonMaterial({ color: 0xd97706 }));
  roof1.position.y = 1.85;
  roof1.rotation.y = Math.PI / 4;
  const roof2 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.9, 4), new THREE.MeshToonMaterial({ color: 0xf59e0b }));
  roof2.position.y = 2.45;
  roof2.rotation.y = Math.PI / 4;
  pavilion.add(roof1, roof2);
  if (mode === 'kelimutu') pavilion.visible = false;
  root.add(pavilion);

  // 5. Ghibli-style Rounded Canopy Trees + Swaying Grass Blades
  const treesGroup = new THREE.Group();
  for (let i = 0; i < 34; i++) {
    const a = rnd() * TAU;
    const d = 7.8 + rnd() * 6.5;
    const tg = new THREE.Group();
    tg.position.set(Math.cos(a) * d, -0.5, Math.sin(a) * d);
    const s = 0.75 + rnd() * 0.65;
    tg.scale.setScalar(s);

    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 1.2, 8), matTrunk);
    tr.position.y = 0.6;
    tg.add(tr);

    const lm = i % 2 === 0 ? matLeaf1 : matLeaf2;
    for (const [ox, oy, oz, rr] of [
      [0, 1.5, 0, 0.85],
      [-0.45, 1.25, 0.25, 0.62],
      [0.45, 1.3, -0.2, 0.65],
    ]) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(rr, 14, 12), lm);
      puff.position.set(ox, oy, oz);
      tg.add(puff);
    }
    treesGroup.add(tg);
  }
  root.add(treesGroup);

  // 6. Floating Jewel Shards / Mist Orbs
  const jewelsGroup = new THREE.Group();
  const jewels = [];
  for (let i = 0; i < 28; i++) {
    const col = jewelColors[i % jewelColors.length];
    const jm = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.24, 0),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.9, roughness: 0.1 })
    );
    const a = (i / 28) * TAU;
    const rad = 1.4 + (i % 5) * 1.1;
    jm.userData = { a, rad, h0: 0.4 + (i % 4) * 0.65, spd: 0.6 + (i % 3) * 0.3 };
    jewelsGroup.add(jm);
    jewels.push(jm);
  }
  root.add(jewelsGroup);

  // 7. Painted Cumulus Clouds in Sky
  const cloudsGroup = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const cg = new THREE.Group();
    const a = (i / 8) * TAU;
    cg.position.set(Math.cos(a) * 18, 5.5 + (i % 3) * 1.4, Math.sin(a) * 18);
    for (const [ox, oy, rr] of [
      [0, 0, 1.8],
      [-1.4, -0.3, 1.3],
      [1.4, -0.25, 1.35],
      [0.6, 0.7, 1.2],
    ]) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(rr, 14, 12), matCloud);
      sp.position.set(ox, oy, 0);
      cg.add(sp);
    }
    cloudsGroup.add(cg);
  }
  root.add(cloudsGroup);

  return {
    root,
    lakeGroup,
    pavilion,
    jewelsGroup,
    update(t, { lakeScale = 1, jewelBurst = 0, colorShift = 0 } = {}) {
      lakeGroup.scale.set(clamp(lakeScale, 0.01, 1.2), 1, clamp(lakeScale, 0.01, 1.2));
      lakeRings.forEach((lr, idx) => {
        lr.mesh.position.y = -0.35 + idx * 0.03 + Math.sin(t * 2.2 + idx) * 0.04;
        if (colorShift > 0) {
          const cIdx = Math.floor(idx + t * 0.6) % jewelColors.length;
          lr.mat.color.setHex(jewelColors[cIdx]);
          lr.mat.emissive.setHex(jewelColors[cIdx]);
        }
      });

      // Wind sway on trees
      treesGroup.children.forEach((tr, i) => {
        tr.rotation.z = Math.sin(t * 1.8 + i * 0.7) * 0.05;
      });

      // Drift clouds slowly
      cloudsGroup.rotation.y = t * 0.03;

      // Animate floating jewel shards / mist droplets
      jewelsGroup.visible = jewelBurst > 0.02;
      jewels.forEach((jm, i) => {
        const { a, rad, h0, spd } = jm.userData;
        const curA = a + t * spd * 0.5;
        const rNow = rad * lerp(0.2, 1.35, clamp(jewelBurst));
        jm.position.set(
          Math.cos(curA) * rNow,
          h0 + Math.sin(t * 2.4 + i) * 0.35 + jewelBurst * 1.1,
          Math.sin(curA) * rNow
        );
        jm.rotation.y = t * 2.0 + i;
        jm.rotation.x = t * 1.3;
        jm.scale.setScalar(clamp(jewelBurst));
      });
    },
  };
}

// ============================================================ 3. 2D Painterly Atmosphere & Storybook Banner
export function drawPainterlyHUD(ui, t, { chapter = 'BAB I', title = '', subtitle = '', badge = '' } = {}) {
  ui.save();
  ui.setTransform(1, 0, 0, 1, 0, 0);
  ui.clearRect(0, 0, 1080, 1920);

  // Warm Golden-Hour Sunburst God-Rays from top-right
  const sunG = ui.createRadialGradient(880, 140, 20, 880, 140, 780);
  sunG.addColorStop(0, 'rgba(255, 236, 179, 0.32)');
  sunG.addColorStop(0.45, 'rgba(251, 191, 36, 0.12)');
  sunG.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ui.fillStyle = sunG;
  ui.fillRect(0, 0, 1080, 1000);

  // Top Storybook Parchment-Glass Banner
  ui.fillStyle = 'rgba(15, 28, 46, 0.78)';
  ui.strokeStyle = 'rgba(253, 224, 71, 0.48)';
  ui.lineWidth = 2;
  ui.beginPath();
  ui.roundRect(68, 108, 944, 162, 18);
  ui.fill();
  ui.stroke();

  ui.fillStyle = PAL.gold;
  ui.font = "700 20px 'JetBrains Mono', monospace";
  ui.textAlign = 'left';
  ui.fillText(chapter, 100, 148);

  if (badge) {
    ui.textAlign = 'right';
    ui.fillStyle = '#5eead4';
    ui.fillText(badge, 980, 148);
  }

  ui.textAlign = 'left';
  ui.fillStyle = PAL.text;
  ui.font = "700 40px 'Noto Serif', Georgia, serif";
  ui.fillText(title, 100, 198);

  ui.fillStyle = PAL.dim;
  ui.font = "500 20px 'Inter', sans-serif";
  ui.fillText(subtitle, 100, 242);

  ui.restore();
}
