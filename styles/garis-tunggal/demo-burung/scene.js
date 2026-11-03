// Garis Tunggal demo-burung: "Burung Satu Garis" — one unbroken line draws a bird.
// A red dot starts the line, it curves into a small beak, loops into the head, sweeps down the body,
// out one wing and back, then the wing flaps (a moving segment) and the line arcs upward into a flight
// path with an arrowhead. The camera follows the nib, then pulls back to show the whole bird mid-flight.
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

  // geometry — one continuous line: beak -> head -> body -> wing (flap) -> flight path
  const beak = K.spline([[110, 250], [250, 210], [330, 250], [360, 300]], 8);
  const head = K.spline([[360, 300], [300, 360], [210, 360], [180, 300], [210, 250], [300, 240], [380, 300]], 12);
  const body = K.spline([[380, 300], [470, 340], [520, 430], [470, 520], [380, 540], [300, 520], [260, 460]], 12);
  // wing: from body, out and back (flap) — w(t) moves the wing tip up/down
  S.flapA = C.sayap.start + 0.4; S.flapB = C.sayap.end + 0.1;
  S.flap = (t) => (t > S.flapA && t < S.flapB ? (Math.sin((t - S.flapA) * 6) * 0.5 + 0.5) * 0.5 : 0);
  const wing = (t) => { const d = S.flap(t) * 60; return K.spline([[260, 460], [180, 400], [120, 340], [100, 260 + d], [150, 180 + d], [230, 170 + d], [300, 200]], 12); };
  const wing0 = wing(0);
  const toFlight = K.spline([wing0[wing0.length - 1], [360, 200], [430, 160], [520, 140]], 10);
  const flight = K.spline([[520, 140], [640, 120], [760, 150], [880, 110], [980, 90]], 12).concat(K.arrowTip(980, 90, -0.35, 30).slice(1));

  // schedule
  const a0 = -0.6;
  L.add(beak, a0, C.paruh.start + 0.05);
  L.add(head, C.paruh.start + 0.05, C.paruh.end + 0.05);
  L.add(body, C.paruh.end + 0.05, C.sayap.start + 0.2);
  L.add(wing, C.sayap.start + 0.2, C.sayap.end + 0.1);
  L.add(toFlight, C.sayap.end + 0.1, C.terbang.start + 0.2);
  L.add(flight, C.terbang.start + 0.2, C.moral.end + 0.15, { col: K.PAL.red });
  S.labels = [
    ['PARUH', 300, 350, W('paruh', 'paruh') - 0.1, 99],
    ['SAYAP', 140, 300, C.sayap.start + 0.3, 99],
    ['TERBANG', 760, 210, C.terbang.start + 0.3, 99],
  ];

  AM.sfx('pencil', 0.0, { gain: 0.3, pitch: 1.4 });
  AM.sfx('pop', W('paruh', 'paruh') - 0.1, { gain: 0.4, pitch: 1.2 });
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
    [0, lerp(fx0, 300, 0.4), lerp(fy0, 300, 0.4), 1.6],
    [C.paruh.start, 300, 330, 1.5],
    [C.sayap.start, 280, 360, 1.3],
    [C.terbang.start, 450, 300, 1.1],
    [C.moral.start + 0.6, 560, 260, 0.95],
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
  // red start dot
  const d0 = ease.outBack(clamp((t + 0.6) / 0.3));
  ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(110, 250, 11 * d0, 0, Math.PI * 2); ctx.fill();
  const tip = L.draw(ctx, t);
  // flap ticks while the wing flaps
  if (t > S.flapA && t < S.flapB + 0.3) { ctx.save(); ctx.strokeStyle = K.PAL.soft; ctx.lineWidth = 3; ctx.lineCap = 'round'; const o = ((t - S.flapA) * 260) % 60;
    ctx.beginPath(); for (let i = 0; i < 5; i++) { const yy = 460 + ((i * 60 + o) % 220); ctx.moveTo(480, yy); ctx.lineTo(560 - (i % 2) * 30, yy); } ctx.globalAlpha = env(t, S.flapA, S.flapB + 0.3, 0.1, 0.3) * 0.6; ctx.stroke(); ctx.restore(); }
  for (const [s, lx, ly, a, b] of S.labels) K.label(ctx, s, lx, ly, { a: env(t, a, b, 0.3, 0.3), col: s === 'TERBANG' ? K.PAL.red : K.PAL.soft });
  if (tip) K.fineliner(ctx, tip[0], tip[1], { s: 1 / z, ang: -1.0 + noise.n2(t * 3, 1) * 0.05 });
  AM.lib.vignette(fx, { strength: 0.12, inner: 0.6, color: '80,60,40' });
}
