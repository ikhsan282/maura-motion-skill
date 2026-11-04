// Flipbook demo (19 s): "Animasi lahir dari pojok buku".
// A spiral notebook held over a desk. Riffle: a ballpoint stickman runs, jumps and flies (12 pages a second).
// Then a pen draws two pages by hand (onion skin), a riffle brings him to life, an 1868 patent card is stamped,
// a film strip rolls next to the book (24 frames a second) and the last page reads TAMAT.
import * as K from '/styles/flipbook/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1470, size: 64 } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const BOOK = { x: 540, y: 800, s: 1 };
const S = {};

// ---------------------------------------------------------------- the mini story on the pages
// k = page index. 0-13 run, 14-21 crouch + jump, 22-39 fly up and away, then loops.
const NCYC = 40;
function heroPose(k) {
  k = ((k % NCYC) + NCYC) % NCYC;
  if (k < 14) {
    const ph = (k % 6) / 6 * Math.PI * 2, sw = Math.sin(ph);
    return { x: 110 + k * 26, y: 690 - Math.abs(Math.cos(ph)) * 14, s: 0.74, lean: 0.18, face: 'open', look: 0.6,
      legs: [[0.7 * sw, 0.6 * Math.max(0, -sw) + 0.2], [-0.7 * sw, 0.6 * Math.max(0, sw) + 0.2]], arms: [[-0.9 * sw, -0.5], [0.9 * sw, -0.5]] };
  }
  if (k < 22) {
    const j = k - 14; const crouch = j < 2 ? j / 2 : 0, up = j >= 2 ? Math.sin(((j - 2) / 6) * Math.PI * 0.5) : 0;
    return { x: 470 + j * 8, y: 690 - up * 230 + crouch * 30, s: 0.74, lean: 0.1, face: j >= 2 ? 'wow' : 'smile', look: 0.6,
      legs: j < 2 ? [[1.2, -2.0], [0.9, -1.8]] : [[0.3, 0.6], [-0.2, 0.9]], arms: j < 2 ? [[-0.6, -0.4], [-0.9, -0.3]] : [[2.8, 0.1], [2.5, 0.2]] };
  }
  const f = (k - 22) / 17;
  return { x: 500 - f * 360 + Math.sin(f * 6) * 30, y: 470 - f * 320 + Math.sin(f * 9) * 20, s: 0.72 - f * 0.12, lean: -1.35, face: 'happy', look: 0.2, cape: 0.5 + Math.sin(k) * 0.5,
    legs: [[0.15, 0.1], [-0.05, 0.2]], arms: [[2.9, 0.1], [2.6, 0.1]] };
}
function motionMarks(g, k, seed) {
  const p = heroPose(k), kk = ((k % NCYC) + NCYC) % NCYC;
  g.beginPath(); g.lineCap = 'round';
  if (kk < 14) for (let i = 0; i < 3; i++) K.inkPath(g, [[p.x - 70 - i * 10, p.y - 120 + i * 40], [p.x - 120 - i * 16, p.y - 120 + i * 40]], { seed: seed + i, amp: 1.5 });
  else if (kk >= 22) for (let i = 0; i < 3; i++) K.inkPath(g, [[p.x + 60, p.y - 170 + i * 36], [p.x + 130 + i * 10, p.y - 150 + i * 46]], { seed: seed + i, amp: 1.5 });
  K.inkStroke(g, 3.2);
}
function groundAndSky(g, k, seed) {
  const kk = ((k % NCYC) + NCYC) % NCYC;
  g.beginPath(); K.inkPath(g, [[40, 700], [560, 700]], { seed, amp: 2 }); K.inkStroke(g, 3.6);
  g.beginPath(); K.inkPath(g, [[440, 700], [470, 650], [510, 700]], { seed: seed + 3, amp: 1.5 }); K.inkStroke(g, 3);
  if (kk >= 18) { g.beginPath(); const cx = 450, cy = 190; const pts = []; for (let i = 0; i <= 18; i++) { const a = Math.PI * (1 + i / 18); pts.push([cx + Math.cos(a) * 80, cy + Math.sin(a) * 40 - Math.abs(Math.sin(i * 0.9)) * 18]); } K.inkPath(g, pts, { seed: seed + 9, amp: 1 }); K.inkStroke(g, 3); }
}
const painter = (g, i) => {
  if (i === 200) { // last page: he flies off, TAMAT
    groundAndSky(g, 30, i); K.inkStick(g, heroPose(36), { seed: i }); motionMarks(g, 36, i);
    K.inkText(g, 'TAMAT', 310, 150, { size: 130 }); g.beginPath(); K.inkPath(g, [[180, 160], [440, 156]], { seed: 4 }); K.inkStroke(g, 4);
    return;
  }
  if (i >= 100) { const k = i - 100; groundAndSky(g, 0, 50 + k); K.inkStick(g, heroPose(k * 2), { seed: 50 + k }); return; }
  groundAndSky(g, i, i); K.inkStick(g, heroPose(i), { seed: i }); motionMarks(g, i, i);
};
painter.__key = 'hero';

