// One-Shape UI Morph — Demo 2: Dari Tombol Bayar Sampai Struk Digital
import * as K from '/styles/ui-morph/kit.js';
const { clamp, lerp, ease } = AM.lib;
const P = K.PAL;

export const meta = {
  fps: 24,
  hold: 1,
  captions: { preset: 'clean', y: 1480, size: 54, box: { fill: 'rgba(14,14,16,0.86)', pad: 20, radius: 30 } },
};

let ctx;
const C = {};
const CX = 540, CY = 860;
const SH = {
  button: { x: CX, y: CY, w: 620, h: 140, r: 70, elev: 1 },
  loader: { x: CX, y: CY, w: 165, h: 165, elev: 1.15 },
  check: { x: CX, y: CY, w: 185, h: 185, elev: 1.3, color: P.accent },
  receipt: { x: CX, y: CY, w: 780, h: 560, r: 52, elev: 1.65 },
  cashback: { x: CX, y: CY - 20, w: 760, h: 165, r: 82, elev: 1.45 },
  stars: { x: CX, y: CY, w: 700, h: 150, r: 75, elev: 1.25 },
};

let STATES = [], CLICKS = [], PTR = [], STEPS = [];
const TT = {};

export async function setup(AM) {
  ctx = AM.layer('stage');
  for (const l of AM.timeline.lines) C[l.id] = l;

  const T = {
    preview: C.hook.start + 1.2,
    click: C.klik.start + 0.6,
    spin: C.proses.start + 0.1,
    check: C.sukses.start + 0.1,
    receipt: C.struk.start + 0.1,
    cashback: C.cashback.start + 0.1,
    stars: C.rating.start + 0.1,
    back: C.penutup.start + 0.1,
  };
  Object.assign(TT, T);

  const st = (t, k) => [t, { ...SH[k] }, k];
  STATES = [
    st(0, 'button'),
    st(T.preview, 'loader'),
    st(T.preview + 0.3, 'check'),
    st(T.preview + 0.6, 'receipt'),
    st(T.preview + 0.95, 'button'),
    st(T.spin, 'loader'),
    st(T.check, 'check'),
    st(T.receipt, 'receipt'),
    st(T.cashback, 'cashback'),
    st(T.stars, 'stars'),
    st(T.back, 'button'),
  ];

  CLICKS = [T.click, T.stars + 0.8];
  PTR = [
    [0, 960, 1340],
    [T.click - 0.5, 650, 905],
    [T.click + 0.4, 880, 1220],
    [T.stars + 0.3, CX + 240, CY + 10],
    [T.back + 0.3, 920, 1280],
  ];
  STEPS = [
    [0, 'Tombol Bayar'],
    [T.spin, 'Verifikasi Saldo'],
    [T.check, 'Otorisasi Sukses'],
    [T.receipt, 'Struk Digital'],
    [T.cashback, 'Cashback Masuk'],
    [T.stars, 'Ulasan Transaksi'],
    [T.back, 'Selesai & Siap'],
  ];

  AM.sfx('click', T.click, { gain: 0.5 });
  AM.sfx('tick', T.check + 0.15, { gain: 0.45, pitch: 1.2 });
  AM.sfx('pop', T.receipt + 0.1, { gain: 0.4 });
  AM.sfx('ding', T.cashback + 0.1, { gain: 0.45 });
  AM.sfx('sparkle', T.stars + 0.4, { gain: 0.35 });
}

