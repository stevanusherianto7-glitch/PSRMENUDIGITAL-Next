import { apiFetch, isBackendConfigured } from '../api'

export interface ShiftRow {
  id?: number
  employee_name: string
  role: string
  schedule?: any
}

export async function fetchShifts(): Promise<ShiftRow[]> {
  if (isBackendConfigured()) {
    const res = await apiFetch<{ data: ShiftRow[] }>('GET', '/api/v1/jadwal-shift')
    if (res.ok) return (res.data as any).data ?? []
  }
  try {
    const raw = localStorage.getItem('local_jadwal_shift')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function saveShift(row: ShiftRow): Promise<ShiftRow> {
  if (isBackendConfigured()) {
    const res = await apiFetch<ShiftRow>('POST', '/api/v1/jadwal-shift', row)
    if (res.ok) return res.data
  }
  const local: ShiftRow[] = JSON.parse(localStorage.getItem('local_jadwal_shift') || '[]')
  const item = { ...row, id: row.id || Date.now() }
  const idx = local.findIndex(l => l.id === item.id)
  if (idx >= 0) local[idx] = item; else local.push(item)
  localStorage.setItem('local_jadwal_shift', JSON.stringify(local))
  return item
}

export async function deleteShift(id: number): Promise<void> {
  if (isBackendConfigured()) {
    await apiFetch('DELETE', `/api/v1/jadwal-shift/${id}`)
    return
  }
  const local: ShiftRow[] = JSON.parse(localStorage.getItem('local_jadwal_shift') || '[]')
  localStorage.setItem('local_jadwal_shift', JSON.stringify(local.filter(l => l.id !== id)))
}
