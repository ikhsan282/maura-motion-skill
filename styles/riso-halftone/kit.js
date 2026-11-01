// Maura Motion style kit: RISOGRAPH HALFTONE (zine / gig-poster print).
// Spot inks (fluoro pink, blue, yellow) overprint with multiply on a half-resolution "print" canvas
// (540x960: multiply there costs a quarter of full-screen), then the print is shown x2 with cached paper
// grain and photocopy specks on top (plain source-over). Each ink has its own misregistration offset that
// drifts and snaps back on beats. Tones are cached halftone dot patterns (per ink, angle, level). Includes
// band silhouettes that play, prison bars, stamps, tape labels, a roller "print pass" wipe and zine type.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, paperTexture, alphaTexture } from '/engine/lib/draw.js';

export const PW = 540, PH = 960; // print canvas (shown x2)
export const INK = { pink: '#ff48b0', blue: '#0078bf', yellow: '#ffe800', red: '#ff665e', black: '#2b2b3a' };
export const PAPER = '#f3eee1';
const ANGLE = { pink: 0.26, blue: 1.31, yellow: 0.0, red: 0.79, black: 0.79 };

let PR = null;
/** Start a print frame: returns the half-res context (coordinates in 1080x1920 space, scaled 0.5). */
export function print() {
  if (!PR) { const c = makeCanvas(PW, PH); PR = { c, g: c.getContext('2d') }; }
  const g = PR.g; g.setTransform(0.5, 0, 0, 0.5, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = PAPER; g.fillRect(0, 0, 1080, 1920);
  return g;
}
/** Misregistration offset of an ink at time t (stepped). `snap` 0..1 pulls it back to register. */
export function reg(ink, t, { amt = 7, snap = 0 } = {}) {
  const k = { pink: 1, blue: 2, yellow: 3, red: 4, black: 5 }[ink] || 0, f = Math.floor(t * 6) / 6;
  const s = (1 - snap) * amt;
  return [noise.n2(f * 0.7, k * 3.1) * s + (k - 2) * 1.2, noise.n2(f * 0.7, k * 7.7) * s];
}
/** Draw with one ink: sets multiply, ink colour (or a halftone tone), translation by misregistration. */
export function ink(g, name, t, fn, { tone = 1, snap = 0, amt = 7, alpha = 1 } = {}) {
  const [dx, dy] = reg(name, t, { snap, amt });
  g.save();
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = alpha;
  g.translate(dx, dy);
  const fill = tone >= 0.99 ? INK[name] : halftone(g, name, tone);
  g.fillStyle = fill; g.strokeStyle = INK[name];
  fn(g, fill);
  g.restore();
}
/** Cached halftone pattern for an ink at a tone level (0..1). Dot pitch 9 print px (18 screen px). */
export function halftone(g, name, level, { pitch = 9 } = {}) {
  const L = Math.round(clamp(level) * 10) / 10;
  const p = cached(`ht:${name}:${L}:${pitch}`, () => {
    const c = makeCanvas(pitch, pitch), x = c.getContext('2d');
    const r = Math.sqrt(L) * pitch * 0.62;
    x.fillStyle = INK[name]; x.beginPath(); x.arc(pitch / 2, pitch / 2, r, 0, TAU); x.fill();
    if (r > pitch / 2) { x.beginPath(); for (const [cx, cy] of [[0, 0], [pitch, 0], [0, pitch], [pitch, pitch]]) { x.moveTo(cx + r - pitch / 2, cy); x.arc(cx, cy, r - pitch / 2 + 0.01, 0, TAU); } x.fill(); }
    const pat = g.createPattern(c, 'repeat');
    // the print ctx is scaled 0.5: compensate so dots stay `pitch` print px, and rotate by the ink's screen angle
    pat.setTransform(new DOMMatrix().scale(2, 2).rotate((ANGLE[name] || 0) * 57.3));
    return pat;
  });
  return p;
}
/** Show the print on the output layer x2 with paper grain and photocopy specks (stepped). */
export function present(ctx, t, { grain = 0.55, specks = 1, shake = 0 } = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const f = Math.floor(t * 12);
  const sx = shake ? (hrand(f, 1) - 0.5) * shake : 0, sy = shake ? (hrand(f, 2) - 0.5) * shake : 0;
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, 1080, 1920);
  ctx.drawImage(PR.c, sx, sy, 1080, 1920);
  const tex = cached('riso-grain', () => alphaTexture(paperTexture(540, 960, { base: '#808080', fiber: 0.25, blotch: 0.2, seed: 11, grainAmt: 70 }), 0.9));
  ctx.globalAlpha = grain; ctx.drawImage(tex, 0, 0, 1080, 1920);
  if (specks) {
    const sp = cached('riso-specks', () => {
      const arr = [];
      for (let k = 0; k < 4; k++) {
        const c = makeCanvas(540, 960), x = c.getContext('2d'), r = mulberry32(50 + k);
        x.fillStyle = '#1d1b26';
        for (let i = 0; i < 260; i++) { const px = r() * 540, py = r() * 960, s = r() < 0.9 ? 1 : 2.5; x.globalAlpha = 0.25 + r() * 0.5; x.fillRect(px, py, s, s * (r() < 0.2 ? 6 : 1)); }
        x.globalAlpha = 0.07; for (let i = 0; i < 3; i++) { const y = r() * 960; x.fillRect(0, y, 540, 1 + r() * 2); }
        arr.push(c);
      }
      return arr;
    });
    ctx.globalAlpha = specks; ctx.drawImage(sp[Math.floor(t * 6) % 4], 0, 0, 1080, 1920);
  }
  ctx.restore();
}

