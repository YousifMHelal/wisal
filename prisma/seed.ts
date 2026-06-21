// Wisal Command Center — Seed Script (Phase 1 P1-4)
// 20 real HHC clusters, users per role, realistic mixed green/amber/red data

import { PrismaClient } from "../lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ── 20 HHC Clusters (RFP Appendix 1.i) ──────────────────────────────────────

const CLUSTERS = [
  { name: "Riyadh Central",      nameAr: "الرياض المركزية",    region: "Riyadh",      population: 1_200_000, agents: 85, lat: 24.688, lng: 46.722, svgId: "SA-01" },
  { name: "Riyadh North",        nameAr: "شمال الرياض",         region: "Riyadh",      population:   650_000, agents: 45, lat: 24.860, lng: 46.680, svgId: "SA-02" },
  { name: "Riyadh South",        nameAr: "جنوب الرياض",         region: "Riyadh",      population:   540_000, agents: 38, lat: 24.520, lng: 46.770, svgId: "SA-03" },
  { name: "Jeddah",              nameAr: "جدة",                 region: "Makkah",      population: 1_100_000, agents: 78, lat: 21.485, lng: 39.192, svgId: "SA-04" },
  { name: "Makkah",              nameAr: "مكة المكرمة",         region: "Makkah",      population:   450_000, agents: 32, lat: 21.389, lng: 39.857, svgId: "SA-05" },
  { name: "Taif",                nameAr: "الطائف",               region: "Makkah",      population:   310_000, agents: 22, lat: 21.270, lng: 40.415, svgId: "SA-06" },
  { name: "Dammam",              nameAr: "الدمام",               region: "Eastern",     population:   680_000, agents: 48, lat: 26.394, lng: 49.977, svgId: "SA-07" },
  { name: "Al Khobar",           nameAr: "الخبر",                region: "Eastern",     population:   380_000, agents: 27, lat: 26.279, lng: 50.207, svgId: "SA-08" },
  { name: "Al Ahsa",             nameAr: "الأحساء",              region: "Eastern",     population:   420_000, agents: 30, lat: 25.388, lng: 49.588, svgId: "SA-09" },
  { name: "Medina",              nameAr: "المدينة المنورة",      region: "Medina",      population:   520_000, agents: 37, lat: 24.470, lng: 39.611, svgId: "SA-10" },
  { name: "Tabuk",               nameAr: "تبوك",                 region: "Tabuk",       population:   220_000, agents: 16, lat: 28.383, lng: 36.566, svgId: "SA-11" },
  { name: "Hail",                nameAr: "حائل",                 region: "Hail",        population:   190_000, agents: 14, lat: 27.526, lng: 41.688, svgId: "SA-12" },
  { name: "Qassim",              nameAr: "القصيم",               region: "Qassim",      population:   380_000, agents: 27, lat: 26.328, lng: 43.975, svgId: "SA-13" },
  { name: "Asir",                nameAr: "عسير",                 region: "Asir",        population:   420_000, agents: 30, lat: 18.216, lng: 42.505, svgId: "SA-14" },
  { name: "Najran",              nameAr: "نجران",                region: "Najran",      population:   180_000, agents: 13, lat: 17.565, lng: 44.229, svgId: "SA-15" },
  { name: "Jizan",               nameAr: "جازان",                region: "Jizan",       population:   290_000, agents: 21, lat: 16.889, lng: 42.570, svgId: "SA-16" },
  { name: "Al Baha",             nameAr: "الباحة",               region: "Al Baha",     population:   130_000, agents: 10, lat: 20.013, lng: 41.464, svgId: "SA-17" },
  { name: "Al Jouf",             nameAr: "الجوف",                region: "Al Jouf",     population:   140_000, agents: 10, lat: 29.796, lng: 40.100, svgId: "SA-18" },
  { name: "Northern Borders",    nameAr: "الحدود الشمالية",      region: "N. Borders",  population:   110_000, agents:  8, lat: 30.975, lng: 41.018, svgId: "SA-19" },
  { name: "Yanbu",               nameAr: "ينبع",                 region: "Medina",      population:   210_000, agents: 15, lat: 24.089, lng: 38.063, svgId: "SA-20" },
]

const CHANNELS = ["VOICE", "WHATSAPP", "LIVE_CHAT", "EMAIL", "SIGN_LANGUAGE_VIDEO", "SOCIAL"] as const

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}
function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1))
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
function hoursAgo(n: number) {
  return new Date(Date.now() - n * 3_600_000)
}

