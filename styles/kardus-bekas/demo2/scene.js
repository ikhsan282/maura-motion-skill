// Kardus Bekas demo2: "Rahasia Kekuatan Kardus Bergelombang — Kenapa Kertas Tipis Sanggup Menahan Beban Berat?"
import * as K from '/styles/kardus-bekas/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 2, captions: { preset: 'bold', y: 1520, size: 54, maxWords: 4 } };

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('paper', 0.08, { gain: 0.5 });
  AM.sfx('drum_hit', C.hook.start + 0.3, { gain: 0.45 });
  AM.sfx('pop', C.sejarah.start + 0.3, { gain: 0.4 });
  AM.sfx('paper', C.struktur.start + 0.25, { gain: 0.45 });
  AM.sfx('boing', C.lengkung.start + 0.3, { gain: 0.4 });
  AM.sfx('whoosh', C.udara.start + 0.3, { gain: 0.38 });
  AM.sfx('drum_hit', C.jenis.start + 0.3, { gain: 0.45, pitch: 0.85 });
  AM.sfx('ding', C.bencana.start + 0.3, { gain: 0.4 });
  AM.sfx('chime', C.moral.start + 0.35, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// 1. Hook: Stacked boxes holding heavy weight without collapsing
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(0.96, 1.06, p), 540, 960);
  K.shippingBox(ctx, 540, 1180, 1.35, { open: 0, stamp: '50 KG', mood: 'happy', t });
  K.shippingBox(ctx, 540, 880, 1.15, { open: 0, stamp: 'KOKOH', mood: 'happy', t: t + 0.4 });
  K.cardLabel(ctx, 'RAHASIA KEKUATAN KARDUS', 540, 270, {
    tag: 'REKAYASA KERTAS BERGELOMBANG',
    sub: 'tipis dan ringan namun sanggup menahan beban berat',
    alpha: env(t, a + 0.1, b, 0.3, 0.25),
  });
});

// 2. Sejarah: 1871 British patent — tall top-hat sweatband liner
shot('sejarah', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.04, 540, 960);
  K.cardPanel(ctx, 540, 1000, 680, 520, { col: P.kraftPale, tapeTop: true, seed: 4 });
  // Cardboard cutout of a Victorian tall top hat with corrugated inner band
  ctx.save();
  ctx.translate(540, 1040);
  K.cardPanel(ctx, 0, -90, 260, 240, { col: P.kraftDk, fluteBottom: false });
  K.cardPanel(ctx, 0, 35, 420, 42, { col: P.kraftDk, fluteBottom: true });
  K.fluteCrossSection(ctx, 0, -10, 250, 48, { t });
  ctx.restore();
  K.cardLabel(ctx, 'PATEN INGGRIS · 1871', 540, 270, {
    tag: 'AWALNYA PELAPIS TOPI TINGGI',
    sub: 'kertas berlipat agar topi tetap tegak dan nyaman',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 3. Struktur: Exploded 3-layer sandwich coming together
shot('struktur', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.05, 540, 960);
  const gap = lerp(190, 88, p);
  K.cardPanel(ctx, 540, 980 - gap, 780, 34, { col: P.kraft, fluteBottom: false });
  K.fluteCrossSection(ctx, 540, 980, 780, 160, { t });
  K.cardPanel(ctx, 540, 980 + gap, 780, 34, { col: P.kraft, fluteBottom: false });
  K.cardLabel(ctx, 'SANDWICH TIGA LAPIS', 540, 270, {
    tag: 'DUA LINERBOARD & SATU FLUTE',
    sub: 'perpaduan tarik datar dan kekuatan lengkung tengah',
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 4. Lengkung: Roman arch bridge comparison under vertical load arrows
shot('lengkung', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.08, 540, 960);
  const load = 0.35 + 0.35 * Math.sin(t * 4.5);
  K.fluteCrossSection(ctx, 540, 1000, 820, 250, { t, load, arrows: true });
  K.cardLabel(ctx, 'PRINSIP BUSUR JEMBATAN', 540, 270, {
    tag: 'DISTRIBUSI GAYA TEKAN',
    sub: 'lengkungan menyebarkan beban vertikal ke dua kaki tumpuan',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 5. Udara: Trapped air pockets inside flutes acting as shock & thermal cushions
shot('udara', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.1, 540, 960);
  K.fluteCrossSection(ctx, 540, 980, 820, 240, { t });
  // Glowing blue air-pocket circles inside the flute cavities
  ctx.save();
  ctx.fillStyle = P.crayonBlue;
  ctx.globalAlpha = 0.65;
  for (let i = -3; i <= 3; i++) {
    const r = 24 + Math.sin(t * 4 + i) * 4;
    ctx.beginPath();
    ctx.arc(540 + i * 116, 980 + (i % 2 === 0 ? 22 : -22), r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  K.cardLabel(ctx, 'BANTALAN KANTUNG UDARA', 540, 270, {
    tag: 'ISOLATOR & PEREDAM KEJUT',
    sub: 'udara yang terjebak melindungi barang dari benturan',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 6. Jenis: Double-wall and Triple-wall heavy-duty corrugated board
shot('jenis', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  K.cuttingMat(ctx, t);
  K.cam(ctx, 1.0, 540, 960);
  K.fluteCrossSection(ctx, 540, 810, 780, 130, { t });
  if (p > 0.2) K.fluteCrossSection(ctx, 540, 960, 780, 150, { t });
  if (p > 0.5) K.fluteCrossSection(ctx, 540, 1120, 780, 170, { t, arrows: true });
  K.cardLabel(ctx, 'TRIPLE-WALL KELAS BERAT', 540, 270, {
    tag: 'TIGA LAPIS GELOMBANG BERTUMPUK',
    sub: 'mampu menggantikan peti kayu untuk mesin industri',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 7. Bencana: Shigeru Ban's cardboard tube cathedral / emergency shelter architecture
shot('bencana', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(0.98, 1.06, p), 540, 960);
  // A-frame cardboard tube pavilion (Shigeru Ban Paper Cathedral style)
  ctx.save();
  ctx.translate(540, 1140);
  for (let i = -5; i <= 5; i++) {
    const h = 420 - Math.abs(i) * 52;
    K.cardPanel(ctx, i * 64, -h / 2, 42, h, { col: i % 2 === 0 ? P.kraftLt : P.kraft, fluteBottom: true });
  }
  K.maskingTape(ctx, 0, -420, 180, 32, 0);
  ctx.restore();
  K.cardLabel(ctx, 'ARSITEKTUR TABUNG KARDUS', 540, 270, {
    tag: 'KARYA SHIGERU BAN · PRITZKER PRIZE',
    sub: 'hunian darurat bencana dan katedral dari tabung kertas',
    size: 44,
    alpha: env(t, a + 0.15, b, 0.3, 0.25),
  });
});

// 8. Moral: Shape over raw thickness
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  K.cuttingMat(ctx, t);
  K.cam(ctx, lerp(1.06, 0.96, p), 540, 960);
  K.fluteCrossSection(ctx, 540, 1140, 820, 180, { t, arrows: true });
  K.shippingBox(ctx, 540, 840, 1.25, { open: 0.25, stamp: 'CERDAS', mood: 'happy', t });
  K.cardLabel(ctx, 'KEKUATAN DARI GEOMETRI', 540, 270, {
    tag: 'FILOSOFI REKAYASA KARDUS',
    sub: 'bukan soal seberapa tebal bahanmu, tapi seberapa cerdas bentuknya',
    size: 44,
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

