"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface Props {
  // fallback poll interval in ms if SSE unavailable
  pollMs?: number
}

export function LiveRefresh({ pollMs = 30_000 }: Props) {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let es: EventSource | null = null

    function startSSE() {
      es = new EventSource("/api/stream")

      es.addEventListener("message", () => {
        router.refresh()
      })

      es.addEventListener("error", () => {
        es?.close()
        es = null
        startPolling()
      })
    }

    function startPolling() {
      timerRef.current = setInterval(() => {
        router.refresh()
      }, pollMs)
    }

    if (typeof EventSource !== "undefined") {
      startSSE()
    } else {
      startPolling()
    }

    return () => {
      es?.close()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [router, pollMs])

  return null
}
