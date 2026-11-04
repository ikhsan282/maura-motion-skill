// Dark Glow Product UI — Demo 3: Bagaimana AI Menjawab Pertanyaanmu? (Next-Token Prediction)
import * as K from '/styles/dark-glow-ui/kit.js';
const { clamp, lerp, ease, env } = AM.lib;
const P = K.PAL, R = K.RGB;

export const meta = { fps: 24, hold: 1, captions: { preset: 'neon', y: 1482, size: 52 } };

let world, ui;
const C = {};

export async function setup(AM) {
  world = AM.layer('world');
  ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('click', C.token.start + 0.25, { gain: 0.45 });
  AM.sfx('impact', C.jaringan.start + 0.4, { gain: 0.45 });
  AM.sfx('whoosh', C.peluang.start + 0.3, { gain: 0.35 });
  AM.sfx('tick', C.pilih.start + 0.35, { gain: 0.45 });
  AM.sfx('magic', C.temperatur.start + 0.35, { gain: 0.4 });
  AM.sfx('chime', C.penutup.start + 0.4, { gain: 0.4 });
}

export function render(t) {
  K.stage(world, t, { px: Math.cos(t * 0.22) * 45, py: Math.sin(t * 0.18) * 35, intensity: 1 });
  world.setTransform(1, 0, 0, 1, 0, 0);
  ui.setTransform(1, 0, 0, 1, 0, 0);

  K.micro(ui, 'TRANSFORMER · AUTOREGRESSIVE LLM', 64, 72, { size: 18 });
  const sec = Math.floor(t), fr = Math.floor((t % 1) * 24);
  K.micro(ui, `00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, 1016, 72, { size: 18, align: 'right' });

  // Shot 1: Hook — Streaming word by word
  const a1 = env(t, C.hook.start, C.token.start, 0.25, 0.25);
  if (a1 > 0) {
    world.save();
    world.globalAlpha = a1;
    K.micro(ui, 'RAHASIA MODEL BAHASA BESAR (LLM)', 540, 155, { align: 'center', alpha: a1, color: P.ink2, size: 22 });
    K.headline(ui, t, C.hook.start + 0.05, ['Kenapa AI mengetik', '*kata demi kata*?'], 540, 240, { size: 78, out: C.token.start - 0.1 });

    const words = ['Langit', 'berwarna', 'biru', 'karena', 'hamburan', 'cahaya...'];
    const n = Math.min(words.length, Math.floor(clamp((t - C.hook.start - 0.2) / 2.2) * (words.length + 1)));
    const p = K.sp(t, C.hook.start + 0.15, 0.6, 0.72);

    world.save();
    K.rise(world, 540, 800, p);
    K.glass(world, 120, 580, 840, 380, { r: 42, haloRgb: R.violet, haloA: 0.48 });
    K.micro(world, 'AI ASSISTANT · STREAMING OUTPUT', 180, 645, { size: 20, color: P.cyan });
    K.label(world, words.slice(0, n).join(' ') + ' ▍', 180, 745, { size: 42, weight: 700, color: P.ink });
    K.label(world, 'Bukan efek dramatis — memang begitu cara otaknya bekerja', 180, 875, { size: 25, color: P.ink2 });
    world.restore();
    world.restore();
  }

  // Shot 2: Token — Breaking text into numbered tokens
  const a2 = env(t, C.token.start, C.jaringan.start, 0.25, 0.25);
  if (a2 > 0) {
    world.save();
    world.globalAlpha = a2;
    K.micro(ui, 'LANGKAH 01 · TOKENISASI TEKS', 540, 155, { align: 'center', alpha: a2, color: P.ink2, size: 22 });
    K.headline(ui, t, C.token.start + 0.05, ['Kalimat dipecah jadi', 'potongan *Token*.'], 540, 240, { size: 78, out: C.jaringan.start - 0.1 });

    const toks = [
      ['Ibu', '#1402', R.violet],
      ['kota', '#8921', R.blue],
      ['Indo', '#3310', R.cyan],
      ['nesia', '#7745', R.pink],
      ['adalah', '#0912', R.mint],
    ];
    toks.forEach(([txt, id, rgb], i) => {
      const p = K.sp(t, C.token.start + 0.15 + i * 0.14, 0.55, 0.72);
      const x = 135 + i * 164;
      world.save();
      K.rise(world, x + 72, 760, p);
      K.glass(world, x, 650, 148, 210, { r: 28, haloRgb: rgb, haloA: 0.45 });
      K.label(world, txt, x + 74, 725, { size: 32, weight: 700, align: 'center' });
      K.label(world, id, x + 74, 805, { size: 22, font: K.FONT.mono, color: P.cyan, align: 'center' });
      world.restore();
    });
    world.restore();
  }

  // Shot 3: Jaringan — 10^12 parameters neural attention
  const a3 = env(t, C.jaringan.start, C.peluang.start, 0.25, 0.25);
  if (a3 > 0) {
    world.save();
    world.globalAlpha = a3;
    K.micro(ui, 'LANGKAH 02 · JARINGAN SARAF TRANSFORMER', 540, 155, { align: 'center', alpha: a3, color: P.ink2, size: 22 });
    K.headline(ui, t, C.jaringan.start + 0.05, ['Dihitung lewat *10¹²*', 'parameter bobot.'], 540, 240, { size: 76, out: C.peluang.start - 0.1 });

    const exp = Math.round(K.count(t, C.jaringan.start + 0.15, 1.4, 1, 12));
    const pop = K.sp(t, C.jaringan.start + 0.1, 0.6, 0.65);
    world.save();
    K.rise(world, 540, 770, pop, { from: 0.75, dy: 0 });
    K.glow(world, 540, 680, 460, R.blue, 0.4);
    K.power(world, '10', String(exp), 540, 790, { size: 300, expColor: [P.violet, P.cyan] });
    world.restore();

    K.glass(world, 160, 910, 760, 110, { r: 55, haloRgb: R.violet, haloA: 0.38 });
    K.label(world, '1 Triliun koneksi menghitung perhatian (Self-Attention)', 540, 965, { size: 26, weight: 700, align: 'center' });
    world.restore();
  }

  // Shot 4: Peluang — Probability distribution of next token
  const a4 = env(t, C.peluang.start, C.pilih.start, 0.25, 0.25);
  if (a4 > 0) {
    world.save();
    world.globalAlpha = a4;
    K.micro(ui, 'LANGKAH 03 · DISTRIBUSI PROBABILITAS', 540, 155, { align: 'center', alpha: a4, color: P.ink2, size: 22 });
    K.headline(ui, t, C.peluang.start + 0.05, ['Menghitung *peluang*', 'kata berikutnya.'], 540, 240, { size: 76, out: C.pilih.start - 0.1 });

    const cands = [
      ['"Jakarta"', 0.78, R.mint, P.mint],
      ['"Nusantara"', 0.14, R.blue, P.cyan],
      ['"negara"', 0.05, R.violet, P.violet],
      ['"kota"', 0.03, R.pink, P.pink],
    ];
    cands.forEach(([word, pct, rgb, col], i) => {
      const p = K.sp(t, C.peluang.start + 0.18 + i * 0.14, 0.6, 0.72);
      const y = 520 + i * 135;
      world.save();
      K.rise(world, 540, y + 52, p);
      K.glass(world, 130, y, 820, 108, { r: 28, haloRgb: i === 0 ? rgb : null, haloA: 0.45 });
      K.label(world, word, 175, y + 54, { size: 34, weight: 700, font: K.FONT.mono });
      // Bar
      const bw = 420 * pct * clamp((t - C.peluang.start - 0.3) / 1.0);
      AM.lib.roundRect(world, 410, y + 36, Math.max(18, bw), 36, 18);
      world.fillStyle = col;
      world.fill();
      K.label(world, `${Math.round(pct * 100)}%`, 905, y + 54, { size: 32, weight: 700, font: K.FONT.mono, align: 'right', color: col });
      world.restore();
    });
    world.restore();
  }

  // Shot 5: Pilih — Autoregressive feedback loop
  const a5 = env(t, C.pilih.start, C.temperatur.start, 0.25, 0.25);
  if (a5 > 0) {
    world.save();
    world.globalAlpha = a5;
    K.micro(ui, 'LANGKAH 04 · SIKLUS AUTOREGRESIF', 540, 155, { align: 'center', alpha: a5, color: P.ink2, size: 22 });
    K.headline(ui, t, C.pilih.start + 0.05, ['Tempel satu kata,', '*hitung ulang* lagi.'], 540, 240, { size: 76, out: C.temperatur.start - 0.1 });

    const steps = [
      ['Putaran #1', 'Ibukota Indonesia adalah → [Jakarta]'],
      ['Putaran #2', 'Ibukota Indonesia adalah Jakarta → [yang]'],
      ['Putaran #3', 'Ibukota Indonesia adalah Jakarta yang → [terletak]'],
    ];
    steps.forEach(([tag, txt], i) => {
      const p = K.sp(t, C.pilih.start + 0.15 + i * 0.35, 0.6, 0.72);
      const y = 540 + i * 165;
      world.save();
      K.rise(world, 540, y + 65, p);
      K.glass(world, 120, y, 840, 135, { r: 32, haloRgb: i === 2 ? R.cyan : R.violet, haloA: 0.4 });
      K.micro(world, tag, 170, y + 40, { size: 18, color: P.cyan });
      K.label(world, txt, 170, y + 90, { size: 29, weight: 700, font: K.FONT.mono });
      world.restore();
    });
    world.restore();
  }

  // Shot 6: Temperatur — Controlling randomness vs creativity
  const a6 = env(t, C.temperatur.start, C.kecepatan.start, 0.25, 0.25);
  if (a6 > 0) {
    world.save();
    world.globalAlpha = a6;
    K.micro(ui, 'PARAMETER KENDALI · TEMPERATURE SAMPLING', 540, 155, { align: 'center', alpha: a6, color: P.ink2, size: 22 });
    K.headline(ui, t, C.temperatur.start + 0.05, ['*Temperatur* mengatur', 'pasti vs kreatif.'], 540, 240, { size: 76, out: C.kecepatan.start - 0.1 });

    const p = K.sp(t, C.temperatur.start + 0.15, 0.65, 0.72);
    world.save();
    K.rise(world, 540, 770, p);
    K.glass(world, 120, 540, 840, 200, { r: 36, haloRgb: R.blue, haloA: 0.4 });
    K.micro(world, 'TEMPERATURE = 0.1 (PASTI & FAKTUAL)', 175, 595, { size: 20, color: P.cyan });
    K.label(world, 'Selalu memilih kata dengan peluang tertinggi #1', 175, 665, { size: 30, weight: 700 });

    K.glass(world, 120, 790, 840, 200, { r: 36, haloRgb: R.pink, haloA: 0.45 });
    K.micro(world, 'TEMPERATURE = 0.9 (KREATIF & PUITIS)', 175, 845, { size: 20, color: P.pink });
    K.label(world, 'Memberi ruang bagi kata kejutan yang segar', 175, 915, { size: 30, weight: 700 });
    world.restore();
    world.restore();
  }

  // Shot 7: Kecepatan — GPU Cluster running dozens of tokens/sec
  const a7 = env(t, C.kecepatan.start, C.penutup.start, 0.25, 0.25);
  if (a7 > 0) {
    world.save();
    world.globalAlpha = a7;
    K.micro(ui, 'KOMPUTASI PARALEL · KLUSTER GPU', 540, 155, { align: 'center', alpha: a7, color: P.ink2, size: 22 });
    K.headline(ui, t, C.kecepatan.start + 0.05, ['Puluhan *token/detik*', 'di ruang server GPU.'], 540, 240, { size: 76, out: C.penutup.start - 0.1 });

    K.server(world, 540, 740, 1.08, t, { active: 1, rgb: R.cyan });
    const speedVal = Math.round(K.count(t, C.kecepatan.start + 0.2, 1.2, 10, 85));
    K.glass(world, 220, 990, 640, 120, { r: 60, haloRgb: R.mint, haloA: 0.45 });
    K.label(world, `${speedVal} TOKEN / DETIK`, 540, 1050, { size: 42, weight: 700, font: K.FONT.mono, color: P.mint, align: 'center' });
    world.restore();
  }

  // Shot 8: Penutup — Summary card
  const a8 = env(t, C.penutup.start, AM.duration, 0.25, 0.25);
  if (a8 > 0) {
    world.save();
    world.globalAlpha = a8;
    K.micro(ui, 'KESIMPULAN · MATEMATIKA PROBABILITAS', 540, 155, { align: 'center', alpha: a8, color: P.ink2, size: 22 });
    K.headline(ui, t, C.penutup.start + 0.05, ['Miliaran hitungan demi', '*satu kata* berikutnya.'], 540, 240, { size: 74 });

    const p = K.sp(t, C.penutup.start + 0.2, 0.65, 0.72);
    world.save();
    K.rise(world, 540, 800, p);
    K.glass(world, 130, 580, 820, 380, { r: 44, haloRgb: R.violet, haloA: 0.5 });
    K.label(world, 'TOKEN  →  BOBOT 10¹²  →  PELUANG %', 540, 710, { size: 34, weight: 700, font: K.FONT.mono, color: P.cyan, align: 'center' });
    K.label(world, 'Satu Kata demi Satu Kata', 540, 815, { size: 52, weight: 700, align: 'center' });
    K.ticks(world, 505, 890, 2, { s: 44, color: P.mint, lw: 6, p: 1 });
    world.restore();
    world.restore();
  }

  K.finish(ui, t, AM);
}

