// 65 · STICKMAN DOODLE — Demo 3: Gaji Naik tapi Tabungan Nol (Efek Diderot & Lifestyle Creep).
import * as K from '/styles/stickman-doodle/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;
const { G } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1580, size: 58 } };

let ctx, fx;
const C = {};
const ART = [];
const pen = new K.Pen();
const PY = { hook: 760, creep: 2610, kunci: 4460 };
const pop = (t, a, d = 0.35) => ease.outBack(clamp((t - a) / d), 2);

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const R = K.PAL.red, B = K.PAL.blue;

  // Panel 1: Diderot Domino Chain
  const y1 = PY.hook;
  const d1 = new K.Sketch({ t0: 0.05, speed: 2500, seed: 21, gap: 0.03 });
  d1.text('GAJI NAIK = TABUNGAN Rp 0?', 565, y1 - 255, { size: 58, align: 'center', font: 'Permanent Marker', cps: 18 });
  for (let i = 0; i < 4; i++) {
    const dx = 430 + i * 115;
    d1.line(G.rect(dx, y1 - 80 - i * 18, 78, 175 + i * 18), { col: i === 0 ? R : K.PAL.ink, w: 6, dur: 0.14 });
  }
  d1.text('JUBAH → MEJA → KURSI → UTANG!', 650, y1 + 145, { size: 36, align: 'center', col: R, font: 'Permanent Marker', cps: 20 });
  ART.push(d1); pen.sketch(d1);

  // Panel 2: Lifestyle Creep & Hedonic Treadmill
  const y2 = PY.creep;
  const d2 = new K.Sketch({ t0: C.creep.start - 0.1, speed: 2600, seed: 22, gap: 0.03 });
  d2.line([[180, y2 + 160], [880, y2 - 140]], { col: B, w: 7, dur: 0.35 });
  d2.line([[180, y2 + 175], [880, y2 - 125]], { col: R, w: 7, dur: 0.35 });
  d2.text('GAJI NAIK = GAYA HIDUP NAIK!', 565, y2 - 235, { size: 52, align: 'center', col: R, font: 'Permanent Marker', cps: 18 });
  ART.push(d2); pen.sketch(d2);

  // Panel 3: Pay Yourself First 20% Vault & 72-Hour Rule
  const y3 = PY.kunci;
  const d3 = new K.Sketch({ t0: C.kunci.start - 0.1, speed: 2600, seed: 23, gap: 0.03 });
  d3.line(G.rect(580, y3 - 170, 290, 260), { col: B, w: 8, dur: 0.35 });
  d3.line(G.circle(725, y3 - 40, 62), { col: R, w: 6, dur: 0.25 });
  d3.text('TABUNG 20% DULU!', 565, y3 - 255, { size: 60, align: 'center', col: B, font: 'Permanent Marker', cps: 18 });
  ART.push(d3); pen.sketch(d3);
}

function kamuPose(t) {
  const y1 = PY.hook, y2 = PY.creep, y3 = PY.kunci;
  const blink = (t % 3.1) < 0.12 ? 1 : 0;

  if (t < C.creep.start - 0.1) {
    return {
      x: 260, y: y1 + 185, s: 1.22,
      face: 'shock', look: 0.7, blink, hair: 'tuft',
      arms: [[1.8, 0.4], [-1.5, -0.3]],
    };
  }
  if (t < C.kunci.start - 0.1) {
    return {
      x: 280, y: y2 + 185, s: 1.22,
      face: 'worried', look: 0.6, tilt: 0.1, blink, hair: 'tuft',
      arms: [[1.3, 1.3], [-1.3, -1.3]],
    };
  }
  return {
    x: 290, y: y3 + 185, s: 1.25,
    face: 'happy', look: 0.6, blink, hair: 'tuft', glasses: true,
    arms: [[2.2, 0.2], [-0.6, 0.5]],
  };
}

