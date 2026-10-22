import { NextRequest, NextResponse } from "next/server";
import Category from "@/lib/database/models/category";
import { connectToDatabase } from "@/lib/database";
// import { getCurrentUser } from "@/app/actions/getCurrentUser";

/* ------------------------------------------------------------
   🔐 CORS CONFIG
------------------------------------------------------------ */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/* ------------------------------------------------------------
   🧠 OPTIONS
------------------------------------------------------------ */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/* ------------------------------------------------------------
   📥 GET — Fetch Categories (Admin)
------------------------------------------------------------ */
export async function GET() {
  try {
    await connectToDatabase();

    const categories = await Category.find()
      .select("_id name slug image icon parent description createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = categories.map((cat) => ({
      _id: String(cat._id),
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      parent: cat.parent ? String(cat.parent) : null,
      image: cat.image || undefined,
      icon: cat.icon || undefined,
      visualType: cat.icon ? "icon" : cat.image ? "image" : null,
    }));

    return NextResponse.json(formatted, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_GET]", error);

    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/* ------------------------------------------------------------
   ➕ POST — Create Category (Admin)
------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    /*
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: CORS_HEADERS }
      );
    }
    */

    const body = await req.json();
    const {
      name,
      slug,
      description,
      parent,
      image,
      icon,
    } = body;

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Enforce single visual type
    if (image && icon) {
      return NextResponse.json(
        { error: "Category can have either an image or an icon, not both" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    await connectToDatabase();

    const exists = await Category.findOne({ slug: slug.trim() });
    if (exists) {
      return NextResponse.json(
        { error: "Category slug already exists" },
        { status: 409, headers: CORS_HEADERS }
      );
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || "",
      parent: parent || null,
      image: image || undefined,
      icon: icon || undefined,
    });

    return NextResponse.json(
      {
        _id: String(category._id),
        name: category.name,
        slug: category.slug,
        image: category.image,
        icon: category.icon,
      },
      {
        status: 201,
        headers: CORS_HEADERS,
      }
    );
  } catch (error) {
    console.error("[ADMIN_CATEGORIES_POST]", error);

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