async function main() {
  console.log("🌱 Seeding Wisal Command Center…")

  // ── Channels ──────────────────────────────────────────────────────────────
  console.log("  channels…")
  const channelMap: Partial<Record<typeof CHANNELS[number], string>> = {}
  for (const type of CHANNELS) {
    const ch = await prisma.channel.upsert({
      where: { type },
      update: {},
      create: { type },
    })
    channelMap[type] = ch.id
  }

  // ── Clusters ──────────────────────────────────────────────────────────────
  console.log("  clusters…")
  const clusterIds: string[] = []
  for (const c of CLUSTERS) {
    const cluster = await prisma.cluster.upsert({
      where: { svgRegionId: c.svgId },
      update: {},
      create: {
        name: c.name,
        nameAr: c.nameAr,
        region: c.region,
        catchmentPopulation: c.population,
        agentEstimate: c.agents,
        lat: c.lat,
        lng: c.lng,
        svgRegionId: c.svgId,
      },
    })
    clusterIds.push(cluster.id)
  }

  // ── Users (one per role, plus operators per cluster) ──────────────────────
  console.log("  users…")
  const pw = await bcrypt.hash("password123", 10)

  const roleUsers = [
    { email: "operator@wisal.sa",      name: "Omar Operator",    nameAr: "عمر المشغل",    role: "OPERATOR"       as const },
    { email: "supervisor@wisal.sa",    name: "Sara Supervisor",  nameAr: "سارة المشرفة",  role: "SUPERVISOR"     as const },
    { email: "compliance@wisal.sa",    name: "Khalid Compliance",nameAr: "خالد الامتثال", role: "COMPLIANCE"     as const },
    { email: "executive@wisal.sa",     name: "Nora Executive",   nameAr: "نورة التنفيذية",role: "EXECUTIVE"      as const },
    { email: "admin@wisal.sa",         name: "Ahmed Admin",      nameAr: "أحمد المدير",   role: "PLATFORM_ADMIN" as const },
  ]

  const userIds: string[] = []
  for (const u of roleUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, passwordHash: pw, role: u.role },
    })
    userIds.push(user.id)
  }
  const adminUserId = userIds[4]

  // ── Agents (3–5 per cluster) ───────────────────────────────────────────────
  console.log("  agents…")
  const AGENT_FIRST = ["Mohammed","Abdullah","Fatima","Aisha","Ali","Hassan","Mona","Reem","Yusuf","Layla"]
  const AGENT_LAST  = ["Al-Ghamdi","Al-Otaibi","Al-Zahrani","Al-Harbi","Al-Shehri","Al-Qahtani","Al-Dosari","Al-Mutairi"]

  const agentIds: string[] = []
  for (const cid of clusterIds) {
    const count = randInt(3, 5)
    for (let i = 0; i < count; i++) {
      const first = pick(AGENT_FIRST)
      const last  = pick(AGENT_LAST)
      const agent = await prisma.agent.create({
        data: {
          name: `${first} ${last}`,
          nameAr: `${first} ${last}`,
          team: pick(["Team A", "Team B", "Team C"]),
          clusterId: cid,
          aht: rand(200, 420),          // 3.3–7 min
          fcr: rand(0.78, 0.98),
          qaScore: rand(68, 99),
          csat: rand(72, 99),
          absenteeism: rand(0.01, 0.12),
        },
      })
      agentIds.push(agent.id)
    }
  }

  // ── Agent Status (live) ────────────────────────────────────────────────────
  console.log("  agent statuses…")
  const STATES = ["AVAILABLE","ON_CALL","WRAP","AFTER_CALL","BREAK","OFFLINE"] as const
  const STATE_WEIGHTS = [30, 35, 10, 8, 10, 7] // rough distribution %

  function weightedState() {
    const total = STATE_WEIGHTS.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    for (let i = 0; i < STATES.length; i++) {
      r -= STATE_WEIGHTS[i]
      if (r <= 0) return STATES[i]
    }
    return STATES[0]
  }

  // Need agents with their clusterId
  const allAgents = await prisma.agent.findMany({ select: { id: true, clusterId: true } })
  for (const ag of allAgents) {
    await prisma.agentStatus.upsert({
      where: { agentId: ag.id },
      update: {},
      create: {
        agentId: ag.id,
        clusterId: ag.clusterId,
        state: weightedState(),
        since: hoursAgo(randInt(0, 8)),
      },
    })
  }

  // ── SLA Snapshots (30 days × 20 clusters × 4 times/day) ──────────────────
  console.log("  SLA snapshots…")
  for (const cid of clusterIds) {
    for (let day = 29; day >= 0; day--) {
      for (const hour of [8, 12, 16, 20]) {
        const ts = daysAgo(day)
        ts.setHours(hour, 0, 0, 0)
        // Mix of green/amber/red
        const sl  = rand(72, 95)
        const ab  = rand(3, 11)
        const aht = rand(240, 420)
        await prisma.slaSnapshot.create({
          data: {
            clusterId: cid,
            serviceLevelPct: sl,
            callVolume: randInt(200, 1400),
            abandonedPct: ab,
            aht,
            fcr: rand(0.78, 0.98),
            asa: rand(12, 35),
            timestamp: ts,
          },
        })
      }
    }
  }

  // ── Channel Pulses (today × all clusters × all channels) ─────────────────
  console.log("  channel pulses…")
  for (const cid of clusterIds) {
    for (const [, chId] of Object.entries(channelMap)) {
      if (!chId) continue
      await prisma.channelPulse.create({
        data: {
          channelId: chId,
          clusterId: cid,
          volume: randInt(40, 600),
          avgWaitSec: rand(8, 45),
          timestamp: hoursAgo(randInt(0, 2)),
        },
      })
    }
  }

  // ── Incidents ──────────────────────────────────────────────────────────────
  console.log("  incidents…")
  const INCIDENT_TYPES = [
    "SLA Breach",
    "High Abandon Rate",
    "AHT Spike",
    "System Latency",
    "Agent Shortage",
    "NLU Confidence Drop",
    "Forbidden Intent Detected",
  ]
  for (let i = 0; i < 30; i++) {
    const severity = Math.random() > 0.4 ? "WARNING" : "CRITICAL"
    const ackd = Math.random() > 0.5
    await prisma.incident.create({
      data: {
        severity,
        type: pick(INCIDENT_TYPES),
        description: `Auto-detected ${pick(INCIDENT_TYPES).toLowerCase()} event requiring attention.`,
        clusterId: pick(clusterIds),
        channelId: Math.random() > 0.5 ? pick(Object.values(channelMap)) : null,
        triggeredAt: hoursAgo(randInt(0, 72)),
        acknowledgedAt: ackd ? hoursAgo(randInt(0, 24)) : null,
        metricTrend: Array.from({ length: 8 }, (_, j) => ({
          t: j,
          v: rand(60, 95),
        })),
      },
    })
  }

  // ── Tier Snapshots (30 days) ───────────────────────────────────────────────
  console.log("  tier snapshots…")
  for (let day = 29; day >= 0; day--) {
    const ts = daysAgo(day)
    for (const cid of clusterIds) {
      const t1 = rand(55, 75)
      const t2 = rand(15, 25)
      const t3 = 100 - t1 - t2
      await prisma.tierSnapshot.create({
        data: {
          clusterId: cid,
          tier1Pct: t1,
          tier2Pct: t2,
          tier3Pct: Math.max(0, t3),
          tier1AutocorrectRate: rand(5, 18),
          timestamp: ts,
        },
      })
    }
  }

  // ── Caregiver Cases ────────────────────────────────────────────────────────
  console.log("  caregiver cases…")
  const PROXY = ["YES", "NO", "AMBIGUOUS"] as const
  const CAREGIVER_ACTIONS = ["COMPLETED_WITH_CONSENT", "FAILCLOSED_HANDOFF"] as const
  for (let i = 0; i < 60; i++) {
    const cgCaseId = `CG-${String(i + 1).padStart(5, "0")}`
    await prisma.caregiverCase.upsert({
      where: { caseId: cgCaseId },
      update: {},
      create: {
        caseId: cgCaseId,
        clusterId: pick(clusterIds),
        proxyConfirmed: pick(PROXY),
        action: pick(CAREGIVER_ACTIONS),
        auditTrail: [
          { step: "Tier 3 triggered", ts: daysAgo(randInt(1, 30)).toISOString() },
          { step: "Proxy consent check", ts: daysAgo(randInt(0, 1)).toISOString() },
        ],
        timestamp: daysAgo(randInt(0, 30)),
      },
    })
  }

  // Add consent disclosures for caregiver cases
  const cgCases = await prisma.caregiverCase.findMany({ select: { id: true } })
  for (const cgc of cgCases) {
    await prisma.consentDisclosure.upsert({
      where: { caregiverCaseId: cgc.id },
      update: {},
      create: {
        caseId: `CD-${cgc.id.slice(-6)}`,
        caregiverCaseId: cgc.id,
        consentOnFile: Math.random() > 0.2,
        timestamp: daysAgo(randInt(0, 30)),
      },
    })
  }

  // ── Resolution Splits (30 days × clusters) ────────────────────────────────
  console.log("  resolution splits…")
  for (let day = 29; day >= 0; day--) {
    for (const cid of clusterIds) {
      const ai = rand(40, 82)
      const partial = rand(8, 20)
      await prisma.resolutionSplit.create({
        data: {
          clusterId: cid,
          aiFullPct: ai,
          aiPartialPct: partial,
          humanPct: Math.max(0, 100 - ai - partial),
          volume: randInt(300, 1200),
          timestamp: daysAgo(day),
        },
      })
    }
  }

  // ── Drift Snapshots ────────────────────────────────────────────────────────
  console.log("  drift snapshots…")
  const DIALECTS = ["Najdi","Hijazi","Gulf","Southern","Northern"]
  for (let day = 29; day >= 0; day--) {
    for (const cid of clusterIds) {
      const nlu = rand(0.72, 0.99)
      await prisma.driftSnapshot.create({
        data: {
          clusterId: cid,
          dialect: pick(DIALECTS),
          date: daysAgo(day),
          nluConfidence: nlu,
          intentConfidence: rand(0.70, 0.98),
          flagged: nlu < 0.80,
          message: nlu < 0.80 ? "Confidence below threshold — dialect drift detected" : null,
        },
      })
    }
  }

  // ── Kill Switch (singleton) ────────────────────────────────────────────────
  console.log("  kill switch…")
  await prisma.killSwitch.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      state: "ARMED",
      scope: "ALL",
    },
  })

  // ── Medical Content Approvals ──────────────────────────────────────────────
  console.log("  medical approvals…")
  const APPROVAL_STATUSES = ["APPROVED", "PENDING", "REJECTED"] as const
  for (let i = 0; i < 80; i++) {
    await prisma.medicalContentApproval.create({
      data: {
        caseId: `MC-${String(i + 1).padStart(5, "0")}`,
        clusterId: pick(clusterIds),
        content: `Medical query regarding ${pick(["diabetes management","hypertension medication","post-op care","chronic pain","vaccination schedule"])}.`,
        status: pick(APPROVAL_STATUSES),
        approvedBy: Math.random() > 0.4 ? "Dr. Compliance Officer" : null,
        timestamp: daysAgo(randInt(0, 30)),
      },
    })
  }

  // ── Forbidden Intent Events ────────────────────────────────────────────────
  console.log("  forbidden intent events…")
  const PATTERNS = ["Self-harm inquiry","Medication overdose","Unauthorized prescription","Privacy breach attempt","System exploit probe"]
  for (let i = 0; i < 40; i++) {
    await prisma.forbiddenIntentEvent.create({
      data: {
        caseId: `FI-${String(i + 1).padStart(5, "0")}`,
        pattern: pick(PATTERNS),
        wisalResponse: "Interaction terminated and escalated to human agent per policy.",
        timestamp: daysAgo(randInt(0, 30)),
      },
    })
  }

  // ── Compliance Scores ──────────────────────────────────────────────────────
  console.log("  compliance scores…")
  const FRAMEWORKS = ["NCA", "PDPL", "DGA", "NDMO"] as const
  for (const framework of FRAMEWORKS) {
    const score = rand(72, 99)
    await prisma.complianceScore.upsert({
      where: { framework },
      update: { score, refreshedAt: new Date() },
      create: {
        framework,
        status: score >= 90 ? "COMPLIANT" : score >= 75 ? "PARTIAL" : "NON_COMPLIANT",
        score,
        evidenceRefs: [`/reports/${framework.toLowerCase()}-audit-2026.pdf`],
      },
    })
  }

  // ── Knowledge Articles ─────────────────────────────────────────────────────
  console.log("  knowledge articles…")
  const ARTICLES = [
    { en: "Hypertension Management Guide", ar: "دليل إدارة ضغط الدم" },
    { en: "Post-Surgery Recovery Protocol", ar: "بروتوكول التعافي بعد الجراحة" },
    { en: "Diabetes Patient Communication",ar: "التواصل مع مرضى السكري" },
    { en: "Mental Health Referral Process", ar: "إجراءات الإحالة للصحة النفسية" },
    { en: "Medication Adherence Script",    ar: "نص الالتزام بالأدوية" },
    { en: "Emergency Escalation Protocol", ar: "بروتوكول تصعيد الطوارئ" },
    { en: "Consent Documentation Guide",   ar: "دليل توثيق الموافقة" },
    { en: "Forbidden Intent Response SOP", ar: "إجراءات الاستجابة للنوايا المحظورة" },
  ]
  const ARTICLE_STATUSES = ["DRAFT", "PUBLISHED", "UNPUBLISHED"] as const
  for (const art of ARTICLES) {
    await prisma.knowledgeArticle.create({
      data: {
        titleEn: art.en,
        titleAr: art.ar,
        bodyEn: `Detailed guidance on ${art.en.toLowerCase()}. This article covers key steps, compliance requirements, and communication best practices.`,
        bodyAr: `إرشادات تفصيلية حول ${art.ar}. تغطي هذه المقالة الخطوات الرئيسية ومتطلبات الامتثال وأفضل ممارسات التواصل.`,
        version: randInt(1, 4),
        status: pick(ARTICLE_STATUSES),
        publishedBy: Math.random() > 0.4 ? adminUserId : null,
      },
    })
  }

  // ── Shift Coverage (14 days × 20 clusters × 24 hours) ────────────────────
  console.log("  shift coverage…")
  for (let day = 13; day >= 0; day--) {
    const date = daysAgo(day)
    date.setHours(0, 0, 0, 0)
    for (const cid of clusterIds) {
      for (let hour = 0; hour < 24; hour++) {
        const forecast = randInt(5, 30)
        const staffed = Math.max(0, forecast + randInt(-5, 3))
        await prisma.shiftCoverage.upsert({
          where: { clusterId_date_hour: { clusterId: cid, date, hour } },
          update: {},
          create: { clusterId: cid, date, hour, forecastDemand: forecast, staffed },
        })
      }
    }
  }

  // ── Shift Swap Requests ────────────────────────────────────────────────────
  console.log("  shift swaps…")
  const firstAgents = allAgents.slice(0, 10)
  for (const ag of firstAgents) {
    await prisma.shiftSwapRequest.create({
      data: {
        agentId: ag.id,
        fromShift: daysAgo(randInt(1, 5)),
        toShift: daysAgo(-randInt(1, 3)),
        status: pick(["PENDING", "APPROVED", "REJECTED"] as const),
      },
    })
  }

  // ── QA Sample Items ────────────────────────────────────────────────────────
  console.log("  QA samples…")
  for (let i = 0; i < 50; i++) {
    await prisma.qaSampleItem.create({
      data: {
        interactionId: `INT-${String(i + 1).padStart(6, "0")}`,
        clusterId: pick(clusterIds),
        sentimentScore: rand(-1, 1),
        botConfidence: rand(0.40, 0.99),
        priority: randInt(1, 10),
        reviewed: Math.random() > 0.6,
        createdAt: daysAgo(randInt(0, 7)),
      },
    })
  }

  // ── Training Records ───────────────────────────────────────────────────────
  console.log("  training records…")
  const MODULES = ["NLU Basics","Escalation Protocol","PDPL Compliance","Cultural Sensitivity","Medical Terminology","Wisal Platform v2"]
  for (const ag of allAgents.slice(0, 30)) {
    await prisma.trainingRecord.create({
      data: {
        agentId: ag.id,
        module: pick(MODULES),
        completedAt: daysAgo(randInt(5, 60)),
        qaScoreBefore: rand(60, 80),
        qaScoreAfter: rand(78, 99),
      },
    })
  }

  // ── KPI Scorecards ─────────────────────────────────────────────────────────
  console.log("  KPI scorecards…")
  const KPI_DATA = [
    { metric: "SERVICE_LEVEL"    as const, thisWeek: 81.4, target: 80,   lastWeek: 79.2, owner: "live-operations" },
    { metric: "ABANDONED_CALLS"  as const, thisWeek:  4.8, target:  5,   lastWeek:  5.9, owner: "live-operations" },
    { metric: "AHT"              as const, thisWeek: 298,  target: 300,  lastWeek: 312,  owner: "workforce" },
    { metric: "ASA"              as const, thisWeek:  18,  target:  20,  lastWeek:  22,  owner: "live-operations" },
    { metric: "FCR"              as const, thisWeek:  88.3,target:  90,  lastWeek:  86.1,owner: "workforce" },
    { metric: "CSAT"             as const, thisWeek:  93.2,target:  95,  lastWeek:  91.8,owner: "workforce" },
    { metric: "AI_COMPLETION_RATE"as const,thisWeek:  79.5,target:  80,  lastWeek:  77.0,owner: "intelligence" },
  ]
  for (const kpi of KPI_DATA) {
    await prisma.kpiScorecard.upsert({
      where: { metric: kpi.metric },
      update: { thisWeek: kpi.thisWeek, lastWeek: kpi.lastWeek },
      create: {
        metric: kpi.metric,
        thisWeek: kpi.thisWeek,
        target: kpi.target,
        lastWeek: kpi.lastWeek,
        ownerModule: kpi.owner,
      },
    })
  }

  // ── Cluster Rankings ───────────────────────────────────────────────────────
  console.log("  cluster rankings…")
  const rankPeriod = daysAgo(0)
  rankPeriod.setHours(0, 0, 0, 0)
  for (const cid of clusterIds) {
    await prisma.clusterRanking.upsert({
      where: { clusterId_period: { clusterId: cid, period: rankPeriod } },
      update: {},
      create: {
        clusterId: cid,
        compositeScore: rand(58, 97),
        period: rankPeriod,
        perKpi: {
          SERVICE_LEVEL: rand(72, 95),
          ABANDONED_CALLS: rand(3, 10),
          FCR: rand(78, 98),
          CSAT: rand(75, 99),
          AHT: rand(240, 420),
        },
      },
    })
  }

  // ── Savings Points (90 days) ───────────────────────────────────────────────
  console.log("  savings points…")
  for (let day = 89; day >= 0; day--) {
    await prisma.savingsPoint.create({
      data: {
        date: daysAgo(day),
        agentHoursSaved: rand(120, 480),
        aiResolvedVolume: randInt(800, 3200),
        avgHandleTimeSaved: rand(30, 90),
      },
    })
  }

  // ── Beneficiary Voice Themes ───────────────────────────────────────────────
  console.log("  voice themes…")
  const THEMES = [
    { en: "Long Wait Times",         ar: "أوقات انتظار طويلة",        sentiment: -0.6 },
    { en: "Helpful Agent Interactions",ar: "تفاعلات وكيل مفيدة",     sentiment:  0.8 },
    { en: "Appointment Confusion",   ar: "التباس في المواعيد",         sentiment: -0.4 },
    { en: "Easy Digital Access",     ar: "سهولة الوصول الرقمي",        sentiment:  0.7 },
    { en: "Language Barriers",       ar: "حواجز لغوية",                sentiment: -0.3 },
  ]
  for (const t of THEMES) {
    await prisma.beneficiaryVoiceTheme.create({
      data: {
        theme: t.en,
        themeAr: t.ar,
        plainSummary: `Beneficiaries frequently mention ${t.en.toLowerCase()} as a key experience factor.`,
        plainSummaryAr: `يذكر المستفيدون في كثير من الأحيان ${t.ar} كعامل تجربة رئيسي.`,
        sentiment: t.sentiment,
        weekTrend: Array.from({ length: 7 }, (_, i) => ({ day: i, score: t.sentiment + rand(-0.1, 0.1) })),
        examples: [
          `"${t.en} made the biggest difference in my experience."`,
          `"I noticed ${t.en.toLowerCase()} during my last 3 interactions."`,
        ],
      },
    })
  }

  // ── Beneficiaries (50 per cluster sample) ─────────────────────────────────
  console.log("  beneficiaries…")
  const NAMES_EN = ["Faisal","Maryam","Khaled","Noura","Abdulaziz","Hessa","Tariq","Ruba","Saad","Latifa"]
  const NAMES_AR = ["فيصل","مريم","خالد","نورة","عبدالعزيز","حصة","طارق","ربى","سعد","لطيفة"]
  const beneficiaryIds: string[] = []

  for (const cid of clusterIds) {
    for (let i = 0; i < 5; i++) {
      const idx = randInt(0, NAMES_EN.length - 1)
      const b = await prisma.beneficiary.create({
        data: {
          name: `${NAMES_EN[idx]} Al-${pick(AGENT_LAST).replace("Al-", "")}`,
          nameAr: `${NAMES_AR[idx]} ${pick(AGENT_LAST)}`,
          nationalId: `1${randInt(100_000_000, 999_999_999)}`,
          dateOfBirth: new Date(randInt(1950, 2000), randInt(0, 11), randInt(1, 28)),
          gender: pick(["M", "F"]),
          clusterId: cid,
          consentStatus: pick(["GIVEN", "WITHDRAWN", "PENDING"] as const),
          tier: pick(["T1", "T2", "T3"] as const),
          phone: `+9665${randInt(10_000_000, 99_999_999)}`,
        },
      })
      beneficiaryIds.push(b.id)
    }
  }

  // ── Interactions ───────────────────────────────────────────────────────────
  console.log("  interactions…")
  const INTENTS = ["appointment_booking","medication_inquiry","test_results","complaint","general_inquiry","referral_request"]
  const RESOLUTIONS = ["resolved_ai","resolved_human","escalated","callback_scheduled","info_provided"]

  for (const bid of beneficiaryIds.slice(0, 40)) {
    const b = await prisma.beneficiary.findUnique({ where: { id: bid } })
    if (!b) continue
    for (let i = 0; i < randInt(1, 5); i++) {
      const chType = pick(CHANNELS)
      await prisma.interaction.create({
        data: {
          beneficiaryId: bid,
          channelId: channelMap[chType]!,
          clusterId: b.clusterId,
          agentId: Math.random() > 0.4 ? pick(agentIds) : null,
          startedAt: daysAgo(randInt(0, 30)),
          durationSec: randInt(60, 1200),
          intent: pick(INTENTS),
          sentiment: rand(-0.8, 0.9),
          resolution: pick(RESOLUTIONS),
        },
      })
    }
  }

  // ── Tickets ────────────────────────────────────────────────────────────────
  console.log("  tickets…")
  const TICKET_DESC = [
    "Patient unable to book appointment through Mawid portal",
    "Medication not delivered as scheduled",
    "Complaint about call wait time exceeding 30 minutes",
    "Request for medical record copy",
    "Caregiver access issue — proxy not recognized",
    "Incorrect billing notification received",
  ]
  for (let i = 0; i < 60; i++) {
    const bid = pick(beneficiaryIds)
    const b = await prisma.beneficiary.findUnique({ where: { id: bid } })
    if (!b) continue
    const slaDue = new Date(Date.now() + randInt(1, 7) * 86_400_000)
    await prisma.ticket.create({
      data: {
        beneficiaryId: bid,
        clusterId: b.clusterId,
        type: pick(["COMPLAINT", "REQUEST"] as const),
        status: pick(["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"] as const),
        priority: pick(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const),
        description: pick(TICKET_DESC),
        slaDueAt: slaDue,
        escalationPath: Math.random() > 0.6 ? "Supervisor → Compliance" : null,
        assignedAgentId: Math.random() > 0.5 ? pick(agentIds) : null,
      },
    })
  }

  // ── Campaigns ──────────────────────────────────────────────────────────────
  console.log("  campaigns…")
  const CAMPAIGN_DATA = [
    { en: "Flu Vaccination Reminder Q1",    ar: "تذكير تطعيم الإنفلونزا ربع 1",   type: "REMINDER"    as const },
    { en: "Chronic Care Survey 2026",       ar: "استطلاع الرعاية المزمنة 2026",    type: "SURVEY"      as const },
    { en: "Diabetes Awareness Week",        ar: "أسبوع الوعي بالسكري",             type: "AWARENESS"   as const },
    { en: "Missed Appointment Reschedule",  ar: "إعادة جدولة المواعيد الفائتة",    type: "RESCHEDULE"  as const },
    { en: "Post-Surgery Follow-Up",         ar: "متابعة ما بعد الجراحة",           type: "REMINDER"    as const },
  ]
  for (const camp of CAMPAIGN_DATA) {
    const sent = randInt(1000, 8000)
    const delivered = Math.floor(sent * rand(0.85, 0.99))
    const responded = Math.floor(delivered * rand(0.15, 0.55))
    await prisma.campaign.create({
      data: {
        name: camp.en,
        nameAr: camp.ar,
        type: camp.type,
        status: pick(["ACTIVE", "COMPLETED", "PAUSED"] as const),
        sent,
        delivered,
        responded,
        outcomeMetrics: {
          positiveOutcome: Math.floor(responded * rand(0.6, 0.9)),
          noResponse: sent - delivered,
          bounced: sent - delivered,
        },
        startedAt: daysAgo(randInt(7, 30)),
        completedAt: Math.random() > 0.5 ? daysAgo(randInt(0, 7)) : null,
      },
    })
  }

  // ── Penalty Records ────────────────────────────────────────────────────────
  console.log("  penalty records…")
  const PENALTY_KPIS = ["SERVICE_LEVEL", "ABANDONED_CALLS", "FCR", "ASA"]
  for (const cid of clusterIds.slice(0, 10)) {
    for (const kpi of PENALTY_KPIS) {
      const fail = rand(0.01, 0.15)
      const tolerance = 0.05
      const breached = fail > tolerance
      await prisma.penaltyRecord.create({
        data: {
          clusterId: cid,
          period: daysAgo(randInt(0, 30)),
          kpi,
          failurePct: fail * 100,
          permissibleTolerance: tolerance * 100,
          breached,
          penaltyAmount: breached ? fail * 500_000 : 0,
          basis: "Avg failure % × SAR 500,000 operating cost base (RFP §6)",
        },
      })
    }
  }

  // ── Integration Status ─────────────────────────────────────────────────────
  console.log("  integration statuses…")
  const INTEGRATIONS = [
    { system: "NAFATH" as const, state: "UP"       as const, latency: 42,  pattern: "EVENT" as const },
    { system: "MAWID"  as const, state: "DEGRADED" as const, latency: 890, pattern: "SYNC"  as const },
    { system: "SEHHATY"as const, state: "UP"       as const, latency: 61,  pattern: "SYNC"  as const },
    { system: "HR"     as const, state: "UP"       as const, latency: 28,  pattern: "SYNC"  as const },
    { system: "NMR"    as const, state: "UP"       as const, latency: 35,  pattern: "EVENT" as const },
  ]
  for (const intg of INTEGRATIONS) {
    await prisma.integrationStatus.upsert({
      where: { system: intg.system },
      update: { state: intg.state, latencyMs: intg.latency, lastSyncAt: hoursAgo(randInt(0, 2)) },
      create: {
        system: intg.system,
        state: intg.state,
        latencyMs: intg.latency,
        pattern: intg.pattern,
        lastSyncAt: hoursAgo(randInt(0, 2)),
      },
    })
  }

  // ── System Health ──────────────────────────────────────────────────────────
  console.log("  system health…")
  await prisma.systemHealth.create({
    data: {
      availabilityPct: 99.9998,
      dr: {
        VOICE:    { rtoMin: 15, rpoMin: 5  },
        WHATSAPP: { rtoMin: 10, rpoMin: 2  },
        EMAIL:    { rtoMin: 60, rpoMin: 30 },
        LIVE_CHAT:{ rtoMin: 10, rpoMin: 2  },
      },
      lastDrTestAt: daysAgo(7),
      region: "KSA",
    },
  })

  // ── Audit Logs (mutations sample) ─────────────────────────────────────────
  console.log("  audit logs…")
  const ACTIONS = ["ACKNOWLEDGE_INCIDENT","APPROVE_SHIFT_SWAP","REJECT_SHIFT_SWAP","ASSIGN_TICKET","RESOLVE_TICKET","PUBLISH_ARTICLE","UPDATE_KILL_SWITCH"]
  const ENTITIES = ["Incident","ShiftSwapRequest","Ticket","KnowledgeArticle","KillSwitch"]
  for (let i = 0; i < 50; i++) {
    await prisma.auditLog.create({
      data: {
        actor: pick(userIds),
        action: pick(ACTIONS),
        entity: pick(ENTITIES),
        entityId: `SEED-${randInt(1000, 9999)}`,
        meta: { reason: "Seeded audit trail entry", automated: false },
        timestamp: daysAgo(randInt(0, 30)),
      },
    })
  }

  console.log("✅ Seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
