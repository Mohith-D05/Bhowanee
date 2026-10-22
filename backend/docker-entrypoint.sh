#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL database to be reachable..."
until npx prisma db push --skip-generate; do
  echo "Database is unavailable - sleeping 2s..."
  sleep 2
done

echo "🌱 Running database seeds..."
npm run prisma:seed || echo "Seed skipped or already applied."

echo "🚀 Starting NestJS production server..."
if [ -f "dist/main.js" ]; then
  exec node dist/main.js
elif [ -f "dist/src/main.js" ]; then
  exec node dist/src/main.js
else
  exec npm run start:prod
fi
