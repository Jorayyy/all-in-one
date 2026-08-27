import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { employeeId, type, startDate, endDate, days, reason } = body;

    if (!employeeId || !type || !startDate || !endDate || !days || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: employeeId, type, startDate, endDate, days, reason" },
        { status: 400 }
      );
    }

    const leave = await db.leave.create({
      data: {
        employeeId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        reason,
        status: "PENDING",
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    });

    return NextResponse.json({ leave }, { status: 201 });
  } catch (error) {
    console.error("Create leave error:", error);
    return NextResponse.json(
      { error: "Failed to create leave" },
      { status: 500 }
    );
  }
}
