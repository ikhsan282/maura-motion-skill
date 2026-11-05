---
id: dunia-3d-painterly
name: Dunia 3D Painterly
no: 54
source: github:painterly-3d-world
family: 3D
tech: three
music: anime   voice: el-id-m   captions: clean
best_for: legenda alam Nusantara, danau & gunung berapi, lanskap Ghibli/BotW, dongeng emosional, keajaiban geologi
---
# Dunia 3D Painterly

**Ciri khas (look):** dunia 3D bergaya lukisan *Ghibli / Breath of the Wild*: perbukitan hijau zamrud berundak dengan *cel/toon shading* lembut, kabut atmosfer biru-lembayung di kejauhan, awan kumulus bervolume yang mengapung pelan, pantulan air danau multi-warna (pirus, zamrud, emas, rubi, ungu), berkas cahaya matahari senja (*golden hour god-rays*), serta kartu bab cerita bergaya buku dongeng klasik (`Noto Serif`).

**Gerak (motion):** kamera terbang melayang (*aerial crane & valley glide*) melintasi lembah dan memutari danau, sementara pepohonan bergoyang ditiup angin, awan kumulus berarak, permukaan air beriak membiaskan warna, dan partikel permata/embun melayang naik ke udara.

**Kenapa menarik:** memadukan kedalaman ruang 3D sinematik dengan kehangatan palet warna lukisan tangan yang menenangkan dan mengundang rasa kagum.

**Cerita yang cocok:**
- Legenda Telaga Warna (Puncak, Bogor): "Air telaga ini berwarna-warni karena pecahan permata dan air mata seorang ratu."
- Danau Tiga Warna Kelimutu (Ende, Flores): "Tiga kawah berdampingan di puncak gunung yang airnya bisa berganti warna sendiri."
- Lembah Harau (Sumatera Barat): "Tebing granit raksasa setinggi 300 meter yang jutaan tahun lalu adalah dasar laut."

**Rumus hook:** "Air/lembah di [nama tempat] ini menyimpan [keajaiban visual]... yang lahir dari [legenda/rahasia alam]."

**Kit API (`styles/dunia-3d-painterly/kit.js`):**
- `PAL`, `pr(t, a, b)`, `createPainterlyStage(AM, {skyColor, fogDensity})`: panggung Three.js + pencahayaan *golden hour* + kabut atmosferik + `setMood(...)`.
- `buildHighlandWorld(scene, {mode})`: membangun lembah 3D lengkap dengan perbukitan/tebing (`'telaga' | 'kelimutu' | 'harau'`), danau multi-warna, pendopo kerajaan, 34 pohon kanopi bundar yang bergoyang ditiup angin, awan kumulus, dan partikel permata/embun.
- `drawPainterlyHUD(ui, t, {chapter, title, subtitle, badge})`: berkas sinar matahari 2D + kartu bab cerita serif.

**Demo (3 variasi, 64–65 detik, voice `el-id-m`):**
- **Demo 1 — "Legenda Telaga Warna Puncak — Kalung Permata yang Berubah Menjadi Danau Berkilau"** (`demo1/`, ~64 dtk): Lembah Kerajaan Kutatanggeuhan di Puncak Bogor → pecahan kalung permata sembilan warna milik Putri Gilang Rukmini yang berhamburan → air mata yang menggenangi lembah menjadi Telaga Warna + penjelasan ilmiah pembiasan cahaya & alga.
- **Demo 2 — "Danau Kelimutu Flores — Misteri Tiga Kawah Gunung Berapi yang Berganti Warna"** (`demo2/`, ~64 dtk): Terbang di atas tiga kawah Gunung Kelimutu (Tiwu Ata Mbupu, Tiwu Nuwa Muri Koo Fai, Tiwu Ata Polo) yang berdampingan namun berbeda warna karena gas fumarol vulkanik dan mineral besi-mangan.
- **Demo 3 — "Lembah Harau & Kabut Pagi — Rahasia Tebing Granit Purba yang Dulu Dasar Laut"** (`demo3/`, ~65 dtk): Menyusuri dinding tebing batu pasir dan granit curam setinggi 300 meter di Payakumbuh yang menyimpan jejak dasar laut berumur 40 juta tahun dan air terjun Sarasah.

