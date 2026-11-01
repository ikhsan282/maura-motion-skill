---
id: dark-glow-ui
name: UI Produk Gelap Bercahaya
no: 31
source: github:product-film-dark + dark-glow-product-ui (awesome-opus5-5-videos)
family: 2D
tech: canvas2d
music: synthwave   voice: id-m   captions: neon
best_for: keamanan digital, enkripsi, AI, fintech, "apa yang terjadi di balik layar", angka raksasa, peluncuran teknologi
---
# UI Produk Gelap Bercahaya

**Ciri khas (look):** panggung navy hampir hitam (#06070C–#0B0E1A), tiga glow raksasa ungu #7C6CFF, biru
#3DA9FF dan pink #FF5FD2 yang melayang pelan (sprite pra-render, digabung di kanvas kecil lalu di-upscale
sekali), grid tipis dan film grain. Kartu glassmorphism: badan navy transparan, rim 1 px yang lebih terang
di atas, highlight dalam, halo warna. Mockup HP gelap dengan rim light. Judul Inter putih dengan kata aksen
bergradasi ungu→biru, label mikro JetBrains Mono di sudut (timecode, "E2E · AES-256"), angka raksasa
bergaya tabular (10⁷⁷).

**Gerak (motion):** pegas closed-form, kartu naik + membesar + memudar masuk, teks diacak jadi glyph sandi
dan didekode kembali, jejak cahaya (light trail) mengikuti objek yang terbang, percikan partikel kecil,
kilatan glow di setiap pindah adegan jauh, kamera dolly menyamping dalam satu dunia.

**Kenapa menarik:** kontras tinggi di layar OLED, glow terasa mahal, angka raksasa jadi hook instan; cocok
untuk topik "rahasia teknologi".

**Cerita yang cocok:**
- Enkripsi end-to-end: "'Aku sayang kamu' ini diacak jadi kode sebelum keluar dari HP-mu."
- Password & hash: "Server tidak pernah tahu password-mu. Ia cuma menyimpan sidiknya."
- Kartu debit tap: "Kartumu membuat kode baru di setiap transaksi."
- AI menjawab: "Sebelum menjawab, AI ini menebak satu kata, ribuan kali."
- Deepfake suara: "Tiga detik suaramu cukup untuk meniru semuanya."

**Rumus hook:** "[Pesan/benda pribadi] ini... [berubah jadi sesuatu] sebelum [momen]." / "[Angka raksasa]
— itu jumlah [kemungkinan/percobaan] untuk [membobol X]." / "Yang dilihat [server/pihak lain] dari [X]-mu: [Y]."

**Kit API (`styles/dark-glow-ui/kit.js`):**
- `spring`, `springKeys`, `sp`, `count`, `camAt(t,[[t,x,y,zoom,rot]])`, `applyCam`, `toScreen(cam,x,y)`.
- `stage(ctx,t,{px,py,intensity})`: navy + glow raksasa + grid; `glowSprite(rgb)`, `glow(ctx,x,y,r,rgb,a)` (aditif, area kecil).
- `glass(ctx,x,y,w,h,{r,haloRgb,haloA})`, `halo(...)`, `rise(ctx,cx,cy,p)`: kartu kaca & masuk.
- `label`, `micro` (label mono), `headline(ctx,t,t0,['*kata* aksen'],x,y,{size,out})`, `power(ctx,'10','77',x,y,{size})`.
- `cipher(seed,n)`, `scramble(plain,u,t,seed,target)`: teks ↔ glyph sandi.
- `padlock(ctx,x,y,s,{open})`, `keyIcon`, `ticks(ctx,x,y,n,{color,p})`, `server(ctx,x,y,s,t,{active})`, `eyeOff`, `heart`.
- `bubble(ctx,x,y,text,{mine,tickN,tickColor,mono})`, `phone(ctx,x,y,s,draw,{rimRgb})`.
- `lightTrail(ctx,P(u),u,{len,rgb})`, `sparks(ctx,x,y,age)`, `bez`, `finish(ctx,t,AM)` (vignette + grain).
- Kinerja: pakai 2 layer saja (world + ui); setiap layer penuh tambahan = satu komposit lagi saat capture.

**Demo:** "Apa yang Terjadi Saat Kamu Menekan Kirim", 19,5 detik. Kartu "Aku sayang kamu ♥" diacak jadi kode →
gembok menutup di atasnya → terbang ke server (sinar pemindai gagal: "Isi: tidak terbaca", centang satu) →
ke HP si dia (centang dua), kunci privat di HP itu membukanya → "Dibobol?" 10⁷⁷ kemungkinan kunci (AES-256,
2²⁵⁶ ≈ 1,16×10⁷⁷) → seluruh perjalanan menyala: "Untuk satu orang." (Server tetap melihat metadata, jadi
naskah hanya bilang server tak bisa membaca isinya.)
