// Boneka Rajut demo 2: "Kancil dan Barisan Buaya Sungai" — 10 shots on a felt diorama.
import * as K from '/styles/boneka-rajut/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const { PAL } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'kids', y: 1470, size: 70, anim: 'rise' } };

let ctx, fx;
const C = {}, L = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  L.far = K.hillLayer('kc-far', { y0: 0, amp: 80, color: PAL.hillFar, seed: 4, stitch: '#cde4b0', trees: 9 });
  L.mid = K.hillLayer('kc-mid', { y0: 0, amp: 58, color: PAL.hillMid, seed: 5, stitch: '#def0b8', flowers: 16 });
  L.btop = K.hillLayer('kc-btop', { y0: 0, amp: 28, color: PAL.hillNear, seed: 6, stitch: '#e9f6c5', flowers: 20 });
  L.blow = K.hillLayer('kc-blow', { y0: 0, amp: 32, color: PAL.grass, seed: 8, stitch: '#eff9d0', flowers: 24 });

  AM.sfx('pop', 0.15, { gain: 0.4 });
  AM.sfx('pop', W('buaya', 'Buaya'), { gain: 0.45, pitch: 0.85 });
  AM.sfx('chime', W('buaya', 'cerdik'), { gain: 0.4 });
  AM.sfx('pop', W('setuju', 'gembira'), { gain: 0.4, pitch: 1.15 });
  AM.sfx('jump', W('lompat1', 'Satu'), { gain: 0.4 });
  AM.sfx('jump', W('lompat1', 'dua'), { gain: 0.4, pitch: 1.1 });
  AM.sfx('jump', W('lompat1', 'tiga'), { gain: 0.4, pitch: 1.2 });
  AM.sfx('jump', W('lompat2', 'Empat'), { gain: 0.4 });
  AM.sfx('jump', W('lompat2', 'lima'), { gain: 0.4, pitch: 1.1 });
  AM.sfx('jump', W('lompat2', 'enam'), { gain: 0.4, pitch: 1.25 });
  AM.sfx('boing', W('hikmah', 'kesal'), { gain: 0.4 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const list = SHOTS.filter((x) => C[x.id]);
  const i = list.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, list[i + 1] ? C[list[i + 1].id].start - 0.12 : AM.duration + 1];
};

function backdrop(c, t, { sunset = 0, riverY = 930, riverH = 380 } = {}) {
  K.sky(ctx, { sunset });
  K.cam(ctx, c, 0.15);
  K.sun(ctx, 850, 250 + sunset * 140, { s: 0.9, t, color: sunset > 0.4 ? '#f29b38' : PAL.sun });
  K.cloud(ctx, 210 + ((t * 14) % 1400) - 200, 290, { s: 0.95, seed: 0 });
  K.cloud(ctx, 760 + ((t * 9) % 1400) - 200, 380, { s: 0.8, seed: 1 });
  K.cam(ctx, c, 0.35); K.drawLayer(ctx, L.far, 640);
  K.cam(ctx, c, 0.6); K.drawLayer(ctx, L.mid, 760);
  K.cam(ctx, c, 1);
  K.drawLayer(ctx, L.btop, 860);
  K.river(ctx, riverY, riverH, t);
  K.drawLayer(ctx, L.blow, riverY + riverH);
}

// 1. Kancil walks hungrily along the river bank
shot('lapar', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const c = { x: lerp(460, 540, ease.inOutSine(p)), y: 980, z: lerp(1.0, 1.08, p) };
  backdrop(c, t);
  K.appleTree(ctx, 900, 880, { s: 0.78, t, apples: 6 });

  const tSungai = W('lapar', 'sungai');
  const stopWalk = clamp((t - (tSungai - 0.3)) / 0.4);
  const kx = lerp(160, 340, ease.outCubic(clamp(p * 1.35)));
  K.contactShadow(ctx, kx, 1320, 180, 0.45);
  const kc = K.kancil(ctx, {
    x: kx, y: 1320, s: 0.88, t, face: 1,
    walk: stopWalk < 1 ? 10 : 0, look: 0.35, mood: stopWalk > 0.5 ? 'o' : 'frown', brows: 'sad',
    armL: 0.3, armR: stopWalk > 0.5 ? 1.1 : 0.3,
  });
  K.signpost(ctx, 'SI KANCIL', kx - 120, 1340, { s: 0.85, pop: prog(t, W('lapar', 'Kancil') - 0.1, W('lapar', 'Kancil') + 0.35), t });
  const pLap = prog(t, W('lapar', 'keroncongan') - 0.1, W('lapar', 'keroncongan') + 0.35, ease.outBack);
  if (pLap > 0) K.patch(ctx, 'LAPAR...', kc.head[0] - 20, kc.top[1] - 55, { size: 40, fill: PAL.cream, ink: PAL.red, s: pLap });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.banner(ctx, 'KANCIL & BARISAN BUAYA', 540, lerp(-160, 220, prog(t, a + 0.05, a + 0.65, ease.outBack)), { t, size: 52 });
});

