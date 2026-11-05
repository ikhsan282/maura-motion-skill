// Isometrik — Demo 2 (~64s): "Perjalanan Setetes Air Keran — 6 Tahap dari Waduk ke Gelasmu"
import * as K from '/styles/isometrik/kit.js';
const { clamp, lerp, ease, env, prog } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'bold', y: 1470, size: 68 } };

let ctx, hud;
const C = {};
let PATH = [], CAMZ = [], OV = [], CHECKS = [];
const STOPS = [
  { n: 1, name: 'Waduk', g: [2.0, 0.5, 2.2] },
  { n: 2, name: 'Saringan', g: [10.0, 1.5, 2.2] },
  { n: 3, name: 'Klorinasi', g: [18.0, 1.5, 2.2] },
  { n: 4, name: 'Menara Air', g: [25.5, 2.0, 3.8] },
  { n: 5, name: 'Pipa Kota', g: [33.0, 5.2, 1.8] },
  { n: 6, name: 'Keran Rumah', g: [40.8, 5.5, 2.6] },
];

export async function setup(AM) {
  ctx = AM.layer('world');
  hud = AM.layer('hud');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const hEnd = C.waduk.start - 0.15;

  CHECKS = [
    C.waduk.start + 1.8,
    C.saring.start + 2.0,
    C.klorin.start + 2.0,
    C.menara.start + 1.6,
    C.menara.start + 5.2,
    C.akhir.start - 1.2,
  ];

  PATH = [
    [0, 1.5, 0.5, 0.8],
    [hEnd, 1.5, 0.5, 0.8],
    [C.saring.start, 9.5, 1.5, 0.8],
    [C.klorin.start, 17.5, 1.5, 0.8],
    [C.menara.start, 25.2, 2.0, 2.8],
    [C.menara.start + 4.5, 33.0, 5.2, 0.5],
    [C.akhir.start - 0.8, 40.5, 5.5, 1.0],
  ];

  CAMZ = [
    [0, 0.31],
    [hEnd - 0.1, 0.31],
    [hEnd + 0.5, 1.08],
    [C.saring.start, 1.05],
    [C.klorin.start, 1.05],
    [C.menara.start, 0.88],
    [C.akhir.start - 0.2, 0.31],
  ];

  OV = [
    [0, 1],
    [hEnd, 0],
    [C.akhir.start - 0.2, 1],
  ];

  AM.sfx('pop', 0.4, { gain: 0.38 });
  AM.sfx('swoosh_up', hEnd, { gain: 0.35 });
  CHECKS.forEach((s) => AM.sfx('tick', s, { gain: 0.4, pitch: 1.25 }));
  AM.sfx('chime', C.akhir.start + 0.3, { gain: 0.45 });
}

function camAt(t) {
  const p = K.pathAt(t, PATH);
  const [fx, fy0] = K.iso(p[0], p[1], p[2]);
  const fy = fy0 - 60;
  const ov = clamp(K.springKeys(t, OV, { z: 1, ts: 0.9 }));
  const [ox, oy] = [1150, 740];
  const z = Math.exp(K.springKeys(t, CAMZ.map(([a, b]) => [a, Math.log(b)]), { z: 1, ts: 0.9 }));
  return { x: lerp(fx, ox, ov), y: lerp(fy, oy, ov), z };
}

