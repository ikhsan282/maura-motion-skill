// Kaca Patri Mosaik demo2: "Alkimia Kaca Permata — Rahasia Emas dan Kobalt yang Tidak Pudar Seribu Tahun"
import * as K from '/styles/kaca-patri/kit.js';
const { clamp } = AM.lib;
const P = K.PAL;

export const meta = {
  fps: 24,
  hold: 1,
  captions: { preset: 'serif', y: 1580, size: 48, maxWords: 5 },
};

let g, ui;
const C = {};

export async function setup(AM) {
  g = AM.layer('world');
  ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.1, L[i + 1] ? C[L[i + 1].id].start - 0.1 : AM.duration + 1];
};

// 1. Hook: 800-year un-fading jewel glass
shot('hook', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.ruby, P.cobalt, P.gold] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'ALKIMIA CAHAYA // WARNA ABADI',
    title: 'WARNA YANG TAK PERNAH PUDAR',
    sub: 'MENYALA 800 TAHUN TANPA KEHILANGAN KECERAHAN',
    accent: P.gold,
  });

  K.lancetWindow(g, 200, 280, 680, 650, t, { mode: 'alchemy', reveal: clamp((t - a) / 1.0) });

  K.mosaicInfoCard(g, 80, 970, 920, 390, {
    header: 'PIGMEN LUKIS vs KACA PERMATA',
    badge: '800+ TAHUN',
    lines: [
      'CAT KANVAS  : PIGMEN ORGANIK TEROKSIDASI UDARA & CAHAYA UV',
      '*KACA PATRI : ION LOGAM TERKUNCI DI DALAM IKATAN SILIKA',
      '*SINAR MATAHARI JUSTERU MEMBUAT WARNANYA SEMAKIN BERPIJAR',
    ],
    footer: 'RAHASIA KIMIA DI BALIK JENDELA KATEDRAL ABAD PERTENGAHAN',
    accent: P.gold,
  });
});

// 2. Lebur: 1400°C Furnace
shot('lebur', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.amber, P.ruby, P.gold] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'DAPUR PELEBURAN // 1.400° CELCIUS',
    title: 'PASIR, ABU KAYU & LOGAM MULIA',
    sub: 'WARNA BUKAN DICAT DI LUAR, TAPI DILEBUR DI DALAM KACA',
    accent: P.amber,
  });

  // Giant glowing furnace crucible mosaic
  K.glassTile(g, [[120, 300], [960, 300], [960, 820], [120, 820]], P.ruby, { leadW: 10, glow: true });
  K.roseWindow(g, 540, 560, 210, t, { petals: 10, reveal: 1 });

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'RESEP KACA HUTAN (WALDGLAS)',
    badge: '1.400°C',
    lines: [
      '01 · PASIR KUARSA (SILIKA) SEBAGAI PEMBENTUK KACA UTAMA',
      '02 · ABU KAYU POHON BEECH (POTASH) PENURUN TITIK LELEH',
      '*03 · BUBUK OKSIDA LOGAM PEMBERI WARNA PERMATA MURNI',
      '04 · DITIUP MENJADI SILINDER LALU DIBELAH MENJADI LEMBARAN',
    ],
    footer: 'SETIAP LEMBAR KACA PUNYA GELEMBUNG KECIL PEMBIAS CAHAYA',
    accent: P.amber,
  });
});

// 3. Emas: Gold Chloride -> Ruby Red
shot('emas', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.ruby, P.gold, P.ruby] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'RAHASIA MERAH RUBI // AURUM (Au)',
    title: 'MERAH RUBI DARI BUBUK EMAS',
    sub: 'LOGAM EMAS MURNI YANG MELAHIRKAN WARNA MERAH MENYALA',
    accent: P.ruby,
  });

  K.glassTile(g, [[140, 290], [940, 290], [940, 810], [140, 810]], P.ruby, { leadW: 10, glow: true });
  g.font = `900 120px ${K.FONT.serif}`;
  g.fillStyle = P.gold;
  g.textAlign = 'center';
  g.fillText('Au → RUBI', 540, 520, 720);
  g.font = `700 28px ${K.FONT.mono}`;
  g.fillStyle = '#ffffff';
  g.fillText('PARTIKEL EMAS KOLOID DI DALAM KACA', 540, 650, 720);

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'TEKNIK FLASHED GLASS (LAPISAN TIPIS)',
    badge: 'GOLD RUBY',
    lines: [
      '*KACA MERAH MURNI TERLALU GELAP JIKA DICETAK TEBAL',
      '*PERAJIN MENCELUPKAN KACA BENING KE LAPISAN TIPIS KACA EMAS',
      'HASILNYA: CAHAYA MERAH RUBI TEMBUS TERANG BAK PERMATA',
      'EMAS TIDAK BISA BERKARAT SEHINGGA WARNANYA ABADI',
    ],
    footer: 'WARNA TERMAHAL DI SELURUH JENDELA KATEDRAL',
    accent: P.ruby,
  });
});

