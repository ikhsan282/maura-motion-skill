// Demo 3 — Kepanikan Bug Y2K Tahun 2000 (Millennium Bug)
// Terminal ASCII CRT Hijau Fosfor (monokrom, 36x40 grid, SAFE_ROWS=28)

import * as K from '/styles/terminal-ascii/kit.js';

const { clamp } = AM.lib;
const P = K.PAL;

export const meta = {
  fps: 24,
  captions: { preset: 'terminal', y: 1470, size: 70, maxWords: 4 },
};

let out, worldArt;
const C = {};

const smooth = (a, b, t) => {
  const x = clamp((t - a) / Math.max(0.001, b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

const COBOL_DATE_HEX =
  '12/31/99\x0001/01/00\x00PIC 9(2)\x00ERR:-99YR_OVERFLOW_1900\x00PATCH_YYYY_2000_OK\x00';

function drawHeader(title, rightText = 'RTC-Y2K') {
  K.put(0, 0, ' '.repeat(K.COLS), { inv: true, color: P.g });
  K.put(1, 0, title, { inv: true, color: P.g });
  K.put(K.COLS - rightText.length - 1, 0, rightText, { inv: true, color: P.g });
}

export async function setup(AM) {
  out = AM.layer('crt', { autoClear: false });
  K.screen();
  for (const l of AM.timeline.lines) C[l.id] = l;
  worldArt = K.asciiDraw(32, 10, (g, w, h) => K.drawWorld(g, w, h), {
    key: 'worldY2K',
    ramp: ' .:%#',
  });
}

function activeLine(t) {
  let cur = AM.timeline.lines[0];
  for (const l of AM.timeline.lines) {
    if (t >= l.start - 0.12) cur = l;
  }
  const dur = Math.max(0.2, cur.end - cur.start);
  const lt = Math.max(0, t - cur.start);
  const u = clamp(lt / dur, 0, 1);
  return { id: cur.id, u, lt, a: cur.start };
}

export function render(t, AM) {
  const { id, u, a } = activeLine(t);

  K.clear();

  let glitch = id !== 'hook' && t - a < 0.2 ? 1 - (t - a) / 0.2 : 0;
  let flicker = 0.03;

  if (id === 'hook') {
    drawHeader('MILLENNIUM COUNTDOWN // BIOS', '31-DEC-99');
    const big = K.bigText('Y2K', { sx: 2, sy: 2, gap: 2 });
    K.art(6, 2, big, { color: (i) => (i < 4 ? P.hi : P.g) });

    K.box(1, 13, 34, 13, { color: P.amber, title: 'CRITICAL ROLLOVER ALERT', double: true });
    const sec = Math.min(59, 55 + Math.floor(u * 5));
    K.put(3, 15, `DATE : 1999-12-31  23:59:${String(sec).padStart(2, '0')}`, {
      color: P.hi,
    });
    K.put(3, 17, 'YEAR REGISTER : [ 9 | 9 ] (2-DIGIT)', { color: P.amber });
    K.put(3, 19, 'NEXT TICK     : [ 0 | 0 ] -> 1900?', { color: P.hi, inv: true });
    K.put(3, 21, 'SYSTEMS : BANK / POWER / AVIATION', { color: P.g });
    K.put(3, 23, 'STATUS  : AWAITING MIDNIGHT...', { color: P.amber });
  } else if (id === 'hemat') {
    drawHeader('LEGACY MEMORY // 1960s-1970s', '80-COL');
    K.box(1, 2, 34, 9, { color: P.g, title: 'COBOL DATA DIVISION (1972)' });
    K.put(3, 4, '01 BIRTH-DATE.', { color: P.g });
    K.put(3, 5, '   05 DD-DAY   PIC 9(2).', { color: P.dim });
    K.put(3, 6, '   05 MM-MONTH PIC 9(2).', { color: P.dim });
    K.put(3, 7, '   05 YY-YEAR  PIC 9(2).  <-- !!', { color: P.amber });
    K.put(3, 9, '/* SAVED 2 BYTES PER RECORD */', { color: P.hi });

    K.art(2, 12, K.ART.floppy.slice(0, 12), { color: P.g });
    K.box(18, 12, 17, 13, { color: P.dim, title: 'BYTE SAVINGS' });
    K.put(20, 14, '"1975" = 4 B', { color: P.dim });
    K.put(20, 15, '  "75" = 2 B', { color: P.hi });
    K.put(20, 17, '10M RECORDS:', { color: P.g });
    K.put(20, 18, 'SAVE 20 MB', { color: P.amber });
    K.put(20, 20, 'RAM MAHAL DI', { color: P.dim });
    K.put(20, 21, 'ERA MAINFRAME', { color: P.dim });
  } else if (id === 'masalah') {
    glitch = Math.max(glitch, smooth(0.45, 0.8, u) * 0.45);
    drawHeader('INTEGER ROLLOVER // 99 -> 00', 'OVERFLOW');

    const isZero = u > 0.48;
    const big = K.bigText(isZero ? '00' : '99', { sx: 3, sy: 2, gap: 2 });
    K.art(8, 2, big, { color: isZero ? P.amber : P.hi });

    K.box(1, 12, 34, 14, {
      color: isZero ? P.amber : P.g,
      title: 'DATE ARITHMETIC FAULT',
      double: true,
    });
    K.put(3, 14, 'STORED YEAR : ' + (isZero ? '00' : '99'), { color: P.hi });
    K.put(3, 15, 'PREFIX ASSUMED BY CODE : "19"', { color: P.dim });
    if (!isZero) {
      K.put(3, 17, 'INTERPRETED AS : 1999 [VALID]', { color: P.g });
    } else {
      K.put(3, 17, 'INTERPRETED AS : 1900 [ERROR!]', { color: P.hi, inv: true });
      K.put(3, 19, 'AGE CALC : 00 - 75 = -75 YEARS!', { color: P.amber });
    }
    K.hexDump(2, 21, COBOL_DATE_HEX, {
      offset: 0x0200,
      rows: 4,
      start: 0,
      hl: [[0, 16, P.hi]],
      per: 6,
    });
  } else if (id === 'dampak') {
    glitch = Math.max(glitch, 0.22);
    drawHeader('INFRASTRUCTURE RISK SIMULATION', 'WARN');
    K.box(1, 2, 34, 7, { color: P.amber, title: '1. BANKING & INTEREST' });
    K.put(3, 4, 'LOAN 1999 -> 1900 = -99 YEARS', { color: P.amber });
    K.put(3, 5, 'COMPOUND INTEREST : NaN / OVERFLOW', { color: P.hi });

    K.box(1, 10, 34, 7, { color: P.g, title: '2. POWER GRID & SCADA' });
    K.put(3, 12, 'MAINTENANCE TIMER : EXPIRED 99 YRS', { color: P.g });
    K.put(3, 13, 'SAFETY SHUTDOWN   : TRIGGERED', { color: P.amber });

    K.box(1, 18, 34, 7, { color: P.amber, title: '3. AVIATION SCHEDULE' });
    K.put(3, 20, 'FLIGHT LOG 01-JAN-00 : INVALID DAY', { color: P.g });
    K.put(3, 21, 'RADAR SYNC : TIMESTAMP MISMATCH', { color: P.hi, inv: true });
  } else if (id === 'lembur') {
    drawHeader('OPERATION COBOL REMEDIATION', 'PATCHING');
    K.art(1, 2, K.ART.pc, { color: P.g });
    K.box(18, 2, 17, 10, { color: P.g, title: 'CODE AUDIT' });
    K.put(20, 4, 'LANG: COBOL/C', { color: P.hi });
    K.put(20, 6, 'LINES SCANNED:', { color: P.dim });
    const linesB = Math.floor(smooth(0.1, 0.9, u) * 250);
    K.put(20, 7, `${linesB} BILLION`, { color: P.amber });
    K.put(20, 9, '4-DIGIT PATCH', { color: P.g });

    K.box(1, 13, 34, 8, { color: P.hi, title: 'DIFF PATCH // DATE FIELD' });
    K.put(3, 15, '- 05 YY-YEAR  PIC 9(2).  [YY]', { color: P.amber });
    K.put(3, 17, '+ 05 YYYY-YR  PIC 9(4).  [YYYY]', { color: P.hi });
    K.put(3, 19, 'STATUS: EXPANDED TO 1999 -> 2000', { color: P.g });

    K.progress(1, 22, 34, smooth(0.1, 0.95, u), {
      color: P.g,
      label: 'PATCHING GLOBAL MAINFRAMES',
    });
  } else if (id === 'biaya') {
    drawHeader('GLOBAL Y2K REMEDIATION COST', 'FINANCE');
    const big = K.bigText('300B', { sx: 2, sy: 2, gap: 1 });
    K.art(3, 2, big, { color: (i) => (i < 4 ? P.hi : P.g) });

    K.box(1, 13, 34, 13, { color: P.g, title: 'WORLDWIDE INVESTMENT LOG', double: true });
    K.put(3, 15, 'ESTIMATED COST   : $300 BILLION', { color: P.hi });
    K.put(3, 17, 'BANKING SECTOR   : [##########] OK', { color: P.g });
    K.put(3, 19, 'TELECOM & ENERGY : [##########] OK', { color: P.g });
    K.put(3, 21, 'GOVERNMENT & AIR : [##########] OK', { color: P.g });
    K.put(3, 23, 'FORMAT UPGRADE   : DD/MM/YYYY', { color: P.amber });
  } else if (id === 'malam') {
    drawHeader('01 JAN 2000 // 00:00:00 UTC', 'ROLLOVER');
    const big = K.bigText('2000', { sx: 2, sy: 2, gap: 1 });
    K.art(3, 2, big, { color: P.hi });

    K.box(1, 12, 34, 11, { color: P.g, title: 'WORLD TIMEZONE MONITOR' });
    K.art(2, 13, worldArt, { color: P.g });

    K.put(2, 24, '[OK] POWER GRID & ATM : 100% NOMINAL', { color: P.hi, inv: true });
  } else {
    drawHeader('POST-MORTEM // UNSUNG HEROES', 'RESOLVED');
    K.box(1, 2, 34, 24, { color: P.g, title: 'WHY NOTHING CRASHED', double: true });
    K.put(3, 5, 'MITOS  : "Bug Y2K cuma kehebohan!"', { color: P.amber });
    K.put(3, 7, 'FAKTA  : Bencana batal terjadi', { color: P.hi });
    K.put(3, 8, '         karena jutaan jam kerja', { color: P.hi });
    K.put(3, 9, '         para teknisi & programmer', { color: P.hi });
    K.put(3, 10, '         sebelum tengah malam.', { color: P.hi });

    K.put(3, 13, 'NEXT UNIX EPOCH ROLLOVER:', { color: P.dim });
    K.put(3, 14, 'YEAR 2038 (32-BIT SIGNED INT)', { color: P.amber });
    K.put(3, 15, '19 JAN 2038 03:14:07 UTC', { color: P.dim });

    K.command(3, 19, 'root@y2k:~# ', 'echo "THANK YOU ENGINEERS"', t, a + 0.2, {
      cps: 18,
      color: P.hi,
    });
    if (u > 0.45) {
      K.put(3, 21, 'THANK YOU ENGINEERS', { color: P.g, inv: true });
    }
  }

  const end = AM.duration - 0.5;
  const power = t < end ? 1 : 1 - clamp((t - end) / 0.4, 0, 1);
  K.present(out, t, { glitch, flicker, power, seed: 2000 });
}
