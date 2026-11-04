// Sumi-e Tinta Timur — Demo 1: "Laksamana Cheng Ho Singgah di Nusantara"
import * as K from '/styles/sumi-e/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;

export const meta = {
  fps: 30,
  captions: {
    preset: 'serif',
    y: 1500,
    size: 56,
    color: '#2c2926',
    active: '#b8322a',
    box: { fill: 'rgba(244,239,227,0.92)', pad: 18, radius: 10 },
  },
};

let ctx, fx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('wind', 0.1, { gain: 0.35 });
  AM.sfx('whoosh', C.chengho.start + 0.1, { gain: 0.35 });
  AM.sfx('chime', C.tujuh.start + 0.2, { gain: 0.35 });
  AM.sfx('swoosh_up', C.nusantara.start + 0.15, { gain: 0.3 });
  AM.sfx('drum_hit', C.palembang.start + 0.2, { gain: 0.45 });
  AM.sfx('chime', C.semarang.start + 0.2, { gain: 0.4 });
  AM.sfx('pop', C.kapal.start + 0.2, { gain: 0.35 });
  AM.sfx('stamp', C.akhir.start + 0.25, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start, L[i + 1] ? C[L[i + 1].id].start : AM.duration];
};

// 1. Hook: Giant Ming Treasure Fleet emerging from misty sumi-e ocean
shot('hook', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'ARMADA HARTA DINASTI MING', sub: 'TIGA RATUS KAPAL KAYU DI SAMUDRA TIMUR', sealText: '鄭和' });
  K.mistyMountains(ctx, t, { yBase: 760, seed: 11 });

  // Distant silhouettes of smaller accompaniment ships
  ctx.save(); ctx.globalAlpha = 0.38;
  K.drawTreasureShip(ctx, 210, 740, 0.36, { sails: 3, t });
  K.drawTreasureShip(ctx, 850, 760, 0.42, { sails: 4, t: t + 1 });
  ctx.restore();

  // Giant flagship Baochuan in foreground with red lug sails
  const enter = ease.outCubic(clamp(lt / 0.8));
  K.drawTreasureShip(ctx, lerp(360, 540, enter), 920, 1.15, {
    sails: 5,
    redSails: true,
    t,
    labelText: 'KAPAL PUSAKA BAOCHUAN (宝船)',
  });
  K.inkWaves(ctx, 975, t, { rows: 4, amp: 16 });
  K.scrollBox(ctx, 540, 1235, 860, 130, '300+ KAPAL ARMADA KEKAISARAN', 'Kapal Utama Lebih Panjang dari Lapangan Bola', {
    p: clamp((lt - 0.3) / 0.4),
    accent: K.PAL.red,
  });
});

