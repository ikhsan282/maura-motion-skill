// Kolase Daun & Bunga demo1: "Rafflesia arnoldii — Bunga Raksasa Berbau Bangkai dari Hutan Bengkulu"
import * as K from '/styles/kolase-daun-bunga/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 2, captions: { preset: 'serif', y: 1520, size: 54, maxWords: 4 } };

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('paper', 0.08, { gain: 0.45 });
  AM.sfx('pop', C.hook.start + 0.3, { gain: 0.4 });
  AM.sfx('paper', C.tanpa.start + 0.25, { gain: 0.4 });
  AM.sfx('whoosh', C.inang.start + 0.3, { gain: 0.35 });
  AM.sfx('magic', C.mekar.start + 0.35, { gain: 0.42 });
  AM.sfx('pop', C.lalat.start + 0.3, { gain: 0.38 });
  AM.sfx('wind', C.singkat.start + 0.25, { gain: 0.25 });
  AM.sfx('ding', C.perbedaan.start + 0.3, { gain: 0.4 });
  AM.sfx('bell_temple', C.akhir.start + 0.35, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// 1. Hook: Giant Rafflesia blooming on the herbarium sheet surrounded by forest leaves
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, lerp(0.96, 1.06, p));
  K.leaf(ctx, 220, 1140, 260, 82, -0.55, P.leafDk, { t, tape: true });
  K.leaf(ctx, 860, 1140, 260, 82, -2.55, P.leaf, { t, tape: true });
  K.rafflesia(ctx, 540, 1000, 265, { t, open: clamp(p * 1.3), scent: true });
  K.herbariumLabel(ctx, 'RAFFLESIA ARNOLDII', 540, 260, {
    latin: 'Rafflesiaceae · Bengkulu',
    sub: 'bunga tunggal terbesar di dunia yang beraroma bangkai',
    alpha: env(t, a + 0.1, b, 0.3, 0.25),
  });
});

