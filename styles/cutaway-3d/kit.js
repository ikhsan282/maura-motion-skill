// Maura Motion style kit: CUTAWAY-3D (Dark Studio 3D PBR Cutaway & Exploded-View Explainer).
// Signature: Dark technical studio, metallic PBR materials (polished brass, brushed steel, copper,
// synthetic ruby jewels, anodized titanium, sapphire glass), animated exploded-view separation,
// cutaway outer casing shells, 3D->2D projected technical leader-line callouts, and mono telemetry HUD.
import * as THREE from 'three';
import { clamp, lerp, ease, TAU, rgba } from '/engine/lib/core.js';

export { clamp, lerp, ease, TAU, rgba };

export const PAL = {
  bg: '#080b11',
  grid: 'rgba(88, 180, 235, 0.08)',
  brass: '#e0af48',
  brassDark: '#9e7322',
  gold: '#ffd269',
  steel: '#c8d4e3',
  steelDark: '#5b6778',
  titanium: '#8aa2ba',
  copper: '#df7b46',
  ruby: '#f0285a',
  cyan: '#3ce8ff',
  amber: '#ffb340',
  flame: '#ff5d24',
  crema: '#d68a38',
  espresso: '#2e1608',
  text: '#eef4ff',
  dim: '#7d8fa8',
};

export const pr = (t, a, b, fn = ease.inOutCubic) => fn(clamp((t - a) / Math.max(1e-6, b - a)));

// ============================================================ 1. 3D Studio Stage & Lights
export function createStage(AM, { fov = 42, bg = PAL.bg } = {}) {
  const canvas = AM.layer('3d', { type: 'webgl', z: 0 });
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  R.setPixelRatio(0.8);
  R.setSize(AM.W, AM.H, false);
  R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.ACESFilmicToneMapping;
  R.toneMappingExposure = 1.22;
  R.shadowMap.enabled = true;
  R.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);
  scene.fog = new THREE.FogExp2(bg, 0.022);

  const cam = new THREE.PerspectiveCamera(fov, AM.W / AM.H, 0.1, 200);

  // Dark studio floor grid
  const grid = new THREE.GridHelper(36, 36, 0x26547c, 0x13263a);
  grid.position.y = -5.2;
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  scene.add(grid);

  // Studio Lighting Rig (Key warm, Fill cool cyan, Rim amber, Under bounce)
  const hemi = new THREE.HemisphereLight(0xd8ecff, 0x182232, 1.35);
  const key = new THREE.DirectionalLight(0xfff2d6, 3.2);
  key.position.set(8, 14, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);

  const fill = new THREE.DirectionalLight(0x45c8ff, 1.8);
  fill.position.set(-10, 6, 8);

  const rim = new THREE.DirectionalLight(0xffae52, 2.2);
  rim.position.set(0, -8, -10);

  const pt = new THREE.PointLight(0x3ce8ff, 2.4, 24);
  pt.position.set(0, 4, 6);

  scene.add(hemi, key, fill, rim, pt);

  return {
    R,
    scene,
    cam,
    grid,
    lights: { hemi, key, fill, rim, pt },
    render: () => R.render(scene, cam),
  };
}

