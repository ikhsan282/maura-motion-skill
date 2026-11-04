// Maura Motion hello: 5 beats showcasing the full pipeline in flat-vector style.
import * as K from '/styles/flat-vector/kit.js';
const { clamp, lerp, ease, prog, TAU } = AM.lib;

export const meta = {
  fps: 24,
  captions: { preset: 'bold', y: 1470, size: 64, active: '#ffd65e', stroke: 9, strokeColor: '#0b1230', anim: 'rise', maxWords: 4 },
};

let ctx, fx;
const C = {};
const W = (id, word) => AM.wordTime(id, word);
let B = {};
let WALK = [];

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const line of AM.timeline.lines) C[line.id] = line;
  const start = (id) => C[id].start - 0.12;
  B = {
    hook: [0, start('pilih')],
    pilih: [start('pilih'), start('tengah')],
    tengah: [start('tengah'), start('suara')],
    suara: [start('suara'), start('akhir')],
    akhir: [start('akhir'), AM.duration + 1],
  };
  WALK = K.boundedWalk(7, 55, 65, (x, y) => Math.hypot(x - 540, y - 920) < 250, 380, 960, [6, -2]);
  AM.sfx('pop', 0.45, { gain: 0.45 });
  AM.sfx('whoosh', W('hook', 'Tanpa') - 0.08, { gain: 0.35 });
  AM.sfx('pop', B.pilih[0] + 0.18, { gain: 0.4 });
  AM.sfx('swoosh_up', B.tengah[0] + 0.15, { gain: 0.35 });
  AM.sfx('magic', B.suara[0] + 0.2, { gain: 0.38 });
  AM.sfx('chime', W('akhir', 'idemu'), { gain: 0.45 });
}

const reset = () => ctx.setTransform(1, 0, 0, 1, 0, 0);
const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });

function background(t) {
  K.space(ctx, t, { px: t * 10, py: t * 4 });
  // Ambient nebula glows + celestial bodies placed in upper corners clear of the headline band (y=340..580)
  K.glow(ctx, 890, 195, 240, '#8f7bff', 0.26);
  K.glow(ctx, 190, 1280, 290, '#3fd6c6', 0.14);
  K.earth(ctx, 890, 195, 58, t, { spin: 0.3, night: 0.45, glowA: 0.85 });
  K.glow(ctx, 175, 205, 110, '#ffa63f', 0.35);
  K.ball(ctx, 175, 205, 34, '#fff7d1', '#ffa63f');
}

// 1. Hook: "Satu naskah, jadi video animasi. Tanpa gambar manual, tanpa editor."
shot('hook', (t, a, b) => {
  background(t);
  const u = clamp((t - a) / 0.72);
  const p = ease.outBack(u, 1.8);
  const x = lerp(-120, 540, p);
  const y = 930 + Math.sin(t * 4.2) * 14;
  // Dynamic horizontal speed so photon stretches only while dashing in, then settles round & bouncy
  const vx = (1 - u) * 1800;
  if (u < 0.95) K.speedLines(ctx, x - 40, y, 0, t, { n: 6, len: 200, spread: 55 });
  K.ring(ctx, 540, 930, t - (a + 0.58), { r: 190, color: '#ffd65e', life: 0.45, w: 7 });
  K.burst(ctx, 540, 930, t - (a + 0.58), { n: 10, r0: 95, r1: 210, color: '#fff3b0', life: 0.5 });

  const tTanpa = W('hook', 'Tanpa') - 0.1;
  K.photon(ctx, x, y, {
    r: 104,
    t,
    vx,
    vy: 0,
    heat: 1,
    mood: t >= tTanpa ? 'joy' : 'happy',
    look: u < 0.9 ? [0.6, 0] : [0, -0.15],
  });

  reset();
  K.headline(ctx, 'SATU NASKAH', 540, 360, { size: 96, p: K.pop(t, a + 0.12, 0.45), accent: '#ffd65e' });
  K.badge(ctx, 'jadi video animasi utuh', 540, 485, {
    p: K.pop(t, a + 0.35, 0.45),
    size: 42,
    bg: 'rgba(63,214,198,.22)',
    fg: '#7af0b0',
    accent: '#3fd6c6',
  });
  if (t >= tTanpa) {
    K.badge(ctx, 'Tanpa Gambar Manual  ·  Tanpa Editor', 540, 1210, {
      p: K.pop(t, tTanpa, 0.42),
      size: 38,
      bg: 'rgba(255,214,94,.18)',
      fg: '#ffd65e',
    });
  }
});

