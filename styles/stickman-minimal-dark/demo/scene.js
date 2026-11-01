// Stickman Doodle demo (19 s): "Kenapa kita menunda-nunda?"
// A notebook page scrolled top to bottom, one doodle panel per line: "PEMALAS?" crossed out while your brain
// runs off from a cloud of bad feelings; the amygdala alarm screams KABUR!; phone relief, then a guilt cloud
// rains; a blue 5-minute timer; you push the TUGAS boulder and it shrinks to a pebble. Everything boils.
import * as K from '/styles/stickman-minimal-dark/kit.js';
const { clamp, lerp, ease, prog, env, noise, hrand } = AM.lib;
const { G } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1480, size: 66 } };

let ctx, fx;
const C = {};
const T = (id, f = 0) => C[id].start + f * (C[id].end - C[id].start);
const W = (id, w) => AM.wordTime(id, w);
const ART = [];
const pen = new K.Pen();
const S = {};
const PY = { hook: 700, amigdala: 1950, lega: 3200, lima: 4450, moral: 5700 };
const pop = (t, a, d = 0.3) => ease.outBack(clamp((t - a) / d), 2);

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const R = K.PAL.red, B = K.PAL.blue;

  // 1. "PEMALAS?" written, then crossed out in red
  const y1 = PY.hook;
  const d1 = new K.Sketch({ t0: -0.55, speed: 2600, seed: 1, gap: 0.03 });
  d1.text('PEMALAS?', 560, y1 - 420, { size: 120, align: 'center', font: 'Permanent Marker', cps: 13 });
  d1.at(W('hook', 'bukan') - 0.1);
  d1.line([[300, y1 - 520], [820, y1 - 400]], { col: R, w: 7, dur: 0.18 }); d1.line([[300, y1 - 400], [820, y1 - 510]], { col: R, w: 7, dur: 0.18 });
  d1.at(W('hook', 'Otakmu') + 0.3);
  ART.push(d1); pen.sketch(d1);
  S.kamu1 = [0.15, 0.85];
  S.brainOut = W('hook', 'Otakmu');

  // 2. TUGAS sheet, the amygdala alarm, KABUR!
  const y2 = PY.amigdala;
  const d2 = new K.Sketch({ t0: C.amigdala.start - 0.1, speed: 3400, seed: 2, gap: 0.02 });
  d2.line(G.rect(620, y2 - 470, 300, 380), { w: 6, dur: 0.25 });
  d2.text('TUGAS', 770, y2 - 390, { size: 64, align: 'center', font: 'Permanent Marker', cps: 18 });
  for (let i = 0; i < 4; i++) d2.line([[660, y2 - 320 + i * 50], [880 - (i % 2) * 40, y2 - 320 + i * 50]], { w: 4, dur: 0.05, gap: 0.01 });
  d2.text('besok!', 770, y2 - 120, { size: 56, align: 'center', col: R, cps: 22 });
  ART.push(d2); pen.sketch(d2);
  S.alarm = W('amigdala', 'amigdala') - 0.05; S.kabur = W('amigdala', 'kabur') - 0.1;

  // 3. phone relief, then the guilt cloud
  S.phone = C.lega.start; S.guilt = W('lega', 'bersalah') - 0.5;

  // 4. the 5-minute timer
  const y4 = PY.lima;
  const d4 = new K.Sketch({ t0: C.lima.start - 0.1, speed: 3200, seed: 4, gap: 0.03 });
  d4.line(G.circle(700, y4 - 160, 200, -1.6, 0.15), { col: B, w: 9, dur: 0.4 });
  d4.line([[700, y4 - 360], [700, y4 - 400]], { col: B, w: 9, dur: 0.06 }); d4.line([[640, y4 - 410], [760, y4 - 410]], { col: B, w: 9, dur: 0.08 });
  d4.text('mood?', 260, y4 - 420, { size: 64, align: 'center', cps: 18 });
  d4.line([[160, y4 - 400], [360, y4 - 440]], { col: R, w: 6, dur: 0.12 });
  ART.push(d4); pen.sketch(d4);
  S.timerA = W('lima', 'lima') - 0.2;

  // 5. the boulder
  const y5 = PY.moral;
  S.push = [C.moral.start, T('moral', 0.55)];
  const d5 = new K.Sketch({ t0: T('moral', 0.5), speed: 2800, seed: 5, gap: 0.03 });
  d5.text('cuma 5 menit!', 540, y5 - 470, { size: 92, align: 'center', font: 'Permanent Marker', cps: 18 });
  d5.line([[230, y5 - 420], [850, y5 - 428]], { col: R, w: 7, dur: 0.2 });
  d5.line([[790, y5 - 250], [830, y5 - 205], [920, y5 - 330]], { col: R, w: 10, dur: 0.25 });
  ART.push(d5); pen.sketch(d5);

  // sound (8)
  AM.sfx('pencil', 0.0, { gain: 0.35, pitch: 0.8 });
  AM.sfx('scratch', W('hook', 'bukan'), { gain: 0.35 });
  AM.sfx('slide_whistle', S.brainOut + 0.1, { gain: 0.3 });
  AM.sfx('boing', S.alarm, { gain: 0.3 });
  AM.sfx('impact', S.kabur, { gain: 0.35, pitch: 1.4 });
  AM.sfx('rain', S.guilt + 0.1, { gain: 0.18 });
  AM.sfx('tick', S.timerA + 0.4, { gain: 0.35 }); AM.sfx('tick', S.timerA + 1.4, { gain: 0.35 });
  AM.sfx('ding', T('moral', 0.62), { gain: 0.4 });
}

