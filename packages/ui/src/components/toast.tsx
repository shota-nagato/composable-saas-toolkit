import * as React from 'react'
import { cn } from '../lib/utils'

type ToastVariant = 'default' | 'success' | 'destructive'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

const TOAST_DURATION = 3000
const ANIMATION_DURATION = 200

const variantClasses: Record<ToastVariant, string> = {
  default: 'border-border bg-surface text-foreground',
  success: 'border-success/30 bg-success-subtle text-foreground',
  destructive: 'border-destructive/30 bg-destructive-subtle text-foreground',
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setIsVisible(true))

    // Schedule exit
    const exitTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(toast.id), ANIMATION_DURATION)
    }, TOAST_DURATION)

    return () => {
      cancelAnimationFrame(enterTimer)
      clearTimeout(exitTimer)
    }
  }, [toast.id, onRemove])

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-md transition-all duration-200',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        variantClasses[toast.variant],
      )}
    >
      {toast.message}
    </div>
  )
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    (message: string, variant: ToastVariant = 'default') => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, message, variant }])
    },
    [],
  )

  const value = React.useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 pb-20 lg:pb-4">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext>
  )
}

function useToast(): ToastContextValue {
  const context = React.use(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export { ToastProvider, useToast }
export type { ToastVariant }
