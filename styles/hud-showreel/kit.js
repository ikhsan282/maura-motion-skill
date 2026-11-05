// HUD Showreel kit: tactical brackets, HP bar with ghost trail & shield, radial cooldown, charge bar, combo counter, level-up banner, XP bar, dossier card, radar scope.
const { clamp, lerp, ease } = AM.lib;

export const PAL = {
  bg: '#070b14',
  panel: 'rgba(13,20,36,0.88)',
  cyan: '#38e1ff',
  mag: '#ff4fd8',
  gold: '#ffd23f',
  green: '#52ffa8',
  red: '#ff5a5a',
  orange: '#ff8a3d',
  ink: '#eaf2ff',
  dim: '#8fa3c8',
};

export const RGB = {
  cyan: '56,225,255',
  mag: '255,79,216',
  gold: '255,210,63',
  green: '82,255,168',
  red: '255,90,90',
};

export const FONT = {
  disp: 'Orbitron, Inter, sans-serif',
  mono: 'JetBrains Mono, monospace',
  sans: 'Inter, sans-serif',
};

export function label(g, str, x, y, { size = 32, weight = 700, color = PAL.ink, align = 'center', font = FONT.disp, spacing = 2, alpha = 1, glow = null } = {}) {
  g.save();
  g.globalAlpha = alpha;
  g.font = `${weight} ${size}px ${font}`;
  g.textAlign = align;
  g.textBaseline = 'middle';
  try { g.letterSpacing = spacing + 'px'; } catch (e) {}
  if (glow) {
    g.shadowColor = glow;
    g.shadowBlur = 24;
  }
  g.fillStyle = color;
  g.fillText(str, x, y);
  g.restore();
}

export const micro = (g, s, x, y, o = {}) =>
  label(g, String(s).toUpperCase(), x, y, { size: 22, font: FONT.mono, color: PAL.dim, spacing: 3, ...o });

export function brackets(g, x, y, w, h, { size = 26, color = PAL.cyan, lineWidth = 3, alpha = 0.85 } = {}) {
  g.save();
  g.globalAlpha = alpha;
  g.strokeStyle = color;
  g.lineWidth = lineWidth;
  g.beginPath();
  // Top-left
  g.moveTo(x, y + size); g.lineTo(x, y); g.lineTo(x + size, y);
  // Top-right
  g.moveTo(x + w - size, y); g.lineTo(x + w, y); g.lineTo(x + w, y + size);
  // Bottom-left
  g.moveTo(x, y + h - size); g.lineTo(x, y + h); g.lineTo(x + size, y + h);
  // Bottom-right
  g.moveTo(x + w - size, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y + h - size);
  g.stroke();
  g.restore();
}

export function frame(g, t, { accent = PAL.cyan, beat = 'SYS.HUD' } = {}) {
  g.fillStyle = PAL.bg;
  g.fillRect(0, 0, 1080, 1920);

  // Subtle tactical grid
  g.strokeStyle = 'rgba(56,225,255,0.06)';
  g.lineWidth = 1;
  for (let x = 0; x <= 1080; x += 90) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1920); g.stroke();
  }
  for (let y = 0; y <= 1920; y += 90) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(1080, y); g.stroke();
  }

  // Crosshair ticks at center & thirds
  g.strokeStyle = 'rgba(56,225,255,0.16)';
  for (const cx of [180, 540, 900]) {
    for (const cy of [360, 960, 1560]) {
      g.beginPath();
      g.moveTo(cx - 8, cy); g.lineTo(cx + 8, cy);
      g.moveTo(cx, cy - 8); g.lineTo(cx, cy + 8);
      g.stroke();
    }
  }

  // Radial vignette
  const v = g.createRadialGradient(540, 960, 280, 540, 960, 1120);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.62)');
  g.fillStyle = v;
  g.fillRect(0, 0, 1080, 1920);

  // Scanlines
  g.fillStyle = 'rgba(0,0,0,0.12)';
  for (let y = (Math.floor(t * 24) % 4); y < 1920; y += 4) {
    g.fillRect(0, y, 1080, 1);
  }

  // Outer HUD viewport brackets
  brackets(g, 42, 42, 996, 1836, { size: 32, color: accent, lineWidth: 2, alpha: 0.45 });
}

