// Scrapbook Collage demo3 (~65 s): "Herbarium Rumphius di Ambon — Buku Botani Raksasa yang Ditulis dalam Kebutaan"
// Botanical expedition scrapbook featuring clove/nutmeg specimens, Ambon stamps, and Rumphius's 6-volume Herbarium.
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
  AM.sfx('pop', C.ambon.start + 0.2, { gain: 0.38 });
  AM.sfx('chime', C.buta.start + 0.25, { gain: 0.38 });
  AM.sfx('thud', C.bencana.start + 0.25, { gain: 0.45 });
  AM.sfx('typewriter', C.dikte.start + 0.25, { gain: 0.35 });
  AM.sfx('stamp', C.warisan.start + 0.3, { gain: 0.45 });
}

function drawCloveBranch(c, x, y, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  // Stem
  c.strokeStyle = P.sepia; c.lineWidth = 6; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-40, 80); c.quadraticCurveTo(0, 10, 45, -75); c.stroke();
  // Opposite leaves
  const leaves = [[-22, 35, -0.8], [16, 15, 0.7], [-8, -22, -0.9], [28, -38, 0.65]];
  for (const [lx, ly, rot] of leaves) {
    c.save(); c.translate(lx, ly); c.rotate(rot);
    c.fillStyle = P.green; c.strokeStyle = P.ink; c.lineWidth = 2.8;
    c.beginPath(); c.ellipse(0, -28, 16, 36, 0, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0, 4); c.lineTo(0, -56); c.stroke();
    c.restore();
  }
  // Crimson clove flower buds at tip
  for (const [bx, by] of [[32, -82], [48, -92], [62, -76]]) {
    c.fillStyle = P.red; c.strokeStyle = P.ink; c.lineWidth = 2.5;
    c.beginPath(); c.arc(bx, by, 10, 0, TAU); c.fill(); c.stroke();
  }
  c.restore();
}

function drawNutmegFruit(c, x, y, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  // Yellowish fleshy husk split open
  c.fillStyle = P.gold; c.strokeStyle = P.ink; c.lineWidth = 3.5;
  c.beginPath(); c.ellipse(0, 0, 56, 68, 0, 0, TAU); c.fill(); c.stroke();
  // Dark brown nutmeg seed inside
  c.fillStyle = '#5A3522';
  c.beginPath(); c.ellipse(0, 4, 30, 42, 0, 0, TAU); c.fill(); c.stroke();
  // Red aril (fuli / mace) web wrapping the seed
  c.strokeStyle = P.red; c.lineWidth = 4;
  for (let i = -2; i <= 2; i++) {
    c.beginPath(); c.moveTo(i * 8, 42); c.quadraticCurveTo(i * 15, 0, i * 6, -34); c.stroke();
  }
  c.restore();
}

