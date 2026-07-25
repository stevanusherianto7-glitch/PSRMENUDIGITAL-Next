# Typography & Visual System — PSRMENUDIGITAL (Kedai Elvera 57)

> Dokumen panduan ini **diseragamkan** dari prinsip `Restoku_Refactored/Restoku-Next/docs/TYPOGRAPHY.md`,
> namun **token warna & font disesuaikan dengan brand asli Kedai Elvera 57** yang sudah dipakai UI saat ini
> (lihat `src/styles/globals.css`, `default_shadcn_theme.css`, `src/app/constants.ts`).
> **Tidak ada CSS / layout yang diubah** — ini hanya panduan penulisan kode ke depan.

---

## 1. Font Stack

UI saat ini menggunakan **Poppins** sebagai font utama (lihat `.font-poppins` di `globals.css`).
Pertahankan Poppins sebagai standar brand; gunakan system fallback agar aman jika font belum dimuat.

```css
font-family:
  "Poppins",              /* Brand font utama (Kedai Elvera 57) */
  -apple-system,          /* SF Pro — iOS / macOS */
  "Segoe UI",             /* Segoe UI — Windows */
  "Roboto",               /* Roboto — Android */
  "Helvetica Neue",
  Arial,
  sans-serif;
```

> Catatan: Jika suatu komponen butuh Inter (misal tabel data padat), gunakan Inter sebagai
> exception eksplisit, bukan mengganti seluruh aplikasi. Konsistensi font = identitas brand.

---

## 2. Type Scale (kelipatan 4px)

Semua ukuran berbasis kelipatan **4px** agar rhythm vertikal konsisten. Weight & line-height per level.

| Level | Name | Size | Line Height | Weight | Use Case |
|-------|------|------|-------------|--------|----------|
| 1 | Display | 32px | 40px | Bold (700) | Judul utama / banner / hero |
| 2 | Heading 1 | 24px | 32px | Bold (700) | Judul halaman |
| 3 | Heading 2 | 20px | 28px | SemiBold (600) | Judul bagian / card |
| 4 | Subtitle | 16px | 24px | Medium (500) | Teks penjelas utama |
| 5 | Body | 14px | 20px | Regular (400) | Teks konten utama |
| 6 | Caption | 12px | 16px | Medium (500) / Bold (700) | Keterangan / tombol / badge |

### CSS Variables (tambahkan ke tema, jangan ubah nilai existing)

```css
:root {
  --text-display-size: 32px;  --text-display-leading: 40px; --text-display-weight: 700;
  --text-h1-size: 24px;       --text-h1-leading: 32px;      --text-h1-weight: 700;
  --text-h2-size: 20px;       --text-h2-leading: 28px;      --text-h2-weight: 600;
  --text-subtitle-size: 16px; --text-subtitle-leading: 24px; --text-subtitle-weight: 500;
  --text-body-size: 14px;     --text-body-leading: 20px;    --text-body-weight: 400;
  --text-caption-size: 12px;  --text-caption-leading: 16px; --text-caption-weight: 500;
  --text-button-weight: 700;
}
```

### Tailwind Class Helpers (opsional, di `theme` config)

```js
fontSize: {
  display: ["32px", { lineHeight: "40px", fontWeight: "700" }],
  h1:      ["24px", { lineHeight: "32px", fontWeight: "700" }],
  h2:      ["20px", { lineHeight: "28px", fontWeight: "600" }],
  subtitle:["16px", { lineHeight: "24px", fontWeight: "500" }],
  body:    ["14px", { lineHeight: "20px", fontWeight: "400" }],
  caption: ["12px", { lineHeight: "16px", fontWeight: "500" }],
  button:  ["12px", { lineHeight: "16px", fontWeight: "700" }],
}
```

### Contoh Penggunaan

```tsx
<h1 className="text-display">Kedai Elvera 57 — POS & Restaurant</h1>
<h2 className="text-h1">Dashboard</h2>
<h3 className="text-h2">Menu Hari Ini</h3>
<p  className="text-subtitle text-secondary">Kelola restoran Anda dengan mudah</p>
<p  className="text-body">Nasi Goreng Spesial adalah menu favorit pelanggan</p>
<span className="text-caption text-tertiary">Diperbarui 2 menit yang lalu</span>
<button className="text-button text-inverse bg-primary px-4 py-2 rounded-lg">Tambah ke Keranjang</button>
```

---

## 3. Spacing (kelipatan 4px)

Gunakan spacing konsisten agar tidak ada layout shift.

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Gap minimal antar elemen |
| space-2 | 8px | Padding icon, gap inline |
| space-3 | 12px | Padding card kecil |
| space-4 | 16px | Padding card, margin section |
| space-5 | 20px | Margin antar section |
| space-6 | 24px | Margin page section |
| space-8 | 32px | Margin antar page section besar |

---

## 4. Brand Color Tokens (Kedai Elvera 57 — dari CSS existing)

Token ini **diambil dari `src/styles/globals.css` & `default_shadcn_theme.css`** yang sudah live.
Jangan ubah nilai yang sedang dipakai UI; dokumentasikan saja agar penulisan kode baru konsisten.

### Primary / Brand (gradien & aksen warna-warni Elvera)

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-purple` | `#880088` | Aksen ungu brand |
| `--brand-magenta` | `#aa2068` | Aksen magenta |
| `--brand-red` | `#cc3f47` | Aksen merah-coral |
| `--brand-orange` | `#de6f3d` | Aksen oranye (hangat) |
| `--brand-gold` | `#f09f33` | Aksen emas / highlight promo |
| `--brand-yellow` | `#ffdb3b` | Aksen kuning cerah (badge/CTA) |
| `--brand-pink` | `#fe53bb` | Aksen pink (accent khusus) |

