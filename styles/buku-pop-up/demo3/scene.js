// Buku Pop-up demo3: "Keajaiban Candi Borobudur — Dua Juta Balok Batu Tanpa Semen" — 5 spreads (55s).
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
  // S1: hook + bukit (Bukit Kedu & Siluet Agung Candi Borobudur)
  // S2: kunci (Sambungan Batu Ekor Burung & Drainase Makara Tanpa Semen)
  // S3: relief + mandala (2.672 Panel Relief & Pematung Syailendra)
  // S4: arupadhatu (72 Stupa Terawang & Stupa Induk Puncak)
  // S5: abu + warisan (Merapi, Pemugaran & Warisan Dunia Menyapa Fajar)
  flips = ['kunci', 'relief', 'arupadhatu', 'abu'].map((id) => C[id].start - 0.45);
  for (const f of flips) AM.sfx('page_flip', f + 0.05, { gain: 0.55 });
  AM.sfx('pop', 0.08, { gain: 0.42 });
  AM.sfx('thud', W('kunci', 'mengunci'), { gain: 0.48, pitch: 0.9 });
  AM.sfx('tap', W('relief', 'memahat'), { gain: 0.45, pitch: 1.3 });
  AM.sfx('gong', W('arupadhatu', 'stupa'), { gain: 0.48 });
  AM.sfx('chime', W('warisan', 'Borobudur'), { gain: 0.38 });
}

const banner = (g, w, text, col = P.cover) => {
  g.fillStyle = col;
  g.beginPath(); g.moveTo(w * 0.15, 40); g.lineTo(w * 0.85, 40); g.lineTo(w * 0.89, 78); g.lineTo(w * 0.85, 116); g.lineTo(w * 0.15, 116); g.lineTo(w * 0.11, 78); g.closePath(); g.fill();
  g.fillStyle = '#fbf5e6'; g.font = "700 44px 'Fredoka'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 80);
};

