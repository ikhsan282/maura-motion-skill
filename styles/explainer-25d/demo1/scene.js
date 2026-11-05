// 84 · MODERN EXPLAINER 2.5D — Demo 1: Piramida Keuangan Pribadi
// Full-Screen 1080x1920 (8 Beat Dinamis)

import * as K from '/styles/explainer-25d/kit.js';

const { clamp, lerp, ease } = AM.lib;
const {
  PAL,
  createCamera,
  project3D,
  studioBg,
  perspectiveGrid,
  extrudedSlab25D,
  explodedStack25D,
  laserConnector3D,
  stepCard25D,
  interactiveQuiz25D,
  karaokeCard25D,
  explainerCallout,
  topHeader25D
} = K;

export const meta = {
  fps: 30,
  width: 1080,
  height: 1920,
  captions: { preset: 'clean', y: 1700, size: 48 }
};

let ctx;
const C = {};
const pop = (t, a, d = 0.45) => ease.outBack(clamp((t - a) / d), 1.7);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);

  // 1. Determine Current Beat (8 Beats)
  let beat = 0;
  if (t >= C.jawaban?.start) beat = 7;
  else if (t >= C.kuis?.start) beat = 6;
  else if (t >= C.level5?.start) beat = 5;
  else if (t >= C.level4?.start) beat = 4;
  else if (t >= C.level3?.start) beat = 3;
  else if (t >= C.level2?.start) beat = 2;
  else if (t >= C.level1?.start) beat = 1;

  // 2. Studio Dark Background with Ambient Dust
  studioBg(ctx, { width: 1080, height: 1920, t });

  // 3. Top Header Badge
  topHeader25D(ctx, 'FINANSIAL 2.5D', 'Hierarki Pondasi Kekayaan Pribadi', { col: PAL.cyan });

  // 4. Dynamic 3D Camera Controls
  let camPitch = 0.38 + Math.sin(t * 0.4) * 0.03;
  let camYaw = Math.sin(t * 0.3) * 0.06;
  let camY = -240;
  let camZ = -720;
  let camFov = 960;

  if (beat === 0) {
    // Shaking alert camera
    camPitch = 0.42;
    camYaw = Math.sin(t * 8) * 0.03;
  } else if (beat >= 1 && beat <= 5) {
    // Elevating camera matching active layer
    camY = -200 - (beat * 25);
    camPitch = 0.34 + (beat * 0.02);
  } else if (beat >= 6) {
    // Quiz focus
    camPitch = 0.30;
    camZ = -680;
  }

  const cam = createCamera({
    pitch: camPitch,
    yaw: camYaw,
    y: camY,
    z: camZ,
    fov: camFov,
    cx: 540,
    cy: 680
  });

  // 5. 2.5D Perspective Grid Plane
  perspectiveGrid(ctx, cam, {
    floorY: 170,
    minX: -900,
    maxX: 900,
    minZ: -200,
    maxZ: 1100,
    stepX: 180,
    stepZ: 130
  });

  // 6. Central 2.5D Object / Exploded Pyramid Hierarchy
  if (beat === 0) {
    // Beat 0: Collapsing Inverted Pyramid
    const wob = Math.sin(t * 6) * 12;
    extrudedSlab25D(ctx, cam, {
      cx: wob,
      cy: -40,
      cz: 180,
      w: 480,
      h: 55,
      d: 260,
      topCol: '#dc2626',
      frontCol: '#991b1b',
      sideCol: '#7f1d1d',
      borderCol: '#ef4444',
      glow: true,
      label: 'SPEKULASI SAHAM & KRIPTO',
      labelCol: '#ffffff',
      stat: 'PONDASI RUNTUH!',
      statCol: '#ffffff'
    });

    extrudedSlab25D(ctx, cam, {
      cx: -wob * 0.5,
      cy: 80,
      cz: 180,
      w: 220,
      h: 45,
      d: 140,
      topCol: '#334155',
      frontCol: '#1e293b',
      sideCol: '#0f172a',
      borderCol: '#ef4444',
      label: 'KAS KOSONG',
      stat: 'UTANG MENUMPUK',
      statCol: '#f87171'
    });
  } else if (beat >= 1 && beat <= 5) {
    // 5-Tier Exploded Pyramid Slabs
    const layers = [
      { title: 'Arus Kas Positif & Bebas Utang', stat: 'LEVEL 1: CASHFLOW', color: PAL.emerald, lift: 85, w: 460, d: 300, h: 48 },
      { title: 'Dana Darurat 3-6 Bulan Cair', stat: 'LEVEL 2: DANA DARURAT', color: PAL.cyan, lift: 85, w: 390, d: 250, h: 48 },
      { title: 'Proteksi Asuransi Kesehatan', stat: 'LEVEL 3: ASURANSI', color: PAL.blue, lift: 85, w: 320, d: 200, h: 48 },
      { title: 'Investasi Pasif Reksadana & SBN', stat: 'LEVEL 4: INVESTASI', color: PAL.purple, lift: 85, w: 250, d: 155, h: 48 },
      { title: 'Aset Spekulatif & Bisnis Baru', stat: 'LEVEL 5: PERTUMBUHAN', color: PAL.amber, lift: 85, w: 180, d: 115, h: 48 }
    ];

    const activeIdx = beat - 1;
    const spread = clamp(0.75 + Math.sin(t * 1.5) * 0.1, 0.5, 1.2);

    explodedStack25D(ctx, cam, {
      cx: 0,
      baseY: 150,
      cz: 200,
      layers,
      spread,
      activeIndex: activeIdx
    });
  } else if (beat === 6) {
    // Beat 6: Interactive Quiz
    interactiveQuiz25D(ctx, cam, {
      cx: 0,
      cy: -180,
      cz: 130,
      title: 'Berapa porsi ideal tabungan menurut aturan 50-30-20?',
      options: [
        { text: 'A. 20% Untuk Tabungan & Investasi' },
        { text: 'B. 50% Untuk Kebutuhan & Tabungan' },
        { text: 'C. 5% Sisa Belanja Konsumtif' }
      ],
      selected: null,
      revealAnswer: false,
      timerProgress: clamp((t - (C.kuis?.start ?? 0)) / ((C.kuis?.duration ?? 8) * 0.85))
    });
  } else if (beat === 7) {
    // Beat 7: Revealed Answer
    interactiveQuiz25D(ctx, cam, {
      cx: 0,
      cy: -180,
      cz: 130,
      title: 'Berapa porsi ideal tabungan menurut aturan 50-30-20?',
      options: [
        { text: 'A. 20% Untuk Tabungan & Investasi' },
        { text: 'B. 50% Untuk Kebutuhan & Tabungan' },
        { text: 'C. 5% Sisa Belanja Konsumtif' }
      ],
      selected: 0,
      revealAnswer: true,
      timerProgress: 1.0
    });
  }

  // 7. Center Narrative Box (Karaoke Card at y: 1100)
  const karaokeData = [
    {
      lines: ['Investasi saham & kripto', 'justru bikin terlilit utang?'],
      highlights: ['terlilit utang?'],
      tag: 'JEBAKAN PIRAMIDA TERBALIK'
    },
    {
      lines: ['Tingkat 1: amankan cashflow', 'dan lunasi utang konsumtif.'],
      highlights: ['amankan cashflow'],
      tag: 'LEVEL 1 — PONDASI KAS'
    },
    {
      lines: ['Tingkat 2: dana darurat cair', '3 sampai 6 bulan rutin.'],
      highlights: ['dana darurat'],
      tag: 'LEVEL 2 — LIKUIDITAS'
    },
    {
      lines: ['Tingkat 3: asuransi proteksi,', 'agar asetmu tidak lenyap!'],
      highlights: ['asuransi proteksi'],
      tag: 'LEVEL 3 — MANAJEMEN RISIKO'
    },
    {
      lines: ['Tingkat 4: investasi pasif,', 'kalahkan inflasi tahunan.'],
      highlights: ['investasi pasif'],
      tag: 'LEVEL 4 — AKUMULASI ASET'
    },
    {
      lines: ['Puncak 5: aset spekulatif,', 'jangan jika bawahnya bolong!'],
      highlights: ['aset spekulatif'],
      tag: 'LEVEL 5 — HIGH RISK HIGH RETURN'
    },
    {
      lines: ['Kuis: menurut rumus 50-30-20,', 'berapa persen untuk tabungan?'],
      highlights: ['berapa persen'],
      tag: 'KUIS ANGGARAN BULANAN'
    },
    {
      lines: ['Jawabannya A: 20% tabungan!', '50% kebutuhan, 30% hiburan.'],
      highlights: ['A: 20% tabungan!'],
      tag: 'FORMULA FINANCIAL FREEDOM'
    }
  ];

  const currentKD = karaokeData[beat] || karaokeData[0];
  karaokeCard25D(ctx, 540, 1100, 920, 220, {
    lines: currentKD.lines,
    highlights: currentKD.highlights,
    tag: currentKD.tag
  });

  // 8. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'KESALAHAN FATAL',
      title: 'Piramida Terbalik',
      desc: 'Mengejar keuntungan instan tanpa memiliki bantalan kas yang kuat.',
      stat: '80% GAGAL',
      statSub: 'TANPA PONDASI',
      col: PAL.rose
    },
    {
      start: C.level1?.start,
      tag: 'PONDASI UTAMA',
      title: 'Cashflow Bersih Positif',
      desc: 'Bunga kartu kredit & pinjol 20-30% memakan hasil investasimu seketika.',
      stat: 'BEBAS UTANG',
      statSub: 'BUNGA TINGGI',
      col: PAL.emerald
    },
    {
      start: C.level2?.start,
      tag: 'JARING PENGAMAN',
      title: 'Dana Darurat Likuid',
      desc: 'Tersimpan di reksadana pasar uang atau tabungan tanpa risiko fluktuasi.',
      stat: '3-6 BULAN',
      statSub: 'BIAYA HIDUP',
      col: PAL.cyan
    },
    {
      start: C.level3?.start,
      tag: 'BENTENG PERTAHANAN',
      title: 'Proteksi Risiko Kesehatan',
      desc: 'Biaya rawat inap rumah sakit adalah penyebab no. 1 kebangkrutan mendadak.',
      stat: 'PROTEKSI',
      statSub: 'ASET UTUH',
      col: PAL.blue
    },
    {
      start: C.level4?.start,
      tag: 'COMPOUND INTEREST',
      title: 'Pertumbuhan Majemuk',
      desc: 'Indeks saham & SBN memberi imbal hasil stabil mengalahkan laju inflasi.',
      stat: 'PASIF',
      statSub: 'JANGKA PANJANG',
      col: PAL.purple
    },
    {
      start: C.level5?.start,
      tag: 'ALOKASI MODAL',
      title: 'Puncak Risiko Tinggi',
      desc: 'Maksimal 5-10% dari total kekayaan untuk aset berfluktuasi ekstrem.',
      stat: 'MAKS 10%',
      statSub: 'MODAL DINGIN',
      col: PAL.amber
    },
    {
      start: C.kuis?.start,
      tag: 'KUIS ANGGARAN',
      title: 'Aturan 50 / 30 / 20',
      desc: 'Berapa porsi gajimu yang seharusnya dialokasikan untuk masa depan?',
      stat: 'KUIS',
      statSub: 'PILIH A, B, C',
      col: PAL.amber
    },
    {
      start: C.jawaban?.start,
      tag: 'FORMULA 50/30/20',
      title: 'Alokasi Elizabeth Warren',
      desc: '50% kebutuhan pokok, 30% keinginan pribadi, 20% masa depan.',
      stat: '20% INVESTASI',
      statSub: 'IDEAL BUDGET',
      col: PAL.emerald
    }
  ];

  const currentCallout = callouts[beat] || callouts[0];
  const calloutAlpha = pop(t, currentCallout.start, 0.4);

  explainerCallout(ctx, 540, 1485, 960, 165, {
    tag: currentCallout.tag,
    title: currentCallout.title,
    desc: currentCallout.desc,
    stat: currentCallout.stat,
    statSub: currentCallout.statSub,
    col: currentCallout.col,
    a: calloutAlpha
  });
}

