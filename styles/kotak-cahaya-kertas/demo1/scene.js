// Kotak Cahaya Kertas demo: "Malin Kundang" — a back-lit paper shadow box, five moods of light (18.8 s).
import * as K from '/styles/kotak-cahaya-kertas/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand, mixHex } = AM.lib;
const LT = K.LIGHTS;

export const meta = { fps: 24, hold: 2, captions: { preset: 'elegant', y: 1520, size: 60, maxWords: 4 } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('wind', 0.0, { gain: 0.3 });
  AM.sfx('paper', 0.05, { gain: 0.4 });
  AM.sfx('whoosh', C.rantau.start - 0.1, { gain: 0.3, pitch: 0.8 });
  AM.sfx('swoosh_up', W('kaya', 'kapal'), { gain: 0.35, pitch: 0.7 });
  AM.sfx('heartbeat', W('tolak', 'mendorongnya'), { gain: 0.45 });
  AM.sfx('thunder', W('batu', 'badai') - 0.15, { gain: 0.65 });
  AM.sfx('rain', W('batu', 'badai'), { gain: 0.35 });
  AM.sfx('impact', W('batu', 'membatu'), { gain: 0.45, pitch: 0.7 });
  AM.sfx('chime', C.batu.end + 0.1, { gain: 0.3 });
}

// ---------------- sheets (cut once) ----------------
const S = {
  hills: () => K.sheet('hills', 1500, 1920, (g, w, h) => K.ridges(g, w, h, 1010, 110, 3, { peaks: 2 })),
  village: () => K.sheet('village', 1500, 1920, (g, w, h) => {
    g.beginPath(); g.moveTo(0, 1190); g.quadraticCurveTo(500, 1170, 760, 1230); g.lineTo(760, h); g.lineTo(0, h); g.fill();
    K.rumahGadang(g, 260, 1190, 0.62); K.rumahGadang(g, 560, 1205, 0.45, 3);
    K.palm(g, 90, 1200, 380, 1, 0.15); K.palm(g, 700, 1225, 300, 1, -0.2);
  }),
  shore: () => K.sheet('shore', 1500, 1920, (g, w, h) => {
    g.beginPath(); g.moveTo(0, 1330); g.quadraticCurveTo(420, 1300, 720, 1350); g.quadraticCurveTo(900, 1380, 1020, 1430); g.lineTo(1020, h); g.lineTo(0, h); g.fill();
    for (const [x, y, r] of [[820, 1390, 40], [880, 1410, 28], [120, 1335, 30]]) { g.beginPath(); g.ellipse(x, y, r * 1.5, r, 0, 0, Math.PI * 2); g.fill(); }
  }),
  fg: () => K.sheet('fg', 1500, 1920, (g, w, h) => {
    for (const [x, sd] of [[60, 1], [1440, -1]]) for (let i = 0; i < 6; i++) { g.save(); g.translate(x, -20); g.rotate(sd * (0.3 + i * 0.22)); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(sd * 60, 220, sd * 30, 420 - i * 30); g.quadraticCurveTo(sd * 20, 200, -sd * 14, 0); g.fill(); g.restore(); }
    g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 18) g.lineTo(x, 1700 - Math.abs(Math.sin(x * 0.05)) * 70 - (x % 36 ? 0 : 40)); g.lineTo(w, h); g.fill();
  }),
  rock: () => K.sheet('rock2', 460, 300, (g) => { // the prostrate man of stone: head down at the left, curved back, folded legs
    g.beginPath(); g.moveTo(10, 300); g.lineTo(20, 250); g.quadraticCurveTo(30, 200, 70, 196); g.quadraticCurveTo(96, 170, 130, 160); g.quadraticCurveTo(200, 70, 300, 90); g.quadraticCurveTo(380, 110, 400, 190); g.quadraticCurveTo(450, 230, 450, 300); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(52, 210, 40, 30, -0.4, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.lineWidth = 3; g.strokeStyle = '#000'; for (const [x0, y0, x1, y1] of [[160, 140, 220, 240], [300, 110, 280, 200], [380, 200, 420, 280], [90, 240, 140, 300]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 12, (y0 + y1) / 2, x1, y1); g.stroke(); }
  }),
};

