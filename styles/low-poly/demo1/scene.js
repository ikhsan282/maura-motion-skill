// Low Poly Demo 1: "Pulau Run & Manhattan — Pulau Pala Kecil yang Ditukar dengan New York" (9 shots).
import * as K from '/styles/low-poly/kit.js';
const { THREE, clamp, lerp, ease, env } = K;

export const meta = {
  fps: 24,
  captions: { preset: 'pop', y: 1520, size: 60 },
};

let stage, rig, ui, sea, runIsland, manhattanIsland, nutmegHero, shipNL, shipUK, fort, clouds = [];
const C = {};
const u = (t, a, b) => clamp((t - a) / Math.max(0.001, b - a));

export async function setup(AM) {
  for (const l of AM.timeline.lines) C[l.id] = l;

  stage = K.createStage(AM, { fov: 54, bg: '#7ec0e8', fog: true });
  rig = K.lightRig(stage.scene, { sun: '#fff1cc', sunI: 2.8, sky: '#bfe4ff', ground: '#6d5e46', hemiI: 1.25 });
  rig.aim([0, 1, 0], { dir: [0.65, 1.0, 0.55], r: 18 });
  ui = AM.layer('ui');

  // Ocean
  sea = K.polySea({ size: 120, segs: 42, color: '#1676b2' });
  stage.scene.add(sea);

  // Pulau Run group (Banda spice island)
  runIsland = new THREE.Group();
  const baseIsl = K.polyIsland({ r: 5.2, h: 2.3, seed: 11 });
  runIsland.add(baseIsl);

  // Nutmeg forest + palms on Pulau Run
  const treeSpots = [
    [-1.4, 2.0, -0.6, 'nutmeg', 0.95],
    [1.1, 2.05, -0.8, 'nutmeg', 1.05],
    [0.2, 2.1, 1.1, 'nutmeg', 0.9],
    [-2.4, 1.65, 1.3, 'palm', 0.85],
    [2.5, 1.65, 1.0, 'palm', 0.85],
  ];
  treeSpots.forEach(([x, y, z, kind, sc], idx) => {
    const tr = K.polyTree(kind, { s: sc, seed: 30 + idx });
    tr.position.set(x, y, z);
    runIsland.add(tr);
  });

  fort = K.polyFort({ s: 0.72 });
  fort.position.set(0, 2.05, -0.2);
  runIsland.add(fort);
  stage.scene.add(runIsland);

  // Manhattan Island group (placed at x = 18 for side-by-side / trade comparison)
  manhattanIsland = new THREE.Group();
  const nyBase = K.polyIsland({ r: 5.8, h: 1.8, seed: 52, grassColor: '#5c6b73', rockColor: '#495057' });
  const nySkyline = K.polyCitySkyline({ count: 24, radius: 3.8, seed: 91 });
  nySkyline.position.y = 1.6;
  manhattanIsland.add(nyBase, nySkyline);
  manhattanIsland.position.set(18, 0, 0);
  stage.scene.add(manhattanIsland);

  // Ships (Dutch VOC vs English East India Company)
  shipNL = K.polyShip('galleon', { s: 0.95, flagColor: '#d9412b' });
  shipUK = K.polyShip('galleon', { s: 0.95, flagColor: '#2563eb' });
  stage.scene.add(shipNL, shipUK);

  // Hero Nutmeg Prop (floating for close-up in shot 4)
  nutmegHero = K.polyNutmegProp({ s: 0.92 });
  nutmegHero.position.set(0, 5.2, 2.2);
  stage.scene.add(nutmegHero);

  // Low-poly clouds
  for (let i = 0; i < 7; i++) {
    const cl = K.polyCloud({ s: 0.9 + (i % 3) * 0.25, seed: 100 + i });
    cl.position.set(-16 + i * 7.5, 6.2 + (i % 2) * 1.3, -10 - (i % 3) * 3.5);
    clouds.push(cl);
    stage.scene.add(cl);
  }

  AM.sfx('whoosh', 0.15, { gain: 0.35 });
  AM.sfx('chime', C.emas.start + 0.3, { freq: 680, gain: 0.35 });
  AM.sfx('drum_hit', C.armada.start + 0.15, { gain: 0.45 });
  AM.sfx('impact', C.breda.start + 0.2, { gain: 0.4 });
  AM.sfx('chime', C.manhattan.start + 0.25, { freq: 560, gain: 0.35 });
  AM.sfx('gong', C.moral.end + 0.15, { gain: 0.45 });
}

