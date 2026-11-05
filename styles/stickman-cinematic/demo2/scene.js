// 72 · STICKMAN CINEMATIC — Demo 2: Juara Ditempa Saat Lampu Panggung Mati (Disiplin di Saat Sepi)
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
  if (t >= C.fokus.start) phase = 3;
  else if (t >= C.disiplin.start) phase = 2;
  else if (t >= C.sunyi.start) phase = 1;

  const scenes = [
    'SCENE 01 • PANGGUNG GEMERLAP vs RUANG LATIHAN',
    'SCENE 02 • UJIAN KESUNYIAN TANPA TEPUK TANGAN',
    'SCENE 03 • DISIPLIN ADALAH BAHAN BAKAR UTAMA',
    'SCENE 04 • AKAR BAMBU YANG MENGUAT DI BALIK LAYAR',
  ];

  K.cinematicBg(ctx, t, { floorY, sceneCode: scenes[phase], col: phase >= 2 ? K.PAL.sunsetGold : K.PAL.rimCyan });

  const headers = [
    ['SOROT', 'JUARA DITEMPA SAAT LAMPU MATI', 'Mengapa Proses di Balik Layar Menentukan Puncak Prestasi?'],
    ['SEPI', 'SAAT TIDAK ADA YANG BERTEPUK TANGAN', 'Bertahan Berlatih Ketika Karya Belum Dilirik Siapa Pun'],
    ['DISIPLIN', 'MOTIVASI MEMULAI, DISIPLIN MENUNTASKAN', 'Jangan Bergantung pada Mood untuk Melakukan Hal Penting'],
    ['JUARA!', 'BIARKAN KARYAMU YANG BERBICARA', 'Akar yang Kuat di Saat Sepi Akan Menjulang Tinggi'],
  ][phase];

  K.cinematicHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.sunsetGold : K.PAL.rimCyan,
  });

  K.cinematicProps(ctx, floorY, 'spotlight', { phase, t });

  const charX = phase <= 1 ? 370 : 430;
  const pose = phase === 0 ? 'stand' : phase === 1 ? 'focus' : phase === 2 ? 'walk' : 'triumph';
  K.cinematicStickman(ctx, charX, floorY, pose, { facing: 1, t });

  const bubbles = [
    'Semua ingin piala, tapi siapa yang tahan latihan sepi?',
    'Belum ada yang lihat karyaku... tetap lanjut nggak ya?',
    'Mood boleh naik turun, tapi jadwal latihan tetap jalan!',
    'Saat waktunya tiba, hasil tidak pernah mengkhianati proses!',
  ];
  K.cinematicBubble(ctx, charX, 360, bubbles[phase], {
    tailX: charX, tailY: 435, col: phase >= 2 ? K.PAL.sunsetGold : K.PAL.rimCyan,
  });

  if (phase === 0) {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'ILUSI GUNUNG ES KESUKSESAN (ICEBERG ILLUSION)',
      titleStr: 'Publik Hanya Melihat 10% Puncak, Bukan 90% Latihan',
      subStr: 'Ribuan jam pengulangan di ruang sepi tidak pernah masuk ke sorotan kamera',
      stat: '90% PROSES',
      statSub: 'DI BALIK LAYAR',
      col: K.PAL.rimCyan,
      a: pop(t, C.hook.start + 0.2),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'JEBAKAN HAUS PUJIAN CEPAT',
      titleStr: 'Berhenti Berkarya Hanya Karena Sepi Penonton Awal',
      subStr: 'Jika semangatmu bergantung pada tepuk tangan, kamu akan berhenti saat panggung sepi',
      stat: 'RAPUH',
      statSub: 'VALIDASI LUAR',
      col: K.PAL.sunsetOrange,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'FASE KESUNYIAN PARA PERINTIS',
      titleStr: 'Semua Maestro Pernah Melewati Masa Tidak Dikenal',
      subStr: 'Kebosanan dalam latihan rutin adalah saringan alami antara amatir dan profesional',
      stat: 'SARINGAN',
      statSub: 'MENTAL BAJA',
      col: K.PAL.sunsetOrange,
      a: pop(t, C.sunyi.start),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'KETAHANAN MENGHADAPI RASA LELAH',
      titleStr: 'Istirahat Saat Lelah, Namun Jangan Pernah Berhenti',
      subStr: 'Kurangi kecepatannya bila perlu, asalkan kakimu tidak berbalik arah',
      stat: 'BERTAHAN',
      statSub: 'TETAP JALAN',
      col: K.PAL.rimCyan,
      a: pop(t, C.sunyi.start + 0.5),
    });
  } else if (phase === 2) {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'PERCIKAN API vs BAHAN BAKAR',
      titleStr: 'Motivasi Itu Emosi Sesaat, Disiplin Itu Komitmen',
      subStr: 'Profesional tetap hadir di meja kerja meski cuaca hati sedang mendung',
      stat: 'KOMITMEN',
      statSub: 'DI ATAS MOOD',
      col: K.PAL.sunsetGold,
      a: pop(t, C.disiplin.start),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'FILOSOFI AKAR POHON BAMBU',
      titleStr: 'Menumbuhkan Fondasi Kuat di Bawah Tanah Terlebih Dahulu',
      subStr: 'Saat akar keahlianmu sudah dalam, pertumbuhanmu tidak akan mudah tumbang',
      stat: 'FONDASI',
      statSub: 'AKAR KUAT',
      col: K.PAL.rimCyan,
      a: pop(t, C.disiplin.start + 0.5),
    });
  } else {
    K.cinematicCard(ctx, 540, 995, 960, 175, {
      tag: 'MOTIVASI INTRINSIK (KEBANGGAAN PRIBADI)',
      titleStr: 'Berkaryalah dengan Standar Terbaik Meski Tanpa Saksi',
      subStr: 'Kualitas yang ditempa dalam kesunyian akan bersinar terang saat waktunya tiba',
      stat: 'STANDAR',
      statSub: 'KUALITAS TINGGI',
      col: K.PAL.sunsetGold,
      a: pop(t, C.fokus.start),
    });
    K.cinematicCard(ctx, 540, 1210, 960, 175, {
      tag: 'MONOLOG AKHIR MALAM INI',
      titleStr: 'Cintai Ruang Latihanmu Sebagaimana Kamu Mencintai Impianmu',
      subStr: 'Panggung hanya memamerkan piala, tetapi kesunyianlah yang melahirkan sang juara',
      stat: 'JUARA!',
      statSub: 'MENTAL SEJATI',
      col: K.PAL.rimCyan,
      a: pop(t, C.fokus.start + 0.5),
    });
  }
}