// ---------------- the box ----------------
function lay(Cm, k) { const z = 1 + (Cm.z - 1) * k, cx = 540 + (Cm.x - 540) * k, cy = 960 + (Cm.y - 960) * k; ctx.setTransform(z, 0, 0, z, 540 - cx * z + (Cm.sx || 0), 960 - cy * z + (Cm.sy || 0)); }
/** Draw the shared coast set; extras: {mid(L), stage(L), sea:{amp,rough,speed}, slide} */
function coast(t, Cm, L, o = {}) {
  const sl = o.slide ?? 1, up = (k) => (1 - sl) * 500 * k;
  const glowCol = L[3];
  lay(Cm, 0.3); K.drawSheet(ctx, S.hills(), K.sheetColor(L, 0.18), -210, up(0.4), { glow: 0.55, glowCol });
  K.haze(ctx, L, 1080, 260, 0.35);
  lay(Cm, 0.5);
  const sea = o.sea || {};
  K.waves(ctx, t, 1120 + up(0.6), K.sheetColor(L, 0.32), { amp: (sea.amp || 14), rough: sea.rough || 0, speed: sea.speed || 0.6, len: 220 });
  if (o.mid) o.mid(K.sheetColor(L, 0.5));
  lay(Cm, 0.65); K.drawSheet(ctx, S.village(), K.sheetColor(L, 0.55), -210, up(0.8), { glow: 0.45, glowCol });
  K.waves(ctx, t + 3, 1250 + up(0.9), K.sheetColor(L, 0.62), { amp: (sea.amp || 14) * 1.3, rough: sea.rough || 0, speed: (sea.speed || 0.6) * 1.3, len: 260 });
  if (o.front) o.front(K.sheetColor(L, 0.66));
  K.haze(ctx, L, 1300, 200, 0.2);
  lay(Cm, 0.85); K.drawSheet(ctx, S.shore(), K.sheetColor(L, 0.8), -210, up(1), { glow: 0.35, glowCol });
  if (o.stage) o.stage(K.sheetColor(L, 0.86));
  lay(Cm, 1.1); K.drawSheet(ctx, S.fg(), K.sheetColor(L, 0.97), -210, up(1.2), { glow: 0.25, glowCol });
  K.motes(ctx, t, 26, L[3], { y0: 500, y1: 1300 });
}
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// 1. Hook (dusk): the grand ship at anchor; rich Malin turns his back on the old woman reaching for him.
shot('hook', (t, a, b) => {
  const p = (t - a) / (b - a);
  const L = K.backlight(ctx, t, LT.dusk, null, 0, { sunY: 0.58 });
  const Cm = { z: 1.08 + 0.06 * p, x: 520 + 40 * p, y: 980 };
  const turn = clamp((t - W('hook', 'pura-pura') + 0.2) / 0.4);
  coast(t, Cm, L, {
    slide: ease.outBack(clamp((t + 0.35) / 0.9), 1.3),
    mid: (col) => { ctx.fillStyle = col; K.ship(ctx, 760, 1130 + Math.sin(t * 1.2) * 6, 0.62); },
    stage: (col) => {
      K.puppet(ctx, 'ibu', col, { x: 330, y: 1320, s: 1.05, t, bend: 0.25, armF: [1.4 + Math.sin(t * 2) * 0.05, 0.2], armB: [0.2, 0.3] });
      K.puppet(ctx, 'malin', col, { x: 620 + turn * 20, y: 1330, s: 1.1, face: turn > 0.5 ? 1 : -1, t, rich: true, walk: turn > 0.5 ? (t - a) * 0.9 : null, armF: [0.15, 0.2] });
    },
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.litTitle(ctx, 'MALIN KUNDANG', 540, 300, { size: 92, alpha: prog(t, 0.1, 0.6), sub: 'legenda Minangkabau', halo: L[3] });
});

// 2. Dawn: young Malin sails away on a small boat; his mother waves from the shore by the rumah gadang.
shot('rantau', (t, a, b) => {
  const lt = t - a, p = lt / (b - a);
  const L = K.backlight(ctx, t, LT.dawn, null, 0, { sunY: 0.6 });
  const Cm = { z: 1.15, x: lerp(480, 600, p), y: 990 };
  const sail = ease.inOutSine(clamp(lt / 3.4));
  coast(t, Cm, L, {
    slide: ease.outBack(clamp((lt + 0.1) / 0.7), 1.3),
    front: (col) => { ctx.fillStyle = col; const bx = lerp(620, 900, sail), by = 1225 + Math.sin(t * 2) * 6; K.boat(ctx, bx, by, 1.05); K.puppet(ctx, 'malin', col, { x: bx - 10, y: by - 18, s: 0.8, face: -1, t, armF: [2.6 + Math.sin(t * 6) * 0.25, 0.2] }); },
    stage: (col) => K.puppet(ctx, 'ibu', col, { x: 380, y: 1325, s: 1.0, t, bend: 0.1, armF: [2.5 + Math.sin(t * 5) * 0.3, 0.4], armB: [0.1, 0.4] }),
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.litTitle(ctx, 'Malin merantau', 540, 330, { size: 70, alpha: prog(t, W('rantau', 'merantau') - 0.1, W('rantau', 'merantau') + 0.3), halo: L[3] });
});

// 3. Golden light: years later the great ship sails in; the mother hurries to embrace her son.
shot('kaya', (t, a, b) => {
  const lt = t - a;
  const L = K.backlight(ctx, t, LT.gold, null, 0, { sunY: 0.55 });
  const Cm = { z: 1.12 + 0.08 * clamp(lt / 3), x: 560, y: 980 };
  const sailIn = ease.outCubic(clamp((t - W('kaya', 'kapal') + 0.6) / 1.4));
  const hug = clamp((t - W('kaya', 'memeluknya') + 0.2) / 0.5);
  const run = clamp((t - W('kaya', 'Sang') + 0.4) / 0.9);
  coast(t, Cm, L, {
    slide: ease.outBack(clamp((lt + 0.1) / 0.7), 1.3),
    mid: (col) => { ctx.fillStyle = col; K.ship(ctx, lerp(1400, 780, sailIn), 1130 + Math.sin(t * 1.2) * 6, 0.7); },
    stage: (col) => {
      K.puppet(ctx, 'istri', col, { x: 840, y: 1340, s: 1.0, face: -1, t });
      K.puppet(ctx, 'malin', col, { x: 680, y: 1335, s: 1.1, face: -1, t, rich: true, armF: [0.3 + hug * 0.6, 0.3] });
      K.puppet(ctx, 'ibu', col, { x: lerp(300, 600, ease.inOutSine(run)), y: 1325, s: 1.0, t, walk: run > 0 && run < 1 ? (t - a) * 1.6 : null, bend: 0.2, armF: [0.6 + hug * 1.0, 0.6 + hug * 0.4], armB: [0.4 + hug * 0.8, 0.6] });
    },
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.litTitle(ctx, 'bertahun kemudian...', 540, 320, { size: 64, alpha: prog(t, a + 0.1, a + 0.5), halo: L[3] });
});

// 4. Violet: ashamed, Malin pushes her away; she falls to her knees.
shot('tolak', (t, a, b) => {
  const lt = t - a;
  const L = K.backlight(ctx, t, LT.violet, null, 0, { sunY: 0.6, sun: 0.6 });
  const push = clamp((t - W('tolak', 'mendorongnya') + 0.1) / 0.3);
  const fall = ease.outCubic(clamp((t - W('tolak', 'mendorongnya') - 0.1) / 0.6));
  const Cm = { z: 1.45, x: 600, y: 1080, sx: push > 0 && push < 1 ? noise.n2(t * 30, 1) * 8 : 0 };
  coast(t, Cm, L, {
    slide: 1,
    mid: (col) => { ctx.fillStyle = col; K.ship(ctx, 800, 1130 + Math.sin(t * 1.2) * 6, 0.7); },
    stage: (col) => {
      K.puppet(ctx, 'istri', col, { x: 860, y: 1340, s: 1.0, face: 1, t });
      K.puppet(ctx, 'malin', col, { x: 690, y: 1335, s: 1.1, face: -1, t, rich: true, armF: [0.4 + push * 1.0, 0.1], bend: -push * 0.1 });
      K.puppet(ctx, 'ibu', col, { x: 560 - fall * 80, y: 1325, s: 1.0, t, kneel: fall, bend: 0.2 + fall * 0.4, armF: [0.8 + fall * 0.9, 0.6], armB: [0.6, 0.5] });
    },
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.litTitle(ctx, '"Aku tak kenal kau!"', 540, 340, { size: 66, alpha: env(t, W('tolak', 'malu') - 0.1, b, 0.25, 0.2), halo: L[3] });
});

// 5. Storm: lightning flashes the panel, the ship breaks, Malin turns to stone — then a quiet dawn at Air Manis.
shot('batu', (t, a, b) => {
  const lt = t - a, end = C.batu.end;
  const st = clamp((t - W('batu', 'membatu') + 0.1) / 0.8);
  const calm = clamp((t - W('batu', 'Pantai') + 0.2) / 0.8);
  const L = K.backlight(ctx, t, LT.storm, LT.dawn, calm, { sunY: 0.62, sun: calm });
  // lightning
  const strikes = [W('batu', 'badai') - 0.05, W('batu', 'badai') + 0.5, W('batu', 'membatu') - 0.05];
  let fl = 0; for (const s0 of strikes) { const u = t - s0; if (u > 0 && u < 0.35) fl = Math.max(fl, (1 - u / 0.35) * (u < 0.06 || (u > 0.12 && u < 0.18) ? 1 : 0.5)); }
  const shake = (1 - calm) * 6;
  const Cm = { z: lerp(1.2, 1.32, clamp(lt / 3)), x: 560, y: 1050, sx: noise.n2(t * 20, 1) * shake, sy: noise.n2(t * 20, 5) * shake };
  coast(t, Cm, L, {
    sea: { amp: lerp(46, 14, calm), rough: 1 - calm, speed: lerp(2.2, 0.6, calm) },
    mid: (col) => { if (calm < 1) { ctx.save(); ctx.globalAlpha = 1 - calm; ctx.fillStyle = col; K.ship(ctx, 800 + lt * 20, 1140 + Math.sin(t * 3) * 20, 0.7, { broken: clamp(lt / 1.6), sails: 1 - clamp(lt / 1.5) * 0.6 }); ctx.restore(); } },
    stage: (col) => {
      if (st < 1) { ctx.save(); ctx.globalAlpha = 1 - st; K.puppet(ctx, 'malin', col, { x: 640, y: 1340, s: 1.1, face: -1, t, rich: true, kneel: clamp(lt / 1.0), bend: 0.4 + clamp(lt / 1.0) * 0.5, armF: [1.2, 0.8], armB: [1.0, 0.6] }); ctx.restore(); }
      if (st > 0) { const k = 0.95 * (0.6 + 0.4 * ease.outBack(st, 1.4)); K.drawSheet(ctx, S.rock(), col, 640 - 230 * k, 1345 - 300 * k, { glow: 0.3, glowCol: L[3], s: k }); }
    },
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (calm < 1) { // wind-driven rain in front of every sheet
    ctx.save(); ctx.strokeStyle = `rgba(190,215,255,${0.45 * (1 - calm)})`; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i < 90; i++) { const x = (hrand(i, 1) * 1400 - 200 + (t * 900 * 0.35)) % 1300 - 100, y = (hrand(i, 2) * 2000 + t * 1700) % 2000 - 40; ctx.moveTo(x, y); ctx.lineTo(x - 26, y + 70); }
    ctx.stroke(); ctx.restore();
  }
  if (fl > 0) { ctx.fillStyle = `rgba(220,235,255,${fl * 0.7})`; ctx.fillRect(0, 0, 1080, 1920); }
  K.litTitle(ctx, 'Batu Malin Kundang', 540, 320, { size: 74, alpha: prog(t, W('batu', 'Pantai') - 0.1, W('batu', 'Pantai') + 0.4), halo: L[3], sub: 'Pantai Air Manis, Padang' });
  const close = clamp((t - (end + 0.75)) / 0.45);
  if (close > 0) { ctx.fillStyle = `rgba(5,4,10,${close * 0.55})`; ctx.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= at(sh.id)) s = sh;
  const i = SHOTS.indexOf(s);
  const a = Math.max(0, at(s.id)), b = SHOTS[i + 1] ? at(SHOTS[i + 1].id) : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - a;
  if (i > 0 && since < 0.18) { ctx.fillStyle = `rgba(255,240,220,${0.3 * (1 - since / 0.18)})`; ctx.fillRect(0, 0, 1080, 1920); }
  K.boxFrame(ctx);
}
