import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

interface SidebarContextValue {
  isOpen: boolean
  isMobileOpen: boolean
  toggle: () => void
  setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const STORAGE_KEY = 'sidebar-open'

function getInitialOpen(): boolean {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === null ? true : stored === 'true'
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(getInitialOpen)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  const setMobileOpen = useCallback((open: boolean) => {
    setIsMobileOpen(open)
  }, [])

  const value = useMemo(
    () => ({ isOpen, isMobileOpen, toggle, setMobileOpen }),
    [isOpen, isMobileOpen, toggle, setMobileOpen],
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
