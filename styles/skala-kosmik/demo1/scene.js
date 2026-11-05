// Skala Kosmik demo1 (~63s): "Zoom Out dari Monas ke Ujung Alam Semesta — Perjalanan 10 Pangkat 26 Meter"
import * as K from '/styles/skala-kosmik/kit.js';
const { clamp, lerp } = AM.lib;

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
  AM.sfx('swoosh_up', C.bumi.start, { gain: 0.35 });
  AM.sfx('swoosh_up', C.surya.start, { gain: 0.35 });
  AM.sfx('swoosh_up', C.galaksi.start, { gain: 0.35 });
  AM.sfx('chime', C.jaring.start + 0.3, { gain: 0.45 });
}

export function render(t) {
  // Compute continuous log10(meters) from 2 (Monas 100m) to 26 (Cosmic Web)
  let logM = 2;
  let stageTitle = 'Monumen Nasional, Jakarta';
  let stageSub = 'TAMAN MEDAN MERDEKA · LIDAH API EMAS';
  let unitLbl = '100 METER';

  if (t < C.bumi.start) {
    const p = K.pr(t, 0, C.bumi.start);
    logM = lerp(2, 5, p);
    K.drawDeepSpace(ctx, t, logM);
    K.drawMonasStage(ctx, t, p);
  } else if (t < C.surya.start) {
    const p = K.pr(t, C.bumi.start, C.surya.start);
    logM = lerp(6, 9, p);
    stageTitle = 'Planet Bumi & Orbit Bulan';
    stageSub = 'KEPULAUAN NUSANTARA · DIAMETER 12.742 KM';
    unitLbl = '10.000 – 1.000.000 KM';
    K.drawDeepSpace(ctx, t, logM);
    K.drawEarthStage(ctx, t, p);
  } else if (t < C.galaksi.start) {
    const p = K.pr(t, C.surya.start, C.galaksi.start);
    logM = lerp(10, 14, p);
    stageTitle = 'Tata Surya (Solar System)';
    stageSub = 'MATAHARI & 8 PLANET · PALE BLUE DOT';
    unitLbl = '10 MILIAR KM';
    K.drawDeepSpace(ctx, t, logM);
    K.drawSolarSystemStage(ctx, t, p);
  } else if (t < C.jaring.start) {
    const p = K.pr(t, C.galaksi.start, C.jaring.start);
    logM = lerp(16, 21, p);
    stageTitle = 'Galaksi Bima Sakti (Milky Way)';
    stageSub = '400 MILIAR BINTANG · LENGAN SPIRAL ORION';
    unitLbl = '100.000 TAHUN CAHAYA';
    K.drawDeepSpace(ctx, t, logM);
    K.drawGalaxyStage(ctx, t, p);
  } else {
    const p = K.pr(t, C.jaring.start, AM.duration);
    logM = lerp(22, 26, p);
    stageTitle = 'Jaring Kosmik Alam Semesta';
    stageSub = 'SUPERKLUSTER LANIAKEA · 2 TRILIUN GALAKSI';
    unitLbl = '93 MILIAR TAHUN CAHAYA';
    K.drawDeepSpace(ctx, t, logM);
    K.drawCosmicWebStage(ctx, t);
  }

  K.drawScaleHUD(ctx, t, {
    exp: logM,
    unitLabel: unitLbl,
    title: stageTitle,
    subtitle: stageSub,
    stageTag: 'POWERS OF TEN · ZOOM OUT MAKROKOSMOS',
  });
}
