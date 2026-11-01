// Pop Art demo: "Kenapa Harga Selalu Berakhir 99?" — 19.6 s loud pop poster.
import * as K from '/styles/pop-art/kit.js';
const { clamp, lerp, ease, prog, env, hrand } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'comic', y: 1490, size: 76, font: 'Bebas Neue', upper: true, spacing: 3, color: '#0e0f1f', active: '#ff3ea5', box: { fill: '#ffffff', pad: 20, radius: 10, border: '#0e0f1f', borderW: 7 } } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('impact', 0.04, { gain: 0.45 });
  AM.sfx('pop', W('hook', 'bukan'), { gain: 0.45 });
  AM.sfx('whoosh', C.kiri.start, { gain: 0.35 });
  AM.sfx('ding', W('kiri', 'kiri'), { gain: 0.4 });
  AM.sfx('pop', W('baca', 'sembilan'), { gain: 0.4 });
  AM.sfx('boing', W('baca', 'Padahal'), { gain: 0.45 });
  AM.sfx('stamp', C.nama.start + 0.1, { gain: 0.55 });
  AM.sfx('coin', W('lawan', 'atas'), { gain: 0.45 });
  AM.sfx('pop', W('akhir', 'trik'), { gain: 0.5 });
}
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
function camera(z = 1, cx = 540, cy = 960) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-cx, -cy); }
const kAt = (t, at, d = 0.25) => clamp((t - at) / d);

// 1. The Rp99.000 tag slaps onto a spinning sunburst; the shopper gasps; "bukan Rp100.000?"
shot('hook', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1 + 0.06 * p);
  K.sunburst(ctx, t, { c1: PAL().yellow, c2: PAL().orange });
  K.benday(ctx, { col: 'rgba(255,62,165,0.25)' });
  K.halftoneBlob(ctx, 540, 640, 420, '#ff3ea5');
  K.priceTag(ctx, 'Rp99.000', 560, 600, 1.15, { k: kAt(t, 0, 0.3), mood: 'smug', t, col: PAL().pink });
  K.shopper(ctx, 300, 1080, 0.85, { mood: t > W('hook', 'bukan') ? 'shock' : 'think', t, look: [0.6, -0.4], k: kAt(t, 0.35, 0.3) });
  const bk = kAt(t, W('hook', 'bukan') - 0.05);
  K.sticker(ctx, 'Rp100.000?', 790, 1060, { size: 110, col: PAL().lime, rot: 0.08, k: bk, t });
  K.starBadge(ctx, 'KENAPA\n99?', 840, 260, { r: 150, col: PAL().lime, k: kAt(t, 0.15, 0.3), t, size: 64 });
});

// 2. A giant eye scans from the left; the first digit gets the spotlight.
shot('kiri', (t, a, b) => {
  const p = (t - a) / (b - a), kr = W('kiri', 'kiri') - 0.1;
  camera(1.02 + 0.05 * p);
  K.sunburst(ctx, t, { c1: PAL().cobalt, c2: '#1f2bd0' });
  K.benday(ctx, { col: 'rgba(198,255,61,0.18)' });
  K.popEye(ctx, 540, 380, 0.85, { look: lerp(-1, -0.6, ease.inOutSine(clamp((t - a) / 1.2))) + (t > kr ? 0 : Math.sin(t * 6) * 0.15), t });
  K.priceTag(ctx, 'Rp99.000', 560, 900, 1.15, { k: 1, mood: 'shock', t, col: PAL().pink, highlight: t > kr ? 2 : null });
  K.arrow(ctx, 160, 1190, 360, 1060, { col: PAL().lime, k: kAt(t, kr, 0.35) });
  K.sticker(ctx, 'DIBACA DULUAN!', 420, 1240, { size: 84, col: PAL().yellow, rot: -0.06, k: kAt(t, kr + 0.15), t });
});

// 3. "Nine… feels like ninety-something!" — then the reveal: it's basically 100.
shot('baca', (t, a, b) => {
  const pd = W('baca', 'Padahal') - 0.1;
  const rev = t >= pd;
  camera(1.04, 540, 960);
  K.sunburst(ctx, t, { c1: rev ? PAL().lime : PAL().pink, c2: rev ? '#8fe01a' : '#e0208a', speed: rev ? 0.5 : 0.18 });
  K.benday(ctx);
  if (!rev) {
    K.priceTag(ctx, 'Rp99.000', 560, 520, 0.95, { k: 1, mood: 'smug', t, col: PAL().yellow, digitAlpha: (i) => (i === 2 ? 1 : 0.25) });
    K.starBadge(ctx, '90-AN', 760, 980, { r: 190, col: PAL().lime, k: kAt(t, W('baca', 'sembilan') - 0.1), t, size: 110 });
    K.shopper(ctx, 300, 1080, 0.75, { mood: 'happy', t, k: 1 });
  } else {
    // bars: 99.000 vs 100.000 — almost identical
    const bk = ease.outCubic(kAt(t, pd + 0.1, 0.6));
    const bar = (y, wv, col, lab) => { const p = new Path2D(); p.roundRect(120, y, 820 * wv * bk, 120, 16); K.cut(ctx, p, col, { border: 10, shadow: 14, lw: 6 }); ctx.font = "400 84px 'Bebas Neue'"; ctx.fillStyle = PAL().ink; ctx.textBaseline = 'middle'; ctx.fillText(lab, 150, y + 66); };
    bar(420, 0.99, PAL().pink, 'Rp99.000'); bar(600, 1.0, PAL().cobalt, ''); ctx.fillStyle = '#fff'; ctx.font = "400 84px 'Bebas Neue'"; ctx.fillText('Rp100.000', 150, 666);
    K.sticker(ctx, 'SELISIH CUMA Rp1.000', 540, 860, { size: 92, col: PAL().yellow, rot: -0.04, k: kAt(t, pd + 0.5), t });
    K.shopper(ctx, 540, 1110, 0.7, { mood: 'shock', t, look: [0, -0.6], k: 1 });
    K.sticker(ctx, 'HAMPIR SERATUS!', 780, 260, { size: 80, col: PAL().white, txt: PAL().red, rot: 0.08, k: kAt(t, W('baca', 'hampir') - 0.1), t });
  }
});