// 2. Tanpa: Leaves, stems, and roots crossed out on the specimen sheet
shot('tanpa', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.02);
  K.leaf(ctx, 220, 980, 240, 78, -0.35, P.leaf, { t, tape: true });
  K.twig(ctx, [[540, 1140], [540, 800]], { width: 14, tape: true });
  K.twig(ctx, [[800, 900], [740, 1060], [820, 1120], [860, 1040]], { width: 8, tape: true });
  // Botanical red ink X marks over leaf, stem, root
  ctx.save();
  ctx.strokeStyle = P.petalRed;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  for (const [cx, cy, delay] of [[310, 940, 0.2], [540, 960, 0.8], [800, 1010, 1.4]]) {
    const u = prog(t, a + delay, a + delay + 0.5);
    if (u > 0) {
      ctx.beginPath();
      ctx.moveTo(cx - 55 * u, cy - 55 * u); ctx.lineTo(cx + 55 * u, cy + 55 * u);
      ctx.moveTo(cx + 55 * u, cy - 55 * u); ctx.lineTo(cx - 55 * u, cy + 55 * u);
      ctx.stroke();
    }
  }
  ctx.restore();
  K.herbariumLabel(ctx, 'HOLOPARASIT MURNI', 540, 260, {
    latin: 'Tanpa Klorofil',
    sub: 'tidak memiliki daun, batang, maupun akar sendiri',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 3. Inang: Growing as a bud on the Tetrastigma liana vine
shot('inang', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.05);
  K.twig(ctx, [[120, 1080], [380, 980], [680, 1020], [960, 920]], { width: 22, tape: true });
  K.leaf(ctx, 280, 960, 190, 62, -0.8, P.leaf, { t });
  K.leaf(ctx, 760, 980, 190, 62, -0.4, P.leafLt, { t });
  // Swelling cabbage-like Rafflesia bud (`knop`) on the vine
  const budR = lerp(55, 135, p);
  K.rafflesia(ctx, 540, 990, budR, { t, open: 0.32 });
  K.herbariumLabel(ctx, 'INANG TETRASTIGMA', 540, 260, {
    latin: 'Tetrastigma leucostaphylum',
    sub: 'kuncup tumbuh menempel pada akar sulur hutan hujan',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 4. Mekar: 9 months to bloom up to 100 cm diameter
shot('mekar', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, lerp(1.0, 1.12, p));
  K.twig(ctx, [[120, 1080], [540, 1020], [960, 960]], { width: 20 });
  K.rafflesia(ctx, 540, 1000, lerp(130, 290, p), { t, open: lerp(0.35, 1.0, p) });
  K.herbariumLabel(ctx, 'DIAMETER 100 SENTIMETER', 540, 260, {
    latin: 'Berat hingga 11 Kilogram',
    sub: 'menanti 9 bulan sebagai knop sebelum merekah penuh',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 5. Lalat: Carrion scent waves attracting forest flies made of pressed leaves & seeds
shot('lalat', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.06);
  K.rafflesia(ctx, 540, 1040, 260, { t, open: 1, scent: true });
  for (let i = 0; i < 4; i++) {
    const ang = t * 1.4 + (i / 4) * Math.PI * 2;
    const fx = 540 + Math.cos(ang) * lerp(290, 120, p);
    const fy = 960 + Math.sin(ang) * lerp(220, 90, p);
    K.leafCreature(ctx, 'lalat', { x: fx, y: fy, s: 1.05, t: t + i, flap: 1 });
  }
  K.herbariumLabel(ctx, 'PENYERBUKAN OLEH LALAT', 540, 260, {
    latin: 'Mimikri Aroma Bangkai',
    sub: 'memikat lalat hutan untuk memindahkan serbuk sari',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 6. Singkat: Only 5–7 days of bloom before darkening
shot('singkat', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.02);
  K.rafflesia(ctx, 540, 1000, 260, { t, open: lerp(1.0, 0.65, p) });
  // Drifting dried petals around the flower
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    K.leaf(ctx, 540 + Math.cos(ang) * (240 + p * 80), 1000 + Math.sin(ang) * (240 + p * 80), 95, 36, ang, P.leafRust, { t });
  }
  K.herbariumLabel(ctx, 'MEKAR HANYA 5 – 7 HARI', 540, 260, {
    latin: 'Siklus Mekar Singkat',
    sub: 'perjuangan sembilan bulan demi sepekan keindahan',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 7. Perbedaan: Rafflesia (flat wide single flower) vs Amorphophallus titanum (tall spadix inflorescence)
shot('perbedaan', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.0);
  // Left: Rafflesia (melebar)
  K.rafflesia(ctx, 300, 1040, 155, { t, open: 1 });
  // Right: Amorphophallus titanum (menjulang tinggi) assembled from leaves
  K.leaf(ctx, 780, 960, 340, 62, -Math.PI / 2, P.petalGold, { t });
  K.leaf(ctx, 780, 1120, 210, 85, -2.2, P.petalPurple, { t });
  K.leaf(ctx, 780, 1120, 210, 85, -0.9, P.petalPurple, { t });
  K.herbariumLabel(ctx, 'RAFFLESIA VS TITAN ARUM', 540, 260, {
    latin: 'Dua Puspa Berbeda',
    sub: 'Rafflesia melebar di tanah · Amorphophallus menjulang tinggi',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 8. Akhir: Puspa Langka Indonesia framed by tropical leaves & butterflies
shot('akhir', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, lerp(1.06, 0.96, p));
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2;
    K.leaf(ctx, 540 + Math.cos(a0) * 210, 1000 + Math.sin(a0) * 210, 180, 58, a0, i % 2 ? P.leaf : P.leafLt, { t });
  }
  K.rafflesia(ctx, 540, 1000, 250, { t, open: 1 });
  K.herbariumLabel(ctx, 'PUSPA LANGKA INDONESIA', 540, 260, {
    latin: 'Harta Karun Hutan Sumatera',
    sub: 'simbol kekayaan hayati Nusantara yang wajib dilestarikan',
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
    ctx.fillStyle = `rgba(245,235,210,${0.25 * (1 - since / 0.14)})`;
    ctx.fillRect(0, 0, 1080, 1920);
  }
}
