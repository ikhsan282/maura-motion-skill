// Lukis Pedesaan demo 3: "Tradisi Wiwitan: Syukur Bumi Sebelum Panen" (10 shots).
// Impressionist plein-air paintings in motion celebrating the Javanese Wiwitan harvest thanksgiving ritual:
// golden ripe paddies at dawn, tumpeng preparation, misty village procession along the bund, crossing the river,
// spreading the pandan mat by the dangau, the village elder's prayer, ceremonial first cut, kembul bujana feast, and closing panorama.
import * as K from '/styles/lukis-pedesaan/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = { fps: 24, hold: 3, captions: { preset: 'elegant', y: 1470, size: 64 } };

let P, ui, C = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  P = await K.painter(AM, { scale: 0.55 });
  ui = AM.layer('ui');
  for (const l of AM.timeline.lines) C[l.id] = l;

  AM.sfx('bird', 0.15, { gain: 0.35 });
  AM.sfx('chime', W('arti', 'Wiwitan') - 0.05, { gain: 0.38 });
  AM.sfx('sparkle', W('dapur', 'tumpeng'), { gain: 0.35 });
  AM.sfx('wind', W('arak', 'beriringan'), { gain: 0.32 });
  AM.sfx('bubble', W('sungai', 'sungai'), { gain: 0.38 });
  AM.sfx('chime', W('gelar', 'tumpeng'), { gain: 0.35 });
  AM.sfx('magic', W('doa', 'doa') - 0.1, { gain: 0.4 });
  AM.sfx('swoosh_up', W('petik', 'dipetik'), { gain: 0.35 });
  AM.sfx('sparkle', W('makan', 'bersama'), { gain: 0.35 });
  AM.sfx('ding', W('akhir', 'syukur') - 0.1, { gain: 0.38 });
}

const SHOTS = [];
const shot = (line, word, fn) => SHOTS.push({ line, word, fn });
const startOf = (s) => (s.word ? W(s.line, s.word) : C[s.line].start) - 0.12;

// 1. HOOK: Untouched golden ripe paddies swaying at quiet dawn; an elder farmer stands reverently before the field.
shot('hook', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(960, 1020, ease.inOutSine(p)), z: 1.04 + 0.06 * p });
  K.morningSky(g, t, { sun: [720, 780], clouds: 4, seed: 3 });
  K.volcano(g, 310, 960, { w: 560, h: 370, color: '#9fb4c0', light: 1 });
  K.hills(g, { y: 990, amp: 80, color: K.PAL.hillFar, seed: 5 });
  K.mist(g, t, { y: 980, h: 120, a: 0.58 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 9, ripe: 0.92, seed: 7 });
  K.palm(g, 990, 1300, 740, { t, lean: -0.12 });

  // Elder farmer standing quietly with hands clasped in gratitude before touching the golden crop
  K.figure(g, {
    x: 420, y: 1470, h: 460, face: 1, costume: 'petani', light: 1, t,
    cos: { head: 'blangkon', hat: '#5a3a22', shirt: '#efe4cc' },
    pose: { bow: 0.12, head: 0.08, armF: [1.35, 1.25], armB: [1.25, 1.25] },
  });

  K.riceStalks(g, t, { y: 2050, h: 640, n: 68, ripe: 0.96, seed: 9 });
  K.label(ui, 'HENING SEBELUM PANEN', 540, 270, { size: 42, alpha: env(t, W('hook', 'syukur') - 0.3, b, 0.25, 0.2), sub: 'ungkapan terima kasih petani Jawa', subSize: 25 });
});

