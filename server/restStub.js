/**
 * STUB Backend REST — mensimulasikan Laravel API untuk menu/event-gallery/orders.
 * Digunakan untuk dev/bukti real-mode frontend sebelum Laravel (Fase 1/2) dibangun.
 *
 * Endpoints (selaras docs/ARCHITECTURE.md §4):
 *   GET    /api/v1/menus             -> { data: MenuItem[] }
 *   PUT    /api/v1/menus/sync         -> { ok: true }
 *   POST   /api/v1/menus              -> MenuItem
 *   DELETE /api/v1/menus/:id          -> { ok: true }
 *   GET    /api/v1/event-gallery      -> { data: EventPhoto[] }
 *   POST   /api/v1/event-gallery      -> EventPhoto
 *   DELETE /api/v1/event-gallery/:id  -> { ok: true }
 *   GET    /api/v1/orders             -> { data: OrderRecord[] }
 *   POST   /api/v1/orders             -> OrderRecord
 *
 * Jalankan: node server/restStub.js (default port 8080, override STUB_PORT)
 */
const http = require('http')

const PORT = process.env.STUB_PORT ? Number(process.env.STUB_PORT) : 8080
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'dwdaydzsh'

// In-memory store (reset tiap restart — stub only)
let menus = []
let events = []
let orders = []

function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(obj))
}
function readBody(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => {
      try {
        resolve(b ? JSON.parse(b) : {})
      } catch {
        resolve({})
      }
    })
  })
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') return send(res, 204, {})

  const url = req.url || ''
  const [path, query] = url.split('?')
  const parts = path.split('/').filter(Boolean) // ['api','v1','menus',':id?]

  // /api/v1/menus
  if (parts[1] === 'v1' && parts[2] === 'menus') {
    if (req.method === 'GET') return send(res, 200, { data: menus })
    if (req.method === 'PUT' && parts[3] === 'sync') {
      const body = await readBody(req)
      menus = Array.isArray(body.items) ? body.items : menus
      return send(res, 200, { ok: true })
    }
    if (req.method === 'POST') {
      const body = await readBody(req)
      const item = { ...body, id: body.id || `m_${Date.now()}` }
      menus.push(item)
      return send(res, 201, item)
    }
    if (req.method === 'DELETE' && parts[3]) {
      menus = menus.filter((m) => m.id !== parts[3])
      return send(res, 200, { ok: true })
    }
  }

  // /api/v1/event-gallery
  if (parts[1] === 'v1' && parts[2] === 'event-gallery') {
    if (req.method === 'GET') return send(res, 200, { data: events })
    if (req.method === 'POST') {
      const body = await readBody(req)
      const item = { ...body, id: body.id || `e_${Date.now()}` }
      events.push(item)
      return send(res, 201, item)
    }
    if (req.method === 'DELETE' && parts[3]) {
      events = events.filter((e) => e.id !== parts[3])
      return send(res, 200, { ok: true })
    }
  }

  // /api/v1/orders
  if (parts[1] === 'v1' && parts[2] === 'orders') {
    if (req.method === 'GET') return send(res, 200, { data: orders })
    if (req.method === 'POST') {
      const body = await readBody(req)
      const item = { ...body, id: body.id || `o_${Date.now()}` }
      orders.push(item)
      return send(res, 201, item)
    }
  }

  send(res, 404, { error: 'not found', path })
})

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[stub] REST stub jalan di http://localhost:${PORT} (menus/event-gallery/orders)`)
  })
}

module.exports = { server }
