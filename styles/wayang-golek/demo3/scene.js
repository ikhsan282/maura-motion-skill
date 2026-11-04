// Wayang Golek demo3: "Lahirnya Gatotkaca di Kawah Candradimuka" — 9 shots (55s).
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
let gatotkaca, sinta, rama, buto, semar;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const at = (id) => (C[id] ? C[id].start : 0);

export async function setup(AM) {
  stg = K.golekStage(AM, { theme: 'kawah' });
  hud = AM.layer('hud');
  for (const l of AM.timeline.lines) C[l.id] = l;

  gunungan = K.makeGunungan();
  gatotkaca = K.makePuppet('gatotkaca', { scale: 1.08 });
  sinta = K.makePuppet('sinta', { scale: 0.96 }); // Dewi Arimbi
  rama = K.makePuppet('rama', { scale: 1.05 });   // Batara Narada / Dewa
  buto = K.makePuppet('buto', { scale: 1.16 });   // Prabu Kala Pracona
  semar = K.makePuppet('semar', { scale: 1.05 });
  fireBank = K.makeFireBank(16);

  stg.stage.add(gunungan, gatotkaca, sinta, rama, buto, semar, fireBank);

  AM.sfx('gong', 0.08, { gain: 0.5 });
  AM.sfx('chime', W('tetuka', 'Tetuka'), { gain: 0.4 });
  AM.sfx('thud', W('kahyangan', 'Pracona'), { gain: 0.48, pitch: 0.8 });
  AM.sfx('whoosh', W('kawah', 'Candradimuka'), { gain: 0.5, pitch: 0.85 });
  AM.sfx('gong', W('tempa', 'pusaka'), { gain: 0.48, pitch: 1.15 });
  AM.sfx('gong', W('bangkit', 'Gatotkaca'), { gain: 0.52 });
  AM.sfx('whoosh', W('pusaka', 'terbang'), { gain: 0.48, pitch: 1.2 });
  AM.sfx('thud', W('menang', 'menumbangkan'), { gain: 0.5, pitch: 0.85 });
  AM.sfx('chime', W('moral', 'ketangguhan'), { gain: 0.4 });
}

function hideAll() {
  gunungan.visible = false;
  gatotkaca.visible = false;
  sinta.visible = false;
  rama.visible = false;
  buto.visible = false;
  semar.visible = false;
  fireBank.userData.update(0, 0);
}

