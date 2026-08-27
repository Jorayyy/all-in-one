import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: startDate, endDate" },
        { status: 400 }
      );
    }

    const payPeriod = await db.payPeriod.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ payPeriod }, { status: 201 });
  } catch (error) {
    console.error("Create pay period error:", error);
    return NextResponse.json(
      { error: "Failed to create pay period" },
      { status: 500 }
    );
  }
}
