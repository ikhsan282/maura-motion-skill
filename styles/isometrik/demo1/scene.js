// Isometrik — Demo 1 (~64s): "Perjalanan Paketmu dari Gudang ke Pintu"
import * as K from '/styles/isometrik/kit.js';
const { clamp, lerp, ease, env, prog } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'bold', y: 1470, size: 68 } };

let ctx, hud;
const C = {};
const W = (id, w) => AM.wordTime(id, w);
let PATH = [], TR = [], BK = [], CAMZ = [], OV = [], SCANS = [], T = {};
const STOPS = [
  { n: 1, name: 'Gudang', g: [2.5, -1.5, 2.6] },
  { n: 2, name: 'Sortir', g: [9.6, 0.5, 2.2] },
  { n: 3, name: 'Truk', g: [20, 5.5, 2.2] },
  { n: 4, name: 'Hub kota', g: [34.5, 3.5, 2.6] },
  { n: 5, name: 'Kurir', g: [37, 7.5, 1.8] },
  { n: 6, name: 'Pintu', g: [41.6, 6.0, 2.8] },
];

export async function setup(AM) {
  ctx = AM.layer('world');
  hud = AM.layer('hud');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const hEnd = C.gudang.start - 0.15;
  T = {
    hEnd,
    take: W('gudang', 'diambil'),
    pack: W('gudang', 'dikemas'),
    scan1: W('gudang', 'dipindai'),
    read: W('sortir', 'labelnya'),
    pick: W('sortir', 'memilih'),
    load: W('sortir', 'truk') + 0.05,
    drive0: C.truk.start - 0.05,
    drive1: C.truk.end - 0.05,
    unload: C.kurir.start + 0.05,
    door: W('kurir', 'pintumu'),
    loc: W('akhir', 'lokasinya'),
    isi: W('akhir', 'Tak'),
  };
  T.ride0 = T.unload + 0.9;
  T.ride1 = Math.max(T.ride0 + 2.0, T.door - 1.1);

  PATH = [
    [0, 1.3, -1.6, 1.25],
    [T.take - 0.25, 1.3, -1.6, 1.25],
    [T.take + 0.35, 2.4, -0.4, 0.8],
    [T.pack - 0.1, 3.9, 1.3, 0.75],
    [T.scan1 - 0.6, 5.0, 1.3, 0.45],
    [T.scan1, 6.3, 1.3, 0.45],
    [C.sortir.start + 0.3, 8.0, 1.3, 0.45],
    [T.read, 9.6, 1.3, 0.45],
    [T.pick, 10.6, 1.3, 0.45],
    [T.load - 0.4, 10.6, 4.4, 0.45],
    [T.load, 11.2, 5.3, 0.9],
  ];
  TR = [
    [0, 11, 5, 0],
    [T.drive0, 11, 5, 0],
    [T.drive1, 30, 5, 0],
  ];
  BK = [
    [0, 33.4, 7.2, 0],
    [T.ride0, 33.4, 7.2, 0],
    [T.ride1, 40.2, 7.2, 0],
  ];
  CAMZ = [
    [0, 0.3],
    [hEnd - 0.1, 0.3],
    [hEnd + 0.5, 1.12],
    [C.sortir.start, 1.0],
    [C.truk.start, 0.72],
    [C.kurir.start - 0.1, 0.95],
    [T.door - 0.5, 1.2],
    [C.akhir.start - 0.1, 0.29],
    [T.isi - 0.15, 1.55],
  ];
  OV = [
    [0, 1],
    [hEnd, 0],
    [C.akhir.start - 0.1, 1],
    [T.isi - 0.15, 0],
  ];
  SCANS = [T.scan1, T.read, T.load, T.unload + 0.35, T.ride0 + 0.1, T.door];
  AM.sfx('pop', W('hook', 'berkali-kali'), { gain: 0.4 });
  AM.sfx('swoosh_up', hEnd, { gain: 0.35 });
  SCANS.forEach((s, i) => {
    if (i !== 2 && i !== 4) AM.sfx('tick', s, { gain: 0.45, pitch: 1.3 });
  });
  AM.sfx('whoosh', T.drive0 + 0.2, { gain: 0.35, pitch: 0.8 });
  AM.sfx('ding', T.door + 0.1, { gain: 0.45 });
}

