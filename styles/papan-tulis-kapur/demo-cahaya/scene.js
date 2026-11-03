// demo-cahaya: "Cahaya di wajahmu lebih tua dari peradaban" — papan tulis kapur (6 lines, ~30-40 s).
// Visual arc: matahari → 8 menit ke Bumi → bintang ratusan/ribuan tahun → wajah + garis waktu → langit malam.
// Chalk writes live, duster wipes, stick figures react, camera pans.
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
  const shock = T('hook', 0.75), mata = C.matahari.start, bint = C.bintang.start, waj = C.wajah.start, ren = C.renung.start, tanya = C.tanya.start;
  let face = 'open', arms = [[0.3, 0.2], [-0.3, -0.2]], jump = 0, look = 0, tilt = 0, mouth = 0, lean = 0;
  if (t > shock && t < mata) { face = 'shock'; arms = [[2.2, 0.3], [-2.2, -0.3]]; jump = Math.max(0, Math.sin((t - shock) * 8) * 20 * Math.exp(-(t - shock) * 1.2)); look = 0.4; }
  else if (t >= mata && t < bint) { face = 'worried'; arms = [[0.8, -1.6], [-0.8, 1.6]]; look = 0.3; }
  else if (t >= bint && t < waj) { face = 'open'; arms = [[1.2, 0.2], [-1.2, -0.2]]; look = 0.5; mouth = 0.3 * Math.abs(Math.sin(t * 7)); }
  else if (t >= waj && t < tanya) { face = 'smile'; arms = [[0.5, 0.3], [-0.5, -0.3]]; look = -0.3; }
  else if (t >= tanya) { face = 'happy'; arms = [[2.4, 0.2], [-2.4, -0.2]]; look = 0.6; }
  return { x: 960, y: FLOOR - jump, s: 0.82, hair: 'cap', glasses: false, face, arms, look, tilt, mouth, lean,
    blink: ((t * 1.1) % 3.3) < 0.12 ? 1 : 0 };
}
function teacherPose(t) {
  let arms = [[2.0, 0.2], [-0.5, -0.4]], face = 'grin', mouth = 0;
  const talk = (a, b) => (t > a && t < b ? 0.5 + 0.5 * Math.sin(t * 15) : 0);
  if (t < C.matahari.start) { face = 'grin'; mouth = talk(0.3, C.matahari.start - 0.2); }
  else if (t < C.bintang.start) { face = 'open'; arms = [[1.0, -1.8], [-1.0, 1.8]]; }
  else if (t < C.wajah.start) { face = 'grin'; arms = [[2.2, 0.1], [-0.6, -0.5]]; mouth = talk(C.bintang.start, C.wajah.start - 0.2); }
  else if (t < C.tanya.start) { face = 'open'; arms = [[0.9, -1.6], [-0.9, 1.6]]; }
  else { face = 'happy'; arms = [[2.6, 0.2], [-2.6, -0.2]]; }
  return { x: 170, y: FLOOR, s: 1.3, hair: 'tuft', glasses: true, face, mouth, lean: 0, pointer: 0, tilt: Math.sin(t * 2.3) * 0.04 };
}

