// Lukis Pedesaan demo 2: "Fajar Seorang Petani & Sepiring Nasi" (10 shots).
// Impressionist plein-air countryside paintings in motion: blue-dawn mist, buffalo plowing flooded terraces,
// planting seedlings (tandur), white paddy herons, windy dangau shelter, valley ripening from green to gold,
// communal harvest, pounding rice in the lesung, 100-day sun arc, and a steaming bowl of rice by the window.
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
  AM.sfx('bubble', W('bajak', 'membajak'), { gain: 0.35 });
  AM.sfx('chime', W('tanam', 'harapan'), { gain: 0.35 });
  AM.sfx('bird', W('rawat', 'kuntul'), { gain: 0.38, pitch: 1.15 });
  AM.sfx('wind', W('hama', 'angin') - 0.1, { gain: 0.45 });
  AM.sfx('magic', W('menguning', 'emas') - 0.1, { gain: 0.42 });
  AM.sfx('sparkle', W('panen', 'syukur'), { gain: 0.35 });
  AM.sfx('impact', W('lesung', 'lesung'), { gain: 0.38 });
  AM.sfx('chime', W('perjalanan', 'beras'), { gain: 0.38 });
  AM.sfx('ding', W('akhir', 'butirnya') - 0.1, { gain: 0.35 });
}

const SHOTS = [];
const shot = (line, word, fn) => SHOTS.push({ line, word, fn });
const startOf = (s) => (s.word ? W(s.line, s.word) : C[s.line].start) - 0.12;

// 1. HOOK: Early blue-amber dawn before sunrise; thick mist over flooded terraces as an old farmer walks along the bund.
shot('hook', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(510, 560, ease.inOutSine(p)), y: lerp(960, 1020, p), z: 1.04 + 0.06 * p });
  K.morningSky(g, t, { sun: [760, 880], top: '#3c5884', mid: '#7d98b8', dawn: '#e8b882', clouds: 5, seed: 2, glow: 0.75 });
  K.volcano(g, 280, 960, { w: 580, h: 390, color: '#788ea6', light: 1 });
  K.hills(g, { y: 990, amp: 85, color: '#6b858e', seed: 4 });
  K.mist(g, t, { y: 980, h: 150, a: 0.72, seed: 3 });
  K.terraces(g, t, { y0: 990, y1: 2250, rows: 9, ripe: 0.05, water: 0.85, seed: 5, sky: '#9cbcd4' });
  K.mist(g, t, { y: 1280, h: 180, a: 0.58, seed: 8, speed: 1.5 });
  K.palm(g, 980, 1310, 740, { t, lean: -0.14 });
  K.palm(g, 70, 1260, 620, { t, lean: 0.11 });

  // Old farmer walking through the morning mist carrying a hoe over his shoulder
  const fx = lerp(220, 480, p), fy = 1450;
  K.figure(g, {
    x: fx, y: fy, h: 420, face: 1, costume: 'petani', light: 1, t,
    pose: { walk: (t * 0.85) % 1, lean: 0.12, armF: [1.35, 1.1], armB: [-0.2, 0.25] },
  });
  // wooden hoe resting on shoulder
  const [hx, hy] = K.handPos({ x: fx, y: fy, h: 420, face: 1, pose: { lean: 0.12, armF: [1.35, 1.1] } });
  g.strokeStyle = '#5c3c20'; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.moveTo(hx - 95, hy - 70); g.lineTo(hx + 70, hy + 45); g.stroke();
  g.fillStyle = '#8b949c'; g.fillRect(hx - 108, hy - 75, 22, 48);

  K.riceStalks(g, t, { y: 2040, h: 520, n: 48, ripe: 0.15, seed: 6 });
  K.label(ui, 'SUBUH DI DESA', 540, 270, { size: 44, alpha: env(t, W('hook', 'kabut') - 0.2, b, 0.25, 0.2), sub: 'langkah pertama sebelum matahari terbit', subSize: 25 });
});

