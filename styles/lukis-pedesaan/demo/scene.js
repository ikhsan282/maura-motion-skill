// Lukis Pedesaan demo: "Dewi Sri, Asal Mula Padi" (20 s). Impressionist countryside painted in short dabs:
// sunrise terraces, the weeping naga Antaboga, Dewi Sri in the heavens, a grave that grows the first rice,
// the harvest, and a bowl of rice. 9 pictures over 6 lines (some lines cut on a word).
import * as K from '/styles/lukis-pedesaan/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 3, captions: { preset: 'elegant', y: 1470, size: 64 } };

let P, ui, C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  P = await K.painter(AM, { scale: 0.55 });
  ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('bird', 0.1, { gain: 0.35 });
  AM.sfx('sparkle', W('hook', 'dewi') - 0.1, { gain: 0.35 });
  AM.sfx('bubble', W('lahir', 'air') + 0.3, { gain: 0.35 });
  AM.sfx('magic', W('lahir', 'Antaboga'), { gain: 0.35 });
  AM.sfx('wind', W('racun', 'meracunnya') - 0.2, { gain: 0.35 });
  AM.sfx('swoosh_up', W('tumbuh', 'kelapa') - 0.1, { gain: 0.3 });
  AM.sfx('swoosh_up', W('tumbuh', 'bambu') - 0.1, { gain: 0.25, pitch: 1.2 });
  AM.sfx('chime', W('tumbuh', 'padi') - 0.1, { gain: 0.4 });
  AM.sfx('ding', W('moral', 'nasimu'), { gain: 0.3 });
}

const SHOTS = [];
const shot = (line, word, fn) => SHOTS.push({ line, word, fn });
const startOf = (s) => (s.word ? W(s.line, s.word) : C[s.line].start) - 0.12;

// 1. HOOK: sunrise over the terraces; rice sways in front; on "dewi" a golden goddess rises out of the mist.
shot('hook', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(820, 1020, ease.inOutSine(p)), z: 1.05 + 0.08 * p });
  K.morningSky(g, t, { sun: [700, 780], y1: 1000 });
  K.volcano(g, 300, 980, { w: 560, h: 360, color: '#a9bcc6' });
  K.hills(g, { y: 1000, amp: 90, color: K.PAL.hillFar, seed: 2 });
  K.mist(g, t, { y: 960, h: 120, a: 0.6 });
  K.terraces(g, t, { y0: 990, y1: 2300, rows: 9, ripe: 0.35, seed: 3 });
  const gd = prog(t, W('hook', 'dewi') - 0.3, b, ease.inOutSine);
  if (gd > 0) {
    K.radial(g, 560, 900, 520, '#fff0c0', 0.45 * gd);
    K.figure(g, { x: 560, y: 1260 - 40 * gd, h: 640, face: 1, costume: 'dewi', light: 1, t, alpha: 0.55 * gd, shadow: false, pose: { turn: 0.2, armF: [1.2, 0.3], armB: [1.1, 0.4] } });
  }
  K.mist(g, t, { y: 1250, h: 160, a: 0.45, seed: 7, speed: 1.4 });
  K.palm(g, 980, 1330, 760, { t, lean: -0.12 }); K.palm(g, 60, 1250, 640, { t, lean: 0.1 });
  K.figure(g, { x: lerp(200, 330, p), y: 1420, h: 260, face: 1, costume: 'petaniW', light: 1, t, pose: { walk: (t * 0.9) % 1 } });
  K.riceStalks(g, t, { y: 2050, h: 640, n: 60, ripe: 0.75 });
});

