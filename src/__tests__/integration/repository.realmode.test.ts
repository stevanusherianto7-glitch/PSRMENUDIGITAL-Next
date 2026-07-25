/**
 * Integration test — bukti repository (menu/event/order) memanggil HTTP Laravel
 * (real network ke server/restStub.js) saat VITE_API_URL diisi.
 */
import http from 'node:http'
import { fetchMenu, createMenuItem, deleteMenuItem } from '../../lib/repository/menu'
import { fetchEvents, saveEvent, deleteEvent } from '../../lib/repository/event'
import { fetchOrders, createOrder } from '../../lib/repository/order'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { server: stubServer } = require('../../../server/restStub')

jest.setTimeout(20000)

// Polyfill fetch (jsdom test-env tidak punya global fetch) berbasis node:http
function realFetch(url: string, opts: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const payload =
      opts?.body instanceof FormData
        ? opts.body
        : opts?.body
          ? opts.body
          : undefined
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + (u.search || ''),
        method: opts?.method || 'GET',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(opts?.headers || {}) },
      },
      (res) => {
        let data = ''
        res.on('data', (c) => (data += c))
        res.on('end', () =>
          resolve({
            ok: (res.statusCode || 0) < 400,
            status: res.statusCode,
            json: async () => JSON.parse(data || 'null'),
            text: async () => data,
          }),
        )
      },
    )
    req.on('error', reject)
    if (payload) req.write(typeof payload === 'string' ? payload : JSON.stringify(payload))
    req.end()
  })
}

describe('repository REAL-MODE (integration ke stub Laravel REST)', () => {
  let baseUrl: string
  beforeAll((done) => {
    stubServer.listen(0, () => {
      const port = (stubServer.address() as { port: number }).port
      baseUrl = `http://localhost:${port}`
      // inject VITE_API_URL via globalThis import.meta
      ;(globalThis as any).import = { meta: { env: { VITE_API_URL: baseUrl } } }
      done()
    })
  })
  afterAll((done) => {
    stubServer.close(() => done())
  })
  beforeEach(() => {
    global.fetch = realFetch as any
    localStorage.clear()
  })

  it('menu: create -> fetch -> delete ke backend', async () => {
    const item = { id: 'm_test', name: 'Test Ayam', category: 'Makanan', price: 10000, image: 'menu/test_ayam', available: true }
    const created = await createMenuItem(item)
    expect(created.id).toBe('m_test')
    const list = await fetchMenu()
    expect(list.find((m) => m.id === 'm_test')).toBeTruthy()
    await deleteMenuItem('m_test')
    const after = await fetchMenu()
    expect(after.find((m) => m.id === 'm_test')).toBeFalsy()
  })

  it('event: save -> fetch -> delete ke backend', async () => {
    const ev = { id: 'e_test', image: 'events/test', title: 'Test', date: '2026-07-25', category: 'Promo', description: 'x' }
    await saveEvent(ev)
    const list = await fetchEvents()
    expect(list.find((e) => e.id === 'e_test')).toBeTruthy()
    await deleteEvent('e_test')
    const after = await fetchEvents()
    expect(after.find((e) => e.id === 'e_test')).toBeFalsy()
  })

  it('order: create -> fetch ke backend', async () => {
    const ord = { id: 'o_test', tableId: 'A1', items: [], subtotal: 10000, tax: 1000, total: 11000, method: 'tunai' }
    await createOrder(ord)
    const list = await fetchOrders()
    expect(list.find((o) => o.id === 'o_test')).toBeTruthy()
  })
})
