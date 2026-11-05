// 80 · WHITEBOARD EXPLAINER PRO — Demo 3: Efek Zeigarnik
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
  else if (t >= C.tuliskan?.start) beat = 6;
  else if (t >= C.solusi?.start) beat = 5;
  else if (t >= C.bahaya?.start) beat = 4;
  else if (t >= C.kafe?.start) beat = 3;
  else if (t >= C.zeigarnik?.start) beat = 2;
  else if (t >= C.masalah?.start) beat = 1;

  // 2. Whiteboard Background
  whiteboardBg(ctx, t, { showGrid: true });

  // 3. Dynamic Camera Panning
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.15; fx = 520; fy = 840; // 50 open tabs
  } else if (beat === 2) {
    zoom = 1.18; fx = 540; fy = 820; // Zeigarnik effect law
  } else if (beat === 3) {
    zoom = 1.12; fx = 560; fy = 850; // Cafe waiter experiment
  } else if (beat === 6) {
    zoom = 1.18; fx = 540; fy = 860; // Closing mental tabs
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const floorY = 1240;

    // Faint floor guideline
    wobbleLine(ctx, 100, floorY, 980, floorY, { col: 'rgba(15, 23, 42, 0.15)', width: 3 });

    if (beat === 0) {
      // Beat 0: Sleepless in bed staring at ceiling with spinning thoughts
      whiteboardStickman(ctx, 320, floorY, { pose: 'confused', scale: 1.45, t });

      // Midnight Clock & Thoughts cloud
      const cx = 710, cy = 730;
      ctx.save();
      // Digital Clock 02:30 AM
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.red;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cx - 150, cy - 140, 300, 95, 14);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.red;
      ctx.font = '900 48px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('02:30', cx, cy - 75);

      // Unfinished task bubble
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(cx - 170, cy - 20, 340, 160, 16);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.ink;
      ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Otakmu berbisik:', cx, cy + 15);
      ctx.fillStyle = PAL.red;
      ctx.font = '900 17px "JetBrains Mono", monospace';
      ctx.fillText('! LAPORAN BELUM SELESAI !', cx, cy + 45);
      ctx.fillText('! REVISI EMAIL BESOK PAGI !', cx, cy + 75);
      ctx.fillText('! BELUM BALAS CHAT KLIEN !', cx, cy + 105);
      ctx.restore();

      markerPen(ctx, cx + 130, cy + 115, { color: PAL.red, angle: -0.4, t });

    } else if (beat === 1) {
      // Beat 1: Too Many Open Mental Tabs
      whiteboardStickman(ctx, 230, floorY, { pose: 'confused', scale: 1.4, t });

      // 5 Overlapping Browser Tabs Doodle
      const bx = 650, by = 730;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(bx - 210, by - 140, 420, 270, 16);
      ctx.fill(); ctx.stroke();

      // Top Tab Bar
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(bx - 210, by - 140, 420, 45, [16, 16, 0, 0]);
      ctx.fill();

      // 3 Mini Tabs
      for (let t = 0; t < 3; t++) {
        ctx.fillStyle = t === 0 ? PAL.white : '#cbd5e1';
        ctx.fillRect(bx - 195 + t * 90, by - 135, 80, 40);
        ctx.fillStyle = PAL.ink;
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.fillText(`Tab ${t + 1}..`, bx - 165 + t * 90, by - 110);
      }

      ctx.fillStyle = PAL.red;
      ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('50 TAB MENTAL TERBUKA!', bx, by - 40);

      ctx.fillStyle = PAL.ink;
      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Setiap tugas yang belum tuntas', bx, by + 10);
      ctx.fillText('terus memakan memori RAM otakmu', bx, by + 40);

      // Battery low indicator
      ctx.strokeStyle = PAL.red;
      ctx.lineWidth = 3;
      ctx.strokeRect(bx - 60, by + 65, 120, 35);
      ctx.fillStyle = PAL.red;
      ctx.fillRect(bx - 55, by + 70, 25, 25);
      ctx.fillText('BATTERY: 5%', bx, by + 125);
      ctx.restore();

      markerPen(ctx, bx + 150, by + 90, { color: PAL.red, angle: -0.4, t });

    } else if (beat === 2) {
      // Beat 2: Bluma Zeigarnik 1927 Law
      whiteboardStickman(ctx, 220, floorY, { pose: 'point', scale: 1.4, t });

      // Theory Card
      const zx = 650, zy = 740;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.purple;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(zx - 210, zy - 140, 420, 280, 18);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.purple;
      ctx.beginPath();
      ctx.roundRect(zx - 180, zy - 120, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PENEMUAN BLUMA ZEIGARNIK 1927', zx, zy - 95);

      // Rule text
      ctx.fillStyle = PAL.ink;
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Otak diprogram untuk terus', zx, zy - 40);
      ctx.fillText('mengingat & mencemaskan', zx, zy - 5);

      ctx.fillStyle = PAL.purple;
      ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('TUGAS YANG TERGANTUNG!', zx, zy + 40);

      ctx.fillStyle = PAL.inkLight;
      ctx.font = '600 15px "JetBrains Mono", monospace';
      ctx.fillText('Ketegangan kognitif bawah sadar', zx, zy + 85);
      ctx.restore();

      markerPen(ctx, zx + 140, zy + 95, { color: PAL.purple, angle: -0.4, t });

    } else if (beat === 3) {
      // Beat 3: The Café Waiter Experiment
      whiteboardStickman(ctx, 230, floorY, { pose: 'think', scale: 1.4, t });

      // Café Table & Order Pad Doodle
      const cx = 660, cy = 730;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.amber;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cx - 210, cy - 130, 420, 260, 16);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.amber;
      ctx.beginPath();
      ctx.roundRect(cx - 180, cy - 110, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EKSPERIMEN PELAYAN KAFE', cx, cy - 85);

      // Comparison Left vs Right
      ctx.fillStyle = PAL.ink;
      ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Saat Belum Bayar:', cx - 100, cy - 30);
      ctx.fillText('Setelah Bayar Lunas:', cx + 100, cy - 30);

      ctx.fillStyle = PAL.blue;
      ctx.font = '900 20px "JetBrains Mono", monospace';
      ctx.fillText('HAFAL 100%', cx - 100, cy + 5);

      ctx.fillStyle = PAL.green;
      ctx.font = '900 20px "JetBrains Mono", monospace';
      ctx.fillText('LUPA TOTAL!', cx + 100, cy + 5);

      // Green PAID Stamp
      ctx.strokeStyle = PAL.green;
      ctx.lineWidth = 4;
      ctx.strokeRect(cx + 40, cy + 30, 130, 45);
      ctx.fillStyle = PAL.green;
      ctx.font = '900 22px "JetBrains Mono", monospace';
      ctx.fillText('LUNAS!', cx + 105, cy + 62);
      ctx.restore();

      markerPen(ctx, cx + 130, cy + 70, { color: PAL.green, angle: -0.4, t });

    } else if (beat === 4) {
      // Beat 4: Cognitive Strain & Brain Fog
      whiteboardStickman(ctx, 230, floorY, { pose: 'confused', scale: 1.4, t });

      // Brain Fog Cloud doodle
      const fx = 660, fy = 730;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.red;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(fx - 210, fy - 140, 420, 270, 18);
      ctx.fill(); ctx.stroke();

      // Top Alert
      ctx.fillStyle = PAL.red;
      ctx.beginPath();
      ctx.roundRect(fx - 180, fy - 120, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BAHAYA: KETEGANGAN KOGNITIF', fx, fy - 97);

      // Brain silhouette with tangled yarn
      ctx.fillStyle = PAL.ink;
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Memori kerja terkuras habis', fx, fy - 40);

      ctx.fillStyle = PAL.red;
      ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Memicu Brain Fog & Cemas', fx, fy);

      ctx.fillStyle = PAL.inkLight;
      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Tubuh diam, tapi pikiran lelah!', fx, fy + 45);
      ctx.restore();

      markerPen(ctx, fx + 140, fy + 80, { color: PAL.red, angle: -0.4, t });

    } else if (beat === 5) {
      // Beat 5: The Hack — You Don't Have to Finish It All Tonight
      whiteboardStickman(ctx, 220, floorY, { pose: 'eureka', scale: 1.4, t });

      // Big Eureka Shield
      const hx = 650, hy = 730;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.blue;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(hx - 210, hy - 130, 420, 260, 18);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.blue;
      ctx.beginPath();
      ctx.roundRect(hx - 180, hy - 110, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CARA MENIPU OTAK PURBA', hx, hy - 85);

      ctx.fillStyle = PAL.ink;
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Kamu TIDAK harus', hx, hy - 30);
      ctx.fillText('menyelesaikan semuanya', hx, hy + 5);

      ctx.fillStyle = PAL.blue;
      ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MALAM INI JUGA!', hx, hy + 50);

      ctx.fillStyle = PAL.green;
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.fillText('Cukup buat "Rencana Tindakan"', hx, hy + 90);
      ctx.restore();

      markerPen(ctx, hx + 140, hy + 75, { color: PAL.blue, angle: -0.4, t });

    } else if (beat === 6) {
      // Beat 6: Write Down Tomorrow's Step 1 (Closing the Tab)
      whiteboardStickman(ctx, 220, floorY, { pose: 'eureka', scale: 1.4, t });

      // Notepad Sheet with Written Plan
      const px = 650, py = 740;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.green;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(px - 210, py - 130, 420, 260, 18);
      ctx.fill(); ctx.stroke();

      // Top Tab
      ctx.fillStyle = PAL.green;
      ctx.beginPath();
      ctx.roundRect(px - 180, py - 110, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TUTUP TAB: TULIS LANGKAH 1', px, py - 85);

      // Handwriting
      ctx.textAlign = 'left';
      ctx.fillStyle = PAL.ink;
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillText('> Rencana Besok 09:00:', px - 170, py - 30);
      ctx.fillText('> Buka spreadsheet Bab 2', px - 170, py + 5);
      ctx.fillText('> Tulis draf 100 kata pertama', px - 170, py + 40);

      // Otak Tenang Badge
      ctx.fillStyle = PAL.green;
      ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✓ OTAK MENGANGGAPNYA AMAN!', px - 170, py + 85);
      ctx.restore();

      markerPen(ctx, px + 150, py + 75, { color: PAL.green, angle: -0.4, t });

    } else if (beat === 7) {
      // Beat 7: Peaceful Restful Sleep
      whiteboardStickman(ctx, 360, floorY, { pose: 'eureka', scale: 1.5, t });

      // Peaceful Moon & Closed Notebook Stamp
      const mx = 720, my = 750;
      ctx.save();
      ctx.strokeStyle = PAL.blue;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(mx, my, 120, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = PAL.blue;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(mx, my, 105, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = PAL.blue;
      ctx.font = '900 26px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PIKIRAN', mx, my - 25);
      ctx.fillText('TENANG', mx, my + 15);

      ctx.fillStyle = PAL.ink;
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.fillText('TIDUR NYENYAK', mx, my + 55);
      ctx.restore();

      // Floating Zzz
      ctx.fillStyle = PAL.blue;
      ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('z', 240, 560 + Math.sin(t * 3) * 6);
      ctx.font = '900 42px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Z', 270, 520 + Math.sin(t * 3 + 1) * 8);
    }
  });

  // 5. Header (Standard Whiteboard Top Banner)
  whiteboardHeader(
    ctx,
    'NEUROSAINS & FOKUS',
    'EFEK ZEIGARNIK',
    'Mengapa Tugas Menggantung Menguras Energi Mentalmu?'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'PSIKOLOGI TIDUR',
      title: 'Terjaga Memikirkan Tugas?',
      desc: 'Otak manusia secara biologis gelisah jika ada hal belum tuntas.',
      stat: '02:30',
      statSub: 'ALARM MALAM',
      col: PAL.red
    },
    {
      start: C.masalah?.start,
      tag: 'KOGNISI MODERN',
      title: '50 Tab Mental Terbuka',
      desc: 'Setiap tab mental yang aktif memakan daya memori kerja tanpa henti.',
      stat: 'OVERLOAD',
      statSub: 'KAPASITAS RAM',
      col: PAL.red
    },
    {
      start: C.zeigarnik?.start,
      tag: 'PENELITIAN 1927',
      title: 'Hukum Bluma Zeigarnik',
      desc: 'Tugas yang terputus bertahan 90% lebih kuat di memori aktif manusia.',
      stat: 'ZEIGARNIK',
      statSub: 'EFEK PSIKOLOGIS',
      col: PAL.purple
    },
    {
      start: C.kafe?.start,
      tag: 'STUDI KASUS',
      title: 'Pelayan Kafe Wina',
      desc: 'Begitu bon dibayar, otak langsung menghapus memori pesanan tersebut.',
      stat: 'LUNAS',
      statSub: 'RESET MEMORI',
      col: PAL.amber
    },
    {
      start: C.bahaya?.start,
      tag: 'KESEHATAN MENTAL',
      title: 'Ketegangan Kognitif',
      desc: 'Kelelahan harian seringkali bukan fisik, tapi kecemasan bawah sadar.',
      stat: 'BRAIN FOG',
      statSub: 'BEBAN MENTAL',
      col: PAL.red
    },
    {
      start: C.solusi?.start,
      tag: 'TRIK PSIKOLOGIS',
      title: 'Trik Mengelabui Otak',
      desc: 'Kamu tidak perlu menyelesaikan proyek raksasa itu malam ini juga.',
      stat: 'SOLUSI',
      statSub: 'HACK KOGNITIF',
      col: PAL.blue
    },
    {
      start: C.tuliskan?.start,
      tag: 'TINDAKAN PRAKTIS',
      title: 'Tulis Rencana Tindakan',
      desc: 'Menulis satu langkah besok pagi membuat otak menganggapnya beres.',
      stat: 'STEP 1',
      statSub: 'DI ATAS KERTAS',
      col: PAL.green
    },
    {
      start: C.moral?.start,
      tag: 'KESEJAHTERAAN HIDUP',
      title: 'Tutup Tab Mentalmu',
      desc: 'Keluarkan beban ke kertas, istirahatkan pikiran, dan tidurlah tenang.',
      stat: '100%',
      statSub: 'KEDAMAIAN PIKIRAN',
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

