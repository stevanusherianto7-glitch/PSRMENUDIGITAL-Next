#!/usr/bin/env bash
# Jalankan frontend Vite dev server.
# Pastikan .env frontend: VITE_API_URL=http://localhost:8080 (sama dengan dev-backend.sh)
set -e
cd "$(dirname "$0")/.."
echo ">>> Menjalankan frontend Vite di http://localhost:5173"
npm run dev
