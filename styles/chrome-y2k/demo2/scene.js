// Chrome Y2K — Demo 2: Estetika Chrome Y2K Tahun 2000 (Liquid Mercury & Millennium Optimism)
import * as K from '/styles/chrome-y2k/kit.js';
const { clamp, prog } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'neon', y: 1560, size: 50 } };

let ctx;
export async function setup(AM) {
  ctx = AM.layer('world');
}

const SCENES = [
  {
    kicker: '01 // DEMAM PERAK MILENIUM',
    lines: ['OBSESI LOGAM CAIR', 'MENJELANG TAHUN 2000'],
    sub: 'Dari sampul album pop, pemutar MP3, hingga antarmuka digital serba krom.',
    metal: 'chrome',
  },
  {
    kicker: '02 // ERA Y2K FUTURISM (1997–2004)',
    lines: ['LAHIRNYA ESTETIKA', 'CYBER Y2K GLOBAL'],
    sub: 'Peralihan tajam dari era grunge 90-an menuju optimisme teknologi milenium baru.',
    metal: 'chrome',
  },
  {
    kicker: '03 // REVOLUSI OPTIK & INTERNET',
    lines: ['KILAU KEPING CD-ROM', '& INTERNET RUMAHAN'],
    sub: 'Pantulan pelangi cakram optik menjadi palet warna utama budaya pop tahun 2000.',
    metal: 'chrome',
  },
  {
    kicker: '04 // REVOLUSI RENDERING 3D',
    lines: ['METABALL MERKURI &', 'TIPOGRAFI KROM 3D'],
    sub: 'Bryce 3D, 3ds Max, dan filter Eye Candy melahirkan estetika logam cair.',
    metal: 'chrome',
  },
  {
    kicker: '05 // OPTIMISME TEKNOLOGI',
    lines: ['MASA DEPAN YANG BERSIH', '& AERODINAMIS'],
    sub: 'Bentuk kapsul bulat (blobject) yang ramah, cepat, dan bebas sudut tajam.',
    metal: 'chrome',
  },
  {
    kicker: '06 // DESAIN INDUSTRI TRANSPARAN',
    lines: ['DARI HARDWARE TRANSLUSEN', 'SAMPAI SKIN WINAMP'],
    sub: 'Eksplorasi material polikarbonat perak dan antarmuka media player futuristik.',
    metal: 'chrome',
  },
  {
    kicker: '07 // ANATOMI VISUAL Y2K',
    lines: ['KISI PERSPEKTIF, ORBIT', '& BINTANG EMPAT SUDUT'],
    sub: 'Kontras panggung biru obsidian dengan sapuan highlight putih menyilaukan.',
    metal: 'chrome',
  },
  {
    kicker: '08 // KEBANGKITAN NEO-Y2K',
    lines: ['NOSTALGIA MASA DEPAN', 'YANG PENUH HARAPAN'],
    sub: 'Mengapa desain grafis modern kembali mengadopsi tipografi krom tahun 2000.',
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
    tag: 'MILLENNIUM ARCHIVE // 1997–2004',
    code: 'CYBER · Y2K',
    step: idx + 1,
    total: 8,
    accent: K.PAL.cyan,
  });

  const sc = SCENES[idx];
  K.drawChromeHeader(ctx, sc.kicker, sc.lines, sc.sub, t, clamp(p * 1.4, 0, 1), sc.metal);
  K.drawMetallicHero(ctx, 540, 795, 'y2k-blob', t, clamp(p * 1.2 - 0.05, 0, 1));

  const specs = [
    { value: '1997–04', label: 'Era Puncak', sub: 'Gelombang Y2K asli' },
    { value: '100% Spec', label: 'Shader Krom', sub: 'Pantulan cakrawala' },
    { value: 'Blobject', label: 'Siluet Ikonik', sub: 'Organik & aerodinamis' },
  ];
  K.drawChromeSpecs(ctx, specs, 1210, t, clamp(p * 1.15 - 0.1, 0, 1), sc.metal);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
