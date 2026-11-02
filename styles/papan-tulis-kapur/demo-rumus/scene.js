// Papan Tulis Kapur demo-rumus (25 s): "Trik 9x Jari Tangan".
// A wide green board: the left half holds the teacher and the two hands with ten fingers,
// the right half the worked example 7 x 9. Chalk writes live, the folded finger is circled,
// and at the end the camera pulls back while the class celebrates the answer 63.
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
const T = (id, f = 0) => C[id].start + f * (C[id].end - C[id].start); // time at a fraction of a line

// ---------------------------------------------------------------- cast
const STUDENTS = [
  { x: 395, hair: 'spiky' }, { x: 540, hair: 'pony' }, { x: 685, hair: 'cap' }, { x: 830, hair: 'bun' }, { x: 975, hair: 'tuft', glasses: true },
];
const FLOOR = 1330;
function studentPose(i, t) {
  const st = STUDENTS[i], ph = t * 2 + i * 1.3;
  let face = 'smile', arms = [[0.25, 0.15], [-0.25, -0.15]], jump = 0, look = 0, tilt = Math.sin(ph) * 0.05, mouth = 0;
  const count = T('angkat', 0.2), fold = W('angkat', 'ketujuh') - 0.1, cheer = T('hasil', 0.45);
  if (t > count && t < fold) { face = 'open'; arms = [[1.6, 0.5], [-1.6, -0.5]]; look = 0.7; } // hands up, counting
  if (t >= fold && t < C.kiri.start) { face = i === 2 ? 'skeptic' : 'worried'; arms = [[0.9, -1.9], [-0.9, 1.9]]; look = i < 2 ? 0.5 : -0.4; }
  if (t >= C.kiri.start && t < C.hasil.start) { face = 'open'; look = 0.6; arms = [[0.4, 0.3], [-0.4, -0.3]]; mouth = 0.3 * Math.abs(Math.sin(t * 8 + i)); }
  if (t >= C.hasil.start) { face = t > cheer ? 'happy' : 'shock'; look = 0.6; if (t > cheer) { arms = [[2.7 + Math.sin(t * 10 + i) * 0.2, 0.2], [-2.7 - Math.sin(t * 10 + i) * 0.2, -0.2]]; jump = Math.abs(Math.sin((t - cheer) * 7 + i * 0.9)) * 30; } }
  return { x: st.x, y: FLOOR - jump, s: 0.74, hair: st.hair, glasses: st.glasses, face, arms, look, tilt, mouth, blink: ((t + i * 0.7) % 3.3) < 0.1 ? 1 : 0 };
}
function teacherPose(t) {
  let arms = [[2.0, 0.2], [-0.5, -0.4]], face = 'grin', mouth = 0, lean = 0;
  const talk = (a, b) => (t > a && t < b ? 0.5 + 0.5 * Math.sin(t * 17) : 0);
  if (t < T('hook', 0.8)) arms = [[1.95 + Math.sin(t * 3) * 0.05, 0.15], [-0.5, -0.4]];
  else if (t < C.angkat.start) { arms = [[2.25, -0.05], [-0.4, -0.3]]; lean = 0.06; }
  else if (t < C.kiri.start) { arms = [[1.7, 0.6], [-1.7, -0.6]]; face = 'open'; } // showing own hands
  else if (t < C.hasil.start) { arms = [[2.1 + Math.sin(t * 4) * 0.1, 0.1], [-0.7, -0.6]]; face = 'open'; lean = 0.05; }
  else { arms = [[2.8, 0.2], [-2.8, -0.2]]; face = 'happy'; }
  mouth = talk(0.3, 5.3) + talk(C.angkat.start, C.hasil.end);
  return { x: 170, y: FLOOR, s: 1.3, hair: 'tuft', glasses: true, face, mouth: Math.min(1, mouth), arms, lean, pointer: t < C.kiri.start ? 150 : 0, tilt: Math.sin(t * 2.3) * 0.04 };
}

