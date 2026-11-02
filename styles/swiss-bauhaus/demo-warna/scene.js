// Bauhaus: 3 Warna Primer demo (5 shots).
import * as K from '/styles/swiss-bauhaus/kit.js';
const { clamp, prog } = AM.lib;
export const meta = { fps: 24, captions: { preset: 'clean', y: 1470, size: 60 } };
let ctx, fx; const C = {};
export async function setup(AM) {
  ctx = AM.layer('world'); fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
}
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i+1] ? C[L[i+1].id].start - 0.12 : AM.duration + 1]; };
const shapes = (t) => {
  ctx.save();
  ctx.fillStyle=K.PAL.red; ctx.beginPath(); ctx.arc(270,440,130,0,7); ctx.fill();
  ctx.fillStyle=K.PAL.yellow; ctx.fillRect(455,310,260,260);
  ctx.fillStyle=K.PAL.blue; ctx.beginPath(); ctx.moveTo(540,700); ctx.lineTo(270,940); ctx.lineTo(810,940); ctx.closePath(); ctx.fill();
  ctx.restore();
};
shot('hook', (t,a,b) => { K.bg(ctx,t,'#ffffff',K.PAL.paper); shapes(t); K.title(ctx,'MERAH KUNING BIRU',540,1200,{color:K.PAL.ink,p:prog(t,a,a+0.5)}); });
shot('primer', (t,a,b) => { K.bg(ctx,t,'#ffffff',K.PAL.paper); shapes(t); K.title(ctx,'PRIMER',540,1200,{color:K.PAL.ink,p:prog(t,a,a+0.5)}); });
shot('logo', (t,a,b) => { K.bg(ctx,t,'#ffffff',K.PAL.paper); shapes(t); K.title(ctx,'LOGO BESAR',540,1200,{color:K.PAL.ink,p:prog(t,a,a+0.5)}); });
shot('psiko', (t,a,b) => { K.bg(ctx,t,'#ffffff',K.PAL.paper); shapes(t); K.title(ctx,'PSIKOLOGI WARNA',540,1200,{color:K.PAL.ink,p:prog(t,a,a+0.5)}); });
shot('tutup', (t,a,b) => { K.bg(ctx,t,'#ffffff',K.PAL.paper); shapes(t); K.title(ctx,'BAUHAUS',540,1200,{color:K.PAL.ink,p:prog(t,a,a+0.5)}); });
export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
