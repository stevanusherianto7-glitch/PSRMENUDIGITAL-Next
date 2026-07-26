/**
 * Test semua repository di src/lib/repository — target 100% coverage.
 * Mock apiFetch + isBackendConfigured dari '../../lib/api'.
 */
const mockApiFetch = jest.fn()
const mockIsBackend = jest.fn(() => false)
jest.mock('../../lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  isBackendConfigured: () => mockIsBackend(),
}))

import { fetchMeja, updateMejaStatus, seedMeja } from '../../lib/repository/meja'
import { fetchInventory, saveInventory, deleteInventory, logInventory, fetchInventoryLogs } from '../../lib/repository/inventory'
import { fetchReservations, saveReservation } from '../../lib/repository/reservation'
import { upsertMenuItem, deleteMenuItem } from '../../lib/repository/menuCrud'
import { fetchShifts, saveShift, deleteShift } from '../../lib/repository/shift'
import { fetchAssets, saveAsset, deleteAsset } from '../../lib/repository/asset'
import { fetchRecipes, saveRecipe, deleteRecipe } from '../../lib/repository/recipe'
import { fetchDashboardMetrics } from '../../lib/repository/dashboard'

function setBackend(on: boolean) {
  mockIsBackend.mockReturnValue(on)
  localStorage.clear()
}

describe('repository/meja', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('fetchMeja fallback localStorage', async () => {
    localStorage.setItem('local_meja', JSON.stringify([{ id: 'A1' }]))
    expect(await fetchMeja()).toEqual([{ id: 'A1' }])
  })
  it('fetchMeja backend', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { data: [{ id: 'A1' }] } })
    expect(await fetchMeja()).toEqual([{ id: 'A1' }])
  })
  it('fetchMeja backend ok=false -> fallback', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: false, data: null })
    localStorage.setItem('local_meja', JSON.stringify([{ id: 'B2' }]))
    expect(await fetchMeja()).toEqual([{ id: 'B2' }])
  })
  it('updateMejaStatus fallback', async () => {
    localStorage.setItem('local_meja', JSON.stringify([{ id: 'A1', status: 'free' }]))
    await updateMejaStatus('A1', { status: 'occupied' })
    expect(JSON.parse(localStorage.getItem('local_meja')!)[0].status).toBe('occupied')
  })
  it('updateMejaStatus backend', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await updateMejaStatus('A1', { status: 'occupied' })
    expect(mockApiFetch).toHaveBeenCalledWith('PUT', '/api/v1/meja/A1', { status: 'occupied' })
  })
  it('seedMeja fallback + backend', async () => {
    const rows = [{ id: 'A1' }] as any
    await seedMeja(rows)
    expect(JSON.parse(localStorage.getItem('local_meja')!)).toEqual(rows)
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await seedMeja(rows)
    expect(mockApiFetch).toHaveBeenCalledWith('POST', '/api/v1/meja/seed', { rows })
  })
})

describe('repository/inventory', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('fetchInventory fallback', async () => {
    localStorage.setItem('local_inventory', JSON.stringify([{ id: 1, name: 'g' }]))
    expect(await fetchInventory()).toEqual([{ id: 1, name: 'g' }])
  })
  it('fetchInventory backend', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { data: [{ id: 1 }] } })
    expect(await fetchInventory()).toEqual([{ id: 1 }])
  })
  it('saveInventory fallback', async () => {
    await saveInventory({ name: 'x' } as any)
    expect(JSON.parse(localStorage.getItem('local_inventory')!)[0].name).toBe('x')
  })
  it('saveInventory backend', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { id: 9 } })
    await saveInventory({ name: 'x' } as any)
    expect(mockApiFetch).toHaveBeenCalledWith('POST', '/api/v1/inventory', { name: 'x' })
  })
  it('deleteInventory fallback + backend', async () => {
    localStorage.setItem('local_inventory', JSON.stringify([{ id: 1 }]))
    await deleteInventory(1)
    expect(localStorage.getItem('local_inventory')).toBe('[]')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await deleteInventory(5)
    expect(mockApiFetch).toHaveBeenCalledWith('DELETE', '/api/v1/inventory/5')
  })
  it('logInventory fallback no-op + backend', async () => {
    await logInventory(1, 5, 'note')
    expect(localStorage.getItem('local_inventory_logs')).toBeNull()
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await logInventory(1, 5, 'n2')
    expect(mockApiFetch).toHaveBeenCalledWith('POST', '/api/v1/inventory-logs', { inventory_id: 1, change: 5, note: 'n2' })
  })
  it('fetchInventoryLogs fallback returns [] + backend', async () => {
    expect(await fetchInventoryLogs()).toEqual([])
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { data: [{ id: 2 }] } })
    expect(await fetchInventoryLogs()).toEqual([{ id: 2 }])
  })
})

