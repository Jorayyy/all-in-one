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

    const ticket = await db.serviceTicket.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        creator: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Fetch ticket error:", error);
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
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
    const { title, description, category, priority, customerId, assigneeId, dueDate } = body;

    const existing = await db.serviceTicket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket = await db.serviceTicket.update({
      where: { id },
      data: {
        title: title ?? undefined,
        description: description ?? null,
        category: category ?? undefined,
        priority: priority ?? undefined,
        customerId: customerId ?? undefined,
        assigneeId: assigneeId ? assigneeId : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        customer: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Update ticket error:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { status, remarks } = body;

    const validStatuses = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await db.serviceTicket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const updateData: any = { status };
    if (status === "RESOLVED") updateData.resolvedAt = new Date();
    if (status === "CLOSED") updateData.closedAt = new Date();
    if (remarks !== undefined) updateData.notes = remarks;

    const ticket = await db.serviceTicket.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Update ticket status error:", error);
    return NextResponse.json({ error: "Failed to update ticket status" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const existing = await db.serviceTicket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    await db.serviceTicket.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete ticket error:", error);
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}
