export function parsePaintingOutput(output: string[], painting?: string) {
  const legacyMarker = output.find((line) => line.startsWith('PAINTING_START:'))

  if (painting && legacyMarker && legacyMarker !== `PAINTING_START:${painting}`) {
    throw new Error('The runner printed a different painting. Start this painting again.')
  }

  const start = output.findIndex(
    (line) => line === 'PAINTING_START' || line === `PAINTING_START:${painting}`,
  )
  const end = output.findIndex(
    (line, index) =>
      index > start && (line === 'PAINTING_END' || line === `PAINTING_END:${painting}`),
  )
  const content = output.slice(start + 1, end < 0 ? undefined : end)

  // Railway can omit the first log records. Chafa's colored block rows still identify artwork.
  const lines = content.filter((line) => {
    if (start < 0) return line.includes('\u001b[38;2;') && line.includes('▄')

    return (
      !line.startsWith('PAINTING_') &&
      !['Starting Container', 'Stopping Container'].includes(line.trim())
    )
  })

  return { lines, complete: end >= 0 && lines.length > 0 }
}
