// Legenda Batu Menangis — layered cut-paper diorama (style: kertas-guntingan, demo2).
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

// Custom paper pieces for Batu Menangis
let _stone, _stoneCap, _tear;
const stoneMonolith = () => (_stone ||= K.piece('kg2-monolith', [
  { pts: [[-150, 0], [-135, -190], [-95, -340], [-35, -430], [45, -420], [105, -320], [140, -170], [160, 0]], fill: '#596068', edge: 'torn', amp: 4.5, seed: 81, lift: 1.8 },
  { pts: [[-110, 0], [-90, -160], [-45, -300], [20, -350], [85, -260], [115, 0]], fill: '#454b52', edge: 'torn', amp: 3.8, seed: 82, lift: 1.2 },
  { pts: [[-45, -310], [-10, -370], [35, -355], [48, -295], [10, -265], [-38, -275]], fill: '#6e7680', edge: 'torn', amp: 2.5, seed: 83, lift: 0.9 },
]));
const stoneShell = (stage) => K.piece('kg2-shell:' + stage, [
  { pts: [[-95, 0], [-86, -110 * stage], [-52, -145 * stage], [54, -140 * stage], [88, -105 * stage], [98, 0]], fill: '#596068', edge: 'torn', amp: 4, seed: 90 + stage, lift: 1.6 },
  { pts: [[-65, 0], [-54, -85 * stage], [0, -115 * stage], [60, -80 * stage], [72, 0]], fill: '#424850', edge: 'torn', amp: 3.2, seed: 95 + stage, lift: 1.1 },
]);
const tearDrop = () => (_tear ||= K.piece('kg2-tear', [
  { pts: [[0, -22], [11, 2], [8, 15], [0, 20], [-8, 15], [-11, 2]], fill: P.foam, edge: 'cut', seed: 77, lift: 0.8 },
]));

function valleyBackdrop(t, a, Cm, { dark = false, dry = false } = {}) {
  K.view(ctx, Cm, 0.15);
  K.sky(ctx, dark ? P.stormHi : P.skyTop, dark ? P.stormDk : P.skyBot, dark ? 'st2' : 'day2');
  if (!dark) {
    K.view(ctx, Cm, 0.22);
    K.draw(ctx, K.sunPiece(115, P.sun), 830, 330 + (1 - K.slideIn(t, a, 0.7)) * -200, { rot: t * 0.04, lift: 2 });
    for (let i = 0; i < 3; i++) {
      K.draw(ctx, K.cloudPiece(i + 4, 290 + i * 35), 200 + i * 330 + Math.sin(t * 0.35 + i) * 32, 310 + (i % 2) * 90, { lift: 1.6 });
    }
  }
  K.view(ctx, Cm, 0.42);
  K.draw(ctx, K.hillPiece(11, dark ? '#2d3b42' : P.teal, { x0: -450, x1: 1550, top: 880, bot: 1650, amp: 130 }), 0, 0, { lift: 1.8 });
  K.view(ctx, Cm, 0.65);
  K.draw(ctx, K.hillPiece(12, dark ? '#263429' : P.moss, { x0: -450, x1: 1550, top: 1060, bot: 1750, amp: 90 }), 0, 0, { lift: 2.0 });
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, K.hillPiece(13, dry ? P.earth : P.grass, { x0: -450, x1: 1550, top: 1260, bot: 1980, amp: 38 }), 0, 0, { lift: 2.2 });
}

// 1. HOOK — Weeping rock on the Kalimantan hill, cut-out title BATU MENANGIS
shot('hook', () => 0, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: 540, y: lerp(960, 1020, ease.outCubic(p)), z: lerp(0.95, 1.12, ease.inOutSine(p)) };
  valleyBackdrop(t, a, Cm, { dark: false });
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, K.pineTree(2, 390, P.forest), 190, 1300, { lift: 1.6 });
  K.draw(ctx, K.roundTree(4, 340, P.moss), 890, 1310, { lift: 1.6 });
  K.draw(ctx, stoneMonolith(), 540, 1330, { lift: 2.2, s: 1.12 });
  // Falling paper tears from the stone face
  for (let i = 0; i < 4; i++) {
    const ty = ((t * 140 + i * 95) % 280);
    K.draw(ctx, tearDrop(), 515 + (i % 2) * 52, 980 + ty, { s: 1.0, alpha: 1 - ty / 280 });
  }
  K.view(ctx, Cm, 1.25);
  K.draw(ctx, K.fern(1, 230, P.forest), 90, 1620, { rot: 0.2, lift: 2.4 });
  K.draw(ctx, K.fern(2, 230, P.forest), 990, 1620, { flip: -1, rot: -0.2, lift: 2.4 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Kalimantan Barat', 540, 290, { size: 48, rot: -0.03, alpha: prog(t, a + 0.2, a + 0.6), tape: '#e6b88a' });
  K.cutTitle(ctx, 'BATU', 540, 440, t, a + 0.35, { size: 132, cols: [P.white, P.gold, P.coral, P.foam] });
  K.cutTitle(ctx, 'MENANGIS', 540, 595, t, a + 0.65, { size: 118, cols: [P.gold, P.red, P.white, P.teal] });
});

