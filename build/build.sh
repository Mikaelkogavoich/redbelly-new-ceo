#!/usr/bin/env bash
# Rebuilds every deliverable from build/content.js, exports the PDFs and runs the checks.
set -euo pipefail
cd "$(dirname "$0")/.."

# The PDFs use the Redbelly DAO Task Board brand fonts. Without them LibreOffice silently substitutes another font.
for font in "Be Vietnam Pro" "JetBrains Mono"; do
  if ! grep -qF "$font" <<< "$(fc-list : family)"; then
    echo "Missing font: $font. Install it from Google Fonts (open licence) and run this script again." >&2
    exit 1
  fi
done

node build/build.js

for doc in 01-briefing/new-ceo-briefing.docx 03-source-list/source-list.docx; do
  soffice --headless --convert-to pdf --outdir "$(dirname "$doc")" "$doc" >/dev/null
done

# Page previews for the README, with a 1px brand-kit border so white pages stay visible on a white page.
mkdir -p 01-briefing/preview
pdftoppm -r 80 -png 01-briefing/new-ceo-briefing.pdf 01-briefing/preview/page
python3 - <<'PY'
from pathlib import Path
from PIL import Image, ImageOps
for f in sorted(Path('01-briefing/preview').glob('page-*.png')):
    ImageOps.expand(Image.open(f).convert('RGB'), border=1, fill='#D3DBE1').save(f, optimize=True)
PY

python3 verification/verify.py --write
