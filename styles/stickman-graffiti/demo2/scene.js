// 74 · STICKMAN GRAFFITI — Demo 2: Jangan Hapus Gagalmu, Timpa dengan Karya (Seni Layering & Resiliensi)
import * as K from '/styles/stickman-graffiti/kit.js';
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
  if (t >= C.tebal.start) phase = 3;
  else if (t >= C.hidup.start) phase = 2;
  else if (t >= C.rahasia.start) phase = 1;

  const tags = [
    'TEMBOK 01 • TIDAK ADA TOMBOL CTRL+Z DI TEMBOK',
    'TEMBOK 02 • TEKNIK OVERPAINTING (TIMPA LAPISAN BARU)',
    'TEMBOK 03 • UBAH KESALAHAN JADI DIMENSI KARYA',
    'TEMBOK 04 • TIMPA GAGALMU DENGAN KARYA BARU!',
  ];

  const col = phase >= 2 ? K.PAL.cyan : K.PAL.pink;
  K.graffitiBg(ctx, t, { floorY, wallTag: tags[phase], col });

  const headers = [
    ['TANPA UNDO', 'SAAT CAT SEMPROTMU MELELEH KELUAR GARIS', 'Mengapa Kesalahan Pertama Sering Membuat Pemula Berhenti?'],
    ['LAYER 02', 'RAHASIA MURAL: TIMPA DENGAN WARNA BARU', 'Tidak Perlu Merobohkan Tembok Hanya Karena Satu Noda Kecil'],
    ['ITERASI', 'JADIKAN KEGAGALAN SEBAGAI LAPISAN DASAR', 'Setiap Kesalahan Memberi Tekstur dan Kedalaman Pengalaman'],
    ['MAHAKARYA', 'TIMPA GAGALMU DENGAN KARYA HARI INI!', 'Lapisan Baru yang Berani Mengubah Noda Menjadi Keindahan'],
  ][phase];

  K.graffitiHeader(ctx, headers[0], headers[1], headers[2], { col });

  const murals = [
    ['CAT MELELEH!', 'JANGAN KABUR', 'Satu noda bukan akhir segalanya', K.PAL.pink, K.PAL.yellow],
    ['OVERPAINTING', 'LAPISAN BARU', 'Tutup garis salah dengan warna tegas', K.PAL.cyan, K.PAL.pink],
    ['EFEK 3D DRIP', 'JADI KARAKTER!', 'Ubah noda menjadi bayangan estetik', K.PAL.cyan, K.PAL.yellow],
    ['MASTERPIECE!', '10x LEBIH KAYA', 'Tumpukan proses melahirkan karya kuat', K.PAL.pink, K.PAL.cyan],
  ][phase];
  K.graffitiWallArt(ctx, floorY, murals[0], murals[1], murals[2], { col: murals[3], accent: murals[4] });

  const charX = phase <= 1 ? 330 : 350;
  const pose = phase === 0 ? 'hesitate' : phase <= 2 ? 'spray' : 'victory';
  K.graffitiStickman(ctx, charX, floorY, pose, { facing: 1, t, sprayCol: col });

  const bubbles = [
    'Waduh catnya meleber! Nggak ada tombol Undo lagi!',
    'Tenang, tinggal kita timpa pakai warna sian yang tegas!',
    'Eh lelehan catnya malah bikin efek bayangan 3D keren!',
    'Jangan hapus gagalmu, timpa terus dengan karya baru!',
  ];
  K.graffitiBubble(ctx, charX + 20, 355, bubbles[phase], { tailX: charX, tailY: 430, col });

  if (phase === 0) {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'REALITA DUNIA NYATA TANPA TOMBOL UNDO',
      titleStr: 'Kita Tidak Bisa Memutar Waktu, Tapi Bisa Melukis Lagi',
      subStr: 'Berhenti berkarya karena satu kesalahan sama dengan membuang seluruh tembok',
      stat: 'NO UNDO',
      statSub: 'HADAPI NYATA',
      col: K.PAL.pink,
      a: pop(t, C.hook.start + 0.2),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'EFEK ALL-OR-NOTHING THINKING',
      titleStr: 'Menganggap Satu Cacat Kecil Merusak Seluruh Usaha',
      subStr: 'Pola pikir perfeksionis membuat banyak proyek ditinggalkan setengah jalan',
      stat: 'JANGAN BATAL',
      statSub: 'TERUSKAN PROSES',
      col: K.PAL.yellow,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'TEKNIK OVERPAINTING PARA MURALIS',
      titleStr: 'Cat yang Mengering Selalu Bisa Ditimpa Warna Baru',
      subStr: 'Lapisan bawah yang kasar justru membuat lapisan cat berikutnya menempel lebih kuat',
      stat: 'OVERPAINT',
      statSub: 'TIMPA TEGAS',
      col: K.PAL.cyan,
      a: pop(t, C.rahasia.start),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'HAPPY ACCIDENTS (SENI IMPROVISASI)',
      titleStr: 'Mengubah Lelehan Cat Menjadi Aksen Bayangan 3D',
      subStr: 'Kreativitas sejati diuji dari cara kita merangkul ketidaksengajaan menjadi keunikan',
      stat: 'ADAPTASI',
      statSub: 'SENI JALANAN',
      col: K.PAL.pink,
      a: pop(t, C.rahasia.start + 0.5),
    });
  } else if (phase === 2) {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'FILOSOFI PENTIMENTO DALAM SENI LUKIS',
      titleStr: 'Jejak Sketsa Lama Memberi Kedalaman pada Karya Akhir',
      subStr: 'Kegagalan masa lalu bukan aib, melainkan bukti bahwa kamu pernah berani mencoba',
      stat: 'LAPISAN',
      statSub: 'KAYA MAKNA',
      col: K.PAL.cyan,
      a: pop(t, C.hidup.start),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'RESILIENSI KREATOR & PROFESIONAL',
      titleStr: 'Jawab Kritik dan Kegagalan dengan Karya Berikutnya',
      subStr: 'Satu produk atau konten yang kurang berhasil langsung ditutupi oleh sepuluh karya baru',
      stat: '10x BARU',
      statSub: 'JAWAB LEWAT KARYA',
      col: K.PAL.yellow,
      a: pop(t, C.hidup.start + 0.5),
    });
  } else {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'AKUMULASI LAPISAN PENGALAMAN',
      titleStr: 'Tembok Terbaik Memiliki Puluhan Lapisan Belajar',
      subStr: 'Semakin tebal jam terbang dan perbaikanmu, semakin kokoh mentalitas karyamu',
      stat: 'MATANG!',
      statSub: 'JAM TERBANG',
      col: K.PAL.cyan,
      a: pop(t, C.tebal.start),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'MANIFESTO SI ZAKI STREET-ART',
      titleStr: 'Jangan Hapus Masa Lalumu, Timpa dengan Karya Terbaikmu!',
      subStr: 'Hari ini adalah lapisan warna baru yang siap membuat ceritamu bersinar',
      stat: 'TIMPA!',
      statSub: 'KARYA BARU',
      col: K.PAL.pink,
      a: pop(t, C.tebal.start + 0.5),
    });
  }
}

