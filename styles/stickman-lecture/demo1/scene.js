// 75 · STICKMAN LECTURE — Demo 1: Kurva Lupa Ebbinghaus & Spaced Repetition
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
  if (t >= C.hemat.start) phase = 3;
  else if (t >= C.spaced.start) phase = 2;
  else if (t >= C.turun.start) phase = 1;

  const tags = [
    'KULIAH 01 • MENGAPA SKS CEPAT MENGUAP?',
    'KULIAH 02 • FORGETTING CURVE (EBBINGHAUS, 1885)',
    'KULIAH 03 • RUMUS SPACED REPETITION (H-1, H-3, H-7)',
    'KULIAH 04 • 20 MENIT x 4 HARI > 4 JAM SEMALAM',
  ];

  const col = phase >= 2 ? K.PAL.chalkBlue : K.PAL.chalkYellow;
  K.lectureBg(ctx, t, { floorY, courseTag: tags[phase], col });

  const headers = [
    ['KULIAH 101', 'PERHATIAN KE PAPAN TULIS!', 'Mengapa Hafalan Sistem Kebut Semalam Hilang Dalam 2 Hari?'],
    ['HILANG 60%', 'KURVA LUPA HERMANN EBBINGHAUS', 'Tanpa Pengulangan, 60% Informasi Baru Terbuang Dalam 24 Jam'],
    ['H-1 • H-3 • H-7', 'METODE SPACED REPETITION', 'Panggil Kembali Ingatan Tepat Sebelum Kurvanya Turun'],
    ['PERMANEN!', '20 MENIT BERJARAK > 4 JAM SKS', 'Perkuat Sinapsis Memori Jangka Panjang Tanpa Begadang!'],
  ][phase];

  K.lectureHeader(ctx, headers[0], headers[1], headers[2], { col });

  const diagrams = [
    ['FENOMENA SKS', 'HAFAL → LUPA!', 'Memori jangka pendek cepat runtuh', K.PAL.chalkYellow],
    ['KURVA EBBINGHAUS', '24 JAM = -60%', 'Otak membuang info tanpa ulangan', K.PAL.chalkPink],
    ['INTERVAL EMAS', 'H-1 • H-3 • H-7', 'Reset kurva lupa ke 100% kembali', K.PAL.chalkBlue],
    ['LONG-TERM MEMORY', 'INGAT PERMANEN', 'Sinapsis saraf terkunci kuat', K.PAL.chalkYellow],
  ][phase];
  K.lectureBoardDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

  const charX = phase <= 1 ? 330 : 350;
  const pose = phase === 0 ? 'teach' : phase === 1 ? 'think' : phase === 2 ? 'teach' : 'eureka';
  K.lectureStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Perhatian ke papan tulis! Siapa yang masih suka SKS?',
    'Dalam 24 jam, 60% hafalanmu menguap kalau tidak diulang!',
    'Rahasianya: ulangi di Hari ke-1, Hari ke-3, dan Hari ke-7!',
    'Cukup 20 menit sehari, ilmumu terkunci permanen!',
  ];
  K.lectureBubble(ctx, charX + 20, 355, bubbles[phase], { tailX: charX, tailY: 430, col });

  if (phase === 0) {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'KELEMAHAN SISTEM KEBUT SEMALAM (CRAMMING)',
      titleStr: 'Menumpuk Materi di Satu Malam Hanya Masuk Memori Sementara',
      subStr: 'Begitu ujian selesai, otak langsung melakukan pembersihan memori masal',
      stat: 'MENGUAP',
      statSub: 'MEMORI RAPUH',
      col: K.PAL.chalkYellow,
      a: pop(t, C.hook.start + 0.2),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'PENELITIAN HERMANN EBBINGHAUS (1885)',
      titleStr: 'Eksperimen Ilmiah Pertama tentang Laju Kelupaan Manusia',
      subStr: 'Penurunan ingatan paling tajam justru terjadi pada beberapa jam pertama setelah belajar',
      stat: 'KURVA LUPA',
      statSub: 'RUMUS KLASIK',
      col: K.PAL.chalkBlue,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'DATA PENURUNAN INGATAN 24 JAM',
      titleStr: 'Lebih dari 60% Materi Hilang Jika Tidak Ditinjau Ulang',
      subStr: 'Otak menganggap informasi yang hanya lewat sekali sebagai data yang tidak penting',
      stat: '-60% INFO',
      statSub: 'DALAM 24 JAM',
      col: K.PAL.chalkPink,
      a: pop(t, C.turun.start),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'BEBAN KOGNITIF BERLEBIH (COGNITIVE OVERLOAD)',
      titleStr: 'Belajar 4 Jam Nonstop Membuat Konsentrasi Anjlok',
      subStr: 'Kelelahan saraf di tengah malam merusak proses konsolidasi memori saat tidur',
      stat: 'OVERLOAD',
      statSub: 'GAGAL SERAP',
      col: K.PAL.chalkYellow,
      a: pop(t, C.turun.start + 0.5),
    });
  } else if (phase === 2) {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'JADWAL PENGULANGAN BERJARAK (SPACED REPETITION)',
      titleStr: 'Review Singkat 10 Menit pada H+1, H+3, H+7, dan H+14',
      subStr: 'Setiap pengulangan melandaikan kurva lupa hingga ingatan menjadi tahan lama',
      stat: '1-3-7-14',
      statSub: 'JADWAL REVIEW',
      col: K.PAL.chalkBlue,
      a: pop(t, C.spaced.start),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'NEUROSAINS KONSOLIDASI SINAPSIS',
      titleStr: 'Usaha Memanggil Ingatan Mempertebal Jalur Myelin Saraf',
      subStr: 'Memberi sinyal pada hipokampus bahwa ilmu ini wajib disimpan untuk jangka panjang',
      stat: 'SINAPSIS',
      statSub: 'JALUR KUAT',
      col: K.PAL.chalkYellow,
      a: pop(t, C.spaced.start + 0.5),
    });
  } else {
    K.lectureCard(ctx, 540, 995, 960, 175, {
      tag: 'EFISIENSI WAKTU BELAJAR',
      titleStr: '80 Menit Terbagi 4 Hari Mengalahkan 240 Menit Semalam',
      subStr: 'Hemat waktu belajar hingga tiga kali lipat dengan hasil nilai dan pemahaman lebih tinggi',
      stat: '3x EFISIEN',
      statSub: 'HEMAT WAKTU',
      col: K.PAL.chalkBlue,
      a: pop(t, C.hemat.start),
    });
    K.lectureCard(ctx, 540, 1210, 960, 175, {
      tag: 'KESIMPULAN PROFESOR KAPUR',
      titleStr: 'Cicil Review Harianmu & Ucapkan Selamat Tinggal pada SKS!',
      subStr: 'Tidur cukup malam sebelum ujian adalah bagian dari rumus kecerdasan sejati',
      stat: 'NILAI A+',
      statSub: 'PAHAM PERMANEN',
      col: K.PAL.chalkYellow,
      a: pop(t, C.hemat.start + 0.5),
    });
  }
}
