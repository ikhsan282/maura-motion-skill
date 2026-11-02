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

const SLICES = [['ngeluh','NGELUH 40%','#ff6f91',0.40],['lapar','LAPAR 30%','#ffd65e',0.30],['ngantuk','NGANTUK 20%','#6cc8ff',0.20],['kerjaan','KERJAAN 10%','#7af0b0',0.10]];
function pie(t, upto) {
  // upto: how many slices revealed (0..4)
  let ang = -Math.PI / 2;
  SLICES.forEach(([id, label, col, frac], i) => {
    if (i >= upto) return;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(540, 950);
    ctx.arc(540, 950, 300, ang, ang + frac * Math.PI * 2); ctx.closePath(); ctx.fill();
    ang += frac * Math.PI * 2;
  });
  ctx.fillStyle = '#0b1230'; ctx.beginPath(); ctx.arc(540, 950, 90, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = '800 40px Poppins, sans-serif';
  ctx.fillText('OTAK', 540, 945); ctx.fillText('MACET', 540, 985);
}
function headOutline() {
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.arc(540, 950, 360, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
shot('hook', (t, a, b) => {
  background(t);
  headOutline(); pie(t, 4);
  reset();
  K.headline(ctx, 'KEPALA PAS MACET', 540, 400, { size: 80, p: K.pop(t, a + 0.1, 0.45), accent: '#ff6f91' });
});
SLICES.forEach(([id, label, col, frac], i) => {
  shot(id, (t, a, b) => {
    background(t);
    headOutline(); pie(t, i + 1);
    reset();
    K.badge(ctx, label, 540, 400, { p: K.pop(t, a + 0.1, 0.4), size: 56, bg: col, fg: '#0b1230' });
  });
});
shot('tutup', (t, a, b) => {
  background(t);
  headOutline(); pie(t, 4);
  reset();
  K.headline(ctx, 'KAMU TIM YANG MANA?', 540, 400, { size: 68, p: K.pop(t, a + 0.1, 0.5), accent: '#3fd6c6' });
});
