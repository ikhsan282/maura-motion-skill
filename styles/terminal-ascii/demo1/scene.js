// Terminal ASCII demo: "Virus yang Mencantumkan Alamat Pembuatnya" (Brain, 1986) — 5 screens, ~20 s.
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
  AM.sfx('glitch', C.brain.start - 0.1, { gain: 0.35 });
  AM.sfx('typewriter', C.pesan.start, { gain: 0.3 });
  AM.sfx('ding', W('pesan', 'nomor'), { gain: 0.25, pitch: 1.3 });
  AM.sfx('glitch', C.sebar.start - 0.1, { gain: 0.3, pitch: 0.8 });
  AM.sfx('thud', W('masih', 'diketuk'), { gain: 0.45, pitch: 1.6 });
  AM.sfx('thud', W('masih', 'diketuk') + 0.22, { gain: 0.45, pitch: 1.6 });
  AM.sfx('glitch', AM.duration - 0.55, { gain: 0.3, pitch: 0.6 });
}

// the real message stored in Brain's boot sector (as documented)
const MSG = [
  'Welcome to the Dungeon',
  '(c) 1986 Basit & Amjad (pvt) Ltd.',
  'BRAIN COMPUTER SERVICES',
  '730 NIZAM BLOCK ALLAMA IQBAL',
  'TOWN LAHORE-PAKISTAN',
  'PHONE :430791,443248,280530.',
  'Beware of this VIRUS....',
  'Contact us for vaccination....',
];
const BYTES = '\xEB\x34\x90(c) Brain\x00\x00Welcome to the Dungeon (c) 1986 Basit & Amjad (pvt) Ltd. BRAIN COMPUTER SERVICES 730 NIZAM BLOCK ALLAMA IQBAL TOWN LAHORE-PAKISTAN PHONE :430791,443248,280530. Beware of this VIRUS.... Contact us for vaccination....\x00\x00\xFA\x33\xC0';
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const blink = (t, hz = 3) => Math.floor(t * hz * 2) % 2 === 0;
function statusBar(t, label) {
  K.put(1, 1, (' A:\\ ' + label).padEnd(25) + ' 640K ', { inv: true, color: P.dim });
  K.put(1, 34, 'C:\\> _  BOOT  ' + String(Math.floor(t * 10) % 10) + '  DISK A: [*]', { color: P.faint });
}

// 1. A debugger on the boot sector: the hex dump scrolls to an address; "1986" in block letters.
shot('hook', (t, a, b) => {
  statusBar(t, 'DEBUG.COM');
  K.command(1, 3, 'A:\\>', 'DEBUG BOOT.SEC', t, -0.5, { cps: 16 });
  const scroll = Math.floor(clamp(t / 3.6) * 18);
  const addrA = BYTES.indexOf('730'), addrB = BYTES.indexOf('PAKISTAN') + 8, namA = BYTES.indexOf('Basit'), namB = namA + 13;
  const hl = [];
  if (t > W('hook', 'bersaudara') - 0.1) hl.push([namA, namB, P.g]);
  if (t > W('hook', 'alamat') - 0.1) hl.push([addrA, addrB, blink(t, 4) ? P.hi : P.g]);
  K.hexDump(2, 5, BYTES, { offset: 0x7c00, rows: 10, start: Math.min(scroll, 18) * 6 + 6, hl });
  const big = K.bigText('1986', { sx: 2, sy: 2, gap: 2 });
  K.art(4, 15, big, { color: (i) => (i < 4 ? P.hi : P.g), reveal: Math.floor(t * 30) });
  if (t > W('hook', 'alamat') - 0.1) {
    K.box(1, 26 - 1, 34, 3, { color: P.g, title: 'ALAMAT PEMBUAT' });
    K.put(3, 26, '730 NIZAM BLOCK, LAHORE', { color: blink(t, 3) ? P.hi : P.g });
  }
});