// ---------------------------------------------------------------- characters per panel
function kamuPose(t) {
  const y1 = PY.hook, y2 = PY.amigdala, y3 = PY.lega, y4 = PY.lima, y5 = PY.moral;
  const blink = (t % 3.1) < 0.12 ? 1 : 0;
  if (t < C.amigdala.start - 0.1) {
    const out = t > S.brainOut;
    return { x: 300, y: y1 + 380, s: 1.45, face: out ? 'shock' : 'worried', tilt: out ? -0.15 : Math.sin(t * 2) * 0.05, look: out ? 0.8 : 0, blink,
      arms: out ? [[1.6, 0.6], [-1.3, -0.4]] : [[0.25, 0.2], [-0.25, -0.2]], hair: 'tuft' };
  }
  if (t < C.lega.start - 0.1) {
    const k = t > S.kabur; const sh = k ? noise.n2(t * 30, 3) * 0.08 : 0;
    return { x: 290, y: y2 + 380, s: 1.45, face: k ? 'shock' : 'worried', look: 0.6, tilt: sh, blink: 0, hair: 'tuft',
      arms: k ? [[2.7, 0.3], [-2.7, -0.3]] : [[1.2, 1.4], [-1.2, -1.4]], legs: k ? [[0.5, 0], [-0.5, 0]] : undefined };
  }
  if (t < C.lima.start - 0.1) {
    const g = t > S.guilt + 0.3;
    return { x: 400, y: y3 + 370, s: 1.45, face: g ? 'worried' : 'happy', look: g ? -0.3 : 0.4, tilt: g ? 0.12 : -0.1 + Math.sin(t * 2) * 0.04, blink, hair: 'tuft',
      arms: [[1.9, -1.4], [0.6, 1.2]], legs: [[0.35, 0], [-0.25, 0]], lean: g ? 0.08 : -0.05 };
  }
  if (t < C.moral.start - 0.1) {
    const said = t > S.timerA;
    return { x: 250, y: y4 + 380, s: 1.4, face: said ? 'grin' : 'skeptic', look: 0.8, blink, hair: 'tuft', mouth: said ? 0.5 + 0.5 * Math.sin(t * 16) : 0,
      arms: said ? [[2.0, 0.1], [-0.6, 1.8]] : [[0.4, 1.6], [-0.4, -1.6]] };
  }
  const p = prog(t, S.push[0], S.push[1]), done = t > S.push[1] + 0.1;
  const ph = (t * 2.2) % 1, sw = Math.sin(ph * Math.PI * 2);
  if (done) return { x: lerp(200, 560, 1), y: y5 + 330 - Math.abs(Math.sin((t - S.push[1]) * 6)) * 24, s: 1.2, face: 'happy', look: 0, hair: 'tuft', arms: [[2.7, 0.2], [-2.7, -0.2]] };
  return { x: lerp(200, 560, p), y: y5 + 330, s: 1.2, face: p < 0.5 ? 'worried' : 'grin', look: 0.8, lean: 0.35, hair: 'tuft', arms: [[1.6, 0.3], [1.3, 0.5]],
    legs: [[0.6 * sw, 0.3], [-0.6 * sw, 0.3]] };
}

