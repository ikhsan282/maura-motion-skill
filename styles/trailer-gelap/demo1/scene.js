// Trailer Tipografi Gelap demo1: "Pesan Terakhir yang Tak Pernah Sampai ke Titanic"
import * as K from '/styles/trailer-gelap/kit.js';
const { clamp, lerp, ease, noise } = AM.lib;
const P = K.PAL;

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

// 1. Hook
shot('hook', (t, a, b) => {
  const rev = clamp((t - a) / 0.8);
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'MARITIME ARCHIVE // 14 APRIL 1912', reel: 'REEL 01/07', theme: 'ember' });

  K.trailerTitle(g, 540, 310, ['PESAN TERAKHIR YANG', 'TAK PERNAH SAMPAI'], {
    tag: 'DOKUMENTER TRAGEDI ATLANTIK',
    sub: 'DUA JAM SEBELUM GUNUNG ES MENGHADANG',
    theme: 'ember',
    size: 62,
    reveal: rev,
  });

  K.silhouetteScene(g, 90, 560, 900, 440, 'ship-iceberg', t);

  K.telegramCard(g, 90, 1050, 900, 320, {
    header: 'MARCONI WIRELESS ROOM // RMS TITANIC',
    stamp: 'UNREAD AT BRIDGE',
    lines: [
      '*STATUS: DITERIMA DI RUANG RADIO',
      'JARAK KE ANJUNGAN KAPTEN: 40 METER',
      '*NASIB PESAN: TERTAHAN DI MEJA OPERATOR',
    ],
    footer: 'SATU KERTAS YANG BISA MENGUBAH SEJARAH',
    theme: 'ember',
  });
});

// 2. Malam: 14 April 1912, 22.5 knots
shot('malam', (t, a, b) => {
  const rev = clamp((t - a) / 0.8);
  K.stage(g, t, { theme: 'ice', spotlight: true });
  K.topHeader(g, t, { archive: 'NORTH ATLANTIC // 41°46\'N 50°14\'W', reel: 'REEL 02/07', theme: 'ice' });

  K.trailerTitle(g, 540, 290, ['14 APRIL 1912', 'LAUT TANPA CAHAYA BULAN'], {
    tag: 'PELAYARAN PERDANA',
    sub: 'KECEPATAN PENUH DI PERAIRAN BEKU',
    theme: 'ice',
    size: 58,
    reveal: rev,
  });

  K.heroClock(g, 540, 740, '22.5 KNOT', {
    labelTop: 'KECEPATAN JELAJAH TITANIC',
    labelBot: 'SUHU AIR LAUT: −2° CELCIUS · LANGIT TANPA OMBAK',
    theme: 'ice',
    size: 132,
  });

  K.telegramCard(g, 90, 960, 900, 390, {
    header: 'KONDISI VISUAL MALAM ITU',
    stamp: 'ZERO MOONLIGHT',
    lines: [
      '01 · TIDAK ADA CAHAYA BULAN UNTUK PANTULAN ES',
      '02 · LAUT SANGAT TENANG TANPA BUIH OMBAK DI KAKI ES',
      '*03 · PENJAGA MENARA INTAI TIDAK MEMILIKI TEROPONG',
    ],
    footer: 'KAPAL MELAJU MENUJU KOORDINAT BAHAYA',
    theme: 'ice',
  });
});

// 3. Mesaba warning at 21:40
shot('mesaba', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'INCOMING TRANSMISSION // SS MESABA', reel: 'REEL 03/07', theme: 'ember' });

  K.heroClock(g, 540, 380, '21 : 40', {
    labelTop: 'KAWAT DARURAT DARI KAPAL SS MESABA',
    labelBot: 'DUA JAM SEBELUM BENTURAN',
    theme: 'ember',
    size: 156,
  });

  K.telegramCard(g, 90, 600, 900, 440, {
    header: 'TELEGRAM SS MESABA → RMS TITANIC',
    stamp: '21:40 SHIP TIME',
    lines: [
      '*"ES DI LINTANG 42° UTARA SAMPAI 41° 25\' UTARA"',
      '*"BUJUR 49° BARAT SAMPAI 50° 30\' BARAT"',
      '*MELIHAT BANYAK ES TEBAL DAN GUNUNG ES BESAR',
      'JUGA PADANG ES LUAS · CUACA CERAH',
    ],
    footer: 'KOORDINAT INI TEPAT BERADA DI DEPAN HALUAN TITANIC',
    theme: 'ember',
  });

  K.silhouetteScene(g, 90, 1080, 900, 300, 'ship-iceberg', t);
});

// 4. Radio room backlog
shot('radio', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'MARCONI STATION // CAPE RACE RELAY', reel: 'REEL 04/07', theme: 'ember' });

  K.trailerTitle(g, 540, 290, ['TUMPUKAN 250 TELEGRAM', 'PENUMPANG KELAS SATU'], {
    tag: 'KELELAHAN DI RUANG RADIO',
    sub: 'OPERATOR JACK PHILLIPS BEKERJA SEJAK PAGI',
    theme: 'ember',
    size: 56,
    reveal: 1,
  });

  K.heroClock(g, 540, 720, '250+ PESAN', {
    labelTop: 'ANTRIAN TELEGRAM KOMERSIAL',
    labelBot: 'MESIN PEMANCAR SEMPAT RUSAK SEHARI SEBELUMNYA',
    theme: 'ember',
    size: 120,
  });

  K.telegramCard(g, 90, 940, 900, 410, {
    header: 'PRIORITAS OPERATOR MARCONI',
    stamp: 'BACKLOG OVERLOAD',
    lines: [
      '• OPERATOR BUKAN AWAK KAPAL, MELAINKAN PEGAWAI MARCONI',
      '• TUGAS UTAMA: MENGIRIM TELEGRAM BERBAYAR PENUMPANG',
      '*• SINYAL CAPE RACE BARU TERJANGKAU MALAM ITU',
    ],
    footer: 'FOKUS OPERATOR TERPECAH OLEH RATUSAN PESAN PRIBADI',
    theme: 'ember',
  });
});

