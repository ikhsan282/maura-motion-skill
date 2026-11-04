// Swiss / Bauhaus Grid — Demo 1: Bauhaus: Sekolah 14 Tahun yang Mengubah Desain Dunia
import * as K from '/styles/swiss-bauhaus/kit.js';
const { clamp, lerp, ease, prog } = AM.lib;

export const meta = { fps: 24, captions: { preset: 'clean', y: 1520, size: 54 } };

let ctx;
const C = {};

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

const SHOTS = [];
const shot = (id, fn) => SHOTS.push({ id, fn });
const span = (id) => {
  const L = SHOTS.filter((x) => C[x.id]);
  const i = L.findIndex((x) => x.id === id);
  return [C[id].start - 0.12, L[i + 1] ? C[L[i + 1].id].start - 0.12 : AM.duration + 1];
};

// Shot 1: Hook — 14 Years That Changed Design
shot('hook', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'BAUHAUS · WEIMAR / DESSAU', step: 1, total: 6 });
  K.drawSwissHeader(ctx, '14 THN', 'SATU SEKOLAH', 'UBAH DUNIA.', '1919–1933 · Revolusi Desain Modern', prog(t, a, a + 0.5), K.PAL.red);
  K.drawKandinskyTriad(ctx, 540, 860, 1.0, t, prog(t, a + 0.15, a + 0.8));

  K.card(ctx, 540, 1270, 936, 120, K.PAL.ink);
  K.label(ctx, 'KURSI  ·  TIPOGRAFI  ·  ARSITEKTUR  ·  ANTARMUKA HP', 540, 1270, { size: 28, color: K.PAL.paper, mono: true });
});

// Shot 2: Bauhaus 1919 — Walter Gropius & Dessau Building
shot('bauhaus', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'STAATLICHES BAUHAUS · 1919', step: 2, total: 6 });
  K.drawSwissHeader(ctx, '1919', 'WALTER GROPIUS', 'WEIMAR & DESSAU.', 'Menyatukan Seni Rupa & Pertukangan', prog(t, a, a + 0.5), K.PAL.blue);
  K.drawBauhausBuilding(ctx, 540, 870, 1.05, t, prog(t, a + 0.15, a + 0.8));

  K.card(ctx, 540, 1270, 936, 110, K.PAL.yellow, { stroke: K.PAL.ink, lw: 6 });
  K.label(ctx, 'DINDING TIRAI KACA & STRUKTUR BAJA MODERN', 540, 1270, { size: 30, color: K.PAL.ink, mono: true });
});

