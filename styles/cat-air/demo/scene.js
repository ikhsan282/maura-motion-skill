// Cat Air demo: "Roro Anteng & Joko Seger: asal upacara Kasada" (20 s). Soft watercolour washes of the Tengger
// caldera: an offering thrown into Bromo, the couple praying at dawn, twenty-five children, the eruption that took
// the youngest, and the Kasada pilgrims who still bring him gifts. 8 pictures over 5 lines.
import * as K from '/styles/cat-air/kit.js';
const { clamp, lerp, ease, prog, env, noise } = AM.lib;

export const meta = { fps: 24, hold: 3, captions: { preset: 'elegant', y: 1470, size: 62, color: '#fffaf0', strokeColor: 'rgba(40,34,60,.85)', active: '#ffd0b0' } };

let P, ui, C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  P = await K.painter(AM, { scale: 0.55 });
  ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('wind', 0.0, { gain: 0.3 });
  AM.sfx('swoosh_up', 0.9, { gain: 0.3 });
  AM.sfx('chime', W('doa', 'berdoa'), { gain: 0.3 });
  AM.sfx('sparkle', W('janji', 'dikabulkan'), { gain: 0.3 });
  AM.sfx('pop', W('janji', 'janji') + 0.1, { gain: 0.2, pitch: 1.3 });
  AM.sfx('boom', W('letus', 'meletus') - 0.1, { gain: 0.6, pitch: 0.7 });
  AM.sfx('thunder', W('letus', 'meletus') + 0.3, { gain: 0.35 });
  AM.sfx('bell_temple', W('moral', 'Kasada'), { gain: 0.35 });
}

const SHOTS = [];
const shot = (line, word, fn) => SHOTS.push({ line, word, fn });
const startOf = (s) => (s.word ? W(s.line, s.word) : C[s.line].start) - 0.12;
const shake = (t, amp) => [noise.n2(t * 17, 2) * amp, noise.n2(t * 17, 7) * amp];

// 1. HOOK: on the crater rim at sunrise a Tengger man throws an offering into Bromo's smoke.
shot('hook', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(560, 480, ease.inOutSine(p)), y: lerp(980, 940, p), z: 1.05 + 0.12 * ease.inOutSine(p) });
  K.dawnSky(g, { sun: [880, 820] });
  K.streaks(g, t, { y: 420, color: K.PAL.rose, a: 0.55 });
  K.semeru(g, t, 860, 1000, { s: 0.6 });
  K.calderaWall(g, t, { y: 1000, color: K.PAL.ridgeFar, amp: 90 });
  // the crater: a deep bowl of smoke on the left
  g.fillStyle = K.mix(K.PAL.ash, '#5a5468', 0.4); g.beginPath(); g.ellipse(250, 1180, 620, 200, 0, 0, Math.PI * 2); g.fill();
  K.plume(g, t, 250, 1180, { s: 1.0, a: 0.65, drift: 50 });
  // rim the man stands on
  g.fillStyle = K.mix(K.PAL.ash, K.PAL.sand, 0.5); K.poly(g, [[400, 1340], [700, 1290], [1100, 1300], [1500, 1400], [1500, 2400], [-400, 2400], [-400, 1520]]); g.fill();
  const thr = prog(t, a + 0.55, a + 1.0, ease.outCubic);
  const ox = 820, oy = 1330;
  K.figure(g, { x: ox, y: oy, h: 600, face: -1, costume: 'tengger', light: 1, t, pose: { armF: [lerp(-0.6, 2.4, thr), lerp(0.4, 0.1, thr)], armB: [0.2, 0.4], lean: lerp(-0.12, 0.12, thr) } });
  const fly = prog(t, a + 0.9, a + 2.8, ease.linear);
  if (thr < 1) { const [hx, hy] = K.handPos({ x: ox, y: oy, h: 600, face: -1, pose: { armF: [lerp(-0.6, 2.4, thr), lerp(0.4, 0.1, thr)], lean: lerp(-0.12, 0.12, thr) } }); K.offering(g, hx, hy, 0.9); }
  else if (fly < 1) K.offering(g, lerp(700, 260, fly), lerp(880, 1200, fly) - Math.sin(fly * Math.PI) * 420, lerp(0.9, 0.5, fly), fly * 5);
  K.tag(ui, 'KAWAH BROMO', 540, 290, { size: 46, alpha: env(t, W('hook', 'kawah') - 0.3, b, 0.3, 0.15), sub: 'orang Tengger, Jawa Timur' });
});

