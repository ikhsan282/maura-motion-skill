// Kardus Bekas demo1: "Perjalanan Kardus Paketmu — Bisa Lahir Kembali Sampai Tujuh Kali"
import * as K from '/styles/kardus-bekas/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 2, captions: { preset: 'bold', y: 1520, size: 56, maxWords: 4 } };

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('paper', 0.08, { gain: 0.5 });
  AM.sfx('pop', C.hook.start + 0.35, { gain: 0.45 });
  AM.sfx('paper', C.serat.start + 0.25, { gain: 0.45 });
  AM.sfx('boing', C.gelombang.start + 0.3, { gain: 0.4 });
  AM.sfx('whoosh', C.paket.start + 0.25, { gain: 0.38 });
  AM.sfx('drum_hit', C.pulper.start + 0.3, { gain: 0.38 });
  AM.sfx('paper', C.batas.start + 0.25, { gain: 0.4, pitch: 1.2 });
  AM.sfx('ding', C.tujuh.start + 0.3, { gain: 0.45 });
  AM.sfx('chime', C.moral.start + 0.35, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// 1. Hook: Shipping box pops onto the cutting mat and opens its flaps
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(0.95, 1.08, p), 540, 960);
  const open = prog(t, a + 0.8, a + 2.4, ease.outBack);
  K.shippingBox(ctx, 540, 1020, 1.45, { open, mood: 'happy', recycleNum: 7, t });
  K.cardLabel(ctx, 'LAHIR KEMBALI 7 KALI', 540, 270, {
    tag: 'SIKLUS KARDUS PAKETMU',
    sub: 'rahasia daur ulang kotak belanja daring',
    alpha: env(t, a + 0.1, b, 0.3, 0.25),
  });
});