function panelExtras(t) {
  const R = K.PAL.red, B = K.PAL.blue;

  // Panel 1: Diderot Effect
  if (t < C.creep.start + 0.4) {
    const y1 = PY.hook;
    K.doodleHeader(ctx, 'PSIKOLOGI UANG • EFEK DIDEROT (1769)', 'SATU BARANG BARU MERembet KE SEMUA', 'Kisah Jubah Merah Denis Diderot yang Menguras Dompet', {
      x: 565, y: y1 - 470, a: pop(t, 0.05), col: R,
    });
    K.brainGuy(ctx, 845, y1 + 185, t, { s: 0.95 * pop(t, C.domino.start), run: t * 3.0, face: 'shock', look: -1 });
    K.doodleCard(ctx, 565, y1 + 365, 850, 155, {
      tag: 'EFEK DOMINO KONSUMSI',
      titleStr: 'Beli HP Baru → Beli Casing → Beli Earbuds → Cicilan',
      subStr: 'Satu pembelian memicu ketidakpuasan pada barang lama yang masih bagus',
      stat: 'DOMINO',
      statSub: 'EFEK DIDEROT',
      col: R,
      a: pop(t, C.diderot.start),
      seed: 912,
    });
  }

  // Panel 2: Lifestyle Creep
  if (t > C.creep.start - 0.5 && t < C.kunci.start + 0.4) {
    const y2 = PY.creep;
    K.doodleHeader(ctx, 'INFLASI GAYA HIDUP • LIFESTYLE CREEP', 'MEWAH KEMARIN JADI WAJIB HARI INI', 'Ketika Pengeluaran Selalu Mengejar Kenaikan Gaji', {
      x: 565, y: y2 - 470, a: pop(t, C.creep.start), col: B,
    });
    ctx.save();
    ctx.translate(650, y2 - 110);
    K.cloud(ctx, 0, 0, t, { s: 0.95, label: 'bocor halus', rain: true });
    ctx.restore();
    K.sweat(ctx, 280, y2 - 190, t, { n: 3, s: 1.2 });

    K.doodleCard(ctx, 565, y2 + 365, 850, 155, {
      tag: 'RODA TREADMILL HEDONIS',
      titleStr: 'Euforia Barang Baru Hilang, Cicilan Tetap Jalan',
      subStr: 'Kenaikan gaji habis oleh langganan bulanan & gengsi pergaulan',
      stat: 'Rp 0',
      statSub: 'SISA GAJI',
      col: B,
      a: pop(t, C.bocor.start),
      seed: 922,
    });
  }

  // Panel 3: Pay Yourself First & 72h Rule
  if (t > C.kunci.start - 0.5) {
    const y3 = PY.kunci;
    K.doodleHeader(ctx, 'STRATEGI ANTI-BOCOR • PAY YOURSELF FIRST', 'KUNCI 20% DI HARI PERTAMA GAJIAN!', 'Ditambah Aturan Jeda 72 Jam Sebelum Checkout Barang', {
      x: 565, y: y3 - 470, a: pop(t, C.kunci.start), col: B,
    });
    K.bubble(ctx, 430, y3 - 125, 310, 115, 340, y3 - 40, 'tunggu 72 jam!', {
      a: pop(t, C.jeda.start), size: 42, col: R, textCol: R,
    });
    K.brainGuy(ctx, 465, y3 + 185, t, { s: 0.95 * pop(t, C.kunci.start + 0.3), run: 0, face: 'happy', look: 1 });

    K.doodleCard(ctx, 565, y3 + 365, 850, 155, {
      tag: 'RUMUS KEBEBASAN FINANSIAL',
      titleStr: 'Kekayaan = Jarak Antara Penghasilan & Gengsi',
      subStr: 'Otomatisasi tabungan di awal bulan agar sisa uang bebas dipakai tanpa cemas',
      stat: '20% + 72J',
      statSub: 'AMAN TERKENDALI',
      col: R,
      a: pop(t, C.jeda.start + 0.2),
      seed: 932,
    });
  }
}

const ORDER = ['hook', 'creep', 'kunci'];
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
