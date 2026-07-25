import { fetchOrders, createOrder } from '../../app/api'

describe('Order API (HTTP Laravel + localStorage fallback)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('fetchOrders', () => {
    it('returns [] when no backend configured and no local cache', async () => {
      const orders = await fetchOrders()
      expect(orders).toEqual([])
    })

    it('reads from localStorage local_orders when backend not configured', async () => {
      const seed = [
        { id: 'O-1', tableId: 'A1', items: [], subtotal: 0, total: 0, status: 'pending', type: 'guest', orderMode: 'dine-in', created_at: '2023-01-01', updated_at: '2023-01-01' },
      ]
      localStorage.setItem('local_orders', JSON.stringify(seed))
      const orders = await fetchOrders()
      expect(orders[0].id).toBe('O-1')
      expect(orders[0].tableId).toBe('A1')
    })

    it('filters by status from localStorage', async () => {
      const seed = [
        { id: 'O-1', tableId: 'A1', status: 'pending', type: 'guest', orderMode: 'dine-in' },
        { id: 'O-2', tableId: 'A2', status: 'served', type: 'guest', orderMode: 'dine-in' },
      ]
      localStorage.setItem('local_orders', JSON.stringify(seed))
      const pending = await fetchOrders('pending')
      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe('O-1')
    })
  })

  describe('createOrder', () => {
    it('creates order and persists to localStorage local_orders', async () => {
      const order = await createOrder({
        tableId: 'A1',
        items: [],
        subtotal: 0,
        total: 0,
        orderMode: 'dine-in',
        type: 'guest',
      })
      expect(order.tableId).toBe('A1')
      const stored = JSON.parse(localStorage.getItem('local_orders') || '[]')
      expect(stored.find((o: any) => o.id === order.id)).toBeTruthy()
    })
  })
})
