// Risograph Halftone demo2 (~64 s): "Dara Puspita: Empat Gadis Surabaya yang Mengguncang Panggung Eropa Tahun 1968"
// 3-ink fluoro risograph gig-poster zine celebrating Indonesia's pioneering all-female 1960s garage rock band.
import * as K from '/styles/riso-halftone/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'comic', y: 1480, size: 70, maxWords: 4 } };

let out;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  out = AM.layer('print', { autoClear: false });
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('paper', 0.05, { gain: 0.4 });
  AM.sfx('stamp', C.hook.start + 1.2, { gain: 0.45 });
  AM.sfx('pop', C.band.start + 0.3, { gain: 0.38 });
  AM.sfx('stamp', C.surabaya.start + 0.4, { gain: 0.45 });
  AM.sfx('swoosh_up', C.eropa.start + 0.2, { gain: 0.38 });
  AM.sfx('crowd', C.akhir.start + 0.2, { gain: 0.32 });
  AM.sfx('stamp', C.akhir.end - 0.3, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// 1. Hook: 1968 European Tour Gig Poster printing itself pass by pass
shot('hook', (t, a, b, g) => {
  const lt = t - a, p = clamp(lt / Math.max(0.01, b - a));
  K.ink(g, 'yellow', t, (g) => K.burst(g, 540, 860, 1400, { n: 28, rot: lt * 0.06 }));

  g.save();
  K.passClip(g, ease.inOutCubic(clamp((lt + 0.2) / 0.85)));
  K.ink(g, 'blue', t, (g) => {
    K.musician(g, 540, 1170, 0.8, 'drums', t, { phase: 0.2 });
    K.musician(g, 220, 1310, 0.88, 'guitar', t);
    K.musician(g, 540, 1310, 0.88, 'vocal', t, { phase: 0.3, sing: 1 });
    K.musician(g, 850, 1310, 0.88, 'bass', t, { phase: 0.6 });
    g.fillRect(0, 1310, 1080, 32);
  });
  g.restore();

  K.ink(g, 'pink', t, (g) => {
    K.type(g, '1968', 540, 260, { size: 320, font: 'Archivo Black' });
    K.type(g, 'SURABAYA → EROPA', 540, 460, { size: 112, font: 'Bebas Neue', spacing: 6 });
  }, { snap: clamp((lt - 0.5) / 0.4) * 0.6 });

  if (lt > 1.1) {
    K.tape(g, '250+ PANGGUNG ROCK EROPA', 540, 610, { rot: -0.04, size: 44 });
  }
  if (p > 0.55) {
    K.ink(g, 'red', t, (g) => K.stamp(g, 'GARAGE ROCK!', 540, 1120, clamp((p - 0.55) * 4), { size: 130, rot: -0.09 }));
  }
});

// 2. Band lineup: Titiek AR, Lies AR, Titiek Hamzah, Susy Nander
shot('band', (t, a, b, g) => {
  const lt = t - a;
  K.ink(g, 'yellow', t, (g) => g.fillRect(0, 940, 1080, 420));
  K.ink(g, 'pink', t, (g) => g.fillRect(0, 940, 1080, 420), { tone: 0.3 });

  K.ink(g, 'pink', t, (g) => K.type(g, 'DARA', 540, 230, { size: 280, font: 'Archivo Black' }));
  K.ink(g, 'blue', t, (g) => K.type(g, 'PUSPITA', 540, 430, { size: 190, font: 'Bebas Neue', spacing: 12 }));

  K.ink(g, 'blue', t, (g) => {
    K.musician(g, 830, 1180, 0.64, 'drums', t, { phase: 0.4 });
    K.musician(g, 165, 1340, 0.78, 'guitar', t);
    K.musician(g, 375, 1340, 0.78, 'guitar', t, { phase: 0.25 });
    K.musician(g, 585, 1340, 0.78, 'bass', t, { phase: 0.5 });
  });

  const members = [
    ['TITIEK A.R. · MELODI', 210, 660, -0.05],
    ['LIES A.R. · RITME', 460, 760, 0.04],
    ['TITIEK HAMZAH · BASS', 340, 860, -0.03],
    ['SUSY NANDER · DRUM', 810, 720, 0.06],
  ];
  members.forEach(([nm, x, y, r], i) => {
    if (lt > 0.3 + i * 0.6) K.tape(g, nm, x, y, { rot: r, size: 36 });
  });
});

// 3. Surabaya & Jang Pertama vinyl LP spinning
shot('surabaya', (t, a, b, g) => {
  const lt = t - a, p = clamp(lt / Math.max(0.01, b - a));
  K.ink(g, 'yellow', t, (g) => K.burst(g, 540, 760, 1350, { n: 24, rot: -lt * 0.08 }));

  // Giant spinning vinyl LP
  g.save();
  g.translate(540, 760);
  g.rotate(t * 2.2);
  K.ink(g, 'blue', t, (g) => K.record(g, 0, 0, 320));
  K.ink(g, 'pink', t, (g) => {
    g.beginPath(); g.arc(0, 0, 135, 0, TAU); g.fill();
  });
  K.ink(g, 'yellow', t, (g) => {
    K.type(g, 'MESRA', 0, -55, { size: 54, font: 'Bebas Neue' });
    K.type(g, '1966', 0, 55, { size: 54, font: 'Bebas Neue' });
  });
  g.restore();

  K.ink(g, 'pink', t, (g) => K.type(g, 'JANG PERTAMA', 540, 210, { size: 155, font: 'Archivo Black' }));
  K.tape(g, 'LAGU HIT: "SURABAYA" & "MARI-MARI"', 540, 350, { rot: -0.03, size: 40 });

  if (p > 0.45) {
    K.ink(g, 'red', t, (g) => K.stamp(g, 'ROCK PEREMPUAN PELOPOR!', 540, 1210, clamp((p - 0.45) * 3.5), { size: 96, rot: -0.06 }));
  }
});

// 4. European Tour Poster (1968–1971): 6 countries stamped on print
shot('eropa', (t, a, b, g) => {
  const lt = t - a;
  K.ink(g, 'blue', t, (g) => g.fillRect(0, 0, 1080, 1920), { tone: 0.22 });
  K.ink(g, 'yellow', t, (g) => g.fillRect(80, 160, 920, 1180));

  K.ink(g, 'pink', t, (g) => {
    K.type(g, 'EUROPEAN', 540, 290, { size: 200, font: 'Archivo Black' });
    K.type(g, 'TOUR 1968–1971', 540, 450, { size: 120, font: 'Bebas Neue', spacing: 8 });
  });

  const cities = [
    ['JERMAN BARAT', 310, 620, -0.06],
    ['BELANDA', 770, 620, 0.05],
    ['INGGRIS (LONDON)', 320, 790, 0.04],
    ['PRANCIS (PARIS)', 760, 790, -0.05],
    ['SPANYOL', 310, 960, -0.04],
    ['HUNGARIA', 770, 960, 0.06],
  ];
  cities.forEach(([c, x, y, r], i) => {
    const ct = 0.3 + i * 0.45;
    if (lt > ct) {
      K.tape(g, c, x, y, { rot: r, size: 42 });
    }
  });

  K.ink(g, 'blue', t, (g) => {
    K.musician(g, 330, 1340, 0.62, 'guitar', t);
    K.musician(g, 540, 1340, 0.65, 'vocal', t, { sing: 1 });
    K.musician(g, 750, 1340, 0.62, 'bass', t, { phase: 0.4 });
  });
});

// 5. Finale: Cheering crowd & timeless Southeast Asian garage-rock legend
shot('akhir', (t, a, b, g) => {
  const lt = t - a, p = clamp(lt / Math.max(0.01, b - a));
  K.ink(g, 'yellow', t, (g) => K.burst(g, 540, 980, 1500, { n: 32, rot: lt * 0.06 }));
  K.ink(g, 'blue', t, (g) => {
    K.musician(g, 540, 1060, 0.64, 'vocal', t, { sing: 1 });
    K.musician(g, 310, 1060, 0.58, 'guitar', t, { phase: 0.3 });
    K.musician(g, 770, 1060, 0.58, 'bass', t, { phase: 0.6 });
    g.fillRect(140, 1060, 800, 26);
  }, { snap: 0.5 });

  K.ink(g, 'pink', t, (g) => K.crowd(g, -40, 1120, 1400, t, { n: 12, s: 1.3 }));
  K.ink(g, 'blue', t, (g) => K.crowd(g, 20, 1060, 1400, t + 0.5, { n: 10, s: 0.95, seed: 9 }), { tone: 0.6 });

  K.ink(g, 'pink', t, (g) => K.type(g, 'LEGENDA GARAGE ROCK', 540, 190, { size: 120, font: 'Bebas Neue', spacing: 4 }));
  K.ink(g, 'blue', t, (g) => K.type(g, 'DARA PUSPITA', 540, 340, { size: 170, font: 'Archivo Black' }));

  const tags = [['BAEDER POP · 1968', 290, 510, -0.06], ['A GO-GO · SURABAYA', 780, 500, 0.05]];
  tags.forEach(([s, x, y, r], i) => {
    if (lt > 0.25 + i * 0.3) K.tape(g, s, x, y, { rot: r, size: 40 });
  });

  if (p > 0.55) {
    K.ink(g, 'red', t, (g) => K.stamp(g, 'IKON MUSIK NUSANTARA', 540, 680, clamp((p - 0.55) * 3.5), { size: 92, rot: -0.05 }));
  }
});

export function render(t) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  const g = K.print();
  s.fn(t, Math.max(0, a), b, g);
  const since = t - Math.max(0, a);
  K.present(out, t, { shake: s.id !== 'hook' && since < 0.2 ? 14 : 3 });
}

