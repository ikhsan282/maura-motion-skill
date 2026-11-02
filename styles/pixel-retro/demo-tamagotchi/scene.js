// Tamagotchi 90-an demo — pixel-retro style.
// 5 lines, ~20-40s. Tamagotchi pet with hunger/happiness HUD.
import * as K from '/styles/pixel-retro/kit.js';
const { clamp, lerp, ease, hrand } = AM.lib;
const P = K.PAL, BW = K.BW, BH = K.BH, CX = BW / 2;

// Tamagotchi device body (rounded rect at centre)
function tamagotchiBody(g, x, y, t) {
  // outer shell
  K.R(g, x - 28, y - 36, 56, 72, P.pink);
  K.R(g, x - 26, y - 34, 52, 68, P.skinL);
  // screen bezel
  K.R(g, x - 22, y - 30, 44, 42, P.dgrey);
  // LCD screen
  K.R(g, x - 20, y - 28, 40, 38, '#b8d8a0');
  // top button row
  K.R(g, x - 10, y + 16, 6, 6, P.red);
  K.R(g, x + 4, y + 16, 6, 6, P.lime);
  K.R(g, x - 10, y + 24, 6, 5, P.navy);
  K.R(g, x + 4, y + 24, 6, 5, P.navy);
  // keychain ring
  K.pcircle(g, x, y - 38, 5, P.grey);
  K.pcircle(g, x, y - 38, 3, P.lgrey);
}

// Pet blob — simple 8x8 sprite drawn pixel by pixel
const PET = {
  happy: [
    '..yyyy..',
    '.yyyyyy.',
    'yyyyyyyy',
    'yywbbwy',
    'yyyyyyy.',
    '.y.yy..',
    '..yyyy..',
    '.......',
  ],
  neutral: [
    '..yyyy..',
    '.yyyyyy.',
    'yyyyyyyy',
    'yywbbwy',
    'yyyyyyy.',
    '.yyyyy..',
    '..yyyy..',
    '.......',
  ],
  hungry: [
    '..yyyy..',
    '.yyyyyy.',
    'yyyyyyyy',
    'yywbbwy',
    '.yyyyy..',
    '..y.y...',
    '..yyyy..',
    '.......',
  ],
  dead: [
    '..yyyy..',
    '.yyyyyy.',
    'yyyyyyyy',
    'yynnbby',
    '.yyyyy..',
    '..yyyy..',
    '..yyyy..',
    '.......',
  ],
};
const PET_MAP = { y: P.yellow, w: P.white, b: P.black, n: P.dred };

function drawPet(g, x, y, mood, scale = 3, t = 0) {
  const rows = PET[mood];
  const pw = rows[0].length, ph = rows.length;
  // bounce offset
  const bounce = mood === 'happy' ? Math.round(Math.sin(t * 5) * 2) : 0;
  for (let r = 0; r < ph; r++) {
    for (let c = 0; c < pw; c++) {
      const col = PET_MAP[rows[r][c]];
      if (!col) continue;
      K.R(g, x + c * scale, y + r * scale + bounce, scale, scale, col);
    }
  }
}

// HUD bar: hunger + happiness meters
function tamagotchiHUD(g, hunger, happy, t) {
  // top bar
  K.R(g, 0, 0, BW, 14, P.ink);
  K.R(g, 0, 14, BW, 1, P.night);
  // hunger label
  K.tiny(g, 'LAPAR', 2, 2, { color: P.lgrey, outline: P.ink });
  // hunger bar
  const hb = Math.round(50 * clamp(hunger, 0, 1));
  K.R(g, 2, 7, 50, 5, P.ink);
  K.R(g, 2, 7, hb, 5, hunger < 0.3 ? P.red : hunger < 0.6 ? P.orange : P.lime);
  // happy label
  K.tiny(g, 'SENANG', 54, 2, { color: P.lgrey, outline: P.ink });
  // happy bar
  const sb = Math.round(50 * clamp(happy, 0, 1));
  K.R(g, 54, 7, 50, 5, P.ink);
  K.R(g, 54, 7, sb, 5, happy < 0.3 ? P.dblue : happy < 0.6 ? P.blue : P.lteal);
  // bottom bar
  K.R(g, 0, BH - 10, BW, 10, P.ink);
  K.R(g, 0, BH - 11, BW, 1, P.night);
  K.tiny(g, 'TAMAGOTCHI', CX, BH - 7, { color: P.lgrey, align: 'center', outline: P.ink });
}

// Menu buttons (A/B/C)
function drawButtons(g, x, y, t) {
  const pulse = Math.sin(t * 4) > 0;
  K.R(g, x - 16, y, 8, 6, pulse ? P.red : P.dred);
  K.R(g, x + 8, y, 8, 6, P.navy);
}

// Poop sprite (when neglected)
const POOP = [
  '..yyyy..',
  '.yyyyyy.',
  'yyyyyyyy',
  'yyyyyyyy',
  '.yyyyyy.',
  '..yyyy..',
  '.yyyyy..',
  '.......',
];

