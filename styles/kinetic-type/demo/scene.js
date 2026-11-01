// Kinetic Type demo: "Aturan Dua Menit" (James Clear, Atomic Habits). 20 s. Captions are off: the words ARE the picture.
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
  S('page_flip', T('contoh', 4) - 0.05, { gain: 0.5 });
  S('whoosh', T('contoh', 7) - 0.1, { gain: 0.35, pitch: 1.3 });
  S('impact', T('tapi', 4) - 0.02, { gain: 0.45 });
  S('thud', T('tapi', 8) - 0.02, { gain: 0.55, pitch: 0.8 });
  S('tick', T('akhir', 4), { gain: 0.35 });
  S('impact', T('akhir', 6) - 0.02, { gain: 0.55 });
  S('tick', T('akhir', 7) + 0.25, { gain: 0.3 });
  HITS.push(T('hook', 0), T('hook', 3), T('tapi', 4), T('tapi', 8), T('akhir', 6));
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
/** Draw row r as if it were moving from box `from` (an earlier layout of the same row) to its own place. */
function moved(r, from, k, t) {
  const s = lerp(from.size / r.size, 1, k);
  ctx.save(); ctx.translate(lerp(from.x, r.x, k), lerp(from.base, r.base, k)); ctx.scale(s, s); ctx.translate(-r.x, -r.base);
  K.drawRow(ctx, r, t, { color: ink() }); ctx.restore();
}

// ---------- 1. HOOK: KAMU TIDAK BUTUH / MOTIVASI. ~~ / KAMU BUTUH / DUA MENIT. ----------
shot('hook', 'aturan', (t) => {
  const t0 = T('hook', 0), tM = T('hook', 3), tK = T('hook', 4), tD = T('hook', 6);
  if (t < t0) { // pre-roll flash: the promise, moving on frame 0
    bg(PAL.tomato);
    K.echoWall(ctx, '02:00', t, { color: PAL.ink, alpha: 0.18, size: 420, speed: 260, rows: 6, y0: -40 });
    const r = S([{ text: '02:00', font: FONT.black }], { cy: 860 });
    const s = 1.12 - 0.12 * ease.outCubic(clamp(t / 0.3));
    ctx.save(); ctx.translate(540, 860); ctx.scale(s, s); ctx.translate(-540, -860); D(r, t); ctx.restore();
    return;
  }
  if (t < tM) {
    bg(PAL.ink);
    const r = S([{ text: 'KAMU', at: t0, fx: 'slam' }, { text: 'TIDAK BUTUH', parts: [{ text: 'TIDAK', at: T('hook', 1), fx: 'rise' }, { text: 'BUTUH', at: T('hook', 2), fx: 'rise', color: PAL.tomato }] }], { cy: 860 });
    D(r, t);
    return;
  }
  if (t < tD) {
    bg(PAL.tomato);
    K.echoWall(ctx, 'MOTIVASI', t, { color: PAL.ink, alpha: 0.12, size: 330, speed: 90, rows: 7, y0: -60 });
    const big = S([{ text: 'MOTIVASI.', at: tM, fx: 'slam' }], { cy: 860 })[0];
    const lay = S([{ text: 'MOTIVASI.', fit: 0.7 }, { text: 'KAMU', at: tK, fx: 'slam', color: PAL.paper }, { text: 'BUTUH', at: T('hook', 5), fx: 'rise' }], { cy: 880, gap: 34 });
    const k = ease.outExpo(clamp((t - tK) / 0.3));
    if (t < tK) K.drawRow(ctx, big, t, { color: PAL.ink, accent: PAL.paper });
    else { moved({ ...lay[0], at: tM, fx: 'slam' }, big, k, t); K.strike(ctx, K.rowBox(ctx, lay[0]), (t - tK - 0.1) / 0.25, { color: PAL.ink }); }
    D(lay.slice(1), t);
    return;
  }
  bg(PAL.sun);
  const r = S([{ text: 'DUA', fit: 0.5, at: tD, fx: 'slam' }, { text: 'MENIT.', at: T('hook', 7), fx: 'slam', accent: PAL.tomato }], { cy: 900, gap: 40 });
  D(r, t);
  const p = ease.inOutCubic(clamp((t - T('hook', 7) - 0.05) / 0.5));
  K.stopwatch(ctx, 760, r[0].base - r[0].cap / 2 + 18, 140 * K.spring(t - tD, { freq: 3, damp: 0.5 }), { p, hand: p * Math.PI * 2 });
});

