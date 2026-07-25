import { apiFetch, isBackendConfigured } from '../api'

export interface EventPhoto {
  id: string
  image: string
  title: string
  date: string
  category: string
  description: string
}

/**
 * Repository event-gallery — data-layer ke Laravel (/api/v1/event-gallery) dgn fallback localStorage.
 * Menggantikan supabase.from('event_gallery').
 */
const LS_KEY = 'local_event_gallery'

function readLocal(): EventPhoto[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as EventPhoto[]) : []
  } catch {
    return []
  }
}
function writeLocal(items: EventPhoto[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export async function fetchEvents(): Promise<EventPhoto[]> {
  if (!isBackendConfigured()) return readLocal()
  const res = await apiFetch<{ data: EventPhoto[] }>('GET', '/api/v1/event-gallery')
  if (!res.ok) return readLocal()
  return Array.isArray(res.data) ? res.data : (res.data as { data: EventPhoto[] }).data ?? []
}

export async function saveEvent(photo: EventPhoto): Promise<EventPhoto> {
  if (!isBackendConfigured()) {
    const list = readLocal()
    const idx = list.findIndex((p) => p.id === photo.id)
    if (idx >= 0) list[idx] = photo
    else list.push(photo)
    writeLocal(list)
    return photo
  }
  const res = await apiFetch<EventPhoto>('POST', '/api/v1/event-gallery', photo)
  if (!res.ok) throw new Error(`Save event gagal: HTTP ${res.status}`)
  return res.data
}

export async function deleteEvent(id: string): Promise<void> {
  if (!isBackendConfigured()) {
    writeLocal(readLocal().filter((p) => p.id !== id))
    return
  }
  const res = await apiFetch('DELETE', `/api/v1/event-gallery/${id}`)
  if (!res.ok) throw new Error(`Delete event gagal: HTTP ${res.status}`)
}
