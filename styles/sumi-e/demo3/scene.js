// Sumi-e Tinta Timur — Demo 3: "Bambu dan Angin Topan — Rahasia Struktur Berongga"
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
  AM.sfx('wind', 0.1, { gain: 0.45 });
  AM.sfx('whoosh', C.pepatah.start + 0.15, { gain: 0.35 });
  AM.sfx('pop', C.rongga.start + 0.2, { gain: 0.35 });
  AM.sfx('drum_hit', C.buku.start + 0.2, { gain: 0.4 });
  AM.sfx('chime', C.serat.start + 0.2, { gain: 0.35 });
  AM.sfx('swoosh_up', C.baja.start + 0.2, { gain: 0.4 });
  AM.sfx('chime', C.gedung.start + 0.2, { gain: 0.4 });
  AM.sfx('stamp', C.akhir.start + 0.25, { gain: 0.45 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start, L[i + 1] ? C[L[i + 1].id].start : AM.duration];
};

// Draw calligraphic wind gusts across the rice paper
function drawWindGusts(g, t, count = 6) {
  g.save();
  for (let i = 0; i < count; i++) {
    const yy = 280 + i * 115;
    const xOff = ((t * 360 + i * 170) % 900);
    K.brushStroke(g, 90 + xOff * 0.2, yy, 420 + xOff * 0.55, yy + Math.sin(t * 3 + i) * 28, {
      w: 5,
      col: K.PAL.mid,
      dry: true,
      arch: 20,
      alpha: 0.45,
    });
  }
  g.restore();
}

// 1. Hook: Rigid oak snaps in the typhoon vs slender bamboo bending intact
shot('hook', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'POHON KAKU VS RUMPUN BAMBU', sub: 'PARADOKS KETANGGUHAN DI TENGAH ANGIN TOPAN', sealText: '竹' });
  drawWindGusts(ctx, t, 7);

  // Left side: Rigid heavy tree trunk snapping under wind load
  ctx.save();
  ctx.translate(290, 980);
  ctx.fillStyle = K.PAL.dark;
  ctx.fillRect(-36, -240, 72, 240);
  // Snapped upper trunk tilting right with red fracture mark
  const snap = ease.outBack(clamp((lt - 0.3) / 0.5), 1.6);
  ctx.save();
  ctx.translate(20, -240);
  ctx.rotate(snap * 0.85);
  ctx.fillRect(-32, -220, 64, 220);
  K.inkBloom(ctx, 0, -230, 125, { col: K.PAL.dark, alpha: 0.5, seed: 3, t });
  ctx.restore();
  if (snap > 0.1) {
    K.brushStroke(ctx, -60, -245, 70, -235, { w: 12, col: K.PAL.red, dry: true, p: snap });
  }
  ctx.fillStyle = K.PAL.red;
  ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('KAKU → PATAH', 0, 55);
  ctx.restore();

  // Right side: Three Sumi-e bamboo stalks bending gracefully in the wind
  const gust = 135 + Math.sin(t * 2.8) * 35;
  K.drawBamboo(ctx, 660, 980, 620, { bend: gust, sw: 22, nodes: 6 });
  K.drawBamboo(ctx, 740, 980, 550, { bend: gust * 1.1, sw: 18, nodes: 5 });
  K.drawBamboo(ctx, 810, 980, 480, { bend: gust * 0.95, sw: 15, col: K.PAL.dark, nodes: 5 });
  ctx.fillStyle = K.PAL.ink;
  ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('LENTUR → BERTAHAN', 740, 1035);

  K.scrollBox(ctx, 540, 1200, 860, 140, 'MENGAPA BAMBU TIDAK PERNAH PATAH?', 'Rahasia Fisika & Biologi di Balik Pohon Berongga', {
    p: clamp((lt - 0.25) / 0.4),
  });
});