// 2. "BRAIN" glitches in over a 5.25" floppy whose boot sector gets infected.
shot('brain', (t, a, b) => {
  statusBar(t, 'DIR A:');
  const big = K.bigText('BRAIN', { sx: 2, sy: 2, gap: 1 });
  const g = ease.outCubic(clamp((t - a) / 0.5));
  K.art(1, 2, big.map((s, i) => (hrand(i, Math.floor(t * 20)) < 1 - g ? s.split('').map((c, k) => (c !== ' ' && hrand(i, k, Math.floor(t * 20)) < 0.5 ? '01'[k % 2] : c)).join('') : s)), { color: (i) => (i < 4 ? P.hi : P.g) });
  K.put(1, 13, 'LABEL VOLUME: (c)Brain', { color: P.dim, chars: K.typed(t, a + 0.3, 40) });
  if (t > W('brain', 'pertama') - 0.2) { K.put(1, 14, 'VIRUS PC PERTAMA*', { inv: true, color: P.hi }); K.put(19, 14, '*IBM PC', { color: P.dim }); }
  const fl = K.ART.floppy.map((s, i) => (i === 7 ? ['|         ( () )         |', '|         ( <> )         |', '|         ( )( )         |'][Math.floor(t * 8) % 3] : s));
  K.art(5, 15, fl.slice(0, 9).concat(fl.slice(12)), { color: P.g });
  const inf = clamp((t - a - 0.4) / 2.6);
  K.put(1, 25, 'INFEKSI BOOT SEKTOR', { color: P.dim });
  K.progress(1, 26, 26, inf, { color: inf >= 1 ? P.hi : P.g });
});

// 3. The message, decoded: name, address and phone numbers light up as they are spoken.
shot('pesan', (t, a, b) => {
  statusBar(t, 'TYPE BOOT.TXT');
  K.box(0, 3, 36, 11, { color: P.dim, title: 'BOOT SEKTOR' });
  let n = K.typed(t, a + 0.05, 70);
  const tn = W('pesan', 'nama') - 0.1, ta = W('pesan', 'alamat') - 0.1, tp = W('pesan', 'nomor') - 0.1;
  MSG.forEach((s, i) => {
    const vis = Math.max(0, n); n -= s.length;
    let inv = false, color = P.g;
    if (i === 1 && t > tn) inv = true;
    if ((i === 3 || i === 4) && t > ta) inv = true;
    if (i === 5 && t > tp) { inv = true; color = blink(t, 4) ? P.hi : P.amber; }
    K.put(1, 4 + i, s, { chars: vis, inv, color: inv ? color : (i === 0 ? P.hi : P.g) });
  });
  // the three pieces, pulled out as a "record"
  const rows = [['NAMA   ', 'BASIT & AMJAD', tn], ['ALAMAT ', '730 NIZAM BLOCK', ta], ['       ', 'LAHORE, PAKISTAN', ta + 0.2], ['TELP   ', '430791 443248', tp], ['       ', '280530', tp + 0.15]];
  rows.forEach(([k, v, tt], i) => { if (t > tt) { K.put(1, 16 + i * 2, k, { color: P.dim }); K.put(9, 16 + i * 2, v, { color: i >= 3 ? P.amber : P.hi, chars: K.typed(t, tt, 40) }); } });
  K.cursor(1, 26, t);
});

// 4. Pirated disks carry it around the world.
shot('sebar', (t, a, b) => {
  statusBar(t, 'NETWORK? NO. DISKS.');
  const map = K.asciiDraw(36, 13, (g, w, h) => K.drawWorld(g, w, h), { key: 'world', ramp: ' .:%#' });
  K.art(0, 3, map, { color: P.dim });
  const LH = [0.68, 0.33], targets = [[0.47, 0.18, 'UK'], [0.2, 0.28, 'USA'], [0.86, 0.26, ''], [0.52, 0.55, ''], [0.3, 0.68, ''], [0.86, 0.68, ''], [0.6, 0.18, '']];
  const p = clamp((t - a - 0.2) / 2.6);
  const toCell = ([x, y]) => [Math.round(x * 36), 3 + Math.round(y * 13)];
  targets.forEach(([x, y, lab], i) => {
    const q = clamp(p * 1.6 - i * 0.12);
    if (q <= 0) return;
    const steps = 14;
    for (let s = 0; s <= Math.floor(q * steps); s++) {
      const u = s / steps, mx = lerp(LH[0], x, u), my = lerp(LH[1], y, u) - Math.sin(u * Math.PI) * 0.12;
      const [c, r] = toCell([mx, my]); K.put(c, r, s === Math.floor(q * steps) && q < 1 ? '@' : '.', { color: P.g });
    }
    if (q >= 1) { const [c, r] = toCell([x, y]); K.put(c, r, blink(t + i * 0.2, 3) ? '*' : '+', { color: P.hi }); if (lab) K.put(c + 1, r, lab, { inv: true, color: P.g }); }
  });
  const [lc, lr] = toCell(LH);
  K.put(lc, lr, '@', { color: blink(t, 4) ? P.hi : P.g }); K.put(lc + 1, lr + 1, 'LAHORE', { inv: true, color: P.hi });
  // disks multiplying
  const nd = Math.min(30, Math.floor(clamp((t - a) / 2.8) * 30));
  K.put(1, 17, 'COPY DISKET BAJAKAN...', { color: P.dim });
  for (let i = 0; i < nd; i++) K.put(1 + (i % 10) * 3 + 2, 19 + Math.floor(i / 10) * 2, '[#]', { color: i === nd - 1 ? P.hi : P.g });
  K.put(1, 26, 'TERSEBAR: ' + 'KELILING DUNIA'.slice(0, Math.floor(p * 14) + 1), { color: P.hi });
});

