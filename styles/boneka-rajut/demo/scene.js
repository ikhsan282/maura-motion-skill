// Boneka Rajut demo: "Kura-kura dan Monyet Menanam Pisang" — a knitted-toy fable on a felt diorama, 6 shots, ~19.5 s.
import * as K from '/styles/boneka-rajut/kit.js';
const { clamp, lerp, ease, prog, env, noise } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'kids', y: 1470, size: 74, anim: 'rise' } };

let ctx, fx;
const C = {};
const L = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  // bake the felt diorama once
  L.far = K.hillLayer('far', { y0: 0, amp: 70, color: K.PAL.hillFar, seed: 2, stitch: '#f2fadf', trees: 7 });
  L.near = K.hillLayer('near', { y0: 0, amp: 55, color: K.PAL.hillNear, seed: 5, flowers: 26 });
  L.ground = K.hillLayer('ground', { y0: 0, amp: 22, color: K.PAL.meadow, seed: 9, flowers: 70, stitch: '#d9f2b0' });
  // toy-box foley on the real moments
  AM.sfx('pop', 0.12, { gain: 0.45 });
  AM.sfx('slide_whistle', W('hook', 'sesali') + 0.05, { gain: 0.3, pitch: 0.85 });
  AM.sfx('pop', W('tumbuh', 'lebat'), { gain: 0.45, pitch: 1.2 });
  AM.sfx('squish', W('makan', 'makan') + 0.1, { gain: 0.35 });
  AM.sfx('pop', W('duri', 'duri') - 0.05, { gain: 0.35, pitch: 0.9 });
  AM.sfx('jump', W('aduh', 'melompat'), { gain: 0.4 });
  AM.sfx('impact', W('aduh', 'aduh') - 0.05, { gain: 0.45 });
  AM.sfx('boing', W('aduh', 'aduh') + 0.08, { gain: 0.45, pitch: 1.3 });
}

const span = (id, next) => [C[id].start - 0.12, next ? C[next].start - 0.12 : AM.duration + 1];
const SHOTS = [];
const shot = (id, next, fn) => SHOTS.push({ id, next, fn });

/** Felt diorama behind everything. c = camera {x,y,z}; layers parallax by depth. */
function world(t, c, { sunset = 0, sunX = 820, sunY = 330, farY = 800, nearY = 930, groundY = 1080, sunS = 0.7 } = {}) {
  K.sky(ctx, { sunset });
  K.cam(ctx, c, 0.06); K.sun(ctx, sunX, sunY, { s: sunS, t });
  K.cam(ctx, c, 0.12); K.cloud(ctx, 160 + ((t * 14) % 1500) - 300, 200, { s: 0.8, seed: 0 }); K.cloud(ctx, 1000 - ((t * 10) % 1500) + 300, 470, { s: 0.6, seed: 1 });
  K.cam(ctx, c, 0.35); K.drawLayer(ctx, L.far, farY);
  K.cam(ctx, c, 0.6); K.drawLayer(ctx, L.near, nearY);
  K.cam(ctx, c, 1); K.drawLayer(ctx, L.ground, groundY);
}
const TREE_X = 640, TREE_Y = 1222;
const THORNS = [[520, 1262, -0.15], [760, 1262, 0.15], [455, 1300, -0.1], [830, 1300, 0.12], [640, 1305, 0]];

