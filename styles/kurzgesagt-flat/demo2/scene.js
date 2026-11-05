// 79 · KURZGESAGT FLAT MOTION — Demo 2: Skala Waktu Kosmik
// Kalender Kosmik 13.8 Miliar Tahun (Full-Screen 1080x1920 8-Beat Standard)

import * as K from '/styles/kurzgesagt-flat/kit.js';

const { clamp, lerp, ease } = AM.lib;
const { PAL, withCamera, drawCosmicBackground, drawHeader, drawKurzgesagtDuck, drawCallout } = K;

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
  else if (t >= C.sejarah?.start) beat = 6;
  else if (t >= C.manusia?.start) beat = 5;
  else if (t >= C.dinosaurus?.start) beat = 4;
  else if (t >= C.bumi?.start) beat = 3;
  else if (t >= C.galaksi?.start) beat = 2;
  else if (t >= C.bigbang?.start) beat = 1;

  // 2. Cosmic Background
  drawCosmicBackground(ctx, t);

  // 3. Dynamic Camera Zoom & Pan
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.18; fx = 540; fy = 780; // Big Bang epicenter
  } else if (beat === 2) {
    zoom = 1.12; fx = 580; fy = 800; // Galaxy spiral
  } else if (beat === 4) {
    zoom = 1.15; fx = 520; fy = 840; // Dinosaur meteor
  } else if (beat === 5 || beat === 6) {
    zoom = 1.20; fx = 540; fy = 820; // Midnight countdown clock
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const floorY = 1240;

    // Laboratory pod platform
    K.kurzgesagtPodPlatform(ctx, 540, floorY, {
      col: beat >= 5 ? PAL.yellow : PAL.cyan,
      rx: 440,
      ry: 95
    });

    if (beat === 0) {
      // Beat 0: Duck Astronomer looking through giant telescope
      drawKurzgesagtDuck(ctx, 320, floorY - 30, { scale: 1.5, pose: 'curious', t });

      // Brass/Turquoise Telescope on Tripod
      ctx.save();
      const tx = 440, ty = floorY - 140;
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(tx, ty); ctx.lineTo(tx - 35, floorY - 20);
      ctx.moveTo(tx, ty); ctx.lineTo(tx + 45, floorY - 20);
      ctx.stroke();

      // Main Telescope Barrel pointing up
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(-0.48);
      ctx.fillStyle = PAL.cyan;
      ctx.strokeStyle = '#0891b2';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-20, -18, 170, 36, 8);
      ctx.fill(); ctx.stroke();

      // Gold lens rings
      ctx.fillStyle = PAL.yellow;
      ctx.fillRect(130, -22, 22, 44);
      ctx.restore();
      ctx.restore();

      // Giant Holographic Calendar Page (13.8 Billion Years = 1 Year)
      ctx.save();
      const calX = 700, calY = 740 + Math.sin(t * 2.5) * 8;
      ctx.fillStyle = 'rgba(15, 14, 40, 0.9)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(calX - 170, calY - 180, 340, 300, 20);
      ctx.fill(); ctx.stroke();

      // Top Red Binder Header
      ctx.fillStyle = PAL.coral;
      ctx.beginPath();
      ctx.roundRect(calX - 170, calY - 180, 340, 65, [20, 20, 0, 0]);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 24px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KALENDER KOSMIK', calX, calY - 138);

      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 68px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('1 TAHUN', calX, calY - 10);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 20px "JetBrains Mono", monospace';
      ctx.fillText('13.8 MILIAR TAHUN', calX, calY + 45);

      ctx.fillStyle = PAL.muted;
      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('1 Hari = ~37.8 Juta Tahun', calX, calY + 85);
      ctx.restore();

    } else if (beat === 1) {
      // Beat 1: The Big Bang (January 1st, 00:00:00)
      drawKurzgesagtDuck(ctx, 230, floorY - 30, { scale: 1.4, pose: 'celebrate', t });

      // Glowing Singularity Expansion Explosion
      const ex = 620, ey = 730;
      const pulse = 1.0 + 0.15 * Math.sin(t * 8);

      // Blinding Outer Radial Gradient
      const grad = ctx.createRadialGradient(ex, ey, 20, ex, ey, 260 * pulse);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.25, PAL.yellow);
      grad.addColorStop(0.6, PAL.orange);
      grad.addColorStop(0.85, PAL.coral);
      grad.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ex, ey, 260 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Radiating geometric energy spikes
      for (let s = 0; s < 12; s++) {
        const ang = (s / 12) * Math.PI * 2 + t * 0.4;
        const len = (s % 2 === 0 ? 290 : 210) * pulse;
        ctx.strokeStyle = s % 2 === 0 ? PAL.yellow : PAL.cyan;
        ctx.lineWidth = s % 2 === 0 ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + Math.cos(ang) * len, ey + Math.sin(ang) * len);
        ctx.stroke();
      }

      // Singularity Core Pill
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeStyle = PAL.white;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(ex - 120, ey + 180, 240, 48, 14);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 17px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('1 JANUARI • 00:00:00', ex, ey + 211);

    } else if (beat === 2) {
      // Beat 2: Milky Way Spiral Galaxy (Formed in May)
      drawKurzgesagtDuck(ctx, 220, floorY - 30, { scale: 1.4, pose: 'pointing', t });

      // Spiral Galaxy Disc
      const gx = 640, gy = 730;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(t * 0.35);

      // Core glow
      const ggrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 240);
      ggrad.addColorStop(0, '#ffffff');
      ggrad.addColorStop(0.3, PAL.cyan);
      ggrad.addColorStop(0.7, PAL.purple);
      ggrad.addColorStop(1, 'transparent');
      ctx.fillStyle = ggrad;
      ctx.beginPath();
      ctx.arc(0, 0, 240, 0, Math.PI * 2);
      ctx.fill();

      // 4 Spiral Arms
      for (let a = 0; a < 4; a++) {
        const offset = (a * Math.PI) / 2;
        ctx.strokeStyle = a % 2 === 0 ? PAL.cyan : PAL.yellow;
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (let r = 25; r < 210; r += 8) {
          const theta = r * 0.035 + offset;
          const px = Math.cos(theta) * r;
          const py = Math.sin(theta) * (r * 0.55); // tilted ellipse perspective
          if (r === 25) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();

      // Date Stamp Box
      ctx.fillStyle = 'rgba(15, 14, 40, 0.85)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(500, 960, 280, 52, 14);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BULAN MEI: BIMA SAKTI', 640, 993);

    } else if (beat === 3) {
      // Beat 3: Earth & Early Microbial Life (September)
      drawKurzgesagtDuck(ctx, 230, floorY - 30, { scale: 1.4, pose: 'curious', t });

      // Earth Globe Flat-Vector
      const ex = 640, ey = 730;
      ctx.save();
      // Atmospheric Glow
      ctx.fillStyle = 'rgba(79, 172, 254, 0.22)';
      ctx.beginPath();
      ctx.arc(ex, ey, 175, 0, Math.PI * 2);
      ctx.fill();

      // Ocean Base (Deep Cyan)
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(ex, ey, 150, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Continents (Green Vector Blobs)
      ctx.save();
      ctx.beginPath();
      ctx.arc(ex, ey, 150, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = '#10b981';
      // Continent 1
      ctx.beginPath();
      ctx.ellipse(ex - 40, ey - 30, 75, 55, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Continent 2
      ctx.beginPath();
      ctx.ellipse(ex + 50, ey + 40, 65, 45, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Swirling white clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.roundRect(ex - 120, ey - 70, 110, 18, 9);
      ctx.roundRect(ex - 20, ey + 10, 140, 22, 11);
      ctx.roundRect(ex - 90, ey + 80, 100, 16, 8);
      ctx.fill();
      ctx.restore();

      // Orbiting Microbe Magnifier Orb
      const mobX = 860, mobY = 620 + Math.sin(t * 3) * 8;
      ctx.fillStyle = 'rgba(20, 18, 50, 0.9)';
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(mobX, mobY, 65, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Primordial cyan bacteria
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.roundRect(mobX - 25, mobY - 14, 50, 28, 14);
      ctx.fill();
      // Flagella tail
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(mobX - 25, mobY);
      ctx.quadraticCurveTo(mobX - 45, mobY + 15, mobX - 52, mobY - 5);
      ctx.stroke();

      ctx.fillStyle = PAL.white;
      ctx.font = '800 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SEL PERTAMA', mobX, mobY + 45);
      ctx.restore();

    } else if (beat === 4) {
      // Beat 4: Dinosaurs (Dec 26) & Fiery Asteroid (Dec 30)
      drawKurzgesagtDuck(ctx, 220, floorY - 30, { scale: 1.4, pose: 'drowsy', t });

      // Cute Kurzgesagt T-Rex silhouette
      const rexX = 490, rexY = floorY - 35;
      ctx.save();
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 4;

      // Rex Body
      ctx.beginPath();
      ctx.ellipse(rexX, rexY - 80, 75, 95, 0.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Rex Head & Big Jaw
      ctx.beginPath();
      ctx.roundRect(rexX + 25, rexY - 190, 95, 65, 18);
      ctx.fill(); ctx.stroke();

      // Tiny Cute Rex Arms
      ctx.beginPath();
      ctx.roundRect(rexX + 50, rexY - 95, 30, 14, 6);
      ctx.fill(); ctx.stroke();

      // Rex Eye
      ctx.fillStyle = PAL.ink;
      ctx.beginPath();
      ctx.arc(rexX + 85, rexY - 165, 8, 0, Math.PI * 2);
      ctx.fill();

      // Rex Tail
      ctx.beginPath();
      ctx.moveTo(rexX - 60, rexY - 70);
      ctx.quadraticCurveTo(rexX - 140, rexY - 60, rexX - 160, rexY - 15);
      ctx.lineTo(rexX - 50, rexY - 20);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // Flaming Asteroid Streaking from Top Right
      const ax = 880 - (t * 80) % 350;
      const ay = 520 + (t * 60) % 280;
      ctx.save();
      // Fiery plasma tail
      const tailGrad = ctx.createLinearGradient(ax, ay, ax + 180, ay - 140);
      tailGrad.addColorStop(0, PAL.yellow);
      tailGrad.addColorStop(0.4, PAL.coral);
      tailGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + 170, ay - 120);
      ctx.lineTo(ax + 130, ay - 160);
      ctx.closePath();
      ctx.fill();

      // Asteroid Rock Core
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = PAL.orange;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(ax, ay, 34, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // Date Stamp Box
      ctx.fillStyle = 'rgba(15, 14, 40, 0.85)';
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(640, 960, 300, 52, 14);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.coral;
      ctx.font = '900 17px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('26-30 DESEMBER: DINOSAURUS', 790, 993);

    } else if (beat === 5) {
      // Beat 5: Modern Humans Emerge (31 Dec, 23:59:00)
      drawKurzgesagtDuck(ctx, 240, floorY - 30, { scale: 1.4, pose: 'pointing', t });

      // Giant Holographic Digital Countdown Clock
      const cx = 660, cy = 740;
      ctx.save();
      // Outer Clock Frame
      ctx.fillStyle = 'rgba(12, 10, 36, 0.95)';
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(cx - 220, cy - 140, 440, 260, 24);
      ctx.fill(); ctx.stroke();

      // Date Top Bar
      ctx.fillStyle = 'rgba(255, 230, 0, 0.15)';
      ctx.beginPath();
      ctx.roundRect(cx - 200, cy - 120, 400, 42, 10);
      ctx.fill();

      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 17px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MALAM TAHUN BARU: 31 DESEMBER', cx, cy - 93);

      // Huge Glowing Digits
      ctx.fillStyle = PAL.white;
      ctx.font = '900 74px "JetBrains Mono", monospace';
      ctx.fillText('23:59:00', cx, cy + 10);

      // Label below digits
      ctx.fillStyle = PAL.cyan;
      ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Homo Sapiens Lahir di Muka Bumi', cx, cy + 65);

      ctx.fillStyle = PAL.muted;
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillText('(Tinggal 60 Detik Sebelum Tahun Berakhir)', cx, cy + 96);
      ctx.restore();

    } else if (beat === 6) {
      // Beat 6: Recorded Civilization (Last 14 Seconds!)
      drawKurzgesagtDuck(ctx, 210, floorY - 30, { scale: 1.4, pose: 'celebrate', t });

      // Hologram of The Last 14 Seconds
      const hx = 640, hy = 720;
      ctx.save();
      // Clock Ring
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(hx, hy, 150, -Math.PI / 2, -Math.PI / 2 + ((14 / 60) * Math.PI * 2));
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(hx, hy, 150, 0, Math.PI * 2);
      ctx.stroke();

      // Big "14 DETIK" in center
      ctx.fillStyle = PAL.coral;
      ctx.font = '900 72px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('14 DETIK', hx, hy + 10);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.fillText('SELURUH SEJARAH TERTULIS', hx, hy + 50);

      // 4 Milestone Pills floating around
      const milestones = [
        { label: 'Piramida', time: '11 dtk lalu', x: hx - 220, y: hy - 80 },
        { label: 'Revolusi Industri', time: '2 dtk lalu', x: hx + 220, y: hy - 80 },
        { label: 'Mendarat di Bulan', time: '0.2 dtk lalu', x: hx - 210, y: hy + 110 },
        { label: 'Era Internet & AI', time: '0.1 dtk lalu', x: hx + 210, y: hy + 110 },
      ];

      milestones.forEach(m => {
        ctx.fillStyle = 'rgba(15, 14, 40, 0.9)';
        ctx.strokeStyle = PAL.cyan;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(m.x - 90, m.y - 25, 180, 52, 12);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = PAL.white;
        ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(m.label, m.x, m.y - 2);

        ctx.fillStyle = PAL.yellow;
        ctx.font = '700 12px "JetBrains Mono", monospace';
        ctx.fillText(m.time, m.x, m.y + 18);
      });
      ctx.restore();

    } else if (beat === 7) {
      // Beat 7: The Cosmic Moral — We are the Universe Conscious of Itself
      drawKurzgesagtDuck(ctx, 360, floorY - 30, { scale: 1.5, pose: 'celebrate', t });

      // Earth & Glowing Universe Eyes Hologram
      const ux = 720, uy = 730;
      ctx.save();
      // Glowing cosmic sphere
      const ugrad = ctx.createRadialGradient(ux, uy, 10, ux, uy, 150);
      ugrad.addColorStop(0, PAL.cyan);
      ugrad.addColorStop(0.6, PAL.purple);
      ugrad.addColorStop(1, 'transparent');
      ctx.fillStyle = ugrad;
      ctx.beginPath();
      ctx.arc(ux, uy, 150, 0, Math.PI * 2);
      ctx.fill();

      // Earth floating peacefully
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(ux, uy, 75, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Swirling golden stardust rings
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(ux, uy, 125, 45, 0.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 21px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KITA ADALAH ALAM SEMESTA', ux, uy + 130);

      ctx.fillStyle = PAL.yellow;
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.fillText('YANG SEDANG MENELITI DIRINYA', ux, uy + 160);
      ctx.restore();
    }
  });

  // 5. Header (Standard Kurzgesagt Top Banner)
  drawHeader(
    ctx,
    'ASTROFISIKA & KOSMOLOGI',
    'SKALA WAKTU KOSMIK',
    'Jika 13.8 Miliar Tahun Dimampatkan Jadi 1 Tahun Kalender'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'KOSMOLOGI CARL SAGAN',
      title: 'Kalender Kosmik 1 Tahun',
      desc: '13.8 Miliar tahun semesta dimampatkan jadi 365 hari kalender.',
      stat: '13.8 M',
      statSub: 'TAHUN USIA SEMESTA',
      col: PAL.cyan
    },
    {
      start: C.bigbang?.start,
      tag: 'KOSMOLOGI PURBA',
      title: '1 Januari: Dentuman Besar',
      desc: 'Ruang dan waktu lahir pada detik 00:00:00 tanggal 1 Januari.',
      stat: '1 JAN',
      statSub: 'AWAL SEGALA MATERI',
      col: PAL.yellow
    },
    {
      start: C.galaksi?.start,
      tag: 'EVOLUSI GALAKSI',
      title: 'Bulan Mei: Bima Sakti Terlahir',
      desc: 'Butuh ribuan juta tahun bagi bintang purba membentuk galaksi spiral.',
      stat: 'MEI',
      statSub: '100 MILIAR BINTANG',
      col: PAL.purple
    },
    {
      start: C.bumi?.start,
      tag: 'GEOLOGI & BIOLOGI',
      title: 'September: Tata Surya & Sel Purba',
      desc: 'Bumi baru terbentuk pada 2 September, mikroba hadir akhir bulan.',
      stat: '4.54 M',
      statSub: 'TAHUN USIA BUMI',
      col: PAL.cyan
    },
    {
      start: C.dinosaurus?.start,
      tag: 'PALEONTOLOGI',
      title: '26-30 Des: Dinosaurus & Musnah',
      desc: 'Hanya berkuasa 4 hari kalender kosmik sebelum dihantam asteroid.',
      stat: '4 HARI',
      statSub: '165 JUTA TAHUN',
      col: PAL.coral
    },
    {
      start: C.manusia?.start,
      tag: 'ANTROPOLOGI',
      title: '31 Des 23:59:00: Manusia Hadir',
      desc: 'Spesies Homo sapiens baru muncul di detik ke-60 sebelum tahun berganti.',
      stat: '23:59',
      statSub: 'DETIK TERAKHIR',
      col: PAL.yellow
    },
    {
      start: C.sejarah?.start,
      tag: 'SEJARAH PERADABAN',
      title: '14 Detik Terakhir: Seluruh Sejarah',
      desc: 'Piramida, dinasti kuno, hingga ponsel cerdas terjadi di 14 detik.',
      stat: '14 DTK',
      statSub: 'PERADABAN TERTULIS',
      col: PAL.coral
    },
    {
      start: C.moral?.start,
      tag: 'FILOSOFI SAINS',
      title: 'Mata & Pikiran Alam Semesta',
      desc: 'Kita adalah cara bagi kosmos untuk berpikir dan mengagumi dirinya.',
      stat: '100%',
      statSub: 'KESADARAN KOSMIK',
      col: PAL.cyan
    }
  ];

  const currentCallout = callouts[beat] || callouts[0];
  const calloutAlpha = pop(t, currentCallout.start, 0.4);

  drawCallout(ctx, 540, 1485, 960, 165, {
    tag: currentCallout.tag,
    title: currentCallout.title,
    desc: currentCallout.desc,
    stat: currentCallout.stat,
    statSub: currentCallout.statSub,
    col: currentCallout.col,
    a: calloutAlpha
  });
}

