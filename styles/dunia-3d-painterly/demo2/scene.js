// Dunia 3D Painterly — Demo 2: Danau Kelimutu Flores (64s)
import {
  lerp,
  pr,
  createPainterlyStage,
  buildHighlandWorld,
  drawPainterlyHUD,
} from '/styles/dunia-3d-painterly/kit.js';

export const meta = {
  fps: 24,
  hold: 1,
  captions: {
    preset: 'clean',
    y: 1480,
    size: 52,
    box: { fill: 'rgba(15, 28, 46, 0.88)', pad: 16, radius: 14, border: 'rgba(253, 224, 71, 0.45)', borderW: 2 },
  },
};

let stage, world, ui;

export async function setup(AM) {
  stage = createPainterlyStage(AM, { skyColor: 0x1e355e, fogDensity: 0.016 });
  world = buildHighlandWorld(stage.scene, { mode: 'kelimutu' });
  ui = AM.layer('ui', { z: 2 });
  AM.sfx('chime', 0.5, { gain: 0.35 });
  AM.sfx('whoosh', 16.0, { gain: 0.35 });
  AM.sfx('pop', 32.0, { gain: 0.38 });
  AM.sfx('chime', 48.0, { gain: 0.45 });
}

export function render(t) {
  const jewelBurst = t >= 40 ? lerp(0.15, 0.9, pr(t, 40, 54)) : 0.12;
  const colorShift = t >= 46 ? 1 : 0;

  if (t < 16) {
    stage.setMood(0x1e355e, 0xffd285, 1.15);
  } else if (t < 40) {
    stage.setMood(0x284b63, 0xffe49e, 1.22);
  } else {
    stage.setMood(0x314e68, 0xffcf70, 1.26);
  }

  world.update(t, { lakeScale: 1.0, jewelBurst, colorShift });

  let targetX = 0;
  let targetZ = 0;
  if (t >= 16 && t < 24) {
    targetX = -2.4;
    targetZ = 0.4;
  } else if (t >= 24 && t < 32) {
    targetX = 1.8;
    targetZ = 0.9;
  } else if (t >= 32 && t < 40) {
    targetX = 0.2;
    targetZ = -2.4;
  }

  const camAngle = t * 0.16 - 0.8;
  const camRadius = lerp(13.2, 10.5, Math.sin(t * 0.15) * 0.5 + 0.5);
  const camHeight = lerp(6.2, 8.8, pr(t, 38, 58));

  stage.cam.position.set(
    Math.cos(camAngle) * camRadius,
    camHeight,
    Math.sin(camAngle) * camRadius
  );
  stage.cam.lookAt(targetX, -0.1, targetZ);

  stage.render();

  const chapters = [
    {
      until: 8,
      chapter: 'BAB I • PUNCAK KELIMUTU, ENDE — FLORES',
      title: 'Tiga Danau Kawah di Atas Awan',
      subtitle: 'Fenomena tiga kawah vulkanik berdampingan dengan warna air yang terus berubah',
      badge: '1.639 MDPL',
    },
    {
      until: 16,
      chapter: 'BAB II • KEPERCAYAAN ADAT SUKU LIO',
      title: 'Penjaga Gerbang Arwah Leluhur',
      subtitle: 'Masyarakat lokal menghormati ketiga kawah sebagai tempat peristirahatan jiwa',
      badge: 'TRADISI LIO',
    },
    {
      until: 24,
      chapter: 'BAB III • TIWU ATA MBUPU (KAWAH BARAT)',
      title: 'Danau Biru Para Tetua Bijaksana',
      subtitle: 'Kawah tenang di sisi barat yang dipercaya menjadi tempat arwah orang tua',
      badge: 'KAWAH I • BIRU',
    },
    {
      until: 32,
      chapter: 'BAB IV • TIWU NUWA MURI KOO FAI',
      title: 'Danau Hijau Toska Jiwa Muda-Mudi',
      subtitle: 'Kawah terbesar di tengah dengan dinding batu curam dan air zamrud menyala',
      badge: 'KAWAH II • TOSKA',
    },
    {
      until: 40,
      chapter: 'BAB V • TIWU ATA POLO (KAWAH TENGGARA)',
      title: 'Kawah Merah Gelap yang Bergejolak',
      subtitle: 'Terpisah dinding kawah tersendiri dengan warna merah tua hingga cokelat pekat',
      badge: 'KAWAH III • MERAH',
    },
    {
      until: 48,
      chapter: 'BAB VI • AKTIVITAS FUMAROL BAWAH AIR',
      title: 'Ventilasi Gas Vulkanik yang Berbeda',
      subtitle: 'Setiap kawah memiliki jalur rekahan gas panas bumi yang unik di dasarnya',
      badge: 'GEOLOGI VULKANIK',
    },
    {
      until: 56,
      chapter: 'BAB VII • REAKSI KIMIA MINERAL & BELERANG',
      title: 'Kadar Besi, Mangan & Oksigen Terlarut',
      subtitle: 'Perubahan tekanan gas mengubah oksidasi mineral sehingga air berganti warna',
      badge: 'KIMIA HIDROTERMAL',
    },
    {
      until: 90,
      chapter: 'BAB VIII • FAJAR EMAS DI ATAS FLORES',
      title: 'Harmoni Legenda & Sains Bumi',
      subtitle: 'Keajaiban Taman Nasional Kelimutu yang memukau penjelajah dari seluruh dunia',
      badge: 'TAMAN NASIONAL',
    },
  ];
  const active = chapters.find((c) => t < c.until) || chapters[chapters.length - 1];
  drawPainterlyHUD(ui, t, active);
}
