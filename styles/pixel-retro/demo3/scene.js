// Pixel Retro demo3: "Tamagotchi 90-an: Jangan Sampai Mati!" — 10 shots (~55 s).
// 90s virtual pet keychain mania: Egg Hatch, Feeding, Cleaning Poop & Sickness,
// Sneaking to School, Classroom Beep Panic, Graveyard Screen, Pen Reset, Rare Evolution & Phone Revival.
import * as K from '/styles/pixel-retro/kit.js';

const { clamp, lerp, ease, hrand } = AM.lib;
const P = K.PAL, BW = K.BW, BH = K.BH, GY = 166, CX = BW / 2;

export const meta = {
  fps: 24,
  captions: { preset: 'pixel', y: 1484, size: 38, maxWords: 4 },
};

let out, S, g;
const C = {};
const W = (id, w, fb = 0.25) => {
  const t = AM.wordTime(id, w);
  const l = C[id];
  return Number.isFinite(t) ? t : (l ? l.start + fb : fb);
};

export async function setup(AM) {
  out = AM.layer('screen', { autoClear: false });
  S = K.makeScreen();
  g = S.g;
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('coin', W('hook', 'gantungan', 1.2), { gain: 0.35 });
  AM.sfx('powerup', W('tetas', 'menetas', 1.4), { gain: 0.4 });
  AM.sfx('coin', W('makan', 'nasi', 1.2), { gain: 0.35, pitch: 1.15 });
  AM.sfx('impact', W('bersih', 'sakit', 1.5), { gain: 0.38 });
  AM.sfx('jump', W('sekolah', 'tas', 1.6), { gain: 0.32 });
  AM.sfx('stamp', W('bunyi', 'panik', 1.8), { gain: 0.45 });
  AM.sfx('impact', W('lupa', 'nisan', 1.5), { gain: 0.45, pitch: 0.8 });
  AM.sfx('powerup', W('reset', 'pulpen', 1.3), { gain: 0.38 });
  AM.sfx('magic', W('evolusi', 'berevolusi', 0.9), { gain: 0.42 });
  AM.sfx('coin', W('akhir', 'hidup', 1.4), { gain: 0.38, pitch: 1.2 });
}

const pulse = (t, hz = 4) => Math.floor(t * hz) % 2 === 0;

// Tamagotchi egg shell + LCD bezel + 3 buttons + keychain
function tamagotchiBody(g, x, y, t, { shell = P.pink, inner = P.skinL, btnActive = -1 } = {}) {
  // Keychain chain & ring at top
  K.pcircle(g, x, y - 44, 5, P.grey);
  K.pcircle(g, x, y - 44, 2, P.ink);
  K.R(g, x - 1, y - 40, 2, 5, P.lgrey);

  // Outer egg-shaped shell
  K.pelipse(g, x, y - 2, 31, 38, P.ink);
  K.pelipse(g, x, y - 2, 29, 36, shell);
  K.pelipse(g, x - 2, y - 4, 25, 31, inner);

  // Cracked jagged bezel frame
  K.R(g, x - 22, y - 26, 44, 38, P.dgrey);
  K.R(g, x - 20, y - 24, 40, 34, '#b8d8a0');

  // LCD pixel grid subtle lines
  for (let row = 0; row < 34; row += 4) {
    K.R(g, x - 20, y - 24 + row, 40, 1, 'rgba(70,100,60,0.12)');
  }

  // Three iconic A-B-C buttons below screen
  const bCols = [0, 1, 2].map((i) => (btnActive === i ? P.white : P.yellow));
  K.pcircle(g, x - 12, y + 19, 3, P.ink);
  K.pcircle(g, x - 12, y + 19, 2, bCols[0]);
  K.pcircle(g, x, y + 22, 3, P.ink);
  K.pcircle(g, x, y + 22, 2, bCols[1]);
  K.pcircle(g, x + 12, y + 19, 3, P.ink);
  K.pcircle(g, x + 12, y + 19, 2, bCols[2]);
}