// ---------------- printed leaves ----------------
const LEAF = {
  keduBack: () => K.leafArt('bb-keduB', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#dff0f4'); gr.addColorStop(0.55, '#a8d5e5'); gr.addColorStop(1, '#c8dfb8');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // Twin mountains (Merapi & Merbabu) in background
    g.fillStyle = '#6c8594';
    g.beginPath(); g.moveTo(w * 0.45, h * 0.82); g.lineTo(w * 0.72, h * 0.34); g.lineTo(w * 0.98, h * 0.82); g.fill();
    g.fillStyle = '#829aa8';
    g.beginPath(); g.moveTo(w * 0.05, h * 0.82); g.lineTo(w * 0.32, h * 0.44); g.lineTo(w * 0.62, h * 0.82); g.fill();
    g.fillStyle = P.grass; g.fillRect(0, h * 0.82, w, h * 0.18);
    banner(g, w, 'Dataran Kedu, Abad ke-8');
  }),
  keduFloor: () => K.leafArt('bb-keduF', 1000, 780, (g, w, h) => {
    g.fillStyle = '#759f54'; g.fillRect(0, 0, w, h);
    // Mandala concentric stone square on floor
    g.fillStyle = '#9a8f86'; g.fillRect(w * 0.16, h * 0.12, w * 0.68, h * 0.74);
    g.strokeStyle = '#6d635c'; g.lineWidth = 4;
    for (let k = 0; k < 3; k++) g.strokeRect(w * (0.18 + k * 0.06), h * (0.15 + k * 0.07), w * (0.64 - k * 0.12), h * (0.68 - k * 0.14));
  }),
  stoneBack: () => K.leafArt('bb-stoneB', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4e7ce'); gr.addColorStop(1, '#d8c5a2');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // Blueprint grid lines on paper
    g.strokeStyle = 'rgba(90,65,40,0.18)'; g.lineWidth = 2;
    for (let x = 0; x < w; x += 50) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    banner(g, w, 'Teknik Kunci Batu Tanpa Semen', '#5c4838');
  }),
  stoneFloor: () => K.leafArt('bb-stoneF', 1000, 780, (g, w, h) => {
    g.fillStyle = '#a89d92'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#6d635c'; g.lineWidth = 3;
    for (let y = 0, r = 0; y < h; y += 60, r++) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
      for (let x = (r % 2) * 55; x < w; x += 110) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 60); g.stroke(); }
    }
  }),
  galleryBack: () => K.leafArt('bb-galB', 1000, 1060, (g, w, h) => {
    g.fillStyle = '#8b8075'; g.fillRect(0, 0, w, h);
    // Carved stone gallery wall background
    for (let r = 0; r < 4; r++) {
      const y = 160 + r * 210;
      g.fillStyle = r % 2 ? '#9c9084' : '#7b7066'; g.fillRect(40, y, w - 80, 180);
      g.strokeStyle = '#574e46'; g.lineWidth = 4; g.strokeRect(40, y, w - 80, 180);
    }
    banner(g, w, 'Lorong Kamadhatu & Rupadhatu', '#7a4a24');
  }),
  arupaBack: () => K.leafArt('bb-arupaB', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1e2b58'); gr.addColorStop(0.55, '#596ea8'); gr.addColorStop(1, '#f3b778');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffe9a6'; g.beginPath(); g.arc(w * 0.5, h * 0.42, 170, 0, TAU); g.fill();
    banner(g, w, 'Pelataran Puncak Arupadhatu', '#2b3b70');
  }),
  arupaFloor: () => K.leafArt('bb-arupaF', 1000, 780, (g, w, h) => {
    g.fillStyle = '#9a8f86'; g.fillRect(0, 0, w, h);
    for (let k = 3; k >= 1; k--) {
      g.fillStyle = k % 2 ? '#b0a59b' : '#857b72';
      g.beginPath(); g.ellipse(w * 0.5, h * 0.5, k * 145, k * 105, 0, 0, TAU); g.fill();
      g.strokeStyle = '#5c534c'; g.lineWidth = 4; g.stroke();
    }
  }),
  dawnBack: () => K.leafArt('bb-dawnB', 1000, 1060, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f4a261'); gr.addColorStop(0.55, '#f9d48b'); gr.addColorStop(1, '#fff3d1');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff8dc'; g.beginPath(); g.arc(w * 0.76, h * 0.34, 88, 0, TAU); g.fill();
    g.fillStyle = '#8b7368'; g.beginPath(); g.moveTo(w * 0.48, h * 0.88); g.lineTo(w * 0.76, h * 0.38); g.lineTo(w, h * 0.88); g.fill();
    banner(g, w, 'Mahakarya Abadi Nusantara', P.cover);
  }),
};

// ---------------- custom pop-up cards ----------------
const borobudurTier = (tier = 0, w = 680, h = 260) => K.card(`bb-tier:${tier}:${w}:${h}`, w, h, (g) => {
  const tone = tier % 2 ? '#9a8f86' : '#afa49a', dk = '#6d635c';
  g.fillStyle = tone; g.fillRect(20, h * 0.35, w - 40, h * 0.65);
  g.strokeStyle = dk; g.lineWidth = 4; g.strokeRect(20, h * 0.35, w - 40, h * 0.65);
  // Row of small stupas and niches along the terrace top
  const n = 7 - tier;
  for (let i = 0; i < n; i++) {
    const cx = 65 + i * ((w - 130) / Math.max(1, n - 1));
    g.fillStyle = dk; g.fillRect(cx - 18, h * 0.45, 36, h * 0.45);
    g.fillStyle = tone;
    g.beginPath(); g.arc(cx, h * 0.35, 22, Math.PI, 0); g.fill(); g.stroke();
    g.fillRect(cx - 5, h * 0.12, 10, h * 0.16);
  }
});

