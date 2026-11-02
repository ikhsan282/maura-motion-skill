import * as K from '/styles/flat-vector/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;
export const meta = { fps: 24, captions: { preset: 'bold', y: 1470, size: 64, active: '#ffd65e', stroke: 9, strokeColor: '#0b1230', anim: 'rise', maxWords: 4 } };
let ctx, fx;
const C = {};
let B = {};
export async function setup(AM) {
  ctx = AM.layer('world'); fx = AM.layer('fx');
  for (const line of AM.timeline.lines) C[line.id] = line;
  const ids = AM.timeline.lines.map(l => l.id);
  const start = id => C[id].start - 0.12;
  B = {};
  ids.forEach((id, i) => { B[id] = [i === 0 ? 0 : start(id), i + 1 < ids.length ? start(ids[i+1]) : AM.duration + 1]; });
}
const reset = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
function background(t) { K.space(ctx, t, { px: t * 8, py: t * 3 }); K.glow(ctx, 820, 410, 360, '#8f7bff', 0.25); }
export function render(t, AM) {
  let current = SHOTS[0];
  for (const s of SHOTS) if (t >= B[s.id][0]) current = s;
  const [a, b] = B[current.id];
  ctx.save(); current.fn(t, Math.max(0, a), b); ctx.restore();
  reset(); ctx.globalAlpha = 1;
  AM.lib.vignette(fx, { strength: 0.3, inner: 0.5, color: '4,6,26' });
}

function box(x, y, w, h, label, sub, col, p) {
  if (p <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.01, p), Math.max(0.01, p));
  ctx.fillStyle = col; AM.lib.roundRect(ctx, -w/2, -h/2, w, h, 36); ctx.fill();
  ctx.fillStyle = '#0b1230'; ctx.textAlign = 'center';
  ctx.font = '800 44px Poppins, sans-serif'; ctx.fillText(label, 0, -6);
  ctx.font = '700 34px Poppins, sans-serif'; ctx.fillText(sub, 0, 44);
  ctx.restore();
}
shot('hook', (t, a, b) => {
  background(t);
  const p = K.pop(t, a + 0.15, 0.5);
  box(540, 900, 560, 300, 'Rp100.000', 'satu lembar', '#ffd65e', p);
  reset();
  K.headline(ctx, 'KE MANA PERGINYA?', 540, 400, { size: 84, p: K.pop(t, a + 0.1, 0.45), accent: '#ffd65e' });
});
const FLOWS = [['bensin','BENSIN','-30rb','#ff6f91'],['jajan','JAJAN','-25rb','#6cc8ff'],['parkir','PARKIR+TOL','-15rb','#7af0b0'],['habis','HILANG?','-30rb','#8f7bff']];
FLOWS.forEach(([id, label, sub, col], i) => {
  shot(id, (t, a, b) => {
    background(t);
    const p = K.pop(t, a + 0.1, 0.45);
    box(540, 700, 560, 260, 'Rp100.000', 'dompet menipis', '#ffd65e', 1);
    // pipe down + flow dots
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 26; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(540, 840); ctx.lineTo(540, 1080); ctx.stroke();
    const f = ((t * 1.4) % 1);
    K.ball(ctx, 540, 840 + f * 240, 22, '#ffffff', col);
    ctx.restore();
    box(540, 1300, 480, 220, label, sub, col, p);
    reset();
    K.badge(ctx, label + '  ' + sub, 540, 400, { p, size: 46, bg: 'rgba(255,255,255,.14)' });
  });
});
shot('tutup', (t, a, b) => {
  background(t);
  const p = K.pop(t, a + 0.1, 0.5);
  box(540, 900, 560, 260, 'Rp0', 'dompet kosong', '#ffffff', p);
  reset();
  K.headline(ctx, 'CATAT PENGELUARANMU', 540, 400, { size: 72, p, accent: '#3fd6c6' });
  K.badge(ctx, 'mulai hari ini', 540, 540, { p: K.pop(t, a + 0.5, 0.4), size: 42 });
});