/** Project a 3D world Vector3 or [x,y,z] to 2D canvas coordinates [x, y] on 1080x1920. */
export function projectTo2D(cam, pos, W = 1080, H = 1920) {
  const v = Array.isArray(pos) ? new THREE.Vector3(pos[0], pos[1], pos[2]) : pos.clone();
  v.project(cam);
  return [(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H];
}

// ============================================================ 2. PBR Material Presets & Gear Helpers
export function makeMaterials() {
  return {
    brass: new THREE.MeshStandardMaterial({ color: 0xe2b049, metalness: 0.86, roughness: 0.22 }),
    brassDark: new THREE.MeshStandardMaterial({ color: 0xa67926, metalness: 0.82, roughness: 0.34 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xffcf60, metalness: 0.92, roughness: 0.16 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xcfdbe8, metalness: 0.88, roughness: 0.2 }),
    steelDark: new THREE.MeshStandardMaterial({ color: 0x525f70, metalness: 0.82, roughness: 0.36 }),
    titanium: new THREE.MeshStandardMaterial({ color: 0x8ea6be, metalness: 0.85, roughness: 0.26 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xe07842, metalness: 0.88, roughness: 0.22 }),
    ruby: new THREE.MeshStandardMaterial({
      color: 0xff1e56,
      emissive: 0x66001a,
      metalness: 0.2,
      roughness: 0.12,
      transparent: true,
      opacity: 0.9,
    }),
    sapphire: new THREE.MeshStandardMaterial({
      color: 0x88e2ff,
      emissive: 0x0a2536,
      metalness: 0.1,
      roughness: 0.08,
      transparent: true,
      opacity: 0.28,
    }),
    flame: new THREE.MeshStandardMaterial({
      color: 0xff6a24,
      emissive: 0xff4500,
      emissiveIntensity: 1.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.82,
    }),
    cyanGlow: new THREE.MeshStandardMaterial({
      color: 0x3ce8ff,
      emissive: 0x18a8cc,
      emissiveIntensity: 1.1,
      roughness: 0.2,
    }),
    coffee: new THREE.MeshStandardMaterial({ color: 0x3b2110, metalness: 0.05, roughness: 0.88 }),
    crema: new THREE.MeshStandardMaterial({ color: 0xd98e3a, metalness: 0.12, roughness: 0.38 }),
  };
}

/** Build a 3D toothed gear wheel with spokes and hub. */
export function createGear({ r = 1.0, h = 0.16, teeth = 16, spokes = 5, mat, hubMat }) {
  const g = new THREE.Group();
  // Rim + inner cutout simulated via torus/cylinder
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.92, h, 32), mat);
  g.add(rim);
  // Teeth around circumference
  const toothW = (TAU * r) / (teeth * 2.1);
  const toothGeo = new THREE.BoxGeometry(toothW, h * 0.96, r * 0.22);
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * TAU;
    const tm = new THREE.Mesh(toothGeo, mat);
    tm.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    tm.rotation.y = -a + Math.PI / 2;
    g.add(tm);
  }
  // Hub
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.26, r * 0.26, h * 1.45, 20), hubMat || mat);
  g.add(hub);
  // Decorative recesses
  if (spokes > 0) {
    const holeGeo = new THREE.CylinderGeometry(r * 0.16, r * 0.16, h * 1.08, 14);
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x121822, metalness: 0.5, roughness: 0.6 });
    for (let i = 0; i < spokes; i++) {
      const a = (i / spokes) * TAU;
      const hm = new THREE.Mesh(holeGeo, holeMat);
      hm.position.set(Math.cos(a) * r * 0.56, 0, Math.sin(a) * r * 0.56);
      g.add(hm);
    }
  }
  return g;
}

