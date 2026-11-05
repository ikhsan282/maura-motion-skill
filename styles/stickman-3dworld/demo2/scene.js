// 69 · STICKMAN 3D WORLD — Demo 2: Hukum Parkinson & Timeboxing 3D
import * as K from '/styles/stickman-3dworld/kit.js';
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
  const floorY = 770;

  let phase = 0;
  if (t >= C.esensi.start) phase = 3;
  else if (t >= C.solusi.start) phase = 2;
  else if (t >= C.longgar.start) phase = 1;

  K.world3dBg(ctx, t, { horizonY: 480, floorY, accent: phase >= 2 ? K.PAL.emerald : K.PAL.coral });

  const headers = [
    ['7 HARI', 'HUKUM PARKINSON (1955)', 'Mengapa Tugas 2 Jam Bisa Molor Menjadi Satu Minggu?', 'WAKTU MELAR'],
    ['LONGGAR', 'TUGAS MENGEMBANG SEPERTI GAS', 'Makin Longgar Tenggatnya, Makin Rumit & Lambat Kerjanya', ' OVERTHINK'],
    ['90 MNT', 'TEKNIK TIMEBOXING 3D', 'Perkecil Kotak Waktumu agar Fokus Langsung Memadat', 'PADAT FOKUS'],
    ['SELESAI!', 'CEPAT TUNTAS, BEBAS BEBAN', '80% Inti Pekerjaan Selesai dalam 20% Waktu!', 'EFISIEN 5x'],
  ][phase];

  K.world3dHeader(ctx, headers[0], headers[1], headers[2], {
    rightStat: headers[3], col: phase >= 2 ? K.PAL.emerald : K.PAL.coral,
  });

  // Left: Bloated 7-Day Parkinson Cube vs Right: Compressed 2-Hour Timebox Cube
  const boxW = phase <= 1 ? 370 : 190;
  const boxH = phase <= 1 ? 260 : 155;
  const boxCol = phase <= 1 ? K.PAL.coral : K.PAL.emerald;
  const boxLbl = phase <= 1 ? 'KOTAK 7 HARI (MELAR)' : 'TIMEBOX 2 JAM (PADAT)';

  K.draw3dBox(ctx, 640, floorY, boxW, boxH, 48, {
    col: boxCol,
    label: phase <= 1 ? '7 HARI' : '2 JAM!',
    subLabel: boxLbl,
  });

  // Completed small trophy cube on far right in phase 3
  if (phase >= 2) {
    K.draw3dBox(ctx, 895, floorY, 125, 110, 32, {
      col: K.PAL.gold, label: '100%', subLabel: 'TUNTAS!',
    });
  }

  // 3D Mannequin Stickman pushing/compressing the 3D Time Cube!
  const manX = phase <= 1 ? 330 : 420;
  K.mannequin3DStickman(ctx, manX, floorY, phase === 3 ? 'victory' : 'push-cube', {
    facing: 1, col: phase >= 2 ? K.PAL.emerald : K.PAL.cyan, t, label: 'KOMPRES WAKTU',
  });

  if (phase === 0) {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'HUKUM PARKINSON (C. NORTHCOTE PARKINSON)',
      titleStr: 'Pekerjaan Mengembang Menghabiskan Waktu yang Tersedia',
      subStr: 'Jika diberi waktu seminggu untuk tugas dua jam, otak akan mengulurnya seminggu',
      stat: '7 HARI',
      statSub: 'MOLOR PENUH',
      col: K.PAL.coral,
      a: pop(t, C.hook.start + 0.2),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'ILUSI KESIBUKAN SEMU',
      titleStr: 'Waktu Luang yang Berlebihan Memicu Penundaan',
      subStr: 'Merasa masih punya banyak waktu membuat kita santai di lima hari pertama',
      stat: 'LAMBAT',
      statSub: 'TEMPO RENDAH',
      col: K.PAL.gold,
      a: pop(t, C.hukum.start),
    });
  } else if (phase === 1) {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'ANALOGI GAS DALAM RUANG 3D',
      titleStr: 'Makin Besar Wadah Waktunya, Makin Encer Fokusnya',
      subStr: 'Kita terjebak mengganti font, warna, dan detail sepele yang tidak berdampak',
      stat: 'ENCER',
      statSub: 'FOKUS PECAH',
      col: K.PAL.coral,
      a: pop(t, C.longgar.start),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'FENOMENA THE NIGHT BEFORE',
      titleStr: 'Mengapa Kita Sangat Produktif 2 Jam Sebelum Deadline?',
      subStr: 'Tenggat waktu yang sempit memutus distraksi dan mengaktifkan fokus penuh',
      stat: '2 JAM',
      statSub: 'FOKUS MAKSIMAL',
      col: K.PAL.cyan,
      a: pop(t, C.kepepet.start),
    });
  } else if (phase === 2) {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'STRATEGI TIMEBOXING (KOTAK WAKTU)',
      titleStr: 'Padatkan Sendiri Batas Waktumu Sebelum Mulai Bekerja',
      subStr: 'Pasang timer 90 menit dan perlakukan seolah itu adalah batas waktu terakhir',
      stat: '90 MNT',
      statSub: 'TENGGAT BUATAN',
      col: K.PAL.emerald,
      a: pop(t, C.solusi.start),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'FOKUS PRINSIP PARETO (80/20)',
      titleStr: 'Waktu Singkat Memaksa Otak Memilih Hal Paling Esensial',
      subStr: 'Langsung menyasar inti pekerjaan tanpa terjebak perfeksionisme berlebihan',
      stat: '80/20',
      statSub: 'INTI PENTING',
      col: K.PAL.gold,
      a: pop(t, C.batas.start),
    });
  } else {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'KEBEBASAN SETELAH TUGAS TUNTAS',
      titleStr: 'Kerja Padat 2 Jam Lebih Baik daripada Beban 7 Hari',
      subStr: 'Selesaikan lebih awal agar waktu istirahatmu benar-benar tenang tanpa rasa bersalah',
      stat: 'BEBAS!',
      statSub: 'TANPA BEBAN',
      col: K.PAL.emerald,
      a: pop(t, C.esensi.start),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'PRINSIP MANAJEMEN ENERGI 3D',
      titleStr: 'Perkecil Kotak Waktumu, Perbesar Kualitas Hidupmu',
      subStr: 'Jangan biarkan pekerjaan ringan merampas seluruh akhir pekanmu',
      stat: 'TUNTAS',
      statSub: 'KENDALI PENUH',
      col: K.PAL.gold,
      a: pop(t, C.bebas.start),
    });
  }
}

