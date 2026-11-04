---
id: swiss-bauhaus
name: Swiss / Bauhaus Grid
no: 34
source: github:swiss-modernist-grid
family: typography
tech: canvas2d
music: tech   voice: el-id-m   captions: clean
best_for: sejarah desain, arsitektur, prinsip UI/UX, aturan grid, psikologi warna & bentuk, manifesto modernisme
---
# Swiss / Bauhaus Grid

**Ciri khas (look):** Kertas krem poster (`#F5F2EA`) dengan grid modul 6 kolom yang tampak tipis, tanda registrasi cetak (`⊕`) di keempat sudut, HUD jendela bidik (*timecode* & nomor modul), palet warna primer Bauhaus (Hitam `#111111`, Merah `#E30613`, Biru `#0066B3`, Kuning `#FFCC00`), bentuk geometri dasar (segitiga kuning, persegi merah, lingkaran biru), dan tipografi grotesk rata kiri yang tegas.

**Gerak (motion):** Elemen geometri dan kartu modul masuk mengikuti pegas presisi di atas jalur grid, dikombinasikan dengan perputaran busur konstruktivis ala Josef Müller-Brockmann dan sinkronisasi narasi per babak (`AM.cue`).

**Kenapa menarik:** Visual Swiss / Bauhaus Grid menghadirkan wibawa desain editorial Eropa abad ke-20 yang bersih, terstruktur, dan langsung menghentikan *scroll* pada detik pertama.

**Kit API (`styles/swiss-bauhaus/kit.js`):**
- `PAL`, `bg`, `title`, `label`, `blob`, `ring`, `card`.
- `drawSwissStage(ctx, t, { code, step, total })`: Menggambar kertas krem, grid modul 6 kolom, bingkai hitam atas-bawah, tanda registrasi, dan HUD timecode.
- `drawSwissHeader(ctx, indexStr, titleLine1, titleLine2, sub, p, accent)`: Header tipografi rata kiri bergaya Swiss dengan lencana indeks berwarna primer.
- `drawKandinskyTriad(ctx, cx, cy, s, t, p)`: Tiga bentuk dan warna primer Kandinsky 1923 (Segitiga Kuning, Persegi Merah, Lingkaran Biru).
- `drawBauhausBuilding(ctx, cx, cy, s, t, p)`: Fasad gedung Bauhaus Dessau karya Walter Gropius dengan dinding tirai kaca dan papan vertikal `BAUHAUS`.
- `drawBauhausProducts(ctx, cx, cy, s, t, p)`: Lampu meja kaca Wilhelm Wagenfeld (`WG24`) dan kursi pipa baja Marcel Breuer (`B3`).
- `drawSwissArcs(ctx, cx, cy, s, t, p)`: Busur lingkaran konsentris bergaya poster konser Tonhalle Zurich karya Josef Müller-Brockmann.

**Paket 3 Demo (`demo1`, `demo2`, `demo3` — 30–90 detik, voice `el-id-m`):**
- **`demo1` — "Bauhaus: Sekolah 14 Tahun yang Mengubah Wajah Desain Dunia"**: Sejarah Staatliches Bauhaus (1919–1933) dari Walter Gropius di Weimar & Dessau, prinsip *form follows function*, karya lampu Wagenfeld & kursi Breuer, penutupan tahun 1933, hingga pengaruhnya pada layar HP modern.
- **`demo2` — "Rahasia Grid Swiss & Josef Müller-Brockmann — Mengapa Desain Rapi Memakai Kotak Tak Terlihat"**: Lahirnya *International Typographic Style* di Zurich & Basel (1950-an), modul kolom & *gutter*, teks rata kiri sans-serif, keseimbangan asimetris, poster konser Tonhalle, hingga sistem 12 kolom CSS Grid.
- **`demo3` — "Eksperimen Tiga Warna Primer Kandinsky 1923 — Mengapa Segitiga Itu Kuning dan Lingkaran Itu Biru?"**: Kuesioner legendaris Wassily Kandinsky di bengkel Bauhaus yang memasangkan Segitiga $60^\circ$ dengan Kuning, Persegi $90^\circ$ dengan Merah, dan Lingkaran $360^\circ$ dengan Biru, serta penerapannya pada rambu dan ikon modern.
- **Demo pendek tambahan**: `demo-grid/` (*Grid Desain*, 18 dtk) & `demo-warna/` (*3 Warna Primer*, 24 dtk).