// 8x8 Pixel Pet sprites for LCD screen
const PET = {
  egg: [
    '...kk...',
    '..kwwk..',
    '.kwppwk.',
    '.kwwwwk.',
    'kwwppwwk',
    'kwwwwwwk',
    '.kwwwwk.',
    '..kkkk..',
  ],
  happy: [
    '..kkkk..',
    '.kyyyyk.',
    'kyyyyyyk',
    'kywkkywk',
    'kyyyyyyk',
    '.kykkyk.',
    '..k..k..',
    '........',
  ],
  eat: [
    '..kkkk..',
    '.kyyyyk.',
    'kyyyyyyk',
    'kywkkywk',
    'kyykkkyk',
    '.kyyyyyk',
    '..k..k..',
    '........',
  ],
  sick: [
    '..kkkk..',
    '.kggggk.',
    'kggggggk',
    'kgxkkxgk',
    'kggggggk',
    '.kgkkkg.',
    '..k..k..',
    '........',
  ],
  king: [
    '.kykyky.',
    '.kkkkkk.',
    'kyyyyyyk',
    'kywkkywk',
    'kyyyyyyk',
    'kyyyyyyk',
    '.kk..kk.',
    '........',
  ],
  grave: [
    '..kkkk..',
    '.kggggk.',
    'kggkkggk',
    'kgkkkkGk',
    'kggkkggk',
    'kggggggk',
    'kkkkkkkk',
    '........',
  ],
};

const PET_MAP = {
  k: '#1c2c18',
  w: P.white,
  p: P.pink,
  y: P.yellow,
  g: P.lgrey,
  G: P.grey,
  x: P.red,
};

function drawPet(g, x, y, state, scale = 3, t = 0) {
  const rows = PET[state] || PET.happy;
  const bounce = state === 'happy' || state === 'king' ? Math.round(Math.sin(t * 6) * 2) : 0;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[0].length; c++) {
      const col = PET_MAP[rows[r][c]];
      if (!col) continue;
      K.R(g, x + c * scale, y + r * scale + bounce, scale, scale, col);
    }
  }
}

function drawPoop(g, x, y) {
  K.R(g, x + 2, y, 4, 2, '#3a2818');
  K.R(g, x + 1, y + 2, 6, 2, '#5c3c20');
  K.R(g, x, y + 4, 8, 3, '#3a2818');
}

function drawOnigiri(g, x, y) {
  K.R(g, x + 2, y, 4, 2, P.white);
  K.R(g, x + 1, y + 2, 6, 3, P.white);
  K.R(g, x, y + 5, 8, 3, P.white);
  K.R(g, x + 2, y + 5, 4, 3, P.ink);
}