// 2. ARTI: Wide plein-air panorama of the golden valley and volcano as the title "WIWITAN" appears in warm light.
shot('arti', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(500, 580, ease.inOutSine(p)), y: 960, z: 1.0 });
  K.morningSky(g, t, { sun: [540, 700], clouds: 5, seed: 11, glow: 1.2 });
  K.volcano(g, 540, 950, { w: 640, h: 420, color: '#9eb2be', light: 1 });
  K.hills(g, { y: 990, amp: 85, color: K.PAL.hillFar, seed: 8 });
  K.mist(g, t, { y: 980, h: 110, a: 0.55 });
  K.terraces(g, t, { y0: 990, y1: 2300, rows: 10, ripe: 0.95, seed: 12 });
  K.hut(g, 830, 1210, 0.85);
  K.palm(g, 110, 1280, 700, { t, lean: 0.1 });
  K.palm(g, 960, 1250, 680, { t, lean: -0.1 });
  K.blekok(g, lerp(820, 280, p), 760 + Math.sin(t * 2) * 20, 0.85, t, { fly: true, seed: 4 });
  K.blekok(g, lerp(900, 360, p), 810 + Math.cos(t * 2) * 20, 0.78, t, { fly: true, seed: 5 });

  K.title(ui, 'WIWITAN', 540, 275, { size: 104, alpha: env(t, W('arti', 'Wiwitan') - 0.2, b, 0.25, 0.2) });
  K.label(ui, 'permulaan panen · penghormatan kepada bumi', 540, 400, { size: 32, alpha: env(t, W('arti', 'Wiwitan'), b, 0.25, 0.2) });
});

// 3. DAPUR: Village mothers prepare golden tumpeng rice and side dishes on fresh banana leaves at dawn.
shot('dapur', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1030, 990, p), z: 1.12 });
  K.morningSky(g, t, { sun: [300, 720], clouds: 3, seed: 16 });
  K.hills(g, { y: 1000, amp: 70, color: K.PAL.hillFar, seed: 13 });
  K.bamboo(g, 140, 1250, 760, { grow: 1, t, n: 5 });
  K.hut(g, 880, 1160, 0.95);

  // Woven wooden veranda table in foreground
  g.fillStyle = '#8a623c'; g.fillRect(-400, 1280, 1900, 1100);
  // Fresh green banana leaf mat
  g.fillStyle = '#4e8a36'; g.beginPath(); g.roundRect(140, 1340, 800, 320, 90); g.fill();
  g.strokeStyle = '#68a64c'; g.lineWidth = 5; g.beginPath(); g.moveTo(180, 1500); g.lineTo(900, 1500); g.stroke();

  // Mothers arranging the tumpeng tray
  K.figure(g, {
    x: 290, y: 1420, h: 520, face: 1, costume: 'petaniW', light: -1, t,
    cos: { head: 'konde', kebaya: '#c85438' },
    pose: { bow: 0.25, armF: [1.1 + Math.sin(t * 2.5) * 0.15, 0.55], armB: [0.9, 0.7] },
  });
  K.figure(g, {
    x: 790, y: 1430, h: 510, face: -1, costume: 'petaniW', light: -1, t: t + 1,
    cos: { head: 'konde', kebaya: '#4a7a5c' },
    pose: { bow: 0.22, armF: [1.15 - Math.sin(t * 2.5) * 0.15, 0.55], armB: [0.9, 0.7] },
  });

  // Ceremonial tumpeng in the centre
  K.tumpeng(g, 540, 1480, 1.12, t);

  K.label(ui, 'TUMPENG & HASIL BUMI', 540, 275, { size: 44, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'dirangkai di atas lembaran daun pisang', subSize: 25 });
});

// 4. ARAK: Villagers walk in single file along the misty terrace bund carrying the tumpeng offering toward the field.
shot('arak', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(480, 580, ease.inOutSine(p)), y: 1000, z: 1.05 });
  K.morningSky(g, t, { sun: [760, 740], clouds: 5, seed: 20 });
  K.volcano(g, 740, 950, { w: 580, h: 390, color: '#9cb2be', light: -1 });
  K.hills(g, { y: 990, amp: 85, color: K.PAL.hillFar, seed: 14 });
  K.mist(g, t, { y: 980, h: 130, a: 0.62 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 9, ripe: 0.9, seed: 18 });
  K.mist(g, t, { y: 1260, h: 140, a: 0.45, seed: 22, speed: 1.4 });

  // Procession of 4 villagers walking right across the terrace bund
  const baseX = lerp(180, 560, p);
  // 1. Elder leading
  K.figure(g, {
    x: baseX + 260, y: 1430, h: 390, face: 1, costume: 'petani', light: 1, t,
    cos: { head: 'blangkon', hat: '#5a3a22', shirt: '#efe4cc' },
    pose: { walk: (t * 0.9) % 1, armF: [0.3, 0.3], armB: [-0.2, 0.2] },
  });
  // 2. Woman carrying tumpeng tray
  const wx = baseX + 80, wy = 1460;
  K.figure(g, {
    x: wx, y: wy, h: 380, face: 1, costume: 'petaniW', light: 1, t: t + 0.5,
    cos: { head: 'konde' },
    pose: { walk: (t * 0.9 + 0.25) % 1, armF: [1.35, 0.85], armB: [1.2, 0.85] },
  });
  K.tumpeng(g, wx + 65, wy - 210, 0.45, t);
  // 3. Farmer carrying bamboo basket
  K.figure(g, {
    x: baseX - 100, y: 1480, h: 390, face: 1, costume: 'petani', light: 1, t: t + 1,
    pose: { walk: (t * 0.9 + 0.5) % 1 },
  });
  // 4. Child following happily
  K.figure(g, {
    x: baseX - 240, y: 1500, h: 270, face: 1, costume: 'anak', light: 1, t: t + 1.5,
    pose: { walk: (t * 1.1) % 1 },
  });

  K.riceStalks(g, t, { y: 2050, h: 580, n: 55, ripe: 0.92, seed: 24 });
  K.label(ui, 'ARAK-ARAKAN PAGI', 540, 275, { size: 44, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'menyusuri pematang menembus kabut lereng gunung', subSize: 25 });
});

