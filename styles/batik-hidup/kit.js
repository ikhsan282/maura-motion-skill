// Maura Motion style kit: BATIK HIDUP (living batik).
// Everything is cloth: a white mori cotton with a fine weave. The canting (copper bowl + bamboo handle) draws hot
// wax lines that glow amber; then the cloth is dyed (soga brown / indigo) and the waxed lines stay cream; the
// wax cracks and the dye seeps in as fine veins (remukan). Motifs are drawn with their real geometry:
// PARANG (45° bands of interlocking blades, separated by a row of mlinjon diamonds), KAWUNG (four palm-fruit
// ovals around a centre), MEGA MENDUNG (Cirebon clouds in graded blues). Figures are batik line-art (cream
// outline on dyed ground) whose clothes are filled with motifs; they move, sit, bow and walk.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached } from '/engine/lib/draw.js';

export const PAL = {
  mori: '#f3ead6', wax: '#efc56c', waxHi: '#fff3c4', soga: '#7a4a24', sogaDk: '#3a2112', sogaLt: '#b07a43',
  cream: '#f3e6c6', indigo: '#1f2c58', indigoLt: '#3d5a9a', indigoDk: '#111a36', gold: '#d9a441', red: '#8e2a20',
  skin: '#c1864e', copper: '#b8672c', bamboo: '#c9a25a', ink: '#24150c',
  mega: ['#0f1f4a', '#1d3a78', '#2f5aa6', '#5b86c8', '#94b7e2', '#cfe0f4', '#f5f0e4'],
};

