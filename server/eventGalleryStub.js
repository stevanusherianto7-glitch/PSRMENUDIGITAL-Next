/**
 * STUB Backend — mensimulasikan endpoint Laravel `/api/event-gallery/photo`.
 * Mirip menuUploadStub.js. Digunakan untuk dev/bukti real-mode event gallery.
 *
 * POST {BASE}/api/event-gallery/photo (multipart: image, title)
 * <- 200 { public_id: "events/<slug>_<rand>", url: "https://res.cloudinary.com/dwdaydzsh/image/upload/events/<slug>_<rand>" }
 */
const http = require('http')

const PORT = process.env.STUB_PORT ? Number(process.env.STUB_PORT) : 8098
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'dwdaydzsh'

function slugify(name) {
  return (
    (name || 'event')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'event'
  )
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  if (req.method === 'POST' && req.url === '/api/event-gallery/photo') {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      let name = 'event'
      try {
        const json = JSON.parse(body)
        if (json.title) name = json.title
      } catch (_) {
        /* multipart, abaikan */
      }
      const rand = Math.random().toString(36).slice(2, 8)
      const publicId = `events/${slugify(name)}_${rand}`
      const url = `https://res.cloudinary.com/${CLOUD}/image/upload/${publicId}`
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ public_id: publicId, url }))
    })
    return
  }
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'not found' }))
})

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[stub] event-gallery stub jalan di http://localhost:${PORT}/api/event-gallery/photo`)
  })
}

module.exports = { server, slugify }
