// Papan Tulis Kapur: "Kenapa Bulan Ngikutin Kita?" (7 lines, ~30 s)
// Visual arc: papan kelas + guru stickman + papan tulis + bulan besar di langit kelas.
// Kapur menulis, penghapus menghapus, kamera zoom ke bulan.
import * as K from '/styles/papan-tulis-kapur/kit.js';
const { clamp, lerp, ease, prog, hrand } = AM.lib;
const { G } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'chalk', y: 1450, size: 68 } };

const BOARD = [44, 70, 1920, 1560];
let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const ART = [];
const pen = new K.Pen();
const S = {};
const T = (id, f = 0) => C[id].start + f * (C[id].end - C[id].start);

const FLOOR = 1340;
function teacherPose(t) {
  let arms = [[2.0, 0.2], [-0.5, -0.4]], face = 'grin', mouth = 0, lean = 0;
  const talk = (a, b) => (t > a && t < b ? 0.5 + 0.5 * Math.sin(t * 17) : 0);
  if (t < C.jarak.start) arms = [[1.95 + Math.sin(t * 3) * 0.05, 0.15], [-0.5, -0.4]];
  else if (t < C.pohon.start) { arms = [[2.25, -0.05], [-0.4, -0.3]]; face = 'grin'; lean = 0.06; }
  else if (t < C.otak.start) { arms = [[0.9, -1.8], [-0.9, 1.8]]; face = 'smile'; }
  else if (t < C.uji.start) { arms = [[2.1 + Math.sin(t * 4) * 0.1, 0.1], [-0.7, -0.6]]; face = 'open'; lean = 0.05; }
  else { arms = [[2.8, 0.2], [-2.8, -0.2]]; face = 'happy'; }
  mouth = talk(C.hook.start, C.pohon.end);
  return { x: 170, y: FLOOR, s: 1.3, hair: 'tuft', glasses: true, face, mouth: Math.min(1, mouth), arms, lean, pointer: t < C.uji.start ? 150 : 0, tilt: Math.sin(t * 2.3) * 0.04 };
}
function studentPose(t) {
  let face = 'smile', arms = [[0.35, 0.2], [-0.35, -0.2]], jump = 0, look = 0, tilt = 0, mouth = 0;
  const shock = T('hook', 0.8);
  if (t > shock && t < C.jarak.start) { face = 'shock'; arms = [[2.6, 0.3], [-2.6, -0.3]]; jump = Math.max(0, Math.sin((t - shock) * 9)) * 18 * Math.exp(-(t - shock) * 1.5); }
  if (t >= C.jarak.start && t < C.pohon.start) { face = 'open'; look = 0.5; }
  if (t >= C.pohon.start && t < C.otak.start) { face = 'worried'; arms = [[0.8, -1.6], [-0.8, 1.6]]; look = -0.3; }
  if (t >= C.otak.start && t < C.uji.start) { face = 'open'; arms = [[0.4, 0.3], [-0.4, -0.3]]; mouth = 0.3 * Math.abs(Math.sin(t * 8)); }
  if (t >= C.uji.start) { face = 'happy'; arms = [[2.4, 0.2], [-2.4, -0.2]]; }
  return { x: 960, y: FLOOR - jump, s: 0.82, hair: 'cap', glasses: false, face, arms, look, tilt, mouth, blink: ((t * 1.1) % 3.3) < 0.12 ? 1 : 0 };
}

