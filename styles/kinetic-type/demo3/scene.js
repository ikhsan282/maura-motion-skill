// Kinetic Type — Demo 3: Hukum Parkinson & Efek Satu Persen (37x Lipat)
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

  for (const k of ['hook', 'parkinson', 'kelonggaran', 'potong', 'satu_persen', 'lipat', 'konsisten', 'penutup']) {
    if (C[k]) {
      HITS.push(C[k].start);
      AM.sfx('impact', C[k].start, { gain: 0.42 });
    }
  }
  AM.sfx('scratch', C.kelonggaran.start + 1.0, { gain: 0.35 });
  AM.sfx('tick', C.potong.start + 0.6, { gain: 0.4 });
  AM.sfx('whoosh', C.lipat.start + 0.4, { gain: 0.4, pitch: 1.2 });
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

  if (t < C.parkinson.start) {
    const a = C.hook.start;
    bg(PAL.sun);
    K.echoWall(ctx, '02 JAM', t, { color: PAL.ink, alpha: 0.12, size: 340, speed: 80, rows: 7, y0: -40 });
    const r = S([
      { text: 'TUGAS 2 JAM', font: FONT.black, at: a + 0.05, fx: 'slam', color: PAL.ink },
      { text: 'KENAPA MOLOR', fit: 0.8, at: a + 0.5, fx: 'rise', color: PAL.tomato },
      { text: 'SEMINGGU PENUH?', font: FONT.black, at: a + 1.1, fx: 'slam', color: PAL.ink, accent: PAL.tomato },
    ], { cy: 860, gap: 38 });
    D(r, t);
  } else if (t < C.kelonggaran.start) {
    const a = C.parkinson.start;
    bg(PAL.ink);
    K.echoWall(ctx, 'PARKINSON', t, { color: PAL.paper, alpha: 0.1, size: 300, speed: 70, rows: 7, y0: -30 });
    const r = S([
      { text: 'HUKUM PARKINSON:', fit: 0.78, at: a + 0.05, fx: 'slam', color: PAL.sun },
      { text: 'PEKERJAAN', font: FONT.black, at: a + 0.45, fx: 'slam', color: PAL.paper },
      { text: 'SELALU MEMUAI', at: a + 0.9, fx: 'stretch', color: PAL.tomato },
      { text: 'MENGISI WAKTU.', at: a + 1.4, fx: 'rise', color: PAL.paper, accent: PAL.sun },
    ], { cy: 860, gap: 34 });
    D(r, t);
  } else if (t < C.potong.start) {
    const a = C.kelonggaran.start;
    bg(PAL.tomato);
    const r = S([
      { text: 'JATAH 7 HARI', font: FONT.black, at: a + 0.05, fx: 'slam', color: PAL.ink },
      { text: 'TUNDA TERUS', at: a + 0.55, fx: 'rise', color: PAL.paper },
      { text: 'MALAM TERAKHIR.', font: FONT.black, at: a + 1.1, fx: 'slam', color: PAL.sun, accent: PAL.ink },
    ], { top: 250, gap: 34 });
    D(r, t);
    K.strike(ctx, K.rowBox(ctx, r[0]), (t - (a + 0.8)) / 0.25, { color: PAL.paper, thick: 22 });
    K.tally(ctx, 180, 1340, Math.min(15, Math.floor((t - a) * 5)), { color: PAL.ink, h: 140, gap: 42, w: 16 });
  } else if (t < C.satu_persen.start) {
    const a = C.potong.start;
    bg(PAL.paper);
    const r = S([
      { text: 'PANGKAS WAKTU', font: FONT.black, at: a + 0.05, fx: 'slam', color: PAL.ink },
      { text: 'JADI SEPARUH.', at: a + 0.55, fx: 'rise', color: PAL.tomato, accent: PAL.ink },
    ], { top: 240, gap: 32 });
    D(r, t);
    const p = clamp((t - a - 0.3) / 2.2);
    K.stopwatch(ctx, 540, 1140, 210 * K.spring(t - a, { freq: 2.6, damp: 0.55 }), {
      color: PAL.ink,
      accent: PAL.tomato,
      face: PAL.sun,
      p,
      hand: p * Math.PI * 2,
      label: K.mmss(1800 * (1 - p * 0.5)),
    });
  } else if (t < C.lipat.start) {
    const a = C.satu_persen.start;
    bg(PAL.cobalt);
    K.echoWall(ctx, '+1% HARI INI', t, { color: PAL.paper, alpha: 0.1, size: 300, speed: 65, rows: 7, y0: -30 });
    const r = S([
      { text: 'MEMBAIK +1%', font: FONT.black, at: a + 0.05, fx: 'slam', color: PAL.sun },
      { text: 'SETIAP HARI', at: a + 0.5, fx: 'rise', color: PAL.paper },
      { text: '365 PERSEN', font: FONT.black, at: a + 1.0, fx: 'slam', color: PAL.paper },
    ], { cy: 860, gap: 38 });
    D(r, t);
    K.strike(ctx, K.rowBox(ctx, r[2]), (t - (a + 1.45)) / 0.25, { color: PAL.tomato, thick: 22 });
  } else if (t < C.konsisten.start) {
    const a = C.lipat.start;
    bg(PAL.sun);
    const r = S([
      { text: '1,01 ^ 365 =', fit: 0.72, at: a + 0.05, fx: 'rise', color: PAL.ink },
      { text: '37,7 KALI', font: FONT.black, at: a + 0.5, fx: 'slam', color: PAL.tomato },
      { text: 'LIPAT!', font: FONT.black, at: a + 0.95, fx: 'slam', color: PAL.ink, accent: PAL.tomato },
    ], { top: 230, gap: 32 });
    D(r, t);
    K.stairs(ctx, 130, 1420, 820, 420, 7, clamp((t - a - 0.35) / 1.6), { color: PAL.ink });
  } else if (t < C.penutup.start) {
    const a = C.konsisten.start;
    bg(PAL.ink);
    const r = S([
      { text: 'TENGGAT PENDEK', at: a + 0.05, fx: 'slam', color: PAL.sun },
      { text: '+ CICIL 1% TIAP HARI', fit: 0.85, at: a + 0.55, fx: 'rise', color: PAL.paper },
      { text: 'ANTI TUNDA.', font: FONT.black, at: a + 1.1, fx: 'slam', color: PAL.ink },
    ], { cy: 860, gap: 40 });
    K.boxBehind(ctx, K.rowBox(ctx, r[2]), (t - (a + 1.08)) / 0.22, { color: PAL.tomato, pad: 20 });
    D(r, t);
  } else {
    const a = C.penutup.start;
    bg(PAL.tomato);
    K.echoWall(ctx, '37X LIPAT', t, { font: FONT.black, color: PAL.ink, alpha: 0.12, size: 300, speed: 60, rows: 7, y0: -30 });
    const r = S([
      { text: 'PERSEMPIT WAKTU.', at: a + 0.05, fx: 'slam', color: PAL.paper, accent: PAL.sun },
      { text: 'CICIL 1% HARI INI.', at: a + 0.45, fx: 'slam', color: PAL.sun, accent: PAL.ink },
      { text: 'MENANGKAN TAHUN INI.', font: FONT.black, at: a + 0.9, fx: 'slam', color: PAL.ink, accent: PAL.paper },
    ], { top: 260, gap: 36 });
    D(r, t);
    K.ballot(ctx, 540, 1260, 0.95, { color: PAL.ink, accent: PAL.sun, p: clamp((t - a - 0.7) / 0.6) });
  }

  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const [bi, bn] = K.beatIndex(AM, t);
  K.crumbs(ctx, t, { color: K.ON[FIELD].ink, label: 'PARKINSON × 1%', beat: bi, beats: bn, dur: AM.duration, alpha: 0.78 });
}

