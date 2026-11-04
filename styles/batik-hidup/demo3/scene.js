// Batik Hidup demo3: "Batik Mega Mendung Cirebon — Tujuh Lapisan Awan Penyejuk Hati" — 8 shots (55s).
import * as K from '/styles/batik-hidup/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;
const P = K.PAL, TAU = Math.PI * 2;
const RED_CIREBON = '#8c1f19', RED_DK = '#54100d';

export const meta = { fps: 24, hold: 2, captions: { preset: 'elegant', y: 1500, size: 60, maxWords: 4, stroke: 0, box: { fill: 'rgba(36,20,10,.82)', pad: 16, radius: 6, border: '#d9a441', borderW: 2 } } };

let ctx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  K.megaTile('wax', RED_CIREBON); K.megaTile('dyed', RED_CIREBON);
  K.megaTile('dyed', P.indigoDk); K.crackle(); K.weave();
  AM.sfx('pencil', 0.05, { gain: 0.35 });
  AM.sfx('whoosh', W('pelabuhan', 'kapal-kapal'), { gain: 0.4, pitch: 0.85 });
  AM.sfx('chime', W('akulturasi', 'perpaduan'), { gain: 0.4 });
  AM.sfx('pencil', W('lancip', 'canting'), { gain: 0.38 });
  AM.sfx('gong', W('tujuh', 'tujuh'), { gain: 0.45 });
  AM.sfx('bubble', W('teduh', 'hujan'), { gain: 0.4, pitch: 0.8 });
  AM.sfx('chime', W('kini', 'mendunia'), { gain: 0.38 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const at = (id) => C[id].start - 0.12;

// Helper: draw Mega Mendung cloud with controllable layer count (1..7) and pointed Cirebon tips
function megaCloud7(x, y, s, t, layers = 7) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const lobes = [[-135, 4, 64], [-55, -38, 78], [45, -32, 74], [130, 8, 60], [25, 32, 68], [-75, 38, 56]];
  const maxL = clamp(Math.ceil(layers), 1, 7);
  for (let i = 0; i < maxL; i++) {
    const k = 1 - i * 0.125;
    ctx.fillStyle = P.mega[i];
    ctx.beginPath();
    // Pointed Cirebon outer wing tips
    ctx.moveTo(-215 * k, 8 * k);
    ctx.quadraticCurveTo(-175 * k, -35 * k, -135 * k, -28 * k);
    lobes.forEach(([lx, ly, r]) => {
      ctx.moveTo(lx * k + r * k, ly * k);
      ctx.arc(lx * k, ly * k, r * k + Math.sin(t * 1.6 + i) * 1.5, 0, TAU);
    });
    ctx.moveTo(130 * k, -26 * k);
    ctx.quadraticCurveTo(175 * k, -28 * k, 215 * k, 10 * k);
    ctx.quadraticCurveTo(175 * k, 40 * k, 130 * k, 36 * k);
    ctx.fill();
    ctx.strokeStyle = P.cream; ctx.lineWidth = 2.2; ctx.stroke();
  }
  ctx.restore();
}

// 1. Hook: Canting draws Mega Mendung on white mori, then crimson Cirebon ground floods in.
shot('hook', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  const z = 1.2 - 0.1 * ease.inOutSine(p);
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z);
  const wax = clamp(0.35 + p * 0.75);
  const dye = ease.inOutCubic(clamp((p - 0.35) / 0.55));
  const tiles = { wax: K.megaTile('wax', RED_CIREBON), dyed: K.megaTile('dyed', RED_CIREBON) };
  const tip = K.cloth(ctx, t, { wax, dye, ground: RED_CIREBON, ox: t * 10, oy: 0, tiles });
  if (dye < 0.85) K.canting(ctx, tip[0], tip[1], t, { s: 1.35, rot: -0.38, glow: 1 - dye * 0.7 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.overlay(ctx, K.crackle(RED_DK), 0.45 * dye);
  K.overlay(ctx, K.weave(), 0.75);
  K.waxText(ctx, 'Mega Mendung', 540, 350, clamp((t - a - 0.25) / 0.8), { size: 102 });
  K.plaque(ctx, 'AWAN PESISIR CIREBON', 540, 505, { size: 46, sub: 'gradasi biru di atas merah menyala', alpha: prog(t, a + 0.7, a + 1.1) });
});

// 2. Pelabuhan: Pelabuhan Muara Jati Cirebon abad ke-16, laut batik pesisir & awan Mega Mendung.
shot('pelabuhan', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  ctx.fillStyle = RED_CIREBON; ctx.fillRect(0, 0, 1080, 1920);
  megaCloud7(280 + t * 12, 560, 1.15, t, 7);
  megaCloud7(800 - t * 10, 720, 0.95, t + 1.5, 7);
  K.sea(ctx, t, { y: 980, h: 960, speed: 1.2 });
  // Batik line-art trading junk ship sailing on the sea
  const sx = lerp(180, 560, ease.inOutSine(p)), sy = 1120 + Math.sin(t * 2.2) * 14;
  ctx.save(); ctx.translate(sx, sy);
  ctx.fillStyle = P.sogaLt; ctx.strokeStyle = P.cream; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.moveTo(-190, 0); ctx.quadraticCurveTo(0, 65, 190, 0); ctx.lineTo(230, -70); ctx.lineTo(-220, -70); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Battened sails in cream & gold
  for (const [mx, sw, sh] of [[-55, 130, 220], [85, 105, 175]]) {
    ctx.fillStyle = P.mori; ctx.fillRect(mx - sw / 2, -70 - sh, sw, sh); ctx.strokeRect(mx - sw / 2, -70 - sh, sw, sh);
    for (let y = -70 - sh + 35; y < -70; y += 38) { ctx.beginPath(); ctx.moveTo(mx - sw / 2, y); ctx.lineTo(mx + sw / 2, y); ctx.stroke(); }
  }
  ctx.restore();
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'PELABUHAN MUARA JATI', 540, 260, { size: 48, sub: 'Cirebon, titik temu budaya abad ke-16', alpha: prog(t, a + 0.15, a + 0.5) });
});

