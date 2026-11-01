// Math Explainer Gelap demo (20 s): "Kenapa luas lingkaran itu pi r kuadrat".
// A circle cut into 32 sectors interleaves into a near-rectangle; we redo it with 8, 16, 32, 64 slices,
// measure height r and width pi r, write L = pi r x r, morph it into pi r^2, and fold the shape back into the circle.
import * as K from '/styles/math-3b1b/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1470, size: 56, box: { fill: 'rgba(14,17,22,.82)', pad: 18, radius: 14 } } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const G = { cx: 540, cy: 860, R: 238 };
let T = {};
export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  T = {
    split: 0.35, comb: 1.25, merge: 2.55, done: W('hook', 'persegi') + 0.1,
    back0: C.susun.start - 0.12, back1: C.susun.start + 0.35, go8: W('susun', 'selang') + 0.05,
    n16: W('susun', 'Makin') - 0.05, n32: W('susun', 'potongan') - 0.05, n64: W('susun', 'makin', 1),
    fold: W('hasil', 'lingkaran') - 0.1,
  };
  // second "makin" (index of the word in the line)
  const sl = C.susun.words; const idx = sl.map((w) => w.w.toLowerCase()).lastIndexOf('makin'); T.n64 = sl[idx].start - 0.05;
  T.go8end = Math.min(T.n16 - 0.1, T.go8 + 1.0);
  AM.sfx('whoosh', T.split, { gain: 0.3 });
  AM.sfx('click', T.done, { gain: 0.45 });
  AM.sfx('swoosh_up', T.back0, { gain: 0.25 });
  AM.sfx('pop', T.n16, { gain: 0.4, pitch: 0.9 });
  AM.sfx('pop', T.n32, { gain: 0.4, pitch: 1.1 });
  AM.sfx('pop', T.n64, { gain: 0.4, pitch: 1.3 });
  AM.sfx('chime', W('hasil', 'kuadrat'), { gain: 0.45 });
  AM.sfx('whoosh', T.fold, { gain: 0.25, pitch: 0.8 });
}

/** The shape at time t: { poses, N } -- one continuous story from circle to rectangle and back. */
function shape(t) {
  const st = (a, b, c, d) => lerp(a, b, K.smooth(clamp((t - c) / (d - c))));
  if (t < T.back0) {
    let s = 0;
    if (t >= T.split) s = t < T.comb ? st(0, 1, T.split, T.comb) : t < T.merge ? st(1, 2, T.comb, T.merge) : st(2, 3, T.merge, T.done);
    return { N: 32, poses: K.posesAt(32, s, G) };
  }
  if (t < T.back1) return { N: 32, poses: K.posesAt(32, st(3, 0, T.back0, T.back1), G) };
  if (t < T.n16) { const s = t < T.go8 ? 0 : st(0, 3, T.go8, T.go8end); return { N: 8, poses: K.posesAt(8, s, G) }; }
  if (t < T.n32) return { N: 16, poses: K.posesSplit(16, clamp((t - T.n16) / 0.55), G) };
  if (t < T.n64) return { N: 32, poses: K.posesSplit(32, clamp((t - T.n32) / 0.55), G) };
  if (t < T.fold) return { N: 64, poses: K.posesSplit(64, clamp((t - T.n64) / 0.55), G) };
  return { N: 64, poses: K.posesAt(64, st(3, 0, T.fold, T.fold + 1.1), G) };
}

const COL = { r: K.PAL.yellow, 'π': K.PAL.blue, L: K.PAL.white, '²': K.PAL.yellow };

