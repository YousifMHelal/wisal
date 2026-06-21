"use client"

import { ErrorBoundaryUI } from "@/components/shell/error-boundary"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ErrorBoundaryUI error={error} reset={reset} title="Application error" />
      </body>
    </html>
  )
}
