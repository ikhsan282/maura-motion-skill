// 69 · STICKMAN 3D WORLD — Demo 1: Hukum Bunga Majemuk Kebiasaan (1% Lebih Baik = 37,78x)
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
  if (t >= C.sistem.start) phase = 3;
  else if (t >= C.lembah.start) phase = 2;
  else if (t >= C.matematika.start) phase = 1;

  K.world3dBg(ctx, t, { horizonY: 480, floorY, accent: K.PAL.cyan });

  const headers = [
    ['+1%', 'KEKUATAN 1% SETIAP HARI', 'Mengapa Perubahan Kecil Mengalahkan Ambisi Sesaat?', 'HARI 1–7'],
    ['37,78x', 'MATEMATIKA BUNGA MAJEMUK', '1,01^365 = 37,78x Lebih Baik • 0,99^365 = 0,03x Menyusut', '365 HARI'],
    ['0°C', 'MELEWATI LEMBAH KEKECEWAAN', 'Usaha Tidak Hilang, Melainkan Tersimpan Seperti Es Mencair', 'TITIK TEMBUS'],
    ['SISTEM', 'FOKUS SISTEM, BUKAN SEKADAR TARGET', 'Setiap Anak Tangga 3D Membangun Masa Depanmu', 'JUARA!'],
  ][phase];

  K.world3dHeader(ctx, headers[0], headers[1], headers[2], {
    rightStat: headers[3], col: phase === 3 ? K.PAL.gold : K.PAL.cyan,
  });

  // 3D Staircase of 5 progressive 3D blocks from left to right
  const steps = [
    { x: 350, h: 42, col: K.PAL.cyan, lbl: 'H-1' },
    { x: 485, h: 86, col: K.PAL.cyan, lbl: 'H-30' },
    { x: 620, h: 142, col: K.PAL.emerald, lbl: 'H-90' },
    { x: 755, h: 215, col: K.PAL.emerald, lbl: 'H-180' },
    { x: 890, h: 310, col: K.PAL.gold, lbl: '37,8x' },
  ];

  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    const active = i <= phase + 1;
    K.draw3dBox(ctx, st.x, floorY, 108, st.h, 34, {
      col: active ? st.col : K.PAL.muted,
      label: st.lbl,
      a: active ? 1 : 0.45,
    });
  }

  // Left comparison: Shrinking -1% block on far left
  K.draw3dBox(ctx, 165, floorY, 115, phase >= 1 ? 58 : 74, 30, {
    col: K.PAL.coral, label: '-1%', subLabel: '0,03x',
  });

  // 3D Ball-Joint Mannequin Stickman climbing the 3D staircase!
  const stepIdx = Math.min(4, phase + 1);
  const curStep = steps[stepIdx];
  K.mannequin3DStickman(ctx, curStep.x, floorY - curStep.h, phase === 3 ? 'victory' : 'climb', {
    facing: 1, col: phase === 3 ? K.PAL.gold : K.PAL.cyan, t,
  });

  // Lower Section Cards
  if (phase === 0) {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'KESALAHAN UMUM PERUBAHAN DIRI',
      titleStr: 'Mengincar Lompatan Drastis Lalu Burnout di Minggu Pertama',
      subStr: 'Otak menolak perubahan mendadak yang terlalu berat bagi rutinitas harian',
      stat: 'GAGAL',
      statSub: 'AMBISI SESAAT',
      col: K.PAL.coral,
      a: pop(t, C.hook.start + 0.2),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'PRINSIP ATOMIC HABITS (JAMES CLEAR)',
      titleStr: 'Perbaikan 1% Setiap Hari Terasa Ringan Tanpa Beban',
      subStr: 'Mulai dari langkah yang sangat mudah hingga tidak ada alasan untuk menunda',
      stat: '+1% / HARI',
      statSub: 'LANGKAH MIKRO',
      col: K.PAL.cyan,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'RUMUS EKSPONENSIAL 365 HARI',
      titleStr: '1,01 Pangkat 365 = 37,78 Kali Lipat Lebih Unggul',
      subStr: 'Bunga majemuk tidak hanya berlaku pada uang, tetapi juga pada keahlian',
      stat: '37,78x',
      statSub: 'NAIK EKSPONENSIAL',
      col: K.PAL.emerald,
      a: pop(t, C.matematika.start),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'BAHAYA KEMUNDURAN KECIL (-1%)',
      titleStr: '0,99 Pangkat 365 = Menyusut Tersisa 0,03 (3%)',
      subStr: 'Menunda sedikit demi sedikit setiap hari menggerus potensi tanpa disadari',
      stat: '0,03x',
      statSub: 'TERGERUS HABIS',
      col: K.PAL.coral,
      a: pop(t, C.turun.start),
    });
  } else if (phase === 2) {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'FASE KRITIS: VALLEY OF DISAPPOINTMENT',
      titleStr: 'Bulan Pertama Adalah Fase Paling Rawan Menyerah',
      subStr: 'Kita berharap hasil naik lurus, padahal kurva pertumbuhan bersifat melengkung',
      stat: 'SABAR',
      statSub: 'FASE AKUMULASI',
      col: K.PAL.gold,
      a: pop(t, C.lembah.start),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'ANALOGI ES BATU MENCAIR PADA 0°C',
      titleStr: 'Dari -5°C ke -1°C Belum Cair, Namun Energi Terkumpul',
      subStr: 'Derajat terakhir yang mencairkan es dibangun oleh seluruh derajat sebelumnya',
      stat: '0°C',
      statSub: 'TITIK TEROBOSAN',
      col: K.PAL.cyan,
      a: pop(t, C.es.start),
    });
  } else {
    K.world3dCard(ctx, 540, 995, 960, 175, {
      tag: 'SISTEM KEBIASAAN vs TARGET SEMATA',
      titleStr: 'Kita Jatuh ke Level Sistem Kita, Bukan Naik ke Target',
      subStr: 'Bangun rutinitas harian yang otomatis membawa kakimu naik satu anak tangga',
      stat: 'SISTEM',
      statSub: 'RUTINITAS PASTI',
      col: K.PAL.emerald,
      a: pop(t, C.sistem.start),
    });
    K.world3dCard(ctx, 540, 1210, 960, 175, {
      tag: 'AKSI HARI INI DI DUNIA NYATA',
      titleStr: '2 Halaman Buku • 5 Menit Rapikan Meja • 10 Menit Jalan',
      subStr: 'Biarkan waktu menjadi sekutu terbaikmu lewat konsistensi tanpa putus',
      stat: 'MULAI 1%',
      statSub: 'KONSISTENSI',
      col: K.PAL.gold,
      a: pop(t, C.praktik.start),
    });
  }
}
