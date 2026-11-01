// Dark Glow Product UI demo (20 s): "Apa yang Terjadi Saat Kamu Menekan Kirim" (end-to-end encryption).
// One hero object, never cut: the message card. It scrambles into cipher glyphs, a padlock snaps onto it, it rides
// a light trail to the server (which cannot read it) and on to the other phone, where the private key opens it.
import * as K from '/styles/dark-glow-ui/kit.js';
const { clamp, lerp, ease, prog, env } = AM.lib;
const P = K.PAL, R = K.RGB;

export const meta = { fps: 24, hold: 1, captions: { preset: 'neon', y: 1482, size: 52 } };

let bg, world, ui, fx;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
const MSG = 'Aku sayang kamu';
const CIPH = K.cipher(31, 15);
const LONGC = K.cipher(77, 44);

const S = { x: 540, y: 1010, s: 1.08 };
const V = { x: 2300, y: 820 };
const RX = { x: 4060, y: 1010, s: 1.08 };
const NUM = { x: 2300, y: 3400 };
const toW = (ph, lx, ly) => [ph.x + (lx - 195) * ph.s, ph.y + (ly - 422) * ph.s];
const PATH1 = [[540, 600], [1100, 160], [1700, 240], [V.x - 260, 600]];
const PATH2 = [[V.x + 260, 600], [2900, 240], [3500, 160], [RX.x, 560]];

let CAM = [], T = {};
export async function setup(AM) {
  // two layers only (+ captions): every extra full-screen layer is another composite at capture time
  world = AM.layer('world'); ui = AM.layer('ui'); bg = world; fx = ui;
  for (const l of AM.timeline.lines) C[l.id] = l;
  T.scr = W('hook', 'diacak') - 0.1;
  T.send = C.hook.end - 0.55;
  T.lock = C.kunci.start + 0.1;
  T.l1 = [C.kunci.start + 0.55, C.kunci.start + 1.45];
  T.l2 = [C.buka.start - 0.15, C.buka.start + 0.75];
  T.open = W('buka', 'membukanya') - 0.3;
  T.e77 = W('tapi', 'sepuluh') - 0.1;
  CAM = [
    [0, 540, 600, 1.3, -0.03],
    [0.05, 540, 660, 1.16, 0],
    [T.send - 0.5, 540, 900, 1.0],
    [T.l1[0] + 0.1, V.x, V.y + 120, 1.0],
    [T.l2[0] + 0.15, RX.x, RX.y - 60, 1.05],
    [C.tapi.start - 0.1, NUM.x, NUM.y, 0.95, 0.02],
    [C.tapi.start + 0.6, NUM.x, NUM.y, 1.0],
    [C.akhir.start - 0.1, 2300, 960, 0.255],
    [AM.duration, 2300, 960, 0.27],
  ];
  AM.sfx('glitch', T.scr, { gain: 0.45 });
  AM.sfx('click', T.lock + 0.15, { gain: 0.5, pitch: 0.7 });
  AM.sfx('whoosh', T.l1[0], { gain: 0.4 });
  AM.sfx('tick', T.l1[1], { gain: 0.5 });
  AM.sfx('whoosh', T.l2[0], { gain: 0.35, pitch: 1.1 });
  AM.sfx('magic', T.open, { gain: 0.4 });
  AM.sfx('impact', T.e77 + 1.6, { gain: 0.45 });
  AM.sfx('chime', W('akhir', 'satu'), { gain: 0.4 });
}
let cam = { x: 540, y: 960, z: 1 };
const toS = (x, y) => K.toScreen(cam, x, y);

