import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { BarChart3, Download, FileText, Users, DollarSign, Package } from "lucide-react";
import Link from "next/link";

export default async function ReportsPage() {
  await requireAuth();

  const reports = [
    {
      title: "Employee Report",
      description: "List of all employees with details",
      icon: Users,
      href: "/reports/employees",
    },
    {
      title: "Attendance Report",
      description: "Monthly attendance summary",
      icon: FileText,
      href: "/reports/attendance",
    },
    {
      title: "Payroll Report",
      description: "Payroll summary and deductions",
      icon: DollarSign,
      href: "/reports/payroll",
    },
    {
      title: "Inventory Report",
      description: "Stock levels and movements",
      icon: Package,
      href: "/reports/inventory",
    },
    {
      title: "Sales Report",
      description: "Revenue and invoice summary",
      icon: BarChart3,
      href: "/reports/sales",
    },
    {
      title: "Project Report",
      description: "Project status and progress",
      icon: FileText,
      href: "/reports/projects",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <p className="text-gray-500">Generate and download reports</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <report.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold">{report.title}</h3>
              <p className="mb-4 text-sm text-gray-500">{report.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