export function render(t, AM) {
  sea.tick(t, 0.28, 1.7);
  clouds.forEach((c, i) => {
    c.position.x = -20 + ((i * 8 + t * 0.45) % 48);
  });

  // Defaults per frame
  fort.visible = false;
  nutmegHero.visible = false;
  shipNL.visible = true;
  shipUK.visible = true;

  ui.setTransform(1, 0, 0, 1, 0, 0);
  ui.clearRect(0, 0, AM.W, AM.H);

  // SHOT 1: hook — Sweeping aerial from Pulau Run to Manhattan skyline island
  if (t < C.banda.start) {
    const k = ease.inOutCubic(u(t, C.hook.start, C.banda.start));
    stage.setSky('#7ec0e8', 0.012);
    shipNL.position.set(-5.8, 0.1, 3.8);
    shipNL.bob(t, 0);
    shipUK.visible = false;
    K.camLerp(
      stage.cam,
      { p: [0, 5.2, 13.5], l: [0, 1.5, 0] },
      { p: [9.0, 6.8, 16.5], l: [9.0, 2.2, 0] },
      k,
      t
    );
    K.polyBadge(ui, 'PULAU RUN ⇄ MANHATTAN', 'BARTER PULAU PALING LEGENDARIS', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 2: banda — Orbiting Pulau Run in the Banda Sea
  else if (t < C.pala.start) {
    const k = u(t, C.banda.start, C.pala.start);
    stage.setSky('#72bce6', 0.013);
    shipNL.position.set(5.6, 0.1, 3.2);
    shipNL.rotation.y = 2.6;
    shipNL.bob(t, 1);
    shipUK.visible = false;
    K.orbit(stage.cam, [0, 1.4, 0], -0.45 + k * 0.9, 12.2, 3.8, t);
    K.polyBadge(ui, 'PULAU RUN — KEPULAUAN BANDA', 'PANJANG 3 KM · LAUT MALUKU', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: '#48cae4',
    });
  }

  // SHOT 3: pala — Close camera glide into the lush low-poly nutmeg forest on Pulau Run
  else if (t < C.emas.start) {
    const k = ease.inOutSine(u(t, C.pala.start, C.emas.start));
    stage.setSky('#80c6ea', 0.014);
    shipNL.visible = false;
    shipUK.visible = false;
    K.camLerp(
      stage.cam,
      { p: [-4.5, 3.6, 6.2], l: [0, 2.4, -0.4] },
      { p: [2.2, 3.2, 4.8], l: [-0.2, 2.5, -0.5] },
      k,
      t
    );
    K.polyBadge(ui, 'HUTAN POHON PALA', 'MYRISTICA FRAGRANS · ABAD KE-17', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: '#70e000',
    });
  }

  // SHOT 4: emas — Hero 3D Low-Poly Nutmeg fruit splits open in mid-air revealing crimson fuli (mace)
  else if (t < C.armada.start) {
    const k = u(t, C.emas.start, C.armada.start);
    stage.setSky('#2a4d7c', 0.015);
    nutmegHero.visible = true;
    nutmegHero.setOpen(ease.outBack(clamp(k * 1.4), 1.6) * 0.72);
    nutmegHero.rotation.y = t * 0.85;
    nutmegHero.position.y = 5.0 + Math.sin(t * 2.4) * 0.15;
    K.look(stage.cam, [0, 5.2, 8.2], [0, 5.0, 3.2], { t });
    K.polyBadge(ui, 'BIJI PALA & FULI MERAH', 'LEBIH MAHAL DARI EMAS MURNI DI EROPA', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 5: armada — Dutch & English Galleons sailing toward Pulau Run from opposite sides
  else if (t < C.benteng.start) {
    const k = u(t, C.armada.start, C.benteng.start);
    stage.setSky('#5a9ec9', 0.013);
    shipNL.position.set(lerp(-9.5, -5.2, k), 0.1, 4.2);
    shipNL.rotation.y = 0.25;
    shipNL.bob(t, 0, 1.3);

    shipUK.position.set(lerp(9.5, 5.2, k), 0.1, 4.6);
    shipUK.rotation.y = Math.PI - 0.25;
    shipUK.bob(t, 2.1, 1.3);

    K.look(stage.cam, [0, 4.8, 14.5], [0, 1.4, 2.0], { t });
    K.polyBadge(ui, 'PEREBUTAN JALUR REMPAH', 'ARMADA BELANDA (VOC) VS INGGRIS (EIC)', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.red,
    });
  }

  // SHOT 6: benteng — Star-shaped colonial fort (Benteng Belgica) crowning the low-poly island hilltop
  else if (t < C.breda.start) {
    const k = u(t, C.benteng.start, C.breda.start);
    stage.setSky('#68add6', 0.013);
    fort.visible = true;
    shipNL.position.set(-5.4, 0.1, 4.4);
    shipNL.bob(t, 0);
    shipUK.position.set(5.8, 0.1, 4.4);
    shipUK.rotation.y = Math.PI;
    shipUK.bob(t, 1.5);
    K.orbit(stage.cam, [0, 2.4, -0.2], 0.3 + k * 0.75, 8.6, 3.1, t);
    K.polyBadge(ui, 'BENTENG REMPAH BANDA', 'MONOPOLI PERDAGANGAN PALA DUNIA', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 7: breda — Treaty of Breda 1667: dramatic wide angle of both islands connected across the sea
  else if (t < C.manhattan.start) {
    const k = ease.inOutCubic(u(t, C.breda.start, C.manhattan.start));
    stage.setSky('#e09f67', 0.011);
    rig.mood({ sun: '#ffd28a', sunI: 3.1 });
    fort.visible = true;
    shipNL.position.set(4.5, 0.1, 4.5);
    shipNL.bob(t, 0);
    shipUK.position.set(13.5, 0.1, 4.5);
    shipUK.rotation.y = 0;
    shipUK.bob(t, 1.2);
    K.camLerp(
      stage.cam,
      { p: [3.0, 6.2, 16.5], l: [5.0, 1.8, 0] },
      { p: [9.0, 7.5, 19.5], l: [9.0, 2.0, 0] },
      k,
      t
    );
    K.polyBadge(ui, 'PERJANJIAN BREDA · 1667', 'PERTUKARAN DUA PULAU LINTAS BENUA', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 8: manhattan — Orbiting the towering low-poly Manhattan skyscraper island
  else if (t < C.moral.start) {
    const k = u(t, C.manhattan.start, C.moral.start);
    stage.setSky('#4a7c9b', 0.012);
    rig.mood({ sun: '#fff0cc', sunI: 2.8 });
    shipUK.position.set(14.2, 0.1, 5.2);
    shipUK.bob(t, 0.8);
    K.orbit(stage.cam, [18, 2.8, 0], -0.5 + k * 0.9, 13.5, 4.2, t);
    K.polyBadge(ui, 'NEW AMSTERDAM → MANHATTAN', 'KINI PUSAT KOTA NEW YORK', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: '#98c1d9',
    });
  }

  // SHOT 9: moral — Golden sunset over Pulau Run & Phinisi sailing past the spice island
  else {
    const k = u(t, C.moral.start, C.moral.end + 0.5);
    stage.setSky('#d98a5c', 0.012);
    rig.mood({ sun: '#ffb86b', sunI: 3.2, rim: '#ff8844', rimI: 1.3 });
    fort.visible = true;
    shipNL.position.set(lerp(-4.5, 4.5, k), 0.1, 5.0);
    shipNL.rotation.y = 0.15;
    shipNL.bob(t, 0);
    shipUK.visible = false;
    K.orbit(stage.cam, [0, 1.8, 0], -0.25 + k * 0.5, 12.8, 3.4, t);
    K.polyBadge(ui, 'POROS REMPAH NUSANTARA', 'KEKAYAAN ALAM PENGUBAH SEJARAH DUNIA', 540, 250, {
      alpha: clamp(1 - u(k, 0.82, 1.0)),
      accent: K.PAL.gold,
    });
  }

  stage.render();
  K.polyVignette(ui, 0.26);
}
