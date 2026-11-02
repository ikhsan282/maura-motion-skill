import * as K from '/styles/partikel/kit.js';
export const meta = { fps: 24, hold: 1 };
let ctx; const C={}; let B={};
export async function setup(AM){ ctx=AM.layer('world'); for(const l of AM.timeline.lines) C[l.id]=l;
  const ids=['hook','siklus','jatuh','bau','akhir']; ids.forEach((id,i)=>{ const L=C[id]; B[id]=[L?L.start:i*3,L?L.end:(i+1)*3]; }); }
// hujan: boids dimiringkan jatuh ke bawah (y += t*speed), x bergoyang angin
const rain=(t,n,seed,spd=420)=>K.boids(t,n,seed).map((p,i)=>[(p[0]+Math.sin(t*2+i)*30+540)%1080,(p[1]+t*spd)%1920,p[2]]);
const SHOTS=[]; const shot=(id,fn)=>SHOTS.push({id,fn});
shot('hook',(t,a,b)=>{ K.bg(ctx,t); K.glowDot(ctx,540,960,140,'#6ee7ff',0.5); K.flock(ctx,rain(t,60,1,200),{col:'#6ee7ff'}); K.title(ctx,'HUJAN',540,300,{a:K.pop(t,a+0.2)}); });
shot('siklus',(t,a,b)=>{ K.bg(ctx,t); K.glowDot(ctx,540,400,120,'#ffd65e',0.5); K.flock(ctx,rain(t,150,2,-160),{col:'#ffd65e'}); K.caption(ctx,'Laut menjadi awan',540,400,{}); });
shot('jatuh',(t,a,b)=>{ K.bg(ctx,t); K.flock(ctx,rain(t,600,3,520),{col:'#6ee7ff'}); K.caption(ctx,'Ribuan tetes jatuh',540,400,{}); });
shot('bau',(t,a,b)=>{ K.bg(ctx,t); K.flock(ctx,rain(t,300,4,380),{col:'#ff6f91'}); K.glowDot(ctx,540,1200,160,'#ff6f91',0.4); K.title(ctx,'PETRICHOR',540,300,{a:K.pop(t,a+0.2)}); });
shot('akhir',(t,a,b)=>{ K.bg(ctx,t); K.flock(ctx,rain(t,800,5,450),{col:'#eef4ff'}); K.title(ctx,'SIKLUS HIDUP',540,300,{a:K.pop(t,a+0.2),size:96}); });
export function render(t,AM){ let s=SHOTS[0]; for(const sh of SHOTS) if(t>=B[sh.id][0]) s=sh; ctx.save(); s.fn(t,Math.max(0,B[s.id][0]),B[s.id][1]); ctx.restore(); }
