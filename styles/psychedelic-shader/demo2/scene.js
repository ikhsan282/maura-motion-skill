// Psychedelic Shader — Demo 2: "Pantai yang Panjangnya Tak Terhingga — Paradoks Garis Pantai & Dimensi Fraktal"
import * as K from '/styles/psychedelic-shader/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;

export const meta = {
  fps: 24,
  captions: { preset: 'neon', y: 1490, size: 58, maxWords: 4 },
};

let ctx, fx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('whoosh', 0.1, { gain: 0.4 });
  AM.sfx('pop', C.penggaris.start + 0.15, { gain: 0.4 });
  AM.sfx('riser', C.kerikil.start + 0.15, { gain: 0.35 });
  AM.sfx('chime', C.koch.start + 0.2, { gain: 0.45 });
  AM.sfx('chime', C.dimensi.start + 0.2, { gain: 0.4 });
  AM.sfx('swoosh_up', C.paru.start + 0.15, { gain: 0.4 });
  AM.sfx('pop', C.tenis.start + 0.2, { gain: 0.4 });
  AM.sfx('boom', C.akhir.start + 0.2, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start, L[i + 1] ? C[L[i + 1].id].start : AM.duration];
};

// Draw recursive fractal bronchial lung tree in neon shader style
function drawFractalTree(g, x, y, len, ang, depth, t) {
  if (depth <= 0) return;
  const x2 = x + Math.cos(ang) * len;
  const y2 = y + Math.sin(ang) * len;
  const [cr, cg, cb] = K.iqColor(depth * 0.14, t * 0.2);
  g.strokeStyle = `rgb(${cr},${cg},${cb})`;
  g.lineWidth = Math.max(1.5, depth * 2.2);
  g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
  const spread = 0.48 + Math.sin(t * 1.8 + depth) * 0.04;
  drawFractalTree(g, x2, y2, len * 0.72, ang - spread, depth - 1, t);
  drawFractalTree(g, x2, y2, len * 0.72, ang + spread, depth - 1, t);
}

// 1. Hook: The Coastline Paradox ("Berapa Panjang Garis Pantai?")
shot('hook', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'PARADOKS GARIS PANTAI',
    subTxt: 'MENGAPA PANJANG PANTAI BISA MENUJU TAK TERHINGGA?',
    tag: 'MATH // COASTLINE_PARADOX',
  });

  K.drawKochSnowflake(ctx, 540, 675, 310, 3, t, { col: K.PAL.neon2 });
  K.drawKochSnowflake(ctx, 540, 675, 195, 2, -t * 0.8, { col: K.PAL.neon1 });

  K.hudCard(ctx, 540, 1210, 860, 150, 'PERTANYAAN SEPELE YANG MENJEBAK', 'Hasil Ukurnya Bergantung Sepenuhnya pada Ukuran Penggarismu!', {
    col: K.PAL.neon2,
    p: clamp(lt / 0.35),
  });
});

// 2. Measuring with 100 km vs 10 km rulers (Richardson Effect)
shot('penggaris', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'EFEK PENGGARIS RICHARDSON',
    subTxt: 'PENGGARIS 100 KM VS PENGGARIS 10 KM',
    tag: 'GEO // RULER_SCALE',
  });

  // Top: Coarse 1-step polygon (short perimeter) vs Bottom: Fine 3-step fractal coast (long perimeter)
  K.drawKochSnowflake(ctx, 310, 660, 210, 0, t * 0.3, { col: K.PAL.neon3 });
  K.drawKochSnowflake(ctx, 770, 660, 210, 3, t * 0.3, { col: K.PAL.neon1 });

  ctx.save();
  ctx.font = "800 32px 'Orbitron', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillStyle = K.PAL.neon3;
  ctx.fillText('SKALA 100 KM', 310, 935);
  ctx.fillText('2.800 KM', 310, 980);
  ctx.fillStyle = K.PAL.neon1;
  ctx.fillText('SKALA 1 KM', 770, 935);
  ctx.fillText('17.820 KM!', 770, 980);
  ctx.restore();

  K.hudCard(ctx, 540, 1210, 860, 150, 'MAKIN PENDEK PENGGARISNYA...', 'Makin Banyak Teluk & Tanjung Kecil yang Ikut Terhitung!', {
    col: K.PAL.neon1,
    p: clamp(lt / 0.35),
  });
});

