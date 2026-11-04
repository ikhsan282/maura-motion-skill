// Manga Action demo 3: "Tendangan Pisang Roberto Carlos 1997 — Fisika Efek Magnus"
import * as K from '/styles/manga-action/kit.js';
const { clamp, lerp, ease, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'comic', y: 1480, size: 68, color: '#0e0e10', active: '#d7263d', box: { fill: '#f6f4ee', pad: 20, radius: 4, border: '#0e0e10', borderW: 7 } } };

let ctx, fx;
const C = {};
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('whoosh', 0.08, { gain: 0.45 });
  AM.sfx('riser', C.ancang.start + 0.15, { gain: 0.35 });
  AM.sfx('impact', C.sepak.start + 0.05, { gain: 0.7 });
  AM.sfx('boom', C.sepak.start + 0.08, { gain: 0.55 });
  AM.sfx('whoosh', C.melenceng.start + 0.15, { gain: 0.45, pitch: 1.2 });
  AM.sfx('wind', C.magnus.start + 0.15, { gain: 0.4 });
  AM.sfx('swoosh_up', C.turbulen.start + 0.2, { gain: 0.45 });
  AM.sfx('impact', C.gol.start + 0.08, { gain: 0.65 });
  AM.sfx('drum_hit', C.akhir.start + 0.25, { gain: 0.55 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const shk = (t, amt) => [(hrand(Math.floor(t * 24), 1) - 0.5) * amt, (hrand(Math.floor(t * 24), 2) - 0.5) * amt];
const BOT = 1890;

// Draw spinning manga soccer ball with pentagon patches and spin vortex rings
function drawSoccerBall(g, x, y, r = 90, { spin = 0, squish = 1, vortex = true } = {}) {
  g.save(); g.translate(x, y); g.scale(squish, 1 / squish);
  if (vortex) {
    g.strokeStyle = '#0e0e10'; g.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      const a0 = spin * 1.4 + i * 2.1;
      g.beginPath(); g.arc(0, 0, r * (1.18 + i * 0.12), a0, a0 + 1.5); g.stroke();
    }
  }
  g.beginPath(); g.arc(0, 0, r, 0, TAU);
  g.fillStyle = '#f6f4ee'; g.fill();
  g.save(); g.clip();
  g.fillStyle = K.tone(g, 'mid'); g.fillRect(-r, r * 0.15, r * 2, r);
  // Rotating pentagon patches
  g.fillStyle = '#0e0e10';
  const ox = Math.sin(spin) * r * 0.35;
  const poly = (cx, cy, pr) => {
    g.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * TAU + spin * 0.2;
      i ? g.lineTo(cx + Math.cos(a) * pr, cy + Math.sin(a) * pr) : g.moveTo(cx + Math.cos(a) * pr, cy + Math.sin(a) * pr);
    }
    g.closePath(); g.fill();
  };
  poly(ox, -r * 0.1, r * 0.34);
  poly(ox - r * 0.75, -r * 0.25, r * 0.28);
  poly(ox + r * 0.75, -r * 0.25, r * 0.28);
  poly(ox - r * 0.45, r * 0.65, r * 0.28);
  poly(ox + r * 0.45, r * 0.65, r * 0.28);
  g.restore();
  g.lineWidth = 9; g.strokeStyle = '#0e0e10'; g.stroke();
  g.restore();
}

