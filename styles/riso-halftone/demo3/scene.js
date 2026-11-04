// Risograph Halftone demo3 (~65 s): "Studio Lokananta Solo 1956 — Pabrik Piringan Hitam Pertama yang Merekam Jiwa Nusantara"
// 3-ink fluoro risograph print celebrating Lokananta Surakarta, vinyl pressing, reel-to-reel master tapes, and Indonesian music legends.
import * as K from '/styles/riso-halftone/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'comic', y: 1480, size: 70, maxWords: 4 } };

let out;
const C = {};

export async function setup(AM) {
  out = AM.layer('print', { autoClear: false });
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('paper', 0.05, { gain: 0.4 });
  AM.sfx('stamp', C.hook.start + 1.2, { gain: 0.45 });
  AM.sfx('chime', C.nama.start + 0.3, { gain: 0.38 });
  AM.sfx('stamp', C.piringan.start + 0.4, { gain: 0.45 });
  AM.sfx('pop', C.legenda.start + 0.3, { gain: 0.38 });
  AM.sfx('stamp', C.akhir.end - 0.3, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

function drawReelToReel(g, x, y, r, t) {
  g.save();
  g.translate(x, y);
  for (const sx of [-r * 1.15, r * 1.15]) {
    g.save();
    g.translate(sx, 0);
    g.rotate(t * 2.4);
    K.record(g, 0, 0, r);
    // 3 tape reel slots
    g.fillStyle = K.PAPER;
    for (let i = 0; i < 3; i++) {
      g.save();
      g.rotate((i * TAU) / 3);
      g.fillRect(-16, -r * 0.78, 32, r * 0.52);
      g.restore();
    }
    g.restore();
  }
  // Tape bridge between reels
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(-r * 1.15, -r);
  g.lineTo(r * 1.15, -r);
  g.moveTo(-r * 1.15, r * 0.75);
  g.lineTo(0, r * 1.15);
  g.lineTo(r * 1.15, r * 0.75);
  g.stroke();
  g.restore();
}

// 1. Hook: 1956 Lokananta Vinyl & Reel-to-Reel Archive Print
shot('hook', (t, a, b, g) => {
  const lt = t - a, p = clamp(lt / Math.max(0.01, b - a));
  K.ink(g, 'yellow', t, (g) => K.burst(g, 540, 820, 1400, { n: 28, rot: lt * 0.05 }));

  g.save();
  K.passClip(g, ease.inOutCubic(clamp((lt + 0.25) / 0.85)));
  K.ink(g, 'blue', t, (g) => {
    g.save();
    g.translate(540, 820);
    g.rotate(t * 1.8);
    K.record(g, 0, 0, 340);
    g.restore();
  });
  K.ink(g, 'pink', t, (g) => {
    g.beginPath(); g.arc(540, 820, 130, 0, TAU); g.fill();
  });
  g.restore();

  K.ink(g, 'pink', t, (g) => K.type(g, '1956', 540, 250, { size: 330, font: 'Archivo Black' }), { snap: clamp((lt - 0.4) / 0.3) * 0.6 });
  K.ink(g, 'blue', t, (g) => K.type(g, 'SOLO · SURAKARTA', 540, 440, { size: 110, font: 'Bebas Neue', spacing: 8 }));

  if (lt > 0.8) K.tape(g, '40.000+ PIRINGAN HITAM · 5.600 PITA MASTER', 540, 1240, { rot: -0.03, size: 38 });
  if (p > 0.55) {
    K.ink(g, 'red', t, (g) => K.stamp(g, 'ARSIP SUARA BANGSA', 540, 1080, clamp((p - 0.55) * 3.5), { size: 105, rot: -0.08 }));
  }
});

// 2. Nama: Lokananta — Gamelan of the Heavens
shot('nama', (t, a, b, g) => {
  const lt = t - a;
  K.ink(g, 'yellow', t, (g) => g.fillRect(60, 160, 960, 1200));
  K.ink(g, 'pink', t, (g) => K.burst(g, 540, 780, 720, { n: 20, rot: -lt * 0.06 }), { tone: 0.35 });

  K.ink(g, 'blue', t, (g) => {
    K.type(g, 'LOKANANTA', 540, 290, { size: 195, font: 'Archivo Black' });
    // Stylized Javanese Gong & Kenong silhouettes
    g.fillRect(200, 520, 680, 28);
    g.fillRect(230, 520, 28, 480);
    g.fillRect(822, 520, 28, 480);
    const pulse = 1 + Math.sin(t * 7) * 0.04;
    g.beginPath(); g.arc(540, 790, 185 * pulse, 0, TAU); g.fill();
  });
  K.ink(g, 'pink', t, (g) => {
    g.beginPath(); g.arc(540, 790, 68, 0, TAU); g.fill();
  });

  K.tape(g, 'GAMELAN KAHYANGAN YANG BERBUNYI SENDIRI', 540, 440, { rot: -0.03, size: 38 });
  if (lt > 1.2) {
    K.tape(g, '29 OKTOBER 1956 · KEMENPEN R.I.', 540, 1140, { rot: 0.04, size: 42 });
  }
});

// 3. Piringan: Pressing shellac/vinyl records for RRI broadcasts
shot('piringan', (t, a, b, g) => {
  const lt = t - a, p = clamp(lt / Math.max(0.01, b - a));
  K.ink(g, 'blue', t, (g) => g.fillRect(0, 0, 1080, 1920), { tone: 0.2 });

  // Grid of 4 spinning records being pressed
  const pos = [[310, 590, 'pink'], [770, 590, 'blue'], [310, 1020, 'blue'], [770, 1020, 'pink']];
  pos.forEach(([rx, ry, col], i) => {
    const show = ease.outBack(clamp((lt - i * 0.25) / 0.45));
    if (show <= 0) return;
    g.save();
    g.translate(rx, ry);
    g.scale(show, show);
    g.rotate(t * 2 + i);
    K.ink(g, col, t, (g) => K.record(g, 0, 0, 185));
    K.ink(g, 'yellow', t, (g) => { g.beginPath(); g.arc(0, 0, 72, 0, TAU); g.fill(); });
    g.restore();
  });

  K.ink(g, 'pink', t, (g) => K.type(g, 'PABRIK PIRINGAN HITAM', 540, 195, { size: 112, font: 'Bebas Neue', spacing: 4 }));
  K.tape(g, 'R. MALADI & OETOJO SOEMOWIDJOJO', 540, 315, { rot: -0.03, size: 38 });
  if (p > 0.5) {
    K.ink(g, 'red', t, (g) => K.stamp(g, 'SIARAN RRI NUSANTARA', 540, 1290, clamp((p - 0.5) * 3.5), { size: 96, rot: 0.05 }));
  }
});

// 4. Legenda: Gesang (Bengawan Solo), Waldjinah (Walang Kekek), Bing Slamet
shot('legenda', (t, a, b, g) => {
  const lt = t - a;
  K.ink(g, 'yellow', t, (g) => K.burst(g, 540, 940, 1400, { n: 26, rot: lt * 0.05 }));
  K.ink(g, 'blue', t, (g) => {
    K.musician(g, 540, 1340, 0.85, 'vocal', t, { sing: 1 });
    K.musician(g, 230, 1340, 0.76, 'guitar', t, { phase: 0.2 });
    K.musician(g, 850, 1340, 0.76, 'bass', t, { phase: 0.5 });
  });

  K.ink(g, 'pink', t, (g) => K.type(g, 'MAESTRO STUDIO', 540, 210, { size: 155, font: 'Archivo Black' }));
  K.ink(g, 'blue', t, (g) => K.type(g, 'REKaman ABADI LOKANANTA', 540, 345, { size: 96, font: 'Bebas Neue', spacing: 6 }));

  const legends = [
    ['GESANG · BENGAWAN SOLO', 320, 500, -0.05],
    ['WALDJINAH · WALANG KEKEK', 730, 620, 0.05],
    ['BING SLAMET & SAM SAIMUN', 360, 740, -0.03],
  ];
  legends.forEach(([lbl, x, y, r], i) => {
    if (lt > 0.25 + i * 0.45) K.tape(g, lbl, x, y, { rot: r, size: 40 });
  });
});

// 5. Akhir: Reel-to-reel master tape of Indonesia Raya 3 Stanza & KAA 1955
shot('akhir', (t, a, b, g) => {
  const lt = t - a, p = clamp(lt / Math.max(0.01, b - a));
  K.ink(g, 'yellow', t, (g) => g.fillRect(0, 280, 1080, 900));
  K.ink(g, 'pink', t, (g) => g.fillRect(0, 280, 1080, 900), { tone: 0.25 });

  K.ink(g, 'blue', t, (g) => {
    drawReelToReel(g, 540, 730, 210, t);
  });

  K.ink(g, 'pink', t, (g) => K.type(g, 'TITIK NOL MUSIK KITA', 540, 185, { size: 124, font: 'Bebas Neue', spacing: 4 }));
  K.tape(g, 'MASTER ASLI: INDONESIA RAYA 3 STANZA', 540, 1080, { rot: -0.03, size: 42 });
  if (lt > 0.7) {
    K.tape(g, 'ARSIP PIDATO K.A.A. BANDUNG 1955', 540, 1185, { rot: 0.04, size: 40 });
  }
  if (p > 0.55) {
    K.ink(g, 'red', t, (g) => K.stamp(g, 'LOKANANTA ABADI', 540, 420, clamp((p - 0.55) * 3.5), { size: 115, rot: -0.07 }));
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

