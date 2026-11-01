// AniMasters style kit: FLIPBOOK (a spiral notebook riffled under the thumb).
// Top-down on a wooden desk: a small notebook held by two hands; the right thumb lifts the bottom corner and the
// pages flip up towards the spiral binding, one page per drawing (12 per second, the choppy flipbook rhythm).
// Every page is drawn by hand in blue ballpoint, so each page's line wobbles a little differently; the page
// below shows through (onion skin) while a new page is drawn. Extras: ballpoint pen, film strip, patent card.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  desk: '#9a6a40', deskDark: '#6e4626', paper: '#fbf8ef', paperEdge: '#e7e1d2', ink: '#2647a3', inkDark: '#1b357c',
  skin: '#f1c29a', skinShade: '#d99f78', skinLine: '#9a5f3e', red: '#d6452f', ring: '#8d9097', sepia: '#e9d9b4',
};
export const PAGE = { w: 620, h: 820 };

// ---------------------------------------------------------------- desk
export function deskTile(S = 512) {
  return cached('fb-desk', () => {
    const c = makeCanvas(S, S), g = c.getContext('2d'), r = mulberry32(3);
    g.fillStyle = PAL.desk; g.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 2) {
      const n = noise.n2(0.5, y * 0.03) * 0.5 + noise.n2(3, y * 0.11) * 0.3;
      g.fillStyle = n > 0 ? `rgba(255,220,170,${n * 0.10})` : `rgba(60,30,10,${-n * 0.16})`; g.fillRect(0, y, S, 2);
    }
    g.strokeStyle = 'rgba(70,40,15,0.22)'; g.lineWidth = 1.2;
    for (let i = 0; i < 26; i++) { const y0 = r() * S; g.beginPath(); for (let x = 0; x <= S; x += 16) g.lineTo(x, y0 + Math.sin(x / S * TAU * 2 + i) * 4 + noise.n2(x * 0.01, i) * 6); g.stroke(); }
    const id = g.getImageData(0, 0, S, S), d = id.data; for (let i = 0; i < d.length; i += 4) { const k = (r() - 0.5) * 10; d[i] += k; d[i + 1] += k; d[i + 2] += k; } g.putImageData(id, 0, 0);
    return c;
  });
}
export function desk(ctx) {
  const [vx, vy, vw, vh] = viewRect(ctx, 4);
  if (!ctx.__deskPat) ctx.__deskPat = ctx.createPattern(deskTile(), 'repeat');
  ctx.fillStyle = ctx.__deskPat; ctx.fillRect(vx, vy, vw, vh);
}
export function viewRect(ctx, pad = 30) {
  const m = ctx.getTransform().inverse(), W = ctx.canvas.width, H = ctx.canvas.height;
  const pts = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2];
}
export function cam(ctx, x, y, z = 1, rot = 0, fy = 760) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(540, fy); ctx.rotate(rot); ctx.scale(z, z); ctx.translate(-x, -y); }

// ---------------------------------------------------------------- ink lines
export function track(pts, step = 5) {
  const out = [pts[0][0], pts[0][1]]; let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    if (L < 1e-6) continue; let d = step - carry;
    while (d <= L) { out.push(ax + (dx * d) / L, ay + (dy * d) / L); d += step; }
    carry = L - (d - step);
  }
  const l = pts[pts.length - 1]; out.push(l[0], l[1]);
  const n = out.length / 2, cum = new Float32Array(n); for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(out[2 * i] - out[2 * i - 2], out[2 * i + 1] - out[2 * i - 1]);
  return { xy: out, cum, n, len: cum[n - 1] || 0.001 };
}
/** Trace a polyline up to fraction u with a hand wobble that is fixed per `seed` (one hand-drawn page). Returns the tip. */
export function inkPath(ctx, pts, { u = 1, seed = 1, amp = 1.6 } = {}) {
  const tr = track(pts, 6), L = u * tr.len; let tip = [tr.xy[0], tr.xy[1]];
  for (let i = 0; i < tr.n; i++) {
    const k = tr.cum[i] / 70, j = noise.n2(k + seed * 3.7, seed * 1.3) * amp, j2 = noise.n2(k + seed * 1.1, seed * 5.9) * amp;
    let x = tr.xy[2 * i] + j, y = tr.xy[2 * i + 1] + j2;
    if (tr.cum[i] > L) { const f = (L - tr.cum[i - 1]) / Math.max(1e-6, tr.cum[i] - tr.cum[i - 1]); x = lerp(tip[0], x, f); y = lerp(tip[1], y, f); ctx.lineTo(x, y); return [x, y]; }
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    tip = [x, y];
  }
  return tip;
}
/** Ballpoint stroke: a slightly translucent line and a thinner darker core. */
export function inkStroke(ctx, w = 4, col = PAL.ink, alpha = 1) {
  alpha *= ctx.__inkAlpha ?? 1;
  ctx.strokeStyle = col; ctx.globalAlpha = alpha * 0.75; ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = PAL.inkDark; ctx.globalAlpha = alpha * 0.5; ctx.lineWidth = w * 0.45; ctx.stroke();
}