// 2. BAJAK: Pak Tani and his loyal water buffalo plow the mirror-like flooded paddy reflecting the golden dawn.
shot('bajak', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(480, 580, ease.inOutSine(p)), y: 1010, z: 1.06 });
  K.morningSky(g, t, { sun: [780, 740], top: '#4f86c6', mid: '#9ec4e2', dawn: '#f7cf8e', clouds: 5, seed: 10 });
  K.volcano(g, 760, 960, { w: 560, h: 380, color: '#95aebc', light: -1 });
  K.hills(g, { y: 990, amp: 80, color: K.PAL.hillFar, seed: 6 });
  K.mist(g, t, { y: 980, h: 110, a: 0.55 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 8, ripe: 0.0, water: 0.92, seed: 11, sky: '#e8c896' });

  const kx = lerp(420, 680, p), ky = 1480;
  // Water buffalo pulling wooden plow
  K.kerbau(g, kx, ky, 0.95, t, { face: 1, walk: 0.75, plow: true });
  // Pak Tani walking behind guiding the plow
  K.figure(g, {
    x: kx - 330, y: ky + 15, h: 430, face: 1, costume: 'petani', light: 1, t,
    pose: { walk: (t * 0.95) % 1, lean: 0.22, armF: [1.15, 0.35], armB: [0.9, 0.45] },
  });
  // mud splashes around hooves
  g.fillStyle = 'rgba(255,244,210,0.65)';
  for (let i = 0; i < 8; i++) {
    const sx = kx - 140 + i * 42 + Math.sin(t * 5 + i) * 12;
    g.beginPath(); g.ellipse(sx, ky + 6, 16, 6, 0, 0, Math.PI * 2); g.fill();
  }
  K.label(ui, 'MEMBAJAK SAWAH', 540, 270, { size: 44, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'lumpur berair memantulkan langit fajar', subSize: 25 });
});

// 3. TANAM: Women farmers bend over in the flooded terrace, planting emerald rice seedlings (tandur) one by one.
shot('tanam', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1040, 990, ease.inOutSine(p)), z: 1.12 });
  K.morningSky(g, t, { sun: [660, 680], clouds: 4, seed: 14 });
  K.hills(g, { y: 980, amp: 75, color: K.PAL.hillFar, seed: 9 });
  K.mist(g, t, { y: 980, h: 95, a: 0.45 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 8, ripe: 0.08, water: 0.78, seed: 15 });

  // Newly planted rows of bright green seedlings appearing as they plant
  const rowsPlanted = Math.floor(lerp(3, 9, p));
  g.strokeStyle = '#78bd3e'; g.lineWidth = 5; g.lineCap = 'round';
  for (let r = 0; r < rowsPlanted; r++) {
    const ry = 1360 + r * 42;
    for (let c = 0; c < 11; c++) {
      const rx = 160 + c * 76 + (r % 2) * 20;
      for (let s = -1; s <= 1; s++) {
        g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx + s * 10 + Math.sin(t * 2 + c) * 3, ry - 26); g.stroke();
      }
    }
  }

  const dip1 = Math.sin(t * 3.2) * 0.25, dip2 = Math.sin(t * 3.2 + 1.8) * 0.25;
  K.figure(g, {
    x: 340, y: 1440, h: 420, face: 1, costume: 'petaniW', light: 1, t,
    pose: { bow: 0.68 + dip1 * 0.15, armF: [0.95 + dip1, 0.5], armB: [0.7, 0.8] },
  });
  K.figure(g, {
    x: 690, y: 1500, h: 450, face: -1, costume: 'petaniW', light: 1, t: t + 1,
    cos: { kebaya: '#4a7a96' },
    pose: { bow: 0.65 + dip2 * 0.15, armF: [0.95 + dip2, 0.5], armB: [0.7, 0.8] },
  });
  K.figure(g, {
    x: 520, y: 1330, h: 340, face: 1, costume: 'petani', light: 1, t: t + 2,
    pose: { bow: 0.6, armF: [1.0 - dip1, 0.55], armB: [0.75, 0.75] },
  });

  K.label(ui, 'MENANAM BIBIT (TANDUR)', 540, 270, { size: 42, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'melangkah mundur, menatap harapan ke depan', subSize: 24 });
});