function tamagotchiHUD(g, hunger, happy, label = 'STATISTIK') {
  K.R(g, 0, 0, BW, 15, P.ink);
  K.R(g, 0, 15, BW, 1, P.night);
  K.tiny(g, 'LAPAR', 3, 2, { color: P.lgrey });
  K.R(g, 3, 8, 48, 5, P.dgrey);
  K.R(g, 3, 8, Math.round(48 * clamp(hunger)), 5, hunger < 0.3 ? P.red : hunger < 0.6 ? P.orange : P.lime);

  K.tiny(g, 'SENANG', 58, 2, { color: P.lgrey });
  K.R(g, 58, 8, 48, 5, P.dgrey);
  K.R(g, 58, 8, Math.round(48 * clamp(happy)), 5, happy < 0.3 ? P.red : happy < 0.6 ? P.yellow : P.lteal);

  K.tiny(g, label, 110, 5, { color: P.yellow });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// ================================================================
// SHOT 1 (hook): 1990s Keychain Pet Craze — Floating Tamagotchi
// ================================================================
shot('hook', (t, a, b) => {
  K.skyBands(g, [P.blue, P.sky, P.sky2], 0, GY, 'day');
  K.cloud(g, 16, 26, { tone: 'day' });
  K.cloud(g, 82, 38, { tone: 'day' });
  K.ground(g, t * 20, GY, 'grass');

  const rise = ease.outBack(clamp((t - a) / 0.55));
  const ty = Math.round(lerp(BH + 30, 106, rise) + Math.sin(t * 3) * 2);
  tamagotchiBody(g, CX, ty, t, { btnActive: Math.floor(t * 3) % 3 });
  drawPet(g, CX - 12, ty - 18, 'happy', 3, t);

  for (let i = 0; i < 5; i++) {
    K.sparkle(g, CX - 36 + i * 18, ty - 38 + (i % 2) * 14, t + i * 0.2, P.yellow);
  }

  K.text(g, 'TREN 1990-AN', CX, 18, { color: P.yellow, outline: P.ink, shadow: P.dred, align: 'center' });
  K.text(g, 'TAMAGOTCHI', CX, 31, { scale: 2, color: P.white, outline: P.ink, shadow: P.dblue, align: 'center' });
  K.hud(g, { msg: pulse(t, 2) ? 'GANTUNGAN KUNCI AJAIB' : 'ERA 90-AN' });
});

// ================================================================
// SHOT 2 (tetas): Shaking Pixel Egg Hatches into Baby Pet!
// ================================================================
shot('tetas', (t, a, b) => {
  K.skyBands(g, [P.sky, P.sky2, P.cloud], 0, GY, 'day');
  K.ground(g, 0, GY, 'grass');

  const tHatch = W('tetas', 'menetas', 1.8) - 0.15;
  const hatched = t >= tHatch;
  const shake = !hatched ? Math.round(Math.sin(t * 28) * 2) : 0;

  tamagotchiBody(g, CX + shake, 104, t, { shell: P.lteal, inner: P.white });
  drawPet(g, CX - 12 + shake, 86, hatched ? 'happy' : 'egg', 3, t);

  if (hatched) {
    const hu = clamp((t - tHatch) / 0.7);
    K.popup(g, 'MENETAS!', CX, 68, hu, P.lime);
    for (let i = 0; i < 6; i++) K.sparkle(g, CX - 24 + i * 10, 78 + (i % 2) * 16, t + i * 0.1, P.yellow);
  } else {
    K.tiny(g, 'KRTAK.. KRTAK..', CX, 68, { color: P.ink, align: 'center' });
  }

  tamagotchiHUD(g, hatched ? 0.5 : 0.2, hatched ? 0.8 : 0.4, 'LV.1');
});

// ================================================================
// SHOT 3 (makan): Pressing A-B-C Buttons to Feed Onigiri & Candy
// ================================================================
shot('makan', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  K.skyBands(g, [P.blue, P.sky, P.sky2], 0, GY, 'day');
  K.ground(g, 0, GY, 'grass');

  const eating = u > 0.32;
  tamagotchiBody(g, CX, 104, t, { btnActive: Math.floor(t * 6) % 3 });
  drawPet(g, CX - 16, 86, eating ? 'eat' : 'happy', 3, t);

  // Onigiri rice ball inside LCD screen
  if (eating) {
    const foodY = Math.round(lerp(82, 92, (t * 2) % 1));
    drawOnigiri(g, CX + 6, foodY);
    K.heart(g, CX + 6, 78, true);
  }

  const hunger = lerp(0.25, 0.95, ease.outCubic(u));
  const happy = lerp(0.45, 0.95, ease.outCubic(u));
  tamagotchiHUD(g, hunger, happy, 'MAKAN');

  K.panel(g, 16, 22, 103, 22, { fill: P.night, inner: P.dgreen, border: P.white });
  K.text(g, eating ? 'NYAM! KENYANG!' : 'PILIH MENU: MAKAN', CX, 29, { color: P.lime, align: 'center' });
});

// ================================================================
// SHOT 4 (bersih): Poop Piles Up & Flashing Skull Sickness Alert!
// ================================================================
shot('bersih', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  K.skyBands(g, [P.purple, P.plum, P.rose], 0, GY, 'dusk');
  K.ground(g, 0, GY, 'cobble');

  tamagotchiBody(g, CX, 104, t, { shell: P.orange, inner: P.yellow });
  drawPet(g, CX - 14, 86, 'sick', 3, t);

  // Poop sprites in the corners of the LCD screen
  drawPoop(g, CX + 8, 98);
  if (u > 0.35) drawPoop(g, CX + 8, 88);

  // Flashing warning alert icon
  if (pulse(t, 5)) {
    K.alert(g, CX - 16, 78);
    K.R(g, 18, 22, 99, 20, P.red);
    K.text(g, 'AWAS SAKIT!', CX, 28, { color: P.white, outline: P.ink, align: 'center' });
  }

  tamagotchiHUD(g, 0.2, 0.15, 'SAKIT!');
});

