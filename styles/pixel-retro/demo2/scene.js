// Pixel Retro demo2: "Kenapa Game Jadul 16-Bit Bikin Nagih?" — 10 shots (~55 s).
// Full 16-bit side-scroller & arcade journey: High Score, 3 Lives, Enemy Patterns,
// Secret Chests, Boss Fight, Game Over Continue, Couch Co-op, One More Level, Victory & Finale.
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

// Custom pixel sprites for arcade cabinet, controller, chest, spikes, trophy
const CHEST_CLOSED = [
  '.kkkkkkkkkk.',
  'kbbbbbbbbbbk',
  'kyyyyyyyyyyk',
  'kbbbbggbbbbk',
  'kbbbbggbbbbk',
  'kddddddddddk',
  'kkkkkkkkkkkk',
];
const CHEST_OPEN = [
  '.kkkkkkkkkk.',
  'kbbbbbbbbbbk',
  'kkkkkkkkkkkk',
  '.kyyyyyyyyk.',
  'kbbbbggbbbbk',
  'kddddddddddk',
  'kkkkkkkkkkkk',
];
const SPIKES = [
  '..k...k...k..',
  '.klk.klk.klk.',
  'klglklglklglk',
  'kkkkkkkkkkkkk',
];
const GAMEPAD = [
  '..kkkkkkkkkk..',
  '.kggggggggggk.',
  'kggwkggggryggk',
  'kgwwwkgggbgggk',
  'kggwkggggggggk',
  '.kggkkkkkkggk.',
  '..kk......kk..',
];
const TROPHY = [
  '.kyyyyyyyyk.',
  'kyywwwwyyyk.',
  'kyyyyyyyyyk.',
  '.kyyyyyyyk..',
  '..kkkykkk...',
  '...kyyyk....',
  '.kkyyyyykk..',
  'kkkkkkkkkkk.',
];

export async function setup(AM) {
  out = AM.layer('screen', { autoClear: false });
  S = K.makeScreen();
  g = S.g;
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('coin', W('hook', 'skor', 0.8), { gain: 0.35 });
  AM.sfx('jump', W('nyawa', 'lompatan', 1.2), { gain: 0.35 });
  AM.sfx('sword', W('pola', 'pola', 0.7), { gain: 0.4 });
  AM.sfx('powerup', W('rahasia', 'emas', 1.2), { gain: 0.42 });
  AM.sfx('stamp', W('bos', 'raja', 0.9), { gain: 0.45 });
  AM.sfx('impact', W('over', 'Game', 0.6), { gain: 0.48 });
  AM.sfx('coin', W('mabar', 'teman', 0.8), { gain: 0.35, pitch: 1.15 });
  AM.sfx('powerup', W('lanjut', 'level', 1.4), { gain: 0.4 });
  AM.sfx('coin', W('menang', 'kemenangan', 1.0), { gain: 0.4, pitch: 1.25 });
  AM.sfx('magic', W('akhir', 'resep', 1.1), { gain: 0.38 });
}

const pulse = (t, hz = 4) => Math.floor(t * hz) % 2 === 0;
const BIG = { color: P.white, outline: P.ink, shadow: P.dblue, align: 'center' };

const TONES = {
  day:   { sky: [P.blue, P.sky, P.sky2], haze: 'rgba(150,190,235,0.55)', cloud: 'day', mtn: '#83a9da', snow: '#b7d3f0' },
  dusk:  { sky: [P.night, P.purple, P.plum, P.rose, P.peach], haze: 'rgba(90,50,110,0.6)', cloud: 'dusk', mtn: '#6a3f78', snow: '#9a5a8a' },
  night: { sky: [P.ink, P.night, P.navy, P.dblue], haze: 'rgba(18,18,55,0.7)', cloud: 'night', mtn: '#232a5c', snow: '#2c3a74' },
};

