import { AnsiArt } from './chafa-preview'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { API_URL } from './auth'
type Painting = { id: string; title: string; artist: string; imageUrl: string; image: string; imagePosition: string }
type Run = { id: string; painting: string; status: string; closed?: boolean }
type Log = { timestamp: string; message: string; severity: string }
const key = 'container-control-live-painting'
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json' } })
  const body = await response.json()
  if (!response.ok) throw new Error(response.status === 401 ? 'Sign in first.' : body.message ?? 'Request failed')
  return body as T
}
function readRun(): Run | null { try { return JSON.parse(localStorage.getItem(key) ?? 'null') as Run | null } catch { return null } }
function useRun() {
  const [run, setRun] = useState<Run | null>(null)
  useEffect(() => {
    const sync = () => setRun(readRun())
    window.addEventListener('storage', sync)
    window.addEventListener('painting-selection', sync)
    return () => { window.removeEventListener('painting-selection', sync); window.removeEventListener('storage', sync) }
  }, [])
  return { run }
}
function useCatalog() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [catalogError, setError] = useState('')
  useEffect(() => { void api<Painting[]>('/paintings').then(setPaintings).catch(e => setError(e.message)) }, [])
  return { paintings, catalogError }
}
function useLogs(id?: string, painting?: string) {
  const [lines, setLines] = useState<string[]>([])
  const [raw, setRaw] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  useEffect(() => {
    setLines([]); setRaw([]); setError(''); setComplete(false)
    if (!id) return
    let active = true
    let timer: number
    async function poll() {
      try {
        const deployment = await api<{status:string}>(`/deployments/${id}`)
        const logs = await api<{buildLogs:Log[];deploymentLogs:Log[]}>(`/deployments/${id}/logs`)
        const output = logs.deploymentLogs.flatMap(l => l.message.split('\n'))
        const legacyMarker = output.find(line => line.startsWith('PAINTING_START:'))
        if (legacyMarker && legacyMarker !== `PAINTING_START:${painting}`) {
          throw new Error('The runner printed a different painting. Set its Docker image to kmilo8346/painting-runner:v3 in Railway and start this painting again.')
        }
        const start = output.findIndex(line => (line === 'PAINTING_START' || line === `PAINTING_START:${painting}`))
        const end = output.findIndex((line,i) => i > start && (line === 'PAINTING_END' || line === `PAINTING_END:${painting}`))
        if (active) {
          setStatus(deployment.status); setError('')
          setRaw(['--- Build logs ---', ...logs.buildLogs.map(l => l.message), '--- Runtime logs ---', ...output])
          setLines(start < 0 ? [] : output.slice(start+1,end < 0 ? undefined : end).filter(l => !l.startsWith('PAINTING_') && !['Starting Container', 'Stopping Container'].includes(l.trim())))
          setComplete(end >= 0)
        }
      } catch (e) { if(active) setError((e as Error).message) }
      if(active) timer = window.setTimeout(() => { void poll() },5000)
    }
    void poll()
    return () => { active=false; clearTimeout(timer) }
  },[id,painting])
  return { lines, raw, status, error, complete }
}

