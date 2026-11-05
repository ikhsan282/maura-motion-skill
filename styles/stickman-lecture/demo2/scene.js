// 75 · STICKMAN LECTURE — Demo 2: Jebakan Stabilo vs Active Recall (Studi Prof. John Dunlosky)
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
  if (t >= C.kartu.start) phase = 3;
  else if (t >= C.kertas.start) phase = 2;
  else if (t >= C.pasif.start) phase = 1;

  const tags = [
    'KULIAH 01 • ILUSI STABILO WARNA-WARNI',
    'KULIAH 02 • STUDI DUNLOSKY: PASIF vs AKTIF',
    'KULIAH 03 • METODE ACTIVE RECALL (TUTUP BUKU)',
    'KULIAH 04 • UBAH SUBJUDUL JADI PERTANYAAN',
  ];

  const col = phase >= 2 ? K.PAL.chalkBlue : K.PAL.chalkYellow;
  K.lectureBg(ctx, t, { floorY, courseTag: tags[phase], col });

  const headers = [
    ['STABILO?', 'JEBAKAN BUKU PENUH WARNA STABILO', 'Mengapa Menandai Buku Sering Menipu Kita Merasa Sudah Paham?'],
    ['RENDAH!', 'RISET PROF. JOHN DUNLOSKY (2013)', 'Membaca Ulang & Stabilo Adalah Metode Berefektivitas Rendah'],
    ['TUTUP BUKU', 'KEKUATAN ACTIVE RECALL (2x AMPUH)', 'Tarik Keluar Informasi dari Ingatan di Atas Kertas Kosong'],
    ['KUASAI!', 'UBAH CATATAN MENJADI KUIS AKTIF', 'Rasa Berat Saat Mengingat Adalah Tanda Otot Memori Terbentuk!'],
  ][phase];

  K.lectureHeader(ctx, headers[0], headers[1], headers[2], { col });

  const diagrams = [
    ['HIGHLIGHTING', ' EFEKTIVITAS RENDAH', 'Sibuk mewarnai tanpa memproses', K.PAL.chalkPink],
    ['MODE PASIF', 'INPUT ≠ INGAT', 'Hanya menyalin dari mata ke tangan', K.PAL.chalkYellow],
    ['ACTIVE RECALL', 'TUTUP & TULIS!', 'Tarik paksa memori dari kepala', K.PAL.chalkBlue],
    ['TESTING EFFECT', '2x LEBIH KUAT', 'Siap tempur menghadapi ujian', K.PAL.chalkYellow],
  ][phase];
  K.lectureBoardDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

  const charX = phase <= 1 ? 330 : 350;
  const pose = phase === 0 ? 'teach' : phase === 1 ? 'think' : phase === 2 ? 'teach' : 'eureka';
  K.lectureStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Bukunya warna-warni kayak pelangi, tapi isinya ingat nggak?',
    'Mewarnai buku itu enak karena otak kita nggak perlu mikir berat!',
    'Coba tutup bukumu, lalu tulis 3 poin tadi di kertas kosong!',
    'Ubah judul bab jadi pertanyaan, dijamin langsung nempel!',
  ];
  K.lectureBubble(ctx, charX + 20, 355, bubbles[phase], { tailX: charX, tailY: 430, col });

  if (phase === 0) {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'KEBIASAAN BELAJAR PALING POPULER NAMUN KELIRU',
      titleStr: 'Menstabilo Kalimat & Membaca Ulang Berjam-jam',
      subStr: 'Memberikan perasaan produktif palsu tanpa menguji kemampuan mengingat',
      stat: 'SEMU',
      statSub: 'PRODUKTIF PALSU',
      col: K.PAL.chalkPink,
      a: pop(t, C.hook.start + 0.2),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'EVALUASI 10 TEKNIK BELAJAR (DUNLOSKY ET AL.)',
      titleStr: 'Highlighting & Re-Reading Mendapat Skor Utility Rendah',
      subStr: 'Sedangkan Practice Testing (uji mandiri) meraih predikat efektivitas tertinggi',
      stat: 'SKOR RENDAH',
      statSub: 'BACA ULANG',
      col: K.PAL.chalkYellow,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'MENGAPA MEMBACA ULANG TIDAK EFEKTIF?',
      titleStr: 'Otak Hanya Mengenali Teks, Bukan Memanggil Memori',
      subStr: 'Saat ujian nanti, buku tidak ada di depan mata — yang diuji adalah penarikan ingatan',
      stat: 'PASIF',
      statSub: 'NOL LATIHAN',
      col: K.PAL.chalkYellow,
      a: pop(t, C.pasif.start),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'PRINSIP RETRIEVAL PRACTICE (ACTIVE RECALL)',
      titleStr: 'Memori Diperkuat Saat Kita Menarik Informasi Keluar',
      subStr: 'Bukan saat kita terus-menerus memasukkan informasi secara pasif ke kepala',
      stat: 'TARIK KELUAR',
      statSub: 'KUNCI INGATAN',
      col: K.PAL.chalkBlue,
      a: pop(t, C.pasif.start + 0.5),
    });
  } else if (phase === 2) {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'TEKNIK BLURTING (KERTAS KOSONG)',
      titleStr: 'Baca 1 Halaman → Tutup Buku → Tulis Semua yang Diingat',
      subStr: 'Buka kembali bukumu hanya untuk mengecek bagian mana yang terlewat',
      stat: 'BLURTING',
      statSub: 'UJI KERTAS KOSONG',
      col: K.PAL.chalkBlue,
      a: pop(t, C.kertas.start),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'KONSEP DESIRABLE DIFFICULTY (ROBERT BJORK)',
      titleStr: 'Makin Keras Otak Berusaha Mengingat, Makin Kuat Hasilnya',
      subStr: 'Sama seperti mengangkat beban di gym, sedikit kesulitan menumbuhkan kekuatan saraf',
      stat: 'OTOT OTAK',
      statSub: 'LATIHAN AKTIF',
      col: K.PAL.chalkYellow,
      a: pop(t, C.kertas.start + 0.5),
    });
  } else {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'METODE CORNELL & FLASHCARD PERTANYAAN',
      titleStr: 'Catat Dalam Bentuk Pertanyaan, Bukan Sekadar Salinan Kalimat',
      subStr: 'Contoh: jangan catat definisi, melainkan tulis "Apa perbedaan mitosis dan meiosis?"',
      stat: 'KUIS MANDIRI',
      statSub: 'AKTIF 100%',
      col: K.PAL.chalkBlue,
      a: pop(t, C.kartu.start),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'KESIMPULAN PROFESOR KAPUR',
      titleStr: '30 Menit Active Recall Mengalahkan 3 Jam Menstabilo Buku!',
      subStr: 'Tutup bukumu sekarang dan buktikan seberapa banyak yang benar-benar kamu kuasai',
      stat: '2x AMPUH',
      statSub: 'ACTIVE RECALL',
      col: K.PAL.chalkYellow,
      a: pop(t, C.kartu.start + 0.5),
    });
  }
}