// ============================================================ 3. Model 1: Mechanical Watch Movement (Demo 1)
export function buildMechanicalWatch(scene) {
  const M = makeMaterials();
  const root = new THREE.Group();
  scene.add(root);

  // Layer 0: Cutaway Steel Case & Baseplate (bottom)
  const lCase = new THREE.Group();
  // Cutaway outer bezel arc (240 degrees so front-right is open cutaway!)
  const caseArc = new THREE.Mesh(
    new THREE.CylinderGeometry(3.35, 3.35, 0.85, 48, 1, true, Math.PI * 0.35, Math.PI * 1.35),
    M.steel
  );
  const basePlate = new THREE.Mesh(
    new THREE.CylinderGeometry(3.05, 3.05, 0.2, 48, 1, false, Math.PI * 0.25, Math.PI * 1.55),
    M.brassDark
  );
  basePlate.position.y = -0.35;
  // Crown winder on right
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.45, 16), M.gold);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(3.5, 0, 0);
  lCase.add(caseArc, basePlate, crown);
  root.add(lCase);

  // Layer 1: Mainspring Barrel + Coiled Spiral Spring
  const lSpring = new THREE.Group();
  const barrel = createGear({ r: 1.25, h: 0.24, teeth: 24, spokes: 0, mat: M.brass, hubMat: M.steel });
  barrel.position.set(-1.1, 0, -0.7);
  // Visible coiled spiral spring above barrel cutaway
  const coilPts = [];
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const a = u * TAU * 4.5;
    const rad = lerp(0.18, 0.98, u);
    coilPts.push(new THREE.Vector3(-1.1 + Math.cos(a) * rad, 0.16, -0.7 + Math.sin(a) * rad));
  }
  const coilGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 100, 0.035, 8, false);
  const coilMesh = new THREE.Mesh(coilGeo, M.copper);
  lSpring.add(barrel, coilMesh);
  root.add(lSpring);

  // Layer 2: Gear Train (Center wheel, Third wheel, Fourth wheel) + Ruby Jewels
  const lGears = new THREE.Group();
  const gCenter = createGear({ r: 1.15, h: 0.16, teeth: 20, spokes: 5, mat: M.gold, hubMat: M.steel });
  gCenter.position.set(0, 0.2, 0);
  const gThird = createGear({ r: 0.82, h: 0.15, teeth: 16, spokes: 4, mat: M.brass, hubMat: M.steel });
  gThird.position.set(1.22, 0.25, -0.55);
  const gFourth = createGear({ r: 0.72, h: 0.14, teeth: 15, spokes: 4, mat: M.steel, hubMat: M.brass });
  gFourth.position.set(1.05, 0.3, 0.95);

  // Synthetic Ruby Jewels at pivot centers
  const rubyCoords = [
    [-1.1, 0.22, -0.7],
    [0, 0.34, 0],
    [1.22, 0.38, -0.55],
    [1.05, 0.42, 0.95],
    [-1.15, 0.46, 1.05],
  ];
  const rubies = rubyCoords.map(([x, y, z]) => {
    const rm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.1, 16), M.ruby);
    rm.position.set(x, y, z);
    lGears.add(rm);
    return rm;
  });
  lGears.add(gCenter, gThird, gFourth);
  root.add(lGears);

  // Layer 3: Escapement & Balance Wheel (4 Hz = 28,800 vph)
  const lBalance = new THREE.Group();
  const escapeWheel = createGear({ r: 0.58, h: 0.12, teeth: 15, spokes: 3, mat: M.steel, hubMat: M.ruby });
  escapeWheel.position.set(-0.25, 0.42, 1.25);

  const balanceWheel = new THREE.Group();
  balanceWheel.position.set(-1.15, 0.48, 1.05);
  const balRim = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.09, 14, 36), M.gold);
  balRim.rotation.x = Math.PI / 2;
  const balBar = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 0.12), M.gold);
  const hairspring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 10, 28), M.cyanGlow);
  hairspring.rotation.x = Math.PI / 2;
  hairspring.position.y = 0.08;
  balanceWheel.add(balRim, balBar, hairspring);

  // Bridge holding balance wheel
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.42), M.brass);
  bridge.position.set(-1.15, 0.65, 1.55);
  lBalance.add(escapeWheel, balanceWheel, bridge);
  root.add(lBalance);

  // Layer 4: Cutaway Dial Ring, Hands & Sapphire Crystal
  const lDial = new THREE.Group();
  const dialRing = new THREE.Mesh(new THREE.RingGeometry(2.35, 3.0, 48, 1, 0, Math.PI * 1.45), M.steelDark);
  dialRing.rotation.x = -Math.PI / 2;
  dialRing.position.y = 0.72;
  const crystal = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.08, 48, 1, false, Math.PI * 0.3, Math.PI * 1.3), M.sapphire);
  crystal.position.y = 0.88;

  const hands = new THREE.Group();
  hands.position.set(0, 0.78, 0);
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 1.45), M.gold);
  hourHand.position.z = -0.55;
  const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 2.15), M.steel);
  minHand.position.z = -0.85;
  const secHand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 2.4), M.ruby);
  secHand.position.z = -0.95;
  hands.add(hourHand, minHand, secHand);

  lDial.add(dialRing, crystal, hands);
  root.add(lDial);

  return {
    root,
    update(t, { explode = 0, rotY = 0, pitch = 0.52 } = {}) {
      root.rotation.x = pitch;
      root.rotation.y = rotY;

      // Exploded-view vertical separation
      const ex = ease.inOutCubic(clamp(explode));
      lCase.position.y = lerp(0, -1.9, ex);
      lSpring.position.y = lerp(0, -0.75, ex);
      lGears.position.y = lerp(0, 0.25, ex);
      lBalance.position.y = lerp(0, 1.35, ex);
      lDial.position.y = lerp(0, 2.45, ex);

      // Continuous mechanical motion (4 Hz oscillation on balance wheel)
      const osc = Math.sin(t * TAU * 4.0);
      balanceWheel.rotation.y = osc * 0.65;
      escapeWheel.rotation.y = -t * 1.8 + Math.floor(t * 8) * 0.08;
      barrel.rotation.y = t * 0.35;
      gCenter.rotation.y = -t * 0.7;
      gThird.rotation.y = t * 1.25;
      gFourth.rotation.y = -t * 2.1;
      secHand.rotation.y = -t * 0.8;
      minHand.rotation.y = -t * 0.12;
      hourHand.rotation.y = -t * 0.02;

      const worldAnchor = (obj, offset = [0, 0, 0]) => {
        const v = new THREE.Vector3(...offset);
        obj.localToWorld(v);
        return v;
      };

      return {
        barrel: worldAnchor(barrel),
        gears: worldAnchor(gCenter),
        ruby: worldAnchor(rubies[3]),
        escapement: worldAnchor(escapeWheel),
        balance: worldAnchor(balanceWheel),
        crystal: worldAnchor(crystal, [0, 0, -1.6]),
      };
    },
  };
}

