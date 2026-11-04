// Wayang Golek demo1: "Hanoman Obong: Kera Putih yang Membakar Kerajaan Alengka" — 9 shots (55s).
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

let hud, stg, gunungan, fireBank;
let hanoman, rahwana, sinta, rama, buto;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const at = (id) => (C[id] ? C[id].start : 0);

export async function setup(AM) {
  stg = K.golekStage(AM, { theme: 'alengka' });
  hud = AM.layer('hud');
  for (const l of AM.timeline.lines) C[l.id] = l;

  gunungan = K.makeGunungan();
  hanoman = K.makePuppet('hanoman', { scale: 1.05 });
  rahwana = K.makePuppet('rahwana', { scale: 1.15 });
  sinta = K.makePuppet('sinta', { scale: 0.96 });
  rama = K.makePuppet('rama', { scale: 1.05 });
  buto = K.makePuppet('buto', { scale: 1.08 });
  fireBank = K.makeFireBank(16);

  stg.stage.add(gunungan, hanoman, rahwana, sinta, rama, buto, fireBank);

  AM.sfx('gong', 0.08, { gain: 0.5 });
  AM.sfx('whoosh', W('culik', 'Rahwana'), { gain: 0.42, pitch: 0.8 });
  AM.sfx('chime', W('utus', 'cincin'), { gain: 0.42 });
  AM.sfx('chime', W('argasoka', 'Sinta'), { gain: 0.38 });
  AM.sfx('thud', W('tangkap', 'menangkap'), { gain: 0.48, pitch: 0.85 });
  AM.sfx('whoosh', W('hukum', 'menyulutnya'), { gain: 0.5, pitch: 1.1 });
  AM.sfx('gong', W('lompat', 'melompat'), { gain: 0.52, pitch: 1.05 });
  AM.sfx('whoosh', W('obong', 'api'), { gain: 0.5, pitch: 0.75 });
  AM.sfx('gong', W('moral', 'Hanoman'), { gain: 0.45 });
}

function hideAll() {
  gunungan.visible = false;
  hanoman.visible = false;
  rahwana.visible = false;
  sinta.visible = false;
  rama.visible = false;
  buto.visible = false;
  fireBank.userData.update(0, 0);
}

