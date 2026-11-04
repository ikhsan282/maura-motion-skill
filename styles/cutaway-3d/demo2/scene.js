// 3D Cutaway Explainer demo2 (~64s): "Mesin Jet Turbofan — Hisap, Tekan, Bakar, Hembus di Ketinggian 10 Kilometer"
// Dark PBR 3D studio axial exploded view & cutaway of a commercial high-bypass turbofan engine.
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

let stage, jet, ui;
const C = {};

export async function setup(AM) {
  stage = K.createStage(AM, { fov: 42 });
  ui = AM.layer('ui', { z: 2 });
  jet = K.buildJetTurbofan(stage.scene);
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('whoosh', 0.4, { gain: 0.4 });
  AM.sfx('swoosh_up', C.hisap.start + 0.2, { gain: 0.35 });
  AM.sfx('pop', C.tekan.start + 0.2, { gain: 0.4 });
  AM.sfx('whoosh', C.bakar.start + 0.2, { gain: 0.45, pitch: 0.85 });
  AM.sfx('chime', C.hembus.start + 0.3, { gain: 0.45 });
}

export function render(t) {
  const exOpen = K.pr(t, 1.4, 4.2);
  const exClose = K.pr(t, C.hembus.start + 2.5, C.hembus.end - 0.5);
  const explode = clamp(exOpen - exClose);

  // Camera orbits around the axial turbofan
  const camDist = lerp(10.5, 12.8, explode);
  const yaw = -0.62 + Math.sin(t * 0.28) * 0.22;
  stage.cam.position.set(Math.sin(yaw) * camDist, 3.2 + Math.sin(t * 0.35) * 0.4, Math.cos(yaw) * camDist);
  stage.cam.lookAt(0, 0, 0);

  const anchors = jet.update(t, {
    explode,
    yaw: -0.52 + t * 0.08,
    pitch: 0.18,
    rpm: 1.15,
    burn: 1.0,
  });

  stage.render();

  K.drawStudioHUD(ui, t, {
    code: 'TURBOFAN HIGH-BYPASS // CUTAWAY 3D',
    title: 'Mesin Jet Turbofan',
    sub: 'SIKLUS BRAYTON: HISAP · TEKAN · BAKAR · HEMBUS',
    metricLabel: 'SUHU INTI',
    metricVal: '1.700°C',
    unit: '· 30:1 RASIO',
  });

  // Beat 1 (hook): Overview of Fan + Combustor
  const aHook = env(t, 0.5, C.hisap.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.fan, 85, 430, '1. HISAP & 2. TEKAN', 'KIPAS TITANIUM + KOMPRESOR', aHook, { color: K.PAL.cyan });
  K.callout(ui, stage.cam, anchors.comb, 995, 580, '3. BAKAR & 4. HEMBUS', 'RUANG BAKAR + TURBIN PENGGERAK', aHook, { color: K.PAL.amber, align: 'right' });

  // Beat 2 (hisap): Titanium Intake Fan
  const aHisap = env(t, C.hisap.start, C.tekan.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.fan, 85, 470, 'TAHAP 1: KIPAS TITANIUM', 'MENGHISAP > 1.200 KG UDARA / DETIK', aHisap, { color: K.PAL.cyan });

  // Beat 3 (tekan): Multi-Stage Axial Compressor
  const aTekan = env(t, C.tekan.start, C.bakar.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.comp, 85, 480, 'TAHAP 2: KOMPRESOR AKSIAL', 'TEKANAN UDARA NAIK 30× LIPAT', aTekan, { color: K.PAL.amber });

  // Beat 4 (bakar): Annular Combustion Chamber
  const aBakar = env(t, C.bakar.start, C.hembus.start + 0.2, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.comb, 995, 520, 'TAHAP 3: RUANG BAKAR', 'SEMBURAN AVTUR · API 1.700°C', aBakar, { color: K.PAL.flame, align: 'right' });

  // Beat 5 (hembus): Turbine + Exhaust Nozzle
  const aHembus = env(t, C.hembus.start, AM.duration, 0.4, 0.4);
  K.callout(ui, stage.cam, anchors.turb, 85, 460, 'TURBIN TEKANAN TINGGI', 'MEMUTAR POROS KIPAS DEPAN', aHembus, { color: K.PAL.amber });
  K.callout(ui, stage.cam, anchors.nozzle, 995, 620, 'TAHAP 4: NOSEL BUANG', 'SEMBURAN GAS → DAYA DORONG', aHembus, { color: K.PAL.cyan, align: 'right' });

  K.specPanel(
    ui,
    68,
    1220,
    944,
    132,
    'PARAMETER OPERASI TURBOFAN KOMERSIAL',
    [
      ['UDARA MASUK', '1,2 TON / DTK', K.PAL.cyan],
      ['KOMPRESI', '30 : 1 RASIO', K.PAL.amber],
      ['PEMBAKARAN', '1.700 °C', K.PAL.flame],
      ['KECEPATAN JELAJAH', '900 KM / JAM', K.PAL.text],
    ],
    prog(t, 0.6, 1.4)
  );
}
