// Setengah Tak Terhingga demo: 1/2 + 1/4 + 1/8 + ... = 1 (paradoks Zeno).
// Satu batang dibagi dua terus; potongan menumpuk mengisi batang penuh, rumus menulis 1/2+1/4+...=1.
import * as K from '/styles/math-3b1b/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1470, size: 56, box: { fill: 'rgba(14,17,22,.82)', pad: 18, radius: 14 } } };

let ctx;
const C = {};
const W = (id, w, n = 0) => AM.wordTime(id, w, n);
const BX = 140, BW = 800, BY = 780, BH = 130;
const COLS = [K.PAL.blue, K.PAL.yellow, K.PAL.teal, K.PAL.red, K.PAL.green, K.PAL.purple];
let T = {};
export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  T = {
    b1: W('hook', 'setengah'),
    b2: W('hook', 'sisanya'),
    f1: W('jumlah', 'Setengah'), f2: W('jumlah', 'seperempat'), f3: W('jumlah', 'seperdelapan'),
    zeno: C.zeno.start, batas: C.batas.start, hasil: C.hasil.start,
    eq: W('batas', 'satu'),
  };
  AM.sfx('whoosh', T.b1, { gain: 0.3 });
  AM.sfx('whoosh', T.b2, { gain: 0.3 });
  AM.sfx('pop', T.f1, { gain: 0.4 });
  AM.sfx('pop', T.f2, { gain: 0.4, pitch: 1.1 });
  AM.sfx('pop', T.f3, { gain: 0.4, pitch: 1.25 });
  AM.sfx('chime', T.eq, { gain: 0.45 });
}

// segments: [x0 fraction, width fraction, label, color]
const SEGS = [
  [0, 1 / 2, '1/2', 0], [1 / 2, 1 / 4, '1/4', 1], [3 / 4, 1 / 8, '1/8', 2],
  [7 / 8, 1 / 16, '1/16', 3], [15 / 16, 1 / 32, '1/32', 4], [31 / 32, 1 / 32, '…', 5],
];
// when does segment i start filling
function segTime(i) {
  if (i === 0) return T.b1;
  if (i === 1) return T.b2;
  if (i === 2) return T.f3;
  return T.f3 + (i - 2) * 0.45;
}

export function render(t) {
  K.ground(ctx, { grid: 0.6 });
  const z = 1 + 0.02 * Math.sin(t * 0.4) + 0.03 * prog(t, T.batas, T.hasil + 1);
  K.cam(ctx, z, 540, 900);

  // bar outline
  ctx.save();
  ctx.strokeStyle = K.PAL.white; ctx.lineWidth = 4;
  ctx.strokeRect(BX, BY, BW, BH);
  // divider ticks appear as we cut
  for (let i = 0; i < SEGS.length; i++) {
    const p = prog(t, segTime(i), segTime(i) + 0.4);
    if (p <= 0) continue;
    const x = BX + SEGS[i][0] * BW;
    K.line(ctx, x, BY, x, BY + BH, p, { color: K.PAL.white, w: 3 });
  }
  // fills
  for (let i = 0; i < SEGS.length; i++) {
    const p = prog(t, segTime(i) + 0.15, segTime(i) + 0.6);
    if (p <= 0) continue;
    const x = BX + SEGS[i][0] * BW, w = SEGS[i][1] * BW;
    ctx.globalAlpha = (0.35 + 0.4 * p) * (i === SEGS.length - 1 ? 0.5 : 1);
    ctx.fillStyle = COLS[SEGS[i][3] % COLS.length];
    ctx.fillRect(x + 2, BY + 2, Math.max(0, w - 4), BH - 4);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // labels under segments
  const labels = [[0, '1/2'], [1, '1/4'], [2, '1/8']];
  for (const [i, s] of labels) {
    const p = prog(t, segTime(i) + 0.4, segTime(i) + 0.8, ease.linear);
    if (p <= 0) continue;
    const x = BX + (SEGS[i][0] + SEGS[i][1] / 2) * BW;
    K.math(ctx, s, x, BY + BH + 80, { size: i === 2 ? 56 : 72, p, colors: { 1: K.PAL.white, 2: K.PAL.white, 4: K.PAL.white, 8: K.PAL.white }, color: COLS[i] });
  }

  // Zeno marker: arrow creeps but never reaches the end
  if (t > T.zeno - 0.1 && t < T.batas + 0.3) {
    const zt = clamp((t - T.zeno) / Math.max(0.1, T.batas - T.zeno + 0.2));
    const zx = BX + BW * (1 - Math.pow(0.5, 1 + zt * 5));
    const a = env(t, T.zeno - 0.1, T.batas + 0.2, 0.2, 0.2);
    K.dot(ctx, zx, BY - 60, 10, K.PAL.red, a);
    K.label(ctx, 'ZENO: TAK SAMPAI-SAMPAI?', 540, BY - 130, { alpha: a, size: 30, color: K.PAL.red });
  }

  // running sum + final equation
  if (t > T.f1) {
    const fy = lerp(1230, 480, prog(t, T.hasil - 0.3, T.hasil + 0.8));
    const size = 96;
    const full = t > T.eq - 0.1;
    const str = full ? '1/2+1/4+…=1' : t > T.f3 ? '1/2+1/4+1/8+…' : t > T.f2 ? '1/2+1/4+…' : '1/2+…';
    const wp = prog(t, T.f1, T.f1 + 0.8, ease.linear);
    K.math(ctx, str, 540, fy, { size, p: wp, color: K.PAL.white, colors: { 1: K.PAL.yellow, 2: K.PAL.yellow, 4: K.PAL.yellow, 8: K.PAL.yellow } });
    if (full) K.surround(ctx, 540 - 330, fy - 80, 660, 110, prog(t, T.eq, T.eq + 0.6), { color: K.PAL.yellow });
    if (t > T.hasil) K.label(ctx, 'SATU BATANG PENUH', 540, fy + 110, { alpha: prog(t, T.hasil, T.hasil + 0.5), size: 34, color: K.PAL.yellow });
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
