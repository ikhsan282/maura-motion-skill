// Kartun Outline Tebal demo: "Perang Aplikasi di Baterai 1 Persen" — 20 s.
import * as K from '/styles/kartun-outline-tebal/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'comic', y: 1490, size: 76 } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('impact', 0.05, { gain: 0.45 });
  AM.sfx('pop', W('hook', 'aplikasiku'), { gain: 0.4 });
  AM.sfx('boing', W('hook', 'perang'), { gain: 0.45 });
  AM.sfx('camera', W('kamera', 'foto'), { gain: 0.5 });
  AM.sfx('ding', W('kamera', 'Chat'), { gain: 0.35, pitch: 1.3 });
  AM.sfx('jump', W('game', 'ronde'), { gain: 0.35 });
  AM.sfx('slide_whistle', C.redup.start + 0.1, { gain: 0.35, pitch: 0.6 });
  AM.sfx('click', W('charger', 'Klik'), { gain: 0.6 });
  AM.sfx('powerup', W('charger', 'baterai'), { gain: 0.45 });
  AM.sfx('pop', C.akhir.start + 0.3, { gain: 0.4 });
  AM.sfx('pop', W('akhir', 'nyalakan'), { gain: 0.4, pitch: 1.2 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
function camera(z = 1, cx = 540, cy = 960, rot = 0) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 960); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy); }
const blinkAt = (t, seed = 0) => { const p = (t + seed) % 2.9; return p < 0.1 ? 1 : 0; };
const popIn = (t, at, d = 0.3) => clamp((t - at) / d);
const hopAt = (t, at, h = 80, d = 0.45) => { const u = (t - at) / d; return u > 0 && u < 1 ? Math.sin(u * Math.PI) * h : 0; };
const sqAt = (t, at) => { const u = t - at; if (u < -0.12 || u > 0.5) return 0; if (u < 0) return 0.18 * (1 + u / 0.12); return -0.15 * Math.exp(-u * 8) * Math.cos(u * 30); };

// 1. "1%" slams in; tired Pak Baterai; the apps pop up all around and a fight cloud erupts.
shot('hook', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1 + 0.05 * p, 540, 960);
  K.sunburst(ctx, t, { c1: '#ffb238', c2: '#ff8a1f', y: 980 });
  K.dots(ctx, { col: 'rgba(120,30,0,0.12)' });
  K.floor(ctx, 1300);
  const ap = W('hook', 'aplikasiku'), wr = W('hook', 'perang');
  const war = t >= wr;
  K.char(ctx, 'baterai', 540, 1310, 1.3, { t, level: 0.02, mood: war ? 'worried' : 'tired', open: war ? 0.7 : 0.35 + 0.15 * Math.sin(t * 7), sweat: true, sq: Math.sin(t * 7) * 0.03, blink: blinkAt(t), armL: [-180, -150], armR: [180, -150] });
  const apps = [['kamera', 170, 980, 0.7, 0], ['chat', 910, 990, 0.7, 0.08], ['game', 190, 1310, 0.62, 0.16], ['peta', 900, 1320, 0.62, 0.24], ['musik', 560, 640, 0.6, 0.3]];
  for (const [k, x, y, s, d] of apps) {
    const kk = popIn(t, ap - 0.1 + d, 0.25);
    if (kk <= 0) continue;
    const sc = ease.outBack(kk, 3) * s;
    if (war) { continue; }
    K.char(ctx, k, x, y, sc, { t, mood: 'angry', open: 0.5, look: [(540 - x) / 400, 0], hop: hopAt(t, ap + d, 60), face: x > 540 ? -1 : 1 });
  }
  if (war) K.fightCloud(ctx, 540, 960, t, 1.05 + 0.1 * Math.sin(t * 20));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.percent(ctx, 1, 540, 300, { size: 230, k: popIn(t, 0, 0.35), t });
});

