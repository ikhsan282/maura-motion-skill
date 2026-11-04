// Buku Pop-up demo2: "Timun Mas & Empat Bungkusan Ajaib" — 5 spreads of a pop-up book (55s).
import * as K from '/styles/buku-pop-up/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand, mulberry32 } = AM.lib;
const P = K.PAL, B = K.BOOK, TAU = Math.PI * 2;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', anim: 'rise', y: 1500, size: 62, maxWords: 4, box: { fill: 'rgba(251,245,230,.95)', pad: 16, radius: 10, border: '#3a2a1e', borderW: 3 } } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const FLIP = 0.78;
let flips;

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  // 5 spreads:
  // S1: hook + janji + bekal (Desa & Ladang Ketimun Emas)
  // S2: biji + jarum (Sulur Mentimun & Hutan Bambu Runcing)
  // S3: garam (Samudra Garam Berombak)
  // S4: terasi + lumpur (Kawah Lumpur Mendidih)
  // S5: moral (Kepulangan Timun Mas ke Gubuk Mbok Srini)
  flips = ['biji', 'garam', 'terasi', 'moral'].map((id) => C[id].start - 0.45);
  for (const f of flips) AM.sfx('page_flip', f + 0.05, { gain: 0.55 });
  AM.sfx('pop', 0.08, { gain: 0.42 });
  AM.sfx('chime', W('janji', 'ketimun'), { gain: 0.38 });
  AM.sfx('thud', W('biji', 'mengguncang'), { gain: 0.48, pitch: 0.75 });
  AM.sfx('whoosh', W('jarum', 'bambu'), { gain: 0.45, pitch: 1.2 });
  AM.sfx('bubble', W('garam', 'samudra'), { gain: 0.45, pitch: 0.85 });
  AM.sfx('gong', W('lumpur', 'mendidih'), { gain: 0.5, pitch: 0.8 });
  AM.sfx('chime', W('moral', 'keberanian'), { gain: 0.35 });
}

const banner = (g, w, text, col = P.cover) => {
  g.fillStyle = col;
  g.beginPath(); g.moveTo(w * 0.16, 40); g.lineTo(w * 0.84, 40); g.lineTo(w * 0.88, 78); g.lineTo(w * 0.84, 116); g.lineTo(w * 0.16, 116); g.lineTo(w * 0.12, 78); g.closePath(); g.fill();
  g.fillStyle = '#fbf5e6'; g.font = "700 44px 'Fredoka'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 80);
};

