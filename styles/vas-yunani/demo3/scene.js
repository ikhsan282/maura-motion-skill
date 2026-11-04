// Vas Yunani Black-Figure demo3 (~65 s): "Siasat Kuda Troya — Ketika Hadiah Kemenangan Justru Meruntuhkan Benteng Terkuat"
// Cylindrical Attic black-figure amphora depicting the siege of Troy, Odysseus's Wooden Horse, and the origin of "Trojan Horse".
import * as K from '/styles/vas-yunani/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'serif', y: 1515, size: 68 } };

let ctx;
const C = {};
const seg = (id, t) => clamp((t - C[id].start) / Math.max(0.01, C[id].end - C[id].start));
const fade = (id, t, fi = 0.35, fo = 0.35) => {
  const s = C[id].start, e = C[id].end;
  if (t < s - fi || t > e + fo) return 0;
  if (t < s) return clamp((t - (s - fi)) / fi);
  if (t > e) return clamp(1 - (t - e) / fo);
  return 1;
};

export async function setup(AM) {
  ctx = AM.layer('vase');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('thud', C.benteng.start + 0.2, { gain: 0.42 });
  AM.sfx('chime', C.odiseus.start + 0.25, { gain: 0.4 });
  AM.sfx('whoosh', C.gerbang.start + 0.25, { gain: 0.38 });
  AM.sfx('stamp', C.malam.start + 0.25, { gain: 0.45 });
  AM.sfx('ding', C.warisan.start + 0.3, { gain: 0.4 });
}

