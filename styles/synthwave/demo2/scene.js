// Synthwave demo 2: "Laser, Grid & Matahari Bergaris — Estetika Synthwave Masa Depan dari Masa Lalu"
import * as K from '/styles/synthwave/kit.js';
const { clamp, lerp, ease, hrand, TAU } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, captions: { preset: 'neon', y: 1470, size: 60, maxWords: 4 } };

let g;
const C = {};
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

function lasers(t, n = 5, y0 = 480) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.25 + i / n) % 1;
    const y = y0 + i * 90 + Math.sin(t * 1.5 + i * 2) * 30;
    const x0 = ph * 1400 - 160;
    const col = i % 2 ? P.pink : P.cyan;
    g.save();
    g.globalAlpha = 0.75;
    g.beginPath();
    g.moveTo(x0 - 500, y - 120);
    g.lineTo(x0 + 500, y + 60);
    K.neon(g, col, 5, { halo: 1 });
    g.restore();
    K.glow(g, x0, y, 90, col, 0.5);
  }
}

// Neon wireframe OutRun 80s wedge supercar (rear perspective racing toward the horizon)
function drawSupercar(g, x, y, s = 1, t = 0) {
  g.save();
  g.translate(x + Math.sin(t * 4) * 8, y + Math.sin(t * 12) * 2.5);
  g.scale(s, s);

  // Dark body silhouette
  g.fillStyle = '#0c0218';
  g.beginPath();
  g.moveTo(-250, 40);
  g.lineTo(-235, -35);
  g.lineTo(-165, -105);
  g.lineTo(165, -105);
  g.lineTo(235, -35);
  g.lineTo(250, 40);
  g.closePath();
  g.fill();

  // Wide rear tires
  g.fillStyle = '#05010a';
  g.fillRect(-255, 25, 76, 62);
  g.fillRect(179, 25, 76, 62);

  // Neon cyan wireframe body contours & louvered rear window
  g.beginPath();
  g.moveTo(-250, 40); g.lineTo(-235, -35); g.lineTo(-165, -105);
  g.lineTo(165, -105); g.lineTo(235, -35); g.lineTo(250, 40); g.closePath();
  g.moveTo(-235, -35); g.lineTo(235, -35);
  for (let i = -3; i <= 3; i++) {
    g.moveTo(i * 42, -105); g.lineTo(i * 56, -35);
  }
  // Testarossa side strakes
  for (let k = 0; k < 3; k++) {
    const yy = -15 + k * 16;
    g.moveTo(-245, yy); g.lineTo(245, yy);
  }
  K.neon(g, P.cyan, 3.2, { halo: 0.7 });

  // Glowing twin magenta/red taillights & license plate
  for (const sx of [-165, 165]) {
    K.glow(g, sx, -8, 65, P.red, 0.75);
    g.beginPath(); g.roundRect(sx - 55, -24, 110, 28, 6);
    K.neon(g, P.red, 4, { core: '#fff', halo: 1 });
  }
  K.neonText(g, 'OUTRUN 86', 0, 12, { size: 22, color: P.yellow });
  g.restore();
}

function world(t, o = {}) {
  K.sky(g, t);
  K.sun(g, t, o.sun || {});
  if (o.mtn !== false) K.mountains(g, t, o.mtnOpts || {});
  K.grid(g, t, o.grid || {});
}

function title(str, y, t, t0, opts = {}) {
  if (t < t0) return;
  const p = ease.outBack(clamp((t - t0) / 0.35), 1.6);
  K.chrome(g, str, 540, y, { scale: 0.6 + 0.4 * p, alpha: clamp((t - t0) / 0.15), ...opts });
}

export async function setup(AM) {
  g = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('boom', 0.12, { gain: 0.5 });
  AM.sfx('whoosh', C.tron.start + 0.15, { gain: 0.4 });
  AM.sfx('swoosh_up', C.gunung.start + 0.15, { gain: 0.4 });
  AM.sfx('chime', C.matahari.start + 0.2, { gain: 0.4 });
  AM.sfx('whoosh', C.outrun.start + 0.2, { gain: 0.45 });
  AM.sfx('glitch', C.lazer.start + 0.2, { gain: 0.4 });
  AM.sfx('drum_hit', C.kebangkitan.start + 0.2, { gain: 0.45 });
  AM.sfx('boom', C.akhir.start + 0.2, { gain: 0.55 });
}

// 1. Hook: Glowing horizon & endless neon grid
shot('hook', (t, a, b) => {
  world(t, { grid: { speed: 1.6 } });
  title('SYNTHWAVE', 310, t, C.hook.start, { size: 185 });
  K.neonText(g, 'GARIS HORIZON & GRID TANPA UJUNG', 540, 175, { size: 36, color: P.cyan, alpha: clamp(t / 0.3) });
  if (t > C.hook.start + 0.5) K.neonText(g, 'MENGAPA MASA DEPAN 80-AN TAMPAK SEPERTI INI?', 540, 480, { size: 34, color: P.pink, flicker: 0.2, t });
});

