import type { Painting } from '@/clients/gallery-client'

export function PaintingThumbnail({
  painting,
  small = false,
}: {
  painting: Painting
  small?: boolean
}) {
  return (
    <div
      role="img"
      aria-label={`${painting.title} by ${painting.artist}`}
      className={
        small ? 'size-20 shrink-0 rounded-lg border' : 'mb-3 aspect-square rounded-lg border'
      }
      style={{
        backgroundImage: `url(${painting.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: painting.id === 'mona-lisa' ? 'center 25%' : 'center',
      }}
    />
  )
}
