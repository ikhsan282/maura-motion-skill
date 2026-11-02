// Grid Desain demo (5 shots).
import * as K from '/styles/swiss-bauhaus/kit.js';
const { clamp, prog } = AM.lib;
export const meta = { fps: 24, captions: { preset: 'clean', y: 1470, size: 60 } };
let ctx, fx; const C = {};
export async function setup(AM) {
  ctx = AM.layer('world'); fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
}
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i+1] ? C[L[i+1].id].start - 0.12 : AM.duration + 1]; };
function shapes(t) {
  ctx.save();
  ctx.fillStyle = K.PAL.red; ctx.fillRect(80, 300, 280, 280);
  ctx.fillStyle = K.PAL.blue; ctx.beginPath(); ctx.arc(720, 440, 140, 0, 7); ctx.fill();
  ctx.fillStyle = K.PAL.yellow; ctx.beginPath();
  ctx.moveTo(220, 640); ctx.lineTo(500, 640); ctx.lineTo(360, 880); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function grid(t, cols, rows, p) {
  ctx.save(); ctx.globalAlpha = clamp(p);
  ctx.strokeStyle = '#111111'; ctx.lineWidth = 3;
  for (let i = 0; i <= cols; i++) { const x = 80 + i * (920 / cols); ctx.beginPath(); ctx.moveTo(x, 220); ctx.lineTo(x, 1100); ctx.stroke(); }
  for (let j = 0; j <= rows; j++) { const y = 220 + j * (880 / rows); ctx.beginPath(); ctx.moveTo(80, y); ctx.lineTo(1000, y); ctx.stroke(); }
  ctx.restore();
}
shot('hook', (t, a, b) => {
  const p = prog(t, a, a + 0.5);
  K.bg(ctx, t, '#ffffff', K.PAL.paper); shapes(t);
  K.title(ctx, 'GRID?', 540, 1200, { color: K.PAL.ink, p });
});
shot('rapi', (t, a, b) => {
  const p = prog(t, a, a + 0.5);
  K.bg(ctx, t, '#ffffff', K.PAL.paper); shapes(t); grid(t, 3, 3, p);
  K.title(ctx, 'RAPI', 540, 1200, { color: K.PAL.ink, p });
});
shot('sepertiga', (t, a, b) => {
  const p = prog(t, a, a + 0.5);
  K.bg(ctx, t, '#ffffff', K.PAL.paper); shapes(t); grid(t, 3, 3, 1);
  ctx.save(); ctx.fillStyle = K.PAL.red;
  ctx.beginPath(); ctx.arc(386, 513, 26, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(693, 806, 26, 0, 7); ctx.fill(); ctx.restore();
  K.title(ctx, 'SEPERTIGA', 540, 1200, { color: K.PAL.ink, p });
});
shot('margin', (t, a, b) => {
  const p = prog(t, a, a + 0.5);
  K.bg(ctx, t, '#ffffff', K.PAL.paper); shapes(t); grid(t, 4, 4, 1);
  ctx.save(); ctx.strokeStyle = K.PAL.blue; ctx.lineWidth = 8;
  ctx.strokeRect(80, 220, 920, 880); ctx.restore();
  K.title(ctx, 'MARGIN', 540, 1200, { color: K.PAL.ink, p });
});
shot('tutup', (t, a, b) => {
  const p = prog(t, a, a + 0.5);
  K.bg(ctx, t, '#ffffff', K.PAL.paper); shapes(t); grid(t, 3, 3, 1 - p * 0.7);
  K.title(ctx, 'PRO', 540, 1200, { color: K.PAL.red, p });
});
export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
