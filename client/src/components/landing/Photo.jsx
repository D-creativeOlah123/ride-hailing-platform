import { useState } from 'react'
import { LogoMark } from '../Logo'

/**
 * Responsive landing photo. Takes a descriptor from landingContent.photo().
 * - srcset with the small and large WebP, explicit width/height (no layout shift)
 * - lazy by default; pass priority for the LCP image
 * - if the file is missing, falls back to a branded gradient so the layout still holds
 */
export default function Photo({ image, sizes = '100vw', priority = false, className = '', imgClassName = '', style }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-accent/80 via-accent/50 to-surface-3 ${className}`}
        role={image.alt ? 'img' : undefined}
        aria-label={image.alt || undefined}
        style={style}
      >
        <LogoMark className="h-10 w-10 opacity-80" />
      </div>
    )
  }

  return (
    <img
      src={image.src}
      srcSet={`${image.srcSm} ${image.smWidth}w, ${image.src} ${image.width}w`}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${className} ${imgClassName}`}
      style={style}
    />
  )
}
