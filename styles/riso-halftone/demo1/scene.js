// Risograph demo: "Band yang Dipenjara karena Lagu" (Koes Bersaudara, 1965) — 5 printed spreads, ~18 s.
import * as K from '/styles/riso-halftone/kit.js';
const { clamp, lerp, ease, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'comic', y: 1480, size: 72, maxWords: 4 } };

let out;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  out = AM.layer('print', { autoClear: false });
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('paper', 0.05, { gain: 0.4 });
  AM.sfx('stamp', W('hook', 'dipenjara'), { gain: 0.5 });
  AM.sfx('stamp', W('koes', 'terlarang'), { gain: 0.45 });
  AM.sfx('thud', C.bui.start, { gain: 0.5, pitch: 0.7 });
  AM.sfx('typewriter', W('bui', 'tanpa'), { gain: 0.3 });
  AM.sfx('swoosh_up', C.plus.start, { gain: 0.35 });
  AM.sfx('crowd', C.akhir.start + 0.2, { gain: 0.3 });
  AM.sfx('stamp', C.akhir.end + 0.1, { gain: 0.45 });
}
const SHOTS = []; const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const band = (g, t, x0, y, s, { phase = 0 } = {}) => {
  K.musician(g, x0, y, s, 'guitar', t, { phase });
  K.musician(g, x0 + 230 * s / 0.9, y, s, 'vocal', t, { phase: phase + 0.3, sing: Math.abs(Math.sin(t * 5)) });
  K.musician(g, x0 + 460 * s / 0.9, y, s, 'bass', t, { phase: phase + 0.6 });
};

// 1. A gig poster printing itself: yellow burst, blue band, pink 1965 + NGAK NGIK NGOK, then bars slam.
shot('hook', (t, a, b, g) => {
  const lt = t - a;
  K.ink(g, 'yellow', t, (g) => K.burst(g, 540, 820, 1300, { n: 28, rot: lt * 0.05 }));
  // blue pass: band silhouettes (rolled down from the top)
  g.save(); K.passClip(g, ease.inOutCubic(clamp((lt + 0.35) / 0.8)));
  K.ink(g, 'blue', t, (g) => { K.musician(g, 540, 1180, 0.82, 'drums', t, { phase: 0.2 }); band(g, t, 220, 1290, 0.9); });
  K.ink(g, 'blue', t, (g) => { g.fillRect(0, 1290, 1080, 30); }, { tone: 0.5 });
  g.restore();
  // pink pass: 1965 + the three words, one by one
  K.ink(g, 'pink', t, (g) => K.type(g, '1965', 540, 300, { size: 380, font: 'Archivo Black' }), { snap: clamp((lt - 0.4) / 0.3) * 0.6 });
  const words = ['NGAK', 'NGIK', 'NGOK'], wt = W('hook', 'ngak');
  const POS = [[330, 520, -0.1], [690, 640, 0.06], [380, 760, -0.04]];
  words.forEach((w, i) => { const tt = wt + i * 0.17; if (t > tt) { const s = 1 + 0.5 * (1 - ease.outCubic(clamp((t - tt) / 0.15))); K.ink(g, i === 1 ? 'blue' : 'pink', t, (g) => K.type(g, w + (i < 2 ? '-' : '!'), POS[i][0], POS[i][1], { size: 130 * s, font: 'Archivo Black', rot: POS[i][2] })); } });
  // bars on "dipenjara"
  const pt = W('hook', 'dipenjara');
  if (t > pt - 0.1) {
    const p = ease.outBounce(clamp((t - pt + 0.1) / 0.35));
    K.ink(g, 'blue', t, (g) => K.bars(g, 120, 960, lerp(-900, 650, p), lerp(-900, 650, p) + 760, { n: 6, w: 44 }));
    const sp = clamp((t - pt) / 0.2);
    if (sp > 0) { g.save(); g.translate(560, 1120); g.rotate(-0.1); g.scale(lerp(1.7, 1, ease.outCubic(sp)), lerp(1.7, 1, ease.outCubic(sp))); g.fillStyle = K.PAPER; g.fillRect(-330, -105, 660, 210); g.restore(); }
    K.ink(g, 'red', t, (g) => K.stamp(g, 'DIPENJARA!', 560, 1120, sp, { size: 150, rot: -0.1 }));
  }
});