// ---------------------------------------------------------------- stick figure (flipbook hero)
/**
 * pose: {x, y (feet), s, lean, arms:[[a1,a2],[a1,a2]], legs:[[a1,a2],[a1,a2]], face:'smile'|'open'|'happy'|'wow', look, cape}
 * Angles: 0 = straight down, positive toward +x. Returns [[pts, w], ...].
 */
export function stick(p) {
  const { x, y, s = 1, lean = 0, look = 0.3, face = 'smile', cape = 0 } = p;
  const arms = p.arms || [[0.3, 0.2], [-0.3, -0.2]], legs = p.legs || [[0.15, 0], [-0.15, 0]];
  const R = (px, py) => [x + (px * Math.cos(lean) - py * Math.sin(lean)) * s, y + (px * Math.sin(lean) + py * Math.cos(lean)) * s];
  const out = [], hip = [0, -110], neck = [0, -230], hc = [0, -282], hr = 48;
  for (const [a1, a2] of legs) { const k = [Math.sin(a1) * 60, hip[1] + Math.cos(a1) * 60], f = [k[0] + Math.sin(a1 + a2) * 58, k[1] + Math.cos(a1 + a2) * 58]; out.push([[R(...hip), R(...k), R(...f)], 5]); }
  out.push([[R(...hip), R(...neck)], 5]);
  for (const [a1, a2] of arms) { const sh = [0, -215], e = [Math.sin(a1) * 55, sh[1] + Math.cos(a1) * 55], h = [e[0] + Math.sin(a1 + a2) * 52, e[1] + Math.cos(a1 + a2) * 52]; out.push([[R(...sh), R(...e), R(...h)], 5]); }
  if (cape) out.push([[R(-4, -226), R(-60 - cape * 40, -200 + Math.sin(cape * 9) * 10), R(-90 - cape * 50, -150), R(-10, -150)], 4]);
  const circ = (cx, cy, r, n = 24) => { const q = []; for (let i = 0; i <= n; i++) { const a = -1.7 + (i / n) * (TAU + 0.2); q.push(R(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); } return q; };
  out.push([circ(hc[0], hc[1], hr), 5]);
  const ex = look * 10;
  out.push([circ(hc[0] - 15 + ex, hc[1] - 6, 3, 6), 6]); out.push([circ(hc[0] + 15 + ex, hc[1] - 6, 3, 6), 6]);
  const arc = (cx, cy, rx, ry, a0, a1) => { const q = []; for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); q.push(R(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry)); } return q; };
  if (face === 'open' || face === 'wow') out.push([circ(hc[0] + ex * 0.8, hc[1] + 22, face === 'wow' ? 10 : 7, 12), 4]);
  else out.push([arc(hc[0] + ex * 0.8, hc[1] + 12, face === 'happy' ? 18 : 14, face === 'happy' ? 14 : 10, 0.25, Math.PI - 0.25), 4]);
  out.push([[R(-6, hc[1] - hr + 2), R(-12, hc[1] - hr - 20)], 4]); out.push([[R(6, hc[1] - hr + 1), R(10, hc[1] - hr - 22)], 4]);
  return out;
}
/** Draw a stick figure in ballpoint. seed = which page (fixed wobble per page). reveal 0..1 draws it on; returns the pen tip. */
export function inkStick(ctx, pose, { seed = 1, reveal = 1, alpha = 1, w = 1 } = {}) {
  const parts = stick(pose); let budget = reveal * parts.length, tip = null;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  parts.forEach(([pts, lw], i) => {
    if (budget <= 0) return; const u = clamp(budget); budget -= 1;
    ctx.beginPath(); const tp = inkPath(ctx, pts, { u, seed: seed * 13 + i, amp: 2.2 * (pose.s || 1) });
    inkStroke(ctx, lw * (pose.s || 1) * w, PAL.ink, alpha);
    if (u < 1) tip = tp;
  });
  ctx.restore();
  return tip;
}

