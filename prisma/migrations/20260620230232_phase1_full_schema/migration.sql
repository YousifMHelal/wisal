-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OPERATOR', 'SUPERVISOR', 'COMPLIANCE', 'EXECUTIVE', 'PLATFORM_ADMIN');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('VOICE', 'WHATSAPP', 'LIVE_CHAT', 'EMAIL', 'SIGN_LANGUAGE_VIDEO', 'SOCIAL');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('CRITICAL', 'WARNING');

-- CreateEnum
CREATE TYPE "CaregiverAction" AS ENUM ('COMPLETED_WITH_CONSENT', 'FAILCLOSED_HANDOFF');

-- CreateEnum
CREATE TYPE "ProxyConfirmed" AS ENUM ('YES', 'NO', 'AMBIGUOUS');

-- CreateEnum
CREATE TYPE "KillSwitchState" AS ENUM ('ARMED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "KillSwitchScope" AS ENUM ('ALL', 'CHANNEL', 'CLUSTER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "ComplianceFramework" AS ENUM ('NCA', 'PDPL', 'DGA', 'NDMO');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'PARTIAL', 'NON_COMPLIANT');

-- CreateEnum
CREATE TYPE "ShiftSwapStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "KpiMetric" AS ENUM ('SERVICE_LEVEL', 'ABANDONED_CALLS', 'AHT', 'ASA', 'FCR', 'CSAT', 'AI_COMPLETION_RATE');

-- CreateEnum
CREATE TYPE "AgentState" AS ENUM ('AVAILABLE', 'ON_CALL', 'WRAP', 'AFTER_CALL', 'BREAK', 'OFFLINE');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('COMPLAINT', 'REQUEST');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('REMINDER', 'SURVEY', 'AWARENESS', 'RESCHEDULE');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'PAUSED');

-- CreateEnum
CREATE TYPE "IntegrationSystem" AS ENUM ('NAFATH', 'MAWID', 'SEHHATY', 'HR', 'NMR');

-- CreateEnum
CREATE TYPE "IntegrationState" AS ENUM ('UP', 'DEGRADED', 'DOWN');

-- CreateEnum
CREATE TYPE "IntegrationPattern" AS ENUM ('SYNC', 'EVENT');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('GIVEN', 'WITHDRAWN', 'PENDING');

