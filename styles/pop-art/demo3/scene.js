// Pop Art — Demo 3: Jebakan Diskon Coret & Bias Jangkar / Anchoring Bias (65s)
import * as K from '/styles/pop-art/kit.js';
const { clamp, lerp, ease } = AM.lib;

export const meta = {
  fps: 24,
  captions: {
    preset: 'comic',
    y: 1490,
    size: 74,
    font: 'Bebas Neue',
    upper: true,
    spacing: 3,
    color: '#0e0f1f',
    active: '#ff3ea5',
    box: { fill: '#ffffff', pad: 20, radius: 10, border: '#0e0f1f', borderW: 7 },
  },
};

let ctx, fx;
const C = {};
const kAt = (t, at, d = 0.28) => clamp((t - at) / d);

function camera(z = 1, cx = 540, cy = 960) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, 960);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('impact', 0.05, { gain: 0.45 });
  AM.sfx('pop', C.normal.start + 0.2, { gain: 0.42 });
  AM.sfx('boing', C.jangkar.start + 0.3, { gain: 0.45 });
  AM.sfx('coin', C.hemat.start + 0.3, { gain: 0.45 });
  AM.sfx('stamp', C.nama.start + 0.2, { gain: 0.52 });
  AM.sfx('pop', C.akhir.start + 0.4, { gain: 0.48 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// 1. Hook: Rp500.000 crossed out -> Rp199.000!
shot('hook', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1 + 0.05 * p);
  K.sunburst(ctx, t, { c1: K.PAL.yellow, c2: K.PAL.orange });
  K.benday(ctx, { col: 'rgba(255,62,165,0.22)' });
  K.sticker(ctx, 'Rp500.000', 540, 340, { size: 130, col: K.PAL.white, txt: K.PAL.ink, rot: -0.04, k: kAt(t, 0.1), t });
  if (t > 0.6) {
    ctx.save();
    ctx.strokeStyle = K.PAL.red;
    ctx.lineWidth = 22;
    ctx.lineCap = 'round';
    const sk = ease.outCubic(kAt(t, 0.6, 0.35));
    ctx.beginPath();
    ctx.moveTo(240, 370);
    ctx.lineTo(240 + 600 * sk, 310);
    ctx.stroke();
    ctx.restore();
  }
  K.priceTag(ctx, 'Rp199.000', 560, 740, 1.12, { k: kAt(t, 0.85, 0.3), mood: 'wink', t, col: K.PAL.pink });
  K.shopper(ctx, 290, 1140, 0.78, { mood: 'shock', t, look: [0.5, -0.4], k: kAt(t, 0.4) });
  K.starBadge(ctx, 'DISKON\n60%!', 820, 1120, { r: 175, col: K.PAL.lime, k: kAt(t, 1.2), t, size: 76 });
});

// 2. Without the crossed-out price: Rp199.000 feels ordinary
shot('normal', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.02 + 0.04 * p);
  K.sunburst(ctx, t, { c1: K.PAL.cobalt, c2: '#1f2bd0' });
  K.benday(ctx, { col: 'rgba(255,255,255,0.16)' });
  K.sticker(ctx, 'TANPA HARGA CORET:', 540, 260, { size: 92, col: K.PAL.lime, rot: 0.03, k: kAt(t, a + 0.1), t });
  K.priceTag(ctx, 'Rp199.000', 560, 680, 1.08, { k: kAt(t, a + 0.3), mood: 'smug', t, col: K.PAL.white });
  K.shopper(ctx, 540, 1130, 0.78, { mood: 'think', t, look: [0, -0.5], k: 1 });
  K.sticker(ctx, 'TERASA BIASA SAJA...', 540, 960, { size: 80, col: K.PAL.yellow, rot: -0.03, k: kAt(t, a + 1.5), t });
});

// 3. The first number (Rp500.000) acts as a mental anchor
shot('jangkar', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.03 + 0.04 * p);
  K.sunburst(ctx, t, { c1: K.PAL.pink, c2: '#d81e80' });
  K.benday(ctx);
  K.popEye(ctx, 540, 350, 0.82, { look: Math.sin(t * 3) * 0.35, t });
  K.sticker(ctx, 'ANGKA PERTAMA = JANGKAR', 540, 660, { size: 92, col: K.PAL.yellow, rot: -0.04, k: kAt(t, a + 0.2), t });
  K.priceTag(ctx, 'Rp500.000', 560, 980, 1.05, { k: kAt(t, a + 0.5), mood: 'smug', t, col: K.PAL.lime, highlight: 2 });
  K.arrow(ctx, 540, 500, 540, 600, { col: K.PAL.white, w: 54, k: kAt(t, a + 0.8) });
});