// 2. DESA — Village home with hardworking widow mother and beautiful daughter Darmi
shot('desa', () => C.desa.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: lerp(500, 560, p), y: 1020, z: lerp(0.96, 1.04, p) };
  valleyBackdrop(t, a, Cm);
  K.view(ctx, Cm, 0.92);
  K.draw(ctx, K.rumahBolon(0.82), 340, 1290, { lift: 2.0 });
  K.draw(ctx, K.palmTree(3, 430), 870, 1290, { lift: 1.8 });
  K.view(ctx, Cm, 1.0);
  K.puppet(ctx, 'ibu', { x: 420, y: 1350, s: 0.94, P: K.pose({ upF: 0.4 + Math.sin(t * 3) * 0.1, foF: 0.7, face: { mouth: 'smile', brow: -0.2 } }) });
  const tDarmi = W('desa', 'Darmi');
  const dIn = K.slideIn(t, tDarmi - 0.5, 0.55);
  K.puppet(ctx, 'darmi', { x: lerp(1080, 680, dIn), y: 1355, s: 0.96, flip: -1, P: K.pose({ upF: 0.85, foF: 1.2, head: -0.06, face: { mouth: 'smile', brow: 0.1 } }) });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Ibu Janda', 310, 740, { size: 46, rot: -0.04, alpha: prog(t, a + 0.4, a + 0.8) });
  K.tag(ctx, 'Darmi yang Jelita', 750, 720, { size: 48, rot: 0.04, alpha: prog(t, tDarmi - 0.1, tDarmi + 0.3), tape: '#b7c8e8' });
});

// 3. MALAS — Mother hoeing the field while Darmi admires herself in her gold mirror
shot('malas', () => C.malas.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: lerp(460, 600, eio(t, a, b)), y: 1050, z: 1.05 };
  valleyBackdrop(t, a, Cm, { dry: true });
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, K.fieldPiece(true, 1700, 500), 540, 1265, { lift: 1.2 });

  // Mother hoeing on the left
  const chop = Math.sin(t * 5.2);
  const ibuRig = K.puppet(ctx, 'ibu', {
    x: 310, y: 1355, s: 0.95,
    P: K.pose({ lean: 0.25 + chop * 0.12, upF: 0.85 + chop * 0.45, foF: 0.7, upB: 0.65 + chop * 0.35, foB: 0.8, head: 0.18, face: { mouth: 'open', brow: -0.3 } }),
  });
  K.prop(ctx, ibuRig.handF, K.PROPS.hoe(), { x: 0, y: -35, rot: 1.05, lift: 1.3 });

  // Darmi admiring her mirror on a woven mat on the right
  const darmiRig = K.puppet(ctx, 'darmi', {
    x: 780, y: 1355, s: 0.98, flip: -1,
    P: K.pose({ upF: 1.15 + Math.sin(t * 2.5) * 0.08, foF: 1.25, upB: 0.3, foB: 0.8, head: -0.08 + Math.sin(t * 2.5) * 0.04, face: { mouth: 'smile', brow: 0.15 } }),
  });
  K.prop(ctx, darmiRig.handF, K.PROPS.mirror(), { x: 0, y: 0, rot: -0.35, lift: 1.5 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Membanting Tulang', 280, 640, { size: 46, rot: -0.05, alpha: prog(t, a + 0.3, a + 0.7) });
  const tMir = W('malas', 'cermin');
  K.tag(ctx, 'Sibuk Bersolek', 780, 620, { size: 48, rot: 0.05, alpha: prog(t, tMir - 0.6, tMir - 0.1), tape: '#f2d078' });
});

