// AniMasters style kit: WAYANG KULIT (Javanese shadow puppets).
// Shadows of perforated leather puppets on a cotton screen (kelir) lit by an oil lamp (blencong).
// Signature moves: flickering lamp, light through the carved holes (tatahan), the gunungan opening/closing
// the scene, puppets gliding on rods (tuding), turning around in one flip, and a shadow that grows huge and
// soft when the dalang pulls the puppet towards the lamp.
import { clamp, lerp, ease, hrand, noise, mulberry32, TAU } from '/engine/lib/core.js';
import { makeCanvas, cached, paperTexture, alphaTexture } from '/engine/lib/draw.js';

export const PAL = {
  hot: '#fff1c9', warm: '#f6c46f', mid: '#d9822f', edge: '#7a3612', dark: '#1d0b04',
  shadow: '#120703', gold: '#f3c56b', goldDeep: '#b8862f', cream: '#fbe9c4',
};

// ---------------- light ----------------
/** Lamp flicker 0..1 (around 0.9). Frame-stable. */
export function flicker(t, amt = 1) {
  const n = noise.n2(t * 2.3, 4.1) * 0.5 + noise.n2(t * 7.9, 9.3) * 0.25 + Math.sin(t * 13.7) * 0.05;
  return 0.92 + n * 0.12 * amt;
}
export const LAMP = { x: 540, y: 640 };

/** World-space rectangle currently visible through the camera transform of ctx. */
export function viewRect(ctx, pad = 40) {
  const m = ctx.getTransform().inverse();
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const pts = [[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2];
}
/** The lit screen. `glow` scales brightness, `hx/hy` moves the hot spot. */
export function kelir(ctx, t, { glow = 1, hx = LAMP.x, hy = LAMP.y, flick = 1, warmth = 0 } = {}) {
  const f = flicker(t, flick) * glow;
  const [vx, vy, vw, vh] = viewRect(ctx);
  const jx = noise.n2(t * 1.7, 2) * 18 * flick, jy = noise.n2(t * 1.9, 7) * 12 * flick;
  // gradient painted small, then stretched (it is smooth anyway)
  const lo = cached('wk-kelir-lo', () => makeCanvas(180, 320)), g0 = lo.getContext('2d');
  const sx = 180 / vw, sy = 320 / vh;
  g0.setTransform(sx, 0, 0, sy, -vx * sx, -vy * sy);
  g0.fillStyle = PAL.dark; g0.fillRect(vx, vy, vw, vh);
  const g = g0.createRadialGradient(hx + jx, hy + jy, 10, hx + jx, hy + jy, 1450 * (0.85 + 0.15 * f));
  g.addColorStop(0, shadeCol(PAL.hot, f));
  g.addColorStop(0.18, shadeCol(PAL.warm, f));
  g.addColorStop(0.45, shadeCol(PAL.mid, f * 0.95));
  g.addColorStop(0.78, shadeCol(PAL.edge, f * 0.9));
  g.addColorStop(1, PAL.dark);
  g0.fillStyle = g; g0.fillRect(vx, vy, vw, vh);
  if (warmth) { g0.fillStyle = `rgba(255,120,30,${warmth * 0.4})`; g0.fillRect(vx, vy, vw, vh); }
  ctx.save(); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(lo, vx, vy, vw, vh);
  // cotton weave, in screen space at full res
  const tex = alphaTexture(paperTexture(540, 960, { base: '#808080', fiber: 0.12, blotch: 0.08, seed: 21, grainAmt: 26 }), 1);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 0.32;
  ctx.drawImage(tex, 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}
function shadeCol(hex, f) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const k = clamp(f, 0, 1.4);
  return `rgb(${Math.min(255, r * k) | 0},${Math.min(255, g * k) | 0},${Math.min(255, b * k) | 0})`;
}

/** Banana-trunk (gedebog) the puppets are stuck into, along the bottom of the screen. */
export function gedebog(ctx, y = 1780) {
  const [vx, , vw] = viewRect(ctx);
  const g = ctx.createLinearGradient(0, y - 30, 0, y + 200);
  g.addColorStop(0, 'rgba(18,7,3,0)'); g.addColorStop(0.18, 'rgba(18,7,3,0.92)'); g.addColorStop(1, '#0a0402');
  ctx.fillStyle = g; ctx.fillRect(vx, y - 30, vw, 900);
}

// ---------------- geometry helpers ----------------
export function spline(ctx, pts, closed = true, tension = 0.5) {
  const n = pts.length;
  if (n < 3) return;
  const P = (i) => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  ctx.moveTo(pts[0][0], pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) * tension) / 3, p1[1] + ((p2[1] - p0[1]) * tension) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * tension) / 3, p2[1] - ((p3[1] - p1[1]) * tension) / 3];
    ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
const shape = (g, pts, t = 0.5) => { g.beginPath(); spline(g, pts, true, t); g.fill(); };
const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); };

