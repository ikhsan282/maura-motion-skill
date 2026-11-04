// Buku Pop-up demo: "Roro Jonggrang & Seribu Candi" — five spreads of a pop-up book, four page turns (20 s).
import * as K from '/styles/buku-pop-up/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand, mulberry32 } = AM.lib;
const P = K.PAL, B = K.BOOK, TAU = Math.PI * 2;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', anim: 'rise', y: 1500, size: 62, maxWords: 4, box: { fill: 'rgba(251,245,230,.95)', pad: 16, radius: 10, border: '#3a2a1e', borderW: 3 } } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const FLIP = 0.75;
let flips;
export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  flips = ['syarat', 'jin', 'tipu', 'kutuk'].map((id) => C[id].start - 0.5);
  // sfx: page turns, a pop, the rice pestle, the rooster, the curse
  for (const f of flips) AM.sfx('page_flip', f + 0.05, { gain: 0.55 });
  AM.sfx('pop', 0.05, { gain: 0.4 });
  AM.sfx('thud', W('tipu', 'menumbuk'), { gain: 0.4, pitch: 1.3 });
  AM.sfx('bird', W('tipu', 'Ayam') + 0.05, { gain: 0.5, pitch: 0.8 });
  AM.sfx('gong', W('kutuk', 'arca') - 0.05, { gain: 0.5 });
  AM.sfx('chime', W('kutuk', 'Prambanan'), { gain: 0.3 });
}

