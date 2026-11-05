// 75 · STICKMAN LECTURE — Demo 3: Rahasia Efek Zeigarnik & Jembatan Hemingway
import * as K from '/styles/stickman-lecture/kit.js';
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
  if (t >= C.hemingway.start) phase = 3;
  else if (t >= C.buka.start) phase = 2;
  else if (t >= C.loop.start) phase = 1;

  const tags = [
    'KULIAH 01 • PENEMUAN BLUMA ZEIGARNIK (1927)',
    'KULIAH 02 • OPEN LOOP DI MEMORI KERJA OTAK',
    'KULIAH 03 • UBAH 0% MENJADI 5% UNTUK PEMICU',
    'KULIAH 04 • TEKNIK JEMBATAN ERNEST HEMINGWAY',
  ];

  const col = phase >= 2 ? K.PAL.chalkBlue : K.PAL.chalkYellow;
  K.lectureBg(ctx, t, { floorY, courseTag: tags[phase], col });

  const headers = [
    ['ZEIGARNIK', 'MENGAPA KITA PENASARAN HAL BERSAMBUNG?', 'Temuan Psikolog Bluma Zeigarnik tentang Tugas yang Belum Selesai'],
    ['OPEN LOOP', 'TAB MEMORI KERJA DI DALAM OTAKMU', 'Tugas yang Sudah Dimulai Menciptakan Dorongan Alami untuk Tuntas'],
    ['MULAI 5%', 'AKTIFKAN PEMICU LIMA MENIT PERTAMA', 'Selama Masih 0% Otak Diam • Begitu 5% Otak Ikut Membantu'],
    ['HEMINGWAY', 'BERHENTI SAAT TAHU LANGKAH BERIKUTNYA', 'Rahasia Melanjutkan Pekerjaan Esok Pagi Tanpa Rasa Macet!'],
  ][phase];

  K.lectureHeader(ctx, headers[0], headers[1], headers[2], { col });

  const diagrams = [
    ['OBSERVASI 1927', 'PESANAN BELUM LUNAS', 'Diingat tajam sampai tugas selesai', K.PAL.chalkYellow],
    ['TUGAS 0%', 'BELUM AKTIF', 'Mudah ditunda karena belum dibuka', K.PAL.chalkPink],
    ['TUGAS 5% (5 MNT)', 'OPEN LOOP ON!', 'Otak otomatis ingin menuntaskan', K.PAL.chalkBlue],
    ['HEMINGWAY BRIDGE', 'SISAKAN 1 KALIMAT', 'Esok pagi langsung lanjut lancar', K.PAL.chalkYellow],
  ][phase];
  K.lectureBoardDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

  const charX = phase <= 1 ? 330 : 350;
  const pose = phase === 0 ? 'teach' : phase === 1 ? 'think' : phase === 2 ? 'teach' : 'eureka';
  K.lectureStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Kenapa pelayan hafal pesanan rumit sebelum bonnya dibayar?',
    'Karena otak kita selalu menyimpan tab terbuka buat tugas yang belum beres!',
    'Makanya buka dulu tugasmu 5 menit biar tab otakmu menyala!',
    'Saat efek Zeigarnik aktif, otakmu sendiri yang nagih minta selesai!',
  ];
  K.lectureBubble(ctx, charX + 20, 355, bubbles[phase], { tailX: charX, tailY: 430, col });

  if (phase === 0) {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'OBSERVASI KAFE WINA (BLUMA ZEIGARNIK, 1927)',
      titleStr: 'Tugas yang Belum Selesai Diingat 90% Lebih Kuat',
      subStr: 'Begitu tugas dinyatakan selesai, ketegangan memori langsung dilepaskan oleh otak',
      stat: '90% INGAT',
      statSub: 'BELUM SELESAI',
      col: K.PAL.chalkYellow,
      a: pop(t, C.hook.start + 0.2),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'RAHASIA CLIFFHANGER FILM & SERIAL',
      titleStr: 'Otak Benci Cerita yang Menggantung di Tengah Jalan',
      subStr: 'Kita bisa memanfaatkan mekanisme psikologis yang sama untuk menyelesaikan pekerjaan',
      stat: 'PENASARAN',
      statSub: 'DORONGAN ALAMI',
      col: K.PAL.chalkBlue,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'PERBEDAAN TUGAS 0% vs TUGAS 5%',
      titleStr: 'Efek Zeigarnik Tidak Bekerja Sebelum Kamu Memulai',
      subStr: 'Tugas yang belum pernah dibuka sama sekali tidak masuk ke radar memori kerja',
      stat: '0% = DIAM',
      statSub: 'RAWAN LUPA',
      col: K.PAL.chalkPink,
      a: pop(t, C.loop.start),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'KETEGANGAN KOGNITIF POSITIF',
      titleStr: 'Membuka File & Membuat Kerangka Menyalakan Mesin Otak',
      subStr: 'Setelah langkah pertama dibuat, pikiran otomatis mencari cara melengkapinya',
      stat: 'AKTIF!',
      statSub: 'TAB TERBUKA',
      col: K.PAL.chalkYellow,
      a: pop(t, C.loop.start + 0.5),
    });
  } else if (phase === 2) {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'TRIK PEMICU 5 MENIT (THE 5-MINUTE STARTER)',
      titleStr: 'Kerjakan Bagian Paling Mudah Selama 5 Menit Pertama',
      subStr: 'Beri judul dokumen, buat 3 poin outline, atau selesaikan satu soal pembuka',
      stat: '5 MENIT',
      statSub: 'BUKA KUNCI',
      col: K.PAL.chalkBlue,
      a: pop(t, C.buka.start),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'INKUBASI BAWAH SADAR SAAT ISTIRAHAT',
      titleStr: 'Otak Tetap Memproses Solusi Meski Kamu Sedang Rehat',
      subStr: 'Itulah sebabnya ide brilian sering muncul saat mandi setelah kita sempat memulai tugas',
      stat: 'INKUBASI',
      statSub: 'IDE MUNCUL',
      col: K.PAL.chalkYellow,
      a: pop(t, C.buka.start + 0.5),
    });
  } else {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'TEKNIK JEMBATAN HEMINGWAY (HEMINGWAY BRIDGE)',
      titleStr: 'Akhiri Sesi Kerja Saat Kamu Tahu Kalimat Selanjutnya',
      subStr: 'Tinggalkan satu catatan kecil untuk besok pagi agar kamu langsung menyambung momentum',
      stat: 'JEMBATAN',
      statSub: 'ANTI MACET',
      col: K.PAL.chalkBlue,
      a: pop(t, C.hemingway.start),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'KESIMPULAN PROFESOR KAPUR',
      titleStr: 'Ubah 0% Menjadi 5% Hari Ini & Biarkan Otakmu Menuntaskannya!',
      subStr: 'Memulai sedikit saja jauh lebih sakti daripada merencanakan seharian tanpa menyentuh',
      stat: 'TUNTAS!',
      statSub: 'EFEK ZEIGARNIK',
      col: K.PAL.chalkYellow,
      a: pop(t, C.hemingway.start + 0.5),
    });
  }
}

