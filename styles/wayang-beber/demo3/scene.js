// Wayang Beber demo3: "Jaka Tarub & Selendang Nawangwulan" — 5-scene painted daluwang scroll under a flickering oil lamp.
import * as K from '/styles/wayang-beber/kit.js';
const { clamp, lerp, ease, prog, hrand } = AM.lib;
const P = K.PAL, SC = K.SCROLL.SCENE, TAU = Math.PI * 2;

export const meta = { fps: 24, hold: 2, captions: { preset: 'serif', y: 1520, size: 54, maxWords: 4 } };

let ctx, S;
const C = {};
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
function paintTelaga(g, x0, y) {
  // rock pool & waterfall in classic beber flat outline
  K.shape(g, (q) => q.ellipse(x0 + 540, y - 16, 230, 44, 0, 0, TAU), P.indigo, 3);
  K.shape(g, (q) => q.ellipse(x0 + 540, y - 18, 195, 30, 0, 0, TAU), P.paperHi, 1.5);
  for (let i = 0; i < 5; i++) {
    K.shape(g, (q) => q.arc(x0 + 330 + i * 95, y - 42 + (i % 2) * 8, 28, Math.PI, TAU), P.stone, 2.5);
  }
}
function paintLumbung(g, x, y) {
  // stilts & woven bamboo rice barn with curved roof
  for (const sx of [-95, 95]) K.shape(g, (q) => q.rect(x + sx - 8, y - 240, 16, 240), P.wood, 2.5);
  K.shape(g, (q) => q.rect(x - 115, y - 260, 230, 150), P.ochre, 3);
  // golden paddy sheaves visible inside
  for (let i = -3; i <= 3; i++) {
    K.shape(g, (q) => q.ellipse(x + i * 24, y - 165, 16, 28, i * 0.08, 0, TAU), P.gold, 2);
  }
  K.shape(g, (q) => {
    q.moveTo(x - 155, y - 255);
    q.quadraticCurveTo(x, y - 390, x + 155, y - 255);
    q.closePath();
  }, P.redDk, 3);
}
function paintKukusan(g, x, y, lidLift = 0) {
  // clay stove (tungku) & woven cone steamer (kukusan)
  K.shape(g, (q) => q.rect(x - 52, y - 70, 104, 70), P.sienna, 2.5);
  K.shape(g, (q) => q.arc(x, y - 15, 22, Math.PI, TAU), P.red, 2);
  K.shape(g, (q) => {
    q.moveTo(x - 58, y - 70);
    q.lineTo(x + 58, y - 70);
    q.lineTo(x + 36, y - 135);
    q.lineTo(x - 36, y - 135);
    q.closePath();
  }, P.ochre, 2.5);
  // single golden rice stalk inside
  if (lidLift > 0.05) {
    g.save();
    g.strokeStyle = P.gold; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x, y - 130); g.quadraticCurveTo(x + 18, y - 175, x + 32, y - 160); g.stroke();
    for (let k = 0; k < 5; k++) {
      K.shape(g, (q) => q.ellipse(x + 8 + k * 5, y - 152 - k * 4, 6, 3, 0.4, 0, TAU), P.gold, 1.2);
    }
    g.restore();
  }
  // lid
  g.save();
  g.translate(x + lidLift * 45, y - 135 - lidLift * 55);
  g.rotate(lidLift * 0.45);
  K.shape(g, (q) => {
    q.moveTo(-48, 0); q.lineTo(0, -42); q.lineTo(48, 0); q.closePath();
  }, P.redDk, 2.5);
  g.restore();
}
function paintSelendang(g, x, y, t, s = 1) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  K.shape(g, (q) => {
    q.moveTo(-70, 0);
    q.bezierCurveTo(-20, -35 + Math.sin(t * 4) * 14, 30, 35 - Math.sin(t * 4) * 14, 85, -10);
    q.lineTo(75, 18);
    q.bezierCurveTo(25, 55 - Math.sin(t * 4) * 14, -20, -10 + Math.sin(t * 4) * 14, -75, 22);
    q.closePath();
  }, P.red, 2.2);
  g.restore();
}

