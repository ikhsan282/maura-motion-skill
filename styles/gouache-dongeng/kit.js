// Maura Motion style kit: GOUACHE DONGENG.
import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';
export const PAL = { paper:'#f3e6c8', ink:'#4a3220', red:'#c0392b', gold:'#d9a441', leaf:'#5e8f4e', sky:'#9fc3d8' };
export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };
export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) { ctx.setTransform(1,0,0,1,0,0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y); }
export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));
export function bg(ctx, t) {
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  const c = cached('gouache-bg', () => {
    const m = makeCanvas(54, 96), g = m.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#f3e6c8'); gr.addColorStop(1, '#e8d3a8');
    g.fillStyle = gr; g.fillRect(0, 0, 54, 96); return m; });
  ctx.drawImage(c, 0, 0, 1080, 1920); ctx.restore(); }
export function title(ctx, str, x, y, { a = 1, size = 72 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#4a3220'; ctx.font = `800 ${size}px system-ui,sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore(); }
export function caption(ctx, str, x, y, { a = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(74,50,32,.75)'; ctx.font = '600 40px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(str, x, y); ctx.restore(); }
export function hill(ctx, x, y, w, h, col) { ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, w, h, 0, Math.PI, TAU); ctx.fill(); ctx.restore(); }
export function hut(ctx, x, y, s, { t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#8a5a33'; ctx.fillRect(-90*s, -60*s, 180*s, 120*s);
  ctx.fillStyle = '#5e3a1e'; ctx.beginPath(); ctx.moveTo(-120*s, -60*s); ctx.lineTo(0, -150*s); ctx.lineTo(120*s, -60*s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a2412'; ctx.fillRect(-25*s, 0, 50*s, 60*s); ctx.restore(); }
export function figure(ctx, x, y, s, col, { t = 0 } = {}) {
  const b = Math.sin(t*2.2)*6*s; ctx.save(); ctx.translate(x, y+b);
  ctx.fillStyle = '#e8b98a'; ctx.beginPath(); ctx.arc(0, -120*s, 34*s, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a1c3f'; ctx.beginPath(); ctx.arc(0, -132*s, 36*s, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-40*s, -86*s); ctx.lineTo(40*s, -86*s); ctx.lineTo(56*s, 60*s); ctx.lineTo(-56*s, 60*s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#241a10'; for (const sx of [-1,1]) { ctx.beginPath(); ctx.arc(sx*13*s, -120*s, 4*s, 0, TAU); ctx.fill(); }
  ctx.restore(); }
export function pumpkin(ctx, x, y, r, col, { t = 0, glowA = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= glowA;
  for (const dx of [-0.5, 0, 0.5]) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(dx*r, 0, r*0.55, r*0.8, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = 'rgba(90,50,10,.5)'; ctx.lineWidth = 4;
  for (const dx of [-0.25, 0.25]) { ctx.beginPath(); ctx.ellipse(dx*r, 0, r*0.3, r*0.72, 0, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = '#5e8f4e'; ctx.fillRect(-8, -r*0.8-26, 16, 30); ctx.restore(); }
