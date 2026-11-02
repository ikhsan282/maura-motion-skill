// Kinetic Type demo: "Fokus Satu Hal". 20 s. Captions are off: the words ARE the picture.
// Every word lands on the frame it is spoken (word times from build/words.json, see ../align.py).
import * as K from '/styles/kinetic-type/kit.js';
const { clamp, lerp, ease } = AM.lib;
const { PAL, FONT } = K;

export const meta = { fps: 24, hold: 1 };

let ctx, C = {};
const T = (id, i) => K.wt(AM, id, i);
const HITS = [];

export async function setup(AM) {
  await K.useAlignedWords(AM);
  ctx = AM.layer('type'); // one layer: every extra full-screen canvas costs capture time on a CPU
  for (const l of AM.timeline.lines) C[l.id] = l;
  const S = (type, t, o = {}) => AM.sfx(type, t, o);
  S('impact', T('hook', 0) - 0.02, { gain: 0.5 });
  S('scratch', T('hook', 4) - 0.02, { gain: 0.3 });
  S('impact', T('setengah', 4) - 0.02, { gain: 0.45 });
  S('thud', T('setengah', 8) - 0.02, { gain: 0.55, pitch: 0.8 });
  S('tick', T('fokus', 4), { gain: 0.35 });
  S('impact', T('fokus', 6) - 0.02, { gain: 0.55 });
  S('tick', T('tutup', 4) + 0.25, { gain: 0.3 });
  S('impact', T('akhir', 6) - 0.02, { gain: 0.55 });
  HITS.push(T('hook', 0), T('hook', 3), T('setengah', 4), T('setengah', 8), T('fokus', 6), T('akhir', 6));
}

// ---------- helpers ----------
const SHOTS = [];
const shot = (id, next, fn) => SHOTS.push({ id, next, fn });
const span = (id, next) => [C[id].start - 0.12, next ? C[next].start - 0.12 : AM.duration + 1];
let FIELD = PAL.ink;
function bg(c) { FIELD = c; K.field(ctx, c); }
const ink = () => K.ON[FIELD].ink;
const S = (rows, o) => K.stack(ctx, rows, o);
const D = (rows, t, o) => K.drawStack(ctx, rows, t, { color: ink(), ...o });

// ---------- 1. MULTITASKING ITU MITOS. / KAMU TIDAK MENGERJAKAN BANYAK HAL. ----------
shot('hook', 'setengah', (t) => {
  const t0 = T('hook', 0), tM = T('hook', 3), tK = T('hook', 4);
  if (t < t0) { // pre-roll: the lie, echoed behind
    bg(PAL.tomato);
    K.echoWall(ctx, 'MULTITASKING', t, { color: PAL.ink, alpha: 0.18, size: 400, speed: 260, rows: 6, y0: -40 });
    const r = S([{ text: 'MULTITASKING', font: FONT.black }], { cy: 860 });
    const s = 1.12 - 0.12 * ease.outCubic(clamp(t / 0.3));
    ctx.save(); ctx.translate(540, 860); ctx.scale(s, s); ctx.translate(-540, -860); D(r, t); ctx.restore();
    return;
  }
  if (t < tM) {
    bg(PAL.ink);
    const r = S([{ text: 'MULTITASKING', at: t0, fx: 'slam' }], { cy: 860 });
    D(r, t, { color: PAL.paper, accent: PAL.tomato });
    return;
  }
  bg(PAL.tomato);
  const r = S([{ text: 'MITOS.', at: tM, fx: 'slam' }, { text: 'KAMU TIDAK', at: T('hook', 5), fx: 'rise' }, { text: 'MENGERJAKAN', at: T('hook', 6), fx: 'rise' }, { text: 'BANYAK HAL.', at: T('hook', 7), fx: 'rise', color: PAL.ink }], { cy: 860 });
  D(r, t);
  const k = ease.outExpo(clamp((t - T('hook', 7)) / 0.35));
  K.strike(ctx, K.rowBox(ctx, r[3]), k, { color: PAL.ink, thick: 20, tilt: -0.02 });
});

// ---------- 2. KAMU MENGERJAKAN SETENGAH-SETENGAH SEMUA. / TIDAK ADA YANG SELESAI. ----------
shot('setengah', 'fokus', (t) => {
  const tB = T('setengah', 3);
  if (t < tB) {
    bg(PAL.paper);
    const r = S([{ text: 'KAMU MENGERJAKAN', at: T('setengah', 0), fx: 'slam', fit: 0.7 }], { cy: 860 });
    D(r, t, { color: PAL.ink });
    return;
  }
  bg(PAL.cobalt);
  const r = S([{ text: 'SETENGAH-SETENGAH', at: tB, fx: 'wipe', color: PAL.paper, fit: 0.75 }], { cy: 860 });
  D(r, t);
  const tI = T('setengah', 4);
  if (t >= tI) { // the words scatter: many hands, no work
    const k = ease.outExpo(clamp((t - tI) / 0.4));
    const spread = (i) => 1 - k * (i % 2 ? 1 : -1);
    const lay = S([{ text: 'SEMUA.', at: tI, fx: 'drop', color: PAL.sun, fit: 0.55 }], { cy: 900 });
    ctx.save(); ctx.translate(0, 0); D(lay, t); ctx.restore();
    return;
  }
});

