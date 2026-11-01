// Maura Motion style kit: BLUEPRINT (technical drawing in three inks).
//   'pencil' : graphite on cream grid paper, double-pass wobbly strokes
//   'blue'   : Prussian-blue blueprint, white hairlines, dashed hidden edges, hatching
//   'holo'   : black with cyan glowing lines and scanlines (the final reveal)
// Lines draw themselves, dimension lines with live numbers, mono annotations, FIG. corner labels,
// and scene changes by a hard scan line that converts one ink into the next.
import { clamp, lerp, ease, hrand, mulberry32, TAU, rgba } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';
export { clamp, lerp, ease, TAU };

export const PAL = {
  paper: '#ece5d3', graphite: '#3a3934', redPencil: '#c2412d',
  prussian: '#0f3d73', prussian2: '#0b2f5c', white: '#eef5ff', cyanLine: '#9fe3ff',
  holoBg: '#03080d', holo: '#45f0dd', holoCore: '#e8fffb', stamp: '#ff5a4a',
};
export const pr = (t, a, b, fn = ease.inOutCubic) => fn(clamp((t - a) / Math.max(1e-6, b - a)));
export const INK = {
  pencil: { line: PAL.graphite, dim: PAL.graphite, faint: 'rgba(58,57,52,.45)', text: PAL.graphite, accent: PAL.redPencil },
  blue: { line: PAL.white, dim: PAL.cyanLine, faint: 'rgba(238,245,255,.45)', text: PAL.white, accent: '#ffd36b' },
  holo: { line: PAL.holo, dim: PAL.holo, faint: 'rgba(69,240,221,.4)', text: PAL.holoCore, accent: '#ffffff' },
};

// ------------------------------------------------------------------ sheets
/** Background for an ink (cached full-frame canvas): grid, paper tooth / scanlines, frame border with ticks. */
export function sheet(ctx, mode) {
  const c = cached('bp-sheet:' + mode, () => {
    const cv = makeCanvas(1080, 1920), g = cv.getContext('2d');
    if (mode === 'pencil') {
      g.fillStyle = PAL.paper; g.fillRect(0, 0, 1080, 1920);
      const r = mulberry32(3);
      for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,70,40,.05)' : 'rgba(255,255,255,.12)'; g.fillRect(r() * 1080, r() * 1920, 1 + r() * 2, 1 + r() * 2); }
      gridLines(g, 'rgba(60,100,170,.13)', 'rgba(60,100,170,.26)');
    } else if (mode === 'blue') {
      const gr = g.createRadialGradient(540, 800, 100, 540, 900, 1300); gr.addColorStop(0, '#174c8c'); gr.addColorStop(1, PAL.prussian2);
      g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
      const r = mulberry32(5);
      for (let i = 0; i < 6000; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,10,40,.10)' : 'rgba(200,225,255,.05)'; g.fillRect(r() * 1080, r() * 1920, 1 + r() * 2, 1 + r() * 2); }
      gridLines(g, 'rgba(200,225,255,.08)', 'rgba(200,225,255,.17)');
    } else {
      g.fillStyle = PAL.holoBg; g.fillRect(0, 0, 1080, 1920);
      gridLines(g, 'rgba(69,240,221,.05)', 'rgba(69,240,221,.11)');
      for (let y = 0; y < 1920; y += 4) { g.fillStyle = 'rgba(69,240,221,.025)'; g.fillRect(0, y, 1080, 1); }
      const rg = g.createRadialGradient(540, 900, 50, 540, 900, 900); rg.addColorStop(0, 'rgba(69,240,221,.10)'); rg.addColorStop(1, 'rgba(69,240,221,0)');
      g.fillStyle = rg; g.fillRect(0, 0, 1080, 1920);
    }
    // drawing frame
    const ink = INK[mode];
    g.strokeStyle = ink.faint; g.lineWidth = 2; g.strokeRect(40, 110, 1000, 1250);
    g.lineWidth = 1.5; for (let x = 40; x <= 1040; x += 50) { g.beginPath(); g.moveTo(x, 110); g.lineTo(x, 122); g.moveTo(x, 1360); g.lineTo(x, 1348); g.stroke(); }
    for (let y = 110; y <= 1360; y += 50) { g.beginPath(); g.moveTo(40, y); g.lineTo(52, y); g.moveTo(1040, y); g.lineTo(1028, y); g.stroke(); }
    return cv;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c, 0, 0); ctx.restore();
}
function gridLines(g, minor, major) {
  g.lineWidth = 1;
  for (let x = 0, i = 0; x <= 1080; x += 30, i++) { g.strokeStyle = i % 5 ? minor : major; g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, 1920); g.stroke(); }
  for (let y = 0, i = 0; y <= 1920; y += 30, i++) { g.strokeStyle = i % 5 ? minor : major; g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(1080, y + 0.5); g.stroke(); }
}
/**
 * Scan-line transition: draw sheet+content of `from` above the line and `to` below (or vice versa).
 * drawFn(mode) renders the content in that ink. u 0..1 = line position top->bottom.
 */
