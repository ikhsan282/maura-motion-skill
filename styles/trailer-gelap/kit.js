// Trailer Tipografi Gelap (trailer-gelap) kit:
// Volumetric spotlight cones, floating ash/ice embers, anamorphic lens flare, fire-gold gradient hero numerals,
// wide-tracked small-caps subtitles, archival telegram cards, and backlit dramatic silhouettes.
const { clamp, lerp, ease, noise } = AM.lib;

export const PAL = {
  bg: '#050609',
  ivory: '#f7f2e7',
  gold: '#ffc45c',
  ember: '#ff5d29',
  crimson: '#e0323e',
  ice: '#78ccff',
  dim: '#9a9386',
  panel: 'rgba(14,15,20,0.88)',
};

export const FONT = {
  serif: 'Cinzel, Playfair Display, Georgia, serif',
  cond: 'Oswald, Impact, Inter, sans-serif',
  mono: 'JetBrains Mono, monospace',
  sans: 'Inter, sans-serif',
};

export function stage(g, t, { theme = 'ember', spotlight = true } = {}) {
  g.fillStyle = PAL.bg;
  g.fillRect(0, 0, 1080, 1920);

  const primaryRgb = theme === 'ice' ? '120,204,255' : theme === 'crimson' ? '224,50,62' : '255,140,60';
  const secondaryRgb = theme === 'ice' ? '200,235,255' : '255,196,92';

  // Volumetric spotlight cone from top
  if (spotlight) {
    g.save();
    const sway = Math.sin(t * 0.45) * 45;
    g.beginPath();
    g.moveTo(540 + sway * 0.3, -80);
    g.lineTo(60 + sway, 1920);
    g.lineTo(1020 + sway, 1920);
    g.closePath();
    const coneGr = g.createLinearGradient(540, 0, 540, 1750);
    coneGr.addColorStop(0, `rgba(${primaryRgb},0.22)`);
    coneGr.addColorStop(0.5, `rgba(${primaryRgb},0.08)`);
    coneGr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = coneGr;
    g.fill();
    g.restore();
  }

  // Center ambient glow
  const amb = g.createRadialGradient(540, 760, 40, 540, 760, 760);
  amb.addColorStop(0, `rgba(${primaryRgb},0.14)`);
  amb.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = amb;
  g.fillRect(0, 0, 1080, 1920);

  // Floating ash / ember / ice particles
  g.save();
  for (let i = 0; i < 42; i++) {
    const seed = i * 37.17;
    const px = ((seed * 19.3 + t * (12 + (i % 5) * 4) + Math.sin(t * 0.8 + i) * 35) % 1080 + 1080) % 1080;
    const py = ((seed * 43.7 - t * (28 + (i % 7) * 6)) % 1920 + 1920) % 1920;
    const r = 1.5 + (i % 4) * 1.3;
    const a = 0.2 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.2 + i));
    g.fillStyle = i % 3 === 0 ? `rgba(${secondaryRgb},${a})` : `rgba(${primaryRgb},${a * 0.85})`;
    g.beginPath();
    g.arc(px, py, r, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();

  // Deep radial vignette
  const vig = g.createRadialGradient(540, 960, 320, 540, 960, 1150);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.78)');
  g.fillStyle = vig;
  g.fillRect(0, 0, 1080, 1920);

  // Subtle cinema frame border & top/bottom letterbox trim
  g.fillStyle = '#020204';
  g.fillRect(0, 0, 1080, 48);
  g.fillRect(0, 1872, 1080, 48);
  g.strokeStyle = 'rgba(247,242,231,0.14)';
  g.lineWidth = 1.5;
  g.strokeRect(48, 72, 984, 1776);
}