// ---------- 2. ATURAN DUA MENIT, / dari JAMES CLEAR (the book) ----------
shot('aturan', 'contoh', (t) => {
  const tB = T('aturan', 3);
  if (t < tB) {
    bg(PAL.paper);
    const r = S([{ text: 'ATURAN', at: T('aturan', 0), fx: 'slam' }, { text: 'DUA MENIT,', parts: [{ text: 'DUA', at: T('aturan', 1), fx: 'rise' }, { text: 'MENIT,', at: T('aturan', 2), fx: 'rise' }], color: PAL.tomato }], { cy: 860 });
    D(r, t);
    K.underline(ctx, K.rowBox(ctx, r[0]), (t - T('aturan', 1)) / 0.35, { color: PAL.ink, thick: 14, gap: 18 });
    return;
  }
  bg(PAL.cobalt);
  const k = 1 - ease.outExpo(clamp((t - tB + 0.12) / 0.3));
  ctx.save(); ctx.translate(k * 700, 0); // whip in from the right
  D(S([{ text: 'DARI', fit: 0.3, at: tB, fx: 'cut' }], { top: 250 }), t, { color: PAL.paper });
  const pb = K.spring(t - tB, { freq: 2.6, damp: 0.55 });
  ctx.save(); ctx.translate(540, 1010 + (1 - pb) * 500); ctx.rotate(-0.05 * (1 - pb) + 0.02 * Math.sin(t * 1.3));
  K.book(ctx, 0, 0, 1.4, { color: PAL.sun, accent: PAL.ink, open: 0, title: 'ATOMIC\nHABITS', titleColor: PAL.ink });
  ctx.restore();
  const nm = S([{ text: 'JAMES CLEAR.', parts: [{ text: 'JAMES', at: T('aturan', 4), fx: 'rise' }, { text: 'CLEAR.', at: T('aturan', 5), fx: 'rise' }] }], { top: 1100 });
  D(nm, t, { color: PAL.paper, accent: PAL.sun });
  K.underline(ctx, K.rowBox(ctx, nm[0]), (t - T('aturan', 5) - 0.15) / 0.3, { color: PAL.sun, thick: 14, gap: 20 });
  ctx.restore();
});

// ---------- 3. MEMBACA? BACA SATU HALAMAN. / LARI? IKAT TALI SEPATUMU. ----------
shot('contoh', 'tapi', (t) => {
  const tB = T('contoh', 3), tC = T('contoh', 6), tD = T('contoh', 8);
  if (t < tB) {
    bg(PAL.cobalt);
    K.echoWall(ctx, 'BACA', t, { color: PAL.paper, alpha: 0.1, size: 380, speed: 70, rows: 6, y0: -40 });
    const r = S([{ text: 'MAU RAJIN', fit: 0.75, parts: [{ text: 'MAU', at: T('contoh', 0), fx: 'rise' }, { text: 'RAJIN', at: T('contoh', 1), fx: 'rise' }] }, { text: 'MEMBACA?', at: T('contoh', 2), fx: 'slam', color: PAL.sun, accent: PAL.tomato }], { cy: 860 });
    D(r, t, { color: PAL.paper });
    return;
  }
  if (t < tC) {
    bg(PAL.paper);
    D(S([{ text: 'BACA', fit: 0.42, at: tB, fx: 'slam', gap: 30 }, { text: 'SATU HALAMAN.', parts: [{ text: 'SATU', at: T('contoh', 4), fx: 'rise', color: PAL.tomato }, { text: 'HALAMAN.', at: T('contoh', 5), fx: 'rise' }], accent: PAL.tomato }], { top: 230 }), t);
    const pb = K.spring(t - tB, { freq: 2.4, damp: 0.6 });
    ctx.save(); ctx.translate(540, 1260 + (1 - pb) * 300); ctx.rotate(-0.03 + 0.01 * Math.sin(t * 1.7));
    const fl = (t - T('contoh', 4) + 0.05) / 0.5;
    K.book(ctx, 0, 0, 1.55 * (0.6 + 0.4 * pb), { color: PAL.ink, accent: PAL.tomato, page: '#ffffff', open: 1, flip: fl < 0 ? -1 : Math.min(1, fl) });
    ctx.restore();
    return;
  }
  if (t < tD) {
    bg(PAL.tomato);
    const r = S([{ text: 'MAU', fit: 0.4, at: tC, fx: 'rise' }, { text: 'LARI?', at: T('contoh', 7), color: PAL.paper, accent: PAL.ink }], { cy: 860 });
    D(r.slice(0, 1), t);
    const tl = T('contoh', 7);
    if (t >= tl) { // the word runs in: italic skew + speed lines
      const R = r[1], k = ease.outExpo(clamp((t - tl) / 0.3));
      ctx.fillStyle = PAL.ink;
      for (let i = 0; i < 5; i++) { const L = 260 * k * (0.6 + 0.4 * Math.sin(t * 9 + i)); ctx.fillRect(R.x - L - 30 + (1 - k) * -400, R.base - R.cap * (0.15 + i * 0.17), L, 14); }
      ctx.save(); ctx.translate(R.x + (1 - k) * -500, R.base); ctx.transform(1, 0, -0.22, 1, 0, 0); ctx.translate(-R.x, -R.base);
      K.drawRow(ctx, { ...R, fx: 'cut' }, t, { color: PAL.paper }); ctx.restore();
    }
    return;
  }
  bg(PAL.sun);
  D(S([{ text: 'IKAT TALI', parts: [{ text: 'IKAT', at: tD, fx: 'slam' }, { text: 'TALI', at: T('contoh', 9), fx: 'rise', color: PAL.tomato }] }], { top: 260 }), t);
  const lace = clamp((t - tD) / (T('contoh', 10) + 0.3 - tD));
  const ps = K.spring(t - tD + 0.1, { freq: 2.2, damp: 0.6 });
  K.shoe(ctx, 200 + (1 - ps) * -700, 1150, 1.6, { color: PAL.ink, accent: PAL.sun, lace: ease.inOutCubic(lace) });
  D(S([{ text: 'SEPATUMU.', at: T('contoh', 10), fx: 'slam', accent: PAL.tomato }], { top: 1230 }), t);
});

