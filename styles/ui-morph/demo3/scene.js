// One-Shape UI Morph — Demo 3: Satu Kapsul di Pagi Hari (Alarm -> Cuaca -> Kopi -> Timer Fokus)
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
  pill: { x: CX, y: CY, w: 480, h: 124, r: 62, elev: 1 },
  bell: { x: CX, y: CY, w: 250, h: 250, elev: 1.4 },
  weather: { x: CX, y: CY, w: 800, h: 480, r: 54, elev: 1.6 },
  coffee: { x: CX, y: CY - 15, w: 740, h: 165, r: 82, elev: 1.45 },
  timer: { x: CX, y: CY, w: 410, h: 410, elev: 1.35 },
  check: { x: CX, y: CY, w: 185, h: 185, elev: 1.3, color: P.accent },
  stars: { x: CX, y: CY, w: 700, h: 150, r: 75, elev: 1.25 },
};

let STATES = [], CLICKS = [], PTR = [], STEPS = [];
const TT = {};

export async function setup(AM) {
  ctx = AM.layer('stage');
  for (const l of AM.timeline.lines) C[l.id] = l;

  const T = {
    alarm: C.alarm.start + 0.1,
    weather: C.cuaca.start + 0.1,
    coffee: C.kopi.start + 0.1,
    timer: C.fokus.start + 0.1,
    check: C.selesai.start + 0.1,
    stars: C.bintang.start + 0.1,
    back: C.penutup.start + 0.1,
  };
  Object.assign(TT, T);

  const st = (t, k) => [t, { ...SH[k] }, k];
  STATES = [
    st(0, 'pill'),
    st(T.alarm, 'bell'),
    st(T.weather, 'weather'),
    st(T.coffee, 'coffee'),
    st(T.timer, 'timer'),
    st(T.check, 'check'),
    st(T.stars, 'stars'),
    st(T.back, 'pill'),
  ];

  CLICKS = [T.weather - 0.1, T.stars + 0.8];
  PTR = [
    [0, 920, 1320],
    [T.weather - 0.55, CX + 30, CY + 20],
    [T.weather + 0.4, 880, 1220],
    [T.stars + 0.3, CX + 240, CY + 10],
    [T.back + 0.3, 920, 1280],
  ];
  STEPS = [
    [0, 'Kapsul Pagi 06.00'],
    [T.alarm, 'Alarm Berbunyi'],
    [T.weather, 'Cuaca & Rute Pagi'],
    [T.coffee, 'Kopi & Sarapan'],
    [T.timer, 'Fokus 25 Menit'],
    [T.check, 'Target Tercapai'],
    [T.stars, 'Skor Produktif'],
    [T.back, 'Mode Istirahat'],
  ];

  AM.sfx('ding', T.alarm + 0.08, { gain: 0.45 });
  AM.sfx('click', T.weather - 0.1, { gain: 0.5 });
  AM.sfx('pop', T.coffee + 0.1, { gain: 0.4 });
  AM.sfx('tick', T.timer + 0.4, { gain: 0.45 });
  AM.sfx('sparkle', T.check + 0.15, { gain: 0.4 });
}

function content(kind, s, t, t0, t1) {
  const E = K.swap(t, t0 + 0.1, t1);
  if (E.a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= E.a;
  ctx.translate(0, E.dy);
  AM.lib.roundRect(ctx, s.x - s.w / 2, s.y - s.h / 2 - E.dy, s.w, s.h, s.r);
  ctx.clip();
  const x = s.x, y = s.y;

  if (kind === 'pill') {
    ctx.fillStyle = P.accent;
    ctx.beginPath();
    ctx.arc(x - 165, y, 16, 0, Math.PI * 2);
    ctx.fill();
    K.label(ctx, '06.00 · Selamat Pagi', x + 20, y, { size: 38, align: 'center' });
  } else if (kind === 'bell') {
    const sw = Math.sin((t - t0) * 16) * 0.35 * Math.exp(-(t - t0) * 0.7);
    K.G.bell(ctx, x, y + 6, 120, sw);
  } else if (kind === 'weather') {
    // Sun / Morning card
    ctx.fillStyle = P.accent;
    ctx.beginPath();
    ctx.arc(x - 245, y - 95, 58, 0, Math.PI * 2);
    ctx.fill();
    K.label(ctx, '24°C · Cerah Berawan', x - 140, y - 115, { size: 42, weight: 700, align: 'left' });
    K.label(ctx, 'Udara segar · Kualitas udara baik (AQI 32)', x - 140, y - 62, { size: 25, weight: 400, color: 'rgba(255,255,255,0.6)', align: 'left' });

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(x - 320, y + 5, 640, 2);

    K.label(ctx, 'Rute Kantor · 22 menit (Lancar)', x - 320, y + 70, { size: 32, weight: 700, align: 'left' });
    K.label(ctx, 'Jadwal pertama: 09.00 Rapat Tim Produk', x - 320, y + 130, { size: 28, weight: 400, color: 'rgba(255,255,255,0.65)', align: 'left' });
  } else if (kind === 'coffee') {
    ctx.fillStyle = P.accent;
    ctx.beginPath();
    ctx.arc(x - 275, y, 48, 0, Math.PI * 2);
    ctx.fill();
    K.G.bag(ctx, x - 275, y - 2, 46);
    K.label(ctx, 'Kopi Susu & Roti Panggang', x - 200, y - 18, { size: 36, align: 'left', spacing: 0 });
    K.label(ctx, 'Tiba dalam 4 menit di depan rumah', x - 200, y + 28, { size: 26, weight: 400, color: 'rgba(255,255,255,0.6)', align: 'left', spacing: 0 });
  } else if (kind === 'timer') {
    const run = clamp((t - t0) / 3.2);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(x, y, 165, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = P.accent;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, 165, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - run * 0.45));
    ctx.stroke();
    const n = lerp(25, 15, ease.outCubic(run));
    K.odometer(ctx, n, x, y - 14, { size: 150, digits: 2 });
    K.label(ctx, 'menit fokus', x, y + 88, { size: 32, weight: 400, color: 'rgba(255,255,255,0.6)', spacing: 0 });
  } else if (kind === 'check') {
    K.G.check(ctx, x, y, 118, clamp((t - t0 - 0.08) / 0.35), P.white, 13);
  } else if (kind === 'stars') {
    for (let i = 0; i < 5; i++) {
      const f = K.sp(t, t0 + 0.15 + i * 0.1, 0.3, 0.55);
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

  if (t > TT.alarm && t < TT.weather) {
    for (const k of [0, 0.3]) K.ring(ctx, s.x, s.y, t - TT.alarm - k, { r: 200, dur: 0.7, lw: 4 });
  }

  const subs = [
    [0, TT.weather, 'Rutinitas pagi dalam 1 kapsul pintar'],
    [TT.timer, TT.check, 'Mode Pomodoro · Bebas distraksi'],
    [TT.stars, TT.back, 'Target pagi selesai 100%'],
  ];
  for (const [a, b, str] of subs) {
    const E = K.swap(t, a + 0.15, b);
    if (E.a > 0) K.label(ctx, str, CX, CY + 310 + E.dy, { size: 34, weight: 400, color: P.ink2, alpha: E.a, spacing: 0 });
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.stepper(ctx, t, STEPS, 120, 280);
  for (const c of CLICKS) K.ring(ctx, p.x, p.y, t - c, { r: 65 });
  K.pointer(ctx, p.x, p.y, { press: p.press, scale: 1.05 });
}

