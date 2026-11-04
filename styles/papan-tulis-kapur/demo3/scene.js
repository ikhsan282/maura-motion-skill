// Keajaiban Lipatan Kertas — 42 Kali Sampai ke Bulan (papan-tulis-kapur)
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
  { x: 410, hair: 'spiky' },
  { x: 580, hair: 'pony' },
  { x: 750, hair: 'cap' },
  { x: 920, hair: 'bun', glasses: true },
];
const FLOOR = 1330;

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // 1. hook: Paper 0.1 mm -> 42 folds -> Moon!
  const d1 = new K.Sketch({ t0: -0.5, speed: 2800, seed: 21, gap: 0.03 });
  d1.text('LIPAT KERTAS 42 KALI = KE BULAN?', 540, 200, { size: 60, align: 'center', col: K.PAL.yellow, cps: 32 });
  d1.line([[130, 225], [950, 222]], { w: 4, col: K.PAL.yellow, dur: 0.14 });
  d1.line(G.rect(180, 340, 220, 140), { w: 4.5, col: K.PAL.lead, dur: 0.16 });
  d1.text('0,1 mm', 290, 425, { size: 54, align: 'center', col: K.PAL.yellow, cps: 22 });
  d1.line(G.circle(780, 410, 95), { w: 5, col: K.PAL.yellow, dur: 0.2 });
  d1.text('BULAN', 780, 425, { size: 46, align: 'center', col: K.PAL.yellow, cps: 24 });
  d1.line(G.spline([[420, 410], [540, 330], [660, 410]], 8), { w: 5, col: K.PAL.pink, dur: 0.16 });
  d1.text('42x LIPAT!', 540, 310, { size: 50, align: 'center', col: K.PAL.pink, cps: 26 });
  ART.push(d1); pen.sketch(d1);

  // 2. rekor: 7-8x limit, World record = 12x
  const d2 = new K.Sketch({ t0: C.rekor.start, speed: 2800, seed: 22, gap: 0.03 });
  d2.text('Batas Biasa: 7 – 8 Lipatan', 540, 620, { size: 56, align: 'center', col: K.PAL.lead, cps: 28 });
  d2.text('Rekor Dunia: 12 Lipatan', 540, 710, { size: 60, align: 'center', col: K.PAL.blue, cps: 28 });
  ART.push(d2); pen.sketch(d2);

  // 3. eksponen: 1 -> 2 -> 4 -> 8 -> 2^n
  const d3 = new K.Sketch({ t0: C.eksponen.start, speed: 3000, seed: 23, gap: 0.03 });
  d3.text('1 → 2 → 4 → 8 → 16 → 2ⁿ', 540, 835, { size: 70, align: 'center', col: K.PAL.yellow, cps: 24 });
  ART.push(d3); pen.sketch(d3);

  // 4. sepuluh: 10x = 1.024 lapis = 10 cm
  const d4 = new K.Sketch({ t0: C.sepuluh.start, speed: 3000, seed: 24, gap: 0.03 });
  d4.text('Lipatan ke-10 = 1.024 lapis (10 cm)', 540, 955, { size: 58, align: 'center', col: K.PAL.pink, cps: 28 });
  ART.push(d4); pen.sketch(d4);

  // 5. monas: Right side of board (x: 1120..1860) — Milestones ladder
  const d5 = new K.Sketch({ t0: C.monas.start, speed: 3000, seed: 25, gap: 0.03 });
  d5.text('SKALA PERTUMBUHAN 2ⁿ', 1490, 200, { size: 58, align: 'center', col: K.PAL.yellow, cps: 30 });
  d5.line([[1150, 225], [1830, 222]], { w: 4, col: K.PAL.yellow, dur: 0.14 });
  d5.text('20x = 105 m  (Tugu Monas)', 1170, 360, { size: 54, align: 'left', col: K.PAL.lead, cps: 28 });
  d5.text('27x = 13,4 km (Gunung Everest!)', 1170, 470, { size: 54, align: 'left', col: K.PAL.blue, cps: 28 });
  ART.push(d5); pen.sketch(d5);

  // 6. bumi: 30x = 107 km (Atmosfer / Antariksa)
  const d6 = new K.Sketch({ t0: C.bumi.start, speed: 3000, seed: 26, gap: 0.03 });
  d6.text('30x = 107 km  (Tembus Antariksa)', 1170, 585, { size: 54, align: 'left', col: K.PAL.pink, cps: 28 });
  // Exponential curve on right board
  const ox = 1180, oy = 1040, w = 640, h = 360;
  d6.line([[ox, oy], [ox + w, oy]], { w: 4.5, dur: 0.14 });
  d6.line([[ox, oy], [ox, oy - h]], { w: 4.5, dur: 0.14 });
  const curve = [];
  for (let i = 0; i <= 30; i++) {
    const f = i / 30;
    curve.push([ox + f * w, oy - Math.pow(f, 3.6) * (h - 20)]);
  }
  d6.line(curve, { w: 6, col: K.PAL.yellow, dur: 0.45 });
  ART.push(d6); pen.sketch(d6);

  // 7. bulan: 42x = 439.804 km > 384.400 km (Bulan!)
  const d7 = new K.Sketch({ t0: C.bulan.start, speed: 3200, seed: 27, gap: 0.03 });
  d7.text('42x = 439.804 KM!', 1500, 810, { size: 84, align: 'center', col: K.PAL.yellow, cps: 20 });
  d7.line(G.ellipse(1500, 785, 340, 75, -2.5, 0.35), { w: 6, col: K.PAL.yellow, dur: 0.25 });
  d7.text('(Jarak Bumi – Bulan = 384.400 km)', 1500, 915, { size: 46, align: 'center', col: K.PAL.lead, cps: 30 });
  ART.push(d7); pen.sketch(d7);

  AM.sfx('chalk', 0.0, { gain: 0.45 });
  AM.sfx('pop', C.eksponen.start + 0.2, { gain: 0.3 });
  AM.sfx('swoosh_up', C.monas.start, { gain: 0.3 });
  AM.sfx('ding', C.bulan.start + 1.0, { gain: 0.4 });
  AM.sfx('crowd', C.outro.start + 0.3, { gain: 0.25 });
}

function studentPose(i, t) {
  const st = STUDENTS[i], ph = t * 2.1 + i * 1.2;
  let face = 'smile', arms = [[0.25, 0.15], [-0.25, -0.15]], jump = 0, look = 0;
  if (t >= C.rekor.start && t < C.monas.start) {
    face = 'open';
  } else if (t >= C.bulan.start && t < C.outro.start) {
    face = 'shock';
    arms = [[2.4, 0.3], [-2.4, -0.3]];
    look = 0.6;
  } else if (t >= C.outro.start) {
    face = 'happy';
    arms = [[2.7 + Math.sin(t * 9 + i) * 0.2, 0.2], [-2.7 - Math.sin(t * 9 + i) * 0.2, -0.2]];
    jump = Math.abs(Math.sin(t * 6.5 + i)) * 28;
  }
  return { x: st.x, y: FLOOR - jump, s: 0.74, hair: st.hair, glasses: st.glasses, face, arms, look, tilt: Math.sin(ph) * 0.04 };
}

function teacherPose(t) {
  const talk = 0.5 + 0.5 * Math.sin(t * 16);
  const rightSide = t >= C.monas.start && t < C.outro.start;
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
  if (t < C.monas.start) {
    return [540 + Math.sin(t * 0.5) * 8, 760, 1.0];
  }
  if (t < C.outro.start) {
    const u = prog(t, C.monas.start, C.monas.start + 0.9, ease.inOutCubic);
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

