// Blueprint demo (20 s): "Bagaimana Piramida Giza Dibangun".
// Pencil sketch on grid paper -> scan line -> Prussian-blue blueprint (sledge on wetted sand, friction study,
// ramp theories stamped TEORI) -> scan line -> cyan hologram that turns to face true north.
import * as K from '/styles/blueprint/kit.js';
const { clamp, lerp, ease, prog, env, hrand } = AM.lib;

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
  AM.sfx('scratch', W('hook', 'roda') + 0.15, { gain: 0.3 });
  AM.sfx('whoosh', C.tarik.start - 0.7, { gain: 0.35 });
  AM.sfx('bubble', W('tarik', 'basah'), { gain: 0.35 });
  AM.sfx('stamp', W('naik', 'teori') + 0.05, { gain: 0.55 });
  AM.sfx('swoosh_up', C.hasil.start - 0.15, { gain: 0.35 });
  AM.sfx('click', W('hasil', 'utara') + 0.25, { gain: 0.5 });
}
const sc = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
const camDrift = (t, a, b, z0 = 1, z1 = 1.04, cx = 540, cy = 900) => { const p = prog(t, a, b, ease.inOutSine); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 960); const z = lerp(z0, z1, p); ctx.scale(z, z); ctx.translate(-cx, -cy); };

// ---- 1. pencil: the pyramid sketches itself, 2.3 million blocks, no wheel, no iron. Scan line to blueprint.
function hookContent(t, mode, a) {
  const P = K.pyramid(ctx, 540, 1060, 780, 490, prog(t, -0.3, 0.6, ease.inOutSine), mode, { courses: prog(t, 0.25, 2.4, ease.inOutSine), nC: 26 });
  K.dim(ctx, P.L[0], P.L[1], P.R[0], P.R[1], '230 m', prog(t, 0.9, 1.4), mode, { off: 60 });
  const cT = W('hook', '2') - 0.1;
  K.note(ctx, '2.300.000', 540, 330, prog(t, cT, cT + 0.5, ease.linear), mode, { size: 96, align: 'center', weight: 700 });
  K.note(ctx, 'BLOK BATU (PERKIRAAN)', 540, 405, prog(t, cT + 0.3, cT + 0.9, ease.linear), mode, { size: 26, align: 'center' });
  const wr = W('hook', 'roda') - 0.15, bs = W('hook', 'besi') - 0.15;
  K.wheel(ctx, 260, 1240, 62, prog(t, wr, wr + 0.4), mode);
  K.note(ctx, 'RODA', 260, 1330, prog(t, wr, wr + 0.3), mode, { size: 24, align: 'center' });
  K.crossOut(ctx, 260, 1240, 72, prog(t, wr + 0.3, wr + 0.6));
  K.rect(ctx, 760, 1180, 120, 120, prog(t, bs, bs + 0.35), mode, { w: 3 });
  K.note(ctx, 'Fe', 820, 1242, prog(t, bs + 0.1, bs + 0.4), mode, { size: 54, align: 'center', weight: 700 });
  K.note(ctx, 'BESI', 820, 1330, prog(t, bs, bs + 0.3), mode, { size: 24, align: 'center' });
  K.crossOut(ctx, 820, 1240, 72, prog(t, bs + 0.3, bs + 0.6));
  K.figLabel(ctx, '01', 'PIRAMIDA AGUNG KHUFU', mode, prog(t, 0.1, 0.8, ease.linear), '±2560 SM');
}
shot('hook', (t, a, b) => {
  const u = prog(t, b - 0.65, b, ease.linear);
  camDrift(t, a, b, 1.0, 1.03);
  if (u <= 0) { K.sheet(ctx, 'pencil'); hookContent(t, 'pencil', a); }
  else K.scanTransition(ctx, u, 'pencil', 'blue', (m) => hookContent(t, m, a));
});

