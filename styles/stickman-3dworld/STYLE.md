---
id: stickman-3dworld
name: Stickman 3D World
no: 69
source: custom:stickman-duel-kit
family: craft
tech: canvas2d
music: lofi   voice: el-id-m   captions: hand
best_for: prokrastinasi & fokus, lawan mager
---
# Stickman 3D World

**Ciri khas (look):** notebook doodle gelap (#0e1626): panel sketsa tangan per baris — tulisan PEMALAS? dicoret merah, awan rasa-tak-enak, alarm amigdala KABUR!, HP lega lalu hujan rasa bersalah, timer biru 5 menit, dorong batu TUGAS yang menyusut jadi kerikil. Semua boil (wobble tangan).

**Gerak (motion):** scroll vertikal halaman notebook, satu panel doodle per baris; Sketch bertahap (tulis→coret→gambar), pop outBack, kamera geser ke bawah mengikuti panel.

**Kenapa menarik:** kontras coret-merah + hujan rasa bersalah yang langsung kebaca; batu TUGAS menyusut = payoff visual trik 5 menit.

**Cerita yang cocok:**
- prokrastinasi & fokus, lawan mager, trik 5 menit, amigdala vs korteks, mulai dulu mood nyusul

**Rumus hook:** "Kamu bukan pemalas. Otakmu cuma [pelarian]." / "[Beban besar] ... menyusut jadi [kecil]."

**Kit API (`styles/stickman-3dworld/kit.js`):**
- Sketch (text/line bertahap, boil), Pen, stickDraw, bubble, notebook/notebookTile, cam, viewRect
- Props: `PAL`, `Sketch`, `Pen`, `stick`, `stickDraw`, `bubble`, `notebook`, `viewRect`, `cam`, `mline`, `mtext`.

**Demo:** "Kenapa Kita Menunda-nunda" — 5 baris, voice el-id-m (ElevenLabs George), musik lofi. Hook: "Kamu bukan pemalas. Otakmu cuma kabur dari rasa tidak enak."
