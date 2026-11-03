// Papan Tulis Kapur demo (20 s): "Paradoks Ulang Tahun".
// A wide green board: the left half holds the class (teacher + five students) and the 253-pair web,
// the right half the probability curve. Chalk writes live, a duster wipes, and at the end the camera
// pulls back to the whole board while everybody cheers.
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
  const shock = T('hook', 0.82), skept = C.aneh.start, wow = W('pasangan', '253') - 0.2, cheer = T('tujuhpuluh', 0.45);
  if (t > shock && t < skept) { face = 'shock'; arms = [[2.6, 0.3], [-2.6, -0.3]]; jump = Math.max(0, Math.sin((t - shock) * 9 + i)) * 18 * Math.exp(-(t - shock) * 1.5); }
  if (t >= skept && t < C.pasangan.start) { face = i === 2 ? 'skeptic' : 'worried'; arms = i === 2 ? [[0.9, -1.9], [-0.9, 1.9]] : [[0.3, 0.2], [-0.3, -0.2]]; look = i < 2 ? 0.5 : -0.4; }
  if (t >= C.pasangan.start && t < C.tujuhpuluh.start) { face = t > wow ? 'shock' : 'open'; look = (540 - st.x) / 400; arms = t > wow ? [[2.2, 0.6], [-2.2, -0.6]] : [[0.4, 0.3], [-0.4, -0.3]]; mouth = t > wow ? 0 : 0.3 * Math.abs(Math.sin(t * 8 + i)); }
  if (t >= C.tujuhpuluh.start) { face = t > cheer ? 'happy' : 'open'; look = 0.6; if (t > cheer) { arms = [[2.7 + Math.sin(t * 10 + i) * 0.2, 0.2], [-2.7 - Math.sin(t * 10 + i) * 0.2, -0.2]]; jump = Math.abs(Math.sin((t - cheer) * 7 + i * 0.9)) * 30; } }
  return { x: st.x, y: FLOOR - jump, s: 0.74, hair: st.hair, glasses: st.glasses, face, arms, look, tilt, mouth, blink: ((t + i * 0.7) % 3.3) < 0.1 ? 1 : 0 };
}
function teacherPose(t) {
  let arms = [[2.0, 0.2], [-0.5, -0.4]], face = 'grin', mouth = 0, lean = 0;
  const talk = (a, b) => (t > a && t < b ? 0.5 + 0.5 * Math.sin(t * 17) : 0);
  if (t < T('hook', 0.8)) arms = [[1.95 + Math.sin(t * 3) * 0.05, 0.15], [-0.5, -0.4]];
  else if (t < C.aneh.start) { arms = [[2.25, -0.05], [-0.4, -0.3]]; face = 'grin'; lean = 0.06; }
  else if (t < C.pasangan.start) { arms = [[0.9, -1.8], [-0.9, 1.8]]; face = 'smile'; }
  else if (t < C.tujuhpuluh.start) { arms = [[2.1 + Math.sin(t * 4) * 0.1, 0.1], [-0.7, -0.6]]; face = 'open'; lean = 0.05; }
  else { arms = [[2.8, 0.2], [-2.8, -0.2]]; face = 'happy'; }
  mouth = talk(0.3, 5.3) + talk(C.pasangan.start, C.numpuk.end);
  return { x: 170, y: FLOOR, s: 1.3, hair: 'tuft', glasses: true, face, mouth: Math.min(1, mouth), arms, lean, pointer: t < C.tujuhpuluh.start ? 150 : 0, tilt: Math.sin(t * 2.3) * 0.04 };
}

