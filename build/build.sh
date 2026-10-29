#!/usr/bin/env bash
# Rebuilds every deliverable from build/content.js, exports the PDFs and runs the checks.
set -euo pipefail
cd "$(dirname "$0")/.."

node build/build.js

for doc in 01-briefing/new-ceo-briefing.docx 03-source-list/source-list.docx; do
  soffice --headless --convert-to pdf --outdir "$(dirname "$doc")" "$doc" >/dev/null
done

python3 verification/verify.py --write
