import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ScaleProduct from "@/lib/database/models/scales_product";

/* slug → "Weighbridge" */
function slugToScaleType(slug: string) {
  return slug
    .replace(/-scale$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const scaleType = slugToScaleType(slug);

    await connectToDatabase();

    const products = await ScaleProduct.find({
      scaleType,
      isActive: true
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCTS_BY_TYPE_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