// 1. Hook: the monkey proudly hoists the leafy top... and it wilts in his arms.
shot('hook', 'bawah', (t, a, b) => {
  const p = (t - a) / (b - a);
  const c = { x: 480 + 40 * p, y: 1010, z: 1.36 + 0.07 * ease.inOutSine(p) };
  world(t, c);
  const wAtas = W('hook', 'atas'), wSes = W('hook', 'sesali');
  const lift = prog(t, wAtas - 0.35, wAtas + 0.3, ease.outBack);
  const wilt = prog(t, wSes - 0.25, wSes + 0.6, ease.inOutCubic);
  // the turtle trots past behind, the rooty stump on its shell
  const tx = 940 - (t - a) * 18;
  K.contactShadow(ctx, tx, 1262, 300, 0.3);
  K.turtle(ctx, { x: tx, y: 1262, s: 0.7, t, face: -1, walk: 9, look: -0.4, mood: wilt > 0.4 ? 'sly' : 'smile', brows: wilt > 0.4 ? 'up' : null, seed: 2 });
  K.plantPiece(ctx, 'bottom', { x: tx + 10, y: 1262 - 0.7 * 175, rot: -Math.PI / 2 + 0.1 + Math.sin(t * 9) * 0.03, s: 0.42, t });
  K.contactShadow(ctx, 400, 1300, 340, 0.42);
  const mood = wilt > 0.55 ? 'frown' : wilt > 0.12 ? 'o' : 'grin';
  const m = K.monkey(ctx, { x: 390, y: 1300, s: 1.0, t, armR: lerp(0.9, 2.5, lift) - wilt * 0.6, armL: 0.35 + lift * 0.3, look: wilt > 0.12 ? 0.35 : 0, mood, brows: wilt > 0.5 ? 'sad' : null, hop: Math.max(0, Math.sin((t - wAtas) * 9)) * 22 * env(t, wAtas, wAtas + 0.7, 0.05, 0.3) });
  const [hx, hy] = m.handR;
  K.plantPiece(ctx, 'top', { x: hx, y: hy + 6, rot: lerp(0.5, 0.18, lift) + wilt * 0.35, s: 0.6, t, wilt });
  if (wilt > 0.5) K.drop(ctx, m.head[0] - 85, m.head[1] - 40 + (t - wSes) * 70, 1, { alpha: env(t, wSes + 0.3, b, 0.15, 0.2) });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const d = prog(t, a + 0.02, a + 0.7, ease.outBack);
  K.banner(ctx, 'KURA-KURA & MONYET', 540, lerp(-160, 250, d), { t, size: 66 });
});

