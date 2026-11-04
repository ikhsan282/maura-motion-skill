// Pixel Retro demo: "Si Pitung: Level Batavia" — a 16-bit side-scroller in 5 screens (~18.6 s).
// Screen: 135x240 buffer shown at x8. Ground line GY; captions sit on the dirt below it.
import * as K from '/styles/pixel-retro/kit.js';
const { clamp, lerp, ease, hrand } = AM.lib;
const P = K.PAL, BW = K.BW, BH = K.BH, GY = 166, CX = BW / 2;

export const meta = { fps: 24, captions: { preset: 'pixel', y: 1484, size: 38, maxWords: 4 } };

let out, S, g;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
// hook timing (seconds): coins picked up, jump over the crate
const COINS = [0.7, 1.0, 1.3, 2.95], JUMP = 2.55;
export async function setup(AM) {
  out = AM.layer('screen', { autoClear: false });
  S = K.makeScreen(); g = S.g;
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('coin', COINS[0], { gain: 0.35 });
  AM.sfx('jump', JUMP + 0.05, { gain: 0.35 });
  AM.sfx('stamp', W('hook', 'nomor') - 0.05, { gain: 0.4 });
  AM.sfx('sword', hitBagi(), { gain: 0.45 });
  AM.sfx('coin', W('bagi', 'membagikannya'), { gain: 0.35, pitch: 1.2 });
  AM.sfx('impact', W('kebal', 'ditembak'), { gain: 0.45 });
  AM.sfx('powerup', W('kebal', 'bangkit'), { gain: 0.4 });
  AM.sfx('magic', W('boss', 'peluru') - 0.15, { gain: 0.4 });
  AM.sfx('impact', C.akhir.start - 0.05, { gain: 0.45, pitch: 0.8 });
}
const hitBagi = () => Math.max(W('bagi', 'tuan'), C.bagi.start + 0.7);

// ---------- world helpers ----------
const TONES = {
  day: { sky: [P.blue, P.sky, P.sky2], haze: 'rgba(150,190,235,0.55)', cloud: 'day', mtn: '#83a9da', snow: '#b7d3f0' },
  dusk: { sky: [P.night, P.purple, P.plum, P.rose, P.peach], haze: 'rgba(90,50,110,0.6)', cloud: 'dusk', mtn: '#6a3f78', snow: '#9a5a8a' },
  night: { sky: [P.ink, P.night, P.navy, P.dblue], haze: 'rgba(18,18,55,0.7)', cloud: 'night', mtn: '#232a5c', snow: '#2c3a74' },
};
function moon(x, y) { K.pcircle(g, x, y, 9, '#f3ecc8'); K.pcircle(g, x + 3, y - 3, 2, '#d9d0a6'); K.pcircle(g, x - 4, y + 3, 2, '#d9d0a6'); }
function backdrop(t, sx, tone = 'day', { houses = true, far = true, palms = true, lamps = false, gstyle = 'grass' } = {}) {
  const T = TONES[tone];
  K.skyBands(g, T.sky, 0, GY, tone);
  if (tone !== 'day') K.stars(g, t, { n: tone === 'night' ? 40 : 14, y1: tone === 'night' ? 120 : 60 });
  for (let i = 0; i < 4; i++) {
    const x = ((i * 64 - sx * 0.08 - t * 3) % 230 + 230) % 230 - 40;
    K.cloud(g, x, 24 + (i * 19) % 44, { tone: T.cloud });
  }
  K.mountain(g, -10 - ((sx * 0.04) % 300), GY - 36, { col: T.mtn, snow: T.snow, w: 170, h: 40 });
  if (far) for (let i = -1; i < 3; i++) {
    const k = Math.floor(sx * 0.25 / 160) + i, x = Math.round(k * 160 - sx * 0.25), yb = GY - 20;
    if (k % 2 === 0) K.blit(g, K.dutchHall(T.haze, tone), x, yb - 70);
    else for (let j = 0; j < 4; j++) K.blit(g, K.canalHouse(j + k, T.haze), x + j * 22 + 30, yb - 52 + (j % 2) * 6);
  }
  if (houses) for (let i = -1; i < 3; i++) {
    const k = Math.floor(sx * 0.6 / 78) + i, x = Math.round(k * 78 - sx * 0.6), m3 = ((k % 3) + 3) % 3;
    K.blit(g, K.betawiHouse(((k % 4) + 4) % 4, tone === 'night' ? true : tone === 'dusk' ? 'dusk' : false), x, GY - 44);
    if (palms) K.blit(g, K.palm(Math.floor(t * 2 + k) % 2, 40 + m3 * 6), x + 52, GY - 50 - m3 * 6);
  }
  K.ground(g, sx, GY, gstyle);
  if (lamps) for (let i = -1; i < 3; i++) {
    const k = Math.floor(sx / 100) + i, x = Math.round(k * 100 - sx) + 30;
    if (tone !== 'day') K.lampGlow(g, x + 4, GY - 30, 14);
    K.blit(g, K.lamp(tone !== 'day'), x, GY - 36);
  }
}
function harbour(t) {
  K.skyBands(g, TONES.night.sky, 0, GY, 'night');
  K.stars(g, t, { n: 46, y1: 110 });
  moon(106, 44);
  K.sea(g, GY - 30, 30, t, { night: true });
  for (let i = 0; i < 3; i++) K.blit(g, K.ship(i, true), i * 52 - 10, GY - 62 + (Math.floor(t * 1.5 + i) % 2));
  K.ground(g, 0, GY, 'pier');
}
const pulse = (t, hz = 4) => Math.floor(t * hz) % 2 === 0;
function scoreAt(t) {
  let s = 0;
  for (const ct of COINS) if (t >= ct) s += 100;
  const b0 = hitBagi();
  if (t > b0) s += Math.round(ease.outCubic(clamp((t - b0) / 2.4)) * 9600);
  return s;
}
const BIG = { color: P.white, outline: P.ink, shadow: P.dblue, align: 'center' };

