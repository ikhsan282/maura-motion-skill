// Pop Art — Demo 2: Jebakan Ukuran Sedang / Decoy Effect (64s)
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

// Draw a Pop-Art Cup / Popcorn Bucket icon with price & label
function drawPopCup(ctx, x, y, scale, { label = 'S', price = '30RB', col = K.PAL.sky, k = 1, highlight = false, t = 0 } = {}) {
  if (k <= 0) return;
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 2.5 + x) * 6);
  const sc = K.slap(k) * scale;
  ctx.scale(sc, sc);

  if (highlight) {
    K.halftoneBlob(ctx, 0, -40, 220, K.PAL.yellow);
  }

  // Cup body trapezoid
  const p = new Path2D();
  p.moveTo(-95, -180);
  p.lineTo(95, -180);
  p.lineTo(72, 140);
  p.lineTo(-72, 140);
  p.closePath();
  K.cut(ctx, p, col, { border: 12, shadow: 16, lw: 6 });

  // Lid / Popcorn dome
  const lid = new Path2D();
  lid.ellipse(0, -190, 105, 42, 0, Math.PI, 0);
  lid.closePath();
  K.cut(ctx, lid, K.PAL.yellow, { border: 8, shadow: 8, lw: 6 });

  ctx.fillStyle = K.PAL.ink;
  ctx.font = "400 110px 'Bebas Neue'";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, -45);

  ctx.fillStyle = K.PAL.white;
  ctx.font = "400 68px 'Bebas Neue'";
  ctx.fillText(price, 0, 70);
  ctx.restore();
}

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('impact', 0.05, { gain: 0.45 });
  AM.sfx('pop', C.dua.start + 0.2, { gain: 0.42 });
  AM.sfx('boing', C.umpan.start + 0.3, { gain: 0.45 });
  AM.sfx('ding', C.banding.start + 0.4, { gain: 0.45 });
  AM.sfx('stamp', C.nama.start + 0.2, { gain: 0.52 });
  AM.sfx('coin', C.akhir.start + 0.4, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// 1. Hook: Medium vs Jumbo price mystery
shot('hook', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1 + 0.05 * p);
  K.sunburst(ctx, t, { c1: K.PAL.pink, c2: K.PAL.orange });
  K.benday(ctx, { col: 'rgba(14,15,31,0.18)' });
  K.sticker(ctx, 'JEBAKAN UKURAN SEDANG!', 540, 250, { size: 96, col: K.PAL.yellow, rot: -0.04, k: kAt(t, 0.1), t });
  drawPopCup(ctx, 320, 680, 0.95, { label: 'M', price: 'Rp65RB', col: K.PAL.sky, k: kAt(t, 0.25), t });
  drawPopCup(ctx, 760, 650, 1.18, { label: 'L', price: 'Rp70RB', col: K.PAL.lime, k: kAt(t, 0.45), highlight: true, t });
  K.shopper(ctx, 540, 1140, 0.78, { mood: 'think', t, look: [0.4, -0.4], k: kAt(t, 0.3) });
  K.starBadge(ctx, 'CUMA BEDA\n5 RIBU?!', 840, 1080, { r: 165, col: K.PAL.yellow, k: kAt(t, 1.2), t, size: 56 });
});

// 2. Two choices only: Small Rp30k vs Large Rp70k
shot('dua', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.02 + 0.04 * p);
  K.sunburst(ctx, t, { c1: K.PAL.cobalt, c2: '#1d28a8' });
  K.benday(ctx, { col: 'rgba(255,255,255,0.16)' });
  K.sticker(ctx, 'TANPA UKURAN SEDANG:', 540, 240, { size: 92, col: K.PAL.white, rot: 0.03, k: kAt(t, a + 0.1), t });
  drawPopCup(ctx, 310, 720, 0.78, { label: 'S', price: 'Rp30RB', col: K.PAL.lime, k: kAt(t, a + 0.25), t });
  drawPopCup(ctx, 770, 680, 1.18, { label: 'L', price: 'Rp70RB', col: K.PAL.pink, k: kAt(t, a + 0.45), t });
  K.sticker(ctx, 'TERLALU MAHAL!', 760, 1040, { size: 84, col: K.PAL.yellow, txt: K.PAL.red, rot: -0.06, k: kAt(t, a + 1.8), t });
  K.shopper(ctx, 310, 1140, 0.72, { mood: 'happy', t, look: [0, -0.4], k: 1 });
});