// Shot 3: Aturan — Form Follows Function & Kandinsky Triad
shot('aturan', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'FORM FOLLOWS FUNCTION · 1923', step: 3, total: 6 });
  K.drawSwissHeader(ctx, '3 WUJUD', 'BENTUK IKUTI', 'FUNGSI.', 'Kandinsky: Segitiga Kuning · Persegi Merah · Lingkaran Biru', prog(t, a, a + 0.5), K.PAL.yellow);

  const p = prog(t, a + 0.15, a + 0.85);
  // Three modular columns for the 3 primary shapes
  const items = [
    { x: 228, col: K.PAL.yellow, name: 'SEGITIGA', sub: 'KUNING · TAJAM', shape: 'tri' },
    { x: 540, col: K.PAL.red, name: 'PERSEGI', sub: 'MERAH · KOKOH', shape: 'sq' },
    { x: 852, col: K.PAL.blue, name: 'LINGKARAN', sub: 'BIRU · TENANG', shape: 'cir' },
  ];
  items.forEach((it, i) => {
    const kp = ease.outBack(clamp(p * 1.3 - i * 0.15), 1.2);
    ctx.save();
    ctx.translate(it.x, 820);
    ctx.scale(kp, kp);
    K.card(ctx, 0, 0, 286, 560, '#ffffff', { stroke: K.PAL.ink, lw: 7 });
    ctx.fillStyle = it.col;
    ctx.strokeStyle = K.PAL.ink;
    ctx.lineWidth = 7;
    if (it.shape === 'tri') {
      ctx.beginPath();
      ctx.moveTo(0, -170);
      ctx.lineTo(110, 40);
      ctx.lineTo(-110, 40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (it.shape === 'sq') {
      ctx.fillRect(-100, -165, 200, 200);
      ctx.strokeRect(-100, -165, 200, 200);
    } else {
      ctx.beginPath();
      ctx.arc(0, -65, 105, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    K.label(ctx, it.name, 0, 140, { size: 34, color: K.PAL.ink });
    K.label(ctx, it.sub, 0, 195, { size: 20, color: K.PAL.grey, mono: true });
    ctx.restore();
  });
});

// Shot 4: Karya — Wagenfeld Lamp & Breuer Wassily Chair
shot('karya', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'DESAIN INDUSTRI · DESSAU 1924', step: 4, total: 6 });
  K.drawSwissHeader(ctx, 'IKONIK', 'LAMPU KACA &', 'KURSI PIPA BAJA.', 'Wagenfeld WG24 & Marcel Breuer B3', prog(t, a, a + 0.5), K.PAL.red);
  K.drawBauhausProducts(ctx, 540, 850, 1.08, t, prog(t, a + 0.15, a + 0.8));

  K.card(ctx, 540, 1270, 936, 110, K.PAL.ink);
  K.label(ctx, 'DIPRODUKSI MASSAL & MASIH DIPAKAI SEABAD KEMUDIAN', 540, 1270, { size: 26, color: K.PAL.paper, mono: true });
});

// Shot 5: Tutup 1933 — Closed in 1933
shot('tutup', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'PENUTUPAN BERLIN · 1933', step: 5, total: 6 });
  K.drawSwissHeader(ctx, '1933', 'DITUTUP PAKSA,', 'MENYEBAR KE DUNIA.', 'Hanya Beroperasi Selama 14 Tahun (1919–1933)', prog(t, a, a + 0.5), K.PAL.ink);
  K.drawBauhausBuilding(ctx, 540, 850, 1.0, t, 1);

  // Diagonal red constructivist strike bars
  const p = ease.outExpo(prog(t, a + 0.35, a + 1.0));
  ctx.save();
  ctx.translate(540, 850);
  ctx.rotate(-0.28);
  ctx.fillStyle = K.PAL.red;
  ctx.fillRect(-460, -42, 920 * p, 84);
  if (p > 0.4) {
    K.label(ctx, '1933 · KAMPUS DITUTUP', 0, 0, { size: 42, color: '#ffffff', mono: true });
  }
  ctx.restore();
});

// Shot 6: Akhir — Swiss Grid & Modern Smartphone UI
shot('akhir', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'WARISAN ABADI · SWISS GRID & UI', step: 6, total: 6 });
  K.drawSwissHeader(ctx, 'ABADI', 'HIDUP DI SETIAP', 'LAYAR HP-MU.', 'Dari Weimar & Zurich ke Desain Antarmuka Digital', prog(t, a, a + 0.5), K.PAL.blue);
  K.drawSwissArcs(ctx, 540, 840, 1.05, t, prog(t, a + 0.1, a + 0.8));

  K.card(ctx, 540, 1265, 936, 120, K.PAL.red, { stroke: K.PAL.ink, lw: 6 });
  K.label(ctx, 'BAUHAUS (1919–1933)  →  SWISS STYLE  →  UI MODERN', 540, 1265, { size: 28, color: '#ffffff', mono: true });
});

export function render(t, AM) {
  let s = SHOTS.find((x) => C[x.id]);
  for (const sh of SHOTS) if (C[sh.id] && t >= C[sh.id].start - 0.12) s = sh;
  const [a, b] = span(s.id);
  ctx.save();
  s.fn(t, Math.max(0, a), b);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
