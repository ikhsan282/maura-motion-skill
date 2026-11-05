// 68 · STICKMAN KISAH — Demo 2: Satu Langkah Menyerobot Antrean
import * as K from '/styles/stickman-kisah/kit.js';
const { clamp, ease } = AM.lib;

export const meta = { fps: 30, width: 1080, height: 1920, captions: { preset: 'clean', y: 1620, size: 48 } };

let ctx;
const C = {};
const pop = (t, a, d = 0.4) => ease.outBack(clamp((t - a) / d), 1.8);

export async function setup(AM) {
  ctx = AM.layer('world');
  for (const l of AM.timeline.lines) C[l.id] = l;
}

export function render(t) {
  ctx.clearRect(0, 0, 1080, 1920);
  const floorY = 760;

  let phase = 0;
  if (t >= C.budaya.start) phase = 3;
  else if (t >= C.tegur.start) phase = 2;
  else if (t >= C.serobot.start) phase = 1;

  const signs = [
    ['UJIAN KARAKTER DI RUANG PUBLIK', K.PAL.gold],
    ['ALASAN KLASIK: CUMA SEBENTAR KOK!', K.PAL.coral],
    ['MENEGUR DENGAN TENANG & TEGAS', K.PAL.cyan],
    ['TERTIB ADALAH KONTRAK SOSIAL', K.PAL.emerald],
  ][phase];

  K.kisahBg(ctx, t, { floorY, signText: signs[0], signCol: signs[1] });

  const headers = [
    ['ANTREAN', 'CERMIN KARAKTER SEJATI', 'Ketertiban Kecil Menunjukkan Kedewasaan Moral Seseorang'],
    ['SEROBOT', 'MERAMPAS WAKTU ORANG LAIN', 'Menganggap Urusan Sendiri Lebih Penting dari Semua Orang'],
    ['BERANI', 'TEGURAN SOPAN YANG MENGUBAH KEADAAN', 'Diam Saat Hak Dilanggar Hanya Membuat Pelanggar Makin Berani'],
    ['ADIL', 'WAKTU SEMUA ORANG SAMA BERHARGANYA', 'Budaya Antre Adalah Pondasi Masyarakat yang Beradab'],
  ][phase];

  K.kisahHeader(ctx, 'EPISODE 02 • ETIKA RUANG PUBLIK', headers[1], headers[2], {
    badge: headers[0], col: signs[1],
  });

  K.kisahStageProps(ctx, floorY, 'antrean', { phase, t });

  // Protagonist Raka in queue (x = 510)
  K.kisahStickman(ctx, 510, floorY, phase === 2 ? 'point' : 'talk', {
    role: 'hero', facing: -1, t, label: 'RAKA (TERTIB)',
  });

  // Citizen in queue behind Raka (x = 710)
  K.kisahStickman(ctx, 710, floorY, 'talk', {
    role: 'citizen', facing: -1, t, label: 'WARGA ANTRE',
  });

  // Line cutter (Rival): cuts to front (x = 340) in phases 1-2, moves to back (x = 890) in phase 3!
  const rivalX = phase === 0 ? 890 : phase === 3 ? 890 : 340;
  const rivalPose = phase === 1 ? 'evade' : phase === 2 ? 'beg' : 'talk';
  K.kisahStickman(ctx, rivalX, floorY, rivalPose, {
    role: 'rival', facing: -1, t, label: phase === 3 ? 'IKUT ANTRE' : 'PENYEROBOT',
  });

  if (phase === 1) {
    K.kisahBubble(ctx, 360, 420, 'Cuma mau tanya sebentar kok!', { col: K.PAL.coral, tailX: 340 });
  } else if (phase === 2) {
    K.kisahBubble(ctx, 540, 420, 'Maaf Pak, antre dari belakang ya.', { col: K.PAL.emerald, tailX: 510 });
  } else if (phase === 3) {
    K.kisahBubble(ctx, 510, 420, 'Tertib bikin semua cepat selesai.', { col: K.PAL.emerald, tailX: 510 });
    K.kisahBubble(ctx, 860, 420, 'Siap, saya antre di belakang.', { col: K.PAL.gold, tailX: 890 });
  }

  if (phase === 0) {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'INDIKATOR INTEGRITAS SEHARI-HARI',
      titleStr: 'Karakter Terlihat Saat Kita Harus Menunggu Giliran',
      subStr: 'Kesabaran di barisan antrean mencerminkan rasa hormat kepada sesama',
      stat: 'TERTIB',
      statSub: 'CERMIN ADAB',
      col: K.PAL.gold,
      a: pop(t, C.hook.start + 0.2),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'ATURAN TIDAK TERTULIS RUANG PUBLIK',
      titleStr: 'Siapa yang Datang Lebih Awal Berhak Dilayani Lebih Dulu',
      subStr: 'Prinsip keadilan sederhana yang menjaga harmoni jutaan orang setiap hari',
      stat: 'ADIL',
      statSub: 'PRINSIP DASAR',
      col: K.PAL.cyan,
      a: pop(t, C.pagi.start),
    });
  } else if (phase === 1) {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'RASIONALISASI SI PENYEROBOT',
      titleStr: 'Kalimat "Cuma Sebentar" Adalah Bentuk Pencurian Waktu',
      subStr: 'Satu menit dari dua puluh orang di belakang sama dengan dua puluh menit yang dirampas',
      stat: '-20 MNT',
      statSub: 'WAKTU DIRAMPAS',
      col: K.PAL.coral,
      a: pop(t, C.serobot.start),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'EFEK BYSTANDER DALAM ANTREAN',
      titleStr: 'Jika Semua Orang Diam, Pelanggaran Menjadi Kebiasaan',
      subStr: 'Rasa sungkan menegur sering dimanfaatkan oleh orang yang tidak tahu malu',
      stat: 'JANGAN',
      statSub: 'BIARKAN',
      col: K.PAL.gold,
      a: pop(t, C.diam.start),
    });
  } else if (phase === 2) {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'KOMUNIKASI ASERTIF & BERMARTABAT',
      titleStr: 'Menegur Tanpa Membentak: Tenang, Jelas, dan Tegas',
      subStr: 'Fokus pada aturan bersama, bukan menyerang pribadi, agar didukung warga sekitar',
      stat: 'ASERTIF',
      statSub: 'SOPAN & TEGAS',
      col: K.PAL.emerald,
      a: pop(t, C.tegur.start),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'KEKUATAN DUKUNGAN SOSIAL',
      titleStr: 'Satu Suara Berani Menggerakkan Keberanian Bersama',
      subStr: 'Ketika masyarakat kompak menjaga aturan, pelanggar otomatis merasa malu',
      stat: 'KOMPAK',
      statSub: 'KONTROL SOSIAL',
      col: K.PAL.cyan,
      a: pop(t, C.kompak.start),
    });
  } else {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'FILOSOFI KONTRAK SOSIAL',
      titleStr: 'Ketertiban Bukan Karena Diawasi, Melainkan Kesadaran',
      subStr: 'Bangsa yang maju dimulai dari warganya yang rela mengantre dengan jujur',
      stat: 'BERADAB',
      statSub: 'SADAR ATURAN',
      col: K.PAL.gold,
      a: pop(t, C.budaya.start),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN MORAL GARIS HIDUP',
      titleStr: 'Menghormati Antrean = Menghormati Martabat Manusia',
      subStr: 'Mulai dari diri sendiri dan berani menjaga ketertiban di sekitar kita',
      stat: 'RESPEK',
      statSub: 'HAK BERSAMA',
      col: K.PAL.emerald,
      a: pop(t, C.tegas.start),
    });
  }
}

