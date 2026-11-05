// Skala Kosmik demo2 (~64s): "Zoom In ke Dalam Sehelai Daun — Dari Sel, Heliks DNA, hingga Kuark"
import * as K from '/styles/skala-kosmik/kit.js';
const { lerp } = AM.lib;

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
  AM.sfx('pop', C.sel.start + 0.2, { gain: 0.4 });
  AM.sfx('pop', C.dna.start + 0.2, { gain: 0.4, pitch: 1.1 });
  AM.sfx('pop', C.atom.start + 0.2, { gain: 0.4, pitch: 1.2 });
  AM.sfx('chime', C.kuark.start + 0.3, { gain: 0.45 });
}

export function render(t) {
  let logM = -1;
  let stageIdx = 0;
  let stageTitle = 'Tulang & Permukaan Daun Hijau';
  let stageSub = 'JARINGAN EPIDERMIS & STOMATA · 10 CM';
  let unitLbl = '10 SENTIMETER';

  if (t < C.sel.start) {
    const p = K.pr(t, 0, C.sel.start);
    logM = lerp(-1, -3, p);
    stageIdx = 0;
  } else if (t < C.dna.start) {
    const p = K.pr(t, C.sel.start, C.dna.start);
    logM = lerp(-4, -6, p);
    stageIdx = 1;
    stageTitle = 'Sel Tumbuhan & Kloroplas';
    stageSub = 'DAPUR FOTOSINTESIS · SKALA MIKROMETER';
    unitLbl = '10 MIKROMETER';
  } else if (t < C.atom.start) {
    const p = K.pr(t, C.dna.start, C.atom.start);
    logM = lerp(-7, -9, p);
    stageIdx = 2;
    stageTitle = 'Heliks Ganda Molekul DNA';
    stageSub = 'PASANGAN BASA NUKLEOTIDA · 2 NANOMETER';
    unitLbl = '1 NANOMETER';
  } else if (t < C.kuark.start) {
    const p = K.pr(t, C.atom.start, C.kuark.start);
    logM = lerp(-10, -12, p);
    stageIdx = 3;
    stageTitle = 'Atom Karbon-12 (6 Elektron)';
    stageSub = '99,9999% RUANG KOSONG KUANTUM';
    unitLbl = '1 ANGSTROM (0,1 NM)';
  } else {
    const p = K.pr(t, C.kuark.start, AM.duration);
    logM = lerp(-13, -15, p);
    stageIdx = 4;
    stageTitle = 'Inti Proton & Trio Kuark (u-u-d)';
    stageSub = 'DIIKAT MEDAN GLUON · SKALA FEMTOMETER';
    unitLbl = '1 FEMTOMETER';
  }

  K.drawDeepSpace(ctx, t, logM, { tint: '#2dd4bf' });
  K.drawMicroStage(ctx, t, stageIdx);
  K.drawScaleHUD(ctx, t, {
    exp: logM,
    unitLabel: unitLbl,
    title: stageTitle,
    subtitle: stageSub,
    stageTag: 'POWERS OF TEN · ZOOM IN MIKROKOSMOS KUANTUM',
  });
}

