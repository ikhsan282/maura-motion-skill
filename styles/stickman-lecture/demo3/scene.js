// 75 · STICKMAN LECTURE — Demo 3: Rahasia Efek Zeigarnik di Ruang Kelas (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-lecture/kit.js';
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
  else if (t >= C.hemingway?.start) beat = 6;
  else if (t >= C.bawah?.start) beat = 5;
  else if (t >= C.buka?.start) beat = 4;
  else if (t >= C.nol?.start) beat = 3;
  else if (t >= C.loop?.start) beat = 2;
  else if (t >= C.pelayan?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 1 || beat === 2) {
    zoom = 1.14; fx = 520; fy = 910;
  } else if (beat >= 4) {
    zoom = 1.15; fx = 560; fy = 930;
  }

  const tags = [
    'KULIAH 01 • RASA PENASARAN FILM BERSAMBUNG',
    'KULIAH 02 • BLUMA ZEIGARNIK & PELAYAN RESTORAN',
    'KULIAH 03 • OPEN LOOP: KETEGANGAN KOGNITIF ALAMI',
    'KULIAH 04 • TITIK NOL PERSEN: ALASAN PROKRASTINASI',
    'KULIAH 05 • ATURAN 5 MENIT MENYALAKAN SISTEM',
    'KULIAH 06 • ALAM BAWAH SADAR MERANGKAI IDE',
    'KULIAH 07 • STRATEGI MENULIS ERNEST HEMINGWAY',
    'KULIAH 08 • BUKA 5 MENIT, TUNTASKAN SEMUANYA!',
  ];

  const col = beat >= 4 ? K.PAL.chalkBlue : (beat === 2 || beat === 3 ? K.PAL.chalkPink : K.PAL.chalkYellow);

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.lectureBg(ctx, t, { floorY, courseTag: tags[beat], col });

    const diagrams = [
      ['CLIFFHANGER', 'FILM GANTUNG', 'Mengapa otak terobsesi hal gantung', K.PAL.chalkYellow],
      ['ZEIGARNIK 1927', 'PESANAN RESTO', 'Ingat saat belum bayar, lupa saat lunas', K.PAL.chalkPink],
      ['OPEN LOOPS', 'TAB DI LATAR', 'Ketegangan mental menuntut selesai', K.PAL.chalkPink],
      ['TITIK 0%', 'BELUM TERSENTUH', 'Efek Zeigarnik belum menyala di kepala', K.PAL.chalkYellow],
      ['5 MENIT MIKRO', 'NYALAKAN SISTEM', 'Kerjakan no 1, otak langsung tancap', K.PAL.chalkBlue],
      ['BACKGROUND MIND', 'IDE BAWAH SADAR', 'Otak tetap merangkai solusi saat tidur', K.PAL.chalkBlue],
      ['TEKNIK HEMINGWAY', 'BERHENTI DI PUNCAK', 'Simpan kalimat berikutnya buat besok', K.PAL.chalkYellow],
      ['NILAI A+', 'SUKSES TUNTAS', 'Nyalakan loop dan selesaikan tugas!', K.PAL.chalkYellow],
    ][beat];
    K.lectureBoardDiagram(ctx, floorY, diagrams[0], diagrams[1], diagrams[2], { col: diagrams[3] });

    const charX = beat <= 2 ? 330 : 360;
    const pose = beat === 0 ? 'teach' : beat <= 2 ? 'think' : beat <= 4 ? 'teach' : beat <= 6 ? 'teach' : 'eureka';
    K.lectureStickman(ctx, charX, floorY, pose, { facing: 1, t });

    const bubbles = [
      'Kenapa kita penasaran sama film bersambung yang gantung?',
      'Bluma Zeigarnik meneliti pelayan restoran sejak tahun 1927!',
      'Otak manusia benci hal gantung, kayak tab kebuka di latar!',
      'Kalau tugas masih 0% belum dibuka, alarm otak belum nyala!',
      'Cukup sentuh 5 menit: buat judul atau isi nomor satu dulu!',
      'Bahkan pas istirahat, alam bawah sadar lanjut mikirin ide!',
      'Ernest Hemingway sengaja stop nulis pas tau kalimat lanjutannya!',
      'Buka tugasmu 5 menit hari ini, biarkan otak bekerja!',
    ];
    K.lectureBubble(ctx, charX + 50, floorY - 390, bubbles[beat], {
      tailX: charX + 15, tailY: floorY - 310, col,
    });
  });

  const headers = [
    ['BERSAMBUNG?', 'RAHASIA EFEK ZEIGARNIK', 'Mengapa Hal yang Belum Selesai Terus Terngiang di Pikiran?'],
    ['ZEIGARNIK', 'PENELITIAN RESTORAN BERSEJARAH', 'Pelayan Hafal Pesanan yang Belum Lunas, Lupa Begitu Bayar'],
    ['OPEN LOOP', 'KETEGANGAN KOGNITIF OTAK', 'Pikiran Manusia Secara Biologis Menuntut Penutupan Siklus'],
    ['TITIK NOL', 'MENGAPA MEMULAI BEGITU BERAT?', 'Selama Belum Disentuh, Sirkuit Zeigarnik Belum Menyala'],
    ['5 MENIT', 'CARA MERETAS ENERGI INISIASI', 'Kerjakan Satu Baris Saja untuk Mengaktifkan Memori Kerja'],
    ['BAWAH SADAR', 'PROSES INKUBASI PIKIRAN', 'Otak Terus Bekerja Menyusun Solusi Bahkan Saat Kamu Rehat'],
    ['HEMINGWAY', 'STRATEGI HENTI DI PUNCAK', 'Tinggalkan Pekerjaan Saat Tahu Langkah Berikutnya'],
    ['TUNTAS!', 'MANFAATKAN SIKLUS ALAMI OTAK', 'Buka Tugasmu 5 Menit Sekarang & Saksikan Keajaibannya!'],
  ][beat];

  K.lectureHeader(ctx, headers[0], headers[1], headers[2], { col });

  const callouts = [
    { tag: 'CLIFFHANGER EFFECT', title: 'Rasa Gatal Otak Terhadap Cerita yang Bersambung', desc: 'Mekanisme perhatian manusia terpaku pada narasi yang belum tuntas', stat: 'GANTUNG', col: K.PAL.chalkYellow, c: C.hook },
    { tag: 'STUDI ZEIGARNIK', title: 'Eksperimen Klasik Bluma Zeigarnik (1927)', desc: 'Tugas yang diinterupsi diingat 90% lebih baik dibanding tugas yang sudah selesai', stat: '1927', col: K.PAL.chalkPink, c: C.pelayan },
    { tag: 'COGNITIVE TENSION', title: 'Open Loops Menghabiskan Ram Pikiran', desc: 'Setiap tugas yang tertunda menghasilkan sinyal bawah sadar yang meminta ditutup', stat: 'OPEN LOOP', col: K.PAL.chalkPink, c: C.loop },
    { tag: 'FRICTION AT ZERO', title: 'Hambatan Terbesar Ada di Titik Nol Persen', desc: 'Otak menolak membayangkan seluruh beban pekerjaan yang masih abstrak', stat: 'TITIK 0%', col: K.PAL.chalkYellow, c: C.nol },
    { tag: 'FIVE-MINUTE RULE', title: 'Inisiasi Mikro Mengaktifkan Jalur Kognitif', desc: 'Membuat satu outline kecil sudah cukup memicu dorongan internal menuntaskan', stat: '5 MENIT', col: K.PAL.chalkBlue, c: C.buka },
    { tag: 'INCUBATION EFFECT', title: 'Alam Bawah Sadar Bekerja Sebagai Prosesor Latar', desc: 'Begitu tab tugas terbuka, ide-ide kreatif akan mengalir spontan di sela aktivitas', stat: 'INKUBASI', col: K.PAL.chalkBlue, c: C.bawah },
    { tag: 'HEMINGWAY HACK', title: 'Berhenti Saat Sedang Lancar untuk Hari Esok', desc: 'Menghindari rasa frustrasi menghadapi kertas putih kosong keesokan paginya', stat: 'HEMINGWAY', col: K.PAL.chalkYellow, c: C.hemingway },
    { tag: 'PESAN JUARA', title: 'Mulai Hari Ini, Biarkan Otak Menuntaskan Tugasmu', desc: 'Buka file kerjamu selama 5 menit sekarang dan rasakan kemudahannya!', stat: 'A+ JUARA', col: K.PAL.chalkYellow, c: C.moral },
  ][beat];

  K.lectureCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
