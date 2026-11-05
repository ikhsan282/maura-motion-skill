// 71 · STICKMAN CAVEMAN — Demo 2: Harimau Sabertooth vs Notifikasi (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-caveman/kit.js';
const { clamp, ease } = AM.lib;

export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1700, size: 48 } };

let ctx;
const C = {};
const pop = (t, a, d = 0.45) => ease.outBack(clamp((t - a) / d), 1.7);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);
  const floorY = 1240;

  let beat = 0;
  if (t >= C.moral?.start) beat = 7;
  else if (t >= C.label?.start) beat = 6;
  else if (t >= C.vagus?.start) beat = 5;
  else if (t >= C.napas?.start) beat = 4;
  else if (t >= C.bajak?.start) beat = 3;
  else if (t >= C.buta?.start) beat = 2;
  else if (t >= C.sabertooth?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.15; fx = 580; fy = 920;
  } else if (beat >= 4) {
    zoom = 1.16; fx = 520; fy = 940;
  }

  const tags = [
    'GUA 01 • JANTUNG BERDEBAR KARENA CHAT',
    'GUA 02 • ALARM PURBA: HARIMAU SABERTOOTH',
    'GUA 03 • AMIGDALA BUTA: PREDATOR VS NOTIF',
    'GUA 04 • AMYGDALA HIJACK: DARAH KABUR KE KAKI',
    'GUA 05 • RESET PROTOKOL: TARIK 4S, HEMBUS 8S',
    'GUA 06 • AKTIVASI SARAF VAGUS TUBUH',
    'GUA 07 • LABELING EMOSI: NAME IT TO TAME IT',
    'GUA 08 • TENANGKAN SI UGA, BERPIKIR JERNIH!',
  ];

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.cavemanBg(ctx, t, { floorY, stageTag: tags[beat], col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.fire : K.PAL.ochre) });
    K.cavemanProps(ctx, floorY, beat >= 4 ? 'fire' : 'painting', { phase: beat >= 4 ? 2 : 0, t });

    const charX = beat <= 3 ? 380 : 470;
    const pose = beat === 0 ? 'scratch' : beat === 1 ? 'push' : beat <= 3 ? 'push' : beat <= 5 ? 'scratch' : 'triumph';
    K.cavemanStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Deg-degan cuma gara-gara notif chat?!',
      'Awas harimau bertaring menyerang!',
      'Amigdala buta: chat dikira predator!',
      'Darah ke kaki, kepala mendadak buntu!',
      'Tarik napas 4 detik, embus 8 detik...',
      'Saraf vagus aktif, tubuh kembali aman!',
      'Sebut nama emosimu: Aku cemas!',
      'Penjaga gua tenang, pikiran kembali jernih!',
    ];
    K.cavemanBubble(ctx, charX + 50, floorY - 380, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 300, col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.fire : K.PAL.ochre),
    });
  });

  const headers = [
    ['PANIK?', 'JANTUNG BERDEBAR KARENA CHAT', 'Mengapa Notifikasi Kerja Memicu Alarm Bahaya Tubuh?'],
    ['SABERTOOTH', 'PENJAGA PURBA 200.000 TAHUN', 'Amigdala Berevolusi Menyelamatkan Kita dari Predator'],
    ['BUTA!', 'NOTIFIKASI DIKIRA AUMAN PREDATOR', 'Otak Bawah Sadar Belum Mengenal Layar Ponsel Modern'],
    ['HIJACK!', 'DARAH KABUR KE OTOT KAKI', 'Saat Mode Fight-or-Flight Aktif, Otak Logis Melemah'],
    ['NAPAS 4:8', 'PHYSIOLOGICAL SIGH PROTOCOL', 'Tarik 4 Detik, Buang 8 Detik untuk Mematikan Sirene'],
    ['VAGUS', 'AKTIVASI SISTEM SARAF PARASIMPATIK', 'Kirim Sinyal Fisiologis Bahwa Dirimu Aman Terkendali'],
    ['NAME IT', 'LABELING EMOSI SECARA SADAR', 'Tuliskan Emosimu: Memberi Nama Langsung Meredam Panik'],
    ['JERNIH!', 'TENANGKAN DULU PENJAGA GUAMU', 'Kendalikan Tubuh Terlebih Dahulu, Baru Selesaikan Masalah'],
  ][beat];

  K.cavemanHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 4 ? K.PAL.teal : (beat === 2 || beat === 3 ? K.PAL.fire : K.PAL.ochre),
  });

  const callouts = [
    { tag: 'RESPON FISIK', title: 'Jantung Berdegup & Tangan Dingin Saat Notif Masuk', desc: 'Respon amigdala memicu sekresi hormon adrenalin dan kortisol', stat: 'ALARM', col: K.PAL.amber, c: C.hook },
    { tag: 'FUNGSI AMIGDALA', title: 'Penjaga Gua Otomatis Menghadapi Ancaman Nyata', desc: 'Di alam liar purba, lambat bereaksi berarti jadi mangsa predator', stat: 'SURVIVAL', col: K.PAL.ochre, c: C.sabertooth },
    { tag: 'ANALOGI DIGITAL', title: 'Amigdala Tidak Bisa Membedakan Chat vs Predator', desc: 'Pesan "Revisi sekarang!" diterjemahkan sebagai ancaman nyawa', stat: 'BUTA', col: K.PAL.fire, c: C.buta },
    { tag: 'AMYGDALA HIJACK', title: 'Aliran Darah Dialihkan ke Kaki, Otak Logis Lumpuh', desc: 'Prefrontal cortex mati rasa, kamu kesulitan berpikir objektif', stat: 'HIJACK', col: K.PAL.fire, c: C.bajak },
    { tag: 'TEKNIK PERNAPASAN', title: 'Tarik 4 Detik, Buang Perlahan 8 Detik', desc: 'Embusan napas lebih panjang memicu pelepasan neurotransmitter relaks', stat: '4 : 8 DETIK', col: K.PAL.teal, c: C.napas },
    { tag: 'SARAF VAGUS', title: 'Stimulasi Vagal Menurunkan Detak Jantung Cepat', desc: 'Tubuh memberi perintah balik ke otak bahwa keadaan sudah aman', stat: 'PARASIMPATIK', col: K.PAL.teal, c: C.vagus },
    { tag: 'NAME IT TO TAME IT', title: 'Tuliskan Emosimu: Mengurangi Reaktivitas Otak', desc: 'Penelitian UCLA: Melabeli emosi mematikan alarm amigdala', stat: 'LABELING', col: K.PAL.amber, c: C.label },
    { tag: 'PESAN UTAMA', title: 'Kendalikan Fisiologi Dulu Sebelum Bertindak', desc: 'Tarik napas panjang, amankan pikiran, dan selesaikan tugas jernih!', stat: 'TENANG', col: K.PAL.ochre, c: C.moral },
  ][beat];

  K.cavemanCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
