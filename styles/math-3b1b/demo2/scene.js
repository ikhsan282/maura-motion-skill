// Math Explainer Gelap demo2 (~63s): "Rahasia Angka Pi (3,14) — Mengapa Keliling Dibagi Diameter Selalu Sama?"
// Lingkaran + diameter, tali keliling diurai jadi garis 3,14x diameter, rumus K/d=3,14.
import * as K from '/styles/math-3b1b/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1470, size: 54, box: { fill: 'rgba(14,17,22,.84)', pad: 18, radius: 14 } } };

let ctx;
const C = {};
const W = (id, w, n = 0) => AM.wordTime(id, w, n);
const CX = 540, CY = 620, R = 235;
const LX = 110, LW = 860, LY = 1130; // unwrapped rope line
let T = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  T = {
    circ: 0.4,
    rope: W('hook', 'Lingkari'),
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

  K.label(ctx, 'KONSTANTA LINGKARAN · π = 3,14159…', 540, 145, { alpha: 0.78, size: 24, color: K.PAL.teal });

  // circle draws on immediately in the opening
  circlePart(prog(t, T.circ, T.circ + 1.2), K.PAL.blue, 6);
  K.dot(ctx, CX, CY, 6, K.PAL.blue, prog(t, T.circ + 0.3, T.circ + 0.9));

  // rope dot travels around circumference
  if (t > T.rope - 0.2 && t < T.flat + 0.6) {
    const rp = clamp((t - T.rope) / Math.max(0.1, T.flat - T.rope + 0.2));
    circlePart(rp, K.PAL.yellow, 8);
    const a = -Math.PI / 2 + rp * Math.PI * 2;
    K.dot(ctx, CX + Math.cos(a) * R, CY + Math.sin(a) * R, 12, K.PAL.yellow, env(t, T.rope - 0.1, T.flat + 0.4, 0.2, 0.2));
    if (rp > 0.05) K.label(ctx, 'SEUTAS TALI = KELILING', CX, CY - R - 64, { alpha: prog(t, T.rope, T.rope + 0.4), size: 30, color: K.PAL.yellow });
  }

  // unwrapped rope: straight line grows below
  const fp = prog(t, T.flat, T.flat + 1.2);
  if (fp > 0) {
    K.line(ctx, LX, LY, LX + LW * fp, LY, fp, { color: K.PAL.yellow, w: 8 });
    K.dot(ctx, LX, LY, 10, K.PAL.yellow, fp);
    K.dot(ctx, LX + LW * fp, LY, 10, K.PAL.yellow, fp);
    const bl = K.brace(ctx, LX, LY + 30, LX + LW * fp, LY + 30, fp, { color: K.PAL.yellow, depth: 26 });
    if (fp > 0.7) K.math(ctx, 'K', bl[0], bl[1] + 82, { size: 76, color: K.PAL.yellow, p: prog(t, T.k1, T.k1 + 0.6) });
  }

  // diameter line across circle
  const dp = prog(t, C.diameter.start + 0.4, T.d1 + 0.5);
  if (dp > 0) {
    K.line(ctx, CX - R, CY, CX + R, CY, dp, { color: K.PAL.red, w: 6 });
    K.dot(ctx, CX - R, CY, 9, K.PAL.red, dp);
    K.dot(ctx, CX + R, CY, 9, K.PAL.red, dp);
    K.math(ctx, 'd', CX, CY - 52, { size: 76, color: K.PAL.red, p: dp });
    K.label(ctx, 'DIAMETER (GARIS TENGAH)', CX, CY + R + 64, { alpha: dp, size: 28, color: K.PAL.red });

    // tick marks: diameter fits 3.14x into K line during C.bagi
    const dLen = LW / Math.PI;
    for (let i = 0; i < 3; i++) {
      const tp = prog(t, C.bagi.start + 0.3 + i * 0.5, C.bagi.start + 0.8 + i * 0.5);
      if (tp <= 0) continue;
      const x0 = LX + i * dLen, x1 = x0 + dLen;
      K.line(ctx, x0, LY - 32, x0, LY + 32, tp, { color: K.PAL.red, w: 4 });
      K.line(ctx, x1, LY - 32, x1, LY + 32, tp, { color: K.PAL.red, w: 4 });
      K.line(ctx, x0 + 6, LY - 22, x1 - 6, LY - 22, tp, { color: K.PAL.red, w: 5 });
      K.label(ctx, `${i + 1}d`, (x0 + x1) / 2, LY - 50, { alpha: tp, size: 26, color: K.PAL.red });
    }
    const remP = prog(t, C.bagi.start + 2.0, C.bagi.start + 2.6);
    if (remP > 0) {
      const x3 = LX + 3 * dLen;
      K.line(ctx, x3 + 2, LY - 22, LX + LW, LY - 22, remP, { color: K.PAL.teal, w: 6 });
      K.label(ctx, '+0,14d', (x3 + LX + LW) / 2 + 18, LY - 52, { alpha: remP, size: 24, color: K.PAL.teal });
    }
  }

  // equation K/d = 3,14
  const ep = prog(t, T.bagi - 0.2, T.bagi + 0.9, ease.linear);
  if (ep > 0) {
    const fy = lerp(990, 290, prog(t, T.hasil - 0.3, T.hasil + 0.8));
    const full = t > T.pi - 0.1;
    const str = full ? 'K/d=3,14' : 'K/d=?';
    K.math(ctx, str, 540, fy, { size: 108, p: ep, color: K.PAL.white, colors: { K: K.PAL.yellow, d: K.PAL.red, '3': K.PAL.teal, '1': K.PAL.teal, '4': K.PAL.teal } });
    if (full) {
      const lay = K.layoutMath(ctx, str, 108);
      K.surround(ctx, 540 - lay.width / 2, fy - 86, lay.width, 108, prog(t, T.pi, T.pi + 0.6), { color: K.PAL.yellow });
    }
  }

  // final: three circles, all phi
  if (t > T.hasil) {
    const p = prog(t, T.hasil, T.hasil + 0.8);
    const ys = 1320;
    const names = ['GELAS', 'RODA', 'PLANET'];
    for (let i = 0; i < 3; i++) {
      const r = [44, 68, 96][i], x = [290, 520, 780][i];
      const col = [K.PAL.blue, K.PAL.teal, K.PAL.purple][i];
      ctx.save(); ctx.globalAlpha = p;
      ctx.strokeStyle = col; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(x, ys, r * p, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = K.PAL.red; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x - r * p, ys); ctx.lineTo(x + r * p, ys); ctx.stroke();
      ctx.restore();
      K.label(ctx, names[i], x, ys + r + 36, { alpha: p, size: 22, color: col });
    }
    K.label(ctx, 'RASIO K ÷ d SELALU KONSTAN = π', 540, ys + 165, { alpha: p, size: 28, color: K.PAL.yellow });
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
