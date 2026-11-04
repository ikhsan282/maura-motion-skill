// Asal-Usul Nama Banyuwangi — layered cut-paper diorama (style: kertas-guntingan, demo3).
import * as K from '/styles/kertas-guntingan/kit.js';
const P = K.PAL, { clamp, lerp, ease, TAU } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', anim: 'rise', y: 1460, size: 64, maxWords: 4, box: { fill: 'rgba(251,246,234,.95)', pad: 18, radius: 6, border: '#2b2523', borderW: 3 } } };

let ctx, W;
const C = {};
const Shots = [];
const shot = (id, t0, fn) => Shots.push({ id, t0, fn });
const prog = (t, a, b) => clamp((t - a) / Math.max(0.001, b - a));
const eio = (t, a, b) => ease.inOutSine(prog(t, a, b));
const shake = (t, a) => ({ sx: K.noise.n2(t * 25, 1) * a, sy: K.noise.n2(t * 25, 9) * a });

let _bankL, _bankR, _aroma;
const bankL = () => (_bankL ||= K.piece('kg3-bankL', [
  { pts: [[-450, 960], [340, 1180], [420, 1460], [-450, 1460]], fill: P.earth, edge: 'torn', amp: 4, seed: 61, lift: 1.8 },
  { pts: [[-450, 930], [330, 1150], [350, 1210], [-450, 1010]], fill: P.grass, edge: 'torn', amp: 3.5, seed: 62, lift: 2.0 },
]));
const bankR = () => (_bankR ||= K.piece('kg3-bankR', [
  { pts: [[1530, 960], [740, 1180], [660, 1460], [1530, 1460]], fill: P.earthDk, edge: 'torn', amp: 4, seed: 63, lift: 1.8 },
  { pts: [[1530, 930], [750, 1150], [730, 1210], [1530, 1010]], fill: P.moss, edge: 'torn', amp: 3.5, seed: 64, lift: 2.0 },
]));
const aromaSwirl = () => (_aroma ||= K.piece('kg3-aroma', [
  { pts: [[-18, 40], [-28, -10], [-8, -55], [22, -95], [8, -140], [-14, -95], [-42, -45], [-36, 15]], fill: P.goldHi, edge: 'torn', amp: 2, seed: 68, lift: 1.2 },
]));

function riverBackdrop(t, a, Cm, { dusk = false, golden = false } = {}) {
  K.view(ctx, Cm, 0.15);
  if (dusk) K.sky(ctx, '#432d4a', '#c96f53', 'dusk3');
  else if (golden) K.sky(ctx, '#356b78', '#f2cf78', 'gold3');
  else K.sky(ctx, P.skyTop, P.skyBot, 'day3');

  K.view(ctx, Cm, 0.25);
  K.draw(ctx, K.sunPiece(120, dusk ? P.coral : P.sun), 810, dusk ? 470 : 330, { rot: t * 0.04, lift: 2 });
  for (let i = 0; i < 3; i++) {
    K.draw(ctx, K.cloudPiece(i + 2, 290 + i * 35, dusk ? '#e7b8a3' : P.white), 200 + i * 340 + Math.sin(t * 0.35 + i) * 30, 300 + (i % 2) * 85, { lift: 1.6 });
  }
  K.view(ctx, Cm, 0.45);
  K.draw(ctx, K.hillPiece(21, dusk ? '#35263d' : P.teal, { x0: -450, x1: 1550, top: 880, bot: 1620, amp: 140 }), 0, 0, { lift: 1.8 });
  K.view(ctx, Cm, 0.7);
  K.draw(ctx, K.hillPiece(22, dusk ? '#4e3529' : P.moss, { x0: -450, x1: 1550, top: 1050, bot: 1750, amp: 88 }), 0, 0, { lift: 2.0 });
}

