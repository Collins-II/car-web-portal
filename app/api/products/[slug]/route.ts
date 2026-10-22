import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ScaleProduct from "@/lib/database/models/scales_product";
import Category from "@/lib/database/models/category";
// import { getCurrentUser } from "@/app/actions/getCurrentUser";

/* ------------------------------------------------------------
   📥 GET — Fetch product by slug
------------------------------------------------------------ */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    await connectToDatabase();

    const product = await ScaleProduct.findOne({ slug })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_GET_SLUG]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------
   🗑 DELETE — Delete product by slug
------------------------------------------------------------ */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectToDatabase();

    const product = await ScaleProduct.findOneAndDelete({ slug });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_DELETE_SLUG]", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
