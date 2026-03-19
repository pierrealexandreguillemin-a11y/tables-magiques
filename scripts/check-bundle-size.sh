#!/usr/bin/env bash
# check-bundle-size.sh — Fail if gzipped bundle exceeds threshold
# Industry standard: track bundle size regression in CI
#
# Usage: bash scripts/check-bundle-size.sh [max_kb]
# Default threshold: 560 KB gzipped (current baseline: ~526 KB)

set -euo pipefail

MAX_KB="${1:-560}"
BUILD_DIR=".next"

# Ensure build exists
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ No .next directory found. Run 'npm run build' first."
  exit 1
fi

# Calculate total gzipped size of JS chunks
TOTAL_BYTES=0
while IFS= read -r file; do
  SIZE=$(gzip -c "$file" | wc -c)
  TOTAL_BYTES=$((TOTAL_BYTES + SIZE))
done < <(find "$BUILD_DIR/static" -name "*.js" -type f 2>/dev/null)

TOTAL_KB=$((TOTAL_BYTES / 1024))

echo "📦 Bundle size (gzipped JS): ${TOTAL_KB} KB"
echo "📏 Threshold: ${MAX_KB} KB"

if [ "$TOTAL_KB" -gt "$MAX_KB" ]; then
  echo "❌ FAIL: Bundle size ${TOTAL_KB} KB exceeds threshold ${MAX_KB} KB"
  echo "   Review recent changes for unnecessary dependencies or missing code splitting."
  exit 1
else
  echo "✅ PASS: Bundle size within threshold (${TOTAL_KB}/${MAX_KB} KB)"
  exit 0
fi
