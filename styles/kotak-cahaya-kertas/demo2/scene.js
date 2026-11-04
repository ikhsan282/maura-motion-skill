// Putri Mandalika & Tradisi Bau Nyale — 8-scene paper-lightbox diorama (kotak-cahaya-kertas)
import * as K from '/styles/kotak-cahaya-kertas/kit.js';
const { clamp, lerp, ease } = AM.lib;
const LT = K.LIGHTS;

export const meta = { fps: 24, hold: 2, captions: { preset: 'elegant', y: 1520, size: 60, maxWords: 4 } };

let ctx;
const C = {};
export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('wind', 0.0, { gain: 0.3 });
  AM.sfx('paper', 0.05, { gain: 0.4 });
  if (C.lamaran) AM.sfx('whoosh', C.lamaran.start, { gain: 0.3 });
  if (C.terjun) AM.sfx('thunder', C.terjun.start, { gain: 0.45 });
  if (C.nyale) AM.sfx('chime', C.nyale.start + 0.2, { gain: 0.35 });
}

const W = 1080, H = 1920;

const S = {
  farHills: () => K.sheet('m2-far-hills', W, H, (g, w, h) => K.ridges(g, w, h, 1060, 100, 11, { peaks: 3 })),
  midCliff: () => K.sheet('m2-mid-cliff', W, H, (g, w, h) => {
    K.ridges(g, w, h, 1200, 60, 22, { peaks: 2 });
    K.palm(g, 140, 1205, 250, 0.85, 0.22);
    K.palm(g, 940, 1195, 270, 0.9, -0.2);
  }),
  segerCliff: () => K.sheet('m2-seger-cliff', W, H, (g, w, h) => {
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, 1040);
    g.lineTo(280, 1000);
    g.lineTo(540, 940);
    g.lineTo(660, 960);
    g.lineTo(710, 1180);
    g.lineTo(670, 1420);
    g.lineTo(1080, 1450);
    g.lineTo(1080, h);
    g.closePath();
    g.fill();
    K.palm(g, 190, 1020, 290, 0.95, 0.28);
    K.palm(g, 330, 995, 240, 0.8, 0.18);
  }),
  palaceArch: () => K.sheet('m2-palace-arch', W, H, (g, w, h) => {
    g.fillRect(0, 1410, w, h - 1410);
    K.rumahGadang(g, 260, 1415, 0.72, 3);
    K.palm(g, 870, 1415, 340, 1.0, -0.24);
    K.palm(g, 950, 1425, 260, 0.82, -0.12);
  }),
  fgFrame: () => K.sheet('m2-fg-frame', W, H, (g, w, h) => {
    g.fillRect(0, 1680, w, h - 1680);
    K.palm(g, 60, 1710, 480, 1.25, 0.35);
    K.palm(g, 1020, 1710, 460, 1.2, -0.32);
  }),
  boat: () => K.sheet('m2-boat', 420, 260, (g) => K.boat(g, 210, 175, 1.05)),
  ship: () => K.sheet('m2-ship', 700, 600, (g) => K.ship(g, 350, 470, 0.72)),
};

