// 70 · STICKMAN BEANIE — Demo 2: Paradoks Pilihan (Barry Schwartz & Decision Fatigue)
import * as K from '/styles/stickman-beanie/kit.js';
const { clamp, ease } = AM.lib;

export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1620, size: 48 } };

let ctx;
const C = {};
const pop = (t, a, d = 0.4) => ease.outBack(clamp((t - a) / d), 1.8);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);
  const floorY = 755;

  let phase = 0;
  if (t >= C.cukup.start) phase = 3;
  else if (t >= C.tiga.start) phase = 2;
  else if (t >= C.selai.start) phase = 1;

  const tags = [
    'PANEL 01 • 30 MENIT SCROLL MENU TANPA NONTON',
    'PANEL 02 • EKSPERIMEN 24 SELAI vs 6 SELAI',
    'PANEL 03 • ATURAN BATASI 3 PILIHAN SAJA',
    'PANEL 04 • SATISFICER vs MAXIMIZER',
  ];

  K.beanieBg(ctx, t, { floorY, stageTag: tags[phase], col: phase >= 2 ? K.PAL.teal : K.PAL.beanie });

  const headers = [
    ['BINGUNG!', 'PARADOKS PILIHAN (BARRY SCHWARTZ)', 'Mengapa Makin Banyak Opsi Justru Bikin Kita Batal Memilih?'],
    ['24 vs 6', 'LUMPUH KEPUTUSAN (DECISION FATIGUE)', '6 Pilihan Menghasilkan Tindakan 10x Lebih Banyak dari 24 Pilihan'],
    ['MAKS 3', 'TERAPKAN ATURAN 3 OPSI', 'Pangkas Pilihanmu Menjadi Tiga agar Otak Langsung Bergerak'],
    ['TENANG', 'PILIH SATU & JALANKAN SEPENUH HATI', 'Hemat Energi Pikiranmu untuk Hal yang Benar-Benar Penting'],
  ][phase];

  K.beanieHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.teal : K.PAL.beanie,
  });

  K.beanieProps(ctx, floorY, 'choices', { phase, t });

  const pose = phase === 0 ? 'shock' : phase === 1 ? 'think' : phase === 2 ? 'action' : 'confident';
  K.beanieStickman(ctx, 330, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Pilih mana ya?! Makanan keburu dingin!',
    'Kebanyakan opsi malah bikin pusing!',
    'Cukup sisakan 3 opsi terbaik aja!',
    'Satu pilihan tuntas jauh lebih tenang!',
  ];
  K.beanieBubble(ctx, 350, 365, bubbles[phase], {
    tailX: 330, tailY: 445, col: phase >= 2 ? K.PAL.teal : K.PAL.beanie,
  });

  if (phase === 0) {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'FENOMENA OVERCHOICE DI ERA STREAMING',
      titleStr: 'Waktu Habis untuk Memilih, Energi Habis Sebelum Memulai',
      subStr: 'Ribuan judul film dan menu justru membuat otak kewalahan membandingkan',
      stat: '30 MNT',
      statSub: 'HABIS MEMILIH',
      col: K.PAL.beanie,
      a: pop(t, C.hook.start + 0.2),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'THE PARADOX OF CHOICE (BARRY SCHWARTZ)',
      titleStr: 'Pilihan Berlebih Menurunkan Kepuasan & Memicu Kecemasan',
      subStr: 'Di balik titik tertentu, tambahan opsi tidak lagi membebaskan, melainkan membebani',
      stat: 'BEBAN',
      statSub: 'OVERLOAD OPSI',
      col: K.PAL.blue,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'STUDI TOKO SELAI (IYENGAR & LEPPER, 2000)',
      titleStr: '24 Rasa: Hanya 3% Membeli • 6 Rasa: 30% Langsung Membeli!',
      subStr: 'Pilihan yang ringkas memudahkan otak mengambil keputusan dengan yakin',
      stat: '10x LIPAT',
      statSub: 'KONVERSI AKSI',
      col: K.PAL.teal,
      a: pop(t, C.selai.start),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'FOMO & PENYESALAN PASCA-KEPUTUSAN',
      titleStr: 'Takut Pilihan Lain Lebih Bagus Membuat Kita Tidak Puas',
      subStr: 'Imajinasi tentang opsi yang tidak dipilih merusak kenikmatan opsi yang ada',
      stat: 'FOMO',
      statSub: 'TAKUT SALAH PILIH',
      col: K.PAL.purple,
      a: pop(t, C.selai.start + 0.5),
    });
  } else if (phase === 2) {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'STRATEGI RULE OF THREE (ATURAN 3 OPSI)',
      titleStr: 'Kerucutkan Segala Pilihan Menjadi Maksimal 3 Kandidat',
      subStr: 'Baik memilih buku, topik konten, maupun prioritas kerja hari ini',
      stat: 'MAKS 3',
      statSub: 'OPSI TERBAIK',
      col: K.PAL.teal,
      a: pop(t, C.tiga.start),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'SATISFICER vs MAXIMIZER',
      titleStr: 'Pilih yang "Sudah Cukup Tepat" Lalu Segera Eksekusi',
      subStr: 'Kecepatan bertindak jauh lebih berharga daripada berhari-hari mencari opsi sempurna',
      stat: 'EKSEKUSI',
      statSub: 'LEBIH BAHAGIA',
      col: K.PAL.blue,
      a: pop(t, C.tiga.start + 0.5),
    });
  } else {
    K.beanieCard(ctx, 540, 995, 960, 175, {
      tag: 'PENGHEMATAN ENERGI KOGNITIF',
      titleStr: 'Otomatisasi Keputusan Kecil agar Otak Tetap Segar',
      subStr: 'Kurangi waktu bingung memilih pakaian atau menu agar fokus utuh untuk berkarya',
      stat: 'HEMAT',
      statSub: 'ENERGI MENTAL',
      col: K.PAL.teal,
      a: pop(t, C.cukup.start),
    });
    K.beanieCard(ctx, 540, 1210, 960, 175, {
      tag: 'CATATAN SI KUPLUK MERAH',
      titleStr: 'Putuskan Dalam 60 Detik dan Nikmati Pilihanmu!',
      subStr: 'Pilihan terbaik adalah pilihan yang langsung kamu jalankan dengan sepenuh hati',
      stat: 'FOKUS 1',
      statSub: 'BEBAS BINGUNG',
      col: K.PAL.beanie,
      a: pop(t, C.cukup.start + 0.5),
    });
  }
}
