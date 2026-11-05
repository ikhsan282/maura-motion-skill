// 81 · ISOMETRIC LOW-POLY 3D — Demo 2: Benteng Time-Blocking
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
  else if (t >= C.hasil?.start) beat = 6;
  else if (t >= C.blok3?.start) beat = 5;
  else if (t >= C.blok2?.start) beat = 4;
  else if (t >= C.blok1?.start) beat = 3;
  else if (t >= C.benteng?.start) beat = 2;
  else if (t >= C.masalah?.start) beat = 1;

  // 2. Isometric Background
  isoBackground(ctx, t, { accent: beat >= 2 ? PAL.cyan : PAL.coral });

  // 3. Dynamic Camera Panning across Fortress
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.15; fx = 520; fy = 840; // Clock 17:00 panic
  } else if (beat === 2) {
    zoom = 1.08; fx = 540; fy = 820; // Fortress emergence
  } else if (beat === 3) {
    zoom = 1.25; fx = 420; fy = 760; // Deep Work Tower
  } else if (beat === 4) {
    zoom = 1.25; fx = 660; fy = 800; // Reactive Hub
  } else if (beat === 5) {
    zoom = 1.25; fx = 540; fy = 900; // Buffer Zone
  } else if (beat === 7) {
    zoom = 1.12; fx = 540; fy = 840; // Captain of calendar
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const cx = 540, cy = 820, scale = 42;

    // Floating Island Diorama
    isoIsland(ctx, { cx, cy, scale, w: 9, d: 9, h: 2.2, grassCol: '#1e293b', dirtCol: '#0f172a' });

    // Grid Calendar Base Floor Lines
    for (let gx = -3; gx <= 3; gx += 2) {
      for (let gy = -3; gy <= 3; gy += 2) {
        isoBlock(ctx, gx, gy, 0, 1.8, 1.8, 0.1, {
          cx, cy, scale,
          topCol: '#0f172a', leftCol: '#030712', rightCol: '#0b0f19'
        });
      }
    }

    if (beat === 0 || beat === 1) {
      // Beat 0 & 1: Panic with clock at 17:00
      isoChar(ctx, 0, 0, 0.1, { cx, cy, scale, pose: 'stand', suitCol: PAL.coral, t });

      // Holographic Giant Red Clock 17:00
      isoTag(ctx, 0, 0, 3.2, 'JAM 17:00 — PROYEK: 0%', { cx, cy, scale, col: PAL.coral });

      // Incoming attack arrows (distractions)
      for (let a = 0; a < 4; a++) {
        const ang = (a / 4) * Math.PI * 2 + t * 3;
        const apt = toIso(Math.cos(ang) * 3, Math.sin(ang) * 3, 1.5, { cx, cy, scale });
        ctx.fillStyle = PAL.coral;
        ctx.beginPath();
        ctx.arc(apt.x, apt.y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

    } else {
      // 3D Time-Blocking Fortress Modules Rising:

      // 1. Deep Work Tower (North-West: -3.2, -3.2)
      const t1H = beat >= 3 ? 3.6 : 1.5;
      isoBlock(ctx, -3.2, -3.2, 0.1, 2.4, 2.4, t1H, {
        cx, cy, scale,
        topCol: PAL.cyan, leftCol: '#0891b2', rightCol: '#0e7490'
      });
      // Forcefield dome over tower
      if (beat >= 3) {
        const dpt = toIso(-2.0, -2.0, t1H + 0.5, { cx, cy, scale });
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.strokeStyle = PAL.cyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dpt.x, dpt.y, 45, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        isoTag(ctx, -2.0, -2.0, t1H + 1.8, '08:00 - 10:00: DEEP WORK', { cx, cy, scale, col: PAL.cyan });
      }

      // 2. Reactive Hub (North-East: 1.0, -3.2)
      const t2H = beat >= 4 ? 2.5 : 1.2;
      isoBlock(ctx, 1.0, -3.2, 0.1, 2.4, 2.4, t2H, {
        cx, cy, scale,
        topCol: beat >= 4 ? PAL.amber : '#475569',
        leftCol: '#d97706',
        rightCol: '#b45309'
      });
      if (beat >= 4) {
        isoTag(ctx, 2.2, -2.0, t2H + 1.6, '13:00 - 14:30: EMAIL & CHAT', { cx, cy, scale, col: PAL.amber });
      }

      // 3. Buffer Zone (South: -1.2, 1.0)
      const t3H = beat >= 5 ? 1.4 : 0.8;
      isoBlock(ctx, -1.2, 1.0, 0.1, 2.4, 2.4, t3H, {
        cx, cy, scale,
        topCol: beat >= 5 ? PAL.mint : '#475569',
        leftCol: '#059669',
        rightCol: '#047857'
      });
      if (beat >= 5) {
        isoTag(ctx, 0.0, 2.2, t3H + 1.5, '14:30 - 15:00: JEDA AMAN', { cx, cy, scale, col: PAL.mint });
      }

      // Character working calmly in the center
      isoChar(ctx, 0, -0.8, 0.1, { cx, cy, scale, pose: 'stand', suitCol: PAL.mint, t });

      // Hologram Banner in Beat 7
      if (beat === 7) {
        isoTag(ctx, 0, -0.8, 2.8, 'KAPTEN WAKTU 100%', { cx, cy, scale, col: PAL.mint });
      }
    }
  });

  // 5. Header (Standard Isometric Top Banner)
  isoHeader(
    ctx,
    'MANAJEMEN ENERGI & FOKUS',
    'BENTENG TIME-BLOCKING',
    'Cara Melindungi Fokus dari Tsunami Interupsi'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'PARADOKS KERJA',
      title: 'Jam 5 Sore Tanpa Hasil?',
      desc: 'Sibuk sepanjang hari bukan jaminan proyek besarmu mengalami kemajuan.',
      stat: '17:00',
      statSub: 'HABIS WAKTU',
      col: PAL.coral
    },
    {
      start: C.masalah?.start,
      tag: 'JEBAKAN TO-DO LIST',
      title: 'Daftar Tugas Itu Pasif',
      desc: 'To-do list membiarkan orang lain bebas membajak jam kerjamu sesuka hati.',
      stat: '0%',
      statSub: 'PERTAHANAN DIRI',
      col: PAL.coral
    },
    {
      start: C.benteng?.start,
      tag: 'METODE CAL NEWPORT',
      title: 'Bangun Benteng Waktu 3D',
      desc: 'Alokasikan blok waktu spesifik untuk setiap kelompok energi kognitif.',
      stat: 'TIME-BLOCK',
      statSub: 'BENTENG FOKUS',
      col: PAL.cyan
    },
    {
      start: C.blok1?.start,
      tag: 'ZONA DEEP WORK',
      title: '2 Jam Emas di Pagi Hari',
      desc: 'Kunci waktu untuk tugas terberat saat otak masih segar tanpa distraksi.',
      stat: '2 JAM',
      statSub: 'DEEP WORK',
      col: PAL.cyan
    },
    {
      start: C.blok2?.start,
      tag: 'ZONA REAKTIF',
      title: 'Kumpulkan Tugas Remeh',
      desc: 'Balas email dan pesan sekaligus dalam satu sesi padat di siang hari.',
      stat: 'REAKTIF',
      statSub: 'SATU WAKTU PADAT',
      col: PAL.amber
    },
    {
      start: C.blok3?.start,
      tag: 'ZONA BUFFER PENYANGGA',
      title: 'Jeda 30 Menit Antar-Blok',
      desc: 'Ruang napas fleksibel agar jadwalmu tidak hancur saat ada kondisi darurat.',
      stat: '30 MNT',
      statSub: 'BUFFER ZONE',
      col: PAL.mint
    },
    {
      start: C.hasil?.start,
      tag: 'HASIL KENDALI',
      title: 'Bukan Lagi Pemadam Kebakaran',
      desc: 'Kamu proaktif mengarahkan hari, bukan sekadar merespons kemauan orang.',
      stat: '100%',
      statSub: 'KENDALI PENUH',
      col: PAL.mint
    },
    {
      start: C.moral?.start,
      tag: 'PRINSIP KALENDER',
      title: 'Jadwalkan Prioritasmu',
      desc: 'Jika kamu tidak mengklaim waktumu, dunia luar yang akan merampasnya.',
      stat: 'ARSITEK',
      statSub: 'WAKTU SENDIRI',
      col: PAL.cyan
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