// 4. Kobalt & Tembaga: Chartres Blue & Emerald Green
shot('kobalt', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.cobalt, P.emerald, P.cyan] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'BIRU CHARTRES & ZAMRUD // Co & Cu',
    title: 'KOBALT BIRU DAN TEMBAGA HIJAU',
    sub: 'DUA MINERAL TAMBANG PENYUSUN LANGIT DAN TAMAN KACA',
    accent: P.cobalt,
  });

  K.glassTile(g, [[100, 300], [520, 300], [520, 810], [100, 810]], P.cobalt, { leadW: 10, glow: true });
  g.font = `800 42px ${K.FONT.serif}`;
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.fillText('BIRU SAFIR', 310, 510);
  g.font = `700 24px ${K.FONT.mono}`;
  g.fillStyle = P.ivory;
  g.fillText('OKSIDA KOBALT (CoO)', 310, 580);

  K.glassTile(g, [[560, 300], [980, 300], [980, 810], [560, 810]], P.emerald, { leadW: 10, glow: true });
  g.font = `800 42px ${K.FONT.serif}`;
  g.fillStyle = '#ffffff';
  g.fillText('HIJAU ZAMRUD', 770, 510);
  g.font = `700 24px ${K.FONT.mono}`;
  g.fillStyle = P.ivory;
  g.fillText('OKSIDA TEMBAGA (CuO)', 770, 580);

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'KEISTIMEWAAN BIRU KATEDRAL CHARTRES',
    badge: 'CHARTRES BLUE',
    lines: [
      '*BIJIH KOBALT DIDATANGKAN DARI TAMBANG SAXONY & BOHEMIA',
      '*TAHAN TERHADAP LUMUT DAN KOROSI CUACA SELAMA 8 ABAD',
      'OKSIDA MANGAN (MnO) MENGHASILKAN WARNA UNGU KECUBUNG',
    ],
    footer: 'KOMBINASI BIRU KOBALT & MERAH RUBI JADI CIRI KHAS GOTIK',
    accent: P.cobalt,
  });
});

// 5. Perak: Silver Stain -> "Stained" Glass origin
shot('perak', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.gold, P.amber, P.gold] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'ASAL-USUL NAMA "STAINED GLASS" // ABAD KE-14',
    title: 'NODA PERAK MENJADI KUNING EMAS',
    sub: 'SATU KEPING KACA DENGAN DUA WARNA SEKALIGUS',
    accent: P.gold,
  });

  K.roseWindow(g, 540, 560, 235, t, { petals: 12, reveal: 1 });

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'REVOLUSI SILVER STAIN (PERAK NITRAT)',
    badge: '1300 M',
    lines: [
      '*SENYAWA PERAK DIOLESKAN KE PERMUKAAN KACA BENING / BIRU',
      '*SAAT DIPANGGANG DI TUNGKU, ION PERAK MERESAP JADI EMAS',
      'RAMBUT EMAS & MAHKOTA BISA DILUKIS TANPA GARIS TIMAH TAMBAHAN',
      'DARI TEKNIK "SILVER STAIN" INILAH LAHIR ISTILAH STAINED GLASS',
    ],
    footer: 'MEMBUAT DETAIL WAJAH DAN JUBAH JAUH LEBIH HALUS',
    accent: P.gold,
  });
});

// 6. Nano: Plasmonic nanoparticles
shot('nano', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.cyan, P.gold, P.ruby] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'SAINS MODERN // NANOTEKNOLOGI KUNO',
    title: 'NANOPARTIKEL LOGAM DI DALAM KACA',
    sub: 'RESONANSI PLASMON PERMUKAAN YANG MEMANTULKAN WARNA MURNI',
    accent: P.cyan,
  });

  K.lancetWindow(g, 200, 280, 680, 640, t, { mode: 'alchemy', reveal: 1 });

  K.mosaicInfoCard(g, 80, 960, 920, 400, {
    header: 'TEMUAN LABORATORIUM FISIKA MODERN',
    badge: 'UKURAN 20–100 nm',
    lines: [
      '*BUTIRAN EMAS BERUKURAN NANOMETER BERGETAR SAAT KENA CAHAYA',
      '*FENOMENA INI DISEBUT SURFACE PLASMON RESONANCE (SPR)',
      'PARTIKEL EMAS JUGA MEMECAH POLUTAN UDARA DI SEKITAR JENDELA',
    ],
    footer: 'PERAJIN ABAD PERTENGAHAN ADALAH AHLI NANOTEKNOLOGI PERTAMA',
    accent: P.cyan,
  });
});

// 7. Akhir: Summary table of oxides
shot('akhir', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.ruby, P.gold, P.cobalt] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'TABEL ALKIMIA KACA PATRI // RINGKASAN',
    title: 'LOGAM MULIA YANG MENJADI CAHAYA',
    sub: 'WARISAN SAINS DAN SENI YANG MENEMBUS SERIBU TAHUN',
    accent: P.gold,
  });

  K.lancetWindow(g, 200, 280, 680, 640, t, { mode: 'alchemy', reveal: 1 });

  K.mosaicInfoCard(g, 80, 960, 920, 400, {
    header: 'EMPAT UNSUR UTAMA KACA PERMATA',
    badge: 'ABADI',
    lines: [
      '*EMAS (Au)    → MERAH RUBI MENYALA',
      '*KOBALT (Co)  → BIRU SAFIR CHARTRES',
      '*TEMBAGA (Cu) → HIJAU ZAMRUD & TURQUOISE',
      '*PERAK (Ag)   → KUNING EMAS (SILVER STAIN)',
    ],
    footer: 'KETIKA KIMIA LOGAM DAN CAHAYA MATAHARI BERSATU DALAM SENI',
    accent: P.gold,
  });
});

export function render(t) {
  let cur = SHOTS[0];
  for (const s of SHOTS) {
    if (C[s.id] && t >= C[s.id].start - 0.1) cur = s;
  }
  const [a, b] = span(cur.id);
  cur.fn(t, a, b);

  ui.setTransform(1, 0, 0, 1, 0, 0);
  const f = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (f > 0) {
    ui.fillStyle = `rgba(11,12,18,${f * 0.92})`;
    ui.fillRect(0, 0, 1080, 1920);
  }
}
