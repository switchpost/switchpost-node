#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SIBLING_DIR="$REPO_ROOT/../switchpost-spec"
TARGET="$REPO_ROOT/features"

if [ -d "$SIBLING_DIR/features" ]; then
    echo "Copying features/ from sibling switchpost-spec..."
    rm -rf "$TARGET"
    cp -r "$SIBLING_DIR/features" "$TARGET"
elif command -v gh &>/dev/null; then
    echo "Downloading features/ via gh CLI..."
    rm -rf "$TARGET"
    mkdir -p "$TARGET"
    gh api repos/switchpost/switchpost-spec/contents/features \
        --jq '.[].name' | while read -r fname; do
        gh api "repos/switchpost/switchpost-spec/contents/features/$fname" \
            --jq '.content' | base64 -d > "$TARGET/$fname"
    done
else
    echo "ERROR: Cannot find features. Place switchpost-spec alongside this repo or install gh CLI." >&2
    exit 1
fi

echo "Features synced to $TARGET"