// ============================================================ 4. Model 2: Jet Turbofan Engine Cutaway (Demo 2)
export function buildJetTurbofan(scene) {
  const M = makeMaterials();
  const root = new THREE.Group();
  scene.add(root);

  // Helper to build bladed rotor disc along Z axis
  function makeRotor(r, blades, len, mat, hubMat = M.steelDark) {
    const g = new THREE.Group();
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.32, r * 0.32, len, 24), hubMat);
    hub.rotation.x = Math.PI / 2;
    g.add(hub);
    const bGeo = new THREE.BoxGeometry(r * 0.18, r * 0.68, len * 0.75);
    for (let i = 0; i < blades; i++) {
      const a = (i / blades) * TAU;
      const bm = new THREE.Mesh(bGeo, mat);
      bm.position.set(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, 0);
      bm.rotation.z = a - Math.PI / 2;
      bm.rotation.y = 0.42;
      g.add(bm);
    }
    return g;
  }

  // Module 1: Intake Cowling (Cutaway half-shell) + Titanium Fan
  const mFan = new THREE.Group();
  const cowlFront = new THREE.Mesh(
    new THREE.CylinderGeometry(2.35, 2.25, 1.5, 40, 1, true, Math.PI * 0.35, Math.PI * 1.35),
    M.steel
  );
  cowlFront.rotation.x = Math.PI / 2;
  const noseCone = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.1, 24), M.steelDark);
  noseCone.rotation.x = Math.PI / 2;
  noseCone.position.z = 0.75;
  const fanRotor = makeRotor(2.15, 24, 0.36, M.titanium, M.steel);
  fanRotor.position.z = 0.1;
  mFan.add(cowlFront, noseCone, fanRotor);
  root.add(mFan);

  // Module 2: Low & High Pressure Compressor (4 stages)
  const mComp = new THREE.Group();
  const compShell = new THREE.Mesh(
    new THREE.CylinderGeometry(1.75, 1.45, 1.8, 36, 1, true, Math.PI * 0.4, Math.PI * 1.25),
    M.titanium
  );
  compShell.rotation.x = Math.PI / 2;
  const compStages = [];
  for (let i = 0; i < 4; i++) {
    const cr = makeRotor(lerp(1.65, 1.32, i / 3), 20, 0.24, i < 2 ? M.steel : M.brass);
    cr.position.z = 0.65 - i * 0.44;
    mComp.add(cr);
    compStages.push(cr);
  }
  mComp.add(compShell);
  root.add(mComp);

  // Module 3: Annular Combustion Chamber (Glowing Flame Ring + Fuel Nozzles)
  const mComb = new THREE.Group();
  const flameRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.32, 16, 32), M.flame);
  const innerCore = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.2, 24), M.copper);
  innerCore.rotation.x = Math.PI / 2;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const inj = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.45, 10), M.gold);
    inj.position.set(Math.cos(a) * 1.08, Math.sin(a) * 1.08, 0.35);
    inj.rotation.x = Math.PI / 2;
    mComb.add(inj);
  }
  mComb.add(flameRing, innerCore);
  root.add(mComb);

  // Module 4: High & Low Pressure Turbine (3 stages) + Central Shaft
  const mTurb = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 5.6, 20), M.gold);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = 1.4;
  const turbStages = [];
  for (let i = 0; i < 3; i++) {
    const tr = makeRotor(lerp(1.28, 1.62, i / 2), 22, 0.24, i === 0 ? M.ruby : M.brass);
    tr.position.z = 0.45 - i * 0.45;
    mTurb.add(tr);
    turbStages.push(tr);
  }
  mTurb.add(shaft);
  root.add(mTurb);

  // Module 5: Exhaust Nozzle & Tail Cone
  const mNozzle = new THREE.Group();
  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.65, 1.45, 36, 1, true, Math.PI * 0.35, Math.PI * 1.35),
    M.steelDark
  );
  nozzle.rotation.x = Math.PI / 2;
  const tailCone = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.3, 24), M.copper);
  tailCone.rotation.x = -Math.PI / 2;
  tailCone.position.z = -0.3;
  mNozzle.add(nozzle, tailCone);
  root.add(mNozzle);

  return {
    root,
    update(t, { explode = 0, yaw = -0.58, pitch = 0.26, rpm = 1.0, burn = 1.0 } = {}) {
      root.rotation.y = yaw;
      root.rotation.x = pitch;

      const ex = ease.inOutCubic(clamp(explode));
      mFan.position.z = lerp(2.2, 3.85, ex);
      mComp.position.z = lerp(0.75, 1.55, ex);
      mComb.position.z = lerp(-0.55, -0.45, ex);
      mTurb.position.z = lerp(-1.65, -2.25, ex);
      mNozzle.position.z = lerp(-2.85, -4.05, ex);

      // Spin rotors
      fanRotor.rotation.z = t * 4.2 * rpm;
      compStages.forEach((c, i) => {
        c.rotation.z = t * (5.5 + i * 0.8) * rpm;
      });
      turbStages.forEach((tr, i) => {
        tr.rotation.z = t * (6.2 - i * 0.6) * rpm;
      });
      M.flame.emissiveIntensity = (1.1 + 0.45 * Math.sin(t * 14)) * burn;

      const worldAnchor = (obj, offset = [0, 0, 0]) => {
        const v = new THREE.Vector3(...offset);
        obj.localToWorld(v);
        return v;
      };

      return {
        fan: worldAnchor(mFan, [0, 1.2, 0.2]),
        comp: worldAnchor(mComp, [0, 1.1, 0]),
        comb: worldAnchor(mComb, [0, 0.9, 0]),
        turb: worldAnchor(mTurb, [0, 1.0, 0]),
        nozzle: worldAnchor(mNozzle, [0, -1.0, -0.2]),
      };
    },
  };
}