// 5. 25 years later: someone knocks at 730 Nizam Block. The door opens. They are still there.
function street(g, w, h, t, walk, open, people) {
  g.globalAlpha = 0.28; g.fillRect(6, 4, 28, 28); g.globalAlpha = 1;
  g.fillRect(6, 4, 28, 4);                         // sign band
  g.fillStyle = '#000'; for (const x of [9, 26]) g.fillRect(x, 12, 5, 6);
  g.fillRect(16, 16, 9, 16);                        // doorway
  if (open > 0) { g.fillStyle = '#fff'; g.globalAlpha = 0.95; g.fillRect(16, 16, 9, 16); g.globalAlpha = 1; g.fillStyle = '#000'; g.fillRect(16, 16, Math.round(9 * (1 - open)), 16); }
  g.fillStyle = '#fff'; g.globalAlpha = 0.3; g.fillRect(0, 31, w, 1); g.globalAlpha = 1;
  const fig = (x, y, s, ph) => { g.beginPath(); g.arc(x, y - 9 * s, 1.6 * s, 0, 7); g.fill(); g.lineWidth = 1.3 * s; g.beginPath(); g.moveTo(x, y - 7 * s); g.lineTo(x, y - 3 * s); g.lineTo(x - 1.5 * s + ph, y); g.moveTo(x, y - 3 * s); g.lineTo(x + 1.5 * s - ph, y); g.moveTo(x - 2 * s, y - 6 * s); g.lineTo(x + 2 * s, y - 5 * s); g.stroke(); };
  g.fillStyle = '#fff'; g.strokeStyle = '#fff';
  fig(lerp(-2, 12, walk), 31, 1.35, walk < 1 ? Math.sin(t * 12) * 1.2 : 0);
  if (people > 0) { g.globalAlpha = people; g.fillStyle = '#000'; g.strokeStyle = '#000'; fig(18.5, 31, 0.95, 0); fig(22.5, 31, 0.95, 0); g.globalAlpha = 1; }
}
shot('masih', (t, a, b) => {
  statusBar(t, 'LAHORE.TXT');
  K.put(1, 3, '+25 TAHUN', { inv: true, color: P.g }); K.put(12, 3, 'TAHUN 2011', { color: P.hi, chars: K.typed(t, a + 0.2, 30) });
  const kn = W('masih', 'diketuk'), mr = W('masih', 'Mereka');
  const walk = clamp((t - a - 0.2) / Math.max(0.5, kn - a - 0.4));
  const open = clamp((t - mr + 0.2) / 0.4), people = clamp((t - mr) / 0.3);
  const fr = Math.floor(t * 12);
  const pic = K.asciiDraw(36, 16, (g, w, h) => street(g, w, h, fr / 12, walk, open, people), { key: 'street', t: fr });
  K.art(0, 5, pic, { color: P.g });
  K.put(7, 5, '730 NIZAM BLOCK', { inv: true, color: P.hi });
  if (t > kn && t < mr) K.put(2, 11, Math.floor((t - kn) / 0.22) % 2 ? 'TOK!' : 'TOK!  TOK!', { color: P.amber });
  if (t > mr) {
    K.put(1, 21, '> BASIT & AMJAD:', { color: P.dim });
    K.put(1, 23, 'MASIH DI SINI.', { color: P.hi, chars: K.typed(t, W('masih', 'masih') - 0.1, 22) });
    K.cursor(1 + Math.min(14, Math.floor(K.typed(t, W('masih', 'masih') - 0.1, 22))), 23, t);
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
  K.present(out, t, { glitch, power, seed: 3 });
}
