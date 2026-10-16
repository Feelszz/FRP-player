#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/ios-app/PlayerCore"
cp "$ROOT/android-app/app/src/main/assets/index.html" "$ROOT/ios-app/PlayerCore/index.html"
echo "Núcleo sincronizado em ios-app/PlayerCore/index.html"
