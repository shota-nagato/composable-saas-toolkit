import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '../../lib/auth'

export const Route = createFileRoute('/org/select')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: OrgSelectPage,
})

function OrgSelectPage() {
  const { data: orgs, isPending } = authClient.useListOrganizations()
  const [selecting, setSelecting] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSelect(orgId: string) {
    setSelecting(orgId)
    try {
      await authClient.organization.setActive({ organizationId: orgId })
      await navigate({ to: '/' })
    } catch {
      setSelecting(null)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">
            Select a workspace
          </h1>
          <p className="mt-1 text-sm text-muted">
            Choose a workspace to continue
          </p>
        </div>

        {isPending ? (
          <div className="text-center text-sm text-muted">Loading...</div>
        ) : (
          <div className="space-y-2">
            {orgs?.map((org) => (
              <button
                key={org.id}
                type="button"
                disabled={selecting !== null}
                onClick={() => handleSelect(org.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {org.name}
                  </div>
                  <div className="truncate text-xs text-muted">{org.slug}</div>
                </div>
                {selecting === org.id && (
                  <div className="text-xs text-muted">...</div>
                )}
              </button>
            ))}
            {orgs?.length === 0 && (
              <p className="text-center text-sm text-muted">
                No workspaces found. Ask an admin to invite you.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
