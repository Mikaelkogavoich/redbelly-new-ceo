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

python3 verification/verify.py --write
