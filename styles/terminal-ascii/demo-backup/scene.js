// Terminal ASCII demo: "Backup 3-2-1: Satu HP Rusak Bukan Kiamat" — 5 screens, ~18 s.
import * as K from '/styles/terminal-ascii/kit.js';
const { clamp, lerp, ease, hrand } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, captions: { preset: 'terminal', y: 1470, size: 70, maxWords: 4 } };

let out;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  out = AM.layer('crt', { autoClear: false });
  K.screen();
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('keys', 0.05, { gain: 0.35 });
  AM.sfx('glitch', C.hilang.start - 0.1, { gain: 0.35 });
  AM.sfx('typewriter', C.aturan.start, { gain: 0.3 });
  AM.sfx('ding', W('media', 'HP'), { gain: 0.25, pitch: 1.3 });
  AM.sfx('glitch', C.awan.start - 0.1, { gain: 0.3, pitch: 0.8 });
  AM.sfx('thud', W('cek', 'Jumat'), { gain: 0.45, pitch: 1.6 });
  AM.sfx('thud', W('cek', 'Jumat') + 0.22, { gain: 0.45, pitch: 1.6 });
  AM.sfx('glitch', AM.duration - 0.55, { gain: 0.3, pitch: 0.6 });
}

const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const blink = (t, hz = 3) => Math.floor(t * hz * 2) % 2 === 0;

function statusBar(t, label) {
  K.put(1, 1, (' C:\\BACKUP\\' + label).padEnd(25) + ' 640K ', { inv: true, color: P.dim });
  K.put(1, 34, 'D:\\> _  BACKUP  ' + String(Math.floor(t * 10) % 10) + '  [OK]', { color: P.faint });
}

// 1. HP retak: file skripsi hilang.
shot('hilang', (t, a, b) => {
  statusBar(t, 'RANI\\PHOTO');
  // HP retak
  K.put(10, 4, '+----------------+', { color: P.dim });
  K.put(10, 5, '|  \\  /    \\  /  |', { color: P.dim });
  K.put(10, 6, '|   \\/  XX  \\/   |', { color: P.red });
  K.put(10, 7, '|   /\\     /\\   |', { color: P.red });
  K.put(10, 8, '|  /  \\___/  \\  |', { color: P.dim });
  K.put(10, 9, '|  |FOTO.DATA |  |', { color: P.amber });
  K.put(10, 10, '+----------------+', { color: P.dim });
  K.put(10, 11, '   HP MATI TOTAL', { color: P.amber, chars: K.typed(t, a + 0.3, 20) });

  // folder hilang
  K.box(1, 14, 34, 10, { color: P.dim, title: 'FILE SEKARGARAH' });
  const files = ['SKRIPSI_DRAFT.DOCX', 'FOTO_SIDANG.JPG', 'REFERENSI_PDF.PDF', 'VIDEO_PRESENTASI.MP4', 'SCAN_KTP.PDF'];
  const vis = Math.floor(K.typed(t, a + 0.5, 8));
  files.forEach((f, i) => {
    const gone = vis > i;
    K.put(2, 15 + i, gone ? '[!] ' + f : '[?] ' + '???????????????'  , { color: gone ? P.red : P.dim, chars: gone ? Infinity : Math.floor(K.typed(t, a + 0.5 + i * 0.3, 12)) });
  });
  if (t > W('hilang', 'Rani') - 0.1) {
    K.put(1, 26, 'FOTO SKRIPSI LENYAP.', { color: P.amber, chars: K.typed(t, W('hilang', 'Rani') - 0.1, 22) });
    K.cursor(1 + Math.floor(K.typed(t, W('hilang', 'Rani') - 0.1, 22)), 26, t);
  }
});

// 2. Aturan 3-2-1: besar, berkedip.
shot('aturan', (t, a, b) => {
  statusBar(t, 'RULE 3-2-1');
  const big321 = K.bigText('3-2-1', { sx: 2, sy: 2, gap: 2 });
  K.art(4, 2, big321, { color: (i) => (i < 4 ? P.hi : P.g), reveal: Math.floor(t * 30) });
  if (t > W('aturan', 'tiga') - 0.1) {
    K.box(1, 14, 11, 3, { color: P.g, title: '3 SALINAN' });
    K.put(2, 15, '3 backup berbeda', { color: P.hi });
    K.put(2, 16, 'bukan 3 versi sama', { color: P.dim });
  }
  if (t > W('aturan', 'dua') - 0.1) {
    K.box(13, 14, 11, 3, { color: P.g, title: '2 MEDIA' });
    K.put(14, 15, '2 media penyimpanan', { color: P.hi });
    K.put(14, 16, 'bukan di disk sama', { color: P.dim });
  }
  if (t > W('aturan', 'satu') - 0.1) {
    K.box(25, 14, 11, 3, { color: blink(t, 3) ? P.hi : P.g, title: '1 OFFSITE' });
    K.put(26, 15, '1 di luar rumah', { color: blink(t, 3) ? P.hi : P.g });
    K.put(26, 16, 'bukan di satu lokasi', { color: P.dim });
  }
  K.put(1, 26, 'SATU HP RUSAK BUKAN KIAMAT.', { color: P.hi, chars: K.typed(t, W('aturan', 'kiamat') - 0.1, 26) });
  K.cursor(1 + Math.floor(K.typed(t, W('aturan', 'kiamat') - 0.1, 26)), 26, t);
});

