---
id: anime
name: Anime
no: 1
source: drive:01_Anime + github:anime-cel, anime-motion-comic
family: 2D
tech: canvas2d
music: anime   voice: el-id-m   captions: bold
best_for: slice-of-life emosional, mudik/pulang kampung, kisah keluarga, perjalanan, cinta pertama, kenangan masa kecil
---
# Anime

**Ciri khas (look):** film anime: lineart bersih ungu-gelap (#2a1a2e) yang hanya menggaris siluet, cel shading 2 tone
(kulit #ffe4d2 / #f0a898), rim light hangat (#fff0c8) di sisi datangnya cahaya. Langit dilukis: golden hour
#26397c → #c47fb1 → #ffc27e → #ffe7b2, kumulus raksasa ungu-lavender (#6a5aa6) yang menyala peach (#ffb99a) dari bawah.
Matahari dengan halo, flare (garis anamorfik + ghost), debu cahaya, glint. Teks: Poppins tebal (kartu nama) dan DM Serif
Display (judul film).

**Gerak (motion):** rambut dan rok tertiup angin (setiap helai bergoyang), kedip, napas bahu, mata berkaca-kaca dengan
air mata jatuh, kamera dolly mundur di peron (parallax 3D sederhana), lompatan dengan smear, pita cahaya tiang listrik
menyapu wajah di kereta, push-in lambat di setiap shot, kilat putih tipis di setiap potongan.

**Kenapa menarik:** estetika anime langsung dikenali dan sangat emosional; langit senja + close-up mata adalah thumbnail
yang menghentikan scroll.

**Cerita yang cocok:**
- Tiket terakhir mudik: "Ia berlari mengejar kereta terakhir... membawa satu janji untuk ibunya."
- Kurir di malam Lebaran: "Alamat pesanan terakhirnya... rumah masa kecilnya sendiri."
- Surat di loker sekolah: "Sepuluh tahun kemudian, ia baru membacanya."
- Payung yang tertinggal di halte: "Setiap hujan, payung itu masih di sana."
- Anak rantau pertama kali gajian: "Gaji pertamanya ia kirim utuh ke kampung."

**Rumus hook:** "[Tokoh] berlari/menunggu [sesuatu yang terakhir]... membawa [janji/rahasia]." / "[Benda kecil] itu
ternyata [kenangan besar]." / "Sudah [n] tahun ia [tidak melakukan X]. Malam ini, ia mencoba."

**Kit API (`styles/anime/kit.js`):**
- `sky(ctx, preset, {mix,k})` langit lukis (golden/day/dusk/night, bisa cross-fade); `stars`, `crescent`, `cloud(ctx,x,y,s,{seed,preset,sunDir})` kumulus cel-lit (cache).
- `sun(ctx,x,y,{r,flare})`, `lensFlare`, `glow`, `glint`, `motes`, `rays`, `streaks` (garis kecepatan putih).
- `head(g, who, o, part)`, `bust(ctx, who, x, y, s, o)` (o: wind, light −1/0/1, rim, look, blink, mouth, smile, brow, tear, tearFall, turn, tilt, arms:'run'), `expr(name)` (smile, worry, cry, determined, pant, happyCry, soft…), `bustBack` (tampak belakang + ransel).
- `figure(ctx, who, x, y, s, POSE.run(ph)|leap(k)|stand|openArms|wave, o)` tubuh penuh (opsi `sil` = siluet ber-rim).
- Tokoh di `CHARS`: `laras` (rambut panjang), `ibu` (berhijab), `kecil` (anak, kuncir dua).
- Tempat: `station(ctx,t,{cam:{z}})` peron perspektif dengan kereta, `trainSide({open, part:'body'|'doors'})`, `landscape` (pemandangan jendela bergerak), `village`, `house`, `palm`, `obor`.
- Properti & teks: `clock`, `ticketHand`, `nameCard`, `filmTitle`, `quoteBox`, `lightLeak`, `memoryFrame`.

**Demos:**
- **`demo1/` ("Tiket Terakhir Mudik", 17,9 dtk, 6 shot, voice `el-id-f`):** Laras berlari mengejar kereta terakhir saat golden hour, melompat melewati pintu kereta, mengingat janji 3 Lebaran, tertahan sinyal saat matahari tenggelam, hingga disambut ibunya di malam takbiran.
- **`demo2/` ("Surat di Ujung Peron", 57,7 dtk, 10 shot, voice `el-id-f`):** Sepuluh tahun setelah lulus dan berpisah tanpa sempat berpamitan di stasiun, Laras menerima sepucuk surat lama yang menuntunnya kembali ke bangku kayu di ujung peron saat senja.
- **`demo3/` ("Rantang Hangat di Peron Senja", ~58 dtk, 10 shot, voice `el-id-m`):** Tahun pertama merantau di kota besar dan belum mampu mudik, kereta dinas Laras berhenti 2 menit di stasiun desa tempat ibunya sudah menunggu sambil membawa rantang masakan hangat.