// 2. Pilih: "Pilih dari 77 gaya: anime, wayang, flat vector, stickman kisah, dan lainnya."
shot('pilih', (t, a, b) => {
  background(t);
  const styles = [
    { label: 'ANIME SINEMATIK', col: '#ff6f91', t0: W('pilih', 'anime') - 0.15 },
    { label: 'WAYANG KULIT', col: '#ffd65e', t0: W('pilih', 'wayang') - 0.15 },
    { label: 'FLAT VECTOR', col: '#3fd6c6', t0: W('pilih', 'flat') - 0.15, active: true },
    { label: 'STICKMAN KISAH', col: '#6cc8ff', t0: W('pilih', 'stickman') - 0.15 },
  ];

  styles.forEach((s, i) => {
    const y = 600 + i * 138;
    const pp = K.pop(t, Math.max(a + 0.12 + i * 0.14, s.t0), 0.4);
    if (pp > 0.001) {
      ctx.save();
      ctx.translate(540, y);
      ctx.scale(pp, pp);
      ctx.fillStyle = 'rgba(4,8,30,.4)';
      AM.lib.roundRect(ctx, -356, -48, 720, 108, 54);
      ctx.fill();
      ctx.fillStyle = s.active ? 'rgba(63,214,198,.94)' : 'rgba(255,255,255,.13)';
      AM.lib.roundRect(ctx, -360, -54, 720, 108, 54);
      ctx.fill();
      // Accent circle on the left
      ctx.fillStyle = s.active ? '#06231f' : s.col;
      ctx.beginPath();
      ctx.arc(-290, 0, 16, 0, TAU);
      ctx.fill();
      // Crisp centered label
      ctx.fillStyle = s.active ? '#06231f' : '#ffffff';
      ctx.font = '800 44px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label, 14, 2);
      ctx.restore();
    }
  });

  // Mascot at bottom looking up at the style cards
  K.photon(ctx, 540, 1255 + Math.sin(t * 4.5) * 10, {
    r: 76,
    t,
    vx: 0,
    vy: 0,
    heat: 0.9,
    mood: 'happy',
    look: [Math.sin(t * 2) * 0.4, -0.65],
  });

  reset();
  K.headline(ctx, '77 GAYA VISUAL', 540, 350, { size: 84, p: K.pop(t, a + 0.08, 0.42), accent: '#ffd65e' });
  K.badge(ctx, '65 gaya siap render langsung', 540, 465, {
    p: K.pop(t, a + 0.25, 0.4),
    size: 38,
    bg: 'rgba(255,255,255,.14)',
    fg: '#ffffff',
    accent: '#7af0b0',
  });
});

// 3. Tengah: "Tulis ceritamu, mesin yang menggambar setiap adegan sampai jadi."
shot('tengah', (t, a, b) => {
  background(t);
  K.plasma(ctx, t, { x: 140, y: 620, w: 800, h: 640, n: 28, cols: ['#3fd6c6', '#8f7bff', '#ffd65e'], rmin: 6, rmax: 14, alpha: 0.35, avoid: [540, 920, 160] });

  // Canvas frame where the engine draws scenes automatically
  const fp = K.pop(t, a + 0.1, 0.45);
  ctx.save();
  ctx.translate(540, 920);
  ctx.scale(fp, fp);
  ctx.fillStyle = 'rgba(13,27,62,.75)';
  AM.lib.roundRect(ctx, -340, -250, 680, 500, 42);
  ctx.fill();
  ctx.strokeStyle = 'rgba(63,214,198,.55)';
  ctx.lineWidth = 6;
  AM.lib.roundRect(ctx, -340, -250, 680, 500, 42);
  ctx.stroke();
  ctx.restore();

  const u = clamp((t - a - 0.15) / (b - a - 0.35));
  const stepU = u * (WALK.length - 1);
  const pos = K.along(WALK, stepU);
  K.trail(ctx, WALK, stepU, { color: '#3fd6c6', width: 9, fade: 28, alpha: 0.9 });
  K.photon(ctx, pos.x, pos.y, {
    r: 82,
    t,
    vx: pos.dx * 12,
    vy: pos.dy * 12,
    heat: 0.75,
    mood: u > 0.85 ? 'joy' : 'wow',
    look: [clamp(pos.dx / 40, -1, 1), clamp(pos.dy / 40, -1, 1)],
  });

  reset();
  K.headline(ctx, 'TULIS CERITAMU', 540, 355, { size: 84, p: K.pop(t, a + 0.08, 0.42), accent: '#3fd6c6' });
  K.badge(ctx, 'mesin yang menggambar tiap adegan', 540, 470, { p: K.pop(t, a + 0.28, 0.42), size: 38 });
  const pct = Math.round(lerp(12, 100, ease.outCubic(u)));
  K.counter(ctx, pct, 540, 1265, { size: 76, suffix: '% SELESAI', color: '#ffd65e', p: K.pop(t, a + 0.2, 0.4) });
});