function backdrop(t, sx, tone = 'day', { houses = true, palms = true, gstyle = 'grass' } = {}) {
  const T = TONES[tone];
  K.skyBands(g, T.sky, 0, GY, tone);
  if (tone !== 'day') K.stars(g, t, { n: tone === 'night' ? 40 : 16, y1: tone === 'night' ? 115 : 65 });
  for (let i = 0; i < 4; i++) {
    const x = ((i * 64 - sx * 0.08 - t * 3) % 230 + 230) % 230 - 40;
    K.cloud(g, x, 24 + (i * 19) % 44, { tone: T.cloud });
  }
  K.mountain(g, -10 - ((sx * 0.04) % 300), GY - 36, { col: T.mtn, snow: T.snow, w: 170, h: 40 });
  if (houses) {
    for (let i = -1; i < 3; i++) {
      const k = Math.floor(sx * 0.6 / 78) + i, x = Math.round(k * 78 - sx * 0.6), m3 = ((k % 3) + 3) % 3;
      K.blit(g, K.betawiHouse(((k % 4) + 4) % 4, tone === 'night' ? true : tone === 'dusk' ? 'dusk' : false), x, GY - 44);
      if (palms) K.blit(g, K.palm(Math.floor(t * 2 + k) % 2, 40 + m3 * 6), x + 52, GY - 50 - m3 * 6);
    }
  }
  K.ground(g, sx, GY, gstyle);
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// ================================================================
// SHOT 1 (hook): 16-Bit High Score Run — Coins & Honest Leaderboard
// ================================================================
shot('hook', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  const sx = (t - a) * 42;
  backdrop(t, sx, 'day');

  // Row of floating arcade coins
  for (let i = 0; i < 4; i++) {
    const ct = a + 0.5 + i * 0.65;
    const cx = 42 + i * 20;
    const cy = GY - 28 - (i % 2) * 10;
    if (t < ct) K.coin(g, cx, cy, t, { phase: i });
    else K.popup(g, '+200', cx, cy - 6, (t - ct) / 0.7, P.yellow);
  }

  const jumpU = clamp(((t - a) % 1.4) / 0.55);
  const jy = jumpU < 1 ? Math.round(Math.sin(jumpU * Math.PI) * 20) : 0;
  K.drawChar(g, 'pitung', jy > 2 ? 'jump' : K.cycle('run', t, 12), 44, GY - 1 - jy, { prop: 'golok' });

  // Scoreboard banner
  K.panel(g, 11, 20, 113, 38, { fill: P.night, inner: P.dblue, border: P.white });
  K.text(g, 'ERA 16-BIT', CX, 25, { color: P.yellow, align: 'center' });
  const tSkor = W('hook', 'skor', 1.4);
  if (t >= tSkor - 0.2) {
    K.text(g, 'HI-SCORE!', CX, 38, { scale: 2, color: pulse(t, 6) ? P.lime : P.white, outline: P.ink, align: 'center' });
  } else {
    K.tiny(g, 'INSERT COIN', CX, 41, { color: pulse(t, 4) ? P.white : P.lgrey, align: 'center' });
  }

  const score = Math.round(lerp(1200, 9800, ease.outCubic(u)));
  K.hud(g, { hp: 3, score, level: '1-1' });
});

