// 76 · STICKMAN MINIMAL DARK — Demo 2: Menghentikan Overthinking Pukul 2 Pagi (Brain Dump & Studi Baylor)
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
  if (t >= C.besok.start) phase = 3;
  else if (t >= C.tuang.start) phase = 2;
  else if (t >= C.putar.start) phase = 1;

  const tags = [
    'MODE 01 • MENGAPA PIKIRAN RAMAI SAAT LAMPU MATI?',
    'MODE 02 • JEBAKAN RUMINASI DI ATAS KASUR',
    'MODE 03 • TEKNIK BRAIN DUMP (TUANG KE KERTAS)',
    'MODE 04 • COGNITIVE OFFLOADING & TIDUR TENANG',
  ];

  const col = phase >= 2 ? K.PAL.blue : K.PAL.red;
  K.minimalDarkBg(ctx, t, { floorY, modeTag: tags[phase], col });

  const headers = [
    ['02:00 AM', 'OVERTHINKING SAAT INGIN TERLELAP', 'Mengapa Masalah Kecil Terasa Raksasa di Tengah Malam?'],
    ['RUMINASI', 'BERPUTAR DI TEMPAT TANPA SOLUSI', 'Korteks Logis Lelah, Sementara Alarm Emosi Membesar-besarkan'],
    ['BRAIN DUMP', 'PINDAHKAN ISI KEPALA KE ATAS KERTAS', 'Studi Baylor University: Tulis Daftar Besok = Cepat Tidur'],
    ['LEGA!', 'BERI IZIN OTAKMU UNTUK BERISTIRAHAT', 'Semua Sudah Tercatat Aman, Selesaikan Esok Saat Segar!'],
  ][phase];

  K.minimalDarkHeader(ctx, headers[0], headers[1], headers[2], { col });

  const diagrams = [
    ['DISTORSI MALAM', 'LOGIKA LELAH', 'Masalah kecil tampak 10x lebih besar', K.PAL.red],
    ['LOOP PIKIRAN', 'KASET RUSAK', 'Berputar tanpa jalan keluar di kepala', K.PAL.red],
    ['BRAIN DUMP', 'TULIS DI KERTAS!', 'Kosongkan RAM memori kerja otak', K.PAL.blue],
    ['SLEEP QUALITY', 'NYENYAK 100%', 'Otak tenang karena daftar tersimpan', K.PAL.blue],
  ][phase];
  K.minimalDarkDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

  const charX = 335;
  const state = phase <= 1 ? 'overthink' : 'clarity';
  K.minimalDarkStickman(ctx, charX, floorY, state, { facing: 1, t });

  const bubbles = [
    'Badan udah ngantuk berat, kok kepala malah muter terus?!',
    'Mikirin kerjaan jam 2 pagi cuma bikin dada sesak!',
    'Aku tulis semua di buku catatan biar nggak perlu diingat-ingat!',
    'Kertasnya yang jaga catatanku, sekarang aku bisa tidur tenang!',
  ];
  K.minimalDarkBubble(ctx, charX + 20, 350, bubbles[phase], { tailX: charX, tailY: 425, col });

  if (phase === 0) {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'NEUROBIOLOGI PIKIRAN TENGAH MALAM',
      titleStr: 'Korteks Prefrontal Lelah, Amigdala Tanpa Pengawas',
      subStr: 'Jangan pernah mempercayai vonis buruk tentang hidupmu di atas pukul 11 malam',
      stat: 'BIAS MALAM',
      statSub: 'LOGIKA TURUN',
      col: K.PAL.red,
      a: pop(t, C.hook.start + 0.2),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'HILANGNYA DISTRAKSI EKSTERNAL',
      titleStr: 'Saat Ruangan Hening, Tugas Belum Selesai Bermunculan',
      subStr: 'Otak berusaha mengingatkan kita agar tidak lupa pada kewajiban esok hari',
      stat: 'ALARM INGAT',
      statSub: 'MEMORI KERJA',
      col: K.PAL.white,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'PERBEDAAN REFLEKSI vs RUMINASI',
      titleStr: 'Refleksi Mencari Solusi, Ruminasi Mengulang Kecemasan',
      subStr: 'Tetap memikirkan masalah dalam kondisi mengantuk hanya menguras energi esok hari',
      stat: 'RUMINASI',
      statSub: 'PUTARAN SEMU',
      col: K.PAL.red,
      a: pop(t, C.putar.start),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'KAPASITAS TERBATAS WORKING MEMORY',
      titleStr: 'Menahan 10 Urusan di Kepala Membuat Saraf Tegang',
      subStr: 'Otak takut tertidur karena khawatir daftar penting tersebut hilang saat bangun',
      stat: 'RAM PENUH',
      statSub: 'SARAF TEGANG',
      col: K.PAL.red,
      a: pop(t, C.putar.start + 0.5),
    });
  } else if (phase === 2) {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'RISET TIDUR BAYLOR UNIVERSITY (SCULLIN, 2018)',
      titleStr: '5 Menit Menulis To-Do List Besok Mempercepat Tidur',
      subStr: 'Semakin spesifik daftar yang ditulis, semakin cepat gelombang otak melambat',
      stat: '5 MENIT',
      statSub: 'TULIS DAFTAR',
      col: K.PAL.blue,
      a: pop(t, C.tuang.start),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'EFEK COGNITIVE OFFLOADING',
      titleStr: 'Memindahkan Beban Ingatan ke Media Fisik (Kertas)',
      subStr: 'Kertas menjadi harddisk eksternal yang membebaskan RAM otak untuk beristirahat',
      stat: 'OFFLOAD',
      statSub: 'LEGA SEKETIKA',
      col: K.PAL.white,
      a: pop(t, C.tuang.start + 0.5),
    });
  } else {
    K.minimalDarkCard(ctx, 540, 995, 960, 175, {
      tag: 'BATAS WAKTU KHAWATIR (WORRY WINDOW)',
      titleStr: 'Jadwalkan Penyelesaian Masalah di Pagi Hari Saat Segar',
      subStr: 'Masalah yang tampak rumit malam ini sering selesai dalam 15 menit esok pagi',
      stat: 'ESOK PAGI',
      statSub: 'ENERGI PENUH',
      col: K.PAL.blue,
      a: pop(t, C.besok.start),
    });
    K.minimalDarkCard(ctx, 540, 1210, 960, 175, {
      tag: 'CATATAN HENING MALAM INI',
      titleStr: 'Tulis di Kertas, Tutup Bukunya, dan Tidurlah dengan Damai',
      subStr: 'Istirahat yang cukup adalah separuh dari jalan keluar setiap masalahmu',
      stat: 'TENANG',
      statSub: 'PULIHKAN DIRI',
      col: K.PAL.blue,
      a: pop(t, C.besok.start + 0.5),
    });
  }
}

