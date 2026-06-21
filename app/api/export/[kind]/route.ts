import { NextRequest, NextResponse } from "next/server"
import { buildExportCsv } from "@/lib/actions/governance"
import { auth } from "@/auth"
import { hasRole } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string }> }
) {
  const session = await auth()
  if (!session?.user || !hasRole(session.user.role, "COMPLIANCE")) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const { kind } = await params
  const sp = req.nextUrl.searchParams

  try {
    const { csv, filename } = await buildExportCsv({
      kind,
      from: sp.get("from") ?? undefined,
      to: sp.get("to") ?? undefined,
      cluster: sp.get("cluster") ?? undefined,
    })

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (e) {
    return new NextResponse("Export failed", { status: 400 })
  }
}
