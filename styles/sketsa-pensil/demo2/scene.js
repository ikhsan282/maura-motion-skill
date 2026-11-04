// Kenapa Kapal Baja Mengapung? — Hukum Archimedes (style: sketsa-pensil, demo2).
import * as K from '/styles/sketsa-pensil/kit.js';
const P = K.PAL, G = K.G, { clamp, lerp, ease, TAU } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1478, size: 64 } };

let ctx, C, W;
const SHEET = [0, 0, 2240, 6200];

// Zones down the single giant sheet of paper
const Z1 = { x: 1120, y: 740 };   // 1. Paku Besi vs Kapal Baja
const Z2 = { x: 1120, y: 1520 };  // 2. Balok Baja Padat Tenggelam
const Z3 = { x: 1120, y: 2300 };  // 3. Archimedes di Bak Mandi ("EUREKA!")
const Z4 = { x: 1120, y: 3080 };  // 4. Rumus FA = rho * g * V
const Z5 = { x: 1120, y: 3860 };  // 5. Dihapus & Dibentuk Lambung Berongga
const Z6 = { x: 1120, y: 4660 };  // 6. Diagram Gaya Apung Raksasa (W = FA)
const Z7 = { x: 1120, y: 5460 };  // 7. Garis Plimsoll & Kesimpulan

let sk1, sk2, sk3, sk4, sk5, sk5Hull, sk6, sk7;
let figEnd = 0;
let PEN;

const waveLine = (x0, x1, y, amp = 12, n = 14) => {
  const pts = [];
  for (let i = 0; i <= 56; i++) {
    const u = i / 56;
    pts.push([lerp(x0, x1, u), y + Math.sin(u * n * Math.PI) * amp]);
  }
  return pts;
};
const arrowV = (x, y0, y1, head = 22) => {
  const dir = Math.sign(y1 - y0) || 1;
  return [
    [[x, y0], [x, y1]],
    [[x - head * 0.7, y1 - dir * head], [x, y1], [x + head * 0.7, y1 - dir * head]],
  ];
};