/** Holes (tatahan) are cut with destination-out. */
function holesAlong(g, pts, { step = 18, r = 4, closed = false, jitter = 0 } = {}) {
  const segs = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let d = 0; d < L; d += step) {
      const u = d / L;
      g.beginPath(); g.arc(lerp(a[0], b[0], u) + (jitter ? Math.sin(i * 7 + d) * jitter : 0), lerp(a[1], b[1], u), r, 0, TAU); g.fill();
    }
  }
}
function laceInside(g, clipPts, bbox, { step = 20, r = 3.2, kind = 'diamond', seed = 1 } = {}) {
  g.save(); g.beginPath(); spline(g, clipPts, true); g.clip();
  const [x0, y0, x1, y1] = bbox;
  let row = 0;
  for (let y = y0; y < y1; y += step * 0.8, row++) {
    for (let x = x0 + (row % 2) * step * 0.5; x < x1; x += step) {
      g.beginPath();
      if (kind === 'diamond') { g.moveTo(x, y - r * 1.6); g.lineTo(x + r, y); g.lineTo(x, y + r * 1.6); g.lineTo(x - r, y); g.closePath(); }
      else if (kind === 'kawung') { for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; g.ellipse(x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 1.4, r * 1.2, r * 0.6, a, 0, TAU); } }
      else { g.arc(x, y, r, 0, TAU); }
      g.fill();
    }
  }
  g.restore();
}

// ---------------- puppets ----------------
// Local units: feet at (0,0), head top near y = -880, facing right (+x). Height about 900.
const BODY = {
  alus: {
    torso: [[30, -718], [52, -690], [70, -640], [60, -580], [46, -500], [-38, -500], [-54, -585], [-60, -660], [-42, -708], [-28, -742]],
    kain: [[44, -505], [62, -432], [86, -310], [100, -205], [84, -128], [112, -40], [70, -28], [38, -60], [6, -40], [-30, -42], [-66, -60], [-100, -150], [-122, -262], [-100, -382], [-46, -505]],
    feet: [[[50, -40], [62, -8], [150, -4], [162, 6], [44, 8]], [[-52, -34], [-52, -6], [36, -4], [42, 6], [-62, 8]]],
    head: [[-28, -742], [-40, -792], [-22, -838], [20, -858], [62, -844], [80, -814], [92, -796], [140, -760], [104, -758], [100, -750], [105, -744], [96, -737], [92, -727], [60, -724], [30, -718]],
    eye: [80, -800, 15, 4, -0.38], shoulderF: [22, -684], shoulderB: [-18, -688], upper: 205, fore: 175, hand: 70,
  },
  gagah: {
    torso: [[40, -700], [78, -672], [98, -610], [84, -540], [66, -470], [-56, -470], [-80, -560], [-86, -650], [-56, -704], [-38, -740]],
    kain: [[66, -478], [104, -400], [150, -300], [130, -250], [148, -170], [70, -200], [30, -150], [-20, -150], [-90, -190], [-150, -150], [-140, -260], [-170, -330], [-110, -420], [-60, -480]],
    feet: [[[100, -200], [140, -60], [150, -10], [230, -4], [236, 6], [120, 8], [96, -60]], [[-110, -180], [-130, -60], [-150, -8], [-80, -4], [-74, 6], [-170, 8], [-150, -70]]],
    head: [[-38, -740], [-50, -800], [-28, -852], [26, -872], [74, -852], [96, -818], [120, -790], [146, -770], [140, -748], [116, -742], [118, -730], [100, -720], [76, -712], [40, -700]],
    eye: [84, -804, 13, 13, 0], shoulderF: [36, -672], shoulderB: [-30, -678], upper: 190, fore: 160, hand: 66,
  },
};

const HEADGEAR = {
  // gelung supit urang: curled hair bun shaped like a shrimp claw (Arjuna)
  gelung: (g) => {
    shape(g, [[-34, -824], [-60, -868], [-96, -902], [-136, -944], [-126, -906], [-104, -884], [-132, -876], [-96, -858], [-64, -834]]);
    g.beginPath(); g.arc(-40, -848, 30, 0, TAU); g.fill();
    shape(g, [[62, -846], [40, -862], [0, -866], [-36, -858], [-20, -846], [20, -850]]); // jamang band
  },
  // tall crown with a garuda flap at the back (Kresna)
  makutha: (g) => {
    shape(g, [[66, -846], [70, -900], [52, -960], [20, -1010], [-14, -1030], [-30, -990], [-54, -958], [-104, -930], [-140, -884], [-104, -872], [-70, -846], [-40, -836], [10, -850]]);
    shape(g, [[-10, -1028], [4, -1072], [14, -1030]]); // finial
  },
  // round bun of an old priest-knight (Bisma)
  resi: (g) => {
    g.beginPath(); g.ellipse(-14, -878, 46, 34, -0.3, 0, TAU); g.fill();
    shape(g, [[60, -846], [20, -866], [-30, -862], [-40, -846], [10, -846]]);
  },
  // cap (kethu) of Durna
  kethu: (g) => {
    shape(g, [[74, -838], [60, -880], [24, -906], [-26, -904], [-56, -876], [-60, -840], [-20, -846], [30, -850]]);
  },
  // simple soldier crown
  kupluk: (g) => {
    shape(g, [[86, -850], [70, -900], [20, -920], [-30, -908], [-56, -870], [-46, -846], [20, -862]]);
  },
};

