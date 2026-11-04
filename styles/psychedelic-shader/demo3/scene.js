// Psychedelic Shader — Demo 3: "Rumus di Balik Belang Zebra & Gelombang Kimia — Pola Turing & Reaksi Belousov"
import * as K from '/styles/psychedelic-shader/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;
import { makeCanvas } from '/engine/lib/draw.js';

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
  AM.sfx('chime', C.turing.start + 0.15, { gain: 0.4 });
  AM.sfx('pop', C.aktivator.start + 0.2, { gain: 0.4 });
  AM.sfx('swoosh_up', C.belousov.start + 0.15, { gain: 0.4 });
  AM.sfx('glitch', C.ditolak.start + 0.2, { gain: 0.35 });
  AM.sfx('riser', C.simulasi.start + 0.15, { gain: 0.35 });
  AM.sfx('chime', C.alam.start + 0.2, { gain: 0.4 });
  AM.sfx('boom', C.akhir.start + 0.2, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start, L[i + 1] ? C[L[i + 1].id].start : AM.duration];
};

const _rdCv = makeCanvas(200, 200);
const _rdCtx = _rdCv.getContext('2d');
const _rdImg = _rdCtx.createImageData(200, 200);

// Real-time procedural Reaction-Diffusion / Belousov-Zhabotinsky shader buffer
function drawReactionShader(ctx, x, y, r = 350, t = 0, { mode = 'turing', freq = 10 } = {}) {
  const N = 200, data = _rdImg.data;
  for (let py = 0; py < N; py++) {
    const uy = (py / N - 0.5) * 2;
    for (let px = 0; px < N; px++) {
      const ux = (px / N - 0.5) * 2;
      let v = 0;
      if (mode === 'bz') {
        // Multi-core Belousov-Zhabotinsky chemical spiral waves
        const d1 = Math.hypot(ux + 0.35, uy + 0.15), a1 = Math.atan2(uy + 0.15, ux + 0.35);
        const d2 = Math.hypot(ux - 0.38, uy - 0.2), a2 = Math.atan2(uy - 0.2, ux - 0.38);
        const w1 = Math.sin(d1 * 24 + a1 * 2 - t * 4.5);
        const w2 = Math.sin(d2 * 24 - a2 * 2 - t * 4.5);
        v = 0.5 + 0.5 * Math.sin((w1 + w2) * 1.8);
      } else if (mode === 'spots') {
        // Leopard / Pufferfish hexagonal Turing spots
        const k = freq;
        const s1 = Math.cos(ux * k + Math.sin(uy * 4 + t));
        const s2 = Math.cos((ux * 0.5 - uy * 0.866) * k + Math.sin(ux * 4 - t));
        const s3 = Math.cos((ux * 0.5 + uy * 0.866) * k + Math.cos((ux + uy) * 3 + t));
        v = clamp((s1 + s2 + s3 + 1.5) / 4.5);
      } else {
        // Zebra / Coral labyrinth Turing reaction-diffusion waves
        const warp = Math.sin(ux * 4.5 + t * 0.8) * Math.cos(uy * 4.5 - t * 0.6);
        const wave = Math.sin(ux * freq + warp * 2.8 + Math.sin(uy * (freq * 0.7) + t));
        v = 0.5 + 0.5 * wave;
      }

      const idx = (py * N + px) * 4;
      const [cr, cg, cb] = K.iqColor(v * 0.75, t * 0.15 + (mode === 'bz' ? 0.35 : 0));
      data[idx] = cr;
      data[idx + 1] = cg;
      data[idx + 2] = cb;
      data[idx + 3] = 255;
    }
  }
  _rdCtx.putImageData(_rdImg, 0, 0);

  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = K.PAL.neon2;
  ctx.shadowBlur = 38;
  ctx.strokeStyle = K.PAL.neon1;
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, TAU); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
  ctx.drawImage(_rdCv, -r, -r, r * 2, r * 2);
  ctx.restore();
}

// 1. Hook: Zebra stripes & Alan Turing's secret biological equation
shot('hook', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'RUMUS DI BALIK BELANG ZEBRA',
    subTxt: 'BAGAIMANA SEL KULIT MENGGAMBAR POLA TANPA PENGGARIS?',
    tag: 'GLSL // TURING_PATTERN.FRAG',
  });

  drawReactionShader(ctx, 540, 675, 350, t, { mode: 'turing', freq: 11 });

  K.hudCard(ctx, 540, 1210, 860, 150, 'DITEMUKAN OLEH ALAN TURING', 'Bapak Komputer yang Juga Memecahkan Kode Pola Alam', {
    col: K.PAL.neon2,
    p: clamp(lt / 0.35),
  });
});

