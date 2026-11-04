// Maura Motion style kit: EDITORIAL SERIF (Magazine / Cultural Essay Typography & Fine-Line Plates)
const { clamp, lerp, ease, TAU } = AM.lib;

export const PAL = {
  paper: '#F6F1E7',
  paperDeep: '#EAE1D0',
  card: '#FBF8F2',
  ink: '#1A1715',
  inkMuted: '#6E655C',
  rule: 'rgba(26, 23, 21, 0.22)',
  terracotta: '#B84A32',
  indigo: '#26466D',
  ochre: '#C68E3F',
  sage: '#4F6852',
  highlight: 'rgba(243, 212, 128, 0.55)',
};

export const FONT = {
  serif: "'Instrument Serif', 'Playfair Display', Georgia, serif",
  sans: "'Inter', 'Plus Jakarta Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

/** Draw warm textured editorial magazine page with double hairline rules and running header. */
export function drawEditorialPage(ctx, t, { issue = 'JURNAL KRIYA & BUDAYA', rubric = 'ESAI VISUAL · EDISI XXXV', figNo = 1, totalFigs = 8 } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Warm paper gradient
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, PAL.paper);
  g.addColorStop(0.65, '#F3ECE0');
  g.addColorStop(1, PAL.paperDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1920);

  // Subtle horizontal paper fibers
  ctx.strokeStyle = 'rgba(110, 101, 92, 0.04)';
  ctx.lineWidth = 1;
  for (let y = 40; y < 1920; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1080, y);
    ctx.stroke();
  }

  // Outer editorial margin frame (double hairline at top)
  const M = 68;
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(M, 118);
  ctx.lineTo(1080 - M, 118);
  ctx.stroke();

  ctx.strokeStyle = PAL.rule;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(M, 126);
  ctx.lineTo(1080 - M, 126);
  ctx.moveTo(M, 1790);
  ctx.lineTo(1080 - M, 1790);
  ctx.stroke();

  // Vertical subtle column guides
  ctx.strokeStyle = 'rgba(26, 23, 21, 0.05)';
  ctx.beginPath();
  ctx.moveTo(M, 126);
  ctx.lineTo(M, 1790);
  ctx.moveTo(540, 440);
  ctx.lineTo(540, 1400);
  ctx.moveTo(1080 - M, 126);
  ctx.lineTo(1080 - M, 1790);
  ctx.stroke();

  // Running header (small-caps style)
  ctx.fillStyle = PAL.inkMuted;
  ctx.font = `600 17px ${FONT.mono}`;
  ctx.letterSpacing = '1.4px';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(issue.toUpperCase(), M, 98);

  ctx.textAlign = 'right';
  ctx.fillText(`${rubric.toUpperCase()}  ·  HAL. 0${figNo}/0${totalFigs}`, 1080 - M, 98);

  ctx.restore();
}

/**
 * Draw high-contrast editorial serif headline.
 * Words wrapped in *asterisks* render in italic terracotta with warm highlighter bar underneath.
 */
export function drawEditorialHeadline(ctx, kicker, lines, sub, y = 185, p = 1) {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.globalAlpha = k;
  ctx.translate(0, (1 - k) * 24);

  const M = 68;
  // Small-caps terracotta kicker with ornamental diamond
  ctx.fillStyle = PAL.terracotta;
  ctx.font = `700 22px ${FONT.mono}`;
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`◆  ${kicker.toUpperCase()}`, M, y);

  // Main serif headline lines
  const size = 72;
  const lh = 80;
  lines.forEach((line, idx) => {
    const by = y + 76 + idx * lh;
    const segs = line
      .split(/(\*[^*]+\*)/)
      .filter(Boolean)
      .map((s) => (s.startsWith('*') ? { text: s.slice(1, -1), italic: true } : { text: s, italic: false }));

    let cx = M;
    for (const seg of segs) {
      ctx.font = `${seg.italic ? 'italic 600' : '600'} ${size}px ${FONT.serif}`;
      ctx.letterSpacing = '-0.5px';
      const w = ctx.measureText(seg.text).width;
      if (seg.italic) {
        ctx.fillStyle = PAL.highlight;
        ctx.fillRect(cx - 4, by - size * 0.42, w + 8, size * 0.48);
        ctx.fillStyle = PAL.terracotta;
      } else {
        ctx.fillStyle = PAL.ink;
      }
      ctx.fillText(seg.text, cx, by);
      cx += w;
    }
  });

  // Sub-deck in muted serif/sans + hairline divider
  const subY = y + 76 + lines.length * lh + 10;
  if (sub) {
    ctx.fillStyle = PAL.inkMuted;
    ctx.font = `italic 400 26px ${FONT.serif}`;
    ctx.letterSpacing = '0px';
    ctx.fillText(sub, M, subY, 944);
  }

  ctx.strokeStyle = PAL.rule;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(M, subY + 26);
  ctx.lineTo(M + 944 * k, subY + 26);
  ctx.stroke();

  ctx.restore();
}

