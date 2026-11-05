// Dunia 3D Painterly — Demo 1: Legenda Telaga Warna Puncak (64s)
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
  stage = createPainterlyStage(AM, { skyColor: 0x243b61, fogDensity: 0.018 });
  world = buildHighlandWorld(stage.scene, { mode: 'telaga' });
  ui = AM.layer('ui', { z: 2 });
  AM.sfx('chime', 0.5, { gain: 0.35 });
  AM.sfx('whoosh', 24.0, { gain: 0.35 });
  AM.sfx('pop', 40.0, { gain: 0.4 });
  AM.sfx('chime', 50.0, { gain: 0.45 });
}

export function render(t) {
  let lakeScale = 1.0;
  let jewelBurst = 0.15;
  let colorShift = 0;

  if (t >= 8 && t < 44) {
    lakeScale = lerp(1.0, 0.08, pr(t, 8, 12));
    jewelBurst = t >= 24 ? lerp(0.1, 1.0, pr(t, 24, 42)) : 0.05;
  } else if (t >= 44) {
    lakeScale = lerp(0.08, 1.08, pr(t, 44, 54));
    jewelBurst = lerp(1.0, 0.45, pr(t, 44, 56));
    colorShift = 1;
  }

  if (t >= 38 && t < 50) {
    stage.setMood(0x1e293b, 0xfbbf24, 1.05);
  } else if (t >= 50) {
    stage.setMood(0x284b63, 0xffe49e, 1.24);
  } else {
    stage.setMood(0x243b61, 0xffd285, 1.18);
  }

  world.update(t, { lakeScale, jewelBurst, colorShift });

  const camAngle = t * 0.18 - 0.6;
  const camRadius = lerp(14.5, 9.8, Math.sin(t * 0.12) * 0.5 + 0.5);
  const camHeight = lerp(4.8, 7.6, pr(t, 42, 58));
  stage.cam.position.set(
    Math.cos(camAngle) * camRadius,
    camHeight,
    Math.sin(camAngle) * camRadius
  );
  stage.cam.lookAt(0, 0.6, 0);

  stage.render();

  const chapters = [
    {
      until: 8,
      chapter: 'BAB I • PUNCAK BOGOR, JAWA BARAT',
      title: 'Telaga Warna di Tengah Hutan Kabut',
      subtitle: 'Danau kawah tenang yang memantulkan lima spektrum warna zamrud hingga keemasan',
      badge: '1.400 MDPL',
    },
    {
      until: 16,
      chapter: 'BAB II • KERAJAAN KUTATANGGEUHAN',
      title: 'Negeri Makmur Prabu Suwartalaya',
      subtitle: 'Kerajaan pegunungan Sunda kuno yang tenteram bersama Ratu Purbamanah',
      badge: 'LEGENDA SUNDA',
    },
    {
      until: 24,
      chapter: 'BAB III • PUTRI GILANG RUKMINI',
      title: 'Putri Tunggal yang Sangat Dimanja',
      subtitle: 'Dikasihi seluruh negeri namun tumbuh keras kepala di lingkungan istana',
      badge: 'PEWARIS TAHTA',
    },
    {
      until: 32,
      chapter: 'BAB IV • PERSEMBAHAN RAKYAT',
      title: 'Kepingan Emas & Permata Lima Warna',
      subtitle: 'Rakyat dari seluruh penjuru negeri menyumbangkan batu mulia terbaik mereka',
      badge: 'ULANG TAHUN KE-17',
    },
    {
      until: 40,
      chapter: 'BAB V • MAHKOTA PERHIASAN ISTANA',
      title: 'Kalung Zamrud, Safir, Rubi & Kecubung',
      subtitle: 'Dirangkai dengan penuh cinta sebagai lambang kasih sayang rakyat dan orang tua',
      badge: '5 WARNA PERMATA',
    },
    {
      until: 48,
      chapter: 'BAB VI • PERMATA YANG BERHAMBURAN',
      title: 'Kalung Ditepis Putus di Alun-Alun',
      subtitle: 'Butiran batu mulia terpental ke segala penjuru lantai batu istana',
      badge: 'TRAGEDI ISTANA',
    },
    {
      until: 56,
      chapter: 'BAB VII • MATA AIR DARI CELAH BATU',
      title: 'Tangis Pilu yang Menggetarkan Lembah',
      subtitle: 'Air bah menyembur deras dari celah tanah tempat permata-permata itu jatuh',
      badge: 'MATA AIR ABADI',
    },
    {
      until: 90,
      chapter: 'BAB VIII • KILAU DI DASAR TELAGA',
      title: 'Lahirnya Telaga Warna yang Berkilau',
      subtitle: 'Pantulan lima warna permata konon masih berpendar dari dasar danau hingga kini',
      badge: 'WARISAN NUSANTARA',
    },
  ];
  const active = chapters.find((c) => t < c.until) || chapters[chapters.length - 1];
  drawPainterlyHUD(ui, t, active);
}