// 1. HOOK — Fragrant turquoise river with floating paper lotus blossoms, cut-out title BANYUWANGI
shot('hook', () => 0, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: 540, y: lerp(960, 1020, p), z: lerp(0.95, 1.08, ease.inOutSine(p)) };
  riverBackdrop(t, a, Cm, { golden: true });
  K.view(ctx, Cm, 0.95);
  K.water(ctx, t, 540, 1180, { w: 1700, n: 4, gap: 68, amp: 20 });
  for (let i = 0; i < 5; i++) {
    const lx = 220 + i * 165 + Math.sin(t * 1.4 + i) * 28;
    const ly = 1230 + (i % 2) * 75 + Math.cos(t * 1.8 + i) * 10;
    K.draw(ctx, K.PROPS.lotus(), lx, ly, { s: 1.15, rot: Math.sin(t + i) * 0.12, lift: 1.4 });
    const sy = ((t * 95 + i * 70) % 260);
    K.draw(ctx, aromaSwirl(), lx, ly - 40 - sy, { s: 0.9, alpha: (1 - sy / 260) * 0.75 });
  }
  K.view(ctx, Cm, 1.05);
  K.draw(ctx, bankL(), 0, 0, { lift: 2.0 });
  K.draw(ctx, bankR(), 0, 0, { lift: 2.0 });
  K.draw(ctx, K.palmTree(2, 430), 160, 1160, { lift: 1.8 });
  K.draw(ctx, K.roundTree(3, 350, P.forest), 930, 1170, { lift: 1.8 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Ujung Timur Pulau Jawa', 540, 290, { size: 48, rot: -0.02, alpha: prog(t, a + 0.2, a + 0.6), tape: '#b7c8e8' });
  K.cutTitle(ctx, 'BANYU', 540, 440, t, a + 0.35, { size: 132, cols: [P.water, P.gold, P.white, P.coral] });
  K.cutTitle(ctx, 'WANGI', 540, 595, t, a + 0.65, { size: 132, cols: [P.gold, P.red, P.foam, P.moss] });
});

// 2. KSATRIA — Patih Sidapaksa and his pure-hearted wife Sri Tanjung at Kerajaan Sindurejo
shot('ksatria', () => C.ksatria.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: lerp(510, 560, p), y: 1030, z: lerp(0.96, 1.05, p) };
  riverBackdrop(t, a, Cm);
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, K.hillPiece(25, P.grass, { x0: -450, x1: 1550, top: 1255, bot: 1960, amp: 35 }), 0, 0, { lift: 2.2 });
  K.draw(ctx, K.rumahBolon(0.86), 540, 1285, { lift: 2.0 });
  K.draw(ctx, K.palmTree(4, 430), 160, 1285, { lift: 1.7 });
  K.draw(ctx, K.palmTree(5, 430), 920, 1285, { flip: -1, lift: 1.7 });

  const tSid = W('ksatria', 'Sidapaksa');
  const tSri = W('ksatria', 'Tanjung');
  K.puppet(ctx, 'sidapaksa', {
    x: 410, y: 1355, s: 0.98,
    P: K.pose({ upF: 0.75 + Math.sin(t * 2.5) * 0.08, foF: 0.95, face: { mouth: 'smile', brow: -0.1 } }),
  });
  const sriRig = K.puppet(ctx, 'sritanjung', {
    x: 670, y: 1355, s: 0.98, flip: -1,
    P: K.pose({ upF: 0.9 + Math.sin(t * 2.5 + 1) * 0.08, foF: 1.15, head: -0.05, face: { mouth: 'smile', brow: -0.15 } }),
  });
  K.prop(ctx, sriRig.handF, K.PROPS.lotus(), { x: 0, y: -12, rot: -0.2, lift: 1.4 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Patih Sidapaksa', 320, 720, { size: 48, rot: -0.04, alpha: prog(t, tSid - 0.2, tSid + 0.25), tape: '#b7c8e8' });
  K.tag(ctx, 'Sri Tanjung', 750, 720, { size: 48, rot: 0.04, alpha: prog(t, tSri - 0.3, tSri + 0.2), tape: '#f2d078' });
});

// 3. TUGAS — The jealous King sends Patih Sidapaksa away to the steep mountain peak
shot('tugas', () => C.tugas.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: lerp(480, 580, p), y: 1030, z: 1.04 };
  riverBackdrop(t, a, Cm);
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, K.hillPiece(26, P.grass, { x0: -450, x1: 1550, top: 1260, bot: 1960, amp: 38 }), 0, 0, { lift: 2.2 });
  K.draw(ctx, K.rumahBolon(0.82), 260, 1285, { lift: 1.9 });

  // King commanding on the left, pointing toward the far peaks
  K.puppet(ctx, 'raja', {
    x: 340, y: 1355, s: 1.02,
    P: K.pose({ lean: -0.06, upF: 1.55 + Math.sin(t * 4) * 0.08, foF: 0.25, face: { mouth: 'open', brow: 0.5 } }),
  });

  // Sidapaksa marching off toward the right mountains
  const tGunung = W('tugas', 'gunung');
  const walkP = prog(t, tGunung - 0.8, b);
  K.puppet(ctx, 'sidapaksa', {
    x: lerp(600, 920, walkP), y: 1355, s: 0.98,
    P: K.walk(t * 1.9, walkP > 0.05 ? 0.9 : 0, { upF: 0.6, foF: 0.9, face: { mouth: 'n', brow: 0.2 } }),
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Utusan ke Puncak Gunung', 580, 620, { size: 50, rot: 0.03, alpha: prog(t, tGunung - 0.3, tGunung + 0.2), tape: '#e6b88a' });
});

