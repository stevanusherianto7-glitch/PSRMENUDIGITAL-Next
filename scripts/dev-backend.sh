#!/usr/bin/env bash
# Jalankan backend Laravel di port 8080 (cocok VITE_API_URL di frontend .env).
# Pastikan sudah: composer install + cp .env.example .env + php artisan key:generate
set -e
cd "$(dirname "$0")/.."
echo ">>> Migrating (jika perlu)..."
php artisan migrate --force || true
echo ">>> Seeding menu_items..."
php artisan db:seed --force || true
echo ">>> Menjalankan backend di http://localhost:8080 (CTRL+C untuk berhenti)"
php artisan serve --port=8080
