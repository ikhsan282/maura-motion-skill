// Rahasia Konstruksi Candi Borobudur Tanpa Semen (style: sketsa-pensil, demo3).
import * as K from '/styles/sketsa-pensil/kit.js';
const P = K.PAL, G = K.G, { clamp, lerp, ease, TAU } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1478, size: 64 } };

let ctx, C, W;
const SHEET = [0, 0, 2240, 6000];

const Z1 = { x: 1120, y: 740 };   // 1. Siluet Borobudur: 2 Juta Batu, 0% Semen
const Z2 = { x: 1120, y: 1540 };  // 2. Tumpukan Batu Polos Runtuh & Dihapus
const Z3 = { x: 1120, y: 2340 };  // 3. Arsitek Gunadharma (Abad ke-8)
const Z4 = { x: 1120, y: 3140 };  // 4. Sambungan Tanggam & Kunci Ekor Burung
const Z5 = { x: 1120, y: 3960 };  // 5. Sistem Drainase & 100 Pancuran Makara
const Z6 = { x: 1120, y: 4780 };  // 6. Distribusi Beban Piramida Berundak
const Z7 = { x: 1120, y: 5520 };  // 7. Kesimpulan Mahakarya Nusantara

let sk1, sk2, sk3, sk4, sk5, sk6, sk7;
let figEnd = 0;
let PEN;

const arrow = (x0, y0, x1, y1, head = 20) => {
  const a = Math.atan2(y1 - y0, x1 - x0);
  return [
    [[x0, y0], [x1, y1]],
    [[x1 - Math.cos(a - 0.55) * head, y1 - Math.sin(a - 0.55) * head], [x1, y1], [x1 - Math.cos(a + 0.55) * head, y1 - Math.sin(a + 0.55) * head]],
  ];
};

