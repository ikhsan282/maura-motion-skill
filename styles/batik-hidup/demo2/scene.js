// Batik Hidup demo2: "Filosofi Batik Kawung — Dari Empat Belahan Buah Aren hingga Simbol Kesucian Hati" — 8 shots (55s).
import * as K from '/styles/batik-hidup/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;
const P = K.PAL, TAU = Math.PI * 2;

export const meta = { fps: 24, hold: 2, captions: { preset: 'elegant', y: 1500, size: 60, maxWords: 4, stroke: 0, box: { fill: 'rgba(36,20,10,.82)', pad: 16, radius: 6, border: '#d9a441', borderW: 2 } } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  K.kawungTile(P.soga, P.cream, P.sogaLt, 140);
  K.kawungTile('rgba(0,0,0,0)', P.wax, 'rgba(0,0,0,0)', 140);
  K.kawungTile(P.indigo, P.cream, P.indigoLt, 140);
  K.crackle(); K.weave();
  AM.sfx('pencil', 0.05, { gain: 0.35 });
  AM.sfx('gong', W('asal', 'Kawung'), { gain: 0.45 });
  AM.sfx('pop', W('aren', 'kolang-kaling'), { gain: 0.38 });
  AM.sfx('chime', W('kosmos', 'pusat'), { gain: 0.38 });
  AM.sfx('bubble', W('hati', 'canting'), { gain: 0.38, pitch: 0.75 });
  AM.sfx('gong', W('abdi', 'keraton'), { gain: 0.42, pitch: 1.05 });
  AM.sfx('chime', W('warisan', 'Kawung'), { gain: 0.35 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// Helper: draw one giant animated Kawung rosette (4 palm-fruit ovals + centre cross + cecek dots)
function kawungRosette(x, y, R, t, { line = P.cream, fill = P.sogaLt, core = P.gold, spread = 1 } = {}) {
  ctx.save(); ctx.translate(x, y);
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2, d = R * 0.48 * spread;
    ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d); ctx.rotate(a);
    ctx.beginPath(); ctx.ellipse(0, 0, R * 0.44, R * 0.25, 0, 0, TAU);
    ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = line; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, R * 0.24, R * 0.11, 0, 0, TAU);
    ctx.fillStyle = P.mori; ctx.fill(); ctx.stroke();
    ctx.fillStyle = line;
    ctx.beginPath(); ctx.arc(-R * 0.28, 0, 5, 0, TAU); ctx.arc(R * 0.28, 0, 5, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // Centre diamond/cross (pancer)
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(0, 0, 14 + Math.sin(t * 3) * 2, 0, TAU); ctx.fill();
  ctx.strokeStyle = line; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(24, 0); ctx.moveTo(0, -24); ctx.lineTo(0, 24); ctx.stroke();
  ctx.restore();
}

// 1. Hook: Canting draws Kawung wax geometry on white mori cotton, then soga dye rises.
shot('hook', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const z = 1.22 - 0.12 * ease.inOutSine(p);
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z);
  const wax = clamp(0.35 + p * 0.75);
  const dye = ease.inOutCubic(clamp((p - 0.35) / 0.55));
  const tiles = {
    wax: K.kawungTile('rgba(0,0,0,0)', P.wax, 'rgba(0,0,0,0)', 140),
    dyed: K.kawungTile(P.soga, P.cream, P.sogaLt, 140),
  };
  const tip = K.cloth(ctx, t, { wax, dye, ox: t * 8, oy: t * 4, tiles });
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z);
  if (dye < 0.85) K.canting(ctx, tip[0], tip[1], t, { s: 1.35, rot: -0.4, glow: 1 - dye * 0.7 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.overlay(ctx, K.crackle(P.sogaDk), 0.45 * dye);
  K.overlay(ctx, K.weave(), 0.75);
  K.waxText(ctx, 'Batik Kawung', 540, 360, clamp((t - a - 0.3) / 0.8), { size: 108 });
  K.plaque(ctx, 'GEOMETRI KLASIK JAWA', 540, 515, { size: 46, sub: 'empat bulatan simetris', alpha: prog(t, a + 0.8, a + 1.2) });
});

// 2. Asal: Abad ke-13, arca candi batu berbusana kain Kawung.
shot('asal', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const z = 1.05 + 0.08 * ease.inOutSine(p);
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z);
  ctx.fillStyle = P.indigoDk; ctx.fillRect(-150, -150, 1400, 2200);
  K.motifFill(ctx, K.kawungTile(P.indigo, P.cream, P.indigoLt, 130), { ox: t * 10, oy: 0 });
  ctx.globalAlpha = 0.4; ctx.fillRect(-150, -150, 1400, 2200); ctx.globalAlpha = 1;
  // Temple stone archway + meditating ancient statue wearing Kawung kain
  K.regol(ctx, 540, 1180, 1.32);
  K.figure(ctx, 'senopati', { x: 540, y: 1220, s: 1.45, t, closed: true, arm: 0.25, cloth: K.kawungTile(P.soga, P.cream, P.sogaLt, 70) });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'MOTIF TERTUA TANAH JAWA', 540, 250, { size: 48, sub: 'terpahat pada arca candi abad ke-13', alpha: prog(t, a + 0.2, a + 0.6) });
});

