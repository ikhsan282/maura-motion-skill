// Wayang Beber demo2: "Ande-Ande Lumut & Klenting Kuning" — unrolling a 5-scene painted daluwang scroll under a flickering oil lamp.
import * as K from '/styles/wayang-beber/kit.js';
const { clamp, lerp, ease, prog, env, hrand } = AM.lib;
const P = K.PAL, SC = K.SCROLL.SCENE, TAU = Math.PI * 2;

export const meta = { fps: 24, hold: 2, captions: { preset: 'serif', y: 1520, size: 54, maxWords: 4 } };

let ctx, S;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const X0 = 70, X1 = 1010, Y0 = 560, H = K.SCROLL.H;
const GY = H - 92;

// ---------------- custom scroll motifs ----------------
const ground = (g, x0, w, h) => {
  g.fillStyle = P.green; g.fillRect(x0, h - 92, w, 46);
  g.fillStyle = P.greenDk;
  for (let x = x0; x < x0 + w; x += 26) {
    g.beginPath(); g.moveTo(x, h - 92); g.lineTo(x + 8, h - 112); g.lineTo(x + 16, h - 92); g.fill();
  }
};
const sky = (g, x0, w, seed) => {
  for (let i = 0; i < 5; i++) K.vine(g, x0 + 110 + i * 200 + (i % 2) * 40, 120 + (i % 2) * 70, 0.8, seed + i);
};
function paintRiver(g, x0, y, w, dry = 0) {
  const h = lerp(52, 12, dry);
  K.shape(g, (q) => q.rect(x0, y - 6, w, h), dry > 0.6 ? P.ochre : P.indigo);
  g.strokeStyle = dry > 0.6 ? P.sienna : P.paperHi;
  g.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const wy = y + 6 + i * (h / 7);
    g.beginPath();
    for (let x = x0 + 16; x < x0 + w - 16; x += 28) {
      g.moveTo(x, wy);
      g.quadraticCurveTo(x + 7, wy - 5 * (1 - dry), x + 14, wy);
      g.quadraticCurveTo(x + 21, wy + 5 * (1 - dry), x + 28, wy);
    }
    g.stroke();
  }
}
function paintYuyu(g, x, y, s = 1, t = 0) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  const bob = Math.sin(t * 3.5) * 6;
  g.translate(0, bob);
  // legs
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const a = side * (0.4 + k * 0.25) + Math.sin(t * 5 + k) * 0.08;
      K.shape(g, (q) => {
        q.moveTo(side * 55, -10 + k * 12);
        q.lineTo(side * (110 + k * 10), -25 + k * 18 + Math.sin(a) * 14);
        q.lineTo(side * (135 + k * 6), 15 + k * 12);
        q.lineTo(side * (105 + k * 8), -8 + k * 18);
      }, P.redDk, 2.2);
    }
    // giant claws
    const pinch = Math.abs(Math.sin(t * 4)) * 0.25;
    g.save();
    g.translate(side * 75, -55);
    g.rotate(side * (-0.35 + pinch));
    K.shape(g, (q) => q.ellipse(0, -35, 24, 48, side * 0.2, 0, TAU), P.red, 2.5);
    K.shape(g, (q) => q.ellipse(side * 12, -45, 10, 26, -side * 0.3, 0, TAU), P.ochreLt, 2);
    g.restore();
  }
  // shell body with ornate beber curls
  K.shape(g, (q) => q.ellipse(0, -25, 82, 52, 0, 0, TAU), P.red, 3);
  K.shape(g, (q) => q.ellipse(0, -25, 62, 36, 0, 0, TAU), P.ochre, 2);
  // fierce eyes & fangs
  for (const sx of [-26, 26]) {
    K.shape(g, (q) => q.arc(sx, -68, 12, 0, TAU), P.white, 2);
    K.shape(g, (q) => q.arc(sx, -68, 5, 0, TAU), P.ink, 1);
  }
  g.restore();
}