// ============================================================ 5. Model 3: 9-Bar Espresso Machine Cutaway (Demo 3)
export function buildEspressoCutaway(scene) {
  const M = makeMaterials();
  const root = new THREE.Group();
  scene.add(root);

  // Module 1: Copper Boiler + Heating Coil + Pressure Gauge (top)
  const mBoiler = new THREE.Group();
  const boilerShell = new THREE.Mesh(
    new THREE.CylinderGeometry(1.65, 1.65, 1.55, 36, 1, true, Math.PI * 0.35, Math.PI * 1.35),
    M.copper
  );
  // Heating element spiral inside boiler
  const heatPts = [];
  for (let i = 0; i <= 80; i++) {
    const u = i / 80;
    const a = u * TAU * 3.5;
    heatPts.push(new THREE.Vector3(Math.cos(a) * 0.85, lerp(-0.5, 0.5, u), Math.sin(a) * 0.85));
  }
  const heater = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(heatPts), 64, 0.075, 10, false),
    M.flame
  );
  // 9-Bar Pressure Gauge on front-left
  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.2, 24), M.brass);
  gauge.rotation.x = Math.PI / 2;
  gauge.position.set(-1.55, 0.25, 0.9);
  mBoiler.add(boilerShell, heater, gauge);
  root.add(mBoiler);

  // Module 2: Brass E61 Grouphead & Dispersion Shower Screen
  const mGroup = new THREE.Group();
  const groupBody = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.2, 0.85, 32, 1, false, Math.PI * 0.2, Math.PI * 1.6),
    M.brass
  );
  const showerScreen = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.08, 32), M.cyanGlow);
  showerScreen.position.y = -0.45;
  mGroup.add(groupBody, showerScreen);
  root.add(mGroup);

  // Module 3: Stainless Portafilter, Filter Basket & Tamped Coffee Puck
  const mPorta = new THREE.Group();
  const basket = new THREE.Mesh(
    new THREE.CylinderGeometry(1.08, 0.92, 0.65, 32, 1, true, Math.PI * 0.3, Math.PI * 1.4),
    M.steel
  );
  const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.9, 0.36, 32), M.coffee);
  puck.position.y = -0.05;
  const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.3, 16), M.steelDark);
  handleBar.rotation.z = Math.PI / 2;
  handleBar.position.set(2.1, 0, 0.3);
  const spouts = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.16, 0.38, 16), M.brass);
  spouts.position.y = -0.48;
  mPorta.add(basket, puck, handleBar, spouts);
  root.add(mPorta);

  // Module 4: Extraction Stream & Espresso Cup with Golden Crema
  const mCup = new THREE.Group();
  const cupGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 0.78, 1.25, 32, 1, true, Math.PI * 0.25, Math.PI * 1.5),
    M.sapphire
  );
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.74, 0.72, 28), M.coffee);
  liquid.position.y = -0.18;
  const cremaLayer = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.92, 0.2, 28), M.crema);
  cremaLayer.position.y = 0.24;
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 1.3, 12), M.crema);
  stream.position.y = 0.95;
  mCup.add(cupGlass, liquid, cremaLayer, stream);
  root.add(mCup);

  return {
    root,
    update(t, { explode = 0, yaw = -0.35, pitch = 0.28, brew = 1.0 } = {}) {
      root.rotation.y = yaw + Math.sin(t * 0.45) * 0.12;
      root.rotation.x = pitch;

      const ex = ease.inOutCubic(clamp(explode));
      mBoiler.position.y = lerp(1.75, 2.75, ex);
      mGroup.position.y = lerp(0.55, 0.95, ex);
      mPorta.position.y = lerp(-0.35, -0.65, ex);
      mCup.position.y = lerp(-1.85, -2.55, ex);

      stream.scale.y = clamp(brew);
      stream.visible = brew > 0.05;
      cremaLayer.scale.setScalar(0.6 + 0.4 * clamp(brew));

      const worldAnchor = (obj, offset = [0, 0, 0]) => {
        const v = new THREE.Vector3(...offset);
        obj.localToWorld(v);
        return v;
      };

      return {
        boiler: worldAnchor(mBoiler, [0, 0.3, 0]),
        gauge: worldAnchor(gauge, [0, 0, 0]),
        group: worldAnchor(mGroup, [-0.8, 0, 0]),
        puck: worldAnchor(puck, [0.5, 0, 0]),
        crema: worldAnchor(cremaLayer, [0, 0.1, 0]),
      };
    },
  };
}

