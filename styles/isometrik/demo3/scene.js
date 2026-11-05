// Isometrik — Demo 3 (~65s): "Dari Sawah ke Piringmu — 6 Pemberhentian Sebutir Beras"
import * as K from '/styles/isometrik/kit.js';
const { clamp, lerp, ease, env, prog } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'bold', y: 1470, size: 68 } };

let ctx, hud;
const C = {};
let PATH = [], TR = [], BK = [], CAMZ = [], OV = [], CHECKS = [];
const STOPS = [
  { n: 1, name: 'Sawah', g: [2.0, 0.5, 1.8] },
  { n: 2, name: 'Gilingan', g: [9.5, 1.2, 2.2] },
  { n: 3, name: 'Gudang', g: [16.5, 1.2, 2.4] },
  { n: 4, name: 'Truk Kota', g: [24.0, 5.2, 2.2] },
  { n: 5, name: 'Pasar Induk', g: [33.5, 3.2, 2.4] },
  { n: 6, name: 'Rumahmu', g: [41.2, 5.8, 2.6] },
];

export async function setup(AM) {
  ctx = AM.layer('world');
  hud = AM.layer('hud');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const hEnd = C.sawah.start - 0.15;

  CHECKS = [
    C.sawah.start + 1.8,
    C.giling.start + 1.8,
    C.gudang.start + 1.8,
    C.truk.start + 1.8,
    C.akhir.start - 4.5,
    C.akhir.start - 1.2,
  ];

  PATH = [
    [0, 1.6, 0.5, 0.5],
    [hEnd, 1.6, 0.5, 0.5],
    [C.giling.start, 9.2, 1.2, 0.6],
    [C.gudang.start, 16.2, 1.2, 0.6],
    [C.truk.start, 19.5, 5.2, 0.9],
    [C.truk.end, 31.5, 5.2, 0.9],
    [C.akhir.start - 3.5, 34.0, 6.8, 0.6],
    [C.akhir.start - 0.8, 40.8, 5.8, 0.6],
  ];

  TR = [
    [0, 18.5, 5.0, 0],
    [C.truk.start, 18.5, 5.0, 0],
    [C.truk.end, 30.5, 5.0, 0],
  ];

  BK = [
    [0, 34.0, 7.0, 0],
    [C.akhir.start - 3.5, 34.0, 7.0, 0],
    [C.akhir.start - 0.8, 40.2, 7.0, 0],
  ];

  CAMZ = [
    [0, 0.3],
    [hEnd - 0.1, 0.3],
    [hEnd + 0.5, 1.08],
    [C.giling.start, 1.05],
    [C.gudang.start, 1.0],
    [C.truk.start, 0.78],
    [C.akhir.start - 0.2, 0.3],
  ];

  OV = [
    [0, 1],
    [hEnd, 0],
    [C.akhir.start - 0.2, 1],
  ];

  AM.sfx('pop', 0.4, { gain: 0.38 });
  AM.sfx('swoosh_up', hEnd, { gain: 0.35 });
  CHECKS.forEach((s) => AM.sfx('tick', s, { gain: 0.42, pitch: 1.2 }));
  AM.sfx('whoosh', C.truk.start + 0.3, { gain: 0.35, pitch: 0.85 });
  AM.sfx('chime', C.akhir.start + 0.3, { gain: 0.45 });
}

const night = (t) => env(t, C.truk.start - 0.2, C.truk.end + 0.2, 0.6, 0.6);

function camAt(t) {
  const p = K.pathAt(t, PATH);
  const [fx, fy0] = K.iso(p[0], p[1], p[2]);
  const fy = fy0 - 60;
  const ov = clamp(K.springKeys(t, OV, { z: 1, ts: 0.9 }));
  const [ox, oy] = [1160, 750];
  const z = Math.exp(K.springKeys(t, CAMZ.map(([a, b]) => [a, Math.log(b)]), { z: 1, ts: 0.9 }));
  return { x: lerp(fx, ox, ov), y: lerp(fy, oy, ov), z };
}

