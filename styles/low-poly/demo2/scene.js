// Low Poly Demo 2: "Kapal Phinisi Nusantara — Mahakarya Penakluk Samudra Tanpa Paku Besi" (9 shots).
import * as K from '/styles/low-poly/kit.js';
const { THREE, clamp, lerp, ease } = K;

export const meta = {
  fps: 24,
  captions: { preset: 'pop', y: 1520, size: 60 },
};

let stage, rig, ui, sea, phinisi, phinisi2, phinisi3, shoreIsland, clouds = [];
const C = {};
const u = (t, a, b) => clamp((t - a) / Math.max(0.001, b - a));

export async function setup(AM) {
  for (const l of AM.timeline.lines) C[l.id] = l;

  stage = K.createStage(AM, { fov: 54, bg: '#74bae6', fog: true });
  rig = K.lightRig(stage.scene, { sun: '#fff1cc', sunI: 2.8, sky: '#bfe4ff', ground: '#6d5e46', hemiI: 1.25 });
  rig.aim([0, 1.2, 0], { dir: [0.65, 1.0, 0.55], r: 18 });
  ui = AM.layer('ui');

  sea = K.polySea({ size: 120, segs: 42, color: '#1676b2' });
  stage.scene.add(sea);

  // Bulukumba coastal island in the background
  shoreIsland = new THREE.Group();
  const isl = K.polyIsland({ r: 6.2, h: 2.2, seed: 23 });
  shoreIsland.add(isl);
  for (let i = 0; i < 5; i++) {
    const p = K.polyTree('palm', { s: 0.9 + (i % 2) * 0.15, seed: 40 + i });
    p.position.set(-3.2 + i * 1.6, 1.75, 0.8 + (i % 2) * 0.9);
    shoreIsland.add(p);
  }
  shoreIsland.position.set(0, 0, -9.5);
  stage.scene.add(shoreIsland);

  // Hero Phinisi + fleet companions
  phinisi = K.polyShip('phinisi', { s: 1.45, flagColor: '#d9412b' });
  phinisi2 = K.polyShip('phinisi', { s: 0.95, flagColor: '#f2b735' });
  phinisi3 = K.polyShip('phinisi', { s: 0.88, flagColor: '#d9412b' });
  stage.scene.add(phinisi, phinisi2, phinisi3);

  for (let i = 0; i < 7; i++) {
    const cl = K.polyCloud({ s: 0.95 + (i % 3) * 0.2, seed: 200 + i });
    cl.position.set(-16 + i * 7.5, 6.4 + (i % 2) * 1.2, -12 - (i % 3) * 3.5);
    clouds.push(cl);
    stage.scene.add(cl);
  }

  AM.sfx('whoosh', 0.15, { gain: 0.35 });
  AM.sfx('pop', C.pasak.start + 0.3, { gain: 0.3 });
  AM.sfx('chime', C.filosofi.start + 0.25, { freq: 620, gain: 0.35 });
  AM.sfx('drum_hit', C.badai.start + 0.15, { gain: 0.5 });
  AM.sfx('chime', C.unesco.start + 0.25, { freq: 680, gain: 0.35 });
  AM.sfx('gong', C.moral.end + 0.15, { gain: 0.45 });
}

