// AniMasters style kit: KOTAK CAHAYA KERTAS (paper shadow-box / lightbox).
// A deep frame holds 5–7 sheets of cut paper, one behind the other, lit from BEHIND by a coloured LED panel.
// The backlight is a gradient (blue / violet / orange); each sheet is a silhouette whose colour comes from how
// much light passes through the sheets in front of it: far sheets are pale and hazy, near sheets almost black.
// Light leaks around every cut edge (rim glow), haze sits between the sheets, and the camera parallax makes the
// depth obvious. Signature moves: sheets slide in, the backlight changes colour with the mood, lightning flashes
// the panel, silhouettes (rod puppets) move on their own sheet.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU, mixHex } from '/engine/lib/core.js';
import { makeCanvas, cached, paperTexture, alphaTexture } from '/engine/lib/draw.js';

export const LIGHTS = {
  dusk: ['#2a1f5c', '#7a3f8f', '#f08a4b', '#ffd59a'],
  dawn: ['#1c2c5e', '#4c6fb0', '#f3a86a', '#ffe7b8'],
  gold: ['#3a2a52', '#b0577a', '#f6b15a', '#fff1c4'],
  violet: ['#120c2e', '#3a2470', '#8a4fb8', '#e3b8f0'],
  storm: ['#06081a', '#12204a', '#2c4a86', '#7fa6d8'],
  night: ['#05071a', '#0f1a44', '#26407e', '#9db8e8'],
};
export const PAL = { frame: '#2a1a10', frameHi: '#6b4428', card: '#14101c', ink: '#0c0a12' };

// ---------------- backlight ----------------
/** Backlight panel: vertical gradient (top -> horizon glow), blended between two light presets. */
export function backlight(ctx, t, A, B = null, k = 0, { sunY = 0.62, sun = 1 } = {}) {
  const L = B ? A.map((c, i) => mixHex(c, B[i], clamp(k))) : A;
  const c = cached('kc-bl', () => makeCanvas(135, 240)), g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 240);
  gr.addColorStop(0, L[0]); gr.addColorStop(0.35, L[1]); gr.addColorStop(sunY, L[2]); gr.addColorStop(Math.min(1, sunY + 0.12), L[3]); gr.addColorStop(1, L[2]);
  g.fillStyle = gr; g.fillRect(0, 0, 135, 240);
  if (sun > 0) { const r = g.createRadialGradient(80, 240 * sunY, 2, 80, 240 * sunY, 70); r.addColorStop(0, `rgba(255,248,225,${0.95 * sun})`); r.addColorStop(0.25, `rgba(255,220,160,${0.5 * sun})`); r.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = r; g.fillRect(0, 0, 135, 240); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(c, 0, 0, 1080, 1920); ctx.restore();
  return L;
}
/** Colour of a sheet at depth d (0 = far/pale .. 1 = near/dark) under light L. */
export function sheetColor(L, d) {
  const base = mixHex(L[1], L[0], 0.5);
  return mixHex(mixHex(L[2], base, 0.55), '#07050c', clamp(d));
}

// ---------------- sheets ----------------
/**
 * A cut-paper sheet: shape(g) fills a silhouette in white on a W x H canvas (world px). Cached as an alpha mask,
 * plus a small blurred copy for the rim glow. Draw with drawSheet(ctx, S, colour, ...).
 */