function buildSketches() {
  PEN = new K.Pen();

  // ---- ZONE 1: Siluet Candi Borobudur ----
  sk1 = new K.Sketch({ t0: 0.15, speed: 1550, seed: 101, gap: 0.03 });
  sk1.blue(G.line(Z1.x, Z1.y - 250, Z1.x, Z1.y + 200));
  sk1.blue(G.line(Z1.x - 450, Z1.y + 160, Z1.x + 450, Z1.y + 160));
  // Stepped terraces of Borobudur
  sk1.line(G.rect(Z1.x - 390, Z1.y + 90, 780, 70), { w: 4 });
  sk1.line(G.rect(Z1.x - 310, Z1.y + 25, 620, 65), { w: 4 });
  sk1.line(G.rect(Z1.x - 230, Z1.y - 35, 460, 60), { w: 4 });
  // Small stupas on terraces
  for (const dx of [-250, -140, 140, 250]) {
    sk1.line([[Z1.x + dx - 22, Z1.y + 25], [Z1.x + dx, Z1.y - 20], [Z1.x + dx + 22, Z1.y + 25]], { w: 3 });
  }
  // Main central stupa bell + spire
  sk1.line([
    [Z1.x - 85, Z1.y - 35], [Z1.x - 65, Z1.y - 135],
    [Z1.x, Z1.y - 165], [Z1.x + 65, Z1.y - 135], [Z1.x + 85, Z1.y - 35],
  ], { w: 4.5 });
  sk1.line([[Z1.x - 14, Z1.y - 165], [Z1.x, Z1.y - 245], [Z1.x + 14, Z1.y - 165]], { w: 4 });
  sk1.hatch(G.rect(Z1.x - 380, Z1.y + 95, 760, 60), { step: 14, angle: 0.6, w: 1.8, col: P.soft });

  sk1.at(Math.max(sk1.end, W('hook', 'dua') - 0.25));
  sk1.text('2.000.000 BALOK BATU ANDESIT', Z1.x, Z1.y + 225, { size: 48, col: P.ink });
  sk1.at(Math.max(sk1.end, W('hook', 'semen') - 0.3));
  sk1.text('TANPA SEMEN — KOKOH 1.200 TAHUN!', Z1.x, Z1.y + 285, { size: 54, col: P.red });
  PEN.sketch(sk1);

  // ---- ZONE 2: Batu Ditumpuk Polos -> Runtuh Saat Gempa -> Dihapus ----
  sk2 = new K.Sketch({ t0: C.tumpuk.start + 0.08, speed: 1600, seed: 102, gap: 0.03 });
  sk2.blue(G.rect(Z2.x - 400, Z2.y - 200, 800, 410));
  // Plain un-locked bricks sliding apart
  sk2.line(G.rect(Z2.x - 210, Z2.y + 60, 200, 75), { w: 3.8 });
  sk2.line(G.rect(Z2.x + 10, Z2.y + 60, 200, 75), { w: 3.8 });
  sk2.line(G.rect(Z2.x - 160, Z2.y - 25, 200, 75), { w: 3.8 });
  sk2.line(G.rect(Z2.x + 65, Z2.y - 20, 200, 75), { w: 3.8 });
  sk2.line(G.rect(Z2.x - 60, Z2.y - 115, 200, 75), { w: 3.8 });
  sk2.at(Math.max(sk2.end, W('tumpuk', 'gempa') - 0.25));
  for (const s of arrow(Z2.x - 340, Z2.y, Z2.x - 200, Z2.y, 22)) sk2.red(s, { w: 4.5 });
  for (const s of arrow(Z2.x + 210, Z2.y - 60, Z2.x + 340, Z2.y - 40, 22)) sk2.red(s, { w: 4.5 });
  sk2.text('TUMPUKAN POLOS: GESER & ROBOH!', Z2.x, Z2.y + 195, { size: 52, col: P.red });
  PEN.sketch(sk2);

  // ---- ZONE 3: Arsitek Gunadharma (Abad ke-8) ----
  const figStart = C.arsitek.start + 0.08;
  figEnd = figStart + 1.1;
  PEN.add(figStart, figEnd, (t) => K.figureTip(gunadharmaPose(0), (t - figStart) / 1.1));

  sk3 = new K.Sketch({ t0: figEnd + 0.05, speed: 1550, seed: 103, gap: 0.03 });
  // Scroll / blueprint table next to Gunadharma
  sk3.line(G.rrect(Z3.x + 90, Z3.y - 110, 290, 190, 16), { w: 3.8 });
  sk3.blue(G.circle(Z3.x + 235, Z3.y - 15, 65));
  sk3.blue(G.rect(Z3.x + 170, Z3.y - 80, 130, 130));
  sk3.text('GUNADHARMA (ABAD KE-8)', Z3.x, Z3.y - 245, { size: 50, col: P.ink });
  sk3.text('REKAYASA MANDALA & KUNCI BATU', Z3.x, Z3.y + 235, { size: 50, col: P.red });
  PEN.sketch(sk3);

  // ---- ZONE 4: Sambungan Tanggam & Kunci Ekor Burung (Dovetail Joint) ----
  sk4 = new K.Sketch({ t0: C.tanggam.start + 0.08, speed: 1500, seed: 104, gap: 0.03 });
  sk4.blue(G.rect(Z4.x - 430, Z4.y - 210, 860, 440));
  // Left stone block with socket
  sk4.line([
    [Z4.x - 370, Z4.y - 110], [Z4.x - 20, Z4.y - 110],
    [Z4.x - 20, Z4.y + 70], [Z4.x - 370, Z4.y + 70], [Z4.x - 370, Z4.y - 110],
  ], { w: 4.2 });
  // Right stone block locked beside it
  sk4.line([
    [Z4.x + 20, Z4.y - 110], [Z4.x + 370, Z4.y - 110],
    [Z4.x + 370, Z4.y + 70], [Z4.x + 20, Z4.y + 70], [Z4.x + 20, Z4.y - 110],
  ], { w: 4.2 });
  sk4.hatch(G.rect(Z4.x - 355, Z4.y - 95, 220, 150), { step: 14, angle: 0.6, w: 1.6, col: P.soft });
  sk4.hatch(G.rect(Z4.x + 135, Z4.y - 95, 220, 150), { step: 14, angle: -0.6, w: 1.6, col: P.soft });

  // Red Dovetail Key (Kunci Ekor Burung) locking both blocks across the seam
  sk4.at(Math.max(sk4.end, W('tanggam', 'ekor') - 0.35));
  const dovetail = [
    [Z4.x - 115, Z4.y - 65], [Z4.x - 35, Z4.y - 30], [Z4.x + 35, Z4.y - 30],
    [Z4.x + 115, Z4.y - 65], [Z4.x + 115, Z4.y + 25], [Z4.x + 35, Z4.y - 10],
    [Z4.x - 35, Z4.y - 10], [Z4.x - 115, Z4.y + 25], [Z4.x - 115, Z4.y - 65],
  ];
  sk4.red(dovetail, { w: 5 });
  sk4.hatch(G.rect(Z4.x - 105, Z4.y - 55, 210, 70), { step: 10, angle: 0.78, w: 2, col: P.red });
  sk4.text('SAMBUNGAN EKOR BURUNG (DOVETAIL)', Z4.x, Z4.y - 165, { size: 48, col: P.ink });
  sk4.text('MENGUNCI GESERAN HORIZONTAL & VERTIKAL!', Z4.x, Z4.y + 150, { size: 48, col: P.red });
  PEN.sketch(sk4);

  // ---- ZONE 5: Saluran Drainase Dalam & 100 Pancuran Makara (Jaladwara) ----
  sk5 = new K.Sketch({ t0: C.drainase.start + 0.08, speed: 1550, seed: 105, gap: 0.03 });
  // Stepped wall cross-section
  sk5.line([
    [Z5.x - 320, Z5.y - 150], [Z5.x - 80, Z5.y - 150],
    [Z5.x - 80, Z5.y - 20], [Z5.x + 160, Z5.y - 20],
    [Z5.x + 160, Z5.y + 130], [Z5.x - 320, Z5.y + 130], [Z5.x - 320, Z5.y - 150],
  ], { w: 4.2 });
  // Carved Jaladwara / Makara gargoyle spout sticking out
  sk5.line([
    [Z5.x + 160, Z5.y - 5], [Z5.x + 255, Z5.y - 15],
    [Z5.x + 265, Z5.y + 25], [Z5.x + 160, Z5.y + 25],
  ], { w: 4 });
  // Internal hidden water pipe + water stream pouring out
  sk5.at(Math.max(sk5.end, W('drainase', 'saluran') - 0.25));
  sk5.red([
    [Z5.x - 180, Z5.y - 145], [Z5.x - 180, Z5.y + 10],
    [Z5.x + 265, Z5.y + 10], [Z5.x + 350, Z5.y + 95], [Z5.x + 380, Z5.y + 165],
  ], { w: 5 });
  sk5.text('PIPA DRAINASE TERSEMBUNYI', Z5.x - 60, Z5.y - 190, { size: 46, col: P.ink });
  sk5.text('100 PANCURAN MAKARA (JALADWARA)', Z5.x + 40, Z5.y + 205, { size: 50, col: P.red });
  PEN.sketch(sk5);

  // ---- ZONE 6: Distribusi Beban Piramida Berundak ----
  sk6 = new K.Sketch({ t0: C.pondasi.start + 0.08, speed: 1550, seed: 106, gap: 0.03 });
  // Natural hill curve underneath
  sk6.blue([
    [Z6.x - 420, Z6.y + 140], [Z6.x - 220, Z6.y - 30],
    [Z6.x, Z6.y - 80], [Z6.x + 220, Z6.y - 30], [Z6.x + 420, Z6.y + 140],
  ]);
  // Stepped pyramid mantle hugging the hill
  sk6.line([
    [Z6.x - 410, Z6.y + 140], [Z6.x - 360, Z6.y + 60], [Z6.x - 240, Z6.y + 60],
    [Z6.x - 200, Z6.y - 20], [Z6.x - 90, Z6.y - 20], [Z6.x, Z6.y - 120],
    [Z6.x + 90, Z6.y - 20], [Z6.x + 200, Z6.y - 20], [Z6.x + 240, Z6.y + 60],
    [Z6.x + 360, Z6.y + 60], [Z6.x + 410, Z6.y + 140], [Z6.x - 410, Z6.y + 140],
  ], { w: 4.2, ruler: true });
  // Outward & downward force vectors
  sk6.at(Math.max(sk6.end, W('pondasi', 'menyebarkan') - 0.25));
  for (const [x0, y0, x1, y1] of [
    [Z6.x, Z6.y - 60, Z6.x, Z6.y + 125],
    [Z6.x - 120, Z6.y, Z6.x - 240, Z6.y + 125],
    [Z6.x + 120, Z6.y, Z6.x + 240, Z6.y + 125],
  ]) {
    for (const s of arrow(x0, y0, x1, y1, 20)) sk6.red(s, { w: 4.5 });
  }
  sk6.text('TERAS BERUNDAK MENYEBARKAN BEBAN', Z6.x, Z6.y - 175, { size: 48, col: P.ink });
  sk6.text('STABIL MENGIKUTI PUNGGUNG BUKIT!', Z6.x, Z6.y + 205, { size: 52, col: P.red });
  PEN.sketch(sk6);

  // ---- ZONE 7: Warisan Mahakarya Nusantara ----
  sk7 = new K.Sketch({ t0: C.warisan.start + 0.08, speed: 1550, seed: 107, gap: 0.03 });
  sk7.line(G.rrect(Z7.x - 430, Z7.y - 150, 860, 300, 22), { w: 4.5 });
  sk7.text('KUNCI TANGGAM + DRAINASE + PIRAMIDA', Z7.x, Z7.y - 55, { size: 46, col: P.ink });
  sk7.text('MAHAKARYA TEKNIK NUSANTARA!', Z7.x, Z7.y + 35, { size: 60, col: P.red });
  sk7.red(G.line(Z7.x - 340, Z7.y + 82, Z7.x + 340, Z7.y + 82), { w: 4.5, ruler: true });
  PEN.sketch(sk7);
}

