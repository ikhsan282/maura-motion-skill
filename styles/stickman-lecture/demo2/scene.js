// 75 · STICKMAN LECTURE — Demo 2: Jebakan Stabilo Warna-Warni & Active Recall (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-lecture/kit.js';
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
  const floorY = 1240;

  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.kartu?.start) beat = 6;
  else if (t >= C.berat?.start) beat = 5;
  else if (t >= C.kertas?.start) beat = 4;
  else if (t >= C.recall?.start) beat = 3;
  else if (t >= C.pasif?.start) beat = 2;
  else if (t >= C.stabilo?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  const tags = [
    'KULIAH 01 • BUKU PENUH WARNA STABILO',
    'KULIAH 02 • RISET PROF DUNLOSKY: EFEKTIVITAS TERENDAH',
    'KULIAH 03 • ILUSI BELAJAR MODE PASIF',
    'KULIAH 04 • ACTIVE RECALL: TARIK KELUAR INGATAN',
    'KULIAH 05 • BLURTING METHOD: SELEMBAR KERTAS KOSONG',
    'KULIAH 06 • RASA BERAT MEMBENTUK OTOT MEMORI',
    'KULIAH 07 • UBAH SUBJUDUL JADI DAFTAR PERTANYAAN',
    'KULIAH 08 • TUTUP BUKU, UJI DIRIMU SECARA AKTIF!',
  ];

  const col = beat >= 4 ? K.PAL.chalkBlue : (beat === 2 || beat === 3 ? K.PAL.chalkPink : K.PAL.chalkYellow);

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.lectureBg(ctx, t, { floorY, courseTag: tags[beat], col });

    const diagrams = [
      ['STABILO NEON', 'WARNA-WARNI', 'Buku terang benderang tapi ingatan kosong', K.PAL.chalkYellow],
      ['DUNLOSKY 2013', 'EFEKTIVITAS RENDAH', 'Riset: Menandai teks paling tidak efektif', K.PAL.chalkPink],
      ['MODE PASIF', 'ILUSI RAJIN', 'Mata terbiasa teks, otak tidur pulas', K.PAL.chalkPink],
      ['ACTIVE RECALL', 'TARIK MEMORI', '2x lebih kuat menancap di ingatan', K.PAL.chalkBlue],
      ['BLURTING METHOD', '3 POIN KERTAS', 'Tulis tanpa mengintip buku sedikitpun', K.PAL.chalkBlue],
      ['DESIRABLE DIFFICULTY', 'OTOT MEMORI', 'Rasa memeras otak memperkuat ingatan', K.PAL.chalkYellow],
      ['FLASHCARD TANYA', 'LATIHAN UJIAN', 'Ubah judul materi jadi pertanyaan ujian', K.PAL.chalkBlue],
      ['NILAI A+', 'UJI AKTIF!', 'Tutup bukumu dan kuasai materi!', K.PAL.chalkYellow],
    ][beat];
    K.lectureBoardDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

    const charX = beat <= 2 ? 330 : 360;
    const pose = beat === 0 ? 'teach' : beat <= 2 ? 'think' : beat <= 4 ? 'teach' : beat <= 6 ? 'teach' : 'eureka';
    K.lectureStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Siapa di sini yang bukunya kayak pelangi penuh stabilo?',
      'Riset Prof Dunlosky: stabilo itu metode paling tidak efektif!',
      'Mewarnai buku cuma bikin puas mata, tapi otak pasif!',
      'Gunakan Active Recall: tutup buku, tarik isi ingatanmu!',
      'Tulis 3 poin penting di kertas kosong tanpa mengintip!',
      'Makin berat kamu memeras otak, makin kuat otot memorimu!',
      'Ubah semua subjudul buku jadi format pertanyaan ujian!',
      'Simpan stabilomu, tutup buku dan uji kemampuanmu!',
    ];
    K.lectureBubble(ctx, charX + 50, floorY - 390, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 310, col,
    });
  });

  const headers = [
    ['PELANGI?', 'JEBAKAN STABILO WARNA-WARNI', 'Mengapa Mewarnai Buku Tidak Menjamin Paham Saat Ujian?'],
    ['DUNLOSKY', 'RISET EFEKTIVITAS BELAJAR (2013)', 'Studi Menunjukkan Menandai & Baca Ulang Paling Tidak Efektif'],
    ['ILUSI', 'KEPUASAN VISUAL BELAKA', 'Otak Mengira Sudah Rajin Belajar, Padahal Pasif Total'],
    ['RECALL!', 'KEKUATAN ACTIVE RETRIEVAL', 'Menarik Informasi dari Memori Memberi Efek Retensi 2 Kali Lipat'],
    ['BLURTING', 'METODE SELEMBAR KERTAS KOSONG', 'Tulis 3 Poin Inti Tanpa Mengintip Buku Sedikit Pun'],
    ['OTOT OTAK', 'DESIRABLE DIFFICULTY PRINCIPLE', 'Rasa Berat Saat Memanggil Memori Justru Memperkuat Saraf'],
    ['PERTANYAAN', 'UBAH SUBJUDUL JADI SOAL UJIAN', 'Latih Otak Menjawab Pertanyaan Sejak Pertama Kali Belajar'],
    ['A+ JUARA', 'TUTUP BUKU & UJI DIRIMU!', 'Tinggalkan Stabilo, Praktikkan Active Recall Hari Ini!'],
  ][beat];

  K.lectureHeader(ctx, headers[0], headers[1], headers[2], { col });

  const callouts = [
    { tag: 'PARADOKS STABILO', title: 'Halaman Warna-Warni Tapi Kepala Mendadak Buntu', desc: 'Siswa sering menyamakan aktivitas mewarnai kertas dengan proses berpikir kritis', stat: 'STABILO', col: K.PAL.chalkYellow, c: C.hook },
    { tag: 'DUNLOSKY STUDY', title: 'Riset Komprehensif 10 Teknik Belajar Populer', desc: 'Highlighting dan rereading berada di peringkat terbawah efektivitas belajar', stat: 'TERENDAH', col: K.PAL.chalkPink, c: C.stabilo },
    { tag: 'PASSIVE ENCODING', title: 'Ilusi Pengenalan (Recognition Illusion)', desc: 'Melihat teks yang sudah diwarnai menipu otak bahwa kita sudah memahaminya', stat: 'ILUSI', col: K.PAL.chalkPink, c: C.pasif },
    { tag: 'ACTIVE RETRIEVAL', title: 'Tarik Informasi Keluar, Jangan Cuma Dimasukkan', desc: 'Proses recall memaksa neuron membangun jalur asosiasi informasi yang kokoh', stat: '2x RETENSI', col: K.PAL.chalkBlue, c: C.recall },
    { tag: 'BLURTING PROTOCOL', title: 'Tuliskan Inti Pelajaran di Kertas Kosong', desc: 'Begitu selesai 1 bab, langsung uji diri dengan menuliskan apa yang diingat', stat: '3 POIN', col: K.PAL.chalkBlue, c: C.kertas },
    { tag: 'EFFORTFUL LEARNING', title: 'Kunci Penguatan Ingatan Ada pada Rasa Berat', desc: 'Robert Bjork: Semakin sulit memanggil ingatan, semakin awet ingatan tersebut disimpan', stat: 'OTOT MEMORI', col: K.PAL.chalkYellow, c: C.berat },
    { tag: 'INQUIRY METHOD', title: 'Ubah Catatan Pasif Menjadi Soal Latihan Mandiri', desc: 'Belajar dengan menjawab pertanyaan mensimulasikan situasi ujian yang sesungguhnya', stat: 'SOAL MANDIRI', col: K.PAL.chalkBlue, c: C.kartu },
    { tag: 'PESAN JUARA', title: 'Tutup Bukumu & Buktikan Pemahamanmu Hari Ini', desc: 'Beralihlah ke active recall dan rasakan lonjakan pemahaman yang sesungguhnya!', stat: 'A+ JUARA', col: K.PAL.chalkYellow, c: C.moral },
  ][beat];

  K.lectureCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
