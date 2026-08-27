import { NextResponse } from "next/server";
import { clockIn } from "@/actions/attendance";

export async function POST() {
  try {
    const attendance = await clockIn();
    return NextResponse.json({ attendance, success: true });
  } catch (error) {
    console.error("Clock in error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clock in" },
      { status: 400 }
    );
  }
}