// 3. Akulturasi: Sunan Gunung Jati & Putri Ong Tien — harmoni Nusantara & Tiongkok.
shot('akulturasi', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  ctx.fillStyle = RED_DK; ctx.fillRect(0, 0, 1080, 1920);
  K.motifFill(ctx, K.megaTile('dyed', RED_CIREBON), { ox: t * 8, oy: 0 });
  ctx.globalAlpha = 0.45; ctx.fillRect(0, 0, 1080, 1920); ctx.globalAlpha = 1;
  K.regol(ctx, 540, 1140, 1.28);
  const mgCloth = K.megaTile('dyed', P.indigo, 160);
  K.figure(ctx, 'sultan', { x: 360, y: 1420, s: 1.05, t, arm: 0.45, cloth: mgCloth });
  K.figure(ctx, 'walker', { x: 720, y: 1420, s: 1.0, face: -1, t, phase: 0, top: P.red, kain: mgCloth, cloth: mgCloth, cap: 'hair', bun: true, arm: 0.5 });
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'AKULTURASI DUA BUDAYA', 540, 250, { size: 48, sub: 'Sunan Gunung Jati & Putri Ong Tien', alpha: prog(t, a + 0.15, a + 0.5) });
});

// 4. Lancip: Perbandingan awan membulat vs awan Mega Mendung Trusmi yang meruncing tegas.
shot('lancip', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  ctx.fillStyle = P.mori; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = RED_CIREBON; ctx.fillRect(60, 480, 960, 920);
  ctx.strokeStyle = P.gold; ctx.lineWidth = 5; ctx.strokeRect(76, 496, 928, 888);
  megaCloud7(540, 940, 2.05, t, 7);
  // Canting tracing the sharp pointed tip on the right
  const cx = lerp(680, 940, ease.inOutSine(p)), cy = 955 + Math.sin(t * 6) * 8;
  K.canting(ctx, cx, cy, t, { s: 1.25, rot: -0.35, glow: 1 });
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'GARIS TEGAS DESA TRUSMI', 540, 270, { size: 48, sub: 'ujung awan meruncing khas pesisir Cirebon', alpha: prog(t, a + 0.15, a + 0.5) });
});

// 5. Tujuh: 7 lapisan gradasi biru menyala satu per satu, melambangkan 7 lapis langit & bumi.
shot('tujuh', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  ctx.fillStyle = RED_DK; ctx.fillRect(0, 0, 1080, 1920);
  const layers = clamp(1 + p * 7.2, 1, 7);
  megaCloud7(540, 880, 2.15, t, layers);
  // 7 colour swatch pills at bottom of frame
  const nShow = Math.min(7, Math.floor(layers));
  for (let i = 0; i < nShow; i++) {
    const x = 180 + i * 120, y = 1290;
    ctx.fillStyle = P.mega[i]; ctx.strokeStyle = P.cream; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, 42, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = i < 4 ? P.cream : P.ink; ctx.font = "700 34px 'Playfair Display'";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), x, y);
  }
  K.overlay(ctx, K.weave(), 0.75);
  K.waxText(ctx, '7 Lapisan Biru', 540, 280, clamp(p * 1.8), { size: 96 });
  K.plaque(ctx, 'TUJUH LAPIS LANGIT & BUMI', 540, 425, { size: 44, sub: 'dari biru langit terang hingga biru nila pekat', alpha: prog(t, a + 0.25, a + 0.6) });
});

