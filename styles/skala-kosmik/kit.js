// Maura Motion style kit: SKALA KOSMIK (Powers-of-Ten Cosmic & Quantum Scale Zoom Engine).
// Signature: Continuous logarithmic powers-of-ten zoom (10^-15 m to 10^26 m), nested scale bounding boxes,
// dense multi-layer starfield & volumetric nebula, procedural Monas/Earth/Solar System/Milky Way/Cosmic Web
// AND Microscopic Cell/DNA/Atom/Quark renderers, plus live 10^n meter serif + monospace telemetry HUD.
import { clamp, lerp, ease, mulberry32, TAU, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export { clamp, lerp, ease, TAU, rgba };

export const PAL = {
  space0: '#030612',
  space1: '#0a1535',
  nebulaCyan: '#3ce8ff',
  nebulaPurple: '#9d5cff',
  nebulaGold: '#ffd166',
  star: '#ffffff',
  cyan: '#5ef2ff',
  gold: '#ffd65e',
  blue: '#3b82f6',
  emerald: '#2dd4bf',
  coral: '#ff6b6b',
  text: '#f4f7ff',
  dim: '#8ea0c0',
};

export const pr = (t, a, b, fn = ease.inOutCubic) => fn(clamp((t - a) / Math.max(1e-6, b - a)));

// ============================================================ 1. Deep Space Starfield & Nebula Backdrop
export function drawDeepSpace(ctx, t, logM = 7, { tint = PAL.nebulaPurple } = {}) {
  const stars = cached('kosmik-stars:' + tint, () => {
    const cv = makeCanvas(1080, 1920), g = cv.getContext('2d');
    const gr = g.createRadialGradient(540, 880, 80, 540, 880, 1200);
    gr.addColorStop(0, '#0d1b3e');
    gr.addColorStop(0.55, '#060c20');
    gr.addColorStop(1, '#02040b');
    g.fillStyle = gr;
    g.fillRect(0, 0, 1080, 1920);

    // Soft volumetric nebula clouds
    const rnd = mulberry32(42);
    for (let i = 0; i < 7; i++) {
      const nx = 180 + rnd() * 720, ny = 320 + rnd() * 1100, nr = 220 + rnd() * 320;
      const ng = g.createRadialGradient(nx, ny, 10, nx, ny, nr);
      const col = i % 2 === 0 ? 'rgba(60, 232, 255, 0.08)' : 'rgba(157, 92, 255, 0.09)';
      ng.addColorStop(0, col);
      ng.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = ng;
      g.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
    }

    // Multi-magnitude starfield
    for (let i = 0; i < 650; i++) {
      const sx = rnd() * 1080, sy = rnd() * 1920;
      const r = rnd() < 0.08 ? 1.8 + rnd() * 1.4 : 0.6 + rnd() * 1.0;
      g.fillStyle = rnd() < 0.15 ? '#bfeaff' : rnd() < 0.25 ? '#ffe7b3' : '#ffffff';
      g.globalAlpha = 0.28 + rnd() * 0.72;
      g.beginPath();
      g.arc(sx, sy, r, 0, TAU);
      g.fill();
    }
    g.globalAlpha = 1;
    return cv;
  });

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(stars, 0, 0);

  // Nested Powers-of-Ten Bounding Squares (10^k m frames shrinking into center)
  const cx = 540, cy = 830;
  const frac = ((logM % 1) + 1) % 1;
  ctx.strokeStyle = 'rgba(94, 242, 255, 0.26)';
  ctx.lineWidth = 1.6;
  for (let k = -2; k <= 2; k++) {
    const scale = Math.pow(10, k - frac);
    const sz = 280 * scale;
    if (sz < 8 || sz > 2200) continue;
    const alpha = clamp(1 - Math.abs(k - frac) / 2.2) * 0.45;
    ctx.globalAlpha = alpha;
    ctx.strokeRect(cx - sz / 2, cy - sz / 2, sz, sz);
    const exp = Math.floor(logM) + k;
    if (sz > 80 && sz < 850) {
      ctx.fillStyle = PAL.cyan;
      ctx.font = "600 18px 'JetBrains Mono', monospace";
      ctx.textAlign = 'left';
      ctx.fillText(`10^${exp} m`, cx - sz / 2 + 8, cy - sz / 2 - 8);
    }
  }
  ctx.restore();
}

// ============================================================ 2. Macro Cosmic Stages (Monas -> Cosmic Web)
export function drawMonasStage(ctx, t, zoomOut = 0) {
  const cx = 540, cy = 830;
  const s = Math.pow(0.22, clamp(zoomOut));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // Medan Merdeka park & radial paths
  ctx.fillStyle = '#102a24';
  ctx.beginPath();
  ctx.arc(0, 0, 420, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(94, 242, 255, 0.35)';
  ctx.lineWidth = 3 / s;
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * 420, Math.sin(a) * 420);
    ctx.stroke();
  }

  // Monas Cawan & Obelisk & Golden Flame
  ctx.fillStyle = '#d9e2ec';
  ctx.beginPath();
  ctx.moveTo(-90, 95);
  ctx.lineTo(90, 95);
  ctx.lineTo(65, 35);
  ctx.lineTo(-65, 35);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f0f5fa';
  ctx.fillRect(-18, -195, 36, 230);

  // Lidah Api Emas
  const glow = ctx.createRadialGradient(0, -218, 4, 0, -218, 48);
  glow.addColorStop(0, '#fff6bf');
  glow.addColorStop(0.4, '#ffb703');
  glow.addColorStop(1, 'rgba(255, 183, 3, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, -218, 48, 0, TAU);
  ctx.fill();

  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.arc(0, -218, 16, 0, TAU);
  ctx.fill();

  ctx.restore();
}

export function drawEarthStage(ctx, t, zoomOut = 0) {
  const cx = 540, cy = 830;
  const r = lerp(310, 95, clamp(zoomOut));
  ctx.save();
  ctx.translate(cx, cy);

  // Lunar orbit ring when zooming out
  if (zoomOut > 0.15) {
    const mr = r * 3.4;
    ctx.strokeStyle = 'rgba(180, 215, 255, 0.32)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, mr, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    const ma = t * 0.45 - 0.6;
    ctx.fillStyle = '#d8dee9';
    ctx.beginPath();
    ctx.arc(Math.cos(ma) * mr, Math.sin(ma) * mr, Math.max(8, r * 0.24), 0, TAU);
    ctx.fill();
  }

  // Atmosphere halo
  const halo = ctx.createRadialGradient(0, 0, r * 0.85, 0, 0, r * 1.32);
  halo.addColorStop(0, 'rgba(59, 130, 246, 0.55)');
  halo.addColorStop(0.6, 'rgba(94, 242, 255, 0.22)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.32, 0, TAU);
  ctx.fill();

  // Ocean sphere
  const ocean = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  ocean.addColorStop(0, '#2563eb');
  ocean.addColorStop(0.7, '#1d4ed8');
  ocean.addColorStop(1, '#0b1942');
  ctx.fillStyle = ocean;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();

  // Simplified Nusantara & continental landmasses clipped to sphere
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.clip();
  ctx.fillStyle = '#22c55e';
  const islands = [
    [-0.38, 0.08, 0.22, 0.07, 0.45], // Sumatra
    [-0.1, 0.18, 0.2, 0.05, 0.08], // Jawa
    [-0.08, -0.02, 0.18, 0.16, 0], // Kalimantan
    [0.14, 0.0, 0.1, 0.15, 0.2], // Sulawesi
    [0.36, 0.06, 0.2, 0.09, 0.15], // Papua
    [-0.3, -0.35, 0.42, 0.28, -0.2], // Asia
    [0.32, 0.42, 0.28, 0.2, 0], // Australia
  ];
  for (const [ix, iy, rx, ry, rot] of islands) {
    ctx.beginPath();
    ctx.ellipse(ix * r, iy * r, rx * r, ry * r, rot, 0, TAU);
    ctx.fill();
  }
  // Golden marker on Jakarta/Nusantara
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(-0.14 * r, 0.16 * r, 14, 0, TAU);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

export function drawSolarSystemStage(ctx, t, zoomOut = 0) {
  const cx = 540, cy = 830;
  const s = lerp(1.15, 0.52, clamp(zoomOut));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);

  // Glowing Sun
  const sg = ctx.createRadialGradient(0, 0, 6, 0, 0, 95);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(0.3, '#ffd65e');
  sg.addColorStop(0.65, 'rgba(255, 138, 36, 0.45)');
  sg.addColorStop(1, 'rgba(255, 138, 36, 0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(0, 0, 95, 0, TAU);
  ctx.fill();

  const planets = [
    { name: 'Merkurius', r: 75, sz: 5, col: '#a8b2c1', spd: 1.4 },
    { name: 'Venus', r: 115, sz: 8, col: '#f4c97a', spd: 1.0 },
    { name: 'Bumi', r: 165, sz: 9, col: '#38bdf8', spd: 0.75, hi: true },
    { name: 'Mars', r: 215, sz: 7, col: '#f87171', spd: 0.55 },
    { name: 'Jupiter', r: 300, sz: 18, col: '#fbbf24', spd: 0.32 },
    { name: 'Saturnus', r: 385, sz: 15, col: '#fde68a', spd: 0.22, ring: true },
    { name: 'Neptunus', r: 465, sz: 12, col: '#60a5fa', spd: 0.14 },
  ];

  planets.forEach((p, i) => {
    ctx.strokeStyle = p.hi ? 'rgba(94, 242, 255, 0.55)' : 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = p.hi ? 2.2 : 1.3;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * 0.72, 0, 0, TAU);
    ctx.stroke();

    const a = i * 1.1 + t * p.spd;
    const px = Math.cos(a) * p.r, py = Math.sin(a) * p.r * 0.72;
    ctx.fillStyle = p.col;
    ctx.beginPath();
    ctx.arc(px, py, p.sz, 0, TAU);
    ctx.fill();
    if (p.ring) {
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(px, py, p.sz * 2.1, p.sz * 0.7, 0.3, 0, TAU);
      ctx.stroke();
    }
  });

  ctx.restore();
}

export function drawGalaxyStage(ctx, t, zoomOut = 0) {
  const cx = 540, cy = 830;
  const s = lerp(1.12, 0.55, clamp(zoomOut));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  ctx.rotate(t * 0.08);

  // Galactic core glow
  const cg = ctx.createRadialGradient(0, 0, 10, 0, 0, 260);
  cg.addColorStop(0, '#fff9db');
  cg.addColorStop(0.28, 'rgba(255, 209, 102, 0.75)');
  cg.addColorStop(0.65, 'rgba(157, 92, 255, 0.28)');
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, 0, 260, 0, TAU);
  ctx.fill();

  // 4 Spiral arms of stars
  const rnd = mulberry32(99);
  for (let arm = 0; arm < 4; arm++) {
    const armOffset = (arm / 4) * TAU;
    for (let i = 0; i < 160; i++) {
      const u = i / 160;
      const dist = 25 + u * 410;
      const theta = armOffset + u * 4.4 + (rnd() - 0.5) * 0.48;
      const px = Math.cos(theta) * dist, py = Math.sin(theta) * dist * 0.78;
      ctx.fillStyle = u < 0.3 ? '#ffe8a3' : u < 0.7 ? '#9be7ff' : '#d0bfff';
      ctx.globalAlpha = (1 - u * 0.65) * 0.85;
      ctx.beginPath();
      ctx.arc(px, py, 1.4 + rnd() * 2.4, 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Solar System position marker on Orion Arm
  ctx.strokeStyle = PAL.gold;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(175, 95, 16, 0, TAU);
  ctx.stroke();

  ctx.restore();
}

export function drawCosmicWebStage(ctx, t) {
  const cx = 540, cy = 830;
  ctx.save();
  ctx.translate(cx, cy);

  const rnd = mulberry32(314);
  const nodes = [];
  for (let i = 0; i < 42; i++) {
    const a = rnd() * TAU, d = 40 + rnd() * 420;
    nodes.push([Math.cos(a) * d, Math.sin(a) * d, 3 + rnd() * 6]);
  }

  // Filament web threads
  ctx.strokeStyle = 'rgba(157, 92, 255, 0.32)';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i][0] - nodes[j][0], dy = nodes[i][1] - nodes[j][1];
      const dist = Math.hypot(dx, dy);
      if (dist < 175) {
        ctx.globalAlpha = (1 - dist / 175) * 0.65;
        ctx.beginPath();
        ctx.moveTo(nodes[i][0], nodes[i][1]);
        ctx.lineTo(nodes[j][0], nodes[j][1]);
        ctx.stroke();
      }
    }
  }

  // Supercluster nodes
  nodes.forEach(([nx, ny, r], i) => {
    const g = ctx.createRadialGradient(nx, ny, 1, nx, ny, r * 4.5);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, i % 2 ? PAL.cyan : PAL.gold);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(nx, ny, r * 4.5, 0, TAU);
    ctx.fill();
  });

  ctx.restore();
}