// 4. Suara: "Narasi ElevenLabs, musik dan caption otomatis ikut jadi."
shot('suara', (t, a, b) => {
  background(t);
  // Concentric sound wave rings
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.85 + i / 3) % 1;
    ctx.save();
    ctx.globalAlpha = (1 - ph) * 0.75;
    ctx.strokeStyle = i % 2 ? '#3fd6c6' : '#ffd65e';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(540, 850, 90 + ph * 250, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  // Equalizer bars left & right of mascot
  ctx.save();
  for (const side of [-1, 1]) {
    for (let k = 0; k < 5; k++) {
      const x = 540 + side * (165 + k * 34);
      const h = 36 + Math.abs(Math.sin(t * 9 + k * 1.1 + side)) * 110;
      ctx.fillStyle = k % 2 ? '#ffd65e' : '#3fd6c6';
      AM.lib.roundRect(ctx, x - 9, 850 - h / 2, 18, h, 9);
      ctx.fill();
    }
  }
  ctx.restore();

  K.photon(ctx, 540, 850, { r: 96, t, vx: 0, vy: 0, heat: 0.6, mood: 'joy', look: [0, 0] });

  reset();
  K.headline(ctx, 'AUDIO & CAPTION', 540, 355, { size: 84, p: K.pop(t, a + 0.08, 0.42), accent: '#ffd65e' });
  K.badge(ctx, 'otomatis ikut tersinkronisasi', 540, 470, { p: K.pop(t, a + 0.25, 0.4), size: 38 });

  const tMus = W('suara', 'musik') - 0.15;
  const tCap = W('suara', 'caption') - 0.15;
  K.badge(ctx, 'Narasi ElevenLabs (George)', 540, 1140, {
    p: K.pop(t, a + 0.15, 0.4),
    size: 38,
    bg: 'rgba(255,214,94,.92)',
    fg: '#2a1604',
  });
  K.badge(ctx, 'Musik & SFX Otomatis (-14 LUFS)', 540, 1235, {
    p: K.pop(t, tMus, 0.4),
    size: 36,
    bg: 'rgba(63,214,198,.9)',
    fg: '#06231f',
  });
  K.badge(ctx, 'Caption Per Kata Presisi', 540, 1325, {
    p: K.pop(t, tCap, 0.4),
    size: 36,
    bg: 'rgba(143,123,255,.9)',
    fg: '#ffffff',
  });
});

// 5. Akhir: "Maura Motion: idemu, tayang hari ini."
shot('akhir', (t, a, b) => {
  background(t);
  const p = K.pop(t, a + 0.08, 0.5);
  K.glow(ctx, 540, 930, 340, '#ffd65e', 0.35 * clamp(p));
  K.burst(ctx, 540, 930, (t - a - 0.15) % 0.9, { n: 12, r0: 130, r1: 270, color: '#ffd65e', life: 0.85, w: 6 });
  K.photon(ctx, 540, 930 + Math.sin(t * 4) * 12, {
    r: 118,
    t,
    vx: 0,
    vy: 0,
    heat: 1,
    mood: 'joy',
    look: [0, 0],
  });

  reset();
  K.headline(ctx, 'MAURA MOTION', 540, 365, { size: 94, p, accent: '#3fd6c6' });
  const tIde = W('akhir', 'idemu') - 0.15;
  K.headline(ctx, 'IDEMU, TAYANG HARI INI', 540, 485, {
    size: 52,
    p: K.pop(t, tIde, 0.45),
    accent: '#ffd65e',
  });
  K.badge(ctx, 'Siap untuk TikTok · Reels · Shorts', 540, 1230, {
    p: K.pop(t, tIde + 0.15, 0.45),
    size: 38,
    bg: 'rgba(255,255,255,.15)',
    fg: '#ffffff',
    accent: '#3fd6c6',
  });
});

export function render(t, AM) {
  let current = SHOTS[0];
  for (const s of SHOTS) if (t >= B[s.id][0]) current = s;
  const [a, b] = B[current.id];
  ctx.save();
  current.fn(t, Math.max(0, a), b);
  ctx.restore();
  reset();
  ctx.globalAlpha = 1;
  AM.lib.vignette(fx, { strength: 0.3, inner: 0.5, color: '4,6,26' });
}