export function Gallery() {
  const { paintings, catalogError } = useCatalog()
  const [busy, setBusy] = useState(false)
  const [pendingPainting, setPendingPainting] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [search, setSearch] = useState('')
  const filtered = paintings.filter(p => `${p.title} ${p.artist}`.toLowerCase().includes(search.toLowerCase()))
  const { run } = useRun()
  const active: Run | null = pendingPainting ? { id: '', painting: pendingPainting, status: 'Starting' } : run && !run.closed ? run : null
  const painting = paintings.find(p => p.id === active?.painting)
  const { lines, error, complete, status } = useLogs(active?.id || undefined, active?.painting)
  const [count, setCount] = useState(0)
  useEffect(() => { setCount(0) }, [active?.id, active?.painting])
  useEffect(() => {
    if (count >= lines.length) return
    const timer = window.setTimeout(() => setCount(c => c + 1), 100)
    return () => clearTimeout(timer)
  }, [count, lines.length])
  async function start(id: string) {
    if (busy) return
    setPendingPainting(id); setCount(0); setBusy(true); setActionError('')
    try {
      const next = await api<{id:string;status:string}>('/deployments', { method: 'POST', body: JSON.stringify({ paintingId: id }) })
      localStorage.setItem(key, JSON.stringify({ ...next, painting: id }))
      window.dispatchEvent(new Event('painting-selection'))
    } catch(e) { setActionError((e as Error).message) } finally { setPendingPainting(null); setBusy(false) }
  }
  function close() {
    if (!active) return
    localStorage.removeItem(key)
    window.dispatchEvent(new Event('painting-selection'))
    setActionError('')
  }
  async function recover() {
    setBusy(true); setActionError('')
    try {
      const deployments = await api<{id:string;status:string}[]>('/deployments')
      const current = deployments.find(d => ['SUCCESS','BUILDING','DEPLOYING','QUEUED','WAITING','SLEEPING'].includes(d.status))
      if (!current) throw new Error('No active painting found.')
      const logs = await api<{deploymentLogs:Log[]}>(`/deployments/${current.id}/logs`)
      const marker = logs.deploymentLogs.flatMap(l => l.message.split('\n')).find(l => l === 'PAINTING_START' || l.startsWith('PAINTING_START:'))
      if (!marker) throw new Error('The running deployment has not identified its painting yet. Try again shortly.')
      localStorage.setItem(key, JSON.stringify({...current, painting: readRun()?.id === current.id ? readRun()!.painting : marker.split(':')[1] ?? ''}))
      window.dispatchEvent(new Event('painting-selection'))
    } catch(e) { setActionError((e as Error).message) } finally { setBusy(false) }
  }
  return <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
    <div><p className="mb-3 text-sm text-primary">Railway painting gallery</p><h1 className="page-heading text-4xl">A gallery, painted in logs.</h1><p className="mt-4 text-muted-foreground">Choose a painting to start a new deployment.</p></div>

    {(actionError || catalogError || error) && <p role="alert" className="text-destructive">{actionError || catalogError || error}</p>}
    {busy && <p role="status">Working on your container…</p>}
    {active && <a href="#painting-workspace" className="sticky top-0 z-20 block rounded-lg border bg-card p-3 text-sm lg:hidden">{painting?.title ?? 'Painting'} · {status || 'Starting'} · View painting ↑</a>}
    <div className={`grid items-start gap-6 ${active ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]' : ''}`}>
    <section className="order-2 space-y-4 lg:order-1 lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto lg:pr-2" aria-label="Painting collection">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-medium">The collection</h2><p className="text-sm text-muted-foreground">{filtered.length} of 10 artworks · 10 ready to paint</p></div><input aria-label="Search paintings" placeholder="Search title or artist…" value={search} onChange={event => setSearch(event.target.value)} className="h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-72" /></div>
      {active && <p className="text-sm text-primary">Selecting another painting replaces the current deployment.</p>}
      <div className={`grid gap-4 sm:grid-cols-2 ${active ? 'xl:grid-cols-2' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>{filtered.map((p) => {
        const ready = true
        return <Card key={p.id} className="service-card"><CardHeader>
          <div role="img" aria-label={`${p.title} by ${p.artist}`} className="mb-3 aspect-square rounded-lg border bg-cover" style={{ backgroundImage: `url(${p.imageUrl})`, backgroundSize: 'cover', backgroundPosition: p.id === 'mona-lisa' ? 'center 25%' : 'center' }} />
          <CardTitle>{p.title}</CardTitle><CardDescription>{p.artist}</CardDescription></CardHeader><CardContent><Button disabled={busy || !ready} onClick={() => { void start(p.id) }}>{ready ? `Paint ${p.title}` : 'Preview coming soon'}</Button></CardContent></Card>
      })}</div>
      {filtered.length === 0 && <p className="py-8 text-muted-foreground">No artworks match your search.</p>}
      <p className="text-xs text-muted-foreground">The card and painting workspace use the same source artwork.</p>
    </section>
    {active && <aside id="painting-workspace" className="order-1 min-w-0 space-y-4 scroll-mt-16 lg:sticky lg:top-6 lg:order-2">
    {active && <Card className="service-card"><CardHeader><div className="flex items-center gap-4">{painting && <div role="img" aria-label={`Preview of ${painting.title}`} className="size-20 shrink-0 rounded-lg border" style={{ backgroundImage: `url(${painting.imageUrl})`, backgroundSize: 'cover', backgroundPosition: painting.id === 'mona-lisa' ? 'center 25%' : 'center' }} />}<div><CardTitle>{painting?.title ?? 'Active painting'}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{painting?.artist}</p></div></div><CardDescription role="status">{pendingPainting ? `Starting ${painting?.title ?? 'painting'}…` : error ? error : complete && count === lines.length ? 'Painting complete. Container remains running.' : `Painting ${painting?.title ?? ''}… ${status}`}</CardDescription></CardHeader><CardContent className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">{active.id ? <Link className="text-sm text-primary underline" to={`/paintings/logs?id=${active.id}&painting=${active.painting}`} target="_blank" rel="noopener noreferrer">See how ↗</Link> : <span className="text-sm text-muted-foreground">Logs available once deployment starts</span>}<Button variant="outline" disabled={busy} onClick={() => { void close() }}>Close painting</Button></div>
      <div className="max-h-[60vh] overflow-auto rounded-lg border bg-background p-4">{pendingPainting || !lines.length ? <p className="text-sm text-muted-foreground">Preparing the canvas…</p> : <AnsiArt text={lines.slice(0, count).join('\n')} />}</div>
      <p className="text-xs text-muted-foreground">{count} / {lines.length} lines · Status and logs refresh every 5 seconds.</p>
    </CardContent></Card>}
    {!active && <Button variant="outline" disabled={busy} onClick={() => { void recover() }}>Find running painting</Button>}

    </aside>}
    </div>
  </main>
}

export function GalleryLogs() {
  const [params] = useSearchParams()
  const { raw, status, error } = useLogs(params.get('id') ?? undefined, params.get('painting') ?? undefined)
  return <main className="mx-auto max-w-5xl space-y-6 px-6 py-12"><h1 className="page-heading text-3xl">Painting logs</h1><p className="text-sm text-muted-foreground">{status || 'Loading…'} · Refreshes every 5 seconds</p>{error && <p role="alert">{error}</p>}<div className="overflow-x-auto rounded-xl border bg-card p-5"><pre className="font-mono text-xs leading-4">{raw.join('\n') || 'No logs yet.'}</pre></div><Link className="text-primary underline" to="/">Back to gallery</Link></main>
}
