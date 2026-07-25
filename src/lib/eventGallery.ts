/**
 * Service upload foto EVENT GALLERY ke Cloudinary (via backend Laravel proxy).
 * Mirip menuUpload.ts tapi endpoint berbeda (/api/event-gallery/photo).
 *
 * Mock-mode (VITE_API_URL kosong): public_id lokal `events/<slug>_<rand>`.
 * Real-mode: POST VITE_API_URL + /api/event-gallery/photo -> { public_id }.
 */
export interface UploadResult {
  public_id: string
  url?: string
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'event'
  )
}

export function localEventPublicId(name: string): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `events/${slugify(name)}_${rand}`
}

export async function uploadEventPhoto(
  file: File,
  name: string,
  opts: { apiBase?: string } = {},
): Promise<UploadResult> {
  const apiBase = opts.apiBase || ''
  if (!apiBase || apiBase.trim().length === 0) {
    return { public_id: localEventPublicId(name) }
  }
  const form = new FormData()
  form.append('image', file)
  form.append('title', name)
  const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/event-gallery/photo`, {
    method: 'POST',
    body: form,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Upload event gagal: HTTP ${res.status}`)
  const json = (await res.json()) as { public_id?: string; url?: string }
  if (!json.public_id) throw new Error('Response backend tidak memuat public_id')
  return { public_id: json.public_id, url: json.url }
}
