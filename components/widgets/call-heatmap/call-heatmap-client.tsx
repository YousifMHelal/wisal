"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { Play, Pause, Volume2, PhoneCall, TrendingDown, AlertTriangle, CheckCircle, Upload, Loader2, X } from "lucide-react"
import { format } from "date-fns"
import type { CallRecordingData, CallSegmentData } from "@/lib/queries/call-heatmap"
import { analyzeCallAction } from "@/lib/actions/call-heatmap"

// ── Emotion color mapping ────────────────────────────────────────────────────

type EmotionKey = "CALM" | "NEUTRAL" | "CONCERN" | "FRUSTRATION" | "ANGER" | "DISTRESS"

const EMOTION_CONFIG: Record<EmotionKey, { bgVar: string; label: string; labelAr: string }> = {
  CALM:        { bgVar: "var(--status-green)",  label: "Calm",        labelAr: "هادئ" },
  NEUTRAL:     { bgVar: "var(--status-green)",  label: "Neutral",     labelAr: "محايد" },
  CONCERN:     { bgVar: "var(--status-amber)",  label: "Concern",     labelAr: "قلق" },
  FRUSTRATION: { bgVar: "var(--status-amber)",  label: "Frustration", labelAr: "إحباط" },
  ANGER:       { bgVar: "var(--status-red)",    label: "Anger",       labelAr: "غضب" },
  DISTRESS:    { bgVar: "var(--status-red)",    label: "Distress",    labelAr: "ضائقة" },
}

// FRUSTRATION gets an intermediate color using a CSS mix approach via inline style
function segmentStyle(emotion: EmotionKey, intensity: number): React.CSSProperties {
  const baseOpacity = 0.25 + intensity * 0.75 // 0.25 min so segments are always visible

  if (emotion === "FRUSTRATION") {
    // mix amber-ish orange between amber and red
    return {
      background: `color-mix(in oklch, var(--status-amber) 50%, var(--status-red) 50%)`,
      opacity: baseOpacity,
    }
  }

  return {
    background: EMOTION_CONFIG[emotion]?.bgVar ?? "var(--status-amber)",
    opacity: baseOpacity,
  }
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

// ── Summary computation ──────────────────────────────────────────────────────

function computeSummary(segments: CallSegmentData[], totalSec: number) {
  const PROBLEMATIC: EmotionKey[] = ["FRUSTRATION", "ANGER", "DISTRESS"]

  let calmSec = 0
  let problemSec = 0
  let worstEmotion: EmotionKey = "CALM"
  let worstIntensity = 0

  for (const s of segments) {
    const dur = s.endSec - s.startSec
    const em = s.emotion as EmotionKey

    if (em === "CALM" || em === "NEUTRAL") calmSec += dur
    if (PROBLEMATIC.includes(em)) problemSec += dur

    if (s.intensity > worstIntensity) {
      worstIntensity = s.intensity
      worstEmotion = em
    }
  }

  return {
    calmPct: Math.round((calmSec / totalSec) * 100),
    problemPct: Math.round((problemSec / totalSec) * 100),
    worstEmotion,
    worstIntensity,
  }
}

// ── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipState {
  segment: CallSegmentData
  x: number
  y: number
}

// ── Upload panel ─────────────────────────────────────────────────────────────

interface UploadPanelProps {
  isAr: boolean
  onDone: () => void
}

