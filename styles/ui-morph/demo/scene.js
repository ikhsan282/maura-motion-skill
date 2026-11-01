// One-Shape UI Morph demo (20 s): "Satu Tombol yang Berubah Jadi Makan Malammu".
// One black shape, zero cuts: button -> (preview flicks) -> loader -> check -> restaurant pin -> map with a moving
// courier -> countdown -> doorbell -> toast -> five stars -> back to the button (last frame = first frame).
import * as K from '/styles/ui-morph/kit.js';
const { clamp, lerp, ease, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1480, size: 54, box: { fill: 'rgba(14,14,16,0.86)', pad: 20, radius: 30 } } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const CX = 540, CY = 860;
const SH = {
  button: { x: CX, y: CY, w: 560, h: 136, r: 68, elev: 1 },
  loader: { x: CX, y: CY, w: 150, h: 150, elev: 1.1 },
  check: { x: CX, y: CY, w: 170, h: 170, elev: 1.2, color: P.accent },
  pin: { x: CX, y: CY - 30, w: 190, h: 190, elev: 1.5 },
  map: { x: CX, y: CY, w: 820, h: 560, r: 56, elev: 1.6 },
  timer: { x: CX, y: CY, w: 400, h: 400, elev: 1.3 },
  bell: { x: CX, y: CY, w: 250, h: 250, elev: 1.4 },
  toast: { x: CX, y: CY - 60, w: 780, h: 150, r: 75, elev: 1.7 },
  stars: { x: CX, y: CY, w: 700, h: 150, r: 75, elev: 1.2 },
};
let STATES = [], CLICKS = [], PTR = [], STEPS = [];
export async function setup(AM) {
  ctx = AM.layer('stage');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const b = W('hook', 'berubah') - 0.05;
  const T = {
    click: W('pesan', 'tekan') + 0.12, spin: W('pesan', 'berputar') - 0.1, check: W('pesan', 'centang') - 0.1,
    pin: W('kurir', 'pin') - 0.1, map: W('kurir', 'titik') - 0.12, timer: C.timer.start - 0.05,
    bell: C.bel.start - 0.08, toast: W('bel', 'Bel') + 0.05, stars: W('akhir', 'lima') - 0.15, back: W('akhir', 'Satu') + 0.1,
  };
  T.star5 = T.stars + 0.55;
  Object.assign(TT, T);
  const st = (t, k) => [t, { ...SH[k] }, k];
  STATES = [
    st(0, 'button'),
    st(b, 'pin'), st(b + 0.27, 'map'), st(b + 0.54, 'timer'), st(b + 0.81, 'stars'), st(b + 1.12, 'button'),
    st(T.spin, 'loader'), st(T.check, 'check'), st(T.pin, 'pin'), st(T.map, 'map'), st(T.timer, 'timer'),
    st(T.bell, 'bell'), st(T.toast, 'toast'), st(T.stars, 'stars'), st(T.back, 'button'),
  ];
  CLICKS = [T.click, T.star5];
  const [s5x, s5y] = [CX + 2 * 120, CY];
  PTR = [[0, 1180, 1560], [0.02, 860, 1190], [T.click - 0.55, 640, 905], [T.click + 0.35, 860, 1190], [T.star5 - 0.45, s5x + 12, s5y + 10], [T.back + 0.25, 860, 1190], [AM.duration - 0.7, 1180, 1560]];
  STEPS = [[0, 'Tombol pesan'], [T.spin, 'Memproses'], [T.check, 'Dikonfirmasi'], [T.pin, 'Restoran'], [T.map, 'Kurir di jalan'], [T.timer, 'Tiba sebentar lagi'], [T.bell, 'Di depan pintu'], [T.stars, 'Beri nilai']];
  AM.sfx('swoosh_up', b, { gain: 0.3, pitch: 1.3 });
  AM.sfx('click', T.click, { gain: 0.5 });
  AM.sfx('tick', T.check + 0.15, { gain: 0.45, pitch: 1.2 });
  AM.sfx('pop', T.pin + 0.05, { gain: 0.4 });
  AM.sfx('tick', W('timer', '12'), { gain: 0.4 });
  AM.sfx('ding', T.bell + 0.05, { gain: 0.45, pitch: 1.0 });
  AM.sfx('ding', T.bell + 0.32, { gain: 0.45, pitch: 0.8 });
  AM.sfx('sparkle', T.star5 + 0.05, { gain: 0.3 });
}
const TT = {};

