import { logAudit } from "@/lib/audit";
import { Quote } from "@/lib/database/models/quote";
import { sendQuoteEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

/* ------------------------------------------------------------------
   CORS CONFIG
------------------------------------------------------------------ */

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_BASE_URL,
  "http://localhost:3000",
].filter(Boolean);

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */

function corsHeaders(origin: string | null) {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

/* ------------------------------------------------------------------
   OPTIONS (Preflight)
------------------------------------------------------------------ */

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/* ------------------------------------------------------------------
   POST
------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
  const body = await req.json()
  console.log("QUOTE_CREATED")

    const {
      productId,
      productName,
      name,
      email,
      phone,
      message,
    } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const quote = await Quote.create({
      productId,
      productName,
      name,
      email,
      phone,
      message,
    })

    // OPTIONAL: trigger email / Slack / WhatsApp
    await sendQuoteEmail({
      productName,
      name,
      email,
      phone,
      message,
    })

    await logAudit({
      actorId: "1234",
      actorName: "ADMIN",
      action: "CREATE_ORDER",
      entity: "Order",
      entityId: quote?._id.toString(),
      metadata: { total: quote.total },
      ip: req.headers.get("x-forwarded-for") ?? "",
      userAgent: req.headers.get("user-agent") ?? "",
    })



    return NextResponse.json(
      { success: true, quoteId: quote._id },
      { status: 201 }
    )
  } catch (error) {
    console.error("QUOTE_API_ERROR:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