function drawWorld(t) {
  // Base slabs
  K.slab(ctx, -1, -2, 7.5, 5.5, '#3C8F6E'); // Mountain reservoir green bank
  K.slab(ctx, 7.0, -1, 14.5, 5.5, '#C9D2E8'); // Water treatment plant concrete pad
  K.slab(ctx, 22.0, 0, 7.0, 5.0, '#B7C3E0'); // Water tower plaza
  K.slab(ctx, 29.0, 3.8, 15.0, 3.2, P.asphalt); // City road + underground pipe trench
  K.slab(ctx, 38.5, 3.2, 5.5, 4.5, '#3C8F6E'); // Residential lawn

  const D = [];
  const add = (d, fn) => D.push([d, fn]);

  // 1. Reservoir Basin & Dam Wall
  add(2.0, () => {
    K.box(ctx, 0.2, -1.0, 0, 4.5, 3.5, 1.1, '#5B8CFF', { top: '#8FD3FF' });
    K.box(ctx, 4.7, -1.2, 0, 0.8, 3.9, 1.5, '#C9D2E8');
  });
  for (const [tx, ty] of [
    [-0.5, -1.5],
    [1.2, -1.8],
    [3.2, -1.6],
  ]) {
    add(tx + ty, () => K.tree(ctx, tx, ty, { s: 1.1 }));
  }

  // Connecting Pipe 1 -> 2
  add(7.5, () => K.conveyor(ctx, 5.5, 8.2, 1.2, t, { h: 0.35, speed: 1.4 }));

  // 2. Sedimentation & Sand Filtration Tanks
  add(11.5, () => {
    K.box(ctx, 8.2, 0.2, 0, 3.6, 2.6, 1.2, '#DDE4F5', { top: '#5FE0B5' });
    K.person(ctx, 10.0, 3.3, 0, P.yellow, t, { walk: 0 });
  });

  // Connecting Pipe 2 -> 3
  add(15.0, () => K.conveyor(ctx, 11.8, 16.0, 1.2, t, { h: 0.35, speed: 1.5 }));

  // 3. Chlorination & Lab Building
  add(19.5, () => {
    K.box(ctx, 16.0, 0.1, 0, 3.8, 2.8, 1.55, '#F4F1EA', { top: '#8FD3FF' });
    K.box(ctx, 17.2, 0.8, 1.55, 1.4, 1.2, 0.6, P.mint);
    K.person(ctx, 18.2, 3.4, 0, P.mint, t);
  });

  // Connecting Pipe 3 -> 4
  add(23.5, () => K.conveyor(ctx, 19.8, 24.0, 1.5, t, { h: 0.35, speed: 1.6 }));

  // 4. Elevated City Water Tower
  add(27.5, () => {
    K.box(ctx, 24.4, 1.1, 0, 1.8, 1.8, 2.2, '#8A93B5');
    K.box(ctx, 23.8, 0.6, 2.2, 3.0, 2.8, 1.4, '#5B8CFF', { top: '#8FD3FF' });
  });

  // 5. City Underground Main Pipe (glowing cyan conduit along road)
  add(36.0, () => {
    K.conveyor(ctx, 26.2, 39.5, 5.0, t, { h: 0.3, speed: 2.0 });
    for (let x = 30; x <= 36; x += 3) K.lamp(ctx, x, 3.6, 0);
  });

  // 6. Family House & Kitchen Tap
  add(46.0, () => {
    K.house(ctx, 39.8, 4.2, { color: P.cream, roof: P.orange });
    K.tree(ctx, 42.6, 4.6, { s: 1.15 });
  });

  // Hero Glowing Water Parcel/Droplet Cube
  const p = K.pathAt(t, PATH);
  add(p[0] + p[1] + 1.2, () => {
    const [hx, hy] = K.iso(p[0] + 0.25, p[1] + 0.25, p[2] + 0.25);
    K.halo(ctx, hx, hy, 85, 0.85, '110,231,255');
    K.box(ctx, p[0], p[1], p[2], 0.55, 0.55, 0.55, '#55D6FF', { top: '#FFFFFF' });
  });

  D.sort((a, b) => a[0] - b[0]).forEach(([, fn]) => fn());
}

export function render(t) {
  K.stage(ctx, t, 0);
  const cam = camAt(t);
  ctx.setTransform(cam.z, 0, 0, cam.z, 540 - cam.x * cam.z, 900 - cam.y * cam.z);
  drawWorld(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

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
    const pHook = K.sp(t, 0.4 + i * 0.12, 0.45, 0.55) * (1 - prog(t, C.waduk.start - 0.4, C.waduk.start));
    const pLive = env(t, CHECKS[i] - 1.2, CHECKS[i] + 2.8, 0.25, 0.3) * (1 - ov);
    const pEnd = K.sp(t, C.akhir.start + 0.1 + i * 0.1, 0.45, 0.55);
    const p = Math.max(pHook, pLive, pEnd);
    if (p > 0.01 && x > -200 && x < 1280) {
      K.tag(hud, x, y, s.n, s.name, { p, lift: 75 + 35 * (1 - ov), size: ov > 0.5 ? 25 : 31, badge: P.sky, done: t > CHECKS[i] });
    }
  });

  // Top HUD Card: Lacak Aliran Air PDAM
  const doneCount = CHECKS.filter((s) => t >= s).length;
  hud.save();
  AM.lib.roundRect(hud, 60, 80, 960, 190, 30);
  hud.fillStyle = 'rgba(244,241,234,0.96)';
  hud.fill();
  hud.font = "800 36px 'Inter'";
  hud.fillStyle = P.ink;
  hud.textBaseline = 'middle';
  hud.fillText('Jaringan Air Bersih Kota', 96, 128);
  hud.font = "700 28px 'JetBrains Mono'";
  hud.textAlign = 'right';
  hud.fillText(`TAHAP ${String(doneCount).padStart(2, '0')}/06`, 984, 128);
  const prgs = clamp((doneCount - 1) / 5);
  hud.fillStyle = '#D9DDEA';
  hud.fillRect(130, 186, 820, 8);
  hud.fillStyle = P.blue;
  hud.fillRect(130, 186, 820 * (doneCount ? prgs : 0), 8);
  hud.textAlign = 'center';
  hud.font = "700 20px 'Inter'";
  for (let i = 0; i < 6; i++) {
    const x = 130 + i * 164,
      on = doneCount > i;
    hud.fillStyle = on ? P.blue : '#D9DDEA';
    hud.beginPath();
    hud.arc(x, 190, on ? 13 : 10, 0, Math.PI * 2);
    hud.fill();
    hud.fillStyle = on ? P.ink : '#9AA0B8';
    hud.fillText(STOPS[i].name, x, 236);
  }
  hud.restore();
}

