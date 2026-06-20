import type { Metadata } from "next"

export const metadata: Metadata = { title: "Live Operations" }

export default function LiveOperationsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Live Operations</h1>
      <p className="text-muted-foreground text-sm">Phase 3 widgets coming next.</p>
    </div>
  )
}