// ================================================================
// SHOT 2 (nyawa): 3 Lives Only — Pit & Spikes Jump Challenge
// ================================================================
shot('nyawa', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  const sx = 220 + (t - a) * 32;
  backdrop(t, sx, 'day', { gstyle: 'cobble' });

  // Spike pit in the middle of the ground
  const pitX = 56;
  K.R(g, pitX, GY, 28, BH - GY, P.ink);
  const spk = K.sprite('spikes', SPIKES, { k: P.ink, l: P.lgrey, g: P.grey });
  K.blit(g, spk, pitX + 1, GY + 8);
  K.blit(g, spk, pitX + 14, GY + 8);

  // Hero runs and leaps over the spike pit
  const tJump = W('nyawa', 'lompatan', 1.4) - 0.25;
  const ju = clamp((t - tJump) / 0.85);
  const px = Math.round(lerp(22, 104, clamp((t - a) / (b - a - 0.3))));
  const air = px > pitX - 10 && px < pitX + 36;
  const airU = clamp((px - (pitX - 10)) / 46);
  const py = air ? GY - 1 - Math.round(Math.sin(airU * Math.PI) * 34) : GY - 1;

  K.drawChar(g, 'pitung', air ? (airU < 0.55 ? 'jump' : 'fall') : K.cycle('run', t, 12), px, py, { prop: 'golok' });
  if (ju > 0.1 && ju < 0.9) K.popup(g, 'AWAS!', pitX + 14, GY - 38, ju, P.red);

  // Big 3 Hearts Display
  K.panel(g, 14, 22, 107, 36, { fill: P.night, inner: P.dred, border: P.yellow });
  K.text(g, 'CUMA 3 NYAWA', CX, 27, { color: P.white, align: 'center' });
  for (let i = 0; i < 3; i++) {
    const hb = Math.round(Math.sin(t * 6 + i) * 1.5);
    K.heart(g, 42 + i * 20, 41 + hb, true);
  }
  K.tiny(g, 'NO AUTO-SAVE!', CX, 64, { color: P.yellow, outline: P.ink, align: 'center' });

  K.hud(g, { hp: 3, score: 12400 + Math.round(u * 2200), level: '1-2' });
});

// ================================================================
// SHOT 3 (pola): Enemy Attack Patterns & Pixel-Perfect Timing
// ================================================================
shot('pola', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  backdrop(t, 520, 'dusk', { gstyle: 'cobble', lamps: true });

  // Two Opas guards firing rhythmically in a pattern
  const cycleT = (t - a) % 1.2;
  const firing = cycleT > 0.5 && cycleT < 0.95;

  K.drawChar(g, 'opas', firing ? 'aim' : 'idle0', 104, GY - 1, { face: -1, prop: 'rifle' });
  if (firing) {
    const bu = (cycleT - 0.5) / 0.45;
    const bx = Math.round(lerp(84, 18, bu));
    K.R(g, bx, GY - 22, 5, 2, P.yellow);
    K.R(g, bx + 5, GY - 22, 2, 2, P.white);
  }

  // Player jumps right over the bullet on rhythm, then counter-slashes!
  const dodge = firing && cycleT > 0.62 && cycleT < 0.92;
  const dy = dodge ? Math.round(Math.sin(((cycleT - 0.62) / 0.3) * Math.PI) * 26) : 0;
  const counter = u > 0.68;
  const hx = counter ? Math.round(lerp(36, 78, clamp((u - 0.68) / 0.2))) : 36;
  K.drawChar(g, 'pitung', counter ? 'slash' : (dodge ? 'jump' : 'guard'), hx, GY - 1 - dy, { face: 1, prop: 'golok' });

  if (dodge) K.popup(g, 'DODGE!', 36, GY - 42, (cycleT - 0.62) / 0.3, P.lime);
  if (counter) K.popup(g, 'HIT!', 90, GY - 36, (u - 0.68) / 0.3, P.yellow);

  K.panel(g, 10, 22, 115, 29, { fill: P.night, inner: P.purple, border: P.white });
  K.text(g, 'HAFAL POLA MUSUH', CX, 27, { color: P.yellow, align: 'center' });
  K.tiny(g, 'TIMING PRESISI', CX, 39, { color: P.lteal, align: 'center' });

  K.hud(g, { hp: 3, score: 15800 + Math.round(u * 3000), level: '2-1' });
});