// ---------------------------------------------------------------- the two hands (left half of the board)
// Ten upright fingers on two palms; finger 7 (from the left) folds down during 'angkat'.
const HAND = { cx: 540, cy: 780, spread: 92, fh: 210 }; // hand center, finger spacing, finger height
const FINGERS = [];
for (let h = 0; h < 2; h++) for (let i = 0; i < 5; i++) {
  const n = h * 5 + i + 1; // 1..10 from the left
  FINGERS.push({ n, x: HAND.cx - HAND.spread * 4.5 + (n - 1) * HAND.spread, y: HAND.cy, h: HAND.h - Math.abs(i - 2) * 26 });
}
const FOLD = 7; // the finger that bends for 7 x 9
function fingerUp(t) { return FINGERS.map((f) => f.n !== FOLD || t < W('angkat', 'ketujuh') - 0.05); }
function drawHands(t) {
  const up = fingerUp(t), foldF = clamp((t - (W('angkat', 'ketujuh') - 0.05)) / 0.3);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // palms
  ctx.strokeStyle = K.chalkPattern(ctx, K.PAL.lead); ctx.lineWidth = 5; ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(HAND.cx - HAND.spread * 4.5 - 30, HAND.cy + 60);
  ctx.lineTo(HAND.cx + HAND.spread * 4.5 + 30, HAND.cy + 60);
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(HAND.cx - HAND.spread * 4.5 - 8, HAND.cy + 60); ctx.lineTo(HAND.cx - HAND.spread * 4.5 - 8, HAND.cy + 8); // left palm edge
  ctx.moveTo(HAND.cx + HAND.spread * 4.5 + 8, HAND.cy + 60); ctx.lineTo(HAND.cx + HAND.spread * 4.5 + 8, HAND.cy + 8); // right palm edge
  ctx.stroke();
  // fingers
  for (const f of FINGERS) {
    const isFold = f.n === FOLD && foldF > 0;
    ctx.beginPath();
    if (!isFold) {
      ctx.moveTo(f.x, f.y + 10); ctx.lineTo(f.x, f.y - f.h);
      ctx.strokeStyle = K.chalkPattern(ctx, K.PAL.lead); ctx.lineWidth = 7; ctx.globalAlpha = 0.9;
    } else {
      const bx = f.x, by = f.y + 10, tipx = f.x + 34 * foldF, tipy = f.y + 34 * foldF; // bends down-right
      ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + 6, by + 18 * foldF, tipx, tipy);
      ctx.strokeStyle = K.chalkPattern(ctx, K.PAL.pink); ctx.lineWidth = 8; ctx.globalAlpha = 0.95;
    }
    ctx.stroke();
    // number label above each finger
    if (!isFold) K.chalkText(ctx, String(f.n), f.x, f.y - f.h - 34, { size: 40, col: K.PAL.lead, alpha: 0.8 * clamp((t - T('angkat', 0.3)) * 2) });
  }
  ctx.restore();
}

// ---------------------------------------------------------------- setup
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // ---- hook: lesson title, "9 x ?" teaser
  const d1 = new K.Sketch({ t0: -0.7, speed: 2600, seed: 1, gap: 0.03 });
  d1.text('Trik Jari: Perkalian 9', 540, 215, { size: 74, align: 'center', cps: 30, col: K.PAL.yellow });
  d1.line([[250, 240], [830, 236]], { w: 4, col: K.PAL.yellow, dur: 0.15 });
  d1.at(T('hook', 0.55));
  d1.text('9 x', 300, 620, { size: 230, cps: 8, col: K.PAL.yellow });
  d1.text('? = ajaib', 700, 610, { size: 110, cps: 16 });
  d1.line(G.ellipse(520, 560, 480, 200, -2.6, 0.4), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d1 }); pen.sketch(d1);

  // ---- angkat: wipe the teaser, draw the two hands, fold finger 7
  const d2 = new K.Sketch({ t0: C.angkat.start - 0.15, speed: 3400, seed: 2, gap: 0.02 });
  d2.erase([[1040, 640], [90, 660], [1040, 800], [90, 840], [1040, 960], [300, 1000]], { w: 150, dur: 0.5, targets: d1.items.slice(2), rubs: 3 });
  d2.at(T('angkat', 0.25));
  d2.text('10 jari', 540, 470, { size: 70, align: 'center', cps: 20 });
  d2.at(W('angkat', 'ketujuh') - 0.35);
  d2.text('tekuk jari 7', 900, 640, { size: 62, align: 'center', cps: 26, col: K.PAL.pink });
  d2.text('7 x 9', 900, 800, { size: 150, align: 'center', cps: 10, col: K.PAL.pink });
  ART.push({ d: d2 }); pen.sketch(d2);

  // ---- kiri: left count 6 -> 60
  const d3 = new K.Sketch({ t0: C.kiri.start - 0.15, speed: 3200, seed: 3, gap: 0.02 });
  d3.at(T('kiri', 0.3));
  d3.text('6', 300, 1080, { size: 190, cps: 8, col: K.PAL.yellow });
  d3.text('jari', 430, 1070, { size: 80, cps: 16 });
  d3.text('x 10 = 60', 780, 1070, { size: 110, cps: 14, col: K.PAL.yellow });
  ART.push({ d: d3 }); pen.sketch(d3);

  // ---- kanan: right count 3 -> +3
  const d4 = new K.Sketch({ t0: C.kanan.start - 0.15, speed: 3200, seed: 4, gap: 0.02 });
  d4.at(T('kanan', 0.25));
  d4.text('3', 1120, 1080, { size: 190, cps: 8, col: K.PAL.pink });
  d4.text('+ 3', 1290, 1070, { size: 110, cps: 14, col: K.PAL.pink });
  ART.push({ d: d4 }); pen.sketch(d4);

  // ---- hasil: the sum on the right half, big and circled
  const d5 = new K.Sketch({ t0: C.hasil.start + 0.15, speed: 3400, seed: 5, gap: 0.02 });
  d5.at(T('hasil', 0.42));
  d5.text('60 + 3 =', 1450, 700, { size: 110, align: 'center', cps: 20 });
  d5.text('63', 1450, 950, { size: 300, align: 'center', cps: 6, col: K.PAL.yellow });
  d5.line(G.ellipse(1450, 880, 340, 190, -2.6, 0.45), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d5 }); pen.sketch(d5);

  // ---- sound (8)
  AM.sfx('chalk', 0.0, { gain: 0.45 });
  AM.sfx('chalk', T('hook', 0.55), { gain: 0.45, pitch: 1.1 });
  AM.sfx('pop', T('hook', 0.85), { gain: 0.3 });
  AM.sfx('swoosh_up', C.angkat.start - 0.1, { gain: 0.3, pitch: 0.7 });
  AM.sfx('chalk', W('angkat', 'ketujuh') - 0.1, { gain: 0.35 });
  AM.sfx('chalk', T('kiri', 0.3), { gain: 0.35 });
  AM.sfx('chalk', T('kanan', 0.25), { gain: 0.35 });
  AM.sfx('ding', W('hasil', '63'), { gain: 0.4 });
  AM.sfx('crowd', T('hasil', 0.5), { gain: 0.25 });
}