// 4. FITNAH — The King slanders Sri Tanjung to the returning Sidapaksa
shot('fitnah', () => C.fitnah.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const tFitnah = W('fitnah', 'fitnah');
  const Cm = { x: 540, y: lerp(1030, 990, p), z: lerp(1.04, 1.16, p) };
  riverBackdrop(t, a, Cm, { dusk: true });
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, K.hillPiece(27, P.earth, { x0: -450, x1: 1550, top: 1260, bot: 1960, amp: 35 }), 0, 0, { lift: 2.2 });

  // King whispering deceitfully
  const talk = Math.sin(t * 15) > 0;
  K.puppet(ctx, 'raja', {
    x: 370, y: 1355, s: 1.02,
    P: K.pose({ lean: 0.14, head: 0.08, upF: 1.15 + Math.sin(t * 5) * 0.1, foF: 1.25, face: { mouth: talk ? 'open' : 'smile', brow: 0.65 } }),
  });

  // Sidapaksa clenching his fists in rising anger
  const anger = prog(t, tFitnah - 0.3, b);
  K.puppet(ctx, 'sidapaksa', {
    x: 700, y: 1355, s: 1.0, flip: -1,
    P: K.pose({
      lean: anger * 0.1,
      head: -0.06,
      upF: lerp(0.4, 1.35, anger),
      foF: lerp(0.6, 1.5, anger),
      face: { mouth: anger > 0.5 ? 'shout' : 'n', brow: lerp(0.1, 0.85, anger) },
    }),
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Fitnah Keji Sang Raja!', 540, 580, { size: 54, rot: -0.03, alpha: prog(t, tFitnah - 0.25, tFitnah + 0.2), tape: '#e7a2a2' });
});

// 5. MURKA — Blinded by rage, Sidapaksa brings Sri Tanjung to the steep riverbank with his keris
shot('murka', () => C.murka.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const tKeris = W('murka', 'keris');
  const Cm = { x: 540, y: 1020, z: lerp(1.04, 1.14, p), ...shake(t, prog(t, tKeris - 0.2, b) * 6) };
  riverBackdrop(t, a, Cm, { dusk: true });
  K.view(ctx, Cm, 0.95);
  K.water(ctx, t, 540, 1210, { w: 1700, n: 4, gap: 68, amp: 22 });
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, bankL(), 0, 0, { lift: 2.0 });
  K.draw(ctx, bankR(), 0, 0, { lift: 2.0 });

  const drawKeris = prog(t, tKeris - 0.5, tKeris + 0.1);
  const sidRig = K.puppet(ctx, 'sidapaksa', {
    x: 240, y: 1175, s: 0.96,
    P: K.pose({
      lean: 0.12,
      upF: lerp(0.7, 1.95, drawKeris),
      foF: lerp(0.9, 0.45, drawKeris),
      face: { mouth: 'shout', brow: 0.85 },
    }),
  });
  K.prop(ctx, sidRig.handF, K.PROPS.keris(), { x: 0, y: 0, rot: -1.2, lift: 1.5 });

  K.puppet(ctx, 'sritanjung', {
    x: 800, y: 1175, s: 0.96, flip: -1,
    P: K.pose({ lean: -0.05, upF: 1.35, foF: 1.45, head: -0.08, face: { mouth: 'sad', brow: -0.7 } }),
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Amarah Tanpa Tabayyun', 540, 560, { size: 50, rot: 0.03, alpha: prog(t, a + 0.3, a + 0.7), tape: '#e7a2a2' });
});

