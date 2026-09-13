#!/bin/sh
set -eu

if [ -z "${SHOPIFY_APP_URL:-}" ] && [ -n "${RAILWAY_PUBLIC_DOMAIN:-}" ]; then
  export SHOPIFY_APP_URL="https://${RAILWAY_PUBLIC_DOMAIN}"
  echo "StockPing: SHOPIFY_APP_URL set from Railway domain: $SHOPIFY_APP_URL"
fi

missing=""
[ -z "${DATABASE_URL:-}" ] && missing="$missing DATABASE_URL"
[ -z "${SHOPIFY_API_KEY:-}" ] && missing="$missing SHOPIFY_API_KEY"
[ -z "${SHOPIFY_API_SECRET:-}" ] && missing="$missing SHOPIFY_API_SECRET"
[ -z "${SHOPIFY_APP_URL:-}" ] && missing="$missing SHOPIFY_APP_URL"

if [ -n "$missing" ]; then
  echo "StockPing will not start until these Railway variables are set:$missing"
  echo "SHOPIFY_APP_URL example: https://your-app.up.railway.app"
  echo "Get Shopify keys with: shopify app env show"
  # Slow down Railway restart loops so logs stay readable
  sleep 20
  exit 1
fi

npx prisma migrate deploy
exec npm run start