// 4. PASAR — Walking to the village market: Darmi in front, Mother hunched behind with a basket
shot('pasar', () => C.pasar.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: 540 + (p - 0.5) * 140, y: 1030, z: 1.02 };
  valleyBackdrop(t, a, Cm);
  K.view(ctx, Cm, 0.9);
  K.draw(ctx, K.palmTree(1, 450), 210, 1280, { lift: 1.7 });
  K.draw(ctx, K.roundTree(5, 360, P.forest), 900, 1290, { lift: 1.7 });
  K.view(ctx, Cm, 1.0);

  const wx = lerp(240, 820, p);
  // Mother walking far behind carrying heavy market basket
  const ibuRig = K.puppet(ctx, 'ibu', {
    x: wx - 270, y: 1355, s: 0.92,
    P: K.walk(t * 1.6, 0.75, { lean: 0.24, head: 0.18, upF: 0.65, foF: 1.1, face: { mouth: 'sad', brow: -0.4 } }),
  });
  K.prop(ctx, ibuRig.handF, K.PROPS.basket(), { x: 0, y: 10, rot: -0.2, lift: 1.5 });

  // Darmi strutting proudly in front
  const darmiRig = K.puppet(ctx, 'darmi', {
    x: wx + 60, y: 1355, s: 0.98,
    P: K.walk(t * 1.9, 0.9, { lean: -0.06, head: -0.12, upF: 0.95, foF: 1.15, face: { mouth: 'smile', brow: 0.2 } }),
  });
  K.prop(ctx, darmiRig.handF, K.PROPS.mirror(), { x: 0, y: 0, rot: 0.3, lift: 1.4 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tBel = W('pasar', 'belakang');
  K.tag(ctx, 'Jalan di Belakang!', 340, 620, { size: 50, rot: -0.04, alpha: prog(t, tBel - 0.3, tBel + 0.15), tape: '#e7a2a2' });
});

// 5. TANYA — At the market, a villager asks who walks behind her
shot('tanya', () => C.tanya.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: 540, y: 1040, z: lerp(1.0, 1.08, p) };
  valleyBackdrop(t, a, Cm);
  K.view(ctx, Cm, 0.92);
  K.draw(ctx, K.rumahBolon(0.75), 860, 1285, { lift: 1.8 });
  K.view(ctx, Cm, 1.0);

  // Mother waiting humbly on the left
  const ibuRig = K.puppet(ctx, 'ibu', {
    x: 210, y: 1360, s: 0.9,
    P: K.pose({ lean: 0.18, head: 0.15, upF: 0.55, foF: 0.95, face: { mouth: 'sad', brow: -0.5 } }),
  });
  K.prop(ctx, ibuRig.handF, K.PROPS.basket(), { x: 0, y: 10, rot: -0.15, lift: 1.4 });

  // Darmi in the center
  K.puppet(ctx, 'darmi', {
    x: 520, y: 1355, s: 0.98,
    P: K.pose({ upF: 0.4, foF: 0.8, head: -0.05, face: { mouth: 'smile', brow: 0 } }),
  });

  // Villager on the right asking politely
  const talk = Math.sin(t * 14) > 0;
  K.puppet(ctx, 'toba', {
    x: 820, y: 1355, s: 0.96, flip: -1,
    P: K.pose({ upF: 0.85 + Math.sin(t * 4) * 0.1, foF: 1.1, face: { mouth: talk ? 'open' : 'smile', brow: -0.1 } }),
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tSiapa = W('tanya', 'siapa');
  K.tag(ctx, '"Siapa di belakangmu?"', 720, 580, { size: 50, rot: 0.03, alpha: prog(t, tSiapa - 0.25, tSiapa + 0.15), tape: '#b7c8e8' });
});