// ---------------------------------------------------------------- riffle schedule
// Riffles: [start, end, first page, pages per second]
let RIF = [];
function riffle(t) {
  for (const [a, b, k0, rate] of RIF) if (t >= a && t < b) { const q = (t - a) * rate, k = k0 + Math.floor(q); return { top: k + 1, flip: { page: k, f: 0.3 + hrand(k, 5) * 0.4 }, lift: 1 }; }
  return null;
}

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  S.draw1 = [C.gambar.start - 0.05, C.gambar.start + 0.85];
  S.turn = [W('gambar', 'sedikit') - 0.05, W('gambar', 'sedikit') + 0.4];
  S.draw2 = [S.turn[1] + 0.05, W('gambar', 'lalu') - 0.05];
  S.endPage = C.kartun.end - 0.05;
  RIF = [
    [-1, C.gambar.start - 0.15, 0, 12],
    [W('gambar', 'balik'), C.paten.start + 0.6, 0, 12],
    [C.paten.start + 0.6, C.kartun.start, 18, 6],
    [C.kartun.start, S.endPage, 6, 12],
  ];
  S.card = { in: W('paten', 'Tahun') - 0.05, stamp: W('paten', 'dipatenkan'), note: W('paten', 'gambar') - 0.1 };
  S.strip = C.kartun.start + 0.1;
  AM.sfx('page_flip', 0.0, { gain: 0.5 });
  AM.sfx('page_flip', 0.9, { gain: 0.35, pitch: 1.2 });
  AM.sfx('pencil', S.draw1[0] + 0.1, { gain: 0.35 });
  AM.sfx('page_flip', S.turn[0], { gain: 0.45, pitch: 0.8 });
  AM.sfx('page_flip', W('gambar', 'balik'), { gain: 0.5, pitch: 1.1 });
  AM.sfx('sparkle', W('hidup', 'hidup'), { gain: 0.35 });
  AM.sfx('stamp', S.card.stamp + 0.15, { gain: 0.5 });
  AM.sfx('ding', S.endPage + 0.05, { gain: 0.35 });
}

