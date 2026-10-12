import { useEffect, useMemo, useState } from 'react'
import Convert from 'ansi-to-html'
import { Button } from '@/components/ui/button'

export function AnsiArt({ text }: { text: string }) {
  const html = useMemo(() => new Convert({ escapeXML: true, fg: '#eee', bg: '#13111c' }).toHtml(text.replace(/\x1b\[38;2;(\d+);(\d+);(\d+);48;2;(\d+);(\d+);(\d+)m/g, '\x1b[38;2;$1;$2;$3m\x1b[48;2;$4;$5;$6m')), [text])
  return <pre className="font-mono text-[8px] leading-[8px] sm:text-[10px] sm:leading-[10px]" dangerouslySetInnerHTML={{ __html: html }} />
}
export function ChafaPreview() {
  const [lines, setLines] = useState<string[]>([])
  const [count, setCount] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    void fetch('/paintings/chafa-preview.ansi').then(r => { if (!r.ok) throw new Error('Preview output is not available yet.'); return r.text() }).then(text => setLines(text.split('\n').filter(l => !l.startsWith('PAINTING_')))).catch(e => setError(e.message))
  }, [])
  useEffect(() => {
    if (count >= lines.length) return
    const timer = window.setTimeout(() => setCount(n => n + 1), 80)
    return () => clearTimeout(timer)
  }, [count, lines.length])
  return <main className="mx-auto max-w-5xl space-y-5 px-6 py-10"><p className="text-primary">Chafa · actual container output</p><h1 className="page-heading text-4xl">Girl with a Pearl Earring</h1><p className="text-muted-foreground">Color Unicode art, revealed line by line.</p>{error && <p role="alert">{error}</p>}<div className="overflow-auto rounded-xl border bg-[#13111c] p-5"><AnsiArt text={lines.slice(0,count).join('\n')} /></div><Button onClick={() => setCount(0)}>Replay painting</Button></main>
}
