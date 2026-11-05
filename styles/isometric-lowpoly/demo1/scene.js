// 81 · ISOMETRIC LOW-POLY 3D — Demo 1: Pabrik Kebiasaan Otomatis
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
  else if (t >= C.stasiun4?.start) beat = 6;
  else if (t >= C.stasiun3?.start) beat = 5;
  else if (t >= C.stasiun2?.start) beat = 4;
  else if (t >= C.stasiun1?.start) beat = 3;
  else if (t >= C.arsitektur?.start) beat = 2;
  else if (t >= C.masalah?.start) beat = 1;

  // 2. Isometric Background
  isoBackground(ctx, t, { accent: beat >= 2 ? PAL.cyan : PAL.coral });

  // 3. Dynamic Camera Panning across 3D Diorama
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.15; fx = 520; fy = 840; // Empty fuel tank
  } else if (beat === 2) {
    zoom = 1.08; fx = 540; fy = 820; // Factory overview
  } else if (beat === 3) {
    zoom = 1.25; fx = 420; fy = 780; // Station 1: Cue
  } else if (beat === 4) {
    zoom = 1.25; fx = 660; fy = 780; // Station 2: Craving
  } else if (beat === 5) {
    zoom = 1.25; fx = 660; fy = 920; // Station 3: Response
  } else if (beat === 6) {
    zoom = 1.25; fx = 420; fy = 920; // Station 4: Reward
  } else if (beat === 7) {
    zoom = 1.12; fx = 540; fy = 840; // Automated factory victory
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const cx = 540, cy = 820, scale = 42;

    // Floating Island Foundation
    isoIsland(ctx, { cx, cy, scale, w: 9, d: 9, h: 2.2, grassCol: '#064e3b', dirtCol: '#1e293b' });

    // Conveyor Belt Ring connecting 4 stations
    const beltCol = beat >= 2 ? '#0284c7' : '#334155';
    // North conveyor
    isoBlock(ctx, -3, -3, 0, 6, 0.8, 0.2, { cx, cy, scale, topCol: beltCol, leftCol: '#0f172a', rightCol: '#1e293b' });
    // East conveyor
    isoBlock(ctx, 2.2, -3, 0, 0.8, 6, 0.2, { cx, cy, scale, topCol: beltCol, leftCol: '#0f172a', rightCol: '#1e293b' });
    // South conveyor
    isoBlock(ctx, -3, 2.2, 0, 6, 0.8, 0.2, { cx, cy, scale, topCol: beltCol, leftCol: '#0f172a', rightCol: '#1e293b' });
    // West conveyor
    isoBlock(ctx, -3, -3, 0, 0.8, 6, 0.2, { cx, cy, scale, topCol: beltCol, leftCol: '#0f172a', rightCol: '#1e293b' });

    // 4 Modular Production Stations
    // Station 1: CUE / PEMICU (Top Left: -3, -3)
    const s1Pulse = beat === 3 ? 1.0 + 0.15 * Math.sin(t * 8) : 1.0;
    isoBlock(ctx, -3.2, -3.2, 0.2, 1.8 * s1Pulse, 1.8 * s1Pulse, 2.0, {
      cx, cy, scale,
      topCol: beat >= 3 ? PAL.cyan : '#475569',
      leftCol: '#0891b2',
      rightCol: '#0e7490'
    });
    // Beacon Light
    const b1Top = toIso(-2.3, -2.3, 2.5, { cx, cy, scale });
    ctx.fillStyle = beat >= 3 ? PAL.cyan : '#64748b';
    ctx.beginPath();
    ctx.arc(b1Top.x, b1Top.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Station 2: CRAVING / KEINGINAN (Top Right: 1.5, -3)
    const s2Pulse = beat === 4 ? 1.0 + 0.15 * Math.sin(t * 8) : 1.0;
    isoBlock(ctx, 1.4, -3.2, 0.2, 1.8 * s2Pulse, 1.8 * s2Pulse, 2.4, {
      cx, cy, scale,
      topCol: beat >= 4 ? PAL.amber : '#475569',
      leftCol: '#d97706',
      rightCol: '#b45309'
    });
    // Dopamine Orb
    const b2Top = toIso(2.3, -2.3, 2.9, { cx, cy, scale });
    ctx.fillStyle = beat >= 4 ? PAL.amber : '#64748b';
    ctx.beginPath();
    ctx.arc(b2Top.x, b2Top.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Station 3: RESPONSE / TINDAKAN (Bottom Right: 1.5, 1.5)
    const s3Pulse = beat === 5 ? 1.0 + 0.15 * Math.sin(t * 8) : 1.0;
    isoBlock(ctx, 1.4, 1.4, 0.2, 1.8 * s3Pulse, 1.8 * s3Pulse, 1.8, {
      cx, cy, scale,
      topCol: beat >= 5 ? PAL.purple : '#475569',
      leftCol: '#7c3aed',
      rightCol: '#6d28d9'
    });

    // Station 4: REWARD / HADIAH (Bottom Left: -3, 1.5)
    const s4Pulse = beat === 6 ? 1.0 + 0.15 * Math.sin(t * 8) : 1.0;
    isoBlock(ctx, -3.2, 1.4, 0.2, 1.8 * s4Pulse, 1.8 * s4Pulse, 2.2, {
      cx, cy, scale,
      topCol: beat >= 6 ? PAL.mint : '#475569',
      leftCol: '#059669',
      rightCol: '#047857'
    });
    // Trophy star
    const b4Top = toIso(-2.3, 2.3, 2.7, { cx, cy, scale });
    ctx.fillStyle = beat >= 6 ? PAL.mint : '#64748b';
    ctx.beginPath();
    ctx.arc(b4Top.x, b4Top.y, 11, 0, Math.PI * 2);
    ctx.fill();

    // Floating Moving Package on Conveyor Belt
    if (beat >= 2) {
      const pProg = (t * 0.8) % 4; // 0..4 steps around the ring
      let px = -2, py = -2.6;
      if (pProg < 1) {
        px = lerp(-2, 2, pProg); py = -2.6;
      } else if (pProg < 2) {
        px = 2.4; py = lerp(-2, 2, pProg - 1);
      } else if (pProg < 3) {
        px = lerp(2, -2, pProg - 2); py = 2.4;
      } else {
        px = -2.6; py = lerp(2, -2, pProg - 3);
      }
      isoBlock(ctx, px - 0.3, py - 0.3, 0.25, 0.6, 0.6, 0.6, {
        cx, cy, scale,
        topCol: PAL.amber, leftCol: '#d97706', rightCol: '#b45309'
      });
    }

    // Low-Poly Character
    if (beat === 0 || beat === 1) {
      // Confused character standing near empty tank
      isoChar(ctx, 0, 0, 0, { cx, cy, scale, pose: 'stand', suitCol: PAL.coral, t });

      // Holographic Alert: Empty Fuel Tank
      isoTag(ctx, 0, 0, 3.2, 'MOTIVASI: 0%', { cx, cy, scale, col: PAL.coral });

    } else if (beat >= 2 && beat <= 6) {
      // Engineer operating the control panel in center
      isoChar(ctx, 0, 0, 0, { cx, cy, scale, pose: 'walk', suitCol: PAL.cyan, t });

      // Holographic Tag over active station
      if (beat === 3) isoTag(ctx, -2.3, -2.3, 3.2, '1. PEMICU (JELAS)', { cx, cy, scale, col: PAL.cyan });
      if (beat === 4) isoTag(ctx, 2.3, -2.3, 3.5, '2. KEINGINAN (MENARIK)', { cx, cy, scale, col: PAL.amber });
      if (beat === 5) isoTag(ctx, 2.3, 2.3, 2.8, '3. RESPON (MUDAH <2 MNT)', { cx, cy, scale, col: PAL.purple });
      if (beat === 6) isoTag(ctx, -2.3, 2.3, 3.4, '4. HADIAH (PUAS SEKETIKA)', { cx, cy, scale, col: PAL.mint });

    } else if (beat === 7) {
      // Victory pose on elevated platform
      isoBlock(ctx, -0.8, -0.8, 0, 1.6, 1.6, 1.0, {
        cx, cy, scale,
        topCol: PAL.mint, leftCol: '#059669', rightCol: '#047857'
      });
      isoChar(ctx, 0, 0, 1.0, { cx, cy, scale, pose: 'stand', suitCol: PAL.mint, t });

      isoTag(ctx, 0, 0, 4.4, 'OTOMATISASI 100%', { cx, cy, scale, col: PAL.mint });

      // Sparkle rings
      for (let s = 0; s < 6; s++) {
        const ang = (s / 6) * Math.PI * 2 + t * 2;
        const sp = toIso(Math.cos(ang) * 3, Math.sin(ang) * 3, 1.5, { cx, cy, scale });
        ctx.fillStyle = PAL.amber;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // 5. Header (Standard Isometric Top Banner)
  isoHeader(
    ctx,
    'ARSITEKTUR PERILAKU',
    'PABRIK KEBIASAAN OTOMATIS',
    'Cara Membangun Rutinitas Tanpa Mengandalkan Motivasi'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'PSIKOLOGI PERILAKU',
      title: 'Kebiasaan Baru vs Kebiasaan Buruk',
      desc: 'Kebiasaan buruk cepat terbentuk karena jalurnya minim gesekan mental.',
      stat: '0%',
      statSub: 'GESEKAN BURUK',
      col: PAL.coral
    },
    {
      start: C.masalah?.start,
      tag: 'JEBAKAN MOTIVASI',
      title: 'Motivasi Itu Bensin Cepat Habis',
      desc: 'Mengandalkan niat saat lelah selalu berakhir dengan kegagalan.',
      stat: '0% SISA',
      statSub: 'TANGKI MOTIVASI',
      col: PAL.coral
    },
    {
      start: C.arsitektur?.start,
      tag: 'HUKUM ATOMIC HABITS',
      title: '4 Mesin Pembentuk Kebiasaan',
      desc: 'Pemicu, Keinginan, Respon, dan Hadiah adalah loop saraf otak.',
      stat: '4 MESIN',
      statSub: 'HABIT LOOP',
      col: PAL.cyan
    },
    {
      start: C.stasiun1?.start,
      tag: 'STASIUN SATU: CUE',
      title: 'Buat Pemicu Terlihat Jelas',
      desc: 'Letakkan pemicu visual tepat di jalur lalu lalang aktivitas harianmu.',
      stat: 'PEMICU',
      statSub: 'VISUAL MENCELOK',
      col: PAL.cyan
    },
    {
      start: C.stasiun2?.start,
      tag: 'STASIUN DUA: CRAVING',
      title: 'Buat Tindakan Terasa Menarik',
      desc: 'Gabungkan tugas baru dengan kenikmatan instan pemicu dopamin.',
      stat: 'DOPAMIN',
      statSub: 'DAYA TARIK',
      col: PAL.amber
    },
    {
      start: C.stasiun3?.start,
      tag: 'STASIUN TIGA: RESPONSE',
      title: 'Aturan 2 Menit Pertama',
      desc: 'Kecilkan langkah awal hingga terasa konyol jika kamu menolaknya.',
      stat: '< 2 MNT',
      statSub: 'LANGKAH AWAL',
      col: PAL.purple
    },
    {
      start: C.stasiun4?.start,
      tag: 'STASIUN EMPAT: REWARD',
      title: 'Berikan Kepuasan Seketika',
      desc: 'Otak hanya akan mengulang hal-hal yang ditutup dengan rasa puas.',
      stat: 'REWARD',
      statSub: 'KEPUASAN CEPAT',
      col: PAL.mint
    },
    {
      start: C.moral?.start,
      tag: 'DESAIN SISTEM',
      title: 'Sistem Mengalahkan Kemauan',
      desc: 'Jangan paksa dirimu; bangunlah lingkungan yang memaksamu berhasil.',
      stat: '100%',
      statSub: 'SUKSES SISTEMATIS',
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

