// 69 · STICKMAN 3D WORLD — Demo 3: Ilusi Multitasking & Attention Residue
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
  if (t >= C.dalam.start) phase = 3;
  else if (t >= C.monotask.start) phase = 2;
  else if (t >= C.residu.start) phase = 1;

  K.world3dBg(ctx, t, { horizonY: 480, floorY, accent: phase >= 2 ? K.PAL.cyan : K.PAL.coral });

  const headers = [
    ['4 TUGAS', 'ILUSI MULTITASKING', 'Otak Tidak Bekerja Paralel, Melainkan Melompat Cepat', 'PECAH FOKUS'],
    ['23 MNT', 'RESIDU PERHATIAN (SOPHIE LEROY)', 'Biaya Tersembunyi Setiap Kali Kita Melirik Notifikasi', '-40% ENERGI'],
    ['1 FOKUS', 'KEKUATAN MONOTASKING 3D', 'Selesaikan Satu Balok Utuh Sebelum Pindah ke Berikutnya', 'DEEP WORK'],
    ['2x CEPAT', 'SATU PER SATU JAUH LEBIH UNGGUL', 'Pikiran Tenang, Kualitas Tinggi, dan Bebas Kelelahan Mental', 'TUNTAS!'],
  ][phase];

  K.world3dHeader(ctx, headers[0], headers[1], headers[2], {
    rightStat: headers[3], col: phase >= 2 ? K.PAL.cyan : K.PAL.coral,
  });

  if (phase <= 1) {
    // Chaotic floating 3D cubes being juggled in the air around left mannequin
    const cubes = [
      { x: 210, y: 580 + Math.sin(t * 5) * 28, lbl: 'CHAT', col: K.PAL.coral },
      { x: 350, y: 470 + Math.cos(t * 6) * 32, lbl: 'EMAIL', col: K.PAL.gold },
      { x: 510, y: 550 + Math.sin(t * 5.5 + 1) * 28, lbl: 'RAPAT', col: K.PAL.purple },
      { x: 665, y: 490 + Math.cos(t * 4.5 + 2) * 30, lbl: 'TUGAS', col: K.PAL.coral },
    ];
    for (const cb of cubes) {
      K.draw3dBox(ctx, cb.x, cb.y, 110, 74, 26, { col: cb.col, label: cb.lbl });
    }
    K.mannequin3DStickman(ctx, 430, floorY, 'juggle', {
      facing: 1, col: K.PAL.coral, t, label: 'MULTITASKING (-40%)',
    });
  } else {
    // Clean, solid stacked 3D Monotasking Tower on the right!
    K.draw3dBox(ctx, 680, floorY, 185, 86, 38, { col: K.PAL.cyan, label: 'TUGAS #1', subLabel: 'SELESAI 100%' });
    K.draw3dBox(ctx, 680, floorY - 86, 185, 86, 38, { col: K.PAL.emerald, label: 'TUGAS #2', subLabel: 'SELESAI 100%' });
    if (phase === 3) {
      K.draw3dBox(ctx, 680, floorY - 172, 185, 86, 38, { col: K.PAL.gold, label: 'TUGAS #3', subLabel: 'TUNTAS!' });
    }
    K.mannequin3DStickman(ctx, 380, floorY, phase === 3 ? 'victory' : 'push-cube', {
      facing: 1, col: K.PAL.emerald, t, label: 'MONOTASKING (100%)',
    });
  }

  if (phase === 0) {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'MITOS MULTITASKING MODERN',
      titleStr: 'Otak Manusia Bukan Prosesor Multi-Core untuk Tugas Berat',
      subStr: 'Korteks prefrontal hanya mampu memegang satu fokus utama pada satu detik',
      stat: '1 FOKUS',
      statSub: 'KAPASITAS OTAK',
      col: K.PAL.coral,
      a: pop(t, C.hook.start + 0.2),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'FENOMENA CONTEXT SWITCHING',
      titleStr: 'Bukan Bekerja Bersamaan, Melainkan Lompat Bolak-Balik',
      subStr: 'Setiap lompatan menguras glukosa otak dan menurunkan ketajaman logika',
      stat: 'LONCAT',
      statSub: 'KURAS ENERGI',
      col: K.PAL.gold,
      a: pop(t, C.loncat.start),
    });
  } else if (phase === 1) {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'ATTENTION RESIDUE (PROF. SOPHIE LEROY)',
      titleStr: 'Sebagian Pikiran Tertinggal di Tugas yang Belum Selesai',
      subStr: 'Saat berpindah dari chat kembali ke laporan, kapasitas kognitif kita terbelah',
      stat: 'RESIDU',
      statSub: 'FOKUS TERBELAH',
      col: K.PAL.coral,
      a: pop(t, C.residu.start),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'RISET UC IRVINE (GLORIA MARK)',
      titleStr: 'Butuh 23 Menit untuk Kembali ke Fokus Mendalam',
      subStr: 'Melirik HP selama 30 detik dapat merusak alur konsentrasi hampir setengah jam',
      stat: '23 MNT',
      statSub: 'BIAYA INTERUPSI',
      col: K.PAL.purple,
      a: pop(t, C.waktu23.start),
    });
  } else if (phase === 2) {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'METODE MONOTASKING (SATU PER SATU)',
      titleStr: 'Susun Balok Tugas Secara Berurutan, Bukan Bersamaan',
      subStr: 'Tuntaskan Tugas #1 hingga selesai sebelum membuka jendela Tugas #2',
      stat: '1 DEMI 1',
      statSub: 'URUT & RAPI',
      col: K.PAL.cyan,
      a: pop(t, C.monotask.start),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'HIGIENITAS RUANG KERJA DIGITAL',
      titleStr: 'Tutup Tab Browser & Matikan Notifikasi Selama Sesi Fokus',
      subStr: 'Hilangkan pemicu visual agar mata tidak tergoda berpindah tugas',
      stat: '0 TAB',
      statSub: 'BEBAS DISTRAKSI',
      col: K.PAL.emerald,
      a: pop(t, C.monotask.start + 1.5),
    });
  } else {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'KECEPATAN DEEP WORK (CAL NEWPORT)',
      titleStr: 'Fokus Tunggal Menyelesaikan Pekerjaan 2x Lebih Cepat',
      subStr: 'Tanpa pajak pindah fokus, alur pikiran mengalir jernih dan minim revisi',
      stat: '2x LIPAT',
      statSub: 'KECEPATAN KERJA',
      col: K.PAL.emerald,
      a: pop(t, C.dalam.start),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'PRINSIP FOKUS 3D',
      titleStr: 'Berikan 100% Perhatian pada Satu Hal di Depan Mata',
      subStr: 'Bekerja tenang satu per satu jauh lebih produktif daripada sibuk terburu-buru',
      stat: '100%',
      statSub: 'FOKUS UTUH',
      col: K.PAL.gold,
      a: pop(t, C.aturan.start),
    });
  }
}

