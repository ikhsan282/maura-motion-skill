import * as K from '/styles/partikel/kit.js';
export const meta = { fps: 24, hold: 1 };
let ctx; const C={}; let B={};
export async function setup(AM){ ctx=AM.layer('world'); for(const l of AM.timeline.lines) C[l.id]=l;
  const ids=['hook','jalak','tujuh','aturan','akhir']; ids.forEach((id,i)=>{ const L=C[id]; B[id]=[L?L.start:i*3,L?L.end:(i+1)*3]; }); }
const SHOTS=[]; const shot=(id,fn)=>SHOTS.push({id,fn});
shot('hook',(t,a,b)=>{ K.bg(ctx,t); K.flock(ctx,K.boids(t,300,1),{}); K.title(ctx,'MURMURASI',540,300,{a:K.pop(t,a+0.2)}); });
shot('jalak',(t,a,b)=>{ K.bg(ctx,t); K.flock(ctx,K.boids(t,500,2),{col:'#6ee7ff'}); K.caption(ctx,'Burung jalak',540,400,{}); });
shot('tujuh',(t,a,b)=>{ K.bg(ctx,t); const p=K.boids(t,200,3); K.flock(ctx,p,{}); K.glowDot(ctx,540,960,120,'#ffd65e',0.5); K.title(ctx,'7 TETANGGA',540,300,{a:K.pop(t,a+0.2)}); });
shot('aturan',(t,a,b)=>{ K.bg(ctx,t); K.flock(ctx,K.boids(t+t*2,600,4),{col:'#ff6f91'}); K.caption(ctx,'Jaga jarak. Ikuti arah.',540,400,{}); });
shot('akhir',(t,a,b)=>{ K.bg(ctx,t); K.flock(ctx,K.boids(t,800,5,{R:420}),{col:'#ffd65e'}); K.title(ctx,'INDAH',540,300,{a:K.pop(t,a+0.2),size:120}); });
export function render(t,AM){ let s=SHOTS[0]; for(const sh of SHOTS) if(t>=B[sh.id][0]) s=sh; ctx.save(); s.fn(t,Math.max(0,B[s.id][0]),B[s.id][1]); ctx.restore(); }
