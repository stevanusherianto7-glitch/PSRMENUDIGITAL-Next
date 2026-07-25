import { uploadMenuPhoto, localPublicId } from '../../lib/menuUpload'

describe('menuUpload service', () => {
  describe('localPublicId (mock mode)', () => {
    it('slugifies name + appends random suffix under menu/', () => {
      const id = localPublicId('Nasi Ayam Penyet Semarang!')
      expect(id).toMatch(/^menu\/nasi_ayam_penyet_semarang_[a-z0-9]{6}$/)
    })

    it('falls back to "menu" for empty/invalid name', () => {
      const id = localPublicId('!!!')
      expect(id).toMatch(/^menu\/menu_[a-z0-9]{6}$/)
    })
  })

  describe('uploadMenuPhoto', () => {
    it('mock mode: returns local public_id when apiBase empty', async () => {
      const file = new File(['x'], 'foto.png', { type: 'image/png' })
      const res = await uploadMenuPhoto(file, 'Es Teh Manis', { apiBase: '' })
      expect(res.public_id).toMatch(/^menu\/es_teh_manis_[a-z0-9]{6}$/)
      expect(res.url).toBeUndefined()
    })

    it('real mode: POST to /api/menu/upload and returns public_id', async () => {
      const fakeJson = { public_id: 'menu/es_teh_ab12cd', url: 'https://res.cloudinary.com/x/upload/menu/es_teh_ab12cd' }
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => fakeJson,
      }) as jest.Mock

      const file = new File(['x'], 'foto.png', { type: 'image/png' })
      const res = await uploadMenuPhoto(file, 'Es Teh', { apiBase: 'https://api.example.com/' })
      expect(res.public_id).toBe('menu/es_teh_ab12cd')
      expect(res.url).toBe(fakeJson.url)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/menu/upload',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    it('real mode: throws on HTTP error', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as jest.Mock
      const file = new File(['x'], 'foto.png', { type: 'image/png' })
      await expect(uploadMenuPhoto(file, 'X', { apiBase: 'https://api.example.com' })).rejects.toThrow(/HTTP 500/)
    })

    it('real mode: throws when backend omits public_id', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as jest.Mock
      const file = new File(['x'], 'foto.png', { type: 'image/png' })
      await expect(uploadMenuPhoto(file, 'X', { apiBase: 'https://api.example.com' })).rejects.toThrow(/public_id/)
    })
  })
})
