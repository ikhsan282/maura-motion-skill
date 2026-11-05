// Garis Tunggal demo2: "Burung Satu Garis — Bagaimana Satu Tarikan Kecil Melahirkan Kepakan Terbang Tinggi"
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

  const hookWave = K.spline([[300, 520], [380, 480], [460, 540], [520, 580], [560, 540], [540, 500], [500, 520], [540, 580], [620, 600], [660, 660]], 12);
  const beak = K.spline([[660, 660], [740, 640], [800, 670], [820, 710]], 8);
  const head = K.spline([[820, 710], [780, 800], [680, 840], [600, 800], [600, 710], [660, 660], [760, 670], [820, 710]], 12);
  const body = K.spline([[820, 710], [860, 820], [840, 970], [740, 1070], [600, 1080], [500, 1020], [470, 920]], 12);

  S.flapA = C.sayap.start + 0.3; S.flapB = T('sayap', 0.85);
  S.flap = (t) => (t > S.flapA && t < S.flapB ? (Math.sin((t - S.flapA) * 10) * 0.5 + 0.5) * 0.5 : 0);
  const wing = (t) => { const d = S.flap(t) * 110; return K.spline([[470, 920], [360, 880], [260, 800], [210, 680 - d], [260, 560 - d], [380, 520 - d], [500, 580]], 12); };
  const wing0 = wing(0);
  const toFlight = K.spline([wing0[wing0.length - 1], [600, 720], [700, 820], [760, 970], [740, 1070]], 10);
  const flight = K.spline([[740, 1070], [780, 1190], [840, 1300], [900, 1400]], 12).concat(K.arrowTip(900, 1400, 1.1, 30).slice(1));

  const a0 = -0.4;
  L.add(hookWave, a0, C.hook.end - 0.1);
  L.add(beak, C.paruh.start - 0.15, T('paruh', 0.55));
  S.beakPop = W('paruh', 'paruh') >= 0 ? W('paruh', 'paruh') : C.paruh.start + 1.5;
  L.add(head, T('paruh', 0.55), C.paruh.end + 0.05);
  L.add(body, C.paruh.end + 0.05, C.sayap.start + 0.4);
  L.add(wing, C.sayap.start + 0.4, T('sayap', 0.85));
  L.add(toFlight, T('sayap', 0.85), C.terbang.start + 0.3);
  L.add(flight, C.terbang.start + 0.3, C.moral.end + 0.15, { col: K.PAL.red });

  S.labels = [
    ['01 · PARUH & ARAH', 740, 560, S.beakPop, 99],
    ['02 · RENTANG SAYAP', 340, 920, C.sayap.start + 0.4, 99],
    ['03 · JALUR LEPAS LANDAS', 780, 1270, C.terbang.start + 0.3, 99],
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
    [0, lerp(fx0, 480, 0.3), lerp(fy0, 540, 0.3), 1.35],
    [C.paruh.start - 0.1, 640, 680, 1.22],
    [C.sayap.start, 520, 820, 1.08],
    [C.terbang.start - 0.2, 600, 950, 1.0],
    [C.moral.start + 0.6, 620, 950, 0.94],
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
  ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(300, 520, 11 * d0, 0, Math.PI * 2); ctx.fill();
  const tip = L.draw(ctx, t);

  if (t > S.beakPop) {
    const k = ease.outBack(clamp((t - S.beakPop) / 0.3), 3);
    const pulse = 1 + 0.12 * Math.sin((t - S.beakPop) * 8) * Math.exp(-(t - S.beakPop) * 0.5);
    ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(820, 710, 14 * k * pulse, 0, Math.PI * 2); ctx.fill();
  }

  if (t > S.flapA && t < S.flapB + 0.3) {
    ctx.save(); ctx.strokeStyle = K.PAL.soft; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const o = ((t - S.flapA) * 220) % 60;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) { const yy = 580 + ((i * 60 + o) % 220); ctx.moveTo(280, yy); ctx.lineTo(360 - (i % 2) * 30, yy); }
    ctx.globalAlpha = env(t, S.flapA, S.flapB + 0.3, 0.1, 0.3) * 0.6; ctx.stroke(); ctx.restore();
  }

  for (const [s, lx, ly, a, b] of S.labels) {
    K.label(ctx, s, lx, ly, { a: env(t, a, b, 0.3, 0.3), size: 28, spacing: 5, col: s.includes('LEPAS') ? K.PAL.red : K.PAL.soft });
  }
  if (tip) K.fineliner(ctx, tip[0], tip[1], { s: 1 / z, ang: -1.0 + noise.n2(t * 3, 1) * 0.05 });

  let step = 'TAHAP 01/05 · TITIK KEBERANIAN', title = 'BURUNG SATU GARIS (MONOLINE)', sub = 'DARI KERTAS KOSONG MENUJU ANGKASA';
  if (t >= C.moral.start) {
    step = 'TAHAP 05/05 · FILOSOFI GERAK'; title = 'SATU GARIS CUKUP UNTUK LEPAS LANDAS'; sub = 'MULAI DARI TARIKAN PERTAMA HARI INI';
  } else if (t >= C.terbang.start) {
    step = 'TAHAP 04/05 · ARUS UDARA HANGAT'; title = 'MELESAT NAIK DI JALUR MERAH'; sub = 'MOMENTUM MENGANGKAT TUBUH KE TINGGI';
  } else if (t >= C.sayap.start) {
    step = 'TAHAP 03/05 · RENTANG SAYAP'; title = 'KEPAKAN YANG MENANGKAP ANGIN'; sub = 'GARIS KONTINU BERGERAK HIDUP';
  } else if (t >= C.paruh.start) {
    step = 'TAHAP 02/05 · ARAH PANDANG'; title = 'PARUH DAN KEPALA MENATAP DEPAN'; sub = 'MENENTUKAN TUJUAN SEBELUM TERBANG';
  }
  K.headerCard(fx, step, title, sub);
  AM.lib.vignette(fx, { strength: 0.12, inner: 0.6, color: '80,60,40' });
}