// 2. Red apple tree across the deep river
shot('seberang', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const pan = ease.inOutSine(clamp(p * 1.2));
  const c = { x: lerp(520, 690, pan), y: lerp(960, 890, pan), z: lerp(1.05, 1.2, pan) };
  backdrop(c, t);
  K.appleTree(ctx, 860, 880, { s: 0.95, t, apples: 6 });
  K.contactShadow(ctx, 260, 1320, 175, 0.45);
  const kc = K.kancil(ctx, { x: 260, y: 1320, s: 0.85, t, face: 1, look: 0.45, mood: 'smile', eyes: 'wide', armR: 1.45 });

  const pApel = prog(t, W('seberang', 'apel') - 0.1, W('seberang', 'apel') + 0.35, ease.outBack);
  if (pApel > 0) {
    K.patch(ctx, 'APEL MERAH MANIS!', 830, 480, { size: 42, fill: PAL.red, ink: PAL.white, s: pApel });
    K.heart(ctx, 720, 560, 0.85 * pApel, { rot: -0.2 });
    K.heart(ctx, 960, 560, 0.85 * pApel, { rot: 0.2 });
  }
  const pDalam = prog(t, W('seberang', 'dalam') - 0.1, W('seberang', 'dalam') + 0.35, ease.outBack);
  if (pDalam > 0) {
    K.drop(ctx, kc.head[0] - 65, kc.head[1] - 20, 0.9 * pDalam);
    K.patch(ctx, 'TERLALU DALAM!', 520, 1110, { size: 38, fill: PAL.cream, ink: PAL.ink, s: pDalam });
  }
});

// 3. Hungry crocodiles surface; Kancil gets a clever idea
shot('buaya', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const c = { x: 540, y: 1020, z: lerp(1.08, 1.16, p) };
  backdrop(c, t);
  const tBuaya = W('buaya', 'Buaya'), tCerdik = W('buaya', 'cerdik');
  const rise = prog(t, tBuaya - 0.15, tBuaya + 0.4, ease.outBack);
  if (rise > 0.02) {
    K.crocodile(ctx, { x: 560, y: lerp(1180, 1050, rise), s: 0.88, t, face: -1, open: 0.45, seed: 1 });
    K.crocodile(ctx, { x: 780, y: lerp(1240, 1140, rise), s: 0.82, t, face: -1, open: 0.35, seed: 2 });
    K.signpost(ctx, 'BUAYA LAPAR', 760, 1290, { s: 0.8, pop: rise, t });
  }
  const idea = prog(t, tCerdik - 0.1, tCerdik + 0.35, ease.outBack);
  K.contactShadow(ctx, 250, 1310, 180, 0.45);
  const kc = K.kancil(ctx, {
    x: 250, y: 1310, s: 0.9, t, face: 1,
    look: 0.35, mood: idea > 0.3 ? 'sly' : 'o', brows: idea > 0.3 ? 'sly' : 'up',
    armR: idea > 0.3 ? 1.8 : 0.5,
  });
  if (idea > 0) {
    K.star(ctx, kc.top[0], kc.top[1] - 50, 1.15 * idea, { rot: t * 0.8 });
    K.patch(ctx, 'ADA AKAL CERDIK!', kc.head[0] + 40, kc.top[1] - 125, { size: 42, fill: PAL.sun, ink: PAL.ink, s: idea });
  }
});

