// Kaca Patri Mosaik demo3: "Geometri Jendela Mawar — Matematika Simetri dan Cahaya di Katedral Gotik"
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

// 1. Hook: 13-meter Rose Window
shot('hook', (t, a, b) => {
  const rev = clamp((t - a) / 1.2);
  K.cathedralStage(g, t, { rayColors: [P.cobalt, P.ruby, P.gold] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'REKAYASA STRUKTUR // JENDELA MAWAR',
    title: 'RODA KACA SELEBAR 13 METER',
    sub: 'MELUBANGI DINDING BATU RAKSASA TANPA RUNTUH',
    accent: P.gold,
  });

  K.roseWindow(g, 540, 565, 255, t, { petals: 12, reveal: rev });

  K.mosaicInfoCard(g, 80, 890, 920, 450, {
    header: 'DIMENSI JENDELA MAWAR NOTRE-DAME & CHARTRES',
    badge: 'DIAMETER 13 M',
    lines: [
      '*SETARA TINGGI GEDUNG EMPAT LANTAI DALAM BENTUK LINGKARAN',
      'TERSUSUN DARI PULUHAN RIBU KEPING KACA & RANGKA BATU',
      '*BERTAHAN MELEWATI BADAI DAN PERANG SELAMA 750 TAHUN',
    ],
    footer: 'PUNCAK PERPADUAN ARSITEKTUR BATU DAN GEOMETRI CAHAYA',
    accent: P.gold,
  });
});

// 2. Gelap: Romanesque thick walls vs Gothic light
shot('gelap', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.cobalt, P.violet, P.gold] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'EVOLUSI ARSITEKTUR // ABAD KE-11 KE 12',
    title: 'DARI BENTENG GELAP KE ISTANA CAHAYA',
    sub: 'MENGAPA DINDING KUNO TIDAK BISA MEMILIKI JENDELA BESAR',
    accent: P.cobalt,
  });

  // Left: Romanesque narrow slit vs Right: Gothic wide rose/lancet
  K.glassTile(g, [[100, 300], [510, 300], [510, 810], [100, 810]], '#1b1e2b', { leadW: 10 });
  K.glassTile(g, [[275, 420], [335, 420], [335, 680], [275, 680]], P.amber, { leadW: 6, glow: true });
  g.font = `800 28px ${K.FONT.serif}`;
  g.fillStyle = P.ivory;
  g.textAlign = 'center';
  g.fillText('ERA ROMANESQUE', 305, 360);
  g.font = `600 20px ${K.FONT.mono}`;
  g.fillStyle = P.dim;
  g.fillText('TEMBOK TEBAL · CELAH SEMPIT', 305, 745);

  K.glassTile(g, [[570, 300], [980, 300], [980, 810], [570, 810]], P.cobalt, { leadW: 10, glow: true });
  K.roseWindow(g, 775, 535, 145, t, { petals: 12, reveal: 1 });
  g.font = `800 28px ${K.FONT.serif}`;
  g.fillStyle = '#ffffff';
  g.fillText('ERA GOTIK', 775, 350);
  g.font = `600 20px ${K.FONT.mono}`;
  g.fillStyle = P.gold;
  g.fillText('DINDING KACA PENUH CAHAYA', 775, 745);

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'MASALAH FISIKA DINDING BATU',
    badge: 'BEBAN ATAP',
    lines: [
      'ATAP KUBAH BATU MENEKAN KE BAWAH DAN MENDORONG KE SAMPING',
      '*JIKA DINDING DILUBANGI BESAR, TEMBOK AKAN MELENGKUNG ROBOH',
      '*BUTUH INOVASI STRUKTUR LUAR UNTUK MEMBEBASKAN DINDING',
    ],
    footer: 'LAHIRNYA REVOLUSI TEKNIK SIPIL ABAD PERTENGAHAN',
    accent: P.cobalt,
  });
});

// 3. Penyangga: Pointed Arch & Flying Buttress
shot('penyangga', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.emerald, P.gold, P.cobalt] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'RAHASIA STRUKTUR // FLYING BUTTRESS',
    title: 'IGA PENYANGGA TERBANG DI LUAR GEDUNG',
    sub: 'MEMINDAHKAN BEBAN ATAP KE TIANG PENOPANG EKSTERNAL',
    accent: P.emerald,
  });

  K.lancetWindow(g, 220, 280, 640, 640, t, { mode: 'story', reveal: 1 });

  K.mosaicInfoCard(g, 80, 960, 920, 400, {
    header: 'TIGA KUNCI TEKNOLOGI KATEDRAL GOTIK',
    badge: 'SKELETAL FRAME',
    lines: [
      '*01 · BUSUR RUNCING (POINTED ARCH) MENYALURKAN BEBAN VERTIKAL',
      '*02 · KUBAH RUSUK SILANG (RIBBED VAULT) MERINGANKAN LANGIT-LANGIT',
      '*03 · PENYANGGA TERBANG (FLYING BUTTRESS) MENAHAN DORONGAN LUAR',
    ],
    footer: 'DINDING KINI HANYA BERFUNGSI SEBAGAI TIRAI KACA RAKSASA',
    accent: P.emerald,
  });
});