function drawPoop(g, x, y, scale = 2) {
  for (let r = 0; r < POOP.length; r++) {
    for (let c = 0; c < POOP[0].length; c++) {
      if (POOP[r][c] === 'y') K.R(g, x + c * scale, y + r * scale, scale, scale, P.dbrown);
    }
  }
}

// Heart icon
function drawHeart(g, x, y) {
  K.heart(g, x, y, true);
}
const pulse = (t, hz = 4) => Math.floor(t * hz) % 2 === 0;

export const meta = { fps: 24, captions: { preset: 'pixel', y: 1484, size: 38, maxWords: 5 } };

let out, S, g;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  out = AM.layer('screen', { autoClear: false });
  S = K.makeScreen(); g = S.g;
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const BIG = { color: P.white, outline: P.ink, shadow: P.dblue, align: 'center' };

const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// ---------- shots ----------

// 1. Hook — Tamagotchi on keychain, title card
shot('hook', (t, a, b) => {
  // sky gradient
  K.skyBands(g, [P.sky, P.sky2, P.cloud], 0, BH, 'day');
  // decorative clouds
  K.cloud(g, 20, 20, { tone: 'day' });
  K.cloud(g, 80, 35, { tone: 'day' });

  // Tamagotchi device centred
  const rise = ease.outCubic(clamp(t / 0.5));
  const ty = lerp(BH + 20, BH / 2 - 10, rise);
  tamagotchiBody(g, CX, ty, t);
  // pet inside screen
  const scrX = CX - 20, scrY = ty - 28;
  g.save();
  g.beginPath();
  g.rect(scrX, scrY, 40, 38);
  g.clip();
  drawPet(g, scrX + 4, scrY + 4, 'happy', 3, t);
  g.restore();
  // outline the screen
  K.R(g, scrX - 1, scrY - 1, 42, 40, P.ink);

  // title
  const titleT = W('hook', 'peliharaan') - 0.15;
  if (t > titleT) {
    const slide = ease.outBack(clamp((t - titleT) / 0.3));
    K.text(g, 'TAMAGOTCHI', Math.round(lerp(BW + 60, CX, slide)), 18,
      { color: P.yellow, scale: 2, outline: P.ink, shadow: P.dred, align: 'center' });
  }
  const subtitleT = W('hook', 'gantungan') - 0.15;
  if (t > subtitleT) {
    const slide = ease.outCubic(clamp((t - subtitleT) / 0.25));
    K.text(g, 'DI GANTUNGAN KUNCI', Math.round(lerp(-60, CX, slide)), 38,
      { color: P.white, scale: 1, outline: P.ink, align: 'center' });
  }
  K.hud(g, { msg: pulse(t, 2) ? 'PRESS START' : ' ' });
});

// 2. Makan — feeding scene, hunger bar drops
shot('makan', (t, a, b) => {
  K.skyBands(g, [P.sky, P.sky2, P.cloud], 0, BH, 'day');
  K.cloud(g, 30, 25, { tone: 'day' });
  K.cloud(g, 100, 40, { tone: 'day' });

  // device
  tamagotchiBody(g, CX, BH / 2 - 5, t);
  const scrX = CX - 20, scrY = BH / 2 - 35;

  // hunger drops over time — starts full, drains
  const hunger = clamp(1 - t / (b - a) * 0.8);
  const mood = hunger < 0.3 ? 'hungry' : hunger < 0.7 ? 'neutral' : 'happy';
  const bounce = mood === 'happy' ? Math.round(Math.sin(t * 5) * 2) : 0;

  g.save();
  g.beginPath();
  g.rect(scrX, scrY, 40, 38);
  g.clip();
  drawPet(g, scrX + 4, scrY + 4 + bounce, mood, 3, t);
  g.restore();
  K.R(g, scrX - 1, scrY - 1, 42, 40, P.ink);

  // food icon floating in
  const feedT = W('makan', 'Harus');
  if (t > feedT) {
    const ft = t - feedT;
    const fx = lerp(BW + 20, CX + 30, ease.outCubic(clamp(ft / 0.4)));
    const fy = lerp(BH / 2 - 80, BH / 2 - 30, ease.outBounce(clamp(ft / 0.5)));
    // food sprite
    K.blit(g, K.sack(), Math.round(fx), Math.round(fy));
  }

  tamagotchiHUD(g, hunger, clamp(0.6 + Math.sin(t * 2) * 0.3), t);

  // caption area
  K.R(g, 0, BH - 28, BW, 18, 'rgba(0,0,0,0.5)');
});

