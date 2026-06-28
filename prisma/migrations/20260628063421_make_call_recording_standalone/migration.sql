-- DropForeignKey
ALTER TABLE "call_recordings" DROP CONSTRAINT "call_recordings_interactionId_fkey";

-- AlterTable
ALTER TABLE "call_recordings" ADD COLUMN     "fileName" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "interactionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "interactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
