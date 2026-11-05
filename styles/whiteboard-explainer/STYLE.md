---
id: whiteboard-explainer
name: Whiteboard Explainer Pro
no: 80
source: custom:whiteboard-doodle
family: Kriya
tech: canvas2d
music: lofi
voice: el-id-m
captions: clean
best_for: metode belajar & sains berpikir, produktivitas, psikologi kognitif, ringkasan buku bisnis, konsep edukasi langkah demi langkah
---

# Whiteboard Explainer Pro (`styles/whiteboard-explainer`)

Gaya **Whiteboard Explainer Pro (No. 80)** menghadirkan estetika video edukasi gambar tangan (*hand-drawn doodle whiteboard*) berstandar tinggi. Menggunakan kanvas papan tulis porselen putih bersih dengan tekstur spidol *dry-erase*, pena spidol nyata yang bergerak dinamis, catatan tempel (*sticky notes*), serta karakter stik yang ekspresif.

## Ciri Khas Visual
1. **Papan Tulis Porselen & Grid Titik (`whiteboardBg`)**:
   - Latar belakang putih porselen bersih (`#f8fafc`) dengan matriks titik-titik samar berjarak 60px dan bekas sapuan penghapus papan tulis (*faint dry-erase eraser marks*).
2. **Pena Spidol Nyata (`markerPen`)**:
   - Ujung spidol berbentuk baji (*chisel nib*) dengan warna dinamis (biru, merah, kuning, hijau) yang tampak aktif menggarisbawahi dan melingkari poin-poin krusial.
3. **Catatan Tempel (*Sticky Notes*) & Lakban Kertas (`stickyNote`)**:
   - Kertas memo berwarna kuning pastel, biru langit, dan merah muda yang ditempel dengan selotip transparan di sudut-sudutnya.
4. **Karakter Stik Hand-Drawn (`whiteboardStickman`)**:
   - Garis gambar tangan dengan goresan organik alami, dasi spidol beraksen warna, serta aneka pose pemikiran (*think*, *point*, *eureka*, *confused*).
5. **Standar Full-Screen 8-Adegan**:
   - Resolusi vertikal 1080x1920 tanpa panel kotak hitam bawah.
   - Banner papan tulis di bagian atas (`y: 50`, `h: 145`).
   - Kartu edukasi sains mengambang (*Floating Whiteboard Callout*) di `y: 1485` (`h: 165`).
   - *Safe-zone* takarir (*captions*) di bagian bawah (`y: 1700`).

## Komponen Utama `kit.js`
- `PAL`: Palet warna spidol whiteboard (Ink `#0f172a`, Red `#ef4444`, Blue `#2563eb`, Amber `#f59e0b`, Green `#10b981`, Purple `#8b5cf6`, Sticky Yellow `#fef08a`).
- `withCamera(ctx, { zoom, panX, panY, fx, fy }, fn)`: Kamera pan dan zoom papan tulis tak terbatas.
- `wobbleLine(ctx, x1, y1, x2, y2, opts)`: Garis goresan tangan alami.
- `whiteboardBg(ctx, t, { showGrid })`: Latar papan tulis porselen dan tekstur wipe.
- `whiteboardHeader(ctx, badge, title, subtitle, { col })`: Frame judul papan tulis atas berlakban.
- `markerPen(ctx, x, y, { color, angle, isDrawing, t })`: Spidol animasi real-time.
- `stickyNote(ctx, x, y, w, h, { color, angle, title, lines })`: Kertas memo tempel.
- `whiteboardStickman(ctx, x, y, { pose, scale, facing, accent, t })`: Karakter stik edukasi.
- `whiteboardCallout(ctx, cx, cy, w, h, { tag, title, desc, stat, statSub, col, a })`: Kartu data ringkasan melayang di `y: 1485`.

## 3 Demo Produksi (Voice `el-id-m`, Musik `lofi`)
1. **`demo1`**: *Teknik Feynman — Cara Memahami Konsep Apapun 10x Lebih Cepat* (Ilusi kompetensi, 4 langkah Feynman, eliminasi jargon, analogi dunia nyata).
2. **`demo2`**: *Prinsip Pareto 80/20 — Cara Bekerja Lebih Sedikit dengan Hasil Maksimal* (Mitos kesibukan semu, rasio 80/20, eliminasi distraksi, 2 prioritas pagi).
3. **`demo3`**: *Efek Zeigarnik — Mengapa Tugas Menggantung Menguras Energi Mentalmu?* (Tab kognitif terbuka, eksperimen pelayan kafe Wina, brain fog, dan cara menutup tab mental).

