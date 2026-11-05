// 75 · STICKMAN LECTURE — Demo 1: Kurva Lupa Ebbinghaus & Spaced Repetition (Full-Screen 1080x1920 8-Beat Standard)
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
  else if (t >= C.hemat?.start) beat = 6;
  else if (t >= C.sinyal?.start) beat = 5;
  else if (t >= C.spaced?.start) beat = 4;
  else if (t >= C.sks?.start) beat = 3;
  else if (t >= C.turun?.start) beat = 2;
  else if (t >= C.ebbinghaus?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  const tags = [
    'KULIAH 01 • PERHATIAN KE PAPAN TULIS!',
    'KULIAH 02 • FORGETTING CURVE (EBBINGHAUS 1885)',
    'KULIAH 03 • 24 JAM PERTAMA: HILANG 60% INFORMASI',
    'KULIAH 04 • SISTEM SKS: MENULIS DI ATAS AIR',
    'KULIAH 05 • SPACED REPETITION: H-1, H-3, H-7',
    'KULIAH 06 • KONSOLIDASI SINAPSIS MEMORI JANGKA PANJANG',
    'KULIAH 07 • 20 MENIT x 4 HARI > 4 JAM SEMALAM',
    'KULIAH 08 • KUASAI ILMU UNTUK SELAMANYA!',
  ];

  const col = beat >= 4 ? K.PAL.chalkBlue : (beat === 2 || beat === 3 ? K.PAL.chalkPink : K.PAL.chalkYellow);

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.lectureBg(ctx, t, { floorY, courseTag: tags[beat], col });

    const diagrams = [
      ['KULIAH UMUM', 'SKS HILANG?', 'Mengapa materi cepat menguap', K.PAL.chalkYellow],
      ['EBBINGHAUS 1885', 'KURVA LUPA', 'Penelitian laju kelupaan manusia', K.PAL.chalkPink],
      ['DROP DRASTIS', '-60% MEMORI', 'Tanpa pengulangan info dibuang', K.PAL.chalkPink],
      ['ILUSI SKS', 'MEMORI SEMENTARA', 'Menulis kapur di atas air', K.PAL.chalkYellow],
      ['INTERVAL EMAS', 'H-1 • H-3 • H-7', 'Reset kurva ingatan ke 100%', K.PAL.chalkBlue],
      ['NEUROSAINS', 'SINAPSIS KUAT', 'Kunci memori jangka panjang', K.PAL.chalkBlue],
      ['EFISIENSI WAKTU', '20 MNT x 4 HARI', 'Hemat waktu, hasil maksimal', K.PAL.chalkYellow],
      ['NILAI A+', 'PAHAM PERMANEN', 'Kuasai ilmu tanpa begadang!', K.PAL.chalkYellow],
    ][beat];
    K.lectureBoardDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

    const charX = beat <= 2 ? 330 : 360;
    const pose = beat === 0 ? 'teach' : beat <= 2 ? 'think' : beat <= 4 ? 'teach' : beat <= 6 ? 'teach' : 'eureka';
    K.lectureStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Perhatian ke papan tulis! Siapa di sini yang masih suka SKS?',
      'Hermann Ebbinghaus memetakan rumus Kurva Lupa ini sejak 1885!',
      'Tanpa pengulangan, 60% hafalan baru langsung dibuang otak!',
      'SKS itu menampung info di memori rapuh, kayak nulis di air!',
      'Gunakan Spaced Repetition: ulangi di Hari 1, Hari 3, dan Hari 7!',
      'Tarik ingatan sebelum lupa, sinapsis saraf langsung diperkuat!',
      'Belajar 20 menit 4 hari jauh lebih sakti daripada 4 jam semalam!',
      'Cicil pengulangan secara berjarak, kuasai ilmu selamanya!',
    ];
    K.lectureBubble(ctx, charX + 50, floorY - 390, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 310, col,
    });
  });

  const headers = [
    ['KULIAH 101', 'PERHATIAN KE PAPAN TULIS!', 'Mengapa Hafalan Sistem Kebut Semalam Hilang dalam 2 Hari?'],
    ['EBBINGHAUS', 'KURVA LUPA HERMANN EBBINGHAUS', 'Penelitian Klasik 1885 tentang Penurunan Ingatan Manusia'],
    ['DROP 60%', '24 JAM PERTAMA TANPA ULANGAN', 'Otak Otomatis Membersihkan Data yang Dianggap Tidak Penting'],
    ['ILUSI SKS', 'MENULIS DI ATAS AIR', 'Memori Jangka Pendek Menampung Sementara Lalu Menguap'],
    ['INTERVAL', 'METODE SPACED REPETITION', 'Ulangi Materi pada Hari ke-1, Hari ke-3, dan Hari ke-7'],
    ['SINAPSIS', 'MEMPERKUAT MEMORI JANGKA PANJANG', 'Usaha Pemanggilan Ingatan Menghubungkan Jaringan Saraf Kuat'],
    ['EFISIEN!', '20 MENIT x 4 HARI > 4 JAM SEMALAM', 'Belajar Terukur Mencegah Kelelahan Kognitif dan Stres'],
    ['PERMANEN', 'RUMUS JUARA PROFESOR KAPUR', 'Cicil Pengulangan Berjarak & Miliki Pemahaman Abadi!'],
  ][beat];

  K.lectureHeader(ctx, headers[0], headers[1], headers[2], { col });

  const callouts = [
    { tag: 'PARADOKS UJIAN', title: 'Hafal Semalaman Tapi Hilang Total Setelah 2 Hari', desc: 'Sistem Kebut Semalam (cramming) hanya mengisi working memory jangka pendek', stat: 'MENGUAP', col: K.PAL.chalkYellow, c: C.hook },
    { tag: 'FORGETTING CURVE', title: 'Penemuan Hermann Ebbinghaus Tahun 1885', desc: 'Eksperimen pertama yang membuktikan laju eksponensial kelupaan manusia', stat: '1885', col: K.PAL.chalkPink, c: C.ebbinghaus },
    { tag: 'DATA RISET', title: '60% Informasi Lenyap dalam 24 Jam Pertama', desc: 'Mekanisme biologis otak secara aktif menyortir memori yang tidak ditinjau ulang', stat: '-60%', col: K.PAL.chalkPink, c: C.turun },
    { tag: 'COGNITIVE TRAP', title: 'Cramming Persis Seperti Menulis Kapur di Atas Air', desc: 'Beban kognitif berlebih di malam hari merusak proses konsolidasi saat tidur', stat: 'SKS RAPUH', col: K.PAL.chalkYellow, c: C.sks },
    { tag: 'SPACED REPETITION', title: 'Jadwal Review Strategis: H+1, H+3, dan H+7', desc: 'Tiap review singkat mengembalikan kurva retensi ingatan kembali ke 100%', stat: 'H-1/3/7', col: K.PAL.chalkBlue, c: C.spaced },
    { tag: 'NEUROPLASTISITAS', title: 'Active Retrieval Mempertebal Lapisan Mielin Saraf', desc: 'Semakin otak berusaha memanggil ingatan, semakin kuat jalur sinapsis terbentuk', stat: 'SINAPSIS', col: K.PAL.chalkBlue, c: C.sinyal },
    { tag: 'HUKUM EFISIENSI', title: '80 Menit Cicilan Mengalahkan 240 Menit Sekaligus', desc: 'Menghemat waktu belajar hingga 3x lipat dengan retensi ingatan jauh lebih awet', stat: '3x HEMAT', col: K.PAL.chalkYellow, c: C.hemat },
    { tag: 'PESAN JUARA', title: 'Pahami Sains Belajar & Kunci Ilmumu Hari Ini', desc: 'Ucapkan selamat tinggal pada panik ujian dengan pengulangan berjarak teratur!', stat: 'A+ JUARA', col: K.PAL.chalkYellow, c: C.moral },
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