export function sheet(key, W, H, shape) {
  return cached('kc-sheet:' + key, () => {
    const c = makeCanvas(W, H), g = c.getContext('2d');
    g.fillStyle = '#fff'; shape(g, W, H);
    const gl = makeCanvas(Math.ceil(W / 8), Math.ceil(H / 8)), gg = gl.getContext('2d');
    gg.filter = 'blur(2px)'; gg.drawImage(c, 0, 0, gl.width, gl.height);
    return { c, gl, W, H, tint: new Map() };
  });
}
function tinted(S, col) {
  if (S.tint.has(col)) return S.tint.get(col);
  if (S.tint.size > 3) S.tint.clear();
  const c = makeCanvas(S.W, S.H), g = c.getContext('2d');
  g.drawImage(S.c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, S.W, S.H);
  // paper fibre visible where the light shines through
  g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 0.35;
  g.drawImage(alphaTexture(paperTexture(512, 512, { base: '#808080', fiber: 0.16, blotch: 0.1, seed: 5, grainAmt: 26 }), 1), 0, 0, S.W, S.H);
  S.tint.set(col, c); return c;
}
const q = (c) => c.replace(/^#/, '').slice(0, 6);
/** Draw a sheet at (x,y) (top-left in world px), coloured, with a rim glow of light leaking around it. */
export function drawSheet(ctx, S, col, x, y, { glow = 0.5, glowCol = '#ffd9a0', s = 1, alpha = 1 } = {}) {
  // quantise colour to keep the tint cache small
  const n = parseInt(q(col), 16), qc = '#' + [16, 8, 0].map((sh) => (Math.round(((n >> sh) & 255) / 8) * 8).toString(16).padStart(2, '0')).join('').slice(0, 6);
  ctx.save(); ctx.globalAlpha *= alpha;
  if (glow > 0) { // the glow is the sheet's own blurred silhouette in light colour, slightly larger
    const gc = cached('kc-glowc:' + S.W + ':' + S.H + (S.__id || (S.__id = Math.random())) + glowCol, () => { const c = makeCanvas(S.gl.width, S.gl.height), g = c.getContext('2d'); g.drawImage(S.gl, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = glowCol; g.fillRect(0, 0, c.width, c.height); return c; });
    ctx.globalAlpha *= glow; ctx.drawImage(gc, x - 14 * s, y - 18 * s, S.W * s + 28 * s, S.H * s + 24 * s); ctx.globalAlpha /= glow;
  }
  ctx.drawImage(tinted(S, qc), x, y, S.W * s, S.H * s);
  ctx.restore();
}
/** Haze between sheets: a soft band of light colour at the horizon (cheap stretched gradient). */
export function haze(ctx, L, y, h, a = 0.25) {
  const c = cached('kc-haze', () => { const c = makeCanvas(4, 64), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 64); return c; });
  const t = cached('kc-hazet:' + L[3], () => { const k = makeCanvas(4, 64), g = k.getContext('2d'); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = L[3]; g.fillRect(0, 0, 4, 64); return k; });
  ctx.save(); ctx.globalAlpha *= a; ctx.drawImage(t, -300, y - h / 2, 1680, h); ctx.restore();
}

// ---------------- silhouette shapes (draw into g with fill already set) ----------------
const P = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };
/** Rolling hills / ridges along the bottom of a W x H sheet from y0 with amplitude. */
export function ridges(g, W, H, y0, amp, seed, { peaks = 0 } = {}) {
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 10) { let y = y0 + noise.fbm2(x * 0.004 + seed, seed, 3) * amp; if (peaks) y -= Math.pow(Math.max(0, Math.sin(x / W * Math.PI * peaks + seed)), 4) * amp * 2; g.lineTo(x, y); }
  g.lineTo(W, H); g.closePath(); g.fill();
}
/** Minangkabau rumah gadang: curved gonjong horns rising from the roof. Anchor bottom-centre. */
export function rumahGadang(g, x, y, s = 1, horns = 4) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillRect(-160, -120, 320, 120); // body on stilts
  for (let i = -150; i <= 150; i += 50) g.fillRect(i - 6, 0, 12, 40);
  g.beginPath(); g.moveTo(-200, -120);
  const step = 400 / (horns - 1);
  for (let i = 0; i < horns; i++) {
    const hx = -200 + i * step, top = -300 - (i === 0 || i === horns - 1 ? 40 : 0);
    g.quadraticCurveTo(hx - step * 0.25, -160, hx - 6, top); g.lineTo(hx + 6, top + 8);
    if (i < horns - 1) g.quadraticCurveTo(hx + step * 0.5, -170, hx + step - 6, -180);
  }
  g.lineTo(200, -120); g.closePath(); g.fill();
  g.restore();
}
export function palm(g, x, y, h = 360, s = 1, lean = 0.1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-8, 0); g.quadraticCurveTo(lean * h * 0.5, -h * 0.5, lean * h, -h); g.lineTo(lean * h + 10, -h); g.quadraticCurveTo(lean * h * 0.5 + 12, -h * 0.5, 10, 0); g.fill();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU, L = 110; g.save(); g.translate(lean * h + 5, -h); g.rotate(a); g.beginPath(); g.moveTo(0, -6); g.quadraticCurveTo(L * 0.5, -26, L, 14); g.quadraticCurveTo(L * 0.5, -4, 0, 6); g.fill(); g.restore(); }
  g.restore();
}
/** Sailing ship (big merchant ship with three masts). Anchor at waterline centre, facing right. */
export function ship(g, x, y, s = 1, { broken = 0, sails = 1 } = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(broken * 0.3);
  P(g, [[-260, -60], [240, -60], [300, -110], [250, -20], [190, 30], [-200, 30], [-270, -10], [-300, -100]]);
  for (const [mx, mh] of [[-140, 330], [10, 400], [150, 300]]) {
    g.fillRect(mx - 5, -60 - mh * (1 - broken * 0.5), 10, mh * (1 - broken * 0.5));
    if (sails > 0 && !(broken > 0.3 && mx === 10)) for (let k = 0; k < 2; k++) { const sy = -60 - mh * (0.35 + k * 0.33); P(g, [[mx - 70 * sails, sy], [mx + 70 * sails, sy], [mx + 80 * sails, sy + 90], [mx - 80 * sails, sy + 90]]); }
  }
  g.beginPath(); g.moveTo(-300, -100); g.lineTo(-140, -380); g.lineTo(10, -460); g.lineTo(150, -360); g.lineTo(300, -110); g.lineWidth = 3; g.strokeStyle = g.fillStyle; g.stroke();
  g.restore();
}
/** Small fishing boat (perahu). */
export function boat(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); P(g, [[-120, -20], [120, -20], [150, -50], [110, 12], [-110, 12], [-150, -50]]); g.fillRect(-4, -200, 8, 180); P(g, [[4, -190], [90, -40], [4, -40]]); g.restore(); }