// 2. Koes Bersaudara: four brothers playing, names taped on; a Beatles record; DILARANG.
shot('koes', (t, a, b, g) => {
  const lt = t - a;
  K.ink(g, 'yellow', t, (g) => g.fillRect(0, 980, 1080, 380));
  K.ink(g, 'pink', t, (g) => g.fillRect(0, 980, 1080, 380), { tone: 0.3 });
  K.ink(g, 'blue', t, (g) => { K.musician(g, 820, 1180, 0.62, 'drums', t, { phase: 0.4 }); K.musician(g, 160, 1340, 0.78, 'guitar', t); K.musician(g, 360, 1340, 0.78, 'vocal', t, { phase: 0.3, sing: 1 }); K.musician(g, 560, 1340, 0.78, 'bass', t, { phase: 0.5 }); });
  K.ink(g, 'pink', t, (g) => K.type(g, 'KOES', 540, 240, { size: 300, font: 'Archivo Black' }));
  K.ink(g, 'blue', t, (g) => K.type(g, 'BERSAUDARA', 540, 420, { size: 150, font: 'Bebas Neue', spacing: 10 }));
  const names = [['TONNY', 160, 820], ['YON', 360, 780], ['YOK', 560, 820], ['NOMO', 830, 760]];
  names.forEach(([n, x, y], i) => { if (lt > 0.2 + i * 0.18) K.tape(g, n, x, y, { rot: (i % 2 ? 0.06 : -0.06) }); });
  const bt = W('koes', 'Beatles') - 0.15;
  if (t > bt) {
    const p = ease.outBack(clamp((t - bt) / 0.35));
    g.save(); g.translate(lerp(1300, 860, p), 620); g.rotate(t * 2.5);
    K.ink(g, 'blue', t, (g) => K.record(g, 0, 0, 130));
    K.ink(g, 'pink', t, (g) => { g.beginPath(); g.arc(0, 0, 62, 0, 7); g.fill(); });
    g.restore();
    K.tape(g, 'THE BEATLES', 820, 820, { rot: 0.04, size: 40 });
  }
  const dt = W('koes', 'terlarang') - 0.05;
  if (t > dt) K.ink(g, 'red', t, (g) => K.stamp(g, 'MUSIK BARAT: DILARANG', 420, 560, clamp((t - dt) / 0.2), { size: 78, rot: -0.08 }));
});

// 3. Glodok: behind bars, three months counted in tally marks; "tanpa pengadilan".
shot('bui', (t, a, b, g) => {
  const lt = t - a;
  K.ink(g, 'blue', t, (g) => g.fillRect(0, 0, 1080, 1920), { tone: 0.25 });
  K.ink(g, 'yellow', t, (g) => { g.beginPath(); g.moveTo(700, 140); g.lineTo(1000, 140); g.lineTo(1080, 1400); g.lineTo(380, 1400); g.closePath(); g.fill(); });
  K.ink(g, 'blue', t, (g) => {
    // seated brothers, heads down, one with a guitar
    for (let i = 0; i < 4; i++) { const x = 220 + i * 210; g.beginPath(); g.arc(x, 1050 + (i % 2) * 20, 50, 0, 7); g.ellipse(x, 1030 + (i % 2) * 20, 60, 40, 0, Math.PI, 7); g.fill(); g.beginPath(); g.moveTo(x - 90, 1330); g.quadraticCurveTo(x - 90, 1100, x, 1100); g.quadraticCurveTo(x + 90, 1100, x + 90, 1330); g.fill(); }
    g.save(); g.translate(430, 1230); g.rotate(-0.5); g.beginPath(); g.ellipse(0, 0, 70, 54, 0, 0, 7); g.fill(); g.fillRect(50, -9, 220, 18); g.restore();
  });
  // tally marks (days), pink
  const days = Math.floor(clamp((lt - 0.2) / 2.6) * 90);
  K.ink(g, 'pink', t, (g) => {
    for (let d = 0; d < days; d++) {
      const grp = Math.floor(d / 5), k = d % 5, gx = 90 + (grp % 6) * 160, gy = 230 + Math.floor(grp / 6) * 120;
      if (k < 4) g.fillRect(gx + k * 26, gy, 9, 80); else { g.save(); g.translate(gx + 40, gy + 40); g.rotate(-1.0); g.fillRect(-60, -5, 120, 10); g.restore(); }
    }
  });
  K.ink(g, 'blue', t, (g) => K.bars(g, 60, 1020, 220, 1400, { n: 8, w: 40 }), { amt: 4 });
  K.tape(g, `HARI KE-${String(Math.max(1, days)).padStart(2, '0')}`, 760, 1000 - 40, { rot: 0.05, size: 46 });
  K.ink(g, 'pink', t, (g) => K.type(g, 'GLODOK', 540, 110, { size: 170, font: 'Archivo Black' }));
  const nt = W('bui', 'tanpa') - 0.1;
  if (t > nt) K.tape(g, 'TANPA PENGADILAN', 540, 1260, { rot: -0.04, size: 54, color: '#c0182a' });
});

