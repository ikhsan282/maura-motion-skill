// Trailer Tipografi Gelap demo3: "Apollo 13: Empat Hari di Ambang Gelap — Penyelamatan Paling Mustahil di Antariksa"
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

// 1. Hook: 320,000 km from Earth
shot('hook', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'NASA MISSION LOG // APOLLO 13', reel: 'REEL 01/07', theme: 'ember' });

  K.trailerTitle(g, 540, 290, ['EMPAT HARI DI', 'AMBANG GELAP'], {
    tag: 'DOKUMENTER PENYELAMATAN ANTARIKSA',
    sub: 'LEDAKAN TANGKI OKSIGEN DI RUANG HAMPA',
    theme: 'ember',
    size: 64,
    reveal: clamp((t - a) / 0.8),
  });

  K.heroClock(g, 540, 720, '320.000 KM', {
    labelTop: 'JARAK DARI PERMUKAAN BUMI SAAT LEDAKAN',
    labelBot: 'TIGA ASTRONOT TERJEBAK DI ANTARA BUMI DAN BULAN',
    theme: 'ember',
    size: 132,
  });

  K.silhouetteScene(g, 90, 940, 900, 420, 'apollo', t);
});

// 2. Ledak: GET 055:54:53 "Houston, we've had a problem"
shot('ledak', (t, a, b) => {
  K.stage(g, t, { theme: 'crimson', spotlight: true });
  K.topHeader(g, t, { archive: '13 APRIL 1970 // OXYGEN TANK #2 RUPTURE', reel: 'REEL 02/07', theme: 'crimson' });

  K.heroClock(g, 540, 380, '055 : 54 : 53', {
    labelTop: 'MISSION ELAPSED TIME (GET) · 13 APRIL 1970',
    labelBot: 'BUS UTAMA B KEHILANGAN TEGANGAN LISTRIK',
    theme: 'crimson',
    size: 132,
  });

  K.telegramCard(g, 90, 600, 900, 420, {
    header: 'TRANSKRIP AUDIO CAPCOM HOUSTON',
    stamp: 'MASTER ALARM',
    lines: [
      '*"OKE HOUSTON... KAMI BARU SAJA MENGALAMI MASALAH."',
      '*TANGKI OKSIGEN NOMOR 2 MELEDAK AKIBAT KORSLETING KABEL',
      '*TANGKI OKSIGEN NOMOR 1 BOCOR KE RUANG ANGKASA',
      '2 DARI 3 SEL BAHAN BAKAR (FUEL CELL) MATI TOTAL',
    ],
    footer: 'PENDARATAN DI BULAN DIBATALKAN DETIK ITU JUGA',
    theme: 'crimson',
  });

  K.silhouetteScene(g, 90, 1060, 900, 320, 'apollo', t);
});

// 3. Sekoci: Lunar Module Aquarius as lifeboat
shot('sekoci', (t, a, b) => {
  K.stage(g, t, { theme: 'ice', spotlight: true });
  K.topHeader(g, t, { archive: 'LIFEBOAT PROTOCOL // LM AQUARIUS', reel: 'REEL 03/07', theme: 'ice' });

  K.trailerTitle(g, 540, 290, ['SEKOCI PENYELAMAT', 'MODUL AQUARIUS'], {
    tag: 'EVAKUASI DARI MODUL ODYSSEY',
    sub: 'DIRANCANG UNTUK 2 ORANG SELAMA 45 JAM · DIISI 3 ORANG SELAMA 90 JAM',
    theme: 'ice',
    size: 58,
    reveal: 1,
  });

  K.telegramCard(g, 90, 550, 900, 390, {
    header: 'KAPASITAS MODUL BULAN AQUARIUS',
    stamp: 'OVERCAPACITY',
    lines: [
      'DESAIN AWAL  : 2 ASTRONOT · 2 HARI OPERASI',
      '*BEBAN DARURAT: 3 ASTRONOT · 4 HARI PERJALANAN PULANG',
      '*MESIN PENURUN BULAN DIPAKAI UNTUK MANUVER SLINGSHOT',
    ],
    footer: 'LINTASAN FREE-RETURN MEMUTARI SISI BELAKANG BULAN',
    theme: 'ice',
  });

  K.heroClock(g, 540, 1160, '3 KRU · 90 JAM', {
    labelTop: 'JIM LOVELL · JACK SWIGERT · FRED HAISE',
    labelBot: 'BERTAHAN HIDUP DI KABIN SEMPIT SELEBAR 2 METER',
    theme: 'ice',
    size: 112,
  });
});

// 4. Daya: 12 Amps power down (3°C cabin)
shot('daya', (t, a, b) => {
  K.stage(g, t, { theme: 'ice', spotlight: true });
  K.topHeader(g, t, { archive: 'POWER RATIONING // COLD SOAK CABIN', reel: 'REEL 04/07', theme: 'ice' });

  K.heroClock(g, 540, 380, '12 AMPERE', {
    labelTop: 'BATAS KONSUMSI LISTRIK SELURUH PESAWAT',
    labelBot: 'SETARA DENGAN DAYA SATU PEMANGGANG ROTI RUMAHAN',
    theme: 'ice',
    size: 138,
  });

  K.telegramCard(g, 90, 600, 900, 420, {
    header: 'PEMADAMAN TOTAL SISTEM PESAWAT',
    stamp: 'CABIN TEMP: 3°C',
    lines: [
      '• KOMPUTER PEMANDU & PEMANAS KABIN DIMATIKAN',
      '*• SUHU KABIN ANJLOK HINGGA 3° CELCIUS (HAMPIR BEKU)',
      '*• UAP NAPAS MEMBEKU DI DINDING PANEL INSTRUMEN',
      '• AIR MINUM DIJATAH 200 MILILITER PER HARI',
    ],
    footer: 'SISA BATERAI DISIMPAN DEMI MASUK ATMOSFER BUMI',
    theme: 'ice',
  });

  K.silhouetteScene(g, 90, 1060, 900, 320, 'apollo', t);
});

