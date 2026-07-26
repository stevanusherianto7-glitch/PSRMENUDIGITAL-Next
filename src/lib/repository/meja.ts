import { apiFetch, isBackendConfigured } from '../api'

export interface MejaRow {
  id: string
  seat?: number
  status?: string
  pax?: number | null
  total?: number | null
  duration?: number | null
  orders?: any
  occupied?: boolean
}

export async function fetchMeja(): Promise<MejaRow[]> {
  if (isBackendConfigured()) {
    const res = await apiFetch<{ data: MejaRow[] }>('GET', '/api/v1/meja')
    if (res.ok) return (res.data as any).data ?? []
  }
  try {
    const raw = localStorage.getItem('local_meja')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function updateMejaStatus(id: string, payload: Partial<MejaRow>): Promise<void> {
  if (isBackendConfigured()) {
    await apiFetch('PUT', `/api/v1/meja/${id}`, payload)
    return
  }
  const local: MejaRow[] = JSON.parse(localStorage.getItem('local_meja') || '[]')
  const idx = local.findIndex(m => m.id === id)
  if (idx >= 0) { local[idx] = { ...local[idx], ...payload }; localStorage.setItem('local_meja', JSON.stringify(local)) }
}

export async function seedMeja(rows: MejaRow[]): Promise<void> {
  if (isBackendConfigured()) {
    await apiFetch('POST', '/api/v1/meja/seed', { rows })
    return
  }
  localStorage.setItem('local_meja', JSON.stringify(rows))
}
