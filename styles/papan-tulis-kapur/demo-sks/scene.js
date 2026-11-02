// demo-sks: "Efek SKS" — papan tulis kapur (5 lines, ~30 s).
// Visual arc: paper + panic → clock → adrenaline molecule → focus brain → calendar.
// Chalk writes live, duster wipes, stick figures react.
import * as K from '/styles/papan-tulis-kapur/kit.js';
const { clamp, lerp, ease, prog, hrand } = AM.lib;
const { G } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'chalk', y: 1460, size: 68 } };

const BOARD = [44, 70, 1920, 1560];
let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const ART = [];
const pen = new K.Pen();
const S = {};
const T = (id, f = 0) => C[id].start + f * (C[id].end - C[id].start);

// ---------------------------------------------------------------- stick figures
const FLOOR = 1340;
function studentPose(t) {
  const shock = T('hook', 0.75), dead = C.deadline.start, adr = C.adrenalin.start, fok = C.fokus.start, sol = C.solusi.start;
  let face = 'open', arms = [[0.3, 0.2], [-0.3, -0.2]], jump = 0, look = 0, tilt = 0, mouth = 0, lean = 0;
  if (t > shock && t < dead) { face = 'shock'; arms = [[2.2, 0.3], [-2.2, -0.3]]; jump = Math.max(0, Math.sin((t - shock) * 8) * 20 * Math.exp(-(t - shock) * 1.2)); look = 0.4; }
  else if (t >= dead && t < adr) { face = 'worried'; arms = [[0.8, -1.6], [-0.8, 1.6]]; look = 0.3; }
  else if (t >= adr && t < fok) { face = 'grin'; arms = [[2.0, 0.1], [-2.0, -0.1]]; lean = 0.06; mouth = 0.6; }
  else if (t >= fok && t < sol) { face = 'open'; arms = [[0.5, 0.3], [-0.5, -0.3]]; look = -0.3; }
  else if (t >= sol) { face = 'smile'; arms = [[2.4, 0.2], [-2.4, -0.2]]; }
  return { x: 960, y: FLOOR - jump, s: 0.82, hair: 'cap', glasses: false, face, arms, look, tilt, mouth, lean,
    blink: ((t * 1.1) % 3.3) < 0.12 ? 1 : 0 };
}
function teacherPose(t) {
  let arms = [[2.0, 0.2], [-0.5, -0.4]], face = 'grin', mouth = 0;
  const talk = (a, b) => (t > a && t < b ? 0.5 + 0.5 * Math.sin(t * 15) : 0);
  if (t < C.deadline.start) { face = 'grin'; mouth = talk(0.3, C.deadline.start - 0.2); }
  else if (t < C.adrenalin.start) { face = 'open'; arms = [[1.0, -1.8], [-1.0, 1.8]]; }
  else if (t < C.fokus.start) { face = 'grin'; arms = [[2.2, 0.1], [-0.6, -0.5]]; mouth = talk(C.adrenalin.start, C.fokus.start - 0.2); }
  else if (t < C.solusi.start) { face = 'open'; arms = [[0.9, -1.6], [-0.9, 1.6]]; }
  else { face = 'happy'; arms = [[2.6, 0.2], [-2.6, -0.2]]; }
  return { x: 170, y: FLOOR, s: 1.3, hair: 'tuft', glasses: true, face, mouth, lean: 0, pointer: 0, tilt: Math.sin(t * 2.3) * 0.04 };
}