function gunadharmaPose(t) {
  const nod = Math.sin(t * 4) * 0.05;
  return {
    x: Z3.x - 160, y: Z3.y + 165, s: 0.95,
    lean: 0.04 + nod, look: 0.65,
    arms: [[1.35, 0.35], [-0.35, -0.4]],
    legs: [[0.1, 0], [-0.1, 0]],
    face: 'smile', mouth: 0.2,
  };
}

function cameraAt(t, dur) {
  const kf = [
    { t: 0,                      x: Z1.x, y: Z1.y + 40, z: 0.94, r: 0 },
    { t: C.tumpuk.start - 0.1,   x: Z1.x, y: Z1.y + 60, z: 0.94, r: 0 },
    { t: C.tumpuk.start + 0.55,  x: Z2.x, y: Z2.y + 20, z: 0.96, r: 0.008 },
    { t: C.arsitek.start - 0.1,  x: Z2.x, y: Z2.y + 30, z: 0.96, r: 0.008 },
    { t: C.arsitek.start + 0.55, x: Z3.x, y: Z3.y + 10, z: 0.96, r: -0.008 },
    { t: C.tanggam.start - 0.1,  x: Z3.x, y: Z3.y + 10, z: 0.96, r: -0.008 },
    { t: C.tanggam.start + 0.55, x: Z4.x, y: Z4.y,      z: 0.98, r: 0 },
    { t: C.drainase.start - 0.1, x: Z4.x, y: Z4.y,      z: 0.98, r: 0 },
    { t: C.drainase.start + 0.55,x: Z5.x, y: Z5.y + 10, z: 0.96, r: 0.006 },
    { t: C.pondasi.start - 0.1,  x: Z5.x, y: Z5.y + 10, z: 0.96, r: 0.006 },
    { t: C.pondasi.start + 0.55, x: Z6.x, y: Z6.y + 20, z: 0.95, r: -0.006 },
    { t: C.warisan.start - 0.1,  x: Z6.x, y: Z6.y + 20, z: 0.95, r: -0.006 },
    { t: C.warisan.start + 0.5,  x: Z7.x, y: Z7.y,      z: 0.96, r: 0 },
    { t: dur,                    x: 1120, y: 4550,      z: 0.56, r: 0 },
  ];
  let i = 0;
  while (i + 1 < kf.length && kf[i + 1].t < t) i++;
  const a = kf[i], b = kf[Math.min(i + 1, kf.length - 1)];
  const u = a.t === b.t ? 1 : ease.inOutCubic(clamp((t - a.t) / (b.t - a.t)));
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: lerp(a.z, b.z, u), r: lerp(a.r, b.r, u) };
}