// 4. RAWAT: Months of tending lush green terraces from bright noon to afternoon, accompanied by white paddy herons.
shot('rawat', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(560, 500, ease.inOutSine(p)), y: 980, z: 1.04 });
  K.morningSky(g, t, { sun: [360, 620], top: '#4a8ad4', mid: '#98c6ea', dawn: '#f4dfa8', clouds: 6, seed: 18 });
  K.volcano(g, 320, 960, { w: 540, h: 370, color: '#9ab2c0', light: 1 });
  K.hills(g, { y: 990, amp: 85, color: K.PAL.hillFar, seed: 12 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 9, ripe: 0.22, water: 0.15, seed: 19 });
  K.palm(g, 110, 1280, 680, { t, lean: 0.12 });
  K.hut(g, 870, 1180, 0.82);

  // Farmer standing on the bund wiping his brow and watching over the green valley
  K.figure(g, {
    x: 340, y: 1470, h: 450, face: 1, costume: 'petani', light: -1, t,
    pose: { lean: 0.04, head: -0.1, armF: [2.1, 1.35], armB: [0.2, 0.3] },
  });

  // Standing & flying white paddy herons (burung kuntul)
  K.blekok(g, 640, 1430, 0.9, t, { fly: false, seed: 1 });
  K.blekok(g, 730, 1460, 0.85, t, { fly: false, seed: 2 });
  for (let i = 0; i < 4; i++) {
    const bx = lerp(980, 160, clamp((p * 1.15 - i * 0.12))) + i * 55;
    const by = 780 + i * 45 + Math.sin(t * 2.5 + i) * 22;
    K.blekok(g, bx, by, 0.85 - i * 0.08, t, { fly: true, seed: i + 3 });
  }

  K.riceStalks(g, t, { y: 2040, h: 560, n: 55, ripe: 0.25, seed: 14 });
  K.label(ui, 'MENJAGA SAWAH', 540, 270, { size: 44, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'ditemani burung kuntul putih di lembah hijau', subSize: 25 });
});

// 5. HAMA: Strong wind sweeps the bamboo and paddies; the farmer shelters in his bamboo dangau hut in quiet prayer.
shot('hama', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1000, 960, p), z: 1.08 });
  K.morningSky(g, t, { sun: null, top: '#5e738c', mid: '#94a6b8', dawn: '#d8ccb4', clouds: 7, seed: 23 });
  K.hills(g, { y: 990, amp: 90, color: '#788c88', seed: 16 });
  K.mist(g, t, { y: 990, h: 130, a: 0.65, speed: 2.8, seed: 20 });
  K.terraces(g, t, { y0: 990, y1: 2280, rows: 8, ripe: 0.38, water: 0.1, seed: 21 });

  // Bamboo clump bending in the strong wind
  K.bamboo(g, 160, 1380, 840, { grow: 1, t: t * 2.2, n: 6 });
  // Field hut (dangau) in the foreground-midground
  K.hut(g, 640, 1420, 1.45);
  // Farmer sitting inside the dangau praying for the crops
  const pray = prog(t, W('hama', 'berdoa') - 0.2, b, ease.inOutSine);
  K.figure(g, {
    x: 635, y: 1255, h: 380, face: -1, costume: 'petani', light: -1, t, shadow: false,
    pose: { sit: 1, bow: 0.2, head: 0.15, armF: [1.35 + pray * 0.3, 1.2], armB: [1.2 + pray * 0.3, 1.2] },
  });

  // Diagonal wind streaks across the painting
  g.strokeStyle = 'rgba(245,248,240,0.35)'; g.lineWidth = 4;
  for (let i = 0; i < 16; i++) {
    const wx = ((i * 130 + t * 520) % 1600) - 200, wy = 520 + (i * 83) % 950;
    g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + 140, wy + 28); g.stroke();
  }

  K.riceStalks(g, t, { y: 2050, h: 600, n: 65, ripe: 0.4, wind: 2.1, seed: 22 });
  K.label(ui, 'BERTEDUH DI DANGAU', 540, 270, { size: 44, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'berdoa di tengah angin agar bulir padi selamat', subSize: 25 });
});