export function render(t, AM) {
  const isStorm = t >= C.badai.start && t < C.jelajah.start;
  sea.tick(t, isStorm ? 0.65 : 0.28, isStorm ? 2.8 : 1.7);
  clouds.forEach((c, i) => {
    c.position.x = -20 + ((i * 8 + t * (isStorm ? 1.4 : 0.45)) % 48);
  });

  phinisi2.visible = false;
  phinisi3.visible = false;
  shoreIsland.visible = true;

  ui.setTransform(1, 0, 0, 1, 0, 0);
  ui.clearRect(0, 0, AM.W, AM.H);

  // SHOT 1: hook — Hero Phinisi slicing across crystalline low-poly waves
  if (t < C.phinisi.start) {
    const k = ease.inOutCubic(u(t, C.hook.start, C.phinisi.start));
    stage.setSky('#74bae6', 0.012);
    phinisi.position.set(lerp(-1.8, 1.2, k), 0.15, 1.5);
    phinisi.rotation.y = -0.15;
    phinisi.bob(t, 0, 1.1);
    K.camLerp(
      stage.cam,
      { p: [5.8, 3.2, 8.8], l: [0, 1.8, 1.2] },
      { p: [-3.5, 4.2, 9.5], l: [0.8, 2.0, 1.2] },
      k,
      t
    );
    K.polyBadge(ui, 'KAPAL PHINISI NUSANTARA', 'DIRAKIT TANPA SATU PAKU BESI PUN', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 2: phinisi — Anchored off Tanah Beru beach, Bulukumba
  else if (t < C.pasak.start) {
    const k = u(t, C.phinisi.start, C.pasak.start);
    stage.setSky('#7ec2eb', 0.012);
    phinisi.position.set(0, 0.15, -1.8);
    phinisi.rotation.y = 0.25;
    phinisi.bob(t, 0, 0.8);
    K.orbit(stage.cam, [0, 2.0, -3.5], -0.45 + k * 0.85, 11.5, 3.4, t);
    K.polyBadge(ui, 'TANAH BERU · BULUKUMBA', 'MAHKARYA PELAUT BUGIS-MAKASSAR', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: '#48cae4',
    });
  }

  // SHOT 3: pasak — Low close-up along the faceted ironwood (kayu ulin) hull & wooden dowels
  else if (t < C.layar.start) {
    const k = ease.inOutSine(u(t, C.pasak.start, C.layar.start));
    stage.setSky('#86c7ed', 0.013);
    phinisi.position.set(0, 0.2, 0);
    phinisi.rotation.y = 0;
    phinisi.bob(t, 0, 0.5);
    K.camLerp(
      stage.cam,
      { p: [-3.6, 1.3, 4.2], l: [0, 0.8, 0] },
      { p: [3.8, 1.5, 3.8], l: [0.4, 0.9, 0] },
      k,
      t
    );
    K.polyBadge(ui, 'TEKNIK PASAK KAYU ULIN', 'PAPAN LAMBUNG DISATUKAN SEBELUM RANGKA', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 4: layar — Tilting up the twin masts and 7 billowing polygonal sails
  else if (t < C.filosofi.start) {
    const k = ease.inOutCubic(u(t, C.layar.start, C.filosofi.start));
    stage.setSky('#5ea8d6', 0.012);
    phinisi.position.set(0, 0.15, 0);
    phinisi.bob(t, 0, 0.9);
    K.camLerp(
      stage.cam,
      { p: [4.2, 1.8, 6.8], l: [0, 1.8, 0] },
      { p: [3.6, 5.2, 6.2], l: [0, 3.4, 0] },
      k,
      t
    );
    K.polyBadge(ui, '2 TIANG UTAMA & 7 LAYAR', 'ARSITEKTUR LAYAR KHAS NUSANTARA', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: '#ffffff',
    });
  }

  // SHOT 5: filosofi — Golden-hour orbit around the sails & pennant flags
  else if (t < C.badai.start) {
    const k = u(t, C.filosofi.start, C.badai.start);
    stage.setSky('#d99b66', 0.012);
    rig.mood({ sun: '#ffd28a', sunI: 3.1 });
    phinisi.position.set(0, 0.15, 0);
    phinisi.bob(t, 0, 0.9);
    K.orbit(stage.cam, [0, 2.8, 0], 0.2 + k * 0.9, 9.2, 2.2, t);
    K.polyBadge(ui, 'FILOSOFI PELAUT BUGIS', '2 KALIMAT SYAHADAT · 7 AYAT AL-FATIHAH', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 6: badai — Riding high stormy polygonal ocean swells; flexible wooden hull rides the waves
  else if (t < C.jelajah.start) {
    const k = u(t, C.badai.start, C.jelajah.start);
    stage.setSky('#243b55', 0.018);
    rig.mood({ sun: '#9bb8d3', sunI: 1.8, sky: '#415a77', hemiI: 0.9 });
    shoreIsland.visible = false;
    phinisi.position.set(0, 0.2, 0);
    phinisi.bob(t, 0, 2.4);
    K.look(stage.cam, [4.6, 2.4 + Math.sin(t * 3) * 0.35, 7.8], [0, 1.8, 0], {
      t,
      roll: Math.sin(t * 2.1) * 0.06,
    });
    K.polyBadge(ui, 'TANGGUH DITERJANG BADAI', 'SAMBUNGAN PASAK KAYU LENTUR DI OMBAK TINGGI', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: '#48cae4',
    });
  }

  // SHOT 7: jelajah — Fleet of 3 Phinisi schooners sailing across the open ocean
  else if (t < C.unesco.start) {
    const k = u(t, C.jelajah.start, C.unesco.start);
    stage.setSky('#569cd6', 0.011);
    rig.mood({ sun: '#fff1cc', sunI: 2.8, sky: '#bfe4ff', hemiI: 1.25 });
    shoreIsland.visible = false;
    phinisi2.visible = true;
    phinisi3.visible = true;

    phinisi.position.set(lerp(-2.5, 1.5, k), 0.15, 1.2);
    phinisi.bob(t, 0, 1.1);
    phinisi2.position.set(lerp(-6.5, -2.5, k), 0.1, -2.8);
    phinisi2.bob(t, 1.4, 1.0);
    phinisi3.position.set(lerp(-5.0, -1.0, k), 0.1, 4.5);
    phinisi3.bob(t, 2.7, 1.0);

    K.orbit(stage.cam, [0, 1.8, 1.0], -0.35 + k * 0.7, 13.5, 4.2, t);
    K.polyBadge(ui, 'PELAYARAN LINTAS SAMUDRA', 'MADAGASKAR · AUSTRALIA · VANCOUVER', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 8: unesco — UNESCO Intangible Cultural Heritage tribute angle
  else if (t < C.moral.start) {
    const k = u(t, C.unesco.start, C.moral.start);
    stage.setSky('#6cb4e0', 0.012);
    phinisi.position.set(0, 0.15, 0);
    phinisi.bob(t, 0, 0.9);
    K.orbit(stage.cam, [0, 2.4, 0], -0.6 + k * 0.8, 9.8, 2.6, t);
    K.polyBadge(ui, 'WARISAN BUDAYA DUNIA UNESCO', 'SENI PEMBUATAN PERAHU PHINISI (2017)', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 9: moral — Sunset finale with the Phinisi fleet sailing into the golden horizon
  else {
    const k = u(t, C.moral.start, C.moral.end + 0.5);
    stage.setSky('#d98254', 0.012);
    rig.mood({ sun: '#ffb566', sunI: 3.2, rim: '#ff7b3a', rimI: 1.3 });
    phinisi2.visible = true;
    phinisi3.visible = true;
    phinisi.position.set(lerp(0, 3.2, k), 0.15, 1.0);
    phinisi.bob(t, 0, 1.0);
    phinisi2.position.set(lerp(-3.5, -0.5, k), 0.1, -2.5);
    phinisi2.bob(t, 1.2, 0.9);
    phinisi3.position.set(lerp(-2.5, 0.5, k), 0.1, 4.2);
    phinisi3.bob(t, 2.4, 0.9);
    K.look(stage.cam, [-6.5, 3.4, 9.5], [1.5, 2.0, 0.5], { t });
    K.polyBadge(ui, 'BANGSA BAHARI NUSANTARA', 'PENGUASA LAUTAN YANG DISEGANI DUNIA', 540, 250, {
      alpha: clamp(1 - u(k, 0.82, 1.0)),
      accent: K.PAL.gold,
    });
  }

  stage.render();
  K.polyVignette(ui, 0.26);
}
