// Low Poly Demo 3: "Cincin Api Nusantara — Bagaimana Gunung Berapi Membentuk Kepulauan Indonesia" (9 shots).
import * as K from '/styles/low-poly/kit.js';
const { THREE, clamp, lerp, ease } = K;

export const meta = {
  fps: 24,
  captions: { preset: 'pop', y: 1520, size: 60 },
};

let stage, rig, ui, sea, mainIsl, mainVolc, westVolc, eastVolc, plateA, plateB, forestGrp, clouds = [];
const C = {};
const u = (t, a, b) => clamp((t - a) / Math.max(0.001, b - a));

export async function setup(AM) {
  for (const l of AM.timeline.lines) C[l.id] = l;

  stage = K.createStage(AM, { fov: 54, bg: '#5a9ec9', fog: true });
  rig = K.lightRig(stage.scene, { sun: '#fff0cc', sunI: 2.8, sky: '#bfe3ff', ground: '#6e5842', hemiI: 1.25 });
  rig.aim([0, 2.0, 0], { dir: [0.6, 1.0, 0.55], r: 20 });
  ui = AM.layer('ui');

  sea = K.polySea({ size: 120, segs: 42, color: '#146fa8' });
  stage.scene.add(sea);

  // Main volcanic island
  mainIsl = K.polyIsland({ r: 6.4, h: 2.0, seed: 19 });
  mainVolc = K.polyVolcano({ r: 4.8, h: 4.8, seed: 31, lava: true });
  mainVolc.position.y = 1.6;
  mainIsl.add(mainVolc);
  stage.scene.add(mainIsl);

  // Lush forest ring around the volcano base
  forestGrp = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * K.TAU;
    const rad = 4.1 + (i % 2) * 0.65;
    const tr = K.polyTree(i % 3 === 0 ? 'palm' : i % 2 === 0 ? 'nutmeg' : 'pine', {
      s: 0.78 + (i % 3) * 0.14,
      seed: 70 + i,
    });
    tr.position.set(Math.cos(a) * rad, 1.65, Math.sin(a) * rad);
    forestGrp.add(tr);
  }
  mainIsl.add(forestGrp);

  // Neighboring volcanic islands in the Ring of Fire arc
  westVolc = new THREE.Group();
  const wIsl = K.polyIsland({ r: 4.5, h: 1.6, seed: 41 });
  const wCone = K.polyVolcano({ r: 3.4, h: 3.6, seed: 42, lava: true });
  wCone.position.y = 1.2;
  westVolc.add(wIsl, wCone);
  westVolc.wCone = wCone;
  westVolc.position.set(-12.5, 0, -4.5);
  stage.scene.add(westVolc);

  eastVolc = new THREE.Group();
  const eIsl = K.polyIsland({ r: 4.8, h: 1.7, seed: 51 });
  const eCone = K.polyVolcano({ r: 3.6, h: 3.9, seed: 52, lava: true });
  eCone.position.y = 1.3;
  eastVolc.add(eIsl, eCone);
  eastVolc.eCone = eCone;
  eastVolc.position.set(12.5, 0, -3.8);
  stage.scene.add(eastVolc);

  // Tectonic plates for shot 3 (subduction cutaway)
  plateA = new THREE.Mesh(
    K.jitterGeo(new THREE.BoxGeometry(7.5, 1.1, 5.5, 4, 1, 3), 0.08, 81),
    K.polyMat('#5c6470', { roughness: 0.85 })
  );
  plateB = new THREE.Mesh(
    K.jitterGeo(new THREE.BoxGeometry(7.5, 1.1, 5.5, 4, 1, 3), 0.08, 82),
    K.polyMat('#7a5942', { roughness: 0.85 })
  );
  stage.scene.add(plateA, plateB);

  for (let i = 0; i < 7; i++) {
    const cl = K.polyCloud({ s: 0.95 + (i % 3) * 0.25, seed: 300 + i });
    cl.position.set(-18 + i * 7.5, 7.2 + (i % 2) * 1.1, -10 - (i % 3) * 3.5);
    clouds.push(cl);
    stage.scene.add(cl);
  }

  AM.sfx('drum_hit', 0.12, { gain: 0.45 });
  AM.sfx('impact', C.tumbukan.start + 0.3, { gain: 0.45 });
  AM.sfx('whoosh', C.magma.start + 0.25, { gain: 0.4 });
  AM.sfx('impact', C.erupsi.start + 0.2, { gain: 0.55 });
  AM.sfx('chime', C.subur.start + 0.3, { freq: 640, gain: 0.35 });
  AM.sfx('gong', C.moral.end + 0.15, { gain: 0.45 });
}