// ---------- 3. FOKUS ITU SEDERHANA. / SATU HAL. SAMPAI SELESAI. ----------
shot('fokus', 'tutup', (t) => {
  const tB = T('fokus', 3);
  if (t < tB) {
    bg(PAL.sun);
    const r = S([{ text: 'FOKUS ITU', at: T('fokus', 0), fx: 'slam', fit: 0.7 }], { cy: 860 });
    D(r, t);
    K.underline(ctx, K.rowBox(ctx, r[0]), (t - T('fokus', 0)) / 0.35, { color: PAL.ink, thick: 14, gap: 18 });
    return;
  }
  bg(PAL.ink);
  const r = S([{ text: 'SATU HAL.', at: tB, fx: 'slam', color: PAL.paper, fit: 0.85 }], { cy: 860 });
  D(r, t);
  const tI = T('fokus', 4);
  if (t >= tI) {
    const k = ease.outExpo(clamp((t - tI) / 0.3));
    ctx.save(); ctx.translate(540, 860); ctx.scale(k, k); ctx.translate(-540, -860);
    D(S([{ text: 'SAMPAI SELESAI.', at: tI, fx: 'rise', color: PAL.sun, fit: 0.7 }], { top: 1100 }), t);
    ctx.restore();
    // a single progress bar fills
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PAL.ink; ctx.fillRect(100, 1420, 880, 30);
    ctx.fillStyle = PAL.sun; ctx.fillRect(100, 1420, 880 * ease.outExpo(clamp((t - tI) / 0.6)), 30);
    ctx.restore();
  }
});

// ---------- 4. TUTUP YANG LAIN. / SATU LAYAR. SATU TUGAS. ----------
shot('tutup', 'akhir', (t) => {
  const tB = T('tutup', 3);
  if (t < tB) {
    bg(PAL.cobalt);
    K.echoWall(ctx, 'TUTUP', t, { font: FONT.black, color: PAL.paper, alpha: 0.12, size: 300, speed: 60, rows: 7, y0: -30 });
    const r = S([{ text: 'TUTUP', at: T('tutup', 0), fx: 'slam', color: PAL.paper, fit: 0.7 }], { cy: 860 });
    D(r, t);
    return;
  }
  bg(PAL.paper);
  const r = S([{ text: 'SATU LAYAR.', at: tB, fx: 'slam', color: PAL.ink, fit: 0.75 }], { cy: 860 });
  D(r, t);
  const tI = T('tutup', 4);
  if (t >= tI) {
    // the clutter disappears: a single window frame
    const k = ease.outCubic(clamp((t - tI) / 0.35));
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PAL.ink; ctx.globalAlpha = 0.15;
    for (let i = 0; i < 4; i++) ctx.fillRect(300 + i * 100 * (1 - k), 700, 80, 120);
    ctx.globalAlpha = 1;
    ctx.fillStyle = PAL.ink; ctx.fillRect(300, 700, 80, 120);
    ctx.fillStyle = PAL.tomato; ctx.fillRect(310, 710, 60, 20);
    ctx.fillStyle = PAL.paper; ctx.fillRect(310, 740, 60, 60);
    ctx.restore();
    D(S([{ text: 'SATU TUGAS.', at: tI, fx: 'rise', color: PAL.ink, fit: 0.6 }], { top: 1150 }), t);
  }
});

// ---------- 5. SETENGAH SEMUA, ATAU SELESAI SATU. / PILIH SATU. ----------
shot('akhir', null, (t) => {
  const tB = T('akhir', 3), tC = T('akhir', 6);
  if (t < tB) {
    bg(PAL.ink);
    const r = S([{ text: 'SETENGAH SEMUA,', at: T('akhir', 0), fx: 'slam', fit: 0.75 }], { cy: 860 });
    D(r, t, { color: PAL.paper });
    return;
  }
  if (t < tC) {
    bg(PAL.tomato);
    const r = S([{ text: 'ATAU', at: tB, fx: 'slam', color: PAL.ink, fit: 0.5 }], { cy: 860 });
    D(r, t);
    const tI = T('akhir', 4);
    if (t >= tI) {
      const k = ease.outExpo(clamp((t - tI) / 0.3));
      ctx.save(); ctx.translate(540, 860); ctx.scale(1 + 0.15 * (1 - k), 1 + 0.15 * (1 - k)); ctx.translate(-540, -860);
      D(S([{ text: 'SELESAI SATU.', at: tI, fx: 'slam', color: PAL.ink, fit: 0.85 }], { cy: 860 }), t);
      ctx.restore();
    }
    return;
  }
  bg(PAL.sun);
  K.echoWall(ctx, 'PILIH', t, { font: FONT.black, color: PAL.ink, alpha: 0.1, size: 300, speed: 120, rows: 7, y0: -30 });
  const breathe = 1 + 0.012 * Math.sin((t - tC) * 2.2);
  ctx.save(); ctx.translate(540, 860); ctx.scale(breathe, breathe); ctx.translate(-540, -860);
  D(S([{ text: 'PILIH SATU.', at: tC, fx: 'slam', color: PAL.ink, fit: 0.85 }], { cy: 820 }), t, { color: PAL.ink });
  ctx.restore();
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id, s.next);
  const p = clamp((t - a) / Math.max(0.5, b - a));
  const [dx, dy] = K.shake(t, HITS, 16);
  ctx.save();
  K.punch(ctx, 1 + 0.035 * ease.inOutSine(p), 540, 860, dx, dy); // slow push on every shot + shake on impacts
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const [bi, bn] = K.beatIndex(AM, t);
  K.crumbs(ctx, t, { color: K.ON[FIELD].ink, label: 'FOKUS SATU HAL', beat: bi, beats: bn, dur: AM.duration, alpha: 0.75 });
  for (const h of HITS) { const k = K.impact(t, h, 0.08); if (k) { ctx.fillStyle = `rgba(255,255,255,${0.18 * k})`; ctx.fillRect(0, 0, AM.W, AM.H); } }
  const end = clamp((t - (AM.duration - 0.3)) / 0.3); // soft close
  if (end > 0) { ctx.fillStyle = `rgba(14,14,14,${end})`; ctx.fillRect(0, 0, AM.W, AM.H); }
}
