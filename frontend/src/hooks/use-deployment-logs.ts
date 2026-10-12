import { useEffect, useState } from 'react'
import { galleryClient } from '@/clients/gallery-client'

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
        const legacyMarker = output.find((line) => line.startsWith('PAINTING_START:'))
        if (legacyMarker && legacyMarker !== `PAINTING_START:${painting}`) {
          throw new Error(
            'The runner printed a different painting. Set its Docker image to kmilo8346/painting-runner:v3 in Railway and start this painting again.',
          )
        }
        const start = output.findIndex(
          (line) => line === 'PAINTING_START' || line === `PAINTING_START:${painting}`,
        )
        const end = output.findIndex(
          (line, i) =>
            i > start && (line === 'PAINTING_END' || line === `PAINTING_END:${painting}`),
        )
        if (active) {
          setStatus(deployment.status)
          setError('')
          setRaw([
            '--- Build logs ---',
            ...logs.buildLogs.map((l) => l.message),
            '--- Runtime logs ---',
            ...output,
          ])
          setLines(
            start < 0
              ? []
              : output
                  .slice(start + 1, end < 0 ? undefined : end)
                  .filter(
                    (l) =>
                      !l.startsWith('PAINTING_') &&
                      !['Starting Container', 'Stopping Container'].includes(l.trim()),
                  ),
          )
          setComplete(end >= 0)
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
