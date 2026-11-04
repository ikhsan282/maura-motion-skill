---
id: wayang-golek
name: Wayang Golek
no: 15
source: drive:15_Wayang_Golek
family: 3D
tech: three
music: gamelan   voice: el-id-m   captions: serif
best_for: Ramayana, Mahabharata, kisah punakawan Sunda (Si Cepot/Astrajingga, Dawala, Semar), falsafah Pasundan, legenda kepahlawanan
---
# Wayang Golek

**Ciri khas (look):** panggung pertunjukan **Wayang Golek 3D kayu berukir khas Sunda** di Three.js. Boneka dibuat dari
kayu berukir dengan cat mengkilap (*lacquered wood* — `roughness: 0.2`, `metalness: 0.1`) dan ornamen prada emas
(`roughness: 0.25`, `metalness: 0.68`). Setiap boneka tertancap pada batang pisang hijau (**gebog**) di depan panggung
melalui tangkai utama (**cempurit**), mengenakan kain sarung batik panjang (parang, kawung, atau poleng), mahkota/gelung
atau iket Sunda, serta sepasang tangkai bambu (**tuding**) di kedua tangan. Bingkai panggung berupa pilar kayu jati
berukir emas di bawah sorot lampu panggung hangat.

**Gerak (motion):** ciri paling ikonik dari wayang golek adalah **kepala 3D yang berputar dan mengangguk mandiri**
(`headYaw`, `headNod`) di atas leher cempurit, berpadu dengan putaran bahu/badan (`twist`), gerak naik-turun napas
(*bobbing*), dan ayunan lengan bersendi siku yang digerakkan oleh *tuding*. Pergantian babak dibuka oleh **Gunungan/Kayon
3D** berlapis emas dan merah yang berputar membelah panggung.

**Kenapa menarik:** tekstur boneka kayu tiga dimensi yang nyata di bawah sorot lampu hangat, ekspresi jenaka Si Cepot
maupun kegagahan Hanoman dan Gatotkaca, serta kekayaan tradisi panggung Pasundan yang hidup di layar vertikal 9:16.

**Cerita yang cocok:**
- *Hanoman Obong (Ramayana)*: "Seekor kera putih menyusup ke kerajaan raksasa... lalu membakar Alengka dengan ekornya sendiri."
- *Si Cepot & Falsafah Tawa Sunda*: "Boneka kayu merah bergigi satu yang berani menasihati para raja dan dewa."
- *Lahirnya Gatotkaca di Kawah Candradimuka*: "Bayi yang ditempa di kawah gunung berapi hingga berotot kawat bertulang besi."

**Kit API (`styles/wayang-golek/kit.js`):**
- Panggung & Kamera: `golekStage(AM, {theme: 'alengka'|'taman'|'fire'|'sunda'|'kawah'})`, `lookStage(camera, {pos, target, fov, sway, t})`.
- Boneka 3D: `makePuppet(kind, {scale})` untuk `'hanoman'`, `'rahwana'`, `'sinta'`, `'rama'`, `'cepot'`, `'dawala'`, `'semar'`, `'gatotkaca'`, `'buto'`.
- Animasi Boneka: `posePuppet(puppet, t, {x, y, z, face, bob, twist, headYaw, headNod, armL, elbowL, armR, elbowR, wave, tailFire, visible})`.
- Properti Panggung: `makeGunungan()`, `makeFireBank(count)`.
- Plakat 2D: `golekPlaque(ctx, title, sub, {y, alpha})`.

**Paket 3 Demo (`styles/wayang-golek/`):**
- `demo1` — **Hanoman Obong: Kera Putih yang Membakar Kerajaan Alengka** (~55 detik, 9 adegan): penculikan Dewi Sinta oleh Rahwana, utusan Sri Rama, pertemuan di Taman Argasoka, Hanoman ditangkap & ekornya dibakar, hingga Alengka membara.
- `demo2` — **Si Cepot & Falsafah Tawa Sunda: Ketika Rakyat Kecil Menasihati Para Dewa** (~55 detik, 9 adegan): panggung Wayang Golek Pasundan, kehadiran Semar, Si Cepot (Astrajingga) & Dawala, menghadapi kesombongan raksasa dengan silat & humor cerdas, hingga falsafah *Silih Asah, Silih Asih, Silih Asuh*.
- `demo3` — **Lahirnya Gatotkaca di Kawah Candradimuka: Kesatria Otot Kawat Tulang Besi** (~55 detik, 9 adegan): bayi Tetuka yang tak mempan senjata pusaka, diangkat ke Kawah Candradimuka, ditempa para dewa bersama pusaka sakti, hingga bangkit memakai Kotang Antakusuma terbang di angkasa.