// 3. The Decoy Medium Rp65.000 drops in between!
shot('umpan', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.03 + 0.04 * p);
  K.sunburst(ctx, t, { c1: K.PAL.yellow, c2: K.PAL.orange });
  K.benday(ctx);
  K.sticker(ctx, 'MASUKKAN PILIHAN UMPAN!', 540, 230, { size: 90, col: K.PAL.pink, txt: '#fff', rot: -0.03, k: kAt(t, a + 0.1), t });
  drawPopCup(ctx, 210, 740, 0.72, { label: 'S', price: 'Rp30RB', col: K.PAL.sky, k: 1, t });
  drawPopCup(ctx, 540, 710, 0.95, { label: 'M', price: 'Rp65RB', col: K.PAL.orange, k: kAt(t, a + 0.4, 0.35), t });
  drawPopCup(ctx, 870, 670, 1.15, { label: 'L', price: 'Rp70RB', col: K.PAL.lime, k: 1, highlight: true, t });
  K.arrow(ctx, 540, 1120, 540, 920, { col: K.PAL.red, w: 56, k: kAt(t, a + 1.1) });
  K.sticker(ctx, 'HARGA TANGGUNG!', 540, 1180, { size: 88, col: K.PAL.white, txt: K.PAL.ink, rot: 0.04, k: kAt(t, a + 1.3), t });
});

// 4. Brain compares Medium (65k) vs Large (70k) -> +Rp5.000!
shot('banding', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.02 + 0.05 * p);
  K.sunburst(ctx, t, { c1: K.PAL.lime, c2: '#89db18' });
  K.benday(ctx, { col: 'rgba(43,59,255,0.18)' });
  K.popEye(ctx, 540, 340, 0.78, { look: lerp(-0.3, 0.65, ease.inOutSine(clamp((t - a) / 1.5))), t });
  K.priceTag(ctx, 'Rp65.000', 340, 780, 0.75, { k: 1, mood: 'shock', t, col: K.PAL.orange });
  K.priceTag(ctx, 'Rp70.000', 760, 760, 0.85, { k: 1, mood: 'wink', t, col: K.PAL.pink });
  K.arrow(ctx, 420, 1020, 700, 1020, { col: K.PAL.yellow, w: 60, k: kAt(t, a + 0.8) });
  K.sticker(ctx, 'NAMBAH Rp5.000 DAPAT JUMBO!', 540, 1180, { size: 84, col: K.PAL.yellow, rot: -0.04, k: kAt(t, a + 1.2), t });
});

// 5. Stamped: DECOY EFFECT (Dan Ariely)
shot('nama', (t, a, b) => {
  const lt = t - a;
  const st = clamp(lt / 0.25);
  camera(1.03 + 0.04 * clamp(lt / 2));
  K.sunburst(ctx, t, { c1: K.PAL.orange, c2: K.PAL.red, speed: 0.25 });
  K.benday(ctx, { col: 'rgba(255,225,77,0.28)', step: 28, r: 7 });
  K.sticker(ctx, 'EFEK UMPAN', 540, 660, {
    size: 165,
    col: K.PAL.white,
    txt: K.PAL.ink,
    rot: -0.05,
    k: st,
    t,
    sub: 'DECOY EFFECT • DAN ARIELY',
    subCol: K.PAL.pink,
  });
  K.starBadge(ctx, 'DOMINASI\nASIMETRIS', 270, 1120, { r: 170, col: K.PAL.lime, k: kAt(t, a + 0.4), t, size: 52 });
  K.shopper(ctx, 760, 1120, 0.78, { mood: 'shock', t, look: [-0.5, -0.4], k: kAt(t, a + 0.6) });
});

// 6. Payoff: Medium was never meant to be sold!
shot('akhir', (t, a, b) => {
  const p = clamp((t - a) / 3);
  camera(1 + 0.05 * p);
  K.sunburst(ctx, t, { c1: K.PAL.pink, c2: '#ff70bc', speed: 0.22 });
  K.benday(ctx);
  K.halftoneBlob(ctx, 540, 740, 440, K.PAL.cobalt);
  drawPopCup(ctx, 340, 740, 0.88, { label: 'M', price: 'UMPAN', col: K.PAL.orange, k: 1, t });
  drawPopCup(ctx, 740, 700, 1.18, { label: 'L', price: 'TARGET!', col: K.PAL.lime, k: 1, highlight: true, t });
  K.sticker(ctx, 'BELI SESUAI KEBUTUHAN!', 540, 260, { size: 92, col: K.PAL.yellow, rot: -0.04, k: kAt(t, a + 0.2), t });
  K.starBadge(ctx, 'JANGAN\nTERPANCING!', 540, 1140, { r: 185, col: K.PAL.white, txt: K.PAL.red, k: kAt(t, a + 1.0), t, size: 58 });
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
  const cols = [K.PAL.pink, K.PAL.cobalt, K.PAL.yellow, K.PAL.lime, K.PAL.orange, K.PAL.pink];
  L.forEach((sh, i) => {
    if (i === 0) return;
    const c0 = C[sh.id].start - 0.12;
    const k = (t - (c0 - 0.14)) / 0.28;
    if (k > 0 && k < 1) K.flood(fx, k, cols[i % cols.length], 540, 960);
  });
  AM.lib.grain(fx, t, { amount: 0.05, fps: 12 });
}