// 6. MENGUNING: Time-lapse miracle — the entire green valley ripens into a shimmering sea of heavy golden grain!
shot('menguning', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const ripeU = prog(t, W('menguning', 'berubah') - 0.3, W('menguning', 'emas') + 0.6, ease.inOutCubic);
  const g = K.view(P, { x: 540, y: lerp(1040, 960, ease.inOutSine(p)), z: lerp(1.12, 1.0, ease.inOutSine(p)) });

  K.morningSky(g, t, {
    sun: [540, lerp(820, 680, ripeU)],
    top: K.mix('#5a92ce', '#4c88cc', ripeU),
    mid: K.mix('#a6c8e6', '#f2d294', ripeU),
    dawn: K.mix('#f0d8a8', '#ffe498', ripeU),
    clouds: 5, seed: 27, glow: 0.9 + ripeU * 0.35,
  });
  K.volcano(g, 540, 940, { w: 620, h: 410, color: K.mix('#9fb6c4', '#b8b09c', ripeU), light: 1 });
  K.hills(g, { y: 980, amp: 85, color: K.mix(K.PAL.hillFar, '#c2ba92', ripeU * 0.6), seed: 19 });
  K.mist(g, t, { y: 980, h: 110, a: 0.5, color: '#fff8e2' });
  K.terraces(g, t, { y0: 990, y1: 2300, rows: 10, ripe: lerp(0.15, 1.0, ripeU), water: 0, seed: 25 });
  K.palm(g, 990, 1290, 740, { t, lean: -0.12 });
  K.palm(g, 80, 1260, 660, { t, lean: 0.1 });
  K.riceStalks(g, t, { y: 2050, h: 650, n: 75, ripe: lerp(0.2, 1.0, ripeU), seed: 28 });

  if (ripeU > 0.25) {
    K.title(ui, 'LAUTAN EMAS', 540, 290, { size: 96, alpha: env(t, W('menguning', 'emas') - 0.2, b, 0.25, 0.2), color: '#fff8dc' });
  }
});

