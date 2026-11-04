// Manga Action demo 2: "Tinju Udang Mantis — Pukulan 80 km/jam di Bawah Air"
import * as K from '/styles/manga-action/kit.js';
const { clamp, lerp, ease, hrand, TAU } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'comic', y: 1480, size: 68, color: '#0e0e10', active: '#d7263d', box: { fill: '#f6f4ee', pad: 20, radius: 4, border: '#0e0e10', borderW: 7 } } };

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('whoosh', 0.08, { gain: 0.45 });
  AM.sfx('impact', C.udang.start + 0.4, { gain: 0.55 });
  AM.sfx('riser', C.pegas.start + 0.2, { gain: 0.35 });
  AM.sfx('impact', C.pukul.start + 0.15, { gain: 0.7 });
  AM.sfx('boom', C.pukul.start + 0.18, { gain: 0.55 });
  AM.sfx('whoosh', C.kavitasi.start + 0.15, { gain: 0.4 });
  AM.sfx('boom', C.matahari.start + 0.25, { gain: 0.65 });
  AM.sfx('stamp', C.perisai.start + 0.2, { gain: 0.45 });
  AM.sfx('drum_hit', C.akhir.start + 0.25, { gain: 0.55 });
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => { const L = SHOTS.filter((x) => C[x.id]); const i = L.findIndex((x) => x.id === id); return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1]; };
const shk = (t, amt) => [(hrand(Math.floor(t * 24), 1) - 0.5) * amt, (hrand(Math.floor(t * 24), 2) - 0.5) * amt];
const BOT = 1890;