// ---------- shots ----------
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };

// 1. LEVEL 1: Pitung runs through Batavia, grabs coins, jumps a crate; opas give chase.
const SPD = 40, PXP = 50;
shot('hook', (t, a, b) => {
  const sx = 20 + t * SPD, worldAt = (tt) => 20 + tt * SPD + PXP;
  backdrop(t, sx, 'day');
  K.blit(g, K.crate(), worldAt(JUMP + 0.38) - sx - 5, GY - 11);
  COINS.forEach((ct, i) => {
    const dy = i === 3 ? -34 : -12;
    if (t < ct) K.coin(g, worldAt(ct) - sx + 1, GY + dy, t, { phase: i });
    else K.popup(g, '+100', PXP, GY + dy - 8, (t - ct) / 0.7);
  });
  const jt = clamp((t - JUMP) / 0.75), air = jt > 0 && jt < 1;
  const jy = air ? Math.round(Math.sin(jt * Math.PI) * 30) : 0;
  K.drawChar(g, 'pitung', air ? (jt < 0.55 ? 'jump' : 'fall') : K.cycle('run', t, 12), PXP, GY - 1 - jy, { prop: 'golok' });
  if (t > JUMP + 0.75 && t < JUMP + 1.05) K.puff(g, PXP - 4, GY - 2, (t - JUMP - 0.75) / 0.3);
  const ob = W('hook', 'Buronan') - 0.2;
  if (t > ob) for (let i = 0; i < 2; i++) {
    const x = lerp(-30 - i * 22, 22 - i * 18, ease.outCubic(clamp((t - ob - i * 0.15) / 0.8)));
    K.drawChar(g, 'opas', K.cycle('run', t + i * 0.13, 12), x, GY - 1, { prop: 'rifle' });
    if (pulse(t, 5)) K.alert(g, x + 2, GY - 34);
  }
  // titles
  K.text(g, 'LEVEL 1', Math.round(lerp(BW + 90, CX, ease.outBack(clamp((t + 0.3) / 0.5)))), 22, { ...BIG, scale: 2 });
  const bt = W('hook', 'Batavia') - 0.12;
  if (t > bt) {
    K.text(g, 'BATAVIA', Math.round(lerp(-90, CX, ease.outCubic(clamp((t - bt) / 0.25)))), 42, { ...BIG, scale: 2, color: P.yellow, shadow: P.dred });
    K.tiny(g, 'TAHUN 1890-AN', CX, 61, { color: P.white, outline: P.ink, align: 'center' });
  }
  const nt = W('hook', 'nomor') - 0.08;
  if (t > W('hook', 'Buronan') - 0.08) {
    const s = ease.outBack(clamp((t - W('hook', 'Buronan') + 0.08) / 0.22), 2.5);
    g.save(); g.translate(CX, 88); g.scale(Math.max(0.01, s), Math.max(0.01, s));
    K.panel(g, -46, -17, 92, 34, { fill: P.yellow, inner: P.gold, border: P.ink });
    K.text(g, 'BURONAN', 0, -12, { color: P.red, align: 'center' });
    if (t > nt) K.text(g, 'NO.1', 0, -2, { scale: 2, color: pulse(t, 6) ? P.red : P.dred, align: 'center', shadow: P.dgold });
    g.restore();
  }
  const pt = W('hook', 'Si') - 0.08;
  if (t > pt) {
    const y = GY - 46 - jy + (pulse(t, 3) ? 0 : 1);
    K.panel(g, PXP - 30, y - 9, 60, 13, { fill: P.night, inner: P.red, border: P.white });
    K.text(g, 'PITUNG', PXP, y - 6, { color: P.yellow, align: 'center' });
    K.R(g, PXP - 1, y + 4, 3, 2, P.white);
  }
  K.hud(g, { hp: 3, score: scoreAt(t), level: '1-1' });
});

