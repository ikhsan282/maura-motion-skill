// Maura Motion style kit: PERKAMEN UKIRAN.
import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';
export const PAL = { paper:'#e6d3a3', paper2:'#d4b983', ink:'#3d2b16', red:'#8f2f1d', gold:'#a67c2e' };
export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };
export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) { ctx.setTransform(1,0,0,1,0,0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y); }
export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));
export function bg(ctx, t) {
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  const c = cached('perkamen-bg', () => {
    const m = makeCanvas(54, 96), g = m.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#e6d3a3'); gr.addColorStop(1, '#cdb07c');
    g.fillStyle = gr; g.fillRect(0, 0, 54, 96); return m; });
  ctx.drawImage(c, 0, 0, 1080, 1920); ctx.restore(); }
export function title(ctx, str, x, y, { a = 1, size = 72 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#3d2b16'; ctx.font = `800 ${size}px system-ui,sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore(); }
export function caption(ctx, str, x, y, { a = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(61,43,22,.75)'; ctx.font = '600 40px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(str, x, y); ctx.restore(); }
export function frame(ctx, { t = 0 } = {}) {
  ctx.save(); ctx.strokeStyle = '#3d2b16'; ctx.lineWidth = 10; ctx.strokeRect(60, 120, 960, 1680);
  ctx.lineWidth = 3; ctx.strokeRect(90, 150, 900, 1620);
  for (const [x, y] of [[60,120],[1020,120],[60,1800],[1020,1800]]) {
    ctx.fillStyle = '#3d2b16'; ctx.beginPath(); ctx.arc(x, y, 18, 0, TAU); ctx.fill(); }
  ctx.restore(); }
export function ship(ctx, x, y, s, { t = 0, bob = 1 } = {}) {
  ctx.save(); ctx.translate(x, y + Math.sin(t*1.4)*10*bob); ctx.scale(s, s);
  ctx.fillStyle = '#4a3018'; ctx.beginPath(); ctx.moveTo(-160, 40); ctx.lineTo(160, 40); ctx.lineTo(110, 110); ctx.lineTo(-110, 110); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5e3f22'; ctx.fillRect(-12, -160, 24, 200);
  ctx.fillStyle = '#e8dcc0'; ctx.beginPath(); ctx.moveTo(12, -160); ctx.quadraticCurveTo(130, -120, 120, -20); ctx.lineTo(12, -20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3d2b16'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-160, 40); ctx.lineTo(160, 40); ctx.stroke();
  ctx.restore(); }
export function waves(ctx, y, t, { col = 'rgba(61,43,22,.5)' } = {}) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4;
  for (let r = 0; r < 3; r++) { ctx.beginPath();
    for (let x = 80; x <= 1000; x += 20) { const yy = y + r*46 + Math.sin(x*0.02 + t*2 + r)*12; x === 80 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
    ctx.stroke(); }
  ctx.restore(); }
export function feather(ctx, x, y, s, { t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5 + Math.sin(t)*0.05); ctx.scale(s, s);
  ctx.fillStyle = '#f2e8d0'; ctx.beginPath(); ctx.ellipse(0, -60, 26, 90, 0.3, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3d2b16'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(30, -140); ctx.stroke();
  ctx.restore(); }
