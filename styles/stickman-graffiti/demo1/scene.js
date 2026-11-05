// 74 · STICKMAN GRAFFITI — Demo 1: Tembok Ini Saksi Mimpimu (The Taste Gap & Keberanian Coretan Pertama)
import * as K from '/styles/stickman-graffiti/kit.js';
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
  if (t >= C.bangga.start) phase = 3;
  else if (t >= C.semprot.start) phase = 2;
  else if (t >= C.batal.start) phase = 1;

  const tags = [
    'TEMBOK 01 • KETAKUTAN GARIS PERTAMA',
    'TEMBOK 02 • THE TASTE GAP (IRA GLASS)',
    'TEMBOK 03 • KARYA NYATA > ANGAN SEMPURNA',
    'TEMBOK 04 • TEMBOK INI SAKSI MIMPIMU!',
  ];

  const col = phase >= 2 ? K.PAL.cyan : K.PAL.pink;
  K.graffitiBg(ctx, t, { floorY, wallTag: tags[phase], col });

  const headers = [
    ['MULAI!', 'TEMBOK INI SAKSI MIMPIMU', 'Mengapa Coretan Pertama Tidak Perlu Menunggu Sempurna?'],
    ['GAP!', 'THE TASTE GAP (SELERA vs JAM TERBANG)', 'Selera Senimu Sudah Tinggi, Tanganmu Butuh Latihan Nyata'],
    ['GAS!', 'SELESAI LEBIH BAIK DARIPADA SEMPURNA', 'Kocok Kaleng Piloxmu dan Buat Garis Dasar Hari Ini'],
    ['KARYA!', 'VOLUME KARYA MENUTUP KESENJANGAN', 'Setiap Tembok yang Kamu Lukis Menajamkan Keahlianmu!'],
  ][phase];

  K.graffitiHeader(ctx, headers[0], headers[1], headers[2], { col });

  const murals = [
    ['TEMBOK KOSONG', 'TAKUT MIRING?', 'Membeku sebelum garis pertama', K.PAL.pink, K.PAL.cyan],
    ['THE TASTE GAP', 'SELERA vs SKILL', 'Jembatani lewat latihan rutin', K.PAL.pink, K.PAL.yellow],
    ['GARIS DASAR', 'DONE > PERFECT', 'Tangan belajar saat bergerak', K.PAL.cyan, K.PAL.pink],
    ['MURAL SELESAI!', 'SAKSI MIMPIMU', 'Berani tampil & terus berkarya', K.PAL.cyan, K.PAL.yellow],
  ][phase];
  K.graffitiWallArt(ctx, floorY, murals[0], murals[1], murals[2], { col: murals[3], accent: murals[4] });

  const charX = phase <= 1 ? 330 : 350;
  const pose = phase === 0 ? 'hesitate' : phase <= 2 ? 'spray' : 'victory';
  K.graffitiStickman(ctx, charX, floorY, pose, { facing: 1, t, sprayCol: col });

  const bubbles = [
    'Temboknya gede banget... takut salah garis pertama!',
    'Oh, wajar kalau karyaku di awal belum sesuai seleraku!',
    'Semprot dulu garis dasarnya, sambil jalan kita rapikan!',
    'Tembok ini saksi bisu kalau aku berani memulai!',
  ];
  K.graffitiBubble(ctx, charX + 20, 355, bubbles[phase], { tailX: charX, tailY: 430, col });

  if (phase === 0) {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'KELUMPUHAN TEMBOK KOSONG (BLANK WALL PARADOX)',
      titleStr: 'Takut Karya Pertama Terlihat Amatir di Mata Orang',
      subStr: 'Membandingkan langkah pertama kita dengan karya ke-1000 milik orang lain',
      stat: 'BEKU',
      statSub: 'TAKUT MULAI',
      col: K.PAL.pink,
      a: pop(t, C.hook.start + 0.2),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'KONSEP THE TASTE GAP (IRA GLASS)',
      titleStr: 'Seleramu Sudah Bagus, Namun Tanganmu Butuh Jam Terbang',
      subStr: 'Rasa kecewa pada karya awal adalah bukti bahwa kamu punya standar estetika yang baik',
      stat: 'TASTE GAP',
      statSub: 'FASE WAJAR',
      col: K.PAL.cyan,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'BAHAYA MENUNGGU 100% SIAP',
      titleStr: 'Kesiapan Tidak Pernah Datang Sebelum Kita Bergerak',
      subStr: 'Tembok yang dibiarkan kosong tidak pernah mengajarkan teknik apa pun pada tanganmu',
      stat: '0 KARYA',
      statSub: 'JIKA MENUNGGU',
      col: K.PAL.pink,
      a: pop(t, C.batal.start),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'PRINSIP DONE IS BETTER THAN PERFECT',
      titleStr: 'Satu Karya Kasar yang Selesai Mengalahkan Seribu Ide',
      subStr: 'Kamu bisa memperbaiki sketsa yang sudah ada, tapi tak bisa mengedit kanvas kosong',
      stat: 'EKSEKUSI',
      statSub: 'NYATAKAN IDE',
      col: K.PAL.yellow,
      a: pop(t, C.batal.start + 0.5),
    });
  } else if (phase === 2) {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'BELAJAR LEWAT GERAKAN TANGAN (KINESTHETIC LOOP)',
      titleStr: 'Semprotkan Garis Outline Terlebih Dahulu Tanpa Ragu',
      subStr: 'Begitu cat pertama menempel di tembok, rasa takut otomatis berubah menjadi fokus',
      stat: 'OUTLINE',
      statSub: 'LANGKAH AWAL',
      col: K.PAL.cyan,
      a: pop(t, C.semprot.start),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'MENUTUP KESENJANGAN DENGAN VOLUME',
      titleStr: 'Tetapkan Target Kuantitas Karya Setiap Minggu',
      subStr: 'Makin banyak tembok yang kamu selesaikan, makin cepat tanganmu menyamai seleramu',
      stat: 'VOLUME',
      statSub: 'RUTIN BERKARYA',
      col: K.PAL.pink,
      a: pop(t, C.semprot.start + 0.5),
    });
  } else {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'JEJAK PERJALANAN SEORANG KREATOR',
      titleStr: 'Karya Pertama Adalah Pondasi Kebanggaan Masa Depan',
      subStr: 'Tidak ada mural megah tanpa keberanian menyemprotkan titik cat yang pertama',
      stat: 'JEJAK',
      statSub: 'BUKTI BERANI',
      col: K.PAL.cyan,
      a: pop(t, C.bangga.start),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'MANIFESTO SI ZAKI STREET-ART',
      titleStr: 'Ambil Kaleng Piloxmu dan Warnai Tembok Impianmu Hari Ini!',
      subStr: 'Dunia tidak butuh kritikus tambahan, dunia butuh karya nyatamu',
      stat: 'BERKARYA!',
      statSub: 'MULAI SEKARANG',
      col: K.PAL.yellow,
      a: pop(t, C.bangga.start + 0.5),
    });
  }
}