// ---------------------------------------------------------------- setup
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // ---- hook: papan kelas, guru + murid, bulan di langit (terlihat dari jendela kelas)
  const d1 = new K.Sketch({ t0: -0.5, speed: 2400, seed: 1, gap: 0.03 });
  // papan tulis kosong
  d1.line(G.rect(120, 100, 1680, 1300), { w: 4.5, col: K.PAL.wood, dur: 0.2 });
  d1.line(G.rect(130, 110, 1660, 1280), { w: 4, col: K.PAL.board, dur: 0.18 });
  // jendela: bulan
  d1.line(G.rect(1200, 120, 520, 520), { w: 5, col: K.PAL.wood, dur: 0.15 });
  d1.line(G.rect(1210, 130, 500, 500), { w: 3, col: '#1a2a3a', dur: 0.12 });
  d1.line(G.circle(1460, 380, 120, -2.2, 0.25), { w: 4, col: K.PAL.yellow, dur: 0.25 });
  d1.text('?', 1460, 560, { size: 110, align: 'center', cps: 30, col: K.PAL.yellow });
  ART.push({ d: d1 }); pen.sketch(d1);

  // ---- jarak: angka 384.000 km ditulis
  const d2 = new K.Sketch({ t0: C.jarak.start - 0.15, speed: 3000, seed: 2, gap: 0.02 });
  d2.erase([[130, 110], [1690, 110], [1690, 1390], [130, 1390]], { w: 140, dur: 0.6, targets: d1.items.filter((i) => i.type === 'line'), rubs: 3 });
  d2.text('384.000', 960, 400, { size: 200, align: 'center', cps: 6, col: K.PAL.yellow });
  d2.text('km', 1220, 400, { size: 110, align: 'center', cps: 14, col: K.PAL.lead });
  d2.line([[900, 520], [1020, 520]], { w: 3, col: K.PAL.yellow, dur: 0.15 });
  d2.text('bulan', 960, 620, { size: 70, align: 'center', cps: 18, col: K.PAL.lead });
  ART.push({ d: d2 }); pen.sketch(d2);

  // ---- paralaks: dua garis benda dekat/jauh
  const d3 = new K.Sketch({ t0: C.paralaks.start - 0.15, speed: 2800, seed: 3, gap: 0.02 });
  d3.erase([[130, 110], [1690, 110], [1690, 1390], [130, 1390]], { w: 140, dur: 0.55, targets: d2.items, rubs: 3 });
  d3.line([[300, 1000], [960, 700]], { w: 4, col: K.PAL.blue, dur: 0.2 });
  d3.line([[1620, 1000], [960, 700]], { w: 4, col: K.PAL.pink, dur: 0.2 });
  d3.text('dekat', 300, 1050, { size: 60, align: 'center', cps: 18, col: K.PAL.blue });
  d3.text('jauh', 1620, 1050, { size: 60, align: 'center', cps: 18, col: K.PAL.pink });
  d3.text('paralaks', 960, 820, { size: 74, align: 'center', cps: 22, col: K.PAL.yellow });
  ART.push({ d: d3 }); pen.sketch(d3);

  // ---- pohon: pohon besar di dekat jendela
  const d4 = new K.Sketch({ t0: C.pohon.start - 0.15, speed: 2600, seed: 4, gap: 0.02 });
  d4.erase([[130, 110], [1690, 110], [1690, 1390], [130, 1390]], { w: 140, dur: 0.55, targets: d3.items, rubs: 3 });
  d4.line(G.spline([[400, 1300], [420, 900], [450, 700], [480, 600]], 6), { w: 5, col: K.PAL.wood2, dur: 0.25 });
  d4.line(G.spline([[450, 700], [380, 650], [350, 600], [370, 560]], 6), { w: 4, col: K.PAL.wood2, dur: 0.2 });
  d4.line(G.spline([[450, 700], [520, 660], [560, 620], [540, 580]], 6), { w: 4, col: K.PAL.wood2, dur: 0.2 });
  d4.line(G.spline([[480, 600], [400, 550], [360, 500], [390, 460]], 6), { w: 4, col: K.PAL.wood2, dur: 0.2 });
  d4.line(G.spline([[480, 600], [560, 540], [600, 500], [580, 460]], 6), { w: 4, col: K.PAL.wood2, dur: 0.2 });
  d4.text('pohon', 450, 1340, { size: 60, align: 'center', cps: 18, col: K.PAL.wood2 });
  d4.text('bulan', 1460, 380, { size: 50, align: 'center', cps: 16, col: K.PAL.yellow });
  ART.push({ d: d4 }); pen.sketch(d4);

  // ---- otak: otak stickman + tanda tanya
  const d5 = new K.Sketch({ t0: C.otak.start - 0.15, speed: 2800, seed: 5, gap: 0.02 });
  d5.erase([[130, 110], [1690, 110], [1690, 1390], [130, 1390]], { w: 140, dur: 0.55, targets: d4.items, rubs: 3 });
  const bx = 960, by = 600;
  d5.line(G.spline([[bx - 120, by - 60], [bx - 80, by - 130], [bx + 20, by - 130], [bx + 80, by - 80], [bx + 120, by - 20], [bx + 110, by + 60], [bx + 60, by + 120], [bx - 20, by + 120], [bx - 80, by + 80], [bx - 120, by + 20], [bx - 120, by - 60]], 6), { w: 4.5, dur: 0.3 });
  d5.line([[bx - 40, by - 80], [bx - 40, by + 80]], { w: 3, dur: 0.1 });
  d5.line([[bx + 20, by - 80], [bx + 20, by + 80]], { w: 3, dur: 0.1 });
  d5.line([[bx - 40, by], [bx + 20, by]], { w: 3, dur: 0.08 });
  d5.text('otak', bx, by + 170, { size: 60, align: 'center', cps: 18, col: K.PAL.lead });
  d5.text('salah kira', bx, 900, { size: 80, align: 'center', cps: 22, col: K.PAL.yellow });
  ART.push({ d: d5 }); pen.sketch(d5);

  // ---- uji: jalan 1 km, bulan tetap
  const d6 = new K.Sketch({ t0: C.uji.start - 0.15, speed: 3000, seed: 6, gap: 0.02 });
  d6.erase([[130, 110], [1690, 110], [1690, 1390], [130, 1390]], { w: 140, dur: 0.55, targets: d5.items, rubs: 3 });
  d6.line([[300, 1200], [1620, 1200]], { w: 4, col: K.PAL.lead, dur: 0.2 });
  d6.line([[300, 1200], [300, 1100]], { w: 3, col: K.PAL.lead, dur: 0.08 });
  d6.line([[1620, 1200], [1620, 1100]], { w: 3, col: K.PAL.lead, dur: 0.08 });
  d6.text('1 km', 960, 1240, { size: 70, align: 'center', cps: 20, col: K.PAL.yellow });
  d6.line(G.circle(1460, 380, 120, -2.2, 0.25), { w: 4, col: K.PAL.yellow, dur: 0.25 });
  d6.text('bulan', 1460, 560, { size: 50, align: 'center', cps: 16, col: K.PAL.yellow });
  ART.push({ d: d6 }); pen.sketch(d6);

  // ---- payoff: kalimat terakhir, bulan besar
  const d7 = new K.Sketch({ t0: C.payoff.start - 0.15, speed: 3200, seed: 7, gap: 0.02 });
  d7.erase([[130, 110], [1690, 110], [1690, 1390], [130, 1390]], { w: 140, dur: 0.55, targets: d6.items, rubs: 3 });
  d7.text('bukan bulan', 960, 400, { size: 110, align: 'center', cps: 10, col: K.PAL.yellow });
  d7.text('ngikutin', 960, 540, { size: 110, align: 'center', cps: 10, col: K.PAL.yellow });
  d7.text('kamu yang jalan', 960, 700, { size: 90, align: 'center', cps: 12, col: K.PAL.lead });
  d7.line(G.ellipse(960, 380, 260, 130, -2.6, 0.45), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d7 }); pen.sketch(d7);

  // ---- sound
  AM.sfx('chalk', 0.0, { gain: 0.4 });
  AM.sfx('pop', T('hook', 0.8), { gain: 0.3 });
  AM.sfx('chalk', C.jarak.start, { gain: 0.35 });
  AM.sfx('swoosh_up', C.pohon.start - 0.1, { gain: 0.25, pitch: 0.7 });
  AM.sfx('chalk', C.pohon.start, { gain: 0.35 });
  AM.sfx('ding', C.uji.start + 0.3, { gain: 0.35 });
  AM.sfx('sparkle', C.payoff.start + 0.4, { gain: 0.25 });
}

