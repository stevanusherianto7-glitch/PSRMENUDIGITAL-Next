import { apiFetch, isBackendConfigured } from '../api'

export interface ReservationRow {
  id?: number | string
  name: string
  date?: string
  party?: number
  status?: string
  note?: string
}

export async function fetchReservations(): Promise<ReservationRow[]> {
  if (isBackendConfigured()) {
    const res = await apiFetch<{ data: ReservationRow[] }>('GET', '/api/v1/reservations')
    if (res.ok) return (res.data as any).data ?? []
  }
  try {
    const raw = localStorage.getItem('local_reservations')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function saveReservation(row: ReservationRow): Promise<ReservationRow> {
  if (isBackendConfigured()) {
    if (row.id) {
      const res = await apiFetch<ReservationRow>('PUT', `/api/v1/reservations/${row.id}`, row)
      if (res.ok) return res.data
    }
    const res = await apiFetch<ReservationRow>('POST', '/api/v1/reservations', row)
    if (res.ok) return res.data
  }
  const local: ReservationRow[] = JSON.parse(localStorage.getItem('local_reservations') || '[]')
  const item = { ...row, id: row.id || Date.now() }
  const idx = local.findIndex(l => String(l.id) === String(item.id))
  if (idx >= 0) local[idx] = item; else local.push(item)
  localStorage.setItem('local_reservations', JSON.stringify(local))
  return item
}

export async function deleteReservation(id: number | string): Promise<void> {
  if (isBackendConfigured()) {
    await apiFetch('DELETE', `/api/v1/reservations/${id}`)
    return
  }
  const local: ReservationRow[] = JSON.parse(localStorage.getItem('local_reservations') || '[]')
  localStorage.setItem('local_reservations', JSON.stringify(local.filter(l => String(l.id) !== String(id))))
}
