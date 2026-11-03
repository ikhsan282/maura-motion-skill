// Flipbook demo-bola (≈20 s): "Bola Memantul".
// A spiral notebook held over a desk. Riffle: a ballpoint ball bounces with squash & stretch
// (12 pages a second). Then a pen draws two pages by hand (onion skin), a riffle brings the
// bounce to life, a gravity arrow note appears, and the last page reads TAMAT.
import * as K from '/styles/flipbook/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1470, size: 64 } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const BOOK = { x: 540, y: 800, s: 1 };
const S = {};

// ---------------------------------------------------------------- the mini story on the pages
// k = page index. Ball bounce cycle: parabolic arcs with squash at the floor, stretch in flight.
const NCYC = 24;
function ballPose(k) {
  k = ((k % NCYC) + NCYC) % NCYC;
  // one cycle = 2 bounces of 12 pages: rise 0-5, apex 5-6, fall 6-11, contact 11-12
  const ph = (k % 12) / 12;                 // 0..1 across one bounce
  const ground = 640, apex = 240, cx = 310;
  const x = cx + Math.sin(k / NCYC * Math.PI * 2) * 0; // stays on the spot; wobble comes from ink
  let y, sx = 1, sy = 1;
  if (k === 11 || k === 23) { y = ground; sx = 1.45; sy = 0.55; }        // full squash at contact
  else if (k === 10 || k === 22) { y = ground - 14; sx = 1.2; sy = 0.85; } // pre-squash
  else if (k === 0 || k === 12) { y = ground - 20; sx = 0.8; sy = 1.25; }  // stretch leaving
  else {
    const h = Math.sin(ph * Math.PI);      // 0..1..0 parabola
    y = lerp(ground, apex, h);
    const v = Math.cos(ph * Math.PI);      // vertical speed proxy
    sy = 1 + Math.abs(v) * 0.28; sx = 1 / sy;
  }
  return { x, y, r: 52, sx, sy };
}
function ballDraw(g, p, seed) {
  const pts = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    pts.push([p.x + Math.cos(a) * p.r * p.sx, p.y - p.r * p.sy + Math.sin(a) * p.r * p.sy * 0.5 + p.r * p.sy * 0.5]);
  }
  // circle centred properly: centre at (x, y - r*sy)
  pts.length = 0;
  const cy = p.y - p.r * p.sy;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([p.x + Math.cos(a) * p.r * p.sx, cy + Math.sin(a) * p.r * p.sy]);
  }
  g.beginPath(); K.inkPath(g, pts, { seed, amp: 1.6 }); K.inkStroke(g, 4.4);
  // shine mark
  g.beginPath(); K.inkPath(g, [[p.x - p.r * p.sx * 0.45, cy - p.r * p.sy * 0.5], [p.x - p.r * p.sx * 0.2, cy - p.r * p.sy * 0.72]], { seed: seed + 4, amp: 1 });
  K.inkStroke(g, 3);
}
function motionMarks(g, k, seed) {
  const p = ballPose(k), kk = ((k % NCYC) + NCYC) % NCYC;
  g.beginPath(); g.lineCap = 'round';
  if (kk === 11 || kk === 23) { // impact lines at squash
    for (let i = 0; i < 3; i++) K.inkPath(g, [[p.x - 90 + i * 90, p.y + 8], [p.x - 130 + i * 90, p.y + 46]], { seed: seed + i, amp: 1.5 });
  } else if (kk >= 0 && kk <= 5 || kk >= 12 && kk <= 17) { // rising: speed lines below
    for (let i = 0; i < 2; i++) K.inkPath(g, [[p.x - 16, p.y + 20 + i * 26], [p.x - 16, p.y + 60 + i * 26]], { seed: seed + i, amp: 1.2 });
  }
  K.inkStroke(g, 3);
}
function groundAndArrow(g, k, seed) {
  const kk = ((k % NCYC) + NCYC) % NCYC;
  g.beginPath(); K.inkPath(g, [[40, 650], [560, 650]], { seed, amp: 2 }); K.inkStroke(g, 3.6);
  // gravity arrow appears from page 6
  if (kk >= 6) {
    g.beginPath(); K.inkPath(g, [[520, 300], [520, 420]], { seed: seed + 9, amp: 1.5 }); K.inkStroke(g, 3.4);
    g.beginPath(); K.inkPath(g, [[500, 396], [520, 428], [540, 396]], { seed: seed + 10, amp: 1.2 }); K.inkStroke(g, 3.4);
  }
}
const painter = (g, i) => {
  if (i === 200) { // last page: ball at rest, TAMAT
    groundAndArrow(g, 0, i);
    ballDraw(g, { x: 310, y: 640, r: 52, sx: 1, sy: 1 }, i);
    K.inkText(g, 'TAMAT', 310, 150, { size: 130 }); g.beginPath(); K.inkPath(g, [[180, 160], [440, 156]], { seed: 4 }); K.inkStroke(g, 4);
    return;
  }
  if (i >= 100) { const k = i - 100; groundAndArrow(g, 0, 50 + k); ballDraw(g, ballPose(k * 2), { seed: 50 + k }); return; }
  groundAndArrow(g, i, i); ballDraw(g, ballPose(i), i); motionMarks(g, i, i);
};
painter.__key = 'bola';

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
  S.draw1 = [C.squash.start - 0.05, C.squash.start + 0.85];
  S.turn = [W('squash', 'pipih') - 0.05, W('squash', 'pipih') + 0.4];
  S.draw2 = [S.turn[1] + 0.05, W('squash', 'squash') - 0.05];
  S.endPage = C.loop.end - 0.05;
  RIF = [
    [-1, C.squash.start - 0.15, 0, 12],
    [W('squash', 'Saat'), C.stretch.start + 0.6, 0, 12],
    [C.stretch.start + 0.6, C.gravitasi.start, 18, 6],
    [C.gravitasi.start, S.endPage, 6, 12],
  ];
  S.arrow = W('gravitasi', 'Gravitasi') - 0.1;
  AM.sfx('page_flip', 0.0, { gain: 0.5 });
  AM.sfx('page_flip', 0.9, { gain: 0.35, pitch: 1.2 });
  AM.sfx('pencil', S.draw1[0] + 0.1, { gain: 0.35 });
  AM.sfx('page_flip', S.turn[0], { gain: 0.45, pitch: 0.8 });
  AM.sfx('page_flip', W('squash', 'Saat'), { gain: 0.5, pitch: 1.1 });
  AM.sfx('squish', W('squash', 'pipih'), { gain: 0.5 });
  AM.sfx('boing', W('stretch', 'memanjang'), { gain: 0.45, pitch: 1.2 });
  AM.sfx('whoosh', S.arrow, { gain: 0.35 });
  AM.sfx('thud', W('loop', 'Mantul'), { gain: 0.4 });
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
  if (t >= S.turn[1] && t < W('squash', 'Saat')) {
    const u = clamp((t - S.draw2[0]) / (S.draw2[1] - S.draw2[0]));
    return { live: (g) => { pageBase(g, 301); ghost(g, 0); S.tip = drawLive(g, 1, u, 101); }, flip: null, lift: 0, liveUV: u };
  }
  return { top: 0, flip: null, lift: 0 };
}
function pageBase(g, seed) { g.fillStyle = K.PAL.paper; g.fillRect(0, 0, K.PAGE.w, K.PAGE.h); g.fillStyle = 'rgba(80,90,130,0.45)'; g.font = "400 26px 'Caveat'"; g.textAlign = 'right'; g.fillText(String(seed - 299), K.PAGE.w - 24, K.PAGE.h - 22); }
function ghost(g, k) { g.save(); g.__inkAlpha = 0.24; g.beginPath(); K.inkPath(g, [[40, 650], [560, 650]], { seed: 50, amp: 2 }); K.inkStroke(g, 3.6); ballDraw(g, ballPose(k * 2), 50); g.__inkAlpha = 1; g.restore(); }
function drawLive(g, k, u, seed) {
  const gu = clamp(u * 3);
  g.beginPath(); const tp = K.inkPath(g, [[40, 650], [560, 650]], { u: gu, seed, amp: 2 }); K.inkStroke(g, 3.6);
  if (gu < 1) return tp;
  const p = ballPose(k * 2);
  // reveal: draw the ball outline progressively by scaling u over the circle path
  const ru = clamp((u - 0.33) / 0.67);
  g.beginPath(); const pts = []; const n = 26; const cy = p.y - p.r * p.sy;
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; pts.push([p.x + Math.cos(a) * p.r * p.sx, cy + Math.sin(a) * p.r * p.sy]); }
  K.inkPath(g, pts, { u: ru, seed, amp: 1.6 }); K.inkStroke(g, 4.4);
  return pts[Math.floor(n * ru)] || tp;
}

