import * as K from '/styles/gacha-3d/kit.js';
const { clamp, lerp } = AM.lib;
export const meta = { fps: 24, hold: 1 };
let ctx;
const C = {}; let B = {};
export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const ids = ['hook','tarsius','komodo','badak','akhir'];
  ids.forEach((id,i)=>{ const L=C[id]||C[Object.keys(C)[i]]; B[id]=[L?L.start: i*3, L?L.end:(i+1)*3]; });
  B.sisa=B.akhir;
}
const SHOTS=[]; const shot=(id,fn)=>SHOTS.push({id,fn});
shot('hook',(t,a,b)=>{ K.bg(ctx,t); K.machine(ctx,540,900,1,{t}); K.title(ctx,'3 KAPSUL',540,300,{a:K.pop(t,a+0.2)}); K.title(ctx,'SATWA LANGKA',540,380,{a:K.pop(t,a+0.4)}); });
shot('tarsius',(t,a,b)=>{ K.bg(ctx,t); K.capsule(ctx,540,900,150,'#3fa9ff',{open:K.pr(t,a+0.5,b),t}); K.mascot(ctx,540,900,110,'#3fa9ff',{t}); K.title(ctx,'TARSIUS',540,300,{a:K.pop(t,a+0.2)}); });
shot('komodo',(t,a,b)=>{ K.bg(ctx,t); K.capsule(ctx,540,900,150,'#8f7bff',{open:K.pr(t,a+0.5,b),t}); K.mascot(ctx,540,900,110,'#8f7bff',{t}); K.title(ctx,'KOMODO',540,300,{a:K.pop(t,a+0.2)}); });
shot('badak',(t,a,b)=>{ K.bg(ctx,t); K.capsule(ctx,540,900,170,'#ffcf4d',{open:K.pr(t,a+0.5,b),t}); K.mascot(ctx,540,900,120,'#ffcf4d',{t}); K.title(ctx,'BADAK JAWA',540,300,{a:K.pop(t,a+0.2)}); });
shot('akhir',(t,a,b)=>{ K.bg(ctx,t); K.machine(ctx,540,900,0.8,{t}); K.caption(ctx,'Langka = hampir hilang',540,500,{}); K.title(ctx,'87-100 EKOR',540,350,{a:K.pop(t,a+0.3)}); });
export function render(t,AM){ let s=SHOTS[0]; for(const sh of SHOTS) if(t>=B[sh.id][0]) s=sh; ctx.save(); s.fn(t,Math.max(0,B[s.id][0]),B[s.id][1]); ctx.restore(); }