// 2. Serat: Long pine cellulose fibers pressed into kraft linerboard
shot('serat', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.04, 540, 960);
  K.cardPanel(ctx, 540, 980, 740, 480, { col: P.kraft, tornCorner: true, tapeTop: true, seed: 12 });
  // Interlocking long wood cellulose fiber strands drawn on the panel
  ctx.save();
  ctx.translate(540, 980);
  ctx.strokeStyle = P.kraftPale;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  for (let i = -4; i <= 4; i++) {
    const len = lerp(80, 560, clamp(p * 1.4));
    ctx.beginPath();
    ctx.moveTo(-len / 2, i * 38);
    ctx.bezierCurveTo(-120, i * 38 - 28, 120, i * 38 + 28, len / 2, i * 38);
    ctx.stroke();
  }
  ctx.restore();
  K.cardLabel(ctx, 'SERAT SELULOSA PINUS', 540, 270, {
    tag: 'BAHAN BAKU KERTAS KRAFT',
    sub: 'serat kayu panjang yang saling mengunci kuat',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 3. Gelombang: The wavy flute layer sandwiched between two flat linerboards
shot('gelombang', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(1.0, 1.12, p), 540, 960);
  const press = 0.5 + 0.5 * Math.sin(t * 4);
  K.fluteCrossSection(ctx, 540, 980, 820, 240, { t, load: press * 0.6, arrows: true });
  K.cardLabel(ctx, 'LAPISAN GELOMBANG (FLUTE)', 540, 270, {
    tag: 'STRUKTUR TIGA LAPIS',
    sub: 'lengkungan kertas di tengah yang meredam benturan',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 4. Paket: Delivery boxes marching from house to collector
shot('paket', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.0, 540, 960);
  for (let i = -1; i <= 1; i++) {
    const bx = 540 + i * 290 + Math.sin(t * 3 + i) * 14;
    const by = 1000 + Math.abs(Math.sin(t * 5 + i)) * -18;
    K.shippingBox(ctx, bx, by, 0.92, { open: 0, stamp: 'RECYCLE', t: t + i });
  }
  K.cardLabel(ctx, 'DARI RUMAH KE PENGEPUL', 540, 270, {
    tag: 'RANTAI DAUR ULANG',
    sub: 'dikumpulkan kembali setelah paket dibuka',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 5. Pulper: Cardboard recycling mill spinning & pulping old boxes
shot('pulper', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(0.98, 1.08, p), 540, 960);
  K.cardPuppet(ctx, 'pabrik', { x: 540, y: 1020, s: 1.55, t });
  K.cardLabel(ctx, 'MESIN PULPER DAUR ULANG', 540, 270, {
    tag: 'PELEBURAN BUBUR KERTAS',
    sub: 'memisahkan selotip dan staples dari serat kertas',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 6. Batas: Microscopic fibers getting shorter every time they are recycled
shot('batas', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.04, 540, 960);
  K.cardPanel(ctx, 540, 980, 780, 520, { col: P.kraftDk, tapeTop: true, seed: 25 });
  // Compare Cycle 1 (long fibers) vs Cycle 7 (short fragmented fibers)
  const segLen = lerp(240, 48, p);
  ctx.save();
  ctx.translate(540, 980);
  ctx.strokeStyle = P.kraftPale;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  for (let row = -2; row <= 2; row++) {
    for (let col = -1; col <= 1; col++) {
      const cx = col * 210, cy = row * 72;
      ctx.beginPath();
      ctx.moveTo(cx - segLen / 2, cy - 8);
      ctx.lineTo(cx + segLen / 2, cy + 8);
      ctx.stroke();
    }
  }
  ctx.restore();
  K.cardLabel(ctx, 'SERAT SEMAKIN MEMENDEK', 540, 270, {
    tag: 'BATAS FISIKA SELULOSA',
    sub: 'setiap penggilingan memotong panjang serat mikroskopis',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 7. Tujuh: 7 lives counter from 1x to 7x across cardboard panels
shot('tujuh', (t, a, b) => {
  const p = prog(t, a, b, ease.outCubic);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.0, 540, 960);
  const count = Math.max(1, Math.min(7, Math.ceil(p * 7)));
  for (let i = 0; i < 7; i++) {
    const active = i < count;
    const row = Math.floor(i / 4), col = i % 4;
    const gx = (row === 0 ? 210 : 320) + col * 220;
    const gy = 820 + row * 290;
    K.shippingBox(ctx, gx, gy, active ? 0.68 : 0.55, {
      open: i === 6 && active ? 0.6 : 0,
      recycleNum: i + 1,
      face: active,
      t: t + i * 0.2,
    });
  }
  K.cardLabel(ctx, `SIKLUS HIDUP KE-${count} DARI 7`, 540, 270, {
    tag: 'MAKSIMAL 5 – 7 KALI DAUR ULANG',
    sub: 'berakhir menjadi karton wadah telur dan tisu',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 8. Moral: Folded flat box & happy reborn box side by side
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(1.06, 0.96, p), 540, 960);
  K.shippingBox(ctx, 540, 1020, 1.5, { open: 0.35 * Math.sin(t * 2.5) + 0.35, mood: 'happy', recycleNum: 7, t });
  K.cardLabel(ctx, 'LIPAT & DAUR ULANG', 540, 270, {
    tag: 'TUJUH KEHIDUPAN KARDUS',
    sub: 'satu langkah kecil di rumah untuk menjaga hutan bumi',
    alpha: env(t, a + 0.15, b + 0.5, 0.35, 0.2),
  });
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= at(sh.id)) s = sh;
  const i = SHOTS.indexOf(s);
  const a = Math.max(0, at(s.id)), b = SHOTS[i + 1] ? at(SHOTS[i + 1].id) : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - a;
  if (i > 0 && since < 0.14) {
    ctx.fillStyle = `rgba(245,225,190,${0.22 * (1 - since / 0.14)})`;
    ctx.fillRect(0, 0, 1080, 1920);
  }
}
