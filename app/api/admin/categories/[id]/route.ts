// app/api/admin/categories/[id]/route.ts
import { getCurrentUser } from "@/app/actions/getCurrentUser";
import { connectToDatabase } from "@/lib/database";
import AuditLog from "@/lib/database/models/audit-log";
import Category from "@/lib/database/models/category";
import { NextResponse } from "next/server";


export async function PUT(req: Request, { params }: any) {
const session = await getCurrentUser();
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


const body = await req.json();
await connectToDatabase();


const before = await Category.findById(params.id);
const updated = await Category.findByIdAndUpdate(params.id, body, { new: true });


await AuditLog.create({
adminId: session?._id,
action: "UPDATE",
entity: "CATEGORY",
entityId: params.id,
before,
after: updated
});


return NextResponse.json(updated);
}


export async function DELETE(req: Request, { params }: any) {
const session = await getCurrentUser();
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


await connectToDatabase();
const deleted = await Category.findByIdAndDelete(params.id);


await AuditLog.create({
adminId: session._id,
action: "DELETE",
entity: "CATEGORY",
entityId: params.id,
before: deleted
});


return NextResponse.json({ success: true });
}