import * as K from '/styles/synthwave/kit.js';
const { clamp, lerp, ease, noise } = AM.lib;
const P = K.PAL;
export const meta = { fps: 24, captions: { preset: 'neon', y: 1470, size: 62, maxWords: 4 } };
let g;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
// 5 shots: grid+sun+mountains = demo pattern
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};
export async function setup(AM) {
  g = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}
function world(t, { sunY = K.HZ - 150, speed = 1.3, pulse = 0 } = {}) {
  K.sky(g, t);
  K.sun(g, t, { y: sunY, pulse });
  K.mountains(g, t);
  K.grid(g, t, { speed, pulse });
}
function title(str, y, t, t0, opts = {}) {
  if (t < t0) return;
  const p = ease.outBack(clamp((t - t0) / 0.35), 1.6);
  K.chrome(g, str, 540, y, { scale: 0.6 + 0.4 * p, alpha: clamp((t - t0) / 0.15), ...opts });
}

// 1. Neon city reveal — grid, sun, chrome title
shot('hook', (t, a, b) => {
  const lt = t - a;
  world(t, { pulse: lt < 1.5 ? 0 : clamp((lt - 1.5) / 1.0) });
  title('KOTA NEON', 330, t, W('hook', 'Kota') - 0.15, { size: 230 });
  title('80-AN', 540, t, W('hook', '80') - 0.15, { size: 160 });
  K.neonText(g, '80-AN HIDUP LAGI', 540, 180, { size: 40, color: P.cyan, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'DI LAYAR KITA', 540, 220, { size: 32, color: P.pink, alpha: clamp(lt / 0.4) });
  K.crtOverlay(g);
});

// 2. Retro aesthetic booming — slower grid, VHS glow
shot('retro', (t, a, b) => {
  const lt = t - a;
  world(t, { speed: 0.5, pulse: clamp(lt / 2) });
  title('RETRO', 320, t, W('retro', 'Estetik') - 0.2, { size: 200 });
  K.neonText(g, 'ESTETIK RETRO', 540, 190, { size: 44, color: P.mag, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'BOOMING LAGI', 540, 240, { size: 36, color: P.cyan, alpha: clamp(lt / 0.5) });
  K.neonText(g, 'rindu masa sederhana', 540, 490, { size: 30, color: P.white, font: 'Space Mono', weight: 400 });
  // scanlines
  K.crtOverlay(g, { lines: 0.18 });
});

// 3. VHS tape — magenta grid, warm overlay
shot('vhs', (t, a, b) => {
  const lt = t - a;
  K.sky(g, t);
  K.sun(g, t, { y: K.HZ - 100, pulse: 0.3 });
  K.mountains(g, t);
  K.grid(g, t, { speed: 0.3, color: P.mag, color2: P.orange, pulse: 0.2 });
  title('VHS', 320, t, W('vhs', 'Kaset') - 0.2, { size: 210 });
  K.neonText(g, 'KASET VHS', 540, 190, { size: 46, color: P.orange, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'berderau, warna hangat & jujur', 540, 490, { size: 28, color: P.white, font: 'Space Mono', weight: 400 });
  K.crtOverlay(g, { lines: 0.25 });
});

// 4. Arcade — fast grid, rings, neon
shot('arcade', (t, a, b) => {
  const lt = t - a;
  const pulse = clamp(lt / 2);
  world(t, { speed: 2.5, pulse });
  title('ARCADE', 320, t, W('arcade', 'Arcade') - 0.2, { size: 210 });
  K.neonText(g, 'ARCADE BERISIK', 540, 190, { size: 44, color: P.cyan, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'koin berdenting, skor tertinggi dikejar', 540, 490, { size: 26, color: P.white, font: 'Space Mono', weight: 400 });
  // rings pulse
  for (let k = 0; k < 3; k++) {
    const u = lt - k * 0.4 - 0.2;
    if (u > 0 && u < 1.2) {
      const r = 200 + u * 500;
      g.beginPath(); g.ellipse(540, 1200, r, r * 0.32, 0, 0, Math.PI * 2);
      K.neon(g, k % 2 ? P.cyan : P.mag, 3 * (1 - u / 1.2), { alpha: 1 - u / 1.2 });
    }
  }
  K.crtOverlay(g);
});

// 5. Past doesn't return, but the light still shines
shot('akhir', (t, a, b) => {
  const lt = t - a;
  world(t, { speed: 0.8, pulse: 0.3 });
  K.glow(g, 540, 1150, 600, P.mag, 0.4);
  title('CAHAYA', 340, t, W('akhir', 'Masa') - 0.15, { size: 180 });
  K.neonText(g, 'MASA LALU TAK KEMBALI', 540, 180, { size: 36, color: P.pink, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'tapi cahayanya masih menyala', 540, 490, { size: 28, color: P.cyan, font: 'Space Mono', weight: 400 });
  K.crtOverlay(g);
});

export function render(t, AM) {
  const shot = SHOTS.find((s) => C[s.id] && t >= C[s.id].start - 0.12) || SHOTS[0];
  if (shot) shot.fn(t, span(shot.id)[0], span(shot.id)[1]);
}
