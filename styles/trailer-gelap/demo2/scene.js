// Trailer Tipografi Gelap demo2: "Letusan Tambora 1815 — Tahun Ketika Dunia Kehilangan Musim Panas"
import * as K from '/styles/trailer-gelap/kit.js';
const { clamp, lerp, ease } = AM.lib;

export const meta = {
  fps: 24,
  hold: 1,
  captions: { preset: 'elegant', y: 1580, size: 48, maxWords: 5 },
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

// 1. Hook: June 1816 Snow in Summer
shot('hook', (t, a, b) => {
  K.stage(g, t, { theme: 'ice', spotlight: true });
  K.topHeader(g, t, { archive: 'CLIMATE ANOMALY // JUNE 1816', reel: 'REEL 01/07', theme: 'ice' });

  K.trailerTitle(g, 540, 300, ['TAHUN TANPA', 'MUSIM PANAS'], {
    tag: 'MISTERI IKLIM GLOBAL 1816',
    sub: 'SALJU TURUN DI BULAN JUNI · SUMBERNYA DARI NUSANTARA',
    theme: 'ice',
    size: 64,
    reveal: clamp((t - a) / 0.8),
  });

  K.heroClock(g, 540, 740, 'JUNI 1816', {
    labelTop: 'ANOMALI CUACA EROPA & AMERIKA UTARA',
    labelBot: 'DANAU MEMBEKU · LANGIT KELABU SELAMA BERBULAN-BULAN',
    theme: 'ice',
    size: 136,
  });

  K.telegramCard(g, 90, 960, 900, 390, {
    header: 'CATATAN KRONIK DUNIA 1816',
    stamp: 'GLOBAL FROST',
    lines: [
      '• SALJU MERAH DAN KUNING TURUN DI ITALIA & HUNGARIA',
      '• EMBUN BEKU MEMATIKAN LADANG JAGUNG DI NEW ENGLAND',
      '*• PENYEBABNYA BERJARAK 14.000 KM DI PULAU SUMBAWA',
    ],
    footer: 'JEJAK LETUSAN GUNUNG TAMBORA SETAHUN SEBELUMNYA',
    theme: 'ice',
  });
});

// 2. April: 10 April 1815 VEI-7
shot('april', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'SUMBAWA ISLAND // 10 APRIL 1815', reel: 'REEL 02/07', theme: 'ember' });

  K.heroClock(g, 540, 380, 'SKALA VEI-7', {
    labelTop: '10 APRIL 1815 · PUNCAK LETUSAN TAMBORA',
    labelBot: 'LETUSAN TERBESAR SEJARAH MANUSIA MODERN',
    theme: 'ember',
    size: 132,
  });

  K.silhouetteScene(g, 90, 600, 900, 430, 'tambora', t);

  K.telegramCard(g, 90, 1070, 900, 310, {
    header: 'LAPORAN SUARA DENTUMAN',
    stamp: '2.600 KM RADIUS',
    lines: [
      '*SUARA TERDENGAR HINGGA BENGKULU DAN TERNATE',
      '*DIANGGAP SUARA MERIAM KAPAL PERANG DI YOGYAKARTA',
      'GELOMBANG KEJUT MENGGUNCANG KACA JENDELA DI JAWA',
    ],
    footer: 'EMPAT KALI LEBIH DAHSYAT DARI KRAKATAU 1883',
    theme: 'ember',
  });
});

// 3. Puncak: 4300m -> 2850m collapse
shot('puncak', (t, a, b) => {
  K.stage(g, t, { theme: 'crimson', spotlight: true });
  K.topHeader(g, t, { archive: 'CALDERA COLLAPSE // SUMBAWA', reel: 'REEL 03/07', theme: 'crimson' });

  K.trailerTitle(g, 540, 290, ['PUNCAK RAKSASA YANG', 'HILANG DALAM SEMALAM'], {
    tag: 'KELAHIRAN KALDERA TAMBORA',
    sub: 'KEHILANGAN SEPERTIGA KETINGGIAN GUNUNG',
    theme: 'crimson',
    size: 58,
    reveal: 1,
  });

  K.heroClock(g, 540, 720, '4.300m → 2.850m', {
    labelTop: 'PENURUNAN KETINGGIAN GUNUNG TAMBORA',
    labelBot: 'MEMBENTUK KAWAH KALDERA SELEBAR 7 KILOMETER',
    theme: 'crimson',
    size: 102,
  });

  K.telegramCard(g, 90, 940, 900, 410, {
    header: 'DAMPAK LANGSUNG DI PULAU SUMBAWA',
    stamp: 'TOTAL COLLAPSE',
    lines: [
      '• PUNCAK GUNUNG RUNTUH MENJADI KALDERA SEDALAM 1.100M',
      '*• TIGA KERAJAAN LOKAL (TAMBORA, PEKAT, SANGGAR) TERKUBUR',
      '• BAHASA KUNO TAMBORA PUNAH BERSAMA PERADABANNYA',
    ],
    footer: 'DIJULUKI "POMPEII DARI TIMUR" OLEH PARA ARKEOLOG',
    theme: 'crimson',
  });
});

