// 71 · STICKMAN CAVEMAN — Demo 1: Otak Purba & Batu Tugas (Hukum Penghematan Energi)
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
  if (t >= C.aman.start) phase = 3;
  else if (t >= C.pecah.start) phase = 2;
  else if (t >= C.batu.start) phase = 1;

  const tags = [
    'GUA 01 • PERANGKAT KERAS 200.000 TAHUN',
    'GUA 02 • KETAKUTAN PADA "BATU TUGAS" BESAR',
    'GUA 03 • PECAH BATU MENJADI KERIKIL 5 MENIT',
    'GUA 04 • LOLOS DARI SENSOR PENGHEMAT ENERGI',
  ];

  K.cavemanBg(ctx, t, { floorY, stageTag: tags[phase], col: phase >= 2 ? K.PAL.teal : K.PAL.ochre });

  const headers = [
    ['200K THN', 'OTAK MANUSIA GUA DI KEPALAMU', 'Mengapa Rebahan Adalah Naluri Bertahan Hidup Purba?'],
    ['BERAT?!', 'ILUSI BONGKAHAN BATU TUGAS', 'Otak Menolak Tugas yang Terlihat Menguras Kalori Berlebih'],
    ['PECAH!', 'TRIK KERIKIL LIMA MENIT', 'Ubah Beban Raksasa Menjadi Langkah Mikro Tanpa Ancaman'],
    ['TUNTAS!', 'JINAKKAN OTAK PURBAMU', 'Mulai dari Kerikil Kecil hingga Momentum Menggelinding!'],
  ][phase];

  K.cavemanHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.teal : K.PAL.ochre,
  });

  K.cavemanProps(ctx, floorY, 'boulder', { phase, t });

  const charX = phase <= 1 ? 430 : 490;
  const pose = phase === 0 ? 'think' : phase === 1 ? 'panic' : phase === 2 ? 'push' : 'victory';
  K.cavemanStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Uga hemat tenaga biar selamat di gua!',
    'Waduh! Batu tugasnya gede banget, kabur!',
    'Ketok dulu jadi kerikil 5 menit aja!',
    'Ternyata enteng kalau dicicil sedikit-sedikit!',
  ];
  K.cavemanBubble(ctx, charX, 360, bubbles[phase], {
    tailX: charX, tailY: 445, col: phase >= 2 ? K.PAL.teal : K.PAL.ochre,
  });

  if (phase === 0) {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'BIOLOGI PENGHEMATAN ENERGI (LAW OF LEAST EFFORT)',
      titleStr: 'Di Zaman Purba, Boros Energi Berarti Risiko Kelaparan',
      subStr: 'Otak kita mengonsumsi 20% energi tubuh sehingga enggan berpikir berat tanpa alasan jelas',
      stat: '20% ENERGI',
      statSub: 'BEBAN OTAK',
      col: K.PAL.ochre,
      a: pop(t, C.hook.start + 0.2),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'MISMATCH EVOLUSI MODERN',
      titleStr: 'Naluri Hemat Kalori Masih Aktif di Depan Laptop',
      subStr: 'Rasa malas bukanlah cacat karakter, melainkan sistem penghemat baterai kuno',
      stat: 'HEMAT',
      statSub: 'NALURI PURBA',
      col: K.PAL.amber,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'PERSEPSI BEBAN KERJA RAKSASA',
      titleStr: 'Target Terlalu Besar Terbaca Sebagai Ancaman Kelelahan',
      subStr: 'Saat tugas ditulis "Selesaikan Skripsi/Laporan", otak langsung mengaktifkan rem darurat',
      stat: 'ANCAMAN',
      statSub: 'BATU RAKSASA',
      col: K.PAL.fire,
      a: pop(t, C.batu.start),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'PELARIAN KE AKTIVITAS RENDAH USAHA',
      titleStr: 'Otak Memilih Scroll Layar Karena Nol Usaha Kognitif',
      subStr: 'Menghindari batu besar memang melegakan sesaat, tetapi membuat batu makin menumpuk',
      stat: 'KABUR',
      statSub: 'HINDARI BEBAN',
      col: K.PAL.ochre,
      a: pop(t, C.batu.start + 0.5),
    });
  } else if (phase === 2) {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'STRATEGI MICRO-STEPPING (KERIKIL 5 MENIT)',
      titleStr: 'Pecah Batu Tugas Menjadi Unit Kerja Super Kecil',
      subStr: 'Buka file dan tulis 2 kalimat pertama — beban sekecil ini tidak memicu alarm gua',
      stat: '5 MENIT',
      statSub: 'UKURAN KERIKIL',
      col: K.PAL.teal,
      a: pop(t, C.pecah.start),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'BYPASS SENSOR PERTAHANAN AMIGDALA',
      titleStr: 'Langkah Kecil Menyelinap Masuk Tanpa Perlawanan',
      subStr: 'Otak purba merasa aman karena energi yang diminta sangat ringan dan terukur',
      stat: 'LOLOS!',
      statSub: 'TANPA REM',
      col: K.PAL.amber,
      a: pop(t, C.pecah.start + 0.5),
    });
  } else {
    K.cavemanCard(ctx, 540, 995, 960, 175, {
      tag: 'EFEK MOMENTUM (ZEIGARNIK EFFECT)',
      titleStr: 'Begitu Kerikil Pertama Bergerak, Otak Ingin Melanjutkan',
      subStr: 'Bagian tersulit dari setiap pekerjaan hanyalah gesekan di lima menit pertama',
      stat: 'LANJUT!',
      statSub: 'MOMENTUM HIDUP',
      col: K.PAL.teal,
      a: pop(t, C.aman.start),
    });
    K.cavemanCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN SI UGA MANUSIA GUA',
      titleStr: 'Jangan Lawan Otak Purbamu, Ajak Ia Mencicil Kerikil!',
      subStr: 'Satu demi satu kerikil kecil yang diselesaikan akan meruntuhkan gunung tugas terbesar',
      stat: 'MENANG!',
      statSub: 'TUNTAS RINGAN',
      col: K.PAL.ochre,
      a: pop(t, C.aman.start + 0.5),
    });
  }
}