// 4. Kancil wears a felt crown and announces the King's feast
shot('titah', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const c = { x: 360, y: 1120, z: lerp(1.3, 1.38, ease.inOutSine(p)) };
  backdrop(c, t);
  const pRaja = prog(t, W('titah', 'Raja') - 0.1, W('titah', 'Raja') + 0.35, ease.outBack);
  K.contactShadow(ctx, 290, 1310, 185, 0.45);
  K.kancil(ctx, {
    x: 290, y: 1310, s: 0.98, t, face: 1,
    look: 0.3, mood: 'grin', talk: 1, crown: pRaja,
    armL: 0.6, armR: 1.55 + Math.sin(t * 6) * 0.2,
  });
  K.crocodile(ctx, { x: 640, y: 1120, s: 0.85, t, face: -1, open: 0.2, seed: 1 });
  const pPesta = prog(t, W('titah', 'pesta') - 0.1, W('titah', 'pesta') + 0.35, ease.outBack);
  if (pPesta > 0) K.patch(ctx, 'UNDANGAN PESTA RAJA HUTAN!', 410, 860, { size: 38, fill: PAL.red, ink: PAL.white, s: pPesta });
  const pHit = prog(t, W('titah', 'menghitung') - 0.1, W('titah', 'menghitung') + 0.35, ease.outBack);
  if (pHit > 0) K.patch(ctx, 'AYO HITUNG SEMUA BUAYA!', 430, 955, { size: 36, fill: PAL.sun, ink: PAL.ink, s: pHit });
});

// 5. Crocodile leader cheers and summons crocodile friends
shot('setuju', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const c = { x: 580, y: 1060, z: lerp(1.22, 1.08, ease.inOutSine(p)) };
  backdrop(c, t);
  K.contactShadow(ctx, 170, 1310, 170, 0.45);
  K.kancil(ctx, { x: 170, y: 1310, s: 0.82, t, face: 1, look: 0.35, mood: 'sly', crown: 1 });
  const crLead = K.crocodile(ctx, { x: 520, y: 1030, s: 0.95, t, face: -1, open: 0.45, talk: 1, seed: 1 });
  const pGem = prog(t, W('setuju', 'gembira') - 0.1, W('setuju', 'gembira') + 0.35, ease.outBack);
  if (pGem > 0) {
    K.heart(ctx, crLead.head[0] - 40, crLead.head[1] - 70, 0.9 * pGem, { rot: -0.2 });
    K.patch(ctx, 'ASIK! JAMUAN RAJA!', crLead.head[0] + 60, crLead.head[1] - 95, { size: 38, fill: PAL.cream, ink: PAL.ink, s: pGem });
  }
  const tTem = W('setuju', 'teman-temannya');
  [[380, 1150, 0], [690, 1130, 0.12], [830, 1050, 0.24], [920, 1170, 0.36]].forEach(([fx0, fy0, d], idx) => {
    const pop = prog(t, tTem - 0.1 + d, tTem + 0.35 + d, ease.outBack);
    if (pop > 0.02) K.crocodile(ctx, { x: fx0, y: lerp(fy0 + 90, fy0, pop), s: 0.8 * pop, t, face: -1, open: 0.3, seed: idx + 3 });
  });
});

// 6. 6 crocodiles line up into a living bridge across the river
shot('baris', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const c = { x: 540, y: 980, z: lerp(1.05, 0.96, ease.inOutSine(p)) };
  backdrop(c, t, { riverY: 780, riverH: 600 });
  K.appleTree(ctx, 950, 760, { s: 0.82, t, apples: 6 });
  const alignU = prog(t, W('baris', 'berbaris') - 0.2, W('baris', 'berbaris') + 0.9, ease.inOutCubic);
  for (let i = 0; i < 6; i++) {
    const tx = 240 + i * 125, ty = 1090 - i * 32;
    const sx = tx + (i % 2 ? 90 : -90), sy = ty + (i % 2 ? -80 : 80);
    K.crocodile(ctx, { x: lerp(sx, tx, alignU), y: lerp(sy, ty, alignU), s: 0.68, t, face: 1, open: 0.1, seed: i + 1 });
  }
  K.contactShadow(ctx, 115, 1180, 160, 0.45);
  K.kancil(ctx, { x: 115, y: 1180, s: 0.8, t, face: 1, look: 0.35, mood: 'smile', armR: 1.5, crown: 1 });
  const pJem = prog(t, W('baris', 'jembatan') - 0.1, W('baris', 'jembatan') + 0.35, ease.outBack);
  if (pJem > 0) K.patch(ctx, 'JEMBATAN HIDUP BUAYA!', 540, 620, { size: 46, fill: PAL.sun, ink: PAL.ink, s: pJem });
});

