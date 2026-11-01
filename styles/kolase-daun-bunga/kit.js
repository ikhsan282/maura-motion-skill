// Maura Motion style kit: KOLASE DAUN BUNGA.
import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';
export const PAL = { paper:'#efe6d2', leaf:'#4e7d3a', leaf2:'#7aa14f', petal:'#a83a32', cream:'#e8d9b0', ink:'#3a2e1e' };
export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };
export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) { ctx.setTransform(1,0,0,1,0,0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y); }
export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));
export function bg(ctx, t) {
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  const c = cached('kolase-bg', () => {
    const m = makeCanvas(54, 96), g = m.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#efe6d2'); gr.addColorStop(1, '#dccfae');
    g.fillStyle = gr; g.fillRect(0, 0, 54, 96); return m; });
  ctx.drawImage(c, 0, 0, 1080, 1920); ctx.restore(); }
export function title(ctx, str, x, y, { a = 1, size = 72 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#3a2e1e'; ctx.font = `800 ${size}px system-ui,sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore(); }
export function caption(ctx, str, x, y, { a = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(58,46,30,.7)'; ctx.font = '600 40px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(str, x, y); ctx.restore(); }
export function leaf(ctx, x, y, len, wid, ang, col, { t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.sin(t*1.5+x)*0.03);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len*0.5, -wid, len, 0); ctx.quadraticCurveTo(len*0.5, wid, 0, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(40,60,20,.5)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(len-6, 0); ctx.stroke(); ctx.restore(); }
export function flower(ctx, x, y, r, petal, core, { t = 0, open = 1, n = 5 } = {}) {
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < n; i++) { const a = (i/n)*TAU + t*0.05;
    ctx.save(); ctx.rotate(a); ctx.fillStyle = petal;
    ctx.beginPath(); ctx.ellipse(r*0.75*open, 0, r*0.75, r*0.42, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, r*0.45, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.25)';
  for (let i = 0; i < 8; i++) { const a = i/8*TAU; ctx.beginPath(); ctx.arc(Math.cos(a)*r*0.25, Math.sin(a)*r*0.25, r*0.06, 0, TAU); ctx.fill(); }
  ctx.restore(); }
export function rafflesia(ctx, x, y, r, { t = 0, open = 1 } = {}) {
  flower(ctx, x, y, r, '#a83a32', '#5e1f1a', { t, open, n: 5 });
  ctx.save(); ctx.fillStyle = 'rgba(240,220,180,.85)';
  const rr = mulberry32(11);
  for (let i = 0; i < 14; i++) { const a = rr()*TAU, d = rr()*r*0.9; ctx.beginPath(); ctx.arc(x+Math.cos(a)*d, y+Math.sin(a)*d*0.7, 5+rr()*9, 0, TAU); ctx.fill(); }
  ctx.restore(); }
