// 65 · STICKMAN DOODLE — Demo 1: Kenapa Kita Menunda-nunda? (Si Dodi Buku Tulis & Si Otak Pink).
import * as K from '/styles/stickman-doodle/kit.js';
const { clamp, lerp, ease, prog, env, noise } = AM.lib;
const { G } = K;

export const meta = { fps: 24, hold: 2, captions: { preset: 'hand', y: 1580, size: 58 } };

let ctx, fx;
const C = {};
const T = (id, f = 0) => C[id].start + f * (C[id].end - C[id].start);
const W = (id, w) => AM.wordTime(id, w);
const ART = [];
const pen = new K.Pen();
const S = {};
const PY = { hook: 760, amigdala: 2610, lega: 4460, lima: 6310, moral: 8160 };
const pop = (t, a, d = 0.35) => ease.outBack(clamp((t - a) / d), 2);

export async function setup(AM) {
  ctx = AM.layer('world');
  fx = AM.layer('fx');
  for (const l of AM.timeline.lines) C[l.id] = l;
  const R = K.PAL.red, B = K.PAL.blue;

  // Panel 1: "PEMALAS?" written & crossed out in red
  const y1 = PY.hook;
  const d1 = new K.Sketch({ t0: 0.05, speed: 2400, seed: 1, gap: 0.04 });
  d1.text('PEMALAS?', 650, y1 - 240, { size: 108, align: 'center', font: 'Permanent Marker', cps: 13 });
  d1.at(W('hook', 'bukan') - 0.05);
  d1.line([[410, y1 - 320], [890, y1 - 210]], { col: R, w: 7, dur: 0.22 });
  d1.line([[410, y1 - 210], [890, y1 - 315]], { col: R, w: 7, dur: 0.22 });
  ART.push(d1); pen.sketch(d1);
  S.kamu1 = [0.15, 0.95];
  S.brainOut = W('hook', 'otakmu');

  // Panel 2: TUGAS sheet & Amygdala alarm
  const y2 = PY.amigdala;
  const d2 = new K.Sketch({ t0: C.amigdala.start - 0.1, speed: 3000, seed: 2, gap: 0.03 });
  d2.line(G.rect(620, y2 - 330, 290, 320), { w: 6, dur: 0.28 });
  d2.text('TUGAS', 765, y2 - 255, { size: 58, align: 'center', font: 'Permanent Marker', cps: 16 });
  for (let i = 0; i < 3; i++) d2.line([[655, y2 - 195 + i * 45], [870 - (i % 2) * 35, y2 - 195 + i * 45]], { w: 4, dur: 0.06 });
  d2.text('DEADLINE!', 765, y2 - 40, { size: 44, align: 'center', col: R, font: 'Permanent Marker', cps: 18 });
  ART.push(d2); pen.sketch(d2);
  S.alarm = W('amigdala', 'amigdala') - 0.1;
  S.kabur = W('amigdala', 'kabur') - 0.15;

  // Panel 3: Phone relief & Guilt rain cloud
  S.phone = C.lega.start;
  S.guilt = C.bersalah.start;

  // Panel 4: 5-Minute Timer
  const y4 = PY.lima;
  const d4 = new K.Sketch({ t0: C.lima.start - 0.1, speed: 3000, seed: 4, gap: 0.03 });
  d4.line(G.circle(720, y4 - 90, 165, -1.6, 0.15), { col: B, w: 8, dur: 0.4 });
  d4.line([[720, y4 - 255], [720, y4 - 290]], { col: B, w: 8, dur: 0.06 });
  d4.line([[665, y4 - 295], [775, y4 - 295]], { col: B, w: 8, dur: 0.08 });
  d4.text('tunggu mood?', 290, y4 - 260, { size: 54, align: 'center', cps: 16 });
  d4.line([[140, y4 - 245], [440, y4 - 275]], { col: R, w: 6, dur: 0.15 });
  ART.push(d4); pen.sketch(d4);
  S.timerA = W('lima', 'lima') - 0.2;

  // Panel 5: Pushing the shrinking boulder
  const y5 = PY.moral;
  S.push = [C.moral.start, T('akhir', 0.35)];
  const d5 = new K.Sketch({ t0: C.akhir.start - 0.1, speed: 2800, seed: 5, gap: 0.03 });
  d5.text('LAWANMU CUMA 5 MENIT!', 565, y5 - 285, { size: 68, align: 'center', font: 'Permanent Marker', cps: 18 });
  d5.line([[210, y5 - 245], [920, y5 - 252]], { col: R, w: 7, dur: 0.22 });
  ART.push(d5); pen.sketch(d5);
}

