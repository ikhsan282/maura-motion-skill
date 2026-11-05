// Kaca Patri Mosaik demo1: "Jendela yang Bercerita — Bagaimana Kaca Patri Menjadi Buku Bergambar Abad Pertengahan"
import * as K from '/styles/kaca-patri/kit.js';
const { clamp, lerp, ease } = AM.lib;
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

// 1. Hook: Illuminated Lancet Window
shot('hook', (t, a, b) => {
  const rev = clamp((t - a) / 1.2);
  K.cathedralStage(g, t, { rayColors: [P.ruby, P.gold, P.cobalt] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'BABAD CAHAYA // ABAD KE-12',
    title: 'JENDELA YANG BERCERITA',
    sub: 'LAYAR KOMIK RAKSASA SEBELUM MESIN CETAK LAHIR',
    accent: P.gold,
  });

  K.lancetWindow(g, 220, 280, 640, 660, t, { mode: 'story', reveal: rev });

  K.mosaicInfoCard(g, 80, 980, 920, 380, {
    header: 'BIBLIA PAUPERUM · BUKU BAGI RAKYAT',
    badge: 'ERA GOTIK',
    lines: [
      '*90% PENDUDUK ABAD PERTENGAHAN BELUM BISA MEMBACA HURUF',
      'JENDELA KACA PATRI MENJADI MEDIA VISUAL UTAMA DI KOTA',
      '*SETIAP WARNA & POSISI PANEL MEMILIKI MAKNA SIMBOLIS',
    ],
    footer: 'CAHAYA MATAHARI MENJADI PROYEKTOR ALAMI PERTAMA MANUSIA',
    accent: P.gold,
  });
});

// 2. Buku: Parchment manuscript cost vs Cathedral window
shot('buku', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.gold, P.ruby, P.emerald] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'EKONOMI PENGETAHUAN // 1200 M',
    title: 'HARGA SEBUAH BUKU PERKAMEN',
    sub: 'SATU NASKah TULIS TANGAN SETARA HARGA RUMAH',
    accent: P.ruby,
  });

  K.roseWindow(g, 540, 560, 240, t, { petals: 12, reveal: 1 });

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'PERBANDINGAN AKSES INFORMASI ABAD KE-12',
    badge: '1150–1350 M',
    lines: [
      'BUKU PERKAMEN : DISALIN TANGAN BIARAWAN SELAMA SETAHUN',
      'BAHAN BAKU    : BUTUH RATUSAN LEMBAR KULIT DOMBA HALUS',
      '*KACA KATEDRAL : TERBUKA GRATIS BAGI SELURUH WARGA KOTA',
      '*RATUSAN ADEGAN DISEematkan DALAM SATU GEDUNG',
    ],
    footer: 'ARSITEKTUR YANG BERFUNGSI SEBAGAI PERPUSTAKAAN CAHAYA',
    accent: P.ruby,
  });
});

// 3. Baca: Read from bottom to top
shot('baca', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.cobalt, P.gold, P.ruby] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'ATURAN MEMBACA PANEL // BAWAH KE ATAS',
    title: 'DIBACA DARI BAWAH MENUJU LANGIT',
    sub: 'MENUNTUN PANDANGAN MATA MENENGADAH KE KUBAH',
    accent: P.cyan,
  });

  // 3 stacked horizontal stained-glass narrative tiers
  const tiers = [
    { y: 300, num: 'PANEL ATAS (03)', title: 'PUNCAK KISAH & CAHAYA SURGAWI', col: P.gold },
    { y: 510, num: 'PANEL TENGAH (02)', title: 'PERJALANAN, UJIAN & PERJUANGAN', col: P.ruby },
    { y: 720, num: 'PANEL BAWAH (01 · MULAI DI SINI)', title: 'AWAL CERITA & PENYUMBANG GILDA KOTA', col: P.cobalt },
  ];

  tiers.forEach((tr) => {
    K.glassTile(
      g,
      [[120, tr.y], [960, tr.y], [960, tr.y + 170], [120, tr.y + 170]],
      tr.col,
      { leadW: 8, glow: true }
    );
    g.font = `700 22px ${K.FONT.mono}`;
    g.fillStyle = P.ivory;
    g.textAlign = 'center';
    g.fillText(tr.num, 540, tr.y + 56);
    g.font = `800 32px ${K.FONT.serif}`;
    g.fillStyle = '#ffffff';
    g.fillText(tr.title, 540, tr.y + 115, 780);
  });

  K.mosaicInfoCard(g, 80, 950, 920, 410, {
    header: 'ALUR BACA NARASI VERTIKAL',
    badge: 'BOTTOM → UP',
    lines: [
      '01 · MULAI DARI PANEL KIRI BAWAH SETINGGI MATA MANUSIA',
      '02 · LANJUT KE KANAN, LALU NAIK SATU TINGKAT KE ATAS',
      '*03 · BERAKHIR DI MEDALI PUNCAK LENGKUNGAN JENDELA',
    ],
    footer: 'BERKEBALIKAN DENGAN CARA KITA MEMBACA BUKU HARI INI',
    accent: P.cyan,
  });
});

// 4. Timah: Lead came (garis timah H-profile)
shot('timah', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.emerald, P.gold, P.cobalt] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'TEKNIK KONSTRUKSI // LEAD CAME',
    title: 'GARIS TIMAH HITAM PENGIKAT KACA',
    sub: 'STRUKTUR LOGAM LENTUR YANG SEKALIGUS MENJADI GARIS LUKIS',
    accent: P.emerald,
  });

  K.lancetWindow(g, 220, 280, 640, 640, t, { mode: 'story', reveal: 1 });

  K.mosaicInfoCard(g, 80, 960, 920, 400, {
    header: 'FUNGSI GANDA BATANG TIMAH (CAME)',
    badge: 'PROFIL H',
    lines: [
      '*BATANG TIMAH BERBENTUK HURUF "H" MENJEPIT DUA TEPI KACA',
      'DISOLDER DI SETIAP TITIK TEMU & DIOLES DEMPUL KEDAP AIR',
      '*SIFATNYA LENTUR: TAHAN TERPAAN ANGIN KENCANG RATUSAN TAHUN',
    ],
    footer: 'GARIS HITAM TEBAL MEMBUAT WARNA KACA TIDAK SALING BERCAMPUR',
    accent: P.emerald,
  });
});

