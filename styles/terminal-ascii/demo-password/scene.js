// Terminal ASCII demo: "Password 123456" — 5 screens, ~20-30 s.
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
  AM.sfx('glitch', C.crack.start - 0.1, { gain: 0.35 });
  AM.sfx('typewriter', C.kuat.start, { gain: 0.3 });
  AM.sfx('ding', W('dua', 'ganda'), { gain: 0.25, pitch: 1.3 });
  AM.sfx('thud', W('ganti', 'sekarang'), { gain: 0.45, pitch: 1.4 });
  AM.sfx('glitch', AM.duration - 0.55, { gain: 0.3, pitch: 0.6 });
}

const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const blink = (t, hz = 3) => Math.floor(t * hz * 2) % 2 === 0;
function statusBar(t, label) {
  K.put(1, 1, (' C:\\> ' + label).padEnd(25) + ' 640K ', { inv: true, color: P.dim });
  K.put(1, 34, 'LOGIN.EXE  ********  TRY ' + String(Math.floor(t * 10) % 10), { color: P.faint });
}

// 1. The world's most popular password, typed in.
shot('hook', (t, a, b) => {
  statusBar(t, 'LOGIN.EXE');
  K.command(1, 3, 'C:\\>', 'LOGIN -u admin', t, -0.5, { cps: 16 });
  K.put(1, 5, 'PASSWORD:', { color: P.dim });
  const pw = '123456';
  const n = Math.floor(K.typed(t, a + 0.5, 4));
  K.put(11, 5, '*'.repeat(Math.min(n, 6)) + (n < 6 && blink(t) ? '_' : ''), { color: P.hi });
  if (n >= 6) {
    const big = K.bigText('123456', { sx: 2, sy: 2, gap: 1 });
    K.art(1, 8, big, { color: (i) => (i < 4 ? P.amber : P.red), reveal: Math.floor(t * 30) });
    K.put(1, 20, 'PASSWORD PALING POPULER*', { inv: true, color: P.red });
    K.put(1, 22, '*dipakai jutaan orang', { color: P.dim });
  }
  K.put(1, 26, 'RANK #1 DUNIA', { color: P.dim });
});

// 2. Brute force cracks it in seconds: attempts counter explodes, bar fills.
shot('crack', (t, a, b) => {
  statusBar(t, 'CRACK.EXE');
  const p = clamp((t - a - 0.2) / 2.6);
  const tries = Math.floor(p * p * 999999);
  K.put(1, 3, 'BRUTE FORCE...', { color: P.dim });
  K.put(1, 5, 'TRY: ' + String(tries).padStart(6, '0'), { color: P.amber, chars: 20 });
  K.put(1, 7, 'TARGET: 123456', { color: P.hi });
  K.progress(1, 9, 30, p, { color: p >= 1 ? P.red : P.amber });
  const secs = (p * 2.9).toFixed(1);
  K.put(1, 11, 'WAKTU: ' + secs + ' DETIK', { color: p >= 1 ? P.red : P.g });
  if (p >= 1) {
    K.box(1, 14, 32, 5, { color: P.red, title: 'JEBOL' });
    K.put(3, 16, 'ACCESS GRANTED ' + (blink(t, 4) ? '<' : ' '), { color: P.red });
    K.put(3, 17, '0.3 DETIK SAJA', { inv: true, color: P.hi });
  }
  // password list being tried
  const cands = ['123456', 'password', 'qwerty', 'abc123', 'letmein'];
  cands.forEach((c, i) => {
    if (p * 5 > i) K.put(1, 21 + i, (c === '123456' ? '> ' : '  ') + c + (c === '123456' && p >= 1 ? '  <-- INI!' : ''), { color: c === '123456' ? P.red : P.faint });
  });
});