// 5. Tumpuk: Missing MSG prefix
shot('tumpuk', (t, a, b) => {
  K.stage(g, t, { theme: 'crimson', spotlight: true });
  K.topHeader(g, t, { archive: 'PROTOCOL FAILURE // MISSING PREFIX', reel: 'REEL 05/07', theme: 'crimson' });

  K.trailerTitle(g, 540, 290, ['TANPA KODE "MSG"', 'DITINDIH DI SUDUT MEJA'], {
    tag: 'KESALAHAN PROTOKOL KECIL',
    sub: 'MASTERS SERVICE TELEGRAM',
    theme: 'crimson',
    size: 58,
    reveal: 1,
  });

  K.telegramCard(g, 90, 540, 900, 380, {
    header: 'PERBANDINGAN KODE PROTOKOL RADIO 1912',
    stamp: 'CRITICAL DETAIL',
    lines: [
      'KODE [MSG] : WAJIB DIANTAR LANGSUNG KE KAPTEN',
      '*TANPA [MSG]: DIANGGAP INFORMASI UMUM NON-DARURAT',
      '*KAWAT MESABA TIDAK MENCANTUMKAN KODE [MSG]',
    ],
    footer: 'PHILLIPS MENJAWAB: "DITERIMA, TERIMA KASIH"',
    theme: 'crimson',
  });

  K.heroClock(g, 540, 1150, 'MEJA RADIO', {
    labelTop: 'POSISI TERAKHIR KERTAS PERINGATAN',
    labelBot: 'TERTINDIH PEMBERAT KERTAS · TAK PERNAH KE ANJUNGAN',
    theme: 'crimson',
    size: 112,
  });
});

// 6. Tabrak: 23:40 collision
shot('tabrak', (t, a, b) => {
  K.stage(g, t, { theme: 'crimson', spotlight: true });
  K.topHeader(g, t, { archive: 'IMPACT TIMESTAMP // 23:40 SHIP TIME', reel: 'REEL 06/07', theme: 'crimson' });

  K.heroClock(g, 540, 380, '23 : 40', {
    labelTop: 'LONCENG MENARA INTAI BERDENTANG TIGA KALI',
    labelBot: '"GUNUNG ES TEPAT DI DEPAN HALUAN!"',
    theme: 'crimson',
    size: 158,
  });

  K.silhouetteScene(g, 90, 600, 900, 420, 'ship-iceberg', t);

  K.telegramCard(g, 90, 1060, 900, 320, {
    header: '37 DETIK TERAKHIR SEBELUM BENTURAN',
    stamp: 'HARD A-STARBOARD',
    lines: [
      '*23:39 · FREDERICK FLEET MELIHAT BAYANGAN HITAM ES',
      '*23:40 · LAMBUNG KANAN TERKOYAK SEPANJANG 90 METER',
      'LIMA KOMPARTEMEN KEDAP AIR MULAI TERISI AIR LAUT',
    ],
    footer: 'KAPAL TENGGELAM PUKUL 02:20 DINI HARI',
    theme: 'crimson',
  });
});

// 7. Akhir: Closing reflection
shot('akhir', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'HISTORICAL EPILOGUE // MARITIME SAFETY', reel: 'REEL 07/07', theme: 'ember' });

  K.trailerTitle(g, 540, 300, ['SELEMBAR KERTAS', 'EMPAT PULUH METER'], {
    tag: 'WARISAN SEJARAH 1912',
    sub: 'MELAHIRKAN ATURAN RADIO JAGA 24 JAM DI SELURUH LAUTAN',
    theme: 'ember',
    size: 62,
    reveal: 1,
  });

  K.telegramCard(g, 90, 560, 900, 420, {
    header: 'KRONOLOGI DUA JAM PENENTU',
    stamp: '14 APRIL 1912',
    lines: [
      '21:40 · KAWAT PERINGATAN SS MESABA DITERIMA',
      '22:55 · PERINGATAN SS CALIFORNIAN DIHENTIKAN',
      '*23:40 · TITANIC MENABRAK GUNUNG ES DI KOORDINAT MESABA',
      '1914  · KONVENSI SOLAS WAJIBKAN RADIO 24 JAM NONSTOP',
    ],
    footer: 'KOMUNIKASI YANG TERPUTUS MENGUBAH JALANNYA SEJARAH',
    theme: 'ember',
  });

  K.heroClock(g, 540, 1190, '120 MENIT', {
    labelTop: 'SELISIH WAKTU ANTARA PERINGATAN DAN BENTURAN',
    labelBot: 'ARSIP SEJARAH MARITIM DUNIA',
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

