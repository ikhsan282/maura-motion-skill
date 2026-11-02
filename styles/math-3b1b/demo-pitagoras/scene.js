// Teorema Pitagoras: a² + b² = c² — 3Blue1Brown style.
// Segitiga siku-siku + kotak di tiap sisi → animasi isian → rumus.
// Geometry: segitiga (0,0)-(a,0)-(0,b), a=300, b=200, c=√(a²+b²)
import * as K from '/styles/math-3b1b/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;

export const meta = {
  fps: 24,
  hold: 1,
  captions: { preset: 'clean', y: 1470, size: 56, box: { fill: 'rgba(14,17,22,.82)', pad: 18, radius: 14 } },
};

// Geometry constants
const A = 300, B = 200;
const C = Math.hypot(A, B); // ≈ 360.56
// Triangle vertices: right angle at (0,0)
const TRI = { ax: 0, ay: 0, bx: A, by: 0, cx: 0, cy: B };
// Hypotenuse midpoint
const HMX = A / 2, HMY = B / 2;
// Unit normal to hypotenuse (pointing "outward" — below the diagonal)
const HNX = -B / C, HNY = A / C;
// Square on hypotenuse: centre at HM, sides = C, rotated perpendicular to hypotenuse
const SQ = { cx: HMX, cy: HMY, nx: HNX, ny: HNY, s: C };

// Colours
const COL = { a: K.PAL.yellow, b: K.PAL.blue, c: K.PAL.red, white: K.PAL.white };

// Convert (u,v) in square-local coords to canvas coords
function sqPt(sq, u, v) {
  return [sq.cx + sq.nx * u - sq.ny * v, sq.cy + sq.ny * u + sq.nx * v];
}

// Vertices of the c-square (all 4 corners)
const sqCVerts = [
  sqPt(SQ, -SQ.s / 2, -SQ.s / 2),
  sqPt(SQ,  SQ.s / 2, -SQ.s / 2),
  sqPt(SQ,  SQ.s / 2,  SQ.s / 2),
  sqPt(SQ, -SQ.s / 2,  SQ.s / 2),
];

// Origin of canvas (triangle right-angle corner)
const OX = 540, OY = 900;

let ctx;
const C_ = {}; // line timings
let T = {};   // event timings

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C_[l.id] = l;

  const W = (id, wordIdx) => AM.wordTime(id, wordIdx);
  T = {
    // Phase 1: triangle + squares appear
    triAppear: W('hook', 'Tiga') - 0.1,
    sqShow:    W('segitiga', 'sisi') - 0.05,
    // Phase 2: label sides
    labelA: W('segitiga', 'a') + 0.1,
    labelB: W('segitiga', 'b') + 0.1,
    labelC: W('segitiga', 'c') + 0.1,
    // Phase 3: show square areas
    sqA:     W('kotak', 'a') - 0.1,
    sqB:     W('kotak', 'b') - 0.1,
    sqC:     W('kotak', 'c') - 0.1,
    // Phase 4: fill animation (a² + b² → c²)
    fillStart: W('rumus', 'Dua') - 0.1,
    fillMid:   W('rumus', 'a')   - 0.05,
    fillEnd:   W('rumus', 'c')   + 0.15,
    // Phase 5: formula appears
    formula: W('rumus', 'sama') - 0.1,
    // Phase 6: result
    result:  W('hasil', 'teorema') - 0.05,
    end:     AM.duration,
  };

  // SFX
  AM.sfx('pop',   T.sqA,    { gain: 0.4, pitch: 0.9 });
  AM.sfx('pop',   T.sqB,    { gain: 0.4, pitch: 1.0 });
  AM.sfx('pop',   T.sqC,    { gain: 0.4, pitch: 1.1 });
  AM.sfx('chime', T.formula, { gain: 0.45 });
  AM.sfx('chime', T.result,  { gain: 0.4 });
  AM.sfx('whoosh', T.fillStart, { gain: 0.25, pitch: 0.9 });
}

// ------------------------------------------------------------------ helpers

function pathPoly(ctx, pts, close = true) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}

