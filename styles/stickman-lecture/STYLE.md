---
id: stickman-lecture
name: Stickman Lecture
no: 75
source: custom:stickman-lecture-kit
family: stickman
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: edukasi ringan, penjelasan konsep, psikologi belajar, tips produktivitas, konten guru/mentor
---
# Stickman Lecture

**Ciri khas (look):** Panggung ruang kelas papan tulis hijau zamrud (`#1b4d3b`) berbingkai kayu hangat (`#b57c43`) lengkap dengan kapur warna-warni dan penghapus papan tulis di talang bawah. Karakter unik **Si Profesor Kapur (`lectureStickman`)** tampil mengenakan **topi toga akademik (*mortarboard*) dengan rumbai emas bergoyang**, **kacamata bulat profesor**, kumis ramah, **jas akademik *tweed* berdasi kupu-kupu merah**, serta **tongkat penunjuk papan tulis (*pointer stick*)** di tangan kanan.

**Gerak (motion):** Transisi 4 babak perkuliahan dengan ayunan tongkat penunjuk ke arah diagram kapur (`lectureBoardDiagram`), goyangan rumbai toga, dan kartu catatan kuliah di paruh bawah layar.

**Kenapa menarik:** Menghadirkan wibawa akademis yang hangat dan mudah dicerna — mengubah teori sains belajar, memori, dan produktivitas menjadi kuliah visual yang seru.

**Cerita yang cocok:**
- Kurva Lupa Ebbinghaus & *Spaced Repetition* (mengapa belajar SKS semalam langsung menguap)
- *Active Recall* vs *Passive Highlighting* (mengapa mewarnai buku dengan stabilo sering menipu otak)
- Efek Zeigarnik & Jeda Istirahat (mengapa otak terus memikirkan soal yang belum selesai)

**Kit API (`styles/stickman-lecture/kit.js`):**
- `PAL` — palet papan tulis hijau, bingkai kayu, dan kapur (`chalkWhite`, `chalkYellow`, `chalkPink`, `chalkBlue`)
- `lectureBg(ctx, t, opts)` — latar papan tulis kayu + kapur tulis + penghapus papan
- `lectureHeader(ctx, badgeText, title, subtitle, opts)` — header silabus kuliah
- `lectureStickman(ctx, x, floorY, pose, opts)` — karakter unik Si Profesor Kapur (`'teach'`, `'think'`, `'eureka'`)
- `lectureBoardDiagram(ctx, floorY, badge, formula, note, opts)` — diagram kapur putus-putus di kanan papan
- `lectureBubble(ctx, x, y, text, opts)` — balon ucapan kapur
- `lectureCard(ctx, cx, cy, w, h, opts)` — kartu catatan kuliah

**Demos:**
1. `demo1` — *Perhatian ke Papan Tulis! Kurva Lupa Ebbinghaus — Mengapa Sistem Kebut Semalam Cepat Menguap?* (~64 dtk)
2. `demo2` — *Jebakan Stabilo Warna-Warni — Mengapa Menguji Diri Sendiri Jauh Lebih Ampuh daripada Membaca Ulang?* (~64 dtk)
3. `demo3` — *Rahasia Efek Zeigarnik di Ruang Kelas — Mengapa Memulai Lima Menit Mengaktifkan Memori Kerja Otak?* (~65 dtk)
