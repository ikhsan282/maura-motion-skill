// Lukisan Gua Purba demo2: "Perburuan Agung di Dinding Batu — Ketika Api Unggun Menghidupkan Lukisan Purba"
import * as K from '/styles/lukisan-gua-purba/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 2, captions: { preset: 'serif', y: 1520, size: 54, maxWords: 4 } };

let ctx, W_CANVAS;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  W_CANVAS = K.caveWall('perburuan-agung', 4200, 1920, 19);

  AM.sfx('wind', 0.05, { gain: 0.25 });
  AM.sfx('drum_hit', C.hook.start + 0.3, { gain: 0.4, pitch: 0.8 });
  AM.sfx('paper', C.malam.start + 0.3, { gain: 0.4, pitch: 0.85 });
  AM.sfx('drum_hit', C.jejak.start + 0.25, { gain: 0.42 });
  AM.sfx('whoosh', C.sergap.start + 0.3, { gain: 0.38 });
  AM.sfx('drum_hit', C.tombak.start + 0.2, { gain: 0.48, pitch: 1.15 });
  AM.sfx('kentongan', C.tarian.start + 0.3, { gain: 0.35, pitch: 0.9 });
  AM.sfx('magic', C.warisan.start + 0.35, { gain: 0.35 });
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
  K.stalactites(ctx, t, { seed: 9 });
  K.torchLight(ctx, torchX, torchY, t, { r, dark: 0.8 });
}

