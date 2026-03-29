import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/docs/')({
  component: DocsPage,
})

function DocsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Docs</h1>
      <p className="text-sm text-muted">Documentation module coming soon.</p>
    </div>
  )
}