// ---------------- printed leaves ----------------
const stars = (g, w, h, n, seed) => { const r = mulberry32(seed); for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h * 0.7, s = 1.5 + r() * 3.5; g.fillStyle = `rgba(255,244,200,${0.5 + r() * 0.5})`; g.beginPath(); for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU, rr = k % 2 ? s * 0.4 : s * 1.6; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.fill(); } };
const moon = (g, x, y, r) => { g.fillStyle = P.moon; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = 'rgba(200,180,120,.35)'; for (const [a, b, c] of [[-0.3, -0.2, 0.18], [0.25, 0.1, 0.12], [-0.1, 0.35, 0.1]]) { g.beginPath(); g.arc(x + a * r, y + b * r, c * r, 0, TAU); g.fill(); } };
const banner = (g, w, text) => { g.fillStyle = P.cover; g.beginPath(); g.moveTo(w * 0.18, 40); g.lineTo(w * 0.82, 40); g.lineTo(w * 0.86, 78); g.lineTo(w * 0.82, 116); g.lineTo(w * 0.18, 116); g.lineTo(w * 0.14, 78); g.closePath(); g.fill(); g.fillStyle = '#fbf5e6'; g.font = "700 46px 'Fredoka'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 80); };
const templeRow = (g, w, y, col, n = 9, sc = 1) => { g.fillStyle = col; for (let i = 0; i < n; i++) { const x = (i + 0.5) * (w / n), hh = (90 + (i % 3) * 30) * sc; g.beginPath(); g.moveTo(x - 30 * sc, y); g.lineTo(x - 26 * sc, y - hh * 0.5); g.lineTo(x - 14 * sc, y - hh * 0.8); g.lineTo(x, y - hh); g.lineTo(x + 14 * sc, y - hh * 0.8); g.lineTo(x + 26 * sc, y - hh * 0.5); g.lineTo(x + 30 * sc, y); g.fill(); } };
const LEAF = {
  night: () => K.leafArt('night', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#141c3e'); gr.addColorStop(0.7, P.night); gr.addColorStop(1, P.nightHi); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    stars(g, w, h, 110, 3); moon(g, w * 0.76, h * 0.26, 70);
    g.fillStyle = '#2a3566'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.72); g.quadraticCurveTo(w * 0.3, h * 0.5, w * 0.55, h * 0.7); g.lineTo(w, h * 0.62); g.lineTo(w, h); g.fill();
    templeRow(g, w, h * 0.92, '#1d2550', 11, 0.9);
    banner(g, w, 'Roro Jonggrang');
  }),
  grassN: () => K.leafArt('grassN', 1000, 780, (g, w, h) => {
    g.fillStyle = '#3e5a3a'; g.fillRect(0, 0, w, h);
    const r = mulberry32(8); for (let i = 0; i < 500; i++) { g.fillStyle = r() < 0.5 ? '#4c6e46' : '#33502f'; g.fillRect(r() * w, r() * h, 3, 9); }
    g.fillStyle = '#6b6a73'; for (let y = 40; y < h; y += 70) g.fillRect(w * 0.44, y, w * 0.12, 52);
    g.fillStyle = '#fbf5e6'; g.font = "600 30px 'Fredoka'"; g.textAlign = 'center'; g.fillText('Seribu candi... dalam semalam?', w / 2, h - 40);
  }),
  palace: () => K.leafArt('palace', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, P.skyHi); gr.addColorStop(1, P.sky); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f3c44b'; g.beginPath(); g.arc(w * 0.2, h * 0.26, 64, 0, TAU); g.fill();
    g.fillStyle = '#ffffff'; for (const [x, y, s] of [[0.62, 0.22, 1], [0.85, 0.34, 0.7], [0.36, 0.4, 0.8]]) { g.beginPath(); g.ellipse(w * x, h * y, 90 * s, 30 * s, 0, 0, TAU); g.ellipse(w * x + 40 * s, h * y - 20 * s, 50 * s, 30 * s, 0, 0, TAU); g.fill(); }
    // pendopo (joglo) palace
    g.fillStyle = '#7a3a22'; g.beginPath(); g.moveTo(w * 0.12, h * 0.62); g.lineTo(w * 0.36, h * 0.42); g.lineTo(w * 0.64, h * 0.42); g.lineTo(w * 0.88, h * 0.62); g.fill();
    g.fillStyle = '#9b4b2a'; g.beginPath(); g.moveTo(w * 0.3, h * 0.46); g.lineTo(w * 0.42, h * 0.33); g.lineTo(w * 0.58, h * 0.33); g.lineTo(w * 0.7, h * 0.46); g.fill();
    g.fillStyle = '#e8d3a6'; g.fillRect(w * 0.16, h * 0.62, w * 0.68, h * 0.24);
    g.fillStyle = '#5b2c18'; for (let i = 0; i < 7; i++) g.fillRect(w * (0.18 + i * 0.105), h * 0.62, 16, h * 0.24);
    g.fillStyle = P.gold; g.fillRect(w * 0.16, h * 0.6, w * 0.68, 14);
    g.fillStyle = P.grass; g.fillRect(0, h * 0.86, w, h * 0.14);
    banner(g, w, 'Keraton Prambanan');
  }),
  court: () => K.leafArt('court', 1000, 780, (g, w, h) => {
    for (let y = 0, r = 0; y < h; y += 60, r++) for (let x = 0, c = 0; x < w; x += 60, c++) { g.fillStyle = (r + c) % 2 ? '#c46a43' : '#d98a5c'; g.fillRect(x, y, 60, 60); }
    g.fillStyle = 'rgba(255,255,255,.15)'; for (let y = 0; y < h; y += 60) g.fillRect(0, y, w, 3);
  }),
  dawn: () => K.leafArt('dawn', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#26305e'); gr.addColorStop(0.5, '#8a4a6a'); gr.addColorStop(0.85, P.dawn); gr.addColorStop(1, P.dawnHi); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    stars(g, w, h * 0.5, 40, 9);
    g.fillStyle = '#3b2230'; for (let i = 0; i < 6; i++) { const x = w * (0.08 + i * 0.17); g.beginPath(); g.moveTo(x - 60, h * 0.9); g.lineTo(x, h * 0.8); g.lineTo(x + 60, h * 0.9); g.fill(); g.fillRect(x - 46, h * 0.9, 92, h * 0.1); }
    g.strokeStyle = '#3b2230'; g.lineWidth = 8; for (const x of [0.25, 0.7]) { g.beginPath(); g.moveTo(w * x, h); g.quadraticCurveTo(w * x + 20, h * 0.75, w * x - 10, h * 0.6); g.stroke(); g.fillStyle = '#3b2230'; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(w * x - 10 + Math.cos(k) * 50, h * 0.6 + Math.sin(k) * 14, 60, 12, k, 0, TAU); g.fill(); } }
    banner(g, w, 'Menjelang Subuh');
  }),
  yard: () => K.leafArt('yard', 1000, 780, (g, w, h) => {
    g.fillStyle = '#b98a55'; g.fillRect(0, 0, w, h);
    const r = mulberry32(5); for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,60,30,.25)' : 'rgba(255,230,180,.25)'; g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 4, 0, TAU); g.fill(); }
    g.fillStyle = '#e8c86a'; for (let i = 0; i < 6; i++) { const x = 80 + i * 170, y = 120 + (i % 2) * 300; for (let k = 0; k < 12; k++) g.fillRect(x + k * 4, y - k * 2, 3, 60); }
  }),
  sunrise: () => K.leafArt('sunrise', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6b38a'); gr.addColorStop(0.6, '#fbd8a6'); gr.addColorStop(1, '#fff1d0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff3c8'; g.beginPath(); g.arc(w * 0.78, h * 0.4, 90, 0, TAU); g.fill();
    templeRow(g, w, h * 0.95, '#b79c8c', 13, 0.8);
    g.fillStyle = '#a58a7a'; [[0.5, 1.9], [0.3, 1.3], [0.7, 1.3]].forEach(([x, s]) => { const cx = w * x, y = h * 0.96; g.beginPath(); g.moveTo(cx - 70 * s, y); g.lineTo(cx - 60 * s, y - 120 * s); g.lineTo(cx - 34 * s, y - 210 * s); g.lineTo(cx, y - 280 * s); g.lineTo(cx + 34 * s, y - 210 * s); g.lineTo(cx + 60 * s, y - 120 * s); g.lineTo(cx + 70 * s, y); g.fill(); });
    banner(g, w, 'Candi Prambanan');
  }),
  stone: () => K.leafArt('stone', 1000, 780, (g, w, h) => {
    g.fillStyle = '#b3a89c'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,70,60,.4)'; g.lineWidth = 3; for (let y = 0, r = 0; y < h; y += 52, r++) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (r % 2) * 50; x < w; x += 100) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 52); g.stroke(); } }
  }),
};

