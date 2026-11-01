// Zoom Out dari Monas ke Ujung Alam Semesta demo (5 shots).
import * as K from '/styles/skala-kosmik/kit.js';
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
  K.bg(ctx,t,K.PAL.space0,K.PAL.space1);
  const z=1+p*2; ctx.save(); ctx.translate(540,960); ctx.scale(z,z); ctx.translate(-540,-960);
  K.ring(ctx,540,960,120+p*300,K.PAL.cyan,6); K.blob(ctx,540,960,90,K.PAL.blue,t);
  ctx.restore();
  K.label(ctx, 'HOOK', 540, 1500, {p: prog(t,a,a+0.4)});
});
shot('bumi', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,K.PAL.space0,K.PAL.space1);
  const z=1+p*2; ctx.save(); ctx.translate(540,960); ctx.scale(z,z); ctx.translate(-540,-960);
  K.ring(ctx,540,960,120+p*300,K.PAL.cyan,6); K.blob(ctx,540,960,90,K.PAL.blue,t);
  ctx.restore();
  K.label(ctx, 'BUMI', 540, 1500, {p: prog(t,a,a+0.4)});
});
shot('surya', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,K.PAL.space0,K.PAL.space1);
  const z=1+p*2; ctx.save(); ctx.translate(540,960); ctx.scale(z,z); ctx.translate(-540,-960);
  K.ring(ctx,540,960,120+p*300,K.PAL.cyan,6); K.blob(ctx,540,960,90,K.PAL.blue,t);
  ctx.restore();
  K.label(ctx, 'SURYA', 540, 1500, {p: prog(t,a,a+0.4)});
});
shot('galaksi', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,K.PAL.space0,K.PAL.space1);
  const z=1+p*2; ctx.save(); ctx.translate(540,960); ctx.scale(z,z); ctx.translate(-540,-960);
  K.ring(ctx,540,960,120+p*300,K.PAL.cyan,6); K.blob(ctx,540,960,90,K.PAL.blue,t);
  ctx.restore();
  K.label(ctx, 'GALAKSI', 540, 1500, {p: prog(t,a,a+0.4)});
});
shot('jaring', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,K.PAL.space0,K.PAL.space1);
  const z=1+p*2; ctx.save(); ctx.translate(540,960); ctx.scale(z,z); ctx.translate(-540,-960);
  K.ring(ctx,540,960,120+p*300,K.PAL.cyan,6); K.blob(ctx,540,960,90,K.PAL.blue,t);
  ctx.restore();
  K.label(ctx, 'JARING', 540, 1500, {p: prog(t,a,a+0.4)});
});
export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
