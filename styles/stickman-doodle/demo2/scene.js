// 65 · STICKMAN DOODLE — Demo 2: Jebakan Dunning-Kruger (Gunung Kebodohan → Lembah → Pencerahan).
import * as K from '/styles/stickman-doodle/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;
const { G } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1580, size: 58 } };

let ctx, fx;
const C = {};
const ART = [];
const pen = new K.Pen();
const PY = { hook: 760, lembah: 2610, lereng: 4460 };
const pop = (t, a, d = 0.35) => ease.outBack(clamp((t - a) / d), 2);

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const R = K.PAL.red, B = K.PAL.blue;

  // Panel 1: Mount Stupid curve drawn live with marker
  const y1 = PY.hook;
  const d1 = new K.Sketch({ t0: 0.05, speed: 2400, seed: 11, gap: 0.03 });
  d1.line([[160, y1 + 190], [160, y1 - 290]], { w: 6, dur: 0.2 });
  d1.line([[160, y1 + 190], [950, y1 + 190]], { w: 6, dur: 0.22 });
  d1.line(G.spline([[170, y1 + 170], [340, y1 - 160], [560, y1 + 135], [890, y1 - 90]], 12), { col: R, w: 8, dur: 0.55 });
  d1.text('GUNUNG KEBODOHAN!', 615, y1 - 245, { size: 46, align: 'center', col: R, font: 'Permanent Marker', cps: 18 });
  ART.push(d1); pen.sketch(d1);

  // Panel 2: Valley of Despair sketch
  const y2 = PY.lembah;
  const d2 = new K.Sketch({ t0: C.lembah.start - 0.1, speed: 2600, seed: 12, gap: 0.03 });
  d2.line([[150, y2 - 220], [380, y2 + 185], [760, y2 + 185], [940, y2 - 90]], { col: B, w: 7, dur: 0.45 });
  d2.text('LEMBAH KEPUTUSASAAN', 565, y2 - 230, { size: 54, align: 'center', col: B, font: 'Permanent Marker', cps: 18 });
  ART.push(d2); pen.sketch(d2);

  // Panel 3: Slope of Enlightenment & Plateau of Sustainability
  const y3 = PY.lereng;
  const d3 = new K.Sketch({ t0: C.lereng.start - 0.1, speed: 2600, seed: 13, gap: 0.03 });
  d3.line([[170, y3 + 185], [520, y3 - 20], [890, y3 - 95]], { col: B, w: 8, dur: 0.45 });
  d3.text('LERENG PENCERAHAN', 565, y3 - 255, { size: 58, align: 'center', col: R, font: 'Permanent Marker', cps: 18 });
  ART.push(d3); pen.sketch(d3);
}

function kamuPose(t) {
  const y1 = PY.hook, y2 = PY.lembah, y3 = PY.lereng;
  const blink = (t % 3.0) < 0.12 ? 1 : 0;

  if (t < C.lembah.start - 0.1) {
    return {
      x: 340, y: y1 + 170, s: 1.22,
      face: 'grin', look: 0.6, blink, hair: 'spiky', glasses: true,
      arms: [[2.5, 0.2], [-2.4, -0.2]],
      legs: [[0.25, 0], [-0.25, 0]],
    };
  }
  if (t < C.lereng.start - 0.1) {
    return {
      x: 430, y: y2 + 185, s: 1.22,
      face: 'worried', look: -0.2, tilt: 0.14, blink, hair: 'tuft',
      arms: [[1.3, 1.4], [-1.3, -1.4]],
      legs: [[0.2, 0], [-0.2, 0]],
    };
  }
  const p = prog(t, C.lereng.start, C.akhir.start);
  return {
    x: lerp(260, 560, p), y: y3 + 185, s: 1.22,
    face: 'happy', look: 0.5, blink, hair: 'tuft', glasses: true, pointer: 45,
    arms: [[1.7, -0.3], [-0.5, 0.4]],
    legs: [[0.22, 0], [-0.22, 0]],
  };
}