// 2. Antaboga weeps in a misty mountain pool; a tear becomes a glowing egg that cracks open.
shot('lahir', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(560, 520, p), y: 980, z: 1.0 + 0.1 * ease.inOutSine(p) });
  K.morningSky(g, t, { sun: null, top: '#8fb2c8', mid: '#c7dbe0', dawn: '#e6efe6', clouds: 3, seed: 9 });
  K.volcano(g, 760, 900, { w: 640, h: 520, color: '#7f9fae', light: -1 });
  K.hills(g, { y: 980, amp: 120, color: '#6f9a86', seed: 5 });
  K.mist(g, t, { y: 980, h: 140, a: 0.7 });
  g.fillStyle = '#7fb0bc'; g.fillRect(-400, 1180, 1900, 1200);
  K.mist(g, t, { y: 1190, h: 60, a: 0.6, seed: 4 });
  K.naga(g, 620, 1260, 1.25, t, { sorrow: 1 });
  // tear: forms at the eye, falls, becomes an egg on the water
  const fall = prog(t, W('lahir', 'air') - 0.1, W('lahir', 'air') + 0.7, ease.inQuad);
  const ex = 470, ey = 770;
  if (fall > 0 && fall < 1) { g.fillStyle = '#e8fbff'; g.beginPath(); g.ellipse(ex - 30, lerp(ey, 1250, fall), 16, 24, 0, 0, Math.PI * 2); g.fill(); K.radial(g, ex - 30, lerp(ey, 1250, fall), 80, '#ffffff', 0.6); }
  const eg = prog(t, W('lahir', 'air') + 0.6, W('lahir', 'air') + 1.0, ease.outBack);
  if (eg > 0) K.egg(g, 430, 1300, 70 * eg, { crack: prog(t, W('lahir', 'Antaboga'), b, ease.inOutCubic), t });
  K.label(ui, 'ANTABOGA', 540, 280, { size: 44, alpha: env(t, W('lahir', 'naga') - 0.3, b, 0.3, 0.15), sub: 'sang naga', subSize: 26 });
});

// 3a. Dewi Sri walks in the heavens; the gods whisper in the clouds.
shot('racun', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: 980, z: 1.0 + 0.12 * ease.inOutSine(p) });
  K.morningSky(g, t, { sun: [540, 600], top: '#e9c98a', mid: '#f6dfae', dawn: '#fff1cf', clouds: 7, seed: 12, y0: -300, y1: 1900 });
  for (const [cx, cy, w, s] of [[200, 1500, 760, 3], [880, 1560, 820, 4], [540, 1720, 1100, 5]]) K.cloudMass(g, cx + Math.sin(t * 0.5 + s) * 20, cy, w, w * 0.3, { lit: '#fffaf0', mid: '#f6e4c2', shade: '#e2c08a', light: 1, seed: s, t });
  K.figure(g, { x: 120, y: 1380, h: 680, face: 1, costume: 'dewa', light: 1, t, alpha: 0.85, pose: { lean: 0.15, head: 0.15, armF: [1.4, 1.2] } });
  K.figure(g, { x: 970, y: 1400, h: 700, face: -1, costume: 'dewa', light: 1, t: t + 2, alpha: 0.85, cos: { beard: null, robe: '#e8d4b4' }, pose: { lean: 0.1, head: 0.1, armF: [1.6, 1.4] } });
  K.radial(g, 540 + (t - a) * 20, 1000, 360, '#fff6d0', 0.5);
  K.figure(g, { x: 480 + (t - a) * 40, y: 1420, h: 780, face: 1, costume: 'dewi', light: 1, t, pose: { walk: (t * 0.6) % 1, armF: [0.3, 0.4], armB: [0.2, 0.5], head: -0.05 } });
  K.label(ui, 'DEWI SRI', 540, 280, { size: 48, alpha: env(t, a, b, 0.3, 0.15), sub: 'di kahyangan', subSize: 26 });
});
// 3b. Poisoned: she sinks to her knees as the light drains away and petals fall.
shot('racun', 'meracunnya', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1020, 1080, p), z: 1.25 + 0.1 * p });
  const fade = ease.inOutSine(p);
  K.morningSky(g, t, { sun: null, top: K.mix('#e9c98a', '#6a6e8e', fade), mid: K.mix('#f6dfae', '#9a92a8', fade), dawn: K.mix('#fff1cf', '#c9a8a0', fade), clouds: 5, seed: 12, y0: -300, y1: 1900 });
  K.cloudMass(g, 540, 1700, 1200, 360, { lit: K.mix('#fffaf0', '#c8c0d0', fade), mid: K.mix('#f6e4c2', '#a8a0b8', fade), shade: '#8a809a', light: 1, seed: 5, t });
  K.figure(g, { x: 520, y: 1470, h: 760, face: 1, costume: 'dewi', light: 1, t, pose: { kneel: ease.outCubic(clamp(p * 1.6)), bow: 0.5 * fade, head: 0.3 + 0.3 * fade, armF: [0.9, 1.2], armB: [0.4, 0.8] } });
  for (let i = 0; i < 14; i++) { const u = ((t - a) * 0.35 + i / 14) % 1; g.fillStyle = i % 2 ? '#fff6e6' : '#f3d27a'; g.beginPath(); g.ellipse(200 + (i * 97) % 700 + Math.sin(t * 2 + i) * 30, lerp(500, 1500, u), 12, 7, i, 0, Math.PI * 2); g.fill(); }
});

