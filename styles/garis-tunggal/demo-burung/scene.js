// Garis Tunggal demo-burung (rebuild): "Burung Satu Garis" — one unbroken line.
// A red dot starts a line that curls into a small beak, loops into the head, sweeps down the body,
// spreads into a wide wing that flaps (moving segment), then arcs upward into a flight path in red.
// The camera follows the nib, then pulls back to show the whole bird mid-flight.
import * as K from '/styles/garis-tunggal/kit.js';
const { clamp, lerp, ease, prog, env, noise } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1470, size: 56 } };

let ctx, fx;
const C = {};
const T = (id, f = 0) => C[id].start + f * (C[id].end - C[id].start);
const W = (id, w) => AM.wordTime(id, w);
const L = new K.Line();
const S = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // geometry — full-canvas coords (x 200-900, y 400-1400), one continuous line
  const hookWave = K.spline([[300, 500], [380, 460], [460, 520], [520, 560], [560, 520], [540, 480], [500, 500], [540, 560], [620, 580], [660, 640]], 12);
  const beak = K.spline([[660, 640], [740, 620], [800, 650], [820, 690]], 8);
  const head = K.spline([[820, 690], [780, 780], [680, 820], [600, 780], [600, 690], [660, 640], [760, 650], [820, 690]], 12);
  const body = K.spline([[820, 690], [860, 800], [840, 950], [740, 1050], [600, 1060], [500, 1000], [470, 900]], 12);
  // wing: from body, out wide and back — tip flaps with t
  S.flapA = C.sayap.start + 0.3; S.flapB = T('sayap', 0.75);
  S.flap = (t) => (t > S.flapA && t < S.flapB ? (Math.sin((t - S.flapA) * 10) * 0.5 + 0.5) * 0.5 : 0);
  const wing = (t) => { const d = S.flap(t) * 110; return K.spline([[470, 900], [360, 860], [260, 780], [210, 660 - d], [260, 540 - d], [380, 500 - d], [500, 560]], 12); };
  const wing0 = wing(0);
  const toFlight = K.spline([wing0[wing0.length - 1], [600, 700], [700, 800], [760, 950], [740, 1050]], 10);
  const flight = K.spline([[740, 1050], [780, 1180], [840, 1300], [900, 1400]], 12).concat(K.arrowTip(900, 1400, 1.1, 30).slice(1));

  // schedule
  const a0 = -0.6;
  L.add(hookWave, a0, C.hook.end - 0.1);
  L.add(beak, C.paruh.start - 0.15, T('paruh', 0.6));
  S.beakPop = W('paruh', 'paruh') - 0.1;
  L.add(head, T('paruh', 0.6), C.paruh.end + 0.05);
  L.add(body, C.paruh.end + 0.05, C.sayap.start + 0.2);
  L.add(wing, C.sayap.start + 0.2, T('sayap', 0.8));
  L.add(toFlight, T('sayap', 0.8), C.terbang.start + 0.2);
  L.add(flight, C.terbang.start + 0.2, C.moral.end + 0.15, { col: K.PAL.red });
  S.labels = [
    ['PARUH KECIL', 740, 540, W('paruh', 'paruh') - 0.1, 99],
    ['SAYAP LEBAR', 340, 900, C.sayap.start + 0.3, 99],
    ['TERBANG TINGGI', 830, 1250, C.terbang.start + 0.3, 99],
  ];

  AM.sfx('pencil', 0.0, { gain: 0.3, pitch: 1.4 });
  AM.sfx('pop', S.beakPop, { gain: 0.45, pitch: 1.2 });
  AM.sfx('swoosh_up', S.flapA, { gain: 0.2, pitch: 1.5 });
  AM.sfx('whoosh', C.sayap.end, { gain: 0.2, pitch: 0.8 });
  AM.sfx('ding', W('moral', 'lepas'), { gain: 0.3 });
}

// camera: follow the nib (smoothed), then pull back for the flight
function follow(t) {
  let x = 0, y = 0, n = 0;
  for (let k = 0; k < 6; k++) { const p = L.tip(t - k * 0.12); if (p) { x += p.x; y += p.y; n++; } }
  return n ? [x / n, y / n] : [540, 600];
}
function camAt(t) {
  const [fx0, fy0] = follow(t);
  const key = [
    [0, lerp(fx0, 480, 0.3), lerp(fy0, 520, 0.3), 1.45],
    [C.paruh.start - 0.1, 640, 660, 1.3],
    [C.sayap.start, 520, 800, 1.12],
    [C.terbang.start - 0.2, 600, 950, 1.04],
    [C.moral.start + 0.6, 620, 950, 0.98],
  ];
  let k = 0; for (let i = 0; i < key.length; i++) if (t >= key[i][0]) k = i;
  const cur = key[k], prev = key[Math.max(0, k - 1)], f = ease.inOutCubic(clamp((t - cur[0]) / 0.7));
  const cx = k === 0 ? cur[1] : lerp(prev[1], cur[1], f), cy = k === 0 ? cur[2] : lerp(prev[2], cur[2], f), z = k === 0 ? cur[3] : Math.exp(lerp(Math.log(prev[3]), Math.log(cur[3]), f));
  return [cx + (fx0 - cx) * 0.12 + Math.sin(t * 0.5) * 6, cy + (fy0 - cy) * 0.1, z * (1 + 0.004 * t)];
}

export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.paper(ctx);
  // red start dot: the first small line
  const d0 = ease.outBack(clamp((t + 0.6) / 0.3));
  ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(300, 500, 11 * d0, 0, Math.PI * 2); ctx.fill();
  const tip = L.draw(ctx, t);
  // beak pop dot
  if (t > S.beakPop) { const k = ease.outBack(clamp((t - S.beakPop) / 0.3), 3); const pulse = 1 + 0.12 * Math.sin((t - S.beakPop) * 8) * Math.exp(-(t - S.beakPop) * 0.8);
    ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(820, 690, 14 * k * pulse, 0, Math.PI * 2); ctx.fill(); }
  // flap ticks while the wing flaps
  if (t > S.flapA && t < S.flapB + 0.3) { ctx.save(); ctx.strokeStyle = K.PAL.soft; ctx.lineWidth = 3; ctx.lineCap = 'round'; const o = ((t - S.flapA) * 260) % 60;
    ctx.beginPath(); for (let i = 0; i < 5; i++) { const yy = 560 + ((i * 60 + o) % 220); ctx.moveTo(280, yy); ctx.lineTo(360 - (i % 2) * 30, yy); } ctx.globalAlpha = env(t, S.flapA, S.flapB + 0.3, 0.1, 0.3) * 0.6; ctx.stroke(); ctx.restore(); }
  for (const [s, lx, ly, a, b] of S.labels) K.label(ctx, s, lx, ly, { a: env(t, a, b, 0.3, 0.3), col: s === 'TERBANG TINGGI' ? K.PAL.red : K.PAL.soft });
  if (tip) K.fineliner(ctx, tip[0], tip[1], { s: 1 / z, ang: -1.0 + noise.n2(t * 3, 1) * 0.05 });
  AM.lib.vignette(fx, { strength: 0.12, inner: 0.6, color: '80,60,40' });
}
