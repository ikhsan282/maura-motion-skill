// 69 · STICKMAN 3D WORLD — Demo 3: Ilusi Multitasking & Context Switching (Full-Screen 1080x1920 8-Beat Standard)
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
  else if (t >= C.aturan?.start) beat = 8;
  else if (t >= C.dalam?.start) beat = 7;
  else if (t >= C.monotask?.start) beat = 6;
  else if (t >= C.pajak?.start) beat = 5;
  else if (t >= C.waktu23?.start) beat = 4;
  else if (t >= C.residu?.start) beat = 3;
  else if (t >= C.loncat?.start) beat = 2;
  else if (t >= C.mitos?.start) beat = 1;

  let zoom = 1.0, fx = 540, fy = 880;
  if (beat >= 2 && beat <= 4) {
    zoom = 1.14; fx = 520; fy = 920;
  } else if (beat >= 6) {
    zoom = 1.16; fx = 540; fy = 940;
  }

  K.withCamera(ctx, { zoom, fx, fy }, () => {
    K.world3dBg(ctx, t, { horizonY: 540, floorY, accent: beat >= 6 ? K.PAL.emerald : K.PAL.purple });

    if (beat <= 5) {
      // Multitasking Chaos: 4 floating jumping 3D blocks scattered
      const tasks = [
        { x: 260, h: 90, lbl: 'CHAT', col: K.PAL.coral },
        { x: 440, h: 140, lbl: 'EMAIL', col: K.PAL.purple },
        { x: 620, h: 110, lbl: 'REPORT', col: K.PAL.cyan },
        { x: 800, h: 80, lbl: 'MEETING', col: K.PAL.gold },
      ];
      tasks.forEach((tk, idx) => {
        const bounce = Math.sin(t * 5 + idx * 1.5) * 16;
        K.draw3dBox(ctx, tk.x, floorY - bounce, 120, tk.h, 32, {
          col: tk.col, label: tk.lbl,
        });
      });
      // Juggling / Distracted Mannequin
      K.mannequin3DStickman(ctx, 520, floorY, 'juggle', {
        facing: 1, col: K.PAL.purple, t, label: 'ATTENTION RESIDUE',
      });
    } else {
      // Monotasking: One solid giant monolithic block in the center!
      K.draw3dBox(ctx, 540, floorY, 320, 240, 52, {
        col: K.PAL.emerald, label: '1 TUGAS TUNTAS', subLabel: '100% ENERGI FOKUS',
      });
      K.mannequin3DStickman(ctx, 320, floorY, beat >= 8 ? 'victory' : 'climb', {
        facing: 1, col: K.PAL.gold, t, label: 'MONOTASKING',
      });
    }
  });

  const headers = [
    ['MITOS', 'ILUSI KEAHLIAN MULTITASKING', 'Bisa Ngetik Sambil Rapat & Balas Chat Sekaligus?'],
    ['NEURO', 'OTAK MANUSIA TIDAK BISA DUAL-CORE', 'Secara Biologis Otak Tidak Dirancang Tugas Ganda'],
    ['SWITCH', 'CONTEXT SWITCHING YANG MELELAHKAN', 'Perhatian Hanya Melompat Cepat Bolak-Balik'],
    ['RESIDU', 'BAHAYA ATTENTION RESIDUE', 'Sisa Perhatian Tugas Lama Tertinggal Membebani Memori'],
    ['23 MNT', 'BIAYA MAHAL SEBUAH DISTRAKSI', 'Butuh 23 Menit untuk Kembali ke Fokus Puncak'],
    ['-40%', 'PAJAK PRODUKTIVITAS JALAN PINTAS', 'Melompat-Lompat Memangkas 40% Hasil Kerjamu'],
    ['KUNCI', 'SOLUSI MONOTASKING 3D', 'Kunci Satu Balok Tugas Sampai Tuntas ke Akarnya'],
    ['2x LIPAT', 'KECEPATAN NAIK, KESALAHAN TURUN', 'Fokus Terpusat Menggandakan Hasil Pekerjaan'],
    ['ATURAN', 'TUTUP TAB & BALIKKAN PONSEL', 'Berikan 100% Perhatianmu pada Satu Titik Nyata'],
    ['TUNTAS', 'SATU DEMI SATU UNTUK KARYA HEBAT', 'Kurangi Melompat, Perbanyak Menyelesaikan!'],
  ][beat];

  K.world3dHeader(ctx, headers[0], headers[1], headers[2], {
    col: beat >= 6 ? K.PAL.emerald : K.PAL.purple,
  });

  const callouts = [
    { tag: 'ILUSI PRODUKTIF', title: 'Membuka Banyak Jendela Terasa Sibuk Padahal Lambat', desc: 'Merasa hebat bisa banyak hal sekaligus padahal hasilnya dangkal', stat: 'MITOS', col: K.PAL.coral, c: C.hook },
    { tag: 'NEUROSAINS', title: 'Kapasitas Kognitif Otak Bersifat Single-Thread', desc: 'Prefrontal cortex hanya bisa memproses satu pikiran analitis dalam satu waktu', stat: 'SINGLE CORE', col: K.PAL.gold, c: C.mitos },
    { tag: 'CONTEXT SWITCH', title: 'Energi Habis Hanya untuk Menyesuaikan Ulang Konteks', desc: 'Lompatan antar tugas menguras glukosa otak lebih cepat daripada berpikir', stat: 'LOMPAT', col: K.PAL.purple, c: C.loncat },
    { tag: 'ATTENTION RESIDUE', title: 'Temuan Prof. Sophie Leroy (University of Washington)', desc: 'Pikiranmu masih memikirkan chat sebelumnya saat membuka spreadsheet', stat: 'SISA BEBAN', col: K.PAL.coral, c: C.residu },
    { tag: 'RISET UC IRVINE', title: 'Butuh Rata-Rata 23 Menit 15 Detik Kembali Fokus', desc: 'Satu notifikasi 5 detik mencuri setengah jam produktivitasmu', stat: '23 MENIT', col: K.PAL.purple, c: C.waktu23 },
    { tag: 'KERUGIAN BESAR', title: 'Produktivitas Terpangkas Hingga 40% & Cepat Lelah', desc: 'Pekerjaan yang harusnya selesai siang hari bergeser hingga larut malam', stat: '-40%', col: K.PAL.coral, c: C.pajak },
    { tag: 'MONOTASKING', title: 'Satu Tugas Selesai -> Lanjut ke Tugas Berikutnya', desc: 'Metode para pemikir besar dunia untuk menghasilkan karya berkualitas tinggi', stat: 'SATU BALOK', col: K.PAL.emerald, c: C.monotask },
    { tag: 'DEEP WORK', title: 'Kecepatan Meningkat 2x Lipat Tanpa Distraksi', desc: 'Masuk ke kondisi flow state yang membuat tugas terasa ringan', stat: '2x LIPAT', col: K.PAL.gold, c: C.dalam },
    { tag: 'TINDAKAN NYATA', title: 'Bersihkan Meja, Tutup Tab, Singkirkan Notifikasi', desc: 'Ciptakan lingkungan fisik yang melindungi perhatianmu', stat: 'BERSIHKAN', col: K.PAL.emerald, c: C.aturan },
    { tag: 'PESAN JUARA', title: 'Selesaikan Satu Demi Satu untuk Hasil Maksimal', desc: 'Karya hebat tidak lahir dari multitasking, tapi dari fokus yang tuntas!', stat: 'TUNTAS', col: K.PAL.gold, c: C.moral },
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