// 2. Robs the landlord's pile, then the camera pans to the kampung where the coins rain down.
shot('bagi', (t, a, b) => {
  const hit = hitBagi();
  const pan = ease.inOutCubic(clamp((t - W('bagi', 'lalu') + 0.2) / 1.0));
  const sx = Math.round(lerp(0, 150, pan));
  backdrop(t, 1400 + sx, 'day', { houses: false, far: false, gstyle: 'cobble' });
  g.save(); g.translate(-sx, 0);
  K.blit(g, K.dutchHall(null, 'mansion'), 58, GY - 70);
  for (let i = 0; i < 3; i++) K.blit(g, K.betawiHouse(i + 1), 150 + i * 58, GY - 44);
  if (t < hit) for (let i = 0; i < 7; i++) K.blit(g, K.moneyBag(), 112 + (i % 3) * 7 - (i > 2 ? 3 : 0), GY - 9 - Math.floor(i / 3) * 7);
  else K.blit(g, K.moneyBag(), 124, GY - 9);
  const tk = clamp((t - hit) / 0.5);
  K.drawChar(g, 'tuan', t > hit ? 'hurt' : (Math.floor(t * 3) % 2 ? 'point' : 'idle0'), 98 + tk * 14, GY - 1 - Math.round(Math.sin(tk * Math.PI) * 8), { face: -1, prop: t > hit ? null : 'cane' });
  if (t < hit) K.tiny(g, 'TUAN TANAH', 98, GY - 33, { color: P.white, outline: P.ink, align: 'center' });
  if (t > hit) K.blit(g, K.sprite('hat', ['.hhh.', '.hhh.', 'hhhhh'], { h: P.black }, { outline: P.ink }), 104 + tk * 30, GY - 40 + tk * 20 + Math.sin(tk * 6) * 4);
  const dropP = clamp((t - a) / 0.5);
  let px = lerp(72, 84, dropP), py = lerp(GY - 42, GY - 1, ease.inQuad(dropP)), pose = dropP < 1 ? 'fall' : 'guard';
  if (t > hit - 0.22) pose = t < hit ? 'windup' : t < hit + 0.35 ? 'slash' : 'guard';
  if (pan > 0) { px = lerp(84, 210, pan); pose = pan < 1 ? K.cycle('run', t, 12) : 'cheer'; }
  K.drawChar(g, 'pitung', pose, px, py, { face: 1, prop: pan >= 1 ? null : 'golok' });
  if (t > hit && t < hit + 0.1) K.R(g, 96, GY - 26, 18, 18, P.white);
  if (t > hit) for (let i = 0; i < 18; i++) {
    const u = (t - hit) - i * 0.03; if (u < 0 || u > 1.4) continue;
    const x = 116 + (hrand(i, 3) - 0.3) * 70 * u, y = GY - 14 + (-60 - hrand(i, 4) * 50) * u + 90 * u * u;
    if (y < GY - 2) K.coin(g, x, y, t, { phase: i });
  }
  if (pan > 0.3) {
    for (let i = 0; i < 16; i++) {
      const u = t - (W('bagi', 'membagikannya') - 0.3 + i * 0.09); if (u < 0) continue;
      const x = 160 + hrand(i, 7) * 120, y = 20 + u * 110;
      if (y < GY - 22) K.coin(g, x, y, t, { phase: i }); else K.popup(g, '+1', x, GY - 30, (y - GY + 22) / 40, P.lime);
    }
    [['rakyat', 168], ['ibu', 188], ['anak', 230], ['rakyat', 250], ['ibu', 270]].forEach(([n, x], i) => {
      const j = Math.floor(t * 4 + i) % 2;
      K.drawChar(g, n, j ? 'cheerJ' : 'cheer', x, GY - 1 - j * 4, { face: i % 2 ? -1 : 1 });
    });
  }
  g.restore();
  if (t < hit + 0.4) { K.text(g, 'TARGET:', CX, 26, { color: P.white, align: 'center', outline: P.ink }); K.text(g, 'TUAN TANAH', CX, 37, { color: P.yellow, align: 'center', outline: P.ink }); }
  if (pan > 0.6) { K.panel(g, 10, 24, 115, 17, { fill: P.night, inner: P.dgreen }); K.text(g, 'UNTUK RAKYAT', CX, 29, { color: P.lime, align: 'center' }); }
  K.hud(g, { hp: 3, score: scoreAt(t), level: '1-2' });
});

