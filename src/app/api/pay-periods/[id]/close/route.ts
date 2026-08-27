import { NextResponse } from "next/server";
import { closePayPeriod } from "@/actions/payPeriods";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payPeriod = await closePayPeriod(id);
    return NextResponse.json({ success: true, payPeriod });
  } catch (error: any) {
    console.error("Close pay period error:", error);
    const message = error?.message || "Failed to close pay period";
    let status = 500;
    if (message.includes("not found")) status = 404;
    else if (message.includes("Approver") || message.includes("already closed")) status = 400;
    return NextResponse.json({ error: message }, { status });
  }
}
