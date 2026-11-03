---
id: flipbook
name: Flipbook
no: 24
source: drive:24_Flipbook
family: craft
tech: canvas2d
music: musicbox   voice: id-f   captions: hand
best_for: sejarah animasi & film, proses kreatif, cerita mini bergerak, tutorial "cara membuat", nostalgia masa sekolah
---
# Flipbook

**Ciri khas (look):** tampak atas meja kayu hangat (#9a6a40, serat kayu). Buku spiral kecil (halaman krem #fbf8ef,
tumpukan tepi halaman terlihat, sampul biru di belakang) dipegang dua tangan kartun datar berwarna kulit (#f1c29a)
dengan garis luar coklat. Gambar di halaman memakai pulpen biru (#2647a3): garis sedikit transparan dengan inti lebih
gelap, nomor halaman di pojok. Properti meja: penghapus, pulpen, kartu paten sepia, pita film, kertas tempel kuning.

**Gerak (motion):** ibu jari kanan mengangkat pojok bawah dan halaman membalik ke atas menuju spiral: **satu halaman
per gambar, 12 per detik** (gerak tersendat khas flipbook). Setiap halaman digambar ulang dengan tangan, jadi garisnya
bergoyang sedikit berbeda tiap halaman. Saat menggambar, pulpen mengikuti goresan dan halaman sebelumnya tembus pandang
(onion skin); halaman dibalik pelan dengan lengkungan dan bayangan. Objek baru meluncur ke meja (kartu paten dengan
stempel yang menghentak, pita film yang bergulir, catatan "24" yang menghitung). Halaman terakhir: TAMAT.

**Kenapa menarik:** semua orang pernah mencoret pojok buku. Menonton gerakan lahir dari kertas diam terasa ajaib dan
nostalgik; ritme 12 fps-nya langsung dikenali sebagai "buatan tangan".

**Cerita yang cocok:**
- Animasi lahir dari pojok buku: "Semua film kartun memakai trik dari pojok buku ini."
- Muybridge dan kuda yang berlari: "Apakah kaki kuda pernah melayang bersamaan?"
- Cara kerja bioskop: "Kamu tidak pernah melihat gerakan di film. Kamu melihat foto diam."
- Proses animator: dari sketsa kasar ke gerak jadi.
- Cerita mini tanpa kata: stickman ingin terbang.

**Rumus hook:** "Semua [hal besar] berawal dari [benda kecil sehari-hari] ini." / "Gambar diam + [trik] = hidup." /
"Coba ini di buku tulismu."

**Kit API (`styles/flipbook/kit.js`):**
- `book(ctx, {x, y, s, page(g,i), top, flip:{page,f}, live(g), stack})`: buku spiral; `page` menggambar isi halaman i (di-cache per halaman), `flip` = halaman yang sedang terangkat (0..1), `live` = halaman yang sedang digambar.
- `leftHand`, `rightThumb(ctx,x,y,{lift})`, `pen(ctx,x,y,{lift})`: tangan dan pulpen.
- `stick(pose)`, `inkStick(ctx,pose,{seed,reveal})` (stickman pulpen; `seed` = goyangan unik per halaman), `inkPath`, `inkStroke`, `inkText` (tulisan tangan dengan reveal).
- `filmStrip(ctx,x,y,{frame(g,k,w,h), offset})`, `patentCard(ctx,x,y,{title,sub,year,stamp})`, `desk`, `deskTile`, `cam`, `viewRect`, `PAGE`.

**Demo:** "Animasi Lahir dari Pojok Buku", 18,7 detik, 5 shot. Buku dibalik cepat: stickman berlari, melompat, terbang →
pulpen menggambar stickman di halaman 1, halaman dibalik pelan, halaman 2 dengan bayangan tembus → dibalik cepat,
"Dia hidup!" dengan kilau → kartu paten "KINEOGRAF · John Barnes Linnett" meluncur, stempel "1868", "= gambar bergerak"
→ pita film bergulir di samping buku, catatan kuning menghitung sampai "24 bingkai / detik", halaman terakhir TAMAT.
- **Demo 2 — "Bola Memantul"** (`demo-bola/`, 12 dtk): squash + stretch + gravitasi, 5 baris. Voice el-id-m.
- **Demo 3 — "Stickman Lari"** (`demo-lari/`, 16 dtk): langkah, debu, garis gerak, napas. Voice el-id-m.
