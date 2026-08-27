import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    const employee = await db.employee.findUnique({
      where: { userId: session.user.id },
    });

    if (!employee) {
      return NextResponse.json({ attendance: null });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await db.attendance.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error("Fetch today attendance error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