// ---------------------------------------------------------------- setup
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // ---- hook: matahari + wajah + "lebih tua dari peradaban"
  const d1 = new K.Sketch({ t0: -0.5, speed: 2400, seed: 1, gap: 0.03 });
  // matahari (kiri atas)
  d1.line(G.circle(300, 380, 110, -2.2, 0.25), { w: 5, col: K.PAL.yellow, dur: 0.25 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    d1.line([[300 + Math.cos(a) * 130, 380 + Math.sin(a) * 130], [300 + Math.cos(a) * 175, 380 + Math.sin(a) * 175]], { w: 4, col: K.PAL.yellow, dur: 0.05 });
  }
  d1.text('Matahari', 300, 540, { size: 60, align: 'center', cps: 20, col: K.PAL.yellow });
  // wajah (kanan bawah) — lingkaran + mata + senyum + garis sinar ke wajah
  const fx0 = 900, fy0 = 900;
  d1.line(G.circle(fx0, fy0, 110, -2.2, 0.25), { w: 5, col: K.PAL.lead, dur: 0.25 });
  d1.line(G.circle(fx0 - 35, fy0 - 20, 10, 0, 0.3, 8), { w: 3.5, dur: 0.08 });
  d1.line(G.circle(fx0 + 35, fy0 - 20, 10, 0, 0.3, 8), { w: 3.5, dur: 0.08 });
  d1.line(G.spline([[fx0 - 45, fy0 + 30], [fx0, fy0 + 60], [fx0 + 45, fy0 + 30]], 6), { w: 4, dur: 0.12 });
  d1.text('Wajahmu', fx0, fy0 + 170, { size: 60, align: 'center', cps: 20, col: K.PAL.lead });
  // garis sinar dari matahari ke wajah
  d1.line([[390, 430], [fx0 - 100, fy0 - 80]], { w: 3, col: K.PAL.yellow, dur: 0.2, sketch: 0.5 });
  d1.line([[400, 470], [fx0 - 90, fy0 - 40]], { w: 3, col: K.PAL.yellow, dur: 0.2, sketch: 0.5 });
  d1.at(T('hook', 0.7));
  d1.text('Lebih tua dari peradaban!', 540, 700, { size: 74, align: 'center', cps: 18, col: K.PAL.yellow });
  ART.push({ d: d1 }); pen.sketch(d1);
  pen.add(T('hook', 0.7), T('hook', 0.7) + 0.5, (t) => {
    const f = clamp((t - T('hook', 0.7)) / 0.5);
    return { x: 540 + Math.sin(t * 12) * 5, y: 700 + Math.sin(t * 9) * 4, on: f < 1, kind: 'text', col: K.PAL.yellow };
  });

  // ---- matahari: 8 menit ke Bumi
  const d2 = new K.Sketch({ t0: C.matahari.start - 0.1, speed: 2800, seed: 2, gap: 0.02 });
  d2.erase([[80, 300], [1040, 340], [80, 700], [1040, 760]], { w: 140, dur: 0.6, targets: d1.items, rubs: 3 });
  // matahari kecil + bumi + garis jarak
  d2.line(G.circle(240, 480, 70, -2.2, 0.25), { w: 4.5, col: K.PAL.yellow, dur: 0.18 });
  d2.line(G.circle(880, 480, 55, -2.2, 0.25), { w: 4.5, col: K.PAL.blue, dur: 0.18 });
  d2.text('Bumi', 880, 590, { size: 50, align: 'center', cps: 20, col: K.PAL.blue });
  // garis putus-putus (jarak)
  for (let i = 0; i < 6; i++) {
    const x0 = 330 + i * 90;
    d2.line([[x0, 480], [x0 + 55, 480]], { w: 3, col: K.PAL.lead, dur: 0.05, gap: 0.01 });
  }
  d2.at(W('matahari', 'delapan') - 0.05);
  d2.text('8 menit', 560, 360, { size: 130, align: 'center', cps: 10, col: K.PAL.yellow });
  d2.line(G.ellipse(560, 310, 260, 100, -2.6, 0.4), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d2 }); pen.sketch(d2);

  // ---- bintang: ratusan / ribuan tahun
  const d3 = new K.Sketch({ t0: C.bintang.start - 0.1, speed: 3000, seed: 3, gap: 0.02 });
  d3.erase([[80, 300], [1040, 340], [80, 700], [1040, 760]], { w: 140, dur: 0.55, targets: d2.items, rubs: 2 });
  // bintang-bintang (4-pointed)
  const star = (cx, cy, r) => {
    const p = [];
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
      p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      p.push([cx + Math.cos(a + Math.PI / 4) * r * 0.3, cy + Math.sin(a + Math.PI / 4) * r * 0.3]);
    }
    p.push(p[0]);
    return p;
  };
  const stars = [[300, 420, 40], [520, 350, 30], [740, 460, 45], [920, 380, 28], [420, 560, 26], [640, 590, 34]];
  stars.forEach(([sx, sy, sr]) => d3.line(star(sx, sy, sr), { w: 3.5, col: K.PAL.yellow, dur: 0.08, sketch: 0.3 }));
  d3.at(W('bintang', 'ratusan') - 0.05);
  d3.text('Ratusan - ribuan tahun', 540, 720, { size: 80, align: 'center', cps: 14, col: K.PAL.yellow });
  d3.line(G.ellipse(540, 670, 420, 100, -2.6, 0.4), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d3 }); pen.sketch(d3);

  // ---- wajah: masa lalu
  const d4 = new K.Sketch({ t0: C.wajah.start - 0.1, speed: 3000, seed: 4, gap: 0.02 });
  d4.erase([[80, 300], [1040, 340], [80, 700], [1040, 760]], { w: 140, dur: 0.55, targets: d3.items, rubs: 2 });
  // garis waktu: kiri = masa lalu, kanan = sekarang
  const tlx = 200, tlx2 = 880, tly = 560;
  d4.line([[tlx, tly], [tlx2, tly]], { w: 5, dur: 0.2 });
  d4.line([[tlx2 - 30, tly - 20], [tlx2, tly], [tlx2 - 30, tly + 20]], { w: 4, dur: 0.08 });
  // panah ke kiri (masa lalu)
  d4.line([[tlx + 30, tly - 20], [tlx, tly], [tlx + 30, tly + 20]], { w: 4, dur: 0.08 });
  d4.text('Masa lalu', tlx + 100, tly - 70, { size: 55, align: 'center', cps: 20, col: K.PAL.yellow });
  d4.text('Sekarang', tlx2 - 100, tly - 70, { size: 55, align: 'center', cps: 20, col: K.PAL.lead });
  // mata melihat ke belakang (ikon wajah dengan mata tertutup / melihat ke kiri)
  const wx = 540, wy = 800;
  d4.line(G.circle(wx, wy, 90, -2.2, 0.25), { w: 4.5, dur: 0.2 });
  d4.line(G.circle(wx - 28, wy - 15, 8, 0, 0.3, 8), { w: 3, dur: 0.06 });
  d4.line(G.circle(wx + 28, wy - 15, 8, 0, 0.3, 8), { w: 3, dur: 0.06 });
  d4.line(G.spline([[wx - 35, wy + 25], [wx, wy + 50], [wx + 35, wy + 25]], 6), { w: 3.5, dur: 0.1 });
  d4.text('Kamu melihat masa lalu', wx, wy + 160, { size: 60, align: 'center', cps: 16, col: K.PAL.yellow });
  ART.push({ d: d4 }); pen.sketch(d4);

  // ---- renung: setiap tatapan = perjalanan waktu
  const d5 = new K.Sketch({ t0: C.renung.start - 0.1, speed: 3000, seed: 5, gap: 0.02 });
  d5.erase([[80, 300], [1040, 340], [80, 700], [1040, 760]], { w: 140, dur: 0.55, targets: d4.items, rubs: 2 });
  // jam pasir / time machine sederhana: dua lingkaran + garis
  const jx = 540, jy = 520;
  d5.line(G.circle(jx, jy - 70, 60, -2.2, 0.25), { w: 4.5, dur: 0.18 });
  d5.line(G.circle(jx, jy + 70, 60, -2.2, 0.25), { w: 4.5, dur: 0.18 });
  d5.line([[jx - 60, jy - 70], [jx - 60, jy + 70]], { w: 3, dur: 0.08 });
  d5.line([[jx + 60, jy - 70], [jx + 60, jy + 70]], { w: 3, dur: 0.08 });
  // pasir jatuh
  d5.line([[jx, jy - 40], [jx, jy + 40]], { w: 2.5, col: K.PAL.yellow, dur: 0.15, sketch: 0.3 });
  d5.text('Perjalanan waktu', jx, jy + 200, { size: 72, align: 'center', cps: 14, col: K.PAL.yellow });
  ART.push({ d: d5 }); pen.sketch(d5);

  // ---- tanya: langit malam + bintang tanda tanya
  const d6 = new K.Sketch({ t0: C.tanya.start - 0.1, speed: 3000, seed: 6, gap: 0.02 });
  d6.erase([[80, 300], [1040, 340], [80, 700], [1040, 760]], { w: 140, dur: 0.55, targets: d5.items, rubs: 2 });
  // langit malam: bulan sabit + bintang + tanda tanya besar
  d6.line(G.arc(300, 420, 60, 60, -1.2, 1.2, 12), { w: 4.5, col: K.PAL.yellow, dur: 0.15 });
  d6.line(G.arc(340, 420, 60, 60, 2.0, 4.2, 12), { w: 4.5, col: K.PAL.yellow, dur: 0.15 });
  d6.text('Langit malam', 300, 540, { size: 55, align: 'center', cps: 20, col: K.PAL.yellow });
  const stars2 = [[700, 400, 35], [880, 470, 28], [560, 520, 24], [960, 380, 30]];
  stars2.forEach(([sx, sy, sr]) => {
    const p = [];
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 2 + (i / 4) * Math.PI * 2;
      p.push([sx + Math.cos(a) * sr, sy + Math.sin(a) * sr]);
      p.push([sx + Math.cos(a + Math.PI / 4) * sr * 0.3, sy + Math.sin(a + Math.PI / 4) * sr * 0.3]);
    }
    p.push(p[0]);
    d6.line(p, { w: 3.5, col: K.PAL.lead, dur: 0.07, sketch: 0.3 });
  });
  d6.at(T('tanya', 0.5));
  d6.text('Masa lalu apa?', 700, 680, { size: 100, align: 'center', cps: 12, col: K.PAL.yellow });
  d6.line(G.ellipse(700, 630, 320, 110, -2.6, 0.4), { w: 6, col: K.PAL.yellow, dur: 0.3 });
  ART.push({ d: d6 }); pen.sketch(d6);

  // ---- sound
  AM.sfx('chalk', 0.0, { gain: 0.4 });
  AM.sfx('pop', T('hook', 0.75), { gain: 0.3 });
  AM.sfx('chalk', C.matahari.start, { gain: 0.35 });
  AM.sfx('swoosh_up', C.bintang.start - 0.1, { gain: 0.25, pitch: 0.7 });
  AM.sfx('chalk', C.wajah.start, { gain: 0.35 });
  AM.sfx('ding', C.renung.start + 0.5, { gain: 0.35 });
  AM.sfx('sparkle', C.renung.start + 0.8, { gain: 0.25 });
  AM.sfx('ding', W('tanya', 'Masa') + 0.2, { gain: 0.3 });
}