function drawWorld(t) {
  const n = night(t);
  // Slabs
  K.slab(ctx, -1, -2, 7.5, 5.5, '#3C8F6E'); // Terraced Paddy Field
  K.slab(ctx, 7.0, -1, 12.5, 5.2, '#C9D2E8'); // Rice Mill & Bulog Warehouse Pad
  K.slab(ctx, 15.0, 4.4, 29.0, 2.0, P.asphalt); // Highway
  K.slab(ctx, 31.5, 1.5, 6.0, 2.8, '#B7C3E0'); // Pasar Induk
  K.slab(ctx, 38.8, 3.8, 5.2, 4.2, '#3C8F6E'); // Family House Yard

  const D = [];
  const add = (d, fn) => D.push([d, fn]);

  // 1. Golden-Green Rice Terraces & Farmer
  add(2.0, () => {
    K.box(ctx, 0.2, -1.0, 0, 4.2, 3.2, 0.35, '#5FE0B5', { top: '#C6F432' });
    K.box(ctx, 0.8, -0.5, 0.35, 3.0, 2.2, 0.35, '#C6F432', { top: '#FFD24D' });
    K.person(ctx, 2.2, 2.6, 0, P.orange, t, { walk: 0.5 });
  });

  // Conveyor 1 -> 2
  add(6.5, () => K.conveyor(ctx, 4.8, 8.2, 1.0, t, { h: 0.4, speed: 1.4 }));

  // 2. Rice Milling Machine
  add(11.0, () => {
    K.box(ctx, 8.2, 0.2, 0, 2.8, 2.2, 1.5, P.orange, { top: '#FFD24D' });
    K.person(ctx, 9.5, 2.9, 0, P.yellow, t);
  });

  // Conveyor 2 -> 3
  add(14.0, () => K.conveyor(ctx, 11.0, 15.0, 1.0, t, { h: 0.4, speed: 1.4 }));

  // 3. Bulog Rice Silo & Warehouse
  add(18.0, () => {
    K.box(ctx, 15.0, -0.2, 0, 3.6, 2.8, 1.8, '#F4F1EA', { top: '#C9D2E8' });
    K.person(ctx, 16.8, 3.1, 0, P.mint, t);
  });

  // 4. Distribution Truck on Highway
  const [tx, ty] = K.pathAt(t, TR, ease.inOutSine);
  const moving = t > C.truk.start && t < C.truk.end ? 1 : 0;
  add(tx + ty + 2.0, () => K.truck(ctx, tx, ty, t, { color: P.yellow, night: n, moving }));
  for (let x = 18; x <= 30; x += 4) add(x + 4.2, () => K.lamp(ctx, x, 4.1, n));

  // 5. Pasar Induk Building & Courier Bike
  add(35.5, () => {
    K.box(ctx, 32.0, 1.6, 0, 4.2, 2.4, 1.7, P.cream, { top: P.orange });
  });
  const [bx, by] = K.pathAt(t, BK, ease.inOutSine);
  add(bx + by + 1.0, () => K.bike(ctx, bx, by, t, { moving: t > C.akhir.start - 3.5 ? 1 : 0, rider: P.mint }));

  // 6. Family Home
  add(46.5, () => {
    K.house(ctx, 39.8, 4.2, { color: P.cream, roof: P.red });
    K.tree(ctx, 43.0, 4.8, { s: 1.15 });
  });

  // Hero Rice Sack / Parcel
  const p = K.pathAt(t, PATH);
  add(p[0] + p[1] + 1.2, () => {
    const [hx, hy] = K.iso(p[0] + 0.25, p[1] + 0.25, p[2] + 0.25);
    K.halo(ctx, hx, hy, 80, 0.85, '255,210,77');
    K.parcel(ctx, p[0], p[1], p[2], { s: 0.48, glow: 0.7 });
  });

  D.sort((a, b) => a[0] - b[0]).forEach(([, fn]) => fn());
}

export function render(t) {
  const n = night(t);
  K.stage(ctx, t, n);
  const cam = camAt(t);
  ctx.setTransform(cam.z, 0, 0, cam.z, 540 - cam.x * cam.z, 900 - cam.y * cam.z);
  drawWorld(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (n > 0) {
    ctx.fillStyle = `rgba(8,12,40,${0.42 * n})`;
    ctx.fillRect(0, 0, 1080, 1920);
  }

  const S = (g) => {
    const [x, y] = K.iso(...g);
    return [x * cam.z + 540 - cam.x * cam.z, y * cam.z + 900 - cam.y * cam.z];
  };

  const pNow = K.pathAt(t, PATH);
  CHECKS.forEach((s) => {
    const age = t - s;
    if (age < -0.1 || age > 0.8) return;
    const [px, py] = S([pNow[0] + 0.25, pNow[1] + 0.25, pNow[2] + 0.5]);
    K.scan(hud, px + 80 * cam.z, py - 130 * cam.z, px, py, age);
    K.beep(hud, px, py - 30, age);
  });

  const ov = clamp(K.springKeys(t, OV, { z: 1, ts: 0.9 }));
  STOPS.forEach((s, i) => {
    const [x, y] = S(s.g);
    const pHook = K.sp(t, 0.4 + i * 0.12, 0.45, 0.55) * (1 - prog(t, C.sawah.start - 0.4, C.sawah.start));
    const pLive = env(t, CHECKS[i] - 1.2, CHECKS[i] + 2.8, 0.25, 0.3) * (1 - ov);
    const pEnd = K.sp(t, C.akhir.start + 0.1 + i * 0.1, 0.45, 0.55);
    const p = Math.max(pHook, pLive, pEnd);
    if (p > 0.01 && x > -200 && x < 1280) {
      K.tag(hud, x, y, s.n, s.name, { p, lift: 75 + 35 * (1 - ov), size: ov > 0.5 ? 25 : 31, badge: P.yellow, done: t > CHECKS[i] });
    }
  });

  // Top HUD Card: Lacak Rantai Pasok Beras
  const doneCount = CHECKS.filter((s) => t >= s).length;
  hud.save();
  AM.lib.roundRect(hud, 60, 80, 960, 190, 30);
  hud.fillStyle = 'rgba(244,241,234,0.96)';
  hud.fill();
  hud.font = "800 36px 'Inter'";
  hud.fillStyle = P.ink;
  hud.textBaseline = 'middle';
  hud.fillText('Rantai Pasok Beras', 96, 128);
  hud.font = "700 28px 'JetBrains Mono'";
  hud.textAlign = 'right';
  hud.fillText(`POS ${String(doneCount).padStart(2, '0')}/06`, 984, 128);
  const prgs = clamp((doneCount - 1) / 5);
  hud.fillStyle = '#D9DDEA';
  hud.fillRect(130, 186, 820, 8);
  hud.fillStyle = P.grass;
  hud.fillRect(130, 186, 820 * (doneCount ? prgs : 0), 8);
  hud.textAlign = 'center';
  hud.font = "700 20px 'Inter'";
  for (let i = 0; i < 6; i++) {
    const x = 130 + i * 164,
      on = doneCount > i;
    hud.fillStyle = on ? P.grass : '#D9DDEA';
    hud.beginPath();
    hud.arc(x, 190, on ? 13 : 10, 0, Math.PI * 2);
    hud.fill();
    hud.fillStyle = on ? P.ink : '#9AA0B8';
    hud.fillText(STOPS[i].name, x, 236);
  }
  hud.restore();
}

