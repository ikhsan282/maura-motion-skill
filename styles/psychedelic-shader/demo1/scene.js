// Psychedelic Shader — Demo 1: "Satu Rumus, Gambar Tanpa Akhir — Himpunan Mandelbrot"
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
  AM.sfx('chime', C.rumus.start + 0.15, { gain: 0.4 });
  AM.sfx('pop', C.ibm.start + 0.2, { gain: 0.35 });
  AM.sfx('swoosh_up', C.himpunan.start + 0.15, { gain: 0.4 });
  AM.sfx('chime', C.warna.start + 0.2, { gain: 0.45 });
  AM.sfx('riser', C.zoom.start + 0.15, { gain: 0.35 });
  AM.sfx('chime', C.turn.start + 0.2, { gain: 0.45 });
  AM.sfx('boom', C.akhir.start + 0.2, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start, L[i + 1] ? C[L[i + 1].id].start : AM.duration];
};

// 1. Hook: Glowing equation Z = Z² + C above a live pulsing Mandelbrot shader
shot('hook', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'SATU RUMUS · GAMBAR TANPA AKHIR',
    subTxt: 'KEAJAIBAN MATEMATIKA HIMPUNAN MANDELBROT',
    tag: 'GLSL // MANDELBROT_SET.FRAG',
  });

  K.drawFractalViewport(ctx, 540, 680, 340, t, {
    mode: 'mandelbrot',
    cx: -0.6,
    cy: 0.0,
    zoom: 1.05 + Math.sin(t * 0.8) * 0.08,
    maxIter: 34,
  });

  K.hudCard(ctx, 540, 1210, 860, 155, 'zₙ₊₁ = zₙ² + c', 'Alam Semesta Visual yang Tak Pernah Habis Di-Zoom', {
    col: K.PAL.neon1,
    p: clamp(lt / 0.35),
  });
});

// 2. Complex Plane Iteration: tracing bounded vs escaping orbits of z -> z^2 + c
shot('rumus', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'ITERASI BILANGAN KOMPLEKS',
    subTxt: 'KUADRATKAN NILAINYA · TAMBAHKAN C · ULANGI TERUS',
    tag: 'MATH // ORBIT_ITERATION',
    tunnel: false,
  });

  // Complex plane grid
  ctx.save();
  ctx.translate(540, 670);
  const R = 350;
  ctx.fillStyle = 'rgba(11,0,34,0.85)';
  ctx.strokeStyle = K.PAL.neon2;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.stroke();

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-R, 0); ctx.lineTo(R, 0);
  ctx.moveTo(0, -R); ctx.lineTo(0, R);
  ctx.stroke();

  // Trace a spiral bounded orbit in neon green
  ctx.strokeStyle = K.PAL.neon3;
  ctx.lineWidth = 4.5;
  ctx.shadowColor = K.PAL.neon3; ctx.shadowBlur = 14;
  let zr = 0, zi = 0;
  const cr = -0.12, ci = 0.74; // Rabbit Douady region
  ctx.beginPath();
  ctx.moveTo(0, 0);
  const steps = Math.min(18, Math.floor(lt * 5) + 3);
  for (let i = 0; i < steps; i++) {
    const nzr = zr * zr - zi * zi + cr;
    const nzi = 2 * zr * zi + ci;
    zr = nzr; zi = nzi;
    ctx.lineTo(zr * 240, -zi * 240);
  }
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(zr * 240, -zi * 240, 10, 0, TAU); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  K.hudCard(ctx, 540, 1210, 860, 150, 'z₀ ➔ z₁ ➔ z₂ ➔ z₃ ➔ ...', 'Setiap Titik Diuji: Terperangkap atau Kabur ke Tak Hingga?', {
    col: K.PAL.neon3,
    p: clamp(lt / 0.35),
  });
});

// 3. March 1, 1980: Benoit Mandelbrot at IBM Thomas J. Watson Research Center
shot('ibm', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: '1 MARET 1980 · LABORATORIUM IBM',
    subTxt: 'BENOIT MANDELBROT MENCETAK PETA FRAKTAL PERTAMA',
    tag: 'HIST // IBM_WATSON_1980',
  });

  // Retro green/amber ASCII dot-matrix Mandelbrot printout transforming into neon shader
  ctx.save();
  ctx.translate(540, 670);
  ctx.fillStyle = 'rgba(8,0,24,0.92)';
  ctx.strokeStyle = K.PAL.neon3;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(-390, -310, 780, 620, 22); ctx.fill(); ctx.stroke();

  ctx.fillStyle = K.PAL.neon3;
  ctx.font = "700 24px 'Space Mono', monospace";
  ctx.textAlign = 'center';
  for (let gy = -10; gy <= 10; gy++) {
    let row = '';
    const im = gy * 0.11;
    for (let gx = -21; gx <= 12; gx++) {
      const re = gx * 0.08 - 0.15;
      let zr = 0, zi = 0, it = 0;
      while (zr * zr + zi * zi <= 4 && it < 16) {
        const tmp = zr * zr - zi * zi + re;
        zi = 2 * zr * zi + im;
        zr = tmp;
        it++;
      }
      row += it === 16 ? '*' : it > 7 ? '.' : ' ';
    }
    ctx.fillText(row, 0, gy * 25);
  }
  ctx.restore();

  K.hudCard(ctx, 540, 1210, 860, 150, 'BENOIT MANDELBROT (1924–2010)', 'Bapak Geometri Fraktal · IBM Research New York', {
    col: K.PAL.neon2,
    p: clamp(lt / 0.35),
  });
});