function buildSketches() {
  PEN = new K.Pen();

  // ---- ZONE 1: Paku Besi Kecil vs Kapal Kargo Baja 100.000 Ton ----
  sk1 = new K.Sketch({ t0: 0.15, speed: 1500, seed: 11, gap: 0.03 });
  sk1.blue(G.line(Z1.x - 440, Z1.y + 40, Z1.x + 440, Z1.y + 40));
  sk1.line(waveLine(Z1.x - 430, Z1.x + 430, Z1.y + 40, 11, 12), { w: 3.2 });
  // Small iron nail on left sinking
  sk1.line([
    [Z1.x - 310, Z1.y + 150], [Z1.x - 270, Z1.y + 150],
    [Z1.x - 290, Z1.y + 150], [Z1.x - 290, Z1.y + 250], [Z1.x - 285, Z1.y + 275],
  ], { w: 4 });
  for (const s of arrowV(Z1.x - 290, Z1.y + 60, Z1.y + 135, 16)) sk1.red(s, { w: 3.5 });
  sk1.text('PAKU 10g', Z1.x - 290, Z1.y + 325, { size: 42, col: P.mid });
  sk1.text('TENGGELAM!', Z1.x - 290, Z1.y + 375, { size: 46, col: P.red });

  // Giant steel cargo ship floating on right
  sk1.at(Math.max(sk1.end, W('hook', 'kapal') - 0.35));
  sk1.line([
    [Z1.x - 90, Z1.y - 10], [Z1.x + 390, Z1.y - 10],
    [Z1.x + 340, Z1.y + 95], [Z1.x - 40, Z1.y + 95], [Z1.x - 90, Z1.y - 10],
  ], { w: 4.2 });
  // Containers and bridge
  sk1.line(G.rect(Z1.x - 20, Z1.y - 75, 110, 65), { w: 3 });
  sk1.line(G.rect(Z1.x + 105, Z1.y - 85, 115, 75), { w: 3 });
  sk1.line(G.rect(Z1.x + 240, Z1.y - 130, 95, 120), { w: 3.2 });
  sk1.hatch(G.rect(Z1.x - 20, Z1.y - 75, 220, 65), { step: 13, angle: 0.6, w: 1.5, col: P.soft });
  sk1.text('KAPAL BAJA 100.000 TON', Z1.x + 150, Z1.y - 185, { size: 48, col: P.ink });
  sk1.text('MENGAPUNG?!', Z1.x + 150, Z1.y + 165, { size: 58, col: P.red });
  PEN.sketch(sk1);

  // ---- ZONE 2: Balok Baja Padat Tanpa Rongga ----
  sk2 = new K.Sketch({ t0: C.padat.start + 0.08, speed: 1500, seed: 22, gap: 0.03 });
  sk2.blue(G.rect(Z2.x - 420, Z2.y - 220, 840, 480));
  sk2.line(waveLine(Z2.x - 410, Z2.x + 410, Z2.y - 90, 10, 12), { w: 3 });
  const blk = G.rect(Z2.x - 150, Z2.y - 30, 300, 210);
  sk2.line(blk, { w: 4.5 });
  sk2.hatch(blk, { step: 11, angle: -0.7, w: 2.2, col: P.lead });
  sk2.hatch(blk, { step: 14, angle: 0.7, w: 1.8, col: P.mid });
  sk2.at(Math.max(sk2.end, W('padat', 'beratnya') - 0.3));
  for (const s of arrowV(Z2.x, Z2.y + 185, Z2.y + 320, 24)) sk2.red(s, { w: 5 });
  for (const s of arrowV(Z2.x, Z2.y - 35, Z2.y - 115, 16)) sk2.line(s, { w: 3, col: P.mid });
  sk2.text('BALOK BAJA PADAT', Z2.x, Z2.y - 165, { size: 52, col: P.ink });
  sk2.text('BERAT W >> GAYA AIR', Z2.x, Z2.y + 370, { size: 54, col: P.red });
  PEN.sketch(sk2);

  // ---- ZONE 3: Archimedes di Bak Mandi ("EUREKA!") ----
  const figStart = C.archimedes.start + 0.1;
  figEnd = figStart + 1.1;
  PEN.add(figStart, figEnd, (t) => K.figureTip(archimedesPose(0), (t - figStart) / 1.1));

  sk3 = new K.Sketch({ t0: figEnd + 0.05, speed: 1550, seed: 33, gap: 0.03 });
  // Bathtub around Archimedes
  sk3.line([
    [Z3.x - 280, Z3.y - 20], [Z3.x + 280, Z3.y - 20],
    [Z3.x + 240, Z3.y + 170], [Z3.x - 240, Z3.y + 170], [Z3.x - 280, Z3.y - 20],
  ], { w: 4.2 });
  sk3.line(G.ellipse(Z3.x - 200, Z3.y + 190, 24, 16), { w: 3.2 });
  sk3.line(G.ellipse(Z3.x + 200, Z3.y + 190, 24, 16), { w: 3.2 });
  sk3.line(waveLine(Z3.x - 265, Z3.x + 265, Z3.y + 15, 9, 10), { w: 3 });
  // Overflowing splashes on both sides
  sk3.at(Math.max(sk3.end, W('archimedes', 'meluap') - 0.25));
  for (const dx of [-310, 310]) {
    const dir = Math.sign(dx);
    sk3.red([[Z3.x + dx * 0.85, Z3.y - 15], [Z3.x + dx, Z3.y + 45], [Z3.x + dx + dir * 25, Z3.y + 130]], { w: 3.8 });
    sk3.red(G.circle(Z3.x + dx + dir * 32, Z3.y + 160, 10), { w: 3 });
  }
  sk3.text('ARCHIMEDES (250 SM)', Z3.x, Z3.y - 260, { size: 48, col: P.mid });
  sk3.text('EUREKA! AIR MELUAP!', Z3.x, Z3.y + 260, { size: 62, col: P.red });
  PEN.sketch(sk3);

  // ---- ZONE 4: Rumus Hukum Archimedes ----
  sk4 = new K.Sketch({ t0: C.rumus.start + 0.08, speed: 1500, seed: 44, gap: 0.03 });
  sk4.blue(G.rect(Z4.x - 430, Z4.y - 210, 860, 430));
  sk4.line(G.rrect(Z4.x - 410, Z4.y - 190, 820, 390, 24), { w: 4.2 });
  sk4.text('HUKUM ARCHIMEDES:', Z4.x, Z4.y - 120, { size: 50, col: P.mid });
  sk4.at(Math.max(sk4.end, W('rumus', 'gaya') - 0.25));
  sk4.text('FA = ρ · g · V', Z4.x, Z4.y - 15, { size: 96, col: P.ink });
  sk4.red(G.line(Z4.x - 270, Z4.y + 42, Z4.x + 270, Z4.y + 42), { w: 5, ruler: true });
  sk4.red(G.line(Z4.x - 250, Z4.y + 56, Z4.x + 250, Z4.y + 56), { w: 3.5, ruler: true });
  sk4.at(Math.max(sk4.end, W('rumus', 'berat') - 0.2));
  sk4.text('V = VOLUME AIR YANG DIPINDAHKAN', Z4.x, Z4.y + 125, { size: 46, col: P.red });
  PEN.sketch(sk4);

  // ---- ZONE 5: Dihapus Tengahnya -> Lambung Cekung Berongga ----
  sk5 = new K.Sketch({ t0: C.rongga.start + 0.06, speed: 1650, seed: 55, gap: 0.025 });
  const solidBox = G.rect(Z5.x - 260, Z5.y - 130, 520, 220);
  sk5.line(solidBox, { w: 3.8 });
  sk5.hatch(G.rect(Z5.x - 190, Z5.y - 120, 380, 150), { step: 14, angle: 0.65, w: 2, col: P.mid });
  const tErase = Math.max(sk5.end + 0.1, W('rongga', 'menghapus') - 0.15);
  sk5.at(tErase);
  const erPath = [];
  for (let i = 0; i <= 7; i++) {
    erPath.push([Z5.x + (i % 2 ? 210 : -210), Z5.y - 115 + i * 24]);
  }
  sk5.erase(erPath, { r: 44, speed: 2400 });
  PEN.sketch(sk5);

  sk5Hull = new K.Sketch({ t0: sk5.end + 0.06, speed: 1550, seed: 56, gap: 0.03 });
  // Wide U-shaped hollow steel hull
  sk5Hull.red([
    [Z5.x - 360, Z5.y - 140], [Z5.x - 280, Z5.y + 120],
    [Z5.x + 280, Z5.y + 120], [Z5.x + 360, Z5.y - 140],
  ], { w: 5.5 });
  sk5Hull.line([
    [Z5.x - 330, Z5.y - 140], [Z5.x - 255, Z5.y + 92],
    [Z5.x + 255, Z5.y + 92], [Z5.x + 330, Z5.y - 140],
  ], { w: 3.5 });
  sk5Hull.text('RONGGA UDARA BESAR', Z5.x, Z5.y - 35, { size: 52, col: P.ink });
  sk5Hull.text('DINDING BAJA TIPIS & KUAT', Z5.x, Z5.y + 185, { size: 48, col: P.red });
  PEN.sketch(sk5Hull);

  // ---- ZONE 6: Mendesak Jutaan Liter Air -> Gaya Apung Raksasa ----
  sk6 = new K.Sketch({ t0: C.volume.start + 0.08, speed: 1550, seed: 66, gap: 0.03 });
  sk6.line(waveLine(Z6.x - 450, Z6.x + 450, Z6.y - 40, 11, 14), { w: 3.2 });
  const hullPoly = [
    [Z6.x - 350, Z6.y - 120], [Z6.x - 270, Z6.y + 130],
    [Z6.x + 270, Z6.y + 130], [Z6.x + 350, Z6.y - 120], [Z6.x - 350, Z6.y - 120],
  ];
  sk6.line(hullPoly, { w: 4.5 });
  // Hatched displaced water volume under the waterline
  sk6.hatch(G.rect(Z6.x - 280, Z6.y - 35, 560, 160), { step: 14, angle: -0.5, w: 1.8, col: P.soft });
  sk6.at(Math.max(sk6.end, W('volume', 'gaya') - 0.35));
  for (const dx of [-220, -110, 0, 110, 220]) {
    for (const s of arrowV(Z6.x + dx, Z6.y + 230, Z6.y + 140, 20)) sk6.red(s, { w: 4.5 });
  }
  sk6.text('JUTAAN LITER AIR DIPINDAHKAN', Z6.x, Z6.y - 175, { size: 48, col: P.ink });
  sk6.text('GAYA APUNG FA RAKSASA ↑↑↑', Z6.x, Z6.y + 290, { size: 56, col: P.red });
  PEN.sketch(sk6);

  // ---- ZONE 7: Garis Plimsoll & Kesimpulan ----
  sk7 = new K.Sketch({ t0: C.garis.start + 0.08, speed: 1500, seed: 77, gap: 0.03 });
  sk7.blue(G.rect(Z7.x - 420, Z7.y - 210, 840, 440));
  // Plimsoll ring + horizontal line with ruler
  sk7.line(G.circle(Z7.x - 120, Z7.y - 40, 86), { w: 4.5 });
  sk7.red(G.line(Z7.x - 250, Z7.y - 40, Z7.x + 10, Z7.y - 40), { w: 5, ruler: true });
  // Load level comb on the right (TF, F, T, S, W)
  sk7.line([[Z7.x + 70, Z7.y - 125], [Z7.x + 70, Z7.y + 55]], { w: 4, ruler: true });
  for (const [yy, lbl] of [[-115, 'TF'], [-75, 'F'], [-35, 'S'], [15, 'W']]) {
    sk7.line([[Z7.x + 70, Z7.y + yy], [Z7.x + 145, Z7.y + yy]], { w: 3.5 });
    sk7.text(lbl, Z7.x + 185, Z7.y + yy, { size: 36, col: P.mid });
  }
  sk7.text('GARIS PLIMSOLL (BATAS AMAN)', Z7.x, Z7.y - 175, { size: 48, col: P.ink });
  sk7.at(Math.max(sk7.end, C.penutup.start + 0.15));
  sk7.text('ρ RATA-RATA KAPAL < ρ AIR LAUT', Z7.x, Z7.y + 125, { size: 50, col: P.ink });
  sk7.text('BENTUK MENCIPTAKAN GAYA APUNG!', Z7.x, Z7.y + 195, { size: 56, col: P.red });
  PEN.sketch(sk7);
}