// 6. BANTAH — Darmi shouts: "Bukan ibuku, dia cuma pembantu upahanku!"
shot('bantah', () => C.bantah.start - 0.1, (t, a, b) => {
  const shout = W('bantah', 'Bukan');
  const tPem = W('bantah', 'pembantu');
  const sh = t > shout - 0.05 ? Math.exp(-(t - shout + 0.05) * 3.5) : 0;
  const Cm = {
    x: lerp(520, 470, eio(t, a, shout)),
    y: lerp(1030, 960, eio(t, a, shout)),
    z: lerp(1.06, 1.24, ease.outBack(prog(t, shout - 0.15, shout + 0.35), 1.6)),
    ...shake(t, sh * 18),
  };
  valleyBackdrop(t, a, Cm, { dry: true });
  K.view(ctx, Cm, 1.0);
  const fury = t > shout - 0.15 ? 1 : 0;

  // Mother gasping in heartbreak
  K.puppet(ctx, 'ibu', {
    x: 270, y: 1360, s: 0.92,
    P: K.pose({ lean: fury ? -0.08 : 0.12, upF: fury ? 2.1 : 0.5, foF: fury ? 2.0 : 0.8, head: fury ? 0.2 : 0.1, face: { mouth: fury ? 'sad' : 'n', brow: -0.8 } }),
  });

  // Darmi pointing dismissively and shouting
  K.puppet(ctx, 'darmi', {
    x: 610, y: 1355, s: 1.0,
    P: K.pose({
      lean: fury ? -0.1 : 0,
      upF: fury ? 1.65 + Math.sin(t * 18) * 0.07 : 0.6,
      foF: fury ? 0.35 : 0.9,
      head: fury ? -0.15 : -0.05,
      face: { mouth: fury ? 'shout' : 'n', brow: 0.7 },
    }),
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save(); ctx.translate(540, 420);
  K.shoutBubble(ctx, 'BUKAN IBUKU!', 0, -65, t, shout - 0.06, { size: 88, w: 880, h: 380, tail: [120, 250] });
  if (t > tPem - 0.15) {
    K.cutTitle(ctx, 'CUMA PEMBANTU!', 0, 75, t, tPem - 0.15, { size: 84, cols: [P.white, P.goldHi], stagger: 0.025 });
  }
  ctx.restore();
});

// 7. DOA — Mother kneels weeping on the dusty ground and prays to the sky
shot('doa', () => C.doa.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const tDoa = W('doa', 'berdoa');
  const darkP = prog(t, tDoa - 0.4, b);
  const Cm = { x: 540, y: lerp(1060, 1000, p), z: lerp(1.08, 1.18, p) };
  valleyBackdrop(t, a, Cm, { dark: darkP > 0.45, dry: true });

  K.view(ctx, Cm, 0.35);
  for (let i = 0; i < 3; i++) {
    const s = K.slideIn(t, tDoa - 0.3 + i * 0.15, 0.7);
    if (s > 0) K.draw(ctx, K.stormCloud(i + 2, 620), lerp(-350, 260 + i * 280, s), 290 + i * 85, { lift: 2.5, alpha: s });
  }

  K.view(ctx, Cm, 1.0);
  K.draw(ctx, K.fieldPiece(true, 1600, 480), 540, 1275, { lift: 1.2 });

  // Mother kneeling & raising hands to the sky
  const pray = prog(t, tDoa - 0.3, tDoa + 0.5);
  K.puppet(ctx, 'ibu', {
    x: 520, y: 1410, s: 0.98,
    P: K.pose({
      lean: lerp(0.25, -0.12, pray),
      head: lerp(0.25, -0.35, pray),
      upF: lerp(1.9, 2.35, pray) + Math.sin(t * 6) * 0.05,
      foF: lerp(1.8, 0.45, pray),
      upB: lerp(1.7, 2.2, pray),
      foB: lerp(1.6, 0.5, pray),
      thF: 1.2, snF: 1.4, thB: 1.1, snB: 1.3,
      face: { mouth: 'sad', brow: -0.9 },
    }),
  });
  K.draw(ctx, K.PROPS.basket(), 330, 1345, { rot: -0.4, lift: 1.2 });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.tag(ctx, 'Doa Ibu yang Terluka', 540, 560, { size: 52, rot: -0.02, alpha: prog(t, tDoa - 0.2, tDoa + 0.3), tape: '#d99b9b' });
});

// 8. BATU — Lightning strikes! Darmi's legs turn into torn gray stone layer by layer
shot('batu', () => C.batu.start - 0.12, (t, a, b) => {
  const p = prog(t, a, b);
  const tPetir = W('batu', 'petir');
  const tKaki = W('batu', 'Kaki');
  const tAmpun = W('batu', 'ampun');
  const fl = t > tPetir - 0.08 ? Math.exp(-(t - tPetir + 0.08) * 4.5) : 0;
  const Cm = { x: 540, y: 1000, z: lerp(1.06, 1.18, p), ...shake(t, 12 * fl + 3.5) };

  valleyBackdrop(t, a, Cm, { dark: true, dry: true });
  K.view(ctx, Cm, 0.32);
  for (let i = 0; i < 4; i++) {
    K.draw(ctx, K.stormCloud(i + 1, 650), 200 + i * 240 + Math.sin(t * 0.8 + i) * 24, 260 + (i % 2) * 90, { lift: 2.6, s: 1.08 });
  }
  if (fl > 0.05) K.bolt(ctx, 560, 350, 1.35, Math.min(1, fl * 2.2));

  K.view(ctx, Cm, 1.0);
  K.draw(ctx, K.fieldPiece(true, 1650, 500), 540, 1270, { lift: 1.2 });

  // Darmi panicking as stone rises up her legs and torso
  const petrify = prog(t, tKaki - 0.2, b - 0.3);
  K.puppet(ctx, 'darmi', {
    x: 560, y: 1360, s: 1.02, flip: -1,
    P: K.pose({
      lean: Math.sin(t * 16) * 0.06 * (1 - petrify * 0.7),
      head: -0.2,
      upF: 2.3 + Math.sin(t * 14) * 0.1,
      foF: 0.4,
      upB: 2.1,
      foB: 0.5,
      face: { mouth: 'shout', brow: -0.9 },
    }),
  });

  // Layered torn-paper stone encasing her from the feet upward
  if (petrify > 0.02) {
    const stage = Math.min(3, Math.ceil(petrify * 3));
    K.draw(ctx, stoneShell(stage), 560, 1375, { lift: 2.2, s: 1.0 + petrify * 0.35 });
  }

  // Mother watching in tears on the left
  K.puppet(ctx, 'ibu', {
    x: 250, y: 1365, s: 0.92,
    P: K.pose({ upF: 2.0, foF: 1.9, head: 0.1, face: { mouth: 'sad', brow: -0.8 } }),
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  K.rain(ctx, t, { n: 65, col: P.foam, alpha: 0.65 });
  if (t > tAmpun - 0.2) {
    ctx.save(); ctx.translate(540, 410);
    K.shoutBubble(ctx, 'AMPUNI AKU', 0, -60, t, tAmpun - 0.2, { size: 90, w: 840, h: 360, tail: [40, 240] });
    K.cutTitle(ctx, 'IBU!', 0, 70, t, tAmpun, { size: 105, cols: [P.white, P.goldHi], stagger: 0.03 });
    ctx.restore();
  }
});

// 9. MORAL — The weeping stone stands forever; cut-out moral HORMATI IBUMU
shot('moral', () => C.moral.start - 0.1, (t, a, b) => {
  const p = prog(t, a, b);
  const Cm = { x: 540, y: lerp(1020, 960, p), z: lerp(1.08, 0.98, ease.outCubic(p)) };
  valleyBackdrop(t, a, Cm, { dark: false });
  K.view(ctx, Cm, 1.0);
  K.draw(ctx, K.pineTree(5, 390, P.forest), 180, 1300, { lift: 1.6 });
  K.draw(ctx, K.roundTree(6, 350, P.moss), 900, 1310, { lift: 1.6 });
  K.draw(ctx, stoneMonolith(), 540, 1335, { lift: 2.3, s: 1.18 });
  for (let i = 0; i < 4; i++) {
    const ty = ((t * 130 + i * 90) % 270);
    K.draw(ctx, tearDrop(), 515 + (i % 2) * 52, 980 + ty, { s: 1.05, alpha: 1 - ty / 270 });
  }
  K.puppet(ctx, 'ibu', {
    x: 340, y: 1350, s: 0.92,
    P: K.pose({ lean: 0.1, head: -0.1, upF: 1.4, foF: 1.5, face: { mouth: 'sad', brow: -0.6 } }),
  });

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const tHor = W('moral', 'menghormati');
  K.cutTitle(ctx, 'HORMATI', 540, 440, t, tHor - 0.25, { size: 124, cols: [P.gold, P.red, P.white, P.moss] });
  K.cutTitle(ctx, 'IBUMU', 540, 585, t, tHor + 0.1, { size: 132, cols: [P.red, P.gold, P.water, P.white] });
  K.tag(ctx, 'Kasih Ibu Sepanjang Masa', 540, 745, { size: 52, rot: -0.02, alpha: prog(t, tHor + 0.35, tHor + 0.8), tape: '#e6b88a' });

  const wipe = prog(t, a, a + 0.45);
  if (wipe < 1) K.tornWipe(ctx, wipe, P.stormDk, 1);
});

export function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
  W = (id, w) => AM.wordTime(id, w);

  AM.sfx('pop', 0.35);
  AM.sfx('paper', C.desa.start);
  AM.sfx('chime', W('desa', 'Darmi'));
  AM.sfx('chime', W('malas', 'cermin'));
  AM.sfx('paper', C.pasar.start);
  AM.sfx('drum_hit', W('bantah', 'Bukan') - 0.05);
  AM.sfx('whoosh', W('doa', 'berdoa'));
  AM.sfx('thunder', W('batu', 'petir') - 0.05);
  AM.sfx('drum_hit', W('batu', 'ampun') - 0.1);
  AM.sfx('chime', W('moral', 'menghormati'));
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