// ---------------------------------------------------------------- setup
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // ---- hook: paper on desk + panic marks
  const d1 = new K.Sketch({ t0: -0.5, speed: 2400, seed: 1, gap: 0.03 });
  // desk
  d1.line([[760, 1080], [1160, 1080]], { w: 5, col: K.PAL.wood2, dur: 0.2 });
  d1.line([[800, 1080], [800, 1200]], { w: 4, col: K.PAL.wood2, dur: 0.1 });
  d1.line([[1120, 1080], [1120, 1200]], { w: 4, col: K.PAL.wood2, dur: 0.1 });
  // paper
  d1.line(G.rect(860, 940, 210, 130), { w: 3.5, col: K.PAL.lead, dur: 0.18 });
  d1.line([[870, 960], [1060, 960]], { w: 2.5, col: K.PAL.lead, dur: 0.08 });
  d1.line([[870, 980], [1060, 980]], { w: 2.5, col: K.PAL.lead, dur: 0.08 });
  d1.line([[870, 1000], [1020, 1000]], { w: 2.5, col: K.PAL.lead, dur: 0.08 });
  d1.text('PR', 965, 920, { size: 52, align: 'center', cps: 20, col: K.PAL.lead });
  // clock on wall (showing late)
  d1.line(G.circle(1340, 340, 90, -2.2, 0.25), { w: 5, col: K.PAL.lead, dur: 0.22 });
  d1.line([[1340, 340], [1340, 270]], { w: 4, col: K.PAL.lead, dur: 0.06 });
  d1.line([[1340, 340], [1380, 360]], { w: 4, col: K.PAL.lead, dur: 0.06 });
  d1.text('11:59', 1340, 460, { size: 70, align: 'center', cps: 20, col: K.PAL.yellow });
  // panic marks
  d1.at(T('hook', 0.7));
  d1.text('?!', 1100, 870, { size: 90, align: 'center', cps: 30, col: K.PAL.yellow });
  d1.text('!', 820, 860, { size: 70, align: 'center', cps: 30, col: K.PAL.yellow });
  ART.push({ d: d1 }); pen.sketch(d1);
  pen.add(T('hook', 0.7), T('hook', 0.7) + 0.5, (t) => {
    const f = clamp((t - T('hook', 0.7)) / 0.5);
    return { x: 1100 + Math.sin(t * 12) * 5, y: 870 + Math.sin(t * 9) * 4, on: f < 1, kind: 'text', col: K.PAL.yellow };
  });

  // ---- deadline: SKS label + clock arrow
  const d2 = new K.Sketch({ t0: C.deadline.start - 0.1, speed: 2800, seed: 2, gap: 0.02 });
  d2.erase([[760, 300], [80, 340], [760, 600], [80, 660]], { w: 140, dur: 0.6, targets: d1.items, rubs: 3 });
  // SKS big
  d2.text('SKS', 540, 560, { size: 320, align: 'center', cps: 6, col: K.PAL.yellow });
  d2.line([[260, 600], [820, 596]], { w: 5, col: K.PAL.yellow, dur: 0.2 });
  d2.text('Sistem Kebut Semalam', 540, 680, { size: 72, align: 'center', cps: 18, col: K.PAL.yellow });
  // arrow from clock to SKS
  d2.line([[1260, 460], [920, 560]], { w: 3, col: K.PAL.yellow, dur: 0.18, sketch: 0.5 });
  d2.line(G.spline([[920, 560], [900, 555], [915, 570]], 5), { w: 3, col: K.PAL.yellow, dur: 0.1 });
  ART.push({ d: d2 }); pen.sketch(d2);

  // ---- adrenalin: molecule + brain
  const d3 = new K.Sketch({ t0: C.adrenalin.start - 0.1, speed: 3000, seed: 3, gap: 0.02 });
  d3.erase([[80, 300], [1040, 340], [80, 700], [1040, 760]], { w: 140, dur: 0.55, targets: d2.items, rubs: 2 });
  // adrenaline molecule (simplified): central ring + branches
  const mx = 400, my = 560;
  d3.line(G.circle(mx, my, 50, -2.2, 0.25), { w: 4, dur: 0.18 });
  d3.line([[mx, my - 50], [mx, my - 100]], { w: 4, dur: 0.1 });
  d3.line([[mx - 50, my], [mx - 100, my]], { w: 4, dur: 0.1 });
  d3.line([[mx + 50, my], [mx + 100, my]], { w: 4, dur: 0.1 });
  d3.line([[mx, my + 50], [mx, my + 100]], { w: 4, dur: 0.1 });
  d3.line(G.circle(mx, my - 100, 18, -2.2, 0.3), { w: 3.5, col: K.PAL.red, dur: 0.12 });
  d3.line(G.circle(mx - 100, my, 18, -2.2, 0.3), { w: 3.5, col: K.PAL.red, dur: 0.12 });
  d3.line(G.circle(mx + 100, my, 18, -2.2, 0.3), { w: 3.5, col: K.PAL.red, dur: 0.12 });
  d3.line(G.circle(mx, my + 100, 18, -2.2, 0.3), { w: 3.5, col: K.PAL.red, dur: 0.12 });
  d3.text('Adrenalin', mx, my + 155, { size: 54, align: 'center', cps: 20, col: K.PAL.yellow });
  // brain outline (right side)
  const bx = 900, by = 560;
  d3.line(G.spline([[bx - 120, by - 60], [bx - 80, by - 130], [bx + 20, by - 130], [bx + 80, by - 80], [bx + 120, by - 20], [bx + 110, by + 60], [bx + 60, by + 120], [bx - 20, by + 120], [bx - 80, by + 80], [bx - 120, by + 20], [bx - 120, by - 60]], 6), { w: 4.5, dur: 0.3 });
  // brain folds
  d3.line([[bx - 40, by - 80], [bx - 40, by + 80]], { w: 3, dur: 0.1 });
  d3.line([[bx + 20, by - 80], [bx + 20, by + 80]], { w: 3, dur: 0.1 });
  d3.line([[bx - 40, by], [bx + 20, by]], { w: 3, dur: 0.08 });
  d3.text('Otak', bx, by + 170, { size: 54, align: 'center', cps: 20, col: K.PAL.yellow });
  // arrow from molecule to brain
  d3.line([[mx + 100, by], [bx - 120, by]], { w: 2.5, col: K.PAL.yellow, dur: 0.2, sketch: 0.4 });
  ART.push({ d: d3 }); pen.sketch(d3);

  // ---- fokus: focus tunnel / target
  const d4 = new K.Sketch({ t0: C.fokus.start - 0.1, speed: 3200, seed: 4, gap: 0.02 });
  d4.erase([[80, 300], [1040, 340], [80, 700], [1040, 760]], { w: 140, dur: 0.55, targets: d3.items, rubs: 2 });
  // target / bullseye
  const tx = 540, ty = 580;
  d4.line(G.circle(tx, ty, 200, -2.2, 0.25), { w: 4.5, dur: 0.2 });
  d4.line(G.circle(tx, ty, 130, -2.2, 0.25), { w: 4, col: K.PAL.yellow, dur: 0.15 });
  d4.line(G.circle(tx, ty, 65, -2.2, 0.2), { w: 3.5, col: K.PAL.red, dur: 0.12 });
  d4.line(G.circle(tx, ty, 22, -2.2, 0.15), { w: 3, col: K.PAL.yellow, dur: 0.1 });
  // arrow hitting center
  d4.line([[tx - 260, ty - 180], [tx - 30, ty - 25]], { w: 4, col: K.PAL.lead, dur: 0.2, sketch: 0.4 });
  d4.line(G.spline([[tx - 30, ty - 25], [tx - 15, ty - 10], [tx - 20, ty + 10]], 5), { w: 4, col: K.PAL.lead, dur: 0.1 });
  d4.text('Fokus', tx, ty + 260, { size: 90, align: 'center', cps: 20, col: K.PAL.yellow });
  // "distractions off" crossed out
  const dcx = 900, dcy = 500;
  d4.line(G.rect(dcx - 100, dcy - 60, 200, 120), { w: 4, dur: 0.18 });
  d4.text('HP', dcx, dcy, { size: 80, align: 'center', cps: 20, col: K.PAL.lead });
  d4.line([[dcx - 120, dcy - 80], [dcx + 120, dcy + 80]], { w: 5, col: K.PAL.red, dur: 0.12 });
  d4.line([[dcx + 120, dcy - 80], [dcx - 120, dcy + 80]], { w: 5, col: K.PAL.red, dur: 0.12 });
  d4.text('Mati!', dcx, dcy + 90, { size: 60, align: 'center', cps: 20, col: K.PAL.red });
  ART.push({ d: d4 }); pen.sketch(d4);

  // ---- solusi: calendar grid + checkmarks
  const d5 = new K.Sketch({ t0: C.solusi.start - 0.1, speed: 3000, seed: 5, gap: 0.02 });
  d5.erase([[80, 300], [1040, 340], [80, 700], [1040, 760]], { w: 140, dur: 0.55, targets: d4.items, rubs: 2 });
  // small daily calendar
  const calx = 540, caly = 580, cw = 55, chh = 48, cols = 7, rows = 4;
  d5.line(G.rect(calx - cw * cols / 2, caly - chh * rows / 2, cw * cols, chh * rows), { w: 4, dur: 0.2 });
  for (let i = 1; i < cols; i++) d5.line([[calx - cw * cols / 2 + i * cw, caly - chh * rows / 2], [calx - cw * cols / 2 + i * cw, caly + chh * rows / 2]], { w: 2.5, dur: 0.03, gap: 0.01, over: 2 });
  for (let i = 1; i < rows; i++) d5.line([[calx - cw * cols / 2, caly - chh * rows / 2 + i * chh], [calx + cw * cols / 2, caly - chh * rows / 2 + i * chh]], { w: 2.5, dur: 0.03, gap: 0.01, over: 2 });
  // checkmarks on first 3 cells
  const checks = [[-2, -1], [1, -1], [4, -1]];
  checks.forEach(([ci, ri]) => {
    const cx2 = calx - cw * cols / 2 + ci * cw + cw / 2, cy2 = caly - chh * rows / 2 + ri * chh + chh / 2;
    d5.line([[cx2 - 14, cy2], [cx2 - 4, cy2 + 10]], { w: 4, col: K.PAL.yellow, dur: 0.1 });
    d5.line([[cx2 - 4, cy2 + 10], [cx2 + 16, cy2 - 12]], { w: 4, col: K.PAL.yellow, dur: 0.1 });
  });
  d5.text('Cicil', calx, caly + chh * rows / 2 + 80, { size: 80, align: 'center', cps: 20, col: K.PAL.yellow });
  // small arrow from calendar to SKS crossed out
  const sksx = 900, sksy = 560;
  d5.line(G.rrect(sksx - 90, sksy - 60, 180, 120, 12), { w: 4, dur: 0.18 });
  d5.text('SKS', sksx, sksy - 10, { size: 72, align: 'center', cps: 20, col: K.PAL.lead });
  d5.line([[sksx - 110, sksy - 80], [sksx + 110, sksy + 80]], { w: 6, col: K.PAL.red, dur: 0.15 });
  d5.line([[sksx + 110, sksy - 80], [sksx - 110, sksy + 80]], { w: 6, col: K.PAL.red, dur: 0.15 });
  d5.text('Bukan strategi!', sksx, sksy + 100, { size: 60, align: 'center', cps: 20, col: K.PAL.red });
  ART.push({ d: d5 }); pen.sketch(d5);

  // ---- sound
  AM.sfx('chalk', 0.0, { gain: 0.4 });
  AM.sfx('pop', T('hook', 0.75), { gain: 0.3 });
  AM.sfx('chalk', C.deadline.start, { gain: 0.35 });
  AM.sfx('swoosh_up', C.adrenalin.start - 0.1, { gain: 0.25, pitch: 0.7 });
  AM.sfx('chalk', C.fokus.start, { gain: 0.35 });
  AM.sfx('ding', C.solusi.start + 0.5, { gain: 0.35 });
  AM.sfx('sparkle', C.solusi.start + 0.8, { gain: 0.25 });
}

