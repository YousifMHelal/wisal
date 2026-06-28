/**
 * Analyze a real phone call with AssemblyAI and store results in DB.
 *
 * Usage:
 *   npx tsx scripts/analyze-call.ts <path-to-audio> <interactionId>
 *
 * Example:
 *   npx tsx scripts/analyze-call.ts ./calls/call1.mp3 clxxxxxxxxxxxxx
 *
 * The script will:
 *   1. Upload the audio file to AssemblyAI
 *   2. Request transcription + sentiment analysis
 *   3. Poll until complete
 *   4. Map sentiment per sentence → EmotionLabel + intensity
 *   5. Upsert CallRecording + CallSegment rows in DB
 */

import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { AssemblyAI } from "assemblyai"
import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

// ── Setup ─────────────────────────────────────────────────────────────────────

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! })

// ── Emotion mapping ───────────────────────────────────────────────────────────
//
// AssemblyAI returns: POSITIVE | NEUTRAL | NEGATIVE + confidence (0–1)
// We map to EmotionLabel based on sentiment + confidence intensity:
//
//   POSITIVE                     → CALM
//   NEUTRAL                      → NEUTRAL
//   NEGATIVE low confidence      → CONCERN
//   NEGATIVE medium confidence   → FRUSTRATION
//   NEGATIVE high confidence     → ANGER

type AssemblySentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE"
type EmotionLabel = "CALM" | "NEUTRAL" | "CONCERN" | "FRUSTRATION" | "ANGER" | "DISTRESS"

function mapEmotion(sentiment: AssemblySentiment, confidence: number): EmotionLabel {
  if (sentiment === "POSITIVE") return "CALM"
  if (sentiment === "NEUTRAL")  return "NEUTRAL"
  // NEGATIVE — scale by confidence
  if (confidence < 0.5) return "CONCERN"
  if (confidence < 0.75) return "FRUSTRATION"
  if (confidence < 0.9) return "ANGER"
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const [,, audioArg, interactionId] = process.argv

  if (!audioArg || !interactionId) {
    console.error("Usage: npx tsx scripts/analyze-call.ts <audio-file> <interactionId>")
    process.exit(1)
  }

  const audioPath = path.resolve(audioArg)
  if (!fs.existsSync(audioPath)) {
    console.error(`File not found: ${audioPath}`)
    process.exit(1)
  }

  // Verify interaction exists
  const interaction = await prisma.interaction.findUnique({ where: { id: interactionId } })
  if (!interaction) {
    console.error(`Interaction not found: ${interactionId}`)
    process.exit(1)
  }

  console.log(`\n📞 Analyzing: ${path.basename(audioPath)}`)
  console.log(`   Interaction: ${interactionId}`)
  console.log(`   Uploading to AssemblyAI…`)

  // Upload + transcribe with sentiment analysis
  const transcript = await client.transcripts.transcribe({
    audio: fs.createReadStream(audioPath),
    sentiment_analysis: true,
    language_detection: true,
  })

  if (transcript.status === "error") {
    console.error(`AssemblyAI error: ${transcript.error}`)
    process.exit(1)
  }

  const sentimentResults = transcript.sentiment_analysis_results ?? []
  const durationMs = transcript.audio_duration ?? 0
  const durationSec = Math.round(durationMs)

  console.log(`\n✅ Transcript complete`)
  console.log(`   Duration: ${Math.floor(durationSec / 60)}m ${durationSec % 60}s`)
  console.log(`   Sentences: ${sentimentResults.length}`)
  console.log(`   Language: ${transcript.language_code ?? "unknown"}`)

  if (sentimentResults.length === 0) {
    console.error("No sentiment results returned — audio may be too short or silent.")
    process.exit(1)
  }

  // Delete existing recording for this interaction (re-analyze)
  const existing = await prisma.callRecording.findUnique({ where: { interactionId } })
  if (existing) {
    console.log(`   Replacing existing recording ${existing.id}…`)
    await prisma.callSegment.deleteMany({ where: { recordingId: existing.id } })
    await prisma.callRecording.delete({ where: { id: existing.id } })
  }

  // Store recording
  const recording = await prisma.callRecording.create({
    data: {
      interactionId,
      audioUrl: `/uploads/${path.basename(audioPath)}`,
      durationSec,
      analyzedAt: new Date(),
    },
  })

  // Store segments
  let segCount = 0
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
    segCount++
  }

  console.log(`\n🗄️  Stored ${segCount} segments in DB`)
  console.log(`   Recording ID: ${recording.id}`)

  // Print emotion breakdown
  const breakdown: Record<string, number> = {}
  for (const result of sentimentResults) {
    const s = result.sentiment as AssemblySentiment
    const c = result.confidence ?? 0.5
    const em = mapEmotion(s, c)
    breakdown[em] = (breakdown[em] ?? 0) + 1
  }
  console.log("\n📊 Emotion breakdown:")
  for (const [em, count] of Object.entries(breakdown).sort((a, b) => b[1] - a[1])) {
    const bar = "█".repeat(Math.round((count / segCount) * 20))
    console.log(`   ${em.padEnd(12)} ${bar} ${count}`)
  }

  console.log("\n✅ Done. Reload /workforce to see the heatmap.\n")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => pool.end())
