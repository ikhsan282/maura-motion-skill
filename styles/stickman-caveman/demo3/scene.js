// 71 · STICKMAN CAVEMAN — Demo 3: Jebakan Buah Beri Digital (Dopamin Murah vs Buruan Besar)
import * as K from '/styles/stickman-caveman/kit.js';
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
  if (t >= C.jarak.start) phase = 3;
  else if (t >= C.pagi.start) phase = 2;
  else if (t >= C.algoritma.start) phase = 1;

  const tags = [
    'GUA 01 • NALURI PEMBURU BUAH BERI & NOVELTY',
    'GUA 02 • BANJIR DOPAMIN MURAH BIKIN FOKUS TUMPUL',
    'GUA 03 • ATURAN BERBURU DULU BARU BERPESTA',
    'GUA 04 • JAUHKAN UMPAN DIGITAL SAAT BERKARYA',
  ];

  K.cavemanBg(ctx, t, { floorY, stageTag: tags[phase], col: phase >= 2 ? K.PAL.teal : K.PAL.amber });

  const headers = [
    ['MANIS!', 'NALURI PEMBURU BUAH BERI DIGITAL', 'Mengapa Otak Purba Sangat Menyukai Kejutan Instan?'],
    ['KEBAL!', 'RESEPTOR DOPAMIN YANG KELELAHAN', 'Terlalu Banyak Hiburan Instan Membuat Kerja Terasa Hambar'],
    ['BURU!', 'BERBURU DULU, PESTA BELAKANGAN', 'Lindungi 60 Menit Pertama Pagimu dari Dopamin Murah'],
    ['FOKUS!', 'UTAMAKAN TARGET BESAR MASA DEPANMU', 'Pasang Jarak Fisik dari Ponsel Saat Sedang Berkarya'],
  ][phase];

  K.cavemanHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.teal : K.PAL.amber,
  });

  K.cavemanProps(ctx, floorY, 'berry', { phase, t });

  const charX = 420;
  const pose = phase === 0 ? 'hunt' : phase === 1 ? 'panic' : phase === 2 ? 'push' : 'victory';
  K.cavemanStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Wah ada buah beri notifikasi baru, comot terus!',
    'Kok lama-lama kepala pusing dan malas belajar ya?!',
    'Tahan dulu! Pagi hari waktunya berburu target utama!',
    'Tugas besar beres, rasanya jauh lebih puas!',
  ];
  K.cavemanBubble(ctx, charX, 360, bubbles[phase], {
    tailX: charX, tailY: 445, col: phase >= 2 ? K.PAL.teal : K.PAL.amber,
  });

  if (phase === 0) {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'NOVELTY SEEKING BIAS (PENCARI HAL BARU)',
      titleStr: 'Otak Purba Dirancang Mencari Makanan & Info Baru',
      subStr: 'Setiap kali menggeser layar, kita memicu sirkuit "mencari semak buah beri berikutnya"',
      stat: 'DOPAMIN',
      statSub: 'SIRKUIT PEMBURU',
      col: K.PAL.amber,
      a: pop(t, C.hook.start + 0.2),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'VARIABLE REWARD SCHEDULE',
      titleStr: 'Hadiah Acak di Layar Membuat Jari Sulit Berhenti',
      subStr: 'Rasa penasaran "apa video berikutnya?" mengunci perhatian otak manusia gua',
      stat: 'ACAK',
      statSub: 'UMPAN ALGORITMA',
      col: K.PAL.ochre,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'NUMBING OF DOPAMINE RECEPTORS',
      titleStr: 'Lonjakan Dopamin Instan Menurunkan Ambang Motivasi',
      subStr: 'Setelah terbiasa dengan stimulasi cepat, membaca buku terasa terlalu lambat',
      stat: 'TUMPUL',
      statSub: 'HILANG MINAT',
      col: K.PAL.fire,
      a: pop(t, C.algoritma.start),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'KALORI KOSONG BAGI PIKIRAN',
      titleStr: 'Kenyang Informasi Receh Namun Lapar Pencapaian Nyata',
      subStr: 'Melelahkan saraf perhatian sebelum pekerjaan utama sempat dimulai',
      stat: 'LELAH',
      statSub: 'KABUT OTAK',
      col: K.PAL.amber,
      a: pop(t, C.algoritma.start + 0.5),
    });
  } else if (phase === 2) {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'PRINSIP EFFORT-FIRST DOPAMINE',
      titleStr: 'Usaha Dulu Baru Hadiah = Dopamin Stabil & Sehat',
      subStr: 'Hindari membuka media sosial di 60 menit pertama setelah bangun tidur',
      stat: '60 MNT PAGI',
      statSub: 'ZONA BERSIH',
      col: K.PAL.teal,
      a: pop(t, C.pagi.start),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'RESET SENSITIVITAS FOKUS',
      titleStr: 'Saat Stimulasi Murah Dibatasi, Kerja Kembali Menarik',
      subStr: 'Otak yang segar di pagi hari mampu menaklukkan tugas tersulit dengan cepat',
      stat: 'TAJAM!',
      statSub: 'FOKUS ALAMI',
      col: K.PAL.ochre,
      a: pop(t, C.pagi.start + 0.5),
    });
  } else {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'FRICTION DESIGN (DESAIN HAMBATAN)',
      titleStr: 'Jauhkan Ponsel dari Jangkauan Tangan Saat Bekerja',
      subStr: 'Jarak fisik 3 meter sudah cukup untuk menghentikan kebiasaan tangan meraih layar',
      stat: 'JAUHKAN',
      statSub: 'BEBAS GODAAN',
      col: K.PAL.teal,
      a: pop(t, C.jarak.start),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN SI UGA MANUSIA GUA',
      titleStr: 'Tuntaskan Buruan Besarmu Sebelum Menikmati Buah Beri!',
      subStr: 'Istirahat terasa sepuluh kali lebih nikmat setelah karya utamamu selesai',
      stat: 'PUAS 100%',
      statSub: 'BURUAN BESAR',
      col: K.PAL.amber,
      a: pop(t, C.jarak.start + 0.5),
    });
  }
}