export function render(t, AM) {
  hud.setTransform(1, 0, 0, 1, 0, 0);
  hud.clearRect(0, 0, 1080, 1920);
  hideAll();

  if (t < at('tetuka')) {
    // 1. Hook: Gatotkaca rising heroically from the fiery Kawah Candradimuka!
    const u = clamp(t / Math.max(0.1, at('tetuka')));
    stg.setTheme('kawah');
    K.lookStage(stg.camera, { pos: [0, 2.35, lerp(12.4, 10.2, ease.inOutSine(u))], target: [0, 1.65, 0], sway: 0.24, t });
    K.posePuppet(gatotkaca, t, {
      x: 0, y: lerp(-0.8, 0.35, ease.outBack(u, 1.4)), z: 0.4, face: 0,
      headYaw: Math.sin(t * 4) * 0.3,
      armL: 1.25, elbowL: -0.7, armR: 1.4, elbowR: -0.6,
      wave: 1.1,
    });
    fireBank.userData.update(t, 0.95);
    K.golekPlaque(hud, 'KAWAH CANDRADIMUKA', 'Kelahiran Raden Gatotkaca • Otot Kawat Tulang Besi', { alpha: prog(t, 0.1, 0.6) });

  } else if (t < at('kahyangan')) {
    // 2. Tetuka: Dewi Arimbi & Semar marveling at baby Jabang Tetuka
    const u = clamp((t - at('tetuka')) / Math.max(0.1, at('kahyangan') - at('tetuka')));
    stg.setTheme('sunda');
    K.lookStage(stg.camera, { pos: [lerp(-0.4, 0.4, u), 2.15, 11.2], target: [0, 1.35, 0], sway: 0.16, t });
    K.posePuppet(sinta, t, {
      x: -1.5, y: 0, z: 0.25, face: 1,
      headYaw: 0.15, headNod: 0.12, armL: 0.85, armR: 0.95, wave: 0.35,
    });
    K.posePuppet(semar, t, {
      x: 1.5, y: 0, z: 0.25, face: -1,
      headYaw: -0.15, armL: 0.9, armR: 0.6, wave: 0.45,
    });
    K.golekPlaque(hud, 'JABANG TETUKA LAHIR SAKTI', 'Tali Pusar Tak Mempan Senjata Tajam', { alpha: prog(t, at('tetuka') + 0.1, at('tetuka') + 0.5) });

  } else if (t < at('kawah')) {
    // 3. Kahyangan: Giant king Kala Pracona rampaging at the gates of Jonggringsaloka
    const u = clamp((t - at('kahyangan')) / Math.max(0.1, at('kawah') - at('kahyangan')));
    stg.setTheme('alengka');
    K.lookStage(stg.camera, { pos: [0, 2.2, 11.4], target: [0, 1.4, 0], sway: 0.28, t });
    K.posePuppet(buto, t, {
      x: -1.45, y: 0, z: 0.35, face: 1,
      headYaw: Math.sin(t * 7) * 0.4,
      armL: 1.35, armR: 1.45, elbowR: -0.5, wave: 1.3,
    });
    K.posePuppet(rama, t, {
      x: 1.6, y: 0, z: 0.2, face: -1,
      headYaw: -0.2, armL: 1.1, armR: 0.8, wave: 0.6,
    });
    K.golekPlaque(hud, 'ANCAMAN PRABU KALA PRACONA', 'Kahyangan Jonggringsaloka Digempur Raksasa', { alpha: prog(t, at('kahyangan') + 0.1, at('kahyangan') + 0.5) });

  } else if (t < at('tempa')) {
    // 4. Kawah: Batara Narada lowers Tetuka into the boiling Kawah Candradimuka
    const u = clamp((t - at('kawah')) / Math.max(0.1, at('tempa') - at('kawah')));
    stg.setTheme('kawah');
    K.lookStage(stg.camera, { pos: [0, 2.35, 11.6], target: [0, 1.4, 0], sway: 0.22, t });
    K.posePuppet(rama, t, {
      x: -1.8, y: 0, z: 0.2, face: 1,
      headYaw: 0.2, armR: 1.25, elbowR: -0.8, wave: 0.65,
    });
    gunungan.visible = true;
    gunungan.position.set(0.4, -1.2, -0.4);
    gunungan.rotation.y = t * 1.4;
    fireBank.userData.update(t, 0.85);
    K.golekPlaque(hud, 'TEMPAAN KAWAH CANDRADIMUKA', 'Jabang Tetuka Dimasukkan ke Kawah Membara', { alpha: prog(t, at('kawah') + 0.1, at('kawah') + 0.5) });

  } else if (t < at('bangkit')) {
    // 5. Tempa: Sacred weapons & metals forged into the roaring cauldron
    const u = clamp((t - at('tempa')) / Math.max(0.1, at('bangkit') - at('tempa')));
    stg.setTheme('kawah');
    K.lookStage(stg.camera, { pos: [Math.sin(t * 2) * 0.7, 2.4, 10.6], target: [0, 1.4, 0], sway: 0.32, t });
    gunungan.visible = true;
    gunungan.position.set(0, -1.0 + Math.sin(t * 8) * 0.15, 0);
    gunungan.rotation.y = t * 3.2;
    fireBank.userData.update(t, 1.25);
    K.golekPlaque(hud, 'LEBURNYA PUSAKA PARA DEWA', 'Besi, Tembaga & Baja Sakti Menyatu di Raga', { alpha: prog(t, at('tempa') + 0.1, at('tempa') + 0.5) });

  } else if (t < at('pusaka')) {
    // 6. Bangkit: Raden Gatotkaca emerges in full golden splendor!
    const u = clamp((t - at('bangkit')) / Math.max(0.1, at('pusaka') - at('bangkit')));
    stg.setTheme('kawah');
    const riseY = lerp(-0.9, 0.2, ease.outBack(clamp(u * 1.6), 1.5));
    K.lookStage(stg.camera, { pos: [0, 2.25, lerp(11.4, 9.4, u)], target: [0, 1.65, 0], sway: 0.2, t });
    K.posePuppet(gatotkaca, t, {
      x: 0, y: riseY, z: 0.5, face: 0,
      bob: 1.4, headYaw: Math.sin(t * 4.5) * 0.32,
      armL: 1.35, elbowL: -0.6, armR: 1.45, elbowR: -0.5,
      wave: 1.1,
    });
    fireBank.userData.update(t, 0.75);
    K.golekPlaque(hud, 'LAHIRNYA RADEN GATOTKACA', 'Satria Otot Kawat Tulang Besi!', { alpha: prog(t, at('bangkit') + 0.1, at('bangkit') + 0.5) });

  } else if (t < at('menang')) {
    // 7. Pusaka: Kotang Antakusuma & Caping Basunanda — Gatotkaca soaring in flight!
    const u = clamp((t - at('pusaka')) / Math.max(0.1, at('menang') - at('pusaka')));
    stg.setTheme('taman');
    const flyY = 0.55 + Math.sin(t * 3.5) * 0.35;
    K.lookStage(stg.camera, { pos: [lerp(-0.6, 0.6, u), 2.5, 10.2], target: [0, 1.9, 0], sway: 0.22, t });
    K.posePuppet(gatotkaca, t, {
      x: Math.sin(t * 2.2) * 0.55, y: flyY, z: 0.5, face: 0,
      bob: 1.6, twist: Math.sin(t * 3) * 0.25,
      headYaw: Math.cos(t * 4) * 0.3,
      armL: 1.1, elbowL: -0.4, armR: 1.5, elbowR: -0.3,
      wave: 1.0,
    });
    K.golekPlaque(hud, 'KOTANG ANTAKUSUMA & CAPING BASUNANDA', 'Terbang Secepat Kilat Membelah Angkasa', { alpha: prog(t, at('pusaka') + 0.1, at('pusaka') + 0.5) });

  } else if (t < at('moral')) {
    // 8. Menang: Aerial battle — Gatotkaca strikes down Kala Pracona!
    const u = clamp((t - at('menang')) / Math.max(0.1, at('moral') - at('menang')));
    stg.setTheme('alengka');
    K.lookStage(stg.camera, { pos: [0, 2.25, 11.4], target: [0, 1.5, 0], sway: 0.28, t });
    K.posePuppet(gatotkaca, t, {
      x: -1.35, y: 0.45 + Math.abs(Math.sin(t * 6)) * 0.4, z: 0.45, face: 1,
      bob: 1.8, headYaw: 0.25,
      armL: 1.2, armR: 1.55, elbowR: -0.4, wave: 1.5,
    });
    const fallY = -clamp((u - 0.55) * 2.2) * 1.4;
    K.posePuppet(buto, t, {
      x: 1.45, y: fallY, z: 0.2, face: -1,
      headYaw: Math.sin(t * 9) * 0.5,
      armL: 1.3, armR: 1.3, wave: 1.3,
    });
    K.golekPlaque(hud, 'TUMBANGNYA KALA PRACONA', 'Kedamaian Kembali ke Kahyangan & Pringgadani', { alpha: prog(t, at('menang') + 0.1, at('menang') + 0.5) });

  } else {
    // 9. Moral: Gatotkaca flanked by Semar & Dewi Arimbi under the golden Gunungan
    const u = clamp((t - at('moral')) / Math.max(0.1, AM.duration - at('moral')));
    stg.setTheme('sunda');
    K.lookStage(stg.camera, { pos: [0, 2.25, lerp(11.2, 12.5, ease.inOutSine(u))], target: [0, 1.5, 0], sway: 0.15, t });
    gunungan.visible = true;
    gunungan.position.set(0, -0.8, -1.8);
    gunungan.rotation.y = Math.sin(t * 0.8) * 0.12;
    K.posePuppet(sinta, t, { x: -1.9, y: 0, z: 0.2, face: 1, armR: 0.75, wave: 0.25 });
    K.posePuppet(gatotkaca, t, { x: 0, y: 0.15, z: 0.45, face: 0, headNod: 0.1, armL: 0.95, armR: 1.15, wave: 0.45 });
    K.posePuppet(semar, t, { x: 1.9, y: 0, z: 0.2, face: -1, armL: 0.75, wave: 0.25 });
    K.golekPlaque(hud, 'TEMPAAN MELAHIRKAN KETANGGUHAN', 'Falsafah Luhur Kawah Candradimuka', { alpha: prog(t, at('moral') + 0.1, at('moral') + 0.5) });
  }
  stg.render();
}
