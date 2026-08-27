import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth();
    const products = await db.product.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, sku: true, categoryId: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { name, sku, description, categoryId, unitPrice, costPrice, unit, minStock } = body;

    if (!name || !sku || !categoryId || unitPrice == null || costPrice == null) {
      return NextResponse.json(
        { error: "Missing required fields: name, sku, categoryId, unitPrice, costPrice" },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        sku,
        description: description || null,
        categoryId,
        unitPrice,
        costPrice,
        unit: unit || "pc",
        minStock: minStock || 0,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
