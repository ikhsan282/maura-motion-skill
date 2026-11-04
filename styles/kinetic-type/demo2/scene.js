// Kinetic Type — Demo 2: Teknik Belajar Richard Feynman
import * as K from '/styles/kinetic-type/kit.js';
const { clamp, lerp, ease } = AM.lib;
const { PAL, FONT } = K;

export const meta = { fps: 24, hold: 1 };

let ctx, C = {};
const HITS = [];

export async function setup(AM) {
  await K.useAlignedWords(AM);
  ctx = AM.layer('type');
  for (const l of AM.timeline.lines) C[l.id] = l;

  for (const k of ['hook', 'tokoh', 'langkah1', 'langkah2', 'langkah3', 'langkah4', 'mitos', 'penutup']) {
    if (C[k]) {
      HITS.push(C[k].start);
      AM.sfx('impact', C[k].start, { gain: 0.42 });
    }
  }
  AM.sfx('scratch', C.langkah2.start + 1.4, { gain: 0.35 });
  AM.sfx('page_flip', C.langkah3.start + 0.8, { gain: 0.45 });
  AM.sfx('tick', C.penutup.start + 0.5, { gain: 0.4 });
}

let FIELD = PAL.ink;
function bg(c) {
  FIELD = c;
  K.field(ctx, c);
}
const ink = () => K.ON[FIELD].ink;
const S = (rows, o) => K.stack(ctx, rows, o);
const D = (rows, t, o) => K.drawStack(ctx, rows, t, { color: ink(), ...o });

