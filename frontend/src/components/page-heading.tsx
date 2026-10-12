export function PageHeading({
  title,
  eyebrow,
  description,
}: {
  title: string
  eyebrow?: string
  description?: string
}) {
  return (
    <div>
      {eyebrow && <p className="mb-3 text-sm text-primary">{eyebrow}</p>}
      <h1 className="page-heading text-4xl">{title}</h1>
      {description && <p className="mt-4 text-muted-foreground">{description}</p>}
    </div>
  )
}