// 2. 1952 Paper: "The Chemical Basis of Morphogenesis" (Reaction-Diffusion PDE)
shot('turing', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'MORFOGENESIS ALAN TURING (1952)',
    subTxt: 'PERSAMAAN DIFERENSIAL REAKSI-DIFUSI DUA MORFOGEN',
    tag: 'MATH // MORPHOGENESIS_1952',
  });

  drawReactionShader(ctx, 540, 635, 290, t, { mode: 'spots', freq: 12 });

  // Glowing PDE equation banner
  K.hudCard(ctx, 540, 1025, 860, 110, '∂u/∂t = Dᵤ∇²u + f(u, v)', 'Reaksi Kimia Lokal + Difusi Penyebaran Ruang', {
    col: K.PAL.neon3,
    p: clamp(lt / 0.35),
  });
  K.hudCard(ctx, 540, 1210, 860, 140, 'POLA MUNCUL SECARA SPONTAN', 'Dari Cairan Seragam Lahir Bintik, Belang & Labirin', {
    col: K.PAL.neon1,
    p: clamp((lt - 0.2) / 0.35),
  });
});

// 3. Slow Short-Range Activator vs Fast Long-Range Inhibitor ("Aktivator vs Inhibitor")
shot('aktivator', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'AKTIVATOR VS INHIBITOR',
    subTxt: 'TARIAN DUA ZAT DENGAN KECEPATAN DIFUSI BERBEDA',
    tag: 'CHEM // ACTIVATOR_INHIBITOR',
    tunnel: false,
  });

  ctx.save();
  ctx.translate(540, 670);
  // Outer fast-diffusing inhibitor rings (Cyan)
  for (let i = 1; i <= 4; i++) {
    const rad = 140 + i * 52 + ((t * 45) % 52);
    ctx.strokeStyle = K.PAL.neon2;
    ctx.lineWidth = 5;
    ctx.globalAlpha = clamp(1 - rad / 390);
    ctx.beginPath(); ctx.arc(0, 0, rad, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // Inner slow-diffusing activator core (Neon Pink/Magenta)
  ctx.fillStyle = K.PAL.neon1;
  ctx.shadowColor = K.PAL.neon1; ctx.shadowBlur = 35;
  ctx.beginPath(); ctx.arc(0, 0, 110 + Math.sin(t * 4) * 12, 0, TAU); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = "800 28px 'Orbitron', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('AKTIVATOR', 0, -8);
  ctx.font = "600 22px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText('Kuat · Lambat', 0, 24);

  ctx.fillStyle = K.PAL.neon2;
  ctx.font = "800 28px 'Orbitron', sans-serif";
  ctx.fillText('INHIBITOR (MENYEBAR CEPAT)', 0, -295);
  ctx.restore();

  K.hudCard(ctx, 540, 1210, 860, 150, 'PUNCAK WARNA DIKELILINGI PARIT HAMBATAN', 'Perbedaan Kecepatan Sebar Menciptakan Jarak Belang yang Teratur', {
    col: K.PAL.neon2,
    p: clamp(lt / 0.35),
  });
});

// 4. Boris Belousov's Oscillating Chemical Clock & Spiral Waves
shot('belousov', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'REAKSI BELOUSOV-ZHABOTINSKY',
    subTxt: 'CAIRAN KIMIA YANG BERDENYUT & MEMBENTUK SPIRAL SENDIRI!',
    tag: 'CHEM // BZ_OSCILLATOR',
  });

  drawReactionShader(ctx, 540, 675, 355, t, { mode: 'bz' });

  K.hudCard(ctx, 540, 1210, 860, 150, 'JAM KIMIA NON-EKUILIBRIUM', 'Gelombang Spiral Berputar Tanpa Diaduk di Dalam Cawan Petri', {
    col: K.PAL.gold,
    p: clamp(lt / 0.35),
  });
});