// 3. Shot, falls... and gets back up (ilmu kebal, says the legend).
shot('kebal', (t, a, b) => {
  backdrop(t, 3300, 'dusk', { gstyle: 'cobble', lamps: true });
  const s0 = W('kebal', 'ditembak'), fallT = W('kebal', 'jatuh'), up = W('kebal', 'bangkit');
  const shots = [s0, s0 + 0.18, s0 + 0.36];
  const hits = shots.filter((x) => t > x + 0.1).length;
  for (let i = 0; i < 2; i++) {
    const x = 100 + i * 20;
    K.drawChar(g, 'opas', 'aim', x, GY - 1, { face: -1, prop: 'rifle' });
    if (shots.some((s) => t > s && t < s + 0.1)) { K.R(g, x - 20, GY - 22, 4, 3, P.yellow); K.R(g, x - 22, GY - 21, 2, 1, P.white); }
    if (t > up + 0.2 && pulse(t, 6)) K.alert(g, x + 2, GY - 36);
  }
  shots.forEach((s) => { const u = (t - s) / 0.1; if (u > 0 && u < 1) K.R(g, lerp(76, 42, u), GY - 21, 4, 1, P.yellow); });
  let hp = 3 - hits;
  if (t < fallT) {
    K.drawChar(g, 'pitung', hits ? 'hurt' : 'guard', 36 - hits * 2, GY - 1, { face: 1, prop: 'golok', flash: shots.some((s) => t > s + 0.08 && t < s + 0.17) });
  } else if (t < up) {
    K.drawDown(g, 'pitung', 30, GY - 1, { face: 1 });
    K.puff(g, 28, GY - 2, (t - fallT) / 0.4); K.puff(g, 44, GY - 2, (t - fallT) / 0.45);
    hp = 0;
  } else {
    const u = clamp((t - up) / 0.4);
    K.drawChar(g, 'pitung', u < 0.4 ? 'guard' : 'raise', 34, GY - 1, { face: 1, prop: 'golok', alpha: u < 1 && pulse(t, 14) ? 0.4 : 1 });
    hp = Math.min(3, Math.floor(clamp((t - up) / 0.6) * 3.99));
    for (let i = 0; i < 6; i++) K.sparkle(g, 18 + hrand(i, 3) * 34, GY - 40 + hrand(i, 4) * 36, t + i * 0.1);
    K.text(g, 'KEBAL!', CX, 50, { ...BIG, scale: 2, color: [P.yellow, P.white, P.orange][Math.floor(t * 12) % 3], shadow: P.dred });
    K.popup(g, '1UP', 34, GY - 40, (t - up - 0.2) / 0.8, P.lime);
  }
  if (t < s0) { K.panel(g, 10, 26, 115, 28, { fill: P.night, inner: P.purple }); K.text(g, 'KONON...', CX, 31, { color: P.lgrey, align: 'center' }); K.text(g, 'KEBAL PELURU?', CX, 42, { color: P.yellow, align: 'center' }); }
  K.hud(g, { hp, score: scoreAt(t), level: '2-2' });
});

