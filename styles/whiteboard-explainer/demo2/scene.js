// 80 · WHITEBOARD EXPLAINER PRO — Demo 2: Prinsip Pareto 80/20
// Full-Screen 1080x1920 (8 Beat Dinamis)

import * as K from '/styles/whiteboard-explainer/kit.js';

const { clamp, lerp, ease } = AM.lib;
const { PAL, withCamera, whiteboardBg, whiteboardHeader, whiteboardStickman, whiteboardCallout, markerPen, stickyNote, wobbleLine } = K;

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
  else if (t >= C.eksekusi?.start) beat = 6;
  else if (t >= C.fokus?.start) beat = 5;
  else if (t >= C.distraksi?.start) beat = 4;
  else if (t >= C.analisis?.start) beat = 3;
  else if (t >= C.pareto?.start) beat = 2;
  else if (t >= C.masalah?.start) beat = 1;

  // 2. Whiteboard Background
  whiteboardBg(ctx, t, { showGrid: true });

  // 3. Dynamic Camera Panning
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.15; fx = 520; fy = 840; // To-do list overload
  } else if (beat === 2) {
    zoom = 1.20; fx = 540; fy = 820; // Pareto 80/20 bar chart
  } else if (beat === 4) {
    zoom = 1.15; fx = 560; fy = 850; // Phone distraction
  } else if (beat === 5 || beat === 6) {
    zoom = 1.18; fx = 540; fy = 860; // Focus & 2 Big Priorities
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const floorY = 1240;

    // Faint floor guideline
    wobbleLine(ctx, 100, floorY, 980, floorY, { col: 'rgba(15, 23, 42, 0.15)', width: 3 });

    if (beat === 0) {
      // Beat 0: Overworked stickman sweating under a mountain of tasks
      whiteboardStickman(ctx, 320, floorY, { pose: 'confused', scale: 1.45, t });

      // Hand-drawn clock ticking fast
      const clx = 720, cly = 720;
      ctx.save();
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(clx, cly, 75, 0, Math.PI * 2);
      ctx.stroke();

      // Clock hands moving
      const handAng = t * 4;
      ctx.beginPath();
      ctx.moveTo(clx, cly); ctx.lineTo(clx + Math.cos(handAng) * 45, cly + Math.sin(handAng) * 45);
      ctx.moveTo(clx, cly); ctx.lineTo(clx + Math.cos(handAng * 0.2) * 30, cly + Math.sin(handAng * 0.2) * 30);
      ctx.stroke();

      // Sweat drops
      ctx.fillStyle = PAL.blue;
      ctx.beginPath();
      ctx.arc(clx - 90, cly - 20, 8, 0, Math.PI * 2);
      ctx.fill();

      // Red stress scribble
      ctx.fillStyle = PAL.red;
      ctx.font = '900 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LEMBUR 14 JAM!', clx, cly + 120);
      ctx.restore();

      markerPen(ctx, clx + 60, cly + 110, { color: PAL.red, angle: -0.4, t });

    } else if (beat === 1) {
      // Beat 1: The Trap of Fake Busyness (Checklist trap)
      whiteboardStickman(ctx, 230, floorY, { pose: 'think', scale: 1.4, t });

      // Long boring to-do list with 10 trivial tasks
      const lx = 640, ly = 730;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(lx - 200, ly - 140, 400, 280, 16);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.red;
      ctx.beginPath();
      ctx.roundRect(lx - 170, ly - 120, 340, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MITOS SEMUA TUGAS PENTING', lx, ly - 97);

      // 4 Checklist items
      const items = [
        'Balas 45 email remeh',
        'Rapat 2 jam tanpa hasil',
        'Rapikan meja kerja lagi',
        'Cek notifikasi grup chat'
      ];

      items.forEach((item, i) => {
        const iy = ly - 40 + i * 40;
        // Checkbox
        ctx.strokeStyle = PAL.ink;
        ctx.lineWidth = 3;
        ctx.strokeRect(lx - 160, iy - 16, 22, 22);

        // Checkmark
        ctx.strokeStyle = PAL.red;
        ctx.beginPath();
        ctx.moveTo(lx - 164, iy - 4);
        ctx.lineTo(lx - 150, iy + 4);
        ctx.lineTo(lx - 138, iy - 14);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = PAL.ink;
        ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(item, lx - 125, iy);
      });

      ctx.fillStyle = PAL.red;
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HASIL AKHIR: HAMPIR NOL!', lx, ly + 115);
      ctx.restore();

      markerPen(ctx, lx + 140, ly + 110, { color: PAL.red, angle: -0.4, t });

    } else if (beat === 2) {
      // Beat 2: The 80/20 Law Diagram (Vilfredo Pareto)
      whiteboardStickman(ctx, 210, floorY, { pose: 'point', scale: 1.4, t });

      // Big 80/20 Ratio Visual Box
      const px = 640, py = 740;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.blue;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(px - 220, py - 140, 440, 280, 18);
      ctx.fill(); ctx.stroke();

      // Top Banner
      ctx.fillStyle = PAL.blue;
      ctx.beginPath();
      ctx.roundRect(px - 180, py - 120, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HUKUM PARETO 80/20', px, py - 95);

      // Left Column: 20% Input
      ctx.fillStyle = PAL.amber;
      ctx.beginPath();
      ctx.roundRect(px - 170, py - 30, 140, 100, 12);
      ctx.fill();

      ctx.fillStyle = PAL.ink;
      ctx.font = '900 36px "JetBrains Mono", monospace';
      ctx.fillText('20%', px - 100, py + 25);
      ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('USAHA KUNCI', px - 100, py + 55);

      // Arrow in between
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(px - 10, py + 20); ctx.lineTo(px + 30, py + 20);
      ctx.lineTo(px + 20, py + 10);
      ctx.moveTo(px + 30, py + 20); ctx.lineTo(px + 20, py + 30);
      ctx.stroke();

      // Right Column: 80% Output
      ctx.fillStyle = PAL.green;
      ctx.beginPath();
      ctx.roundRect(px + 50, py - 50, 140, 140, 12);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 44px "JetBrains Mono", monospace';
      ctx.fillText('80%', px + 120, py + 25);
      ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('HASIL TOTAL', px + 120, py + 60);

      ctx.restore();

      markerPen(ctx, px + 170, py + 70, { color: PAL.green, angle: -0.4, t });

    } else if (beat === 3) {
      // Beat 3: Business Example (20% Customers = 80% Revenue)
      whiteboardStickman(ctx, 230, floorY, { pose: 'think', scale: 1.4, t });

      // Balance Scale Doodle
      const sx = 660, sy = 740;
      ctx.save();
      // Stand
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(sx, sy + 110); ctx.lineTo(sx, sy - 50);
      ctx.moveTo(sx - 60, sy + 110); ctx.lineTo(sx + 60, sy + 110);
      ctx.stroke();

      // Tilted beam
      ctx.save();
      ctx.translate(sx, sy - 50);
      ctx.rotate(-0.15); // tipped towards 80%
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-160, 0); ctx.lineTo(160, 0);
      ctx.stroke();

      // Left pan: 20% Customers (small gold bag)
      ctx.fillStyle = PAL.amber;
      ctx.beginPath();
      ctx.arc(-160, 60, 35, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.ink;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('20% VIP', -160, 65);

      // Right pan: 80% Revenue (giant stack of cash)
      ctx.fillStyle = PAL.green;
      ctx.beginPath();
      ctx.roundRect(110, 20, 100, 75, 8);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 20px "JetBrains Mono", monospace';
      ctx.fillText('80% PROFIT', 160, 65);
      ctx.restore();
      ctx.restore();

      // Sticky note annotation
      stickyNote(ctx, 420, 600, 210, 140, {
        color: PAL.stickyYellow,
        angle: 0.04,
        title: 'DATA BISNIS',
        lines: ['Rawat 20% klien terbaik', 'Fokus layanan prima']
      });

    } else if (beat === 4) {
      // Beat 4: 80% Distraction from 20% Bad Habits (Smartphones)
      whiteboardStickman(ctx, 240, floorY, { pose: 'confused', scale: 1.4, t });

      // Hand-drawn Smartphone Doodle with toxic alert bubbles
      const phx = 660, phy = 730;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.red;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(phx - 110, phy - 150, 220, 300, 24);
      ctx.fill(); ctx.stroke();

      // Screen
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fillRect(phx - 95, phy - 120, 190, 235);

      // Distraction Badges
      const alerts = [
        '🔴 Notifikasi Sosmed',
        '⚠️ Doom-scrolling 3 Jam',
        '💬 Chat Non-Stop',
        '⚡ Hilang Fokus Total'
      ];

      alerts.forEach((alt, i) => {
        ctx.fillStyle = PAL.white;
        ctx.strokeStyle = PAL.red;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(phx - 85, phy - 100 + i * 55, 170, 42, 8);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = PAL.ink;
        ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(alt, phx, phy - 74 + i * 55);
      });
      ctx.restore();

      markerPen(ctx, phx + 100, phy + 120, { color: PAL.red, angle: -0.4, t });

    } else if (beat === 5) {
      // Beat 5: Ruthless Elimination (Cutting the Trivial)
      whiteboardStickman(ctx, 230, floorY, { pose: 'point', scale: 1.4, t });

      // Big Scissors doodle cutting through useless tasks
      const cx = 650, cy = 730;
      ctx.save();
      // Cut card
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cx - 200, cy - 130, 400, 250, 18);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.red;
      ctx.beginPath();
      ctx.roundRect(cx - 170, cy - 110, 340, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PANGKAS 80% TUGAS GUREM', cx, cy - 87);

      // Giant Scissors
      ctx.strokeStyle = PAL.red;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy - 30); ctx.lineTo(cx + 80, cy + 50);
      ctx.moveTo(cx - 80, cy + 50); ctx.lineTo(cx + 80, cy - 30);
      ctx.stroke();

      // Scissor rings
      ctx.strokeRect(cx - 110, cy - 50, 30, 30);
      ctx.strokeRect(cx - 110, cy + 40, 30, 30);

      ctx.fillStyle = PAL.ink;
      ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Katakan TIDAK pada tugas remeh!', cx, cy + 95);
      ctx.restore();

      markerPen(ctx, cx + 130, cy + 90, { color: PAL.red, angle: -0.3, t });

    } else if (beat === 6) {
      // Beat 6: Execution — 2 Golden Priorities Every Morning
      whiteboardStickman(ctx, 220, floorY, { pose: 'eureka', scale: 1.4, t });

      // Daily Golden Card
      const gx = 650, gy = 740;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.green;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(gx - 210, gy - 130, 420, 250, 18);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.green;
      ctx.beginPath();
      ctx.roundRect(gx - 180, gy - 110, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('2 PRIORITAS EMAS HARIAN', gx, gy - 85);

      // Star 1
      ctx.fillStyle = PAL.amber;
      ctx.font = '900 26px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('★ 1. Proyek Inti Bernilai Tinggi', gx - 170, gy - 25);

      // Star 2
      ctx.fillText('★ 2. Keputusan Kritis Tim', gx - 170, gy + 25);

      ctx.fillStyle = PAL.green;
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.fillText('✓ TUNTASKAN SEBELUM JAM 12:00', gx - 170, gy + 75);
      ctx.restore();

      markerPen(ctx, gx + 150, gy + 70, { color: PAL.green, angle: -0.4, t });

    } else if (beat === 7) {
      // Beat 7: True Effectiveness & Freedom
      whiteboardStickman(ctx, 360, floorY, { pose: 'eureka', scale: 1.5, t });

      // High Impact Stamp
      const hx = 720, hy = 750;
      ctx.save();
      ctx.strokeStyle = PAL.green;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(hx, hy, 120, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = PAL.green;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(hx, hy, 105, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = PAL.green;
      ctx.font = '900 26px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EFEKTIF &', hx, hy - 25);
      ctx.fillText('BERDAMPAK', hx, hy + 15);

      ctx.fillStyle = PAL.ink;
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.fillText('80% HASIL NYATA', hx, hy + 55);
      ctx.restore();

      // Confetti lightbulbs
      for (let i = 0; i < 3; i++) {
        const lx = 200 + i * 320;
        const ly = 540 + Math.sin(t * 3 + i) * 15;
        ctx.fillStyle = PAL.amber;
        ctx.beginPath();
        ctx.arc(lx, ly, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  // 5. Header (Standard Whiteboard Top Banner)
  whiteboardHeader(
    ctx,
    'HUKUM PRODUKTIVITAS',
    'PRINSIP PARETO 80/20',
    'Cara Bekerja Lebih Sedikit dengan Hasil Maksimal'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'PSIKOLOGI KERJA',
      title: 'Lelah tapi Minim Hasil?',
      desc: 'Jam kerja panjang seringkali hanyalah kedok dari ketiadaan prioritas.',
      stat: '14 JAM',
      statSub: 'JEBAKAN LEMBUR',
      col: PAL.red
    },
    {
      start: C.masalah?.start,
      tag: 'JEBAKAN KOGNITIF',
      title: 'Mitos Kesibukan Semu',
      desc: 'Mencoba menyelesaikan semua tugas membuat hal penting terabaikan.',
      stat: '0%',
      statSub: 'DOKUMEN KUNCI',
      col: PAL.red
    },
    {
      start: C.pareto?.start,
      tag: 'HUKUM ALAMIAH',
      title: 'Aturan Universal 80/20',
      desc: 'Mayoritas dampak selalu digerakkan oleh segelintir tindakan kunci.',
      stat: '80 / 20',
      statSub: 'RASIO PARETO',
      col: PAL.blue
    },
    {
      start: C.analisis?.start,
      tag: 'ANALISIS BISNIS',
      title: 'Fokus Pelanggan Vital',
      desc: 'Ketahui 20% sumber daya yang menghasilkan 80% kepuasan dan omzet.',
      stat: '80% PROFIT',
      statSub: 'DARI 20% KLIEN',
      col: PAL.green
    },
    {
      start: C.distraksi?.start,
      tag: 'MANAJEMEN DISTRAKSI',
      title: 'Eliminasi Biang Masalah',
      desc: 'Ponsel dan distraksi remeh menghabiskan 80% energi mental harian.',
      stat: 'DISTRAKSI',
      statSub: 'SUMBER KECEMASAN',
      col: PAL.red
    },
    {
      start: C.fokus?.start,
      tag: 'STRATEGI ELEGAN',
      title: 'Kekuatan Berani Berkata Tidak',
      desc: 'Tolak tugas gurem agar kamu punya waktu mengerjakan hal raksasa.',
      stat: 'PANGKAS',
      statSub: 'BEBAN TAK BERGUNA',
      col: PAL.amber
    },
    {
      start: C.eksekusi?.start,
      tag: 'RUTINITAS PAGI',
      title: 'Dua Prioritas Sebelum Siang',
      desc: 'Tuntaskan target terbesar saat energimu masih berada di puncaknya.',
      stat: '2 PRIORITAS',
      statSub: 'SEBELUM JAM 12',
      col: PAL.green
    },
    {
      start: C.moral?.start,
      tag: 'FILOSOFI WAKTU',
      title: 'Bukan Sibuk, Tapi Efektif',
      desc: 'Orang hebat tidak sibuk ke sana kemari; mereka tenang dan akurat.',
      stat: '100%',
      statSub: 'DAMPAK MAKSIMAL',
      col: PAL.blue
    }
  ];

  const currentCallout = callouts[beat] || callouts[0];
  const calloutAlpha = pop(t, currentCallout.start, 0.4);

  whiteboardCallout(ctx, 540, 1485, 960, 165, {
    tag: currentCallout.tag,
    title: currentCallout.title,
    desc: currentCallout.desc,
    stat: currentCallout.stat,
    statSub: currentCallout.statSub,
    col: currentCallout.col,
    a: calloutAlpha
  });
}

