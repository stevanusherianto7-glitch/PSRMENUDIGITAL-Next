/**
 * Test untuk src/lib/api.ts — HTTP client Laravel.
 * Coverage target: 100% lines/branches/functions/statements.
 */
const mockFetch = jest.fn()
;(globalThis as any).fetch = mockFetch

function setEnv(url: string | undefined) {
  const meta = (globalThis as any).import || ((globalThis as any).import = {})
  meta.meta = meta.meta || {}
  meta.meta.env = meta.meta.env || {}
  if (url === undefined) delete meta.meta.env.VITE_API_URL
  else meta.meta.env.VITE_API_URL = url
  localStorage.clear()
}

import { apiFetch, isBackendConfigured, getApiBase } from '../../lib/api'

describe('lib/api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    localStorage.clear()
  })

  describe('apiBaseUrl / isBackendConfigured', () => {
    it('returns empty when VITE_API_URL not set', () => {
      setEnv(undefined)
      expect(getApiBase()).toBe('')
      expect(isBackendConfigured()).toBe(false)
    })

    it('returns base without trailing slash', () => {
      setEnv('https://api.example.com/')
      expect(getApiBase()).toBe('https://api.example.com')
      expect(isBackendConfigured()).toBe(true)
    })
  })

  describe('apiFetch', () => {
    it('returns not-ok when base empty (fallback mode)', async () => {
      setEnv(undefined)
      const res = await apiFetch('GET', '/x')
      expect(res.ok).toBe(false)
      expect(res.status).toBe(0)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('sends JSON body with Content-Type + Bearer token', async () => {
      setEnv('https://api.example.com')
      localStorage.setItem('sanctum_token', 'tok')
      mockFetch.mockResolvedValue({ ok: true, status: 200, text: async () => JSON.stringify({ a: 1 }) })
      const res = await apiFetch('POST', '/things', { name: 'x' })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/things',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer tok',
          }),
          body: JSON.stringify({ name: 'x' }),
        }),
      )
      expect(res.ok).toBe(true)
      expect(res.data).toEqual({ a: 1 })
    })

    it('passes FormData without Content-Type override', async () => {
      setEnv('https://api.example.com')
      const fd = new FormData()
      fd.append('file', 'y')
      mockFetch.mockResolvedValue({ ok: true, status: 201, text: async () => '' })
      await apiFetch('POST', '/upload', fd)
      const init = mockFetch.mock.calls[0][1]
      expect(init.headers['Content-Type']).toBeUndefined()
      expect(init.body).toBe(fd)
    })

    it('prepends slash to path', async () => {
      setEnv('https://api.example.com')
      mockFetch.mockResolvedValue({ ok: true, status: 200, text: async () => '[]' })
      await apiFetch('GET', 'menu')
      expect(mockFetch.mock.calls[0][0]).toBe('https://api.example.com/menu')
    })

    it('parses empty body as null', async () => {
      setEnv('https://api.example.com')
      mockFetch.mockResolvedValue({ ok: true, status: 204, text: async () => '' })
      const res = await apiFetch('DELETE', '/x')
      expect(res.data).toBeNull()
    })

    it('falls back to raw text when JSON parse fails', async () => {
      setEnv('https://api.example.com')
      mockFetch.mockResolvedValue({ ok: false, status: 500, text: async () => 'Server Error' })
      const res = await apiFetch('GET', '/x')
      expect(res.ok).toBe(false)
      expect(res.data).toBe('Server Error')
    })
  })
})