// 2. The caldera at dawn: the couple kneels in prayer above the sea of sand.
shot('doa', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(500, 600, ease.inOutSine(p)), y: 980, z: 1.0 + 0.06 * p });
  K.dawnSky(g, { sun: [620, 840] });
  K.streaks(g, t, { y: 380, color: '#d9a8c0', a: 0.5, seed: 5 });
  K.semeru(g, t, 900, 960, { s: 0.55 });
  K.calderaWall(g, t, { y: 980, amp: 70, color: K.PAL.ridgeFar, seed: 3 });
  K.sandSea(g, t, { y: 1000 });
  K.batok(g, 330, 1130, { s: 0.75 });
  K.bromo(g, t, 820, 1130, { s: 0.8 });
  K.gate(g, 560, 1120, 0.35);
  // mist in the caldera
  for (let i = 0; i < 4; i++) { g.save(); g.translate(((i * 420 + t * 20) % 1900) - 400, 1110 + i * 12); g.scale(1, 0.15); K.radial(g, 0, 0, 380, '#ffffff', 0.6); g.restore(); }
  // foreground ridge with the couple, praying toward the volcano
  g.fillStyle = K.mix(K.PAL.green, K.PAL.sand, 0.3); K.poly(g, [[-400, 1420], [300, 1360], [900, 1400], [1500, 1460], [1500, 2400], [-400, 2400]]); g.fill();
  const bow = 0.2 + 0.1 * Math.sin(t * 1.5);
  K.figure(g, { x: 300, y: 1470, h: 520, face: 1, costume: 'seger', light: 1, t, pose: { kneel: 1, bow, armF: [2.0, 0.9], armB: [1.9, 0.9] } });
  K.figure(g, { x: 520, y: 1480, h: 480, face: 1, costume: 'anteng', light: 1, t: t + 1, pose: { kneel: 1, bow: bow + 0.05, armF: [2.0, 0.9], armB: [1.9, 0.9] } });
  K.tag(ui, 'RORO ANTENG & JOKO SEGER', 540, 290, { size: 40, alpha: env(t, a, b, 0.3, 0.15), sub: 'asal nama "Tengger"' });
});

// 3a. The prayer is answered: a warm light comes down from the sky over them.
shot('janji', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 520, y: lerp(1000, 900, ease.inOutSine(p)), z: 1.3 + 0.1 * p });
  K.dawnSky(g, { sun: [540, 520], glow: 1.2 });
  K.streaks(g, t, { y: 600, color: '#f2c8b0', a: 0.5, seed: 8 });
  K.calderaWall(g, t, { y: 1050, amp: 60, color: K.PAL.ridgeFar });
  K.sandSea(g, t, { y: 1070 });
  const d = prog(t, a, a + 1.4, ease.outCubic);
  K.radial(g, 520, lerp(300, 900, d), 400, '#fff2c8', 0.9);
  for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2 + t; K.radial(g, 520 + Math.cos(ang) * 180 * d, lerp(300, 900, d) + Math.sin(ang) * 80 * d, 40, '#ffe8a0', 0.8); }
  K.figure(g, { x: 400, y: 1420, h: 600, face: 1, costume: 'seger', light: -1, t, pose: { kneel: 1, bow: 0.1 - d * 0.1, head: -0.3 * d, armF: [2.4, 0.4], armB: [2.2, 0.5] } });
  K.figure(g, { x: 640, y: 1430, h: 560, face: -1, costume: 'anteng', light: -1, t: t + 1, pose: { kneel: 1, bow: 0.1, head: -0.3 * d, armF: [2.4, 0.4], armB: [2.2, 0.5] } });
});
// 3b. Twenty-five children, one after another; the last and smallest is marked by the promise.
shot('janji', 'satu', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: 1000, z: 1.0 + 0.05 * p });
  K.dawnSky(g, { sun: [540, 760] });
  K.streaks(g, t, { y: 420, color: '#e8b8c0', a: 0.45, seed: 11 });
  K.bromo(g, t, 540, 1010, { s: 0.7 });
  K.sandSea(g, t, { y: 1000 });
  const n = Math.round(lerp(1, 25, prog(t, a - 0.6, a + 1.2, ease.outCubic)));
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 9), col = i % 9, last = i === 24;
    const x = 100 + col * 110 + (row % 2) * 55, y = 1180 + row * 130, h = last ? 200 : 260 - row * 20 - (i % 3) * 14;
    if (last) K.radial(g, x, y - 100, 160, '#fff0b0', 0.9);
    K.figure(g, { x, y, h, face: col % 2 ? -1 : 1, costume: 'anak', light: 1, t: t + i, shadow: false, cos: { shirt: last ? '#fff6d8' : ['#e8c46a', '#d98a7a', '#8ab0d0', '#9ac08a'][i % 4] }, pose: { armF: [0.3 + Math.sin(t * 2 + i) * 0.2, 0.3] } });
  }
  K.title(ui, String(n), 540, 290, { size: 150 });
  K.tag(ui, 'ANAK', 540, 420, { size: 40, alpha: 1 });
});