// ---------------------------------------------------------------- the notebook
/**
 * Draw the flipbook. o: {x, y (centre), s, page(g, i, opts) -> draws page i content in page-local coords (0..PAGE.w, 0..PAGE.h),
 *   top: index of the page lying flat on top, flip: 0..1 (the page above `top` lifting away; null = none), ghost: index shown through,
 *   stack: number of pages under, cache: true to cache page renders}
 */
export function book(ctx, o) {
  const { x, y, s = 1, page, top = 0, flip = null, ghost = null, stack = 26, cache = true, live = null } = o;
  const W = PAGE.w, H = PAGE.h;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);
  // shadow + stack edges (right and bottom)
  const sh = cached('fb-bookshadow', () => { const c = makeCanvas(90, 110), g = c.getContext('2d'); g.fillStyle = 'rgba(30,15,5,0.55)'; g.filter = 'blur(6px)'; g.fillRect(12, 12, 66, 86); return c; });
  ctx.drawImage(sh, -60, -50, W + 150, H + 160);
  const depth = Math.min(stack, 26);
  ctx.fillStyle = '#3d5a8a'; ctx.fillRect(depth * 0.55 + 3, depth * 0.9 + 3, W, H); // back cover peeking
  for (let i = depth; i > 0; i -= 2) { ctx.fillStyle = i % 4 ? PAL.paper : PAL.paperEdge; ctx.fillRect(i * 0.55, i * 0.9, W, H); ctx.strokeStyle = 'rgba(120,100,70,0.22)'; ctx.lineWidth = 1; ctx.strokeRect(i * 0.55, i * 0.9, W, H); }
  // the top page
  const pg = (i, opts = {}) => pageImage(i, page, cache && !opts.live);
  ctx.fillStyle = PAL.paper; ctx.fillRect(0, 0, W, H);
  if (ghost !== null) { ctx.globalAlpha = 0.2; ctx.drawImage(pg(ghost), 0, 0, W, H); ctx.globalAlpha = 1; }
  if (live) live(ctx); else ctx.drawImage(pg(top), 0, 0, W, H);
  // the lifting page (page above `top`, i.e. index top-1 in riffle order is given by flip.page)
  if (flip && flip.f > 0 && flip.f < 1) {
    const f = flip.f, hh = H * (1 - f) * (1 - f * 0.15);
    // shadow it casts
    ctx.fillStyle = `rgba(40,30,20,${0.22 * (1 - f)})`; ctx.fillRect(0, 0, W, hh + 30 * (1 - f));
    ctx.save(); ctx.beginPath();
    const curl = 60 * Math.sin(f * Math.PI);
    ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, hh - curl * 0.6); ctx.quadraticCurveTo(W * 0.7, hh + curl * 0.3, 0, hh); ctx.closePath(); ctx.clip();
    ctx.drawImage(pg(flip.page), 0, 0, W, hh + curl);
    const gr = ctx.createLinearGradient(0, 0, 0, hh + curl); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, `rgba(90,70,40,${0.25 + 0.25 * f})`);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, hh + curl);
    ctx.restore();
    // curled edge highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W, hh - curl * 0.6); ctx.quadraticCurveTo(W * 0.7, hh + curl * 0.3, 0, hh); ctx.stroke();
  }
  // spiral binding
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, 0, W, 34);
  for (let i = 0; i < 15; i++) {
    const rx = 26 + i * ((W - 52) / 14);
    ctx.fillStyle = '#5b4a3a'; ctx.beginPath(); ctx.arc(rx, 22, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.ring; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(rx, 6, 7, 20, 0, Math.PI * 0.1, Math.PI * 1.1); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(rx - 1, 6, 5, 17, 0, Math.PI * 0.3, Math.PI * 0.9); ctx.stroke();
  }
  ctx.restore();
}
const PAGE_RES = 0.8;
function pageImage(i, painter, useCache) {
  const build = () => {
    const c = makeCanvas(Math.round(PAGE.w * PAGE_RES), Math.round(PAGE.h * PAGE_RES)), g = c.getContext('2d');
    g.fillStyle = PAL.paper; g.fillRect(0, 0, c.width, c.height);
    // paper tooth + a faint page number in the corner
    const r = mulberry32(i + 7);
    for (let k = 0; k < 120; k++) { g.fillStyle = `rgba(140,120,90,${0.05 * r()})`; g.fillRect(r() * c.width, r() * c.height, 2, 2); }
    g.scale(PAGE_RES, PAGE_RES);
    g.fillStyle = 'rgba(80,90,130,0.45)'; g.font = "400 26px 'Caveat'"; g.textAlign = 'right'; g.fillText(String(i + 1), PAGE.w - 24, PAGE.h - 22);
    painter(g, i);
    return c;
  };
  return useCache ? cached('fb-page:' + painter.__key + ':' + i, build) : build();
}

