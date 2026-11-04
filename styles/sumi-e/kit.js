// Maura Motion style kit: SUMI-E TINTA TIMUR (East Asian Ink-Wash Painting on Xuan Rice Paper).
// Signature: absorbent xuan/washi paper texture, wet ink gradations (bokashi), dry-brush bristle streaks (kasure),
// layered misty shanshui mountains, negative space (Ma), and a single carved vermilion red seal stamp (hanko/chop).
import { clamp, lerp, ease, hrand, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  paper: '#f4efe3',
  paperDark: '#e3d9c3',
  ink: '#141312',
  dark: '#2c2926',
  mid: '#5c5750',
  light: '#948d82',
  mist: '#dcd3c0',
  red: '#b8322a',
  gold: '#c99738',
  water: '#9db8ad',
  grey: '#6b6b6b',
};

// ---------------------------------------------------------------- legacy exports
export function bg(ctx, t, c1 = PAL.paper, c2 = PAL.paperDark) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  ctx.restore();
}
export function title(ctx, text, x, y, { size = 84, color = PAL.ink, p = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = color;
  ctx.font = `700 ${size}px 'Noto Serif', Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y); ctx.restore();
}
export function label(ctx, text, x, y, { size = 46, color = PAL.dark, p = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = color;
  ctx.font = `600 ${size}px 'Plus Jakarta Sans', sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y); ctx.restore();
}
export function blob(ctx, x, y, r, color, t, { seed = 1 } = {}) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  const n = 12, rnd = mulberry32(seed);
  const off = Array.from({ length: n }, () => 0.78 + rnd() * 0.44);
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU;
    const rr = r * off[i % n] * (1 + 0.04 * Math.sin(t * 1.4 + i));
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.9;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
export function ring(ctx, x, y, r, color, w = 8) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.restore();
}
export function card(ctx, x, y, w, h, fill, { r = 16, stroke = PAL.dark, lw = 3, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = fill;
  ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, r); ctx.fill();
  if (stroke && lw > 0) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  ctx.restore();
}

// ---------------------------------------------------------------- sumi-e stage & brushwork
/** Cached Xuan rice paper background with mulberry fibers, scroll frame, and soft ink wash vignette. */
export function ricePaper(ctx, t = 0, { header = '', sub = '', sealText = '墨' } = {}) {
  const base = cached('sumie-xuan-paper-v1', () => {
    const cv = makeCanvas(1080, 1920), g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 1920);
    gr.addColorStop(0, '#f6f1e6');
    gr.addColorStop(0.55, '#f2ecde');
    gr.addColorStop(1, '#e5dcc8');
    g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);

    // Subtle paper fiber threads & warm age spots
    const rnd = mulberry32(4601);
    g.strokeStyle = 'rgba(92,87,80,0.06)'; g.lineWidth = 1.2;
    for (let i = 0; i < 420; i++) {
      const x = rnd() * 1080, y = rnd() * 1920, l = 12 + rnd() * 42, a = rnd() * TAU;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 35; i++) {
      const x = rnd() * 1080, y = rnd() * 1920, r = 40 + rnd() * 140;
      const rg = g.createRadialGradient(x, y, 4, x, y, r);
      rg.addColorStop(0, 'rgba(148,141,130,0.06)');
      rg.addColorStop(1, 'rgba(148,141,130,0)');
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }

    // Outer hanging scroll border lines (double ink rule)
    g.strokeStyle = 'rgba(20,19,18,0.35)'; g.lineWidth = 4;
    g.strokeRect(36, 44, 1008, 1832);
    g.strokeStyle = 'rgba(20,19,18,0.16)'; g.lineWidth = 1.5;
    g.strokeRect(48, 56, 984, 1808);
    return cv;
  });

  ctx.save();
  ctx.drawImage(base, 0, 0);

  if (header) {
    ctx.fillStyle = PAL.ink;
    ctx.font = "700 46px 'Noto Serif', Georgia, serif";
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(header, 78, 112);
    if (sub) {
      ctx.fillStyle = PAL.mid;
      ctx.font = "600 26px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(sub, 78, 154);
    }
    // Brush underline
    brushStroke(ctx, 76, 182, 760, 180, { w: 7, col: PAL.ink, dry: true });
  }
  if (sealText) {
    redSeal(ctx, 965, 125, sealText, { size: 74, p: 1 });
  }
  ctx.restore();
}

