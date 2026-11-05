// 84 · MODERN EXPLAINER 2.5D — Demo 2: Tiga Lapisan Otak Manusia
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
  else if (t >= C.solusi?.start) beat = 5;
  else if (t >= C.pembajakan?.start) beat = 4;
  else if (t >= C.lapisan3?.start) beat = 3;
  else if (t >= C.lapisan2?.start) beat = 2;
  else if (t >= C.lapisan1?.start) beat = 1;

  // 2. Studio Dark Background with Ambient Dust
  studioBg(ctx, { width: 1080, height: 1920, t });

  // 3. Top Header Badge
  topHeader25D(ctx, 'NEUROLOGI 2.5D', 'Model Tiga Lapisan Otak (Triune Brain)', { col: PAL.indigo });

  // 4. Dynamic 3D Camera Controls
  let camPitch = 0.36 + Math.sin(t * 0.4) * 0.03;
  let camYaw = Math.sin(t * 0.3) * 0.06;
  let camY = -230;
  let camZ = -720;
  let camFov = 960;

  if (beat === 0) {
    camPitch = 0.40;
    camYaw = Math.sin(t * 5) * 0.02;
  } else if (beat >= 1 && beat <= 3) {
    camY = -180 - (beat * 30);
  } else if (beat === 4) {
    // Amygdala hijack close-up tilt
    camPitch = 0.44;
    camY = -260;
  } else if (beat === 5) {
    // 5-second rule calm zoom
    camPitch = 0.32;
    camY = -200;
  } else if (beat >= 6) {
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

  // 6. Central 2.5D Brain Layers
  const brainLayers = [
    { title: 'Batang Otak / Otak Reptil (500 Jt Thn)', stat: 'INSTING & SURVIVAL', color: '#f43f5e', lift: 95, w: 460, d: 290, h: 50 },
    { title: 'Sistem Limbik / Otak Mamalia', stat: 'EMOSI & DOPAMIN', color: '#f59e0b', lift: 95, w: 380, d: 240, h: 50 },
    { title: 'Neokorteks / Kulit Otak Berpikir', stat: 'LOGIKA & PERENCANAAN', color: '#06b6d4', lift: 95, w: 300, d: 190, h: 50 }
  ];

  if (beat === 0) {
    // Beat 0: Brain in Conflict (Shaking Layers)
    const wob = Math.sin(t * 8) * 8;
    explodedStack25D(ctx, cam, {
      cx: wob,
      baseY: 140,
      cz: 200,
      layers: brainLayers,
      spread: 0.9,
      activeIndex: 1 // Limbik active (craving distraction)
    });
  } else if (beat >= 1 && beat <= 3) {
    // Sequential highlighting of 3 brain layers
    const activeIdx = beat - 1;
    const spread = 1.0 + Math.sin(t * 2) * 0.08;

    explodedStack25D(ctx, cam, {
      cx: 0,
      baseY: 140,
      cz: 200,
      layers: brainLayers,
      spread,
      activeIndex: activeIdx
    });
  } else if (beat === 4) {
    // Beat 4: Amygdala Hijack (Limbic red laser attacking Neocortex)
    explodedStack25D(ctx, cam, {
      cx: 0,
      baseY: 140,
      cz: 200,
      layers: brainLayers,
      spread: 1.15,
      activeIndex: 1
    });

    // Red laser attack pulse from Limbic to Neocortex
    laserConnector3D(ctx, cam,
      { x: 0, y: 140 - 95 * 1.15, z: 200 },
      { x: 0, y: 140 - 190 * 1.15, z: 200 },
      { col: '#ef4444', pulse: true, t }
    );
  } else if (beat === 5) {
    // Beat 5: 5-Second Rule Homeostasis Calm
    explodedStack25D(ctx, cam, {
      cx: 0,
      baseY: 140,
      cz: 200,
      layers: brainLayers,
      spread: 0.85,
      activeIndex: 2 // Neocortex restored to cyan harmony
    });

    // Cyan oxygen flow lines rising
    laserConnector3D(ctx, cam,
      { x: -120, y: 140, z: 200 },
      { x: -80, y: 140 - 190 * 0.85, z: 200 },
      { col: PAL.emerald, pulse: false, t }
    );
    laserConnector3D(ctx, cam,
      { x: 120, y: 140, z: 200 },
      { x: 80, y: 140 - 190 * 0.85, z: 200 },
      { col: PAL.emerald, pulse: false, t }
    );
  } else if (beat === 6) {
    // Beat 6: Quiz
    interactiveQuiz25D(ctx, cam, {
      cx: 0,
      cy: -180,
      cz: 130,
      title: 'Berapa persen energi tubuh yang diserap oleh otak?',
      options: [
        { text: 'A. 20% Total Kalori Tubuh' },
        { text: 'B. 5% Saja Karena Ukurannya Kecil' },
        { text: 'C. 50% Lebih Dari Separuh Tubuh' }
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
      title: 'Berapa persen energi tubuh yang diserap oleh otak?',
      options: [
        { text: 'A. 20% Total Kalori Tubuh' },
        { text: 'B. 5% Saja Karena Ukurannya Kecil' },
        { text: 'C. 50% Lebih Dari Separuh Tubuh' }
      ],
      selected: 0,
      revealAnswer: true,
      timerProgress: 1.0
    });
  }

  // 7. Center Narrative Box (Karaoke Card at y: 1100)
  const karaokeData = [
    {
      lines: ['Mau belajar produktif, tapi', 'otomatis buka media sosial?'],
      highlights: ['buka media sosial?'],
      tag: 'KONFLIK TIGA LAPISAN OTAK'
    },
    {
      lines: ['Lapisan 1: otak reptil purba,', 'atur napas & insting otomatis.'],
      highlights: ['otak reptil'],
      tag: 'LEVEL 1 — BATANG OTAK'
    },
    {
      lines: ['Lapisan 2: sistem limbik,', 'pusat emosi & dopamin instan.'],
      highlights: ['sistem limbik'],
      tag: 'LEVEL 2 — OTAK MAMALIA'
    },
    {
      lines: ['Lapisan 3: neokorteks modern,', 'logika & rencana masa depan.'],
      highlights: ['neokorteks modern'],
      tag: 'LEVEL 3 — PREFRONTAL CORTEX'
    },
    {
      lines: ['Saat stres, amigdala membajak', 'logika dalam 0.1 detik!'],
      highlights: ['amigdala membajak'],
      tag: 'AMYGDALA HIJACK'
    },
    {
      lines: ['Aturan jeda 5 detik: alirkan', 'oksigen kembali ke logika.'],
      highlights: ['jeda 5 detik'],
      tag: 'TRIK REGULASI KOGNITIF'
    },
    {
      lines: ['Kuis: berapa persen energi', 'tubuh yang diserap otak?'],
      highlights: ['berapa persen'],
      tag: 'KUIS ENERGI METABOLISME'
    },
    {
      lines: ['Jawabannya A: 20% energi!', 'Berpikir keras itu menyedot kalori.'],
      highlights: ['A: 20% energi!'],
      tag: 'FAKTA NEUROSAINS'
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
      tag: 'PARADOKS KEMAUAN',
      title: 'Perang di Dalam Kepala',
      desc: 'Konflik konstan antara dorongan kenyamanan instan vs rencana jangka panjang.',
      stat: '3 LAPISAN',
      statSub: 'TRIUNE BRAIN',
      col: PAL.rose
    },
    {
      start: C.lapisan1?.start,
      tag: 'INSTING DASAR',
      title: 'Batang Otak Reptilian',
      desc: 'Bekerja 24 jam nonstop tanpa sadar: detak jantung, tekanan darah, dan refleks.',
      stat: '500 JT THN',
      statSub: 'USIA EVOLUSI',
      col: '#f43f5e'
    },
    {
      start: C.lapisan2?.start,
      tag: 'PUSAT EMOSI',
      title: 'Sistem Limbik & Amigdala',
      desc: 'Selalu memilih rasa aman dan kenikmatan dopamin cepat (scroll ponsel, rebahan).',
      stat: 'DOPAMIN',
      statSub: 'KENIKMATAN',
      col: PAL.amber
    },
    {
      start: C.lapisan3?.start,
      tag: 'PUSAT KENDALI',
      title: 'Neokorteks Manusia',
      desc: 'Membedakan manusia dengan hewan: kemampuan menunda kepuasan (delayed gratification).',
      stat: 'LOGIKA',
      statSub: 'BERPIKIR KRITIS',
      col: PAL.cyan
    },
    {
      start: C.pembajakan?.start,
      tag: 'NEUROKIMIA',
      title: 'Pembajakan Amigdala',
      desc: 'Kortisol dan adrenalin melumpuhkan prefrontal cortex hingga logika mati sesaat.',
      stat: '0.1 DETIK',
      statSub: 'REAKSI CEPAT',
      col: PAL.rose
    },
    {
      start: C.solusi?.start,
      tag: 'TRIK HACKING',
      title: 'Aturan 5 Detik Mel Robbins',
      desc: 'Hitung mundur 5-4-3-2-1 memaksa otak sadar mengambil alih kendali tubuh.',
      stat: '5 DETIK',
      statSub: 'RESET LOGIKA',
      col: PAL.emerald
    },
    {
      start: C.kuis?.start,
      tag: 'KUIS ENERGI',
      title: 'Konsumsi Kalori Otak',
      desc: 'Meskipun hanya 1.4 kg, otak manusia adalah konsumen glukosa nomor satu tubuh.',
      stat: 'KUIS',
      statSub: 'PILIH A, B, C',
      col: PAL.amber
    },
    {
      start: C.jawaban?.start,
      tag: 'FAKTA METABOLIK',
      title: 'Konsumsi 20% Energi',
      desc: 'Neokorteks menyedot seperlima oksigen dan gula darah harian untuk berpikir.',
      stat: '20% ENERGI',
      statSub: 'TOTAL KALORI',
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

