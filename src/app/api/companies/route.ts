import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const company = await db.company.findFirst();
    return NextResponse.json({ company });
  } catch (error: any) {
    console.error("Fetch company error:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { name, address, phone, email, website, tinNumber } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const existing = await db.company.findFirst();
    let company;
    if (existing) {
      company = await db.company.update({
        where: { id: existing.id },
        data: { name, address: address || null, phone: phone || null, email: email || null, website: website || null, tinNumber: tinNumber || null },
      });
    } else {
      company = await db.company.create({
        data: { name, address: address || null, phone: phone || null, email: email || null, website: website || null, tinNumber: tinNumber || null },
      });
    }
    return NextResponse.json({ company });
  } catch (error) {
    console.error("Create company error:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { name, address, phone, email, website, tinNumber } = body;
    const existing = await db.company.findFirst();
    if (!existing) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    const company = await db.company.update({
      where: { id: existing.id },
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