// ---------------------------------------------------------------- shots (camera)
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => [540 + Math.sin(t * 0.6) * 6, 760 - t * 4, 1.0 + t * 0.006]);
shot('angkat', (t) => { const u = prog(t, C.angkat.start, C.angkat.end, ease.inOutSine); return [lerp(540, 540, u), lerp(740, 760, u), lerp(1.02, 1.06, u)]; });
shot('kiri', (t) => { const u = prog(t, C.kiri.start, C.kiri.end, ease.inOutSine); return [lerp(540, 480, u), lerp(760, 800, u), lerp(1.06, 1.12, u)]; });
shot('kanan', (t) => { const u = prog(t, C.kanan.start, C.kanan.end, ease.inOutSine); return [lerp(480, 620, u), lerp(800, 780, u), lerp(1.12, 1.08, u)]; });
shot('hasil', (t) => {
  const a = C.hasil.start, pan = prog(t, a, a + 0.8, ease.inOutCubic), out = prog(t, T('hasil', 0.82), T('hasil', 0.82) + 1.0, ease.inOutCubic);
  const x = lerp(lerp(620, 1450, pan), 990, out), y = lerp(780, 830, out), z = Math.exp(lerp(Math.log(1.0), Math.log(0.555), out));
  return [x, y, z];
});
function camAt(t) {
  let k = 0; for (let i = 0; i < SHOTS.length; i++) if (C[SHOTS[i].id] && t >= C[SHOTS[i].id].start - 0.12) k = i;
  const sh = SHOTS[k]; let c = sh.cam(t);
  if (k > 0) { const a = Math.max(0, C[sh.id].start - 0.12), f = clamp((t - a) / 0.5); if (f < 1) { const p = SHOTS[k - 1].cam(a), e = ease.inOutCubic(f); c = [lerp(p[0], c[0], e), lerp(p[1], c[1], e), Math.exp(lerp(Math.log(p[2]), Math.log(c[2]), e))]; } }
  return c;
}

// ---------------------------------------------------------------- render
export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.board(ctx, BOARD);
  for (const it of ART) it.d.draw(ctx, t);
  drawHands(t);
  // the class
  const rv = clamp((t - T('angkat', 0.2)) / 1.0) * 5;
  for (let i = 0; i < STUDENTS.length; i++) if (rv > i) K.stickDraw(ctx, studentPose(i, t), t, { reveal: clamp(rv - i) });
  K.stickDraw(ctx, teacherPose(t), t);
  // excited marks over the class
  if (t > T('angkat', 0.82) && t < C.kiri.start) for (let i = 0; i < 3; i++) K.chalkText(ctx, i === 1 ? '?!' : '!', 450 + i * 210, 1040 + Math.sin(t * 9 + i) * 6, { size: 60, col: K.PAL.yellow, alpha: clamp((t - T('angkat', 0.82)) * 4) });
  if (t > W('hasil', '63') && t < C.hasil.end) K.chalkText(ctx, 'WOW!', 960, 960 + Math.sin(t * 10) * 5, { size: 64, col: K.PAL.yellow, rot: -0.08 });
  // chalk, dust, duster
  const st = pen.at(t);
  K.dust(ctx, pen, t);
  K.handFor(ctx, st, t, { s: 1 / Math.max(0.6, z) });
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}