// ================================================================
// SHOT 5 (sekolah): Sneaking Tamagotchi to School Behind the Backpack!
// ================================================================
shot('sekolah', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  K.skyBands(g, [P.blue, P.sky, P.sky2], 0, GY, 'day');
  K.blit(g, K.dutchHall(null, 'day'), 18, GY - 70);
  K.ground(g, t * 25, GY, 'cobble');

  // Kids walking to school with backpack & sneaking Tamagotchi
  const kx = Math.round(lerp(24, 62, u));
  K.drawChar(g, 'anak', K.cycle('walk', t, 8), kx, GY - 1, { face: 1 });
  K.drawChar(g, 'anak', K.cycle('walk', t + 0.3, 8), kx - 20, GY - 1, { face: 1 });

  // Mini Tamagotchi zoom-in panel above backpack
  K.panel(g, 68, 52, 56, 66, { fill: P.night, inner: P.dblue, border: P.yellow });
  tamagotchiBody(g, 96, 86, t);
  drawPet(g, 84, 70, 'happy', 2, t);

  K.panel(g, 10, 18, 115, 24, { fill: P.night, inner: P.purple, border: P.white });
  K.text(g, 'MISI RAHASIA SEKOLAH', CX, 23, { color: P.yellow, align: 'center' });
  K.tiny(g, 'SEMBUNYI DI BALIK TAS!', CX, 33, { color: P.white, align: 'center' });
});

// ================================================================
// SHOT 6 (bunyi): "TIT-TIT!" Loud Beep in Silent Classroom Panic!
// ================================================================
shot('bunyi', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  K.skyBands(g, [P.sky, P.sky2, P.cloud], 0, GY, 'day');
  K.ground(g, 0, GY, 'cobble');

  const tBeep = W('bunyi', 'bunyi', 1.2) - 0.15;
  const beeping = t >= tBeep;
  const shake = beeping && pulse(t, 12) ? 2 : 0;

  // Teacher / adult looking around & kids panicking
  K.drawChar(g, 'tuan', beeping ? 'point' : 'idle0', 28, GY - 1, { face: 1 });
  K.drawChar(g, 'anak', beeping ? 'hurt' : 'idle0', 84, GY - 1, { face: -1 });
  K.drawChar(g, 'anak', beeping ? 'cheerJ' : 'idle0', 106, GY - 1, { face: -1 });

  tamagotchiBody(g, CX + shake, 92, t, { shell: P.red, inner: P.orange });
  drawPet(g, CX - 12 + shake, 74, 'sick', 3, t);

  if (beeping) {
    K.alert(g, 84, GY - 36);
    K.alert(g, 106, GY - 36);
    if (pulse(t, 6)) {
      K.text(g, 'TIT! TIT! TIT!', CX, 24, { scale: 2, color: P.red, outline: P.ink, shadow: P.yellow, align: 'center' });
    }
    K.popup(g, 'PANIK!', 84, GY - 46, (t - tBeep) % 0.7, P.red);
  } else {
    K.text(g, 'KELAS HENING...', CX, 28, { color: P.ink, align: 'center' });
  }
});

// ================================================================
// SHOT 7 (lupa): Forgot for One Day -> Heartbreaking Graveyard LCD!
// ================================================================
shot('lupa', (t, a, b) => {
  K.skyBands(g, [P.ink, P.night, P.navy], 0, GY, 'night');
  K.stars(g, t, { n: 36, y1: 115 });
  K.ground(g, 0, GY, 'cobble');

  tamagotchiBody(g, CX, 106, t, { shell: P.dblue, inner: P.grey });
  drawPet(g, CX - 12, 88, 'grave', 3, t);

  // Little pixel ghost floating up from the tombstone
  const gy = Math.round(86 - ((t - a) * 10) % 22);
  K.pcircle(g, CX + 10, gy, 4, P.white);
  K.R(g, CX + 9, gy - 1, 1, 1, P.ink);
  K.R(g, CX + 11, gy - 1, 1, 1, P.ink);

  tamagotchiHUD(g, 0, 0, 'MATI..');
  K.text(g, 'LUPA SEHARI...', CX, 24, { color: P.lgrey, outline: P.ink, align: 'center' });
  K.text(g, 'TINGGAL NISAN', CX, 38, { scale: 2, color: P.red, outline: P.ink, align: 'center' });
});

