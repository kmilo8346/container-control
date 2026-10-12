import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function PaintingActions({
  deploymentId,
  paintingId,
  busy,
  onClose,
}: {
  deploymentId: string
  paintingId: string
  busy: boolean
  onClose: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {deploymentId ? (
        <Link
          className="text-sm text-primary underline"
          to={`/paintings/logs?id=${encodeURIComponent(deploymentId)}&painting=${encodeURIComponent(paintingId)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          See how ↗
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">Logs available once deployment starts</span>
      )}
      <Button variant="outline" disabled={busy} onClick={onClose}>
        Close painting
      </Button>
    </div>
  )
}