// ---------------- printed leaves ----------------
const LEAF = {
  villageBack: () => K.leafArt('tm-villageB', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, P.skyHi); gr.addColorStop(0.65, P.sky); gr.addColorStop(1, '#cde6b8');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f7c852'; g.beginPath(); g.arc(w * 0.8, h * 0.24, 65, 0, TAU); g.fill();
    g.fillStyle = '#6d9b58'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.68); g.quadraticCurveTo(w * 0.32, h * 0.46, w * 0.65, h * 0.7); g.lineTo(w, h * 0.56); g.lineTo(w, h); g.fill();
    g.fillStyle = P.grass; g.fillRect(0, h * 0.82, w, h * 0.18);
    banner(g, w, 'Kisah Timun Mas');
  }),
  villageFloor: () => K.leafArt('tm-villageF', 1000, 780, (g, w, h) => {
    g.fillStyle = '#79a653'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c89b62'; g.beginPath(); g.moveTo(w * 0.36, 0); g.quadraticCurveTo(w * 0.52, h * 0.5, w * 0.42, h); g.lineTo(w * 0.64, h); g.quadraticCurveTo(w * 0.68, h * 0.5, w * 0.52, 0); g.fill();
    const r = mulberry32(11);
    for (let i = 0; i < 360; i++) { g.fillStyle = r() < 0.5 ? '#5c873c' : '#94be6a'; g.fillRect(r() * w, r() * h, 4, 10); }
  }),
  forestBack: () => K.leafArt('tm-forestB', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#c6e4b8'); gr.addColorStop(0.6, '#6ca162'); gr.addColorStop(1, '#396238');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) {
      const x = (i + 0.5) * (w / 16);
      g.fillStyle = i % 2 ? '#4d7f46' : '#3d6938'; g.fillRect(x - 14, h * 0.15, 28, h * 0.85);
      g.strokeStyle = '#92c27c'; g.lineWidth = 3;
      for (let y = 200; y < h; y += 95) { g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 14, y); g.stroke(); }
    }
    banner(g, w, 'Bungkusan 1 & 2: Hutan Bambu', '#3b6e38');
  }),
  forestFloor: () => K.leafArt('tm-forestF', 1000, 780, (g, w, h) => {
    g.fillStyle = '#4f7742'; g.fillRect(0, 0, w, h);
    const r = mulberry32(21);
    for (let i = 0; i < 400; i++) { g.fillStyle = r() < 0.5 ? '#3b5c31' : '#739e5c'; g.fillRect(r() * w, r() * h, 5, 11); }
  }),
  seaBack: () => K.leafArt('tm-seaB', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#dff4fa'); gr.addColorStop(0.55, '#6cb7d6'); gr.addColorStop(1, '#1e5e88');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff';
    for (const [x, y, s] of [[0.24, 0.25, 0.9], [0.74, 0.22, 1.1], [0.52, 0.34, 0.75]]) {
      g.beginPath(); g.ellipse(w * x, h * y, 90 * s, 32 * s, 0, 0, TAU); g.fill();
    }
    banner(g, w, 'Bungkusan Ke-3: Lautan Garam', '#1f5a82');
  }),
  seaFloor: () => K.leafArt('tm-seaF', 1000, 780, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1c5c85'); gr.addColorStop(1, '#2b82b0');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 4;
    for (let y = 70; y < h; y += 90) {
      g.beginPath();
      for (let x = 0; x <= w; x += 50) g.lineTo(x, y + Math.sin(x * 0.05 + y) * 14);
      g.stroke();
    }
  }),
  mudBack: () => K.leafArt('tm-mudB', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a221c'); gr.addColorStop(0.5, '#7e3624'); gr.addColorStop(1, '#d96b2b');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f6b44e'; g.beginPath(); g.arc(w * 0.5, h * 0.72, 220, Math.PI, 0); g.fill();
    banner(g, w, 'Bungkusan Ke-4: Lumpur Mendidih', '#8c281e');
  }),
  mudFloor: () => K.leafArt('tm-mudF', 1000, 780, (g, w, h) => {
    g.fillStyle = '#5c3824'; g.fillRect(0, 0, w, h);
    for (let k = 4; k >= 1; k--) {
      g.fillStyle = k % 2 ? '#78482e' : '#9c562c';
      g.beginPath(); g.ellipse(w * 0.5, h * 0.52, k * 105, k * 68, 0, 0, TAU); g.fill();
    }
    g.fillStyle = '#e07a32'; g.beginPath(); g.ellipse(w * 0.5, h * 0.52, 130, 80, 0, 0, TAU); g.fill();
  }),
};

// ---------------- custom pop-up cards ----------------
const hutCard = () => K.card('tm-hut', 380, 360, (g, w, h) => {
  g.fillStyle = '#8b5a2b'; g.fillRect(w * 0.16, h * 0.46, w * 0.68, h * 0.52);
  g.strokeStyle = '#5c3818'; g.lineWidth = 4;
  for (let x = w * 0.2; x < w * 0.82; x += 24) { g.beginPath(); g.moveTo(x, h * 0.46); g.lineTo(x, h * 0.98); g.stroke(); }
  g.fillStyle = '#3d2310'; g.fillRect(w * 0.42, h * 0.6, w * 0.18, h * 0.38);
  g.fillStyle = '#b56e2e'; g.beginPath(); g.moveTo(w * 0.04, h * 0.5); g.lineTo(w * 0.5, h * 0.08); g.lineTo(w * 0.96, h * 0.5); g.closePath(); g.fill();
  g.fillStyle = '#d48c42'; g.beginPath(); g.moveTo(w * 0.12, h * 0.46); g.lineTo(w * 0.5, h * 0.14); g.lineTo(w * 0.88, h * 0.46); g.closePath(); g.fill();
});

const goldenMelon = () => K.card('tm-melon', 280, 220, (g, w, h) => {
  const gr = g.createRadialGradient(w * 0.45, h * 0.45, 10, w * 0.5, h * 0.55, 120);
  gr.addColorStop(0, '#fff5b8'); gr.addColorStop(0.5, '#f2b830'); gr.addColorStop(1, '#b87d14');
  g.fillStyle = gr; g.beginPath(); g.ellipse(w * 0.5, h * 0.58, 112, 72, 0, 0, TAU); g.fill();
  g.strokeStyle = '#8f5e0a'; g.lineWidth = 4;
  for (const s of [-0.5, -0.2, 0.2, 0.5]) { g.beginPath(); g.ellipse(w * 0.5, h * 0.58, 110, Math.abs(s) * 70, 0, 0, TAU); g.stroke(); }
});