// 7. Kancil hops across Crocodiles 1, 2, 3 ("SATU! DUA! TIGA!")
shot('lompat1', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const tSatu = W('lompat1', 'Satu'), tDua = W('lompat1', 'dua'), tTiga = W('lompat1', 'tiga');
  const c = { x: lerp(380, 520, p), y: 1030, z: 1.15 };
  backdrop(c, t, { riverY: 840, riverH: 520 });
  [[260, 1140, tSatu, 1], [460, 1110, tDua, 2], [660, 1080, tTiga, 3], [860, 1050, Infinity, null]].forEach(([cx, cy, tHit, num], idx) => {
    const hitP = t >= tHit && t < tHit + 0.3 ? Math.sin(((t - tHit) / 0.3) * Math.PI) : 0;
    K.crocodile(ctx, { x: cx, y: cy + hitP * 18, s: 0.78, t, face: 1, open: 0.08, badge: t >= tHit ? num : null, seed: idx + 1 });
  });
  let kx = 110, ky = 1180, hopH = 0;
  if (t < tSatu) {
    const u = clamp((t - (tSatu - 0.45)) / 0.45);
    kx = lerp(110, 260, u); ky = lerp(1180, 1070, u); hopH = Math.sin(u * Math.PI) * 110;
  } else if (t < tDua) {
    const u = clamp((t - tSatu) / Math.max(0.25, tDua - tSatu));
    kx = lerp(260, 460, u); ky = lerp(1070, 1040, u); hopH = Math.sin(u * Math.PI) * 120;
  } else {
    const u = clamp((t - tDua) / Math.max(0.25, tTiga - tDua));
    kx = lerp(460, 660, u); ky = lerp(1040, 1010, u); hopH = Math.sin(u * Math.PI) * 120;
  }
  K.kancil(ctx, { x: kx, y: ky, s: 0.82, t, face: 1, hop: hopH, look: 0.3, mood: 'grin', talk: 1, armL: 0.9, armR: 1.4, crown: 1 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const countStr = t >= tTiga ? 'HITUNGAN: 1 - 2 - 3!' : t >= tDua ? 'HITUNGAN: 1 - 2...' : t >= tSatu ? 'HITUNGAN: 1...' : 'MULAI MELOMPAT!';
  K.patch(ctx, countStr, 540, 220, { size: 50, fill: PAL.red, ink: PAL.white });
});

// 8. Kancil hops across Crocodiles 4, 5, 6 and reaches the far bank
shot('lompat2', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const tEmpat = W('lompat2', 'Empat'), tLima = W('lompat2', 'lima'), tEnam = W('lompat2', 'enam'), tSeb = W('lompat2', 'seberang');
  const c = { x: lerp(520, 700, ease.inOutSine(p)), y: 960, z: 1.12 };
  backdrop(c, t, { riverY: 840, riverH: 520 });
  K.appleTree(ctx, 960, 830, { s: 0.92, t, apples: 6 });
  [[280, 1110, tEmpat, 4], [480, 1060, tLima, 5], [680, 1010, tEnam, 6]].forEach(([cx, cy, tHit, num], idx) => {
    const hitP = t >= tHit && t < tHit + 0.3 ? Math.sin(((t - tHit) / 0.3) * Math.PI) : 0;
    K.crocodile(ctx, { x: cx, y: cy + hitP * 18, s: 0.78, t, face: 1, open: 0.08, badge: t >= tHit ? num : null, seed: idx + 4 });
  });
  let kx = 280, ky = 1040, hopH = 0;
  if (t < tLima) {
    const u = clamp((t - tEmpat) / Math.max(0.25, tLima - tEmpat));
    kx = lerp(280, 480, u); ky = lerp(1040, 990, u); hopH = Math.sin(u * Math.PI) * 115;
  } else if (t < tEnam + 0.45) {
    const u = clamp((t - tLima) / Math.max(0.25, tEnam - tLima));
    kx = lerp(480, 680, u); ky = lerp(990, 940, u); hopH = Math.sin(u * Math.PI) * 115;
  } else {
    const u = clamp((t - (tEnam + 0.45)) / 0.65);
    kx = lerp(680, 860, ease.outCubic(u)); ky = lerp(940, 855, u); hopH = Math.sin(u * Math.PI) * 130;
  }
  K.kancil(ctx, { x: kx, y: ky, s: 0.84, t, face: 1, hop: hopH, look: 0.3, mood: 'grin', armL: 1.2, armR: 1.5, crown: 1 });
  const pSeb = prog(t, tSeb - 0.1, tSeb + 0.35, ease.outBack);
  if (pSeb > 0) {
    K.star(ctx, 860, 560, 1.15 * pSeb, { rot: t });
    K.patch(ctx, 'SAMPAI DI SEBERANG!', 740, 580, { size: 44, fill: PAL.sun, ink: PAL.ink, s: pSeb });
  }
});

