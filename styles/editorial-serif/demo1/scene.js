// Editorial Serif — Demo 1: Kain yang Ditenun Setahun di Sumba (Tenun Ikat Hinggi Kombu)
import * as K from '/styles/editorial-serif/kit.js';
const { clamp, prog } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'editorial', y: 1560, size: 50 } };

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const HEADLINES = [
  {
    kicker: 'PROLOG · ARSIP TENUN NUSANTARA',
    lines: ['Selembar Kain yang', 'Ditenun *Setahun Penuh*'],
    sub: 'Lebih lama daripada membangun rumah: anatomi kesabaran di balik sehelai tekstil pusaka.',
    figTag: 'FIG. 01 · HINGGI KOMBU',
    caption: 'Kain Hinggi Kombu Sumba Timur dengan struktur simetris tiga lajur utama.',
  },
  {
    kicker: 'BAB I · GEOGRAFI SABANA',
    lines: ['Enam Bulan hingga', '*Tiga Tahun* Pengerjaan'],
    sub: 'Dari kampung pesisir Prailiu hingga Rende, hingga 42 tahapan ritual dan teknis dilalui.',
    figTag: 'FIG. 02 · STRUKTUR MOTIF',
    caption: 'Lajur tengah (Kambihu) diapit lajur bahu dengan ornamen fauna simbolis.',
  },
  {
    kicker: 'BAB II · TEKNIK RESIST IKAT',
    lines: ['Diikat Serat *Daun Gewang*', 'Helai demi Helai'],
    sub: 'Ratusan bundel benang lungsi diikat rapat sebelum dicelup untuk menahan resapan warna.',
    figTag: 'FIG. 03 · IKATAN LUNGSI',
    caption: 'Serat pucuk palem gewang (Corypha utan) tahan terhadap rendaman alkali & panas.',
  },
  {
    kicker: 'BAB III · FERMENTASI INDIGO',
    lines: ['Biru Tua dari Rendaman', '*Daun Nila* & Kapur Sirih'],
    sub: 'Indigofera tinctoria difermentasi di dalam tempayan tanah liat (kabala) tanpa zat sintetis.',
    figTag: 'FIG. 04 · EKSTRAKSI NILA',
    caption: 'Oksidasi cairan hijau kekuningan yang berubah menjadi biru gelap saat menyentuh udara.',
  },
  {
    kicker: 'BAB IV · PIGMEN AKAR KOMBU',
    lines: ['Merah Bata dari Kulit', '*Akar Mengkudu* & Loba'],
    sub: 'Morinda citrifolia ditumbuk bersama serat kulit kayu loba yang kaya aluminium alami (mordan).',
    figTag: 'FIG. 05 · PALET PIGMEN ALAM',
    caption: 'Tiga pigmen primer tenun Sumba: Worapi (Nila), Kombu (Mengkudu), dan Kuning Kayu.',
  },
  {
    kicker: 'BAB V · SIKLUS MUSIM KEMARAU',
    lines: ['Dicelup & Dijemur', '*Berulang Kali* Berbulan-bulan'],
    sub: 'Setiap pencelupan menambah kedalaman pigmen hingga serat kapas terkunci permanen.',
    figTag: 'FIG. 06 · KEDALAMAN WARNA',
    caption: 'Perbandingan saturasi warna Kombu dari celupan pertama hingga celupan ke-15.',
  },
  {
    kicker: 'BAB VI · ALAT TENUN GEDOGAN',
    lines: ['Motif *Kuda Njara* Muncul', 'Saat Ikatan Dibuka'],
    sub: 'Penyatuan benang lungsi dan pakan di atas alat tenun gendong kayu tradisional.',
    figTag: 'FIG. 07 · TENUN GEDOGAN',
    caption: 'Pergerakan teropong pakan mengunci presisi titik-titik motif ikat yang telah diwarnai.',
  },
  {
    kicker: 'EPILOG · ARSIP KEHIDUPAN',
    lines: ['Buku Sejarah yang', 'Membungkus *Siklus Hidup*'],
    sub: 'Pusaka adat dalam pernikahan, diplomasi antar-kabu, hingga selimut perjalanan menuju Marapu.',
    figTag: 'FIG. 08 · PUSAKA LELUHUR',
    caption: 'Kain Hinggi Kombu utuh sebagai penanda martabat, doa, dan kosmologi masyarakat Sumba.',
  },
];

export function render(t, AM) {
  const lines = AM.timeline.lines;
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (t >= lines[i].start - 0.1) idx = i;
  }
  const cur = lines[idx] || lines[0];
  const p = prog(t, cur.start, cur.start + 0.9);

  ctx.save();
  K.drawEditorialPage(ctx, t, {
    issue: 'JURNAL KRIYA NUSANTARA',
    rubric: 'ESAI TEKSTIL · SUMBA TIMUR',
    figNo: idx + 1,
    totalFigs: 8,
  });

  const h = HEADLINES[idx];
  K.drawEditorialHeadline(ctx, h.kicker, h.lines, h.sub, 180, clamp(p * 1.4, 0, 1));

  const figY = 505;
  const figH = 620;
  K.drawFigureFrame(ctx, 68, figY, 944, figH, h.figTag, h.caption, clamp(p * 1.2 - 0.05, 0, 1));

  if (idx === 0 || idx === 1 || idx === 4 || idx === 5 || idx === 7) {
    K.drawSumbaHinggi(ctx, 540, figY + 320, 740, 430, t, clamp(p * 1.15 - 0.1, 0, 1));
  } else if (idx === 2 || idx === 3) {
    K.drawEditorialPlate(ctx, 540, figY + 320, 'skein', t, clamp(p * 1.15 - 0.1, 0, 1));
  } else {
    K.drawEditorialPlate(ctx, 540, figY + 320, 'loom', t, clamp(p * 1.15 - 0.1, 0, 1));
  }

  const swatches = [
    { color: K.PAL.indigo, name: 'I. Worapi (Nila)', sub: 'INDIGOFERA · CELUP DINGIN' },
    { color: K.PAL.terracotta, name: 'II. Kombu (Mengkudu)', sub: 'MORINDA + MORDAN LOBA' },
    { color: K.PAL.ochre, name: 'III. Kayu Kuning', sub: 'CUDRANIA · SERAT GEWANG' },
  ];
  K.drawColorSwatches(ctx, 68, 1205, swatches, clamp(p * 1.1 - 0.15, 0, 1));
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
