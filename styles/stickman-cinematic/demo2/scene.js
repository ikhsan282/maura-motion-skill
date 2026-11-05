// 72 · STICKMAN CINEMATIC — Demo 2: Juara Ditempa Saat Lampu Panggung Mati (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-cinematic/kit.js';
const { clamp, ease } = AM.lib;

export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1700, size: 48 } };

let ctx;
const C = {};
const pop = (t, a, d = 0.45) => ease.outBack(clamp((t - a) / d), 1.7);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);
  const floorY = 1230;

  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.fokus?.start) beat = 6;
  else if (t >= C.akar?.start) beat = 5;
  else if (t >= C.disiplin?.start) beat = 4;
  else if (t >= C.lelah?.start) beat = 3;
  else if (t >= C.sunyi?.start) beat = 2;
  else if (t >= C.pujian?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.15; fx = 500; fy = 920;
  } else if (beat >= 4) {
    zoom = 1.16; fx = 560; fy = 940;
  }

  const tags = [
    'SCENE 01 • GEMERLAP PANGGUNG VS RUANG LATIHAN',
    'SCENE 02 • JEBAKAN PUJIAN & VALIDASI INSTAN',
    'SCENE 03 • UJIAN KESUNYIAN TANPA PENONTON',
    'SCENE 04 • KETAHANAN MELANGKAH SAAT LELAH',
    'SCENE 05 • DISIPLIN ADALAH BAHAN BAKAR HAKIKI',
    'SCENE 06 • AKAR BAMBU: KEKUATAN DI BAWAH TANAH',
    'SCENE 07 • FOKUS PADA PROSES, BUKAN TEPUK TANGAN',
    'SCENE 08 • JUARA SEJATI LAHIR DARI KESUNYIAN!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.cinematicBg(ctx, t, { floorY, sceneCode: tags[beat], col: beat >= 4 ? K.PAL.rimCyan : K.PAL.sunsetOrange });
    K.cinematicProps(ctx, floorY, beat >= 4 ? 'desk' : 'streetlamp', { phase: beat >= 4 ? 2 : 0, t });

    const charX = beat <= 2 ? 380 : 480;
    const pose = beat === 0 ? 'gaze' : beat === 1 ? 'walk' : beat <= 3 ? 'think' : beat <= 5 ? 'walk' : 'look-up';
    K.cinematicStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Semua ingin panggung, tapi siapa yang betah latihan?',
      'Mudah semangat kalau lagi banyak yang tepuk tangan!',
      'Ujian sejati saat ruangan sunyi tanpa penonton...',
      'Capek itu wajar, tapi pemenang tetap melangkah!',
      'Motivasi pemantik awal, disiplin penjaga malam!',
      'Bambu menumbuhkan akar diam-diam bertahun-tahun!',
      'Berhenti cari validasi instan, buktikan lewat karya!',
      'Cintai proses sepimu, di sanalah sang juara lahir!',
    ];
    K.cinematicBubble(ctx, charX + 50, floorY - 420, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 340, col: beat >= 4 ? K.PAL.rimCyan : K.PAL.sunsetOrange,
    });
  });

  const headers = [
    ['PANGGUNG', 'GEMERLAP KEMENANGAN VS LATIHAN', 'Banyak yang Menginginkan Hasil, Sedikit yang Bertahan di Proses'],
    ['PUJIAN', 'ILUSI SEMANGAT KARENA PENONTON', 'Tepuk Tangan Luar Bersifat Fana dan Cepat Menghilang'],
    ['SUNYI', 'UJIAN SEJATI DI RUANG LATIHAN', 'Ketika Karya Pertamamu Belum Ada yang Melirik'],
    ['KETAHANAN', 'MELANGKAH TANPA PENONTON', 'Bukan Tak Pernah Bosan, Tapi Memilih Tetap Berkomitmen'],
    ['DISIPLIN', 'BAHAN BAKAR PENEMBUS MALAM', 'Percikan Motivasi Membakar Cepat, Disiplin Membawa Sampai Tujuan'],
    ['AKAR BAMBU', 'PERTUMBUHAN DI BALIK LAYAR', 'Menguatkan Pondasi di Bawah Tanah Sebelum Menjulang Tinggi'],
    ['FOKUS KARYA', 'KUALITAS BERBICARA SENDIRI', 'Lepaskan Kebutuhan Pengakuan, Biarkan Jam Terbang Membuktikan'],
    ['SANG JUARA', 'DITEMPA DALAM KEHENINGAN', 'Kemenangan Terbesar Adalah Mengalahkan Rasa Malas Dirimu Sendiri!'],
  ][beat];

  K.cinematicHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.rimCyan : K.PAL.sunsetOrange,
  });

  const callouts = [
    { tag: 'PARADOKS PRESTASI', title: 'Sorotan Panggung Hanya Berlangsung Beberapa Menit', desc: 'Ribuan jam di ruang sunyi adalah tempat di mana keahlian sejati diukir', stat: 'PANGGUNG', col: K.PAL.sunsetOrange, c: C.hook },
    { tag: 'VALIDASI EKSTERNAL', title: 'Mudah Termotivasi Saat Didukung Orang Banyak', desc: 'Ketergantungan pada pujian membuat langkahmu rapuh saat kritik datang', stat: 'PUJIAN', col: K.PAL.sunsetGold, c: C.pujian },
    { tag: 'THE LONELY MILE', title: 'Fase Sepi: Karya Masih Sepi dan Latihan Berulang', desc: '90% orang berhenti di fase ini karena mengharapkan hasil instan', stat: 'SUNYI', col: K.PAL.rimCyan, c: C.sunyi },
    { tag: 'MENTAL JUARA', title: 'Konsistensi Mengalahkan Bakat Alami yang Malas', desc: 'Pemenang tetap hadir dan menyelesaikan porsinya di hari yang paling berat', stat: 'GUGUR VS BANGKIT', col: K.PAL.sunsetOrange, c: C.lelah },
    { tag: 'DISIPLIN VS MOTIVASI', title: 'Motivasi Emosional vs Sistem Kerja Terukur', desc: 'Membangun rutinitas otomatis yang tidak bergantung pada mood harian', stat: 'DISIPLIN', col: K.PAL.rimCyan, c: C.disiplin },
    { tag: 'CHINESE BAMBOO', title: '5 Tahun Menghunjam ke Dalam, 6 Minggu Menjulang', desc: 'Setiap latihan yang terasa sia-sia sebenarnya memperkokoh mentalmu', stat: 'AKAR BAMBU', col: K.PAL.sunsetGold, c: C.akar },
    { tag: 'KUALITAS MURNI', title: 'Biarkan Penguasaan Bicara Lebih Keras dari Kata-kata', desc: 'Fokus 100% pada perbaikan teknis harian tanpa terdistraksi angka metrik', stat: 'MASTERY', col: K.PAL.rimCyan, c: C.fokus },
    { tag: 'PESAN JUARA', title: 'Peluklah Proses Sepimu Malam Ini', desc: 'Di sanalah pondasi kehebatan masa depanmu sedang dibangun dengan kokoh!', stat: 'JUARA SEJATI', col: K.PAL.sunsetOrange, c: C.moral },
  ][beat];

  K.cinematicCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
