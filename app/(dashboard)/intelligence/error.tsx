"use client"

import { ErrorBoundaryUI } from "@/components/shell/error-boundary"

export default function IntelligenceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundaryUI error={error} reset={reset} title="Wisal Intelligence failed to load" />
}
