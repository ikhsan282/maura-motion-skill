// Tangan Satu Garis: one unbroken line draws a hand — fingers, fist, wave.
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

  // one continuous path: wave-in -> open hand w/ 5 fingers -> fist -> open wave -> flourish
  const lead = K.spline([[110, 250], [200, 210], [300, 290], [380, 320], [460, 300]], 10);
  // open hand: wrist up the left side, 5 finger spikes, down the right side
  const fingers = [[460, 300], [470, 480], [440, 620]];
  const tips = [[330, 700], [400, 640], [480, 620], [560, 640], [630, 700]];
  let hand = [...fingers];
  let base = fingers[fingers.length - 1];
  for (let i = 0; i < 5; i++) {
    const bx = 330 + i * 75, by = 700 - Math.sin(i / 4 * Math.PI) * 60;
    hand.push([bx, by - 40]);
    hand.push(tips[i]);
    hand.push([bx + 40, by - 30]);
    base = [bx + 40, by - 30];
  }
  hand.push([700, 640], [690, 480], [660, 420]);
  const openHand = K.spline(hand, 8);
  // fist: loop over the top, curl lines
  const fist = K.spline([[660, 420], [600, 380], [520, 370], [450, 390], [420, 440], [440, 500], [520, 520], [600, 510], [650, 470], [660, 420]], 10);
  const curls = K.spline([[660, 420], [620, 560], [540, 620], [460, 600], [420, 540]], 8);
  // wave: zigzag fingers + motion arcs
  const wave = K.spline([[420, 540], [380, 460], [440, 380], [520, 340], [620, 340], [700, 400], [720, 500], [680, 600]], 10);
  const wiggle = K.spline([[680, 600], [760, 560], [820, 480], [800, 380], [860, 300]], 8)
    .concat(K.arrowTip(860, 300, -1.1, 30).slice(1));

  L.add(lead, -0.6, C.hook.end - 0.1);
  L.add(openHand, C.jari.start - 0.15, T('jari', 0.9));
  L.add(fist, C.genggam.start - 0.1, T('genggam', 0.6), { col: K.PAL.red });
  L.add(curls, T('genggam', 0.6), C.genggam.end + 0.05);
  L.add(wave, C.lambai.start - 0.1, T('lambai', 0.8));
  L.add(wiggle, W('moral', 'lentur') - 0.1, C.moral.end + 0.15, { col: K.PAL.red });
  S.labels = [
    ['JARI', 480, 850, T('jari', 0.3), T('genggam', 0.3)],
    ['GENGGAM', 540, 700, T('genggam', 0.3), T('lambai', 0.3)],
    ['LAMBAIAN', 560, 750, T('lambai', 0.3), 99],
  ];
  S.waveA = C.lambai.start; S.waveB = C.lambai.end;

  AM.sfx('pencil', 0.0, { gain: 0.3, pitch: 1.4 });
  AM.sfx('pop', T('jari', 0.9), { gain: 0.4, pitch: 1.2 });
  AM.sfx('chime', T('genggam', 0.6), { gain: 0.35 });
  AM.sfx('swoosh_up', C.lambai.start, { gain: 0.2, pitch: 1.4 });
  AM.sfx('ding', W('moral', 'lentur'), { gain: 0.3 });
}

function follow(t) {
  let x = 0, y = 0, n = 0;
  for (let k = 0; k < 6; k++) { const p = L.tip(t - k * 0.12); if (p) { x += p.x; y += p.y; n++; } }
  return n ? [x / n, y / n] : [540, 600];
}
function camAt(t) {
  const [fx0, fy0] = follow(t);
  const key = [
    [0, lerp(fx0, 420, 0.3), lerp(fy0, 300, 0.3), 1.45],
    [C.jari.start - 0.1, 520, 560, 1.25],
    [C.genggam.start, 540, 520, 1.15],
    [C.lambai.start, 560, 520, 1.05],
    [C.moral.start + 0.6, 600, 560, 0.95],
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
  const d0 = ease.outBack(clamp((t + 0.6) / 0.3));
  ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(110, 250, 11 * d0, 0, Math.PI * 2); ctx.fill();
  const tip = L.draw(ctx, t);
  // motion ticks during wave
  if (t > S.waveA && t < S.waveB + 0.3) {
    ctx.save(); ctx.strokeStyle = K.PAL.soft; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const o = ((t - S.waveA) * 200) % 50;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) { const xx = 760 + i * 40 + (o % 20); ctx.moveTo(xx, 420); ctx.lineTo(xx + 18, 380); }
    ctx.globalAlpha = env(t, S.waveA, S.waveB + 0.3, 0.1, 0.3) * 0.7; ctx.stroke(); ctx.restore();
  }
  for (const [s, lx, ly, a, b] of S.labels) K.label(ctx, s, lx, ly, { a: env(t, a, b, 0.3, 0.3), col: s === 'GENGGAM' ? K.PAL.red : K.PAL.soft });
  if (tip) K.fineliner(ctx, tip[0], tip[1], { s: 1 / z, ang: -1.0 + noise.n2(t * 3, 1) * 0.05 });
  AM.lib.vignette(fx, { strength: 0.12, inner: 0.6, color: '80,60,40' });
}
