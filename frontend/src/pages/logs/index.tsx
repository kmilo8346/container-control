import { PageHeading } from '@/components/page-heading'
import { ErrorMessage } from '@/components/error-message'
import { LogsPanel } from '@/components/logs-panel'
import { Link, useSearchParams } from 'react-router-dom'
import { useDeploymentLogs } from '@/hooks/use-deployment-logs'

export function PaintingLogsPage() {
  const [params] = useSearchParams()
  const deploymentId = params.get('id') ?? undefined
  const { raw, status, error } = useDeploymentLogs(
    deploymentId,
    params.get('painting') ?? undefined,
  )
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-12">
      <PageHeading title="Painting logs" />
      <p className="text-sm text-muted-foreground">
        {deploymentId ? status || 'Loading…' : 'No deployment selected'} · Refreshes every 5 seconds
      </p>
      <ErrorMessage
        message={deploymentId ? error : 'Open logs from a painting to select its deployment.'}
      />
      <LogsPanel text={raw.join('\n')} />
      <Link className="text-primary underline" to="/">
        Back to gallery
      </Link>
    </main>
  )
}
