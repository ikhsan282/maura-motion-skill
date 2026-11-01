// Maura Motion style kit: BUKU POP-UP (a real pop-up book on a wooden table).
// The book stands open at 90°: a vertical back leaf (printed backdrop) and a flat floor leaf. Pop-up pieces are
// printed card cut-outs hinged to the floor; they stay parallel to the back leaf (parallel-fold mechanism), so
// when a page turns they fold flat and the next spread's pieces rise. Everything is a planar quad projected
// with a real perspective camera; light comes from the front-left, pieces cast soft shadows on the floor and
// the back leaf, and a piece's brightness follows its angle (the fold shading).
// Signature moves: page flips forward over the camera, pieces fold up from flat with a little overshoot,
// figures slide along slots (pull-tab mechanics), arms swing on split pins, a volvelle counter wheel.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, paperTexture, alphaTexture } from '/engine/lib/draw.js';

export const PAL = {
  wood: '#7a4a2a', woodDk: '#4f2d18', woodHi: '#a06a3e', cover: '#9e2b25', coverDk: '#6e1b18',
  paper: '#f6efdf', paperDk: '#e4d6b8', ink: '#3a2a1e', night: '#1f2a52', nightHi: '#3c4f8a', dawn: '#f2a65a', dawnHi: '#fbd38a',
  sky: '#9fd0e6', skyHi: '#dff0f4', grass: '#7fae5a', grassDk: '#5d8a40', stone: '#9a8f86', stoneDk: '#6d635c', stoneHi: '#c4bbb1',
  gold: '#e3a531', goldHi: '#f7d77a', red: '#b8342b', skin: '#c98b5d', skinDk: '#a46a42', hair: '#2a1d17', jin: '#2f3a7a', jinHi: '#5d6fd0',
  batik: '#7a4a24', batikHi: '#d9b26a', fire: '#f07a2a', fireHi: '#ffd36a', moon: '#fff4cf',
};