// Draw a square given its centre, normal, and side length
function drawSquare(ctx, sq, fill, stroke, lw = 3, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const [x0, y0] = sqPt(sq, -sq.s / 2, -sq.s / 2);
  const [x1, y1] = sqPt(sq,  sq.s / 2, -sq.s / 2);
  const [x2, y2] = sqPt(sq,  sq.s / 2,  sq.s / 2);
  const [x3, y3] = sqPt(sq, -sq.s / 2,  sq.s / 2);
  if (fill) { ctx.fillStyle = fill; pathPoly(ctx, [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]); ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; pathPoly(ctx, [[x0, y0], [x1, y1], [x2, y2], [x3, y3]]); ctx.stroke(); }
  ctx.restore();
}

// Draw the right triangle
function drawTriangle(ctx, stroke, lw = 4, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(OX + TRI.ax, OY + TRI.ay);
  ctx.lineTo(OX + TRI.bx, OY + TRI.by);
  ctx.lineTo(OX + TRI.cx, OY + TRI.cy);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// Draw a right-angle marker at (0,0)
function drawRightAngle(ctx, size = 28, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = K.PAL.grey;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(OX + size, OY);
  ctx.lineTo(OX + size, OY - size);
  ctx.lineTo(OX, OY - size);
  ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ render

export function render(t) {
  K.ground(ctx, { grid: 0.6 });

  // Camera: gentle zoom in during fill, pull back for formula
  const zoomIn  = env(t, T.fillStart, T.fillMid, 0.4, 0.5);
  const zoomOut = prog(t, T.formula, AM.duration);
  const z = 1 + 0.06 * zoomIn - 0.05 * zoomOut;
  const camY = OY + 80 - 60 * zoomIn + 40 * zoomOut;
  K.cam(ctx, z, OX, camY);

  // ---- Phase 1: triangle appears
  const triP = prog(t, T.triAppear, T.triAppear + 0.6);
  drawTriangle(ctx, K.PAL.white, 4, triP);
  drawRightAngle(ctx, 28, triP);

  // ---- Phase 2: squares appear on each side
  const sqP = prog(t, T.sqShow, T.sqShow + 0.7);

  // a-square: below the horizontal leg (0,0)-(A,0)
  const sqA = { cx: OX + A / 2, cy: OY + B / 2 + A / 2, nx: 0, ny: 1, s: A };
  drawSquare(ctx, sqA, rgba(COL.a, 0.35), COL.a, 3, sqP);

  // b-square: left of the vertical leg (0,0)-(0,B)
  const sqB = { cx: OX - B / 2 - A / 2, cy: OY + B / 2, nx: -1, ny: 0, s: B };
  drawSquare(ctx, sqB, rgba(COL.b, 0.35), COL.b, 3, sqP);

  // c-square: on the hypotenuse, rotated
  const sqC = { cx: OX + SQ.cx, cy: OY + SQ.cy, nx: SQ.nx, ny: SQ.ny, s: SQ.s };
  drawSquare(ctx, sqC, rgba(COL.c, 0.25), COL.c, 3, sqP);

  // ---- Phase 3: side labels
  const labelP = (start, end) => prog(t, start, end);
  if (labelP(T.labelA, T.labelA + 0.5) > 0) {
    K.math(ctx, 'a', OX + A / 2, OY + 36, { size: 72, color: COL.a, alpha: clamp(labelP(T.labelA, T.labelA + 0.5)) });
  }
  if (labelP(T.labelB, T.labelB + 0.5) > 0) {
    K.math(ctx, 'b', OX - 42, OY + B / 2, { size: 72, color: COL.b, alpha: clamp(labelP(T.labelB, T.labelB + 0.5)) });
  }
  if (labelP(T.labelC, T.labelC + 0.5) > 0) {
    const mx = OX + HMX, my = OY + HMY;
    // label positioned above the hypotenuse midpoint, offset by normal
    const lx = mx + HNX * 52, ly = my + HNY * 52;
    K.math(ctx, 'c', lx, ly, { size: 72, color: COL.c, alpha: clamp(labelP(T.labelC, T.labelC + 0.5)) });
  }

  // ---- Phase 4: area labels on squares
  const areaP = prog(t, T.sqA, T.sqA + 0.5);
  if (areaP > 0) {
    K.math(ctx, 'a²', OX + A / 2, OY + B / 2 + A / 2, { size: 80, color: COL.a, alpha: areaP });
  }
  const areaBP = prog(t, T.sqB, T.sqB + 0.5);
  if (areaBP > 0) {
    K.math(ctx, 'b²', OX - B / 2 - A / 2, OY + B / 2, { size: 80, color: COL.b, alpha: areaBP });
  }
  const areaCP = prog(t, T.sqC, T.sqC + 0.5);
  if (areaCP > 0) {
    K.math(ctx, 'c²', OX + SQ.cx, OY + SQ.cy, { size: 80, color: COL.c, alpha: areaCP });
  }

  // ---- Phase 5: fill animation — a² + b² fills c²
  // Two small squares' fill "flows" into the large square
  const fillP = clamp((t - T.fillStart) / (T.fillEnd - T.fillStart));
  if (fillP > 0 && fillP < 1) {
    // Draw the c-square fill growing: a² (yellow) sweeps from one corner, b² (blue) from the other
    const fillAmt = ease.inOutCubic(fillP);
    ctx.save();
    const [x0, y0] = sqPt(SQ, -SQ.s / 2, -SQ.s / 2);
    const [x1, y1] = sqPt(SQ,  SQ.s / 2, -SQ.s / 2);
    const [x2, y2] = sqPt(SQ,  SQ.s / 2,  SQ.s / 2);
    const [x3, y3] = sqPt(SQ, -SQ.s / 2,  SQ.s / 2);

    // Clip to c-square
    ctx.beginPath();
    ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.clip();

    // Sweep along the square's local u axis: yellow covers [−s/2, −s/2 + s·fillAmt], blue the rest shrinking
    const uEdge = -SQ.s / 2 + SQ.s * fillAmt;
    const corner = (u, v) => sqPt(SQ, u, v);
    const s2 = SQ.s / 2;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = COL.a;
    pathPoly(ctx, [corner(-s2, -s2), corner(uEdge, -s2), corner(uEdge, s2), corner(-s2, s2)]);
    ctx.fill();
    ctx.fillStyle = COL.b;
    pathPoly(ctx, [corner(uEdge, -s2), corner(s2, -s2), corner(s2, s2), corner(uEdge, s2)]);
    ctx.fill();

    ctx.restore();
  }

  // Show the fill split line during animation
  if (fillP > 0.1 && fillP < 0.9) {
    const mx2 = OX + HMX, my2 = OY + HMY;
    const perpX = -HNY, perpY = HNX;
    const lineLen = SQ.s * 0.8;
    K.line(ctx,
      mx2 + perpX * lineLen / 2, my2 + perpY * lineLen / 2,
      mx2 - perpX * lineLen / 2, my2 - perpY * lineLen / 2,
      1, { color: K.PAL.white, w: 2, dash: [12, 8] }
    );
  }

  // ---- Phase 6: formula a² + b² = c²
  const fmP = prog(t, T.formula, T.formula + 1.0, ease.linear);
  if (fmP > 0) {
    const size = 130;
    const FY = 420;
    K.math(ctx, 'a² + b² = c²', 540, FY, {
      size,
      p: fmP,
      colors: { a: COL.a, b: COL.b, c: COL.c },
    });
    // Highlight box
    const bp = prog(t, T.formula + 0.5, T.formula + 1.1);
    const lay = K.layoutMath(ctx, 'a² + b² = c²', size);
    K.surround(ctx, 540 - lay.width / 2, FY - size * 0.78, lay.width, size * 0.98, bp, { color: K.PAL.yellow, pad: 26 });
  }

  // ---- Result line: final emphasis
  if (prog(t, T.result, T.result + 0.8) > 0) {
    const p = prog(t, T.result, T.result + 0.8);
    K.dot(ctx, OX, OY, 10, K.PAL.yellow, p);
    K.line(ctx, OX, OY, OX + A, OY, p, { color: COL.a, w: 4 });
    K.line(ctx, OX, OY, OX, OY - B, p, { color: COL.b, w: 4 });
    K.line(ctx, OX + A, OY, OX, OY - B, p, { color: COL.c, w: 4 });
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
