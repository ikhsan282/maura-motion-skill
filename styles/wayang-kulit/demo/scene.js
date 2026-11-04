// Wayang Kulit demo: "Arjuna di Kurusetra" (Mahabharata / Bhagavad Gita), shots timed to the narration.
import * as K from '/styles/wayang-kulit/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'serif', y: 1500 } };

let ctx, fx;
let C = {};
const W = (id, w) => (C[id] ? AM.wordTime(id, w) : 0);
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  // sound design: dalang's keprak/cempala knocks, gong on the big moments
  AM.sfx('gong', 0.02, { gain: 0.55 });
  AM.sfx('keprak', 0.05, { gain: 0.5 });
  AM.sfx('keprak', W('hook', 'menjatuhkan') - 0.05, { gain: 0.45 });
  const at = (id, f = 'start') => (C[id] ? C[id][f] : NaN); // AM.sfx ignores NaN (missing lines)
  AM.sfx('cempala', at('arjuna') - 0.1, { gain: 0.5 });
  AM.sfx('keprak', at('ragu') - 0.05, { gain: 0.45 });
  AM.sfx('keprak', at('jatuh') + 0.2, { gain: 0.5 });
  if (C.kresna) AM.sfx('whoosh', W('kresna', 'menoleh') - 0.1, { gain: 0.35 });
  AM.sfx('gong', at('semesta'), { gain: 0.6 });
  AM.sfx('riser', at('semesta') + 0.3, { gain: 0.3 });
  if (C.semesta) AM.sfx('magic', W('semesta', 'semesta'), { gain: 0.35 });
  AM.sfx('swoosh_up', at('bangkit') + 0.2, { gain: 0.35 });
  AM.sfx('chime', at('bangkit', 'end') - 0.4, { gain: 0.3 });
  AM.sfx('drum_hit', at('perang'), { gain: 0.6 });
  AM.sfx('arrow', at('perang') + 0.5, { gain: 0.35 });
  AM.sfx('gong', C.moral.end + 0.2, { gain: 0.6 });
}

// ---------- helpers ----------
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const SHOTS = [];
const shot = (id, next, fn) => SHOTS.push({ id, next, fn });

