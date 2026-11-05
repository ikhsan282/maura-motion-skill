// Maura Motion style kit: PERKAMEN UKIRAN (Renaissance Engraved Parchment & Cartographic Journal).
import { clamp, lerp, ease, hrand, mulberry32, TAU, mixHex, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached, roundRect } from '/engine/lib/draw.js';

export const PAL = {
  paper: '#e6d3a3',
  paper2: '#d4b983',
  paperDark: '#b89758',
  ink: '#2e1f0f',
  inkSoft: '#5c4328',
  red: '#8f2f1d',
  gold: '#a67c2e',
  verdigris: '#2f5e4e',
  cream: '#f4ead2',
};

export { clamp, lerp, ease, hrand, TAU, mixHex, rgba };

export function cam(ctx, x, y, z = 1, rot = 0, fy = 960) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(540, fy);
  ctx.rotate(rot);
  ctx.scale(z, z);
  ctx.translate(-x, -y);
}

export const pop = (t, t0, dur = 0.45) => (t < t0 ? 0 : ease.outBack(clamp((t - t0) / dur)));
export const pr = (t, a, b) => ease.inOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));

export function bg(ctx, t = 0) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const c = cached('perkamen-bg-v2', () => {
    const m = makeCanvas(540, 960), g = m.getContext('2d');
    const gr = g.createRadialGradient(270, 450, 60, 270, 480, 620);
    gr.addColorStop(0, '#efe1ba');
    gr.addColorStop(0.65, '#dfc896');
    gr.addColorStop(1, '#bfa068');
    g.fillStyle = gr;
    g.fillRect(0, 0, 540, 960);

    // Subtle aged stains & fibers
    const rng = mulberry32(1521);
    for (let i = 0; i < 45; i++) {
      const sx = rng() * 540, sy = rng() * 960, sr = 25 + rng() * 90;
      const sg = g.createRadialGradient(sx, sy, 2, sx, sy, sr);
      sg.addColorStop(0, 'rgba(130, 92, 42, 0.07)');
      sg.addColorStop(1, 'rgba(130, 92, 42, 0)');
      g.fillStyle = sg;
      g.beginPath();
      g.arc(sx, sy, sr, 0, TAU);
      g.fill();
    }

    // Fine horizontal laid-paper lines
    g.strokeStyle = 'rgba(61, 43, 22, 0.045)';
    g.lineWidth = 1;
    for (let y = 0; y < 960; y += 6) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(540, y);
      g.stroke();
    }

    // Faint cartographic rhumb lines radiating from center
    g.strokeStyle = 'rgba(61, 43, 22, 0.055)';
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * TAU;
      g.beginPath();
      g.moveTo(270, 480);
      g.lineTo(270 + Math.cos(ang) * 700, 480 + Math.sin(ang) * 700);
      g.stroke();
    }
    return m;
  });
  ctx.drawImage(c, 0, 0, 1080, 1920);
  ctx.restore();
}

export function frame(ctx, { t = 0, folio = 'FOLIO XVI • ANNO 1521' } = {}) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 8;
  ctx.strokeRect(46, 78, 988, 1764);
  ctx.lineWidth = 2.5;
  ctx.strokeRect(62, 94, 956, 1732);

  // Engraved corner hatching ticks along outer border
  ctx.strokeStyle = 'rgba(46, 31, 15, 0.35)';
  ctx.lineWidth = 1.5;
  for (let x = 70; x <= 1010; x += 18) {
    ctx.beginPath();
    ctx.moveTo(x, 78); ctx.lineTo(x - 6, 94);
    ctx.moveTo(x, 1826); ctx.lineTo(x - 6, 1842);
    ctx.stroke();
  }

  // Corner rosettes
  for (const [cx, cy] of [[54, 86], [1026, 86], [54, 1834], [1026, 1834]]) {
    ctx.fillStyle = PAL.paper;
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, TAU); ctx.stroke();
    ctx.fillStyle = PAL.red;
    ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.fill();
  }

  if (folio) {
    ctx.fillStyle = PAL.paper;
    roundRect(ctx, 270, 58, 540, 40, 8);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2.5;
    roundRect(ctx, 270, 58, 540, 40, 8);
    ctx.stroke();
    ctx.fillStyle = PAL.red;
    ctx.font = '700 20px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(folio, 540, 79, 510);
  }
  ctx.restore();
}

