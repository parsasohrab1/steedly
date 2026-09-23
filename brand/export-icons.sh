#!/usr/bin/env bash
# Regenerates the raster web icons from brand/logo-mark.svg.
# Needs Chromium/Chrome (headless) and Python Pillow (pip install pillow).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/frontend/public"
TMP="$(mktemp -d)"
CHROME="${CHROME:-$(command -v chromium || command -v google-chrome || command -v chromium-browser)}"

cat > "$TMP/mark.html" <<HTML
<html><body style="margin:0;background:transparent"><img src="file://$ROOT/brand/logo-mark.svg" width="1024" height="1024"></body></html>
HTML
"$CHROME" --headless --no-sandbox --disable-gpu --hide-scrollbars --window-size=1024,1024 \
  --default-background-color=00000000 --screenshot="$TMP/mark.png" "file://$TMP/mark.html"

python3 - "$TMP/mark.png" "$OUT" <<'PY'
import sys
from PIL import Image
src = Image.open(sys.argv[1]).convert("RGBA")
out = sys.argv[2]
for n in (192, 512):
    src.resize((n, n), Image.LANCZOS).save(f"{out}/icon-{n}x{n}.png", optimize=True)
src.resize((180, 180), Image.LANCZOS).save(f"{out}/apple-touch-icon.png", optimize=True)
src.save(f"{out}/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
PY
cp "$ROOT/brand/logo-mark.svg" "$ROOT/brand/logo-mark-mono.svg" "$ROOT/brand/logo-horizontal.svg" "$OUT/"
rm -rf "$TMP"
echo "Icons written to $OUT"
