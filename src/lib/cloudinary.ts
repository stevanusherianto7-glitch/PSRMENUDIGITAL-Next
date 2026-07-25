/**
 * Cloudinary helper untuk foto menu (PSRMENUDIGITAL).
 *
 * Arah arsitektur: foto menu TIDAK lagi disimpan di Supabase Storage.
 * DB menyimpan `public_id` (bukan URL penuh); URL dibangun on-the-fly di sini.
 *
 * Kontrak (docs/ARCHITECTURE.md §4):
 *  - item.image bisa berupa:
 *      (a) URL penuh (legacy Supabase Storage / http(s) / data:) → langsung dipakai (backward-compat)
 *      (b) Cloudinary public_id (mis. "Ayam_Goreng_Penyet_Semarang_qsbpul") → bangun URL transform
 *  - Cloud name: dwdaydzsh (publik, aman di client). API key/secret HANYA di server Laravel.
 *  - Bila kosong / gagal → kembalikan MENU_IMAGE_FALLBACK (SVG lokal).
 *
 * Tidak memutus UI yang ada: URL Supabase tetap lewat utuh.
 */

export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dwdaydzsh'

export const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`

/** SVG placeholder lokal bila foto kosong/gagal. */
export const MENU_IMAGE_FALLBACK =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iUG9wcGludiwgQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiPkZvdG8gTWVudTwvdGV4dD48L3N2Zz4='

export interface MenuImageOptions {
  w?: number
  h?: number
  q?: number | 'auto'
  fit?: 'cover' | 'fill' | 'contain'
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith('data:')
}

function isCloudinaryPublicId(value: string): boolean {
  // public_id: alphanumeric, underscore, strip, titik — tidak mengandung "://" atau "supabase"
  return !isAbsoluteUrl(value) && !/supabase/i.test(value)
}

/**
 * Bangun URL foto menu.
 * - URL absolut / data: → kembalikan apa adanya (legacy Supabase / inline).
 * - public_id Cloudinary → bangun URL transform on-the-fly.
 * - kosong / null → fallback SVG.
 */
export function menuImageUrl(
  image: string | null | undefined,
  opts: MenuImageOptions = {},
): string {
  if (!image || !image.trim()) return MENU_IMAGE_FALLBACK

  const { w = 600, h = 400, q = 'auto', fit = 'cover' } = opts

  if (isAbsoluteUrl(image)) return image
  if (isCloudinaryPublicId(image)) {
    const crop = fit === 'fill' ? 'fill' : 'c_fill'
    return `${CLOUDINARY_BASE}/w_${w},h_${h},${crop},q_${q},f_auto/${image}`
  }
  // Unknown format → anggap path relatif/legacy, kembalikan utuh agar tidak break.
  return image
}