// ============================================================ 6. 2D Technical Studio HUD & Leader-Line Callouts
export function drawStudioHUD(ui, t, { code = 'CUTAWAY-3D // REV 4.2', title = '', sub = '', metricLabel = '', metricVal = '', unit = '' } = {}) {
  ui.save();
  ui.setTransform(1, 0, 0, 1, 0, 0);
  ui.clearRect(0, 0, 1080, 1920);

  // Subtle corner brackets
  ui.strokeStyle = 'rgba(60, 232, 255, 0.38)';
  ui.lineWidth = 2.5;
  const B = 28;
  for (const [x, y, sx, sy] of [
    [48, 96, 1, 1],
    [1032, 96, -1, 1],
    [48, 1380, 1, -1],
    [1032, 1380, -1, -1],
  ]) {
    ui.beginPath();
    ui.moveTo(x, y + sy * B);
    ui.lineTo(x, y);
    ui.lineTo(x + sx * B, y);
    ui.stroke();
  }

  // Top Header Bar
  ui.fillStyle = 'rgba(10, 16, 26, 0.82)';
  ui.strokeStyle = 'rgba(60, 232, 255, 0.32)';
  ui.lineWidth = 1.5;
  ui.beginPath();
  ui.roundRect(68, 112, 944, 152, 12);
  ui.fill();
  ui.stroke();

  ui.fillStyle = PAL.cyan;
  ui.font = "700 21px 'JetBrains Mono', monospace";
  ui.textAlign = 'left';
  ui.fillText(code, 98, 150);

  ui.fillStyle = PAL.text;
  ui.font = "800 40px 'Inter', sans-serif";
  ui.fillText(title, 98, 200);

  ui.fillStyle = PAL.dim;
  ui.font = "500 22px 'JetBrains Mono', monospace";
  ui.fillText(sub, 98, 238);

  if (metricVal) {
    ui.textAlign = 'right';
    ui.fillStyle = PAL.amber;
    ui.font = "800 48px 'JetBrains Mono', monospace";
    ui.fillText(metricVal, 982, 202);
    ui.fillStyle = PAL.cyan;
    ui.font = "600 20px 'JetBrains Mono', monospace";
    ui.fillText(`${metricLabel} ${unit}`.trim(), 982, 238);
  }
  ui.restore();
}

