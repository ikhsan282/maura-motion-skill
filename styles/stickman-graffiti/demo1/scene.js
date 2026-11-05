// 74 · STICKMAN GRAFFITI — Demo 1: Tembok Ini Saksi Mimpimu (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-graffiti/kit.js';
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
  else if (t >= C.bangga?.start) beat = 6;
  else if (t >= C.volume?.start) beat = 5;
  else if (t >= C.semprot?.start) beat = 4;
  else if (t >= C.kotor?.start) beat = 3;
  else if (t >= C.batal?.start) beat = 2;
  else if (t >= C.selera?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  const tags = [
    'TEMBOK 01 • KETAKUTAN GARIS PERTAMA',
    'TEMBOK 02 • THE TASTE GAP (IRA GLASS)',
    'TEMBOK 03 • JEBAKAN MENUNGGU 100% SIAP',
    'TEMBOK 04 • KARYA KASAR > ANGAN SEMPURNA',
    'TEMBOK 05 • KOCOK KALENG, BUAT OUTLINE!',
    'TEMBOK 06 • TUTUP KESENJANGAN DENGAN VOLUME',
    'TEMBOK 07 • TEMBOK PERTAMA JADI SAKSI BISU',
    'TEMBOK 08 • SEMPROTKAN WARNAMU HARI INI!',
  ];

  const col = beat >= 4 ? K.PAL.cyan : (beat === 2 || beat === 3 ? K.PAL.yellow : K.PAL.pink);

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.graffitiBg(ctx, t, { floorY, wallTag: tags[beat], col });

    const murals = [
      ['TEMBOK KOSONG', 'TAKUT MIRING?', 'Membeku sebelum garis pertama', K.PAL.pink, K.PAL.cyan],
      ['THE TASTE GAP', 'SELERA vs SKILL', 'Standar tinggi vs jam terbang', K.PAL.pink, K.PAL.yellow],
      ['MENUNGGU SIAP', '0 KARYA NYATA', 'Kanvas tetap kosong selamanya', K.PAL.yellow, K.PAL.pink],
      ['DONE > PERFECT', 'SELESAIKAN DULU', 'Kasar nyata kalahkan sempurna di angan', K.PAL.yellow, K.PAL.cyan],
      ['GARIS OUTLINE', 'GERAKKAN TANGAN', 'Tangan belajar saat menyemprot', K.PAL.cyan, K.PAL.pink],
      ['VOLUME KARYA', 'TUTUP GAP SKILL', 'Bikin banyak dari minggu ke minggu', K.PAL.cyan, K.PAL.yellow],
      ['JEJAK SEJARAH', 'SAKSI MIMPIMU', 'Pondasi kebanggaan masa depan', K.PAL.cyan, K.PAL.pink],
      ['MAHAKARYA!', 'WARNAI DUNIA', 'Berani berkarya sampai tuntas!', K.PAL.cyan, K.PAL.yellow],
    ][beat];
    K.graffitiWallArt(ctx, floorY, murals[0], murals[1], murals[2], { col: murals[3], accent: murals[4] });

    const charX = beat <= 2 ? 330 : 360;
    const pose = beat === 0 ? 'hesitate' : beat <= 2 ? 'hesitate' : beat <= 5 ? 'spray' : 'victory';
    K.graffitiStickman(ctx, charX, floorY, pose, { facing: 1, t, sprayCol: col });

    const bubbles = [
      'Temboknya gede banget... takut salah garis pertama!',
      'Oh, wajar selera awalku lebih tinggi dari skill tanganku!',
      'Nunggu siap 100%? Tembok ini bakal kosong selamanya!',
      'Karya kasar yang selesai jauh lebih berharga daripada angan!',
      'Kocok kaleng pilox, bikin sketsa garis dasarnya dulu!',
      'Tutup kesenjangan ini dengan terus bikin karya tiap minggu!',
      'Coretan pertama ini kelak bakal jadi saksi keberanianku!',
      'Jangan takut salah, semprotkan warnamu sekarang juga!',
    ];
    K.graffitiBubble(ctx, charX + 50, floorY - 390, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 310, col,
    });
  });

  const headers = [
    ['MULAI!', 'TEMBOK INI SAKSI MIMPIMU', 'Mengapa Coretan Pertama Tidak Perlu Menunggu Sempurna?'],
    ['GAP!', 'THE TASTE GAP (SELERA vs SKILL)', 'Selera Senimu Sudah Tinggi, Tanganmu Butuh Jam Terbang'],
    ['MENUNGGU', 'JEBAKAN MENUNGGU 100% SIAP', 'Tembok Impianmu Akan Selamanya Kosong Jika Tidak Dimulai'],
    ['SELESAI!', 'DONE IS BETTER THAN PERFECT', 'Karya Nyata yang Kasar Mengalahkan Mahakarya di Angan-Angan'],
    ['OUTLINE', 'BELAJAR LEWAT GERAKAN TANGAN', 'Kocok Kaleng Piloxmu & Buat Sketsa Garis Tanpa Ragu'],
    ['VOLUME', 'MENUTUP KESENJANGAN DENGAN KUANTITAS', 'Hasilkan Volume Karya dari Minggu ke Minggu Tanpa Henti'],
    ['SAKSI', 'PONDASI KEBANGGAAN MASA DEPAN', 'Tembok Penuh Coretan Berani Adalah Saksi Lahirnya Keahlianmu'],
    ['MAHAKARYA', 'WARNAI TEMBOK IMPIANMU', 'Tunjukkan Karyamu ke Dunia & Banggalah Menjadi Kreator!'],
  ][beat];

  K.graffitiHeader(ctx, headers[0], headers[1], headers[2], { col });

  const callouts = [
    { tag: 'BLANK WALL', title: 'Berdiri Membeku di Depan Kanvas yang Kosong', desc: 'Rasa takut salah garis membuat banyak orang gagal menyemprotkan titik pertama', stat: 'BEKU', col: K.PAL.pink, c: C.hook },
    { tag: 'THE TASTE GAP', title: 'Teori Ira Glass: Selera vs Kemampuan Eksekusi', desc: 'Rasa kecewa pada hasil awal adalah tanda bahwa kamu memiliki standar seni yang bagus', stat: 'TASTE GAP', col: K.PAL.pink, c: C.selera },
    { tag: 'ILUSI KESIAPAN', title: 'Menunggu Seratus Persen Siap Adalah Jebakan', desc: 'Kesiapan tidak pernah datang sebelum kamu menyentuhkan tangan ke tembok', stat: '0 KARYA', col: K.PAL.yellow, c: C.batal },
    { tag: 'NILAI EKSEKUSI', title: 'Satu Karya Kasar Mengalahkan Seribu Ide di Kepala', desc: 'Kamu bisa memperbaiki coretan yang sudah ada, tapi tak bisa mengedit kanvas kosong', stat: 'EKSEKUSI', col: K.PAL.yellow, c: C.kotor },
    { tag: 'KINESTHETIC LOOP', title: 'Tangan Manusia Hanya Bisa Belajar Sambil Bergerak', desc: 'Begitu cat pertama disemprotkan, fokus kerja langsung menggantikan rasa ragu', stat: 'OUTLINE', col: K.PAL.cyan, c: C.semprot },
    { tag: 'HUKUM VOLUME', title: 'Satu-Satunya Jembatan Menuju Mahir Adalah Kuantitas', desc: 'Konsistensi menghasilkan karya dari minggu ke minggu adalah rahasia para master', stat: 'VOLUME', col: K.PAL.cyan, c: C.volume },
    { tag: 'JEJAK SEJARAH', title: 'Tembok Pertama Adalah Monumen Keberanianmu', desc: 'Kelak kamu akan tersenyum melihat bagaimana coretan awalmu mengawali segalanya', stat: 'SAKSI NYATA', col: K.PAL.pink, c: C.bangga },
    { tag: 'PESAN JUARA', title: 'Semprotkan Warna Pertamamu Sekarang Juga', desc: 'Dunia menunggu sentuhan unikmu, mulailah berkarya tanpa takut salah!', stat: 'BERKARYA', col: K.PAL.cyan, c: C.moral },
  ][beat];

  K.graffitiCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
