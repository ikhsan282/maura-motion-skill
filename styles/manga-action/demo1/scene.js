// Manga Action demo 1: "Smash 565 km/jam — Kok Bulu Tangkis yang Lebih Cepat dari Mobil F1"
import * as K from '/styles/manga-action/kit.js';
const { clamp, lerp, ease, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'comic', y: 1480, size: 68, color: '#0e0e10', active: '#d7263d', box: { fill: '#f6f4ee', pad: 20, radius: 4, border: '#0e0e10', borderW: 7 } } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('whoosh', 0.05, { gain: 0.45 });
  AM.sfx('swoosh_up', W('hook', 'lebih') - 0.1, { gain: 0.45 });
  if (C.f1) AM.sfx('whoosh', C.f1.start + 0.15, { gain: 0.4 });
  AM.sfx('jump', W('lompat', 'Lompat'), { gain: 0.4 });
  AM.sfx('whoosh', W('lompat', 'Lecutkan'), { gain: 0.45, pitch: 1.3 });
  AM.sfx('impact', C.rekor.start, { gain: 0.65 });
  AM.sfx('boom', C.rekor.start + 0.02, { gain: 0.45 });
  AM.sfx('riser', W('rekor', 'Lima') - 0.1, { gain: 0.3 });
  AM.sfx('stamp', W('rekor', 'Rekor'), { gain: 0.5 });
  if (C.satwik) AM.sfx('pop', C.satwik.start + 0.2, { gain: 0.4 });
  AM.sfx('wind', C.rahasia.start + 0.1, { gain: 0.35 });
  if (C.drag) AM.sfx('whoosh', C.drag.start + 0.1, { gain: 0.35 });
  AM.sfx('drum_hit', W('akhir', 'membaca'), { gain: 0.5 });
}
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const shk = (t, amt) => [(hrand(Math.floor(t * 24), 1) - 0.5) * amt, (hrand(Math.floor(t * 24), 2) - 0.5) * amt];
const BOT = 1890;

// 1. A race car tears across panel 1 — then a shuttlecock blows past it in panel 2.
shot('hook', (t, a, b) => {
  const lt = t - a, sh = W('hook', 'lebih') - 0.15;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 640], [40, 760]], (g) => {
    K.speedLines(g, t, { ang: 0, x0: 40, y0: 80, x1: 1040, y1: 760, n: 70, w: 5 });
    g.fillStyle = '#f6f4ee'; g.fillRect(200, 300, 700, 300);
    K.raceCar(g, 560 + Math.sin(t * 30) * 4, 620, 0.95, { spin: t * 30 });
    K.speedLines(g, t, { ang: 0, x0: 40, y0: 520, x1: 300, y1: 640, n: 12, w: 6, seed: 9 });
    K.capBox(g, 'MOBIL F1 · 5 GRAM VS 798 KG', 330, 170, { size: 44 });
  }, { k: 1 });
  K.panel(ctx, [[40, 800], [1040, 680], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 280, 1040, t, { inner: 200, outer: 1400, n: 90, x0: 40, y0: 680, x1: 1040, y1: BOT });
    const u = clamp((t - sh) / 0.6);
    K.shuttle(g, lerp(-200, 760, ease.outExpo(u)), lerp(1120, 980, u), 1.25, { ang: -0.15, trail: 0.9, t });
    K.sfxText(g, 'WHUSH!', 640, 1220, { size: 170, k: clamp((t - sh - 0.1) / 0.25), t, rot: -0.15 });
  }, { k: clamp((t - sh + 0.25) / 0.3), from: 'right' });
  const [sx, sy] = shk(t, lt < 0.3 ? 14 : 3);
  ctx.setTransform(1, 0, 0, 1, sx, sy);
});

// 1b. F1 speed gauge vs badminton projectile showdown
shot('f1', (t, a, b) => {
  const lt = t - a;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 760], [40, 680]], (g) => {
    K.gradTone(g, 40, 80, 1000, 680, { invert: false });
    K.speedLines(g, t, { ang: -0.08, x0: 40, y0: 80, x1: 1040, y1: 760, n: 55, w: 4 });
    K.raceCar(g, 520 + Math.sin(t * 26) * 5, 520, 0.85, { spin: t * 28 });
    K.sfxText(g, '378 KM/JAM', 540, 230, { size: 140, k: clamp(lt / 0.3), t, rot: -0.04, shake: 3 });
    K.capBox(g, 'PUNCAK LINTASAN LURUS F1', 340, 620, { size: 42 });
  }, { k: clamp(lt / 0.25), from: 'left' });
  K.panel(ctx, [[40, 720], [1040, 800], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 540, 1080, t, { inner: 180, outer: 1300, n: 100, x0: 40, y0: 720, x1: 1040, y1: BOT });
    K.racket(g, 360, 1340, 0.9, 0.35, { blur: 0.9 });
    K.shuttle(g, 680, 1020, 1.3, { ang: -0.25, trail: 0.8, t });
    K.capBox(g, 'PROYEKTIL OLAHRAGA TERCEPAT DI BUMI', 540, 1280, { size: 46, alpha: clamp((lt - 0.25) / 0.3) });
  }, { k: clamp((lt - 0.15) / 0.3), from: 'bottom' });
});

