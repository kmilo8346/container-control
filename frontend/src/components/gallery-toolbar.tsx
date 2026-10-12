import { Input } from '@/components/ui/input'

export function GalleryToolbar({
  count,
  total,
  search,
  onSearch,
}: {
  count: number
  total: number
  search: string
  onSearch: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-lg font-medium">The collection</h2>
        <p className="text-sm text-muted-foreground">
          {count} of {total} artworks
        </p>
      </div>
      <Input
        aria-label="Search paintings"
        placeholder="Search title or artist…"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        className="sm:w-72"
      />
    </div>
  )
}