// 5. Kotak: Square peg in a round hole (CO2 crisis)
shot('kotak', (t, a, b) => {
  K.stage(g, t, { theme: 'crimson', spotlight: true });
  K.topHeader(g, t, { archive: 'CO2 TOXICITY ALERT // LIOH CANISTER', reel: 'REEL 05/07', theme: 'crimson' });

  K.trailerTitle(g, 540, 290, ['TABUNG PERSEGI DI', 'LUBANG YANG BUNDAR'], {
    tag: 'KRISIS RACUN KARBON DIOKSIDA',
    sub: 'TEKANAN CO2 MENDEKATI BATAS MEMATIKAN 15 MMHG',
    theme: 'crimson',
    size: 58,
    reveal: 1,
  });

  K.telegramCard(g, 90, 550, 900, 390, {
    header: 'KETIDAKCOCOKAN SUKU CADANG FILTER LiOH',
    stamp: 'CO2 CRITICAL',
    lines: [
      'FILTER AQUARIUS (HABIS) : BERBENTUK SILINDER BUNDAR',
      '*FILTER CADANGAN ODYSSEY : BERBENTUK KOTAK PERSEGI',
      '*GEJALA KERACUNAN CO2: PUSING, KABUR, KEHILANGAN KESADARAN',
    ],
    footer: 'TIM INSINYUR HOUSTON DIBERI WAKTU BEBERAPA JAM',
    theme: 'crimson',
  });

  K.heroClock(g, 540, 1160, 'KOTAK → BUNDAR', {
    labelTop: 'TANTANGAN REKAYASA DARURAT DI DARAT',
    labelBot: 'HANYA BOLEH MEMAKAI BARANG YANG ADA DI DALAM KABIN',
    theme: 'crimson',
    size: 98,
  });
});

// 6. Lakban: The "Mailbox" duct-tape adapter
shot('lakban', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'IMPROVISED ENGINEERING // THE MAILBOX', reel: 'REEL 06/07', theme: 'ember' });

  K.trailerTitle(g, 540, 290, ['DIRAKIT DENGAN', 'LAKBAN DAN KARDUS'], {
    tag: 'ADAPTOR DARURAT "MAILBOX"',
    sub: 'INSTRUKSI DIBACAKAN LANGSUNG LEWAT RADIO DARI HOUSTON',
    theme: 'ember',
    size: 60,
    reveal: 1,
  });

  K.telegramCard(g, 90, 550, 900, 420, {
    header: 'DAFTAR BAHAN PENYELAMAT NYAWA APOLLO 13',
    stamp: 'CO2 DROPPING!',
    lines: [
      '01 · SAMPUL KARTON BUKU PANDUAN PENERBANGAN',
      '02 · KANTONG PLASTIK & SELANG BAJU ANTARIKSA',
      '03 · KAUS KAKI CADANGAN & GULUNGAN LAKBAN PERAK',
      '*HASIL: KADAR CO2 LANGSUNG TURUN KE LEVEL AMAN!',
    ],
    footer: 'BUKTI KECERDASAN MANUSIA DI SAAT PALING GENTING',
    theme: 'ember',
  });

  K.heroClock(g, 540, 1190, '1.8 mmHg', {
    labelTop: 'KADAR CO2 SETELAH ADAPTOR "MAILBOX" AKTIF',
    labelBot: 'UDARA KABIN KEMBALI AMAN UNTUK BERNAPAS',
    theme: 'ember',
    size: 124,
  });
});

// 7. Akhir: Splashdown 17 April 1970
shot('akhir', (t, a, b) => {
  K.stage(g, t, { theme: 'ember', spotlight: true });
  K.topHeader(g, t, { archive: 'PACIFIC SPLASHDOWN // 17 APRIL 1970', reel: 'REEL 07/07', theme: 'ember' });

  K.trailerTitle(g, 540, 290, ['KEGAGALAN PALING', 'GEMILANG SEJARAH'], {
    tag: '17 APRIL 1970 · SAMUDRA PASIFIK',
    sub: 'KETIGA ASTRONOT KEMBALI KE BUMI DENGAN SELAMAT',
    theme: 'ember',
    size: 62,
    reveal: 1,
  });

  K.heroClock(g, 540, 720, '142 JAM : 54 MNT', {
    labelTop: 'TOTAL DURASI MISI PENYELAMATAN APOLLO 13',
    labelBot: '4 MENIT KEHENINGAN RADIO SAAT RE-ENTRY BERAKHIR SORAK-SORAI',
    theme: 'ember',
    size: 112,
  });

  K.telegramCard(g, 90, 940, 900, 420, {
    header: 'CATATAN AKHIR MISI APOLLO 13',
    stamp: 'SUCCESSFUL FAILURE',
    lines: [
      '• TIDAK MENDARAT DI BULAN, TETAPI MENYELAMATKAN 3 NYAWA',
      '*• REKOR TERJAUH MANUSIA DARI BUMI: 400.171 KILOMETER',
      '*• SINERGI INSINYUR DARAT DAN KRU DI BAWAH TEKANAN EKSTREM',
    ],
    footer: 'ARSIP SEJARAH PENJELAJAHAN ANTARIKSA MANUSIA',
    theme: 'ember',
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

