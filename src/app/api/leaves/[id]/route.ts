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

    const leave = await db.leave.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });

    if (!leave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    return NextResponse.json({ leave });
  } catch (error) {
    console.error("Fetch leave error:", error);
    return NextResponse.json({ error: "Failed to fetch leave" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { status, remarks } = body;

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await db.leave.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    // Resolve approver for APPROVED/REJECTED
    let approverId: string | undefined;
    if (status === "APPROVED" || status === "REJECTED") {
      const approver = await db.employee.findUnique({
        where: { userId: session.user.id },
      });
      if (!approver) {
        return NextResponse.json({ error: "Approver not found" }, { status: 400 });
      }
      approverId = approver.id;
    }

    const leave = await db.leave.update({
      where: { id },
      data: {
        status,
        approvedBy: approverId ?? (status === "PENDING" ? null : undefined),
        approvedAt: approverId ? new Date() : status === "PENDING" ? null : undefined,
        remarks: remarks ?? undefined,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });

    return NextResponse.json({ leave });
  } catch (error) {
    console.error("Update leave status error:", error);
    return NextResponse.json({ error: "Failed to update leave status" }, { status: 500 });
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
    const { employeeId, type, startDate, endDate, days, reason } = body;

    const existing = await db.leave.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    const leave = await db.leave.update({
      where: { id },
      data: {
        employeeId: employeeId ?? undefined,
        type: type ?? undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        days: days ?? undefined,
        reason: reason ?? undefined,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });

    return NextResponse.json({ leave });
  } catch (error) {
    console.error("Update leave error:", error);
    return NextResponse.json({ error: "Failed to update leave" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const existing = await db.leave.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    await db.leave.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete leave error:", error);
    return NextResponse.json({ error: "Failed to delete leave" }, { status: 500 });
  }
}
