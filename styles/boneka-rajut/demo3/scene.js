// boneka-rajut demo3 â€” Balap Lari Kelinci Sombong dan Kura-kura (10 shots)
// Stop-motion knitted amigurumi & stitched felt diorama fable:
// Boastful knitted Rabbit races patient knitted Turtle, officiated by Monkey & cheered by Kancil!
import * as K from '/styles/boneka-rajut/kit.js';

const { PAL } = K;
const { ease, clamp, lerp } = AM.lib;

export const meta = {
  fps: 24,
  hold: 1,
  captions: { preset: 'storybook', y: 1620, size: 58 },
};

let farHill, midHill, nearHill, ground;
let L = [], C = {}, T = {};
let ctx;

export async function setup(AM) {
  ctx = AM.layer('world');
  farHill = K.hillLayer('rb-far', { y0: 0, amp: 85, color: PAL.hillFar, seed: 10, stitch: '#cde4b0', trees: 10 });
  midHill = K.hillLayer('rb-mid', { y0: 0, amp: 60, color: PAL.hillMid, seed: 11, stitch: '#def0b8', flowers: 18 });
  nearHill = K.hillLayer('rb-near', { y0: 0, amp: 34, color: PAL.hillNear, seed: 12, stitch: '#e9f6c5', flowers: 22 });
  ground = K.hillLayer('rb-gnd', { y0: 0, amp: 24, color: PAL.grass, seed: 14, stitch: '#eff9d0', flowers: 26 });

  L = (AM.timeline && AM.timeline.lines) || [];
  C = Object.fromEntries(L.map(l => [l.id, l]));
  const wt = (id, w, fb = 0.2) => {
    const t = AM.wordTime(id, w);
    const l = C[id];
    return Number.isFinite(t) ? t : (l ? l.start + fb : fb);
  };
  T = {
    kelinci: wt('sombong', 'Kelinci', 0.14),
    cepat: wt('sombong', 'cepat', 0.55),
    kura: wt('sombong', 'Kura-kura', 0.9),
    tantang: wt('tantang', 'menantang', 0.6),
    apel: wt('tantang', 'apel', 1.4),
    wasit: wt('mulai', 'wasit', 0.3),
    melesat: wt('mulai', 'melesat', 1.2),
    tenang: wt('pelan', 'tenang', 0.9),
    lurus: wt('pelan', 'lurus', 1.6),
    menoleh: wt('wortel', 'menoleh', 0.35),
    berhenti: wt('wortel', 'berhenti', 1.2),
    wortel: wt('wortel', 'wortel', 1.6),
    tertidur: wt('tidur', 'tertidur', 1.5),
    menyusul: wt('lewat', 'menyusul', 1.2),
    terkejut: wt('kaget', 'terkejut', 0.7),
    menembus: wt('menang', 'menembus', 1.2),
    maaf: wt('hikmah', 'maaf', 0.8),
    ketekunan: wt('hikmah', 'Ketekunan', 1.4),
  };
}

function backdrop(ctx, c, t, { sunset = 0 } = {}) {
  K.sky(ctx, { sunset });
  K.cam(ctx, c, 0.15);
  K.sun(ctx, 840 - sunset * 280, 250 + sunset * 150, { s: 0.9, t, color: sunset > 0.35 ? '#f29b38' : PAL.sun });
  K.cloud(ctx, 220 + ((t * 15) % 1400) - 200, 310, { s: 0.95, seed: 0 });
  K.cloud(ctx, 780 + ((t * 9) % 1400) - 200, 400, { s: 0.8, seed: 1 });
  K.cam(ctx, c, 0.35); K.drawLayer(ctx, farHill, 680);
  K.cam(ctx, c, 0.6); K.drawLayer(ctx, midHill, 830);
  K.cam(ctx, c, 0.85); K.drawLayer(ctx, nearHill, 1020);
  K.cam(ctx, c, 1); K.drawLayer(ctx, ground, 1210);
  K.runStitch(ctx, (g) => { g.beginPath(); g.moveTo(-600, 1265); g.lineTo(1800, 1265); }, { color: '#e8d3ad', len: 22, gap: 14, w: 5 });
  K.runStitch(ctx, (g) => { g.beginPath(); g.moveTo(-600, 1385); g.lineTo(1800, 1385); }, { color: '#e8d3ad', len: 22, gap: 14, w: 5 });
}