const stupaCard = (main = false, w = 260, h = 340) => K.card(`bb-stupa:${main}:${w}:${h}`, w, h, (g) => {
  const cx = w / 2, tone = main ? '#b5aaa0' : '#9a8f86', dk = '#5e554e';
  // Bell dome (anda)
  g.fillStyle = tone;
  g.beginPath(); g.moveTo(w * 0.12, h * 0.88);
  g.quadraticCurveTo(w * 0.14, h * 0.36, cx, h * 0.34);
  g.quadraticCurveTo(w * 0.86, h * 0.36, w * 0.88, h * 0.88);
  g.closePath(); g.fill();
  g.strokeStyle = dk; g.lineWidth = 4; g.stroke();
  // Base lotus cushion
  g.fillStyle = dk; g.fillRect(w * 0.08, h * 0.86, w * 0.84, h * 0.11);
  // Harmika + pinnacle (chattra)
  g.fillStyle = tone; g.fillRect(cx - w * 0.12, h * 0.22, w * 0.24, h * 0.12); g.strokeRect(cx - w * 0.12, h * 0.22, w * 0.24, h * 0.12);
  g.beginPath(); g.moveTo(cx - w * 0.07, h * 0.22); g.lineTo(cx, h * 0.03); g.lineTo(cx + w * 0.07, h * 0.22); g.closePath(); g.fill(); g.stroke();
  // Diamond lattice perforations (terawang)
  g.fillStyle = '#38302a';
  for (let r = 0; r < 3; r++) for (let c = -2; c <= 2; c++) {
    const dx = cx + c * 28 + (r % 2) * 14, dy = h * 0.5 + r * 36;
    if (Math.abs(dx - cx) < w * 0.28) {
      g.beginPath(); g.moveTo(dx, dy - 10); g.lineTo(dx + 10, dy); g.lineTo(dx, dy + 10); g.lineTo(dx - 10, dy); g.closePath(); g.fill();
    }
  }
});

const dovetailCard = () => K.card('bb-dovetail', 520, 270, (g, w, h) => {
  g.fillStyle = '#a89d92'; g.fillRect(20, 30, w - 40, h - 60);
  g.strokeStyle = '#4f463f'; g.lineWidth = 5; g.strokeRect(20, 30, w - 40, h - 60);
  g.beginPath(); g.moveTo(w / 2, 30); g.lineTo(w / 2, h - 30); g.stroke();
  // Dovetail (ekor burung) key lock in gold/dark stone
  g.fillStyle = '#d9a441';
  g.beginPath();
  g.moveTo(w / 2 - 58, h / 2 - 34); g.lineTo(w / 2 - 14, h / 2 - 14);
  g.lineTo(w / 2 + 14, h / 2 - 14); g.lineTo(w / 2 + 58, h / 2 - 34);
  g.lineTo(w / 2 + 58, h / 2 + 34); g.lineTo(w / 2 + 14, h / 2 + 14);
  g.lineTo(w / 2 - 14, h / 2 + 14); g.lineTo(w / 2 - 58, h / 2 + 34);
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle = P.ink; g.font = "700 28px 'Fredoka'"; g.textAlign = 'center'; g.fillText('KUNCI EKOR BURUNG', w / 2, h - 48);
});

const makaraCard = () => K.card('bb-makara', 300, 260, (g, w, h) => {
  g.fillStyle = '#8b8075';
  g.beginPath(); g.moveTo(20, h * 0.25); g.lineTo(w * 0.72, h * 0.25); g.quadraticCurveTo(w * 0.92, h * 0.1, w * 0.85, h * 0.55); g.lineTo(20, h * 0.72); g.closePath(); g.fill();
  g.strokeStyle = '#4f463f'; g.lineWidth = 4; g.stroke();
  // Water stream pouring from makara mouth
  g.fillStyle = '#5eb5e0';
  g.beginPath(); g.moveTo(w * 0.76, h * 0.52); g.quadraticCurveTo(w * 0.96, h * 0.7, w * 0.92, h * 0.96); g.lineTo(w * 0.68, h * 0.96); g.closePath(); g.fill();
});

const reliefPanel = (k) => K.card('bb-relief' + k, 420, 270, (g, w, h) => {
  g.fillStyle = '#9c9084'; g.fillRect(14, 14, w - 28, h - 28);
  g.strokeStyle = '#544a42'; g.lineWidth = 6; g.strokeRect(18, 18, w - 36, h - 36);
  // Carved ship / figures in bas-relief
  g.fillStyle = '#c4b8ab';
  if (k === 0) {
    // Samudraraksa outrigger ship relief
    g.beginPath(); g.moveTo(65, 190); g.quadraticCurveTo(w / 2, 230, w - 65, 190); g.lineTo(w - 85, 150); g.lineTo(85, 150); g.closePath(); g.fill(); g.stroke();
    g.fillRect(145, 70, 55, 75); g.fillRect(225, 65, 60, 80);
  } else {
    // Procession of carved figures & lotus
    for (let i = 0; i < 4; i++) {
      const cx = 85 + i * 82;
      g.beginPath(); g.arc(cx, 95, 22, 0, TAU); g.fill(); g.stroke();
      g.fillRect(cx - 18, 120, 36, 90); g.strokeRect(cx - 18, 120, 36, 90);
    }
  }
});