// ---------------------------------------------------------------- the pair web
const NDOT = 23, WEB = { cx: 560, cy: 640, r: 290 };
const DOTS = Array.from({ length: NDOT }, (_, i) => { const a = -Math.PI / 2 + (i / NDOT) * Math.PI * 2; return [WEB.cx + Math.cos(a) * WEB.r, WEB.cy + Math.sin(a) * WEB.r]; });
const PAIRS = []; for (let i = 0; i < NDOT; i++) for (let j = i + 1; j < NDOT; j++) PAIRS.push([i, j]);
function webCount(t) { return Math.floor(PAIRS.length * prog(t, S.webA, S.webB, ease.inOutSine)); }
function drawWeb(t) {
  const n = webCount(t);
  if (n <= 0) return;
  const hl = t > C.numpuk.start - 0.1 && t < C.tujuhpuluh.start + 2;
  ctx.save(); ctx.lineCap = 'round';
  ctx.beginPath();
  for (let k = 0; k < n; k++) { const [i, j] = PAIRS[k]; ctx.moveTo(DOTS[i][0], DOTS[i][1]); ctx.lineTo(DOTS[j][0], DOTS[j][1]); }
  ctx.strokeStyle = K.chalkPattern(ctx, K.PAL.lead); ctx.globalAlpha = hl ? 0.32 : 0.55; ctx.lineWidth = 2.4; ctx.stroke();
  if (hl) { // one pair after another flashes yellow: each is one chance
    const step = Math.floor((t - C.numpuk.start) * 9);
    ctx.beginPath();
    for (let q = 0; q < 5; q++) { const k = Math.floor(hrand(step - q, 3) * PAIRS.length), [i, j] = PAIRS[k]; ctx.moveTo(DOTS[i][0], DOTS[i][1]); ctx.lineTo(DOTS[j][0], DOTS[j][1]); }
    ctx.strokeStyle = K.chalkPattern(ctx, K.PAL.yellow); ctx.globalAlpha = 0.95; ctx.lineWidth = 5; ctx.stroke();
  }
  ctx.restore();
}
function webTip(t) { const n = Math.max(0, Math.min(PAIRS.length - 1, webCount(t))); const [i, j] = PAIRS[n]; const f = (PAIRS.length * prog(t, S.webA, S.webB, ease.inOutSine)) % 1; return { x: lerp(DOTS[i][0], DOTS[j][0], f), y: lerp(DOTS[i][1], DOTS[j][1], f), on: true, kind: 'line', col: K.PAL.lead }; }

