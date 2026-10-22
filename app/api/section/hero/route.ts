import { connectToDatabase } from "@/lib/database";
import { Hero } from "@/lib/database/models/hero";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    const hero = await Hero.find({
      isActive: true,
      $and: [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: null }, { endAt: { $gte: now } }] }
      ]
    }).sort({ position: 1 }).limit(10);

    return NextResponse.json(
      { success: true, data: hero },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to load hero" },
      { status: 500 }
    );
  }
}
