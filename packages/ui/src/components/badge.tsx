import * as React from 'react'
import { cn } from '../lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'outline'
  size?: 'sm' | 'md'
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-surface-hover text-foreground',
  primary: 'bg-primary-subtle text-primary',
  destructive: 'bg-destructive-subtle text-destructive',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  outline: 'border border-border bg-transparent text-foreground',
}

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium leading-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Badge.displayName = 'Badge'

export { Badge }