// 2. Camera flashes ("one more photo!"), then Chat barges in with a 300-message badge.
shot('kamera', (t, a, b) => {
  const lt = t - a;
  const ch = W('kamera', 'Chat');
  const chatIn = clamp((t - ch + 0.15) / 0.3);
  camera(1.2, 540, 1080);
  K.sunburst(ctx, t, { c1: '#41c7ff', c2: '#2f9bff', y: 900 });
  K.dots(ctx, { col: 'rgba(0,30,90,0.12)' });
  K.floor(ctx, 1380);
  const ft = W('kamera', 'foto');
  const flash = t > ft && t < ft + 0.35 ? 1 - (t - ft) / 0.35 : 0;
  K.char(ctx, 'baterai', 250, 1390, 0.6, { t, level: 0.02, mood: 'tired', sweat: true, open: 0.3, look: [0.8, 0] });
  const kx = lerp(560, 400, ease.inOutCubic(chatIn));
  K.char(ctx, 'kamera', kx, 1390, 0.95, { t, flash, mood: 'normal', open: 0.6 + 0.2 * Math.sin(t * 12), hop: hopAt(t, a + 0.05, 90), sq: sqAt(t, a + 0.5) + chatIn * 0.15 * Math.exp(-(t - ch) * 3), armR: [210, -330], armL: [-200, -250], look: [-0.3, -0.2] });
  if (chatIn > 0) K.char(ctx, 'chat', lerp(1400, 820, ease.outBack(chatIn, 1.5)), 1390, 0.95, { t, face: -1, mood: 'angry', open: 0.7, badge: Math.round(lerp(0, 300, clamp((t - ch) / 0.8))), armR: [220, -260], armL: [-160, -330], sq: sqAt(t, ch + 0.15) });
  if (chatIn > 0 && chatIn < 1) K.speed(ctx, lerp(1400, 820, chatIn) + 200, 1200, 300, { dir: -1, t });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'SATU FOTO LAGI!', 420, 360, { size: 84, col: K.PAL.yellow, k: popIn(t, ft - 0.25, 0.25) * (1 - chatIn), rot: -0.08, t, sway: 1 });
  if (flash) { ctx.fillStyle = `rgba(255,255,240,${flash * 0.85})`; ctx.fillRect(0, 0, 1080, 1920); }
  K.textSticker(ctx, '300 PESAN!', 640, 400, { size: 96, col: K.PAL.green, txt: K.PAL.white, k: popIn(t, ch + 0.2, 0.25), rot: 0.07, t, sway: 1 });
});

// 3. Game pad begs on its knees: "one more round, I swear!"
shot('game', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.15 + 0.12 * ease.inOutSine(p), 540, 1080);
  K.sunburst(ctx, t, { c1: '#b28cff', c2: '#8b5cff', y: 1000, speed: 0.4 });
  K.dots(ctx, { col: 'rgba(40,0,90,0.14)' });
  K.floor(ctx, 1380, '#ff5fa2');
  const beg = Math.sin(t * 9);
  K.char(ctx, 'game', 540, 1390, 1.05, { t, mood: 'star', open: 0.45 + 0.2 * Math.abs(beg), smile: 0.8, armL: [-40, -330 + beg * 20], armR: [40, -330 + beg * 20], sq: 0.05 + beg * 0.03, lean: beg * 0.04 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, '1 RONDE LAGI...', 540, 380, { size: 96, col: K.PAL.white, txt: K.PAL.purple, k: popIn(t, W('game', 'ronde') - 0.2, 0.25), rot: -0.05, t, sway: 1 });
  K.textSticker(ctx, 'SUMPAH!', 760, 560, { size: 74, col: K.PAL.pink, txt: K.PAL.white, k: popIn(t, W('game', 'sumpah') - 0.1, 0.2), rot: 0.12, t });
});

