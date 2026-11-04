// Swiss / Bauhaus Grid — Demo 3: Eksperimen Tiga Warna Primer Kandinsky 1923
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

// Shot 1: Hook — 3 Uncolored Outlined Shapes Question
shot('hook', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'TES VISUAL BAUHAUS · WEIMAR 1923', step: 1, total: 8 });
  K.drawSwissHeader(ctx, 'KUIS', '3 BENTUK DASAR,', '3 WARNA PRIMER.', 'Pasangkan Segitiga, Persegi, dan Lingkaran!', prog(t, a, a + 0.5), K.PAL.ink);

  const p = prog(t, a + 0.15, a + 0.85);
  const xs = [228, 540, 852];
  xs.forEach((x, i) => {
    K.card(ctx, x, 780, 286 * p, 420 * p, '#ffffff', { stroke: K.PAL.ink, lw: 7 });
    ctx.strokeStyle = K.PAL.ink;
    ctx.lineWidth = 9;
    if (i === 0) {
      ctx.beginPath();
      ctx.moveTo(x, 650);
      ctx.lineTo(x + 95, 830);
      ctx.lineTo(x - 95, 830);
      ctx.closePath();
      ctx.stroke();
    } else if (i === 1) {
      ctx.strokeRect(x - 85, 655, 170, 170);
    } else {
      ctx.beginPath();
      ctx.arc(x, 740, 90, 0, Math.PI * 2);
      ctx.stroke();
    }
    K.label(ctx, 'WARNA APA?', x, 925, { size: 24, mono: true, p });
  });

  // 3 color swatches below
  const cols = [
    [228, K.PAL.yellow, 'KUNING'],
    [540, K.PAL.red, 'MERAH'],
    [852, K.PAL.blue, 'BIRU'],
  ];
  cols.forEach(([x, col, txt]) => {
    K.card(ctx, x, 1180, 286 * p, 140, col, { stroke: K.PAL.ink, lw: 6 });
    K.label(ctx, txt, x, 1180, { size: 32, color: col === K.PAL.yellow ? K.PAL.ink : '#fff', mono: true, p });
  });
});

// Shot 2: Kuesioner Kandinsky 1923
shot('kuesioner', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'WASSILY KANDINSKY · FORMULIR 1923', step: 2, total: 8 });
  K.drawSwissHeader(ctx, '1923', 'KUESIONER RESMI', 'WASSILY KANDINSKY.', 'Survei Psikologi Bentuk & Warna di Bengkel Bauhaus', prog(t, a, a + 0.5), K.PAL.red);

  const p = prog(t, a + 0.15, a + 0.85);
  K.card(ctx, 540, 860, 936 * p, 700, '#ffffff', { stroke: K.PAL.ink, lw: 8 });
  K.label(ctx, 'FORMULIR BENGKEL LUKIS DINDING BAUHAUS', 540, 580, { size: 28, mono: true, p });
  K.drawKandinskyTriad(ctx, 540, 880, 0.92, t, p);
});

// Shot 3: Kuning — Sharp 60° Triangle
shot('kuning', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'SUDUT LANCIP 60° · ENERGI RADIASI', step: 3, total: 8 });
  K.drawSwissHeader(ctx, '60°', 'SEGITIGA TAJAM =', 'KUNING MEMANCAR.', 'Sudut Lancip Beresonansi dengan Cahaya Agresif', prog(t, a, a + 0.5), K.PAL.yellow);

  const p = ease.outBack(prog(t, a + 0.15, a + 0.8), 1.2);
  ctx.save();
  ctx.translate(540, 840);
  ctx.scale(p, p);
  K.card(ctx, 0, 0, 760, 620, '#ffffff', { stroke: K.PAL.ink, lw: 8 });
  ctx.fillStyle = K.PAL.yellow;
  ctx.strokeStyle = K.PAL.ink;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, -220);
  ctx.lineTo(230, 170);
  ctx.lineTo(-230, 170);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  K.label(ctx, 'EKSENTRIK · TAJAM · MEMANCAR KE LUAR', 0, 245, { size: 28, mono: true });
  ctx.restore();
});

