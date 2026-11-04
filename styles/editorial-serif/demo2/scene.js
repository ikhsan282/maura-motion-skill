// Editorial Serif — Demo 2: Jejak Rempah yang Mengubah Peta Dunia (Pala Banda & Cengkeh Ternate)
import * as K from '/styles/editorial-serif/kit.js';
const { clamp, prog } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'editorial', y: 1560, size: 50 } };

let ctx;
export async function setup(AM) {
  ctx = AM.layer('world');
}

const HEADLINES = [
  {
    kicker: 'PROLOG · EMAS BOTANI MALUKU',
    lines: ['Segenggam Biji Seharga', '*Emas Murni* di Eropa'],
    sub: 'Bagaimana pohon endemik kepulauan vulkanik menjadi komoditas paling diburu di bumi.',
    figTag: 'FIG. 01 · MYRISTICA FRAGRANS',
    caption: 'Penampang anatomis buah pala Banda beserta arilus merah (fuli) dan biji aromatik.',
    plate: 'nutmeg',
  },
  {
    kicker: 'BAB I · ENDEMIK KEPULAUAN REMPAH',
    lines: ['Pala *Kepulauan Banda* &', 'Cengkeh Lereng Ternate'],
    sub: 'Hanya tumbuh subur di tanah abu vulkanik yang diselimuti angin laut Laut Banda & Maluku.',
    figTag: 'FIG. 02 · SYZYGIUM AROMATICUM',
    caption: 'Kuncup bunga cengkeh Ternate dipetik tepat saat kelopak berubah merah muda sebelum mekar.',
    plate: 'clove',
  },
  {
    kicker: 'BAB II · JALUR MARITIM KUNO',
    lines: ['Jaringan Pelaut Nusantara', '*Ribuan Tahun* Silam'],
    sub: 'Dari pelabuhan Banda dan Gresik menuju Malaka, Gujarat, hingga teluk Persia dan Venesia.',
    figTag: 'FIG. 03 · SPESIMEN KUNCUP',
    caption: 'Kandungan minyak atsiri eugenol tinggi yang menjaga kualitas cengkeh selama pelayaran.',
    plate: 'clove',
  },
  {
    kicker: 'BAB III · JEJAK FIRAUN MESIR',
    lines: ['Kristal *Kapur Barus*', 'di Balsam Mumi Kuno'],
    sub: 'Resin pohon Dryobalanops aromatica dari pantai barat Sumatra Utara menembus peradaban kuno.',
    figTag: 'FIG. 04 · RESIN & BIJI AROMATIK',
    caption: 'Triad komoditas klasik Nusantara: kamfer Barus, pala Banda, dan cengkeh Maluku Utara.',
    plate: 'nutmeg',
  },
  {
    kicker: 'BAB IV · ANATOMI DUA KOMODITAS',
    lines: ['Biji Pala & Jaring Merah', '*Fuli* dalam Satu Buah'],
    sub: 'Selaput arilus merah menyala (mace) memiliki harga jual berkali lipat lebih tinggi dari bijinya.',
    figTag: 'FIG. 05 · ANATOMI FULI & BIJI',
    caption: 'Serat merah fuli yang menyelimuti tempurung biji pala sebelum dikeringkan di atas para-para.',
    plate: 'nutmeg',
  },
  {
    kicker: 'BAB V · PERTUKARAN PULAU RUN',
    lines: ['Pulau Run Ditukar dengan', '*Pulau Manhattan*'],
    sub: 'Obsesi monopoli pala memicu perebutan sengit antara VOC Belanda dan East India Company Inggris.',
    figTag: 'FIG. 06 · KEPULAUAN BANDA',
    caption: 'Pohon pala Pulau Run yang menjadi pusat diplomasi geopolitik Eropa pada abad ke-17.',
    plate: 'nutmeg',
  },
  {
    kicker: 'BAB VI · PERJANJIAN BREDA 1667',
    lines: ['Sepetak Kebun Pala Lebih', 'Mahal dari *New York*'],
    sub: 'Traktat Breda 31 Juli 1667 mengukuhkan Pulau Run bagi Belanda dan Nieuw Amsterdam bagi Inggris.',
    figTag: 'FIG. 07 · ARSIP TRAKTAT 1667',
    caption: 'Kalkulasi ekonomi abad ke-17 yang menempatkan rempah Maluku di puncak perdagangan global.',
    plate: 'clove',
  },
  {
    kicker: 'EPILOG · WARISAN DI MEJA MAKAN',
    lines: ['Aroma Hutan yang Pernah', '*Mengubah Peta Dunia*'],
    sub: 'Dari monopoli kolonial kembali menjadi warisan agrikultur dan gastronomi Nusantara.',
    figTag: 'FIG. 08 · HERBARIUM NUSANTARA',
    caption: 'Koleksi botani pala dan cengkeh sebagai penanda sejarah maritim kepulauan Indonesia.',
    plate: 'nutmeg',
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
    issue: 'ARSIP BOTANI & SEJARAH MARITIM',
    rubric: 'ATLAS REMPAH NUSANTARA',
    figNo: idx + 1,
    totalFigs: 8,
  });

  const h = HEADLINES[idx];
  K.drawEditorialHeadline(ctx, h.kicker, h.lines, h.sub, 180, clamp(p * 1.4, 0, 1));

  const figY = 505;
  const figH = 620;
  K.drawFigureFrame(ctx, 68, figY, 944, figH, h.figTag, h.caption, clamp(p * 1.2 - 0.05, 0, 1));
  K.drawEditorialPlate(ctx, 540, figY + 320, h.plate, t, clamp(p * 1.15 - 0.1, 0, 1));

  const swatches = [
    { color: K.PAL.terracotta, name: 'I. Fuli (Mace Banda)', sub: 'ARILUS MERAH · MYRISTICA' },
    { color: '#3B281E', name: 'II. Biji Pala & Cengkeh', sub: 'EUGENOL & MYRISTICIN' },
    { color: K.PAL.sage, name: 'III. Daun & Kanopi', sub: 'VULKANIK · LAUT BANDA' },
  ];
  K.drawColorSwatches(ctx, 68, 1205, swatches, clamp(p * 1.1 - 0.15, 0, 1));
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
