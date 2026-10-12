import { useState } from 'react'
import { Box, Play, Square } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function Dashboard() {
  const [running, setRunning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <p className="mb-4 text-sm font-medium text-muted-foreground">Your infrastructure</p>
        <h1 className="page-heading text-4xl sm:text-6xl">Containers, under control.</h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">A simple place to start and stop your Railway containers.</p>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-sm font-medium">Containers</h2>
          <span className="text-xs text-muted-foreground">1 demo container</span>
        </div>
        <Card className="service-card mt-4">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-border bg-muted/50 p-3"><Box className="size-6 text-muted-foreground" /></div>
              <div>
                <CardTitle>hello-world</CardTitle>
                <CardDescription className="mt-1">Example service</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={running ? 'border-emerald-500/30 text-emerald-400' : 'text-muted-foreground'}>
              <span className={`mr-1 size-1.5 rounded-full ${running ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
              {running ? 'Running' : 'Stopped'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-lg border border-border bg-background/50 px-4 py-3 text-sm text-muted-foreground" role="status" aria-live="polite">
              {running ? 'Demo container is running.' : 'Demo container is stopped. Start it to preview the controls.'}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="h-11 rounded-lg border border-white/10 px-5" size="lg" disabled={running} onClick={() => setRunning(true)}><Play /> Start container</Button>
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger render={<Button variant="outline" className="h-11 rounded-lg px-5" size="lg" disabled={!running} />}><Square /> Stop container</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Stop hello-world?</AlertDialogTitle>
                    <AlertDialogDescription>This stops the local demo. No Railway service will be affected.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { setRunning(false); setConfirmOpen(false) }}>Stop container</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        <p className="mt-5 text-xs text-muted-foreground">Demo only · Railway is not connected yet. Changes reset when you reload.</p>
      </main>
    </div>
  )
}