// ================================================================
// SHOT 4 (rahasia): Secret Zone & Hidden Treasure Chest Power-Up!
// ================================================================
shot('rahasia', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  backdrop(t, 880, 'night', { houses: false, gstyle: 'cobble' });

  // Brick dungeon / secret wall blocks
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      K.R(g, 70 + c * 12, GY - 48 + r * 12, 11, 11, (r + c) % 2 ? P.dblue : P.navy);
    }
  }

  const tOpen = W('rahasia', 'emas', 1.4) - 0.25;
  const opened = t >= tOpen;

  // Treasure chest
  const chestSpr = K.sprite(
    opened ? 'chest_o' : 'chest_c',
    opened ? CHEST_OPEN : CHEST_CLOSED,
    { k: P.ink, b: P.brown, d: P.dbrown, y: P.yellow, g: P.gold }
  );
  K.blit(g, chestSpr, 82, GY - 14, { scale: 2 });

  // Hero slashes chest open!
  const slashT = Math.abs(t - tOpen) < 0.2;
  K.drawChar(g, 'pitung', slashT ? 'slash' : (opened ? 'raise' : K.cycle('run', t, 10)), opened ? 56 : Math.round(lerp(24, 56, clamp(u * 2.2))), GY - 1, { face: 1, prop: 'golok' });

  if (opened) {
    const ou = clamp((t - tOpen) / 1.1);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI;
      const cx = 90 + Math.cos(ang) * ou * 28;
      const cy = GY - 18 - Math.sin(ang) * ou * 36;
      K.coin(g, cx, cy, t, { phase: i });
      K.sparkle(g, cx, cy - 4, t + i * 0.1, P.yellow);
    }
    K.popup(g, '1UP +1000', 88, GY - 42, ou, P.lime);
  }

  K.panel(g, 12, 22, 111, 28, { fill: P.night, inner: P.gold, border: P.white });
  K.text(g, 'ZONA RAHASIA!', CX, 27, { color: P.yellow, align: 'center' });
  K.tiny(g, opened ? 'ITEM LANGKA DITEMUKAN!' : 'CEK BALIK DINDING...', CX, 39, { color: P.white, align: 'center' });

  K.hud(g, { hp: 3, score: opened ? 24500 : 19200, level: '2-S' });
});

// ================================================================
// SHOT 5 (bos): Final Boss Warning & Giant Boss HP Bar
// ================================================================
shot('bos', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  const lt = t - a;
  K.skyBands(g, TONES.night.sky, 0, GY, 'night');
  K.stars(g, t, { n: 44, y1: 110 });
  K.sea(g, GY - 28, 28, t, { night: true });
  K.ground(g, 0, GY, 'pier');

  // Boss Schout Hinne firing spread shots
  const bossHp = clamp(1 - Math.max(0, u - 0.25) * 0.75);
  K.bossBar(g, 'RAJA TERAKHIR', bossHp, 18, { sub: 'STAGE BOSS' });

  K.drawChar(g, 'hinne', Math.floor(t * 4) % 2 ? 'aim' : 'idle0', 102, GY - 1, { face: -1, prop: 'pistol' });

  // Spread bullets flying left
  for (let i = 0; i < 3; i++) {
    const bu = ((t * 1.4 + i * 0.33) % 1);
    const bx = Math.round(lerp(88, 12, bu));
    const by = GY - 14 - i * 10;
    K.pcircle(g, bx, by, 3, P.red);
    K.pcircle(g, bx, by, 1, P.yellow);
  }

  // Hero jumping & slashing furiously
  const jy = Math.round(Math.abs(Math.sin(t * 7)) * 26);
  K.drawChar(g, 'pitung', jy > 12 ? 'slash' : 'jump', 34, GY - 1 - jy, { face: 1, prop: 'golok' });

  if (lt < 0.9) {
    const on = pulse(t, 8);
    K.R(g, 0, 56, BW, 22, on ? P.red : P.dred);
    K.text(g, 'WARNING! BOSS!', CX, 61, { scale: 1, color: P.yellow, outline: P.ink, align: 'center' });
  }

  K.hud(g, { hp: 2, score: 28400 + Math.round(u * 4000), level: '3-B' });
});