// 3. Lupa — neglect, poop appears, pet sad
shot('lupa', (t, a, b) => {
  K.skyBands(g, [P.dblue, P.night, P.navy], 0, BH, 'night');
  K.stars(g, t, { n: 20, y1: 100 });

  tamagotchiBody(g, CX, BH / 2 - 5, t);
  const scrX = CX - 20, scrY = BH / 2 - 35;

  const hunger = clamp(0.15 + Math.sin(t * 0.8) * 0.05);
  const mood = hunger < 0.2 ? 'hungry' : 'neutral';

  g.save();
  g.beginPath();
  g.rect(scrX, scrY, 40, 38);
  g.clip();
  drawPet(g, scrX + 4, scrY + 4, mood, 3, t);
  // poop
  drawPoop(g, scrX - 10, scrY + 20, 2);
  drawPoop(g, scrX + 28, scrY + 14, 2);
  g.restore();
  K.R(g, scrX - 1, scrY - 1, 42, 40, P.ink);

  // sad alert
  if (pulse(t, 3)) {
    K.R(g, BW - 20, 18, 14, 10, P.red);
    K.text(g, '!', BW - 13, 16, { color: P.white, scale: 1.5, align: 'center' });
  }

  tamagotchiHUD(g, hunger, clamp(0.1 + Math.sin(t * 1.5) * 0.05), t);
  // warning flash
  if (Math.floor(t * 4) % 2 === 0) K.grade(g, { dark: 0.15 });
});

// 4. Main — kid brings Tamagotchi to school, sneaking
shot('main', (t, a, b) => {
  K.skyBands(g, [P.sky, P.sky2, P.cloud], 0, BH, 'day');
  K.ground(g, 0, BH - 30, 'grass');

  // backpack
  K.blit(g, K.sack(), CX - 12, BH - 52);
  K.text(g, 'BAG', CX, BH - 48, { color: P.brown, scale: 1, align: 'center' });

  // Tamagotchi peeking from bag
  const scrX = CX - 8, scrY = BH - 58;
  tamagotchiBody(g, CX - 4, BH - 38, t);
  // tiny pet
  const hunger = clamp(0.5 + Math.sin(t * 1.5) * 0.2);
  const mood = hunger < 0.3 ? 'hungry' : 'happy';
  drawPet(g, scrX + 2, scrY + 2, mood, 2, t);

  // sneaky eyes peeking
  K.R(g, CX - 6, BH - 74, 4, 3, P.skin);
  K.R(g, CX + 2, BH - 74, 4, 3, P.skin);
  K.R(g, CX - 5, BH - 73, 2, 2, P.black);
  K.R(g, CX + 3, BH - 73, 2, 2, P.black);

  tamagotchiHUD(g, hunger, clamp(0.7 + Math.sin(t * 2) * 0.2), t);

  // caption area
  K.R(g, 0, BH - 28, BW, 18, 'rgba(0,0,0,0.5)');
});

// 5. Akhir — pet revived on phone, nostalgia
shot('akhir', (t, a, b) => {
  const fin = W('akhir', 'nostalgianya') - 0.3;
  if (t > fin) {
    // finale fade
    K.skyBands(g, [P.ink, P.night, P.navy], 0, BH, 'night');
    K.stars(g, t, { n: 50, y1: 180 });
    const alpha = clamp((t - fin) / 0.5);
    K.grade(g, { dark: alpha * 0.4 });
    // revival text
    if (t > fin + 0.2) {
      const pulse2 = Math.sin((t - fin) * 6) > 0;
      K.text(g, 'TETAP HIDUP', CX, BH / 2 - 20,
        { color: pulse2 ? P.lime : P.green, scale: 2, outline: P.ink, align: 'center' });
      K.tiny(g, 'DI HAPE', CX, BH / 2 + 8, { color: P.lgrey, outline: P.ink, align: 'center' });
    }
    K.hud(g, { msg: pulse(t, 2) ? 'PRESS START' : ' ' });
    return;
  }

  // phone screen
  K.skyBands(g, [P.sky, P.sky2, P.cloud], 0, BH, 'day');
  // phone body
  K.R(g, CX - 22, BH / 2 - 50, 44, 80, P.grey);
  K.R(g, CX - 20, BH / 2 - 48, 40, 76, P.lgrey);
  K.R(g, CX - 18, BH / 2 - 44, 36, 60, P.dblue);

  // pet on phone
  const scrX = CX - 16, scrY = BH / 2 - 42;
  const hunger = clamp(0.8 + Math.sin(t * 1.2) * 0.1);
  const mood = 'happy';
  drawPet(g, scrX + 2, scrY + 4, mood, 2, t);

  // hearts floating
  for (let i = 0; i < 3; i++) {
    const hx = scrX + 4 + i * 8;
    const hy = scrY - 8 - Math.round(Math.sin(t * 3 + i) * 4);
    drawHeart(g, hx, hy);
  }

  tamagotchiHUD(g, hunger, clamp(0.9 + Math.sin(t * 2) * 0.05), t);

  // caption area
  K.R(g, 0, BH - 28, BW, 18, 'rgba(0,0,0,0.5)');
});

// ---------- render ----------
export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.imageSmoothingEnabled = false;
  s.fn(t, Math.max(0, a), b);
  g.setTransform(1, 0, 0, 1, 0, 0);
  // mosaic transition
  const since = t - Math.max(0, a);
  if (s.id !== 'hook' && since < 0.2)
    K.mosaic(g, Math.round(lerp(8, 1, since / 0.2)));
  K.present(out, S.c, { dx: 0, dy: 0 });
}
