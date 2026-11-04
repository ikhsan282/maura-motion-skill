// Blueprint demo-rumah (20 s): "Denah Rumah Tipe 36".
// Pencil sketch of the house outline -> scan line -> Prussian-blue plan: ruang tamu + 2 kamar,
// dapur + kamar mandi with the pipe run, scale bar 1:200 stamped SKALA -> scan line -> cyan hologram of the finished plan.
import * as K from '/styles/blueprint/kit.js';
const { clamp, lerp, ease, prog, hrand } = AM.lib;

export const meta = { fps: 24, hold: 1, captions: { preset: 'clean', y: 1475, size: 54, font: 'Inter', box: { fill: 'rgba(8,24,52,.86)', pad: 16, radius: 6, border: 'rgba(159,227,255,.45)', borderW: 2 } } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('pencil', 0.05, { gain: 0.45 });
  AM.sfx('scratch', W('hook', 'enam') + 0.15, { gain: 0.3 });
  AM.sfx('whoosh', C.ruang.start - 0.7, { gain: 0.35 });
  AM.sfx('bubble', W('servis', 'pipa') + 0.1, { gain: 0.35 });
  AM.sfx('stamp', W('skala', 'dua') + 0.05, { gain: 0.55 });
  AM.sfx('swoosh_up', C.hasil.start - 0.15, { gain: 0.35 });
  AM.sfx('click', W('hasil', 'lima') + 0.25, { gain: 0.5 });
}
const sc = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
const camDrift = (t, a, b, z0 = 1, z1 = 1.04, cx = 540, cy = 900) => { const p = prog(t, a, b, ease.inOutSine); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 960); const z = lerp(z0, z1, p); ctx.scale(z, z); ctx.translate(-cx, -cy); };

// ---- the plan: 6 m x 6 m at 90 px/m, front (ruang tamu) at the bottom.
const MX = 270, MY = 680, S = 90; // plan origin + px per metre
// walls: [x0,y0,x1,y1] in px, gaps = door openings
function walls() {
  const out = [
    [MX, MY, MX + 540, MY], [MX, MY + 540, MX + 540, MY + 540],
    [MX, MY, MX, MY + 540], [MX + 540, MY, MX + 540, MY + 540],
  ];
  const inner = [
    // horizontal: back-of-ruang-tamu (y=MY+320) with door gap, kamar divider (y=MY+430) with gap
    [MX, MY + 320, MX + 210, MY + 320], [MX + 330, MY + 320, MX + 540, MY + 320],
    [MX + 270, MY + 430, MX + 540, MY + 430],
    // vertical: kamar divider (x=MX+270) between y 320..540, servis divider (x=MX+330) between 0..320
    [MX + 270, MY + 320, MX + 270, MY + 540],
    [MX + 330, MY, MX + 330, MY + 320],
  ];
  return { out, inner };
}
function plan(t, mode, pOut, pIn) {
  const { out, inner } = walls();
  const n = Math.ceil(out.length * clamp(pOut));
  out.slice(0, n).forEach(([x0, y0, x1, y1], i) => K.line(ctx, x0, y0, x1, y1, clamp(pOut * out.length - i), mode, { w: 4, seed: 3 }));
  const m = Math.ceil(inner.length * clamp(pIn));
  inner.slice(0, m).forEach(([x0, y0, x1, y1], i) => K.line(ctx, x0, y0, x1, y1, clamp(pIn * inner.length - i), mode, { w: 2.5, seed: 4 }));
}
function room(r, label, p, mode, { fill = 0, color = null, size = 26 } = {}) {
  if (fill > 0) K.hatch(ctx, [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]], fill, mode, { gap: 16, alpha: 0.35 });
  K.note(ctx, label, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, p, mode, { size, align: 'center', weight: 700, color });
}
const R_TAMU = [MX + 8, MY + 328, MX + 532, MY + 532];
const R_K1 = [MX + 8, MY + 438, MX + 262, MY + 532];
const R_K2 = [MX + 278, MY + 438, MX + 532, MY + 532];
const R_DAPUR = [MX + 8, MY + 8, MX + 322, MY + 312];
const R_KM = [MX + 338, MY + 8, MX + 532, MY + 312];

