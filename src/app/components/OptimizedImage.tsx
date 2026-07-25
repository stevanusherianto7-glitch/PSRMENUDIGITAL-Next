import { useState } from 'react'
import { menuImageUrl } from '../../lib/cloudinary'

/**
 * Gambar menu yang dioptimasi: lazy-load + skeleton pulse + fallback ke SVG lokal
 * bila gagal load. `src` boleh berupa URL absolut (legacy Supabase) atau Cloudinary public_id
 * (diteruskan ke menuImageUrl).
 */
export function OptimizedImage({
  src,
  alt,
  className,
  width = 400,
}: {
  src: string
  alt: string
  className?: string
  width?: number
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  // High-end warm-beige themed gradient placeholder
  const placeholderSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23ece3d5"/><circle cx="50" cy="50" r="20" fill="%23a76d33" opacity="0.15"/></svg>`

  const imageUrl = menuImageUrl(src)

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#ece3d5] dark:bg-[#23120b]">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#ece3d5]/50 via-[#a76d33]/10 to-[#ece3d5]/50 animate-pulse z-10" />
      )}
      <img
        src={error ? placeholderSvg : imageUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-all duration-700 ease-out ${
          loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-30 scale-95 blur-sm'
        }`}
      />
    </div>
  )
}
