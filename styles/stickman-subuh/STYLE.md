---
id: stickman-subuh
name: Stickman Subuh
no: 66
source: custom:stickman-duel-kit
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: clean
best_for: kebiasaan & disiplin, begadang vs tidur cukup, tahajud vs kesiangan, rutinitas pagi, motivasi santai
---
# Stickman Subuh

**Ciri khas (look):** split-screen monokrom (#0D0D0D), dua kamar berdampingan dipisah garis tengah. Properti lengkap:
kasur + bantal + selimut, nakas + HP menyala, sajadah, kalender dinding HARI 1–40 (halaman sobek), jam digital
(SUBUH 4:40), jendela malam, pantulan lantai 0.16. Karakter stickman putih minimalist dengan ghosting trail.

**Gerak (motion):** timeline Day 1 → Day 40: tidur di ATAS kasur (offsetY presisi permukaan matras), bangun duduk,
duduk tepi kasur gosok mata, jalan ke sajadah, takbir → ruku → sujud. Kalender sobek + jam mundur, label berubah
("MENIT PERTAMA" → "SEBELUM ALARM BERBUNYI"), riak alarm berhenti di klimaks.

**Kenapa menarik:** kontras kiri-kanan yang langsung kebaca: satu disiplin, satu tidak. Progres 40 hari dalam
13 detik bikin penonton penasaran sampai akhir.

**Cerita yang cocok:**
- Begadang vs Tidur Cukup: "Jam 12 malam. Satu tidur, satu masih main HP."
- Tahajud vs Kesiangan: "Jam 3 pagi. Satu bangun, satu tetap tidur."
- Alarm vs Disiplin: "ALARM YANG SAMA. SUBUH YANG SAMA."

**Rumus hook:** "Jam [X]. Satu [kebiasaan baik], satu [kebiasaan buruk]." / "HARI 1 ... HARI 40 ..."

**Kit API (`styles/stickman-subuh/kit.js`):**
- `StickmanKit.createFajrScene(kit, { day })`: bangun seluruh scene (header, label, kalender, jam, jendela,
  nakas, 2 kasur, 2 sajadah, riak, 2 karakter + timeline Day 1→40).
- Motion: `sleep` (offsetY 10 = permukaan kasur), `wakeUp`, `turnOffAlarm`, `takbir`, `ruku`, `sujud`, `pray` (loop).
- Props: `bed`, `nightstand` (HP glowing), `prayerMat`, `flipCalendar` (day + fallingPages), `digitalClock`
  (time + subText), `nightWindow`, `soundwaveRipple`, `typewriterText`.

**Demo:** "Begadang vs Tidur Cukup", "Tahajud vs Kesiangan" — 5 baris, voice el-id-m (ElevenLabs George), musik lofi.
