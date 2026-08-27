import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const asset = await db.asset.findUnique({
      where: { id },
      include: {
        location: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        maintenanceLogs: true,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Fetch asset error:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
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

    const existing = await db.asset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (code && code !== existing.code) {
      const duplicate = await db.asset.findFirst({
        where: { code, NOT: { id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Asset code already exists" }, { status: 400 });
      }
    }

    const asset = await db.asset.update({
      where: { id },
      data: {
        name: name ?? undefined,
        code: code ?? undefined,
        description: description !== undefined ? description || null : undefined,
        serialNumber: serialNumber !== undefined ? serialNumber || null : undefined,
        purchaseDate:
          purchaseDate !== undefined
            ? purchaseDate
              ? new Date(purchaseDate)
              : null
            : undefined,
        purchaseCost:
          purchaseCost !== undefined
            ? purchaseCost === null || purchaseCost === ""
              ? null
              : String(purchaseCost)
            : undefined,
        status: status ?? undefined,
        locationId: locationId !== undefined ? locationId || null : undefined,
        assigneeId: assigneeId !== undefined ? assigneeId || null : undefined,
        nextMaintenance:
          nextMaintenance !== undefined
            ? nextMaintenance
              ? new Date(nextMaintenance)
              : null
            : undefined,
      },
      include: {
        location: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        maintenanceLogs: true,
      },
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Update asset error:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const existing = await db.asset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    await db.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
