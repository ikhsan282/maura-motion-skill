// Product Film Light demo (20 s): "Satu Detik di Balik Scan Kode QR".
// One continuous world (no hard cuts): the phone and the four parties sit on one long stage; a Screen-Studio
// camera follows the payment packet down the route, pulls out for the turn, then rewinds home to "Berhasil".
import * as K from '/styles/product-light/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1478, size: 56, box: { fill: 'rgba(17,17,20,0.80)', pad: 20, radius: 28 } } };

let bg, world, ui;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

// ---------------------------------------------------------------- world layout
const PH = { x: 540, y: 980, s: 1.12 };
const toW = (lx, ly) => [PH.x + (lx - 195) * PH.s, PH.y + (ly - 422) * PH.s];
const NODES = [
  { x: 360, y: 2380, n: 1, title: 'Penerbit', sub: 'Aplikasi atau bank kamu', icon: K.ICON.bank },
  { x: 720, y: 3400, n: 2, title: 'Lembaga switching', sub: 'Penghubung antar penyedia', icon: K.ICON.route },
  { x: 360, y: 4420, n: 3, title: 'Acquirer', sub: 'Penyedia pembayaran toko', icon: K.ICON.shield },
];
const KASIR = { x: 660, y: 5560, s: 0.95 };
const ROUTES = [
  [[540, 1462], [540, 1820], [360, 1830], [360, 2185]],
  [[360, 2575], [360, 2900], [720, 2880], [720, 3205]],
  [[720, 3595], [720, 3920], [360, 3900], [360, 4225]],
  [[360, 4615], [360, 4900], [660, 4880], [660, 5150]],
];

let CAM = [], LEG = [], T = {};
export async function setup(AM) {
  bg = AM.layer('bg'); world = AM.layer('world'); ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const sw = W('alur', 'switching'), aq = W('alur', 'acquirer');
  T = { lock: W('hook', 'bayar') - 0.1, four: W('hook', 'empat') - 0.05, n2: sw - 0.35, n3: aq - 0.35, settle: W('tapi', 'Uangnya') - 0.05 };
  LEG = [
    [C.alur.start - 0.2, C.alur.start + 0.55],
    [T.n2, T.n2 + 0.6],
    [T.n3, T.n3 + 0.6],
    [C.kasir.start - 0.25, C.kasir.start + 0.45],
  ];
  const N = NODES;
  CAM = [
    [0, 540, 1040, 0.8],
    [0.02, 540, 950, 0.95],
    [C.alur.start - 0.3, N[0].x + 60, N[0].y - 60, 1.18],
    [T.n2 - 0.05, N[1].x - 60, N[1].y - 60, 1.18],
    [T.n3 - 0.05, N[2].x + 60, N[2].y - 60, 1.18],
    [C.kasir.start - 0.25, KASIR.x - 20, KASIR.y - 40, 1.12],
    [C.tapi.start - 0.1, 540, 3930, 0.315],
    [C.akhir.start - 0.15, 540, 3900, 0.27],
    [C.akhir.start + 0.35, 540, 975, 0.92],
    [AM.duration, 540, 990, 0.97],
  ];
  AM.sfx('swoosh_up', 0.0, { gain: 0.35 });
  AM.sfx('click', T.lock + 0.15, { gain: 0.45 });
  AM.sfx('pop', T.four + 0.05, { gain: 0.4 });
  AM.sfx('whoosh', LEG[0][0], { gain: 0.3 });
  AM.sfx('stamp', LEG[2][1] + 0.15, { gain: 0.45 });
  AM.sfx('ding', LEG[3][1] + 0.1, { gain: 0.5 });
  AM.sfx('coin', T.settle + 1.5, { gain: 0.35, pitch: 1.1 });
  AM.sfx('chime', W('akhir', 'berhasil'), { gain: 0.45 });
}

