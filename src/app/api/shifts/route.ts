import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const shifts = await db.shift.findMany({
      select: { id: true, name: true, startTime: true, endTime: true, isNight: true },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ shifts });
  } catch (error) {
    console.error("Fetch shifts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shifts" },
      { status: 500 }
    );
  }
}