// ---------------- shapes ----------------
/** Big type (filled with the current ink). */
export function type(g, str, x, y, { size = 200, font = 'Bebas Neue', align = 'center', rot = 0, spacing = 0, weight = 400, stroke = 0 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.font = `${weight} ${size}px '${font}'`; g.textAlign = align; g.textBaseline = 'middle';
  if (spacing) g.letterSpacing = spacing + 'px';
  if (stroke) { g.lineWidth = stroke; g.lineJoin = 'round'; g.strokeText(str, 0, 0); } else g.fillText(str, 0, 0);
  g.restore();
}
/** Sunburst rays around (cx,cy). */
export function burst(g, cx, cy, r, { n = 24, rot = 0 } = {}) {
  g.beginPath();
  for (let i = 0; i < n; i++) { const a = rot + (i / n) * TAU, b = a + TAU / n / 2; g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.lineTo(cx + Math.cos(b) * r, cy + Math.sin(b) * r); g.closePath(); }
  g.fill();
}
/** Prison bars from x0..x1, top..bottom. `rise` lifts them (0 = down). */
export function bars(g, x0, x1, top, bottom, { n = 7, w = 34, rise = 0 } = {}) {
  const dy = -rise * (bottom - top + 200);
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)) - w / 2; g.fillRect(x, top + dy, w, bottom - top); }
  g.fillRect(x0 - 40, top + dy, x1 - x0 + 80, 40); g.fillRect(x0 - 40, top + dy + (bottom - top) * 0.55, x1 - x0 + 80, 26);
}
/**
 * Band member silhouette (path filled with current ink). kind: 'guitar'|'bass'|'vocal'|'drums'.
 * t animates strumming / head bob / drumming. s = scale (1 ~ 520 px tall).
 */
