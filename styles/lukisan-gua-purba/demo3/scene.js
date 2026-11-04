// Lukisan Gua Purba demo3: "Rahasia Cap Tangan Merah — Pesan Manusia Purba yang Melintasi Zaman"
import * as K from '/styles/lukisan-gua-purba/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 2, captions: { preset: 'serif', y: 1520, size: 54, maxWords: 4 } };

let ctx, W_CANVAS;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  W_CANVAS = K.caveWall('cap-tangan-merah', 4200, 1920, 31);

  AM.sfx('wind', 0.05, { gain: 0.25 });
  AM.sfx('gong', C.hook.start + 0.3, { gain: 0.45, pitch: 0.85 });
  AM.sfx('whoosh', C.teknik.start + 0.35, { gain: 0.4 });
  AM.sfx('magic', C.anak.start + 0.3, { gain: 0.35 });
  AM.sfx('paper', C.pohon.start + 0.3, { gain: 0.4, pitch: 0.85 });
  AM.sfx('drum_hit', C.pelaut.start + 0.3, { gain: 0.4 });
  AM.sfx('bell_temple', C.abadi.start + 0.35, { gain: 0.35 });
  AM.sfx('gong', C.moral.start + 0.3, { gain: 0.5 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

function cam(z, cx, cy) {
  ctx.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z);
}

function drawWallStage(t, u0, Cm, paintFn, { torchX = 540, torchY = 920, r = 860 } = {}) {
  cam(Cm.z, Cm.x, Cm.y);
  ctx.drawImage(W_CANVAS, -u0, 0);
  ctx.save();
  ctx.translate(-u0, 0);
  paintFn && paintFn(ctx);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.stalactites(ctx, t, { seed: 14 });
  K.torchLight(ctx, torchX, torchY, t, { r, dark: 0.8 });
}

// 1. Hook: Wall of glowing red hand stencils across the Indonesian archipelago
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(0, 260, p);
  const Cm = { z: lerp(1.04, 1.18, p), x: 540, y: 940 };
  drawWallStage(t, u0, Cm, (g) => {
    const cluster = [
      [360, 760, 1.05, -0.2, true, 61],
      [580, 700, 1.1, 0.08, false, 62],
      [810, 770, 1.0, 0.24, true, 63],
      [470, 980, 0.98, -0.1, false, 64],
      [710, 960, 1.08, 0.14, true, 65],
    ];
    for (const [hx, hy, hs, hr, left, seed] of cluster) {
      K.handStencil(g, hx, hy, { s: hs, rot: hr, left, seed });
    }
  }, { torchX: lerp(420, 620, p), torchY: 900 });
  K.stonePlaque(ctx, 'JEJAK TANGAN NUSANTARA', 540, 250, {
    tag: 'SULAWESI · KALIMANTAN · RAJA AMPAT',
    sub: 'ribuan cap tangan merah yang melintasi puluhan milenium',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 2. Teknik: Spraying red ochre through a bone pipe over an outstretched hand
shot('teknik', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = lerp(260, 860, ease.inOutCubic(clamp((t - a) / 0.9)));
  const Cm = { z: lerp(1.22, 1.42, p), x: 540, y: 900 };
  drawWallStage(t, u0, Cm, (g) => {
    const rev = prog(t, a + 0.3, b - 0.3);
    K.handStencil(g, 1400, 880, { s: 1.45, rot: -0.05, seed: 71, reveal: rev });
    // Bone blowpipe spraying ochre mist
    g.save();
    g.strokeStyle = P.bone;
    g.lineWidth = 10;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(1640, 1080);
    g.lineTo(1490, 955);
    g.stroke();
    g.restore();
  }, { torchX: 540, torchY: 900 });
  K.stonePlaque(ctx, 'PIPA TULANG SEMBUR', 540, 250, {
    tag: 'TEKNIK AEROGRAF PURBA',
    sub: 'menyemprotkan kabut oker merah di sekeliling jari',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 3. Anak: Tiny children's handprints next to adults' palms
shot('anak', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(860, 1420, ease.inOutCubic(clamp((t - a) / 0.9)));
  const Cm = { z: 1.3, x: 540, y: 900 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 1820, 860, { s: 1.25, rot: -0.14, left: true, seed: 75 });
    K.handStencil(g, 2120, 860, { s: 1.22, rot: 0.14, left: false, seed: 76 });
    // Tiny child's handprints in the center
    K.handStencil(g, 1970, 920, { s: 0.66, rot: 0.02, left: true, col: P.ochreBright, seed: 77, reveal: prog(t, a + 0.3, a + 1.6) });
    K.handStencil(g, 1970, 730, { s: 0.62, rot: -0.05, left: false, col: P.ochreBright, seed: 78, reveal: prog(t, a + 1.0, a + 2.2) });
  }, { torchX: 540, torchY: 890 });
  K.stonePlaque(ctx, 'TANGAN ANAK PURBA', 540, 250, {
    tag: 'KELUARGA DI DALAM GUA',
    sub: 'cetakan telapak mungil di antara tangan ayah dan ibu',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 4. Pohon: Sangkulirang-Mangkalihat "Tree of Life" connected hand stencils!
shot('pohon', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(1420, 2080, ease.inOutCubic(clamp((t - a) / 0.9)));
  const Cm = { z: 1.22, x: 540, y: 920 };
  drawWallStage(t, u0, Cm, (g) => {
    const nodes = [
      [2620, 700, 1.0, 0, true, 81],
      [2400, 800, 0.95, -0.35, true, 82],
      [2840, 800, 0.95, 0.35, false, 83],
      [2460, 1000, 0.9, -0.2, true, 84],
      [2780, 1000, 0.9, 0.2, false, 85],
    ];
    // Connecting vine/branch lines from central trunk (Sangkulirang style)
    const revBranch = prog(t, a + 0.4, b - 0.3);
    for (const [nx, ny] of nodes) {
      K.chalkStroke(g, [[2620, 1220], [2620, 960], [nx, ny + 30]], { col: P.ochreBright, width: 7, alpha: revBranch, seed: nx });
    }
    for (const [nx, ny, ns, nr, left, seed] of nodes) {
      K.handStencil(g, nx, ny, { s: ns, rot: nr, left, seed });
    }
  }, { torchX: 540, torchY: 920, r: 900 });
  K.stonePlaque(ctx, 'POHON KEHIDUPAN KALIMANTAN', 540, 250, {
    tag: 'KARST SANGKULIRANG-MANGKALIHAT',
    sub: 'cap tangan yang terhubung jalinan sulur silsilah klan',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 5. Pelaut: Austronesian spirit boats painted alongside ancient ochre hands
shot('pelaut', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(2080, 2760, ease.inOutCubic(clamp((t - a) / 0.9)));
  const Cm = { z: 1.24, x: 540, y: 960 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 3120, 740, { s: 1.0, rot: -0.2, seed: 86 });
    K.handStencil(g, 3480, 740, { s: 1.0, rot: 0.2, left: false, seed: 87 });
    K.caveBeast(g, 'perahu', { x: 3300 + p * 40, y: 1050, s: 1.45, face: 1, t, run: 1.0, col: P.charcoal });
    K.caveBeast(g, 'perahu', { x: 3300 + p * 40, y: 1050, s: 1.45, face: 1, t, run: 1.0, col: P.ochreYellow, reveal: 0.45 });
  }, { torchX: 540, torchY: 960, r: 880 });
  K.stonePlaque(ctx, 'PERAHU ARWAH LELUHUR', 540, 250, {
    tag: 'JEJAK PELAUT AUSTRONESIA',
    sub: 'generasi baru melukis perahu di samping cap tangan purba',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 6. Makna: Touching the rock veil between worlds
shot('makna', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = 2760;
  const Cm = { z: lerp(1.24, 1.38, p), x: 540, y: 880 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 3300, 860, { s: 1.35, rot: 0, seed: 88 });
    K.caveHunter(g, { x: 3120, y: 1040, s: 1.15, face: 1, t, dance: 0.4, therianthrope: true, col: P.ochreRed });
    K.caveHunter(g, { x: 3480, y: 1040, s: 1.15, face: -1, t: t + 0.3, dance: 0.4, therianthrope: true, col: P.ochreRed });
  }, { torchX: 540, torchY: 880 });
  K.stonePlaque(ctx, 'JENDELA DUNIA LELUHUR', 540, 250, {
    tag: 'SPIRITUALITAS PRIMITIF',
    sub: 'menyentuh batu sebagai jembatan doa dan harapan',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 7. Abadi: Calcite mineral glaze preserving the red ochre for 50,000 years
shot('abadi', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(2760, 3120, ease.inOutCubic(clamp((t - a) / 0.9)));
  const Cm = { z: 1.28, x: 540, y: 900 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 3660, 860, { s: 1.35, rot: -0.06, seed: 91 });
    // Shimmering calcite crystal dots over the stencil
    g.fillStyle = P.bone;
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2 + t * 0.3;
      const rad = 35 + (i % 5) * 26;
      g.globalAlpha = 0.35 + 0.45 * Math.sin(t * 4 + i) ** 2;
      g.beginPath();
      g.arc(3660 + Math.cos(ang) * rad, 850 + Math.sin(ang) * rad, 4, 0, Math.PI * 2);
      g.fill();
    }
  }, { torchX: 540, torchY: 900 });
  K.stonePlaque(ctx, 'LAPISAN KALSIT ALAMI', 540, 250, {
    tag: 'KACA PELINDUNG WAKTU',
    sub: 'tetesan mineral gua mengunci warna merah selama ribuan tahun',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 8. Moral: Final grand wall of hand stencils waving across 50,000 years
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = 3120;
  const Cm = { z: lerp(1.28, 1.0, p), x: 540, y: 940 };
  drawWallStage(t, u0, Cm, (g) => {
    const all = [
      [3360, 720, 1.05, -0.2, true, 92],
      [3660, 680, 1.15, 0.04, false, 93],
      [3940, 740, 1.05, 0.22, true, 94],
      [3500, 960, 0.72, -0.08, true, 95],
      [3800, 950, 0.7, 0.12, false, 96],
    ];
    for (const [hx, hy, hs, hr, left, seed] of all) {
      K.handStencil(g, hx, hy, { s: hs, rot: hr, left, seed });
    }
    K.caveBeast(g, 'babi-rusa', { x: 3660, y: 1180, s: 1.25, face: -1, t, run: 0.35 });
  }, { torchX: 540, torchY: 920, r: 960 });
  K.stonePlaque(ctx, 'KAMI PERNAH ADA DI SINI', 540, 250, {
    tag: 'SAPAAN LIMA PULUH RIBU TAHUN',
    sub: 'warisan abadi manusia purba di tebing karst Nusantara',
    size: 46,
    alpha: env(t, a + 0.15, b + 0.5, 0.35, 0.2),
  });
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= at(sh.id)) s = sh;
  const i = SHOTS.indexOf(s);
  const a = Math.max(0, at(s.id)), b = SHOTS[i + 1] ? at(SHOTS[i + 1].id) : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - a;
  if (i > 0 && since < 0.16) {
    ctx.fillStyle = `rgba(255,180,95,${0.22 * (1 - since / 0.16)})`;
    ctx.fillRect(0, 0, 1080, 1920);
  }
}
