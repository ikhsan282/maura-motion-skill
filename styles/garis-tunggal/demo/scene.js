// Garis Tunggal demo (19 s): "Lingkaran Kebiasaan" — one unbroken line.
// A red dot starts a line that wanders, loops, draws a phone (the cue, red notification), flows into a hand
// that reaches and scrolls (the routine), into a smiling face and a red heart (the reward), and circles back
// to the phone: the habit loop. Then the hand fades and the same line draws an open book instead; at the end
// the line bends away in red. The camera follows the nib, then pulls back to show the whole loop.
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

  // geometry
  const PH = { x: 540, y: 560 };
  const phone = K.phone(PH.x, PH.y, 1);
  const FB = [900, 1170], FT = [592, 668];
  const handFn = (t) => { const d = S.thumb(t) * 70; return K.finger(FB[0], FB[1], FT[0] + d * 0.62, FT[1] + d * 0.78); };
  const hand0 = K.finger(FB[0], FB[1], FT[0], FT[1]);
  const faceP = K.face(300, 1010, 100), heartP = K.heart(430, 860, 0.85);
  const book = K.book(760, 990, 0.85);
  // the travelling bits between pictures
  const hookWave = K.spline([[110, 250], [210, 200], [300, 300], [380, 330], [440, 270], [400, 210], [340, 250], [380, 330], [500, 330], [540, 400]], 12);
  const toHand = K.spline([phone[phone.length - 1], [720, 420], [880, 640], [960, 1000], hand0[0]], 10);
  const handEnd = (t) => { const h = handFn(t); return h[h.length - 1]; };
  const toFace = (t) => K.spline([handEnd(t), [800, 1230], [560, 1210], [360, 1170], [200, 1080], [200, 940], [300, 910]], 10);
  const faceEnd = faceP[faceP.length - 1];
  const toHeart = K.spline([faceEnd, [400, 990], [440, 930], heartP[0]], 8);
  const loopBack = K.spline([heartP[heartP.length - 1], [380, 760], [200, 760], [150, 600], [230, 470], [330, 440], [440, 470]], 12).concat(K.arrowTip(440, 470, 0.25, 28).slice(1));
  const toBook = K.spline([[440, 470], [560, 330], [700, 360], [740, 520], [760, 760], [800, 900], book[0]], 12);
  const bookEnd = book[book.length - 1];
  const bend = K.spline([bookEnd, [900, 1060], [990, 1010], [1010, 880], [990, 700], [1040, 560]], 12).concat(K.arrowTip(1040, 560, -1.2, 30).slice(1));

  // schedule
  const a0 = -0.6;
  S.thumb = (t) => (t > S.scrollA && t < S.scrollB ? (Math.sin((t - S.scrollA) * 12) * 0.5 + 0.5) * 0.5 : 0);
  L.add(hookWave, a0, C.hook.end - 0.1);
  L.add(phone, C.pemicu.start - 0.15, T('pemicu', 0.75));
  S.notif = W('pemicu', 'pemicu') - 0.1;
  L.add(toHand, C.rutin.start - 0.15, C.rutin.start + 0.2);
  const handA = C.rutin.start + 0.2, handB = T('rutin', 0.38);
  S.scrollA = handB; S.scrollB = T('rutin', 0.62);
  const hFade = (t) => 1 - 0.82 * prog(t, T('ganti', 0.35), T('ganti', 0.6));
  L.add(handFn, handA, handB, { fade: hFade });
  L.add(toFace, T('rutin', 0.42), T('rutin', 0.55), { fade: hFade });
  L.add(faceP, T('rutin', 0.55), T('rutin', 0.78));
  S.eyes = T('rutin', 0.7);
  L.add(toHeart, T('rutin', 0.78), T('rutin', 0.84));
  L.add(heartP, T('rutin', 0.84), T('rutin', 0.98), { col: K.PAL.red });
  L.add(loopBack, C.rutin.end, C.ganti.start + 0.15);
  L.add(toBook, T('ganti', 0.45), T('ganti', 0.7));
  L.add(book, T('ganti', 0.7), C.ganti.end + 0.05);
  L.add(bend, W('moral', 'belokkan') - 0.1, C.moral.end + 0.15, { col: K.PAL.red });
  S.labels = [
    ['PEMICU', 760, 430, W('pemicu', 'pemicu') - 0.1, 99],
    ['RUTINITAS', 760, 1300, T('rutin', 0.3), T('ganti', 0.45)],
    ['HADIAH', 300, 1180, T('rutin', 0.85), 99],
    ['BACA BUKU', 760, 1235, T('ganti', 0.85), 99],
  ];

  AM.sfx('pencil', 0.0, { gain: 0.3, pitch: 1.4 });
  AM.sfx('pop', S.notif, { gain: 0.45, pitch: 1.2 });
  AM.sfx('swoosh_up', S.scrollA, { gain: 0.2, pitch: 1.5 });
  AM.sfx('chime', T('rutin', 0.88), { gain: 0.35 });
  AM.sfx('whoosh', C.rutin.end, { gain: 0.2, pitch: 0.8 });
  AM.sfx('pencil', T('ganti', 0.7), { gain: 0.25, pitch: 1.2 });
  AM.sfx('ding', W('moral', 'belokkan'), { gain: 0.3 });
}

