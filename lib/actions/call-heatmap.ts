"use server"

import { AssemblyAI } from "assemblyai"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

type AssemblySentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE"
type EmotionLabel = "CALM" | "NEUTRAL" | "CONCERN" | "FRUSTRATION" | "ANGER" | "DISTRESS"

function mapEmotion(sentiment: AssemblySentiment, confidence: number): EmotionLabel {
  if (sentiment === "POSITIVE") return "CALM"
  if (sentiment === "NEUTRAL")  return "NEUTRAL"
  if (confidence < 0.50) return "CONCERN"
  if (confidence < 0.75) return "FRUSTRATION"
  if (confidence < 0.90) return "ANGER"
  return "DISTRESS"
}

const EMOTION_LABELS: Record<EmotionLabel, { en: string; ar: string }> = {
  CALM:        { en: "Calm",                 ar: "هادئ" },
  NEUTRAL:     { en: "Neutral",              ar: "محايد" },
  CONCERN:     { en: "Concern detected",     ar: "قلق ملحوظ" },
  FRUSTRATION: { en: "Frustration detected", ar: "إحباط ملحوظ" },
  ANGER:       { en: "Elevated anger",       ar: "غضب مرتفع" },
  DISTRESS:    { en: "Distress signal",      ar: "إشارة ضائقة" },
}

const UploadSchema = z.object({
  fileName: z.string().min(1),
})

export async function analyzeCallAction(formData: FormData): Promise<{
  error?: string
  recordingId?: string
  segmentCount?: number
}> {
  const file = formData.get("audio") as File | null
  const fileName = file?.name ?? "upload.mp3"

  const parsed = UploadSchema.safeParse({ fileName })
  if (!parsed.success) return { error: "Invalid input." }

  if (!file || file.size === 0) return { error: "No audio file provided." }
  if (file.size > 100 * 1024 * 1024) return { error: "File too large (max 100 MB)." }

  const buffer = Buffer.from(await file.arrayBuffer())

  let transcript: Awaited<ReturnType<typeof client.transcripts.transcribe>>
  try {
    transcript = await client.transcripts.transcribe({
      audio: buffer,
      sentiment_analysis: true,
      language_detection: true,
    })
  } catch (e) {
    return { error: `AssemblyAI upload failed: ${(e as Error).message}` }
  }

  if (transcript.status === "error") {
    return { error: `AssemblyAI error: ${transcript.error}` }
  }

  const sentimentResults = transcript.sentiment_analysis_results ?? []
  if (sentimentResults.length === 0) {
    return { error: "No speech detected — file may be silent or too short." }
  }

  const durationSec = Math.round(transcript.audio_duration ?? 0)

  const recording = await prisma.callRecording.create({
    data: {
      audioUrl: `/uploads/${parsed.data.fileName}`,
      fileName: parsed.data.fileName,
      durationSec,
      analyzedAt: new Date(),
    },
  })

  let segmentCount = 0
  for (const result of sentimentResults) {
    const sentiment = result.sentiment as AssemblySentiment
    const confidence = result.confidence ?? 0.5
    const emotion = mapEmotion(sentiment, confidence)
    const startSec = (result.start ?? 0) / 1000
    const endSec   = (result.end   ?? 0) / 1000

    if (endSec <= startSec) continue

    await prisma.callSegment.create({
      data: {
        recordingId: recording.id,
        startSec,
        endSec,
        emotion,
        intensity: confidence,
        label:   EMOTION_LABELS[emotion].en,
        labelAr: EMOTION_LABELS[emotion].ar,
      },
    })
    segmentCount++
  }

  revalidatePath("/workforce")

  return { recordingId: recording.id, segmentCount }
}
