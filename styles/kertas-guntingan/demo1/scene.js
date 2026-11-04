// Kertas Guntingan demo: "Legenda Danau Toba" — 8 shots (20 s) of a layered cut-paper diorama, timed to the narration.
import * as K from '/styles/kertas-guntingan/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', anim: 'rise', y: 1460, size: 64, maxWords: 4, box: { fill: 'rgba(251,246,234,.95)', pad: 18, radius: 6, border: '#2b2523', borderW: 3 } } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = ctx; // single layer: every extra full-screen canvas costs a composite at capture
  for (const l of AM.timeline.lines) C[l.id] = l;
  // pre-build the heavy paper pieces once (so the first frames are not slow)
  K.rumahBolon(1); K.fishParts(); K.sunPiece(110); K.fieldPiece(true);
  // sound: 8 cues on real moments
  AM.sfx('paper', 0.02, { gain: 0.5 });
  AM.sfx('rain', 0.5, { gain: 0.3 });
  AM.sfx('whoosh', W('hook', 'menenggelamkan') - 0.1, { gain: 0.4, pitch: 0.8 });
  AM.sfx('swoosh_up', W('ikan', 'menangkap') + 0.1, { gain: 0.4 });
  AM.sfx('magic', W('ikan', 'berubah') - 0.05, { gain: 0.4 });
  AM.sfx('drum_hit', W('marah', 'Dasar') - 0.04, { gain: 0.55 });
  AM.sfx('thunder', W('danau', 'pecah') - 0.2, { gain: 0.6 });
  AM.sfx('chime', W('moral', 'dijaga'), { gain: 0.32 });
}

// ---------- helpers ----------
// shots are keyed by START TIME (a line can hold two pictures); a shot runs until the next one starts
const SHOTS = [];
const shot = (id, at, fn) => SHOTS.push({ id, at, fn });
const shake = (t, a) => ({ sx: noise.n2(t * 20, 1) * a, sy: noise.n2(t * 20, 5) * a });

