import {
  resolveMenuImage,
  buildCloudinaryUrl,
  menuImageUrl,
  MENU_IMAGE_FALLBACK,
  DEFAULT_CLOUD_NAME,
} from '../../lib/cloudinary'

describe('cloudinary helper', () => {
  describe('buildCloudinaryUrl (pure)', () => {
    it('builds transform url with defaults', () => {
      const url = buildCloudinaryUrl('Ayam_Goreng_qsbpul')
      expect(url).toBe(
        'https://res.cloudinary.com/dwdaydzsh/image/upload/w_600,h_400,c_fill,q_auto,f_auto/Ayam_Goreng_qsbpul',
      )
    })

    it('honors custom width/height/quality', () => {
      const url = buildCloudinaryUrl('Mie_Goreng', { w: 300, h: 200, q: 80 })
      expect(url).toContain('w_300,h_200,c_fill,q_80,f_auto/Mie_Goreng')
    })

    it('uses fit=fill when requested', () => {
      const url = buildCloudinaryUrl('Es_Teh', { fit: 'fill' })
      expect(url).toContain('fill') // fit=fill -> crop token 'fill'
      expect(url).not.toContain('c_fill')
    })

    it('respects custom cloudName', () => {
      const url = buildCloudinaryUrl('X', { cloudName: 'my-cloud' })
      expect(url).toContain('res.cloudinary.com/my-cloud/image/upload')
    })
  })

  describe('resolveMenuImage (pure)', () => {
    it('returns fallback SVG for empty string', () => {
      expect(resolveMenuImage('')).toBe(MENU_IMAGE_FALLBACK)
    })

    it('returns fallback SVG for null/undefined', () => {
      expect(resolveMenuImage(null)).toBe(MENU_IMAGE_FALLBACK)
      expect(resolveMenuImage(undefined)).toBe(MENU_IMAGE_FALLBACK)
    })

    it('passes through absolute http(s) url (legacy Supabase)', () => {
      const legacy = 'https://ywqatzkkvbzkjnoexvux.supabase.co/storage/v1/object/public/menu/ayam.png'
      expect(resolveMenuImage(legacy)).toBe(legacy)
    })

    it('passes through data: url', () => {
      const data = 'data:image/png;base64,AAAA'
      expect(resolveMenuImage(data)).toBe(data)
    })

    it('treats supabase url as absolute (not public_id)', () => {
      const supa = 'https://x.supabase.co/storage/foo.png'
      expect(resolveMenuImage(supa)).toBe(supa)
    })

    it('builds cloudinary url from public_id (no slash/url)', () => {
      const url = resolveMenuImage('Nasi_Goreng_Jawa_ab12cd')
      expect(url).toContain('res.cloudinary.com/')
      expect(url).toContain('/Nasi_Goreng_Jawa_ab12cd')
    })

    it('passes through unknown relative path as-is', () => {
      const rel = '/images/local.png'
      expect(resolveMenuImage(rel)).toBe(rel)
    })
  })

  describe('menuImageUrl (env wrapper)', () => {
    it('falls back to DEFAULT_CLOUD_NAME when env absent', () => {
      const url = menuImageUrl('Public_Id_1')
      expect(url).toContain(`res.cloudinary.com/${DEFAULT_CLOUD_NAME}/image/upload`)
    })

    it('falls back for empty input', () => {
      expect(menuImageUrl('   ')).toBe(MENU_IMAGE_FALLBACK)
    })
  })
})
