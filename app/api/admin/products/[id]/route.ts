import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ScaleProduct from "@/lib/database/models/scales_product";
import Category from "@/lib/database/models/category";
// import { getCurrentUser } from "@/app/actions/getCurrentUser";

interface UpdateProductBody {
  name?: string;
  slug?: string;
  categoryId?: string;
  categoryType?: string;
  description?: string;
  image?: string;
  gallery?: string[];
  price?: number;
  currency?: "ZMW" | "USD";
  features?: string[];
  specifications?: Record<string, string>;
  dimensions?: string;
  minCapacity?: number;
  maxCapacity?: number;
  accuracyClass?: string;
  certifications?: string[];
  variants?: any[];
  stock?: number;
  tags?: string[];
  isActive?: boolean;
}

/* ------------------------------------------------------------
   📥 GET product by ID
------------------------------------------------------------ */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const product = await ScaleProduct.findById(id).populate(
      "category",
      "name slug"
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_GET_ID]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------
   ✏️ UPDATE product
------------------------------------------------------------ */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateProductBody = await req.json();

    await connectToDatabase();

    const product = await ScaleProduct.findById({_id: id});
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validate category change
    if (body.categoryId) {
      const category = await Category.findById(body.categoryId);
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category ID" },
          { status: 400 }
        );
      }

      product.category = category._id;
      product.categorySlug = category.slug;
    }

    const updatableFields = [
      "name",
      "slug",
      "categoryType",
      "description",
      "image",
      "gallery",
      "price",
      "currency",
      "features",
      "specifications",
      "dimensions",
      "minCapacity",
      "maxCapacity",
      "accuracyClass",
      "certifications",
      "variants",
      "stock",
      "tags",
      "isActive"
    ] as const;

    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        // @ts-ignore
        product[field] = body[field];
      }
    });

    if (body.stock !== undefined) {
      product.inStock = product.stock > 0;
    }

    await product.save();

    return NextResponse.json(product);
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_PUT_ID]", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------
   🗑 DELETE product
------------------------------------------------------------ */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    const product = await ScaleProduct.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_DELETE_ID]", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
