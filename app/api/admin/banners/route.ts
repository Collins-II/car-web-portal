import { connectToDatabase } from "@/lib/database";
import { Banner } from "@/lib/database/models/banner";
import { NextResponse } from "next/server";

/*async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}*/

export async function GET() {
  try {
    await connectToDatabase();

    const banners = await Banner.find().sort({ position: 1 });

    return NextResponse.json({ success: true, data: banners });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const banner = await Banner.create({
      title: body.title,
      subtitle: body.subtitle,
      image: body.image,
      link: body.link,
      position: body.position ?? 0,
      isActive: body.isActive ?? true,
      startAt: body.startAt,
      endAt: body.endAt
    });

    return NextResponse.json(
      { success: true, data: banner },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}