// ---------------------------------------------------------------- camera
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => [lerp(960, 960, prog(t, C.hook.start, C.hook.end, ease.inOutSine)), 760 - t * 3, 1.0 + t * 0.005]);
shot('deadline', (t) => { const u = prog(t, C.deadline.start, C.deadline.end, ease.inOutSine); return [lerp(960, 540, u), lerp(760, 700, u), lerp(1.0, 1.05, u)]; });
shot('adrenalin', (t) => { const u = prog(t, C.adrenalin.start, C.adrenalin.end, ease.inOutSine); return [lerp(540, 700, u), lerp(700, 680, u), lerp(1.05, 1.1, u)]; });
shot('fokus', (t) => { const u = prog(t, C.fokus.start, C.fokus.end, ease.inOutSine); return [lerp(700, 540, u), lerp(680, 700, u), lerp(1.1, 1.08, u)]; });
shot('solusi', (t) => { const u = prog(t, C.solusi.start, C.solusi.end, ease.inOutSine); return [lerp(540, 700, u), lerp(700, 680, u), lerp(1.08, 1.12, u)]; });

function camAt(t) {
  let k = 0;
  for (let i = 0; i < SHOTS.length; i++) if (C[SHOTS[i].id] && t >= C[SHOTS[i].id].start - 0.15) k = i;
  const sh = SHOTS[k]; let c = sh.cam(t);
  if (k > 0) {
    const a = Math.max(0, C[sh.id].start - 0.15), f = clamp((t - a) / 0.5);
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
  K.stickDraw(ctx, studentPose(t), t);
  K.stickDraw(ctx, teacherPose(t), t);
  // chalk + dust
  const st = pen.at(t);
  K.dust(ctx, pen, t);
  K.handFor(ctx, st, t, { s: 1 / Math.max(0.6, z) });
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}