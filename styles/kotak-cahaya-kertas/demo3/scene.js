// Seni Shadow Box & Teater Siluet — 8-scene educational showcase (kotak-cahaya-kertas)
import * as K from '/styles/kotak-cahaya-kertas/kit.js';
const { clamp, ease } = AM.lib;
const LT = K.LIGHTS;

export const meta = { fps: 24, hold: 2, captions: { preset: 'elegant', y: 1520, size: 60, maxWords: 4 } };

let ctx;
const C = {};
export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('wind', 0.0, { gain: 0.25 });
  AM.sfx('paper', 0.05, { gain: 0.4 });
  if (C.lapisan) AM.sfx('whoosh', C.lapisan.start, { gain: 0.3 });
  if (C.warna) AM.sfx('chime', C.warna.start + 0.1, { gain: 0.35 });
}

const W = 1080, H = 1920;

const S = {
  l1Mtn: () => K.sheet('sb-l1-mtn', W, H, (g, w, h) => K.ridges(g, w, h, 1020, 110, 3, { peaks: 3 })),
  l2Valley: () => K.sheet('sb-l2-valley', W, H, (g, w, h) => K.ridges(g, w, h, 1160, 70, 9, { peaks: 2 })),
  l3Village: () => K.sheet('sb-l3-village', W, H, (g, w, h) => {
    g.fillRect(0, 1310, w, h - 1310);
    K.rumahGadang(g, 540, 1320, 0.85, 3);
    K.palm(g, 210, 1320, 270, 0.88, 0.2);
    K.palm(g, 870, 1320, 290, 0.92, -0.22);
  }),
  l4Bridge: () => K.sheet('sb-l4-bridge', W, H, (g, w, h) => {
    g.fillRect(0, 1490, w, h - 1490);
    K.palm(g, 130, 1500, 360, 1.05, 0.28);
    K.palm(g, 950, 1500, 350, 1.02, -0.26);
  }),
  l5Frame: () => K.sheet('sb-l5-frame', W, H, (g, w, h) => {
    g.fillRect(0, 1690, w, h - 1690);
    K.palm(g, 55, 1710, 490, 1.28, 0.36);
    K.palm(g, 1025, 1710, 480, 1.25, -0.34);
  }),
  ship: () => K.sheet('sb-ship-hist', 700, 600, (g) => K.ship(g, 350, 470, 0.78)),
};

