// Maura Motion hello: 3 beats, one simple scene per narration line.
import * as K from '/styles/flat-vector/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'bold', y: 1470, size: 64, active: '#ffd65e', stroke: 9, strokeColor: '#0b1230', anim: 'rise', maxWords: 4 } };
let ctx, fx;
const C = {};
const W = (id, word) => AM.wordTime(id, word);
let B = {};

export async function setup(AM) {
  ctx = AM.layer('world'); fx = AM.layer('fx');
  for (const line of AM.timeline.lines) C[line.id] = line;
  const start = id => C[id].start - 0.12;
  B = { hook: [0, start('tengah')], tengah: [start('tengah'), start('akhir')], akhir: [start('akhir'), AM.duration + 1] };
  AM.sfx('pop', 0.5, { gain: 0.4 });
  AM.sfx('chime', W('akhir', 'hari'), { gain: 0.35 });
}
const reset = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });

function background(t) {
  K.space(ctx, t, { px: t * 8, py: t * 3 });
  K.glow(ctx, 820, 410, 360, '#8f7bff', 0.25);
  K.ball(ctx, 820, 410, 110, '#fff7d1', '#ffa63f');
}

shot('hook', (t, a, b) => {
  background(t);
  const p = prog(t, a, a + 0.8, ease.outBack);
  const x = lerp(180, 540, p), y = 980 + Math.sin(t * 4) * 16;
  K.photon(ctx, x, y, { r: 92, t, vx: 900, vy: 0, heat: 1, mood: 'joy', look: [0.5, 0] });
  reset();
  K.headline(ctx, 'SATU GAYA', 540, 420, { size: 110, p: K.pop(t, a + 0.25, 0.5), accent: '#ffd65e' });
  K.badge(ctx, 'satu naskah, jadi video', 540, 570, { p: K.pop(t, a + 0.55, 0.45), size: 42 });
});

shot('tengah', (t, a, b) => {
  background(t);
  const p = K.pop(t, a + 0.1, 0.5);
  ctx.save(); ctx.translate(540, 900); ctx.scale(p, p);
  K.photon(ctx, 0, 0, { r: 125, t, vx: 0, vy: 0, heat: 0.7, mood: 'wow', look: [0, -0.2] });
  ctx.restore();
  reset();
  K.badge(ctx, 'TULIS CERITAMU', 540, 420, { p, size: 58, bg: 'rgba(63,214,198,.9)', fg: '#06231f' });
  K.badge(ctx, 'mesin yang menggambar', 540, 570, { p: K.pop(t, a + 0.45, 0.5), size: 42 });
});

shot('akhir', (t, a, b) => {
  background(t);
  const p = K.pop(t, a + 0.1, 0.55);
  K.photon(ctx, 540, 960, { r: 120, t, vx: Math.sin(t) * 20, vy: 0, heat: 1, mood: 'joy', look: [0, 0] });
  reset();
  K.headline(ctx, 'MAURA MOTION', 540, 360, { size: 92, p, accent: '#3fd6c6' });
  K.headline(ctx, 'IDEMU, TAYANG HARI INI', 540, 500, { size: 50, p: K.pop(t, W('akhir', 'hari'), 0.5) });
});

export function render(t, AM) {
  let current = SHOTS[0];
  for (const s of SHOTS) if (t >= B[s.id][0]) current = s;
  const [a, b] = B[current.id];
  ctx.save(); current.fn(t, Math.max(0, a), b); ctx.restore();
  reset(); ctx.globalAlpha = 1;
  AM.lib.vignette(fx, { strength: 0.3, inner: 0.5, color: '4,6,26' });
}
