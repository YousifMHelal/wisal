// Single source of truth for KPI targets and status derivation.
// Status colors are ALWAYS derived here — never hardcoded in components.

export type KpiStatus = "green" | "amber" | "red"

export interface KpiTarget {
  label: string
  labelAr: string
  target: number
  amber: number
  unit: string
  higherIsBetter: boolean
}

export const KPI_TARGETS = {
  SERVICE_LEVEL: {
    label: "Service Level",
    labelAr: "مستوى الخدمة",
    target: 80,       // % in 20s
    amber: 78,
    unit: "%",
    higherIsBetter: true,
  },
  ABANDONED_CALLS: {
    label: "Abandoned Calls",
    labelAr: "المكالمات المتروكة",
    target: 5,        // ≤ 5%
    amber: 8,
    unit: "%",
    higherIsBetter: false,
  },
  AHT: {
    label: "Average Handle Time",
    labelAr: "متوسط وقت المعالجة",
    target: 300,      // 5 min in seconds
    amber: 360,       // 6 min
    unit: "s",
    higherIsBetter: false,
  },
  ASA: {
    label: "Average Speed of Answer",
    labelAr: "متوسط سرعة الرد",
    target: 20,       // ≤ 20s
    amber: 30,
    unit: "s",
    higherIsBetter: false,
  },
  FCR: {
    label: "First Contact Resolution",
    labelAr: "الحل من أول اتصال",
    target: 90,       // ≥ 90%
    amber: 85,
    unit: "%",
    higherIsBetter: true,
  },
  CSAT: {
    label: "Customer Satisfaction",
    labelAr: "رضا العملاء",
    target: 95,       // ≥ 95% (DGA target)
    amber: 85,
    unit: "%",
    higherIsBetter: true,
  },
  AI_COMPLETION_RATE: {
    label: "AI Completion Rate",
    labelAr: "معدل إتمام الذكاء الاصطناعي",
    target: 80,       // ≥ 80%
    amber: 70,
    unit: "%",
    higherIsBetter: true,
  },
  AI_ERROR_RATE: {
    label: "AI Error Rate",
    labelAr: "معدل خطأ الذكاء الاصطناعي",
    target: 1,        // < 1%
    amber: 2,
    unit: "%",
    higherIsBetter: false,
  },
  AVAILABILITY: {
    label: "System Availability",
    labelAr: "توافر النظام",
    target: 99.9999,
    amber: 99.99,
    unit: "%",
    higherIsBetter: true,
  },
  RECRUITMENT_TIME: {
    label: "Agent Recruitment Time",
    labelAr: "وقت توظيف الوكيل",
    target: 10,       // working days
    amber: 15,
    unit: "days",
    higherIsBetter: false,
  },
} satisfies Record<string, KpiTarget>

export type KpiKey = keyof typeof KPI_TARGETS

/**
 * Derive green/amber/red from a metric value vs its targets.
 * Works for both "higher is better" (SL, FCR, CSAT) and "lower is better" (AHT, ASA, Abandoned).
 */
export function status(key: KpiKey, value: number): KpiStatus {
  const cfg = KPI_TARGETS[key]

  if (cfg.higherIsBetter) {
    if (value >= cfg.target) return "green"
    if (value >= cfg.amber) return "amber"
    return "red"
  } else {
    if (value <= cfg.target) return "green"
    if (value <= cfg.amber) return "amber"
    return "red"
  }
}

/**
 * Derive status from a raw percentage (0-100) against a named KPI key.
 * Convenience wrapper — same as status() but explicit for readability.
 */
export function kpiStatus(key: KpiKey, value: number): KpiStatus {
  return status(key, value)
}

/** Map status string to Tailwind CSS variable token class names. */
export const STATUS_CLASSES: Record<KpiStatus, { bg: string; text: string; border: string }> = {
  green: {
    bg: "bg-[var(--status-green-bg)]",
    text: "text-[var(--status-green-fg)]",
    border: "border-[var(--status-green)]",
  },
  amber: {
    bg: "bg-[var(--status-amber-bg)]",
    text: "text-[var(--status-amber-fg)]",
    border: "border-[var(--status-amber)]",
  },
  red: {
    bg: "bg-[var(--status-red-bg)]",
    text: "text-[var(--status-red-fg)]",
    border: "border-[var(--status-red)]",
  },
}
