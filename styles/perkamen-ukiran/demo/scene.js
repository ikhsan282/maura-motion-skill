import * as K from '/styles/perkamen-ukiran/kit.js';
export const meta = { fps: 24, hold: 1 };
let ctx; const C={}; let B={};
export async function setup(AM){ ctx=AM.layer('world'); for(const l of AM.timeline.lines) C[l.id]=l;
  const ids=['hook','nama','badai','tidore','kata']; ids.forEach((id,i)=>{ const L=C[id]; B[id]=[L?L.start:i*3,L?L.end:(i+1)*3]; }); }
const SHOTS=[]; const shot=(id,fn)=>SHOTS.push({id,fn});
shot('hook',(t,a,b)=>{ K.bg(ctx,t); K.frame(ctx,{t}); K.feather(ctx,540,900,2,{t}); K.title(ctx,'KAMUS MELAYU',540,350,{a:K.pop(t,a+0.2)}); });
shot('nama',(t,a,b)=>{ K.bg(ctx,t); K.frame(ctx,{t}); K.ship(ctx,540,900,1.2,{t}); K.waves(ctx,1200,t,{}); K.title(ctx,'PIGAFETTA 1519',540,350,{a:K.pop(t,a+0.2)}); });
shot('badai',(t,a,b)=>{ K.bg(ctx,t); K.frame(ctx,{t}); K.ship(ctx,540+Math.sin(t*3)*30,900,1,{t}); K.waves(ctx,1200,t*2,{}); K.caption(ctx,'Badai, lapar, perang',540,450,{}); });
shot('tidore',(t,a,b)=>{ K.bg(ctx,t); K.frame(ctx,{t}); K.ship(ctx,540,850,1,{t}); K.title(ctx,'TIDORE 1521',540,350,{a:K.pop(t,a+0.2)}); });
shot('kata',(t,a,b)=>{ K.bg(ctx,t); K.frame(ctx,{t}); K.feather(ctx,540,800,2.5,{t}); K.title(ctx,'MATA GIGI BATU BUMI',540,350,{a:K.pop(t,a+0.2),size:52}); });
export function render(t,AM){ let s=SHOTS[0]; for(const sh of SHOTS) if(t>=B[sh.id][0]) s=sh; ctx.save(); s.fn(t,Math.max(0,B[s.id][0]),B[s.id][1]); ctx.restore(); }