// 7. PANEN: Joyful harvest morning (Panen Raya) — farmers gather in the golden terraces cutting sheaves of rice.
shot('panen', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: lerp(490, 590, ease.inOutSine(p)), y: 1000, z: 1.07 });
  K.morningSky(g, t, { sun: [820, 700], clouds: 5, seed: 31 });
  K.volcano(g, 260, 960, { w: 520, h: 360, color: '#a9bcc6' });
  K.hills(g, { y: 1000, amp: 80, color: K.PAL.hillFar, seed: 11 });
  K.mist(g, t, { y: 990, h: 90, a: 0.5 });
  K.terraces(g, t, { y0: 1000, y1: 2300, rows: 8, ripe: 0.98, seed: 13 });
  K.hut(g, 880, 1150, 0.82);
  K.palm(g, 1010, 1200, 700, { t, lean: -0.1 });

  const cut = Math.sin(t * 3.4) * 0.3;
  K.figure(g, { x: 250, y: 1370, h: 370, face: 1, costume: 'petani', light: 1, t, pose: { bow: 0.62, armF: [1.05 + cut, 0.55], armB: [0.8, 0.8] } });
  K.figure(g, { x: 480, y: 1450, h: 410, face: -1, costume: 'petaniW', light: 1, t: t + 1, pose: { bow: 0.52, armF: [0.95 - cut, 0.65], armB: [0.7, 0.85] } });

  // Farmer walking along the bund carrying a golden sheaf on her head
  const wx = lerp(1020, 740, p);
  K.figure(g, { x: wx, y: 1560, h: 510, face: -1, costume: 'petaniW', light: 1, t: t + 2, cos: { head: 'konde' }, pose: { walk: (t * 0.9) % 1, armF: [2.85, 0.3], armB: [0.2, 0.2] } });
  g.fillStyle = K.PAL.gold; g.save(); g.translate(wx + 10, 1560 - 510 * 1.02); g.rotate(-0.14);
  g.beginPath(); g.ellipse(0, 0, 110, 36, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = K.PAL.goldDeep; for (let k = -4; k <= 4; k++) g.fillRect(k * 24, -20, 6, 40);
  g.restore();

  K.riceStalks(g, t, { y: 2010, h: 520, n: 45, ripe: 1, seed: 8 });
  K.label(ui, 'PANEN RAYA', 540, 275, { size: 46, alpha: env(t, a + 0.1, b, 0.25, 0.2), sub: 'buah kesabaran para petani desa', subSize: 26 });
});

// 8. LESUNG: Village women pound golden grain in a wooden lesung while village children laugh and play nearby.
shot('lesung', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1020, 990, p), z: 1.08 });
  K.morningSky(g, t, { sun: [320, 680], clouds: 4, seed: 35 });
  K.hills(g, { y: 1020, amp: 80, color: K.PAL.hillFar, seed: 17 });
  // Warm village courtyard ground
  g.fillStyle = '#9a8458'; g.fillRect(-400, 1120, 1900, 1200);
  g.fillStyle = '#7c9a46'; g.fillRect(-400, 1080, 1900, 90);
  K.hut(g, 200, 1160, 1.05);
  K.bamboo(g, 960, 1220, 740, { grow: 1, t, n: 5 });

  // Wooden lesung trough in centre
  K.lesung(g, 500, 1500, 1.05);

  // Two women pounding rhythmically with wooden pestles (alu)
  const p1 = Math.sin(t * 7.5), p2 = Math.sin(t * 7.5 + Math.PI);
  const f1 = { x: 350, y: 1490, h: 490, face: 1, costume: 'petaniW', light: -1, t, cos: { head: 'konde' }, pose: { lean: 0.12 + Math.max(0, p1) * 0.1, armF: [1.3 - p1 * 0.35, 0.4], armB: [1.0, 0.6] } };
  const f2 = { x: 650, y: 1490, h: 490, face: -1, costume: 'petaniW', light: -1, t: t + 1, cos: { kebaya: '#4a7a8c', head: 'konde' }, pose: { lean: 0.12 + Math.max(0, p2) * 0.1, armF: [1.3 - p2 * 0.35, 0.4], armB: [1.0, 0.6] } };
  K.figure(g, f1);
  K.figure(g, f2);
  for (const fig of [f1, f2]) {
    const [hx, hy] = K.handPos(fig);
    g.strokeStyle = '#5c3a1e'; g.lineWidth = 13; g.lineCap = 'round';
    g.beginPath(); g.moveTo(hx, hy - 140); g.lineTo(hx + fig.face * 22, hy + 150); g.stroke();
  }

  // Joyful village kid running & cheering on the right
  const kx = lerp(920, 810, p);
  K.figure(g, {
    x: kx, y: 1540, h: 330, face: -1, costume: 'anak', light: -1, t,
    pose: { walk: (t * 1.6) % 1, armF: [2.2 + Math.sin(t * 8) * 0.3, 0.4], armB: [1.8, 0.5] },
  });

  K.label(ui, 'IRAMA LESUNG DESA', 540, 275, { size: 44, alpha: env(t, a + 0.15, b, 0.25, 0.2), sub: 'musik syukur di halaman kampung', subSize: 25 });
});

