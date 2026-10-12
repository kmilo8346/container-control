import { useMemo } from 'react'
import Convert from 'ansi-to-html'

export function AnsiArt({ text }: { text: string }) {
  const html = useMemo(
    () =>
      new Convert({ escapeXML: true, fg: '#eee', bg: '#13111c' }).toHtml(
        text.replace(
          /\x1b\[38;2;(\d+);(\d+);(\d+);48;2;(\d+);(\d+);(\d+)m/g,
          '\x1b[38;2;$1;$2;$3m\x1b[48;2;$4;$5;$6m',
        ),
      ),
    [text],
  )
  return (
    <pre
      className="font-mono text-[8px] leading-[8px] sm:text-[10px] sm:leading-[10px]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
