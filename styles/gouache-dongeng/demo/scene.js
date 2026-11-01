import * as K from '/styles/gouache-dongeng/kit.js';
export const meta = { fps: 24, hold: 1 };
let ctx; const C={}; let B={};
export async function setup(AM){ ctx=AM.layer('world'); for(const l of AM.timeline.lines) C[l.id]=l;
  const ids=['hook','hanyut','putih','merah','moral']; ids.forEach((id,i)=>{ const L=C[id]; B[id]=[L?L.start:i*3,L?L.end:(i+1)*3]; }); }
const SHOTS=[]; const shot=(id,fn)=>SHOTS.push({id,fn});
shot('hook',(t,a,b)=>{ K.bg(ctx,t); K.pumpkin(ctx,380,1000,150,'#d9a441',{t,glowA:1}); K.pumpkin(ctx,700,1000,190,'#8f5a2b',{t}); K.title(ctx,'DUA LABU',540,300,{a:K.pop(t,a+0.2)}); });
shot('hanyut',(t,a,b)=>{ K.bg(ctx,t); K.hill(ctx,540,1300,700,300,'#5e8f4e'); K.hut(ctx,540,950,1,{t}); K.figure(ctx,300+t*20%200,1100,1,'#c0392b',{t}); K.caption(ctx,'Kain hanyut',540,400,{}); });
shot('putih',(t,a,b)=>{ K.bg(ctx,t); K.figure(ctx,440,1000,1.2,'#f3e6c8',{t}); K.figure(ctx,640,1000,1,'#4a3220',{t}); K.pumpkin(ctx,540,1250,120,'#d9a441',{t}); K.title(ctx,'LABU KECIL: EMAS',540,300,{a:K.pop(t,a+0.2),size:56}); });
shot('merah',(t,a,b)=>{ K.bg(ctx,t); K.figure(ctx,540,1000,1.3,'#c0392b',{t}); K.pumpkin(ctx,540,1250,170,'#4a3220',{t}); K.title(ctx,'LABU BESAR?',540,300,{a:K.pop(t,a+0.2)}); });
shot('moral',(t,a,b)=>{ K.bg(ctx,t); K.hill(ctx,540,1300,700,300,'#5e8f4e'); K.title(ctx,'KEBAIKAN',540,400,{a:K.pop(t,a+0.2)}); K.title(ctx,'TAK BISA DIPALSUKAN',540,500,{a:K.pop(t,a+0.4),size:52}); });
export function render(t,AM){ let s=SHOTS[0]; for(const sh of SHOTS) if(t>=B[sh.id][0]) s=sh; ctx.save(); s.fn(t,Math.max(0,B[s.id][0]),B[s.id][1]); ctx.restore(); }
