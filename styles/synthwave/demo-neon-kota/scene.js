// Synthwave demo-neon-kota: "MUDIK MALAM" — night drive on the toll road.
import * as K from '/styles/synthwave/kit.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';
const { clamp, lerp, ease, noise } = AM.lib;
const P = K.PAL;
export const meta = { fps: 24, captions: { preset: 'neon', y: 1470, size: 56, maxWords: 5 } };
let g;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
// 5 shots: grid+moon+mountains+dashboard = night-drive pattern
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};
export async function setup(AM) {
  g = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const w = (id, x) => { try { return W(id, x); } catch { return C[id] ? C[id].start + 0.3 : 0; } };
  AM.sfx('boom', w('hook', 'pulang'), { gain: 0.5 });
  AM.sfx('glitch', w('sepi', 'kilau'), { gain: 0.35 });
  AM.sfx('drum_hit', w('radio', 'gelombang'), { gain: 0.4 });
  AM.sfx('boom', w('akhir', 'sampai'), { gain: 0.55 });
}
// Neon moon disc with halo rings (replaces sun for night drive)
function moon(x, y, r, t, { alpha = 1, pulse = 0 } = {}) {
  K.glow(g, x, y, r * (2.2 + pulse * 0.5), P.cyan, 0.5 * alpha);
  for (let k = 1; k <= 3; k++) {
    g.save(); g.globalAlpha = (0.15 - k * 0.04) * alpha;
    g.beginPath(); g.arc(x, y, r + k * 60, 0, Math.PI * 2);
    g.strokeStyle = P.cyan; g.lineWidth = 1.5; g.stroke(); g.restore();
  }
  const S = 500, c = cached('sw-moon', () => {
    const o = makeCanvas(S, S), x2 = o.getContext('2d');
    const gr = x2.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    gr.addColorStop(0, '#e8f4ff'); gr.addColorStop(0.5, P.cyan);
    gr.addColorStop(0.85, '#1a4a6e'); gr.addColorStop(1, '#0a1a30');
    x2.fillStyle = gr; x2.beginPath(); x2.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2); x2.fill();
    return o;
  });
  g.save(); g.globalAlpha = alpha; g.drawImage(c, x - r, y - r, r * 2, r * 2); g.restore();
}
function world(t, { moonY = 220, moonR = 200, speed = 1.3, pulse = 0, mcol = P.mag } = {}) {
  K.sky(g, t);
  moon(540, moonY, moonR, t, { pulse });
  K.mountains(g, t, { color: mcol });
  K.grid(g, t, { speed, pulse });
}
function title(str, y, t, t0, opts = {}) {
  if (t < t0) return;
  const p = ease.outBack(clamp((t - t0) / 0.35), 1.6);
  K.chrome(g, str, 540, y, { scale: 0.6 + 0.4 * p, alpha: clamp((t - t0) / 0.15), ...opts });
}

// headlight beams + dashboard silhouette
function beams(t, { alpha = 0.5 } = {}) {
  g.save(); g.globalAlpha = alpha;
  for (const s of [-1, 1]) {
    g.save(); g.translate(540, 1920);
    const gr = g.createLinearGradient(0, 0, s * 220, -700);
    gr.addColorStop(0, P.yellow + 'cc'); gr.addColorStop(0.4, P.yellow + '44'); gr.addColorStop(1, 'transparent');
    g.fillStyle = gr; g.beginPath();
    g.moveTo(s * 10, 0); g.lineTo(s * 220, -700); g.lineTo(s * 130, -700); g.closePath(); g.fill();
    g.restore();
  }
  g.restore();
}
function dash(t, { alpha = 1 } = {}) {
  g.save(); g.globalAlpha = alpha;
  g.fillStyle = '#0d0520'; g.fillRect(0, 1700, 1080, 220);
  g.beginPath(); g.moveTo(0, 1700); g.lineTo(1080, 1700); K.neon(g, P.cyan, 3, { halo: 1 });
  g.save(); g.translate(540, 1820); g.scale(1.2, 0.6);
  g.beginPath(); g.arc(0, 0, 80, 0, Math.PI); K.neon(g, P.mag, 2); g.restore();
  g.save(); g.translate(540, 1820); g.rotate(-Math.PI * 0.7 + Math.sin(t * 0.3) * 0.05);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -75); K.neon(g, P.red, 2); g.restore();
  for (const l of [{ x: 200, c: P.green }, { x: 300, c: P.yellow }, { x: 740, c: P.cyan }, { x: 840, c: P.mag }])
    K.glow(g, l.x, 1780, 18, l.c, 0.7 + 0.3 * Math.sin(t * 2 + l.x));
  g.restore();
}

