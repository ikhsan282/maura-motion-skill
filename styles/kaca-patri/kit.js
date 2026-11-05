// Kaca Patri Mosaik (kaca-patri) kit:
// Gothic lancet arches, rose windows, jewel-toned glass tiles (ruby, cobalt, emerald, amber gold, amethyst),
// thick black lead cames (#0d0f14), volumetric colored sunbeams, and floating dust motes.
const { clamp, lerp, ease, TAU } = AM.lib;

export const PAL = {
  bg: '#0b0c12',
  stone: '#171922',
  lead: '#090a0f',
  leadHi: '#2a2e3d',
  ruby: '#e0243c',
  cobalt: '#1e5ce6',
  emerald: '#18a866',
  gold: '#f7bc30',
  amber: '#eb7a24',
  violet: '#883de0',
  cyan: '#25bfd4',
  ivory: '#faf4e6',
  dim: '#b8b0a0',
};

export const FONT = {
  serif: 'Cinzel, Playfair Display, Georgia, serif',
  sans: 'Inter, sans-serif',
  mono: 'JetBrains Mono, monospace',
};

export function glassTile(g, pts, col, { leadW = 6, alpha = 1, glow = false } = {}) {
  if (!pts || pts.length < 3) return;
  g.save();
  g.globalAlpha = alpha;

  // Compute bounding box for inner jewel gradient
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [px, py] of pts) {
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const r = Math.max(12, Math.hypot(maxX - minX, maxY - minY) * 0.55);

  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();

  const gr = g.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.05, cx, cy, r);
  gr.addColorStop(0, col);
  gr.addColorStop(0.78, col);
  gr.addColorStop(1, '#0d0f18');

  if (glow) {
    g.shadowColor = col;
    g.shadowBlur = 22;
  }
  g.fillStyle = gr;
  g.fill();
  g.shadowBlur = 0;

  // Lead came border
  g.strokeStyle = PAL.lead;
  g.lineWidth = leadW;
  g.lineJoin = 'round';
  g.stroke();

  // Subtle metallic highlight on lead came
  g.strokeStyle = 'rgba(255,255,255,0.14)';
  g.lineWidth = 1.2;
  g.stroke();
  g.restore();
}

export function cathedralStage(g, t, { rayColors = [PAL.ruby, PAL.gold, PAL.cobalt] } = {}) {
  g.fillStyle = PAL.bg;
  g.fillRect(0, 0, 1080, 1920);

  // Subtle stone masonry lines in background
  g.strokeStyle = 'rgba(255,255,255,0.035)';
  g.lineWidth = 2;
  for (let y = 0; y < 1920; y += 120) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(1080, y); g.stroke();
    const offset = (y / 120) % 2 === 0 ? 0 : 90;
    for (let x = offset; x < 1080; x += 180) {
      g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 120); g.stroke();
    }
  }

  // Volumetric colored sunbeams projecting diagonally from window
  const beams = [
    { x0: 260, x1: 420, col: rayColors[0] || PAL.ruby },
    { x0: 460, x1: 640, col: rayColors[1] || PAL.gold },
    { x0: 660, x1: 840, col: rayColors[2] || PAL.cobalt },
  ];
  beams.forEach((b, i) => {
    const sway = Math.sin(t * 0.5 + i) * 25;
    g.save();
    g.globalCompositeOperation = 'screen';
    g.globalAlpha = 0.16;
    g.beginPath();
    g.moveTo(b.x0, 260);
    g.lineTo(b.x1, 260);
    g.lineTo(b.x1 + 220 + sway, 1920);
    g.lineTo(b.x0 - 120 + sway, 1920);
    g.closePath();
    const gr = g.createLinearGradient(540, 260, 540, 1850);
    gr.addColorStop(0, b.col);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fill();
    g.restore();
  });

  // Floating dust motes in sunbeams
  g.save();
  for (let i = 0; i < 40; i++) {
    const s = i * 29.3;
    const px = ((s * 23.1 + t * (10 + (i % 4) * 3)) % 920) + 80;
    const py = ((s * 41.7 - t * (18 + (i % 5) * 4)) % 1600 + 1600) % 1600 + 160;
    const a = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + i));
    g.fillStyle = i % 2 === 0 ? `rgba(247,188,48,${a})` : `rgba(250,244,230,${a * 0.8})`;
    g.beginPath();
    g.arc(px, py, 2 + (i % 3), 0, TAU);
    g.fill();
  }
  g.restore();

  // Outer Gothic stained-glass border frame
  const borderColors = [PAL.ruby, PAL.gold, PAL.cobalt, PAL.emerald];
  for (let i = 0; i < 18; i++) {
    const y0 = 40 + i * 102;
    const y1 = Math.min(1880, y0 + 102);
    const col = borderColors[i % borderColors.length];
    glassTile(g, [[22, y0], [48, y0], [48, y1], [22, y1]], col, { leadW: 4, alpha: 0.75 });
    glassTile(g, [[1032, y0], [1058, y0], [1058, y1], [1032, y1]], col, { leadW: 4, alpha: 0.75 });
  }
}

