import { apiFetch, isBackendConfigured } from '../api'

export interface AssetRow {
  id?: number
  name: string
  category?: string
  quantity: number
  condition?: string
}

export async function fetchAssets(): Promise<AssetRow[]> {
  if (isBackendConfigured()) {
    const res = await apiFetch<{ data: AssetRow[] }>('GET', '/api/v1/assets')
    if (res.ok) return (res.data as any).data ?? []
  }
  try {
    const raw = localStorage.getItem('local_assets')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function saveAsset(row: AssetRow): Promise<AssetRow> {
  if (isBackendConfigured()) {
    const res = await apiFetch<AssetRow>('POST', '/api/v1/assets', row)
    if (res.ok) return res.data
  }
  const local: AssetRow[] = JSON.parse(localStorage.getItem('local_assets') || '[]')
  const item = { ...row, id: row.id || Date.now() }
  const idx = local.findIndex(l => l.id === item.id)
  if (idx >= 0) local[idx] = item; else local.push(item)
  localStorage.setItem('local_assets', JSON.stringify(local))
  return item
}

export async function deleteAsset(id: number): Promise<void> {
  if (isBackendConfigured()) {
    await apiFetch('DELETE', `/api/v1/assets/${id}`)
    return
  }
  const local: AssetRow[] = JSON.parse(localStorage.getItem('local_assets') || '[]')
  localStorage.setItem('local_assets', JSON.stringify(local.filter(l => l.id !== id)))
}
