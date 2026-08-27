import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const locations = await db.location.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true, address: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Fetch locations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
