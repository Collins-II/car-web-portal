import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { getCurrentUser } from "@/app/actions/getCurrentUser";
import Category from "@/lib/database/models/category";
import AuditLog from "@/lib/database/models/audit-log";

/* ------------------------------------------------------------
   🔐 Helpers
------------------------------------------------------------ */
function forbidden(message: string) {
  return NextResponse.json({ error: message }, { status: 403 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/* ------------------------------------------------------------
   ✏️ UPDATE CATEGORY
------------------------------------------------------------ */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return forbidden("Unauthorized");
    }

    await connectToDatabase();

    const body = await req.json();
    const { id: categoryId } = await params;

    const existing = await Category.findById(categoryId);
    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    /* -----------------------------
       Validation
    ----------------------------- */
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await Category.findOne({
        slug: body.slug,
        _id: { $ne: categoryId },
      });

      if (slugExists) {
        return badRequest("Slug already exists");
      }
    }

    if (body.image && body.icon) {
      return badRequest("Category cannot have both image and icon");
    }

    /* -----------------------------
       Allowed Fields (Whitelist)
    ----------------------------- */
    const updateData = {
      name: body.name?.trim(),
      slug: body.slug?.trim(),
      description: body.description?.trim(),
      image: body.image || undefined,
      icon: body.icon || undefined,
      parent: body.parent ?? null,
      isActive: body.isActive,
      position: body.position,
      seo: body.seo,
    };

    // Remove undefined keys
    Object.keys(updateData).forEach(
      key =>
        updateData[key as keyof typeof updateData] === undefined &&
        delete updateData[key as keyof typeof updateData]
    );

    const updated = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true }
    );

    /* -----------------------------
       Audit Log
    ----------------------------- */
    await AuditLog.create({
      adminId: user._id,
      action: "UPDATE",
      entity: "CATEGORY",
      entityId: categoryId,
      before: existing.toObject(),
      after: updated?.toObject(),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[ADMIN_CATEGORY_UPDATE]", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------
   🗑 DELETE CATEGORY (Soft Delete Recommended)
------------------------------------------------------------ */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return forbidden("Unauthorized");
    }

    await connectToDatabase();

    const { id } = await params;
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    /* -----------------------------
       Soft Delete (Preferred)
    ----------------------------- */
    category.isActive = false;
    await category.save();

    await AuditLog.create({
      adminId: user._id,
      action: "DELETE",
      entity: "CATEGORY",
      entityId: category._id,
      before: category.toObject(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_CATEGORY_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
