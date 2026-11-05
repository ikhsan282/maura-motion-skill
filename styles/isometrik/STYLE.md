---
id: isometrik
name: Isometrik
no: 58
source: github:isometric-diorama (awesome-opus5-5-videos)
family: 2D
tech: canvas2d
music: tech   voice: el-id-m   captions: bold
best_for: rantai pasok & logistik, cara kota/sistem bekerja, proses pabrik, ekonomi sederhana, perjalanan sebuah benda, sebelum-sesudah
---
# Isometrik

**Ciri khas (look):** Proyeksi isometrik `2:1` di atas latar navy gelap `#0F1530` ber-grid titik samar; blok bangunan & mesin 3-nada (atas terang, kiri sedang, kanan gelap) dengan garis tepi tipis; ban berjalan (*conveyor belt*), truk distribusi, kurir motor, pipa air, dan sawah bertingkat; serta kartu HUD pelacak progres 6 titik di bagian atas layar.

**Gerak (motion):** Kamera membuka dengan *overview* seluruh diorama, menyelam mengikuti objek utama (*parcel*, tetes air, atau karung beras) melewati 6 pos pemeriksaan dengan pemindaian laser + `"BEEP"`, transisi siang ke malam lengkap dengan bintang dan sorot lampu jalan/truk, lalu menarik mundur kembali untuk kesimpulan.

**Kit API (`styles/isometrik/kit.js`):**
- Proyeksi & Path: `iso(gx,gy,gz)`, `U`, `spring`, `springKeys`, `sp`, `pathAt(t, keys)`
- Primitif 3-Nada: `box`, `slab`, `onPlane`, `person`, `parcel`, `conveyor`, `truck`, `bike`, `tree`, `lamp`, `house`
- HUD & Efek: `tag(ctx,x,y,n,str,opts)`, `scan`, `beep`, `halo`, `stage(ctx,t,night)`

**3 Demo Siap Pakai (`el-id-m`, 64–65 detik):**
1. **`demo1/` — Perjalanan Paketmu dari Gudang ke Pintu (~64 dtk)**: 6 titik pindaian (*Gudang → Sortir → Truk → Hub Kota → Kurir → Pintu*) yang dilalui paket belanja online semalaman tanpa pernah dibuka.
2. **`demo2/` — Perjalanan Setetes Air PDAM (~64 dtk)**: 6 tahap pengolahan air bersih (*Waduk → Penyaringan → Klorinasi → Menara Air → Pipa Bawah Tanah → Keran Rumah*).
3. **`demo3/` — Dari Sawah ke Piringmu: Rantai Pasok Beras (~65 dtk)**: 6 pemberhentian sebutir beras Nusantara (*Sawah Panen → Penggilingan → Gudang Beras → Truk Lintas Kota → Pasar Induk → Rumah*).