// 3. Strong password: mixed letters, numbers, symbols; entropy meter.
shot('kuat', (t, a, b) => {
  statusBar(t, 'GENPASS.EXE');
  const strong = 'Tr7#kQ!9z$2mX';
  const n = Math.floor(K.typed(t, a + 0.2, 14));
  K.put(1, 3, 'PASSWORD KUAT:', { color: P.dim });
  K.put(1, 5, strong.slice(0, n) + (n < strong.length && blink(t) ? '_' : ''), { color: P.hi });
  const rows = [['HURUF  ', 'AaBbCc...', W('kuat', 'huruf') - 0.1, P.g], ['ANGKA  ', '019283...', W('kuat', 'angka') - 0.1, P.g], ['SIMBOL ', '#$!@?%...', W('kuat', 'simbol') - 0.1, P.g]];
  rows.forEach(([k, v, tt, c], i) => { if (t > tt) { K.put(1, 8 + i * 2, k, { color: P.dim }); K.put(9, 8 + i * 2, v, { color: c, chars: K.typed(t, tt, 30) }); } });
  const p = clamp((t - a - 1.2) / 2.0);
  K.put(1, 15, 'KOMBINASI ACAK', { color: P.dim });
  K.progress(1, 16, 30, p, { color: P.g });
  K.put(1, 18, 'TEBAKAN: ' + (p >= 1 ? 'JUTAAN TAHUN' : Math.floor(p * 999) + '...'), { color: p >= 1 ? P.hi : P.amber });
  if (p >= 1) { K.put(1, 21, '12+ KARAKTER = AMAN', { inv: true, color: P.g }); K.put(1, 23, 'JANGAN PAKAI TANGGAL LAHIR', { color: P.dim }); }
  K.cursor(1, 26, t);
});

// 4. 2FA: a second lock, phone code arrives.
shot('dua', (t, a, b) => {
  statusBar(t, '2FA.EXE');
  const code = '482 916';
  const ct = W('dua', 'dua') - 0.1;
  K.put(1, 3, 'KUNCI GANDA: PASSWORD + HP', { color: P.dim });
  // two locks
  K.put(2, 6, '[####]', { color: P.g });
  K.put(2, 7, '[#pw#]', { color: P.g });
  K.put(2, 8, '[####]', { color: P.g });
  const p2 = clamp((t - ct - 0.6) / 1.2);
  const lx = Math.round(lerp(24, 12, p2));
  K.put(lx, 6, '[####]', { color: p2 >= 1 ? P.hi : P.amber });
  K.put(lx, 7, '[SMS#]', { color: p2 >= 1 ? P.hi : P.amber });
  K.put(lx, 8, '[####]', { color: p2 >= 1 ? P.hi : P.amber });
  if (t > ct) {
    K.box(1, 11, 30, 5, { color: P.dim, title: 'SMS MASUK' });
    K.put(3, 13, 'KODE: ' + code.slice(0, Math.floor(K.typed(t, ct + 0.4, 8))), { color: P.hi });
  }
  if (p2 >= 1) {
    K.put(1, 18, 'MALING BUTUH HP-MU JUGA', { color: P.g });
    K.put(1, 20, 'AKTIFKAN SEKARANG', { inv: true, color: blink(t, 3) ? P.hi : P.g });
  }
  K.put(1, 26, '2FA = LAPIS KEDUA', { color: P.dim });
});

// 5. Change it now: 123456 deleted, replaced.
shot('ganti', (t, a, b) => {
  statusBar(t, 'PASSWD.EXE');
  K.command(1, 3, 'C:\\>', 'passwd --change', t, a, { cps: 18 });
  const del = clamp((t - a - 0.8) / 0.8);
  const old = '123456';
  const vis = old.slice(0, Math.max(0, 6 - Math.floor(del * 7)));
  K.put(1, 6, 'LAMA : ' + vis + (del < 1 && blink(t, 5) ? '_' : ''), { color: P.red });
  if (del >= 1) K.put(9, 6, '[HAPUS!]', { inv: true, color: P.red });
  const nt = W('ganti', 'password') - 0.1;
  if (t > nt) {
    const nn = 'K4t4$4nd1*R4h4s1a';
    K.put(1, 9, 'BARU : ' + nn.slice(0, Math.floor(K.typed(t, nt, 12))), { color: P.hi });
  }
  const done = W('ganti', 'sekarang') - 0.1;
  if (t > done) {
    const big = K.bigText('AMAN', { sx: 2, sy: 2, gap: 1 });
    K.art(4, 13, big, { color: () => blink(t, 3) ? P.hi : P.g, reveal: Math.floor(t * 30) });
    K.put(1, 23, 'GANTI SEKARANG.', { color: P.hi, chars: K.typed(t, done, 22) });
    K.cursor(1 + Math.min(14, Math.floor(K.typed(t, done, 22))), 23, t);
  }
});

export function render(t, AM) {
  K.clear();
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  s.fn(t, Math.max(0, a), b);
  const since = t - Math.max(0, a);
  const glitch = s.id !== 'hook' && since < 0.22 ? 1 - since / 0.22 : 0;
  const end = AM.duration - 0.5;
  const power = t < end ? 1 : 1 - clamp((t - end) / 0.4);
  K.present(out, t, { glitch, power, seed: 7 });
}