// ---------------------------------------------------------------- setup
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // ---- hook: lesson title, "23 orang" ... "= 50%"
  const d1 = new K.Sketch({ t0: -0.7, speed: 2600, seed: 1, gap: 0.03 });
  d1.text('Ulang Tahun Kembar?', 540, 215, { size: 74, align: 'center', cps: 30, col: K.PAL.yellow });
  d1.line([[250, 240], [830, 236]], { w: 4, col: K.PAL.yellow, dur: 0.15 });
  d1.text('23', 150, 560, { size: 290, cps: 7 });
  d1.text('orang', 470, 550, { size: 110, cps: 16 });
  S.studA = d1.t + 0.05; S.studB = S.studA + 1.0;
  d1.at(S.studB + 0.05);
  // two birthday cakes over two students = the same day
  const cake = (cx, cy) => { d1.line(G.rrect(cx - 34, cy - 20, 68, 40, 6), { w: 4, col: K.PAL.pink, dur: 0.12 }); d1.line([[cx, cy - 22], [cx, cy - 46]], { w: 4, col: K.PAL.yellow, dur: 0.05 }); d1.line(G.circle(cx, cy - 54, 6), { w: 4, col: K.PAL.yellow, dur: 0.05 }); };
  d1.at(T('hook', 0.5));
  cake(540, 965); cake(830, 965);
  d1.line(G.spline([[580, 915], [685, 860], [790, 915]], 8), { w: 4, col: K.PAL.yellow, dur: 0.15 });
  d1.text('=', 685, 950, { size: 80, align: 'center', cps: 10, col: K.PAL.yellow });
  d1.at(T('hook', 0.8));
  d1.text('50%', 330, 820, { size: 250, cps: 8, col: K.PAL.yellow });
  d1.line(G.ellipse(540, 740, 250, 125, -2.6, 0.4), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d1 }); pen.sketch(d1);
  pen.add(S.studA, S.studB, (t) => { const u = (t - S.studA) / (S.studB - S.studA), i = Math.min(4, Math.floor(u * 5)); return K.stickTip(studentPose(i, t), u * 5 - i); });

  // ---- mustahil: a skeptical student's bubble, a calendar of 365 days
  const d2 = new K.Sketch({ t0: C.aneh.start - 0.15, speed: 3400, seed: 2, gap: 0.02 });
  d2.erase([[1040, 640], [90, 660], [1040, 800], [90, 840], [1040, 960], [300, 1000]], { w: 150, dur: 0.5, targets: d1.items.slice(4), rubs: 3 });
  const gx = 140, gy = 650, cw = 60, chh = 50;
  d2.line(G.rect(gx, gy, cw * 7, chh * 5), { w: 4, dur: 0.22 });
  for (let i = 1; i < 7; i++) d2.line([[gx + i * cw, gy], [gx + i * cw, gy + chh * 5]], { w: 2.6, dur: 0.03, gap: 0.01, over: 2 });
  for (let i = 1; i < 5; i++) d2.line([[gx, gy + i * chh], [gx + cw * 7, gy + i * chh]], { w: 2.6, dur: 0.04, gap: 0.01, over: 2 });
  d2.at(W('aneh', '365') - 0.05);
  d2.text('365', 700, 790, { size: 200, align: 'center', cps: 8, col: K.PAL.yellow });
  d2.text('hari', 700, 880, { size: 80, align: 'center', cps: 14, col: K.PAL.yellow });
  d2.line(G.spline([[700, 990], [640, 950], [700, 905], [860, 905], [910, 950], [860, 995], [760, 995], [720, 1035], [720, 995], [700, 990]], 6), { w: 4.5, dur: 0.25 });
  d2.text('Mustahil!', 775, 968, { size: 50, align: 'center', cps: 30 });
  ART.push({ d: d2 }); pen.sketch(d2);

  // ---- pasangan: duster wipes the board, 23 dots on a circle, then every pair joined (253 lines)
  const d3 = new K.Sketch({ t0: C.pasangan.start - 0.15, speed: 3000, seed: 3, gap: 0.01 });
  const wipe = [[1040, 300], [80, 340], [1040, 470], [80, 520], [1040, 650], [80, 700], [1040, 840], [80, 900], [1040, 1030], [260, 1090]];
  const targets = [...d1.items.slice(2), ...d2.items.filter((i) => i.type !== 'erase')].filter((i) => !i.erasedBy);
  d3.erase(wipe, { w: 150, dur: 0.75, targets, rubs: 4 });
  DOTS.forEach(([x, y]) => d3.line(G.circle(x, y, 7, 0, 0.2), { w: 7, dur: 0.018, gap: 0.004, sketch: 0.2, over: 0 }));
  S.webA = d3.t + 0.02; S.webB = Math.max(S.webA + 1.0, W('pasangan', '253') + 0.35);
  ART.push({ d: d3 }); pen.sketch(d3);
  pen.add(S.webA, S.webB, webTip);

  // ---- rumus: the 23x22/2 formula under the web
  const dR = new K.Sketch({ t0: C.rumus.start - 0.05, speed: 3000, seed: 6, gap: 0.02 });
  dR.text('23 x 22 : 2', 560, 1150, { size: 110, align: 'center', cps: 10, col: K.PAL.yellow });
  dR.text('= 253', 560, 1260, { size: 130, align: 'center', cps: 8, col: K.PAL.yellow });
  ART.push({ d: dR }); pen.sketch(dR);

  // ---- numpuk: a thermometer of probability fills to the 50% mark
  const d4 = new K.Sketch({ t0: C.numpuk.start - 0.05, speed: 3200, seed: 4, gap: 0.02 });
  d4.line(G.rrect(905, 380, 56, 520, 26), { w: 4.5, dur: 0.25 });
  d4.line([[890, 640], [975, 640]], { w: 4, col: K.PAL.yellow, dur: 0.06 });
  d4.text('50%', 960, 610, { size: 52, cps: 20, col: K.PAL.yellow });
  S.thermo = { x: 905, y: 380, w: 56, h: 520, a: d4.t, b: C.numpuk.end + 0.1 };
  ART.push({ d: d4 }); pen.sketch(d4);

  // ---- p70: the curve on the right half of the board
  const d5 = new K.Sketch({ t0: C.tujuhpuluh.start + 0.15, speed: 3400, seed: 5, gap: 0.02 });
  const ox = 1190, oy = 1180, x1 = 1880, ytop = 430, N = 80;
  const X = (n) => ox + (n / N) * (x1 - ox - 40), P = (n) => { let q = 1; for (let k = 0; k < n; k++) q *= (365 - k) / 365; return 1 - q; }, Y = (p) => oy - p * 640;
  d5.line([[ox, oy], [x1, oy]], { w: 5, dur: 0.18 }); d5.line([[ox, oy], [ox, ytop - 40]], { w: 5, dur: 0.14 });
  d5.text('orang', x1 - 170, oy + 80, { size: 54, cps: 30 });
  const curve = []; for (let n = 0; n <= N; n++) curve.push([X(n), Y(P(n))]);
  d5.line(curve, { w: 6.5, dur: 0.7, col: K.PAL.lead, sketch: 0.6 });
  // 23 -> 50%
  d5.line([[X(23), oy], [X(23), Y(P(23))], [ox, Y(P(23))]], { w: 3, dur: 0.18, col: K.PAL.pink });
  d5.text('23', X(23), oy + 70, { size: 54, align: 'center', cps: 30, col: K.PAL.pink });
  d5.text('50%', ox - 18, Y(P(23)) + 18, { size: 46, align: 'right', cps: 30, col: K.PAL.pink });
  // 70 -> 99.9%
  d5.line([[X(70), oy], [X(70), Y(P(70))]], { w: 3, dur: 0.12, col: K.PAL.yellow });
  d5.text('70', X(70), oy + 70, { size: 60, align: 'center', cps: 30, col: K.PAL.yellow });
  d5.at(T('tujuhpuluh', 0.42));
  d5.text('99,9%', 1530, 330, { size: 190, align: 'center', cps: 9, col: K.PAL.yellow });
  d5.line(G.ellipse(1530, 270, 290, 120, -2.6, 0.45), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d5 }); pen.sketch(d5);

  // ---- sound (8)
  AM.sfx('chalk', 0.0, { gain: 0.45 });
  AM.sfx('chalk', T('hook', 0.8), { gain: 0.45, pitch: 1.1 });
  AM.sfx('pop', T('hook', 0.85), { gain: 0.3 });
  AM.sfx('chalk', W('aneh', '365'), { gain: 0.35 });
  AM.sfx('swoosh_up', C.pasangan.start - 0.1, { gain: 0.3, pitch: 0.7 });
  AM.sfx('sparkle', S.webA + 0.3, { gain: 0.3 });
  AM.sfx('ding', W('tujuhpuluh', '99,9'), { gain: 0.4 });
  AM.sfx('crowd', T('tujuhpuluh', 0.5), { gain: 0.25 });
}

