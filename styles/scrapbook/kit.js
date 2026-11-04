// Maura Motion style kit: SCRAPBOOK COLLAGE (Expedition Journal, Stickers, Tape, Stamps & Polaroids).
import { clamp, lerp, ease, hrand, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  desk: '#BCA688',
  paper: '#F3E9D2',
  paperDark: '#E3D4B4',
  cream: '#FFFDF7',
  ink: '#2F241B',
  sepia: '#6E5239',
  red: '#C0392B',
  teal: '#1F7A6D',
  cobalt: '#28558A',
  gold: '#D9A441',
  green: '#3D7A47',
  tape: 'rgba(238, 226, 184, 0.78)',
  washiRed: 'rgba(192, 57, 43, 0.75)',
  washiTeal: 'rgba(31, 122, 109, 0.75)',
};

export const FONT = {
  mono: 'Special Elite',
  serif: 'Playfair Display',
  sans: 'Inter',
  bold: 'Archivo Black',
};

// Backwards-compatible legacy exports
export function bg(ctx, t, c1 = '#E8DCC0', c2 = PAL.paper) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  ctx.restore();
}
export function title(ctx, text, x, y, { size = 84, color = PAL.ink, p = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = color;
  ctx.font = `700 ${size}px '${FONT.serif}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y); ctx.restore();
}
export function label(ctx, text, x, y, { size = 44, color = PAL.ink, p = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = color;
  ctx.font = `700 ${size}px '${FONT.mono}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y); ctx.restore();
}
export function blob(ctx, x, y, r, color, t, { seed = 1 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  const n = 10, rnd = mulberry32(seed);
  const off = Array.from({ length: n }, () => 0.75 + rnd() * 0.5);
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU, rr = r * off[i % n] * (1 + 0.06 * Math.sin(t * 1.5 + i));
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.9;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
export function ring(ctx, x, y, r, color, w = 8) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore();
}
export function card(ctx, x, y, w, h, fill, { r = 28 } = {}) {
  ctx.save(); ctx.fillStyle = fill;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, r); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- Scrapbook Stage
/** Draws the open expedition journal spread with binding rings, grid lines, coffee stains & header label. */
export function stage(ctx, t, {
  journalTitle = 'JURNAL EKSPEDISI NUSANTARA',
  refCode = 'ARSIP NO. 1854-W',
  page = 'HAL. 01',
} = {}) {
  const W = 1080, H = 1920;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Wooden desk border
  ctx.fillStyle = PAL.desk;
  ctx.fillRect(0, 0, W, H);

  // Stacked under-pages for depth
  ctx.save();
  ctx.translate(540, 950); ctx.rotate(0.012);
  roundRect(ctx, -495, -865, 990, 1730, 18);
  ctx.fillStyle = '#DFCZA8'; ctx.fillStyle = PAL.paperDark; ctx.fill();
  ctx.restore();

  // Main journal page
  const px = 42, py = 78, pw = 996, ph = 1750;
  roundRect(ctx, px + 8, py + 10, pw, ph, 16);
  ctx.fillStyle = 'rgba(35, 22, 10, 0.25)'; ctx.fill();

  roundRect(ctx, px, py, pw, ph, 16);
  ctx.fillStyle = PAL.paper; ctx.fill();
  ctx.strokeStyle = 'rgba(80, 58, 36, 0.35)'; ctx.lineWidth = 3; ctx.stroke();

  // Cached grid & paper fiber + coffee ring stain
  const grid = cached('sb-page-tex-v1', () => {
    const c = makeCanvas(pw, ph), g = c.getContext('2d');
    g.strokeStyle = 'rgba(110, 82, 57, 0.08)';
    g.lineWidth = 1.5;
    for (let x = 48; x < pw; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, ph); g.stroke(); }
    for (let y = 48; y < ph; y += 48) { g.beginPath(); g.moveTo(0, y); g.lineTo(pw, y); g.stroke(); }
    // Margin red line
    g.strokeStyle = 'rgba(192, 57, 43, 0.22)';
    g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(76, 0); g.lineTo(76, ph); g.stroke();
    // Coffee stain ring bottom right
    g.strokeStyle = 'rgba(145, 98, 52, 0.11)';
    g.lineWidth = 12;
    g.beginPath(); g.arc(pw - 150, ph - 210, 95, 0.2, 5.8); g.stroke();
    g.lineWidth = 3;
    g.beginPath(); g.arc(pw - 146, ph - 212, 102, 0, TAU); g.stroke();
    return c;
  });
  ctx.drawImage(grid, px, py);

  // Spiral notebook binding holes on left edge
  for (let y = py + 70; y < py + ph - 50; y += 92) {
    ctx.fillStyle = PAL.desk;
    ctx.beginPath(); ctx.arc(px + 28, y, 13, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(60, 42, 24, 0.45)'; ctx.lineWidth = 2; ctx.stroke();
    // Metal ring clip
    ctx.strokeStyle = '#554A40'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(px - 10, y - 4); ctx.lineTo(px + 24, y - 4); ctx.stroke();
  }

  // Top Washi Tape & Journal Header Strip
  tape(ctx, 290, 128, 360, 46, -0.02, { color: PAL.washiTeal, text: refCode, textColor: PAL.cream });
  tape(ctx, 845, 128, 210, 46, 0.03, { color: PAL.washiRed, text: page, textColor: PAL.cream });

  ctx.fillStyle = PAL.ink;
  ctx.font = `700 36px '${FONT.serif}'`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(journalTitle, 134, 192, 860);

  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(134, 218); ctx.lineTo(985, 218); ctx.stroke();

  ctx.restore();
}

// ---------------------------------------------------------------- Collage Elements
/** Masking tape / washi tape strip with serrated torn left/right edges. */
export function tape(ctx, x, y, w, h = 42, rot = -0.04, {
  color = PAL.tape,
  text = '',
  textColor = PAL.ink,
  size = 22,
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  const hw = w / 2, hh = h / 2;
  ctx.moveTo(-hw, -hh);
  ctx.lineTo(hw, -hh);
  for (let ty = -hh; ty <= hh; ty += 7) ctx.lineTo(hw - (Math.abs(ty) % 2 ? 5 : 0), ty);
  ctx.lineTo(-hw, hh);
  for (let ty = hh; ty >= -hh; ty -= 7) ctx.lineTo(-hw + (Math.abs(ty) % 2 ? 5 : 0), ty);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 45, 25, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (text) {
    ctx.fillStyle = textColor;
    ctx.font = `700 ${size}px '${FONT.mono}'`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 2, w - 24);
  }
  ctx.restore();
}

/** Polaroid / Archival Photo Frame with white border, drop shadow, inner clip fn, caption & tape. */
export function photoCard(ctx, x, y, w, h, rot = 0, drawFn = null, {
  caption = '',
  sub = '',
  bgFill = '#E9DEC5',
  tapeColor = PAL.tape,
  p = 1,
} = {}) {
  if (p <= 0.01) return;
  const s = ease.outBack(clamp(p));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);

  const hw = w / 2, hh = h / 2;
  const botPad = caption ? 78 : 26;

  // Hard craft drop shadow
  roundRect(ctx, -hw + 8, -hh + 10, w, h, 10);
  ctx.fillStyle = 'rgba(35, 24, 14, 0.24)'; ctx.fill();

  // White photo paper frame
  roundRect(ctx, -hw, -hh, w, h, 10);
  ctx.fillStyle = PAL.cream; ctx.fill();
  ctx.strokeStyle = 'rgba(58, 46, 34, 0.35)'; ctx.lineWidth = 2.5; ctx.stroke();

  // Inner picture window
  const ix = -hw + 20, iy = -hh + 20, iw = w - 40, ih = h - 20 - botPad;
  ctx.save();
  roundRect(ctx, ix, iy, iw, ih, 6);
  ctx.clip();
  ctx.fillStyle = bgFill;
  ctx.fillRect(ix, iy, iw, ih);
  if (drawFn) drawFn(ctx, ix, iy, iw, ih);
  ctx.restore();

  roundRect(ctx, ix, iy, iw, ih, 6);
  ctx.strokeStyle = 'rgba(58, 46, 34, 0.28)'; ctx.lineWidth = 2; ctx.stroke();

  // Caption on bottom white border
  if (caption) {
    ctx.fillStyle = PAL.ink;
    ctx.font = `700 25px '${FONT.mono}'`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(caption, 0, hh - (sub ? 48 : 38), w - 36);
  }
  if (sub) {
    ctx.fillStyle = PAL.sepia;
    ctx.font = `600 19px '${FONT.sans}'`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sub, 0, hh - 20, w - 36);
  }

  // Masking tape on top
  tape(ctx, 0, -hh + 4, Math.min(200, w * 0.48), 36, -rot * 0.5 + 0.03, { color: tapeColor });

  ctx.restore();
}

