"use server"

import { z } from "zod"
import { checkRole } from "@/lib/auth"
import { searchBeneficiaries, getBeneficiary360 } from "@/lib/queries/operations"
import type { BeneficiarySearchResult, Beneficiary360 } from "@/lib/queries/operations"

const SearchSchema = z.object({
  query: z.string().min(2).max(100),
})

const LookupSchema = z.object({
  id: z.string().cuid(),
})

export async function searchBeneficiaryAction(
  formData: { query: string }
): Promise<{ results: BeneficiarySearchResult[]; error?: string }> {
  const allowed = await checkRole("SUPERVISOR")
  if (!allowed) return { results: [], error: "Insufficient permissions" }

  const parsed = SearchSchema.safeParse(formData)
  if (!parsed.success) return { results: [], error: "Query must be at least 2 characters" }

  const results = await searchBeneficiaries(parsed.data.query)
  return { results }
}

export async function getBeneficiary360Action(
  formData: { id: string }
): Promise<{ data: Beneficiary360 | null; error?: string }> {
  const allowed = await checkRole("SUPERVISOR")
  if (!allowed) return { data: null, error: "Insufficient permissions" }

  const parsed = LookupSchema.safeParse(formData)
  if (!parsed.success) return { data: null, error: "Invalid beneficiary ID" }

  const data = await getBeneficiary360(parsed.data.id)
  return { data }
}