// 2. 1982 CGI origins — Vector wireframe polyhedron & early computer memory limits
shot('tron', (t, a, b) => {
  const lt = t - a;
  K.sky(g, t);
  K.grid(g, t, { speed: 0.9, color: P.cyan, color2: P.cyan });
  title('1982', 260, t, a, { size: 210, rim: P.cyan });
  K.neonText(g, 'ERA AWAL KOMPUTER GRAFIS 3D', 540, 415, { size: 38, color: P.yellow });

  // Rotating 3D wireframe octahedron/diamond above the grid
  g.save();
  g.translate(540, 720);
  const r = 190, rot = t * 1.1;
  const ringPts = [0, 1, 2, 3].map((i) => {
    const a0 = rot + (i / 4) * TAU;
    return [Math.cos(a0) * r, Math.sin(a0) * r * 0.38];
  });
  g.beginPath();
  for (let i = 0; i < 4; i++) {
    const [x0, y0] = ringPts[i], [x1, y1] = ringPts[(i + 1) % 4];
    g.moveTo(x0, y0); g.lineTo(x1, y1);
    g.moveTo(0, -210); g.lineTo(x0, y0);
    g.moveTo(0, 210); g.lineTo(x0, y0);
  }
  K.neon(g, P.cyan, 3.5, { halo: 0.9 });
  g.restore();
  K.neonText(g, 'RAM TERBATAS → OBJEK PADAT DIGANTI GARIS VEKTOR', 540, 1080, { size: 30, color: P.pink });
});

// 3. Wireframe Mountains (Tron & Vector Arcade)
shot('gunung', (t, a, b) => {
  const shift = Math.sin(t * 0.6) * 45;
  K.sky(g, t);
  K.sun(g, t, { y: K.HZ - 130, alpha: 0.65 });
  K.mountains(g, t, { shift, color: P.cyan });
  K.grid(g, t, { speed: 1.3 });
  title('WIREFRAME', 290, t, a, { size: 175, rim: P.cyan });
  K.neonText(g, 'JARING KAWAT 3D FILM TRON & MESIN ARCADE', 540, 465, { size: 34, color: P.cyan });
});

// 4. Striped Sun — VHS Blank Tape Covers (Scotch / TDK) & CRT scanline sunset
shot('matahari', (t, a, b) => {
  const lt = t - a;
  world(t, {
    sun: { y: lerp(K.HZ + 50, K.HZ - 160, ease.outCubic(clamp(lt / 1.5))), r: 310, pulse: 0.45 },
    grid: { speed: 0.9 },
  });
  title('SUNSET', 280, t, a, { size: 195, rim: P.orange });
  K.neonText(g, 'SAMPUL KASET VHS & EFEK FATAMORGANA SENJA', 540, 455, { size: 34, color: P.yellow });
});

// 5. 1986 OutRun: Red/Neon Supercar racing down the synth highway
shot('outrun', (t, a, b) => {
  const lt = t - a;
  world(t, { sun: { y: K.HZ - 150, pulse: 0.35 }, grid: { speed: 2.6, pulse: 0.4 } });
  drawSupercar(g, 540, 1210, 1.18, t);
  title('OUTRUN 1986', 280, t, a, { size: 165, rim: P.mag });
  K.neonText(g, 'MOBIL SPORT + JALAN RAYA NEON + SYNTH ANALOG', 540, 445, { size: 32, color: P.cyan });
});

// 6. Chrome Horizon Typography & Laser Beams (Heavy Metal Airbrush Art)
shot('lazer', (t, a, b) => {
  K.sky(g, t);
  K.sun(g, t, { y: K.HZ - 150, alpha: 0.7 });
  K.mountains(g, t);
  K.grid(g, t, { speed: 2.0, pulse: 0.5 });
  lasers(t, 6, 420);
  title('CHROME', 310, t, a, { size: 220, rim: P.red });
  K.neonText(g, 'TIPOGRAFI AIRBRUSH PANTULAN CAKRAWALA LOGAM', 540, 500, { size: 32, color: P.yellow, flicker: 0.25, t });
});

// 7. Mid-2000s Internet Revival (OutRun / Retrowave nostalgia)
shot('kebangkitan', (t, a, b) => {
  const lt = t - a;
  world(t, { grid: { speed: 1.5 } });
  // Floating retro cassette + 2005 revival badge
  g.save();
  g.translate(540, 680);
  g.beginPath(); g.roundRect(-220, -135, 440, 270, 22); K.neon(g, P.mag, 4);
  g.beginPath(); g.arc(-95, 0, 44, 0, TAU); g.moveTo(139, 0); g.arc(95, 0, 44, 0, TAU);
  g.rect(-145, 78, 290, 48); K.neon(g, P.cyan, 3);
  K.neonText(g, '1984 ➔ 2006', 0, -82, { size: 42, color: P.yellow });
  g.restore();
  title('RETROWAVE', 270, t, a, { size: 165, rim: P.cyan });
  K.neonText(g, 'RINDU PADA MASA DEPAN YANG OPTIMISTIS', 540, 435, { size: 36, color: P.pink });
});

// 8. Finale: Synthwave — The Future From The Past
shot('akhir', (t, a, b) => {
  world(t, { sun: { pulse: 0.6 }, grid: { speed: 2.0, pulse: 0.4 } });
  lasers(t, 4, 360);
  drawSupercar(g, 540, 1230, 1.05, t);
  title('SYNTHWAVE', 280, t, a, { size: 180 });
  title('LAZER & GRID', 470, t, a + 0.35, { size: 145, rim: P.cyan });
  K.neonText(g, 'MASA DEPAN IMPIAN DARI MASA LALU', 540, 620, { size: 38, color: P.pink });
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  g.save(); s.fn(t, Math.max(0, a), b); g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0);
  K.crtOverlay(g);
  AM.lib.vignette(g, { strength: 0.5, inner: 0.4 });
}
