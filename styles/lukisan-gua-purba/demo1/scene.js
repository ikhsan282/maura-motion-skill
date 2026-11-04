// Lukisan Gua Purba demo1: "Lukisan Gua Tertua di Dunia Ada di Sulawesi — Jejak 51.200 Tahun di Karst Maros-Pangkep"
import * as K from '/styles/lukisan-gua-purba/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 2, captions: { preset: 'serif', y: 1520, size: 54, maxWords: 4 } };

let ctx, W_CANVAS;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  W_CANVAS = K.caveWall('maros-pangkep', 4200, 1920, 7);

  AM.sfx('wind', 0.05, { gain: 0.25 });
  AM.sfx('drum_hit', C.hook.start + 0.3, { gain: 0.4, pitch: 0.75 });
  AM.sfx('gong', C.maros.start + 0.25, { gain: 0.45, pitch: 0.85 });
  AM.sfx('whoosh', C.cap_tangan.start + 0.4, { gain: 0.35 });
  AM.sfx('drum_hit', C.babirusa.start + 0.25, { gain: 0.4 });
  AM.sfx('drum_hit', C.karampuang.start + 0.3, { gain: 0.4, pitch: 1.1 });
  AM.sfx('paper', C.pigmen.start + 0.3, { gain: 0.4, pitch: 0.8 });
  AM.sfx('magic', C.animasi.start + 0.35, { gain: 0.35 });
  AM.sfx('gong', C.moral.start + 0.3, { gain: 0.5 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

function cam(z, cx, cy) {
  ctx.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z);
}

function drawWallStage(t, u0, Cm, paintFn, { torchX = 540, torchY = 920, r = 840 } = {}) {
  cam(Cm.z, Cm.x, Cm.y);
  ctx.drawImage(W_CANVAS, -u0, 0);
  ctx.save();
  ctx.translate(-u0, 0);
  paintFn && paintFn(ctx);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.stalactites(ctx, t, { seed: 3 });
  K.torchLight(ctx, torchX, torchY, t, { r, dark: 0.8 });
}

// 1. Hook: Torchlight sweeps across the dark Maros-Pangkep karst cave wall
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(0, 260, p);
  const Cm = { z: lerp(1.02, 1.16, p), x: 540, y: 960 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 380, 760, { s: 1.05, rot: -0.18, seed: 1, reveal: prog(t, a + 0.4, a + 1.8) });
    K.caveBeast(g, 'babi-rusa', { x: 760, y: 980, s: 1.25, face: -1, t, run: 0.2 });
  }, { torchX: lerp(380, 620, p), torchY: 920 });
  K.stonePlaque(ctx, 'KARST MAROS-PANGKEP', 540, 250, {
    tag: 'SULAWESI SELATAN · INDONESIA',
    sub: 'lukisan gua figuratif tertua di dunia',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 2. Maros: 51,200 years old discovery at Leang Karampuang & Leang Tedongnge
shot('maros', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(260, 620, p);
  const Cm = { z: lerp(1.16, 1.28, p), x: 560, y: 950 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 380, 760, { s: 1.05, rot: -0.18, seed: 1 });
    K.handStencil(g, 680, 720, { s: 0.95, rot: 0.14, left: false, seed: 2 });
    K.caveBeast(g, 'babi-rusa', { x: 960, y: 980, s: 1.35, face: -1, t, run: 0.25 });
    // Uranium-series calcite crust highlight dots
    g.fillStyle = P.bone;
    for (let i = 0; i < 9; i++) {
      g.beginPath(); g.arc(880 + i * 24, 940 + (i % 3) * 18, 4.5, 0, Math.PI * 2); g.fill();
    }
  }, { torchX: 540, torchY: 940 });
  K.stonePlaque(ctx, '51.200 TAHUN LALU', 540, 250, {
    tag: 'LEANG KARAMPUANG & LEANG TEDONGNGE',
    sub: 'penanggalan seri-uranium lapisan kalsit batu',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 3. Cap Tangan: Negative hand stencils blown with red ochre pigment
shot('cap_tangan', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = lerp(620, 1180, ease.inOutCubic(clamp((t - a) / 1.0)));
  const Cm = { z: lerp(1.25, 1.38, p), x: 540, y: 880 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 1480, 820, { s: 1.15, rot: -0.15, seed: 11, reveal: prog(t, a + 0.2, a + 1.2) });
    K.handStencil(g, 1740, 760, { s: 1.1, rot: 0.12, left: false, seed: 12, reveal: prog(t, a + 0.9, a + 2.0) });
    K.handStencil(g, 1960, 860, { s: 1.0, rot: -0.08, seed: 13, reveal: prog(t, a + 1.6, a + 2.8) });
  }, { torchX: lerp(460, 620, p), torchY: 850 });
  K.stonePlaque(ctx, 'CAP TANGAN SEMBUR OKER', 540, 250, {
    tag: 'TEKNIK STENSIL NEGATIF',
    sub: 'pigmen merah disemburkan mengelilingi telapak tangan',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 4. Babi Rusa: The giant Sulawesi warty pig with interior mineral hatching
shot('babirusa', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(1180, 1850, ease.inOutCubic(clamp((t - a) / 1.0)));
  const Cm = { z: lerp(1.22, 1.35, p), x: 540, y: 980 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 2120, 720, { s: 0.95, rot: -0.2, seed: 21 });
    K.handStencil(g, 2660, 740, { s: 0.92, rot: 0.18, left: false, seed: 22 });
    K.caveBeast(g, 'babi-rusa', { x: 2420, y: 1020, s: 1.65, face: -1, t, run: 0.45 });
  }, { torchX: 540, torchY: 980, r: 880 });
  K.stonePlaque(ctx, 'BABI RUSA SULAWESI', 540, 250, {
    tag: 'SUS CELEBENSIS · LEANG TEDONGNGE',
    sub: 'lukisan figuratif berukuran 136 × 54 sentimeter',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 5. Karampuang: Three therianthrope (half-human half-animal) hunters surrounding the pig
shot('karampuang', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(1850, 2550, ease.inOutCubic(clamp((t - a) / 1.0)));
  const Cm = { z: 1.24, x: 540, y: 980 };
  drawWallStage(t, u0, Cm, (g) => {
    K.caveBeast(g, 'babi-rusa', { x: 3220, y: 1020, s: 1.45, face: -1, t, run: 0.75 });
    K.caveHunter(g, { x: 2820, y: 1010, s: 1.15, face: 1, t, run: 0.85, spear: true, therianthrope: true, col: P.ochreRed });
    K.caveHunter(g, { x: 2940, y: 860, s: 1.0, face: 1, t: t + 0.3, run: 0.8, bow: true, therianthrope: true, col: P.ochreBright });
    K.caveHunter(g, { x: 3480, y: 980, s: 1.08, face: -1, t: t + 0.6, run: 0.75, spear: true, therianthrope: true, col: P.ochreRed });
  }, { torchX: 540, torchY: 960, r: 900 });
  K.stonePlaque(ctx, 'THERIANTHROPE PURBA', 540, 250, {
    tag: 'MANUSIA SETENGAH HEWAN',
    sub: 'adegan narasi bercerita tertua dalam sejarah manusia',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 6. Pigmen: Hematite & red ochre mineral grinding stone and finger strokes
shot('pigmen', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = 2550;
  const Cm = { z: lerp(1.24, 1.36, p), x: 540, y: 1020 };
  drawWallStage(t, u0, Cm, (g) => {
    // Ochre grinding stone & concentric pigment rings on the rock
    g.save();
    g.translate(3090, 1020);
    for (let r = 180; r >= 40; r -= 32) {
      const pts = [];
      for (let k = 0; k <= 24; k++) {
        const ang = (k / 24) * Math.PI * 2;
        pts.push([Math.cos(ang) * r, Math.sin(ang) * r * 0.68]);
      }
      K.chalkStroke(g, pts, { col: r % 64 === 0 ? P.ochreBright : P.ochreRed, width: 10, alpha: prog(t, a + (180 - r) * 0.008, a + 1.8), seed: r });
    }
    g.restore();
    K.handStencil(g, 2860, 820, { s: 1.05, rot: -0.2, seed: 31 });
    K.handStencil(g, 3320, 820, { s: 1.05, rot: 0.2, left: false, seed: 32 });
  }, { torchX: 540, torchY: 980 });
  K.stonePlaque(ctx, 'PIGMEN BATU HEMATIT', 540, 250, {
    tag: 'OKER MERAH & MINERAL BUMI',
    sub: 'ditumbuk di atas batu giling dan bertahan ribuan tahun',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 7. Animasi: Flickering torchlight makes the cave figures run across the wall
shot('animasi', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(2550, 3100, p);
  const Cm = { z: 1.18, x: 540, y: 960 };
  drawWallStage(t, u0, Cm, (g) => {
    const runX = lerp(0, 160, p);
    K.caveBeast(g, 'babi-rusa', { x: 3560 + runX * 0.5, y: 940, s: 1.4, face: 1, t: t * 1.4, run: 1.0 });
    K.caveBeast(g, 'rusa', { x: 3820 + runX * 0.7, y: 780, s: 1.1, face: 1, t: t * 1.4 + 0.2, run: 1.0 });
    K.caveHunter(g, { x: 3260 + runX, y: 1020, s: 1.18, face: 1, t: t * 1.4, run: 1.0, spear: true, therianthrope: true, col: P.ochreRed });
    K.caveHunter(g, { x: 3400 + runX * 0.9, y: 1120, s: 1.1, face: 1, t: t * 1.4 + 0.4, run: 1.0, bow: true, col: P.ochreDark });
  }, { torchX: 540 + Math.sin(t * 5) * 90, torchY: 940 + Math.cos(t * 4) * 50, r: 920 });
  K.stonePlaque(ctx, 'SINEMA PERTAMA MANUSIA', 540, 250, {
    tag: 'ILUSI GERAK CAHAYA OBOR',
    sub: 'kerlip api menghidupkan goresan di dinding batu',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 8. Moral: Grand panoramic pullback revealing the whole cavern wall of Maros-Pangkep
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = 3100;
  const Cm = { z: lerp(1.18, 1.0, p), x: 540, y: 960 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 3320, 700, { s: 1.0, rot: -0.18, seed: 41 });
    K.handStencil(g, 3640, 660, { s: 1.05, rot: 0.08, left: false, seed: 42 });
    K.handStencil(g, 3920, 720, { s: 0.95, rot: 0.22, seed: 43 });
    K.caveBeast(g, 'babi-rusa', { x: 3680, y: 1020, s: 1.5, face: -1, t, run: 0.4 });
    K.caveHunter(g, { x: 3340, y: 1040, s: 1.15, face: 1, t, dance: 0.6, therianthrope: true, col: P.ochreRed });
  }, { torchX: 540, torchY: 920, r: 960 });
  K.stonePlaque(ctx, 'WARISAN 51.200 TAHUN', 540, 250, {
    tag: 'MAROS-PANGKEP · NUSANTARA',
    sub: 'pesan tertua umat manusia dari jantung Sulawesi',
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

