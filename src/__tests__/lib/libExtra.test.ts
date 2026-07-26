/**
 * Test tambahan untuk capai 100% coverage di:
 *  - lib/menuUpload.ts
 *  - lib/eventGallery.ts
 *  - lib/repository/order.ts
 *  - lib/repository/menu.ts
 */
const mockFetch = jest.fn()
;(globalThis as any).fetch = mockFetch

const mockApiFetch = jest.fn()
const mockIsBackend = jest.fn(() => false)
jest.mock('../../lib/api', () => ({
  apiFetch: (...args: any[]) => mockApiFetch(...args),
  isBackendConfigured: () => mockIsBackend(),
}))

import { uploadMenuPhoto, localPublicId } from '../../lib/menuUpload'
import { uploadEventPhoto, localEventPublicId } from '../../lib/eventGallery'
import { fetchOrders, createOrder } from '../../lib/repository/order'
import { fetchMenu, saveMenu, createMenuItem, deleteMenuItem } from '../../lib/repository/menu'

function setBackend(on: boolean) {
  mockIsBackend.mockReturnValue(on)
  localStorage.clear()
}

describe('lib/menuUpload', () => {
  beforeEach(() => { mockFetch.mockReset(); setBackend(false) })
  it('localPublicId returns menu/ slug', () => {
    expect(localPublicId('Ayam Goreng').startsWith('menu/ayam_goreng_')).toBe(true)
  })
  it('uploadMenuPhoto mock mode', async () => {
    const r = await uploadMenuPhoto({} as File, 'Ayam Goreng')
    expect(r.public_id.startsWith('menu/')).toBe(true)
  })
  it('uploadMenuPhoto real mode ok', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ public_id: 'x1', url: 'u' }) })
    const r = await uploadMenuPhoto({} as File, 'Ayam', { apiBase: 'https://api.x' })
    expect(r.public_id).toBe('x1')
    expect(mockFetch).toHaveBeenCalledWith('https://api.x/api/menu/upload', expect.any(Object))
  })
  it('uploadMenuPhoto real mode !ok throws', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    await expect(uploadMenuPhoto({} as File, 'Ayam', { apiBase: 'https://api.x' })).rejects.toThrow('HTTP 500')
  })
  it('uploadMenuPhoto real mode no public_id throws', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    await expect(uploadMenuPhoto({} as File, 'Ayam', { apiBase: 'https://api.x' })).rejects.toThrow('public_id')
  })
})

describe('lib/eventGallery', () => {
  beforeEach(() => { mockFetch.mockReset(); setBackend(false) })
  it('localEventPublicId returns events/ slug', () => {
    expect(localEventPublicId('Wedding').startsWith('events/wedding_')).toBe(true)
  })
  it('uploadEventPhoto mock mode', async () => {
    const r = await uploadEventPhoto({} as File, 'Wedding')
    expect(r.public_id.startsWith('events/')).toBe(true)
  })
  it('uploadEventPhoto real mode ok', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ public_id: 'e1' }) })
    const r = await uploadEventPhoto({} as File, 'Wedding', { apiBase: 'https://api.x' })
    expect(r.public_id).toBe('e1')
  })
  it('uploadEventPhoto real mode !ok throws', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400, json: async () => ({}) })
    await expect(uploadEventPhoto({} as File, 'Wedding', { apiBase: 'https://api.x' })).rejects.toThrow('HTTP 400')
  })
  it('uploadEventPhoto real mode no public_id throws', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    await expect(uploadEventPhoto({} as File, 'Wedding', { apiBase: 'https://api.x' })).rejects.toThrow('public_id')
  })
})

describe('repository/order', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('fetchOrders fallback', async () => {
    localStorage.setItem('local_orders', JSON.stringify([{ id: 'o1' }]))
    expect(await fetchOrders()).toEqual([{ id: 'o1' }])
  })
  it('fetchOrders backend maps array', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: [{ id: 'o2' }] })
    expect(await fetchOrders()).toEqual([{ id: 'o2' }])
  })
  it('fetchOrders backend !ok -> fallback', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: false, data: null })
    localStorage.setItem('local_orders', JSON.stringify([{ id: 'o3' }]))
    expect(await fetchOrders()).toEqual([{ id: 'o3' }])
  })
  it('createOrder fallback', async () => {
    const o = { id: 'o1' } as any
    await createOrder(o)
    expect(JSON.parse(localStorage.getItem('local_orders')!)[0].id).toBe('o1')
  })
  it('createOrder backend ok', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { id: 'o9' } })
    const r = await createOrder({ id: 'o9' } as any)
    expect(r.id).toBe('o9')
  })
  it('createOrder backend !ok throws', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: false, status: 500, data: null })
    await expect(createOrder({ id: 'x' } as any)).rejects.toThrow('HTTP 500')
  })
})

describe('repository/menu', () => {
  beforeEach(() => { mockApiFetch.mockReset(); setBackend(false) })
  it('fetchMenu fallback', async () => {
    localStorage.setItem('local_menu_items', JSON.stringify([{ id: 'm1' }]))
    expect(await fetchMenu()).toEqual([{ id: 'm1' }])
  })
  it('fetchMenu backend maps array', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: [{ id: 'm2' }] })
    expect(await fetchMenu()).toEqual([{ id: 'm2' }])
  })
  it('fetchMenu backend !ok -> fallback', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: false, data: null })
    localStorage.setItem('local_menu_items', JSON.stringify([{ id: 'm3' }]))
    expect(await fetchMenu()).toEqual([{ id: 'm3' }])
  })
  it('saveMenu fallback writes local', async () => {
    await saveMenu([{ id: 'm1' } as any])
    expect(JSON.parse(localStorage.getItem('local_menu_items')!)[0].id).toBe('m1')
  })
  it('saveMenu backend ok', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: {} })
    await saveMenu([{ id: 'm1' } as any])
    expect(mockApiFetch).toHaveBeenCalledWith('PUT', '/api/v1/menus/sync', { items: [{ id: 'm1' }] })
  })
  it('saveMenu backend !ok -> fallback local', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: false, data: null })
    await saveMenu([{ id: 'm1' } as any])
    expect(JSON.parse(localStorage.getItem('local_menu_items')!)[0].id).toBe('m1')
  })
  it('createMenuItem fallback', async () => {
    await createMenuItem({ id: 'm1' } as any)
    expect(JSON.parse(localStorage.getItem('local_menu_items')!)[0].id).toBe('m1')
  })
  it('createMenuItem backend ok', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: true, data: { id: 'm9' } })
    const r = await createMenuItem({ id: 'm9' } as any)
    expect(r.id).toBe('m9')
  })
  it('createMenuItem backend !ok throws', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: false, status: 404, data: null })
    await expect(createMenuItem({ id: 'x' } as any)).rejects.toThrow('HTTP 404')
  })
  it('deleteMenuItem fallback', async () => {
    localStorage.setItem('local_menu_items', JSON.stringify([{ id: 'm1' }]))
    await deleteMenuItem('m1')
    expect(localStorage.getItem('local_menu_items')).toBe('[]')
  })
  it('deleteMenuItem backend !ok throws', async () => {
    setBackend(true)
    mockApiFetch.mockResolvedValue({ ok: false, status: 403, data: null })
    await expect(deleteMenuItem('m1')).rejects.toThrow('HTTP 403')
  })
})