/** Pinned or taped Field Note card with title & bullet lines. */
export function noteCard(ctx, x, y, w, h, rot = 0, {
  tag = 'CATATAN LAPANGAN',
  title = '',
  lines = [],
  fill = '#FFF8DC',
  accent = PAL.red,
  p = 1,
} = {}) {
  if (p <= 0.01) return;
  const s = ease.outBack(clamp(p));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);

  const hw = w / 2, hh = h / 2;
  roundRect(ctx, -hw + 7, -hh + 9, w, h, 12);
  ctx.fillStyle = 'rgba(35, 24, 14, 0.2)'; ctx.fill();

  roundRect(ctx, -hw, -hh, w, h, 12);
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.stroke();

  // Top accent bar
  ctx.fillStyle = accent;
  roundRect(ctx, -hw + 18, -hh + 18, w - 36, 38, 6);
  ctx.fill();
  ctx.fillStyle = PAL.cream;
  ctx.font = `700 20px '${FONT.mono}'`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(tag, -hw + 32, -hh + 38, w - 64);

  let cy = -hh + 88;
  if (title) {
    ctx.fillStyle = PAL.ink;
    ctx.font = `700 32px '${FONT.serif}'`;
    ctx.fillText(title, -hw + 26, cy, w - 52);
    cy += 48;
  }
  ctx.fillStyle = PAL.ink;
  ctx.font = `600 23px '${FONT.sans}'`;
  for (const ln of lines) {
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(-hw + 34, cy, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = PAL.ink;
    ctx.fillText(ln, -hw + 50, cy, w - 76);
    cy += 38;
  }

  // Red pushpin at top center
  ctx.fillStyle = PAL.red;
  ctx.beginPath(); ctx.arc(0, -hh + 8, 13, 0, TAU); ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = PAL.cream;
  ctx.beginPath(); ctx.arc(-3, -hh + 4, 4, 0, TAU); ctx.fill();

  ctx.restore();
}

