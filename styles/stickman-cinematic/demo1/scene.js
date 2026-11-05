// 72 · STICKMAN CINEMATIC — Demo 1: Kota Tidur, Mimpimu Belum Selesai (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-cinematic/kit.js';
const { clamp, lerp, ease } = AM.lib;

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
  else if (t >= C.tenang?.start) beat = 6;
  else if (t >= C.akumulasi?.start) beat = 5;
  else if (t >= C.langkah?.start) beat = 4;
  else if (t >= C.pilihan?.start) beat = 3;
  else if (t >= C.hening?.start) beat = 2;
  else if (t >= C.siang?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.15; fx = 500; fy = 920;
  } else if (beat >= 4) {
    zoom = 1.16; fx = 560; fy = 940;
  }

  const tags = [
    'SCENE 01 • LAMPU KOTA MULAI PADAM',
    'SCENE 02 • SIANG HARI TERSITA ORANG LAIN',
    'SCENE 03 • KEHENINGAN EMAS SEBELUM TIDUR',
    'SCENE 04 • PILIHAN DUA JALAN DI MALAM HARI',
    'SCENE 05 • 45 MENIT FOKUS MURNI UNTUK MIMPI',
    'SCENE 06 • AKUMULASI 300 JAM DALAM SETAHUN',
    'SCENE 07 • ISTIRAHAT TENANG TANPA PENYESALAN',
    'SCENE 08 • NYALAKAN LAMPU BELAJARMU!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.cinematicBg(ctx, t, { floorY, sceneCode: tags[beat], col: beat >= 4 ? K.PAL.rimCyan : K.PAL.sunsetOrange });
    K.cinematicProps(ctx, floorY, 'rooftop', { phase: beat >= 4 ? 2 : 0, t });

    const charX = beat <= 2 ? 380 : 480;
    const pose = beat === 0 ? 'gaze' : beat <= 2 ? 'walk' : beat <= 4 ? 'think' : 'look-up';
    K.cinematicStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Kota sudah tidur, kamu mau ke mana?',
      'Siang hari milik tuntutan orang lain...',
      'Malam ini milik masa depanmu sendiri!',
      'Scroller tanpa ujung vs bangun karya nyata?',
      'Cukup 45 menit fokus, jangan rusak tidurmu!',
      '1 halaman per malam = 300 jam keahlian!',
      'Tidur dengan rasa tenang & bangga!',
      'Nyalakan mimpimu di keheningan malam!',
    ];
    K.cinematicBubble(ctx, charX + 50, floorY - 420, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 340, col: beat >= 4 ? K.PAL.rimCyan : K.PAL.sunsetOrange,
    });
  });

  const headers = [
    ['00:00', 'KOTA TIDUR, MIMPIMU HIDUP', 'Kekuatan Satu Jam Hening Sebelum Terlelap'],
    ['SIANG', 'WAKTU TERBAGI UNTUK DUNIA', 'Tuntutan Kantor & Ratusan Notifikasi Tanpa Henti'],
    ['HENING', 'JENDELA EMAS TANPA GANGGUAN', 'Tidak Ada Telepon Berdering di Tengah Malam'],
    ['PILIHAN', 'DUA JALAN DI UJUNG HARI', 'Jalan di Tempat vs Melesat Maju dalam Senyap'],
    ['45 MNT', 'FOKUS MURNI TANPA BEGADANG', 'Dedikasikan Waktu Singkat Khusus Cita-Citamu'],
    ['300 JAM', 'KEAJAIBAN AKUMULASI TAHUNAN', 'Cicilan Kecil Menghasilkan Lompatan Kemampuan'],
    ['TENANG', 'TIDUR NYENYAK PENUH ARTI', 'Tutup Hari dengan Rasa Puas Tanpa Beban Moral'],
    ['KARYA', 'JADILAH PEJUANG KEHENINGAN', 'Masa Depanmu Dibangun Saat yang Lain Tertidur!'],
  ][beat];

  K.cinematicHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.rimCyan : K.PAL.sunsetOrange,
  });

  const callouts = [
    { tag: 'WAKTU EMAS', title: 'Lampu Padam, Kebisingan Siang Mereda', desc: 'Momen transisi terbaik untuk memikirkan arah hidup yang sesungguhnya', stat: 'GOLDEN HOUR', col: K.PAL.sunsetOrange, c: C.hook },
    { tag: 'DISTRAKSI SIANG', title: 'Energi Terkuras Mengurusi Kepentingan Luar', desc: 'Seringkali kita tidur dengan perasaan lelah tapi belum mengerjakan mimpi kita', stat: 'SIANG', col: K.PAL.sunsetGold, c: C.siang },
    { tag: 'KEHENINGAN MALAM', title: 'Tidak Ada yang Menuntut Perhatianmu', desc: 'Waktu terbaik otak untuk melakukan deep focus tanpa interupsi', stat: 'HENING', col: K.PAL.rimCyan, c: C.hening },
    { tag: 'PERBEDAAN NASIB', title: 'Bagaimana Kamu Menghabiskan 1 Jam Ini?', desc: 'Scroller pasif kehilangan waktu, pejuang senyap mengumpulkan modal hidup', stat: 'PILIHAN', col: K.PAL.sunsetOrange, c: C.pilihan },
    { tag: '45 MENIT FOKUS', title: 'Kesehatan Tetap Terjaga, Hasil Tetap Nyata', desc: 'Jangan begadang merusak tubuh, gunakan waktu terukur dengan intensitas penuh', stat: '45 MNT', col: K.PAL.rimCyan, c: C.langkah },
    { tag: 'HUKUM AKUMULASI', title: '1 Halaman Tiap Malam = 300 Jam Setahun', desc: 'Kemampuan langka selalu lahir dari konsistensi sunyi yang tidak dipamerkan', stat: '300 JAM', col: K.PAL.sunsetGold, c: C.akumulasi },
    { tag: 'KEDAMAIAN BATIN', title: 'Tidur dengan Senyum karena Ada Kemajuan', desc: 'Tidak ada obat tidur yang lebih manjur daripada hari yang tuntas dengan baik', stat: 'TENANG', col: K.PAL.rimCyan, c: C.tenang },
    { tag: 'PESAN JUARA', title: 'Nyalakan Lampu Kerjamu di Keheningan', desc: 'Dunia boleh terlelap, tapi mimpimu pantas mendapatkan perhatianmu malam ini!', stat: 'BANGKIT', col: K.PAL.sunsetOrange, c: C.moral },
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