function archimedesPose(t) {
  const wave = Math.sin(t * 6) * 0.18;
  return {
    x: Z3.x, y: Z3.y + 145, s: 0.92,
    lean: 0.03, look: 0.2, sit: 0.7,
    arms: [[2.2 + wave, 0.3], [-2.2 - wave, -0.3]],
    legs: [[0.5, 0.4], [-0.5, -0.4]],
    face: 'wow', mouth: 0.7,
  };
}

function cameraAt(t, dur) {
  const kf = [
    { t: 0,                      x: Z1.x, y: Z1.y + 60, z: 0.92, r: 0 },
    { t: C.padat.start - 0.1,    x: Z1.x, y: Z1.y + 90, z: 0.95, r: 0 },
    { t: C.padat.start + 0.55,   x: Z2.x, y: Z2.y + 50, z: 0.95, r: 0.008 },
    { t: C.archimedes.start - 0.1, x: Z2.x, y: Z2.y + 70, z: 0.95, r: 0.008 },
    { t: C.archimedes.start + 0.55, x: Z3.x, y: Z3.y + 20, z: 0.96, r: -0.008 },
    { t: C.rumus.start - 0.1,    x: Z3.x, y: Z3.y + 30, z: 0.96, r: -0.008 },
    { t: C.rumus.start + 0.55,   x: Z4.x, y: Z4.y + 10, z: 0.98, r: 0 },
    { t: C.rongga.start - 0.1,   x: Z4.x, y: Z4.y + 10, z: 0.98, r: 0 },
    { t: C.rongga.start + 0.55,  x: Z5.x, y: Z5.y + 20, z: 0.96, r: 0.006 },
    { t: C.volume.start - 0.1,   x: Z5.x, y: Z5.y + 20, z: 0.96, r: 0.006 },
    { t: C.volume.start + 0.55,  x: Z6.x, y: Z6.y + 40, z: 0.94, r: -0.006 },
    { t: C.garis.start - 0.1,    x: Z6.x, y: Z6.y + 40, z: 0.94, r: -0.006 },
    { t: C.garis.start + 0.55,   x: Z7.x, y: Z7.y + 10, z: 0.96, r: 0 },
    { t: C.penutup.start + 0.4,  x: Z7.x, y: Z7.y + 40, z: 0.92, r: 0 },
    { t: dur,                    x: 1120, y: 4650,      z: 0.58, r: 0 },
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
  AM.sfx('whoosh', W('hook', 'kapal'));
  AM.sfx('scribble', C.padat.start + 0.2);
  AM.sfx('drum_hit', W('padat', 'mengalahkan'));
  AM.sfx('pop', C.archimedes.start + 0.15);
  AM.sfx('chime', W('archimedes', 'meluap'));
  AM.sfx('tick', C.rumus.start + 0.2);
  AM.sfx('whoosh', W('rongga', 'menghapus'));
  AM.sfx('chime', W('volume', 'gaya'));
  AM.sfx('tick', C.garis.start + 0.2);
  AM.sfx('chime', C.penutup.start + 0.3);
}

export function render(t, AM) {
  const ts = Math.floor(t * 12) / 12;
  const cm = cameraAt(t, AM.duration);
  const jx = K.noise.n2(ts * 7, 1) * 1.4, jy = K.noise.n2(ts * 7, 9) * 1.4;
  K.cam(ctx, cm.x + jx, cm.y + jy, cm.z, cm.r);

  K.sheet(ctx, SHEET);

  // Margin notes & smudges on the giant sheet
  K.smudge(ctx, Z2.x + 210, Z2.y + 120, 85, { alpha: 0.16, rot: 0.3 });
  K.smudge(ctx, Z6.x - 240, Z6.y + 90, 95, { alpha: 0.15, rot: -0.2 });
  K.note(ctx, 'Catatan Teknik Perkapalan #02', Z1.x - 420, Z1.y - 250, { size: 38, col: P.faint, align: 'left', rot: -0.02 });

  // Draw all active sketches
  sk1.draw(ctx, ts);
  sk2.draw(ctx, ts);

  // Archimedes rubber-hose figure in Zone 3
  const figStart = C.archimedes.start + 0.1;
  if (ts >= figStart) {
    const rev = clamp((ts - figStart) / 1.1);
    K.figureDraw(ctx, archimedesPose(ts), ts, { reveal: rev });
  }
  sk3.draw(ctx, ts);
  sk4.draw(ctx, ts);
  sk5.draw(ctx, ts);
  sk5Hull.draw(ctx, ts);
  sk6.draw(ctx, ts);
  sk7.draw(ctx, ts);

  // Straightedge ruler during formula underline (Zone 4) and Plimsoll line (Zone 7)
  const r4a = W('rumus', 'gaya') - 0.2, r4b = sk4.end;
  if (t > r4a - 0.3 && t < r4b + 0.35) {
    const s = clamp((t - (r4a - 0.3)) / 0.28) * (1 - clamp((t - r4b) / 0.3));
    K.ruler(ctx, Z4.x - 290, Z4.y + 48 + (1 - ease.outCubic(s)) * 180, Z4.x + 290, Z4.y + 48 + (1 - ease.outCubic(s)) * 180, { alpha: s });
  }

  // The active tool (graphite/red/blue pencil or pink eraser)
  const tip = PEN.at(t);
  if (tip && tip.kind === 'erase') {
    K.eraser(ctx, tip.x - 20, tip.y - 10, { rot: -0.45 + Math.sin(t * 28) * 0.08 });
  } else if (tip && !tip.hide) {
    K.pencilFor(ctx, tip, t, { s: 0.85 / cm.z });
  }

  K.sheetMarks(ctx, ts, { scene: 'SC 14' });
  K.light(ctx);
}
