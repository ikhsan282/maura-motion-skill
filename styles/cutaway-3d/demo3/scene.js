// 3D Cutaway Explainer demo3 (~65s): "Mesin Espresso 9 Bar — Fisika Tekanan Air Panas yang Melahirkan Crema Emas"
// Dark PBR 3D studio vertical exploded view & cutaway of a 9-bar espresso extraction assembly.
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

let stage, espresso, ui;
const C = {};

export async function setup(AM) {
  stage = K.createStage(AM, { fov: 40 });
  ui = AM.layer('ui', { z: 2 });
  espresso = K.buildEspressoCutaway(stage.scene);
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('whoosh', 0.4, { gain: 0.35 });
  AM.sfx('pop', C.boiler.start + 0.2, { gain: 0.4 });
  AM.sfx('click', C.tekanan.start + 0.2, { gain: 0.45 });
  AM.sfx('bubble', C.puck.start + 0.3, { gain: 0.38 });
  AM.sfx('chime', C.crema.start + 0.3, { gain: 0.45 });
}

export function render(t) {
  const exOpen = K.pr(t, 1.3, 4.0);
  const exClose = K.pr(t, C.crema.start + 1.8, C.crema.end - 0.5);
  const explode = clamp(exOpen - exClose);

  const camDist = lerp(9.8, 11.4, explode);
  const angle = -0.35 + Math.sin(t * 0.3) * 0.25;
  stage.cam.position.set(Math.sin(angle) * camDist, 2.2 + Math.sin(t * 0.35) * 0.3, Math.cos(angle) * camDist);
  stage.cam.lookAt(0, 0.1, 0);

  const brew = clamp(prog(t, C.puck.start, C.crema.start + 1.5));
  const anchors = espresso.update(t, {
    explode,
    yaw: -0.3,
    pitch: 0.16,
    brew: t < C.puck.start ? 0.55 : brew,
  });

  stage.render();

  K.drawStudioHUD(ui, t, {
    code: 'ESPRESSO EXTRACTION // E61 CUTAWAY',
    title: 'Mesin Espresso 9 Bar',
    sub: 'TERMODINAMIKA & EMULSI TEKANAN TINGGI',
    metricLabel: 'TEKANAN EKSTRAKSI',
    metricVal: '9,0 BAR',
    unit: '· 93,0 °C',
  });

  // Beat 1 (hook): Boiler + Crema overview
  const aHook = env(t, 0.5, C.boiler.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.gauge, 85, 430, 'MANOMETER 9 BAR', '9× TEKANAN ATMOSFER BUMI', aHook, { color: K.PAL.cyan });
  K.callout(ui, stage.cam, anchors.crema, 995, 650, 'LAPISAN CREMA EMAS', 'EMULSI MINYAK & MIKRO-CO₂', aHook, { color: K.PAL.amber, align: 'right' });

  // Beat 2 (boiler): Copper Boiler & Heating Element
  const aBoiler = env(t, C.boiler.start, C.tekanan.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.boiler, 995, 430, 'BOILER TEMBAGA & SPIRAL', 'SUHU AIR PRESISI 93 °C (PID)', aBoiler, { color: K.PAL.flame, align: 'right' });

  // Beat 3 (tekanan): Brass Grouphead & 9 Bar Pressure
  const aTekan = env(t, C.tekanan.start, C.puck.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.gauge, 85, 450, 'POMPA ROTARI 9 BAR', 'SETARA KEDALAMAN LAUT 80 METER', aTekan, { color: K.PAL.cyan });
  K.callout(ui, stage.cam, anchors.group, 995, 560, 'GROUPHEAD KUNINGAN E61', 'SHOWER SCREEN DISTRIBUSI MERATA', aTekan, { color: K.PAL.amber, align: 'right' });

  // Beat 4 (puck): Portafilter & Tamped Coffee Puck
  const aPuck = env(t, C.puck.start, C.crema.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.puck, 995, 570, 'TAMPED COFFEE PUCK (18g)', 'HAMBATAN HIDRAULIK → EMULSI LIPID', aPuck, { color: K.PAL.amber, align: 'right' });

  // Beat 5 (crema): Golden Crema Layer in Cup
  const aCrema = env(t, C.crema.start, AM.duration, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.crema, 85, 640, 'EKSPANSI GELEMBUNG CO₂', 'BUSA MIKRO PENGUNCI AROMA KOPI', aCrema, { color: K.PAL.amber });

  K.specPanel(
    ui,
    68,
    1220,
    944,
    132,
    'PARAMETER EKSTRAKSI ESPRESSO STANDAR BARISTA',
    [
      ['SUHU AIR', '93,0 °C', K.PAL.flame],
      ['TEKANAN', '9,0 BAR', K.PAL.cyan],
      ['DOSIS BUBUK', '18 GRAM', K.PAL.amber],
      ['WAKTU SEDUH', '25–30 DETIK', K.PAL.text],
    ],
    prog(t, 0.6, 1.4)
  );
}
