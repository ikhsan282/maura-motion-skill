// Taruhan Kuda Berlari Eadweard Muybridge 1878 — 8-scene flipbook history (flipbook)
import * as K from '/styles/flipbook/kit.js';
const { clamp, lerp, ease, hrand } = AM.lib;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1470, size: 62 } };

let ctx, fx;
const C = {};
const BOOK = { x: 540, y: 800, s: 1 };

function drawHorseGallop(g, k, { seed = 1, u = 1 } = {}) {
  const ph = ((k % 12) / 12) * Math.PI * 2;
  const airborne = (k % 12) === 2 || (k % 12) === 3;
  const cx = 310, cy = 480 - (airborne ? 36 : Math.sin(ph) * 18);

  // Ground line
  g.beginPath();
  K.inkPath(g, [[40, 680], [580, 680]], { seed, amp: 2 });
  K.inkStroke(g, 3.8);

  // Horse torso & neck/head in ballpoint
  const bodyPts = [
    [cx - 110, cy + 10], [cx - 90, cy - 35], [cx + 75, cy - 38],
    [cx + 135, cy - 115], [cx + 185, cy - 95], [cx + 165, cy - 65],
    [cx + 115, cy - 55], [cx + 95, cy + 25], [cx - 95, cy + 28], [cx - 110, cy + 10]
  ];
  g.beginPath();
  const tip = K.inkPath(g, bodyPts, { u, seed: seed + 1, amp: 1.8 });
  K.inkStroke(g, 4.5, K.PAL.ink);

  // Tail
  g.beginPath();
  K.inkPath(g, [[cx - 105, cy - 20], [cx - 175, cy - 5 + Math.sin(ph) * 20], [cx - 205, cy + 25]], { u, seed: seed + 2, amp: 2 });
  K.inkStroke(g, 4.2, K.PAL.ink);

  // 4 Galloping legs (tucked under belly when airborne!)
  const legAngles = airborne
    ? [[-0.6, 1.3], [-0.3, 1.2], [0.5, -1.2], [0.8, -1.1]]
    : [
      [Math.sin(ph) * 0.75, 0.4],
      [Math.sin(ph + 1.1) * 0.75, 0.35],
      [Math.sin(ph + 2.6) * 0.75, -0.35],
      [Math.sin(ph + 3.7) * 0.75, -0.4],
    ];
  const hips = [[cx - 80, cy + 20], [cx - 60, cy + 22], [cx + 65, cy + 20], [cx + 85, cy + 18]];
  for (let i = 0; i < 4; i++) {
    const [hx, hy] = hips[i];
    const [a1, a2] = legAngles[i];
    const kx = hx + Math.sin(a1) * 68, ky = hy + Math.cos(a1) * 68;
    const fx2 = kx + Math.sin(a1 + a2) * 64, fy2 = ky + Math.cos(a1 + a2) * 64;
    g.beginPath();
    K.inkPath(g, [[hx, hy], [kx, ky], [fx2, fy2]], { u, seed: seed + 10 + i, amp: 1.6 });
    K.inkStroke(g, 4.5, airborne ? K.PAL.red : K.PAL.ink);
  }

  // Jockey stickman on horseback
  K.inkStick(g, {
    x: cx + 10, y: cy + 5, s: 0.46, lean: 0.55, face: 'open',
    arms: [[1.2, 0.2], [1.0, 0.2]], legs: [[0.5, -1.1], [0.4, -1.0]]
  }, { seed: seed + 20, reveal: u });

  if (airborne) {
    K.inkText(g, 'MELAYANG!', 310, 165, { size: 68, u, col: K.PAL.red });
  } else {
    K.inkText(g, `KAMERA #${(k % 12) + 1}`, 310, 165, { size: 54, u, col: K.PAL.ink });
  }
  return tip;
}

const painter = (g, i) => {
  if (i === 200) {
    drawHorseGallop(g, 2, { seed: 200, u: 1 });
    K.inkText(g, 'TAMAT · 1878', 310, 760, { size: 76 });
    return;
  }
  drawHorseGallop(g, i, { seed: i + 1, u: 1 });
};
painter.__key = 'muybridge-horse';

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('page_flip', 0.0, { gain: 0.45 });
  if (C.jepret) AM.sfx('pencil', C.jepret.start + 0.15, { gain: 0.35 });
  if (C.bukti) AM.sfx('stamp', C.bukti.start + 0.5, { gain: 0.45 });
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
  if (id === 'bukti') { camX = 540; camY = 780; camZ = 1.24; }
  else if (id === 'bioskop' || id === 'outro') { camX = 640; camY = 950; camZ = 0.92; }
  K.cam(ctx, camX + Math.sin(t * 0.6) * 6, camY, camZ);
  K.desk(ctx);

  // Desk eraser prop
  ctx.save(); ctx.translate(180, 1380); ctx.rotate(-0.3);
  ctx.fillStyle = 'rgba(30,15,5,0.25)'; ctx.fillRect(8, 10, 110, 50);
  ctx.fillStyle = '#efe6d0'; ctx.fillRect(0, 0, 110, 50); ctx.restore();

  // Film strip from putar..outro
  if (t >= C.putar.start) {
    const sl = 1 - ease.outCubic(clamp((t - C.putar.start) / 0.7));
    K.filmStrip(ctx, 980 + sl * 500, 320, {
      w: 290, fh: 240, n: 5, offset: (t - C.putar.start) * 240 * 6, from: 0,
      frame: (g, k, w, h) => {
        g.fillStyle = '#efe9d8'; g.fillRect(0, 0, w, h);
        g.save(); g.scale(w / 620, h / 500); g.translate(0, -220); g.lineCap = 'round';
        drawHorseGallop(g, k, { seed: k + 50, u: 1 });
        g.restore();
      }
    });
  }

  let top = 0, flip = null, lift = 0, live = null, ghost = null, penTip = null;
  if (id === 'bukti') {
    // Freeze on Frame #3 where all 4 hooves are airborne, drawing it live with onion skin of Frame #2
    ghost = 1;
    live = (g) => {
      penTip = drawHorseGallop(g, 2, { seed: 99, u: clamp(u * 1.25) });
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

  if (t >= C.taruhan.start) {
    const p = ease.outCubic(clamp((t - C.taruhan.start) / 0.65));
    K.patentCard(ctx, lerp(1450, 580, p), lerp(1680, 1330, p), {
      rot: -0.05, title: 'MUYBRIDGE', sub: 'Zoopraxiscope · Palo Alto', year: '1878',
      stamp: clamp((t - (C.taruhan.start + 0.7)) / 0.3), s: 1.02
    });
  }

  AM.lib.vignette(fx, { strength: 0.4, inner: 0.45, color: '30,15,5' });
  AM.lib.grain(fx, t, { amount: 0.03, fps: 12 });
}