export function topHeader(g, t, { archive = 'ARCHIVE REEL // 1912', reel = 'REEL 01', theme = 'ember' } = {}) {
  const col = theme === 'ice' ? PAL.ice : theme === 'crimson' ? PAL.crimson : PAL.gold;
  g.save();
  g.font = `600 20px ${FONT.mono}`;
  g.fillStyle = PAL.dim;
  g.textAlign = 'left';
  g.fillText(archive, 80, 112);

  g.textAlign = 'right';
  g.fillStyle = col;
  const sec = Math.floor(t);
  const fr = Math.floor((t % 1) * 24);
  g.fillText(`${reel} · TC 00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, 1000, 112);

  // Horizontal divider with center diamond
  g.strokeStyle = 'rgba(247,242,231,0.18)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(80, 134);
  g.lineTo(1000, 134);
  g.stroke();

  g.fillStyle = col;
  g.beginPath();
  g.moveTo(540, 127);
  g.lineTo(547, 134);
  g.lineTo(540, 141);
  g.lineTo(533, 134);
  g.closePath();
  g.fill();
  g.restore();
}

export function flareStreak(g, x, y, w, { color = PAL.gold, alpha = 0.65 } = {}) {
  g.save();
  g.globalAlpha = alpha;
  const gr = g.createLinearGradient(x - w / 2, y, x + w / 2, y);
  gr.addColorStop(0, 'rgba(255,255,255,0)');
  gr.addColorStop(0.35, color);
  gr.addColorStop(0.5, '#ffffff');
  gr.addColorStop(0.65, color);
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(x - w / 2, y - 2, w, 4);
  g.restore();
}

export function trailerTitle(g, x, y, lines, { sub = '', tag = '', theme = 'ember', size = 62, reveal = 1 } = {}) {
  const accent = theme === 'ice' ? PAL.ice : theme === 'crimson' ? PAL.crimson : PAL.gold;
  const s = lerp(0.95, 1.0, clamp(reveal));
  g.save();
  g.globalAlpha = clamp(reveal);
  g.translate(x, y);
  g.scale(s, s);

  if (tag) {
    g.font = `700 22px ${FONT.mono}`;
    g.fillStyle = accent;
    g.textAlign = 'center';
    try { g.letterSpacing = '6px'; } catch (e) {}
    g.fillText(tag.toUpperCase(), 0, -76);
  }

  lines.forEach((ln, idx) => {
    const ly = idx * (size * 1.18);
    g.font = `800 ${size}px ${FONT.serif}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    try { g.letterSpacing = '3px'; } catch (e) {}
    g.shadowColor = 'rgba(0,0,0,0.85)';
    g.shadowBlur = 24;
    g.fillStyle = PAL.ivory;
    g.fillText(ln.toUpperCase(), 0, ly);
  });

  const bottomY = (lines.length - 1) * (size * 1.18) + 56;
  flareStreak(g, 0, bottomY, 640, { color: accent, alpha: 0.75 });

  if (sub) {
    g.shadowBlur = 0;
    g.font = `600 21px ${FONT.sans}`;
    g.fillStyle = PAL.dim;
    try { g.letterSpacing = '2px'; } catch (e) {}
    g.fillText(sub.toUpperCase(), 0, bottomY + 42, 880);
  }
  g.restore();
}