/** Magazine Figure Frame with FIG. number, corner ticks, and italic caption. */
export function drawFigureFrame(ctx, x, y, w, h, figTag, caption, p = 1) {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.globalAlpha = k;

  // Cream card interior
  ctx.fillStyle = PAL.card;
  ctx.fillRect(x, y, w, h);

  // Hairline border
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(x, y, w, h);

  // Inner thin border
  ctx.strokeStyle = PAL.rule;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 12, y + 12, w - 24, h - 24);

  // Top-left FIG. badge (auto-sized to text width)
  ctx.font = `700 18px ${FONT.mono}`;
  ctx.letterSpacing = '1.8px';
  const label = figTag.toUpperCase();
  const bw = Math.ceil(ctx.measureText(label).width) + 36;
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(x + 12, y + 12, bw, 38);
  ctx.fillStyle = PAL.paper;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 30, y + 31);

  // Caption bar below frame
  if (caption) {
    ctx.fillStyle = PAL.inkMuted;
    ctx.font = `italic 400 25px ${FONT.serif}`;
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(caption, x, y + h + 40, w);
  }

  ctx.restore();
}

/** Draw editorial color/material specimen swatches. */
export function drawColorSwatches(ctx, x, y, swatches, p = 1) {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.globalAlpha = k;
  const n = swatches.length;
  const gap = 24;
  const totalW = 944;
  const cw = (totalW - gap * (n - 1)) / n;

  swatches.forEach((sw, i) => {
    const sx = x + i * (cw + gap);
    const sp = ease.outCubic(clamp(p * 1.3 - i * 0.12));
    ctx.save();
    ctx.translate(0, (1 - sp) * 30);
    ctx.globalAlpha = sp;

    ctx.fillStyle = PAL.card;
    ctx.fillRect(sx, y, cw, 250);
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(sx, y, cw, 250);

    // Color block
    ctx.fillStyle = sw.color;
    ctx.fillRect(sx + 14, y + 14, cw - 28, 130);

    // Code & title
    ctx.fillStyle = PAL.ink;
    ctx.font = `700 23px ${FONT.serif}`;
    ctx.textAlign = 'left';
    ctx.fillText(sw.name, sx + 16, y + 182, cw - 32);

    ctx.fillStyle = PAL.inkMuted;
    ctx.font = `500 17px ${FONT.mono}`;
    ctx.fillText(sw.sub, sx + 16, y + 218, cw - 32);
    ctx.restore();
  });
  ctx.restore();
}

/** Draw Sumba Hinggi Ikat Textile Pattern (Kombu Terracotta & Indigo Blue bands with horse/geometric motifs). */
export function drawSumbaHinggi(ctx, cx, cy, w, h, t = 0, p = 1) {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(k, k);

  const x0 = -w / 2, y0 = -h / 2;
  // Base woven cloth
  ctx.fillStyle = PAL.terracotta;
  ctx.fillRect(x0, y0, w, h);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(x0, y0, w, h);

  // Horizontal symmetrical bands (Hinggi Kombu structure)
  const bands = [
    { ry: 0.08, h: 0.14, col: PAL.indigo },
    { ry: 0.26, h: 0.18, col: '#221C18' },
    { ry: 0.48, h: 0.22, col: PAL.paper },
    { ry: 0.74, h: 0.18, col: PAL.indigo },
  ];
  bands.forEach((b) => {
    ctx.fillStyle = b.col;
    ctx.fillRect(x0 + 12, y0 + h * b.ry, w - 24, h * b.h);
  });

  // Geometric diamond ikat motifs along bands
  ctx.strokeStyle = PAL.paper;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 7; i++) {
    const dx = x0 + 65 + i * ((w - 130) / 6);
    const dy1 = y0 + h * 0.15;
    const dy2 = y0 + h * 0.83;
    for (const dy of [dy1, dy2]) {
      ctx.beginPath();
      ctx.moveTo(dx, dy - 18);
      ctx.lineTo(dx + 22, dy);
      ctx.lineTo(dx, dy + 18);
      ctx.lineTo(dx - 22, dy);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Stylized Sumba Horses (Njara) in the central cream band
  const horseY = y0 + h * 0.59;
  for (const dir of [-1, 1]) {
    ctx.save();
    ctx.translate(dir * 135, horseY);
    ctx.scale(dir, 1);
    ctx.fillStyle = PAL.terracotta;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2.5;
    // Body, neck, head, legs
    ctx.fillRect(-45, -24, 86, 26);
    ctx.fillRect(22, -62, 22, 44);
    ctx.fillRect(22, -66, 40, 18);
    ctx.fillRect(-42, 2, 12, 36);
    ctx.fillRect(-18, 2, 12, 36);
    ctx.fillRect(16, 2, 12, 36);
    ctx.fillRect(32, 2, 12, 36);
    ctx.restore();
  }

  // Fringe threads at top and bottom
  ctx.strokeStyle = PAL.ochre;
  ctx.lineWidth = 2;
  for (let x = x0 + 16; x < x0 + w - 12; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y0 - 20);
    ctx.moveTo(x, y0 + h);
    ctx.lineTo(x, y0 + h + 20);
    ctx.stroke();
  }

  ctx.restore();
}