> Palet di atas membentuk gradien brand khas Elvera (ungu → magenta → merah → oranye → emas).
> Hindari warna dasar murni (merah/hijau/biru 100%) untuk elemen utama — selalu lewat palet brand.

### Status / Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--status-success` | `#059669` (atau `#22c55e`) | Sukses / order ready |
| `--status-warning` | `#f59e0b` | Peringatan / stok menipis |
| `--status-error` | `#dc2626` / `#d4183d` | Error / order cancelled |
| `--status-info` | `#3b82f6` | Informasi |

### Shift Badges (`src/app/constants.ts`)

| Shift | From → To | Text |
|-------|-----------|------|
| PAGI | `from-blue-500` → `to-blue-600` | `text-white` (code P) |
| MIDDLE | `from-emerald-500` → `to-emerald-600` | `text-white` (code M) |
| LIBUR | `from-rose-500` → `to-rose-600` | `text-white` (code O) |

### Base / Surface (shadcn theme)

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `#ffffff` | `oklch(0.145 0 0)` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--primary` | `#030213` | `oklch(0.985 0 0)` |
| `--muted-foreground` | `#717182` | `oklch(0.708 0 0)` |
| `--destructive` | `#d4183d` | `oklch(0.396 0.141 25.723)` |
| `--border` | `rgba(0,0,0,0.1)` | `oklch(0.269 0 0)` |
| `--radius` | `0.625rem` | `0.625rem` |

---

## 5. WCAG Color Contrast

Semua teks harus memenuhi rasio kontras minimum:

| Element | Min Ratio | Standard |
|---------|-----------|----------|
| Body text (< 18px) | **4.5:1** | WCAG AA |
| Large text (≥ 18px bold / ≥ 24px) | **3:1** | WCAG AA Large |
| UI components / icons | **3:1** | WCAG AA Non-text |

### Text Colors (rekomendasi)

| Token | Hex | On White | On Dark | Usage |
|-------|-----|----------|---------|-------|
| `text-primary` | `#111827` | 16.75:1 ✅ | — | Judul, body utama |
| `text-secondary` | `#4B5563` | 7.45:1 ✅ | — | Subtitle, deskripsi |
| `text-tertiary` | `#6B7280` | 5.04:1 ✅ | — | Caption, label |
| `text-inverse` | `#F9FAFB` | — | 17.33:1 ✅ | Teks di dark bg |
| `text-success` | `#059669` | 4.63:1 ✅ | — | Status sukses |
| `text-error` | `#DC2626` | 4.63:1 ✅ | — | Error messages |

> Saat menulis teks di atas gradien brand (ungu/magenta), **selalu gunakan `text-white`**
> karena kontras brand gelap vs putih memenuhi 4.5:1. Jangan taruh teks gelap di atas brand gelap.

---

## 6. Responsive Adjustments

| Level | Mobile (< 640px) | Tablet (640–1024px) | Desktop (> 1024px) |
|-------|------------------|---------------------|--------------------|
| Display | 28px / 36px | 32px / 40px | 32px / 40px |
| H1 | 22px / 28px | 24px / 32px | 24px / 32px |
| H2 | 18px / 24px | 20px / 28px | 20px / 28px |

POS utama = mobile-first (320px–768px). Dashboard = tablet/desktop.

---

## 7. Accessibility Checklist

- [ ] Semua teks body memenuhi kontras **4.5:1** minimum
- [ ] Large text (≥ 18px bold / ≥ 24px) memenuhi kontras **3:1**
- [ ] Font size tidak lebih kecil dari **12px**
- [ ] Line height minimal **1.4×** font size untuk body text
- [ ] Touch target minimal **44×44px** untuk semua interactive elements
- [ ] Text dapat di-scale hingga **200%** tanpa kehilangan konten
- [ ] Jam minimal **Cumulative Layout Shift (CLS) < 0.1** — jangan ubah-ubah ukuran elemen saat render
- [ ] Gunakan **Skeleton Loading** (bukan spinner) untuk tabel, detail menu, dashboard saat data load
- [ ] Animasi micro (hover, transisi) halus; hindari layout shift saat animasi

---

## 8. Do & Don't (Brand Elvera)

✅ **DO**
- Pakai Poppins sebagai font utama.
- Pakai palet brand (ungu→magenta→merah→oranye→emas) untuk aksen & CTA.
- Gradien brand untuk hero / header penting.
- Status order pakai semantic color (success/warning/error).
- Spacing kelipatan 4px.

❌ **DON'T**
- Jangan ganti font jadi Inter/Outfit secara massal (rusak identitas brand).
- Jangan pakai warna dasar murni (red/green/blue 100%) untuk elemen utama.
- Jangan taruh teks gelap di atas gradien brand gelap.
- Jangan ubah nilai `--primary`/`--radius` di `default_shadcn_theme.css` yang sedang live tanpa izin Senior Architect (lihat komentar di `globals.css`).
- Jangan buat font < 12px atau touch target < 44px.

---

*Sumber: prinsip `Restoku_Refactored/Restoku-Next/docs/TYPOGRAPHY.md` + token nyata `PSRMENUDIGITAL_CLONE/src/styles/*` & `default_shadcn_theme.css`.*