export function heroClock(g, x, y, bigStr, { labelTop = 'TIMESTAMP', labelBot = '', theme = 'ember', size = 148 } = {}) {
  const topCol = theme === 'ice' ? '#ffffff' : '#fff3d1';
  const midCol = theme === 'ice' ? PAL.ice : PAL.gold;
  const botCol = theme === 'ice' ? '#2c76b8' : theme === 'crimson' ? PAL.crimson : PAL.ember;

  g.save();
  // Frame box
  g.fillStyle = 'rgba(10,12,18,0.82)';
  AM.lib.roundRect(g, x - 430, y - 155, 860, 310, 20);
  g.fill();
  g.strokeStyle = midCol;
  g.lineWidth = 2;
  AM.lib.roundRect(g, x - 430, y - 155, 860, 310, 20);
  g.stroke();

  if (labelTop) {
    g.font = `700 21px ${FONT.mono}`;
    g.fillStyle = midCol;
    g.textAlign = 'center';
    try { g.letterSpacing = '3px'; } catch (e) {}
    g.fillText(labelTop.toUpperCase(), x, y - 108, 800);
  }

  // Fire-gold or ice-silver vertical gradient text
  g.font = `900 ${size}px ${FONT.cond}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  try { g.letterSpacing = '4px'; } catch (e) {}
  const gr = g.createLinearGradient(x, y - size * 0.45, x, y + size * 0.45);
  gr.addColorStop(0, topCol);
  gr.addColorStop(0.52, midCol);
  gr.addColorStop(1, botCol);
  g.shadowColor = botCol;
  g.shadowBlur = 32;
  g.fillStyle = gr;
  g.fillText(bigStr, x, y + 4, 800);
  g.shadowBlur = 0;

  if (labelBot) {
    g.font = `600 22px ${FONT.sans}`;
    g.fillStyle = PAL.ivory;
    try { g.letterSpacing = '2px'; } catch (e) {}
    g.fillText(labelBot.toUpperCase(), x, y + 112, 800);
  }
  g.restore();
}

export function telegramCard(g, x, y, w, h, {
  header = 'MARCONI WIRELESS TELEGRAM',
  stamp = 'URGENT // ICE WARNING',
  lines = [],
  footer = '',
  theme = 'ember',
} = {}) {
  const accent = theme === 'ice' ? PAL.ice : theme === 'crimson' ? PAL.crimson : PAL.gold;
  g.save();
  g.fillStyle = 'rgba(14,16,22,0.92)';
  AM.lib.roundRect(g, x, y, w, h, 18);
  g.fill();
  g.strokeStyle = 'rgba(247,242,231,0.28)';
  g.lineWidth = 2;
  AM.lib.roundRect(g, x, y, w, h, 18);
  g.stroke();

  // Header bar
  g.fillStyle = 'rgba(255,255,255,0.06)';
  g.fillRect(x + 16, y + 16, w - 32, 56);
  g.font = `700 21px ${FONT.mono}`;
  g.fillStyle = PAL.ivory;
  g.textAlign = 'left';
  g.fillText(header, x + 36, y + 51);

  if (stamp) {
    g.fillStyle = accent;
    g.textAlign = 'right';
    g.fillText(stamp, x + w - 36, y + 51);
  }

  // Body lines
  g.textAlign = 'left';
  lines.forEach((ln, i) => {
    const isHi = ln.startsWith('*');
    const clean = isHi ? ln.slice(1) : ln;
    g.font = `${isHi ? 700 : 500} 24px ${FONT.mono}`;
    g.fillStyle = isHi ? accent : PAL.ivory;
    g.fillText(clean, x + 36, y + 125 + i * 52, w - 72);
  });

  if (footer) {
    g.font = `600 20px ${FONT.sans}`;
    g.fillStyle = PAL.dim;
    g.textAlign = 'center';
    g.fillText(footer.toUpperCase(), x + w / 2, y + h - 32, w - 72);
  }
  g.restore();
}

export function silhouetteScene(g, x, y, w, h, type, t) {
  g.save();
  g.beginPath();
  AM.lib.roundRect(g, x, y, w, h, 20);
  g.clip();

  // Backlit dramatic sky
  const bgGr = g.createLinearGradient(x, y, x, y + h);
  if (type === 'ship-iceberg') {
    bgGr.addColorStop(0, '#091322');
    bgGr.addColorStop(0.58, '#162c46');
    bgGr.addColorStop(0.6, '#06101c');
    bgGr.addColorStop(1, '#03070d');
  } else if (type === 'tambora') {
    bgGr.addColorStop(0, '#1a0806');
    bgGr.addColorStop(0.55, '#4a160c');
    bgGr.addColorStop(1, '#090404');
  } else {
    bgGr.addColorStop(0, '#050914');
    bgGr.addColorStop(0.6, '#122238');
    bgGr.addColorStop(1, '#04060c');
  }
  g.fillStyle = bgGr;
  g.fillRect(x, y, w, h);

  const cy = y + h * 0.6;

  if (type === 'ship-iceberg') {
    // Iceberg silhouette (massive underwater + sharp peak above)
    g.fillStyle = 'rgba(120,204,255,0.22)';
    g.beginPath();
    g.moveTo(x + w * 0.62, cy);
    g.lineTo(x + w * 0.56, cy + h * 0.34);
    g.lineTo(x + w * 0.88, cy + h * 0.36);
    g.lineTo(x + w * 0.92, cy);
    g.closePath();
    g.fill();

    g.fillStyle = '#d9f0ff';
    g.beginPath();
    g.moveTo(x + w * 0.64, cy);
    g.lineTo(x + w * 0.71, cy - 135);
    g.lineTo(x + w * 0.78, cy - 85);
    g.lineTo(x + w * 0.84, cy - 155);
    g.lineTo(x + w * 0.9, cy);
    g.closePath();
    g.fill();

    // Ship silhouette + 4 funnels + lit portholes
    const sx = x + 90 + Math.sin(t * 0.8) * 8;
    g.fillStyle = '#05070c';
    g.beginPath();
    g.moveTo(sx, cy);
    g.lineTo(sx + 20, cy - 38);
    g.lineTo(sx + 360, cy - 38);
    g.lineTo(sx + 385, cy);
    g.closePath();
    g.fill();

    for (let f = 0; f < 4; f++) {
      g.fillStyle = '#080b12';
      g.fillRect(sx + 95 + f * 58, cy - 92, 24, 54);
      g.fillStyle = PAL.gold;
      g.fillRect(sx + 95 + f * 58, cy - 92, 24, 8);
    }

    // Lit portholes
    g.fillStyle = PAL.gold;
    for (let p = 0; p < 14; p++) {
      g.fillRect(sx + 45 + p * 22, cy - 22, 8, 5);
    }

    // Radio wave rings from ship mast
    for (let r = 0; r < 3; r++) {
      const rp = ((t * 0.9 + r * 0.33) % 1);
      g.strokeStyle = `rgba(255,196,92,${(1 - rp) * 0.7})`;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(sx + 70, cy - 105, 16 + rp * 95, 0, Math.PI * 2);
      g.stroke();
    }

    // Waterline
    g.strokeStyle = PAL.ice;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, cy);
    g.lineTo(x + w, cy);
    g.stroke();
  } else if (type === 'tambora') {
    // Plinian eruption column & ash umbrella
    const cx = x + w / 2;
    const ashGr = g.createRadialGradient(cx, y + 110, 20, cx, y + 110, 360);
    ashGr.addColorStop(0, 'rgba(255,110,45,0.65)');
    ashGr.addColorStop(0.5, 'rgba(60,25,20,0.85)');
    ashGr.addColorStop(1, 'rgba(10,6,6,0)');
    g.fillStyle = ashGr;
    g.beginPath();
    g.arc(cx, y + 120, 340, 0, Math.PI * 2);
    g.fill();

    // Volcano cone silhouette
    g.fillStyle = '#070404';
    g.beginPath();
    g.moveTo(x + 60, y + h);
    g.lineTo(cx - 95, cy - 20);
    g.lineTo(cx + 95, cy - 20);
    g.lineTo(x + w - 60, y + h);
    g.closePath();
    g.fill();

    // Lava glow at crater
    g.fillStyle = PAL.ember;
    g.shadowColor = PAL.ember;
    g.shadowBlur = 30;
    g.beginPath();
    g.ellipse(cx, cy - 20, 88, 16, 0, 0, Math.PI * 2);
    g.fill();
    g.shadowBlur = 0;
  } else {
    // Apollo 13 spacecraft & Earth-Moon trajectory arc
    const ex = x + 160;
    const ey = y + h * 0.55;
    const mx = x + w - 150;
    const my = y + h * 0.42;

    // Trajectory arc (free-return figure-8 loop)
    g.strokeStyle = 'rgba(120,204,255,0.45)';
    g.setLineDash([10, 8]);
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(ex, ey);
    g.quadraticCurveTo(x + w * 0.5, y + 60, mx, my);
    g.quadraticCurveTo(x + w * 0.55, y + h - 40, ex, ey);
    g.stroke();
    g.setLineDash([]);

    // Earth crescent
    g.fillStyle = PAL.ice;
    g.beginPath();
    g.arc(ex, ey, 58, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#060c18';
    g.beginPath();
    g.arc(ex + 18, ey - 8, 52, 0, Math.PI * 2);
    g.fill();

    // Moon sphere
    g.fillStyle = '#d8d2c5';
    g.beginPath();
    g.arc(mx, my, 36, 0, Math.PI * 2);
    g.fill();

    // Odyssey + Aquarius craft at midpoint with warning pulse
    const sx = x + w * 0.52;
    const sy = y + h * 0.44;
    const pulse = 0.5 + 0.5 * Math.sin(t * 10);
    g.fillStyle = `rgba(255,93,41,${0.35 + pulse * 0.45})`;
    g.beginPath();
    g.arc(sx, sy, 48, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = PAL.ivory;
    g.fillRect(sx - 28, sy - 12, 56, 24);
    g.strokeStyle = PAL.gold;
    g.lineWidth = 3;
    g.strokeRect(sx - 28, sy - 12, 56, 24);
  }

  g.strokeStyle = 'rgba(247,242,231,0.22)';
  g.lineWidth = 2;
  AM.lib.roundRect(g, x, y, w, h, 20);
  g.stroke();
  g.restore();
}
