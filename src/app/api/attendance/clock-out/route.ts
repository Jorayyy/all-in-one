import { NextResponse } from "next/server";
import { clockOut } from "@/actions/attendance";

export async function POST() {
  try {
    const attendance = await clockOut();
    return NextResponse.json({ attendance, success: true });
  } catch (error) {
    console.error("Clock out error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clock out" },
      { status: 400 }
    );
  }
}
