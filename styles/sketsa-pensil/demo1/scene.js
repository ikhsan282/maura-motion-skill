// Sketsa Pensil demo (20 s): "Faktor Habibie: retakan sekecil rambut".
// One long sheet of paper; every line of narration gets its own drawing in a new spot on the sheet and the
// camera slides across the page between them. A single pencil travels from drawing to drawing.
import * as K from '/styles/sketsa-pensil/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;
const { G } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1478, size: 64 } };

const SHEET = [0, 0, 2240, 4700];
const A = [560, 840], B = [1680, 840], D = [1680, 2040], E = [560, 2040], H = [560, 3240];

let ctx, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const ART = []; // {d, o(t) -> draw options, custom?}
const pen = new K.Pen();
let S = {}; // named sketches and data

// ---------------------------------------------------------------- drawing builders (story props)
const xf = (pts, x, y, s = 1, r = 0) => G.xf(pts, x, y, s, r);
function jet(d, x, y, s, { engine = true, hatch = true, blue = true, nWin = 13, gear = false } = {}) {
  const P = (pts) => xf(pts, x, y, s), w = (v) => v * Math.max(0.8, s);
  const items = {};
  if (blue) { d.blue(P([[-470, 4], [480, -2]])); d.blue(P(G.ellipse(0, 0, 410, 50, -2.6))); }
  d.line(P(G.spline([[398, 2], [352, -30], [260, -45], [0, -48], [-280, -44], [-390, -38], [-436, -30]], 8)), { w: w(3.6) });
  d.line(P(G.spline([[398, 2], [366, 28], [282, 44], [0, 47], [-200, 40], [-330, 16], [-436, -30]], 8)), { w: w(3.6) });
  d.line(P(G.spline([[-282, -45], [-372, -150], [-392, -182], [-436, -184], [-428, -36]], 5)), { w: w(3.2) });
  d.line(P([[-330, -14], [-450, -34], [-440, -16], [-338, -4]]), { w: w(2.6) });
  d.line(P(G.spline([[-30, 30], [-170, 98], [-196, 108], [-150, 110], [80, 36]], 6)), { w: w(3) });
  if (engine) d.line(P(G.ellipse(-96, 86, 60, 21)), { w: w(2.8) });
  d.line(P([[318, -26], [350, -25], [372, -12], [330, -10], [318, -26]]), { w: w(2.4), over: 1 });
  for (let i = 0; i < nWin; i++) { const wx = -250 + i * 38; d.line(P(G.rrect(wx - 9, -27, 18, 18, 3)), { w: w(2.2), over: 1, sketch: 0.6, gap: 0.006, dur: d.speed > 8000 ? 0.016 : 0.045 }); }
  d.line(P(G.rrect(262, -36, 22, 54, 6)), { w: w(2.2), over: 1 });
  if (gear) {
    items.gear = [d.line(P([[170, 44], [176, 74]]), { w: w(2.6) }), d.line(P(G.circle(178, 86, 15)), { w: w(2.8) }),
      d.line(P([[-60, 46], [-62, 80]]), { w: w(2.6) }), d.line(P(G.circle(-60, 94, 17)), { w: w(2.8) })];
  }
  if (hatch) d.hatch(P([[-330, 16], [-200, 30], [0, 36], [282, 34], [366, 28], [282, 44], [0, 47], [-200, 40]]), { ang: -1.1, gap: 7, per: 0.01, tone: 0.6 });
  return items;
}
const rot = (x, y, r, px, py, tx = 0, ty = 0) => { const dx = x - px, dy = y - py; return [px + tx + dx * Math.cos(r) - dy * Math.sin(r), py + ty + dx * Math.sin(r) + dy * Math.cos(r)]; };


