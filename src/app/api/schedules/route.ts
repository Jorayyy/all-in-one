import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { employeeId, shiftId, date, isRestDay } = body;

    if (!employeeId || !shiftId || !date) {
      return NextResponse.json(
        { error: "Missing required fields: employeeId, shiftId, date" },
        { status: 400 }
      );
    }

    const schedule = await db.schedule.create({
      data: {
        employeeId,
        shiftId,
        date: new Date(date),
        isRestDay: isRestDay || false,
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        shift: { select: { id: true, name: true, startTime: true, endTime: true } },
      },
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    console.error("Create schedule error:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