export function render(t, AM) {
  const appear = (t, t0, d = 0.35) => clamp((t - t0) / d);
  const pulse = (t, t0, d = 0.25) => (t >= t0 && t <= t0 + d ? Math.sin(((t - t0) / d) * Math.PI) : 0);
  const Hold = (t, t0, t1, f = 0.3) => Math.min(clamp((t - t0) / f), clamp((t1 - t) / f));

  let b = 0;
  for (let i = 0; i < L.length; i++) {
    if (t >= L[i].start) b = i;
  }
  const line = L[b] || { start: 0, end: Math.max(t + 1, 1) };
  const u = clamp((t - line.start) / Math.max(0.001, line.end - line.start));
  const tQuant = Math.floor(t * 12) / 12;

  let flash = 0;
  for (let i = 1; i < L.length; i++) flash = Math.max(flash, pulse(t, L[i].start, 0.22) * 0.3);

  // ================================================================
  // SHOT 0 â€” Boastful Rabbit hops circles around patient Turtle
  // ================================================================
  if (b === 0) {
    const c = { x: 540, y: 1020, z: lerp(1.02, 1.1, ease.inOutCubic(u)), rot: 0 };
    backdrop(ctx, c, t);

    const tx = lerp(220, 310, u);
    K.contactShadow(ctx, tx, 1335, 160, 0.5);
    K.turtle(ctx, {
      x: tx, y: 1335, s: 0.86, t: tQuant, face: 1,
      walk: 5, look: 0.3, mood: 'smile',
    });

    const rx = 740 + Math.sin(t * 5) * 45;
    const rHop = Math.abs(Math.sin(t * 7)) * 55;
    K.contactShadow(ctx, rx, 1325, 115, 0.5 * (1 - rHop / 180));
    const rb = K.rabbit(ctx, {
      x: rx, y: 1325, s: 0.9, t: tQuant, face: -1, hop: rHop,
      walk: 14, look: 0.35, mood: 'grin', brows: 'sly', talk: 1,
      armL: 1.5, armR: 0.8,
    });

    K.signpost(ctx, 'SI KELINCI', 880, 1250, { s: 0.85, pop: appear(t, T.kelinci, 0.35), t });
    K.signpost(ctx, 'SI KURA-KURA', 180, 1250, { s: 0.85, pop: appear(t, T.kura, 0.35), t });

    const pCepat = appear(t, T.cepat, 0.35);
    if (pCepat > 0) {
      K.patch(ctx, 'AKU PALING CEPAT!', rb.head[0] - 40, rb.top[1] - 55, { size: 38, fill: PAL.sun, ink: PAL.ink, s: pCepat });
    }

    K.cam(ctx, { x: 540, y: 960, z: 1 }, 0);
    K.banner(ctx, 'KELINCI & KURA-KURA', 540, 165, { t, size: 56, alpha: Hold(t, 0.1, line.end - 0.2, 0.35) });
  }

  // ================================================================
  // SHOT 1 â€” Turtle calmly challenges Rabbit to race to the distant apple tree
  // ================================================================
  else if (b === 1) {
    const c = { x: lerp(420, 540, ease.inOutCubic(u)), y: 1040, z: 1.18, rot: -0.01 };
    backdrop(ctx, c, t);

    K.appleTree(ctx, 980, 1020, { s: 0.62, t, apples: 6 });

    K.contactShadow(ctx, 320, 1335, 165, 0.5);
    const tk = K.turtle(ctx, {
      x: 320, y: 1335, s: 0.94, t: tQuant, face: 1,
      neck: 0.45, look: 0.35, mood: 'smile', talk: 1,
    });

    K.contactShadow(ctx, 700, 1325, 115, 0.5);
    K.rabbit(ctx, {
      x: 700, y: 1325, s: 0.9, t: tQuant, face: -1,
      look: 0.3, mood: 'sly', brows: 'sly', armL: 0.9, armR: 0.9,
    });

    const pTantang = appear(t, T.tantang, 0.35);
    if (pTantang > 0) {
      K.patch(ctx, 'AYO ADU LARI!', tk.head[0] + 10, tk.top[1] - 55, { size: 42, fill: PAL.cream, ink: PAL.ink, s: pTantang });
    }

    const pApel = appear(t, T.apel, 0.35);
    if (pApel > 0) {
      K.patch(ctx, 'GARIS AKHIR: POHON APEL', 830, 680, { size: 34, fill: PAL.red, ink: PAL.white, s: pApel });
    }
  }

  // ================================================================
  // SHOT 2 â€” Monkey referee waves the start flag; Rabbit rockets off!
  // ================================================================
  else if (b === 2) {
    const c = { x: 540, y: 1030, z: 1.06, rot: 0 };
    backdrop(ctx, c, t);

    K.signpost(ctx, 'GARIS AWAL', 360, 1240, { s: 0.9, pop: 1, t });

    K.contactShadow(ctx, 510, 1230, 110, 0.45);
    const mk = K.monkey(ctx, {
      x: 510, y: 1230, s: 0.78, t: tQuant,
      look: 0.2, mood: 'grin', talk: t < T.melesat ? 1 : 0,
      armL: 0.4, armR: t >= T.melesat - 0.15 ? 0.5 : 2.5,
    });

    const dashU = ease.inCubic(clamp((t - (T.melesat - 0.1)) / 0.85));
    const rx = lerp(310, 1280, dashU);
    const rHop = dashU > 0 && dashU < 1 ? Math.abs(Math.sin(t * 18)) * 75 : 0;

    const tx = lerp(210, 340, clamp((t - (T.melesat - 0.1)) / 1.8));
    K.contactShadow(ctx, tx, 1355, 155, 0.5);
    K.turtle(ctx, { x: tx, y: 1355, s: 0.84, t: tQuant, face: 1, walk: t >= T.melesat ? 7 : 0, mood: 'smile' });

    K.contactShadow(ctx, rx, 1310, 110, 0.45);
    K.rabbit(ctx, {
      x: rx, y: 1310, s: 0.88, t: tQuant, face: 1, hop: rHop,
      walk: dashU > 0 ? 22 : 0, tilt: dashU > 0 ? 0.22 : 0, earDroop: dashU > 0 ? -0.4 : 0,
      look: 0.4, mood: 'grin', armL: 1.4, armR: 1.4,
    });

    if (dashU > 0.05) {
      for (let k = 0; k < 4; k++) {
        const px = 340 + k * 140;
        const pa = clamp(1 - Math.abs(dashU - (0.15 + k * 0.18)) * 3.5);
        if (pa > 0) K.cloud(ctx, px, 1290, { s: 0.38 * pa, seed: k, alpha: pa });
      }
    }

    const pWasit = appear(t, T.wasit, 0.35);
    if (pWasit > 0) {
      K.patch(ctx, 'SATU... DUA... MULAI!', mk.head[0], mk.top[1] - 55, { size: 38, fill: PAL.sun, ink: PAL.ink, s: pWasit });
    }
    const pMel = appear(t, T.melesat, 0.3);
    if (pMel > 0) {
      K.patch(ctx, 'WUZZZ! MELESAT!', 760, 960, { size: 44, fill: PAL.red, ink: PAL.white, s: pMel });
    }
  }

  // ================================================================
  // SHOT 3 â€” Tracking close-up of Turtle stepping steadily with focus
  // ================================================================
  else if (b === 3) {
    const c = { x: lerp(420, 560, u), y: 1120, z: 1.28, rot: 0 };
    backdrop(ctx, c, t);

    const tx = lerp(340, 560, u);
    K.contactShadow(ctx, tx, 1335, 165, 0.5);
    const tk = K.turtle(ctx, {
      x: tx, y: 1335, s: 0.96, t: tQuant, face: 1,
      walk: 8, neck: 0.35, look: 0.4, mood: 'smile',
    });

    const pTen = appear(t, T.tenang, 0.35);
    if (pTen > 0) {
      K.patch(ctx, 'SABAR & TENANG', tk.head[0] - 40, tk.top[1] - 55, { size: 40, fill: PAL.cream, ink: PAL.ink, s: pTen });
    }
    const pLur = appear(t, T.lurus, 0.35);
    if (pLur > 0) {
      K.star(ctx, tk.head[0] + 95, tk.head[1] - 60, 0.92 * pLur, { rot: t });
      K.patch(ctx, 'FOKUS KE GARIS AKHIR!', tk.head[0] - 10, tk.top[1] - 140, { size: 36, fill: PAL.sun, ink: PAL.ink, s: pLur });
    }
  }

  // ================================================================
  // SHOT 4 â€” Halfway along, Rabbit looks back, sees nobody, and munches a knitted carrot
  // ================================================================
  else if (b === 4) {
    const c = { x: 540, y: 1040, z: lerp(1.12, 1.22, ease.inOutCubic(u)), rot: 0 };
    backdrop(ctx, c, t);

    K.appleTree(ctx, 790, 1230, { s: 0.85, t, apples: 0 });

    const eating = t >= T.berhenti;
    K.contactShadow(ctx, 560, 1320, 115, 0.5);
    const rb = K.rabbit(ctx, {
      x: 560, y: 1320, s: 0.94, t: tQuant,
      face: eating ? 1 : -1,
      look: 0.35, mood: eating ? 'chew' : 'sly', brows: 'sly',
      armL: eating ? 1.35 : 0.4, armR: eating ? 1.35 : 1.6,
    });

    const pWortel = appear(t, T.wortel - 0.2, 0.35);
    if (pWortel > 0) {
      K.carrot(ctx, rb.handR[0] + 15, rb.handR[1] - 10, { rot: -0.5 + Math.sin(t * 10) * 0.1, s: 1.05 * pWortel });
      K.patch(ctx, 'MAKAN WORTEL DULU AH~', 540, 860, { size: 40, fill: PAL.cream, ink: PAL.ink, s: pWortel });
    } else {
      const pNoleh = appear(t, T.menoleh, 0.35);
      K.patch(ctx, 'KURA-KURA MASIH JAUH!', 440, 880, { size: 38, fill: PAL.sun, ink: PAL.ink, s: pNoleh });
    }
  }

  // ================================================================
  // SHOT 5 â€” Full-bellied Rabbit falls fast asleep under the shady tree ("Zzz...")
  // ================================================================
  else if (b === 5) {
    const c = { x: 600, y: 1060, z: lerp(1.18, 1.28, ease.inOutCubic(u)), rot: 0.015 };
    backdrop(ctx, c, t);

    K.appleTree(ctx, 740, 1230, { s: 0.92, t, apples: 0 });

    K.contactShadow(ctx, 640, 1330, 125, 0.5);
    const rb = K.rabbit(ctx, {
      x: 640, y: 1330, s: 0.94, t: tQuant, face: -1,
      tilt: 0.18, headTilt: 0.22, earDroop: 0.65, wob: 0.3,
      look: -0.1, eyes: 'closed', mood: 'o', blush: 0.7,
      armL: 0.2, armR: 0.2,
    });

    K.carrot(ctx, 480, 1355, { rot: 1.35, s: 0.75 });

    const pTidur = appear(t, T.tertidur - 0.3, 0.4);
    if (pTidur > 0) {
      const zFloat = (t * 0.8) % 1;
      K.patch(ctx, 'Zzz...', rb.head[0] - 80, rb.top[1] - 30 - zFloat * 50, { size: 44, fill: PAL.cream, ink: PAL.ink, s: pTidur });
      K.patch(ctx, 'TERTIDUR PULAS!', 460, 880, { size: 40, fill: PAL.sun, ink: PAL.ink, s: pTidur });
    }
  }

  // ================================================================
  // SHOT 6 â€” Afternoon sun: Turtle marches right past the snoring Rabbit!
  // ================================================================
  else if (b === 6) {
    const c = { x: lerp(480, 620, ease.inOutCubic(u)), y: 1020, z: 1.08, rot: 0 };
    backdrop(ctx, c, t, { sunset: lerp(0.1, 0.45, u) });

    K.appleTree(ctx, 620, 1220, { s: 0.88, t, apples: 0 });

    K.contactShadow(ctx, 540, 1255, 115, 0.45);
    const rb = K.rabbit(ctx, {
      x: 540, y: 1255, s: 0.84, t: tQuant, face: -1,
      tilt: 0.2, headTilt: 0.22, earDroop: 0.7, wob: 0.25,
      eyes: 'closed', mood: 'o',
    });
    K.patch(ctx, 'Zzz', rb.head[0] - 60, rb.top[1] - 35, { size: 34, fill: PAL.cream, ink: PAL.ink });

    const tx = lerp(180, 880, ease.inOutCubic(u));
    K.contactShadow(ctx, tx, 1365, 165, 0.5);
    const tk = K.turtle(ctx, {
      x: tx, y: 1365, s: 0.9, t: tQuant, face: 1,
      walk: 9, neck: 0.4, look: 0.35, mood: 'smile',
    });

    const pLewat = appear(t, T.menyusul, 0.35);
    if (pLewat > 0) {
      K.star(ctx, tk.head[0], tk.top[1] - 40, 1 * pLewat, { rot: t });
      K.patch(ctx, 'MENYUSUL TANPA HENTI!', 540, 760, { size: 44, fill: PAL.red, ink: PAL.white, s: pLewat });
    }
  }

  // ================================================================
  // SHOT 7 â€” Rabbit wakes up in shock seeing Turtle right at the finish line!
  // ================================================================
  else if (b === 7) {
    const c = { x: lerp(420, 560, ease.inOutCubic(u)), y: 1030, z: 1.12, rot: -0.015 };
    backdrop(ctx, c, t, { sunset: 0.55 });

    K.appleTree(ctx, 940, 1210, { s: 0.85, t, apples: 6 });
    K.signpost(ctx, 'GARIS AKHIR', 820, 1250, { s: 0.85, pop: 1, t });

    const tx = lerp(710, 790, u);
    K.contactShadow(ctx, tx, 1340, 155, 0.5);
    K.turtle(ctx, { x: tx, y: 1340, s: 0.84, t: tQuant, face: 1, walk: 8, neck: 0.45, mood: 'grin' });

    const shockHop = pulse(t, T.terkejut, 0.5) * 85;
    K.contactShadow(ctx, 260, 1330, 115, 0.5);
    const rb = K.rabbit(ctx, {
      x: 260, y: 1330, s: 0.94, t: tQuant, face: 1, hop: shockHop,
      look: 0.45, eyes: 'wide', brows: 'up', mood: 'ouch',
      armL: 2.2, armR: 2.2, earDroop: -0.35,
    });

    const pKaget = appear(t, T.terkejut, 0.3);
    if (pKaget > 0) {
      K.drop(ctx, rb.head[0] - 75, rb.head[1] - 40, 0.92 * pKaget);
      K.drop(ctx, rb.head[0] + 75, rb.head[1] - 40, 0.92 * pKaget);
      K.patch(ctx, 'HAH?! SUDAH HAMPIR SAMPAI!', rb.head[0] + 110, rb.top[1] - 60, { size: 38, fill: PAL.sun, ink: PAL.ink, s: pKaget });
    }
  }

  // ================================================================
  // SHOT 8 â€” Turtle crosses the finish line first! Monkey & Kancil cheer!
  // ================================================================
  else if (b === 8) {
    const c = { x: 600, y: 1020, z: lerp(1.06, 1.15, ease.inOutCubic(u)), rot: 0 };
    backdrop(ctx, c, t, { sunset: 0.7 });

    K.appleTree(ctx, 940, 1200, { s: 0.9, t, apples: 6 });
    K.signpost(ctx, 'GARIS AKHIR', 680, 1230, { s: 0.9, pop: 1, t });

    const cheerHop = Math.abs(Math.sin(t * 7)) * 35;
    K.contactShadow(ctx, 820, 1250, 105, 0.45);
    K.monkey(ctx, { x: 820, y: 1250, s: 0.76, t: tQuant, hop: cheerHop, mood: 'grin', eyes: 'happy', armL: 2.3, armR: 2.3 });
    K.contactShadow(ctx, 960, 1280, 105, 0.45);
    K.kancil(ctx, { x: 960, y: 1280, s: 0.78, t: tQuant, face: -1, hop: cheerHop * 0.8, mood: 'grin', eyes: 'happy', armL: 2.1, armR: 2.1 });

    const winHop = t >= T.menembus ? Math.abs(Math.sin(t * 6)) * 28 : 0;
    const tx = lerp(610, 720, ease.outCubic(clamp(u * 1.3)));
    K.contactShadow(ctx, tx, 1350, 165, 0.5);
    const tk = K.turtle(ctx, {
      x: tx, y: 1350, s: 0.92, t: tQuant, face: 1, hop: winHop,
      walk: t < T.menembus ? 9 : 0, neck: 0.5, mood: 'grin', eyes: 'happy', blush: 1,
    });

    const rx = lerp(140, 420, ease.outCubic(clamp(u * 1.2)));
    K.contactShadow(ctx, rx, 1340, 115, 0.5);
    const rb = K.rabbit(ctx, {
      x: rx, y: 1340, s: 0.88, t: tQuant, face: 1,
      walk: u < 0.75 ? 18 : 0, tilt: 0.25, earDroop: 0.5,
      mood: 'frown', brows: 'sad',
    });
    K.drop(ctx, rb.head[0] - 50, rb.head[1] - 20, 0.83);

    const pWin = appear(t, T.menembus, 0.35);
    if (pWin > 0) {
      K.star(ctx, tk.head[0] - 40, tk.top[1] - 55, 1.08 * pWin, { rot: t });
      K.heart(ctx, tk.head[0] + 60, tk.top[1] - 65, 1 * pWin, { rot: 0.2 });
      K.patch(ctx, 'PEMENANG: SI KURA-KURA!', 580, 740, { size: 46, fill: PAL.sun, ink: PAL.ink, s: pWin });
    }
  }

  // ================================================================
  // SHOT 9 â€” Sunset moral finale: Rabbit apologizes, Turtle shares friendship, Moral banner
  // ================================================================
  else {
    const c = { x: 540, y: 1020, z: lerp(1.12, 1.0, ease.inOutCubic(u)), rot: 0 };
    backdrop(ctx, c, t, { sunset: 0.9 });

    K.appleTree(ctx, 880, 1210, { s: 0.88, t, apples: 6 });

    K.contactShadow(ctx, 340, 1335, 115, 0.5);
    const rb = K.rabbit(ctx, {
      x: 340, y: 1335, s: 0.9, t: tQuant, face: 1,
      headTilt: 0.22, earDroop: 0.65, look: 0.3,
      mood: t >= T.ketekunan ? 'smile' : 'frown', brows: 'sad', blush: 0.9,
      armL: 0.4, armR: 1.1,
    });

    K.contactShadow(ctx, 680, 1345, 165, 0.5);
    K.turtle(ctx, {
      x: 680, y: 1345, s: 0.92, t: tQuant, face: -1,
      neck: 0.4, look: 0.35, mood: 'grin', eyes: 'happy', blush: 1,
    });

    const pMaaf = appear(t, T.maaf, 0.35);
    if (pMaaf > 0) {
      K.heart(ctx, 510, 1060, 1.08 * pMaaf, { rot: Math.sin(t * 2) * 0.1 });
      K.patch(ctx, 'MAAFKAN AKU YA...', rb.head[0] + 10, rb.top[1] - 45, { size: 36, fill: PAL.cream, ink: PAL.ink, s: pMaaf });
    }

    K.cam(ctx, { x: 540, y: 960, z: 1 }, 0);
    const pMoral = appear(t, T.ketekunan, 0.45);
    K.banner(ctx, 'KETEKUNAN MENGALAHKAN KESOMBONGAN', 540, 180, { t, size: 42, fill: PAL.red, ink: PAL.white, alpha: pMoral, s: ease.outBack(pMoral) });
    if (pMoral > 0.1) {
      K.patch(ctx, 'RAJIN & KONSISTEN PASTI SAMPAI', 540, 1520, { size: 42, fill: PAL.cream, ink: PAL.ink, s: pMoral });
    }
  }

  K.finish(ctx, t, { flash });
}
