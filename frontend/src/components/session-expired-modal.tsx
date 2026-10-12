import { useEffect, useRef, useState } from 'react'
import { sessionExpiredEvent } from '@/clients/base-client'
import { Button } from '@/components/ui/button'

export function SessionExpiredModal() {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const expired = () => setOpen(true)
    window.addEventListener(sessionExpiredEvent, expired)
    return () => window.removeEventListener(sessionExpiredEvent, expired)
  }, [])
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
  }, [open])
  return (
    <dialog
      ref={dialog}
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-description"
      onCancel={(event) => event.preventDefault()}
      className="m-auto w-[calc(100%-3rem)] max-w-sm rounded-xl border bg-card p-6 text-foreground backdrop:bg-black/60"
    >
      <h2 id="session-expired-title" className="text-lg font-semibold">
        Your session expired
      </h2>
      <p id="session-expired-description" className="my-4 text-sm text-muted-foreground">
        Refresh the app to sign in again. Any running painting container will keep running.
      </p>
      <Button onClick={() => window.location.replace('/login')}>Refresh and sign in</Button>
    </dialog>
  )
}