// camera: follow the nib (smoothed), then pull back for the loop and the end
function follow(t) {
  let x = 0, y = 0, n = 0;
  for (let k = 0; k < 6; k++) { const p = L.tip(t - k * 0.12); if (p) { x += p.x; y += p.y; n++; } }
  return n ? [x / n, y / n] : [540, 600];
}
function camAt(t) {
  const [fx0, fy0] = follow(t);
  const key = [
    [0, lerp(fx0, 420, 0.3), lerp(fy0, 300, 0.3), 1.45],
    [C.pemicu.start - 0.1, 560, 600, 1.3],
    [C.rutin.start, 560, 780, 1.12],
    [C.rutin.end - 0.2, 590, 760, 1.04],
    [C.moral.start + 0.6, 610, 760, 0.98],
  ];
  let k = 0; for (let i = 0; i < key.length; i++) if (t >= key[i][0]) k = i;
  const cur = key[k], prev = key[Math.max(0, k - 1)], f = ease.inOutCubic(clamp((t - cur[0]) / 0.7));
  const cx = k === 0 ? cur[1] : lerp(prev[1], cur[1], f), cy = k === 0 ? cur[2] : lerp(prev[2], cur[2], f), z = k === 0 ? cur[3] : Math.exp(lerp(Math.log(prev[3]), Math.log(cur[3]), f));
  // keep a little of the nib in the framing (alive), plus a slow drift
  return [cx + (fx0 - cx) * 0.12 + Math.sin(t * 0.5) * 6, cy + (fy0 - cy) * 0.1, z * (1 + 0.004 * t)];
}

export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.paper(ctx);
  // red start dot: the first small line
  const d0 = ease.outBack(clamp((t + 0.6) / 0.3));
  ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(110, 250, 11 * d0, 0, Math.PI * 2); ctx.fill();
  const tip = L.draw(ctx, t);
  if (t > S.eyes) K.faceEyes(ctx, 300, 1010, 100, ease.outBack(clamp((t - S.eyes) / 0.25)));
  // notification dot on the phone
  if (t > S.notif) { const k = ease.outBack(clamp((t - S.notif) / 0.3), 3); const pulse = 1 + 0.12 * Math.sin((t - S.notif) * 8) * Math.exp(-(t - S.notif) * 0.8);
    ctx.fillStyle = K.PAL.red; ctx.beginPath(); ctx.arc(628, 404, 20 * k * pulse, 0, Math.PI * 2); ctx.fill(); }
  // scroll ticks while the thumb scrolls
  if (t > S.scrollA && t < S.scrollB + 0.3) { ctx.save(); ctx.strokeStyle = K.PAL.soft; ctx.lineWidth = 3; ctx.lineCap = 'round'; const o = ((t - S.scrollA) * 260) % 60;
    ctx.beginPath(); for (let i = 0; i < 5; i++) { const yy = 460 + ((i * 60 + o) % 220); ctx.moveTo(480, yy); ctx.lineTo(560 - (i % 2) * 30, yy); } ctx.globalAlpha = env(t, S.scrollA, S.scrollB + 0.3, 0.1, 0.3) * 0.6; ctx.stroke(); ctx.restore(); }
  for (const [s, lx, ly, a, b] of S.labels) K.label(ctx, s, lx, ly, { a: env(t, a, b, 0.3, 0.3), col: s === 'BACA BUKU' ? K.PAL.red : K.PAL.soft });
  if (tip) K.fineliner(ctx, tip[0], tip[1], { s: 1 / z, ang: -1.0 + noise.n2(t * 3, 1) * 0.05 });
  AM.lib.vignette(fx, { strength: 0.12, inner: 0.6, color: '80,60,40' });
}