// Draw goal & 4-man wall perspective
function drawGoalAndWall(g, { ballPos = null, trailPts = [], keeperShock = false } = {}) {
  // Goal frame at top center
  g.save();
  g.strokeStyle = '#0e0e10'; g.lineWidth = 12; g.lineJoin = 'miter';
  g.fillStyle = K.tone(g, 'light');
  g.fillRect(250, 210, 460, 190);
  g.strokeRect(250, 210, 460, 190);
  // Net grid
  g.lineWidth = 2;
  for (let xx = 280; xx < 710; xx += 32) { g.beginPath(); g.moveTo(xx, 210); g.lineTo(xx, 400); g.stroke(); }
  for (let yy = 235; yy < 400; yy += 28) { g.beginPath(); g.moveTo(250, yy); g.lineTo(710, yy); g.stroke(); }

  // Goalkeeper (Barthez) frozen in center-left of goal
  g.save(); g.translate(450, 395);
  g.fillStyle = '#0e0e10';
  g.beginPath(); g.arc(0, -105, 18, 0, TAU); g.fill();
  g.fillRect(-24, -85, 48, 52);
  g.fillRect(-20, -33, 14, 33); g.fillRect(6, -33, 14, 33);
  if (keeperShock) {
    g.strokeStyle = '#d7263d'; g.lineWidth = 4;
    for (let i = -2; i <= 2; i++) {
      g.beginPath(); g.moveTo(i * 14, -130); g.lineTo(i * 22, -152); g.stroke();
    }
  }
  g.restore();

  // 4-man French defensive wall in mid-ground
  for (let i = 0; i < 4; i++) {
    const wx = 530 + i * 54, wy = 660;
    g.fillStyle = '#0e0e10';
    g.beginPath(); g.arc(wx, wy - 155, 21, 0, TAU); g.fill();
    g.beginPath(); g.roundRect(wx - 24, wy - 130, 48, 76, 8); g.fill();
    g.fillRect(wx - 19, wy - 54, 15, 54); g.fillRect(wx + 4, wy - 54, 15, 54);
  }

  // Curved banana trajectory ribbon
  if (trailPts.length > 1) {
    g.strokeStyle = '#d7263d'; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath();
    trailPts.forEach(([px, py], idx) => (idx ? g.lineTo(px, py) : g.moveTo(px, py)));
    g.stroke();
  }
  if (ballPos) {
    drawSoccerBall(g, ballPos[0], ballPos[1], ballPos[2] || 42, { spin: ballPos[3] || 0 });
  }
  g.restore();
}

// 1. Hook: Lyon 1997 — 35 meters out, ball on the turf
shot('hook', (t, a, b) => {
  const lt = t - a;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 680], [40, 760]], (g) => {
    K.focusLines(g, 540, 480, t, { inner: 160, n: 90, x0: 40, y0: 80, x1: 1040, y1: 760 });
    drawGoalAndWall(g, {});
    K.capBox(g, 'LYON, PRANCIS · 3 JUNI 1997', 350, 150, { size: 44 });
  }, { k: 1 });
  K.panel(ctx, [[40, 800], [1040, 720], [1040, BOT], [40, BOT]], (g) => {
    K.gradTone(g, 40, 720, 1000, 660, { invert: true });
    drawSoccerBall(g, 540, 1070, 125, { spin: 0, vortex: false });
    K.sfxText(g, '35 METER!', 540, 870, { size: 155, k: clamp((lt - 0.2) / 0.25), t, rot: -0.05, shake: 4 });
    K.capBox(g, 'TENDANGAN BEBAS PALING MUSTAHIL DALAM SEJARAH', 540, 1280, { size: 42 });
  }, { k: clamp((lt - 0.15) / 0.3), from: 'bottom' });
});

// 2. Run-up & intense eyes vs 4-man wall and Fabien Barthez
shot('ancang', (t, a, b) => {
  const lt = t - a;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 600], [40, 680]], (g) => {
    g.fillStyle = '#0e0e10'; g.fillRect(40, 80, 1000, 600);
    K.speedLines(g, t, { ang: 0, x0: 40, y0: 80, x1: 1040, y1: 680, n: 45, col: '#3a3a40' });
    g.fillStyle = '#f6f4ee'; g.fillRect(40, 150, 1000, 390);
    K.eyeStrip(g, 'raka', 540, 385, 0.85, { mood: 'fierce', t, look: [0.3, -0.2], sweat: 1 });
    K.capBox(g, 'ROBERTO CARLOS · ANCANG-ANCANG PANJANG', 540, 145, { size: 42, invert: true });
  }, { k: 1 });
  K.panel(ctx, [[40, 720], [1040, 640], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 600, 980, t, { inner: 200, n: 85, x0: 40, y0: 640, x1: 1040, y1: BOT });
    g.save(); g.translate(0, 480);
    drawGoalAndWall(g, {});
    g.restore();
    K.sfxText(g, 'TAP.. TAP.. TAP..', 540, 1250, { size: 120, k: clamp((lt - 0.2) / 0.3), t, rot: -0.04, shake: 4 });
  }, { k: clamp((lt - 0.15) / 0.3), from: 'right' });
});

