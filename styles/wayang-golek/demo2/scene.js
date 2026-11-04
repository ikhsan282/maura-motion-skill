// Wayang Golek demo2: "Si Cepot & Falsafah Tawa Sunda" — 9 shots (55s).
import * as K from '/styles/wayang-golek/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand, TAU } = AM.lib;

export const meta = {
  fps: 24,
  hold: 2,
  captions: {
    preset: 'serif',
    y: 1660,
    size: 58,
    maxWords: 4,
    box: { fill: 'rgba(28, 14, 8, 0.88)', pad: 18, radius: 10, border: '#e6b43c', borderW: 2 },
  },
};

let hud, stg, gunungan;
let cepot, dawala, semar, buto, rama;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const at = (id) => (C[id] ? C[id].start : 0);

export async function setup(AM) {
  stg = K.golekStage(AM, { theme: 'sunda' });
  hud = AM.layer('hud');
  for (const l of AM.timeline.lines) C[l.id] = l;

  gunungan = K.makeGunungan();
  cepot = K.makePuppet('cepot', { scale: 1.06 });
  dawala = K.makePuppet('dawala', { scale: 1.04 });
  semar = K.makePuppet('semar', { scale: 1.08 });
  buto = K.makePuppet('buto', { scale: 1.12 });
  rama = K.makePuppet('rama', { scale: 1.04 });

  stg.stage.add(gunungan, cepot, dawala, semar, buto, rama);

  AM.sfx('gong', 0.08, { gain: 0.48 });
  AM.sfx('pop', W('kenal', 'Cepot'), { gain: 0.42 });
  AM.sfx('chime', W('dawala', 'Punakawan'), { gain: 0.38 });
  AM.sfx('tap', W('goyang', 'kendang'), { gain: 0.45, pitch: 1.25 });
  AM.sfx('whoosh', W('buto', 'silat'), { gain: 0.48, pitch: 1.15 });
  AM.sfx('gong', W('sunda', 'falsafah'), { gain: 0.45 });
  AM.sfx('chime', W('penutup', 'ketulusan'), { gain: 0.38 });
}

function hideAll() {
  gunungan.visible = false;
  cepot.visible = false;
  dawala.visible = false;
  semar.visible = false;
  buto.visible = false;
  rama.visible = false;
}

