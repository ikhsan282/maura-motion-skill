// Maura Motion style kit: SWISS BAUHAUS (grid, primaries)..
import { clamp, lerp, ease, hrand, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = { paper:'#f5f2ea', ink:'#111111', red:'#e30613', blue:'#0066b3', yellow:'#ffcc00', grey:'#9a9a9a' };

export function bg(ctx, t, c1, c2) {
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  const g = ctx.createLinearGradient(0,0,0,1920); g.addColorStop(0,c1); g.addColorStop(1,c2);
  ctx.fillStyle = g; ctx.fillRect(0,0,1080,1920); ctx.restore();
}
export function title(ctx, text, x, y, { size=84, color='#ffffff', p=1 } = {}) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = color;
  ctx.font = `800 ${size}px Poppins`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text, x, y); ctx.restore();
}
export function label(ctx, text, x, y, { size=52, color='#ffffff', p=1 } = {}) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = color;
  ctx.font = `700 ${size}px Poppins`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(text, x, y); ctx.restore();
}
export function blob(ctx, x, y, r, color, t, { seed=1 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  const n=10, rnd = mulberry32(seed);
  const off = Array.from({length:n}, () => 0.75 + rnd()*0.5);
  for (let i=0;i<=n;i++) { const a=i/n*TAU; const rr=r*off[i%n]*(1+0.06*Math.sin(t*1.5+i));
    const px=x+Math.cos(a)*rr, py=y+Math.sin(a)*rr*0.9;
    i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
export function ring(ctx, x, y, r, color, w=8) {
  ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=w; ctx.beginPath(); ctx.arc(x,y,r,0,TAU); ctx.stroke(); ctx.restore();
}
export function card(ctx, x, y, w, h, fill, { r=28 } = {}) {
  ctx.save(); ctx.fillStyle=fill;
  ctx.beginPath(); ctx.roundRect(x-w/2,y-h/2,w,h,r); ctx.fill(); ctx.restore();
}
