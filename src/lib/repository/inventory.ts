import { apiFetch, isBackendConfigured } from '../api'

export interface InventoryRow {
  id?: number | string
  name: string
  qty?: number
  unit?: string
  exp_date?: string | null
  category?: string
  method?: string
  stock?: number
  min_stock?: number
}

export async function fetchInventory(): Promise<InventoryRow[]> {
  if (isBackendConfigured()) {
    const res = await apiFetch<{ data: InventoryRow[] }>('GET', '/api/v1/inventory')
    if (res.ok) return (res.data as any).data ?? []
  }
  try {
    const raw = localStorage.getItem('local_inventory')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function saveInventory(row: InventoryRow): Promise<InventoryRow> {
  if (isBackendConfigured()) {
    if (row.id) {
      const res = await apiFetch<InventoryRow>('PUT', `/api/v1/inventory/${row.id}`, row)
      if (res.ok) return res.data
    }
    const res = await apiFetch<InventoryRow>('POST', '/api/v1/inventory', row)
    if (res.ok) return res.data
  }
  const local: InventoryRow[] = JSON.parse(localStorage.getItem('local_inventory') || '[]')
  const item = { ...row, id: row.id || Date.now() }
  const idx = local.findIndex(l => String(l.id) === String(item.id))
  if (idx >= 0) local[idx] = item; else local.push(item)
  localStorage.setItem('local_inventory', JSON.stringify(local))
  return item
}

export async function deleteInventory(id: number | string): Promise<void> {
  if (isBackendConfigured()) {
    await apiFetch('DELETE', `/api/v1/inventory/${id}`)
    return
  }
  const local: InventoryRow[] = JSON.parse(localStorage.getItem('local_inventory') || '[]')
  localStorage.setItem('local_inventory', JSON.stringify(local.filter(l => String(l.id) !== String(id))))
}

export async function logInventory(inventoryId: number, change: number, note?: string): Promise<void> {
  if (isBackendConfigured()) {
    await apiFetch('POST', '/api/v1/inventory-logs', { inventory_id: inventoryId, change, note })
    return
  }
  // local: no-op (log hanya di backend)
}

export async function fetchInventoryLogs(): Promise<any[]> {
  if (isBackendConfigured()) {
    const res = await apiFetch<{ data: any[] }>('GET', '/api/v1/inventory-logs')
    if (res.ok) return (res.data as any).data ?? []
  }
  return []
}
