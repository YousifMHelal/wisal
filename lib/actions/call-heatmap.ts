"use server"

import { AssemblyAI } from "assemblyai"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

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

// For non-English: bucket words into 10s windows, derive emotion from avg confidence
function mapEmotionFromConfidence(avgConfidence: number): EmotionLabel {
  if (avgConfidence >= 0.90) return "CALM"
  if (avgConfidence >= 0.75) return "NEUTRAL"
  if (avgConfidence >= 0.60) return "CONCERN"
  if (avgConfidence >= 0.45) return "FRUSTRATION"
  if (avgConfidence >= 0.30) return "ANGER"
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

const ENGLISH_LANGS = new Set(["en", "en_us", "en_uk", "en_au"])
const SEGMENT_WINDOW_MS = 10_000

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

  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)

  // Save to public/uploads/ for browser playback
  const safeFileName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(path.join(uploadsDir, safeFileName), fileBuffer)
  console.log("[call-heatmap] saved file:", path.join(uploadsDir, safeFileName), fileBuffer.length, "bytes")

  let audioUrl: string
  try {
    audioUrl = await client.files.upload(fileBuffer)
  } catch (e) {
    return { error: `AssemblyAI upload failed: ${(e as Error).message}` }
  }

  const isEnglish = ENGLISH_LANGS.has(
    (fileName.match(/[-_](en|en_us|en_uk|en_au)\./i)?.[1] ?? "").toLowerCase()
  )

  let transcript: Awaited<ReturnType<typeof client.transcripts.transcribe>>
  try {
    transcript = await client.transcripts.transcribe({
      audio: audioUrl,
      sentiment_analysis: isEnglish,
      language_detection: true,
    })
  } catch (e) {
    return { error: `AssemblyAI transcription failed: ${(e as Error).message}` }
  }

  if (transcript.status === "error") {
    return { error: `AssemblyAI error: ${transcript.error}` }
  }

  const detectedLang = transcript.language_code ?? ""
  const usesSentiment = ENGLISH_LANGS.has(detectedLang.toLowerCase())
  const sentimentResults = transcript.sentiment_analysis_results ?? []
  const words = transcript.words ?? []

  // No usable data at all
  if (sentimentResults.length === 0 && words.length === 0) {
    return { error: "No speech detected — file may be silent or too short." }
  }

  const durationSec = Math.round(transcript.audio_duration ?? 0)

  const recording = await prisma.callRecording.create({
    data: {
      audioUrl: `/uploads/${safeFileName}`,
      fileName: parsed.data.fileName,
      durationSec,
      analyzedAt: new Date(),
    },
  })

  let segmentCount = 0

  if (usesSentiment && sentimentResults.length > 0) {
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
  } else if (words.length > 0) {
    // Bucket words into 10s windows, avg confidence → emotion
    const durationMs = (transcript.audio_duration ?? 0) * 1000
    const numWindows = Math.max(1, Math.ceil(durationMs / SEGMENT_WINDOW_MS))
    for (let i = 0; i < numWindows; i++) {
      const winStart = i * SEGMENT_WINDOW_MS
      const winEnd   = winStart + SEGMENT_WINDOW_MS
      const bucket = words.filter(
        w => (w.start ?? 0) >= winStart && (w.start ?? 0) < winEnd
      )
      const avgConf = bucket.length > 0
        ? bucket.reduce((s, w) => s + (w.confidence ?? 0.5), 0) / bucket.length
        : 0.8 // silence → treat as calm/neutral
      const emotion = mapEmotionFromConfidence(avgConf)
      await prisma.callSegment.create({
        data: {
          recordingId: recording.id,
          startSec: winStart / 1000,
          endSec:   Math.min(winEnd, durationMs) / 1000,
          emotion,
          intensity: avgConf,
          label:   EMOTION_LABELS[emotion].en,
          labelAr: EMOTION_LABELS[emotion].ar,
        },
      })
      segmentCount++
    }
  }

  revalidatePath("/workforce")

  return { recordingId: recording.id, segmentCount }
}
