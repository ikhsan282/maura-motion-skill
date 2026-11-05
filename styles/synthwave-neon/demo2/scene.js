// 82 · CYBERPUNK RETRO SYNTHWAVE — Demo 2: Hukum Moore & Ledakan Komputasi
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
  else if (t >= C.kuantum?.start) beat = 6;
  else if (t >= C.batas?.start) beat = 5;
  else if (t >= C.ledakan?.start) beat = 4;
  else if (t >= C.perjalanan?.start) beat = 3;
  else if (t >= C.eksponensial?.start) beat = 2;
  else if (t >= C.hukum?.start) beat = 1;

  // 2. Moving Neon Grid Background
  const speed = beat >= 4 ? 3.6 : 2.4;
  synthwaveBg(ctx, t, { horizonY: 960, gridSpeed: speed });

  // 3. Dynamic Camera Zoom
  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1) {
    zoom = 1.15; fx = 540; fy = 820; // Moore curve
  } else if (beat === 4) {
    zoom = 1.20; fx = 540; fy = 780; // AI neural core
  } else if (beat === 6) {
    zoom = 1.18; fx = 560; fy = 800; // Quantum Qubit
  } else if (beat === 7) {
    zoom = 1.12; fx = 540; fy = 840; // Super intelligence
  }

  // 4. World Content with Camera
  withCamera(ctx, { zoom, fx, fy }, () => {
    const floorY = 1240;

    // Cyber Platform Base
    ctx.save();
    ctx.fillStyle = 'rgba(13, 2, 33, 0.85)';
    ctx.strokeStyle = beat >= 6 ? PAL.cyan : PAL.hotPink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(540, floorY, 380, 78, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    if (beat === 0) {
      // Beat 0: Apollo 11 vs Smartphone
      cyberStickman(ctx, 300, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Hologram of Silicon Chip (Smartphone)
      const cx = 700, cy = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cx - 150, cy - 130, 300, 260, 20);
      ctx.fill(); ctx.stroke();

      // Chip Core Die
      ctx.fillStyle = '#05010d';
      ctx.strokeStyle = PAL.hotPink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cx - 75, cy - 75, 150, 150, 14);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 28px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('100 M', cx, cy - 10);

      ctx.fillStyle = PAL.cyan;
      ctx.font = '800 14px "JetBrains Mono", monospace';
      ctx.fillText('TRANSISTOR', cx, cy + 20);

      ctx.fillStyle = PAL.hotPink;
      ctx.font = '900 18px "JetBrains Mono", monospace';
      ctx.fillText('> APOLLO 11 x 1.000.000', cx, cy + 95);
      ctx.restore();

      cyberReticle(ctx, cx + 120, cy - 100, 30, { col: PAL.cyan, angle: t * 3, label: 'CHIP', t });

    } else if (beat === 1) {
      // Beat 1: Gordon Moore 1965 Law Curve
      cyberStickman(ctx, 230, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Exponential Curve Chart Box
      const gx = 650, gy = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.hotPink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(gx - 210, gy - 140, 420, 280, 18);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.hotPink;
      ctx.beginPath();
      ctx.roundRect(gx - 180, gy - 120, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HUKUM MOORE 1965: 2x PER 2 TAHUN', gx, gy - 97);

      // Exponential Curve Line
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(gx - 160, gy + 80);
      ctx.quadraticCurveTo(gx, gy + 75, gx + 160, gy - 40);
      ctx.stroke();

      // Transistor Milestones
      const pts = [
        { year: '1971', num: '2.3k', x: gx - 140, y: gy + 78 },
        { year: '1995', num: '5.5M', x: gx - 30, y: gy + 65 },
        { year: '2024', num: '100B', x: gx + 140, y: gy - 35 }
      ];

      pts.forEach(p => {
        ctx.fillStyle = PAL.yellow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.white;
        ctx.font = '800 12px "JetBrains Mono", monospace';
        ctx.fillText(p.year, p.x, p.y + 22);

        ctx.fillStyle = PAL.hotPink;
        ctx.font = '900 13px "JetBrains Mono", monospace';
        ctx.fillText(p.num, p.x, p.y - 12);
      });
      ctx.restore();

      cyberReticle(ctx, gx + 150, gy + 80, 30, { col: PAL.cyan, angle: -t * 3, label: 'EXP', t });

    } else if (beat === 2) {
      // Beat 2: Linear vs Exponential Thought
      cyberStickman(ctx, 230, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Comparison Box
      const ex = 660, ey = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(10, 2, 26, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(ex - 210, ey - 130, 420, 260, 18);
      ctx.fill(); ctx.stroke();

      // Top Tag
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.roundRect(ex - 180, ey - 110, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LINIER VS EKSPONENSIAL', ex, ey - 87);

      // Linear
      ctx.fillStyle = PAL.white;
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Otak Manusia (Linier):', ex - 170, ey - 35);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 18px "JetBrains Mono", monospace';
      ctx.fillText('1 → 2 → 3 → 4 → 5 → 30 langkah', ex - 170, ey - 5);

      // Exponential
      ctx.fillStyle = PAL.hotPink;
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillText('Komputasi (Eksponensial):', ex - 170, ey + 45);
      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 18px "JetBrains Mono", monospace';
      ctx.fillText('1 → 2 → 4 → 8 → 1.000.000.000!', ex - 170, ey + 75);
      ctx.restore();

      cyberReticle(ctx, ex + 140, ey + 70, 30, { col: PAL.hotPink, angle: t * 4, label: 'SCALE', t });

    } else if (beat === 3) {
      // Beat 3: Room-sized ENIAC to grain of rice microchip
      cyberStickman(ctx, 240, floorY, { pose: 'ready', color: PAL.cyan, t });

      // Hardware Evolution Hologram
      const hx = 660, hy = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.violet;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(hx - 210, hy - 140, 420, 270, 18);
      ctx.fill(); ctx.stroke();

      // Top Tag
      ctx.fillStyle = PAL.violet;
      ctx.beginPath();
      ctx.roundRect(hx - 180, hy - 120, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MINIATURISASI SILIKON', hx, hy - 97);

      // 1950 vs 2024
      ctx.fillStyle = PAL.white;
      ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Tahun 1950: Komputer Sebesar Gedung', hx, cy => hy - 35);
      ctx.fillText('Tahun 1950: Komputer Sebesar Gedung', hx, hy - 35);

      ctx.fillStyle = PAL.cyan;
      ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Hari Ini: Muat di Ujung Beras!', hx, hy + 20);

      ctx.fillStyle = PAL.hotPink;
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillText('// Efisiensi Energi Jutaan Kali Lipat', hx, hy + 75);
      ctx.restore();

      cyberReticle(ctx, hx + 140, hy + 75, 30, { col: PAL.cyan, angle: -t * 3, label: 'NANO', t });

    } else if (beat === 4) {
      // Beat 4: AI Modern Explosion (Neural Core Matrix)
      cyberStickman(ctx, 230, floorY, { pose: 'hack', color: PAL.cyan, t });

      // Glowing Neural Network Core
      const nx = 660, ny = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(nx - 210, ny - 140, 420, 280, 20);
      ctx.fill(); ctx.stroke();

      // Top Tag
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.roundRect(nx - 180, ny - 120, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LEDALAN AI: JARINGAN SARAF', nx, ny - 97);

      // Neural nodes
      const nodes = [
        { x: nx - 120, y: ny - 30 }, { x: nx - 120, y: ny + 40 },
        { x: nx, y: ny - 50 }, { x: nx, y: ny }, { x: nx, y: ny + 50 },
        { x: nx + 120, y: ny - 20 }, { x: nx + 120, y: ny + 30 }
      ];

      // Synapse connections
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 2; i++) {
        for (let j = 2; j < 5; j++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
      for (let j = 2; j < 5; j++) {
        for (let k = 5; k < 7; k++) {
          ctx.beginPath();
          ctx.moveTo(nodes[j].x, nodes[j].y); ctx.lineTo(nodes[k].x, nodes[k].y);
          ctx.stroke();
        }
      }

      // Nodes glowing
      nodes.forEach((nd, idx) => {
        const npulse = 0.8 + 0.3 * Math.sin(t * 8 + idx);
        ctx.fillStyle = idx % 2 === 0 ? PAL.hotPink : PAL.cyan;
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, 8 * npulse, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = PAL.yellow;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.fillText('1 TRILLION PARAMETERS', nx, ny + 105);
      ctx.restore();

    } else if (beat === 5) {
      // Beat 5: Quantum Limit of Silicon (2 Nanometer wall)
      cyberStickman(ctx, 240, floorY, { pose: 'ready', color: PAL.coral, t });

      // Physical Barrier Alert
      const qx = 660, qy = 730;
      ctx.save();
      ctx.fillStyle = 'rgba(15, 2, 20, 0.95)';
      ctx.strokeStyle = PAL.coral;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(qx - 210, qy - 140, 420, 270, 18);
      ctx.fill(); ctx.stroke();

      // Header
      ctx.fillStyle = PAL.coral;
      ctx.beginPath();
      ctx.roundRect(qx - 180, qy - 120, 360, 36, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BATAS KUANTUM SILIKON: 2 NM', qx, qy - 97);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Ukuran Transistor = Beberapa Atom!', qx, qy - 40);

      ctx.fillStyle = PAL.coral;
      ctx.font = '900 24px "JetBrains Mono", monospace';
      ctx.fillText('KEBOCORAN ELEKTRON (TUNNELING)', qx, qy + 15);

      ctx.fillStyle = PAL.cyan;
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillText('Silikon tak bisa diperkecil lagi!', qx, qy + 65);
      ctx.restore();

      cyberReticle(ctx, qx + 140, qy - 70, 30, { col: PAL.coral, angle: t * 5, label: 'LIMIT', t });

    } else if (beat === 6) {
      // Beat 6: The Quantum Computing Future (Bloch Qubit Sphere)
      cyberStickman(ctx, 230, floorY, { pose: 'hack', color: PAL.cyan, t });

      // Bloch Sphere Hologram
      const kx = 650, ky = 740;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 2, 22, 0.95)';
      ctx.strokeStyle = PAL.cyan;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(kx - 210, ky - 140, 420, 280, 20);
      ctx.fill(); ctx.stroke();

      // Top Tag
      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.roundRect(kx - 180, ky - 120, 360, 38, 8);
      ctx.fill();

      ctx.fillStyle = PAL.bg0;
      ctx.font = '900 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KOMPUTASI KUANTUM: QUBIT', kx, ky - 95);

      // Qubit Sphere wireframe
      ctx.strokeStyle = PAL.hotPink;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(kx, ky, 65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(kx, ky, 65, 25, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Vector pointing
      const qang = t * 3;
      ctx.strokeStyle = PAL.yellow;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(kx, ky);
      ctx.lineTo(kx + Math.cos(qang) * 55, ky + Math.sin(qang) * 20 - 40);
      ctx.stroke();

      ctx.fillStyle = PAL.white;
      ctx.font = '900 18px "JetBrains Mono", monospace';
      ctx.fillText('SUPERPOSISI: 0 & 1 SEKALIGUS', kx, ky + 95);
      ctx.restore();

      cyberReticle(ctx, kx + 140, ky + 80, 30, { col: PAL.cyan, angle: -t * 3, label: 'QUBIT', t });

    } else if (beat === 7) {
      // Beat 7: Cosmic Human Intellect Multiplied
      cyberStickman(ctx, 360, floorY, { pose: 'victory', color: PAL.cyan, t });

      // Super Intelligence Core Shield
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
      ctx.fillText('KECERDASAN', mx, my - 25);
      ctx.fillText('EKSPONENSIAL', mx, my + 15);

      ctx.fillStyle = PAL.white;
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.fillText('ERA SUPER-AI', mx, my + 55);
      ctx.restore();

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
    'SEJARAH KOMPUTASI',
    'HUKUM MOORE & ERA AI',
    'Dari Tabung Hampa ke Lompatan Superkomputer'
  );

  // 6. Floating Educational Callout at y: 1485
  const callouts = [
    {
      start: C.hook?.start ?? 0,
      tag: 'KILAS TEKNOLOGI',
      title: 'Ponsel vs Komputer Apollo 11',
      desc: 'Ponsel cerdas modern jutaan kali lebih cepat dari komputer pemandu roket.',
      stat: '1.000.000X',
      statSub: 'LEBIH CEPAT',
      col: PAL.cyan
    },
    {
      start: C.hukum?.start,
      tag: 'HUKUM MOORE 1965',
      title: 'Transistor Ganda Tiap 2 Tahun',
      desc: 'Pertumbuhan eksponensial silikon merevolusi seluruh peradaban manusia.',
      stat: '2X / 2 TAHUN',
      statSub: 'DOUBLING RATE',
      col: PAL.hotPink
    },
    {
      start: C.eksponensial?.start,
      tag: 'MATEMATIKA PERTUMBUHAN',
      title: 'Kekuatan Kurva Eksponensial',
      desc: 'Otak manusia sulit membayangkan lonjakan dari ribuan menjadi miliaran chip.',
      stat: 'EKSPONEN',
      statSub: 'LOMPATAN BESAR',
      col: PAL.yellow
    },
    {
      start: C.perjalanan?.start,
      tag: 'ERA MINIATURISASI',
      title: 'Dari Gedung ke Butir Beras',
      desc: 'Komputer ENIAC butuh 150 kilowatt listrik, kini chip muat di jam tangan.',
      stat: 'NANO',
      statSub: 'UKURAN CHIP',
      col: PAL.violet
    },
    {
      start: C.ledakan?.start,
      tag: 'REVOLUSI ARTIFICIAL INTELLIGENCE',
      title: 'Bahan Bakar Model AI Modern',
      desc: 'Jaringan syaraf tiruan raksasa hanya mungkin berkat miliaran transistor.',
      stat: 'AI BOOM',
      statSub: 'DEEP LEARNING',
      col: PAL.cyan
    },
    {
      start: C.batas?.start,
      tag: 'FISIKA KUANTUM',
      title: 'Membentur Tembok Atomik',
      desc: 'Pada skala 2 nanometer, elektron mulai menembus dinding transistor silikon.',
      stat: '2 NM',
      statSub: 'BATAS ATOM',
      col: PAL.coral
    },
    {
      start: C.kuantum?.start,
      tag: 'KOMPUTASI KUANTUM',
      title: 'Era Qubit & Fotonik Cahaya',
      desc: 'Superposisi kuantum memproses kemungkinan paralel dalam sekejap mata.',
      stat: 'QUBIT',
      statSub: 'MASA DEPAN',
      col: PAL.cyan
    },
    {
      start: C.moral?.start,
      tag: 'FILOSOFI TEKNOLOGI',
      title: 'Melipatgandakan Pikiran Manusia',
      desc: 'Komputer adalah sepeda bagi otak manusia untuk menjelajahi semesta.',
      stat: '100%',
      statSub: 'POTENSI MANUSIA',
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

