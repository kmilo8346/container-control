import { PaintingCard } from '@/components/painting-card'
import { PaintingIdentity } from '@/components/painting-identity'
import { GalleryToolbar } from '@/components/gallery-toolbar'
import { PaintingActions } from '@/components/painting-actions'
import { PageHeading } from '@/components/page-heading'
import { ErrorMessage } from '@/components/error-message'
import { useDeploymentLogs } from '@/hooks/use-deployment-logs'
import { galleryClient } from '@/clients/gallery-client'
import { useEffect, useState } from 'react'
import { AnsiArt } from '@/components/ansi-art'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import type { Run } from './hooks'
import { key, readRun, useCatalog, usePaintingSelection } from './hooks'

export function GalleryPage() {
  const { paintings, catalogError } = useCatalog()
  const [busy, setBusy] = useState(false)
  const [pendingPainting, setPendingPainting] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [search, setSearch] = useState('')
  const filtered = paintings.filter((p) =>
    `${p.title} ${p.artist}`.toLowerCase().includes(search.toLowerCase()),
  )
  const { run } = usePaintingSelection()
  const active: Run | null = pendingPainting
    ? { id: '', painting: pendingPainting, status: 'Starting' }
    : run && !run.closed
      ? run
      : null
  const painting = paintings.find((p) => p.id === active?.painting)
  const { lines, error, complete, status } = useDeploymentLogs(
    active?.id || undefined,
    active?.painting,
  )
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(0)
  }, [active?.id, active?.painting])
  useEffect(() => {
    if (count >= lines.length) return
    const timer = window.setTimeout(() => setCount((c) => c + 1), 100)
    return () => clearTimeout(timer)
  }, [count, lines.length])
  async function start(id: string) {
    if (busy) return
    setPendingPainting(id)
    setCount(0)
    setBusy(true)
    setActionError('')
    try {
      const next = await galleryClient.createDeployment(id)
      localStorage.setItem(key, JSON.stringify({ ...next, painting: id }))
      window.dispatchEvent(new Event('painting-selection'))
    } catch (e) {
      setActionError((e as Error).message)
    } finally {
      setPendingPainting(null)
      setBusy(false)
    }
  }
  function close() {
    if (!active) return
    // Keep the browser's painting identity so recovery can reopen the same artwork.
    localStorage.setItem(key, JSON.stringify({ ...active, closed: true }))
    window.dispatchEvent(new Event('painting-selection'))
    setActionError('')
  }
  async function recover() {
    setBusy(true)
    setActionError('')
    try {
      const deployments = await galleryClient.listDeployments()
      const current = deployments.find((d) =>
        ['SUCCESS', 'BUILDING', 'DEPLOYING', 'QUEUED', 'WAITING', 'SLEEPING'].includes(d.status),
      )
      if (!current) throw new Error('No active painting found.')
      const logs = await galleryClient.getLogs(current.id)
      const marker = logs.deploymentLogs
        .flatMap((l) => l.message.split('\n'))
        .find((l) => l === 'PAINTING_START' || l.startsWith('PAINTING_START:'))
      if (!marker)
        throw new Error(
          'The running deployment has not identified its painting yet. Try again shortly.',
        )
      localStorage.setItem(
        key,
        JSON.stringify({
          ...current,
          closed: false,
          painting:
            readRun()?.id === current.id ? readRun()!.painting : (marker.split(':')[1] ?? ''),
        }),
      )
      window.dispatchEvent(new Event('painting-selection'))
    } catch (e) {
      setActionError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <PageHeading
        eyebrow="Railway painting gallery"
        title="A gallery, painted in logs."
        description="Choose a painting to start a new deployment."
      />

      <ErrorMessage message={actionError || catalogError || error} />
      {busy && <p role="status">Working on your container…</p>}
      {active && (
        <a
          href="#painting-workspace"
          className="sticky top-0 z-20 block rounded-lg border bg-card p-3 text-sm lg:hidden"
        >
          {painting?.title ?? 'Painting'} · {status || 'Starting'} · View painting ↑
        </a>
      )}
      <div
        className={`grid items-start gap-6 ${active ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]' : ''}`}
      >
        <section
          className="order-2 space-y-4 lg:order-1 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto lg:pr-2"
          aria-label="Painting collection"
        >
          <GalleryToolbar
            count={filtered.length}
            total={paintings.length}
            search={search}
            onSearch={setSearch}
          />
          {active && (
            <p className="text-sm text-primary">
              Selecting another painting replaces the current deployment.
            </p>
          )}
          <div
            className={`grid gap-4 sm:grid-cols-2 ${active ? 'xl:grid-cols-2' : 'lg:grid-cols-3 xl:grid-cols-4'}`}
          >
            {filtered.map((p) => (
              <PaintingCard
                key={p.id}
                painting={p}
                busy={busy}
                onPaint={(id) => {
                  void start(id)
                }}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-8 text-muted-foreground">No artworks match your search.</p>
          )}
          <p className="text-xs text-muted-foreground">
            The card and painting workspace use the same source artwork.
          </p>
          {!active && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                void recover()
              }}
            >
              Find running painting
            </Button>
          )}
        </section>
        {active && (
          <aside
            id="painting-workspace"
            className="order-1 min-w-0 space-y-4 scroll-mt-16 lg:sticky lg:top-6 lg:order-2"
          >
            {active && (
              <Card className="service-card">
                <CardHeader>
                  <PaintingIdentity painting={painting} />
                  <CardDescription role="status">
                    {pendingPainting
                      ? `Starting ${painting?.title ?? 'painting'}…`
                      : error
                        ? error
                        : complete && count === lines.length
                          ? 'Painting complete. Container remains running.'
                          : `Painting ${painting?.title ?? ''}… ${status}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <PaintingActions
                    deploymentId={active.id}
                    paintingId={active.painting}
                    busy={busy}
                    onClose={close}
                  />
                  <div className="max-h-[60vh] overflow-auto rounded-lg border bg-background p-4">
                    {pendingPainting || !lines.length ? (
                      <p className="text-sm text-muted-foreground">Preparing the canvas…</p>
                    ) : (
                      <AnsiArt text={lines.slice(0, count).join('\n')} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {count} / {lines.length} lines · Status and logs refresh every 5 seconds.
                  </p>
                </CardContent>
              </Card>
            )}
          </aside>
        )}
      </div>
    </main>
  )
}
