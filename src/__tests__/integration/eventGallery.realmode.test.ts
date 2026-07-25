/**
 * Integration test — bukti REAL-MODE uploadEventPhoto ke stub Laravel.
 */
import http from 'node:http'
import { uploadEventPhoto } from '../../lib/eventGallery'
import { menuImageUrl } from '../../lib/cloudinary'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { server: stubServer } = require('../../../server/eventGalleryStub')

jest.setTimeout(15000)

function realFetch(url: string, opts: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    let title = 'event'
    if (opts?.body && typeof opts.body.get === 'function') {
      const t = opts.body.get('title')
      if (typeof t === 'string') title = t
    }
    const payload = JSON.stringify({ title })
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: opts?.method || 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      },
      (res) => {
        let data = ''
        res.on('data', (c) => (data += c))
        res.on('end', () =>
          resolve({
            ok: (res.statusCode || 0) < 400,
            status: res.statusCode,
            json: async () => JSON.parse(data),
          }),
        )
      },
    )
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

describe('eventGallery REAL-MODE (integration ke stub Laravel)', () => {
  let baseUrl: string
  beforeAll((done) => {
    stubServer.listen(0, () => {
      const port = (stubServer.address() as { port: number }).port
      baseUrl = `http://localhost:${port}`
      done()
    })
  })
  afterAll((done) => {
    stubServer.close(() => done())
  })
  beforeEach(() => {
    global.fetch = realFetch as any
  })

  it('POST ke stub menghasilkan public_id events/ + url Cloudinary riil', async () => {
    const file = new File(['x'], 'Live Music.png', { type: 'image/png' })
    const res = await uploadEventPhoto(file, 'Live Music', { apiBase: baseUrl })
    expect(res.public_id).toMatch(/^events\/live_music_[a-z0-9]{6}$/)
    const built = menuImageUrl(res.public_id)
    expect(built).toContain('res.cloudinary.com/dwdaydzsh/image/upload')
    expect(built).toContain(res.public_id)
  })
})