// 2. Classic Sumi-e motif: Bamboo bowing in the storm and springing back upright
shot('pepatah', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'SIMBOL KETANGGUHAN TIMUR', sub: 'MELENGKUNG RENDAH LALU BANGKIT KEMBALI', sealText: '節' });
  K.mistyMountains(ctx, t, { yBase: 860, seed: 42 });
  drawWindGusts(ctx, t, 5);

  const sway = Math.sin(lt * 2.2) * 165;
  K.drawBamboo(ctx, 460, 1020, 680, { bend: sway, sw: 26, nodes: 6 });
  K.drawBamboo(ctx, 560, 1020, 600, { bend: sway * 0.9, sw: 20, nodes: 5 });
  K.drawBamboo(ctx, 380, 1020, 510, { bend: sway * 1.1, sw: 16, col: K.PAL.dark, nodes: 5 });

  K.redSeal(ctx, 850, 470, '剛柔', { size: 96, p: clamp((lt - 0.25) / 0.35) });
  K.scrollBox(ctx, 540, 1190, 860, 145, 'MENYERAP ENERGI ANGIN TOPAN', 'Mengubah Beban Hantaman Badai Menjadi Energi Pegas Elastis', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.red,
  });
});

// 3. Secret #1: Hollow Cylinder Geometry (Second Moment of Area / Momen Inersia)
shot('rongga', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'RAHASIA 1 · SILINDER BERONGGA', sub: 'MASSA DITEMPATKAN DI DINDING TERLUAR BATANG', sealText: '空心' });

  // Left: Solid rod with small radius vs Right: Hollow bamboo tube with large outer radius (same mass!)
  ctx.save();
  // Solid rod
  ctx.translate(310, 640);
  ctx.fillStyle = K.PAL.mid;
  ctx.beginPath(); ctx.arc(0, 0, 88, 0, TAU); ctx.fill();
  ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = K.PAL.ink;
  ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('BATANG PADAT', 0, 165);
  ctx.font = "600 24px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText('Massa Sama · Mudah Melengkung', 0, 205);
  ctx.restore();

  // Hollow bamboo cylinder (much larger outer radius for same cross-sectional area)
  ctx.save();
  ctx.translate(760, 640);
  ctx.fillStyle = K.PAL.ink;
  ctx.beginPath(); ctx.arc(0, 0, 165, 0, TAU); ctx.fill();
  ctx.fillStyle = K.PAL.paper;
  ctx.beginPath(); ctx.arc(0, 0, 126, 0, TAU); ctx.fill();
  ctx.strokeStyle = K.PAL.red; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(0, 0, 165, 0, TAU); ctx.stroke();
  ctx.fillStyle = K.PAL.red;
  ctx.font = "700 30px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('RONGGA', 0, 8);
  ctx.fillStyle = K.PAL.ink;
  ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText('SILINDER BAMBU', 0, 215);
  ctx.fillStyle = K.PAL.red;
  ctx.font = "700 24px 'Plus Jakarta Sans', sans-serif";
  ctx.fillText('Kekakuan Tekuk ±3× Lebih Tinggi!', 0, 255);
  ctx.restore();

  K.scrollBox(ctx, 540, 1185, 860, 145, 'EFISIENSI MOMEN INERSIA GEOMETRIS', 'Tanpa Beban Inti Tengah, Batang Jauh Lebih Ringan & Kokoh', {
    p: clamp((lt - 0.25) / 0.4),
  });
});

// 4. Secret #2: Internal Node Diaphragms ("Buku Bambu / Sekat Cincin Penguat")
shot('buku', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'RAHASIA 2 · SEKAT BUKU BAMBU', sub: 'CINCIN PENGUAT ANTI PENYOK (BRAZIER BUCKLING)', sealText: '竹節' });

  // Cutaway longitudinal cross-section of a bamboo culm showing internal solid diaphragms at each node
  ctx.save();
  ctx.translate(540, 660);
  // Outer walls
  ctx.fillStyle = K.PAL.ink;
  ctx.fillRect(-150, -340, 36, 680);
  ctx.fillRect(114, -340, 36, 680);
  // Inner hollow cavity wash
  ctx.fillStyle = 'rgba(148,141,130,0.18)';
  ctx.fillRect(-114, -340, 228, 680);

  // Reinforcing node diaphragms (sekat buku bambu)
  for (const ny of [-220, 0, 220]) {
    ctx.fillStyle = K.PAL.red;
    ctx.fillRect(-172, ny - 16, 344, 32);
    ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 5;
    ctx.strokeRect(-172, ny - 16, 344, 32);
    // Outward anti-ovalization force arrows
    ctx.strokeStyle = K.PAL.paper; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-75, ny); ctx.lineTo(75, ny); ctx.stroke();
  }
  ctx.restore();

  K.scrollBox(ctx, 540, 1185, 860, 145, 'MENCEGAH DINDING PIPA TERLIPAT', 'Sekat Buku Bambu Menjaga Penampang Tetap Bulat Saat Melengkung', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.red,
  });
});