// ---------------------------------------------------------------- setup
export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;

  // ---- A (hook): a jet sketched fast, it dips; a red hairline crack at a window corner.
  const dA = new K.Sketch({ t0: -1.4, speed: 2900, seed: 1, gap: 0.022 });
  jet(dA, A[0], A[1], 1.05);
  for (let i = 0; i < 3; i++) dA.line([[A[0] - 600 - i * 30, A[1] - 60 + i * 50], [A[0] - 500 - i * 20, A[1] - 62 + i * 50]], { w: 2.4, tone: 0.6, dur: 0.06 });
  dA.at(W('hook', 'retakan') - 0.05);
  const cx0 = A[0] + 63 * 1.05, cy0 = A[1] - 9 * 1.05; // bottom-right corner of window 8
  dA.red(K.jagged(cx0, cy0, 56, 0.75, { seed: 3, step: 3.2, wander: 0.7 }), { w: 1.7, raw: true, dur: 0.45 });
  dA.red(K.jagged(cx0 + 16, cy0 + 14, 14, 1.6, { seed: 8, step: 3 }), { w: 1.1, raw: true, dur: 0.15 });
  dA.line([[cx0 + 74, cy0 + 70], [cx0 + 38, cy0 + 36], [cx0 + 30, cy0 + 26]], { w: 1.4, dur: 0.12 });
  dA.line([[cx0 + 30, cy0 + 26], [cx0 + 32, cy0 + 37]], { w: 1.4, dur: 0.04, over: 0 }); dA.line([[cx0 + 30, cy0 + 26], [cx0 + 41, cy0 + 29]], { w: 1.4, dur: 0.04, over: 0 });
  dA.text('sekecil rambut!', cx0 + 66, cy0 + 96, { size: 22, cps: 30 });
  const tiltT = W('hook', 'jatuh');
  const oA = (t) => { const f = prog(t, tiltT - 0.1, tiltT + 0.7, ease.outBack); return { rot: 0.085 * f, ty: 30 * f, px: A[0], py: A[1] }; };
  S.crackA = (t) => { const o = oA(t); return rot(cx0 + 12, cy0 + 14, o.rot, o.px, o.py, 0, o.ty); };
  ART.push({ d: dA, o: oA }); pen.sketch(dA, oA);

  // ---- B: 1954, a Comet breaks apart in the air.
  const dB0 = new K.Sketch({ t0: C.comet.start - 0.15, speed: 2400, seed: 2 });
  dB0.text('1954', B[0], B[1] - 360, { size: 170, align: 'center', cps: 9 });
  const dB1 = new K.Sketch({ t0: dB0.end + 0.03, speed: 7000, seed: 3, gap: 0.01 });
  jet(dB1, B[0], B[1] - 60, 0.84, { engine: false, hatch: false, blue: false, nWin: 11 });
  S.breakT = Math.max(dB1.end + 0.05, W('comet', 'pecah'));
  const dB2 = new K.Sketch({ t0: S.breakT + 0.5, speed: 2400, seed: 4 });
  dB2.text('COMET ×2', B[0] - 300, B[1] - 230, { size: 58, cps: 18 });
  dB2.line([[B[0] - 210, B[1] - 205], [B[0] - 150, B[1] - 150], [B[0] - 130, B[1] - 120]], { w: 2.2 });
  ART.push({ d: dB0 }, { d: dB2 }, { d: dB1, custom: drawComet });
  pen.sketch(dB0).sketch(dB1).sketch(dB2);

  // ---- D (tebal): thin plate, a plane; the plate gets extra thick (cross-hatched); weights; "tapi berat!"
  const dD = new K.Sketch({ t0: C.tebal.start - 0.15, speed: 3600, seed: 6, gap: 0.025 });
  const [lx, rx] = [D[0] - 330, D[0] + 200], ty0 = D[1] - 360;
  dD.line([[lx, ty0], [rx, ty0 - 3]], { w: 3.2, dur: 0.14 }); dD.line([[lx, ty0 + 24], [rx, ty0 + 21]], { w: 3.2, dur: 0.14 });
  dD.line([[lx, ty0], [lx + 2, ty0 + 24]], { w: 2.6, dur: 0.04 }); dD.line([[rx, ty0 - 3], [rx, ty0 + 21]], { w: 2.6, dur: 0.04 });
  const pX = D[0] + 20, pY = D[1] + 200;
  const dP = new K.Sketch({ t0: dD.end + 0.02, speed: 14000, seed: 7, gap: 0.006 });
  jet(dP, pX, pY, 0.74, { engine: false, hatch: false, blue: false, nWin: 8, gear: true });
  dP.line([[D[0] - 420, D[1] + 330], [D[0] + 420, D[1] + 326]], { w: 2.6, tone: 0.8, dur: 0.08 });
  dD.at(Math.max(dP.end + 0.02, W('tebal', 'tebal') - 0.2));
  const thick = [dD.line([[lx, ty0 + 150], [rx, ty0 + 147]], { w: 3.6, dur: 0.16 }), dD.line([[lx, ty0 + 24], [lx + 2, ty0 + 150]], { w: 3, dur: 0.06 }), dD.line([[rx, ty0 + 21], [rx, ty0 + 147]], { w: 3, dur: 0.06 })];
  thick.push(dD.hatch([[lx, ty0 + 26], [rx, ty0 + 23], [rx, ty0 + 147], [lx, ty0 + 150]], { ang: -0.8, cross: 0.75, gap: 12, tone: 0.8, per: 0.0022 }));
  dD.at(W('tebal', 'Aman') - 0.1);
  dD.text('aman', lx, ty0 + 230, { size: 60, cps: 30 });
  dD.line([[lx + 130, ty0 + 205], [lx + 146, ty0 + 222], [lx + 178, ty0 + 178]], { w: 4, dur: 0.1, over: 2 });
  dP.at(Math.max(dD.t, W('tebal', 'tapi') - 0.15));
  const wt = [];
  const blk = (x0, w0, h0) => { wt.push(dP.line([[x0, pY - 30], [x0 + 8, pY - 30 - h0], [x0 + w0 - 8, pY - 30 - h0], [x0 + w0, pY - 30], [x0, pY - 30]], { w: 3, dur: 0.1 })); wt.push(dP.text('kg', x0 + w0 / 2, pY - 40 - h0 * 0.3, { size: 40, align: 'center', cps: 40 })); };
  blk(pX - 120, 92, 74); blk(pX + 0, 76, 56);
  dD.at(dP.end + 0.02);
  dD.text('tapi berat!', lx + 260, ty0 + 230, { size: 60, cps: 42, col: K.PAL.red });
  S.heavyT = dP.end - 0.1;
  S.plate = { lx, rx, ty0 };

  // ---- E (habibie): the name, the young engineer at work, the crack-growth curve with its danger line.
  const dE = new K.Sketch({ t0: C.habibie.start - 0.2, speed: 4200, seed: 8, gap: 0.02 });
  dE.text('B.J. Habibie', E[0] + 70, E[1] - 430, { size: 104, align: 'center', cps: 20 });
  dE.red([[E[0] - 200, E[1] - 402], [E[0] + 340, E[1] - 408]], { w: 4, dur: 0.16 });
  S.figE = { a: dE.end + 0.02, b: dE.end + 0.7 };
  dE.at(S.figE.b + 0.04);
  const ox = E[0] - 150, oy = E[1] + 300, x1 = E[0] + 440, ytop = E[1] - 250;
  S.rulerT = [dE.t - 0.35, dE.t + 0.2];
  dE.line([[ox, oy], [x1, oy]], { w: 3.2, sketch: 0.3, over: 2, dur: 0.22 });
  dE.line([[x1 - 22, oy - 12], [x1, oy], [x1 - 22, oy + 12]], { w: 3, dur: 0.05, over: 0 });
  dE.line([[ox, oy], [ox, ytop]], { w: 3.2, sketch: 0.8, dur: 0.16 });
  dE.line([[ox - 12, ytop + 22], [ox, ytop], [ox + 12, ytop + 22]], { w: 3, dur: 0.05, over: 0 });
  const curve = []; for (let i = 0; i <= 40; i++) { const u = i / 40, k = 4.2; curve.push([lerp(ox + 20, x1 - 50, u), oy - 20 - 500 * (Math.exp(k * u) - 1) / (Math.exp(k) - 1)]); }
  dE.at(W('habibie', 'retakan') - 0.1);
  dE.line(curve, { w: 4.4, dur: 0.6, sketch: 0.8 });
  const dangerY = oy - 400;
  for (let x = ox + 6; x < x1 - 30; x += 40) dE.red([[x, dangerY], [x + 22, dangerY]], { w: 3, dur: 0.012, gap: 0.003, over: 0 });
  dE.text('batas bahaya', x1 - 300, dangerY - 26, { size: 46, cps: 30, col: K.PAL.red });
  dE.text('jumlah terbang', E[0] + 150, oy + 66, { size: 44, align: 'center', cps: 30 });
  S.graph = { ox, oy, x1, ytop, dangerY };
  ART.push({ d: dE }); pen.sketch(dE);
  const poseE = (t) => ({ x: E[0] - 330, y: E[1] + 330, s: 0.95, sit: 1, look: 0.7, face: t > W('habibie', 'retakan') ? 'focus' : 'smile', blink: (t % 2.7) < 0.12 ? 1 : 0,
    arms: [[2.0 + Math.sin(t * 9) * 0.05, 0.25], [0.5, 0.9]], legs: [[1.5, -1.5], [1.35, -1.35]] });
  S.poseE = poseE;
  pen.add(S.figE.a, S.figE.b, (t) => K.figureTip(poseE(t), (t - S.figE.a) / (S.figE.b - S.figE.a)));

  // ---- D again (ringan): the eraser removes the extra thickness and the weights; thin plate; the plane flies; -10%.
  dD.at(C.ringan.start - 0.05);
  dD.erase([[lx + 10, ty0 + 70], [rx - 20, ty0 + 66], [lx + 20, ty0 + 104], [rx - 10, ty0 + 108], [lx + 10, ty0 + 136], [rx + 40, ty0 + 90]], { w: 70, dur: 0.7, targets: thick, rubs: 6 });
  dD.line([[lx, ty0 + 58], [rx, ty0 + 55]], { w: 3.4, dur: 0.14 });
  dD.line([[lx, ty0 + 24], [lx + 2, ty0 + 58]], { w: 2.6, dur: 0.04 }); dD.line([[rx, ty0 + 21], [rx, ty0 + 55]], { w: 2.6, dur: 0.04 });
  dP.at(dD.t + 0.02);
  dP.erase([[pX - 130, pY - 80], [pX + 80, pY - 70], [pX - 120, pY - 50], [pX + 90, pY - 60], [pX + 140, pY - 110]], { w: 62, dur: 0.55, targets: wt, rubs: 5 });
  S.liftT = dP.end + 0.05;
  dD.at(Math.max(S.liftT + 0.1, W('ringan', '10') - 0.3));
  dD.text('-10%', D[0] + 40, D[1] + 30, { size: 150, align: 'center', cps: 10, col: K.PAL.red });
  dD.red(G.ellipse(D[0] + 40, D[1] - 16, 190, 100, -2.4, 0.4), { w: 3.6, dur: 0.35 });
  const oP = (t) => {
    const f = clamp((t - S.liftT) / 2.6), e = ease.inCubic(f);
    return { tx: e * 900, ty: -e * 560 - Math.sin(f * 3) * 10, rot: -0.22 * ease.outCubic(clamp(f * 2)), px: pX, py: pY };
  };
  S.oP = oP;
  ART.push({ d: dD }, { d: dP, o: oP, custom: drawHeavy });
  pen.sketch(dD).sketch(dP, oP);

  // ---- H (crack): "Mr. Crack", a red crack runs through it, the engineer cheers.
  const dH = new K.Sketch({ t0: C.crack.start - 0.1, speed: 2600, seed: 12, gap: 0.03 });
  dH.text('Mr. Crack', H[0], H[1] - 120, { size: 180, align: 'center', cps: 15 });
  dH.red(K.jagged(H[0] - 380, H[1] - 180, 780, 0.02, { seed: 21, step: 26, wander: 0.9, pull: 0.5 }), { w: 4, raw: true, dur: 0.3 });
  S.figH = { a: dH.end + 0.03, b: dH.end + 0.6 };
  ART.push({ d: dH }); pen.sketch(dH);
  S.poseH = (t) => { const ch = prog(t, S.figH.b, S.figH.b + 0.3, ease.outBack); const bounce = Math.abs(Math.sin((t - S.figH.b) * 7)) * 18 * (t > S.figH.b ? 1 : 0);
    return { x: H[0], y: H[1] + 600 - bounce, s: 0.8, face: ch > 0.5 ? 'wow' : 'smile', arms: [[lerp(0.3, 2.7, ch), lerp(0.3, 0.2, ch)], [lerp(-0.3, -2.7, ch), lerp(-0.3, -0.2, ch)]], legs: [[0.15, 0], [-0.15, 0]] }; };
  pen.add(S.figH.a, S.figH.b, (t) => K.figureTip(S.poseH(t), (t - S.figH.a) / (S.figH.b - S.figH.a)));

  // ---- sound (7): pencil on the first stroke, the break, the weights, the ruler, the eraser, the ding, the stamp
  AM.sfx('pencil', 0.0, { gain: 0.45 });
  AM.sfx('scratch', S.breakT - 0.02, { gain: 0.45, pitch: 0.8 });
  AM.sfx('thud', S.heavyT + 0.15, { gain: 0.35, pitch: 0.7 });
  AM.sfx('paper', S.rulerT[0], { gain: 0.3 });
  AM.sfx('scratch', C.ringan.start, { gain: 0.3, pitch: 0.55 });
  AM.sfx('ding', W('ringan', '10'), { gain: 0.4 });
  AM.sfx('stamp', C.crack.start + 0.7, { gain: 0.45 });
}