// Draw dramatic manga Mantis Shrimp ("Petinju Terumbu Karang")
function drawMantisShrimp(g, x, y, s = 1, { punch = 0, cocked = 1, sil = false, t = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const fill = sil ? '#0e0e10' : '#f6f4ee';
  g.lineWidth = 8; g.strokeStyle = '#0e0e10'; g.lineJoin = 'round';

  // Segmented armoured tail / carapace curving back
  for (let i = 5; i >= 0; i--) {
    const sx = -260 + i * 44, sy = 90 - Math.sin(i * 0.45) * 45;
    g.beginPath(); g.ellipse(sx, sy, 58, 72 - i * 4, -0.25 + i * 0.08, 0, TAU);
    g.fillStyle = fill; g.fill();
    if (!sil && i % 2 === 0) {
      g.save(); g.clip(); g.fillStyle = K.tone(g, 'mid'); g.fillRect(sx - 60, sy, 120, 80); g.restore();
    }
    g.stroke();
  }

  // Thorax & head shield
  g.beginPath(); g.moveTo(-40, -110); g.quadraticCurveTo(90, -135, 160, -40);
  g.lineTo(120, 75); g.quadraticCurveTo(10, 95, -55, 50); g.closePath();
  g.fillStyle = fill; g.fill();
  if (!sil) {
    g.save(); g.clip(); g.fillStyle = K.tone(g, 'dark'); g.fillRect(-50, 10, 220, 85); g.restore();
  }
  g.stroke();

  // Stalked compound eyes with trinocular bands
  for (const [ex, ey, ang] of [[115, -135, -0.3], [165, -115, 0.15]]) {
    g.save(); g.translate(ex, ey); g.rotate(ang + Math.sin(t * 6) * 0.05);
    g.fillStyle = '#0e0e10'; g.fillRect(-10, 0, 20, 50);
    g.beginPath(); g.ellipse(0, -22, 34, 42, 0, 0, TAU);
    g.fillStyle = fill; g.fill(); g.stroke();
    if (!sil) {
      g.fillStyle = '#0e0e10'; g.fillRect(-30, -28, 60, 12);
      g.fillStyle = '#d7263d'; g.beginPath(); g.arc(8, -22, 6, 0, TAU); g.fill();
    }
    g.restore();
  }

  // Raptorial Dactyl Club (the spring-loaded hammer!)
  const reach = lerp(0, 320, punch);
  const armRot = lerp(0.55 * cocked, -0.35, punch);
  g.save(); g.translate(75 + reach * 0.35, 25 - reach * 0.1); g.rotate(armRot);
  // Merus (upper arm containing the saddle spring)
  g.beginPath(); g.roundRect(-30, -35, 175, 72, 26);
  g.fillStyle = fill; g.fill();
  if (!sil) {
    // Saddle spring highlight on top of merus
    g.fillStyle = '#d7263d';
    g.beginPath(); g.ellipse(55, -26, 42, 14, 0, 0, TAU); g.fill(); g.stroke();
  }
  g.stroke();

  // Propodus + bulbous Dactyl Club
  g.save(); g.translate(140 + reach * 0.65, 10); g.rotate(lerp(-2.2, 0.15, punch));
  if (punch > 0.2 && !sil) {
    // Motion blur arc
    g.fillStyle = 'rgba(14,14,16,0.22)';
    g.beginPath(); g.arc(-60, 0, 220, -1.6, 0.3); g.lineTo(-60, 0); g.fill();
  }
  // Club bulb
  g.beginPath(); g.moveTo(0, -20); g.lineTo(130, -48);
  g.arc(155, 0, 56, -Math.PI * 0.42, Math.PI * 0.42);
  g.lineTo(0, 28); g.closePath();
  g.fillStyle = sil ? '#0e0e10' : '#f6f4ee'; g.fill();
  if (!sil) {
    g.save(); g.clip();
    g.fillStyle = '#d7263d'; g.beginPath(); g.arc(165, 0, 46, 0, TAU); g.fill();
    g.fillStyle = K.tone(g, 'dark'); g.fillRect(0, 4, 150, 45);
    g.restore();
  }
  g.lineWidth = 10; g.stroke();
  g.restore();
  g.restore();

  g.restore();
}

// Draw compound stalked eyes close-up strip
function drawMantisEyesStrip(g, x, y, s = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = K.tone(g, 'mid'); g.fillRect(-460, -150, 920, 300);
  for (const sd of [-1, 1]) {
    g.save(); g.translate(sd * 200, 0); g.rotate(sd * 0.12);
    g.beginPath(); g.ellipse(0, 0, 145, 115, 0, 0, TAU);
    g.fillStyle = '#f6f4ee'; g.fill();
    g.save(); g.clip();
    // Hexagonal ommatidia grid shading
    g.fillStyle = K.tone(g, 'light'); g.fillRect(-150, -120, 300, 240);
    // Midband (6-row trinocular color/polarization strip)
    g.fillStyle = '#0e0e10'; g.fillRect(-160, -26, 320, 52);
    g.fillStyle = '#d7263d'; g.fillRect(-160, -10, 320, 20);
    // Glint
    g.fillStyle = '#f6f4ee'; g.beginPath(); g.ellipse(-45, -48, 26, 14, -0.3, 0, TAU); g.fill();
    g.restore();
    g.lineWidth = 12; g.strokeStyle = '#0e0e10'; g.stroke();
    g.restore();
  }
  g.restore();
}

// 1. Hook: Tiny 10cm silhouette vs giant boxing menace in the coral reef
shot('hook', (t, a, b) => {
  const lt = t - a;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 620], [40, 700]], (g) => {
    K.focusLines(g, 540, 380, t, { inner: 180, outer: 1200, n: 85, x0: 40, y0: 80, x1: 1040, y1: 700 });
    drawMantisEyesStrip(g, 540, 380, 0.95, t);
    K.capBox(g, 'PETINJU PALING MEMATIKAN DI BUMI', 540, 155, { size: 46 });
  }, { k: 1 });
  K.panel(ctx, [[40, 740], [1040, 660], [1040, BOT], [40, BOT]], (g) => {
    K.gradTone(g, 40, 660, 1000, 700, { invert: false });
    drawMantisShrimp(g, 480, 1060, 1.15, { punch: 0, cocked: 1, sil: false, t });
    K.sfxText(g, '10 CM!', 800, 880, { size: 155, k: clamp((lt - 0.25) / 0.25), t, rot: -0.1, shake: 4 });
    K.capBox(g, 'SEUKURAN JARI TELUNJUK MANUSIA', 430, 1290, { size: 44, alpha: clamp((lt - 0.3) / 0.3) });
  }, { k: clamp((lt - 0.15) / 0.3), from: 'bottom' });
});