// 3. Tiga media: HP, hardisk, cloud — animasi panah.
shot('media', (t, a, b) => {
  statusBar(t, '3 salinan');
  const reps = Math.floor(clamp((t - a) / 3) * 3);
  // HP
  K.put(2, 4, '+--------+', { color: P.dim });
  K.put(2, 5, '|  [  ]   |', { color: P.hi });
  K.put(2, 6, '|  HP    |', { color: P.g });
  K.put(2, 7, '+--------+', { color: P.dim });
  // hardisk
  K.put(14, 4, '+--------+', { color: P.dim });
  K.put(14, 5, '| [====] |', { color: P.hi });
  K.put(14, 6, '| HDD    |', { color: P.g });
  K.put(14, 7, '+--------+', { color: P.dim });
  // cloud
  K.put(26, 4, '+--------+', { color: P.dim });
  K.put(27, 5, '.--.--.', { color: P.hi });
  K.put(27, 6, '( CLOUD )', { color: P.hi });
  K.put(27, 7, '+--------+', { color: P.dim });

  // progress salin
  const p1 = clamp((t - a) / 2.5);
  const p2 = clamp((t - a - 0.4) / 2.5);
  const p3 = clamp((t - a - 0.8) / 2.5);
  K.put(2, 9, 'SALIN...', { color: P.dim });
  K.progress(2, 10, 9, p1, { color: p1 >= 1 ? P.hi : P.g });
  K.progress(14, 10, 9, p2, { color: p2 >= 1 ? P.hi : P.g });
  K.progress(26, 10, 9, p3, { color: p3 >= 1 ? P.hi : P.g });

  // ceklis
  if (p1 >= 1) K.put(2, 11, blink(t, 4) ? '[OK] HP' : '[v] HP', { color: P.hi });
  if (p2 >= 1) K.put(14, 11, blink(t, 4) ? '[OK] HDD' : '[v] HDD', { color: P.hi });
  if (p3 >= 1) K.put(26, 11, blink(t, 4) ? '[OK] CLOUD' : '[v] CLOUD', { color: P.hi });

  // ringkasan
  K.box(1, 14, 34, 9, { color: P.dim, title: 'RINGKASAN 3-2-1' });
  const rows = [
    ['SALINAN 1', 'HP / Handphone', W('media', 'HP')],
    ['SALINAN 2', 'Hardisk / SSD', W('media', 'hardisk')],
    ['SALINAN 3', 'Cloud / Google Drive', W('media', 'cloud')],
    ['MEDIA 1  ', 'Digital (HDD, SSD, NVMe)', W('media', 'digital')],
    ['MEDIA 2  ', 'Cloud (offsite)', W('media', 'digital') + 0.2],
    ['OFFSITE  ', 'Berbeda lokasi fisik', W('media', 'digital') + 0.4],
  ];
  rows.forEach(([k, v, tt], i) => {
    if (t > tt) {
      K.put(2, 15 + i, k, { color: P.dim });
      K.put(12, 15 + i, v, { color: P.hi, chars: K.typed(t, tt, 30) });
    }
  });
  K.cursor(1 + Math.min(34, Math.floor(K.typed(t, W('media', 'digital') + 0.5, 30))), 21, t);
});