// ---------------- camera & projection ----------------
// World units: book spine along x at y=0,z=0. Back leaf: plane z=0, y 0..HB. Floor leaf: plane y=0, z 0..DF.
export const BOOK = { W: 1000, HB: 960, DF: 780 };
let CAM = null;
/** Set the camera for this frame. pos/look in world units; f = focal length in px. */
export function camera({ pos = [0, 1250, 2350], look = [0, 420, 260], f = 1520, cx = 540, cy = 930, roll = 0 } = {}) {
  const fw = norm(sub(look, pos)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw);
  CAM = { pos, fw, rt, up, f, cx, cy, roll };
  return CAM;
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
export const V3 = { sub, add, mul, dot, cross, norm };
export function project(p) {
  const d = sub(p, CAM.pos), zc = Math.max(1, dot(d, CAM.fw));
  let x = (CAM.f * dot(d, CAM.rt)) / zc, y = (-CAM.f * dot(d, CAM.up)) / zc;
  if (CAM.roll) { const c = Math.cos(CAM.roll), s = Math.sin(CAM.roll); [x, y] = [x * c - y * s, x * s + y * c]; }
  return [CAM.cx + x, CAM.cy + y, zc];
}
export const LIGHT = norm([-0.35, 0.8, 0.55]); // towards the light (front-left, above)

/**
 * Draw an image as a planar quad: O = 3D bottom-left of the image, U = 3D vector along its width, V = along its
 * height (image top = O+V). n = strips (perspective accuracy). shade = darken 0..1, or 'auto' (by angle to light).
 */
export function quad(ctx, img, O, U, V, { n = 1, alpha = 1, shade = 'auto', sx = 0, sy = 0, sw = img.width, sh = img.height, flipU = false } = {}) {
  if (alpha <= 0.002) return;
  const pts = [];
  for (let i = 0; i <= n; i++) { const v = i / n; pts.push([project(add(O, mul(V, v))), project(add(add(O, U), mul(V, v)))]); }
  ctx.save(); ctx.globalAlpha *= alpha;
  for (let i = 0; i < n; i++) {
    const [BL, BR] = pts[i], [TL, TR] = pts[i + 1];
    const srcY = sy + sh * (1 - (i + 1) / n), srcH = sh / n;
    if (n > 2 && !flipU) { // big leaves: two exact triangles per strip (piecewise-linear perspective, no saw-tooth)
      const tri = (A, Bp, Cp, o, u, v) => {
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath();
        const mx = (A[0] + Bp[0] + Cp[0]) / 3, my = (A[1] + Bp[1] + Cp[1]) / 3;
        [A, Bp, Cp].forEach(([x, y], k) => { const dx = x - mx, dy = y - my, l = Math.hypot(dx, dy) || 1; k ? ctx.lineTo(x + dx / l * 0.7, y + dy / l * 0.7) : ctx.moveTo(x + dx / l * 0.7, y + dy / l * 0.7); });
        ctx.closePath(); ctx.clip();
        ctx.setTransform(u[0], u[1], v[0], v[1], o[0], o[1]);
        ctx.drawImage(img, sx, srcY, sw, srcH, 0, 0, 1, 1);
        ctx.restore();
      };
      tri(TL, TR, BL, TL, [TR[0] - TL[0], TR[1] - TL[1]], [BL[0] - TL[0], BL[1] - TL[1]]);
      tri(TR, BR, BL, [TR[0] + BL[0] - BR[0], TR[1] + BL[1] - BR[1]], [BR[0] - BL[0], BR[1] - BL[1]], [BR[0] - TR[0], BR[1] - TR[1]]);
      continue;
    }
    let ox = TL, ux = [TR[0] - TL[0], TR[1] - TL[1]], vx = [BL[0] - TL[0], BL[1] - TL[1]];
    if (flipU) { ox = TR; ux = [TL[0] - TR[0], TL[1] - TR[1]]; vx = [BR[0] - TR[0], BR[1] - TR[1]]; }
    ctx.setTransform(ux[0], ux[1], vx[0], vx[1], ox[0], ox[1]);
    ctx.drawImage(img, sx, srcY, sw, srcH, 0, 0, 1, 1 + (i < n - 1 ? 0.03 : 0));
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  let k = shade;
  if (shade === 'auto') { const nrm = norm(cross(U, V)); k = clamp(0.42 - Math.abs(dot(nrm, LIGHT)) * 0.42, 0, 0.42); }
  if (k > 0.005) {
    ctx.globalCompositeOperation = 'source-atop';
    // darken only where the quad was painted: use the projected polygon
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(40,22,10,${k})`;
    ctx.beginPath();
    const c = [pts[0][0], pts[0][1], pts[n][1], pts[n][0]];
    c.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    if (img.__mask) { ctx.save(); ctx.clip(); quadMask(ctx, img, pts, n, sx, sy, sw, sh, flipU, k); ctx.restore(); }
    else ctx.fill();
  }
  ctx.restore();
}
// shading for cut-out pieces: draw their silhouette (pre-baked dark mask) with alpha k
function quadMask(ctx, img, pts, n, sx, sy, sw, sh, flipU, k) {
  ctx.globalAlpha = k * 1.6;
  for (let i = 0; i < n; i++) {
    const [BL, BR] = pts[i], [TL, TR] = pts[i + 1];
    let ox = TL, ux = [TR[0] - TL[0], TR[1] - TL[1]], vx = [BL[0] - TL[0], BL[1] - TL[1]];
    if (flipU) { ox = TR; ux = [TL[0] - TR[0], TL[1] - TR[1]]; vx = [BR[0] - TR[0], BR[1] - TR[1]]; }
    ctx.setTransform(ux[0], ux[1], vx[0], vx[1], ox[0], ox[1]);
    ctx.drawImage(img.__mask, sx, sy + sh * (1 - (i + 1) / n), sw, sh / n, 0, 0, 1, 1);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
/** Fill a 3D polygon (projected). */
export function poly3(ctx, pts3, fill) {
  ctx.beginPath(); pts3.map(project).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
}

// ---------------- printed card art ----------------
/** A printed card canvas: draw(g, w, h) paints the art; the cut-out keeps its alpha; paper texture + a cream cut edge are added. */
export function card(key, w, h, draw, { edge = 3, cut = true, tex = 0.5 } = {}) {
  return cached('pu-card:' + key, () => {
    const pad = edge + 2, c = makeCanvas(w + pad * 2, h + pad * 2), g = c.getContext('2d');
    const art = makeCanvas(w, h), ag = art.getContext('2d');
    draw(ag, w, h);
    // paper fibre printed over the art
    ag.save(); ag.globalCompositeOperation = 'source-atop'; ag.globalAlpha = tex;
    ag.drawImage(alphaTexture(paperTexture(512, 512, { base: '#808080', fiber: 0.14, blotch: 0.06, seed: 31, grainAmt: 30 }), 1), 0, 0, w, h);
    ag.restore();
    if (cut && edge > 0) { // cream cut edge (card thickness) around the silhouette
      for (let a = 0; a < 8; a++) g.drawImage(art, pad + Math.cos((a / 8) * TAU) * edge, pad + Math.sin((a / 8) * TAU) * edge);
      g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fbf5e6'; g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = 'source-over';
    }
    g.drawImage(art, pad, pad);
    const m = makeCanvas(c.width, c.height), mg = m.getContext('2d');
    mg.drawImage(c, 0, 0); mg.globalCompositeOperation = 'source-in'; mg.fillStyle = '#28160a'; mg.fillRect(0, 0, c.width, c.height);
    c.__mask = m;
    const s = makeCanvas(Math.ceil(c.width / 6) + 2, Math.ceil(c.height / 6) + 2); s.getContext('2d').drawImage(m, 1, 1, s.width - 2, s.height - 2);
    c.__shadow = s;
    c.__pad = pad;
    return c;
  });
}

/** A standing piece hinged at floor depth d. a = fold angle (0 flat towards the viewer .. PI/2 standing).
 *  base: optional {F, B} spread frame (defaults to the real floor and a vertical leaf). */
export function standee(ctx, img, x, d, w, h, a, { frame = null, alpha = 1, shadow = 0.32, lift = 0, flipU = false, n = 2 } = {}) {
  if (a <= 0.01) return;
  const F = frame ? frame.F : [0, 0, 1], B0 = frame ? frame.B : [0, 1, 0];
  // parallel fold: inside a turning spread the piece lies along F when a=0; on its own it folds back
  // towards the spine (top pointing at the back leaf), stands parallel to B when a=PI/2
  const flat = frame ? frame.F : [0, 0, -1];
  const dir = norm(add(mul(flat, Math.cos(a)), mul(B0, Math.sin(a))));
  const O = add(add(frame ? frame.O : [0, 0, 0], mul(F, d)), [x - w / 2, 0, 0]);
  const Ob = add(O, mul(dir, lift));
  if (shadow > 0 && a > 0.15 && !frame) floorShadow(ctx, img, O, w, h, a, shadow * alpha * Math.sin(a));
  quad(ctx, img, Ob, [w, 0, 0], mul(dir, h), { n, alpha, flipU });
}
/** Soft shadow of a standing piece on the floor (and up the back leaf when it reaches it). */
function floorShadow(ctx, img, O, w, h, a, k) {
  const s = img.__shadow; if (!s) return;
  // light direction projected: shadow falls back and to the right
  const L = [0.38, 0, -0.62];
  let len = h * Math.sin(a); // shadow length on floor
  const zEnd = O[2] - h * Math.cos(a) + L[2] * len;
  ctx.save(); ctx.globalAlpha *= k;
  if (zEnd >= 0) quad(ctx, s, O, [w, 0, 0], add(mul(L, len), [0, 0, -h * Math.cos(a)]), { shade: 0 });
  else {
    const frac = clamp(O[2] / Math.max(1, -L[2] * len)), floorV = add(mul(L, len * frac), [0, 0, 0]);
    // floor part
    quad(ctx, s, O, [w, 0, 0], [floorV[0], 0, -O[2]], { shade: 0, sy: s.height * (1 - frac), sh: s.height * frac });
    // wall part, climbing the back leaf
    const W0 = [O[0] + floorV[0], 0, 0.5];
    quad(ctx, s, W0, [w, 0, 0], [L[0] * len * (1 - frac), len * (1 - frac) * 0.9, 0], { shade: 0, sy: 0, sh: s.height * (1 - frac) });
  }
  ctx.restore();
}

// ---------------- the book, the table ----------------
/** Room + wooden table (screen space, cached). */
export function table(ctx, t, { warm = 1 } = {}) {
  const T = cached('pu-table', () => {
    const c = makeCanvas(540, 960), g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 960); gr.addColorStop(0, '#2a1a12'); gr.addColorStop(0.42, '#3d2618'); gr.addColorStop(0.43, PAL.woodDk); gr.addColorStop(1, PAL.wood);
    g.fillStyle = gr; g.fillRect(0, 0, 540, 960);
    const r = mulberry32(4);
    for (let i = 0; i < 90; i++) { // wood grain lines in perspective
      const x0 = r() * 900 - 180, y = 414 + Math.pow(r(), 0.7) * 560;
      g.strokeStyle = `rgba(${r() < 0.5 ? '40,20,8' : '170,110,60'},${0.08 + r() * 0.12})`; g.lineWidth = 0.6 + (y - 414) / 300;
      g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + 120, y + (r() - 0.5) * 6, x0 + 240, y + (r() - 0.5) * 8, x0 + 380, y + (r() - 0.5) * 4); g.stroke();
    }
    // warm lamp pool
    const lp = g.createRadialGradient(270, 520, 20, 270, 520, 520); lp.addColorStop(0, 'rgba(255,214,150,0.28)'); lp.addColorStop(1, 'rgba(0,0,0,0.35)');
    g.fillStyle = lp; g.fillRect(0, 0, 540, 960);
    return c;
  });
  ctx.drawImage(T, 0, 0, 1080, 1920);
}
/** Book boards, page stack and spine under the current spread. */
export function bookBase(ctx) {
  const { W, HB, DF } = BOOK, m = 26;
  // cover boards (cloth) slightly larger than the pages
  poly3(ctx, [[-W / 2 - m, 0, -14], [W / 2 + m, 0, -14], [W / 2 + m, HB + m, -14], [-W / 2 - m, HB + m, -14]], PAL.coverDk);
  poly3(ctx, [[-W / 2 - m, -2, 0], [W / 2 + m, -2, 0], [W / 2 + m, -2, DF + m], [-W / 2 - m, -2, DF + m]], PAL.cover);
  poly3(ctx, [[-W / 2 - m, -2, DF + m], [W / 2 + m, -2, DF + m], [W / 2 + m, -26, DF + m], [-W / 2 - m, -26, DF + m]], PAL.coverDk);
  // page stack edge (front): thin lines
  poly3(ctx, [[-W / 2, 0, DF], [W / 2, 0, DF], [W / 2, -12, DF + 4], [-W / 2, -12, DF + 4]], PAL.paperDk);
}
/** A page leaf as a cached canvas from an art function. */
export function leafArt(key, w, h, draw) {
  return cached('pu-leaf:' + key, () => {
    const c = makeCanvas(w, h), g = c.getContext('2d');
    g.fillStyle = PAL.paper; g.fillRect(0, 0, w, h);
    draw(g, w, h);
    g.globalAlpha = 0.5; g.drawImage(alphaTexture(paperTexture(512, 512, { base: '#808080', fiber: 0.14, blotch: 0.08, seed: 12, grainAmt: 26 }), 1), 0, 0, w, h);
    g.globalAlpha = 1;
    // gutter shadow near the spine / edge darkening
    const gr = g.createLinearGradient(0, h, 0, h - 60); gr.addColorStop(0, 'rgba(60,35,15,.35)'); gr.addColorStop(1, 'rgba(60,35,15,0)');
    g.fillStyle = gr; g.fillRect(0, h - 60, w, 60);
    g.strokeStyle = 'rgba(90,60,30,.25)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
    return c;
  });
}
/**
 * One page flip at progress f (0..1): the back leaf (oldBack) falls forward onto the floor; its reverse is the
 * new floor (newFloor). Returns {alpha} = leaf angle (PI/2 .. 0) and the two spread frames for standees:
 *   old: frame of the old spread (pieces lean with the falling leaf); nu: frame of the new spread.
 */
export function flipFrames(f) {
  const al = (Math.PI / 2) * (1 - ease.inOutCubic(clamp(f)));
  const Fl = [0, Math.sin(al), Math.cos(al)];
  return { al, old: { F: [0, 0, 1], B: Fl, O: [0, 0, 0] }, nu: { F: Fl, B: [0, 1, 0], O: [0, 0, 0] } };
}
/**
 * Draw a full spread with an optional flip in progress.
 * S = { back, floor, pieces(frame, k) }  (pieces draws the spread's standees; k = rise 0..1 multiplies their angle)
 * flip: { f, next: S2 } — while f in (0,1) the page turns from S to S2.
 */
export function spread(ctx, S, flip = null) {
  const { W, HB, DF } = BOOK;
  if (!flip || flip.f <= 0) {
    quad(ctx, S.floor, [-W / 2, 0, DF], [W, 0, 0], [0, 0, -DF], { n: 6, shade: 0 });
    quad(ctx, S.back, [-W / 2, 0, 0], [W, 0, 0], [0, HB, 0], { n: 8, shade: 0.04 });
    S.pieces(null, 1);
    return;
  }
  const f = clamp(flip.f), N = flip.next, { al, old, nu } = flipFrames(f);
  const Fl = old.B;
  // which side of the falling leaf faces the camera?
  const mid = mul(Fl, HB * 0.5), nrm = [0, -Math.cos(al), Math.sin(al)];
  const frontVisible = dot(nrm, sub(CAM.pos, mid)) > 0;
  quad(ctx, S.floor, [-W / 2, 0, DF], [W, 0, 0], [0, 0, -DF], { n: 6, shade: 0 });
  quad(ctx, N.back, [-W / 2, 0, 0], [W, 0, 0], [0, HB, 0], { n: 8, shade: 0.04 });
  const leafFront = () => quad(ctx, S.back, [-W / 2, 0, 0], [W, 0, 0], mul(Fl, HB), { n: 10, shade: clamp(0.05 + (1 - Math.sin(al)) * 0.35) });
  const leafBack = () => quad(ctx, N.floor, add([-W / 2, 0, 0], mul(Fl, DF)), [W, 0, 0], mul(Fl, -DF), { n: 10, shade: clamp(Math.sin(al) * 0.4) });
  const kOld = Math.sin(al), kNew = 1 - Math.sin(al);
  if (frontVisible) { N.pieces(nu, kNew); leafFront(); S.pieces(old, kOld); }
  else { S.pieces(old, kOld); leafBack(); N.pieces(nu, kNew); }
  // the edge of the turning leaf (paper thickness highlight)
  const e1 = project(add([-W / 2, 0, 0], mul(Fl, HB))), e2 = project(add([W / 2, 0, 0], mul(Fl, HB)));
  ctx.strokeStyle = 'rgba(255,250,235,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(e1[0], e1[1]); ctx.lineTo(e2[0], e2[1]); ctx.stroke();
}
/** Fold-up progress for a piece that rises at time t0 (overshoot like stiff card). Returns angle 0..PI/2. */
export const rise = (t, t0, dur = 0.55) => (Math.PI / 2) * clamp(ease.outBack(clamp((t - t0) / dur), 1.8), 0, 1.12);

// ---------------- art: temples, people, props ----------------
/** Prambanan-style candi (tall tiered shrine with a ratna finial). Returns a card canvas. */
export function candi(kind = 0, w = 220, h = 360, tone = PAL.stone) {
  return card(`candi${kind}:${w}:${h}:${tone}`, w, h, (g) => {
    const cx = w / 2, dk = AMshade(tone, -0.25), hi = AMshade(tone, 0.25);
    g.fillStyle = tone;
    // base platform
    g.fillRect(w * 0.06, h * 0.86, w * 0.88, h * 0.14);
    g.fillRect(w * 0.14, h * 0.62, w * 0.72, h * 0.26);
    // stepped roof tiers
    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const y = h * 0.62 - (i + 1) * h * 0.085, ww = w * (0.66 - i * 0.1);
      g.fillStyle = i % 2 ? tone : hi; g.fillRect(cx - ww / 2, y, ww, h * 0.09);
      g.fillStyle = dk; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(cx + sd * ww / 2, y); g.lineTo(cx + sd * (ww / 2 + 8), y - 12); g.lineTo(cx + sd * (ww / 2 - 6), y); g.fill(); }
    }
    // finial
    g.fillStyle = tone; g.beginPath(); g.moveTo(cx - w * 0.06, h * 0.2); g.lineTo(cx, h * 0.02); g.lineTo(cx + w * 0.06, h * 0.2); g.fill();
    g.beginPath(); g.arc(cx, h * 0.2, w * 0.07, 0, TAU); g.fill();
    // doorway with kala head
    g.fillStyle = '#3a2f28'; g.fillRect(cx - w * 0.11, h * 0.68, w * 0.22, h * 0.2);
    g.fillStyle = hi; g.beginPath(); g.arc(cx, h * 0.66, w * 0.09, Math.PI, 0); g.fill();
    // relief lines
    g.strokeStyle = dk; g.lineWidth = 2;
    for (let y = h * 0.64; y < h * 0.86; y += 10) { g.beginPath(); g.moveTo(w * 0.15, y); g.lineTo(w * 0.36, y); g.moveTo(w * 0.64, y); g.lineTo(w * 0.85, y); g.stroke(); }
    if (kind === 1) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,240,200,.25)'; g.fillRect(0, 0, w * 0.4, h); g.globalCompositeOperation = 'source-over'; }
  }, { edge: 3 });
}
function AMshade(hex, amt) {
  const n = parseInt(hex.slice(1), 16); let r = (n >> 16) & 255, gg = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, k = Math.abs(amt);
  r = Math.round(r + (t - r) * k); gg = Math.round(gg + (t - gg) * k); b = Math.round(b + (t - b) * k);
  return `rgb(${r},${gg},${b})`;
}
export { AMshade as shade };

/**
 * Animated paper figure: a small 2D rig (body card + arm on a split pin), rendered each frame into an offscreen
 * canvas and then stood up in the book. who: 'putri' | 'bandung' | 'jin' | 'warga' | 'ayam'.
 * o: {arm (rad), arm2, bob, stone (0..1 greys it out), face (1/-1), t}
 */
const FIG = { putri: [260, 560], bandung: [300, 600], jin: [260, 460], warga: [300, 470], ayam: [240, 240] };
export function figure(who, o = {}) {
  const [w, h] = FIG[who];
  const c = cached('pu-fig-tmp:' + who + (o.slot || 0), () => makeCanvas(w + 16, h + 16));
  const g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
  g.translate(8, 8);
  if (o.face === -1) { g.translate(w, 0); g.scale(-1, 1); }
  DRAW[who](g, w, h, o);
  if (o.stone > 0) { // turning to stone: grey wash creeping up from the feet
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    const y = c.height * (1 - clamp(o.stone * 1.15));
    const gr = g.createLinearGradient(0, y - 40, 0, y + 10); gr.addColorStop(0, 'rgba(150,143,136,0)'); gr.addColorStop(1, 'rgba(150,143,136,0.96)');
    g.fillStyle = gr; g.fillRect(0, y - 40, c.width, 50); g.fillStyle = 'rgba(150,143,136,0.96)'; g.fillRect(0, y + 10, c.width, c.height);
    if (o.stone > 0.9) { g.strokeStyle = 'rgba(80,72,66,.6)'; g.lineWidth = 2; const r = mulberry32(3); for (let i = 0; i < 14; i++) { const x = r() * c.width, yy = r() * c.height; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + (r() - 0.5) * 30, yy + r() * 26); g.stroke(); } }
    g.globalCompositeOperation = 'source-over';
  }
  // cream cut edge + mask/shadow for the projected draw
  const out = cached('pu-fig-out:' + who + (o.slot || 0), () => { const m = makeCanvas(c.width + 8, c.height + 8); m.__mask = makeCanvas(m.width, m.height); m.__shadow = makeCanvas(Math.ceil(m.width / 6) + 2, Math.ceil(m.height / 6) + 2); return m; });
  const og = out.getContext('2d'); og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, out.width, out.height);
  for (let a = 0; a < 6; a++) og.drawImage(c, 4 + Math.cos((a / 6) * TAU) * 3, 4 + Math.sin((a / 6) * TAU) * 3);
  og.globalCompositeOperation = 'source-in'; og.fillStyle = '#fbf5e6'; og.fillRect(0, 0, out.width, out.height); og.globalCompositeOperation = 'source-over';
  og.drawImage(c, 4, 4);
  const mg = out.__mask.getContext('2d'); mg.globalCompositeOperation = 'source-over'; mg.clearRect(0, 0, out.width, out.height); mg.drawImage(out, 0, 0); mg.globalCompositeOperation = 'source-in'; mg.fillStyle = '#28160a'; mg.fillRect(0, 0, out.width, out.height);
  const sg = out.__shadow.getContext('2d'); sg.clearRect(0, 0, out.__shadow.width, out.__shadow.height); sg.drawImage(out.__mask, 1, 1, out.__shadow.width - 2, out.__shadow.height - 2);
  return out;
}
function brad(g, x, y) { const gr = g.createRadialGradient(x - 2, y - 2, 1, x, y, 7); gr.addColorStop(0, '#fff1b0'); gr.addColorStop(0.5, '#cf9d3a'); gr.addColorStop(1, '#6e4d12'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 6.5, 0, TAU); g.fill(); }
function limb(g, x, y, ang, len, wd, col, hand = PAL.skin) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.fillStyle = col; g.beginPath(); g.moveTo(-wd / 2, 0); g.lineTo(wd / 2, 0); g.lineTo(wd * 0.4, len); g.lineTo(-wd * 0.4, len); g.closePath(); g.fill();
  g.fillStyle = hand; g.beginPath(); g.arc(0, len + 6, wd * 0.48, 0, TAU); g.fill();
  g.restore(); brad(g, x, y);
}
function headP(g, x, y, r, { skin = PAL.skin, hair = PAL.hair, crown = null, bun = false, angry = 0, closed = false } = {}) {
  g.fillStyle = skin; g.beginPath(); g.ellipse(x, y, r * 0.92, r, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(x + r * 0.8, y - r * 0.15); g.lineTo(x + r * 1.15, y + r * 0.18); g.lineTo(x + r * 0.78, y + r * 0.28); g.fill(); // nose
  g.fillStyle = hair; g.beginPath(); g.ellipse(x - r * 0.18, y - r * 0.35, r * 0.85, r * 0.7, -0.2, Math.PI * 0.95, Math.PI * 2.1); g.fill();
  g.fillRect(x - r * 0.95, y - r * 0.4, r * 0.4, r * 1.1);
  if (bun) { g.beginPath(); g.arc(x - r * 0.95, y - r * 0.1, r * 0.48, 0, TAU); g.fill(); }
  if (crown) { g.fillStyle = crown; g.beginPath(); g.moveTo(x - r * 0.7, y - r * 0.55); g.lineTo(x - r * 0.4, y - r * 1.45); g.lineTo(x - r * 0.1, y - r * 0.85); g.lineTo(x + r * 0.2, y - r * 1.3); g.lineTo(x + r * 0.45, y - r * 0.6); g.closePath(); g.fill(); g.fillStyle = PAL.red; g.beginPath(); g.arc(x - r * 0.1, y - r * 0.75, r * 0.1, 0, TAU); g.fill(); }
  g.fillStyle = PAL.ink;
  if (closed) g.fillRect(x + r * 0.3, y - r * 0.08, r * 0.3, r * 0.08); else { g.beginPath(); g.ellipse(x + r * 0.45, y - r * 0.05, r * 0.1, r * 0.13, 0, 0, TAU); g.fill(); }
  g.lineWidth = r * 0.08; g.strokeStyle = PAL.ink; g.beginPath(); g.moveTo(x + r * 0.25, y - r * 0.32 - angry * r * 0.08); g.lineTo(x + r * 0.65, y - r * 0.3 + angry * r * 0.12); g.stroke();
  g.fillStyle = '#d9776a'; g.beginPath(); g.arc(x + r * 0.35, y + r * 0.3, r * 0.14, 0, TAU); g.fill();
  g.strokeStyle = '#7d2b28'; g.lineWidth = r * 0.07; g.beginPath(); if (angry > 0.5) { g.moveTo(x + r * 0.45, y + r * 0.55); g.lineTo(x + r * 0.75, y + r * 0.5); } else g.arc(x + r * 0.6, y + r * 0.4, r * 0.16, 0.2, 1.4); g.stroke();
}
function batikBand(g, x, y, w, h, base = PAL.batik, motif = PAL.batikHi) {
  g.fillStyle = base; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.strokeStyle = motif; g.lineWidth = 3;
  for (let k = -h; k < w + h; k += 22) { g.beginPath(); g.moveTo(x + k, y); g.lineTo(x + k - h, y + h); g.stroke(); }
  g.fillStyle = motif; for (let k = -h; k < w + h; k += 22) for (let j = 10; j < h; j += 22) { g.beginPath(); g.arc(x + k - j + 11, y + j, 3, 0, TAU); g.fill(); }
  g.restore();
}
const DRAW = {
  putri: (g, w, h, o) => {
    const arm = o.arm ?? 0.3, bob = o.bob || 0, cx = w * 0.48;
    g.translate(0, bob);
    limb(g, cx - 8, h * 0.3, -(o.arm2 ?? 0.15), h * 0.26, 24, PAL.skinDk, PAL.skinDk);
    batikBand(g, cx - 48, h * 0.5, 96, h * 0.48, '#5a2e1a', '#e2b866'); // long jarik
    g.fillStyle = '#2c6b4e'; g.fillRect(cx - 44, h * 0.27, 88, h * 0.25); // kemben
    g.fillStyle = PAL.gold; g.fillRect(cx - 46, h * 0.49, 92, 12);
    g.fillStyle = PAL.skin; g.fillRect(cx - 12, h * 0.2, 24, h * 0.09); g.beginPath(); g.ellipse(cx, h * 0.27, 44, 16, 0, Math.PI, 0); g.fill();
    headP(g, cx + 4, h * 0.14, 46, { bun: true, crown: PAL.gold, closed: o.closed });
    // selendang (sash) hanging
    g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(cx + 30, h * 0.27); g.quadraticCurveTo(cx + 60, h * 0.45, cx + 40 + Math.sin((o.t || 0) * 3) * 6, h * 0.7); g.lineTo(cx + 26, h * 0.7); g.quadraticCurveTo(cx + 40, h * 0.45, cx + 16, h * 0.3); g.fill();
    limb(g, cx + 10, h * 0.3, -arm, h * 0.26, 24, PAL.skin);
  },
  bandung: (g, w, h, o) => {
    const arm = o.arm ?? 0.2, cx = w * 0.45;
    g.translate(0, o.bob || 0);
    limb(g, cx - 10, h * 0.3, -(o.arm2 ?? 0.1), h * 0.26, 30, PAL.skinDk, PAL.skinDk);
    // legs + kain
    g.fillStyle = PAL.skinDk; g.fillRect(cx - 30, h * 0.75, 22, h * 0.24); g.fillStyle = PAL.skin; g.fillRect(cx + 6, h * 0.75, 24, h * 0.24);
    batikBand(g, cx - 56, h * 0.5, 112, h * 0.28, '#3b2a1a', '#d9a640');
    g.fillStyle = PAL.red; g.beginPath(); g.moveTo(cx + 40, h * 0.52); g.lineTo(cx + 70, h * 0.82); g.lineTo(cx + 46, h * 0.82); g.fill();
    g.fillStyle = PAL.skin; g.beginPath(); g.moveTo(cx - 52, h * 0.25); g.lineTo(cx + 50, h * 0.25); g.lineTo(cx + 40, h * 0.52); g.lineTo(cx - 44, h * 0.52); g.fill();
    g.strokeStyle = PAL.gold; g.lineWidth = 10; g.beginPath(); g.moveTo(cx + 40, h * 0.26); g.lineTo(cx - 40, h * 0.5); g.stroke(); // sash
    g.fillStyle = PAL.gold; g.fillRect(cx - 56, h * 0.49, 112, 12);
    // keris at the waist
    g.fillStyle = '#4a3020'; g.save(); g.translate(cx - 40, h * 0.5); g.rotate(-0.9); g.fillRect(0, -6, 56, 12); g.restore();
    headP(g, cx + 4, h * 0.14, 48, { crown: PAL.gold, angry: o.angry || 0 });
    g.fillStyle = PAL.hair; g.beginPath(); g.moveTo(cx + 30, h * 0.2); g.quadraticCurveTo(cx + 46, h * 0.235, cx + 54, h * 0.2); g.lineTo(cx + 44, h * 0.21); g.fill(); // moustache
    limb(g, cx + 14, h * 0.3, -arm, h * 0.27, 30, PAL.skin);
  },
  jin: (g, w, h, o) => {
    const t = o.t || 0, cx = w * 0.5;
    g.translate(0, Math.sin(t * 5 + (o.slot || 0)) * 8);
    // wispy tail body
    const gr = g.createLinearGradient(0, h * 0.2, 0, h); gr.addColorStop(0, PAL.jinHi); gr.addColorStop(1, 'rgba(47,58,122,0.15)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(cx - 60, h * 0.3);
    g.quadraticCurveTo(cx - 80, h * 0.7, cx + Math.sin(t * 4) * 30, h * 0.98); g.quadraticCurveTo(cx + 40, h * 0.7, cx + 60, h * 0.3); g.fill();
    g.fillStyle = PAL.jin; g.beginPath(); g.ellipse(cx, h * 0.32, 66, 70, 0, 0, TAU); g.fill();
    // horns + glowing eyes
    g.beginPath(); g.moveTo(cx - 40, h * 0.2); g.lineTo(cx - 56, h * 0.06); g.lineTo(cx - 22, h * 0.17); g.fill();
    g.beginPath(); g.moveTo(cx + 40, h * 0.2); g.lineTo(cx + 56, h * 0.06); g.lineTo(cx + 22, h * 0.17); g.fill();
    g.fillStyle = '#ffe36a'; g.beginPath(); g.ellipse(cx + 12, h * 0.3, 10, 7, 0, 0, TAU); g.ellipse(cx + 40, h * 0.3, 9, 7, 0, 0, TAU); g.fill();
    // arms holding a stone block above the head
    const lift = o.arm ?? 0.5;
    limb(g, cx - 40, h * 0.36, Math.PI - 0.3 - lift * 0.5, h * 0.22, 22, PAL.jin, PAL.jinHi);
    limb(g, cx + 40, h * 0.36, Math.PI + 0.3 + lift * 0.5, h * 0.22, 22, PAL.jin, PAL.jinHi);
    if (o.block !== false) { g.fillStyle = PAL.stone; g.fillRect(cx - 54, h * 0.02 - lift * 6, 108, 56); g.strokeStyle = PAL.stoneDk; g.lineWidth = 3; g.strokeRect(cx - 54, h * 0.02 - lift * 6, 108, 56); g.beginPath(); g.moveTo(cx, h * 0.02 - lift * 6); g.lineTo(cx, h * 0.02 + 56 - lift * 6); g.stroke(); }
  },
  warga: (g, w, h, o) => {
    // village woman pounding rice with a long pestle (alu) into a trough (lesung)
    const p = o.pound ?? 0, cx = w * 0.4, up = -Math.abs(Math.sin(p * Math.PI)) * 70;
    g.fillStyle = '#5a3a22'; g.fillRect(cx + 10, h * 0.78, w * 0.5, h * 0.18); g.fillStyle = '#3a2414'; g.fillRect(cx + 30, h * 0.8, w * 0.4, h * 0.05); // lesung
    g.fillStyle = PAL.paper; g.beginPath(); g.ellipse(cx + 30 + w * 0.2, h * 0.8, w * 0.17, 8, 0, 0, TAU); g.fill(); // rice
    batikBand(g, cx - 40, h * 0.5, 80, h * 0.48, '#6b3b1f', '#e0b46a');
    g.fillStyle = '#7e5aa0'; g.fillRect(cx - 38, h * 0.26, 76, h * 0.26); // kebaya
    headP(g, cx + 2, h * 0.16, 40, { bun: true });
    g.fillStyle = '#d7c39a'; g.fillRect(cx + 70, h * 0.05 + up, 14, h * 0.78); // alu
    limb(g, cx + 6, h * 0.3, -1.2 - up / 300, h * 0.24, 22, '#7e5aa0');
  },
  ayam: (g, w, h, o) => {
    const crow = o.crow || 0, cx = w * 0.45;
    g.fillStyle = '#b8462b'; g.beginPath(); g.ellipse(cx, h * 0.6, 80, 60, -0.2, 0, TAU); g.fill();
    // tail feathers
    const tc = ['#1f4d3a', '#2f6d4a', '#c2362b', '#e3a531'];
    tc.forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx - 50, h * 0.55); g.quadraticCurveTo(cx - 140 + i * 10, h * 0.1 + i * 20, cx - 100 + i * 14, h * 0.62 + i * 6); g.fill(); });
    g.save(); g.translate(cx + 50, h * 0.42); g.rotate(-crow * 0.5);
    g.fillStyle = '#e3a531'; g.beginPath(); g.ellipse(0, -20, 30, 50, 0.3, 0, TAU); g.fill();
    g.fillStyle = '#d92b2b'; g.beginPath(); g.moveTo(-10, -66); g.lineTo(0, -88); g.lineTo(8, -70); g.lineTo(18, -86); g.lineTo(24, -62); g.fill();
    g.fillStyle = '#f2c14e'; g.beginPath(); g.moveTo(26, -48); g.lineTo(46 + crow * 6, -40 - crow * 10); g.lineTo(26, -36); g.fill();
    if (crow > 0.3) { g.beginPath(); g.moveTo(26, -38); g.lineTo(44, -24); g.lineTo(26, -32); g.fill(); }
    g.fillStyle = PAL.ink; g.beginPath(); g.arc(14, -48, 4, 0, TAU); g.fill();
    g.fillStyle = '#d92b2b'; g.beginPath(); g.ellipse(22, -26, 6, 10, 0, 0, TAU); g.fill();
    g.restore();
    g.strokeStyle = '#e3a531'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 10, h * 0.78); g.lineTo(cx - 14, h * 0.98); g.moveTo(cx + 14, h * 0.78); g.lineTo(cx + 18, h * 0.98); g.stroke();
  },
};
/** Stand an animated figure in the book at (x, d), height hgt, rise angle a. */
export function figureIn(ctx, who, x, d, hgt, a, o = {}, frame = null) {
  if (a <= 0.01) return;
  const img = figure(who, o), [w, h] = FIG[who];
  const ww = (hgt * img.width) / img.height;
  standee(ctx, img, x, d, ww, hgt, a, { frame, shadow: 0.3, n: 2 });
}

// ---------------- paper UI: labels, pull tab, volvelle ----------------
/** Cream paper label with a pin, in screen space. */
export function label(ctx, text, x, y, { size = 50, alpha = 1, rot = -0.03, ink = PAL.ink, paper = '#fbf5e6', font = 'Fredoka' } = {}) {
  if (alpha <= 0.01) return;
  const L = cached(`pu-label:${text}:${size}:${ink}:${paper}:${font}`, () => {
    const m = makeCanvas(10, 10).getContext('2d'); m.font = `700 ${size}px '${font}'`;
    const w = m.measureText(text).width + size * 1.1, h = size * 1.5, c = makeCanvas(w + 20, h + 24), g = c.getContext('2d');
    g.fillStyle = 'rgba(30,15,5,.35)'; g.fillRect(14, 16, w, h);
    g.fillStyle = paper; g.fillRect(6, 6, w, h);
    g.strokeStyle = 'rgba(120,80,40,.4)'; g.lineWidth = 2; g.strokeRect(12, 12, w - 12, h - 12);
    g.fillStyle = ink; g.font = `700 ${size}px '${font}'`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 6 + w / 2, 6 + h / 2 + size * 0.05);
    g.globalAlpha = 0.45; g.drawImage(alphaTexture(paperTexture(256, 256, { base: '#808080', fiber: 0.15, blotch: 0.05, seed: 2, grainAmt: 28 }), 1), 6, 6, w, h);
    return c;
  });
  const p = clamp(alpha), e = ease.outBack(p, 2);
  ctx.save(); ctx.globalAlpha *= Math.min(1, p * 2); ctx.translate(x, y); ctx.rotate(rot + (1 - e) * 0.3); ctx.scale(e, e);
  ctx.drawImage(L, -L.width / 2, -L.height / 2); ctx.restore();
}
/** Pull tab sliding out of the floor leaf's right edge at depth d; pull = 0..1; a hand pulls it. */
export function pullTab(ctx, d, pull, { text = 'TARIK', hand = true } = {}) {
  const { W } = BOOK, out = 30 + pull * 120;
  const T = card('pulltab-side' + text, 240, 150, (g, w, h) => {
    g.fillStyle = '#e9c46a'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w - 50, 0); g.quadraticCurveTo(w + 10, h / 2, w - 50, h); g.lineTo(0, h); g.fill();
    g.fillStyle = PAL.ink; g.font = "700 38px 'Fredoka'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text + ' →', w / 2 - 14, h / 2);
  }, { edge: 2 });
  quad(ctx, T, [W / 2 - 330 + out, 2, d + 75], [240, 0, 0], [0, 0, -150], { shade: 0.05 });
  if (hand) { const [hx, hy] = project([W / 2 - 110 + out, 10, d]); handSprite(ctx, hx - 10, hy - 30, 0.7); }
}
export function handSprite(ctx, x, y, s = 1) {
  const H = card('hand', 200, 260, (g) => {
    g.fillStyle = '#e0a77c'; g.beginPath(); g.ellipse(100, 160, 70, 80, 0, 0, TAU); g.fill();
    g.fillRect(84, 20, 34, 120); g.beginPath(); g.arc(101, 22, 17, 0, TAU); g.fill();
    g.fillStyle = '#c98b5d'; for (let i = 0; i < 3; i++) g.fillRect(40 + i * 0, 120 + i * 30, 30, 22);
    g.fillStyle = '#f2d2b5'; g.beginPath(); g.ellipse(101, 30, 9, 12, 0, 0, TAU); g.fill();
    g.fillStyle = '#3e6b8a'; g.fillRect(40, 220, 130, 40);
  }, { edge: 0, cut: false, tex: 0.2 });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.drawImage(H, -100, -20); ctx.restore();
}
/** Volvelle: a printed paper wheel turning under a window, showing a number. Lies flat on the floor at (x, d). */
export function volvelle(ctx, x, d, value, { r = 130, label: lab = 'CANDI', t = 0 } = {}) {
  const c = cached('pu-volv', () => makeCanvas(2 * 150 + 8, 2 * 150 + 8)), g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
  g.translate(c.width / 2, c.height / 2);
  g.rotate(-value * 0.02);
  g.fillStyle = '#e9d8b4'; g.beginPath(); g.arc(0, 0, 148, 0, TAU); g.fill();
  g.strokeStyle = PAL.ink; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 130, Math.sin(a) * 130); g.lineTo(Math.cos(a) * 146, Math.sin(a) * 146); g.stroke(); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.translate(c.width / 2, c.height / 2);
  g.fillStyle = PAL.cover; g.beginPath(); g.arc(0, 0, 112, 0, TAU); g.fill();
  g.fillStyle = '#fbf5e6'; g.beginPath(); g.roundRect(-100, -48, 200, 96, 14); g.fill();
  g.fillStyle = PAL.ink; g.font = "700 76px 'Fredoka'"; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(value), 0, 4);
  g.fillStyle = '#fbf5e6'; g.font = "700 26px 'Fredoka'"; g.fillText(lab, 0, 80);
  brad(g, 0, -96);
  quad(ctx, c, [x - r, 2, d + r], [2 * r, 0, 0], [0, 0, -2 * r], { shade: 0 });
}

export { ease, clamp, lerp, hrand };
