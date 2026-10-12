import type { Painting } from '@/clients/gallery-client'
import { CardTitle } from '@/components/ui/card'
import { PaintingThumbnail } from '@/components/painting-thumbnail'

export function PaintingIdentity({ painting }: { painting?: Painting }) {
  return (
    <div className="flex items-center gap-4">
      {painting && <PaintingThumbnail painting={painting} small />}
      <div>
        <CardTitle>{painting?.title ?? 'Active painting'}</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{painting?.artist}</p>
      </div>
    </div>
  )
}
