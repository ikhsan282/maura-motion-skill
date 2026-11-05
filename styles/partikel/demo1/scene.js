// Kawanan Partikel — Demo 1: Ribuan Burung Terbang Tanpa Pemimpin (64s)
import * as K from '/styles/partikel/kit.js';

export const meta = {
  fps: 24,
  hold: 1,
  captions: {
    preset: 'clean',
    y: 1480,
    size: 52,
    box: { fill: 'rgba(6, 12, 28, 0.88)', pad: 16, radius: 14, border: 'rgba(110, 231, 255, 0.42)', borderW: 2 },
  },
};

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('whoosh', 0.4, { gain: 0.32 });
  AM.sfx('pop', C.reynolds.start + 0.3, { gain: 0.35 });
  AM.sfx('click', C.tujuh.start + 0.3, { gain: 0.4 });
  AM.sfx('whoosh', C.elang.start + 0.2, { gain: 0.42 });
  AM.sfx('chime', C.akhir.start + 0.4, { gain: 0.42 });
}

export function render(t) {
  K.bg(ctx, t);

  const ruleSplit = t >= C.reynolds.start && t < C.tujuh.start ? K.pr(t, C.reynolds.start, C.reynolds.start + 1.5) : 0;
  const neighborGraph =
    t >= C.tujuh.start && t < C.elang.start
      ? K.pr(t, C.tujuh.start, C.tujuh.start + 1.2)
      : t >= C.elang.start
      ? 1 - K.pr(t, C.elang.start, C.elang.start + 1.0)
      : 0;
  const falconDive =
    t >= C.elang.start && t < C.emergensi.start
      ? K.pr(t, C.elang.start, C.elang.start + 2.5)
      : t >= C.emergensi.start
      ? 1 - K.pr(t, C.emergensi.start, C.emergensi.start + 1.5)
      : 0;

  K.drawStarlingMurmuration(ctx, t, { neighborGraph, ruleSplit, falconDive });

  const chapters = [
    {
      until: C.jalak.start,
      badge: 'FENOMENA KOMPLEKSITAS // TANPA PEMIMPIN',
      title: 'Ribuan Burung Terbang Bersama',
      subtitle: 'Bagaimana kawanan raksasa bergerak serempak tanpa satu pun komandan?',
    },
    {
      until: C.reynolds.start,
      badge: 'ORNITOLOGI & FISIKA KAWANAN',
      title: 'Murmurasi Burung Jalak (Sturnus vulgaris)',
      subtitle: 'Ribuan ekor bermanuver di langit senja dengan kecepatan hingga 40 km/jam',
    },
    {
      until: C.aturan.start,
      badge: 'SIMULASI KOMPUTER // CRAIG REYNOLDS (1986)',
      title: 'Model Algoritma Boids (Bird-oid Object)',
      subtitle: 'Pola rumit di alam ternyata tidak membutuhkan skrip koordinasi terpusat',
    },
    {
      until: C.tujuh.start,
      badge: 'TIGA HUKUM DASAR BOIDS',
      title: 'Separasi • Alignment • Kohesi',
      subtitle: 'Hindari tabrakan lokal, samakan vektor arah, dan merapat ke pusat tetangga',
    },
    {
      until: C.elang.start,
      badge: 'RISET BIOFISIKA // INTERAKSI TOPOLOGIS',
      title: 'Aturan Emas: Cukup Pantau 7 Tetangga',
      subtitle: 'Jumlah optimal agar informasi belokan merambat cepat tanpa gangguan bising',
    },
    {
      until: C.emergensi.start,
      badge: 'GELOMBANG KEJUT EVASI PREDATOR',
      title: 'Respon Kilat Saat Elang Menyergap',
      subtitle: 'Satu belokan di tepi kawanan langsung merambat ke ribuan burung dalam milidetik',
    },
    {
      until: C.akhir.start,
      badge: 'SAINS SISTEM KOMPLEKS',
      title: 'Kecerdasan Kolektif (Emergent Behavior)',
      subtitle: 'Keteraturan skala besar yang lahir dari interaksi lokal antarindividu',
    },
    {
      until: 999,
      badge: 'HARMONI ALAM SEMESTA',
      title: 'Aturan Sederhana, Keindahan Tak Terbatas',
      subtitle: 'Dari kawanan burung di langit hingga jaringan neuron di dalam pikiran kita',
    },
  ];

  const active = chapters.find((c) => t < c.until) || chapters[chapters.length - 1];
  K.drawParticleHUD(ctx, t, {
    ...active,
    pills: [
      { label: 'ATURAN 1: SEPARASI', val: 'Jaga Jarak Aman', col: K.PAL.pink, active: t >= C.reynolds.start },
      { label: 'ATURAN 2: ALIGNMENT', val: 'Samakan Vektor Arah', col: K.PAL.cyan, active: t >= C.aturan.start },
      { label: 'ATURAN 3: TOPOLOGI', val: 'Pantau 7 Tetangga', col: K.PAL.gold, active: t >= C.tujuh.start },
    ],
  });
}