// 2. Admiral Zheng He (Cheng Ho) — Envoy of Emperor Yongle (1405)
shot('chengho', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'LAKSAMANA CHENG HO (ZHENG HE)', sub: 'UTUSAN MUSLIM DARI YUNNAN · DINASTI MING', sealText: '明' });
  K.inkBloom(ctx, 540, 620, 310, { col: K.PAL.mist, alpha: 0.55, seed: 4, t });

  // Dignified Sumi-e silhouette of Admiral Zheng He standing on the high prow holding an imperial scroll
  ctx.save(); ctx.translate(540, 780);
  // Flowing commander robe in bold ink brushwork
  ctx.fillStyle = K.PAL.ink;
  ctx.beginPath();
  ctx.moveTo(-90, -240);
  ctx.quadraticCurveTo(-150, -60, -175, 160);
  ctx.lineTo(175, 160);
  ctx.quadraticCurveTo(140, -60, 90, -240);
  ctx.closePath();
  ctx.fill();
  // Red crimson sash & collar
  ctx.fillStyle = K.PAL.red;
  ctx.fillRect(-95, -80, 190, 28);
  ctx.beginPath(); ctx.moveTo(-45, -240); ctx.lineTo(0, -165); ctx.lineTo(45, -240); ctx.strokeStyle = K.PAL.red; ctx.lineWidth = 12; ctx.stroke();
  // Head & Ming Admiral Winged Hat (Wushamao)
  ctx.fillStyle = K.PAL.paper;
  ctx.beginPath(); ctx.arc(0, -295, 52, 0, TAU); ctx.fill();
  ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = K.PAL.ink;
  ctx.beginPath(); ctx.roundRect(-56, -365, 112, 46, 12); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-95, -342, 40, 12, 0.1, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(95, -342, 40, 12, -0.1, 0, TAU); ctx.fill();
  // Imperial scroll held in raised right hand
  ctx.save(); ctx.translate(135, -160); ctx.rotate(-0.35);
  ctx.fillStyle = K.PAL.gold; ctx.fillRect(-14, -75, 28, 150);
  ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 4; ctx.strokeRect(-14, -75, 28, 150);
  ctx.restore();
  ctx.restore();

  K.redSeal(ctx, 810, 480, '永樂', { size: 96, p: clamp((lt - 0.25) / 0.35) });
  K.scrollBox(ctx, 540, 1180, 860, 140, 'MA HE (CHENG HO) · 1371–1433', 'Panglima Agung Armada Kaisar Yongle', {
    p: clamp((lt - 0.2) / 0.4),
  });
});

// 3. Seven Great Voyages (1405–1433) & 27,000 Crew Members
shot('tujuh', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'TUJUH PELAYARAN BESAR (1405–1433)', sub: 'DARI NANJING KE NUSANTARA, INDIA, ARAB & AFRIKA', sealText: '七航' });
  K.mistyMountains(ctx, t, { yBase: 640, seed: 22 });

  // Calligraphic compass & 7 voyage waypoints arc across the Indian Ocean
  const pts = [
    [920, 460, 'NANJING'],
    [820, 650, 'CHAMPA'],
    [700, 820, 'JAWA & PALEMBANG'],
    [540, 760, 'SAMUDERA PASAI'],
    [390, 600, 'CALICUT (INDIA)'],
    [250, 510, 'HORMUZ'],
    [150, 740, 'MALINDI (AFRIKA)'],
  ];
  const prog = clamp(lt / (b - a - 0.8));
  ctx.save();
  ctx.strokeStyle = K.PAL.red; ctx.lineWidth = 7; ctx.setLineDash([14, 10]);
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    if (i / (pts.length - 1) <= prog + 0.08) {
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
  });
  ctx.stroke(); ctx.setLineDash([]);

  pts.forEach(([px, py, name], i) => {
    const k = clamp((prog - i / pts.length) * 5);
    if (k > 0) {
      ctx.fillStyle = i === 2 || i === 3 ? K.PAL.red : K.PAL.ink;
      ctx.beginPath(); ctx.arc(px, py, 14 * k, 0, TAU); ctx.fill();
      ctx.fillStyle = K.PAL.ink;
      ctx.font = "700 24px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(name, px, py - 26);
    }
  });
  ctx.restore();

  K.inkWaves(ctx, 940, t, { rows: 3, amp: 12 });
  K.scrollBox(ctx, 540, 1185, 860, 145, '±27.000 AWAK SEKALI BERLAYAR', 'Pelaut, Tabib, Penerjemah, Kartografer & Diplomat', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.red,
  });
});

