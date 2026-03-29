import * as React from 'react'
import { cn } from '../lib/utils'

const sizeMap: Record<string, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
}

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null
  fallback: string
  size?: 'sm' | 'md'
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, fallback, size = 'md', ...props }, ref) => {
    const initials = fallback
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-primary-subtle font-medium text-primary',
          sizeMap[size],
          className,
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={fallback}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </span>
    )
  },
)
Avatar.displayName = 'Avatar'

export { Avatar }
