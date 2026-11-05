// 74 · STICKMAN GRAFFITI — Demo 3: Temukan Ciri Khasmu Sendiri (Full-Screen 1080x1920 8-Beat Standard)
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
  else if (t >= C.waktu?.start) beat = 6;
  else if (t >= C.konsisten?.start) beat = 5;
  else if (t >= C.unik?.start) beat = 4;
  else if (t >= C.campur?.start) beat = 3;
  else if (t >= C.aturan?.start) beat = 2;
  else if (t >= C.tiru?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  const tags = [
    'TEMBOK 01 • CIRI KHAS DALAM SATU DETIK',
    'TEMBOK 02 • JEBAKAN MENJADI FOTOKOPI TREN',
    'TEMBOK 03 • ASLI NO 1 > TIRUAN NO 2',
    'TEMBOK 04 • RUMUS 3 MINAT: FORMULA CIRI KHAS',
    'TEMBOK 05 • KEKURANGAN JADI CAP JEMPOL UNIK',
    'TEMBOK 06 • REPETISI KONSISTEN MEMBANGUN BRAND',
    'TEMBOK 07 • TREN BERLALU, OTENTISITAS ABADI',
    'TEMBOK 08 • BUBUSHKAN TANDA TANGAN ASLIMU!',
  ];

  const col = beat >= 4 ? K.PAL.cyan : (beat === 2 || beat === 3 ? K.PAL.yellow : K.PAL.pink);

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.graffitiBg(ctx, t, { floorY, wallTag: tags[beat], col });

    const murals = [
      ['1 DETIK IKONIK', 'LANGSUNG KENAL', 'Ciri khas menonjol di keramaian kota', K.PAL.pink, K.PAL.cyan],
      ['FOTOKOPI TREN', 'HILANG JATI DIRI', 'Meniru orang lain membuatmu tenggelam', K.PAL.pink, K.PAL.yellow],
      ['ASLI NO 1', 'BUKAN TIRUAN', 'Karakter orisinal jauh lebih bernilai', K.PAL.yellow, K.PAL.pink],
      ['KOMBINASI 3 MINAT', 'SIGNATURE STYLE', 'Perpaduan hal yang kamu cintai', K.PAL.yellow, K.PAL.cyan],
      ['CAP JEMPOL', 'KEKURANGAN JADI CIRI', 'Gaya goresan yang tak bisa ditiru', K.PAL.cyan, K.PAL.pink],
      ['REPETISI KARYA', 'KONSISTENSI VISUAL', 'Audiens hafal ciri khas warnamu', K.PAL.cyan, K.PAL.yellow],
      ['OTENTISITAS', 'TAHAN LINTAS WAKTU', 'Karya jujur bertahan selamanya', K.PAL.cyan, K.PAL.pink],
      ['MAHAKARYA!', 'WARNA ASLIMU', 'Banggalah pada keunikan dirimu!', K.PAL.cyan, K.PAL.yellow],
    ][beat];
    K.graffitiWallArt(ctx, floorY, murals[0], murals[1], murals[2], { col: murals[3], accent: murals[4] });

    const charX = beat <= 2 ? 330 : 360;
    const pose = beat === 0 ? 'hesitate' : beat === 1 ? 'hesitate' : beat <= 4 ? 'spray' : 'victory';
    K.graffitiStickman(ctx, charX, floorY, pose, { facing: 1, t, sprayCol: col });

    const bubbles = [
      'Kok ada mural yang langsung kita kenal cuma dalam sedetik?',
      'Banyak kreator cuma fotokopi tren sampai hilang identitas!',
      'Lebih baik jadi versi asli No 1 daripada tiruan No 2!',
      'Gabungin 3 hal yang paling kamu suka jadi gaya barumu!',
      'Keterbatasan tanganmu justru bisa jadi cap jempol unik!',
      'Ulangi warna dan gaya ini sampai orang hafal namamu!',
      'Tren musiman cepat basi, karya otentik bertahan abadi!',
      'Berani tampil beda, warnai dunia pakai ciri khasmu!',
    ];
    K.graffitiBubble(ctx, charX + 50, floorY - 390, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 310, col,
    });
  });

  const headers = [
    ['1 DETIK', 'KEKUATAN CIRI KHAS VISUAL', 'Mengapa Ada Karya yang Langsung Dikenali Tanpa Membaca Nama?'],
    ['FOTOKOPI', 'JEBAKAN MENGEJAR TREN VIRAL', 'Mengikuti Gaya Orang Lain Membuat Karyamu Hilang Identitas'],
    ['ORISINAL', 'ASLI NO 1 > TIRUAN NO 2', 'Keaslian Karakter Jauh Lebih Berharga dari Sekadar Tiruan'],
    ['3 MINAT', 'FORMULA SIGNATURE STYLE', 'Padukan Tiga Pengaruh yang Paling Kamu Cintai Menjadi Satu'],
    ['CAP JEMPOL', 'KEUNIKAN DARI KEKURANGAN', 'Karakteristik Tangan yang Tak Sempurna Menjadi Ciri Khas'],
    ['KONSISTEN', 'REPETISI MEMBANGUN INGATAN', 'Gunakan Gaya yang Sama Berulang Kali Hingga Melekat di Pikiran'],
    ['ABADI', 'OTENTISITAS MELINTASI WAKTU', 'Tren Musiman Cepat Memudar, Karya yang Jujur Bertahan Abadi'],
    ['JATI DIRI', 'BUBUSH TANDA TANGAN ASLIMU', 'Banggalah pada Warna Unikmu & Buat Dunia Terpukau!'],
  ][beat];

  K.graffitiHeader(ctx, headers[0], headers[1], headers[2], { col });

  const callouts = [
    { tag: 'SIGNATURE RECOGNITION', title: 'Mural yang Ikonik Menembus Kebisingan Visual', desc: 'Identitas visual yang kuat membuat karya menonjol di tengah ribuan gambar', stat: '1 DETIK', col: K.PAL.pink, c: C.hook },
    { tag: 'COPYCAT SYNDROME', title: 'Terlalu Banyak Meniru Membunuh Percikan Kreatif', desc: 'Saat kamu hanya memfotokopi, audiens akan selalu mengingat kreator aslinya', stat: 'FOTOKOPI', col: K.PAL.pink, c: C.tiru },
    { tag: 'PRINSIP ORISINALITAS', title: 'Lebih Baik Jadi Versi Asli Nomor Satu', desc: 'Dunia tidak membutuhkan duplikat baru, dunia membutuhkan perspektif unikmu', stat: 'ASLI NO 1', col: K.PAL.yellow, c: C.aturan },
    { tag: 'KOMPOSISI GAYA', title: 'Padukan Tiga Minat Berbeda Menjadi Karakter Baru', desc: 'Austin Kleon: Padukan gaya dari pahlawan seni yang berbeda untuk ciptakan gayamu', stat: '3 ELEMEN', col: K.PAL.yellow, c: C.campur },
    { tag: 'IMPERFECTION AS ASSET', title: 'Ketidaksempurnaan Tangan Menjadi Cap Jempol', desc: 'Goresan tangan manusia yang tidak simetris memiliki jiwa yang tak bisa dibuat AI', stat: 'CAP JEMPOL', col: K.PAL.cyan, c: C.unik },
    { tag: 'THE POWER OF REPETITION', title: 'Konsistensi Palet Warna dan Elemen Visual', desc: 'Ulangi ciri khasmu di ratusan karya hingga audiens mengenali hanya dari warnamu', stat: 'KONSISTEN', col: K.PAL.cyan, c: C.konsisten },
    { tag: 'TIMELESS VALUE', title: 'Keaslian Memiliki Daya Tahan Melintasi Zaman', desc: 'Kreator legendaris selalu bertahan karena mereka setia pada jati dirinya', stat: 'ABADI', col: K.PAL.yellow, c: C.waktu },
    { tag: 'PESAN JUARA', title: 'Tunjukkan Keunikan Dirimu Tanpa Rasa Ragu', desc: 'Warnai kanvas kehidupanmu dengan gayamu sendiri dan banggalah!', stat: 'ORISINAL', col: K.PAL.cyan, c: C.moral },
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
