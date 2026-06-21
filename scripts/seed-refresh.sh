#!/usr/bin/env bash
# Reset the Wisal DB and re-seed with fresh realistic data.
# Requires DATABASE_URL to be set (via .env.local or env).

set -e

echo "→ Loading .env.local..."
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

echo "→ Resetting database (migrate reset)..."
npx prisma migrate reset --force

echo "→ Running seed..."
npm run seed

echo "✓ Seed refresh complete."
