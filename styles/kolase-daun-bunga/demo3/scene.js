// Kolase Daun & Bunga demo3: "Seni Herbarium & Kolase Botani — Bagaimana Daun Kering Menyimpan Memori Hutan Tropis"
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
  AM.sfx('paper', C.koleksi.start + 0.25, { gain: 0.4 });
  AM.sfx('whoosh', C.pres.start + 0.3, { gain: 0.35 });
  AM.sfx('magic', C.kupu.start + 0.3, { gain: 0.4 });
  AM.sfx('ding', C.burung.start + 0.3, { gain: 0.4 });
  AM.sfx('paper', C.bogor.start + 0.25, { gain: 0.4 });
  AM.sfx('chime', C.iklim.start + 0.3, { gain: 0.4 });
  AM.sfx('bell_temple', C.moral.start + 0.35, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// 1. Hook: Pressed leaves & flowers arranged in a symmetrical botanical mandala
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, lerp(0.96, 1.06, p));
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const col = [P.leaf, P.leafGold, P.leafRust, P.leafLt][i % 4];
    K.leaf(ctx, 540 + Math.cos(ang) * 90, 980 + Math.sin(ang) * 90, 210, 64, ang, col, { t, tape: i % 2 === 0 });
  }
  K.flower(ctx, 540, 980, 95, P.petalRed, P.cream, { t, n: 6 });
  K.herbariumLabel(ctx, 'SENI HERBARIUM & KOLASE', 540, 260, {
    latin: 'Arsip Abadi Alam Tropis',
    sub: 'ketika daun gugur bertahan hingga ratusan tahun',
    alpha: env(t, a + 0.1, b, 0.3, 0.25),
  });
});

// 2. Koleksi: Fallen leaves and petals drifting in to assemble on the sheet
shot('koleksi', (t, a, b) => {
  const p = prog(t, a, b, ease.outCubic);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.02);
  const items = [
    [280, 820, 220, 72, -0.4, P.leaf],
    [780, 840, 210, 68, -2.6, P.leafGold],
    [320, 1120, 200, 65, 0.35, P.leafRust],
    [760, 1100, 220, 70, 2.7, P.leafLt],
  ];
  for (const [lx, ly, len, wid, ang, col] of items) {
    const spread = (1 - p) * 240;
    K.leaf(ctx, lx + (lx < 540 ? -spread : spread), ly, len, wid, ang, col, { t, tape: p > 0.8 });
  }
  K.flower(ctx, 540, 960, 110 * p, P.petalGold, P.ink, { t, n: 8 });
  K.herbariumLabel(ctx, 'OSHIBANA & KOLASE BOTANI', 540, 260, {
    latin: 'Lukisan dari Daun Pres',
    sub: 'merangkai warna alami tanpa setetes cat pun',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 3. Pres: Pressing leaves flat with mounting strips
shot('pres', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.06);
  K.twig(ctx, [[540, 1240], [540, 700]], { width: 12, tape: true });
  for (let k = 0; k < 4; k++) {
    const y = 1120 - k * 110;
    K.leaf(ctx, 540, y, 210, 62, -0.55, k % 2 ? P.leaf : P.leafLt, { t, tape: true });
    K.leaf(ctx, 540, y, 210, 62, -2.59, k % 2 ? P.leafLt : P.leaf, { t, tape: true });
  }
  K.herbariumLabel(ctx, 'PENGERINGAN & PENGEPRESAN', 540, 260, {
    latin: 'Bebas Kelembapan Air',
    sub: 'ditekan di antara kertas penyerap agar warna dan bentuk awet',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 4. Kupu: Leaf-and-petal butterflies fluttering across the herbarium page
shot('kupu', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, lerp(1.0, 1.1, p));
  K.leafCreature(ctx, 'kupu', { x: 540, y: 980, s: 1.55, t, flap: 1.0 });
  K.flower(ctx, 260, 1180, 75, P.petalPink, P.cream, { t, n: 5 });
  K.flower(ctx, 820, 1180, 75, P.petalRed, P.cream, { t, n: 5 });
  K.herbariumLabel(ctx, 'KUPU-KUPU DAUN KERING', 540, 260, {
    latin: 'Sayap Kelopak & Tubuh Ranting',
    sub: 'empat helai daun yang bertransformasi menjadi sayap indah',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 5. Burung: Songbird assembled from autumn leaves perched on a twig
shot('burung', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.08);
  K.twig(ctx, [[160, 1140], [520, 1090], [920, 1040]], { width: 16, tape: true });
  K.leaf(ctx, 280, 1110, 160, 52, -0.7, P.leaf, { t });
  K.leaf(ctx, 780, 1060, 160, 52, -0.4, P.leafLt, { t });
  K.leafCreature(ctx, 'burung', { x: 520, y: 960, s: 1.45, t, flap: 1.0 });
  K.herbariumLabel(ctx, 'BURUNG KICAU DARI DAUN', 540, 260, {
    latin: 'Kolase Fauna Botani',
    sub: 'bulu ekor daun sempit, paruh duri, dan mata biji kering',
    size: 46,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 6. Bogor: Herbarium Bogoriense (1841) scientific specimen sheet
shot('bogor', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, 1.02);
  K.twig(ctx, [[540, 1260], [500, 980], [560, 720]], { width: 12, tape: true });
  K.leaf(ctx, 515, 1060, 220, 68, -0.5, P.leafDk, { t, tape: true });
  K.leaf(ctx, 525, 940, 210, 64, -2.6, P.leaf, { t, tape: true });
  K.flower(ctx, 560, 720, 88, P.petalRed, P.petalGold, { t, n: 5 });
  K.herbariumLabel(ctx, 'HERBARIUM BOGORIENSE · 1841', 540, 260, {
    latin: '950.000+ Spesimen Tumbuhan',
    sub: 'pusat rujukan botani tropis terbesar di Asia Tenggara',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 7. Iklim: Reading stomata & climate history from 200-year-old dried leaves
shot('iklim', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, lerp(1.04, 1.2, p));
  K.leaf(ctx, 240, 980, 580, 195, -0.05, P.leafGold, { t, veins: true, tape: true });
  K.herbariumLabel(ctx, 'MESIN WAKTU PERUBAHAN IKLIM', 540, 260, {
    latin: 'Catatan Stomata & Karbon',
    sub: 'daun berusia dua abad merekam kadar udara masa silam',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 8. Moral: Grand collage combining bird, butterfly, flowers, and leaves
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.bg(ctx, t);
  K.cam(ctx, 540, 960, lerp(1.06, 0.95, p));
  K.twig(ctx, [[140, 1180], [540, 1110], [940, 1060]], { width: 16, tape: true });
  K.leafCreature(ctx, 'burung', { x: 380, y: 980, s: 1.15, t, flap: 0.8 });
  K.leafCreature(ctx, 'kupu', { x: 740, y: 800, s: 1.05, t, flap: 1.0 });
  K.flower(ctx, 740, 1080, 85, P.petalRed, P.cream, { t, n: 6 });
  K.herbariumLabel(ctx, 'MEMORI HUTAN TROPIS', 540, 260, {
    latin: 'Seni & Sains Botani',
    sub: 'menjaga keindahan setiap helai daun bumi kita',
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