// ---------------------------------------------------------------- custom draws
function drawComet(item, t) {
  const d = item.d, tb = S.breakT;
  if (t < tb) { d.drawBaked(ctx, t); return; }
  const u = clamp((t - tb) / 2.6), e = ease.outCubic(u), fall = u * u, fade = 1 - ease.inOutSine(clamp((t - tb - 1.5) / 0.9));
  if (fade <= 0) return;
  const bx = B[0] - 30, by = B[1] - 60;
  const jag = K.jagged(bx, by - 120, 240, Math.PI / 2, { seed: 31, step: 16, wander: 0.5 }).map(([x, y]) => [x, y]);
  const halves = [
    { poly: [[bx - 900, by - 400], ...jag.map(([x, y]) => [x, y - 0]), [bx - 900, by + 400]], tx: -90 * e, ty: 260 * fall + 40 * e, r: -0.28 * e, sgn: -1 },
    { poly: [[bx + 900, by - 400], ...jag, [bx + 900, by + 400]], tx: 70 * e, ty: 340 * fall + 60 * e, r: 0.42 * e, sgn: 1 },
  ];
  for (const h of halves) {
    ctx.save();
    ctx.translate(bx + h.tx, by + h.ty); ctx.rotate(h.r); ctx.translate(-bx, -by);
    ctx.beginPath(); h.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
    d.drawBaked(ctx, t, { alpha: fade });
    ctx.restore();
  }
  // debris and motion marks (pencil)
  ctx.save(); ctx.strokeStyle = K.leadPattern(ctx, K.PAL.lead); ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.globalAlpha = 0.85 * fade;
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const a = hrand(i, 3) * Math.PI * 2, sp = 120 + hrand(i, 4) * 220, x = bx + Math.cos(a) * sp * e, y = by + Math.sin(a) * sp * e * 0.6 + 300 * fall;
    const r = 7 + hrand(i, 5) * 9, rr = hrand(i, 6) * 6 + t * 4;
    ctx.moveTo(x + Math.cos(rr) * r, y + Math.sin(rr) * r); ctx.lineTo(x + Math.cos(rr + 2.2) * r, y + Math.sin(rr + 2.2) * r); ctx.lineTo(x + Math.cos(rr + 4) * r * 0.7, y + Math.sin(rr + 4) * r * 0.7); ctx.closePath();
  }
  for (let i = 0; i < 4; i++) { const y = by - 60 + i * 40 + 200 * fall; ctx.moveTo(bx - 160 - i * 30, y - 90); ctx.lineTo(bx - 130 - i * 30, y - 150); ctx.moveTo(bx + 120 + i * 26, y - 70); ctx.lineTo(bx + 150 + i * 26, y - 130); }
  ctx.stroke(); ctx.restore();
}