export function render(t, AM) {
  const [dx, dy] = K.shake(t, HITS, 15);
  ctx.save();
  K.punch(ctx, 1 + 0.025 * Math.sin(t * 1.4), 540, 860, dx, dy);

  if (t < C.tokoh.start) {
    const a = C.hook.start;
    bg(PAL.tomato);
    K.echoWall(ctx, 'PAHAM?', t, { color: PAL.ink, alpha: 0.14, size: 340, speed: 85, rows: 7, y0: -40 });
    const r = S([
      { text: 'KALAU BELUM BISA', fit: 0.85, at: a + 0.05, fx: 'rise', color: PAL.paper },
      { text: 'MENJELASKAN', at: a + 0.45, fx: 'slam', color: PAL.ink },
      { text: 'SEDERHANA,', at: a + 0.9, fx: 'slam', color: PAL.sun },
      { text: 'BELUM PAHAM.', font: FONT.black, at: a + 1.5, fx: 'slam', color: PAL.ink, accent: PAL.paper },
    ], { cy: 860, gap: 34 });
    K.boxBehind(ctx, K.rowBox(ctx, r[3]), (t - (a + 1.48)) / 0.22, { color: PAL.paper, pad: 18 });
    D(r, t);
  } else if (t < C.langkah1.start) {
    const a = C.tokoh.start;
    bg(PAL.cobalt);
    K.echoWall(ctx, 'FEYNMAN', t, { color: PAL.paper, alpha: 0.1, size: 320, speed: 70, rows: 7, y0: -30 });
    const r = S([
      { text: 'TEKNIK BELAJAR', fit: 0.72, at: a + 0.05, fx: 'rise', color: PAL.sun },
      { text: 'RICHARD', font: FONT.black, at: a + 0.45, fx: 'slam', color: PAL.paper },
      { text: 'FEYNMAN.', font: FONT.black, at: a + 0.85, fx: 'slam', color: PAL.sun, accent: PAL.tomato },
      { text: 'PERAIH NOBEL FISIKA 1965', fit: 0.65, at: a + 1.4, fx: 'wipe', color: PAL.paper },
    ], { cy: 860, gap: 36 });
    D(r, t);
    K.underline(ctx, K.rowBox(ctx, r[2]), (t - (a + 1.1)) / 0.3, { color: PAL.tomato, thick: 16, gap: 20 });
  } else if (t < C.langkah2.start) {
    const a = C.langkah1.start;
    bg(PAL.paper);
    const r = S([
      { text: 'LANGKAH 01', fit: 0.48, at: a + 0.05, fx: 'slam', color: PAL.tomato },
      { text: 'AMBIL KERTAS', at: a + 0.4, fx: 'rise', color: PAL.ink },
      { text: 'TULIS TOPIK.', font: FONT.black, at: a + 0.85, fx: 'slam', color: PAL.ink, accent: PAL.tomato },
    ], { top: 240, gap: 32 });
    D(r, t);
    const pb = K.spring(t - a - 0.3, { freq: 2.5, damp: 0.58 });
    ctx.save();
    ctx.translate(540, 1260 + (1 - pb) * 320);
    K.book(ctx, 0, 0, 1.4, { color: PAL.ink, accent: PAL.tomato, open: 0, title: 'FISIKA\nKUANTUM', titleColor: PAL.sun });
    ctx.restore();
  } else if (t < C.langkah3.start) {
    const a = C.langkah2.start;
    bg(PAL.sun);
    const r = S([
      { text: 'LANGKAH 02', fit: 0.48, at: a + 0.05, fx: 'slam', color: PAL.tomato },
      { text: 'AJARI ANAK 12 TAHUN', fit: 0.88, at: a + 0.4, fx: 'rise', color: PAL.ink },
      { text: 'ISTILAH RUMIT', font: FONT.black, at: a + 0.95, fx: 'slam', color: PAL.ink },
      { text: 'BAHASA SEDERHANA.', at: a + 1.6, fx: 'slam', color: PAL.cobalt, accent: PAL.tomato },
    ], { cy: 860, gap: 36 });
    D(r, t);
    K.strike(ctx, K.rowBox(ctx, r[2]), (t - (a + 1.35)) / 0.25, { color: PAL.tomato, thick: 22 });
  } else if (t < C.langkah4.start) {
    const a = C.langkah3.start;
    bg(PAL.ink);
    const r = S([
      { text: 'LANGKAH 03', fit: 0.48, at: a + 0.05, fx: 'slam', color: PAL.sun },
      { text: 'MACET JELASKAN?', fit: 0.82, at: a + 0.4, fx: 'rise', color: PAL.paper, accent: PAL.tomato },
      { text: 'BUKA BUKU LAGI.', at: a + 0.9, fx: 'slam', color: PAL.sun, accent: PAL.tomato },
    ], { top: 240, gap: 32 });
    D(r, t);
    const pb = K.spring(t - a - 0.3, { freq: 2.4, damp: 0.6 });
    const fl = clamp((t - a - 0.8) / 0.7);
    ctx.save();
    ctx.translate(540, 1280 + (1 - pb) * 280);
    K.book(ctx, 0, 0, 1.5, { color: PAL.tomato, accent: PAL.sun, page: PAL.paper, open: 1, flip: fl });
    ctx.restore();
  } else if (t < C.mitos.start) {
    const a = C.langkah4.start;
    bg(PAL.cobalt);
    const r = S([
      { text: 'LANGKAH 04', fit: 0.48, at: a + 0.05, fx: 'slam', color: PAL.sun },
      { text: 'PAKAI ANALOGI', at: a + 0.4, fx: 'slam', color: PAL.paper },
      { text: 'SEHARI-HARI.', font: FONT.black, at: a + 0.85, fx: 'rise', color: PAL.sun, accent: PAL.tomato },
    ], { top: 240, gap: 32 });
    D(r, t);
    K.stairs(ctx, 140, 1360, 800, 420, 4, clamp((t - a - 0.4) / 1.4), { color: PAL.sun });
  } else if (t < C.penutup.start) {
    const a = C.mitos.start;
    bg(PAL.tomato);
    K.echoWall(ctx, 'PAHAM', t, { color: PAL.ink, alpha: 0.12, size: 330, speed: 75, rows: 7, y0: -40 });
    const r = S([
      { text: 'HAFALAN BUTA', font: FONT.black, at: a + 0.1, fx: 'slam', color: PAL.ink },
      { text: 'PEMAHAMAN', font: FONT.black, at: a + 0.8, fx: 'slam', color: PAL.paper },
      { text: 'SEUMUR HIDUP.', at: a + 1.3, fx: 'rise', color: PAL.sun, accent: PAL.ink },
    ], { cy: 860, gap: 40 });
    D(r, t);
    K.strike(ctx, K.rowBox(ctx, r[0]), (t - (a + 0.55)) / 0.25, { color: PAL.paper, thick: 22 });
  } else {
    const a = C.penutup.start;
    bg(PAL.ink);
    K.echoWall(ctx, 'SEDERHANA', t, { font: FONT.black, color: PAL.paper, alpha: 0.08, size: 280, speed: 55, rows: 7, y0: -30 });
    const r = S([
      { text: 'PELAJARI.', at: a + 0.05, fx: 'slam', color: PAL.paper, accent: PAL.tomato },
      { text: 'AJARKAN.', at: a + 0.4, fx: 'slam', color: PAL.sun, accent: PAL.tomato },
      { text: 'SEDERHANAKAN.', font: FONT.black, at: a + 0.8, fx: 'slam', color: PAL.tomato, accent: PAL.paper },
    ], { top: 250, gap: 34 });
    D(r, t);
    K.ballot(ctx, 540, 1260, 0.95, { color: PAL.paper, accent: PAL.sun, p: clamp((t - a - 0.7) / 0.6) });
  }

  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const [bi, bn] = K.beatIndex(AM, t);
  K.crumbs(ctx, t, { color: K.ON[FIELD].ink, label: 'TEKNIK FEYNMAN', beat: bi, beats: bn, dur: AM.duration, alpha: 0.78 });
}