// ---- 2. blueprint: the sledge, the rope team and the water pourer.
const GY = 1080;
function rig(t, a, mode, { x0 = 120, speed = 34, team = 4, scale = 1, gy = GY, wet = 0, fadeExtra = 0, draw = 1, pourOn = 0 } = {}) {
  const x = x0 + (t - a) * speed;
  const sw = 300 * scale;
  // sand
  ctx.save(); ctx.fillStyle = mode === 'pencil' ? 'rgba(58,57,52,.4)' : 'rgba(238,245,255,.35)';
  for (let i = 0; i < 140; i++) { const sx = ((hrand(i, 1) * 1200 + 0) % 1200) - 60, sy = gy + 8 + hrand(i, 2) * 70 * scale; ctx.fillRect(sx, sy, 2.5, 2.5); }
  ctx.restore();
  K.line(ctx, -40, gy, 1120, gy, draw, mode, { w: 2.5 });
  // wetted strip in front of the sledge
  if (wet > 0) K.hatch(ctx, [[x + sw, gy], [x + sw + 260 * scale * wet, gy], [x + sw + 260 * scale * wet, gy + 26 * scale], [x + sw, gy + 26 * scale]], 1, mode, { gap: 7, alpha: 0.7, angle: Math.PI / 4 });
  K.sledge(ctx, x, gy, sw, draw, mode);
  K.block(ctx, x + 30 * scale, gy - 18 - 170 * scale, 230 * scale, 170 * scale, draw, mode, { hatchP: draw });
  // rope + pullers
  const rx = x + sw + 10, ry = gy - 34 * scale;
  const ph = (t - a) * 1.1;
  let hand = null;
  for (let k = 0; k < team; k++) {
    const wx = rx + 150 * scale + k * 92 * scale, extra = k >= team / 2 ? fadeExtra : 0;
    const h = K.worker(ctx, wx, gy, 1.05 * scale, ph + k * 0.27, mode, { alpha: draw * (1 - extra * 0.8) });
    if (k === team - 1 || (k === team / 2 - 1 && fadeExtra > 0.9)) hand = h;
    if (extra > 0) { ctx.save(); ctx.globalAlpha = extra * 0.9; ctx.strokeStyle = K.PAL.stamp; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.strokeRect(wx - 45 * scale, gy - 150 * scale, 90 * scale, 150 * scale); ctx.restore(); }
  }
  if (hand) K.line(ctx, rx, ry, hand[0] + 10, hand[1], draw, mode, { w: 2.5 });
  // the man pouring water at the front of the sledge
  if (pourOn > 0) {
    K.worker(ctx, rx + 60 * scale, gy, 1.0 * scale, 0.1, mode, { dir: -1, lean: 0.15, pour: true, alpha: pourOn });
    ctx.save(); ctx.fillStyle = K.PAL.cyanLine; ctx.globalAlpha = pourOn;
    for (let i = 0; i < 6; i++) { const ph2 = ((t * 2.2 + i / 6) % 1); ctx.beginPath(); ctx.ellipse(rx + 10 * scale - ph2 * 10, gy - 100 * scale + ph2 * 95 * scale, 3, 6, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  return { x, sw };
}
shot('tarik', (t, a, b) => {
  K.sheet(ctx, 'blue');
  camDrift(t, a, b, 1.06, 1.0, 560, 930);
  const wet = prog(t, W('tarik', 'basah') - 0.2, W('tarik', 'basah') + 0.6);
  const R = rig(t, a, 'blue', { draw: prog(t, a, a + 0.6), wet, pourOn: prog(t, W('tarik', 'pasir') - 0.2, W('tarik', 'pasir') + 0.2) });
  const bx = R.x + 30, by = GY - 18 - 170;
  K.dim(ctx, bx, by, bx + 230, by, '≈ 2,5 t', prog(t, a + 0.5, a + 1.0), 'blue', { off: -40 });
  K.note(ctx, 'KERETA LUNCUR KAYU', 120, 1230, prog(t, W('tarik', 'kereta') - 0.1, W('tarik', 'kereta') + 0.5, ease.linear), 'blue', { size: 30, weight: 700, leader: [R.x + 150, GY - 10] });
  K.note(ctx, 'PASIR DIBASAHI AIR', 560, 1300, prog(t, W('tarik', 'basah') - 0.1, W('tarik', 'basah') + 0.5, ease.linear), 'blue', { size: 30, weight: 700, leader: [R.x + 400, GY + 14], color: '#ffd36b' });
  sc(); K.figLabel(ctx, '02', 'TRANSPORTASI BLOK', 'blue', prog(t, a, a + 0.6, ease.linear), 'LEMBAR 2/4');
});

// ---- 3. friction: dry sand needs twice the team.
shot('gesek', (t, a, b) => {
  K.sheet(ctx, 'blue');
  camDrift(t, a, b, 1.0, 1.03, 540, 920);
  const half = prog(t, W('gesek', 'separuhnya') - 0.25, W('gesek', 'separuhnya') + 0.35);
  ctx.save(); ctx.translate(0, -340); rig(t, a, 'blue', { x0: 40, speed: 6, team: 8, scale: 0.62, draw: prog(t, a, a + 0.5) }); ctx.restore();
  K.note(ctx, 'PASIR KERING', 70, 580, prog(t, a + 0.1, a + 0.5, ease.linear), 'blue', { size: 32, weight: 700 });
  ctx.save(); ctx.translate(0, 140); rig(t, a, 'blue', { x0: 40, speed: 6, team: 8, scale: 0.62, wet: 1, fadeExtra: half, draw: prog(t, a + 0.25, a + 0.75) }); ctx.restore();
  K.note(ctx, 'PASIR BASAH', 70, 1060, prog(t, a + 0.3, a + 0.7, ease.linear), 'blue', { size: 32, weight: 700, color: '#ffd36b' });
  K.note(ctx, '8 PENARIK', 1010, 580, prog(t, W('gesek', 'jumlah') - 0.1, W('gesek', 'jumlah') + 0.3, ease.linear), 'blue', { size: 32, align: 'right' });
  K.note(ctx, half > 0.5 ? '4 PENARIK  (≈ ½)' : '8 PENARIK', 1010, 1060, prog(t, W('gesek', 'jumlah'), W('gesek', 'jumlah') + 0.4, ease.linear), 'blue', { size: 32, align: 'right', color: half > 0.5 ? '#ffd36b' : null, weight: half > 0.5 ? 700 : 400 });
  K.note(ctx, 'uji lab: Univ. Amsterdam, 2014', 70, 1300, prog(t, a + 0.8, a + 1.5, ease.linear), 'blue', { size: 24 });
  sc(); K.figLabel(ctx, '03', 'GAYA GESEK', 'blue', prog(t, a, a + 0.5, ease.linear), 'LEMBAR 3/4');
});

// ---- 4. ramp theories, stamped TEORI.
function smallPyr(cx, by, p, mode) { return K.pyramid(ctx, cx, by, 330, 210, p, mode, { courses: p, nC: 8 }); }
shot('naik', (t, a, b) => {
  K.sheet(ctx, 'blue');
  camDrift(t, a, b, 1.0, 1.02, 540, 900);
  const rows = [['lurus', 'LANDAI LURUS', 560], ['zigzag', 'LANDAI ZIGZAG', 870], ['melingkar', 'LANDAI MELINGKAR', 1180]];
  rows.forEach(([w, name, by], k) => {
    const t0 = W('naik', w) - 0.35, p = prog(t, Math.min(t0, a + 0.15 + k * 0.15), t0 + 0.2);
    const cx = 640;
    const P = smallPyr(cx, by, p, 'blue');
    const rp = prog(t, t0, t0 + 0.6);
    if (k === 0) K.path(ctx, [[cx + 330 / 2 - 40, by - 150], [cx + 330, by]], rp, 'blue', { w: 3 });
    if (k === 1) K.path(ctx, [[cx - 140, by], [cx + 110, by - 50], [cx - 80, by - 100], [cx + 50, by - 150], [cx, by - 190]], rp, 'blue', { w: 3.5, color: '#ffd36b' });
    if (k === 2) K.path(ctx, [[cx + 165, by], [cx - 120, by - 40], [cx - 80, by - 70], [cx + 95, by - 95], [cx + 60, by - 120], [cx - 45, by - 145], [cx, by - 200]], rp, 'blue', { w: 3.5, color: '#ffd36b' });
    if (k === 0) K.path(ctx, [[cx + 330, by], [cx + 120, by - 175]], rp, 'blue', { w: 3.5, color: '#ffd36b' });
    K.note(ctx, name, 80, by - 100, prog(t, t0, t0 + 0.4, ease.linear), 'blue', { size: 30, weight: 700 });
    K.note(ctx, '?', 80, by - 40, prog(t, t0 + 0.2, t0 + 0.3, ease.linear), 'blue', { size: 54, weight: 700, color: '#ffd36b' });
  });
  sc(); K.figLabel(ctx, '04', 'CARA MENAIKKAN BLOK', 'blue', prog(t, a, a + 0.5, ease.linear), 'LEMBAR 4/4');
  K.stamp(ctx, 'TEORI', 800, 300, prog(t, W('naik', 'teori') - 0.05, W('naik', 'teori') + 0.25), { size: 60 });
});

// ---- 5. hologram: the pyramid turns and locks onto true north. 146 m.
function holo(t, mode, a) {
  const lock = W('hasil', 'utara') + 0.2;
  const yaw = lerp(2.2, 0.62, ease.inOutCubic(clamp((t - a) / (lock - a))));
  const P = K.wirePyramid(ctx, 500, 1100, 255, yaw, prog(t, a, a + 1.0, ease.linear), mode, { pitch: 0.3 });
  const ht = W('hasil', '146') - 0.1;
  K.dim(ctx, 930, 1210, 930, P[4][1], '146 m', prog(t, ht, ht + 0.5), mode, { off: 0, size: 36 });
  // compass: north arrow; the base edge snaps parallel to it
  const lp = prog(t, lock - 0.4, lock + 0.1);
  ctx.save(); ctx.translate(540, 440); ctx.strokeStyle = K.PAL.holo; ctx.fillStyle = K.PAL.holo; ctx.lineWidth = 3;
  ctx.globalAlpha = prog(t, a + 0.4, a + 0.9); ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -95); ctx.lineTo(16, -20); ctx.lineTo(-16, -20); ctx.closePath(); ctx.fill();
  ctx.font = "700 40px 'JetBrains Mono'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('U', 0, -130);
  ctx.restore();
  K.note(ctx, 'SELISIH ±0,06° DARI UTARA SEJATI', 540, 1330, prog(t, lock, lock + 0.7, ease.linear), mode, { size: 28, align: 'center', weight: 700 });
  if (lp > 0.9) { ctx.save(); ctx.globalAlpha = Math.max(0, 1 - (t - lock) * 2); ctx.strokeStyle = K.PAL.holoCore; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(540, 440, 70 + (t - lock) * 160, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  K.note(ctx, 'FIG. 05 — ELEVASI AKHIR', 70, 165, prog(t, a + 0.2, a + 0.8, ease.linear), mode, { size: 30, weight: 700 });
}
shot('hasil', (t, a, b) => {
  const u = prog(t, a, a + 0.55, ease.linear);
  camDrift(t, a, AM.duration, 1.0, 1.05, 540, 920);
  if (u < 1) K.scanTransition(ctx, u, 'blue', 'holo', (m) => (m === 'holo' ? holo(t, m, a) : (K.pyramid(ctx, 540, 1180, 600, 380, 1, 'blue', { courses: 1, nC: 16 }))));
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