// ================================================================
// SHOT 6 (over): GAME OVER -> CONTINUE? 9.. 8.. YES!
// ================================================================
shot('over', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  g.fillStyle = P.ink;
  g.fillRect(0, 0, BW, BH);
  K.stars(g, t, { n: 34, y0: 10, y1: 165 });

  const tCoba = W('over', 'coba', 2.2) - 0.25;
  const revived = t >= tCoba;

  if (!revived) {
    K.drawDown(g, 'pitung', CX - 6, GY - 8);
  } else {
    K.drawChar(g, 'pitung', 'raise', CX, GY - 8, { face: 1, prop: 'golok' });
    for (let i = 0; i < 6; i++) K.sparkle(g, CX - 20 + i * 8, GY - 42 + (i % 2) * 8, t + i * 0.15, P.lime);
  }

  const go = a + 0.08;
  const red = { scale: 3, color: P.white, shadow: P.red, outline: P.dred, align: 'center' };
  K.text(g, 'GAME', CX, lerp(-30, 34, ease.outBounce(clamp((t - go) / 0.4))), red);
  K.text(g, 'OVER', CX, lerp(-30, 62, ease.outBounce(clamp((t - go - 0.08) / 0.4))), red);

  const countNum = Math.max(1, 9 - Math.floor((t - a) * 2.2));
  K.text(g, 'CONTINUE?', CX, 98, { color: P.yellow, outline: P.ink, align: 'center' });
  K.text(g, String(revived ? 'GO!' : countNum), CX, 112, { scale: 2, color: revived ? P.lime : P.white, outline: P.ink, align: 'center' });

  if (revived) {
    K.panel(g, 20, 134, 95, 16, { fill: P.dgreen, inner: P.lime, border: P.white });
    K.text(g, 'COBA LAGI!', CX, 138, { color: P.white, outline: P.ink, align: 'center' });
  }

  K.hud(g, { hp: revived ? 3 : 0, score: 32400, level: '3-B' });
});

// ================================================================
// SHOT 7 (mabar): 90s Living Room Couch Co-op with Friends!
// ================================================================
shot('mabar', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  backdrop(t, 1200, 'day');

  // Giant CRT TV & Gamepad icon in the sky area
  const pad = K.sprite('gamepad', GAMEPAD, { k: P.ink, g: P.lgrey, w: P.white, r: P.red, y: P.yellow, b: P.blue });
  K.panel(g, 14, 18, 107, 42, { fill: P.night, inner: P.dblue, border: P.white });
  K.blit(g, pad, 22, 26, { scale: 2 });
  K.text(g, '1P VS 2P', 82, 25, { color: P.yellow, align: 'center' });
  K.tiny(g, 'GILIRAN STIK!', 82, 39, { color: P.lime, align: 'center' });

  // Kids & villagers cheering around the player
  const friends = [
    ['anak', 24, 1],
    ['pitung', 58, 1],
    ['rakyat', 88, -1],
    ['anak', 110, -1],
  ];
  friends.forEach(([who, x, face], i) => {
    const j = Math.floor(t * 5 + i) % 2;
    const pose = who === 'pitung' ? K.cycle('run', t, 12) : (j ? 'cheerJ' : 'cheer');
    K.drawChar(g, who, pose, x, GY - 1 - (who === 'pitung' ? 0 : j * 3), { face, prop: who === 'pitung' ? 'golok' : null });
  });

  if (pulse(t, 3)) K.popup(g, 'AYO LOMPAT!', 92, GY - 42, (t % 0.8) / 0.8, P.yellow);

  K.hud(g, { hp: 3, score: 36800 + Math.round(u * 3200), level: '2P' });
});

// ================================================================
// SHOT 8 (lanjut): "One More Level!" — Stage Transition Gate
// ================================================================
shot('lanjut', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  const sx = 1600 + (t - a) * 55;
  backdrop(t, sx, 'dusk', { lamps: true });

  // Hero sprinting right into the next stage gate
  const px = Math.round(lerp(24, 96, ease.inOutQuad(u)));
  K.drawChar(g, 'pitung', K.cycle('run', t, 14), px, GY - 1, { prop: 'golok' });

  for (let i = 0; i < 6; i++) {
    K.sparkle(g, 20 + hrand(i, 3) * 95, GY - 55 + hrand(i, 4) * 40, t + i * 0.12, P.yellow);
  }

  K.text(g, 'STAGE CLEAR!', CX, 24, { ...BIG, scale: 2, color: P.lime, shadow: P.dgreen });
  const tSatu = W('lanjut', 'satu', 2.0) - 0.2;
  if (t >= tSatu) {
    const pop = ease.outBack(clamp((t - tSatu) / 0.35));
    g.save();
    g.translate(CX, 56);
    g.scale(Math.max(0.01, pop), Math.max(0.01, pop));
    K.panel(g, -54, -12, 108, 24, { fill: P.red, inner: P.yellow, border: P.white });
    K.text(g, '1 LEVEL LAGI!', 0, -5, { color: P.ink, align: 'center' });
    g.restore();
  }

  K.hud(g, { hp: 3, score: 42000 + Math.round(u * 5000), level: '4-1' });
});

