// Scrapbook Collage demo2 (~64 s): "Ekspedisi Franz Wilhelm Junghuhn — Sang Humboldt dari Jawa"
// Expedition journal featuring Junghuhn's 4 vertical climate zones diagram, Cinchona leaf herbarium, and Lembang stamps.
import * as K from '/styles/scrapbook/kit.js';
const { clamp, lerp, ease, TAU } = AM.lib;
const P = K.PAL;

export const meta = { fps: 24, hold: 1, captions: { preset: 'typewriter', y: 1525, size: 62 } };

let ctx;
const C = {};
const seg = (id, t) => clamp((t - C[id].start) / Math.max(0.01, C[id].end - C[id].start));
const fade = (id, t, fi = 0.3, fo = 0.3) => {
  const s = C[id].start, e = C[id].end;
  if (t < s - fi || t > e + fo) return 0;
  if (t < s) return clamp((t - (s - fi)) / fi);
  if (t > e) return clamp(1 - (t - e) / fo);
  return 1;
};

export async function setup(AM) {
  ctx = AM.layer('journal');
  for (const l of AM.timeline.lines) C[l.id] = l;
  AM.sfx('paper', 0.1, { gain: 0.4 });
  AM.sfx('pop', C.junghuhn.start + 0.2, { gain: 0.38 });
  AM.sfx('stamp', C.zona.start + 0.25, { gain: 0.4 });
  AM.sfx('pop', C.kina.start + 0.25, { gain: 0.4 });
  AM.sfx('stamp', C.bandung.start + 0.3, { gain: 0.45 });
  AM.sfx('chime', C.akhir.start + 0.3, { gain: 0.38 });
}

function drawMountainZones(c, ix, iy, iw, ih, prog = 1) {
  c.save();
  c.fillStyle = '#DCEBF2'; c.fillRect(ix, iy, iw, ih);

  // Volcano cone
  const cx = ix + iw * 0.46, by = iy + ih - 24, topY = iy + 48;
  c.fillStyle = '#6B8E5A';
  c.beginPath();
  c.moveTo(ix + 30, by);
  c.lineTo(cx - 55, topY);
  c.lineTo(cx + 55, topY);
  c.lineTo(ix + iw - 120, by);
  c.closePath();
  c.fill();
  c.lineWidth = 3.5; c.strokeStyle = P.ink; c.stroke();

  // 4 Vertical Climate Bands (Junghuhn Classification)
  const zones = [
    ['IV. DINGIN (>2.500 m) · Lumut & Edelweis', 0.0, 0.23, '#A9C6D9'],
    ['III. SEJUK (1.500–2.500 m) · Kina, Teh & Pinus', 0.23, 0.48, '#77B28C'],
    ['II. SEDANG (600–1.500 m) · Kopi, Kakao & Kina', 0.48, 0.74, '#9CC567'],
    ['I. PANAS (0–600 m) · Padi, Kelapa & Tebu', 0.74, 1.0, '#E5C365'],
  ];
  zones.forEach(([lbl, y0, y1, col], i) => {
    const show = clamp(prog * 4 - i);
    if (show <= 0) return;
    const zy0 = lerp(topY, by, y0), zy1 = lerp(topY, by, y1);
    c.save();
    c.globalAlpha = show * 0.85;
    c.fillStyle = col;
    c.fillRect(ix + 24, zy0, iw - 48, zy1 - zy0 - 4);
    c.strokeStyle = P.ink; c.lineWidth = 2;
    c.strokeRect(ix + 24, zy0, iw - 48, zy1 - zy0 - 4);
    c.fillStyle = P.ink;
    c.font = `700 20px '${K.FONT.mono}'`;
    c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText(lbl, ix + 42, (zy0 + zy1) / 2);
    c.restore();
  });
  c.restore();
}