// valley walls (world coords, built once)
const wallL = () => K.piece('wallL', () => [{ pts: [[-500, 560], [-200, 600], [60, 700], [260, 880], [420, 1060], [520, 1200], [560, 1270], [-500, 1270]], fill: P.hill3, edge: 'torn', seed: 3, amp: 4, step: 10, detail: grassTufts(P.moss) }]);
const wallR = () => K.piece('wallR', () => [{ pts: [[1580, 600], [1240, 640], [1000, 760], [820, 930], [700, 1100], [620, 1250], [600, 1270], [1580, 1270]], fill: P.hill2, edge: 'torn', seed: 4, amp: 4, step: 10, detail: grassTufts(P.moss) }]);
const farRange = () => K.piece('farRange', () => [{ pts: K.ridgePts(-500, 1600, 640, 1000, { amp: 90, freq: 0.004, seed: 5, peaks: 2 }), fill: P.far1, edge: 'torn', seed: 5, amp: 3.5, step: 10 }], { res: 0.6 });
const farRange2 = () => K.piece('farRange2', () => [{ pts: K.ridgePts(-500, 1600, 760, 1000, { amp: 60, freq: 0.006, seed: 6 }), fill: P.far2, edge: 'torn', seed: 6, amp: 3.5, step: 10 }], { res: 0.6 });
const floor = (col = P.sage) => K.piece('floor' + col, () => [{ pts: K.ridgePts(-300, 1400, 1210, 1440, { amp: 18, freq: 0.01, seed: 7 }), fill: col, edge: 'torn', seed: 7, amp: 3, step: 10, detail: grassTufts(P.grass) }]);
const front = (col = P.moss) => K.piece('front' + col, () => [{ pts: K.ridgePts(-300, 1400, 1370, 2000, { amp: 30, freq: 0.012, seed: 8 }), fill: col, edge: 'torn', seed: 8, amp: 3.5, step: 10, detail: grassTufts(P.forest) }]);
const hillock = () => K.piece('hillock', () => [{ pts: [[-260, 0], [-200, -90], [-120, -190], [-30, -250], [60, -240], [150, -170], [220, -80], [270, 0]], fill: P.hill1, edge: 'torn', seed: 9, amp: 3.5, detail: grassTufts(P.grass) }]);
function grassTufts(col) {
  return (g) => { const r = AM.lib.mulberry32(5); g.fillStyle = col; for (let i = 0; i < 160; i++) { const x = -600 + r() * 2300, y = 400 + r() * 1700; g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x - 2, y - 14 - r() * 10); g.lineTo(x + 2, y); g.lineTo(x + 7, y - 12 - r() * 8); g.lineTo(x + 10, y); g.fill(); } };
}
/** The Toba valley, a multi-plane set. o: {sky:[top,bot], sun, flood (0..1 water level), houseY, extras(fn at stage depth), enter (slide-in time)} */
function valley(t, Cm, o = {}) {
  const e = o.enter != null ? K.slideIn(t, o.enter, 0.75) : 1;
  K.view(ctx, Cm, 0.15); K.sky(ctx, ...(o.sky || [P.skyHi, P.sky]));
  if (o.sun !== false) { K.view(ctx, Cm, 0.25); K.draw(ctx, K.sunPiece(110, o.sunCol || P.sun), o.sunX ?? 780, (o.sunY ?? 430) + (1 - e) * 300, { rot: t * 0.12, lift: 2 }); }
  K.view(ctx, Cm, 0.3);
  for (let i = 0; i < 3; i++) K.draw(ctx, K.cloudPiece(i + 1, 260 + i * 60, o.cloudCol || P.cloud), ((i * 430 + t * (14 + i * 6)) % 1700) - 300, 300 + i * 110, { lift: 2.2 });
  K.view(ctx, Cm, 0.45); K.draw(ctx, farRange(), 0, (1 - e) * 220, { lift: 2 });
  K.view(ctx, Cm, 0.6); K.draw(ctx, farRange2(), 0, (1 - e) * 260, { lift: 2 });
  K.view(ctx, Cm, 0.8);
  K.draw(ctx, wallL(), -(1 - e) * 500, 0, { lift: 2.4 });
  K.draw(ctx, wallR(), (1 - e) * 500, 0, { lift: 2.4 });
  for (const [x, y, h, s] of [[90, 760, 220, 11], [180, 850, 200, 12], [960, 880, 210, 13], [1060, 800, 230, 14], [40, 680, 190, 15]]) K.draw(ctx, K.pineTree(s, h), x, y + (1 - e) * 400, { lift: 1.6 });
  K.view(ctx, Cm, 1);
  K.draw(ctx, floor(o.floorCol), 0, (1 - e) * 300, { lift: 2 });
  if (o.hillock !== false) K.draw(ctx, hillock(), o.hillX ?? 300, 1250 + (1 - e) * 400, { lift: 2.2 });
  if (o.house !== false) K.draw(ctx, K.rumahBolon(0.62), o.houseX ?? 760, (o.houseY ?? 1250) + (1 - e) * 500, { lift: 2.5 });
  if (o.extras) o.extras(e);
  if (o.flood) floodWater(t, o.flood);
  if (o.front !== false) { K.view(ctx, Cm, 1.25); K.draw(ctx, front(o.frontCol), 0, (1 - e) * 300 + (o.frontY || 0), { lift: 3 }); ferns(t, e); }
}
function ferns(t, e = 1) {
  for (const [x, y, h, sd] of [[-40, 1420, 260, 1], [90, 1440, 200, 2], [1010, 1410, 280, 3], [1120, 1450, 210, 4]]) K.draw(ctx, K.fern(sd, h), x, y + (1 - e) * 300, { rot: Math.sin(t * 1.6 + sd) * 0.05, lift: 3 });
}
function floodWater(t, lv) { // lv 0..1: water rises from below the valley floor to above the house roofs
  const y = lerp(1500, 860, lv);
  K.water(ctx, t, 540, y, { n: 4, gap: 54, amp: 9 });
}
function chopTo(t, a, dur = 0.5) { return 1 - ease.outCubic(clamp((t - a) / dur)); }

// ---------- shots ----------
// 1. Hook: the forbidden sentence, then the valley floods into a giant lake; the title drops in letter by letter.
shot('hook', () => 0, (t, a, b) => {
  const p = (t - a) / (b - a);
  const sink = W('hook', 'menenggelamkan');
  const flood = 0.3 + 0.7 * ease.inOutCubic(clamp((t - sink + 0.3) / 2.2));
  const Cm = { x: 540, y: 980 - flood * 40, z: 1.06 - 0.06 * p, ...shake(t, 4 * flood * (1 - flood) * 4) };
  const stormy = 0.35 + 0.65 * clamp((t - 0.6) / 1.2);
  valley(t, Cm, {
    enter: -0.35, sky: [AM.lib.mixHex(P.skyHi, P.stormHi, stormy), AM.lib.mixHex(P.sky, P.storm, stormy)], sunCol: P.sun, sunY: 430 + stormy * 300, cloudCol: AM.lib.mixHex(P.cloud, P.stormHi, stormy),
    flood: flood * 0.92,
    extras: () => {
      // the forbidden sentence: a tiny red bubble pops out of the house before the water comes
      const bub = env(t, -0.2, sink + 0.4, 0.2, 0.25);
      if (bub > 0) { ctx.save(); ctx.translate(860, 820); ctx.scale(0.6 * bub, 0.6 * bub); K.shoutBubble(ctx, '!!!', 0, 0, t, -0.3, { size: 120, w: 420, h: 230, tail: [-120, 170] }); ctx.restore(); }
    },
  });
  K.view(ctx, { x: 540, y: 960, z: 1 }, 1);
  K.rain(ctx, t, { amt: stormy * (1 - clamp((t - W('hook', 'danau')) / 0.8)) });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tt = W('hook', 'danau') - 0.15;
  K.cutTitle(ctx, 'DANAU', 540, 330, t, tt, { size: 150 });
  K.cutTitle(ctx, 'TOBA', 540, 500, t, tt + 0.3, { size: 170, cols: [P.gold, P.red, P.gold, P.red] });
  K.tag(ctx, 'legenda dari tanah Batak', 540, 640, { size: 46, alpha: prog(t, tt + 0.7, tt + 1.0), rot: 0.02 });
});