// ---------- 4. TERLALU kecil? / JUSTRU ITU INTINYA. / YANG BERAT CUMA MULAI. (the turn) ----------
shot('tapi', 'akhir', (t) => {
  const tB = T('tapi', 2), tC = T('tapi', 5), tD = T('tapi', 8);
  if (t < tB) {
    bg(PAL.paper);
    D(S([{ text: 'TERLALU', at: T('tapi', 0), fx: 'drop', ghost: true }], { top: 300 }), t);
    const tk = T('tapi', 1);
    if (t >= tk) { // the tiny word, circled
      const k = K.spring(t - tk, { freq: 4, damp: 0.5 });
      K.type(ctx, 'kecil?', 540, 1120, { font: FONT.black, size: 48 * k, color: PAL.ink, align: 'center', track: -0.02 });
      ctx.strokeStyle = PAL.tomato; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(540, 1104, 120, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease.outCubic(clamp((t - tk - 0.05) / 0.35))); ctx.stroke();
      const lp = ease.outCubic(clamp((t - tk - 0.25) / 0.25));
      ctx.fillStyle = PAL.tomato; ctx.fillRect(650, 1020, 150 * lp, 8);
      if (lp > 0.9) K.type(ctx, '(SERIUS?)', 810, 1034, { font: FONT.mono, size: 30, color: PAL.tomato });
    }
    return;
  }
  if (t < tC) {
    bg(PAL.ink);
    const tI = T('tapi', 4);
    const r = S([{ text: 'JUSTRU ITU', parts: [{ text: 'JUSTRU', at: tB, fx: 'slam' }, { text: 'ITU', at: T('tapi', 3), fx: 'slam', color: PAL.sun }], fit: 0.85, gap: 50 }, { text: 'INTINYA.', at: tI, fx: 'slam', color: PAL.ink }], { cy: 860 });
    K.boxBehind(ctx, K.rowBox(ctx, r[1]), (t - tI + 0.04) / 0.18, { color: PAL.sun, pad: 22 });
    D(r, t, { color: PAL.paper, accent: PAL.tomato });
    return;
  }
  if (t < tD) {
    bg(PAL.cobalt);
    K.echoWall(ctx, 'BERAT', t, { font: FONT.black, color: PAL.paper, alpha: 0.12, size: 300, speed: 60, rows: 7, y0: -30 });
    D(S([{ text: 'YANG', fit: 0.4, at: tC, fx: 'rise' }, { text: 'BERAT', font: FONT.black, at: T('tapi', 6), fx: 'fall', color: PAL.sun }, { text: 'CUMA', fit: 0.4, at: T('tapi', 7), fx: 'rise' }], { cy: 860 }), t, { color: PAL.paper });
    return;
  }
  bg(PAL.sun);
  K.echoWall(ctx, 'MULAI', t, { font: FONT.black, color: PAL.ink, alpha: 0.1, size: 300, speed: 120, rows: 7, y0: -30 });
  D(S([{ text: 'MULAI.', font: FONT.black, at: tD, fx: 'slam', accent: PAL.tomato }], { cy: 860 }), t);
});

