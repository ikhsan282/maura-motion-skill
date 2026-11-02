// Synthwave demo-laser-grid: "LAZER & GRID" — 5 shots.
import * as K from '/styles/synthwave/kit.js';
const { clamp, lerp, ease, hrand, noise } = AM.lib;
const P = K.PAL;
export const meta = { fps: 24, captions: { preset: 'neon', y: 1470, size: 62, maxWords: 4 } };
let g; const C = {};
const W = (id, w) => AM.wordTime(id, w);
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
// laser beams sweeping across the sky
function lasers(t, n = 5, y0 = 500) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.25 + i / n) % 1;
    const y = y0 + i * 90 + Math.sin(t * 1.5 + i * 2) * 30;
    const x0 = ph * 1400 - 160;
    const col = i % 2 ? P.pink : P.red;
    g.save(); g.globalAlpha = 0.75;
    g.beginPath(); g.moveTo(x0 - 500, y - 120); g.lineTo(x0 + 500, y + 60);
    K.neon(g, col, 5, { halo: 1 }); g.restore();
    K.glow(g, x0, y, 90, col, 0.5);
  }
}
function world(t, o = {}) { K.sky(g, t); K.sun(g, t, o.sun || {}); K.mountains(g, t); K.grid(g, t, o.grid || {}); }
function title(str, y, t, t0, opts = {}) {
  if (t < t0) return;
  const p = ease.outBack(clamp((t - t0) / 0.35), 1.6);
  K.chrome(g, str, 540, y, { scale: 0.6 + 0.4 * p, alpha: clamp((t - t0) / 0.15), ...opts });
}
export async function setup(AM) {
  g = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const w = (id, x) => { try { return W(id, x); } catch { return C[id] ? C[id].start + 0.3 : 0; } };
  AM.sfx('boom', w('hook', 'horizon'), { gain: 0.5 });
  AM.sfx('glitch', w('lazer', 'memotong'), { gain: 0.4 });
  AM.sfx('drum_hit', w('akhir', 'synthwave'), { gain: 0.5 });
}
shot('hook', (t, a, b) => {
  world(t, { grid: { speed: 1.6 } });
  title('GRID', 330, t, C.hook.start, { size: 230 });
  K.neonText(g, 'GARIS HORIZON MENYALA', 540, 180, { size: 40, color: P.cyan, alpha: clamp(t / 0.3) });
  if (t > C.hook.start + 0.8) K.neonText(g, 'NEON TANPA UJUNG', 540, 520, { size: 56, color: P.pink, flicker: 0.25, t });
});
shot('matahari', (t, a, b) => {
  const lt = t - a;
  world(t, { sun: { y: lerp(K.HZ + 60, K.HZ - 150, ease.outCubic(clamp(lt / 2))), pulse: 0.4 }, grid: { speed: 0.8 } });
  title('MATAHARI', 300, t, C.matahari.start, { size: 190 });
  K.neonText(g, 'SIMBOL NOSTALGIA 80-AN', 540, 500, { size: 44, color: P.yellow });
});
shot('lazer', (t, a, b) => {
  K.sky(g, t); K.sun(g, t, { y: K.HZ - 150, alpha: 0.7 }); K.mountains(g, t); K.grid(g, t, { speed: 2.2, pulse: 0.5 });
  lasers(t, 6, 420);
  title('LAZER', 330, t, C.lazer.start, { size: 240, rim: P.red });
  K.neonText(g, 'MERAH & MAGENTA BERADU', 540, 520, { size: 44, color: P.red, flicker: 0.3, t });
});
shot('gunung', (t, a, b) => {
  const shift = Math.sin(t * 0.5) * 40;
  K.sky(g, t); K.sun(g, t, { y: K.HZ - 150 }); K.mountains(g, t, { shift, color: P.cyan }); K.grid(g, t, { speed: 1.0 });
  title('CHROME', 300, t, C.gunung.start, { size: 200 });
  K.neonText(g, 'GUNUNG KAWAT MENYALA', 540, 500, { size: 44, color: P.cyan });
});
shot('akhir', (t, a, b) => {
  world(t, { sun: { pulse: 0.6 }, grid: { speed: 1.8, pulse: 0.4 } });
  lasers(t, 3, 350);
  title('SYNTHWAVE', 300, t, C.akhir.start, { size: 180 });
  title('LAZER & GRID', 500, t, C.akhir.start + 0.5, { size: 150, rim: P.cyan });
  K.neonText(g, 'MASA DEPAN DARI MASA LALU', 540, 650, { size: 40, color: P.pink });
});
export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  g.save(); s.fn(t, Math.max(0, a), b); g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0);
  K.crtOverlay(g);
  AM.lib.vignette(g, { strength: 0.5, inner: 0.4 });
}
