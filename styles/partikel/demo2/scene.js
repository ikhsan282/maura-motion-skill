// Kawanan Partikel — Demo 2: Kunang-Kunang Hutan Bakau (64s)
import * as K from '/styles/partikel/kit.js';

export const meta = {
  fps: 24,
  hold: 1,
  captions: {
    preset: 'clean',
    y: 1480,
    size: 52,
    box: { fill: 'rgba(6, 12, 28, 0.88)', pad: 16, radius: 14, border: 'rgba(255, 214, 94, 0.42)', borderW: 2 },
  },
};

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('chime', 0.4, { gain: 0.32 });
  AM.sfx('pop', C.kimia.start + 0.3, { gain: 0.38 });
  AM.sfx('click', C.sinkron.start + 0.3, { gain: 0.38 });
  AM.sfx('chime', C.kuramoto.start + 0.3, { gain: 0.42 });
  AM.sfx('chime', C.akhir.start + 0.4, { gain: 0.45 });
}

export function render(t) {
  K.bg(ctx, t, { top: '#030710', mid: '#071426', bot: '#0c1f38' });

  // Synchronization progression: high at hook, chaotic during 'acak', then locks into 100% Kuramoto sync
  let syncProg = 0.85;
  if (t >= C.kimia.start && t < C.sinkron.start) {
    syncProg = K.lerp(0.85, 0.05, K.pr(t, C.kimia.start, C.acak.start + 1.0));
  } else if (t >= C.sinkron.start) {
    syncProg = K.lerp(0.05, 1.0, K.pr(t, C.sinkron.start, C.kuramoto.start + 2.0));
  }

  const chemHighlight =
    t >= C.kimia.start && t < C.acak.start
      ? K.pr(t, C.kimia.start, C.kimia.start + 1.2) * (1 - K.pr(t, C.acak.start - 0.8, C.acak.start))
      : 0;

  K.drawFireflyMangrove(ctx, t, { syncProg, chemHighlight });

  const chapters = [
    {
      until: C.cahaya.start,
      badge: 'TEPIAN SUNGAI BAKAU // NUSANTARA',
      title: 'Simfoni Cahaya di Malam Gelap',
      subtitle: 'Ribuan titik keemasan di pohon bakau yang menyala dan padam bersamaan',
    },
    {
      until: C.kimia.start,
      badge: 'KOLONI PTEROPTYX TENER',
      title: 'Kunang-Kunang yang Berkedip Serentak',
      subtitle: 'Spesies kunang-kunang tropis Asia Tenggara yang terkenal mampu menyamakan ritme',
    },
    {
      until: C.efisien.start,
      badge: 'BIOKIMIA // BIOLUMINESENSI',
      title: 'Reaksi Lusiferin & Enzim Lusiferase',
      subtitle: 'Oksidasi kimia di organ abdomen yang memancarkan foton kuning-hijau (560 nm)',
    },
    {
      until: C.acak.start,
      badge: 'TERMODINAMIKA CAHAYA DINGIN',
      title: 'Efisiensi Hampir 100% Tanpa Panas',
      subtitle: 'Hampir seluruh energi kimia langsung berubah menjadi cahaya tampak murni',
    },
    {
      until: C.sinkron.start,
      badge: 'FASE AWAL // OSILATOR INDEPENDEN',
      title: 'Kedipan Acak Saat Malam Baru Turun',
      subtitle: 'Awalnya setiap kunang-kunang berkedip mengikuti detak internal masing-masing',
    },
    {
      until: C.kuramoto.start,
      badge: 'UMPAN BALIK VISUAL ANTARTETANGGA',
      title: 'Menyesuaikan Jam Biologis Bersama',
      subtitle: 'Saat melihat kilatan tetangga, ritme kedip digeser sedikit demi sedikit',
    },
    {
      until: C.akhir.start,
      badge: 'MATEMATIKA SINKRONISASI // MODEL KURAMOTO',
      title: 'Terkunci Dalam Satu Fase Serempak',
      subtitle: 'Ribuan osilator individual menyatu menjadi gelombang cahaya raksasa',
    },
    {
      until: 999,
      badge: 'KEKUATAN KEBERSAMAAN',
      title: 'Cahaya Kecil yang Mengalahkan Gelap',
      subtitle: 'Sinyal yang kompak terdengar dan terlihat jauh melampaui jangkauan satu individu',
    },
  ];

  const active = chapters.find((c) => t < c.until) || chapters[chapters.length - 1];
  const syncPct = `${Math.round(syncProg * 100)}% TERKUNCI`;
  K.drawParticleHUD(ctx, t, {
    ...active,
    pills: [
      { label: 'REAKSI KIMIA', val: 'Lusiferin + O₂', col: K.PAL.gold, active: true },
      { label: 'EFISIENSI ENERGI', val: '~98% Cahaya Dingin', col: K.PAL.emerald, active: t >= C.efisien.start },
      { label: 'FASE KURAMOTO', val: syncPct, col: K.PAL.cyan, active: t >= C.sinkron.start },
    ],
  });
}