// 5. Rejected in 1951 ("Impossible!") -> Proven by Anatol Zhabotinsky in 1961
shot('ditolak', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'DITOLak JURNAL ILMIAH (1951)',
    subTxt: 'DIANGGAP MELANGGAR HUKUM KEDUA TERMODINAMIKA!',
    tag: 'HIST // BELOUSOV_TO_ZHABOTINSKY',
  });

  // Left card: 1951 Rejection vs Right card: 1961 Zhabotinsky Proof
  K.hudCard(ctx, 295, 670, 420, 390, '1951 · BELOUSOV', 'Ditolak Editor: "Reaksi Ini Mustahil Secara Fisika!"', {
    col: K.PAL.neon1,
    p: clamp(lt / 0.35),
  });
  K.hudCard(ctx, 785, 670, 420, 390, '1961 · ZHABOTINSKY', 'Dibuktikan Terbuka & Meraih Penghargaan Tertinggi!', {
    col: K.PAL.neon3,
    p: clamp((lt - 0.2) / 0.35),
  });

  K.hudCard(ctx, 540, 1210, 860, 150, 'MELAHIRKAN SAINS SISTEM KOMPLEKS', 'Ketertiban Bisa Muncul dari Kekacauan Jauh dari Titik Setimbang', {
    col: K.PAL.neon2,
    p: clamp((lt - 0.3) / 0.35),
  });
});

// 6. Gray-Scott Shader Simulation: Coral Labyrinths, Leopard Spots & Psychedelic Waves
shot('simulasi', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'SHADER GRAY-SCOTT MODERN',
    subTxt: 'UBAH PARAMETER FEED (f) & KILL (k) ➔ LAHIR CORAK BARU',
    tag: 'GLSL // GRAY_SCOTT_SIM.FRAG',
  });

  // Side-by-side dual shader viewports: Spots vs Coral Labyrinth
  drawReactionShader(ctx, 300, 670, 215, t, { mode: 'spots', freq: 14 });
  drawReactionShader(ctx, 780, 670, 215, t, { mode: 'turing', freq: 13 });

  ctx.save();
  ctx.font = "800 28px 'Orbitron', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillStyle = K.PAL.neon3;
  ctx.fillText('TOTOL MACAN TUTUL', 300, 945);
  ctx.fillStyle = K.PAL.neon2;
  ctx.fillText('LABIRIN KARANG LAUT', 780, 945);
  ctx.restore();

  K.hudCard(ctx, 540, 1210, 860, 150, 'SATU RUMUS · RATUSAN CORAK HAYATI', 'Hanya dengan Menggeser Dua Angka Laju Reaksi di Shader', {
    col: K.PAL.neon1,
    p: clamp(lt / 0.35),
  });
});

// 7. 2012 Experimental Proof in Developmental Biology (Zebrafish & Mammalian Palate Ridges)
shot('alam', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'BUKTI BIOLOGI MOLEKULER (2012)',
    subTxt: 'GEN FGF (AKTIVATOR) & SHH (INHIBITOR) PADA EMBRIO',
    tag: 'BIO // EXPERIMENTAL_PROOF',
  });

  drawReactionShader(ctx, 540, 675, 350, t, { mode: 'turing', freq: 8 });

  K.hudCard(ctx, 540, 1210, 860, 150, 'TEORI TURING TERBUKTI SETELAH 60 TAHUN!', 'Mengatur Belang Ikan Zebra, Buntal Raksasa & Folikel Bulu', {
    col: K.PAL.neon3,
    p: clamp(lt / 0.35),
  });
});

// 8. Finale: Nature paints itself with the mathematics of reaction and diffusion
shot('akhir', (t, a, b) => {
  const lt = t - a;
  K.shaderStage(ctx, t, {
    titleTxt: 'KANVAS MATEMATIKA ALAM',
    subTxt: 'KETIKA KIMIA & GEOMETRI MELUKIS KEHIDUPAN',
    tag: 'GLSL // MORPHOGENESIS_FINALE',
  });

  K.drawKaleidoscope(ctx, 540, 675, 365, t, { folds: 8, layers: 5 });
  drawReactionShader(ctx, 540, 675, 225, t, { mode: 'bz' });

  K.hudCard(ctx, 540, 1210, 860, 155, 'POLA TURING & GELOMBANG BELOUSOV', 'Bukti Bahwa Alam Semesta Adalah Kanvas Matematika yang Hidup', {
    col: K.PAL.neon2,
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

