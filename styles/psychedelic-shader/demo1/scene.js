// Satu Rumus, Gambar Tanpa Akhir demo (5 shots).
import * as K from '/styles/psychedelic-shader/kit.js';
const { clamp, lerp, ease, prog, hrand } = AM.lib;
export const meta = { fps: 24, captions: { preset: 'clean', y: 1470, size: 60 } };
let ctx, fx; const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  ctx = AM.layer('world'); fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
}
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i+1] ? C[L[i+1].id].start - 0.12 : AM.duration + 1]; };
shot('hook', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,K.PAL.bg0,K.PAL.bg1);
  for(let j=0;j<3;j++) K.blob(ctx, 540+Math.sin(t+j*2)*160, 700+j*220, 260-j*40, [K.PAL.neon1,K.PAL.neon2,K.PAL.neon3][j], t+j);
  K.title(ctx, 'HOOK', 540, 900, {p: prog(t,a,a+0.5)});
});
shot('rumus', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,K.PAL.bg0,K.PAL.bg1);
  for(let j=0;j<3;j++) K.blob(ctx, 540+Math.sin(t+j*2)*160, 700+j*220, 260-j*40, [K.PAL.neon1,K.PAL.neon2,K.PAL.neon3][j], t+j);
  K.title(ctx, 'RUMUS', 540, 900, {p: prog(t,a,a+0.5)});
});
shot('himpunan', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,K.PAL.bg0,K.PAL.bg1);
  for(let j=0;j<3;j++) K.blob(ctx, 540+Math.sin(t+j*2)*160, 700+j*220, 260-j*40, [K.PAL.neon1,K.PAL.neon2,K.PAL.neon3][j], t+j);
  K.title(ctx, 'HIMPUNAN', 540, 900, {p: prog(t,a,a+0.5)});
});
shot('zoom', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,K.PAL.bg0,K.PAL.bg1);
  for(let j=0;j<3;j++) K.blob(ctx, 540+Math.sin(t+j*2)*160, 700+j*220, 260-j*40, [K.PAL.neon1,K.PAL.neon2,K.PAL.neon3][j], t+j);
  K.title(ctx, 'ZOOM', 540, 900, {p: prog(t,a,a+0.5)});
});
shot('turn', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,K.PAL.bg0,K.PAL.bg1);
  for(let j=0;j<3;j++) K.blob(ctx, 540+Math.sin(t+j*2)*160, 700+j*220, 260-j*40, [K.PAL.neon1,K.PAL.neon2,K.PAL.neon3][j], t+j);
  K.title(ctx, 'TURN', 540, 900, {p: prog(t,a,a+0.5)});
});
export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