// 2. Udang Mantis Merak shattering aquarium glass
shot('udang', (t, a, b) => {
  const lt = t - a;
  const hit = clamp((lt - 0.45) / 0.35);
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 780], [40, 860]], (g) => {
    K.speedLines(g, t, { ang: -0.1, x0: 40, y0: 80, x1: 1040, y1: 860, n: 65, w: 5 });
    drawMantisShrimp(g, 380, 520, 1.05, { punch: ease.outExpo(hit), cocked: 1, t });
    // Aquarium glass wall on the right
    g.strokeStyle = '#0e0e10'; g.lineWidth = 12;
    g.beginPath(); g.moveTo(860, 80); g.lineTo(860, 860); g.stroke();
    if (hit > 0.1) {
      // Radial crack web on glass
      g.save(); g.translate(860, 480); g.strokeStyle = '#0e0e10'; g.lineWidth = 6;
      for (let i = 0; i < 11; i++) {
        const ang = -1.3 + i * 0.26;
        g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(ang) * 260 * hit, Math.sin(ang) * 260 * hit); g.stroke();
      }
      g.restore();
      K.sfxText(g, 'PRANG!!', 680, 260, { size: 165, k: clamp((hit - 0.05) / 0.2), t, rot: -0.12, shake: 8 });
    }
    K.capBox(g, 'ODONTODACTYLUS SCYLLARUS', 350, 155, { size: 44 });
  }, { k: 1 });
  K.panel(ctx, [[40, 900], [1040, 820], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 540, 1140, t, { inner: 160, n: 90, x0: 40, y0: 820, x1: 1040, y1: BOT });
    K.shatter(g, clamp((lt - 0.5) / 1.8), { cx: 540, cy: 1120, seed: 5 });
    K.sfxText(g, 'KACA PECAH!', 540, 1130, { size: 145, k: clamp((lt - 0.55) / 0.25), t, rot: 0.04, shake: 5 });
  }, { k: clamp((lt - 0.2) / 0.3), from: 'right' });
});

// 3. Biological Saddle Spring & Latch Mechanism ("Pelana Pegas & Kait Biologis")
shot('pegas', (t, a, b) => {
  const lt = t - a;
  const load = clamp(lt / (b - a - 0.5));
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 820], [40, 740]], (g) => {
    g.fillStyle = '#0e0e10'; g.fillRect(40, 80, 1000, 740);
    K.focusLines(g, 540, 440, t, { inner: 210, n: 80, col: '#f6f4ee', x0: 40, y0: 80, x1: 1040, y1: 820 });
    // Technical X-ray diagram of the chitin saddle spring
    g.save(); g.translate(540, 460);
    g.strokeStyle = '#f6f4ee'; g.lineWidth = 8;
    g.beginPath(); g.roundRect(-320, -110, 640, 220, 70); g.stroke();
    // Hyperbolic paraboloid saddle on top compressing under tension
    const comp = Math.sin(load * Math.PI * 0.5);
    g.fillStyle = '#d7263d'; g.strokeStyle = '#f6f4ee'; g.lineWidth = 6;
    g.beginPath();
    g.moveTo(-180, -110);
    g.quadraticCurveTo(0, -40 + comp * 45, 180, -110);
    g.quadraticCurveTo(0, -175 + comp * 35, -180, -110);
    g.fill(); g.stroke();
    // Sclerite latch lock
    g.fillStyle = '#f6f4ee';
    g.fillRect(-40, 30, 80, 60);
    g.restore();
    K.capBox(g, 'MEKANISME PELANA PEGAS KITIN (SADDLE SPRING)', 540, 165, { size: 42, invert: true });
    K.sfxText(g, 'KREK.. KREK..', 540, 690, { size: 110, k: clamp(lt / 0.3), t, invert: true, shake: 4 });
  }, { k: clamp(lt / 0.25), from: 'left' });
  K.panel(ctx, [[40, 780], [1040, 860], [1040, BOT], [40, BOT]], (g) => {
    K.gradTone(g, 40, 780, 1000, 620, { invert: true });
    const pct = Math.round(lerp(10, 100, ease.outCubic(load)));
    K.sfxText(g, `ENERGI: ${pct}%`, 540, 1080, { size: 150, k: 1, t, rot: -0.04, shake: 4 });
    K.capBox(g, 'DIKUNCI RAPAT OLEH KAIT BIOLOGIS', 540, 1260, { size: 46 });
  }, { k: clamp((lt - 0.2) / 0.3), from: 'bottom' });
});

