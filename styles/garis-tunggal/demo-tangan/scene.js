// Tangan Satu Garis: one unbroken line draws a hand — hook, 5 fingers, fist, wave, moral.
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

  // hook wave-in (full canvas scale)
  const hookWave = K.spline([[110, 250], [210, 200], [300, 300], [380, 330], [440, 270], [400, 210], [340, 250], [380, 330], [500, 330], [540, 400]], 12);
  // travel to palm base
  const toPalm = K.spline([[540, 400], [620, 480], [700, 620], [760, 800], [780, 950]], 10);
  // palm: wrist up left side, across knuckles via 5 K.finger segments, down right side
  // fingers fan across x 250..850, bases y~950, tips y~450-550
  const bases = [[300, 980], [420, 950], [540, 940], [660, 950], [780, 980]];
  const tips = [[250, 480], [380, 420], [520, 400], [660, 430], [800, 520]];
  const palmL = K.spline([[780, 950], [770, 1100], [700, 1250], [540, 1330], [380, 1280], [300, 1150], [290, 1000], bases[0]], 12);
  const palmR = K.spline([bases[4], [800, 1050], [810, 1180], [740, 1300], [600, 1360]], 10);
  // fist: red loop over knuckles (curl)
  const fist = K.spline([[600, 1360], [480, 1340], [360, 1280], [280, 1180], [260, 1050], [300, 950], [400, 900], [520, 890], [640, 910], [740, 970], [790, 1060], [780, 1180], [700, 1280]], 12);
  // wave travel: open up to the right, wiggle fingers
  const waveMove = (t) => {
    const w = Math.sin((t - S.waveA) * 9) * 26 * env(t, S.waveA, S.waveB, 0.15, 0.15);
    return K.spline([[700, 1280], [780, 1180], [820, 1050], [830 + w, 900], [800 + w, 750], [760 + w, 620], [780 + w, 500]], 10);
  };
  const flourish = K.spline([[780, 500], [860, 420], [920, 480], [900, 600], [820, 660]], 8)
    .concat(K.arrowTip(820, 660, 2.2, 30).slice(1));

  const a0 = -0.6;
  S.waveA = C.lambai.start - 0.1; S.waveB = T('lambai', 0.85);
  const fistFade = (t) => 1 - 0.0 * prog(t, 0, 1); // fist stays inked, red accent via col
  L.add(hookWave, a0, C.hook.end - 0.1);
  L.add(toPalm, C.hook.end - 0.1, C.jari.start + 0.1);
  L.add(palmL, C.jari.start - 0.05, T('jari', 0.25));
  // 5 fingers as K.finger segments, chained base->tip
  for (let i = 0; i < 5; i++) {
    const a = T('jari', 0.25 + i * 0.13), b = T('jari', 0.25 + (i + 1) * 0.13);
    const [bx, by] = bases[i], [tx, ty] = tips[i];
    L.add((t) => K.finger(bx, by, tx, ty, 64), a, b);
    if (i < 4) L.add(K.spline([[tx, ty], [(tx + tips[i + 1][0]) / 2, Math.min(ty, tips[i + 1][1]) - 60], bases[i + 1]], 6), b - 0.02, b + 0.06);
  }
  L.add(palmR, T('jari', 0.9), C.genggam.start + 0.1);
  L.add(fist, C.genggam.start - 0.05, T('genggam', 0.7), { col: K.PAL.red });
  L.add(K.spline([[700, 1280], [640, 1330], [600, 1360]], 6), T('genggam', 0.7), C.genggam.end + 0.05, { col: K.PAL.red });
  L.add(waveMove, C.lambai.start - 0.1, T('lambai', 0.85));
  L.add(flourish, W('moral', 'lentur') - 0.1, C.moral.end + 0.15, { col: K.PAL.red });
  S.labels = [
    ['LIMA JARI', 540, 1450, T('jari', 0.3), T('genggam', 0.3)],
    ['GENGGAMAN', 540, 1450, T('genggam', 0.3), T('lambai', 0.3)],
    ['LAMBAIAN · HALO', 540, 1450, T('lambai', 0.3), 99],
  ];
  S.hookEnd = hookWave[hookWave.length - 1];

  AM.sfx('pencil', 0.0, { gain: 0.3, pitch: 1.4 });
  AM.sfx('pop', T('jari', 0.9), { gain: 0.4, pitch: 1.2 });
  AM.sfx('chime', T('genggam', 0.7), { gain: 0.35 });
  AM.sfx('swoosh_up', C.lambai.start, { gain: 0.2, pitch: 1.4 });
  AM.sfx('ding', W('moral', 'lentur'), { gain: 0.3 });
}

// camera: follow the nib (smoothed), then pull back for the whole hand + end
function follow(t) {
  let x = 0, y = 0, n = 0;
  for (let k = 0; k < 6; k++) { const p = L.tip(t - k * 0.12); if (p) { x += p.x; y += p.y; n++; } }
  return n ? [x / n, y / n] : [540, 600];
}
function camAt(t) {
  const [fx0, fy0] = follow(t);
  const key = [
    [0, lerp(fx0, 420, 0.3), lerp(fy0, 300, 0.3), 1.45],
    [C.jari.start - 0.1, 540, 800, 1.2],
    [C.genggam.start, 540, 950, 1.05],
    [C.lambai.start, 560, 900, 1.0],
    [C.moral.start + 0.6, 560, 850, 0.92],
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
  if (t > S.waveA && t < S.waveB + 0.3) {
    ctx.save(); ctx.strokeStyle = K.PAL.soft; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const o = ((t - S.waveA) * 200) % 50;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) { const xx = 880 + i * 40 + (o % 20); ctx.moveTo(xx, 560); ctx.lineTo(xx + 18, 520); }
    ctx.globalAlpha = env(t, S.waveA, S.waveB + 0.3, 0.1, 0.3) * 0.7; ctx.stroke(); ctx.restore();
  }
  for (const [s, lx, ly, a, b] of S.labels) K.label(ctx, s, lx, ly, { a: env(t, a, b, 0.3, 0.3), col: s === 'GENGGAMAN' ? K.PAL.red : K.PAL.soft });
  if (tip) K.fineliner(ctx, tip[0], tip[1], { s: 1 / z, ang: -1.0 + noise.n2(t * 3, 1) * 0.05 });
  AM.lib.vignette(fx, { strength: 0.12, inner: 0.6, color: '80,60,40' });
}
