import { setToken, getToken, clearToken } from '../../lib/tokenStorage'

describe('lib/tokenStorage', () => {
  beforeEach(() => localStorage.clear())

  it('setToken writes to localStorage', async () => {
    await setToken('xyz')
    expect(localStorage.getItem('sanctum_token')).toBe('xyz')
  })

  it('getToken reads from localStorage', async () => {
    localStorage.setItem('sanctum_token', 'abc')
    expect(await getToken()).toBe('abc')
  })

  it('getToken returns null when empty', async () => {
    expect(await getToken()).toBeNull()
  })

  it('clearToken removes key', async () => {
    localStorage.setItem('sanctum_token', 'abc')
    await clearToken()
    expect(localStorage.getItem('sanctum_token')).toBeNull()
  })
})
