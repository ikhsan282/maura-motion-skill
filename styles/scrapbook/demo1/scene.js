// Scrapbook Collage demo1 (~64 s): "Jurnal Wallace: Garis Tak Terlihat di Nusantara"
// Expedition scrapbook with vintage archipelago maps, die-cut animal stickers, postage stamps, and field notes.
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
  AM.sfx('pop', C.wallace.start + 0.2, { gain: 0.38 });
  AM.sfx('pop', C.koleksi.start + 0.25, { gain: 0.38 });
  AM.sfx('stamp', C.seberang.start + 0.3, { gain: 0.42 });
  AM.sfx('pop', C.hewan.start + 0.25, { gain: 0.4 });
  AM.sfx('stamp', C.dalam.start + 0.35, { gain: 0.45 });
}

function drawButterfly(ctx, r, t) {
  const flap = 0.82 + Math.sin(t * 7) * 0.18;
  ctx.save();
  ctx.scale(flap, 1);
  for (const s of [-1, 1]) {
    ctx.save(); ctx.scale(s, 1);
    ctx.fillStyle = P.ink;
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.bezierCurveTo(r * 0.85, -r * 0.9, r * 0.95, 0, 0, 12);
    ctx.bezierCurveTo(r * 0.7, 10, r * 0.65, r * 0.85, 0, r * 0.55);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3BD16F';
    ctx.beginPath(); ctx.ellipse(r * 0.42, -r * 0.25, r * 0.26, r * 0.14, -0.4, 0, TAU); ctx.fill();
    ctx.fillStyle = P.gold;
    ctx.beginPath(); ctx.ellipse(r * 0.32, r * 0.32, r * 0.18, r * 0.12, 0.3, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = P.cream;
  ctx.fillRect(-4, -r * 0.5, 8, r);
  ctx.restore();
}

function drawTigerIcon(ctx, r) {
  ctx.save();
  ctx.fillStyle = '#E67E22';
  ctx.beginPath(); ctx.arc(0, 4, r * 0.58, 0, TAU); ctx.fill();
  ctx.lineWidth = 3.5; ctx.strokeStyle = P.ink; ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(s * r * 0.42, -r * 0.38, r * 0.18, 0, TAU); ctx.fill(); ctx.stroke();
    // Tiger stripes
    ctx.beginPath();
    ctx.moveTo(s * r * 0.55, -6); ctx.lineTo(s * r * 0.28, -2);
    ctx.moveTo(s * r * 0.52, 10); ctx.lineTo(s * r * 0.25, 12);
    ctx.stroke();
  }
  ctx.fillStyle = P.ink;
  ctx.beginPath(); ctx.arc(-14, -2, 5, 0, TAU); ctx.arc(14, -2, 5, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawCockatooIcon(ctx, r) {
  ctx.save();
  // Yellow crest feathers
  ctx.fillStyle = P.gold;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(-8 + i * 7, -r * 0.52, 6, 22, -0.4 + i * 0.2, 0, TAU);
    ctx.fill();
  }
  // White head
  ctx.fillStyle = P.cream;
  ctx.beginPath(); ctx.arc(0, 6, r * 0.52, 0, TAU); ctx.fill();
  ctx.lineWidth = 3.5; ctx.strokeStyle = P.ink; ctx.stroke();
  // Curved black beak
  ctx.fillStyle = P.ink;
  ctx.beginPath(); ctx.moveTo(16, -6); ctx.quadraticCurveTo(46, 2, 28, 24); ctx.lineTo(14, 12); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -2, 5, 0, TAU); ctx.fill();
  ctx.restore();
}

export function render(t) {
  const chIdx = ['hook', 'wallace', 'koleksi', 'seberang', 'hewan', 'dalam'].findIndex((id) => t <= C[id].end + 0.1);
  const pg = ['HAL. 01', 'HAL. 02', 'HAL. 03', 'HAL. 04', 'HAL. 05', 'HAL. 06'][Math.max(0, chIdx)];

  K.stage(ctx, t, {
    journalTitle: 'JURNAL EKSPEDISI ALFRED RUSSEL WALLACE',
    refCode: 'MALAY ARCHIPELAGO · 1854–1862',
    page: pg,
  });

  // Scene 1: Hook — Nusantara Map split by the glowing red Wallace Line
  const a1 = fade('hook', t, 0.2, 0.3);
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1;
    const p = seg('hook', t);
    K.photoCard(ctx, 540, 600, 830, 560, -0.015, (c, ix, iy, iw, ih) => {
      K.drawArchipelagoMap(c, ix, iy, iw, ih, { wallaceProg: clamp(p * 1.6), routeProg: 0 });
    }, {
      caption: 'PETA KEPULAUAN NUSANTARA — GARIS PEMISAH FAUNA',
      sub: 'Batas biogeografi tak kasatmata antara dangkalan Asia & Australia',
      p: clamp(p * 3),
    });

    K.noteCard(ctx, 540, 1130, 820, 270, 0.012, {
      tag: 'MISTERI BIOGEOGRAFI',
      title: 'Mengapa Hewan Tidak Menyeberang?',
      lines: [
        'Garis laut sempit yang membelah Nusantara menjadi dua dunia.',
        'Burung dan mamalia berhenti tepat di batas selat yang sama.',
      ],
      p: clamp((p - 0.18) * 3),
    });
    K.rubberStamp(ctx, 810, 340, 'RAHASIA ALAM', { rot: 0.12, p: clamp((p - 0.35) * 3) });
    ctx.restore();
  }

  // Scene 2: Wallace — Alfred Russel Wallace expedition journal & stamps
  const a2 = fade('wallace', t, 0.3, 0.3);
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2;
    const p = seg('wallace', t);
    K.photoCard(ctx, 360, 580, 460, 540, -0.03, (c, ix, iy, iw, ih) => {
      // Portrait silhouette & compass in vintage sepia frame
      c.fillStyle = '#D8C5A2'; c.fillRect(ix, iy, iw, ih);
      c.fillStyle = P.ink;
      c.beginPath(); c.arc(ix + iw / 2, iy + ih * 0.38, 68, 0, TAU); c.fill();
      // Eyeglasses & naturalist beard
      c.strokeStyle = P.gold; c.lineWidth = 4;
      c.beginPath(); c.arc(ix + iw / 2 - 22, iy + ih * 0.36, 16, 0, TAU); c.arc(ix + iw / 2 + 22, iy + ih * 0.36, 16, 0, TAU); c.stroke();
      c.fillStyle = P.ink;
      c.beginPath(); c.moveTo(ix + iw * 0.22, iy + ih); c.quadraticCurveTo(ix + iw / 2, iy + ih * 0.55, ix + iw * 0.78, iy + ih); c.fill();
    }, {
      caption: 'ALFRED RUSSEL WALLACE',
      sub: 'Naturalis & Penjelajah (1854–1862)',
      p: clamp(p * 3),
    });

    K.postStamp(ctx, 790, 440, 1.25, 0.09, { title: 'TERNATE', year: '1858', color: P.teal, p: clamp((p - 0.15) * 3) });
    K.postStamp(ctx, 820, 710, 1.2, -0.07, { title: 'SINGAPORE', year: '1854', color: P.red, p: clamp((p - 0.28) * 3) });

    K.noteCard(ctx, 540, 1110, 830, 290, 0.015, {
      tag: 'CATATAN PERJALANAN · 8 TAHUN',
      title: '14.000 Mil Menjelajahi Nusantara',
      lines: [
        '60–70 ekspedisi terpisah dengan perahu kayu & kapal uap.',
        'Mencatat morfologi hewan, bahasa lokal, dan geologi pulau.',
        'Melukis sketsa tangan di setiap pelabuhan singgah.',
      ],
      accent: P.teal,
      p: clamp((p - 0.2) * 3),
    });
    ctx.restore();
  }

  // Scene 3: Koleksi — 125,660 specimens: Ornithoptera butterfly, orangutan, cendrawasih
  const a3 = fade('koleksi', t, 0.3, 0.3);
  if (a3 > 0) {
    ctx.save(); ctx.globalAlpha = a3;
    const p = seg('koleksi', t);
    K.sticker(ctx, 290, 520, 125, -0.06, (c, r) => drawButterfly(c, r, t), {
      label: 'ORNITHOPTERA',
      fill: '#FFF5D6',
      p: clamp(p * 3),
    });
    K.sticker(ctx, 770, 520, 125, 0.05, (c, r) => {
      // Bird of paradise plume icon
      c.fillStyle = P.gold;
      for (let i = -2; i <= 2; i++) {
        c.beginPath(); c.ellipse(i * 18, 12, 10, r * 0.65, i * 0.22, 0, TAU); c.fill();
      }
      c.fillStyle = P.red;
      c.beginPath(); c.arc(0, -18, 32, 0, TAU); c.fill();
      c.strokeStyle = P.ink; c.lineWidth = 3.5; c.stroke();
    }, {
      label: 'CENDRAWASIH',
      fill: '#E9F5EE',
      p: clamp((p - 0.15) * 3),
    });

    K.noteCard(ctx, 540, 1040, 840, 350, -0.01, {
      tag: 'INVENTARIS SPESIMEN WALLACE',
      title: '125.660 Spesimen Alam Nusantara',
      lines: [
        '83.200 kumbang & 13.100 kupu-kupu (termasuk Sayap Burung Emas).',
        '8.050 burung awetan dari Sumatra, Maluku, hingga Papua.',
        'Lebih dari 1.000 spesies baru yang belum pernah dikenal sains.',
      ],
      accent: P.cobalt,
      p: clamp((p - 0.25) * 3),
    });
    K.rubberStamp(ctx, 790, 830, '125.660 SPESIMEN', { color: P.red, rot: -0.08, p: clamp((p - 0.4) * 3) });
    ctx.restore();
  }

  // Scene 4: Seberang — Crossing the narrow 35 km Lombok Strait
  const a4 = fade('seberang', t, 0.3, 0.3);
  if (a4 > 0) {
    ctx.save(); ctx.globalAlpha = a4;
    const p = seg('seberang', t);
    K.photoCard(ctx, 540, 590, 840, 550, 0.012, (c, ix, iy, iw, ih) => {
      c.fillStyle = '#C6E0EE'; c.fillRect(ix, iy, iw, ih);
      // Left island: BALI
      c.fillStyle = '#7FA862'; c.strokeStyle = P.ink; c.lineWidth = 4;
      c.beginPath(); c.ellipse(ix + iw * 0.22, iy + ih * 0.55, 135, 95, -0.1, 0, TAU); c.fill(); c.stroke();
      // Right island: LOMBOK
      c.beginPath(); c.ellipse(ix + iw * 0.78, iy + ih * 0.55, 130, 95, 0.1, 0, TAU); c.fill(); c.stroke();
      // Red Wallace Line down the middle strait
      c.strokeStyle = P.red; c.lineWidth = 7; c.setLineDash([12, 8]);
      c.beginPath(); c.moveTo(ix + iw * 0.5, iy + 20); c.lineTo(ix + iw * 0.5, iy + ih - 20); c.stroke();
      c.setLineDash([]);
      // Distance caliper arrow
      c.fillStyle = P.ink; c.font = `700 28px '${K.FONT.mono}'`; c.textAlign = 'center';
      c.fillText('BALI', ix + iw * 0.22, iy + ih * 0.55);
      c.fillText('LOMBOK', ix + iw * 0.78, iy + ih * 0.55);
      c.fillStyle = P.red;
      c.fillText('← 35 KM →', ix + iw * 0.5, iy + ih * 0.22);
    }, {
      caption: 'SELAT LOMBOK · HANYA ±35 KILOMETER',
      sub: 'Juni 1856: Pelayaran singkat yang mengubah ilmu evolusi & biogeografi',
      p: clamp(p * 3),
    });

    K.noteCard(ctx, 540, 1120, 820, 260, -0.015, {
      tag: 'KEJUTAN DI PELABUHAN AMPENAN',
      title: 'Selat Sempit, Beda Benua',
      lines: [
        'Jarak Jawa ke Bali lebih dekat, dan faunanya identik.',
        'Namun menyeberang Bali ke Lombok seperti melompat dari Asia ke Australia!',
      ],
      p: clamp((p - 0.2) * 3),
    });
    ctx.restore();
  }

  // Scene 5: Hewan — Side-by-side comparison: Asian Fauna (Bali) vs Australian Fauna (Lombok)
  const a5 = fade('hewan', t, 0.3, 0.3);
  if (a5 > 0) {
    ctx.save(); ctx.globalAlpha = a5;
    const p = seg('hewan', t);
    K.sticker(ctx, 290, 520, 130, -0.05, (c, r) => drawTigerIcon(c, r), {
      label: 'FAUNA ASIA (BALI)',
      fill: '#FFE8D1',
      p: clamp(p * 3),
    });
    K.sticker(ctx, 790, 520, 130, 0.05, (c, r) => drawCockatooIcon(c, r), {
      label: 'FAUNA AUSTRALIA',
      fill: '#E5F4FF',
      p: clamp((p - 0.15) * 3),
    });

    K.noteCard(ctx, 300, 1020, 420, 380, -0.02, {
      tag: 'BARAT GARIS (BALI)',
      title: 'Paparan Sunda',
      lines: [
        'Harimau & Macan Tutul',
        'Kera, Orangutan & Gajah',
        'Burung Pelatuk & Merak',
      ],
      accent: P.red,
      p: clamp((p - 0.25) * 3),
    });
    K.noteCard(ctx, 780, 1020, 420, 380, 0.02, {
      tag: 'TIMUR GARIS (LOMBOK)',
      title: 'Wallacea & Sahul',
      lines: [
        'Kakatua Jambul Kuning',
        'Burung Maleo & Kasuari',
        'Kuskus (Mamalia Berkantung)',
      ],
      accent: P.teal,
      p: clamp((p - 0.32) * 3),
    });
    ctx.restore();
  }

  // Scene 6: Dalam — Ice Age Sea Level & Deep Lombok Trench cross-section
  const a6 = fade('dalam', t, 0.3, 0.2);
  if (a6 > 0) {
    ctx.save(); ctx.globalAlpha = a6;
    const p = seg('dalam', t);
    K.photoCard(ctx, 540, 590, 850, 550, -0.01, (c, ix, iy, iw, ih) => {
      K.drawArchipelagoMap(c, ix, iy, iw, ih, {
        wallaceProg: 1,
        routeProg: 1,
        seaLevelDrop: clamp((p - 0.1) * 1.8),
      });
    }, {
      caption: 'ZAMAN ES: PAPARAN SUNDA MENYATU DENGAN ASIA',
      sub: 'Palung Selat Lombok (>300–1.000 m) tidak pernah kering selama jutaan tahun',
      p: clamp(p * 3),
    });

    K.noteCard(ctx, 540, 1120, 830, 270, 0.01, {
      tag: 'KESIMPULAN JURNAL WALLACE',
      title: 'Jurang Laut Abadi di Selat Lombok',
      lines: [
        'Saat Zaman Es, permukaan laut turun 120 meter: Sumatra, Jawa & Bali menyatu.',
        'Namun Selat Lombok terlalu dalam—menjadi benteng air abadi bagi satwa darat.',
      ],
      accent: P.cobalt,
      p: clamp((p - 0.2) * 3),
    });
    K.rubberStamp(ctx, 800, 860, 'GARIS WALLACE', { color: P.red, rot: -0.09, p: clamp((p - 0.4) * 3) });
    ctx.restore();
  }
}