function panelExtras(t) {
  const R = K.PAL.red, B = K.PAL.blue;
  // 1: the bad-feeling cloud and the brain running away
  if (t < C.amigdala.start + 0.4) {
    const y1 = PY.hook;
    const ca = pop(t, S.brainOut + 0.2);
    if (ca > 0) { ctx.save(); ctx.translate(290, y1 - 250); ctx.scale(ca, ca); K.cloud(ctx, 0, 0, t, { s: 1.2, label: 'nggak enak', rain: true }); ctx.restore(); }
    if (t > S.brainOut) {
      const u = clamp((t - S.brainOut) / 2.4), e = ease.inOutSine(u);
      const bx = lerp(330, 840, e), by = lerp(y1 - 20, y1 + 300, ease.outCubic(clamp(u * 2)));
      K.brainGuy(ctx, bx, by, t, { s: 1.15 * pop(t, S.brainOut, 0.25), run: t * 3.5, face: 'shock', look: 1 });
      K.motion(ctx, bx - 70, by - 110, 0, { n: 3, len: 80 });
      K.sweat(ctx, bx - 40, by - 190, t, { n: 2 });
    }
    K.mtext(ctx, 'KAMU', 300, y1 + 430, { size: 48, alpha: clamp(t * 3) });
  }
  // 2: amygdala alarm blob shouting
  if (t > C.amigdala.start - 0.5 && t < C.lega.start + 0.4) {
    const y2 = PY.amigdala, a = pop(t, S.alarm, 0.35);
    if (a > 0) {
      const x = 760, y = y2 + 200, wob = Math.sin(t * 40) * 6 * (t > S.kabur ? 1 : 0.3);
      ctx.save(); ctx.translate(x + wob, y); ctx.scale(a, a);
      ctx.fillStyle = R; ctx.beginPath(); ctx.ellipse(0, 0, 110, 90, 0, 0, Math.PI * 2); ctx.fill();
      K.mline(ctx, Array.from({ length: 31 }, (_, k) => [Math.cos(k / 30 * Math.PI * 2) * 110, Math.sin(k / 30 * Math.PI * 2) * 90]), { w: 6, seed: 401 });
      // siren on top + flashing rays
      ctx.fillStyle = K.PAL.yellow; ctx.beginPath(); ctx.ellipse(0, -100, 34, 28, 0, Math.PI, 0); ctx.fill();
      K.mline(ctx, [[-34, -100], ...Array.from({ length: 9 }, (_, k) => [Math.cos(Math.PI + k / 8 * Math.PI) * 34, -100 + Math.sin(Math.PI + k / 8 * Math.PI) * 28]), [-34, -100]], { w: 5, seed: 402 });
      if (Math.floor(t * 8) % 2) for (let i = 0; i < 5; i++) { const an = -Math.PI / 2 + (i - 2) * 0.45; K.mline(ctx, [[Math.cos(an) * 60, -110 + Math.sin(an) * 60], [Math.cos(an) * 100, -110 + Math.sin(an) * 100]], { w: 5, col: K.PAL.yellow, seed: 410 + i }); }
      for (const sx of [-1, 1]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx * 32, -14, 18, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = K.PAL.ink; ctx.beginPath(); ctx.arc(sx * 30, -12, 7, 0, Math.PI * 2); ctx.fill(); }
      K.mline(ctx, Array.from({ length: 11 }, (_, k) => [Math.cos(k / 10 * Math.PI * 2) * 26, 40 + Math.sin(k / 10 * Math.PI * 2) * 22]), { w: 5, seed: 420 });
      ctx.restore();
      K.mtext(ctx, 'amigdala', x, y + 140, { size: 48, alpha: a });
      K.bubble(ctx, 690, y2 + 20, 340, 170, x - 30, y - 90, 'KABUR!!', { a: clamp((t - S.kabur) / 0.25), size: 80, shout: true, font: 'Permanent Marker', textCol: R, col: R });
      if (t > S.kabur) K.sweat(ctx, 290, PY.amigdala + 380 - 330 * 1.45, t, { n: 3, s: 1.3 });
    }
  }
  // 3: phone, relief, then guilt cloud and a growing TUGAS pile
  if (t > C.lega.start - 0.5 && t < C.lima.start + 0.4) {
    const y3 = PY.lega, k = kamuPose(t); const ks = k.s, hx = k.x + Math.sin(1.9) * 58 * ks + Math.sin(1.9 - 1.4) * 56 * ks, hy = k.y - 232 * ks + Math.cos(1.9) * 58 * ks + Math.cos(0.5) * 56 * ks;
    ctx.save(); ctx.translate(hx + 10, hy - 30); ctx.rotate(-0.3); ctx.fillStyle = '#2b2b2f'; ctx.fillRect(-28, -50, 56, 100); ctx.fillStyle = '#9fd3ff'; ctx.fillRect(-22, -42, 44, 80); ctx.restore();
    const g = t > S.guilt;
    if (!g || t < S.guilt + 0.3) { K.mtext(ctx, 'ahh~', k.x + 230, y3 - 160, { size: 70, col: B, alpha: env(t, C.lega.start + 0.2, S.guilt + 0.3, 0.2, 0.2) }); for (let i = 0; i < 3; i++) K.mline(ctx, [[hx + 50 + i * 16, hy - 90 - i * 20], [hx + 70 + i * 22, hy - 120 - i * 26]], { w: 4, col: B, seed: 500 + i, alpha: env(t, C.lega.start + 0.2, S.guilt + 0.3, 0.2, 0.2) }); }
    const ca = pop(t, S.guilt, 0.4);
    if (ca > 0) { ctx.save(); ctx.translate(lerp(900, k.x + 30, ease.outCubic(clamp((t - S.guilt) / 0.6))), y3 - 360); ctx.scale(ca * 1.1, ca * 1.1); K.cloud(ctx, 0, 0, t, { label: 'bersalah', rain: true }); ctx.restore(); }
    const pile = 1 + 0.35 * prog(t, S.guilt, S.guilt + 1.2);
    ctx.save(); ctx.translate(860, y3 + 330); ctx.scale(pile, pile);
    for (let i = 0; i < 4; i++) { const yy = -i * 46; ctx.fillStyle = '#fffdf6'; ctx.fillRect(-90 + (i % 2) * 10, yy - 44, 180, 42); K.mline(ctx, G.rect(-90 + (i % 2) * 10, yy - 44, 180, 42), { w: 5, seed: 520 + i }); }
    K.mtext(ctx, 'TUGAS', 0, -205, { size: 46, font: 'Permanent Marker', col: R });
    ctx.restore();
  }
  // 4: the timer counting down, the speech bubble
  if (t > C.lima.start - 0.5 && t < C.moral.start + 0.4) {
    const y4 = PY.lima, a = clamp((t - S.timerA) / 0.2);
    const secs = Math.max(0, 300 - Math.floor(Math.max(0, t - S.timerA - 0.3) * 1));
    K.mtext(ctx, `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, 700, y4 - 150, { size: 140, col: K.PAL.blue, font: 'Permanent Marker', alpha: a });
    const ha = -Math.PI / 2 + Math.max(0, t - S.timerA) * 1.2;
    K.mline(ctx, [[700, y4 - 160], [700 + Math.cos(ha) * 150, y4 - 160 + Math.sin(ha) * 150]], { w: 6, col: K.PAL.blue, seed: 600, alpha: 0.35 + 0.65 * a });
    K.bubble(ctx, 470, y4 + 170, 380, 150, 330, y4 + 0, '5 menit aja!', { a: clamp((t - S.timerA - 0.3) / 0.25), size: 60 });
  }
  // 5: the boulder that shrinks as you push
  if (t > C.moral.start - 0.5) {
    const y5 = PY.moral, p = prog(t, S.push[0], S.push[1]), k = kamuPose(t);
    const r = lerp(190, 38, ease.inOutSine(p));
    const bx = t > S.push[1] + 0.1 ? 600 : k.x + 150 * 1.2 * 0.9 + r, by = y5 + 330 - r;
    ctx.save(); ctx.fillStyle = '#d9d4c8'; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    K.mline(ctx, Array.from({ length: 29 }, (_, q) => { const an = q / 28 * Math.PI * 2 + p * 6; const rr = r * (1 + 0.07 * Math.sin(q * 3)); return [bx + Math.cos(an) * rr, by + Math.sin(an) * rr]; }), { w: 6, seed: 700 });
    if (r > 70) K.mtext(ctx, 'TUGAS', bx, by, { size: r * 0.42, font: 'Permanent Marker' });
    K.mline(ctx, [[60, y5 + 332], [1020, y5 + 328]], { w: 5, seed: 701 });
    if (p > 0 && p < 1) { K.sweat(ctx, k.x + 20, k.y - 340, t, { n: 1 }); K.motion(ctx, k.x - 60, k.y - 200, 0, { n: 3, len: 60 }); }
    if (p > 0.15 && p < 0.9) K.mtext(ctx, 'mengecil...', 760, y5 - 40, { size: 50, col: K.PAL.blue, alpha: env(t, S.push[0] + 0.4, S.push[1], 0.2, 0.2) });
  }
}

// ---------------------------------------------------------------- camera: scroll down the page
const ORDER = ['hook', 'amigdala', 'lega', 'lima', 'moral'];
function camAt(t) {
  let k = 0; for (let i = 0; i < ORDER.length; i++) if (C[ORDER[i]] && t >= C[ORDER[i]].start - 0.15) k = i;
  const id = ORDER[k], a = C[id].start - 0.15, prevY = k ? PY[ORDER[k - 1]] : PY.hook, f = ease.inOutCubic(clamp((t - a) / 0.55));
  const drift = (t - a) * 10;
  let y = lerp(prevY, PY[id], f) - 40 + drift, z = 1.0 + 0.02 * Math.sin(t * 0.8);
  if (id === 'amigdala' && t > S.kabur && t < S.kabur + 0.5) { y += noise.n2(t * 40, 1) * 14; }
  if (id === 'moral') z = lerp(1.0, 0.94, prog(t, S.push[1], S.push[1] + 1.5));
  return [540 + (id === 'amigdala' && t > S.kabur && t < S.kabur + 0.5 ? noise.n2(t * 40, 5) * 14 : 0), y, z];
}

export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  K.setBoil(t, 1.7, 12);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.notebook(ctx);
  for (const d of ART) d.draw(ctx, t);
  panelExtras(t);
  const kp = kamuPose(t);
  const rv = t < 0.85 ? clamp((t - S.kamu1[0]) / (S.kamu1[1] - S.kamu1[0])) : 1;
  if (rv > 0) K.stickDraw(ctx, kp, t, { reveal: rv });
  const st = pen.at(t) || (t < S.kamu1[1] && t > S.kamu1[0] ? K.stickTip(kp, rv) : null);
  K.markerFor(ctx, st, { s: 1 / z });
  AM.lib.vignette(fx, { strength: 0.18, inner: 0.55, color: '70,50,20' });
}
