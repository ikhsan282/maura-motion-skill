// Maura Motion style kit: PARTIKEL.
import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';
export const PAL = { bg0:'#050914', bg1:'#0e1e3a', cyan:'#6ee7ff', gold:'#ffd65e', pink:'#ff6f91', white:'#eef4ff' };
export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };
export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) { ctx.setTransform(1,0,0,1,0,0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y); }
export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));
export function bg(ctx, t) {
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  const c = cached('partikel-bg', () => {
    const m = makeCanvas(54, 96), g = m.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#050914'); gr.addColorStop(1, '#0e1e3a');
    g.fillStyle = gr; g.fillRect(0, 0, 54, 96); return m; });
  ctx.drawImage(c, 0, 0, 1080, 1920); ctx.restore(); }
export function title(ctx, str, x, y, { a = 1, size = 72 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#eef4ff'; ctx.font = `800 ${size}px system-ui,sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.restore(); }
export function caption(ctx, str, x, y, { a = 1 } = {}) {
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(110,231,255,.9)'; ctx.font = '600 40px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.fillText(str, x, y); ctx.restore(); }
export function flock(ctx, pts, { col = '#eef4ff', size = 5 } = {}) {
  ctx.save(); ctx.fillStyle = col; ctx.beginPath();
  for (const p of pts) { ctx.moveTo(p[0]+size, p[1]); ctx.arc(p[0], p[1], size*(p[2]||1), 0, TAU); }
  ctx.fill(); ctx.restore(); }
export function boids(t, n, seed, { cx = 540, cy = 800, R = 320 } = {}) {
  const out = []; const r = mulberry32(seed);
  const off = []; for (let i = 0; i < n; i++) off.push([r()*TAU, 0.3+r()*0.7, r()*TAU]);
  for (let i = 0; i < n; i++) { const [p, k, q] = off[i];
    const a = p + t*0.35*k;
    const x = cx + Math.cos(a)*R*k + Math.sin(t*0.9+q)*90*k;
    const y = cy + Math.sin(a*1.3)*R*0.55*k + Math.cos(t*0.7+q)*70*k;
    out.push([x, y, 0.5+k*0.8]); }
  return out; }
export function glowDot(ctx, x, y, r, col, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.restore(); }
