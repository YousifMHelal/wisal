"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { geoMercator, geoPath } from "d3-geo"
import type { Feature, FeatureCollection, Geometry } from "geojson"
import { StatusBadge } from "@/components/ui/status-badge"
import type { SlaAdminRegion } from "@/lib/queries/live-operations"
import type { KpiStatus } from "@/lib/kpi"

const GEO_URL = "/geo/ksa-regions.json"
const MAP_W = 800
const MAP_H = 600

// Status fills via CSS var tokens (resolve at runtime — never hardcoded hex).
const STATUS_FILL: Record<KpiStatus, string> = {
  green: "var(--status-green)",
  amber: "var(--status-amber)",
  red:   "var(--status-red)",
}

const STATUS_FILL_DIM: Record<KpiStatus, string> = {
  green: "color-mix(in srgb, var(--status-green) 35%, var(--card))",
  amber: "color-mix(in srgb, var(--status-amber) 35%, var(--card))",
  red:   "color-mix(in srgb, var(--status-red) 35%, var(--card))",
}

interface RegionFeatureProps {
  shapeISO: string
  shapeName: string
}
type RegionFeature = Feature<Geometry, RegionFeatureProps>

interface TooltipState {
  region: SlaAdminRegion
  x: number
  y: number
}

interface Props {
  data: SlaAdminRegion[]
  selectedCluster: string | null
}

export function SlaHeatmapClient({ data, selectedCluster }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mapRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [activeRegion, setActiveRegion] = useState<SlaAdminRegion | null>(null)
  const [isTouch, setIsTouch] = useState(false)
  const [geo, setGeo] = useState<FeatureCollection<Geometry, RegionFeatureProps> | null>(null)

  // Load GeoJSON once.
  useEffect(() => {
    let cancelled = false
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((json: FeatureCollection<Geometry, RegionFeatureProps>) => {
        if (!cancelled) setGeo(json)
      })
      .catch(() => {
        if (!cancelled) setGeo(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const regionByIso = useMemo(
    () => new Map(data.map((r) => [r.regionIso, r])),
    [data]
  )

  // Build the d3 path generator (fitSize auto-scales the whole collection to the
  // viewport) and precompute each feature's svg path string.
  const paths = useMemo(() => {
    if (!geo) return []
    const projection = geoMercator().fitExtent(
      [
        [16, 16],
        [MAP_W - 16, MAP_H - 16],
      ],
      geo
    )
    const pathGen = geoPath(projection)
    return geo.features
      .map((f) => {
        const iso = f.properties.shapeISO
        const d = pathGen(f as RegionFeature)
        return d ? { iso, d, name: f.properties.shapeName } : null
      })
      .filter((p): p is { iso: string; d: string; name: string } => p !== null)
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
      const x = Math.min(Math.max(8, rawX), rect.width - 210)
      const y = Math.min(Math.max(8, rawY), rect.height - 140)
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

  const statusCounts = {
    green: data.filter((r) => r.status === "green").length,
    amber: data.filter((r) => r.status === "amber").length,
    red:   data.filter((r) => r.status === "red").length,
  }

  const hasSelection = Boolean(selectedCluster)

  return (
    <div className="flex flex-col gap-3" onTouchStart={handleTouchStart}>
      {/* Status summary strip */}
      <div className="flex gap-3 flex-wrap text-xs">
        {(["green", "amber", "red"] as const).map((s) =>
          statusCounts[s] > 0 ? (
            <span key={s} className="flex items-center gap-1.5">
              <StatusBadge status={s} dot />
              <span className="text-muted-foreground tabular-nums">
                {statusCounts[s]} region{statusCounts[s] !== 1 ? "s" : ""}
              </span>
            </span>
          ) : null
        )}
      </div>

      {/* Map container */}
      <div ref={mapRef} className="relative w-full select-none">
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Saudi Arabia administrative regions SLA heatmap"
          style={{ display: "block", width: "100%", height: "auto" }}
        >
          {paths.map(({ iso, d, name }) => {
            const region = regionByIso.get(iso)
            const isSelected = selectedCluster === iso
            const isDimmed = hasSelection && !isSelected
            // Regions with no matching data render as muted (shouldn't happen for the
            // 13 admin regions, but guards against unexpected GeoJSON features).
            const status: KpiStatus | null = region?.status ?? null
            const fill = status
              ? (isDimmed ? STATUS_FILL_DIM[status] : STATUS_FILL[status])
              : "var(--muted)"

            return (
              <path
                key={iso}
                d={d}
                fill={fill}
                fillOpacity={0.85}
                tabIndex={region ? 0 : -1}
                role={region ? "button" : undefined}
                aria-label={region ? `${region.regionName}: ${region.serviceLevelPct.toFixed(1)}% service level` : name}
                style={{
                  cursor: region ? "pointer" : "default",
                  filter: isSelected ? "drop-shadow(0 0 4px var(--primary))" : undefined,
                  transition: "fill 150ms ease-out, filter 150ms ease-out",
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

        {/* Desktop hover tooltip */}
        {tooltip && !isTouch && (
          <div
            className="pointer-events-none absolute z-50 rounded-lg border bg-popover text-popover-foreground shadow-lg p-3 text-sm min-w-50 max-w-60"
            style={{ insetInlineStart: tooltip.x, top: tooltip.y }}
            role="tooltip"
          >
            <TooltipContent region={tooltip.region} />
          </div>
        )}
      </div>

      {/* Mobile tap panel — reserves space to prevent layout jump */}
      <div className="min-h-22 md:hidden">
        {activeRegion && isTouch ? (
          <div className="rounded-lg border bg-card p-3 text-sm">
            <TooltipContent region={activeRegion} />
            <button
              className="mt-2 text-xs text-muted-foreground underline underline-offset-2 cursor-pointer"
              onClick={() => setActiveRegion(null)}
            >
              Dismiss
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground ps-1 pt-2">
            Tap a region to see details
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <LegendItem status="green" label="On target (≥80%)" />
        <LegendItem status="amber" label="Tolerance (78–80%)" />
        <LegendItem status="red"   label="Breaching (<78%)" />
        <span className="ms-auto hidden md:inline">Click region to filter</span>
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

function TooltipContent({ region }: { region: SlaAdminRegion }) {
  return (
    <>
      <p className="font-semibold mb-1.5 truncate">{region.regionName}</p>
      <div className="space-y-0.5 text-xs tabular-nums">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Avg SL</span>
          <span className="font-medium">{region.serviceLevelPct.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Volume</span>
          <span className="font-medium">{region.callVolume.toLocaleString()}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Clusters</span>
          <span className="font-medium">{region.clusters.length}</span>
        </div>
      </div>
      <div className="mt-2">
        <StatusBadge status={region.status} />
      </div>
    </>
  )
}
