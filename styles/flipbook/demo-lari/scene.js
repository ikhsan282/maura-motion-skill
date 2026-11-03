// Flipbook demo-lari (≈20 s): "Stickman Lari".
// A spiral notebook held over a desk. Riffle: a ballpoint stickman runs (12 pages a second),
// dust puffs at footfalls, speed lines trail. Then a pen draws two pages by hand (onion skin),
// a riffle brings the run to life, a breathing note appears, and the last page reads TAMAT.
import * as K from '/styles/flipbook/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1470, size: 64 } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const BOOK = { x: 540, y: 800, s: 1 };
const S = {};

// ---------------------------------------------------------------- the mini story on the pages
// k = page index. Run cycle: 6-page gait loop, drifting right across the page.
const NCYC = 40;
function heroPose(k) {
  k = ((k % NCYC) + NCYC) % NCYC;
  const ph = (k % 6) / 6 * Math.PI * 2, sw = Math.sin(ph);
  return { x: 110 + k * 26, y: 690 - Math.abs(Math.cos(ph)) * 14, s: 0.74, lean: 0.18, face: 'open', look: 0.6,
    legs: [[0.7 * sw, 0.6 * Math.max(0, -sw) + 0.2], [-0.7 * sw, 0.6 * Math.max(0, sw) + 0.2]], arms: [[-0.9 * sw, -0.5], [0.9 * sw, -0.5]] };
}
function dustPuff(g, p, seed) {
  // three small puffs behind the back foot
  for (let i = 0; i < 3; i++) {
    const r = 8 + i * 5, dx = p.x - 60 - i * 22, dy = p.y - 6 - i * 4;
    const pts = []; for (let j = 0; j <= 10; j++) { const a = (j / 10) * Math.PI * 2; pts.push([dx + Math.cos(a) * r, dy + Math.sin(a) * r * 0.6]); }
    g.beginPath(); K.inkPath(g, pts, { seed: seed + i * 7, amp: 1.2 }); K.inkStroke(g, 2.4);
  }
}
function motionMarks(g, k, seed) {
  const p = heroPose(k), kk = ((k % NCYC) + NCYC) % NCYC;
  g.beginPath(); g.lineCap = 'round';
  // speed lines trailing the runner
  for (let i = 0; i < 3; i++) K.inkPath(g, [[p.x - 70 - i * 10, p.y - 120 + i * 40], [p.x - 120 - i * 16, p.y - 120 + i * 40]], { seed: seed + i, amp: 1.5 });
  K.inkStroke(g, 3.2);
  if (kk === 2 || kk === 5) dustPuff(g, p, seed + 11); // dust at footfall
}
function groundLine(g, seed) {
  g.beginPath(); K.inkPath(g, [[40, 700], [560, 700]], { seed, amp: 2 }); K.inkStroke(g, 3.6);
}
function breathMark(g, seed) {
  // two arcs beside the chest: inhale/exhale
  g.beginPath(); K.inkPath(g, [[300, 470], [340, 440], [300, 410]], { seed, amp: 1.2 }); K.inkStroke(g, 3);
  g.beginPath(); K.inkPath(g, [[370, 470], [410, 440], [370, 410]], { seed: seed + 3, amp: 1.2 }); K.inkStroke(g, 3);
}
const painter = (g, i) => {
  if (i === 200) { // last page: he rests, TAMAT
    groundLine(g, i);
    K.inkStick(g, heroPose(0), { seed: i });
    K.inkText(g, 'TAMAT', 310, 150, { size: 130 }); g.beginPath(); K.inkPath(g, [[180, 160], [440, 156]], { seed: 4 }); K.inkStroke(g, 4);
    return;
  }
  if (i >= 100) { const k = i - 100; groundLine(g, 50 + k); K.inkStick(g, heroPose(k * 2), { seed: 50 + k }); return; }
  groundLine(g, i); K.inkStick(g, heroPose(i), { seed: i }); motionMarks(g, i, i);
  if (i >= 24) breathMark(g, i); // breathing arcs appear later
};
painter.__key = 'lari';