const pouchDisplay = () => K.card('tm-pouches', 520, 220, (g, w, h) => {
  g.fillStyle = '#fbf2dc'; g.fillRect(16, 16, w - 32, h - 32);
  g.strokeStyle = P.cover; g.lineWidth = 4; g.strokeRect(24, 24, w - 48, h - 48);
  const items = [['1. BIJI', '#6ca148'], ['2. JARUM', '#c8a656'], ['3. GARAM', '#5da7cc'], ['4. TERASI', '#b8462b']];
  items.forEach(([txt, col], i) => {
    const cx = 78 + i * 120, cy = h * 0.48;
    g.fillStyle = col; g.beginPath(); g.arc(cx, cy + 8, 32, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(cx - 18, cy - 28); g.lineTo(cx + 18, cy - 28); g.lineTo(cx + 8, cy - 10); g.lineTo(cx - 8, cy - 10); g.fill();
    g.fillStyle = P.ink; g.font = "700 22px 'Fredoka'"; g.textAlign = 'center'; g.fillText(txt, cx, h - 36);
  });
});

const bambooClump = (k) => K.card('tm-bamboo' + k, 220, 440, (g, w, h) => {
  const cols = ['#4a8238', '#68a652', '#39682a'];
  for (let i = 0; i < 5; i++) {
    const x = 34 + i * 38;
    g.fillStyle = cols[i % 3];
    g.beginPath(); g.moveTo(x - 11, h); g.lineTo(x - 9, 44 + (i % 2) * 24); g.lineTo(x, 8 + (i % 2) * 20); g.lineTo(x + 9, 44 + (i % 2) * 24); g.lineTo(x + 11, h); g.fill();
    g.strokeStyle = '#b7e099'; g.lineWidth = 3;
    for (let y = 90; y < h; y += 75) { g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x + 10, y); g.stroke(); }
  }
});

const vineCard = () => K.card('tm-vine', 460, 260, (g, w, h) => {
  g.strokeStyle = '#3b7a2e'; g.lineWidth = 10; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    g.beginPath(); g.moveTo(20 + i * 85, h); g.bezierCurveTo(40 + i * 70, h * 0.5, 90 + i * 65, h * 0.3, 60 + i * 80, 24); g.stroke();
  }
  g.fillStyle = '#e8b32b';
  for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(60 + i * 56, 80 + (i % 2) * 70, 24, 15, 0.4, 0, TAU); g.fill(); }
});

const waveCard = (k) => K.card('tm-wave' + k, 640, 230, (g, w, h) => {
  g.fillStyle = k % 2 ? '#1f6c9c' : '#2e8bc0';
  g.beginPath(); g.moveTo(0, h);
  for (let i = 0; i < 5; i++) {
    const x0 = i * (w / 5);
    g.quadraticCurveTo(x0 + 40, 20, x0 + 95, 55);
    g.quadraticCurveTo(x0 + 115, 95, x0 + w / 5, 85);
  }
  g.lineTo(w, h); g.closePath(); g.fill();
  g.fillStyle = '#fbf5e6';
  for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(65 + i * (w / 5), 52, 20, Math.PI * 0.8, Math.PI * 2.1); g.fill(); }
});