function drawTroyWall(x, y, w, h, { gateOpen = 0 } = {}) {
  ctx.save();
  ctx.fillStyle = P.slip;
  ctx.fillRect(x, y - h, w, h);
  // Battlement crenels on top
  const cw = 36;
  for (let bx = x; bx < x + w - 10; bx += cw * 1.6) {
    ctx.fillRect(bx, y - h - 32, cw, 32);
  }
  // Incised stone masonry grid
  ctx.strokeStyle = P.incise; ctx.lineWidth = 2.2;
  for (let row = 1; row < 8; row++) {
    const ry = y - (h / 8) * row;
    ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x + w, ry); ctx.stroke();
  }
  // Archway Gate
  const gw = w * 0.42, gh = h * 0.56;
  const gx = x + (w - gw) / 2;
  ctx.fillStyle = gateOpen > 0.5 ? P.clayBright : P.crimson;
  ctx.beginPath();
  ctx.moveTo(gx, y);
  ctx.lineTo(gx, y - gh * 0.65);
  ctx.arc(gx + gw / 2, y - gh * 0.65, gw / 2, Math.PI, 0);
  ctx.lineTo(gx + gw, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = P.incise; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

export function render(t) {
  const scroll = t * 50;
  const chIdx = ['hook', 'benteng', 'odiseus', 'gerbang', 'malam', 'warisan'].findIndex((id) => t <= C[id].end + 0.1);
  const rom = ['ADEGAN I', 'ADEGAN II', 'ADEGAN III', 'ADEGAN IV', 'ADEGAN V', 'ADEGAN VI'][Math.max(0, chIdx)];

  K.stage(ctx, t, {
    scroll,
    title: 'KUDA TROYA · SIASAT ODISEUS',
    subtitle: 'AMFORA ATTIC BLACK-FIGURE · ~510 SM',
    chapter: rom,
    glow: 0.3,
  });

  // Scene 1: Hook — The Monumental Trojan Horse standing before the walls of Troy
  const a1 = fade('hook', t, 0.2, 0.3);
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1;
    drawTroyWall(660, 1285, 340, 560, { gateOpen: 0 });
    K.trojanHorse(ctx, 370, 1285, 1.38, t, { showInside: 0, roll: 0 });
    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'EPOS PERANG TROYA',
      title: '10 TAHUN PENGEPUNGAN · 1 MALAM PENENTUAN',
      sub: 'Ketika kecerdikan mengalahkan kekuatan seribu kapal perang',
      alpha: ease.outCubic(clamp(seg('hook', t) * 2)),
    });
    ctx.restore();
  }

  // Scene 2: Benteng — Greek hoplites clashing against the impenetrable walls of Troy
  const a2 = fade('benteng', t, 0.3, 0.3);
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2;
    const p = seg('benteng', t);
    drawTroyWall(650, 1285, 350, 580, { gateOpen: 0 });
    // Two Greek warriors advancing with spears & shields
    const wx1 = lerp(160, 320, ease.outCubic(p));
    const wx2 = lerp(310, 490, ease.outCubic(p));
    K.figure(ctx, wx1, 1285, 1.22, { t, dir: 1, walk: 1, helmet: true, beard: true, armR: 0.95, prop: 'spear' });
    K.figure(ctx, wx2, 1285, 1.25, { t, dir: 1, walk: 1, helmet: true, beard: true, armR: 0.85, prop: 'shield' });
    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'KEBUNTUAN MILITER',
      title: 'TEMBOK BATU TROYA TAK TERTEMBUS',
      sub: 'Serangan frontal selama satu dekade gagal membuka gerbang kota',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 3: Odiseus — Odysseus's cutaway blueprint of the Wooden Horse with 30 elite warriors inside
  const a3 = fade('odiseus', t, 0.3, 0.3);
  if (a3 > 0) {
    ctx.save(); ctx.globalAlpha = a3;
    const p = seg('odiseus', t);
    // Odysseus on left explaining strategy, large cutaway Trojan Horse on right
    K.figure(ctx, 220, 1285, 1.26, { t, dir: 1, beard: true, helmet: true, armR: 0.85 });
    K.trojanHorse(ctx, 640, 1285, 1.55, t, { showInside: clamp((p - 0.15) * 2.2), roll: 0 });
    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'STRATEGI PSIKOLOGIS ODISEUS',
      title: '30 PRAJURIT DI PERUT KUDA KAYU',
      sub: 'Armada Yunani pura-pura berlayar pergi meninggalkan hadiah semu',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 4: Gerbang — Trojans pulling the wheeled wooden horse through their own city gate
  const a4 = fade('gerbang', t, 0.3, 0.3);
  if (a4 > 0) {
    ctx.save(); ctx.globalAlpha = a4;
    const p = seg('gerbang', t);
    drawTroyWall(660, 1285, 340, 560, { gateOpen: 1 });
    const hx = lerp(250, 540, ease.inOutQuad(p));
    K.trojanHorse(ctx, hx, 1285, 1.32, t, { showInside: 0.35, roll: p * 6 });
    // Trojan citizen pulling rope toward the open gate
    K.figure(ctx, hx + 250, 1285, 1.15, { t, dir: 1, walk: 1, beard: false, laurel: true, armL: -0.7 });
    ctx.strokeStyle = P.chalk; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(hx + 140, 1140); ctx.lineTo(hx + 235, 1150); ctx.stroke();

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'PERSEMBAHAN SEMU DEWI ATHENA',
      title: 'MENARIK MUSUH KE DALAM BENTENG',
      sub: 'Penduduk Troya merobohkan ambang gerbang mereka sendiri',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 5: Malam — Midnight ambush: warriors descending rope from the horse's belly with torches
  const a5 = fade('malam', t, 0.3, 0.3);
  if (a5 > 0) {
    ctx.save(); ctx.globalAlpha = a5;
    const p = seg('malam', t);
    K.trojanHorse(ctx, 420, 1285, 1.48, t, { showInside: 1, roll: 0 });
    // Rope dropping from belly
    ctx.strokeStyle = P.chalk; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(420, 1065); ctx.lineTo(420, 1285); ctx.stroke();
    // Warriors emerging with torches and spears
    K.figure(ctx, 210, 1285, 1.2, { t, dir: -1, walk: 0.6, helmet: true, beard: true, armR: 0.9, prop: 'torch' });
    K.figure(ctx, 790, 1285, 1.22, { t, dir: 1, walk: 0.8, helmet: true, beard: true, armR: 0.9, prop: 'spear' });

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'SERGAP TENGAH MALAM',
      title: 'PINTU RAHASIA TERBUKA DALAM GELAP',
      sub: 'Odiseus membuka gerbang utama bagi armada Yunani yang kembali',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }

  // Scene 6: Warisan — Ancient Trojan Horse to Modern Cybersecurity "Trojan Horse"
  const a6 = fade('warisan', t, 0.3, 0.2);
  if (a6 > 0) {
    ctx.save(); ctx.globalAlpha = a6;
    const p = seg('warisan', t);
    K.trojanHorse(ctx, 540, 1285, 1.45, t, { showInside: 0.9, roll: 0 });

    // Archaic security warning medallions flanking the horse
    for (const [mx, lbl] of [[210, 'HADIAH PALSU'], [870, 'TROJAN.EXE']]) {
      ctx.fillStyle = P.slip;
      ctx.beginPath(); ctx.arc(mx, 740, 92, 0, TAU); ctx.fill();
      ctx.strokeStyle = P.gold; ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = P.crimson;
      ctx.beginPath(); ctx.arc(mx, 740, 74, 0, TAU); ctx.fill();
      ctx.fillStyle = P.chalk;
      ctx.font = `700 22px '${K.FONT.mono}'`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(lbl, mx, 740);
    }

    K.plaque(ctx, 80, 260, 920, 175, {
      tag: 'WARISAN 2.500 TAHUN KEMUDIAN',
      title: 'DARI MITOLOGI KE KEAMANAN SIBER',
      sub: 'Waspadai ancaman yang menyamar sebagai hadiah gratis',
      alpha: clamp(p * 2.5),
    });
    ctx.restore();
  }
}

