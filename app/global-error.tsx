"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#0f172a", color: "#f1f5f9" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "1rem", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>خطأ غير متوقع</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{error.message ?? "Something went wrong"}</p>
          <button
            onClick={reset}
            style={{ padding: "0.5rem 1.25rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "0.375rem", cursor: "pointer" }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  )
}