export function scanTransition(ctx, u, from, to, drawFn) {
  const y = lerp(-20, 1940, ease.inOutCubic(clamp(u)));
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, y); ctx.clip(); sheet(ctx, to); drawFn(to); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, y, 1080, 1940 - y); ctx.clip(); sheet(ctx, from); drawFn(from); ctx.restore();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const c = to === 'holo' ? PAL.holo : PAL.cyanLine;
  ctx.fillStyle = rgba(c, 0.25); ctx.fillRect(0, y - 14, 1080, 14); ctx.fillStyle = c; ctx.fillRect(0, y - 2, 1080, 4);
  ctx.restore();
}

// ------------------------------------------------------------------ strokes
/** Polyline that draws itself (p 0..1). Pencil: two wobbly passes. Holo: a soft wide pass under a bright core. */
export function path(ctx, pts, p, mode = 'blue', { w = 3, closed = false, dash = null, color = null, seed = 1 } = {}) {
  if (p <= 0 || pts.length < 2) return;
  const P = closed ? [...pts, pts[0]] : pts;
  let L = 0; const seg = []; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(d); L += d; }
  const target = L * clamp(p);
  const ink = INK[mode], col = color || ink.line;
  const trace = (ox, oy, wob) => {
    ctx.beginPath(); ctx.moveTo(P[0][0] + ox, P[0][1] + oy); let acc = 0;
    for (let i = 1; i < P.length; i++) {
      const d = seg[i - 1]; if (acc + d <= target) { ctx.lineTo(P[i][0] + ox + (wob ? (hrand(seed, i, 1) - 0.5) * wob : 0), P[i][1] + oy + (wob ? (hrand(seed, i, 2) - 0.5) * wob : 0)); acc += d; }
      else { const f = (target - acc) / d; ctx.lineTo(lerp(P[i - 1][0], P[i][0], f) + ox, lerp(P[i - 1][1], P[i][1], f) + oy); break; }
    }
    ctx.stroke();
  };
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  if (mode === 'pencil') { ctx.strokeStyle = rgba(col, 0.75); ctx.lineWidth = w * 0.8; trace(0, 0, 1.5); ctx.strokeStyle = rgba(col, 0.4); ctx.lineWidth = w * 0.6; trace(0.9, -0.7, 2.2); }
  else if (mode === 'holo') { ctx.strokeStyle = rgba(PAL.holo, 0.18); ctx.lineWidth = w * 4; trace(0, 0, 0); ctx.strokeStyle = col; ctx.lineWidth = w; trace(0, 0, 0); ctx.strokeStyle = rgba(PAL.holoCore, 0.8); ctx.lineWidth = w * 0.35; trace(0, 0, 0); }
  else { ctx.strokeStyle = col; ctx.lineWidth = w; trace(0, 0, 0); }
  ctx.restore();
  // pen tip
  if (p > 0 && p < 1) { const tip = pointAt(P, seg, target); ctx.save(); ctx.fillStyle = mode === 'pencil' ? PAL.graphite : mode === 'holo' ? PAL.holoCore : PAL.white; ctx.beginPath(); ctx.arc(tip[0], tip[1], w * 1.2, 0, TAU); ctx.fill(); ctx.restore(); }
}
function pointAt(P, seg, target) { let acc = 0; for (let i = 1; i < P.length; i++) { if (acc + seg[i - 1] >= target) { const f = (target - acc) / seg[i - 1]; return [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)]; } acc += seg[i - 1]; } return P[P.length - 1]; }
export const line = (ctx, x0, y0, x1, y1, p, mode, o = {}) => path(ctx, [[x0, y0], [x1, y1]], p, mode, o);
export const rect = (ctx, x, y, w, h, p, mode, o = {}) => path(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], p, mode, { ...o, closed: true });