// 5. SUNGAI: Crossing the clear shimmering village stream that nourishes every terrace plot.
shot('sungai', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1020, 980, p), z: 1.06 });
  K.morningSky(g, t, { sun: [620, 720], clouds: 4, seed: 25 });
  K.hills(g, { y: 990, amp: 80, color: K.PAL.hillFar, seed: 16 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 8, ripe: 0.88, seed: 26 });

  // Shimmering village river cutting through the terraces
  K.sungai(g, t, { y0: 1020, y1: 2050, xTop: 460, xBot: 580, wTop: 120, wBot: 520 });
  // Bamboo footbridge across the stream at y = 1420
  g.fillStyle = '#5c4024';
  g.fillRect(320, 1410, 440, 22);
  g.strokeStyle = '#9c7848'; g.lineWidth = 10;
  for (let x = 330; x <= 750; x += 28) { g.beginPath(); g.moveTo(x, 1405); g.lineTo(x, 1435); g.stroke(); }
  g.strokeStyle = '#826238'; g.lineWidth = 7;
  g.beginPath(); g.moveTo(320, 1330); g.lineTo(760, 1330); g.stroke();

  K.palm(g, 130, 1320, 700, { t, lean: 0.14 });
  K.bamboo(g, 940, 1340, 740, { grow: 1, t, n: 5 });
  K.blekok(g, 330, 1650, 0.9, t, { fly: false, seed: 7 });

  // Villagers crossing the bamboo bridge
  const bx = lerp(380, 660, p);
  K.figure(g, { x: bx, y: 1412, h: 360, face: 1, costume: 'petani', light: 1, t, pose: { walk: (t * 0.9) % 1 } });
  K.figure(g, { x: bx - 120, y: 1412, h: 340, face: 1, costume: 'petaniW', light: 1, t: t + 1, pose: { walk: (t * 0.9 + 0.4) % 1 } });

  K.label(ui, 'SUNGAI DESA', 540, 275, { size: 44, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'urat nadi air yang menghidupi tanaman padi', subSize: 25 });
});

// 6. GELAR: Beside the field hut (dangau), a woven pandan mat is unrolled with tumpeng, ingkung, and jasmine blossoms.
shot('gelar', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1040, 990, p), z: 1.12 });
  K.morningSky(g, t, { sun: [760, 680], clouds: 4, seed: 29 });
  K.hills(g, { y: 990, amp: 75, color: K.PAL.hillFar, seed: 18 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 8, ripe: 0.96, seed: 30 });
  K.hut(g, 240, 1280, 1.2);
  K.palm(g, 960, 1260, 700, { t, lean: -0.1 });

  // Woven pandan mat (tikar pandan) on the broad bund
  g.fillStyle = '#d4b475'; g.beginPath(); g.roundRect(220, 1420, 640, 220, 28); g.fill();
  g.strokeStyle = '#9e7a42'; g.lineWidth = 6; g.beginPath(); g.roundRect(232, 1432, 616, 196, 20); g.stroke();

  // Tumpeng & jasmine blossoms on the mat
  const showU = prog(t, a + 0.1, a + 0.8, ease.outBack);
  K.tumpeng(g, 540, 1515, 0.95 * showU, t);
  // White jasmine flowers (melati) scattered around the mat
  for (let i = 0; i < 16; i++) {
    const fx = 280 + (i * 37) % 520, fy = 1460 + (i * 53) % 140;
    g.fillStyle = i % 3 === 0 ? '#f5d268' : '#fffdf4';
    g.beginPath(); g.arc(fx, fy, 9 * showU, 0, Math.PI * 2); g.fill();
  }

  K.figure(g, {
    x: 240, y: 1520, h: 420, face: 1, costume: 'petaniW', light: 1, t,
    cos: { head: 'konde' },
    pose: { kneel: 1, bow: 0.25, armF: [1.1, 0.5], armB: [0.8, 0.7] },
  });

  K.riceStalks(g, t, { y: 2050, h: 560, n: 50, ripe: 0.98, seed: 31 });
  K.label(ui, 'SAJIAN WIWITAN', 540, 275, { size: 44, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'tikar pandan, tumpeng kuning, dan harum melati', subSize: 25 });
});