/** Draw a projected 3D -> 2D technical leader-line callout with target reticle and spec box. */
export function callout(ui, cam, worldPos, lx, ly, title, spec, p, { color = PAL.cyan, align = 'left' } = {}) {
  const a = clamp(p);
  if (a <= 0 || !worldPos) return;
  const [sx, sy] = projectTo2D(cam, worldPos);

  ui.save();
  ui.setTransform(1, 0, 0, 1, 0, 0);
  ui.globalAlpha = a;

  // 1. Target reticle on 3D part
  ui.strokeStyle = color;
  ui.lineWidth = 2.2;
  ui.beginPath();
  ui.arc(sx, sy, 12, 0, TAU);
  ui.stroke();
  ui.fillStyle = color;
  ui.beginPath();
  ui.arc(sx, sy, 4.5, 0, TAU);
  ui.fill();

  // 2. Angled leader line
  const elbowX = lerp(sx, lx, 0.55);
  ui.beginPath();
  ui.moveTo(sx, sy);
  ui.lineTo(elbowX, ly);
  ui.lineTo(lx, ly);
  ui.stroke();

  // 3. Callout badge box
  const bw = 400, bh = 84;
  const bx = align === 'right' ? lx - bw : lx;
  const by = ly - bh / 2;

  ui.fillStyle = 'rgba(8, 13, 22, 0.88)';
  ui.strokeStyle = color;
  ui.lineWidth = 2;
  ui.beginPath();
  ui.roundRect(bx, by, bw, bh, 8);
  ui.fill();
  ui.stroke();

  ui.fillStyle = color;
  ui.fillRect(align === 'right' ? bx + bw - 6 : bx, by, 6, bh);

  const tx = bx + 18;
  ui.textAlign = 'left';
  ui.fillStyle = PAL.text;
  ui.font = "700 22px 'JetBrains Mono', monospace";
  ui.fillText(title, tx, by + 33);

  ui.fillStyle = PAL.amber;
  ui.font = "500 18px 'JetBrains Mono', monospace";
  ui.fillText(spec, tx, by + 64);

  ui.restore();
}

/** Bottom technical specification card above captions. */
export function specPanel(ui, x, y, w, h, header, cols, p) {
  const a = clamp(p);
  if (a <= 0) return;
  ui.save();
  ui.setTransform(1, 0, 0, 1, 0, 0);
  ui.globalAlpha = a;

  ui.fillStyle = 'rgba(10, 16, 26, 0.88)';
  ui.strokeStyle = 'rgba(224, 175, 72, 0.48)';
  ui.lineWidth = 2;
  ui.beginPath();
  ui.roundRect(x, y, w, h, 10);
  ui.fill();
  ui.stroke();

  ui.fillStyle = PAL.brass;
  ui.font = "700 20px 'JetBrains Mono', monospace";
  ui.textAlign = 'left';
  ui.fillText(header, x + 24, y + 34);

  const cw = (w - 48) / cols.length;
  cols.forEach(([k, v, col], i) => {
    const cx = x + 24 + i * cw;
    ui.fillStyle = PAL.dim;
    ui.font = "500 17px 'JetBrains Mono', monospace";
    ui.fillText(k, cx, y + 68);
    ui.fillStyle = col || PAL.text;
    ui.font = "700 23px 'JetBrains Mono', monospace";
    ui.fillText(v, cx, y + 102);
  });

  ui.restore();
}