export function title(ctx, str, x, y, { a = 1, size = 56, col = PAL.ink, maxW = 880 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = col;
  ctx.font = `800 ${size}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y, maxW);
  ctx.restore();
}

export function caption(ctx, str, x, y, { a = 1, size = 34, col = 'rgba(46,31,15,0.82)', maxW = 880 } = {}) {
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.fillStyle = col;
  ctx.font = `italic 600 ${size}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y, maxW);
  ctx.restore();
}

export function parchmentHeader(ctx, tag, mainTitle, subTitle, { y = 195, a = 1, accent = PAL.red } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const w = 880, h = 152, x = 540 - w / 2, top = y - h / 2;

  // Drop shadow & parchment banner
  ctx.fillStyle = 'rgba(46, 31, 15, 0.16)';
  roundRect(ctx, x + 6, top + 8, w, h, 14);
  ctx.fill();

  ctx.fillStyle = PAL.cream;
  roundRect(ctx, x, top, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  roundRect(ctx, x, top, w, h, 14);
  ctx.stroke();

  // Inner rule
  ctx.strokeStyle = 'rgba(46, 31, 15, 0.35)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x + 10, top + 10, w - 20, h - 20, 9);
  ctx.stroke();

  // Rubricated top tag pill
  ctx.fillStyle = accent;
  roundRect(ctx, 540 - 290, top - 16, 580, 32, 8);
  ctx.fill();
  ctx.fillStyle = PAL.cream;
  ctx.font = '700 18px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, 540, top, 550);

  // Main title & subtitle
  ctx.fillStyle = PAL.ink;
  ctx.font = '800 40px Georgia, "Times New Roman", serif';
  ctx.fillText(mainTitle, 540, top + 58, w - 60);

  if (subTitle) {
    ctx.fillStyle = PAL.inkSoft;
    ctx.font = 'italic 600 24px Georgia, "Times New Roman", serif';
    ctx.fillText(subTitle, 540, top + 108, w - 70);
  }
  ctx.restore();
}

export function compassRose(ctx, x, y, r, { t = 0, a = 1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 0.5) * 0.03);

  // Outer degree rings
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.86, 0, TAU); ctx.stroke();

  for (let i = 0; i < 32; i++) {
    const ang = (i / 32) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * r * 0.86, Math.sin(ang) * r * 0.86);
    ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
    ctx.stroke();
  }

  // 8-point star
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI) / 4);
    const len = i % 2 === 0 ? r * 0.82 : r * 0.56;
    const wid = i % 2 === 0 ? r * 0.16 : r * 0.11;
    // Right half dark ink
    ctx.fillStyle = i === 0 ? PAL.red : PAL.ink;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(wid, -wid); ctx.lineTo(0, -len); ctx.closePath();
    ctx.fill();
    // Left half cream with ink outline
    ctx.fillStyle = PAL.paper;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(-wid, -wid); ctx.lineTo(0, -len); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = PAL.gold;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.1, 0, TAU); ctx.fill();
  ctx.strokeStyle = PAL.ink; ctx.stroke();
  ctx.restore();
}

