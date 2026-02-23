#!/usr/bin/env bash
set -euo pipefail

API_URL="${SWITCHPOST_API_URL:-http://localhost:8080}"
ADMIN_KEY="${E2E_ADMIN_KEY:-e2e-admin-key}"

echo "Waiting for API to be ready..."
for i in $(seq 1 30); do
  if curl -sf "$API_URL/admin/settings" \
    -H "Authorization: ApiKey $ADMIN_KEY" > /dev/null 2>&1; then
    echo "API is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: API did not become ready in time." >&2
    exit 1
  fi
  sleep 2
done

echo "Creating e2e test tenant..."
RESPONSE=$(curl -sf "$API_URL/admin/tenants" \
  -H "Authorization: ApiKey $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"e2e-test","display_name":"E2E Test Tenant"}')

API_KEY=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['api_key'])")

cat > .env.e2e <<EOF
SWITCHPOST_API_URL=$API_URL
SWITCHPOST_API_KEY=$API_KEY
EOF

echo "Bootstrap complete. API key written to .env.e2e"