// 1. Hook: Gathering around the cave fire at dusk
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(0, 220, p);
  const Cm = { z: lerp(1.04, 1.18, p), x: 540, y: 960 };
  drawWallStage(t, u0, Cm, (g) => {
    K.caveHunter(g, { x: 420, y: 1020, s: 1.15, face: 1, t, dance: 0.3, col: P.ochreRed });
    K.caveHunter(g, { x: 760, y: 1020, s: 1.15, face: -1, t: t + 0.4, dance: 0.3, col: P.ochreDark });
    // Painted campfire spirals between them
    K.chalkStroke(g, [[550, 1080], [590, 960], [630, 1080]], { col: P.ochreBright, width: 10, seed: 3 });
    K.chalkStroke(g, [[575, 1080], [590, 920], [605, 1080]], { col: P.ochreYellow, width: 8, seed: 4 });
  }, { torchX: 540, torchY: 960 });
  K.stonePlaque(ctx, 'API UNGGUN ZAMAN ES', 540, 250, {
    tag: 'MALAM DI MULUT GUA',
    sub: 'ketika dinding batu menjadi tempat bertutur',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 2. Malam: The elder draws the first strokes with red ochre and charcoal
shot('malam', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = lerp(220, 680, ease.inOutCubic(clamp((t - a) / 1.0)));
  const Cm = { z: 1.26, x: 540, y: 950 };
  drawWallStage(t, u0, Cm, (g) => {
    K.caveHunter(g, { x: 960, y: 1020, s: 1.2, face: 1, t, dance: 0.2, col: P.ochreDark });
    K.caveBeast(g, 'banteng', { x: 1320, y: 940, s: 1.45, face: 1, t, run: 0.2, reveal: prog(t, a + 0.3, b - 0.3) });
  }, { torchX: 580, torchY: 920 });
  K.stonePlaque(ctx, 'GORESAN OKER & ARANG', 540, 250, {
    tag: 'SANG TETUA PELUKIS',
    sub: 'mengabadikan ingatan suku di atas batu gamping',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 3. Jejak: The herd of wild banteng and antlered deer galloping across the rock
shot('jejak', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(680, 1360, ease.inOutCubic(clamp((t - a) / 1.0)));
  const Cm = { z: 1.2, x: 540, y: 960 };
  drawWallStage(t, u0, Cm, (g) => {
    const move = p * 90;
    K.caveBeast(g, 'banteng', { x: 1620 + move, y: 980, s: 1.55, face: 1, t, run: 0.9, col: P.ochreRed });
    K.caveBeast(g, 'rusa', { x: 1980 + move * 1.2, y: 810, s: 1.2, face: 1, t: t + 0.3, run: 1.0, col: P.ochreBright });
    K.caveBeast(g, 'rusa', { x: 1450 + move * 0.8, y: 760, s: 1.05, face: 1, t: t + 0.6, run: 0.95, col: P.ochreYellow });
  }, { torchX: 540, torchY: 920, r: 900 });
  K.stonePlaque(ctx, 'KAWANAN BANTENG & RUSA', 540, 250, {
    tag: 'SAVANA PURBA NUSANTARA',
    sub: 'tanduk melengkung dan langkah yang berderap',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 4. Sergap: Hunters flanking the herd from both sides in coordinated teamwork
shot('sergap', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(1360, 2040, ease.inOutCubic(clamp((t - a) / 1.0)));
  const Cm = { z: 1.22, x: 540, y: 960 };
  drawWallStage(t, u0, Cm, (g) => {
    const closeIn = p * 75;
    K.caveBeast(g, 'banteng', { x: 2580, y: 980, s: 1.5, face: 1, t, run: 0.85, col: P.ochreRed });
    K.caveHunter(g, { x: 2180 + closeIn, y: 920, s: 1.1, face: 1, t, run: 1.0, spear: true, col: P.ochreDark });
    K.caveHunter(g, { x: 2240 + closeIn, y: 1120, s: 1.1, face: 1, t: t + 0.2, run: 1.0, bow: true, col: P.ochreBright });
    K.caveHunter(g, { x: 2960 - closeIn, y: 960, s: 1.15, face: -1, t: t + 0.4, run: 1.0, spear: true, col: P.ochreDark });
    K.caveHunter(g, { x: 2900 - closeIn, y: 1140, s: 1.05, face: -1, t: t + 0.6, run: 1.0, bow: true, col: P.ochreRed });
  }, { torchX: 540, torchY: 960, r: 920 });
  K.stonePlaque(ctx, 'STRATEGI KEPUNGAN', 540, 250, {
    tag: 'KERJA SAMA KELOMPOK',
    sub: 'mengepung buruan besar dari dua arah tebing',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 5. Tombak: Spears and arrows flying in the decisive moment
shot('tombak', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = 2040;
  const Cm = { z: lerp(1.22, 1.42, p), x: 540, y: 970 };
  drawWallStage(t, u0, Cm, (g) => {
    K.caveBeast(g, 'banteng', { x: 2580, y: 980, s: 1.55, face: -1, t: t * 1.3, run: 1.0, col: P.ochreRed });
    K.caveHunter(g, { x: 2260, y: 980, s: 1.22, face: 1, t: t * 1.3, run: 1.0, spear: true, col: P.ochreBright });
    K.caveHunter(g, { x: 2880, y: 1000, s: 1.2, face: -1, t: t * 1.3, run: 1.0, bow: true, col: P.ochreDark });
    // Flying ochre spears/arrows across the gap
    const fly = (t * 1.8) % 1;
    K.chalkStroke(g, [[2340 + fly * 180, 900 - fly * 20], [2430 + fly * 180, 920 - fly * 20]], { col: P.bone, width: 5, seed: 9 });
    K.chalkStroke(g, [[2800 - fly * 160, 910 - fly * 15], [2720 - fly * 160, 925 - fly * 15]], { col: P.bone, width: 5, seed: 10 });
  }, { torchX: 540 + Math.sin(t * 7) * 50, torchY: 960, r: 880 });
  K.stonePlaque(ctx, 'TOMBAK & BUSUR PURBA', 540, 250, {
    tag: 'DETIK PENENTUAN',
    sub: 'keberanian demi kelangsungan hidup bersama',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 6. Tarian: Ceremonial dance of gratitude around the fire
shot('tarian', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(2040, 2760, ease.inOutCubic(clamp((t - a) / 1.0)));
  const Cm = { z: 1.24, x: 540, y: 960 };
  drawWallStage(t, u0, Cm, (g) => {
    for (let i = 0; i < 5; i++) {
      const hx = 2940 + i * 175;
      const hy = 980 + Math.sin(i * 1.5) * 70;
      K.caveHunter(g, {
        x: hx, y: hy, s: 1.12, face: i < 2 ? 1 : -1,
        t: t + i * 0.25, dance: 1.0, therianthrope: i === 2,
        col: i % 2 === 0 ? P.ochreRed : P.ochreBright,
      });
    }
  }, { torchX: 540, torchY: 950, r: 900 });
  K.stonePlaque(ctx, 'TARIAN SYUKUR LELUHUR', 540, 250, {
    tag: 'PENGHORMATAN PADA ALAM',
    sub: 'menari bersama mengelilingi nyala api suci',
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 7. Warisan: Generations of family handprints surrounding the hunting mural
shot('warisan', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(2760, 3120, ease.inOutCubic(clamp((t - a) / 0.9)));
  const Cm = { z: 1.22, x: 540, y: 920 };
  drawWallStage(t, u0, Cm, (g) => {
    const hands = [
      [3340, 740, 1.1, -0.2, true, 51],
      [3560, 680, 1.05, 0.1, false, 52],
      [3780, 730, 1.12, 0.22, true, 53],
      [3450, 960, 0.72, -0.1, true, 54],  // child handprint
      [3680, 950, 0.68, 0.15, false, 55], // child handprint
      [3900, 930, 1.0, -0.12, false, 56],
    ];
    hands.forEach(([hx, hy, hs, hr, left, seed], idx) => {
      K.handStencil(g, hx, hy, { s: hs, rot: hr, left, seed, reveal: prog(t, a + idx * 0.35, a + idx * 0.35 + 0.9) });
    });
  }, { torchX: 540, torchY: 900, r: 900 });
  K.stonePlaque(ctx, 'IKATAN LINTAS GENERASI', 540, 250, {
    tag: 'CAP TANGAN KELUARGA',
    sub: 'telapak tangan orang tua dan anak berdampingan di batu',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.35, 0.25),
  });
});

// 8. Moral: Wide pullback showing the hunters, herd, and hand stencils together
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = 3120;
  const Cm = { z: lerp(1.22, 1.0, p), x: 540, y: 960 };
  drawWallStage(t, u0, Cm, (g) => {
    K.handStencil(g, 3380, 680, { s: 1.05, rot: -0.2, seed: 51 });
    K.handStencil(g, 3660, 640, { s: 0.72, rot: 0.1, left: false, seed: 54 });
    K.handStencil(g, 3920, 690, { s: 1.05, rot: 0.2, seed: 53 });
    K.caveBeast(g, 'banteng', { x: 3680, y: 1020, s: 1.45, face: 1, t, run: 0.5, col: P.ochreRed });
    K.caveHunter(g, { x: 3340, y: 1040, s: 1.15, face: 1, t, dance: 0.6, col: P.ochreBright });
    K.caveHunter(g, { x: 3980, y: 1040, s: 1.15, face: -1, t: t + 0.3, dance: 0.6, col: P.ochreBright });
  }, { torchX: 540, torchY: 920, r: 960 });
  K.stonePlaque(ctx, 'KEKUATAN KEBERSAMAAN', 540, 250, {
    tag: 'PESAN DARI DINDING GUA',
    sub: 'manusia bertahan melintasi zaman karena saling menjaga',
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