function kamuPose(t) {
  const y1 = PY.hook, y2 = PY.amigdala, y3 = PY.lega, y4 = PY.lima, y5 = PY.moral;
  const blink = (t % 3.1) < 0.12 ? 1 : 0;
  if (t < C.amigdala.start - 0.1) {
    const out = t > S.brainOut;
    return {
      x: 270, y: y1 + 190, s: 1.25,
      face: out ? 'shock' : 'worried',
      tilt: out ? -0.12 : Math.sin(t * 2) * 0.05,
      look: out ? 0.8 : 0, blink, hair: 'tuft',
      arms: out ? [[1.6, 0.6], [-1.3, -0.4]] : [[0.25, 0.2], [-0.25, -0.2]],
    };
  }
  if (t < C.lega.start - 0.1) {
    const k = t > S.kabur;
    const sh = k ? noise.n2(t * 30, 3) * 0.08 : 0;
    return {
      x: 270, y: y2 + 190, s: 1.25,
      face: k ? 'shock' : 'worried',
      look: 0.6, tilt: sh, blink: 0, hair: 'tuft',
      arms: k ? [[2.7, 0.3], [-2.7, -0.3]] : [[1.2, 1.4], [-1.2, -1.4]],
      legs: k ? [[0.45, 0], [-0.45, 0]] : undefined,
    };
  }
  if (t < C.lima.start - 0.1) {
    const g = t > S.guilt + 0.2;
    return {
      x: 340, y: y3 + 195, s: 1.25,
      face: g ? 'worried' : 'happy',
      look: g ? -0.3 : 0.4,
      tilt: g ? 0.12 : -0.08 + Math.sin(t * 2) * 0.04,
      blink, hair: 'tuft',
      arms: [[1.9, -1.4], [0.6, 1.2]],
      legs: [[0.3, 0], [-0.25, 0]],
      lean: g ? 0.08 : -0.05,
    };
  }
  if (t < C.moral.start - 0.1) {
    const said = t > S.timerA;
    return {
      x: 260, y: y4 + 190, s: 1.25,
      face: said ? 'grin' : 'skeptic',
      look: 0.8, blink, hair: 'tuft',
      mouth: said ? 0.5 + 0.5 * Math.sin(t * 14) : 0,
      arms: said ? [[2.0, 0.1], [-0.6, 1.8]] : [[0.4, 1.6], [-0.4, -1.6]],
    };
  }
  const p = prog(t, S.push[0], S.push[1]), done = t > S.push[1] + 0.1;
  const ph = (t * 2.2) % 1, sw = Math.sin(ph * Math.PI * 2);
  if (done) {
    return {
      x: 520, y: y5 + 185 - Math.abs(Math.sin((t - S.push[1]) * 6)) * 20,
      s: 1.2, face: 'happy', look: 0, hair: 'tuft',
      arms: [[2.7, 0.2], [-2.7, -0.2]],
    };
  }
  return {
    x: lerp(220, 520, p), y: y5 + 185, s: 1.2,
    face: p < 0.5 ? 'worried' : 'grin',
    look: 0.8, lean: 0.32, hair: 'tuft',
    arms: [[1.6, 0.3], [1.3, 0.5]],
    legs: [[0.55 * sw, 0.3], [-0.55 * sw, 0.3]],
  };
}

