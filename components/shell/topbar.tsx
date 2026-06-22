import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { ROLE_LABELS } from "@/lib/auth"
import type { ModuleId } from "@/lib/module-status"
import type { KpiStatus } from "@/lib/kpi"
import { TopBarClient } from "./topbar-client"

interface TopBarProps {
  locale: string
  statuses: Record<ModuleId, KpiStatus>
}

export async function TopBar({ locale, statuses }: TopBarProps) {
  const [session, clusters] = await Promise.all([
    requireAuth(),
    prisma.cluster.findMany({
      select: { id: true, name: true, nameAr: true },
      orderBy: { name: "asc" },
    }),
  ])

  const userName = session.user.name ?? session.user.email ?? "User"
  const userRole = ROLE_LABELS[session.user.role]

  return (
    <Suspense fallback={<div className="h-14 border-b border-border bg-background/95" />}>
      <TopBarClient
        clusters={clusters}
        locale={locale}
        userName={userName}
        userRole={userRole}
        statuses={statuses}
      />
    </Suspense>
  )
}