// 4. The name, stamped: EFEK DIGIT KIRI.
shot('nama', (t, a, b) => {
  const lt = t - a;
  const st = clamp(lt / 0.22), squash = st >= 1 ? 1 + Math.exp(-(lt - 0.22) * 9) * Math.sin((lt - 0.22) * 30) * 0.06 : 1;
  camera(1.03 + 0.03 * clamp(lt / 1.5));
  K.sunburst(ctx, t, { c1: PAL().orange, c2: PAL().red, speed: 0.25 });
  K.benday(ctx, { col: 'rgba(255,225,77,0.3)', step: 30, r: 8 });
  ctx.save(); ctx.translate(540, 720); ctx.scale(squash, 2 - squash);
  K.sticker(ctx, 'EFEK DIGIT KIRI', 0, 0, { size: 170, col: PAL().white, txt: PAL().ink, rot: -0.05, k: st, t, sub: 'LEFT-DIGIT EFFECT', subCol: PAL().pink });
  ctx.restore();
  K.priceTag(ctx, '9', 260, 1150, 0.9, { k: kAt(t, a + 0.3, 0.3), mood: 'wink', t, col: PAL().lime, face: true, size: 200, rot: -0.15 });
  K.starBadge(ctx, 'THOMAS &\nMORWITZ\n2005', 800, 1150, { r: 170, col: PAL().yellow, k: kAt(t, a + 0.5, 0.3), t, size: 46 });
});

// 5. Fight back: round it UP — the odometer rolls 99.000 → 100.000.
shot('lawan', (t, a, b) => {
  const up = W('lawan', 'bulatkan') - 0.1;
  camera(1.04, 540, 960);
  K.sunburst(ctx, t, { c1: PAL().lime, c2: '#9be52a', speed: 0.3 });
  K.benday(ctx, { col: 'rgba(43,59,255,0.18)' });
  K.odometer(ctx, ' 99.000', '100.000', 540, 560, { size: 230, k: clamp((t - up) / 0.9) });
  K.arrow(ctx, 900, 900, 900, 640, { col: PAL().pink, w: 70, k: kAt(t, up, 0.4) });
  K.sticker(ctx, 'BULATKAN KE ATAS', 540, 280, { size: 100, col: PAL().pink, txt: '#fff', rot: -0.05, k: kAt(t, up), t });
  K.shopper(ctx, 360, 1080, 0.8, { mood: 'smug', t, k: 1, look: [0.5, -0.3] });
});

// 6. Rp1.000 isn't a discount. It's a trick. — the tag winks; hold.
shot('akhir', (t, a, b) => {
  const p = clamp((t - a) / 2.5), tr = W('akhir', 'trik') - 0.1;
  camera(1 + 0.05 * p);
  K.sunburst(ctx, t, { c1: PAL().pink, c2: '#ff74c0', speed: 0.2 });
  K.benday(ctx, { col: 'rgba(14,15,31,0.15)' });
  K.halftoneBlob(ctx, 540, 820, 460, '#2b3bff');
  K.priceTag(ctx, 'Rp99.000', 540, 820, 1.1, { k: 1, mood: t > tr ? 'wink' : 'smug', t, col: PAL().yellow });
  K.sticker(ctx, 'BUKAN DISKON', 400, 300, { size: 110, col: PAL().white, txt: PAL().ink, rot: -0.07, k: kAt(t, W('akhir', 'bukan') - 0.1), t });
  ctx.save(); if (t > W('akhir', 'bukan') + 0.2) { ctx.strokeStyle = PAL().red; ctx.lineWidth = 22; ctx.lineCap = 'round'; const k = ease.outCubic(kAt(t, W('akhir', 'bukan') + 0.2, 0.2)); ctx.beginPath(); ctx.moveTo(110, 330); ctx.lineTo(110 + 580 * k, 270); ctx.stroke(); } ctx.restore();
  K.starBadge(ctx, 'ITU\nTRIK!', 800, 1140, { r: 200, col: PAL().lime, k: kAt(t, tr), t, size: 100 });
});

let _pal; function PAL() { return _pal || (_pal = K.PAL); }
export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // colour flood between scenes (0.25 s around each cut)
  const L = SHOTS.filter((x) => C[x.id]);
  const cols = [K.PAL.pink, K.PAL.cobalt, K.PAL.lime, K.PAL.orange, K.PAL.yellow, K.PAL.pink];
  L.forEach((sh, i) => { if (i === 0) return; const c0 = C[sh.id].start - 0.12; const k = (t - (c0 - 0.14)) / 0.28; if (k > 0 && k < 1) K.flood(fx, k, cols[i % cols.length], 540, 960); });
  const endA = clamp((t - (AM.duration - 0.45)) / 0.45);
  if (endA > 0) { fx.fillStyle = `rgba(14,15,31,${endA})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.grain(fx, t, { amount: 0.05, fps: 12 });
}
