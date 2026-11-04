// Neo-Brutalist Bento demo2 (~64 s): "Dari Rp1,5 Juta Tiket Konsermu, Berapa yang Sampai ke Penyanyinya?"
// Reflowing bento grid with hard offset shadows, rolling numbers, diagonal hatches, and an animated ticket mascot.
import * as K from '/styles/neo-brutalist/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'comic', y: 1445, size: 72 } };

let ctx;
const C = {};
const F = (id, f) => C[id].start + f * (C[id].end - C[id].start);
let TILES = {}, T = {};

const PROD = [
  ['SEWA STADION', 210000, K.ICON.home, P.lavender, 0.35],
  ['SOUND & LED', 165000, K.ICON.bolt, P.yellow, 0.52],
  ['PANGGUNG', 90000, K.ICON.box, P.coral, 0.68],
  ['KEAMANAN & IZIN', 60000, K.ICON.person, P.lime, 0.82],
];
const Q = [[60, 640, 468, 230], [552, 640, 468, 230], [60, 900, 468, 230], [552, 900, 468, 230]];

function ticketGuy(ctx, x, y, s, { t = 0, mood = 'happy', squash = 0 } = {}) {
  const bob = Math.sin(t * 5.2) * 6, sq = 1 + squash * 0.12;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * sq, s / sq); ctx.translate(0, bob * 0.35);
  // shadow
  ctx.fillStyle = P.ink; ctx.beginPath(); ctx.ellipse(8, 12, 96, 15, 0, 0, TAU); ctx.fill();
  // arms
  ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.strokeStyle = P.ink;
  const wave = Math.sin(t * 8) * 18;
  ctx.beginPath(); ctx.moveTo(-95, -145); ctx.quadraticCurveTo(-145, -175 + wave, -135, -220 + wave); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(95, -145); ctx.quadraticCurveTo(145, -175 - wave, 135, -220 - wave); ctx.stroke();
  // ticket body with side notches
  ctx.beginPath();
  ctx.moveTo(-95, -285); ctx.lineTo(95, -285);
  ctx.lineTo(95, -165); ctx.arc(95, -140, 25, -Math.PI / 2, Math.PI / 2, true);
  ctx.lineTo(95, -10); ctx.lineTo(-95, -10);
  ctx.lineTo(-95, -115); ctx.arc(-95, -140, 25, Math.PI / 2, -Math.PI / 2, true);
  ctx.closePath();
  ctx.fillStyle = P.yellow; ctx.fill();
  ctx.lineWidth = K.LINE * 1.15; ctx.strokeStyle = P.ink; ctx.stroke();
  // stub header band
  ctx.fillStyle = P.coral;
  ctx.fillRect(-91, -281, 182, 58);
  ctx.beginPath(); ctx.setLineDash([8, 8]); ctx.moveTo(-90, -220); ctx.lineTo(90, -220); ctx.stroke(); ctx.setLineDash([]);
  K.text(ctx, 'VIP PASS', 0, -252, { size: 24, font: K.FONT.mono, weight: 700, color: P.white, align: 'center' });
  // face card
  AM.lib.roundRect(ctx, -66, -195, 132, 115, 18); ctx.fillStyle = P.white; ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  const blink = (Math.floor(t * 9) % 35) === 0 ? 0.15 : 1;
  ctx.fillStyle = P.ink;
  for (const ex of [-26, 26]) { ctx.beginPath(); ctx.ellipse(ex, -155, 8.5, (mood === 'shock' ? 13 : 10.5) * blink, 0, 0, TAU); ctx.fill(); }
  ctx.lineWidth = 5; ctx.beginPath();
  if (mood === 'happy') ctx.arc(0, -128, 17, 0.15, Math.PI - 0.15);
  else ctx.ellipse(0, -118, 11, 13, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

export async function setup(AM) {
  ctx = AM.layer('board');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const s1 = C.pajak.start - 0.15, s2 = C.panggung.start - 0.15, s3 = C.promotor.start - 0.15, s4 = C.artis.start - 0.15, s5 = C.akhir.start - 0.15;
  T = { s1, s2, s3, s4, s5, price: F('hook', 0.25), ask: F('hook', 0.65) };

  TILES = {
    mascot: [[0, null], [0.02, [60, 170, 468, 700]], [s1, [60, 170, 330, 446]], [s5, [60, 170, 468, 700]]],
    price: [[0, null], [0.18, [552, 170, 468, 330]], [s1, [414, 170, 606, 211]], [s5, null]],
    hookAsk: [[0, null], [T.ask - 0.1, [552, 524, 468, 346]], [s1, null]],
    hookBar: [[0, null], [T.ask + 0.25, [60, 900, 960, 240]], [s1, null]],
    taxHead: [[0, null], [s1 + 0.05, [414, 405, 606, 211]], [s2, null]],
    taxCard: [[0, null], [s1 + 0.2, [60, 640, 960, 490]], [s2, null]],
    stageHead: [[0, null], [s2 + 0.05, [414, 405, 606, 211]], [s3, null]],
    promoHead: [[0, null], [s3 + 0.05, [414, 405, 606, 211]], [s4, null]],
    promoCard: [[0, null], [s3 + 0.2, [60, 640, 960, 490]], [s4, null]],
    artistHead: [[0, null], [s4 + 0.05, [414, 405, 606, 211]], [s5, null]],
    artistSplit: [[0, null], [s4 + 0.2, [60, 640, 960, 490]], [s5, null]],
    pct: [[0, null], [s5 + 0.12, [552, 170, 468, 700]]],
    grid: [[0, null], [s5 + 0.28, [60, 900, 960, 330]]],
  };
  PROD.forEach((g, i) => { TILES['prod' + i] = [[0, null], [F('panggung', g[4]) - 0.1, Q[i]], [s3, null]]; });

  AM.sfx('stamp', T.price, { gain: 0.45 });
  AM.sfx('pop', T.ask, { gain: 0.4 });
  AM.sfx('coin', s1 + 0.2, { gain: 0.4 });
  AM.sfx('thud', s2 + 0.15, { gain: 0.45 });
  AM.sfx('pop', s3 + 0.15, { gain: 0.4 });
  AM.sfx('coin', s4 + 0.2, { gain: 0.4 });
  AM.sfx('ding', s5 + 0.25, { gain: 0.45 });
}
const R = (id, t) => K.rectAt(t, TILES[id]);

function draw(t) {
  K.text(ctx, 'BEDAH HARGA TIKET KONSER', 60, 112, { size: 26, font: K.FONT.mono, weight: 700 });
  K.pill(ctx, 'PERKIRAAN', 1020 - 120, 112, { size: 22, fill: P.yellow, align: 'right', shadow: 3 });

  // Mascot tile
  const ms = R('mascot', t);
  const mood = (t > T.ask && t < T.s2) || (t > T.s4 && t < T.s5 + 0.5) ? 'shock' : 'happy';
  K.tile(ctx, ms, { fill: P.lavender, t, hatchIt: true, hatchColor: 'rgba(17,17,17,0.08)' });
  K.inTile(ctx, ms, () => {
    const s = ms.h / 560;
    const hits = [T.price, T.ask, T.s1, T.s2, T.s3, T.s4, T.s5].filter((x) => x < t).pop() || -9;
    const sq = Math.exp(-(t - hits) * 6) * Math.sin((t - hits) * 22);
    ticketGuy(ctx, ms.x + ms.w / 2, ms.y + ms.h - 42 * s, 1.15 * s, { t, mood, squash: sq });
    K.pill(ctx, 'TIKET KONSER', ms.x + 24, ms.y + 40, { size: Math.max(16, 21 * s), shadow: 3 });
  });

  // Price tile
  const pr = R('price', t);
  K.tile(ctx, pr, { fill: P.cobalt });
  K.inTile(ctx, pr, () => {
    const big = pr.h > 200;
    K.text(ctx, 'HARGA 1 TIKET VIP/FESTIVAL', pr.x + 30, pr.y + 42, { size: 21, font: K.FONT.mono, weight: 700, color: P.white });
    const val = Math.round(K.count(t, 0.1, 0.7, 0, 1500000) / 10000) * 10000;
    K.text(ctx, K.rp(val), pr.x + 30, pr.y + pr.h * 0.58, { size: big ? 84 : 76, color: P.white, maxW: pr.w - 60 });
  });

  // Hook question card
  const ha = R('hookAsk', t);
  K.tile(ctx, ha, { fill: P.lime });
  K.inTile(ctx, ha, () => {
    K.ICON.mic(ctx, ha.x + 54, ha.y + 54, 48);
    K.text(ctx, 'BAGIAN MUSISI?', ha.x + 94, ha.y + 54, { size: 24, font: K.FONT.mono, weight: 700 });
    K.text(ctx, '≈ Rp240rb', ha.x + 30, ha.y + 185, { size: 84, maxW: ha.w - 60 });
    K.pill(ctx, 'BERSIH ≈ 16%', ha.x + 30, ha.y + 284, { size: 22, shadow: 3 });
  });

  // Hook bar
  const hb = R('hookBar', t);
  K.tile(ctx, hb, { fill: P.white });
  K.inTile(ctx, hb, () => {
    K.text(ctx, 'PORSI BERSIH MUSISI DARI TIKET Rp1.500.000', hb.x + 30, hb.y + 46, { size: 22, font: K.FONT.mono, weight: 700 });
    const p = clamp((t - T.ask) / 0.6) * 0.16;
    K.bar(ctx, hb.x + 30, hb.y + 100, hb.w - 60, 96, p, { fill: P.lime, t });
    K.text(ctx, '≈ 16%', hb.x + 30 + (hb.w - 60) * 0.16 + 24, hb.y + 150, { size: 40 });
  });

  // Beat 2: Tax & Platform fee
  const th = R('taxHead', t);
  K.tile(ctx, th, { fill: P.coral });
  K.inTile(ctx, th, () => {
    const shown = Math.round(K.count(t, T.s1 + 0.1, 0.7, 0, 300000) / 5000) * 5000;
    K.text(ctx, '1. PAJAK & PLATFORM TIKET (20%)', th.x + 30, th.y + 40, { size: 21, font: K.FONT.mono, weight: 700, color: P.white });
    K.text(ctx, '≈ ' + K.rp(shown), th.x + 30, th.y + 130, { size: 78, color: P.white, maxW: th.w - 60 });
  });
  const tc = R('taxCard', t);
  K.tile(ctx, tc, { fill: P.white });
  K.inTile(ctx, tc, () => {
    K.text(ctx, 'POTONGAN LANGSUNG SAAT CHECKOUT', tc.x + 34, tc.y + 52, { size: 24, font: K.FONT.mono, weight: 700 });
    const rows = [
      ['PAJAK HIBURAN DAERAH (≈10–15%)', 'Rp180.000', 0.6, P.coral],
      ['KOMISI PLATFORM TICKETING (≈5%)', 'Rp75.000', 0.25, P.yellow],
      ['PAYMENT GATEWAY & ADMIN (≈3%)', 'Rp45.000', 0.15, P.cobalt],
    ];
    rows.forEach(([lbl, val, frac, col], i) => {
      const yy = tc.y + 115 + i * 120;
      K.text(ctx, lbl, tc.x + 34, yy, { size: 22, font: K.FONT.mono, weight: 700 });
      K.text(ctx, val, tc.x + tc.w - 34, yy, { size: 32, align: 'right' });
      const p = clamp((t - (T.s1 + 0.35 + i * 0.35)) / 0.5) * frac;
      K.bar(ctx, tc.x + 34, yy + 28, tc.w - 68, 44, p, { fill: col, t });
    });
  });

  // Beat 3: Stage & Stadium production
  const sh = R('stageHead', t);
  K.tile(ctx, sh, { fill: P.yellow });
  K.inTile(ctx, sh, () => {
    const shown = Math.round(K.count(t, T.s2 + 0.1, 0.7, 0, 525000) / 5000) * 5000;
    K.text(ctx, '2. PRODUKSI & STADION (35%)', sh.x + 30, sh.y + 40, { size: 22, font: K.FONT.mono, weight: 700 });
    K.text(ctx, '≈ ' + K.rp(shown), sh.x + 30, sh.y + 130, { size: 78, maxW: sh.w - 60 });
  });
  PROD.forEach(([name, v, icon, col, frac], i) => {
    const r = R('prod' + i, t);
    if (!K.tile(ctx, r, { fill: P.white })) return;
    K.inTile(ctx, r, () => {
      icon(ctx, r.x + 56, r.y + 60, 56, col);
      K.text(ctx, name, r.x + 102, r.y + 60, { size: 24, font: K.FONT.mono, weight: 700, maxW: r.w - 126 });
      K.text(ctx, K.rp(v), r.x + 30, r.y + 134, { size: 46 });
      const p = clamp((t - F('panggung', frac) + 0.1) / 0.45) * (v / 240000);
      K.bar(ctx, r.x + 26, r.y + 172, r.w - 52, 34, p, { fill: col, t });
    });
  });

  // Beat 4: Promoter & Marketing
  const ph = R('promoHead', t);
  K.tile(ctx, ph, { fill: P.pink });
  K.inTile(ctx, ph, () => {
    K.text(ctx, '3. PROMOTOR & OPERASIONAL (15%)', ph.x + 30, ph.y + 40, { size: 21, font: K.FONT.mono, weight: 700 });
    K.text(ctx, '≈ Rp225.000', ph.x + 30, ph.y + 130, { size: 78, maxW: ph.w - 60 });
  });
  const pc = R('promoCard', t);
  K.tile(ctx, pc, { fill: P.white, t, hatchIt: true, hatchColor: 'rgba(17,17,17,0.06)' });
  K.inTile(ctx, pc, () => {
    K.text(ctx, 'BIAYA PROMOTOR, IKLAN & RISIKO ACARA', pc.x + 34, pc.y + 52, { size: 23, font: K.FONT.mono, weight: 700 });
    const items = [
      ['IKLAN BALIHO & SOSIAL MEDIA', 'Rp75.000', P.yellow],
      ['ASURANSI, MEDIS & KRU LOKAL', 'Rp75.000', P.lavender],
      ['MARGIN & CADANGAN RISIKO PROMOTOR', 'Rp75.000', P.lime],
    ];
    items.forEach(([nm, rpStr, col], i) => {
      const bx = pc.x + 34, by = pc.y + 96 + i * 122, bw = pc.w - 68, bh = 98;
      AM.lib.roundRect(ctx, bx + 5, by + 5, bw, bh, 18); ctx.fillStyle = P.ink; ctx.fill();
      AM.lib.roundRect(ctx, bx, by, bw, bh, 18); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
      K.text(ctx, nm, bx + 24, by + bh / 2, { size: 24, font: K.FONT.mono, weight: 700, maxW: bw - 260 });
      K.text(ctx, rpStr, bx + bw - 24, by + bh / 2, { size: 36, align: 'right' });
    });
  });

  // Beat 5: Artist Gross vs Net
  const ah = R('artistHead', t);
  K.tile(ctx, ah, { fill: P.cobalt });
  K.inTile(ctx, ah, () => {
    K.text(ctx, '4. FEE KOTOR ARTIS (30%)', ah.x + 30, ah.y + 40, { size: 22, font: K.FONT.mono, weight: 700, color: P.white });
    K.text(ctx, '≈ Rp450.000', ah.x + 30, ah.y + 130, { size: 78, color: P.white, maxW: ah.w - 60 });
  });
  const as = R('artistSplit', t);
  K.tile(ctx, as, { fill: P.white });
  K.inTile(ctx, as, () => {
    K.ICON.mic(ctx, as.x + 56, as.y + 58, 56);
    K.text(ctx, 'PEMBAGIAN FEE ARTIS Rp450.000', as.x + 104, as.y + 56, { size: 25, font: K.FONT.mono, weight: 700 });
    const p = ease.outCubic(clamp((t - (T.s4 + 0.35)) / 0.7));
    const bx = as.x + 30, by = as.y + 140, bw = as.w - 60, bh = 160, pw = bw * 0.53 * p;
    AM.lib.roundRect(ctx, bx, by, bw, bh, 20); ctx.fillStyle = P.coral; ctx.fill();
    K.hatch(ctx, bx, by, bw, bh, { t, r: 20, color: 'rgba(17,17,17,0.16)' });
    if (pw > 2) {
      ctx.save(); AM.lib.roundRect(ctx, bx, by, bw, bh, 20); ctx.clip();
      ctx.fillStyle = P.lime; ctx.fillRect(bx, by, pw, bh);
      ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.moveTo(bx + pw, by); ctx.lineTo(bx + pw, by + bh); ctx.stroke();
      ctx.restore();
    }
    AM.lib.roundRect(ctx, bx, by, bw, bh, 20); ctx.lineWidth = 4; ctx.strokeStyle = P.ink; ctx.stroke();
    K.text(ctx, 'MUSISI ≈ Rp240rb', bx + 24, by + bh / 2, { size: 32, maxW: bw * 0.48 });
    K.text(ctx, 'MANAJEMEN · AGEN · KRU TUR', bx + bw - 22, by + bh / 2, { size: 21, font: K.FONT.mono, weight: 700, align: 'right', color: P.white, maxW: bw * 0.44 });
    K.pill(ctx, 'POTONGAN TIM & KRU ≈ Rp210.000', bx + bw / 2, by + bh + 86, { size: 23, fill: P.yellow, align: 'center' });
  });

  // Beat 6: Finale 16% & 100 boxes
  const pct = R('pct', t);
  K.tile(ctx, pct, { fill: P.lime });
  K.inTile(ctx, pct, () => {
    K.text(ctx, 'BERSIH KE MUSISI', pct.x + 30, pct.y + 50, { size: 24, font: K.FONT.mono, weight: 700 });
    const n = Math.round(K.count(t, T.s5 + 0.2, 0.7, 0, 16));
    K.text(ctx, n + '%', pct.x + pct.w / 2, pct.y + 330, { size: 210, align: 'center', maxW: pct.w - 40 });
    K.ICON.mic(ctx, pct.x + pct.w / 2, pct.y + 560, 110, P.coral);
  });
  const gr = R('grid', t);
  K.tile(ctx, gr, { fill: P.white });
  K.inTile(ctx, gr, () => {
    K.text(ctx, '1 TIKET = 100 KOTAK (16 KOTAK UNTUK PENYANYI)', gr.x + 30, gr.y + 44, { size: 21, font: K.FONT.mono, weight: 700 });
    const cs = 42, gx = gr.x + 30, gy = gr.y + 86;
    for (let j = 0; j < 5; j++) for (let i = 0; i < 20; i++) {
      const k = j * 20 + i, on = k < 16 && t > T.s5 + 0.35 + k * 0.04;
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

