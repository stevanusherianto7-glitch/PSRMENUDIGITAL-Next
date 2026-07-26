import { apiFetch, isBackendConfigured } from '../api'

export interface RecipeRow {
  id?: number
  name: string
  price: number
  unit?: string
}

export async function fetchRecipes(): Promise<RecipeRow[]> {
  if (isBackendConfigured()) {
    const res = await apiFetch<{ data: RecipeRow[] }>('GET', '/api/v1/bahan-resep')
    if (res.ok) return (res.data as any).data ?? []
  }
  try {
    const raw = localStorage.getItem('local_bahan_resep')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function saveRecipe(row: RecipeRow): Promise<RecipeRow> {
  if (isBackendConfigured()) {
    const res = await apiFetch<RecipeRow>('POST', '/api/v1/bahan-resep', row)
    if (res.ok) return res.data
  }
  const local: RecipeRow[] = JSON.parse(localStorage.getItem('local_bahan_resep') || '[]')
  const item = { ...row, id: row.id || Date.now() }
  const idx = local.findIndex(l => l.id === item.id)
  if (idx >= 0) local[idx] = item; else local.push(item)
  localStorage.setItem('local_bahan_resep', JSON.stringify(local))
  return item
}

export async function deleteRecipe(id: number): Promise<void> {
  if (isBackendConfigured()) {
    await apiFetch('DELETE', `/api/v1/bahan-resep/${id}`)
    return
  }
  const local: RecipeRow[] = JSON.parse(localStorage.getItem('local_bahan_resep') || '[]')
  localStorage.setItem('local_bahan_resep', JSON.stringify(local.filter(l => l.id !== id)))
}
