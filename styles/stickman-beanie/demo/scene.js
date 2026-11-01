// Stickman Beanie demo: white studio + grey grid, red beanie + yellow tee.
import * as K from '/styles/stickman-beanie/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;
export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1480, size: 66 } };
let ctx, fx; const C = {};
const W = (id, w) => AM.wordTime(id, w);
const PY = { hook: 700, alasan: 1950, jebakan: 3200, trik: 4450, moral: 5700 };
const pop = (t, a, d = 0.3) => ease.outBack(clamp((t - a) / d), 2);
const poses = [
  { x: 540, y: 1050, s: 1.6, face: 'shock', look: 0.6, arms: [[1.6, 0.6], [-1.3, -0.4]] },
  { x: 540, y: 2300, s: 1.6, face: 'worried', look: -0.4, arms: [[0.4, 0.2], [-0.4, -0.2]] },
  { x: 540, y: 3550, s: 1.6, face: 'happy', look: 0.4, arms: [[1.9, -1.4], [0.6, 1.2]], legs: [[0.35, 0], [-0.25, 0]] },
  { x: 540, y: 4800, s: 1.6, face: 'grin', look: 0.8, arms: [[2.0, 0.1], [-0.6, 1.8]] },
  { x: 540, y: 6050, s: 1.6, face: 'happy', look: 0, arms: [[2.7, 0.2], [-2.7, -0.2]] },
];
const ORDER = ['hook', 'alasan', 'jebakan', 'trik', 'moral'];
export async function setup(AM) {
  ctx = AM.layer('world'); fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('pencil', 0.0, { gain: 0.3 });
}
function camAt(t) {
  let k = 0; for (let i = 0; i < ORDER.length; i++) if (C[ORDER[i]] && t >= C[ORDER[i]].start - 0.15) k = i;
  const id = ORDER[k], a = C[id].start - 0.15, prevY = k ? PY[ORDER[k - 1]] : PY.hook;
  const f = ease.inOutCubic(clamp((t - a) / 0.55));
  return [540, lerp(prevY, PY[id], f) - 40, 1.0];
}
export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  K.setBoil(t, 1.7, 12);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.notebook(ctx);
  let k = 0; for (let i = 0; i < ORDER.length; i++) if (C[ORDER[i]] && t >= C[ORDER[i]].start - 0.15) k = i;
  const p = poses[k];
  const blink = (t % 3.1) < 0.12 ? 1 : 0;
  K.stickDraw(ctx, { ...p, blink }, t, { reveal: 1 });
  const words = ['FOKUS!', 'MULAI!', 'GAS!', 'BISA!', 'MENANG!'];
  K.bubble(ctx, p.x + 260, p.y - 620, 300, 140, p.x + 40, p.y - 350, words[k], { a: pop(t, C[ORDER[k]].start), size: 64, font: 'Permanent Marker', textCol: K.PAL.beanie, col: K.PAL.ink });
  AM.lib.vignette(fx, { strength: 0.12, inner: 0.6, color: '120,120,130' });
}