/** Draw fine-line editorial botanical/craft illustration plates. */
export function drawEditorialPlate(ctx, cx, cy, kind, t = 0, p = 1) {
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(k, k);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (kind === 'skein') {
    // Tied cotton yarn bundles + clay dye pot
    for (let i = -2; i <= 2; i++) {
      const xx = i * 95;
      ctx.strokeStyle = i % 2 === 0 ? PAL.indigo : PAL.terracotta;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(xx, -170);
      ctx.bezierCurveTo(xx - 35, -60, xx + 35, 60, xx, 170);
      ctx.stroke();
      // Gewang palm tie wraps
      ctx.fillStyle = PAL.ochre;
      ctx.fillRect(xx - 20, -70 + (i % 2) * 35, 40, 22);
      ctx.fillRect(xx - 20, 40 - (i % 2) * 25, 40, 22);
    }
  } else if (kind === 'loom') {
    // Backstrap loom (Gedogan) warp & shuttle
    ctx.strokeStyle = PAL.inkMuted;
    ctx.lineWidth = 2;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 32, -190);
      ctx.lineTo(i * 32, 190);
      ctx.stroke();
    }
    // Wooden beams
    ctx.fillStyle = PAL.ochre;
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.fillRect(-310, -200, 620, 28);
    ctx.strokeRect(-310, -200, 620, 28);
    ctx.fillRect(-310, 172, 620, 28);
    ctx.strokeRect(-310, 172, 620, 28);
    // Woven section & moving shuttle
    ctx.fillStyle = PAL.terracotta;
    ctx.fillRect(-260, 30, 520, 142);
    const sx = Math.sin(t * 2.4) * 180;
    ctx.fillStyle = PAL.indigo;
    ctx.beginPath();
    ctx.ellipse(sx, -10, 75, 18, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'nutmeg') {
    // Banda Nutmeg split fruit with red mace (fuli) aril and dark seed
    ctx.fillStyle = PAL.ochre;
    ctx.beginPath();
    ctx.ellipse(0, 0, 155, 185, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PAL.paper;
    ctx.beginPath();
    ctx.ellipse(0, 0, 118, 145, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Dark brown nutmeg seed
    ctx.fillStyle = '#3B281E';
    ctx.beginPath();
    ctx.ellipse(0, 10, 68, 92, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Crimson lacy mace (fuli) wrapping the seed
    ctx.strokeStyle = PAL.terracotta;
    ctx.lineWidth = 9;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 18, 95);
      ctx.quadraticCurveTo(i * 38, 0, i * 14, -78);
      ctx.stroke();
    }
  } else if (kind === 'clove') {
    // Ternate Clove flower buds & botanical leaves
    ctx.strokeStyle = PAL.sage;
    ctx.fillStyle = PAL.sage;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-180, 160);
    ctx.quadraticCurveTo(0, 20, 160, -140);
    ctx.stroke();
    // Leaves
    for (const [lx, ly, ang] of [[-70, 60, -0.6], [20, -20, 0.5], [-110, 100, 0.7]]) {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(0, -55, 32, 68, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    // Red-brown clove buds
    for (const [bx, by] of [[110, -100], [155, -135], [130, -65]]) {
      ctx.fillStyle = PAL.terracotta;
      ctx.beginPath();
      ctx.arc(bx, by, 22, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  } else if (kind === 'coffee') {
    // Cross-section of coffee cherry & volcanic elevation profile
    ctx.fillStyle = PAL.terracotta;
    ctx.beginPath();
    ctx.ellipse(0, 0, 175, 145, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PAL.paper;
    ctx.beginPath();
    ctx.ellipse(0, 0, 138, 112, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // Two green/roasted beans inside
    for (const dir of [-1, 1]) {
      ctx.fillStyle = PAL.sage;
      ctx.beginPath();
      ctx.ellipse(dir * 48, 0, 38, 68, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dir * 48, -52);
      ctx.quadraticCurveTo(dir * 38, 0, dir * 48, 52);
      ctx.stroke();
    }
  }

  ctx.restore();
}