// ---------------------------------------------------------------- helpers
let cam = { x: 540, y: 960, z: 1 };
const toS = (wx, wy) => [(wx - cam.x) * cam.z + 540, (wy - cam.y) * cam.z + 960];
const inView = (x, y, w, h) => { const [a, b] = toS(x, y), [c, d] = toS(x + w, y + h); return c > -60 && a < 1140 && d > -60 && b < 1980; };
const packetU = (t) => {
  for (let i = LEG.length - 1; i >= 0; i--) if (t >= LEG[i][0]) return [i, ease.inOutCubic(clamp((t - LEG[i][0]) / (LEG[i][1] - LEG[i][0])))];
  return [-1, 0];
};
const arrived = (i) => LEG[i][1];

// ---------------------------------------------------------------- phone screens (local points 390 x 844)
function viewfinder(g, t) {
  const feed = AM.lib.cached('pl-feed', () => {
    const c = AM.lib.makeCanvas(98, 211), q = c.getContext('2d');
    const gr = q.createLinearGradient(0, 0, 0, 211); gr.addColorStop(0, '#2b2420'); gr.addColorStop(0.6, '#4a3a2e'); gr.addColorStop(1, '#2a211c');
    q.fillStyle = gr; q.fillRect(0, 0, 98, 211);
    const B = [[15, 30, 14, '#f3c27a'], [80, 22, 10, '#ffe2a8'], [60, 60, 18, '#a8724a'], [20, 160, 20, '#6b4a33'], [85, 180, 16, '#d49a5c'], [50, 120, 30, '#5a4636']];
    for (const [x, y, r, col] of B) { const rg = q.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, col + '00'); q.fillStyle = rg; q.fillRect(x - r, y - r, 2 * r, 2 * r); }
    return c;
  });
  g.drawImage(feed, -12 + Math.sin(t * 0.7) * 6, -12 + Math.cos(t * 0.6) * 5, 414, 868);
  const sx = 70, sy = 214 + Math.sin(t * 1.1) * 2;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 24; g.shadowOffsetY = 10;
  AM.lib.roundRect(g, sx, sy, 250, 352, 22); g.fillStyle = '#fff'; g.fill(); g.restore();
  K.label(g, 'KOPI SENJA', 195, sy + 34, { size: 17, weight: 700, align: 'center', spacing: 3 });
  const lock = T.lock, hi = t > lock ? (t - lock) / 0.9 : -1;
  K.qrCode(g, sx + 28, sy + 62, 194, { seed: 11, hi: hi > 1.2 ? -1 : hi });
  K.label(g, 'Scan untuk bayar', 195, sy + 320, { size: 15, color: P.ink2, align: 'center' });
  const k = K.sp(t, lock, 0.45, 0.55);
  const fx0 = lerp(34, sx + 14, k), fy0 = lerp(150, sy + 50, k), fx1 = lerp(356, sx + 236, k), fy1 = lerp(690, sy + 270, k);
  g.save(); g.strokeStyle = t > lock ? P.ok : '#fff'; g.lineWidth = 6; g.lineCap = 'round';
  for (const [x, y, a, b] of [[fx0, fy0, 1, 1], [fx1, fy0, -1, 1], [fx0, fy1, 1, -1], [fx1, fy1, -1, -1]]) { g.beginPath(); g.moveTo(x, y + b * 34); g.lineTo(x, y); g.lineTo(x + a * 34, y); g.stroke(); }
  if (t < lock + 0.1) {
    const u = (t * 1.1) % 1, ly = lerp(fy0 + 10, fy1 - 10, ease.inOutSine(u < 0.5 ? u * 2 : 2 - u * 2));
    const lg = g.createLinearGradient(fx0, 0, fx1, 0); lg.addColorStop(0, 'rgba(120,110,255,0)'); lg.addColorStop(0.5, 'rgba(140,130,255,0.95)'); lg.addColorStop(1, 'rgba(120,110,255,0)');
    g.fillStyle = lg; g.fillRect(fx0, ly - 2, fx1 - fx0, 4); g.globalAlpha = 0.25; g.fillRect(fx0, ly - 14, fx1 - fx0, 28);
  }
  g.restore();
  K.label(g, 'Scan kode QR', 195, 92, { size: 21, weight: 700, color: '#fff', align: 'center', spacing: 0 });
  const rp = K.sp(t, lock + 0.25, 0.5, 0.6);
  if (rp > 0) {
    g.save(); K.popIn(g, 195, 604, rp);
    AM.lib.roundRect(g, 95, 578, 200, 52, 26); g.fillStyle = 'rgba(255,255,255,0.95)'; g.fill();
    K.ICON.check(g, 126, 604, 26, P.ok, clamp((t - lock - 0.35) / 0.35));
    K.label(g, 'Kode terbaca', 146, 605, { size: 17, weight: 700 });
    g.restore();
  }
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(195, 760, 30, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 3; g.beginPath(); g.arc(195, 760, 38, 0, Math.PI * 2); g.stroke();
}
function processingScreen(g, t) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, 390, 844);
  g.strokeStyle = P.line; g.lineWidth = 8; g.beginPath(); g.arc(195, 360, 54, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = P.accent; g.lineCap = 'round'; g.beginPath(); g.arc(195, 360, 54, t * 5, t * 5 + 1.6); g.stroke();
  K.label(g, 'Memproses', 195, 470, { size: 24, weight: 700, align: 'center', spacing: 0 });
  K.label(g, 'Rp25.000 ke Kopi Senja', 195, 506, { size: 17, color: P.ink3, align: 'center' });
}
function successScreen(g, t, t0) {
  g.fillStyle = '#fff'; g.fillRect(0, 0, 390, 844);
  const p = K.sp(t, t0, 0.55, 0.55);
  g.save(); g.globalAlpha = clamp(p * 2);
  g.fillStyle = P.okSoft; g.beginPath(); g.arc(195, 300, 80 * p, 0, Math.PI * 2); g.fill();
  g.fillStyle = P.ok; g.beginPath(); g.arc(195, 300, 56 * p, 0, Math.PI * 2); g.fill();
  K.ICON.check(g, 195, 302, 66, '#fff', clamp((t - t0 - 0.15) / 0.35), 3.2);
  K.label(g, 'Pembayaran berhasil', 195, 432, { size: 24, weight: 700, align: 'center', spacing: 0 });
  K.label(g, 'Rp25.000', 195, 492, { size: 46, weight: 700, align: 'center' });
  K.label(g, 'ke Kopi Senja', 195, 540, { size: 17, color: P.ink3, align: 'center' });
  g.fillStyle = P.line; g.fillRect(40, 590, 310, 1.5);
  K.label(g, 'Status', 40, 630, { size: 16, color: P.ink3 }); K.label(g, 'Diterima toko', 350, 630, { size: 16, weight: 700, align: 'right' });
  K.label(g, 'Pihak terlibat', 40, 668, { size: 16, color: P.ink3 }); K.label(g, '4', 350, 668, { size: 16, weight: 700, align: 'right' });
  g.restore();
}
function payerScreen(g, t) {
  if (t < C.alur.start - 0.25) return viewfinder(g, t);
  if (t < C.akhir.start + 0.25) return processingScreen(g, t);
  return successScreen(g, t, C.akhir.start + 0.25);
}
function merchantScreen(g, t) {
  g.fillStyle = '#FAF9F7'; g.fillRect(0, 0, 390, 844);
  K.label(g, 'Kopi Senja', 30, 110, { size: 28, weight: 700 });
  K.label(g, 'Kasir · hari ini', 30, 146, { size: 16, color: P.ink3 });
  AM.lib.roundRect(g, 24, 180, 342, 120, 24); g.fillStyle = '#fff'; g.fill();
  const arr = arrived(3) + 0.05;
  K.label(g, 'Total masuk', 48, 218, { size: 15, color: P.ink3 });
  K.label(g, K.fmtRp(412000 + (t > arr ? K.count(t, arr + 0.2, 0.8, 0, 25000) : 0)), 48, 262, { size: 34, weight: 700 });
  const rows = [['Es kopi susu', 'Rp22.000', '12:31'], ['Americano', 'Rp18.000', '12:18'], ['Roti bakar', 'Rp15.000', '12:02'], ['Teh tarik', 'Rp16.000', '11:47']];
  const a = t > arr ? K.sp(t, arr + 0.3, 0.5, 0.8) : 0;
  g.save(); g.beginPath(); g.rect(0, 318, 390, 500); g.clip();
  if (a > 0) {
    g.globalAlpha = clamp(a); AM.lib.roundRect(g, 24, 330 - (1 - a) * 30, 342, 64, 16); g.fillStyle = P.okSoft; g.fill();
    K.label(g, 'QR · pelanggan', 44, 362, { size: 17, weight: 700 }); K.label(g, '+Rp25.000', 346, 362, { size: 17, weight: 700, align: 'right', color: P.ok });
    g.globalAlpha = 1;
  }
  rows.forEach(([n, v, tm], i) => {
    const y = 362 + i * 76 + a * 76;
    K.label(g, n, 44, y - 8, { size: 17, weight: 700 }); K.label(g, tm, 44, y + 16, { size: 13, color: P.ink3 });
    K.label(g, v, 346, y, { size: 17, weight: 700, align: 'right' }); g.fillStyle = P.line; g.fillRect(44, y + 38, 302, 1);
  });
  g.restore();
  const tp = K.sp(t, arr, 0.6, 0.6);
  if (tp > 0) {
    g.save(); g.translate(0, (1 - tp) * -190); g.globalAlpha = clamp(tp * 2); g.scale(0.5, 0.5);
    K.toast(g, 24, 110, 732, { title: 'Pembayaran diterima', body: 'Rp25.000 · QR', icon: (c, x, y, s, col) => K.ICON.check(c, x, y, s, col, 1, 3), elev: 0.8 });
    g.restore();
  }
}

