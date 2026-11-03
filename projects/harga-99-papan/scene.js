// Papan Tulis Kapur: "Kenapa harga selalu berakhir 99?" (7 shots).
// Guru + murid kapur, price tags 99.000 vs 100.000, digit-kiri highlight, sinyal diskon, label toko.
import * as K from '/styles/papan-tulis-kapur/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;
const { G } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'chalk', y: 1450, size: 70 } };

const BOARD = [44, 70, 1920, 1560];
let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const ART = [];
const pen = new K.Pen();
const S = {};
const T = (id, f = 0) => C[id].start + f * (C[id].end - C[id].start);

const STUDENTS = [
  { x: 395, hair: 'spiky' }, { x: 540, hair: 'pony' }, { x: 685, hair: 'cap' }, { x: 830, hair: 'bun' }, { x: 975, hair: 'tuft', glasses: true },
];
const FLOOR = 1330;
function studentPose(i, t) {
  const st = STUDENTS[i], ph = t * 2 + i * 1.3;
  let face = 'smile', arms = [[0.25, 0.15], [-0.25, -0.15]], jump = 0, look = 0, tilt = Math.sin(ph) * 0.05, mouth = 0;
  const wow1 = T('hook', 0.85), wow2 = W('beda', 'seribu') || C.beda.start;
  if (t > wow1 && t < C.kiri.start) { face = 'shock'; arms = [[2.6, 0.3], [-2.6, -0.3]]; jump = Math.max(0, Math.sin((t - wow1) * 9 + i)) * 18 * Math.exp(-(t - wow1) * 1.5); }
  if (t >= C.digit.start && t < C.diskon.start) { face = i === 2 ? 'skeptic' : 'open'; look = i < 2 ? 0.5 : -0.4; mouth = 0.3 * Math.abs(Math.sin(t * 8 + i)); }
  if (t >= C.cek.start) { face = 'happy'; look = 0.6; arms = [[2.7 + Math.sin(t * 10 + i) * 0.2, 0.2], [-2.7 - Math.sin(t * 10 + i) * 0.2, -0.2]]; jump = Math.abs(Math.sin((t - C.cek.start) * 7 + i * 0.9)) * 30; }
  return { x: st.x, y: FLOOR - jump, s: 0.74, hair: st.hair, glasses: st.glasses, face, arms, look, tilt, mouth, blink: ((t + i * 0.7) % 3.3) < 0.1 ? 1 : 0 };
}
function teacherPose(t) {
  let arms = [[2.0, 0.2], [-0.5, -0.4]], face = 'grin', mouth = 0, lean = 0;
  const talk = (a, b) => (t > a && t < b ? 0.5 + 0.5 * Math.sin(t * 17) : 0);
  if (t < T('hook', 0.8)) arms = [[1.95 + Math.sin(t * 3) * 0.05, 0.15], [-0.5, -0.4]];
  else if (t < C.kiri.start) { arms = [[2.25, -0.05], [-0.4, -0.3]]; lean = 0.06; }
  else if (t < C.digit.start) { arms = [[0.9, -1.8], [-0.9, 1.8]]; face = 'smile'; }
  else if (t < C.cek.start) { arms = [[2.1 + Math.sin(t * 4) * 0.1, 0.1], [-0.7, -0.6]]; face = 'open'; lean = 0.05; }
  else { arms = [[2.8, 0.2], [-2.8, -0.2]]; face = 'happy'; }
  mouth = talk(0.3, C.kiri.end) + talk(C.digit.start, C.toko.end);
  return { x: 170, y: FLOOR, s: 1.3, hair: 'tuft', glasses: true, face, mouth: Math.min(1, mouth), arms, lean, pointer: t < C.cek.start ? 150 : 0, tilt: Math.sin(t * 2.3) * 0.04 };
}

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // ---- hook: judul + "99" raksasa
  const d1 = new K.Sketch({ t0: -0.7, speed: 2600, seed: 1, gap: 0.03 });
  d1.text('Kenapa Selalu 99?', 540, 215, { size: 74, align: 'center', cps: 30, col: K.PAL.yellow });
  d1.line([[250, 240], [830, 236]], { w: 4, col: K.PAL.yellow, dur: 0.15 });
  d1.text('99', 300, 700, { size: 340, cps: 6, col: K.PAL.yellow });
  d1.text('ribu?', 700, 660, { size: 130, cps: 14 });
  d1.at(T('hook', 0.7));
  d1.text('bukan kebetulan!', 560, 950, { size: 80, align: 'center', cps: 24, col: K.PAL.pink });
  d1.line(G.ellipse(560, 890, 330, 90, -2.6, 0.4), { w: 6, col: K.PAL.pink, dur: 0.3 });
  ART.push({ d: d1 }); pen.sketch(d1);

  // ---- kiri: 99.000 vs 100.000, panah "terasa murah"
  const d2 = new K.Sketch({ t0: C.kiri.start - 0.15, speed: 3400, seed: 2, gap: 0.02 });
  d2.erase([[1040, 640], [90, 660], [1040, 800], [90, 840]], { w: 150, dur: 0.5, targets: d1.items.slice(2), rubs: 3 });
  d2.text('99.000', 330, 700, { size: 170, cps: 10, col: K.PAL.yellow });
  d2.text('100.000', 330, 950, { size: 170, cps: 10 });
  d2.at(W('kiri', 'murah') - 0.1 || C.kiri.start);
  d2.line(G.spline([[620, 640], [760, 600], [900, 640]], 6), { w: 5, col: K.PAL.pink, dur: 0.2 });
  d2.text('terasa murah!', 760, 560, { size: 56, align: 'center', cps: 30, col: K.PAL.pink });
  ART.push({ d: d2 }); pen.sketch(d2);

  // ---- beda: koin seribu, "cuma 1.000"
  const d3 = new K.Sketch({ t0: C.beda.start - 0.15, speed: 3000, seed: 3, gap: 0.02 });
  d3.erase([[1040, 300], [80, 340], [1040, 470], [80, 520]], { w: 150, dur: 0.5, targets: d2.items.slice(0, 2), rubs: 3 });
  d3.line(G.circle(760, 700, 130), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  d3.text('1.000', 760, 740, { size: 110, align: 'center', cps: 10, col: K.PAL.yellow });
  d3.text('cuma selisih ini!', 760, 920, { size: 60, align: 'center', cps: 26 });
  ART.push({ d: d3 }); pen.sketch(d3);

  // ---- digit: sorot angka paling kiri "9 vs 1"
  const d4 = new K.Sketch({ t0: C.digit.start - 0.1, speed: 3200, seed: 4, gap: 0.02 });
  d4.erase([[1040, 650], [80, 700], [1040, 840], [80, 900]], { w: 150, dur: 0.5, targets: d3.items, rubs: 3 });
  d4.text('9', 300, 750, { size: 300, cps: 8, col: K.PAL.yellow });
  d4.text('1', 700, 750, { size: 300, cps: 8 });
  d4.line(G.ellipse(330, 640, 130, 150, -2.6, 0.4), { w: 7, col: K.PAL.yellow, dur: 0.3 });
  d4.at(T('digit', 0.5));
  d4.text('digit kiri = kesan', 540, 1000, { size: 64, align: 'center', cps: 28, col: K.PAL.pink });
  ART.push({ d: d4 }); pen.sketch(d4);

  // ---- diskon: label "%" + kata PROMO
  const d5 = new K.Sketch({ t0: C.diskon.start - 0.1, speed: 3400, seed: 5, gap: 0.02 });
  d5.erase([[1040, 400], [80, 440], [1040, 600], [80, 640]], { w: 150, dur: 0.5, targets: d4.items.slice(0, 2), rubs: 3 });
  d5.line(G.rrect(300, 480, 440, 220, 20), { w: 5, col: K.PAL.pink, dur: 0.25 });
  d5.text('PROMO', 520, 640, { size: 120, align: 'center', cps: 12, col: K.PAL.pink });
  d5.text('otak: lagi diskon!', 540, 830, { size: 64, align: 'center', cps: 26, col: K.PAL.yellow });
  ART.push({ d: d5 }); pen.sketch(d5);

  // ---- toko: dua label toko 199rb vs 200rb
  const d6 = new K.Sketch({ t0: C.toko.start - 0.1, speed: 3200, seed: 6, gap: 0.02 });
  d6.erase([[1040, 500], [80, 540], [1040, 700], [80, 740]], { w: 150, dur: 0.5, targets: d5.items.slice(0, 2), rubs: 3 });
  d6.line(G.rrect(140, 480, 400, 150, 14), { w: 4, dur: 0.2 });
  d6.text('199rb', 340, 600, { size: 100, align: 'center', cps: 10, col: K.PAL.yellow });
  d6.line(G.rrect(580, 480, 400, 150, 14), { w: 4, dur: 0.2 });
  d6.text('200rb', 780, 600, { size: 100, align: 'center', cps: 10 });
  d6.at(T('toko', 0.55));
  d6.line(G.spline([[340, 660], [340, 760], [780, 760], [780, 660]], 6), { w: 5, col: K.PAL.yellow, dur: 0.2 });
  d6.text('toko pilih kiri!', 560, 860, { size: 60, align: 'center', cps: 26, col: K.PAL.yellow });
  ART.push({ d: d6 }); pen.sketch(d6);

  // ---- cek: "99" bertebaran + ajakan cek label
  const d7 = new K.Sketch({ t0: C.cek.start - 0.1, speed: 3400, seed: 7, gap: 0.02 });
  d7.erase([[1040, 400], [80, 440], [1040, 900], [80, 940]], { w: 160, dur: 0.6, targets: [...d6.items], rubs: 4 });
  d7.text('99', 250, 650, { size: 150, cps: 8, col: K.PAL.yellow });
  d7.text('99', 560, 550, { size: 110, cps: 8, col: K.PAL.pink });
  d7.text('99', 820, 680, { size: 170, cps: 8, col: K.PAL.yellow });
  d7.text('99', 420, 850, { size: 100, cps: 8, col: K.PAL.blue });
  d7.at(T('cek', 0.4));
  d7.text('cek labelmu!', 560, 1050, { size: 90, align: 'center', cps: 20, col: K.PAL.yellow });
  d7.line(G.ellipse(560, 1000, 300, 80, -2.6, 0.4), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d7 }); pen.sketch(d7);

  AM.sfx('chalk', 0.0, { gain: 0.45 });
  AM.sfx('pop', T('hook', 0.75), { gain: 0.3 });
  AM.sfx('chalk', C.kiri.start, { gain: 0.4 });
  AM.sfx('coin', C.beda.start + 0.3, { gain: 0.35 });
  AM.sfx('ding', T('digit', 0.5), { gain: 0.4 });
  AM.sfx('sparkle', C.diskon.start + 0.3, { gain: 0.3 });
  AM.sfx('pop', T('toko', 0.55), { gain: 0.3 });
  AM.sfx('crowd', T('cek', 0.45), { gain: 0.25 });
}

