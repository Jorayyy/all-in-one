import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Download, Money } from "phosphor-react";

export default async function PayrollPage() {
  await requireAuth();

  const payPeriods = await db.payPeriod.findMany({
    include: {
      records: { include: { employee: true } },
    },
    orderBy: { startDate: "desc" },
    take: 10,
  });

  const totalPayroll = await db.payrollRecord.aggregate({
    _sum: { netPay: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payroll</h2>
          <p className="text-sm text-muted-foreground">Manage payroll and deductions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            New Period
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-success/10 p-2 text-success">
              <Money className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Payroll</p>
              <p className="text-xl font-semibold">
                {formatCurrency(Number(totalPayroll._sum.netPay || 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pay Periods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payPeriods.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No pay periods yet
              </p>
            ) : (
              payPeriods.map((period) => (
                <div key={period.id} className="rounded-md border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {period.records.length} employees
                      </p>
                    </div>
                    <Badge variant={period.isClosed ? "success" : "warning"}>
                      {period.isClosed ? "Closed" : "Open"}
                    </Badge>
                  </div>

                  {period.records.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="pb-2 font-medium text-muted-foreground">Employee</th>
                            <th className="pb-2 font-medium text-muted-foreground">Basic</th>
                            <th className="pb-2 font-medium text-muted-foreground">Deductions</th>
                            <th className="pb-2 font-medium text-muted-foreground">Net Pay</th>
                            <th className="pb-2 font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {period.records.slice(0, 5).map((record) => (
                            <tr key={record.id} className="border-b border-border/50">
                              <td className="py-2">
                                {record.employee.firstName} {record.employee.lastName}
                              </td>
                              <td className="py-2">{formatCurrency(Number(record.basicPay))}</td>
                              <td className="py-2">
                                {formatCurrency(
                                  Number(record.sssDeduction) +
                                    Number(record.philhealthDeduction) +
                                    Number(record.pagibigDeduction) +
                                    Number(record.taxDeduction)
                                )}
                              </td>
                              <td className="py-2 font-medium">
                                {formatCurrency(Number(record.netPay))}
                              </td>
                              <td className="py-2">
                                <Badge variant={record.isPaid ? "success" : "warning"}>
                                  {record.isPaid ? "Paid" : "Pending"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
