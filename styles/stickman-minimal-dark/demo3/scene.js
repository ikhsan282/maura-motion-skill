// 76 · STICKMAN MINIMAL DARK — Demo 3: Lingkaran Kendali Stoik (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-minimal-dark/kit.js';
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
  const floorY = 1240;

  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.fokus?.start) beat = 6;
  else if (t >= C.pemanah?.start) beat = 5;
  else if (t >= C.dalam?.start) beat = 4;
  else if (t >= C.bocor?.start) beat = 3;
  else if (t >= C.luar?.start) beat = 2;
  else if (t >= C.epictetus?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  const tags = [
    'MODE 01 • SUMBER KELELAHAN BATIN KITA',
    'MODE 02 • EPICTETUS: DIKOTOMI KENDALI',
    'MODE 03 • LINGKARAN LUAR DI LUAR KUASA',
    'MODE 04 • KEBOCORAN ENERGI DAN KETENANGAN',
    'MODE 05 • LINGKARAN DALAM: 100% DI TANGANMU',
    'MODE 06 • PERUMPAMAAN SANG PEMANAH BIJAK',
    'MODE 07 • KEKUATAN PENUH PADA LANGKAH NYATA',
    'MODE 08 • FOKUSKAN LENTERAMU HARI INI!',
  ];

  const col = beat >= 4 ? K.PAL.blue : (beat === 2 || beat === 3 ? K.PAL.amber : K.PAL.red);

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.minimalDarkBg(ctx, t, { floorY, modeTag: tags[beat], col });

    const diagrams = [
      ['LELAH BATIN', 'BEBAN PIKIRAN', 'Terlalu memikirkan hal di luar kendali', K.PAL.red],
      ['EPICTETUS', 'DIKOTOMI KENDALI', 'Pilah apa yang bisa dan tak bisa diatur', K.PAL.red],
      ['LINGKARAN LUAR', 'DI LUAR KUASA', 'Komentar orang, masa lalu, dan hasil', K.PAL.amber],
      ['ENERGI BOCOR', 'TEROMBANG-AMBING', 'Gantungkan damai pada hal tak pasti', K.PAL.red],
      ['LINGKARAN DALAM', '100% KUASAMU', 'Usaha terbaik, ucapan, dan responmu', K.PAL.blue],
      ['SANG PEMANAH', 'FOKUS BIDIKAN', 'Tarik busur, lepas anak panah ke angin', K.PAL.blue],
      ['KEKUATAN PULIH', '100% ENERGI', 'Kembalikan daya pada aksi nyata', K.PAL.blue],
      ['ZEN CLARITY', 'HATI LAPANG', 'Fokus yang ada, lepaskan sisanya', K.PAL.blue],
    ][beat];
    K.minimalDarkDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

    const charX = beat <= 3 ? 335 : 365;
    const state = beat <= 3 ? 'overthink' : 'clarity';
    K.minimalDarkStickman(ctx, charX, floorY, state, { facing: 1, t });

    const bubbles = [
      'Bukan kerjaannya yang bikin capek, tapi overthinking-nya!',
      'Epictetus merumuskan Dikotomi Kendali 2000 tahun lalu!',
      'Komentar orang & masa lalu itu ada di lingkaran luar!',
      'Kalau mikirin hal di luar kuasa, energi kita bocor terus!',
      'Tarik fokus ke lingkaran dalam: usahaku dan responku!',
      'Kayak pemanah: tugasku bidik busur, angin bukan urusanku!',
      'Berhenti cemasin hal luar, energiku pulih 100%!',
      'Fokus pada lenteramu hari ini, lepaskan sisanya dengan lapang!',
    ];
    K.minimalDarkBubble(ctx, charX + 25, floorY - 390, bubbles[beat], {
      tailX: charX + 5, tailY: floorY - 310, col,
    });
  });

  const headers = [
    ['LELAH?', 'SUMBER KELELAHAN BATIN SEJATI', 'Bukan Beratnya Tugas, Tapi Memikirkan Hal yang Tak Bisa Diatur'],
    ['EPICTETUS', 'FILSAFAT DIKOTOMI KENDALI', 'Rumus Ketenangan Kuno untuk Memisahkan Dua Dunia'],
    ['LINGKARAN LUAR', 'HAL-HAL DI LUAR KUASAMU', 'Komentar Orang Lain, Masa Lalu, Cuaca, dan Hasil Akhir'],
    ['BOCOR!', 'JEBAKAN MENGGANTUNGKAN DAMAI', 'Ketenangan Hancur Saat Berharap Mengontrol Hal Eksternal'],
    ['LINGKARAN DALAM', '100% BERADA DI TANGANMU', 'Usaha Terbaikmu, Tindakanmu, dan Caramu Merespons'],
    ['PEMANAH', 'PERUMPAMAAN STOIK KLASIK', 'Fokus Menarik Busur, Bukan Pada Arah Hembusan Angin'],
    ['PULIH', 'KEMBALIKAN KEKUATAN AKSI', 'Lepaskan Beban Eksternal untuk Menyempurnakan Karyamu'],
    ['LAPANG', 'KEDAMAIAN STOIK YANG KOKOH', 'Fokuskan Lenteramu Hari Ini & Ikhlaskan Segala Sisanya!'],
  ][beat];

  K.minimalDarkHeader(ctx, headers[0], headers[1], headers[2], { col });

  const callouts = [
    { tag: 'PARADOKS KONTROL', title: 'Sebagian Besar Energi Habis untuk Hal yang Sia-Sia', desc: 'Mencoba mengendalikan reaksi orang lain adalah sumber stres terbesar', stat: 'LELAH BATIN', col: K.PAL.red, c: C.hook },
    { tag: 'DICHOTOMY OF CONTROL', title: 'Prinsip Dasar Filsafat Stoikisme Epictetus', desc: 'Ada hal-hal yang berada di bawah kendali kita, dan hal-hal yang tidak', stat: 'EPICTETUS', col: K.PAL.red, c: C.epictetus },
    { tag: 'OUTER CIRCLE', title: 'Hasil Akhir dan Opini Publik Bukan Kuasamu', desc: 'Mencemaskan hal di luar lingkaran kendali hanya menguras baterai mental', stat: 'LUAR KUASA', col: K.PAL.amber, c: C.luar },
    { tag: 'ENERGY LEAKAGE', title: 'Ketenangan Terombang-Ambing Ekspektasi Eksternal', desc: 'Ketika standar damai diletakkan di luar diri, kamu menjadi budak situasi', stat: 'BOCOR', col: K.PAL.red, c: C.bocor },
    { tag: 'INNER CIRCLE', title: 'Kuasai Penuh Niat, Perilaku, dan Respon Pribadimu', desc: 'Di sinilah letak kedaulatan sejati yang tidak bisa dirampas siapa pun', stat: '100% DALAM', col: K.PAL.blue, c: C.dalam },
    { tag: 'STOIC ARCHER METAPHOR', title: 'Tugas Pemanah Adalah Melepaskan Panah Sempurna', desc: 'Begitu anak panah lepas, arah angin dan sasaran adalah ranah alam semesta', stat: 'PEMANAH', col: K.PAL.blue, c: C.pemanah },
    { tag: 'ENERGY RESTORATION', title: 'Fokus 100% pada Apa yang Bisa Dikerjakan Sekarang', desc: 'Membebaskan pikiran dari cemas hasil melipatgandakan kualitas eksekusi', stat: 'DAYA PULIH', col: K.PAL.blue, c: C.fokus },
    { tag: 'PESAN JUARA', title: 'Jalani Hari dengan Hati yang Lapang dan Tenang', desc: 'Kendalikan apa yang kamu bisa, ikhlaskan sisanya, dan nikmati prosesnya!', stat: 'ZEN STOIK', col: K.PAL.blue, c: C.moral },
  ][beat];

  K.minimalDarkCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
