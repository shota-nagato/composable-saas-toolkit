import * as React from 'react'
import { cn } from '../lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active border border-transparent',
  outline:
    'bg-surface border border-border text-foreground hover:bg-surface-hover active:bg-surface-active hover:border-border-hover',
  ghost:
    'bg-transparent border border-transparent text-foreground hover:bg-surface-hover active:bg-surface-active',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-active border border-transparent',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-base',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset',
          'disabled:pointer-events-none disabled:opacity-50',
          'cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {startIcon}
        {children}
        {endIcon}
      </button>
    )
  },
)
Button.displayName = 'Button'

export { Button }