// ---------------------------------------------------------------- riffle schedule
let RIF = [];
function riffle(t) {
  for (const [a, b, k0, rate] of RIF) if (t >= a && t < b) { const q = (t - a) * rate, k = k0 + Math.floor(q); return { top: k + 1, flip: { page: k, f: 0.3 + hrand(k, 5) * 0.4 }, lift: 1 }; }
  return null;
}

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  S.draw1 = [C.debu.start - 0.05, C.debu.start + 0.85];
  S.turn = [W('debu', 'beterbangan') - 0.05, W('debu', 'beterbangan') + 0.4];
  S.draw2 = [S.turn[1] + 0.05, W('debu', 'Debu') - 0.05];
  S.endPage = C.loop.end - 0.05;
  RIF = [
    [-1, C.debu.start - 0.15, 0, 12],
    [W('debu', 'Debu'), C.garis.start + 0.6, 0, 12],
    [C.garis.start + 0.6, C.napas.start, 18, 6],
    [C.napas.start, S.endPage, 6, 12],
  ];
  S.breath = W('napas', 'Tarik') - 0.1;
  AM.sfx('page_flip', 0.0, { gain: 0.5 });
  AM.sfx('page_flip', 0.9, { gain: 0.35, pitch: 1.2 });
  AM.sfx('pencil', S.draw1[0] + 0.1, { gain: 0.35 });
  AM.sfx('page_flip', S.turn[0], { gain: 0.45, pitch: 0.8 });
  AM.sfx('page_flip', W('debu', 'Debu'), { gain: 0.5, pitch: 1.1 });
  AM.sfx('whoosh', W('garis', 'Garis'), { gain: 0.35 });
  AM.sfx('wind', S.breath, { gain: 0.3 });
  AM.sfx('thud', W('loop', 'Lari'), { gain: 0.4 });
  AM.sfx('ding', S.endPage + 0.05, { gain: 0.35 });
}

// ---------------------------------------------------------------- book state at t
function bookState(t) {
  const r = riffle(t);
  if (r) return { ...r };
  if (t >= S.endPage) return { top: 200, flip: null, lift: 0 };
  if (t >= S.draw1[0] - 0.2 && t < S.turn[0]) {
    const u = clamp((t - S.draw1[0]) / (S.draw1[1] - S.draw1[0]));
    return { live: (g) => { pageBase(g, 300); S.tip = drawLive(g, 0, u, 100); }, flip: null, lift: 0, liveUV: u };
  }
  if (t >= S.turn[0] && t < S.turn[1]) {
    const f = ease.inOutCubic(clamp((t - S.turn[0]) / (S.turn[1] - S.turn[0])));
    return { live: (g) => { pageBase(g, 301); ghost(g, 0); }, flip: { page: 100, f: Math.max(0.01, f) }, lift: 0.5 };
  }
  if (t >= S.turn[1] && t < W('debu', 'Debu')) {
    const u = clamp((t - S.draw2[0]) / (S.draw2[1] - S.draw2[0]));
    return { live: (g) => { pageBase(g, 301); ghost(g, 0); S.tip = drawLive(g, 1, u, 101); }, flip: null, lift: 0, liveUV: u };
  }
  return { top: 0, flip: null, lift: 0 };
}
function pageBase(g, seed) { g.fillStyle = K.PAL.paper; g.fillRect(0, 0, K.PAGE.w, K.PAGE.h); g.fillStyle = 'rgba(80,90,130,0.45)'; g.font = "400 26px 'Caveat'"; g.textAlign = 'right'; g.fillText(String(seed - 299), K.PAGE.w - 24, K.PAGE.h - 22); }
function ghost(g, k) { g.save(); g.__inkAlpha = 0.24; g.beginPath(); K.inkPath(g, [[40, 700], [560, 700]], { seed: 50, amp: 2 }); K.inkStroke(g, 3.6); K.inkStick(g, heroPose(k * 2), { seed: 50 }); g.__inkAlpha = 1; g.restore(); }
function drawLive(g, k, u, seed) {
  const gu = clamp(u * 3);
  g.beginPath(); const tp = K.inkPath(g, [[40, 700], [560, 700]], { u: gu, seed, amp: 2 }); K.inkStroke(g, 3.6);
  if (gu < 1) return tp;
  return K.inkStick(g, heroPose(k * 2), { seed, reveal: clamp((u - 0.33) / 0.67) }) || tp;
}