// 3. Aren: Buah aren / kolang-kaling yang dibelah empat menjadi motif Kawung.
shot('aren', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  ctx.fillStyle = P.sogaDk; ctx.fillRect(0, 0, 1080, 1920);
  K.motifFill(ctx, K.kawungTile(P.soga, P.cream, P.sogaLt, 160), { ox: -t * 12, oy: t * 8 });
  ctx.globalAlpha = 0.28; ctx.fillRect(0, 0, 1080, 1920); ctx.globalAlpha = 1;
  const split = ease.outBack(clamp((t - W('aren', 'empat') + 0.4) / 0.9), 1.6);
  kawungRosette(540, 930, 320, t, { spread: lerp(0.25, 1.0, split), fill: P.sogaLt, line: P.cream, core: P.gold });
  K.overlay(ctx, K.weave(), 0.75);
  K.waxText(ctx, 'Buah Aren', 540, 310, clamp((t - a - 0.2) / 0.7), { size: 96 });
  K.plaque(ctx, 'KOLANG-KALING DIBELAH EMPAT', 540, 450, { size: 44, sub: 'putih bersih di balik kulit keras', alpha: prog(t, W('aren', 'aren') - 0.1, W('aren', 'aren') + 0.3) });
});

// 4. Pohon: Pohon aren batik line-art dari akar hingga pucuk bermanfaat bagi sesama.
shot('pohon', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  ctx.fillStyle = P.mori; ctx.fillRect(0, 0, 1080, 1920);
  // Framed top & bottom by Kawung bands
  for (const [y0, h] of [[0, 340], [1560, 360]]) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, 1080, h);
    K.motifFill(ctx, K.kawungTile(P.soga, P.cream, P.sogaLt, 120), { ox: t * 18 }); ctx.fill(); ctx.restore();
  }
  // Sugar palm (pohon aren) in batik line-art at centre
  ctx.save(); ctx.translate(540, 1440);
  ctx.fillStyle = P.sogaDk; ctx.strokeStyle = P.cream; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-42, 0); ctx.quadraticCurveTo(-28, -320, -24, -620); ctx.lineTo(24, -620); ctx.quadraticCurveTo(28, -320, 42, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Palm fronds swaying
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const ang = i * 0.38 + Math.sin(t * 1.8 + i) * 0.04;
    ctx.save(); ctx.translate(0, -620); ctx.rotate(ang);
    ctx.fillStyle = P.indigo;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(i * 65, -90, i * 120, 20); ctx.quadraticCurveTo(i * 60, -30, 0, 0); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // Hanging clusters of aren fruit (kolang-kaling) in gold/cream
  for (const sd of [-1, 1]) {
    for (let r = 0; r < 5; r++) {
      ctx.fillStyle = P.gold; ctx.beginPath(); ctx.ellipse(sd * 52, -550 + r * 32, 16, 22, 0, 0, TAU); ctx.fill(); ctx.stroke();
    }
  }
  ctx.restore();
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'POHON KEHIDUPAN', 540, 450, { size: 50, sub: 'daun, batang, nira & buah bermanfaat', alpha: prog(t, a + 0.2, a + 0.6) });
});

// 5. Kosmos: Empat penjuru mata angin & satu titik pusat kesadaran (Papat Kiblat Lima Pancer).
shot('kosmos', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  ctx.fillStyle = P.indigoDk; ctx.fillRect(0, 0, 1080, 1920);
  K.motifFill(ctx, K.kawungTile(P.indigo, P.cream, P.indigoLt, 140), { ox: 0, oy: 0 });
  ctx.globalAlpha = 0.35; ctx.fillRect(0, 0, 1080, 1920); ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(540, 960); ctx.rotate(t * 0.12);
  kawungRosette(0, 0, 340, t, { fill: P.indigoLt, line: P.cream, core: P.gold, spread: 1 });
  ctx.restore();
  // Compass labels around the rosette
  const dirs = [['UTARA', 540, 510], ['SELATAN', 540, 1410], ['BARAT', 125, 960], ['TIMUR', 955, 960]];
  dirs.forEach(([lab, x, y], i) => {
    K.plaque(ctx, lab, x, y, { size: 32, alpha: prog(t, a + 0.3 + i * 0.15, a + 0.6 + i * 0.15) });
  });
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'PAPAT KIBLAT LIMA PANCER', 540, 260, { size: 48, sub: 'empat penjuru berporos pada satu pusat', alpha: prog(t, a + 0.15, a + 0.5) });
});

