import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { ExportCsvButton } from "@/components/reports/export-csv-button";

function ReportFilters({ from, to }: { from?: string; to?: string }) {
  return (
    <form method="GET" className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <input
          type="date"
          name="from"
          defaultValue={from || ""}
          className="mt-1 flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <input
          type="date"
          name="to"
          defaultValue={to || ""}
          className="mt-1 flex h-9 rounded-md border border-border bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" size="sm" variant="outline">
        Filter
      </Button>
      {(from || to) && (
        <Link href="/reports/payroll">
          <Button type="button" size="sm" variant="ghost">
            Clear
          </Button>
        </Link>
      )}
    </form>
  );
}

export default async function PayrollReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  await requireAuth();
  const params = searchParams ? await searchParams : {};
  const from = params.from || "";
  const to = params.to || "";

  const payPeriodWhere: any = {};
  if (from || to) {
    payPeriodWhere.startDate = {};
    if (from) payPeriodWhere.startDate.gte = new Date(from);
    if (to) payPeriodWhere.startDate.lte = new Date(to);
  }

  const payPeriods = await db.payPeriod.findMany({
    where: Object.keys(payPeriodWhere).length ? payPeriodWhere : undefined,
    include: {
      records: {
        include: { employee: { select: { employeeNumber: true, firstName: true, lastName: true } } },
      },
    },
    orderBy: { startDate: "desc" },
    take: 50,
  });

  // Totals
  let totalBasic = 0;
  let totalAllowances = 0;
  let totalOvertime = 0;
  let totalDeductions = 0;
  let totalSss = 0;
  let totalPhilhealth = 0;
  let totalPagibig = 0;
  let totalTax = 0;
  let totalNet = 0;
  let totalRecords = 0;

  for (const pp of payPeriods) {
    for (const r of pp.records) {
      totalBasic += Number(r.basicPay);
      totalAllowances += Number(r.allowances);
      totalOvertime += Number(r.overtime);
      totalDeductions += Number(r.deductions);
      totalSss += Number(r.sssDeduction);
      totalPhilhealth += Number(r.philhealthDeduction);
      totalPagibig += Number(r.pagibigDeduction);
      totalTax += Number(r.taxDeduction);
      totalNet += Number(r.netPay);
      totalRecords++;
    }
  }

  const exportData: Record<string, any>[] = [];
  for (const pp of payPeriods) {
    for (const r of pp.records) {
      exportData.push({
        payPeriod: `${new Date(pp.startDate).toISOString().slice(0, 10)} to ${new Date(pp.endDate).toISOString().slice(0, 10)}`,
        employeeNumber: r.employee.employeeNumber,
        name: `${r.employee.firstName} ${r.employee.lastName}`,
        basicPay: String(r.basicPay),
        allowances: String(r.allowances),
        overtime: String(r.overtime),
        deductions: String(r.deductions),
        sss: String(r.sssDeduction),
        philhealth: String(r.philhealthDeduction),
        pagibig: String(r.pagibigDeduction),
        tax: String(r.taxDeduction),
        netPay: String(r.netPay),
        isPaid: r.isPaid ? "Yes" : "No",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Payroll Report</h2>
          <p className="text-sm text-muted-foreground">
            {payPeriods.length} periods • {totalRecords} records
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              Back
            </Button>
          </Link>
          <ExportCsvButton data={exportData} filename="payroll-report.csv" label="Export CSV" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Basic Pay</p>
            <p className="text-lg font-bold">{formatCurrency(totalBasic)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Allowances</p>
            <p className="text-lg font-bold">{formatCurrency(totalAllowances)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Overtime</p>
            <p className="text-lg font-bold">{formatCurrency(totalOvertime)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Net Pay</p>
            <p className="text-lg font-bold">{formatCurrency(totalNet)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deduction Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">SSS</p>
              <p className="text-sm font-semibold">{formatCurrency(totalSss)}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">PhilHealth</p>
              <p className="text-sm font-semibold">{formatCurrency(totalPhilhealth)}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">Pag-IBIG</p>
              <p className="text-sm font-semibold">{formatCurrency(totalPagibig)}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">Tax</p>
              <p className="text-sm font-semibold">{formatCurrency(totalTax)}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">Other Deductions</p>
              <p className="text-sm font-semibold">{formatCurrency(totalDeductions)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFilters from={from} to={to} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payroll by Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Period</th>
                  <th className="pb-3 font-medium text-muted-foreground">Records</th>
                  <th className="pb-3 font-medium text-muted-foreground">Basic Pay</th>
                  <th className="pb-3 font-medium text-muted-foreground">Deductions</th>
                  <th className="pb-3 font-medium text-muted-foreground">Net Pay</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {payPeriods.map((pp) => {
                  const basic = pp.records.reduce((s, r) => s + Number(r.basicPay), 0);
                  const ded = pp.records.reduce((s, r) => s + Number(r.deductions) + Number(r.sssDeduction) + Number(r.philhealthDeduction) + Number(r.pagibigDeduction) + Number(r.taxDeduction), 0);
                  const net = pp.records.reduce((s, r) => s + Number(r.netPay), 0);
                  return (
                    <tr key={pp.id} className="border-b border-border">
                      <td className="py-3 font-medium">
                        {new Date(pp.startDate).toLocaleDateString()} - {new Date(pp.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3">{pp.records.length}</td>
                      <td className="py-3">{formatCurrency(basic)}</td>
                      <td className="py-3">{formatCurrency(ded)}</td>
                      <td className="py-3 font-semibold">{formatCurrency(net)}</td>
                      <td className="py-3">{pp.isClosed ? "Closed" : "Open"}</td>
                    </tr>
                  );
                })}
                {payPeriods.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No payroll periods found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Employee</th>
                  <th className="pb-3 font-medium text-muted-foreground">Period</th>
                  <th className="pb-3 font-medium text-muted-foreground">Basic</th>
                  <th className="pb-3 font-medium text-muted-foreground">Net Pay</th>
                  <th className="pb-3 font-medium text-muted-foreground">Paid</th>
                </tr>
              </thead>
              <tbody>
                {exportData.slice(0, 100).map((r, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="py-3 font-medium">
                      {r.name} ({r.employeeNumber})
                    </td>
                    <td className="py-3 text-muted-foreground">{r.payPeriod}</td>
                    <td className="py-3">{formatCurrency(Number(r.basicPay))}</td>
                    <td className="py-3 font-semibold">{formatCurrency(Number(r.netPay))}</td>
                    <td className="py-3">{r.isPaid}</td>
                  </tr>
                ))}
                {exportData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
