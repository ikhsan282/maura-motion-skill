// Chrome Y2K — Demo 3: Rahasia Logam Titanium (22 Ti — SR-71 Blackbird, Implan Medis & Smartphone)
import * as K from '/styles/chrome-y2k/kit.js';
const { clamp, prog } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'neon', y: 1560, size: 50 } };

let ctx;
export async function setup(AM) {
  ctx = AM.layer('world');
}

const SCENES = [
  {
    kicker: '01 // LOGAM PARA TITAN',
    lines: ['DARI PESAWAT SUPERSONIK', 'KE RANGKA PONSELMU'],
    sub: 'Bagaimana logam dirgantara rahasia bertransformasi menjadi material harian.',
    metal: 'titanium',
  },
  {
    kicker: '02 // UNSUR NOMOR ATOM 22',
    lines: ['TITANIUM (22 Ti)', 'TITIK LELEH 1.668 °C'],
    sub: 'Ditemukan oleh William Gregor pada 1791 dan dinamai dari Titan mitologi Yunani.',
    metal: 'titanium',
  },
  {
    kicker: '03 // RASIO KEKUATAN EKSTREM',
    lines: ['SEKUAT BAJA NAMUN', '45% LEBIH RINGAN'],
    sub: 'Rasio kekuatan-terhadap-densitas tertinggi di antara semua elemen logam alami.',
    metal: 'chrome',
  },
  {
    kicker: '04 // PERISAI PASIVASI OKSIDA',
    lines: ['KEBAL KARAT AIR LAUT', 'DENGAN LAPISAN TiO₂'],
    sub: 'Lapisan oksida pasif memperbaiki dirinya sendiri seketika saat tergores.',
    metal: 'titanium',
  },
  {
    kicker: '05 // REKOR SR-71 BLACKBIRD',
    lines: ['MENAHAN PANAS GESEKAN', 'PADA KECEPATAN MACH 3,2'],
    sub: 'Aluminium melunak pada suhu 300 °C, sementara bodi 93% titanium SR-71 tetap kokoh.',
    metal: 'titanium',
  },
  {
    kicker: '06 // BIOKOMPATIBILITAS MEDIS',
    lines: ['MENYATU DENGAN TULANG', 'TANPA REAKSI PENOLAKAN'],
    sub: 'Osseointegrasi memungkinkan sel tulang manusia tumbuh menempel pada implan titanium.',
    metal: 'chrome',
  },
  {
    kicker: '07 // PADUAN TI-6AL-4V (GRADE 5)',
    lines: ['TITANIUM KELAS LIMA', 'DI CASING SMARTPHONE'],
    sub: 'Paduan 90% titanium, 6% aluminium, dan 4% vanadium tahan benturan ekstrem.',
    metal: 'titanium',
  },
  {
    kicker: '08 // PUNCAK REKAYASA MATERIAL',
    lines: ['DARI LANGIT 80.000 KAKI', 'HINGGA KE GENGGAMAN'],
    sub: 'Satu unsur logam yang menghubungkan penerbangan luar angkasa, kedokteran, dan teknologi.',
    metal: 'gold',
  },
];

export function render(t, AM) {
  const lines = AM.timeline.lines;
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (t >= lines[i].start - 0.1) idx = i;
  }
  const cur = lines[idx] || lines[0];
  const p = prog(t, cur.start, cur.start + 0.9);

  ctx.save();
  K.drawChromeStage(ctx, t, {
    tag: 'AEROSPACE METALLURGY // 22 Ti',
    code: 'GRADE-5 · Ti-6Al-4V',
    step: idx + 1,
    total: 8,
    accent: K.PAL.cyan,
  });

  const sc = SCENES[idx];
  K.drawChromeHeader(ctx, sc.kicker, sc.lines, sc.sub, t, clamp(p * 1.4, 0, 1), sc.metal);
  K.drawMetallicHero(ctx, 540, 795, 'titanium-jet', t, clamp(p * 1.2 - 0.05, 0, 1));

  const specs = [
    { value: '4,5 g/cm³', label: 'Massa Jenis', sub: '45% lebih ringan dari baja' },
    { value: '1.668 °C', label: 'Titik Leleh', sub: 'Tahan panas Mach 3+' },
    { value: 'Grade 5', label: 'Ti-6Al-4V', sub: 'Standar dirgantara & HP' },
  ];
  K.drawChromeSpecs(ctx, specs, 1210, t, clamp(p * 1.15 - 0.1, 0, 1), sc.metal);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
