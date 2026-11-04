// Swiss / Bauhaus Grid — Demo 2: Rahasia Grid Swiss & Josef Müller-Brockmann
import * as K from '/styles/swiss-bauhaus/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'clean', y: 1520, size: 54 } };

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// Shot 1: Hook — Invisible Mathematical Grid
shot('hook', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'SWISS STYLE · ZURICH 1950', step: 1, total: 8 });
  K.drawSwissHeader(ctx, 'GRID', 'RAHASIA DESAIN', 'TENANG & RAPI.', 'Struktur Matematika di Balik Poster & Layar', prog(t, a, a + 0.5), K.PAL.red);

  const p = prog(t, a + 0.1, a + 0.9);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const kp = ease.outCubic(clamp(p * 1.4 - idx * 0.08));
      const x = 230 + c * 310, y = 600 + r * 260;
      const fill = idx === 0 ? K.PAL.red : idx === 4 ? K.PAL.blue : idx === 8 ? K.PAL.yellow : '#ffffff';
      K.card(ctx, x, y, 270 * kp, 220 * kp, fill, { stroke: K.PAL.ink, lw: 6 });
      K.label(ctx, `M${r + 1}:${c + 1}`, x, y, { size: 28, color: fill === K.PAL.red || fill === K.PAL.blue ? '#fff' : K.PAL.ink, mono: true, p: kp });
    }
  }
});

// Shot 2: Swiss 1950s — Zurich & Basel
shot('swiss', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'ZURICH & BASEL · 1952', step: 2, total: 8 });
  K.drawSwissHeader(ctx, '1950s', 'GAYA TIPOGRAFI', 'INTERNASIONAL.', 'Kejelasan Objektif dari Zurich & Basel', prog(t, a, a + 0.5), K.PAL.blue);

  const p = prog(t, a + 0.15, a + 0.85);
  K.card(ctx, 540, 840, 936, 720, '#ffffff', { stroke: K.PAL.ink, lw: 8 });
  // Swiss Red Cross Flag emblem on left module
  ctx.fillStyle = K.PAL.red;
  ctx.fillRect(130, 560, 340 * p, 340 * p);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(265, 625, 70 * p, 210 * p);
  ctx.fillRect(195, 695, 210 * p, 70 * p);

  K.title(ctx, 'HELVETICA', 520, 640, { size: 68, align: 'left', p });
  K.title(ctx, 'UNIVERS', 520, 735, { size: 68, align: 'left', color: K.PAL.blue, p });
  K.title(ctx, 'AKZIDENZ', 520, 830, { size: 68, align: 'left', color: K.PAL.red, p });
  K.label(ctx, 'OBJEKTIF · BEBAS ORNAMEN · UNIVERSAL', 540, 1060, { size: 30, mono: true, p });
});

// Shot 3: Grid & Gutter — Müller-Brockmann
shot('grid', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'MÜLLER-BROCKMANN · MODULAR GRID', step: 3, total: 8 });
  K.drawSwissHeader(ctx, 'MODUL', 'PETAK KOLOM &', 'SELASAR GUTTER.', 'Josef Müller-Brockmann: Grid Systems in Graphic Design', prog(t, a, a + 0.5), K.PAL.yellow);

  const p = prog(t, a + 0.15, a + 0.85);
  for (let i = 0; i < 6; i++) {
    const x = 140 + i * 160;
    const h = 680 * ease.outCubic(clamp(p * 1.3 - i * 0.08));
    K.card(ctx, x, 840, 124, h, i % 2 === 0 ? K.PAL.blue : '#ffffff', { stroke: K.PAL.ink, lw: 5 });
    K.label(ctx, `C${i + 1}`, x, 840, { size: 28, color: i % 2 === 0 ? '#fff' : K.PAL.ink, mono: true });
  }
  K.card(ctx, 540, 1275, 936, 100, K.PAL.ink);
  K.label(ctx, '6 KOLOM + SELASAR GUTTER 36 PX PRESISI', 540, 1275, { size: 28, color: K.PAL.yellow, mono: true });
});

