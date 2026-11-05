// Dunia 3D Painterly — Demo 3: Lembah Harau & Kabut Pagi (65s)
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
  stage = createPainterlyStage(AM, { skyColor: 0x2c4869, fogDensity: 0.02 });
  world = buildHighlandWorld(stage.scene, { mode: 'harau' });
  ui = AM.layer('ui', { z: 2 });
  AM.sfx('chime', 0.5, { gain: 0.35 });
  AM.sfx('whoosh', 16.0, { gain: 0.38 });
  AM.sfx('pop', 36.0, { gain: 0.4 });
  AM.sfx('chime', 52.0, { gain: 0.45 });
}

export function render(t) {
  let lakeScale = 0.72;
  let jewelBurst = 0.35;
  if (t >= 16 && t < 38) {
    lakeScale = lerp(0.72, 1.18, pr(t, 16, 26));
    stage.setMood(0x1a365d, 0x7dd3fc, 1.12);
  } else if (t >= 38) {
    lakeScale = lerp(1.18, 0.65, pr(t, 38, 48));
    jewelBurst = lerp(0.35, 0.85, pr(t, 46, 58));
    stage.setMood(0x355c7d, 0xffd285, 1.24);
  } else {
    stage.setMood(0x2c4869, 0xffe49e, 1.18);
  }

  world.update(t, { lakeScale, jewelBurst, colorShift: 0 });

  const camAngle = t * 0.15 - 1.1;
  const camRadius = lerp(12.2, 9.4, Math.sin(t * 0.14) * 0.5 + 0.5);
  const camHeight = lerp(3.4, 6.2, pr(t, 32, 56));
  stage.cam.position.set(
    Math.cos(camAngle) * camRadius,
    camHeight,
    Math.sin(camAngle) * camRadius
  );
  stage.cam.lookAt(0, 1.4, 0);

  stage.render();

  const chapters = [
    {
      until: 8,
      chapter: 'BAB I • LIMA PULUH KOTA, SUMATERA BARAT',
      title: 'Kabut Pagi di Lembah Harau',
      subtitle: 'Hamparan sawah hijau subur yang dikelilingi dinding tebing batu tegak lurus',
      badge: 'RANAH MINANG',
    },
    {
      until: 16,
      chapter: 'BAB II • BENTENG GRANIT & BREKSI',
      title: 'Dinding Ngarai Setinggi 100–500 Meter',
      subtitle: 'Tebing kemerahan yang menjulang megah bak monumen alam raksasa',
      badge: 'TINGGI 500 M',
    },
    {
      until: 24,
      chapter: 'BAB III • 40 JUTA TAHUN LALU (ZAMAN EOSEN)',
      title: 'Dahulu Kala Adalah Dasar Laut Purba',
      subtitle: 'Cekungan Lembah Harau awalnya merupakan teluk perairan dangkal prasejarah',
      badge: '40 JUTA TAHUN',
    },
    {
      until: 32,
      chapter: 'BAB IV • JEJAK FOSIL & BATU PASIR KUARSA',
      title: 'Bukti Geologi Endapan Dasar Samudra',
      subtitle: 'Lapisan konglomerat dan batupasir menyimpan jejak organik perairan masa lampau',
      badge: 'BUKTI SEDIMEN',
    },
    {
      until: 40,
      chapter: 'BAB V • TUMBUKAN LEMPENG TEKTONIK',
      title: 'Pengangkatan Kerak Bumi Sumatera',
      subtitle: 'Desakan lempeng Indo-Australia dan Eurasia mengangkat dasar laut ke daratan tinggi',
      badge: 'TEKTONIK',
    },
    {
      until: 48,
      chapter: 'BAB VI • PATAHAN & EROSI JUTAAN TAHUN',
      title: 'Ukiran Alam yang Membentuk Ngarai Curam',
      subtitle: 'Sesar patahan vertikal dan kikisan air hujan memahat tebing lurus yang ikonik',
      badge: 'PAHATAN ALAM',
    },
    {
      until: 56,
      chapter: 'BAB VII • TUJUH AIR TERJUN SARASAH',
      title: 'Curahan Air Jernih dari Puncak Tebing',
      subtitle: 'Sarasah Bunta, Aie Luluih, dan Murai mengairi sawah petani sepanjang tahun',
      badge: '7 AIR TERJUN',
    },
    {
      until: 90,
      chapter: 'BAB VIII • SURGA GEOLOGI MINANGKABAU',
      title: 'Dari Dasar Laut Menjadi Lembah Subur',
      subtitle: 'Mahakarya waktu yang memadukan keagungan geologi dan kedamaian pedesaan',
      badge: 'CAGAR ALAM',
    },
  ];
  const active = chapters.find((c) => t < c.until) || chapters[chapters.length - 1];
  drawPainterlyHUD(ui, t, active);
}
