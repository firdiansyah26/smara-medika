#!/usr/bin/env bash
# Setup database SmaraMedika: buat DB (jika belum ada) → migrasi → seed.
# Pakai: npm run db:setup
set -euo pipefail

# Muat DATABASE_URL dari .env (jika ada) tanpa meng-export komentar.
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

DB_NAME="${DB_NAME:-smaramedika}"

echo "▶ Memastikan database '${DB_NAME}' ada…"
if command -v createdb >/dev/null 2>&1; then
  createdb "${DB_NAME}" 2>/dev/null && echo "  ✓ database dibuat" || echo "  • database sudah ada (lewati)"
else
  echo "  ! 'createdb' tidak ditemukan. Pastikan PostgreSQL terpasang & DATABASE_URL benar."
fi

echo "▶ Menjalankan migrasi…"
npx prisma migrate deploy

echo "▶ Menjalankan seed…"
npx prisma db seed

echo "✅ Database siap."
