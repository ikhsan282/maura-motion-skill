---
id: kartun-jadul
name: Kartun Jadul (Rubber Hose)
no: 10
source: drive:10_Kartun_Jadul + github:thick-outline-cartoon (rubber-hose)
family: 2D
tech: canvas2d
music: ragtime   voice: el-id-m   captions: typewriter
best_for: dongeng fabel (Kancil, Si Kabayan), komedi slapstick, cerita moral anak, iklan bergaya retro, sejarah penemuan lucu
---
# Kartun Jadul (Rubber Hose)

**Ciri khas (look):** kartun hitam-putih 1920–30an. Kertas krem #ece6d6, tinta #141210, abu-abu #d6cfbd/#a8a294/#77726a.
Tokoh dengan lengan-kaki "selang karet" (satu garis tebal melengkung), sarung tangan putih, mata pie-cut (pupil hitam
dengan potongan baji), wajah putih di badan hitam. Kartu judul art-deco (bingkai ganda, kipas di sudut, sunburst
berputar) dengan Abril Fatface + Special Elite. Onomatope di ledakan bintang (Rye).

**Gerak (motion):** dianimasikan on twos (`hold: 2`), semua benda "bernapas" dan memantul tepat di ketukan ragtime
(104 BPM), squash & stretch, line boil, smear + debu saat kabur, lengan karet yang meregang. Efek film: grain, flicker,
gate weave, goresan, bintik debu, vignette berat; iris-in di awal, iris-out ke "TAMAT" di akhir.

**Kenapa menarik:** nostalgia instan, kontras hitam-putih kuat di tengah feed yang berwarna, dan humor slapstick
universal.

**Cerita yang cocok:**
- Kancil mencuri timun: "Seekor kancil, kebun timun, dan petani yang habis sabar."
- Kancil dan buaya: "Ia menghitung buaya... untuk menyeberang sungai."
- Si Kabayan dan nangka hanyut: "Orang paling malas sekampung menyuruh buah nangka pulang sendiri lewat sungai."
- Asal-usul payung: "Dulu, payung cuma untuk raja."
- Tikus dan kucing di dapur warung: "Satu ikan asin, dua musuh bebuyutan."

**Rumus hook:** "Seekor [hewan], sebuah [benda], dan [musuh] yang [habis sabar]." / "Dahulu kala, [tokoh] punya satu
kebiasaan buruk: [X]." / "Ini kisah [tokoh cerdik] yang menipu [tokoh kuat]."

**Kit API (`styles/kartun-jadul/kit.js`):**
- `critter(ctx, 'kancil'|'belang', x, y, s, {t, armL, armR:[x,y,pose], walk, look, blink, mouth, wink, ears, sq, lean, face, sweat, tongue})`.
- `tani(ctx, x, y, s, {angry, steam, armL, armR, walk, mouth})` Pak Tani / Kabayan bercaping; `scarecrow` (orang-orangan bergetah), `timun` (timun berwajah memantul), `buaya(ctx, x, y, s, {mouth, num, angry})`, `cage` + `cageFront({door})`.
- Bagian: `hose`, `glove(pose: open|fist|point|wave)`, `pieEye`.
- Tempat: `sky({night})`, `kebun`, `sungai({y, h, night})`, `pohon(ctx, x, y, s, {fruits})`, `rumah`.
- Efek: `film(ctx,t)`, `weave(t)` (gate weave untuk kamera), `iris(ctx,x,y,r)`, `titleCard(ctx,t,title,sub)`, `burst('PLAK!')`, `smear`, `dust`, `bubble`.
- Irama: `BPM`, `beat(t)`, `squash(t)`, `boil(t)`.

**Koleksi Demo (`demo1`, `demo2`, `demo3` — 30–90 detik):**
- **`demo1`** — *Kancil Mencuri Timun — Jebakan Orang-Orangan Bergetah* (6 shot, ~54 dtk): Kartu judul KANCIL → kebun timun menari & Pak Tani berasap → Kancil melahap timun satu, dua, tiga → orang-orangan bergetah "PLAK!" melengketkan tangan & kaki → di kandang ayam Kancil membujuk si Belang "MAU DINIKAHKAN!" → Belang masuk kandang, Kancil kabur "ZOOM!" → iris-out ke TAMAT.
- **`demo2`** — *Kancil dan Barisan Buaya — Jembatan Hidup di Sungai Lebar* (9 shot, ~55 dtk): Kartu judul KANCIL & BUAYA → Kancil mengincar pohon buah ranum di seberang sungai → buaya menghadang → Kancil membawa pengumuman "PERINTAH RAJA HUTAN!" → barisan buaya berjejer rapi menjadi jembatan hidup → Kancil melompat di punggung buaya "SATU! DUA! TIGA!" → melompat ke tepi seberang dan mengaku cuma menumpang lewat → buaya marah kecipratan air → iris-out ke TAMAT.
- **`demo3`** — *Si Kabayan dan Nangka Hanyut — Suruh Pulang Sendiri lewat Sungai* (9 shot, ~55 dtk): Kartu judul SI KABAYAN → berjalan ke kebun tepi sungai bersama si Belang → keberatan mengangkat nangka raksasa ("BERAT!") → menasihati nangka "KAMU KAN SUDAH TUA, PULANG SENDIRI YA!" → mendorong nangka "BYUR!" hanyut di sungai → pulang lenggang kangkung → alasan polos di depan gubuk → dikejar keliling halaman ("AMPUN BAH!") → iris-out ke TAMAT.
