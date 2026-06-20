import type { Metadata } from "next"

export const metadata: Metadata = { title: "Workforce & Quality" }

export default function WorkforcePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Workforce & Quality</h1>
      <p className="text-muted-foreground text-sm">Phase 6 widgets coming next.</p>
    </div>
  )
}
