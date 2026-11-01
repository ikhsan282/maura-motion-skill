// Laksamana Cheng Ho Singgah di Nusantara demo (5 shots).
import * as K from '/styles/sumi-e/kit.js';
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
  K.bg(ctx,t,'#efe8d8',K.PAL.paper);
  K.blob(ctx,540,800,300,K.PAL.water,t,{seed:2});
  K.ring(ctx,540,800,200,'rgba(26,26,26,.5)',10);
  K.title(ctx, 'HOOK', 540, 1300, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('tujuh', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#efe8d8',K.PAL.paper);
  K.blob(ctx,540,800,300,K.PAL.water,t,{seed:2});
  K.ring(ctx,540,800,200,'rgba(26,26,26,.5)',10);
  K.title(ctx, 'TUJUH', 540, 1300, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('nusantara', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#efe8d8',K.PAL.paper);
  K.blob(ctx,540,800,300,K.PAL.water,t,{seed:2});
  K.ring(ctx,540,800,200,'rgba(26,26,26,.5)',10);
  K.title(ctx, 'NUSANTARA', 540, 1300, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('semarang', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#efe8d8',K.PAL.paper);
  K.blob(ctx,540,800,300,K.PAL.water,t,{seed:2});
  K.ring(ctx,540,800,200,'rgba(26,26,26,.5)',10);
  K.title(ctx, 'SEMARANG', 540, 1300, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('ragu', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#efe8d8',K.PAL.paper);
  K.blob(ctx,540,800,300,K.PAL.water,t,{seed:2});
  K.ring(ctx,540,800,200,'rgba(26,26,26,.5)',10);
  K.title(ctx, 'RAGU', 540, 1300, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