// 1. Hook — toll lamps, speed picks up
shot('hook', (t, a, b) => {
  const lt = t - a;
  world(t, { speed: 1.4, pulse: 0.3 });
  beams(t, { alpha: 0.4 });
  title('MUDIK', 330, t, W('hook', 'Lampu') - 0.15, { size: 230 });
  title('MALAM', 540, t, W('hook', 'malam') - 0.15, { size: 160 });
  K.neonText(g, 'LAMPU TOL BERDERET', 540, 180, { size: 40, color: P.cyan, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'malam memanggil pulang', 540, 700, { size: 30, color: P.white, font: 'Space Mono', weight: 400 });
  K.crtOverlay(g);
});

// 2. Sepi — quiet asphalt, steady speed
shot('sepi', (t, a, b) => {
  const lt = t - a;
  world(t, { speed: 2.0, pulse: 0.5, mcol: P.cyan });
  beams(t, { alpha: 0.5 }); dash(t, { alpha: 0.7 });
  title('SEPI', 320, t, W('sepi', 'Aspal') - 0.2, { size: 200, rim: P.cyan });
  K.neonText(g, 'ASPAL SEPI BERKILAU', 540, 190, { size: 44, color: P.yellow, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'grid neon menuntun laju', 540, 490, { size: 30, color: P.white, font: 'Space Mono', weight: 400 });
  K.crtOverlay(g, { lines: 0.18 });
});

// 3. Bulan — moon rises, night deepens
shot('bulan', (t, a, b) => {
  const lt = t - a;
  world(t, { moonY: lerp(280, 180, ease.outCubic(clamp(lt / 2))), moonR: 240, speed: 1.6, pulse: 0.4, mcol: P.violet });
  beams(t, { alpha: 0.6 }); dash(t, { alpha: 0.85 });
  title('BULAN', 320, t, W('bulan', 'Matahari') - 0.2, { size: 210, rim: P.cyan });
  K.neonText(g, 'BULAN NEON MENJAGA', 540, 190, { size: 46, color: P.cyan, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'matahari tenggelam, bulan menjaga', 540, 490, { size: 28, color: P.white, font: 'Space Mono', weight: 400 });
  K.crtOverlay(g, { lines: 0.25 });
});

// 4. Radio — dashboard full, music on
shot('radio', (t, a, b) => {
  const lt = t - a;
  world(t, { moonY: 170, moonR: 260, speed: 1.2, pulse: 0.3 });
  beams(t, { alpha: 0.5 }); dash(t, { alpha: 1 });
  title('RADIO', 320, t, W('radio', 'Radio') - 0.2, { size: 210, rim: P.mag });
  K.neonText(g, 'RADIO BERDENDANG', 540, 190, { size: 44, color: P.pink, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'rindu menumpang gelombang', 540, 490, { size: 26, color: P.white, font: 'Space Mono', weight: 400 });
  K.crtOverlay(g);
});

// 5. Sampai — village lights, arrived home
shot('akhir', (t, a, b) => {
  const lt = t - a;
  world(t, { moonY: 160, moonR: 280, speed: 0.6, pulse: 0.2, mcol: P.cyan });
  beams(t, { alpha: 0.3 }); dash(t, { alpha: 0.9 });
  K.glow(g, 540, 1150, 600, P.mag, 0.4);
  title('SAMPAI', 340, t, W('akhir', 'Lampu') - 0.15, { size: 180 });
  K.neonText(g, 'LAMPU KAMPUNG MENYALA', 540, 180, { size: 36, color: P.yellow, alpha: clamp(lt / 0.3) });
  K.neonText(g, 'mudik malam sampai juga', 540, 490, { size: 28, color: P.cyan, font: 'Space Mono', weight: 400 });
  K.crtOverlay(g);
});

export function render(t, AM) {
  const shot = SHOTS.find((s) => C[s.id] && t >= C[s.id].start - 0.12) || SHOTS[0];
  if (shot) shot.fn(t, span(shot.id)[0], span(shot.id)[1]);
}