// ---------------- pieces ----------------
const gapura = () => K.card('gapura', 420, 460, (g, w, h) => {
  for (const sd of [0, 1]) { const x0 = sd ? w * 0.56 : 0; g.fillStyle = '#b4543a'; g.beginPath(); g.moveTo(x0, h); g.lineTo(x0 + w * 0.06, h * 0.3); g.lineTo(x0 + w * 0.2, h * 0.02); g.lineTo(x0 + w * 0.32, h * 0.3); g.lineTo(x0 + w * 0.44, h); g.fill(); g.fillStyle = '#8c3b27'; for (let y = h * 0.35; y < h; y += 40) g.fillRect(x0 + w * 0.06, y, w * 0.32, 8); }
});
const scrollCard = () => K.card('syarat', 520, 300, (g, w, h) => {
  g.fillStyle = '#f2e2b8'; g.fillRect(30, 20, w - 60, h - 40); g.fillStyle = '#c9a66b'; g.beginPath(); g.ellipse(30, h / 2, 26, h / 2 - 10, 0, 0, TAU); g.ellipse(w - 30, h / 2, 26, h / 2 - 10, 0, 0, TAU); g.fill();
  g.fillStyle = P.cover; g.font = "700 40px 'Fredoka'"; g.textAlign = 'center'; g.fillText('SYARAT:', w / 2, 82);
  g.fillStyle = P.ink; g.font = "700 64px 'Fredoka'"; g.fillText('1000 CANDI', w / 2, 160); g.font = "700 46px 'Fredoka'"; g.fillText('dalam 1 malam', w / 2, 222);
});
const flame = (k) => K.card('flame' + k, 200, 260, (g, w, h) => {
  const f = (col, s, o) => { g.fillStyle = col; g.beginPath(); g.moveTo(w / 2 - 70 * s, h); g.quadraticCurveTo(w / 2 - 90 * s + o, h * 0.4, w / 2 + o * 1.5, h * (1 - s)); g.quadraticCurveTo(w / 2 + 80 * s - o, h * 0.5, w / 2 + 70 * s, h); g.fill(); };
  f(P.fire, 0.95, k ? 14 : -10); f('#f7a535', 0.7, k ? -8 : 10); f(P.fireHi, 0.42, k ? 6 : -6);
}, { edge: 2 });
const kukuruyuk = () => K.card('kukuruyuk', 460, 170, (g, w, h) => {
  g.fillStyle = '#fff6d8'; g.beginPath(); g.ellipse(w / 2, h / 2 - 10, w / 2 - 10, h / 2 - 24, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(80, h - 40); g.lineTo(40, h - 2); g.lineTo(130, h - 46); g.fill();
  g.fillStyle = P.cover; g.font = "800 58px 'Fredoka'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('KUKURUYUK!', w / 2, h / 2 - 8);
});
const bush = (k) => K.card('bush' + k, 300, 200, (g, w, h) => { const r = mulberry32(k + 3); for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? P.grassDk : P.grass; g.beginPath(); g.arc(40 + r() * (w - 80), 60 + r() * (h - 80), 40 + r() * 30, 0, TAU); g.fill(); } g.fillStyle = '#fbf5e6'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(30 + r() * (w - 60), 40 + r() * (h - 70), 7, 0, TAU); g.fill(); } });
const ghostSlot = () => K.card('slot', 220, 360, (g, w, h) => { g.setLineDash([14, 10]); g.strokeStyle = '#ffe9a0'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = 'rgba(255,233,160,.18)'; g.fillRect(8, 8, w - 16, h - 16); g.setLineDash([]); g.fillStyle = '#ffe9a0'; g.font = "800 90px 'Fredoka'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', w / 2, h / 2); }, { cut: false });

// temple grid: rows of small candi that pop up in sequence
const GRID = (() => { const L = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) L.push({ x: -405 + c * 135 + (r % 2) * 30, d: 150 + r * 120, k: (r * 7 + c) }); return L; })();
function templeGrid(t, t0, step, frame, { skip = -1, tone = P.stone, scale = 1 } = {}) {
  for (const g of GRID) {
    if (g.k === skip) continue;
    const a = K.rise(t, t0 + g.k * step, 0.45);
    if (a <= 0.01) continue;
    K.standee(ctx, K.candi(g.k % 3 === 0 ? 1 : 0, 220, 360, tone), g.x, g.d, 112 * scale, 184 * scale, a, { frame, shadow: 0.28 });
  }
}

// ---------------- spreads (functions of time) ----------------
function S1(t) { // hook: a thousand temples; one missing; the princess turns to stone
  return { back: LEAF.night(), floor: LEAF.grassN(), pieces: (frame) => {
    const miss = 24;
    templeGrid(t, -0.9, 0.06, frame, { skip: miss });
    const g = GRID[miss];
    const kur = W('hook', 'Kurang'), bt = W('hook', 'batu');
    if (!frame) {
      if (t > kur - 0.1 && t < W('hook', 'putri')) K.standee(ctx, ghostSlot(), g.x, g.d, 112, 184, Math.PI / 2, { shadow: 0, alpha: 0.6 + 0.4 * Math.sin(t * 12) });
      const pa = K.rise(t, W('hook', 'putri') - 0.15, 0.5);
      if (pa > 0) K.figureIn(ctx, 'putri', g.x, g.d, 250, pa, { arm: 2.4 - 1.6 * clamp((t - bt) / 0.6), arm2: 0.3, stone: clamp((t - bt + 0.2) / 0.8), t });
    }
    K.standee(ctx, bush(1), -380, 700, 220, 140, K.rise(t, -0.3), { frame });
    K.standee(ctx, bush(2), 390, 690, 220, 140, K.rise(t, -0.2), { frame });
  } };
}
function S2(t) { // the refusal and the impossible condition
  return { back: LEAF.palace(), floor: LEAF.court(), pieces: (frame) => {
    const a0 = flips[0];
    K.standee(ctx, gapura(), 0, 140, 420, 460, K.rise(t, a0 + 0.4), { frame });
    const slide = ease.outCubic(clamp((t - W('syarat', 'Bandung') + 0.3) / 0.8));
    const ref = clamp((t - W('syarat', 'menolak') + 0.1) / 0.3);
    K.figureIn(ctx, 'bandung', lerp(-430, -250, slide), 470, 410, K.rise(t, a0 + 0.55), { arm: 0.3 + 1.0 * slide, arm2: 0.1, bob: Math.sin(t * 9) * 3 * (1 - slide) }, frame);
    K.figureIn(ctx, 'putri', 230, 500, 400, K.rise(t, a0 + 0.5), { face: -1, arm: 0.2 + 1.7 * ref, arm2: 0.2, t, closed: ref > 0.5 && hrand(Math.floor(t * 4), 2) < 0.2 }, frame);
    const sy = W('syarat', 'syarat');
    const sc = K.rise(t, sy - 0.15, 0.5);
    if (sc > 0) K.standee(ctx, scrollCard(), 0, 640, 360, 208, sc, { frame });
  } };
}
function S3(t) { // the jinn build; the wheel counts to 999
  return { back: LEAF.night(), floor: LEAF.grassN(), pieces: (frame) => {
    const a0 = flips[1];
    templeGrid(t, a0 + 0.35, 0.075, frame, { scale: 0.9 });
    for (let i = 0; i < 3; i++) {
      const x = [-330, 40, 330][i] + Math.sin(t * 1.6 + i * 2) * 60, d = [330, 520, 410][i];
      K.figureIn(ctx, 'jin', x, d, 230, K.rise(t, a0 + 0.5 + i * 0.1), { t, slot: i, arm: 0.5 + 0.5 * Math.sin(t * 4 + i) }, frame);
    }
    if (!frame || frame.F[2] === 1) {
      const n = Math.round(lerp(1, 999, ease.inOutCubic(clamp((t - a0 - 0.6) / (W('jin', 'seribu') + 0.4 - a0 - 0.6)))));
      K.volvelle(ctx, 300, 630, Math.max(1, n), { r: 120 });
    }
  } };
}
function S4(t) { // the trick: rice pounding, fires in the east, the rooster
  return { back: LEAF.dawn(), floor: LEAF.yard(), pieces: (frame) => {
    const a0 = flips[2];
    const fireK = clamp((t - W('tipu', 'menumbuk')) / 0.8);
    K.standee(ctx, flame(Math.floor(t * 8) % 2), 330, 120, 150 + 60 * fireK, 190 + 90 * fireK, K.rise(t, a0 + 0.5), { frame, shadow: 0 });
    K.standee(ctx, flame((Math.floor(t * 8) + 1) % 2), -360, 140, 120 + 40 * fireK, 150 + 60 * fireK, K.rise(t, a0 + 0.6), { frame, shadow: 0 });
    // jinn fleeing off the page
    const flee = clamp((t - W('tipu', 'jin')) / 0.7);
    for (let i = 0; i < 2; i++) if (flee < 1) K.figureIn(ctx, 'jin', [-200, 120][i] + (i ? 1 : -1) * flee * 700, 280, 200, K.rise(t, a0 + 0.45), { t, slot: 3 + i, arm: 1, block: false }, frame);
    const pound = (t - W('tipu', 'menumbuk') + 0.2) * 2.6;
    K.figureIn(ctx, 'warga', -250, 470, 330, K.rise(t, a0 + 0.5), { pound: t > W('tipu', 'menumbuk') - 0.2 ? pound : 0 }, frame);
    K.figureIn(ctx, 'warga', 140, 520, 330, K.rise(t, a0 + 0.6), { pound: t > W('tipu', 'menumbuk') - 0.2 ? pound + 0.5 : 0, slot: 1 }, frame);
    const ay = W('tipu', 'Ayam');
    const ra = K.rise(t, ay - 0.25, 0.4);
    if (ra > 0) K.figureIn(ctx, 'ayam', 340, 630, 220, ra, { crow: clamp((t - ay) / 0.3) * (0.7 + 0.3 * Math.sin(t * 20)) }, frame);
    if (!frame && t > ay + 0.05) K.standee(ctx, kukuruyuk(), 260, 660, 300, 110, K.rise(t, ay + 0.05, 0.35), { lift: 230, shadow: 0 });
  } };
}
function S5(t) { // the curse: she becomes the 1000th statue
  return { back: LEAF.sunrise(), floor: LEAF.stone(), pieces: (frame) => {
    const a0 = flips[3];
    K.standee(ctx, K.candi(1, 220, 360, '#a89a8c'), 0, 110, 360, 590, K.rise(t, a0 + 0.4), { frame });
    K.standee(ctx, K.candi(0, 220, 360, '#a89a8c'), -330, 170, 200, 330, K.rise(t, a0 + 0.5), { frame });
    K.standee(ctx, K.candi(0, 220, 360, '#a89a8c'), 330, 170, 200, 330, K.rise(t, a0 + 0.55), { frame });
    const ang = clamp((t - W('kutuk', 'murka')) / 0.4);
    K.figureIn(ctx, 'bandung', -290, 560, 400, K.rise(t, a0 + 0.6), { arm: 0.4 + 1.9 * ang, arm2: 0.2, angry: ang, bob: ang * Math.sin(t * 30) * 2 }, frame);
    const st = clamp((t - W('kutuk', 'arca') + 0.1) / 1.0);
    K.figureIn(ctx, 'putri', 130, 470, 390, K.rise(t, a0 + 0.55), { face: -1, arm: 2.2 * (1 - st * 0.2), arm2: 0.6, stone: st, t: t * (1 - st), closed: st > 0.3 }, frame);
  } };
}
const SPREADS = [S1, S2, S3, S4, S5];

export function render(t, AM) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.table(ctx, t);
  // which spread / flip?
  let i = 0; for (let k = 0; k < flips.length; k++) if (t >= flips[k]) i = k + 1;
  const inFlip = i > 0 && t < flips[i - 1] + FLIP;
  // camera: gentle drift, a push-in per spread, a small dip during flips
  const sp = i > 0 ? flips[i - 1] : 0, next = flips[i] ?? AM.duration, u = clamp((t - sp) / (next - sp));
  const push = [0.0, 0.18, 0.08, 0.14, 0.5][i] * ease.inOutSine(u);
  const sway = Math.sin(t * 0.5) * 60;
  let cam = { pos: [sway, 1650 - push * 300, 2700 - push * 650], look: [0, 300 + push * 30, 220 + push * 120], f: 2550, cy: 860 };
  if (i === 0) { // hook: dive to the empty slot when the princess appears, then back out for the page turn
    const z = ease.inOutCubic(clamp((t - W('hook', 'sang') + 0.3) / 0.7)) * (1 - ease.inOutCubic(clamp((t - flips[0] + 0.35) / 0.35)));
    cam = { pos: [lerp(sway, 30, z), lerp(1650, 1050, z), lerp(2700, 1700, z)], look: [lerp(0, 30, z), lerp(300, 170, z), lerp(220, 480, z)], f: 2550, cy: 860 };
  }
  K.camera(cam);
  K.bookBase(ctx);
  if (inFlip) K.spread(ctx, SPREADS[i - 1](t), { f: (t - flips[i - 1]) / FLIP, next: SPREADS[i](t) });
  else K.spread(ctx, SPREADS[i](t));
  // pull tab + hand during the trick
  if (i === 3 && !inFlip) K.pullTab(ctx, 420, ease.inOutCubic(clamp((t - W('tipu', 'Ayam') + 0.5) / 0.5)), { text: 'TARIK' });
  // labels (screen space)
  if (i === 0) {
    K.label(ctx, 'SERIBU CANDI', 540, 150, { size: 64, alpha: prog(t, 0, 0.35) });
    K.label(ctx, 'kurang satu...', 540, 250, { size: 46, alpha: prog(t, W('hook', 'Kurang') - 0.1, W('hook', 'Kurang') + 0.2), rot: 0.03 });
  }
  if (i === 1 && !inFlip) {
    const pb = K.project([-260, 480, 470]), pr = K.project([230, 480, 500]);
    K.label(ctx, 'Bandung Bondowoso', Math.max(250, pb[0]), pb[1] - 40, { size: 42, alpha: prog(t, W('syarat', 'Bandung') - 0.1, W('syarat', 'Bandung') + 0.2), rot: -0.04 });
    K.label(ctx, 'Roro Jonggrang', Math.min(820, pr[0] + 40), pr[1] - 120, { size: 42, alpha: prog(t, W('syarat', 'Roro') - 0.05, W('syarat', 'Roro') + 0.25), rot: 0.04, ink: P.cover });
  }
  if (i === 2 && !inFlip) K.label(ctx, 'jelang subuh...', 540, 170, { size: 48, alpha: prog(t, W('jin', 'Jelang') - 0.1, W('jin', 'Jelang') + 0.2) });
  if (i === 4 && !inFlip) {
    K.label(ctx, 'ARCA KE-1000', 540, 400, { size: 62, alpha: prog(t, W('kutuk', 'arca') - 0.05, W('kutuk', 'arca') + 0.25), ink: P.cover });
    K.label(ctx, 'Candi Prambanan, abad ke-9', 540, 505, { size: 38, alpha: prog(t, W('kutuk', 'Prambanan') - 0.1, W('kutuk', 'Prambanan') + 0.2), rot: 0.03 });
  }
  // finish: soft lamp vignette, and a gentle close
  AM.lib.vignette(ctx, { strength: 0.42, inner: 0.45 });
  const close = clamp((t - (C.kutuk.end + 0.75)) / 0.45);
  if (close > 0) { ctx.fillStyle = `rgba(20,10,4,${close * 0.55})`; ctx.fillRect(0, 0, 1080, 1920); }
}