// 4a. Her grave at dawn: a coconut palm and bamboo shoot up out of the ground.
shot('tumbuh', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1050, 980, p), z: 1.0 + 0.06 * p });
  K.morningSky(g, t, { sun: [540, 1000], top: '#a8c6dc', mid: '#d8e4e4', dawn: '#f8e2b8', clouds: 4, seed: 21 });
  K.hills(g, { y: 1080, amp: 90, color: K.PAL.hillFar, seed: 8 });
  K.mist(g, t, { y: 1080, h: 100, a: 0.65 });
  g.fillStyle = K.mix('#7a9a4a', '#5a7a3a', 0.4); g.fillRect(-400, 1160, 1900, 1200);
  K.palm(g, 260, 1330, 900, { grow: prog(t, W('tumbuh', 'kelapa') - 0.15, W('tumbuh', 'kelapa') + 0.7), t });
  K.bamboo(g, 830, 1340, 820, { grow: prog(t, W('tumbuh', 'bambu') - 0.15, W('tumbuh', 'bambu') + 0.7), t });
  K.grave(g, 540, 1400, 1.0, { t });
  K.mist(g, t, { y: 1420, h: 80, a: 0.4, seed: 9, speed: 1.6 });
});
// 4b. From her navel, rice: sprouts burst from the mound and the whole valley turns green, then gold.
shot('tumbuh', 'pusarnya', (t, a, b) => {
  const p = clamp((t - a) / (b + 0.3 - a));
  const g = K.view(P, { x: 540, y: lerp(1250, 1000, ease.inOutSine(p)), z: lerp(1.5, 1.0, ease.inOutSine(p)) });
  K.morningSky(g, t, { sun: [560, 820], clouds: 4, seed: 21 });
  K.volcano(g, 800, 960, { w: 560, h: 380, color: '#a9bcc6', light: -1 });
  K.hills(g, { y: 1000, amp: 80, color: K.PAL.hillFar, seed: 8 });
  K.mist(g, t, { y: 990, h: 100, a: 0.55 });
  K.terraces(g, t, { y0: 1010, y1: 2300, rows: 10, ripe: prog(t, a + 0.4, b + 0.3) * 0.6, water: 1 - prog(t, a, a + 0.7), seed: 7 });
  // sprouts fan out of the mound
  const sp = prog(t, a, a + 0.6, ease.outBack);
  K.grave(g, 540, 1420, 0.8);
  g.strokeStyle = '#8fd04a'; g.lineCap = 'round'; g.lineWidth = 14;
  for (let i = 0; i < 11; i++) { const ang = -Math.PI / 2 + (i - 5) * 0.16, L = 260 * sp * (0.7 + 0.3 * Math.sin(i * 1.7)); g.beginPath(); g.moveTo(540, 1360); g.quadraticCurveTo(540 + Math.cos(ang) * L * 0.5, 1360 + Math.sin(ang) * L * 0.6, 540 + Math.cos(ang) * L + Math.sin(t * 2 + i) * 8, 1360 + Math.sin(ang) * L); g.stroke(); }
  K.radial(g, 540, 1240, 300, '#fff8d0', 0.35 * sp);
  K.label(ui, 'PADI', 540, 280, { size: 56, alpha: env(t, W('tumbuh', 'padi') - 0.25, b, 0.25, 0.15) });
});

