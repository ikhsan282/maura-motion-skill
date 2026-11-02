// Blueprint demo-jembatan (20 s): "Jembatan Gantung".
// Pencil sketch -> scan line -> Prussian-blue blueprint (main cable, towers, deck, why it sags)
// -> scan line -> cyan hologram of the finished span.
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
  AM.sfx('scratch', W('kabel', 'menara') + 0.15, { gain: 0.3 });
  AM.sfx('whoosh', C.menara.start - 0.7, { gain: 0.35 });
  AM.sfx('click', W('menara', 'kaki') + 0.25, { gain: 0.5 });
  AM.sfx('swoosh_up', C.hasil.start - 0.15, { gain: 0.35 });
  AM.sfx('bubble', W('lengkung', 'gravitasi') - 0.1, { gain: 0.3 });
}
const sc = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
const camDrift = (t, a, b, z0 = 1, z1 = 1.04, cx = 540, cy = 900) => { const p = prog(t, a, b, ease.inOutSine); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 960); const z = lerp(z0, z1, p); ctx.scale(z, z); ctx.translate(-cx, -cy); };

// Bridge geometry (screen coords). Two towers, main cable sags between them, deck hangs below.
const T1 = 220, T2 = 860, TOP = 700, DECK = 1180, SAG = 250;
// catenary-ish main cable: y = TOP + sag * (x-mid)^2 / (half)^2
function cableY(x) { const m = (T1 + T2) / 2, h = (T2 - T1) / 2; return TOP + SAG * Math.pow((x - m) / h, 2); }
function cablePts(n = 26) { const P = []; for (let i = 0; i <= n; i++) { const x = T1 + (T2 - T1) * i / n; P.push([x, cableY(x)]); } return P; }

function bridge(t, mode, a, { reveal = 1, hangers = 1, dims = 1 } = {}) {
  const ink = mode === 'pencil' ? 'pencil' : mode;
  // towers
  const tp = prog(t, a, a + 0.6);
  K.rect(ctx, T1 - 26, TOP, 52, DECK - TOP + 60, tp, ink, { w: 3 });
  K.rect(ctx, T2 - 26, TOP, 52, DECK - TOP + 60, tp, ink, { w: 3 });
  // main cable
  K.path(ctx, cablePts(), prog(t, a + 0.2, a + 1.0), ink, { w: 3.5 });
  // deck
  K.line(ctx, T1 - 60, DECK, T2 + 60, DECK, prog(t, a + 0.4, a + 1.0), ink, { w: 3 });
  // hangers (vertical cables)
  if (hangers > 0) {
    for (let i = 1; i < 13; i++) { const x = T1 + (T2 - T1) * i / 13; K.line(ctx, x, cableY(x), x, DECK, prog(t, a + 0.5, a + 1.1) * hangers, ink, { w: 1.5 }); }
  }
  // ground + foundations
  K.line(ctx, 80, DECK + 80, 1000, DECK + 80, prog(t, a + 0.3, a + 0.8), ink, { w: 2 });
  if (dims > 0) {
    K.dim(ctx, T1, TOP, T2, TOP, 'BENTANG', prog(t, a + 0.6, a + 1.2), ink, { off: -70, size: 26 });
    K.dim(ctx, cableY((T1 + T2) / 2), DECK, cableY((T1 + T2) / 2), DECK - 60, 'SAG', prog(t, a + 0.8, a + 1.4), ink, { off: 46, size: 26 });
  }
  return { tp };
}

// ---- 1. pencil: the bridge sketches itself, main cable first.
shot('kabel', (t, a, b) => {
  const u = prog(t, b - 0.65, b, ease.linear);
  camDrift(t, a, b, 1.0, 1.03);
  if (u <= 0) { K.sheet(ctx, 'pencil'); bridge(t, 'pencil', a, { hangers: 0, dims: 0 }); }
  else K.scanTransition(ctx, u, 'pencil', 'blue', (m) => bridge(t, m, a, { hangers: 0, dims: 0 }));
});

// ---- 2. blueprint: main cable + towers carry the load.
shot('menara', (t, a, b) => {
  K.sheet(ctx, 'blue');
  camDrift(t, a, b, 1.06, 1.0, 540, 930);
  bridge(t, 'blue', a, { hangers: 0, dims: 0 });
  K.note(ctx, 'KABEL UTAMA', 540, TOP - 60, prog(t, W('kabel', 'menara') - 0.1, W('kabel', 'menara') + 0.4, ease.linear), 'blue', { size: 30, weight: 700, align: 'center', leader: [540, TOP + 30] });
  K.note(ctx, 'MENARA', T1, TOP - 120, prog(t, W('menara', 'menara') - 0.1, W('menara', 'menara') + 0.4, ease.linear), 'blue', { size: 30, weight: 700, leader: [T1, TOP + 40] });
  K.note(ctx, 'BEBAN → TANAH', T2 + 60, DECK + 150, prog(t, W('menara', 'kaki') - 0.1, W('menara', 'kaki') + 0.5, ease.linear), 'blue', { size: 28, weight: 700, leader: [T2, DECK + 90], color: '#ffd36b' });
  sc(); K.figLabel(ctx, '02', 'MENARA & KABEL UTAMA', 'blue', prog(t, a, a + 0.6, ease.linear), 'LEMBAR 2/4');
});

