// 69 · STICKMAN 3D WORLD — Demo 1: Hukum Bunga Majemuk Kebiasaan (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-3dworld/kit.js';
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

  // Determine active beat from story.json lines
  let beat = 0;
  if (t >= C.moral?.start) beat = 8;
  else if (t >= C.praktik?.start) beat = 7;
  else if (t >= C.sistem?.start) beat = 6;
  else if (t >= C.tangga?.start) beat = 5;
  else if (t >= C.es?.start) beat = 4;
  else if (t >= C.lembah?.start) beat = 3;
  else if (t >= C.turun?.start) beat = 2;
  else if (t >= C.matematika?.start) beat = 1;

  // Camera zoom & pan per beat
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.15; fx = 520; fy = 920;
  } else if (beat === 3 || beat === 4) {
    zoom = 1.12; fx = 480; fy = 900;
  } else if (beat === 5 || beat === 6) {
    zoom = 1.18; fx = 680; fy = 940;
  }

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.world3dBg(ctx, t, { horizonY: 540, floorY, accent: beat >= 5 ? K.PAL.gold : K.PAL.cyan });

    // 3D Staircase progression
    const steps = [
      { x: 260, h: 56, col: K.PAL.cyan, lbl: 'H-1' },
      { x: 410, h: 110, col: K.PAL.cyan, lbl: 'H-30' },
      { x: 560, h: 185, col: K.PAL.emerald, lbl: 'H-90' },
      { x: 710, h: 280, col: K.PAL.emerald, lbl: 'H-180' },
      { x: 870, h: 410, col: K.PAL.gold, lbl: '37,8x' },
    ];

    const activeStepMax = Math.min(4, Math.floor(beat / 2));
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      const active = i <= activeStepMax;
      K.draw3dBox(ctx, st.x, floorY, 124, st.h, 38, {
        col: active ? st.col : K.PAL.muted,
        label: st.lbl,
        a: active ? 1 : 0.4,
      });
    }

    // Left comparison: Shrinking -1% block (0.03x)
    K.draw3dBox(ctx, 110, floorY, 115, beat >= 2 ? 48 : 82, 32, {
      col: K.PAL.coral, label: '-1%', subLabel: '0,03x',
    });

    // 3D Exponential Line in upper stage area
    ctx.strokeStyle = K.rgba(K.PAL.emerald, 0.75);
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(260, floorY - 56);
    ctx.quadraticCurveTo(560, floorY - 140, 870, floorY - 410);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3D Mannequin climbing the steps
    const curStep = steps[activeStepMax];
    const pose = beat >= 7 ? 'victory' : beat === 2 ? 'push-cube' : 'climb';
    K.mannequin3DStickman(ctx, curStep.x, floorY - curStep.h, pose, {
      facing: 1, col: beat >= 6 ? K.PAL.gold : K.PAL.cyan, t,
    });
  });

  // Top Full Banner
  const headers = [
    ['+1%', 'KEKUATAN 1% SETIAP HARI', 'Mengapa Perubahan Kecil Mengalahkan Ambisi Sesaat?'],
    ['37,78x', 'RUMUS BUNGA MAJEMUK 365 HARI', '1,01^365 = 37,78x Lebih Unggul Secara Eksponensial'],
    ['0,03x', 'BAHAYA KEMUNDURAN MIKRO (-1%)', '0,99^365 = Tergerus Habis Menyusut Hingga 3%'],
    ['SABAR', 'LEMBAH KEKECEWAAN DI BULAN 1', 'Kurva Hasil Tertunda Membuat Banyak Orang Menyerah'],
    ['0°C', 'ANALOGI ES BATU MENCAIR PADA 0°C', 'Energi Usaha Tersimpan Hingga Menyentuh Titik Terobosan'],
    ['TANGGA', 'TIAP ANAK TANGGA MENYIMPAN POTENSI', 'Langkah Mikro Harian Membangun Momentum Raksasa'],
    ['SISTEM', 'FOKUS PADA SISTEM, BUKAN TARGET', 'Pemenang & Pecundang Punya Target Sama, Sistemnya Beda'],
    ['AKSI', 'MULAI DARI HAL SANGAT MUDAH', '2 Halaman Buku • 5 Menit Bereskan Meja • 10 Menit Jalan'],
    ['JUARA', 'JALAN PANJANG DIMULAI DARI HARI INI', 'Jangan Remehkan Perubahan 1% yang Dilakukan Berulang!'],
  ][beat];

  K.world3dHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 6 ? K.PAL.gold : K.PAL.cyan,
  });

  // Single floating educational callout card at y = 1485 (h = 165)
  const callouts = [
    { tag: 'KESALAHAN AWAL', title: 'Target 100% Instan Memicu Burnout di Hari Ketiga', desc: 'Otak menolak beban kebiasaan yang dinaikkan terlalu ekstrem', stat: 'BURNOUT', col: K.PAL.coral, c: C.hook },
    { tag: 'MATEMATIKA 365 HARI', title: '1,01 Pangkat 365 = 37,78 Kali Lipat Lebih Baik', desc: 'Bunga majemuk kemampuan menghasilkan lonjakan hasil di akhir tahun', stat: '37,78x', col: K.PAL.emerald, c: C.matematika },
    { tag: 'KEMUNDURAN 1%', title: '0,99 Pangkat 365 = Menyusut Tersisa 0,03 (3%)', desc: 'Menunda sedikit demi sedikit mengikis masa depan tanpa kita sadari', stat: '0,03x', col: K.PAL.coral, c: C.turun },
    { tag: 'VALLEY OF DISAPPOINTMENT', title: 'Bulan Pertama: Ekspektasi Lurus vs Realita Melengkung', desc: 'Hasil nyata sering baru terlihat setelah melewati ambang batas tertentu', stat: 'SABAR', col: K.PAL.gold, c: C.lembah },
    { tag: 'TERMODINAMIKA', title: 'Dari -5°C ke -1°C Es Belum Cair, Tapi Suhu Terus Naik', desc: 'Derajat terakhir yang mencairkan es membutuhkan akumulasi panas sebelumnya', stat: '0°C', col: K.PAL.cyan, c: C.es },
    { tag: 'ENERGI POTENSIAL', title: 'Setiap Langkah Kecil Memadatkan Keterampilanmu', desc: 'Tidak ada anak tangga yang sia-sia jika terus dilangkahi setiap hari', stat: 'TANGGA 3D', col: K.PAL.emerald, c: C.tangga },
    { tag: 'ATOMIC HABITS', title: 'Kita Jatuh ke Level Sistem, Bukan Naik ke Target', desc: 'Target hanya memberi arah, sistem harian yang menentukan apakah kita sampai', stat: 'SISTEM', col: K.PAL.gold, c: C.sistem },
    { tag: 'LANGKAH MIKRO', title: 'Buat Sangat Mudah Hingga Tidak Bisa Ditolak', desc: 'Dua halaman buku atau 5 menit jalan kaki membangun identitas disiplin baru', stat: 'MULAI', col: K.PAL.cyan, c: C.praktik },
    { tag: 'PESAN JUARA', title: 'Kuasai Hari Ini dengan Konsistensi Satu Persen', desc: 'Langkah kecil hari ini adalah terobosan besar di masa depanmu!', stat: '37,8x', col: K.PAL.gold, c: C.moral },
  ][beat];

  K.world3dCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}

