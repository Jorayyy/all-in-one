"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { Printer, Money, User, Calendar, Buildings } from "@/components/icons";
import { formatCurrency, formatDate } from "@/lib/format";

interface PayslipEmployee {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  position?: string | null;
  department?: { name: string } | null;
  salary?: string | number | null;
}

interface PayslipPeriod {
  id: string;
  startDate: string | Date;
  endDate: string | Date;
  isClosed: boolean;
  closedAt?: string | Date | null;
}

interface PayslipRecord {
  id: string;
  basicPay: string | number;
  allowances: string | number;
  overtime: string | number;
  deductions: string | number;
  sssDeduction: string | number;
  philhealthDeduction: string | number;
  pagibigDeduction: string | number;
  taxDeduction: string | number;
  netPay: string | number;
  isPaid: boolean;
}

interface PayslipProps {
  employee: PayslipEmployee;
  period: PayslipPeriod;
  record: PayslipRecord;
  companyName?: string;
}

export function Payslip({ employee, period, record, companyName = "Prime System" }: PayslipProps) {
  const basic = Number(record.basicPay);
  const allowances = Number(record.allowances || 0);
  const overtime = Number(record.overtime || 0);
  const gross = basic + allowances + overtime;

  const sss = Number(record.sssDeduction || 0);
  const philhealth = Number(record.philhealthDeduction || 0);
  const pagibig = Number(record.pagibigDeduction || 0);
  const tax = Number(record.taxDeduction || 0);
  const otherDeductions = Number(record.deductions || 0);
  // deductions field in schema may duplicate? In runPayroll, deductions = total. But we show breakdown separately.
  // total statutory = sss+philhealth+pagibig+tax. If deductions includes that, we avoid double-count.
  // Use max of (sum statutory + tax) vs otherDeductions? We'll show statutory separately and show other if distinct.
  // For display, total deductions = sss+philhealth+pagibig+tax + any extra beyond statutory if deductions > sum
  const statutoryTotal = sss + philhealth + pagibig + tax;
  const extra = otherDeductions > statutoryTotal ? otherDeductions - statutoryTotal : 0;
  const totalDeductions = statutoryTotal + extra;
  const net = Number(record.netPay);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="space-y-4 print:space-y-2">
      <style>{`@media print {
        body * { visibility: hidden; }
        #payslip-print, #payslip-print * { visibility: visible; }
        #payslip-print { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
      }`}</style>

      <div className="flex justify-end no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
        >
          <Printer className="h-4 w-4" /> Print Payslip
        </button>
      </div>

      <div id="payslip-print">
        <Card className="overflow-hidden print:shadow-none print:border">
          <CardHeader className="border-b border-border bg-muted/20 print:bg-white">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{companyName}</CardTitle>
                <p className="text-sm text-muted-foreground">Payslip</p>
                <p className="mt-1 text-sm font-medium">
                  Period: {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={period.isClosed ? "success" : "warning"}>
                  {period.isClosed ? "Closed" : "Open"}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">
                  Employee No: {employee.employeeNumber}
                </p>
                <Badge variant={record.isPaid ? "success" : "warning"} className="mt-1">
                  {record.isPaid ? "Paid" : "Pending"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Employee Info */}
            <div className="grid gap-4 md:grid-cols-2 rounded-md border border-border p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </span>
                </div>
                {employee.position && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Buildings className="h-4 w-4" />
                    <span>
                      {employee.position}
                      {employee.department?.name ? ` • ${employee.department.name}` : ""}
                    </span>
                  </div>
                )}
                {!employee.position && employee.department?.name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Buildings className="h-4 w-4" />
                    <span>{employee.department.name}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Pay Period
                  </span>
                  <span className="font-medium">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </span>
                </div>
                {period.closedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closed At</span>
                    <span>{formatDate(period.closedAt)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Basic Salary (monthly)</span>
                  <span>
                    {employee.salary ? formatCurrency(Number(employee.salary)) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Money className="h-4 w-4 text-success" /> Earnings
                </h3>
                <div className="space-y-2 rounded-md border border-border p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Pay</span>
                    <span className="font-medium">{formatCurrency(basic)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Allowances</span>
                    <span>{formatCurrency(allowances)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overtime</span>
                    <span>{formatCurrency(overtime)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-semibold">
                    <span>Gross Pay</span>
                    <span>{formatCurrency(gross)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-destructive">Deductions</h3>
                <div className="space-y-2 rounded-md border border-border p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SSS</span>
                    <span>{formatCurrency(sss)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PhilHealth</span>
                    <span>{formatCurrency(philhealth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pag-IBIG</span>
                    <span>{formatCurrency(pagibig)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Withholding Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  {extra > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Other Deductions</span>
                      <span>{formatCurrency(extra)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 font-semibold">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="rounded-md bg-success/10 p-4 flex items-center justify-between print:bg-gray-100">
              <span className="text-sm font-medium">Net Pay</span>
              <span className="text-xl font-bold text-success">{formatCurrency(net)}</span>
            </div>

            <p className="text-center text-xs text-muted-foreground print:text-gray-500">
              This is a computer-generated payslip. No signature required.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Payslip;