const night = (t) => env(t, C.truk.start - 0.15, C.kurir.start + 0.05, 0.6, 0.6);
const truckAt = (t) => K.pathAt(t, TR, ease.inOutSine);
const bikeAt = (t) => K.pathAt(t, BK, ease.inOutSine);
function parcelAt(t) {
  if (t < T.load + 0.05) return { g: K.pathAt(t, PATH), vis: true, boxed: t > T.pack };
  if (t < T.unload) {
    const [x, y] = truckAt(t);
    return { g: [x + 0.4, y + 0.3, 0.9], vis: false, boxed: true };
  }
  if (t < T.ride0 - 0.1) {
    const u = ease.inOutCubic(clamp((t - T.unload) / 0.6));
    return { g: [lerp(31.2, 32.6, u), lerp(5.6, 6.3, u), 0], vis: true, boxed: true };
  }
  if (t < T.ride1 + 0.1) {
    const [x, y] = bikeAt(t);
    const u = clamp((t - T.ride0) / 0.4);
    return {
      g: [lerp(32.6, x, ease.inOutCubic(u)), lerp(6.3, y + 0.1, u), lerp(0, 0.8, Math.sin((u * Math.PI) / 2))],
      vis: true,
      boxed: true,
    };
  }
  const u = ease.inOutCubic(clamp((t - (T.ride1 + 0.1)) / Math.max(0.25, T.door - 0.15 - (T.ride1 + 0.1))));
  return { g: [lerp(40.2, 41.25, u), lerp(7.3, 7.15, u), lerp(0.8, 0, u)], vis: true, boxed: true };
}

let cam = { x: 0, y: 0, z: 1 };
function camAt(t) {
  let sx = 0,
    sy = 0;
  for (let i = 0; i < 6; i++) {
    const p = parcelAt(t - i * 0.1).g;
    const [x, y] = K.iso(p[0] + 0.2, p[1] + 0.2, p[2]);
    sx += x;
    sy += y;
  }
  const fx = sx / 6,
    fy = sy / 6 - 60;
  const ov = clamp(K.springKeys(t, OV, { z: 1, ts: 0.9 }));
  const [ox, oy] = [1180, 760];
  const z = Math.exp(K.springKeys(t, CAMZ.map(([a, b]) => [a, Math.log(b)]), { z: 1, ts: 0.9 }));
  return { x: lerp(fx, ox, ov), y: lerp(fy, oy, ov), z };
}

