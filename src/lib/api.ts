/**
 * HTTP client untuk backend Laravel (pengganti @supabase/supabase-js).
 *
 * - Base URL dari import.meta.env.VITE_API_URL (atau globalThis import.meta).
 * - Auth: Sanctum token dari localStorage 'sanctum_token' (diisi setelah login Laravel).
 * - Mode: bila VITE_API_URL KOSONG -> kembalikan null (caller fallback ke localStorage/mock).
 *
 * Dipakai oleh src/lib/repository/* sebagai data-layer ke Laravel.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function apiBaseUrl(): string {
  const meta = (globalThis as unknown as { import?: { meta?: { env?: Record<string, string> } } }).import?.meta
  const base = meta?.env?.VITE_API_URL
  return base ? base.replace(/\/$/, '') : ''
}

function authToken(): string | null {
  try {
    return localStorage.getItem('sanctum_token')
  } catch {
    return null
  }
}

export interface ApiResult<T = unknown> {
  ok: boolean
  status: number
  data: T
}

/** Kembalikan true bila backend Laravel terkonfigurasi (VITE_API_URL diisi). */
export function isBackendConfigured(): boolean {
  return apiBaseUrl().length > 0
}

export async function apiFetch<T = unknown>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  const base = apiBaseUrl()
  if (!base) {
    return { ok: false, status: 0, data: null as unknown as T }
  }
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = authToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const init: RequestInit = { method, headers }
  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body
    } else {
      headers['Content-Type'] = 'application/json'
      init.body = JSON.stringify(body)
    }
  }
  const res = await fetch(`${base}${path.startsWith('/') ? path : `/${path}`}`, init)
  let data: T
  const text = await res.text()
  try {
    data = text ? (JSON.parse(text) as T) : (null as unknown as T)
  } catch {
    data = text as unknown as T
  }
  return { ok: res.ok, status: res.status, data }
}
