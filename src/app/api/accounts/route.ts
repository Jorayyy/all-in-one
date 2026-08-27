import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const accounts = await db.account.findMany({
      orderBy: { code: "asc" },
    });
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Fetch accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { code, name, type, parentId } = body;

    if (!code || !name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: code, name, type" },
        { status: 400 }
      );
    }

    const account = await db.account.create({
      data: {
        code,
        name,
        type,
        parentId: parentId || null,
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error: any) {
    console.error("Create account error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Account code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