// 4a. The promise is broken: Bromo erupts in an orange bloom over the sand.
shot('letus', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const er = prog(t, W('letus', 'meletus') - 0.2, W('letus', 'meletus') + 0.6, ease.outCubic);
  const [sx, sy] = shake(t, 12 * env(t, W('letus', 'meletus') - 0.1, b, 0.1, 0.4));
  const g = K.view(P, { x: 540 + sx, y: lerp(1000, 900, er) + sy, z: 1.0 + 0.08 * p });
  K.dawnSky(g, { sun: null, top: K.mix('#9db9dc', '#6a5a7a', er), low: K.mix('#f6d7b8', '#e08a5a', er) });
  K.calderaWall(g, t, { y: 1000, amp: 80, color: K.mix(K.PAL.ridgeFar, '#8a7088', er) });
  K.sandSea(g, t, { y: 1020, color: K.mix(K.PAL.sand, '#b08a7a', er) });
  K.bromo(g, t, 560, 1160, { s: 1.0, erupt: er });
  // the family on a ridge, huddled, the parents shielding the children
  g.fillStyle = K.mix('#8a8a6a', '#6a5a5a', er); K.poly(g, [[-400, 1480], [500, 1430], [1500, 1500], [1500, 2400], [-400, 2400]]); g.fill();
  K.figure(g, { x: 260, y: 1520, h: 480, face: 1, costume: 'seger', light: 1, t, pose: { armF: [1.6, 0.5], armB: [1.2, 0.8], lean: -0.1 * er } });
  K.figure(g, { x: 430, y: 1530, h: 450, face: 1, costume: 'anteng', light: 1, t: t + 1, pose: { armF: [1.2, 1.0], armB: [1.0, 1.2], lean: -0.08 * er } });
  for (let i = 0; i < 5; i++) K.figure(g, { x: 560 + i * 85, y: 1540 + (i % 2) * 14, h: 230 - i * 6, face: -1, costume: 'anak', light: 1, t: t + i, shadow: false, pose: { armF: [1.4, 1.2] } });
});
// 4b. The youngest, Kesuma, is lifted away as a small light into the smoke.
shot('letus', 'merenggut', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1050, 880, ease.inOutSine(p)), z: 1.2 });
  K.dawnSky(g, { sun: null, top: '#6a5a7a', low: '#e0906a' });
  K.bromo(g, t, 560, 1180, { s: 1.1, erupt: 0.8 });
  g.fillStyle = '#7a6a6a'; K.poly(g, [[-400, 1500], [600, 1460], [1500, 1520], [1500, 2400], [-400, 2400]]); g.fill();
  const up = ease.inOutSine(p);
  K.figure(g, { x: 380, y: 1540, h: 500, face: 1, costume: 'anteng', light: 1, t, pose: { armF: [lerp(1.2, 2.6, up), 0.2], armB: [lerp(1.0, 2.3, up), 0.3], head: -0.3 } });
  const kx = lerp(560, 620, up), ky = lerp(1540, 1050, up);
  K.radial(g, kx, ky - 100, 220, '#fff2c0', 0.9);
  K.figure(g, { x: kx, y: ky, h: 220, face: -1, costume: 'anak', light: 1, t, shadow: false, alpha: 1 - up * 0.6, cos: { shirt: '#fff6d8' }, pose: { armF: [2.6, 0.2], armB: [2.4, 0.3] } });
  K.tag(ui, 'KESUMA', 540, 290, { size: 50, alpha: env(t, W('letus', 'Kesuma') - 0.3, b, 0.25, 0.15), sub: 'si bungsu' });
});

