"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryUIProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  titleEn?: string
  locale?: string
}

export function ErrorBoundaryUI({ error, reset, title, titleEn, locale = "ar" }: ErrorBoundaryUIProps) {
  const isAr = locale === "ar"

  useEffect(() => {
    console.error("[Wisal] Unhandled error:", error)
  }, [error])

  const heading = isAr
    ? (title ?? "حدث خطأ ما")
    : (titleEn ?? title ?? "Something went wrong")

  const body = error.message || (isAr
    ? "حدث خطأ غير متوقع. حاول إعادة تحميل هذا القسم."
    : "An unexpected error occurred. Try reloading this section.")

  return (
    <div className="flex flex-col items-center justify-center min-h-80 gap-4 p-6 text-center">
      <div className="flex items-center justify-center size-14 rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h2 className="text-base font-semibold text-foreground">{heading}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono mt-1">ref: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RefreshCw className="size-3.5" aria-hidden="true" />
        {isAr ? "إعادة المحاولة" : "Try again"}
      </button>
    </div>
  )
}