const SCENES = [
  // Scene 0: Forest lake (Telaga Bidadari)
  (g, x0, w, h) => { sky(g, x0, w, 4); K.tree(g, x0 + 170, h - 92, 1.1, 31); K.tree(g, x0 + 860, h - 92, 0.95, 32); ground(g, x0, w, h); paintTelaga(g, x0, h - 92); },
  // Scene 1: Edge of the forest & hidden selendang
  (g, x0, w, h) => { sky(g, x0, w, 11); K.tree(g, x0 + 210, h - 92, 1.0, 35); K.tree(g, x0 + 780, h - 92, 1.05, 36); ground(g, x0, w, h); },
  // Scene 2: Jaka Tarub's village home & marriage
  (g, x0, w, h) => { sky(g, x0, w, 18); K.pendopo(g, x0 + 500, h - 92, 500, 500); K.tree(g, x0 + 130, h - 92, 0.9, 39); ground(g, x0, w, h); },
  // Scene 3: Kitchen kukusan & rice stalk secret
  (g, x0, w, h) => { sky(g, x0, w, 24); K.pendopo(g, x0 + 480, h - 92, 520, 500); ground(g, x0, w, h); },
  // Scene 4: Lumbung padi & Nawangwulan ascending to Kahyangan
  (g, x0, w, h) => { sky(g, x0, w, 30); paintLumbung(g, x0 + 280, h - 92); K.tree(g, x0 + 850, h - 92, 1.0, 42); ground(g, x0, w, h); },
];

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  S = K.scrollCanvas('jaka-tarub', SCENES);
  AM.sfx('kentongan', 0.08, { gain: 0.4 });
  AM.sfx('paper', 0.35, { gain: 0.45 });
  AM.sfx('gong', C.hook.start + 0.4, { gain: 0.5 });
  AM.sfx('paper', C.selendang.start - 0.15, { gain: 0.4 });
  AM.sfx('paper', C.keluarga.start - 0.15, { gain: 0.4 });
  AM.sfx('drum_hit', C.rahasia.start + 0.3, { gain: 0.4 });
  AM.sfx('paper', C.terbang.start - 0.15, { gain: 0.4 });
  AM.sfx('magic', C.terbang.start + 0.8, { gain: 0.4 });
  AM.sfx('gong', C.moral.start + 0.3, { gain: 0.55 });
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

// 1. Hook: Opening the daluwang scroll on the forest lake
shot('hook', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(0, 60, p);
  const Cm = { z: lerp(1.06, 1.35, p), x: 540, y: 975 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'jaka', { x: 220, y: GY, s: 1.0, t, armF: [0.9, 0.6] });
    K.figure(g, 'putri', { x: 540, y: GY, s: 1.02, face: -1, t, armF: [1.1, 0.7] });
    K.figure(g, 'emban', { x: 720, y: GY, s: 0.95, face: -1, t });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 540 - u0, Y0 + GY - 520, 1280, 1920);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'JAKA TARUB', 540, 210, { size: 52, sub: 'legenda telaga bidadari di kertas daluwang', alpha: prog(t, a + 0.1, a + 0.5) });
});

// 2. Telaga: Bidadari bathing by the lake while Jaka Tarub peeks behind the tree
shot('telaga', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(60, 120, p);
  const Cm = { z: 1.44, x: 560, y: 1000 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'jaka', { x: 230, y: GY, s: 1.0, t, armF: [1.3 + Math.sin(t * 3) * 0.15, 0.8] });
    K.figure(g, 'putri', { x: 510, y: GY, s: 1.02, face: -1, t, armF: [1.2 + Math.sin(t * 2.5) * 0.2, 0.8] });
    K.figure(g, 'emban', { x: 690, y: GY, s: 0.95, face: -1, t, armF: [0.9, 0.7] });
    paintSelendang(g, 380, GY - 110, t, 0.85);
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 380 - u0, Y0 + GY - 140, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'TELAGA BIDADARI', 540, 240, { size: 50, sub: 'tujuh bidadari turun dari kahyangan', alpha: prog(t, a + 0.2, a + 0.6) });
});

// 3. Selendang: Jaka Tarub hides the shawl; Nawangwulan is left behind
shot('selendang', (t, a, b) => {
  const lt = t - a, p = prog(t, a, b);
  const u0 = lerp(120, SC, ease.inOutCubic(clamp(lt / 0.9)));
  const Cm = { z: 1.45, x: 560, y: 1000 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'jaka', { x: SC + 320, y: GY, s: 1.04, t, armF: [1.1, 0.7] });
    paintSelendang(g, SC + 240, GY - 220, t, 0.75);
    K.figure(g, 'putri', { x: SC + 640, y: GY, s: 1.02, face: -1, t, armF: [1.6, 1.2], mouth: Math.abs(Math.sin(t * 6)) * 0.4 });
    // sisters ascending in the corner
    K.figure(g, 'emban', { x: SC + 820, y: GY - 160 - p * 120, s: 0.75, t, armF: [2.0, 0.5] });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + SC + 640 - u0, Y0 + GY - 520, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'DEWI NAWANGWULAN', 540, 240, { size: 48, sub: 'selendang kahyangan yang disembunyikan', alpha: prog(t, a + 0.2, a + 0.6) });
});

// 4. Keluarga: Marriage at the village pendopo
shot('keluarga', (t, a, b) => {
  const lt = t - a;
  const u0 = lerp(SC, 2 * SC, ease.inOutCubic(clamp(lt / 0.9)));
  const Cm = { z: 1.42, x: 550, y: 995 };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'jaka', { x: 2 * SC + 370, y: GY, s: 1.04, t, armF: [1.0, 0.7] });
    K.figure(g, 'putri', { x: 2 * SC + 610, y: GY, s: 1.02, face: -1, t, armF: [1.0, 0.7] });
    K.figure(g, 'emban', { x: 2 * SC + 490, y: GY, s: 0.62, t, armF: [1.2, 0.6] }); // little Nawangsih
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 2 * SC + 490 - u0, Y0 + GY - 340, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'DEWI NAWANGSIH', 540, 240, { size: 48, sub: 'buah hati Jaka Tarub & Nawangwulan', alpha: prog(t, a + 0.25, a + 0.65) });
});