// 6. SUMPAH — Sri Tanjung's solemn vow on the cliff edge above the river
shot('sumpah', () => C.sumpah.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const tHarum = W('sumpah', 'harum');
  const tSuci = W('sumpah', 'suci');
  const Cm = { x: lerp(640, 720, p), y: lerp(1000, 950, p), z: lerp(1.12, 1.24, p) };
  riverBackdrop(t, a, Cm, { dusk: true });
  K.view(ctx, Cm, 0.95);
  K.water(ctx, t, 540, 1220, { w: 1700, n: 4, gap: 68, amp: 20 });
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, bankR(), 0, 0, { lift: 2.0 });

  const sriRig = K.puppet(ctx, 'sritanjung', {
    x: 770, y: 1170, s: 1.02, flip: -1,
    P: K.pose({
      lean: 0.04,
      head: -0.14,
      upF: 1.55 + Math.sin(t * 3) * 0.06,
      foF: 1.25,
      upB: 1.2,
      foB: 1.1,
      face: { mouth: 'open', brow: -0.5 },
    }),
  });
  K.prop(ctx, sriRig.handF, K.PROPS.lotus(), { x: 0, y: -12, rot: -0.25, lift: 1.5 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, '"Jika Air Sungai Ini Harum..."', 540, 440, { size: 52, rot: -0.02, alpha: prog(t, tHarum - 0.3, tHarum + 0.15), tape: '#f2d078' });
  if (t > tSuci - 0.15) {
    K.cutTitle(ctx, 'AKU SUCI!', 540, 595, t, tSuci - 0.15, { size: 112, cols: [P.white, P.goldHi, P.foam], stagger: 0.03 });
  }
});

