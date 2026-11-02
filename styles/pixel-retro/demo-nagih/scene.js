// Pixel Retro demo-nagih: "Kenapa Game Jadul Bikin Nagih" — 5 shots, HUD skor+nyawa+level.
import * as K from '/styles/pixel-retro/kit.js';
const { clamp, lerp, ease, hrand } = AM.lib;
const P = K.PAL, BW = K.BW, BH = K.BH, GY = 166, CX = BW / 2;
export const meta = { fps: 24, captions: { preset: 'pixel', y: 1484, size: 38, maxWords: 4 } };
let out, S, g;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const COINS = [0.7, 1.0, 1.3];
export async function setup(AM) {
  out = AM.layer('screen', { autoClear: false });
  S = K.makeScreen(); g = S.g;
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('coin', COINS[0], { gain: 0.35 });
  AM.sfx('coin', COINS[1], { gain: 0.35 });
  AM.sfx('impact', W('over', 'Game') - 0.05, { gain: 0.45 });
  AM.sfx('powerup', W('lagi', 'level') - 0.05, { gain: 0.4 });
  AM.sfx('coin', W('akhir', 'Skor') - 0.05, { gain: 0.35, pitch: 1.2 });
}
const pulse = (t, hz = 4) => Math.floor(t * hz) % 2 === 0;
const BIG = { color: P.white, outline: P.ink, shadow: P.dblue, align: 'center' };
function scoreAt(t, base = 0, rate = 1200, t0 = 0) {
  let s = base;
  for (const ct of COINS) if (t >= ct) s += 100;
  if (t > t0) s += Math.round(ease.outCubic(clamp((t - t0) / 2.4)) * rate);
  return s;
}
function backdrop(t, sx, tone = 'day') {
  K.skyBands(g, tone === 'night' ? [P.ink, P.night, P.navy, P.dblue] : [P.blue, P.sky, P.sky2], 0, GY, tone);
  if (tone === 'night') K.stars(g, t, { n: 40, y1: 100 });
  for (let i = 0; i < 4; i++) K.cloud(g, ((i * 64 - sx * 0.08 - t * 3) % 230 + 230) % 230 - 40, 24 + (i * 19) % 44, { tone: tone === 'night' ? 'night' : 'day' });
  K.ground(g, sx, GY, 'grass');
}
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
// 1. hook: skor tinggi
shot('hook', (t, a, b) => {
  backdrop(t, t * 40, 'day');
  COINS.forEach((ct, i) => {
    if (t < ct) K.coin(g, 50 + i * 18, GY - 30, t, { phase: i });
    else K.popup(g, '+100', 50 + i * 18, GY - 40, (t - ct) / 0.7);
  });
  K.drawChar(g, 'pitung', K.cycle('run', t, 12), 50, GY - 1, { prop: 'golok' });
  K.text(g, 'SKOR TINGGI', CX, 30, { ...BIG, scale: 2, color: P.yellow, shadow: P.dred });
  K.tiny(g, 'TIDAK PERNAH BOHONG', CX, 52, { color: P.white, outline: P.ink, align: 'center' });
  K.hud(g, { hp: 3, score: scoreAt(t), level: '1-1' });
});
// 2. nyawa: 3 nyawa berharga
shot('nyawa', (t, a, b) => {
  backdrop(t, 400 + t * 20, 'day');
  const hits = t > W('nyawa', 'berharga') ? 1 : 0;
  K.drawChar(g, 'pitung', hits ? 'hurt' : 'guard', 50, GY - 1, { face: 1, prop: 'golok', flash: hits && t < W('nyawa', 'berharga') + 0.12 });
  K.drawChar(g, 'opas', 'aim', 100, GY - 1, { face: -1, prop: 'rifle' });
  for (let i = 0; i < 3; i++) K.heart(g, 20 + i * 12, 24, i < 3 - hits);
  K.text(g, '3 NYAWA', CX, 44, { ...BIG, scale: 2, color: P.red, shadow: P.ink });
  K.hud(g, { hp: 3 - hits, score: 5300 + scoreAt(t, 0, 400, a), level: '1-2' });
});
// 3. over: GAME OVER -> coba lagi
shot('over', (t, a, b) => {
  g.fillStyle = P.ink; g.fillRect(0, 0, BW, BH); K.stars(g, t, { n: 30, y0: 10, y1: 165 });
  K.drawDown(g, 'pitung', 40, GY - 1);
  const go = a + 0.1;
  K.text(g, 'GAME', CX, lerp(-40, 54, ease.outBounce(clamp((t - go) / 0.4))), { scale: 4, color: P.white, shadow: P.red, outline: P.dred, align: 'center' });
  K.text(g, 'OVER', CX, lerp(-40, 92, ease.outBounce(clamp((t - go - 0.08) / 0.4))), { scale: 4, color: P.white, shadow: P.red, outline: P.dred, align: 'center' });
  if (t > W('over', 'coba') - 0.1) K.text(g, 'COBA LAGI?', CX, 132, { color: pulse(t, 6) ? P.white : P.lime, outline: P.ink, align: 'center' });
  K.hud(g, { hp: 0, score: 9800, level: '1-3' });
});
// 4. lagi: satu level lagi
shot('lagi', (t, a, b) => {
  backdrop(t, 900 + t * 40, 'day');
  K.drawChar(g, 'pitung', K.cycle('run', t, 12), 50, GY - 1, { prop: 'golok' });
  K.text(g, 'LEVEL 2', Math.round(lerp(BW + 90, CX, ease.outBack(clamp((t - a + 0.3) / 0.5)))), 24, { ...BIG, scale: 2 });
  if (t > W('lagi', 'satu') - 0.1) K.text(g, '1 LEVEL LAGI!', CX, 48, { scale: 2, color: P.lime, outline: P.ink, shadow: P.dgreen, align: 'center' });
  for (let i = 0; i < 6; i++) K.sparkle(g, 18 + hrand(i, 3) * 100, GY - 60 + hrand(i, 4) * 50, t + i * 0.1);
  K.hud(g, { hp: 3, score: 12000 + scoreAt(t, 0, 800, a), level: '2-1' });
});
// 5. akhir: resep nagihnya
shot('akhir', (t, a, b) => {
  backdrop(t, 1400, 'day');
  K.drawChar(g, 'pitung', 'raise', CX, GY - 1, { face: 1, prop: 'golok' });
  for (let i = 0; i < 6; i++) K.sparkle(g, CX - 22 + i * 9, GY - 76 + (i % 2) * 6, t + i * 0.2);
  K.text(g, 'RESEP NAGIH', CX, 26, { color: P.white, outline: P.ink, align: 'center' });
  K.text(g, 'SKOR+NYAWA+LEVEL', CX, 44, { color: P.yellow, outline: P.ink, shadow: P.dred, align: 'center' });
  K.hud(g, { msg: pulse(t, 2) ? 'PRESS START' : ' ' });
});
export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.imageSmoothingEnabled = false;
  s.fn(t, Math.max(0, a), b);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (s.id !== 'hook' && since < 0.2) K.mosaic(g, Math.round(lerp(8, 1, since / 0.2)));
  K.present(out, S.c, { dx: 0, dy: 0 });
}