// 2. Jump. Pull back. Whip the wrist — three panels on the beat.
shot('lompat', (t, a, b) => {
  const w1 = W('lompat', 'Lompat') - 0.08, w2 = W('lompat', 'Tarik') - 0.08, w3 = W('lompat', 'Lecutkan') - 0.08;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [600, 80], [520, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 300, 600, t, { inner: 160, n: 80, x0: 40, y0: 80, x1: 600, y1: BOT });
    const u = clamp((t - w1) / 0.5);
    K.player(g, 'raka', 300, lerp(1380, 1180, ease.outCubic(u)), 0.5, u < 0.3 ? K.POSES.crouch : K.POSES.jump, { t, sil: true });
    K.sfxText(g, 'HUP!', 330, 260, { size: 150, k: clamp((t - w1) / 0.2), t });
    K.capBox(g, '1 · LOMPAT VERTIKAL', 290, 420, { size: 38 });
  }, { k: clamp((t - a + 0.15) / 0.25), from: 'left' });
  K.panel(ctx, [[630, 80], [1040, 80], [1040, 700], [590, 760]], (g) => {
    g.fillStyle = '#0e0e10'; g.fillRect(560, 60, 520, 760);
    K.focusLines(g, 830, 420, t, { inner: 120, n: 70, col: '#f6f4ee', x0: 560, y0: 60, x1: 1080, y1: 800 });
    K.player(g, 'raka', 860, 1260, 0.62, K.POSES.cock, { t });
    K.capBox(g, '2 · BUSUR BAHU', 820, 150, { size: 38, invert: true });
  }, { k: clamp((t - w2 + 0.1) / 0.2), from: 'top' });
  K.panel(ctx, [[586, 790], [1040, 730], [1040, BOT], [520, BOT]], (g) => {
    K.speedLines(g, t, { ang: 0, x0: 520, y0: 730, x1: 1040, y1: BOT, n: 40 });
    K.eyeStrip(g, 'raka', 790, 1060, 0.48, { mood: 'fierce', t, look: [0.6, -0.4] });
    K.capBox(g, '3 · LECUTAN PERGELANGAN', 790, 850, { size: 36 });
  }, { k: clamp((t - w3 + 0.1) / 0.2), from: 'bottom' });
});

// 3. DUAR! Impact frame, the smash, then 565 KM/JAM and the record stamp.
shot('rekor', (t, a, b) => {
  const lt = t - a, num = W('rekor', 'Lima') - 0.1, rek = W('rekor', 'Rekor') - 0.1;
  const impact = lt < 0.28;
  const [sx, sy] = shk(t, lt < 0.6 ? 24 : 4);
  ctx.translate(sx, sy);
  if (impact) {
    ctx.fillStyle = '#0e0e10'; ctx.fillRect(-100, -100, 1300, 2200);
    K.focusLines(ctx, 540, 760, t, { inner: 120, n: 140, col: '#f6f4ee', w: 12 });
    K.player(ctx, 'raka', 420, 1300, 0.62, K.POSES.smash, { t, sil: false });
    K.sfxText(ctx, 'DUAR!', 560, 420, { size: 300, k: clamp(lt / 0.12), t, invert: true, shake: 18 });
    return;
  }
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 820], [40, 940]], (g) => {
    K.focusLines(g, 780, 560, t, { inner: 140, n: 120, x0: 40, y0: 80, x1: 1040, y1: 940 });
    K.player(g, 'raka', 330, 1330, 0.5, K.POSES.smash, { t });
    const u = clamp(lt / 0.5);
    K.shuttle(g, lerp(560, 900, ease.outCubic(u)), lerp(520, 640, u), lerp(0.4, 1.0, u), { ang: 0.35, trail: 0.7, t });
    K.splat(g, 820, 300, 0.7, 3); K.splat(g, 140, 860, 0.5, 7);
  }, { k: 1 });
  K.panel(ctx, [[40, 980], [1040, 860], [1040, BOT], [40, BOT]], (g) => {
    K.gradTone(g, 40, 860, 1000, 480, { invert: true });
    const v = Math.round(lerp(0, 565, ease.outCubic(clamp((t - num) / 1.6))));
    K.sfxText(g, String(v), 470, 1110, { size: 280, k: clamp((t - num) / 0.2), t, rot: -0.06, shake: 4 });
    K.sfxText(g, 'KM/JAM', 820, 1230, { size: 110, k: clamp((t - num - 0.3) / 0.2), t, rot: -0.06, shake: 2 });
  }, { k: clamp((t - num + 0.2) / 0.25), from: 'bottom' });
  const rk = clamp((t - rek) / 0.2);
  if (rk > 0) {
    ctx.save(); ctx.translate(540, 760); ctx.rotate(-0.06); const sc = ease.outBack(rk, 3); ctx.scale(sc, sc);
    K.capBox(ctx, 'REKOR DUNIA GUINNESS · 2023', 0, 0, { size: 56 });
    ctx.restore();
    const bk = clamp((t - rek - 0.4) / 0.6);
    ctx.save(); ctx.fillStyle = '#f6f4ee'; ctx.strokeStyle = '#0e0e10'; ctx.lineWidth = 6; ctx.fillRect(560, 160, 460, 190); ctx.strokeRect(560, 160, 460, 190);
    ctx.font = "400 40px 'Bebas Neue'"; ctx.textBaseline = 'middle'; ctx.fillStyle = '#0e0e10';
    ctx.fillText('KOK', 580, 215); ctx.fillText('F1', 580, 295);
    ctx.fillRect(650, 198, 330 * bk, 34); ctx.fillStyle = K.tone(ctx, 'dark'); ctx.fillRect(650, 278, 330 * 378 / 565 * bk, 34);
    ctx.fillStyle = '#0e0e10'; ctx.font = "400 30px 'Bebas Neue'"; ctx.fillText('565', 650 + 330 * bk - 50, 172); ctx.fillText('±378', 650 + 220 * bk - 50, 330);
    ctx.restore();
  }
});