// 4. Cloud vs Lokal — perbandingan.
shot('awan', (t, a, b) => {
  statusBar(t, 'CLOUD vs LOKAL');
  // Cloud box
  K.box(1, 3, 16, 14, { color: P.hi, title: 'CLOUD' });
  K.put(2, 4, '.--.--.', { color: P.hi });
  K.put(2, 5, '( AWAN  )', { color: P.hi });
  K.put(2, 7, 'Tahan banjir', { color: P.g });
  K.put(2, 8, 'Tahan maling', { color: P.g });
  K.put(2, 9, 'Akses dari mana aja', { color: P.g });
  K.put(2, 10, 'Butuh internet', { color: P.amber });
  K.put(2, 11, 'Ada biaya bulanan', { color: P.amber });
  K.put(2, 13, 'KEAMANAN: TINGGI', { inv: true, color: P.hi });
  K.put(2, 14, 'KECEPATAN: MODERAT', { color: P.dim });

  // Lokal box
  K.box(20, 3, 16, 14, { color: P.g, title: 'LOKAL' });
  K.put(21, 4, '+----------+', { color: P.g });
  K.put(21, 5, '| [======] |', { color: P.hi });
  K.put(21, 6, '+----------+', { color: P.g });
  K.put(21, 7, 'Cepat tanpa internet', { color: P.hi });
  K.put(21, 8, 'Gratis tanpa langganan', { color: P.hi });
  K.put(21, 9, 'Sekolah: banjir = hilang', { color: P.amber });
  K.put(21, 10, 'Sekolah: maling = hilang', { color: P.amber });
  K.put(21, 13, 'KEAMANAN: SEDANG', { color: P.amber });
  K.put(21, 14, 'KECEPATAN: CEPAT', { inv: true, color: P.hi });

  // kesimpulan
  if (t > W('awan', 'keduanya') - 0.1) {
    K.put(1, 22, 'KEDUA-DUANYA PAKAI. Kombinasi terbaik.', { color: P.hi, chars: K.typed(t, W('awan', 'keduanya') - 0.1, 36) });
    K.cursor(1 + Math.floor(K.typed(t, W('awan', 'keduanya') - 0.1, 36)), 22, t);
  }
  K.put(1, 26, 'Awan aman, lokal cepat. Pakai keduanya.', { color: P.g, chars: K.typed(t, a + 0.3, 32) });
});

// 5. Cek rutin — kalender Jumat.
shot('cek', (t, a, b) => {
  statusBar(t, 'SCHEDULE');
  // kalender
  K.box(1, 3, 20, 12, { color: P.dim, title: 'KALENDER BACKUP' });
  K.put(2, 4, 'SEN SEL RAB KAM JUM SAB MIN', { color: P.dim });
  const weeks = [
    [' 1', ' 2', ' 3', ' 4', ' 5', ' 6', ' 7'],
    [' 8', ' 9', '10', '11', '12', '13', '14'],
    ['15', '16', '17', '18', '19', '20', '21'],
    ['22', '23', '24', '25', '26', '27', '28'],
  ];
  weeks.forEach((wk, wi) => {
    wk.forEach((d, di) => {
      const isFriday = di === 4;
      const isPast = wi * 7 + di < Math.floor(clamp((t - a) / 3) * 28);
      K.put(2 + di * 5, 5 + wi, d, { color: isFriday ? (blink(t, 3) ? P.hi : P.amber) : (isPast ? P.g : P.dim) });
      if (isFriday && isPast) K.put(2 + di * 5, 6, '<<', { color: P.amber });
    });
  });

  // jadwal
  K.box(23, 3, 13, 12, { color: P.dim, title: 'CEK RUTIN' });
  const tasks = [
    ['SEN', 'Upload awal'],
    ['JUM', 'Cek & sync'],
    ['MIN', 'Verify restore'],
  ];
  tasks.forEach(([day, desc], i) => {
    const done = clamp((t - a - i * 0.4) / 0.5) > 0;
    K.put(24, 4 + i * 2, done ? '[v] ' + day : '[ ] ' + day, { color: done ? P.hi : P.dim });
    K.put(29, 4 + i * 2, desc, { color: done ? P.hi : P.dim, chars: done ? Infinity : Math.floor(K.typed(t, a + i * 0.4, 15)) });
  });

  // hasil cek
  if (t > W('cek', 'Jumat') - 0.1) {
    K.put(1, 20, 'JADWAL: SETIAP JUMAT JAM 6 SORE.', { color: P.hi, chars: K.typed(t, W('cek', 'Jumat') - 0.1, 30) });
    K.cursor(1 + Math.floor(K.typed(t, W('cek', 'Jumat') - 0.1, 30)), 20, t);
  }
  K.put(1, 26, 'Backup terjadwal = pikiran tenang.', { color: P.g, chars: K.typed(t, a + 0.3, 32) });
});

export function render(t, AM) {
  K.clear();
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  s.fn(t, Math.max(0, a), b);
  const since = t - Math.max(0, a);
  const glitch = s.id !== 'hilang' && since < 0.22 ? 1 - since / 0.22 : 0;
  const end = AM.duration - 0.5;
  const power = t < end ? 1 : 1 - clamp((t - end) / 0.4);
  K.present(out, t, { glitch, power, seed: 7 });
}