function drawNyaleRibbons(ctx, t, yBase, intensity = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const cols = ['#ffd26a', '#ff7a52', '#5ce6c6', '#ffe89e'];
  for (let i = 0; i < 28; i++) {
    const col = cols[i % cols.length];
    const bx = ((i * 73 + t * (28 + (i % 5) * 9)) % (W + 160)) - 80;
    const by = yBase + (i % 7) * 44 + Math.sin(t * 2.2 + i) * 14;
    ctx.strokeStyle = col;
    ctx.lineWidth = 4 + (i % 3) * 1.5;
    ctx.globalAlpha = (0.45 + 0.35 * Math.sin(t * 3.1 + i * 1.7)) * intensity;
    ctx.beginPath();
    for (let s = 0; s <= 6; s++) {
      const px = bx - s * 14;
      const py = by + Math.sin(t * 5.5 + i + s * 0.9) * 8;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
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
  const breath = Math.sin(t * 0.7) * 5;

  if (activeId === 'hook') {
    const L = K.backlight(ctx, t, LT.night, LT.dawn, clamp(u * 0.85), { sunY: 0.56 - u * 0.08, sun: 0.95 });
    K.drawSheet(ctx, S.farHills(), K.sheetColor(L, 0.14), breath * 0.2, 40, { glow: 0.35, glowCol: L[3] });
    K.haze(ctx, L, 1080, 220, 0.32);
    K.drawSheet(ctx, S.midCliff(), K.sheetColor(L, 0.34), breath * 0.5, 20, { glow: 0.35, glowCol: L[3] });
    K.waves(ctx, t, 1280, K.sheetColor(L, 0.52), { amp: 14, speed: 1.5, h: 640 });
    drawNyaleRibbons(ctx, t, 1320, 0.9);
    K.drawSheet(ctx, S.boat(), K.sheetColor(L, 0.74), 190 + u * 70, 1180 + Math.sin(t * 2) * 8, { glow: 0.4, glowCol: L[3] });
    K.puppet(ctx, 'awak', K.sheetColor(L, 0.86), { x: 760, y: 1470, s: 0.9, t });
    K.drawSheet(ctx, S.fgFrame(), K.sheetColor(L, 0.96), -breath * 0.9, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 42, L[3], { y0: 260, y1: 1560 });
    K.litTitle(ctx, 'TRADISI BAU NYALE', W / 2, 310, { size: 74, halo: L[3], sub: 'LEGENDA PUTRI MANDALIKA · LOMBOK' });
  } else if (activeId === 'putri') {
    const L = K.backlight(ctx, t, LT.dawn, LT.gold, clamp(u * 0.9), { sunY: 0.44, sun: 1.05 });
    K.drawSheet(ctx, S.farHills(), K.sheetColor(L, 0.14), breath * 0.25, 0, { glow: 0.35, glowCol: L[3] });
    K.haze(ctx, L, 1040, 240, 0.35);
    K.drawSheet(ctx, S.midCliff(), K.sheetColor(L, 0.35), breath * 0.5, 0, { glow: 0.35, glowCol: L[3] });
    K.drawSheet(ctx, S.palaceArch(), K.sheetColor(L, 0.64), -breath * 0.4, 0, { glow: 0.4, glowCol: L[3] });
    K.puppet(ctx, 'istri', K.sheetColor(L, 0.85), { x: 560, y: 1415, s: 1.15, face: -1, t });
    K.puppet(ctx, 'ibu', K.sheetColor(L, 0.82), { x: 380, y: 1415, s: 0.95, face: 1, bend: 0.2, armF: [0.9, 0.2], t });
    K.drawSheet(ctx, S.fgFrame(), K.sheetColor(L, 0.96), -breath * 0.8, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 46, L[3], { y0: 220, y1: 1500 });
    K.litTitle(ctx, 'PUTRI MANDALIKA', W / 2, 300, { size: 76, halo: L[3], sub: 'KERAJAAN TONJANG BERU' });
  } else if (activeId === 'lamaran') {
    const L = K.backlight(ctx, t, LT.gold, LT.dusk, clamp(u * 0.95), { sunY: 0.48, sun: 1.0 });
    K.drawSheet(ctx, S.farHills(), K.sheetColor(L, 0.16), breath * 0.2, 0, { glow: 0.35, glowCol: L[3] });
    K.waves(ctx, t, 1210, K.sheetColor(L, 0.36), { amp: 16, speed: 1.8, h: 710 });
    K.drawSheet(ctx, S.ship(), K.sheetColor(L, 0.5), -40 + u * 45, 790 + Math.sin(t * 1.6) * 8, { glow: 0.4, glowCol: L[3] });
    K.drawSheet(ctx, S.ship(), K.sheetColor(L, 0.58), 380 - u * 35, 830 + Math.cos(t * 1.5) * 9, { glow: 0.4, glowCol: L[3], s: 0.88 });
    K.drawSheet(ctx, S.palaceArch(), K.sheetColor(L, 0.75), 0, 40, { glow: 0.35, glowCol: L[3] });
    K.puppet(ctx, 'malin', K.sheetColor(L, 0.88), { x: 360, y: 1455, s: 1.02, rich: true, face: 1, armF: [1.1, 0.15], t });
    K.puppet(ctx, 'malin', K.sheetColor(L, 0.88), { x: 720, y: 1455, s: 1.02, rich: true, face: -1, armF: [1.1, 0.15], t: t + 1.4 });
    K.drawSheet(ctx, S.fgFrame(), K.sheetColor(L, 0.96), -breath * 0.8, 0, { glow: 0.25, glowCol: L[3] });
    K.litTitle(ctx, 'ANCAMAN PERANG', W / 2, 290, { size: 72, halo: L[3], sub: 'PARA PANGERAN MEMPEREBUTKAN LAMARAN' });
  } else if (activeId === 'semedi') {
    const L = K.backlight(ctx, t, LT.dusk, LT.violet, clamp(u * 0.9), { sunY: 0.52, sun: 0.88 });
    K.drawSheet(ctx, S.farHills(), K.sheetColor(L, 0.15), 0, 20, { glow: 0.35, glowCol: L[3] });
    K.haze(ctx, L, 1080, 240, 0.38);
    K.drawSheet(ctx, S.palaceArch(), K.sheetColor(L, 0.58), 0, 0, { glow: 0.45, glowCol: L[3] });
    K.puppet(ctx, 'istri', K.sheetColor(L, 0.88), { x: 540, y: 1415, s: 1.2, kneel: 0.85, bend: 0.25, armF: [1.0, 0.4], t });
    K.drawSheet(ctx, S.fgFrame(), K.sheetColor(L, 0.96), 0, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 54, '#ffd782', { y0: 320, y1: 1520 });
    K.litTitle(ctx, 'SEMEDI TENGAH MALAM', W / 2, 300, { size: 70, halo: L[3], sub: 'DOA DEMI KEDAMAIAN TANAH LOMBOK' });
  } else if (activeId === 'tebing') {
    const L = K.backlight(ctx, t, LT.violet, LT.dawn, clamp(u * 0.85), { sunY: 0.48, sun: 0.95 });
    K.drawSheet(ctx, S.farHills(), K.sheetColor(L, 0.16), breath * 0.2, 30, { glow: 0.35, glowCol: L[3] });
    K.waves(ctx, t, 1340, K.sheetColor(L, 0.44), { amp: 18, speed: 2.0, h: 580 });
    K.drawSheet(ctx, S.segerCliff(), K.sheetColor(L, 0.72), -breath * 0.3, 0, { glow: 0.45, glowCol: L[3] });
    K.puppet(ctx, 'istri', K.sheetColor(L, 0.9), { x: 575, y: 950, s: 1.05, armF: [1.2, 0.1], t });
    K.puppet(ctx, 'malin', K.sheetColor(L, 0.84), { x: 220, y: 1015, s: 0.86, t });
    K.puppet(ctx, 'awak', K.sheetColor(L, 0.84), { x: 370, y: 990, s: 0.84, t: t + 1 });
    K.drawSheet(ctx, S.fgFrame(), K.sheetColor(L, 0.96), -breath * 0.8, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 38, L[3], { y0: 240, y1: 1480 });
    K.litTitle(ctx, 'TEBING PANTAI SEGER', W / 2, 280, { size: 70, halo: L[3], sub: '20 BULAN KESEPULUH PENANGGALAN SASAK' });
  } else if (activeId === 'terjun') {
    const L = K.backlight(ctx, t, LT.dawn, LT.storm, clamp(u * 0.65), { sunY: 0.45, sun: 1.1 });
    K.drawSheet(ctx, S.farHills(), K.sheetColor(L, 0.16), 0, 30, { glow: 0.35, glowCol: L[3] });
    K.waves(ctx, t, 1290, K.sheetColor(L, 0.46), { amp: 26, speed: 2.8, rough: 1.0, h: 630 });
    K.drawSheet(ctx, S.segerCliff(), K.sheetColor(L, 0.74), 0, 0, { glow: 0.45, glowCol: L[3] });
    const leapK = ease.inOutSine(clamp((u - 0.15) / 0.75));
    const px = lerp(585, 790, leapK);
    const py = lerp(950, 1340, leapK * leapK) - Math.sin(leapK * Math.PI) * 110;
    K.puppet(ctx, 'istri', K.sheetColor(L, 0.92), { x: px, y: py, s: 1.02, bend: leapK * 0.4, armF: [2.1, 0.1], armB: [1.9, 0.1], t });
    K.drawSheet(ctx, S.fgFrame(), K.sheetColor(L, 0.96), 0, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 52, L[3], { y0: 260, y1: 1520 });
    K.litTitle(ctx, 'UNTUK SELURUH RAKYAT', W / 2, 280, { size: 70, halo: L[3], sub: 'PENGORBANAN SANG PUTRI KE SAMUDRA' });
  } else if (activeId === 'nyale') {
    const L = K.backlight(ctx, t, LT.violet, LT.gold, clamp(u * 0.95), { sunY: 0.48, sun: 1.15 });
    K.drawSheet(ctx, S.farHills(), K.sheetColor(L, 0.14), breath * 0.2, 20, { glow: 0.35, glowCol: L[3] });
    K.haze(ctx, L, 1120, 240, 0.42);
    K.waves(ctx, t, 1220, K.sheetColor(L, 0.42), { amp: 16, speed: 1.8, h: 700 });
    drawNyaleRibbons(ctx, t, 1250, 1.25);
    K.drawSheet(ctx, S.segerCliff(), K.sheetColor(L, 0.72), -120, 40, { glow: 0.4, glowCol: L[3] });
    K.drawSheet(ctx, S.boat(), K.sheetColor(L, 0.8), 490 + Math.sin(t * 1.4) * 20, 1160 + Math.cos(t * 2.1) * 7, { glow: 0.4, glowCol: L[3] });
    K.drawSheet(ctx, S.fgFrame(), K.sheetColor(L, 0.96), 0, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 64, '#ffe28a', { y0: 300, y1: 1620 });
    K.litTitle(ctx, 'BERKAH CAHAYA NYALE', W / 2, 290, { size: 72, halo: L[3], sub: 'JELMAAN CINTA DAN KESUBURAN LAUT SELATAN' });
  } else {
    const L = K.backlight(ctx, t, LT.gold, LT.dusk, 0.45 + 0.25 * Math.sin(t * 0.6), { sunY: 0.44, sun: 1.1 });
    K.drawSheet(ctx, S.farHills(), K.sheetColor(L, 0.14), breath * 0.2, 0, { glow: 0.35, glowCol: L[3] });
    K.haze(ctx, L, 1080, 240, 0.38);
    K.drawSheet(ctx, S.midCliff(), K.sheetColor(L, 0.36), breath * 0.45, 0, { glow: 0.35, glowCol: L[3] });
    K.waves(ctx, t, 1260, K.sheetColor(L, 0.5), { amp: 14, speed: 1.5, h: 660 });
    drawNyaleRibbons(ctx, t, 1300, 1.0);
    K.drawSheet(ctx, S.segerCliff(), K.sheetColor(L, 0.74), -80, 20, { glow: 0.4, glowCol: L[3] });
    K.puppet(ctx, 'istri', K.sheetColor(L, 0.9), { x: 515, y: 970, s: 1.05, armF: [1.1, 0.2], t });
    K.drawSheet(ctx, S.fgFrame(), K.sheetColor(L, 0.96), -breath * 0.7, 0, { glow: 0.25, glowCol: L[3] });
    K.motes(ctx, t, 50, L[3], { y0: 220, y1: 1580 });
    K.litTitle(ctx, 'PERSATUAN & PENGORBANAN', W / 2, 300, { size: 64, halo: L[3], sub: 'WARISAN LUHUR MASYARAKAT SASAK' });
  }

  K.boxFrame(ctx);
}