// 2. The turtle gets the rest: stump and yarn roots. A shrug, then a happy face anyway.
shot('bawah', 'tumbuh', (t, a, b) => {
  const p = (t - a) / (b - a);
  const c = { x: lerp(560, 620, p), y: 1030, z: 1.3 + 0.12 * ease.inOutSine(p) };
  world(t, c);
  const akar = W('bawah', 'akar'), sisa = W('bawah', 'sisanya');
  K.contactShadow(ctx, 800, 1295, 260, 0.45);
  K.plantPiece(ctx, 'bottom', { x: 800, y: 950, s: 0.85, t, rot: Math.sin(t * 2.2) * 0.03 });
  const shrug = env(t, sisa - 0.2, akar - 0.05, 0.2, 0.2);
  K.contactShadow(ctx, 470, 1300, 380, 0.45);
  K.turtle(ctx, { x: 460, y: 1300, s: 1.0, t, face: 1, look: 0.55, legLift: shrug, neck: 0.3 - shrug * 0.4, mood: t > akar ? 'grin' : shrug > 0.3 ? 'wavy' : 'flat', eyes: t > akar + 0.2 ? 'happy' : 'button', brows: shrug > 0.3 ? 'sad' : null, hop: t > akar ? Math.max(0, Math.sin((t - akar) * 9)) * 16 : 0 });
  K.cam(ctx, c, 1);
  const la = env(t, akar - 0.15, b + 0.2, 0.25, 0.2), ba = env(t, W('bawah', 'batang') - 0.15, b + 0.2, 0.25, 0.2);
  K.patch(ctx, 'batang', 640, 900, { size: 40, fill: K.PAL.cream, ink: K.PAL.ink, stitch: K.PAL.red, s: ease.outBack(ba), rot: -0.08 });
  K.patch(ctx, 'akar', 900, 1140, { size: 40, fill: K.PAL.cream, ink: K.PAL.ink, stitch: K.PAL.red, s: ease.outBack(la), rot: 0.1 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.patch(ctx, 'bagian Kura-kura', 540, 260, { size: 50, fill: K.PAL.shell, ink: K.PAL.white, s: ease.outBack(env(t, a + 0.05, b + 0.3, 0.35, 0.2)) });
});

// 3. Planting: the camera slides from the monkey's wilting top to the turtle's stump, which shoots up and fruits.
shot('tumbuh', 'makan', (t, a, b) => {
  const layu = W('tumbuh', 'layu'), punya = W('tumbuh', 'Punya'), lebat = W('tumbuh', 'lebat');
  const pan = prog(t, punya - 0.35, punya + 0.45, ease.inOutCubic);
  const grow = prog(t, punya - 0.1, punya + 1.0, ease.outCubic);
  const c = { x: lerp(300, 820, pan), y: lerp(1050, 900, grow), z: lerp(1.35, 1.05, pan) };
  world(t, c);
  K.mound(ctx, 260, 1250, { s: 0.95 });
  K.mound(ctx, 860, 1250, { s: 1.1 });
  const wilt = prog(t, layu - 0.5, layu + 0.5, ease.inOutCubic);
  K.plantPiece(ctx, 'top', { x: 260, y: 1218, s: 0.55, t, wilt, roots: false });
  const bunch = prog(t, W('tumbuh', 'berbuah') - 0.1, lebat + 0.25, ease.linear);
  K.bananaTree(ctx, 860, 1222, { s: 0.98, grow, t, bunch });
  K.contactShadow(ctx, 470, 1330, 280, 0.4);
  K.monkey(ctx, { x: 470, y: 1330, s: 0.62, t, look: -0.6, mood: wilt > 0.5 ? 'frown' : 'o', brows: wilt > 0.5 ? 'sad' : 'up', armL: 0.3 + wilt * 0.9, tilt: -wilt * 0.06 });
  if (wilt > 0.4) for (let k = 0; k < 2; k++) { const tt = ((t - layu) * 1.4 + k * 0.5) % 1; K.drop(ctx, 440 + k * 60, 1100 + tt * 110, 0.6, { alpha: (1 - tt) }); }
  K.contactShadow(ctx, 640, 1330, 280, 0.4);
  const jump = Math.max(0, Math.sin((t - lebat) * 9)) * 26 * clamp((t - lebat + 0.2) * 3);
  K.turtle(ctx, { x: 640, y: 1330, s: 0.66, t, face: 1, look: 0.3, neck: 0.7 * grow, mood: grow > 0.4 ? 'grin' : 'smile', eyes: bunch > 0.7 ? 'happy' : 'button', hop: jump });
});

// 4. The monkey climbs up and eats every banana; peels rain down on the turtle.
shot('makan', 'duri', (t, a, b) => {
  const lt = t - a;
  const top = TREE_Y - 560 * 0.98;
  const climb = prog(t, a, W('makan', 'lalu') + 0.1, ease.inOutSine);
  const fall = prog(t, W('makan', 'semua'), b, ease.inOutCubic);
  const c = { x: 600, y: lerp(lerp(1000, 760, climb), 1000, fall), z: lerp(1.28, 1.12, fall) };
  world(t, c);
  K.mound(ctx, TREE_X, 1250, { s: 1.1 });
  const eat = prog(t, W('makan', 'makan'), b, ease.linear);
  K.bananaTree(ctx, TREE_X, TREE_Y, { s: 0.98, grow: 1, t, bunch: 1 - eat * 0.92 });
  let m;
  if (climb < 1) { // hugging the trunk, shinning up
    const y = lerp(TREE_Y - 40, top + 80, climb);
    m = K.monkey(ctx, { x: TREE_X - 6, y, s: 0.55, t, armL: 2.6 + Math.sin(lt * 14) * 0.2, armR: 2.6 - Math.sin(lt * 14) * 0.2, legL: 0.5, legR: -0.5, look: 0.5, mood: 'grin', hop: Math.abs(Math.sin(lt * 14)) * 10 });
  } else {
    m = K.monkey(ctx, { x: TREE_X - 40, y: top + 60, s: 0.55, t, sit: 1, belly: 1 + eat * 0.38, mood: 'chew', armR: 2.0 + Math.sin(t * 8) * 0.25, armL: 0.9 + Math.sin(t * 5) * 0.4, look: 0.2, seed: 2 });
    const [hx, hy] = m.handR;
    K.banana(ctx, hx - 10, hy - 4, { rot: -2.2, s: 0.5, peeled: true, bite: (lt * 1.4) % 1 });
    for (let k = 0; k < 4; k++) {
      const st = W('makan', 'makan') + k * 0.4, u = (t - st) / 1.0;
      if (u < 0) continue;
      const px = lerp(hx, 400 + k * 40, Math.min(1, u)), py = lerp(hy, 1160, Math.min(1, ease.inQuad(u))) - Math.sin(Math.min(1, u) * Math.PI) * 80;
      K.peel(ctx, px, py, { rot: u < 1 ? u * 9 + k : 0.3 * (k - 2), s: 0.45 });
    }
  }
  K.contactShadow(ctx, 410, 1312, 300, 0.4);
  K.turtle(ctx, { x: 400, y: 1312, s: 0.78, t, face: 1, look: 0.4, mood: eat > 0.5 ? 'flat' : 'o', brows: eat > 0.5 ? 'sad' : 'up', neck: 0.4 });
  if (t > W('makan', 'makan') + 1.0) K.peel(ctx, 400 + 0.78 * 210, 1312 - 0.78 * 222, { rot: -0.2, s: 0.42 });
});

// 5. Quietly, slyly, the turtle plants felt thorns around the trunk while the fat monkey dozes.
shot('duri', 'aduh', (t, a, b) => {
  const lt = t - a;
  const c = { x: 600, y: 1030, z: 1.26 + 0.06 * clamp(lt / 3) };
  world(t, c);
  K.mound(ctx, TREE_X, 1250, { s: 1.1 });
  const T = K.bananaTree(ctx, TREE_X, TREE_Y, { s: 0.98, grow: 1, t, bunch: 0.08 });
  K.monkey(ctx, { x: T.top[0] - 40, y: T.top[1] + 60, s: 0.55, t, sit: 1, belly: 1.38, eyes: 'closed', mood: 'smile', armR: 0.6, armL: 0.6, wob: 0.4 });
  const dw = W('duri', 'duri');
  THORNS.forEach(([x, y, r], k) => { const pp = prog(t, dw - 0.55 + k * 0.2, dw - 0.25 + k * 0.2, ease.outBack); if (pp > 0) K.thorns(ctx, x, y, { s: 0.85 * pp, rot: r, seed: k }); });
  const tx = lerp(300, 370, clamp(lt / 2.5)) + Math.sin(t * 3) * 18;
  K.contactShadow(ctx, tx, 1330, 300, 0.4);
  K.turtle(ctx, { x: tx, y: 1330, s: 0.8, t, face: 1, look: -0.5, walk: 7, mood: 'sly', brows: 'sly' });
  for (let k = 0; k < 3; k++) { const z = (t * 0.7 + k * 0.33) % 1; K.patch(ctx, 'z', T.top[0] + 40 + z * 70, T.top[1] - 60 - z * 120, { size: 40 + k * 6, fill: K.PAL.cream, ink: K.PAL.ink, stitch: K.PAL.red, s: 0.8, alpha: (1 - z) * 0.9 }); }
  K.cam(ctx, c, 1);
  K.patch(ctx, 'duri', 900, 1180, { size: 40, fill: K.PAL.cream, ink: K.PAL.ink, stitch: K.PAL.red, s: ease.outBack(env(t, dw, b + 0.3, 0.3, 0.1)), rot: 0.08 });
});

// 6. He jumps down... onto the thorns. ADUH! Stars, a burst, and the moral.
shot('aduh', null, (t, a, b) => {
  const jumpT = W('aduh', 'melompat'), land = W('aduh', 'aduh') - 0.05;
  const fall = clamp((t - jumpT) / (land - jumpT));
  const topY = 700, groundY = 1270;
  let my, hop = 0, mood = 'grin', eyes = 'button', brows = null, sq = 0, armUp = 0.6;
  if (t < jumpT) { my = topY; mood = 'smile'; }
  else if (t < land) { my = lerp(topY, groundY, ease.inQuad(fall)) - Math.sin(fall * Math.PI) * 140; armUp = 2.7; }
  else { const u = t - land; my = groundY; hop = Math.max(0, Math.sin(Math.min(Math.PI, u * 3.4))) * 320 * (u < 0.93 ? 1 : 0); mood = 'ouch'; eyes = u > 0.12 ? 'x' : 'wide'; brows = 'sad'; sq = u < 0.12 ? 0.4 : 0; armUp = 2.9; }
  const shk = t > land && t < land + 0.45 ? 14 * (1 - (t - land) / 0.45) : 0;
  const end = C.aduh.end;
  const out = prog(t, end - 0.4, end + 1.0, ease.inOutSine);
  const c = { x: 600 + noise.n2(t * 40, 1) * shk, y: lerp(clamp(my - 240, 820, 1040), 1000, out) + noise.n2(t * 40, 4) * shk, z: lerp(1.18, 1.1, out) };
  world(t, c);
  K.mound(ctx, TREE_X, 1250, { s: 1.1 });
  K.bananaTree(ctx, TREE_X, TREE_Y, { s: 0.98, grow: 1, t, bunch: 0.08 });
  const mx = lerp(600, 640, fall);
  if (t > land) K.contactShadow(ctx, mx, 1292, 300, 0.45);
  K.monkey(ctx, { x: mx, y: my + 20, s: 0.62, t, belly: 1.38, hop, mood, eyes, brows, squash: sq, armL: armUp, armR: armUp, legL: t > land ? -0.6 : 0, legR: t > land ? 0.6 : 0, tilt: t < land && t > jumpT ? Math.sin(fall * 6) * 0.2 : 0 });
  THORNS.forEach(([x, y, r], k) => K.thorns(ctx, x, y, { s: 0.85, rot: r, seed: k }));
  if (t > land + 0.25) for (let k = 0; k < 4; k++) { const ang = t * 4 + k * Math.PI / 2; K.star(ctx, mx + Math.cos(ang) * 120, my - 330 - hop * 0.62 + Math.sin(ang) * 30, 0.42, { rot: ang }); }
  // the turtle peeks in from the right, trying not to laugh
  const pk = prog(t, land + 0.4, land + 1.0, ease.outBack);
  K.turtle(ctx, { x: lerp(1300, 930, pk), y: 1330, s: 0.7, t, face: -1, look: -0.5, mood: 'grin', eyes: 'happy' });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const bp = prog(t, land - 0.05, land + 0.3, ease.outBack);
  K.patch(ctx, 'ADUH!', 540, 330, { size: 124, fill: K.PAL.red, ink: K.PAL.white, shape: 'burst', s: bp * (1 + 0.04 * Math.sin(t * 20)), rot: -0.08 });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id, s.next);
  ctx.save();
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (since < 0.16 && s.id !== 'hook') { fx.fillStyle = `rgba(255,246,228,${0.35 * (1 - since / 0.16)})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(fx, { strength: 0.32, inner: 0.5, color: '60,35,20' });
  AM.lib.grain(fx, t, { amount: 0.035, fps: 12 });
}
