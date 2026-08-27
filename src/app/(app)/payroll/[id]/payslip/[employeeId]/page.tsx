import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { ArrowLeft } from "@/components/icons";
import { Payslip } from "@/components/payroll/payslip";

interface PayslipPageProps {
  params: Promise<{ id: string; employeeId: string }>;
}

export default async function PayslipPage({ params }: PayslipPageProps) {
  await requireAuth();
  const { id, employeeId } = await params;

  const payPeriod = await db.payPeriod.findUnique({
    where: { id },
  });

  if (!payPeriod) notFound();

  const record = await db.payrollRecord.findUnique({
    where: { employeeId_payPeriodId: { employeeId, payPeriodId: id } },
    include: {
      employee: {
        include: { department: true },
      },
    },
  });

  // fallback: try find by record id if employeeId is actually record id
  let resolvedRecord = record;
  let employee = record?.employee;
  if (!record) {
    const byRecordId = await db.payrollRecord.findUnique({
      where: { id: employeeId },
      include: { employee: { include: { department: true } } },
    });
    if (byRecordId && byRecordId.payPeriodId === id) {
      resolvedRecord = byRecordId;
      employee = byRecordId.employee;
    }
  }

  if (!resolvedRecord || !employee) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 no-print">
        <Link href={`/payroll/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Payslip</h1>
          <p className="text-sm text-muted-foreground">
            {employee.firstName} {employee.lastName} • {employee.employeeNumber}
          </p>
        </div>
      </div>

      <Payslip
        employee={{
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeNumber: employee.employeeNumber,
          position: employee.position,
          department: employee.department ? { name: employee.department.name } : null,
          salary: employee.salary ? Number(employee.salary) : null,
        }}
        period={{
          id: payPeriod.id,
          startDate: payPeriod.startDate,
          endDate: payPeriod.endDate,
          isClosed: payPeriod.isClosed,
          closedAt: payPeriod.closedAt,
        }}
        record={{
          id: resolvedRecord.id,
          basicPay: String(resolvedRecord.basicPay),
          allowances: String(resolvedRecord.allowances),
          overtime: String(resolvedRecord.overtime),
          deductions: String(resolvedRecord.deductions),
          sssDeduction: String(resolvedRecord.sssDeduction),
          philhealthDeduction: String(resolvedRecord.philhealthDeduction),
          pagibigDeduction: String(resolvedRecord.pagibigDeduction),
          taxDeduction: String(resolvedRecord.taxDeduction),
          netPay: String(resolvedRecord.netPay),
          isPaid: resolvedRecord.isPaid,
        }}
      />
    </div>
  );
}