const BEARD = {
  long: (g) => shape(g, [[92, -728], [104, -690], [94, -630], [72, -560], [56, -600], [44, -660], [40, -712]]),
  pointed: (g) => shape(g, [[96, -734], [108, -700], [96, -650], [80, -620], [64, -660], [56, -710]]),
};

export const CHARACTERS = {
  arjuna: { body: 'alus', head: 'gelung', sumping: true, keris: true, uncal: true, lace: 'diamond' },
  kresna: { body: 'alus', head: 'makutha', sumping: true, keris: true, uncal: true, lace: 'kawung', scale: 1.02 },
  bisma: { body: 'alus', head: 'resi', beard: 'long', sumping: false, keris: false, uncal: true, lace: 'dot', lean: 0.06, scale: 1.04 },
  durna: { body: 'alus', head: 'kethu', beard: 'pointed', sumping: false, keris: false, uncal: false, lace: 'dot', lean: 0.24, scale: 0.94, noseLen: 30 },
  prajurit: { body: 'gagah', head: 'kupluk', sumping: false, keris: true, uncal: false, lace: 'diamond', scale: 0.98 },
};

const RES = 1.3; // cache resolution multiplier
/** Recolour a black silhouette to the warm shadow colour and soften its edge a touch (a flame is not a point light). */
function soften(c) {
  const o = makeCanvas(c.width, c.height), g = o.getContext('2d');
  g.filter = 'blur(1.1px)'; g.drawImage(c, 0, 0); g.filter = 'none';
  g.globalCompositeOperation = 'source-in'; g.fillStyle = PAL.shadow; g.fillRect(0, 0, o.width, o.height);
  return o;
}
/** Build (and cache) the static body of a puppet: silhouette + carved holes. Returns {canvas, ox, oy}. */
export function puppetBody(name) {
  return cached('wk-body:' + name, () => {
    const C = CHARACTERS[name], B = BODY[C.body];
    const W = 520, H = 1180, ox = 240, oy = 1100;
    const c = makeCanvas(W * RES, H * RES), g = c.getContext('2d');
    g.scale(RES, RES); g.translate(ox, oy);
    g.fillStyle = '#000';
    g.save();
    if (C.lean) { g.translate(0, -500); g.rotate(C.lean); g.translate(0, 500); }
    shape(g, B.torso); shape(g, B.head, 0.35);
    if (C.noseLen) shape(g, [[92, -796], [140 + C.noseLen, -752], [104, -756]], 0.2);
    HEADGEAR[C.head](g);
    if (C.beard) BEARD[C.beard](g);
    if (C.sumping) shape(g, [[2, -806], [-26, -790], [-62, -768], [-80, -744], [-52, -756], [-22, -778]]);
    // necklace pendant
    shape(g, [[48, -676], [62, -620], [40, -590], [20, -630]]);
    g.restore();
    shape(g, B.kain, 0.45);
    B.feet.forEach((f) => shape(g, f, 0.3));
    if (C.keris) shape(g, [[-42, -520], [-110, -566], [-124, -582], [-104, -590], [-36, -544]], 0.3);
    if (C.uncal) shape(g, [[40, -488], [58, -420], [76, -340], [62, -330], [44, -400], [30, -480]], 0.4);
    // central rod (gapit) running through the body and below the feet
    g.fillRect(-4, -760, 8, 860);

    // ---- carving: light passes through ----
    g.globalCompositeOperation = 'destination-out';
    const [ex, ey, erx, ery, er] = B.eye;
    g.save(); if (C.lean) { g.translate(0, -500); g.rotate(C.lean); g.translate(0, 500); }
    g.beginPath(); g.ellipse(ex, ey, erx, ery, er, 0, TAU); g.fill();
    holesAlong(g, [[52, -686], [36, -660], [10, -650], [-24, -662], [-44, -690]], { step: 15, r: 4 }); // kalung
    holesAlong(g, [[44, -524], [-40, -524]], { step: 13, r: 4.2 }); // belt
    if (C.head === 'makutha') { holesAlong(g, [[60, -880], [30, -960], [-10, -1010]], { step: 16, r: 5 }); holesAlong(g, [[-40, -960], [-90, -912], [-124, -886]], { step: 14, r: 4.5 }); g.beginPath(); g.ellipse(4, -930, 22, 30, -0.4, 0, TAU); g.fill(); }
    if (C.head === 'gelung') holesAlong(g, [[-58, -866], [-96, -900], [-124, -930]], { step: 13, r: 3.6 });
    if (C.head === 'resi' || C.head === 'kethu') holesAlong(g, [[50, -860], [10, -880], [-40, -880]], { step: 15, r: 4 });
    if (C.sumping) holesAlong(g, [[-10, -796], [-40, -778], [-66, -756]], { step: 12, r: 3.4 });
    if (C.beard) holesAlong(g, [[84, -716], [80, -660], [68, -604]], { step: 14, r: 3 });
    g.restore();
    laceInside(g, B.kain.map(([x, y]) => [x * 0.86, y * 0.97 - 8]), [-160, -470, 130, -60], { step: 26, r: 4.2, kind: C.lace });
    holesAlong(g, [[60, -440], [96, -300], [104, -180], [92, -90]], { step: 16, r: 4.6 }); // wiron fold
    holesAlong(g, [[-60, -470], [-120, -330], [-130, -220], [-90, -110]], { step: 16, r: 4.6 });
    g.fillRect(-1.5, -740, 3, 20); // gapit seam
    return { canvas: soften(c), ox, oy, W, H };
  });
}