// 5. The harvest: farmers in golden terraces at morning, sheaves carried home.
shot('panen', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(480, 600, ease.inOutSine(p)), y: 1000, z: 1.08 });
  K.morningSky(g, t, { sun: [820, 700], clouds: 5, seed: 31 });
  K.volcano(g, 260, 960, { w: 520, h: 360, color: '#a9bcc6' });
  K.hills(g, { y: 1000, amp: 80, color: K.PAL.hillFar, seed: 11 });
  K.mist(g, t, { y: 990, h: 90, a: 0.5 });
  K.terraces(g, t, { y0: 1000, y1: 2300, rows: 8, ripe: 0.95, seed: 13 });
  K.hut(g, 880, 1150, 0.8);
  K.palm(g, 1010, 1200, 700, { t, lean: -0.1 }); K.palm(g, 700, 1080, 420, { t, lean: 0.05 });
  const cut = Math.sin(t * 3) * 0.3;
  K.figure(g, { x: 260, y: 1360, h: 360, face: 1, costume: 'petani', light: 1, t, pose: { bow: 0.65, armF: [1.0 + cut, 0.6], armB: [0.8, 0.8] } });
  K.figure(g, { x: 470, y: 1440, h: 400, face: -1, costume: 'petaniW', light: 1, t: t + 1, pose: { bow: 0.55, armF: [0.9 - cut, 0.7], armB: [0.7, 0.9] } });
  // a woman walks home with a sheaf on her head
  const wx = lerp(1050, 760, p);
  K.figure(g, { x: wx, y: 1560, h: 520, face: -1, costume: 'petaniW', light: 1, t: t + 2, cos: { head: 'konde' }, pose: { walk: (t * 0.9) % 1, armF: [2.9, 0.3], armB: [0.2, 0.2] } });
  g.fillStyle = K.PAL.gold; g.save(); g.translate(wx + 10, 1560 - 520 * 1.02); g.rotate(-0.15); g.beginPath(); g.ellipse(0, 0, 110, 36, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = K.PAL.goldDeep; for (let k = -4; k <= 4; k++) g.fillRect(k * 24, -20, 6, 40); g.restore();
  K.riceStalks(g, t, { y: 2000, h: 520, n: 40, ripe: 1, seed: 8 });
  K.label(ui, 'MAPAG SRI', 540, 280, { size: 46, alpha: env(t, a + 0.1, b, 0.3, 0.15), sub: 'menyambut Dewi Sri saat panen', subSize: 26 });
});

// 6. A bowl of steaming rice on a mat by the window; the title lands and holds.
shot('moral', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1000, 940, ease.inOutSine(p)), z: 1.0 + 0.08 * ease.inOutSine(p) });
  // window onto the terraces
  g.fillStyle = '#6a4a30'; g.fillRect(-400, -400, 1900, 2800);
  g.save(); g.beginPath(); g.rect(100, 160, 880, 760); g.clip();
  K.morningSky(g, t, { sun: [640, 560], y0: 160, y1: 700, clouds: 3, seed: 41 });
  K.hills(g, { y: 700, amp: 60, color: K.PAL.hillFar, seed: 3 });
  K.terraces(g, t, { y0: 700, y1: 1000, rows: 5, ripe: 0.9, seed: 17, curve: 30 });
  g.restore();
  g.fillStyle = '#4a3020'; g.fillRect(520, 160, 40, 760); g.fillRect(100, 520, 880, 34);
  K.radial(g, 540, 600, 700, '#ffe2a8', 0.35);
  // woven mat table
  g.fillStyle = '#c9a26a'; g.fillRect(-400, 1060, 1900, 1400);
  g.strokeStyle = '#a8804a'; g.lineWidth = 10; for (let x = -400; x < 1500; x += 60) { g.beginPath(); g.moveTo(x, 1060); g.lineTo(x - 200, 2200); g.stroke(); }
  K.riceBowl(g, 540, 1180, 1.05, t);
  const ta = env(t, W('moral', 'jangan') - 0.2, AM.duration + 2, 0.4, 0.3);
  K.title(ui, 'DEWI SRI', 540, 300, { size: 120, alpha: ta });
  K.label(ui, 'dewi padi Nusantara', 540, 430, { size: 34, alpha: ta });
});

export function render(t, AM) {
  P.clear('#f3eee2');
  const list = SHOTS.filter((s) => C[s.line]);
  let i = 0;
  for (let k = 0; k < list.length; k++) if (t >= startOf(list[k])) i = k;
  const s = list[i];
  const a = Math.max(0, startOf(s)), b = list[i + 1] ? startOf(list[i + 1]) : AM.duration + 0.5;
  s.fn(t, a, b);
  P.paint(Math.floor(t * 24 / 3));
  // per cut: a soft flash of morning light
  const since = t - a;
  if (since < 0.25 && i > 0) { ui.fillStyle = `rgba(255,248,225,${0.35 * (1 - since / 0.25)})`; ui.fillRect(0, 0, 1080, 1920); }
}
