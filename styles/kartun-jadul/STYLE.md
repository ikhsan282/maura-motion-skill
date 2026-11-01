---
id: kartun-jadul
name: Kartun Jadul (Rubber Hose)
no: 10
source: drive:10_Kartun_Jadul + github:thick-outline-cartoon (rubber-hose)
family: 2D
tech: canvas2d
music: ragtime   voice: id-m   captions: typewriter
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
- Si Kabayan memancing di sawah: "Orang paling malas sekampung punya ide paling aneh."
- Asal-usul payung: "Dulu, payung cuma untuk raja."
- Tikus dan kucing di dapur warung: "Satu ikan asin, dua musuh bebuyutan."

**Rumus hook:** "Seekor [hewan], sebuah [benda], dan [musuh] yang [habis sabar]." / "Dahulu kala, [tokoh] punya satu
kebiasaan buruk: [X]." / "Ini kisah [tokoh cerdik] yang menipu [tokoh kuat]."

**Kit API (`styles/kartun-jadul/kit.js`):**
- `critter(ctx, 'kancil'|'belang', x, y, s, {t, armL, armR:[x,y,pose], walk, look, blink, mouth, wink, ears, sq, lean, face, sweat, tongue})`.
- `tani(ctx, x, y, s, {angry, steam, armL, armR, walk, mouth})` Pak Tani bercaping; `scarecrow` (orang-orangan bergetah), `timun` (timun berwajah memantul), `cage` + `cageFront({door})`.
- Bagian: `hose`, `glove(pose: open|fist|point)`, `pieEye`.
- Tempat: `sky({night})`, `kebun`, `rumah`.
- Efek: `film(ctx,t)`, `weave(t)` (gate weave untuk kamera), `iris(ctx,x,y,r)`, `titleCard(ctx,t,title,sub)`, `burst('PLAK!')`, `smear`, `dust`, `bubble`.
- Irama: `BPM`, `beat(t)`, `squash(t)`, `boil(t)`.

**Demo:** "Kancil Mencuri Timun", 17,8 dtk, 5 shot. Kartu judul KANCIL → iris-in: Kancil, timun menari, Pak Tani
berasap → orang-orangan bergetah, "PLAK!", lengan Kancil lengket meregang → di kandang ayam Kancil membujuk si
Belang "MAU DINIKAHKAN!" → Belang masuk, Kancil kabur "ZOOM!" dengan smear dan debu → Kancil mengedip memegang timun,
iris-out ke TAMAT.
