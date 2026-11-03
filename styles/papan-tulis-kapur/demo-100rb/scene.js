// demo-100rb: "Ke Mana Perginya Rp100 Ribu?" — papan tulis kapur (7 lines, ~30-40 s).
// Visual arc: big 100rb bill → 4 expense buckets drain it → sum check → CTA.
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
  const hook = T('hook', 0.8), wow = W('habis', 'angin'), cheer = T('tutup', 0.4);
  let face = 'smile', arms = [[0.3, 0.2], [-0.3, -0.2]], jump = 0, look = 0, mouth = 0;
  if (t > hook && t < C.bensin.start) { face = 'shock'; arms = [[2.2, 0.3], [-2.2, -0.3]]; jump = Math.max(0, Math.sin((t - hook) * 8) * 18 * Math.exp(-(t - hook) * 1.2)); }
  else if (t >= C.bensin.start && t < C.habis.start) { face = 'worried'; arms = [[0.8, -1.6], [-0.8, 1.6]]; look = 0.3; mouth = 0.3 * Math.abs(Math.sin(t * 8)); }
  else if (t >= C.habis.start && t < C.tutup.start) { face = t > wow ? 'shock' : 'open'; arms = t > wow ? [[2.2, 0.6], [-2.2, -0.6]] : [[0.4, 0.3], [-0.4, -0.3]]; }
  else if (t >= C.tutup.start) { face = t > cheer ? 'happy' : 'grin'; if (t > cheer) { arms = [[2.7 + Math.sin(t * 10) * 0.2, 0.2], [-2.7 - Math.sin(t * 10) * 0.2, -0.2]]; jump = Math.abs(Math.sin((t - cheer) * 7)) * 30; } }
  return { x: 960, y: FLOOR - jump, s: 0.82, hair: 'cap', face, arms, look, mouth, blink: ((t * 1.1) % 3.3) < 0.12 ? 1 : 0 };
}
function teacherPose(t) {
  let arms = [[2.0, 0.2], [-0.5, -0.4]], face = 'grin', mouth = 0;
  const talk = (a, b) => (t > a && t < b ? 0.5 + 0.5 * Math.sin(t * 15) : 0);
  if (t < C.bensin.start) { mouth = talk(0.3, C.bensin.start - 0.2); }
  else if (t < C.total.start) { face = 'open'; arms = [[2.1 + Math.sin(t * 4) * 0.1, 0.1], [-0.7, -0.6]]; mouth = talk(C.bensin.start, C.total.start - 0.2); }
  else { face = 'happy'; arms = [[2.6, 0.2], [-2.6, -0.2]]; }
  return { x: 170, y: FLOOR, s: 1.3, hair: 'tuft', glasses: true, face, mouth, pointer: t < C.total.start ? 150 : 0, tilt: Math.sin(t * 2.3) * 0.04 };
}

// ---------------------------------------------------------------- wallet bar state
const BARS = [
  { id: 'bensin', label: 'Bensin', amt: '30rb', frac: 0.30, col: 'pink' },
  { id: 'jajan', label: 'Jajan', amt: '25rb', frac: 0.25, col: 'yellow' },
  { id: 'parkir', label: 'Parkir', amt: '15rb', frac: 0.15, col: 'blue' },
  { id: 'habis', label: '?', amt: '30rb', frac: 0.30, col: 'lead' },
];
const BAR = { x: 200, y: 980, w: 680, h: 64, gap: 26 };

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // ---- hook: big 100rb
  const d1 = new K.Sketch({ t0: -0.5, speed: 2400, seed: 1, gap: 0.03 });
  d1.text('Rp100rb', 540, 480, { size: 260, align: 'center', cps: 8, col: K.PAL.yellow });
  d1.line(G.rrect(240, 540, 600, 220, 18), { w: 5, dur: 0.25, col: K.PAL.yellow });
  d1.at(T('hook', 0.7));
  d1.text('tinggal struk?', 540, 880, { size: 80, align: 'center', cps: 22 });
  ART.push({ d: d1 }); pen.sketch(d1);

  // ---- 4 expense lines: wipe, then label + amount each
  const ids = ['bensin', 'jajan', 'parkir', 'habis'];
  const labels = [['Bensin', '-30rb'], ['Jajan', '-25rb'], ['Parkir+tol', '-15rb'], ['Hilang?', '-30rb']];
  const cols = [K.PAL.pink, K.PAL.yellow, K.PAL.blue, K.PAL.lead];
  ids.forEach((id, i) => {
    const d = new K.Sketch({ t0: C[id].start - 0.12, speed: 3000, seed: 10 + i, gap: 0.02 });
    if (i === 0) d.erase([[1040, 300], [80, 340], [1040, 700], [80, 760]], { w: 150, dur: 0.6, targets: d1.items, rubs: 3 });
    const y = 480 + i * 170;
    d.text(labels[i][0], 300, y, { size: 84, cps: 18 });
    d.at(W(id, labels[i][1].replace('-', '').replace('rb', '')) - 0.05);
    d.text(labels[i][1], 760, y, { size: 110, cps: 10, col: cols[i] });
    ART.push({ d }); pen.sketch(d);
  });

  // ---- total: the sum
  const d6 = new K.Sketch({ t0: C.total.start - 0.1, speed: 3000, seed: 20, gap: 0.02 });
  d6.erase([[80, 300], [1040, 340], [80, 700], [1040, 760]], { w: 150, dur: 0.6, targets: ART.flatMap(a => a.d.items).filter(it => it.type !== 'erase' && !it.erasedBy), rubs: 3 });
  d6.text('30 + 25 + 15 + 30', 540, 560, { size: 92, align: 'center', cps: 16 });
  d6.at(T('total', 0.55));
  d6.text('= 100rb!', 540, 780, { size: 220, align: 'center', cps: 7, col: K.PAL.yellow });
  d6.line(G.ellipse(540, 700, 420, 180, -2.6, 0.45), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d6 }); pen.sketch(d6);

  // ---- tutup: CTA
  const d7 = new K.Sketch({ t0: C.tutup.start - 0.1, speed: 3000, seed: 30, gap: 0.02 });
  d7.text('Catat pengeluaranmu!', 540, 620, { size: 96, align: 'center', cps: 18, col: K.PAL.yellow });
  d7.text('mulai hari ini', 540, 740, { size: 72, align: 'center', cps: 20 });
  ART.push({ d: d7 }); pen.sketch(d7);

  // ---- sound
  AM.sfx('chalk', 0.0, { gain: 0.4 });
  AM.sfx('pop', T('hook', 0.75), { gain: 0.3 });
  AM.sfx('chalk', C.bensin.start, { gain: 0.35 });
  AM.sfx('chalk', C.jajan.start, { gain: 0.35 });
  AM.sfx('chalk', C.parkir.start, { gain: 0.35 });
  AM.sfx('chalk', C.habis.start, { gain: 0.35 });
  AM.sfx('ding', T('total', 0.6), { gain: 0.4 });
  AM.sfx('crowd', T('tutup', 0.4), { gain: 0.25 });
}