// ---------------------------------------------------------------- shots (camera)
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => [540 + Math.sin(t * 0.6) * 6, 760 - t * 4, 1.0 + t * 0.006]);
shot('aneh', (t) => { const u = prog(t, C.aneh.start, C.aneh.end, ease.inOutSine); return [lerp(540, 520, u), lerp(740, 700, u), lerp(1.02, 1.08, u)]; });
shot('pasangan', (t) => { const u = prog(t, C.pasangan.start, C.pasangan.end, ease.inOutSine); return [540, lerp(760, 740, u), lerp(1.0, 1.06, u)]; });
shot('rumus', (t) => { const u = prog(t, C.rumus.start, C.rumus.end, ease.inOutSine); return [lerp(580, 600, u), lerp(730, 710, u), lerp(1.06, 1.1, u)]; });
shot('numpuk', (t) => { const u = prog(t, C.numpuk.start, C.numpuk.end, ease.inOutSine); return [lerp(560, 600, u), lerp(720, 700, u), lerp(1.06, 1.12, u)]; });
shot('tujuhpuluh', (t) => {
  const a = C.tujuhpuluh.start, pan = prog(t, a, a + 0.8, ease.inOutCubic), out = prog(t, T('tujuhpuluh', 0.82), T('tujuhpuluh', 0.82) + 1.0, ease.inOutCubic);
  const x = lerp(lerp(560, 1500, pan), 990, out), y = lerp(760, 830, out), z = Math.exp(lerp(Math.log(1.0), Math.log(0.555), out));
  return [x, y, z];
});
shot('tutup', (t) => [990, 830, 0.555]);
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
  drawWeb(t);
  // counter under the web
  const cA = W('pasangan', '253') - 0.3;
  if (t > cA && webCount(t) > 0) {
    const n = webCount(t), a = clamp((t - cA) / 0.2);
    K.chalkText(ctx, `${n} pasangan`, 560, 1015, { size: 84, col: K.PAL.yellow, alpha: a });
  }
  // thermometer fill
  const th = S.thermo;
  if (t > th.a) {
    const f = 0.5 * prog(t, th.a, th.b, ease.inOutSine) + (t > C.tujuhpuluh.start ? 0.5 * prog(t, W('tujuhpuluh', '99,9') - 0.2, W('tujuhpuluh', '99,9') + 0.6) : 0);
    const h = (th.h - 20) * f;
    ctx.save(); ctx.fillStyle = K.chalkPattern(ctx, K.PAL.pink); ctx.globalAlpha = 0.85;
    ctx.fillRect(th.x + 10, th.y + th.h - 10 - h, th.w - 20, h); ctx.restore();
  }
  // the class
  const rv = clamp((t - S.studA) / (S.studB - S.studA)) * 5;
  for (let i = 0; i < STUDENTS.length; i++) if (rv > i) K.stickDraw(ctx, studentPose(i, t), t, { reveal: clamp(rv - i) });
  K.stickDraw(ctx, teacherPose(t), t);
  // excited marks over the class
  if (t > T('hook', 0.82) && t < C.aneh.start) for (let i = 0; i < 3; i++) K.chalkText(ctx, i === 1 ? '?!' : '!', 450 + i * 210, 1040 + Math.sin(t * 9 + i) * 6, { size: 60, col: K.PAL.yellow, alpha: clamp((t - T('hook', 0.82)) * 4) });
  if (t > W('pasangan', '253') && t < C.numpuk.start) K.chalkText(ctx, 'WOW!', 960, 960 + Math.sin(t * 10) * 5, { size: 64, col: K.PAL.yellow, rot: -0.08 });
  // chalk, dust, duster
  const st = pen.at(t);
  K.dust(ctx, pen, t);
  K.handFor(ctx, st, t, { s: 1 / Math.max(0.6, z) });
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}