export function render(t, AM) {
  hud.setTransform(1, 0, 0, 1, 0, 0);
  hud.clearRect(0, 0, 1080, 1920);
  hideAll();

  if (t < at('culik')) {
    // 1. Hook: Gunungan opens to reveal Hanoman with his blazing tail!
    const u = clamp(t / Math.max(0.1, at('culik')));
    stg.setTheme('fire');
    K.lookStage(stg.camera, { pos: [0, 2.3, lerp(13.2, 10.6, ease.inOutSine(u))], target: [0, 1.5, 0], sway: 0.25, t });
    const gOpen = ease.inOutCubic(clamp(t / 1.4));
    if (gOpen < 1) {
      gunungan.visible = true;
      gunungan.position.set(lerp(0, -4.5, gOpen), -1.4, 1.4);
      gunungan.rotation.y = gOpen * 1.8;
    }
    K.posePuppet(hanoman, t, {
      x: 0, y: 0, z: 0.4, face: 0,
      headYaw: Math.sin(t * 4.5) * 0.35, headNod: -0.08,
      armL: 1.1, elbowL: -0.9, armR: 1.35, elbowR: -0.7,
      wave: 1.1, tailFire: 1.0,
    });
    fireBank.userData.update(t, 0.85);
    K.golekPlaque(hud, 'LAKON HANOMAN OBONG', 'Wayang Golek Sunda • Epos Ramayana', { alpha: prog(t, 0.1, 0.6) });

  } else if (t < at('utus')) {
    // 2. Culik: Rahwana holds Dewi Sinta captive in Alengka
    const u = clamp((t - at('culik')) / Math.max(0.1, at('utus') - at('culik')));
    stg.setTheme('alengka');
    K.lookStage(stg.camera, { pos: [lerp(-0.8, 0.8, u), 2.1, 11.4], target: [0, 1.35, 0], sway: 0.2, t });
    K.posePuppet(rahwana, t, {
      x: -1.65, y: 0, z: 0.2, face: 1,
      headYaw: 0.22 + Math.sin(t * 5) * 0.18,
      armL: 0.6, armR: 1.25, elbowR: -0.8, wave: 0.9,
    });
    K.posePuppet(sinta, t, {
      x: 1.75, y: 0, z: 0.1, face: -1,
      headYaw: -0.25, headNod: 0.22,
      armL: 0.35, elbowL: -1.1, armR: 0.4, elbowR: -1.1, wave: 0.2,
    });
    K.golekPlaque(hud, 'KERATON ALENGKA DIRAJA', 'Prabu Rahwana Menculik Dewi Sinta', { alpha: prog(t, at('culik') + 0.1, at('culik') + 0.5) });

  } else if (t < at('argasoka')) {
    // 3. Utus: Sri Rama entrusts the ring to Hanoman
    const u = clamp((t - at('utus')) / Math.max(0.1, at('argasoka') - at('utus')));
    stg.setTheme('sunda');
    K.lookStage(stg.camera, { pos: [0, 2.15, lerp(11.8, 10.5, u)], target: [0, 1.4, 0], sway: 0.18, t });
    K.posePuppet(rama, t, {
      x: -1.65, y: 0, z: 0.2, face: 1,
      headYaw: 0.15, armL: 0.4, armR: 1.05, elbowR: -0.75, wave: 0.45,
    });
    K.posePuppet(hanoman, t, {
      x: 1.55, y: -0.25, z: 0.3, face: -1,
      headYaw: -0.15, headNod: 0.18,
      armL: 0.95, elbowL: -1.2, armR: 0.95, elbowR: -1.2, wave: 0.35,
    });
    K.golekPlaque(hud, 'DUTANING SRI RAMA WIJAYA', 'Hanoman Mengemban Cincin Bukti Suci', { alpha: prog(t, at('utus') + 0.1, at('utus') + 0.5) });

  } else if (t < at('tangkap')) {
    // 4. Argasoka: Hanoman meets Dewi Sinta in Taman Argasoka
    const u = clamp((t - at('argasoka')) / Math.max(0.1, at('tangkap') - at('argasoka')));
    stg.setTheme('taman');
    K.lookStage(stg.camera, { pos: [lerp(0.6, -0.4, u), 2.05, 10.8], target: [0, 1.3, 0], sway: 0.16, t });
    K.posePuppet(hanoman, t, {
      x: -1.45, y: -0.2, z: 0.3, face: 1,
      headYaw: 0.18, headNod: 0.12,
      armL: 0.85, elbowL: -1.1, armR: 1.15, elbowR: -0.95, wave: 0.4,
    });
    K.posePuppet(sinta, t, {
      x: 1.5, y: 0, z: 0.2, face: -1,
      headYaw: -0.15, headNod: 0.1,
      armL: 0.65, elbowL: -1.0, armR: 0.8, elbowR: -0.95, wave: 0.3,
    });
    K.golekPlaque(hud, 'PERTEMUAN DI TAMAN ARGASOKA', 'Cincin Sri Rama untuk Dewi Sinta', { alpha: prog(t, at('argasoka') + 0.1, at('argasoka') + 0.5) });

  } else if (t < at('hukum')) {
    // 5. Tangkap: Hanoman surrounded by Alengka giant guards & Rahwana
    const u = clamp((t - at('tangkap')) / Math.max(0.1, at('hukum') - at('tangkap')));
    stg.setTheme('alengka');
    K.lookStage(stg.camera, { pos: [0, 2.25, 12.2], target: [0, 1.35, 0], sway: 0.25, t });
    K.posePuppet(rahwana, t, {
      x: -2.2, y: 0, z: 0.1, face: 1,
      headYaw: 0.25, armR: 1.35, elbowR: -0.7, wave: 0.9,
    });
    K.posePuppet(hanoman, t, {
      x: 0.1, y: 0, z: 0.4, face: -1,
      headYaw: Math.sin(t * 6) * 0.4,
      armL: 0.45, elbowL: -1.2, armR: 0.45, elbowR: -1.2, wave: 0.5,
    });
    K.posePuppet(buto, t, {
      x: 2.25, y: 0, z: 0.1, face: -1,
      headYaw: -0.25, armL: 1.2, elbowL: -0.8, wave: 0.85,
    });
    K.golekPlaque(hud, 'SIASAT DI GERBANG ALENGKA', 'Hanoman Sengaja Tertangkap Pasukan Raksasa', { alpha: prog(t, at('tangkap') + 0.1, at('tangkap') + 0.5) });

  } else if (t < at('lompat')) {
    // 6. Hukum: Rahwana orders Hanoman's tail set ablaze!
    const u = clamp((t - at('hukum')) / Math.max(0.1, at('lompat') - at('hukum')));
    const ignite = clamp((t - W('hukum', 'menyulutnya') + 0.3) / 0.8);
    stg.setTheme(ignite > 0.3 ? 'fire' : 'alengka');
    K.lookStage(stg.camera, { pos: [lerp(-0.5, 0.4, u), 2.1, lerp(11.4, 9.8, u)], target: [0.3, 1.4, 0], sway: 0.22, t });
    K.posePuppet(rahwana, t, {
      x: -1.85, y: 0, z: 0.1, face: 1,
      headYaw: 0.3, armR: 1.45, elbowR: -0.6, wave: 1.0,
    });
    K.posePuppet(hanoman, t, {
      x: 1.15, y: 0, z: 0.45, face: 0,
      headYaw: Math.sin(t * 5.5) * 0.35,
      armL: 0.5 + ignite * 0.7, armR: 0.5 + ignite * 0.7,
      wave: 0.5 + ignite * 0.7, tailFire: ignite,
    });
    fireBank.userData.update(t, ignite * 0.45);
    K.golekPlaque(hud, 'HUKUMAN API DI ALUN-ALUN', 'Ekor Hanoman Disulut Obor Menyala', { alpha: prog(t, at('hukum') + 0.1, at('hukum') + 0.5) });

  } else if (t < at('obong')) {
    // 7. Lompat: Hanoman grows mighty, breaks his bonds, and leaps high above the palace!
    const u = clamp((t - at('lompat')) / Math.max(0.1, at('obong') - at('lompat')));
    stg.setTheme('fire');
    const jumpY = Math.abs(Math.sin(u * Math.PI * 2)) * 1.45;
    K.lookStage(stg.camera, { pos: [0, 2.3 + jumpY * 0.3, 11.2], target: [0, 1.6 + jumpY * 0.4, 0], sway: 0.3, t });
    K.posePuppet(hanoman, t, {
      x: Math.sin(u * TAU) * 1.3, y: jumpY, z: 0.5, face: 0,
      headYaw: Math.sin(t * 7) * 0.45,
      armL: 1.45, elbowL: -0.6, armR: 1.5, elbowR: -0.5,
      wave: 1.3, tailFire: 1.2,
    });
    fireBank.userData.update(t, 0.75);
    K.golekPlaque(hud, 'KESAKTIAN WANARA SETA', 'Putus Ikatan & Melompat ke Bubungan Istana!', { alpha: prog(t, at('lompat') + 0.1, at('lompat') + 0.5) });

  } else if (t < at('moral')) {
    // 8. Obong: Alengka engulfed in flames as Hanoman leaps across the towers; Rahwana panics!
    const u = clamp((t - at('obong')) / Math.max(0.1, at('moral') - at('obong')));
    stg.setTheme('fire');
    K.lookStage(stg.camera, { pos: [Math.sin(t * 1.2) * 1.1, 2.35, 11.8], target: [0, 1.5, 0], sway: 0.35, t });
    K.posePuppet(hanoman, t, {
      x: -1.35, y: 0.45 + Math.abs(Math.sin(t * 5)) * 0.65, z: 0.4, face: 1,
      headYaw: 0.3, armL: 1.35, armR: 1.45, wave: 1.3, tailFire: 1.3,
    });
    K.posePuppet(rahwana, t, {
      x: 1.65, y: 0, z: 0.2, face: -1,
      headYaw: Math.sin(t * 9) * 0.5, headNod: -0.15,
      armL: 1.4, armR: 1.4, wave: 1.4,
    });
    fireBank.userData.update(t, 1.15);
    K.golekPlaque(hud, 'ALENGKA LAUTAN API', 'Istana Raksasa Membara, Taman Argasoka Tetap Teduh', { alpha: prog(t, at('obong') + 0.1, at('obong') + 0.5) });

  } else {
    // 9. Moral: Rama, Sinta & Hanoman reunited under the golden Gunungan
    const u = clamp((t - at('moral')) / Math.max(0.1, AM.duration - at('moral')));
    stg.setTheme('taman');
    K.lookStage(stg.camera, { pos: [0, 2.2, lerp(11.2, 12.6, ease.inOutSine(u))], target: [0, 1.45, 0], sway: 0.15, t });
    gunungan.visible = true;
    gunungan.position.set(0, -0.8, -1.8);
    gunungan.rotation.y = Math.sin(t * 0.8) * 0.15;
    K.posePuppet(rama, t, { x: -1.9, y: 0, z: 0.2, face: 1, armR: 0.9, wave: 0.3 });
    K.posePuppet(sinta, t, { x: 0, y: 0, z: 0.3, face: 0, headNod: 0.08, armL: 0.6, armR: 0.6, wave: 0.25 });
    K.posePuppet(hanoman, t, { x: 1.9, y: -0.15, z: 0.2, face: -1, headNod: 0.15, armL: 0.95, armR: 0.95, wave: 0.4, tailFire: 0 });
    K.golekPlaque(hud, 'KEBENARAN MENGALAHKAN ANGKARA', 'Warisan Agung Wayang Golek Nusantara', { alpha: prog(t, at('moral') + 0.1, at('moral') + 0.5) });
  }
  stg.render();
}
