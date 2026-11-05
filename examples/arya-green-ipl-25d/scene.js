// ARYA GREEN IPL — Version 1: Modern Explainer 2.5D
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
  else if (t >= C.bendahara?.start) beat = 5;
  else if (t >= C.botwa?.start) beat = 4;
  else if (t >= C.kas?.start) beat = 3;
  else if (t >= C.qris?.start) beat = 2;
  else if (t >= C.tagihan?.start) beat = 1;

  // 2. Studio Dark Background with Ambient Glow
  studioBg(ctx, { width: 1080, height: 1920, t });

  // 3. Top Header Badge
  topHeader25D(ctx, 'ARYA GREEN IPL', 'Sistem Manajemen IPL Digital Modern', { col: PAL.emerald });

  // 4. Dynamic 3D Camera Controls
  let camPitch = 0.36 + Math.sin(t * 0.4) * 0.03;
  let camYaw = Math.sin(t * 0.3) * 0.05;
  let camY = -230;
  let camZ = -720;
  let camFov = 960;

  if (beat === 0) {
    camPitch = 0.40;
    camYaw = Math.sin(t * 5) * 0.03;
  } else if (beat === 1) {
    // Exploded units camera
    camY = -260;
    camPitch = 0.38;
  } else if (beat === 2) {
    // QRIS scan focus
    camY = -210;
    camZ = -680;
  } else if (beat === 3) {
    // Cash ledger charts
    camY = -220;
    camPitch = 0.34;
  } else if (beat === 4) {
    // WhatsApp smartphone mockup
    camY = -240;
    camZ = -700;
  } else if (beat === 5) {
    // Treasurer Excel dashboard
    camY = -230;
    camPitch = 0.35;
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

  // 6. Central 2.5D World Visuals
  if (beat === 0) {
    // Beat 0: Chaos of Manual Paper Notebook & Crumpled Receipts
    const wob = Math.sin(t * 6) * 10;
    extrudedSlab25D(ctx, cam, {
      cx: wob - 50,
      cy: 40,
      cz: 160,
      w: 380,
      h: 40,
      d: 260,
      topCol: '#78350f',
      frontCol: '#451a03',
      sideCol: '#290e02',
      borderCol: '#ef4444',
      glow: true,
      label: 'BUKU TULIS IURAN KUSUT',
      labelCol: '#ffffff',
      stat: 'RAWAN SELISIH',
      statCol: '#fca5a5'
    });

    extrudedSlab25D(ctx, cam, {
      cx: -wob + 80,
      cy: -30,
      cz: 220,
      w: 260,
      h: 30,
      d: 180,
      topCol: '#991b1b',
      frontCol: '#7f1d1d',
      sideCol: '#450a0a',
      borderCol: '#ef4444',
      label: 'STRUK TRANSFER TERCECER',
      stat: 'NAGIH PINTU KE PINTU',
      statCol: '#fecaca'
    });
  } else if (beat === 1) {
    // Beat 1: Exploded Stack of House Units & Cost Components
    const unitLayers = [
      { title: 'Tipe 36 / 72 (Unit Standar)', stat: 'IPL RP150.000', color: PAL.emerald, lift: 85, w: 460, d: 290, h: 48 },
      { title: 'Tipe 45 / 84 (Unit Menengah)', stat: 'IPL RP175.000', color: PAL.cyan, lift: 85, w: 380, d: 240, h: 48 },
      { title: 'Tipe 60+ (Unit Khusus)', stat: 'IPL RP200.000', color: PAL.indigo, lift: 85, w: 300, d: 190, h: 48 }
    ];

    explodedStack25D(ctx, cam, {
      cx: 0,
      baseY: 140,
      cz: 200,
      layers: unitLayers,
      spread: 1.0 + Math.sin(t * 2) * 0.08,
      activeIndex: 0
    });
  } else if (beat === 2) {
    // Beat 2: 2.5D Dynamic QRIS & Zero Transfer Fee
    extrudedSlab25D(ctx, cam, {
      cx: 0,
      cy: -80,
      cz: 130,
      w: 420,
      h: 45,
      d: 320,
      topCol: '#064e3b',
      frontCol: '#022c22',
      sideCol: '#011c15',
      borderCol: PAL.emerald,
      glow: true,
      label: 'SCAN DARI SEMUA BANK & E-WALLET',
      labelCol: '#ffffff',
      stat: 'BEBAS BIAYA TRANSFER',
      statCol: '#34d399'
    });

    // QR Code Square on Top Face
    const pQR = project3D(0, -125, 130, cam);
    if (pQR.visible) {
      const qsc = pQR.scale;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(pQR.x - 65 * qsc, pQR.y - 65 * qsc, 130 * qsc, 130 * qsc, 12 * qsc);
      ctx.fill();

      // QR patterns simulation
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(pQR.x - 50 * qsc, pQR.y - 50 * qsc, 35 * qsc, 35 * qsc);
      ctx.fillRect(pQR.x + 15 * qsc, pQR.y - 50 * qsc, 35 * qsc, 35 * qsc);
      ctx.fillRect(pQR.x - 50 * qsc, pQR.y + 15 * qsc, 35 * qsc, 35 * qsc);
      ctx.fillStyle = PAL.emerald;
      ctx.fillRect(pQR.x - 10 * qsc, pQR.y - 10 * qsc, 20 * qsc, 20 * qsc);
      ctx.restore();
    }
  } else if (beat === 3) {
    // Beat 3: 2.5D Real-time Cashbook & Auto-entry
    const cashSlabs = [
      { title: 'Saldo Kas Masuk IPL (Auto-Entry)', stat: 'PEMASUKAN BULAN INI', color: PAL.emerald, lift: 85, w: 460, d: 280, h: 48 },
      { title: 'Pengeluaran Taman & Pos Keamanan', stat: 'APPROVAL RESMI RT', color: PAL.blue, lift: 85, w: 380, d: 230, h: 48 },
      { title: 'Laporan Rekapitulasi Pembayaran', stat: 'SELISIH 0% KLOP', color: PAL.purple, lift: 85, w: 300, d: 180, h: 48 }
    ];

    explodedStack25D(ctx, cam, {
      cx: 0,
      baseY: 140,
      cz: 200,
      layers: cashSlabs,
      spread: 0.95,
      activeIndex: 0
    });
  } else if (beat === 4) {
    // Beat 4: Smartphone with 6 WhatsApp Bot Features
    extrudedSlab25D(ctx, cam, {
      cx: 0,
      cy: -60,
      cz: 130,
      w: 480,
      h: 40,
      d: 340,
      topCol: '#064e3b',
      frontCol: '#022c22',
      sideCol: '#011c15',
      borderCol: '#25d366',
      glow: true,
      label: 'WHATSAPP AI ASSISTANT (HERMES)',
      labelCol: '#ffffff',
      stat: '6 FITUR BOT TERPADU',
      statCol: '#25d366'
    });

    // Chat bubble pills projected in 3D
    const bPos = project3D(0, -110, 130, cam);
    if (bPos.visible) {
      const bsc = bPos.scale;
      ctx.save();
      const features = [
        '✔ Kenali Suami-Istri Otomatis',
        '✔ Cek Tagihan & Riwayat',
        '✔ Minta QRIS Dinamis Instan',
        '✔ Cek Saldo & Transparansi Kas',
        '✔ Lapor Aduan Fasilitas',
        '✔ Info Agenda Rapat RT'
      ];
      ctx.font = `800 ${Math.round(16 * bsc)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'left';
      features.forEach((feat, idx) => {
        const fy = bPos.y - 50 * bsc + idx * 24 * bsc;
        ctx.fillStyle = idx % 2 === 0 ? '#22c55e' : '#38bdf8';
        ctx.fillText(feat, bPos.x - 170 * bsc, fy);
      });
      ctx.restore();
    }
  } else if (beat === 5) {
    // Beat 5: Special Treasurer Control Hub (Export Excel)
    extrudedSlab25D(ctx, cam, {
      cx: 0,
      cy: -70,
      cz: 130,
      w: 460,
      h: 45,
      d: 300,
      topCol: '#166534',
      frontCol: '#14532d',
      sideCol: '#052e16',
      borderCol: PAL.emerald,
      glow: true,
      label: '1-KLIK EXPORT EXCEL (.XLSX)',
      labelCol: '#ffffff',
      stat: 'PANEL KHUSUS BENDAHARA',
      statCol: '#86efac'
    });

    extrudedSlab25D(ctx, cam, {
      cx: 0,
      cy: 40,
      cz: 170,
      w: 400,
      h: 35,
      d: 220,
      topCol: '#1e293b',
      frontCol: '#0f172a',
      sideCol: '#090d16',
      borderCol: '#38bdf8',
      label: 'REKAP TUNGGAKAN OTOMATIS',
      stat: 'VERIFIKASI INSTAN',
      statCol: '#38bdf8'
    });
  } else if (beat === 6) {
    // Beat 6: Interactive Quiz
    interactiveQuiz25D(ctx, cam, {
      cx: 0,
      cy: -180,
      cz: 130,
      title: 'Apa penyebab utama kas RT sering dicurigai warga?',
      options: [
        { text: 'A. Laporan Manual Tidak Transparan' },
        { text: 'B. Kwitansi Pembayaran Sering Tercecer' },
        { text: 'C. Semua Jawaban di Atas Benar' }
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
      title: 'Apa penyebab utama kas RT sering dicurigai warga?',
      options: [
        { text: 'A. Laporan Manual Tidak Transparan' },
        { text: 'B. Kwitansi Pembayaran Sering Tercecer' },
        { text: 'C. Semua Jawaban di Atas Benar' }
      ],
      selected: 2, // C is correct!
      revealAnswer: true,
      timerProgress: 1.0
    });
  }

  // 7. Center Narrative Box (Karaoke Card at y: 1100)
  const karaokeData = [
    {
      lines: ['Masih nagih iuran warga', 'pakai buku tulis kusut?'],
      highlights: ['buku tulis kusut?'],
      tag: 'MASALAH IURAN TRADISIONAL'
    },
    {
      lines: ['Tagihan dibuat otomatis,', 'lengkap rincian biaya IPL.'],
      highlights: ['dibuat otomatis'],
      tag: 'FITUR 1 — TAGIHAN MASSAL'
    },
    {
      lines: ['1-klik scan QRIS dinamis,', 'bebas biaya transfer bank!'],
      highlights: ['bebas biaya transfer!'],
      tag: 'FITUR 2 — QRIS DINAMIS INSTAN'
    },
    {
      lines: ['Otomatis masuk buku kas,', 'arus kas transparan 24/7.'],
      highlights: ['transparan 24/7'],
      tag: 'FITUR 3 — BUKU KAS REAL-TIME'
    },
    {
      lines: ['Bot AI WhatsApp & PWA:', 'cek tagihan hingga aduan warga!'],
      highlights: ['Bot AI WhatsApp'],
      tag: 'FITUR 4 — CHATBOT MULTIFUNGSI'
    },
    {
      lines: ['Bendahara bebas pusing:', 'verifikasi 1-klik & export Excel.'],
      highlights: ['export Excel'],
      tag: 'FITUR 5 — PANEL KHUSUS BENDAHARA'
    },
    {
      lines: ['Kuis: kenapa kas RT sering', 'dicurigai oleh para warga?'],
      highlights: ['kas RT dicurigai'],
      tag: 'KUIS LINGKUNGAN 2.5D'
    },
    {
      lines: ['Jawabannya C: semua benar!', 'Modernisasi perumahanmu sekarang.'],
      highlights: ['C: semua benar!'],
      tag: 'SOLUSI ARYA GREEN IPL'
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
      tag: 'MASALAH KLASIK',
      title: 'Pengelolaan Manual RT',
      desc: 'Buku catatan hilang dan mutasi bank tercecer memicu konflik warga.',
      stat: 'MANUAL',
      statSub: 'RAWAN RUSAK',
      col: PAL.rose
    },
    {
      start: C.tagihan?.start,
      tag: 'OTOMATISASI TAGIHAN',
      title: 'Tarif Akurat per Tipe',
      desc: 'Rincian transparan untuk satpam keamanan, sampah, dan taman.',
      stat: 'OTOMATIS',
      statSub: 'TIAP BULAN',
      col: PAL.emerald
    },
    {
      start: C.qris?.start,
      tag: 'PEMBAYARAN DIGITAL',
      title: 'QRIS Statis ke Dinamis',
      desc: 'Mendukung semua m-banking & e-wallet tanpa biaya admin transfer.',
      stat: '0 BIAYA',
      statSub: 'TRANSFER BANK',
      col: PAL.emerald
    },
    {
      start: C.kas?.start,
      tag: 'TRANSPARANSI KEUANGAN',
      title: 'Buku Kas & Arus Kas',
      desc: 'Setiap rupiah iuran warga langsung terdata tanpa risiko selisih manual.',
      stat: '100% KLOP',
      statSub: 'REAL-TIME KAS',
      col: PAL.cyan
    },
    {
      start: C.botwa?.start,
      tag: 'INTEGRASI HERMES AI',
      title: 'Asisten WhatsApp Cerdas',
      desc: 'Kenali nomor suami-istri otomatis untuk cek kas, aduan, dan agenda.',
      stat: 'BOT WA',
      statSub: '24 JAM AKTIF',
      col: '#25d366'
    },
    {
      start: C.bendahara?.start,
      tag: 'KEMUDAHAN BENDAHARA',
      title: 'Laporan 1-Klik Excel',
      desc: 'Tidak perlu rekap manual berhari-hari; export format .xlsx langsung beres.',
      stat: '1-KLIK',
      statSub: 'EXPORT EXCEL',
      col: PAL.emerald
    },
    {
      start: C.kuis?.start,
      tag: 'KUIS LINGKUNGAN',
      title: 'Transparansi Kas Warga',
      desc: 'Sistem terbuka menghilangkan kecurigaan dan mempererat kerukunan warga.',
      stat: 'KUIS',
      statSub: 'PILIH A, B, C',
      col: PAL.amber
    },
    {
      start: C.jawaban?.start,
      tag: 'SOLUSI PERUMAHAN',
      title: 'Arya Green Pamulang',
      desc: 'Kunjungi dan gunakan platform manajemen IPL terintegrasi sekarang.',
      stat: 'DIGITAL',
      statSub: 'PENGELOLAAN RT',
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
