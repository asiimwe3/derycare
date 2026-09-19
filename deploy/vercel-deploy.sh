#!/usr/bin/env bash
# DeryCare Vercel deployment + Pesapal/Supabase env setup.
# Requires: VERCEL_TOKEN, PESAPAL_CONSUMER_KEY, PESAPAL_CONSUMER_SECRET (env)
#           PESAPAL_ENV (live|demo, default live)
#           .sb/service.key (Supabase service role key) and .sb/anon.key in repo root
set -euo pipefail
cd "$(dirname "$0")/.."

: "${VERCEL_TOKEN:?VERCEL_TOKEN missing}"
: "${PESAPAL_CONSUMER_KEY:?PESAPAL_CONSUMER_KEY missing}"
: "${PESAPAL_CONSUMER_SECRET:?PESAPAL_CONSUMER_SECRET missing}"
PESAPAL_ENV="${PESAPAL_ENV:-live}"
SB_URL="https://upjmzobjnpeldiubuopk.supabase.co"
SB_KEY="$(cat .sb/service.key)"

command -v vercel >/dev/null 2>&1 || npm install -g vercel >/dev/null

echo "── Deploying to Vercel (production) ──"
vercel --yes --prod --token "$VERCEL_TOKEN" 2>&1 | tail -3

echo "── Setting project environment variables ──"
PROJECT_ID=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v9/projects?limit=100" \
  | python3 -c "import json,sys; print(next(p['id'] for p in json.load(sys.stdin)['projects'] if p['name']=='derycare'))")

set_env() {
  curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" -H "Content-Type: application/json" \
    -d "{\"key\":\"$1\",\"value\":$(python3 -c "import json,sys; print(json.dumps(sys.argv[1]))" "$2"),\"type\":\"encrypted\",\"target\":[\"production\",\"preview\"]}" \
    -o /dev/null -w "$1: %{http_code}\n"
}
set_env PESAPAL_CONSUMER_KEY "$PESAPAL_CONSUMER_KEY"
set_env PESAPAL_CONSUMER_SECRET "$PESAPAL_CONSUMER_SECRET"
set_env PESAPAL_ENV "$PESAPAL_ENV"
set_env SUPABASE_URL "$SB_URL"
set_env SUPABASE_SERVICE_KEY "$SB_KEY"

echo "── Redeploying with env vars active ──"
vercel deploy --prod --token "$VERCEL_TOKEN" --cwd . 2>&1 | tail -2
echo "── Done. Verify: <deployment-url>/api/health ──"
