import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const company = await db.company.findUnique({ where: { id } });
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
    return NextResponse.json({ company });
  } catch (error) {
    console.error("Fetch company error:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { name, address, phone, email, website, tinNumber } = body;

    const existing = await db.company.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const company = await db.company.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(address !== undefined ? { address: address || null } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(email !== undefined ? { email: email || null } : {}),
        ...(website !== undefined ? { website: website || null } : {}),
        ...(tinNumber !== undefined ? { tinNumber: tinNumber || null } : {}),
      },
    });
    return NextResponse.json({ company });
  } catch (error) {
    console.error("Update company error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
}