export function ship(ctx, x, y, s, { t = 0, bob = 1, label = '', redCross = true } = {}) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 1.6) * 9 * bob);
  ctx.rotate(Math.sin(t * 1.1) * 0.025 * bob);
  ctx.scale(s, s);

  // Main masts
  ctx.fillStyle = '#4a3018';
  ctx.fillRect(-10, -210, 14, 245);
  ctx.fillRect(-115, -150, 10, 185);
  ctx.fillRect(95, -140, 10, 175);

  // Billowing sails (cream with engraved hatching)
  const drawSail = (sx, sy, sw, sh, cross) => {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = PAL.cream;
    ctx.beginPath();
    ctx.moveTo(-sw / 2, 0);
    ctx.quadraticCurveTo(0, -12, sw / 2, 0);
    ctx.quadraticCurveTo(sw / 2 + 24, sh * 0.5, sw / 2 - 6, sh);
    ctx.quadraticCurveTo(0, sh + 12, -sw / 2 + 6, sh);
    ctx.quadraticCurveTo(-sw / 2 + 16, sh * 0.5, -sw / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Engraved shading lines on left edge of sail
    ctx.strokeStyle = 'rgba(46, 31, 15, 0.28)';
    ctx.lineWidth = 1.5;
    for (let yy = 12; yy < sh - 8; yy += 10) {
      ctx.beginPath();
      ctx.moveTo(-sw / 2 + 12, yy);
      ctx.lineTo(-sw / 2 + 44, yy + 4);
      ctx.stroke();
    }

    if (cross) {
      ctx.fillStyle = PAL.red;
      ctx.fillRect(-8, sh * 0.25, 16, sh * 0.48);
      ctx.fillRect(-sw * 0.22, sh * 0.42, sw * 0.44, 16);
    }
    ctx.restore();
  };

  drawSail(-108, -130, 88, 110, false);
  drawSail(-2, -185, 145, 155, redCross);
  drawSail(100, -120, 82, 100, false);

  // Red pennant flag at top of main mast
  ctx.fillStyle = PAL.red;
  ctx.beginPath();
  ctx.moveTo(4, -210);
  ctx.quadraticCurveTo(50, -220 + Math.sin(t * 4) * 8, 92, -202);
  ctx.lineTo(4, -188);
  ctx.closePath();
  ctx.fill();

  // Wooden caravel hull with high forecastle & sterncastle
  ctx.fillStyle = '#5c3c1e';
  ctx.beginPath();
  ctx.moveTo(-185, 5);
  ctx.lineTo(-130, 28);
  ctx.lineTo(125, 28);
  ctx.lineTo(175, -18);
  ctx.lineTo(148, 88);
  ctx.lineTo(-142, 88);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Hull planking & gunports
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-155, 48); ctx.lineTo(155, 48);
  ctx.moveTo(-148, 68); ctx.lineTo(148, 68);
  ctx.stroke();

  for (let gx = -95; gx <= 95; gx += 38) {
    ctx.fillStyle = PAL.ink;
    ctx.fillRect(gx - 7, 33, 14, 11);
  }

  if (label) {
    ctx.fillStyle = PAL.cream;
    roundRect(ctx, -155, 98, 310, 34, 8);
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 2;
    roundRect(ctx, -155, 98, 310, 34, 8);
    ctx.stroke();
    ctx.fillStyle = PAL.ink;
    ctx.font = '700 18px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 115, 290);
  }
  ctx.restore();
}