/** Die-cut sticker with thick white border & shadow. */
export function sticker(ctx, x, y, r, rot = 0, drawFn = null, {
  label = '',
  fill = PAL.gold,
  p = 1,
} = {}) {
  if (p <= 0.01) return;
  const s = ease.outBack(clamp(p));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(s, s);

  // Shadow
  ctx.fillStyle = 'rgba(35, 24, 14, 0.25)';
  ctx.beginPath(); ctx.arc(5, 7, r + 14, 0, TAU); ctx.fill();

  // Thick white die-cut border
  ctx.fillStyle = PAL.cream;
  ctx.beginPath(); ctx.arc(0, 0, r + 14, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(58, 46, 34, 0.3)'; ctx.lineWidth = 2; ctx.stroke();

  // Inner circle
  ctx.fillStyle = fill;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3.5; ctx.stroke();

  if (drawFn) drawFn(ctx, r);

  if (label) {
    const lw = Math.max(120, label.length * 15 + 28);
    roundRect(ctx, -lw / 2, r - 12, lw, 38, 10);
    ctx.fillStyle = PAL.cream; ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = PAL.ink;
    ctx.font = `700 20px '${FONT.mono}'`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, r + 8, lw - 16);
  }
  ctx.restore();
}

/** Perforated Vintage Postage Stamp with postmark waves. */
export function postStamp(ctx, x, y, s = 1, rot = 0.08, {
  title = 'NED. INDIE',
  year = '1858',
  color = PAL.teal,
  p = 1,
} = {}) {
  if (p <= 0.01) return;
  const sc = ease.outBack(clamp(p)) * s;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);

  const w = 150, h = 180, hw = w / 2, hh = h / 2;
  ctx.fillStyle = PAL.cream;
  ctx.fillRect(-hw, -hh, w, h);
  ctx.strokeStyle = 'rgba(58, 46, 34, 0.35)'; ctx.lineWidth = 2; ctx.strokeRect(-hw, -hh, w, h);

  // Perforation dots around edge
  ctx.fillStyle = PAL.paper;
  for (let px = -hw + 12; px < hw; px += 18) {
    ctx.beginPath(); ctx.arc(px, -hh, 5, 0, TAU); ctx.arc(px, hh, 5, 0, TAU); ctx.fill();
  }
  for (let py = -hh + 12; py < hh; py += 18) {
    ctx.beginPath(); ctx.arc(-hw, py, 5, 0, TAU); ctx.arc(hw, py, 5, 0, TAU); ctx.fill();
  }

  ctx.fillStyle = color;
  ctx.fillRect(-hw + 14, -hh + 14, w - 28, h - 28);
  ctx.strokeStyle = PAL.cream; ctx.lineWidth = 2;
  ctx.strokeRect(-hw + 20, -hh + 20, w - 40, h - 40);

  ctx.fillStyle = PAL.cream;
  ctx.font = `700 18px '${FONT.mono}'`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(title, 0, -hh + 42, w - 44);
  ctx.font = `700 36px '${FONT.serif}'`;
  ctx.fillText(year, 0, 12);

  // Postmark cancellation circle & waves
  ctx.strokeStyle = 'rgba(35, 24, 14, 0.65)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(38, 42, 36, 0, TAU); ctx.stroke();
  for (let wy = 28; wy <= 56; wy += 14) {
    ctx.beginPath(); ctx.moveTo(-10, wy); ctx.quadraticCurveTo(20, wy - 8, 50, wy); ctx.quadraticCurveTo(80, wy + 8, 110, wy); ctx.stroke();
  }
  ctx.restore();
}

