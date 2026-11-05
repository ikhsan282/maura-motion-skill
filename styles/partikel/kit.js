// Maura Motion style kit: PARTIKEL (Emergent Particle Swarms, Murmuration Boids & Bioluminescent Point-Clouds).
import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  bg0: '#040814',
  bg1: '#0b1933',
  cyan: '#6ee7ff',
  gold: '#ffd65e',
  pink: '#ff6f91',
  emerald: '#34d399',
  violet: '#a78bfa',
  white: '#eef4ff',
  dim: '#94a3b8',
};

export { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba };

export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, fy);
  ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-x, -y);
}

export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b, fn = ease.inOutCubic) => fn(clamp((t - a) / Math.max(1e-6, b - a)));

export function bg(ctx, t, { top = '#040712', mid = '#0a162e', bot = '#102347' } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const gr = ctx.createLinearGradient(0, 0, 0, 1920);
  gr.addColorStop(0, top);
  gr.addColorStop(0.55, mid);
  gr.addColorStop(1, bot);
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle ambient dust stars
  const rnd = mulberry32(77);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 90; i++) {
    const sx = rnd() * 1080;
    const sy = rnd() * 1920;
    const sr = 0.8 + rnd() * 1.6;
    ctx.globalAlpha = (0.12 + 0.25 * Math.sin(t * 1.4 + i)) * (sy < 1200 ? 1 : 0.4);
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function glowDot(ctx, x, y, r, col, a = 1) {
  ctx.save();
  ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col);
  g.addColorStop(0.4, col);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function flock(ctx, pts, { col = '#eef4ff', size = 5 } = {}) {
  ctx.save();
  ctx.fillStyle = col;
  ctx.beginPath();
  for (const p of pts) {
    ctx.moveTo(p[0] + size, p[1]);
    ctx.arc(p[0], p[1], size * (p[2] || 1), 0, TAU);
  }
  ctx.fill();
  ctx.restore();
}

export function boids(t, n, seed, { cx = 540, cy = 800, R = 320 } = {}) {
  const out = [];
  const r = mulberry32(seed);
  for (let i = 0; i < n; i++) {
    const p = r() * TAU;
    const k = 0.3 + r() * 0.7;
    const q = r() * TAU;
    const a = p + t * 0.35 * k;
    const x = cx + Math.cos(a) * R * k + Math.sin(t * 0.9 + q) * 90 * k;
    const y = cy + Math.sin(a * 1.3) * R * 0.55 * k + Math.cos(t * 0.7 + q) * 70 * k;
    out.push([x, y, 0.5 + k * 0.8]);
  }
  return out;
}

export function title(ctx, str, x, y, { a = 1, size = 72 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = '#eef4ff';
  ctx.font = `800 ${size}px 'Inter', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
  ctx.restore();
}

export function caption(ctx, str, x, y, { a = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(110,231,255,.9)';
  ctx.font = "600 40px 'Inter', system-ui, sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(str, x, y);
  ctx.restore();
}

// ============================================================ 1. Starling Murmuration & 7-Neighbors Boids (Demo 1)
export function drawStarlingMurmuration(ctx, t, { neighborGraph = 0, ruleSplit = 0, falconDive = 0 } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const cx = 540, cy = 780;
  // Ambient twilight glow behind the flock
  glowDot(ctx, cx + Math.sin(t * 0.4) * 120, cy + Math.cos(t * 0.3) * 80, 420, 'rgba(110, 231, 255, 0.14)', 1);
  glowDot(ctx, cx - Math.cos(t * 0.35) * 140, cy + 120, 360, 'rgba(255, 111, 145, 0.12)', 1);

  // Falcon position when diving
  const fx = lerp(180, 560, falconDive) + Math.sin(t * 3) * 35;
  const fy = lerp(310, 790, falconDive);

  const rnd = mulberry32(101);
  const N = 460;
  const pts = [];

  for (let i = 0; i < N; i++) {
    const u = i / N;
    const baseA = u * TAU * 3 + t * (0.65 + (i % 7) * 0.04);
    const ribbonR = 110 + (i % 19) * 16 + Math.sin(u * 12 + t * 1.4) * 65;
    let px = cx + Math.cos(baseA) * ribbonR + Math.sin(t * 1.1 + u * 9) * 95;
    let py = cy + Math.sin(baseA * 1.35) * ribbonR * 0.62 + Math.cos(t * 0.9 + u * 7) * 75;

    // Evade diving peregrine falcon with shockwave vacuole
    if (falconDive > 0.02) {
      const dx = px - fx, dy = py - fy;
      const d = Math.hypot(dx, dy) + 1e-4;
      const evadeR = 230 * falconDive;
      if (d < evadeR) {
        const push = (1 - d / evadeR) * 165 * falconDive;
        px += (dx / d) * push;
        py += (dy / d) * push;
      }
    }

    const vx = -Math.sin(baseA) * 14 + Math.cos(t * 1.1 + u * 9) * 8;
    const vy = Math.cos(baseA * 1.35) * 11 - Math.sin(t * 0.9 + u * 7) * 6;
    pts.push({ x: px, y: py, vx, vy, s: 0.7 + rnd() * 0.8, cIdx: i % 3 });
  }

  // Draw glowing boid velocity trails
  ctx.lineWidth = 2.2;
  for (let i = 0; i < N; i++) {
    const p = pts[i];
    const col = ruleSplit > 0.1
      ? [PAL.pink, PAL.cyan, PAL.gold][p.cIdx]
      : i % 5 === 0
      ? PAL.gold
      : PAL.cyan;
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.42;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 1.4, p.y - p.vy * 1.4);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.8 * p.s, 0, TAU);
    ctx.fill();
  }

  // Highlight 1 focal bird + its 7 topological nearest neighbors!
  if (neighborGraph > 0.02) {
    ctx.save();
    ctx.globalAlpha = clamp(neighborGraph);
    const focal = pts[42];
    const sorted = pts
      .map((p, idx) => ({ p, idx, d: Math.hypot(p.x - focal.x, p.y - focal.y) }))
      .filter((o) => o.idx !== 42)
      .sort((a, b) => a.d - b.d)
      .slice(0, 7);

    // Radar ring around focal bird
    ctx.strokeStyle = PAL.gold;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(focal.x, focal.y, 135, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);

    sorted.forEach((nb, k) => {
      ctx.strokeStyle = PAL.gold;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(focal.x, focal.y);
      ctx.lineTo(nb.p.x, nb.p.y);
      ctx.stroke();

      ctx.fillStyle = PAL.gold;
      ctx.beginPath();
      ctx.arc(nb.p.x, nb.p.y, 8, 0, TAU);
      ctx.fill();

      ctx.fillStyle = '#040712';
      ctx.font = "800 13px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(k + 1), nb.p.x, nb.p.y);
    });

    glowDot(ctx, focal.x, focal.y, 38, PAL.pink, 0.9);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(focal.x, focal.y, 9, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Draw Peregrine Falcon Predator + Shockwave Ring
  if (falconDive > 0.02) {
    ctx.save();
    ctx.globalAlpha = clamp(falconDive);
    ctx.strokeStyle = PAL.pink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fx, fy, 175 * falconDive, 0, TAU);
    ctx.stroke();

    glowDot(ctx, fx, fy, 65, PAL.pink, 0.85);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(fx + 24, fy + 12);
    ctx.lineTo(fx - 26, fy - 24);
    ctx.lineTo(fx - 12, fy + 4);
    ctx.lineTo(fx - 28, fy + 24);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

// ============================================================ 2. Synchronized Firefly Mangrove Point-Cloud (Demo 2)
export function drawFireflyMangrove(ctx, t, { syncProg = 0, chemHighlight = 0 } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Dark river surface at y = 1020 with reflections
  const waterY = 1020;
  ctx.fillStyle = 'rgba(4, 12, 28, 0.72)';
  ctx.fillRect(0, waterY, 1080, 900);
  ctx.strokeStyle = 'rgba(110, 231, 255, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, waterY);
  ctx.lineTo(1020, waterY);
  ctx.stroke();

  // Silhouette mangrove canopy arches made of soft point-cloud clusters
  const rnd = mulberry32(202);
  const N = 220;
  const globalPulse = Math.pow(0.5 + 0.5 * Math.sin(t * 3.4), 2.4);

  for (let i = 0; i < N; i++) {
    const bx = 90 + rnd() * 900;
    const by = 410 + rnd() * 560;
    const indivPhase = rnd() * TAU;
    const x = bx + Math.sin(t * 0.7 + indivPhase) * 26;
    const y = by + Math.cos(t * 0.9 + indivPhase) * 18;

    // Kuramoto synchronization: blend between independent phase and global pulse
    const indivBlink = Math.pow(0.5 + 0.5 * Math.sin(t * (2.1 + (i % 5) * 0.35) + indivPhase), 2.6);
    const waveOffset = (x - 540) * 0.003 * (1 - syncProg * 0.7);
    const syncedBlink = Math.pow(0.5 + 0.5 * Math.sin(t * 3.4 - waveOffset), 2.8);
    const bVal = lerp(indivBlink, syncedBlink, clamp(syncProg));

    const col = i % 6 === 0 ? PAL.emerald : PAL.gold;
    const rad = (8 + (i % 4) * 5) * (0.4 + 0.9 * bVal);

    if (bVal > 0.12) {
      glowDot(ctx, x, y, rad * 2.4, col, bVal * 0.65);
      ctx.fillStyle = '#fffbeb';
      ctx.globalAlpha = bVal;
      ctx.beginPath();
      ctx.arc(x, y, 2.6, 0, TAU);
      ctx.fill();

      // Mirror reflection on the river below waterY
      const ry = waterY + (waterY - y) * 0.32;
      if (ry < 1220) {
        glowDot(ctx, x + Math.sin(t * 3 + i) * 6, ry, rad * 1.6, col, bVal * 0.25);
      }
    }
  }

  // Chemical bioluminescence callout ring (Luciferin + Luciferase + O2 + ATP -> Light)
  if (chemHighlight > 0.02) {
    ctx.save();
    ctx.globalAlpha = clamp(chemHighlight);
    const cx = 540, cy = 690;
    glowDot(ctx, cx, cy, 165 * (0.75 + 0.25 * globalPulse), PAL.gold, 0.85);
    ctx.strokeStyle = PAL.cyan;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, TAU);
    ctx.stroke();

    const mols = [
      ['LUSIFERIN', -150, -90, PAL.gold],
      ['ENZIM LUSIFERASE', 155, -90, PAL.cyan],
      ['OKSIGEN (O₂) + ATP', -150, 95, PAL.emerald],
      ['CAHAYA DINGIN 100%', 155, 95, PAL.pink],
    ];
    mols.forEach(([lbl, ox, oy, c]) => {
      ctx.fillStyle = 'rgba(6, 14, 32, 0.9)';
      ctx.strokeStyle = c;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx + ox - 115, cy + oy - 24, 230, 48, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.font = "700 17px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lbl, cx + ox, cy + oy);
    });
    ctx.restore();
  }

  ctx.restore();
}

// ============================================================ 3. Hydrological Cycle & Petrichor Aerosol Point-Cloud (Demo 3)
export function drawRainPetrichor(ctx, t, { phase = 'rain', petrichorGlow = 0 } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const groundY = 1040;
  // Ground / ocean surface line
  ctx.strokeStyle = phase === 'evap' ? 'rgba(110, 231, 255, 0.45)' : 'rgba(255, 214, 94, 0.38)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, groundY);
  ctx.lineTo(1020, groundY);
  ctx.stroke();

  const rnd = mulberry32(303);

  // Cumulus Cloud Point-Cloud at y = 370..480
  for (let i = 0; i < 110; i++) {
    const cx = 180 + rnd() * 720 + Math.sin(t * 0.4 + i) * 18;
    const cy = 360 + rnd() * 110 + Math.cos(t * 0.5 + i) * 10;
    glowDot(ctx, cx, cy, 28 + (i % 5) * 8, 'rgba(148, 163, 184, 0.18)', 1);
  }

  if (phase === 'evap') {
    // Rising golden/cyan water vapor molecules from ocean to cloud
    for (let i = 0; i < 240; i++) {
      const x = 100 + rnd() * 880 + Math.sin(t * 1.5 + i) * 24;
      const y = groundY - ((t * (110 + (i % 7) * 22) + rnd() * 640) % 640);
      const col = i % 2 === 0 ? PAL.gold : PAL.cyan;
      glowDot(ctx, x, y, 10, col, 0.65);
    }
  } else {
    // Falling rain streaks + terminal velocity droplets
    const N = 280;
    for (let i = 0; i < N; i++) {
      const spd = 480 + (i % 6) * 65;
      const x = (80 + rnd() * 920 + Math.sin(t * 0.8 + i) * 16) % 1080;
      const y = 380 + ((t * spd + rnd() * 660) % 660);
      ctx.strokeStyle = PAL.cyan;
      ctx.globalAlpha = 0.62;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 4, y - 22);
      ctx.stroke();

      // Splash concentric ripples when near groundY
      if (y > groundY - 28) {
        const age = (y - (groundY - 28)) / 28;
        ctx.strokeStyle = PAL.cyan;
        ctx.globalAlpha = (1 - age) * 0.55;
        ctx.beginPath();
        ctx.ellipse(x, groundY, 8 + age * 36, 3 + age * 11, 0, 0, TAU);
        ctx.stroke();
      }
    }
  }

  // Rising Petrichor / Geosmin aromatic aerosol bubbles from soil pores
  if (petrichorGlow > 0.02) {
    ctx.save();
    ctx.globalAlpha = clamp(petrichorGlow);
    for (let i = 0; i < 95; i++) {
      const bx = 120 + rnd() * 840 + Math.sin(t * 1.8 + i) * 32;
      const lift = (t * (65 + (i % 5) * 15) + i * 19) % 380;
      const by = groundY - lift;
      const col = i % 3 === 0 ? PAL.pink : i % 3 === 1 ? PAL.gold : PAL.emerald;
      glowDot(ctx, bx, by, 18 * (1 - lift / 420), col, 0.85);
    }
    ctx.restore();
  }

  ctx.restore();
}

// ============================================================ 4. Particle Observatory HUD Banner & Rule Pills
export function drawParticleHUD(
  ctx,
  t,
  { badge = 'PARTICLE SWARM // BOIDS', title = '', subtitle = '', pills = [] } = {}
) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Top Header Card
  ctx.fillStyle = 'rgba(6, 12, 28, 0.84)';
  ctx.strokeStyle = 'rgba(110, 231, 255, 0.38)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(64, 108, 952, 164, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = PAL.cyan;
  ctx.font = "700 20px 'JetBrains Mono', monospace";
  ctx.textAlign = 'left';
  ctx.fillText(badge, 96, 148);

  ctx.fillStyle = PAL.white;
  ctx.font = "700 38px 'Noto Serif', Georgia, serif";
  ctx.fillText(title, 96, 198);

  ctx.fillStyle = PAL.dim;
  ctx.font = "500 20px 'Inter', sans-serif";
  ctx.fillText(subtitle, 96, 242);

  // Bottom 3 Telemetry / Rule Pills
  if (pills.length > 0) {
    const pw = 298, ph = 96, gap = 28, x0 = 64, y0 = 1235;
    pills.slice(0, 3).forEach((pl, idx) => {
      const px = x0 + idx * (pw + gap);
      const active = pl.active !== false;
      ctx.fillStyle = active ? 'rgba(12, 25, 52, 0.88)' : 'rgba(6, 12, 28, 0.65)';
      ctx.strokeStyle = pl.col || PAL.cyan;
      ctx.lineWidth = active ? 2.2 : 1.2;
      ctx.beginPath();
      ctx.roundRect(px, y0, pw, ph, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = pl.col || PAL.cyan;
      ctx.font = "700 17px 'JetBrains Mono', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(pl.label, px + pw / 2, y0 + 34);

      ctx.fillStyle = PAL.white;
      ctx.font = "700 22px 'Inter', sans-serif";
      ctx.fillText(pl.val, px + pw / 2, y0 + 68);
    });
  }

  ctx.restore();
}
