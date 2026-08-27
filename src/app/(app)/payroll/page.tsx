import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/format";
import { Plus, Download, Filter, DollarSign } from "lucide-react";

export default async function PayrollPage() {
  await requireAuth();

  const payPeriods = await db.payPeriod.findMany({
    include: {
      records: {
        include: {
          employee: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
    take: 10,
  });

  const totalPayroll = await db.payrollRecord.aggregate({
    _sum: {
      netPay: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll</h2>
          <p className="text-gray-500">Manage employee payroll and deductions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Pay Period
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Payroll</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(Number(totalPayroll._sum.netPay || 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Periods</p>
                <p className="text-2xl font-bold">{payPeriods.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pay Periods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pay Periods</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payPeriods.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No pay periods found. Create your first pay period to get started.
              </p>
            ) : (
              payPeriods.map((period) => (
                <div
                  key={period.id}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {formatDate(period.startDate)} - {formatDate(period.endDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {period.records.length} employees
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={period.isClosed ? "success" : "warning"}>
                        {period.isClosed ? "Closed" : "Open"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>

                  {period.records.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="pb-2 font-medium text-gray-500">Employee</th>
                            <th className="pb-2 font-medium text-gray-500">Basic Pay</th>
                            <th className="pb-2 font-medium text-gray-500">Allowances</th>
                            <th className="pb-2 font-medium text-gray-500">Deductions</th>
                            <th className="pb-2 font-medium text-gray-500">Net Pay</th>
                            <th className="pb-2 font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {period.records.slice(0, 5).map((record) => (
                            <tr key={record.id} className="border-b border-gray-50">
                              <td className="py-2">
                                {record.employee.firstName} {record.employee.lastName}
                              </td>
                              <td className="py-2">{formatCurrency(Number(record.basicPay))}</td>
                              <td className="py-2">{formatCurrency(Number(record.allowances))}</td>
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
