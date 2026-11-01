// Bauhaus: Sekolah 14 Tahun demo (5 shots).
import * as K from '/styles/swiss-bauhaus/kit.js';
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
  K.bg(ctx,t,'#ffffff',K.PAL.paper);
  ctx.save(); ctx.fillStyle=K.PAL.red; ctx.fillRect(80,300,280,280); ctx.fillStyle=K.PAL.blue; ctx.beginPath(); ctx.arc(720,440,140,0,7); ctx.fill(); ctx.fillStyle=K.PAL.yellow; ctx.fillRect(80,640,560,120); ctx.restore();
  K.title(ctx, 'HOOK', 540, 1200, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('bauhaus', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#ffffff',K.PAL.paper);
  ctx.save(); ctx.fillStyle=K.PAL.red; ctx.fillRect(80,300,280,280); ctx.fillStyle=K.PAL.blue; ctx.beginPath(); ctx.arc(720,440,140,0,7); ctx.fill(); ctx.fillStyle=K.PAL.yellow; ctx.fillRect(80,640,560,120); ctx.restore();
  K.title(ctx, 'BAUHAUS', 540, 1200, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('aturan', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#ffffff',K.PAL.paper);
  ctx.save(); ctx.fillStyle=K.PAL.red; ctx.fillRect(80,300,280,280); ctx.fillStyle=K.PAL.blue; ctx.beginPath(); ctx.arc(720,440,140,0,7); ctx.fill(); ctx.fillStyle=K.PAL.yellow; ctx.fillRect(80,640,560,120); ctx.restore();
  K.title(ctx, 'ATURAN', 540, 1200, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('karya', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#ffffff',K.PAL.paper);
  ctx.save(); ctx.fillStyle=K.PAL.red; ctx.fillRect(80,300,280,280); ctx.fillStyle=K.PAL.blue; ctx.beginPath(); ctx.arc(720,440,140,0,7); ctx.fill(); ctx.fillStyle=K.PAL.yellow; ctx.fillRect(80,640,560,120); ctx.restore();
  K.title(ctx, 'KARYA', 540, 1200, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
shot('tutup', (t, a, b) => {
  const p = clamp((t - a) / Math.max(0.001, b - a));
  K.bg(ctx,t,'#ffffff',K.PAL.paper);
  ctx.save(); ctx.fillStyle=K.PAL.red; ctx.fillRect(80,300,280,280); ctx.fillStyle=K.PAL.blue; ctx.beginPath(); ctx.arc(720,440,140,0,7); ctx.fill(); ctx.fillStyle=K.PAL.yellow; ctx.fillRect(80,640,560,120); ctx.restore();
  K.title(ctx, 'TUTUP', 540, 1200, {color: K.PAL.ink, p: prog(t,a,a+0.5)});
});
export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