function UploadPanel({ isAr, onDone }: UploadPanelProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "analyzing" | "done" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ segmentCount: number } | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setStatus("analyzing")
    setError(null)

    const fd = new FormData()
    fd.set("audio", file)

    startTransition(async () => {
      const res = await analyzeCallAction(fd)
      if (res.error) {
        setError(res.error)
        setStatus("error")
      } else {
        setResult({ segmentCount: res.segmentCount ?? 0 })
        setStatus("done")
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {isAr ? "تحليل مكالمة جديدة" : "Analyze a call"}
        </p>
        <button
          onClick={onDone}
          className="size-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground cursor-pointer transition-colors"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {status === "done" && result ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <CheckCircle className="size-8 text-status-green" />
          <p className="text-sm font-medium">
            {isAr ? "اكتمل التحليل" : "Analysis complete"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? `${result.segmentCount} مقطع محلَّل`
              : `${result.segmentCount} segments analysed`}
          </p>
          <button
            onClick={() => { onDone(); window.location.reload() }}
            className="mt-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
          >
            {isAr ? "عرض النتائج" : "View results"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* File picker */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              {isAr ? "ملف الصوت (MP3 / WAV / M4A)" : "Audio file (MP3 / WAV / M4A)"}
            </label>
            <div
              className="flex items-center gap-3 border border-dashed border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {file ? file.name : (isAr ? "اختر ملفاً…" : "Choose file…")}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFile}
                disabled={status === "analyzing"}
              />
            </div>
            {file && (
              <p className="text-[11px] text-muted-foreground ps-1">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs text-status-red-fg flex items-center gap-1.5">
              <AlertTriangle className="size-3 shrink-0" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!file || status === "analyzing" || isPending}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(status === "analyzing" || isPending) ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isAr ? "جارٍ التحليل…" : "Analyzing…"}
              </>
            ) : (
              <>
                <Upload className="size-4" />
                {isAr ? "رفع وتحليل" : "Upload & analyze"}
              </>
            )}
          </button>

          {(status === "analyzing" || isPending) && (
            <p className="text-[11px] text-center text-muted-foreground">
              {isAr
                ? "يستغرق التحليل ٣٠–٩٠ ثانية حسب طول المكالمة"
                : "Analysis takes 30–90s depending on call length"}
            </p>
          )}
        </form>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  recordings: CallRecordingData[]
  locale: string
}

export function CallHeatmapClient({ recordings, locale }: Props) {
  const isAr = locale === "ar"
  const [showUpload, setShowUpload] = useState(false)

  const [selectedId, setSelectedId] = useState<string>(recordings[0]?.id ?? "")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSec, setCurrentSec] = useState(0)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const heatmapRef = useRef<HTMLDivElement>(null)

  const recording = recordings.find((r) => r.id === selectedId) ?? recordings[0]

  // Reset player when recording changes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentSec(0)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [selectedId])

  // Sync currentSec from real audio element — no dep array so it re-runs after key-remount
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setCurrentSec(audio.currentTime)
    const onEnded = () => { setIsPlaying(false); setCurrentSec(0) }
    const onError = (e: Event) => console.error("[audio] error", (e.target as HTMLAudioElement).error)
    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("error", onError)
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("error", onError)
    }
  })

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || !recording) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      if (audio.currentTime >= recording.durationSec) audio.currentTime = 0
      audio.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  function handleHeatmapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!recording || !heatmapRef.current) return
    const rect = heatmapRef.current.getBoundingClientRect()
    let ratio = (e.clientX - rect.left) / rect.width
    if (isAr) ratio = 1 - ratio
    const seekTo = Math.max(0, Math.min(1, ratio)) * recording.durationSec
    setCurrentSec(seekTo)
    if (audioRef.current) audioRef.current.currentTime = seekTo
  }

  function handleSegmentHover(e: React.MouseEvent<HTMLDivElement>, segment: CallSegmentData) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    setTooltip({ segment, x: rect.left + rect.width / 2, y: rect.top - 8 })
  }

  if (!recording) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowUpload((s) => !s)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 text-xs text-muted-foreground transition-colors cursor-pointer"
            aria-label={isAr ? "تحليل مكالمة جديدة" : "Analyze new call"}
          >
            <Upload className="size-3.5" />
            {isAr ? "تحليل" : "Analyze"}
          </button>
        </div>
        {showUpload && <UploadPanel isAr={isAr} onDone={() => setShowUpload(false)} />}
        {!showUpload && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
            <PhoneCall className="size-8 mb-3 opacity-40" />
            <p>{isAr ? "لا توجد تسجيلات" : "No call recordings available"}</p>
          </div>
        )}
      </div>
    )
  }

  const summary = computeSummary(recording.segments, recording.durationSec)
  const playheadPct = recording.durationSec > 0 ? (currentSec / recording.durationSec) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Recording selector + upload toggle */}
      <div className="flex items-center gap-3">
        <PhoneCall className="size-4 text-muted-foreground shrink-0" />
        <select
          className="flex-1 min-w-0 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          aria-label={isAr ? "اختر مكالمة" : "Select call recording"}
        >
          {recordings.map((r) => (
            <option key={r.id} value={r.id}>
              {r.beneficiaryName ?? r.fileName} — {format(new Date(r.startedAt ?? r.analyzedAt), "dd MMM yyyy, HH:mm", { timeZone: "UTC" })}
              {r.agentName ? ` · ${r.agentName}` : ""}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowUpload((s) => !s)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted/40 hover:bg-muted/70 text-xs text-muted-foreground transition-colors cursor-pointer"
          aria-label={isAr ? "تحليل مكالمة جديدة" : "Analyze new call"}
        >
          <Upload className="size-3.5" />
          {isAr ? "تحليل" : "Analyze"}
        </button>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <UploadPanel isAr={isAr} onDone={() => setShowUpload(false)} />
      )}

      {/* Audio player */}
      <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 border border-border">
        {/* Hidden real audio element — key forces remount on recording change */}
        <audio key={recording.audioUrl} ref={audioRef} src={recording.audioUrl} preload="auto" />

        <button
          onClick={togglePlay}
          className="shrink-0 size-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-150 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          aria-label={isPlaying ? (isAr ? "إيقاف مؤقت" : "Pause") : (isAr ? "تشغيل" : "Play")}
        >
          {isPlaying
            ? <Pause className="size-4 text-primary" />
            : <Play className="size-4 text-primary ms-0.5" />
          }
        </button>

        <Volume2 className="size-4 text-muted-foreground shrink-0" />

        {/* Progress track */}
        <div
          ref={heatmapRef}
          className="relative flex-1 h-1.5 bg-muted rounded-full cursor-pointer group"
          onClick={handleHeatmapClick}
          role="slider"
          aria-label={isAr ? "موضع التشغيل" : "Playback position"}
          aria-valuenow={Math.round(currentSec)}
          aria-valuemin={0}
          aria-valuemax={recording.durationSec}
        >
          <div
            className="absolute inset-y-0 start-0 bg-primary rounded-full transition-all duration-200"
            style={{ width: `${playheadPct}%` }}
          />
          <div
            className="absolute -top-1 size-3.5 rounded-full bg-primary shadow-sm border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity duration-150 -translate-x-1/2"
            style={{ insetInlineStart: `${playheadPct}%` }}
          />
        </div>

        <span className="shrink-0 text-xs tabular-nums text-muted-foreground font-mono whitespace-nowrap">
          {formatTime(currentSec)} / {formatTime(recording.durationSec)}
        </span>
      </div>

      {/* Thermal heatmap bar */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {isAr ? "خريطة المشاعر الحرارية" : "Emotion Heatmap"}
        </p>

        <div className="relative">
          {/* Segments */}
          <div
            className="flex w-full h-10 rounded-lg overflow-hidden border border-border/50 cursor-crosshair"
            role="img"
            aria-label={isAr ? "خريطة حرارية للمشاعر عبر المكالمة" : "Emotion heatmap across call duration"}
          >
            {recording.segments.map((seg) => {
              const widthPct = ((seg.endSec - seg.startSec) / recording.durationSec) * 100
              const emotion = seg.emotion as EmotionKey
              return (
                <div
                  key={seg.id}
                  style={{ width: `${widthPct}%`, ...segmentStyle(emotion, seg.intensity) }}
                  className="relative transition-opacity duration-150 hover:opacity-100 cursor-pointer"
                  onMouseEnter={(e) => handleSegmentHover(e, seg)}
                  onMouseLeave={() => setTooltip(null)}
                  onFocus={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip({ segment: seg, x: rect.left + rect.width / 2, y: rect.top - 8 })
                  }}
                  onBlur={() => setTooltip(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${isAr ? seg.labelAr : seg.label}: ${formatTime(seg.startSec)} – ${formatTime(seg.endSec)}, ${Math.round(seg.intensity * 100)}%`}
                />
              )
            })}
          </div>

          {/* Playhead needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground/70 pointer-events-none transition-all duration-200 rounded-full"
            style={{ insetInlineStart: `${playheadPct}%` }}
          />
        </div>

        {/* Time axis labels — always LTR regardless of page direction */}
        <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground/60 font-mono px-0.5" dir="ltr">
          <span>0:00</span>
          <span>{formatTime(recording.durationSec / 4)}</span>
          <span>{formatTime(recording.durationSec / 2)}</span>
          <span>{formatTime((recording.durationSec * 3) / 4)}</span>
          <span>{formatTime(recording.durationSec)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center">
        {(["CALM", "NEUTRAL", "CONCERN", "FRUSTRATION", "ANGER"] as EmotionKey[]).map((em) => (
          <div key={em} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-sm shrink-0"
              style={{
                background: em === "FRUSTRATION"
                  ? "color-mix(in oklch, var(--status-amber) 50%, var(--status-red) 50%)"
                  : EMOTION_CONFIG[em].bgVar,
                opacity: 0.85,
              }}
            />
            <span className="text-[11px] text-muted-foreground">
              {isAr ? EMOTION_CONFIG[em].labelAr : EMOTION_CONFIG[em].label}
            </span>
          </div>
        ))}
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2">
        {/* Worst emotion */}
        <div className="rounded-lg bg-muted/30 border border-border/50 px-3 py-2.5 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="size-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              {isAr ? "أسوأ لحظة" : "Peak emotion"}
            </span>
          </div>
          <p
            className="text-sm font-semibold"
            style={{
              color: segmentStyle(summary.worstEmotion, 1).background as string,
            }}
          >
            {isAr
              ? EMOTION_CONFIG[summary.worstEmotion]?.labelAr
              : EMOTION_CONFIG[summary.worstEmotion]?.label}
          </p>
          <p className="text-[10px] text-muted-foreground tabular-nums">
            {Math.round(summary.worstIntensity * 100)}% {isAr ? "شدة" : "intensity"}
          </p>
        </div>

        {/* Calm % */}
        <div className="rounded-lg bg-muted/30 border border-border/50 px-3 py-2.5 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="size-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              {isAr ? "وقت هادئ" : "Calm time"}
            </span>
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--status-green)" }}>
            {summary.calmPct}%
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isAr ? "من إجمالي المكالمة" : "of total call"}
          </p>
        </div>

        {/* Problem % */}
        <div className="rounded-lg bg-muted/30 border border-border/50 px-3 py-2.5 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="size-3 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              {isAr ? "وقت الإجهاد" : "Stress time"}
            </span>
          </div>
          <p
            className="text-sm font-semibold"
            style={{ color: summary.problemPct > 30 ? "var(--status-red)" : "var(--status-amber)" }}
          >
            {summary.problemPct}%
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isAr ? "إحباط، غضب، ضائقة" : "frustration, anger, distress"}
          </p>
        </div>
      </div>

      {/* Floating tooltip (portal-less, fixed position) */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-xs space-y-0.5 min-w-32">
            <p className="font-semibold text-foreground">
              {isAr ? tooltip.segment.labelAr : tooltip.segment.label}
            </p>
            <p className="text-muted-foreground tabular-nums">
              {formatTime(tooltip.segment.startSec)} – {formatTime(tooltip.segment.endSec)}
            </p>
            <p className="text-muted-foreground">
              {Math.round(tooltip.segment.intensity * 100)}% {isAr ? "شدة" : "intensity"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
