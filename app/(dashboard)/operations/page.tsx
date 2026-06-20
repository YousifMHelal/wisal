import type { Metadata } from "next"

export const metadata: Metadata = { title: "Operations & Integrations" }

export default function OperationsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Operations & Integrations</h1>
      <p className="text-muted-foreground text-sm">Phase 8 widgets coming next.</p>
    </div>
  )
}