export function musician(g, x, y, s, kind, t, { phase = 0, sing = 0 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const bob = Math.sin((t + phase) * 8) * 6, strum = Math.sin((t + phase) * 16);
  if (kind === 'drums') {
    // seated drummer behind kit
    g.beginPath(); g.arc(0, -330 + bob, 46, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(0, -350 + bob, 56, 34, 0, Math.PI, TAU); g.fill(); // mop top
    g.beginPath(); g.moveTo(-70, -270); g.lineTo(70, -270); g.lineTo(80, -120); g.lineTo(-80, -120); g.closePath(); g.fill();
    const hit = Math.max(0, Math.sin((t + phase) * 10));
    g.lineWidth = 22; g.lineCap = 'round'; g.strokeStyle = g.fillStyle;
    g.beginPath(); g.moveTo(-60, -250); g.lineTo(-130, -170 - hit * 40); g.lineTo(-200, -150 - hit * 70); g.moveTo(60, -250); g.lineTo(130, -170 - (1 - hit) * 40); g.lineTo(200, -150 - (1 - hit) * 70); g.stroke();
    g.beginPath(); g.ellipse(0, -60, 120, 120, 0, 0, TAU); g.fill(); // bass drum
    g.fillRect(-230, -150, 90, 70); g.fillRect(140, -150, 90, 70);
    g.beginPath(); g.ellipse(-280, -230, 80, 12, -0.1, 0, TAU); g.ellipse(280, -250, 80, 12, 0.1, 0, TAU); g.fill();
    g.restore(); return;
  }
  // standing: legs, suit body, head with mop-top hair
  g.beginPath(); g.moveTo(-45, 0); g.lineTo(-30, -220); g.lineTo(30, -220); g.lineTo(45, 0); g.lineTo(18, 0); g.lineTo(0, -150); g.lineTo(-18, 0); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-70, -400 + bob * 0.5); g.lineTo(70, -400 + bob * 0.5); g.lineTo(55, -210); g.lineTo(-55, -210); g.closePath(); g.fill();
  g.beginPath(); g.arc(0, -455 + bob, 48, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(0, -475 + bob, 58, 40, 0, Math.PI * 0.95, TAU * 1.02); g.fill();
  g.lineWidth = 24; g.lineCap = 'round'; g.strokeStyle = g.fillStyle;
  if (kind === 'vocal') {
    g.beginPath(); g.moveTo(-60, -390); g.lineTo(-40, -330); g.lineTo(10, -400 + bob); g.stroke();
    g.fillRect(14, -420 + bob, 14, 260); g.beginPath(); g.arc(20, -425 + bob, 18, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(60, -390); g.lineTo(90, -300 - sing * 80); g.stroke();
  } else {
    // guitar body + neck, strumming hand
    const neckA = kind === 'bass' ? -0.5 : -0.38;
    g.save(); g.translate(10, -260); g.rotate(neckA);
    g.beginPath(); g.ellipse(-20, 0, 80, 62, 0, 0, TAU); g.ellipse(50, 0, 60, 48, 0, 0, TAU); g.fill();
    g.fillRect(90, -11, kind === 'bass' ? 300 : 250, 22); g.fillRect(kind === 'bass' ? 380 : 330, -20, 50, 40);
    g.restore();
    g.beginPath(); g.moveTo(-60, -390); g.lineTo(-90, -310); g.lineTo(-10 + strum * 20, -250 + strum * 25); g.stroke();
    g.beginPath(); g.moveTo(60, -390); g.lineTo(150, -330); g.lineTo(230, -380); g.stroke();
  }
  g.restore();
}
/** Crowd of heads/shoulders (bobbing), between x0..x1 at baseline y. */
export function crowd(g, x0, x1, y, t, { n = 14, s = 1, sing = 1, seed = 2 } = {}) {
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, (i + hrand(i, seed) * 0.6) / n), h = (60 + hrand(i, seed + 1) * 40) * s, bob = Math.abs(Math.sin(t * 6 + i)) * 14 * sing * s;
    g.moveTo(x + 46 * s, y - h - bob); g.arc(x, y - h - bob, 46 * s, 0, TAU);
    g.moveTo(x - 80 * s, y); g.quadraticCurveTo(x - 80 * s, y - h + 30 * s - bob, x, y - h + 30 * s - bob); g.quadraticCurveTo(x + 80 * s, y - h + 30 * s - bob, x + 80 * s, y);
    if (i % 3 === 0) { g.moveTo(x + 30 * s, y - h); g.lineTo(x + 60 * s, y - h - 160 * s - bob); g.lineTo(x + 84 * s, y - h - 150 * s - bob); g.lineTo(x + 54 * s, y - h); }
  }
  g.fill();
}
/** Vinyl record (filled ink), spinning label text in a second ink by caller. */
export function record(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.arc(x, y, r * 0.06, 0, TAU, true); g.fill('evenodd'); }
/** Rubber stamp text box (outline + text), rotated; p = 0..1 slam (scales from 1.6 to 1). */
export function stamp(g, str, x, y, p, { size = 120, rot = -0.12, font = 'Bebas Neue' } = {}) {
  if (p <= 0) return;
  const s = lerp(1.7, 1, ease.outCubic(clamp(p)));
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha *= clamp(p * 3);
  g.font = `400 ${size}px '${font}'`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = g.measureText(str).width + size * 0.5, h = size * 1.2;
  g.lineWidth = size * 0.09; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillText(str, 0, size * 0.04);
  g.restore();
}
/** Masking-tape label (paper-coloured strip + typewriter text in ink). Drawn normal (not multiply). */
export function tape(g, str, x, y, { rot = -0.05, size = 44, color = INK.black, alpha = 1 } = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = alpha;
  g.font = `400 ${size}px 'Special Elite'`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = g.measureText(str).width + 50, h = size * 1.5;
  g.fillStyle = 'rgba(236,226,196,0.92)'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(0,0,0,0.06)'; for (let i = 0; i < 6; i++) g.fillRect(-w / 2 + i * w / 6, -h / 2, 2, h);
  g.fillStyle = color; g.fillText(str, 0, 2);
  g.restore();
}
/** Roller print-pass wipe: returns a clip that reveals from the top to `p` (0..1) with a ragged edge. */
export function passClip(g, p, { from = 0, to = 1920 } = {}) {
  const y = lerp(from, to, clamp(p));
  g.beginPath(); g.moveTo(0, from); g.lineTo(1080, from);
  for (let x = 1080; x >= 0; x -= 60) g.lineTo(x, y + Math.sin(x * 0.05) * 10);
  g.closePath(); g.clip();
  return y;
}