// 7. DOA: The village elder sits cross-legged in solemn prayer as warm golden sunbeams bathe the terraces.
shot('doa', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1000, 960, ease.inOutSine(p)), z: 1.15 });
  K.morningSky(g, t, { sun: [540, 620], clouds: 4, seed: 33, glow: 1.35 });
  K.volcano(g, 540, 950, { w: 600, h: 400, color: '#a2b6c2', light: 1 });
  K.hills(g, { y: 990, amp: 80, color: K.PAL.hillFar, seed: 20 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 8, ripe: 0.98, seed: 34 });

  // Warm golden halo / sunbeams descending over the prayer circle
  const prayU = prog(t, W('doa', 'doa') - 0.2, b, ease.inOutSine);
  K.radial(g, 540, 1180, 560, '#fff4c2', 0.48);

  // Pandan mat + tumpeng
  g.fillStyle = '#d4b475'; g.beginPath(); g.roundRect(240, 1450, 600, 180, 24); g.fill();
  K.tumpeng(g, 620, 1520, 0.78, t);

  // Village elder (Tetua Desa) sitting in prayer
  K.figure(g, {
    x: 420, y: 1520, h: 480, face: 1, costume: 'petani', light: 1, t,
    cos: { head: 'blangkon', hat: '#5a3a22', shirt: '#f2e8d0', beard: '#8c867e' },
    pose: { sit: 1, bow: 0.18, head: 0.15 - prayU * 0.22, armF: [1.45 + prayU * 0.25, 1.1], armB: [1.35 + prayU * 0.25, 1.1] },
  });

  K.title(ui, 'DOA SYUKUR BUMI', 540, 280, { size: 86, alpha: env(t, a + 0.15, b, 0.25, 0.2) });
});

// 8. PETIK: The ceremonial first rice stalk is gently harvested using a traditional ani-ani blade.
shot('petik', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(520, 560, p), y: 1020, z: 1.18 });
  K.morningSky(g, t, { sun: [720, 660], clouds: 4, seed: 37 });
  K.hills(g, { y: 990, amp: 75, color: K.PAL.hillFar, seed: 22 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 8, ripe: 1.0, seed: 38 });

  const cutU = prog(t, W('petik', 'dipetik') - 0.2, W('petik', 'dipetik') + 0.6, ease.inOutCubic);
  const fig = {
    x: 420, y: 1520, h: 540, face: 1, costume: 'petani', light: 1, t,
    cos: { head: 'blangkon', hat: '#5a3a22', shirt: '#f2e8d0' },
    pose: { bow: 0.35 + cutU * 0.12, armF: [1.15 + cutU * 0.2, 0.45], armB: [0.95, 0.6] },
  };
  K.figure(g, fig);

  // Small wooden ani-ani finger blade in hand & glowing golden rice panicle being harvested
  const [hx, hy] = K.handPos(fig);
  K.radial(g, hx + 30, hy, 180, '#fff6c8', 0.55);
  g.fillStyle = '#7a4e28'; g.fillRect(hx - 14, hy - 8, 36, 12);
  g.fillStyle = '#d8dee4'; g.fillRect(hx - 10, hy + 4, 28, 6);

  // Foreground golden rice stalks
  K.riceStalks(g, t, { y: 1980, h: 660, n: 65, ripe: 1.0, seed: 39 });
  K.label(ui, 'PETIK PADI PERTAMA', 540, 275, { size: 44, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'dipetik lembut dengan ani-ani sebagai tanda panen dimulai', subSize: 24 });
});