// 4. The screen dims; everyone freezes; Pak Baterai faints.
shot('redup', (t, a, b) => {
  const lt = t - a, dim = ease.inOutCubic(clamp(lt / 0.8));
  const faint = clamp((t - W('redup', 'terdiam')) / 0.5);
  camera(1.18, 540, 1080, -faint * 0.04);
  K.sunburst(ctx, t, { c1: '#ffb238', c2: '#ff8a1f', y: 980, speed: 0.15 * (1 - dim) });
  K.floor(ctx, 1380);
  const fr = { mood: 'worried', open: 0.2 };
  K.char(ctx, 'kamera', 160, 1390, 0.55, { t: a, ...fr, look: [1, 0] });
  K.char(ctx, 'chat', 920, 1390, 0.55, { t: a, ...fr, face: -1, look: [1, 0] });
  K.char(ctx, 'baterai', 520, 1390, 1.0, { t, level: 0.01, mood: faint > 0.5 ? 'x' : 'tired', open: faint * 0.4, lean: -faint * 0.5, sq: faint * 0.1, sweat: faint < 0.5 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(14,8,32,${0.62 * dim})`; ctx.fillRect(0, 0, 1080, 1920);
  const blink = Math.floor(t * 4) % 2;
  K.percent(ctx, 1, 540, 360, { size: 200, col: blink ? K.PAL.red : '#802020', k: 1, t });
});

// 5. KLIK! The Charger hero swoops in, plugs in — lightning, the battery refills and jumps for joy.
shot('charger', (t, a, b) => {
  const kl = W('charger', 'Klik'), bt = W('charger', 'baterai');
  const fly = clamp((t - kl + 0.1) / 0.6);
  const fill = clamp((t - (kl + 0.6)) / (b - kl - 0.9));
  camera(1.18 + 0.05 * fill, 540, 1080);
  K.sunburst(ctx, t, { c1: fill > 0 ? '#b6f03c' : '#2a1d55', c2: fill > 0 ? '#2fd96b' : '#3a2a70', y: 900, speed: 0.6 });
  K.dots(ctx, { col: 'rgba(0,60,20,0.12)' });
  K.floor(ctx, 1380, '#2f5bff');
  const jump = t > bt ? hopAt(t, bt, 160, 0.6) : 0;
  K.char(ctx, 'baterai', 400, 1390, 1.0, { t, level: lerp(0.01, 1, ease.inOutCubic(fill)), mood: fill > 0.4 ? 'happy' : 'x', open: fill > 0.4 ? 0.8 : 0.2, smile: 1, hop: jump, sq: sqAt(t, bt) , armL: fill > 0.4 ? [-200, -360] : [-170, -120], armR: fill > 0.4 ? [200, -360] : [170, -120] });
  const cx = lerp(1350, 800, ease.outBack(fly, 1.4)), cy = lerp(500, 1390, ease.outCubic(fly));
  K.char(ctx, 'charger', cx, cy, 0.9, { t, face: -1, mood: 'normal', look: [0.6, 0], smile: 1, open: 0.3, armL: [-240, -260], armR: [160, -330] });
  if (fly < 1) K.speed(ctx, cx + 120, cy - 250, 400, { dir: -1, t, h: 300 });
  if (fill > 0 && fill < 1) K.zap(ctx, cx - 230, cy - 230, 520, 1390 - 300, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.burst(ctx, 'KLIK!', 720, 640, { size: 120, k: popIn(t, kl - 0.05, 0.2) * (1 - clamp((t - kl - 0.9) / 0.2)), t });
  if (fill > 0) K.percent(ctx, lerp(1, 100, ease.inOutCubic(fill)), 540, 360, { size: 200, col: fill > 0.4 ? '#169c45' : K.PAL.red, k: 1, t });
});

// 6. Tips as slapped stickers — and the Game pad, still whispering "one more round".
shot('akhir', (t, a, b) => {
  const p = clamp((t - a) / 2.5);
  camera(1.15 + 0.04 * p, 540, 1080);
  K.sunburst(ctx, t, { c1: '#ffe066', c2: '#ffcf2a', y: 1000, speed: 0.12 });
  K.dots(ctx, { col: 'rgba(120,80,0,0.12)' });
  K.floor(ctx, 1380, '#ff6a2a');
  K.char(ctx, 'baterai', 330, 1390, 0.85, { t, level: 1, mood: 'happy', smile: 1, open: 0.4, hop: Math.abs(Math.sin(t * 5)) * 20, armL: [-160, -280], armR: [180, -120] });
  K.char(ctx, 'game', 830, 1400, 0.6, { t, face: -1, mood: 'normal', look: [0.8, -0.3], open: 0.15 + 0.15 * Math.abs(Math.sin(t * 10)), armL: [-60, -300], armR: [60, -230] });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.textSticker(ctx, 'TIPS HEMAT', 540, 300, { size: 72, col: K.PAL.ink, txt: K.PAL.yellow, k: popIn(t, a + 0.05, 0.25), rot: -0.04, t });
  K.textSticker(ctx, 'REDUPKAN LAYAR', 520, 480, { size: 76, col: K.PAL.white, k: popIn(t, a + 0.35, 0.25), rot: -0.07, t, sway: 1, icon: K.ICONS.sun });
  K.textSticker(ctx, 'MODE HEMAT DAYA', 560, 660, { size: 76, col: K.PAL.lime, k: popIn(t, W('akhir', 'nyalakan') - 0.1, 0.25), rot: 0.06, t, sway: 1, icon: K.ICONS.leaf });
  if (t > C.akhir.end - 0.4) K.textSticker(ctx, 'psst... 1 ronde lagi', 760, 1000, { size: 46, col: K.PAL.purple, txt: K.PAL.white, k: popIn(t, C.akhir.end - 0.4, 0.25), rot: 0.1, t });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (since < 0.12 && s.id !== 'hook') { fx.fillStyle = `rgba(255,255,255,${0.6 * (1 - since / 0.12)})`; fx.fillRect(0, 0, AM.W, AM.H); }
  const endA = clamp((t - (AM.duration - 0.5)) / 0.5);
  if (endA > 0) { fx.fillStyle = `rgba(26,16,51,${endA})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(fx, { strength: 0.22, inner: 0.6 });
}
