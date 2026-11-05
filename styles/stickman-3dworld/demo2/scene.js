// 69 · STICKMAN 3D WORLD — Demo 2: Hukum Parkinson & Timeboxing 3D (Full-Screen 1080x1920 8-Beat Standard)
import * as K from '/styles/stickman-3dworld/kit.js';
const { clamp, lerp, ease } = AM.lib;

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
  if (t >= C.moral?.start) beat = 9;
  else if (t >= C.bebas?.start) beat = 8;
  else if (t >= C.esensi?.start) beat = 7;
  else if (t >= C.batas?.start) beat = 6;
  else if (t >= C.solusi?.start) beat = 5;
  else if (t >= C.kepepet?.start) beat = 4;
  else if (t >= C.gas?.start) beat = 3;
  else if (t >= C.longgar?.start) beat = 2;
  else if (t >= C.hukum?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat === 3 || beat === 4) {
    zoom = 1.15; fx = 580; fy = 920;
  } else if (beat >= 5 && beat <= 7) {
    zoom = 1.18; fx = 540; fy = 940;
  }

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.world3dBg(ctx, t, { horizonY: 540, floorY, accent: beat >= 5 ? K.PAL.emerald : K.PAL.coral });

    // Bloated 7-Day Box shrinking to tight 90-minute box
    const u = clamp(beat / 8, 0, 1);
    const boxW = lerp(410, 190, ease.outCubic(u));
    const boxH = lerp(310, 160, ease.outCubic(u));
    const boxCol = beat >= 5 ? K.PAL.emerald : K.PAL.coral;
    const boxLbl = beat >= 5 ? 'TIMEBOX 90 MNT (PADAT)' : 'KOTAK 7 HARI (MELAR)';

    K.draw3dBox(ctx, 640, floorY, boxW, boxH, 48, {
      col: boxCol,
      label: beat >= 5 ? '90 MNT' : '7 HARI',
      subLabel: boxLbl,
    });

    if (beat >= 6) {
      K.draw3dBox(ctx, 915, floorY, 135, 120, 36, {
        col: K.PAL.gold, label: '100%', subLabel: 'TUNTAS!',
      });
    }

    const manX = lerp(320, 440, u);
    const pose = beat >= 8 ? 'victory' : beat >= 4 ? 'push-cube' : 'climb';
    K.mannequin3DStickman(ctx, manX, floorY, pose, {
      facing: 1, col: beat >= 5 ? K.PAL.emerald : K.PAL.cyan, t, label: 'KOMPRES WAKTU',
    });
  });

  const headers = [
    ['7 HARI', 'HUKUM PARKINSON (1955)', 'Mengapa Tugas 2 Jam Bisa Molor Menjadi Satu Minggu?'],
    ['HUKUM', 'PEKERJAAN MENGEMBANG IKUT WAKTU', 'Makin Luang Tenggatnya, Makin Rumit Dibuat-buat'],
    ['LONGGAR', 'BAHAYA TENGGAT TERLALU JAUH', 'Detail Sepele Dikerjakan Bertele-tele Tanpa Arah'],
    ['GAS 3D', 'TUGAS SEPERTI GAS DALAM RUANGAN', 'Menyebar Menghabiskan Apapun Wadah yang Diberikan'],
    ['2 JAM', 'KEAJAIBAN FOKUS KEPAPATAN', 'Saat Tenggat Mepet, Otak Langsung Membuang Basa-Basi'],
    ['SOLUSI', 'STRATEGI TIMEBOXING 3D', 'Perkecil Kotak Waktumu Sebelum Mulai Melangkah'],
    ['BATAS', 'TENGGAT BUATAN 90 MENIT', 'Pasang Timer Ketat Sebelum Makan Siang Dimulai'],
    ['80/20', 'INTI UTAMA LANGSUNG TERSASAR', 'Prinsip Pareto: 80% Hasil Lahir dari 20% Usaha Inti'],
    ['BEBAS!', 'TUGAS TUNTAS, ISTIRAHAT TENANG', 'Sisa Harimu Bebas Tanpa Dihantui Beban Pekerjaan'],
    ['KENDALI', 'KUASAI WAKTU DENGAN TIMEBOXING', 'Padatkan Kotak Waktumu Sebelum Waktumu Dirampas!'],
  ][beat];

  K.world3dHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 5 ? K.PAL.emerald : K.PAL.coral,
  });

  const callouts = [
    { tag: 'FENOMENA UMUM', title: 'Tugas Ringan Baru Selesai di Malam Terakhir', desc: 'Waktu luang seminggu memicu ilusi bahwa masih ada hari esok', stat: 'MOLOR', col: K.PAL.coral, c: C.hook },
    { tag: 'PARKINSON LAW', title: 'Pekerjaan Menyesuaikan Diri dengan Waktu Tersedia', desc: 'Dirumuskan oleh sejarawan C. Northcote Parkinson pada 1955', stat: 'HUKUM 1955', col: K.PAL.gold, c: C.hukum },
    { tag: 'DETAIL SEPELE', title: 'Overthinking Font, Warna, dan Hal Tidak Esensial', desc: 'Ketika waktu terlalu banyak, kita sibuk pada hal yang tidak berdampak', stat: 'ENCER', col: K.PAL.coral, c: C.longgar },
    { tag: 'ANALOGI GAS', title: 'Wadah Besar Membuat Konsentrasi Semakin Memudar', desc: 'Beri waktu 7 hari maka tugas mengembang memenuhi seluruh pikiranmu', stat: 'GAS 3D', col: K.PAL.cyan, c: C.gas },
    { tag: 'FOKUS MAKSIMAL', title: 'Mengapa 2 Jam Terakhir Selalu Paling Cepat?', desc: 'Urgensi deadline membungkam suara keraguan di kepala secara instan', stat: '2 JAM', col: K.PAL.gold, c: C.kepepet },
    { tag: 'TIMEBOXING', title: 'Tentukan Sendiri Kotak Waktu yang Lebih Singkat', desc: 'Batasan waktu buatan memicu fokus tinggi tanpa menunggu hari terakhir', stat: 'KOTAK 3D', col: K.PAL.emerald, c: C.solusi },
    { tag: 'TENGGAT KETAT', title: 'Selesaikan Laporan dalam 90 Menit Penuh', desc: 'Target waktu yang tajam memaksa tubuh bekerja dalam mode aliran (flow)', stat: '90 MNT', col: K.PAL.emerald, c: C.batas },
    { tag: 'PRINSIP PARETO', title: 'Fokus pada 80% Inti Terpenting Pekerjaan', desc: 'Buang basa-basi dan langsung tuntaskan hasil yang paling dinilai', stat: '80/20', col: K.PAL.gold, c: C.esensi },
    { tag: 'TANPA BEBAN', title: 'Selesai Cepat, Bebas dari Rasa Bersalah', desc: 'Tidak ada lagi stres menunda pekerjaan di akhir pekan', stat: 'BEBAS', col: K.PAL.emerald, c: C.bebas },
    { tag: 'PESAN UTAMA', title: 'Padatkan Waktumu Sebelum Tugas Membengkak', desc: 'Kualitas hidupmu ditentukan oleh seberapa pandai kamu mengompres waktu!', stat: 'TUNTAS', col: K.PAL.gold, c: C.moral },
  ][beat];

  K.world3dCallout(ctx, 540, 1485, 960, 165, {
    tag: callouts.tag,
    title: callouts.title,
    desc: callouts.desc,
    stat: callouts.stat,
    col: callouts.col,
    a: pop(t, callouts.c ? callouts.c.start + 0.15 : 0),
  });
}
