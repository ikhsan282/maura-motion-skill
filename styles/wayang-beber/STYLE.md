---
id: wayang-beber
name: Wayang Beber
no: 16
source: drive:16_Wayang_Beber
family: craft
tech: canvas2d
music: gamelan-pelog   voice: id-m   captions: serif
best_for: kisah Panji, legenda Jawa, cerita cinta klasik, sejarah kerajaan, kisah bersambung "adegan demi adegan", misteri pusaka
---
# Wayang Beber

**Ciri khas (look):** gulungan **kertas daluwang** (#d9c49a, berserat dan bernoda usia) dibentangkan di antara dua
**tiang penggulung kayu** di ruangan gelap, diterangi **lampu minyak berbentuk garuda** yang tergantung. Lukisan
bergaya wayang klasik Jawa: figur **profil datar**, dahi-hidung satu garis panjang, mata almond, mahkota/gelung,
dada telanjang oker, kain bermotif, selendang berkibar; pigmen tanah (merah oker #a03a22, oker #c99a3b, hijau #6f7f4c,
putih #efe5c9, biru #3e5a7a) bergaris tinta hitam. Ruang kosong diisi **sulur spiral, daun, bunga**; tepi atas-bawah
pita merah dengan **tumpal** putih; antar adegan (jagong) dipisah pita berornamen. Label: kartu daluwang berbingkai
merah dengan huruf Cinzel dan keterangan EB Garamond miring.

**Gerak (motion):** gulungan **bergulir dari kanan ke kiri** antar adegan (penggulung berputar, kertas melengkung
gelap di dekat tiang); **lampu berkedip** dan napas cahayanya mengubah terang seluruh ruangan; **tuding** sang dalang
menunjuk tokoh yang sedang dikisahkan. Lukisan "hidup" pelan: tokoh berjalan, menoleh, mengangkat tangan, raja
berbicara, penari mengangkat topeng barong, penabuh memukul kendang, kelopak bunga jatuh di pernikahan. Adegan
terakhir tetap **tergulung dan diikat tali merah**.

**Kenapa menarik:** bentuk wayang tertua yang jarang dilihat orang; rasa "pusaka keramat" dan misteri; lukisan yang
bergerak di bawah api lampu terasa magis; komposisi pita lebar dengan ruang gelap memberi tempat untuk teks.

**Cerita yang cocok:**
- Panji & Dewi Sekartaji: "Adegan terakhir kisah cinta ini... tak boleh dibuka."
- Ande-Ande Lumut: "Ia menolak semua gadis cantik... kecuali yang paling sederhana."
- Ken Arok & keris Mpu Gandring: "Keris ini mengutuk tujuh keturunan pemiliknya."
- Jaka Tarub & bidadari: "Ia mencuri selendang... dan seorang bidadari tak bisa pulang."
- Sejarah Majapahit dalam gulungan: "Kerajaan terbesar Nusantara, digulung dalam satu kertas."

**Rumus hook:** "Adegan terakhir [kisah] ini... tak boleh dibuka." / "Gulungan ini hanya dibentangkan [syarat langka]."
/ "[Tokoh] menyamar jadi [orang biasa] untuk [tujuan]."

**Kit API (`styles/wayang-beber/kit.js`):**
- `scrollCanvas(key, [sceneFn...])`: lukisan gulungan (cached), satu fungsi per adegan `(g, x0, w, h)`; `SCROLL` (H, SCENE).
- Ornamen lukisan: `shape(g, path, fill)`, `vine(g, x, y, s, seed)`, `tree`, `pendopo`, `gate` (candi bentar).
- `figure(g, 'putri'|'emban'|'raja'|'patih'|'jaka'|'abdi'|'warga', {x, y, s, face, t, walk, armF, armB, look, mouth, mask, dance, drum})`.
- Panggung: `scrollWindow(ctx, S, u0, x, y, w)`, `roller(ctx, x, y, h, turn, r, {tied})`, `lamp(ctx, x, y, t)` → flicker,
  `lampLight(ctx, x, y, f)`, `flicker(t)`, `tuding(ctx, x, y, bx, by)`, `cartouche(ctx, text, x, y, {size, sub})`.

**Demo:** "Panji & Dewi Sekartaji", 19,8 detik. Gulungan terbuka cepat melewati semua adegan dan berhenti di
gulungan terakhir yang terikat ("ADEGAN KE-24, tak boleh dibuka") → Sekartaji keluar gerbang istana bersama emban →
Prabu Brawijaya mengumumkan sayembara → di pasar Jaka Kembang Kuning menari dengan topeng barong, abdi menabuh
kendang, sang putri mengenalinya → pernikahan dengan hujan kelopak; tuding berpindah ke adegan ke-24 yang tetap tergulung.
