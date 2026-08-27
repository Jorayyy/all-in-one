import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const {
      name,
      code,
      description,
      serialNumber,
      purchaseDate,
      purchaseCost,
      status,
      locationId,
      assigneeId,
      nextMaintenance,
    } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Missing required fields: name, code" },
        { status: 400 }
      );
    }

    const asset = await db.asset.create({
      data: {
        name,
        code,
        description: description || null,
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseCost: purchaseCost || null,
        status: status || "AVAILABLE",
        locationId: locationId || null,
        assigneeId: assigneeId || null,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
      },
      include: {
        location: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error("Create asset error:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
