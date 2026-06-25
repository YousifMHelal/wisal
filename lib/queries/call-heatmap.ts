import { prisma } from "@/lib/prisma"
import type { Filters } from "@/lib/filters"
import type { Prisma } from "@/lib/generated/prisma/client"

export type CallSegmentData = {
  id: string
  startSec: number
  endSec: number
  emotion: string
  intensity: number
  label: string
  labelAr: string
}

export type CallRecordingData = {
  id: string
  interactionId: string
  audioUrl: string
  durationSec: number
  analyzedAt: Date
  agentName: string | null
  beneficiaryName: string
  startedAt: Date
  segments: CallSegmentData[]
}

export async function getCallRecordings(filters: Filters): Promise<CallRecordingData[]> {
  const where: Prisma.CallRecordingWhereInput = {}

  if (filters.cluster) {
    where.interaction = { clusterId: filters.cluster }
  }

  if (filters.from && filters.to) {
    where.analyzedAt = { gte: filters.from, lte: filters.to }
  }

  const recordings = await prisma.callRecording.findMany({
    where,
    take: 20,
    orderBy: { analyzedAt: "desc" },
    include: {
      segments: { orderBy: { startSec: "asc" } },
      interaction: {
        include: {
          agent: { select: { name: true } },
          beneficiary: { select: { name: true } },
        },
      },
    },
  })

  return recordings.map((r) => ({
    id: r.id,
    interactionId: r.interactionId,
    audioUrl: r.audioUrl,
    durationSec: r.durationSec,
    analyzedAt: r.analyzedAt,
    agentName: r.interaction.agent?.name ?? null,
    beneficiaryName: r.interaction.beneficiary.name,
    startedAt: r.interaction.startedAt,
    segments: r.segments.map((s) => ({
      id: s.id,
      startSec: s.startSec,
      endSec: s.endSec,
      emotion: s.emotion,
      intensity: s.intensity,
      label: s.label,
      labelAr: s.labelAr,
    })),
  }))
}
