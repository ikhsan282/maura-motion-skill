// 81 · ISOMETRIC LOW-POLY 3D — Demo 3: Piramida Keuangan Pribadi
// Full-Screen 1080x1920 (8 Beat Dinamis)

import * as K from '/styles/isometric-lowpoly/kit.js';

const { clamp, lerp, ease } = AM.lib;
const { PAL, toIso, withCamera, isoBackground, isoHeader, isoBlock, isoIsland, isoChar, isoTag, isoCallout } = K;

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
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.tingkat4?.start) beat = 6;
  else if (t >= C.tingkat3?.start) beat = 5;
  else if (t >= C.tingkat2?.start) beat = 4;
  else if (t >= C.tingkat1?.start) beat = 3;
  else if (t >= C.piramida?.start) beat = 2;
  else if (t >= C.masalah?.start) beat = 1;

  // 2. Isometric Background
  isoBackground(ctx, t, { accent: beat >= 2 ? PAL.mint : PAL.coral });

  // 3. Dynamic Camera Panning across Skyscraper
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.15; fx = 520; fy = 840; // Panic debt
  } else if (beat === 2) {
    zoom = 1.05; fx = 540; fy = 820; // Skyscraper emergence
  } else if (beat === 3) {
    zoom = 1.25; fx = 540; fy = 920; // Foundation
  } else if (beat === 4) {
    zoom = 1.25; fx = 540; fy = 840; // Emergency fund vault
  } else if (beat === 5) {
    zoom = 1.25; fx = 540; fy = 780; // Insurance shield
  } else if (beat === 6) {
    zoom = 1.25; fx = 540; fy = 700; // Compound engine penthouse
  } else if (beat === 7) {
    zoom = 1.08; fx = 540; fy = 780; // Full fortress view
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const cx = 540, cy = 840, scale = 40;

    // Floating Island Diorama
    isoIsland(ctx, { cx, cy, scale, w: 9, d: 9, h: 2.2, grassCol: '#064e3b', dirtCol: '#1e293b' });

    if (beat === 0 || beat === 1) {
      // Beat 0 & 1: Vulnerable character on shaky blocks
      isoChar(ctx, 0, 0, 0.1, { cx, cy, scale, pose: 'stand', suitCol: PAL.coral, t });

      // Shaky fragile blocks
      isoBlock(ctx, -1, -1, 0, 2, 2, 0.5, {
        cx, cy, scale,
        topCol: PAL.coral, leftCol: '#dc2626', rightCol: '#b91c1c'
      });

      isoTag(ctx, 0, 0, 2.8, 'FONDASI RAPUH: KAYA SEMU', { cx, cy, scale, col: PAL.coral });

    } else {
      // 3D Financial Skyscraper Rising Floor-by-Floor:

      // Floor 1: Cashflow Base (-3..3, 1.2 high)
      isoBlock(ctx, -2.8, -2.8, 0.1, 5.6, 5.6, 1.2, {
        cx, cy, scale,
        topCol: '#047857', leftCol: '#065f46', rightCol: '#064e3b'
      });
      if (beat === 3) isoTag(ctx, 0, 0, 2.2, 'LANTAI 1: ARUS KAS POSITIF', { cx, cy, scale, col: PAL.mint });

      // Floor 2: Emergency Fund Vault (-2.2..2.2, 1.4 high)
      if (beat >= 4) {
        isoBlock(ctx, -2.0, -2.0, 1.3, 4.0, 4.0, 1.4, {
          cx, cy, scale,
          topCol: PAL.cyan, leftCol: '#0891b2', rightCol: '#0e7490'
        });
        if (beat === 4) isoTag(ctx, 0, 0, 3.8, 'LANTAI 2: DANA DARURAT 6 BULAN', { cx, cy, scale, col: PAL.cyan });
      }

      // Floor 3: Insurance Shield (-1.4..1.4, 1.4 high)
      if (beat >= 5) {
        isoBlock(ctx, -1.4, -1.4, 2.7, 2.8, 2.8, 1.4, {
          cx, cy, scale,
          topCol: PAL.indigo, leftCol: '#4f46e5', rightCol: '#4338ca'
        });
        // Forcefield aura
        const sPt = toIso(0, 0, 4.5, { cx, cy, scale });
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.strokeStyle = PAL.indigo;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sPt.x, sPt.y, 50, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        if (beat === 5) isoTag(ctx, 0, 0, 5.2, 'LANTAI 3: PERISAI ASURANSI', { cx, cy, scale, col: PAL.indigo });
      }

      // Floor 4: Investment Penthouse & Golden Crystal (-0.8..0.8, 1.6 high)
      if (beat >= 6) {
        isoBlock(ctx, -0.8, -0.8, 4.1, 1.6, 1.6, 1.5, {
          cx, cy, scale,
          topCol: PAL.amber, leftCol: '#d97706', rightCol: '#b45309'
        });

        // Golden Crystal on rooftop
        const cpt = toIso(0, 0, 6.2 + Math.sin(t * 3) * 0.1, { cx, cy, scale });
        ctx.fillStyle = PAL.amber;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cpt.x, cpt.y - 18);
        ctx.lineTo(cpt.x + 14, cpt.y);
        ctx.lineTo(cpt.x, cpt.y + 18);
        ctx.lineTo(cpt.x - 14, cpt.y);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        if (beat === 6) isoTag(ctx, 0, 0, 6.8, 'LANTAI 4: ASET PASIF & MAJEMUK', { cx, cy, scale, col: PAL.amber });
      }

      // Prosperous character on balcony
      if (beat >= 6) {
        isoChar(ctx, 1.4, 0, 2.7, { cx, cy, scale, pose: 'stand', suitCol: PAL.mint, t });
      }

      if (beat === 7) {
        isoTag(ctx, 0, 0, 7.2, 'KEMERDEKAAN FINANSIAL', { cx, cy, scale, col: PAL.mint });

        // Orbiting prosperity coins
        for (let c = 0; c < 6; c++) {
          const ang = (c / 6) * Math.PI * 2 + t * 2.5;
          const opt = toIso(Math.cos(ang) * 3.5, Math.sin(ang) * 3.5, 4.0, { cx, cy, scale });
          ctx.fillStyle = PAL.amber;
          ctx.beginPath();
          ctx.arc(opt.x, opt.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  });

  // 5. Header (Standard Isometric Top Banner)
  isoHeader(
    ctx,
    'PERENCANAAN FINANSIAL',
    'PIRAMIDA KEUANGAN PRIBADI',
    'Cara Membangun Benteng Finansial Anti-Runtuh'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'PSIKOLOGI UANG',
      title: 'Gaji Besar Tapi Tetap Cemas?',
      desc: 'Penghasilan tinggi tanpa arsitektur pengelolaan tetap berujung bangkrut.',
      stat: '0%',
      statSub: 'KEAMANAN SEMU',
      col: PAL.coral
    },
    {
      start: C.masalah?.start,
      tag: 'KESALAHAN INVESTOR',
      title: 'Terburu-Buru Ingin Cepat Kaya',
      desc: 'Langsung terjun ke instrumen berisiko tinggi tanpa rem pengaman.',
      stat: 'RISIKO',
      statSub: 'TANPA PERISAI',
      col: PAL.coral
    },
    {
      start: C.piramida?.start,
      tag: 'ARSITEKTUR GEDUNG',
      title: 'Fondasi Bawah Menentukan Kekuatan',
      desc: 'Gedung pencakar langit finansial hanya sekuat lapisan terbawahnya.',
      stat: 'FONDASI',
      statSub: 'KUNCI UTAMA',
      col: PAL.mint
    },
    {
      start: C.tingkat1?.start,
      tag: 'LANTAI SATU: ARUS KAS',
      title: 'Arus Kas Positif Bebas Utang',
      desc: 'Pondasi mutlak: pengeluaran lebih kecil dari gaji dan tanpa cicilan boros.',
      stat: 'CASHFLOW',
      statSub: 'SURPLUS BULANAN',
      col: PAL.mint
    },
    {
      start: C.tingkat2?.start,
      tag: 'LANTAI DUA: DANA DARURAT',
      title: '3-6 Bulan Biaya Hidup',
      desc: 'Cadangan kas likuid di instrumen aman untuk menangkal pemutusan kerja.',
      stat: '6 BULAN',
      statSub: 'BIAYA HIDUP',
      col: PAL.cyan
    },
    {
      start: C.tingkat3?.start,
      tag: 'LANTAI TIGA: ASURANSI',
      title: 'Perisai Proteksi Aset',
      desc: 'Asuransi kesehatan mencegah tabungan belasan tahun tergerus sakit berat.',
      stat: 'PERISAI',
      statSub: 'PROTEKSI MEDIS',
      col: PAL.indigo
    },
    {
      start: C.tingkat4?.start,
      tag: 'LANTAI EMPAT: INVESTASI',
      title: 'Mesin Bunga Majemuk',
      desc: 'Alirkan sisa dana surplus ke indeks pasar modal dan aset produktif.',
      stat: 'MAJEMUK',
      statSub: 'ASET PRODUKTIF',
      col: PAL.amber
    },
    {
      start: C.moral?.start,
      tag: 'KEDAMAIAN HIDUP',
      title: 'Tidur Nyenyak Tanpa Beban',
      desc: 'Kekayaan sejati bukanlah gengsi, melainkan kebebasan dan rasa aman.',
      stat: '100%',
      statSub: 'BEBAS CEMAS',
      col: PAL.mint
    }
  ];

  const currentCallout = callouts[beat] || callouts[0];
  const calloutAlpha = pop(t, currentCallout.start, 0.4);

  isoCallout(ctx, 540, 1485, 960, 165, {
    tag: currentCallout.tag,
    title: currentCallout.title,
    desc: currentCallout.desc,
    stat: currentCallout.stat,
    statSub: currentCallout.statSub,
    col: currentCallout.col,
    a: calloutAlpha
  });
}

