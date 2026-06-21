"use client"

import { ErrorBoundaryUI } from "@/components/shell/error-boundary"

export default function LiveOperationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundaryUI error={error} reset={reset} title="Live Operations failed to load" />
}
