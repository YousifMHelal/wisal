"use client"

import { ErrorBoundaryUI } from "@/components/shell/error-boundary"

export default function ExecutiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundaryUI error={error} reset={reset} title="فشل تحميل الملخص التنفيذي" />
}