// ---------------------------------------------------------------- camera per line
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => { const u = prog(t, W('hook', 'tapi') - 0.3, C.hook.end, ease.inOutCubic); return [lerp(540, 640, u), lerp(780, 960, u), lerp(1.1, 1.36, u)]; });
shot('squash', (t) => { const u = prog(t, C.squash.start, C.squash.end, ease.inOutSine); return [lerp(520, 540, u), lerp(800, 780, u), lerp(1.25, 1.12, u)]; });
shot('stretch', (t) => { const u = prog(t, C.stretch.start, C.stretch.end, ease.inOutSine); return [540, lerp(780, 820, u), lerp(1.0, 0.94, u)]; });
shot('gravitasi', (t) => { const u = prog(t, C.gravitasi.start, C.gravitasi.start + 0.8, ease.inOutCubic); return [lerp(540, 580, u), lerp(820, 1170, u), lerp(0.94, 0.98, u) + (t - C.gravitasi.start) * 0.012]; });
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
  // gravity note card
  if (t > S.arrow - 0.1) {
    const u = ease.outCubic(clamp((t - S.arrow) / 0.6));
    ctx.save(); ctx.translate(lerp(1500, 620, u), lerp(1700, 1340, u)); ctx.rotate(lerp(0.4, -0.05, u)); ctx.globalAlpha = u;
    ctx.fillStyle = 'rgba(40,20,5,0.3)'; ctx.fillRect(-150 + 10, -110 + 14, 300, 220); ctx.fillStyle = '#f9e47a'; ctx.fillRect(-150, -110, 300, 220);
    ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(-150, -110, 300, 34);
    K.inkText(ctx, 'g = 9.8', 0, 30, { size: 110 }); K.inkText(ctx, 'm/s² turun', 0, 88, { size: 44 });
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
  // "mantul!" sparkles around the book
  if (t > W('loop', 'Mantul') - 0.1 && t < C.loop.end) {
    const a = env(t, W('loop', 'Mantul') - 0.1, C.loop.end, 0.15, 0.4);
    ctx.save(); ctx.strokeStyle = '#fff6c8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.globalAlpha = a;
    for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2 + 0.3, r0 = 470 + Math.sin(t * 12 + i) * 16; ctx.beginPath(); ctx.moveTo(BOOK.x + Math.cos(ang) * r0 * 0.75, BOOK.y + Math.sin(ang) * r0); ctx.lineTo(BOOK.x + Math.cos(ang) * (r0 + 50) * 0.75, BOOK.y + Math.sin(ang) * (r0 + 50)); ctx.stroke(); }
    ctx.restore();
  }
  AM.lib.vignette(fx, { strength: 0.4, inner: 0.45, color: '30,15,5' });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}
