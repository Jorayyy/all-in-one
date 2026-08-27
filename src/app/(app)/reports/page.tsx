import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui";
import { FileText, Users, Clock, Money, Package, TrendUp, Folder, Download } from "@/components/icons";
import Link from "next/link";
import { ExportCsvButton } from "@/components/reports/export-csv-button";

export default async function ReportsPage() {
  await requireAuth();

  // Fetch overview data for CSV exports on the cards
  const [employees, attendances, payrollRecords, products, invoices, projects] = await Promise.all([
    db.employee.findMany({
      where: { deletedAt: null },
      select: { employeeNumber: true, firstName: true, lastName: true, status: true, position: true, hireDate: true },
      take: 500,
      orderBy: { employeeNumber: "asc" },
    }),
    db.attendance.findMany({
      take: 500,
      orderBy: { date: "desc" },
      select: { date: true, status: true, employee: { select: { employeeNumber: true, firstName: true, lastName: true } } },
    }),
    db.payrollRecord.findMany({
      take: 500,
      orderBy: { createdAt: "desc" },
      include: { employee: { select: { employeeNumber: true, firstName: true, lastName: true } }, payPeriod: true },
    }),
    db.product.findMany({
      where: { deletedAt: null },
      include: { category: true, stocks: true },
      take: 500,
      orderBy: { name: "asc" },
    }),
    db.invoice.findMany({
      take: 500,
      orderBy: { date: "desc" },
      include: { customer: true },
    }),
    db.project.findMany({
      where: { deletedAt: null },
      include: { customer: true },
      take: 500,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const reports = [
    {
      title: "Employee Report",
      description: "List of all employees with details",
      icon: Users,
      href: "/reports/employees",
      filename: "employees-report.csv",
      data: employees.map((e) => ({
        employeeNumber: e.employeeNumber,
        name: `${e.firstName} ${e.lastName}`,
        status: e.status,
        position: e.position || "",
        hireDate: e.hireDate ? new Date(e.hireDate).toISOString().slice(0, 10) : "",
      })),
    },
    {
      title: "Attendance Report",
      description: "Monthly attendance summary",
      icon: Clock,
      href: "/reports/attendance",
      filename: "attendance-report.csv",
      data: attendances.map((a) => ({
        date: new Date(a.date).toISOString().slice(0, 10),
        employeeNumber: a.employee.employeeNumber,
        name: `${a.employee.firstName} ${a.employee.lastName}`,
        status: a.status,
      })),
    },
    {
      title: "Payroll Report",
      description: "Payroll summary and deductions",
      icon: Money,
      href: "/reports/payroll",
      filename: "payroll-report.csv",
      data: payrollRecords.map((r) => ({
        employeeNumber: r.employee.employeeNumber,
        name: `${r.employee.firstName} ${r.employee.lastName}`,
        payPeriod: `${new Date(r.payPeriod.startDate).toISOString().slice(0, 10)} - ${new Date(r.payPeriod.endDate).toISOString().slice(0, 10)}`,
        basicPay: String(r.basicPay),
        deductions: String(r.deductions),
        netPay: String(r.netPay),
        isPaid: r.isPaid ? "Yes" : "No",
      })),
    },
    {
      title: "Inventory Report",
      description: "Stock levels and movements",
      icon: Package,
      href: "/reports/inventory",
      filename: "inventory-report.csv",
      data: products.map((p) => ({
        sku: p.sku,
        name: p.name,
        category: p.category.name,
        unitPrice: String(p.unitPrice),
        totalStock: p.stocks.reduce((s, st) => s + st.quantity, 0),
        minStock: p.minStock,
        status: p.stocks.reduce((s, st) => s + st.quantity, 0) <= p.minStock ? "Low" : "OK",
      })),
    },
    {
      title: "Sales Report",
      description: "Revenue and invoice summary",
      icon: TrendUp,
      href: "/reports/sales",
      filename: "sales-report.csv",
      data: invoices.map((inv) => ({
        number: inv.number,
        customer: inv.customer.name,
        date: new Date(inv.date).toISOString().slice(0, 10),
        total: String(inv.total),
        amountPaid: String(inv.amountPaid),
        status: inv.status,
      })),
    },
    {
      title: "Project Report",
      description: "Project status and progress",
      icon: Folder,
      href: "/reports/projects",
      filename: "projects-report.csv",
      data: projects.map((pr) => ({
        code: pr.code,
        name: pr.name,
        customer: pr.customer.name,
        status: pr.status,
        budget: pr.budget ? String(pr.budget) : "",
        actualCost: pr.actualCost ? String(pr.actualCost) : "",
        startDate: pr.startDate ? new Date(pr.startDate).toISOString().slice(0, 10) : "",
        endDate: pr.endDate ? new Date(pr.endDate).toISOString().slice(0, 10) : "",
      })),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Reports</h2>
        <p className="text-sm text-muted-foreground">Generate and download reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title} className="transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                <report.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-sm font-medium">{report.title}</h3>
              <p className="mb-4 text-xs text-muted-foreground">{report.description}</p>
              <div className="flex gap-2">
                <Link href={report.href} className="flex-1">
                  <span className="inline-flex h-8 w-full items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
                    <FileText className="mr-1.5 h-4 w-4" />
                    View
                  </span>
                </Link>
                <div className="flex-1">
                  <ExportCsvButton data={report.data} filename={report.filename} label="Export" className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
