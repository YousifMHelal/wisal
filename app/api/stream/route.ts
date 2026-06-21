// SSE mock — sends a heartbeat every 30s so clients can poll-refresh live widgets.
// Clients listen and call router.refresh() on each tick.

export const runtime = "nodejs"

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      send(JSON.stringify({ type: "connected", ts: Date.now() }))

      const interval = setInterval(() => {
        try {
          send(JSON.stringify({ type: "tick", ts: Date.now() }))
        } catch {
          clearInterval(interval)
        }
      }, 30_000)

      // Clean up when client disconnects
      const cleanup = () => {
        clearInterval(interval)
        try { controller.close() } catch {}
      }

      // AbortSignal not easily accessible here; rely on client reconnect behaviour
      setTimeout(cleanup, 5 * 60 * 1000) // max 5 min per connection
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
