// 70 · STICKMAN BEANIE — Demo 1: Kupluk Merah vs Jebakan Rebahan (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-beanie/kit.js';
const { clamp, lerp, ease } = AM.lib;

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
  const floorY = 1240;

  let beat = 0;
  if (t >= C.moral?.start) beat = 9;
  else if (t >= C.momentum?.start) beat = 8;
  else if (t >= C.sepatu?.start) beat = 7;
  else if (t >= C.lingkungan?.start) beat = 6;
  else if (t >= C.alasan?.start) beat = 5;
  else if (t >= C.roket?.start) beat = 4;
  else if (t >= C.rem?.start) beat = 3;
  else if (t >= C.jeda?.start) beat = 2;
  else if (t >= C.tawar?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.15; fx = 480; fy = 920;
  } else if (beat === 4 || beat === 5) {
    zoom = 1.18; fx = 560; fy = 940;
  } else if (beat >= 7) {
    zoom = 1.14; fx = 620; fy = 940;
  }

  const tags = [
    'PANEL 01 • JEBAKAN "LIMA MENIT LAGI"',
    'PANEL 02 • NEGOSIASI HALUS DI KEPALA',
    'PANEL 03 • JENDELA KRITIS 5 DETIK',
    'PANEL 04 • REM DARURAT ZONA NYAMAN',
    'PANEL 05 • HITUNG MUNDUR 5-4-3-2-1!',
    'PANEL 06 • AKTIVASI KORTEKS PREFRONTAL',
    'PANEL 07 • PISAHKAN KASUR DARI MEJA',
    'PANEL 08 • ENCLOTHED COGNITION ATRIBUT',
    'PANEL 09 • 80% MALAS HILANG DI MEJA',
    'PANEL 10 • GERAKAN FISIK MEMIMPIN!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.beanieBg(ctx, t, { floorY, stageTag: tags[beat], col: beat >= 4 ? K.PAL.teal : K.PAL.beanie });
    K.beanieProps(ctx, floorY, 'desk', { phase: beat >= 4 ? 2 : 0, t });

    const charX = beat <= 2 ? 380 : beat <= 6 ? 480 : 560;
    const pose = beat === 0 ? 'shock' : beat <= 3 ? 'think' : beat <= 5 ? 'action' : 'confident';
    K.beanieStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      '5 menit rebahan kok jadi 2 jam?!',
      'Tanggung, satu video TikTok lagi...',
      'Lewat 5 detik, otak langsung cari alasan!',
      'Rem kenyamanan aktif: "Besok aja deh!"',
      '5... 4... 3... 2... 1... BANGKIT!',
      'Korteks prefrontal ambil kendali!',
      'Kasur buat tidur, meja buat karya!',
      'Kupluk merah & sepatu siap tempur!',
      'Begitu duduk di meja, malas menguap!',
      'Gerakan fisik yang memimpin pikiran!',
    ];
    K.beanieBubble(ctx, charX + 50, floorY - 380, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 300, col: beat >= 4 ? K.PAL.teal : K.PAL.beanie,
    });
  });

  const headers = [
    ['MAGER?', 'KUPLUK MERAH vs REBAHAN', 'Mengapa Istirahat 5 Menit Selalu Molor Jadi 2 Jam?'],
    ['TAWAR', 'BISIKAN HALUS SATU VIDEO LAGI', 'Pintu Masuk Terbesar Menunda Pekerjaan'],
    ['5 DETIK', 'JANGAN BERI WAKTU OTAK MENGELUH', 'Jeda Lebih dari 5 Detik Memicu Keraguan'],
    ['REM!', 'ZONA NYAMAN MENGINJAK REM DARURAT', 'Otak Dirancang Menghemat Energi & Memilih Kasur'],
    ['5-4-3-2-1', 'ATURAN 5 DETIK MEL ROBBINS', 'Putus Kebiasaan Menunda dengan Hitungan Mundur'],
    ['PREFRONTAL', 'KENDALI KORTEKS PREFRONTAL', 'Mengalihkan Mode Otomatis ke Tindakan Sadar'],
    ['ZONA', 'PISAHKAN KASUR DARI TEMPAT BELAJAR', 'Kondisikan Lingkungan agar Pikiran Tidak Bingung'],
    ['ATRIBUT', 'ENCLOTHED COGNITION KUPLUK', 'Pakai Pakaian Kerja untuk Mengaktifkan Mode Serius'],
    ['MOMENTUM', 'DUDUK DI MEJA = 80% MALAS LENYAP', 'Langkah Pertama Adalah yang Paling Berat'],
    ['MENANG!', 'GERAKAN FISIK MEMIMPIN OTAK', 'Jangan Nunggu Semangat: Bergeraklah Sekarang!'],
  ][beat];

  K.beanieHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.teal : K.PAL.beanie,
  });

  const callouts = [
    { tag: 'ILUSI 5 MENIT', title: 'Negosiasi Kecil Berubah Menjadi Penyesalan', desc: 'Algoritma layar membuat kita lupa waktu hingga hari berganti', stat: '2 JAM', col: K.PAL.beanie, c: C.hook },
    { tag: 'BISIKAN TANGGUNG', title: 'Otak Menipu Kita dengan Permintaan Tambahan', desc: 'Satu video lagi tidak pernah benar-benar menjadi video terakhir', stat: 'TAWAR', col: K.PAL.blue, c: C.tawar },
    { tag: 'JENDELA KRITIS', title: 'Ada Ambang 5 Detik Sebelum Alasan Menyerbu', desc: 'Begitu muncul niat baik, tubuh harus langsung merespon secara fisik', stat: '5 DETIK', col: K.PAL.beanie, c: C.jeda },
    { tag: 'HEMAT ENERGI', title: 'Secara Biologis Otak Lebih Suka Rebahan', desc: 'Jika menunggu perasaan mau, kita tidak akan pernah memulainya', stat: 'REM!', col: K.PAL.purple, c: C.rem },
    { tag: 'PELUNCUR ROKET', title: 'Hitung Mundur Mematikan Suara Keraguan', desc: 'Teknik sederhana dari Mel Robbins yang menyelamatkan jutaan orang', stat: '5-4-3-2-1', col: K.PAL.teal, c: C.roket },
    { tag: 'BASAL GANGLIA', title: 'Memutus Loop Kebiasaan Otomatis yang Malas', desc: 'Prefrontal cortex teraktivasi saat kita menghitung terbalik', stat: 'AKTIF', col: K.PAL.blue, c: C.alasan },
    { tag: 'DESAIN RUANG', title: 'Jangan Pernah Bekerja di Atas Kasur', desc: 'Kasur mengirimkan sinyal tidur dan memicu rasa kantuk seketika', stat: 'PISAHKAN', col: K.PAL.teal, c: C.lingkungan },
    { tag: 'SINYAL FISIK', title: 'Atribut Pakaian Mengubah Cara Pikir Otak', desc: 'Kupluk atau sepatu memberi jangkar fokus bahwa jam kerja dimulai', stat: 'KUPLUK', col: K.PAL.beanie, c: C.sepatu },
    { tag: 'MOMENTUM KERJA', title: 'Hambatan Terbesar Hanya di 2 Menit Pertama', desc: 'Begitu tangan mulai mengetik, tubuh otomatis melanjutkan tugas', stat: 'GAS!', col: K.PAL.teal, c: C.momentum },
    { tag: 'PESAN JUARA', title: 'Jangan Bernegosiasi, Langsung Langkahkan Kaki', desc: 'Tindakan fisik selalu mendahului munculnya rasa motivasi!', stat: 'BANGKIT', col: K.PAL.beanie, c: C.moral },
  ][beat];

  K.beanieCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