// 4. Nusantara Ports of Call (Pasai, Palembang, Sunda Kelapa, Tuban, Gresik, Surabaya)
shot('nusantara', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'PERSINGGAHAN DI NUSANTARA', sub: 'CATATAN MA HUAN DALAM KITAB YINGYAI SHENGLAN', sealText: '南洋' });

  // Ink-wash islands of Sumatra and Java
  K.inkBloom(ctx, 290, 590, 190, { col: K.PAL.dark, alpha: 0.28, seed: 31, t });
  K.inkBloom(ctx, 690, 810, 220, { col: K.PAL.dark, alpha: 0.28, seed: 32, t });

  // Sumatra silhouette
  ctx.fillStyle = K.PAL.dark;
  ctx.beginPath();
  ctx.moveTo(120, 410); ctx.quadraticCurveTo(260, 490, 410, 690);
  ctx.quadraticCurveTo(340, 740, 240, 620); ctx.quadraticCurveTo(130, 510, 120, 410);
  ctx.fill();

  // Java silhouette
  ctx.beginPath();
  ctx.moveTo(450, 790); ctx.quadraticCurveTo(690, 775, 920, 825);
  ctx.quadraticCurveTo(910, 885, 680, 870); ctx.quadraticCurveTo(470, 860, 450, 790);
  ctx.fill();

  const ports = [
    [160, 435, 'SAMUDERA PASAI'],
    [365, 675, 'PALEMBANG'],
    [495, 810, 'SUNDA KELAPA'],
    [640, 800, 'SEMARANG'],
    [790, 805, 'TUBAN & GRESIK'],
  ];
  ports.forEach(([px, py, labelTxt], i) => {
    const p = clamp((lt - i * 0.22) / 0.35);
    if (p > 0) {
      K.redSeal(ctx, px, py - 46, String(i + 1), { size: 46, p });
      ctx.fillStyle = K.PAL.paper; ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(px, py, 10, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = K.PAL.ink;
      ctx.font = "700 24px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(labelTxt, px, py + 36);
    }
  });

  K.drawTreasureShip(ctx, lerp(260, 660, clamp(lt / (b - a))), 610, 0.55, { sails: 4, redSails: true, t });
  K.scrollBox(ctx, 540, 1185, 860, 140, 'SIMPUL PERDAGANGAN & DIPLOMASI', 'Pertukaran Keramik Porselen, Sutra & Rempah Nusantara', {
    p: clamp((lt - 0.3) / 0.4),
  });
});

// 5. Palembang 1407 — Defeating Pirate King Chen Zuyi in the Musi / Malacca Strait
shot('palembang', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'PERTEMPURAN PALEMBANG · 1407', sub: 'MENUMPAS BAJAK LAUT CHEN ZUYI DI JALUR SELAT', sealText: '平海' });
  K.inkBloom(ctx, 540, 660, 340, { col: K.PAL.red, alpha: 0.14, seed: 51, t });

  // Dramatic clash of two ships on turbulent ink waves
  K.drawTreasureShip(ctx, 330, 770, 0.78, { sails: 5, redSails: true, t, labelText: 'ARMADA CHENG HO' });
  ctx.save(); ctx.translate(780, 790); ctx.scale(-0.62, 0.62);
  K.drawTreasureShip(ctx, 0, 0, 1, { sails: 3, redSails: false, t: t + 2 });
  ctx.restore();

  // Calligraphic clash slash across pirate fleet
  const slash = clamp((lt - 0.35) / 0.35);
  K.brushStroke(ctx, 620, 560, 910, 860, { w: 16, col: K.PAL.red, dry: true, p: slash });
  K.brushStroke(ctx, 910, 560, 620, 860, { w: 16, col: K.PAL.red, dry: true, p: clamp((lt - 0.5) / 0.35) });

  K.inkWaves(ctx, 880, t, { rows: 4, amp: 24 });
  K.scrollBox(ctx, 540, 1190, 860, 140, 'JALUR DAGang SELAT MALAKA AMAN', '5.000 Bajak Laut Chen Zuyi Ditumpas di Palembang', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.red,
  });
});

