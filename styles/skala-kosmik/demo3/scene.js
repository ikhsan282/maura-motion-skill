// Skala Kosmik demo3 (~65s): "Seberapa Cepat Cahaya Sebenarnya? — Dari 7,5 Kali Keliling Bumi hingga Ujung Bima Sakti"
import * as K from '/styles/skala-kosmik/kit.js';
const { lerp, TAU } = AM.lib;

export const meta = {
  fps: 24,
  hold: 1,
  captions: {
    preset: 'clean',
    y: 1475,
    size: 52,
    box: { fill: 'rgba(6,11,26,.88)', pad: 16, radius: 12, border: 'rgba(94,242,255,.35)', borderW: 2 },
  },
};

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('whoosh', 0.4, { gain: 0.35 });
  AM.sfx('pop', C.bulan.start + 0.2, { gain: 0.4 });
  AM.sfx('swoosh_up', C.surya.start + 0.2, { gain: 0.35 });
  AM.sfx('swoosh_up', C.bintang.start + 0.2, { gain: 0.35 });
  AM.sfx('chime', C.galaksi.start + 0.3, { gain: 0.45 });
}

function drawPhotonPulse(ctx, x, y, r = 14) {
  ctx.save();
  const g = ctx.createRadialGradient(x, y, 2, x, y, r * 3.5);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, K.PAL.gold);
  g.addColorStop(1, 'rgba(255,214,94,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function render(t) {
  let logM = 7;
  let stageTitle = '7,5× Keliling Bumi / Detik';
  let stageSub = 'c = 299.792 KM/DETIK · WAKTU TEMPUH 0,13 DTK';
  let unitLbl = '0,13 DETIK CAHAYA';

  if (t < C.bulan.start) {
    const p = K.pr(t, 0, C.bulan.start);
    logM = lerp(7, 7.6, p);
    K.drawDeepSpace(ctx, t, logM);
    K.drawEarthStage(ctx, t, 0);
    // Photon orbiting Earth rapidly
    const a = t * TAU * 2.2;
    drawPhotonPulse(ctx, 540 + Math.cos(a) * 325, 830 + Math.sin(a) * 325, 16);
  } else if (t < C.surya.start) {
    const p = K.pr(t, C.bulan.start, C.surya.start);
    logM = lerp(8.2, 9.2, p);
    stageTitle = 'Bumi ke Bulan: 1,3 Detik';
    stageSub = 'JARAK RATA-RATA 384.400 KILOMETER';
    unitLbl = '1,3 DETIK CAHAYA';
    K.drawDeepSpace(ctx, t, logM);
    K.drawEarthStage(ctx, t, 0.85);
    const u = (t * 0.75) % 1;
    drawPhotonPulse(ctx, lerp(540, 540 + 340, u), 830, 15);
  } else if (t < C.bintang.start) {
    const p = K.pr(t, C.surya.start, C.bintang.start);
    logM = lerp(11, 12.2, p);
    stageTitle = 'Matahari ke Bumi: 8 Menit 20 Detik';
    stageSub = '1 SATUAN ASTRONOMI (149,6 JUTA KM)';
    unitLbl = '500 DETIK CAHAYA';
    K.drawDeepSpace(ctx, t, logM);
    K.drawSolarSystemStage(ctx, t, 0.25);
    const u = (t * 0.45) % 1;
    drawPhotonPulse(ctx, lerp(540, 540 + 185, u), 830, 15);
  } else if (t < C.galaksi.start) {
    const p = K.pr(t, C.bintang.start, C.galaksi.start);
    logM = lerp(16, 17, p);
    stageTitle = 'Ke Proxima Centauri: 4,2 Tahun';
    stageSub = 'BINTANG TETANGGA TERDEKAT · 40 TRILIUN KM';
    unitLbl = '4,2 TAHUN CAHAYA';
    K.drawDeepSpace(ctx, t, logM);
    K.drawSolarSystemStage(ctx, t, 0.95);
    // Distant red dwarf Proxima Centauri on top-right
    drawPhotonPulse(ctx, 840, 520, 22);
    const u = (t * 0.25) % 1;
    drawPhotonPulse(ctx, lerp(540, 840, u), lerp(830, 520, u), 12);
  } else {
    const p = K.pr(t, C.galaksi.start, AM.duration);
    logM = lerp(20.5, 21.5, p);
    stageTitle = 'Melintasi Bima Sakti: 100.000 Tahun';
    stageSub = 'DIAMETER GALAKSI · 9,5 × 10¹⁷ KILOMETER';
    unitLbl = '100.000 TAHUN CAHAYA';
    K.drawDeepSpace(ctx, t, logM);
    K.drawGalaxyStage(ctx, t, 0.25);
    const u = (t * 0.18) % 1;
    drawPhotonPulse(ctx, lerp(220, 860, u), 830, 14);
  }

  K.drawScaleHUD(ctx, t, {
    exp: logM,
    unitLabel: unitLbl,
    title: stageTitle,
    subtitle: stageSub,
    stageTag: 'KECEPATAN CAHAYA (300.000 KM/DTK) · SKALA KOSMIK',
  });
}