export function render(t) {
  const chIdx = ['hook', 'ambon', 'buta', 'bencana', 'dikte', 'warisan'].findIndex((id) => t <= C[id].end + 0.1);
  const pg = ['HAL. 01', 'HAL. 02', 'HAL. 03', 'HAL. 04', 'HAL. 05', 'HAL. 06'][Math.max(0, chIdx)];

  K.stage(ctx, t, {
    journalTitle: 'HERBARIUM AMBOINENSE · GEORG E. RUMPHIUS',
    refCode: 'AMBOINA · 1654–1702',
    page: pg,
  });

  // Scene 1: Hook — Pressed Herbarium Specimen of Clove & Nutmeg
  const a1 = fade('hook', t, 0.2, 0.3);
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1;
    const p = seg('hook', t);
    K.photoCard(ctx, 540, 580, 840, 540, -0.015, (c, ix, iy, iw, ih) => {
      c.fillStyle = '#F7EFE0'; c.fillRect(ix, iy, iw, ih);
      drawCloveBranch(c, ix + iw * 0.32, iy + ih * 0.54, 1.45);
      drawNutmegFruit(c, ix + iw * 0.72, iy + ih * 0.52, 1.35);
      K.tape(c, ix + iw * 0.32, iy + ih * 0.68, 160, 30, 0.18, { text: 'CARYOPHYLLUS' });
      K.tape(c, ix + iw * 0.72, iy + ih * 0.76, 160, 30, -0.12, { text: 'MYRISTICA' });
    }, {
      caption: '1.200 SPESIES FLORA MALUKU DALAM 6 JILID BESAR',
      sub: 'Disusun ketika sang penulis telah kehilangan penglihatannya secara total',
      p: clamp(p * 3),
    });

    K.noteCard(ctx, 540, 1110, 820, 270, 0.014, {
      tag: ' KEAJAIBAN SEJARAH SAINS',
      title: 'Menulis Ensiklopedia Botani Tanpa Melihat',
      lines: [
        'Deskripsi morfologi akar, batang, daun, bunga, dan kegunaan obat.',
        'Ditulis di Pulau Ambon lebih dari 300 tahun yang lalu.',
      ],
      accent: P.green,
      p: clamp((p - 0.2) * 3),
    });
    ctx.restore();
  }

  // Scene 2: Ambon — Rumphius arriving in Ambon (1654) & marine/botanical exploration
  const a2 = fade('ambon', t, 0.3, 0.3);
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2;
    const p = seg('ambon', t);
    K.photoCard(ctx, 360, 570, 460, 530, -0.025, (c, ix, iy, iw, ih) => {
      c.fillStyle = '#D9DFCE'; c.fillRect(ix, iy, iw, ih);
      drawCloveBranch(c, ix + iw / 2, iy + ih * 0.52, 1.5);
    }, {
      caption: 'GEORG EBERHARD RUMPHIUS',
      sub: '"Plinius Indicus" (Plinius dari Hindia)',
      p: clamp(p * 3),
    });

    K.postStamp(ctx, 790, 430, 1.25, 0.07, { title: 'AMBOINA', year: '1654', color: P.teal, p: clamp((p - 0.15) * 3) });
    K.postStamp(ctx, 810, 700, 1.2, -0.06, { title: 'MOLUCCAS', year: '1670', color: P.red, p: clamp((p - 0.28) * 3) });

    K.noteCard(ctx, 540, 1100, 830, 290, 0.01, {
      tag: 'PENELITI ALAM KEPULAUAN REMPAH',
      title: 'Jatuh Cinta pada Alam Pulau Ambon',
      lines: [
        'Mencatat nama tanaman dalam bahasa Latin, Melayu, Ambon, dan Belanda.',
        'Juga menulis D’Amboinsche Rariteitkamer (katalog kerang & biota laut).',
      ],
      accent: P.teal,
      p: clamp((p - 0.22) * 3),
    });
    ctx.restore();
  }

  // Scene 3: Buta — Blindness at age 42 (1670): tactile botany (touch, smell, taste)
  const a3 = fade('buta', t, 0.3, 0.3);
  if (a3 > 0) {
    ctx.save(); ctx.globalAlpha = a3;
    const p = seg('buta', t);
    K.sticker(ctx, 290, 520, 130, -0.05, (c, r) => drawCloveBranch(c, 0, 10, 0.9), {
      label: 'RABAAN DAUN',
      fill: '#FFF6D6',
      p: clamp(p * 3),
    });
    K.sticker(ctx, 790, 520, 130, 0.05, (c, r) => drawNutmegFruit(c, 0, 0, 1.0), {
      label: 'AROMA REMPAH',
      fill: '#FFE8D8',
      p: clamp((p - 0.15) * 3),
    });

    K.noteCard(ctx, 540, 1040, 840, 340, -0.01, {
      tag: 'TAHUN 1670 · USIA 42 TAHUN',
      title: 'Melihat Tanaman Lewat Ujung Jari',
      lines: [
        'Glaukoma membuat kedua matanya buta total di tengah penelitian.',
        'Ia meraba tulang daun, mencium aroma getah, dan mengecap kulit kayu.',
        'Mempelajari ulang bahasa Melayu & Latin untuk mendiktekan naskahnya.',
      ],
      accent: P.cobalt,
      p: clamp((p - 0.25) * 3),
    });
    ctx.restore();
  }

  // Scene 4: Bencana — 1674 Ambon Earthquake/Tsunami & 1687 Great Fire
  const a4 = fade('bencana', t, 0.3, 0.3);
  if (a4 > 0) {
    ctx.save(); ctx.globalAlpha = a4;
    const p = seg('bencana', t);
    K.noteCard(ctx, 540, 540, 840, 350, -0.015, {
      tag: 'TRAGEDI BERUNTUN DI AMBON',
      title: 'Dua Bencana Besar yang Menguji Ketabahan',
      lines: [
        '17 Februari 1674: Gempa & tsunami Ambon merenggut istri (Susanna) & putrinya.',
        '11 Januari 1687: Kebakaran hebat melalap perpustakaan & seluruh gambar aslinya.',
        'Bahkan kapal pengangkut salinan naskahnya ke Belanda sempat tenggelam pada 1692!',
      ],
      accent: P.red,
      p: clamp(p * 3),
    });

    K.postStamp(ctx, 330, 1020, 1.35, -0.08, { title: 'GEMPA AMBON', year: '1674', color: P.red, p: clamp((p - 0.2) * 3) });
    K.postStamp(ctx, 750, 1020, 1.35, 0.07, { title: 'KEBAKARAN', year: '1687', color: P.sepia, p: clamp((p - 0.3) * 3) });
    K.rubberStamp(ctx, 540, 1240, 'PANTANG MENYERAH', { color: P.red, rot: -0.04, p: clamp((p - 0.4) * 3) });
    ctx.restore();
  }

  // Scene 5: Dikte — Dictating 6 volumes from memory with his son Paulus Augustus drawing
  const a5 = fade('dikte', t, 0.3, 0.3);
  if (a5 > 0) {
    ctx.save(); ctx.globalAlpha = a5;
    const p = seg('dikte', t);
    K.photoCard(ctx, 540, 580, 840, 540, 0.012, (c, ix, iy, iw, ih) => {
      c.fillStyle = '#F2E7CF'; c.fillRect(ix, iy, iw, ih);
      // Six bound volumes of Herbarium Amboinense
      for (let i = 0; i < 6; i++) {
        const bx = ix + 75 + i * 112, by = iy + 110, bw = 92, bh = 310;
        AM.lib.roundRect(c, bx, by, bw, bh, 8);
        c.fillStyle = (i % 2 === 0) ? P.red : P.teal; c.fill();
        c.strokeStyle = P.ink; c.lineWidth = 3; c.stroke();
        c.fillStyle = P.gold; c.fillRect(bx + 10, by + 36, bw - 20, 14);
        c.fillRect(bx + 10, by + bh - 50, bw - 20, 14);
        c.fillStyle = P.cream; c.font = `700 28px '${K.FONT.serif}'`; c.textAlign = 'center';
        c.fillText(['I', 'II', 'III', 'IV', 'V', 'VI'][i], bx + bw / 2, by + bh / 2);
      }
    }, {
      caption: '6 JILID HERBARIUM AMBOINENSE — DIDIKTEKAN ULANG DARI INGATAN',
      sub: 'Ilustrasi digambar ulang bersama putranya, Paulus Augustus Rumphius',
      p: clamp(p * 3),
    });

    K.noteCard(ctx, 540, 1110, 830, 270, -0.01, {
      tag: 'KOLABORASI AYAH & ANAK',
      title: 'Menulis Ulang Ratusan Halaman dari Memori',
      lines: [
        'Rumphius mendiktekan ciri setiap pohon, Paulus menggambar sketsanya.',
        'Gubernur Jenderal Joannes Camphuys menyalin ulang naskah di Batavia sebelum dikirim.',
      ],
      accent: P.teal,
      p: clamp((p - 0.22) * 3),
    });
    ctx.restore();
  }

  // Scene 6: Warisan — Enduring Scientific Legacy (1741–1750 publication & Linnaeus taxonomy)
  const a6 = fade('warisan', t, 0.3, 0.2);
  if (a6 > 0) {
    ctx.save(); ctx.globalAlpha = a6;
    const p = seg('warisan', t);
    K.sticker(ctx, 300, 520, 130, -0.05, (c, r) => drawCloveBranch(c, 0, 10, 0.95), {
      label: '1.200 SPESIES',
      fill: '#E9F5EE',
      p: clamp(p * 3),
    });
    K.sticker(ctx, 780, 520, 130, 0.05, (c, r) => drawNutmegFruit(c, 0, 0, 1.0), {
      label: 'MAHKOTA BOTANI',
      fill: '#FFF5D6',
      p: clamp((p - 0.15) * 3),
    });

    K.noteCard(ctx, 540, 1030, 840, 350, 0.01, {
      tag: 'WARISAN ABADI NUSANTARA',
      title: 'Fondasi Taksonomi Tanaman Tropis Dunia',
      lines: [
        'Diterbitkan di Amsterdam (1741–1750) dalam bahasa Belanda & Latin.',
        'Menjadi rujukan utama Carl Linnaeus dalam menyusun nama ilmiah spesies tropis.',
        'Bukti nyata bahwa tekad manusia melampaui keterbatasan fisik.',
      ],
      accent: P.green,
      p: clamp((p - 0.25) * 3),
    });
    K.rubberStamp(ctx, 780, 810, 'HERBARIUM AMBOINENSE', { color: P.red, size: 34, rot: -0.07, p: clamp((p - 0.4) * 3) });
    ctx.restore();
  }
}