// 7. HARUM — Miracle! The river glows golden and releases fragrant lotus blossoms across the valley
shot('harum', () => C.harum.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const tKeajaiban = W('harum', 'keajaiban');
  const tAroma = W('harum', 'harum');
  const glow = prog(t, tKeajaiban - 0.2, b);
  const Cm = { x: 540, y: lerp(1040, 980, p), z: lerp(1.02, 1.12, p) };
  riverBackdrop(t, a, Cm, { golden: true });

  K.view(ctx, Cm, 0.95);
  K.water(ctx, t * 1.4, 540, 1170, { w: 1700, n: 5, gap: 64, amp: 24 });

  // Floating lotus flowers and rising golden fragrance ribbons
  for (let i = 0; i < 6; i++) {
    const appear = clamp((t - (a + 0.3 + i * 0.12)) / 0.45);
    if (appear > 0) {
      const lx = 180 + i * 145 + Math.sin(t * 1.6 + i) * 26;
      const ly = 1220 + (i % 2) * 80 + Math.cos(t * 2 + i) * 12;
      K.draw(ctx, K.PROPS.lotus(), lx, ly, { s: 1.2 * ease.outBack(appear), rot: Math.sin(t + i) * 0.15, lift: 1.5 });
      const sy = ((t * 110 + i * 65) % 300);
      K.draw(ctx, aromaSwirl(), lx, ly - 30 - sy, { s: 1.05, alpha: (1 - sy / 300) * glow });
    }
  }

  K.view(ctx, Cm, 1.05);
  K.draw(ctx, bankL(), 0, 0, { lift: 2.0 });
  K.draw(ctx, bankR(), 0, 0, { lift: 2.0 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (t > tAroma - 0.25) {
    K.cutTitle(ctx, 'HARUM', 540, 430, t, tAroma - 0.25, { size: 126, cols: [P.goldHi, P.white, P.coral, P.foam] });
    K.cutTitle(ctx, 'SEMERBAK!', 540, 575, t, tAroma + 0.05, { size: 112, cols: [P.white, P.gold, P.water], stagger: 0.03 });
  }
});

// 8. SESAL — Sidapaksa falls to his knees in remorse and cries out: "BANYUWANGI!"
shot('sesal', () => C.sesal.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const shout = W('sesal', 'Banyuwangi');
  const sh = t > shout - 0.05 ? Math.exp(-(t - shout + 0.05) * 3.5) : 0;
  const Cm = {
    x: lerp(420, 360, p),
    y: lerp(1020, 970, p),
    z: lerp(1.08, 1.22, ease.outBack(prog(t, shout - 0.2, shout + 0.35), 1.5)),
    ...shake(t, sh * 14),
  };
  riverBackdrop(t, a, Cm, { golden: true });
  K.view(ctx, Cm, 0.95);
  K.water(ctx, t, 540, 1190, { w: 1700, n: 4, gap: 68, amp: 20 });
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, bankL(), 0, 0, { lift: 2.0 });

  // Sidapaksa kneeling in grief on the left riverbank, keris dropped on the ground
  K.puppet(ctx, 'sidapaksa', {
    x: 260, y: 1220, s: 1.0,
    P: K.pose({
      lean: 0.22,
      head: -0.25,
      upF: 2.15 + Math.sin(t * 10) * 0.06,
      foF: 1.75,
      upB: 1.95,
      foB: 1.6,
      thF: 1.15, snF: 1.35, thB: 1.05, snB: 1.25,
      face: { mouth: 'shout', brow: -0.9 },
    }),
  });
  K.draw(ctx, K.PROPS.keris(), 410, 1205, { rot: 1.35, lift: 1.2 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.translate(540, 420);
  K.shoutBubble(ctx, 'BANYU WANGI!', 0, -55, t, shout - 0.08, { size: 88, w: 880, h: 360, tail: [-160, 240] });
  if (t > shout + 0.15) {
    K.tag(ctx, 'Air yang Harum Semerbak', 0, 175, { size: 52, rot: -0.02, alpha: prog(t, shout + 0.15, shout + 0.5), tape: '#f2d078' });
  }
  ctx.restore();
});

// 9. MORAL — Check the truth with a cool head before believing slander
shot('moral', () => C.moral.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: 540, y: lerp(1020, 960, p), z: lerp(1.08, 0.96, ease.outCubic(p)) };
  riverBackdrop(t, a, Cm, { golden: true });
  K.view(ctx, Cm, 0.95);
  K.water(ctx, t, 540, 1180, { w: 1700, n: 4, gap: 68, amp: 18 });
  for (let i = 0; i < 5; i++) {
    const lx = 210 + i * 165 + Math.sin(t * 1.3 + i) * 24;
    const ly = 1235 + (i % 2) * 70;
    K.draw(ctx, K.PROPS.lotus(), lx, ly, { s: 1.15, rot: Math.sin(t + i) * 0.1, lift: 1.4 });
  }
  K.view(ctx, Cm, 1.05);
  K.draw(ctx, bankL(), 0, 0, { lift: 2.0 });
  K.draw(ctx, bankR(), 0, 0, { lift: 2.0 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tPer = W('moral', 'memeriksa');
  K.cutTitle(ctx, 'PERIKSA', 540, 430, t, tPer - 0.2, { size: 120, cols: [P.gold, P.red, P.white, P.water] });
  K.cutTitle(ctx, 'KEBENARAN', 540, 575, t, tPer + 0.1, { size: 112, cols: [P.white, P.gold, P.coral, P.moss] });
  K.tag(ctx, 'Jangan Mudah Termakan Fitnah', 540, 740, { size: 50, rot: -0.02, alpha: prog(t, tPer + 0.35, tPer + 0.8), tape: '#b7c8e8' });

  const wipe = prog(t, a, a + 0.45);
  if (wipe < 1) K.tornWipe(ctx, wipe, P.teal, 1);
});

export function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  W = (id, w) => AM.wordTime(id, w);

  AM.sfx('pop', 0.35);
  AM.sfx('paper', C.ksatria.start);
  AM.sfx('chime', W('ksatria', 'Tanjung'));
  AM.sfx('paper', C.tugas.start);
  AM.sfx('drum_hit', W('fitnah', 'fitnah'));
  AM.sfx('whoosh', W('murka', 'keris'));
  AM.sfx('chime', W('sumpah', 'suci') - 0.1);
  AM.sfx('magic', W('harum', 'keajaiban'));
  AM.sfx('chime', W('harum', 'harum'));
  AM.sfx('drum_hit', W('sesal', 'Banyuwangi') - 0.05);
  AM.sfx('chime', W('moral', 'memeriksa'));
}

export function render(t, AM) {
  const dur = AM.duration;
  const S = Shots.map((s, i) => ({ ...s, a: s.t0(), b: i + 1 < Shots.length ? Shots[i + 1].t0() : dur }));
  const cur = S.find((s) => t >= s.a && t < s.b) || S[S.length - 1];
  ctx.save();
  cur.fn(t, cur.a, cur.b);
  ctx.restore();
  K.finish(ctx);
}