// 5. Yadnya Kasada: pilgrims with torches on the rim at dawn throw their gifts; the title holds.
shot('moral', null, (t, a, b) => {
  const p = clamp((t - a) / (C.moral.end + 0.5 - a));
  const g = K.view(P, { x: lerp(560, 520, p), y: lerp(1000, 960, p), z: 1.0 + 0.1 * ease.inOutSine(p) });
  K.dawnSky(g, { sun: [760, 880], night: 0.25 });
  K.streaks(g, t, { y: 420, color: '#e8a8b8', a: 0.5, seed: 14 });
  K.semeru(g, t, 820, 1000, { s: 0.55 });
  K.calderaWall(g, t, { y: 1010, amp: 70 });
  g.fillStyle = K.mix(K.PAL.ash, '#5a5468', 0.4); g.beginPath(); g.ellipse(540, 1200, 700, 190, 0, 0, Math.PI * 2); g.fill();
  K.plume(g, t, 540, 1200, { s: 0.9, a: 0.6, drift: 40 });
  g.fillStyle = K.mix(K.PAL.ash, K.PAL.sand, 0.5); K.poly(g, [[-400, 1400], [300, 1340], [800, 1350], [1500, 1420], [1500, 2400], [-400, 2400]]); g.fill();
  const people = [[60, 1430, 'tengger'], [210, 1400, 'tenggerW'], [360, 1390, 'tengger'], [700, 1395, 'tenggerW'], [860, 1410, 'tengger'], [1010, 1440, 'tengger']];
  people.forEach(([x, y, c], i) => {
    const thr = (Math.sin(t * 1.6 + i * 1.3) + 1) / 2;
    K.figure(g, { x, y, h: 400, face: x < 540 ? 1 : -1, costume: c, light: 1, t: t + i, pose: { armF: [0.6 + thr * 1.6, 0.4], armB: [0.2, 0.4] } });
    if (i % 2 === 0) K.torch(g, t, x + (x < 540 ? -40 : 40), y - 420, 0.9);
  });
  for (let i = 0; i < 4; i++) { const u = ((t - a) * 0.5 + i / 4) % 1, sx = [200, 380, 720, 880][i]; K.offering(g, lerp(sx, 540, u), lerp(1250, 1200, u) - Math.sin(u * Math.PI) * 260, 0.45 * (1 - u * 0.5), u * 6); }
  K.tag(ui, 'YADNYA KASADA', 540, 290, { size: 46, alpha: env(t, W('moral', 'Kasada') - 0.3, AM.duration + 2, 0.3, 0.3), sub: 'tiap bulan Kasada' });
  K.title(ui, 'UNTUK KESUMA', 540, 430, { size: 72, alpha: env(t, W('moral', 'untuknya') - 0.2, AM.duration + 2, 0.4, 0.3) });
});

export function render(t, AM) {
  P.clear(K.PAL.paper);
  const list = SHOTS.filter((s) => C[s.line]);
  let i = 0;
  for (let k = 0; k < list.length; k++) if (t >= startOf(list[k])) i = k;
  const s = list[i];
  const a = Math.max(0, startOf(s)), b = list[i + 1] ? startOf(list[i + 1]) : AM.duration + 0.5;
  s.fn(t, a, b);
  // wet-in: each new picture blooms out of paper white
  const since = t - a;
  if (since < 0.35 && i > 0) { const k = 1 - since / 0.35; const g = P.g; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(247,242,231,${0.55 * k})`; g.fillRect(0, 0, P.W, P.H); }
  P.paint(Math.floor(t * 24 / 3));
}
