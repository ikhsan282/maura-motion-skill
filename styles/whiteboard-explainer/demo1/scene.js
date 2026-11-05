// 80 · WHITEBOARD EXPLAINER PRO — Demo 1: Teknik Feynman
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
  else if (t >= C.langkah4?.start) beat = 6;
  else if (t >= C.langkah3?.start) beat = 5;
  else if (t >= C.langkah2?.start) beat = 4;
  else if (t >= C.langkah1?.start) beat = 3;
  else if (t >= C.feynman?.start) beat = 2;
  else if (t >= C.masalah?.start) beat = 1;

  // 2. Whiteboard Background with Marker Dry-Erase Texture
  whiteboardBg(ctx, t, { showGrid: true });

  // 3. Dynamic Camera Panning across Whiteboard
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.15; fx = 520; fy = 840; // Zoom into Illusion box
  } else if (beat === 2) {
    zoom = 1.12; fx = 560; fy = 820; // Feynman quote
  } else if (beat === 3 || beat === 4) {
    zoom = 1.18; fx = 540; fy = 860; // Steps 1 & 2
  } else if (beat === 5) {
    zoom = 1.15; fx = 520; fy = 850; // Red circle gap
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const floorY = 1240;

    // Faint ground line
    wobbleLine(ctx, 100, floorY, 980, floorY, { col: 'rgba(15, 23, 42, 0.15)', width: 3 });

    if (beat === 0) {
      // Beat 0: Confused student with empty mind
      whiteboardStickman(ctx, 320, floorY, { pose: 'confused', scale: 1.45, t });

      // Hand-drawn open book on a desk
      const bx = 660, by = 780;
      ctx.save();
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Big question marks cloud
      ctx.fillStyle = PAL.blue;
      ctx.font = '900 84px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('???', bx, by - 60 + Math.sin(t * 3) * 8);

      // Book pages
      ctx.fillStyle = PAL.white;
      ctx.beginPath();
      ctx.moveTo(bx, by + 40);
      ctx.quadraticCurveTo(bx - 80, by + 10, bx - 140, by + 30);
      ctx.lineTo(bx - 140, by + 110);
      ctx.quadraticCurveTo(bx - 80, by + 90, bx, by + 120);
      ctx.quadraticCurveTo(bx + 80, by + 90, bx + 140, by + 110);
      ctx.lineTo(bx + 140, by + 30);
      ctx.quadraticCurveTo(bx + 80, by + 10, bx, by + 40);
      ctx.fill(); ctx.stroke();

      // Middle spine
      ctx.beginPath();
      ctx.moveTo(bx, by + 40); ctx.lineTo(bx, by + 120);
      ctx.stroke();

      // Book scribble lines
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      for (let l = 0; l < 3; l++) {
        ctx.beginPath();
        ctx.moveTo(bx - 120, by + 60 + l * 15); ctx.lineTo(bx - 20, by + 60 + l * 15);
        ctx.moveTo(bx + 20, by + 60 + l * 15); ctx.lineTo(bx + 120, by + 60 + l * 15);
        ctx.stroke();
      }
      ctx.restore();

      // Drawing marker pen in real-time
      markerPen(ctx, 740, 680, { color: PAL.blue, angle: -0.35, t });

    } else if (beat === 1) {
      // Beat 1: Illusion of Competence (Highlighting everything)
      whiteboardStickman(ctx, 240, floorY, { pose: 'think', scale: 1.4, t });

      // Sticky Note: Ilusi Kompetensi
      stickyNote(ctx, 420, 620, 360, 220, {
        color: PAL.stickyYellow,
        angle: 0.03,
        title: 'ILUSI KOMPETENSI',
        lines: [
          '• Membaca ulang buku berkali-kali',
          '• Menstabilo seluruh halaman',
          '• Mengira otak otomatis paham',
          '• Nyatanya: Pasif & Mudah Lupa!'
        ]
      });

      // Highlighter doodle effect
      ctx.save();
      ctx.fillStyle = PAL.markerHighlight;
      ctx.fillRect(440, 715, 300, 24);
      ctx.fillRect(440, 742, 280, 24);
      ctx.restore();

      // Big Red Cross Mark
      ctx.save();
      ctx.strokeStyle = PAL.red;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(800, 640); ctx.lineTo(870, 710);
      ctx.moveTo(870, 640); ctx.lineTo(800, 710);
      ctx.stroke();
      ctx.restore();

      // Red marker pen
      markerPen(ctx, 880, 720, { color: PAL.red, angle: -0.5, t });

    } else if (beat === 2) {
      // Beat 2: Richard Feynman Quote
      whiteboardStickman(ctx, 240, floorY, { pose: 'point', scale: 1.4, t });

      // Frame with Feynman rule
      const fx = 660, fy = 740;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(fx - 220, fy - 140, 440, 260, 16);
      ctx.fill(); ctx.stroke();

      // Top Tag
      ctx.fillStyle = PAL.blue;
      ctx.beginPath();
      ctx.roundRect(fx - 180, fy - 120, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRINSIP RICHARD FEYNMAN', fx, my => fy - 95);
      ctx.fillText('PRINSIP RICHARD FEYNMAN', fx, fy - 95);

      // Quote text
      ctx.fillStyle = PAL.ink;
      ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('"Jika kamu tak bisa', fx, fy - 35);
      ctx.fillText('menjelaskannya secara', fx, fy);
      ctx.fillText('sederhana,', fx, fy + 35);

      ctx.fillStyle = PAL.red;
      ctx.font = '900 25px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('kamu belum paham!"', fx, fy + 75);
      ctx.restore();

      // Marker drawing
      markerPen(ctx, fx + 160, fy + 95, { color: PAL.red, angle: -0.4, t });

    } else if (beat === 3) {
      // Beat 3: Step 1 — Write Topic on Whiteboard
      whiteboardStickman(ctx, 220, floorY, { pose: 'point', scale: 1.4, t });

      // Big Step 1 Card on board
      const s1x = 640, s1y = 740;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.blue;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(s1x - 220, s1y - 130, 440, 240, 18);
      ctx.fill(); ctx.stroke();

      // Step Number Badge
      ctx.fillStyle = PAL.blue;
      ctx.beginPath();
      ctx.arc(s1x - 170, s1y - 85, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('1', s1x - 170, s1y - 77);

      ctx.textAlign = 'left';
      ctx.fillStyle = PAL.ink;
      ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('TULIS TOPIK TARGET', s1x - 130, s1y - 77);

      // Whiteboard writing doodle
      ctx.fillStyle = PAL.inkLight;
      ctx.font = '700 18px "JetBrains Mono", monospace';
      ctx.fillText('> Teori Gravitasi & Ruang', s1x - 180, s1y - 15);
      ctx.fillText('> Rumus Bunga Majemuk', s1x - 180, s1y + 20);
      ctx.fillText('> Cara Kerja Fotosintesis', s1x - 180, s1y + 55);

      // Blue Underline
      wobbleLine(ctx, s1x - 180, s1y + 75, s1x + 160, s1y + 75, { col: PAL.amber, width: 4 });
      ctx.restore();

      markerPen(ctx, s1x + 140, s1y + 70, { color: PAL.amber, angle: -0.4, t });

    } else if (beat === 4) {
      // Beat 4: Step 2 — Teach to a 12-Year-Old Child
      whiteboardStickman(ctx, 240, floorY, { pose: 'eureka', scale: 1.4, t });

      // Little Kid stickman listening attentively
      whiteboardStickman(ctx, 520, floorY, { pose: 'think', scale: 1.0, facing: -1, accent: PAL.red, t });

      // Speech Bubble connecting them
      const spx = 420, spy = 640;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(spx - 120, spy - 70, 240, 120, 16);
      ctx.fill(); ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(spx - 20, spy + 50); ctx.lineTo(spx - 60, spy + 95); ctx.lineTo(spx, spy + 50);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.ink;
      ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Bayangkan atom', spx, spy - 25);
      ctx.fillText('seperti tata surya!', spx, spy + 5);

      ctx.fillStyle = PAL.blue;
      ctx.font = '800 14px "JetBrains Mono", monospace';
      ctx.fillText('0% JARGON ASING', spx, spy + 32);
      ctx.restore();

      // Step 2 Sticky Note Right
      stickyNote(ctx, 690, 600, 240, 170, {
        color: PAL.stickyCyan,
        angle: -0.04,
        title: 'LANGKAH 2',
        lines: [
          'Ajari anak usia 12 thn',
          'Gunakan kata sederhana',
          'Dilarang pakai istilah rumit'
        ]
      });

    } else if (beat === 5) {
      // Beat 5: Step 3 — Spot the Gaps & Re-read
      whiteboardStickman(ctx, 240, floorY, { pose: 'confused', scale: 1.4, t });

      // Brain diagram with a missing puzzle gap
      const gx = 640, gy = 740;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.red;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(gx - 200, gy - 130, 400, 250, 18);
      ctx.fill(); ctx.stroke();

      // Warning Header
      ctx.fillStyle = PAL.red;
      ctx.beginPath();
      ctx.roundRect(gx - 170, gy - 110, 340, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LANGKAH 3: TEMUKAN CELAH!', gx, gy - 87);

      // Broken / missing link doodle
      ctx.fillStyle = PAL.ink;
      ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Saat kamu mulai bingung...', gx, gy - 30);

      // Red circling loop around the problem
      ctx.strokeStyle = PAL.red;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(gx, gy + 35, 120, 45, 0.1, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = PAL.red;
      ctx.font = '900 20px "JetBrains Mono", monospace';
      ctx.fillText('TITIK BUTA!', gx, gy + 42);

      ctx.fillStyle = PAL.inkLight;
      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Buka buku & pelajari ulang bab ini.', gx, gy + 95);
      ctx.restore();

      markerPen(ctx, gx + 130, gy + 45, { color: PAL.red, angle: -0.3, t });

    } else if (beat === 6) {
      // Beat 6: Step 4 — Simplify with Real-World Analogies
      whiteboardStickman(ctx, 240, floorY, { pose: 'eureka', scale: 1.4, t });

      // Real World Analogy Concept Box
      const ax = 660, ay = 740;
      ctx.save();
      ctx.fillStyle = PAL.white;
      ctx.strokeStyle = PAL.green;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(ax - 220, ay - 140, 440, 260, 20);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.green;
      ctx.beginPath();
      ctx.roundRect(ax - 180, ay - 120, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LANGKAH 4: ANALOGI NYATA', ax, ay - 95);

      // Analogy Doodles
      ctx.fillStyle = PAL.ink;
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Komputer = Juru Masak di Restoran', ax, ay - 40);
      ctx.fillText('RAM = Meja Dapur Tempat Memasak', ax, ay);
      ctx.fillText('SSD = Lemari Penyimpan Bahan Makanan', ax, ay + 40);

      ctx.fillStyle = PAL.amber;
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.fillText('✨ JAUH LEBIH MUDAH DIINGAT! ✨', ax, ay + 85);
      ctx.restore();

      markerPen(ctx, ax + 170, ay + 80, { color: PAL.amber, angle: -0.4, t });

    } else if (beat === 7) {
      // Beat 7: Mastery & Teaching the World
      whiteboardStickman(ctx, 360, floorY, { pose: 'eureka', scale: 1.5, t });

      // Big Stamp of Mastery
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
      ctx.font = '900 28px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PEMAHAMAN', mx, my - 25);
      ctx.fillText('MUTLAK', mx, my + 15);

      ctx.fillStyle = PAL.ink;
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.fillText('100% PAHAM', mx, my + 55);
      ctx.restore();

      // Floating celebratory lightbulbs
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
    'METODE BELAJAR SUPER',
    'TEKNIK FEYNMAN',
    'Cara Memahami Konsep Apapun 10x Lebih Cepat'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'PSIKOLOGI KOGNITIF',
      title: 'Paham vs Sekadar Menghafal',
      desc: 'Menghafal cepat hilang, pemahaman mendalam bertahan seumur hidup.',
      stat: '10x',
      statSub: 'LEBIH TAHAN LAMA',
      col: PAL.blue
    },
    {
      start: C.masalah?.start,
      tag: 'BIAS BELAJAR',
      title: 'Jebakan Ilusi Kompetensi',
      desc: 'Membaca ulang hanya memicu ilusi bahwa otak kita sudah mengerti.',
      stat: '0%',
      statSub: 'RETENSI PASIF',
      col: PAL.red
    },
    {
      start: C.feynman?.start,
      tag: 'PRINSIP NOBEL',
      title: 'Uji Bahasa Sederhana',
      desc: 'Jika masih memakai kata rumit, artinya konsepnya belum terkunyah.',
      stat: 'SEDERHANA',
      statSub: 'KUNCI UTAMA',
      col: PAL.purple
    },
    {
      start: C.langkah1?.start,
      tag: 'LANGKAH SATU',
      title: 'Pilih & Tulis Nama Topik',
      desc: 'Fokuskan pikiran hanya pada satu konsep spesifik di lembar kosong.',
      stat: 'STEP 1',
      statSub: 'FOKUS TUNGGAL',
      col: PAL.blue
    },
    {
      start: C.langkah2?.start,
      tag: 'LANGKAH DUA',
      title: 'Ajarkan ke Anak 12 Tahun',
      desc: 'Gunakan kosakata umum sehari-hari tanpa perlindungan jargon elit.',
      stat: '12 TAHUN',
      statSub: 'TARGET PENDENGAR',
      col: PAL.amber
    },
    {
      start: C.langkah3?.start,
      tag: 'LANGKAH TIGA',
      title: 'Identifikasi Titik Buta',
      desc: 'Setiap bagian yang membuatmu gagap adalah sinyal untuk baca lagi.',
      stat: 'TITIK BUTA',
      statSub: 'CELAH RETENSI',
      col: PAL.red
    },
    {
      start: C.langkah4?.start,
      tag: 'LANGKAH EMPAT',
      title: 'Buat Perumpamaan Nyata',
      desc: 'Kaitkan konsep abstrak dengan benda atau kejadian sehari-hari.',
      stat: 'ANALOGI',
      statSub: 'JEMBATAN LOGIKA',
      col: PAL.green
    },
    {
      start: C.moral?.start,
      tag: 'KESIMPULAN EKSPLORASI',
      title: 'Kecerdasan Adalah Kejernihan',
      desc: 'Ilmuwan hebat bukanlah yang bertele-tele, melainkan yang mencerahkan.',
      stat: '100%',
      statSub: 'PENGUASAAN MATERI',
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