export function render(t, AM) {
  const isErupt = t >= C.erupsi.start && t < C.subur.start;
  sea.tick(t, isErupt ? 0.45 : 0.26, isErupt ? 2.3 : 1.6);
  clouds.forEach((c, i) => {
    c.position.x = -20 + ((i * 8 + t * 0.45) % 48);
  });

  plateA.visible = false;
  plateB.visible = false;
  forestGrp.visible = true;
  mainVolc.tick(t, isErupt ? 1.0 : 0.38);
  westVolc.wCone.tick(t + 1.3, isErupt ? 0.8 : 0.3);
  eastVolc.eCone.tick(t + 2.7, isErupt ? 0.85 : 0.32);

  ui.setTransform(1, 0, 0, 1, 0, 0);
  ui.clearRect(0, 0, AM.W, AM.H);

  // SHOT 1: hook — Dramatic aerial over the glowing volcanic island arc
  if (t < C.cincin.start) {
    const k = ease.inOutCubic(u(t, C.hook.start, C.cincin.start));
    stage.setSky('#386fa4', 0.012);
    K.camLerp(
      stage.cam,
      { p: [0, 8.5, 22.0], l: [0, 2.5, 0] },
      { p: [0, 6.2, 15.5], l: [0, 3.0, 0] },
      k,
      t
    );
    K.polyBadge(ui, '127 GUNUNG BERAPI AKTIF', 'JUMLAH TERBANYAK DI SELURUH DUNIA', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.lava,
    });
  }

  // SHOT 2: cincin — Wide sweeping pan across the 3-volcano Ring of Fire archipelago
  else if (t < C.tumbukan.start) {
    const k = u(t, C.cincin.start, C.tumbukan.start);
    stage.setSky('#4885b8', 0.011);
    K.orbit(stage.cam, [0, 2.5, -1.5], -0.55 + k * 1.1, 21.0, 6.5, t);
    K.polyBadge(ui, 'SABUK CINCIN API PASIFIK', 'PERTEMUAN TIGA LEMPENG BENUA RAKSASA', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 3: tumbukan — Tectonic plates colliding & subducting beneath the volcano
  else if (t < C.magma.start) {
    const k = u(t, C.tumbukan.start, C.magma.start);
    stage.setSky('#2b4c6f', 0.014);
    plateA.visible = true;
    plateB.visible = true;
    plateA.position.set(lerp(-5.2, -2.6, k), lerp(0.8, 0.1, k), 5.5);
    plateA.rotation.z = -0.22;
    plateB.position.set(lerp(5.2, 2.6, k), 1.05, 5.5);
    plateB.rotation.z = 0.08;
    K.look(stage.cam, [0, 4.2, 15.2], [0, 1.4, 3.5], { t });
    K.polyBadge(ui, 'SUBDUKSI LEMPENG TEKTONIK', 'INDO-AUSTRALIA MENGHUNJAM KE BAWAH EURASIA', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: '#48cae4',
    });
  }

  // SHOT 4: magma — Looking down into the glowing low-poly volcanic crater
  else if (t < C.pulau.start) {
    const k = ease.inOutSine(u(t, C.magma.start, C.pulau.start));
    stage.setSky('#2a364f', 0.015);
    mainVolc.tick(t, 0.65);
    K.orbit(stage.cam, [0, 5.8, 0], 0.2 + k * 1.1, 6.8, 3.6, t);
    K.polyBadge(ui, 'DAPUR MAGMA PANAS', 'BATUAN MELELEH NAIK KE PERMUKAAN', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.lava,
    });
  }

  // SHOT 5: pulau — Volcanic islands rising up from the sea floor
  else if (t < C.erupsi.start) {
    const k = ease.outBack(u(t, C.pulau.start, C.erupsi.start), 1.2);
    stage.setSky('#5c9ed1', 0.012);
    westVolc.position.y = lerp(-3.5, 0, clamp(k));
    eastVolc.position.y = lerp(-3.5, 0, clamp(k));
    K.look(stage.cam, [0, 6.2, 19.5], [0, 2.2, -1.0], { t });
    K.polyBadge(ui, 'LAHIRNYA KEPULAUAN NUSANTARA', 'SUMATRA · JAWA · BALI · NUSA TENGGARA · MALUKU', 540, 250, {
      alpha: Math.sin(u(t, C.pulau.start, C.erupsi.start) * Math.PI),
      accent: K.PAL.gold,
    });
  }

  // SHOT 6: erupsi — Colossal low-poly eruption (Tambora & Krakatau) with camera shake & glowing sky
  else if (t < C.subur.start) {
    const k = u(t, C.erupsi.start, C.subur.start);
    stage.setSky('#3b1d1e', 0.018);
    rig.mood({ sun: '#ff7b3a', sunI: 3.4, sky: '#6b2d26', hemiI: 1.0, rim: '#ff3b00', rimI: 1.6 });
    const shX = K.noise.n2(t * 20, 1) * 0.22;
    const shY = K.noise.n2(t * 20, 7) * 0.22;
    K.look(stage.cam, [shX, 4.8 + shY, 14.2], [0, 4.5, 0], { t });
    K.polyBadge(ui, 'LETUSAN PENGUBAH IKLIM DUNIA', 'JEJAK SEJARAH TAMBORA (1815) & KRAKATAU (1883)', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: K.PAL.lava,
    });
  }

  // SHOT 7: subur — Skies clear to bright azure; lush green trees & golden nutmegs flourish on the slopes
  else if (t < C.hutan.start) {
    const k = u(t, C.subur.start, C.hutan.start);
    stage.setSky('#72bce8', 0.012);
    rig.mood({ sun: '#fff2cc', sunI: 2.9, sky: '#bfe4ff', hemiI: 1.3, rim: '#ffd199', rimI: 0.9 });
    const grow = ease.outBack(clamp(k * 1.5), 1.5);
    forestGrp.scale.setScalar(Math.max(0.01, grow));
    K.orbit(stage.cam, [0, 2.4, 0], -0.4 + k * 0.9, 11.8, 2.8, t);
    K.polyBadge(ui, 'BERKAH ABU VULKANIK', 'MINERAL ALAMI PENYUBUR TANAH NUSANTARA', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: '#70e000',
    });
  }

  // SHOT 8: hutan — Close glide past the emerald low-poly forest & coastal waters
  else if (t < C.moral.start) {
    const k = ease.inOutSine(u(t, C.hutan.start, C.moral.start));
    stage.setSky('#7ec4ec', 0.012);
    forestGrp.scale.setScalar(1);
    K.camLerp(
      stage.cam,
      { p: [-5.5, 3.2, 8.2], l: [0, 2.2, 0] },
      { p: [5.5, 3.4, 7.8], l: [0, 2.4, 0] },
      k,
      t
    );
    K.polyBadge(ui, 'HUTAN TROPIS & MATA AIR', 'MENGHIDUPI JUTAAN JIWA DI LERENG GUNUNG', 540, 250, {
      alpha: Math.sin(k * Math.PI),
      accent: '#48cae4',
    });
  }

  // SHOT 9: moral — Golden sunset over the emerald volcanic archipelago
  else {
    const k = u(t, C.moral.start, C.moral.end + 0.5);
    stage.setSky('#d98657', 0.012);
    rig.mood({ sun: '#ffb86b', sunI: 3.2, rim: '#ff8844', rimI: 1.3 });
    K.orbit(stage.cam, [0, 2.8, 0], -0.25 + k * 0.55, 16.5, 4.5, t);
    K.polyBadge(ui, 'HARMONI DI ATAS CINCIN API', 'RAHIM ALAM YANG MELAHIRKAN TANAH AIR KITA', 540, 250, {
      alpha: clamp(1 - u(k, 0.82, 1.0)),
      accent: K.PAL.gold,
    });
  }

  stage.render();
  K.polyVignette(ui, 0.26);
}
