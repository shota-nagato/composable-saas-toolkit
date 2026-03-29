import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@toolkit/ui'
import { useState } from 'react'
import ChevronDownIcon from '../../assets/svg/actions/chevron-down.svg?react'

interface PropertyButtonProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  className?: string
  modal?: boolean
}

export function PropertyButton({
  icon,
  label,
  children,
  className,
  modal,
}: PropertyButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={modal}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground',
            open && 'bg-surface-hover text-foreground',
            className,
          )}
        >
          {icon}
          <span>{label}</span>
          <ChevronDownIcon className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
