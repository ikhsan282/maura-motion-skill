// 73 · STICKMAN DUO — Demo 2: Efek Body Doubling (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-duo/kit.js';
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
  else if (t >= C.virtual?.start) beat = 6;
  else if (t >= C.sebut?.start) beat = 5;
  else if (t >= C.aturan?.start) beat = 4;
  else if (t >= C.jangkar?.start) beat = 3;
  else if (t >= C.cermin?.start) beat = 2;
  else if (t >= C.nama?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 540; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 540; fy = 930;
  }

  const tags = [
    'EPISODE 01 • SENDIRI BERAT, BERDUA RINGAN',
    'EPISODE 02 • FENOMENA BODY DOUBLING',
    'EPISODE 03 • AKTIVASI NEURON CERMIN DI OTAK',
    'EPISODE 04 • JANGKAR PERHATIAN PENAHAN DISTRAKSI',
    'EPISODE 05 • ATURAN 50 MENIT HENING : 10 MENIT NGOBROL',
    'EPISODE 06 • SEBUT SATU TARGET & NYALAKAN TIMER',
    'EPISODE 07 • VIRTUAL CO-WORKING: CALL TANPA SUARA',
    'EPISODE 08 • UBAH MALAS JADI FOKUS BERSAMA!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.duoBg(ctx, t, { floorY, episodeTag: tags[beat], col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.red : K.PAL.blue) });

    const props = [
      ['TUGAS BERAT', 'SENDIRI RAWAN', 'Sendirian di kamar mudah terdistraksi', K.PAL.red],
      ['BODY DOUBLE', 'PENDAMPINGAN', 'Hadir bersama di satu ruang', K.PAL.blue],
      ['MIRROR NEURON', 'MENULAR!', 'Fokus teman mengalir ke otakmu', K.PAL.red],
      ['JANGKAR', 'TAHAN GODAAN', 'Malu buka sosmed saat teman fokus', K.PAL.teal],
      ['ATURAN 50/10', '50m : 10m', '50 mnt hening, 10 mnt istirahat', K.PAL.blue],
      ['1 TARGET', 'TIMER BERSAMA', 'Sebut sasaran di awal sesi', K.PAL.teal],
      ['VIRTUAL', 'JARAK JAUH', 'Video call hening tetap efektif', K.PAL.teal],
      ['GAS BARENG!', '2x PRODUKTIF', 'Kompak berkarya sampai tuntas!', K.PAL.teal],
    ][beat];
    K.duoCenterProp(ctx, floorY, props[0], props[1], props[2], { col: props[3] });

    // Left: Raka, Right: Bima
    const rakaPose = beat === 0 ? 'talk' : beat === 1 ? 'shock' : beat === 2 ? 'point' : beat === 3 ? 'talk' : beat <= 5 ? 'talk' : 'highfive';
    const bimaPose = beat === 0 ? 'point' : beat === 1 ? 'talk' : beat === 2 ? 'talk' : beat === 3 ? 'point' : beat <= 5 ? 'point' : 'highfive';

    K.duoStickman(ctx, 280, floorY, 'raka', rakaPose, { facing: 1, t });
    K.duoStickman(ctx, 800, floorY, 'bima', bimaPose, { facing: -1, t });

    const rakaBubbles = [
      'Aneh ya, di kamar mager, tapi kerja bareng kamu cepat!',
      'Oh, jadi ini yang namanya Body Doubling?!',
      'Pantes pas liat kamu ngetik, aku ikut kebawa fokus!',
      'Iya juga, segan mau buka sosmed pas kamu serius!',
      'Siap! 50 menit hening fokus, jangan ada gosip ya!',
      'Targetku: selesaikan draft artikel ini dalam 50 menit!',
      'Lagi di luar kota pun bisa video call hening ya!',
      'Fokus berdua emang mantap banget, tos Bim!',
    ];
    const bimaBubbles = [
      'Soalnya ada energi fokus yang saling menular, Rak!',
      'Betul! Fenomena psikologi pendampingan fisik!',
      'Neuron cermin di otak otomatis meniru ketenangan!',
      'Kehadiran fisik berfungsi jadi jangkar perhatianmu!',
      'Sepakat! 50 menit hening, 10 menit rehat ngopi!',
      'Nyalakan timer sekarang, targetku beresin presentasi!',
      'Bisa banget! Panggilan video hening efeknya sama!',
      'Keren Rak! Tugas berat selesai dalam hitungan jam!',
    ];

    K.duoBubble(ctx, 280, floorY - 390, 'RAKA', rakaBubbles[beat], {
      tailX: 280, tailY: floorY - 310, col: K.PAL.red,
    });
    K.duoBubble(ctx, 800, floorY - 390, 'BIMA', bimaBubbles[beat], {
      tailX: 800, tailY: floorY - 310, col: K.PAL.blue,
    });
  });

  const headers = [
    ['2x FOKUS', 'EFEK BODY DOUBLING', 'Mengapa Kerja Satu Meja Bareng Sahabat Menggandakan Fokus?'],
    ['ISTILAH', 'PSIKOLOGI PENDAMPINGAN FISIK', 'Kehadiran Orang Lain Meringankan Beban Mental Memulai Tugas'],
    ['CERMIN', 'AKTIVASI NEURON CERMIN DI OTAK', 'Melihat Sahabat Serius Bekerja Menularkan Gelombang Tenang'],
    ['JANGKAR', 'MENAHAN GODAAN IMPULSIF', 'Kamu Merasa Segan Membuka Ponsel Saat Rekanmu Sedang Serius'],
    ['50 / 10', 'ATURAN KERJA TANPA GOSIP', '50 Menit Hening Fokus Bersama • 10 Menit Istirahat Ngobrol'],
    ['TARGET', 'KOMITMEN AWAL & TIMER BERSAMA', 'Sebutkan 1 Sasaran Jelas Sebelum Menekan Tombol Mulai'],
    ['VIRTUAL', 'EFEKTIF MESKI DARI JARAK JAUH', 'Panggilan Video Hening Memberikan Efek Jangkar yang Sama Kuat'],
    ['PRODUKTIF', 'FOKUS BERSAMA SAHABAT', 'Ubah Rasa Mager Jadi Prestasi Nyata Lewat Body Doubling!'],
  ][beat];

  K.duoHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.red : K.PAL.blue),
  });

  const callouts = [
    { tag: 'PARADOKS ISOLASI', title: 'Sendirian di Kamar Memperbesar Beban Memulai', desc: 'Tidak ada dorongan eksternal untuk menghentikan pikiran melamun', stat: 'MAGER', col: K.PAL.red, c: C.hook },
    { tag: 'DEFINISI ILMIAH', title: 'Body Doubling: Pendampingan Mengurangi Resistensi', desc: 'Biasa digunakan untuk mengatasi prokrastinasi dan menjaga ritme kerja', stat: 'BODY DOUBLE', col: K.PAL.blue, c: C.nama },
    { tag: 'MIRROR NEURONS', title: 'Neuron Cermin Otomatis Meniru Fokus Rekan Kerja', desc: 'Ketenangan rekan di samping kita menyinkronkan ritme gelombang otak', stat: 'MENULAR', col: K.PAL.red, c: C.cermin },
    { tag: 'JANGKAR PERHATIAN', title: 'Keberadaan Sahabat Mencegah Tangan Membuka Medsos', desc: 'Rasa sungkan menjadi pelindung terbaik melawan distraksi digital', stat: 'JANGKAR', col: K.PAL.teal, c: C.jangkar },
    { tag: 'PROTOKOL WAKTU', title: '50 Menit Hening Penuh, 10 Menit Bersosialisasi', desc: 'Mencegah sesi belajar berdua berubah menjadi obrolan tanpa ujung', stat: '50 : 10 MNT', col: K.PAL.blue, c: C.aturan },
    { tag: 'CLEAR TARGET', title: 'Sebutkan 1 Sasaran Tertulis di Menit Pertama', desc: 'Kejelasan target mencegah kebingungan saat jam belajar dimulai', stat: '1 SASARAN', col: K.PAL.teal, c: C.sebut },
    { tag: 'REMOTE FRIENDLY', title: 'Panggilan Video Hening Sama Efektifnya', desc: 'Bahkan tanpa bicara, kehadiran visual di layar sudah cukup jadi jangkar', stat: 'VIRTUAL', col: K.PAL.teal, c: C.virtual },
    { tag: 'PESAN JUARA', title: 'Ajak Sahabatmu Bekerja Bersama Hari Ini', desc: 'Gandeng temanmu, nyalakan timer, dan rasakan lonjakan fokusnya!', stat: 'FOKUS 2x', col: K.PAL.teal, c: C.moral },
  ][beat];

  K.duoCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
