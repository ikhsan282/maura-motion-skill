// 84 · MODERN EXPLAINER 2.5D — Demo 3: Algoritma Rekomendasi AI
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
  else if (t >= C.delivery?.start) beat = 5;
  else if (t >= C.layer4?.start) beat = 4;
  else if (t >= C.layer3?.start) beat = 3;
  else if (t >= C.layer2?.start) beat = 2;
  else if (t >= C.layer1?.start) beat = 1;

  // 2. Studio Dark Background with Ambient Dust
  studioBg(ctx, { width: 1080, height: 1920, t });

  // 3. Top Header Badge
  topHeader25D(ctx, 'DATA SCIENCE 2.5D', 'Arsitektur Rekomendasi 4 Layer AI', { col: PAL.cyan });

  // 4. Dynamic 3D Camera Controls
  let camPitch = 0.36 + Math.sin(t * 0.4) * 0.03;
  let camYaw = Math.sin(t * 0.3) * 0.06;
  let camY = -230;
  let camZ = -720;
  let camFov = 960;

  if (beat === 0) {
    camPitch = 0.40;
    camYaw = Math.sin(t * 4) * 0.04;
  } else if (beat >= 1 && beat <= 4) {
    camY = -170 - (beat * 28);
  } else if (beat === 5) {
    // Ultra fast delivery pulse
    camPitch = 0.32;
    camY = -210;
    camZ = -660;
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

  // 6. Central 2.5D AI Recommendation Stack
  const aiLayers = [
    { title: 'Sinyal Watch Time, Loop & Scroll', stat: 'LAYER 1: RAW SIGNALS', color: PAL.cyan, lift: 85, w: 460, d: 290, h: 48 },
    { title: 'Vektor Koordinat Topik & Audio', stat: 'LAYER 2: EMBEDDING 3D', color: PAL.blue, lift: 85, w: 380, d: 240, h: 48 },
    { title: 'Pencocokan Kluster Jutaan Profil', stat: 'LAYER 3: COLLABORATIVE', color: PAL.indigo, lift: 85, w: 300, d: 190, h: 48 },
    { title: 'Prediksi Skor Probabilitas Klik', stat: 'LAYER 4: RANKING MODEL', color: PAL.emerald, lift: 85, w: 220, d: 140, h: 48 }
  ];

  if (beat === 0) {
    // Beat 0: Cloud of floating video blocks
    for (let i = 0; i < 7; i++) {
      const bx = ((i - 3) * 130) + Math.sin(t * 2 + i) * 15;
      const bz = 180 + (i % 2) * 80;
      const by = 80 - (i % 3) * 45;
      extrudedSlab25D(ctx, cam, {
        cx: bx,
        cy: by,
        cz: bz,
        w: 90,
        h: 28,
        d: 70,
        topCol: '#334155',
        frontCol: '#1e293b',
        sideCol: '#0f172a',
        borderCol: PAL.cyan,
        stat: `VID ${i + 1}`,
        statCol: PAL.cyan
      });
    }
  } else if (beat >= 1 && beat <= 4) {
    // 4-Layer Sequential Highlighting
    const activeIdx = beat - 1;
    const spread = 0.95 + Math.sin(t * 1.5) * 0.08;

    explodedStack25D(ctx, cam, {
      cx: 0,
      baseY: 140,
      cz: 200,
      layers: aiLayers,
      spread,
      activeIndex: activeIdx
    });
  } else if (beat === 5) {
    // Beat 5: Feed Delivery (<50ms delivery shockwave)
    explodedStack25D(ctx, cam, {
      cx: 0,
      baseY: 140,
      cz: 200,
      layers: aiLayers,
      spread: 0.85,
      activeIndex: 3
    });

    // Vertical delivery lightning laser to screen
    laserConnector3D(ctx, cam,
      { x: 0, y: 140 - 85 * 3 * 0.85, z: 200 },
      { x: 0, y: -260, z: -100 },
      { col: PAL.emerald, pulse: true, t }
    );
  } else if (beat === 6) {
    // Beat 6: Quiz
    interactiveQuiz25D(ctx, cam, {
      cx: 0,
      cy: -180,
      cz: 130,
      title: 'Metrik apa yang diberi bobot skor tertinggi oleh AI video?',
      options: [
        { text: 'A. Completion Rate & Replay Loop' },
        { text: 'B. Jumlah Tombol Like' },
        { text: 'C. Resolusi Video 4K' }
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
      title: 'Metrik apa yang diberi bobot skor tertinggi oleh AI video?',
      options: [
        { text: 'A. Completion Rate & Replay Loop' },
        { text: 'B. Jumlah Tombol Like' },
        { text: 'C. Resolusi Video 4K' }
      ],
      selected: 0,
      revealAnswer: true,
      timerProgress: 1.0
    });
  }

  // 7. Center Narrative Box (Karaoke Card at y: 1100)
  const karaokeData = [
    {
      lines: ['Miliaran video di internet,', 'mengapa feed pas seleramu?'],
      highlights: ['pas seleramu?'],
      tag: 'MISTERI ALGORITMA REKOMENDASI'
    },
    {
      lines: ['Layer 1: kumpulkan sinyal,', 'watch time & detik skip.'],
      highlights: ['watch time'],
      tag: 'LAYER 1 — BEHAVIORAL SIGNALS'
    },
    {
      lines: ['Layer 2: ruang vektor 2.5D,', 'ubah minat jadi koordinat.'],
      highlights: ['ruang vektor'],
      tag: 'LAYER 2 — VECTOR EMBEDDING'
    },
    {
      lines: ['Layer 3: collaborative filter,', 'cocokkan jutaan profil serupa.'],
      highlights: ['collaborative filter'],
      tag: 'LAYER 3 — CLUSTERING'
    },
    {
      lines: ['Layer 4: model prediksi skor,', 'pilih probabilitas tertinggi.'],
      highlights: ['prediksi skor'],
      tag: 'LAYER 4 — NEURAL RANKING'
    },
    {
      lines: ['Seluruh proses miliaran data', 'selesai dalam 50 milidetik!'],
      highlights: ['50 milidetik!'],
      tag: 'ULTRA LOW LATENCY DELIVERY'
    },
    {
      lines: ['Kuis: metrik apa yang', 'diberi bobot paling tinggi?'],
      highlights: ['paling tinggi?'],
      tag: 'KUIS ALGORITMA MEDSOS'
    },
    {
      lines: ['Jawabannya A: completion rate!', 'Tonton habis = sebar 10x luas.'],
      highlights: ['A: completion rate!'],
      tag: 'KUNCI VIRALITAS KONTEN'
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
      tag: 'VOLUME KONTEN',
      title: 'Miliaran Video Harian',
      desc: 'AI menyaring jutaan kandidat konten tiap detik agar relevan dengan minatmu.',
      stat: '500 JAM/MNT',
      statSub: 'UPLOAD BARU',
      col: PAL.cyan
    },
    {
      start: C.layer1?.start,
      tag: 'MICRO SIGNALS',
      title: 'Sinyal Halus Penonton',
      desc: 'Kecepatan scroll dan durasi jeda memberi sinyal lebih akurat daripada tombol like.',
      stat: '100+ FITUR',
      statSub: 'DATA LOG',
      col: PAL.cyan
    },
    {
      start: C.layer2?.start,
      tag: 'VEKTORISASI',
      title: 'Embedding Multi-Dimensi',
      desc: 'Topik memancing, sains, kuliner diubah menjadi jarak Euclidean dalam ruang 2.5D.',
      stat: 'EMBEDDING',
      statSub: 'JARAK VEKTOR',
      col: PAL.blue
    },
    {
      start: C.layer3?.start,
      tag: 'FILTER SOSIAL',
      title: 'Collaborative Filtering',
      desc: 'Jika penonton A & B menyukai 10 video sama, video ke-11 akan direkomendasikan.',
      stat: 'KLUSTER',
      statSub: 'JUTAAN USER',
      col: PAL.indigo
    },
    {
      start: C.layer4?.start,
      tag: 'DEEP LEARNING',
      title: 'Model Ranking Probabilitas',
      desc: 'Menghitung skor p(WatchToEnd) untuk menentukan video terbaik di layarmu.',
      stat: 'SKOR 0.0-1.0',
      statSub: 'RANKING AI',
      col: PAL.emerald
    },
    {
      start: C.delivery?.start,
      tag: 'LATENSI SISTEM',
      title: 'Pengiriman Real-Time',
      desc: 'Model inferensi komputasi awan bekerja secepat kedipan mata manusia.',
      stat: '< 50 MS',
      statSub: 'SUPER CEPAT',
      col: PAL.emerald
    },
    {
      start: C.kuis?.start,
      tag: 'KUIS METRIK',
      title: 'Bobot Algoritma',
      desc: 'Metrik apa yang paling menentukan apakah videomu akan meledak atau tenggelam?',
      stat: 'KUIS',
      statSub: 'PILIH A, B, C',
      col: PAL.amber
    },
    {
      start: C.jawaban?.start,
      tag: 'ALGORITMA REVOLUTION',
      title: 'Completion & Replay Loop',
      desc: 'Menahan penonton hingga detik terakhir adalah kunci utama distribusi viral.',
      stat: 'COMPLETION',
      statSub: 'KUNCI FYP',
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