function drawHeavy(item, t) {
  const d = item.d, o = S.oP(t);
  // squash when the weights land, strain jiggle while heavy
  const land = t - S.heavyT;
  const heavy = t > S.heavyT && t < S.liftT;
  const sq = land > 0 && land < 0.8 ? Math.exp(-land * 5) * Math.sin(land * 22) * 0.06 + 0.03 : heavy ? 0.03 + Math.sin(t * 9) * 0.006 : 0;
  ctx.save();
  const px = D[0] + 20, py = D[1] + 330;
  ctx.translate(px, py); ctx.scale(1 + sq * 0.6, 1 - sq); ctx.translate(-px, -py);
  d.draw(ctx, t, o);
  ctx.restore();
  // sweat drops while heavy
  if (heavy && t > S.heavyT + 0.3) {
    ctx.save(); ctx.strokeStyle = K.leadPattern(ctx, K.PAL.lead); ctx.lineWidth = 2.6; ctx.globalAlpha = 0.85;
    for (let i = 0; i < 2; i++) {
      const ph = ((t * 0.9 + i * 0.5) % 1), x = D[0] + 300 + i * 40, y = D[1] + 120 + ph * 70;
      ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.quadraticCurveTo(x + 12, y + 2, x, y + 6); ctx.quadraticCurveTo(x - 12, y + 2, x, y - 18); ctx.stroke();
    }
    ctx.restore();
  }
  // motion lines once it flies
  if (t > S.liftT + 0.3) {
    const f = clamp((t - S.liftT) / 2.6), e = ease.inCubic(f);
    ctx.save(); ctx.strokeStyle = K.leadPattern(ctx, K.PAL.lead); ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) { const x = D[0] - 240 + e * 900 - i * 14, y = D[1] + 160 - e * 560 + i * 34; ctx.moveTo(x, y); ctx.lineTo(x - 90 - i * 20, y + 34); }
    ctx.stroke(); ctx.restore();
  }
}