// 5. Lumbung / Kukusan: Cooking a full pot of rice from a single stalk of paddy
shot('lumbung', (t, a, b) => {
  const lt = t - a;
  const u0 = lerp(2 * SC, 3 * SC, ease.inOutCubic(clamp(lt / 0.9)));
  const Cm = { z: 1.46, x: 550, y: 1005 };
  stage(t, u0, Cm, (g) => {
    paintKukusan(g, 3 * SC + 490, GY, 0);
    K.figure(g, 'putri', { x: 3 * SC + 670, y: GY, s: 1.02, face: -1, t, armF: [1.2 + Math.sin(t * 3) * 0.15, 0.8] });
    K.figure(g, 'jaka', { x: 3 * SC + 290, y: GY, s: 1.02, t, armF: [0.7, 0.6] });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 3 * SC + 490 - u0, Y0 + GY - 150, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'PANTANGAN DAPUR', 540, 240, { size: 48, sub: 'setangkai padi menjadi sebakul nasi', alpha: prog(t, a + 0.25, a + 0.65) });
});

// 6. Rahasia: Jaka Tarub lifts the steamer lid and reveals the single stalk
shot('rahasia', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = 3 * SC;
  const lift = prog(t, a + 0.5, a + 2.0, ease.inOutCubic);
  const Cm = { z: lerp(1.46, 1.56, p), x: 540, y: 1015 };
  stage(t, u0, Cm, (g) => {
    paintKukusan(g, 3 * SC + 490, GY, lift);
    K.figure(g, 'jaka', { x: 3 * SC + 330, y: GY, s: 1.04, t, armF: [1.45, 0.6], mouth: lift * 0.6 });
    K.figure(g, 'putri', { x: 3 * SC + 710, y: GY, s: 1.02, face: -1, t, armF: [1.6 * lift, 1.1] });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 3 * SC + 490 - u0, Y0 + GY - 170, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'JANJI YANG DILANGGAR', 540, 240, { size: 48, sub: 'kesaktian kahyangan pun sirna', alpha: prog(t, a + 0.2, a + 0.6) });
});

// 7. Terbang: Finding the shawl at the bottom of the rice barn & ascending
shot('terbang', (t, a, b) => {
  const lt = t - a, p = prog(t, a, b, ease.inOutSine);
  const u0 = lerp(3 * SC, 4 * SC, ease.inOutCubic(clamp(lt / 0.9)));
  const rise = prog(t, a + 1.2, b, ease.inOutSine);
  const Cm = { z: 1.4, x: 550, y: lerp(1000, 950, rise) };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'jaka', { x: 4 * SC + 420, y: GY, s: 1.04, t, armF: [2.1, 0.4], look: -0.2 });
    K.figure(g, 'emban', { x: 4 * SC + 530, y: GY, s: 0.62, t, armF: [2.0, 0.5] });
    const ny = GY - rise * 250;
    paintSelendang(g, 4 * SC + 680, ny - 260, t, 1.05);
    K.figure(g, 'putri', { x: 4 * SC + 680, y: ny, s: 1.02, face: -1, t, armF: [2.2, 0.5] });
  });
  cam(Cm.z, Cm.x, Cm.y);
  K.tuding(ctx, X0 + 4 * SC + 680 - u0, Y0 + GY - 500 - rise * 200, 1300, 1900);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'KEMBALI KE KAHYANGAN', 540, 240, { size: 48, sub: 'selendang ditemukan di dasar lumbung', alpha: prog(t, a + 0.25, a + 0.65) });
});

// 8. Moral: Full view of the scroll with its timeless lesson on trust
shot('moral', (t, a, b) => {
  const p = prog(t, a, b, ease.inOutCubic);
  const u0 = 4 * SC;
  const Cm = { z: lerp(1.4, 1.02, p), x: 540, y: lerp(950, 960, p) };
  stage(t, u0, Cm, (g) => {
    K.figure(g, 'jaka', { x: 4 * SC + 420, y: GY, s: 1.04, t, armF: [1.2, 0.6] });
    K.figure(g, 'putri', { x: 4 * SC + 680, y: GY - 230, s: 0.98, face: -1, t, armF: [1.8, 0.6] });
    paintSelendang(g, 4 * SC + 680, GY - 480, t, 1.0);
  }, { tied: true });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.cartouche(ctx, 'AMANAH & KEPERCAYAAN', 540, 210, { size: 50, sub: 'warisan tutur kertas daluwang Nusantara', alpha: prog(t, a + 0.2, a + 0.6) });
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