// 4. Abu: 150 km3 to 43 km stratosphere
shot('abu', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'STRATOSPHERIC PLUME // 43 KM ALTITUDE', reel: 'REEL 04/07', theme: 'ember' });

  K.heroClock(g, 540, 380, '150 KM³ ABU', {
    labelTop: 'VOLUME MATERIAL VULKANIK TERLONTAR',
    labelBot: 'KOLOM LETUSAN MENEMBUS 43 KILOMETER KE STRATOSFER',
    theme: 'ember',
    size: 132,
  });

  K.telegramCard(g, 90, 600, 900, 420, {
    header: 'DATA FISIKA SEMBURAN TAMBORA',
    stamp: 'STRATOSPHERE',
    lines: [
      '*TINGGI KOLOM ABU: 43 KM (4X TINGGI JELAJAH PESAWAT)',
      '*GAS BELERANG (SO2): 60 JUTA TON KE ATMOSFER ATAS',
      'LANGIT GELAP GULITA SELAMA 3 HARI DI RADIUS 600 KM',
    ],
    footer: 'ABU HALUS TIDAK TERCUCI HUJAN DI LAPISAN STRATOSFER',
    theme: 'ember',
  });

  K.silhouetteScene(g, 90, 1060, 900, 320, 'tambora', t);
});

// 5. Selimut: Global sulfate aerosol veil
shot('selimut', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'AEROSOL VEIL // GLOBAL ALBEDO', reel: 'REEL 05/07', theme: 'ember' });

  K.trailerTitle(g, 540, 290, ['TIRAI ASAM SULFAT', 'MENYELIMUTI BOLA BUMI'], {
    tag: 'MEKANISME PENDINGINAN PLANET',
    sub: 'CAHAYA MATAHARI DIPANTULKAN KEMBALI KE ANTARIKSA',
    theme: 'ember',
    size: 58,
    reveal: 1,
  });

  K.telegramCard(g, 90, 550, 900, 400, {
    header: 'REAKSI KIMIA DI STRATOSFER',
    stamp: 'SOLAR SHIELD',
    lines: [
      '01 · GAS SO2 BEREAKSI DENGAN UAP AIR JADI ASAM SULFAT',
      '02 · ARUS ANGIN KHATULISTIWA MENYEBARNYA KE DUA KUTUB',
      '*03 · TIRAI AEROSOL MEMANTULKAN RADIASI MATAHARI',
    ],
    footer: 'MENCIPTAKAN EFEK MUSIM DINGIN VULKANIK GLOBAL',
    theme: 'ember',
  });

  K.heroClock(g, 540, 1170, '60 JUTA TON', {
    labelTop: 'KABUT SULFAT DI LANGIT BUMI',
    labelBot: 'BERTAHAN MENGELILINGI BUMI SELAMA 2 TAHUN',
    theme: 'ember',
    size: 118,
  });
});

// 6. Beku: Global temperature drop
shot('beku', (t, a, b) => {
  K.stage(g, t, { theme: 'ice', spotlight: true });
  K.topHeader(g, t, { archive: 'GLOBAL COOLING // 1816 HARVEST CRISIS', reel: 'REEL 06/07', theme: 'ice' });

  K.heroClock(g, 540, 380, '−1.5° CELCIUS', {
    labelTop: 'PENURUNAN SUHU RATA-RATA BELAHAN BUMI UTARA',
    labelBot: 'GAGAL PANEN DI EROPA, AMERIKA UTARA & TIONGKOK',
    theme: 'ice',
    size: 128,
  });

  K.telegramCard(g, 90, 600, 900, 440, {
    header: 'EFEK DOMINO TAHUN 1816',
    stamp: 'YEAR WITHOUT SUMMER',
    lines: [
      '*HARGA GANDUM & OAT MELONJAK 400% DI EROPA',
      '*KELANGKAAN PAKAN KUDA MENDORONG PENEMUAN SEPEDA (DRAISINE)',
      '*CUACA KELAM DI JENEWA MELAHIRKAN KISAH "FRANKENSTEIN"',
      'SENJA MERAH TAMBORA TERLUKIS DI KARYA J.M.W. TURNER',
    ],
    footer: 'SATU LETUSAN MENGUBAH SASTRA, TEKNOLOGI & MIGRASI DUNIA',
    theme: 'ice',
  });

  K.silhouetteScene(g, 90, 1080, 900, 300, 'tambora', t);
});

// 7. Akhir: Closing summary
shot('akhir', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'GEOLOGICAL ARCHIVE // TAMBORA LEGACY', reel: 'REEL 07/07', theme: 'ember' });

  K.trailerTitle(g, 540, 300, ['DARI SUMBAWA', 'MENGUBAH WAJAH DUNIA'], {
    tag: 'WARISAN GEOLOGI NUSANTARA',
    sub: 'KETIKA SATU GUNUNG MENGENDALIKAN IKLIM PLANET BUMI',
    theme: 'ember',
    size: 60,
    reveal: 1,
  });

  K.telegramCard(g, 90, 560, 900, 410, {
    header: 'RINGKASAN ARSIP TAMBORA 1815',
    stamp: 'VEI-7 RECORD',
    lines: [
      'LOKASI   : PULAU SUMBAWA, NUSA TENGGARA BARAT',
      'TANGGAL  : 10 APRIL 1815 (PUNCAK LETUSAN)',
      '*VOLUME  : 150 KM³ ABU · KALDERA LEBAR 7 KM',
      '*DAMPAK  : 1816 TAHUN TANPA MUSIM PANAS DUNIA',
    ],
    footer: 'SEJARAH ALAM YANG MENGHUBUNGKAN NUSANTARA DENGAN DUNIA',
    theme: 'ember',
  });

  K.heroClock(g, 540, 1190, '1815 — 1816', {
    labelTop: 'DUA TAHUN YANG MENGUBAH PERADABAN MODERN',
    labelBot: 'ARSIP DOKUMENTER GEOLOGI NUSANTARA',
    theme: 'ember',
    size: 124,
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
    ui.fillStyle = `rgba(5,6,9,${f * 0.92})`;
    ui.fillRect(0, 0, 1080, 1920);
  }
}