// ---------------------------------------------------------------- phone screens
function chatHeader(g, name) {
  g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(0, 0, 390, 132);
  g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, 131, 390, 1);
  K.label(g, '‹', 22, 92, { size: 34 });
  const gr = g.createLinearGradient(52, 70, 100, 118); gr.addColorStop(0, P.pink); gr.addColorStop(1, P.violet);
  g.fillStyle = gr; g.beginPath(); g.arc(76, 92, 24, 0, Math.PI * 2); g.fill();
  K.label(g, name[0], 76, 93, { size: 20, weight: 700, align: 'center', spacing: 0 });
  K.label(g, name, 114, 82, { size: 20, weight: 700, spacing: 0 });
  K.label(g, 'terenkripsi end-to-end', 114, 106, { size: 13, color: P.mint, font: K.FONT.mono, spacing: 0 });
}
function history(g, mine) {
  [['Udah sampai rumah?', mine ? 0 : 1], ['Udah', mine ? 1 : 0], ['Makan dulu ya', mine ? 0 : 1]].forEach(([txt, other], i) => {
    const y = 200 + i * 78;
    if (other) K.bubble(g, 20, y, txt, { mine: false, size: 18, time: '21.3' + i });
    else K.bubble(g, 370, y, txt, { mine: true, size: 18, time: '21.3' + i, tickN: 2, tickColor: P.tick });
  });
}
function senderScreen(g, t) {
  chatHeader(g, 'Dia'); history(g, true);
  g.fillStyle = 'rgba(255,255,255,0.06)'; AM.lib.roundRect(g, 16, 752, 300, 56, 28); g.fill();
  const sent = t > T.send;
  K.label(g, sent ? 'Ketik pesan' : MSG, 38, 781, { size: 19, spacing: 0, color: sent ? P.ink3 : P.ink });
  const press = Math.max(0, 1 - Math.abs(t - T.send) / 0.15);
  const gr = g.createLinearGradient(328, 752, 380, 808); gr.addColorStop(0, P.violet); gr.addColorStop(1, P.blue);
  g.fillStyle = gr; g.beginPath(); g.arc(352, 780, 28 - press * 4, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(342, 780); g.lineTo(364, 780); g.moveTo(355, 771); g.lineTo(364, 780); g.lineTo(355, 789); g.stroke();
  if (sent) {
    const p = K.sp(t, T.send, 0.5, 0.7), nt = t > T.l2[1] ? 2 : t > T.l1[1] ? 1 : 0;
    g.save(); g.translate(0, (1 - p) * 220); g.globalAlpha = clamp(p * 2);
    K.bubble(g, 370, 470, MSG, { mine: true, size: 21, tickN: nt, tickColor: t > T.open + 0.8 ? P.tick : 'rgba(255,255,255,0.7)' });
    g.restore();
  }
}
function recvScreen(g, t) {
  chatHeader(g, 'Kamu'); history(g, false);
  const kp = K.sp(t, C.buka.start + 0.1, 0.6, 0.7);
  if (kp > 0) {
    g.save(); g.globalAlpha = clamp(kp * 1.5);
    AM.lib.roundRect(g, 60, 640, 270, 64, 18); g.fillStyle = 'rgba(111,243,255,0.08)'; g.fill(); g.strokeStyle = 'rgba(111,243,255,0.5)'; g.lineWidth = 1.5; g.stroke();
    K.keyIcon(g, 108, 672, 0.24, { rgb: R.cyan, rot: Math.sin(t * 2) * 0.05 });
    K.label(g, 'Kunci privat', 150, 662, { size: 16, weight: 700, color: P.cyan, spacing: 0 });
    K.label(g, 'tak pernah keluar HP', 150, 684, { size: 12, color: P.ink2, font: K.FONT.mono, spacing: 0 });
    g.restore();
  }
  if (t > T.l2[1] + 0.2) {
    const p = K.sp(t, T.l2[1] + 0.2, 0.5, 0.7), dec = clamp((t - T.open) / 0.8);
    const txt = dec <= 0 ? CIPH : K.scramble(MSG, 1 - dec, t, 9, CIPH);
    g.save(); g.globalAlpha = clamp(p * 2); g.translate((1 - p) * -60, 0);
    K.bubble(g, 20, 470, txt, { mine: false, size: 21, mono: dec < 1, fill: dec < 1 ? 'rgba(124,108,255,0.22)' : 'rgba(255,255,255,0.10)' });
    if (dec >= 1) K.heart(g, 248, 494, 18, P.pink);
    g.restore();
  }
}

// ---------------------------------------------------------------- the hero message card
function heroCard(ctx, t) {
  if (t > T.l2[1] + 0.3) return;
  const [a1, b1] = T.l1, [a2, b2] = T.l2;
  let x = 540, y = 600, sc = 1, trail = null, tu = 0;
  if (t >= a1 && t < a2) {
    const u = ease.inOutCubic(clamp((t - a1) / (b1 - a1)));
    if (u < 1) { [x, y] = K.bez(PATH1, u); trail = PATH1; tu = u; } else { x = lerp(V.x - 260, V.x, ease.outCubic(clamp((t - b1) / 0.4))); y = 600; }
  } else if (t >= a2) {
    const u = ease.inOutCubic(clamp((t - a2) / (b2 - a2)));
    if (u <= 0) { x = V.x; } else if (u < 1) { [x, y] = K.bez(PATH2, u); trail = PATH2; tu = u; }
    else { const k = ease.inCubic(clamp((t - b2) / 0.3)); const [tx, ty] = toW(RX, 130, 492); x = lerp(RX.x, tx, k); y = lerp(560, ty, k); sc = lerp(1, 0.3, k); }
  }
  if (trail) K.lightTrail(ctx, (u) => K.bez(trail, u), tu, { len: 0.35, rgb: R.violet, width: 7, glowR: 46 });
  const p = K.sp(t, 0, 0.8, 0.7);
  const u = clamp((t - T.scr) / 0.8);
  const travel = t > a1 ? 1 : 0;
  sc *= lerp(1, 0.82, K.sp(t, T.lock, 0.5, 0.7));
  const w = 760, h = 170;
  ctx.save(); K.rise(ctx, x, y, p, { dy: 80 }); ctx.translate(x, y); ctx.scale(sc, sc); ctx.translate(-x, -y);
  K.glass(ctx, x - w / 2, y - h / 2, w, h, { r: 85, haloRgb: u > 0.3 ? R.violet : R.pink, haloA: 0.55 });
  const blind = t > b1 && t < a2 + 0.1;
  const plain = u > 0 ? K.scramble(MSG, u, t, 3, CIPH) : MSG;
  const txt = blind ? K.scramble(LONGC.slice(0, 15), 0.5 + 0.5 * Math.sin(t * 9), t, 4) : plain;
  const lk = K.sp(t, T.lock, 0.45, 0.55);
  const tx = x - 40 + lk * 95;
  K.label(ctx, txt, tx, y + 2, { size: 60, weight: u > 0.5 ? 400 : 700, align: 'center', font: u > 0.5 ? K.FONT.mono : K.FONT.sans, color: u > 0.5 ? '#C9C2FF' : P.ink });
  if (u < 0.5) K.heart(ctx, x + 300, y + 4, 46, P.pink);
  // the padlock snaps onto the message
  if (lk > 0) { ctx.save(); K.rise(ctx, x - 290, y, lk, { from: 1.8, dy: -60 }); K.padlock(ctx, x - 290, y + 12, 0.56, { open: 1 - K.sp(t, T.lock + 0.12, 0.3, 0.6), glowA: 0.5 }); ctx.restore(); }
  if (travel) K.micro(ctx, 'AES-256 · ' + (t < b1 ? 'menuju server' : t < a2 ? 'di server' : 'menuju HP dia'), x, y + 120, { align: 'center', size: 20, color: P.ink2 });
  ctx.restore();
  if (u > 0 && u < 1) K.sparks(ctx, x, y, t - T.scr, { n: 30, rgb: R.violet, seed: 5 });
}

// ---------------------------------------------------------------- numbers stage
function numbers(ctx, t) {
  if (t < C.tapi.start - 0.6 || t > C.akhir.start + 0.4) return;
  const x = NUM.x, y = NUM.y, a = env(t, C.tapi.start - 0.2, C.akhir.start + 0.2, 0.35, 0.35);
  ctx.save(); ctx.globalAlpha *= a;
  for (let i = 0; i < 11; i++) { // brute force: keys tried and rejected
    const yy = y - 700 + i * 120 + ((t * 360) % 120);
    ctx.globalAlpha = a * (0.12 + 0.3 * Math.sin((i / 10) * Math.PI));
    K.label(ctx, K.cipher(Math.floor(t * 18) + i * 3, 26), x, yy, { size: 30, font: K.FONT.mono, align: 'center', color: i === 5 ? '#FF7AAE' : P.ink2 });
  }
  ctx.globalAlpha = a;
  const e = Math.round(K.count(t, T.e77, 1.7, 1, 77));
  const pop = K.sp(t, T.e77 - 0.2, 0.6, 0.6);
  ctx.save(); K.rise(ctx, x, y, pop, { from: 0.7, dy: 0 });
  K.glow(ctx, x, y - 140, 560, R.violet, 0.4);
  K.power(ctx, '10', String(e), x, y + 40, { size: 340, expColor: [P.violet, P.blue] });
  ctx.restore();
  const lp = K.sp(t, W('tapi', 'kemungkinan') - 0.2, 0.6, 0.7);
  if (lp > 0) {
    ctx.save(); K.rise(ctx, x, y + 170, lp);
    K.glass(ctx, x - 330, y + 120, 660, 100, { r: 50 });
    K.label(ctx, 'kemungkinan kunci', x, y + 172, { size: 40, weight: 700, align: 'center' });
    ctx.restore();
    K.micro(ctx, 'kunci AES-256 · 2²⁵⁶ ≈ 1,16 × 10⁷⁷', x, y + 280, { align: 'center', size: 20, color: P.ink2, alpha: clamp(lp) });
  }
  ctx.restore();
}

// ---------------------------------------------------------------- overlays
function overlays(t) {
  const H = (lines, at, out, o = {}) => K.headline(ui, t, at, lines, 540, o.y || 236, { size: 80, out, ...o });
  const E = (str, a, b, y = 150) => K.micro(ui, str, 540, y, { align: 'center', alpha: env(t, a, b, 0.3, 0.3), color: P.ink2, size: 22 });
  if (t < C.kunci.start) { E('end-to-end · pesan terenkripsi', 0, C.hook.end); H(['Sebelum keluar dari HP-mu,'], 0.05, C.hook.end, { size: 62 }); H(['pesanmu *diacak*.'], T.scr - 0.05, C.hook.end + 0.05, { y: 330, size: 88 }); }
  if (t > C.kunci.start - 0.1 && t < C.buka.start) {
    H(['Dikunci *gembok*', 'milik si dia.'], C.kunci.start + 0.05, T.l1[0] + 0.15, { y: 210 });
    H(['Server cuma lihat', '*huruf acak*.'], T.l1[1] - 0.2, C.buka.start - 0.15, { y: 210 });
  }
  if (t > C.buka.start - 0.1 && t < C.tapi.start) H(['Kunci *privat*', 'membukanya.'], C.buka.start + 0.35, C.tapi.start - 0.1, { y: 210, size: 76 });
  if (t > C.tapi.start - 0.1 && t < C.akhir.start) H(['*Dibobol*?'], C.tapi.start + 0.05, C.akhir.start - 0.1, { y: 290, size: 96 });
  if (t > C.akhir.start) {
    const a = K.sp(t, C.akhir.start + 0.1, 0.8, 0.7);
    ui.save(); K.rise(ui, 540, 620, a, { dy: 70 });
    K.glass(ui, 130, 530, 820, 170, { r: 85, haloRgb: R.pink, haloA: 0.5 });
    K.label(ui, MSG, 470, 617, { size: 62, weight: 700, align: 'center' });
    K.heart(ui, 770, 620, 44, P.pink);
    K.ticks(ui, 830, 610, 2, { s: 40, color: P.tick, lw: 5, p: clamp((t - C.akhir.start - 0.5) / 0.4) });
    ui.restore();
    H(['Untuk *satu* orang.'], W('akhir', 'hanya') - 0.1, 999, { y: 330 });
    const sa = K.sp(t, W('akhir', 'orang'), 0.6, 0.7);
    if (sa > 0) { ui.save(); ui.globalAlpha = clamp(sa); K.eyeOff(ui, 362, 812, 36, P.ink2); K.label(ui, 'server pun tak bisa membaca', 392, 813, { size: 30, color: P.ink2 }); ui.restore(); }
  }
  K.micro(ui, 'E2E · AES-256', 60, 70, { size: 18 });
  const sec = Math.floor(t), fr = Math.floor((t % 1) * 24);
  K.micro(ui, `00:${String(sec).padStart(2, '0')}:${String(fr).padStart(2, '0')}`, 940, 70, { size: 18, align: 'right' });
  // finger tap on Send
  const pa = env(t, T.send - 0.6, T.send + 0.45, 0.25, 0.25);
  if (pa > 0) {
    const [bx, by] = toW(S, 352, 780), k = ease.outCubic(clamp((t - T.send + 0.6) / 0.5));
    const [sx, sy] = toS(lerp(bx + 160, bx, k), lerp(by + 220, by, k)), pr = Math.max(0, 1 - Math.abs(t - T.send) / 0.12);
    ui.save(); ui.globalAlpha = pa; ui.fillStyle = 'rgba(255,255,255,0.18)'; ui.beginPath(); ui.arc(sx, sy, 46 - pr * 10, 0, Math.PI * 2); ui.fill();
    ui.strokeStyle = 'rgba(255,255,255,0.8)'; ui.lineWidth = 3; ui.stroke();
    const age = t - T.send; if (age > 0 && age < 0.5) { ui.globalAlpha = pa * (1 - age / 0.5); ui.beginPath(); ui.arc(sx, sy, 46 + age * 220, 0, Math.PI * 2); ui.stroke(); }
    ui.restore();
  }
}

// ---------------------------------------------------------------- frame
export function render(t) {
  cam = K.camAt(t, CAM, { z: 1, ts: 0.8 });
  const deep = env(t, C.tapi.start - 0.2, C.akhir.start, 0.4, 0.4);
  K.stage(bg, t, { px: (cam.x - 540) * 0.06, py: (cam.y - 960) * 0.06, intensity: 1 - deep * 0.35 });
  world.setTransform(1, 0, 0, 1, 0, 0);
  K.applyCam(world, cam);
  if (cam.y < 2400) {
    if (Math.abs(cam.x - S.x) < 1500 / cam.z) K.phone(world, S.x, S.y, S.s, (g) => senderScreen(g, t), { rimRgb: R.violet, rimA: 0.45 });
    world.save(); world.strokeStyle = 'rgba(124,108,255,0.18)'; world.lineWidth = 3; world.setLineDash([3, 16]); world.lineDashOffset = -t * 30;
    for (const Pp of [PATH1, PATH2]) { world.beginPath(); world.moveTo(...Pp[0]); world.bezierCurveTo(...Pp[1], ...Pp[2], ...Pp[3]); world.stroke(); }
    world.restore();
    K.server(world, V.x, V.y, 1.0, t, { active: env(t, T.l1[1] - 0.2, T.l2[0] + 0.3, 0.2, 0.3) });
    K.micro(world, 'SERVER', V.x, V.y + 230, { align: 'center', size: 22, color: P.ink2 });
    if (t > T.l1[1] - 0.1 && t < T.l2[0] + 0.3) { // a read attempt that fails
      const b = env(t, T.l1[1], T.l2[0] + 0.2, 0.2, 0.3), sy = V.y - 380 + ((t * 1.6) % 1) * 240;
      world.save(); world.globalAlpha = b; world.globalCompositeOperation = 'lighter';
      const g = world.createLinearGradient(0, sy - 40, 0, sy + 40); g.addColorStop(0, 'rgba(61,169,255,0)'); g.addColorStop(0.5, 'rgba(61,169,255,0.5)'); g.addColorStop(1, 'rgba(61,169,255,0)');
      world.fillStyle = g; world.fillRect(V.x - 330, sy - 40, 660, 80); world.restore();
      const e = K.sp(t, T.l1[1] + 0.2, 0.5, 0.55);
      if (e > 0) {
        world.save(); world.globalAlpha *= clamp(e) * b; K.rise(world, V.x, V.y + 340, e);
        K.glass(world, V.x - 270, V.y + 290, 540, 100, { r: 50 });
        K.eyeOff(world, V.x - 190, V.y + 340, 44, '#FF7AAE');
        K.label(world, 'Isi: tidak terbaca', V.x - 150, V.y + 341, { size: 32, weight: 700 });
        world.restore();
      }
      const t1 = K.sp(t, T.l1[1], 0.45, 0.55);
      world.save(); K.rise(world, V.x + 340, V.y - 330, t1); K.glass(world, V.x + 230, V.y - 380, 220, 100, { r: 50 }); K.ticks(world, V.x + 300, V.y - 336, 1, { s: 46, color: P.ink, lw: 6, p: clamp(t1) }); world.restore();
    }
    if (Math.abs(cam.x - RX.x) < 1500 / cam.z) K.phone(world, RX.x, RX.y, RX.s, (g) => recvScreen(g, t), { rimRgb: R.blue, rimA: 0.45 });
    const t2 = K.sp(t, T.l2[1], 0.45, 0.55) * (1 - prog(t, C.tapi.start - 0.3, C.tapi.start));
    if (t2 > 0) { world.save(); K.rise(world, RX.x + 270, RX.y - 560, t2); K.glass(world, RX.x + 150, RX.y - 610, 240, 100, { r: 50 }); K.ticks(world, RX.x + 210, RX.y - 566, 2, { s: 46, color: P.ink, lw: 6, p: clamp(t2) }); world.restore(); }
    const op = t - T.open;
    if (op > 0 && op < 1.2) { const [ox, oy] = toW(RX, 130, 492); K.glow(world, ox, oy, 300 * ease.outCubic(op / 1.2), R.cyan, 0.7 * (1 - op / 1.2)); K.sparks(world, ox, oy, op, { rgb: R.cyan, seed: 9, n: 36 }); }
    if (t > C.akhir.start - 0.2) {
      const lp = clamp((t - C.akhir.start) / 1.2);
      K.lightTrail(world, (u) => (u < 0.5 ? K.bez(PATH1, u * 2) : K.bez(PATH2, u * 2 - 1)), ease.inOutCubic(lp), { len: 1, rgb: R.violet, width: 18, glowR: 140, head: lp < 1 });
    }
  }
  heroCard(world, t);
  numbers(world, t);
  overlays(t);
  fx.setTransform(1, 0, 0, 1, 0, 0);
  for (const tt of [C.tapi.start - 0.1, C.akhir.start - 0.1]) {
    const d = t - tt;
    if (d > 0 && d < 0.35) { fx.globalAlpha = 0.18 * (1 - d / 0.35); fx.drawImage(K.glowSprite(R.violet, 0.9), -540, -200, 2160, 2320); fx.globalAlpha = 1; }
  }
  K.finish(fx, t, AM);
  const f = clamp((t - (AM.duration - 0.4)) / 0.4);
  if (f > 0) { fx.fillStyle = `rgba(6,7,12,${f * 0.9})`; fx.fillRect(0, 0, 1080, 1920); }
  for (const c of [world, ui]) c.setTransform(1, 0, 0, 1, 0, 0);
}
