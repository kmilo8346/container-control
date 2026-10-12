export function LogsPanel({ text }: { text: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card p-5">
      <pre className="font-mono text-xs leading-4">{text || 'No logs yet.'}</pre>
    </div>
  )
}