// ---------------- 5 spreads ----------------
function S1(t) { // Bukit Kedu & Megahnya Candi Borobudur
  return { back: LEAF.keduBack(), floor: LEAF.keduFloor(), pieces: (frame) => {
    for (let r = 0; r < 3; r++) {
      const a = K.rise(t, 0.05 + r * 0.14, 0.55);
      K.standee(ctx, borobudurTier(r, 680 - r * 110, 230), 0, 210 + r * 120, 680 - r * 110, 210, a, { frame });
    }
    K.standee(ctx, stupaCard(true, 260, 340), 0, 320, 240, 310, K.rise(t, 0.45, 0.55), { frame, lift: 140 });
    if (!frame) K.volvelle(ctx, 320, 640, 2000, { r: 112, label: 'RIBU BATU' });
  } };
}

function S2(t) { // Sambungan Ekor Burung & Saluran Air Makara
  return { back: LEAF.stoneBack(), floor: LEAF.stoneFloor(), pieces: (frame) => {
    const a0 = flips[0];
    K.standee(ctx, dovetailCard(), -90, 300, 480, 250, K.rise(t, a0 + 0.35), { frame });
    K.standee(ctx, makaraCard(), 280, 450, 280, 240, K.rise(t, W('kunci', 'saluran') - 0.25, 0.5), { frame });
    const ch = (t - a0) * 2.5;
    K.figureIn(ctx, 'pematung', -290, 540, 360, K.rise(t, a0 + 0.5), { chisel: ch }, frame);
    if (!frame || frame.F[2] === 1) K.volvelle(ctx, 310, 640, 100, { r: 108, label: 'MAKARA' });
  } };
}

function S3(t) { // 2.672 Panel Relief & Mandala
  return { back: LEAF.galleryBack(), floor: LEAF.stoneFloor(), pieces: (frame) => {
    const a0 = flips[1];
    K.standee(ctx, reliefPanel(0), -210, 240, 390, 250, K.rise(t, a0 + 0.35), { frame });
    K.standee(ctx, reliefPanel(1), 210, 290, 390, 250, K.rise(t, a0 + 0.48), { frame });
    const ch = (t - W('relief', 'memahat') + 0.3) * 3.0;
    K.figureIn(ctx, 'pematung', -120, 520, 370, K.rise(t, a0 + 0.55), { chisel: Math.max(0, ch) }, frame);
    if (!frame || frame.F[2] === 1) {
      const n = Math.round(lerp(100, 2672, ease.inOutCubic(clamp((t - a0 - 0.4) / 2.2))));
      K.volvelle(ctx, 290, 630, n, { r: 118, label: 'RELIEF' });
    }
  } };
}

function S4(t) { // Puncak Arupadhatu: 72 Stupa Terawang & Stupa Induk
  return { back: LEAF.arupaBack(), floor: LEAF.arupaFloor(), pieces: (frame) => {
    const a0 = flips[2];
    K.standee(ctx, stupaCard(true, 300, 390), 0, 220, 310, 400, K.rise(t, a0 + 0.35), { frame });
    const pos = [[-320, 330], [320, 330], [-220, 500], [220, 500], [0, 540]];
    pos.forEach(([x, d], i) => {
      K.standee(ctx, stupaCard(false, 220, 290), x, d, 175, 230, K.rise(t, a0 + 0.45 + i * 0.08), { frame });
    });
    if (!frame || frame.F[2] === 1) K.volvelle(ctx, 320, 640, 72, { r: 108, label: 'STUPA' });
  } };
}

