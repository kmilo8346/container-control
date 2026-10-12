import { useEffect, useState } from 'react'
import { galleryClient } from '@/clients/gallery-client'
import type { Painting } from '@/clients/gallery-client'

export type Run = { id: string; painting: string; status: string; closed?: boolean }
export const key = 'container-control-live-painting'
export function readRun(): Run | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as Run | null
  } catch {
    return null
  }
}
export function usePaintingSelection() {
  const [run, setRun] = useState<Run | null>(null)
  useEffect(() => {
    const sync = () => setRun(readRun())
    window.addEventListener('storage', sync)
    window.addEventListener('painting-selection', sync)
    return () => {
      window.removeEventListener('painting-selection', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return { run }
}
export function useCatalog() {
  const [paintings, setPaintings] = useState<Painting[]>([])
  const [catalogError, setError] = useState('')
  useEffect(() => {
    void galleryClient
      .listPaintings()
      .then(setPaintings)
      .catch((e) => setError(e.message))
  }, [])
  return { paintings, catalogError }
}