export function stainedBanner(g, x, y, w, h, { tag = 'KACA PATRI MOSAIK', title = '', sub = '', accent = PAL.gold } = {}) {
  g.save();
  // Dark glass backing with lead border
  g.fillStyle = 'rgba(14,16,24,0.94)';
  AM.lib.roundRect(g, x, y, w, h, 18);
  g.fill();
  g.strokeStyle = PAL.lead;
  g.lineWidth = 8;
  AM.lib.roundRect(g, x, y, w, h, 18);
  g.stroke();
  g.strokeStyle = accent;
  g.lineWidth = 2.5;
  AM.lib.roundRect(g, x + 6, y + 6, w - 12, h - 12, 14);
  g.stroke();

  // Corner stained-glass diamond jewels
  const corners = [[x + 28, y + 28, PAL.ruby], [x + w - 28, y + 28, PAL.cobalt], [x + 28, y + h - 28, PAL.emerald], [x + w - 28, y + h - 28, PAL.gold]];
  for (const [cx, cy, c] of corners) {
    glassTile(g, [[cx, cy - 14], [cx + 14, cy], [cx, cy + 14], [cx - 14, cy]], c, { leadW: 3 });
  }

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 20px ${FONT.mono}`;
  g.fillStyle = accent;
  try { g.letterSpacing = '4px'; } catch (e) {}
  g.fillText(tag.toUpperCase(), x + w / 2, y + 42, w - 90);

  g.font = `800 38px ${FONT.serif}`;
  g.fillStyle = PAL.ivory;
  try { g.letterSpacing = '2px'; } catch (e) {}
  g.fillText(title.toUpperCase(), x + w / 2, y + 94, w - 90);

  if (sub) {
    g.font = `600 21px ${FONT.sans}`;
    g.fillStyle = PAL.dim;
    try { g.letterSpacing = '2px'; } catch (e) {}
    g.fillText(sub.toUpperCase(), x + w / 2, y + 140, w - 90);
  }
  g.restore();
}

export function roseWindow(g, cx, cy, r, t, { petals = 12, reveal = 1, rotSpeed = 0.08 } = {}) {
  g.save();
  const rot = t * rotSpeed;

  // Outer stone ring
  g.beginPath();
  g.arc(cx, cy, r + 16, 0, TAU);
  g.fillStyle = PAL.lead;
  g.fill();
  g.strokeStyle = PAL.gold;
  g.lineWidth = 3;
  g.stroke();

  const ringCols = [PAL.cobalt, PAL.ruby, PAL.emerald, PAL.gold, PAL.violet, PAL.cyan];

  // Outer ring of lancet/quatrefoil tiles
  for (let i = 0; i < petals; i++) {
    const idxP = clamp((reveal * petals - i * 0.5) / Math.max(1, petals * 0.5));
    if (idxP <= 0) continue;
    const a0 = rot + (i / petals) * TAU;
    const a1 = rot + ((i + 1) / petals) * TAU;
    const am = (a0 + a1) / 2;

    const r1 = r * 0.56;
    const r2 = r * 0.96;
    const pts = [
      [cx + Math.cos(a0) * r1, cy + Math.sin(a0) * r1],
      [cx + Math.cos(a0) * (r2 * 0.88), cy + Math.sin(a0) * (r2 * 0.88)],
      [cx + Math.cos(am) * r2, cy + Math.sin(am) * r2],
      [cx + Math.cos(a1) * (r2 * 0.88), cy + Math.sin(a1) * (r2 * 0.88)],
      [cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1],
    ];
    glassTile(g, pts, ringCols[i % ringCols.length], { leadW: 6, alpha: idxP, glow: true });
  }

  // Middle ring petals
  for (let i = 0; i < petals; i++) {
    const idxP = clamp((reveal * 1.2 - i / petals));
    if (idxP <= 0) continue;
    const a0 = -rot * 0.7 + (i / petals) * TAU;
    const a1 = -rot * 0.7 + ((i + 1) / petals) * TAU;
    const am = (a0 + a1) / 2;
    const r0 = r * 0.24;
    const r1 = r * 0.56;
    const pts = [
      [cx + Math.cos(am) * r0, cy + Math.sin(am) * r0],
      [cx + Math.cos(a0) * r1, cy + Math.sin(a0) * r1],
      [cx + Math.cos(am) * (r1 * 1.04), cy + Math.sin(am) * (r1 * 1.04)],
      [cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1],
    ];
    glassTile(g, pts, ringCols[(i + 2) % ringCols.length], { leadW: 6, alpha: idxP, glow: true });
  }

  // Central golden sun medallion
  const starPts = [];
  for (let i = 0; i < 8; i++) {
    const a = rot + (i / 8) * TAU;
    starPts.push([cx + Math.cos(a) * (r * 0.25), cy + Math.sin(a) * (r * 0.25)]);
  }
  glassTile(g, starPts, PAL.gold, { leadW: 6, glow: true });
  g.restore();
}

export function lancetWindow(g, x, y, w, h, t, { mode = 'story', reveal = 1 } = {}) {
  g.save();
  const cx = x + w / 2;
  const archY = y + w * 0.42;

  // Pointed Gothic arch clip path
  g.beginPath();
  g.moveTo(x, y + h);
  g.lineTo(x, archY);
  g.quadraticCurveTo(x, y + 30, cx, y);
  g.quadraticCurveTo(x + w, y + 30, x + w, archY);
  g.lineTo(x + w, y + h);
  g.closePath();

  g.fillStyle = PAL.lead;
  g.fill();
  g.clip();

  // Background stained-glass mosaic grid inside the arch
  const cols = 6;
  const rows = 8;
  const cw = w / cols;
  const ch = h / rows;
  const pal = [PAL.cobalt, PAL.ruby, PAL.Cobalt || PAL.cobalt, PAL.violet, PAL.emerald, PAL.gold];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const a = clamp((reveal * (rows * cols) - idx * 0.6) / 6);
      if (a <= 0) continue;
      const gx = x + c * cw;
      const gy = y + r * ch;
      const col = (r + c) % 3 === 0 ? PAL.cobalt : (r + c) % 3 === 1 ? PAL.violet : '#163b8c';
      glassTile(g, [[gx, gy], [gx + cw, gy], [gx + cw, gy + ch], [gx, gy + ch]], col, { leadW: 5, alpha: a * 0.85 });
    }
  }

  // Central Rose Medallion at top of lancet
  roseWindow(g, cx, y + 145, 92, t, { petals: 8, reveal });

  if (mode === 'story') {
    // Illuminated Halo & Book/Scroll figure in center of window
    const fy = y + h * 0.62;
    // Golden halo
    glassTile(
      g,
      [
        [cx - 85, fy - 110], [cx, fy - 165], [cx + 85, fy - 110],
        [cx + 65, fy - 20], [cx - 65, fy - 20],
      ],
      PAL.gold,
      { leadW: 7, glow: true }
    );
    // Ruby robe
    glassTile(
      g,
      [
        [cx - 120, fy + 160], [cx - 75, fy - 20], [cx + 75, fy - 20], [cx + 120, fy + 160],
      ],
      PAL.ruby,
      { leadW: 7, glow: true }
    );
    // Open illuminated scroll/book held in front
    glassTile(
      g,
      [[cx - 95, fy + 10], [cx, fy + 25], [cx, fy + 105], [cx - 95, fy + 90]],
      PAL.ivory,
      { leadW: 6 }
    );
    glassTile(
      g,
      [[cx, fy + 25], [cx + 95, fy + 10], [cx + 95, fy + 90], [cx, fy + 105]],
      PAL.gold,
      { leadW: 6 }
    );
  } else if (mode === 'alchemy') {
    // 4 Jewel Oxide Crucibles (Gold->Ruby, Cobalt->Blue, Copper->Emerald, Silver->Amber)
    const quads = [
      { bx: x + 45, by: y + 280, col: PAL.ruby, ox: 'EMAS (Au)', name: 'MERAH RUBI' },
      { bx: x + w / 2 + 15, by: y + 280, col: PAL.cobalt, ox: 'KOBALT (Co)', name: 'BIRU SAFIR' },
      { bx: x + 45, by: y + 450, col: PAL.emerald, ox: 'TEMBAGA (Cu)', name: 'HIJAU ZAMRUD' },
      { bx: x + w / 2 + 15, by: y + 450, col: PAL.gold, ox: 'PERAK (Ag)', name: 'KUNING EMAS' },
    ];
    for (const q of quads) {
      const qw = w / 2 - 60;
      const qh = 140;
      glassTile(
        g,
        [[q.bx, q.by], [q.bx + qw, q.by], [q.bx + qw, q.by + qh], [q.bx, q.by + qh]],
        q.col,
        { leadW: 7, glow: true }
      );
      g.font = `800 24px ${FONT.serif}`;
      g.fillStyle = '#ffffff';
      g.textAlign = 'center';
      g.fillText(q.name, q.bx + qw / 2, q.by + 54, qw - 16);
      g.font = `700 18px ${FONT.mono}`;
      g.fillStyle = PAL.ivory;
      g.fillText(q.ox, q.bx + qw / 2, q.by + 96, qw - 16);
    }
  }

  g.restore();

  // Outer thick lead & stone arch frame
  g.save();
  g.beginPath();
  g.moveTo(x, y + h);
  g.lineTo(x, archY);
  g.quadraticCurveTo(x, y + 30, cx, y);
  g.quadraticCurveTo(x + w, y + 30, x + w, archY);
  g.lineTo(x + w, y + h);
  g.closePath();
  g.strokeStyle = PAL.lead;
  g.lineWidth = 14;
  g.stroke();
  g.strokeStyle = PAL.gold;
  g.lineWidth = 3;
  g.stroke();
  g.restore();
}

export function mosaicInfoCard(g, x, y, w, h, {
  header = 'ARSIP KATEDRAL',
  badge = 'ABAD KE-12',
  lines = [],
  footer = '',
  accent = PAL.gold,
} = {}) {
  g.save();
  g.fillStyle = 'rgba(13,15,22,0.94)';
  AM.lib.roundRect(g, x, y, w, h, 18);
  g.fill();
  g.strokeStyle = PAL.lead;
  g.lineWidth = 8;
  AM.lib.roundRect(g, x, y, w, h, 18);
  g.stroke();
  g.strokeStyle = accent;
  g.lineWidth = 2.5;
  AM.lib.roundRect(g, x + 5, y + 5, w - 10, h - 10, 14);
  g.stroke();

  // Header strip
  g.fillStyle = 'rgba(255,255,255,0.06)';
  g.fillRect(x + 18, y + 18, w - 36, 54);
  g.font = `700 21px ${FONT.mono}`;
  g.fillStyle = PAL.ivory;
  g.textAlign = 'left';
  g.fillText(header, x + 36, y + 52);

  if (badge) {
    g.fillStyle = accent;
    g.textAlign = 'right';
    g.fillText(badge, x + w - 36, y + 52);
  }

  // Bullet rows with stained-glass diamond pips
  const pipCols = [PAL.ruby, PAL.gold, PAL.cobalt, PAL.emerald];
  g.textAlign = 'left';
  lines.forEach((ln, i) => {
    const ry = y + 122 + i * 54;
    const isHi = ln.startsWith('*');
    const clean = isHi ? ln.slice(1) : ln;
    const pc = pipCols[i % pipCols.length];
    glassTile(g, [[x + 44, ry - 11], [x + 55, ry], [x + 44, ry + 11], [x + 33, ry]], pc, { leadW: 2.5 });

    g.font = `${isHi ? 700 : 500} 23px ${FONT.mono}`;
    g.fillStyle = isHi ? accent : PAL.ivory;
    g.fillText(clean, x + 72, ry + 7, w - 104);
  });

  if (footer) {
    g.font = `600 19px ${FONT.sans}`;
    g.fillStyle = PAL.dim;
    g.textAlign = 'center';
    g.fillText(footer.toUpperCase(), x + w / 2, y + h - 28, w - 72);
  }
  g.restore();
}