// ---------------------------------------------------------------- contents (drawn inside/around the shape)
const ROUTE = [[-300, 170], [-160, 170], [-160, 20], [60, 20], [60, -150], [290, -150]];
const routeAt = (u) => {
  const segs = []; let L = 0;
  for (let i = 1; i < ROUTE.length; i++) { const d = Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]); segs.push(d); L += d; }
  let d = clamp(u) * L;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const k = d / segs[i]; return [lerp(ROUTE[i][0], ROUTE[i + 1][0], k), lerp(ROUTE[i][1], ROUTE[i + 1][1], k)]; } d -= segs[i]; }
  return ROUTE[ROUTE.length - 1];
};
function content(kind, s, t, t0, t1) {
  const short = t1 - t0 < 0.5;
  const E = K.swap(t, t0 + (short ? 0.03 : 0.1), t1, short ? { inDur: 0.08, outDur: 0.06, roll: 12 } : {});
  if (E.a <= 0) return;
  ctx.save(); ctx.globalAlpha *= E.a; ctx.translate(0, E.dy);
  // clip to the shape so content never spills while it morphs
  AM.lib.roundRect(ctx, s.x - s.w / 2, s.y - s.h / 2 - E.dy, s.w, s.h, s.r); ctx.clip();
  const x = s.x, y = s.y;
  if (kind === 'button') {
    K.G.bag(ctx, x - 175, y - 4, 54);
    K.label(ctx, 'Pesan', x - 120, y, { size: 46, align: 'left' });
    K.label(ctx, 'Rp45.000', x + 210, y + 2, { size: 34, weight: 400, color: 'rgba(255,255,255,0.55)', align: 'right', spacing: 0 });
  } else if (kind === 'loader') K.G.spinner(ctx, x, y, 34, t);
  else if (kind === 'check') K.G.check(ctx, x, y, 110, clamp((t - t0 - 0.08) / 0.3), P.white, 12);
  else if (kind === 'pin') K.G.pinHole(ctx, x, y, 34);
  else if (kind === 'map') {
    ctx.save(); ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 14;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(-420, i * 90 + 20); ctx.lineTo(420, i * 90 + 20); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i * 110 - 50, -300); ctx.lineTo(i * 110 - 50, 300); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 8; ctx.setLineDash([2, 16]); ctx.lineCap = 'round';
    ctx.beginPath(); ROUTE.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b))); ctx.stroke(); ctx.setLineDash([]);
    const u = short ? 0.4 : ease.inOutSine(clamp((t - t0 - 0.35) / (t1 - t0 - 0.5)));
    // travelled part solid
    ctx.strokeStyle = P.accent; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(...ROUTE[0]);
    for (let k = 1; k <= 40; k++) { const q = routeAt(u * k / 40); ctx.lineTo(q[0], q[1]); } ctx.stroke();
    ctx.fillStyle = P.white; ctx.beginPath(); ctx.arc(ROUTE[0][0], ROUTE[0][1], 16, 0, Math.PI * 2); ctx.fill();
    // home
    const [hx, hy] = ROUTE[ROUTE.length - 1];
    ctx.fillStyle = P.white; ctx.beginPath(); ctx.moveTo(hx - 24, hy + 2); ctx.lineTo(hx, hy - 22); ctx.lineTo(hx + 24, hy + 2); ctx.lineTo(hx + 18, hy + 2); ctx.lineTo(hx + 18, hy + 24); ctx.lineTo(hx - 18, hy + 24); ctx.lineTo(hx - 18, hy + 2); ctx.closePath(); ctx.fill();
    const [cx, cy] = routeAt(u);
    ctx.fillStyle = 'rgba(255,90,31,0.25)'; ctx.beginPath(); ctx.arc(cx, cy, 30 + 6 * Math.sin(t * 8), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.accent; ctx.beginPath(); ctx.arc(cx, cy, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = P.white; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
    K.label(ctx, 'Kurir · ' + (2.1 - 1.9 * u).toFixed(1).replace('.', ',') + ' km', -360, -230, { size: 30, align: 'left', spacing: 0 });
    ctx.restore();
  } else if (kind === 'timer') {
    const run = short ? 0.3 : clamp((t - t0) / 2.2);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(x, y, 160, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = P.accent; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, 160, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - run * 0.25)); ctx.stroke();
    const n = short ? 12 : lerp(18, 12, ease.outCubic(clamp((t - t0 - 0.1) / Math.max(0.3, W('timer', '12') - t0 + 0.1))));
    K.odometer(ctx, n, x, y - 14, { size: 150, digits: 2 });
    K.label(ctx, 'menit', x, y + 88, { size: 34, weight: 400, color: 'rgba(255,255,255,0.6)', spacing: 0 });
  } else if (kind === 'bell') {
    const sw = Math.sin((t - t0) * 16) * 0.35 * Math.exp(-(t - t0) * 1.6);
    K.G.bell(ctx, x, y + 6, 120, sw);
  } else if (kind === 'toast') {
    ctx.fillStyle = P.accent; ctx.beginPath(); ctx.arc(x - 300, y, 46, 0, Math.PI * 2); ctx.fill();
    K.G.bell(ctx, x - 300, y + 4, 52, Math.sin(t * 14) * 0.2);
    K.label(ctx, 'Kurir di depan pintu', x - 230, y - 18, { size: 38, align: 'left', spacing: 0 });
    K.label(ctx, 'Makan malammu tiba', x - 230, y + 28, { size: 28, weight: 400, color: 'rgba(255,255,255,0.6)', align: 'left', spacing: 0 });
  } else if (kind === 'stars') {
    for (let i = 0; i < 5; i++) {
      const f = short ? 1 : K.sp(t, TT.star5 - 0.35 + i * 0.09, 0.3, 0.55);
      K.G.star(ctx, x + (i - 2) * 120, y + 2, 46, f);
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- frame
export function render(t) {
  K.stage(ctx, t);
  const idx = K.stateIndex(t, STATES);
  const s = K.shapeAt(t, STATES.map(([a, b]) => [a, b]), { z: 0.68, ts: 0.36, lag: 1.4 });
  // camera rides the same curve: a small zoom kick on every morph, settling slower than the shape
  let kick = 0; for (let i = 1; i < STATES.length; i++) { const d = t - STATES[i][0]; if (d > 0 && d < 1.2) kick += 0.022 * Math.exp(-d * 3) * Math.sin(Math.min(d * 5, Math.PI)); }
  const z = 1 + kick, drift = Math.sin(t * 0.4) * 6;
  ctx.setTransform(z, 0, 0, z, CX - CX * z, CY - CY * z + drift);
  const p = K.pointerAt(t, PTR, CLICKS, { z: 0.95, ts: 0.75 });
  const press = Math.max(0, ...CLICKS.map((c) => (Math.abs(t - c) < 0.12 && Math.hypot(p.x - s.x, p.y - s.y) < 300 ? 1 - Math.abs(t - c) / 0.12 : 0)));
  // pin tail grows from the circle
  const kind = STATES[idx][2];
  const tail = kind === 'pin' ? K.sp(t, STATES[idx][0] + 0.05, 0.35, 0.6) * (1 - K.sp(t, STATES[idx + 1] ? STATES[idx + 1][0] - 0.12 : 99, 0.15, 1)) : 0;
  if (tail > 0.01) {
    ctx.fillStyle = s.color; ctx.beginPath(); ctx.moveTo(s.x - s.w * 0.36, s.y + s.h * 0.22); ctx.lineTo(s.x, s.y + s.h / 2 + 70 * tail); ctx.lineTo(s.x + s.w * 0.36, s.y + s.h * 0.22); ctx.closePath(); ctx.fill();
  }
  K.body(ctx, s, { press });
  if (tail > 0.01) { ctx.fillStyle = s.color; ctx.beginPath(); ctx.moveTo(s.x - s.w * 0.36, s.y + s.h * 0.22); ctx.lineTo(s.x, s.y + s.h / 2 + 70 * tail); ctx.lineTo(s.x + s.w * 0.36, s.y + s.h * 0.22); ctx.closePath(); ctx.fill(); }
  // contents: current state (and the previous one while it rolls out)
  for (let i = Math.max(0, idx - 1); i <= idx; i++) content(STATES[i][2], s, t, STATES[i][0], STATES[i + 1] ? STATES[i + 1][0] : 99);
  // doorbell rings
  if (t > TT.bell) for (const k of [0, 0.27]) K.ring(ctx, s.x, s.y, t - TT.bell - k, { r: 200, dur: 0.7, lw: 4 });
  // secondary line under the shape (ink on the stage)
  const subs = [[TT.pin, TT.map, 'Warung Bu Sri · 1,2 km'], [TT.timer, TT.bell, 'Perkiraan tiba'], [TT.stars, TT.back, 'Bagaimana makan malammu?']];
  for (const [a, b, str] of subs) { const E = K.swap(t, a + 0.15, b); if (E.a > 0) K.label(ctx, str, CX, CY + 250 + E.dy, { size: 34, weight: 400, color: P.ink2, alpha: E.a, spacing: 0 }); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.stepper(ctx, t, STEPS, 120, 300);
  for (const c of CLICKS) K.ring(ctx, ...(c === CLICKS[0] ? [640, 905] : [CX + 252, CY + 10]), t - c, { r: 60 });
  K.pointer(ctx, p.x, p.y, { press: p.press, scale: 1.05 });
}
