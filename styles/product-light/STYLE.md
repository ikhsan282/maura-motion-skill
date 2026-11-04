---
id: product-light
name: Film Produk Terang
no: 30
source: github:product-film-light + light-product-ui (awesome-opus5-5-videos)
family: 2D
tech: canvas2d
music: tech   voice: id-f   captions: clean
best_for: cara kerja aplikasi, fintech, fitur produk, "di balik layar" teknologi sehari-hari, alur 3–5 langkah, statistik
---
# Film Produk Terang

**Ciri khas (look):** kanvas putih hangat #F7F5F0 dengan blob pastel buram yang bergeser pelan (lilac #DCD3FF,
peach #FFD3BA, mint #C9F2E2, sky #D3E6FF) dan grid titik samar. Kartu UI putih radius 30–40, garis 1,5 px #E7E4DE,
bayangan lembut berlapis (kontak + ambient) yang naik saat kartu aktif. Mockup HP dengan bingkai titanium.
Satu aksen saja (indigo #4F46E5) + hijau sukses #12B76A. Judul Inter 700 tracking rapat, satu kata aksen
miring serif (Playfair italic), eyebrow huruf kapital kecil.

**Gerak (motion):** semua di pegas closed-form (overshoot kecil). Kamera "Screen Studio": zoom log-space dan
geser mengikuti objek yang sedang dipakai; tidak ada potongan keras, satu dunia panjang. Judul naik lewat
mask baris per baris, kartu muncul bertahap, angka menghitung, kursor/tap dengan riak. Gerak khas: paket data
berjalan di rute bertitik dengan jejak cahaya, kamera ikut, lalu menarik mundur jauh untuk "twist", dan
kembali (rewind) ke HP untuk penutup.

**Kenapa menarik:** terlihat seperti film peluncuran agensi mahal; UI nyata terasa kredibel, teks besar
terbaca tanpa suara, mikro-interaksi (scan, centang, toast) memuaskan.

**Cerita yang cocok:**
- Bayar pakai QR: "Satu scan... empat pihak bekerja dalam hitungan detik."
- Transfer antarbank: "Uangmu tidak benar-benar terbang. Yang terbang adalah pesan."
- Ojek online memesan: "Satu ketukan, tiga algoritma berebut."
- Cara kerja OTP: "Kode enam angka ini kedaluwarsa sebelum kamu sempat menyalinnya."
- Notifikasi belanja: "Kenapa notifikasimu datang tepat saat kamu ragu?"

**Rumus hook:** "Satu [aksi kecil]... [angka] [pihak/proses] bekerja diam-diam." / "Yang terjadi dalam
[waktu singkat] setelah kamu menekan [tombol]." / "[Benda sehari-hari] ini ternyata [fakta mengejutkan]."

**Kit API (`styles/product-light/kit.js`):**
- `spring(t,{z,ts})`, `springKeys(t,keys)`, `sp(t,t0,ts,z)`, `count(t,t0,dur,a,b)`, `fmt/fmtRp(n)`: pegas & angka.
- `camAt(t,[[t,x,y,zoom]])`, `applyCam(ctx,cam)`, `viewRect(ctx)`: kamera (zoom log-space).
- `stage(ctx,t,{px,py})`, `dotGrid(ctx)`: latar putih hangat + blob pastel.
- `softShadow(ctx,x,y,w,h,r,{elev})`, `card(ctx,x,y,w,h,{r,elev,alpha})`, `popIn(ctx,cx,cy,p)`: bayangan 9-slice tercache, kartu, masuk.
- `label`, `headline(ctx,t,t0,['Satu *kata*'],x,y,{size,out})`, `eyebrow`: tipografi (*kata* = serif miring aksen).
- `chip(ctx,x,y,str,{num,icon})`, `toast(ctx,x,y,w,{title,body,icon})`, `ICON.{check,bank,route,store,shield,lock,bell,mail,coin,calendar,user,scan}`.
- `cursor(ctx,x,y,{press})`, `pointerAt(t,keys,clicks)`, `ripple(ctx,x,y,age,{ring})`: kursor & riak.
- `phone(ctx,x,y,s,draw,{rot,elev,statusDark})` → fungsi titik layar→kanvas; `PHONE` ukuran logis 390×844.
- `qrMatrix(seed)`, `qrCode(ctx,x,y,size,{reveal,hi})`: kode QR palsu yang dapat dianimasikan.
- `bez`, `along`, `route(ctx,P,{p,t})`, `trail(ctx,P,u)`, `glow(ctx,x,y,r)`, `float(t,seed)`.

**Demo:** "Satu Detik di Balik Scan Kode QR", 19,9 detik. HP men-scan QR (bracket mengunci) dan empat chip
pihak muncul → paket "Pesan · Rp25.000" melewati Penerbit (saldo dipotong), Switching (rute dipilih),
Acquirer (stempel DISETUJUI) → HP kasir: toast "Pembayaran diterima" → kamera mundur: baru pesan, belum uang;
koin hijau menyusul (settlement) → rewind ke HP: "Satu ketukan. Empat pihak. Berhasil." Fakta: BI (pihak
QRIS: penerbit, acquirer, switching; settlement bisa H+0/H+1).


**Paket Demo (30–90 Detik):**
1. **`demo1`** — *Satu Detik di Balik Scan Kode QRIS — Perjalanan Pesan Pembayaran Melewati Empat Pihak* (~52 detik): Perjalanan paket otorisasi pembayaran QRIS melewati Penerbit, Lembaga Switching, dan Acquirer hingga notifikasi kasir menyala dan *settlement* uang menyusul.
2. **`demo2`** — *Rahasia Kode OTP Enam Angka — Mengapa Kode Verifikasimu Kedaluwarsa dalam Tiga Puluh Detik?* (~55 detik): Cara kerja algoritma *Time-Based One-Time Password* (TOTP) yang menggabungkan kunci rahasia unik dan stempel waktu 30 detik.
3. **`demo3`** — *Apa yang Terjadi Saat Kamu Memesan Ojek Online? — Tiga Algoritma yang Bekerja dalam Dua Detik* (~55 detik): Orkestrasi indeks geospasial heksagonal, tarif dinamis *supply-demand*, dan algoritma *matchmaking* waktu tempuh nyata.
