// 71 · STICKMAN CAVEMAN — Demo 1: Otak Purba & Batu Tugas (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-caveman/kit.js';
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
  const floorY = 1240;

  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.aman?.start) beat = 6;
  else if (t >= C.kecil?.start) beat = 5;
  else if (t >= C.pecah?.start) beat = 4;
  else if (t >= C.tolak?.start) beat = 3;
  else if (t >= C.batu?.start) beat = 2;
  else if (t >= C.kalori?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 2 || beat === 3) {
    zoom = 1.15; fx = 580; fy = 920;
  } else if (beat >= 4) {
    zoom = 1.16; fx = 520; fy = 940;
  }

  const tags = [
    'GUA 01 • PERANGKAT KERAS 200.000 TAHUN',
    'GUA 02 • STRATEGI HEMAT ENERGI ZAMAN PURBA',
    'GUA 03 • TUGAS BESAR SEPERTI BATU RAKSASA',
    'GUA 04 • ALARM AMIGDALA & DORONGAN KABUR',
    'GUA 05 • PECAHKAN BATU JADI KERIKIL 5 MENIT',
    'GUA 06 • DUA KALIMAT PEMBUKA TANPA BEBAN',
    'GUA 07 • PERTAHANAN PURBA MELUNAK',
    'GUA 08 • MOMENTUM MEMBAWAMU TUNTAS!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.cavemanBg(ctx, t, { floorY, stageTag: tags[beat], col: beat >= 4 ? K.PAL.teal : K.PAL.ochre });
    K.cavemanProps(ctx, floorY, beat >= 4 ? 'pebbles' : 'boulder', { phase: beat >= 4 ? 2 : 0, t });

    const charX = beat <= 3 ? 360 : 460;
    const pose = beat === 0 ? 'scratch' : beat <= 3 ? 'push' : beat <= 5 ? 'strike' : 'triumph';
    K.cavemanStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Otak kita software zaman batu!',
      'Hemat kalori = selamat hidup!',
      'Waduh! Tugasnya gede banget kayak batu!',
      'Alarm bahaya bunyi: kabur rebahan aja!',
      'Pecahin batunya jadi kerikil 5 menit!',
      'Cuma nulis 2 kalimat dulu kok!',
      'Otak purba tenang, energi aman!',
      'Pecahkan batunya, tuntas harimu!',
    ];
    K.cavemanBubble(ctx, charX + 50, floorY - 380, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 300, col: beat >= 4 ? K.PAL.teal : K.PAL.ochre,
    });
  });

  const headers = [
    ['200.000 THN', 'OTAK PURBA DI ERA MODERN', 'Kamu Bukan Pemalas, Tapi Bawa Software Zaman Gua'],
    ['HEMAT!', 'MENGHEMAT KALORI = SURVIVAL', 'Di Zaman Purba, Diam Menghemat Energi Adalah Kunci'],
    ['BATU BESAR', 'TUGAS BESAR SEPERTI MONOLIT', 'Si Uga Membayangkan Kerja Keras Menguras Tenaga'],
    ['ALARM!', 'DORONGAN KABUR DARI KELELAHAN', 'Amigdala Menyuruhmu Mencari Hiburan Cepat'],
    ['PECAHKAN!', 'STRATEGI SALAMI SLICING', 'Ubah Batu Raksasa Menjadi Kerikil Lima Menit'],
    ['MIKRO', 'DUA KALIMAT PEMBUKA', 'Buat Langkah Sangat Kecil yang Tak Mengancam'],
    ['AMAN!', 'PERTAHANAN OTAK MELUNAK', 'Saraf Mengizinkanmu Mulai Bergerak Tanpa Panik'],
    ['MENANG!', 'BIARKAN MOMENTUM BEKERJA', 'Pecahkan Tugasmu, Selesaikan dengan Bangga!'],
  ][beat];

  K.cavemanHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.teal : K.PAL.ochre,
  });

  const callouts = [
    { tag: 'EVOLUSI BIOLOGIS', title: 'Hardware Otak Kita Tidak Berubah Selama 200.000 Tahun', desc: 'Tubuh kita hidup di era digital, tapi respon stres kita masih purba', stat: '200K THN', col: K.PAL.ochre, c: C.hook },
    { tag: 'STRATEGI PURBA', title: 'Kalori Langka: Diam Adalah Cara Bertahan Hidup', desc: 'Manusia gua yang boros energi tanpa hasil nyata akan cepat mati', stat: 'SURVIVAL', col: K.PAL.amber, c: C.kalori },
    { tag: 'PERSEPSI BEBAN', title: 'Laporan 20 Halaman Terasa Mengancam Kehidupan', desc: 'Otak tidak bisa membedakan bahaya fisik vs beban kerja mental', stat: 'BATU 3D', col: K.PAL.ochre, c: C.batu },
    { tag: 'ALARM AMIGDALA', title: 'Respon Fight, Flight, or Freeze Aktif Seketika', desc: 'Kabur membuka media sosial adalah bentuk flight modern dari tugas', stat: 'ALARM!', col: K.PAL.fire, c: C.tolak },
    { tag: 'SALAMI SLICING', title: 'Pecah Menjadi Unit Tugas yang Tak Menakutkan', desc: 'Batu tugas yang dipecah jadi kerikil 5 menit mudah diangkat', stat: 'KERIKIL', col: K.PAL.teal, c: C.pecah },
    { tag: 'LANGKAH MIKRO', title: 'Target: Cuma Buka File & Tulis 2 Kalimat', desc: 'Menurunkan ambang rintangan aksi hingga level terendah', stat: '2 KALIMAT', col: K.PAL.teal, c: C.kecil },
    { tag: 'NEUROBIOLOGI', title: 'Ketiadaan Ancaman Mengaktifkan Mode Fokus', desc: 'Otak purba merasa cadangan energi tetap aman terkendali', stat: 'AMAN', col: K.PAL.amber, c: C.aman },
    { tag: 'PESAN JUARA', title: 'Kendalikan Si Uga di Dalam Kepalamu Hari Ini', desc: 'Pecahkan tugas besarmu jadi langkah mikro dan tuntaskan!', stat: 'TUNTAS', col: K.PAL.ochre, c: C.moral },
  ][beat];

  K.cavemanCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
