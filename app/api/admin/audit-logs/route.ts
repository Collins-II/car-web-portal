// app/api/admin/audit-logs/route.ts
import { connectToDatabase } from "@/lib/database"
import auditLog from "@/lib/database/models/audit-log"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  await connectToDatabase()

  const { searchParams } = new URL(req.url)

  const q = searchParams.get("q")
  const page = Number(searchParams.get("page") || 1)
  const limit = Number(searchParams.get("limit") || 20)
  const skip = (page - 1) * limit

  const filter: any = {}

  if (q) {
    filter.$or = [
      { actorName: new RegExp(q, "i") },
      { action: new RegExp(q, "i") },
      { entity: new RegExp(q, "i") },
    ]
  }

  const [items, total] = await Promise.all([
    auditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    auditLog.countDocuments(filter),
  ])

  return NextResponse.json({
    items,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  })
}
