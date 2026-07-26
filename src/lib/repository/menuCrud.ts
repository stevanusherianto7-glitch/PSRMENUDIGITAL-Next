import { apiFetch, isBackendConfigured } from '../api'

export interface MenuItemRow {
  id?: number | string
  name: string
  price: number
  category: string
  description?: string
  image?: string
  available?: boolean
}

export async function fetchMenuItems(): Promise<MenuItemRow[]> {
  if (isBackendConfigured()) {
    const res = await apiFetch<{ data: MenuItemRow[] }>('GET', '/api/v1/menu-items')
    if (res.ok) return (res.data as any).data ?? []
  }
  try {
    const raw = localStorage.getItem('local_menu_items')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function upsertMenuItem(row: MenuItemRow): Promise<MenuItemRow> {
  if (isBackendConfigured()) {
    if (row.id) {
      const res = await apiFetch<MenuItemRow>('PUT', `/api/v1/menu-items/${row.id}`, row)
      if (res.ok) return res.data
    }
    const res = await apiFetch<MenuItemRow>('POST', '/api/v1/menu-items', row)
    if (res.ok) return res.data
  }
  const local: MenuItemRow[] = JSON.parse(localStorage.getItem('local_menu_items') || '[]')
  const item = { ...row, id: row.id || Date.now() }
  const idx = local.findIndex(l => String(l.id) === String(item.id))
  if (idx >= 0) local[idx] = item; else local.push(item)
  localStorage.setItem('local_menu_items', JSON.stringify(local))
  return item
}

export async function deleteMenuItem(id: number | string): Promise<void> {
  if (isBackendConfigured()) {
    await apiFetch('DELETE', `/api/v1/menu-items/${id}`)
    return
  }
  const local: MenuItemRow[] = JSON.parse(localStorage.getItem('local_menu_items') || '[]')
  localStorage.setItem('local_menu_items', JSON.stringify(local.filter(l => String(l.id) !== String(id))))
}