// ---------------------------------------------------------------- world pieces
function drawNode(ctx, t, i) {
  const N = NODES[i];
  if (!inView(N.x - 440, N.y - 280, 880, 600)) return;
  const NW = 600, NH = 330, x = N.x - NW / 2, y = N.y - NH / 2; // designed at 600x330, drawn at 1.2x
  const appear = K.sp(t, LEG[i][0] - 0.6, 0.7, 0.75);
  if (appear <= 0) return;
  const hit = t - arrived(i), bump = hit > 0 ? 1 + 0.045 * Math.exp(-hit * 5) * Math.sin(hit * 18) : 1;
  ctx.save(); K.popIn(ctx, N.x, N.y, appear, { from: 0.9, rise: 60 });
  ctx.translate(N.x, N.y); ctx.scale(bump * 1.2, bump * 1.2); ctx.translate(-N.x, -N.y);
  const active = hit > 0 ? clamp(hit / 0.3) : 0;
  K.card(ctx, x, y, NW, NH, { r: 40, elev: 1 + 0.4 * active });
  if (active > 0) { ctx.save(); AM.lib.roundRect(ctx, x, y, NW, NH, 40); ctx.lineWidth = 3; ctx.strokeStyle = AM.lib.rgba(P.accent, 0.55 * active); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = P.accentSoft; AM.lib.roundRect(ctx, x + 36, y + 36, 88, 88, 26); ctx.fill();
  N.icon(ctx, x + 80, y + 80, 50, P.accent);
  K.label(ctx, N.title, x + 150, y + 66, { size: 38, weight: 700 });
  K.label(ctx, N.sub, x + 150, y + 108, { size: 24, color: P.ink2 });
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(x + NW - 50, y + 58, 22, 0, Math.PI * 2); ctx.fill();
  K.label(ctx, String(N.n), x + NW - 50, y + 59, { size: 24, weight: 700, color: '#fff', align: 'center', spacing: 0 });
  ctx.fillStyle = P.line; ctx.fillRect(x + 36, y + 156, NW - 72, 1.5);
  const by = y + 156;
  if (i === 0) {
    const cut = arrived(0) + 0.2;
    K.label(ctx, 'Saldo', x + 36, by + 54, { size: 24, color: P.ink3 });
    K.label(ctx, K.fmtRp(t < cut ? 150000 : K.count(t, cut, 0.7, 150000, 125000)), x + 36, by + 108, { size: 50, weight: 700 });
    const ck = K.sp(t, arrived(0), 0.5, 0.6);
    if (ck > 0) K.chip(ctx, x + NW - 150, by + 54, 'Cukup', { size: 22, fill: P.okSoft, border: null, color: P.ok, icon: (c, a, b, s, col) => K.ICON.check(c, a, b, s, col, clamp(ck * 1.5)), iconColor: P.ok, elev: 0, alpha: clamp(ck), scale: 0.9 + 0.1 * ck });
    const dp = K.sp(t, cut, 0.5, 0.55);
    if (dp > 0) K.chip(ctx, x + NW - 150, by + 112, '−Rp25.000', { size: 24, fill: P.ink, border: null, color: '#fff', elev: 0.5, alpha: clamp(dp), scale: 0.8 + 0.2 * dp });
  } else if (i === 1) {
    const ox = x + 60, oy = by + 88, arr = arrived(1);
    ['Penyedia A', 'Penyedia B', 'Penyedia C'].forEach((o, k) => {
      const ty = by + 36 + k * 52, sel = k === 1, lit = sel ? clamp((t - arr) / 0.3) : 0;
      ctx.strokeStyle = lit > 0 ? AM.lib.mixHex('#D8D5CF', P.accent, lit) : '#D8D5CF'; ctx.lineWidth = lit > 0 ? 5 : 3;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.bezierCurveTo(ox + 140, oy, ox + 140, ty, ox + 260, ty); ctx.stroke();
      ctx.fillStyle = lit > 0 ? P.accent : '#D8D5CF'; ctx.beginPath(); ctx.arc(ox + 270, ty, 9, 0, Math.PI * 2); ctx.fill();
      K.label(ctx, o, ox + 296, ty + 1, { size: 24, weight: lit > 0.5 ? 700 : 400, color: lit > 0.5 ? P.ink : P.ink3 });
    });
    ctx.fillStyle = P.ink; ctx.beginPath(); ctx.arc(ox, oy, 12, 0, Math.PI * 2); ctx.fill();
    if (t > arr) { const u = clamp((t - arr) / 0.3); const [px, py] = K.bez([[ox, oy], [ox + 140, oy], [ox + 140, by + 88], [ox + 260, by + 88]], ease.inOutCubic(u)); K.glow(ctx, px, py, 34, { a: 0.8 * (1 - u * 0.5) }); }
  } else {
    K.label(ctx, 'Merchant', x + 36, by + 54, { size: 24, color: P.ink3 }); K.label(ctx, 'Kopi Senja', x + 36, by + 104, { size: 36, weight: 700 });
    const st = K.sp(t, arrived(2) + 0.1, 0.45, 0.5);
    if (st > 0) {
      ctx.save(); ctx.translate(x + NW - 150, by + 86); ctx.rotate(-0.12); const s = lerp(1.7, 1, clamp(st)); ctx.scale(s, s); ctx.globalAlpha *= clamp(st * 2);
      AM.lib.roundRect(ctx, -112, -36, 224, 72, 18); ctx.lineWidth = 4; ctx.strokeStyle = P.ok; ctx.stroke(); ctx.fillStyle = 'rgba(18,183,106,0.08)'; ctx.fill();
      K.ICON.check(ctx, -74, 0, 34, P.ok, 1, 3.4); K.label(ctx, 'DISETUJUI', 14, 2, { size: 25, weight: 700, color: P.ok, align: 'center', spacing: 3 });
      ctx.restore();
    }
  }
  ctx.restore();
}
function drawRoutes(ctx, t) {
  ROUTES.forEach((R, i) => {
    K.route(ctx, R, { p: prog(t, LEG[i][0] - 0.5, LEG[i][0] + 0.2, ease.outCubic), t, width: 5 });
    const lit = clamp((t - C.tapi.start - 0.3 - i * 0.1) / 0.4);
    if (lit > 0) K.route(ctx, R, { p: lit, t, color: AM.lib.rgba(P.accent, 0.55), width: 6, dash: [] });
  });
}
function drawPacket(ctx, t) {
  const [i, u] = packetU(t);
  if (i < 0) return;
  if (i === 3 && t > LEG[3][1] + 0.25 && t < C.tapi.start - 0.1) return;
  const R = ROUTES[i], [x, y] = K.bez(R, u);
  if (u < 1) K.trail(ctx, R, u, { len: 0.35, width: 12 });
  const zo = clamp((t - C.tapi.start + 0.2) / 0.5);
  K.glow(ctx, x, y, 90 + 60 * zo, { a: 0.55 });
  K.chip(ctx, x, y, 'Pesan · Rp25.000', { size: 24, icon: K.ICON.mail, iconColor: P.accent, elev: 1.1, scale: 1 + zo * 1.6 });
}
function drawCoin(ctx, t) {
  if (t < C.tapi.start + 0.3 || t > C.akhir.start + 0.3) return;
  const a = K.sp(t, C.tapi.start + 0.3, 0.5, 0.6);
  const u = clamp((t - T.settle) / 1.6), rest = [NODES[0].x + 300, NODES[0].y + 40];
  let x = rest[0], y = rest[1];
  if (u > 0) {
    const g = u * 3.3;
    if (g < 0.3) { const f = ease.inOutSine(g / 0.3); x = lerp(rest[0], ROUTES[1][0][0], f); y = lerp(rest[1], ROUTES[1][0][1], f); }
    else { const h = Math.min(2.999, g - 0.3), k = Math.floor(h), f = ease.inOutSine(h - k); [x, y] = K.bez(ROUTES[k + 1], f); K.trail(ctx, ROUTES[k + 1], f, { len: 0.5, width: 26, color: '18,183,106' }); }
  }
  K.glow(ctx, x, y, 150, { color: '18,183,106', a: 0.45 * a });
  ctx.save(); K.popIn(ctx, x, y, a);
  K.chip(ctx, x, y, 'Uang · Rp25.000', { size: 24, icon: K.ICON.coin, iconColor: P.ok, elev: 1.1, scale: 2.4 });
  ctx.restore();
}
function drawChipsAroundPhone(ctx, t) {
  const away = K.sp(t, C.alur.start - 0.5, 0.5, 1);
  if (away >= 1) return;
  [[205, 600, 'Penerbit'], [880, 700, 'Switching'], [190, 1210, 'Acquirer'], [890, 1300, 'Kasir']].forEach(([x, y, s], i) => {
    const p = K.sp(t, T.four + i * 0.11, 0.55, 0.55);
    if (p <= 0) return;
    const [fx, fy] = K.float(t, i * 3, 8);
    const X = lerp(x + fx, PH.x, away), Y = lerp(y + fy, PH.y + 400, away);
    ctx.save(); K.popIn(ctx, X, Y, p * (1 - away)); K.chip(ctx, X, Y, s, { size: 30, num: i + 1, numFill: P.accent, elev: 1.2 }); ctx.restore();
  });
}

// ---------------------------------------------------------------- overlays (screen space)
function overlays(t) {
  const E = (str, a, b, y = 150) => K.eyebrow(ui, str, 540, y, { alpha: env(t, a, b, 0.25, 0.25) });
  if (t < C.alur.start) {
    E('Di balik satu scan', 0, C.hook.end);
    K.headline(ui, t, 0.05, ['Satu scan,'], 540, 250, { size: 92, out: C.hook.end - 0.05 });
    K.headline(ui, t, T.four - 0.1, ['*empat* pihak.'], 540, 350, { size: 92, out: C.hook.end });
  }
  const names = ['Penerbit', 'Switching', 'Acquirer', 'Kasir'];
  const starts = [LEG[0][0] + 0.35, T.n2 + 0.3, T.n3 + 0.3, C.kasir.start + 0.1], ends = [T.n2, T.n3, C.kasir.start - 0.25, C.tapi.start - 0.15];
  names.forEach((n, i) => {
    if (t < starts[i] - 0.1 || t > ends[i] + 0.5) return;
    E(`Pihak ${i + 1} dari 4`, starts[i], ends[i] + 0.2);
    K.headline(ui, t, starts[i], [`*${n}*.`], 540, 262, { size: 104, out: ends[i] });
  });
  if (t > C.tapi.start - 0.2 && t < C.akhir.start) {
    K.headline(ui, t, C.tapi.start + 0.1, ['Baru *pesan*,', 'belum uang.'], 540, 230, { size: 84, out: T.settle - 0.25 });
    K.headline(ui, t, T.settle, ['Uangnya *menyusul*.'], 540, 230, { size: 84, accent: P.ok, out: C.akhir.start - 0.2 });
    const za = env(t, C.tapi.start + 0.25, C.akhir.start - 0.1, 0.35, 0.25);
    [...NODES.map((n) => [n.x, n.y, n.n === 2 ? 'Switching' : n.title]), [KASIR.x - 30, KASIR.y - 330, 'Kasir']].forEach(([x, y, s], i) => {
      const [sx, sy] = toS(x, y);
      ui.save(); ui.globalAlpha = za * clamp(K.sp(t, C.tapi.start + 0.3 + i * 0.07, 0.5, 0.6));
      K.chip(ui, sx + (i % 2 ? 1 : -1) * 250, sy, s, { size: 28, num: i + 1, numFill: P.accent, elev: 1 });
      ui.restore();
    });
  }
  if (t > C.akhir.start) {
    K.headline(ui, t, C.akhir.start + 0.05, ['Satu ketukan.'], 540, 205, { size: 76 });
    K.headline(ui, t, W('akhir', 'empat') - 0.1, ['Empat pihak.'], 540, 293, { size: 76 });
    K.headline(ui, t, W('akhir', 'berhasil') - 0.15, ['*Berhasil*.'], 540, 391, { size: 104, accent: P.ok });
  }
}

// ---------------------------------------------------------------- frame
export function render(t) {
  cam = K.camAt(t, CAM, { z: 1, ts: 0.8 });
  K.stage(bg, t, { px: (cam.x - 540) * 0.08, py: ((cam.y - 960) * 0.04) % 900 });
  K.applyCam(world, cam);
  K.dotGrid(world, { color: 'rgba(17,17,20,0.06)' });
  drawRoutes(world, t);
  for (let i = 0; i < 3; i++) drawNode(world, t, i);
  if (inView(KASIR.x - 220, KASIR.y - 640, 440, 1080) && t > LEG[3][0] - 1.2) {
    const a = K.sp(t, LEG[3][0] - 0.9, 0.7, 0.75);
    world.save(); K.popIn(world, KASIR.x, KASIR.y, a, { rise: 80 });
    K.phone(world, KASIR.x, KASIR.y, KASIR.s, (g) => merchantScreen(g, t), { rot: -0.05, elev: 1.2 });
    world.restore();
    const arr = arrived(3) + 0.1, hp = K.sp(t, arr, 0.65, 0.6), ho = clamp((t - C.tapi.start + 0.1) / 0.4);
    if (hp > 0 && ho < 1) {
      world.save(); world.globalAlpha *= 1 - ho;
      const hx = KASIR.x - 30, hy = lerp(KASIR.y - 300, KASIR.y - 520, hp);
      K.popIn(world, hx, hy, hp, { from: 0.6, rise: 0 });
      K.toast(world, hx - 380, hy - 80, 760, { title: 'Pembayaran diterima', body: 'Rp25.000 · dari pelanggan', icon: (c, x, y, s, col) => K.ICON.check(c, x, y, s, col, clamp((t - arr - 0.1) / 0.3), 3), elev: 1.5 });
      world.restore();
      K.ripple(world, KASIR.x - 30, KASIR.y - 380, t - arr, { color: P.ok, r: 520, ring: true, dur: 0.9 });
    }
  }
  if (inView(PH.x - 260, PH.y - 540, 520, 1080)) {
    const [fx, fy] = K.float(t, 2, 5);
    K.phone(world, PH.x + fx * 0.3, PH.y + fy * 0.3, PH.s, (g) => payerScreen(g, t), { elev: 1.3, statusDark: t < C.alur.start - 0.25 });
  }
  drawChipsAroundPhone(world, t);
  drawPacket(world, t);
  drawCoin(world, t);
  overlays(t);
  const f = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (f > 0) { ui.fillStyle = `rgba(247,245,240,${f * 0.85})`; ui.fillRect(0, 0, 1080, 1920); }
  for (const c of [bg, world, ui]) c.setTransform(1, 0, 0, 1, 0, 0); // runtime clears under the current transform
}