// 3. BUUUM! Impact frame — 3 outer toes ("Trivela") at 137 km/h & 10 rps
shot('sepak', (t, a, b) => {
  const lt = t - a;
  const impact = lt < 0.28;
  const [sx, sy] = shk(t, lt < 0.7 ? 24 : 4);
  ctx.translate(sx, sy);
  if (impact) {
    ctx.fillStyle = '#0e0e10'; ctx.fillRect(-100, -100, 1300, 2200);
    K.focusLines(ctx, 540, 780, t, { inner: 100, n: 140, col: '#f6f4ee', w: 12 });
    drawSoccerBall(ctx, 580, 760, 160, { spin: t * 25, squish: 1.25 });
    K.sfxText(ctx, 'BUUUM!', 540, 380, { size: 290, k: 1, t, invert: true, shake: 20 });
    return;
  }
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 820], [40, 900]], (g) => {
    K.focusLines(g, 580, 480, t, { inner: 140, n: 120, x0: 40, y0: 80, x1: 1040, y1: 900 });
    // Cleat striking bottom-right of ball with 3 outer toes (Trivela)
    g.save(); g.translate(710, 590); g.rotate(-0.45);
    g.fillStyle = '#0e0e10'; g.beginPath(); g.roundRect(-90, -45, 220, 95, 32); g.fill();
    g.fillStyle = '#d7263d'; g.beginPath(); g.arc(-70, -10, 28, 0, TAU); g.fill();
    g.restore();
    drawSoccerBall(g, 520, 460, 145, { spin: t * 24, squish: 1.12, vortex: true });
    K.splat(g, 660, 560, 0.75, 8);
    K.capBox(g, '3 JARI LUAR KAKI KIRI (TRIVELA)', 380, 155, { size: 44 });
  }, { k: 1 });
  K.panel(ctx, [[40, 940], [1040, 860], [1040, BOT], [40, BOT]], (g) => {
    K.gradTone(g, 40, 860, 1000, 540, { invert: true });
    const v = Math.round(lerp(0, 137, ease.outCubic(clamp((lt - 0.25) / 1.1))));
    K.sfxText(g, `${v} KM/JAM`, 540, 1075, { size: 195, k: clamp((lt - 0.2) / 0.25), t, rot: -0.05, shake: 5 });
    K.capBox(g, 'PUTARAN EKSTREM: 10 ROTASI PER DETIK!', 540, 1270, { size: 46 });
  }, { k: clamp((lt - 0.15) / 0.25), from: 'bottom' });
});

// 4. Flying 1 meter wide to the right of the wall — ballboy ducks!
shot('melenceng', (t, a, b) => {
  const lt = t - a;
  const u = clamp(lt / (b - a - 0.3));
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 840], [40, 760]], (g) => {
    K.speedLines(g, t, { ang: -1.25, x0: 40, y0: 80, x1: 1040, y1: 840, n: 55, w: 4 });
    const bx = lerp(620, 880, u), by = lerp(760, 420, u);
    drawGoalAndWall(g, {
      ballPos: [bx, by, lerp(58, 38, u), t * 25],
      trailPts: [[560, 820], [740, 620], [bx, by]],
    });
    // Arrow showing 1m wide gap outside the wall
    g.strokeStyle = '#d7263d'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(710, 560); g.lineTo(845, 560); g.stroke();
    K.capBox(g, 'MELEBAR > 1 METER DI KANAN PAGAR BETIS!', 540, 150, { size: 44 });
  }, { k: 1 });
  K.panel(ctx, [[40, 800], [1040, 880], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 540, 1120, t, { inner: 180, n: 80, x0: 40, y0: 800, x1: 1040, y1: BOT });
    K.eyeStrip(g, 'dimas', 540, 1080, 0.78, { mood: 'shock', t, look: [-0.4, -0.3], sweat: 1 });
    K.sfxText(g, 'MELENCENG?!', 540, 1280, { size: 125, k: clamp((lt - 0.25) / 0.25), t, rot: -0.04, shake: 4 });
  }, { k: clamp((lt - 0.15) / 0.3), from: 'bottom' });
});