// 4. BAAAM! Impact frame + 80 km/h (10,000 G / .22 caliber bullet acceleration)
shot('pukul', (t, a, b) => {
  const lt = t - a;
  const impact = lt > 0.12 && lt < 0.42;
  const [sx, sy] = shk(t, lt < 0.7 ? 24 : 4);
  ctx.translate(sx, sy);
  if (impact) {
    ctx.fillStyle = '#0e0e10'; ctx.fillRect(-100, -100, 1300, 2200);
    K.focusLines(ctx, 580, 680, t, { inner: 110, n: 140, col: '#f6f4ee', w: 12 });
    drawMantisShrimp(ctx, 420, 820, 1.35, { punch: 1, sil: false, t });
    K.sfxText(ctx, 'BAAAM!', 540, 360, { size: 280, k: 1, t, invert: true, shake: 20 });
    return;
  }
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 780], [40, 880]], (g) => {
    K.focusLines(g, 740, 480, t, { inner: 140, n: 120, x0: 40, y0: 80, x1: 1040, y1: 880 });
    drawMantisShrimp(g, 380, 560, 1.15, { punch: clamp((lt - 0.1) / 0.25), t });
    K.splat(g, 820, 460, 0.85, 4);
    K.sfxText(g, 'BAAAM!', 680, 230, { size: 175, k: clamp(lt / 0.2), t, rot: -0.08, shake: 8 });
  }, { k: 1 });
  K.panel(ctx, [[40, 920], [1040, 820], [1040, BOT], [40, BOT]], (g) => {
    K.gradTone(g, 40, 820, 1000, 580, { invert: true });
    const v = Math.round(lerp(0, 80, ease.outCubic(clamp((lt - 0.3) / 1.1))));
    K.sfxText(g, `${v} KM/JAM`, 540, 1070, { size: 195, k: clamp((lt - 0.25) / 0.25), t, rot: -0.05, shake: 4 });
    K.capBox(g, '10.000 G · SETARA PELURU KALIBER .22 DI DALAM AIR', 540, 1270, { size: 42 });
  }, { k: clamp((lt - 0.2) / 0.25), from: 'bottom' });
});

// 5. Cavitation bubble formation ("Gelembung Hampa Udara Kavitasi")
shot('kavitasi', (t, a, b) => {
  const lt = t - a;
  const u = clamp(lt / (b - a - 0.4));
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 860], [40, 780]], (g) => {
    K.speedLines(g, t, { ang: 0, x0: 40, y0: 80, x1: 1040, y1: 860, n: 60, w: 4 });
    // Club moving right, leaving low-pressure boiling cavitation bubble behind
    const cx = 560, cy = 470, br = lerp(30, 175, ease.outBack(clamp(lt / 0.8)));
    g.save();
    for (let i = 3; i >= 1; i--) {
      g.beginPath(); g.arc(cx, cy, br * (1 + i * 0.18), 0, TAU);
      g.strokeStyle = '#0e0e10'; g.lineWidth = 4; g.setLineDash([14, 10]); g.stroke();
    }
    g.setLineDash([]);
    g.beginPath(); g.arc(cx, cy, br, 0, TAU);
    g.fillStyle = '#0e0e10'; g.fill();
    g.beginPath(); g.arc(cx - 25, cy - 25, br * 0.35, 0, TAU);
    g.fillStyle = '#f6f4ee'; g.fill();
    g.restore();
    K.capBox(g, 'TEKANAN ANJLOK → AIR MENDIDIH SEKETIKA', 540, 155, { size: 44 });
    K.sfxText(g, 'BLUB!!', 560, 720, { size: 135, k: clamp((lt - 0.2) / 0.25), t, rot: -0.06, shake: 4 });
  }, { k: 1 });
  K.panel(ctx, [[40, 820], [1040, 900], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 540, 1120, t, { inner: 200, n: 85, x0: 40, y0: 820, x1: 1040, y1: BOT });
    K.sfxText(g, 'KAVITASI', 540, 1090, { size: 190, k: clamp((lt - 0.2) / 0.3), t, rot: -0.04, shake: 3 });
    K.capBox(g, 'GELEMBUNG VAKUM DI BELAKANG TINJU', 540, 1265, { size: 44 });
  }, { k: clamp((lt - 0.15) / 0.3), from: 'bottom' });
});

