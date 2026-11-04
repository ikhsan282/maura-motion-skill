// Rahasia 12 Prinsip Animasi — 8-scene flipbook explainer (flipbook)
import * as K from '/styles/flipbook/kit.js';
const { clamp, lerp, ease, prog, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1470, size: 62 } };

let ctx, fx;
const C = {};
const BOOK = { x: 540, y: 800, s: 1 };

const NCYC = 36;
function animPose(k) {
  k = ((k % NCYC) + NCYC) % NCYC;
  // 0..8: anticipation crouch; 9..22: parabolic jump arc with stretch; 23..29: landing squash; 30..35: recovery wave
  if (k < 9) {
    const f = k / 8;
    return {
      x: 160, y: 690 + f * 38, s: 0.76, lean: 0.28 * f, face: 'open', look: 0.6,
      legs: [[1.15 * f, -1.9 * f], [0.9 * f, -1.7 * f]],
      arms: [[-0.8 * f, -0.4], [-1.0 * f, -0.3]]
    };
  }
  if (k < 23) {
    const u = (k - 9) / 13;
    const arcY = Math.sin(u * Math.PI) * 280;
    return {
      x: lerp(160, 460, u), y: 690 - arcY, s: 0.76, lean: (0.5 - u) * 0.45, face: 'wow', look: 0.5, cape: 0.6,
      legs: [[0.25, 0.5], [-0.25, 0.7]],
      arms: [[2.7, 0.15], [2.4, 0.2]]
    };
  }
  if (k < 30) {
    const f = Math.sin(((k - 23) / 6) * Math.PI);
    return {
      x: 460, y: 690 + f * 34, s: 0.76, lean: 0.15 * f, face: 'happy', look: 0.3,
      legs: [[1.0 * f, -1.7 * f], [-0.8 * f, -1.5 * f]],
      arms: [[1.4, 0.2], [-1.4, -0.2]]
    };
  }
  const wv = Math.sin((k - 30) * 1.4) * 0.35;
  return {
    x: 460, y: 690, s: 0.76, lean: 0, face: 'happy', look: 0,
    legs: [[0.15, 0], [-0.15, 0]],
    arms: [[2.5 + wv, 0.2], [-0.3, -0.2]]
  };
}

function drawArcDots(g, upto = 1, seed = 1) {
  const n = Math.floor(14 * upto);
  for (let i = 0; i <= n; i++) {
    const u = i / 14;
    const px = lerp(160, 460, u), py = 540 - Math.sin(u * Math.PI) * 260;
    g.beginPath();
    K.inkPath(g, [[px - 5, py], [px + 5, py]], { seed: seed + i, amp: 1 });
    K.inkStroke(g, 4, K.PAL.red, 0.75);
  }
}

function drawBouncingBall(g, k, seed) {
  const u = (k % 18) / 18;
  const arch = Math.abs(Math.sin(u * Math.PI));
  const bx = 310, by = 665 - arch * 360;
  const squash = arch < 0.15 ? 1.45 : arch > 0.7 ? 0.85 : 1.0;
  const rx = 44 * squash, ry = 44 / squash;
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    pts.push([bx + Math.cos(a) * rx, by - ry + Math.sin(a) * ry]);
  }
  g.beginPath();
  K.inkPath(g, pts, { seed, amp: 1.5 });
  K.inkStroke(g, 4.2, K.PAL.ink);
}

const painter = (g, i) => {
  g.beginPath(); K.inkPath(g, [[40, 700], [580, 700]], { seed: i, amp: 2 }); K.inkStroke(g, 3.6);
  if (i === 200) {
    drawArcDots(g, 1, i);
    K.inkStick(g, animPose(33), { seed: i });
    K.inkText(g, 'TAMAT', 310, 160, { size: 120 });
    return;
  }
  if (i >= 100 && i < 150) {
    // Ball squash & stretch pages
    drawBouncingBall(g, i - 100, i);
    K.inkText(g, (i - 100) % 18 < 3 ? 'SQUASH!' : 'STRETCH!', 310, 170, { size: 70, col: K.PAL.red });
    return;
  }
  drawArcDots(g, 1, i);
  K.inkStick(g, animPose(i), { seed: i });
};
painter.__key = 'principles-12';

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('page_flip', 0.0, { gain: 0.45 });
  if (C.onion) AM.sfx('pencil', C.onion.start + 0.15, { gain: 0.35 });
  if (C.disney) AM.sfx('stamp', C.disney.start + 0.8, { gain: 0.45 });
  if (C.outro) AM.sfx('ding', C.outro.end - 0.3, { gain: 0.35 });
}

