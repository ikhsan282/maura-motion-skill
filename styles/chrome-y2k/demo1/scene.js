// Chrome Y2K — Demo 1: Emas di Dalam HP-mu Lahir dari Tabrakan Bintang (Kilonova & 24K Gold Circuit)
import * as K from '/styles/chrome-y2k/kit.js';
const { clamp, prog } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'neon', y: 1560, size: 50 } };

let ctx;
export async function setup(AM) {
  ctx = AM.layer('world');
}

const SCENES = [
  {
    kicker: '01 // JEJAK KOSMIK DI SAKUMU',
    lines: ['EMAS DI DALAM HP-MU', 'LEBIH TUA DARI BUMI'],
    sub: 'Setiap smartphone menyimpan logam mulia berusia >4,6 miliar tahun.',
    hero: 'gold-chip',
    metal: 'gold',
  },
  {
    kicker: '02 // BATAS FUSI BINTANG BIASA',
    lines: ['INTI MATAHARI TERHENTI', 'PADA UNSUR BESI (26 Fe)'],
    sub: 'Reaksi fusi nuklir bintang biasa tidak cukup panas untuk mencetak atom emas.',
    hero: 'kilonova',
    metal: 'chrome',
  },
  {
    kicker: '03 // BENCANA KOSMIK EKSTREM',
    lines: ['79 PROTON EMAS LAHIR', 'DARI LEDAKAN KILONOVA'],
    sub: 'Hanya peristiwa paling energetik di alam semesta yang sanggup menempa atom 79 Au.',
    hero: 'kilonova',
    metal: 'gold',
  },
  {
    kicker: '04 // TABRAKAN DUA BINTANG NEUTRON',
    lines: ['DUA BINTANG NEUTRON', 'BERTABRAKAN 0,3× CAHAYA'],
    sub: 'Bola bintang seukuran kota dengan massa lebih berat dari Matahari saling menghantam.',
    hero: 'kilonova',
    metal: 'gold',
  },
  {
    kicker: '05 // PROSES TANGKAPAN R-PROCESS',
    lines: ['SEMBURAN NEUTRON CEPAT', 'DALAM SEPERSEKIAN DETIK'],
    sub: 'Rapid neutron-capture (r-process) memaksa inti atom berubah menjadi emas dan platina.',
    hero: 'kilonova',
    metal: 'chrome',
  },
  {
    kicker: '06 // PABRIK EMAS ANTARBINTANG',
    lines: ['LONTARAN EMAS MURNI', 'SEBERAT BEBERAPA BUMI'],
    sub: 'Observasi gelombang gravitasi GW170817 membuktikan kilonova sebagai pabrik emas kosmik.',
    hero: 'kilonova',
    metal: 'gold',
  },
  {
    kicker: '07 // DARI NEBULA KE TAMBANG BUMI',
    lines: ['DEBU BINTANG MENYATU', 'MEMBENTUK TATA SURYA'],
    sub: 'Terkubur di kerak Bumi miliaran tahun lalu sebelum diekstraksi untuk teknologi modern.',
    hero: 'gold-chip',
    metal: 'gold',
  },
  {
    kicker: '08 // SIRKUIT MIKROCHIP PONSEL',
    lines: ['0,034 GRAM EMAS MURNI', 'DI PROSESOR PONSELMU'],
    sub: 'Konduktor bebas korosi yang menghubungkan miliaran transistor di genggamanmu.',
    hero: 'gold-chip',
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
    tag: 'ASTRO-METALLURGY // 79 Au',
    code: 'KILONOVA · GOLD',
    step: idx + 1,
    total: 8,
    accent: K.PAL.goldMid,
  });

  const sc = SCENES[idx];
  K.drawChromeHeader(ctx, sc.kicker, sc.lines, sc.sub, t, clamp(p * 1.4, 0, 1), sc.metal);
  K.drawMetallicHero(ctx, 540, 795, sc.hero, t, clamp(p * 1.2 - 0.05, 0, 1));

  const specs = [
    { value: '79 Au', label: 'Nomor Atom', sub: 'Tangkapan r-process' },
    { value: '0,034 g', label: 'Emas per HP', sub: 'Kawat ikat CPU 24K' },
    { value: '4,6 Miliar', label: 'Usia Kosmik', sub: 'Pra-Tata Surya' },
  ];
  K.drawChromeSpecs(ctx, specs, 1210, t, clamp(p * 1.15 - 0.1, 0, 1), sc.metal);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
