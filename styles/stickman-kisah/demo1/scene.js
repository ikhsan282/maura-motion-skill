// 68 · STICKMAN KISAH — Demo 1: Kisah Utang & Amplop Cokelat
import * as K from '/styles/stickman-kisah/kit.js';
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
  if (t >= C.tegas.start) phase = 3;
  else if (t >= C.alasan.start) phase = 2;
  else if (t >= C.tagih1.start) phase = 1;

  const signs = [
    ['BABAK 1 • JANJI MANIS DI AWAL', K.PAL.gold],
    ['BABAK 2 • DITAGIH MALAH MENGHINDAR', K.PAL.coral],
    ['BABAK 3 • DEFENSIF & LUPA JANJI', K.PAL.coral],
    ['BABAK 4 • HARGA SEBUAH KEPERCAYAAN', K.PAL.emerald],
  ][phase];

  K.kisahBg(ctx, t, { floorY, signText: signs[0], signCol: signs[1] });

  const headers = [
    ['MINGGU 1', 'PINJAM MANIS, DITAGIH HILANG', 'Ketika Persahabatan Diuji oleh Selembar Amplop Pinjaman'],
    ['MINGGU 2', 'MULAI BANYAK ALASAN', 'Janji Minggu Depan Berubah Menjadi Nanti Saja'],
    ['BULAN 3', 'YANG MEMINJAMKAN JADI SUNGKAN', 'Mengapa Penagih Justru Merasa Tidak Enak Hati?'],
    ['MORAL', 'UTANG ADALAH SOAL KEHORMATAN', 'Uang Bisa Dicari, Namun Kepercayaan Sulit Kembali'],
  ][phase];

  K.kisahHeader(ctx, 'EPISODE 01 • PSIKOLOGI SOSIAL UTANG', headers[1], headers[2], {
    badge: headers[0], col: signs[1],
  });

  K.kisahStageProps(ctx, floorY, 'utang', { phase, t });

  // Left Character: Budi (Hero / Pemberi Pinjaman)
  const budiPose = phase === 0 ? 'give' : phase === 1 ? 'talk' : phase === 2 ? 'point' : 'talk';
  K.kisahStickman(ctx, 320, floorY, budiPose, {
    role: 'hero', facing: 1, t, label: 'BUDI (MENOLONG)',
  });

  // Right Character: Andi (Rival / Peminjam)
  const andiPose = phase === 0 ? 'beg' : phase === 1 ? 'evade' : phase === 2 ? 'evade' : 'run';
  const andiX = phase === 3 ? 820 : 760;
  K.kisahStickman(ctx, andiX, floorY, andiPose, {
    role: 'rival', facing: phase === 3 ? 1 : -1, t, label: 'ANDI (BERUTANG)',
  });

  // Dialogue bubbles on stage
  if (phase === 0) {
    K.kisahBubble(ctx, 320, 420, 'Ini uangnya, semoga terbantu ya.', { col: K.PAL.emerald, tailX: 320 });
    K.kisahBubble(ctx, 760, 420, 'Janji minggu depan lunas, Bro!', { col: K.PAL.gold, tailX: 760 });
  } else if (phase === 1) {
    K.kisahBubble(ctx, 320, 420, 'Gimana janji minggu lalu, Ndi?', { col: K.PAL.cyan, tailX: 320 });
    K.kisahBubble(ctx, 760, 420, 'Aduh nanti dulu ya, belum ada!', { col: K.PAL.coral, tailX: 760 });
  } else if (phase === 2) {
    K.kisahBubble(ctx, 320, 420, 'Kok ditagih malah marah?', { col: K.PAL.gold, tailX: 320 });
    K.kisahBubble(ctx, 760, 420, 'Cuma segitu aja ditagih terus!', { col: K.PAL.coral, tailX: 760 });
  } else {
    K.kisahBubble(ctx, 320, 420, 'Kepercayaan lebih mahal dari uang.', { col: K.PAL.emerald, tailX: 320 });
  }

  // Lower Reflection Cards
  if (phase === 0) {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'FENOMENA SOSIAL PINJAM-MEMINJAM',
      titleStr: 'Manis Saat Meminta, Berubah Saat Jatuh Tempo',
      subStr: 'Saat butuh bantuan, seseorang cenderung menjanjikan apa saja agar disetujui',
      stat: 'MANIS',
      statSub: 'JANJI AWAL',
      col: K.PAL.gold,
      a: pop(t, C.hook.start + 0.2),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'MODAL KEPERCAYAAN TANPA JAMINAN',
      titleStr: 'Menolong Teman Atas Dasar Empati & Persahabatan',
      subStr: 'Uang tabungan diserahkan tanpa hitam di atas putih karena rasa percaya',
      stat: '100%',
      statSub: 'MODAL PERCAYA',
      col: K.PAL.emerald,
      a: pop(t, C.percaya.start),
    });
  } else if (phase === 1) {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'HILANGNYA KOMUNIKASI & ITIKAD BAIK',
      titleStr: 'Bukan Soal Belum Mampu, Melainkan Sikap Menghindar',
      subStr: 'Kejujuran meminta maaf jauh lebih dihargai daripada menghilang tanpa kabar',
      stat: 'NGILANG',
      statSub: 'LUPA TANGGAL',
      col: K.PAL.coral,
      a: pop(t, C.tagih1.start),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'PARADOKS GAYA HIDUP PEMINJAM',
      titleStr: 'Mengaku Sulit Membayar tapi Tetap Hidup Konsumtif',
      subStr: 'Memprioritaskan gengsi di atas kewajiban melunasi hak orang lain',
      stat: 'PRIORITAS',
      statSub: 'SALAH KAPRAH',
      col: K.PAL.gold,
      a: pop(t, C.tagih1.start + 1.5),
    });
  } else if (phase === 2) {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'BEBAN EMOSIONAL PEMBERI PINJAMAN',
      titleStr: 'Mengapa Justru Pemilik Uang yang Merasa Sungkan?',
      subStr: 'Orang baik sering takut dianggap perhitungan saat menuntut haknya sendiri',
      stat: 'SUNGKAN',
      statSub: 'BEBAN TERBALIK',
      col: K.PAL.cyan,
      a: pop(t, C.malu.start),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'PSIKOLOGI DEFENSIVE AGGRESSION',
      titleStr: 'Marah Saat Ditagih Adalah Perisai Ego yang Bersalah',
      subStr: 'Menyerang balik penagih agar terbebas dari rasa malu karena ingkar janji',
      stat: 'DEFENSIF',
      statSub: 'PERISAI EGO',
      col: K.PAL.coral,
      a: pop(t, C.psikologi.start),
    });
  } else {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'ETIKA FINANSIAL & PERSAHABATAN',
      titleStr: 'Catat Setiap Pinjaman dan Tetapkan Batas Tegas',
      subStr: 'Perjanjian tertulis melindungi persahabatan dari kesalahpahaman di kemudian hari',
      stat: 'CATAT!',
      statSub: 'JAGA RELASI',
      col: K.PAL.gold,
      a: pop(t, C.tegas.start),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN MORAL GARIS HIDUP',
      titleStr: 'Utang Adalah Janji Kehormatan, Bukan Sekadar Uang',
      subStr: 'Jaga kepercayaan orang yang menolongmu saat kamu berada di titik terendah',
      stat: 'HORMAT',
      statSub: 'JAGA AMANAH',
      col: K.PAL.emerald,
      a: pop(t, C.batas.start),
    });
  }
}
