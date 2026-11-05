// Kawanan Partikel — Demo 3: Hujan & Petrichor (65s)
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
  AM.sfx('whoosh', 0.4, { gain: 0.3 });
  AM.sfx('pop', C.awan.start + 0.3, { gain: 0.35 });
  AM.sfx('bubble', C.bau.start + 0.3, { gain: 0.38 });
  AM.sfx('pop', C.aerosol.start + 0.3, { gain: 0.4 });
  AM.sfx('chime', C.akhir.start + 0.4, { gain: 0.45 });
}

export function render(t) {
  K.bg(ctx, t, { top: '#040917', mid: '#091933', bot: '#12294d' });

  const phase = t >= C.siklus.start && t < C.jatuh.start ? 'evap' : 'rain';
  const petrichorGlow = t >= C.bau.start ? K.pr(t, C.bau.start, C.geosmin.start + 1.5) : 0;

  K.drawRainPetrichor(ctx, t, { phase, petrichorGlow });

  const chapters = [
    {
      until: C.siklus.start,
      badge: 'SIKLUS HIDROLOGI // PARTIKEL AIR',
      title: 'Satu Tetes, Miliaran Kehidupan',
      subtitle: 'Perjalanan tak berujung molekul H₂O dari samudra hingga menyuburkan daratan',
    },
    {
      until: C.awan.start,
      badge: 'FASE 1 // EVAPORASI TERMAL',
      title: 'Uap Air Naik dari Permukaan Laut',
      subtitle: 'Radiasi matahari mengubah air laut menjadi partikel gas yang melayang ke atmosfer',
    },
    {
      until: C.jatuh.start,
      badge: 'FASE 2 // KONDENSASI INTI AWAN',
      title: 'Memadat di Sekitar Partikel Mikroskopis',
      subtitle: 'Jutaan titik uap menyatu pada inti kondensasi membentuk awan kumolonimbus',
    },
    {
      until: C.bau.start,
      badge: 'FASE 3 // PRESIPITASI GRAVITASI',
      title: 'Rintik Hujan Membelah Langit',
      subtitle: 'Butiran air jatuh pada kecepatan terminal sekitar 20 hingga 30 km/jam',
    },
    {
      until: C.geosmin.start,
      badge: 'FENOMENA SENSORIK // ISTILAH CSI 1964',
      title: 'Petrichor: Aroma Khas Hujan Pertama',
      subtitle: 'Dari bahasa Yunani petra (batu) dan ichor (cairan para dewa)',
    },
    {
      until: C.aerosol.start,
      badge: 'KIMIA MIKROBIOLOGI TANAH',
      title: 'Molekul Geosmin & Minyak Tumbuhan',
      subtitle: 'Dihasilkan oleh aktinobakteria Streptomyces saat tanah mengering di musim kemarau',
    },
    {
      until: C.akhir.start,
      badge: 'FISIKA FLUIDA // MIT HIGH-SPEED CAMERA',
      title: 'Letupan Gelembung Aerosol Mikro',
      subtitle: 'Tetesan hujan menjebak gelembung udara di pori tanah lalu melontarkan spora wangi',
    },
    {
      until: 999,
      badge: 'HARMONI SIKLUS BUMI',
      title: 'Napas Kehidupan yang Terus Berputar',
      subtitle: 'Setiap tetes hujan menghubungkan samudra luas dengan sehelai daun di daratan',
    },
  ];

  const active = chapters.find((c) => t < c.until) || chapters[chapters.length - 1];
  K.drawParticleHUD(ctx, t, {
    ...active,
    pills: [
      { label: 'FASE SIKLUS', val: phase === 'evap' ? 'Evaporasi & Awan' : 'Presipitasi Hujan', col: K.PAL.cyan, active: true },
      { label: 'SENYAWA AROMA', val: 'Geosmin (C₁₂H₂₂O)', col: K.PAL.gold, active: t >= C.bau.start },
      { label: 'MEKANISME', val: 'Letupan Aerosol Pori', col: K.PAL.pink, active: t >= C.aerosol.start },
    ],
  });
}
