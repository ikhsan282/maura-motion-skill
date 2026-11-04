// Math Explainer Gelap demo3 (~63s): "Setengah Tak Terhingga — Paradoks Zeno dan Deret Geometri yang Genap Menjadi Satu"
// Satu batang + bujursangkar satuan dibagi dua terus; potongan menumpuk mengisi batang penuh, rumus menulis 1/2+1/4+...=1.
import * as K from '/styles/math-3b1b/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1470, size: 54, box: { fill: 'rgba(14,17,22,.84)', pad: 18, radius: 14 } } };

let ctx;
const C = {};
const W = (id, w, n = 0) => AM.wordTime(id, w, n);
const BX = 120, BW = 840, BY = 540, BH = 125;
const COLS = [K.PAL.blue, K.PAL.yellow, K.PAL.teal, K.PAL.red, K.PAL.green, K.PAL.purple];
let T = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  T = {
    b1: W('hook', 'setengah'),
    b2: W('hook', 'sisanya'),
    f1: W('jumlah', 'Setengah'),
    f2: W('jumlah', 'seperempat'),
    f3: W('jumlah', 'seperdelapan'),
    zeno: C.zeno.start,
    batas: C.batas.start,
    hasil: C.hasil.start,
    eq: W('batas', 'satu'),
  };
  AM.sfx('whoosh', T.b1, { gain: 0.3 });
  AM.sfx('whoosh', T.b2, { gain: 0.3 });
  AM.sfx('pop', T.f1, { gain: 0.4 });
  AM.sfx('pop', T.f2, { gain: 0.4, pitch: 1.1 });
  AM.sfx('pop', T.f3, { gain: 0.4, pitch: 1.25 });
  AM.sfx('chime', T.eq, { gain: 0.45 });
}

const SEGS = [
  [0, 1 / 2, '1/2', 0],
  [1 / 2, 1 / 4, '1/4', 1],
  [3 / 4, 1 / 8, '1/8', 2],
  [7 / 8, 1 / 16, '1/16', 3],
  [15 / 16, 1 / 32, '1/32', 4],
  [31 / 32, 1 / 32, '…', 5],
];

// 2D Unit Square dissection boxes: [rx, ry, rw, rh, label, colIdx]
const SQ_BOXES = [
  [0, 0, 0.5, 1.0, '1/2', 0],
  [0.5, 0, 0.5, 0.5, '1/4', 1],
  [0.5, 0.5, 0.25, 0.5, '1/8', 2],
  [0.75, 0.5, 0.25, 0.25, '1/16', 3],
  [0.75, 0.75, 0.125, 0.25, '1/32', 4],
  [0.875, 0.75, 0.125, 0.25, '…', 5],
];

function segTime(i) {
  if (i === 0) return T.b1;
  if (i === 1) return T.b2;
  if (i === 2) return T.f3;
  return T.f3 + (i - 2) * 0.75;
}