export function render(t) {
  K.ground(ctx, { grid: 0.6 });
  // camera: gentle drift, a push on the measuring beat, a pull back for the result
  const zU = env(t, C.ukur.start - 0.2, C.luas.start, 0.6, 0.6);
  const z = 1 + 0.02 * Math.sin(t * 0.4) + 0.03 * zU - 0.04 * prog(t, C.hasil.start, AM.duration);
  const camY = 900 - 70 * zU + 40 * prog(t, C.luas.start - 0.3, C.luas.start + 0.6) * (1 - prog(t, T.fold, T.fold + 1));
  K.cam(ctx, z, 540 + 10 * Math.sin(t * 0.3), camY);

  const S = shape(t);
  const box = K.rectBox(64, G);
  const arcTop = env(t, W('ukur', 'Lebarnya'), C.luas.start + 0.3, 0.3, 0.4);
  const fillA = 0.42 + 0.25 * env(t, C.luas.start, T.fold, 0.4, 0.5);
  const cut = clamp(t / 0.5);
  K.drawSectors(ctx, S.poses, { R: G.R, arcTop, fillA, edges: t < 0.5 ? cut : 1 });
  // the cut lines being drawn at the very start (frame 1 already moving)
  if (t < 0.55) {
    ctx.save(); ctx.strokeStyle = K.PAL.white; ctx.lineWidth = 3; ctx.globalAlpha = 1 - clamp((t - 0.35) / 0.2);
    ctx.beginPath(); for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16 - Math.PI; ctx.moveTo(G.cx, G.cy); ctx.lineTo(G.cx + Math.cos(a) * G.R * cut, G.cy + Math.sin(a) * G.R * cut); } ctx.stroke(); ctx.restore();
  }

  // ---- hook overlays
  if (t < T.back0 + 0.3) {
    const a = env(t, W('hook', '32') - 0.15, T.back0 + 0.2, 0.25, 0.3);
    K.math(ctx, '32', 540, 360, { size: 130, p: prog(t, W('hook', '32') - 0.15, W('hook', '32') + 0.5, ease.linear), color: K.PAL.yellow, alpha: a });
    K.label(ctx, 'JURING', 540, 430, { alpha: a, size: 32 });
    const bx = K.rectBox(32, G);
    const dp = prog(t, W('hook', 'persegi') - 0.05, W('hook', 'panjang') + 0.2);
    K.dashedRect(ctx, bx.x, bx.y, bx.w, bx.h, dp * (1 - prog(t, T.back0 - 0.1, T.back0 + 0.15)));
    K.label(ctx, '≈ PERSEGI PANJANG', 540, bx.y + bx.h + 150, { alpha: env(t, W('hook', 'panjang') - 0.1, T.back0 + 0.1, 0.25, 0.25), color: K.PAL.yellow, size: 36 });
  }
  // ---- susun: the slice count, doubling
  if (t > T.back1 - 0.2 && t < C.ukur.start + 0.2) {
    const a = env(t, T.back1 - 0.2, C.ukur.start + 0.1, 0.25, 0.3);
    const n = t < T.n16 ? '8' : t < T.n32 ? '16' : t < T.n64 ? '32' : '64';
    const since = t - (t < T.n16 ? T.back1 : t < T.n32 ? T.n16 : t < T.n64 ? T.n32 : T.n64);
    const pp = 1 + 0.18 * Math.exp(-since * 8) * Math.sin(since * 22);
    ctx.save(); ctx.translate(540, 330); ctx.scale(pp, pp); K.math(ctx, 'N = ' + n, 0, 0, { size: 110, p: prog(t, T.back1 - 0.2, T.back1 + 0.5, ease.linear), colors: { N: K.PAL.white }, color: K.PAL.yellow, alpha: a }); ctx.restore();
    K.label(ctx, 'POTONGAN', 540, 400, { alpha: a, size: 30 });
    const dp = prog(t, W('susun', 'lurus') - 0.1, W('susun', 'lurus') + 0.5);
    K.dashedRect(ctx, box.x, box.y, box.w, box.h, dp * (1 - prog(t, C.ukur.start, C.ukur.start + 0.3)));
  }
  // ---- ukur: height r (left brace), width pi r (top brace over the blue arcs)
  const ua = 1 - prog(t, T.fold - 0.2, T.fold + 0.2);
  if (t > C.ukur.start - 0.2 && ua > 0) {
    ctx.save(); ctx.globalAlpha = ua;
    const hp = prog(t, W('ukur', 'jari') - 0.2, W('ukur', 'jari') + 0.4);
    const L1 = K.brace(ctx, box.x - 18, box.y + box.h, box.x - 18, box.y, hp, { color: K.PAL.yellow, depth: 30 });
    if (hp > 0) {
      K.math(ctx, 'r', L1[0] - 34, L1[1] + 26, { size: 96, p: prog(t, W('ukur', 'r') - 0.25, W('ukur', 'r') + 0.3, ease.linear), colors: COL });
      // one radius lights up inside the first slice
      const q = S.poses[0]; K.line(ctx, q.x, q.y, q.x, q.y - G.R, prog(t, W('ukur', 'jari'), W('ukur', 'jari') + 0.4), { color: K.PAL.yellow, w: 5 });
    }
    const wp = prog(t, W('ukur', 'Lebarnya') - 0.1, W('ukur', 'Lebarnya') + 0.5);
    const L2 = K.brace(ctx, box.x, box.y - 22, box.x + box.w, box.y - 22, wp, { color: K.PAL.blue, depth: 34 });
    if (wp > 0) {
      const ha = env(t, W('ukur', 'setengah') - 0.1, W('ukur', 'pi') - 0.05, 0.2, 0.15);
      K.math(ctx, '½ × 2πr', L2[0], L2[1] - 46, { size: 84, p: prog(t, W('ukur', 'setengah') - 0.15, W('ukur', 'keliling'), ease.linear), colors: COL, alpha: ha });
      K.math(ctx, 'πr', L2[0], L2[1] - 46, { size: 100, p: prog(t, W('ukur', 'pi') - 0.1, W('ukur', 'pi') + 0.4, ease.linear), colors: COL });
    }
    ctx.restore();
  }
  // ---- luas + hasil: L = πr × r  ->  L = πr²  (the second r becomes the exponent)
  if (t > C.luas.start - 0.2) {
    const FY = lerp(1230, 420, prog(t, T.fold, T.fold + 1.0)), size = lerp(120, 130, prog(t, T.fold, T.fold + 1));
    const w0 = prog(t, C.luas.start, W('luas', 4) + 0.25, ease.linear);
    const mt = prog(t, W('hasil', 'Pi') - 0.15, W('hasil', 'kuadrat') - 0.05);
    const lay = K.layoutMath(ctx, 'L = πr × r', size), fin = K.layoutMath(ctx, 'L = πr²', size);
    const xA = 540 - lerp(lay.width, fin.width, mt) / 2;
    // fixed part
    K.math(ctx, 'L = πr', xA, FY, { size, p: Math.min(1, w0 * 1.6), colors: COL, align: 'left' });
    const ia = lay.items, last = ia[ia.length - 1], times = ia[ia.length - 3], fsup = fin.items[fin.items.length - 1];
    // '×' fades out
    ctx.save(); ctx.globalAlpha = 1 - mt; K.math(ctx, '×', xA + times.x - size * 0.14, FY, { size, p: clamp(w0 * 1.6 - 0.6), align: 'left' }); ctx.restore();
    // r slides up into the exponent and becomes the 2
    const sx = lerp(xA + last.x, xA + fsup.x, mt), sy = lerp(FY, FY - size * 0.42, mt), sz = lerp(size, size * 0.62, mt);
    ctx.save(); ctx.globalAlpha = 1 - clamp(mt * 1.6 - 0.4); K.math(ctx, 'r', sx, sy, { size: sz, p: clamp(w0 * 1.6 - 0.75), colors: COL, align: 'left' }); ctx.restore();
    if (mt > 0.3) { ctx.save(); ctx.globalAlpha = clamp(mt * 1.6 - 0.6); ctx.font = `400 ${size * 0.62}px 'Noto Serif'`; ctx.fillStyle = K.PAL.yellow; ctx.textBaseline = 'alphabetic'; ctx.fillText('2', sx, FY - size * 0.42); ctx.restore(); }
    // highlight box
    const bp = prog(t, W('hasil', 'kuadrat'), W('hasil', 'kuadrat') + 0.6);
    K.surround(ctx, 540 - fin.width / 2, FY - size * 0.78, fin.width, size * 0.98, bp, { color: K.PAL.yellow, pad: 26 });
  }
  // ---- the ending: back in the circle, a radius labelled r
  if (t > T.fold + 0.8) {
    const p = prog(t, T.fold + 0.8, T.fold + 1.4);
    K.line(ctx, G.cx, G.cy, G.cx + G.R, G.cy, p, { color: K.PAL.yellow, w: 5 });
    K.dot(ctx, G.cx, G.cy, 8, K.PAL.yellow, p);
    K.math(ctx, 'r', G.cx + G.R / 2 - 14, G.cy - 22, { size: 80, p: prog(t, T.fold + 1.1, T.fold + 1.6, ease.linear), colors: COL });
  }
  // area tint during the result (the rectangle "is" the area)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