// 3. Pebble & Molecular Scale -> Length approaches Infinity!
shot('kerikil', (t, a, b) => {
  const lt = t - a;
  const u = clamp(lt / Math.max(0.5, b - a));
  K.shaderStage(ctx, t, {
    titleTxt: 'SKALA KERIKIL & MOLEKUL',
    subTxt: 'PANJANG GARIS PANTAI MENUJU TAK TERHINGGA (∞)',
    tag: 'LIMIT // L_TO_INFINITY',
  });

  const depth = Math.min(4, Math.floor(u * 5));
  K.drawKochSnowflake(ctx, 540, 665, 325, depth, t * 0.5, { col: K.PAL.gold });

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = "800 72px 'Orbitron', sans-serif";
  ctx.textAlign = 'center';
  ctx.shadowColor = K.PAL.gold; ctx.shadowBlur = 24;
  ctx.fillText(`L × (4/3)ⁿ ➔ ∞`, 540, 675);
  ctx.restore();

  K.hudCard(ctx, 540, 1210, 860, 150, 'SETIAP TAHAP PANJANGNYA NAIK 33%', 'Pada Skala Tak Terbatas, Panjangnya Menjadi Tak Terhingga', {
    col: K.PAL.gold,
    p: clamp(lt / 0.35),
  });
});

// 4. Helge von Koch's Snowflake (1904): Infinite Perimeter inside Finite Area
shot('koch', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'KEPINGAN SALJU KOCH (1904)',
    subTxt: 'KELILING TAK TERHINGGA DI DALAM LUAS TERBATAS!',
    tag: 'MATH // KOCH_SNOWFLAKE',
  });

  // Concentric multi-depth Koch snowflakes rotating in opposite directions
  for (let i = 4; i >= 1; i--) {
    const col = [K.PAL.neon1, K.PAL.neon2, K.PAL.neon3, K.PAL.gold][i - 1];
    K.drawKochSnowflake(ctx, 540, 670, 85 * i, i, t * (i % 2 ? 0.3 : -0.3), { col });
  }

  K.hudCard(ctx, 540, 1210, 860, 150, 'PARADOKS RUANG FRAKTAL', 'Luasnya Tidak Pernah Meluber, Tapi Garis Tepinya Tak Berujung', {
    col: K.PAL.neon2,
    p: clamp(lt / 0.35),
  });
});

// 5. Fractional Hausdorff Dimension (D = 1.25 for Britain's Coast, D = 1.2618 for Koch)
shot('dimensi', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'DIMENSI PECAHAN (HAUSDORFF)',
    subTxt: 'ANTARA GARIS 1D DAN BIDANG 2D: D = 1,25!',
    tag: 'MATH // FRACTAL_DIMENSION',
  });

  // Visual comparison: 1.0D Line, 1.25D Fractal Coast, 2.0D Plane
  const cards = [
    { x: 220, d: 'D = 1,00', name: 'GARIS LURUS', col: K.PAL.neon3 },
    { x: 540, d: 'D = 1,25', name: 'PANTAI INGGRIS', col: K.PAL.neon1 },
    { x: 860, d: 'D = 2,00', name: 'BIDANG DATAR', col: K.PAL.neon2 },
  ];
  cards.forEach((c, i) => {
    const p = clamp((lt - i * 0.18) / 0.35);
    K.hudCard(ctx, c.x, 670, 285, 360, c.d, c.name, { col: c.col, p });
  });

  K.hudCard(ctx, 540, 1210, 860, 150, 'MAKALAH SCIENCE MANDELBROT (1967)', 'Makin Kasar & Berliku Suatu Pantai, Makin Tinggi Dimensi Fraktalnya', {
    col: K.PAL.neon1,
    p: clamp(lt / 0.35),
  });
});