// ---- 1. hook: the house sketches itself in pencil, 6 x 6, 36 m2. Scan line to blueprint.
function hookContent(t, mode, a) {
  plan(t, mode, prog(t, -0.2, 1.1, ease.inOutSine), prog(t, 0.9, 1.7, ease.inOutSine));
  K.dim(ctx, MX, MY + 600, MX + 540, MY + 600, '6 m', prog(t, 0.7, 1.2), mode, { off: 0 });
  K.dim(ctx, MX - 60, MY, MX - 60, MY + 540, '6 m', prog(t, 1.0, 1.5), mode, { off: 0 });
  const cT = W('hook', 'tiga') - 0.1;
  K.note(ctx, '36 m²', 540, 330, prog(t, cT, cT + 0.5, ease.linear), mode, { size: 96, align: 'center', weight: 700 });
  K.note(ctx, 'LUAS LANTAI DENAH', 540, 405, prog(t, cT + 0.3, cT + 0.9, ease.linear), mode, { size: 26, align: 'center' });
  K.figLabel(ctx, '01', 'DENAH RUMAH TIPE 36', mode, prog(t, 0.1, 0.8, ease.linear), '±1 LANTAI');
}
shot('hook', (t, a, b) => {
  const u = prog(t, b - 0.65, b, ease.linear);
  camDrift(t, a, b, 1.0, 1.03);
  if (u <= 0) { K.sheet(ctx, 'pencil'); hookContent(t, 'pencil', a); }
  else K.scanTransition(ctx, u, 'pencil', 'blue', (m) => hookContent(t, m, a));
});

// ---- 2. ruang: ruang tamu in front, two bedrooms behind it, side by side.
shot('ruang', (t, a, b) => {
  K.sheet(ctx, 'blue');
  camDrift(t, a, b, 1.06, 1.0, 540, 950);
  plan(t, 'blue', prog(t, a, a + 0.4), prog(t, a + 0.2, a + 0.6));
  room(R_TAMU, 'RUANG TAMU', prog(t, a + 0.5, a + 0.9, ease.linear), 'blue', { fill: prog(t, a + 0.4, a + 0.8), size: 30 });
  const t1 = W('ruang', 'dua') - 0.3;
  room(R_K1, 'KAMAR 1', prog(t, t1, t1 + 0.4, ease.linear), 'blue', { fill: prog(t, t1 - 0.1, t1 + 0.3) });
  room(R_K2, 'KAMAR 2', prog(t, t1 + 0.3, t1 + 0.7, ease.linear), 'blue', { fill: prog(t, t1 + 0.2, t1 + 0.6) });
  K.note(ctx, '3 x 3 m', MX + 135, MY + 575, prog(t, t1 + 0.5, t1 + 0.9, ease.linear), 'blue', { size: 24, align: 'center', color: '#ffd36b' });
  sc(); K.figLabel(ctx, '02', 'ZONA HIDUP', 'blue', prog(t, a, a + 0.5, ease.linear), 'LEMBAR 2/4');
});

// ---- 3. servis: dapur + kamar mandi at the back, one pipe run.
shot('servis', (t, a, b) => {
  K.sheet(ctx, 'blue');
  camDrift(t, a, b, 1.0, 1.03, 540, 850);
  plan(t, 'blue', prog(t, a, a + 0.35), prog(t, a + 0.15, a + 0.5));
  room(R_TAMU, 'RUANG TAMU', prog(t, a + 0.2, a + 0.5, ease.linear), 'blue', { size: 24 });
  room(R_K1, 'KAMAR 1', prog(t, a + 0.3, a + 0.6, ease.linear), 'blue', { size: 22 });
  room(R_K2, 'KAMAR 2', prog(t, a + 0.35, a + 0.65, ease.linear), 'blue', { size: 22 });
  const td = W('servis', 'dapur') - 0.2;
  room(R_DAPUR, 'DAPUR', prog(t, td, td + 0.4, ease.linear), 'blue', { fill: prog(t, td - 0.1, td + 0.3), color: '#ffd36b', size: 30 });
  const tk = W('servis', 'mandi') - 0.2;
  room(R_KM, 'KM', prog(t, tk, tk + 0.4, ease.linear), 'blue', { fill: prog(t, tk - 0.1, tk + 0.3), color: '#ffd36b', size: 30 });
  // pipe run along the back wall
  const pp = prog(t, W('servis', 'pipa') - 0.2, W('servis', 'pipa') + 0.7);
  K.path(ctx, [[MX + 60, MY + 60], [MX + 60, MY + 30], [MX + 480, MY + 30], [MX + 480, MY + 60]], pp, 'blue', { w: 3, color: '#ffd36b', dash: [8, 6] });
  K.note(ctx, 'JALUR PIPA', MX + 270, MY - 20, prog(t, W('servis', 'pipa'), W('servis', 'pipa') + 0.4, ease.linear), 'blue', { size: 26, align: 'center', color: '#ffd36b', weight: 700 });
  sc(); K.figLabel(ctx, '03', 'ZONA SERVIS', 'blue', prog(t, a, a + 0.5, ease.linear), 'LEMBAR 3/4');
});

