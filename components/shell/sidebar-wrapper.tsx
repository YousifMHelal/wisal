"use client"

import { useState } from "react"
import { SidebarRail } from "./sidebar"
import type { KpiStatus } from "@/lib/kpi"
import type { ModuleId } from "@/lib/module-status"

interface SidebarWrapperProps {
  statuses: Record<ModuleId, KpiStatus>
  locale: string
}

export function SidebarWrapper({ statuses, locale }: SidebarWrapperProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarRail
      statuses={statuses}
      locale={locale}
      collapsed={collapsed}
      onToggle={() => setCollapsed((c) => !c)}
    />
  )
}