// 6. Teduh: Awan mendung penahan terik matahari & hujan rintik penyejuk hati.
shot('teduh', (t, a, b) => {
  const p = clamp((t - a) / (b - a));
  ctx.fillStyle = P.indigoDk; ctx.fillRect(0, 0, 1080, 1920);
  // Warm golden sun softened behind the Mega Mendung clouds
  ctx.fillStyle = P.gold; ctx.globalAlpha = 0.65;
  ctx.beginPath(); ctx.arc(540, 620, 160, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  megaCloud7(540, 690, 1.85, t, 7);
  megaCloud7(260, 820, 1.1, t + 1, 7);
  megaCloud7(820, 820, 1.1, t + 2, 7);
  // Gentle batik rain droplets falling below the clouds
  ctx.strokeStyle = P.cream; ctx.lineWidth = 3;
  for (let i = 0; i < 36; i++) {
    const rx = 160 + hrand(i, 1) * 760;
    const ry = 920 + ((hrand(i, 2) * 520 + t * 260) % 520);
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 8, ry + 28); ctx.stroke();
  }
  K.figure(ctx, 'senopati', { x: 540, y: 1440, s: 1.25, t, closed: true, arm: 0.2, cloth: K.megaTile('dyed', RED_CIREBON, 120) });
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'PENYEJUK HATI & PEREDAM AMARAH', 540, 260, { size: 44, sub: 'falsafah kepemimpinan yang teduh dan bijaksana', alpha: prog(t, a + 0.15, a + 0.5) });
});

// 7. Proses: Pencelupan bertahap (lorod & celup) berkali-kali.
shot('proses', (t, a, b) => {
  const lt = t - a, p = clamp(lt / (b - a));
  const z = 1.45 - 0.2 * ease.inOutSine(p);
  const R = { x: -400, y: -400, w: 1880, h: 2720 };
  const tiles = { wax: K.megaTile('wax', P.indigo), dyed: K.megaTile('dyed', P.indigo) };
  ctx.setTransform(z, 0, 0, z, 540 - 540 * z, 960 - 960 * z);
  const tip = K.cloth(ctx, t, { ...R, wax: clamp(0.25 + p * 0.75), dye: ease.inOutCubic(clamp((p - 0.3) / 0.55)), ground: P.indigo, tiles });
  if (p < 0.75) K.canting(ctx, tip[0], tip[1], t, { s: 1.25, rot: -0.4, glow: 1 });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.overlay(ctx, K.crackle(P.indigoDk), 0.5 * p);
  K.overlay(ctx, K.weave(), 0.75);
  K.plaque(ctx, 'KESABARAN TINGKAT TINGGI', 540, 270, { size: 48, sub: 'ditutup malam & dicelup bertahap per lapisan warna', alpha: prog(t, a + 0.15, a + 0.5) });
});

// 8. Kini: Batik Mega Mendung mendunia dipakai masyarakat modern.
shot('kini', (t, a, b) => {
  const lt = t - a, end = C.kini.end;
  ctx.fillStyle = P.mori; ctx.fillRect(0, 0, 1080, 1920);
  for (const [y0, h] of [[0, 420], [1460, 460]]) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, y0, 1080, h);
    K.motifFill(ctx, K.megaTile('dyed', RED_CIREBON), { ox: -lt * 38 }); ctx.fill(); ctx.restore();
  }
  megaCloud7(240, 620, 0.85, t, 7);
  megaCloud7(840, 700, 0.95, t + 1.5, 7);
  const stop = end + 0.2, walkT = Math.min(t, stop) - a;
  const mgRed = K.megaTile('dyed', RED_CIREBON, 130);
  const mgBlue = K.megaTile('dyed', P.indigo, 130);
  const people = [
    { x: 110, top: mgRed, kain: null, cap: 'hair', bun: true, legs: P.indigoDk, s: 0.96 },
    { x: -170, top: mgBlue, kain: null, cap: 'blangkon', legs: P.sogaDk, s: 1.02 },
    { x: -430, top: P.sogaDk, kain: mgRed, cap: 'hair', legs: P.skin, s: 0.94 },
  ];
  people.forEach((q, i) => {
    const x = q.x + walkT * 185, walking = t < stop;
    K.figure(ctx, 'walker', { x, y: 1430, s: q.s * 1.28, t, phase: walking ? walkT * 1.5 + i * 0.3 : 0, top: q.top, kain: q.kain, cloth: q.kain || undefined, cap: q.cap, bun: q.bun, legs: q.legs });
  });
  K.waxText(ctx, 'Harmoni Nusantara', 540, 240, clamp(lt / 0.8), { size: 92 });
  K.plaque(ctx, 'MEGA MENDUNG CIREBON MENDUNIA', 540, 370, { size: 42, sub: 'ketenangan batin di tengah badai kehidupan', alpha: prog(t, a + 0.3, a + 0.7) });
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