// ---------------------------------------------------------------- hands, pen
/** Left hand holding the book's left edge: four fingers over the cover edge, palm below (flat cartoon hand). */
export function leftHand(ctx, x, y, { s = 1, rot = 0.25 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  handShape(ctx, [[-72, -10, 144, 190, 60], [-68, -112, 34, 140, 17], [-32, -132, 34, 160, 17], [4, -128, 34, 156, 17], [40, -104, 32, 130, 16], [64, 10, 40, 120, 20, -0.7]]);
  ctx.restore();
}
/** Right hand: a fist below the book's bottom-right corner with the thumb on the pages (lifts while riffling). */
export function rightThumb(ctx, x, y, { s = 1, lift = 0, rot = -0.5 } = {}) {
  ctx.save(); ctx.translate(x, y - lift * 12); ctx.rotate(rot - lift * 0.07); ctx.scale(s, s);
  handShape(ctx, [[-80, 0, 170, 200, 70], [-30, -150, 50, 190, 25]], lift);
  ctx.restore();
}
/** Union of rounded boxes [x, y, w, h, r, rot?] with one outline, a soft shadow, nails on the slim ones. */
function handShape(ctx, boxes, lift = 0) {
  const path = (g, [bx, by, bw, bh, br, brot = 0], grow = 0) => {
    g.save(); g.translate(bx + bw / 2, by + bh / 2); g.rotate(brot); rr(g, -bw / 2 - grow, -bh / 2 - grow, bw + grow * 2, bh + grow * 2, br + grow); g.restore();
  };
  ctx.save(); ctx.translate(16 + lift * 10, 22 + lift * 14); ctx.fillStyle = 'rgba(35,18,6,0.28)';
  for (const b of boxes) { path(ctx, b, 4); ctx.fill(); } ctx.restore();
  ctx.fillStyle = PAL.skinLine; for (const b of boxes) { path(ctx, b, 4); ctx.fill(); }
  ctx.fillStyle = PAL.skin; for (const b of boxes) { path(ctx, b); ctx.fill(); }
  ctx.fillStyle = 'rgba(200,120,90,0.18)'; path(ctx, boxes[0], -18); ctx.fill();
  for (const b of boxes.slice(1)) { if (b[2] > 60) continue; const [bx, by, bw, bh, br, brot = 0] = b; ctx.save(); ctx.translate(bx + bw / 2, by + bh / 2); ctx.rotate(brot); ctx.fillStyle = 'rgba(255,240,230,0.75)'; rr(ctx, -bw / 2 + 6, -bh / 2 + 6, bw - 12, bw * 0.7, bw * 0.3); ctx.fill(); ctx.restore(); }
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
/** Blue ballpoint pen with the tip at (x,y). */
export function pen(ctx, x, y, { ang = -1.0, lift = 0, s = 1 } = {}) {
  ctx.save(); ctx.translate(x + (12 + lift * 30) * s, y + (16 + lift * 36) * s); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(40,20,10,0.25)'; rr(ctx, 10, -12, 420, 24, 12); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(x, y - lift * 16 * s); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = '#c9ccd2'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26, -6); ctx.lineTo(26, 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a2d33'; ctx.beginPath(); ctx.arc(1, 0, 2.5, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(0, -13, 0, 13); g.addColorStop(0, '#fbfbfb'); g.addColorStop(0.5, '#e5e7ea'); g.addColorStop(1, '#b4b8bf');
  ctx.fillStyle = g; rr(ctx, 26, -12, 360, 24, 6); ctx.fill();
  ctx.fillStyle = 'rgba(40,70,160,0.35)'; ctx.fillRect(60, -4, 300, 8); // ink tube
  ctx.fillStyle = PAL.ink; rr(ctx, 300, -14, 110, 28, 8); ctx.fill(); ctx.fillRect(330, -18, 90, 6); // cap + clip
  ctx.restore();
}

// ---------------------------------------------------------------- film strip, patent card, ink text
/** Vertical film strip: frames drawn by `frame(g, k, w, h)`; offset scrolls it. */
export function filmStrip(ctx, x, y, { w = 300, fh = 240, n = 6, offset = 0, frame, from = 0 } = {}) {
  const H = n * fh;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(20,10,5,0.35)'; ctx.fillRect(14, 18, w, H);
  ctx.fillStyle = '#1d1a18'; ctx.fillRect(0, 0, w, H);
  ctx.beginPath(); ctx.rect(0, 0, w, H); ctx.clip();
  const o = ((offset % fh) + fh) % fh, k0 = Math.floor(offset / fh);
  for (let i = -1; i <= n; i++) {
    const yy = i * fh - o, k = from + k0 + i;
    ctx.fillStyle = '#efe9d8'; ctx.fillRect(48, yy + 14, w - 96, fh - 28);
    ctx.save(); ctx.translate(48, yy + 14); ctx.beginPath(); ctx.rect(0, 0, w - 96, fh - 28); ctx.clip(); frame(ctx, k, w - 96, fh - 28); ctx.restore();
    ctx.fillStyle = '#efe9d8'; for (let q = 0; q < 4; q++) { rr(ctx, 14, yy + 18 + q * (fh / 4), 20, 30, 5); ctx.fill(); rr(ctx, w - 34, yy + 18 + q * (fh / 4), 20, 30, 5); ctx.fill(); }
  }
  ctx.restore();
}
/** An old patent sheet (sepia) with a title, a year and a red stamp that thumps in at `stamp` 0..1. */
export function patentCard(ctx, x, y, { rot = -0.06, title = 'KINEOGRAF', year = '1868', sub = '', stamp = 0, s = 1, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(30,15,5,0.35)'; ctx.fillRect(-250 + 12, -170 + 16, 500, 340);
  ctx.fillStyle = PAL.sepia; ctx.fillRect(-250, -170, 500, 340);
  const tex = cached('fb-sepia', () => { const c = makeCanvas(250, 170), g = c.getContext('2d'), r = mulberry32(4); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(120,80,30,${0.08 * r()})`; g.fillRect(r() * 250, r() * 170, 2, 2); } const gr = g.createRadialGradient(125, 85, 40, 125, 85, 160); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(120,70,20,0.35)'); g.fillStyle = gr; g.fillRect(0, 0, 250, 170); return c; });
  ctx.drawImage(tex, -250, -170, 500, 340);
  ctx.strokeStyle = 'rgba(90,60,30,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(-232, -152, 464, 304);
  ctx.fillStyle = '#4a3418'; ctx.textAlign = 'center';
  ctx.font = "700 26px 'EB Garamond'"; ctx.fillText('PATEN · INGGRIS', 0, -110);
  ctx.font = "700 76px 'EB Garamond'"; ctx.fillText(title, 0, -30);
  ctx.font = "italic 400 34px 'EB Garamond'"; ctx.fillText(sub, 0, 24);
  ctx.strokeStyle = 'rgba(74,52,24,0.5)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-180, 70 + i * 22); ctx.lineTo(180 - i * 40, 70 + i * 22); ctx.stroke(); }
  if (stamp > 0) {
    const k = stamp < 1 ? 1 + (1 - ease.outBack(stamp)) * 0.6 : 1;
    ctx.save(); ctx.translate(150, 90); ctx.rotate(-0.25); ctx.scale(k, k); ctx.globalAlpha = alpha * Math.min(1, stamp * 2) * 0.85;
    ctx.strokeStyle = PAL.red; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(0, 0, 96, 58, 0, 0, TAU); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 82, 46, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = PAL.red; ctx.font = "700 52px 'EB Garamond'"; ctx.textBaseline = 'middle'; ctx.fillText(year, 0, 2);
    ctx.restore();
  }
  ctx.restore();
}
/** Handwriting in ink with a left-to-right reveal (u 0..1). Returns the pen tip. */
export function inkText(ctx, str, x, y, { size = 60, u = 1, col = PAL.ink, font = 'Caveat', align = 'center', alpha = 1 } = {}) {
  ctx.save(); ctx.font = `700 ${size}px '${font}'`; const W = ctx.measureText(str).width;
  const x0 = align === 'center' ? x - W / 2 : align === 'right' ? x - W : x;
  ctx.beginPath(); ctx.rect(x0 - 10, y - size, (W + 20) * u, size * 1.5); ctx.clip();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = alpha * 0.92; ctx.fillStyle = col; ctx.fillText(str, x0, y);
  ctx.restore();
  return [x0 + W * u, y - size * 0.3 + Math.sin(u * str.length * Math.PI) * size * 0.12];
}
export { clamp, lerp, ease, hrand, noise, TAU };