describe('repository/reservation', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('fetchReservations fallback + backend', async () => {
    localStorage.setItem('local_reservations', JSON.stringify([{ id: 'r1' }]))
    expect(await fetchReservations()).toEqual([{ id: 'r1' }])
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { data: [{ id: 'r2' }] } })
    expect(await fetchReservations()).toEqual([{ id: 'r2' }])
  })
  it('saveReservation fallback (new+update) + backend', async () => {
    await saveReservation({ name: 'a' } as any)
    const saved = JSON.parse(localStorage.getItem('local_reservations')!)[0]
    expect(saved.name).toBe('a')
    await saveReservation({ id: 'r1', name: 'b' } as any)
    expect(JSON.parse(localStorage.getItem('local_reservations')!).find((r: any) => r.id === 'r1').name).toBe('b')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await saveReservation({ id: 'r1' } as any)
    expect(mockApiFetch).toHaveBeenCalledWith('PUT', '/api/v1/reservations/r1', { id: 'r1' })
  })
})

describe('repository/menuCrud', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('upsertMenuItem fallback (new+update) + backend', async () => {
    await upsertMenuItem({ name: 'm' } as any)
    expect(JSON.parse(localStorage.getItem('local_menu_items')!)[0].name).toBe('m')
    await upsertMenuItem({ id: 'm1', name: 'n' } as any)
    expect(JSON.parse(localStorage.getItem('local_menu_items')!).find((m: any) => m.id === 'm1').name).toBe('n')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await upsertMenuItem({ id: 'm1' } as any)
    expect(mockApiFetch).toHaveBeenCalledWith('PUT', '/api/v1/menu-items/m1', { id: 'm1' })
  })
  it('deleteMenuItem fallback + backend', async () => {
    localStorage.setItem('local_menu_items', JSON.stringify([{ id: 'm1' }]))
    await deleteMenuItem('m1')
    expect(localStorage.getItem('local_menu_items')).toBe('[]')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await deleteMenuItem('m2')
    expect(mockApiFetch).toHaveBeenCalledWith('DELETE', '/api/v1/menu-items/m2')
  })
})

describe('repository/shift', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('fetchShifts fallback + backend', async () => {
    localStorage.setItem('local_jadwal_shift', JSON.stringify([{ id: 's1' }]))
    expect(await fetchShifts()).toEqual([{ id: 's1' }])
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { data: [{ id: 's2' }] } })
    expect(await fetchShifts()).toEqual([{ id: 's2' }])
  })
  it('saveShift fallback + backend', async () => {
    await saveShift({ employee_name: 'a' } as any)
    expect(JSON.parse(localStorage.getItem('local_jadwal_shift')!)[0].employee_name).toBe('a')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await saveShift({ id: 's1' } as any)
    expect(mockApiFetch).toHaveBeenCalledWith('POST', '/api/v1/jadwal-shift', { id: 's1' })
  })
  it('deleteShift fallback + backend', async () => {
    localStorage.setItem('local_jadwal_shift', JSON.stringify([{ id: 's1' }]))
    await deleteShift('s1' as any)
    expect(localStorage.getItem('local_jadwal_shift')).toBe('[]')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await deleteShift('s2' as any)
    expect(mockApiFetch).toHaveBeenCalledWith('DELETE', '/api/v1/jadwal-shift/s2')
  })
})

