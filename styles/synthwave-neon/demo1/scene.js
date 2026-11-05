// 82 · CYBERPUNK RETRO SYNTHWAVE — Demo 1: Dopamin & Jebakan Algoritma
// Full-Screen 1080x1920 (8 Beat Dinamis)

import * as K from '/styles/synthwave-neon/kit.js';

const { clamp, lerp, ease } = AM.lib;
const { PAL, withCamera, synthwaveBg, synthwaveHeader, cyberReticle, cyberStickman, synthwaveCallout } = K;

export const meta = {
  fps: 30,
  width: 1080,
  height: 1920,
  captions: { preset: 'neon', y: 1700, size: 48 }
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
  else if (t >= C.rebut?.start) beat = 6;
  else if (t >= C.bahaya?.start) beat = 5;
  else if (t >= C.lingkaran?.start) beat = 4;
  else if (t >= C.notifikasi?.start) beat = 3;
  else if (t >= C.kasino?.start) beat = 2;
  else if (t >= C.masalah?.start) beat = 1;

  // 2. High-Speed 3D Moving Perspective Neon Grid & Sun
  const speed = beat >= 5 ? 3.5 : 2.5;
  synthwaveBg(ctx, t, { horizonY: 960, gridSpeed: speed });

  // 3. Dynamic Camera Zoom & Shake
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.15; fx = 520; fy = 820; // Data matrix
  } else if (beat === 2) {
    zoom = 1.20; fx = 540; fy = 780; // Casino slot machine
  } else if (beat === 4) {
    zoom = 1.15; fx = 560; fy = 820; // Infinity loop
  } else if (beat === 6 || beat === 7) {
    zoom = 1.12; fx = 540; fy = 840; // Liberation & victory
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const floorY = 1240;

    // Cyber Pedestal Platform on the grid
    ctx.save();
    ctx.fillStyle = 'rgba(13, 2, 33, 0.85)';
    ctx.strokeStyle = beat >= 6 ? PAL.cyan : PAL.magenta;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(540, floorY, 360, 75, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Inner glowing ring
    ctx.strokeStyle = PAL.hotPink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(540, floorY, 320, 60, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (beat === 0) {
      // Beat 0: Avatar captivated by hovering smartphone hologram
      cyberStickman(ctx, 360, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Hovering Giant Smartphone Hologram
      const px = 700, py = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(5, 1, 13, 0.9)';
      ctx.strokeStyle = PAL.magenta;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(px - 110, py - 160, 220, 320, 24);
      ctx.fill(); ctx.stroke();

      // Glowing Notification Alert
      const npulse = 1.0 + 0.15 * Math.sin(t * 8);
      ctx.fillStyle = PAL.magenta;
      ctx.beginPath();
      ctx.arc(px + 75, py - 125, 20 * npulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('99+', px + 75, py - 119);

      // Cyber Beam linking phone to user
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px - 80, py); ctx.lineTo(360, floorY - 125);
      ctx.stroke();

      cyberReticle(ctx, px, py + 40, 50, { col: PAL.cyan, angle: t * 2, label: 'CRAVING', t });
      ctx.restore();

    } else if (beat === 1) {
      // Beat 1: Data Matrix & Thousand AI Data Scientists
      cyberStickman(ctx, 240, floorY, { pose: 'hack', color: PAL.cyan, t });

      // Holographic Code Terminal
      const tx = 660, ty = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(10, 2, 26, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(tx - 220, ty - 140, 440, 280, 16);
      ctx.fill(); ctx.stroke();

      // Top Title
      ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.beginPath();
      ctx.roundRect(tx - 200, ty - 120, 400, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.cyan;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ALGORITMA REKAYASA PERILAKU', tx, ty - 97);

      // Matrix code lines
      const codes = [
        '01 > TARGET: Sirkuit Dopamin Ventral',
        '02 > VAR_SCHEDULE: Mesin Kasino Dinamis',
        '03 > METRIC: Waktu Layar +340%',
        '04 > STATUS: Atensi Terkunci 100%'
      ];

      codes.forEach((c, i) => {
        ctx.fillStyle = i === 1 ? PAL.hotPink : PAL.white;
        ctx.font = '800 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(c, tx - 180, ty - 45 + i * 36);
      });
      ctx.restore();

      cyberReticle(ctx, tx + 140, ty + 80, 35, { col: PAL.hotPink, angle: -t * 3, label: 'AI_BOT', t });

    } else if (beat === 2) {
      // Beat 2: Casino Slot Machine Analogy
      cyberStickman(ctx, 230, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Neon Slot Machine Box
      const sx = 660, sy = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(13, 2, 33, 0.95)';
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(sx - 200, sy - 140, 400, 280, 20);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.yellow;
      ctx.beginPath();
      ctx.roundRect(sx - 170, sy - 120, 340, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MEKANISME MESIN JUDI KASINO', sx, sy - 95);

      // 3 Slot Reels
      for (let r = 0; r < 3; r++) {
        const rx = sx - 120 + r * 120;
        ctx.fillStyle = '#05010d';
        ctx.strokeStyle = PAL.magenta;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(rx - 45, sy - 40, 90, 110, 12);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = PAL.yellow;
        ctx.font = '900 48px "JetBrains Mono", monospace';
        ctx.fillText('7', rx, sy + 35);
      }

      ctx.fillStyle = PAL.hotPink;
      ctx.font = '900 20px "JetBrains Mono", monospace';
      ctx.fillText('JACKPOT DOPAMIN INSTAN!', sx, sy + 112);
      ctx.restore();

    } else if (beat === 3) {
      // Beat 3: Red Notification Bell Alarm (Pavlov's digital bell)
      cyberStickman(ctx, 240, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Giant Glowing Bell Alarm Hologram
      const bx = 660, by = 740;
      ctx.save();
      // Concentric soundwaves pulsing out
      for (let w = 0; w < 3; w++) {
        const wp = (t * 2 + w * 0.4) % 1;
        ctx.strokeStyle = `rgba(255, 0, 127, ${1 - wp})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bx, by, 60 + wp * 90, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Bell Core Box
      ctx.fillStyle = 'rgba(10, 2, 26, 0.95)';
      ctx.strokeStyle = PAL.magenta;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(bx - 180, by - 120, 360, 240, 20);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.magenta;
      ctx.font = '900 64px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔔', bx, by - 10);

      ctx.fillStyle = PAL.white;
      ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('LONCENG REFLEKS BIOLOGIS', bx, by + 45);

      ctx.fillStyle = PAL.cyan;
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillText('> Memicu Nafsu Membuka Layar', bx, by + 80);
      ctx.restore();

      cyberReticle(ctx, bx + 130, by - 80, 30, { col: PAL.cyan, angle: t * 4, label: 'ALARM', t });

    } else if (beat === 4) {
      // Beat 4: Infinity Addiction Loop
      cyberStickman(ctx, 230, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Infinity Loop Hologram
      const ix = 660, iy = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(ix - 210, iy - 140, 420, 280, 20);
      ctx.fill(); ctx.stroke();

      // Top Tag
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.roundRect(ix - 170, iy - 120, 340, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LINGKARAN KECANDUAN DIGITAL', ix, iy - 97);

      // 4 Nodes of Loop
      const loopSteps = [
        { label: '1. Gelisah', col: PAL.hotPink, x: ix - 110, y: iy - 35 },
        { label: '2. Buka HP', col: PAL.cyan, x: ix + 110, y: iy - 35 },
        { label: '3. Dopamin', col: PAL.yellow, x: ix + 110, y: iy + 45 },
        { label: '4. Hampa', col: PAL.violet, x: ix - 110, y: iy + 45 }
      ];

      loopSteps.forEach(s => {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.strokeStyle = s.col;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(s.x - 70, s.y - 20, 140, 42, 8);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = s.col;
        ctx.font = '900 15px "JetBrains Mono", monospace';
        ctx.fillText(s.label, s.x, s.y + 6);
      });

      // Connecting Arrows
      ctx.strokeStyle = PAL.white;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ix - 30, iy - 35); ctx.lineTo(ix + 30, iy - 35);
      ctx.moveTo(ix + 110, iy - 5); ctx.lineTo(ix + 110, iy + 15);
      ctx.moveTo(ix + 30, iy + 45); ctx.lineTo(ix - 30, iy + 45);
      ctx.moveTo(ix - 110, iy + 15); ctx.lineTo(ix - 110, iy - 5);
      ctx.stroke();

      ctx.fillStyle = PAL.magenta;
      ctx.font = '800 14px "JetBrains Mono", monospace';
      ctx.fillText('// MENGULANG 150X PER HARI', ix, iy + 110);
      ctx.restore();

    } else if (beat === 5) {
      // Beat 5: Fragmented Focus & Brain Glitch
      cyberStickman(ctx, 240, floorY, { pose: 'ready', color: PAL.coral, t });

      // Glitched Brain Monitor
      const gx = 660, gy = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(15, 2, 20, 0.95)';
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(gx - 210, gy - 140, 420, 270, 18);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.coral;
      ctx.beginPath();
      ctx.roundRect(gx - 180, gy - 120, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DAMPAK: KERUSAKAN ATENSI', gx, gy - 97);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Fokus Manusia Anjlok:', gx, gy - 40);

      // Big Glitched Number 8 Detik
      ctx.fillStyle = PAL.coral;
      ctx.font = '900 64px "JetBrains Mono", monospace';
      ctx.fillText('8 DETIK', gx, gy + 30);

      ctx.fillStyle = PAL.cyan;
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillText('Lebih pendek dari ikan mas koki!', gx, gy + 85);
      ctx.restore();

      cyberReticle(ctx, gx + 140, gy - 70, 30, { col: PAL.coral, angle: t * 5, label: 'WARN', t });

    } else if (beat === 6) {
      // Beat 6: Reclaim Sovereignty (Turning Off Notifications)
      cyberStickman(ctx, 230, floorY, { pose: 'hack', color: PAL.cyan, t });

      // Shielded Offline Sanctuary Card
      const ox = 650, oy = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(ox - 210, oy - 130, 420, 260, 18);
      ctx.fill(); ctx.stroke();

      // Top Tag
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.roundRect(ox - 180, oy - 110, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PROTOKOL KEDAULATAN KOGNITIF', ox, oy - 85);

      // Steps
      ctx.textAlign = 'left';
      ctx.fillStyle = PAL.white;
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.fillText('1. MATIKAN SEMUA NOTIFIKASI', ox - 170, oy - 30);
      ctx.fillText('2. GANTI LAYAR JADI GRAYSCALE', ox - 170, oy + 10);
      ctx.fillText('3. ZONA BEBAS HP 1 JAM SEBELUM TIDUR', ox - 170, oy + 50);

      ctx.fillStyle = PAL.hotPink;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.fillText('// PIKIRAN MERDEKA DARI ALGORITMA', ox - 170, oy + 95);
      ctx.restore();

      cyberReticle(ctx, ox + 140, oy + 75, 30, { col: PAL.cyan, angle: -t * 3, label: 'SECURE', t });

    } else if (beat === 7) {
      // Beat 7: Digital Mastery & Freedom
      cyberStickman(ctx, 360, floorY, { pose: 'victory', color: PAL.cyan, t });

      // Digital Sovereign Shield
      const mx = 720, my = 750;
      ctx.save();
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(mx, my, 120, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = PAL.hotPink;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(mx, my, 105, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = PAL.cyan;
      ctx.font = '900 24px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PENGUASA', mx, my - 25);
      ctx.fillText('ATENSI', mx, my + 15);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.fillText('100% KEDAULATAN', mx, my + 55);
      ctx.restore();

      // Sparkle cyber particles
      for (let s = 0; s < 6; s++) {
        const ang = (s / 6) * Math.PI * 2 + t * 2;
        const sx = mx + Math.cos(ang) * 145;
        const sy = my + Math.sin(ang) * 145;
        ctx.fillStyle = s % 2 === 0 ? PAL.hotPink : PAL.cyan;
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // 5. Header (Standard Cyberpunk Top Banner)
  synthwaveHeader(
    ctx,
    'NEUROSAINS DIGITAL',
    'DOPAMIN & JEBAKAN ALGORITMA',
    'Cara Layar Kaca Membajak Kimiawi Otakmu'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'PSIKOLOGI SCREEN-TIME',
      title: 'Jempol Bergerak Otomatis?',
      desc: 'Refleks membuka ponsel adalah perilaku yang dikondisikan oleh teknologi.',
      stat: '150X',
      statSub: 'CEK HP PER HARI',
      col: PAL.magenta
    },
    {
      start: C.masalah?.start,
      tag: 'EKONOMI ATENSI',
      title: 'Ribuan Insinyur Meretas Pikiran',
      desc: 'Bisnis media sosial menjual waktu dan perhatianmu ke pengiklan.',
      stat: 'ATENSI',
      statSub: 'KOMODITAS MAHAL',
      col: PAL.cyan
    },
    {
      start: C.kasino?.start,
      tag: 'VARIABLE REWARD',
      title: 'Mekanisme Mesin Slot Kasino',
      desc: 'Ketidakpastian isi notifikasi membuat otak memompa dopamin terus-menerus.',
      stat: 'KASINO',
      statSub: 'JEBAKAN SLOT',
      col: PAL.yellow
    },
    {
      start: C.notifikasi?.start,
      tag: 'KONDISIONING PAVLOV',
      title: 'Titik Merah Pemicu Nafsu',
      desc: 'Warna merah sengaja dipilih karena otak manusia memprosesnya sebagai bahaya.',
      stat: 'MERAH',
      statSub: 'ALARM BIOLOGIS',
      col: PAL.magenta
    },
    {
      start: C.lingkaran?.start,
      tag: 'SIKLUS KECANDUAN',
      title: 'Lingkaran Setan Dopamin',
      desc: 'Kecemasan sekejap langsung ditambal oleh kesenangan semu layar kaca.',
      stat: 'LOOP',
      statSub: 'TANPA AKHIR',
      col: PAL.hotPink
    },
    {
      start: C.bahaya?.start,
      tag: 'KERUSAKAN KOGNITIF',
      title: 'Atensi Anjlok ke 8 Detik',
      desc: 'Sulit membaca buku panjang dan berpikir mendalam akibat stimulasi berlebih.',
      stat: '8 DETIK',
      statSub: 'FOKUS MAKSIMAL',
      col: PAL.coral
    },
    {
      start: C.rebut?.start,
      tag: 'REBUT KEDAULATAN',
      title: 'Detoks Digital Sederhana',
      desc: 'Matikan notifikasi dan ubah layar menjadi hitam putih untuk meredam nafsu.',
      stat: 'DETOKS',
      statSub: 'ZONA BEBAS HP',
      col: PAL.cyan
    },
    {
      start: C.moral?.start,
      tag: 'KEMERDEKAAN DIRI',
      title: 'Jadilah Tuan Atas Teknologimu',
      desc: 'Ponsel adalah alat kerja untuk membantumu, bukan penjara untuk jiwamu.',
      stat: '100%',
      statSub: 'MERDEKA DIGITAL',
      col: PAL.cyan
    }
  ];

  const currentCallout = callouts[beat] || callouts[0];
  const calloutAlpha = pop(t, currentCallout.start, 0.4);

  synthwaveCallout(ctx, 540, 1485, 960, 165, {
    tag: currentCallout.tag,
    title: currentCallout.title,
    desc: currentCallout.desc,
    stat: currentCallout.stat,
    statSub: currentCallout.statSub,
    col: currentCallout.col,
    a: calloutAlpha
  });
}

