import type { ComponentProps } from 'react'
import { cn } from 'cn'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