// ---- 3. blueprint: deck hangs on vertical hangers.
shot('dek', (t, a, b) => {
  K.sheet(ctx, 'blue');
  camDrift(t, a, b, 1.0, 1.03, 540, 920);
  bridge(t, 'blue', a, { hangers: 1, dims: 0 });
  K.note(ctx, 'DEK', 540, DECK - 40, prog(t, W('dek', 'dek') - 0.1, W('dek', 'dek') + 0.4, ease.linear), 'blue', { size: 30, weight: 700, align: 'center', leader: [540, DECK - 14] });
  K.note(ctx, 'PENGGANTUNG', 300, (cableY(300) + DECK) / 2, prog(t, W('dek', 'penggantung') - 0.1, W('dek', 'penggantung') + 0.4, ease.linear), 'blue', { size: 28, weight: 700, leader: [300, (cableY(300) + DECK) / 2 + 40], color: '#ffd36b' });
  sc(); K.figLabel(ctx, '03', 'DEK & PENGGANTUNG', 'blue', prog(t, a, a + 0.5, ease.linear), 'LEMBAR 3/4');
});

// ---- 4. blueprint: why the cable sags — gravity.
shot('lengkung', (t, a, b) => {
  K.sheet(ctx, 'blue');
  camDrift(t, a, b, 1.0, 1.02, 540, 900);
  bridge(t, 'blue', a, { hangers: 0, dims: 0 });
  // gravity arrows pulling the cable down at midspan
  const g = prog(t, W('lengkung', 'gravitasi') - 0.2, W('lengkung', 'gravitasi') + 0.4);
  const mx = (T1 + T2) / 2;
  ctx.save(); ctx.strokeStyle = '#ffd36b'; ctx.fillStyle = '#ffd36b'; ctx.lineWidth = 3; ctx.globalAlpha = g;
  for (let i = 0; i < 4; i++) { const yy = cableY(mx) + 40 + i * 46; ctx.beginPath(); ctx.moveTo(mx, yy - 26); ctx.lineTo(mx, yy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(mx - 8, yy - 8); ctx.lineTo(mx, yy); ctx.lineTo(mx + 8, yy - 8); ctx.stroke(); }
  ctx.restore();
  K.note(ctx, 'GRAVITASI', mx + 60, cableY(mx) + 150, g, 'blue', { size: 28, weight: 700, color: '#ffd36b', leader: [mx, cableY(mx) + 60] });
  K.note(ctx, 'KABEL MELENGKUNG', 540, TOP - 60, prog(t, W('lengkung', 'melengkung') - 0.1, W('lengkung', 'melengkung') + 0.4, ease.linear), 'blue', { size: 30, weight: 700, align: 'center', leader: [540, TOP + 30] });
  sc(); K.figLabel(ctx, '04', 'MENGAPA MELENGKUNG', 'blue', prog(t, a, a + 0.5, ease.linear), 'LEMBAR 4/4');
  K.stamp(ctx, 'GRAVITASI', 800, 320, prog(t, W('lengkung', 'gravitasi') - 0.05, W('lengkung', 'gravitasi') + 0.25), { size: 44 });
});

// ---- 5. hologram: finished span, long bend, no pillars in the middle.
function holo(t, mode, a) {
  bridge(t, mode, a, { hangers: 1, dims: 0 });
  K.dim(ctx, T1, TOP, T2, TOP, 'BENTANG PANJANG', prog(t, a, a + 1.0), mode, { off: -70, size: 26 });
  K.note(ctx, 'TANPA TIANG DI TENGAH', 540, DECK + 150, prog(t, W('hasil', 'tengah') - 0.1, W('hasil', 'tengah') + 0.5, ease.linear), mode, { size: 30, weight: 700, align: 'center' });
  K.figLabel(ctx, '05', 'BENTANG AKHIR', mode, prog(t, a + 0.2, a + 0.8, ease.linear));
}
shot('hasil', (t, a, b) => {
  const u = prog(t, a, a + 0.55, ease.linear);
  camDrift(t, a, AM.duration, 1.0, 1.05, 540, 920);
  if (u < 1) K.scanTransition(ctx, u, 'blue', 'holo', (m) => holo(t, m, a));
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