// 6. Cavitation Collapse: Second Shockwave + 4,700°C Sonoluminescence Flash!
shot('matahari', (t, a, b) => {
  const lt = t - a;
  const [sx, sy] = shk(t, lt < 0.8 ? 20 : 5);
  ctx.translate(sx, sy);
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 780], [40, 860]], (g) => {
    g.fillStyle = '#0e0e10'; g.fillRect(40, 80, 1000, 780);
    K.focusLines(g, 540, 450, t, { inner: 90, n: 130, col: '#f6f4ee', w: 10, x0: 40, y0: 80, x1: 1040, y1: 860 });
    // Starburst implosion
    g.save(); g.translate(540, 450);
    g.fillStyle = '#d7263d';
    g.beginPath();
    for (let i = 0; i < 24; i++) {
      const a0 = (i / 24) * TAU + t * 2, r = i % 2 ? 230 : 95;
      i ? g.lineTo(Math.cos(a0) * r, Math.sin(a0) * r) : g.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
    }
    g.closePath(); g.fill();
    g.fillStyle = '#f6f4ee'; g.beginPath(); g.arc(0, 0, 75, 0, TAU); g.fill();
    g.restore();
    K.sfxText(g, 'JDERR!!', 540, 210, { size: 175, k: clamp(lt / 0.2), t, invert: true, shake: 12 });
    K.capBox(g, 'GELOMBANG KEJUT KEDUA + SONOLUMINESENSI', 540, 740, { size: 40, invert: true });
  }, { k: 1 });
  K.panel(ctx, [[40, 900], [1040, 820], [1040, BOT], [40, BOT]], (g) => {
    K.gradTone(g, 40, 820, 1000, 580, { invert: true });
    const deg = Math.round(lerp(0, 4700, ease.outCubic(clamp((lt - 0.2) / 1.2))));
    K.sfxText(g, `${deg}°C`, 540, 1080, { size: 220, k: clamp((lt - 0.15) / 0.25), t, rot: -0.05, shake: 6 });
    K.capBox(g, 'SETARA SUHU PERMUKAAN MATAHARI!', 540, 1275, { size: 46 });
  }, { k: clamp((lt - 0.15) / 0.25), from: 'bottom' });
});