/** Expressive tapered brush stroke with dry-brush bristle splits (kasure) at the end. */
export function brushStroke(ctx, x0, y0, x1, y1, { w = 18, col = PAL.ink, dry = true, arch = 0, p = 1, alpha = 1 } = {}) {
  if (p <= 0) return;
  const k = clamp(p);
  const ex = lerp(x0, x1, k), ey = lerp(y0, y1, k);
  const mx = (x0 + ex) / 2, my = (y0 + ey) / 2 - arch;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = col;
  ctx.lineCap = 'round';
  ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();

  if (dry && k > 0.35) {
    const dx = ex - x0, dy = ey - y0, L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L;
    ctx.lineWidth = Math.max(1.5, w * 0.14);
    for (let i = -2; i <= 2; i++) {
      const off = i * w * 0.22;
      ctx.beginPath();
      ctx.moveTo(lerp(x0, ex, 0.55) + nx * off, lerp(y0, ey, 0.55) + ny * off);
      ctx.lineTo(ex + (dx / L) * (10 + Math.abs(i) * 6) + nx * off * 1.15, ey + (dy / L) * (10 + Math.abs(i) * 6) + ny * off * 1.15);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Wet ink diffusion bloom on absorbent xuan paper. */
export function inkBloom(ctx, x, y, r, { col = PAL.ink, alpha = 0.18, seed = 1, t = 0 } = {}) {
  ctx.save();
  const rg = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
  rg.addColorStop(0, col);
  rg.addColorStop(0.65, col);
  rg.addColorStop(1, 'rgba(20,19,18,0)');
  ctx.globalAlpha = alpha;
  blob(ctx, x, y, r, rg, t, { seed });
  ctx.restore();
}

/** Traditional carved vermilion red seal stamp (Hanko / Chop) — the sole warm accent in Sumi-e. */
export function redSeal(ctx, x, y, text = '印', { size = 84, p = 1, rot = -0.03 } = {}) {
  if (p <= 0) return;
  const sc = ease.outBack(clamp(p), 2.4);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  const hs = size / 2;
  ctx.fillStyle = PAL.red;
  ctx.beginPath(); ctx.roundRect(-hs, -hs, size, size, 8); ctx.fill();
  ctx.strokeStyle = PAL.paper; ctx.lineWidth = 3;
  ctx.strokeRect(-hs + 6, -hs + 6, size - 12, size - 12);
  ctx.fillStyle = PAL.paper;
  ctx.font = `800 ${Math.round(size * 0.44)}px 'Noto Serif', Georgia, serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text.slice(0, 2), 0, 2);
  ctx.restore();
}

/** Layered misty Shanshui mountains with ink-wash gradient and drifting white paper mist. */
export function mistyMountains(ctx, t, { yBase = 980, seed = 10 } = {}) {
  const layers = [
    { dy: -310, amp: 140, col: 'rgba(92,87,80,0.28)', freq: 0.0035, sp: 8 },
    { dy: -170, amp: 115, col: 'rgba(44,41,38,0.48)', freq: 0.0048, sp: 14 },
    { dy: -40, amp: 90, col: 'rgba(20,19,18,0.76)', freq: 0.0062, sp: 22 },
  ];
  ctx.save();
  layers.forEach((L, idx) => {
    const gr = ctx.createLinearGradient(0, yBase + L.dy - L.amp, 0, yBase + 140);
    gr.addColorStop(0, L.col);
    gr.addColorStop(0.75, 'rgba(244,239,227,0.08)');
    gr.addColorStop(1, 'rgba(244,239,227,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(40, yBase + 150);
    for (let x = 40; x <= 1040; x += 20) {
      const xx = x + Math.sin(t * 0.25 + idx) * L.sp;
      const h = Math.sin(xx * L.freq + seed + idx * 2.1) * L.amp * 0.65
        + Math.cos(xx * L.freq * 2.3 - idx) * L.amp * 0.35;
      ctx.lineTo(x, yBase + L.dy - Math.abs(h));
    }
    ctx.lineTo(1040, yBase + 150);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

/** Calligraphic dry-brush ocean waves. */
export function inkWaves(ctx, yBase, t, { rows = 4, amp = 18 } = {}) {
  ctx.save();
  for (let r = 0; r < rows; r++) {
    const yy = yBase + r * 44;
    ctx.strokeStyle = r === 0 ? PAL.ink : r === 1 ? PAL.dark : PAL.mid;
    ctx.lineWidth = 6 - r * 1.1;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = 60; x <= 1020; x += 18) {
      const wv = Math.sin(x * 0.018 + t * 2.4 + r * 1.3) * amp;
      x === 60 ? ctx.moveTo(x, yy + wv) : ctx.lineTo(x, yy + wv);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Ming Dynasty Treasure Ship (Baochuan / Kapal Pusaka Cheng Ho) in expressive sumi-e brushwork. */
export function drawTreasureShip(ctx, x, y, s = 1, { sails = 5, redSails = false, t = 0, labelText = '' } = {}) {
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 2.2 + x * 0.01) * 7);
  ctx.rotate(Math.sin(t * 1.6 + x * 0.02) * 0.02);
  ctx.scale(s, s);

  // Bamboo-battened lug sails (layar sekat bambu)
  const mastX = [-210, -110, 0, 105, 195].slice(0, sails);
  const mastH = [210, 270, 320, 250, 180].slice(0, sails);
  mastX.forEach((mx, i) => {
    const mh = mastH[i];
    // Mast pole
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, -mh - 30); ctx.stroke();

    // Lug sail polygon billowing right
    const sw = 78 + (i === 2 ? 22 : 0);
    const billow = 14 + Math.sin(t * 3 + i) * 5;
    ctx.beginPath();
    ctx.moveTo(mx - sw * 0.35, -mh);
    ctx.quadraticCurveTo(mx + sw * 0.25, -mh - 12, mx + sw * 0.65, -mh + 18);
    ctx.quadraticCurveTo(mx + sw * 0.65 + billow, -mh * 0.5, mx + sw * 0.55, -38);
    ctx.lineTo(mx - sw * 0.35, -32);
    ctx.closePath();
    ctx.fillStyle = redSails ? (i === 2 ? PAL.red : 'rgba(184,50,42,0.78)') : (i === 2 ? PAL.dark : PAL.mid);
    ctx.fill();
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4; ctx.stroke();

    // Horizontal bamboo battens across the sail
    ctx.strokeStyle = PAL.paper; ctx.lineWidth = 2;
    for (let b = 1; b <= 5; b++) {
      const by = lerp(-36, -mh + 14, b / 6);
      ctx.beginPath(); ctx.moveTo(mx - sw * 0.32, by); ctx.lineTo(mx + sw * 0.58, by + 4); ctx.stroke();
    }
  });

  // Sweeping wooden junk hull with high stern castle and curved prow
  ctx.beginPath();
  ctx.moveTo(-290, -55); // high stern gallery
  ctx.lineTo(-235, 32);
  ctx.quadraticCurveTo(0, 48, 240, 26);
  ctx.lineTo(295, -42); // upturned prow
  ctx.quadraticCurveTo(180, -14, 0, -12);
  ctx.quadraticCurveTo(-180, -14, -290, -55);
  ctx.closePath();
  ctx.fillStyle = PAL.ink; ctx.fill();

  // White dry-brush highlight along the hull plank
  ctx.strokeStyle = PAL.paper; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(-220, 8); ctx.quadraticCurveTo(0, 22, 220, 4); ctx.stroke();

  if (labelText) {
    ctx.fillStyle = PAL.ink;
    ctx.font = "700 28px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(labelText, 0, 82);
  }
  ctx.restore();
}

/** Traditional curved-eave pagoda / Sam Poo Kong pavilion in sumi-e ink. */
export function drawPagoda(ctx, x, y, s = 1, { tiers = 3, redPillars = true } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // Stone base terrace
  ctx.fillStyle = PAL.dark;
  ctx.fillRect(-220, -36, 440, 36);
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(-250, 0, 500, 18);

  for (let i = 0; i < tiers; i++) {
    const ty = -36 - i * 105;
    const tw = 190 - i * 32;
    // Pillars / walls
    ctx.fillStyle = redPillars ? PAL.red : PAL.mid;
    ctx.fillRect(-tw + 28, ty - 70, (tw - 28) * 2, 70);
    // Lattice doorway
    ctx.fillStyle = PAL.paper;
    ctx.fillRect(-26, ty - 54, 52, 54);
    ctx.strokeStyle = PAL.ink; ctx.lineWidth = 5;
    ctx.strokeRect(-tw + 28, ty - 70, (tw - 28) * 2, 70);

    // Sweeping upturned roof eaves (flying eaves)
    ctx.fillStyle = PAL.ink;
    ctx.beginPath();
    ctx.moveTo(-tw - 55, ty - 62);
    ctx.quadraticCurveTo(-tw, ty - 76, -tw + 40, ty - 108);
    ctx.lineTo(tw - 40, ty - 108);
    ctx.quadraticCurveTo(tw, ty - 76, tw + 55, ty - 62);
    ctx.quadraticCurveTo(0, ty - 74, -tw - 55, ty - 62);
    ctx.closePath();
    ctx.fill();
  }
  // Finial spire
  const topY = -36 - tiers * 105;
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(0, topY + 5); ctx.lineTo(0, topY - 55); ctx.stroke();
  ctx.restore();
}

/** Sumi-e bamboo stalk with nodes (buku bambu) and ink-stroke leaves. */
export function drawBamboo(ctx, x, yBase, h = 600, { bend = 0, sw = 18, col = PAL.ink, nodes = 5 } = {}) {
  ctx.save();
  const segH = h / nodes;
  let cx = x, cy = yBase;
  for (let i = 0; i < nodes; i++) {
    const u = (i + 1) / nodes;
    const nx = x + Math.pow(u, 1.7) * bend;
    const ny = yBase - (i + 1) * segH + Math.abs(bend) * 0.12 * u;
    const w = sw * (1 - i * 0.11);

    // Internode cylinder stroke
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(cx, cy - 4); ctx.lineTo(nx, ny + 4); ctx.stroke();

    // Bamboo node ring (buku bambu — horizontal ink flourish)
    ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(nx - w * 0.85, ny); ctx.lineTo(nx + w * 0.85, ny); ctx.stroke();

    // Shoot & razor-sharp sumi-e leaves at upper nodes
    if (i >= 1) {
      const dir = (i % 2 === 0 ? 1 : -1) * (bend >= 0 ? 1 : -1);
      const bAng = (dir > 0 ? -0.35 : -2.75) + (bend * 0.0018);
      ctx.save(); ctx.translate(nx, ny); ctx.rotate(bAng);
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(65, 0); ctx.stroke();
      for (const [lx, ly, la, ll] of [[35, 0, 0.35, 78], [55, 0, -0.2, 92], [65, 0, 0.15, 84]]) {
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(la);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(ll * 0.45, -13, ll, 0);
        ctx.quadraticCurveTo(ll * 0.45, 13, 0, 0);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }
    cx = nx; cy = ny;
  }
  ctx.restore();
}

/** Ink-framed horizontal scroll callout box. */
export function scrollBox(ctx, x, y, w, h, titleTxt, subTxt = '', { p = 1, accent = PAL.ink } = {}) {
  if (p <= 0) return;
  const k = ease.outCubic(clamp(p));
  ctx.save();
  ctx.globalAlpha = k;
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(244,239,227,0.92)';
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.stroke();
  // Vertical wooden scroll rollers on left & right ends
  ctx.fillStyle = accent;
  ctx.fillRect(-w / 2 - 10, -h / 2 - 8, 14, h + 16);
  ctx.fillRect(w / 2 - 4, -h / 2 - 8, 14, h + 16);

  ctx.fillStyle = accent;
  ctx.font = "700 38px 'Noto Serif', Georgia, serif";
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(titleTxt, 0, subTxt ? -18 : 0);
  if (subTxt) {
    ctx.fillStyle = PAL.dark;
    ctx.font = "600 26px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(subTxt, 0, 24);
  }
  ctx.restore();
}

export { clamp, lerp, ease, hrand, mulberry32, TAU };
