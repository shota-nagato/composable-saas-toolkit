import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Settings</h1>
      <p className="text-sm text-muted">Settings page coming soon.</p>
    </div>
  )
}
