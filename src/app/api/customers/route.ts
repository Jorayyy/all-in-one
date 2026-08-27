import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { name, type, email, phone, address, tinNumber, contactPerson, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    const customer = await db.customer.create({
      data: {
        name,
        type: type || "RESIDENTIAL",
        email: email || null,
        phone: phone || null,
        address: address || null,
        tinNumber: tinNumber || null,
        contactPerson: contactPerson || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
