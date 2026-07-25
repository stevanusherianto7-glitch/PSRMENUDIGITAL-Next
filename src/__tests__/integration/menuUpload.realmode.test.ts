/**
 * Integration test — bukti REAL-MODE uploadMenuPhoto ke stub backend Laravel.
 *
 * jsdom test-env tidak punya global `fetch`, jadi kita sediakan `global.fetch`
 * minimal berbasis node:http yang melakukan POST sungguhan ke stub (bukti network
 * real-mode), lalu memanggil uploadMenuPhoto() yang akan memanggil fetch tersebut.
 */
import http from 'node:http'
import { uploadMenuPhoto } from '../../lib/menuUpload'
import { menuImageUrl } from '../../lib/cloudinary'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { server: stubServer } = require('../../../server/menuUploadStub')

jest.setTimeout(15000)

function realFetch(url: string, opts: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    // Ambil name dari FormData (Node 24 FormData punya .get)
    let name = 'menu'
    if (opts?.body && typeof opts.body.get === 'function') {
      const n = opts.body.get('name')
      if (typeof n === 'string') name = n
    }
    const payload = JSON.stringify({ name })
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
        res.on('end', () => {
          resolve({
            ok: (res.statusCode || 0) < 400,
            status: res.statusCode,
            json: async () => JSON.parse(data),
          })
        })
      },
    )
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

describe('menuUpload REAL-MODE (integration ke stub Laravel)', () => {
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

  it('POST ke stub menghasilkan public_id + url Cloudinary riil', async () => {
    const file = new File(['dummy-bytes'], 'Es Teh Manis.png', { type: 'image/png' })
    const res = await uploadMenuPhoto(file, 'Es Teh Manis', { apiBase: baseUrl })

    expect(res.public_id).toMatch(/^menu\/es_teh_manis_[a-z0-9]{6}$/)
    // Frontend membangun URL transform sendiri dari public_id (backend hanya simpan public_id)
    const built = menuImageUrl(res.public_id)
    expect(built).toContain('res.cloudinary.com/dwdaydzsh/image/upload')
    expect(built).toContain(res.public_id)
    expect(built).toMatch(/w_600,h_400,c_fill,q_auto,f_auto/)
  })
})
