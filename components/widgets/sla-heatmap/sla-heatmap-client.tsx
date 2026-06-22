"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { FeatureCollection, Geometry } from "geojson"
import { StatusBadge } from "@/components/ui/status-badge"
import type { SlaAdminRegion } from "@/lib/queries/live-operations"
import type { KpiStatus } from "@/lib/kpi"

const GEO_URL = "/geo/ksa-regions.json"
const MAP_W = 900
const MAP_H = 740
const MARGIN = 0

// KSA geographic bounds (from ksa-regions.json coordinate analysis)
const LNG_MIN = 34.494
const LNG_MAX = 55.667
const LAT_MIN = 16.380
const LAT_MAX = 32.154

// Mercator Y for a latitude in degrees
function mercY(lat: number): number {
  const rad = (lat * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + rad / 2))
}

// Pre-compute projection constants once (module scope, never change)
const LAT_MIN_M = mercY(LAT_MIN)
const LAT_MAX_M = mercY(LAT_MAX)
const LNG_MIN_R = (LNG_MIN * Math.PI) / 180
const LNG_MAX_R = (LNG_MAX * Math.PI) / 180

const W = MAP_W - 2 * MARGIN
const H = MAP_H - 2 * MARGIN

// Use longitude scale (both units now in radians → consistent with Mercator Y)
const PROJ_SCALE = W / (LNG_MAX_R - LNG_MIN_R) // ≈ 1786

// Center map vertically (it won't fill full height since KSA aspect < canvas aspect)
const MAP_PIX_H = (LAT_MAX_M - LAT_MIN_M) * PROJ_SCALE
const OFF_Y = MARGIN + (H - MAP_PIX_H) / 2

function project([lng, lat]: [number, number]): [number, number] {
  const x = MARGIN + ((lng * Math.PI) / 180 - LNG_MIN_R) * PROJ_SCALE
  const y = OFF_Y + (LAT_MAX_M - mercY(lat)) * PROJ_SCALE
  return [x, y]
}

// Build SVG path string from a GeoJSON geometry WITHOUT using d3-geo geoPath.
// d3-geo's geoPath interpolates great-circle arcs between vertices, which causes
// polygon rings in this GeoJSON to "close" by sweeping the antimeridian (x→4550).
// Manual linear interpolation between vertices avoids this entirely.
function buildSvgPath(geometry: { type: string; coordinates: unknown }): string {
  const polys: number[][][][] =
    geometry.type === "Polygon"
      ? [geometry.coordinates as number[][][]]
      : (geometry.coordinates as number[][][][])

  return polys
    .map((poly) =>
      poly
        .map((ring) =>
          ring
            .map(([lng, lat], i) => {
              const [x, y] = project([lng, lat])
              return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
            })
            .join("") + "Z"
        )
        .join(" ")
    )
    .join(" ")
}

interface RegionFeatureProps {
  shapeISO: string
  shapeName: string
}

interface TooltipState {
  region: SlaAdminRegion
  x: number
  y: number
}

interface Props {
  data: SlaAdminRegion[]
  selectedCluster: string | null
  locale?: string
}

const STATUS_FILL: Record<KpiStatus, string> = {
  green: "var(--status-green)",
  amber: "var(--status-amber)",
  red:   "var(--status-red)",
}

const STATUS_FILL_DIM: Record<KpiStatus, string> = {
  green: "color-mix(in srgb, var(--status-green) 30%, var(--card))",
  amber: "color-mix(in srgb, var(--status-amber) 30%, var(--card))",
  red:   "color-mix(in srgb, var(--status-red)   30%, var(--card))",
}