describe('repository/asset', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('fetchAssets fallback + backend', async () => {
    localStorage.setItem('local_assets', JSON.stringify([{ id: 1 }]))
    expect(await fetchAssets()).toEqual([{ id: 1 }])
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { data: [{ id: 2 }] } })
    expect(await fetchAssets()).toEqual([{ id: 2 }])
  })
  it('saveAsset fallback + backend', async () => {
    await saveAsset({ name: 'x' } as any)
    expect(JSON.parse(localStorage.getItem('local_assets')!)[0].name).toBe('x')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { id: 9 } })
    await saveAsset({ id: 3 } as any)
    expect(mockApiFetch).toHaveBeenCalledWith('POST', '/api/v1/assets', { id: 3 })
  })
  it('deleteAsset fallback + backend', async () => {
    localStorage.setItem('local_assets', JSON.stringify([{ id: 1 }]))
    await deleteAsset(1)
    expect(localStorage.getItem('local_assets')).toBe('[]')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await deleteAsset(5)
    expect(mockApiFetch).toHaveBeenCalledWith('DELETE', '/api/v1/assets/5')
  })
})

describe('repository/recipe', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('fetchRecipes fallback + backend', async () => {
    localStorage.setItem('local_bahan_resep', JSON.stringify([{ id: 1 }]))
    expect(await fetchRecipes()).toEqual([{ id: 1 }])
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { data: [{ id: 2 }] } })
    expect(await fetchRecipes()).toEqual([{ id: 2 }])
  })
  it('saveRecipe fallback + backend', async () => {
    await saveRecipe({ name: 'x' } as any)
    expect(JSON.parse(localStorage.getItem('local_bahan_resep')!)[0].name).toBe('x')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { id: 9 } })
    await saveRecipe({ id: 3 } as any)
    expect(mockApiFetch).toHaveBeenCalledWith('POST', '/api/v1/bahan-resep', { id: 3 })
  })
  it('deleteRecipe fallback + backend', async () => {
    localStorage.setItem('local_bahan_resep', JSON.stringify([{ id: 1 }]))
    await deleteRecipe(1)
    expect(localStorage.getItem('local_bahan_resep')).toBe('[]')
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await deleteRecipe(5)
    expect(mockApiFetch).toHaveBeenCalledWith('DELETE', '/api/v1/bahan-resep/5')
  })
})

describe('repository/dashboard', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('fetchDashboardMetrics fallback computes from local_transactions', async () => {
    localStorage.setItem('local_transactions', JSON.stringify([{ total: 100 }, { total: 50 }]))
    const m = await fetchDashboardMetrics()
    expect(m.total_revenue).toBe(150)
    expect(m.transaction_count).toBe(2)
    expect(m.avg_order_value).toBe(75)
    expect(m.order_count).toBe(2)
  })
  it('fetchDashboardMetrics fallback empty', async () => {
    const m = await fetchDashboardMetrics()
    expect(m).toEqual({ total_revenue: 0, transaction_count: 0, avg_order_value: 0, order_count: 0 })
  })
  it('fetchDashboardMetrics backend passes from/to', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { total_revenue: 100, transaction_count: 5, avg_order_value: 20, order_count: 5 } })
    const m = await fetchDashboardMetrics('2026-01-01', '2026-02-01')
    expect(mockApiFetch).toHaveBeenCalledWith('GET', '/api/v1/dashboard/metrics?from=2026-01-01&to=2026-02-01')
    expect(m.total_revenue).toBe(100)
  })
  it('fetchDashboardMetrics backend ok=false -> fallback', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: false, data: null })
    localStorage.setItem('local_transactions', JSON.stringify([{ total: 40 }]))
    const m = await fetchDashboardMetrics()
    expect(m.total_revenue).toBe(40)
  })
})