// Shot 4: Flush Left Grotesque Typography
shot('kiri', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'FLUSH LEFT · RAGGED RIGHT', step: 4, total: 8 });
  K.drawSwissHeader(ctx, 'TEKS', 'RATA KIRI TEGAS,', 'TANPA HIASAN.', 'Tipografi Sans-Serif Mengikuti Alur Baca Alami Mata', prog(t, a, a + 0.5), K.PAL.red);

  const lines = [
    ['01', 'GARIS PANGKAL KIRI KONSISTEN', K.PAL.ink],
    ['02', 'HIRARKI UKURAN HURUF KONTRAS', K.PAL.red],
    ['03', 'TANPA HURUF KAIT (SANS-SERIF)', K.PAL.blue],
    ['04', 'JARAK ANTARBARIS MATEMATIS', K.PAL.ink],
  ];
  lines.forEach(([num, txt, col], i) => {
    const p = ease.outCubic(prog(t, a + 0.15 + i * 0.18, a + 0.65 + i * 0.18));
    const y = 550 + i * 190;
    K.card(ctx, 540, y, 936 * p, 145, '#ffffff', { stroke: K.PAL.ink, lw: 6 });
    ctx.fillStyle = col;
    ctx.fillRect(72, y - 72, 130 * p, 145);
    K.label(ctx, num, 137, y, { size: 38, color: '#ffffff', mono: true, p });
    K.label(ctx, txt, 240, y, { size: 34, color: K.PAL.ink, align: 'left', p });
  });
});

// Shot 5: Asymmetric Balance
shot('asimetri', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'KESEIMBANGAN ASIMETRIS', step: 5, total: 8 });
  K.drawSwissHeader(ctx, 'BOBOT', 'ASIMETRI &', 'RUANG KOSONG.', 'Bentuk Padat di Kiri Diimbangi Ruang Lega di Kanan', prog(t, a, a + 0.5), K.PAL.blue);

  const p = ease.outCubic(prog(t, a + 0.15, a + 0.8));
  // Heavy red block on left 4 columns
  K.card(ctx, 384, 830, 624 * p, 640 * p, K.PAL.red, { stroke: K.PAL.ink, lw: 8 });
  K.title(ctx, 'MASSA', 384, 790, { size: 78, color: '#ffffff', p });
  K.label(ctx, '4 KOLOM KIRI', 384, 880, { size: 30, color: K.PAL.yellow, mono: true, p });

  // Open white space on right 2 columns with small counter-weight circle
  ctx.fillStyle = K.PAL.ink;
  ctx.beginPath();
  ctx.arc(852, 620, 56 * p, 0, Math.PI * 2);
  ctx.fill();
  K.label(ctx, 'RUANG\nNEGATIF', 852, 760, { size: 28, color: K.PAL.ink, mono: true, p });
});

// Shot 6: Tonhalle Zurich Concert Poster Arcs
shot('musik', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'TONHALLE ZURICH · BEETHOVEN 1955', step: 6, total: 8 });
  K.drawSwissHeader(ctx, 'IRAMA', 'POSTER KONSER', 'TONHALLE ZURICH.', 'Lengkungan Busur Lingkaran Mengikuti Ketukan Simfoni', prog(t, a, a + 0.5), K.PAL.ink);
  K.drawSwissArcs(ctx, 540, 860, 1.15, t, prog(t, a + 0.1, a + 0.85));
});

// Shot 7: 12-Column Web & App Grid
shot('web', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'CSS GRID & UI DESIGN · 12 KOLOM', step: 7, total: 8 });
  K.drawSwissHeader(ctx, '12 COL', 'FONDASI WEB &', 'APLIKASI MODERN.', 'Dari Kertas Poster 1950 ke Layar Responsif', prog(t, a, a + 0.5), K.PAL.yellow);

  const p = prog(t, a + 0.15, a + 0.85);
  // Bento / 12-column responsive layout preview
  K.card(ctx, 306, 660, 468 * p, 280, K.PAL.blue, { stroke: K.PAL.ink, lw: 6 });
  K.label(ctx, 'HERO 6 KOLOM', 306, 660, { size: 30, color: '#ffffff', mono: true, p });

  K.card(ctx, 774, 660, 430 * p, 280, K.PAL.yellow, { stroke: K.PAL.ink, lw: 6 });
  K.label(ctx, 'NAV 6 KOLOM', 774, 660, { size: 30, color: K.PAL.ink, mono: true, p });

  for (let i = 0; i < 3; i++) {
    const x = 228 + i * 312;
    K.card(ctx, x, 1020, 286 * p, 320, i === 1 ? K.PAL.red : '#ffffff', { stroke: K.PAL.ink, lw: 6 });
    K.label(ctx, `KARTU 4 KOLOM`, x, 1020, { size: 24, color: i === 1 ? '#ffffff' : K.PAL.ink, mono: true, p });
  }
});

// Shot 8: Penutup
shot('penutup', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'PRINSIP ABADI · KEJERNIHAN VISUAL', step: 8, total: 8 });
  K.drawSwissHeader(ctx, 'JERNIH', 'MATEMATIKA DI', 'BALIK KEINDAHAN.', 'Struktur Presisi Membuat Pesan Berbicara Tanpa Berteriak', prog(t, a, a + 0.5), K.PAL.red);
  K.drawKandinskyTriad(ctx, 540, 860, 1.05, t, prog(t, a + 0.15, a + 0.8));
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

