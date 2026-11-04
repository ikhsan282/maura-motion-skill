// Kardus Bekas demo3: "Imajinasi Tanpa Batas dari Kardus Bekas — Dari Kotak Sepatu Menjadi Roket Antariksa"
import * as K from '/styles/kardus-bekas/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 2, captions: { preset: 'bold', y: 1520, size: 54, maxWords: 4 } };

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('paper', 0.08, { gain: 0.5 });
  AM.sfx('pop', C.hook.start + 0.3, { gain: 0.45 });
  AM.sfx('paper', C.kanvas.start + 0.25, { gain: 0.4 });
  AM.sfx('ding', C.potong.start + 0.3, { gain: 0.4 });
  AM.sfx('boing', C.robot.start + 0.3, { gain: 0.45 });
  AM.sfx('drum_hit', C.kastil.start + 0.3, { gain: 0.4 });
  AM.sfx('swoosh_up', C.roket.start + 0.3, { gain: 0.45 });
  AM.sfx('magic', C.sains.start + 0.3, { gain: 0.38 });
  AM.sfx('chime', C.moral.start + 0.35, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// 1. Hook: Child puppet peeking happily beside a big open shipping box
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(0.96, 1.06, p), 540, 960);
  K.cardPuppet(ctx, 'anak', { x: 340, y: 1000, s: 1.25, t, walk: 0.4, wave: 1.0 });
  K.shippingBox(ctx, 680, 1040, 1.25, { open: 0.75, mood: 'wow', stamp: 'MAINAN?', t });
  K.cardLabel(ctx, 'KEAJAIBAN KOTAK KOSONG', 540, 270, {
    tag: 'MENGAPA ANAK SUKA KARDUS?',
    sub: 'ketika pembungkus lebih seru daripada isinya',
    alpha: env(t, a + 0.1, b, 0.3, 0.25),
  });
});

// 2. Kanvas: Blank 3D cardboard panels unfolding on the cutting mat
shot('kanvas', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.04, 540, 960);
  const spread = lerp(40, 220, p);
  K.cardPanel(ctx, 540 - spread, 980, 240, 240, { col: P.kraft, rot: -0.18 * p });
  K.cardPanel(ctx, 540 + spread, 980, 240, 240, { col: P.kraft, rot: 0.18 * p });
  K.cardPanel(ctx, 540, 980 - spread * 0.85, 240, 200, { col: P.kraftLt });
  K.cardPanel(ctx, 540, 980 + spread * 0.85, 240, 200, { col: P.kraftLt });
  K.cardPanel(ctx, 540, 980, 260, 260, { col: P.kraftPale, tornCorner: true, tapeTop: true });
  K.cardLabel(ctx, 'KANVAS TIGA DIMENSI', 540, 270, {
    tag: 'PERMAINAN TERBUKA (OPEN-ENDED)',
    sub: 'bebas dilipat dan dibentuk sesuai imajinasi',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 3. Potong: Masking tape strips and brass brad joints snapping onto cardboard
shot('potong', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.1, 540, 960);
  K.cardPanel(ctx, 540, 980, 620, 420, { col: P.kraft, tornCorner: true, seed: 31 });
  K.maskingTape(ctx, 360, 840, 180, 40, -0.25);
  K.maskingTape(ctx, 720, 840, 180, 40, 0.25);
  K.maskingTape(ctx, 540, 1120, 220, 40, 0.04);
  for (let i = -2; i <= 2; i++) {
    K.bradPin(ctx, 540 + i * 95, 980, 18);
  }
  K.cardLabel(ctx, 'SELOTIP & PAKU KLIP', 540, 270, {
    tag: 'ENGSEL KRIYA SEDERHANA',
    sub: 'menyambung potongan kardus agar bisa bergerak hidup',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 4. Robot: Articulated cardboard box robot dancing and waving
shot('robot', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(1.0, 1.12, p), 540, 960);
  K.cardPuppet(ctx, 'robot', { x: 540, y: 1020, s: 1.55, t, walk: 1.0, wave: 1.0 });
  K.cardLabel(ctx, 'ROBOT KARDUS SEPATU', 540, 270, {
    tag: 'MATA TUTUP BOTOL & ENGSEL KLIP',
    sub: 'bergerak lincah dengan panel kendali gambar spidol',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 5. Kastil: Cardboard fortress with toilet-roll towers and flags
shot('kastil', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(0.96, 1.08, p), 540, 960);
  K.cardPuppet(ctx, 'kastil', { x: 540, y: 1040, s: 1.45, t });
  K.cardLabel(ctx, 'BENTENG KERAJAAN KARDUS', 540, 270, {
    tag: 'MENARA GULUNGAN TISU',
    sub: 'kastil megah hasil rakitan sore hari di ruang keluarga',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 6. Roket: Cardboard rocket blasting off amidst cardboard stars
shot('roket', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.04, 540, 960);
  // Hanging cardboard cutout stars
  for (const [sx, sy] of [[210, 680], [860, 720], [240, 1180], [840, 1140]]) {
    K.cardPanel(ctx, sx, sy + Math.sin(t * 3 + sx) * 14, 78, 78, { col: P.crayonYellow, rot: 0.4 + t * 0.2, fluteBottom: false });
  }
  K.cardPuppet(ctx, 'roket', { x: 540, y: lerp(1120, 880, p), s: 1.35, t, wave: 1.0 });
  K.cardLabel(ctx, 'ROKET RUANG TAMU', 540, 270, {
    tag: 'MELUNCUR KE ANTARIKSA',
    sub: 'kotak besar dengan sayap merah dan semburan api kertas',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 7. Sains: Spatial intelligence & problem solving
shot('sains', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.0, 540, 960);
  K.cardPuppet(ctx, 'anak', { x: 310, y: 1020, s: 1.2, t, walk: 0.5, wave: 0.8 });
  K.cardPuppet(ctx, 'robot', { x: 740, y: 1020, s: 1.15, t, walk: 0.5, wave: 0.8 });
  K.cardLabel(ctx, 'KECERDASAN SPASIAL ANAK', 540, 270, {
    tag: 'MANFAAT PSIKOLOGI KRIYA',
    sub: 'melatih pemecahan masalah, motorik, dan daya cipta',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 8. Moral: Child, robot, and rocket together on the craft workbench
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(1.06, 0.94, p), 540, 960);
  K.cardPuppet(ctx, 'kastil', { x: 540, y: 1120, s: 1.15, t });
  K.cardPuppet(ctx, 'robot', { x: 250, y: 1080, s: 0.95, t, walk: 0.4, wave: 1.0 });
  K.cardPuppet(ctx, 'roket', { x: 830, y: 980, s: 0.85, t, wave: 0.8 });
  K.cardLabel(ctx, 'MERAKIT MIMPI BESAR', 540, 270, {
    tag: 'IMAJINASI DARI KARDUS BEKAS',
    sub: 'karya terindah lahir dari tangan yang bebas berkreasi',
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
  if (i > 0 && since < 0.14) {
    ctx.fillStyle = `rgba(245,225,190,${0.22 * (1 - since / 0.14)})`;
    ctx.fillRect(0, 0, 1080, 1920);
  }
}