// ---------------- textures ----------------
export function weave() {
  return cached('bt-weave', () => {
    const c = makeCanvas(256, 256), g = c.getContext('2d'), r = mulberry32(3);
    for (let y = 0; y < 256; y += 3) { g.fillStyle = `rgba(255,255,255,${0.05 + r() * 0.06})`; g.fillRect(0, y, 256, 1); }
    for (let x = 0; x < 256; x += 3) { g.fillStyle = `rgba(60,35,15,${0.04 + r() * 0.05})`; g.fillRect(x, 0, 1, 256); }
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '50,30,10'},${r() * 0.12})`; g.fillRect(r() * 256, r() * 256, 1 + r() * 5, 1); }
    return c;
  });
}
/** Crackle (remukan): dye that seeped into cracked wax — thin branching veins. */
export function crackle(col = PAL.indigo) {
  return cached('bt-crackle' + col, () => {
    const S = 512, c = makeCanvas(S, S), g = c.getContext('2d'), r = mulberry32(17);
    g.strokeStyle = col; g.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      let x = r() * S, y = r() * S, a = r() * TAU;
      g.lineWidth = 0.6 + r() * 1.4; g.globalAlpha = 0.35 + r() * 0.5;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 12; k++) { a += (r() - 0.5) * 1.2; x += Math.cos(a) * (8 + r() * 18); y += Math.sin(a) * (8 + r() * 18); g.lineTo(x, y); if (r() < 0.2) { g.stroke(); g.beginPath(); g.moveTo(x, y); a += (r() - 0.5) * 2; } }
      g.stroke();
    }
    return c;
  });
}
/** Lay a cached tile over the visible frame (screen space) with alpha. */
export function overlay(ctx, tile, a, scale = 1) {
  if (a <= 0.003) return;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a;
  ctx.fillStyle = ctx.createPattern(tile, 'repeat');
  if (scale !== 1) ctx.scale(scale, scale);
  ctx.fillRect(0, 0, ctx.canvas.width / scale, ctx.canvas.height / scale);
  ctx.restore();
}

// ---------------- motif geometry ----------------
// PARANG: bands at 45°, perpendicular spacing S; along each band, blades every L (= S/sqrt2 / 2 so the tile repeats).
const PT = 240, PS = PT / Math.SQRT2, PL = PS / 2;
function parangUnits(g, mode) {
  // local band coords: u along the band, v across (band spans v in [-S/2, S/2])
  const hv = PS / 2 - 16;
  for (let k = -4; k <= 4; k++) for (let j = -10; j <= 10; j++) {
    const v0 = k * PS, u0 = j * PL;
    // blade (an S-curve with thickness) — interlocks with the next one
    const A = (s) => { g.moveTo(u0 + s, v0 - hv); g.bezierCurveTo(u0 + s + PL * 1.15, v0 - hv, u0 + s + PL * 0.25, v0 + hv, u0 + s + PL * 1.35, v0 + hv); };
    g.beginPath(); A(0); g.lineTo(u0 + PL * 0.42 + PL * 1.35, v0 + hv);
    g.bezierCurveTo(u0 + PL * 0.42 + PL * 0.25, v0 + hv, u0 + PL * 0.42 + PL * 1.15, v0 - hv, u0 + PL * 0.42, v0 - hv); g.closePath();
    if (mode === 'fill') { g.fillStyle = PAL.sogaDk; g.fill(); }
    g.lineWidth = mode === 'wax' ? 4 : 3.2; g.strokeStyle = mode === 'wax' ? PAL.wax : PAL.cream; g.stroke();
    // inner sawut line
    g.beginPath(); A(PL * 0.21); g.lineWidth = mode === 'wax' ? 2.4 : 2; g.stroke();
    // cecek dots beside the blade
    g.fillStyle = mode === 'wax' ? PAL.wax : PAL.cream;
    for (let q = 0; q < 4; q++) { const tt = 0.2 + q * 0.2; g.beginPath(); g.arc(u0 - 8 + PL * 1.1 * tt, v0 - hv * (1 - 2 * tt) - 4, 2.6, 0, TAU); g.fill(); }
    // mlinjon diamond on the band border
    const mu = u0 + PL * 0.5, mv = v0 + PS / 2;
    g.beginPath(); g.moveTo(mu - 15, mv); g.lineTo(mu, mv - 9); g.lineTo(mu + 15, mv); g.lineTo(mu, mv + 9); g.closePath();
    if (mode === 'fill') { g.fillStyle = PAL.cream; g.fill(); g.fillStyle = PAL.sogaDk; g.beginPath(); g.arc(mu, mv, 3, 0, TAU); g.fill(); }
    else { g.lineWidth = 3; g.stroke(); }
  }
  // band borders: double line
  g.lineWidth = mode === 'wax' ? 3 : 2.4; g.strokeStyle = mode === 'wax' ? PAL.wax : PAL.cream;
  for (let k = -4; k <= 4; k++) for (const o of [-13, 13]) { g.beginPath(); g.moveTo(-2000, k * PS + PS / 2 + o); g.lineTo(2000, k * PS + PS / 2 + o); g.stroke(); }
}
/** Seamless PARANG tile (PT x PT). mode: 'wax' (amber lines on transparent), 'dyed' (full colour), 'ink' (lines only). */
export function parangTile(mode = 'dyed', ground = PAL.soga, scale = 1) {
  return cached(`bt-parang:${mode}:${ground}:${scale}`, () => {
    const T = Math.round(PT * scale), c = makeCanvas(T, T), g = c.getContext('2d');
    g.scale(scale, scale);
    if (mode === 'dyed') { g.fillStyle = ground; g.fillRect(0, 0, PT, PT); }
    g.translate(PT / 2, PT / 2); g.rotate(-Math.PI / 4);
    parangUnits(g, mode === 'dyed' ? 'fill' : mode === 'wax' ? 'wax' : 'ink');
    return c;
  });
}
/** KAWUNG tile: four ovals (palm fruit) around each node, a cross in the centre. */
export function kawungTile(ground = PAL.indigo, line = PAL.cream, fill = PAL.indigoLt, S = 120) {
  return cached(`bt-kawung:${ground}:${line}:${fill}:${S}`, () => {
    const c = makeCanvas(S, S), g = c.getContext('2d');
    g.fillStyle = ground; g.fillRect(0, 0, S, S);
    const nodes = [[0, 0], [S, 0], [0, S], [S, S], [S / 2, S / 2]];
    for (const [x, y] of nodes) for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2, d = S * 0.25;
      g.save(); g.translate(x + Math.cos(a) * d, y + Math.sin(a) * d); g.rotate(a);
      g.beginPath(); g.ellipse(0, 0, S * 0.24, S * 0.13, 0, 0, TAU); g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = line; g.stroke();
      g.beginPath(); g.ellipse(0, 0, S * 0.12, S * 0.05, 0, 0, TAU); g.stroke();
      g.fillStyle = line; g.beginPath(); g.arc(S * 0.13, 0, 2.2, 0, TAU); g.fill();
      g.restore();
    }
    g.strokeStyle = line; g.lineWidth = 2; for (const [x, y] of nodes) { g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.moveTo(x, y - 6); g.lineTo(x, y + 6); g.stroke(); }
    return c;
  });
}
/** MEGA MENDUNG cloud (Cirebon): concentric rounded cloud outlines in 7 graded blues. */
export function megaTile(mode = 'dyed', ground = '#8c1f19', S = 280) {
  return cached(`bt-mega-tile:${mode}:${ground}:${S}`, () => {
    const c = makeCanvas(S, S), g = c.getContext('2d');
    if (mode === 'dyed') { g.fillStyle = ground; g.fillRect(0, 0, S, S); }
    const lobes = [[-72, 0, 42], [-24, -24, 48], [30, -18, 45], [72, 6, 36], [12, 18, 42], [-48, 24, 34]];
    const pts = [[S * 0.5, S * 0.28], [0, S * 0.78], [S, S * 0.78]];
    for (const [cx, cy] of pts) {
      g.save(); g.translate(cx, cy);
      PAL.mega.forEach((col, i) => {
        const k = 1 - i * 0.13;
        g.beginPath();
        lobes.forEach(([lx, ly, r]) => { g.moveTo(lx * k + r * k, ly * k); g.arc(lx * k, ly * k, r * k, 0, TAU); });
        if (mode === 'dyed') { g.fillStyle = col; g.fill(); g.strokeStyle = PAL.cream; g.lineWidth = 2; g.stroke(); }
        else { g.strokeStyle = PAL.wax; g.lineWidth = 3; g.stroke(); }
      });
      g.restore();
    }
    return c;
  });
}
export function megaMendung(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const lobes = [[-120, 0, 70], [-40, -40, 80], [50, -30, 75], [120, 10, 60], [20, 30, 70], [-80, 40, 55]];
  PAL.mega.forEach((col, i) => {
    const k = 1 - i * 0.13;
    ctx.fillStyle = col; ctx.beginPath();
    lobes.forEach(([lx, ly, r]) => { ctx.moveTo(lx * k + r * k, ly * k); ctx.arc(lx * k, ly * k, r * k + Math.sin(t * 1.5 + i) * 1.5, 0, TAU); });
    ctx.fill();
  });
  ctx.restore();
}
/** Fill the current path / rect with a motif pattern anchored in world space (offset ox, oy, scale). */
export function motifFill(ctx, tile, { ox = 0, oy = 0, s = 1, rot = 0 } = {}) {
  const p = ctx.createPattern(tile, 'repeat');
  p.setTransform(new DOMMatrix().translate(ox, oy).rotate((rot * 180) / Math.PI).scale(s, s));
  ctx.fillStyle = p;
}

// ---------------- the batik process ----------------
/**
 * Draw a cloth panel (screen rect) that shows a motif in the process of being made.
 *  wax: 0..1 sweep of the canting (diagonal reveal of the wax lines on white cloth)
 *  dye: 0..1 dye level rising from the bottom (ground colour floods, wax lines stay cream)
 *  crack: 0..1 crackle veins
 * Returns the canting tip position (screen) at the sweep front.
 */
export function cloth(ctx, t, { x = 0, y = 0, w = 1080, h = 1920, wax = 1, dye = 0, crack = 0, ground = PAL.soga, tileS = 1, ox = 0, oy = 0, tiles = null } = {}) {
  const T = tiles || { wax: parangTile('wax', ground, tileS), dyed: parangTile('dyed', ground, tileS) };
  ctx.save();
  ctx.fillStyle = PAL.mori; ctx.fillRect(x, y, w, h);
  // sweep front: line x' + y' = f
  const D = w + h, f = wax * D;
  if (wax > 0) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + f, y); ctx.lineTo(x, y + f); ctx.closePath(); ctx.clip();
    motifFill(ctx, T.wax, { ox, oy }); ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
  if (dye > 0) {
    const lv = y + h * (1 - dye);
    ctx.save(); ctx.beginPath(); ctx.moveTo(x, y + h);
    for (let k = 0; k <= 24; k++) { const xx = x + (k / 24) * w; ctx.lineTo(xx, lv + Math.sin(k * 1.3 + t * 4) * 12 * (1 - dye)); }
    ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.clip();
    motifFill(ctx, T.dyed, { ox, oy }); ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
  ctx.restore();
  const fx = x + clamp(f - h * 0.5, 0, w), fy = y + (f - (fx - x));
  return [fx, Math.min(y + h, fy)];
}
/** The canting: copper bowl with a curved spout, long bamboo handle, a hand holding it, wax smoke. (x,y) = spout tip. */
export function canting(ctx, x, y, t, { s = 1, rot = -0.5, hand = true, glow = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  // hot wax bead at the tip
  if (glow > 0) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 26); g.addColorStop(0, `rgba(255,236,170,${0.9 * glow})`); g.addColorStop(1, 'rgba(255,200,90,0)'); ctx.fillStyle = g; ctx.fillRect(-26, -26, 52, 52); }
  // spout
  ctx.strokeStyle = '#8a4a1c'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(6, -24, 26, -36); ctx.stroke();
  // bowl
  const bg = ctx.createLinearGradient(20, -70, 70, -30); bg.addColorStop(0, '#e9a464'); bg.addColorStop(0.5, PAL.copper); bg.addColorStop(1, '#6e3412');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(46, -46, 30, 20, -0.5, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,200,.6)'; ctx.beginPath(); ctx.ellipse(40, -54, 10, 4, -0.5, 0, TAU); ctx.fill();
  // bamboo handle
  ctx.save(); ctx.translate(60, -60); ctx.rotate(-0.55);
  ctx.fillStyle = PAL.bamboo; ctx.fillRect(0, -6, 260, 12); ctx.fillStyle = '#8f6b2c'; for (const k of [70, 150, 230]) ctx.fillRect(k, -7, 5, 14);
  if (hand) { // fingers pinching the handle
    ctx.fillStyle = PAL.skin; ctx.beginPath(); ctx.ellipse(110, 8, 46, 26, 0.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(70, -8, 26, 11, -0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#a86c3a'; ctx.beginPath(); ctx.ellipse(150, 18, 60, 30, 0.3, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // wax smoke wisps
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
  for (let i = 0; i < 2; i++) { ctx.beginPath(); const ph = t * 1.5 + i * 2; ctx.moveTo(46, -66); for (let k = 1; k < 8; k++) ctx.lineTo(46 + Math.sin(ph + k * 0.8) * 8 * k * 0.4, -66 - k * 12); ctx.stroke(); }
  ctx.restore();
}

// ---------------- batik line-art figures ----------------
const OUT = 4.5;
function lineShape(ctx, path, fill, { line = PAL.cream, lw = OUT } = {}) {
  ctx.beginPath(); path(ctx); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.lineWidth = lw; ctx.strokeStyle = line; ctx.lineJoin = 'round'; ctx.stroke();
}
function dots(ctx, x, y, w, h, step = 16, r = 2.2, col = PAL.cream) { ctx.fillStyle = col; for (let yy = y; yy < y + h; yy += step) for (let xx = x + ((yy / step) % 2) * step / 2; xx < x + w; xx += step) { ctx.beginPath(); ctx.arc(xx, yy, r, 0, TAU); ctx.fill(); } }
function headProfile(ctx, { cap = 'blangkon', eyesClosed = false, hair = PAL.ink, skin = PAL.skin, look = 0, bun = false }) {
  // head centred at (0,0), r≈46, facing right
  lineShape(ctx, (g) => { g.ellipse(0, 0, 42, 48, 0, 0, TAU); g.moveTo(40, -8); g.lineTo(58, 12); g.lineTo(38, 18); }, skin);
  ctx.fillStyle = PAL.cream;
  if (eyesClosed) { ctx.lineWidth = 3; ctx.strokeStyle = PAL.ink; ctx.beginPath(); ctx.arc(22 + look, -6, 8, 0.2, Math.PI - 0.2); ctx.stroke(); }
  else { ctx.beginPath(); ctx.ellipse(22 + look, -6, 9, 5, -0.2, 0, TAU); ctx.fill(); ctx.fillStyle = PAL.ink; ctx.beginPath(); ctx.arc(25 + look, -6, 3.4, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = PAL.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(30, 26); ctx.lineTo(42, 24); ctx.stroke();
  if (cap === 'blangkon') lineShape(ctx, (g) => { g.moveTo(-44, 8); g.quadraticCurveTo(-50, -54, 6, -54); g.quadraticCurveTo(40, -52, 38, -24); g.lineTo(-30, -14); g.lineTo(-44, 8); g.moveTo(-44, -4); g.arc(-50, -4, 16, 0, TAU); }, PAL.indigo);
  else if (cap === 'kuluk') lineShape(ctx, (g) => { g.moveTo(-40, -20); g.lineTo(-30, -110); g.lineTo(30, -116); g.lineTo(36, -24); g.closePath(); }, PAL.indigoDk);
  else if (cap === 'hair') { lineShape(ctx, (g) => { g.moveTo(-44, 14); g.quadraticCurveTo(-48, -56, 10, -52); g.quadraticCurveTo(40, -46, 34, -22); g.lineTo(-10, -26); g.lineTo(-30, 20); g.closePath(); }, hair); if (bun) lineShape(ctx, (g) => g.arc(-46, -18, 20, 0, TAU), hair); }
  if (cap === 'kuluk') { ctx.fillStyle = PAL.gold; ctx.fillRect(-36, -34, 70, 8); }
}
/**
 * Batik figure. kind: 'senopati' (seated, meditating), 'sultan', 'abdi' (kneeling, sembah), 'walker'.
 * o: { x, y (feet/seat), s, face, t, arm, look, closed, phase (walk), cloth: tile for the kain, top: tile/colour for the top, cap }
 */
export function figure(ctx, kind, o = {}) {
  const { x, y, s = 1, face = 1, t = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * face, s);
  const kain = o.cloth || parangTile('dyed', PAL.soga, 0.5), top = o.top ?? PAL.indigoDk;
  const pat = (tile) => { if (typeof tile === 'string') ctx.fillStyle = tile; else motifFill(ctx, tile, { s: 1 }); return ctx.fillStyle; };
  if (kind === 'senopati') {
    const br = Math.sin(t * 1.4) * 3;
    // crossed legs (sila) in a striped lurik kain
    lineShape(ctx, (g) => { g.moveTo(-120, 0); g.quadraticCurveTo(-130, -70, -40, -80); g.lineTo(90, -70); g.quadraticCurveTo(140, -40, 120, 0); g.closePath(); }, pat(o.cloth || PAL.sogaLt));
    ctx.strokeStyle = PAL.cream; ctx.lineWidth = 2; for (let k = -100; k < 110; k += 18) { ctx.beginPath(); ctx.moveTo(k, -70); ctx.lineTo(k + 10, -4); ctx.stroke(); }
    // torso, breathing
    lineShape(ctx, (g) => { g.moveTo(-40, -78); g.lineTo(-46, -230 - br); g.quadraticCurveTo(0, -262 - br, 40, -232 - br); g.lineTo(48, -80); g.closePath(); }, PAL.skin);
    lineShape(ctx, (g) => { g.moveTo(-50, -84); g.lineTo(52, -84); g.lineTo(48, -120); g.lineTo(-48, -118); g.closePath(); }, PAL.red);
    // hands resting in the lap / raised in wonder
    const a = o.arm || 0;
    ctx.save(); ctx.translate(26, -210 - br); ctx.rotate(0.6 - a * 1.6);
    lineShape(ctx, (g) => { g.moveTo(-12, 0); g.lineTo(12, 0); g.lineTo(10, 110); g.lineTo(-10, 110); g.closePath(); }, PAL.skin);
    ctx.translate(0, 110); ctx.rotate(-1.4 + a * 0.6); lineShape(ctx, (g) => { g.moveTo(-10, 0); g.lineTo(10, 0); g.lineTo(8, 80); g.arc(0, 86, 12, 0, Math.PI); g.lineTo(-8, 80); g.closePath(); }, PAL.skin);
    ctx.restore();
    ctx.save(); ctx.translate(4, -290 - br); ctx.rotate(o.look || 0); headProfile(ctx, { cap: 'blangkon', eyesClosed: o.closed !== false }); ctx.restore();
  } else if (kind === 'sultan' || kind === 'walker') {
    const ph = o.phase || 0, sw = kind === 'walker' ? Math.sin(ph * TAU) : 0, bob = kind === 'walker' ? -Math.abs(Math.cos(ph * TAU)) * 6 : 0;
    ctx.translate(0, bob);
    // legs
    for (const [sd, k] of [[-1, 0.8], [1, 1]]) {
      ctx.save(); ctx.translate(0, -230); ctx.rotate(sd * sw * 0.35);
      lineShape(ctx, (g) => { g.moveTo(-14, 0); g.lineTo(14, 0); g.lineTo(12, 226); g.lineTo(46, 230); g.lineTo(-12, 232); g.closePath(); }, o.legs || PAL.skin);
      ctx.restore();
    }
    // kain (sarong) with the motif — the sultan's is long, the walker's depends on o.kain
    if (kind === 'sultan' || o.kain) lineShape(ctx, (g) => { g.moveTo(-58, -250); g.lineTo(60, -250); g.lineTo(70 + sw * 8, -40); g.lineTo(-64 + sw * 8, -40); g.closePath(); }, pat(kain));
    // torso / top
    lineShape(ctx, (g) => { g.moveTo(-50, -250); g.lineTo(-52, -420); g.quadraticCurveTo(0, -446, 46, -420); g.lineTo(52, -250); g.closePath(); }, pat(top));
    if (kind === 'sultan') { ctx.fillStyle = PAL.gold; ctx.fillRect(-52, -262, 104, 12); lineShape(ctx, (g) => { g.moveTo(-50, -270); g.lineTo(-110, -330); g.lineTo(-100, -340); g.lineTo(-40, -284); }, PAL.sogaDk); }
    // arms
    const a = o.arm ?? 0;
    for (const [sd, ang] of [[-1, -sw * 0.4], [1, sw * 0.4 + a]]) {
      ctx.save(); ctx.translate(sd * 4, -410); ctx.rotate(-ang);
      lineShape(ctx, (g) => { g.moveTo(-13, 0); g.lineTo(13, 0); g.lineTo(10, 150); g.arc(0, 158, 13, 0, Math.PI); g.lineTo(-10, 150); g.closePath(); }, typeof top === 'string' ? top : PAL.skin);
      ctx.restore();
    }
    ctx.save(); ctx.translate(6, -480); headProfile(ctx, { cap: o.cap || (kind === 'sultan' ? 'kuluk' : 'hair'), eyesClosed: o.closed, bun: o.bun, hair: o.hair }); ctx.restore();
  } else if (kind === 'abdi') { // kneeling servant doing sembah (palms together before the face)
    const bow = o.bow || 0;
    lineShape(ctx, (g) => { g.moveTo(-90, 0); g.quadraticCurveTo(-100, -60, -30, -70); g.lineTo(70, -60); g.quadraticCurveTo(100, -30, 80, 0); g.closePath(); }, pat(o.cloth || kawungTile(PAL.soga, PAL.cream, PAL.sogaLt, 60)));
    ctx.save(); ctx.translate(0, -60); ctx.rotate(bow * 0.35);
    lineShape(ctx, (g) => { g.moveTo(-36, 0); g.lineTo(-40, -150); g.quadraticCurveTo(0, -170, 34, -150); g.lineTo(40, 0); g.closePath(); }, PAL.skin);
    lineShape(ctx, (g) => { g.moveTo(20, -130); g.lineTo(60, -110); g.lineTo(66, -170); g.lineTo(54, -172); g.lineTo(48, -122); g.closePath(); }, PAL.skin);
    ctx.save(); ctx.translate(4, -200); headProfile(ctx, { cap: 'blangkon', eyesClosed: true }); ctx.restore();
    ctx.restore();
  }
  ctx.restore();
}

// ---------------- scenery in batik language ----------------
/** Batik-pesisir sea: rows of curling wave crests (cream lines on indigo), animated. */
export function sea(ctx, t, { y = 900, h = 1100, rows = 7, speed = 1, hit = 0 } = {}) {
  ctx.save();
  ctx.fillStyle = PAL.indigo; ctx.fillRect(-200, y, 1500, h);
  for (let r = 0; r < rows; r++) {
    const yy = y + 30 + r * (h / rows), amp = 18 + r * 6, len = 150 + r * 30, off = (t * 60 * speed * (1 + r * 0.25) + r * 70) % len;
    ctx.strokeStyle = PAL.cream; ctx.lineWidth = 3 + r * 0.4; ctx.fillStyle = r % 2 ? PAL.indigoLt : '#2a3f78';
    for (let x = -len * 2 + off; x < 1300; x += len) {
      ctx.beginPath(); ctx.moveTo(x, yy + amp); ctx.quadraticCurveTo(x + len * 0.3, yy - amp, x + len * 0.6, yy - amp * 0.4);
      ctx.arc(x + len * 0.6 - amp * 0.35, yy - amp * 0.2, amp * 0.4, -0.5, Math.PI * 1.3, false);
      ctx.quadraticCurveTo(x + len * 0.8, yy + amp * 0.6, x + len, yy + amp); ctx.lineTo(x + len, yy + amp * 1.6); ctx.lineTo(x, yy + amp * 1.6); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAL.cream; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x + len * (0.2 + k * 0.15), yy + amp * 0.9, 2.2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = r % 2 ? PAL.indigoLt : '#2a3f78';
    }
  }
  ctx.restore();
}
/** Karang (coral rock) in batik line-art, with spray when hit (0..1). */
export function karang(ctx, x, y, s = 1, hit = 0, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  lineShape(ctx, (g) => { g.moveTo(-200, 40); g.quadraticCurveTo(-220, -80, -120, -150); g.quadraticCurveTo(-40, -220, 40, -170); g.quadraticCurveTo(160, -150, 200, -40); g.lineTo(220, 40); g.closePath(); }, PAL.sogaLt);
  ctx.fillStyle = PAL.sogaDk; for (const [a, b, r] of [[-100, -90, 22], [-20, -130, 18], [60, -80, 26], [130, -40, 16], [-150, -20, 14]]) { ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill(); ctx.strokeStyle = PAL.cream; ctx.lineWidth = 2; ctx.stroke(); }
  dots(ctx, -180, -60, 360, 90, 22, 2, PAL.cream);
  if (hit > 0) { // spray of cream droplets and a curling crest
    ctx.fillStyle = PAL.cream;
    for (let i = 0; i < 30; i++) { const a = -Math.PI * (0.15 + 0.7 * hrand(i, 1)), d = (80 + hrand(i, 2) * 260) * ease.outCubic(hit); ctx.globalAlpha = 1 - hit * 0.7; ctx.beginPath(); ctx.arc(-140 + Math.cos(a) * d, -120 + Math.sin(a) * d + hit * hit * 120, 3 + hrand(i, 3) * 6, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
/** Royal parasol (songsong / payung agung) in gold. */
export function payung(ctx, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.2) * 0.02);
  ctx.fillStyle = PAL.sogaDk; ctx.fillRect(-5, 0, 10, 520);
  lineShape(ctx, (g) => { g.moveTo(-170, 60); g.quadraticCurveTo(0, -80, 170, 60); g.closePath(); }, PAL.gold);
  for (let k = -150; k <= 150; k += 30) { ctx.fillStyle = PAL.red; ctx.beginPath(); ctx.moveTo(k - 12, 60); ctx.lineTo(k, 90); ctx.lineTo(k + 12, 60); ctx.fill(); }
  ctx.restore();
}
/** Keraton gate (regol) in batik line-art: white walls, stepped roof, a kawung frieze. */
export function regol(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  lineShape(ctx, (g) => { g.rect(-300, -360, 600, 360); }, '#e8d6b0');
  ctx.save(); ctx.beginPath(); ctx.rect(-300, -360, 600, 70); motifFill(ctx, kawungTile(PAL.soga, PAL.cream, PAL.sogaLt, 70)); ctx.fill(); ctx.restore();
  lineShape(ctx, (g) => { g.moveTo(-360, -360); g.lineTo(-200, -500); g.lineTo(200, -500); g.lineTo(360, -360); g.closePath(); }, PAL.sogaDk);
  lineShape(ctx, (g) => { g.moveTo(-200, -500); g.lineTo(-100, -590); g.lineTo(100, -590); g.lineTo(200, -500); g.closePath(); }, PAL.soga);
  lineShape(ctx, (g) => { g.moveTo(-90, 0); g.lineTo(-90, -220); g.quadraticCurveTo(0, -290, 90, -220); g.lineTo(90, 0); g.closePath(); }, PAL.sogaDk);
  ctx.restore();
}

// ---------------- text ----------------
/** Keraton plaque: dark soga band, thin gold rule, cream Playfair text. */
export function plaque(ctx, text, x, y, { size = 50, alpha = 1, sub = null, font = 'Playfair Display' } = {}) {
  if (alpha <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= clamp(alpha);
  ctx.font = `700 ${size}px '${font}'`; const w = ctx.measureText(text).width + size * 1.4;
  let sw = 0; if (sub) { ctx.font = `italic 400 ${size * 0.55}px '${font}'`; sw = ctx.measureText(sub).width + size; }
  const W = Math.max(w, sw), H = size * (sub ? 2.15 : 1.5), e = ease.outCubic(clamp(alpha));
  ctx.translate(x, y + (1 - e) * 20);
  ctx.fillStyle = 'rgba(40,22,10,.92)'; ctx.fillRect(-W / 2, -H / 2, W, H);
  ctx.strokeStyle = PAL.gold; ctx.lineWidth = 2; ctx.strokeRect(-W / 2 + 7, -H / 2 + 7, W - 14, H - 14);
  ctx.fillStyle = PAL.cream; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${size}px '${font}'`; ctx.fillText(text, 0, sub ? -size * 0.38 : size * 0.04);
  if (sub) { ctx.fillStyle = PAL.wax; ctx.font = `italic 400 ${size * 0.55}px '${font}'`; ctx.fillText(sub, 0, size * 0.5); }
  ctx.restore();
}
/** Words "written in wax" with a reveal (0..1), cream with amber glow. */
export function waxText(ctx, text, x, y, p, { size = 90, font = 'Playfair Display', col = PAL.cream } = {}) {
  if (p <= 0) return;
  ctx.save(); ctx.font = `italic 700 ${size}px '${font}'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width;
  ctx.beginPath(); ctx.rect(x - w / 2 - 20, y - size, (w + 40) * clamp(p), size * 2); ctx.clip();
  ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(40,20,8,.75)'; ctx.lineJoin = 'round'; ctx.strokeText(text, x, y);
  ctx.shadowColor = 'rgba(255,210,120,.8)'; ctx.shadowBlur = 18; ctx.fillStyle = col; ctx.fillText(text, x, y);
  ctx.restore();
}

export { ease, clamp, lerp, hrand };