// 3b. Comparison: Tan Boon Heong (493 km/h, 2013) vs Satwiksairaj Rankireddy (565 km/h, 2023)
shot('satwik', (t, a, b) => {
  const lt = t - a;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [520, 80], [480, 1340], [40, 1340]], (g) => {
    K.gradTone(g, 40, 80, 480, 1260, { invert: false });
    K.racket(g, 260, 1080, 0.85, -0.2, { blur: 0.4 });
    K.capBox(g, 'TAN BOON HEONG · 2013', 270, 200, { size: 40 });
    K.sfxText(g, '493', 270, 440, { size: 170, k: clamp(lt / 0.25), t, rot: -0.05, shake: 2 });
    K.sfxText(g, 'KM/JAM', 270, 580, { size: 74, k: 1, t, rot: -0.05, shake: 0 });
  }, { k: clamp(lt / 0.25), from: 'left' });
  K.panel(ctx, [[550, 80], [1040, 80], [1040, 1340], [510, 1340]], (g) => {
    K.focusLines(g, 780, 680, t, { inner: 160, n: 90, x0: 510, y0: 80, x1: 1040, y1: 1340 });
    K.racket(g, 780, 1080, 0.98, 0.25, { blur: 1.2 });
    K.shuttle(g, 790, 780, 0.9, { ang: 0.2, trail: 0.6, t });
    K.capBox(g, 'RANKIREDDY · 2023', 780, 200, { size: 42 });
    K.sfxText(g, '565', 780, 440, { size: 195, k: clamp((lt - 0.15) / 0.25), t, rot: -0.06, shake: 5 });
    K.sfxText(g, 'KM/JAM', 780, 590, { size: 80, k: 1, t, rot: -0.06, shake: 2 });
  }, { k: clamp((lt - 0.12) / 0.25), from: 'right' });
});

// 4. The feathers flare into an air brake.
shot('rahasia', (t, a, b) => {
  const lt = t - a;
  const u = clamp(lt / (b - a - 0.4));
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 900], [40, 820]], (g) => {
    K.speedLines(g, t, { ang: 0, x0: 40, y0: 80, x1: 1040, y1: 900, n: Math.round(lerp(70, 25, u)), w: 4, flow: 1 - u * 0.6 });
    g.strokeStyle = '#0e0e10'; g.lineWidth = 5; g.lineCap = 'round';
    const sxp = lerp(820, 460, ease.outCubic(u)), syp = 470;
    for (let i = 0; i < 6; i++) { const yy = syp - 230 + i * 92, ph = (t * 3 + i * 0.3) % 1; g.globalAlpha = 0.85; g.beginPath(); g.moveTo(sxp + 300, yy); g.bezierCurveTo(sxp + 50, yy, sxp - 150, yy + (yy < syp ? -1 : 1) * 70, sxp - 330, yy + (yy < syp ? -1 : 1) * (120 + ph * 50)); g.stroke(); }
    g.globalAlpha = 1;
    K.shuttle(g, sxp, syp, 1.35, { ang: Math.PI, flare: u, t, trail: 0.3 * (1 - u) });
    K.capBox(g, '16 HELAI BULU = PARASUT REM UDARA', 430, 150, { size: 48, alpha: clamp(lt / 0.3) });
  }, { k: 1 });
  K.panel(ctx, [[40, 860], [1040, 940], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 540, 1140, t, { inner: 220, n: 70, x0: 40, y0: 860, x1: 1040, y1: BOT });
    const v = Math.round(lerp(565, 280, ease.inOutCubic(u)));
    K.sfxText(g, `${v}`, 540, 1100, { size: 220, k: 1, t, shake: 3, rot: -0.05 });
    K.sfxText(g, 'KM/JAM DI ATAS NET', 540, 1260, { size: 70, k: 1, t, shake: 0, rot: -0.03 });
  }, { k: clamp((lt + 0.1) / 0.3), from: 'bottom' });
});