// ---------------------------------------------------------------- camera
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => [lerp(600, 600, prog(t, C.hook.start, C.hook.end, ease.inOutSine)), 760 - t * 3, 0.90 + t * 0.004]);
shot('matahari', (t) => { const u = prog(t, C.matahari.start, C.matahari.end, ease.inOutSine); return [lerp(600, 560, u), lerp(760, 700, u), lerp(0.90, 0.945, u)]; });
shot('bintang', (t) => { const u = prog(t, C.bintang.start, C.bintang.end, ease.inOutSine); return [lerp(560, 620, u), lerp(700, 680, u), lerp(0.945, 0.99, u)]; });
shot('wajah', (t) => { const u = prog(t, C.wajah.start, C.wajah.end, ease.inOutSine); return [lerp(620, 540, u), lerp(680, 700, u), lerp(0.99, 0.972, u)]; });
shot('renung', (t) => { const u = prog(t, C.renung.start, C.renung.end, ease.inOutSine); return [lerp(540, 560, u), lerp(700, 680, u), lerp(0.972, 1.008, u)]; });
shot('tanya', (t) => { const u = prog(t, C.tanya.start, C.tanya.end, ease.inOutSine); return [lerp(560, 640, u), lerp(680, 700, u), lerp(1.008, 0.98, u)]; });

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
