// Garis Tunggal demo3: "Tangan Satu Garis — Rahasia Lima Jari, Genggaman Kuat & Kelenturan Manusia"
import * as K from '/styles/garis-tunggal/kit.js';
const { clamp, lerp, ease, prog, env, noise } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1560, size: 50, maxWords: 5 } };

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

  const hookWave = K.spline([[110, 310], [210, 260], [300, 340], [380, 370], [440, 310], [400, 260], [340, 290], [380, 370], [500, 370], [540, 420]], 12);
  const toPalm = K.spline([[540, 420], [620, 500], [700, 640], [760, 820], [780, 960]], 10);
  const bases = [[300, 980], [420, 950], [540, 940], [660, 950], [780, 980]];
  const tips = [[250, 490], [380, 430], [520, 410], [660, 440], [800, 530]];
  const palmL = K.spline([[780, 960], [770, 1100], [700, 1250], [540, 1330], [380, 1280], [300, 1150], [290, 1000], bases[0]], 12);
  const palmR = K.spline([bases[4], [800, 1050], [810, 1180], [740, 1300], [600, 1360]], 10);
  const fist = K.spline([[600, 1360], [480, 1340], [360, 1280], [280, 1180], [260, 1050], [300, 950], [400, 900], [520, 890], [640, 910], [740, 970], [790, 1060], [780, 1180], [700, 1280]], 12);
  const waveMove = (t) => {
    const w = Math.sin((t - S.waveA) * 9) * 26 * env(t, S.waveA, S.waveB, 0.15, 0.15);
    return K.spline([[700, 1280], [780, 1180], [820, 1050], [830 + w, 900], [800 + w, 750], [760 + w, 620], [780 + w, 500]], 10);
  };
  const flourish = K.spline([[780, 500], [860, 420], [920, 480], [900, 600], [820, 660]], 8)
    .concat(K.arrowTip(820, 660, 2.2, 30).slice(1));

  const a0 = -0.4;
  S.waveA = C.lambai.start - 0.1; S.waveB = T('lambai', 0.85);
  L.add(hookWave, a0, C.hook.end - 0.1);
  L.add(toPalm, C.hook.end - 0.1, C.jari.start + 0.1);
  L.add(palmL, C.jari.start - 0.05, T('jari', 0.25));

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
  L.add(flourish, C.moral.start + 0.3, C.moral.end + 0.15, { col: K.PAL.red });

  S.labels = [
    ['01 · LIMA JARI TERBUKA', 540, 1435, T('jari', 0.3), T('genggam', 0.3)],
    ['02 · GENGGAMAN KUAT', 540, 1435, T('genggam', 0.3), T('lambai', 0.3)],
    ['03 · LAMBAIAN SAPAAN', 540, 1435, T('lambai', 0.3), 99],
  ];
}

function follow(t) {
  let x = 0, y = 0, n = 0;
  for (let k = 0; k < 6; k++) { const p = L.tip(t - k * 0.12); if (p) { x += p.x; y += p.y; n++; } }
  return n ? [x / n, y / n] : [540, 640];
}
function camAt(t) {
  const [fx0, fy0] = follow(t);
  const key = [
    [0, lerp(fx0, 420, 0.3), lerp(fy0, 340, 0.3), 1.35],
    [C.jari.start - 0.1, 540, 820, 1.15],
    [C.genggam.start, 540, 950, 1.02],
    [C.lambai.start, 560, 900, 0.96],
    [C.moral.start + 0.6, 560, 860, 0.9],
  ];
  let k = 0; for (let i = 0; i < key.length; i++) if (t >= key[i][0]) k = i;
  const cur = key[k], prev = key[Math.max(0, k - 1)], f = ease.inOutCubic(clamp((t - cur[0]) / 0.8));
  const cx = k === 0 ? cur[1] : lerp(prev[1], cur[1], f), cy = k === 0 ? cur[2] : lerp(prev[2], cur[2], f), z = k === 0 ? cur[3] : Math.exp(lerp(Math.log(prev[3]), Math.log(cur[3]), f));
  return [cx + (fx0 - cx) * 0.12 + Math.sin(t * 0.5) * 6, cy + (fy0 - cy) * 0.1, z];
}

export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z, 0, 820);
  K.paper(ctx);

  const d0 = ease.outBack(clamp((t + 0.4) / 0.3));
  ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(110, 310, 11 * d0, 0, Math.PI * 2); ctx.fill();
  const tip = L.draw(ctx, t);

  if (t > S.waveA && t < S.waveB + 0.3) {
    ctx.save(); ctx.strokeStyle = K.PAL.soft; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const o = ((t - S.waveA) * 200) % 50;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) { const xx = 880 + i * 40 + (o % 20); ctx.moveTo(xx, 560); ctx.lineTo(xx + 18, 520); }
    ctx.globalAlpha = env(t, S.waveA, S.waveB + 0.3, 0.1, 0.3) * 0.7; ctx.stroke(); ctx.restore();
  }

  for (const [s, lx, ly, a, b] of S.labels) {
    K.label(ctx, s, lx, ly, { a: env(t, a, b, 0.3, 0.3), size: 28, spacing: 5, col: s.includes('GENGGAMAN') ? K.PAL.red : K.PAL.soft });
  }
  if (tip) K.fineliner(ctx, tip[0], tip[1], { s: 1 / z, ang: -1.0 + noise.n2(t * 3, 1) * 0.05 });

  let step = 'TAHAP 01/05 · ANATOMI PERADABAN', title = 'TANGAN SATU GARIS (MONOLINE)', sub = 'ALAT TERHEBAT DALAM SEJARAH MANUSIA';
  if (t >= C.moral.start) {
    step = 'TAHAP 05/05 · DUA WATAK GARIS'; title = 'LENTUR MENYAPA · KUAT MENGGENGGAM'; sub = 'SATU GARIS YANG MENYATUKAN KEKUATAN DAN EMPATI';
  } else if (t >= C.lambai.start) {
    step = 'TAHAP 04/05 · MEMBUKA DIRI'; title = 'LAMBAIAN SAPAAN YANG HANGAT'; sub = 'GARIS MENGENDUR MENJADI BAHASA PERSAHABATAN';
  } else if (t >= C.genggam.start) {
    step = 'TAHAP 03/05 · KEPALAN MERAH'; title = 'GENGGAMAN ERAT PENUH TENAGA'; sub = 'IBU JARI MENGUNCI KEEMPAT JARI LAINNYA';
  } else if (t >= C.jari.start) {
    step = 'TAHAP 02/05 · LIMA JARI PRESISI'; title = 'IBU JARI HINGGA KELINGKING'; sub = 'DITARIK DARI SATU GARIS TANPA PUTUS';
  }
  K.headerCard(fx, step, title, sub);
  AM.lib.vignette(fx, { strength: 0.12, inner: 0.6, color: '80,60,40' });
}
