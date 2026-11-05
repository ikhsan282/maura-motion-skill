// 76 · STICKMAN MINIMAL DARK — Demo 3: Lingkaran Kendali Stoik (Dikotomi Kendali Epictetus)
import * as K from '/styles/stickman-minimal-dark/kit.js';
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
  else if (t >= C.dalam.start) phase = 2;
  else if (t >= C.luar.start) phase = 1;

  const tags = [
    'MODE 01 • SUMBER KELELAHAN BATIN MANUSIA',
    'MODE 02 • LINGKARAN LUAR (DI LUAR KENDALI)',
    'MODE 03 • LINGKARAN DALAM (100% KENDALIMU)',
    'MODE 04 • METAFORA SANG PEMANAH BIJAK',
  ];

  const col = phase >= 2 ? K.PAL.blue : K.PAL.red;
  K.minimalDarkBg(ctx, t, { floorY, modeTag: tags[phase], col });

  const headers = [
    ['KENDALI', 'DIKOTOMI KENDALI (EPICTETUS)', 'Mengapa Memikirkan Hal di Luar Kuasa Kita Menguras Energi?'],
    ['LEPASKAN', 'LINGKARAN KEKHAWATIRAN LUAR', 'Opini Orang, Masa Lalu, & Hasil Akhir Bukanlah Kuasamu'],
    ['FOKUS 100%', 'TARIK ENERGI KE LINGKARAN DALAM', 'Usaha, Sikap, dan Tindakan Hari Ini Sepenuhnya Milikmu'],
    ['TENANG!', 'ANALOGI PEMANAH & ANAK PANAH', 'Maksimalkan Bidikanmu, Lalu Lepaskan Hasilnya dengan Lapang!'],
  ][phase];

  K.minimalDarkHeader(ctx, headers[0], headers[1], headers[2], { col });

  const diagrams = [
    ['ENERGI BOCOR', 'SALAH FOKUS', 'Mencemaskan hal yang tak bisa diubah', K.PAL.red],
    ['LUAR KENDALI', 'OPINI & MASA LALU', 'Bikin cemas & tidak produktif', K.PAL.red],
    ['DALAM KENDALI', 'USAHA & SIKAPMU', '100% bisa kamu ubah sekarang', K.PAL.blue],
    ['SANG PEMANAH', 'BIDIK TERBAIK!', 'Fokus proses, ikhlaskan hasil', K.PAL.blue],
  ][phase];
  K.minimalDarkDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

  const charX = 335;
  const state = phase <= 1 ? 'overthink' : 'clarity';
  K.minimalDarkStickman(ctx, charX, floorY, state, { facing: 1, t });

  const bubbles = [
    'Capek banget mikirin gimana pendapat orang nanti...',
    'Masa lalu dan omongan orang kan di luar kendaliku!',
    'Aku tarik fokusku ke hal yang bisa kukerjakan hari ini!',
    'Usaha terbaik udah di tangan, hati jadi jauh lebih tenang!',
  ];
  K.minimalDarkBubble(ctx, charX + 20, 350, bubbles[phase], { tailX: charX, tailY: 425, col });

  if (phase === 0) {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'KEBOCORAN ENERGI MENTAL TERBESAR',
      titleStr: 'Berusaha Mengatur Hal yang Bukan Wilayah Kuasa Kita',
      subStr: 'Menciptakan kecemasan tak berujung karena hasilnya bergantung pada faktor luar',
      stat: 'BOCOR',
      statSub: 'ENERGI HABIS',
      col: K.PAL.red,
      a: pop(t, C.hook.start + 0.2),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'PRINSIP DASAR FILSAFAT STOIK (EPICTETUS)',
      titleStr: 'Pisahkan Tegas Antara Milik Kita dan Bukan Milik Kita',
      subStr: 'Ketenangan lahir saat kita berhenti menuntut dunia berjalan persis sesuai keinginan',
      stat: '2 WILAYAH',
      statSub: 'PISAHKAN TEGAS',
      col: K.PAL.white,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'ISI LINGKARAN LUAR (CIRCLE OF CONCERN)',
      titleStr: 'Komentar Orang, Masa Lalu, dan Keputusan Pihak Lain',
      subStr: 'Seribu jam mencemaskannya tidak akan mengubah masa lalu barang satu detik pun',
      stat: '0% KUASA',
      statSub: 'LINGKAR LUAR',
      col: K.PAL.red,
      a: pop(t, C.luar.start),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'KERAPUHAN KEBAHAGIAAN EKSTERNAL',
      titleStr: 'Jangan Titipkan Kunci Ketenanganmu di Kantong Orang Lain',
      subStr: 'Validasi luar bersifat fluktuatif dan tidak pernah bisa dikontrol sepenuhnya',
      stat: 'RAPUH',
      statSub: 'GANTUNGKAN LUAR',
      col: K.PAL.red,
      a: pop(t, C.luar.start + 0.5),
    });
  } else if (phase === 2) {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'ISI LINGKARAN DALAM (CIRCLE OF CONTROL)',
      titleStr: 'Persiapanmu, Jam Belajar, Etika Kerja, dan Responsmu',
      subStr: 'Setiap tetes energi yang ditanam di lingkaran dalam menghasilkan kemajuan nyata',
      stat: '100% KUASA',
      statSub: 'LINGKAR DALAM',
      col: K.PAL.blue,
      a: pop(t, C.dalam.start),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'STOIC ARCHER METAPHOR (CICERO & EPICTETUS)',
      titleStr: 'Tugas Pemanah Hanya Sampai Anak Panah Lepas dari Busur',
      subStr: 'Kemuliaan seorang pejuang diukur dari kesungguhan ikhtiarnya, bukan kebetulan luar',
      stat: 'IKHTIAR',
      statSub: 'STANDAR UTAMA',
      col: K.PAL.white,
      a: pop(t, C.dalam.start + 0.5),
    });
  } else {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'KEMBALINYA KEKUATAN FOKUS PENUH',
      titleStr: 'Saat Kecemasan Luar Dilepas, Produktivitas Melonjak',
      subStr: 'Pikiran yang jernih mampu menyelesaikan pekerjaan berat tanpa rasa tertekan',
      stat: ' UTUH 100%',
      statSub: 'ENERGI PULIH',
      col: K.PAL.blue,
      a: pop(t, C.fokus.start),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'CATATAN HENING MALAM INI',
      titleStr: 'Kerjakan Bagianmu Sebaik Mungkin & Tidurlah dengan Tenang',
      subStr: 'Kedamaian sejati adalah melakukan yang terbaik lalu melepaskan sisanya',
      stat: 'DAMAI',
      statSub: 'HATI LAPANG',
      col: K.PAL.blue,
      a: pop(t, C.fokus.start + 0.5),
    });
  }
}