// 6. Hati: Canting close-up tracing Kawung wax lines +indigo dye & crackle veins.
shot('hati', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  const z = 1.55 - 0.25 * ease.inOutSine(p);
  const sweep = clamp(0.2 + p * 0.75);
  const dye = ease.inOutCubic(clamp((p - 0.45) / 0.45));
  const R = { x: -500, y: -500, w: 2080, h: 2920 };
  const tiles = {
    wax: K.kawungTile('rgba(0,0,0,0)', P.wax, 'rgba(0,0,0,0)', 150),
    dyed: K.kawungTile(P.sogaDk, P.cream, P.soga, 150),
  };
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z);
  const tip = K.cloth(ctx, t, { ...R, wax: sweep, dye, ground: P.sogaDk, tiles });
  if (dye < 0.7) K.canting(ctx, tip[0], tip[1], t, { s: 1.2, rot: -0.38, glow: 1 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.overlay(ctx, K.crackle(P.sogaDk), 0.5 * dye);
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'KESUCIAN & KENDALI DIRI', 540, 270, { size: 48, sub: 'menjaga hati tetap bersih dari pamrih', alpha: prog(t, a + 0.2, a + 0.55) });
});

// 7. Abdi: Keraton Yogyakarta/Surakarta — Sultan & Abdi Dalem mengenakan kain Kawung.
shot('abdi', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const z = 1.0 + 0.08 * ease.inOutSine(p);
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 980 * z);
  ctx.fillStyle = P.soga; ctx.fillRect(-200, -200, 1500, 2400);
  K.motifFill(ctx, K.kawungTile(P.sogaDk, P.cream, P.soga, 110));
  ctx.globalAlpha = 0.4; ctx.fillRect(-200, -200, 1500, 2400); ctx.globalAlpha = 1;
  K.regol(ctx, 540, 980, 1.25);
  K.payung(ctx, 360, 460, 1.0, t);
  const kwSmall = K.kawungTile(P.soga, P.cream, P.sogaLt, 60);
  K.figure(ctx, 'sultan', { x: 370, y: 1400, s: 1.02, t, arm: 0.4, cloth: kwSmall });
  K.figure(ctx, 'abdi', { x: 760, y: 1400, s: 1.05, face: -1, t, bow: clamp((t - a - 0.3) / 0.6), cloth: kwSmall });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'PENGABDIAN TANPA PAMRIH', 540, 250, { size: 48, sub: 'busana bangsawan & abdi dalem keraton', alpha: prog(t, a + 0.15, a + 0.5) });
});

// 8. Warisan: Generasi masa kini berjalan mengenakan Batik Kawung.
shot('warisan', (t, a, b) => {
  const lt = t - a, end = C.warisan.end;
  ctx.fillStyle = P.mori; ctx.fillRect(0, 0, 1080, 1920);
  for (const [y0, h] of [[0, 420], [1460, 460]]) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, 1080, h);
    K.motifFill(ctx, K.kawungTile(P.soga, P.cream, P.sogaLt, 130), { ox: -lt * 36 }); ctx.fill(); ctx.restore();
  }
  const stop = end + 0.2, walkT = Math.min(t, stop) - a;
  const kw1 = K.kawungTile(P.indigo, P.cream, P.indigoLt, 55);
  const kw2 = K.kawungTile(P.soga, P.cream, P.sogaLt, 55);
  const people = [
    { x: 120, top: kw1, kain: kw2, cap: 'hair', bun: true, legs: P.skin, s: 0.96 },
    { x: -160, top: kw2, kain: null, cap: 'blangkon', legs: P.sogaDk, s: 1.02 },
    { x: -420, top: P.red, kain: kw1, cap: 'hair', legs: P.skin, s: 0.94 },
  ];
  people.forEach((q, i) => {
    const x = q.x + walkT * 185, walking = t < stop;
    K.figure(ctx, 'walker', { x, y: 1430, s: q.s * 1.28, t, phase: walking ? walkT * 1.5 + i * 0.3 : 0, top: q.top, kain: q.kain, cloth: q.kain || undefined, cap: q.cap, bun: q.bun, legs: q.legs });
  });
  K.waxText(ctx, 'Urip Iku Urup', 540, 240, clamp(lt / 0.8), { size: 92 });
  K.plaque(ctx, 'HIDUP YANG BERMANFAAT BAGI SESAMA', 540, 370, { size: 42, sub: 'Warisan Luhur Batik Kawung Nusantara', alpha: prog(t, a + 0.3, a + 0.7) });
  K.overlay(ctx, K.weave(), 0.75);
  const close = clamp((t - (end + 0.7)) / 0.45);
  if (close > 0) { ctx.fillStyle = `rgba(30,15,6,${close * 0.5})`; ctx.fillRect(0, 0, 1080, 1920); }
});

export function render(t, AM) {
  let s = SHOTS[0];
  for (const sh of SHOTS) if (t >= at(sh.id)) s = sh;
  const i = SHOTS.indexOf(s);
  const a = Math.max(0, at(s.id)), b = SHOTS[i + 1] ? at(SHOTS[i + 1].id) : AM.duration + 1;
  ctx.save(); s.fn(t, a, b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - a;
  if (i > 0 && since < 0.16) { ctx.fillStyle = `rgba(255,236,190,${0.35 * (1 - since / 0.16)})`; ctx.fillRect(0, 0, 1080, 1920); }
  AM.lib.vignette(ctx, { strength: 0.45, inner: 0.5 });
}

