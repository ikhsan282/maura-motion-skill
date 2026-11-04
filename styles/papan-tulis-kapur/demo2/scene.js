// Paradoks Monty Hall — 8-scene chalkboard classroom explainer (papan-tulis-kapur)
import * as K from '/styles/papan-tulis-kapur/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;
const { G } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'chalk', y: 1450, size: 64 } };

const BOARD = [44, 70, 1920, 1560];
let ctx, fx;
const C = {};
const ART = [];
const pen = new K.Pen();

const STUDENTS = [
  { x: 420, hair: 'spiky' },
  { x: 600, hair: 'pony' },
  { x: 780, hair: 'cap' },
  { x: 960, hair: 'bun', glasses: true },
];
const FLOOR = 1330;

function drawDoor(d, x, y, w, h, num, col = K.PAL.lead) {
  d.line(G.rrect(x, y, w, h, 8), { w: 4.5, col, dur: 0.16 });
  d.line(G.circle(x + w - 26, y + h * 0.52, 8), { w: 3.5, col: K.PAL.yellow, dur: 0.04 });
  d.text(String(num), x + w / 2, y + 85, { size: 70, align: 'center', col: K.PAL.yellow, cps: 25 });
}

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // 1. hook: Title + 3 Doors
  const d1 = new K.Sketch({ t0: -0.5, speed: 2800, seed: 11, gap: 0.03 });
  d1.text('PARADOKS MONTY HALL', 540, 200, { size: 68, align: 'center', col: K.PAL.yellow, cps: 32 });
  d1.line([[160, 225], [920, 222]], { w: 4, col: K.PAL.yellow, dur: 0.14 });
  drawDoor(d1, 130, 320, 220, 360, 1);
  drawDoor(d1, 430, 320, 220, 360, 2);
  drawDoor(d1, 730, 320, 220, 360, 3);
  d1.text('1 MOBIL  ·  2 KAMBING', 540, 770, { size: 58, align: 'center', col: K.PAL.blue, cps: 26 });
  ART.push(d1); pen.sketch(d1);

  // 2. pilih: Pick Door 1 -> 1/3
  const d2 = new K.Sketch({ t0: C.pilih.start, speed: 2800, seed: 12, gap: 0.03 });
  d2.line(G.ellipse(240, 500, 140, 210, -2.4, 0.3), { w: 5.5, col: K.PAL.yellow, dur: 0.25 });
  d2.text('PILIHANMU', 240, 290, { size: 42, align: 'center', col: K.PAL.yellow, cps: 28 });
  d2.text('1/3', 240, 875, { size: 92, align: 'center', col: K.PAL.yellow, cps: 14 });
  d2.text('1/3', 540, 875, { size: 80, align: 'center', col: K.PAL.lead, cps: 14 });
  d2.text('1/3', 840, 875, { size: 80, align: 'center', col: K.PAL.lead, cps: 14 });
  ART.push(d2); pen.sketch(d2);

  // 3. buka: Door 3 opened -> Kambing! Ask switch to Door 2?
  const d3 = new K.Sketch({ t0: C.buka.start, speed: 3000, seed: 13, gap: 0.03 });
  d3.line([[740, 330], [940, 670]], { w: 6, col: K.PAL.pink, dur: 0.12 });
  d3.line([[940, 330], [740, 670]], { w: 6, col: K.PAL.pink, dur: 0.12 });
  d3.text('KAMBING!', 840, 530, { size: 52, align: 'center', col: K.PAL.pink, cps: 26, rot: -0.12 });
  d3.line(G.spline([[260, 690], [390, 620], [520, 690]], 8), { w: 5, col: K.PAL.yellow, dur: 0.18 });
  d3.text('PINDAH?', 390, 600, { size: 54, align: 'center', col: K.PAL.yellow, cps: 24 });
  ART.push(d3); pen.sketch(d3);

  // 4. jebakan: Intuition 50% vs 50% crossed out
  const d4 = new K.Sketch({ t0: C.jebakan.start, speed: 3000, seed: 14, gap: 0.03 });
  d4.text('Intuisi: 50% vs 50% ?', 540, 965, { size: 60, align: 'center', col: K.PAL.pink, cps: 28 });
  d4.at(C.jebakan.start + 2.2);
  d4.line([[230, 945], [850, 955]], { w: 6, col: K.PAL.pink, dur: 0.18 });
  d4.text('SALAH!', 920, 965, { size: 54, align: 'center', col: K.PAL.yellow, cps: 24, rot: -0.08 });
  ART.push(d4); pen.sketch(d4);

  // 5. rahasia: Right half of the board (x: 1120..1860) — 1/3 vs 2/3 bracket
  const d5 = new K.Sketch({ t0: C.rahasia.start, speed: 3000, seed: 15, gap: 0.03 });
  d5.text('PETA PELUANG SEBENARNYA', 1480, 200, { size: 56, align: 'center', col: K.PAL.yellow, cps: 32 });
  d5.line([[1140, 225], [1820, 222]], { w: 4, col: K.PAL.yellow, dur: 0.15 });
  drawDoor(d5, 1140, 310, 190, 300, 1);
  drawDoor(d5, 1390, 310, 190, 300, 2, K.PAL.yellow);
  drawDoor(d5, 1640, 310, 190, 300, 3, K.PAL.pink);
  d5.line([[1390, 640], [1390, 680], [1830, 680], [1830, 640]], { w: 5, col: K.PAL.yellow, dur: 0.22 });
  d5.text('GABUNGAN = 2/3 (67%)', 1610, 745, { size: 56, align: 'center', col: K.PAL.yellow, cps: 28 });
  ART.push(d5); pen.sketch(d5);

  // 6. saring: Door 3 eliminated = 0, Door 2 gets full 2/3!
  const d6 = new K.Sketch({ t0: C.saring.start, speed: 3000, seed: 16, gap: 0.03 });
  d6.line([[1650, 320], [1820, 600]], { w: 6, col: K.PAL.pink, dur: 0.12 });
  d6.line([[1820, 320], [1650, 600]], { w: 6, col: K.PAL.pink, dur: 0.12 });
  d6.text('0%', 1735, 470, { size: 78, align: 'center', col: K.PAL.pink, cps: 18 });
  d6.line(G.spline([[1735, 620], [1610, 670], [1485, 620]], 8), { w: 5, col: K.PAL.yellow, dur: 0.18 });
  d6.text('PINTU 2 = 2/3!', 1485, 845, { size: 88, align: 'center', col: K.PAL.yellow, cps: 18 });
  d6.line(G.ellipse(1485, 820, 280, 75, -2.5, 0.35), { w: 6, col: K.PAL.yellow, dur: 0.25 });
  ART.push(d6); pen.sketch(d6);

  // 7. bukti: Comparison bar chart 33.3% vs 66.7%
  const d7 = new K.Sketch({ t0: C.bukti.start, speed: 3000, seed: 17, gap: 0.03 });
  d7.text('BERTAHAN: 33,3%', 1310, 960, { size: 48, align: 'center', col: K.PAL.lead, cps: 28 });
  d7.text('PINDAH: 66,7% (2x LIPAT!)', 1520, 1045, { size: 58, align: 'center', col: K.PAL.yellow, cps: 28 });
  ART.push(d7); pen.sketch(d7);

  AM.sfx('chalk', 0.0, { gain: 0.45 });
  AM.sfx('pop', C.pilih.start + 0.2, { gain: 0.3 });
  AM.sfx('swoosh_up', C.rahasia.start, { gain: 0.3 });
  AM.sfx('ding', C.saring.start + 1.2, { gain: 0.4 });
  AM.sfx('crowd', C.outro.start + 0.3, { gain: 0.25 });
}