const SCENES = [
  // Scene 0: Village departure & gate
  (g, x0, w, h) => { sky(g, x0, w, 2); K.gate(g, x0 + 210, h - 92, 1.0); K.tree(g, x0 + 520, h - 92, 0.95, 11); K.tree(g, x0 + 860, h - 92, 1.05, 12); ground(g, x0, w, h); },
  // Scene 1: Flooded wide river & banks
  (g, x0, w, h) => { sky(g, x0, w, 9); K.tree(g, x0 + 130, h - 92, 0.9, 15); K.tree(g, x0 + 880, h - 92, 1.0, 16); ground(g, x0, w, h); paintRiver(g, x0 + 250, h - 92, 500, 0); },
  // Scene 2: River parting under the yellow palm-rib wand
  (g, x0, w, h) => { sky(g, x0, w, 17); K.tree(g, x0 + 150, h - 92, 1.0, 21); K.tree(g, x0 + 850, h - 92, 0.85, 22); ground(g, x0, w, h); paintRiver(g, x0 + 280, h - 92, 440, 0.25); },
  // Scene 3: Mbok Rondo Dadapan's pendopo
  (g, x0, w, h) => { sky(g, x0, w, 25); K.pendopo(g, x0 + 540, h - 92, 520, 520); K.tree(g, x0 + 140, h - 92, 0.95, 28); ground(g, x0, w, h); },
  // Scene 4: Grand union of Panji (Ande-Ande Lumut) & Dewi Sekartaji (Klenting Kuning)
  (g, x0, w, h) => {
    sky(g, x0, w, 33); K.pendopo(g, x0 + 500, h - 92, 560, 560);
    for (const kx of [170, 830]) {
      K.shape(g, (q) => q.rect(x0 + kx - 10, h - 260, 20, 170), P.wood);
      for (let k = 0; k < 7; k++) K.shape(g, (q) => q.ellipse(x0 + kx + Math.cos(k) * 40, h - 300 - k * 22, 26, 12, k, 0, TAU), k % 2 ? P.green : P.ochreLt, 2);
    }
    ground(g, x0, w, h);
  },
];

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  S = K.scrollCanvas('ande-lumut', SCENES);
  AM.sfx('kentongan', 0.08, { gain: 0.4 });
  AM.sfx('paper', 0.35, { gain: 0.45 });
  AM.sfx('gong', C.hook.start + 0.4, { gain: 0.5 });
  AM.sfx('paper', C.sungai.start - 0.15, { gain: 0.4 });
  AM.sfx('drum_hit', C.yuyukangkang.start + 0.2, { gain: 0.4, pitch: 0.85 });
  AM.sfx('paper', C.pusaka.start - 0.15, { gain: 0.4 });
  AM.sfx('magic', C.pusaka.start + 1.2, { gain: 0.4 });
  AM.sfx('paper', C.desa.start - 0.15, { gain: 0.4 });
  AM.sfx('gong', C.pilihan.start + 0.3, { gain: 0.55 });
  AM.sfx('bell_temple', C.moral.start + 0.4, { gain: 0.4 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;
function cam(z, cx, cy) { ctx.setTransform(z, 0, 0, z, 540 - cx * z, 960 - cy * z); }

function stage(t, u0, Cm, figs, { tied = false, rightX = X1, roll = 0 } = {}) {
  const f = K.flicker(t);
  cam(Cm.z, Cm.x, Cm.y);
  const g = ctx.createRadialGradient(540, 700, 50, 540, 900, 1300);
  g.addColorStop(0, '#5a3a22'); g.addColorStop(0.5, '#2a1a10'); g.addColorStop(1, P.night);
  ctx.fillStyle = g; ctx.fillRect(-400, -400, 1900, 2800);
  const w = rightX - X0;
  K.scrollWindow(ctx, S, u0, X0, Y0, w);
  ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, w, H); ctx.clip(); ctx.translate(X0 - u0, Y0); figs && figs(ctx); ctx.restore();
  K.roller(ctx, X0, Y0, H, -u0 / 600, 24 + clamp(u0 / 4500) * 10);
  K.roller(ctx, rightX, Y0, H, -u0 / 600 + roll, 34 - clamp(u0 / 4500) * 8, { tied });
  const fl = K.lamp(ctx, 540, 330, t, 0.9);
  K.lampLight(ctx, 657, 270, fl, 820);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(10,5,2,${clamp((0.96 - f) * 2.2)})`; ctx.fillRect(0, 0, 1080, 1920);
  return f;
}

// 1. Hook: Unrolling the daluwang scroll to introduce Ande-Ande Lumut
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(0, 140, p);
  const Cm = { z: lerp(1.08, 1.38, p), x: lerp(540, 580, p), y: 980 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'jaka', { x: 380, y: GY, s: 1.05, t, armF: [0.8 + Math.sin(t * 2) * 0.15, 0.5] });
    K.figure(g, 'emban', { x: 640, y: GY, s: 0.95, face: -1, t, armF: [0.6, 0.7] });
    K.figure(g, 'putri', { x: 820, y: GY, s: 1.0, face: -1, t });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 380 - u0 + 20, Y0 + GY - 540, 1280, 1920);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'ANDE-ANDE LUMUT', 540, 210, { size: 50, sub: 'lakon Panji di gulungan daluwang', alpha: prog(t, a + 0.1, a + 0.5) });
});

// 2. Sungai: The Klenting sisters walk toward the flooded river
shot('sungai', (t, a, b) => {
  const lt = t - a, p = prog(t, a, b);
  const u0 = lerp(140, SC, ease.inOutCubic(clamp(lt / 1.1)));
  const walkX = lerp(SC + 80, SC + 230, ease.inOutSine(p));
  const Cm = { z: 1.42, x: 560, y: 1000 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'putri', { x: walkX, y: GY, s: 1.0, t, walk: lt * 1.4, armF: [0.7, 0.8] });
    K.figure(g, 'emban', { x: walkX - 130, y: GY, s: 0.95, t, walk: lt * 1.4 + 0.5, armF: [0.5, 0.6] });
    paintYuyu(g, SC + 520, GY - 10, 0.95, t);
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + SC + 480 - u0, Y0 + GY - 220, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'SUNGAI BRANTAS', 540, 240, { size: 48, sub: 'banjir menghadang para pelamar', alpha: prog(t, a + 0.3, a + 0.7) });
});

// 3. Yuyu Kangkang: The giant crab offers a cunning deal
shot('yuyukangkang', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = SC + lerp(0, 60, p);
  const Cm = { z: lerp(1.42, 1.55, p), x: 580, y: 1015 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'putri', { x: SC + 240, y: GY, s: 1.0, t, armF: [1.1 + Math.sin(t * 4) * 0.2, 0.9], mouth: Math.abs(Math.sin(t * 7)) * 0.6 });
    K.figure(g, 'emban', { x: SC + 110, y: GY, s: 0.95, t, armF: [0.8, 0.7] });
    paintYuyu(g, SC + 520, GY - 14, 1.12, t);
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + SC + 520 - u0, Y0 + GY - 240, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'YUYU KANGKANG', 540, 240, { size: 50, sub: 'penjaga sungai bersyarat licik', alpha: prog(t, a + 0.2, a + 0.6) });
});

// 4. Klenting Kuning arrives and refuses the crab's demand
shot('klenting', (t, a, b) => {
  const lt = t - a, p = prog(t, a, b);
  const u0 = lerp(SC + 60, 2 * SC - 120, ease.inOutCubic(clamp(lt / 1.2)));
  const Cm = { z: 1.45, x: 560, y: 1000 };
  stage(t, u0, Cm, (g) => {
    // older sisters already on the right bank
    K.figure(g, 'emban', { x: SC + 820, y: GY, s: 0.92, t, walk: lt });
    paintYuyu(g, 2 * SC + 480, GY - 12, 1.0, t);
    // Klenting Kuning on the left bank holding her stance
    K.figure(g, 'putri', { x: 2 * SC + 210, y: GY, s: 1.02, t, armF: [1.5, 1.1], mouth: Math.abs(Math.sin(t * 6)) * 0.5 });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 2 * SC + 210 - u0 + 20, Y0 + GY - 540, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'KLENTING KUNING', 540, 240, { size: 50, sub: 'menolak syarat Yuyu Kangkang', alpha: prog(t, a + 0.25, a + 0.65) });
});

// 5. Pusaka: Striking the river with the yellow palm-rib wand (lidi kuning)
shot('pusaka', (t, a, b) => {
  const lt = t - a, p = prog(t, a, b);
  const u0 = lerp(2 * SC - 120, 2 * SC, ease.inOutCubic(clamp(lt / 0.8)));
  const strike = prog(t, a + 1.0, a + 2.2, ease.inOutCubic);
  const Cm = { z: lerp(1.45, 1.52, strike), x: 560, y: 1005 };
  stage(t, u0, Cm, (g) => {
    paintRiver(g, 2 * SC + 280, GY, 440, strike);
    const armAng = lerp(2.2, 0.55, strike);
    K.figure(g, 'putri', { x: 2 * SC + 230 + strike * 120, y: GY, s: 1.04, t, walk: strike * 2, armF: [armAng, 0.4] });
    // golden lidi pusaka ray
    g.save();
    g.strokeStyle = P.gold; g.lineWidth = 5;
    g.beginPath();
    g.moveTo(2 * SC + 270 + strike * 120, GY - 230);
    g.lineTo(2 * SC + 360 + strike * 140, GY - 90);
    g.stroke();
    g.restore();
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 2 * SC + 350 - u0, Y0 + GY - 300, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'PUSAKA LIDI KUNING', 540, 240, { size: 48, sub: 'air sungai surut membuka jalan', alpha: prog(t, a + 0.2, a + 0.6) });
});

// 6. Desa Dadapan: Mbok Rondo & Ande-Ande Lumut decline the older sisters
shot('desa', (t, a, b) => {
  const lt = t - a;
  const u0 = lerp(2 * SC, 3 * SC, ease.inOutCubic(clamp(lt / 0.9)));
  const Cm = { z: 1.4, x: 560, y: 990 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'emban', { x: 3 * SC + 220, y: GY, s: 0.95, t, armF: [0.9, 0.8] });
    K.figure(g, 'warga', { x: 3 * SC + 370, y: GY, s: 0.95, t, armF: [1.1, 0.6] });
    K.figure(g, 'jaka', { x: 3 * SC + 620, y: GY, s: 1.05, face: -1, t, armF: [1.3, 0.9], mouth: Math.abs(Math.sin(t * 7)) * 0.5 });
    K.figure(g, 'emban', { x: 3 * SC + 790, y: GY, s: 0.98, face: -1, t, armF: [0.6, 0.6] });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 3 * SC + 620 - u0, Y0 + GY - 540, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'DESA DADAPAN', 540, 240, { size: 50, sub: 'pendopo Mbok Rondo Dadapan', alpha: prog(t, a + 0.25, a + 0.65) });
});

// 7. Pilihan: Ande-Ande Lumut chooses Klenting Kuning (Dewi Sekartaji)
shot('pilihan', (t, a, b) => {
  const lt = t - a;
  const u0 = lerp(3 * SC, 4 * SC, ease.inOutCubic(clamp(lt / 0.9)));
  const Cm = { z: 1.46, x: 550, y: 990 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'jaka', { x: 4 * SC + 390, y: GY, s: 1.06, t, armF: [1.1 + Math.sin(t * 2.5) * 0.12, 0.7] });
    K.figure(g, 'putri', { x: 4 * SC + 610, y: GY, s: 1.04, face: -1, t, armF: [1.0, 0.7], look: 0.05 });
    for (let i = 0; i < 12; i++) {
      const u = ((t * 0.22 + hrand(i, 1)) % 1);
      g.fillStyle = i % 2 ? P.gold : P.red;
      g.beginPath();
      g.ellipse(4 * SC + 300 + hrand(i, 2) * 400 + Math.sin(t * 2 + i) * 18, 120 + u * 540, 7, 4, t + i, 0, TAU);
      g.fill();
    }
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 4 * SC + 500 - u0, Y0 + GY - 540, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'PANJI & SEKARTAJI', 540, 240, { size: 50, sub: 'kesetiaan yang mempertemukan kembali', alpha: prog(t, a + 0.25, a + 0.65) });
});

// 8. Moral: Full view of the scroll and oil lamp
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = 4 * SC;
  const Cm = { z: lerp(1.46, 1.02, p), x: 540, y: lerp(990, 960, p) };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'jaka', { x: 4 * SC + 390, y: GY, s: 1.06, t, armF: [1.0, 0.7] });
    K.figure(g, 'putri', { x: 4 * SC + 610, y: GY, s: 1.04, face: -1, t, armF: [0.95, 0.7] });
  }, { tied: true });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'KEMURNIAN HATI', 540, 210, { size: 52, sub: 'petuah luhur wayang beber Nusantara', alpha: prog(t, a + 0.2, a + 0.6) });
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= at(sh.id)) s = sh;
  const i = SHOTS.indexOf(s);
  const a = Math.max(0, at(s.id)), b = SHOTS[i + 1] ? at(SHOTS[i + 1].id) : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - a;
  if (i > 0 && since < 0.16) { ctx.fillStyle = `rgba(255,214,150,${0.25 * (1 - since / 0.16)})`; ctx.fillRect(0, 0, 1080, 1920); }
  AM.lib.vignette(ctx, { strength: 0.6, inner: 0.4 });
}