/** Hatching inside a polygon (45deg by default), lines revealed progressively. */
export function hatch(ctx, poly, p, mode = 'blue', { gap = 14, angle = -Math.PI / 4, w = 1.5, alpha = 0.7 } = {}) {
  if (p <= 0) return;
  const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const D = Math.hypot(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  ctx.save(); ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
  ctx.strokeStyle = rgba(INK[mode].line === PAL.graphite ? '#3a3934' : INK[mode].line, alpha); ctx.lineWidth = w;
  const n = Math.ceil(D * 2 / gap), ca = Math.cos(angle), sa = Math.sin(angle), shown = Math.floor(n * clamp(p));
  ctx.beginPath();
  for (let i = 0; i < shown; i++) { const o = -D + i * gap; const px = cx - sa * o, py = cy + ca * o; ctx.moveTo(px - ca * D, py - sa * D); ctx.lineTo(px + ca * D, py + sa * D); }
  ctx.stroke(); ctx.restore();
}
/** Dimension line with end ticks/arrows and a centred label; offset `off` perpendicular. */
export function dim(ctx, x0, y0, x1, y1, text, p, mode = 'blue', { off = 40, size = 28 } = {}) {
  if (p <= 0) return;
  const ink = INK[mode], dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const a = [x0 + nx * off, y0 + ny * off], b = [x1 + nx * off, y1 + ny * off];
  ctx.save(); ctx.globalAlpha *= clamp(p * 3);
  ctx.strokeStyle = ink.faint; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(a[0] + nx * 10, a[1] + ny * 10); ctx.moveTo(x1, y1); ctx.lineTo(b[0] + nx * 10, b[1] + ny * 10); ctx.stroke(); ctx.restore();
  const e = ease.inOutCubic(clamp(p)), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const ua = [lerp(m[0], a[0], e), lerp(m[1], a[1], e)], ub = [lerp(m[0], b[0], e), lerp(m[1], b[1], e)];
  ctx.save(); ctx.strokeStyle = ink.dim; ctx.fillStyle = ink.dim; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ua[0], ua[1]); ctx.lineTo(ub[0], ub[1]); ctx.stroke();
  const ux = dx / L, uy = dy / L;
  for (const [pt, s] of [[ua, 1], [ub, -1]]) { ctx.beginPath(); ctx.moveTo(pt[0], pt[1]); ctx.lineTo(pt[0] + s * ux * 16 + nx * 6, pt[1] + s * uy * 16 + ny * 6); ctx.lineTo(pt[0] + s * ux * 16 - nx * 6, pt[1] + s * uy * 16 - ny * 6); ctx.closePath(); ctx.fill(); }
  if (p > 0.5) {
    ctx.translate(m[0], m[1]); let ang = Math.atan2(dy, dx); if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI; ctx.rotate(ang);
    ctx.font = `700 ${size}px 'JetBrains Mono'`; const tw = ctx.measureText(text).width;
    ctx.fillStyle = mode === 'pencil' ? PAL.paper : mode === 'holo' ? PAL.holoBg : PAL.prussian;
    ctx.fillRect(-tw / 2 - 8, -size * 0.65, tw + 16, size * 1.3);
    ctx.globalAlpha *= clamp((p - 0.5) * 3); ctx.fillStyle = ink.text; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 1);
  }
  ctx.restore();
}
/** Mono annotation typed on (p 0..1), optional leader line from (lx,ly). */
export function note(ctx, text, x, y, p, mode = 'blue', { size = 28, align = 'left', color = null, weight = 400, leader = null, font = 'JetBrains Mono' } = {}) {
  if (p <= 0) return;
  const ink = INK[mode], n = Math.ceil(text.length * clamp(p));
  ctx.save();
  if (leader) { ctx.strokeStyle = ink.faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(leader[0], leader[1]); ctx.lineTo(x + (align === 'left' ? -10 : 10), y); ctx.stroke(); ctx.fillStyle = ink.dim; ctx.beginPath(); ctx.arc(leader[0], leader[1], 4, 0, TAU); ctx.fill(); }
  ctx.font = `${weight} ${size}px '${font}'`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color || ink.text;
  if (mode === 'holo') { ctx.shadowColor = PAL.holo; ctx.shadowBlur = 10; }
  ctx.fillText(text.slice(0, n), x, y); ctx.restore();
}
/** FIG. label block in the top-left corner + sheet number top-right. */
export function figLabel(ctx, fig, title, mode, p = 1, sheetNo = '') {
  if (p <= 0) return;
  note(ctx, `FIG. ${fig} — ${title}`, 70, 165, p, mode, { size: 30, weight: 700 });
  ctx.save(); ctx.globalAlpha *= clamp(p * 2); ctx.strokeStyle = INK[mode].faint; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(70, 190); ctx.lineTo(70 + 600 * clamp(p), 190); ctx.stroke(); ctx.restore();
  if (sheetNo) note(ctx, sheetNo, 1010, 165, p, mode, { size: 24, align: 'right' });
}
/** Rubber-stamp-like box label (rotated), e.g. TEORI. */
export function stamp(ctx, text, x, y, p, { color = PAL.stamp, size = 56, rot = -0.12 } = {}) {
  if (p <= 0) return;
  const k = ease.outBack(clamp(p), 2.5), s = lerp(1.6, 1, clamp(p));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= clamp(p * 2);
  ctx.font = `700 ${size}px 'Space Mono'`; const w = ctx.measureText(text).width + size * 0.9, h = size * 1.4;
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 2; ctx.strokeRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2); ctx.restore();
  return k;
}