function studentPose(i, t) {
  const st = STUDENTS[i], ph = t * 2.1 + i * 1.2;
  let face = 'smile', arms = [[0.25, 0.15], [-0.25, -0.15]], jump = 0, look = 0;
  if (t >= C.buka.start && t < C.rahasia.start) {
    face = i % 2 === 0 ? 'skeptic' : 'worried';
    arms = [[0.8, -1.7], [-0.8, 1.7]];
  } else if (t >= C.saring.start && t < C.outro.start) {
    face = 'shock';
    arms = [[2.3, 0.4], [-2.3, -0.4]];
    look = 0.6;
  } else if (t >= C.outro.start) {
    face = 'happy';
    arms = [[2.7 + Math.sin(t * 9 + i) * 0.2, 0.2], [-2.7 - Math.sin(t * 9 + i) * 0.2, -0.2]];
    jump = Math.abs(Math.sin(t * 6.5 + i)) * 26;
  }
  return { x: st.x, y: FLOOR - jump, s: 0.74, hair: st.hair, glasses: st.glasses, face, arms, look, tilt: Math.sin(ph) * 0.04 };
}

function teacherPose(t) {
  const talk = 0.5 + 0.5 * Math.sin(t * 16);
  const rightSide = t >= C.rahasia.start && t < C.outro.start;
  return {
    x: rightSide ? 1060 : 165,
    y: FLOOR,
    s: 1.28,
    hair: 'tuft',
    glasses: true,
    face: t >= C.outro.start ? 'happy' : 'grin',
    mouth: talk,
    arms: [[2.05 + Math.sin(t * 3.5) * 0.1, 0.15], [-0.5, -0.4]],
    lean: 0.05,
    pointer: 145,
    tilt: Math.sin(t * 2.2) * 0.04
  };
}

function camAt(t) {
  if (t < C.rahasia.start) {
    return [540 + Math.sin(t * 0.5) * 8, 760, 1.0];
  }
  if (t < C.outro.start) {
    const u = prog(t, C.rahasia.start, C.rahasia.start + 0.9, ease.inOutCubic);
    return [lerp(540, 1460, u), 760, lerp(1.0, 0.98, u)];
  }
  const u = prog(t, C.outro.start, C.outro.start + 1.0, ease.inOutCubic);
  return [lerp(1460, 990, u), lerp(760, 820, u), Math.exp(lerp(Math.log(0.98), Math.log(0.56), u))];
}

export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.board(ctx, BOARD);
  for (const d of ART) d.draw(ctx, t);

  for (let i = 0; i < STUDENTS.length; i++) {
    K.stickDraw(ctx, studentPose(i, t), t);
  }
  K.stickDraw(ctx, teacherPose(t), t);

  const st = pen.at(t);
  K.dust(ctx, pen, t);
  K.handFor(ctx, st, t, { s: 1 / Math.max(0.6, z) });
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}

