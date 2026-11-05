# Tutorial: Maura Motion Skill di Codex CLI

Panduan ini untuk kamu yang sudah pasang (clone) `maura-motion-skill` dan mau bikin video animasi lewat Codex CLI — dengan cara kerja yang sama seperti Hermes/Maura.

## 1. Persiapan sekali saja

```bash
# clone skill
git clone https://github.com/ikhsan282/maura-motion-skill.git
cd maura-motion-skill

# setup: cek Node/ffmpeg/Chrome + install voice offline
node scripts/setup.mjs
```

Syarat: Node 22+, ffmpeg, Chrome/Chromium, Python 3.10+.

Opsional (suara manusia): isi key ElevenLabs.

```bash
export ELEVENLABS_API_KEY="sk-..."
```

Tanpa key pun bisa render — pakai suara offline (Kokoro/Piper).

## 2. Cara kerja (5 langkah, selalu sama)

| # | Langkah | File |
|---|---|---|
| 1 | Pilih gaya | `STYLES.md` — cari kolom *Paling cocok untuk* |
| 2 | Pelajari kit | `styles/<gaya>/STYLE.md` + intip `demo1/`..`demo3/` |
| 3 | Tulis naskah | `story.json` — 4–6 baris (≤ 20 dtk) atau 8 baris (~60 dtk, "maxDuration": 90), baris 1 = hook |
| 4 | Bangun scene | `scene.js` — 1 shot per baris, pakai fungsi `kit.js` |
| 5 | Render | `node scripts/make.mjs <project>` → MP4 |

Perintah render yang sering dipakai:

```bash
# render biasa (maks 20 dtk)
node scripts/make.mjs styles/flat-vector/demo1

# video panjang (sampai 120 dtk)
AM_MAX_DURATION=90 node scripts/make.mjs styles/stickman-kisah/demo1

# cek visual dulu sebelum render full (hemat waktu!)
node scripts/make.mjs <project> --stills 2,15,40

# ganti suara / musik
node scripts/make.mjs <project> --voice el-id-f --music lofi
```

## 3. Prompt ke Codex (copy-paste)

Buka Codex dari dalam folder repo, lalu pakai pola ini:

```
Baca SKILL.md. Buatkan video vertikal gaya `flat-vector`
tentang "ke mana perginya Rp100 ribu".
Naskah 5 baris Bahasa Indonesia, hook di baris pertama.
Render MP4 + narasi + musik.
```

Variasi yang sering dipakai:

- Ganti gaya: `"pakai gaya kinetic-type tentang fokus satu hal"`
- Topik bebas: `"buatkan video tentang mudik"` (Codex pilihkan gaya yang cocok dari `STYLES.md`)
- Video panjang: `"buatkan 60 detik tentang kirim kucing, gaya infografis-data"`
- Revisi: `"di detik 7 teksnya numpuk, benerin lalu render ulang"`
- Demo baru: `"jadikan demo resmi gaya ini, catat di STYLE.md + README.md"`

## 4. Aturan main (biar hasilnya bagus)

1. **Naskah dulu, selalu.** Baris 1 = hook (kalimat paling menarik). Jangan tulis scene sebelum naskah fix.
2. **Satu shot per baris.** Tiap baris naskah = 1 adegan. Jangan 2 ide dalam 1 shot.
3. **Stills sebelum render full.** `--stills 1,5,9` untuk cek teks numpuk / typo / layout rusak. Render full itu mahal (menitan).
4. **Verifikasi fakta.** Angka, nama, tahun — cek via web search. Jangan bikin kutipan palsu.
5. **Voice default `el-id-m` (George)** untuk hasil akhir; offline untuk draft.
6. **Jangan commit file `build/`** — cuma `scene.js`, `story.json`, `STYLE.md`, `README.md`, dan MP4 di `out/` (pakai `git add -f` karena `build/` di-ignore).

## 5. Contoh sesi lengkap

```
Kamu: Baca SKILL.md. Gaya apa yang paling gampang untuk pemula?

Codex: flat-vector — kotak, lingkaran, teks. Lihat styles/flat-vector/demo1/.

Kamu: Buatkan video gaya flat-vector tentang "peta isi kepala pas macet".
      5 baris, Bahasa Indonesia.

Codex: (baca styles/flat-vector/STYLE.md + kit.js, tulis story.json +
       scene.js di styles/flat-vector/demo-kepala-macet/, render,
       kirim MP4)

Kamu: Di detik 5 tulisan "OTAK MACET" typo, harusnya "OTA MACET"? Cek dulu.

Codex: (cek story.json — ternyata memang typo, benerin, render ulang)
```

## 6. Kalau error

| Gejala | Obat |
|---|---|
| `no story.json` | path proyek salah — pakai path dari root repo, mis. `styles/kinetic-type/demo1` |
| Render kepotong / error TOO LONG | tambah "maxDuration": 90 di story.json atau pasang `AM_MAX_DURATION=90` |
| Suara 401 / model error | cek `ELEVENLABS_API_KEY`, pakai model `eleven_multilingual_v2` |
| Teks numpuk di video | cek `--stills` dulu, perbaiki koordinat x/y di `scene.js`, render ulang |
| `write_file` nolak overwrite | baca file dulu (`read`), baru tulis ulang |

Selamat bikin video! 🎬