export function waves(ctx, y, t, { col = 'rgba(46,31,15,0.55)', rows = 4 } = {}) {
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 3.2;
  for (let r = 0; r < rows; r++) {
    ctx.beginPath();
    for (let x = 80; x <= 1000; x += 18) {
      const yy = y + r * 32 + Math.sin(x * 0.024 + t * 2.2 + r * 1.1) * 10;
      x === 80 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}

export function feather(ctx, x, y, s, { t = 0 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.45 + Math.sin(t * 3.2) * 0.06);
  ctx.scale(s, s);

  // Vane of the quill feather
  ctx.fillStyle = PAL.cream;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-36, -45, -28, -135, 28, -190);
  ctx.bezierCurveTo(52, -130, 32, -45, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Feather barbs hatching
  ctx.strokeStyle = 'rgba(46,31,15,0.45)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i <= 7; i++) {
    const p = i / 8;
    const qx = p * 22, qy = -p * 170;
    ctx.beginPath();
    ctx.moveTo(qx, qy); ctx.lineTo(qx - 18, qy - 12);
    ctx.moveTo(qx, qy); ctx.lineTo(qx + 16, qy - 6);
    ctx.stroke();
  }

  // Central shaft (rachis) & ink nib
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, 32);
  ctx.quadraticCurveTo(6, -75, 28, -190);
  ctx.stroke();

  ctx.fillStyle = PAL.red;
  ctx.beginPath();
  ctx.arc(-6, 32, 5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function spiceBotanical(ctx, x, y, s, { t = 0, kind = 'clove', a = 1, label = 'CARYOPHYLLUS • CENGKIH', sub = 'Syzygium aromaticum' } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y);
  ctx.scale(s, s);

  // Botanical specimen plate background
  ctx.fillStyle = PAL.cream;
  roundRect(ctx, -190, -210, 380, 420, 14);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  roundRect(ctx, -190, -210, 380, 420, 14);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  roundRect(ctx, -178, -198, 356, 396, 10);
  ctx.stroke();

  // Specimen stem
  ctx.save();
  ctx.rotate(Math.sin(t * 1.4) * 0.025);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 105);
  ctx.quadraticCurveTo(-10, -10, 8, -115);
  ctx.stroke();

  // Engraved leaves with vein hatching
  const drawLeaf = (lx, ly, ang, scale) => {
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(ang);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#7e8c54';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-42, -45, 0, -110);
    ctx.quadraticCurveTo(42, -45, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PAL.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, -102);
    for (let vy = -20; vy >= -85; vy -= 16) {
      ctx.moveTo(0, vy); ctx.lineTo(-20, vy - 12);
      ctx.moveTo(0, vy); ctx.lineTo(20, vy - 12);
    }
    ctx.stroke();
    ctx.restore();
  };

  drawLeaf(-4, 55, -0.75, 1.0);
  drawLeaf(4, 35, 0.72, 0.95);
  drawLeaf(-2, -15, -0.62, 0.85);
  drawLeaf(5, -30, 0.65, 0.82);

  if (kind === 'nutmeg') {
    // Nutmeg split fruit with red mace aril
    ctx.fillStyle = '#c9974c';
    ctx.beginPath(); ctx.ellipse(8, -115, 44, 54, 0.1, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.fillStyle = '#4a2e16';
    ctx.beginPath(); ctx.ellipse(8, -115, 22, 30, 0.1, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.red; ctx.lineWidth = 4;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(8 + i * 6, -142);
      ctx.quadraticCurveTo(8 + i * 10, -115, 8 + i * 5, -86);
      ctx.stroke();
    }
  } else {
    // Clove flower buds cluster (crimson-brown nail buds)
    for (const [bx, by, rot] of [[-28, -112, -0.35], [6, -132, 0.05], [38, -108, 0.38], [-10, -92, -0.15], [24, -88, 0.22]]) {
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(rot);
      ctx.fillStyle = PAL.red;
      ctx.fillRect(-6, -28, 12, 28);
      ctx.beginPath();
      ctx.arc(0, -32, 11, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-6, -28, 12, 28);
      ctx.beginPath(); ctx.arc(0, -32, 11, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();

  // Specimen caption plate
  ctx.fillStyle = PAL.ink;
  ctx.font = '800 20px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, 145, 340);
  ctx.fillStyle = PAL.red;
  ctx.font = 'italic 600 18px Georgia, "Times New Roman", serif';
  ctx.fillText(sub, 0, 175, 340);
  ctx.restore();
}

export function lexiconTable(ctx, x, y, w, h, { t = 0, a = 1, titleStr = 'VOCABOLARIO ITALIANO – MALAYO (1521)', rows = [], activeIdx = -1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const left = x - w / 2, top = y - h / 2;

  ctx.fillStyle = 'rgba(46, 31, 15, 0.16)';
  roundRect(ctx, left + 8, top + 10, w, h, 14);
  ctx.fill();

  ctx.fillStyle = PAL.cream;
  roundRect(ctx, left, top, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3.5;
  roundRect(ctx, left, top, w, h, 14);
  ctx.stroke();

  // Header bar
  ctx.fillStyle = PAL.ink;
  roundRect(ctx, left + 14, top + 14, w - 28, 52, 8);
  ctx.fill();
  ctx.fillStyle = PAL.paper;
  ctx.font = '800 22px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleStr, x, top + 40, w - 50);

  // Column headers
  const colY = top + 92;
  ctx.fillStyle = PAL.red;
  ctx.font = '800 20px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'left';
  ctx.fillText('ITALIANO (1521)', left + 36, colY);
  ctx.fillText('CATATAN PIGAFETTA', left + w * 0.38, colY);
  ctx.fillText('MELAYU KINI', left + w * 0.72, colY);

  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left + 26, colY + 18);
  ctx.lineTo(left + w - 26, colY + 18);
  ctx.stroke();

  const rowH = Math.min(64, (h - 140) / Math.max(1, rows.length));
  rows.forEach((r, i) => {
    const ry = colY + 48 + i * rowH;
    const isAct = i === activeIdx;
    if (isAct) {
      ctx.fillStyle = 'rgba(143, 47, 29, 0.12)';
      roundRect(ctx, left + 22, ry - 24, w - 44, rowH - 6, 8);
      ctx.fill();
    }
    ctx.fillStyle = PAL.inkSoft;
    ctx.font = 'italic 600 24px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'left';
    ctx.fillText(r.it, left + 36, ry, w * 0.32);

    ctx.fillStyle = PAL.red;
    ctx.font = '800 26px Georgia, "Times New Roman", serif';
    ctx.fillText(r.pigafetta, left + w * 0.38, ry, w * 0.3);

    ctx.fillStyle = PAL.ink;
    ctx.font = '700 25px Georgia, "Times New Roman", serif';
    ctx.fillText(r.id, left + w * 0.72, ry, w * 0.24);

    ctx.strokeStyle = 'rgba(46, 31, 15, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left + 30, ry + rowH * 0.42);
    ctx.lineTo(left + w - 30, ry + rowH * 0.42);
    ctx.stroke();
  });

  if (activeIdx >= 0 && activeIdx < rows.length) {
    const qy = colY + 42 + activeIdx * rowH;
    feather(ctx, left + w * 0.62 + Math.sin(t * 5) * 14, qy - 10, 0.62, { t });
  }
  ctx.restore();
}

export function archivalCard(ctx, x, y, w, h, { tag = '', titleStr = '', subStr = '', stat = '', statSub = '', accent = PAL.red, a = 1 } = {}) {
  if (a <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= a;
  const left = x - w / 2, top = y - h / 2;

  ctx.fillStyle = 'rgba(46, 31, 15, 0.15)';
  roundRect(ctx, left + 6, top + 8, w, h, 14);
  ctx.fill();

  ctx.fillStyle = PAL.cream;
  roundRect(ctx, left, top, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, left, top, w, h, 14);
  ctx.stroke();

  // Left accent bar
  ctx.fillStyle = accent;
  roundRect(ctx, left + 12, top + 14, 10, h - 28, 5);
  ctx.fill();

  const textLeft = left + 38;
  const maxTextW = stat ? w * 0.60 : w - 60;

  if (tag) {
    ctx.fillStyle = accent;
    ctx.font = '800 18px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(tag, textLeft, top + 34, maxTextW);
  }
  if (titleStr) {
    ctx.fillStyle = PAL.ink;
    ctx.font = '800 30px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleStr, textLeft, top + (tag ? 74 : 52), maxTextW);
  }
  if (subStr) {
    ctx.fillStyle = PAL.inkSoft;
    ctx.font = 'italic 600 22px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(subStr, textLeft, top + h - 34, maxTextW);
  }

  if (stat) {
    const sx = left + w - 125;
    ctx.fillStyle = 'rgba(143, 47, 29, 0.1)';
    roundRect(ctx, sx - 95, top + 18, 190, h - 36, 10);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    roundRect(ctx, sx - 95, top + 18, 190, h - 36, 10);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = '800 38px Georgia, "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stat, sx, top + h * 0.44, 175);
    if (statSub) {
      ctx.fillStyle = PAL.ink;
      ctx.font = '700 17px Georgia, "Times New Roman", serif';
      ctx.fillText(statSub, sx, top + h * 0.75, 175);
    }
  }
  ctx.restore();
}
