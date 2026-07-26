import { apiFetch, isBackendConfigured } from '../api'

export interface DashboardMetrics {
  total_revenue: number
  transaction_count: number
  avg_order_value: number
  order_count: number
}

export async function fetchDashboardMetrics(from?: string, to?: string): Promise<DashboardMetrics> {
  if (isBackendConfigured()) {
    const qs = new URLSearchParams()
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    const res = await apiFetch<DashboardMetrics>('GET', `/api/v1/dashboard/metrics?${qs.toString()}`)
    if (res.ok) return res.data
  }
  // Fallback: hitung dari local_transactions
  try {
    const raw = localStorage.getItem('local_transactions')
    const list: any[] = raw ? JSON.parse(raw) : []
    const total = list.reduce((s, t) => s + (t.total || 0), 0)
    return {
      total_revenue: total,
      transaction_count: list.length,
      avg_order_value: list.length ? Math.round(total / list.length) : 0,
      order_count: list.length,
    }
  } catch {
    return { total_revenue: 0, transaction_count: 0, avg_order_value: 0, order_count: 0 }
  }
}