function panelExtras(t) {
  const R = K.PAL.red, B = K.PAL.blue;

  // Panel 1: Mount Stupid
  if (t < C.lembah.start + 0.4) {
    const y1 = PY.hook;
    K.doodleHeader(ctx, 'BIAS KOGNITIF • DUNNING-KRUGER (1999)', 'BARU TAHU SEDIKIT, MERASA SUHU!', 'Ketika 10 Menit Tutorial Melahirkan Kepercayaan Diri 100%', {
      x: 565, y: y1 - 470, a: pop(t, 0.05), col: R,
    });
    K.bubble(ctx, 680, y1 - 95, 340, 125, 410, y1 - 160, 'GAMPANG BANGET!', {
      a: pop(t, C.puncak.start), size: 42, shout: true, font: 'Permanent Marker', textCol: R, col: R,
    });
    K.brainGuy(ctx, 760, y1 + 175, t, { s: 0.95 * pop(t, C.gunung.start), run: 0, face: 'happy', look: -1 });

    K.doodleCard(ctx, 565, y1 + 365, 850, 155, {
      tag: 'FASE 1: PUNCAK GUNUNG KEBODOHAN',
      titleStr: 'Kompetensi Rendah, Kepercayaan Diri Maksimal',
      subStr: 'Belum memiliki bekal ilmu untuk mengenali kesalahan sendiri',
      stat: 'PD 99%',
      statSub: 'ILMU 5%',
      col: R,
      a: pop(t, C.puncak.start + 0.2),
      seed: 911,
    });
  }

  // Panel 2: Valley of Despair
  if (t > C.lembah.start - 0.5 && t < C.lereng.start + 0.4) {
    const y2 = PY.lembah;
    K.doodleHeader(ctx, 'FASE 2 • BENTURAN REALITAS PRAKTIK', 'TERJUN KE LEMBAH KEPUTUSASAAN', 'Saat Sadar Bahwa Ilmu Sebenarnya Jauh Lebih Rumit', {
      x: 565, y: y2 - 470, a: pop(t, C.lembah.start), col: B,
    });
    ctx.save();
    ctx.translate(430, y2 - 220);
    K.cloud(ctx, 0, 0, t, { s: 1.05, label: 'ternyata susah!', rain: true });
    ctx.restore();
    K.sweat(ctx, 430, y2 - 190, t, { n: 3, s: 1.2 });
    K.brainGuy(ctx, 740, y2 + 185, t, { s: 0.95 * pop(t, C.sadar.start), run: t * 2.2, face: 'shock', look: -1 });

    K.doodleCard(ctx, 565, y2 + 365, 850, 155, {
      tag: 'TITIK RAWAN MENYERAH',
      titleStr: 'Bukan Bodoh, Tapi Mulai Melihat Peta Utuh',
      subStr: 'Rasa minder di fase ini justru bukti bahwa wawasanmu mulai terbuka',
      stat: 'DROP!',
      statSub: 'FASE KRITIS',
      col: B,
      a: pop(t, C.sadar.start),
      seed: 921,
    });
  }

  // Panel 3: Slope of Enlightenment
  if (t > C.lereng.start - 0.5) {
    const y3 = PY.lereng;
    K.doodleHeader(ctx, 'FASE 3 & 4 • LERENG PENCERAHAN & KEAHLIAN', 'MAKIN BERILMU, MAKIN RENDAH HATI', 'Menguji Pemahaman Lewat Praktik & Umpan Balik Nyata', {
      x: 565, y: y3 - 470, a: pop(t, C.lereng.start), col: R,
    });
    K.bubble(ctx, 720, y3 - 150, 350, 120, 560, y3 - 90, 'terus belajar!', {
      a: pop(t, C.ahli.start), size: 46, col: B, textCol: B,
    });
    K.brainGuy(ctx, 810, y3 + 185, t, { s: 1.0 * pop(t, C.lereng.start + 0.3), run: 0, face: 'happy', look: -1 });

    K.doodleCard(ctx, 565, y3 + 365, 850, 155, {
      tag: 'TANDA PEMBELAJAR SEJATI',
      titleStr: 'Rasa Bingung Adalah Sinyal Otak Sedang Tumbuh',
      subStr: 'Keahlian sejati lahir dari jam terbang, evaluasi, dan kerendahan hati',
      stat: 'BERTUMBUH',
      statSub: 'ILMU MATANG',
      col: R,
      a: pop(t, C.resep.start),
      seed: 931,
    });
  }
}

const ORDER = ['hook', 'lembah', 'lereng'];
function camAt(t) {
  let k = 0;
  for (let i = 0; i < ORDER.length; i++) if (C[ORDER[i]] && t >= C[ORDER[i]].start - 0.15) k = i;
  const id = ORDER[k], a = C[id].start - 0.15, prevY = k ? PY[ORDER[k - 1]] : PY.hook;
  const f = ease.inOutCubic(clamp((t - a) / 0.55));
  return [540, lerp(prevY, PY[id], f) - 20, 1.0];
}

export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  K.setBoil(t, 1.6, 12);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.notebook(ctx);
  for (const d of ART) d.draw(ctx, t);
  panelExtras(t);
  const kp = kamuPose(t);
  const rv = t < 0.9 ? clamp((t - 0.1) / 0.8) : 1;
  if (rv > 0) K.stickDraw(ctx, kp, t, { reveal: rv });
  const st = pen.at(t) || (t < 0.9 && t > 0.1 ? K.stickTip(kp, rv) : null);
  K.markerFor(ctx, st, { s: 1 / z });
  AM.lib.vignette(fx, { strength: 0.16, inner: 0.58, color: '70,50,20' });
}
