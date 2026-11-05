// 72 · STICKMAN CINEMATIC — Demo 3: Surat dari Dirimu Satu Tahun Lagi (Future Self Continuity)
import * as K from '/styles/stickman-cinematic/kit.js';
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
  else if (t >= C.hadiah.start) phase = 2;
  else if (t >= C.lempar.start) phase = 1;

  const scenes = [
    'SCENE 01 • JEMBATAN WAKTU MENUJU MASA DEPAN',
    'SCENE 02 • JEBAKAN MELEMPAR BEBAN KE HARI ESOK',
    'SCENE 03 • KIRIM HADIAH UNTUK DIRIMU BESOK PAGI',
    'SCENE 04 • TERIMA KASIH DARI SATU TAHUN MENDATANG',
  ];

  K.cinematicBg(ctx, t, { floorY, sceneCode: scenes[phase], col: phase >= 2 ? K.PAL.sunsetGold : K.PAL.sunsetOrange });

  const headers = [
    ['1 TAHUN', 'SURAT DARI DIRIMU DI MASA DEPAN', 'Apa yang Akan Ia Katakan tentang Pilihanmu Malam Ini?'],
    ['ASING?', 'BIAS DIRI MASA DEPAN (HAL HERSHFIELD)', 'Mengapa Kita Sering Menjebak Diri Sendiri di Hari Esok?'],
    ['HADIAH', 'BERIKAN KEBAIKAN PADA DIRIMU BESOK', 'Disiplin Hari Ini Adalah Kasih Sayang untuk Dirimu Nanti'],
    ['BANGGA!', 'WAKTU TETAP BERJALAN, PILIH LANGKAHMU', 'Buat Dirimu Satu Tahun Lagi Tersenyum Berterima Kasih'],
  ][phase];

  K.cinematicHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.sunsetGold : K.PAL.sunsetOrange,
  });

  K.cinematicProps(ctx, floorY, 'horizon', { phase, t });

  const charX = phase <= 1 ? 370 : 430;
  const pose = phase === 0 ? 'lookUp' : phase === 1 ? 'focus' : phase === 2 ? 'walk' : 'triumph';
  K.cinematicStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Setahun lagi aku bakal berada di posisi mana ya?',
    'Jangan lempar beban ke diriku yang besok pagi!',
    'Aku cicil malam ini sebagai hadiah buat diriku besok!',
    'Terima kasih sudah bertahan dan tidak menyerah!',
  ];
  K.cinematicBubble(ctx, charX, 360, bubbles[phase], {
    tailX: charX, tailY: 435, col: phase >= 2 ? K.PAL.sunsetGold : K.PAL.sunsetOrange,
  });

  if (phase === 0) {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'RISET PSIKOLOGI UCLA (PROF. HAL HERSHFIELD)',
      titleStr: 'Otak Memandang "Diri Masa Depan" Seperti Orang Asing',
      subStr: 'Pemindaian fMRI menunjukkan area otak yang aktif sama seperti saat memikirkan orang lain',
      stat: 'fMRI SCAN',
      statSub: 'BIAS WAKTU',
      col: K.PAL.sunsetOrange,
      a: pop(t, C.hook.start + 0.2),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'KONEKSI DENGAN MASA DEPAN',
      titleStr: 'Makin Dekat Kita Mengenal Diri Esok, Makin Bijak Pilihan Kita',
      subStr: 'Bayangkan wajah dan kehidupanmu 365 hari dari sekarang secara nyata',
      stat: '+365 HARI',
      statSub: 'VISI JELAS',
      col: K.PAL.rimCyan,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'ILUSI "BIAR AKU YANG BESOK SAJA"',
      titleStr: 'Menunda Sama Dengan Mencuri Waktu Istirahatmu Besok',
      subStr: 'Kesenangan menunda malam ini dibayar lunas dengan kepanikan besok pagi',
      stat: 'UTANG WAKTU',
      statSub: 'BUNGA CEMAS',
      col: K.PAL.sunsetOrange,
      a: pop(t, C.lempar.start),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'EMPATI PADA DIRI SENDIRI',
      titleStr: 'Orang yang Menanggung Beban Besok Tetaplah Dirimu',
      subStr: 'Jangan tega meninggalkan tumpukan masalah untuk dirimu di pagi hari',
      stat: 'EMPATI',
      statSub: 'JAGA DIRIMU',
      col: K.PAL.sunsetGold,
      a: pop(t, C.lempar.start + 0.5),
    });
  } else if (phase === 2) {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'PRINSIP FAVORS FOR YOUR FUTURE SELF',
      titleStr: 'Jadikan Setiap Kebiasaan Baik Sebagai Kiriman Hadiah',
      subStr: 'Menyiapkan materi, berolahraga, dan menabung adalah surat cinta untuk masa depan',
      stat: 'HADIAH',
      statSub: 'UNTUK ESOK',
      col: K.PAL.sunsetGold,
      a: pop(t, C.hadiah.start),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'TIMBANGAN DUA RASA SAKIT (JIM ROHNS)',
      titleStr: 'Berat Disiplin Hanya Beberapa Ons, Berat Penyesalan Berton-ton',
      subStr: 'Pilihlah lelah yang melahirkan kebanggaan, bukan nyaman yang melahirkan sesal',
      stat: 'DISIPLIN',
      statSub: 'BEBAS SESAL',
      col: K.PAL.rimCyan,
      a: pop(t, C.hadiah.start + 0.5),
    });
  } else {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'KEPASTIAN WAKTU SATU TAHUN KE DEPAN',
      titleStr: 'Satu Tahun Akan Tetap Berlalu, Apa Pun Keputusanmu',
      subStr: 'Mulai hari ini agar satu tahun lagi kamu sudah memetik hasilnya',
      stat: 'MULAI KINI',
      statSub: 'JANGAN TUNDA',
      col: K.PAL.sunsetGold,
      a: pop(t, C.waktu.start),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'MONOLOG AKHIR MALAM INI',
      titleStr: '"Terima Kasih Sudah Memulai dan Tidak Menyerah Malam Itu"',
      subStr: 'Kalimat terindah yang akan diucapkan oleh dirimu di masa depan',
      stat: 'BANGGA!',
      statSub: 'MASA DEPANMU',
      col: K.PAL.rimCyan,
      a: pop(t, C.waktu.start + 0.5),
    });
  }
}