function camera(z = 1, cx = 540, cy = 960, rot = 0) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, 960); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
function shake(t, amp) { return [noise.n2(t * 23, 1) * amp, noise.n2(t * 23, 5) * amp]; }
function flags(t, speed = 0, y = 1780) {
  // umbul-umbul banners on poles in the far back: drawn at 1/4 size and stretched, so they come out soft
  const lo = AM.lib.cached('wk-flags', () => AM.lib.makeCanvas(270, 480)), g = lo.getContext('2d');
  g.setTransform(0.25, 0, 0, 0.25, 0, 0); g.clearRect(0, 0, 1080, 1920);
  g.fillStyle = K.PAL.shadow;
  for (let i = 0; i < 7; i++) {
    const x = ((i * 260 - t * speed) % 1820 + 1820) % 1820 - 370;
    g.fillRect(x, y - 980, 9, 980);
    g.beginPath(); g.moveTo(x + 9, y - 970);
    for (let k = 0; k <= 10; k++) g.lineTo(x + 9 + Math.sin(t * 3 + k * 0.6 + i) * 18 + k * 3, y - 970 + k * 46);
    g.lineTo(x + 9, y - 500); g.closePath(); g.fill();
  }
  ctx.save(); ctx.globalAlpha = 0.35; ctx.drawImage(lo, 0, 0, 1080, 1920); ctx.restore();
}
function glowBehind(x, y, r, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,236,170,${a})`); g.addColorStop(0.4, `rgba(255,190,90,${a * 0.5})`); g.addColorStop(1, 'rgba(255,160,60,0)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
const tremble = (t, amt) => noise.n2(t * 9, 3) * amt;

// ---------- shots ----------
// 1. Hook: the gunungan sweeps open on a close-up of Arjuna, whose bow slips from his trembling hand.
shot('hook', 'arjuna', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1 + 0.07 * ease.inOutSine(p), 540, 1000);
  K.kelir(ctx, t, { flick: 1.4 });
  const drop = W('hook', 'menjatuhkan');
  const fall = clamp((t - drop - 0.2) / 0.9);
  const o = { x: 250, y: 2380, s: 1.75, t, armF: [0.35 + tremble(t, 0.05) + fall * 0.2, 2.3 - fall * 1.6], armB: [-0.25, 0.4] };
  K.puppet(ctx, 'arjuna', o);
  const [hx, hy, S] = K.hand('arjuna', o, 'F');
  if (fall < 1) K.bow(ctx, hx + 10 * S + fall * 60, hy + ease.inQuad(fall) * 1100, { s: S * 0.95, rot: 0.08 + tremble(t, 0.04) + ease.inQuad(fall) * 1.4, alpha: 1 - fall * 0.2 });
  // the gunungan opens the play
  const g = prog(t, a, a + 1.1, ease.inCubic);
  if (g < 1) K.gunungan(ctx, 540 - g * 1100, 1720, { s: 1.65, rot: -g * 0.9, depth: g * 0.3 });
  // series title
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const ta = env(t, a + 0.5, a + 4.8, 0.5, 0.6);
  K.goldTitle(ctx, 'MAHABHARATA', 540, 240, { size: 76, alpha: ta });
  K.nameplate(ctx, 'BHARATAYUDHA', 540, 330, { alpha: ta * 0.9, size: 34 });
});

// 2. Arjuna on his chariot, driven by Kresna, galloping onto Kurusetra.
shot('arjuna', 'kurawa', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.02 - 0.04 * p, 560 + 30 * p, 1060);
  K.kelir(ctx, t);
  flags(t, 260, 1800);
  const enter = ease.outCubic(clamp((t - a) / 1.4));
  const cx = lerp(-300, 400, enter), cy = 1560;
  const ph = (t * 1.6) % 1;
  K.horse(ctx, cx + 470, cy + 4, { s: 0.7, phase: ph + 0.3 });
  K.horse(ctx, cx + 380, cy, { s: 0.74, phase: ph });
  K.chariot(ctx, cx, cy, { s: 0.85, wheel: t * 5, flag: t * 0.8 });
  const deck = cy - 250 * 0.85;
  K.puppet(ctx, 'kresna', { x: cx + 170, y: deck, s: 0.5, t, armF: [1.25, 0.25], armB: [1.0, 0.3] });
  // reins
  const [rx, ry] = K.hand('kresna', { x: cx + 170, y: deck, s: 0.5, t, armF: [1.25, 0.25] }, 'F');
  ctx.save(); ctx.strokeStyle = K.PAL.shadow; ctx.globalAlpha = 0.85; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(rx, ry); ctx.quadraticCurveTo(rx + 120, ry + 40, cx + 380 + 300 * 0.74, cy - 500 * 0.74); ctx.stroke(); ctx.restore();
  K.puppet(ctx, 'arjuna', { x: cx - 80, y: deck, s: 0.62, t, armF: [0.6, 0.6] });
  K.gedebog(ctx, 1800);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.nameplate(ctx, 'ARJUNA', 540, 300, { alpha: env(t, W('arjuna', 'Arjuna') || a, b, 0.4, 0.3) });
});

// 3. A hundred Kurawa march in, rows on rows.
shot('kurawa', 'bisma', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.0 + 0.05 * p, 540, 1000);
  K.kelir(ctx, t, { glow: 0.95 });
  const rows = [{ y: 1180, s: 0.36, d: 0.55, n: 9 }, { y: 1420, s: 0.46, d: 0.3, n: 7 }, { y: 1760, s: 0.6, d: 0.0, n: 5 }];
  rows.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const step = 1300 / r.n;
      const x = 380 + i * step - ease.outCubic(clamp((t - a - ri * 0.15) / 2.2)) * 260 - (t - a) * 24 + (ri % 2) * step * 0.5;
      const o = { x, y: r.y, s: r.s, face: -1, t: t + i, depth: r.d * 0.5, armF: [0.9, 0.1], armB: [-0.2, 0.3], wobble: 2 };
      K.puppet(ctx, 'prajurit', o);
      const [hx, hy, S] = K.hand('prajurit', o, 'F');
      ctx.save(); ctx.globalAlpha = 0.85 - r.d * 0.7; ctx.fillStyle = K.PAL.shadow;
      ctx.fillRect(hx - 3 * S, hy - 700 * S, 7 * S, 900 * S);
      ctx.beginPath(); ctx.moveTo(hx - 16 * S, hy - 700 * S); ctx.lineTo(hx, hy - 790 * S); ctx.lineTo(hx + 16 * S, hy - 700 * S); ctx.fill(); ctx.restore();
    }
  });
  K.gedebog(ctx, 1800);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const n = W('kurawa', 'seratus') || a;
  const na = env(t, n - 0.1, b, 0.35, 0.3);
  const count = Math.round(lerp(1, 100, ease.outCubic(clamp((t - n + 0.1) / 1.0))));
  K.goldTitle(ctx, String(count), 540, 420, { size: 200, alpha: na, spacing: 4 });
  K.nameplate(ctx, 'KURAWA', 540, 560, { alpha: na });
});

// 4. Bisma, the grandfather.
shot('bisma', 'durna', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.04 + 0.04 * p, 560, 1000);
  K.kelir(ctx, t);
  flags(t, 20, 1800);
  const x = lerp(1200, 650, ease.outCubic(clamp((t - a) / 1.2)));
  K.puppet(ctx, 'bisma', { x, y: 1800, s: 1.05, face: -1, t, armF: [1.0 + 0.25 * Math.sin(t * 2), 0.35], armB: [-0.3, 0.4] });
  K.gedebog(ctx, 1800);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.nameplate(ctx, 'RESI BISMA', 540, 300, { alpha: env(t, a + 0.5, b, 0.4, 0.3) });
});

// 5. Durna, the teacher; Bisma steps back.
shot('durna', 'ragu', (t, a, b) => {
  camera(1.0, 540, 1000);
  K.kelir(ctx, t);
  K.puppet(ctx, 'bisma', { x: lerp(650, 830, ease.inOutCubic(clamp((t - a) / 1))), y: 1640, s: 0.85, face: -1, t, depth: 0.35, alpha: 0.85 });
  const x = lerp(-200, 420, ease.outCubic(clamp((t - a) / 1.2)));
  K.puppet(ctx, 'durna', { x, y: 1800, s: 1.05, face: 1, t, armF: [1.4 + 0.1 * Math.sin(t * 3), 0.25], armB: [-0.4, 0.6] });
  K.gedebog(ctx, 1800);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.nameplate(ctx, 'PANDITA DURNA', 540, 300, { alpha: env(t, a + 0.5, b, 0.4, 0.3) });
});

// 6. Close on Arjuna: trembling hands, a doubled shadow of doubt, the lamp unsteady.
shot('ragu', 'jatuh', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1 + 0.12 * ease.inOutSine(p), 520, 900);
  K.kelir(ctx, t, { flick: 2.6, glow: 0.92 });
  const tr = 0.06 + 0.1 * p;
  const o = { x: 260, y: 2300, s: 1.7, t, armF: [0.35 + tremble(t, tr), 2.3 + tremble(t + 3, tr)], armB: [-0.2, 0.5] };
  // ghost of doubt: a second, softer shadow drifting off
  K.puppet(ctx, 'arjuna', { ...o, x: o.x + 40 + Math.sin(t * 1.7) * 30, depth: 0.25, alpha: 0.35 + 0.2 * p });
  K.puppet(ctx, 'arjuna', o);
  const [hx, hy, S] = K.hand('arjuna', o, 'F');
  K.bow(ctx, hx + 10 * S, hy, { s: S * 0.95, rot: 0.05 + tremble(t, tr * 0.6) });
});

// 7. The bow Gandiwa falls, in slow motion, onto the banana trunk.
shot('jatuh', 'kresna', (t, a, b) => {
  const f = clamp((t - a - 0.15) / 1.4);
  camera(1.05, 540, lerp(930, 1180, ease.inOutSine(clamp((t - a) / 2))));
  K.kelir(ctx, t, { flick: 1.6 });
  const o = { x: 380, y: 1800, s: 1.05, t, armF: [lerp(0.9, 0.12, ease.inOutCubic(f)), lerp(0.6, 0.05, f)], armB: [-0.2, 0.3] };
  K.puppet(ctx, 'arjuna', o);
  const [hx, hy, S] = K.hand('arjuna', o, 'F');
  const fall = ease.inQuad(f);
  const landY = 1770;
  const by = lerp(hy - 30 * S, landY - 40, fall);
  const bounce = t - a > 1.55 ? Math.exp(-(t - a - 1.55) * 6) * Math.sin((t - a - 1.55) * 25) * 20 : 0;
  K.bow(ctx, lerp(hx + 20 * S, 720, fall), by - bounce, { s: S * 0.95, rot: lerp(0.1, 1.52, fall) });
  K.gedebog(ctx, 1800);
});

// 8. The charioteer turns: he is Kresna. A golden light rises behind him.
shot('kresna', 'nasihat', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.15 + 0.06 * p, 520, 1150);
  K.kelir(ctx, t);
  const turn = W('kresna', 'menoleh');
  const f = ease.inOutCubic(clamp((t - turn) / 0.3));
  const face = Math.cos(f * Math.PI); // 1 -> -1, with the thin edge-on moment in between
  const reveal = env(t, W('kresna', 'Dialah'), b + 1, 0.8, 0.5);
  glowBehind(640, 1050, 520 + 80 * Math.sin(t * 2), 0.55 * reveal);
  K.chariot(ctx, 450, 1600, { s: 0.85, wheel: 0, flag: t * 0.5 });
  const deck = 1600 - 250 * 0.85;
  K.puppet(ctx, 'arjuna', { x: 330, y: deck, s: 0.62, t, armF: [0.15, 0.05], armB: [-0.1, 0.1] });
  K.puppet(ctx, 'kresna', { x: 640, y: deck, s: 0.6, t, face: Math.abs(face) < 0.08 ? 0.08 * Math.sign(face || 1) : face, armF: [lerp(1.2, 0.8, f), lerp(0.3, 0.9, f)] });
  K.gedebog(ctx, 1800);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.nameplate(ctx, 'KRESNA', 540, 300, { alpha: reveal });
  K.nameplate(ctx, 'TITISAN DEWA WISNU', 540, 370, { alpha: reveal * 0.85, size: 30 });
});

// 9. Kresna teaches; Arjuna bows his head.
shot('nasihat', 'semesta', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.0 + 0.05 * p, 540, 1000);
  K.kelir(ctx, t, { glow: 1.02 });
  K.gunungan(ctx, 540, 1500, { s: 0.75, depth: 0.55, alpha: 0.5 });
  K.puppet(ctx, 'kresna', { x: 330, y: 1800, s: 1.0, t, armF: [2.0 + 0.12 * Math.sin(t * 1.6), 0.5], armB: [-0.25, 0.4] });
  K.puppet(ctx, 'arjuna', { x: 770, y: 1830, s: 0.95, face: -1, t, armF: [0.3, 0.9], armB: [0.1, 0.8] });
  K.gedebog(ctx, 1800);
});

// 10. Wiswarupa: Kresna moves towards the lamp and his shadow becomes the universe.
shot('semesta', 'bangkit', (t, a, b) => {
  const p = clamp((t - a) / (b - a - 0.2));
  const d = ease.inOutCubic(p) * 0.72;
  const [sx, sy] = shake(t, 4 * p);
  camera(1.0, 540 + sx, 1000 + sy);
  K.kelir(ctx, t, { glow: 1 + 0.25 * p, flick: 1.5 });
  glowBehind(540, 900, 900, 0.4 * p);
  K.puppet(ctx, 'kresna', { x: 470, y: 1800, s: 1.0, t, depth: d, armF: [lerp(2.0, 2.6, p), 0.4], armB: [lerp(-0.25, -1.2, p), 0.3], fill: p > 0.08 ? K.cosmosFill(t) : null, alpha: 1 });
  K.puppet(ctx, 'arjuna', { x: 860, y: 1830, s: 0.55, face: -1, t, armF: [0.5, 1.2] });
  K.gedebog(ctx, 1800);
});

// 11. Arjuna picks up the bow again.
shot('bangkit', 'perang', (t, a, b) => {
  const f = ease.outCubic(clamp((t - a - 0.1) / 1.4));
  camera(1.12, 520, 1100);
  K.kelir(ctx, t, { glow: 1.05 });
  const o = { x: 420, y: 1900, s: 1.2, t, armF: [lerp(0.15, 1.15, f), lerp(0.05, 0.5, f)], armB: [-0.2, 0.4] };
  K.puppet(ctx, 'arjuna', o);
  const [hx, hy, S] = K.hand('arjuna', o, 'F');
  glowBehind(hx + 30, hy - 40, 300 * f + 1, 0.5 * f);
  K.bow(ctx, lerp(720, hx + 20 * S, f), lerp(1760, hy - 30 * S, f), { s: S * 0.95, rot: lerp(1.52, 0.05, f) });
  K.gedebog(ctx, 1800);
});

// 12. Bharatayudha: the gunungan storms, armies clash, arrows fly.
shot('perang', 'gita', (t, a, b) => {
  const lt = t - a;
  const [sx, sy] = shake(t, 10);
  camera(1.04, 540 + sx, 1000 + sy, noise.n2(t * 3, 9) * 0.02);
  K.kelir(ctx, t, { flick: 2.4, glow: 1.0 });
  K.gunungan(ctx, 540, 1650, { s: 1.35, rot: Math.sin(lt * 9) * 0.22, depth: 0.45, alpha: 0.75 });
  const close = ease.inOutCubic(clamp(lt / 1.6));
  K.puppet(ctx, 'arjuna', { x: lerp(120, 380, close) + Math.sin(lt * 10) * 10, y: 1800, s: 0.9, t, armF: [1.5, 0.1], armB: [-0.6, 0.9] });
  for (let i = 0; i < 3; i++) K.puppet(ctx, 'prajurit', { x: lerp(1150, 720, close) + i * 150, y: 1800 - i * 120, s: 0.75 - i * 0.12, face: -1, t: t + i, depth: i * 0.2, armF: [1.3, 0.2], wobble: 3 });
  for (let i = 0; i < 14; i++) {
    const st = a + 0.2 + i * 0.18, u = (t - st) / 0.7;
    if (u < 0 || u > 1) continue;
    const dir = i % 2 ? -1 : 1, y0 = 700 + hrand(i, 2) * 500;
    K.arrow(ctx, dir > 0 ? lerp(-100, 1200, u) : lerp(1200, -100, u), y0 + Math.sin(u * Math.PI) * -120, dir > 0 ? -0.2 + u * 0.4 : Math.PI + 0.2 - u * 0.4, { len: 220 });
  }
  K.gedebog(ctx, 1800);
});

// 13. Tancep kayon: calm returns; the conversation became the Bhagavad Gita.
shot('gita', 'moral', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(1.0 + 0.04 * p, 540, 1000);
  K.kelir(ctx, t, { glow: 1.05, flick: 0.8 });
  const g = ease.outBack(clamp((t - a) / 1.0), 1.2);
  K.gunungan(ctx, 540, lerp(2400, 1760, g), { s: 1.25 });
  K.chariot(ctx, 200, 1800, { s: 0.38, flag: t * 0.6, alpha: 0.6 });
  K.chariot(ctx, 880, 1800, { s: 0.38, face: -1, flag: t * 0.6, alpha: 0.6 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const ga = env(t, (W('gita', 'Bhagavad') || a) - 0.2, b + 0.2, 0.6, 0.4);
  K.goldTitle(ctx, 'BHAGAVAD', 540, 330, { size: 92, alpha: ga });
  K.goldTitle(ctx, 'GITA', 540, 440, { size: 92, alpha: ga });
  K.nameplate(ctx, 'NYANYIAN SANG ILAHI', 540, 530, { alpha: ga * 0.9, size: 30 });
});

// 14. Arjuna stands with his bow drawn; the gunungan closes the play.
shot('moral', null, (t, a, b) => {
  const p = clamp((t - a) / (C.moral.end - a));
  camera(1.0 + 0.08 * ease.inOutSine(p), 540, 1050);
  const end = C.moral.end + 0.15;
  const closeP = ease.inOutCubic(clamp((t - end + 0.1) / 0.6));
  K.kelir(ctx, t, { glow: lerp(1.05, 0.55, closeP), flick: 0.8 });
  const draw = ease.inOutCubic(clamp((t - a - 0.4) / 1.5));
  const o = { x: 360, y: 1800, s: 1.1, t, armF: [lerp(1.0, 1.55, draw), lerp(0.4, 0.05, draw)], armB: [lerp(-0.2, 1.35, draw), lerp(0.4, 0.3, draw)] };
  K.puppet(ctx, 'arjuna', o);
  const [hx, hy, S] = K.hand('arjuna', o, 'F');
  K.bow(ctx, hx + 10 * S, hy - 10 * S, { s: S * 0.95, rot: lerp(0.05, 0.0, draw), drawn: draw * 0.6 });
  if (draw > 0.6) K.arrow(ctx, hx + 260 * S, hy - 12 * S, 0, { len: 260 * S * draw });
  K.gunungan(ctx, lerp(1500, 540, closeP), 1760, { s: 1.6, rot: (1 - closeP) * 0.8 });
  K.gedebog(ctx, 1800);
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
  // hard cut flash: a quick lamp flare on every cut (like the dalang shaking the blencong)
  const since = t - Math.max(0, a);
  if (since < 0.18 && s.id !== 'hook') { fx.fillStyle = `rgba(255,214,150,${0.22 * (1 - since / 0.18)})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(fx, { strength: 0.55, inner: 0.35 });
  AM.lib.grain(fx, t, { amount: 0.07, fps: 12 });
}