export function render(t, AM) {
  hud.setTransform(1, 0, 0, 1, 0, 0);
  hud.clearRect(0, 0, 1080, 1920);
  hideAll();

  if (t < at('kenal')) {
    // 1. Hook: Close-up hero shot of Si Cepot nodding, turning his head & waving!
    const u = clamp(t / Math.max(0.1, at('kenal')));
    stg.setTheme('sunda');
    K.lookStage(stg.camera, { pos: [0, 2.35, lerp(10.8, 9.2, ease.inOutSine(u))], target: [0, 1.75, 0], sway: 0.18, t });
    K.posePuppet(cepot, t, {
      x: 0, y: 0, z: 0.5, face: 0,
      bob: 1.5,
      headYaw: Math.sin(t * 5.2) * 0.48,
      headNod: Math.sin(t * 7.5) * 0.18,
      armL: 0.85, elbowL: -0.9, armR: 1.35, elbowR: -0.75,
      wave: 1.2,
    });
    K.golekPlaque(hud, 'SI CEPOT (ASTRAJINGGA)', 'Ikon Abadi Wayang Golek Pasundan', { alpha: prog(t, 0.1, 0.6) });

  } else if (t < at('dawala')) {
    // 2. Kenal: Lurah Semar Badranaya & Si Cepot side by side
    const u = clamp((t - at('kenal')) / Math.max(0.1, at('dawala') - at('kenal')));
    stg.setTheme('sunda');
    K.lookStage(stg.camera, { pos: [lerp(-0.4, 0.4, u), 2.15, 11.2], target: [0, 1.4, 0], sway: 0.16, t });
    K.posePuppet(semar, t, {
      x: -1.5, y: 0, z: 0.2, face: 1,
      headYaw: 0.15, headNod: 0.08,
      armL: 0.4, armR: 0.95, elbowR: -0.85, wave: 0.45,
    });
    K.posePuppet(cepot, t, {
      x: 1.45, y: 0, z: 0.35, face: -1,
      bob: 1.4, headYaw: -0.2 + Math.sin(t * 6) * 0.25,
      armL: 1.1, elbowL: -0.85, armR: 0.9, wave: 0.9,
    });
    K.golekPlaque(hud, 'PUTRA LURAH SEMAR BADRANAYA', 'Lahir dari Kejujuran Tanah Pasundan', { alpha: prog(t, at('kenal') + 0.1, at('kenal') + 0.5) });

  } else if (t < at('goyang')) {
    // 3. Dawala: Trio Punakawan Sunda (Semar, Cepot, Dawala)
    const u = clamp((t - at('dawala')) / Math.max(0.1, at('goyang') - at('dawala')));
    stg.setTheme('sunda');
    K.lookStage(stg.camera, { pos: [0, 2.2, 12.0], target: [0, 1.4, 0], sway: 0.2, t });
    K.posePuppet(semar, t, { x: -2.15, y: 0, z: 0.1, face: 1, armR: 0.85, wave: 0.35 });
    K.posePuppet(cepot, t, {
      x: 0, y: 0, z: 0.45, face: 0,
      bob: 1.5, headYaw: Math.sin(t * 5.5) * 0.4,
      armL: 1.1, armR: 1.15, wave: 1.0,
    });
    K.posePuppet(dawala, t, {
      x: 2.15, y: 0, z: 0.15, face: -1,
      bob: 1.3, headYaw: -0.22 + Math.cos(t * 5) * 0.2,
      armL: 1.05, elbowL: -0.8, armR: 0.6, wave: 0.85,
    });
    K.golekPlaque(hud, 'TRIO PUNAKAWAN PASUNDAN', 'Semar • Si Cepot • Dawala', { alpha: prog(t, at('dawala') + 0.1, at('dawala') + 0.5) });

  } else if (t < at('kritik')) {
    // 4. Goyang: Si Cepot performing lively Sundanese Pencak Silat moves!
    const u = clamp((t - at('goyang')) / Math.max(0.1, at('kritik') - at('goyang')));
    stg.setTheme('sunda');
    K.lookStage(stg.camera, { pos: [Math.sin(t * 1.5) * 0.6, 2.15, 10.2], target: [0, 1.5, 0], sway: 0.25, t });
    K.posePuppet(cepot, t, {
      x: Math.sin(t * 4.5) * 0.75,
      y: Math.abs(Math.sin(t * 9)) * 0.32,
      z: 0.5,
      face: 0,
      bob: 2.0,
      twist: Math.sin(t * 6) * 0.45,
      headYaw: Math.cos(t * 8) * 0.55,
      headNod: Math.sin(t * 10) * 0.22,
      armL: 1.4, elbowL: -0.5,
      armR: 1.45, elbowR: -0.5,
      wave: 1.6,
    });
    K.golekPlaque(hud, 'IBING PENCAK SILAT GOLEK', 'Gerak Kepala & Tuding di Tangan Sang Dalang', { alpha: prog(t, at('goyang') + 0.1, at('goyang') + 0.5) });

  } else if (t < at('buto')) {
    // 5. Kritik: Si Cepot speaking truth to power before a royal knight
    const u = clamp((t - at('kritik')) / Math.max(0.1, at('buto') - at('kritik')));
    stg.setTheme('taman');
    K.lookStage(stg.camera, { pos: [0, 2.15, 11.2], target: [0, 1.4, 0], sway: 0.16, t });
    K.posePuppet(rama, t, {
      x: -1.6, y: 0, z: 0.2, face: 1,
      headYaw: 0.15, armR: 0.75, wave: 0.3,
    });
    K.posePuppet(cepot, t, {
      x: 1.45, y: 0, z: 0.35, face: -1,
      bob: 1.4, headYaw: -0.15 + Math.sin(t * 6) * 0.25,
      armL: 1.35, elbowL: -0.65, armR: 0.7, wave: 1.1,
    });
    K.golekPlaque(hud, 'SUARA JUJUR RAKYAT KECIL', 'Kritik Tajam dalam Balutan Humor Segar', { alpha: prog(t, at('kritik') + 0.1, at('kritik') + 0.5) });

  } else if (t < at('makna')) {
    // 6. Buto: Si Cepot & Dawala outsmarting the arrogant giant (Buto) in a silat duel!
    const u = clamp((t - at('buto')) / Math.max(0.1, at('makna') - at('buto')));
    stg.setTheme('alengka');
    K.lookStage(stg.camera, { pos: [lerp(-0.5, 0.5, u), 2.2, 11.4], target: [0, 1.45, 0], sway: 0.28, t });
    const dodge = Math.sin(t * 7) * 0.35;
    K.posePuppet(cepot, t, {
      x: -1.35 + dodge, y: Math.abs(dodge) * 0.5, z: 0.45, face: 1,
      bob: 1.8, twist: 0.3, headYaw: 0.25,
      armL: 1.2, armR: 1.45, elbowR: -0.5, wave: 1.5,
    });
    K.posePuppet(buto, t, {
      x: 1.55, y: 0, z: 0.2, face: -1,
      headYaw: Math.sin(t * 8) * 0.45, headNod: -0.15,
      armL: 1.35, armR: 1.2, wave: 1.3,
    });
    K.golekPlaque(hud, 'CERDIK MELAWAN ANGKARA', 'Ketangkasan Silat & Akal Mengalahkan Raksasa', { alpha: prog(t, at('buto') + 0.1, at('buto') + 0.5) });

  } else if (t < at('sunda')) {
    // 7. Makna: Close portrait of Astrajingga (Red face = fiery spirit, white tooth = pure truth)
    const u = clamp((t - at('makna')) / Math.max(0.1, at('sunda') - at('makna')));
    stg.setTheme('taman');
    K.lookStage(stg.camera, { pos: [0, 2.3, lerp(9.8, 9.0, u)], target: [0, 1.75, 0], sway: 0.14, t });
    K.posePuppet(cepot, t, {
      x: 0, y: 0, z: 0.5, face: 0,
      bob: 1.1, headYaw: Math.sin(t * 3.5) * 0.28, headNod: 0.08,
      armL: 0.85, elbowL: -1.1, armR: 0.85, elbowR: -1.1, wave: 0.45,
    });
    K.golekPlaque(hud, 'MAKNA NAMA ASTRAJINGGA', 'Wajah Merah Berani • Hati Putih Tulus', { alpha: prog(t, at('makna') + 0.1, at('makna') + 0.5) });

  } else if (t < at('penutup')) {
    // 8. Sunda: Philosophy of Silih Asah, Silih Asih, Silih Asuh
    const u = clamp((t - at('sunda')) / Math.max(0.1, at('penutup') - at('sunda')));
    stg.setTheme('sunda');
    K.lookStage(stg.camera, { pos: [0, 2.2, 11.6], target: [0, 1.45, 0], sway: 0.16, t });
    K.posePuppet(semar, t, { x: -1.75, y: 0, z: 0.2, face: 1, armR: 0.9, wave: 0.4 });
    K.posePuppet(cepot, t, { x: 0.1, y: 0, z: 0.4, face: 0, headYaw: Math.sin(t * 4) * 0.25, armL: 0.9, armR: 1.1, wave: 0.7 });
    K.posePuppet(dawala, t, { x: 1.85, y: 0, z: 0.2, face: -1, armL: 0.9, wave: 0.5 });
    K.golekPlaque(hud, 'SILIH ASAH • SILIH ASIH • SILIH ASUH', 'Saling Mencerdaskan, Mengasihi & Menjaga', { alpha: prog(t, at('sunda') + 0.1, at('sunda') + 0.5) });

  } else {
    // 9. Penutup: Gunungan rises behind Semar, Cepot & Dawala bowing warmly
    const u = clamp((t - at('penutup')) / Math.max(0.1, AM.duration - at('penutup')));
    stg.setTheme('sunda');
    K.lookStage(stg.camera, { pos: [0, 2.25, lerp(11.4, 12.6, ease.inOutSine(u))], target: [0, 1.45, 0], sway: 0.14, t });
    gunungan.visible = true;
    gunungan.position.set(0, -0.8, -1.8);
    gunungan.rotation.y = Math.sin(t * 0.8) * 0.12;
    K.posePuppet(semar, t, { x: -1.9, y: 0, z: 0.2, face: 1, headNod: 0.12, armL: 0.7, armR: 0.7, wave: 0.25 });
    K.posePuppet(cepot, t, { x: 0, y: 0, z: 0.45, face: 0, headNod: 0.15, armL: 1.0, elbowL: -1.1, armR: 1.0, elbowR: -1.1, wave: 0.5 });
    K.posePuppet(dawala, t, { x: 1.9, y: 0, z: 0.2, face: -1, headNod: 0.12, armL: 0.7, armR: 0.7, wave: 0.25 });
    K.golekPlaque(hud, 'KEBIJAKSANAAN DALAM TAWA', 'Pesan Luhur Wayang Golek Sunda', { alpha: prog(t, at('penutup') + 0.1, at('penutup') + 0.5) });
  }
  stg.render();
}
