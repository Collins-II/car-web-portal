import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ScaleProduct from "@/lib/database/models/scales_product";
import Category from "@/lib/database/models/category";
// import { getCurrentUser } from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    // 🔐 Auth (enable when ready)
    /*
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    await connectToDatabase();

    const products = await ScaleProduct.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 🔐 Auth (enable when ready)
    /*
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const body = await req.json();

    const {
      name,
      slug,
      categoryId,
      scaleType,
      description,
      image,
      gallery = [],
      price,
      currency = "ZMW",
      features = [],
      specifications = {},
      dimensions,
      minCapacity,
      maxCapacity,
      accuracyClass,
      certifications = [],
      variants = [],
      stock = 0,
      tags = [],
      isActive = true
    } = body;

    if (
    !name ||
    !slug ||
    !categoryId ||
    !scaleType ||
    !description ||
    !image ||
    typeof price !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const product = await ScaleProduct.create({
      name,
      slug,
      category: category._id,
      categorySlug: category.slug,
      scaleType,
      description,
      image,
      gallery,
      price,
      currency,
      features,
      specifications,
      dimensions,
      minCapacity,
      maxCapacity,
      accuracyClass,
      certifications,
      variants,
      stock,
      inStock: stock > 0,
      tags,
      isActive
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_POST]", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