function content(kind, s, t, t0, t1) {
  const short = t1 - t0 < 0.5;
  const E = K.swap(t, t0 + (short ? 0.03 : 0.1), t1, short ? { inDur: 0.08, outDur: 0.06, roll: 12 } : {});
  if (E.a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= E.a;
  ctx.translate(0, E.dy);
  AM.lib.roundRect(ctx, s.x - s.w / 2, s.y - s.h / 2 - E.dy, s.w, s.h, s.r);
  ctx.clip();
  const x = s.x, y = s.y;

  if (kind === 'button') {
    K.G.bag(ctx, x - 215, y - 4, 52);
    K.label(ctx, 'Bayar Tagihan', x - 160, y, { size: 42, align: 'left' });
    K.label(ctx, 'Rp125.000', x + 260, y + 2, { size: 34, weight: 400, color: 'rgba(255,255,255,0.6)', align: 'right', spacing: 0 });
  } else if (kind === 'loader') {
    K.G.spinner(ctx, x, y, 42, t);
  } else if (kind === 'check') {
    K.G.check(ctx, x, y, 118, clamp((t - t0 - 0.08) / 0.35), P.white, 13);
  } else if (kind === 'receipt') {
    K.label(ctx, 'STRUK PEMBAYARAN RESMI', x - 310, y - 205, { size: 24, weight: 700, font: K.FONT.mono, color: P.accent, align: 'left', spacing: 2 });
    K.label(ctx, 'Rp125.000', x - 310, y - 135, { size: 64, weight: 700, align: 'left' });
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x - 310, y - 75, 620, 2);

    const rows = [
      ['Layanan', 'Tagihan Listrik PLN'],
      ['ID Pelanggan', '5412-0988-331'],
      ['Biaya Admin', 'Rp0 (Gratis)'],
      ['No. Referensi', 'INV-2026-9941'],
    ];
    rows.forEach(([k, v], i) => {
      const yy = y - 20 + i * 62;
      K.label(ctx, k, x - 310, yy, { size: 28, weight: 400, color: 'rgba(255,255,255,0.55)', align: 'left', spacing: 0 });
      K.label(ctx, v, x + 310, yy, { size: 28, weight: 700, align: 'right', spacing: 0 });
    });
  } else if (kind === 'cashback') {
    ctx.fillStyle = P.accent;
    ctx.beginPath();
    ctx.arc(x - 285, y, 48, 0, Math.PI * 2);
    ctx.fill();
    K.G.star(ctx, x - 285, y + 2, 28, 1, P.white, P.white);
    K.label(ctx, '+Rp12.500 Cashback Koin', x - 210, y - 18, { size: 36, align: 'left', spacing: 0 });
    K.label(ctx, 'Otomatis ditambahkan ke saldo', x - 210, y + 28, { size: 26, weight: 400, color: 'rgba(255,255,255,0.6)', align: 'left', spacing: 0 });
  } else if (kind === 'stars') {
    for (let i = 0; i < 5; i++) {
      const f = short ? 1 : K.sp(t, t0 + 0.15 + i * 0.1, 0.3, 0.55);
      K.G.star(ctx, x + (i - 2) * 120, y + 2, 46, f);
    }
  }
  ctx.restore();
}

export function render(t) {
  K.stage(ctx, t);
  const idx = K.stateIndex(t, STATES);
  const s = K.shapeAt(t, STATES.map(([a, b]) => [a, b]), { z: 0.68, ts: 0.36, lag: 1.4 });

  let kick = 0;
  for (let i = 1; i < STATES.length; i++) {
    const d = t - STATES[i][0];
    if (d > 0 && d < 1.2) kick += 0.022 * Math.exp(-d * 3) * Math.sin(Math.min(d * 5, Math.PI));
  }
  const z = 1 + kick, drift = Math.sin(t * 0.4) * 6;
  ctx.setTransform(z, 0, 0, z, CX - CX * z, CY - CY * z + drift);

  const p = K.pointerAt(t, PTR, CLICKS, { z: 0.95, ts: 0.75 });
  const press = Math.max(0, ...CLICKS.map((c) => (Math.abs(t - c) < 0.12 ? 1 - Math.abs(t - c) / 0.12 : 0)));

  K.body(ctx, s, { press });
  for (let i = Math.max(0, idx - 1); i <= idx; i++) {
    content(STATES[i][2], s, t, STATES[i][0], STATES[i + 1] ? STATES[i + 1][0] : 99);
  }

  const subs = [
    [0, TT.spin, 'Satu bentuk · Tanpa pindah layar'],
    [TT.receipt, TT.cashback, 'Tersimpan otomatis di riwayat'],
    [TT.stars, TT.back, 'Transaksi selesai dalam 1 alur'],
  ];
  for (const [a, b, str] of subs) {
    const E = K.swap(t, a + 0.15, b);
    if (E.a > 0) K.label(ctx, str, CX, CY + 340 + E.dy, { size: 34, weight: 400, color: P.ink2, alpha: E.a, spacing: 0 });
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.stepper(ctx, t, STEPS, 120, 280);
  for (const c of CLICKS) K.ring(ctx, p.x, p.y, t - c, { r: 65 });
  K.pointer(ctx, p.x, p.y, { press: p.press, scale: 1.05 });
}