// 5. Magnus Effect aerodynamic diagram (Low pressure vs High pressure)
shot('magnus', (t, a, b) => {
  const lt = t - a;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 860], [40, 780]], (g) => {
    g.fillStyle = '#0e0e10'; g.fillRect(40, 80, 1000, 780);
    // Airflow streamlines around spinning ball
    g.save(); g.translate(540, 480);
    // Left side: fast airflow + low pressure (red streamlines pulling left)
    g.strokeStyle = '#d7263d'; g.lineWidth = 7;
    for (let i = 1; i <= 3; i++) {
      g.beginPath(); g.moveTo(-140 - i * 45, -240);
      g.quadraticCurveTo(-220 - i * 55, 0, -140 - i * 45, 240);
      g.stroke();
    }
    // Right side: opposed airflow + high pressure (white dashed lines)
    g.strokeStyle = '#f6f4ee'; g.lineWidth = 5; g.setLineDash([16, 12]);
    for (let i = 1; i <= 3; i++) {
      g.beginPath(); g.moveTo(140 + i * 45, -240);
      g.quadraticCurveTo(210 + i * 50, 0, 140 + i * 45, 240);
      g.stroke();
    }
    g.setLineDash([]);
    // Big red Magnus Force vector pointing LEFT
    g.fillStyle = '#d7263d';
    g.beginPath(); g.moveTo(-170, 0); g.lineTo(-330, 0); g.lineWidth = 18; g.stroke();
    g.beginPath(); g.moveTo(-360, 0); g.lineTo(-300, -40); g.lineTo(-300, 40); g.closePath(); g.fill();
    drawSoccerBall(g, 0, 0, 135, { spin: t * 24, vortex: true });
    g.restore();
    K.capBox(g, 'FISIKA EFEK MAGNUS (BERNOULLI)', 540, 155, { size: 46, invert: true });
  }, { k: clamp(lt / 0.25), from: 'left' });
  K.panel(ctx, [[40, 820], [1040, 900], [1040, BOT], [40, BOT]], (g) => {
    K.gradTone(g, 40, 820, 1000, 580, { invert: false });
    K.sfxText(g, 'GAYA MAGNUS', 540, 1080, { size: 165, k: clamp((lt - 0.2) / 0.25), t, rot: -0.05, shake: 3 });
    K.capBox(g, 'KIRI: TEKANAN RENDAH · KANAN: TEKANAN TINGGI', 540, 1265, { size: 42 });
  }, { k: clamp((lt - 0.15) / 0.3), from: 'bottom' });
});

// 6. Turbulent-to-Laminar Boundary Layer Transition ("Menikung Seperti Bumerang!")
shot('turbulen', (t, a, b) => {
  const lt = t - a;
  const u = clamp(lt / (b - a - 0.3));
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 840], [40, 760]], (g) => {
    K.focusLines(g, 660, 360, t, { inner: 150, n: 100, x0: 40, y0: 80, x1: 1040, y1: 840 });
    // Ball snapping sharply left toward the right post
    const bx = lerp(880, 710, ease.inCubic(u));
    const by = lerp(420, 290, u);
    drawGoalAndWall(g, {
      ballPos: [bx, by, 34, t * 22],
      trailPts: [[560, 800], [820, 560], [885, 420], [bx, by]],
      keeperShock: true,
    });
    K.sfxText(g, 'SWINGGG!!', 460, 540, { size: 155, k: clamp((lt - 0.15) / 0.25), t, rot: -0.12, shake: 6 });
    K.capBox(g, 'TRANSISI TURBULEN → LAMINER: BELOKAN MENDADak!', 540, 150, { size: 40 });
  }, { k: 1 });
  K.panel(ctx, [[40, 800], [1040, 880], [1040, BOT], [40, BOT]], (g) => {
    K.speedLines(g, t, { ang: Math.PI, x0: 40, y0: 800, x1: 1040, y1: BOT, n: 55, w: 5 });
    K.sfxText(g, 'BUMERANG!', 540, 1110, { size: 185, k: clamp((lt - 0.25) / 0.25), t, rot: -0.05, shake: 5 });
  }, { k: clamp((lt - 0.15) / 0.25), from: 'right' });
});