// 5. Secret #3: Functionally Graded Vascular Bundles ("Gradien Serat Fungsional")
shot('serat', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'RAHASIA 3 · GRADIEN SERAT MIKRO', sub: 'MATERIAL KOMPOSIT ALAMI BERGRADIEN FUNGSIONAL', sealText: '繊維' });

  // Magnified microscope cross-section of bamboo culm wall showing vascular bundles getting denser toward outer edge
  ctx.save();
  ctx.translate(540, 650);
  const ROut = 270, RIn = 120;
  ctx.fillStyle = K.PAL.paperDark;
  ctx.beginPath(); ctx.arc(0, 0, ROut, 0, TAU); ctx.fill();
  ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 8; ctx.stroke();

  // Vascular fiber bundle dots: sparse near inner cavity, ultra-dense near outer skin!
  const rings = [
    { r: 145, n: 14, sz: 12, col: K.PAL.mid },
    { r: 185, n: 24, sz: 10, col: K.PAL.dark },
    { r: 220, n: 38, sz: 8.5, col: K.PAL.ink },
    { r: 248, n: 60, sz: 7, col: K.PAL.red },
  ];
  rings.forEach((rg, idx) => {
    const k = clamp((lt - idx * 0.12) / 0.35);
    ctx.fillStyle = rg.col;
    for (let i = 0; i < rg.n; i++) {
      const a0 = (i / rg.n) * TAU + idx * 0.2;
      ctx.beginPath();
      ctx.arc(Math.cos(a0) * rg.r, Math.sin(a0) * rg.r, rg.sz * k, 0, TAU);
      ctx.fill();
    }
  });

  // Inner hollow core
  ctx.fillStyle = K.PAL.paper;
  ctx.beginPath(); ctx.arc(0, 0, RIn, 0, TAU); ctx.fill();
  ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = K.PAL.ink;
  ctx.font = "700 26px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('RONGGA DALAM', 0, 8);
  ctx.restore();

  K.scrollBox(ctx, 540, 1185, 860, 145, 'SERAT MAKIN RAPAT DI KULIT LUAR', 'Menahan Tegangan Tarik & Tekan Maksimum di Permukaan Batang', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.red,
  });
});

// 6. Specific Tensile Strength: Bamboo vs Structural Steel ("Baja Hijau Alami")
shot('baja', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'RASIO KEKUATAN TARIK / BERAT', sub: 'DIJULUKI "BAJA HIJAU" OLEH INSINYUR SIPIL', sealText: '強靭' });

  const items = [
    { y: 490, label: 'BAMBU (RASIO KEKUATAN / BERAT)', val: '2× LEBIH UNGGUL DARI BAJA', w: 760, col: K.PAL.red },
    { y: 710, label: 'BAJA STRUKTURAL (A36 STEEL)', val: 'KUAT TAPI SANGAT BERAT', w: 420, col: K.PAL.ink },
    { y: 930, label: 'BETON BERTULANG BIASA', val: 'KAKU & RENTAN RETAK TARIK', w: 220, col: K.PAL.mid },
  ];
  items.forEach((it, i) => {
    const p = ease.outCubic(clamp((lt - i * 0.2) / 0.45));
    ctx.save();
    ctx.fillStyle = K.PAL.ink;
    ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText(it.label, 110, it.y - 42);
    ctx.fillStyle = it.col;
    ctx.textAlign = 'right';
    ctx.fillText(it.val, 970, it.y - 42);
    K.brushStroke(ctx, 110, it.y, 110 + it.w * p, it.y, { w: 32, col: it.col, dry: true, p: 1 });
    ctx.restore();
  });

  K.scrollBox(ctx, 540, 1185, 860, 145, 'KUAT SEPERTI BAJA, LENTUR SEPERTI PEGAS', 'Kekuatan Tarik Serat Bambu Mencapai ±350–400 Megapascal', {
    p: clamp((lt - 0.3) / 0.4),
  });
});