// ---- 4. skala: scale bar 1:200, 1 cm = 0.5 m, stamped SKALA.
shot('skala', (t, a, b) => {
  K.sheet(ctx, 'blue');
  camDrift(t, a, b, 1.0, 1.02, 540, 900);
  plan(t, 'blue', prog(t, a, a + 0.35), prog(t, a + 0.15, a + 0.5));
  room(R_TAMU, 'RUANG TAMU', prog(t, a + 0.2, a + 0.5, ease.linear), 'blue', { size: 24 });
  room(R_K1, 'KAMAR 1', prog(t, a + 0.3, a + 0.6, ease.linear), 'blue', { size: 22 });
  room(R_K2, 'KAMAR 2', prog(t, a + 0.35, a + 0.65, ease.linear), 'blue', { size: 22 });
  room(R_DAPUR, 'DAPUR', prog(t, a + 0.4, a + 0.7, ease.linear), 'blue', { size: 24 });
  room(R_KM, 'KM', prog(t, a + 0.45, a + 0.75, ease.linear), 'blue', { size: 24 });
  // scale bar under the plan
  const sb = prog(t, W('skala', 'sama') - 0.2, W('skala', 'sama') + 0.6);
  const bx = MX, by = MY + 620;
  for (let k = 0; k < 4; k++) { const x = bx + k * 135; K.rect(ctx, x, by, 135, 26, clamp(sb * 4 - k), 'blue', { w: 2 }); if (k % 2 === 0) K.hatch(ctx, [[x, by], [x + 135, by], [x + 135, by + 26], [x, by + 26]], clamp(sb * 4 - k), 'blue', { gap: 9, alpha: 0.6 }); }
  [0, 1, 2, 3, 4].forEach((k) => K.note(ctx, k % 2 ? '' : `${k / 2} m`, bx + k * 135, by + 52, clamp(sb * 5 - k * 0.8), 'blue', { size: 22, align: 'center' }));
  K.note(ctx, 'SKALA 1 : 200', 540, by + 110, prog(t, W('skala', 'dua') - 0.1, W('skala', 'dua') + 0.4, ease.linear), 'blue', { size: 34, align: 'center', weight: 700 });
  K.note(ctx, '1 cm = 0,5 m', 540, by + 155, prog(t, W('skala', 'setengah') - 0.1, W('skala', 'setengah') + 0.4, ease.linear), 'blue', { size: 26, align: 'center', color: '#ffd36b' });
  sc(); K.figLabel(ctx, '04', 'SKALA GAMBAR', 'blue', prog(t, a, a + 0.5, ease.linear), 'LEMBAR 4/4');
  K.stamp(ctx, 'SKALA', 810, 300, prog(t, W('skala', 'dua') - 0.05, W('skala', 'dua') + 0.25), { size: 60 });
});

// ---- 5. hologram: the finished plan glows, 5 rooms counted one by one.
function holo(t, mode, a) {
  plan(t, mode, prog(t, a, a + 0.8, ease.linear), prog(t, a + 0.4, a + 1.1, ease.linear));
  const rooms = [[R_TAMU, 'RUANG TAMU'], [R_K1, 'K1'], [R_K2, 'K2'], [R_DAPUR, 'DAPUR'], [R_KM, 'KM']];
  rooms.forEach(([r, label], k) => {
    const t0 = W('hasil', 'lima') + 0.15 + k * 0.22;
    room(r, label, prog(t, t0, t0 + 0.3, ease.linear), mode, { fill: prog(t, t0 - 0.1, t0 + 0.3), size: 24 });
  });
  K.note(ctx, '5 RUANG — 36 m²', 540, 330, prog(t, W('hasil', 'hasil') + 0.2, W('hasil', 'hasil') + 0.7, ease.linear), mode, { size: 52, align: 'center', weight: 700 });
  K.note(ctx, 'FIG. 05 — DENAH AKHIR', 70, 165, prog(t, a + 0.2, a + 0.8, ease.linear), mode, { size: 30, weight: 700 });
}
shot('hasil', (t, a, b) => {
  const u = prog(t, a, a + 0.55, ease.linear);
  camDrift(t, a, AM.duration, 1.0, 1.05, 540, 920);
  if (u < 1) K.scanTransition(ctx, u, 'blue', 'holo', (m) => (m === 'holo' ? holo(t, m, a) : plan(t, 'blue', 1, 1)));
  else { K.sheet(ctx, 'holo'); holo(t, 'holo', a); }
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const L = SHOTS.filter((x) => C[x.id]), i = L.indexOf(s);
  const a = Math.max(0, C[s.id].start - 0.12), b = L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  sc();
  AM.lib.grain(ctx, t, { amount: 0.035, fps: 12 });
}