-- CreateEnum
CREATE TYPE "BeneficiaryTier" AS ENUM ('T1', 'T2', 'T3');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "clusterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clusters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "catchmentPopulation" INTEGER NOT NULL,
    "agentEstimate" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "svgRegionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "type" "ChannelType" NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "aht" DOUBLE PRECISION NOT NULL,
    "fcr" DOUBLE PRECISION NOT NULL,
    "qaScore" DOUBLE PRECISION NOT NULL,
    "csat" DOUBLE PRECISION NOT NULL,
    "absenteeism" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_snapshots" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "serviceLevelPct" DOUBLE PRECISION NOT NULL,
    "callVolume" INTEGER NOT NULL,
    "abandonedPct" DOUBLE PRECISION NOT NULL,
    "aht" DOUBLE PRECISION NOT NULL,
    "fcr" DOUBLE PRECISION NOT NULL,
    "asa" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sla_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_pulses" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "clusterId" TEXT,
    "volume" INTEGER NOT NULL,
    "avgWaitSec" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_pulses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clusterId" TEXT,
    "channelId" TEXT,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "metricTrend" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_statuses" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "state" "AgentState" NOT NULL,
    "since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tier_snapshots" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT,
    "tier1Pct" DOUBLE PRECISION NOT NULL,
    "tier2Pct" DOUBLE PRECISION NOT NULL,
    "tier3Pct" DOUBLE PRECISION NOT NULL,
    "tier1AutocorrectRate" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tier_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caregiver_cases" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "proxyConfirmed" "ProxyConfirmed" NOT NULL,
    "action" "CaregiverAction" NOT NULL,
    "auditTrail" JSONB NOT NULL DEFAULT '[]',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caregiver_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resolution_splits" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT,
    "channelId" TEXT,
    "aiFullPct" DOUBLE PRECISION NOT NULL,
    "aiPartialPct" DOUBLE PRECISION NOT NULL,
    "humanPct" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resolution_splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drift_snapshots" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "dialect" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nluConfidence" DOUBLE PRECISION NOT NULL,
    "intentConfidence" DOUBLE PRECISION NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,

    CONSTRAINT "drift_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kill_switch" (
    "id" TEXT NOT NULL,
    "state" "KillSwitchState" NOT NULL DEFAULT 'ARMED',
    "lastTriggeredAt" TIMESTAMP(3),
    "scope" "KillSwitchScope" NOT NULL DEFAULT 'ALL',
    "scopeRef" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kill_switch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_content_approvals" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "clusterId" TEXT,
    "content" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_content_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_disclosures" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "caregiverCaseId" TEXT NOT NULL,
    "consentOnFile" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_disclosures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forbidden_intent_events" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "wisalResponse" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forbidden_intent_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_scores" (
    "id" TEXT NOT NULL,
    "framework" "ComplianceFramework" NOT NULL,
    "status" "ComplianceStatus" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "refreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidenceRefs" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "compliance_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_articles" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "bodyEn" TEXT NOT NULL,
    "bodyAr" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_coverages" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "hour" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "forecastDemand" INTEGER NOT NULL,
    "staffed" INTEGER NOT NULL,

    CONSTRAINT "shift_coverages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_swap_requests" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "fromShift" TIMESTAMP(3) NOT NULL,
    "toShift" TIMESTAMP(3) NOT NULL,
    "status" "ShiftSwapStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_swap_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qa_sample_items" (
    "id" TEXT NOT NULL,
    "interactionId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "sentimentScore" DOUBLE PRECISION NOT NULL,
    "botConfidence" DOUBLE PRECISION NOT NULL,
    "priority" INTEGER NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qa_sample_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_records" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qaScoreBefore" DOUBLE PRECISION NOT NULL,
    "qaScoreAfter" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "training_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_scorecards" (
    "id" TEXT NOT NULL,
    "metric" "KpiMetric" NOT NULL,
    "thisWeek" DOUBLE PRECISION NOT NULL,
    "target" DOUBLE PRECISION NOT NULL,
    "lastWeek" DOUBLE PRECISION NOT NULL,
    "ownerModule" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cluster_rankings" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL,
    "perKpi" JSONB NOT NULL DEFAULT '{}',
    "period" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cluster_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_points" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "agentHoursSaved" DOUBLE PRECISION NOT NULL,
    "aiResolvedVolume" INTEGER NOT NULL,
    "avgHandleTimeSaved" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "savings_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiary_voice_themes" (
    "id" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "themeAr" TEXT NOT NULL,
    "plainSummary" TEXT NOT NULL,
    "plainSummaryAr" TEXT NOT NULL,
    "sentiment" DOUBLE PRECISION NOT NULL,
    "weekTrend" JSONB NOT NULL DEFAULT '[]',
    "examples" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiary_voice_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiaries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "tier" "BeneficiaryTier" NOT NULL DEFAULT 'T1',
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "agentId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSec" INTEGER NOT NULL,
    "intent" TEXT NOT NULL,
    "sentiment" DOUBLE PRECISION NOT NULL,
    "resolution" TEXT NOT NULL,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "beneficiaryId" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "slaDueAt" TIMESTAMP(3) NOT NULL,
    "escalationPath" TEXT,
    "assignedAgentId" TEXT,
    "assignedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "clusterId" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "sent" INTEGER NOT NULL DEFAULT 0,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "responded" INTEGER NOT NULL DEFAULT 0,
    "outcomeMetrics" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penalty_records" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "kpi" TEXT NOT NULL,
    "failurePct" DOUBLE PRECISION NOT NULL,
    "permissibleTolerance" DOUBLE PRECISION NOT NULL,
    "breached" BOOLEAN NOT NULL,
    "penaltyAmount" DOUBLE PRECISION NOT NULL,
    "basis" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "penalty_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_statuses" (
    "id" TEXT NOT NULL,
    "system" "IntegrationSystem" NOT NULL,
    "state" "IntegrationState" NOT NULL DEFAULT 'UP',
    "lastSyncAt" TIMESTAMP(3),
    "latencyMs" INTEGER,
    "pattern" "IntegrationPattern" NOT NULL DEFAULT 'SYNC',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health" (
    "id" TEXT NOT NULL,
    "availabilityPct" DOUBLE PRECISION NOT NULL,
    "dr" JSONB NOT NULL DEFAULT '{}',
    "lastDrTestAt" TIMESTAMP(3),
    "region" TEXT NOT NULL DEFAULT 'KSA',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_svgRegionId_key" ON "clusters"("svgRegionId");

-- CreateIndex
CREATE UNIQUE INDEX "channels_type_key" ON "channels"("type");

-- CreateIndex
CREATE INDEX "sla_snapshots_clusterId_timestamp_idx" ON "sla_snapshots"("clusterId", "timestamp");

-- CreateIndex
CREATE INDEX "channel_pulses_channelId_timestamp_idx" ON "channel_pulses"("channelId", "timestamp");

-- CreateIndex
CREATE INDEX "incidents_severity_triggeredAt_idx" ON "incidents"("severity", "triggeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "agent_statuses_agentId_key" ON "agent_statuses"("agentId");

-- CreateIndex
CREATE INDEX "agent_statuses_clusterId_state_idx" ON "agent_statuses"("clusterId", "state");

-- CreateIndex
CREATE INDEX "tier_snapshots_clusterId_timestamp_idx" ON "tier_snapshots"("clusterId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "caregiver_cases_caseId_key" ON "caregiver_cases"("caseId");

-- CreateIndex
CREATE INDEX "caregiver_cases_clusterId_timestamp_idx" ON "caregiver_cases"("clusterId", "timestamp");

-- CreateIndex
CREATE INDEX "resolution_splits_clusterId_timestamp_idx" ON "resolution_splits"("clusterId", "timestamp");

-- CreateIndex
CREATE INDEX "drift_snapshots_clusterId_date_idx" ON "drift_snapshots"("clusterId", "date");

-- CreateIndex
CREATE INDEX "medical_content_approvals_status_timestamp_idx" ON "medical_content_approvals"("status", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "consent_disclosures_caregiverCaseId_key" ON "consent_disclosures"("caregiverCaseId");

-- CreateIndex
CREATE INDEX "consent_disclosures_timestamp_idx" ON "consent_disclosures"("timestamp");

-- CreateIndex
CREATE INDEX "forbidden_intent_events_timestamp_idx" ON "forbidden_intent_events"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_scores_framework_key" ON "compliance_scores"("framework");

-- CreateIndex
CREATE INDEX "knowledge_articles_status_idx" ON "knowledge_articles"("status");

-- CreateIndex
CREATE INDEX "shift_coverages_clusterId_date_idx" ON "shift_coverages"("clusterId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "shift_coverages_clusterId_date_hour_key" ON "shift_coverages"("clusterId", "date", "hour");

-- CreateIndex
CREATE INDEX "qa_sample_items_reviewed_priority_idx" ON "qa_sample_items"("reviewed", "priority");

-- CreateIndex
CREATE INDEX "training_records_agentId_idx" ON "training_records"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_scorecards_metric_key" ON "kpi_scorecards"("metric");

-- CreateIndex
CREATE INDEX "cluster_rankings_period_idx" ON "cluster_rankings"("period");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_rankings_clusterId_period_key" ON "cluster_rankings"("clusterId", "period");

-- CreateIndex
CREATE INDEX "savings_points_date_idx" ON "savings_points"("date");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiaries_nationalId_key" ON "beneficiaries"("nationalId");

-- CreateIndex
CREATE INDEX "beneficiaries_clusterId_idx" ON "beneficiaries"("clusterId");

-- CreateIndex
CREATE INDEX "beneficiaries_nationalId_idx" ON "beneficiaries"("nationalId");

-- CreateIndex
CREATE INDEX "interactions_beneficiaryId_startedAt_idx" ON "interactions"("beneficiaryId", "startedAt");

-- CreateIndex
CREATE INDEX "interactions_clusterId_startedAt_idx" ON "interactions"("clusterId", "startedAt");

-- CreateIndex
CREATE INDEX "tickets_status_priority_idx" ON "tickets"("status", "priority");

-- CreateIndex
CREATE INDEX "tickets_clusterId_status_idx" ON "tickets"("clusterId", "status");

-- CreateIndex
CREATE INDEX "campaigns_type_status_idx" ON "campaigns"("type", "status");

-- CreateIndex
CREATE INDEX "penalty_records_clusterId_period_idx" ON "penalty_records"("clusterId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "integration_statuses_system_key" ON "integration_statuses"("system");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_actor_timestamp_idx" ON "audit_logs"("actor", "timestamp");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sla_snapshots" ADD CONSTRAINT "sla_snapshots_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_pulses" ADD CONSTRAINT "channel_pulses_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_pulses" ADD CONSTRAINT "channel_pulses_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_statuses" ADD CONSTRAINT "agent_statuses_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_statuses" ADD CONSTRAINT "agent_statuses_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tier_snapshots" ADD CONSTRAINT "tier_snapshots_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caregiver_cases" ADD CONSTRAINT "caregiver_cases_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolution_splits" ADD CONSTRAINT "resolution_splits_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resolution_splits" ADD CONSTRAINT "resolution_splits_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drift_snapshots" ADD CONSTRAINT "drift_snapshots_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_content_approvals" ADD CONSTRAINT "medical_content_approvals_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_disclosures" ADD CONSTRAINT "consent_disclosures_caregiverCaseId_fkey" FOREIGN KEY ("caregiverCaseId") REFERENCES "caregiver_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_coverages" ADD CONSTRAINT "shift_coverages_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_swap_requests" ADD CONSTRAINT "shift_swap_requests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qa_sample_items" ADD CONSTRAINT "qa_sample_items_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cluster_rankings" ADD CONSTRAINT "cluster_rankings_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_points" ADD CONSTRAINT "savings_points_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penalty_records" ADD CONSTRAINT "penalty_records_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_fkey" FOREIGN KEY ("actor") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