// 4. Freed: the bars lift; a new poster prints pass by pass: KOES PLUS.
shot('plus', (t, a, b, g) => {
  const lt = t - a;
  const lift = ease.inCubic(clamp(lt / 0.6));
  if (lift < 1) K.ink(g, 'blue', t, (g) => K.bars(g, 60, 1020, 220, 1400, { n: 8, w: 40, rise: lift }));
  const p1 = clamp((lt + 0.1) / 0.45), p2 = clamp((lt - 0.4) / 0.5), p3 = clamp((lt - 0.9) / 0.5);
  g.save(); K.passClip(g, p1); K.ink(g, 'yellow', t, (g) => K.burst(g, 540, 900, 1400, { n: 36, rot: lt * 0.1 })); g.restore();
  g.save(); K.passClip(g, p2); K.ink(g, 'blue', t, (g) => { K.musician(g, 540, 1340, 0.85, 'vocal', t, { sing: 1 }); K.musician(g, 250, 1340, 0.75, 'guitar', t, { phase: 0.3 }); K.musician(g, 830, 1340, 0.75, 'bass', t, { phase: 0.6 }); }, { snap: clamp((lt - 1.4) / 0.4) }); g.restore();
  g.save(); K.passClip(g, p3); K.ink(g, 'pink', t, (g) => { K.type(g, 'KOES', 540, 300, { size: 330, font: 'Archivo Black' }); K.type(g, 'PLUS', 540, 590, { size: 330, font: 'Archivo Black' }); }, { snap: clamp((lt - 1.8) / 0.4) }); g.restore();
  if (lt > 1.2) K.tape(g, 'BEBAS · LAHIR KEMBALI · 1969', 540, 780, { rot: -0.03, size: 40 });
});

// 5. They sing along: a crowd, song titles as stickers; final poster line.
shot('akhir', (t, a, b, g) => {
  const lt = t - a;
  K.ink(g, 'yellow', t, (g) => K.burst(g, 540, 1000, 1500, { n: 30, rot: lt * 0.06 }));
  K.ink(g, 'blue', t, (g) => { K.musician(g, 540, 1060, 0.62, 'vocal', t, { sing: 1 }); K.musician(g, 330, 1060, 0.55, 'guitar', t, { phase: 0.3 }); K.musician(g, 750, 1060, 0.55, 'bass', t, { phase: 0.6 }); g.fillRect(150, 1060, 780, 26); }, { snap: 0.5 });
  K.ink(g, 'pink', t, (g) => K.crowd(g, -40, 1120, 1400, t, { n: 12, s: 1.3 }));
  K.ink(g, 'blue', t, (g) => K.crowd(g, 20, 1060, 1400, t + 0.5, { n: 10, s: 0.95, seed: 7 }), { tone: 0.6 });
  const songs = [['KOLAM SUSU', 240, 470, -0.08], ['BUJANGAN', 820, 420, 0.07], ['KEMBALI KE JAKARTA', 560, 580, -0.03]];
  songs.forEach(([s, x, y, r], i) => { if (lt > 0.15 + i * 0.25) K.tape(g, s, x, y, { rot: r, size: 44 }); });
  const end = C.akhir.end - 0.2;
  K.ink(g, 'pink', t, (g) => K.type(g, 'DIPENJARA KARENA LAGU', 540, 150, { size: 104, font: 'Bebas Neue', spacing: 2 }));
  if (t > W('akhir', 'dikenang') - 0.1) K.ink(g, 'blue', t, (g) => K.type(g, 'DIKENANG LEWAT LAGU', 540, 285, { size: 116, font: 'Bebas Neue', spacing: 2 }), { snap: clamp((t - end) / 0.3) });
  if (t > end) K.ink(g, 'red', t, (g) => K.stamp(g, 'KOES PLUS', 820, 760, clamp((t - end) / 0.2), { size: 90, rot: 0.12 }));
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  const g = K.print();
  s.fn(t, Math.max(0, a), b, g);
  const since = t - Math.max(0, a);
  K.present(out, t, { shake: s.id !== 'hook' && since < 0.2 ? 14 : 3 });
}