export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  const lines = AM.timeline.lines;
  let active = lines[0];
  for (const ln of lines) {
    if (t >= ln.start && t <= ln.end + 0.35) { active = ln; break; }
    if (t > ln.end) active = ln;
  }
  const dur = Math.max(0.1, active.end - active.start);
  const u = clamp((t - active.start) / dur, 0, 1);
  const id = active.id;

  let camX = 540, camY = 820, camZ = 1.04;
  if (id === 'onion' || id === 'spacing') { camX = 540; camY = 790; camZ = 1.22; }
  else if (id === 'disney' || id === 'outro') { camX = 640; camY = 950; camZ = 0.92; }
  K.cam(ctx, camX + Math.sin(t * 0.6) * 6, camY, camZ);
  K.desk(ctx);

  // Desk props
  ctx.save(); ctx.translate(180, 1380); ctx.rotate(-0.3);
  ctx.fillStyle = 'rgba(30,15,5,0.25)'; ctx.fillRect(8, 10, 110, 50);
  ctx.fillStyle = '#efe6d0'; ctx.fillRect(0, 0, 110, 50); ctx.restore();

  // Film strip on the right during spacing..outro
  if (t >= C.spacing.start) {
    const sl = 1 - ease.outCubic(clamp((t - C.spacing.start) / 0.7));
    K.filmStrip(ctx, 980 + sl * 500, 320, {
      w: 290, fh: 240, n: 5, offset: (t - C.spacing.start) * 240 * 5, from: 0,
      frame: (g, k, w, h) => {
        g.fillStyle = '#efe9d8'; g.fillRect(0, 0, w, h);
        g.save(); g.scale(w / 620, h / 450); g.translate(0, -300); g.lineCap = 'round';
        g.beginPath(); K.inkPath(g, [[40, 700], [560, 700]], { seed: k, amp: 2 }); K.inkStroke(g, 5);
        K.inkStick(g, animPose(k), { seed: k, w: 1.3 }); g.restore();
      }
    });
  }

  // Book state per scene
  let top = 0, flip = null, lift = 0, live = null, ghost = null, penTip = null;
  if (id === 'squash') {
    const k = 100 + Math.floor(t * 12) % 36;
    top = k + 1;
    flip = { page: k, f: 0.3 + hrand(k, 3) * 0.4 };
    lift = 1;
  } else if (id === 'antisipasi') {
    const k = Math.floor(u * 12);
    top = k + 1;
    flip = { page: k, f: 0.35 };
    lift = 0.8;
  } else if (id === 'onion') {
    ghost = 12;
    live = (g) => {
      g.beginPath(); K.inkPath(g, [[40, 700], [580, 700]], { seed: 77, amp: 2 }); K.inkStroke(g, 3.6);
      drawArcDots(g, u, 77);
      penTip = K.inkStick(g, animPose(14), { seed: 77, reveal: clamp(u * 1.15) });
      K.inkText(g, 'ONION SKIN', 310, 150, { size: 64, u: clamp(u * 1.3), col: K.PAL.red });
    };
  } else if (id === 'outro' && u > 0.78) {
    top = 200;
  } else {
    const k = Math.floor(t * 12);
    top = k + 1;
    flip = { page: k, f: 0.3 + hrand(k, 5) * 0.4 };
    lift = 1;
  }

  K.book(ctx, { x: BOOK.x, y: BOOK.y, s: BOOK.s, page: painter, top, flip, ghost, live, stack: 26 });
  K.leftHand(ctx, BOOK.x - 330, BOOK.y + 330, { s: 0.95, rot: 0.35 });
  K.rightThumb(ctx, BOOK.x + 300, BOOK.y + 420, { s: 0.95, lift: lift * (0.6 + 0.4 * Math.sin(t * 25)), rot: -0.55 });

  if (penTip) {
    const wx = BOOK.x - K.PAGE.w / 2 + penTip[0];
    const wy = BOOK.y - K.PAGE.h / 2 + penTip[1];
    K.pen(ctx, wx, wy, { lift: 0, ang: -1.05 });
  }

  if (t >= C.disney.start) {
    const p = ease.outCubic(clamp((t - C.disney.start) / 0.65));
    K.patentCard(ctx, lerp(1450, 580, p), lerp(1680, 1330, p), {
      rot: -0.05, title: '12 PRINSIP', sub: 'Ilusi Kehidupan Animasi', year: '1930',
      stamp: clamp((t - (C.disney.start + 0.7)) / 0.3), s: 1.02
    });
  }

  AM.lib.vignette(fx, { strength: 0.4, inner: 0.45, color: '30,15,5' });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}