export function SlaHeatmapClient({ data, selectedCluster, locale = "ar" }: Props) {
  const isAr = locale === "ar"
  const router = useRouter()
  const searchParams = useSearchParams()
  const mapRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [activeRegion, setActiveRegion] = useState<SlaAdminRegion | null>(null)
  const [isTouch, setIsTouch] = useState(false)
  const [geo, setGeo] = useState<FeatureCollection<Geometry, RegionFeatureProps> | null>(null)
  const [geoError, setGeoError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setGeoError(false)
    fetch(GEO_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<FeatureCollection<Geometry, RegionFeatureProps>>
      })
      .then((json) => { if (!cancelled) setGeo(json) })
      .catch(() => { if (!cancelled) setGeoError(true) })
    return () => { cancelled = true }
  }, [])

  const regionByIso = useMemo(
    () => new Map(data.map((r) => [r.regionIso, r])),
    [data]
  )

  // Build all path strings once when GeoJSON loads.
  // Uses manual linear Mercator (no d3-geo geoPath) — see buildSvgPath comment above.
  const paths = useMemo(() => {
    if (!geo) return []
    return geo.features
      .map((f) => {
        const iso = (f as { properties: RegionFeatureProps }).properties.shapeISO
        const name = (f as { properties: RegionFeatureProps }).properties.shapeName
        const d = buildSvgPath(f.geometry as { type: string; coordinates: unknown })
        return d ? { iso, name, d } : null
      })
      .filter((p): p is { iso: string; name: string; d: string } => p !== null)
  }, [geo])

  const handleSelect = useCallback(
    (regionIso: string) => {
      const region = regionByIso.get(regionIso)
      if (!region) return
      if (isTouch) {
        setActiveRegion((prev) => (prev?.regionIso === regionIso ? null : region))
        return
      }
      const params = new URLSearchParams(searchParams.toString())
      const current = params.get("cluster")
      if (current === regionIso) {
        params.delete("cluster")
      } else {
        params.set("cluster", regionIso)
      }
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [isTouch, regionByIso, router, searchParams]
  )

  const handleMove = useCallback(
    (e: React.MouseEvent, regionIso: string) => {
      if (isTouch) return
      const region = regionByIso.get(regionIso)
      if (!region) return
      const container = mapRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const rawX = e.clientX - rect.left + 12
      const rawY = e.clientY - rect.top - 8
      const x = Math.min(Math.max(8, rawX), rect.width - 220)
      const y = Math.min(Math.max(8, rawY), rect.height - 150)
      setTooltip({ region, x, y })
    },
    [isTouch, regionByIso]
  )

  const handleLeave = useCallback(() => {
    if (!isTouch) setTooltip(null)
  }, [isTouch])

  const handleTouchStart = useCallback(() => {
    setIsTouch(true)
    setTooltip(null)
  }, [])

  const statusCounts = useMemo(
    () => ({
      green: data.filter((r) => r.status === "green").length,
      amber: data.filter((r) => r.status === "amber").length,
      red:   data.filter((r) => r.status === "red").length,
    }),
    [data]
  )

  const hasSelection = Boolean(selectedCluster)

  if (geoError) {
    return (
      <div className="flex items-center justify-center min-h-80 text-sm text-muted-foreground">
        {isAr ? "تعذّر تحميل خريطة المناطق" : "Failed to load regions map"}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3" onTouchStart={handleTouchStart}>
      {/* Status count strip */}
      <div className="flex gap-4 flex-wrap text-xs">
        {(["green", "amber", "red"] as const).map((s) =>
          statusCounts[s] > 0 ? (
            <span key={s} className="flex items-center gap-1.5">
              <StatusBadge status={s} dot />
              <span className="text-muted-foreground tabular-nums">
                {statusCounts[s]} {isAr ? "منطقة" : "regions"}
              </span>
            </span>
          ) : null
        )}
      </div>

      {/* Map */}
      <div ref={mapRef} className="relative w-full select-none">
        {!geo && !geoError && (
          <div
            className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground"
            aria-live="polite"
          >
            {isAr ? "جارٍ تحميل الخريطة…" : "Loading map…"}
          </div>
        )}
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={isAr ? "خريطة مستوى الخدمة الوطنية للمناطق الإدارية في المملكة العربية السعودية" : "National SLA heatmap for administrative regions of Saudi Arabia"}
          style={{ display: "block", width: "100%", height: "auto", maxHeight: "600px" }}
        >
          {/* Background */}
          <rect x={0} y={0} width={MAP_W} height={MAP_H} fill="var(--muted)" fillOpacity={0.35} />

          {paths.map(({ iso, name, d }) => {
            const region = regionByIso.get(iso)
            const isSelected = selectedCluster === iso
            const isDimmed = hasSelection && !isSelected
            const kpiStatus: KpiStatus | null = region?.status ?? null
            const fill = kpiStatus
              ? isDimmed
                ? STATUS_FILL_DIM[kpiStatus]
                : STATUS_FILL[kpiStatus]
              : "var(--muted)"

            return (
              <path
                key={iso}
                d={d}
                fill={fill}
                stroke="var(--card)"
                strokeWidth={1.5}
                strokeLinejoin="round"
                tabIndex={region ? 0 : -1}
                role={region ? "button" : undefined}
                aria-label={
                  region
                    ? isAr
                      ? `${region.regionNameAr}: ${region.serviceLevelPct.toFixed(1)}% مستوى الخدمة`
                      : `${region.regionName}: ${region.serviceLevelPct.toFixed(1)}% service level`
                    : name
                }
                style={{
                  cursor: region ? "pointer" : "default",
                  opacity: isDimmed ? 0.4 : 1,
                  filter: isSelected
                    ? "drop-shadow(0 0 6px var(--primary)) brightness(1.15)"
                    : undefined,
                  transition: "opacity 150ms ease-out, filter 150ms ease-out",
                  outline: "none",
                }}
                onClick={() => region && handleSelect(iso)}
                onMouseMove={(e) => region && handleMove(e, iso)}
                onMouseLeave={handleLeave}
                onKeyDown={(e) => {
                  if (region && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault()
                    handleSelect(iso)
                  }
                }}
              />
            )
          })}
        </svg>

        {/* Desktop tooltip */}
        {tooltip && !isTouch && (
          <div
            className="pointer-events-none absolute z-50 rounded-lg border bg-popover text-popover-foreground shadow-lg p-3 text-sm w-56"
            style={{ insetInlineStart: tooltip.x, top: tooltip.y }}
            role="tooltip"
          >
            <TooltipContent region={tooltip.region} isAr={isAr} />
          </div>
        )}
      </div>

      {/* Mobile tap panel */}
      <div className="min-h-20 md:hidden">
        {activeRegion && isTouch ? (
          <div className="rounded-lg border bg-card p-3 text-sm">
            <TooltipContent region={activeRegion} isAr={isAr} />
            <button
              className="mt-2 text-xs text-muted-foreground underline underline-offset-2 cursor-pointer"
              onClick={() => setActiveRegion(null)}
            >
              {isAr ? "إغلاق" : "Close"}
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground ps-1 pt-2">
            {isAr ? "اضغط على منطقة لعرض التفاصيل" : "Tap a region to view details"}
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <LegendItem status="green" label={isAr ? "في الهدف (≥٨٠%)" : "On target (≥80%)"} />
        <LegendItem status="amber" label={isAr ? "الهامش (٧٨–٨٠%)" : "Marginal (78–80%)"} />
        <LegendItem status="red"   label={isAr ? "خرق (<٧٨%)" : "Breach (<78%)"} />
        <span className="ms-auto hidden md:inline">
          {isAr ? "انقر على منطقة للتصفية" : "Click a region to filter"}
        </span>
      </div>
    </div>
  )
}

function LegendItem({ status, label }: { status: KpiStatus; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block size-3 rounded-sm shrink-0"
        style={{ background: STATUS_FILL[status] }}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}

function TooltipContent({ region, isAr }: { region: SlaAdminRegion; isAr: boolean }) {
  const dir = isAr ? "rtl" : "ltr"
  return (
    <>
      <p className="font-semibold mb-0.5 truncate" dir={dir}>
        {isAr ? region.regionNameAr : region.regionName}
      </p>
      <p className="text-xs text-muted-foreground mb-1.5 truncate">
        {isAr ? region.regionName : region.regionNameAr}
      </p>
      <div className="space-y-0.5 text-xs tabular-nums">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">
            {isAr ? "متوسط مستوى الخدمة" : "Avg service level"}
          </span>
          <span className="font-medium">{region.serviceLevelPct.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{isAr ? "الحجم" : "Volume"}</span>
          <span className="font-medium">
            {region.callVolume.toLocaleString(isAr ? "ar-SA" : "en-US")}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{isAr ? "التجمعات" : "Clusters"}</span>
          <span className="font-medium">{region.clusters.length}</span>
        </div>
      </div>
      <div className="mt-2">
        <StatusBadge status={region.status} />
      </div>
    </>
  )
}