// 7. KLANG! Ball ricochets off the inside of the right goalpost into the net, Barthez frozen!
shot('gol', (t, a, b) => {
  const lt = t - a;
  const [sx, sy] = shk(t, lt < 0.6 ? 22 : 4);
  ctx.translate(sx, sy);
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 780], [40, 860]], (g) => {
    K.focusLines(g, 690, 320, t, { inner: 110, n: 120, x0: 40, y0: 80, x1: 1040, y1: 860 });
    drawGoalAndWall(g, {
      ballPos: [640, 290, 34, t * 18],
      trailPts: [[560, 800], [830, 560], [885, 420], [705, 295], [640, 290]],
      keeperShock: true,
    });
    K.splat(g, 705, 295, 0.65, 9);
    K.sfxText(g, 'KLANG!!', 730, 180, { size: 165, k: clamp(lt / 0.2), t, rot: 0.08, shake: 10 });
  }, { k: 1 });
  K.panel(ctx, [[40, 900], [1040, 820], [1040, BOT], [40, BOT]], (g) => {
    K.gradTone(g, 40, 820, 1000, 580, { invert: true });
    K.sfxText(g, 'GOOOL!!', 540, 1080, { size: 230, k: clamp((lt - 0.2) / 0.25), t, rot: -0.05, shake: 6 });
    K.capBox(g, 'FABIEN BARTHEZ TERPAKU MEMATUNG TANPA BERGERAK!', 540, 1275, { size: 40 });
  }, { k: clamp((lt - 0.15) / 0.25), from: 'bottom' });
});

// 8. Finale: The Snail-Shell Spiral ("Spiral Cangkang Keong di Udara")
shot('akhir', (t, a, b) => {
  const lt = t - a;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 860], [40, 780]], (g) => {
    g.fillStyle = '#0e0e10'; g.fillRect(40, 80, 1000, 780);
    // Draw golden/logarithmic snail-shell trajectory diagram
    g.save(); g.translate(480, 470);
    g.strokeStyle = '#f6f4ee'; g.lineWidth = 4; g.setLineDash([10, 10]);
    for (let r = 60; r <= 260; r += 65) { g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke(); }
    g.setLineDash([]);
    g.strokeStyle = '#d7263d'; g.lineWidth = 10; g.beginPath();
    for (let i = 0; i <= 80; i++) {
      const u = i / 80, ang = u * Math.PI * 2.4, rad = 260 * (1 - u * 0.78);
      const px = Math.cos(ang) * rad, py = Math.sin(ang) * rad;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
    drawSoccerBall(g, 55, -20, 48, { spin: t * 18, vortex: false });
    g.restore();
    K.capBox(g, 'KURVA SPIRAL CANGKANG KEONG (PHYSICS JOURNAL 2010)', 540, 155, { size: 40, invert: true });
  }, { k: 1 });
  K.panel(ctx, [[40, 820], [1040, 900], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 540, 1100, t, { inner: 200, n: 90, x0: 40, y0: 820, x1: 1040, y1: BOT });
    K.sfxText(g, 'MAHAKARYA', 540, 1060, { size: 175, k: clamp((lt - 0.15) / 0.25), t, rot: -0.04, shake: 3 });
    K.capBox(g, 'BUKAN KEBETULAN · MURNI HUKUM AERODINAMIKA', 540, 1265, { size: 42 });
  }, { k: clamp((lt - 0.15) / 0.25), from: 'bottom' });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (since < 0.09 && s.id !== 'hook' && s.id !== 'sepak') { fx.fillStyle = 'rgba(14,14,16,0.9)'; fx.fillRect(0, 0, AM.W, AM.H); }
  const endA = clamp((t - (AM.duration - 0.45)) / 0.45);
  if (endA > 0) { fx.fillStyle = `rgba(246,244,238,${endA})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.grain(fx, t, { amount: 0.04, fps: 12 });
}

