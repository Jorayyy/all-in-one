import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const employees = await db.employee.findMany({
      select: { id: true, firstName: true, lastName: true, employeeNumber: true },
      where: { deletedAt: null },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Fetch employees list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