export function panel(g, x, y, w, h, { r = 24, glow = null, stroke = 'rgba(56,225,255,0.35)', bracketColor = null } = {}) {
  g.save();
  if (glow) {
    g.shadowColor = glow;
    g.shadowBlur = 36;
  }
  g.fillStyle = PAL.panel;
  AM.lib.roundRect(g, x, y, w, h, r);
  g.fill();
  g.shadowBlur = 0;
  g.strokeStyle = stroke;
  g.lineWidth = 2;
  AM.lib.roundRect(g, x, y, w, h, r);
  g.stroke();
  if (bracketColor) {
    brackets(g, x - 6, y - 6, w + 12, h + 12, { size: 22, color: bracketColor, lineWidth: 3, alpha: 0.9 });
  }
  g.restore();
}

export function cornerHud(g, t, { left = 'HUD.SYS v3.2', beat = null, accent = PAL.cyan } = {}) {
  const cleanLeft = beat ? String(left).split('//')[0].trim() : left;
  micro(g, cleanLeft, 72, 82, { size: 20, align: 'left', color: accent });
  if (beat) {
    panel(g, 420, 54, 240, 48, { r: 12, stroke: accent });
    micro(g, beat, 540, 78, { size: 20, color: PAL.ink });
  }
  const sec = Math.floor(t);
  const fr = Math.floor((t % 1) * 24);
  micro(g, `TC 00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, 1008, 82, { size: 20, align: 'right', color: PAL.dim });
}

export function headlineHud(g, title, sub, { y = 210, accent = PAL.cyan, tag = 'TELEMETRY' } = {}) {
  panel(g, 80, y - 75, 920, 155, { r: 20, stroke: accent, bracketColor: accent });
  micro(g, tag, 540, y - 42, { size: 19, color: accent, spacing: 4 });
  label(g, title, 540, y + 4, { size: 42, color: PAL.ink, glow: accent });
  if (sub) {
    micro(g, sub, 540, y + 48, { size: 21, color: PAL.dim, spacing: 2 });
  }
}

export function hpBarHud(g, x, y, w, h, hp, ghostHp = hp, shieldHp = 0, { maxHp = 100, tag = 'VITALS · HEALTH POINT' } = {}) {
  const f = clamp(hp / maxHp, 0, 1);
  const gf = clamp(ghostHp / maxHp, 0, 1);
  const sf = clamp(shieldHp / maxHp, 0, 1);
  const col = hp > 60 ? PAL.green : hp > 25 ? PAL.gold : PAL.red;

  g.save();
  panel(g, x - w / 2, y - h / 2, w, h, { r: 20, glow: col, stroke: col, bracketColor: col });
  micro(g, tag, x - w / 2 + 24, y - h / 2 - 28, { size: 20, align: 'left', color: PAL.dim });
  micro(g, hp <= 0 ? 'STATUS: K.O.' : hp <= 25 ? 'STATUS: CRITICAL!' : 'STATUS: ACTIVE', x + w / 2 - 24, y - h / 2 - 28, {
    size: 20,
    align: 'right',
    color: col,
  });

  const bx = x - w / 2 + 14;
  const by = y - h / 2 + 14;
  const bw = w - 28;
  const bh = h - 28;

  // Inner track
  g.fillStyle = 'rgba(5,8,16,0.95)';
  AM.lib.roundRect(g, bx, by, bw, bh, 12);
  g.fill();

  // Ghost bar (delayed damage indicator)
  if (gf > f) {
    g.fillStyle = 'rgba(255,90,90,0.48)';
    AM.lib.roundRect(g, bx, by, bw * gf, bh, 12);
    g.fill();
  }

  // Main HP fill
  if (f > 0) {
    const gr = g.createLinearGradient(bx, by, bx + bw, by);
    gr.addColorStop(0, col);
    gr.addColorStop(1, '#ffffff');
    g.fillStyle = gr;
    AM.lib.roundRect(g, bx, by, Math.max(8, bw * f), bh, 12);
    g.fill();
  }

  // Shield overlay bar (cyan top strip)
  if (sf > 0) {
    g.fillStyle = PAL.cyan;
    g.shadowColor = PAL.cyan;
    g.shadowBlur = 18;
    AM.lib.roundRect(g, bx, by + bh - 18, bw * sf, 14, 6);
    g.fill();
    g.shadowBlur = 0;
  }

  // 10% segment ticks
  g.strokeStyle = 'rgba(7,11,20,0.55)';
  g.lineWidth = 2;
  for (let i = 1; i < 10; i++) {
    const tx = bx + (bw * i) / 10;
    g.beginPath();
    g.moveTo(tx, by);
    g.lineTo(tx, by + bh);
    g.stroke();
  }

  // Numeric readout
  label(g, `${Math.round(hp)} / ${maxHp}`, x, y, {
    size: 46,
    color: '#070b14',
    font: FONT.mono,
    weight: 800,
  });
  label(g, `${Math.round(hp)} / ${maxHp}`, x - 2, y - 2, {
    size: 46,
    color: '#ffffff',
    font: FONT.mono,
    weight: 800,
  });

  g.restore();
}

export function cooldown(g, x, y, r, p, { secs = null, readyColor = PAL.gold, title = 'READY' } = {}) {
  g.save();
  g.fillStyle = 'rgba(10,16,30,0.92)';
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(56,225,255,0.22)';
  g.lineWidth = 10;
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();

  // Outer degree ticks
  g.strokeStyle = 'rgba(56,225,255,0.35)';
  g.lineWidth = 2;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g.beginPath();
    g.moveTo(x + Math.cos(a) * (r + 14), y + Math.sin(a) * (r + 14));
    g.lineTo(x + Math.cos(a) * (r + 24), y + Math.sin(a) * (r + 24));
    g.stroke();
  }

  const ready = p >= 1;
  g.strokeStyle = ready ? readyColor : PAL.cyan;
  g.lineWidth = 14;
  g.lineCap = 'round';
  if (ready) {
    g.shadowColor = readyColor;
    g.shadowBlur = 30;
  }
  g.beginPath();
  g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(p));
  g.stroke();
  g.shadowBlur = 0;

  if (ready) {
    label(g, title, x, y, { size: 44, color: readyColor });
  } else if (secs !== null) {
    label(g, secs.toFixed(1) + 's', x, y, { size: 74, color: PAL.ink, font: FONT.mono });
  }
  g.restore();
}

export function chargeBar(g, x, y, w, h, p, { color = PAL.mag, tag = '' } = {}) {
  g.save();
  g.fillStyle = 'rgba(10,16,30,0.92)';
  AM.lib.roundRect(g, x, y, w, h, h / 2);
  g.fill();
  const f = clamp(p);
  if (f > 0) {
    const gr = g.createLinearGradient(x, 0, x + w, 0);
    gr.addColorStop(0, color);
    gr.addColorStop(1, '#ffffff');
    g.fillStyle = gr;
    g.shadowColor = color;
    g.shadowBlur = f >= 1 ? 36 : 16;
    AM.lib.roundRect(g, x + 6, y + 6, Math.max(4, (w - 12) * f), h - 12, (h - 12) / 2);
    g.fill();
  }
  g.shadowBlur = 0;
  g.strokeStyle = 'rgba(255,255,255,0.25)';
  g.lineWidth = 2;
  AM.lib.roundRect(g, x, y, w, h, h / 2);
  g.stroke();
  if (tag) micro(g, tag, x + w / 2, y - 28, { size: 22, color: color });
  label(g, Math.round(f * 100) + '%', x + w / 2, y + h / 2, { size: 32, color: '#fff', font: FONT.mono });
  g.restore();
}

export function combo(g, x, y, n, pop) {
  g.save();
  g.translate(x, y);
  const s = 1 + 0.25 * pop;
  g.scale(s, s);
  label(g, 'x' + n, 0, 0, { size: 140, color: n >= 3 ? PAL.gold : PAL.ink });
  if (n >= 3) {
    g.shadowColor = PAL.gold;
    g.shadowBlur = 40;
    label(g, 'x' + n, 0, 0, { size: 140, color: PAL.gold });
    g.shadowBlur = 0;
  }
  micro(g, 'CHAIN COMBO MULTIPLIER', 0, 92, { size: 24, color: n >= 3 ? PAL.gold : PAL.dim });
  g.restore();
}

export function levelUp(g, x, y, p, lvl, { sub = 'SKILL COOLDOWN −50%' } = {}) {
  g.save();
  g.globalAlpha = clamp(p * 1.5);
  const s = ease.outBack(clamp(p / 0.4), 1.5);
  g.translate(x, y);
  g.scale(Math.max(0.01, s), Math.max(0.01, s));
  panel(g, -380, -95, 760, 190, { r: 28, glow: PAL.gold, stroke: PAL.gold, bracketColor: PAL.gold });
  label(g, 'LEVEL ' + lvl, 0, -22, { size: 68, color: PAL.gold });
  micro(g, sub, 0, 48, { size: 24, color: PAL.ink });
  g.restore();
}

export function xpBar(g, x, y, w, p) {
  g.save();
  g.fillStyle = 'rgba(255,255,255,0.10)';
  AM.lib.roundRect(g, x, y, w, 16, 8);
  g.fill();
  g.fillStyle = PAL.green;
  g.shadowColor = PAL.green;
  g.shadowBlur = 12;
  AM.lib.roundRect(g, x, y, w * clamp(p), 16, 8);
  g.fill();
  g.restore();
}

export function dossierCard(g, x, y, w, h, {
  beat = 'FILE 01/07',
  num = '01',
  day = 'MINGGU / AHAD',
  root = 'AL-AHAD · DOMINGO',
  meaning = 'HARI PERTAMA (ANGKA SATU)',
  accent = PAL.cyan,
  pop = 1,
} = {}) {
  g.save();
  const s = lerp(0.92, 1.0, clamp(pop));
  g.translate(x + w / 2, y + h / 2);
  g.scale(s, s);
  g.translate(-(x + w / 2), -(y + h / 2));

  panel(g, x, y, w, h, { r: 24, glow: accent, stroke: accent, bracketColor: accent });

  // Header strip
  g.fillStyle = 'rgba(255,255,255,0.05)';
  g.fillRect(x + 16, y + 16, w - 32, 54);
  micro(g, beat, x + 36, y + 43, { size: 20, align: 'left', color: accent });
  micro(g, 'ETYMOLOGY.DB // VERIFIED', x + w - 36, y + 43, { size: 18, align: 'right', color: PAL.dim });

  // Giant numeral on left
  panel(g, x + 36, y + 96, 220, h - 132, { r: 18, stroke: accent });
  label(g, String(num), x + 146, y + 96 + (h - 132) / 2 - 12, { size: 112, color: accent, font: FONT.mono, glow: accent });
  micro(g, 'INDEX', x + 146, y + h - 62, { size: 18, color: PAL.dim });

  // Right content
  label(g, day, x + 290, y + 145, { size: 54, align: 'left', color: PAL.ink });
  micro(g, 'AKAR KATA: ' + root, x + 290, y + 210, { size: 24, align: 'left', color: PAL.gold });
  label(g, meaning, x + 290, y + 275, { size: 30, align: 'left', color: PAL.cyan, font: FONT.sans });

  g.restore();
}
