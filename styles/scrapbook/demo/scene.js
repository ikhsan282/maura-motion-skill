// Jurnal Wallace: Garis Tak Terlihat di Nusantara demo (5 shots).
import * as K from '/styles/scrapbook/kit.js';
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
  K.bg(ctx,t,'#e8dcc0',K.PAL.paper);
  K.card(ctx,540,800,860,640,'#fffdf4');
  K.title(ctx, 'HOOK', 540, 800, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('jelajah', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#e8dcc0',K.PAL.paper);
  K.card(ctx,540,800,860,640,'#fffdf4');
  K.title(ctx, 'JELAJAH', 540, 800, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('seberang', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#e8dcc0',K.PAL.paper);
  K.card(ctx,540,800,860,640,'#fffdf4');
  K.title(ctx, 'SEBERANG', 540, 800, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('hewan', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#e8dcc0',K.PAL.paper);
  K.card(ctx,540,800,860,640,'#fffdf4');
  K.title(ctx, 'HEWAN', 540, 800, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('es', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#e8dcc0',K.PAL.paper);
  K.card(ctx,540,800,860,640,'#fffdf4');
  K.title(ctx, 'ES', 540, 800, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