// ---------------------------------------------------------------- shots
const SHOTS = [];
const shot = (id, cam) => SHOTS.push({ id, cam });
shot('hook', (t) => {
  const r = W('hook', 'retakan'), [cx, cy] = S.crackA(t);
  const z = lerp(1.08, 3.0, prog(t, r - 0.2, r + 0.8, ease.inOutCubic));
  return [lerp(A[0] + 10, cx, prog(t, r - 0.2, r + 0.8)), lerp(A[1] - 20, cy + 10, prog(t, r - 0.2, r + 0.8)), z + 0.02 * Math.sin(t)];
});
shot('comet', (t) => [B[0] + 10 * Math.sin(t * 0.7), B[1] - 10 + (t - C.comet.start) * 12, 1.08 + 0.015 * (t - C.comet.start)]);
shot('tebal', (t) => [D[0], D[1] - 10 + (t - C.tebal.start) * 8, 1.07 + (t - C.tebal.start) * 0.01]);
shot('habibie', (t) => { const u = prog(t, C.habibie.start + 0.3, C.habibie.end - 0.3, ease.inOutSine); return [E[0] + lerp(-40, 80, u), E[1] - lerp(160, 20, u), lerp(1.0, 1.12, u)]; });
shot('ringan', (t) => { const u = prog(t, S.liftT + 0.2, S.liftT + 2.4, ease.inOutSine); return [D[0] + 20 * u, D[1] - 20 - 120 * u, 1.07 - 0.04 * u]; });
shot('crack', (t) => [H[0], H[1] + 40 + (t - C.crack.start) * 10, 1.1 + (t - C.crack.start) * 0.025]);