// ------------------------------------------------------------------ subjects
/** Pyramid elevation: base centre (cx, by), width w, height h. p draws outline; courses 0..1 stacks course lines. */
export function pyramid(ctx, cx, by, w, h, p, mode, { courses = 0, nC = 24, hatchP = 0 } = {}) {
  const L = [cx - w / 2, by], T = [cx, by - h], R = [cx + w / 2, by];
  path(ctx, [L, T, R], p, mode, { w: 3.5, seed: 7 });
  line(ctx, L[0] - 60, by, R[0] + 60, by, clamp(p * 2), mode, { w: 2 });
  const shown = Math.floor(nC * clamp(courses));
  ctx.save(); ctx.strokeStyle = INK[mode].faint; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 1; i <= shown; i++) { const y = by - (h * i) / (nC + 1), hw = (w / 2) * (1 - i / (nC + 1)); ctx.moveTo(cx - hw, y); ctx.lineTo(cx + hw, y); }
  // block joints (staggered verticals) on the lower courses
  for (let i = 0; i < shown; i++) { const y0 = by - (h * i) / (nC + 1), y1 = by - (h * (i + 1)) / (nC + 1), hw = (w / 2) * (1 - (i + 1) / (nC + 1)); for (let x = cx - hw + ((i % 2) * 14); x < cx + hw - 10; x += 28 + (i % 3) * 6) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); } }
  ctx.stroke(); ctx.restore();
  if (hatchP > 0) hatch(ctx, [L, T, [cx, by]], hatchP, mode, { gap: 12, alpha: 0.35 });
  return { L, T, R };
}
/** Stone block (side view) with hatching. */
export function block(ctx, x, y, w, h, p, mode, { hatchP = 1 } = {}) {
  rect(ctx, x, y, w, h, p, mode, { w: 3 });
  if (p > 0.6) hatch(ctx, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], hatchP * clamp((p - 0.6) * 2.5), mode, { gap: 13, alpha: 0.5 });
}
/** Wooden sledge (side view): runners curving up at the front (right). */
export function sledge(ctx, x, y, w, p, mode) {
  path(ctx, [[x, y], [x + w - 40, y], [x + w - 10, y - 10], [x + w + 10, y - 34]], p, mode, { w: 3.5 });
  path(ctx, [[x, y - 18], [x + w - 30, y - 18]], p, mode, { w: 2.5 });
  for (let k = 0; k < 4; k++) line(ctx, x + 20 + k * (w - 60) / 3, y - 18, x + 20 + k * (w - 60) / 3, y, p, mode, { w: 2 });
}
/** Mannequin worker (technical figure) leaning forward and pulling; phase drives the walk cycle. dir 1 = facing right. */
export function worker(ctx, x, y, s, phase, mode, { dir = 1, lean = 0.45, alpha = 1, pour = false } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.scale(s * dir, s);
  ctx.strokeStyle = INK[mode].line; ctx.lineWidth = 3.2 / s; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const sw = Math.sin(phase * TAU), hipY = -70, sh = [Math.sin(lean) * 62, hipY - Math.cos(lean) * 62];
  // legs
  ctx.beginPath();
  for (const k of [1, -1]) { const a = sw * 0.45 * k; const kx = Math.sin(a) * 36, ky = hipY + Math.cos(a) * 36; ctx.moveTo(0, hipY); ctx.lineTo(kx, ky); ctx.lineTo(kx + Math.sin(a - 0.3 * (k > 0 ? 1 : 0)) * 34, 0); }
  // torso + head
  ctx.moveTo(0, hipY); ctx.lineTo(sh[0], sh[1]); ctx.stroke();
  ctx.beginPath(); ctx.arc(sh[0] + Math.sin(lean) * 16, sh[1] - Math.cos(lean) * 16, 11, 0, TAU); ctx.stroke();
  // arms back to the rope (pulling) or forward pouring
  ctx.beginPath();
  if (pour) { ctx.moveTo(sh[0], sh[1] + 6); ctx.lineTo(sh[0] + 30, sh[1] + 10); ctx.lineTo(sh[0] + 48, sh[1] - 4); }
  else { ctx.moveTo(sh[0], sh[1] + 6); ctx.lineTo(sh[0] - 22, sh[1] + 30); ctx.lineTo(sh[0] - 50, sh[1] + 34); }
  ctx.stroke(); ctx.restore();
  return [x + dir * s * (sh[0] - 50), y + s * (sh[1] + 34)]; // hand position (rope)
}
/** Simple wheel icon (for "no wheel"). */
export function wheel(ctx, x, y, r, p, mode) {
  ctx.save(); ctx.strokeStyle = INK[mode].line; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(p)); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, TAU * clamp(p)); ctx.stroke();
  if (p > 0.5) { ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k * TAU / 6; ctx.moveTo(x + Math.cos(a) * r * 0.18, y + Math.sin(a) * r * 0.18); ctx.lineTo(x + Math.cos(a) * r * lerp(0.18, 1, clamp((p - 0.5) * 2)), y + Math.sin(a) * r * lerp(0.18, 1, clamp((p - 0.5) * 2))); } ctx.stroke(); }
  ctx.restore();
}
/** Red cross-out (draws on). */
export function crossOut(ctx, x, y, r, p, color = PAL.redPencil) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 9; ctx.lineCap = 'round';
  const a = clamp(p * 2), b = clamp(p * 2 - 1);
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); ctx.stroke();
  if (b > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); ctx.stroke(); }
  ctx.restore();
}
/** Wireframe square pyramid projected in 3D (yaw rotation), for the hologram. Returns apex screen pos. */
export function wirePyramid(ctx, cx, cy, size, yaw, p, mode = 'holo', { pitch = 0.42, hgt = 0.64 } = {}) {
  const V = [[-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1], [0, -hgt * 2, 0]];
  const P = V.map(([x, y, z]) => { const X = x * Math.cos(yaw) - z * Math.sin(yaw), Z = x * Math.sin(yaw) + z * Math.cos(yaw); const Y = y * Math.cos(pitch) - Z * Math.sin(pitch); return [cx + X * size, cy + Y * size]; });
  const E = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]];
  E.forEach(([a, b], k) => line(ctx, P[a][0], P[a][1], P[b][0], P[b][1], clamp(p * E.length - k * 0.6), mode, { w: 3 }));
  // course lines on the two front faces
  ctx.save(); ctx.strokeStyle = rgba(PAL.holo, 0.28); ctx.lineWidth = 1.2; ctx.globalAlpha *= clamp(p * 1.5 - 0.5); ctx.beginPath();
  for (let i = 1; i < 14; i++) { const f = i / 14; for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0]]) { const A = [lerp(P[a][0], P[4][0], f), lerp(P[a][1], P[4][1], f)], B = [lerp(P[b][0], P[4][0], f), lerp(P[b][1], P[4][1], f)]; ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); } }
  ctx.stroke(); ctx.restore();
  return P;
}