// 5. Cahaya: Moving sunbeams across the stone floor
shot('cahaya', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.ruby, P.amber, P.cobalt] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'CINEMA OF LIGHT // PROYEKSI SURYA',
    title: 'GAMBAR YANG BERGERAK BERSAMA MATAHARI',
    sub: 'PAGI BIRU DINGIN · SIANG EMAS TERANG · SENJA MERAH BARA',
    accent: P.gold,
  });

  K.roseWindow(g, 540, 560, 240, t, { petals: 12, reveal: 1, rotSpeed: 0.22 });

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'PERUBAHAN WARNA SEPANJANG HARI',
    badge: 'ORIENTASI TIMUR–BARAT',
    lines: [
      'FAJAR (TIMUR)  : CAHAYA PERTAMA MENYALAKAN JENDELA ALTAR',
      'TENGAH HARI    : BERKAS WARNA JATuh MIRING KE LANTAI BATU',
      '*SENJA (BARAT) : JENDELA MAWAR BARAT MENYALA MERAH KEEMASAN',
      '*KETIKA AWAN LEWAT, TERANG-REDUP KACA TERLIHAT SEPERTI BERNAPAS',
    ],
    footer: 'KACA PATRI TIDAK MEMANTULKAN CAHAYA, MELAINKAN MENYARINGNYA',
    accent: P.gold,
  });
});

// 6. Gilda: Trade guilds at the bottom of the windows
shot('gilda', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.gold, P.emerald, P.ruby] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'JEJAK WARGA KOTA // PANEL DONATUR',
    title: 'TANDA TANGAN PARA PERAJIN',
    sub: 'TUKANG ROTI, PANDAI BESI & PENENUN DI SUDUT BAWAH JENDELA',
    accent: P.gold,
  });

  // 4 Guild emblem glass tiles
  const guilds = [
    { x: 100, y: 310, col: P.gold, name: 'GILDA TUKANG ROTI', sub: 'GAMBAR ROTI & TUNGKU' },
    { x: 560, y: 310, col: P.ruby, name: 'GILDA PANDAI BESI', sub: 'GAMBAR PARON & PALU' },
    { x: 100, y: 580, col: P.cobalt, name: 'GILDA PENENUN KAIN', sub: 'GAMBAR ALAT TENUN' },
    { x: 560, y: 580, col: P.emerald, name: 'GILDA PEMAHAT BATU', sub: 'GAMBAR JANGKA & PAHAT' },
  ];
  guilds.forEach((gd) => {
    K.glassTile(
      g,
      [[gd.x, gd.y], [gd.x + 420, gd.y], [gd.x + 420, gd.y + 220], [gd.x, gd.y + 220]],
      gd.col,
      { leadW: 8, glow: true }
    );
    g.font = `800 28px ${K.FONT.serif}`;
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.fillText(gd.name, gd.x + 210, gd.y + 92, 380);
    g.font = `700 20px ${K.FONT.mono}`;
    g.fillStyle = P.ivory;
    g.fillText(gd.sub, gd.x + 210, gd.y + 148, 380);
  });

  K.mosaicInfoCard(g, 80, 880, 920, 460, {
    header: 'GOTONG ROYONG MEMBANGUN JENDELA',
    badge: 'CHARTRES & NOTRE-DAME',
    lines: [
      '• SERIKAT PEKERJA (GILDA) PATUNGAN MEMBIAYAI SATU JENDELA',
      '*• SEBAGAI PENANDA, POTRET KERJA MEREKA DILUKIS DI KACA BAWAH',
      '*• MENJADI REKAMAN VISUAL KEHIDUPAN SEHARI-HARI ABAD KE-13',
    ],
    footer: 'PERPADUAN KISAH AGUNG DAN KERINGAT RAKYAT PEKERJA',
    accent: P.gold,
  });
});

// 7. Akhir: Closing summary
shot('akhir', (t, a, b) => {
  K.cathedralStage(g, t, { rayColors: [P.ruby, P.gold, P.cobalt] });
  K.stainedBanner(g, 80, 70, 920, 175, {
    tag: 'WARISAN KRIYA DUNIA // CAHAYA ABADI',
    title: 'LAYAR SINEMA PERTAMA MANUSIA',
    sub: 'DELAPAN ABAD BERCERITA LEWAT PERMATA DAN MATAHARI',
    accent: P.gold,
  });

  K.lancetWindow(g, 220, 280, 640, 640, t, { mode: 'story', reveal: 1 });

  K.mosaicInfoCard(g, 80, 960, 920, 400, {
    header: 'INTISARI SENI KACA PATRI MOSAIK',
    badge: 'KESIMPULAN',
    lines: [
      '01 · BUKU BERGAMBAR RAKSASA BAGI MASYARAKAT ABAD PERTENGAHAN',
      '02 · DIRANGKAI DARI RIBUAN KACA PERMATA & TIMAH PROFIL-H',
      '*03 · HIDUP DAN BERGERAK SETIAP KALI MATAHARI TERBIT',
    ],
    footer: 'SENI MENGUBAH CAHAYA MENJADI BAHASA YANG BISA DIBACA SEMUA ORANG',
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

