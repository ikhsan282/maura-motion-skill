// Kinetic Type demo: "Efek Hal Kecil" — retakan 1% tiap hari, kecil x konsisten = besar. 20 s. Captions are off: the words ARE the picture.
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
  ctx = AM.layer('type');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const S = (type, t, o = {}) => AM.sfx(type, t, o);
  S('scratch', T('retak', 0) - 0.02, { gain: 0.5 });
  S('scratch', T('retak', 4) - 0.02, { gain: 0.4 });
  S('page_flip', T('persen', 4) - 0.05, { gain: 0.5 });
  S('whoosh', T('persen', 7) - 0.1, { gain: 0.35, pitch: 1.3 });
  S('tick', T('kecil', 4), { gain: 0.35 });
  S('thud', T('kecil', 8) - 0.02, { gain: 0.55, pitch: 0.8 });
  S('impact', T('contoh', 4) - 0.02, { gain: 0.55 });
  S('impact', T('akhir', 6) - 0.02, { gain: 0.55 });
  S('tick', T('akhir', 7) + 0.25, { gain: 0.3 });
  HITS.push(T('retak', 0), T('retak', 4), T('kecil', 4), T('kecil', 8), T('akhir', 6));
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

// ---------- 1. RETAKAN KECIL / menenggelamkan kapal besar. ----------
shot('retak', 'persen', (t) => {
  const t0 = T('retak', 0), t1 = T('retak', 2), t2 = T('retak', 4), t3 = T('retak', 6);
  if (t < t1) {
    bg(PAL.ink);
    K.echoWall(ctx, 'RETAKAN', t, { color: PAL.ink, alpha: 0.15, size: 400, speed: 80, rows: 6, y0: -40 });
    const r = S([{ text: 'RETAKAN', at: t0, fx: 'slam' }, { text: 'KECIL', at: t1, fx: 'drop', color: PAL.tomato }], { cy: 860, gap: 40 });
    D(r, t);
    const k = (t - t0) / 0.4;
    ctx.strokeStyle = PAL.tomato; ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(r[0].x - 40, r[0].base - 10);
    ctx.lineTo(r[0].x + 20 + 60 * clamp(k), r[0].base + 20);
    ctx.lineTo(r[0].x + 60 + 40 * clamp(k), r[0].base - 5);
    ctx.stroke();
    return;
  }
  if (t < t3) {
    bg(PAL.paper);
    const r = S([{ text: 'menenggelamkan', at: t2, fx: 'rise', color: PAL.ink }], { cy: 860 });
    D(r, t);
    // the crack grows through the ship
    const k = ease.outCubic(clamp((t - t2) / 0.6));
    ctx.save(); ctx.translate(540, 1100); ctx.rotate(-0.05 * k);
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(-60 * k, -80, 120 * k, 12);
    ctx.fillRect(-40 * k, -60, 80 * k, 8);
    ctx.fillRect(-20 * k, -40, 40 * k, 6);
    ctx.restore();
    return;
  }
  bg(PAL.tomato);
  const r = S([{ text: 'kapal besar.', at: t3, fx: 'slam', color: PAL.ink }], { cy: 860 });
  D(r, t);
  K.echoWall(ctx, 'BESAR', t, { color: PAL.ink, alpha: 0.12, size: 300, speed: 60, rows: 7, y0: -30 });
});