// ================================================================
// SHOT 8 (reset): Poking the Back Reset Button with a Ballpoint Pen!
// ================================================================
shot('reset', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  K.skyBands(g, [P.night, P.purple, P.plum], 0, GY, 'dusk');
  K.ground(g, 0, GY, 'grass');

  // Back of Tamagotchi shell with recessed RESET button
  K.pelipse(g, CX, 102, 31, 38, P.ink);
  K.pelipse(g, CX, 102, 29, 36, P.pink);
  K.R(g, CX - 16, 88, 32, 28, P.skinL);
  K.pcircle(g, CX, 102, 4, P.dgrey);
  K.pcircle(g, CX, 102, 2, P.ink);
  K.tiny(g, 'RESET', CX, 90, { color: P.ink, align: 'center' });

  // Ballpoint pen tip poking the reset button
  const poke = ease.inOutQuad(clamp(Math.sin(u * Math.PI * 2)));
  const px = Math.round(lerp(CX + 26, CX + 2, poke));
  const py = Math.round(lerp(126, 102, poke));
  g.fillStyle = P.white; K.pline(g, px, py, px + 28, py + 28, 5);
  g.fillStyle = P.ink; K.pline(g, px, py, px + 6, py + 6, 3);

  if (u > 0.45) {
    K.popup(g, 'LAHIR BARU!', CX, 64, (u - 0.45) / 0.55, P.lime);
    for (let i = 0; i < 6; i++) K.sparkle(g, CX - 24 + i * 10, 74 + (i % 2) * 18, t + i * 0.15, P.yellow);
  }

  K.panel(g, 12, 20, 111, 26, { fill: P.night, inner: P.dblue, border: P.white });
  K.text(g, 'TOMBOL RESET KECIL', CX, 25, { color: P.yellow, align: 'center' });
  K.tiny(g, 'TUSUK PAKAI UJUNG PULPEN', CX, 36, { color: P.white, align: 'center' });
});

// ================================================================
// SHOT 9 (evolusi): Disciplined Care -> Crowned King Pet Evolution!
// ================================================================
shot('evolusi', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  K.skyBands(g, [P.blue, P.sky, P.sky2], 0, GY, 'day');
  K.ground(g, 0, GY, 'grass');

  tamagotchiBody(g, CX, 96, t, { shell: P.gold, inner: P.yellow });
  drawPet(g, CX - 12, 78, 'king', 3, t);

  for (let i = 0; i < 8; i++) {
    K.sparkle(g, 20 + i * 14, 58 + (i % 3) * 18, t + i * 0.12, i % 2 ? P.yellow : P.white);
  }

  // Cheering kids admiring the rare evolution
  K.drawChar(g, 'anak', 'cheerJ', 22, GY - 1, { face: 1 });
  K.drawChar(g, 'anak', 'cheerJ', 112, GY - 1, { face: -1 });

  tamagotchiHUD(g, 1.0, 1.0, 'MAX!');
  K.text(g, 'EVOLUSI LANGKA!', CX, 24, { scale: 1, color: P.yellow, outline: P.ink, shadow: P.dred, align: 'center' });
  K.popup(g, 'LEVEL MAX!', CX, 46, u, P.lime);
});

// ================================================================
// SHOT 10 (akhir): Modern Smartphone Revival — "Jangan Sampai Mati Lagi!"
// ================================================================
shot('akhir', (t, a, b) => {
  K.skyBands(g, [P.ink, P.night, P.navy], 0, GY, 'night');
  K.stars(g, t, { n: 45, y1: 130 });
  K.ground(g, 0, GY, 'grass');

  // Modern smartphone side-by-side with classic keychain Tamagotchi
  // Left: Classic 90s Egg
  tamagotchiBody(g, 38, 108, t, { shell: P.pink, inner: P.skinL });
  drawPet(g, 26, 90, 'happy', 3, t);

  // Right: Modern Smartphone body
  K.R(g, 74, 66, 44, 78, P.lgrey);
  K.R(g, 76, 70, 40, 68, P.dblue);
  K.R(g, 80, 76, 32, 52, '#b8d8a0');
  drawPet(g, 84, 88, 'king', 3, t);
  for (let i = 0; i < 3; i++) {
    K.heart(g, 82 + i * 10, 78 - Math.round(Math.sin(t * 4 + i) * 2), true);
  }

  K.panel(g, 8, 16, 119, 36, { fill: P.night, inner: P.dgreen, border: P.yellow });
  K.text(g, 'NOSTALGIA ABADI', CX, 22, { color: P.yellow, align: 'center' });
  K.text(g, 'JANGAN MATI LAGI!', CX, 36, { color: pulse(t, 4) ? P.lime : P.white, align: 'center' });

  K.hud(g, { msg: pulse(t, 2) ? 'PRESS START' : 'TAMAGOTCHI FOREVER' });
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]) || SHOTS[0];
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);

  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.imageSmoothingEnabled = false;
  s.fn(t, Math.max(0, a), b);
  g.setTransform(1, 0, 0, 1, 0, 0);

  const since = t - Math.max(0, a);
  if (s.id !== 'hook' && since < 0.2) {
    K.mosaic(g, Math.round(lerp(8, 1, since / 0.2)));
  }
  K.present(out, S.c, { dx: 0, dy: 0 });
}

