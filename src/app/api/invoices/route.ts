import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const invoices = await db.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { number, customerId, date, dueDate, subtotal, tax, discount, total, notes, status } = body;

    if (!customerId) {
      return NextResponse.json({ error: "Customer is required" }, { status: 400 });
    }

    if (subtotal == null || total == null) {
      return NextResponse.json({ error: "Subtotal and total are required" }, { status: 400 });
    }

    // Map DRAFT to PENDING since PaymentStatus enum has no DRAFT
    let invoiceStatus = status || "PENDING";
    if (invoiceStatus === "DRAFT") invoiceStatus = "PENDING";

    const invoiceNumber =
      number?.trim() ||
      `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const invoice = await db.invoice.create({
      data: {
        number: invoiceNumber,
        customerId,
        date: date ? new Date(date) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal: subtotal,
        tax: tax ?? 0,
        discount: discount ?? 0,
        total: total,
        notes: notes || null,
        status: invoiceStatus,
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    console.error("Create invoice error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Invoice number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
