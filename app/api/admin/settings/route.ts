import { connectToDatabase } from "@/lib/database"
import { NextResponse } from "next/server"
import Settings from "@/lib/database/models/settings"

export async function GET() {
  await connectToDatabase()

  let settings = await Settings.findOne()
  if (!settings) {
    settings = await Settings.create({})
  }

  return NextResponse.json(settings)
}

export async function PUT(req: Request) {
  await connectToDatabase()
  const data = await req.json()

  const settings = await Settings.findOneAndUpdate(
    {},
    data,
    { new: true, upsert: true }
  )

  return NextResponse.json(settings)
}
