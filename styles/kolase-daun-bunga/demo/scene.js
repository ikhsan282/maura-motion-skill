import * as K from '/styles/kolase-daun-bunga/kit.js';
export const meta = { fps: 24, hold: 1 };
let ctx; const C={}; let B={};
export async function setup(AM){ ctx=AM.layer('world'); for(const l of AM.timeline.lines) C[l.id]=l;
  const ids=['hook','tanpa','mekar','lalat','akhir']; ids.forEach((id,i)=>{ const L=C[id]; B[id]=[L?L.start:i*3,L?L.end:(i+1)*3]; }); }
const SHOTS=[]; const shot=(id,fn)=>SHOTS.push({id,fn});
shot('hook',(t,a,b)=>{ K.bg(ctx,t); K.rafflesia(ctx,540,1000,260,{t,open:K.pr(t,a+0.3,b)}); K.title(ctx,'RAFFLESIA',540,300,{a:K.pop(t,a+0.2)}); });
shot('tanpa',(t,a,b)=>{ K.bg(ctx,t); K.leaf(ctx,400,1000,300,90,0.5,'#4e7d3a',{t}); K.leaf(ctx,680,1000,300,90,-0.5,'#7aa14f',{t}); K.caption(ctx,'Tanpa daun, batang, akar',540,400,{}); });
shot('mekar',(t,a,b)=>{ K.bg(ctx,t); const o=K.pr(t,a,b); K.rafflesia(ctx,540,1050,120+180*o,{t,open:o}); K.title(ctx,'MEKAR 1 METER',540,300,{a:K.pop(t,a+0.5),size:60}); });
shot('lalat',(t,a,b)=>{ K.bg(ctx,t); K.rafflesia(ctx,540,1000,260,{t,open:1}); K.flower(ctx,300,600,60,'#a83a32','#e8d9b0',{t}); K.flower(ctx,780,700,60,'#a83a32','#e8d9b0',{t}); K.caption(ctx,'Lalat pembawa serbuk sari',540,400,{}); });
shot('akhir',(t,a,b)=>{ K.bg(ctx,t); K.rafflesia(ctx,540,1000,260,{t,open:1}); K.title(ctx,'PUSPA LANGKA',540,300,{a:K.pop(t,a+0.2)}); });
export function render(t,AM){ let s=SHOTS[0]; for(const sh of SHOTS) if(t>=B[sh.id][0]) s=sh; ctx.save(); s.fn(t,Math.max(0,B[s.id][0]),B[s.id][1]); ctx.restore(); }
