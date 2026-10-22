import { connectToDatabase } from "@/lib/database"
import { Quote } from "@/lib/database/models/quote"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  await connectToDatabase()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const filter: any = {}
  if (status) filter.status = status

  const quotes = await Quote.find(filter)
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json(quotes)
}

export async function PATCH(req: Request) {
  await connectToDatabase()
  const { id, status } = await req.json()

  await Quote.findByIdAndUpdate(id, { status })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  await connectToDatabase()
  const { id } = await req.json()

  await Quote.findByIdAndDelete(id)

  return NextResponse.json({ success: true })
}