export function setup(AM) {
  ctx = AM.layer('world');
  C = {};
  for (const l of AM.timeline.lines) C[l.id] = l;
  W = (id, w) => AM.wordTime(id, w);
  buildSketches();

  AM.sfx('scribble', 0.25);
  AM.sfx('chime', W('hook', 'semen'));
  AM.sfx('scribble', C.tumpuk.start + 0.2);
  AM.sfx('drum_hit', W('tumpuk', 'gempa'));
  AM.sfx('pop', C.arsitek.start + 0.15);
  AM.sfx('tick', W('tanggam', 'ekor'));
  AM.sfx('whoosh', W('drainase', 'saluran'));
  AM.sfx('tick', W('pondasi', 'menyebarkan'));
  AM.sfx('chime', C.warisan.start + 0.3);
}

export function render(t, AM) {
  const ts = Math.floor(t * 12) / 12;
  const cm = cameraAt(t, AM.duration);
  const jx = K.noise.n2(ts * 7, 1) * 1.4, jy = K.noise.n2(ts * 7, 9) * 1.4;
  K.cam(ctx, cm.x + jx, cm.y + jy, cm.z, cm.r);

  K.sheet(ctx, SHEET);

  K.smudge(ctx, Z1.x + 260, Z1.y + 110, 90, { alpha: 0.16, rot: 0.2 });
  K.smudge(ctx, Z4.x - 240, Z4.y + 60, 85, { alpha: 0.16, rot: -0.25 });
  K.note(ctx, 'Arsip Konstruksi Nusantara #08', Z1.x - 420, Z1.y - 280, { size: 38, col: P.faint, align: 'left', rot: -0.02 });

  sk1.draw(ctx, ts);
  sk2.draw(ctx, ts);

  const figStart = C.arsitek.start + 0.08;
  if (ts >= figStart) {
    const rev = clamp((ts - figStart) / 1.1);
    K.figureDraw(ctx, gunadharmaPose(ts), ts, { reveal: rev });
  }
  sk3.draw(ctx, ts);
  sk4.draw(ctx, ts);
  sk5.draw(ctx, ts);
  sk6.draw(ctx, ts);
  sk7.draw(ctx, ts);

  // Straightedge ruler during Zone 7 underline
  const r7a = C.warisan.start + 0.4, r7b = sk7.end;
  if (t > r7a - 0.3 && t < r7b + 0.35) {
    const s = clamp((t - (r7a - 0.3)) / 0.28) * (1 - clamp((t - r7b) / 0.3));
    K.ruler(ctx, Z7.x - 350, Z7.y + 88 + (1 - ease.outCubic(s)) * 170, Z7.x + 350, Z7.y + 88 + (1 - ease.outCubic(s)) * 170, { alpha: s });
  }

  const tip = PEN.at(t);
  if (tip && !tip.hide) K.pencilFor(ctx, tip, t, { s: 0.85 / cm.z });

  K.sheetMarks(ctx, ts, { scene: 'SC 21' });
  K.light(ctx);
}