// 4. Illusion of saving Rp300.000
shot('hemat', (t, a, b) => {
  camera(1.04);
  K.sunburst(ctx, t, { c1: K.PAL.lime, c2: '#8ee01d', speed: 0.28 });
  K.benday(ctx, { col: 'rgba(43,59,255,0.18)' });
  K.odometer(ctx, '500.000', '199.000', 540, 520, { size: 210, k: clamp((t - a - 0.3) / 1.1) });
  K.sticker(ctx, 'ILUSI HEMAT Rp301.000!', 540, 820, { size: 92, col: K.PAL.pink, txt: '#fff', rot: -0.04, k: kAt(t, a + 0.9), t });
  K.shopper(ctx, 340, 1130, 0.76, { mood: 'happy', t, k: 1 });
  K.starBadge(ctx, 'PADAHAL\nTETAP\nKELUAR UANG!', 780, 1120, { r: 175, col: K.PAL.yellow, k: kAt(t, a + 1.5), t, size: 48 });
});

// 5. Stamped: ANCHORING BIAS (Kahneman & Tversky)
shot('nama', (t, a, b) => {
  const lt = t - a;
  const st = clamp(lt / 0.25);
  camera(1.03 + 0.03 * clamp(lt / 2));
  K.sunburst(ctx, t, { c1: K.PAL.orange, c2: K.PAL.red, speed: 0.25 });
  K.benday(ctx, { col: 'rgba(255,225,77,0.28)', step: 28, r: 7 });
  K.sticker(ctx, 'BIAS JANGKAR', 540, 660, {
    size: 165,
    col: K.PAL.white,
    txt: K.PAL.ink,
    rot: -0.05,
    k: st,
    t,
    sub: 'ANCHORING BIAS • KAHNEMAN & TVERSKY',
    subCol: K.PAL.pink,
  });
  K.starBadge(ctx, 'RISET\nNOBEL\n1974', 270, 1120, { r: 170, col: K.PAL.yellow, k: kAt(t, a + 0.4), t, size: 58 });
  K.shopper(ctx, 760, 1120, 0.78, { mood: 'smug', t, look: [-0.4, -0.3], k: kAt(t, a + 0.6) });
});

// 6. Payoff: Cover the crossed-out price and judge real value!
shot('akhir', (t, a, b) => {
  const p = clamp((t - a) / 3);
  camera(1 + 0.05 * p);
  K.sunburst(ctx, t, { c1: K.PAL.pink, c2: '#ff74c0', speed: 0.2 });
  K.benday(ctx);
  K.halftoneBlob(ctx, 540, 780, 450, K.PAL.cobalt);
  K.sticker(ctx, 'ABAIKAN HARGA CORET!', 540, 280, { size: 96, col: K.PAL.lime, rot: -0.05, k: kAt(t, a + 0.2), t });
  K.priceTag(ctx, 'Rp199.000', 560, 760, 1.12, { k: 1, mood: 'happy', t, col: K.PAL.yellow });
  K.starBadge(ctx, 'CEK NILAI\nASLINYA!', 800, 1140, { r: 185, col: K.PAL.white, txt: K.PAL.ink, k: kAt(t, a + 1.0), t, size: 60 });
  K.shopper(ctx, 290, 1140, 0.76, { mood: 'smug', t, k: 1 });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const L = SHOTS.filter((x) => C[x.id]);
  const cols = [K.PAL.pink, K.PAL.cobalt, K.PAL.lime, K.PAL.orange, K.PAL.yellow, K.PAL.pink];
  L.forEach((sh, i) => {
    if (i === 0) return;
    const c0 = C[sh.id].start - 0.12;
    const k = (t - (c0 - 0.14)) / 0.28;
    if (k > 0 && k < 1) K.flood(fx, k, cols[i % cols.length], 540, 960);
  });
  AM.lib.grain(fx, t, { amount: 0.05, fps: 12 });
}

