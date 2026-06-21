"use client"

import { ErrorBoundaryUI } from "@/components/shell/error-boundary"

export default function GovernanceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundaryUI error={error} reset={reset} title="فشل تحميل الحوكمة والامتثال" />
}
