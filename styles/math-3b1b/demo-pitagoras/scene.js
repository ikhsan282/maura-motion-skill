// Phi: K/d selalu 3,14 — tali melingkari lingkaran, dibuka jadi garis lurus.
// Lingkaran + diameter, tali keliling diurai jadi garis 3,14x diameter, rumus K/d=3,14.
import * as K from '/styles/math-3b1b/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1470, size: 56, box: { fill: 'rgba(14,17,22,.82)', pad: 18, radius: 14 } } };

let ctx;
const C = {};
const W = (id, w, n = 0) => AM.wordTime(id, w, n);
const CX = 540, CY = 640, R = 240;
const LX = 110, LW = 860, LY = 1150; // unwrapped rope line
let T = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  T = {
    circ: W('hook', 'Lingkari'),
    rope: W('hook', 'tali'),
    flat: W('hook', 'bentangkan'),
    k1: W('keliling', 'keliling'),
    k2: W('keliling', 'K'),
    d1: W('diameter', 'diameter'),
    bagi: W('bagi', 'Bagi'),
    pi: W('bagi', 'tiga'),
    hasil: C.hasil.start,
    end: AM.duration,
  };
  AM.sfx('whoosh', T.circ, { gain: 0.3 });
  AM.sfx('whoosh', T.flat, { gain: 0.3 });
  AM.sfx('pop', T.k1, { gain: 0.4 });
  AM.sfx('pop', T.d1, { gain: 0.4, pitch: 1.1 });
  AM.sfx('chime', T.pi, { gain: 0.45 });
}

function circlePart(p, color, w) {
  if (p <= 0) return;
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath();
  if (p >= 1) ctx.arc(CX, CY, R, 0, Math.PI * 2);
  else ctx.arc(CX, CY, R, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
  ctx.stroke(); ctx.restore();
}

export function render(t) {
  K.ground(ctx, { grid: 0.6 });
  const z = 1 + 0.03 * prog(t, T.bagi, T.hasil + 1);
  K.cam(ctx, z, 540, 900);

  // circle draws on
  circlePart(prog(t, T.circ, T.circ + 0.8), K.PAL.blue, 5);

  // rope dot travels around circumference
  if (t > T.rope - 0.1 && t < T.flat + 0.3) {
    const rp = clamp((t - T.rope) / Math.max(0.1, T.flat - T.rope + 0.2));
    const a = -Math.PI / 2 + rp * Math.PI * 2;
    K.dot(ctx, CX + Math.cos(a) * R, CY + Math.sin(a) * R, 12, K.PAL.yellow, env(t, T.rope - 0.1, T.flat + 0.2, 0.2, 0.2));
    if (rp > 0.05) K.label(ctx, 'TALI = KELILING', CX, CY - R - 70, { alpha: prog(t, T.rope, T.rope + 0.4), size: 30, color: K.PAL.yellow });
  }

  // unwrapped rope: straight line grows below
  const fp = prog(t, T.flat, T.flat + 1.0);
  if (fp > 0) {
    K.line(ctx, LX, LY, LX + LW * fp, LY, fp, { color: K.PAL.yellow, w: 8 });
    K.dot(ctx, LX, LY, 10, K.PAL.yellow, fp);
    K.dot(ctx, LX + LW * fp, LY, 10, K.PAL.yellow, fp);
    const bl = K.brace(ctx, LX, LY + 30, LX + LW * fp, LY + 30, fp, { color: K.PAL.yellow, depth: 26 });
    if (fp > 0.7) K.math(ctx, 'K', bl[0], bl[1] + 80, { size: 72, color: K.PAL.yellow, p: prog(t, T.k1, T.k1 + 0.5) });
  }

  // diameter line across circle
  const dp = prog(t, T.d1, T.d1 + 0.6);
  if (dp > 0) {
    K.line(ctx, CX - R, CY, CX + R, CY, dp, { color: K.PAL.red, w: 6 });
    K.dot(ctx, CX - R, CY, 9, K.PAL.red, dp);
    K.dot(ctx, CX + R, CY, 9, K.PAL.red, dp);
    K.math(ctx, 'd', CX, CY - 60, { size: 72, color: K.PAL.red, p: dp });
    // tick marks: diameter fits ~3.14x into K line
    for (let i = 0; i < 3; i++) {
      const xp = LX + i * (LW / Math.PI);
      K.line(ctx, xp, LY - 40, xp, LY + 40, prog(t, T.d1 + 0.4 + i * 0.2, T.d1 + 0.8 + i * 0.2), { color: K.PAL.red, w: 3 });
    }
    K.label(ctx, 'DIAMETER', CX, CY + R + 70, { alpha: dp, size: 30, color: K.PAL.red });
  }

  // equation K/d = 3,14
  const ep = prog(t, T.bagi, T.bagi + 1.0, ease.linear);
  if (ep > 0) {
    const fy = lerp(1150, 420, prog(t, T.hasil - 0.3, T.hasil + 0.8));
    const full = t > T.pi - 0.1;
    const str = full ? 'K/d=3,14' : 'K/d=?';
    K.math(ctx, str, 540, fy, { size: 110, p: ep, color: K.PAL.white, colors: { K: K.PAL.yellow, d: K.PAL.red, '3': K.PAL.teal, '1': K.PAL.teal, '4': K.PAL.teal } });
    if (full) {
      const lay = K.layoutMath(ctx, str, 110);
      K.surround(ctx, 540 - lay.width / 2, fy - 86, lay.width, 108, prog(t, T.pi, T.pi + 0.6), { color: K.PAL.yellow });
    }
  }

  // final: three circles, all phi
  if (t > T.hasil) {
    const p = prog(t, T.hasil, T.hasil + 0.6);
    const ys = 1330;
    for (let i = 0; i < 3; i++) {
      const r = [46, 70, 98][i], x = [340, 540, 770][i];
      ctx.save(); ctx.globalAlpha = p;
      ctx.strokeStyle = [K.PAL.blue, K.PAL.teal, K.PAL.purple][i]; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(x, ys, r * p, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    K.label(ctx, 'GELAS • RODA • PLANET — SEMUA π', 540, ys + 170, { alpha: p, size: 30, color: K.PAL.yellow });
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
