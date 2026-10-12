import { useEffect, useState } from 'react'
import { galleryClient } from '@/clients/gallery-client'
import { parsePaintingOutput } from './painting-output'

export function useDeploymentLogs(id?: string, painting?: string) {
  const [lines, setLines] = useState<string[]>([])
  const [raw, setRaw] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  useEffect(() => {
    setLines([])
    setRaw([])
    setError('')
    setStatus('')
    setComplete(false)
    if (!id) return
    let active = true
    let timer: number
    async function poll() {
      try {
        const deployment = await galleryClient.getDeployment(id!)
        const logs = await galleryClient.getLogs(id!)
        const output = logs.deploymentLogs.flatMap((l) => l.message.split('\n'))
        const artwork = parsePaintingOutput(output, painting)
        if (active) {
          setStatus(deployment.status)
          setError('')
          setRaw([
            '--- Build logs ---',
            ...logs.buildLogs.map((l) => l.message),
            '--- Runtime logs ---',
            ...output,
          ])
          setLines(artwork.lines)
          setComplete(artwork.complete)
        }
      } catch (e) {
        if (active) setError((e as Error).message)
      }
      if (active)
        timer = window.setTimeout(() => {
          void poll()
        }, 5000)
    }
    void poll()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [id, painting])
  return { lines, raw, status, error, complete }
}