// ================================================================
// SHOT 9 (menang): Boss Defeated & Coin Shower Victory!
// ================================================================
shot('menang', (t, a, b) => {
  const u = clamp((t - a) / (b - a));
  K.skyBands(g, TONES.night.sky, 0, GY, 'night');
  K.stars(g, t, { n: 45, y1: 120 });
  K.ground(g, 0, GY, 'grass');

  // Raining victory coins & fireworks sparkles
  for (let i = 0; i < 16; i++) {
    const cu = ((t - a) * 0.7 + i * 0.11) % 1;
    const cx = 12 + hrand(i, 5) * 110;
    const cy = 20 + cu * (GY - 26);
    K.coin(g, cx, cy, t, { phase: i });
  }
  for (let i = 0; i < 8; i++) {
    K.sparkle(g, 18 + hrand(i, 1) * 98, 26 + hrand(i, 2) * 70, t + i * 0.15, i % 2 ? P.yellow : P.lime);
  }

  // Trophy & victorious hero
  const trp = K.sprite('trophy', TROPHY, { k: P.ink, y: P.yellow, w: P.white });
  K.blit(g, trp, CX - 12, 66, { scale: 2 });

  K.drawChar(g, 'pitung', 'raise', CX, GY - 1, { face: 1, prop: 'golok' });
  K.drawChar(g, 'anak', 'cheerJ', 30, GY - 1, { face: 1 });
  K.drawChar(g, 'rakyat', 'cheerJ', 104, GY - 1, { face: -1 });

  K.text(g, 'VICTORY!', CX, 24, { scale: 2, color: P.yellow, outline: P.ink, shadow: P.dred, align: 'center' });
  K.tiny(g, 'SKILL MURNI 100%', CX, 46, { color: P.lime, outline: P.ink, align: 'center' });

  K.hud(g, { hp: 3, score: 99900, level: 'WIN' });
});

// ================================================================
// SHOT 10 (akhir): Timeless Formula Finale — High Score + 3 Lives + 1 More Level
// ================================================================
shot('akhir', (t, a, b) => {
  K.skyBands(g, TONES.night.sky, 0, GY, 'night');
  K.stars(g, t, { n: 50, y1: 130 });
  K.blit(g, K.betawiHouse(0, true), CX - 28, GY - 44);
  K.blit(g, K.palm(Math.floor(t * 2) % 2), 6, GY - 52);
  K.ground(g, 0, GY, 'grass');

  K.drawChar(g, 'pitung', 'raise', CX, GY - 43, { face: 1, prop: 'golok' });
  for (let i = 0; i < 6; i++) {
    K.sparkle(g, CX - 24 + i * 9, GY - 76 + (i % 2) * 6, t + i * 0.2, P.yellow);
  }

  K.panel(g, 8, 18, 119, 54, { fill: P.night, inner: P.dblue, border: P.yellow });
  K.text(g, 'RESEP NAGIH 16-BIT', CX, 24, { color: P.yellow, align: 'center' });
  K.tiny(g, '1. SKOR TINGGI JUJUR', CX, 37, { color: P.white, align: 'center' });
  K.tiny(g, '2. TIGA NYAWA BERHARGA', CX, 47, { color: P.lime, align: 'center' });
  K.tiny(g, '3. SATU LEVEL LAGI!', CX, 57, { color: P.orange, align: 'center' });

  K.hud(g, { msg: pulse(t, 2) ? 'PRESS START' : 'HIGH SCORE: 99999' });
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

