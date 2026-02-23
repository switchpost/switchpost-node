#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET="$REPO_ROOT/openapi.json"

# Try sibling directory first (local development)
SIBLING="$REPO_ROOT/../switchpost-spec/openapi.json"
if [[ -f "$SIBLING" ]]; then
  cp "$SIBLING" "$TARGET"
  echo "Copied openapi.json from sibling directory."
  exit 0
fi

# Fall back to GitHub CLI
if command -v gh &>/dev/null; then
  echo "Fetching openapi.json via GitHub CLI..."
  gh api repos/switchpost/switchpost-spec/contents/openapi.json \
    --jq '.content' | base64 -d > "$TARGET"
  echo "Downloaded openapi.json from GitHub."
  exit 0
fi

echo "ERROR: Could not find openapi.json. Place it at ../switchpost-spec/openapi.json or install gh CLI." >&2
exit 1