/** Slammed ink rubber stamp. */
export function rubberStamp(ctx, x, y, str, {
  color = PAL.red,
  rot = -0.1,
  size = 42,
  p = 1,
} = {}) {
  if (p <= 0.01) return;
  const sc = lerp(1.6, 1, ease.outCubic(clamp(p)));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sc, sc);
  ctx.globalAlpha = clamp(p * 2.5) * 0.88;
  ctx.font = `700 ${size}px '${FONT.bold}'`;
  const w = ctx.measureText(str).width + 44, h = size * 1.38;
  roundRect(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.stroke();
  roundRect(ctx, -w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 4);
  ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(str, 0, 2);
  ctx.restore();
}

/** Vintage map of the Indonesian Archipelago with optional glowing red Wallace Line. */
export function drawArchipelagoMap(ctx, x, y, w, h, {
  wallaceProg = 0,
  routeProg = 0,
  seaLevelDrop = 0,
} = {}) {
  ctx.save();
  ctx.translate(x, y);

  // Sea background with bathymetry tint
  ctx.fillStyle = seaLevelDrop > 0 ? '#B7D3C6' : '#C9DFEC';
  ctx.fillRect(0, 0, w, h);

  // Latitude / Longitude grid lines
  ctx.strokeStyle = 'rgba(47, 36, 27, 0.14)';
  ctx.lineWidth = 1.5;
  for (let gx = w * 0.15; gx < w; gx += w * 0.18) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
  for (let gy = h * 0.2; gy < h; gy += h * 0.22) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }

  // Sunda Shelf shallow ice-age land bridge (when seaLevelDrop > 0)
  if (seaLevelDrop > 0.02) {
    ctx.save();
    ctx.globalAlpha = clamp(seaLevelDrop, 0, 1) * 0.55;
    ctx.fillStyle = '#D9C79E';
    ctx.beginPath();
    ctx.ellipse(w * 0.3, h * 0.52, w * 0.25, h * 0.32, 0.15, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = PAL.sepia; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  // Stylized islands: [cx, cy, rx, ry, rot, name]
  const islands = [
    [0.16, 0.48, 0.11, 0.045, 0.55, 'SUMATRA'],
    [0.34, 0.36, 0.09, 0.11, -0.1, 'KALIMANTAN'],
    [0.29, 0.72, 0.10, 0.032, 0.08, 'JAWA'],
    [0.42, 0.74, 0.024, 0.022, 0, 'BALI'],
    [0.49, 0.74, 0.024, 0.022, 0, 'LOMBOK'],
    [0.54, 0.44, 0.055, 0.11, 0.2, 'SULAWESI'],
    [0.69, 0.46, 0.035, 0.055, -0.2, 'MALUKU'],
    [0.85, 0.54, 0.11, 0.075, 0.15, 'PAPUA'],
  ];

  for (const [ix, iy, rx, ry, rot, name] of islands) {
    ctx.save();
    ctx.translate(w * ix, h * iy);
    ctx.rotate(rot);
    ctx.fillStyle = '#8AB070';
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * rx, h * ry, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = PAL.ink;
    ctx.font = `700 15px '${FONT.mono}'`;
    ctx.textAlign = 'center';
    ctx.fillText(name, w * ix, h * (iy + ry + 0.06));
  }

  // Expedition dashed trail (Kalimantan -> Bali -> Lombok -> Sulawesi -> Maluku -> Papua)
  if (routeProg > 0.01) {
    const pts = [
      [w * 0.34, h * 0.36],
      [w * 0.42, h * 0.74],
      [w * 0.49, h * 0.74],
      [w * 0.54, h * 0.44],
      [w * 0.69, h * 0.46],
      [w * 0.85, h * 0.54],
    ];
    ctx.save();
    ctx.strokeStyle = PAL.cobalt;
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    const nSeg = (pts.length - 1) * clamp(routeProg);
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const f = clamp(nSeg - i);
      if (f <= 0) break;
      ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f));
    }
    ctx.stroke();
    ctx.restore();
  }

  // The Red Wallace Line between Kalimantan/Sulawesi and Bali/Lombok!
  if (wallaceProg > 0.01) {
    const p = clamp(wallaceProg);
    ctx.save();
    ctx.strokeStyle = PAL.red;
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const x0 = w * 0.48, y0 = h * 0.12;
    const x1 = w * 0.455, y1 = h * 0.90;
    ctx.moveTo(x0, y0);
    ctx.lineTo(lerp(x0, x1, p), lerp(y0, y1, p));
    ctx.stroke();

    if (p > 0.6) {
      roundRect(ctx, w * 0.455 - 92, h * 0.14, 184, 34, 8);
      ctx.fillStyle = PAL.red; ctx.fill();
      ctx.fillStyle = PAL.cream;
      ctx.font = `700 18px '${FONT.mono}'`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('GARIS WALLACE', w * 0.455, h * 0.14 + 17);
    }
    ctx.restore();
  }

  ctx.restore();
}
