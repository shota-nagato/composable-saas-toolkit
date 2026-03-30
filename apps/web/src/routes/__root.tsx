import type { QueryClient } from '@tanstack/react-query'
import type { ErrorComponentProps } from '@tanstack/react-router'
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from '@tanstack/react-router'
import { Button, buttonVariants, cn } from '@toolkit/ui'
import { lazy } from 'react'

export interface RouterContext {
  queryClient: QueryClient
}

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : () => null

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: RootNotFound,
  errorComponent: RootError,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}

function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <p className="text-6xl font-bold text-foreground">404</p>
      <p className="mt-2 text-sm text-muted">Page not found</p>
      <Link
        to="/"
        className={cn('mt-6', buttonVariants('primary', 'md'))}
        autoFocus
      >
        Go home
      </Link>
    </div>
  )
}

function RootError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <p className="text-6xl font-bold text-foreground">Error</p>
      <p className="mt-2 text-sm text-muted">
        {error.message || 'An unexpected error occurred'}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} autoFocus>
          Try again
        </Button>
        <Link to="/" className={buttonVariants('outline', 'md')}>
          Go home
        </Link>
      </div>
    </div>
  )
}
