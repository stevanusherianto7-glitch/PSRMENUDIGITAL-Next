import { apiFetch, isBackendConfigured } from '../api'

export interface OrderRecord {
  id: string
  tableId: string
  items: unknown[]
  subtotal: number
  tax: number
  total: number
  method: string
  status?: string
  createdAt?: string
}

/**
 * Repository order — data-layer ke Laravel (/api/v1/orders) dgn fallback localStorage.
 * Menggantikan supabase.from('transactions') untuk order tamu.
 */
const LS_KEY = 'local_orders'

function readLocal(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as OrderRecord[]) : []
  } catch {
    return []
  }
}
function writeLocal(items: OrderRecord[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export async function fetchOrders(): Promise<OrderRecord[]> {
  if (!isBackendConfigured()) return readLocal()
  const res = await apiFetch<{ data: OrderRecord[] }>('GET', '/api/v1/orders')
  if (!res.ok) return readLocal()
  return Array.isArray(res.data) ? res.data : (res.data as { data: OrderRecord[] }).data ?? []
}

export async function createOrder(order: OrderRecord): Promise<OrderRecord> {
  if (!isBackendConfigured()) {
    const list = readLocal()
    list.push(order)
    writeLocal(list)
    return order
  }
  const res = await apiFetch<OrderRecord>('POST', '/api/v1/orders', order)
  if (!res.ok) throw new Error(`Create order gagal: HTTP ${res.status}`)
  return res.data
}