// 3. At dusk Toba fishes at the river; a golden fish leaps on the line.
shot('ikan', () => C.ikan.start - 0.12, (t, a, b) => {
  const p = (t - a) / (b - a);
  const bite = W('ikan', 'menangkap');
  const Cm = { x: 560, y: 1000 - 30 * p, z: 1.18 + 0.05 * p };
  const e = K.slideIn(t, a, 0.7);
  K.view(ctx, Cm, 0.15); K.sky(ctx, '#f6d6a4', P.dusk);
  K.view(ctx, Cm, 0.25); K.draw(ctx, K.sunPiece(130, '#f39a3c'), 760, 760 + (1 - e) * 200, { rot: t * 0.1, lift: 2 });
  K.view(ctx, Cm, 0.45); K.draw(ctx, farRange(), 0, 60 + (1 - e) * 220, { lift: 2 });
  K.view(ctx, Cm, 0.8); K.draw(ctx, K.pineTree(31, 260), 120, 1050 + (1 - e) * 300, { lift: 1.6 }); K.draw(ctx, K.palmTree(4, 400), 980, 1090 + (1 - e) * 300, { lift: 1.6 });
  K.view(ctx, Cm, 1);
  K.water(ctx, t, 540, 1080, { n: 4, gap: 56, cols: [P.waterHi, '#6aa4bf', P.water, P.waterDk] });
  // bank and rock where Toba stands
  K.draw(ctx, K.piece('bank', [{ pts: [[-500, 1190], [100, 1170], [330, 1200], [420, 1260], [470, 1400], [-500, 1400]], fill: P.earthDk, edge: 'torn', seed: 33, amp: 3.5 }, { pts: [[-500, 1240], [160, 1230], [380, 1270], [420, 1400], [-500, 1400]], fill: P.moss, edge: 'torn', seed: 34, amp: 3 }]), -(1 - e) * 600, 0, { lift: 2 });
  const tug = clamp((t - bite) / 0.5);
  const r = K.puppet(ctx, 'toba', { x: 230 - (1 - e) * 600, y: 1290, s: 0.95, P: K.pose({ lean: -0.05 - tug * 0.12, upF: 1.3 + tug * 0.5, foF: 0.5, upB: 1.15 + tug * 0.4, foB: 0.6, thF: 0.3, snF: 0.2, thB: -0.15, head: -0.1 - tug * 0.15, face: { mouth: tug > 0.3 ? 'open' : 'n', brow: tug > 0.3 ? -0.5 : 0 } }) });
  const rm = K.prop(ctx, r.handF, K.PROPS.rod(), { rot: 2.2 + tug * 0.35 + Math.sin(t * 9) * 0.04 * tug, lift: 1.4 });
  const [tipX, tipY] = K.pt(rm, 0, -340, ctx);
  // the fish: under water until the bite, then leaps in an arc, flapping
  const jump = clamp((t - bite - 0.1) / 0.85);
  const fx0 = 690, fy0 = 1180;
  let fxx = fx0, fyy = fy0 + 60;
  if (jump > 0) { fxx = lerp(fx0, 560, jump); fyy = fy0 - Math.sin(jump * Math.PI) * 420 - jump * 120 + 60 * (1 - jump) * 0; }
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.quadraticCurveTo((tipX + fxx) / 2, Math.max(tipY, fyy) + 60 * (1 - tug), fxx + 60, fyy); ctx.stroke(); ctx.restore();
  if (jump > 0) {
    K.fish(ctx, fxx, fyy, { s: 0.75, rot: -0.6 + jump * 1.4, flap: t * 18, flip: -1, lift: 3 });
    // splash slivers
    for (let i = 0; i < 7; i++) { const u = clamp((t - bite - 0.1) / 0.6); if (u <= 0 || u >= 1) continue; K.draw(ctx, K.piece('drop', [{ pts: K.ellipsePts(0, 0, 8, 14, 12), fill: P.waterHi, edge: 'cut' }]), fx0 + Math.cos(i * 0.9 + 0.3) * 120 * u - 60, fy0 - Math.sin(i * 0.45 + 0.4) * 200 * u + u * u * 160, { lift: 1.5, alpha: 1 - u }); }
  } else K.draw(ctx, K.piece('ripple', [{ pts: K.ellipsePts(0, 0, 60, 12, 24), fill: P.waterHi, edge: 'torn', seed: 2 }]), fx0 + 60, fy0 + 10, { s: 1 + Math.sin(t * 6) * 0.15, lift: 0.6 });
  K.view(ctx, Cm, 1.25); K.water(ctx, t + 3, 540, 1360, { n: 2, gap: 60, cols: [P.water, P.waterDk], lift: 2.5 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cutTitle(ctx, 'TOBA', 540, 300, t, W('ikan', 'Toba') - 0.1, { size: 140, cols: [P.red, P.ink, P.red, P.ink] });
  K.tag(ctx, 'petani Batak', 540, 440, { size: 46, rot: -0.03, alpha: prog(t, W('ikan', 'Toba'), W('ikan', 'Toba') + 0.25), tape: '#9fc5a5' });
  K.tag(ctx, 'ikan emas', 700, 560, { size: 60, rot: 0.05, alpha: prog(t, W('ikan', 'emas') - 0.15, W('ikan', 'emas') + 0.2), tape: '#f2c76b' });
});

// 4. In the house the fish flips like a card and a princess unfolds out of it, in a burst of gold paper.
shot('putri', () => W('ikan', 'berubah') - 0.4, (t, a, b) => {
  const p = (t - a) / (b - a);
  const tr = W('ikan', 'berubah');
  const f = clamp((t - tr) / 0.9);
  const Cm = { x: 540, y: 1020, z: 1.25 + 0.08 * p };
  const e = K.slideIn(t, a, 0.6);
  // interior: woven wall, wooden floor
  K.view(ctx, Cm, 0.3);
  ctx.fillStyle = '#7a5032'; ctx.fillRect(-400, -200, 2000, 2400);
  K.draw(ctx, K.piece('wallweave', [{ pts: K.rectPts(-300, 300, 1700, 1100), fill: '#c99a5e', edge: 'torn', seed: 40, detail: (g) => { for (let y = 300, row = 0; y < 1400; y += 30, row++) for (let x = -300, k = 0; x < 1400; x += 30, k++) { g.fillStyle = (k + row) % 4 < 2 ? 'rgba(120,70,25,.38)' : 'rgba(255,235,190,.18)'; g.fillRect(x + (row % 2) * 15, y, 28, 28); } } }]), 0, 0, { lift: 1 });
  K.draw(ctx, K.piece('window', [{ pts: K.rectPts(-120, -150, 240, 300), fill: '#5b3a24', edge: 'cut', seed: 44 }, { pts: K.rectPts(-100, -130, 200, 260), fill: '#f6d6a4', edge: 'cut', seed: 45, lift: 1.2 }, { pts: K.ellipsePts(30, -40, 46, 46, 30), fill: '#f39a3c', edge: 'torn', seed: 46, lift: 0.6 }]), 930, 760, { lift: 1.8 });
  K.view(ctx, Cm, 0.6);
  // gorga panel on the wall
  K.draw(ctx, K.piece('gorga', [{ pts: K.rectPts(-200, -70, 400, 140), fill: P.red, edge: 'cut', seed: 41, detail: (g) => { g.strokeStyle = P.white; g.lineWidth = 6; for (let x = -160; x <= 160; x += 80) { g.beginPath(); g.arc(x, 0, 28, 0, Math.PI * 1.6); g.stroke(); g.beginPath(); g.arc(x, 0, 12, Math.PI, Math.PI * 2.6); g.stroke(); } g.fillStyle = P.ink; g.fillRect(-200, -70, 400, 14); g.fillRect(-200, 56, 400, 14); } }]), 540, 640 + (1 - e) * -300, { lift: 1.8 });
  K.view(ctx, Cm, 1);
  K.draw(ctx, K.piece('floorboards', [{ pts: K.rectPts(-400, 1250, 1900, 700), fill: '#8b5a35', edge: 'cut', seed: 42, detail: (g) => { g.fillStyle = 'rgba(40,20,5,.35)'; for (let x = -400; x < 1500; x += 120) g.fillRect(x, 1250, 5, 700); } }]), 0, (1 - e) * 200, { lift: 1.5 });
  // Toba steps back in surprise
  const sur = clamp((t - tr - 0.25) / 0.4);
  K.puppet(ctx, 'toba', { x: 250 - sur * 60, y: 1330, s: 0.95, P: K.pose({ lean: -0.12 * sur, upF: 0.3 + 1.6 * sur, foF: 0.8, upB: 0.2 + 1.2 * sur, foB: 0.6, thF: -0.2 * sur, head: -0.15 * sur, face: { mouth: sur > 0.2 ? 'open' : 'n', brow: -0.6 * sur } }) });
  // the fish in a clay bowl, then the flip
  const bowl = K.piece('bowl', [{ pts: [[-110, 0], [110, 0], [80, 90], [-80, 90]], fill: P.terracotta, edge: 'cut', seed: 43, detail: (g) => { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-120, 14, 240, 8); } }]);
  K.draw(ctx, bowl, 680, 1240, { lift: 1.6 });
  const flipK = f < 0.5 ? Math.cos(f * Math.PI) : -Math.cos(f * Math.PI);
  if (f < 0.5) {
    const hop = t < tr ? Math.abs(Math.sin(t * 7)) * 30 : 120 * f * 2;
    ctx.save(); ctx.translate(680, 1200 - hop); ctx.scale(Math.max(0.03, flipK), 1); K.fish(ctx, 0, 0, { s: 0.7, rot: -0.2 + Math.sin(t * 8) * 0.1, flap: t * 16 }); ctx.restore();
  } else {
    const up = ease.outBack(clamp((f - 0.5) / 0.5), 1.6);
    ctx.save(); ctx.translate(700, 1330); ctx.scale(Math.max(0.03, flipK), 1);
    K.puppet(ctx, 'putri', { x: 0, y: 0, s: 0.98 * (0.7 + 0.3 * up), flip: -1, P: K.pose({ upF: 0.3 + 0.4 * Math.sin(t * 2), foF: 1.2, upB: -0.1, foB: 0.4, head: 0.05, hair: Math.sin(t * 3) * 0.05, face: { mouth: 'smile' }, blink: hrand(Math.floor(t * 3), 5) < 0.1 }) });
    ctx.restore();
  }
  // golden confetti burst
  if (t > tr - 0.05) {
    const u = clamp((t - tr) / 1.6);
    for (let i = 0; i < 26; i++) {
      const ang = hrand(i, 1) * Math.PI * 2, sp = 200 + hrand(i, 2) * 380;
      const x = 690 + Math.cos(ang) * sp * ease.outCubic(u), y = 1050 + Math.sin(ang) * sp * ease.outCubic(u) * 0.8 + u * u * 300;
      K.draw(ctx, K.piece('conf' + (i % 3), [{ pts: i % 3 === 0 ? K.ellipsePts(0, 0, 10, 10, 10) : K.rectPts(-9, -6, 18, 12), fill: [P.gold, P.goldHi, P.sunDk][i % 3], edge: 'cut', seed: i % 3 }]), x, y, { rot: t * 6 + i, lift: 2.2, alpha: 1 - u * u });
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'sang putri', 700, 380, { size: 58, rot: -0.04, alpha: prog(t, W('ikan', 'putri') - 0.1, W('ikan', 'putri') + 0.25), tape: '#f2c76b' });
});

// 5. The promise: she lifts a finger, he nods; the condition is written on a torn note.
shot('janji', () => C.janji.start - 0.12, (t, a, b) => {
  const p = (t - a) / (b - a);
  const Cm = { x: 540, y: 980 - 20 * p, z: 1.3 + 0.06 * p };
  valley(t, { ...Cm, x: 560 }, { enter: a, sky: ['#fbe2c0', '#f2c08f'], sunY: 620, sunCol: '#f39a3c', hillX: 540, house: false,
    extras: () => {
      const syarat = W('janji', 'Syaratnya');
      const raise = prog(t, syarat - 0.3, syarat + 0.2, ease.outBack);
      K.puppet(ctx, 'putri', { x: 690, y: 1340, s: 1.02, flip: -1, P: K.pose({ upF: 0.2 + 2.3 * raise, foF: 0.25 + 1.6 * raise, upB: -0.1, foB: 0.5, head: -0.05 * raise, hair: Math.sin(t * 2.5) * 0.05, face: { mouth: Math.sin(t * 9) > 0 && t < C.janji.end ? 'open' : 'n', brow: 0.15 * raise }, blink: hrand(Math.floor(t * 3), 6) < 0.1 }) });
      const nod = Math.max(0, Math.sin((t - W('janji', 'jangan')) * 6)) * (t > W('janji', 'jangan') && t < W('janji', 'jangan') + 1.6 ? 1 : 0);
      K.puppet(ctx, 'toba', { x: 380, y: 1350, s: 1.04, P: K.pose({ upF: 0.8, foF: 1.5, upB: 0.6, foB: 1.4, head: 0.18 * nod, face: { mouth: 'smile' }, blink: hrand(Math.floor(t * 3), 7) < 0.1 }) });
    } });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const syarat = W('janji', 'Syaratnya');
  const nIn = K.slideIn(t, syarat - 0.15, 0.6);
  if (t > syarat - 0.15) {
    const N = K.piece('note', [{ pts: K.rectPts(-330, -150, 660, 300), fill: P.white, edge: 'torn', seed: 51, amp: 4, rim: P.cream,
      detail: (g) => { g.fillStyle = P.ink; g.textAlign = 'center'; g.font = "700 50px 'Patrick Hand'"; g.fillText('SYARAT:', 0, -70); g.font = "700 64px 'Patrick Hand'"; g.fillStyle = P.redDk; g.fillText('Jangan ungkit', 0, 10); g.fillText('asal-usulku!', 0, 88); g.strokeStyle = 'rgba(80,120,170,.35)'; g.lineWidth = 2; for (let y = -110; y < 140; y += 38) { g.beginPath(); g.moveTo(-320, y + 20); g.lineTo(320, y + 20); g.stroke(); } } }], { res: 1.2 });
    K.draw(ctx, N, 540, 360 - (1 - nIn) * 600, { rot: -0.04 + (1 - nIn) * 0.3, lift: 3 });
  }
});



// 8. Toba, hungry and furious, shouts the forbidden words.
shot('marah', () => C.marah.start - 0.12, (t, a, b) => {
  const p = (t - a) / (b - a);
  const shout = W('marah', 'Dasar');
  const sh = t > shout ? Math.exp(-(t - shout) * 2.2) : 0;
  const Cm = { x: lerp(560, 430, ease.inOutCubic(clamp((t - a) / 2.4))), y: lerp(1000, 940, p), z: lerp(1.15, 1.45, ease.inOutCubic(clamp((t - a) / 2.4))), ...shake(t, 14 * sh) };
  valley(t, Cm, { enter: a - 0.3, floorCol: P.earth, hillX: 120, houseX: 920, sky: [AM.lib.mixHex(P.skyHi, '#f2b39a', clamp((t - a) / 2)), AM.lib.mixHex(P.sky, '#d8735a', clamp((t - a) / 2))],
    extras: () => {
      K.draw(ctx, K.fieldPiece(true), 520, 1255, { lift: 1.2 });
      const ang = clamp((t - a) / 1.2);
      const fury = t > shout - 0.2 ? 1 : 0;
      K.puppet(ctx, 'toba', { x: 400, y: 1330, s: 1.0, P: K.pose({ lean: fury ? 0.12 : 0, upF: fury ? 2.3 + Math.sin(t * 20) * 0.08 : 0.9 * ang, foF: fury ? 0.3 : 1.3 * ang, upB: fury ? 0.7 : 0.5, foB: fury ? 1.5 : 1.6, head: fury ? 0.08 : 0, face: { mouth: fury ? 'shout' : 'n', brow: 0.6 + 0.6 * fury } }) });
      const cry = t > shout + 0.4;
      K.puppet(ctx, 'samosir', { x: 690, y: 1340, s: 1.0, flip: -1, P: K.pose({ upF: cry ? 2.4 : 0.6, foF: cry ? 2.2 : 0.6, upB: cry ? 2.3 : 0.2, foB: cry ? 2.1 : 0.4, head: cry ? 0.25 : 0.05, lean: cry ? 0.1 : 0, face: { mouth: cry ? 'sad' : 'n', brow: cry ? -0.8 : -0.2 } }) });
      K.draw(ctx, K.PROPS.bekal(), 780, 1335, { lift: 1.2, rot: 1.4 });
    } });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Samosir', 850, 760, { size: 52, rot: 0.05, alpha: prog(t, W('marah', 'anaknya') - 0.1, W('marah', 'anaknya') + 0.2), tape: '#b7c8e8' });
  ctx.save(); ctx.translate(560, 420);
  K.shoutBubble(ctx, 'DASAR', 0, -70, t, shout - 0.06, { size: 110, w: 860, h: 420, tail: [-200, 260] });
  if (t > W('marah', 'anak') - 0.05) K.cutTitle(ctx, 'ANAK IKAN!', 0, 70, t, W('marah', 'anak') - 0.05, { size: 100, cols: [P.white], stagger: 0.03 });
  ctx.restore();
  if (sh > 0.6) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(185,50,43,${(sh - 0.6) * 0.35})`; ctx.fillRect(0, 0, 1080, 1920); }
});


// 10. The sky breaks: storm clouds slide in, a bolt, paper rain, water bursts from the ground.
shot('hujan', () => C.danau.start - 0.12, (t, a, b) => {
  const p = (t - a) / (b - a);
  const crack = W('danau', 'pecah');
  const fl = t > crack - 0.05 ? Math.exp(-(t - crack + 0.05) * 5) : 0;
  const Cm = { x: 540, y: 960, z: 1.12 - 0.05 * p, ...shake(t, 10 * fl + 2) };
  K.view(ctx, Cm, 0.15); K.sky(ctx, P.stormHi, P.stormDk);
  K.view(ctx, Cm, 0.3);
  for (let i = 0; i < 5; i++) { const s = K.slideIn(t, a + i * 0.1, 0.6); K.draw(ctx, K.stormCloud(i + 1, 640 + (i % 3) * 80), (i % 2 ? 1500 : -420) + (i % 2 ? -1 : 1) * s * (720 + (i % 3) * 40) + Math.sin(t * 0.7 + i) * 20, 250 + i * 105, { lift: 2.8, s: 1.1 }); }
  if (fl > 0.05) K.bolt(ctx, 600, 360, 1.3, Math.min(1, fl * 2));
  K.view(ctx, Cm, 0.45); K.draw(ctx, farRange(), 0, 60, { lift: 2, alpha: 0.85 });
  K.view(ctx, Cm, 0.8); K.draw(ctx, wallL(), 0, 0, { lift: 2.4 }); K.draw(ctx, wallR(), 0, 0, { lift: 2.4 });
  K.view(ctx, Cm, 1);
  K.draw(ctx, floor(P.hill3), 0, 0, { lift: 2 });
  K.draw(ctx, hillock(), 300, 1250, { lift: 2.2 });
  K.puppet(ctx, 'samosir', { x: 300, y: 1015, s: 0.6, P: K.pose({ upF: 2.4, foF: 2.0, upB: 2.2, foB: 2.0, face: { mouth: 'sad', brow: -0.7 } }) });
  K.draw(ctx, K.rumahBolon(0.62), 820, 1250, { lift: 2.5 });
  K.puppet(ctx, 'toba', { x: 560, y: 1330, s: 0.95, flip: -1, P: K.pose({ upF: 2.5, foF: 0.4, upB: 2.2, foB: 0.6, head: -0.35, lean: -0.08, face: { mouth: 'open', brow: -0.7 } }) });
  // fountains bursting from the ground
  const burst = (a + 0.25);
  for (let i = 0; i < 4; i++) {
    const u = clamp((t - burst - i * 0.15) / 0.5);
    if (u <= 0) continue;
    const x = [180, 470, 690, 960][i], hgt = (180 + i * 30) * ease.outBack(u, 1.6) * (0.9 + 0.1 * Math.sin(t * 20 + i));
    K.draw(ctx, K.piece('jet', [{ pts: [[-30, 0], [-14, -1], [-24, -0.6], [0, -1.08], [22, -0.62], [14, -1], [30, 0]].map(([x, y]) => [x, y * 300]), fill: P.waterHi, edge: 'torn', seed: 71, amp: 3 }, { pts: [[-16, 0], [0, -280], [16, 0]], fill: P.water, edge: 'torn', seed: 72, lift: 0.8 }]), x, 1360, { sy: hgt / 300, lift: 2.2 });
  }
  K.view(ctx, Cm, 1.25); K.draw(ctx, front(P.forest), 0, 30, { lift: 3 });
  K.view(ctx, { x: 540, y: 960, z: 1 }, 1);
  K.rain(ctx, t, { amt: clamp((t - a) / 0.6) });
  if (fl > 0.02) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(255,248,210,${fl * 0.55})`; ctx.fillRect(0, 0, 1080, 1920); }
});

// 11. The valley drowns; the hill stays above water: Lake Toba and Samosir island.
shot('danau', () => W('danau', 'Lembah') - 0.15, (t, a, b) => {
  const p = (t - a) / (b - a);
  const lv = ease.inOutCubic(clamp((t - a + 0.3) / 1.5));
  const Cm = { x: 540, y: lerp(960, 900, p), z: lerp(1.1, 0.96, ease.inOutSine(p)) };
  const clear = clamp((t - a - 0.3) / 1.0);
  K.view(ctx, Cm, 0.15); K.sky(ctx, AM.lib.mixHex(P.stormHi, P.skyHi, clear), AM.lib.mixHex(P.stormDk, P.sky, clear));
  K.view(ctx, Cm, 0.25); K.draw(ctx, K.sunPiece(110), 800, lerp(760, 420, clear), { rot: t * 0.12, lift: 2, alpha: clear });
  K.view(ctx, Cm, 0.3); for (let i = 0; i < 3; i++) K.draw(ctx, K.cloudPiece(i + 1, 300, AM.lib.mixHex(P.storm, P.cloud, clear)), 120 + i * 380 + t * 10, 300 + i * 80, { lift: 2.2 });
  K.view(ctx, Cm, 0.45); K.draw(ctx, farRange(), 0, 60, { lift: 2 });
  K.view(ctx, Cm, 0.8); K.draw(ctx, wallL(), 0, 0, { lift: 2.4 }); K.draw(ctx, wallR(), 0, 0, { lift: 2.4 });
  for (const [x, y, h, s] of [[90, 760, 220, 11], [180, 850, 200, 12], [960, 880, 210, 13], [1060, 800, 230, 14]]) K.draw(ctx, K.pineTree(s, h), x, y, { lift: 1.6 });
  K.view(ctx, Cm, 1);
  K.draw(ctx, floor(P.hill3), 0, 0, { lift: 2 });
  K.draw(ctx, K.rumahBolon(0.62), 820, 1250 + lv * 40, { lift: 2.5 });
  // water rises over the floor and the house, the hillock (island) stays
  K.water(ctx, t, 540, lerp(1500, 1100, lv), { n: 3, gap: 60, amp: 8 });
  K.draw(ctx, hillock(), 300, 1250, { lift: 2.2, sy: 1 });
  K.draw(ctx, K.pineTree(91, 120), 290, 1010, { lift: 1.2 });
  K.puppet(ctx, 'samosir', { x: 350, y: 1015, s: 0.55, P: K.pose({ upF: 2.6 * clear, foF: 0.3, upB: 0.4, face: { mouth: clear > 0.5 ? 'open' : 'sad' } }) });
  K.water(ctx, t + 2, 540, lerp(1600, 1250, lv), { n: 2, gap: 70, amp: 8, cols: [P.water, P.waterDk] });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cutTitle(ctx, 'DANAU TOBA', 540, 330, t, W('danau', 'Danau') - 0.1, { size: 112, cols: [P.waterDeep, P.water] });
  K.tag(ctx, 'Pulau Samosir', 360, 860, { size: 52, rot: -0.04, alpha: prog(t, (W('danau', 'Toba') + 0.2) - 0.1, (W('danau', 'Toba') + 0.2) + 0.25), tape: '#9fc5a5' });
});


// 13. Sunset over Lake Toba; a golden fish leaps; the moral is pinned to the board.
shot('moral', () => C.moral.start - 0.12, (t, a, b) => {
  const end = C.moral.end;
  const p = clamp((t - a) / (end + 1.2 - a));
  const Cm = { x: 540, y: 960 - 30 * p, z: 1.04 + 0.08 * ease.inOutSine(p) };
  const e = K.slideIn(t, a, 0.7);
  K.view(ctx, Cm, 0.15); K.sky(ctx, '#f9d9a8', '#ee9f6c', 'sunset');
  K.view(ctx, Cm, 0.25); K.draw(ctx, K.sunPiece(150, '#f39a3c'), 540, 860 + p * 60, { rot: t * 0.08, lift: 2 });
  K.view(ctx, Cm, 0.3); for (let i = 0; i < 3; i++) K.draw(ctx, K.cloudPiece(i + 7, 280, '#fbe3c6'), 140 + i * 380 + t * 8, 380 + i * 90, { lift: 2.2 });
  K.view(ctx, Cm, 0.45); K.draw(ctx, farRange(), 0, 120 + (1 - e) * 200, { lift: 2 });
  K.view(ctx, Cm, 0.8); K.draw(ctx, wallL(), -(1 - e) * 400, 120, { lift: 2.4 }); K.draw(ctx, wallR(), (1 - e) * 400, 120, { lift: 2.4 });
  K.view(ctx, Cm, 1);
  K.water(ctx, t, 540, 1080, { n: 4, gap: 60, amp: 6, cols: ['#f6c38e', '#7fb1c6', P.water, P.waterDk] });
  // Samosir island with a little house
  K.draw(ctx, K.piece('island', [{ pts: [[-300, 0], [-230, -60], [-120, -110], [20, -130], [160, -100], [260, -50], [320, 0], [0, 30]], fill: P.hill3, edge: 'torn', seed: 91, amp: 3.5, detail: grassTufts(P.moss) }]), 600, 1150 + (1 - e) * 300, { lift: 2 });
  K.draw(ctx, K.rumahBolon(0.26), 600, 1060 + (1 - e) * 300, { lift: 1.6 });
  K.draw(ctx, K.pineTree(95, 110), 470, 1080 + (1 - e) * 300, { lift: 1.4 });
  // the golden fish leaps twice in the light
  for (const [t0, x] of [[a + 0.9, 300], [W('moral', 'dijaga') - 0.6, 820]]) {
    const u = clamp((t - t0) / 1.3);
    if (u > 0 && u < 1) K.fish(ctx, x + u * 160, 1200 - Math.sin(u * Math.PI) * 300, { s: 0.45, rot: -0.9 + u * 1.8, flap: t * 16, lift: 2.5 });
  }
  K.water(ctx, t + 2, 540, 1290, { n: 2, gap: 70, amp: 6, cols: [P.water, P.waterDk] });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const jt = W('moral', 'janji');
  K.tag(ctx, 'pesan leluhur', 540, 300, { size: 48, rot: -0.03, alpha: prog(t, a + 0.2, a + 0.45), tape: '#e7a2a2' });
  K.cutTitle(ctx, 'JAGA', 540, 450, t, jt - 0.15, { size: 140, cols: [P.redDk, P.gold] });
  K.cutTitle(ctx, 'JANJIMU', 540, 610, t, jt + 0.1, { size: 140, cols: [P.waterDeep, P.redDk] });
  // soft close: a kraft sheet slides up over the final hold
  const close = clamp((t - (end + 0.75)) / 0.45);
  if (close > 0) { ctx.fillStyle = `rgba(40,25,15,${close * 0.6})`; ctx.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= sh.at()) s = sh;
  const i = SHOTS.indexOf(s);
  const a = Math.max(0, s.at()), b = SHOTS[i + 1] ? SHOTS[i + 1].at() : AM.duration + 1;
  ctx.save();
  s.fn(t, a, b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.finish(ctx, { grain: 0.2, vig: 0.38 });
}
