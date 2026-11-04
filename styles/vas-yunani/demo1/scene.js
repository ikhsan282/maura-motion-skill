// Vas Yunani Black-Figure demo1 (~64 s): "Prometheus, Pencuri Api Olimpus"
// Rotating cylindrical Attic black-figure amphora frieze with incised terracotta linework.
import * as K from '/styles/vas-yunani/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'serif', y: 1515, size: 68 } };

let ctx;
const C = {};
const seg = (id, t) => clamp((t - C[id].start) / Math.max(0.01, C[id].end - C[id].start));
const fade = (id, t, fi = 0.35, fo = 0.35) => {
  const s = C[id].start, e = C[id].end;
  if (t < s - fi || t > e + fo) return 0;
  if (t < s) return clamp((t - (s - fi)) / fi);
  if (t > e) return clamp(1 - (t - e) / fo);
  return 1;
};

export async function setup(AM) {
  ctx = AM.layer('vase');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('whoosh', C.olimpus.start + 0.2, { gain: 0.35 });
  AM.sfx('chime', C.narthex.start + 0.3, { gain: 0.4 });
  AM.sfx('stamp', C.peradaban.start + 0.25, { gain: 0.38 });
  AM.sfx('thud', C.hukuman.start + 0.2, { gain: 0.48 });
  AM.sfx('whoosh', C.herakles.start + 0.3, { gain: 0.42 });
}

function drawRockPeak(x, y, w, h) {
  ctx.save();
  ctx.fillStyle = P.slip;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x - w * 0.32, y - h * 0.72);
  ctx.lineTo(x - w * 0.08, y - h);
  ctx.lineTo(x + w * 0.24, y - h * 0.84);
  ctx.lineTo(x + w / 2, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = P.incise; ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.25, y - h * 0.2); ctx.lineTo(x - w * 0.08, y - h * 0.85);
  ctx.moveTo(x + w * 0.05, y - h * 0.15); ctx.lineTo(x + w * 0.18, y - h * 0.72);
  ctx.stroke();
  ctx.restore();
}