function panelExtras(t) {
  const R = K.PAL.red, B = K.PAL.blue;

  // Panel 1: Hook & Otak Kabur
  if (t < C.amigdala.start + 0.4) {
    const y1 = PY.hook;
    K.doodleHeader(ctx, 'PSIKOLOGI PROKRASTINASI • BUKU CATATAN', 'BUKAN PEMALAS, TAPI CEMAS!', 'Mengapa Otak Kita Kabur dari Tugas Berat?', {
      x: 565, y: y1 - 470, a: pop(t, 0.05), col: R,
    });
    const ca = pop(t, S.brainOut + 0.15);
    if (ca > 0) {
      ctx.save(); ctx.translate(280, y1 - 245); ctx.scale(ca, ca);
      K.cloud(ctx, 0, 0, t, { s: 1.0, label: 'rasa cemas', rain: true });
      ctx.restore();
    }
    if (t > S.brainOut) {
      const u = clamp((t - S.brainOut) / 2.6), e = ease.inOutSine(u);
      const bx = lerp(360, 830, e), by = y1 + 170;
      K.brainGuy(ctx, bx, by, t, { s: 1.05 * pop(t, S.brainOut, 0.25), run: t * 3.2, face: 'shock', look: 1 });
      K.motion(ctx, bx - 65, by - 95, 0, { n: 3, len: 70 });
      K.sweat(ctx, bx - 35, by - 175, t, { n: 2 });
    }
    K.doodleCard(ctx, 565, y1 + 365, 850, 155, {
      tag: 'REGULASI EMOSI (DR. TIM PYCHYL)',
      titleStr: 'Prokrastinasi = Menghindari Emosi Negatif',
      subStr: 'Otak memandang tugas sulit sebagai ancaman terhadap harga diri',
      stat: 'EMOSI',
      statSub: 'BUKAN MALAS',
      col: R,
      a: pop(t, C.otak.start),
      seed: 910,
    });
  }

  // Panel 2: Amigdala Hijack
  if (t > C.amigdala.start - 0.5 && t < C.lega.start + 0.4) {
    const y2 = PY.amigdala, a = pop(t, S.alarm, 0.35);
    K.doodleHeader(ctx, 'PEMBAJAKAN AMIGDala • FIGHT OR FLIGHT', 'SIRENE BAHAYA DI KEPALAMU', 'Amigdala Mengira Tugas Berat = Monster Pemangsa', {
      x: 565, y: y2 - 470, a: pop(t, C.amigdala.start), col: R,
    });
    if (a > 0) {
      const x = 765, y = y2 + 120, wob = Math.sin(t * 36) * 5 * (t > S.kabur ? 1 : 0.3);
      ctx.save(); ctx.translate(x + wob, y); ctx.scale(a * 0.9, a * 0.9);
      ctx.fillStyle = R; ctx.beginPath(); ctx.ellipse(0, 0, 105, 85, 0, 0, Math.PI * 2); ctx.fill();
      K.mline(ctx, Array.from({ length: 31 }, (_, k) => [Math.cos(k / 30 * Math.PI * 2) * 105, Math.sin(k / 30 * Math.PI * 2) * 85]), { w: 6, seed: 401 });
      ctx.fillStyle = K.PAL.yellow; ctx.beginPath(); ctx.ellipse(0, -95, 32, 26, 0, Math.PI, 0); ctx.fill();
      for (const sx of [-1, 1]) {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sx * 30, -12, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = K.PAL.ink; ctx.beginPath(); ctx.arc(sx * 28, -10, 6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      K.bubble(ctx, 520, y2 - 120, 310, 135, x - 30, y - 70, 'KABUR!!', {
        a: clamp((t - S.kabur) / 0.25), size: 64, shout: true, font: 'Permanent Marker', textCol: R, col: R,
      });
      if (t > S.kabur) K.sweat(ctx, 270, y2 + 190 - 330 * 1.25, t, { n: 3, s: 1.2 });
    }
    K.doodleCard(ctx, 565, y2 + 365, 850, 155, {
      tag: 'ALARM OTOMATIS OTAK PURBA',
      titleStr: 'Amigdala Mematikan Logika Korteks Prefrontal',
      subStr: 'Memicu dorongan instan untuk mencari pelarian yang aman & nyaman',
      stat: 'PANIK!',
      statSub: 'MODE KABUR',
      col: R,
      a: pop(t, C.amigdala.start + 0.35),
      seed: 920,
    });
  }

  // Panel 3: Phone Relief & Guilt Cloud
  if (t > C.lega.start - 0.5 && t < C.lima.start + 0.4) {
    const y3 = PY.lega, k = kamuPose(t);
    K.doodleHeader(ctx, 'JEBAKAN DOPAMIN MURAH • LINGKARAN SETAN', 'LEGA SEBENTAR, MENYESAL LAMA', 'Pelarian ke Layar HP Justru Menambah Beban Pikiran', {
      x: 565, y: y3 - 470, a: pop(t, C.lega.start), col: B,
    });
    const ks = k.s, hx = k.x + Math.sin(1.9) * 58 * ks + Math.sin(0.5) * 56 * ks, hy = k.y - 232 * ks + Math.cos(1.9) * 58 * ks + Math.cos(0.5) * 56 * ks;
    ctx.save(); ctx.translate(hx + 10, hy - 25); ctx.rotate(-0.3);
    ctx.fillStyle = '#2b2b2f'; ctx.fillRect(-24, -44, 48, 88);
    ctx.fillStyle = '#9fd3ff'; ctx.fillRect(-19, -36, 38, 70);
    ctx.restore();

    const ca = pop(t, S.guilt, 0.4);
    if (ca > 0) {
      ctx.save();
      ctx.translate(lerp(820, k.x + 20, ease.outCubic(clamp((t - S.guilt) / 0.7))), y3 - 230);
      ctx.scale(ca, ca);
      K.cloud(ctx, 0, 0, t, { label: 'rasa bersalah', rain: true });
      ctx.restore();
    }
    const pile = 1 + 0.28 * prog(t, S.guilt, S.guilt + 1.5);
    ctx.save(); ctx.translate(810, y3 + 185); ctx.scale(pile, pile);
    for (let i = 0; i < 4; i++) {
      const yy = -i * 42;
      ctx.fillStyle = '#fffdf6'; ctx.fillRect(-85 + (i % 2) * 10, yy - 38, 170, 38);
      K.mline(ctx, G.rect(-85 + (i % 2) * 10, yy - 38, 170, 38), { w: 5, seed: 520 + i });
    }
    K.mtext(ctx, 'TUGAS NUMPUK', 0, -185, { size: 36, font: 'Permanent Marker', col: R });
    ctx.restore();

    K.doodleCard(ctx, 565, y3 + 365, 850, 155, {
      tag: 'PARADOKS PELARIAN INSTAN',
      titleStr: 'Scroll HP Hanya Menunda Kecemasan Sementara',
      subStr: 'Rasa bersalah menguras energi mental lebih parah daripada bekerja',
      stat: '+200%',
      statSub: 'BEBAN PIKIRAN',
      col: B,
      a: pop(t, C.bersalah.start),
      seed: 930,
    });
  }

  // Panel 4: The 5-Minute Rule
  if (t > C.lima.start - 0.5 && t < C.moral.start + 0.4) {
    const y4 = PY.lima, a = clamp((t - S.timerA) / 0.25);
    K.doodleHeader(ctx, 'TRIK NEUROSAINS • ATURAN 5 MENIT', 'JANGAN TUNGGU MOOD DATANG!', 'Mulai 5 Menit Saja untuk Menjinakkan Amigdala', {
      x: 565, y: y4 - 470, a: pop(t, C.lima.start), col: B,
    });
    const secs = Math.max(0, 300 - Math.floor(Math.max(0, t - S.timerA - 0.2) * 8));
    K.mtext(ctx, `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, 720, y4 - 85, {
      size: 115, col: B, font: 'Permanent Marker', alpha: a,
    });
    K.bubble(ctx, 450, y4 + 100, 330, 120, 310, y4 - 20, '5 menit aja!', {
      a: clamp((t - S.timerA - 0.2) / 0.25), size: 50,
    });
    K.doodleCard(ctx, 565, y4 + 365, 850, 155, {
      tag: 'EFEK ZEIGARNIK DALAM AKSI',
      titleStr: 'Aksi Mendahului Motivasi, Bukan Sebaliknya',
      subStr: 'Setelah 5 menit berjalan, otak terdorong menyelesaikan tugas yang terbuka',
      stat: '5 MENIT',
      statSub: 'PEMICU FOKUS',
      col: B,
      a: pop(t, C.zeigarnik.start),
      seed: 940,
    });
  }

  // Panel 5: Shrinking Boulder
  if (t > C.moral.start - 0.5) {
    const y5 = PY.moral, p = prog(t, S.push[0], S.push[1]), k = kamuPose(t);
    K.doodleHeader(ctx, 'MOMENTUM AKSI • BATU JADI KERIKIL', 'BEGITU MULAI, BEBAN MENGECIL', 'Gesekan Terbesar Hanya Ada di Detik Pertama', {
      x: 565, y: y5 - 470, a: pop(t, C.moral.start), col: R,
    });
    const r = lerp(155, 36, ease.inOutSine(p));
    const bx = t > S.push[1] + 0.1 ? 680 : k.x + 150 + r, by = y5 + 185 - r;
    ctx.save(); ctx.fillStyle = '#d9d4c8'; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    K.mline(ctx, Array.from({ length: 29 }, (_, q) => {
      const an = (q / 28) * Math.PI * 2 + p * 6;
      const rr = r * (1 + 0.07 * Math.sin(q * 3));
      return [bx + Math.cos(an) * rr, by + Math.sin(an) * rr];
    }), { w: 6, seed: 700 });
    if (r > 65) K.mtext(ctx, 'TUGAS', bx, by, { size: r * 0.42, font: 'Permanent Marker' });
    K.mline(ctx, [[120, y5 + 188], [980, y5 + 185]], { w: 5, seed: 701 });

    // Happy Brain Guy cheering alongside Si Dodi at the end
    if (p > 0.5) {
      K.brainGuy(ctx, 820, y5 + 185, t, { s: 0.95 * pop(t, C.moral.start + 1.0), run: 0, face: 'happy', look: -1 });
    }

    K.doodleCard(ctx, 565, y5 + 365, 850, 155, {
      tag: 'KUNCI PRODUKTIVITAS HARIAN',
      titleStr: 'Perkecil Langkah Pertama Hingga Mustahil Gagal',
      subStr: 'Buka dokumennya, tulis satu kalimat, dan biarkan momentum bekerja',
      stat: 'MULAI!',
      statSub: 'MENANG 80%',
      col: R,
      a: pop(t, C.moral.start + 0.3),
      seed: 950,
    });
  }
}

const ORDER = ['hook', 'amigdala', 'lega', 'lima', 'moral'];
function camAt(t) {
  let k = 0;
  for (let i = 0; i < ORDER.length; i++) if (C[ORDER[i]] && t >= C[ORDER[i]].start - 0.15) k = i;
  const id = ORDER[k], a = C[id].start - 0.15, prevY = k ? PY[ORDER[k - 1]] : PY.hook;
  const f = ease.inOutCubic(clamp((t - a) / 0.55));
  let y = lerp(prevY, PY[id], f) - 20;
  return [540, y, 1.0];
}

export function render(t) {
  fx.clearRect(0, 0, AM.W, AM.H);
  K.setBoil(t, 1.6, 12);
  const [x, y, z] = camAt(t);
  K.cam(ctx, x, y, z);
  K.notebook(ctx);
  for (const d of ART) d.draw(ctx, t);
  panelExtras(t);
  const kp = kamuPose(t);
  const rv = t < 0.95 ? clamp((t - S.kamu1[0]) / (S.kamu1[1] - S.kamu1[0])) : 1;
  if (rv > 0) K.stickDraw(ctx, kp, t, { reveal: rv });
  const st = pen.at(t) || (t < S.kamu1[1] && t > S.kamu1[0] ? K.stickTip(kp, rv) : null);
  K.markerFor(ctx, st, { s: 1 / z });
  AM.lib.vignette(fx, { strength: 0.16, inner: 0.58, color: '70,50,20' });
}
