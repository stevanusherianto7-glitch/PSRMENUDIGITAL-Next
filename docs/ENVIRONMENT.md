# Environment Variables — PSRMENUDIGITAL (Kedai Elvera 57 POS)

> Ringkasan variabel environment yang dipakai repo ini (fakta dari `.env.example`, `.env`, `src/`).
> Dokumen ini memetakan variabel **Supabase saat ini** dan **Laravel target** (lihat `docs/ARCHITECTURE.md`).
> **Tidak mengubah kode UI** — hanya dokumentasi.
>
> Aturan: `.env` sudah di-gitignore. **Jangan commit secret.** Frontend hanya boleh memegang variabel
> berawalan `VITE_` yang aman di-build (publik). Secret backend (DB password, Cloudinary secret, Google
> client secret) **hanya di server**.

---

## 1. Frontend (`VITE_*`) — aman di-build

| Variabel | Status | Dipakai di | Keterangan |
|----------|--------|-----------|------------|
| `VITE_API_URL` | **Target** (Laravel) | `src/lib/`, fetch client | Base URL REST API Laravel. Default `http://localhost:8080`. |
| `VITE_API_USERNAME` | Legacy (local) | `src/lib/supabase.ts` | Username DB lokal (legacy, akan diganti token). |
| `VITE_API_PASSWORD` | Legacy (local) | `src/lib/supabase.ts` | Password DB lokal (legacy, **rahasia**, akan diganti token). |
| `VITE_API_DB` | Legacy (local) | `src/lib/supabase.ts` | Nama DB lokal (legacy). |
| `VITE_SUPABASE_URL` | Clone saat ini | `src/lib/supabase.ts` | URL proyek Supabase. **Akan dicabut** pasca-migrasi. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clone saat ini | `src/lib/supabase.ts` | Publishable key (aman di client, tapi akan diganti `VITE_API_URL`). |
| `VITE_GUEST_BASE_URL` | Clone saat ini | QR/sticker tamu | Base URL buku menu digital tamu (`/menu/:tableId`). |
| `VITE_CLOUDINARY_CLOUD_NAME` | **Target** | helper `menuImageUrl` | Cloud name Cloudinary (publik). Default `dwdaydzsh`. |
| `VITE_USE_MOCKS` | Opsional | test/CI | `true` untuk jalan tanpa backend (mock). Default `false`. |

---

## 2. Backend Laravel (`.env` server — RAHASIA, gitignored)

> Hanya ada di VPS, tidak di frontend. Lihat `docs/DEPLOYMENT.md` §3.1.

| Variabel | Keterangan |
|----------|------------|
| `APP_ENV` / `APP_DEBUG` | `production`/`false` di produksi |
| `APP_URL` | `https://api.elongera.id` |
| `DB_CONNECTION` | `pgsql` |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` | PostgreSQL (127.0.0.1:5432) |
| `DB_USERNAME` / `DB_PASSWORD` | **RAHASIA** |
| `REDIS_HOST` / `REDIS_PORT` | `127.0.0.1:6379` |
| `CACHE_DRIVER` / `QUEUE_CONNECTION` / `SESSION_DRIVER` | `redis` |
| `SANCTUM_STATEFUL_DOMAINS` | `api.elongera.id,app.elongera.id` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth owner — **RAHASIA** |
| `GOOGLE_REDIRECT_URI` | `https://api.elongera.id/oauth/google/callback` |
| `CLOUDINARY_URL` | `cloudinary://<key>:<secret>@dwdaydzsh` — **RAHASIA** |
| `CLOUDINARY_CLOUD_NAME` | `dwdaydzsh` (publik, duplikat untuk kenyamanan) |

---

## 3. Contoh `.env` (Frontend — aman)

```dotenv
# Target (Laravel)
VITE_API_URL=http://localhost:8080
VITE_CLOUDINARY_CLOUD_NAME=dwdaydzsh

# Guest menu QR
VITE_GUEST_BASE_URL=http://localhost:5173

# Supabase (clone saat ini — akan dicabut)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx

# Local DB legacy (akan diganti token)
VITE_API_USERNAME=postgres
VITE_API_PASSWORD=localpass
VITE_API_DB=psrmenu

# Testing
VITE_USE_MOCKS=false
```

> ⚠️ `VITE_API_PASSWORD` di atas adalah **legacy local** (bukan produksi). Di produksi, autentikasi
> pakai **token Sanctum** (`Authorization: Bearer`), bukan password DB langsung. Jangan pakai
> `VITE_API_PASSWORD` di produksi.

---

## 4. Mapping Supabase → Laravel (env)

| Supabase (saat ini) | Laravel (target) |
|---------------------|------------------|
| `VITE_SUPABASE_URL` | `VITE_API_URL` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | — (tidak perlu; token via login) |
| `src/lib/supabase.ts` | HTTP client ke `VITE_API_URL` |
| `VITE_GUEST_BASE_URL` | tetap (`VITE_GUEST_BASE_URL`) untuk QR tamu |
| Storage foto | `VITE_CLOUDINARY_CLOUD_NAME` + helper `menuImageUrl` |

---

## 5. Catatan Keamanan

- `[REDACTED]` — semua nilai rahasia di dokumen ini disensor. Jangan pernah taruh nilai asli di `.md`.
- Secret backend (`DB_PASSWORD`, `CLOUDINARY_URL`, Google secret) **hanya di server** `.env`.
- Frontend build hanya meng-embed `VITE_*` (publik). Jika butuh secret di client, itu red flag.
- `.env` sudah di-gitignore (`grep -n ".env" .gitignore`). Verifikasi sebelum commit.

---

*Sumber: `.env.example`, `.env` (redacted), `src/lib/supabase.ts`, `docs/ARCHITECTURE.md` §3, `docs/DEPLOYMENT.md` §3.*