/** Arm segment canvas (upper arm, or forearm with a pointing hand). */
function armPart(kind, len, w0, w1) {
  return cached(`wk-arm:${kind}:${len}:${w0}:${w1}`, () => {
    const pad = 30, c = makeCanvas((w0 * 2 + pad * 2 + 40) * RES, (len + pad * 2 + 80) * RES), g = c.getContext('2d');
    g.scale(RES, RES); g.translate(w0 + pad + 20, pad);
    g.fillStyle = '#000';
    g.beginPath();
    g.moveTo(-w0 / 2, 0); g.quadraticCurveTo(-w0 * 0.6, len * 0.5, -w1 / 2, len);
    g.lineTo(w1 / 2, len); g.quadraticCurveTo(w0 * 0.6, len * 0.5, w0 / 2, 0); g.closePath(); g.fill();
    g.beginPath(); g.arc(0, 0, w0 / 2 + 2, 0, TAU); g.fill();
    if (kind === 'fore') {
      // pointing hand (nyempurit): long fingers forward, curled thumb
      shape(g, [[-w1 / 2, len - 6], [-6, len + 40], [12, len + 92], [20, len + 104], [14, len + 60], [w1 / 2 + 6, len + 20], [w1 / 2, len - 6]], 0.4);
      shape(g, [[w1 / 2, len + 8], [w1 / 2 + 22, len + 20], [w1 / 2 + 14, len + 34], [w1 / 2 - 2, len + 26]], 0.4);
    }
    g.globalCompositeOperation = 'destination-out';
    const band = kind === 'upper' ? 26 : len - 18; // kelat bahu / gelang
    holesAlong(g, [[-w0 / 2 + 5, band], [w0 / 2 - 5, band]], { step: 8, r: 2.6 });
    holesAlong(g, [[-w0 / 2 + 5, band + 10], [w0 / 2 - 5, band + 10]], { step: 8, r: 2.6 });
    return { canvas: soften(c), px: (w0 + pad + 20), py: pad };
  });
}

/**
 * Draw one puppet shadow (into ctx, in world coords).
 * o: { x, y (feet), s (scale), face (1 right, -1 left; values between = mid-flip), armF:[a1,a2], armB:[a1,a2] radians,
 *      depth (0 at screen .. 1 near lamp: bigger, softer, paler), alpha, t, wobble, cosmos (fill with stars) }
 */