function shotAt(t) { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (C[SHOTS[i].id] && t >= C[SHOTS[i].id].start - 0.12) k = i; return k; }
function camAt(t) {
  const k = shotAt(t), sh = SHOTS[k];
  let c = sh.cam(t);
  if (k > 0) {
    const a = Math.max(0, C[sh.id].start - 0.12), TR = 0.55, f = clamp((t - a) / TR);
    if (f < 1) {
      const p = SHOTS[k - 1].cam(a), e = ease.inOutCubic(f);
      c = [lerp(p[0], c[0], e), lerp(p[1], c[1], e), Math.exp(lerp(Math.log(p[2]), Math.log(c[2]), e))];
    }
  }
  return c;
}

// ---------------------------------------------------------------- render
const SMUDGES = [[380, 1020, 90], [1880, 560, 70], [880, 2330, 110], [1420, 2280, 80], [300, 3480, 100], [900, 3420, 90]];
export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.sheet(ctx, SHEET);
  for (const [sx, sy, r] of SMUDGES) K.smudge(ctx, sx, sy, r, { alpha: 0.07, rot: sx * 0.01 });
  for (const it of ART) {
    if (it.custom) it.custom(it, t);
    else it.d.drawBaked(ctx, t, it.o ? it.o(t) : {});
  }
  if (t > S.figE.a) K.figureDraw(ctx, S.poseE(t), t, { reveal: clamp((t - S.figE.a) / (S.figE.b - S.figE.a)) });
  if (t > S.figH.a) K.figureDraw(ctx, S.poseH(t), t, { reveal: clamp((t - S.figH.a) / (S.figH.b - S.figH.a)) });
  // the clear ruler slides in under the x-axis
  const [r0, r1] = S.rulerT, G2 = S.graph;
  const ra = env(t, r0, r1 + 0.6, 0.25, 0.25);
  if (ra > 0) { const slide = (1 - ease.outCubic(clamp((t - r0) / 0.3))) * 300 + ease.inCubic(clamp((t - r1 - 0.35) / 0.25)) * 300; K.ruler(ctx, G2.ox - 20, G2.oy + 4 + slide, G2.x1 + 20, G2.oy - 2 + slide, { alpha: ra, width: 90 }); }
  // one pencil (or the eraser while rubbing)
  const st = pen.at(t);
  if (st && st.kind === 'erase') {
    const it = st.it, u = clamp((t - it.a) / (it.b - it.a));
    K.eraser(ctx, st.x - 20, st.y - 10, { rot: -0.45 + Math.sin(u * 40) * 0.08 });
  } else K.pencilFor(ctx, st, t, { s: 0.85 / z });
  K.light(fx);
  K.sheetMarks(fx, t, { scene: 'SC 09' });
  AM.lib.vignette(fx, { strength: 0.22, inner: 0.55, color: '60,45,25' });
  AM.lib.grain(fx, t, { amount: 0.035, fps: 12 });
}
