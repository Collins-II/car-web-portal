import { connectToDatabase } from "@/lib/database";
import { Banner } from "@/lib/database/models/banner";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();

    const banners = await Banner.find({
      isActive: true,
      $and: [
        { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: null }, { endAt: { $gte: now } }] }
      ]
    }).sort({ position: 1 }).limit(4);

    return NextResponse.json(
      { success: true, data: banners },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
        }
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to load banners" },
      { status: 500 }
    );
  }
}
