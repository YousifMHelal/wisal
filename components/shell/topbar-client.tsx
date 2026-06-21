"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { useState, useTransition, useRef, useEffect } from "react"
import {
  Search,
  Sun,
  Moon,
  Languages,
  ChevronDown,
  LogOut,
  User,
  Menu,
  MapPin,
  Calendar,
} from "lucide-react"
import { signOutAction } from "@/lib/actions/auth"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { MobileNav } from "@/components/shell/sidebar"
import type { KpiStatus } from "@/lib/kpi"
import type { ModuleId } from "@/lib/module-status"
import type { SearchResult } from "@/lib/actions/search"
import { globalSearch } from "@/lib/actions/search"

interface Cluster {
  id: string
  name: string
}

interface TopBarClientProps {
  clusters: Cluster[]
  locale: string
  userName: string
  userRole: string
  statuses: Record<ModuleId, KpiStatus>
}

const DATE_RANGES = [
  { value: "live", en: "Live", ar: "مباشر" },
  { value: "today", en: "Today", ar: "اليوم" },
  { value: "7d", en: "7 Days", ar: "٧ أيام" },
  { value: "30d", en: "30 Days", ar: "٣٠ يوم" },
  { value: "custom", en: "Custom", ar: "مخصص" },
]

export function TopBarClient({ clusters, locale, userName, userRole, statuses }: TopBarClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  const isAr = locale === "ar"

  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [, startTransition] = useTransition()
  const searchRef = useRef<HTMLDivElement>(null)

  const currentCluster = searchParams.get("cluster") ?? ""
  const currentRange = searchParams.get("range") ?? "live"

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  async function handleSearch(q: string) {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    const fd = new FormData()
    fd.set("query", q)
    const { results } = await globalSearch(undefined, fd)
    setSearchResults(results)
    setSearchOpen(results.length > 0)
  }

  function handleSearchSelect(result: SearchResult) {
    setSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
    router.push(result.href)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function switchLocale() {
    const next = locale === "ar" ? "en" : "ar"
    document.cookie = `locale=${next};path=/;max-age=31536000`
    router.refresh()
  }

  const clusterLabel = currentCluster
    ? clusters.find((c) => c.id === currentCluster)?.name ?? currentCluster
    : isAr ? "كل المجموعات" : "All Clusters"

  const rangeLabel = DATE_RANGES.find((r) => r.value === currentRange)?.[isAr ? "ar" : "en"] ?? "Live"

  return (
    <header className="h-14 flex items-center border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30 gap-2 ps-3 pe-3">
      {/* Mobile: hamburger */}
      <button
        className="lg:hidden flex items-center justify-center size-9 rounded-md hover:bg-accent text-foreground transition-colors cursor-pointer min-h-11 min-w-11"
        onClick={() => setMobileOpen(true)}
        aria-label={isAr ? "فتح القائمة" : "Open navigation"}
      >
        <Menu className="size-5" />
      </button>

      {/* Brand (mobile only) */}
      <span className="lg:hidden text-sm font-semibold text-foreground flex-1 truncate">
        {isAr ? "وصال" : "Wisal CC"}
      </span>

      {/* Desktop: cluster + date selectors */}
      <div className="hidden lg:flex items-center gap-2 flex-1">
        {/* Cluster selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-input bg-transparent text-sm cursor-pointer hover:bg-accent transition-colors min-h-11"
          >
            <MapPin className="size-3.5 text-muted-foreground" />
            <span className="max-w-35 truncate">{clusterLabel}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 max-h-80">
            <DropdownMenuItem onSelect={() => updateParam("cluster", "")}>
              {isAr ? "كل المجموعات" : "All Clusters"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {clusters.map((c) => (
              <DropdownMenuItem key={c.id} onSelect={() => updateParam("cluster", c.id)}>
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date range selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-input bg-transparent text-sm cursor-pointer hover:bg-accent transition-colors min-h-11"
          >
            <Calendar className="size-3.5 text-muted-foreground" />
            <span>{rangeLabel}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {DATE_RANGES.map((r) => (
              <DropdownMenuItem key={r.value} onSelect={() => updateParam("range", r.value)}>
                {r[isAr ? "ar" : "en"]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Global search */}
        <div ref={searchRef} className="relative flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute inset-s-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => startTransition(() => { void handleSearch(e.target.value) })}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              placeholder={isAr ? "بحث…" : "Search cases, agents, clusters…"}
              className="w-full h-8 rounded-lg border border-input bg-transparent ps-8 pe-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition-colors"
              aria-label={isAr ? "بحث عالمي" : "Global search"}
              aria-expanded={searchOpen}
              aria-haspopup="listbox"
            />
          </div>
          {searchOpen && searchResults.length > 0 && (
            <div
              role="listbox"
              className="absolute top-full mt-1 inset-s-0 inset-e-0 z-50 rounded-lg border border-border bg-popover shadow-lg overflow-hidden"
            >
              {searchResults.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  role="option"
                  onClick={() => handleSearchSelect(r)}
                  className="w-full text-start px-3 py-2 text-sm hover:bg-accent cursor-pointer transition-colors flex flex-col gap-0.5 min-h-11 justify-center"
                >
                  <span className="font-medium">{r.label}</span>
                  {r.sublabel && <span className="text-xs text-muted-foreground">{r.sublabel}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: filter + search icon */}
      <div className="lg:hidden flex items-center gap-1">
        <button
          className="flex items-center justify-center size-9 rounded-md hover:bg-accent text-foreground transition-colors cursor-pointer min-h-11 min-w-11"
          onClick={() => setFilterOpen(true)}
          aria-label={isAr ? "الفلاتر" : "Filters and search"}
        >
          <Search className="size-5" />
        </button>
      </div>

      {/* Right: theme + lang + account */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center size-9 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-11 min-w-11"
          aria-label={isAr ? "تبديل المظهر" : "Toggle theme"}
        >
          {mounted ? (theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />) : <Sun className="size-4 opacity-0" />}
        </button>

        {/* Language toggle */}
        <button
          onClick={switchLocale}
          className="flex items-center justify-center size-9 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-h-11 min-w-11"
          aria-label="Switch language"
        >
          <Languages className="size-4" />
        </button>

        {/* Account menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-accent text-sm cursor-pointer transition-colors min-h-11">
            <div className="size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground text-xs font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block max-w-25 truncate text-foreground">{userName}</span>
            <ChevronDown className="size-3.5 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">{userName}</span>
                <span className="text-xs text-muted-foreground font-normal">{userRole}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="size-4" />
              {isAr ? "الملف الشخصي" : "Profile"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => void signOutAction()}>
              <LogOut className="size-4" />
              {isAr ? "تسجيل الخروج" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile nav drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle>{isAr ? "مركز وصال" : "Wisal Command Center"}</SheetTitle>
          </SheetHeader>
          <MobileNav statuses={statuses} locale={locale} onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Mobile filter/search sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="top" className="h-auto pb-6">
          <SheetHeader className="mb-4">
            <SheetTitle>{isAr ? "البحث والفلاتر" : "Search & Filters"}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <Search className="absolute inset-s-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => startTransition(() => { void handleSearch(e.target.value) })}
                placeholder={isAr ? "بحث…" : "Search cases, agents, clusters…"}
                className="w-full h-10 rounded-lg border border-input bg-transparent ps-9 pe-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 transition-colors"
              />
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 inset-s-0 inset-e-0 z-50 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                  {searchResults.map((r) => (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => { handleSearchSelect(r); setFilterOpen(false) }}
                      className="w-full text-start px-3 py-2 text-sm hover:bg-accent cursor-pointer transition-colors flex flex-col gap-0.5 min-h-11 justify-center"
                    >
                      <span className="font-medium">{r.label}</span>
                      {r.sublabel && <span className="text-xs text-muted-foreground">{r.sublabel}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cluster */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{isAr ? "المجموعة" : "Cluster"}</label>
                <select
                  value={currentCluster}
                  onChange={(e) => updateParam("cluster", e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background text-sm px-2 focus:outline-none focus:border-ring"
                >
                  <option value="">{isAr ? "كل المجموعات" : "All Clusters"}</option>
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{isAr ? "النطاق الزمني" : "Date range"}</label>
                <select
                  value={currentRange}
                  onChange={(e) => updateParam("range", e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background text-sm px-2 focus:outline-none focus:border-ring"
                >
                  {DATE_RANGES.map((r) => (
                    <option key={r.value} value={r.value}>{r[isAr ? "ar" : "en"]}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setFilterOpen(false)}
              className="flex items-center justify-center h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity"
            >
              {isAr ? "تطبيق" : "Apply"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
