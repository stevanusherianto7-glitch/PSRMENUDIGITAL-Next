import {
  buildCloudinaryUrl,
  resolveMenuImage,
  menuImageUrl,
  MENU_IMAGE_FALLBACK,
  DEFAULT_CLOUD_NAME,
} from '../../lib/cloudinary'

describe('lib/cloudinary', () => {
  it('buildCloudinaryUrl builds transform url', () => {
    const url = buildCloudinaryUrl('Ayam', { w: 300, h: 200, q: 80, fit: 'fill' })
    expect(url).toBe('https://res.cloudinary.com/dwdaydzsh/image/upload/w_300,h_200,fill,q_80,f_auto/Ayam')
  })

  it('buildCloudinaryUrl default c_fill', () => {
    const url = buildCloudinaryUrl('Ayam')
    expect(url).toContain('w_600,h_400,c_fill,q_auto')
  })

  it('resolveMenuImage returns fallback when empty', () => {
    expect(resolveMenuImage('')).toBe(MENU_IMAGE_FALLBACK)
    expect(resolveMenuImage(null)).toBe(MENU_IMAGE_FALLBACK)
    expect(resolveMenuImage(undefined)).toBe(MENU_IMAGE_FALLBACK)
  })

  it('resolveMenuImage passes through absolute URL', () => {
    expect(resolveMenuImage('https://x.com/a.png')).toBe('https://x.com/a.png')
    expect(resolveMenuImage('data:image/png;base64,zz')).toBe('data:image/png;base64,zz')
  })

  it('resolveMenuImage builds url for public_id', () => {
    expect(resolveMenuImage('Ayam')).toBe(
      'https://res.cloudinary.com/dwdaydzsh/image/upload/w_600,h_400,c_fill,q_auto,f_auto/Ayam',
    )
  })

  it('menuImageUrl uses default cloud name', () => {
    expect(menuImageUrl('Ayam')).toBe(
      `https://res.cloudinary.com/${DEFAULT_CLOUD_NAME}/image/upload/w_600,h_400,c_fill,q_auto,f_auto/Ayam`,
    )
  })
})