export function render(t) {
  const scroll = t * 52;
  const chIdx = ['hook', 'olimpus', 'narthex', 'peradaban', 'hukuman', 'herakles'].findIndex((id) => t <= C[id].end + 0.1);
  const rom = ['ADEGAN I', 'ADEGAN II', 'ADEGAN III', 'ADEGAN IV', 'ADEGAN V', 'ADEGAN VI'][Math.max(0, chIdx)];

  K.stage(ctx, t, {
    scroll,
    title: 'PROMETHEUS · PENCURI API OLIMPUS',
    subtitle: 'AMFORA ATTIC BLACK-FIGURE · ~530 SM',
    chapter: rom,
    glow: 0.3,
  });

  // Scene 1: Hook — Zeus on Olympus keeping fire from shivering mortals below
  const a1 = fade('hook', t, 0.2, 0.3);
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1;
    K.columns(ctx, 110, 820, 380, 380, { count: 4 });
    // Zeus standing high with thunderbolt
    K.figure(ctx, 300, 820, 1.05, { t, dir: 1, beard: true, laurel: true, armR: 0.65, prop: 'bolt' });
    // Shivering mortals on lower ground
    K.figure(ctx, 730, 1285, 0.92, { t, dir: -1, kneel: 0.8, beard: false, robe: 'tunic', crimsonCloak: false, armR: 0.5 });
    K.figure(ctx, 890, 1285, 0.88, { t, dir: -1, kneel: 0.6, beard: true, robe: 'tunic', crimsonCloak: false, armR: 0.4 });
    K.plaque(ctx, 80, 910, 480, 165, {
      tag: 'PUNCAK OLIMPUS',
      title: 'API SUCI PARA DEWA',
      sub: 'Manusia hidup dingin tanpa cahaya api',
      alpha: ease.outCubic(clamp(seg('hook', t) * 2)),
    });
    ctx.restore();
  }

  // Scene 2: Olimpus — Prometheus sneaking into Hephaestus's forge
  const a2 = fade('olimpus', t, 0.3, 0.3);
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2;
    const p = seg('olimpus', t);
    K.columns(ctx, 560, 1285, 420, 520, { count: 4 });
    // Sacred forge brazier with roaring fire
    ctx.fillStyle = P.slip;
    ctx.beginPath();
    ctx.moveTo(700, 1285); ctx.lineTo(735, 1130); ctx.lineTo(825, 1130); ctx.lineTo(860, 1285);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = P.incise; ctx.lineWidth = 2.5; ctx.stroke();
    K.torch(ctx, 765, 1085, 1.45, t);
    // Prometheus striding toward the forge
    const px = lerp(210, 520, ease.outCubic(p));
    K.figure(ctx, px, 1285, 1.28, { t, dir: 1, walk: 1, beard: true, laurel: true, armR: 0.75 });
    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'TITAN PROMETHEUS',
      title: 'MENYELINAP KE BENGKEL HEPHAESTUS',
      sub: 'Mengambil bara api suci saat penghuni Olimpus lengah',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 3: Narthex — Hiding the glowing ember inside the giant fennel stalk
  const a3 = fade('narthex', t, 0.3, 0.3);
  if (a3 > 0) {
    ctx.save(); ctx.globalAlpha = a3;
    const p = seg('narthex', t);
    // Close-up diagram of the Narthex (Giant Fennel Stalk) in center right
    const cx = 690, cy = 830;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.22);
    AM.lib.roundRect(ctx, -48, -320, 96, 560, 24);
    ctx.fillStyle = P.slip; ctx.fill();
    ctx.strokeStyle = P.incise; ctx.lineWidth = 4; ctx.stroke();
    // Stalk segments
    for (let sy = -220; sy <= 160; sy += 120) {
      ctx.beginPath(); ctx.moveTo(-48, sy); ctx.lineTo(48, sy); ctx.stroke();
    }
    // Glowing inner pith core
    AM.lib.roundRect(ctx, -22, -260, 44, 420, 14);
    ctx.fillStyle = P.crimson; ctx.fill();
    const emberY = lerp(-180, 40, Math.sin(t * 2.5) * 0.5 + 0.5);
    ctx.fillStyle = P.gold;
    ctx.beginPath(); ctx.arc(0, emberY, 22 + Math.sin(t * 9) * 3, 0, TAU); ctx.fill();
    ctx.fillStyle = P.chalk;
    ctx.beginPath(); ctx.arc(0, emberY, 10, 0, TAU); ctx.fill();
    ctx.restore();

    // Prometheus holding the stalk on left
    K.figure(ctx, 290, 1285, 1.32, { t, dir: 1, walk: 0.4, beard: true, armR: 0.85, prop: 'torch' });

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'RAHASIA BOTANI KUNO · FERULA COMMUNIS',
      title: 'BATANG ADAS RAKSASA (NARTHEX)',
      sub: 'Inti gabus kering menyimpan bara tanpa membakar kulit batang',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 4: Peradaban — Handing fire to humanity (pottery kiln, forge, knowledge)
  const a4 = fade('peradaban', t, 0.3, 0.3);
  if (a4 > 0) {
    ctx.save(); ctx.globalAlpha = a4;
    const p = seg('peradaban', t);
    // Prometheus on left passing the torch to two humans on right
    K.figure(ctx, 260, 1285, 1.3, { t, dir: 1, beard: true, laurel: true, armR: 0.85, prop: 'torch' });
    K.figure(ctx, 640, 1285, 1.18, { t, dir: -1, beard: false, robe: 'tunic', armR: 0.8, prop: 'torch' });
    K.figure(ctx, 860, 1285, 1.15, { t, dir: -1, beard: true, robe: 'chiton', armR: 0.4 });

    // Amphora vase icon & anvil between them
    ctx.fillStyle = P.slip;
    ctx.beginPath();
    ctx.ellipse(460, 1215, 38, 56, 0, 0, TAU);
    ctx.fill();
    ctx.fillRect(442, 1142, 36, 26);
    ctx.fillRect(435, 1265, 50, 20);
    ctx.strokeStyle = P.incise; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(424, 1215); ctx.lineTo(496, 1215); ctx.stroke();

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'LAHIRNYA PERADABAN MANUSIA',
      title: 'TEMBIKAR · LOGAM · SAINS & SENI',
      sub: 'Dari satu nyala obor, manusia membangun kebudayaan',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 5: Hukuman — Prometheus chained to Mount Caucasus & the Eagle
  const a5 = fade('hukuman', t, 0.3, 0.3);
  if (a5 > 0) {
    ctx.save(); ctx.globalAlpha = a5;
    const p = seg('hukuman', t);
    drawRockPeak(340, 1285, 420, 620);
    // Prometheus chained against the rock peak
    K.figure(ctx, 340, 1185, 1.28, {
      t,
      dir: 1,
      chained: true,
      beard: true,
      crimsonCloak: false,
      armR: 1.1,
      armL: -1.1,
    });
    // Swooping eagle from top right
    const ex = lerp(920, 580, ease.outCubic(p));
    const ey = lerp(540, 780, ease.outCubic(p));
    K.eagle(ctx, ex, ey, 1.35, t, { dir: -1 });

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'MURKA ZEUS DI KAUKASUS',
      title: 'BELENGGU RANTAI & ELang FAJAR',
      sub: 'Harga yang dibayar sang Titan demi kemajuan umat manusia',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 6: Herakles — Heracles shooting the arrow of liberation
  const a6 = fade('herakles', t, 0.3, 0.2);
  if (a6 > 0) {
    ctx.save(); ctx.globalAlpha = a6;
    const p = seg('herakles', t);
    drawRockPeak(770, 1285, 360, 540);
    // Prometheus freed on right holding torch high
    K.figure(ctx, 760, 1285, 1.25, { t, dir: -1, beard: true, laurel: true, armR: 0.9, prop: 'torch' });
    // Heracles on left aiming his bow
    K.figure(ctx, 250, 1285, 1.32, { t, dir: 1, beard: true, helmet: true, armR: 1.25, prop: 'bow' });
    // Flying golden arrow across the frieze
    const arrowP = clamp((p - 0.15) / 0.45);
    if (arrowP > 0 && arrowP < 1) {
      const ax = lerp(340, 720, arrowP), ay = lerp(960, 720, arrowP);
      ctx.strokeStyle = P.chalk; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(ax - 70, ay + 24); ctx.lineTo(ax, ay); ctx.stroke();
    }

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'PEMBEBASAN OLEH HERAKLES',
      title: 'LAMBANG ABADI ILMU PENGETAHUAN',
      sub: 'Cahaya akal budi manusia tak pernah lagi padam',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }
}