function drawLayerDiagram(ctx, t, u, L) {
  const cx = W / 2, topY = 470;
  const layers = [
    { d: 0.00, label: 'LED BACKLIGHT PANEL (SUMBER CAHAYA)' },
    { d: 0.14, label: 'LAPIS 1 · PEGUNUNGAN JAUH (PALING TERANG)' },
    { d: 0.34, label: 'LAPIS 2 · PERBUKITAN TENGAH' },
    { d: 0.56, label: 'LAPIS 3 · RUMAH GADANG & DESA' },
    { d: 0.78, label: 'LAPIS 4 · PANGGUNG KARAKTER UTAMA' },
    { d: 0.96, label: 'LAPIS 5 · BINGKAI SILUET DEPAN (PALING GELAP)' },
  ];
  ctx.save();
  for (let i = 0; i < layers.length; i++) {
    const item = layers[i];
    const appear = ease.outCubic(clamp((u * 1.35) - i * 0.14));
    if (appear <= 0) continue;
    const y = topY + i * 118 + (1 - appear) * 35;
    const w = 780 + i * 16;
    const x = cx - w / 2;
    ctx.globalAlpha = appear;
    ctx.fillStyle = i === 0 ? L[3] : K.sheetColor(L, item.d);
    ctx.shadowColor = L[3];
    ctx.shadowBlur = i === 0 ? 28 : 14;
    ctx.beginPath();
    ctx.roundRect(x, y, w, 66, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = L[2];
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "700 23px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = i <= 1 ? '#2a1208' : '#fff4dc';
    ctx.fillText(item.label, cx, y + 33);
  }
  ctx.restore();
}

export function render(t, AM) {
  const lines = AM.timeline.lines;
  let active = lines[0];
  for (const ln of lines) {
    if (t >= ln.start && t <= ln.end + 0.35) { active = ln; break; }
    if (t > ln.end) active = ln;
  }
  const dur = Math.max(0.1, active.end - active.start);
  const u = clamp((t - active.start) / dur, 0, 1);
  const activeId = active.id;
  const sway = Math.sin(t * 0.9) * 14;

  if (activeId === 'hook') {
    const L = K.backlight(ctx, t, LT.gold, LT.dusk, 0.4 + 0.3 * Math.sin(t * 0.8), { sunY: 0.44, sun: 1.1 });
    K.drawSheet(ctx, S.l1Mtn(), K.sheetColor(L, 0.14), sway * 0.15, 0, { glow: 0.35, glowCol: L[3] });
    K.haze(ctx, L, 1020, 220, 0.38);
    K.drawSheet(ctx, S.l2Valley(), K.sheetColor(L, 0.34), sway * 0.35, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l3Village(), K.sheetColor(L, 0.56), sway * 0.6, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l4Bridge(), K.sheetColor(L, 0.78), -sway * 0.7, 0, { glow: 0.3, glowCol: L[3] });
    K.puppet(ctx, 'istri', K.sheetColor(L, 0.86), { x: 430, y: 1495, s: 1.05, face: 1, t });
    K.puppet(ctx, 'malin', K.sheetColor(L, 0.86), { x: 650, y: 1495, s: 1.05, rich: true, face: -1, t });
    K.drawSheet(ctx, S.l5Frame(), K.sheetColor(L, 0.96), -sway * 1.1, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 48, L[3], { y0: 220, y1: 1580 });
    K.litTitle(ctx, 'KOTAK CAHAYA KERTAS', W / 2, 290, { size: 70, halo: L[3], sub: 'SENI DIORAMA SILUET & CAHAYA TEMBUS' });
  } else if (activeId === 'sejarah') {
    const L = K.backlight(ctx, t, LT.dusk, LT.gold, clamp(u * 0.9), { sunY: 0.48, sun: 1.0 });
    K.drawSheet(ctx, S.l1Mtn(), K.sheetColor(L, 0.15), 0, 20, { glow: 0.35, glowCol: L[3] });
    K.waves(ctx, t, 1260, K.sheetColor(L, 0.38), { amp: 14, speed: 1.6, h: 660 });
    K.drawSheet(ctx, S.ship(), K.sheetColor(L, 0.56), 190 + u * 50, 820 + Math.sin(t * 1.5) * 8, { glow: 0.4, glowCol: L[3] });
    K.drawSheet(ctx, S.l4Bridge(), K.sheetColor(L, 0.78), 0, 0, { glow: 0.3, glowCol: L[3] });
    K.puppet(ctx, 'ibu', K.sheetColor(L, 0.88), { x: 320, y: 1495, s: 1.05, armF: [1.1, 0.2], t });
    K.puppet(ctx, 'malin', K.sheetColor(L, 0.88), { x: 740, y: 1495, s: 1.05, rich: true, face: -1, t });
    K.drawSheet(ctx, S.l5Frame(), K.sheetColor(L, 0.96), 0, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 42, L[3], { y0: 240, y1: 1520 });
    K.litTitle(ctx, 'TEATER BAYANGAN', W / 2, 290, { size: 72, halo: L[3], sub: 'PERPADUAN TRADISI TIMUR & SILUET EROPA' });
  } else if (activeId === 'lapisan') {
    const L = K.backlight(ctx, t, LT.gold, LT.dawn, 0.5, { sunY: 0.36, sun: 1.0 });
    K.drawSheet(ctx, S.l3Village(), K.sheetColor(L, 0.62), 0, 120, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l5Frame(), K.sheetColor(L, 0.96), 0, 0, { glow: 0.25, glowCol: L[3] });
    drawLayerDiagram(ctx, t, u, L);
    K.litTitle(ctx, 'ANATOMI 6 LAPISAN', W / 2, 280, { size: 72, halo: L[3], sub: 'SUSUNAN KERTAS & CELAH BUSA DI DALAM BINGKAI' });
  } else if (activeId === 'cahaya') {
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
    const L = K.backlight(ctx, t, LT.night, LT.gold, ease.inOutSine(clamp(u * 1.15)), { sunY: 0.44, sun: 0.7 + pulse * 0.5 });
    K.drawSheet(ctx, S.l1Mtn(), K.sheetColor(L, 0.14), 0, 0, { glow: 0.45, glowCol: L[3] });
    K.haze(ctx, L, 1000, 260, 0.45);
    K.drawSheet(ctx, S.l2Valley(), K.sheetColor(L, 0.34), 0, 0, { glow: 0.4, glowCol: L[3] });
    K.drawSheet(ctx, S.l3Village(), K.sheetColor(L, 0.56), 0, 0, { glow: 0.4, glowCol: L[3] });
    K.drawSheet(ctx, S.l4Bridge(), K.sheetColor(L, 0.78), 0, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l5Frame(), K.sheetColor(L, 0.96), 0, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 60, L[3], { y0: 200, y1: 1580 });
    K.litTitle(ctx, 'CAHAYA DARI BELAKANG', W / 2, 290, { size: 68, halo: L[3], sub: 'TRANSMISI CAHAYA MENEMBUS SERAT KERTAS' });
  } else if (activeId === 'gradasi') {
    const L = K.backlight(ctx, t, LT.gold, LT.dusk, 0.55, { sunY: 0.42, sun: 1.05 });
    K.drawSheet(ctx, S.l1Mtn(), K.sheetColor(L, 0.12), 0, 0, { glow: 0.4, glowCol: L[3] });
    K.haze(ctx, L, 1010, 240, 0.4);
    K.drawSheet(ctx, S.l2Valley(), K.sheetColor(L, 0.34), 0, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l3Village(), K.sheetColor(L, 0.58), 0, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l4Bridge(), K.sheetColor(L, 0.78), 0, 0, { glow: 0.3, glowCol: L[3] });
    K.drawSheet(ctx, S.l5Frame(), K.sheetColor(L, 0.96), 0, 0, { glow: 0.25, glowCol: L[3] });
    for (const [yy, txt] of [
      [940, 'LAPIS JAUH · EMAS TERANG'],
      [1140, 'LAPIS TENGAH · AMBER HANGAT'],
      [1350, 'LAPIS PANGGUNG · TEMBAGA SENJA'],
      [1560, 'LAPIS DEPAN · UNGU SILUET'],
    ]) {
      K.litTitle(ctx, txt, W / 2, yy, { size: 32, halo: L[3] });
    }
    K.litTitle(ctx, 'PERSPEKTIF ATMOSFERIK', W / 2, 290, { size: 66, halo: L[3], sub: 'SEMAKIN DEKAT KE PENONTON, SEMAKIN GELAP' });
  } else if (activeId === 'paralaks') {
    const pan = Math.sin(t * 2.1) * 58;
    const L = K.backlight(ctx, t, LT.dawn, LT.dusk, 0.5, { sunY: 0.44, sun: 1.05 });
    K.drawSheet(ctx, S.l1Mtn(), K.sheetColor(L, 0.14), pan * 0.15, 0, { glow: 0.35, glowCol: L[3] });
    K.haze(ctx, L, 1020, 220, 0.36);
    K.drawSheet(ctx, S.l2Valley(), K.sheetColor(L, 0.34), pan * 0.38, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l3Village(), K.sheetColor(L, 0.56), pan * 0.68, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l4Bridge(), K.sheetColor(L, 0.78), -pan * 0.95, 0, { glow: 0.3, glowCol: L[3] });
    K.puppet(ctx, 'malin', K.sheetColor(L, 0.86), { x: 540 - pan * 1.1, y: 1495, s: 1.1, walk: 1, rich: true, t });
    K.drawSheet(ctx, S.l5Frame(), K.sheetColor(L, 0.96), -pan * 1.45, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 46, L[3], { y0: 240, y1: 1580 });
    K.litTitle(ctx, 'EFEK PARALAKS RUANG', W / 2, 290, { size: 70, halo: L[3], sub: 'PERBEDAAN KECEPATAN ANTAR LAPISAN KERTAS' });
  } else if (activeId === 'warna') {
    const moods = [LT.dawn, LT.gold, LT.violet, LT.storm];
    const moodNames = ['FAJAR MERAH MUDA', 'SIANG EMAS', 'SENJA VIOLET', 'BADAI MALAM BIRU'];
    const idx = Math.min(2, Math.floor(u * 3));
    const frac = clamp(u * 3 - idx, 0, 1);
    const nameIdx = Math.min(3, Math.floor(u * 4));
    const L = K.backlight(ctx, t, moods[idx], moods[idx + 1], frac, { sunY: 0.44, sun: 1.05 });
    K.drawSheet(ctx, S.l1Mtn(), K.sheetColor(L, 0.14), sway * 0.2, 0, { glow: 0.35, glowCol: L[3] });
    K.haze(ctx, L, 1020, 220, 0.38);
    K.drawSheet(ctx, S.l2Valley(), K.sheetColor(L, 0.34), sway * 0.4, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l3Village(), K.sheetColor(L, 0.56), sway * 0.6, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l4Bridge(), K.sheetColor(L, 0.78), -sway * 0.7, 0, { glow: 0.3, glowCol: L[3] });
    K.drawSheet(ctx, S.l5Frame(), K.sheetColor(L, 0.96), -sway * 1.0, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 50, L[3], { y0: 220, y1: 1580 });
    K.litTitle(ctx, moodNames[nameIdx], W / 2, 290, { size: 70, halo: L[3], sub: 'SATU PANGGUNG KERTAS · EMPAT SUASANA CAHAYA' });
  } else {
    const L = K.backlight(ctx, t, LT.dusk, LT.gold, 0.5 + 0.3 * Math.sin(t * 0.7), { sunY: 0.44, sun: 1.1 });
    K.drawSheet(ctx, S.l1Mtn(), K.sheetColor(L, 0.14), sway * 0.2, 0, { glow: 0.35, glowCol: L[3] });
    K.haze(ctx, L, 1020, 220, 0.38);
    K.drawSheet(ctx, S.l2Valley(), K.sheetColor(L, 0.34), sway * 0.4, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l3Village(), K.sheetColor(L, 0.56), sway * 0.6, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.l4Bridge(), K.sheetColor(L, 0.78), -sway * 0.7, 0, { glow: 0.3, glowCol: L[3] });
    K.puppet(ctx, 'ibu', K.sheetColor(L, 0.88), { x: 420, y: 1495, s: 1.05, armF: [1.1, 0.2], t });
    K.puppet(ctx, 'istri', K.sheetColor(L, 0.88), { x: 660, y: 1495, s: 1.05, face: -1, t });
    K.drawSheet(ctx, S.l5Frame(), K.sheetColor(L, 0.96), -sway * 1.0, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 52, L[3], { y0: 220, y1: 1580 });
    K.litTitle(ctx, 'PUISI CAHAYA & BAYANGAN', W / 2, 290, { size: 66, halo: L[3], sub: 'KOTAK CAHAYA KERTAS · MAURA MOTION SKILL' });
  }

  K.boxFrame(ctx);
}