// ---------------------------------------------------------------- camera
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => [540, 740, 0.92 + t * 0.004]);
shot('bensin', (t) => { const u = prog(t, C.bensin.start, C.bensin.end, ease.inOutSine); return [lerp(540, 520, u), 730, lerp(0.95, 1.0, u)]; });
shot('jajan', (t) => { const u = prog(t, C.jajan.start, C.jajan.end, ease.inOutSine); return [520, 730, 1.0]; });
shot('parkir', (t) => { const u = prog(t, C.parkir.start, C.parkir.end, ease.inOutSine); return [520, 730, 1.0]; });
shot('habis', (t) => { const u = prog(t, C.habis.start, C.habis.end, ease.inOutSine); return [lerp(520, 540, u), 730, 1.0]; });
shot('total', (t) => { const u = prog(t, C.total.start, C.total.end, ease.inOutSine); return [lerp(540, 540, u), lerp(730, 700, u), lerp(1.0, 1.02, u)]; });
shot('tutup', (t) => { const u = prog(t, C.tutup.start, C.tutup.end, ease.inOutSine); return [540, lerp(700, 680, u), lerp(1.02, 1.05, u)]; });

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

// wallet bar: drains as each expense line plays
function drawWallet(t) {
  if (t < C.bensin.start - 0.2 || t > C.total.start) return;
  const { x, y, w, h, gap } = BAR;
  ctx.save(); ctx.lineCap = 'round';
  BARS.forEach((b, i) => {
    const yy = y + i * (h + gap);
    const fill = 1 - prog(t, C[b.id].start, C[b.id].end + 0.3, ease.inOutSine) * 0 + 0; // outline always
    void fill;
    ctx.strokeStyle = K.chalkPattern(ctx, K.PAL.lead); ctx.globalAlpha = 0.5; ctx.lineWidth = 4;
    ctx.strokeRect(x, yy, w, h);
    const drain = prog(t, C[b.id].start + 0.2, C[b.id].end + 0.2, ease.inOutSine);
    const fw = w * b.frac * (1 - drain);
    if (fw > 2) {
      const col = b.col === 'pink' ? K.PAL.pink : b.col === 'yellow' ? K.PAL.yellow : b.col === 'blue' ? K.PAL.blue : K.PAL.lead;
      ctx.fillStyle = K.chalkPattern(ctx, col); ctx.globalAlpha = 0.85;
      ctx.fillRect(x + 4, yy + 4, Math.max(2, fw - 8), h - 8);
    }
    const a = clamp((t - C[b.id].start) / 0.2);
    if (a > 0) K.chalkText(ctx, `${b.label} ${b.amt}`, x + w + 18, yy + h / 2 + 12, { size: 44, alpha: a });
  });
  ctx.restore();
}

// ---------------------------------------------------------------- render
export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.board(ctx, BOARD);
  for (const it of ART) it.d.draw(ctx, t);
  drawWallet(t);
  K.stickDraw(ctx, studentPose(t), t);
  K.stickDraw(ctx, teacherPose(t), t);
  const st = pen.at(t);
  K.dust(ctx, pen, t);
  K.handFor(ctx, st, t, { s: 1 / Math.max(0.6, z) });
  AM.lib.vignette(fx, { strength: 0.35, inner: 0.5 });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}