function drawCinchonaLeaf(c, r) {
  c.save();
  c.rotate(-0.25);
  c.fillStyle = '#3D7A47';
  c.beginPath();
  c.ellipse(0, 0, r * 0.42, r * 0.68, 0, 0, TAU);
  c.fill();
  c.lineWidth = 3.5; c.strokeStyle = P.ink; c.stroke();
  // Reddish midrib & veins (signature Cinchona ledgeriana trait!)
  c.strokeStyle = P.red; c.lineWidth = 4;
  c.beginPath(); c.moveTo(0, r * 0.78); c.lineTo(0, -r * 0.62); c.stroke();
  c.lineWidth = 2.5;
  for (let vy = -r * 0.4; vy <= r * 0.4; vy += r * 0.22) {
    c.beginPath();
    c.moveTo(0, vy); c.lineTo(-r * 0.3, vy - 14);
    c.moveTo(0, vy); c.lineTo(r * 0.3, vy - 14);
    c.stroke();
  }
  c.restore();
}

export function render(t) {
  const chIdx = ['hook', 'junghuhn', 'zona', 'kina', 'bandung', 'akhir'].findIndex((id) => t <= C[id].end + 0.1);
  const pg = ['HAL. 01', 'HAL. 02', 'HAL. 03', 'HAL. 04', 'HAL. 05', 'HAL. 06'][Math.max(0, chIdx)];

  K.stage(ctx, t, {
    journalTitle: 'JURNAL GUNUNG & KINA: FRANZ WILHELM JUNGHUHN',
    refCode: 'JAVA TOPOGRAPHIE · 1835–1864',
    page: pg,
  });

  // Scene 1: Hook — Volcanoes of Java & Bandung Quinine Apothecary
  const a1 = fade('hook', t, 0.2, 0.3);
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1;
    const p = seg('hook', t);
    K.photoCard(ctx, 540, 590, 840, 540, -0.015, (c, ix, iy, iw, ih) => {
      drawMountainZones(c, ix, iy, iw, ih, 1);
    }, {
      caption: 'ATLAS GUNUNG BERAPI PULAU JAWA — JUNGHUHN',
      sub: '45 puncak gunung didaki & dipetakan secara trigonometris',
      p: clamp(p * 3),
    });

    K.noteCard(ctx, 540, 1110, 820, 270, 0.015, {
      tag: 'WARISAN BOTANI PRIANGAN',
      title: 'Dari Lereng Gunung ke Apotek Dunia',
      lines: [
        'Memetakan seluruh gunung berapi Jawa dari Ujung Kulon ke Banyuwangi.',
        'Menjadikan dataran tinggi Bandung pusat kuinin anti-malaria dunia.',
      ],
      accent: P.teal,
      p: clamp((p - 0.2) * 3),
    });
    ctx.restore();
  }

  // Scene 2: Junghuhn — "The Humboldt of Java"
  const a2 = fade('junghuhn', t, 0.3, 0.3);
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2;
    const p = seg('junghuhn', t);
    K.photoCard(ctx, 360, 580, 460, 540, -0.025, (c, ix, iy, iw, ih) => {
      c.fillStyle = '#DFD0B2'; c.fillRect(ix, iy, iw, ih);
      // Naturalist silhouette with barometer & volcano backdrop
      c.fillStyle = '#8FA68E';
      c.beginPath(); c.moveTo(ix, iy + ih); c.lineTo(ix + iw * 0.72, iy + 90); c.lineTo(ix + iw, iy + ih); c.fill();
      c.fillStyle = P.ink;
      c.beginPath(); c.arc(ix + iw * 0.42, iy + ih * 0.38, 62, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(ix + iw * 0.16, iy + ih); c.quadraticCurveTo(ix + iw * 0.42, iy + ih * 0.54, ix + iw * 0.68, iy + ih); c.fill();
    }, {
      caption: 'FRANZ WILHELM JUNGHUHN',
      sub: '1809–1864 · "Humboldt dari Jawa"',
      p: clamp(p * 3),
    });

    K.postStamp(ctx, 790, 440, 1.25, 0.08, { title: 'BATAVIA', year: '1835', color: P.red, p: clamp((p - 0.15) * 3) });
    K.postStamp(ctx, 810, 710, 1.2, -0.06, { title: 'LEMBANG', year: '1856', color: P.teal, p: clamp((p - 0.28) * 3) });

    K.noteCard(ctx, 540, 1110, 830, 290, 0.012, {
      tag: 'MAonografi PULAU JAWA (1850)',
      title: 'Java, Zijne Gedaante, Bekleeding en Inwendige Structuur',
      lines: [
        'Karya 4 jilid setebal >1.500 halaman tentang geologi & flora Jawa.',
        'Membawa barometer air raksa, kompas, dan buku sketsa ke kawah aktif.',
      ],
      accent: P.cobalt,
      p: clamp((p - 0.22) * 3),
    });
    ctx.restore();
  }

  // Scene 3: Zona — The 4 Vertical Climate Zones Chart
  const a3 = fade('zona', t, 0.3, 0.3);
  if (a3 > 0) {
    ctx.save(); ctx.globalAlpha = a3;
    const p = seg('zona', t);
    K.photoCard(ctx, 540, 610, 860, 600, 0.008, (c, ix, iy, iw, ih) => {
      drawMountainZones(c, ix, iy, iw, ih, clamp(p * 1.5));
    }, {
      caption: 'KLASIFIKASI 4 ZONA IKLIM JUNGHUHN',
      sub: 'Hubungan ketinggian tempat (mdpl), suhu udara, dan jenis komoditas tanaman',
      p: clamp(p * 3),
    });

    K.noteCard(ctx, 540, 1150, 830, 240, -0.012, {
      tag: 'KURIKULUM GEOGRAFI INDONESIA',
      title: 'Rumus Ketinggian yang Masih Dipakai Hari Ini',
      lines: [
        'Setiap naik 100 meter di tropis, suhu rata-rata turun sekitar 0,6 °C.',
        'Menentukan lokasi ideal kebun teh, kopi, dan kina di Nusantara.',
      ],
      accent: P.green,
      p: clamp((p - 0.25) * 3),
    });
    ctx.restore();
  }

  // Scene 4: Kina — Cinchona cultivation in Lembang & Pengalengan
  const a4 = fade('kina', t, 0.3, 0.3);
  if (a4 > 0) {
    ctx.save(); ctx.globalAlpha = a4;
    const p = seg('kina', t);
    K.sticker(ctx, 300, 530, 135, -0.05, (c, r) => drawCinchonaLeaf(c, r), {
      label: 'CINCHONA SP.',
      fill: '#E9F5EE',
      p: clamp(p * 3),
    });
    K.photoCard(ctx, 720, 540, 440, 430, 0.03, (c, ix, iy, iw, ih) => {
      c.fillStyle = '#F7F0DC'; c.fillRect(ix, iy, iw, ih);
      drawCinchonaLeaf(c, 95);
      // Pressed herbarium tape inside photo
      K.tape(c, ix + iw / 2, iy + ih / 2, 180, 32, 0.15, { text: 'SPESIMEN KINA #42' });
    }, {
      caption: 'HERBARIUM DAUN & KULIT KINA',
      sub: 'Lembang & Pengalengan (1.500–2.000 mdpl)',
      p: clamp((p - 0.15) * 3),
    });

    K.noteCard(ctx, 540, 1060, 840, 320, -0.01, {
      tag: 'PENYELAMATAN KEBUN KINA (1856)',
      title: 'Memindahkan Kina ke Tanah Vulkanik Rindang',
      lines: [
        'Bibit awal di Cipanas hampir mati karena terlalu terbuka & rendah.',
        'Junghuhn memindahkannya ke hutan berkabut Tangkuban Perahu & Malabar.',
        'Pohon kina tumbuh subur di bawah naungan pohon rasamala.',
      ],
      accent: P.teal,
      p: clamp((p - 0.25) * 3),
    });
    ctx.restore();
  }

  // Scene 5: Bandung — 90% of World's Quinine Supply & Bandoengsche Kininefabriek
  const a5 = fade('bandung', t, 0.3, 0.3);
  if (a5 > 0) {
    ctx.save(); ctx.globalAlpha = a5;
    const p = seg('bandung', t);
    K.sticker(ctx, 310, 520, 135, -0.04, (c, r) => {
      c.fillStyle = P.ink;
      c.font = `700 68px '${K.FONT.bold}'`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('90%', 0, 0);
    }, {
      label: 'PASOKAN DUNIA',
      fill: '#FFF0B8',
      p: clamp(p * 3),
    });
    K.postStamp(ctx, 760, 510, 1.4, 0.06, { title: 'BANDOENG', year: '1896', color: P.cobalt, p: clamp((p - 0.15) * 3) });

    K.noteCard(ctx, 540, 1030, 840, 350, 0.012, {
      tag: 'BANDOENGSCHE KININEFABRIEK (KINI KIMIA FARMA)',
      title: 'Bandung: Ibu Kota Kuinin Anti-Malaria Dunia',
      lines: [
        'Kulit pohon Cinchona ledgeriana Jawa memiliki kadar alkaloid tertinggi.',
        'Menyuplai >90% kebutuhan pil kuinin dunia di awal abad ke-20.',
        'Menyelamatkan jutaan nyawa dari demam malaria di daerah tropis.',
      ],
      accent: P.red,
      p: clamp((p - 0.25) * 3),
    });
    K.rubberStamp(ctx, 780, 810, '90% KUININ DUNIA', { color: P.red, rot: -0.08, p: clamp((p - 0.4) * 3) });
    ctx.restore();
  }

  // Scene 6: Akhir — Junghuhn's final view of Tangkuban Perahu in Lembang (1864)
  const a6 = fade('akhir', t, 0.3, 0.2);
  if (a6 > 0) {
    ctx.save(); ctx.globalAlpha = a6;
    const p = seg('akhir', t);
    K.photoCard(ctx, 540, 590, 840, 530, -0.01, (c, ix, iy, iw, ih) => {
      // Sunset over Tangkuban Perahu silhouette
      const g = c.createLinearGradient(0, iy, 0, iy + ih);
      g.addColorStop(0, '#E89B65'); g.addColorStop(1, '#F6D992');
      c.fillStyle = g; c.fillRect(ix, iy, iw, ih);
      c.fillStyle = '#3B4D54';
      c.beginPath();
      c.moveTo(ix, iy + ih);
      c.lineTo(ix + iw * 0.22, iy + ih * 0.42);
      c.lineTo(ix + iw * 0.72, iy + ih * 0.38);
      c.lineTo(ix + iw, iy + ih);
      c.closePath(); c.fill();
      // Cinchona trees in foreground
      for (const tx of [0.18, 0.82]) {
        c.fillStyle = P.ink;
        c.fillRect(ix + iw * tx - 6, iy + ih - 140, 12, 140);
        c.beginPath(); c.arc(ix + iw * tx, iy + ih - 150, 48, 0, TAU); c.fill();
      }
    }, {
      caption: 'TAMAN JUNGHUHN · JAYAGIRI, LEMBANG (24 APRIL 1864)',
      sub: '"Bukakan jendela, aku ingin mengucapkan selamat tinggal pada gunung-gunungku"',
      p: clamp(p * 3),
    });

    K.noteCard(ctx, 540, 1110, 820, 260, 0.01, {
      tag: 'EPILOG SANG PENJELAJAH',
      title: 'Abadi di Lereng Tangkuban Perahu',
      lines: [
        'Dimakamkan di Lembang di tengah pohon-pohon kina yang ia tanam.',
        'Namanya diabadikan pada spesies pohon kina Cinchona junghuhniana.',
      ],
      accent: P.teal,
      p: clamp((p - 0.2) * 3),
    });
    ctx.restore();
  }
}