// ============================================================ 3. Micro / Quantum Stages (Demo 2: Leaf -> Quark)
export function drawMicroStage(ctx, t, stageIdx, subP = 0) {
  const cx = 540, cy = 830;
  ctx.save();
  ctx.translate(cx, cy);

  if (stageIdx === 0) {
    // Leaf venation + stomatal cells
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 320, 190, -0.25, 0, TAU);
    ctx.fill();
    ctx.stroke();
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 55, -140);
      ctx.lineTo(i * 55 + 25, 140);
      ctx.stroke();
    }
  } else if (stageIdx === 1) {
    // Plant Cell & Chloroplasts + Nucleus
    ctx.strokeStyle = '#2dd4bf';
    ctx.fillStyle = 'rgba(45, 212, 191, 0.14)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(-260, -210, 520, 420, 64);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + t * 0.3;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * 165, Math.sin(a) * 125, 34, 18, a, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(157, 92, 255, 0.45)';
    ctx.strokeStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(0, 0, 78, 0, TAU);
    ctx.fill();
    ctx.stroke();
  } else if (stageIdx === 2) {
    // DNA Double Helix
    for (let i = -14; i <= 14; i++) {
      const y = i * 24;
      const ph = i * 0.38 + t * 2.4;
      const x1 = Math.sin(ph) * 135, x2 = -Math.sin(ph) * 135;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();

      ctx.fillStyle = PAL.cyan;
      ctx.beginPath();
      ctx.arc(x1, y, 10, 0, TAU);
      ctx.fill();
      ctx.fillStyle = PAL.gold;
      ctx.beginPath();
      ctx.arc(x2, y, 10, 0, TAU);
      ctx.fill();
    }
  } else if (stageIdx === 3) {
    // Carbon-12 Atom (6 electrons in 2 shells + nucleus)
    for (const [r, n, spd] of [
      [130, 2, 2.2],
      [280, 4, -1.4],
    ]) {
      ctx.strokeStyle = 'rgba(94, 242, 255, 0.32)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.stroke();
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + t * spd;
        ctx.fillStyle = PAL.cyan;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 11, 0, TAU);
        ctx.fill();
      }
    }
    ctx.fillStyle = PAL.coral;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, TAU);
    ctx.fill();
  } else {
    // Proton / Quark Trio bound by gluon springs
    const qPos = [0, 1, 2].map((k) => {
      const a = (k / 3) * TAU + t * 1.8;
      return [Math.cos(a) * 135, Math.sin(a) * 135];
    });
    ctx.strokeStyle = PAL.gold;
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(qPos[0][0], qPos[0][1]);
    ctx.lineTo(qPos[1][0], qPos[1][1]);
    ctx.lineTo(qPos[2][0], qPos[2][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    const labels = ['u', 'u', 'd'];
    const cols = [PAL.coral, PAL.cyan, PAL.gold];
    qPos.forEach(([qx, qy], k) => {
      ctx.fillStyle = cols[k];
      ctx.beginPath();
      ctx.arc(qx, qy, 44, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#040718';
      ctx.font = "800 38px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[k], qx, qy);
    });
  }

  ctx.restore();
}

// ============================================================ 4. Cosmic Scale HUD & Callout Cards
export function drawScaleHUD(ctx, t, { exp = 2, unitLabel = '100 METER', title = '', subtitle = '', stageTag = '' } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Top Header Card
  ctx.fillStyle = 'rgba(6, 11, 26, 0.84)';
  ctx.strokeStyle = 'rgba(94, 242, 255, 0.35)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(64, 108, 952, 168, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.cyan;
  ctx.font = "700 20px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText(stageTag || 'POWERS OF TEN · SKALA KOSMIK', 96, 148);

  ctx.fillStyle = PAL.text;
  ctx.font = "700 35px 'Noto Serif', Georgia, serif";
  ctx.fillText(title, 96, 200);

  ctx.fillStyle = PAL.dim;
  ctx.font = "500 22px 'JetBrains Mono', monospace";
  ctx.fillText(subtitle, 96, 244);

  // Right-side 10^n exponent readout
  const expInt = Math.round(exp);
  ctx.textAlign = 'right';
  ctx.fillStyle = PAL.gold;
  ctx.font = "800 50px 'JetBrains Mono', monospace";
  ctx.fillText(`10^${expInt} m`, 984, 202);
  ctx.fillStyle = PAL.cyan;
  ctx.font = "600 20px 'JetBrains Mono', monospace";
  ctx.fillText(unitLabel, 984, 244);

  // Bottom Scale Ruler Bar (10^-15 to 10^26)
  ctx.fillStyle = 'rgba(6, 11, 26, 0.86)';
  ctx.strokeStyle = 'rgba(255, 214, 94, 0.38)';
  ctx.beginPath();
  ctx.roundRect(64, 1230, 952, 115, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.dim;
  ctx.font = "600 18px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText('GARIS LOGARITMIK SKALA SEMESTA (METER)', 96, 1264);

  const rx0 = 104, rx1 = 976, ry = 1308;
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(rx0, ry);
  ctx.lineTo(rx1, ry);
  ctx.stroke();

  const u = clamp((exp + 16) / 42);
  const mx = lerp(rx0, rx1, u);
  ctx.fillStyle = PAL.gold;
  ctx.beginPath();
  ctx.arc(mx, ry, 10, 0, TAU);
  ctx.fill();

  for (const [eVal, lbl] of [
    [-15, '10⁻¹⁵ Kuark'],
    [-8.5, '10⁻⁹ DNA'],
    [-1, '10⁰ Manusia'],
    [6.5, '10⁷ Bumi'],
    [13, '10¹³ Surya'],
    [19.5, '10²¹ Galaksi'],
    [26, '10²⁶ Kosmos'],
  ]) {
    const tx = lerp(rx0, rx1, (eVal + 16) / 42);
    ctx.fillStyle = Math.abs(exp - eVal) < 2.5 ? PAL.cyan : PAL.dim;
    ctx.font = "500 16px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(lbl, tx, ry + 26);
  }

  ctx.restore();
}
