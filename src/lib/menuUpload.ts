/**
 * Service upload foto menu ke Cloudinary (via backend Laravel proxy).
 *
 * Frontend TIDAK memegang API secret Cloudinary — semua upload lewat
 * endpoint Laravel `/api/menu/upload` yang memegang CLOUDINARY_URL (server-only).
 *
 * Mode (docs/ARCHITECTURE.md §4):
 *  - real:  POST ke VITE_API_URL + /api/menu/upload (multipart image) -> { public_id }
 *  - mock:  tidak ada backend -> hasilkan public_id lokal deterministik agar
 *           langsung kompatibel dengan menuImageUrl() (render di MenuManagement/Guest/Kasir).
 */

export interface UploadResult {
  public_id: string
  url?: string
}

function isRealMode(apiBase: string | undefined): boolean {
  return !!apiBase && apiBase.trim().length > 0
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'menu'
  )
}

/** Generate public_id lokal (mock mode) — kompatibel dengan Cloudinary naming. */
export function localPublicId(name: string): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `menu/${slugify(name)}_${rand}`
}

/**
 * Upload foto menu.
 * @param file  File gambar dari input
 * @param name  Nama menu (untuk slug public_id di mock mode)
 * @param opts  { apiBase?: string } — bila diisi -> real mode (Laravel proxy)
 */
export async function uploadMenuPhoto(
  file: File,
  name: string,
  opts: { apiBase?: string } = {},
): Promise<UploadResult> {
  const apiBase = opts.apiBase || ''
  if (!isRealMode(apiBase)) {
    // Mock mode: tidak ada backend, hasilkan public_id lokal.
    // (Di dunia nyata, kompresi & upload dilakukan server Laravel.)
    return { public_id: localPublicId(name) }
  }

  const form = new FormData()
  form.append('image', file)
  form.append('name', name)

  const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/menu/upload`, {
    method: 'POST',
    body: form,
    headers: {
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Upload gagal: HTTP ${res.status}`)
  }

  const json = (await res.json()) as { public_id?: string; url?: string }
  if (!json.public_id) {
    throw new Error('Response backend tidak memuat public_id')
  }
  return { public_id: json.public_id, url: json.url }
}
