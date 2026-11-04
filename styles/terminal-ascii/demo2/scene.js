// Demo 2 — Pesan Pertama di Internet 1969 (ARPANET "LO" Crash)
// Terminal ASCII CRT Hijau Fosfor (monokrom, 36x40 grid, SAFE_ROWS=28)

import * as K from '/styles/terminal-ascii/kit.js';

const { clamp, lerp } = AM.lib;
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

const SIGMA_HEX =
  'LOGIN\r\n\x00UCLA-SRI 50KBPS\x00IMP-01->IMP-02\x00RX_BUF_OVERFLOW_AT_CHAR_G_0x47\x00CORE_DUMP_1969_10_29_2100PST\x00';

function drawHeader(title, rightText = 'ARPA-69') {
  K.put(0, 0, ' '.repeat(K.COLS), { inv: true, color: P.g });
  K.put(1, 0, title, { inv: true, color: P.g });
  K.put(K.COLS - rightText.length - 1, 0, rightText, { inv: true, color: P.g });
}

export async function setup(AM) {
  out = AM.layer('crt', { autoClear: false });
  K.screen();
  for (const l of AM.timeline.lines) C[l.id] = l;
  worldArt = K.asciiDraw(32, 10, (g, w, h) => K.drawWorld(g, w, h), {
    key: 'world69',
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
  const { id, u, lt, a } = activeLine(t);

  K.clear();

  let glitch = id !== 'hook' && t - a < 0.2 ? 1 - (t - a) / 0.2 : 0;
  let flicker = 0.03;

  if (id === 'hook') {
    drawHeader('ARPANET // LOG ARCHIVE', '29-OCT-69');
    K.box(1, 2, 34, 7, { color: P.g, title: 'FIRST PACKET RECORD', double: true });
    K.put(3, 4, 'DATE : 29 OCT 1969  21:00 PST', { color: P.dim });
    K.put(3, 5, 'LINK : UCLA (#1) ---> SRI (#2)', { color: P.g });
    K.put(3, 6, 'PAYLOAD TRANSMITTED:', { color: P.dim });

    const big = K.bigText('LO', { sx: 3, sy: 2, gap: 2 });
    K.art(8, 9, big, {
      color: (i) => (i < 4 ? P.hi : P.g),
      reveal: Math.floor(smooth(0.15, 0.65, u) * 120),
    });

    K.box(1, 20, 34, 7, { color: P.dim, title: 'PACKET SUMMARY' });
    K.put(3, 22, 'EXPECTED : "LOGIN" (5 BYTES)', { color: P.dim });
    K.put(3, 23, 'RECEIVED : "LO"    (2 BYTES)', { color: P.amber });
    K.put(3, 24, 'STATUS   : SYSTEM HALTED', { color: P.hi, inv: true });
  } else if (id === 'ucla') {
    drawHeader('NODE #1: UCLA BOELTER HALL', 'RM 3420');
    K.put(2, 2, 'HOST: SDS SIGMA-7 // IMP #1', { color: P.hi });
    K.put(2, 3, 'OPERATOR: CHARLEY KLINE', { color: P.g });

    K.art(2, 5, K.ART.pc, { color: P.g, reveal: Math.floor(smooth(0.05, 0.5, u) * 200) });
    K.box(20, 5, 15, 10, { color: P.dim, title: 'TELETYPE' });
    K.put(22, 7, 'TTY-33 READY', { color: P.g });
    K.put(22, 9, 'BAUD : 50K', { color: P.dim });
    K.put(22, 10, 'DUPLEX: FULL', { color: P.dim });
    K.put(22, 12, '21:00 PST', { color: P.amber });

    K.command(2, 17, 'sigma7> ', 'init imp --dest=sri', t, a + 0.2, {
      cps: 16,
      color: P.hi,
    });
    if (u > 0.45) {
      K.put(2, 19, '[OK] IMP #1 INTERFACE ONLINE', { color: P.g });
      K.put(2, 20, '[OK] WAITING FOR REMOTE ECHO...', { color: P.dim });
    }
    K.progress(2, 23, 32, smooth(0.15, 0.9, u), {
      color: P.g,
      label: 'INITIALIZING IMP BUFFER',
    });
  } else if (id === 'sri') {
    drawHeader('DEDICATED LINK: 50 KBPS', '500 KM');
    K.box(1, 2, 14, 7, { color: P.g, title: 'NODE 1: UCLA' });
    K.put(3, 4, 'SDS SIGMA-7', { color: P.hi });
    K.put(3, 5, 'LOS ANGELES', { color: P.dim });
    K.put(3, 6, 'IMP #1 [TX]', { color: P.g });

    K.box(21, 2, 14, 7, { color: P.g, title: 'NODE 2: SRI' });
    K.put(23, 4, 'SDS 940', { color: P.hi });
    K.put(23, 5, 'MENLO PARK', { color: P.dim });
    K.put(23, 6, 'IMP #2 [RX]', { color: P.g });

    const pulseCol = 15 + Math.floor(((t * 8) % 1) * 6);
    K.put(15, 5, '======', { color: P.dim });
    K.put(pulseCol, 5, '*', { color: P.hi });

    K.box(1, 10, 34, 16, { color: P.dim, title: 'BACKBONE TOPOLOGY' });
    K.art(2, 12, worldArt, { color: P.dim });
    K.put(3, 23, 'AT&T LEASED LINE // 50,000 BPS', { color: P.amber });
  } else if (id === 'login') {
    drawHeader('VOICE SYNC + REMOTE LOGIN', 'CH-01');
    K.box(1, 2, 34, 8, { color: P.g, title: 'REMOTE TERMINAL SESSION', double: true });
    K.put(3, 4, 'TARGET : SRI-SDS940 (HOST #2)', { color: P.dim });
    K.put(3, 5, 'TASK   : TYPE "LOGIN" CHAR BY CHAR', { color: P.g });
    K.put(3, 7, 'PROMPT : @', { color: P.hi });
    K.cursor(13, 7, t, { color: P.hi });

    K.art(2, 12, K.ART.phone, { color: P.amber });
    K.box(15, 11, 20, 14, { color: P.amber, title: 'VOICE LINE' });
    K.put(17, 13, 'KLINE (UCLA):', { color: P.hi });
    K.put(17, 14, '"Siap ketik LOGIN"', { color: P.g });
    if (u > 0.42) {
      K.put(17, 17, 'DUVALL (SRI):', { color: P.hi });
      K.put(17, 18, '"Monitor siap,', { color: P.g });
      K.put(17, 19, ' silakan ketik!"', { color: P.g });
    }
  } else if (id === 'ketik') {
    drawHeader('STEP-BY-STEP TRANSMISSION', 'ECHO ON');
    K.box(1, 2, 34, 9, { color: P.g, title: 'SRI SDS-940 MONITOR', double: true });

    const hasL = u > 0.12;
    const hasO = u > 0.52;
    const typedStr = hasO ? 'LO' : hasL ? 'L' : '';

    K.put(3, 5, 'REMOTE INPUT > ' + typedStr, { color: P.hi });
    K.cursor(18 + typedStr.length, 5, t, { color: P.hi });

    if (hasL) K.put(3, 7, '[TX 01] CHAR "L" (0x4C) -> ACK OK', { color: P.g });
    if (hasO) K.put(3, 8, '[TX 02] CHAR "O" (0x4F) -> ACK OK', { color: P.g });

    K.box(1, 12, 34, 13, { color: P.dim, title: 'PHONE VERIFICATION LOG' });
    if (hasL) {
      K.put(3, 14, 'KLINE  : "Huruf L sudah masuk?"', { color: P.g });
      K.put(3, 15, 'DUVALL : "Ya! Huruf L tampil!"', { color: P.hi });
    }
    if (hasO) {
      K.put(3, 18, 'KLINE  : "Sekarang huruf O..."', { color: P.g });
      K.put(3, 19, 'DUVALL : "Huruf O juga muncul!"', { color: P.hi });
      K.put(3, 21, 'NEXT   : PRESS KEY [G] (0x47)...', { color: P.amber });
    }
  } else if (id === 'crash') {
    glitch = Math.max(glitch, smooth(0.15, 0.5, u) * 0.75);
    flicker = 0.08;
    drawHeader('!! KERNEL PANIC // SDS-940 !!', 'FAULT');

    K.box(1, 2, 34, 8, { color: P.amber, title: 'BUFFER OVERFLOW EXCEPTION', double: true });
    K.put(3, 4, 'INPUT KEY   : "G" (0x47)', { color: P.amber });
    K.put(3, 5, 'AUTO-EXPAND : "LOGIN\\r\\n"', { color: P.hi });
    K.put(3, 6, 'RX BUFFER   : OVERRUN AT 0x0014', { color: P.amber });
    K.put(3, 7, 'CONNECTION  : TERMINATED', { color: P.hi, inv: true });

    K.put(2, 11, 'CORE DUMP (SDS-940 RX BUFFER):', { color: P.amber });
    K.hexDump(2, 13, SIGMA_HEX, {
      offset: 0x0100,
      rows: 8,
      start: 0,
      hl: [[0, 7, P.hi]],
      per: 6,
    });

    if (Math.floor(t * 4) % 2 === 0) {
      K.put(4, 23, '>>> SYSTEM CRASH AT "LO" <<<', { color: P.hi, inv: true });
    }
  } else if (id === 'bangkit') {
    drawHeader('PATCH & RETRY // 22:30 PST', 'ONLINE');
    K.box(1, 2, 34, 8, { color: P.g, title: 'SDS-940 PATCH APPLIED' });
    K.command(3, 4, 'sri-940# ', 'fix_echo_buffer --sync', t, a + 0.1, {
      cps: 18,
      color: P.g,
    });
    if (u > 0.25) {
      K.put(3, 6, '[OK] BUFFER SIZE PATCHED', { color: P.g });
      K.put(3, 7, '[OK] LINK UCLA <-> SRI RESTORED', { color: P.hi });
    }

    K.box(1, 11, 34, 14, { color: P.hi, title: 'SECOND ATTEMPT (22:30)', double: true });
    const loginChars = Math.floor(smooth(0.25, 0.75, u) * 5);
    const word = 'LOGIN'.slice(0, loginChars);
    K.put(3, 14, 'UCLA > ' + word, { color: P.hi });
    K.cursor(10 + word.length, 14, t, { color: P.hi });

    K.progress(3, 17, 30, smooth(0.25, 0.8, u), {
      color: P.g,
      label: 'TRANSMITTING "LOGIN"',
    });
    if (u > 0.75) {
      K.put(3, 21, 'STATUS: SESSION ESTABLISHED [OK]', { color: P.hi, inv: true });
    }
  } else {
    drawHeader('LO AND BEHOLD // 1969 -> NOW', 'LEGACY');
    const big = K.bigText('LO', { sx: 3, sy: 2, gap: 2 });
    K.art(8, 2, big, { color: (i) => (i < 4 ? P.hi : P.g) });

    K.box(1, 13, 34, 13, { color: P.g, title: 'THE ACCIDENTAL PROPHECY', double: true });
    K.put(3, 15, '"LO" -> "LO AND BEHOLD!"', { color: P.hi });
    K.put(3, 17, 'Pesan 2 huruf yang gagal akibat', { color: P.g });
    K.put(3, 18, 'crash justru menjadi kalimat', { color: P.g });
    K.put(3, 19, 'pembuka era internet modern.', { color: P.g });
    K.put(3, 22, '1969 : 2 NODE (UCLA - SRI)', { color: P.dim });
    K.put(3, 23, 'NOW  : > 5,000,000,000 USERS', { color: P.amber });
  }

  const end = AM.duration - 0.5;
  const power = t < end ? 1 : 1 - clamp((t - end) / 0.4, 0, 1);
  K.present(out, t, { glitch, flicker, power, seed: 1969 });
}
