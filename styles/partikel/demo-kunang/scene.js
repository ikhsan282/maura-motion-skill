import * as K from '/styles/partikel/kit.js';
export const meta = { fps: 24, hold: 1 };
let ctx; const C={}; let B={};
export async function setup(AM){ ctx=AM.layer('world'); for(const l of AM.timeline.lines) C[l.id]=l;
  const ids=['hook','sinyal','sinkron','gelap','akhir']; ids.forEach((id,i)=>{ const L=C[id]; B[id]=[L?L.start:i*3,L?L.end:(i+1)*3]; }); }
const SHOTS=[]; const shot=(id,fn)=>SHOTS.push({id,fn});
const blink=(t,a)=>0.35+0.65*Math.abs(Math.sin(t*2.2+a));
shot('hook',(t,a,b)=>{ K.bg(ctx,t); const p=K.boids(t,60,11,{cy:900,R:380}); K.flock(ctx,p,{col:'#ffd65e',size:5});
  for(let i=0;i<14;i++){ const x=180+((i*173)%720), y=500+((i*211)%700); K.glowDot(ctx,x,y,90+40*Math.sin(t*2+i),'#ffd65e',blink(t,i)); }
  K.title(ctx,'KUNANG-KUNANG',540,300,{a:K.pop(t,a+0.2)}); });
shot('sinyal',(t,a,b)=>{ K.bg(ctx,t); const p=K.boids(t,80,12,{cy:950,R:360}); K.flock(ctx,p,{col:'#6ee7ff',size:4});
  for(let i=0;i<10;i++){ const x=240+((i*197)%600), y=600+((i*167)%600); K.glowDot(ctx,x,y,110,'#6ee7ff',blink(t,i*1.7)); }
  K.caption(ctx,'Sinyal kimia: undangan berkumpul',540,400,{}); });
shot('sinkron',(t,a,b)=>{ K.bg(ctx,t); const p=K.boids(t,120,13,{cy:900,R:340}); K.flock(ctx,p,{col:'#ffd65e',size:5});
  const s=0.4+0.6*Math.abs(Math.sin(t*2.2)); // ponytail: sinkron seragam; upgrade: fase per-kelompok menyatu bertahap
  for(let i=0;i<16;i++){ const x=150+((i*139)%780), y=550+((i*181)%650); K.glowDot(ctx,x,y,100,'#ffd65e',s); }
  K.title(ctx,'SERENTAK',540,300,{a:K.pop(t,a+0.2)}); });
shot('gelap',(t,a,b)=>{ K.bg(ctx,t); const p=K.boids(t,50,14,{cy:950,R:400}); K.flock(ctx,p,{col:'#ff6f91',size:4});
  for(let i=0;i<12;i++){ const x=200+((i*163)%680), y=550+((i*193)%700); K.glowDot(ctx,x,y,130,'#ffd65e',0.5+0.5*Math.abs(Math.sin(t*1.6+i))); }
  K.caption(ctx,'Makin gelap, makin terang',540,400,{}); });
shot('akhir',(t,a,b)=>{ K.bg(ctx,t); const p=K.boids(t,150,15,{cy:850,R:420}); K.flock(ctx,p,{col:'#ffd65e',size:5});
  K.glowDot(ctx,540,960,160,'#ffd65e',0.6); K.title(ctx,'KALAHKAN GELAP',540,300,{a:K.pop(t,a+0.2),size:96}); });
export function render(t,AM){ let s=SHOTS[0]; for(const sh of SHOTS) if(t>=B[sh.id][0]) s=sh; ctx.save(); s.fn(t,Math.max(0,B[s.id][0]),B[s.id][1]); ctx.restore(); }
