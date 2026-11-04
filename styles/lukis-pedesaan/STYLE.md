---
id: lukis-pedesaan
name: Lukis Pedesaan
no: 3
source: drive:03_Lukis_Pedesaan
family: painterly
tech: paint
music: folk   voice: el-id-m   captions: elegant
best_for: Lukisan impresionis pedesaan yang bergerak (paint pass): sawah berundak, gubuk, petani, langit pagi
---
# Lukis Pedesaan

**Ciri khas (look):** Lukisan impresionis pedesaan yang bergerak (paint pass): sawah berundak, gubuk dangau, kerbau, burung kuntul putih, petani, dan langit pagi keemasan. Sapuan kuas pendek penuh warna murni, peralihan warna padi dari hijau muda ke emas bernas, serta kabut pagi yang mengalir lembut di sela perbukitan.

**Gerak (motion):** Transisi dan animasi mengikuti irama narasi per baris (`AM.cue`, `AM.wordTime`), dengan pergerakan kamera halus, time-lapse pertumbuhan tanaman, dan sapuan kuas impresionis (`meta = { fps: 24, hold: 3 }`).

**Kenapa menarik:** Visual Lukis Pedesaan memberikan atmosfer hangat dan puitis khas lukisan kanvas hidup yang langsung menghentikan scroll pada detik pertama.

**Cerita yang cocok:**
- Dewi Sri, Asal Mula Padi (`demo1/`): "Setiap butir nasimu, konon, berasal dari tubuh seorang dewi."
- Fajar Seorang Petani & Sepiring Nasi (`demo2/`): "Sebelum matahari terbit dan kota terbangun, sepasang kaki tua sudah melangkah menembus dinginnya kabut sawah pedesaan."
- Tradisi Wiwitan: Syukur Bumi Sebelum Panen (`demo3/`): "Di desa-desa Jawa, petani tidak pernah langsung memetik padi yang menguning sebelum menggelar sebuah ritual syukur yang hening."

**Rumus hook:** "Setiap butir nasi di piringmu... ternyata melewati [perjalanan/legenda tak terduga]."

**Kit API (`styles/lukis-pedesaan/kit.js`):**
- Exports: `LOOK`, `PAL`, `painter`, `view`, `mix`, `rgbaHex`, `radial`, `poly`, `cloudMass`, `morningSky`, `hills`, `volcano`, `mist`, `terraces`, `riceStalks`, `palm`, `bamboo`, `hut`, `naga`, `egg`, `grave`, `riceBowl`, `kerbau`, `blekok`, `sungai`, `lesung`, `tumpeng`, `label`, `title`, `COSTUMES`, `RIG`, `figure`, `handPos`, `headPos`.

**Demos:**
- **`demo1/` ("Dewi Sri, Asal Mula Padi", 6 shot, voice `el-id-m`):** Sawah terasering saat fajar → air mata naga Antaboga menjadi telur berkilau → Dewi Sri di kahyangan → dari makamnya tumbuh kelapa, bambu, dan padi → panen raya Mapag Sri → semangkuk nasi hangat di tepi jendela.
- **`demo2/` ("Fajar Seorang Petani & Sepiring Nasi", 10 shot, ~55–65 dtk, voice `el-id-m`):** Langkah petani menembus kabut subuh → membajak lumpur bersama kerbau → menanam bibit padi (tandur) → menjaga sawah ditemani burung kuntul → berteduh dan berdoa di dangau saat angin kencang → lembah hijau berubah menjadi lautan emas → panen raya → menumbuk padi di lesung kayu → perjalanan 100 hari menjadi beras putih → semangkuk nasi hangat penuh syukur.
- **`demo3/` ("Tradisi Wiwitan: Syukur Bumi Sebelum Panen", 10 shot, ~55–65 dtk, voice `el-id-m`):** Hening sebelum panen di sawah Jawa → filosofi tradisi Wiwitan → ibu-ibu merangkai tumpeng di atas daun pisang → arak-arakan warga menyusuri pematang berkabut → menyeberangi sungai desa → menggelar tikar pandan dan bunga melati di dekat dangau → doa syukur tetua desa → petik padi pertama dengan ani-ani → makan bersama (kembul bujana) → harmoni manusia sebagai sahabat bumi.
