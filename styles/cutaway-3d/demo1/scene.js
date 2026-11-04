// 3D Cutaway Explainer demo1 (~64s): "Isi Jam Tangan Mekanik — 28.800 Detak per Jam Tanpa Baterai"
// Dark PBR 3D studio cutaway & exploded view of a mechanical watch caliber.
import * as K from '/styles/cutaway-3d/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = {
  fps: 24,
  hold: 1,
  captions: {
    preset: 'clean',
    y: 1480,
    size: 52,
    box: { fill: 'rgba(8,12,20,.88)', pad: 16, radius: 12, border: 'rgba(60,232,255,.35)', borderW: 2 },
  },
};

let stage, watch, ui;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  stage = K.createStage(AM, { fov: 40 });
  ui = AM.layer('ui', { z: 2 });
  watch = K.buildMechanicalWatch(stage.scene);
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('whoosh', 0.4, { gain: 0.35 });
  AM.sfx('click', C.pegas.start, { gain: 0.4 });
  AM.sfx('pop', C.gigi.start + 0.3, { gain: 0.4, pitch: 1.1 });
  AM.sfx('click', C.detak.start + 0.2, { gain: 0.45 });
  AM.sfx('chime', C.hasil.start + 0.4, { gain: 0.45 });
}

export function render(t) {
  // Exploded view envelope: opens during hook -> stays open through pegas/gigi/detak -> reassembles on hasil
  const exOpen = K.pr(t, 1.2, 3.8);
  const exClose = K.pr(t, C.hasil.start, C.hasil.start + 2.4);
  const explode = clamp(exOpen - exClose);

  // Orbit camera smoothly around the watch caliber
  const camDist = lerp(9.2, 10.6, explode);
  const camAngle = -0.45 + t * 0.14;
  const camY = lerp(4.8, 3.6, explode) + Math.sin(t * 0.4) * 0.35;
  stage.cam.position.set(Math.sin(camAngle) * camDist, camY, Math.cos(camAngle) * camDist);
  stage.cam.lookAt(0, lerp(0.1, 0.35, explode), 0);

  const anchors = watch.update(t, {
    explode,
    rotY: t * 0.22,
    pitch: lerp(0.38, 0.22, explode),
  });

  stage.render();

  // 2D Studio HUD & Live Telemetry
  const beats = Math.floor(t * 8);
  K.drawStudioHUD(ui, t, {
    code: 'CALIBER 3D-CUTAWAY // 28.800 VPH',
    title: 'Isi Jam Tangan Mekanik',
    sub: explode > 0.2 ? 'MODE: EXPLODED VIEW (5 LAPISAN)' : 'MODE: CUTAWAY PENAMPANG UTUH',
    metricLabel: 'FREKUENSI',
    metricVal: '4,0 Hz',
    unit: `· DETAK #${beats}`,
  });

  // Beat 1 (hook): Cutaway Crystal & Case
  const aHook = env(t, 0.5, C.pegas.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.crystal, 90, 420, 'KACA SAFIR & CASING', 'BAJA 316L · TANPA BATERAI', aHook, { color: K.PAL.cyan });
  K.callout(ui, stage.cam, anchors.balance, 990, 560, '28.800 DETAK / JAM', '8 KETUKAN PRESISI / DETIK', aHook, { color: K.PAL.amber, align: 'right' });

  // Beat 2 (pegas): Mainspring Barrel
  const aPegas = env(t, C.pegas.start, C.gigi.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.barrel, 90, 520, 'MAINSPRING BARREL', 'PEGAS BAJA 50 CM · CADANGAN 40 JAM', aPegas, { color: K.PAL.amber });

  // Beat 3 (gigi): Gear Train & Synthetic Ruby Jewels
  const aGigi = env(t, C.gigi.start, C.detak.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.gears, 90, 460, 'RANGKAIAN RODA GIGI', 'TRANSMISI TORSI KUNINGAN PRESISI', aGigi, { color: K.PAL.cyan });
  K.callout(ui, stage.cam, anchors.ruby, 990, 620, 'PERMATA RUBI SINTETIS', 'KORUNDUM · GESEKAN POROS MINIMAL', aGigi, { color: K.PAL.ruby, align: 'right' });

  // Beat 4 (detak): Escapement & Balance Wheel
  const aDetak = env(t, C.detak.start, C.hasil.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.escapement, 90, 460, 'ESCAPEMENT WHEEL', 'PENGUNCI & PELEPAS DETAK', aDetak, { color: K.PAL.cyan });
  K.callout(ui, stage.cam, anchors.balance, 990, 600, 'BALANCE WHEEL (4 Hz)', 'OSILASI HARMONIS 28.800 VPH', aDetak, { color: K.PAL.amber, align: 'right' });

  // Bottom Spec Summary Card
  K.specPanel(
    ui,
    68,
    1220,
    944,
    132,
    'SPESIFIKASI KALIBER MEKANIK OTOMATIS',
    [
      ['ENERGI', 'PEGAS UTAMA', K.PAL.amber],
      ['BANTALAN', '17 PERMATA', K.PAL.ruby],
      ['DETAK', '28.800 / JAM', K.PAL.cyan],
      ['CADANGAN', '40 JAM PENUH', K.PAL.text],
    ],
    prog(t, 0.6, 1.4)
  );
}
