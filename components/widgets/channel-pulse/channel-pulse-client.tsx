"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Phone, MessageSquare, MessageCircle, Mail, Video, Share2 } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ChannelPulseRow } from "@/lib/queries/live-operations"
import { cn } from "@/lib/utils"

const CHANNEL_META: Record<string, { label: string; labelAr: string; icon: React.ReactNode }> = {
  VOICE: { label: "Voice", labelAr: "صوتي", icon: <Phone className="size-4" aria-hidden /> },
  WHATSAPP: { label: "WhatsApp", labelAr: "واتساب", icon: <MessageSquare className="size-4" aria-hidden /> },
  LIVE_CHAT: { label: "Live Chat", labelAr: "دردشة", icon: <MessageCircle className="size-4" aria-hidden /> },
  EMAIL: { label: "Email", labelAr: "بريد", icon: <Mail className="size-4" aria-hidden /> },
  SIGN_LANGUAGE_VIDEO: { label: "Sign Lang.", labelAr: "لغة إشارة", icon: <Video className="size-4" aria-hidden /> },
  SOCIAL: { label: "Social", labelAr: "اجتماعي", icon: <Share2 className="size-4" aria-hidden /> },
}

function formatWait(sec: number) {
  if (sec < 60) return `${Math.round(sec)}s`
  return `${(sec / 60).toFixed(1)}m`
}

interface Props {
  data: ChannelPulseRow[]
  locale: string
}

export function ChannelPulseClient({ data, locale }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAr = locale === "ar"

  const handleChannelClick = (channelType: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("channel", channelType)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-6"
      role="list"
      aria-label={isAr ? "حالة القنوات" : "Channel status"}
    >
      {data.map((ch) => {
        const meta = CHANNEL_META[ch.channelType] ?? {
          label: ch.channelType,
          labelAr: ch.channelType,
          icon: <MessageCircle className="size-4" aria-hidden />,
        }

        return (
          <button
            key={ch.channelId}
            onClick={() => handleChannelClick(ch.channelType)}
            className={cn(
              "snap-start flex-shrink-0 w-[148px] md:w-auto",
              "flex flex-col gap-2 rounded-lg border bg-card p-3 text-start",
              "cursor-pointer hover:border-primary/60 hover:bg-accent transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "min-h-[44px]"
            )}
            role="listitem"
            aria-label={`${isAr ? meta.labelAr : meta.label}: ${ch.volume.toLocaleString()} interactions, ${formatWait(ch.avgWaitSec)} avg wait`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-primary">{meta.icon}</span>
              <StatusBadge status={ch.status} dot />
            </div>

            <div>
              <p className="text-xs font-medium text-foreground truncate">
                {isAr ? meta.labelAr : meta.label}
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="text-2xl font-semibold tabular text-foreground leading-none">
                {ch.volume.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground tabular">
                {formatWait(ch.avgWaitSec)} {isAr ? "انتظار" : "avg wait"}
              </div>
            </div>

            <StatusBadge status={ch.status} className="self-start" />
          </button>
        )
      })}
    </div>
  )
}
