#!/usr/bin/env bash

# Copyright 2026 SwitchPost Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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