const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => [540 + Math.sin(t * 0.6) * 6, 760 - t * 4, 1.0 + t * 0.006]);
shot('kiri', (t) => { const u = prog(t, C.kiri.start, C.kiri.end, ease.inOutSine); return [lerp(540, 520, u), lerp(740, 700, u), lerp(1.02, 1.08, u)]; });
shot('beda', (t) => [560, 730, 1.05]);
shot('digit', (t) => { const u = prog(t, C.digit.start, C.digit.end, ease.inOutSine); return [lerp(540, 520, u), 720, lerp(1.02, 1.1, u)]; });
shot('diskon', (t) => [560, 720, 1.05]);
shot('toko', (t) => [560, 720, 1.05]);
shot('cek', (t) => {
  const a = C.cek.start, out = prog(t, T('cek', 0.7), T('cek', 0.7) + 1.0, ease.inOutCubic);
  return [lerp(560, 990, out), lerp(730, 830, out), Math.exp(lerp(Math.log(1.05), Math.log(0.555), out))];
});
function camAt(t) {
  let k = 0; for (let i = 0; i < SHOTS.length; i++) if (C[SHOTS[i].id] && t >= C[SHOTS[i].id].start - 0.12) k = i;
  const sh = SHOTS[k]; let c = sh.cam(t);
  if (k > 0) { const a = Math.max(0, C[sh.id].start - 0.12), f = clamp((t - a) / 0.5); if (f < 1) { const p = SHOTS[k - 1].cam(a), e = ease.inOutCubic(f); c = [lerp(p[0], c[0], e), lerp(p[1], c[1], e), Math.exp(lerp(Math.log(p[2]), Math.log(c[2]), e))]; } }
  return c;
}

export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.board(ctx, BOARD);
  for (const it of ART) it.d.draw(ctx, t);
  K.stickDraw(ctx, teacherPose(t), t);
  const rv = 5;
  for (let i = 0; i < STUDENTS.length; i++) K.stickDraw(ctx, studentPose(i, t), t, { reveal: 1 });
  if (t > T('hook', 0.82) && t < C.kiri.start) for (let i = 0; i < 3; i++) K.chalkText(ctx, i === 1 ? '?!' : '!', 450 + i * 210, 1040 + Math.sin(t * 9 + i) * 6, { size: 60, col: K.PAL.yellow, alpha: clamp((t - T('hook', 0.82)) * 4) });
  if (t > C.cek.start) K.chalkText(ctx, 'WOW!', 960, 960 + Math.sin(t * 10) * 5, { size: 64, col: K.PAL.yellow, rot: -0.08 });
  const st = pen.at(t);
  K.dust(ctx, pen, t);
  K.handFor(ctx, st, t, { s: 1 / Math.max(0.6, z) });
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}
