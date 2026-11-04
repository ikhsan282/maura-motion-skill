---
id: dark-glow-ui
name: UI Produk Gelap Bercahaya
no: 31
source: github:product-film-dark + dark-glow-product-ui (awesome-opus5-5-videos)
family: 2D
tech: canvas2d
music: synthwave   voice: el-id-m   captions: neon
best_for: keamanan digital, enkripsi, AI, fintech, "apa yang terjadi di balik layar", angka raksasa, peluncuran teknologi
---
# UI Produk Gelap Bercahaya

**Ciri khas (look):** panggung navy hampir hitam (#06070C–#0B0E1A), tiga glow raksasa ungu #7C6CFF, biru #3DA9FF dan pink #FF5FD2 yang melayang pelan (sprite pra-render, digabung di kanvas kecil lalu di-upscale sekali), grid tipis dan film grain. Kartu glassmorphism: badan navy transparan, rim 1 px yang lebih terang di atas, highlight dalam, halo warna. Mockup HP gelap dengan rim light. Judul Inter putih dengan kata aksen bergradasi ungu→biru, label mikro JetBrains Mono di sudut (timecode, "E2E · AES-256"), angka raksasa bergaya tabular ($10^{77}$).

**Gerak (motion):** pegas closed-form, kartu naik + membesar + memudar masuk, teks diacak jadi glyph sandi dan didekode kembali, jejak cahaya (light trail) mengikuti objek yang terbang, percikan partikel kecil, kilatan glow di setiap pindah adegan jauh, kamera dolly menyamping dalam satu dunia.

**Kenapa menarik:** kontras tinggi di layar OLED, glow terasa mahal, angka raksasa jadi hook instan; cocok untuk topik "rahasia teknologi".

**Cerita yang cocok:**
- Enkripsi end-to-end: "'Aku sayang kamu' ini diacak jadi kode sebelum keluar dari HP-mu."
- Password & hash: "Server tidak pernah tahu password-mu. Ia cuma menyimpan sidiknya."
- Kartu debit tap: "Kartumu membuat kode baru di setiap transaksi."
- AI menjawab: "Sebelum menjawab, AI ini menebak satu kata, ribuan kali."
- Deepfake suara: "Tiga detik suaramu cukup untuk meniru semuanya."

**Rumus hook:** "[Pesan/benda pribadi] ini... [berubah jadi sesuatu] sebelum [momen]." / "[Angka raksasa] — itu jumlah [kemungkinan/percobaan] untuk [membobol X]." / "Yang dilihat [server/pihak lain] dari [X]-mu: [Y]."

**Kit API (`styles/dark-glow-ui/kit.js`):**
- `spring`, `springKeys`, `sp`, `count`, `camAt(t,[[t,x,y,zoom,rot]])`, `applyCam`, `toScreen(cam,x,y)`.
- `stage(ctx,t,{px,py,intensity})`: navy + glow raksasa + grid; `glowSprite(rgb)`, `glow(ctx,x,y,r,rgb,a)` (aditif, area kecil).
- `glass(ctx,x,y,w,h,{r,haloRgb,haloA})`, `halo(...)`, `rise(ctx,cx,cy,p)`: kartu kaca & masuk.
- `label`, `micro` (label mono), `headline(ctx,t,t0,['*kata* aksen'],x,y,{size,out})`, `power(ctx,'10','77',x,y,{size})`.
- `cipher(seed,n)`, `scramble(plain,u,t,seed,target)`: teks ↔ glyph sandi.
- `padlock(ctx,x,y,s,{open})`, `keyIcon`, `ticks(ctx,x,y,n,{color,p})`, `server(ctx,x,y,s,t,{active})`, `eyeOff`, `heart`.
- `bubble(ctx,x,y,text,{mine,tickN,tickColor,mono})`, `phone(ctx,x,y,s,draw,{rimRgb})`.
- `lightTrail(ctx,P(u),u,{len,rgb})`, `sparks(ctx,x,y,age)`, `bez`, `finish(ctx,t,AM)` (vignette + grain).

**Paket 3 Demo (`demo1`, `demo2`, `demo3` — 30–90 detik, voice `el-id-m`):**
- **`demo1` — "Apa yang Terjadi Saat Kamu Menekan Kirim — Rahasia Enkripsi End-to-End AES-256"**: Kartu pesan *"Aku sayang kamu ♥"* diacak menjadi glyph sandi, dikunci gembok kriptografi publik, meluncur melewati server (tidak terbaca) menuju HP penerima, lengkap dengan angka raksasa $10^{77}$ kemungkinan kunci AES-256.
- **`demo2` — "Kenapa Server Tidak Pernah Tahu Password-mu? — Rahasia Fungsi Hash Satu Arah"**: Menjelaskan bagaimana kata sandi digiling fungsi hash satu arah (`SHA-256` / `Argon2id`) dan dicampur `Salt` unik menjadi sidik digital 64 karakter yang butuh $10^{60}$ percobaan untuk ditebak mundur.
- **`demo3` — "Bagaimana AI Menjawab Pertanyaanmu? — Rahasia Prediksi Satu Kata demi Satu Kata"**: Memvisualisasikan proses tokenisasi kalimat, jaringan saraf Transformer $10^{12}$ parameter, bar probabilitas kata berikutnya, pengaturan *Temperature*, dan siklus autoregresif di kluster GPU.
- **Demo pendek tambahan**: `demo-notif/` (*Notifikasi Tidak Pernah Tidur*, 19 dtk) & `demo-dashboard/` (*Dashboard: Data Hidup di Layar*, 15 dtk).