// ---------------------------------------------------------------- camera per line
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => { const u = prog(t, W('hook', 'lalu') - 0.3, C.hook.end, ease.inOutCubic); return [lerp(540, 640, u), lerp(780, 960, u), lerp(1.1, 1.36, u)]; });
shot('debu', (t) => { const u = prog(t, C.debu.start, C.debu.end, ease.inOutSine); return [lerp(520, 540, u), lerp(800, 780, u), lerp(1.25, 1.12, u)]; });
shot('garis', (t) => { const u = prog(t, C.garis.start, C.garis.end, ease.inOutSine); return [540, lerp(780, 820, u), lerp(1.0, 0.94, u)]; });
shot('napas', (t) => { const u = prog(t, C.napas.start, C.napas.start + 0.8, ease.inOutCubic); return [lerp(540, 580, u), lerp(820, 1170, u), lerp(0.94, 0.98, u) + (t - C.napas.start) * 0.012]; });
shot('loop', (t) => { const u = prog(t, C.loop.start, C.loop.start + 0.8, ease.inOutCubic); return [lerp(580, 800, u), lerp(1170, 820, u), lerp(1.0, 0.84, u) + Math.max(0, t - S.endPage) * 0.03]; });
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
  K.desk(ctx);
  // desk props: an eraser
  ctx.save(); ctx.translate(180, 1380); ctx.rotate(-0.3); ctx.fillStyle = 'rgba(30,15,5,0.25)'; ctx.fillRect(8, 10, 110, 50); ctx.fillStyle = '#efe6d0'; ctx.fillRect(0, 0, 110, 50); ctx.restore();
  // the book
  const st = bookState(t);
  K.book(ctx, { x: BOOK.x, y: BOOK.y, s: BOOK.s, page: painter, top: st.top ?? 0, flip: st.flip, live: st.live, stack: 26 });
  // hands
  const L = st.lift ?? 0;
  K.leftHand(ctx, BOOK.x - 330, BOOK.y + 330, { s: 0.95, rot: 0.35 });
  K.rightThumb(ctx, BOOK.x + 300, BOOK.y + 420, { s: 0.95, lift: L * (0.6 + 0.4 * Math.sin(t * 25)), rot: -0.55 });
  // breathing note card
  if (t > S.breath - 0.1) {
    const u = ease.outCubic(clamp((t - S.breath) / 0.6));
    ctx.save(); ctx.translate(lerp(1500, 620, u), lerp(1700, 1340, u)); ctx.rotate(lerp(0.4, -0.05, u)); ctx.globalAlpha = u;
    ctx.fillStyle = 'rgba(40,20,5,0.3)'; ctx.fillRect(-150 + 10, -110 + 14, 300, 220); ctx.fillStyle = '#f9e47a'; ctx.fillRect(-150, -110, 300, 220);
    ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(-150, -110, 300, 34);
    K.inkText(ctx, 'hembus', 0, 30, { size: 100 }); K.inkText(ctx, 'tarik · buang', 0, 88, { size: 44 });
    ctx.restore();
  }
  // the pen while drawing pages
  if (t > S.draw1[0] - 0.5 && t < S.draw2[1] + 0.6) {
    const W2 = K.PAGE.w, H2 = K.PAGE.h, toWorld = ([px, py]) => [BOOK.x - W2 / 2 + px, BOOK.y - H2 / 2 + py];
    let tip = S.tip ? toWorld(S.tip) : [700, 600], lift = 0;
    const drawing = (t >= S.draw1[0] && t < S.draw1[1]) || (t >= S.draw2[0] && t < S.draw2[1]);
    if (!drawing) { lift = 1; if (t < S.draw1[0]) { const f = clamp((S.draw1[0] - t) / 0.5); tip = [tip[0] + f * 500, tip[1] + f * 400]; } if (t > S.draw2[1]) { const f = clamp((t - S.draw2[1]) / 0.5); tip = [tip[0] + f * 600, tip[1] + f * 450]; } }
    K.pen(ctx, tip[0], tip[1], { lift, ang: -1.05 + (drawing ? noise.n2(t * 7, 2) * 0.05 : 0) });
  }
  // "lari!" sparkles around the book
  if (t > W('loop', 'Lari') - 0.1 && t < C.loop.end) {
    const a = env(t, W('loop', 'Lari') - 0.1, C.loop.end, 0.15, 0.4);
    ctx.save(); ctx.strokeStyle = '#fff6c8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.globalAlpha = a;
    for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2 + 0.3, r0 = 470 + Math.sin(t * 12 + i) * 16; ctx.beginPath(); ctx.moveTo(BOOK.x + Math.cos(ang) * r0 * 0.75, BOOK.y + Math.sin(ang) * r0); ctx.lineTo(BOOK.x + Math.cos(ang) * (r0 + 50) * 0.75, BOOK.y + Math.sin(ang) * (r0 + 50)); ctx.stroke(); }
    ctx.restore();
  }
  AM.lib.vignette(fx, { strength: 0.4, inner: 0.45, color: '30,15,5' });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}
