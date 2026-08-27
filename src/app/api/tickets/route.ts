import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    const body = await request.json();
    const { title, description, category, priority, customerId, assigneeId, dueDate } = body;

    if (!title || !customerId) {
      return NextResponse.json(
        { error: "Missing required fields: title, customerId" },
        { status: 400 }
      );
    }

    const employee = await db.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "No employee profile linked to this account" },
        { status: 400 }
      );
    }

    const number = `TK-${Math.floor(100000 + Math.random() * 900000)}`;

    const ticket = await db.serviceTicket.create({
      data: {
        number,
        title,
        description: description || null,
        category: category || "OTHER",
        priority: priority || "MEDIUM",
        customerId,
        creatorId: employee.id,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        customer: { select: { id: true, name: true } },
        creator: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
