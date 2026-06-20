import type { Metadata } from "next"

export const metadata: Metadata = { title: "Executive Rollup" }

export default function ExecutivePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Executive Rollup</h1>
      <p className="text-muted-foreground text-sm">Phase 7 widgets coming next.</p>
    </div>
  )
}
