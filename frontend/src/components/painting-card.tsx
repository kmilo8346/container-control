import type { Painting } from '@/clients/gallery-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PaintingThumbnail } from '@/components/painting-thumbnail'

export function PaintingCard({
  painting,
  busy,
  onPaint,
}: {
  painting: Painting
  busy: boolean
  onPaint: (id: string) => void
}) {
  return (
    <Card className="service-card">
      <CardHeader>
        <PaintingThumbnail painting={painting} />
        <CardTitle>{painting.title}</CardTitle>
        <CardDescription>{painting.artist}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button disabled={busy} onClick={() => onPaint(painting.id)}>
          Paint {painting.title}
        </Button>
      </CardContent>
    </Card>
  )
}