// 6. Fractal Biology: 23 Generations of Bronchial Lung Branching
shot('paru', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'FRAKTAL DI DALAM PARU-PARUMU',
    subTxt: 'BRONKUS BERCABANG 23 KALI SECARA REKURSIF',
    tag: 'BIO // BRONCHIAL_TREE',
    tunnel: false,
  });

  ctx.save();
  ctx.shadowColor = K.PAL.neon2; ctx.shadowBlur = 14;
  // Inverted bronchial tree branching downward into left and right lungs
  ctx.strokeStyle = K.PAL.neon2; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.moveTo(540, 340); ctx.lineTo(540, 480); ctx.stroke();
  const maxD = Math.min(7, Math.floor(lt * 3) + 3);
  drawFractalTree(ctx, 540, 480, 125, Math.PI * 0.32, maxD, t);
  drawFractalTree(ctx, 540, 480, 125, Math.PI * 0.68, maxD, t);
  ctx.restore();

  K.hudCard(ctx, 540, 1210, 860, 150, '2²³ = 8,3 JUTA CABANG ALVEOLI', 'Geometri Fraktal Memaksimalkan Penyerapan Oksigen', {
    col: K.PAL.neon3,
    p: clamp(lt / 0.35),
  });
});

// 7. 70 m² Tennis Court Surface Area folded inside the human chest!
shot('tenis', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'LUAS 70 M² DI DALAM DADA',
    subTxt: 'SETARA SATU LAPANGAN TENIS PENUH!',
    tag: 'BIO // SURFACE_PACKING',
  });

  // Glowing neon wireframe tennis court inside the shader circle
  ctx.save();
  ctx.translate(540, 670);
  ctx.rotate(-0.18 + Math.sin(t * 1.2) * 0.05);
  ctx.fillStyle = 'rgba(39,245,255,0.12)';
  ctx.strokeStyle = K.PAL.neon3;
  ctx.lineWidth = 5;
  ctx.shadowColor = K.PAL.neon3; ctx.shadowBlur = 22;
  ctx.strokeRect(-330, -175, 660, 350);
  ctx.fillRect(-330, -175, 660, 350);
  // Singles sidelines, service lines & net
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-330, -130); ctx.lineTo(330, -130);
  ctx.moveTo(-330, 130); ctx.lineTo(330, 130);
  ctx.moveTo(-180, -130); ctx.lineTo(-180, 130);
  ctx.moveTo(180, -130); ctx.lineTo(180, 130);
  ctx.moveTo(-180, 0); ctx.lineTo(180, 0);
  ctx.stroke();
  ctx.strokeStyle = K.PAL.neon1; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(0, -195); ctx.lineTo(0, 195); ctx.stroke();
  ctx.restore();

  K.hudCard(ctx, 540, 1210, 860, 150, '70 METER PERSEGI LUAS PERMUKAAN', 'Dilipat Rapi ke Dalam Volume Paru-Paru yang Hanya 5 Liter', {
    col: K.PAL.neon2,
    p: clamp(lt / 0.35),
  });
});

// 8. Finale: Nature packs infinity into finite space
shot('akhir', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'ARSITEKTUR RAHASIA ALAM',
    subTxt: 'MEMUAT KETAKTERHINGGAAN DI DALAM RUANG TERBATAS',
    tag: 'GLSL // FRACTAL_NATURE',
  });

  K.drawKaleidoscope(ctx, 540, 675, 350, t, { folds: 6, layers: 5 });
  K.drawKochSnowflake(ctx, 540, 675, 240, 3, t * 0.4, { col: K.PAL.neon2 });

  K.hudCard(ctx, 540, 1210, 860, 155, 'PANTAI · PETIR · POHON · PARU-PARU', 'Bahasa Geometri yang Dipakai Alam Semesta Setiap Hari', {
    col: K.PAL.neon1,
    p: clamp(lt / 0.35),
  });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  AM.lib.vignette(fx, 0.35);
}

