/**
 * STUB Backend — mensimulasikan endpoint Laravel `/api/menu/upload`.
 *
 * Ini BUKAN Laravel sungguhan. Digunakan untuk dev/bukti real-mode frontend
 * sebelum backend Laravel (Fase 3, docs/ROADMAP.md) dibangun.
 *
 * Kontrak (selaras docs/ARCHITECTURE.md §4.3):
 *   POST {BASE}/api/menu/upload  (multipart: image, name)
 *   <- 200 { public_id: "menu/<slug>_<rand>", url: "https://res.cloudinary.com/dwdaydzsh/image/upload/menu/<slug>_<rand>" }
 *
 * Jalankan: node server/menuUploadStub.js   (default port 8099)
 */
const http = require('http')

const PORT = process.env.STUB_PORT ? Number(process.env.STUB_PORT) : 8099
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'dwdaydzsh'

function slugify(name) {
  return (
    (name || 'menu')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'menu'
  )
}

const server = http.createServer((req, res) => {
  // CORS (dev)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method === 'POST' && req.url === '/api/menu/upload') {
    // Simulasi: baca body mentah (tidak parse multipart penuh, cukup cari field name)
    // Untuk stub, kita generate public_id dari query/random — di dunia nyata Laravel
    // memanggil Cloudinary SDK dan dapatkan public_id asli.
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      // Coba ambil name dari multipart atau raw json
      let name = 'menu'
      const m = body.match(/name["']?\s*;\s*(?:name=)?["']?([^"\r\n]+)/i)
      if (m) name = m[1].trim()
      try {
        const json = JSON.parse(body)
        if (json.name) name = json.name
      } catch (_) {
        /* body mungkin multipart, abaikan */
      }
      const rand = Math.random().toString(36).slice(2, 8)
      const publicId = `menu/${slugify(name)}_${rand}`
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
    console.log(`[stub] menu-upload stub jalan di http://localhost:${PORT}/api/menu/upload`)
  })
}

module.exports = { server, slugify }
