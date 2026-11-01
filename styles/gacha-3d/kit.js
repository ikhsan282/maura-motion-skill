// Maura Motion style kit: GACHA 3D.
import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';
export const PAL = { bg0:'#1a1033', bg1:'#3b1d5e', cap:'#ffd65e', ball:'#ff6f91', ball2:'#7af0b0', gold:'#ffcf4d', white:'#ffffff' };
export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };
export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) { ctx.setTransform(1,0,0,1,0,0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y); }
export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));
export function bg(ctx, t) {
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  const c = cached('gacha-bg', () => {
    const m = makeCanvas(54, 96), g = m.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#1a1033'); gr.addColorStop(1, '#3b1d5e');
    g.fillStyle = gr; g.fillRect(0, 0, 54, 96); return m; });
  ctx.drawImage(c, 0, 0, 1080, 1920); ctx.restore(); }
export function title(ctx, str, x, y, { a = 1, size = 72 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#ffffff'; ctx.font = `800 ${size}px system-ui,sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore(); }
export function caption(ctx, str, x, y, { a = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(255,214,94,.9)'; ctx.font = '600 40px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(str, x, y); ctx.restore(); }
export function machine(ctx, x, y, s, { t = 0, glowA = 1 } = {}) {
  ctx.save(); ctx.translate(x, y);
  const w = 420 * s, h = 520 * s;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; roundRect(ctx, -w/2+14, -h/2+22, w, h, 60*s); ctx.fill();
  const g = ctx.createLinearGradient(0, -h/2, 0, h/2); g.addColorStop(0, '#ff6f91'); g.addColorStop(1, '#8f4bd8');
  ctx.fillStyle = g; roundRect(ctx, -w/2, -h/2, w, h, 60*s); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; roundRect(ctx, -w/2+18*s, -h/2+18*s, w-36*s, h*0.42, 40*s); ctx.fill();
  ctx.fillStyle = 'rgba(20,8,40,.55)'; roundRect(ctx, -w/2+34*s, -h/2+34*s, w-68*s, h*0.34, 30*s); ctx.fill();
  const r = mulberry32(7);
  for (let i = 0; i < 9; i++) {
    const bx = -w/2 + 70*s + (i%3)*140*s, by = -h/2 + 100*s + Math.floor(i/3)*80*s;
    const cols = ['#ffd65e','#ff6f91','#7af0b0','#6cc8ff'];
    ctx.fillStyle = cols[i%4]; ctx.beginPath(); ctx.arc(bx, by + Math.sin(t*3+i)*6, 34*s, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(bx-10*s, by-12*s, 10*s, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = '#2a1450'; ctx.beginPath(); ctx.arc(0, h*0.32, 44*s, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffcf4d'; ctx.beginPath(); ctx.arc(0, h*0.32, 30*s, 0, TAU); ctx.fill();
  ctx.restore(); }
export function capsule(ctx, x, y, r, col, { open = 0, t = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t*2)*0.06);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(-r*0.35, -r*0.4, r*0.22, r*0.13, -0.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = r*0.1;
  ctx.beginPath(); ctx.arc(0, 0, r*0.98, -0.4+open, Math.PI+0.4-open); ctx.stroke();
  ctx.restore(); }
export function mascot(ctx, x, y, r, col, { t = 0, eye = 1 } = {}) {
  const b = Math.sin(t*4)*r*0.06; ctx.save(); ctx.translate(x, y+b);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath(); ctx.arc(-r*0.3, -r*0.1, r*0.16*eye, 0, TAU); ctx.arc(r*0.3, -r*0.1, r*0.16*eye, 0, TAU); ctx.fill();
  ctx.fillStyle = '#241040'; ctx.beginPath(); ctx.arc(-r*0.3, -r*0.1, r*0.07, 0, TAU); ctx.arc(r*0.3, -r*0.1, r*0.07, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#241040'; ctx.lineWidth = r*0.07; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, r*0.15, r*0.3, 0.3, Math.PI-0.3); ctx.stroke(); ctx.restore(); }
