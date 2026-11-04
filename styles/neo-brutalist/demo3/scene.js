// Neo-Brutalist Bento demo3 (~65 s): "Rahasia di Balik Label Gratis Ongkir — Siapa yang Sebenarnya Membayar Paketmu?"
// Reflowing bento grid breaking down an Rp100.000 online order with a cheerful parcel box mascot.
import * as K from '/styles/neo-brutalist/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'comic', y: 1445, size: 72 } };

let ctx;
const C = {};
const F = (id, f) => C[id].start + f * (C[id].end - C[id].start);
let TILES = {}, T = {};

const COSTS = [
  ['MODAL BARANG', 65000, K.ICON.box, P.milk, 0.28],
  ['KEMASAN & LAKBAN', 3000, K.ICON.leaf, P.lavender, 0.48],
  ['ADMIN & ONGKIR', 10000, K.ICON.truck, P.coral, 0.68],
  ['IKLAN TOKO', 5000, K.ICON.bolt, P.yellow, 0.85],
];
const Q = [[60, 640, 468, 230], [552, 640, 468, 230], [60, 900, 468, 230], [552, 900, 468, 230]];

function parcelGuy(ctx, x, y, s, { t = 0, mood = 'happy', squash = 0 } = {}) {
  const bob = Math.sin(t * 5) * 6, sq = 1 + squash * 0.12;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * sq, s / sq); ctx.translate(0, bob * 0.35);
  // shadow
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(8, 12, 98, 15, 0, 0, TAU); ctx.fill();
  // arms
  ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = P.ink;
  const wave = Math.sin(t * 7.5) * 16;
  ctx.beginPath(); ctx.moveTo(-100, -140); ctx.quadraticCurveTo(-150, -165 + wave, -138, -210 + wave); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(100, -140); ctx.quadraticCurveTo(150, -165 - wave, 138, -210 - wave); ctx.stroke();
  // parcel box body
  AM.lib.roundRect(ctx, -102, -265, 204, 250, 22);
  ctx.fillStyle = '#E3B778'; ctx.fill();
  ctx.lineWidth = K.LINE * 1.15; ctx.strokeStyle = P.ink; ctx.stroke();
  // tape strip on top
  ctx.fillStyle = P.coral;
  ctx.fillRect(-32, -265, 64, 68);
  ctx.strokeRect(-32, -265, 64, 68);
  K.text(ctx, 'FRAGILE', 0, -231, { size: 15, font: K.FONT.mono, weight: 700, color: P.white, align: 'center' });
  // face sticker
  AM.lib.roundRect(ctx, -68, -175, 136, 115, 18); ctx.fillStyle = P.white; ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  const blink = (Math.floor(t * 10) % 39) === 0 ? 0.15 : 1;
  ctx.fillStyle = P.ink;
  for (const ex of [-26, 26]) { ctx.beginPath(); ctx.ellipse(ex, -136, 8.5, (mood === 'shock' ? 13 : 10.5) * blink, 0, 0, TAU); ctx.fill(); }
  ctx.lineWidth = 5; ctx.beginPath();
  if (mood === 'happy') ctx.arc(0, -110, 17, 0.15, Math.PI - 0.15);
  else ctx.ellipse(0, -100, 11, 13, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

export async function setup(AM) {
  ctx = AM.layer('board');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const s1 = C.potongan.start - 0.15, s2 = C.rincian.start - 0.15, s3 = C.kurir.start - 0.15, s4 = C.akhir.start - 0.15;
  T = { s1, s2, s3, s4, checkout: F('hook', 0.22), freeTag: F('hook', 0.52) };

  TILES = {
    mascot: [[0, null], [0.02, [60, 170, 468, 700]], [s1, [60, 170, 330, 446]], [s4, [60, 170, 468, 700]]],
    price: [[0, null], [0.18, [552, 170, 468, 330]], [s1, [414, 170, 606, 211]], [s4, null]],
    freeCard: [[0, null], [T.freeTag - 0.1, [552, 524, 468, 346]], [s1, null]],
    hookStrip: [[0, null], [T.freeTag + 0.25, [60, 900, 960, 240]], [s1, null]],
    feeHead: [[0, null], [s1 + 0.05, [414, 405, 606, 211]], [s2, null]],
    feeCard: [[0, null], [s1 + 0.2, [60, 640, 960, 490]], [s2, null]],
    costHead: [[0, null], [s2 + 0.05, [414, 405, 606, 211]], [s3, null]],
    courierHead: [[0, null], [s3 + 0.05, [414, 405, 606, 211]], [s4, null]],
    courierCard: [[0, null], [s3 + 0.2, [60, 640, 960, 490]], [s4, null]],
    pct: [[0, null], [s4 + 0.12, [552, 170, 468, 700]]],
    grid: [[0, null], [s4 + 0.28, [60, 900, 960, 330]]],
  };
  COSTS.forEach((g, i) => { TILES['cost' + i] = [[0, null], [F('rincian', g[4]) - 0.1, Q[i]], [s3, null]]; });

  AM.sfx('stamp', T.checkout, { gain: 0.45 });
  AM.sfx('pop', T.freeTag, { gain: 0.4 });
  AM.sfx('coin', s1 + 0.2, { gain: 0.4 });
  AM.sfx('thud', s2 + 0.15, { gain: 0.45 });
  AM.sfx('pop', s3 + 0.15, { gain: 0.4 });
  AM.sfx('ding', s4 + 0.25, { gain: 0.45 });
}
const R = (id, t) => K.rectAt(t, TILES[id]);

function draw(t) {
  K.text(ctx, 'ANATOMI PAKET GRATIS ONGKIR', 60, 112, { size: 26, font: K.FONT.mono, weight: 700 });
  K.pill(ctx, 'PERKIRAAN', 1020 - 120, 112, { size: 22, fill: P.yellow, align: 'right', shadow: 3 });

  // Mascot tile
  const ms = R('mascot', t);
  const mood = (t > T.s1 && t < T.s2) || (t > T.s3 && t < T.s4) ? 'shock' : 'happy';
  K.tile(ctx, ms, { fill: P.yellow, t, hatchIt: true, hatchColor: 'rgba(17,17,17,0.08)' });
  K.inTile(ctx, ms, () => {
    const s = ms.h / 560;
    const hits = [T.checkout, T.freeTag, T.s1, T.s2, T.s3, T.s4].filter((x) => x < t).pop() || -9;
    const sq = Math.exp(-(t - hits) * 6) * Math.sin((t - hits) * 22);
    parcelGuy(ctx, ms.x + ms.w / 2, ms.y + ms.h - 42 * s, 1.12 * s, { t, mood, squash: sq });
    K.pill(ctx, 'PAKET BELANJA', ms.x + 24, ms.y + 40, { size: Math.max(16, 21 * s), shadow: 3 });
  });

  // Checkout total tile
  const pr = R('price', t);
  K.tile(ctx, pr, { fill: P.cobalt });
  K.inTile(ctx, pr, () => {
    const big = pr.h > 200;
    K.text(ctx, 'TOTAL CHECKOUT PEMBELI', pr.x + 30, pr.y + 42, { size: 22, font: K.FONT.mono, weight: 700, color: P.white });
    const val = Math.round(K.count(t, 0.1, 0.65, 0, 100000) / 1000) * 1000;
    K.text(ctx, K.rp(val), pr.x + 30, pr.y + pr.h * 0.58, { size: big ? 88 : 78, color: P.white, maxW: pr.w - 60 });
  });

  // Free shipping card
  const fc = R('freeCard', t);
  K.tile(ctx, fc, { fill: P.lime });
  K.inTile(ctx, fc, () => {
    K.ICON.truck(ctx, fc.x + 56, fc.y + 52, 48);
    K.text(ctx, 'VOUCHER ONGKIR', fc.x + 96, fc.y + 52, { size: 24, font: K.FONT.mono, weight: 700 });
    K.text(ctx, 'Rp0', fc.x + 30, fc.y + 185, { size: 112 });
    K.pill(ctx, 'SUBSIDI ≈ Rp15.000', fc.x + 30, fc.y + 286, { size: 22, shadow: 3 });
  });

  // Hook strip
  const hs = R('hookStrip', t);
  K.tile(ctx, hs, { fill: P.white });
  K.inTile(ctx, hs, () => {
    K.text(ctx, 'ONGKOS KIRIM ASLI SEBENARNYA TETAP DIBAYAR DARI POTONGAN TRANSAKSI', hs.x + 30, hs.y + 48, { size: 20, font: K.FONT.mono, weight: 700, maxW: hs.w - 60 });
    const p = clamp((t - T.freeTag) / 0.6);
    K.bar(ctx, hs.x + 30, hs.y + 102, hs.w - 60, 92, p * 0.85, { fill: P.coral, t });
    K.text(ctx, 'SIAPA YANG MENANGGUNG?', hs.x + 54, hs.y + 148, { size: 32, color: P.white });
  });

  // Beat 2: Admin & Free Shipping Program Fee
  const fh = R('feeHead', t);
  K.tile(ctx, fh, { fill: P.coral });
  K.inTile(ctx, fh, () => {
    K.text(ctx, 'POTONGAN KOMISI PENJUAL', fh.x + 30, fh.y + 40, { size: 22, font: K.FONT.mono, weight: 700, color: P.white });
    K.text(ctx, '≈ 8% – 12%', fh.x + 30, fh.y + 130, { size: 78, color: P.white, maxW: fh.w - 60 });
  });
  const fcd = R('feeCard', t);
  K.tile(ctx, fcd, { fill: P.white });
  K.inTile(ctx, fcd, () => {
    K.text(ctx, 'POTONGAN OTOMATIS DARI SALDO PENJUAL UMKM', fcd.x + 34, fcd.y + 52, { size: 23, font: K.FONT.mono, weight: 700 });
    const rows = [
      ['BIAYA ADMIN KATEGORI MARKETPLACE (≈5.5%)', 'Rp5.500', 0.55, P.cobalt],
      ['BIAYA LAYANAN PROGRAM GRATIS ONGKIR (≈4.5%)', 'Rp4.500', 0.45, P.coral],
      ['BIAYA IKLAN / PROMOSI TOKO (≈5%)', 'Rp5.000', 0.50, P.yellow],
    ];
    rows.forEach(([lbl, val, frac, col], i) => {
      const yy = fcd.y + 115 + i * 120;
      K.text(ctx, lbl, fcd.x + 34, yy, { size: 21, font: K.FONT.mono, weight: 700 });
      K.text(ctx, val, fcd.x + fcd.w - 34, yy, { size: 32, align: 'right' });
      const p = clamp((t - (T.s1 + 0.35 + i * 0.35)) / 0.5) * frac;
      K.bar(ctx, fcd.x + 34, yy + 28, fcd.w - 68, 44, p, { fill: col, t });
    });
  });

  // Beat 3: 4-Quadrant Breakdown of Rp100.000
  const ch = R('costHead', t);
  K.tile(ctx, ch, { fill: P.yellow });
  K.inTile(ctx, ch, () => {
    const shown = Math.round(K.count(t, T.s2 + 0.1, 0.7, 0, 83000) / 1000) * 1000;
    K.text(ctx, 'TOTAL MODAL & POTONGAN', ch.x + 30, ch.y + 40, { size: 22, font: K.FONT.mono, weight: 700 });
    K.text(ctx, '≈ ' + K.rp(shown), ch.x + 30, ch.y + 130, { size: 78, maxW: ch.w - 60 });
  });
  COSTS.forEach(([name, v, icon, col, frac], i) => {
    const r = R('cost' + i, t);
    if (!K.tile(ctx, r, { fill: P.white })) return;
    K.inTile(ctx, r, () => {
      icon(ctx, r.x + 56, r.y + 60, 56, col);
      K.text(ctx, name, r.x + 102, r.y + 60, { size: 24, font: K.FONT.mono, weight: 700, maxW: r.w - 126 });
      K.text(ctx, K.rp(v), r.x + 30, r.y + 134, { size: 46 });
      const p = clamp((t - F('rincian', frac) + 0.1) / 0.45) * Math.min(1, v / 65000);
      K.bar(ctx, r.x + 26, r.y + 172, r.w - 52, 34, Math.max(0.12, p), { fill: col, t });
    });
  });

  // Beat 4: Logistics & Courier Incentive
  const crh = R('courierHead', t);
  K.tile(ctx, crh, { fill: P.lavender });
  K.inTile(ctx, crh, () => {
    K.text(ctx, 'ALOKASI LOGISTIK & KURIR', crh.x + 30, crh.y + 40, { size: 22, font: K.FONT.mono, weight: 700 });
    K.text(ctx, '≈ Rp2.500/pkt', crh.x + 30, crh.y + 130, { size: 72, maxW: crh.w - 60 });
  });
  const crc = R('courierCard', t);
  K.tile(ctx, crc, { fill: P.white });
  K.inTile(ctx, crc, () => {
    K.ICON.truck(ctx, crc.x + 58, crc.y + 58, 58);
    K.text(ctx, 'ALUR DANA SUBSIDI ONGKIR KE LAPANGAN', crc.x + 108, crc.y + 56, { size: 24, font: K.FONT.mono, weight: 700 });
    const p = ease.outCubic(clamp((t - (T.s3 + 0.35)) / 0.7));
    const bx = crc.x + 30, by = crc.y + 140, bw = crc.w - 60, bh = 160, pw = bw * 0.72 * p;
    AM.lib.roundRect(ctx, bx, by, bw, bh, 20); ctx.fillStyle = P.lime; ctx.fill();
    if (pw > 2) {
      ctx.save(); AM.lib.roundRect(ctx, bx, by, bw, bh, 20); ctx.clip();
      ctx.fillStyle = P.yellow; ctx.fillRect(bx, by, pw, bh);
      K.hatch(ctx, bx, by, pw, bh, { t, r: 20, color: 'rgba(17,17,17,0.14)' });
      ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.moveTo(bx + pw, by); ctx.lineTo(bx + pw, by + bh); ctx.stroke();
      ctx.restore();
    }
    AM.lib.roundRect(ctx, bx, by, bw, bh, 20); ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
    K.text(ctx, 'GUDANG SORTIR & KARGO ANTAR KOTA', bx + 24, by + bh / 2, { size: 24, font: K.FONT.mono, weight: 700, maxW: bw * 0.65 });
    K.text(ctx, 'KURIR ≈ Rp2,5rb', bx + bw - 20, by + bh / 2, { size: 26, align: 'right', maxW: bw * 0.26 });
    K.pill(ctx, 'KURIR MENGANTAR 60–100+ PAKET PER HARI', bx + bw / 2, by + bh + 86, { size: 22, fill: P.lime, align: 'center' });
  });

  // Beat 5: Finale 17% Net Margin & 100-box grid
  const pct = R('pct', t);
  K.tile(ctx, pct, { fill: P.lime });
  K.inTile(ctx, pct, () => {
    K.text(ctx, 'MARGIN BERSIH UMKM', pct.x + 30, pct.y + 50, { size: 23, font: K.FONT.mono, weight: 700 });
    const n = Math.round(K.count(t, T.s4 + 0.2, 0.7, 0, 17));
    K.text(ctx, n + '%', pct.x + pct.w / 2, pct.y + 330, { size: 210, align: 'center', maxW: pct.w - 40 });
    K.ICON.coins(ctx, pct.x + pct.w / 2, pct.y + 560, 110, P.yellow);
  });
  const gr = R('grid', t);
  K.tile(ctx, gr, { fill: P.white });
  K.inTile(ctx, gr, () => {
    K.text(ctx, 'Rp100.000 = 100 KOTAK (17 KOTAK UNTUNG BERSIH TOKO)', gr.x + 30, gr.y + 44, { size: 20, font: K.FONT.mono, weight: 700 });
    const cs = 42, gx = gr.x + 30, gy = gr.y + 86;
    for (let j = 0; j < 5; j++) for (let i = 0; i < 20; i++) {
      const k = j * 20 + i, on = k < 17 && t > T.s4 + 0.35 + k * 0.04;
      const x = gx + i * (cs + 3.2), y = gy + j * (cs + 3.2);
      ctx.fillStyle = on ? P.lime : '#EDE9DD'; ctx.fillRect(x, y, cs, cs);
      ctx.lineWidth = on ? 3.5 : 1.5; ctx.strokeStyle = on ? P.ink : 'rgba(17,17,17,0.25)'; ctx.strokeRect(x, y, cs, cs);
    }
  });
}

export function render(t) {
  K.stage(ctx, t);
  draw(t);
  const f = clamp((t - (AM.duration - 0.35)) / 0.35);
  if (f > 0) { ctx.fillStyle = `rgba(244,241,232,${f * 0.85})`; ctx.fillRect(0, 0, 1080, 1920); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

