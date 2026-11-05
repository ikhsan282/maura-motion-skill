// 73 · STICKMAN DUO — Demo 3: Rahasia Protégé Effect & Teknik Feynman (Belajar dengan Mengajar Teman)
import * as K from '/styles/stickman-duo/kit.js';
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
  if (t >= C.untung.start) phase = 3;
  else if (t >= C.celah.start) phase = 2;
  else if (t >= C.protege.start) phase = 1;

  const tags = [
    'EPISODE 01 • ILUSI KOMPETENSI SAAT BACA SENDIRI',
    'EPISODE 02 • THE PROTÉGÉ EFFECT & TEKNIK FEYNMAN',
    'EPISODE 03 • PERTANYAAN TEMAN MEMBUKA CELAH LOGIKA',
    'EPISODE 04 • RITUAL SALING MENGAJAR 5 MENIT',
  ];

  K.duoBg(ctx, t, { floorY, episodeTag: tags[phase], col: phase >= 2 ? K.PAL.teal : K.PAL.blue });

  const headers = [
    ['10% vs 90%', 'PAHAM DI KEPALA TAPI GAGAP MENJELASKAN?', 'Mengapa Membaca Pasif Berulang-Ulang Cepat Sekali Lupa?'],
    ['90% INGAT', 'THE PROTÉGÉ EFFECT (BELAJAR = MENGAJAR)', 'Menjelaskan Materi ke Sahabat Mengunci Ingatan Jangka Panjang'],
    ['FEYNMAN', 'UJI PEMAHAMAN LEWAT BAHASA SEDERHANA', 'Pertanyaan Sahabat Menyingkap Bagian yang Belum Kita Kuasai'],
    ['DUET ILMU', 'TUKAR PENJELASAN 5 MENIT BERDUA', 'Hemat Waktu Belajar & Gandakan Pemahaman Bersama!'],
  ][phase];

  K.duoHeader(ctx, headers[0], headers[1], headers[2], {
    col: phase >= 2 ? K.PAL.teal : K.PAL.blue,
  });

  const props = [
    ['BACA PASIF', '20% INGAT', 'Merasa hafal padahal belum paham', K.PAL.red],
    ['MENGAJAR', '90% INGAT!', 'Otak menyusun struktur logika aktif', K.PAL.blue],
    ['UJI FEYNMAN', 'BAHASA MUDAH', 'Bebas jargon rumit yang menghafal buta', K.PAL.teal],
    ['TUKAR BAB', '2x LEBIH CEPAT', 'Raka Bab 1 • Bima Bab 2', K.PAL.teal],
  ][phase];
  K.duoCenterProp(ctx, floorY, props[0], props[1], props[2], { col: props[3] });

  const rakaPose = phase === 0 ? 'shock' : phase === 1 ? 'point' : phase === 2 ? 'talk' : 'highfive';
  const bimaPose = phase === 0 ? 'talk' : phase === 1 ? 'talk' : phase === 2 ? 'point' : 'highfive';

  K.duoStickman(ctx, 275, floorY, 'raka', rakaPose, { facing: 1, t });
  K.duoStickman(ctx, 805, floorY, 'bima', bimaPose, { facing: -1, t });

  const rakaLines = [
    'Tadi pas baca kayaknya paham, kok pas ditanya bingung ya?',
    'Coba aku jelasin ulang bab ini pake bahasaku sendiri!',
    'Eh bener juga pertanyaanmu, bagian itu aku belum ngecek!',
    'Sekarang aku beneran paham luar kepala, makasih Bim!',
  ];
  const bimaLines = [
    'Itu ilusi kompetensi Rak! Coba jelasin ke aku sekarang!',
    'Nah gitu! Kalau bisa ngajarin, kamu bakal ingat 90%!',
    'Habis ini giliran aku yang rangkumin bab dua buat kamu!',
    'Sama-sama Rak! Belajar berdua jadi jauh lebih nempel!',
  ];

  K.duoBubble(ctx, 285, 345, 'RAKA', rakaLines[phase], { tailX: 275, tailY: 420, col: K.PAL.red });
  K.duoBubble(ctx, 795, 345, 'BIMA', bimaLines[phase], { tailX: 805, tailY: 420, col: K.PAL.blue });

  if (phase === 0) {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'ILLUSION OF COMPETENCE (ILUSI KOMPETENSI)',
      titleStr: 'Akrab dengan Teks Buku Bukan Berarti Paham Konsepnya',
      subStr: 'Membaca ulang di dalam hati hanya melatih pengenalan visual, bukan pemanggilan memori',
      stat: 'PASIF',
      statSub: 'CEPAT LUPA',
      col: K.PAL.red,
      a: pop(t, C.hook.start + 0.2),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'UJIAN SESUNGGUHNYA DARI PEMAHAMAN',
      titleStr: 'Jika Belum Bisa Menjelaskan Secara Sederhana, Kita Belum Paham',
      subStr: 'Mulut yang gagap saat bercerita adalah indikator jujur adanya celah pengetahuan',
      stat: 'TES LISAN',
      statSub: 'DETEKSI CELAH',
      col: K.PAL.blue,
      a: pop(t, C.hook.start + 0.6),
    });
  } else if (phase === 1) {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'THE PROTÉGÉ EFFECT (EFEK MENGAJAR)',
      titleStr: 'Mengajarkan Materi ke Teman Meningkatkan Retensi ke 90%',
      subStr: 'Saat bersiap mengajar, otak menyusun informasi secara jauh lebih terstruktur',
      stat: '90% RETENSI',
      statSub: 'AKTIF MENGAJAR',
      col: K.PAL.blue,
      a: pop(t, C.protege.start),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'METODE BELAJAR RICHARD FEYNMAN',
      titleStr: 'Gunakan Analogi Sehari-hari Tanpa Bersembunyi di Balik Jargon',
      subStr: 'Jelaskan kepada temanmu seolah-olah ia baru pertama kali mendengar topik tersebut',
      stat: 'SEDERHANA',
      statSub: 'TEKNIK FEYNMAN',
      col: K.PAL.teal,
      a: pop(t, C.protege.start + 0.5),
    });
  } else if (phase === 2) {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'MANFAAT PERTANYAAN KRITIS SAHABAT',
      titleStr: '"Kenapa Bisa Begitu?" Membongkar Hafalan Buta',
      subStr: 'Pertanyaan polos dari teman memaksa otak kita mencari hubungan sebab-akibat',
      stat: 'TANYA JAWAB',
      statSub: 'DALAMI AKAR',
      col: K.PAL.teal,
      a: pop(t, C.celah.start),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'METODE PEER TEACHING 5 MENIT',
      titleStr: 'Bergantian Menjadi Guru dan Murid Setiap Selesai 1 Bab',
      subStr: 'Tidak butuh panggung kuliah; cukup obrolan fokus 5 menit bersama teman belajar',
      stat: '5 MENIT',
      statSub: 'SALING AJAR',
      col: K.PAL.blue,
      a: pop(t, C.celah.start + 0.5),
    });
  } else {
    K.duoCard(ctx, 540, 995, 960, 175, {
      tag: 'SINERGI DUA OTAK (DOUBLE MASTERY)',
      titleStr: 'Yang Mengajar Makin Paham, Yang Mendengar Cepat Mengerti',
      subStr: 'Penjelasan dari teman sebaya sering kali lebih mudah dicerna daripada buku teks kaku',
      stat: 'MENANG-MENANG',
      statSub: 'SINERGI ILMU',
      col: K.PAL.teal,
      a: pop(t, C.untung.start),
    });
    K.duoCard(ctx, 540, 1210, 960, 175, {
      tag: 'PESAN DUO RAKA & BIMA',
      titleStr: 'Jangan Simpan Ilmumu Sendiri, Bagikan agar Makin Melekat!',
      subStr: 'Cara terbaik untuk menguasai apa pun adalah menjadi guru yang rendah hati bagi temanmu',
      stat: 'PAHAM 100%',
      statSub: 'BAGIKAN ILMU',
      col: K.PAL.red,
      a: pop(t, C.untung.start + 0.5),
    });
  }
}

