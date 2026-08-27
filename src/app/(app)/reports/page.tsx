import { requireAuth } from "@/lib/auth";
import { Card, CardContent, Button } from "@/components/ui";
import { FileText, Download, Users, Clock, Money, Package, TrendUp, Folder } from "@/components/icons";

export default async function ReportsPage() {
  await requireAuth();

  const reports = [
    {
      title: "Employee Report",
      description: "List of all employees with details",
      icon: Users,
    },
    {
      title: "Attendance Report",
      description: "Monthly attendance summary",
      icon: Clock,
    },
    {
      title: "Payroll Report",
      description: "Payroll summary and deductions",
      icon: Money,
    },
    {
      title: "Inventory Report",
      description: "Stock levels and movements",
      icon: Package,
    },
    {
      title: "Sales Report",
      description: "Revenue and invoice summary",
      icon: TrendUp,
    },
    {
      title: "Project Report",
      description: "Project status and progress",
      icon: Folder,
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
              <Button variant="outline" size="sm" className="w-full">
                <Download className="mr-1.5 h-4 w-4" />
                Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
