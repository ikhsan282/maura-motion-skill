// 68 · STICKMAN KISAH — Demo 3: Baret di Parkiran & Selembar Kertas
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
  if (t >= C.maaf.start) phase = 3;
  else if (t >= C.surat.start) phase = 2;
  else if (t >= C.insiden.start) phase = 1;

  const signs = [
    ['UJIAN INTEGRITAS TANPA SAKSI', K.PAL.gold],
    ['PILIHAN: KABUR ATAU TANGGUNG JAWAB?', K.PAL.coral],
    ['SELEMBAR KERTAS KEJUJURAN', K.PAL.cyan],
    ['KEJUJURAN MELULUHkAN AMARAH', K.PAL.emerald],
  ][phase];

  K.kisahBg(ctx, t, { floorY, signText: signs[0], signCol: signs[1] });

  const headers = [
    ['SEPI', 'SAAT TIDAK ADA YANG MELIHAT', 'Integritas Adalah Melakukan Hal Benar Meski Tanpa Pengawas'],
    ['BARET!', 'GODAAN UNTUK LARI DARI KESALAHAN', 'Ketika Teman Membisikkan Jalan Pintas yang Pengecut'],
    ['SURAT', 'MENINGGALKAN NOMOR & PERMOHONAN MAAF', 'Berani Menghadapi Konsekuensi Demi Menjaga Hati Nurani'],
    ['RESPEK', 'KEJUJURAN JAUH LEBIH MAHAL DARI CAT MOBIL', 'Sikap Ksatria Mengubah Kemarahan Menjadi Penghargaan'],
  ][phase];

  K.kisahHeader(ctx, 'EPISODE 03 • TANGGUNG JAWAB & NURANI', headers[1], headers[2], {
    badge: headers[0], col: signs[1],
  });

  K.kisahStageProps(ctx, floorY, 'parkir', { phase, t });

  // Protagonist Dimas (Hero) standing near the car (x = 590)
  K.kisahStickman(ctx, 590, floorY, phase === 2 ? 'give' : phase === 3 ? 'happy' : 'talk', {
    role: 'hero', facing: -1, t, label: 'DIMAS (JUJUR)',
  });

  // Second Character: Tempting Friend in phases 0-2, Car Owner (Citizen) in phase 3!
  if (phase < 3) {
    K.kisahStickman(ctx, 830, floorY, phase === 1 ? 'evade' : 'talk', {
      role: 'rival', facing: -1, t, label: 'TEMAN (KABUR)',
    });
  } else {
    K.kisahStickman(ctx, 830, floorY, 'happy', {
      role: 'citizen', facing: -1, t, label: 'PEMILIK MOBIL',
    });
  }

  if (phase === 1) {
    K.kisahBubble(ctx, 430, 420, 'Nggak bisa, ini salahku.', { col: K.PAL.emerald, tailX: 550 });
    K.kisahBubble(ctx, 830, 420, 'Kabur aja, nggak ada CCTV kok!', { col: K.PAL.coral, tailX: 830 });
  } else if (phase === 2) {
    K.kisahBubble(ctx, 560, 420, 'Saya tulis maaf & nomor HP di kaca.', { col: K.PAL.gold, tailX: 590 });
  } else if (phase === 3) {
    K.kisahBubble(ctx, 430, 420, 'Hati tenang tanpa beban.', { col: K.PAL.emerald, tailX: 550 });
    K.kisahBubble(ctx, 830, 420, 'Terima kasih jujur, biaya biar saya.', { col: K.PAL.cyan, tailX: 830 });
  }

  if (phase === 0) {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'DEFINISI INTEGRITAS (C.S. LEWIS)',
      titleStr: 'Melakukan Hal yang Benar Saat Tak Seorang Pun Melihat',
      subStr: 'Kepatuhan karena takut kamera hanyalah kepatuhan semu, bukan kejujuran',
      stat: 'MURNI',
      statSub: 'SUARA NURANI',
      col: K.PAL.gold,
      a: pop(t, C.hook.start + 0.2),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'DETIK KRITIS PENGAMBILAN KEPUTUSAN',
      titleStr: 'Kecelakaan Kecil Bisa Terjadi pada Siapa Saja',
      subStr: 'Yang membedakan kualitas manusia adalah responsnya setelah melakukan salah',
      stat: 'UJI DIRI',
      statSub: 'DETIK PENENTU',
      col: K.PAL.cyan,
      a: pop(t, C.hook.start + 2.5),
    });
  } else if (phase === 1) {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'BISIKAN JALAN PINTAS PENGECUT',
      titleStr: '"Aman Kok, Tidak Ada Saksi" Adalah Jebakan Moral',
      subStr: 'Lari dari tanggung jawab mungkin menyelamatkan dompet, tapi melukai harga diri',
      stat: 'TOLAK!',
      statSub: 'JALAN PENGECUT',
      col: K.PAL.coral,
      a: pop(t, C.godaan.start),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'EMPATI TERHADAP KORBAN',
      titleStr: 'Bayangkan Jika Mobil Kita Sendiri yang Ditinggal Kabur',
      subStr: 'Suara hati mengingatkan kita untuk memperlakukan orang lain secara adil',
      stat: 'EMPATI',
      statSub: 'NURANI HIDUP',
      col: K.PAL.emerald,
      a: pop(t, C.nurani.start),
    });
  } else if (phase === 2) {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'TINDAKAN KSATRIA SEDERHANA',
      titleStr: 'Selembar Kertas Maaf & Nomor Telepon di Kaca Depan',
      subStr: 'Bukti nyata bahwa kejujuran masih hidup di tengah masyarakat modern',
      stat: 'BERANI',
      statSub: 'SIAP GANTI RUGI',
      col: K.PAL.gold,
      a: pop(t, C.surat.start),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'EFEK PSIKOLOGIS PENGAKUAN TULUS',
      titleStr: 'Permohonan Maaf yang Jujur Meredakan 80% Kemarahan',
      subStr: 'Orang jauh lebih menghargai itikad baik daripada alasan yang dibuat-buat',
      stat: '-80%',
      statSub: 'REDAM EMOSI',
      col: K.PAL.cyan,
      a: pop(t, C.telepon.start),
    });
  } else {
    K.kisahCard(ctx, 540, 995, 960, 175, {
      tag: 'BUAH MANIS DARI KEJUJURAN',
      titleStr: 'Keberanian Bertanggung Jawab Melahirkan Rasa Hormat',
      subStr: 'Pemilik mobil rela membebaskan biaya karena kagum pada kejujuran Dimas',
      stat: 'RESPEK!',
      statSub: 'DIBEBASKAN',
      col: K.PAL.gold,
      a: pop(t, C.maaf.start),
    });
    K.kisahCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN MORAL GARIS HIDUP',
      titleStr: 'Baret Mobil Bisa Dicet Ulang, Baret Nurani Membekas Lama',
      subStr: 'Pilihlah tidur nyenyak dengan hati bersih daripada untung sesaat karena kabur',
      stat: 'TENANG',
      statSub: 'HATI BERSIH',
      col: K.PAL.emerald,
      a: pop(t, C.pelajaran.start),
    });
  }
}