export function puppet(ctx, name, o) {
  const { x, y, s = 1, face = 1, armF = [0.5, 0.75], armB = [-0.32, 0.45], depth = 0, alpha = 1, t = 0, wobble = 1, fill = null, rods = true } = o;
  const C = CHARACTERS[name], B = BODY[C.body];
  const body = puppetBody(name);
  // depth: the shadow grows away from the lamp and blurs
  const k = 1 + depth * 1.9;
  const X = LAMP.x + (x - LAMP.x) * k, Y = LAMP.y + (y - LAMP.y) * k * 0.92;
  const S = s * (C.scale || 1) * k;
  const blur = depth * 26;
  // living hand of the dalang: tiny bob and sway
  const bob = Math.sin(t * 2.1 + x * 0.01) * 3 * wobble, sway = Math.sin(t * 1.3 + x) * 0.012 * wobble;
  const up = armPart('upper', B.upper, 30, 22), fo = armPart('fore', B.fore, 22, 16);
  const parts = (g) => {
    g.rotate(sway); g.scale(face, 1);
    const drawArm = (sh, [a1, a2]) => {
      g.save();
      g.translate(sh[0], sh[1]); g.rotate(-a1);
      g.drawImage(up.canvas, -up.px, -up.py, up.canvas.width / RES, up.canvas.height / RES);
      g.translate(0, B.upper - 6); g.rotate(-a2);
      g.drawImage(fo.canvas, -fo.px, -fo.py, fo.canvas.width / RES, fo.canvas.height / RES);
      if (rods) { g.translate(4, B.fore + 70); g.rotate(a1 + a2); g.fillStyle = PAL.shadow; g.fillRect(-2.5, 0, 5, 1400); }
      g.restore();
    };
    drawArm(B.shoulderB, armB);
    g.drawImage(body.canvas, -body.ox, -body.oy, body.W, body.H);
    drawArm(B.shoulderF, armF);
  };
  const direct = depth < 0.02 && !fill && alpha >= 0.88;
  if (direct) {
    ctx.save(); ctx.translate(X, Y + bob * S); ctx.scale(S, S); ctx.globalAlpha = 0.95;
    parts(ctx); ctx.restore();
    return;
  }
  // grouped: render once, small; upscaling a small render IS the blur (no costly filter on a big image)
  const q = blur > 2 ? clamp((1.6 * S) / blur, 0.1, Math.min(1, S)) : Math.min(1, Math.max(0.35, S));
  const tmpW = Math.ceil(1100 * q), tmpH = Math.ceil(1500 * q);
  const tmp = cached('wk-tmp:' + tmpW + 'x' + tmpH, () => makeCanvas(tmpW, tmpH));
  const g = tmp.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.filter = 'none';
  g.clearRect(0, 0, tmpW, tmpH);
  g.translate(tmpW / 2, tmpH - 120 * q); g.scale(q, q);
  parts(g);
  ctx.save();
  ctx.globalAlpha = alpha * (fill ? 0.97 : 0.95 - depth * 0.38);
  ctx.translate(X, Y + bob * S); ctx.scale(S / q, S / q);
  ctx.drawImage(tmp, -tmpW / 2, -(tmpH - 120 * q));
  if (fill) { // the cosmos shows inside the soft giant shadow, drawn at a sharper resolution
    const q2 = Math.min(1, S * 0.6);
    const t2W = Math.ceil(1100 * q2), t2H = Math.ceil(1500 * q2);
    const t2 = cached('wk-tmp2:' + t2W + 'x' + t2H, () => makeCanvas(t2W, t2H)), g2 = t2.getContext('2d');
    g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'source-over'; g2.clearRect(0, 0, t2W, t2H);
    g2.translate(t2W / 2, t2H - 120 * q2); g2.scale(q2, q2); parts(g2);
    g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'source-atop'; fill(g2, t2W, t2H);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.restore(); ctx.save();
    ctx.globalAlpha = alpha * 0.9;
    ctx.translate(X, Y + bob * S); ctx.scale(S / q2, S / q2);
    ctx.drawImage(t2, -t2W / 2, -(t2H - 120 * q2));
  }
  ctx.restore();
}
function tintShadow(src, alt = false) {
  const c = cached('wk-tint:' + src.width + (alt ? 'b' : ''), () => makeCanvas(src.width, src.height));
  const g = c.getContext('2d');
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, c.width, c.height);
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in'; g.fillStyle = PAL.shadow; g.fillRect(0, 0, c.width, c.height);
  return c;
}


/** World position of a puppet's hand tip (front 'F' or back 'B'), same params as puppet(). For props held in hand. */
export function hand(name, o, which = 'F') {
  const { x, y, s = 1, face = 1, armF = [0.5, 0.75], armB = [-0.32, 0.45], depth = 0, t = 0, wobble = 1 } = o;
  const C = CHARACTERS[name], B = BODY[C.body];
  const k = 1 + depth * 1.9;
  const X = LAMP.x + (x - LAMP.x) * k, Y = LAMP.y + (y - LAMP.y) * k * 0.92;
  const S = s * (C.scale || 1) * k;
  const bob = Math.sin(t * 2.1 + x * 0.01) * 3 * wobble, sway = Math.sin(t * 1.3 + x) * 0.012 * wobble;
  const [a1, a2] = which === 'F' ? armF : armB, sh = which === 'F' ? B.shoulderF : B.shoulderB;
  const ex = sh[0] + (B.upper - 6) * Math.sin(a1), ey = sh[1] + (B.upper - 6) * Math.cos(a1);
  const L = B.fore + 88, hx = ex + L * Math.sin(a1 + a2), hy = ey + L * Math.cos(a1 + a2);
  const lx = hx * face, ly = hy;
  const rx = lx * Math.cos(sway) - ly * Math.sin(sway), ry = lx * Math.sin(sway) + ly * Math.cos(sway);
  return [X + rx * S, Y + bob * S + ry * S, S];
}

