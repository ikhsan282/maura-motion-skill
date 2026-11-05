// 74 · STICKMAN GRAFFITI — Demo 2: Jangan Hapus Gagalmu, Timpa dengan Karya (Full-Screen 1080x1920 8-Beat Standard)
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
  else if (t >= C.tebal?.start) beat = 6;
  else if (t >= C.lapisan?.start) beat = 5;
  else if (t >= C.hidup?.start) beat = 4;
  else if (t >= C.lelehan?.start) beat = 3;
  else if (t >= C.rahasia?.start) beat = 2;
  else if (t >= C.panik?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  const tags = [
    'TEMBOK 01 • TIDAK ADA TOMBOL UNDO',
    'TEMBOK 02 • PANIK SAAT CAT MELELEH',
    'TEMBOK 03 • RAHASIA MURAL: TIMPA DENGAN WARNA BARU',
    'TEMBOK 04 • LELEHAN CAT JADI EFEK SHADOW 3D',
    'TEMBOK 05 • GAGAL PROYEK BUKAN NODA PERMANEN',
    'TEMBOK 06 • JADIKAN DASAR KARYA LEBIH MATANG',
    'TEMBOK 07 • KEKAYAAN LAPISAN PERBAIKAN',
    'TEMBOK 08 • TIMPA GAGALMU DENGAN KARYA BARU!',
  ];

  const col = beat >= 4 ? K.PAL.cyan : (beat === 2 || beat === 3 ? K.PAL.yellow : K.PAL.pink);

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.graffitiBg(ctx, t, { floorY, wallTag: tags[beat], col });

    const murals = [
      ['NO UNDO', 'CAT MELELEH', 'Tidak ada penghapus di jalanan', K.PAL.pink, K.PAL.yellow],
      ['PANIK PEMULA', 'KABUR DARI TEMBOK', 'Merasa satu noda merusak segalanya', K.PAL.pink, K.PAL.pink],
      ['TIMPA WARNA', 'LAPISAN BARU', 'Tutup kesalahan dengan warna tegas', K.PAL.yellow, K.PAL.cyan],
      ['EFEK 3D', 'SERAP KESALAHAN', 'Ubah lelehan cat jadi bayangan hidup', K.PAL.yellow, K.PAL.pink],
      ['KARIER NYATA', 'BUKAN NODA TETAP', 'Satu kegagalan bukan akhir masa depan', K.PAL.cyan, K.PAL.yellow],
      ['PONDASI BARU', 'BELAJAR DARI SALAH', 'Jadikan batu loncatan karya matang', K.PAL.cyan, K.PAL.pink],
      ['BERKARAKTER', 'BERLAPIS-LAPIS', 'Karya kaya lahir dari banyak perbaikan', K.PAL.cyan, K.PAL.yellow],
      ['MAHAKARYA!', 'JANGAN BERHENTI', 'Timpa dengan karya lebih berani!', K.PAL.cyan, K.PAL.pink],
    ][beat];
    K.graffitiWallArt(ctx, floorY, murals[0], murals[1], murals[2], { col: murals[3], accent: murals[4] });

    const charX = beat <= 2 ? 330 : 360;
    const pose = beat === 0 ? 'hesitate' : beat === 1 ? 'hesitate' : beat <= 4 ? 'spray' : 'victory';
    K.graffitiStickman(ctx, charX, floorY, pose, { facing: 1, t, sprayCol: col });

    const bubbles = [
      'Gak ada tombol Undo di jalanan pas catnya belepotan!',
      'Waduh belepotan! Mau kabur tinggalin temboknya aja!',
      'Tenang! Cat salah selalu bisa ditimpa warna baru!',
      'Malah lelehan cat ini bisa kujadiin efek bayangan 3D!',
      'Satu proyek gagal bukan berarti karierku tamat!',
      'Gunakan kesalahan kemarin sebagai warna dasar karya baru!',
      'Makin banyak lapisan perbaikan, karyaku makin berkarakter!',
      'Jangan hapus gagalmu, timpa dengan karya lebih keren!',
    ];
    K.graffitiBubble(ctx, charX + 50, floorY - 390, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 310, col,
    });
  });

  const headers = [
    ['NO UNDO', 'SENI GRAFITI JALANAN', 'Ketika Cat Semprot Meleleh, Tidak Ada Tombol Kembali'],
    ['PANIK', 'JEBAKAN PEMULA: MUDAH MENYERAH', 'Menganggap Satu Kesalahan Kecil Merusak Seluruh Perjalanan'],
    ['TIMPA!', 'RAHASIA SENIMAN MURAL BERPENGALAMAN', 'Cat Semprot yang Salah Selalu Bisa Ditimpa Warna Baru'],
    ['EFEK 3D', 'UBAH CACAT MENJADI DAYA TARIK', 'Lelehan Cat Spontan Disulap Menjadi Dimensi Bayangan'],
    ['KARIER', 'GAGAL BUKAN NODA PERMANEN', 'Satu Proyek yang Meleset Bukan Akhir dari Kemampuanmu'],
    ['LAPISAN', 'PONDASI UNTUK KARYA LEBIH MATANG', 'Jadikan Kegagalan Kemarin Lapisan Dasar untuk Melompat'],
    ['KARAKTER', 'KEDALAMAN DARI PROSES PERBAIKAN', 'Mural Terbaik Selalu Memiliki Banyak Lapisan Eksperimen'],
    ['BANGKIT', 'TIMPA DENGAN KARYA BARU', 'Jangan Berhenti! Lanjutkan Langkahmu dengan Warna Lebih Berani!'],
  ][beat];

  K.graffitiHeader(ctx, headers[0], headers[1], headers[2], { col });

  const callouts = [
    { tag: 'REALITAS JALANAN', title: 'Di Atas Tembok Tidak Ada Tombol Backspace', desc: 'Dunia nyata menuntut keberanian menghadapi hasil yang tidak terduga', stat: 'NO UNDO', col: K.PAL.pink, c: C.hook },
    { tag: 'REAKSI PANIK', title: 'Pemula Cenderung Menyerah Saat Menemukan Noda', desc: 'Merasa malu dan ingin meninggalkan kanvas sebelum karyanya selesai', stat: 'PANIK', col: K.PAL.pink, c: C.panik },
    { tag: 'TEKNIK OVERLAY', title: 'Cat yang Salah Bisa Ditimpa Lapisan Warna Tegas', desc: 'Prinsip grafiti: Lapisan baru yang kontras menutup goresan sebelumnya', stat: 'TIMPA WARNA', col: K.PAL.yellow, c: C.rahasia },
    { tag: 'HAPPY ACCIDENTS', title: 'Bob Ross Effect: Ubah Kesalahan Jadi Elemen Unik', desc: 'Lelehan cat yang menetes memberi tekstur organik yang sulit ditiru', stat: 'EFEK 3D', col: K.PAL.yellow, c: C.lelehan },
    { tag: 'PERSPEKTIF HIDUP', title: 'Gagal Satu Proyek Bukan Tanda Kamu Tidak Mampu', desc: 'Setiap profesional besar pernah memiliki portofolio yang berantakan di awal', stat: 'KARIER', col: K.PAL.cyan, c: C.hidup },
    { tag: 'LAYERED LEARNING', title: 'Gunakan Pengalaman Lama Sebagai Undercoat', desc: 'Pelajaran dari masa sulit membentuk intuisi yang tajam untuk proyek berikutnya', stat: 'LAPISAN', col: K.PAL.cyan, c: C.lapisan },
    { tag: 'NILAI KARAKTER', title: 'Karya Berkarakter Memiliki Sejarah Perjuangan', desc: 'Tembok yang tebal dengan lapisan warna memiliki resonansi visual yang kuat', stat: 'BERMUTU', col: K.PAL.yellow, c: C.tebal },
    { tag: 'PESAN JUARA', title: 'Timpa Kegagalanmu dengan Karya Baru Hari Ini', desc: 'Angkat kaleng catmu kembali dan ciptakan mahakaryamu yang sebenarnya!', stat: 'BANGKIT!', col: K.PAL.cyan, c: C.moral },
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