// ---------------------------------------------------------------- camera
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => [lerp(960, 960, prog(t, C.hook.start, C.hook.end, ease.inOutSine)), lerp(760, 760, prog(t, C.hook.start, C.hook.end, ease.inOutSine)), lerp(0.90, 0.95, prog(t, C.hook.start, C.hook.end, ease.inOutSine))]);
shot('jarak', (t) => { const u = prog(t, C.jarak.start, C.jarak.end, ease.inOutSine); return [lerp(960, 540, u), lerp(760, 700, u), lerp(0.95, 1.0, u)]; });
shot('paralaks', (t) => { const u = prog(t, C.paralaks.start, C.paralaks.end, ease.inOutSine); return [lerp(540, 960, u), lerp(700, 720, u), lerp(1.0, 1.05, u)]; });
shot('pohon', (t) => { const u = prog(t, C.pohon.start, C.pohon.end, ease.inOutSine); return [lerp(960, 450, u), lerp(720, 650, u), lerp(1.05, 1.12, u)]; });
shot('otak', (t) => { const u = prog(t, C.otak.start, C.otak.end, ease.inOutSine); return [lerp(450, 960, u), lerp(650, 700, u), lerp(1.12, 1.08, u)]; });
shot('uji', (t) => { const u = prog(t, C.uji.start, C.uji.end, ease.inOutSine); return [lerp(960, 960, u), lerp(700, 740, u), lerp(1.08, 1.0, u)]; });
shot('payoff', (t) => { const u = prog(t, C.payoff.start, C.payoff.end, ease.inOutSine); return [lerp(960, 960, u), lerp(740, 600, u), lerp(1.0, 1.2, u)]; });

function camAt(t) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (C[SHOTS[i].id] && t >= C[SHOTS[i].id].start - 0.12) k = i;
  const sh = SHOTS[k]; let c = sh.cam(t);
  if (k > 0) {
    const a = Math.max(0, C[sh.id].start - 0.12), f = clamp((t - a) / 0.5);
    if (f < 1) { const p = SHOTS[k - 1].cam(a), e = ease.inOutCubic(f); c = [lerp(p[0], c[0], e), lerp(p[1], c[1], e), Math.exp(lerp(Math.log(p[2]), Math.log(c[2]), e))]; }
  }
  return c;
}

// ---------------------------------------------------------------- render
export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.board(ctx, BOARD);
  for (const it of ART) it.d.draw(ctx, t);
  // stick figures
  K.stickDraw(ctx, teacherPose(t), t);
  K.stickDraw(ctx, studentPose(t), t);
  // chalk + dust
  const st = pen.at(t);
  K.dust(ctx, pen, t);
  K.handFor(ctx, st, t, { s: 1 / Math.max(0.6, z) });
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}