// ---------- 5. JANGAN TUNGGU ~~SEMANGAT~~. / PASANG DUA MENIT. / MULAI SEKARANG. ----------
shot('akhir', null, (t) => {
  const tB = T('akhir', 3), tC = T('akhir', 6);
  if (t < tB) {
    bg(PAL.ink);
    const r = S([{ text: 'JANGAN', fit: 0.7, at: T('akhir', 0), fx: 'rise' }, { text: 'TUNGGU', at: T('akhir', 1), fx: 'rise' }, { text: 'SEMANGAT.', at: T('akhir', 2), fx: 'slam', color: PAL.tomato }], { cy: 860 });
    D(r, t, { color: PAL.paper });
    K.strike(ctx, K.rowBox(ctx, r[2]), (t - T('akhir', 2) - 0.3) / 0.22, { color: PAL.paper });
    return;
  }
  if (t < tC) {
    bg(PAL.sun);
    D(S([{ text: 'PASANG', fit: 0.5, at: tB, fx: 'slam' }], { top: 230 }), t);
    D(S([{ text: 'DUA MENIT.', parts: [{ text: 'DUA', at: T('akhir', 4), fx: 'rise' }, { text: 'MENIT.', at: T('akhir', 5), fx: 'rise' }], accent: PAL.tomato }], { top: 1170 }), t);
    const p = ease.inOutCubic(clamp((t - T('akhir', 4)) / (T('akhir', 5) + 0.3 - T('akhir', 4))));
    K.stopwatch(ctx, 540, 790, 220 * K.spring(t - tB, { freq: 2.6, damp: 0.5 }), { p, hand: p * Math.PI * 2, label: K.mmss(120 * p) });
    return;
  }
  bg(PAL.ink);
  K.echoWall(ctx, 'MULAI', t, { font: FONT.black, color: PAL.paper, alpha: 0.08, size: 300, speed: 50, rows: 7, y0: -30 });
  const breathe = 1 + 0.012 * Math.sin((t - tC) * 2.2);
  ctx.save(); ctx.translate(540, 860); ctx.scale(breathe, breathe); ctx.translate(-540, -860);
  D(S([{ text: 'MULAI', font: FONT.black, at: tC, fx: 'slam' }, { text: 'SEKARANG.', at: T('akhir', 7), fx: 'rise', color: PAL.sun, accent: PAL.tomato }], { cy: 820 }), t, { color: PAL.paper });
  ctx.restore();
  // the countdown has started
  const run = Math.max(0, t - T('akhir', 7) - 0.2);
  const s = K.spring(t - T('akhir', 7), { freq: 3, damp: 0.5 });
  K.stopwatch(ctx, 540, 1320, 105 * s, { color: PAL.paper, face: PAL.ink, accent: PAL.tomato, p: 1 - run / 120, hand: -run * Math.PI * 2, label: null });
  if (s > 0.5) K.type(ctx, K.mmss(119.001 - run), 540, 1500, { font: FONT.mono, size: 44, color: PAL.paper, align: 'center', track: 0.05 });
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
  K.crumbs(ctx, t, { color: K.ON[FIELD].ink, label: 'ATURAN DUA MENIT', beat: bi, beats: bn, dur: AM.duration, alpha: 0.75 });
  for (const h of HITS) { const k = K.impact(t, h, 0.08); if (k) { ctx.fillStyle = `rgba(255,255,255,${0.18 * k})`; ctx.fillRect(0, 0, AM.W, AM.H); } }
  const end = clamp((t - (AM.duration - 0.3)) / 0.3); // soft close
  if (end > 0) { ctx.fillStyle = `rgba(14,14,14,${end})`; ctx.fillRect(0, 0, AM.W, AM.H); }
}
