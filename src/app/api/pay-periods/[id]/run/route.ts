import { NextResponse } from "next/server";
import { runPayroll } from "@/actions/payPeriods";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await runPayroll(id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Run payroll error:", error);
    const message = error?.message || "Failed to run payroll";
    // Map known errors to status
    let status = 500;
    if (message.includes("not found")) status = 404;
    else if (message.includes("already closed") || message.includes("already exists")) status = 400;
    return NextResponse.json({ error: message }, { status });
  }
}
