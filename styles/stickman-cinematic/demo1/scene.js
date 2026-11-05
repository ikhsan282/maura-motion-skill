// 72 · STICKMAN CINEMATIC — Demo 1: Kota Tidur, Mimpimu Belum Selesai (Kekuatan 45 Menit Hening)
import * as K from '/styles/stickman-cinematic/kit.js';
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
  const floorY = 760;

  let phase = 0;
  if (t >= C.tenang.start) phase = 3;
  else if (t >= C.langkah.start) phase = 2;
  else if (t >= C.hening.start) phase = 1;

  const scenes = [
    'SCENE 01 • KOTA MULAI TERTIDUR • 21:30',
    'SCENE 02 • KEHENINGAN TANPA INTERUPSI',
    'SCENE 03 • 45 MENIT UNTUK MIMPIMU SENDIRI',
    'SCENE 04 • ISTIRAHAT DENGAN HATI TENANG',
  ];

  K.cinematicBg(ctx, t, { floorY, sceneCode: scenes[phase], col: phase >= 2 ? K.PAL.rimCyan : K.PAL.sunsetOrange });

  const headers = [
    ['MALAM', 'KOTA TIDUR, MIMPIMU BELUM SELESAI', 'Menemukan Jendela Waktu Emas Saat Kebisingan Mereda'],
    ['HENING', 'WAKTU MILIKMU SEPENUHNYA', 'Siang Hari Milik Tuntutan Luar • Malam Hari Milik Visimu'],
    ['45 MNT', 'BUKAN BEGADANG, MELAINKAN FOKUS', '45 Menit Setiap Malam = 270+ Jam Keahlian Dalam Setahun'],
    ['MAJU!', 'SATU LANGKAH SEBELUM TERLELAP', 'Tidur Nyenyak Setelah Melangkah Maju untuk Cita-Citamu'],
  ][phase];

  K.cinematicHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.rimCyan : K.PAL.sunsetOrange,
  });

  K.cinematicProps(ctx, floorY, 'rooftop', { phase, t });

  const charX = phase <= 1 ? 370 : 430;
  const pose = phase === 0 ? 'stand' : phase === 1 ? 'lookUp' : phase === 2 ? 'walk' : 'triumph';
  K.cinematicStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Seharian sibuk urusan orang, kapan buat mimpiku?',
    'Malam sepi... nggak ada notifikasi yang ganggu.',
    'Cukup 45 menit fokus penuh sebelum tidur!',
    'Satu langkah beres, sekarang waktunya istirahat tenang!',
  ];
  K.cinematicBubble(ctx, charX, 360, bubbles[phase], {
    tailX: charX, tailY: 435, col: phase >= 2 ? K.PAL.rimCyan : K.PAL.sunsetOrange,
  });

  if (phase === 0) {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'PARADOKS KESIBUKAN SIANG HARI',
      titleStr: 'Sibuk Seharian Namun Merasa Jalan di Tempat',
      subStr: 'Sebagian besar energi siang hari habis untuk merespons agenda dan pesan orang lain',
      stat: 'REAKTIF',
      statSub: 'SIANG HARI',
      col: K.PAL.sunsetOrange,
      a: pop(t, C.hook.start + 0.2),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'JENDELA EMAS SEBELUM ISTIRAHAT',
      titleStr: '1 Jam Tenang Sebelum Tidur Sering Habis untuk Scroll',
      subStr: 'Mengubah satu jam pasif menjadi 45 menit terarah mengubah lintasan hidupmu',
      stat: '1 JAM',
      statSub: 'WAKTU KRITIS',
      col: K.PAL.sunsetGold,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'KEUNGGULAN JAM TENANG (QUIET HOURS)',
      titleStr: 'Nol Panggilan Telepon, Nol Rapat Mendadak',
      subStr: 'Ketika dunia sekitar hening, gelombang perhatian otak mencapai kedalaman maksimal',
      stat: '0 GANGGUAN',
      statSub: 'FOKUS MURNI',
      col: K.PAL.rimCyan,
      a: pop(t, C.hening.start),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'PEMBEDA MEREKA YANG MELESAT MAJU',
      titleStr: 'Membangun Proyek Impian di Luar Jam Kerja Utama',
      subStr: 'Banyak karya besar lahir dari meja belajar yang menyala tenang di malam hari',
      stat: 'VISI PRIBADI',
      statSub: 'WAKTU UTUH',
      col: K.PAL.sunsetOrange,
      a: pop(t, C.hening.start + 0.5),
    });
  } else if (phase === 2) {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'ATURAN 45 MENIT TANPA BEGADANG',
      titleStr: 'Bukan Mengorbankan Tidur, Melainkan Mengganti Scroll',
      subStr: 'Fokus 45 menit pada pukul 21.00–21.45 lalu tidur tepat waktu pukul 22.00',
      stat: '45 MENIT',
      statSub: 'SEHAT & FOKUS',
      col: K.PAL.rimCyan,
      a: pop(t, C.langkah.start),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'AKUMULASI 365 MALAM',
      titleStr: '45 Menit x 365 Hari = 273 Jam Keahlian Baru Setahun',
      subStr: 'Setara dengan hampir 7 minggu kerja penuh yang didedikasikan khusus untuk mimpimu',
      stat: '273 JAM',
      statSub: 'PER TAHUN',
      col: K.PAL.sunsetGold,
      a: pop(t, C.langkah.start + 0.5),
    });
  } else {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'KEPUASAN BATIN SEBELUM TIDUR',
      titleStr: 'Menutup Hari dengan Rasa Bangga, Bukan Penyesalan',
      subStr: 'Tidur terasa jauh lebih nyenyak saat kita tahu hari ini kita melangkah maju',
      stat: 'TENANG',
      statSub: 'TIDUR BERKUALITAS',
      col: K.PAL.rimCyan,
      a: pop(t, C.tenang.start),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'MONOLOG AKHIR MALAM INI',
      titleStr: 'Satu Halaman Hari Ini Adalah Fondasi Masa Depanmu',
      subStr: 'Teruslah melangkah dengan tenang, fajar keberhasilan sedang menunggumu',
      stat: 'KONSISTEN',
      statSub: 'SAMPAI PUNCAK',
      col: K.PAL.sunsetGold,
      a: pop(t, C.tenang.start + 0.5),
    });
  }
}