// 4. WARNING -> the final boss Schout Hinne on the harbour -> slow-motion golden bullet.
const PISTOL = ['.....kkkkkkkkkkkkkk', '....kggggggggggggk.', '...kgglllllllllllgk', '..kggggggggggggggk.', '.kbbbbkggk.........', 'kbbbbbbkk..........', 'kbbbbbbk...........', 'kbbbbbbk...........', '.kbbbbk............'];
function goldenBullet(t, ft) {
  K.skyBands(g, [P.ink, P.night, P.purple], 0, BH, 'slow');
  K.streaks(g, t, { col: P.navy, speed: 60, y1: 165 });
  K.streaks(g, t + 3, { col: P.purple, speed: 40, n: 14, seed: 9, y1: 165 });
  const spr = K.sprite('pistol', PISTOL, { k: P.ink, g: P.lgrey, l: P.white, b: P.brown });
  g.save(); g.imageSmoothingEnabled = false; g.translate(BW + 6, 74); g.scale(-4, 4); g.drawImage(spr, 0, 0); g.restore();
  const u = t - ft, bx = Math.round(60 - u * 26), by = 80;
  for (let i = 0; i < 10; i++) K.sparkle(g, bx + 10 + i * 6 + hrand(i, 2) * 4, by + (hrand(i, 3) - 0.5) * 10, t + i * 0.07, i % 2 ? P.yellow : P.gold);
  K.R(g, bx, by - 3, 10, 7, P.ink); K.R(g, bx - 3, by - 2, 4, 5, P.ink);
  K.R(g, bx + 1, by - 2, 9, 5, P.gold); K.R(g, bx - 2, by - 1, 3, 3, P.yellow); K.R(g, bx + 1, by - 2, 9, 1, P.yellow);
  if (u < 0.12) K.pcircle(g, 70, 80, 8, P.yellow);
  K.text(g, 'MENURUT LEGENDA', CX, 30, { color: P.lgrey, align: 'center' });
  const c = [P.yellow, P.gold, P.white][Math.floor(t * 10) % 3];
  K.text(g, 'PELURU', CX, 112, { scale: 2, color: c, outline: P.ink, shadow: P.dgold, align: 'center' });
  K.text(g, 'EMAS', CX, 132, { scale: 2, color: c, outline: P.ink, shadow: P.dgold, align: 'center' });
  K.tiny(g, 'SLOW', 4, 158, { color: pulse(t, 2) ? P.red : P.dred });
}
shot('boss', (t, a, b) => {
  const lt = t - a, ft = W('boss', 'peluru') - 0.2;
  if (t > ft) return goldenBullet(t, ft);
  harbour(t);
  const walk = clamp((lt - 0.45) / 0.9);
  K.drawChar(g, 'hinne', walk < 1 ? K.cycle('walk', t, 6) : (t > W('boss', 'dengan') - 0.1 ? 'aim' : 'idle0'), lerp(160, 100, walk), GY - 1, { face: -1, prop: 'pistol' });
  K.drawChar(g, 'pitung', 'guard', 32, GY - 1, { face: 1, prop: 'golok' });
  const nt = W('boss', 'Schout') - 0.15;
  if (t > nt) K.bossBar(g, 'SCHOUT HINNE', ease.outCubic(clamp((t - nt) / 0.6)), 20, { sub: 'POLISI BELANDA' });
  if (lt < 0.85) {
    const on = pulse(t, 6);
    for (const [y, str] of [[56, 'WARNING'], [94, 'BOS!']]) {
      K.R(g, 0, y, BW, 26, on ? P.red : P.dred);
      g.fillStyle = P.ink; for (let x = -20; x < BW; x += 12) { const xx = x + Math.floor(t * 60) % 12; K.pline(g, xx, y, xx + 5, y + 5, 2); }
      K.R(g, 0, y + 6, BW, 14, on ? P.dred : P.red);
      K.text(g, str, CX, y + 6, { scale: 2, color: str === 'BOS!' ? P.yellow : P.white, outline: P.ink, align: 'center' });
    }
  }
  K.hud(g, { hp: 3, score: scoreAt(t), level: '3-B' });
});