// 9. Kancil waves from the far bank and admits there is no feast
shot('jujur', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const c = { x: 660, y: 920, z: lerp(1.18, 1.26, p) };
  backdrop(c, t, { riverY: 880, riverH: 480 });
  K.appleTree(ctx, 940, 850, { s: 0.96, t, apples: 6 });
  K.crocodile(ctx, { x: 380, y: 1120, s: 0.82, t, face: 1, open: 0.4, badge: 5, seed: 5 });
  K.crocodile(ctx, { x: 560, y: 1050, s: 0.85, t, face: 1, open: 0.5, badge: 6, seed: 6 });
  K.contactShadow(ctx, 810, 865, 175, 0.45);
  const kc = K.kancil(ctx, {
    x: 810, y: 865, s: 0.92, t, face: -1,
    hop: Math.abs(Math.sin(t * 5)) * 18, look: 0.35, mood: 'grin', eyes: 'happy', talk: 1, blush: 0.8,
    armL: 2.1 + Math.sin(t * 9) * 0.35, armR: 0.5,
  });
  const pTer = prog(t, W('jujur', 'Terima') - 0.1, W('jujur', 'Terima') + 0.35, ease.outBack);
  if (pTer > 0) K.patch(ctx, 'TERIMA KASIH BUAYA!', kc.head[0] - 120, kc.top[1] - 60, { size: 38, fill: PAL.cream, ink: PAL.ink, s: pTer });
  const pBuah = prog(t, W('jujur', 'buah') - 0.15, W('jujur', 'buah') + 0.3, ease.outBack);
  if (pBuah > 0) K.patch(ctx, 'CUMA MAU PETIK APEL!', 560, 740, { size: 38, fill: PAL.red, ink: PAL.white, s: pBuah });
});

// 10. Sunset finale: baffled crocodiles vs happy Kancil eating red apples + moral banner
shot('hikmah', (t, a, b) => {
  const p = clamp((t - a) / (AM.duration - a));
  const c = { x: 540, y: 940, z: lerp(1.08, 1.0, ease.inOutSine(p)) };
  backdrop(c, t, { sunset: clamp(p * 1.2), riverY: 900, riverH: 440 });
  K.appleTree(ctx, 900, 860, { s: 0.92, t, apples: 4 });
  const cr1 = K.crocodile(ctx, { x: 310, y: 1120, s: 0.85, t, face: 1, open: 0.85, seed: 1 });
  const cr2 = K.crocodile(ctx, { x: 540, y: 1060, s: 0.88, t, face: 1, open: 0.9, seed: 2 });
  const pKes = prog(t, W('hikmah', 'kesal') - 0.1, W('hikmah', 'kesal') + 0.35, ease.outBack);
  if (pKes > 0) {
    K.drop(ctx, cr1.head[0] - 40, cr1.head[1] - 50, 0.95 * pKes);
    K.patch(ctx, 'KITA TERTIPU!', cr2.head[0] - 40, cr2.head[1] - 80, { size: 38, fill: PAL.cream, ink: PAL.red, s: pKes });
  }
  K.contactShadow(ctx, 810, 875, 175, 0.45);
  const kc = K.kancil(ctx, { x: 810, y: 875, s: 0.88, t, face: -1, look: 0.3, mood: 'chew', eyes: 'happy', blush: 1, armL: 1.2, armR: 1.2 });
  const pApel = prog(t, W('hikmah', 'apel') - 0.1, W('hikmah', 'apel') + 0.35, ease.outBack);
  if (pApel > 0) {
    K.heart(ctx, kc.head[0] - 60, kc.top[1] - 40, 0.9 * pApel, { rot: -0.2 });
    K.star(ctx, kc.head[0] + 60, kc.top[1] - 50, 0.9 * pApel, { rot: 0.2 });
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const pMoral = prog(t, W('hikmah', 'cerdik') - 0.1, W('hikmah', 'cerdik') + 0.45, ease.outBack);
  if (pMoral > 0.02) {
    K.banner(ctx, 'CERDIK MENGALAHKAN KEKUATAN', 540, 210, { t, size: 46, fill: PAL.red, ink: PAL.white, alpha: pMoral, s: pMoral });
  }
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (since < 0.16 && s.id !== 'lapar') { fx.fillStyle = `rgba(255,246,228,${0.35 * (1 - since / 0.16)})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.vignette(fx, { strength: 0.32, inner: 0.5, color: '60,35,20' });
  AM.lib.grain(fx, t, { amount: 0.035, fps: 12 });
}
