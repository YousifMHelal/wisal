"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

const SearchSchema = z.object({
  query: z.string().min(1).max(100).trim(),
})

export type SearchResult = {
  type: "cluster" | "agent" | "case"
  id: string
  label: string
  sublabel?: string
  href: string
}

export async function globalSearch(
  _prev: unknown,
  formData: FormData
): Promise<{ results: SearchResult[]; error?: string }> {
  await requireAuth()

  const parsed = SearchSchema.safeParse({ query: formData.get("query") })
  if (!parsed.success) return { results: [] }

  const q = parsed.data.query

  const [clusters, agents, tickets] = await Promise.all([
    prisma.cluster.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true, region: true },
    }),
    prisma.agent.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, name: true, team: true, cluster: { select: { name: true } } },
    }),
    prisma.ticket.findMany({
      where: { id: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, type: true, status: true, cluster: { select: { name: true } } },
    }),
  ])

  const results: SearchResult[] = [
    ...clusters.map((c) => ({
      type: "cluster" as const,
      id: c.id,
      label: c.name,
      sublabel: c.region ?? undefined,
      href: `/live-operations?cluster=${c.id}`,
    })),
    ...agents.map((a) => ({
      type: "agent" as const,
      id: a.id,
      label: a.name,
      sublabel: `${a.team} — ${a.cluster.name}`,
      href: `/workforce?agent=${a.id}`,
    })),
    ...tickets.map((t) => ({
      type: "case" as const,
      id: t.id,
      label: `Case ${t.id}`,
      sublabel: `${t.type} · ${t.status} · ${t.cluster.name}`,
      href: `/workforce?ticket=${t.id}`,
    })),
  ]

  return { results }
}
