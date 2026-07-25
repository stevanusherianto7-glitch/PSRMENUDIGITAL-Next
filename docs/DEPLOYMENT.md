# Deployment — PSRMENUDIGITAL (Kedai Elvera 57 POS)

> Panduan deployment **target** untuk PSRMENUDIGITAL setelah transisi ke **Laravel 13 + PostgreSQL + Redis**
> (lihat `docs/ARCHITECTURE.md`). Deployment utama = **VPS sewaan** (bukan Vercel/Forge sebagai platform hosting utama).
> Ini dokumen panduan — **tidak mengubah kode UI**.
>
> Sumber: `Restoku_Refactored/Restoku-Next/docs/DEPLOYMENT-STAGING.md`, `vercel.json` (clone),
> `package.json` (build Vite + Capacitor), `android/` (Capacitor), kebiasaan Restoku (VPS + Cloudinary).

---

## 1. Arsitektur Deployment (Target)

```
                    ┌─────────────────────────────────────────┐
   Tamu (HP)  ─────►│  Buku Menu Digital (PWA / Web)           │
   Staff (HP/Tablet) ─►│  POS / Kasir / Dapur / Waiter (SPA)    │
                    │  build Vite → nginx (VPS) atau CDN      │
                    └───────────────┬─────────────────────────┘
                                    │  HTTPS (VITE_API_URL)
                                    ▼
                    ┌─────────────────────────────────────────┐
                    │  VPS (Ubuntu 22.04+)                      │
                    │  ├─ nginx (reverse proxy, TLS)            │
                    │  ├─ Laravel 13 (PHP 8.2+) + queue worker  │
                    │  ├─ PostgreSQL 15                        │
                    │  ├─ Redis 7 (cache + queue + session)    │
                    │  └─ scheduler (cron: php artisan schedule)│
                    └───────────────┬─────────────────────────┘
                                    │  signed upload / fetch
                                    ▼
                    ┌─────────────────────────────────────────┐
                    │  Cloudinary (foto menu, CDN offload)      │
                    │  cloud name: dwdaydzsh                   │
                    └─────────────────────────────────────────┘
   Android (Capacitor) ─► APK/AAB → Google Play / sideload (internal)
```

> **Vercel (clone saat ini)** hanya untuk web preview. Produksi = **VPS**. Forge boleh dipakai sebagai
> alat provisioning opsional, tapi **bukan wajib** dan bukan platform utama.

---

## 2. Prerequisites (VPS)