// 6. Semarang — Klenteng Agung Sam Poo Kong & Wang Jinghong (Kyai Juru Mudi)
shot('semarang', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'JEJAK ABADI DI SEMARANG', sub: 'GUA BATU SIMONGAN & KLENTENG SAM POO KONG', sealText: '三保' });
  K.mistyMountains(ctx, t, { yBase: 860, seed: 61 });
  K.drawBamboo(ctx, 130, 1020, 540, { bend: 35 + Math.sin(t * 1.8) * 12, nodes: 5 });
  K.drawBamboo(ctx, 945, 1020, 500, { bend: -35 - Math.sin(t * 1.8) * 12, nodes: 5 });

  // Sam Poo Kong three-tiered pavilion
  K.drawPagoda(ctx, 540, 960, 1.18, { tiers: 3, redPillars: true });

  K.scrollBox(ctx, 540, 1195, 860, 145, 'KLENTENG AGUNG SAM POO KONG', 'Tempat Pendaratan Cheng Ho & Juru Mudi Wang Jinghong', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.red,
  });
});

// 7. Scale Debate: Ming Chronicle 127m vs Structural Engineering ~70m (vs Santa Maria 24m)
shot('kapal', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'DEBAT SEJARAWAN: UKURAN BAOCHUAN', sub: 'CATATAN DINASTI MING VS KAJIAN TEKNIK PERKAPALAN', sealText: '尺度' });

  const bars = [
    { y: 430, title: 'CATATAN SEJARAH MING (44 ZHANG)', val: '±127 METER', w: 780, col: K.PAL.red, shipS: 0.72 },
    { y: 710, title: 'ESTIMASI STRUKTURAL KAYU MODERN', val: '60–70 METER', w: 460, col: K.PAL.ink, shipS: 0.46 },
    { y: 980, title: 'SANTA MARIA (COLUMBUS, 1492)', val: '±24 METER', w: 175, col: K.PAL.mid, shipS: 0.22 },
  ];

  bars.forEach((B, i) => {
    const p = ease.outCubic(clamp((lt - i * 0.25) / 0.45));
    ctx.save();
    ctx.fillStyle = K.PAL.ink;
    ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText(B.title, 110, B.y - 54);
    ctx.fillStyle = B.col;
    ctx.textAlign = 'right';
    ctx.font = "700 34px 'Noto Serif', Georgia, serif";
    ctx.fillText(B.val, 970, B.y - 54);

    // Ink comparison bar
    K.brushStroke(ctx, 110, B.y, 110 + B.w * p, B.y, { w: 26, col: B.col, dry: true, p: 1 });
    // Ship silhouette above the bar
    K.drawTreasureShip(ctx, 110 + (B.w * p) / 2, B.y - 26, B.shipS * p, {
      sails: i === 2 ? 3 : 5,
      redSails: i === 0,
      t,
    });
    ctx.restore();
  });

  K.scrollBox(ctx, 540, 1215, 860, 130, 'TETAP RAKSASA DI ZAMANNYA', 'Bahkan di Ukuran 70 Meter, Tiga Kali Lipat Kapal Eropa', {
    p: clamp((lt - 0.4) / 0.4),
  });
});

// 8. Finale: Peaceful maritime legacy in Nusantara (Mosques, Temples, Ceramics & Acculturation)
shot('akhir', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'WARISAN PERSAUDARAAN NUSANTARA', sub: 'DIPLOMASI DAMAI TANPA PENJAJAHAN', sealText: '和平' });
  K.mistyMountains(ctx, t, { yBase: 760, seed: 88 });
  K.drawPagoda(ctx, 290, 770, 0.72, { tiers: 3, redPillars: true });
  K.drawTreasureShip(ctx, 730, 840, 0.85, { sails: 5, redSails: true, t });
  K.inkWaves(ctx, 900, t, { rows: 3, amp: 14 });

  K.redSeal(ctx, 540, 490, '鄭和', { size: 130, p: clamp((lt - 0.2) / 0.4) });
  K.scrollBox(ctx, 540, 1185, 860, 150, 'JEJAK YANG TAK PERNAH TENGGELAM', 'Hidup dalam Arsitektur Masjid, Klenteng & Budaya Nusantara', {
    p: clamp((lt - 0.3) / 0.4),
    accent: K.PAL.red,
  });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  AM.lib.vignette(fx, 0.22);
  AM.lib.grain(fx, t, { amount: 0.025, fps: 12 });
}