function world(t) {
  const n = night(t);
  K.slab(ctx, -1, -3, 8, 6, '#C9D2E8');
  K.slab(ctx, 7.5, -1, 8, 5.2, '#B7C3E0');
  K.slab(ctx, 7.5, 4.6, 37, 1.8, P.asphalt);
  K.onPlane(ctx, 0.001, (g) => {
    g.fillStyle = 'rgba(245,241,230,0.5)';
    for (let x = 14; x < 44; x += 1.2) g.fillRect(x, 5.48, 0.6, 0.06);
  });
  K.slab(ctx, 31, 2.4, 6, 2.1, '#B7C3E0');
  K.slab(ctx, 31, 6.6, 13, 1.4, '#3A4470');
  K.slab(ctx, 39.8, 4.2, 3.5, 2.4, '#3C8F6E');
  const D = [];
  const add = (d, fn) => D.push([d, fn]);
  for (let r = 0; r < 3; r++)
    add(r * 1.2 - 2.5 + 0.5, () => {
      K.box(ctx, r * 1.2 - 0.6 + 0.6, -2.6, 0, 0.9, 0.7, 1.9, '#5B8CFF');
      for (let k = 0; k < 3; k++)
        K.box(ctx, r * 1.2 + 0.1, -2.5, 0.35 + k * 0.55, 0.3, 0.3, 0.25, [P.orange, P.pink, P.yellow, P.mint][(r + k) % 4]);
    });
  add(0.5, () => K.box(ctx, 0.6, -2.0, 0, 1.2, 0.3, 1.25, '#8FA9FF'));
  add(4.2 + 1.3, () => K.box(ctx, 3.5, 0.9, 0, 1.2, 0.9, 0.7, '#F4F1EA'));
  add(5 + 1.8, () => K.conveyor(ctx, 4.8, 7.5, 1.3, t));
  add(6.4 + 1.4, () => {
    K.box(ctx, 6.2, 0.9, 0, 0.15, 0.15, 1.3, '#FF4D5E');
    K.box(ctx, 6.2, 2.25, 0, 0.15, 0.15, 1.3, '#FF4D5E');
    K.box(ctx, 6.2, 0.9, 1.3, 0.15, 1.5, 0.15, '#FF4D5E');
  });
  const pickWalk = env(t, T.take - 0.5, T.pack, 0.1, 0.1);
  add(1.9 - 0.6 + 0.1, () =>
    K.person(ctx, lerp(1.5, 2.4, prog(t, T.take - 0.5, T.take, ease.inOutCubic)), -0.6, 0, P.yellow, t, { walk: pickWalk })
  );
  add(4.5 + 1.9, () => K.person(ctx, 4.3, 1.9, 0, P.pink, t, { walk: 0 }));
  add(8 + 1.8, () => K.conveyor(ctx, 7.8, 15, 1.3, t, { speed: 1.6 }));
  add(9.6 + 1.8, () => {
    K.box(ctx, 9.3, 1.0, 0.45, 0.6, 1.2, 0.95, '#9B87FF', { alpha: 0.85 });
  });
  add(10.6 + 3, () => K.conveyor(ctx, 2.3, 4.6, 10.1, t, { axis: 'y' }));
  add(12 + 0.2, () => K.person(ctx, 12, 0.2, 0, P.mint, t));
  add(16.5 + 5.5, () => K.truck(ctx, 14.5, 5.0, t, { color: '#DDE4F5', night: n }));
  const [tx, ty] = truckAt(t),
    moving = t > T.drive0 && t < T.drive1 ? 1 : 0;
  add(tx + 1.5 + ty + 0.5, () => K.truck(ctx, tx, ty, t, { night: n, moving }));
  for (let x = 16; x < 31; x += 4) add(x + 4.4, () => K.lamp(ctx, x, 4.3, n));
  for (let x = 17; x < 30; x += 3.3) add(x + 7.6, () => K.tree(ctx, x, 7.0, { s: 0.9 + (x % 2) * 0.2 }));
  for (let x = 9; x < 30; x += 5.1) add(x - 1.6, () => K.tree(ctx, x, -2.2, { s: 1.1 }));
  add(34.5 + 1.6, () => {
    K.box(ctx, 32.6, 0.0, 0, 4, 2.3, 1.8, '#F4F1EA');
    K.onPlane(ctx, 1.8, (g) => {
      g.fillStyle = P.orange;
      g.fillRect(33, 0.5, 3.2, 0.5);
    });
  });
  add(32.8 + 6.4, () =>
    K.person(ctx, 32.4, 6.6, 0, P.yellow, t, { walk: env(t, T.unload - 0.1, T.ride0, 0.1, 0.1) })
  );
  const [bx, by] = bikeAt(t),
    riding = t > T.ride0 && t < T.ride1 ? 1 : 0;
  const onBike = t < T.ride1 + 0.1;
  add(bx + by + 0.6, () => K.bike(ctx, bx, by, t, { moving: riding, rider: onBike ? P.mint : null }));
  if (!onBike) {
    const wu = clamp((t - (T.ride1 + 0.1)) / 0.8);
    add(41 + 7.2, () => K.person(ctx, lerp(40.9, 41.0, wu), lerp(7.5, 7.7, wu), 0, P.mint, t, { walk: wu < 1 ? 1 : 0 }));
  }
  add(41.6 + 6, () => K.house(ctx, 40.6, 5.0, { color: P.cream, roof: P.red }));
  add(38.2 + 4.5, () => K.house(ctx, 37.2, 3.5, { color: '#BFD7FF', roof: P.violet }));
  add(44 + 5, () => K.tree(ctx, 43.4, 5.4, { s: 1.2 }));
  const pc = parcelAt(t);
  if (pc.vis) {
    const [x, y, z] = pc.g;
    add(x + y + 0.75, () => {
      if (pc.boxed) K.parcel(ctx, x, y, z, { glow: 0.55 + 0.25 * Math.sin(t * 4) });
      else K.box(ctx, x, y, z, 0.32, 0.32, 0.32, P.pink);
    });
  }
  D.sort((a, b) => a[0] - b[0]).forEach(([, fn]) => fn());
}