// ---------------- props ----------------
/** The gunungan (kayon): tree-of-life mountain that opens, closes and storms through a wayang show. */
export function gununganCanvas() {
  return cached('wk-gunungan', () => {
    const W = 640, H = 1120, c = makeCanvas(W * RES, H * RES), g = c.getContext('2d');
    g.scale(RES, RES); g.translate(W / 2, H - 40);
    g.fillStyle = '#000';
    const outline = [[-300, 0], [-286, -120], [-300, -260], [-262, -420], [-200, -580], [-130, -760], [-60, -930], [0, -1060], [60, -930], [130, -760], [200, -580], [262, -420], [300, -260], [286, -120], [300, 0]];
    shape(g, outline, 0.4);
    // flame tongues along the upper edges
    for (let i = 0; i < 9; i++) {
      for (const sd of [-1, 1]) {
        const u = 0.25 + i * 0.08, yy = -260 - u * 800, xx = sd * (300 - u * 330);
        shape(g, [[xx, yy + 20], [xx + sd * 34, yy - 18], [xx + sd * 8, yy - 40], [xx - sd * 6, yy - 10]], 0.4);
      }
    }
    g.fillRect(-6, 0, 12, 120); // handle
    g.globalCompositeOperation = 'destination-out';
    // inner border of holes
    holesAlong(g, outline.map(([x, y]) => [x * 0.9, y * 0.95 - 20]), { step: 17, r: 4.5 });
    // gate (gapura) at the bottom
    g.lineWidth = 7; g.strokeStyle = '#000';
    g.strokeRect(-110, -230, 220, 190);
    g.strokeRect(-70, -200, 60, 150); g.strokeRect(10, -200, 60, 150);
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-150 + i * 20, -240 - i * 34); g.lineTo(0, -300 - i * 34); g.lineTo(150 - i * 20, -240 - i * 34); g.stroke(); }
    // tree of life: trunk and spiralling branches
    g.lineCap = 'round';
    g.lineWidth = 12; g.beginPath(); g.moveTo(0, -340); g.bezierCurveTo(-10, -520, 10, -700, 0, -960); g.stroke();
    const rng = mulberry32(9);
    for (let i = 0; i < 14; i++) {
      const sd = i % 2 ? 1 : -1, yy = -380 - i * 40, len = 120 + (1 - i / 14) * 130;
      g.lineWidth = 8 - i * 0.3;
      g.beginPath(); g.moveTo(0, yy);
      const cx = sd * len * 0.6, cy = yy - 60, ex = sd * len, ey = yy - 10 - rng() * 40;
      g.quadraticCurveTo(cx, cy, ex, ey); g.stroke();
      // curl
      g.beginPath(); g.arc(ex - sd * 16, ey + 4, 16, 0, TAU * 0.8); g.stroke();
      for (let k = 0; k < 4; k++) { const u = 0.3 + k * 0.17; const lx = lerp(0, ex, u) + sd * 6, ly = lerp(yy, ey, u) - 26; g.beginPath(); g.ellipse(lx, ly, 10, 4, sd * 0.6, 0, TAU); g.fill(); }
    }
    // birds and a few stars of holes
    for (let i = 0; i < 6; i++) { const bx = (rng() - 0.5) * 300, by = -500 - rng() * 400; g.lineWidth = 4; g.beginPath(); g.moveTo(bx - 14, by); g.quadraticCurveTo(bx - 6, by - 10, bx, by); g.quadraticCurveTo(bx + 6, by - 10, bx + 14, by); g.stroke(); }
    laceInside(g, outline.map(([x, y]) => [x * 0.82, y * 0.9 - 30]), [-260, -360, 260, -260], { step: 22, r: 4, kind: 'dot' });
    return { canvas: c, W, H, ox: W / 2, oy: H - 40 };
  });
}
/** Draw the gunungan. rot in radians around its handle; depth like puppet(); flutter adds the dalang's twirl. */
export function gunungan(ctx, x, y, { s = 1, rot = 0, depth = 0, alpha = 1, flip = 1, glow = 0 } = {}) {
  const G = gununganCanvas();
  const k = 1 + depth * 1.9;
  const X = LAMP.x + (x - LAMP.x) * k, Y = LAMP.y + (y - LAMP.y) * k * 0.92;
  ctx.save();
  ctx.globalAlpha = alpha * (0.94 - depth * 0.38);
  const blur = depth * 26;
  ctx.translate(X, Y); ctx.rotate(rot); ctx.scale(s * k * flip, s * k);
  let img = tintShadow2(G.canvas);
  if (blur > 2) { // soft: use a small copy, upscaling blurs it
    const f = clamp(1.6 * s * k / blur, 0.06, 1);
    img = cached('wk-gsmall:' + f.toFixed(2), () => { const c = makeCanvas(Math.ceil(img.width * f / RES), Math.ceil(img.height * f / RES)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c; });
  }
  ctx.drawImage(img, -G.ox, -G.oy, G.W, G.H);
  ctx.restore();
}
function tintShadow2(src) {
  return cached('wk-gtint', () => {
    const c = makeCanvas(src.width, src.height), g = c.getContext('2d');
    g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = PAL.shadow; g.fillRect(0, 0, c.width, c.height);
    return c;
  });
}

/** Arjuna's bow Gandiwa (local: grip at 0,0, vertical). */
export function bow(ctx, x, y, { s = 1, rot = 0, alpha = 1, blur = 0, drawn = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.93; if (blur > 1) ctx.filter = `blur(${blur}px)`;
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = PAL.shadow; ctx.fillStyle = PAL.shadow; ctx.lineCap = 'round';
  ctx.lineWidth = 16;
  ctx.beginPath(); ctx.moveTo(0, -330); ctx.bezierCurveTo(70, -250, 60, -60, 14, 0); ctx.bezierCurveTo(60, 60, 70, 250, 0, 330); ctx.stroke();
  // carved tips
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, sd * 330); ctx.quadraticCurveTo(-30, sd * 350, -16, sd * 380); ctx.quadraticCurveTo(10, sd * 360, 0, sd * 330); ctx.fill(); }
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-6, -326); ctx.lineTo(-6 - drawn * 120, 0); ctx.lineTo(-6, 326); ctx.stroke();
  ctx.fillRect(4, -26, 26, 52);
  ctx.restore();
}

