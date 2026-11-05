// 72 · STICKMAN CINEMATIC — Demo 3: Surat dari Dirimu Satu Tahun Lagi (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-cinematic/kit.js';
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
  else if (t >= C.harga?.start) beat = 5;
  else if (t >= C.hadiah?.start) beat = 4;
  else if (t >= C.bayar?.start) beat = 3;
  else if (t >= C.lempar?.start) beat = 2;
  else if (t >= C.asing?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.15; fx = 500; fy = 920;
  } else if (beat >= 4) {
    zoom = 1.16; fx = 560; fy = 940;
  }

  const tags = [
    'SCENE 01 • PERCAKAPAN LINTAS WAKTU',
    'SCENE 02 • TEMPORAL DISCOUNTING: DIRI MASA DEPAN',
    'SCENE 03 • JEBAKAN MELEMPAR BEBAN KE HARI ESOK',
    'SCENE 04 • YANG MENANGGUNG PANIK TETAPLAH DIRIMU',
    'SCENE 05 • DISIPLIN SEBAGAI HADIAH HARI ESOK',
    'SCENE 06 • BIAYA DISIPLIN VS BIAYA PENYESALAN',
    'SCENE 07 • 365 HARI AKAN TIBA PASTI',
    'SCENE 08 • BUAT DIRIMU MASA DEPAN BANGGA!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.cinematicBg(ctx, t, { floorY, sceneCode: tags[beat], col: beat >= 4 ? K.PAL.rimCyan : K.PAL.sunsetOrange });
    K.cinematicProps(ctx, floorY, beat >= 4 ? 'desk' : 'rooftop', { phase: beat >= 4 ? 2 : 0, t });

    const charX = beat <= 2 ? 380 : 480;
    const pose = beat === 0 ? 'gaze' : beat <= 2 ? 'think' : beat <= 4 ? 'walk' : 'look-up';
    K.cinematicStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Gimana respon dirimu 1 tahun lagi liat pilihanmu malam ini?',
      'Otak menganggap diri masa depan seperti orang asing!',
      'Gampang banget bilang: Biar aku besok aja yang pusing!',
      'Padahal yang besok bangun panik tetap dirimu sendiri!',
      'Belajar 45 menit malam ini = kado buat dirimu besok!',
      'Lelah disiplin hitungan menit, sesal menyerah bertahun-tahun!',
      '1 tahun ke depan pasti datang, kamu mau jadi siapa?',
      'Bikin dirimu di masa depan tersenyum bangga malam ini!',
    ];
    K.cinematicBubble(ctx, charX + 50, floorY - 420, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 340, col: beat >= 4 ? K.PAL.rimCyan : K.PAL.sunsetOrange,
    });
  });

  const headers = [
    ['+1 TAHUN', 'SURAT DARI MASA DEPAN', 'Pilihan Kecil Malam Ini Menentukan Siapa Dirimu Kelak'],
    ['ORANG ASING', 'BIAS TEMPORAL DISCOUNTING', 'Mengapa Otak Sulit Mempedulikan Kesejahteraan Diri Esok Hari?'],
    ['LEMPAR', 'ILUSI MENUNDA PEKERJAAN', 'Menumpuk Masalah Hari Ini Menjadi Bencana Esok Pagi'],
    ['REALITA', 'YANG MEMBAYAR TETAPLAH DIRIMU', 'Bangun Pagi dengan Beban Utang Tugas yang Mengintai'],
    ['KADO', 'DISIPLIN ADALAH HADIAH CINTA', 'Setiap Langkah Beres Membuat Hari Esok Jauh Lebih Ringan'],
    ['TIMBANGAN', 'BIAYA DISIPLIN VS PENYESALAN', 'Rasa Lelah Berlangsung Singkat, Rasa Sesal Menghantui Lama'],
    ['365 HARI', 'WAKTU AKAN BERLALU PASTI', 'Kamu Bisa Tiba dengan Penyesalan atau dengan Mahakarya'],
    ['TERIMA KASIH', 'HADIAHI MASA DEPANMU', 'Lakukan yang Terbaik Malam Ini, Buat Dirimu Esok Tersenyum!'],
  ][beat];

  K.cinematicHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.rimCyan : K.PAL.sunsetOrange,
  });

  const callouts = [
    { tag: 'REFLEKSI DIRI', title: 'Melihat Pilihan Hari Ini dari Kacamata Masa Depan', desc: 'Apakah keputusan malam ini mendekatkan atau menjauhkanmu dari impian?', stat: '1 TAHUN LAGI', col: K.PAL.sunsetOrange, c: C.hook },
    { tag: 'BIAS PSIKOLOGI', title: 'Future Self Dilihat Sebagai Orang Asing', desc: 'Scan fMRI menunjukkan area otak untuk diri masa depan sama dengan area orang lain', stat: 'TEMPORAL', col: K.PAL.sunsetGold, c: C.asing },
    { tag: 'JEBAKAN PROKRASTINASI', title: 'Melempar Beban Mental ke Versi Diri Esok Hari', desc: '"Biar aku yang besok saja" adalah bentuk sabotase diri paling halus', stat: 'LEMPAR BEBAN', col: K.PAL.rimCyan, c: C.lempar },
    { tag: 'KESADARAN HAKIKI', title: 'Orang yang Menderita Besok Pagi adalah Kamu', desc: 'Rasa panik dan cemas esok hari lahir dari penundaan yang kamu buat malam ini', stat: 'TAGIHAN REALITA', col: K.PAL.sunsetOrange, c: C.bayar },
    { tag: 'PARADIGMA HADIAH', title: 'Tuntaskan Tugas Sebagai Kado untuk Diri Esok', desc: 'Bayangkan betapa leganya dirimu besok pagi saat pekerjaan utama sudah rapi', stat: 'KADO ESOK', col: K.PAL.rimCyan, c: C.hadiah },
    { tag: 'PERBANDINGAN BEBAN', title: 'Beban Disiplin Cuma Ons, Beban Sesal Berton-ton', desc: 'Jim Rohn: Rasa sakit karena berdisiplin jauh lebih ringan daripada penyesalan', stat: 'ONS VS TON', col: K.PAL.sunsetGold, c: C.harga },
    { tag: 'KEPASTIAN WAKTU', title: 'Kalender Terus Berputar Tanpa Menunggu Kesiapan', desc: 'Satu tahun akan berlalu dengan cepat, entah kamu gunakan atau kamu sia-siakan', stat: '365 HARI', col: K.PAL.rimCyan, c: C.waktu },
    { tag: 'PESAN JUARA', title: 'Lakukan Hari Ini Demi Dirimu di Masa Depan', desc: 'Berikan hadiah terbaik malam ini agar kelak kamu bangga pernah berjuang!', stat: 'BANGGA', col: K.PAL.sunsetOrange, c: C.moral },
  ][beat];

  K.cinematicCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
