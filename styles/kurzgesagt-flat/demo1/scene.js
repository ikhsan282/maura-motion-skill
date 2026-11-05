// 79 · KURZGESAGT FLAT MOTION — Demo 1: Sistem Pembersih Sampah Otak
// Prototipe Mandiri Full-Screen 1080x1920 (8 Beat Dinamis)

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

/**
 * Main Render Function
 */
export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);

  // 1. Determine Current Beat (8 Beats)
  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.arsip?.start) beat = 6;
  else if (t >= C.gliatik?.start) beat = 5;
  else if (t >= C.menyusut?.start) beat = 4;
  else if (t >= C.sempit?.start) beat = 3;
  else if (t >= C.sampah?.start) beat = 2;
  else if (t >= C.pabrik?.start) beat = 1;

  // 2. Cosmic Background
  drawCosmicBackground(ctx, t);

  // 3. Dynamic Camera Zoom & Pan
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.15; fx = 520; fy = 820; // focus on busy neuron factory
  } else if (beat === 4 || beat === 5) {
    zoom = 1.18; fx = 560; fy = 850; // close up on shrinking cells & cleansing wave
  } else if (beat === 6) {
    zoom = 1.12; fx = 540; fy = 840; // archive filing
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const floorY = 1240;

    // Floor Platform (Glossy sci-fi laboratory pod)
    ctx.save();
    ctx.fillStyle = 'rgba(22, 20, 60, 0.65)';
    ctx.strokeStyle = PAL.border;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(540, floorY, 440, 95, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing rim on platform
    ctx.strokeStyle = beat >= 4 ? PAL.cyan : PAL.purple;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(540, floorY, 410, 80, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    // Visual Metaphors depending on beat:
    if (beat === 0) {
      // Beat 0: Exhausted Duck Scientist
      drawKurzgesagtDuck(ctx, 360, floorY - 30, { scale: 1.5, pose: 'drowsy', t });

      // Question Mark Hologram Orb
      ctx.save();
      const hx = 720, hy = 760 + Math.sin(t * 3) * 10;
      ctx.fillStyle = 'rgba(0, 242, 254, 0.12)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(hx, hy, 95, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Orbital glow rings around hologram
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy, 120, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 92px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', hx, hy + 32);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 16px "JetBrains Mono", monospace';
      ctx.fillText('MENGAPA KITA TIDUR?', hx, hy + 155);
      ctx.restore();

    } else if (beat === 1) {
      // Beat 1: Neuron Factory (Busy firing electrical synapses)
      drawKurzgesagtDuck(ctx, 240, floorY - 30, { scale: 1.4, pose: 'pointing', t });

      // Synapse Nodes
      const nodes = [
        { x: 500, y: 620, label: 'NEURON A' },
        { x: 780, y: 580, label: 'NEURON B' },
        { x: 590, y: 840, label: 'NEURON C' },
        { x: 860, y: 810, label: 'NEURON D' }
      ];

      // Electrical connection lines
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(nodes[1].x, nodes[1].y);
      ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(nodes[2].x, nodes[2].y);
      ctx.moveTo(nodes[1].x, nodes[1].y); ctx.lineTo(nodes[3].x, nodes[3].y);
      ctx.moveTo(nodes[2].x, nodes[2].y); ctx.lineTo(nodes[3].x, nodes[3].y);
      ctx.stroke();

      // Pulsing energy sparks
      nodes.forEach((n, i) => {
        const pulse = 0.85 + 0.25 * Math.sin(t * 8 + i);
        ctx.fillStyle = PAL.yellow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 34 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.white;
        ctx.font = '800 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + 54);
      });

    } else if (beat === 2 || beat === 3) {
      // Beat 2 & 3: Toxic Waste (Beta-Amyloid Blobs) & Dense Crowding
      drawKurzgesagtDuck(ctx, 230, floorY - 30, { scale: 1.4, pose: 'drowsy', t });

      // Tightly packed brain cells (dense pink/purple blocks)
      for (let i = 0; i < 4; i++) {
        const cx = 490 + (i % 2) * 260;
        const cy = 620 + Math.floor(i / 2) * 190;
        ctx.fillStyle = '#6b21a8';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.roundRect(cx - 95, cy - 70, 190, 140, 26);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SEL OTAK', cx, cy + 5);
      }

      // Toxic Waste Blobs (Spiky neon coral blobs)
      const waste = [
        { x: 620, y: 710 }, { x: 740, y: 640 },
        { x: 610, y: 890 }, { x: 880, y: 790 }
      ];
      waste.forEach((w, i) => {
        const bobW = Math.sin(t * 4 + i) * 6;
        ctx.fillStyle = PAL.coral;
        ctx.strokeStyle = '#ffe4e6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w.x, w.y + bobW, 30, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('AMILOID', w.x, w.y + bobW + 4);
      });

      if (beat === 3) {
        // Warning Sign: JALUR TERTUTUP
        ctx.save();
        ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
        ctx.beginPath();
        ctx.roundRect(430, 970, 480, 52, 14);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 17px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ RUANG SEMPIT • ALIRAN TERBLOKIR', 670, 1003);
        ctx.restore();
      }

    } else if (beat === 4 || beat === 5) {
      // Beat 4 & 5: Cells Shrink by 60% & Glymphatic Ocean Wave Cleanses!
      drawKurzgesagtDuck(ctx, 220, floorY - 30, { scale: 1.4, pose: 'sleeping', t });

      // Shrunken cells (smaller rounded circles with wide open gaps)
      const shrinkScale = beat === 4 ? 0.65 : 0.5;
      for (let i = 0; i < 4; i++) {
        const cx = 500 + (i % 2) * 280;
        const cy = 620 + Math.floor(i / 2) * 200;
        ctx.fillStyle = '#3730a3';
        ctx.strokeStyle = PAL.cyan;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 60 * shrinkScale, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = PAL.cyan;
        ctx.font = '800 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('-60%', cx, cy + 4);
      }

      // Cleansing Fluid Wave (Cyan fluid stream flowing through gaps)
      ctx.save();
      const waveOffset = (t * 260) % 800;
      const g = ctx.createLinearGradient(400, 0, 960, 0);
      g.addColorStop(0, 'rgba(0, 242, 254, 0.12)');
      g.addColorStop(0.5, 'rgba(0, 242, 254, 0.55)');
      g.addColorStop(1, 'rgba(0, 242, 254, 0.12)');
      ctx.fillStyle = g;

      // Flowing fluid ribbon
      ctx.beginPath();
      ctx.moveTo(380, 580);
      ctx.bezierCurveTo(550, 500, 720, 750, 940, 620);
      ctx.lineTo(940, 910);
      ctx.bezierCurveTo(720, 1020, 550, 780, 380, 860);
      ctx.closePath();
      ctx.fill();

      // Sparkling cleansing bubbles
      for (let b = 0; b < 16; b++) {
        const bx = 410 + ((b * 42 + waveOffset) % 490);
        const by = 680 + Math.sin(bx * 0.02 + t * 4) * 60;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx, by, (b % 3) + 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Banner: SISTEM GLIATIK AKTIF
      ctx.save();
      ctx.fillStyle = 'rgba(6, 182, 212, 0.95)';
      ctx.beginPath();
      ctx.roundRect(430, 970, 480, 52, 14);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = PAL.ink;
      ctx.font = '900 17px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🌊 SISTEM GLIATIK • CUCI RACUN 100%', 670, 1003);
      ctx.restore();

    } else if (beat === 6) {
      // Beat 6: Memory Archive Crystals Sorting
      drawKurzgesagtDuck(ctx, 240, floorY - 30, { scale: 1.4, pose: 'pointing', t });

      // Holographic crystal memory pedestals
      const crystals = [
        { label: 'KEAHLIAN', stat: 'DISIMPAN', col: PAL.cyan, x: 500, y: 730 },
        { label: 'PENGALAMAN', stat: 'DIKUNCI', col: PAL.teal, x: 710, y: 680 },
        { label: 'DATA SAMPAH', stat: 'DIHAPUS', col: PAL.coral, x: 910, y: 790 }
      ];

      crystals.forEach((c) => {
        ctx.save();
        ctx.translate(c.x, c.y + Math.sin(t * 3) * 8);

        // Crystal Diamond
        ctx.fillStyle = c.col;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.lineTo(46, 0);
        ctx.lineTo(0, 56);
        ctx.lineTo(-46, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Label pill
        ctx.fillStyle = 'rgba(15, 14, 40, 0.9)';
        ctx.strokeStyle = c.col;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-75, 74, 150, 36, 10);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(c.label, 0, 98);
        ctx.restore();
      });

    } else {
      // Beat 7: Triumphant Scientist Duck with Giant Glowing Brain
      drawKurzgesagtDuck(ctx, 320, floorY - 30, { scale: 1.5, pose: 'celebrate', t });

      // Glowing Brain Hologram on Right
      ctx.save();
      const bx = 710, by = 750 + Math.sin(t * 3) * 6;

      // Brain Hologram Backdrop Orb
      const hg = ctx.createRadialGradient(bx, by, 30, bx, by, 180);
      hg.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
      hg.addColorStop(0.7, 'rgba(139, 92, 246, 0.2)');
      hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(bx, by, 180, 0, Math.PI * 2);
      ctx.fill();

      // Stylized Brain Left Hemisphere
      ctx.fillStyle = PAL.cyan;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(bx - 36, by - 20, 52, Math.PI * 0.5, Math.PI * 1.5);
      ctx.quadraticCurveTo(bx - 30, by - 90, bx - 6, by - 70);
      ctx.quadraticCurveTo(bx - 10, by + 40, bx - 36, by + 32);
      ctx.fill(); ctx.stroke();

      // Stylized Brain Right Hemisphere
      ctx.fillStyle = PAL.teal;
      ctx.beginPath();
      ctx.arc(bx + 36, by - 20, 52, Math.PI * 1.5, Math.PI * 0.5);
      ctx.quadraticCurveTo(bx + 30, by - 90, bx + 6, by - 70);
      ctx.quadraticCurveTo(bx + 10, by + 40, bx + 36, by + 32);
      ctx.fill(); ctx.stroke();

      // Golden Sparkling Idea Bulb above duck
      const lx = 320, ly = floorY - 280 + Math.sin(t * 4) * 6;
      ctx.fillStyle = PAL.yellow;
      ctx.beginPath();
      ctx.arc(lx, ly, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Radiant beams
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        ctx.strokeStyle = PAL.yellow;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(lx + Math.cos(ang) * 55, ly + Math.sin(ang) * 55);
        ctx.lineTo(lx + Math.cos(ang) * 78, ly + Math.sin(ang) * 78);
        ctx.stroke();
      }

      // 100% CLEAN TAG
      ctx.fillStyle = 'rgba(6, 182, 212, 0.95)';
      ctx.beginPath();
      ctx.roundRect(bx - 120, by + 90, 240, 44, 12);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = PAL.ink;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✨ OTAK BERSIH 100%', bx, by + 118);

      ctx.restore();
    }
  });

  // 5. Header Texts per Beat
  const headers = [
    ['01 • PARADOKS BIOLOGI', 'MENGAPA KITA BUTUH TIDUR?', 'Mengapa Manusia Rela Menghabiskan Sepertiga Hidupnya Terpejam?'],
    ['02 • PABRIK NEURON', 'AKTIVITAS OTAK DI SIANG HARI', 'Miliaran Neuron Bekerja Membakar Energi Menjalankan Pikiran'],
    ['03 • RACUN METABOLIK', 'PENUMPUKAN BETA-AMILOID', 'Aktivitas Berpikir Menghasilkan Sampah Kimia Beracun'],
    ['04 • KEPADATAN SEL', 'SIANG: JALUR PEMBERSIH TERTUTUP', 'Sel Otak Tersusun Rapat, Cairan Pembersih Tidak Bisa Masuk'],
    ['05 • KEAJAIBAN TIDUR', 'SEL OTAK MENYUSUT 60%', 'Saat Terlelap, Volume Sel Menyusut Membuka Ruang Antarsel'],
    ['06 • SISTEM GLIATIK', 'GELOMBANG SEREBROSPINAL', 'Banjir Cairan Pembersih Mengalir Menyapu Bersih Racun Otak'],
    ['07 • ARSIP MEMORI', 'KONSOLIDASI INGATAN PANJANG', 'Otak Menyortir Data: Mengunci Ilmu Penting, Membuang Sampah'],
    ['08 • SERVIS BIOLOGIS', 'TIDUR ADALAH KEBUTUHAN JUARA', 'Jaga Waktu Tidurmu & Biarkan Otakmu Selalu Tajam!'],
  ][beat];

  drawHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? PAL.cyan : (beat === 2 || beat === 3 ? PAL.coral : PAL.yellow)
  });

  // 6. Educational Callout Card per Beat
  const callouts = [
    { tag: 'MISTERI EVOLUSI', title: '1/3 Hidup Manusia Dihabiskan untuk Tidur', desc: 'Jika tidur tidak memiliki fungsi vital, ini adalah blunder evolusi terbesar', stat: '33% HIDUP', statSub: 'WAKTU TIDUR', col: PAL.cyan, c: C.hook },
    { tag: 'METABOLISME OTAK', title: 'Otak Membakar 20% Kalori Seluruh Tubuh', desc: 'Aktivitas berpikir terus-menerus memproduksi residu metabolik mikroskopis', stat: '20% ENERGI', statSub: 'KONSUMSI OTAK', col: PAL.yellow, c: C.pabrik },
    { tag: 'BETA-AMYLOID', title: 'Plak Beracun Pemicu Kabut & Penuaan Otak', desc: 'Penumpukan sampah amiloid menurunkan daya ingat dan ketajaman mental', stat: 'RACUN', statSub: 'BETA-AMILOID', col: PAL.coral, c: C.sampah },
    { tag: 'RINTANGAN FISIK', title: 'Di Siang Hari Sel Otak Tersusun Sangat Padat', desc: 'Ruang interselular hanya 20%, menghalangi proses pembersihan cairan', stat: 'TERSUMBAT', statSub: 'RUANG KETAT', col: PAL.coral, c: C.sempit },
    { tag: 'PENEMUAN 2012', title: 'Dr. Maiken Nedergaard: Sel Menyusut 60%', desc: 'Kanal antarsel melebar drastis begitu tubuh masuk ke fase Deep Sleep', stat: 'SUSUT 60%', statSub: 'RUANG MELEBAR', col: PAL.cyan, c: C.menyusut },
    { tag: 'GLYMPHATIC SYSTEM', title: 'Cerebrospinal Fluid Membasuh Seluruh Otak', desc: 'Aliran cairan 10x lipat lebih aktif di malam hari membersihkan racun', stat: '10x CEPAT', statSub: 'ALIRAN CAIRAN', col: PAL.cyan, c: C.gliatik },
    { tag: 'MEMORY CONSOLIDATION', title: 'Transfer dari Hipokampus ke Neokorteks', desc: 'Tidur nyenyak adalah saat ingatan jangka pendek diubah menjadi permanen', stat: 'ARSIP KUAT', statSub: 'LONG-TERM', col: PAL.teal, c: C.arsip },
    { tag: 'PESAN JUARA', title: 'Tidur Adalah Servis Rutin Menjaga Ketajaman', desc: 'Prioritaskan tidur berkualitas malam ini demi kejernihan masa depanmu!', stat: 'RESET 100%', statSub: 'OTAK TAJAM', col: PAL.yellow, c: C.moral },
  ][beat];

  drawCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    statSub: callouts.statSub,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0)
  });
}