// 5. Hit -> 1893, GAME OVER... the letters crumble -> the legend lives on (PRESS START).
function finale(t, a) {
  K.skyBands(g, TONES.night.sky, 0, GY, 'night');
  K.stars(g, t, { n: 46 });
  moon(108, 84);
  const rise = ease.outCubic(clamp((t - a) / 0.5));
  K.blit(g, K.betawiHouse(0, true), CX - 28, GY - 44 + Math.round((1 - rise) * 30));
  K.blit(g, K.palm(Math.floor(t * 2) % 2), 4, GY - 52);
  K.ground(g, 0, GY, 'grass');
  K.drawChar(g, 'pitung', 'raise', CX, GY - 43 + Math.round((1 - rise) * 30), { face: 1, prop: 'golok' });
  for (let i = 0; i < 6; i++) K.sparkle(g, CX - 22 + i * 9, GY - 76 + (i % 2) * 6, t + i * 0.2);
  K.text(g, 'SI PITUNG', CX, 24, { color: P.white, outline: P.ink, align: 'center' });
  K.text(g, 'LEGENDA', Math.round(lerp(-90, CX, ease.outBack(clamp((t - a) / 0.35)))), 36, { scale: 2, color: P.yellow, outline: P.ink, shadow: P.dred, align: 'center' });
  K.tiny(g, 'BETAWI', CX, 56, { color: P.white, outline: P.ink, align: 'center' });
  K.hud(g, { msg: pulse(t, 2) ? 'PRESS START' : ' ' });
}
shot('akhir', (t, a, b) => {
  const fin = W('akhir', 'legendanya') - 0.25;
  if (t > fin) return finale(t, fin);
  const hitT = a + 0.05, fallT = a + 0.35, br = W('akhir', 'Di') - 0.05;
  const red = { scale: 4, color: P.white, shadow: P.red, outline: P.dred, align: 'center' };
  if (t < br) {
    harbour(t);
    K.drawChar(g, 'hinne', 'aim', 100, GY - 1, { face: -1, prop: 'pistol' });
    if (t < fallT) K.drawChar(g, 'pitung', 'hurt', 32, GY - 1, { face: 1, prop: 'golok', flash: t < hitT + 0.12 });
    else { K.drawDown(g, 'pitung', 26, GY - 1); K.puff(g, 28, GY - 2, (t - fallT) / 0.4); }
    K.hud(g, { hp: t > fallT ? 0 : 1, score: scoreAt(t), level: '3-B' });
    K.grade(g, { gray: clamp((t - fallT) / 0.5), dark: clamp((t - fallT) / 0.5) * 0.35 });
    K.text(g, '1893', CX, 128, { scale: 2, color: P.lgrey, outline: P.ink, align: 'center' });
  } else { g.fillStyle = P.ink; g.fillRect(0, 0, BW, BH); K.stars(g, t, { n: 30, y0: 10, y1: 165 }); }
  const go = a + 0.1;
  [['GAME', 54], ['OVER', 92]].forEach(([w, y], wi) => {
    if (t < br) { K.text(g, w, CX, lerp(-40, y, ease.outBounce(clamp((t - go - wi * 0.08) / 0.4))), red); return; }
    for (let i = 0; i < 4; i++) {
      const u = Math.max(0, (t - br) - (i * 0.05 + wi * 0.08));
      const yy = y + 16 + u * u * 300;
      if (yy > 260) continue;
      g.save(); g.translate(CX - 48 + i * 32, Math.round(yy)); g.rotate(u * (i % 2 ? 3 : -3));
      K.text(g, w[i], 0, -16, red); g.restore();
    }
  });
  if (t > br) {
    K.text(g, 'CONTINUE?', CX, 132, { color: P.yellow, outline: P.ink, align: 'center' });
    K.text(g, 'YA', 50, 146, { scale: 2, color: pulse(t, 6) ? P.white : P.lime, align: 'center' });
    K.text(g, 'TIDAK', 100, 150, { color: P.dgrey, align: 'center' });
    const u = clamp((t - br) / 0.4);
    if (u < 1) K.coin(g, CX, lerp(-10, 120, ease.inQuad(u)), t); else K.popup(g, 'LEGEND MODE', CX, 40, (t - br - 0.4) / 1.2, P.lime);
  }
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.imageSmoothingEnabled = false;
  s.fn(t, Math.max(0, a), b);
  g.setTransform(1, 0, 0, 1, 0, 0);
  // SNES-style mosaic on every cut (and into the finale)
  const since = t - Math.max(0, a);
  if (s.id !== 'hook' && since < 0.2) K.mosaic(g, Math.round(lerp(8, 1, since / 0.2)));
  const fin = W('akhir', 'legendanya') - 0.25;
  if (t > fin && t < fin + 0.2) K.mosaic(g, Math.round(lerp(8, 1, (t - fin) / 0.2)));
  let dx = 0, dy = 0;
  for (const [st, d] of [[hitBagi(), 0.3], [W('kebal', 'ditembak'), 0.5], [W('kebal', 'jatuh'), 0.25], [C.akhir.start, 0.35], [W('hook', 'nomor'), 0.15]])
    if (t > st && t < st + d) { dx = Math.round((hrand(Math.floor(t * 24), 1) - 0.5) * 4); dy = Math.round((hrand(Math.floor(t * 24), 2) - 0.5) * 3); }
  K.present(out, S.c, { dx, dy });
}