// Shot 4: Merah — Solid 90° Square
shot('merah', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'SUDUT SIKU 90° · STABILITAS BUMI', step: 4, total: 8 });
  K.drawSwissHeader(ctx, '90°', 'PERSEGI KOKOH =', 'MERAH MEMBUMI.', 'Empat Sudut Siku-Siku yang Berat dan Tegas', prog(t, a, a + 0.5), K.PAL.red);

  const p = ease.outBack(prog(t, a + 0.15, a + 0.8), 1.2);
  ctx.save();
  ctx.translate(540, 840);
  ctx.scale(p, p);
  K.card(ctx, 0, 0, 760, 620, '#ffffff', { stroke: K.PAL.ink, lw: 8 });
  ctx.fillStyle = K.PAL.red;
  ctx.strokeStyle = K.PAL.ink;
  ctx.lineWidth = 10;
  ctx.fillRect(-195, -205, 390, 390);
  ctx.strokeRect(-195, -205, 390, 390);
  K.label(ctx, 'SEIMBANG · BERAT · KOKOH TAK TERGOYAHKAN', 0, 245, { size: 28, mono: true });
  ctx.restore();
});

// Shot 5: Biru — Infinite 360° Circle
shot('biru', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'BUSUR 360° · KEDALAMAN SPIRITUAL', step: 5, total: 8 });
  K.drawSwissHeader(ctx, '360°', 'LINGKARAN TENANG =', 'BIRU MENDALAM.', 'Garis Lengkung Tanpa Sudut yang Mengalir ke Dalam', prog(t, a, a + 0.5), K.PAL.blue);

  const p = ease.outBack(prog(t, a + 0.15, a + 0.8), 1.2);
  ctx.save();
  ctx.translate(540, 840);
  ctx.scale(p, p);
  K.card(ctx, 0, 0, 760, 620, '#ffffff', { stroke: K.PAL.ink, lw: 8 });
  ctx.fillStyle = K.PAL.blue;
  ctx.strokeStyle = K.PAL.ink;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(0, -10, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  K.label(ctx, 'KONSENTRIK · TENANG · TAK BERUJUNG', 0, 245, { size: 28, mono: true });
  ctx.restore();
});

// Shot 6: Johannes Itten Color Wheel
shot('itten', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'JOHANNES ITTEN · FARBENKUGEL 1921', step: 6, total: 8 });
  K.drawSwissHeader(ctx, 'ITTEN', 'RODA KONTRAS', 'WARNA BAUHAUS.', 'Standar Kurikulum Dasar Desain di Seluruh Dunia', prog(t, a, a + 0.5), K.PAL.ink);
  K.drawSwissArcs(ctx, 540, 850, 1.12, t, prog(t, a + 0.1, a + 0.8));
});

// Shot 7: Aplikasi — Traffic Signs & UI Icons Today
shot('aplikasi', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'SEMIOTIKA VISUAL MODERN', step: 7, total: 8 });
  K.drawSwissHeader(ctx, 'NYATA', 'RAMBU JALAN &', 'IKON ANTARMUKA.', 'Bahasa Visual Kandinsky di Kehidupan Sehari-hari', prog(t, a, a + 0.5), K.PAL.yellow);

  const p = prog(t, a + 0.15, a + 0.85);
  const rows = [
    ['PERINGATAN WASPADA', 'SEGITIGA KUNING (!)', K.PAL.yellow, K.PAL.ink],
    ['BERHENTI / BAHAYA', 'KOTAK MERAH (STOP)', K.PAL.red, '#ffffff'],
    ['INFORMASI & PANDUAN', 'LINGKARAN BIRU (i)', K.PAL.blue, '#ffffff'],
  ];
  rows.forEach(([titleTxt, subTxt, bgCol, fgCol], i) => {
    const kp = ease.outCubic(clamp(p * 1.3 - i * 0.15));
    const y = 600 + i * 240;
    K.card(ctx, 540, y, 936 * kp, 195, bgCol, { stroke: K.PAL.ink, lw: 7 });
    K.title(ctx, titleTxt, 120, y - 24, { size: 46, color: fgCol, align: 'left', p: kp });
    K.label(ctx, subTxt, 120, y + 40, { size: 28, color: fgCol, align: 'left', mono: true, p: kp });
  });
});

// Shot 8: Penutup
shot('penutup', (t, a, b) => {
  K.drawSwissStage(ctx, t, { code: 'BAHASA UNIVERSAL · GEOMETRI & WARNA', step: 8, total: 8 });
  K.drawSwissHeader(ctx, '1923', 'BAHASA GEOMETRI', 'MATA MANUSIA.', 'Segitiga Kuning · Persegi Merah · Lingkaran Biru', prog(t, a, a + 0.5), K.PAL.blue);
  K.drawKandinskyTriad(ctx, 540, 860, 1.05, t, prog(t, a + 0.15, a + 0.8));
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

