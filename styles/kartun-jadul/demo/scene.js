// Kartun Jadul demo: "Kancil Mencuri Timun" — 20 s, rubber-hose B/W, on twos.
import * as K from '/styles/kartun-jadul/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'typewriter', anim: 'fade', y: 1500, size: 58, box: { fill: 'rgba(236,230,214,.95)', pad: 18, radius: 2, border: '#141210', borderW: 4 } } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('slide_whistle', 0.85, { gain: 0.35, pitch: 1.2 });
  AM.sfx('boing', W('hook', 'kancil'), { gain: 0.4 });
  AM.sfx('pop', W('hook', 'timun'), { gain: 0.4 });
  AM.sfx('boing', W('hook', 'petani'), { gain: 0.4, pitch: 0.7 });
  if (C.makan) AM.sfx('pop', C.makan.start + 0.2, { gain: 0.35 });
  AM.sfx('impact', W('lengket', 'Plak'), { gain: 0.55 });
  AM.sfx('squish', W('lengket', 'Plak') + 0.2, { gain: 0.45 });
  AM.sfx('slide_whistle', W('bohong', 'dinikahkan'), { gain: 0.3, pitch: 1.4 });
  AM.sfx('thud', W('kabur', 'masuk'), { gain: 0.45 });
  AM.sfx('whoosh', W('kabur', 'kabur') - 0.05, { gain: 0.55, pitch: 1.3 });
  AM.sfx('bell_temple', C.pesan.end + 0.15, { gain: 0.3 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
function camera(t, z = 1, cx = 540, cy = 960) {
  const [wx, wy] = K.weave(t, 3);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540 + wx, 960 + wy); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
const blinkAt = (t, seed = 0) => { const p = (t + seed) % 2.7; return p < 0.12 ? 1 : 0; };
const pop = (t, at, d = 0.35) => ease.outBack(clamp((t - at) / d), 2.6);

// 1. Title card, iris opens on the garden: Kancil, the cucumbers, and the fuming farmer pop in on the beat.
shot('hook', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(t, 1.22 + 0.05 * p, 540, 1090);
  K.sky(ctx, t, { night: false });
  K.kebun(ctx, t, { y: 1320, night: false });
  K.rumah(ctx, 900, 1180, 0.6, { t, night: false });
  const kk = pop(t, W('hook', 'kancil') - 0.1), tk = pop(t, W('hook', 'timun') - 0.1), pk = pop(t, W('hook', 'petani') - 0.1);
  if (tk > 0) for (let i = 0; i < 4; i++) K.timun(ctx, 300 + i * 110, 1420 + (i % 2) * 30, 0.75 * tk, { t, phase: i * 0.25, rot: (i - 1.5) * 0.15 });
  if (kk > 0) K.critter(ctx, 'kancil', 190, 1330, 0.95 * kk, { t, armR: [90, -260 + Math.sin(t * 12) * 30, 'open'], armL: [-80, -40, 'open'], mouth: 0.4, look: [0.6, 0], blink: blinkAt(t) });
  if (pk > 0) K.tani(ctx, 860, 1360, 0.9 * pk, { t, angry: clamp((t - W('hook', 'habis')) / 0.6), steam: clamp((t - W('hook', 'habis')) / 0.4), look: [-0.7, 0], armL: [-150, -240, 'fist'], armR: [170, -240 + Math.sin(t * 20) * 20, 'fist'], mouth: 0.3 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // opening title card, then iris in
  const card = 1 - clamp((t - 0.9) / 0.15);
  if (card > 0) K.titleCard(ctx, t, 'KANCIL', 'MENCURI TIMUN', { alpha: 1 });
  const ir = ease.inOutCubic(clamp((t - 0.95) / 0.6));
  if (ir < 1 && card <= 0) K.iris(ctx, 540, 1100, lerp(0, 1300, ir));
});

// (optional) eating: counting cucumbers, belly swelling
shot('makan', (t, a, b) => {
  camera(t, 1.15, 540, 1050);
  K.sky(ctx, t, { night: true });
  K.kebun(ctx, t, { y: 1320, night: true });
  const n = (C.makan ? [W('makan', 'Satu'), W('makan', 'dua'), W('makan', 'tiga')] : []).filter((x) => t >= x).length;
  for (let i = n; i < 4; i++) K.timun(ctx, 640 + i * 110, 1430, 0.8, { t, phase: i * 0.3, scared: 1 });
  K.critter(ctx, 'kancil', 400, 1340, 1.05, { t, sq: -0.06 * n, mouth: 0.5 + 0.4 * Math.sin(t * 18), armR: [110, -150, 'open'], look: [0.5, 0] });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (n) { ctx.font = "400 220px 'Abril Fatface'"; ctx.textAlign = 'center'; ctx.fillStyle = '#fbf8ef'; ctx.strokeStyle = '#141210'; ctx.lineWidth = 12; ctx.strokeText(String(n), 540, 420); ctx.fillText(String(n), 540, 420); }
});

// 2. The sticky scarecrow: PLAK! Kancil's punch sticks, he yanks — the rubber arm stretches.
shot('lengket', (t, a, b) => {
  const lt = t - a, p = (t - a) / (b - a);
  const plak = W('lengket', 'Plak');
  const hit = t >= plak;
  const pull = hit ? clamp((t - plak - 0.15) / 1.2) : 0;
  const shake = hit && t - plak < 0.25 ? Math.sin(t * 90) * 10 : 0;
  camera(t, lerp(1.2, 1.38, ease.inOutSine(clamp(p * 1.4))), 560 + shake, 1110);
  K.sky(ctx, t, { night: true, moonX: 820, moonY: 330 });
  K.kebun(ctx, t, { y: 1320, night: true });
  // Pak Tani plants the scarecrow, then ducks away
  const plant = ease.outBounce(clamp((lt - 0.05) / 0.6));
  K.scarecrow(ctx, 700, lerp(900, 1330, plant), 1.0, { t, wobble: hit ? Math.exp(-(t - plak) * 4) * 3 : 0 });
  const taniOut = clamp((t - (plak - 0.8)) / 0.5);
  if (taniOut < 1) K.tani(ctx, lerp(930, 1300, ease.inBack(taniOut)), 1360, 0.8, { t, look: [-0.8, 0], mouth: 0.4, armL: [-170, -380, 'point'], walk: taniOut > 0 ? t * 2 : -1, face: taniOut > 0 ? 1 : -1 });
  // Kancil: wind-up, punch, stuck
  const wind = !hit ? clamp((t - (plak - 0.6)) / 0.5) : 1;
  const kx = hit ? 430 - ease.outCubic(pull) * 170 : lerp(300, 380, wind);
  const fistX = hit ? 640 : lerp(kx + 90, kx - 40, wind);
  const armR = [fistX - kx, -150 - (hit ? 10 : wind * 40), 'fist'];
  K.critter(ctx, 'kancil', kx, 1340, 1.0, { t, armR, armL: hit && pull > 0.5 ? [0, 0] : [-60, -60, 'open'], mouth: hit ? 0.7 : 0.2, look: hit ? [-0.6, -0.3] : [0.7, 0], lean: hit ? -0.25 * pull : 0.15 * wind, sq: hit ? -0.05 : 0.08 * wind, sweat: hit && pull > 0.3 });
  if (hit) K.burst(ctx, 'PLAK!', 720, 800, { size: 110, k: clamp((t - plak) / 0.25), alpha: 1 - clamp((t - plak - 0.9) / 0.3), t });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (hit && W('lengket', 'lengket') <= t) { ctx.font = "400 120px 'Rye'"; ctx.textAlign = 'center'; ctx.lineWidth = 12; ctx.strokeStyle = '#141210'; ctx.fillStyle = '#fbf8ef'; const s = 1 + Math.sin(t * 20) * 0.04; ctx.save(); ctx.translate(540, 360); ctx.scale(s, s); ctx.strokeText('LENGKET!', 0, 0); ctx.fillText('LENGKET!', 0, 0); ctx.restore(); }
});

// 3. In the chicken cage Kancil spins a tale to Belang: "I'm getting married — take my place!"
shot('bohong', (t, a, b) => {
  const p = (t - a) / (b - a);
  camera(t, 1.45 + 0.06 * p, 560, 1150);
  K.sky(ctx, t, { night: true, moonX: 200, moonY: 330 });
  K.kebun(ctx, t, { y: 1320, night: true });
  K.cage(ctx, 330, 1380, 0.9, { t });
  K.critter(ctx, 'kancil', 300, 1360, 0.75, { t, mouth: 0.25 + 0.45 * Math.abs(Math.sin(t * 9)), armR: [100, -250 + Math.sin(t * 6) * 20, 'point'], armL: [-80, -120, 'open'], look: [0.8, -0.1], blink: blinkAt(t, 1) });
  K.cageFront(ctx, 330, 1380, 0.9, { t });
  const nik = W('bohong', 'dinikahkan'), gnt = W('bohong', 'gantikan');
  const keen = clamp((t - nik) / 0.6);
  K.critter(ctx, 'belang', 820, 1360, 0.95, { t, face: -1, look: [0.6 * (1 - keen), -0.2], ears: 0.3 - keen * 0.3, mouth: keen * 0.4, tongue: keen > 0.5, sq: Math.sin(t * 14) * 0.04 * keen, armR: keen > 0.5 ? [80, -250, 'open'] : [60, -40, 'open'], bounce: 1 + keen });
  // wedding daydream bubble: a ring + veil
  const bk = clamp((t - nik + 0.1) / 0.3);
  if (bk > 0) {
    K.bubble(ctx, 'MAU DINIKAHKAN!', 470, 640, { w: 640, h: 230, k: bk, tail: [-120, 270], size: 58 });
  }
  if (t >= gnt - 0.1) {
    ctx.save(); ctx.translate(820, 880); const hb = 1 + 0.15 * K.beat(t).b; ctx.scale(hb, hb);
    ctx.fillStyle = '#fbf8ef'; ctx.strokeStyle = '#141210'; ctx.lineWidth = 7;
    const hp = new Path2D(); hp.moveTo(0, 30); hp.bezierCurveTo(-70, -20, -40, -80, 0, -45); hp.bezierCurveTo(40, -80, 70, -20, 0, 30); ctx.fill(hp); ctx.stroke(hp);
    ctx.restore();
  }
});

// 4. Belang climbs in, the door slams; Kancil rockets off in a smear and a dust cloud.
shot('kabur', (t, a, b) => {
  const masuk = W('kabur', 'masuk'), kab = W('kabur', 'kabur');
  const inK = clamp((t - (masuk - 0.4)) / 0.5);
  const run = clamp((t - kab + 0.05) / 0.5);
  camera(t, 1.45, 600, 1150);
  K.sky(ctx, t, { night: true, moonX: 200, moonY: 330 });
  K.kebun(ctx, t, { y: 1320, night: true });
  K.cage(ctx, 420, 1380, 0.9, { t });
  K.critter(ctx, 'belang', lerp(760, 470, ease.inOutCubic(inK)), 1360, 0.9, { t, face: -1, look: inK >= 1 ? [0.2, -0.3] : [-0.3, 0], mouth: inK >= 1 ? 0.2 : 0.4, tongue: inK < 1, ears: run > 0 ? 0.5 : 0, walk: inK > 0 && inK < 1 ? t * 2.5 : -1 });
  const door = inK >= 1 ? 0 : 1 - clamp((t - (a + 0.1)) / 0.3) * 0;
  K.cageFront(ctx, 420, 1380, 0.9, { t, door: inK >= 1 ? 0 : 1 });
  // Kancil: latches the door, then zip!
  if (run <= 0) {
    K.critter(ctx, 'kancil', 700, 1360, 0.8, { t, armL: [-90, -170, 'open'], armR: [60, -320, 'open'], wink: inK >= 1 ? 1 : 0, mouth: 0.1, smile: 1, look: [-0.6, 0] });
  } else {
    const x = lerp(700, 1500, ease.inQuad(run));
    if (run < 0.6) K.critter(ctx, 'kancil', x, 1360, 0.8, { t, sq: 0.3, lean: 0.4, walk: t * 8, armL: [-120, -120, 'fist'], armR: [120, -140, 'fist'] });
    K.smear(ctx, x - 40, 1230, 600 * run, { dir: 1, t, h: 260 });
    K.dust(ctx, 700, 1330, run, 1.1);
    K.burst(ctx, 'ZOOM!', 820, 860, { size: 100, k: clamp(run * 3), alpha: 1 - clamp((t - kab - 1.2) / 0.3), t });
  }
});

// 5. Moral; Kancil (with a stolen cucumber) winks — iris out to TAMAT.
shot('pesan', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  camera(t, 1.4, 560, 1130);
  K.sky(ctx, t, { night: false });
  K.kebun(ctx, t, { y: 1320, night: false });
  K.critter(ctx, 'kancil', 540, 1360, 1.1, { t, armR: [100, -230, 'open'], armL: [-110, -150, 'point'], wink: t > W('pesan', 'mencuri') ? 1 : 0, mouth: 0.15, smile: 1, look: [0, 0] });
  K.timun(ctx, 670, 1100, 0.6, { t, rot: 0.6, scared: 1 });
  const end = C.pesan.end + 0.1;
  const ir = ease.inOutCubic(clamp((t - end) / 0.8));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (ir > 0) K.iris(ctx, 600, 860, lerp(1300, 150, ir));
  if (ir >= 1) {
    const k = clamp((t - end - 0.8) / 0.4);
    K.iris(ctx, 600, 860, lerp(150, 0, k));
    ctx.save(); ctx.globalAlpha = k; ctx.font = "400 150px 'Abril Fatface'"; ctx.textAlign = 'center'; ctx.fillStyle = '#ece6d6'; ctx.letterSpacing = '10px'; ctx.fillText('TAMAT', 540, 920); ctx.restore();
  }
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (since < 0.1 && s.id !== 'hook') { fx.fillStyle = 'rgba(250,246,235,0.35)'; fx.fillRect(0, 0, AM.W, AM.H); }
  K.film(fx, t);
  AM.lib.vignette(fx, { strength: 0.75, inner: 0.35, color: '12,10,8' });
  AM.lib.grain(fx, t, { amount: 0.11, fps: 24 });
}
