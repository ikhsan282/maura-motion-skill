// Garis Tunggal demo1: "Lingkaran Kebiasaan — Mengapa Otak Sulit Memutus Rutinitas tapi Mudah Membelokkannya"
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

  const PH = { x: 540, y: 580 };
  const phone = K.phone(PH.x, PH.y, 1);
  const FB = [900, 1170], FT = [592, 688];
  const handFn = (t) => { const d = S.thumb(t) * 70; return K.finger(FB[0], FB[1], FT[0] + d * 0.62, FT[1] + d * 0.78); };
  const hand0 = K.finger(FB[0], FB[1], FT[0], FT[1]);
  const faceP = K.face(300, 1020, 100), heartP = K.heart(430, 870, 0.85);
  const book = K.book(760, 1000, 0.85);

  const hookWave = K.spline([[110, 310], [210, 260], [300, 340], [380, 370], [440, 310], [400, 260], [340, 290], [380, 370], [500, 370], [540, 420]], 12);
  const toHand = K.spline([phone[phone.length - 1], [720, 440], [880, 660], [960, 1000], hand0[0]], 10);
  const handEnd = (t) => { const h = handFn(t); return h[h.length - 1]; };
  const toFace = (t) => K.spline([handEnd(t), [800, 1230], [560, 1210], [360, 1170], [200, 1090], [200, 950], [300, 920]], 10);
  const faceEnd = faceP[faceP.length - 1];
  const toHeart = K.spline([faceEnd, [400, 1000], [440, 940], heartP[0]], 8);
  const loopBack = K.spline([heartP[heartP.length - 1], [380, 770], [200, 770], [150, 610], [230, 490], [330, 460], [440, 490]], 12).concat(K.arrowTip(440, 490, 0.25, 28).slice(1));
  const toBook = K.spline([[440, 490], [560, 350], [700, 380], [740, 540], [760, 770], [800, 910], book[0]], 12);
  const bookEnd = book[book.length - 1];
  const bend = K.spline([bookEnd, [900, 1070], [990, 1020], [1010, 890], [990, 710], [1040, 570]], 12).concat(K.arrowTip(1040, 570, -1.2, 30).slice(1));

  const a0 = -0.4;
  S.thumb = (t) => (t > S.scrollA && t < S.scrollB ? (Math.sin((t - S.scrollA) * 10) * 0.5 + 0.5) * 0.5 : 0);
  L.add(hookWave, a0, C.hook.end - 0.1);
  L.add(phone, C.pemicu.start - 0.15, T('pemicu', 0.75));
  S.notif = W('pemicu', 'pemicu.') >= 0 ? W('pemicu', 'pemicu.') : C.pemicu.start + 1.2;
  L.add(toHand, C.rutin.start - 0.15, C.rutin.start + 0.6);
  const handA = C.rutin.start + 0.6, handB = T('rutin', 0.38);
  S.scrollA = handB; S.scrollB = T('rutin', 0.65);
  const hFade = (t) => 1 - 0.82 * prog(t, T('ganti', 0.35), T('ganti', 0.6));
  L.add(handFn, handA, handB, { fade: hFade });
  L.add(toFace, T('rutin', 0.42), T('rutin', 0.55), { fade: hFade });
  L.add(faceP, T('rutin', 0.55), T('rutin', 0.78));
  S.eyes = T('rutin', 0.7);
  L.add(toHeart, T('rutin', 0.78), T('rutin', 0.84));
  L.add(heartP, T('rutin', 0.84), T('rutin', 0.98), { col: K.PAL.red });
  L.add(loopBack, C.rutin.end, C.ganti.start + 0.4);
  L.add(toBook, T('ganti', 0.45), T('ganti', 0.7));
  L.add(book, T('ganti', 0.7), C.ganti.end + 0.05);
  L.add(bend, W('moral', 'belokkan') - 0.1, C.moral.end + 0.15, { col: K.PAL.red });

  S.labels = [
    ['01 · PEMICU', 760, 440, S.notif, 99],
    ['02 · RUTINITAS', 760, 1300, T('rutin', 0.3), T('ganti', 0.45)],
    ['03 · HADIAH DOPAMIN', 300, 1185, T('rutin', 0.85), 99],
    ['RUTINITAS BARU: BACA BUKU', 760, 1245, T('ganti', 0.85), 99],
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
    [C.pemicu.start - 0.1, 560, 620, 1.22],
    [C.rutin.start, 560, 780, 1.08],
    [C.rutin.end - 0.2, 590, 760, 1.0],
    [C.moral.start + 0.6, 610, 760, 0.94],
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
  if (t > S.eyes) K.faceEyes(ctx, 300, 1020, 100, ease.outBack(clamp((t - S.eyes) / 0.25)));

  if (t > S.notif) {
    const k = ease.outBack(clamp((t - S.notif) / 0.3), 3);
    const pulse = 1 + 0.12 * Math.sin((t - S.notif) * 8) * Math.exp(-(t - S.notif) * 0.4);
    ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(628, 424, 20 * k * pulse, 0, Math.PI * 2); ctx.fill();
  }

  if (t > S.scrollA && t < S.scrollB + 0.3) {
    ctx.save(); ctx.strokeStyle = K.PAL.soft; ctx.lineWidth = 3; ctx.lineCap = 'round';
    const o = ((t - S.scrollA) * 220) % 60;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) { const yy = 480 + ((i * 60 + o) % 220); ctx.moveTo(480, yy); ctx.lineTo(560 - (i % 2) * 30, yy); }
    ctx.globalAlpha = env(t, S.scrollA, S.scrollB + 0.3, 0.1, 0.3) * 0.6; ctx.stroke(); ctx.restore();
  }

  for (const [s, lx, ly, a, b] of S.labels) {
    K.label(ctx, s, lx, ly, { a: env(t, a, b, 0.3, 0.3), size: 28, spacing: 5, col: s.includes('BUKU') ? K.PAL.red : K.PAL.soft });
  }
  if (tip) K.fineliner(ctx, tip[0], tip[1], { s: 1 / z, ang: -1.0 + noise.n2(t * 3, 1) * 0.05 });

  // Top header banner on fx layer
  let step = 'TAHAP 01/05 · TITIK AWAL', title = 'LINGKARAN KEBIASAAN (HABIT LOOP)', sub = 'SATU GARIS SARAF YANG TAK TERPUTUS';
  if (t >= C.moral.start) {
    step = 'TAHAP 05/05 · BELOKAN KEPUTUSAN'; title = 'JANGAN DIPUTUS, CUKUP BELOKKAN'; sub = 'UBAH ARAH GARIS MENUJU KEBIASAAN BARU';
  } else if (t >= C.ganti.start) {
    step = 'TAHAP 04/05 · REKAYASA ULANG'; title = 'GANTI RUTINITAS: BUKA BUKU'; sub = 'PEMICU TETAP SAMA · TINDAKAN DIGANTI';
  } else if (t >= C.rutin.start) {
    step = 'TAHAP 03/05 · RUTINITAS & HADIAH'; title = 'GULIR LAYAR → PERCIKAN DOPAMIN'; sub = 'LINGKARAN MENGUNCI DIRI KEMBALI KE PEMICU';
  } else if (t >= C.pemicu.start) {
    step = 'TAHAP 02/05 · SINYAL PEMICU (CUE)'; title = 'TITIK MERAH NOTIFIKASI PONSEL'; sub = 'MEMANCING PERHATIAN MATA DALAM SEKEJAP';
  }
  K.headerCard(fx, step, title, sub);
  AM.lib.vignette(fx, { strength: 0.12, inner: 0.6, color: '80,60,40' });
}