// 9. MAKAN: Kembul bujana — farmers and children sit in a circle on the bund sharing the blessed wiwit rice.
shot('makan', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1020, 980, p), z: 1.08 });
  K.morningSky(g, t, { sun: [680, 660], clouds: 5, seed: 41 });
  K.volcano(g, 280, 960, { w: 540, h: 370, color: '#a4b8c4', light: 1 });
  K.hills(g, { y: 990, amp: 80, color: K.PAL.hillFar, seed: 25 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 8, ripe: 0.98, seed: 42 });
  K.hut(g, 890, 1180, 0.85);

  // Long banana leaf & pandan mat shared meal
  g.fillStyle = '#d4b475'; g.beginPath(); g.roundRect(140, 1440, 800, 190, 28); g.fill();
  g.fillStyle = '#4e8a36'; g.beginPath(); g.roundRect(180, 1465, 720, 140, 40); g.fill();
  K.tumpeng(g, 540, 1520, 0.72, t);
  K.riceBowl(g, 390, 1530, 0.32, t);
  K.riceBowl(g, 690, 1530, 0.32, t);

  const eat = Math.sin(t * 3) * 0.25;
  K.figure(g, { x: 240, y: 1520, h: 420, face: 1, costume: 'petani', light: 1, t, pose: { sit: 1, bow: 0.15, armF: [1.35 + eat, 1.15], armB: [0.8, 0.8] } });
  K.figure(g, { x: 830, y: 1520, h: 410, face: -1, costume: 'petaniW', light: 1, t: t + 1, cos: { head: 'konde' }, pose: { sit: 1, bow: 0.15, armF: [1.3 - eat, 1.15], armB: [0.8, 0.8] } });
  K.figure(g, { x: 470, y: 1450, h: 300, face: 1, costume: 'anak', light: 1, t: t + 2, pose: { sit: 1, armF: [1.5 + eat, 1.1], armB: [0.9, 0.8] } });

  K.riceStalks(g, t, { y: 2050, h: 550, n: 50, ripe: 1.0, seed: 43 });
  K.label(ui, 'KEMBUL BUJANA', 540, 275, { size: 46, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'makan bersama penuh berkah di tengah sawah', subSize: 25 });
});

// 10. AKHIR: Serene closing countryside painting — golden terraces, mist, volcano, and gratitude message.
shot('akhir', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1020, 930, ease.inOutSine(p)), z: lerp(1.08, 1.0, ease.inOutSine(p)) });
  K.morningSky(g, t, { sun: [540, 700], clouds: 5, seed: 45, glow: 1.25 });
  K.volcano(g, 540, 950, { w: 620, h: 410, color: '#9eb2be', light: 1 });
  K.hills(g, { y: 990, amp: 85, color: K.PAL.hillFar, seed: 28 });
  K.mist(g, t, { y: 980, h: 120, a: 0.58 });
  K.terraces(g, t, { y0: 990, y1: 2300, rows: 10, ripe: 0.98, seed: 46 });
  K.hut(g, 850, 1200, 0.85);
  K.palm(g, 990, 1280, 740, { t, lean: -0.12 });
  K.palm(g, 70, 1250, 660, { t, lean: 0.1 });
  K.blekok(g, lerp(250, 780, p), 760 + Math.sin(t * 2) * 18, 0.85, t, { fly: true, seed: 9 });
  K.riceStalks(g, t, { y: 2050, h: 640, n: 65, ripe: 1.0, seed: 47 });

  const ta = env(t, W('akhir', 'sahabat') - 0.3, AM.duration + 2, 0.35, 0.3);
  K.title(ui, 'SAHABAT BUMI', 540, 285, { size: 96, alpha: ta });
  K.label(ui, 'hidup selaras dengan alam lewat rasa syukur', 540, 415, { size: 32, alpha: ta });
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
  const since = t - a;
  if (since < 0.25 && i > 0) {
    ui.fillStyle = `rgba(255,248,225,${0.35 * (1 - since / 0.25)})`;
    ui.fillRect(0, 0, 1080, 1920);
  }
}

