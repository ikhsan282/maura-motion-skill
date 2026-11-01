#!/usr/bin/env bash
# Light preview copies of every demo (for the style-picker page): 432x768, ~350 kbps, mono AAC, + a poster frame.
# usage: scripts/build_previews.sh <outdir>
set -euo pipefail
SK="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$SK/../dist/gallery}"
mkdir -p "$OUT/v" "$OUT/p"
for f in "$SK"/styles/*/demo/out/*.mp4; do
  b=$(basename "$f" .mp4)
  [ -s "$OUT/v/$b.mp4" ] && [ "$OUT/v/$b.mp4" -nt "$f" ] && continue
  ffmpeg -v error -y -i "$f" -vf "scale=432:768:flags=lanczos" -c:v libx264 -preset veryfast -b:v 330k -maxrate 420k -bufsize 840k \
    -pix_fmt yuv420p -c:a aac -b:a 64k -ac 1 -movflags +faststart "$OUT/v/$b.mp4"
  ffmpeg -v error -y -ss 2.2 -i "$f" -frames:v 1 -vf "scale=432:768" -q:v 5 "$OUT/p/$b.jpg"
  echo "preview $b $(du -k "$OUT/v/$b.mp4" | cut -f1)KB"
done
