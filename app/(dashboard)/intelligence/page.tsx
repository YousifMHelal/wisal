import type { Metadata } from "next"

export const metadata: Metadata = { title: "Wisal Intelligence" }

export default function IntelligencePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Wisal Intelligence</h1>
      <p className="text-muted-foreground text-sm">Phase 4 widgets coming next.</p>
    </div>
  )
}