const mudSplash = (k) => K.card('tm-mud' + k, 460, 240, (g, w, h) => {
  g.fillStyle = k ? '#8f4722' : '#b85a28';
  g.beginPath(); g.moveTo(30, h);
  g.quadraticCurveTo(80, 30, 160, 90); g.quadraticCurveTo(230, 10, 310, 85); g.quadraticCurveTo(380, 35, 430, h);
  g.closePath(); g.fill();
  g.fillStyle = '#f29f3d';
  for (const [x, y, r] of [[120, 120, 22], [230, 95, 28], [330, 130, 20]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
});

// ---------------- 5 spreads ----------------
function S1(t) { // Desa, Ketimun Emas & 4 Bungkusan Ajaib
  return { back: LEAF.villageBack(), floor: LEAF.villageFloor(), pieces: (frame) => {
    K.standee(ctx, hutCard(), -250, 180, 340, 320, K.rise(t, -0.3), { frame });
    K.standee(ctx, goldenMelon(), 220, 310, 240, 190, K.rise(t, W('janji', 'ketimun') - 0.3, 0.5), { frame });
    K.figureIn(ctx, 'warga', -180, 440, 330, K.rise(t, 0.1), { pound: 0 }, frame);
    K.figureIn(ctx, 'putri', 120, 480, 320, K.rise(t, W('janji', 'Timun') - 0.3, 0.5), { face: -1, arm: 0.4 + 0.3 * Math.sin(t * 3), t }, frame);
    const bk = W('bekal', 'empat');
    const pa = K.rise(t, bk - 0.2, 0.5);
    if (pa > 0) K.standee(ctx, pouchDisplay(), 0, 650, 440, 186, pa, { frame });
  } };
}

function S2(t) { // Biji Mentimun & Hutan Bambu Runcing
  return { back: LEAF.forestBack(), floor: LEAF.forestFloor(), pieces: (frame) => {
    const a0 = flips[0];
    const bj = W('biji', 'biji'), jr = W('jarum', 'bambu');
    // Buto Ijo chasing from left
    const step = Math.sin(t * 6) * 8;
    K.figureIn(ctx, 'buto', -250, 390, 450, K.rise(t, a0 + 0.4), { arm: 0.8 + 0.4 * Math.sin(t * 5), bob: step, t }, frame);
    // Vines pop up on "biji"
    const va = K.rise(t, bj - 0.2, 0.45);
    if (va > 0) K.standee(ctx, vineCard(), -140, 470, 380, 215, va, { frame });
    // Bamboo forest pops up in rows on "bambu"
    for (let i = 0; i < 5; i++) {
      const ba = K.rise(t, jr - 0.25 + i * 0.08, 0.45);
      if (ba > 0) K.standee(ctx, bambooClump(i % 2), -260 + i * 130, 250 + (i % 2) * 190, 190, 380, ba, { frame });
    }
    K.figureIn(ctx, 'putri', 290, 560, 320, K.rise(t, a0 + 0.5), { arm: 1.2 + 0.4 * Math.sin(t * 6), t }, frame);
  } };
}

function S3(t) { // Samudra Garam
  return { back: LEAF.seaBack(), floor: LEAF.seaFloor(), pieces: (frame) => {
    const a0 = flips[1];
    for (let r = 0; r < 3; r++) {
      const sx = Math.sin(t * 2.2 + r * 1.5) * 45;
      K.standee(ctx, waveCard(r), sx, 220 + r * 170, 580, 200, K.rise(t, a0 + 0.35 + r * 0.12), { frame });
    }
    K.figureIn(ctx, 'buto', -120 + Math.sin(t * 2) * 35, 360, 420, K.rise(t, a0 + 0.5), { arm: 1.3 + 0.5 * Math.sin(t * 7), sink: 0.35, t }, frame);
    K.figureIn(ctx, 'putri', 310, 610, 310, K.rise(t, a0 + 0.45), { face: -1, arm: 0.9, t }, frame);
    if (!frame || frame.F[2] === 1) K.volvelle(ctx, -310, 630, 3, { r: 105, label: 'BUNGKUS' });
  } };
}

function S4(t) { // Kawah Lumpur Mendidih (Terasi)
  return { back: LEAF.mudBack(), floor: LEAF.mudFloor(), pieces: (frame) => {
    const a0 = flips[2];
    const lp = W('lumpur', 'mendidih');
    const sink = clamp((t - lp + 0.2) / 2.2);
    K.standee(ctx, mudSplash(0), -40, 290, 420, 210, K.rise(t, a0 + 0.4), { frame });
    K.figureIn(ctx, 'buto', -20, 380, 440, K.rise(t, a0 + 0.45), { arm: 1.6, arm2: 1.4, sink, bob: Math.sin(t * 12) * 4 * (1 - sink) }, frame);
    K.standee(ctx, mudSplash(1), 10, 460, 440, 220, K.rise(t, a0 + 0.55), { frame });
    K.figureIn(ctx, 'putri', 310, 590, 320, K.rise(t, a0 + 0.5), { face: -1, arm: 1.4 * (1 - sink), t }, frame);
    if (!frame || frame.F[2] === 1) K.volvelle(ctx, -310, 630, 4, { r: 105, label: 'TERASI' });
  } };
}

function S5(t) { // Moral & Kepulangan
  return { back: LEAF.villageBack(), floor: LEAF.villageFloor(), pieces: (frame) => {
    const a0 = flips[3];
    K.standee(ctx, hutCard(), 0, 190, 380, 350, K.rise(t, a0 + 0.35), { frame });
    K.figureIn(ctx, 'warga', -150, 480, 340, K.rise(t, a0 + 0.45), { pound: 0 }, frame);
    K.figureIn(ctx, 'putri', 130, 490, 330, K.rise(t, a0 + 0.5), { face: -1, arm: 0.7 + 0.25 * Math.sin(t * 3), t }, frame);
  } };
}

const SPREADS = [S1, S2, S3, S4, S5];

export function render(t, AM) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.table(ctx, t);
  let i = 0; for (let k = 0; k < flips.length; k++) if (t >= flips[k]) i = k + 1;
  const inFlip = i > 0 && t < flips[i - 1] + FLIP;
  const sp = i > 0 ? flips[i - 1] : 0, next = flips[i] ?? AM.duration, u = clamp((t - sp) / (next - sp));
  const push = [0.1, 0.16, 0.14, 0.22, 0.18][i] * ease.inOutSine(u);
  const sway = Math.sin(t * 0.45) * 55;
  const cam = { pos: [sway, 1650 - push * 260, 2700 - push * 550], look: [0, 300 + push * 30, 220 + push * 100], f: 2550, cy: 860 };
  K.camera(cam);
  K.bookBase(ctx);
  if (inFlip) K.spread(ctx, SPREADS[i - 1](t), { f: (t - flips[i - 1]) / FLIP, next: SPREADS[i](t) });
  else K.spread(ctx, SPREADS[i](t));

  if (i === 1 && !inFlip) K.pullTab(ctx, 430, ease.inOutCubic(clamp((t - W('jarum', 'bambu') + 0.3) / 0.7)), { text: 'BAMBU' });
  if (i === 3 && !inFlip) K.pullTab(ctx, 430, ease.inOutCubic(clamp((t - W('lumpur', 'mendidih') + 0.3) / 0.7)), { text: 'LUMPUR' });

  // Screen-space paper labels
  if (i === 0 && !inFlip) {
    K.label(ctx, 'TIMUN MAS & BUTO IJO', 540, 140, { size: 54, alpha: prog(t, 0, 0.35) });
    K.label(ctx, '4 Bungkusan Ajaib', 540, 1380, { size: 42, alpha: prog(t, W('bekal', 'empat') - 0.1, W('bekal', 'empat') + 0.25), rot: 0.02, ink: P.cover });
  }
  if (i === 1 && !inFlip) {
    K.label(ctx, '1. Biji Mentimun → Sulur Lebat', 540, 140, { size: 44, alpha: prog(t, W('biji', 'biji') - 0.1, W('biji', 'biji') + 0.25) });
    K.label(ctx, '2. Jarum → Hutan Bambu Runcing', 540, 1380, { size: 44, alpha: prog(t, W('jarum', 'bambu') - 0.1, W('jarum', 'bambu') + 0.25), rot: -0.02, ink: '#2d5e29' });
  }
  if (i === 2 && !inFlip) {
    K.label(ctx, '3. Garam → Samudra Luas', 540, 160, { size: 48, alpha: prog(t, W('garam', 'samudra') - 0.1, W('garam', 'samudra') + 0.25), ink: '#1f5a82' });
  }
  if (i === 3 && !inFlip) {
    K.label(ctx, '4. Terasi → Lumpur Mendidih!', 540, 160, { size: 48, alpha: prog(t, W('lumpur', 'mendidih') - 0.1, W('lumpur', 'mendidih') + 0.25), ink: P.cover });
  }
  if (i === 4 && !inFlip) {
    K.label(ctx, 'CERDIK & PEMBERANI', 540, 160, { size: 54, alpha: prog(t, W('moral', 'keberanian') - 0.1, W('moral', 'keberanian') + 0.25), ink: P.cover });
  }

  AM.lib.vignette(ctx, { strength: 0.42, inner: 0.45 });
  const close = clamp((t - (C.moral.end + 0.75)) / 0.45);
  if (close > 0) { ctx.fillStyle = `rgba(20,10,4,${close * 0.55})`; ctx.fillRect(0, 0, 1080, 1920); }
}
