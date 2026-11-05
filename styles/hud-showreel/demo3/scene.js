// HUD Showreel demo3: "Nama Hari Kita Ternyata Angka — Kode Bahasa Arab & Portugis di Balik Kalender"
import * as K from '/styles/hud-showreel/kit.js';
const { clamp, lerp, ease, noise } = AM.lib;
const P = K.PAL;

export const meta = {
  fps: 24,
  hold: 1,
  captions: { preset: 'neon', y: 1560, size: 50, maxWords: 4 },
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

// 1. Hook: 7-day index matrix reveal
shot('hook', (t, a, b) => {
  K.frame(g, t, { accent: P.cyan });
  K.cornerHud(ui, t, { left: 'LEXICON.HUD // BEAT 01/07', beat: 'BEAT 01/07', accent: P.cyan });
  K.headlineHud(g, 'NAMA HARI = DERETAN ANGKA?', 'DEKODE ARSIP BAHASA KALENDER KITA', { y: 240, accent: P.cyan, tag: 'LINGUISTIC SCAN // 7-DAY ARRAY' });

  const days = [
    ['01', 'AHAD / MINGGU', P.cyan],
    ['02', 'SENIN', P.gold],
    ['03', 'SELASA', P.gold],
    ['04', 'RABU', P.gold],
    ['05', 'KAMIS', P.gold],
    ['06', 'JUMAT', P.green],
    ['07', 'SABTU', P.mag],
  ];

  days.forEach(([num, name, col], idx) => {
    const appear = clamp((t - (a + idx * 0.18)) / 0.35);
    const y = 410 + idx * 125;
    g.save();
    g.globalAlpha = appear;
    K.panel(g, 110, y, 860, 102, { r: 16, stroke: col, bracketColor: idx === 1 ? col : null });
    K.label(g, num, 200, y + 51, { size: 48, color: col, font: K.FONT.mono });
    K.label(g, name, 320, y + 51, { size: 40, align: 'left', color: P.ink });
    K.micro(g, idx < 5 ? 'CODE: NUMERIC' : 'CODE: EVENT', 920, y + 51, { size: 20, align: 'right', color: col });
    g.restore();
  });
});

// 2. Ahad (1) & Senin (2)
shot('ahad', (t, a, b) => {
  const p1 = ease.outBack(clamp((t - a) / 0.45), 1.3);
  const p2 = ease.outBack(clamp((t - (a + 1.2)) / 0.45), 1.3);

  K.frame(g, t, { accent: P.cyan });
  K.cornerHud(ui, t, { left: 'LEXICON.HUD // BEAT 02/07', beat: 'BEAT 02/07', accent: P.cyan });
  K.headlineHud(g, 'INDEKS 01 & 02: AHAD & SENIN', 'HITUNGAN DIMULAI DARI ANGKA SATU', { y: 240, accent: P.cyan, tag: 'FILE 01–02 // SEMITIC NUMERALS' });

  K.dossierCard(g, 80, 440, 920, 380, {
    beat: 'FILE 01/07 · DAY ONE',
    num: '01',
    day: 'AHAD',
    root: 'AL-AHAD (WAHID)',
    meaning: 'ARTINYA: ANGKA SATU (PERTAMA)',
    accent: P.cyan,
    pop: p1,
  });

  K.dossierCard(g, 80, 880, 920, 380, {
    beat: 'FILE 02/07 · DAY TWO',
    num: '02',
    day: 'SENIN',
    root: 'AL-ITSNAIN (ITSNA)',
    meaning: 'ARTINYA: ANGKA DUA (KEDUA)',
    accent: P.gold,
    pop: p2,
  });
});

// 3. Selasa (3) & Rabu (4)
shot('selasa', (t, a, b) => {
  const p1 = ease.outBack(clamp((t - a) / 0.45), 1.3);
  const p2 = ease.outBack(clamp((t - (a + 1.2)) / 0.45), 1.3);

  K.frame(g, t, { accent: P.gold });
  K.cornerHud(ui, t, { left: 'LEXICON.HUD // BEAT 03/07', beat: 'BEAT 03/07', accent: P.gold });
  K.headlineHud(g, 'INDEKS 03 & 04: SELASA & RABU', 'URUTAN ANGKA TIGA DAN EMPAT', { y: 240, accent: P.gold, tag: 'FILE 03–04 // SEMITIC NUMERALS' });

  K.dossierCard(g, 80, 440, 920, 380, {
    beat: 'FILE 03/07 · DAY THREE',
    num: '03',
    day: 'SELASA',
    root: 'ATS-TSALATSA',
    meaning: 'ARTINYA: ANGKA TIGA (KETIGA)',
    accent: P.gold,
    pop: p1,
  });

  K.dossierCard(g, 80, 880, 920, 380, {
    beat: 'FILE 04/07 · DAY FOUR',
    num: '04',
    day: 'RABU',
    root: "AL-ARBA'A",
    meaning: 'ARTINYA: ANGKA EMPAT (KEEMPAT)',
    accent: P.cyan,
    pop: p2,
  });
});

// 4. Kamis (5)
shot('kamis', (t, a, b) => {
  const p1 = ease.outBack(clamp((t - a) / 0.5), 1.3);

  K.frame(g, t, { accent: P.green });
  K.cornerHud(ui, t, { left: 'LEXICON.HUD // BEAT 04/07', beat: 'BEAT 04/07', accent: P.green });
  K.headlineHud(g, 'INDEKS 05: HARI KAMIS', 'PUNCAK DERETAN LIMA ANGKA URUT', { y: 240, accent: P.green, tag: 'FILE 05 // FIFTH INDEX' });

  K.dossierCard(g, 80, 460, 920, 400, {
    beat: 'FILE 05/07 · DAY FIVE',
    num: '05',
    day: 'KAMIS',
    root: 'AL-KHAMIS (KHAMSAH)',
    meaning: 'ARTINYA: ANGKA LIMA (KELIMA)',
    accent: P.green,
    pop: p1,
  });

  // 1-to-5 sequence bar
  K.panel(g, 80, 930, 920, 320, { r: 22, stroke: P.green, bracketColor: P.green });
  K.micro(g, 'VERIFIKASI URUTAN NUMERIK (HARI 1 SAMPAI 5)', 540, 990, { size: 22, color: P.green });
  for (let i = 0; i < 5; i++) {
    const bx = 135 + i * 168;
    K.panel(g, bx, 1040, 145, 160, { r: 16, stroke: P.gold, glow: i === 4 ? P.green : null });
    K.label(g, `0${i + 1}`, bx + 72, 1095, { size: 52, color: P.gold, font: K.FONT.mono });
    K.micro(g, ['AHAD', 'SENIN', 'SELASA', 'RABU', 'KAMIS'][i], bx + 72, 1160, { size: 19, color: P.ink });
  }
});

// 5. Jumat (6) & Sabtu (7)
shot('jumat', (t, a, b) => {
  const p1 = ease.outBack(clamp((t - a) / 0.45), 1.3);
  const p2 = ease.outBack(clamp((t - (a + 1.2)) / 0.45), 1.3);

  K.frame(g, t, { accent: P.mag });
  K.cornerHud(ui, t, { left: 'LEXICON.HUD // BEAT 05/07', beat: 'BEAT 05/07', accent: P.mag });
  K.headlineHud(g, 'JUMAT & SABTU: BUKAN ANGKA', 'HARI BERKUMPUL DAN HARI ISTIRAHAT', { y: 240, accent: P.mag, tag: 'FILE 06–07 // SPECIAL DAYS' });

  K.dossierCard(g, 80, 440, 920, 380, {
    beat: 'FILE 06/07 · GATHERING DAY',
    num: '06',
    day: 'JUMAT',
    root: "AL-JUMU'AH",
    meaning: 'ARTINYA: BERKUMPUL / BERJAMAAH',
    accent: P.green,
    pop: p1,
  });

  K.dossierCard(g, 80, 880, 920, 380, {
    beat: 'FILE 07/07 · REST DAY',
    num: '07',
    day: 'SABTU',
    root: 'AS-SABT (SHABBAT)',
    meaning: 'ARTINYA: BERHENTI / ISTIRAHAT',
    accent: P.mag,
    pop: p2,
  });
});

// 6. Minggu: Portuguese Domingo shift
shot('minggu', (t, a, b) => {
  K.frame(g, t, { accent: P.orange });
  K.cornerHud(ui, t, { left: 'LEXICON.HUD // BEAT 06/07', beat: 'BEAT 06/07', accent: P.orange });
  K.headlineHud(g, 'ASAL-USUL KATA MINGGU', 'JEJAK BAHASA PORTUGIS ABAD KE-16', { y: 240, accent: P.orange, tag: 'ETYMOLOGY SHIFT // DOMINGO → MINGGU' });

  K.panel(g, 80, 450, 920, 360, { r: 24, stroke: P.orange, glow: P.orange, bracketColor: P.orange });
  K.micro(g, 'JALUR SERAPAN PELABUHAN NUSANTARA (ABAD KE-16)', 540, 510, { size: 22, color: P.orange });
  K.label(g, 'DOMINGO  →  MINGGU', 540, 625, { size: 72, color: P.gold });
  K.micro(g, 'BAHASA PORTUGIS: HARI TUHAN (DIES DOMINICUS)', 540, 725, { size: 24, color: P.ink });

  K.panel(g, 80, 870, 920, 370, { r: 24, stroke: P.cyan, bracketColor: P.cyan });
  K.micro(g, 'DUA LAPISAN SEJARAH DI HARI PERTAMA', 540, 930, { size: 22, color: P.cyan });
  K.label(g, 'AHAD (ARAB: 01)  +  MINGGU (PORTUGIS)', 540, 1045, { size: 42, color: P.cyan });
  K.micro(g, 'KEDUANYA HIDUP BERSAMA DALAM BAHASA INDONESIA MODERN', 540, 1145, { size: 22, color: P.dim });
});

// 7. Akhir: Full 7-day decoded table
shot('akhir', (t, a, b) => {
  K.frame(g, t, { accent: P.gold });
  K.cornerHud(ui, t, { left: 'LEXICON.HUD // BEAT 07/07', beat: 'BEAT 07/07', accent: P.gold });
  K.headlineHud(g, 'ARSIP KALENDER NUSANTARA', 'PERPADUAN ARAB DAN PORTUGIS', { y: 240, accent: P.gold, tag: 'DATABASE COMPLETE // 7/7 DECODED' });

  const rows = [
    ['01', 'MINGGU / AHAD', 'DOMINGO / AL-AHAD', 'HARI PERTAMA (1)', P.orange],
    ['02', 'SENIN', 'AL-ITSNAIN', 'ANGKA DUA (2)', P.gold],
    ['03', 'SELASA', 'ATS-TSALATSA', 'ANGKA TIGA (3)', P.gold],
    ['04', 'RABU', "AL-ARBA'A", 'ANGKA EMPAT (4)', P.gold],
    ['05', 'KAMIS', 'AL-KHAMIS', 'ANGKA LIMA (5)', P.gold],
    ['06', 'JUMAT', "AL-JUMU'AH", 'HARI BERKUMPUL', P.green],
    ['07', 'SABTU', 'AS-SABT', 'HARI ISTIRAHAT', P.mag],
  ];

  rows.forEach(([num, day, root, mean, col], i) => {
    const y = 395 + i * 128;
    K.panel(g, 80, y, 920, 108, { r: 16, stroke: col, bracketColor: i === 1 ? col : null });
    K.label(g, num, 155, y + 54, { size: 44, color: col, font: K.FONT.mono });
    K.label(g, day, 240, y + 38, { size: 32, align: 'left', color: P.ink });
    K.micro(g, root, 240, y + 78, { size: 18, align: 'left', color: P.dim });
    K.label(g, mean, 955, y + 54, { size: 28, align: 'right', color: col, font: K.FONT.sans });
  });
});

export function render(t) {
  let cur = SHOTS[0];
  for (const s of SHOTS) {
    if (C[s.id] && t >= C[s.id].start - 0.1) cur = s;
  }
  const [a, b] = span(cur.id);
  g.save();
  g.translate(noise.n2(t * 1.8, 7) * 4, noise.n2(t * 1.8, 9) * 4);
  cur.fn(t, a, b);
  g.restore();

  ui.setTransform(1, 0, 0, 1, 0, 0);
  const f = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (f > 0) {
    ui.fillStyle = `rgba(7,11,20,${f * 0.9})`;
    ui.fillRect(0, 0, 1080, 1920);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}