export function arrow(ctx, x, y, ang, { len = 260, alpha = 0.9 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = PAL.shadow; ctx.fillRect(-len, -2.5, len, 5);
  ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(30, 0); ctx.lineTo(0, 11); ctx.fill();
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(-len + 30, 0); ctx.lineTo(-len + 10, sd * 14); ctx.fill(); }
  ctx.restore();
}

/** Galloping horse silhouette (local: hooves at y=0, facing right). phase 0..1 */
export function horse(ctx, x, y, { s = 1, phase = 0, alpha = 0.93, face = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(s * face, s);
  ctx.fillStyle = PAL.shadow; ctx.strokeStyle = PAL.shadow; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const lift = Math.sin(phase * TAU * 2) * 8;
  ctx.save(); ctx.translate(0, -lift);
  // barrel, chest, arched neck, head
  ctx.beginPath(); spline(ctx, [[-190, -330], [-120, -362], [10, -360], [110, -372], [168, -420], [206, -500], [236, -540], [280, -548], [330, -500], [346, -470], [330, -456], [292, -470], [262, -440], [236, -380], [200, -300], [130, -268], [10, -262], [-120, -262], [-200, -280]], true, 0.5); ctx.fill();
  // ears + plume (jamang kuda)
  poly(ctx, [[262, -548], [270, -590], [284, -548]]);
  ctx.beginPath(); spline(ctx, [[250, -556], [222, -620], [252, -660], [262, -610]], true); ctx.fill();
  // mane: flame-like tufts
  for (let i = 0; i < 7; i++) { const u = i / 6, mx = lerp(250, 150, u), my = lerp(-540, -400, u); poly(ctx, [[mx, my], [mx - 50, my - 26 + Math.sin(phase * TAU + i) * 6], [mx - 22, my + 16]]); }
  // tail
  ctx.beginPath(); spline(ctx, [[-196, -320], [-262, -330], [-320, -280 + Math.sin(phase * TAU) * 24], [-300, -250], [-250, -280], [-200, -290]], true); ctx.fill();
  // carved saddle cloth and breast band
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-80 + i * 20, -330, 4.5, 0, TAU); ctx.fill(); }
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(150 + i * 12, -400 - i * 14, 3.5, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(300, -510, 7, 4, -0.4, 0, TAU); ctx.fill(); // eye
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  // legs: two-segment gallop cycle
  const legs = [[150, 0.0, 1], [100, 0.45, 1], [-130, 0.2, -1], [-170, 0.7, -1]];
  for (const [lx, off, front] of legs) {
    const p = (phase + off) % 1, sw = Math.sin(p * TAU);
    const hipY = -300 - lift;
    const a = sw * 0.55 * front, kneeLen = 120, shinLen = 130;
    const kx = lx + Math.sin(a) * kneeLen, ky = hipY + Math.cos(a) * kneeLen;
    const bend = (front > 0 ? 1 : -1) * Math.max(0, Math.cos(p * TAU)) * 1.1;
    const hx = kx + Math.sin(a - bend) * shinLen, hy = ky + Math.cos(a - bend) * shinLen;
    ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(lx, hipY); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(hx, Math.min(-4, hy)); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(hx + 8, Math.min(-4, hy), 14, 9, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/** Chariot (kereta) with a spoked wheel and Arjuna's monkey banner. Local: ground at y=0, facing right. */
export function chariot(ctx, x, y, { s = 1, wheel = 0, alpha = 0.93, face = 1, flag = 0 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(s * face, s);
  ctx.fillStyle = PAL.shadow; ctx.strokeStyle = PAL.shadow;
  // body (boat-like)
  ctx.beginPath(); spline(ctx, [[-260, -260], [-120, -250], [120, -250], [230, -300], [260, -360], [210, -330], [120, -320], [-120, -330], [-250, -340], [-280, -300]], true, 0.4); ctx.fill();
  ctx.fillRect(-250, -330, 20, -260); // banner pole
  // banner with a monkey (Kapidhwaja)
  const fw = Math.sin(flag * TAU) * 14;
  ctx.beginPath(); ctx.moveTo(-230, -590); ctx.quadraticCurveTo(-120, -600 + fw, -40, -580 + fw); ctx.lineTo(-60, -540 + fw); ctx.quadraticCurveTo(-130, -520 - fw, -230, -520); ctx.fill();
  // wheel
  ctx.save(); ctx.translate(-30, -150); ctx.rotate(wheel);
  ctx.beginPath(); ctx.arc(0, 0, 150, 0, TAU); ctx.arc(0, 0, 124, 0, TAU, true); ctx.fill();
  ctx.lineWidth = 12; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 128, Math.sin(a) * 128); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.arc(-230 + i * 24, -290, 5, 0, TAU); ctx.fill(); }
  // monkey cut into the banner
  ctx.beginPath(); ctx.arc(-140, -560, 12, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-120, -548, 16, 10, 0.3, 0, TAU); ctx.fill();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-104, -544); ctx.quadraticCurveTo(-84, -570, -96, -580); ctx.stroke();
  ctx.restore();
}

/** Nameplate (lower third): dark carved letters with a gold rim, readable on the bright kelir. */
export function nameplate(ctx, text, x, y, { alpha = 1, size = 46 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px 'Cinzel'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.letterSpacing = '6px';
  const w = ctx.measureText(text).width;
  ctx.shadowColor = 'rgba(255,220,150,.9)'; ctx.shadowBlur = 22;
  ctx.fillStyle = PAL.shadow; ctx.fillText(text, x, y);
  ctx.shadowBlur = 0; ctx.lineWidth = 1.6; ctx.strokeStyle = PAL.gold; ctx.strokeText(text, x, y);
  ctx.strokeStyle = PAL.shadow; ctx.fillStyle = PAL.shadow; ctx.lineWidth = 3;
  for (const sd of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(x + sd * (w / 2 + 20), y); ctx.lineTo(x + sd * (w / 2 + 110), y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + sd * (w / 2 + 120), y - 9); ctx.lineTo(x + sd * (w / 2 + 129), y); ctx.lineTo(x + sd * (w / 2 + 120), y + 9); ctx.lineTo(x + sd * (w / 2 + 111), y); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/** Starfield + nebula used to fill a silhouette (Wiswarupa: the god shows the universe). */
export function cosmosFill(t) {
  return (g, W, H) => {
    const gr = g.createRadialGradient(W / 2, H * 0.45, 20, W / 2, H * 0.45, H * 0.7);
    gr.addColorStop(0, '#fff0c0'); gr.addColorStop(0.07, '#e39a3c'); gr.addColorStop(0.2, '#3a1c5c'); gr.addColorStop(0.55, '#120a2a'); gr.addColorStop(1, '#05040c');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = mulberry32(5);
    for (let i = 0; i < 420; i++) {
      const a = r() * TAU + t * 0.15 * (0.3 + r()), rad = Math.pow(r(), 0.7) * H * 0.6;
      const x = W / 2 + Math.cos(a) * rad * 0.7, y = H * 0.45 + Math.sin(a) * rad;
      const tw = 0.5 + 0.5 * Math.sin(t * 3 + i);
      g.fillStyle = `rgba(255,${200 + (r() * 55) | 0},${150 + (r() * 100) | 0},${0.4 + 0.6 * tw})`;
      g.beginPath(); g.arc(x, y, 0.8 + r() * 2.6, 0, TAU); g.fill();
    }
    // spiral arms
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 2; k++) for (let i = 0; i < 160; i++) {
      const u = i / 160, a = u * 9 + k * Math.PI + t * 0.4, rad = u * H * 0.35;
      g.fillStyle = `rgba(255,190,110,${0.25 * (1 - u)})`;
      g.beginPath(); g.arc(W / 2 + Math.cos(a) * rad * 0.8, H * 0.45 + Math.sin(a) * rad * 0.5, 6 * (1 - u) + 1, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = 'source-atop';
  };
}

/** Big title: dark carved letters, gold rim, warm halo (reads on the lit screen and in the dark). */
export function goldTitle(ctx, text, x, y, { size = 86, alpha = 1, spacing = 10, glow = 0.9 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = `700 ${size}px 'Cinzel'`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = spacing + 'px';
  ctx.shadowColor = `rgba(255,214,140,${glow})`; ctx.shadowBlur = size * 0.45;
  ctx.fillStyle = PAL.shadow; ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
  const gr = ctx.createLinearGradient(0, y - size / 2, 0, y + size / 2);
  gr.addColorStop(0, '#fff3c4'); gr.addColorStop(0.5, PAL.gold); gr.addColorStop(1, PAL.goldDeep);
  ctx.lineWidth = Math.max(2, size * 0.03); ctx.strokeStyle = gr; ctx.strokeText(text, x, y);
  ctx.restore();
}

export { ease, clamp, lerp, hrand };