// ---------------- silhouette puppets (drawn live on their sheet) ----------------
/**
 * who: 'malin' (young man; rich=true adds hat & coat), 'ibu' (old mother, bent, headscarf), 'istri' (wife), 'awak' (sailor)
 * o: {x, y, s, face, t, walk, armF, armB, bend, kneel, stone (0..1 turns into rock)}
 */
export function puppet(ctx, who, col, o = {}) {
  const { x, y, s = 1, face = 1, t = 0 } = o;
  const ph = o.walk, w = ph != null ? Math.sin(ph * TAU) : 0, bob = ph != null ? -Math.abs(Math.cos(ph * TAU)) * 5 : 0;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(s * face, s); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineCap = 'round';
  const bend = o.bend || 0, kneel = o.kneel || 0;
  const hipY = -200 + kneel * 90;
  // legs
  if (who !== 'ibu' && who !== 'istri') {
    for (const sd of [-1, 1]) { ctx.save(); ctx.translate(0, hipY); ctx.rotate(sd * w * 0.4 - kneel * 0.9 * (sd > 0 ? 1 : 0.2)); ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 100 - kneel * 10); ctx.stroke(); ctx.translate(0, 100 - kneel * 10); ctx.rotate(kneel * 1.6 * (sd > 0 ? 1 : 0.3) - sd * w * 0.2); ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 96); ctx.stroke(); ctx.beginPath(); ctx.ellipse(12, 98, 22, 9, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  } else { // long kain to the ground, swaying
    P(ctx, [[-34, hipY - 10], [34, hipY - 10], [44 + w * 10, 0], [-48 + w * 10, 0]]);
  }
  ctx.save(); ctx.translate(0, hipY); ctx.rotate(bend * 0.6);
  // torso
  if (who === 'malin' && o.rich) P(ctx, [[-36, 10], [40, 10], [44, -150], [26, -170], [-30, -170], [-44, -150]]); // long coat
  else P(ctx, [[-30, 0], [32, 0], [36, -150], [20, -166], [-24, -166], [-36, -150]]);
  // arms on rods: [shoulder angle, elbow angle]
  const arm = ([a1, a2], sx) => { ctx.save(); ctx.translate(sx, -150); ctx.rotate(-a1); ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 78); ctx.stroke(); ctx.translate(0, 78); ctx.rotate(-a2); ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 70); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 76, 10, 0, TAU); ctx.fill(); ctx.restore(); };
  arm(o.armB || [-0.2 - w * 0.4, 0.3], -6);
  // head
  ctx.save(); ctx.translate(4, -196);
  ctx.beginPath(); ctx.ellipse(0, 0, 26, 30, 0, 0, TAU); ctx.fill();
  P(ctx, [[22, -6], [36, 6], [22, 10]]); // nose
  if (who === 'malin') { if (o.rich) { P(ctx, [[-40, -22], [44, -22], [30, -30], [24, -60], [-22, -60], [-28, -30]]); } else P(ctx, [[-26, -14], [24, -14], [20, -40], [-22, -40]]); } // peci / hat
  if (who === 'ibu') { P(ctx, [[-34, 26], [-36, -26], [0, -44], [30, -26], [26, -8], [-10, -20], [-20, 30]]); P(ctx, [[-30, -30], [-60, -50], [-40, -18]]); } // tengkuluk headscarf
  if (who === 'istri') { ctx.beginPath(); ctx.arc(-24, -14, 18, 0, TAU); ctx.fill(); P(ctx, [[-10, -30], [10, -56], [20, -30]]); }
  if (who === 'awak') P(ctx, [[-28, -12], [28, -12], [0, -48]]);
  ctx.restore();
  arm(o.armF || [0.2 + w * 0.4, 0.3], 10);
  if (who === 'ibu') { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(80, -60); ctx.lineTo(110, 200); ctx.stroke(); } // walking stick
  ctx.restore();
  ctx.restore();
}
/** Stylised waves as cut paper strips (animated); rough = storm. */
export function waves(ctx, t, y, col, { amp = 18, len = 180, speed = 1, rough = 0, h = 900 } = {}) {
  ctx.save(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-300, y + h);
  for (let x = -300; x <= 1400; x += 12) {
    const u = (x + t * 60 * speed) / len;
    const yy = y - Math.pow(Math.abs(Math.sin(u * Math.PI)), 0.6) * amp * (1 + rough * noise.n2(x * 0.004, t * 0.8) * 1.8);
    ctx.lineTo(x, yy);
  }
  ctx.lineTo(1400, y + h); ctx.closePath(); ctx.fill(); ctx.restore();
}
/** Fireflies / floating dust lit by the panel. */
export function motes(ctx, t, n, col, { y0 = 300, y1 = 1300 } = {}) {
  ctx.save(); ctx.fillStyle = col;
  for (let i = 0; i < n; i++) { const x = (hrand(i, 1) * 1200 + t * (10 + hrand(i, 2) * 20)) % 1200 - 60, y = lerp(y0, y1, hrand(i, 3)) + Math.sin(t * 1.3 + i) * 20; ctx.globalAlpha = 0.3 + 0.6 * Math.abs(Math.sin(t * 2 + i * 1.7)); ctx.beginPath(); ctx.arc(x, y, 2 + hrand(i, 4) * 3, 0, TAU); ctx.fill(); }
  ctx.restore();
}
/** The box: dark card frame with a deep bevel; the inner window has rounded corners. */
export function boxFrame(ctx, { inset = 46, r = 26 } = {}) {
  const F = cached('kc-frame2', () => {
    const c = makeCanvas(1080, 1920), g = c.getContext('2d');
    const win = (p) => { p.moveTo(inset + r, inset); p.arcTo(1080 - inset, inset, 1080 - inset, 1920 - inset, r); p.arcTo(1080 - inset, 1920 - inset, inset, 1920 - inset, r); p.arcTo(inset, 1920 - inset, inset, inset, r); p.arcTo(inset, inset, 1080 - inset, inset, r); p.closePath(); };
    // inner bevel: the depth of the box, a soft dark ring just inside the window
    g.save(); g.beginPath(); win(g); g.clip();
    g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 46; g.fillStyle = '#000';
    g.beginPath(); g.rect(-200, -200, 1480, 2320); win(g); g.fill('evenodd');
    g.restore();
    // the wooden frame itself (outside the window only)
    g.save(); g.beginPath(); g.rect(0, 0, 1080, 1920); win(g); g.clip('evenodd');
    g.fillStyle = PAL.frame; g.fillRect(0, 0, 1080, 1920);
    const wood = g.createLinearGradient(0, 0, 1080, 0); wood.addColorStop(0, 'rgba(255,255,255,.07)'); wood.addColorStop(0.5, 'rgba(0,0,0,.12)'); wood.addColorStop(1, 'rgba(255,255,255,.06)');
    g.fillStyle = wood; g.fillRect(0, 0, 1080, 1920);
    g.strokeStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < 1920; y += 7) { g.lineWidth = 1 + (y % 3); g.beginPath(); g.moveTo(0, y); g.lineTo(inset, y + 4); g.moveTo(1080 - inset, y); g.lineTo(1080, y + 3); g.stroke(); }
    g.restore();
    g.strokeStyle = PAL.frameHi; g.lineWidth = 3; g.beginPath(); win(g); g.stroke();
    return c;
  });
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(F, 0, 0); ctx.restore();
}
/** Title text cut from paper, lit from behind (dark letters with a light halo). */
export function litTitle(ctx, text, x, y, { size = 80, alpha = 1, font = 'Playfair Display', halo = '#ffe2b0', sub = null } = {}) {
  if (alpha <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= clamp(alpha); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${size}px '${font}'`; ctx.shadowColor = halo; ctx.shadowBlur = size * 0.5; ctx.fillStyle = '#0c0a12'; ctx.fillText(text, x, y + (1 - ease.outCubic(clamp(alpha))) * 20);
  ctx.shadowBlur = 0; ctx.lineWidth = 2; ctx.strokeStyle = halo; ctx.strokeText(text, x, y + (1 - ease.outCubic(clamp(alpha))) * 20);
  if (sub) { ctx.font = `italic 400 ${size * 0.42}px '${font}'`; ctx.shadowColor = halo; ctx.shadowBlur = 16; ctx.fillStyle = '#fff6e4'; ctx.fillText(sub, x, y + size * 0.85); }
  ctx.restore();
}

export { ease, clamp, lerp, hrand, mixHex };
