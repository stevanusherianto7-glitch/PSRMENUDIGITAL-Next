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
 *
 * Testability: fungsi inti `buildCloudinaryUrl` & `resolveMenuImage` murni (tanpa import.meta.env)
 * sehingga bisa diuji di Jest (jsdom tidak punya import.meta.env). `menuImageUrl` membungkusnya
 * dengan cloud name dari env (fallback 'dwdaydzsh').
 */

export const DEFAULT_CLOUD_NAME = 'dwdaydzsh'

function resolveCloudName(): string {
  // Hindari literal `import.meta` (gagal di babel-jest CJS).
  // Akses lewat globalThis agar aman di Jest & Vite.
  const meta = (globalThis as unknown as { import?: { meta?: { env?: Record<string, string> } } }).import?.meta
  const env = meta?.env?.VITE_CLOUDINARY_CLOUD_NAME
  return env || DEFAULT_CLOUD_NAME
}

export const CLOUDINARY_CLOUD_NAME = resolveCloudName()

export const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`

/** SVG placeholder lokal bila foto kosong/gagal. */
export const MENU_IMAGE_FALLBACK =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iUG9wcGlucywgQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiPkZvdG8gTWVudTwvdGV4dD48L3N2Zz4='

export interface MenuImageOptions {
  w?: number
  h?: number
  q?: number | 'auto'
  fit?: 'cover' | 'fill' | 'contain'
  cloudName?: string
}

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith('data:')
}

function isCloudinaryPublicId(value: string): boolean {
  // public_id Cloudinary: boleh mengandung "/" sebagai folder separator (menu/xxx),
  // tapi TIDAK boleh: diawali "/" atau "./" (path relatif dari root), mengandung "://",
  // atau mengandung kata "supabase".
  if (value.startsWith('/') || value.startsWith('./') || value.includes('://')) return false
  return !/supabase/i.test(value)
}

/**
 * Bangun URL Cloudinary dari public_id (fungsi murni, testable).
 */
export function buildCloudinaryUrl(
  publicId: string,
  opts: MenuImageOptions = {},
): string {
  const { w = 600, h = 400, q = 'auto', fit = 'cover', cloudName = DEFAULT_CLOUD_NAME } = opts
  const crop = fit === 'fill' ? 'fill' : 'c_fill'
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${w},h_${h},${crop},q_${q},f_auto/${publicId}`
}

/**
 * Resolve URL foto menu (fungsi murni, testable):
 * - URL absolut / data: → kembalikan apa adanya (legacy Supabase / inline).
 * - public_id Cloudinary → bangun URL transform on-the-fly.
 * - kosong / null → fallback SVG.
 */
export function resolveMenuImage(
  image: string | null | undefined,
  opts: MenuImageOptions = {},
): string {
  if (!image || !image.trim()) return MENU_IMAGE_FALLBACK
  if (isAbsoluteUrl(image)) return image
  if (isCloudinaryPublicId(image)) return buildCloudinaryUrl(image, opts)
  // Unknown format → anggap path relatif/legacy, kembalikan utuh agar tidak break.
  return image
}

/**
 * Public API: resolve dengan cloud name dari env (fallback default).
 */
export function menuImageUrl(
  image: string | null | undefined,
  opts: MenuImageOptions = {},
): string {
  return resolveMenuImage(image, { ...opts, cloudName: CLOUDINARY_CLOUD_NAME })
}
