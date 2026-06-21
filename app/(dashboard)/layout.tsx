import { cookies } from "next/headers"
import { resolveLocale } from "@/lib/i18n"
import { requireAuth } from "@/lib/auth"
import { getModuleStatuses } from "@/lib/module-status"
import { SidebarWrapper } from "@/components/shell/sidebar-wrapper"
import { TopBar } from "@/components/shell/topbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth guard — redirects to /signin if unauthenticated
  await requireAuth()

  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get("locale")?.value)

  // Server-compute module status dots (one DB round-trip, shared)
  const statuses = await getModuleStatuses()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Skip to main content — keyboard/screen-reader a11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:inset-s-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      {/* Persistent sidebar (lg+) */}
      <SidebarWrapper statuses={statuses} locale={locale} />

      {/* Main area: topbar + scrollable content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar locale={locale} statuses={statuses} />

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
