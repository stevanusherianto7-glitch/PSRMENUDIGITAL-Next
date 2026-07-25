import { createOrder } from '../../app/api'

/**
 * Dengan arsitektur Laravel, idempotency ditangani server-side (controller cek
 * uniqueness idempotency_key). Frontend mengirim idempotency_key di body POST.
 * Bila backend gagal, createOrder fallback ke localStorage (tidak throw).
 */
describe('Order Duplication Prevention (Laravel mode)', () => {
  let capturedBody: any = null
  let fetchStatus = 200

  beforeEach(() => {
    localStorage.clear()
    capturedBody = null
    fetchStatus = 200
    ;(globalThis as any).import = { meta: { env: { VITE_API_URL: 'http://localhost:9999' } } }
    global.fetch = jest.fn(async (_url: string, opts: any) => {
      if (opts?.body) {
        try {
          capturedBody = JSON.parse(opts.body)
        } catch {
          capturedBody = null
        }
      }
      return {
        ok: fetchStatus < 400,
        status: fetchStatus,
        json: async () => ({ id: 'O-SRV-1', ...(capturedBody || {}) }),
        text: async () => JSON.stringify({ id: 'O-SRV-1', ...(capturedBody || {}) }),
      }
    }) as any
  })

  it('sends idempotency_key in POST body to Laravel', async () => {
    const payload = {
      tableId: 'Meja-1',
      items: [{ id: 'menu-1', name: 'Nasi Goreng', price: 15000, qty: 1, category: 'Makanan' }],
      subtotal: 15000,
      total: 15000,
      orderMode: 'dine-in' as const,
      type: 'guest' as const,
      idempotencyKey: 'Meja-1|menu-1:1|123456',
    }
    const order = await createOrder(payload)
    expect(order.tableId).toBe('Meja-1')
    expect(capturedBody.idempotency_key).toBe('Meja-1|menu-1:1|123456')
  })

  it('falls back to localStorage when backend returns error (e.g. duplicate 409)', async () => {
    fetchStatus = 409
    const payload = {
      tableId: 'Meja-1',
      items: [],
      subtotal: 15000,
      total: 15000,
      orderMode: 'dine-in' as const,
      type: 'guest' as const,
      idempotencyKey: 'Meja-1|dup|1',
    }
    // Tidak throw — fallback localStorage
    const order = await createOrder(payload)
    expect(order.id).toBeTruthy()
    const stored = JSON.parse(localStorage.getItem('local_orders') || '[]')
    expect(stored.find((o: any) => o.id === order.id)).toBeTruthy()
  })
})
