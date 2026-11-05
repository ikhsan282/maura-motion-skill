// 74 · STICKMAN GRAFFITI — Demo 3: Temukan Ciri Khasmu Sendiri (Signature Style & Keaslian Kreator)
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
  if (t >= C.waktu.start) phase = 3;
  else if (t >= C.unik.start) phase = 2;
  else if (t >= C.aturan.start) phase = 1;

  const tags = [
    'TEMBOK 01 • DIKENALI DALAM 1 DETIK vs FOTOKOPI',
    'TEMBOK 02 • RUMUS KOMBINASI 3 MINAT UNIKMU',
    'TEMBOK 03 • UBAH KEUNIKAN JADI CAP JEMPOL KARYA',
    'TEMBOK 04 • TREN BERLALU, KEASLIAN BERTAHAN',
  ];

  const col = phase >= 2 ? K.PAL.cyan : K.PAL.pink;
  K.graffitiBg(ctx, t, { floorY, wallTag: tags[phase], col });

  const headers = [
    ['OTENTIK', 'TEMUKAN CIRI KHASMU SENDIRI', 'Mengapa Keaslian Jauh Lebih Kuat daripada Meniru Tren?'],
    ['ASLI #1', 'JANGAN JADI FOTOKOPI ORANG LAIN', 'Versi Asli Nomor Satu Mengalahkan Tiruan Nomor Dua'],
    ['SIGNATURE', 'GABUNGKAN 3 HAL YANG KAMU CINTAI', 'Perpaduan Minat dan Gaya Unikmu Melahirkan Identitas Baru'],
    ['IKONIK!', 'BUBUHKAN TANDA TANGAN KARYAMU', 'Tren Datang dan Pergi, Karakter Otentik Selalu Diingat!'],
  ][phase];

  K.graffitiHeader(ctx, headers[0], headers[1], headers[2], { col });

  const murals = [
    ['CLONE vs ICON', 'JANGAN MENIRU', 'Tiruan tenggelam di keramaian', K.PAL.pink, K.PAL.cyan],
    ['RUMUS 3 MINAT', 'A + B + C = UNIK', 'Kombinasi langka milikmu sendiri', K.PAL.cyan, K.PAL.yellow],
    ['SIGNATURE TAG', 'CAP JEMPOLMU', 'Dikenali bahkan tanpa baca nama', K.PAL.cyan, K.PAL.pink],
    ['TIMELESS ART', '100% OTENTIK!', 'Karya jujur menembus batas waktu', K.PAL.pink, K.PAL.yellow],
  ][phase];
  K.graffitiWallArt(ctx, floorY, murals[0], murals[1], murals[2], { col: murals[3], accent: murals[4] });

  const charX = phase <= 1 ? 330 : 350;
  const pose = phase === 0 ? 'hesitate' : phase <= 2 ? 'spray' : 'victory';
  K.graffitiStickman(ctx, charX, floorY, pose, { facing: 1, t, sprayCol: col });

  const bubbles = [
    'Kalau gayaku sama persis kayak orang lain, siapa yang ingat?',
    'Aku gabungin gaya komik, psikologi, dan warna neonku sendiri!',
    'Keunikan yang dulu bikin minder ternyata malah jadi ciri khas!',
    'Ini tanda tangan karyaku, 100% otentik tanpa tiru-tiru!',
  ];
  K.graffitiBubble(ctx, charX + 20, 355, bubbles[phase], { tailX: charX, tailY: 430, col });

  if (phase === 0) {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'JEBAKAN PENIRU TREN (THE COPYCAT TRAP)',
      titleStr: 'Mengikuti Semua Tren Membuat Karyamu Kehilangan Wajah',
      subStr: 'Saat semua orang memakai template yang sama, mata audiens menjadi jenuh',
      stat: 'TENGGELAM',
      statSub: 'EFEK FOTOKOPI',
      col: K.PAL.pink,
      a: pop(t, C.hook.start + 0.2),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'KEKUATAN VISUAL RECOGNITION',
      titleStr: 'Karya Ikonik Langsung Dikenali Dalam Hitungan Detik',
      subStr: 'Bukan karena paling rumit, melainkan karena memiliki karakter yang konsisten',
      stat: '1 DETIK',
      statSub: 'LANGSUNG KENAL',
      col: K.PAL.cyan,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'PRINSIP TALENT STACKING (SCOTT ADAMS)',
      titleStr: 'Gabungkan 3 Minat/Keahlian Berbeda Menjadi Satu Gaya',
      subStr: 'Irisan dari tiga bidang yang kamu sukai menciptakan ruang yang hampir tanpa pesaing',
      stat: '3 IRISAN',
      statSub: 'KOMBINASI UNIK',
      col: K.PAL.cyan,
      a: pop(t, C.aturan.start),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'KEASLIAN MENGALAHKAN KESEMPURNAAN',
      titleStr: 'Manusia Terhubung dengan Kejujuran, Bukan Kemasan Kaku',
      subStr: 'Cara bicaramu dan sudut pandang pribadimu adalah nilai jual yang tak tergantikan',
      stat: 'ASLI #1',
      statSub: 'BUKAN TIRUAN',
      col: K.PAL.yellow,
      a: pop(t, C.aturan.start + 0.5),
    });
  } else if (phase === 2) {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'MERANGKUL KEUNIKAN DIRI (QUIRK AS FEATURE)',
      titleStr: 'Apa yang Membuatmu Berbeda Adalah Senjata Terbesarmu',
      subStr: 'Banyak ciri khas legendaris lahir dari keterbatasan yang diolah secara kreatif',
      stat: 'CIRI KHAS',
      statSub: 'CAP JEMPOL',
      col: K.PAL.pink,
      a: pop(t, C.unik.start),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'KONSISTENSI IDENTITAS VISUAL & SUARA',
      titleStr: 'Ulangi Palet dan Gayamu Hingga Menjadi Memori Kolektif',
      subStr: 'Konsistensi membangun kepercayaan dan membuat karyamu mudah diingat',
      stat: 'IKONIK',
      statSub: 'IDENTITAS KUAT',
      col: K.PAL.cyan,
      a: pop(t, C.unik.start + 0.5),
    });
  } else {
    K.graffitiCard(ctx, 540, 995, 960, 175, {
      tag: 'KETAHANAN MELINTASI ZAMAN (LONGEVITY)',
      titleStr: 'Tren Algoritma Berganti Setiap Bulan, Karakter Abadi',
      subStr: 'Bangun reputasi di atas keaslian karyamu agar tidak goyah saat tren berubah',
      stat: 'BERTAHAN',
      statSub: 'LINTAS WAKTU',
      col: K.PAL.cyan,
      a: pop(t, C.waktu.start),
    });
    K.graffitiCard(ctx, 540, 1210, 960, 175, {
      tag: 'MANIFESTO SI ZAKI STREET-ART',
      titleStr: 'Berani Tampil Beda & Bubuhkan Signature Style-mu!',
      subStr: 'Dunia sedang menunggu warna yang hanya bisa dilukis oleh tanganmu',
      stat: '100% KAMU',
      statSub: 'SIGNATURE ART',
      col: K.PAL.yellow,
      a: pop(t, C.waktu.start + 0.5),
    });
  }
}