export function render(t) {
  const n = night(t);
  K.stage(ctx, t, n);
  cam = camAt(t);
  ctx.setTransform(cam.z, 0, 0, cam.z, 540 - cam.x * cam.z, 900 - cam.y * cam.z);
  world(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (n > 0) {
    ctx.fillStyle = `rgba(8,12,40,${0.42 * n})`;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.setTransform(cam.z, 0, 0, cam.z, 540 - cam.x * cam.z, 900 - cam.y * cam.z);
    const [tx, ty] = truckAt(t),
      [hx, hy] = K.iso(tx + 3.1, ty + 0.5, 0.45);
    K.halo(ctx, hx + 70, hy + 35, 160, n * 0.9, '255,236,170');
    for (let x = 16; x < 31; x += 4) {
      const [lx, ly] = K.iso(x + 0.05, 4.35, 1.65);
      K.halo(ctx, lx, ly + 30, 80, n * 0.7, '255,226,150');
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  const S = (g) => {
    const [x, y] = K.iso(...g);
    return [x * cam.z + 540 - cam.x * cam.z, y * cam.z + 900 - cam.y * cam.z];
  };
  const pc = parcelAt(t);
  SCANS.forEach((s) => {
    const age = t - s;
    if (age < -0.1 || age > 0.8) return;
    const [px, py] = S([pc.g[0] + 0.2, pc.g[1] + 0.2, pc.g[2] + 0.4]);
    K.scan(hud, px + 90 * cam.z, py - 140 * cam.z, px, py, age);
    K.beep(hud, px, py - 30, age);
  });
  const ov = clamp(K.springKeys(t, OV, { z: 1, ts: 0.9 }));
  const reached = SCANS;
  STOPS.forEach((s, i) => {
    const [x, y] = S(s.g);
    const pHook = K.sp(t, W('hook', 'berkali-kali') - 0.3 + i * 0.12, 0.45, 0.55) * (1 - prog(t, T.hEnd - 0.3, T.hEnd));
    const pLive = env(t, reached[i] - 0.8, reached[i] + 2.5, 0.25, 0.3) * (1 - ov);
    const pEnd = K.sp(t, C.akhir.start + 0.1 + i * 0.1, 0.45, 0.55) * (1 - prog(t, T.isi - 0.3, T.isi));
    const p = Math.max(pHook, pLive, pEnd);
    if (p > 0.01 && x > -200 && x < 1280)
      K.tag(hud, x, y, s.n, s.name, { p, lift: 70 + 40 * (1 - ov), size: ov > 0.5 ? 26 : 32, done: t > reached[i] });
  });
  const scans = SCANS.filter((s) => t >= s).length;
  hud.save();
  AM.lib.roundRect(hud, 60, 80, 960, 190, 30);
  hud.fillStyle = 'rgba(244,241,234,0.96)';
  hud.fill();
  hud.font = "800 36px 'Inter'";
  hud.fillStyle = P.ink;
  hud.textBaseline = 'middle';
  hud.fillText('Lacak paket', 96, 128);
  hud.font = "700 28px 'JetBrains Mono'";
  hud.textAlign = 'right';
  hud.fillText(`PINDAIAN ${String(scans).padStart(2, '0')}`, 984, 128);
  const prgs = clamp((scans - 1) / 5);
  hud.fillStyle = '#D9DDEA';
  hud.fillRect(130, 186, 820, 8);
  hud.fillStyle = P.orange;
  hud.fillRect(130, 186, 820 * (scans ? prgs : 0), 8);
  hud.textAlign = 'center';
  hud.font = "700 21px 'Inter'";
  for (let i = 0; i < 6; i++) {
    const x = 130 + i * 164,
      on = scans > i,
      pop = on ? 1 + 0.4 * Math.exp(-(t - SCANS[i]) * 8) : 1;
    hud.fillStyle = on ? P.orange : '#D9DDEA';
    hud.beginPath();
    hud.arc(x, 190, (on ? 13 : 10) * pop, 0, Math.PI * 2);
    hud.fill();
    hud.fillStyle = on ? P.ink : '#9AA0B8';
    hud.fillText(STOPS[i].name, x, 236);
  }
  hud.restore();
  const q = K.sp(t, T.isi - 0.1, 0.5, 0.5);
  if (q > 0) {
    const [px, py] = S([41.45, 7.35, 0.9]);
    hud.save();
    hud.translate(px, py - 90);
    hud.scale(q, q);
    AM.lib.roundRect(hud, -70, -70, 140, 120, 30);
    hud.fillStyle = P.white;
    hud.fill();
    hud.beginPath();
    hud.moveTo(-12, 48);
    hud.lineTo(0, 70);
    hud.lineTo(12, 48);
    hud.fill();
    hud.font = "800 96px 'Inter'";
    hud.fillStyle = P.orange;
    hud.textAlign = 'center';
    hud.textBaseline = 'middle';
    hud.fillText('?', 0, -6);
    hud.restore();
    hud.save();
    hud.globalAlpha = clamp(q);
    hud.font = "800 46px 'Inter'";
    hud.fillStyle = P.white;
    hud.textAlign = 'center';
    hud.fillText('Isinya: rahasiamu.', 540, 1240);
    hud.restore();
  }
}