// ---------- 2. SATU PERSEN / lebih baik, / setiap hari. ----------
shot('persen', 'kecil', (t) => {
  const tB = T('persen', 2), tC = T('persen', 5), tD = T('persen', 7);
  if (t < tB) {
    bg(PAL.cobalt);
    K.echoWall(ctx, '1%', t, { color: PAL.paper, alpha: 0.12, size: 420, speed: 50, rows: 6, y0: -40 });
    const r = S([{ text: 'SATU', at: tB, fx: 'slam', color: PAL.sun }, { text: 'PERSEN', at: T('persen', 1), fx: 'rise' }], { cy: 860 });
    D(r, t, { color: PAL.paper });
    return;
  }
  if (t < tD) {
    bg(PAL.ink);
    const r = S([{ text: 'lebih baik,', at: tC, fx: 'rise', color: PAL.tomato }, { text: 'setiap', at: T('persen', 6), fx: 'rise', color: PAL.sun }], { cy: 860 });
    D(r, t, { color: PAL.paper });
    const k = clamp((t - tC) / 0.5);
    ctx.save(); ctx.translate(540, 1260);
    ctx.fillStyle = PAL.tomato;
    for (let i = 0; i < 10; i++) {
      const w = 120 * k * (0.5 + 0.5 * Math.sin(i * 0.7));
      ctx.fillRect(-w / 2, -4 + i * 12, w, 6);
    }
    ctx.restore();
    return;
  }
  bg(PAL.sun);
  const r = S([{ text: 'hari.', at: tD, fx: 'slam', color: PAL.ink, accent: PAL.tomato }], { cy: 860 });
  D(r, t);
});

// ---------- 3. KECIL dikali konsisten / sama dengan BESAR. ----------
shot('kecil', 'contoh', (t) => {
  const tB = T('kecil', 2), tC = T('kecil', 5), tD = T('kecil', 8);
  if (t < tB) {
    bg(PAL.paper);
    const r = S([{ text: 'KECIL', at: tB, fx: 'slam', color: PAL.ink }], { cy: 860 });
    D(r, t);
    const k = ease.outExpo(clamp((t - tB) / 0.3));
    ctx.save(); ctx.translate(540, 860); ctx.scale(k, k); ctx.translate(-540, -860);
    K.type(ctx, 'x', 540, 860, { font: FONT.black, size: 90, color: PAL.tomato, align: 'center' });
    ctx.restore();
    return;
  }
  if (t < tC) {
    bg(PAL.cobalt);
    const r = S([{ text: 'dikali', at: tC, fx: 'rise', color: PAL.paper }, { text: 'konsisten', at: T('kecil', 4), fx: 'rise', color: PAL.sun }], { cy: 860 });
    D(r, t, { color: PAL.paper });
    return;
  }
  if (t < tD) {
    bg(PAL.ink);
    const r = S([{ text: 'sama dengan', at: tD, fx: 'rise' }], { cy: 860 });
    D(r, t, { color: PAL.paper });
    const k = ease.outCubic(clamp((t - tD) / 0.5));
    ctx.save(); ctx.translate(540, 860); ctx.scale(1 + 0.3 * k, 1 + 0.3 * k); ctx.translate(-540, -860);
    K.type(ctx, 'BESAR.', 540, 860, { font: FONT.black, size: 120 * k, color: PAL.sun, align: 'center' });
    ctx.restore();
    return;
  }
  bg(PAL.tomato);
  D(S([{ text: 'BESAR.', at: tD, fx: 'slam', color: PAL.ink }], { cy: 860 }), t);
});

// ---------- 4. SATU HALAMAN / jadi SATU BUKU. / SATU LANGKAH / jadi SATU MARATON. ----------
shot('contoh', 'akhir', (t) => {
  const tB = T('contoh', 3), tC = T('contoh', 6), tD = T('contoh', 8), tE = T('contoh', 10);
  if (t < tC) {
    bg(PAL.paper);
    const r = S([{ text: 'SATU HALAMAN', at: tB, fx: 'slam' }], { cy: 860 });
    D(r, t);
    const k = ease.outExpo(clamp((t - tB) / 0.4));
    ctx.save(); ctx.translate(540, 1100); ctx.rotate(-0.08 * k);
    K.book(ctx, 0, 0, 0.8 + 1.2 * k, { color: PAL.ink, accent: PAL.tomato, open: 1, page: '#ffffff' });
    ctx.restore();
    return;
  }
  if (t < tD) {
    bg(PAL.ink);
    const r = S([{ text: 'jadi', at: tC, fx: 'rise', color: PAL.paper }, { text: 'SATU BUKU.', at: T('contoh', 5), fx: 'slam', color: PAL.sun }], { cy: 860 });
    D(r, t, { color: PAL.paper });
    return;
  }
  if (t < tE) {
    bg(PAL.sun);
    const r = S([{ text: 'SATU LANGKAH', at: tD, fx: 'slam' }], { cy: 860 });
    D(r, t);
    const k = ease.outExpo(clamp((t - tD) / 0.4));
    ctx.save(); ctx.translate(540, 1100);
    ctx.fillStyle = PAL.ink;
    for (let i = 0; i < 8; i++) {
      const y = 1100 + i * 20 * k;
      ctx.fillRect(300, y, 480, 8);
    }
    ctx.restore();
    return;
  }
  bg(PAL.cobalt);
  const r = S([{ text: 'jadi', at: tE, fx: 'rise', color: PAL.paper }, { text: 'SATU MARATON.', at: T('contoh', 11), fx: 'slam', color: PAL.sun }], { cy: 860 });
  D(r, t, { color: PAL.paper });
});