| Komponen | Versi | Keterangan |
|----------|-------|------------|
| OS | Ubuntu 22.04 LTS+ | |
| PHP | 8.2+ | ekstensi: pgsql, redis, gd, mbstring, xml, curl, zip |
| Composer | 2.x | |
| PostgreSQL | 15 | `DB_CONNECTION=pgsql` |
| Redis | 7.x | cache/queue/session |
| Node.js | 20+ | build frontend (`npm run build`) |
| nginx | 1.24+ | reverse proxy + TLS |
| Certbot | - | sertifikat HTTPS gratis (Let's Encrypt) |
| Supervisor | - | jalankan `queue:work` + `schedule:work` persisten |

---

## 3. Environment Variables

### 3.1 Backend Laravel (`.env` di VPS — **RAHASIA, gitignored**)

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.elongera.id          # ganti domain produksi

# Database (PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=psrmenu
DB_USERNAME=psrmenu
DB_PASSWORD=<RAHASIA_JANGAN_COMMIT>

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# Sanctum
SANCTUM_STATEFUL_DOMAINS=api.elongera.id,app.elongera.id

# Google OAuth (owner login)
GOOGLE_CLIENT_ID=<dari Google Cloud>
GOOGLE_CLIENT_SECRET=<RAHASIA>
GOOGLE_REDIRECT_URI=https://api.elongera.id/oauth/google/callback

# Cloudinary (SERVER ONLY — secret di sini, bukan di frontend)
CLOUDINARY_URL=cloudinary://<API_KEY>:<API_SECRET>@dwdaydzsh
CLOUDINARY_CLOUD_NAME=dwdaydzsh

# Payment (deferred — Midtrans/Xendit, saat monetisasi)
# MIDTRANS_SERVER_KEY=
# XENDIT_SECRET=
```

> ⚠️ **JANGAN** commit `.env`. `.env` sudah di-gitignore. Secret (DB password, Cloudinary secret,
> Google client secret) **hanya di server**. Frontend tidak boleh mendapat API key/secret Cloudinary.

### 3.2 Frontend (`.env` / `.env.production` — aman di-build, TANPA secret)

```dotenv
# URL API Laravel (VPS)
VITE_API_URL=https://api.elongera.id

# Cloudinary cloud name (PUBLIK — aman di browser)
VITE_CLOUDINARY_CLOUD_NAME=dwdaydzsh

# Mode mock (false di produksi)
VITE_USE_MOCKS=false
```

> Frontend **hanya** butuh `VITE_API_URL` + `VITE_CLOUDINARY_CLOUD_NAME` (publik). Tidak ada API key/secret.

---

## 4. Build & Deploy Frontend (Vite + Capacitor)

### 4.1 Web (SPA → nginx / CDN)

```bash
# di lokal / CI
npm install
npm run lint
npm test                      # Jest unit
npm run build                 # vite build → dist/

# deploy dist/ ke VPS (rsync / scp)
rsync -avz dist/ user@vps:/var/www/psrmenu/frontend/
```

nginx servir `dist/` sebagai static SPA (fallback ke `index.html` untuk route client-side).

### 4.2 Android (Capacitor)

```bash
npx cap sync android
npm run build
npx cap open android          # build APK/AAB di Android Studio
# atau CLI:
cd android && ./gradlew assembleRelease
```

`capacitor.config.ts`: set `server.url` ke `https://app.elongera.id` (VPS) di produksi;
`VITE_API_URL` di-resolve di runtime dari `import.meta.env`.

---

## 5. Deploy Backend (Laravel di VPS)

```bash
# di VPS
git clone <repo> /var/www/psrmenu/backend
cd /var/www/psrmenu/backend
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Database
php artisan migrate --force
php artisan db:seed --force      # seed awal (outlet default, dll)

# Storage link (jika pakai local, tapi foto menu di Cloudinary)
php artisan storage:link

# Queue + Scheduler (Supervisor)
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start psrmenu-worker psrmenu-scheduler
```

### 5.1 Supervisor (`/etc/supervisor/conf.d/psrmenu.conf`)

```ini
[program:psrmenu-worker]
command=php /var/www/psrmenu/backend/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/psrmenu-worker.log

[program:psrmenu-scheduler]
command=php /var/www/psrmenu/backend/artisan schedule:work
autostart=true
autorestart=true
user=www-data
stdout_logfile=/var/log/psrmenu-scheduler.log
```

---

## 6. nginx (Reverse Proxy + TLS)

```nginx
server {
    listen 80;
    server_name api.elongera.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.elongera.id;

    ssl_certificate     /etc/letsencrypt/live/api.elongera.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.elongera.id/privkey.pem;

    # Frontend SPA (static)
    root /var/www/psrmenu/frontend;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }

    # API Laravel
    location /api {
        proxy_pass http://127.0.0.1:9000;   # php-fpm
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> php-fpm listen `127.0.0.1:9000`. Pastikan `trustProxies('*')` di Laravel agar
> `X-Forwarded-Proto` benar (penting untuk redirect/secure cookie & URL absolut foto).

---

## 7. Cloudinary (Foto Menu)

- **Cloud name:** `dwdaydzsh` (publik, di `.env` frontend `VITE_CLOUDINARY_CLOUD_NAME`).
- **Upload:** backend proxy `POST /api/v1/menus/{id}/photo` → Cloudinary server-side
  (pakai `CLOUDINARY_URL` di `.env` server). Frontend **tidak** pegang API key/secret.
- **Folder:** `menu/` (public_id otomatis dapat suffix random, mis. `Ayam_Goreng_..._qsbpul`).
- **Transform on-the-fly:** frontend bangun URL via helper `menuImageUrl(public_id)`
  (`w_/h_/c_fill/q_auto/f_auto`) — tidak perlu simpan banyak ukuran.
- **Fallback:** jika `public_id` kosong/gagal load → SVG placeholder lokal (`MENU_IMAGE_FALLBACK`).
- **Signed URL (multi-tenant):** jika perlu akses terbatas, pakai signed URL dari backend
  (`/api/v1/menus/{id}/photo-url`), bukan menaruh secret di client.

> Lihat `docs/ARCHITECTURE.md` §4 untuk helper URL & kontrak komponen.

---

## 8. Staging vs Production

| Var | Staging | Production |
|-----|---------|-----------|
| `APP_ENV` | `staging` | `production` |
| `APP_DEBUG` | `true` | `false` |
| `VITE_USE_MOCKS` | `false` | `false` |
| `VITE_API_URL` | `https://staging.api.elongera.id` | `https://api.elongera.id` |
| `CLOUDINARY_CLOUD_NAME` | `dwdaydzsh` | `dwdaydzsh` |
| DB | PostgreSQL terpisah (staging) | PostgreSQL produksi |

---

## 9. Rollback & Recovery

- **Frontend:** `rsync` versi `dist/` sebelumnya kembali; atau `git revert` + rebuild.
- **Backend:** `git revert <commit>` + `composer install` + `php artisan migrate:rollback --step`
  (hati-hati data produksi) atau restore snapshot DB VPS.
- **Atomic deploy:** tar `dist/` + tag git; simpan artefak di CI artifact.
- **Secret leak:** jika `.env`/key bocor → **rotate** (Cloudinary API key/secret, Google client secret, DB password) segera, jangan hanya hapus dari repo (sudah gitignored).

---

## 10. Checklist Pre-Launch

- [ ] `APP_DEBUG=false`, `APP_ENV=production`
- [ ] HTTPS (Certbot) aktif di `api.` + `app.`
- [ ] `php artisan migrate --force` sukses
- [ ] Redis jalan (cache/queue/session)
- [ ] Supervisor: `queue:work` + `schedule:work` up
- [ ] `VITE_API_URL` + `VITE_CLOUDINARY_CLOUD_NAME` benar di build frontend
- [ ] Cloudinary `CLOUDINARY_URL` (secret) hanya di server
- [ ] `trustProxies('*')` di Laravel
- [ ] `npm run lint` + `npm test` hijau sebelum build
- [ ] Backup DB terjadwal (pg_dump → offsite)

---

*Sumber: `Restoku_Refactored/Restoku-Next/docs/DEPLOYMENT-STAGING.md`, `vercel.json`, `package.json`, `android/`, docs/ARCHITECTURE.md.*