// 4. Kompas: Compass and straightedge 12-fold sacred geometry
shot('kompas', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.gold, P.ruby, P.cobalt] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'GEOMETRI JANGKA & TALI // SIMETRI 12',
    title: 'MATEMATIKA TANPA RUMUS ANGKA',
    sub: 'MEMBAGI LINGKARAN MENJADI 12 DAN 24 SEKTOR PRESISI',
    accent: P.gold,
  });

  K.roseWindow(g, 540, 560, 250, t, { petals: 12, reveal: 1 });

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'ALAT KERJA ARSITEK MASTER MASON',
    badge: 'GEOMETRI MURNI',
    lines: [
      '• HANYA MENGGUNAKAN JANGKA BESI BESAR, SIKU-SIKU & TALI SIMPUL',
      '*• LINGKARAN DIBAGI 6 DENGAN JARI-JARI YANG SAMA, LALU DIBAGI 12',
      '*• ANGKA 12 MELAMBANGKAN 12 BULAN & KETERATURAN ALAM SEMESTA',
      '• DIGAMBAR UKURAN PENUH (1:1) DI LANTAI GIPSUM RUANG TRACERY',
    ],
    footer: 'PRESISI MILIMETER TANPA KALKULATOR MAUPUN KOMPUTER',
    accent: P.gold,
  });
});

// 5. Batu: Stone tracery & iron saddle bars
shot('batu', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.ruby, P.gold, P.emerald] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'RANGKA BATU TRACERY // TAHAN BADAI',
    title: 'JARI-JARI BATU PENAHAN ANGIN',
    sub: 'BAGAIMANA KACA TIPIS 3 MILIMETER TAHAN DITERPA MYRSKY',
    accent: P.ruby,
  });

  K.roseWindow(g, 540, 560, 250, t, { petals: 16, reveal: 1 });

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'SISTEM PERTAHANAN BERLAPIS JENDELA MAWAR',
    badge: 'WIND LOAD',
    lines: [
      '*RANGKA UTAMA : PAhatAN BATU KAPUR (STONE TRACERY) BAK RODA',
      '*RANGKA KEDUA : BATANG BESI TEMPA (ARMATURE) PENAHAN ANGIN',
      '*RANGKA KETIGA: JARINGAN TIMAH LENTUR PEREDAM GETARAN SUARA',
      'SAAT ANGIN KENCANG MENERPA, TIMAH MELENTUR SEDIKIT TANPA PECAH',
    ],
    footer: 'KOMBINASI BATU KAKU DAN TIMAH LENTUR YANG SALING MELENGKAPI',
    accent: P.ruby,
  });
});

// 6. Optik: Optical irradiation (Blue spreads more than Red)
shot('optik', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.cobalt, P.ruby, P.violet] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'FISIKA OPTIK MATA // IRADIASI WARNA',
    title: 'MENGAPA BIRU DAN MERAH DISEIMBANGKAN?',
    sub: 'CAHAYA BIRU MENYEBAR LEBIH JAUH DARIPADA CAHAYA MERAH',
    accent: P.violet,
  });

  // Side-by-side optical balance demonstration
  K.glassTile(g, [[100, 300], [510, 300], [510, 800], [100, 800]], P.cobalt, { leadW: 10, glow: true });
  g.font = `800 34px ${K.FONT.serif}`;
  g.fillStyle = '#ffffff';
  g.textAlign = 'center';
  g.fillText('GELOMBANG PENDEK', 305, 510);
  g.font = `700 22px ${K.FONT.mono}`;
  g.fillStyle = P.ivory;
  g.fillText('BIRU MENYEBAR LUAS (HALO)', 305, 580);

  K.glassTile(g, [[570, 300], [980, 300], [980, 800], [570, 800]], P.ruby, { leadW: 10, glow: true });
  g.font = `800 34px ${K.FONT.serif}`;
  g.fillStyle = '#ffffff';
  g.fillText('GELOMBANG PANJANG', 775, 510);
  g.font = `700 22px ${K.FONT.mono}`;
  g.fillStyle = P.gold;
  g.fillText('MERAH TERFOKUS TAJAM', 775, 580);

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'TRIK OPTIK PERAJIN KACA ABAD KE-13',
    badge: 'OPTICAL MIXING',
    lines: [
      '• DARI JARAK 30 METER DI BAWAH, KACA BIRU TAMPAK MENDOMINASI',
      '*• PERAJIN MENYISIPKAN KEPING MERAH DI SELA BIDANG BIRU',
      '*• SERTA MENGGORES GARIS HITAM TIPIS (GRISAILLE) PEREDAM SILAU',
    ],
    footer: 'MATA PENGUNJUNG MELIHAT KESEIMBANGAN UNGU-SAFIR YANG SEMPURNA',
    accent: P.violet,
  });
});

// 7. Akhir: Summary
shot('akhir', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.gold, P.ruby, P.cobalt] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'SIMFONI BATU DAN CAHAYA // KESIMPULAN',
    title: 'GEOMETRI YANG MENYALA ABADI',
    sub: 'KETIKA MATEMATIKA, STRUKTUR & CAHAYA MENJADI SATU',
    accent: P.gold,
  });

  K.roseWindow(g, 540, 560, 255, t, { petals: 12, reveal: 1 });

  K.mosaicInfoCard(g, 80, 890, 920, 450, {
    header: 'TIGA PILAR KEJAYAAN JENDELA MAWAR',
    badge: 'MASTERPIECE',
    lines: [
      '*01 · STRUKTUR : PENYANGGA TERBANG MEMBEBASKAN DINDING BATU',
      '*02 · GEOMETRI : SIMETRI RADIAL 12 KELOPAK DENGAN JANGKA',
      '*03 · OPTIK    : KESEIMBANGAN PANJANG GELOMBANG RUBI & KOBALT',
    ],
    footer: 'MAHKOTA ARSITEKTUR KACA PATRI YANG MENGINSPIRASI DUNIA',
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

