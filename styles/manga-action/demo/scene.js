// Manga Action demo: "Smash 565 km/jam" — 19 s of B/W manga panels.
import * as K from '/styles/manga-action/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'comic', y: 1480, size: 74, color: '#0e0e10', active: '#d7263d', box: { fill: '#f6f4ee', pad: 20, radius: 4, border: '#0e0e10', borderW: 7 } } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('whoosh', 0.05, { gain: 0.45 });
  AM.sfx('swoosh_up', W('hook', 'lebih') - 0.1, { gain: 0.45 });
  AM.sfx('jump', W('lompat', 'Lompat'), { gain: 0.4 });
  AM.sfx('whoosh', W('lompat', 'Lecutkan'), { gain: 0.45, pitch: 1.3 });
  AM.sfx('impact', C.rekor.start, { gain: 0.65 });
  AM.sfx('boom', C.rekor.start + 0.02, { gain: 0.45 });
  AM.sfx('riser', W('rekor', 'Lima') - 0.1, { gain: 0.3 });
  AM.sfx('stamp', W('rekor', 'Rekor'), { gain: 0.5 });
  AM.sfx('wind', C.rahasia.start + 0.1, { gain: 0.35 });
  AM.sfx('drum_hit', W('akhir', 'membaca'), { gain: 0.5 });
}
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const shk = (t, amt) => [(hrand(Math.floor(t * 24), 1) - 0.5) * amt, (hrand(Math.floor(t * 24), 2) - 0.5) * amt];
const BOT = 1890; // panels run to the page edge; key content stays above y≈1340

// 1. A race car tears across panel 1 — then a shuttlecock blows past it in panel 2.
shot('hook', (t, a, b) => {
  const lt = t - a, sh = W('hook', 'lebih') - 0.15;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 640], [40, 760]], (g) => {
    K.speedLines(g, t, { ang: 0, x0: 40, y0: 80, x1: 1040, y1: 760, n: 70, w: 5 });
    g.fillStyle = '#f6f4ee'; g.fillRect(200, 300, 700, 300);
    K.raceCar(g, 560 + Math.sin(t * 30) * 4, 620, 0.95, { spin: t * 30 });
    K.speedLines(g, t, { ang: 0, x0: 40, y0: 520, x1: 300, y1: 640, n: 12, w: 6, seed: 9 });
    K.capBox(g, 'MOBIL F1', 230, 170, { size: 46 });
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

// 2. Jump. Pull back. Whip the wrist — three panels on the beat.
shot('lompat', (t, a, b) => {
  const w1 = W('lompat', 'Lompat') - 0.08, w2 = W('lompat', 'Tarik') - 0.08, w3 = W('lompat', 'Lecutkan') - 0.08;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [600, 80], [520, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 300, 600, t, { inner: 160, n: 80, x0: 40, y0: 80, x1: 600, y1: BOT });
    const u = clamp((t - w1) / 0.5);
    K.player(g, 'raka', 300, lerp(1380, 1180, ease.outCubic(u)), 0.5, u < 0.3 ? K.POSES.crouch : K.POSES.jump, { t, sil: true });
    K.sfxText(g, 'HUP!', 330, 260, { size: 150, k: clamp((t - w1) / 0.2), t });
  }, { k: clamp((t - w1 + 0.15) / 0.25), from: 'left' });
  K.panel(ctx, [[630, 80], [1040, 80], [1040, 700], [590, 760]], (g) => {
    g.fillStyle = '#0e0e10'; g.fillRect(560, 60, 520, 760);
    K.focusLines(g, 830, 420, t, { inner: 120, n: 70, col: '#f6f4ee', x0: 560, y0: 60, x1: 1080, y1: 800 });
    K.player(g, 'raka', 860, 1260, 0.62, K.POSES.cock, { t });
  }, { k: clamp((t - w2 + 0.1) / 0.2), from: 'top' });
  K.panel(ctx, [[586, 790], [1040, 730], [1040, BOT], [520, BOT]], (g) => {
    K.speedLines(g, t, { ang: 0, x0: 520, y0: 730, x1: 1040, y1: BOT, n: 40 });
    K.eyeStrip(g, 'raka', 790, 1060, 0.48, { mood: 'fierce', t, look: [0.6, -0.4] });
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
  // record stamp + F1 comparison
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

// 4. The feathers flare into an air brake: 565 → about a quarter by the time it reaches the other side.
shot('rahasia', (t, a, b) => {
  const lt = t - a, lw = W('rahasia', 'lawan') - 0.1;
  const u = clamp(lt / (b - a - 0.4));
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 900], [40, 820]], (g) => {
    K.speedLines(g, t, { ang: 0, x0: 40, y0: 80, x1: 1040, y1: 900, n: Math.round(lerp(70, 15, u)), w: 4, flow: 1 - u * 0.8 });
    // airflow curling around the skirt (drag)
    g.strokeStyle = '#0e0e10'; g.lineWidth = 5; g.lineCap = 'round';
    const sxp = lerp(820, 380, ease.outCubic(u)), syp = 470;
    for (let i = 0; i < 6; i++) { const yy = syp - 230 + i * 92, ph = (t * 3 + i * 0.3) % 1; g.globalAlpha = 0.85; g.beginPath(); g.moveTo(sxp + 300, yy); g.bezierCurveTo(sxp + 50, yy, sxp - 150, yy + (yy < syp ? -1 : 1) * 70, sxp - 330, yy + (yy < syp ? -1 : 1) * (120 + ph * 50)); g.stroke(); }
    g.globalAlpha = 1;
    K.shuttle(g, sxp, syp, 1.35, { ang: Math.PI, flare: u, t, trail: 0.3 * (1 - u) });
    K.capBox(g, 'BULU = REM UDARA', 330, 150, { size: 50, alpha: clamp(lt / 0.3) });
  }, { k: 1 });
  K.panel(ctx, [[40, 860], [1040, 940], [1040, BOT], [40, BOT]], (g) => {
    const v = Math.round(lerp(565, 141, ease.inOutCubic(u)));
    K.sfxText(g, `${v}`, 330, 1110, { size: 230, k: 1, t, shake: 2, rot: -0.05 });
    K.sfxText(g, 'KM/JAM', 330, 1260, { size: 80, k: 1, t, shake: 0, rot: -0.05 });
    const q = clamp((t - lw) / 0.25);
    if (q > 0) { K.sfxText(g, '¼', 820, 1130, { size: 300, k: q, t, rot: 0.05 }); }
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