// ---------- 5. JANGAN REMEHKAN / yang kecil. / MULAI DARI yang kecil. ----------
shot('akhir', null, (t) => {
  const tB = T('akhir', 3), tC = T('akhir', 6);
  if (t < tB) {
    bg(PAL.ink);
    const r = S([{ text: 'JANGAN', at: T('akhir', 0), fx: 'rise', color: PAL.paper }, { text: 'REMEHKAN', at: T('akhir', 1), fx: 'rise', color: PAL.paper }, { text: 'yang', at: T('akhir', 2), fx: 'rise', color: PAL.tomato }], { cy: 860 });
    D(r, t, { color: PAL.paper });
    return;
  }
  if (t < tC) {
    bg(PAL.tomato);
    K.echoWall(ctx, 'KECIL', t, { color: PAL.ink, alpha: 0.1, size: 350, speed: 70, rows: 7, y0: -30 });
    const r = S([{ text: 'kecil.', at: tB, fx: 'slam', color: PAL.ink }], { cy: 860 });
    D(r, t);
    const k = ease.outCubic(clamp((t - tB) / 0.5));
    ctx.save(); ctx.translate(540, 1320); ctx.scale(k, k); ctx.translate(-540, -1320);
    K.type(ctx, 'mulai', 540, 1320, { font: FONT.black, size: 60, color: PAL.ink, align: 'center', track: 0.05 });
    ctx.restore();
    return;
  }
  bg(PAL.sun);
  const r = S([{ text: 'MULAI', at: tC, fx: 'slam', color: PAL.ink, accent: PAL.tomato }, { text: 'DARI', at: T('akhir', 7), fx: 'rise', color: PAL.ink }, { text: 'yang', at: T('akhir', 8), fx: 'rise', color: PAL.ink }, { text: 'kecil.', at: T('akhir', 9), fx: 'slam', color: PAL.ink }], { cy: 820, gap: 30 });
  D(r, t, { color: PAL.paper });
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id, s.next);
  const p = clamp((t - a) / Math.max(0.5, b - a));
  const [dx, dy] = K.shake(t, HITS, 16);
  ctx.save();
  K.punch(ctx, 1 + 0.035 * ease.inOutSine(p), 540, 860, dx, dy);
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const [bi, bn] = K.beatIndex(AM, t);
  K.crumbs(ctx, t, { color: K.ON[FIELD].ink, label: 'EFEK HAL KECIL', beat: bi, beats: bn, dur: AM.duration, alpha: 0.75 });
  for (const h of HITS) { const k = K.impact(t, h, 0.08); if (k) { ctx.fillStyle = `rgba(255,255,255,${0.18 * k})`; ctx.fillRect(0, 0, AM.W, AM.H); } }
  const end = clamp((t - (AM.duration - 0.3)) / 0.3);
  if (end > 0) { ctx.fillStyle = `rgba(14,14,14,${end})`; ctx.fillRect(0, 0, AM.W, AM.H); }
}