export function render(t) {
  K.ground(ctx, { grid: 0.6 });
  const z = 1 + 0.02 * Math.sin(t * 0.4) + 0.03 * prog(t, T.batas, T.hasil + 1);
  K.cam(ctx, z, 540, 900);

  K.label(ctx, 'PARADOKS ZENO & DERET GEOMETRI TAK HINGGA', 540, 145, { alpha: 0.78, size: 24, color: K.PAL.blue });

  // Top Brace for Full Unit = 1
  const bp0 = prog(t, 0.2, 1.1);
  const LTop = K.brace(ctx, BX, BY - 22, BX + BW, BY - 22, bp0, { color: K.PAL.white, depth: 26 });
  if (bp0 > 0) {
    K.label(ctx, 'PANJANG UTUH = 1 SATUAN', LTop[0], LTop[1] - 28, { alpha: bp0, size: 26, color: K.PAL.yellow });
  }

  // 1D Bar Outline + Fills
  ctx.save();
  ctx.strokeStyle = K.PAL.white; ctx.lineWidth = 4;
  ctx.strokeRect(BX, BY, BW, BH);

  for (let i = 0; i < SEGS.length; i++) {
    const p = prog(t, segTime(i), segTime(i) + 0.45);
    if (p <= 0) continue;
    const x = BX + SEGS[i][0] * BW;
    K.line(ctx, x, BY, x, BY + BH, p, { color: K.PAL.white, w: 3 });
  }
  for (let i = 0; i < SEGS.length; i++) {
    const p = prog(t, segTime(i) + 0.15, segTime(i) + 0.65);
    if (p <= 0) continue;
    const x = BX + SEGS[i][0] * BW, w = SEGS[i][1] * BW;
    ctx.globalAlpha = (0.38 + 0.42 * p) * (i === SEGS.length - 1 ? 0.65 : 1);
    ctx.fillStyle = COLS[SEGS[i][3] % COLS.length];
    ctx.fillRect(x + 2, BY + 2, Math.max(0, (w - 4) * p), BH - 4);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // Labels under 1D bar segments
  const labels = [[0, '1/2'], [1, '1/4'], [2, '1/8']];
  for (const [i, s] of labels) {
    const p = prog(t, segTime(i) + 0.35, segTime(i) + 0.8, ease.linear);
    if (p <= 0) continue;
    const x = BX + (SEGS[i][0] + SEGS[i][1] / 2) * BW;
    K.math(ctx, s, x, BY + BH + 72, { size: i === 2 ? 54 : 68, p, colors: { 1: K.PAL.white, 2: K.PAL.white, 4: K.PAL.white, 8: K.PAL.white }, color: COLS[i] });
  }

  // 2D Unit Square visual proof below the bar (y: 800..1140)
  const SX = 370, SY = 800, SS = 340;
  const sqP = prog(t, 0.6, 1.5);
  if (sqP > 0) {
    ctx.save();
    ctx.globalAlpha = sqP;
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 3;
    ctx.strokeRect(SX, SY, SS, SS);
    for (let i = 0; i < SQ_BOXES.length; i++) {
      const p = prog(t, segTime(i) + 0.1, segTime(i) + 0.65);
      if (p <= 0) continue;
      const [rx, ry, rw, rh, lbl, ci] = SQ_BOXES[i];
      const bx = SX + rx * SS, by = SY + ry * SS, bw = rw * SS, bh = rh * SS;
      ctx.fillStyle = COLS[ci % COLS.length];
      ctx.globalAlpha = sqP * (0.28 + 0.38 * p);
      ctx.fillRect(bx + 2, by + 2, (bw - 4) * p, (bh - 4) * p);
      ctx.globalAlpha = sqP * p;
      ctx.strokeStyle = K.PAL.white;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);
      if (i < 4 && p > 0.6) {
        K.label(ctx, lbl, bx + bw / 2, by + bh / 2 + 8, { alpha: (p - 0.6) * 2.5, size: i < 2 ? 32 : 22, color: K.PAL.white });
      }
    }
    ctx.restore();
  }

  // Zeno marker: arrow creeps toward right edge
  if (t > T.zeno - 0.1 && t < T.batas + 0.4) {
    const zt = clamp((t - T.zeno) / Math.max(0.1, T.batas - T.zeno + 0.2));
    const zx = BX + BW * (1 - Math.pow(0.5, 1 + zt * 5));
    const a = env(t, T.zeno - 0.1, T.batas + 0.3, 0.2, 0.2);
    K.dot(ctx, zx, BY - 42, 11, K.PAL.red, a);
    K.label(ctx, 'ZENO: SELALU TERSISA SEPARUH CELAH?', 540, 390, { alpha: a, size: 30, color: K.PAL.red });
  }

  // running sum + final equation
  if (t > T.f1) {
    const fy = lerp(1285, 315, prog(t, T.hasil - 0.3, T.hasil + 0.8));
    const size = 92;
    const full = t > T.eq - 0.1;
    const str = full ? '1/2+1/4+1/8+…=1' : t > T.f3 ? '1/2+1/4+1/8+…' : t > T.f2 ? '1/2+1/4+…' : '1/2+…';
    const wp = prog(t, T.f1, T.f1 + 0.8, ease.linear);
    K.math(ctx, str, 540, fy, { size, p: wp, color: K.PAL.white, colors: { 1: K.PAL.yellow, 2: K.PAL.yellow, 4: K.PAL.yellow, 8: K.PAL.yellow } });
    if (full) K.surround(ctx, 540 - 380, fy - 78, 760, 108, prog(t, T.eq, T.eq + 0.6), { color: K.PAL.yellow });
    if (t > T.hasil) K.label(ctx, 'LIMIT TAK HINGGA = SATU BATANG PENUH', 540, 1295, { alpha: prog(t, T.hasil, T.hasil + 0.5), size: 32, color: K.PAL.yellow });
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