// 7. Bouligand Helicoidal Armor Structure ("Struktur Spiral Bouligand")
shot('perisai', (t, a, b) => {
  const lt = t - a;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [1040, 80], [1040, 820], [40, 740]], (g) => {
    K.gradTone(g, 40, 80, 1000, 740, { invert: false });
    // Draw Bouligand helicoidal fiber layers
    g.save(); g.translate(540, 450);
    for (let layer = -4; layer <= 4; layer++) {
      const yOff = layer * 42;
      const rot = layer * 0.28 + Math.sin(t * 2) * 0.05;
      g.save(); g.translate(0, yOff);
      g.fillStyle = layer % 2 === 0 ? '#f6f4ee' : '#0e0e10';
      g.strokeStyle = '#0e0e10'; g.lineWidth = 6;
      g.beginPath(); g.roundRect(-290, -18, 580, 34, 8); g.fill(); g.stroke();
      // Diagonal fiber striations twisting per layer
      g.strokeStyle = layer % 2 === 0 ? '#0e0e10' : '#f6f4ee'; g.lineWidth = 3;
      const step = 28 + Math.abs(layer) * 4;
      for (let xx = -260; xx <= 260; xx += step) {
        g.beginPath(); g.moveTo(xx - Math.sin(rot) * 18, -14); g.lineTo(xx + Math.sin(rot) * 18, 14); g.stroke();
      }
      g.restore();
    }
    g.restore();
    K.capBox(g, 'MINERAL HIDROKSIAPATIT · SPIRAL BOULIGAND', 540, 155, { size: 42 });
  }, { k: clamp(lt / 0.25), from: 'left' });
  K.panel(ctx, [[40, 780], [1040, 860], [1040, BOT], [40, BOT]], (g) => {
    K.focusLines(g, 540, 1100, t, { inner: 180, n: 85, x0: 40, y0: 780, x1: 1040, y1: BOT });
    K.sfxText(g, 'ANTI RETAK!', 540, 1090, { size: 165, k: clamp((lt - 0.25) / 0.25), t, rot: -0.05, shake: 3 });
    K.capBox(g, 'MENYERAP & MEMBELOKKAN GELOMBANG RETAKAN MIKRO', 540, 1265, { size: 40 });
  }, { k: clamp((lt - 0.2) / 0.25), from: 'right' });
});

// 8. Finale: One tiny creature, two devastating hits (Physical + Cavitation)
shot('akhir', (t, a, b) => {
  const lt = t - a;
  K.page(ctx);
  K.panel(ctx, [[40, 80], [520, 80], [480, 1340], [40, 1340]], (g) => {
    K.focusLines(g, 270, 660, t, { inner: 140, n: 80, x0: 40, y0: 80, x1: 520, y1: 1340 });
    drawMantisShrimp(g, 240, 760, 0.85, { punch: 1, t });
    K.capBox(g, 'HANTAMAN 1', 270, 180, { size: 46 });
    K.sfxText(g, 'TINJU FISIK', 270, 340, { size: 95, k: clamp(lt / 0.25), t, rot: -0.06, shake: 3 });
    K.sfxText(g, '1.500 N', 270, 1140, { size: 120, k: 1, t, rot: -0.04, shake: 2 });
  }, { k: clamp(lt / 0.25), from: 'left' });
  K.panel(ctx, [[550, 80], [1040, 80], [1040, 1340], [510, 1340]], (g) => {
    g.fillStyle = '#0e0e10'; g.fillRect(510, 80, 530, 1260);
    K.focusLines(g, 780, 660, t, { inner: 140, n: 80, col: '#f6f4ee', x0: 510, y0: 80, x1: 1040, y1: 1340 });
    g.fillStyle = '#d7263d'; g.beginPath(); g.arc(780, 740, 130 + Math.sin(t * 16) * 14, 0, TAU); g.fill();
    g.fillStyle = '#f6f4ee'; g.beginPath(); g.arc(780, 740, 65, 0, TAU); g.fill();
    K.capBox(g, 'HANTAMAN 2', 780, 180, { size: 46, invert: true });
    K.sfxText(g, 'KAVITASI', 780, 340, { size: 105, k: clamp((lt - 0.15) / 0.25), t, rot: -0.06, invert: true, shake: 4 });
    K.sfxText(g, '4.700°C', 780, 1140, { size: 120, k: 1, t, rot: -0.04, invert: true, shake: 4 });
  }, { k: clamp((lt - 0.15) / 0.25), from: 'right' });
});

export function render(t, AM) {
  fx.clearRect(0, 0, AM.W, AM.H);
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); s.fn(t, Math.max(0, a), b); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const since = t - Math.max(0, a);
  if (since < 0.09 && s.id !== 'hook' && s.id !== 'pukul') { fx.fillStyle = 'rgba(14,14,16,0.9)'; fx.fillRect(0, 0, AM.W, AM.H); }
  const endA = clamp((t - (AM.duration - 0.45)) / 0.45);
  if (endA > 0) { fx.fillStyle = `rgba(246,244,238,${endA})`; fx.fillRect(0, 0, AM.W, AM.H); }
  AM.lib.grain(fx, t, { amount: 0.04, fps: 12 });
}

