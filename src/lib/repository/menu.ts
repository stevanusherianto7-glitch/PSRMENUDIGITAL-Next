import { apiFetch, isBackendConfigured } from '../api'
import type { MenuItem } from '../../app/types'

/**
 * Repository menu — data-layer ke Laravel (/api/v1/menus) dengan fallback localStorage.
 * Menggantikan supabase.from('menu_items').
 */
const LS_KEY = 'local_menu_items'

function readLocal(): MenuItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as MenuItem[]) : []
  } catch {
    return []
  }
}
function writeLocal(items: MenuItem[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export async function fetchMenu(): Promise<MenuItem[]> {
  if (!isBackendConfigured()) return readLocal()
  const res = await apiFetch<{ data: MenuItem[] }>('GET', '/api/v1/menus')
  if (!res.ok) return readLocal()
  return Array.isArray(res.data) ? res.data : (res.data as { data: MenuItem[] }).data ?? []
}

export async function saveMenu(items: MenuItem[]): Promise<void> {
  if (!isBackendConfigured()) {
    writeLocal(items)
    return
  }
  // Bulk sync: PUT /api/v1/menus/sync
  const res = await apiFetch('PUT', '/api/v1/menus/sync', { items })
  if (!res.ok) writeLocal(items) // fallback lokal bila backend gagal
}

export async function createMenuItem(item: MenuItem): Promise<MenuItem> {
  if (!isBackendConfigured()) {
    const list = readLocal()
    list.push(item)
    writeLocal(list)
    return item
  }
  const res = await apiFetch<MenuItem>('POST', '/api/v1/menus', item)
  if (!res.ok) throw new Error(`Create menu gagal: HTTP ${res.status}`)
  return res.data
}

export async function deleteMenuItem(id: string): Promise<void> {
  if (!isBackendConfigured()) {
    writeLocal(readLocal().filter((m) => m.id !== id))
    return
  }
  const res = await apiFetch('DELETE', `/api/v1/menus/${id}`)
  if (!res.ok) throw new Error(`Delete menu gagal: HTTP ${res.status}`)
}