function S5(t) { // Pemugaran & Warisan Dunia Menyapa Fajar
  return { back: LEAF.dawnBack(), floor: LEAF.keduFloor(), pieces: (frame) => {
    const a0 = flips[3];
    for (let r = 0; r < 3; r++) {
      K.standee(ctx, borobudurTier(r, 680 - r * 110, 230), 0, 200 + r * 115, 680 - r * 110, 210, K.rise(t, a0 + 0.35 + r * 0.1), { frame });
    }
    K.standee(ctx, stupaCard(true, 260, 340), 0, 310, 250, 320, K.rise(t, a0 + 0.6), { frame, lift: 140 });
    K.figureIn(ctx, 'putri', -310, 560, 320, K.rise(t, a0 + 0.55), { arm: 0.6, t }, frame);
    K.figureIn(ctx, 'pematung', 310, 560, 330, K.rise(t, a0 + 0.6), { chisel: 0 }, frame);
  } };
}

const SPREADS = [S1, S2, S3, S4, S5];

export function render(t, AM) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.table(ctx, t);
  let i = 0; for (let k = 0; k < flips.length; k++) if (t >= flips[k]) i = k + 1;
  const inFlip = i > 0 && t < flips[i - 1] + FLIP;
  const sp = i > 0 ? flips[i - 1] : 0, next = flips[i] ?? AM.duration, u = clamp((t - sp) / (next - sp));
  const push = [0.12, 0.18, 0.15, 0.22, 0.2][i] * ease.inOutSine(u);
  const sway = Math.sin(t * 0.45) * 55;
  const cam = { pos: [sway, 1650 - push * 260, 2700 - push * 560], look: [0, 300 + push * 30, 220 + push * 100], f: 2550, cy: 860 };
  K.camera(cam);
  K.bookBase(ctx);
  if (inFlip) K.spread(ctx, SPREADS[i - 1](t), { f: (t - flips[i - 1]) / FLIP, next: SPREADS[i](t) });
  else K.spread(ctx, SPREADS[i](t));

  if (i === 1 && !inFlip) K.pullTab(ctx, 430, ease.inOutCubic(clamp((t - W('kunci', 'mengunci') + 0.3) / 0.7)), { text: 'KUNCI' });

  // Screen-space paper labels
  if (i === 0 && !inFlip) {
    K.label(ctx, 'CANDI BOROBUDUR', 540, 140, { size: 58, alpha: prog(t, 0, 0.35) });
    K.label(ctx, '2.000.000+ Balok Batu Tanpa Semen', 540, 1380, { size: 40, alpha: prog(t, W('hook', 'juta') - 0.1, W('hook', 'juta') + 0.25), rot: 0.02, ink: P.cover });
  }
  if (i === 1 && !inFlip) {
    K.label(ctx, 'Sambungan Ekor Burung & 100 Makara', 540, 160, { size: 42, alpha: prog(t, W('kunci', 'mengunci') - 0.1, W('kunci', 'mengunci') + 0.25) });
  }
  if (i === 2 && !inFlip) {
    K.label(ctx, '2.672 Panel Relief & Mandala Kosmik', 540, 160, { size: 42, alpha: prog(t, W('relief', 'relief') - 0.1, W('relief', 'relief') + 0.25), ink: P.cover });
  }
  if (i === 3 && !inFlip) {
    K.label(ctx, '72 Stupa Terawang + 1 Stupa Induk', 540, 160, { size: 44, alpha: prog(t, W('arupadhatu', 'stupa') - 0.1, W('arupadhatu', 'stupa') + 0.25), ink: '#2b3b70' });
  }
  if (i === 4 && !inFlip) {
    K.label(ctx, 'WARISAN DUNIA NUSANTARA', 540, 160, { size: 50, alpha: prog(t, W('warisan', 'Borobudur') - 0.1, W('warisan', 'Borobudur') + 0.25), ink: P.cover });
  }

  AM.lib.vignette(ctx, { strength: 0.42, inner: 0.45 });
  const close = clamp((t - (C.warisan.end + 0.75)) / 0.45);
  if (close > 0) { ctx.fillStyle = `rgba(20,10,4,${close * 0.55})`; ctx.fillRect(0, 0, 1080, 1920); }
}
