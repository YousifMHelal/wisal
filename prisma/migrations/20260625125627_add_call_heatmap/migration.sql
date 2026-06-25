-- CreateEnum
CREATE TYPE "EmotionLabel" AS ENUM ('CALM', 'NEUTRAL', 'CONCERN', 'FRUSTRATION', 'ANGER', 'DISTRESS');

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_actor_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "actor" DROP NOT NULL;

-- CreateTable
CREATE TABLE "call_recordings" (
    "id" TEXT NOT NULL,
    "interactionId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_segments" (
    "id" TEXT NOT NULL,
    "recordingId" TEXT NOT NULL,
    "startSec" DOUBLE PRECISION NOT NULL,
    "endSec" DOUBLE PRECISION NOT NULL,
    "emotion" "EmotionLabel" NOT NULL,
    "intensity" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,

    CONSTRAINT "call_segments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "call_recordings_interactionId_key" ON "call_recordings"("interactionId");

-- CreateIndex
CREATE INDEX "call_recordings_interactionId_idx" ON "call_recordings"("interactionId");

-- CreateIndex
CREATE INDEX "call_segments_recordingId_startSec_idx" ON "call_segments"("recordingId", "startSec");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_fkey" FOREIGN KEY ("actor") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "interactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_segments" ADD CONSTRAINT "call_segments_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "call_recordings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