// 4b. Aerodynamic drag drops speed to 1/4 at receiver's racket
shot('drag', (t, a, b) => {
  const lt = t - a;
  const u = clamp(lt / (b - a - 0.3));
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 780], [40, 860]], (g) => {
    K.gradTone(g, 40, 80, 1000, 780, { invert: true });
    K.player(g, 'dimas', 760, 1280, 0.52, K.POSES.ready, { t, face: -1 });
    K.shuttle(g, lerp(220, 560, ease.outCubic(u)), lerp(360, 520, u), 0.95, { ang: 0.25, flare: 0.9, t, trail: 0.2 });
    K.capBox(g, 'HAMBATAN DRAG AERODINAMIS EKSTREM', 420, 160, { size: 46 });
  }, { k: 1 });
  K.panel(ctx, [[40, 900], [1040, 820], [1040, BOT], [40, BOT]], (g) => {
    const v = Math.round(lerp(280, 141, ease.inOutCubic(u)));
    K.sfxText(g, `${v}`, 330, 1110, { size: 220, k: 1, t, shake: 2, rot: -0.05 });
    K.sfxText(g, 'KM/JAM', 330, 1260, { size: 80, k: 1, t, shake: 0, rot: -0.05 });
    const q = clamp((lt - 0.3) / 0.3);
    if (q > 0) { K.sfxText(g, '¼', 820, 1130, { size: 290, k: q, t, rot: 0.05 }); }
  }, { k: clamp((lt + 0.1) / 0.3), from: 'bottom' });
});

// 5. The winner isn't the fastest — it's the one who reads first: two eyes, two players.
shot('akhir', (t, a, b) => {
  const lt = t - a, mb = W('akhir', 'membaca') - 0.1;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 560], [40, 640]], (g) => {
    g.fillStyle = '#0e0e10'; g.fillRect(0, 60, 1080, 620);
    K.speedLines(g, t, { ang: 0, x0: 40, y0: 80, x1: 1040, y1: 640, n: 40, col: '#3a3a40' });
    g.save(); g.fillStyle = '#f6f4ee'; g.fillRect(40, 140, 1000, 420); g.restore();
    K.eyeStrip(g, 'raka', 540, 400, 0.85, { mood: 'fierce', t, look: [0.5, 0.2], sweat: 1 });
  }, { k: 1 });
  K.panel(ctx, [[40, 680], [1040, 600], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 540, 1000, t, { inner: 330, n: 100, x0: 40, y0: 600, x1: 1040, y1: BOT });
    g.fillStyle = '#f6f4ee'; g.beginPath(); g.ellipse(540, 1000, 470, 210, 0, 0, Math.PI * 2); g.fill();
    K.eyeStrip(g, 'dimas', 540, 1010, 0.85, { mood: 'calm', t, look: [-0.2, 0], reflect: (gg, ix, iy, ir) => { K.shuttle(gg, ix + 6, iy, 0.16, { ang: Math.PI * 0.9, t }); } });
  }, { k: clamp((lt + 0.15) / 0.3), from: 'right' });
  const bk = clamp((t - mb) / 0.2);
  if (bk > 0) { ctx.save(); ctx.translate(540, 640); ctx.rotate(-0.05); const s = ease.outBack(bk, 3); ctx.scale(s, s); K.capBox(ctx, 'YANG MENANG: YANG MEMBACA', 0, 0, { size: 64 }); ctx.restore(); }
  if (bk > 0) K.splat(ctx, 960, 120, 0.4 * bk, 11);
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (since < 0.09 && s.id !== 'hook' && s.id !== 'rekor') { fx.fillStyle = 'rgba(14,14,16,0.9)'; fx.fillRect(0, 0, AM.W, AM.H); }
  const endA = clamp((t - (AM.duration - 0.45)) / 0.45);
  if (endA > 0) { fx.fillStyle = `rgba(246,244,238,${endA})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.grain(fx, t, { amount: 0.04, fps: 12 });
}