// ---------------------------------------------------------------- book state at t
function bookState(t) {
  const r = riffle(t);
  if (r) return { ...r };
  if (t >= S.endPage) return { top: 200, flip: null, lift: 0 };
  // hand-drawing pages
  if (t >= S.draw1[0] - 0.2 && t < S.turn[0]) {
    const u = clamp((t - S.draw1[0]) / (S.draw1[1] - S.draw1[0]));
    return { live: (g) => { pageBase(g, 300); S.tip = drawLive(g, 0, u, 100); }, flip: null, lift: 0, liveUV: u };
  }
  if (t >= S.turn[0] && t < S.turn[1]) {
    const f = ease.inOutCubic(clamp((t - S.turn[0]) / (S.turn[1] - S.turn[0])));
    return { live: (g) => { pageBase(g, 301); ghost(g, 0); }, flip: { page: 100, f: Math.max(0.01, f) }, lift: 0.5 };
  }
  if (t >= S.turn[1] && t < W('gambar', 'balik')) {
    const u = clamp((t - S.draw2[0]) / (S.draw2[1] - S.draw2[0]));
    return { live: (g) => { pageBase(g, 301); ghost(g, 0); S.tip = drawLive(g, 1, u, 101); }, flip: null, lift: 0, liveUV: u };
  }
  return { top: 0, flip: null, lift: 0 };
}
function pageBase(g, seed) { g.fillStyle = K.PAL.paper; g.fillRect(0, 0, K.PAGE.w, K.PAGE.h); g.fillStyle = 'rgba(80,90,130,0.45)'; g.font = "400 26px 'Caveat'"; g.textAlign = 'right'; g.fillText(String(seed - 299), K.PAGE.w - 24, K.PAGE.h - 22); }
function ghost(g, k) { g.save(); g.__inkAlpha = 0.24; g.beginPath(); K.inkPath(g, [[40, 700], [560, 700]], { seed: 50, amp: 2 }); K.inkStroke(g, 3.6); K.inkStick(g, heroPose(k * 2), { seed: 50 }); g.__inkAlpha = 1; g.restore(); }
function drawLive(g, k, u, seed) {
  // ground first, then the figure
  const gu = clamp(u * 3);
  g.beginPath(); const tp = K.inkPath(g, [[40, 700], [560, 700]], { u: gu, seed: seed, amp: 2 }); K.inkStroke(g, 3.6);
  if (gu < 1) return tp;
  return K.inkStick(g, heroPose(k * 2), { seed, reveal: clamp((u - 0.33) / 0.67) }) || tp;
}