// 9. PERJALANAN: 100 days under the sun — golden sun arc over the valley as golden panicles pour into white rice.
shot('perjalanan', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: 980, z: 1.05 + 0.06 * p });

  // Sun travels in an arc across the sky representing 100 days
  const sunX = lerp(220, 860, ease.inOutSine(p));
  const sunY = 740 - Math.sin(p * Math.PI) * 220;
  K.morningSky(g, t, { sun: [sunX, sunY], clouds: 5, seed: 39, glow: 1.15 });
  K.volcano(g, 540, 960, { w: 580, h: 380, color: '#a5b8c2', light: sunX > 540 ? 1 : -1 });
  K.hills(g, { y: 990, amp: 80, color: K.PAL.hillFar, seed: 21 });
  K.terraces(g, t, { y0: 990, y1: 2250, rows: 9, ripe: 1.0, seed: 29 });

  // Foreground woven bamboo basket (tampah) filling with glistening white rice grains
  const fillU = prog(t, W('perjalanan', 'beras') - 0.3, b, ease.outCubic);
  K.riceBowl(g, 540, 1460, 1.15, t, { grains: clamp(0.3 + fillU * 0.7) });
  K.riceStalks(g, t, { y: 2050, h: 620, n: 60, ripe: 1.0, seed: 33 });

  const days = Math.floor(lerp(1, 100, ease.outCubic(clamp(p * 1.25))));
  K.title(ui, `${days} HARI`, 540, 280, { size: 96, alpha: env(t, a + 0.1, b, 0.2, 0.2) });
  K.label(ui, 'dari lumpur sawah menjadi beras putih bersih', 540, 400, { size: 32, alpha: env(t, a + 0.2, b, 0.25, 0.2) });
});

// 10. AKHIR: A steaming bowl of white rice on a woven mat by the window overlooking the golden terraces.
shot('akhir', null, (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const g = K.view(P, { x: 540, y: lerp(1000, 940, ease.inOutSine(p)), z: 1.0 + 0.08 * ease.inOutSine(p) });

  // Wooden window framing the countryside terraces
  g.fillStyle = '#6a4a30'; g.fillRect(-400, -400, 1900, 2800);
  g.save(); g.beginPath(); g.rect(100, 160, 880, 760); g.clip();
  K.morningSky(g, t, { sun: [640, 560], y0: 160, y1: 700, clouds: 3, seed: 41 });
  K.hills(g, { y: 700, amp: 60, color: K.PAL.hillFar, seed: 3 });
  K.terraces(g, t, { y0: 700, y1: 1000, rows: 5, ripe: 0.95, seed: 17, curve: 30 });
  K.figure(g, { x: 380, y: 860, h: 170, face: 1, costume: 'petani', light: 1, t, pose: { walk: (t * 0.7) % 1 } });
  g.restore();

  g.fillStyle = '#4a3020'; g.fillRect(520, 160, 40, 760); g.fillRect(100, 520, 880, 34);
  K.radial(g, 540, 600, 700, '#ffe2a8', 0.35);

  // Woven mat table
  g.fillStyle = '#c9a26a'; g.fillRect(-400, 1060, 1900, 1400);
  g.strokeStyle = '#a8804a'; g.lineWidth = 10;
  for (let x = -400; x < 1500; x += 60) { g.beginPath(); g.moveTo(x, 1060); g.lineTo(x - 200, 2200); g.stroke(); }

  K.riceBowl(g, 540, 1180, 1.08, t);

  const ta = env(t, W('akhir', 'keringat') - 0.3, AM.duration + 2, 0.35, 0.3);
  K.title(ui, 'TERIMA KASIH PETANI', 540, 290, { size: 84, alpha: ta });
  K.label(ui, 'ada doa dan keringat di setiap butir nasi', 540, 415, { size: 32, alpha: ta });
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

