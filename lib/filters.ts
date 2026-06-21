import type { ReadonlyURLSearchParams } from "next/navigation"

export type DateRange = "live" | "today" | "7d" | "30d" | "custom"

export interface Filters {
  cluster: string | null   // cluster id string, null = all
  range: DateRange
  from: Date | null        // only set when range === "custom"
  to: Date | null
}

const VALID_RANGES: DateRange[] = ["live", "today", "7d", "30d", "custom"]

function parseRange(raw: string | null | undefined): DateRange {
  if (raw && VALID_RANGES.includes(raw as DateRange)) return raw as DateRange
  return "live"
}

function parseDate(raw: string | null | undefined): Date | null {
  if (!raw) return null
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

/** Parse filters from Next.js searchParams (server component). */
export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>
): Filters {
  const cluster = typeof searchParams.cluster === "string" ? searchParams.cluster : null
  const range = parseRange(typeof searchParams.range === "string" ? searchParams.range : null)
  const from = range === "custom" ? parseDate(typeof searchParams.from === "string" ? searchParams.from : null) : null
  const to = range === "custom" ? parseDate(typeof searchParams.to === "string" ? searchParams.to : null) : null
  return { cluster, range, from, to }
}

/** Parse filters from client-side URLSearchParams. */
export function parseFiltersFromURL(params: ReadonlyURLSearchParams): Filters {
  const cluster = params.get("cluster")
  const range = parseRange(params.get("range"))
  const from = range === "custom" ? parseDate(params.get("from")) : null
  const to = range === "custom" ? parseDate(params.get("to")) : null
  return { cluster, range, from, to }
}

/** Convert a DateRange to absolute from/to Date boundaries. */
export function resolveDateBounds(filters: Filters): { from: Date; to: Date } {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  // End of today — snapshots are seeded at fixed hours (08/12/16/20) which may be
  // later in the day than the current clock time; include the whole day so the
  // dashboard always has same-day data regardless of the hour it's viewed.
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  switch (filters.range) {
    case "live":
    case "today":
      return { from: startOfToday, to: endOfToday }
    case "7d":
      return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: endOfToday }
    case "30d":
      return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: endOfToday }
    case "custom":
      return {
        from: filters.from ?? startOfToday,
        to: filters.to ?? endOfToday,
      }
  }
}

/** Build a query-string fragment from filters (for URL updates). */
export function filtersToParams(filters: Partial<Filters>): string {
  const params = new URLSearchParams()
  if (filters.cluster) params.set("cluster", filters.cluster)
  if (filters.range && filters.range !== "live") params.set("range", filters.range)
  if (filters.from) params.set("from", filters.from.toISOString().slice(0, 10))
  if (filters.to) params.set("to", filters.to.toISOString().slice(0, 10))
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}