// ---------------------------------------------------------------- camera per line
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => { const u = prog(t, W('hook', 'pojok') - 0.3, C.hook.end, ease.inOutCubic); return [lerp(540, 640, u), lerp(780, 960, u), lerp(1.1, 1.36, u)]; });
shot('gambar', (t) => { const u = prog(t, C.gambar.start, C.gambar.end, ease.inOutSine); return [lerp(520, 540, u), lerp(800, 780, u), lerp(1.25, 1.12, u)]; });
shot('hidup', (t) => { const u = prog(t, C.hidup.start, C.hidup.end, ease.inOutSine); return [540, lerp(780, 820, u), lerp(1.0, 0.94, u)]; });
shot('paten', (t) => { const u = prog(t, C.paten.start, C.paten.start + 0.8, ease.inOutCubic); return [lerp(540, 580, u), lerp(820, 1170, u), lerp(0.94, 0.98, u) + (t - C.paten.start) * 0.012]; });
shot('kartun', (t) => { const u = prog(t, C.kartun.start, C.kartun.start + 0.8, ease.inOutCubic); return [lerp(580, 800, u), lerp(1170, 820, u), lerp(1.0, 0.84, u) + Math.max(0, t - S.endPage) * 0.03]; });
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
  // desk props: an eraser and a spare pencil stub
  ctx.save(); ctx.translate(180, 1380); ctx.rotate(-0.3); ctx.fillStyle = 'rgba(30,15,5,0.25)'; ctx.fillRect(8, 10, 110, 50); ctx.fillStyle = '#efe6d0'; ctx.fillRect(0, 0, 110, 50); ctx.restore();
  // film strip (behind the book, slides in from the right)
  if (t > S.strip - 0.2) {
    const sl = 1 - ease.outCubic(clamp((t - S.strip) / 0.7));
    K.filmStrip(ctx, 1010 + sl * 600, 330, { w: 300, fh: 250, n: 5, offset: (t - S.strip) * 250 * 6, from: 0, frame: (g, k, w, h) => {
      g.fillStyle = '#efe9d8'; g.fillRect(0, 0, w, h);
      g.save(); g.scale(w / 620, h / 450); g.translate(0, -300); g.lineCap = 'round';
      g.beginPath(); K.inkPath(g, [[40, 700], [560, 700]], { seed: k, amp: 2 }); K.inkStroke(g, 5);
      K.inkStick(g, heroPose(k), { seed: k, w: 1.3 }); g.restore();
    } });
    // sticky note: 24 per second
    const na = clamp((t - W('kartun', '24') + 0.3) / 0.3);
    if (na > 0) {
      ctx.save(); ctx.translate(1150, 1080); ctx.rotate(0.06); ctx.globalAlpha = na; const k = 1 + (1 - ease.outBack(na)) * 0.4; ctx.scale(k, k);
      ctx.fillStyle = 'rgba(40,20,5,0.3)'; ctx.fillRect(-150 + 10, -110 + 14, 300, 220); ctx.fillStyle = '#f9e47a'; ctx.fillRect(-150, -110, 300, 220);
      ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(-150, -110, 300, 34);
      const n = Math.min(24, Math.max(1, Math.floor((t - W('kartun', '24') + 0.3) * 24)));
      K.inkText(ctx, String(n), 0, 30, { size: 130 }); K.inkText(ctx, 'bingkai / detik', 0, 88, { size: 44 });
      ctx.restore();
    }
  }
  // the book
  const st = bookState(t);
  K.book(ctx, { x: BOOK.x, y: BOOK.y, s: BOOK.s, page: painter, top: st.top ?? 0, flip: st.flip, live: st.live, stack: 26 });
  // hands
  const L = st.lift ?? 0;
  K.leftHand(ctx, BOOK.x - 330, BOOK.y + 330, { s: 0.95, rot: 0.35 });
  K.rightThumb(ctx, BOOK.x + 300, BOOK.y + 420, { s: 0.95, lift: L * (0.6 + 0.4 * Math.sin(t * 25)), rot: -0.55 });
  // patent card
  if (t > S.card.in - 0.1) {
    const u = ease.outCubic(clamp((t - S.card.in) / 0.6));
    K.patentCard(ctx, lerp(1500, 600, u), lerp(1700, 1330, u), { rot: lerp(0.5, -0.05, u), title: 'KINEOGRAF', sub: 'John Barnes Linnett', year: '1868', stamp: clamp((t - S.card.stamp) / 0.25), s: 1.05 });
    if (t > S.card.note) { const p = clamp((t - S.card.note) / 0.6); K.inkText(ctx, '= gambar bergerak', 600, 1580, { size: 76, u: p, col: K.PAL.desk === 0 ? '' : '#fdf6e0' }); }
  }
  // the pen while drawing pages
  if (t > S.draw1[0] - 0.5 && t < S.draw2[1] + 0.6) {
    const W2 = K.PAGE.w, H2 = K.PAGE.h, toWorld = ([px, py]) => [BOOK.x - W2 / 2 + px, BOOK.y - H2 / 2 + py];
    let tip = S.tip ? toWorld(S.tip) : [700, 600], lift = 0;
    const drawing = (t >= S.draw1[0] && t < S.draw1[1]) || (t >= S.draw2[0] && t < S.draw2[1]);
    if (!drawing) { lift = 1; if (t < S.draw1[0]) { const f = clamp((S.draw1[0] - t) / 0.5); tip = [tip[0] + f * 500, tip[1] + f * 400]; } if (t > S.draw2[1]) { const f = clamp((t - S.draw2[1]) / 0.5); tip = [tip[0] + f * 600, tip[1] + f * 450]; } }
    K.pen(ctx, tip[0], tip[1], { lift, ang: -1.05 + (drawing ? noise.n2(t * 7, 2) * 0.05 : 0) });
  }
  // "hidup!" sparkles around the book
  if (t > W('hidup', 'hidup') - 0.1 && t < C.hidup.end) {
    const a = env(t, W('hidup', 'hidup') - 0.1, C.hidup.end, 0.15, 0.4);
    ctx.save(); ctx.strokeStyle = '#fff6c8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.globalAlpha = a;
    for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2 + 0.3, r0 = 470 + Math.sin(t * 12 + i) * 16; ctx.beginPath(); ctx.moveTo(BOOK.x + Math.cos(ang) * r0 * 0.75, BOOK.y + Math.sin(ang) * r0); ctx.lineTo(BOOK.x + Math.cos(ang) * (r0 + 50) * 0.75, BOOK.y + Math.sin(ang) * (r0 + 50)); ctx.stroke(); }
    ctx.restore();
  }
  AM.lib.vignette(fx, { strength: 0.4, inner: 0.45, color: '30,15,5' });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}
