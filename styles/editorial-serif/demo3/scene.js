// Editorial Serif — Demo 3: Anatomi Secangkir Kopi Nusantara (Terroir Vulkanik & Giling Basah)
import * as K from '/styles/editorial-serif/kit.js';
const { clamp, prog } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'editorial', y: 1560, size: 50 } };

let ctx;
export async function setup(AM) {
  ctx = AM.layer('world');
}

const HEADLINES = [
  {
    kicker: 'PROLOG · SPEKTRUM RASA NUSANTARA',
    lines: ['Mengapa Rasa Kopi *Gayo*,', 'Toraja & Flores Berbeda?'],
    sub: 'Menelusuri jejak geologi dan mikro-iklim di balik secangkir kopi spesialti Indonesia.',
    figTag: 'FIG. 01 · COFFEA ARABICA',
    caption: 'Penampang melintang buah ceri kopi matang (kulit eksokarp merah, musilago manis, dan dua biji).',
  },
  {
    kicker: 'BAB I · GEOLOGI CINCIN API',
    lines: ['Tumbuh di Atas Sabuk', '*Gunung Berapi* Aktif'],
    sub: 'Rangkaian pegunungan Bukit Barisan, Jawa, Bali, Flores, hingga dataran tinggi Sulawesi.',
    figTag: 'FIG. 02 · SABUK VULKANIK',
    caption: 'Peta sabuk cincin api tempat kebun-kebun kopi berada di lereng kaldera purba.',
  },
  {
    kicker: 'BAB II · KIMIA TANAH ANDISOL',
    lines: ['Abu Vulkanik Kaya', '*Kalium, Fosfor* & Magnesium'],
    sub: 'Tanah andisol vulkanik yang gembur menyimpan air hujan sekaligus mengalirkan oksigen ke akar.',
    figTag: 'FIG. 03 · NUTRISI MINERAL',
    caption: 'Komposisi tanah vulkanik dataran tinggi yang memperkaya prekursor aroma pada biji hijau.',
  },
  {
    kicker: 'BAB III · ELEVASI >1.200 MDPL',
    lines: ['Udara Dingin Pegunungan', '*Memperlambat* Pematangan'],
    sub: 'Perbedaan suhu siang dan malam yang ekstrem di atas 1.200 hingga 1.800 meter mdpl.',
    figTag: 'FIG. 04 · SIKLUS CERI MERAH',
    caption: 'Buah ceri kopi membutuhkan 8 hingga 9 bulan untuk matang sempurna di dataran tinggi.',
  },
  {
    kicker: 'BAB IV · AKUMULASI GULA ALAMI',
    lines: ['Biji Mengunci *Gula Alami*', '& Asam Organik Kompleks'],
    sub: 'Kepadatan biji (hard bean) meningkat pesat, siap bereaksi saat disangrai (reaksi Maillard).',
    figTag: 'FIG. 05 · STRUKTUR BIJI PADAT',
    caption: 'Potongan melintang dua keping biji kopi (flat bean) dengan celah tengah berbentuk huruf S.',
  },
  {
    kicker: 'BAB V · METODE GILING BASAH',
    lines: ['Teknik Unik *Giling Basah*', 'Saat Biji Masih Lembap'],
    sub: 'Wet-hulling: kulit tanduk (parchment) dikupas pada kadar air 30–35% sebelum pengeringan akhir.',
    figTag: 'FIG. 06 · BIJI HIJAU KEBIRUAN',
    caption: 'Warna hijau kebiruan khas biji kopi Sumatra & Sulawesi hasil proses giling basah tradisional.',
  },
  {
    kicker: 'BAB VI · PROFIL RASA KHAS DUNIA',
    lines: ['Berbadan Tebal, Rendah Asam', '& Aroma *Cokelat Rempah*'],
    sub: 'Full-bodied, syrupy mouthfeel, dengan catatan rasa herbal, kayu manis, dan cokelat gelap.',
    figTag: 'FIG. 07 · PROFIL SANGRAI',
    caption: 'Karamelisasi gula menghasilkan karakter rasa tegas yang dicari penyeduh espresso dunia.',
  },
  {
    kicker: 'EPILOG · SARI PATI ALAM & TANGAN',
    lines: ['Harmoni *Tanah Gunung Api*,', 'Kabut & Tangan Petani'],
    sub: 'Setiap cangkir merangkum perjalanan panjang dari lereng gunung hingga ke meja seduh.',
    figTag: 'FIG. 08 · EKSTRAKSI AKHIR',
    caption: 'Keseimbangan terroir vulkanik dan kearifan pascapanen petani kopi kepulauan Indonesia.',
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
    issue: 'JURNAL GASTRONOMI & AGRONOMI',
    rubric: 'STUDI TERROIR · SABUK VULKANIK',
    figNo: idx + 1,
    totalFigs: 8,
  });

  const h = HEADLINES[idx];
  K.drawEditorialHeadline(ctx, h.kicker, h.lines, h.sub, 180, clamp(p * 1.4, 0, 1));

  const figY = 505;
  const figH = 620;
  K.drawFigureFrame(ctx, 68, figY, 944, figH, h.figTag, h.caption, clamp(p * 1.2 - 0.05, 0, 1));
  K.drawEditorialPlate(ctx, 540, figY + 320, 'coffee', t, clamp(p * 1.15 - 0.1, 0, 1));

  const swatches = [
    { color: K.PAL.terracotta, name: 'I. Ceri Arabika Matang', sub: '1.200–1.800 MDPL · BRIX TINGGI' },
    { color: K.PAL.sage, name: 'II. Biji Giling Basah', sub: 'WET-HULLED · KADAR AIR 12%' },
    { color: '#2F2019', name: 'III. Sangrai Medium-Dark', sub: 'FULL BODY · COKELAT & REMPAH' },
  ];
  K.drawColorSwatches(ctx, 68, 1205, swatches, clamp(p * 1.1 - 0.15, 0, 1));
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