// 7. Biomimicry Architecture: Taipei 101 Bamboo-Segmented Skyscraper
shot('gedung', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'INSPIRASI PENCAKAR LANGIT', sub: 'MENARA TAIPEI 101 · ARSITEKTUR BUKU BAMBU', sealText: '建築' });
  K.mistyMountains(ctx, t, { yBase: 990, seed: 73 });

  // Left: Natural bamboo stalk
  K.drawBamboo(ctx, 280, 990, 620, { bend: Math.sin(t * 2) * 18, sw: 24, nodes: 6 });

  // Right: Taipei 101 skyscraper with 8 stacked bamboo-node modules (508m)
  ctx.save();
  ctx.translate(720, 990);
  // Base podium
  ctx.fillStyle = K.PAL.ink;
  ctx.fillPath;
  ctx.beginPath();
  ctx.moveTo(-110, 0); ctx.lineTo(-80, -130); ctx.lineTo(80, -130); ctx.lineTo(110, 0); ctx.closePath();
  ctx.fill();
  // 8 flaring bamboo segments
  for (let i = 0; i < 8; i++) {
    const sy = -130 - i * 58;
    ctx.fillStyle = i % 2 === 0 ? K.PAL.dark : K.PAL.ink;
    ctx.beginPath();
    ctx.moveTo(-64, sy);
    ctx.lineTo(-82, sy - 54);
    ctx.lineTo(82, sy - 54);
    ctx.lineTo(64, sy);
    ctx.closePath();
    ctx.fill();
    // Red node belt highlight
    ctx.fillStyle = K.PAL.red;
    ctx.fillRect(-74, sy - 58, 148, 6);
  }
  // Spire
  ctx.strokeStyle = K.PAL.ink; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(0, -594); ctx.lineTo(0, -685); ctx.stroke();
  ctx.restore();

  K.scrollBox(ctx, 540, 1190, 860, 145, 'MENARA TAIPEI 101 (508 METER)', 'Delapan Ruas Buku Bambu Tahan Gempa Bumi & Topan Super', {
    p: clamp((lt - 0.25) / 0.4),
    accent: K.PAL.red,
  });
});

// 8. Finale: Wisdom of the Bamboo in Sumi-e Ink
shot('akhir', (t, a, b) => {
  const lt = t - a;
  K.ricePaper(ctx, t, { header: 'FALSAFAH BAMBU & ANGIN BADAI', sub: 'LENTUR DI ATAS, BERAKAR KUAT DI BAWAH', sealText: '道' });
  K.mistyMountains(ctx, t, { yBase: 860, seed: 91 });

  const sway = Math.sin(t * 1.8) * 55;
  K.drawBamboo(ctx, 480, 1010, 640, { bend: sway, sw: 24, nodes: 6 });
  K.drawBamboo(ctx, 580, 1010, 540, { bend: sway * 0.9, sw: 18, nodes: 5 });
  K.redSeal(ctx, 820, 490, '不屈', { size: 108, p: clamp((lt - 0.2) / 0.35) });

  K.scrollBox(ctx, 540, 1185, 860, 150, 'YANG LENTUR AKAN MENGALAHKAN YANG KAKU', 'Melengkung Tanpa Patah, Bangkit Lebih Tegak Setelah Badai', {
    p: clamp((lt - 0.25) / 0.4),
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