// 4. The Mandelbrot Cardioid & Period-2 Bulb ("Siluet Hitam Misterius")
shot('himpunan', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'HIMPUNAN MANDELBROT',
    subTxt: 'TITIK-TITIK YANG TIDAK PERNAH KABUR KE TAK HINGGA',
    tag: 'MATH // BOUNDED_SET',
  });

  K.drawFractalViewport(ctx, 540, 675, 355, t, {
    mode: 'mandelbrot',
    cx: -0.65,
    cy: 0.0,
    zoom: 1.0,
    maxIter: 38,
    hueShift: 0.2,
  });

  K.hudCard(ctx, 540, 1210, 860, 150, 'INTI HITAM = TERPERANGKAP ABADI', 'Luar Berwarna = Kecepatan Kabur Menuju Tak Terhingga', {
    col: K.PAL.neon1,
    p: clamp(lt / 0.35),
  });
});

// 5. Escape-Time Coloring & Julia Set Spirals ("Pusaran Kuda Laut & Spiral Pelangi")
shot('warna', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'LEMBANG KUDA LAUT & SPIRAL JULIA',
    subTxt: 'PEWARNAAN KECEPATAN KABUR (ESCAPE-TIME COLORING)',
    tag: 'GLSL // JULIA_MORPH.FRAG',
  });

  const a0 = t * 0.45;
  K.drawFractalViewport(ctx, 540, 675, 355, t, {
    mode: 'julia',
    juliaRe: -0.7269 + Math.cos(a0) * 0.018,
    juliaIm: 0.1889 + Math.sin(a0) * 0.018,
    zoom: 1.15,
    maxIter: 40,
    hueShift: t * 0.15,
  });

  K.hudCard(ctx, 540, 1210, 860, 150, 'PERBATASAN PALING RUMIT DI MATEMATIKA', 'Dimensi Fraktal Tepi Mandelbrot = 2,0 (Penuh Cabang!)', {
    col: K.PAL.gold,
    p: clamp(lt / 0.35),
  });
});

// 6. Continuous Zoom into Seahorse Valley (1,000x -> 1,000,000x)
shot('zoom', (t, a, b) => {
  const lt = t - a;
  const u = clamp(lt / Math.max(0.5, b - a));
  const zm = Math.pow(320, u);
  K.shaderStage(ctx, t, {
    titleTxt: `DEEP ZOOM: ${(zm * 1000).toFixed(0)}×`,
    subTxt: 'SEAHORSE VALLEY · (−0.743643, +0.131825i)',
    tag: 'GLSL // DEEP_ZOOM',
  });

  K.drawFractalViewport(ctx, 540, 675, 355, t, {
    mode: 'mandelbrot',
    cx: -0.7436438870371587,
    cy: 0.13182590420531197,
    zoom: zm,
    maxIter: 44,
    hueShift: u * 0.8,
  });

  K.hudCard(ctx, 540, 1210, 860, 150, 'TIDAK PERNAH MENJADI GARIS LURUS', 'Makin Diperbesar, Makin Banyak Galaksi & Cabang Petir Baru', {
    col: K.PAL.neon2,
    p: clamp(lt / 0.35),
  });
});

// 7. Self-Similarity: A tiny complete Mini-Mandelbrot ("Minibrot") appears deep inside!
shot('turn', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'SELF-SIMILARITY (KEMIRIPAN DIRI)',
    subTxt: 'PULAU MANDELBROT MINI MUNCUL KEMBALI DI KEDALAMAN!',
    tag: 'MATH // MINIBROT_ISLAND',
  });

  // Feigenbaum point / Minibrot at cx = -1.754877666, cy = 0
  K.drawFractalViewport(ctx, 540, 675, 355, t, {
    mode: 'mandelbrot',
    cx: -1.758,
    cy: 0.0,
    zoom: 28 + Math.sin(t * 1.2) * 4,
    maxIter: 44,
    hueShift: 0.45,
  });

  K.hudCard(ctx, 540, 1210, 860, 150, 'BENTUK AWALNYA MUNCUL LAGI!', 'Tak Terhingga Pulau Mandelbrot Kecil Tersembunyi di Dalamnya', {
    col: K.PAL.neon1,
    p: clamp(lt / 0.35),
  });
});

// 8. Finale: Infinite complexity from one short line of math
shot('akhir', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'GEOMETRI FRAKTAL ALAM SEMESTA',
    subTxt: 'KERUMITAN TANPA BATAS DARI SATU ATURAN SEDERHANA',
    tag: 'GLSL // INFINITY.FRAG',
  });

  K.drawKaleidoscope(ctx, 540, 675, 360, t, { folds: 12, layers: 6 });
  K.drawFractalViewport(ctx, 540, 675, 220, t, {
    mode: 'mandelbrot',
    cx: -0.65,
    cy: 0.0,
    zoom: 1.1,
    maxIter: 34,
  });

  K.hudCard(ctx, 540, 1210, 860, 155, 'z = z² + c · TANPA AKHIR', 'Satu Baris Rumus yang Menyimpan Keindahan Tak Terbatas', {
    col: K.PAL.neon3,
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
